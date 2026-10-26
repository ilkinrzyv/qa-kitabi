// Good / bad cards (compare.json) in 11.6 and 12.1: render, "Niyə?" toggle survives a level switch, layout per width.
const { setup } = require('./harness');
(async () => {
  const out = {}; const ERRORS = [];
  let { browser, page, errors } = await setup({ hash: '#c11s6', w: 390, h: 844, wait: 1200 });
  const cards = sid => page.evaluate(sid => [...document.querySelectorAll(`#${sid} .cmp-card`)].map(c => ({ tag: c.querySelector('.cmp-tag').textContent, bad: !!c.querySelector('.cmp-side.bad p').textContent, good: !!c.querySelector('.cmp-side.good p').textContent, open: c.querySelector('details').open })), sid);
  out.c11s6 = await cards('c11s6');
  out.c11s6cols = await page.$eval('#c11s6 .cmp-pair', el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  await page.locator('#c11s6 .cmp-card').nth(0).locator('.cmp-why > summary').click();
  out.whyOpen = await page.locator('#c11s6 .cmp-card').nth(0).locator('.cmp-why').evaluate(el => ({ open: el.open, text: el.querySelector('p').getBoundingClientRect().height > 0 }));
  await page.locator('#c11s6 .cmp').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/cmp-c11s6-390.png' });
  // switching the section to "Qısa" re-renders it; the cards stay and the opened reason stays open
  await page.click('#c11s6 .sec-h [data-act="lvl"][data-v="short"]');
  await page.waitForTimeout(300);
  out.afterShort = { cards: (await cards('c11s6')).length, firstOpen: (await cards('c11s6'))[0].open };
  out.otherSections = await page.evaluate(() => [...document.querySelectorAll('.sec')].filter(s => s.querySelector('.cmp')).map(s => s.id));
  await page.evaluate(() => { location.hash = '#c12s1'; }); await page.waitForTimeout(900);
  out.c12s1 = (await cards('c12s1')).map(c => c.tag);
  out.overflow390 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...errors); await browser.close();
  ({ browser, page, errors } = await setup({ hash: '#c12s1', w: 1280, h: 900, wait: 1200 }));
  out.c12s1colsDesktop = await page.$eval('#c12s1 .cmp-pair', el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  await page.locator('#c12s1 .cmp').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/cmp-c12s1-1280.png' });
  ERRORS.push(...errors); await browser.close();
  ({ browser, page, errors } = await setup({ hash: '#c12s1', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.locator('#c12s1 .cmp-card').nth(1).scrollIntoViewIfNeeded();
  await page.locator('#c12s1 .cmp-card').nth(1).locator('.cmp-why > summary').click();
  await page.screenshot({ path: 'shots/cmp-c12s1-360-dark.png' });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
})();
