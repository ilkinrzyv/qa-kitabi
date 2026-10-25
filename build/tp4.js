// PWA test 4: opened as a plain file (no hosting), install card (Android prompt + iPhone hint), dismiss.
const { chromium, devices } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
const ROOT = path.resolve(__dirname, '..', 'docs');
const SHOTS = path.join(__dirname, 'shots');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(r => srv.listen(8768, '127.0.0.1', r));
  const browser = await chromium.launch();
  const out = {};
  // 1. file:// — book works, offline cache honestly reported as unavailable
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + path.join(ROOT, 'index.html') + '#c7');
    await page.waitForSelector('.sec');
    out.fileSecs = await page.$$eval('.sec', e => e.length);
    out.fileFonts = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('17px Literata', 'ə') && document.fonts.check('15px "IBM Plex Sans"', 'ş'); });
    await page.click('[data-act="tab"][data-tab="book"]');
    await page.click('#topbar [data-act="settings"]');
    out.fileAppRow = await page.$eval('#set-app', el => el.innerText.replace(/\s+/g, ' '));
    out.fileErrors = errors;
    await ctx.close();
  }
  // 2. Android-like: beforeinstallprompt arrives -> card with "Quraşdır"
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8768/');
    await page.waitForSelector('.chrow');
    await page.evaluate(() => { const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = async () => { window.__prompted = true; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(e); });
    await page.waitForSelector('.pwa-inst');
    out.androidCard = await page.$eval('.pwa-inst', el => el.innerText.replace(/\s+/g, ' '));
    await page.screenshot({ path: path.join(SHOTS, 'pwa-home-install-390.png') });
    await page.click('.pwa-inst [data-act="pwa-install"]');
    await page.waitForTimeout(300);
    out.prompted = await page.evaluate(() => !!window.__prompted);
    out.cardAfterInstall = !!(await page.$('.pwa-inst'));
    out.androidErrors = errors;
    await ctx.close();
  }
  // 3. iPhone Safari: hint card, dismissable, stays dismissed after reload
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8768/');
    await page.waitForSelector('.chrow');
    out.iosCard = await page.$eval('.pwa-inst', el => el.innerText.replace(/\s+/g, ' ')).catch(() => null);
    await page.click('.pwa-inst [data-act="pwa-hint-off"]');
    await page.reload(); await page.waitForSelector('.chrow');
    out.iosCardAfterDismiss = !!(await page.$('.pwa-inst'));
    out.iosErrors = errors;
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
