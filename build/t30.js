// Answer key (build/answers): every exercise of the book has a model answer and criteria (a hint for tasks and mini-tasks).
// The offline flow: a hint, the attempt reminder on an empty answer, the answer, ticking criteria, saved across a reload,
// and all of it with Claude switched off.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
const boxOf = (page, id) => page.$eval(`[data-ansbox="${id}"]`, e => e.innerText.replace(/\s+/g, ' ').trim());
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  // the data: nothing is missing, nothing is empty
  const B = JSON.parse(fs.readFileSync(path.join(__dirname, 'book.json'), 'utf8'));
  const all = [];
  B.chapters.forEach(c => c.sections.forEach(s => {
    (s.tasks || []).forEach(t => all.push(['task', t.id, t.ans]));
    if (s.kind === 'selfcheck') s.items.forEach(q => all.push(['self', q.id, q.ans]));
    if (s.x && s.x.ex) all.push(['try', s.x.ex.id, s.x.ex.ans]);
  }));
  out.exercises = all.length;
  out.noAnswer = all.filter(x => !x[2]).map(x => x[1]);
  out.badCriteria = all.filter(x => x[2] && !(x[2].c.length >= 2 && x[2].c.length <= 5)).map(x => x[1]);
  out.noHint = all.filter(x => x[2] && x[0] !== 'self' && !x[2].h).map(x => x[1]);
  out.selfHint = all.filter(x => x[2] && x[0] === 'self' && x[2].h).map(x => x[1]);
  if (out.noAnswer.length || out.badCriteria.length || out.noHint.length || out.selfHint.length) bad.push('answer data');
  // Claude off: the buttons are there, the Claude ones are not (no window.claude in this run)
  let { browser, page, errors } = await setup({ hash: '#c8s9', w: 1024, h: 1100, mock: false, wait: 1400 });
  await page.evaluate(() => document.getElementById('c8t1').scrollIntoView({ block: 'center' })); await page.waitForTimeout(200);
  out.off = await page.evaluate(() => {
    const v = e => !!(e && (e.offsetWidth || e.offsetHeight));
    return { ai: document.documentElement.getAttribute('data-ai'), hint: v(document.querySelector('[data-act="ans-hint"][data-id="c8t1"]')), show: v(document.querySelector('[data-act="ans-show"][data-id="c8t1"]')), claude: v(document.querySelector('[data-act="task-check"][data-task="c8t1"]')) };
  });
  if (out.off.ai === 'on' || !out.off.hint || !out.off.show || out.off.claude) bad.push('buttons without Claude');
  // the hint opens and closes
  await page.click('[data-act="ans-hint"][data-id="c8t1"]'); await page.waitForTimeout(80);
  out.hint = await boxOf(page, 'c8t1');
  if (!out.hint.length) bad.push('hint');
  await page.click('[data-act="ans-hint"][data-id="c8t1"]'); await page.waitForTimeout(80);
  // an empty answer: a reminder first, the answer on the second press
  await page.click('[data-act="ans-show"][data-id="c8t1"]'); await page.waitForTimeout(80);
  out.nudge = await boxOf(page, 'c8t1');
  out.nudgeFocus = await page.evaluate(() => document.activeElement && document.activeElement.dataset.ans);
  if (!out.nudge.includes('Əvvəlcə özün yaz') || out.nudgeFocus !== 'c8t1' || await page.$('[data-ansbox="c8t1"] .ans')) bad.push('attempt reminder');
  await page.click('[data-act="ans-show"][data-id="c8t1"]'); await page.waitForTimeout(80);
  out.opened = { answer: !!(await page.$('[data-ansbox="c8t1"] .ans .prose')), crit: await page.$$eval('[data-ansbox="c8t1"] [data-crit]', x => x.length), btn: await page.$eval('[data-act="ans-show"][data-id="c8t1"]', e => e.textContent.trim()) };
  if (!out.opened.answer || out.opened.crit < 2 || out.opened.btn !== 'Cavabı gizlət') bad.push('answer opens');
  await page.screenshot({ path: 'shots/answer-task-1024.png' });
  // ticking every criterion marks the task done, and the marks survive a reload
  const n = out.opened.crit;
  for (let i = 0; i < n; i++) await page.click(`[data-crit="c8t1"][data-i="${i}"]`);
  await page.waitForTimeout(100);
  out.ticked = await page.evaluate(() => ({ line: document.querySelector('[data-critn="c8t1"]').textContent, done: document.getElementById('c8t1').classList.contains('done') }));
  if (out.ticked.line !== `${n}/${n} meyar ödənilib` || !out.ticked.done) bad.push('criteria');
  await page.click('[data-crit="c8t1"][data-i="0"]'); await page.waitForTimeout(60);
  if (await page.evaluate(() => document.getElementById('c8t1').classList.contains('done'))) bad.push('criteria undo');
  await page.click('[data-crit="c8t1"][data-i="0"]'); await page.waitForTimeout(900);
  await page.reload(); await page.waitForTimeout(1500);
  out.afterReload = await page.evaluate(() => ({ open: !!document.querySelector('[data-ansbox="c8t1"] .ans'), checked: document.querySelectorAll('[data-crit="c8t1"]:checked').length, done: document.getElementById('c8t1').classList.contains('done') }));
  if (!out.afterReload.open || out.afterReload.checked !== n || !out.afterReload.done) bad.push('saved across a reload');
  // a written answer opens at once; hiding works; the mini-task and the self-check follow the same flow
  await go(page, '#c8s3');
  const mini = 'c8s3m';
  await page.evaluate(id => { const d = document.querySelector(`[data-mini="${id}"]`); d.open = true; d.scrollIntoView({ block: 'center' }); }, mini); await page.waitForTimeout(150);
  await page.fill(`[data-ans="${mini}"]`, 'Mənim cavabım'); await page.waitForTimeout(60);
  await page.click(`[data-act="ans-show"][data-id="${mini}"]`); await page.waitForTimeout(80);
  out.miniOpen = !!(await page.$(`[data-ansbox="${mini}"] .ans`));
  await page.click(`[data-act="ans-show"][data-id="${mini}"]`); await page.waitForTimeout(80);
  out.miniHidden = !(await page.$(`[data-ansbox="${mini}"] .ans`));
  if (!out.miniOpen || !out.miniHidden) bad.push('mini-task');
  await go(page, '#c8s10'); await page.evaluate(() => document.getElementById('c8q1').scrollIntoView({ block: 'center' }));
  out.selfBtns = await page.$$eval('#c8q1 .task-ctrl button', x => x.filter(b => b.offsetWidth).map(b => b.textContent.trim()));
  await page.fill('[data-ans="c8q1"]', 'Bir sinifdən bir dəyər'); await page.click('[data-act="ans-show"][data-id="c8q1"]'); await page.waitForTimeout(80);
  out.selfOpen = !!(await page.$('[data-ansbox="c8q1"] .ans'));
  if (out.selfBtns.join() !== 'Cavabı göstər' || !out.selfOpen) bad.push('self-check');
  ERRORS.push(...errors); await browser.close();
  // Claude on: its buttons stay, beside the answer key
  ({ browser, page, errors } = await setup({ hash: '#c8s9', w: 1024, h: 1100, wait: 1400 }));
  out.on = await page.$$eval('#c8t2 .task-ctrl button', x => x.filter(b => b.offsetWidth).map(b => b.textContent.trim()));
  if (out.on.join() !== 'İpucu,Cavabı göstər,Claude ipucu,Yoxla') bad.push('buttons with Claude');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: a long answer with a table fits
  ({ browser, page, errors } = await setup({ hash: '#c8s9', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.evaluate(() => document.querySelector('[data-ans="c8t3"]').scrollIntoView({ block: 'center' }));
  await page.fill('[data-ans="c8t3"]', 'Cavab'); await page.click('[data-act="ans-show"][data-id="c8t3"]'); await page.waitForTimeout(120);
  await page.evaluate(() => document.querySelector('[data-ansbox="c8t3"]').scrollIntoView({ block: 'start' })); await page.waitForTimeout(80);
  await page.screenshot({ path: 'shots/answer-task-360-dark.png' });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
