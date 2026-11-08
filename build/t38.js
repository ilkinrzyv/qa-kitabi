// Bug hunt (bughunt.json, #bugov): every planted bug of the four builds is reproduced in the shop and logged with its model
// title and an accepted severity; each alt title then names the same bug ("artıq siyahıdadır"); a title whose evidence is not
// on screen is refused, an unrelated one counts as a miss; level 2 is locked until level 1 has `need` finds and stays open
// after a reload; the hunt builds have fixed problem_user's old bugs, the practice store still has them.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const BH = JSON.parse(fs.readFileSync(path.join(__dirname, 'bughunt.json'), 'utf8'));
const B = Object.assign({}, ...BH.levels.map(l => l.bugs));
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
const shop = (page, sel) => page.click('#sm-dev ' + sel).then(() => page.waitForTimeout(60));
const fill = (page, f, v) => page.fill(`#sm-dev [data-sm-f="${f}"]`, v).then(() => page.waitForTimeout(30));
const add = (page, id) => shop(page, `[data-e="add"][data-item="${id}"]`);
async function login(page, u, p = 'secret_sauce') { await fill(page, 'user', u); await fill(page, 'pass', p); await shop(page, '[data-e="login"]'); }
async function info(page, first, last, zip) { await fill(page, 'first', first); await fill(page, 'last', last); await fill(page, 'zip', zip); await shop(page, '[data-e="continue"]'); }
const screen = page => page.evaluate(() => {
  const d = document.querySelector('#sm-dev'), q = s => d.querySelector(s);
  return { title: (q('.sm-title') || {}).textContent || '', badge: (q('.sm-badge') || {}).textContent || '', err: (q('.sm-err') || {}).textContent || '',
    items: [...d.querySelectorAll('.sm-item .sm-name')].map(e => e.textContent), sum: (q('.sm-sum') || {}).textContent || '', ver: (q('.sm-ver') || {}).textContent || '' };
});
async function log(page, title, sev) {
  await page.fill('[data-bh-title]', title);
  await page.selectOption('[data-bh-sev]', sev);
  await page.click('[data-act="bh-log"]'); await page.waitForTimeout(80);
  return page.evaluate(() => {
    const fb = document.querySelector('#bh-fb');
    return { text: fb.textContent.replace(/\s+/g, ' ').trim(), good: !!fb.querySelector('.sm-good'), marks: [...fb.querySelectorAll('.sm-rows li')].map(li => li.querySelector('.sm-ok') ? '✓' : '✗').join(''),
      sev: !!fb.querySelector('.sm-st.ok'), found: document.querySelectorAll('#bh-list .bh-ok').length };
  });
}
// log one bug with its model title and first accepted severity, then every alt title must name it as already found
async function hunt(page, k, out, bad) {
  const b = B[k], r = await log(page, b.model, b.sev[0]);
  const alts = [];
  for (const t of b.alt || []) { const a = await log(page, t, b.sev[0]); alts.push(a.text.includes('artıq siyahıdadır') && a.text.includes(b.t)); }
  out[k] = { good: r.good, marks: r.marks, sev: r.sev, found: r.found, alts: alts.map(x => x ? '✓' : '✗').join('') };
  if (!r.good || /✗/.test(r.marks) || !r.sev || !r.text.includes(b.t) || alts.some(x => !x)) bad.push(k + ' ' + r.text.slice(0, 160));
}
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  let { browser, ctx, page, errors } = await setup({ hash: '#bugov-2', w: 390, h: 900, wait: 1200 });
  // level 2 is locked at first; level 1 opens by default
  out.locked = await page.$eval('#view', v => !!v.querySelector('.bh-lock') && !v.querySelector('#sm-dev'));
  if (!out.locked) bad.push('level 2 not locked');
  await go(page, '#bugov-1');
  out.l1 = { screen: await screen(page) };
  if (out.l1.screen.ver !== '2.1' || !(await page.$('#bh-time'))) bad.push('level 1 card');
  // no evidence yet: the typo is on the cart page; an unrelated title is a miss
  const gone = await log(page, B.h1typo.model, 'Trivial');
  const miss = await log(page, 'Login: düymə mavi rəngdədir', 'Minor');
  out.l1.gone = gone.text.slice(0, 60); out.l1.miss = miss.text.slice(0, 60);
  if (!gone.text.includes('sübutu indi') || gone.found || !miss.text.includes('uyğun gəlmədi') || miss.found) bad.push('gone / miss');
  // 2.1: the empty Username gets the Password message
  await fill(page, 'pass', 'secret_sauce'); await shop(page, '[data-e="login"]');
  out.l1.err = (await screen(page)).err;
  await hunt(page, 'h1err', out.l1, bad);
  await login(page, 'standard_user');
  await add(page, 'redshirt'); await add(page, 'backpack');
  out.l1.products = (await screen(page)).items.length;
  await shop(page, '.sm-cart');
  out.l1.cart = await screen(page);
  if (out.l1.cart.title !== 'Your Chart' || !(await page.$eval('#sm-dev', d => d.textContent.includes('$19.99')))) bad.push('2.1 cart page');
  await hunt(page, 'h1typo', out.l1, bad);
  await hunt(page, 'h1price', out.l1, bad);
  await shop(page, '[data-e="checkout"]'); await info(page, 'Ali', 'Aliyev', '1000'); await shop(page, '[data-e="finish"]');
  out.l1.done = await screen(page);
  if (out.l1.done.title !== 'Checkout: Complete!' || out.l1.done.badge !== '2') bad.push('2.1 finish keeps the cart');
  await hunt(page, 'h1done', out.l1, bad);
  out.l1.stars = await page.$$eval('#bh-lv .bh-stars .on', x => x.length);
  if (out.l1.stars !== 3) bad.push('level 1 stars');
  // level 2: cart limit one early, 6 digits refused, a Last Name of spaces accepted, the tax of the first item only
  await go(page, '#bugov-2');
  out.l2 = { ver: (await screen(page)).ver };
  await login(page, 'standard_user');
  for (const id of ['backpack', 'bikelight', 'bolt', 'fleece', 'onesie']) await add(page, id);
  out.l2.limit = await screen(page);
  if (out.l2.limit.badge !== '4' || !out.l2.limit.err.includes('Cart limit: 5 items')) bad.push('2.2 limit');
  await hunt(page, 'h2limit', out.l2, bad);
  await shop(page, '.sm-cart'); await shop(page, '[data-e="checkout"]');
  const zips = {};
  for (const z of ['123', '1234567', '12a4', '1234', '123456']) { await info(page, 'Ali', 'Aliyev', z); const s = await screen(page); zips[z] = s.title === 'Checkout: Overview' ? 'ok' : s.err; if (s.title === 'Checkout: Overview') await shop(page, '[data-e="cancel"]').then(() => shop(page, '.sm-cart')).then(() => shop(page, '[data-e="checkout"]')); }
  out.l2.zips = zips;
  if (zips['1234'] !== 'ok' || !['123', '1234567', '12a4', '123456'].every(z => /must be 4–6 digits/.test(zips[z]))) bad.push('2.2 zip rules');
  await info(page, 'Ali', 'Aliyev', '123456');
  await hunt(page, 'h2zip', out.l2, bad);
  await info(page, '  ', 'Aliyev', '1000'); out.l2.first = (await screen(page)).err;
  await info(page, 'Ali', '   ', '1000');
  out.l2.overview = await screen(page);
  if (!out.l2.first.startsWith('Error: First Name is required') ||out.l2.overview.title !== 'Checkout: Overview' || !out.l2.overview.sum.includes('Tax: $2.40') || !out.l2.overview.sum.includes('Item total: $105.96')) bad.push('2.2 overview');
  await hunt(page, 'h2space', out.l2, bad);
  await hunt(page, 'h2tax', out.l2, bad);
  // level 3: DevTools is open; the password in the URL, DELETE /cart/undefined, a console error, the total without the tax
  await go(page, '#bugov-3');
  out.l3 = { dvt: !!(await page.$('#dvt')) };
  await login(page, 'standard_user', 'secret');
  out.l3.net = await page.$$eval('#dvt .dvt-tbl tbody tr', trs => trs.map(tr => [...tr.querySelectorAll('td')].slice(0, 2).map(td => td.textContent.trim()).join(' ')));
  if (!out.l3.dvt || !out.l3.net.includes('/login?username=standard_user&password=secret 401')) bad.push('2.3 login request');
  await hunt(page, 'h3pw', out.l3, bad);
  await login(page, 'standard_user');
  await add(page, 'backpack'); await add(page, 'bikelight');
  await shop(page, '.sm-cart');
  await page.click('#dvt [data-act="dvt-tab"][data-v="con"]'); await page.waitForTimeout(60);
  out.l3.con = await page.$$eval('#dvt .dvt-con li .dvt-msg', x => x.map(e => e.textContent));
  if (!out.l3.con.some(t => t.includes('promoBanner is not defined'))) bad.push('2.3 console');
  await hunt(page, 'h3con', out.l3, bad);
  await shop(page, '[data-e="remove"][data-item="backpack"]');
  out.l3.removed = await screen(page);
  await hunt(page, 'h3del', out.l3, bad);
  await page.click('#dvt [data-act="dvt-tab"][data-v="net"]'); await page.waitForTimeout(60);
  out.l3.del = await page.$$eval('#dvt .dvt-tbl tbody tr', trs => trs.map(tr => tr.textContent).filter(t => t.includes('undefined')).length);
  await shop(page, '[data-e="shop"]'); out.l3.back = await screen(page);
  if (out.l3.removed.items.join() !== 'Bike Light' || out.l3.removed.badge !== '1' || out.l3.del !== 1 || out.l3.back.badge !== '2') bad.push('2.3 remove comes back');
  await page.check('#dvt [data-dvt-keep]');
  await shop(page, '.sm-cart'); await shop(page, '[data-e="checkout"]'); await info(page, 'Ali', 'Aliyev', '1000');
  out.l3.total = (await screen(page)).sum.match(/Total: \$[\d.]+$/m);
  await shop(page, '[data-e="finish"]');
  await page.click('#dvt .dvt-nm >> text="/orders"'); await page.click('#dvt [data-act="dvt-sub"][data-v="pay"]'); await page.waitForTimeout(60);
  out.l3.payload = await page.$eval('#dvt .dvt-pre', e => JSON.parse(e.textContent));
  if (out.l3.payload.total !== 39.98) bad.push('2.3 payload total ' + out.l3.payload.total);
  await hunt(page, 'h3total', out.l3, bad);
  await page.uncheck('#dvt [data-dvt-keep]');
  // level 4: a sort moves Add to cart to another product; one Remove empties the cart; Cancel empties it; the cart outlives Logout
  await go(page, '#bugov-4');
  out.l4 = {};
  await login(page, 'standard_user');
  await page.selectOption('#sm-dev [data-sm-sort]', 'lohi'); await page.waitForTimeout(60);
  await add(page, 'onesie');
  out.l4.sort = await page.$eval('#sm-dev', d => ({ onesie: d.querySelector('[data-item="onesie"]').textContent, backpack: d.querySelector('[data-item="backpack"]').textContent }));
  if (out.l4.sort.onesie !== 'Add to cart' || out.l4.sort.backpack !== 'Remove') bad.push('2.4 sort add');
  await hunt(page, 'h4sort', out.l4, bad);
  await page.selectOption('#sm-dev [data-sm-sort]', 'az'); await page.waitForTimeout(60);
  await add(page, 'bikelight'); await shop(page, '.sm-cart');
  await shop(page, '[data-e="remove"][data-item="bikelight"]');
  out.l4.rm2 = await screen(page);
  if (out.l4.rm2.items.length || out.l4.rm2.badge) bad.push('2.4 remove all');
  await hunt(page, 'h4rm2', out.l4, bad);
  await shop(page, '[data-e="shop"]'); await add(page, 'backpack'); await add(page, 'bolt');
  await shop(page, '.sm-cart'); await shop(page, '[data-e="checkout"]'); await info(page, 'Ali', 'Aliyev', '1000'); await shop(page, '[data-e="cancel"]');
  out.l4.cancel = await screen(page);
  if (out.l4.cancel.title !== 'Products' || out.l4.cancel.badge) bad.push('2.4 cancel');
  await hunt(page, 'h4cancel', out.l4, bad);
  await add(page, 'backpack'); await shop(page, '[data-e="menu"]'); await shop(page, '[data-e="logout"]');
  await login(page, 'problem_user');
  out.l4.leak = (await screen(page)).badge;
  await hunt(page, 'h4leak', out.l4, bad);
  await add(page, 'bolt'); out.l4.bolt = (await screen(page)).badge; // problem_user's old Add to cart bug is fixed in the hunt builds
  if (out.l4.leak !== '1' || out.l4.bolt !== '2') bad.push('2.4 leak / old bugs fixed');
  // the session sheet carries the finds; the practice tab and the section links
  out.md = await page.$eval('#bh-md', e => e.textContent.split('\n').filter(l => /^\d\. /.test(l)).length);
  if (out.md !== 4) bad.push('session sheet');
  await page.screenshot({ path: 'shots/bugov-4-390.png', fullPage: true });
  await (await page.$('#bh-form')).screenshot({ path: 'shots/bugov-form-390.png' });
  await (await page.$('#bh-list')).screenshot({ path: 'shots/bugov-list-390.png' });
  await go(page, '#c7s6');
  out.links = await page.$$eval('#c7s6 [data-act="bh-open"]', x => x.length);
  if (out.links !== 4) bad.push('section links ' + out.links);
  // the store is the old build again: problem_user's Bolt T-Shirt does not go into the cart
  await go(page, '#magaza-tc09');
  await add(page, 'bolt'); out.store = await screen(page);
  if (out.store.badge || out.store.ver) bad.push('store after hunt');
  // a reload keeps the finds; level 4 stays open
  await page.waitForTimeout(1200);
  await page.reload(); await page.waitForTimeout(1200);
  await go(page, '#mesq');
  out.practice = await page.$eval('#view', v => { const s = [...v.querySelectorAll('section')].find(x => /Bug ovu/.test(x.textContent)); return s ? s.querySelector('.block-h').textContent.replace(/\s+/g, ' ') : ''; });
  await go(page, '#bugov-4');
  out.reload = { open: !(await page.$('.bh-lock')), found: await page.$$eval('#bh-list .bh-ok', x => x.length), time: await page.$eval('#bh-time', e => e.textContent) };
  if (!/16\/16 bug/.test(out.practice) || !out.reload.open || out.reload.found !== 4 || !/^\d\d:\d\d$/.test(out.reload.time)) bad.push('reload');
  ERRORS.push(...errors); await browser.close();
  // PC: the shop beside the level card
  ({ browser, page, errors } = await setup({ hash: '#bugov-1', w: 1280, h: 900, wait: 1200 }));
  out.pc = await page.evaluate(() => { const a = document.querySelector('#bh-lv').getBoundingClientRect(), b = document.querySelector('#sm-dev').getBoundingClientRect(); return { lv: Math.round(a.left), shop: Math.round(b.left), top: Math.round(b.top) }; });
  if (!(out.pc.shop > out.pc.lv + 300)) bad.push('pc layout');
  await page.screenshot({ path: 'shots/bugov-1-1280.png', fullPage: true });
  ERRORS.push(...errors); await browser.close();
  // phone, dark: no overflow with the DevTools level
  ({ browser, page, errors } = await setup({ hash: '#bugov-1', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  await page.screenshot({ path: 'shots/bugov-1-360-dark.png', fullPage: true });
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
