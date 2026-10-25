// PWA test 2: Claude through the reader's own API key (mocked Anthropic API), setup flow, errors, export/import.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
const ROOT = path.resolve(__dirname, '..', 'docs');
const SHOTS = path.join(__dirname, 'shots');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
function serve(port) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
}
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-expose-headers': '*' };
const sse = evs => evs.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join('');
function okStream(text) {
  const parts = text.match(/[\s\S]{1,9}/g);
  return sse([
    { type: 'message_start', message: { id: 'msg_1', type: 'message', role: 'assistant', content: [], model: 'claude-opus-5-5', stop_reason: null, usage: { input_tokens: 1200, cache_creation_input_tokens: 3000, cache_read_input_tokens: 0, output_tokens: 1 } } },
    { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '', signature: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'sig' } },
    { type: 'content_block_stop', index: 0 },
    { type: 'ping' },
    { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
    ...parts.map(t => ({ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: t } })),
    { type: 'content_block_stop', index: 1 },
    { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 420 } },
    { type: 'message_stop' }
  ]);
}

(async () => {
  const PORT = 8766;
  const srv = await serve(PORT);
  const browser = await chromium.launch();
  const out = {}; const calls = []; let scenario = 'ok';
  const run = async (w, dark, fn) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, colorScheme: dark ? 'dark' : 'light', serviceWorkers: 'block', acceptDownloads: true });
    await ctx.route('https://api.anthropic.com/**', async route => {
      const req = route.request();
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
      const url = req.url(); const h = req.headers();
      if (url.includes('/v1/models')) {
        if ((h['x-api-key'] || '').includes('bad')) return route.fulfill({ status: 401, headers: Object.assign({ 'content-type': 'application/json' }, CORS), body: JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }) });
        return route.fulfill({ status: 200, headers: Object.assign({ 'content-type': 'application/json' }, CORS), body: JSON.stringify({ data: [{ id: 'claude-opus-5-5' }] }) });
      }
      calls.push({ headers: h, body: JSON.parse(req.postData() || '{}') });
      if (scenario === '401') return route.fulfill({ status: 401, headers: Object.assign({ 'content-type': 'application/json' }, CORS), body: JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }) });
      if (scenario === 'credit') return route.fulfill({ status: 400, headers: Object.assign({ 'content-type': 'application/json' }, CORS), body: JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.' } }) });
      if (scenario === 'overload_mid') return route.fulfill({ status: 200, headers: Object.assign({ 'content-type': 'text/event-stream' }, CORS), body: sse([
        { type: 'message_start', message: { usage: { input_tokens: 900, output_tokens: 1 } } },
        { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
        { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Yarımçıq cavabın əvvəli' } },
        { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }]) });
      return route.fulfill({ status: 200, headers: Object.assign({ 'content-type': 'text/event-stream' }, CORS), body: okStream('Salam! Bu **test cavabıdır**.\n\n- birinci bənd\n- ikinci bənd\n\nƏsas fikir: hər şey işləyir.') });
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/`);
    await page.waitForSelector('.chrow');
    await fn(page, ctx);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await ctx.close();
    return { errors, overflow };
  };

  const r1 = await run(390, false, async page => {
    // 1. no key: an AI button opens the setup sheet with a link to the same chapter on claude.ai
    await page.click('[data-act="open-ch"][data-ch="c3"]');
    await page.waitForSelector('.sec');
    await page.click('[data-act="ai"][data-mode="simple"]');
    await page.waitForSelector('#apikey');
    await page.waitForTimeout(450);
    out.setupTitle = await page.$eval('.sheet-head h3', el => el.textContent);
    out.setupLink = await page.$eval('.sheet a.btn.primary', el => el.href);
    await page.screenshot({ path: path.join(SHOTS, 'pwa-setup-390.png') });
    // 2. wrong format, then a rejected key
    await page.fill('#apikey', 'hello');
    await page.click('[data-act="key-save"]');
    out.badFormat = await page.$eval('#keymsg', el => el.textContent);
    await page.fill('#apikey', 'sk-ant-bad-000000');
    await page.click('[data-act="key-save"]');
    await page.waitForFunction(() => /qəbul edilmədi/.test(document.querySelector('#keymsg').textContent));
    out.badKey = await page.$eval('#keymsg', el => el.textContent);
    out.keyStoredAfterBad = await page.evaluate(() => QA_PWA.hasKey());
    // 3. good key -> resumes the original action: AI sheet streams the mocked answer
    await page.fill('#apikey', 'sk-ant-api03-GOODKEY1234');
    await page.click('[data-act="key-save"]');
    await page.waitForFunction(() => document.querySelector('#shm .prose') && /test cavabıdır/.test(document.querySelector('#shm .prose').textContent), null, { timeout: 10000 });
    out.sheetAnswerHTML = await page.$eval('#shm .prose', el => el.innerHTML.slice(0, 200));
    await page.waitForTimeout(200);
    out.sheetNote = await page.$eval('#shnote', el => el.textContent);
    const c0 = calls[0];
    out.req1 = { key: c0.headers['x-api-key'], ver: c0.headers['anthropic-version'], browser: c0.headers['anthropic-dangerous-direct-browser-access'], model: c0.body.model, effort: c0.body.output_config && c0.body.output_config.effort, max: c0.body.max_tokens, stream: c0.body.stream, nMsgs: c0.body.messages.length, firstIsBlocks: Array.isArray(c0.body.messages[0].content), cache: c0.body.messages[0].content[0] && c0.body.messages[0].content[0].cache_control, hasTemp: 'temperature' in c0.body, hasThinking: 'thinking' in c0.body };
    // follow-up in the sheet re-sends the cached first turn
    await page.fill('#shin', 'Bir misal də ver');
    await page.click('#shsend');
    await page.waitForFunction(n => document.querySelectorAll('#shm .msg.a .prose').length >= 2, null, { timeout: 10000 });
    out.req2 = { nMsgs: calls[1].body.messages.length, roles: calls[1].body.messages.map(m => m.role).join(','), cache: !!(calls[1].body.messages[0].content[0] || {}).cache_control };
    await page.click('.sheet-head [data-act="sheet-close"]');
    // 4. settings: connected, usage counted; switch model + effort
    await page.click('[data-act="tab"][data-tab="book"]');
    await page.click('#topbar [data-act="settings"]');
    await page.waitForSelector('#set-claude');
    out.claudeRow = await page.$eval('#set-claude', el => el.innerText.replace(/\s+/g, ' ').slice(0, 400));
    await page.click('[data-act="ai-model"][data-v="claude-sonnet-5-5"]');
    await page.click('[data-act="ai-effort"][data-v="max"]');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(SHOTS, 'pwa-settings-390.png'), fullPage: false });
    await page.$eval('.sheet-body', el => { el.scrollTop = el.scrollHeight; });
    await page.screenshot({ path: path.join(SHOTS, 'pwa-settings-390-b.png') });
    await page.click('.sheet-head [data-act="sheet-close"]');
    // 5. tutor: overloaded mid-stream keeps the partial text and explains
    scenario = 'overload_mid';
    await page.click('[data-act="tab"][data-tab="tutor"]');
    await page.waitForSelector('#tin');
    out.tutorNoticeWithKey = await page.$('.pwa-note') ? 'shown' : 'none';
    await page.fill('#tin', 'Reqressiya testi nədir?');
    await page.click('#tsend');
    await page.waitForSelector('#msgs .ai-err', { timeout: 10000 });
    out.overload = await page.$eval('#msgs', el => el.innerText.replace(/\s+/g, ' ').slice(-200));
    const c3 = calls[calls.length - 1];
    out.req3 = { model: c3.body.model, effort: c3.body.output_config.effort, max: c3.body.max_tokens, firstLen: JSON.stringify(c3.body.messages[0].content).length, cache: Array.isArray(c3.body.messages[0].content) && !!c3.body.messages[0].content[0].cache_control };
    out.req1Len = calls[0].body.messages[0].content.length;
    // 6. invalid key on a task check: error + way out
    scenario = '401';
    await page.click('[data-act="tab"][data-tab="book"]');
    await page.click('[data-act="open-ch"][data-ch="c3"]');
    await page.waitForSelector('.task textarea');
    const ta = await page.$('.task textarea');
    await ta.scrollIntoViewIfNeeded();
    await ta.fill('Mənim cavabım: sərhəd dəyərləri 17, 18, 60, 61.');
    const tid = await ta.getAttribute('data-ans');
    await page.click(`[data-act="task-check"][data-task="${tid}"]`);
    await page.waitForSelector(`[data-fb="${tid}"] .ai-err`, { timeout: 10000 });
    out.authErr = await page.$eval(`[data-fb="${tid}"]`, el => el.innerText.replace(/\s+/g, ' '));
    out.authFix = await page.$$eval(`[data-fb="${tid}"] .ai-fix > *`, els => els.map(e => e.textContent.trim()));
    // 7. credit
    scenario = 'credit';
    await page.click(`[data-act="task-check"][data-task="${tid}"]`);
    await page.waitForFunction(id => /kredit/.test(document.querySelector(`[data-fb="${id}"]`).textContent), tid, { timeout: 10000 });
    out.creditErr = await page.$eval(`[data-fb="${tid}"] .ai-err`, el => el.textContent);
    // 8. export (desktop: download) and import back with a change
    scenario = 'ok';
    await page.click('[data-act="tab"][data-tab="progress"]');
    await page.waitForSelector('[data-act="data-export"]');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#view [data-act="data-export"]')]);
    const fpath = path.join(__dirname, 'shots', dl.suggestedFilename());
    await dl.saveAs(fpath);
    const exp = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    out.export = { name: dl.suggestedFilename(), app: exp.app, keys: Object.keys(exp.docs).sort().join(','), leaksKey: fs.readFileSync(fpath, 'utf8').includes('GOODKEY') };
    exp.docs.progress = exp.docs.progress || { learned: {}, quiz: {}, last: null };
    exp.docs.progress.learned = { c1s1: 1, c1s2: 1, c1s3: 1 };
    exp.docs['notes-c1'] = { n: { c1s1: 'İdxal testi qeydi' } };
    const ipath = path.join(__dirname, 'shots', 'import-test.json');
    fs.writeFileSync(ipath, JSON.stringify(exp));
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('#view [data-act="data-import"]')]);
    await fc.setFiles(ipath);
    await page.waitForSelector('[data-act="confirm-ok"]');
    out.importConfirm = await page.$eval('.sheet-body p', el => el.textContent);
    await page.click('[data-act="confirm-ok"]');
    await page.waitForTimeout(300);
    await page.click('[data-act="tab"][data-tab="progress"]');
    out.afterImport = await page.$eval('.herofig', el => el.innerText.replace(/\s+/g, ' '));
    out.importedNote = await page.$eval('.notes-list', el => el.innerText.replace(/\s+/g, ' ').slice(0, 120)).catch(() => null);
    // 9. delete key -> no key again
    await page.click('#topbar [data-act="settings"]');
    await page.click('[data-act="key-del"]');
    await page.click('[data-act="confirm-ok"]');
    await page.waitForSelector('#set-claude #apikey');
    out.afterDelete = await page.evaluate(() => QA_PWA.hasKey());
  });
  out.r1 = r1;

  // 10. narrow phone + dark: setup sheet and settings fit, no sideways scroll
  const r2 = await run(360, true, async page => {
    await page.click('[data-act="tab"][data-tab="tutor"]');
    await page.waitForSelector('.pwa-note');
    await page.screenshot({ path: path.join(SHOTS, 'pwa-tutor-nokey-360-dark.png') });
    await page.click('.pwa-note [data-act="claude-setup"]');
    await page.waitForSelector('#apikey');
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(SHOTS, 'pwa-setup-360-dark.png') });
    out.sheetOverflow360 = await page.$eval('.sheet-panel', el => el.scrollWidth - el.clientWidth);
  });
  out.r2 = r2;
  console.log(JSON.stringify(out, null, 1));
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
