// Playwright practice (playwright.json): every model answer does its task (and the starter code does not); the book's
// own Playwright programs from trace.json run as the code tracer says; Playwright's errors (strict mode, timeout, typo,
// syntax, missing await) come with their hints; the trace has before / after pictures; every locator exercise accepts
// its model locator and catches the usual mistakes; code and done marks survive a reload.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const PWJ = JSON.parse(fs.readFileSync(path.join(__dirname, 'playwright.json'), 'utf8'));
const TRACE = JSON.parse(fs.readFileSync(path.join(__dirname, 'trace.json'), 'utf8'));
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(300));
async function run(page, code) {
  await page.fill('#pw-ed', code); await page.click('[data-act="pw-run"]'); await page.waitForTimeout(150);
  return page.$eval('#pw-out', el => ({
    sum: (el.querySelector('.tr-sum') || {}).textContent || '', err: (el.querySelector('.pw-err') || {}).textContent || '', hint: (el.querySelector('.pw-hint') || {}).textContent || '',
    lint: [...el.querySelectorAll('.pw-lint li')].map(l => l.className + ' ' + l.querySelector('b').textContent + ' ' + l.firstChild.nextSibling.textContent.trim()),
    reqs: [...el.querySelectorAll('.sm-rows li')].map(li => li.querySelector('.sm-ok') ? '✓' : '✗').join(''), done: !!el.querySelector('.sm-good'),
    steps: [...el.querySelectorAll('.pw-steps button')].map(b => b.className.replace(' cur', '')).join(','), out: (el.querySelector('.tr-out') || {}).textContent || '' }));
}
async function judge(page, q) {
  await page.fill('#pw-q', q); await page.click('[data-act="pw-eval"]'); await page.waitForTimeout(80);
  return page.$eval('#pw-res', el => ({ n: +((el.querySelector('.pw-count b') || {}).textContent || -1), ok: !!el.querySelector('.sm-st.ok'), note: (el.querySelector('.sm-st') || {}).textContent || '',
    err: (el.querySelector('.pw-err') || {}).textContent || '', hint: (el.querySelector('.pw-hint') || {}).textContent || '', lit: document.querySelectorAll('#pw-dev .pw-hl').length }));
}
const body = lines => ["import { test, expect } from '@playwright/test';", '', "test('t', async ({ page }) => {", "  await page.goto('https://www.saucedemo.com/');"].concat(lines, ['});']).join('\n');
const LOGIN = ["  await page.getByPlaceholder('Username').fill('standard_user');", "  await page.getByPlaceholder('Password').fill('secret_sauce');", "  await page.getByRole('button', { name: 'Login' }).click();"];
(async () => {
  const out = { tasks: {} }; const ERRORS = []; const bad = [];
  let { browser, page, errors } = await setup({ hash: '#playwright-pw1', w: 1024, h: 1300, wait: 1200 });
  // 1. every task: the starter code does not do it, the model answer does
  for (const t of PWJ.tasks) {
    await go(page, '#playwright-' + t.id);
    const s = await run(page, t.code.join('\n')), m = await run(page, t.model.join('\n'));
    out.tasks[t.id] = { starter: s.sum || (s.lint.length + ' lint'), starterReqs: s.reqs, model: m.sum, modelReqs: m.reqs };
    if (s.done || !m.done || m.reqs.includes('✗')) bad.push('task ' + t.id);
  }
  out.pw3 = (await (async () => { await go(page, '#playwright-pw3'); return run(page, PWJ.tasks.find(t => t.id === 'pw3').code.join('\n')); })());
  if (!/strict mode violation: getByRole\('button', \{ name: 'Add to cart' \}\) resolved to 6 elements/.test(out.pw3.err) || !/aka getByTestId/.test(out.pw3.err) || !out.pw3.hint.includes('strict mode')) bad.push('strict mode message');
  out.pw3 = out.pw3.steps;
  // the failing step's "before" picture lights up all six buttons; "after" shows the page as it is
  await page.click('.pw-steps button.bad'); await page.waitForTimeout(60);
  out.before = await page.$$eval('.pw-shot .pw-hl', x => x.length);
  await page.click('[data-act="pw-shot"][data-v="after"]'); await page.waitForTimeout(60);
  out.after = await page.$$eval('.pw-shot .pw-hl', x => x.length);
  if (out.before !== 6 || out.after !== 0) bad.push('trace before / after');
  await go(page, '#playwright-pw7');
  out.pw7 = await run(page, PWJ.tasks.find(t => t.id === 'pw7').code.join('\n'));
  if (out.pw7.sum || out.pw7.lint.filter(l => l.startsWith('err')).length !== 4 || !out.pw7.lint.some(l => /^warn Sətir 8:/.test(l))) bad.push('pw7 lint: ' + out.pw7.lint.join(' | '));
  out.pw7 = out.pw7.lint.map(l => l.slice(0, 40));
  // 2. the book's own Playwright programs (trace.json) give the tracer's result
  out.book = {};
  await go(page, '#playwright-pw1');
  for (const progs of Object.values(TRACE)) for (const p of progs) if (p.lang === 'pw') {
    const r = await run(page, p.code.join('\n')), stop = p.steps.find(s => s.c && s.n && /düşür/.test(s.n));
    out.book[p.id] = r.sum + (r.err ? ' @' + (r.err.match(/test\.spec\.js:(\d+)/) || [])[1] : '');
    if (p.id === 'pw-cart-problem' ? !(r.sum.startsWith('1 failed') && stop && r.err.includes(`test.spec.js:${stop.l}`)) : !r.sum.startsWith('1 passed')) bad.push('book program ' + p.id);
  }
  // 3. Playwright's errors, with a hint in Azerbaijani
  const E = {};
  E.timeout = await run(page, body(LOGIN.slice(0, 2).concat(["  await page.getByRole('button', { name: 'Logn' }).click();", "  await expect(page).toHaveURL(/inventory/);"])));
  E.typo = await run(page, body(["  await page.getByRol('button', { name: 'Login' }).click();", "  await expect(page).toHaveURL(/inventory/);"]));
  E.syntax = await run(page, body(["  await page.getByRole('button', { name: 'Login' }.click();"]));
  E.fill = await run(page, body(["  await page.getByRole('button', { name: 'Login' }).fill('x');", "  await expect(page).toHaveURL(/inventory/);"]));
  E.title = await run(page, body(["  await expect(page).toHaveTitle('Swag Labs');"]));
  E.host = await run(page, "test('t', async ({ page }) => {\n  await page.goto('https://example.com/');\n  await expect(page).toHaveURL(/example/);\n});");
  E.text = await run(page, body(LOGIN.concat(["  await expect(page.getByTestId('title')).toHaveText('products');"])));
  E.smart = await run(page, body(LOGIN.concat(['  await expect(page.getByText(‘Products’)).toBeVisible();'])));
  E.guard = await run(page, "test('t', async ({ page }) => {\n  await page.goto('https://www.saucedemo.com/inventory.html');\n  await expect(page.locator('[data-test=\"error\"]')).toContainText('when you are logged in');\n});");
  E.values = await run(page, body(LOGIN.concat(["  const n = await page.getByTestId('inventory-item').count();", "  console.log('məhsul:', n);", '  expect(n).toBe(5);'])));
  E.suite = await run(page, ["import { test, expect } from '@playwright/test';", "test.describe('login', () => {", "  test.beforeEach(async ({ page }) => {", "    await page.goto('https://www.saucedemo.com/');", '  });',
    "  test('a', async ({ page }) => {", "    await page.getByPlaceholder('Username').fill('locked_out_user');", "    await page.getByPlaceholder('Password').fill('secret_sauce');",
    "    await page.getByPlaceholder('Password').press('Enter');", "    await expect(page.getByText('locked out')).toBeVisible();", '  });',
    "  test.skip('b', async ({ page }) => {", "    await expect(page).toHaveURL('/');", '  });', '});'].join('\n'));
  out.errors = Object.fromEntries(Object.entries(E).map(([k, v]) => [k, (v.sum || 'not run') + ' | ' + (v.err.split('\n')[0] || v.lint.join(' ')).slice(0, 110)]));
  if (!/Test timeout of 30000ms exceeded[\s\S]*waiting for getByRole\('button', \{ name: 'Logn' \}\)/.test(E.timeout.err) || !E.timeout.hint) bad.push('timeout');
  if (!/TypeError: page\.getByRol is not a function/.test(E.typo.err) || !E.typo.hint.includes('getByRole')) bad.push('typo');
  if (!/SyntaxError/.test(E.syntax.err) || !/test\.spec\.js:5/.test(E.syntax.err) || E.syntax.sum) bad.push('syntax');
  if (!/Element is not an <input>/.test(E.fill.err)) bad.push('fill on a button');
  if (!E.title.err.includes('Received string: "Mini Store"') || !E.title.hint.includes('Mini Store')) bad.push('toHaveTitle');
  if (!/ERR_NAME_NOT_RESOLVED/.test(E.host.err)) bad.push('other host');
  if (!/Expected string: "products"\nReceived string: "Products"/.test(E.text.err) || !E.text.hint.includes('toContainText')) bad.push('toHaveText case');
  if (!E.smart.sum.startsWith('1 passed') || !E.smart.lint.some(l => l.includes('Ağıllı dırnaqlar'))) bad.push('smart quotes');
  if (!E.guard.sum.startsWith('1 passed')) bad.push('page needs a login');
  if (!/expect\(received\)\.toBe\(expected\)[\s\S]*Expected: 5\nReceived: 6/.test(E.values.err) || E.values.out !== 'məhsul: 6') bad.push('values, console.log');
  if (E.suite.sum !== '1 passed, 1 skipped (0.6s)' && !/^1 passed, 1 skipped/.test(E.suite.sum)) bad.push('describe / beforeEach / skip / Enter: ' + E.suite.sum);
  await page.screenshot({ path: 'shots/pw-test-1024.png', fullPage: true });
  // 4. code and done marks survive a reload
  await go(page, '#playwright-pw2');
  await page.fill('#pw-ed', '// mənim kodum\n' + PWJ.tasks.find(t => t.id === 'pw2').code.join('\n')); await page.waitForTimeout(1700);
  await page.reload(); await page.waitForTimeout(1200);
  out.kept = { code: await page.$eval('#pw-ed', e => e.value.startsWith('// mənim kodum')), done: await page.$$eval('.sm-pick .chip.pass', x => x.length) };
  if (!out.kept.code || out.kept.done < PWJ.tasks.length - 1) bad.push('saved code / done marks');
  // 5. locators: every model locator is accepted; the usual mistakes are caught
  out.locators = {};
  for (const l of PWJ.locators) {
    await go(page, '#lokator-' + l.id);
    const r = await judge(page, l.target);
    out.locators[l.id] = r.ok;
    if (!r.ok || r.n !== 1 || r.lit !== 1) bad.push('locator ' + l.id);
  }
  const L = {};
  await go(page, '#lokator-l2'); L.textbox = await judge(page, "page.getByRole('textbox', { name: 'Password' })");
  await go(page, '#lokator-l5'); L.many = await judge(page, "page.getByRole('button', { name: 'Add to cart' })");
  L.css = await judge(page, "page.locator('#add-to-cart-sauce-labs-fleece-jacket')");
  await go(page, '#lokator-l6'); L.text = await judge(page, "page.getByText('1')"); L.exact = await judge(page, "page.getByText('1', { exact: true })");
  L.action = await judge(page, "page.getByText('Products').click()");
  L.typo = await judge(page, "page.getByTestID('shopping-cart-badge')");
  out.mistakes = Object.fromEntries(Object.entries(L).map(([k, v]) => [k, `${v.n} ${v.ok ? 'ok' : 'no'} ${(v.err || v.note).slice(0, 70)}`]));
  if (L.textbox.n !== 0 || L.textbox.ok || L.many.n !== 6 || L.many.ok || L.many.lit !== 6 || !L.css.ok || !L.css.note.includes('daha sabitdir') || L.text.n !== 3 || L.text.ok || !L.exact.ok) bad.push('locator mistakes');
  if (!L.action.err.includes('yalnız lokator') || L.action.err.includes('test.spec.js') || !L.typo.hint.includes('getByTestId')) bad.push('locator errors');
  // pick an element: its locators, best first; the shop in the exercise works
  await go(page, '#lokator-l5');
  await page.click('[data-act="pw-pick"]'); await page.waitForTimeout(80);
  await page.click('#pw-dev [data-test="add-to-cart-sauce-labs-onesie"]'); await page.waitForTimeout(80);
  out.pick = await page.$$eval('#pw-res .pw-alts button', x => x.map(b => b.textContent));
  if (!out.pick.length || !/filter\(\{ hasText: 'Onesie' \}\)/.test(out.pick[0]) || !out.pick.includes("page.getByTestId('add-to-cart-sauce-labs-onesie')")) bad.push('pick');
  await go(page, '#lokator-l1');
  await page.fill('#pw-dev [data-sm-f="user"]', 'standard_user'); await page.fill('#pw-dev [data-sm-f="pass"]', 'secret_sauce');
  await page.press('#pw-dev [data-sm-f="pass"]', 'Enter'); await page.waitForTimeout(100);
  out.playShop = await page.$eval('#pw-dev .sm-title', e => e.textContent);
  await page.click('#pw-dev [data-test="add-to-cart-sauce-labs-backpack"]'); await page.waitForTimeout(80);
  out.playBadge = await page.$eval('#pw-dev .shopping_cart_badge', e => e.textContent);
  if (out.playShop !== 'Products' || out.playBadge !== '1') bad.push('the exercise shop');
  await page.screenshot({ path: 'shots/pw-loc-1024.png', fullPage: true });
  // 6. entry points: 19.5 (locators), 19.6 (tests), the practice tab
  await go(page, '#c19s5'); out.links = { loc: await page.$$eval('#c19s5 .sm-link [data-act="pw-open"]', x => x.length) };
  await go(page, '#c19s6'); out.links.test = await page.$$eval('#c19s6 .sm-link [data-act="pw-open"]', x => x.length);
  await page.click('#c19s6 .sm-link [data-act="pw-open"][data-id="pw4"]'); await page.waitForTimeout(300);
  out.links.opened = await page.$eval('.sm-case .sm-id', e => e.textContent);
  await go(page, '#mesq');
  out.links.practice = await page.$eval('#view [data-act="pw-open"]', e => e.closest('section').querySelector('.block-h > span').textContent);
  if (out.links.loc !== PWJ.locators.length || out.links.test !== PWJ.tasks.length || !out.links.opened.startsWith('PW-4') || out.links.practice !== `${PWJ.locators.length}/${PWJ.locators.length} lokator · ${PWJ.tasks.length}/${PWJ.tasks.length} test`) bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: a failed run with its trace, the locator exercise
  ({ browser, page, errors } = await setup({ hash: '#playwright-pw6', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  out.phone = (await run(page, PWJ.tasks.find(t => t.id === 'pw6').model.join('\n'))).sum;
  await page.screenshot({ path: 'shots/pw-test-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await go(page, '#lokator-l5'); await judge(page, "page.getByRole('button', { name: 'Add to cart' })");
  await page.screenshot({ path: 'shots/pw-loc-360-dark.png', fullPage: true });
  out.overflowLoc360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (!out.phone.startsWith('1 failed') || out.overflow360 > 0 || out.overflowLoc360 > 0) bad.push('phone');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
