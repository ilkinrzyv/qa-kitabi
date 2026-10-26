// Sorting exercises (sorting.json): mouse drag, touch drag, ▲▼, tap-to-place, check/score, reshuffle, layout.
const { setup } = require('./harness');
(async () => {
  const out = {}; const ERRORS = [];
  let { browser, ctx, page, errors } = await setup({ hash: '#c4s1', w: 1024, h: 1300, wait: 1200 });
  const order = k => page.$$eval(`[data-srt="${k}"] .srt-item`, els => els.map(e => +e.dataset.j));
  const center = async sel => { const b = await page.locator(sel).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  const toTop = k => page.$eval(`[data-srt="${k}"]`, el => el.scrollIntoView({ block: 'start' }));
  await toTop('c4s1:0');
  // order: starts shuffled; a check before sorting reports mistakes
  out.startShuffled = (await order('c4s1:0')).some((j, p) => j !== p);
  await page.click('[data-srt="c4s1:0"] [data-act="srt-check"]');
  out.firstCheck = await page.$eval('[data-srt="c4s1:0"]', el => ({ score: el.querySelector('.srt-score').textContent, bad: el.querySelectorAll('.srt-item.bad').length, hint: !!el.querySelector('.srt-item.bad .srt-why') }));
  // mouse drag: move step 1 (Tələblərin analizi) to the top by its grip
  const [gx, gy] = await center('[data-srt="c4s1:0"] .srt-item[data-j="0"] .srt-grip');
  const [, ty] = await center('[data-srt="c4s1:0"] .srt-item:first-child');
  await page.mouse.move(gx, gy); await page.mouse.down(); await page.mouse.move(gx, gy - 20, { steps: 3 }); await page.mouse.move(gx, ty - 10, { steps: 8 }); await page.mouse.up();
  out.afterMouseDrag = (await order('c4s1:0'))[0];
  // finish with ▲ buttons (each step moves up until it sits in its place)
  for (let j = 1; j < 6; j++) {
    for (let guard = 0; guard < 6; guard++) { const o = await order('c4s1:0'); const p = o.indexOf(j); if (p <= j) break; await page.click(`[data-srt="c4s1:0"] .srt-item:nth-child(${p + 1}) [data-d="-1"]`); }
  }
  out.sorted = (await order('c4s1:0')).join(',');
  await page.click('[data-srt="c4s1:0"] [data-act="srt-check"]');
  out.finalCheck = await page.$eval('[data-srt="c4s1:0"]', el => ({ score: el.querySelector('.srt-score').textContent, ok: el.querySelectorAll('.srt-item.ok').length }));
  await page.locator('[data-srt="c4s1:0"]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/srt-order-1024.png' });
  await page.click('[data-srt="c4s1:0"] [data-act="srt-reset"]');
  out.afterReset = await page.$eval('[data-srt="c4s1:0"]', el => ({ score: !!el.querySelector('.srt-score'), shuffled: [...el.querySelectorAll('.srt-item')].some((e, p) => +e.dataset.j !== p) }));
  // groups: tap a card, then a group; a check with cards left in the pool is refused
  await page.evaluate(() => { location.hash = '#c6s3'; }); await page.waitForTimeout(900);
  const ex = await page.evaluate(() => JSON.parse(document.getElementById('book-data').textContent).chapters.find(c => c.id === 'c6').sections.find(s => s.id === 'c6s3').srt[0]);
  const k = 'c6s3:0';
  await page.click(`[data-srt="${k}"] [data-act="srt-check"]`);
  out.checkWithPool = await page.$eval('.toast', el => el.textContent);
  // drag the first card into the right group with the mouse
  await toTop(k);
  const j0 = await page.$eval(`[data-srt="${k}"] .srt-pool .srt-chip`, el => +el.dataset.j);
  const g0 = ex.groups.indexOf(ex.items[j0].g);
  const [cx, cy] = await center(`[data-srt="${k}"] .srt-chip[data-j="${j0}"]`); const [zx, zy] = await center(`[data-srt="${k}"] .srt-group[data-g="${g0}"]`);
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 10, cy + 10, { steps: 2 }); await page.mouse.move(zx, zy, { steps: 10 }); await page.mouse.up();
  out.mouseDropInGroup = await page.$eval(`[data-srt="${k}"] .srt-group[data-g="${g0}"]`, (el, j) => !!el.querySelector(`.srt-chip[data-j="${j}"]`), j0);
  // tap the rest: all right except one sent to a wrong group
  const wrongJ = ex.items.findIndex((it, j) => j !== j0);
  for (let j = 0; j < ex.items.length; j++) {
    if (j === j0) continue;
    const g = j === wrongJ ? (ex.groups.indexOf(ex.items[j].g) + 1) % ex.groups.length : ex.groups.indexOf(ex.items[j].g);
    await page.click(`[data-srt="${k}"] .srt-chip[data-j="${j}"]`);
    await page.click(`[data-srt="${k}"] .srt-group[data-g="${g}"] .srt-gh`);
  }
  await page.click(`[data-srt="${k}"] [data-act="srt-check"]`);
  out.groupCheck = await page.$eval(`[data-srt="${k}"]`, el => ({ score: el.querySelector('.srt-score').textContent, bad: [...el.querySelectorAll('.srt-chip.bad')].map(c => c.querySelector('.srt-why').textContent.slice(0, 40)) }));
  // fix it: tap the wrong card, then its right group
  await page.click(`[data-srt="${k}"] .srt-chip[data-j="${wrongJ}"]`);
  await page.click(`[data-srt="${k}"] .srt-group[data-g="${ex.groups.indexOf(ex.items[wrongJ].g)}"] .srt-gh`);
  await page.click(`[data-srt="${k}"] [data-act="srt-check"]`);
  out.groupFixed = await page.$eval(`[data-srt="${k}"] .srt-score`, el => el.textContent);
  await page.locator(`[data-srt="${k}"]`).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/srt-group-1024.png' });
  ERRORS.push(...errors); await browser.close();
  // phone: a real touch drag (CDP touch events) moves a card into a group; no sideways scroll
  ({ browser, ctx, page, errors } = await setup({ hash: '#c12s1', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  const k2 = 'c12s1:0';
  out.phoneHeights = await page.$eval(`[data-srt="${k2}"]`, el => ({ pool: Math.round(el.querySelector('.srt-pool').getBoundingClientRect().height), all: Math.round(el.getBoundingClientRect().height) }));
  // the last card of the pool, so the first group is right below it on screen
  await page.$eval(`[data-srt="${k2}"] .srt-pool .srt-chip:last-child`, el => el.scrollIntoView({ block: 'center' }));
  const j2 = await page.$eval(`[data-srt="${k2}"] .srt-pool .srt-chip:last-child`, el => +el.dataset.j);
  const [tx0, ty0] = await center(`[data-srt="${k2}"] .srt-chip[data-j="${j2}"]`); const [tx1, ty1] = await center(`[data-srt="${k2}"] .srt-group[data-g="0"] .srt-gh`);
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', tx0, ty0);
  for (let s = 1; s <= 10; s++) await touch('touchMove', tx0 + (tx1 - tx0) * s / 10, ty0 + (ty1 - ty0) * s / 10);
  await touch('touchEnd');
  await page.waitForTimeout(200);
  out.touchDrop = await page.$eval(`[data-srt="${k2}"] .srt-group[data-g="0"]`, (el, j) => !!el.querySelector(`.srt-chip[data-j="${j}"]`), j2);
  await page.$eval(`[data-srt="${k2}"] .srt-groups`, el => el.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: 'shots/srt-groups-360-dark.png' });
  // hold a card near the bottom edge: the page scrolls by itself
  const y0 = await page.evaluate(() => scrollY);
  const j3 = await page.$eval(`[data-srt="${k2}"] .srt-pool .srt-chip:last-child`, el => +el.dataset.j);
  await page.$eval(`[data-srt="${k2}"] .srt-pool .srt-chip:last-child`, el => el.scrollIntoView({ block: 'center' }));
  const [ax, ay] = await center(`[data-srt="${k2}"] .srt-chip[data-j="${j3}"]`);
  await touch('touchStart', ax, ay); await touch('touchMove', ax, ay + 12); await touch('touchMove', ax, 760 - 60);
  await page.waitForTimeout(600); await touch('touchMove', ax, 760 - 62); await touch('touchEnd');
  out.autoScrolled = (await page.evaluate(() => scrollY)) > y0 + 40;
  await page.screenshot({ path: 'shots/srt-group-360-dark.png' });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
})();
