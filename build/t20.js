// Full bug report (store.json "reports"): the model report of every planted bug passes all ten field checks, a sloppy
// one is caught field by field, the screenshot proves the bug only on its page, and the frequency must be reproduced.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const STORE = JSON.parse(fs.readFileSync(path.join(__dirname, 'store.json'), 'utf8'));
const sc = id => STORE.scenarios.find(s => s.id === id);
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
async function runSteps(page, s) {
  for (const { on } of s.steps) {
    if (on.ev === 'type') await page.fill(`#sm-dev [data-sm-f="${on.f}"]`, on.v !== undefined ? on.v : s.data.find(d => d[0] === 'Last Name')[1]);
    else if (on.ev === 'sort') await page.selectOption('#sm-dev .sm-sort', on.v);
    else if (on.ev === 'cart') await page.click('#sm-dev .sm-cart');
    else await page.click(`#sm-dev [data-e="${on.ev}"]${on.item ? `[data-item="${on.item}"]` : ''}`);
    await page.waitForTimeout(40);
  }
}
async function caseCheck(page, s) { // the scenario's own check with the model answer, so the report can be opened
  await page.fill('[data-sm-ans]', REPORT_ACT[s.id]);
  await page.click('[data-act="sm-status"][data-v="Failed"]');
  await page.fill('[data-sm-title]', s.bug.model);
  await page.click('[data-act="sm-check"]'); await page.waitForTimeout(80);
  return page.$$eval('#sm-fb .sm-good', x => x.length);
}
// what the screen shows after the last step (t18 checks these against the screen)
const REPORT_ACT = {
  tc09: 'Səbət nişanı görünmür, Bolt T-Shirt düyməsi «Add to cart» olaraq qalır.',
  tc10: 'Siyahıda birinci məhsul Backpack ($29.99) qalır.',
  tc11: 'Səhifə başlığı «Checkout: Your Information», xəta mesajı «Error: Last Name is required». First Name sahəsində «v», Last Name sahəsi boş.'
};
async function fill(page, f) {
  for (const [k, v] of Object.entries(f)) {
    const sel = `#br [data-br-f="${k}"]`;
    if (k === 'sev' || k === 'pri') await page.selectOption(sel, v); else await page.fill(sel, v);
  }
}
const modelFields = (m, freq, withAct) => Object.assign({ title: m.title, env: 'Windows 11, Chrome 141, Mini Store', sev: m.sev, pri: m.pri, pre: m.pre,
  steps: m.steps.map((x, i) => `${i + 1}) ${x}`).join('\n'), exp: m.exp, freq }, withAct ? { act: m.act } : {});
