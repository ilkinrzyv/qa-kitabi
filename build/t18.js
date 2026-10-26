// Practice store (store.json): every test case is run through the UI. The status the store computes must equal the
// case's "result", the model answer must pass its own check, and typical mistakes must be caught.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const STORE = JSON.parse(fs.readFileSync(path.join(__dirname, 'store.json'), 'utf8'));
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
async function runSteps(page, sc) {
  for (const { on } of sc.steps) {
    if (on.ev === 'type') await page.fill(`#sm-dev [data-sm-f="${on.f}"]`, on.v !== undefined ? on.v : sc.data.find(d => d[0] === 'Last Name')[1]);
    else if (on.ev === 'sort') await page.selectOption('#sm-dev .sm-sort', on.v);
    else if (on.ev === 'cart') await page.click('#sm-dev .sm-cart');
    else await page.click(`#sm-dev [data-e="${on.ev}"]${on.item ? `[data-item="${on.item}"]` : ''}`);
    await page.waitForTimeout(40);
  }
}
async function check(page, answer, status, title) {
  await page.fill('[data-sm-ans]', answer);
  await page.click(`[data-act="sm-status"][data-v="${status}"]`);
  if (title !== undefined) await page.fill('[data-sm-title]', title);
  await page.click('[data-act="sm-check"]');
  return page.$eval('#sm-fb', el => ({
    ok: el.querySelectorAll('.sm-rows li .sm-ok').length, rows: el.querySelectorAll('.sm-rows li').length,
    status: (el.querySelector('.sm-st b') || {}).textContent, statusOk: !!el.querySelector('.sm-st.ok'), good: !!el.querySelector('.sm-good'),
    sw: [...el.querySelectorAll('.swc mark')].map(m => m.textContent), notes: [...el.querySelectorAll('.sm-note')].map(n => n.textContent),
    model: (el.querySelector('.sm-model p') || {}).textContent }));
}
(async () => {
  const out = { cases: {} }; const ERRORS = []; const bad = [];
  let { browser, page, errors } = await setup({ hash: '#magaza-tc01', w: 1024, h: 1300, wait: 1200 });
  for (const sc of STORE.scenarios) {
    await go(page, '#magaza-' + sc.id);
    await runSteps(page, sc);
    const snap = await page.$$eval('#sm-case .sm-state.ok', x => x.length);
    const sloppy = await check(page, 'Düzgün işləyir.', sc.result === 'Passed' ? 'Failed' : 'Passed');
    const truth = sloppy.status.replace('Status: ', '');
    const model = await check(page, sloppy.model, truth, sc.bug ? sc.bug.model : undefined);
    out.cases[sc.id] = { snap, truth, sloppy: `${sloppy.ok}/${sloppy.rows} ${sloppy.statusOk ? 'status ok' : 'status flagged'} sw:${sloppy.sw.join(',')}`, model: model.good };
    if (!snap || truth !== sc.result || sloppy.good || sloppy.statusOk || sloppy.ok || !sloppy.sw.length || !model.good) bad.push('case ' + sc.id);
  }
  await go(page, '#magaza-tc09'); await runSteps(page, STORE.scenarios.find(s => s.id === 'tc09'));
  await page.screenshot({ path: 'shots/store-tc09-1024.png', fullPage: true });
  // typical mistakes
  await go(page, '#magaza-tc06'); await runSteps(page, STORE.scenarios.find(s => s.id === 'tc06'));
  out.zeroBadge = await check(page, 'Your Cart səhifəsi açılır, səbət nişanında 0, Backpack siyahıdan silindi.', 'Passed');
  if (out.zeroBadge.good || !out.zeroBadge.notes.some(n => n.includes('0'))) bad.push('“nişanda 0” not caught');
  await go(page, '#magaza-tc09'); await runSteps(page, STORE.scenarios.find(s => s.id === 'tc09'));
  out.expectedAsActual = await check(page, 'Səbət nişanında 1 görünür, Bolt T-Shirt düyməsi Remove olur.', 'Failed', 'Bolt T-Shirt işləmir');
  if (out.expectedAsActual.good || !out.expectedAsActual.notes.length) bad.push('expected value written as actual not caught');
  out.titleCheck = await page.$eval('#sm-fb .sm-bug', el => ({ marks: [...el.querySelectorAll('.sm-rows li')].map(li => (li.querySelector('.sm-ok') ? '✓' : '✗') + li.querySelector('b').textContent).join(' '), sw: [...el.querySelectorAll('mark')].map(m => m.textContent) }));
  if (!out.titleCheck.sw.includes('işləmir') || !/✗Hansı şərtdə/.test(out.titleCheck.marks)) bad.push('bug title check');
  await page.screenshot({ path: 'shots/store-feedback-1024.png', fullPage: true });
  // an action that is not the next step spoils the run; restart clears it
  await go(page, '#magaza-tc04');
  await page.click('#sm-dev [data-e="add"][data-item="bikelight"]'); await page.waitForTimeout(80);
  out.offStep = await page.$$eval('#sm-case .sm-state.off', x => x.length);
  await page.click('[data-act="sm-restart"]'); await page.waitForTimeout(150);
  out.afterRestart = await page.$eval('#sm-case .sm-state', el => el.textContent.trim());
  if (!out.offStep || !/0\/1/.test(out.afterRestart)) bad.push('deviation / restart');
  // a login with other data is not counted (no spoiled run); Enter submits the form
  await go(page, '#magaza-tc01');
  await page.fill('#sm-dev [data-sm-f="user"]', 'standard_user'); await page.fill('#sm-dev [data-sm-f="pass"]', 'secret');
  await page.click('#sm-dev [data-e="login"]'); await page.waitForTimeout(80);
  out.typo = { off: await page.$$eval('#sm-case .sm-state.off', x => x.length), err: await page.$eval('#sm-dev .sm-err span', el => el.textContent) };
  await page.fill('#sm-dev [data-sm-f="pass"]', 'secret_sauce'); await page.press('#sm-dev [data-sm-f="pass"]', 'Enter'); await page.waitForTimeout(120);
  out.typo.after = { snap: await page.$$eval('#sm-case .sm-state.ok', x => x.length), title: await page.$eval('#sm-dev .sm-title', el => el.textContent) };
  if (out.typo.off || !out.typo.after.snap || out.typo.after.title !== 'Products') bad.push('login retry');
  // exploratory session: all four planted bugs of problem_user
  await go(page, '#magaza');
  await page.fill('#sm-dev [data-sm-f="user"]', 'problem_user'); await page.fill('#sm-dev [data-sm-f="pass"]', 'secret_sauce');
  await page.click('#sm-dev [data-e="login"]'); await page.waitForTimeout(60);
  await page.click('#sm-dev [data-e="add"][data-item="bolt"]'); await page.waitForTimeout(60);
  await page.selectOption('#sm-dev .sm-sort', 'hilo'); await page.waitForTimeout(60);
  await page.click('#sm-dev [data-e="add"][data-item="bikelight"]'); await page.waitForTimeout(60);
  await page.click('#sm-dev [data-e="remove"][data-item="bikelight"]'); await page.waitForTimeout(60);
  out.free = { badgeAfterRemove: await page.$eval('#sm-dev .sm-badge', el => el.textContent) };
  await page.click('#sm-dev .sm-cart'); await page.click('#sm-dev [data-e="checkout"]'); await page.waitForTimeout(60);
  await page.fill('#sm-dev [data-sm-f="last"]', 'Aliyev'); await page.waitForTimeout(60);
  out.free.fields = await page.$$eval('#sm-dev .sm-in', els => els.map(e => e.value).join('|'));
  out.free.found = await page.$eval('#sm-case .sm-state', el => el.querySelector('b').textContent);
  if (out.free.found !== '4/4' || out.free.badgeAfterRemove !== '1' || out.free.fields !== 'v||') bad.push('exploratory bugs');
  // entry points: a book section, the practice tab; Back returns to the section
  await go(page, '#c11s4');
  out.sectionLinks = await page.$$eval('#c11s4 .sm-link button', x => x.map(b => b.textContent.trim().slice(0, 5)));
  await page.click('#c11s4 .sm-link button >> nth=0'); await page.waitForTimeout(300);
  out.fromSection = await page.$eval('#sm-case .sm-id', el => el.textContent);
  await page.click('#topbar [data-act="back"]'); await page.waitForTimeout(400);
  out.backToSection = await page.$$eval('#c11s4', x => x.length);
  await go(page, '#mesq');
  out.practice = await page.$$eval('#view [data-act="sm-open"]', x => x.length);
  if (out.sectionLinks.length !== 5 || out.fromSection !== 'TC-02' || !out.backToSection || out.practice < 2) bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark
  ({ browser, page, errors } = await setup({ hash: '#magaza-tc11', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await runSteps(page, STORE.scenarios.find(s => s.id === 'tc11'));
  out.vagueTitle = await check(page, 'Checkout: Your Information səhifəsində qalır.', 'Failed', 'Checkout: Last Name sahəsi problem_user ilə');
  out.vagueTitle = await page.$eval('#sm-fb .sm-bug', el => [...el.querySelectorAll('.sm-rows li')].map(li => (li.querySelector('.sm-ok') ? '✓' : '✗') + li.querySelector('b').textContent).join(' '));
  if (out.vagueTitle !== '✓Harada ✗Nə baş verir ✓Hansı şərtdə') bad.push('vague bug title');
  await page.screenshot({ path: 'shots/store-tc11-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
