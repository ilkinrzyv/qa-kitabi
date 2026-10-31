// DevTools (devtools.json): the practice store's Network and Console. Every task is reproduced and diagnosed with the
// model answer (4/4) after a wrong one is caught; requests carry their payload, response, headers and cURL; Preserve log,
// the filters and Clear work as in Chrome; logins log 200 / 401 / 403 and no request for empty fields.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const DV = JSON.parse(fs.readFileSync(path.join(__dirname, 'devtools.json'), 'utf8'));
const task = id => DV.tasks.find(t => t.id === id);
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
const net = page => page.$$eval('#dvt .dvt-tbl tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('td')].slice(0, 3).map(td => td.textContent.trim()).join(' ')));
const con = page => page.$$eval('#dvt .dvt-con li', lis => lis.map(li => li.className + ': ' + li.querySelector('.dvt-msg').textContent));
async function tab(page, k) { await page.click(`#dvt [data-act="dvt-tab"][data-v="${k}"]`); await page.waitForTimeout(60); }
async function pick(page, k, re) {
  const v = await page.$eval(`[data-dv="${k}"]`, (s, src) => { const r = new RegExp(src); const o = [...s.options].find(o => o.value && r.test(o.textContent)); return o ? o.value : null; }, re.source);
  if (v === null) throw new Error(`no option ${re} in ${k}`);
  await page.selectOption(`[data-dv="${k}"]`, v);
}
async function answer(page, req, cn, row, side) {
  await pick(page, 'req', req); await pick(page, 'con', cn);
  await page.check(`[data-dv-row="${row}"]`);
  await page.click(`[data-act="dv-side"][data-v="${side}"]`);
  await page.click('[data-act="dv-check"]'); await page.waitForTimeout(120);
  return page.$eval('#dv-fb', el => ({ marks: [...el.querySelectorAll('.sm-rows li')].map(li => li.querySelector('.sm-ok') ? '✓' : '✗').join(''),
    notes: [...el.querySelectorAll('.sm-note')].map(n => n.textContent), good: !!el.querySelector('.sm-good'), ev: (el.querySelector('.dv-ev') || {}).textContent || '' }));
}
const NONE = /^Heç bir sorğu|^Qırmızı xəta yoxdur/;
const shop = (page, sel) => page.click('#sm-dev ' + sel).then(() => page.waitForTimeout(80));
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  let { browser, ctx, page, errors } = await setup({ hash: '#devtools-dv1', w: 1024, h: 1300, wait: 1200 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => { });
  // DV-1: no request, a TypeError in the console → frontend; a wrong diagnosis is caught field by field
  out.dv1 = { load: await net(page) };
  await shop(page, '[data-e="add"][data-item="bolt"]');
  out.dv1.after = (await net(page)).length;
  await tab(page, 'con'); out.dv1.console = await con(page);
  out.dv1.wrong = await answer(page, /GET \/products/, NONE, 1, 'backend');
  out.dv1.right = await answer(page, NONE, /TypeError/, task('dv1').row, task('dv1').side);
  if (out.dv1.load.join('|') !== '/inventory.html 200 document|/products 200 fetch|/cart 200 fetch' || out.dv1.after !== 3 || !/^error: Uncaught TypeError/.test(out.dv1.console[0] || '')) bad.push('dv1 logs');
  if (out.dv1.wrong.marks !== '✗✗✗✗' || out.dv1.wrong.good || out.dv1.right.marks !== '✓✓✓✓' || !out.dv1.right.good || !out.dv1.right.ev.includes('Network: düyməni basanda sorğu getmir.')) bad.push('dv1 diagnosis');
  // DV-2: POST /orders → 500; the screen stays on Overview; Headers, Payload, Response and cURL
  await go(page, '#devtools-dv2'); await tab(page, 'net');
  await shop(page, '[data-e="finish"]');
  out.dv2 = { title: await page.$eval('#sm-dev .sm-title', e => e.textContent), net: await net(page) };
  await page.click('#dvt .dvt-nm >> text="/orders"'); await page.waitForTimeout(80);
  out.dv2.hdrs = await page.$eval('#dvt .dvt-req', e => e.textContent);
  await page.click('#dvt [data-act="dvt-sub"][data-v="pay"]'); await page.waitForTimeout(60);
  out.dv2.payload = await page.$eval('#dvt .dvt-pre', e => JSON.parse(e.textContent));
  await page.click('#dvt [data-act="dvt-sub"][data-v="res"]'); await page.waitForTimeout(60);
  out.dv2.response = await page.$eval('#dvt .dvt-pre', e => JSON.parse(e.textContent));
  await page.click('#dvt [data-act="dvt-curl"]'); await page.waitForTimeout(150);
  out.dv2.curl = await page.evaluate(() => navigator.clipboard.readText().catch(() => '')).catch(() => '');
  out.dv2.diag = await answer(page, /POST \/orders · 500/, /orders 500/, task('dv2').row, task('dv2').side);
  if (out.dv2.title !== 'Checkout: Overview' || !out.dv2.net.includes('/orders 500 fetch') || !/Status Code500 Internal Server Error/.test(out.dv2.hdrs) || !/authorizationBearer tok_/.test(out.dv2.hdrs)) bad.push('dv2 request');
  if (out.dv2.payload.firstName !== 'Ali' || out.dv2.response.error !== 'Internal Server Error') bad.push('dv2 payload / response');
  if (out.dv2.curl && !(out.dv2.curl.startsWith("curl 'https://api.ministore.test/orders'") && out.dv2.curl.includes('-X POST') && out.dv2.curl.includes('--data-raw'))) bad.push('dv2 curl');
  out.dv2.curl = out.dv2.curl ? out.dv2.curl.split('\n').length + ' lines' : 'clipboard unavailable';
  if (!out.dv2.diag.good || !out.dv2.diag.ev.includes('Status: 500 Internal Server Error') || !out.dv2.diag.ev.includes('Payload: ')) bad.push('dv2 diagnosis');
  await page.screenshot({ path: 'shots/devtools-dv2-1024.png', fullPage: true });
  // DV-3: the payload has product_id instead of productId → 400 → frontend; another product goes through
  await go(page, '#devtools-dv3');
  await shop(page, '[data-e="add"][data-item="onesie"]');
  await shop(page, '[data-e="add"][data-item="backpack"]');
  out.dv3 = { net: await net(page), btn: await page.$eval('#sm-dev [data-item="onesie"]', e => e.textContent), badge: await page.$eval('#sm-dev .sm-badge', e => e.textContent) };
  await page.click('#dvt .dvt-tbl tr.bad .dvt-nm'); await page.waitForTimeout(60);
  await page.click('#dvt [data-act="dvt-sub"][data-v="pay"]'); await page.waitForTimeout(60);
  out.dv3.payload = await page.$eval('#dvt .dvt-pre', e => e.textContent.replace(/\s+/g, ''));
  out.dv3.diag = await answer(page, /POST \/cart · 400/, /cart 400/, task('dv3').row, task('dv3').side);
  if (!out.dv3.net.includes('/cart 400 fetch') || !out.dv3.net.includes('/cart 201 fetch') || out.dv3.btn !== 'Add to cart' || out.dv3.badge !== '1' || out.dv3.payload !== '{"product_id":5}' || !out.dv3.diag.good) bad.push('dv3');
  // DV-4: the cart page shows one of two items; GET /cart has both → frontend. With Preserve log, an older GET /cart is no evidence
  await go(page, '#devtools-dv4');
  await page.click('#sm-dev .sm-cart'); await page.waitForTimeout(100);
  out.dv4 = { net: await net(page), items: await page.$$eval('#sm-dev .sm-item', x => x.length), badge: await page.$eval('#sm-dev .sm-badge', e => e.textContent) };
  await page.click('#dvt .dvt-nm >> text="/cart"'); await page.click('#dvt [data-act="dvt-sub"][data-v="res"]'); await page.waitForTimeout(60);
  out.dv4.resItems = await page.$eval('#dvt .dvt-pre', e => JSON.parse(e.textContent).items.length);
  await page.check('#dvt [data-dvt-keep]');
  await shop(page, '[data-e="shop"]'); await page.click('#sm-dev .sm-cart'); await page.waitForTimeout(100);
  out.dv4.kept = (await net(page)).length;
  // the kept GET /cart requests: the first cart page's, the Products page's (no evidence: that page lists no items), the second cart page's
  const carts = await page.$eval('[data-dv="req"]', s => [...s.options].filter(o => /GET \/cart · /.test(o.textContent)).map(o => o.value));
  out.dv4.old = await answer(page, new RegExp(`^#${carts[1]} `), NONE, task('dv4').row, task('dv4').side);
  const last = carts[carts.length - 1];
  await page.selectOption('[data-dv="req"]', last); await page.click('[data-act="dv-check"]'); await page.waitForTimeout(100);
  out.dv4.right = await page.$eval('#dv-fb', el => [...el.querySelectorAll('.sm-rows li')].map(li => li.querySelector('.sm-ok') ? '✓' : '✗').join(''));
  await page.uncheck('#dvt [data-dvt-keep]');
  if (out.dv4.net.join('|') !== '/cart.html 200 document|/cart 200 fetch' || out.dv4.items !== 1 || out.dv4.badge !== '2' || out.dv4.resItems !== 2) bad.push('dv4 screen / response');
  if (out.dv4.kept < 6 || out.dv4.old.marks !== '✗✓✓✓' || !out.dv4.old.notes[0].includes('baqı göstərmir') || out.dv4.right !== '✓✓✓✓') bad.push('dv4 diagnosis / preserve log');
  // DV-5: the server sends 4.99 for Fleece Jacket and the shop shows it → backend; restart keeps the done tasks
  await go(page, '#devtools-dv5');
  out.dv5 = { price: await page.$eval('#sm-dev', e => [...e.querySelectorAll('.sm-item')].find(i => i.textContent.includes('Fleece')).querySelector('.sm-price').textContent) };
  out.dv5.diag = await answer(page, /GET \/products · 200/, NONE, task('dv5').row, task('dv5').side);
  if (out.dv5.price !== '$4.99' || !out.dv5.diag.good || !out.dv5.diag.ev.includes('"name":"Fleece Jacket","price":4.99')) bad.push('dv5');
  await page.click('[data-act="dv-restart"]'); await page.waitForTimeout(200);
  out.chips = await page.$$eval('#view .sm-pick .chip.pass', x => x.length);
  if (out.chips !== 4) bad.push('done tasks after restart: ' + out.chips);
  // the store's own DevTools: logins, filters, Clear
  await go(page, '#magaza');
  out.store = { closed: await page.$$eval('#dvt', x => x.length), users: await page.$eval('#sm-dev .sm-cred', e => e.textContent.includes('error_user')) };
  await page.click('[data-act="dvt-open"]'); await page.waitForTimeout(150);
  out.store.load = await net(page);
  await shop(page, '[data-e="login"]'); // empty fields: the form stops it
  out.store.empty = (await net(page)).length;
  await page.fill('#sm-dev [data-sm-f="user"]', 'standard_user'); await page.fill('#sm-dev [data-sm-f="pass"]', 'secret');
  await shop(page, '[data-e="login"]');
  out.store.wrong = await net(page);
  await page.fill('#sm-dev [data-sm-f="user"]', 'locked_out_user'); await page.fill('#sm-dev [data-sm-f="pass"]', 'secret_sauce');
  await shop(page, '[data-e="login"]');
  await tab(page, 'con'); out.store.console = await con(page); await tab(page, 'net');
  await page.fill('#sm-dev [data-sm-f="user"]', 'standard_user');
  await shop(page, '[data-e="login"]');
  out.store.afterLogin = await net(page); // a new page: the login request is gone
  await shop(page, '[data-e="menu"]'); await shop(page, '[data-e="logout"]');
  await page.check('#dvt [data-dvt-keep]');
  await page.fill('#sm-dev [data-sm-f="user"]', 'standard_user'); await page.fill('#sm-dev [data-sm-f="pass"]', 'secret_sauce');
  await shop(page, '[data-e="login"]');
  out.store.kept = await net(page);
  await page.click('#dvt .dvt-nm >> text="/login"'); await page.click('#dvt [data-act="dvt-sub"][data-v="pay"]'); await page.waitForTimeout(60);
  out.store.loginPayload = await page.$eval('#dvt .dvt-pre', e => JSON.parse(e.textContent));
  await page.click('#dvt [data-act="dvt-filter"][data-v="xhr"]'); await page.waitForTimeout(60);
  out.store.xhr = (await net(page)).every(r => r.endsWith('fetch'));
  await page.click('#dvt [data-act="dvt-filter"][data-v="doc"]'); await page.waitForTimeout(60);
  out.store.doc = (await net(page)).every(r => r.endsWith('document'));
  await page.click('#dvt [data-act="dvt-clear"]'); await page.waitForTimeout(60);
  out.store.cleared = (await net(page)).length;
  await page.click('#dvt [data-act="dvt-filter"][data-v="all"]');
  if (out.store.closed || !out.store.users || out.store.load.join('|') !== '/ 200 document' || out.store.empty !== 1) bad.push('store devtools start');
  if (!out.store.wrong.includes('/login 401 fetch') || !out.store.console.some(c => /login 401 \(Unauthorized\)/.test(c)) || !out.store.console.some(c => /login 403 \(Forbidden\)/.test(c))) bad.push('login errors');
  if (out.store.afterLogin.join('|') !== '/inventory.html 200 document|/products 200 fetch|/cart 200 fetch') bad.push('navigation clears the log: ' + out.store.afterLogin.join('|'));
  if (!out.store.kept.includes('/login 200 fetch') || out.store.loginPayload.password !== 'secret_sauce' || !out.store.xhr || !out.store.doc || out.store.cleared !== 0) bad.push('preserve log / filters / clear');
  // a test case still runs with DevTools open: TC-04 logs POST /cart 201
  await go(page, '#magaza-tc04');
  await shop(page, '[data-e="add"][data-item="backpack"]');
  out.tc04 = { net: await net(page), state: await page.$eval('#sm-case .sm-state', e => e.className) };
  if (!out.tc04.net.includes('/cart 201 fetch') || !out.tc04.state.includes('ok')) bad.push('test case with DevTools');
  // entry points: 13.9's link, the practice card
  await go(page, '#c13s9');
  out.links = await page.$$eval('#c13s9 .sm-link [data-act="dv-open"]', x => x.length);
  await page.click('#c13s9 .sm-link [data-act="dv-open"][data-dv="dv3"]'); await page.waitForTimeout(300);
  out.fromSection = await page.$eval('#dv-case .sm-id', e => e.textContent);
  await go(page, '#mesq');
  out.practice = await page.$eval('#view [data-act="dv-open"]', e => e.closest('section').querySelector('.block-h span').textContent);
  if (out.links !== DV.tasks.length || !out.fromSection.startsWith('DV-3') || out.practice !== `5/${DV.tasks.length} tapşırıq`) bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: the panel with a request open fits
  ({ browser, page, errors } = await setup({ hash: '#devtools-dv2', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await shop(page, '[data-e="finish"]');
  await page.click('#dvt .dvt-nm >> text="/orders"'); await page.waitForTimeout(80);
  await page.screenshot({ path: 'shots/devtools-dv2-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
