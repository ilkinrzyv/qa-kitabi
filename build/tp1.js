// PWA test 1: service worker precache, installability, offline reload with the host gone, fonts from cache.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
const ROOT = path.resolve(__dirname, '..', 'docs');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

function serve(port) {
  const hits = [];
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    hits.push(p);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=600' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r({ srv, hits })));
}

(async () => {
  const PORT = 8765;
  const { srv, hits } = await serve(PORT);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const out = {};
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page.waitForFunction(() => window.QA_PWA && window.QA_PWA.sw.ready === true, null, { timeout: 30000 });
  out.version = await page.evaluate(() => QA_PWA.VERSION);
  out.controller = await page.evaluate(async () => { await navigator.serviceWorker.ready; return !!navigator.serviceWorker.controller; });
  out.cacheEntries = await page.evaluate(async () => (await (await caches.open('qa-kitab-' + QA_PWA.VERSION)).keys()).length);
  // installability (Chromium CDP)
  const cdp = await ctx.newCDPSession(page);
  try { out.installErrors = (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors; } catch (e) { out.installErrors = 'n/a: ' + e.message; }
  try { const m = await cdp.send('Page.getAppManifest'); out.manifestErrors = m.errors; out.manifestUrl = m.url; } catch (e) { out.manifestErrors = 'n/a'; }
  out.homeChapters = await page.$$eval('.chrow', els => els.length);
  out.settingsOffline = null;
  await page.click('[data-act="settings"]');
  await page.waitForSelector('#set-app');
  out.appRow = await page.$eval('#set-app', el => el.innerText.replace(/\s+/g, ' '));
  await page.click('.sheet-head [data-act="sheet-close"]');

  // ---- host gone + offline: reload and use the book ----
  await new Promise(r => srv.close(r));
  srv.closeAllConnections && srv.closeAllConnections();
  await ctx.setOffline(true);
  const before = hits.length;
  await page.reload();
  await page.waitForSelector('.chrow', { timeout: 15000 });
  out.offlineHomeChapters = await page.$$eval('.chrow', els => els.length);
  out.onLineAfterReload = await page.evaluate(() => navigator.onLine);
  await page.evaluate(() => { location.hash = ''; });
  await page.click('[data-act="open-ch"][data-ch="c8"]');
  await page.waitForSelector('.sec', { timeout: 10000 });
  out.offlineReaderSecs = await page.$$eval('.sec', els => els.length);
  out.fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const loaded = []; document.fonts.forEach(f => { if (f.status === 'loaded') loaded.push(f.family + ' ' + f.weight + ' ' + f.style); });
    return { literata: document.fonts.check('17px Literata', 'ə'), plex: document.fonts.check('15px "IBM Plex Sans"', 'ş'), mono: document.fonts.check('13px "IBM Plex Mono"', 'a'), loaded: loaded.length };
  });
  out.diagrams = await page.$$eval('figure.diagram svg', els => els.length);
  // Claude while offline: toast, no sheet. (Playwright's offline emulation does not reach navigator.onLine
  // of a document reloaded through a service worker, so the OS signal is emulated here.)
  await page.evaluate(() => { Object.defineProperty(Navigator.prototype, 'onLine', { configurable: true, get: () => false }); window.dispatchEvent(new Event('offline')); });
  out.netToast = await page.$eval('.toast', el => el.textContent).catch(() => null);
  await page.waitForTimeout(2600);
  const aiBtn = await page.$('[data-act="ai"]');
  if (aiBtn) { await aiBtn.scrollIntoViewIfNeeded(); await aiBtn.click(); await page.waitForTimeout(300); }
  out.offlineAiToast = await page.$eval('.toast', el => el.textContent).catch(() => null);
  out.offlineSheet = !!(await page.$('.sheet'));
  // tutor shows offline note
  await page.click('[data-act="tab"][data-tab="tutor"]');
  await page.waitForTimeout(200);
  out.tutorNote = await page.$eval('.pwa-note', el => el.innerText.replace(/\s+/g, ' ')).catch(() => null);
  // quiz works offline
  await page.click('[data-act="tab"][data-tab="practice"]');
  await page.waitForTimeout(200);
  // SQLite (libs/sql-asm.js, loaded on demand) comes from the cache too
  await page.evaluate(() => { location.hash = 'sql'; });
  await page.waitForSelector('#sql-schema .sql-tb', { timeout: 20000 }).catch(() => { });
  await page.click('[data-act="sql-go"]').catch(() => { });
  await page.waitForSelector('#sql-out .sql-cap', { timeout: 10000 }).catch(() => { });
  out.offlineSql = await page.$eval('#sql-out .sql-cap', el => el.textContent).catch(() => null);
  await page.evaluate(() => { location.hash = 'mesq'; });
  out.serverHitsWhileOffline = hits.length - before;
  await page.screenshot({ path: path.join(__dirname, 'shots', 'pwa-offline-practice.png') });
  out.errors = errors.filter(e => !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
