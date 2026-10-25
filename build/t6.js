const { setup } = require('./harness');
const fs = require('fs');
(async () => {
  const shot = async (page, name) => page.screenshot({ path: `shots/${name}.png` });
  const { browser, page, errors } = await setup({ w: 390, h: 844, mobile: true, hash: '#c8' });
  const log = (...a) => console.log(...a);
  await page.waitForTimeout(500);
  // reader: chapter 8 with level switch, keys, deep, mini
  log('secs with lvl', await page.$$eval('.sec .lvl', x => x.length), 'keys', await page.$$eval('.keys', x => x.length), 'deep', await page.$$eval('details.deep', x => x.length), 'mini', await page.$$eval('details.mini', x => x.length));
  log('gt links', await page.$$eval('.gt', x => x.length), 'figures', await page.$$eval('figure.diagram', x => x.map(f => f.dataset.d)));
  await page.evaluate(() => document.getElementById('c8s4').scrollIntoView());
  await page.waitForTimeout(200); await shot(page, 'r-c8s4-std');
  // switch c8s2 to short
  await page.click('#c8s2 .lvl button[data-v="short"]'); await page.waitForTimeout(150);
  log('c8s2 short?', await page.$eval('#c8s2', s => !!s.querySelector('.short') && !s.querySelector('details.deep')));
  await page.evaluate(() => document.getElementById('c8s2').scrollIntoView()); await page.waitForTimeout(100); await shot(page, 'r-c8s2-short');
  // deep
  await page.click('#c8s2 .lvl button[data-v="deep"]'); await page.waitForTimeout(150);
  log('c8s2 deep open?', await page.$eval('#c8s2 details.deep', d => d.open), 'mini open?', await page.$eval('#c8s2 details.mini', d => d.open));
  await page.evaluate(() => document.querySelector('#c8s2 details.deep').scrollIntoView()); await page.waitForTimeout(100); await shot(page, 'r-c8s2-deep');
  // mini steps
  await page.click('#c8s2 details.mini [data-act="ex-next"]'); await page.waitForTimeout(100);
  await page.click('#c8s2 details.mini [data-act="ex-all"]'); await page.waitForTimeout(100);
  log('mini steps shown', await page.$$eval('#c8s2 details.mini .ex-steps li', x => x.length));
  await page.fill('#c8s2 details.mini textarea', 'Siniflər: 0-dan kiçik, 1–100, 100-dən böyük. BVA: 0, 1, 100, 101.');
  await page.waitForTimeout(900);
  await page.click('#c8s2 details.mini [data-act="task-check"]'); await page.waitForTimeout(2200);
  log('mini fb', (await page.$eval('#c8s2 details.mini .fb', f => f.textContent)).slice(0, 80));
  const call = await page.evaluate(() => window.__sampleCalls[window.__sampleCalls.length - 1]);
  log('mini prompt has worked example', call.input.includes('mini-nümunəsi'), call.input.includes('QİYMƏT'), call.opts.model, call.opts.effort);
  log('mini done class', await page.$eval('#c8s2 details.mini', d => d.className));
  await page.evaluate(() => document.querySelector('#c8s2 details.mini .turn').scrollIntoView()); await page.waitForTimeout(100); await shot(page, 'r-c8s2-mini');
  // term popover
  const gtText = await page.evaluate(() => { const g = [...document.querySelectorAll('.gt')].find(x => x.offsetParent !== null && !x.closest('details:not([open])')); g.scrollIntoView({ block: 'center' }); g.setAttribute('data-test-gt', '1'); return g.textContent; });
  await page.waitForTimeout(150);
  await page.click('[data-test-gt="1"]'); await page.waitForTimeout(250);
  log('term sheet', gtText, '->', await page.$eval('.sheet h3', h => h.textContent));
  await shot(page, 'r-term'); await page.click('.sheet-head [data-act="sheet-close"]');
  // chapter-level control
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100); await shot(page, 'r-c8-hero');
  await page.click('.ch-lvl button[data-v="short"]'); await page.waitForTimeout(250);
  log('all short', await page.$$eval('.sec .short', x => x.length));
  await page.click('.ch-lvl button[data-v="std"]'); await page.waitForTimeout(250);
  // konspekt
  await page.click('.ch-tools [data-act="konspekt"]'); await page.waitForTimeout(250);
  log('konspekt secs', await page.$$eval('.ksec', x => x.length), 'terms', await page.$$eval('.block .chip[data-act="gt"]', x => x.length));
  await shot(page, 'r-konspekt');
  await page.click('[data-act="back"]'); await page.waitForTimeout(250);
  log('back to', await page.evaluate(() => document.querySelector('.tb-name').textContent));
  // chapter lesson
  await page.click('.ch-tools [data-act="ch-lesson"]'); await page.waitForTimeout(1600);
  const lc = await page.evaluate(() => window.__sampleCalls[window.__sampleCalls.length - 1]);
  log('lesson prompt', Array.isArray(lc.input) ? lc.input[0].content.includes('Addım N/M') : lc.input.includes('Addım N/M'));
  await shot(page, 'r-lesson'); await page.click('.sheet-head [data-act="sheet-close"]');
  // section lesson chip
  await page.evaluate(() => document.querySelector('#c8s3 [data-mode="lesson"]').scrollIntoView({ block: 'center' }));
  await page.click('#c8s3 [data-mode="lesson"]'); await page.waitForTimeout(1500);
  const lc2 = await page.evaluate(() => window.__sampleCalls[window.__sampleCalls.length - 1]);
  const t2 = Array.isArray(lc2.input) ? lc2.input[0].content : lc2.input;
  log('sec lesson ctx has deep layer', t2.includes('<əlavə_qat>'), t2.length);
  await page.click('.sheet-head [data-act="sheet-close"]');
  // search deep hit
  await page.click('[data-act="search"]'); await page.waitForTimeout(150);
  await page.fill('#sq', 'stutter'); await page.waitForTimeout(250);
  log('search stutter', await page.$$eval('#sres button', b => b.map(x => x.querySelector('.w').textContent + ' | ' + x.dataset.lv).slice(0, 3)));
  await page.click('#sres button'); await page.waitForTimeout(500);
  log('opened sec', await page.evaluate(() => [document.querySelector('.tb-name').textContent, !!document.querySelector('#c17s6 details.deep[open]')]));
  await shot(page, 'r-search-deep');
  console.log('ERRORS', errors);
  await browser.close();
})();
