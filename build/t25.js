// Release test (store.json "release"): build 1.1 of the practice store. Every test case's status on build 1.1 matches
// the release data (fixes Verified / Reopened, the regression only in TC-06); the four stages unlock in order; the
// retest mapping, the regression plan and the recommendation are checked; the regression gets a full bug report;
// build 1.0 stays as it was.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const STORE = JSON.parse(fs.readFileSync(path.join(__dirname, 'store.json'), 'utf8'));
const REL = STORE.release;
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
async function check(page, answer, status, title) {
  await page.fill('[data-sm-ans]', answer);
  await page.click(`[data-act="sm-status"][data-v="${status}"]`);
  if (title !== undefined) await page.fill('[data-sm-title]', title);
  await page.click('[data-act="sm-check"]');
  return page.$eval('#sm-fb', el => ({ status: (el.querySelector('.sm-st b') || {}).textContent, good: !!el.querySelector('.sm-good'),
    model: (el.querySelector('.sm-model p') || {}).textContent, bugRows: [...el.querySelectorAll('.sm-bug .sm-rows li')].map(li => (li.querySelector('.sm-ok') ? '✓' : '✗') + li.querySelector('b').textContent).join(' ') }));
}
// the steps, then a sloppy answer shows what the screen had; that text with the true status is the model run
async function runCase(page, id) {
  await runSteps(page, sc(id));
  const sloppy = await check(page, 'Düzgün işləyir.', 'Passed');
  const truth = sloppy.status.replace('Status: ', '');
  const bug = truth === 'Failed' ? REL.bugs[id] || sc(id).bug : null;
  const model = await check(page, sloppy.model, truth, bug ? bug.model : undefined);
  return { truth, good: model.good, bugRows: model.bugRows };
}
async function fromPanel(page, stage, id) { // Run in the panel → the store on build 1.1 → back to the panel
  await page.click(`#rel-${stage} [data-act="rel-run"][data-sc="${id}"]`); await page.waitForTimeout(300);
  const at = { ver: await page.$eval('#sm-dev .sm-ver', e => e.textContent).catch(() => ''), id: await page.$eval('#sm-case .sm-id', e => e.textContent) };
  const r = await runCase(page, id);
  await page.click('[data-act="rel-open"]'); await page.waitForTimeout(300);
  return Object.assign(r, at);
}
const marks = (page, sel) => page.$$eval(sel, els => els.map(e => e.querySelector('.sm-ok') ? '✓' : e.querySelector('.sm-no') ? '✗' : '·').join(''));
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  let { browser, ctx, page, errors } = await setup({ hash: '#reliz', w: 1024, h: 1300, wait: 1200 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => { });
  // 1. the data tells the truth: every test case on build 1.1
  const want = id => { const t = REL.tickets.find(x => x.tc === id); return t ? (t.verdict === 'Verified' ? 'Passed' : 'Failed') : REL.bugs[id] ? 'Failed' : 'Passed'; };
  out.truth = {};
  for (const s of STORE.scenarios) {
    await go(page, '#reliz-' + s.id);
    const r = await runCase(page, s.id);
    out.truth[s.id] = r.truth + (r.good ? '' : ' (model answer not good)');
    if (r.truth !== want(s.id) || !r.good) bad.push(`truth on 1.1 ${s.id}: ${r.truth}, want ${want(s.id)}, good ${r.good}`);
  }
  out.regressionTitle = (await (async () => { await go(page, '#reliz-tc06'); await runSteps(page, sc('tc06')); return (await check(page, 'Backpack səbət siyahısında var, səbət nişanında 1.', 'Failed', 'Düymə işləmir')).bugRows; })());
  if (out.regressionTitle !== '✗Harada ✗Nə baş verir ✗Hansı şərtdə') bad.push('regression bug title check: ' + out.regressionTitle);
  // 2. the panel, reset after step 1's runs: the release notes, later stages locked
  await go(page, '#reliz');
  await page.click('[data-act="rel-reset"]'); await page.waitForTimeout(150); await page.click('[data-act="confirm-ok"]'); await page.waitForTimeout(250);
  out.locked = await page.$$eval('.rel-st .rel-lock', x => x.length);
  out.notes = await page.$$eval('.rel-notes li', x => x.length);
  if (out.locked !== 3 || out.notes !== REL.tickets.length + REL.deferred.length) bad.push('panel start');
  // 3. smoke
  out.smoke = [];
  for (const id of REL.smoke) { const r = await fromPanel(page, 1, id); out.smoke.push(`${id}:${r.truth}:${r.ver}`); if (r.ver !== REL.ver || !r.id.includes('Smoke')) bad.push('smoke run in 1.1 ' + id); }
  out.smokeDone = await page.$eval('#rel-1', e => e.classList.contains('done') && !!e.querySelector('.sm-state.ok'));
  out.retestOpen = await page.$$eval('#rel-2 .rel-lock', x => x.length);
  if (!out.smokeDone || out.retestOpen) bad.push('smoke stage');
  // 4. retest: a wrong test case for MS-12 is corrected; the run buttons use the right ones
  await page.click('#rel-2 [data-act="rel-map"]'); await page.waitForTimeout(80);
  out.mapEmpty = await page.$$eval('#rel-2 .sm-st', x => x.length);
  for (const t of REL.tickets) await page.selectOption(`[data-rel-map="${t.bug}"]`, t.bug === 'add' ? 'tc04' : t.tc);
  await page.click('#rel-2 [data-act="rel-map"]'); await page.waitForTimeout(150);
  out.map = await marks(page, '#rel-2 .rel-tk > .sm-st');
  out.mapLocked = await page.$$eval('#rel-2 [data-rel-map]', els => els.every(e => e.disabled));
  out.verdictDisabled = await page.$$eval('#rel-2 [data-act="rel-verdict"]', els => els.every(e => e.disabled));
  if (out.mapEmpty || out.map !== '✗✓✓' || !out.mapLocked || !out.verdictDisabled) bad.push(`retest mapping ${out.map}`);
  out.retest = [];
  for (const t of REL.tickets) { const r = await fromPanel(page, 2, t.tc); out.retest.push(`${t.key}:${r.truth}`); if (!r.id.includes('Retest ' + t.key)) bad.push('retest role ' + t.key); }
  const reopen = REL.tickets.find(t => t.verdict === 'Reopened');
  await page.click(`[data-act="rel-verdict"][data-b="${reopen.bug}"][data-v="Verified"]`); await page.waitForTimeout(120);
  out.wrongVerdict = await page.$eval(`#rel-2 .rel-tk:nth-child(${REL.tickets.indexOf(reopen) + 1})`, e => [...e.querySelectorAll(':scope > .sm-st')].pop().className);
  for (const t of REL.tickets) { await page.click(`[data-act="rel-verdict"][data-b="${t.bug}"][data-v="${t.verdict}"]`); await page.waitForTimeout(100); }
  out.verdicts = await page.$$eval('#rel-2 .rel-tk', els => els.map(e => [...e.querySelectorAll(':scope > .sm-st')].pop().classList.contains('ok') ? '✓' : '✗').join(''));
  out.retestDone = await page.$eval('#rel-2', e => e.classList.contains('done'));
  if (!out.wrongVerdict.includes('no') || out.verdicts !== '✓✓✓' || !out.retestDone) bad.push('retest verdicts');
  // 5. regression: a plan without TC-06 is sent back; with it the runs appear
  const need = Object.keys(REL.regression).filter(id => REL.regression[id].need), opt = Object.keys(REL.regression).filter(id => !REL.regression[id].need);
  for (const id of need.filter(id => !REL.bugs[id])) await page.check(`[data-rel-reg="${id}"]`);
  await page.click('#rel-3 [data-act="rel-plan"]'); await page.waitForTimeout(150);
  out.planMiss = { miss: await page.$$eval('#rel-3 .rel-pick.miss', els => els.map(e => e.querySelector('input').dataset.relReg).join(',')), runs: await page.$$eval('#rel-3 .rel-run', x => x.length) };
  if (out.planMiss.miss !== Object.keys(REL.bugs).join(',') || out.planMiss.runs) bad.push('plan without the regression case');
  for (const id of Object.keys(REL.bugs).concat(opt[0])) await page.check(`[data-rel-reg="${id}"]`);
  await page.click('#rel-3 [data-act="rel-plan"]'); await page.waitForTimeout(150);
  out.plan = { runs: await page.$$eval('#rel-3 .rel-run', x => x.length), locked: await page.$$eval('#rel-3 [data-rel-reg]', els => els.every(e => e.disabled)) };
  if (out.plan.runs !== need.length + 1 || !out.plan.locked) bad.push('plan');
  out.regression = [];
  for (const id of need.concat(opt[0])) {
    const r = await fromPanel(page, 3, id); out.regression.push(`${id}:${r.truth}`);
    if (REL.bugs[id]) { // the regression's own full bug report, opened from the run
      await page.click(`#rel-3 [data-act="rel-run"][data-sc="${id}"]`); await page.waitForTimeout(300);
      await runCase(page, id);
      await page.click('#sm-fb [data-act="br-open"]'); await page.waitForTimeout(200);
      await page.click('#br [data-act="br-shot"]'); await page.waitForTimeout(100);
      const m = STORE.reports[REL.bugs[id].r].model;
      for (const [k, v] of Object.entries({ title: m.title, env: 'Windows 11, Chrome 141, Mini Store 1.1', sev: m.sev, pri: m.pri, pre: m.pre, steps: m.steps.map((x, i) => `${i + 1}) ${x}`).join('\n'), exp: m.exp, freq: '2/2' })) {
        if (k === 'sev' || k === 'pri') await page.selectOption(`#br [data-br-f="${k}"]`, v); else await page.fill(`#br [data-br-f="${k}"]`, v);
      }
      await page.click('#br [data-act="br-check"]'); await page.waitForTimeout(100);
      out.regReport = await page.$eval('#br-fb', el => ({ head: el.querySelector('.sm-fb-h').textContent, rows: [...el.querySelectorAll('.sm-rows li')].map(li => (li.querySelector('.sm-ok') ? '✓' : '✗') + li.querySelector('b').textContent).join(' ') }));
      await page.screenshot({ path: 'shots/release-bugreport-1024.png', fullPage: true });
      if (out.regReport.head !== 'Hesabat yoxlandı: 10/10 sahə qaydasındadır') bad.push('regression report: ' + out.regReport.rows);
      await page.click('[data-act="rel-open"]'); await page.waitForTimeout(300);
    }
  }
  out.newBug = await page.$$eval('#rel-3 .sm-state.off', x => x.map(e => e.textContent.trim().slice(0, 40)));
  out.regDone = await page.$eval('#rel-3', e => e.classList.contains('done'));
  if (!out.newBug.length || !out.regDone) bad.push('regression stage');
  // 6. the recommendation: facts come from the runs; “go” is wrong, the deferred defect is no reason
  out.facts = await page.$$eval('#rel-4 [data-rel-why]', els => els.map(e => e.dataset.relWhy).join(','));
  await page.click('#rel-4 [data-act="rel-go"][data-v="go"]');
  await page.check('#rel-4 [data-rel-why="remove"]');
  await page.click('#rel-4 [data-act="rel-check"]'); await page.waitForTimeout(200);
  out.wrong = { dec: await page.$eval('#rel-fb > .sm-st', e => e.className), rows: await marks(page, '#rel-fb .sm-rows li'), good: await page.$$eval('#rel-fb .sm-good', x => x.length) };
  if (!out.wrong.dec.includes('no') || out.wrong.rows !== '✗✗✗' || out.wrong.good) bad.push('wrong recommendation: ' + out.wrong.rows);
  await page.click('#rel-4 [data-act="rel-go"][data-v="nogo"]');
  await page.uncheck('#rel-4 [data-rel-why="remove"]');
  for (const id of Object.keys(REL.bugs).concat(reopen.bug)) await page.check(`#rel-4 [data-rel-why="${id}"]`);
  await page.click('#rel-4 [data-act="rel-check"]'); await page.waitForTimeout(200);
  out.right = { dec: await page.$eval('#rel-fb > .sm-st', e => e.className), rows: await marks(page, '#rel-fb .sm-rows li'), good: await page.$$eval('#rel-fb .sm-good', x => x.length) };
  out.md = await page.$eval('#rel-fb .rel-md', e => e.textContent);
  if (!out.right.dec.includes('ok') || out.right.rows !== '✓✓✓' || !out.right.good) bad.push('right recommendation: ' + out.right.rows);
  if (!/\| TC-06 .* \| Regression \| Failed \|/.test(out.md) || !out.md.includes(`${reopen.key} — Reopened`) || !out.md.includes('reliz olmaz')) bad.push('test report markdown');
  out.md = out.md.split('\n').length + ' lines';
  await page.click('#rel-4 [data-act="rel-copy"]'); await page.waitForTimeout(150);
  out.copied = await page.evaluate(() => navigator.clipboard.readText().catch(() => '')).catch(() => '');
  if (out.copied && !out.copied.startsWith('## Test hesabatı')) bad.push('copy');
  out.copied = out.copied ? 'ok' : 'clipboard unavailable';
  out.allDone = await page.$$eval('.rel-st.done', x => x.length);
  if (out.allDone !== 4) bad.push('all stages done');
  await page.screenshot({ path: 'shots/release-1024.png', fullPage: true });
  // 7. build 1.0 is unchanged; the section link and the practice card keep the panel's state
  await go(page, '#magaza-tc09'); await runSteps(page, sc('tc09'));
  out.v10 = { ver: await page.$$eval('#sm-dev .sm-ver', x => x.length), status: (await check(page, 'x', 'Passed')).status };
  await go(page, '#magaza-tc06'); await runSteps(page, sc('tc06'));
  out.v10.tc06 = (await check(page, 'x', 'Failed')).status;
  if (out.v10.ver || out.v10.status !== 'Status: Failed' || out.v10.tc06 !== 'Status: Passed') bad.push('build 1.0 changed');
  await go(page, '#c6s3');
  await page.click('#c6s3 .sm-link [data-act="rel-open"]'); await page.waitForTimeout(300);
  out.fromSection = await page.$$eval('.rel-st.done', x => x.length);
  await page.click('#topbar [data-act="back"]'); await page.waitForTimeout(400);
  out.backToSection = await page.$$eval('#c6s3', x => x.length);
  await go(page, '#mesq');
  out.practice = await page.$eval('#view [data-act="rel-open"]', e => e.closest('section').querySelector('.block-h span').textContent);
  if (out.fromSection !== 4 || !out.backToSection || out.practice !== '4/4 mərhələ') bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: the panel and a run fit
  ({ browser, page, errors } = await setup({ hash: '#reliz', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await fromPanel(page, 1, REL.smoke[0]);
  await page.screenshot({ path: 'shots/release-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.click(`#rel-1 [data-act="rel-run"][data-sc="${REL.smoke[1]}"]`); await page.waitForTimeout(300);
  await page.screenshot({ path: 'shots/release-store-360-dark.png', fullPage: true });
  out.overflowStore360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0 || out.overflowStore360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
