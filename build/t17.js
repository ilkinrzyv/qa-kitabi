// Summary sheets: content, entry points, print flow (and its fallback when print() is ignored), one A4 page per chapter.
const fs = require('fs');
const { setup } = require('./harness');
const pdfPages = file => (fs.readFileSync(file, 'latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
(async () => {
  const out = {}; const ERRORS = [];
  let { browser, page, errors } = await setup({ hash: '#c8-xulase', w: 1024, h: 1100, wait: 1200 });
  const counts = () => page.$eval('.sum', el => ({
    ideas: el.querySelectorAll('.sum-ideas li').length, dg: el.querySelectorAll('.sum-dg figure svg').length,
    pit: el.querySelectorAll('.sum-pit li').length, self: el.querySelectorAll('.sum-self li').length, terms: el.querySelectorAll('.sum-terms li').length,
    title: el.querySelector('.sum-t').textContent, shape: el.className }));
  out.c8 = await counts();
  await page.screenshot({ path: 'shots/sum-c8-1024.png', fullPage: true });
  // print opens: the sheet gets its A4 layout for the print and loses it afterwards; no help sheet
  await page.evaluate(() => { window.__printed = []; window.print = () => { window.__printed.push([...document.querySelectorAll('.sum')].map(e => e.classList.contains('paper') && e.dataset.k)); window.dispatchEvent(new Event('beforeprint')); window.dispatchEvent(new Event('afterprint')); }; });
  await page.click('.sum-bar [data-act="sum-print"]'); await page.waitForTimeout(1500);
  out.printOk = await page.evaluate(() => ({ calls: window.__printed, paperLeft: document.querySelectorAll('.sum.paper').length, help: !!document.querySelector('.sheet') }));
  // print ignored (sandboxed frame): help sheet with a link to the same sheet in the offline app
  await page.evaluate(() => { window.print = () => { }; });
  await page.click('#topbar [data-act="sum-print"]'); await page.waitForTimeout(1500);
  out.printBlocked = await page.evaluate(() => { const s = document.querySelector('.sheet'); return s && { title: s.querySelector('h3').textContent, link: (s.querySelector('a[href]') || {}).href || null, paperLeft: document.querySelectorAll('.sum.paper').length }; });
  await page.click('.sheet [data-act="sheet-close"] >> nth=0');
  // next sheet replaces the current one, Back returns to where the sheet was opened from
  await page.click('.sum-nav .next'); await page.waitForTimeout(300);
  out.next = await page.$eval('.sum-t', el => el.textContent);
  // entry points: reader tools, chapter end, konspekt, practice tab
  await page.evaluate(() => { location.hash = '#c13'; }); await page.waitForTimeout(900);
  out.entries = { tools: await page.$$eval('.ch-tools [data-act="sum"]', x => x.length), end: await page.$$eval('.ch-end [data-act="sum"]', x => x.length) };
  await page.click('.ch-tools [data-act="sum"]'); await page.waitForTimeout(400);
  out.fromReader = { view: await page.$eval('.sum', el => el.dataset.ch), c13: await counts() };
  await page.click('#topbar [data-act="back"]'); await page.waitForTimeout(400);
  out.backToReader = await page.$$eval('.ch-tools', x => x.length);
  await page.click('.ch-tools [data-act="konspekt"]'); await page.waitForTimeout(300);
  out.entries.konspekt = await page.$$eval('#view [data-act="sum"]', x => x.length);
  await page.evaluate(() => { location.hash = '#mesq'; }); await page.waitForTimeout(700);
  out.entries.practice = await page.$$eval('.sum-grid .qcell', x => x.length);
  await page.click('[data-act="sum"][data-ch="all"]'); await page.waitForTimeout(800);
  // every chapter: fit to one A4 page, then a real PDF from Chromium's print layout
  out.all = await page.$$eval('.sum', x => x.length);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const fit = await page.$$eval('.sum', els => els.map(e => ({ ch: e.dataset.ch, k: +e.dataset.k, mm: Math.round(e.offsetHeight * 25.4 / 96) })));
  out.fitMinK = Math.min(...fit.map(f => f.k));
  out.scaled = fit.filter(f => f.k < 1).map(f => `${f.ch}:${f.k}`);
  out.tallest = fit.reduce((a, b) => (b.mm > a.mm ? b : a));
  await page.evaluate(() => { window.__pp = []; ['beforeprint', 'afterprint'].forEach(t => window.addEventListener(t, () => window.__pp.push(t + ':' + document.querySelectorAll('.sum.paper').length))); });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: 'shots/sum-all.pdf', preferCSSPageSize: true, printBackground: true });
  out.pdfPages = pdfPages('shots/sum-all.pdf');
  out.pdfEvents = await page.evaluate(() => window.__pp); // Chromium's PDF printing fires before/afterprint around the job
  // print-layout pictures of a few different sheets
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  for (const ch of ['c8', 'c12', 'c13', 'c6', 'c21']) await page.locator(`.sum[data-ch="${ch}"]`).screenshot({ path: `shots/sum-print-${ch}.png` });
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  ERRORS.push(...errors); await browser.close();
  // phone, dark: the screen layout must not scroll sideways
  ({ browser, page, errors } = await setup({ hash: '#c12-xulase', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.screenshot({ path: 'shots/sum-c12-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...errors); await browser.close();
  const bad = [];
  if (out.c8.ideas !== 5 || out.c8.dg !== 1 || out.c8.self !== 4) bad.push('c8 content');
  if (out.printOk.calls.length !== 1 || !out.printOk.calls[0][0] || out.printOk.paperLeft || out.printOk.help) bad.push('print flow');
  if (!out.printBlocked || !/github\.io\/qa-kitabi\/#c8-xulase$/.test(out.printBlocked.link || '') || out.printBlocked.paperLeft) bad.push('blocked print fallback');
  if (out.all !== 21 || out.pdfPages !== 21) bad.push('one page per chapter');
  if (out.fitMinK < 0.8) bad.push('text shrunk too much');
  if (out.overflow360 > 0) bad.push('overflow 360');
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
