// Screen-words hint: result-writing answers flag opinion/ability/inference/"should"/description words, offline.
const { setup } = require('./harness');
(async () => {
  const out = {}; const ERRORS = [];
  const { browser, page, errors } = await setup({ hash: '#c11s11', wait: 1200 });
  const box = id => page.evaluate(id => { const b = document.querySelector(`[data-swc="${id}"]`); return b ? { hidden: b.hidden, words: [...b.querySelectorAll('mark')].map(m => m.textContent), kinds: [...b.querySelectorAll('.chip')].map(c => c.textContent) } : null; }, id);
  const tid = await page.evaluate(() => [...document.querySelectorAll('#c11s11 .task')].find(t => /pis test case-i düzəlt/.test(t.textContent)).querySelector('textarea').dataset.ans);
  const ta = `[data-ans="${tid}"]`;
  out.emptyAnswer = await box(tid);
  await page.fill(ta, 'Addımlar: düzgün parol yaz və Login bas.\nGözlənilən: səbət düzgün işləyir, Products səhifəsinə qayıda bilirəm, səbət sıfırlanır.\nFaktiki: səhifə açılmır. Səbət boş olmalıdır.');
  out.flagged = await box(tid);
  await page.locator(ta).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/sw-flagged.png' });
  await page.fill(ta, 'Data: standard_user / secret_sauce.\nGözlənilən: «Products» səhifəsi açılır, səbət nişanında 1 görünür.\nFaktiki: «Checkout: Your Information» səhifəsində qalır, xəta mesajı çıxmır.');
  out.clean = await box(tid);
  await page.fill(ta, 'Faktiki: «Sifarişiniz uğurla qəbul edildi» mesajı çıxır.');
  out.quotedScreenText = await box(tid);
  // the hint is rebuilt from the saved answer after a reload
  await page.fill(ta, 'Gözlənilən: hər şey normal işləyir.');
  await page.waitForTimeout(1200);
  await page.reload(); await page.waitForTimeout(1500);
  out.afterReload = await box(tid);
  // tasks that do not ask for written results get no hint box
  await page.evaluate(() => { location.hash = '#c4s8'; }); await page.waitForTimeout(800);
  out.metricsTask = await page.evaluate(() => { const t = document.querySelector('#c4s8 .task textarea'); return t ? { hasBox: !!document.querySelector(`[data-swc="${t.dataset.ans}"]`) } : 'no task'; });
  ERRORS.push(...errors);
  await browser.close();
  // narrow phone, dark: the hint fits without sideways scroll
  const m = await setup({ hash: '#c11s11', w: 360, h: 760, mobile: true, dark: true, wait: 1200 });
  const id2 = await m.page.evaluate(() => [...document.querySelectorAll('#c11s11 .task')].find(t => /pis test case-i düzəlt/.test(t.textContent)).querySelector('textarea').dataset.ans);
  await m.page.fill(`[data-ans="${id2}"]`, 'Gözlənilən: səbət düzgün işləyir, Products səhifəsinə qayıda bilirəm.');
  await m.page.locator(`[data-swc="${id2}"]`).scrollIntoViewIfNeeded();
  await m.page.screenshot({ path: 'shots/sw-360-dark.png' });
  out.overflow360 = await m.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ERRORS.push(...m.errors);
  await m.browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
})();
