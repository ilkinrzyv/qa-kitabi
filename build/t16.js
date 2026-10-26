// Interactive diagrams (interactive.json): BVA slider + buggy-code switch, state machine, decision table.
const { setup } = require('./harness');
(async () => {
  const out = {}; const ERRORS = [];
  let { browser, page, errors } = await setup({ hash: '#c8s3', w: 1024, h: 1100, wait: 1200 });
  const info = sid => page.$eval(`[data-ix="${sid}"] .ix-info`, el => el.innerText.replace(/\s+/g, ' '));
  const slide = v => page.$eval('[data-ix="c8s3"] .bva-range', (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
  // BVA
  out.bvaStart = await info('c8s3');
  await page.$eval('[data-ix="c8s3"] .bva-range', el => { el.dataset.mark = 'same'; });
  await slide(17);
  out.bva17 = await info('c8s3');
  out.sliderKept = await page.$eval('[data-ix="c8s3"] .bva-range', el => el.dataset.mark === 'same'); // not re-created while dragging
  await page.click('[data-ix="c8s3"] [data-act="ix-set"][data-v="18"]');
  out.bva18 = await info('c8s3');
  await page.check('[data-ix="c8s3"] [data-ix-tg="bug"]');
  out.bva18bug = await info('c8s3');
  await page.click('[data-ix="c8s3"] [data-act="ix-set"][data-v="35"]');
  out.bva35bug = await info('c8s3');
  await page.check('[data-ix="c8s3"] [data-ix-tg="three"]');
  out.bvaChips3 = await page.$$eval('[data-ix="c8s3"] [data-act="ix-set"]', els => els.map(e => e.dataset.v).join(','));
  await page.$eval('[data-ix="c8s3"]', el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/ix-bva-1024.png' });
  // state machine
  await page.evaluate(() => { location.hash = '#c9s2'; }); await page.waitForTimeout(900);
  const S = 'c9s2', ev = e => page.click(`[data-ix="${S}"] [data-act="ix-ev"][data-e="${e}"]`);
  const cur = () => page.$eval(`[data-ix="${S}"] .st-node.on text`, el => el.textContent);
  out.stStart = { cur: await cur(), outDisabled: await page.$eval(`[data-ix="${S}"] [data-e="out"]`, el => el.disabled) };
  await ev('bad'); await ev('bad'); await ev('bad');
  out.stAfter3Bad = { cur: await cur(), row: await page.$eval(`[data-ix="${S}"] .st-tbl tr.on td`, el => el.textContent), log: await page.$$eval(`[data-ix="${S}"] .st-log li`, els => els.length) };
  await ev('ok');
  out.stBlockedOk = { cur: await cur(), warn: await page.$eval(`[data-ix="${S}"] .st-log li:last-child`, el => el.classList.contains('warn') && /Etibarsız keçid/.test(el.textContent)) };
  await page.$eval(`[data-ix="${S}"]`, el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/ix-state-1024.png' });
  await page.click(`[data-ix="${S}"] [data-act="ix-reset"]`);
  await ev('ok');
  out.stLogin = { cur: await cur(), outEnabled: await page.$eval(`[data-ix="${S}"] [data-e="out"]`, el => !el.disabled), badDisabled: await page.$eval(`[data-ix="${S}"] [data-e="bad"]`, el => el.disabled) };
  await ev('out');
  out.stLogout = await cur();
  // decision table
  await page.evaluate(() => { location.hash = '#c9s1'; }); await page.waitForTimeout(900);
  const D = 'c9s1', dt = (c, v) => page.click(`[data-ix="${D}"] [data-act="ix-dt"][data-c="${c}"][data-v="${v}"]`);
  const dtState = () => page.$eval(`[data-ix="${D}"]`, el => ({ rule: el.querySelector('.dt-tbl th.on').textContent, info: el.querySelector('.ix-info div').textContent, dim: [...el.querySelectorAll('.dt-sw.dim .lb')].map(e => e.firstChild.textContent.trim()) }));
  out.dtStart = await dtState();
  await dt('blk', 0); out.dtLogin = await dtState();
  await dt('pwd', 0); out.dtWrongPwd = await dtState();
  await dt('reg', 0); out.dtNotRegistered = await dtState();
  await page.$eval(`[data-ix="${D}"]`, el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/ix-dtable-1024.png' });
  ERRORS.push(...errors); await browser.close();
  // phone, dark
  ({ browser, page, errors } = await setup({ hash: '#c9s2', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.click('[data-ix="c9s2"] [data-act="ix-ev"][data-e="bad"]');
  await page.$eval('[data-ix="c9s2"]', el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/ix-state-360-dark.png' });
  out.overflow360state = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.evaluate(() => { location.hash = '#c8s3'; }); await page.waitForTimeout(900);
  await page.$eval('[data-ix="c8s3"]', el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/ix-bva-360-dark.png' });
  out.overflow360bva = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
})();
