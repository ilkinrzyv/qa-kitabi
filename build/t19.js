// Code tracer (trace.json). Each JavaScript program really runs in Node: its console output must equal the trace's output
// lines and its top-level variables must end with the trace's last values. Then the UI: stepping, Playwright pass/fail.
const fs = require('fs');
const path = require('path');
const util = require('util');
const vm = require('vm');
const { setup } = require('./harness');
const TRACE = JSON.parse(fs.readFileSync(path.join(__dirname, 'trace.json'), 'utf8'));
const progs = Object.entries(TRACE).flatMap(([sid, ps]) => ps.map(p => Object.assign({ sid }, p)));
(async () => {
  const out = { js: {} }; const ERRORS = []; const bad = [];
  // 1. the traces against real execution
  for (const p of progs.filter(p => p.lang === 'js')) {
    const logs = [], vars = {};
    p.steps.forEach(s => { (s.x || []).forEach(n => { delete vars[n]; }); Object.assign(vars, s.v); });
    const names = Object.keys(vars);
    const ctx = { console: { log: (...a) => logs.push(util.format(...a)) }, __end: o => { ctx.__vars = o; } };
    vm.runInNewContext(p.code.join('\n') + `\n;__end({ ${names.join(', ')} });`, ctx);
    const traced = p.steps.filter(s => s.o !== undefined).map(s => s.o);
    const varsOk = names.every(n => util.isDeepStrictEqual(ctx.__vars[n], vm.runInContext('(' + vars[n] + ')', ctx))); // same realm, so arrays compare
    out.js[p.id] = { output: JSON.stringify(logs) === JSON.stringify(traced), vars: varsOk };
    if (!out.js[p.id].output || !varsOk) bad.push(`trace ${p.id}: real ${JSON.stringify(logs)} vs traced ${JSON.stringify(traced)}`);
  }
  // 2. the UI
  let { browser, page, errors } = await setup({ hash: '#c18s7', w: 1024, h: 1200, wait: 1200 });
  const T = id => `.tr[data-tr="${id}"]`;
  const step = (id, d) => page.click(`${T(id)} [data-act="tr"][data-d="${d}"]`);
  const state = id => page.$eval(T(id), el => ({
    pos: el.querySelector('.tr-pos').textContent, cur: (el.querySelector('.tr-ln.cur .tr-no') || {}).textContent || null,
    vars: Object.fromEntries([...el.querySelectorAll('.tr-vars tr')].map(tr => [tr.cells[0].textContent, tr.cells[1].textContent])),
    changed: [...el.querySelectorAll('.tr-vars tr.ch td:first-child')].map(td => td.textContent),
    out: (el.querySelector('.tr-out') || {}).textContent, sum: (el.querySelector('.tr-sum') || {}).textContent || null,
    checks: [...el.querySelectorAll('.tr-chk')].map(c => c.textContent.replace(/\s+/g, ' ').trim()), bad: [...el.querySelectorAll('.tr-ln.bad .tr-no')].map(n => n.textContent),
    url: (el.querySelector('.tr-url') || {}).textContent, title: (el.querySelector('.sm-title') || {}).textContent || null }));
  await page.$eval(T('js-loop'), el => el.scrollIntoView({ block: 'start' }));
  out.loopStart = await state('js-loop');
  for (let k = 0; k < 6; k++) await step('js-loop', 1);
  out.loopMid = await state('js-loop');
  await page.screenshot({ path: 'shots/tr-loop-1024.png' });
  await step('js-loop', -1); out.loopBack = await state('js-loop');
  await step('js-loop', 'end'); out.loopEnd = await state('js-loop');
  await step('js-loop', '0'); out.loopReset = (await state('js-loop')).pos;
  if (out.loopStart.pos !== '0/14' || out.loopMid.cur !== '4' || out.loopMid.vars.total !== '165.5' || out.loopMid.changed.join() !== 'total'
    || out.loopBack.vars.price !== '120' || out.loopBack.vars.total !== '45.5' || out.loopEnd.out !== '260.5\n[ 120, 80 ]' || 'price' in out.loopEnd.vars || out.loopReset !== '0/14') bad.push('js stepping');
  // Playwright: passing and failing tests
  await page.evaluate(() => { location.hash = '#c19s6'; }); await page.waitForTimeout(800);
  await step('pw-login', 1); await step('pw-login', 1);
  out.loginAfterGoto = await state('pw-login');
  await step('pw-login', 'end'); out.loginEnd = await state('pw-login');
  await step('pw-locked', 'end'); out.locked = await state('pw-locked');
  if (out.loginAfterGoto.url !== '/' || out.loginEnd.sum !== '1 passed' || out.loginEnd.title !== 'Products' || out.loginEnd.url !== '/inventory.html' || out.loginEnd.checks.length !== 2
    || out.locked.sum !== '1 passed') bad.push('playwright pass');
  await page.evaluate(() => { location.hash = '#c19s12'; }); await page.waitForTimeout(800);
  await step('pw-cart', 'end'); out.cart = await state('pw-cart');
  await step('pw-cart-problem', 'end'); out.problem = await state('pw-cart-problem');
  await page.$eval(T('pw-cart-problem'), el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/tr-pw-fail-1024.png', fullPage: false });
  if (out.cart.sum !== '1 passed' || out.problem.sum !== '1 failed' || out.problem.pos !== '7/7' || out.problem.bad.join() !== '9'
    || !out.problem.checks.some(c => c.includes('Received: element(s) not found'))) bad.push('playwright fail');
  // practice tab lists every program and opens its section
  await page.evaluate(() => { location.hash = '#mesq'; }); await page.waitForTimeout(600);
  out.practice = await page.$$eval('#view [data-act="goto-sec"]', x => x.filter(b => /^(1[89]\.|Fəsil 1[89])/.test(b.textContent.trim())).length);
  await page.click('#view [data-act="goto-sec"][data-sec="c18s5"]'); await page.waitForTimeout(700);
  out.opened = await page.$$eval(T('js-if'), x => x.length);
  if (out.practice !== progs.length || out.opened !== 1) bad.push('practice list');
  ERRORS.push(...errors); await browser.close();
  // phone, dark
  ({ browser, page, errors } = await setup({ hash: '#c19s12', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  for (let k = 0; k < 7; k++) await step('pw-cart', 1);
  await page.locator(T('pw-cart')).screenshot({ path: 'shots/tr-pw-360-dark.png' });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
