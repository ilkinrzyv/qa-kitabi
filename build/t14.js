// "Müsahibədə belə de" lines: term sheet, glossary (folded, remembers open), flashcards after the flip.
const { setup } = require('./harness');
(async () => {
  const out = {}; const ERRORS = [];
  let { browser, page, errors } = await setup({ hash: '#c12', w: 390, h: 844, wait: 1200 });
  out.termsWithLine = await page.evaluate(() => { const B = JSON.parse(document.getElementById('book-data').textContent); return { all: B.glossary.length, withSay: B.glossary.filter(g => g.say && g.say.length > 40).length }; });
  // term sheet from a glossary link in the text
  await page.locator('.sec > .prose .gt').first().click();
  await page.waitForSelector('.sheet .say');
  out.termSheet = await page.$eval('.sheet', el => ({ title: el.querySelector('.sheet-head h3').textContent, kicker: el.querySelector('.say-k').textContent, text: el.querySelector('.say p').textContent.slice(0, 60) }));
  await page.screenshot({ path: 'shots/say-term-390.png' });
  await page.click('.sheet-head [data-act="sheet-close"]');
  // glossary: folded by default, opens, stays open after the list is redrawn by search
  await page.evaluate(() => { location.hash = '#ga'; }); await page.waitForSelector('#gllist .say-d');
  out.glossary = await page.evaluate(() => ({ items: document.querySelectorAll('#gllist .gl-item').length, withSay: document.querySelectorAll('#gllist .say-d').length, openAtStart: document.querySelectorAll('#gllist .say-d[open]').length }));
  await page.fill('#glq', 'severity');
  await page.locator('#gllist .say-d > summary').first().click();
  await page.waitForTimeout(150); // the toggle event that remembers the open state is async
  await page.fill('#glq', 'sever');
  out.glossaryAfterSearch = await page.evaluate(() => ({ shown: [...document.querySelectorAll('#gllist .gl-item .en')].map(e => e.textContent), open: [...document.querySelectorAll('#gllist .say-d')].map(d => d.open) }));
  await page.screenshot({ path: 'shots/say-glossary-390.png' });
  // flashcards: the line appears only after the flip
  await page.evaluate(() => { location.hash = '#mesq'; }); await page.waitForTimeout(400);
  await page.click('[data-act="cards"]');
  await page.waitForSelector('.fc');
  out.cardBeforeFlip = await page.$('#fcbtns .say') ? 'shown' : 'hidden';
  await page.click('#fcbtns [data-act="card-flip"]');
  await page.waitForSelector('#fcbtns .say');
  out.cardAfterFlip = await page.$eval('#fcbtns .say p', el => el.textContent.length > 40);
  await page.screenshot({ path: 'shots/say-card-390.png' });
  out.overflow390 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...errors); await browser.close();
  ({ browser, page, errors } = await setup({ hash: '#ga', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.locator('#gllist .say-d > summary').nth(2).click();
  await page.locator('#gllist .say-d').nth(2).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/say-glossary-360-dark.png' });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
})();
