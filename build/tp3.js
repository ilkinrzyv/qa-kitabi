// PWA test 3: hosted under a sub-path (like GitHub Pages /repo/), update to a new version, old cache removed, offline after update.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
const V1 = path.resolve(__dirname, '..', 'docs');
const V2 = path.resolve(__dirname, '..', 'dist', 'qa-kitabi-next');
fs.rmSync(V2, { recursive: true, force: true });
fs.cpSync(V1, V2, { recursive: true });
const ver = fs.readFileSync(path.join(V1, 'pwa.js'), 'utf8').match(/const VERSION = '([^']+)'/)[1];
for (const f of ['pwa.js', 'sw.js']) fs.writeFileSync(path.join(V2, f), fs.readFileSync(path.join(V2, f), 'utf8').split(ver).join(ver + '-next'));
fs.appendFileSync(path.join(V2, 'app.css'), '\n/* next */\n');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
let ROOT = V1; const PREFIX = '/sub/qa-kitabi';
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (!p.startsWith(PREFIX + '/')) { res.writeHead(404); res.end(); return; }
  p = p.slice(PREFIX.length); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(r => srv.listen(8767, '127.0.0.1', r));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const out = {};
  await page.goto(`http://127.0.0.1:8767${PREFIX}/#c5`);
  await page.waitForFunction(() => window.QA_PWA && QA_PWA.sw.ready, null, { timeout: 30000 });
  out.v1 = await page.evaluate(() => QA_PWA.VERSION);
  out.scope = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).scope);
  out.openedChapter = await page.$eval('.tb-kicker', el => el.textContent);
  // new version deployed
  ROOT = V2;
  await page.reload();
  await page.waitForSelector('.chrow, .sec');
  out.check = await page.evaluate(() => QA_PWA.checkUpdate());
  await page.waitForSelector('#pwa-bar', { timeout: 20000 });
  out.bar = await page.$eval('#pwa-bar', el => el.innerText.replace(/\s+/g, ' '));
  await page.screenshot({ path: path.join(__dirname, 'shots', 'pwa-update-bar.png') });
  await Promise.all([page.waitForNavigation(), page.click('#pwa-bar button')]);
  await page.waitForFunction(() => window.QA_PWA && QA_PWA.sw.ready, null, { timeout: 30000 });
  out.v2 = await page.evaluate(() => QA_PWA.VERSION);
  out.caches = await page.evaluate(async () => (await caches.keys()).join(','));
  out.cssHasNext = await page.evaluate(async () => (await (await fetch('app.css')).text()).includes('/* next */'));
  // offline after the update
  await new Promise(r => srv.close(r)); srv.closeAllConnections && srv.closeAllConnections();
  await ctx.setOffline(true);
  await page.goto(`http://127.0.0.1:8767${PREFIX}/?offline=1#c12`);
  await page.waitForSelector('.sec', { timeout: 15000 });
  out.offlineChapter = await page.$eval('.tb-kicker', el => el.textContent);
  await page.evaluate(() => { location.hash = 'mesq'; });
  await page.waitForTimeout(300);
  out.hashNav = await page.evaluate(() => document.querySelector('.tab[aria-current="true"]').textContent.trim());
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
  fs.rmSync(V2, { recursive: true, force: true });
})().catch(e => { console.error(e); process.exit(1); });
