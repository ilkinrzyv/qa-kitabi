// ISTQB CTFL v4.0: the map links every syllabus topic to book sections and follows learned sections; the ten new sections
// (own ids such as c3x1) render with their depth layers, diagrams, glossary links and quiz questions; 21.9 links the map.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const CTFL = JSON.parse(fs.readFileSync(path.join(__dirname, 'ctfl.json'), 'utf8')).chapters;
const NEW = ['c1x1', 'c1x2', 'c3x1', 'c3x2', 'c4x1', 'c5x1', 'c6x1', 'c7x1', 'c11x1', 'c11x2'];
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(400));
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  // two sections already learned: the map shows them green
  const initDB = { 'data/users/u_test123/progress': { learned: { c11x1: 1, c8s3: 1 }, last: null, quiz: {}, _ts: Date.now() } };
  let { browser, page, errors } = await setup({ hash: '#istqb', w: 1024, h: 1300, wait: 1500, initDB });
  out.map = await page.$eval('#view', el => ({ chapters: el.querySelectorAll('.ctfl').length, topics: el.querySelectorAll('.ctfl-t').length,
    chips: el.querySelectorAll('.ctfl-s .chip').length, green: [...el.querySelectorAll('.ctfl-s .chip.pass')].map(c => c.textContent).join(','), fig: el.querySelector('.herofig .u').textContent }));
  const topics = CTFL.reduce((a, c) => a + c.topics.length, 0), chips = CTFL.reduce((a, c) => a + c.topics.reduce((b, t) => b + t.s.length, 0), 0);
  if (out.map.chapters !== 6 || out.map.topics !== topics || out.map.chips !== chips || out.map.green !== '8.3,11.9' || !out.map.fig.startsWith('2 / ')) bad.push('map');
  await page.screenshot({ path: 'shots/ctfl-1024.png', fullPage: true });
  // a topic chip opens its section
  await page.click('.ctfl-s .chip[data-sec="c11x2"]'); await page.waitForTimeout(500);
  out.opened = await page.$eval('#c11x2 .sec-h h2', el => el.textContent);
  if (out.opened !== 'Risklər və test prioritetləri') bad.push('chip → section');
  // every new section: its number, a depth layer, glossary links
  out.sections = {};
  for (const sid of NEW) {
    await go(page, '#' + sid);
    out.sections[sid] = await page.$eval('#' + sid, el => ({ num: el.querySelector('.sec-num').textContent, keys: el.querySelectorAll('.keys li').length,
      deep: !!el.querySelector('details.deep'), mini: !!el.querySelector('details.mini'), gt: el.querySelectorAll('.gt').length, fig: [...el.querySelectorAll('figure')].map(f => f.dataset.d).join(',') }));
    const s = out.sections[sid];
    if (s.keys !== 3 || !s.deep || !s.mini) bad.push('section ' + sid);
  }
  if (out.sections.c6x1.fig !== 'quadrants' || out.sections.c11x2.fig !== 'riskmatrix' || out.sections.c3x2.num !== '3.10' || out.sections.c11x2.num !== '11.10') bad.push('numbers / diagrams');
  // the new sections sit between their neighbours: 3.8 → 3.9 → 3.10 → pitfalls (old id c3s9 kept)
  await go(page, '#c3');
  out.order = await page.$$eval('#view .sec', els => els.slice(7, 11).map(e => e.id).join(','));
  if (out.order !== 'c3s8,c3x1,c3x2,c3s9') bad.push('order ' + out.order);
  // glossary: 109 terms, a new one with its interview line
  await go(page, '#luget');
  out.glossary = await page.$eval('#glcount', el => el.textContent);
  await page.fill('#glq', 'shift left'); await page.waitForTimeout(200);
  out.term = await page.$eval('#gllist .gl-item', el => ({ en: el.querySelector('.en').textContent, say: !!el.querySelector('.say-d') }));
  if (!out.glossary.startsWith('109 termin') || out.term.en !== 'Shift left' || !out.term.say) bad.push('glossary');
  // quiz: chapter 11 has the new questions
  await go(page, '#mesq');
  out.quiz11 = await page.$eval('[data-act="quiz"][data-ch="11"] .muted', el => el.textContent);
  out.mapCard = await page.$$eval('[data-act="ctfl-open"]', x => x.length);
  if (out.quiz11 !== '12 sual' || out.mapCard !== 1) bad.push('quiz / practice card');
  // 21.9 links the map
  await go(page, '#c21s9');
  await page.click('#c21s9 a[href="#istqb"]'); await page.waitForTimeout(500);
  out.link = await page.$eval('#topbar .tb-kicker', el => el.textContent);
  if (out.link !== 'ISTQB xəritəsi') bad.push('21.9 link');
  ERRORS.push(...errors); await browser.close();
  // phone, dark
  ({ browser, page, errors } = await setup({ hash: '#istqb', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.screenshot({ path: 'shots/ctfl-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  await go(page, '#c11x1');
  out.overflowSec = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflowSec > 0) bad.push('overflow 360 section');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
