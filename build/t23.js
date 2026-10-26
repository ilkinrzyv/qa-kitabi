// Mock exam: 40 questions from chapters 1–12 in the book's order, 60 minutes, no verdict until the end, flags, keyboard,
// a reload continues the running exam, the clock ends it, results by chapter and the review of wrong answers.
const { setup } = require('./harness');
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
const run = page => page.evaluate(() => JSON.parse(localStorage.getItem('qa-kitab:v1:progress') || '{}'));
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  let { browser, page, errors } = await setup({ hash: '#imtahan', w: 1024, h: 1300, wait: 1200 });
  const QUIZ = await page.evaluate(() => JSON.parse(document.getElementById('book-data').textContent).quizzes);
  const ans = {}; Object.values(QUIZ).forEach(list => list.forEach(q => { ans[q.id] = q.a; }));
  out.start = await page.$eval('#view', el => ({ rules: el.querySelectorAll('.exam-list li').length, modes: el.querySelectorAll('[data-act="exam-mode"]').length }));
  await page.click('[data-act="exam-start"]'); await page.waitForTimeout(300);
  let p = await run(page);
  const chs = p.examRun.ids.map(id => +id.match(/^q(\d+)-/)[1]);
  out.dist = { n: p.examRun.ids.length, unique: new Set(p.examRun.ids).size, chapters: [...new Set(chs)].join(','), sorted: chs.every((c, i) => !i || chs[i - 1] <= c) };
  out.screen = await page.$eval('#view', el => ({ nav: el.querySelectorAll('.exam-nav button').length, timer: el.querySelector('#exam-timer').textContent, opts: el.querySelectorAll('.opt').length }));
  if (out.dist.n !== 40 || out.dist.unique !== 40 || out.dist.chapters !== '1,2,3,4,5,6,7,8,9,10,11,12' || !out.dist.sorted || out.screen.nav !== 40 || !/^(60:00|59:5\d)$/.test(out.screen.timer)) bad.push('start / distribution');
  // answer: 30 right, 6 wrong, 4 left open; no verdict is shown while answering
  const pick = async (k, right) => {
    const id = p.examRun.ids[k];
    const o = right ? ans[id] : (ans[id] + 1) % 4;
    await page.click(`[data-act="exam-pick"][data-o="${o}"]`);
  };
  for (let k = 0; k < 20; k++) { await pick(k, true); await page.click('[data-act="exam-step"][data-d="1"]'); }
  out.noVerdict = await page.$$eval('.opt.right, .opt.wrong, .qz-ex', x => x.length);
  // a reload continues the exam with its answers
  await page.reload(); await page.waitForTimeout(1000); await go(page, '#imtahan');
  out.resume = await page.$eval('.cont .s', el => el.textContent);
  await page.click('[data-act="exam-go"]'); await page.waitForTimeout(300);
  out.resumeAt = await page.$eval('#view .kicker', el => el.textContent);
  p = await run(page);
  for (let k = 20; k < 36; k++) {
    if (k < 30) await pick(k, true); else {
      // keyboard: the letter of a wrong option
      const id = p.examRun.ids[k], perm = p.examRun.perm[k], wrongPos = perm.findIndex(o => o !== ans[id]);
      await page.keyboard.press('abcd'[wrongPos]); await page.waitForTimeout(40);
    }
    if (k === 33) { await page.keyboard.press('f'); await page.waitForTimeout(40); }
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(40);
  }
  out.navState = await page.$eval('.exam-nav', el => ({ ans: el.querySelectorAll('.ans').length, flag: el.querySelectorAll('.flag').length }));
  if (out.noVerdict || out.resume !== '20/40 cavab' || !out.resumeAt.startsWith('Sual 21 / 40') || out.navState.ans !== 36 || out.navState.flag !== 1) bad.push('answering / resume');
  // finish: the confirmation names open and flagged questions
  await page.click('[data-act="exam-end"] >> nth=-1'); await page.waitForTimeout(300);
  out.confirm = await page.$eval('.sheet .sheet-body p', el => el.textContent);
  await page.click('[data-act="confirm-ok"]'); await page.waitForTimeout(400);
  out.result = await page.$eval('#view', el => ({ big: el.querySelector('.big').textContent, chip: el.querySelector('.result .chip').textContent,
    chapters: el.querySelectorAll('.exam-ch').length, reviewed: el.querySelectorAll('.exam-rev').length, unanswered: [...el.querySelectorAll('.exam-a.no')].filter(x => x.textContent.includes('Cavab verilməyib')).length }));
  await page.click('[data-act="exam-all"]'); await page.waitForTimeout(200);
  out.all = await page.$$eval('.exam-rev', x => x.length);
  if (!out.confirm.startsWith('4 sual cavabsızdır, 1 sual işarəlidir') || out.result.big !== '30/40' || out.result.chip !== 'PASS · 75%' || out.result.chapters !== 12
    || out.result.reviewed !== 10 || out.result.unanswered !== 4 || out.all !== 40) bad.push('result');
  await page.screenshot({ path: 'shots/exam-result-1024.png', fullPage: true });
  // the clock: 4 minutes left shows the warning, an expired exam ends by itself (also after a reload)
  await page.click('[data-act="exam-new"]'); await page.waitForTimeout(200);
  await page.click('[data-act="exam-mode"][data-v="all"]'); await page.click('[data-act="exam-start"]'); await page.waitForTimeout(300);
  out.allChapters = new Set((await run(page)).examRun.ids.map(id => +id.match(/^q(\d+)-/)[1])).size;
  await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('qa-kitab:v1:progress')); p.examRun.start = Date.now() - 56 * 60000; localStorage.setItem('qa-kitab:v1:progress', JSON.stringify(p)); });
  await page.reload(); await page.waitForTimeout(1000); await go(page, '#imtahan'); await page.click('[data-act="exam-go"]'); await page.waitForTimeout(1300);
  out.warn = await page.$$eval('.exam-time.warn', x => x.length);
  await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('qa-kitab:v1:progress')); p.examRun.start = Date.now() - 61 * 60000; localStorage.setItem('qa-kitab:v1:progress', JSON.stringify(p)); });
  await page.reload(); await page.waitForTimeout(1000); await go(page, '#imtahan');
  p = await run(page);
  out.expired = { done: p.examRun.done, history: p.exams.length, last: `${p.exams[0].ok}/${p.exams[0].n}`, ms: p.exams[0].ms };
  if (out.allChapters !== 21 || out.warn !== 1 || !out.expired.done || out.expired.history !== 2 || out.expired.ms !== 3600000) bad.push('clock');
  // entry points
  await go(page, '#mesq');
  out.practice = await page.$eval('[data-act="exam-open"]', el => el.textContent.replace(/\s+/g, ' ').trim());
  await go(page, '#progress');
  out.progress = await page.$eval('[data-act="exam-open"]', el => el.textContent.replace(/\s+/g, ' ').trim());
  if (!out.practice.startsWith('40 sual · 60 dəqiqə') || !out.progress.startsWith('Son: 0/40 · ən yaxşı: 30/40')) bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark
  ({ browser, page, errors } = await setup({ hash: '#imtahan', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.click('[data-act="exam-start"]'); await page.waitForTimeout(300);
  await page.click('[data-act="exam-pick"] >> nth=1'); await page.waitForTimeout(100);
  await page.screenshot({ path: 'shots/exam-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