async function verdict(page) {
  await page.click('#br [data-act="br-check"]'); await page.waitForTimeout(80);
  return page.$eval('#br-fb', el => ({
    head: (el.querySelector('.sm-fb-h') || {}).textContent, good: !!el.querySelector('.sm-good'),
    rows: [...el.querySelectorAll('.sm-rows li')].map(li => (li.querySelector('.sm-ok') ? '✓' : '✗') + li.querySelector('b').textContent),
    notes: [...el.querySelectorAll('.sm-note')].map(n => n.textContent) }));
}
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  let { browser, ctx, page, errors } = await setup({ hash: '#magaza-tc09', w: 1024, h: 1300, wait: 1200 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => { });
  // TC-09: the button appears after a correct Failed check; the title carries over
  await runSteps(page, sc('tc09'));
  out.caseGood = await caseCheck(page, sc('tc09'));
  await page.click('#sm-fb [data-act="br-open"]'); await page.waitForTimeout(250);
  out.form = await page.$$eval('#br [data-br-f]', els => els.map(e => e.dataset.brF).join(','));
  out.titleCarried = await page.$eval('#br [data-br-f="title"]', e => e.value === document.querySelector('[data-sm-title]').value);
  out.actReadOnly = await page.$eval('#br .br-ro', e => e.textContent.trim().slice(0, 20));
  if (!out.caseGood || out.form !== 'title,env,sev,pri,pre,steps,exp,freq' || !out.titleCarried || !out.actReadOnly.startsWith('Səbət')) bad.push('open from TC-09');
  // a sloppy report: every weak field is named
  await fill(page, { env: 'kompüter', sev: 'Trivial', pri: 'Low', pre: 'Səhifə açıqdır.', steps: 'Nəsə bas', exp: 'İşləməlidir', freq: '5/5' });
  out.sloppy = await verdict(page);
  const want = '✓Başlıq (Summary) ✗Mühit (Environment) ✗Severity ✗Priority (təklif) ✗İlkin şərtlər ✗Təkrarlama addımları ✗Gözlənilən nəticə ✓Faktiki nəticə ✗Təkrarlanma tezliyi ✗Əlavələr (sübut)';
  if (out.sloppy.rows.join(' ') !== want || out.sloppy.good || !out.sloppy.notes.some(n => n.includes('1 dəfə baş verdi'))) bad.push('sloppy report: ' + out.sloppy.rows.join(' '));
  // the screenshot proves the bug only on its page
  await page.click('#sm-dev .sm-cart'); await page.waitForTimeout(60);
  await page.click('#br [data-act="br-shot"]'); await page.waitForTimeout(120);
  out.shotOnCart = await page.$$eval('#br .br-shot.bad', x => x.length);
  await page.click('#sm-dev [data-e="shop"]'); await page.waitForTimeout(60);
  await page.click('#br [data-act="br-shot"]'); await page.waitForTimeout(120);
  out.shotOnProducts = await page.$$eval('#br .br-shot:not(.bad) .br-shot-img .sm-dev', x => x.length);
  if (out.shotOnCart !== 1 || out.shotOnProducts !== 1) bad.push('screenshot evidence');
  // reproduce twice more (restart keeps the report), then the model report passes all ten checks
  for (let k = 0; k < 2; k++) {
    await page.click('[data-act="sm-restart"]'); await page.waitForTimeout(150);
    await runSteps(page, sc('tc09'));
  }
  out.keptAfterRestart = await page.$eval('#br [data-br-f="pre"]', e => e.value);
  await caseCheck(page, sc('tc09'));
  await page.click('#br [data-act="br-shot"]'); await page.waitForTimeout(120);
  await fill(page, modelFields(STORE.reports.add.model, '3/3'));
  out.model = await verdict(page);
  if (out.keptAfterRestart !== 'Səhifə açıqdır.' || !out.model.good || out.model.head !== 'Hesabat yoxlandı: 10/10 sahə qaydasındadır') bad.push('model report add: ' + out.model.rows.join(' '));
  await page.click('#br [data-act="br-copy"]'); await page.waitForTimeout(150);
  out.md = await page.evaluate(() => navigator.clipboard.readText().catch(() => '')).catch(() => '');
  if (out.md && !(out.md.startsWith('| Sahə | Dəyər |') && out.md.includes('| Severity | Critical |') && out.md.includes('| Addımlar | 1) Bolt T-Shirt'))) bad.push('markdown');
  out.md = out.md ? out.md.split('\n').length + ' lines' : 'clipboard unavailable';
  await page.click('#br details.br-model summary'); await page.waitForTimeout(80);
  await page.screenshot({ path: 'shots/bugreport-tc09-1024.png', fullPage: true });
  // TC-10 and TC-11: model reports pass too (one reproduction, 1/1)
  for (const id of ['tc10', 'tc11']) {
    await go(page, '#magaza-' + id); await runSteps(page, sc(id)); await caseCheck(page, sc(id));
    await page.click('#sm-fb [data-act="br-open"]'); await page.waitForTimeout(200);
    await page.click('#br [data-act="br-shot"]'); await page.waitForTimeout(100);
    await fill(page, modelFields(STORE.reports[sc(id).bug.r].model, '1/1'));
    const v = await verdict(page);
    out[id] = v.head;
    if (!v.good) bad.push(`model report ${id}: ${v.rows.join(' ')}`);
  }
  // exploratory session: a found bug gets its own report with a written actual result
  await go(page, '#magaza');
  await page.fill('#sm-dev [data-sm-f="user"]', 'problem_user'); await page.fill('#sm-dev [data-sm-f="pass"]', 'secret_sauce');
  await page.click('#sm-dev [data-e="login"]'); await page.waitForTimeout(60);
  await page.click('#sm-dev [data-e="add"][data-item="bikelight"]'); await page.waitForTimeout(60);
  await page.click('#sm-dev [data-e="remove"][data-item="bikelight"]'); await page.waitForTimeout(60);
  out.freeButtons = await page.$$eval('#sm-case .sm-found [data-act="br-open"]', x => x.map(b => b.dataset.b).join(','));
  await page.click('#sm-case [data-act="br-open"][data-b="remove"]'); await page.waitForTimeout(200);
  out.freeForm = await page.$$eval('#br [data-br-f]', els => els.map(e => e.dataset.brF).join(','));
  await page.click('#br [data-act="br-shot"]'); await page.waitForTimeout(100);
  await fill(page, Object.assign(modelFields(STORE.reports.remove.model, '1/1', true), { act: 'Düymə işləmir, normaldır.' }));
  out.freeOpinion = await verdict(page);
  await fill(page, { act: STORE.reports.remove.model.act });
  out.free = await verdict(page);
  // bugs found while running the test cases count here too: the session is one exploration
  if (!out.freeButtons.split(',').includes('remove') || !out.freeForm.includes('act') || out.freeOpinion.good || !out.free.good) bad.push('exploratory report: ' + out.free.rows.join(' '));
  await page.click('#br [data-act="br-close"]'); await page.waitForTimeout(80);
  out.afterClose = { form: await page.$$eval('#br .br', x => x.length), remove: await page.$$eval('#sm-case [data-act="br-open"][data-b="remove"]', x => x.length) };
  if (out.afterClose.form || out.afterClose.remove !== 1) bad.push('close');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: the form fits
  ({ browser, page, errors } = await setup({ hash: '#magaza-tc11', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await runSteps(page, sc('tc11')); await caseCheck(page, sc('tc11'));
  await page.click('#sm-fb [data-act="br-open"]'); await page.waitForTimeout(250);
  await page.click('#br [data-act="br-shot"]'); await page.waitForTimeout(100);
  await page.click('#br [data-act="br-check"]'); await page.waitForTimeout(80);
  await page.screenshot({ path: 'shots/bugreport-tc11-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
