// Real page actions in the Playwright practice (19.18, 19.19), and the JavaScript chapter's new sections. The cases below were first
// run in real Playwright 1.63 on a local page with a real iframe, confirm(), popup and fetch: the model must give the same outcome.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const PWJ = JSON.parse(fs.readFileSync(path.join(__dirname, 'playwright.json'), 'utf8'));
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(300));
async function run(page, code) {
  await page.fill('#pw-ed', code); await page.click('[data-act="pw-run"]'); await page.waitForTimeout(120);
  return page.$eval('#pw-out', el => ({
    head: (el.querySelector('.sm-fb-h') || {}).textContent || '',
    sum: (el.querySelector('.tr-sum') || {}).textContent || '', errs: [...el.querySelectorAll('.pw-err')].map(e => e.textContent), hint: (el.querySelector('.pw-hint') || {}).textContent || '',
    lint: [...el.querySelectorAll('.pw-lint li')].map(l => l.className + ' ' + l.textContent),
    reqs: [...el.querySelectorAll('.sm-rows li')].map(li => li.querySelector('.sm-ok') ? '✓' : '✗').join(''), done: !!el.querySelector('.sm-good'),
    reps: [...el.querySelectorAll('.pw-rep')].map(b => b.className.replace(/pw-rep | cur/g, '')).join(','),
    steps: [...el.querySelectorAll('.pw-steps button')].map(b => b.className.replace(' cur', '')).join(','), src: [...el.querySelectorAll('.pw-steps code')].map(c => c.textContent), out: (el.querySelector('.tr-out') || {}).textContent || '' }));
}
const U = "await page.goto('https://ministore.test/settings.html');";
const T = lines => ["import { test, expect } from '@playwright/test';", '', "test('t', async ({ page }) => {", '  ' + U].concat(lines.map(l => '  ' + l), ['});']).join('\n');
const DEL = "await page.getByRole('button', { name: 'Hesabı sil' }).click();", ST = "page.getByTestId('account-status')", ORD = "await page.getByRole('button', { name: 'Sifarişləri yüklə' }).click();";
// [what, code, passes in real Playwright?, the error must say]
const CASES = [
  ['no listener: dismissed', T([DEL, `await expect(${ST}).toHaveText('Ləğv edildi');`]), true],
  ['listener after the click never runs', T(['let ran = false;', DEL, "page.on('dialog', d => { ran = true; return d.accept(); });", `await expect(${ST}).toHaveText('Ləğv edildi');`, 'expect(ran).toBe(false);']), true],
  ['listener that answers nothing: the click hangs', T(["page.on('dialog', d => { d.message(); });", DEL]), false, /locator\.click: Test timeout/],
  ['page.once answers only once', T(["page.once('dialog', d => d.accept());", DEL, `await expect(${ST}).toHaveText('Hesab silindi');`, DEL, `await expect(${ST}).toHaveText('Ləğv edildi');`]), true],
  ['plain locator does not see into the iframe', T(["await expect(page.getByRole('button', { name: 'Ödə' })).toBeVisible();"]), false, /element\(s\) not found/],
  ['frameLocator: id, iframe tag with title, contentFrame', T(["await expect(page.frameLocator('#pay').getByTestId('pay-status')).toHaveText('Ödəniş gözləyir');", "await expect(page.frameLocator('iframe[title=\"Ödəniş\"]').getByTestId('pay-status')).toHaveText('Ödəniş gözləyir');", "await expect(page.locator('#pay').contentFrame().getByTestId('pay-status')).toHaveText('Ödəniş gözləyir');"]), true],
  ['a frame has no actions of its own', T(["await page.frameLocator('#pay').click();"]), false, /is not a function/],
  ['waitForResponse after route.abort times out', T(["await page.route('**/api/orders', route => route.abort());", "const p = page.waitForResponse('**/api/orders');", ORD, 'await p;']), false, /waiting for response "\*\*\/api\/orders"/],
  ['route handler that answers nothing: stays loading', T(["await page.route('**/api/orders', route => { route.request(); });", ORD, "await expect(page.getByText('Yüklənir…')).toBeVisible();", "await expect(page.getByText('Sifariş 1001')).toBeVisible();"]), false, /Sifariş 1001/],
  ['the later route wins, route.continue gets the real answer', T(["await page.route('**/api/orders', route => route.fulfill({ status: 500, json: {} }));", "await page.route('**/api/orders', route => route.continue());", ORD, "await expect(page.getByText('Sifariş 1001')).toBeVisible();"]), true],
  ['route after the click is too late', T([ORD, "await page.route('**/api/orders', route => route.fulfill({ status: 500, json: {} }));", "await expect(page.getByText('Sifariş 1001')).toBeVisible();"]), true],
  ['regex and predicate find the response', T(["const a = page.waitForResponse(/orders/);", "const b = page.waitForResponse(r => r.url().includes('orders'));", ORD, 'const x = await a;', 'const y = await b;', 'expect(x.status()).toBe(y.status());', 'const list = await x.json();', 'expect(list[0].id).toBe(1001);']), true],
  ['click flips, check does not, a label acts on its field', T(["const sms = page.getByLabel('SMS bildirişləri');", 'await sms.check();', 'await expect(sms).toBeChecked();', 'await sms.click();', 'await expect(sms).not.toBeChecked();', 'await sms.setChecked(true);', 'expect(await sms.isChecked()).toBe(true);', "await page.getByText('SMS bildirişləri').click();", 'await expect(sms).toBeChecked({ checked: false });']), true],
  ['check on a button', T(["await page.getByRole('button', { name: 'Kömək' }).check();"]), false, /Not a checkbox or radio button/],
  ['selectOption by label and by visible text', T(["const c = page.getByLabel('Ölkə');", "await c.selectOption({ label: 'Gürcüstan' });", "await expect(c).toHaveValue('ge');", "await c.selectOption('Türkiyə');", "await expect(c).toHaveValue('tr');", "expect(await c.inputValue()).toBe('tr');"]), true],
  ['hover elsewhere: the tooltip goes', T(["await page.getByRole('button', { name: 'Kömək' }).hover();", "await expect(page.getByRole('tooltip')).toBeVisible();", "await page.getByRole('button', { name: 'Şərtlər' }).hover();", "await expect(page.getByRole('tooltip')).toBeHidden();"]), true],
  ['two files on a single input', T(["await page.getByLabel('CV faylı').setInputFiles(['cv.pdf', 'foto.exe']);"]), false, /Non-multiple file input/],
  ['await waitForEvent before the click', T(["const popup = await page.waitForEvent('popup');", 'await popup.close();']), false, /waiting for event "popup"/],
  ['the shop has no file input', ["import { test, expect } from '@playwright/test';", "test('t', async ({ page }) => {", "  await page.goto('https://www.saucedemo.com/');", "  await page.getByPlaceholder('Username').setInputFiles('a.pdf');", '});'].join('\n'), false, /Node is not an HTMLInputElement|Input of type/],
  ['settings.html is not on saucedemo: said as a limit of the model, real goto does not throw on a 404', ["import { test, expect } from '@playwright/test';", "test('t', async ({ page }) => {", "  await page.goto('https://www.saucedemo.com/settings.html');", '});'].join('\n'), false, /modelində belə səhifə yoxdur/],
  // a plain locator on the iframe element does not go in, and the frame's text is not its text
  ['locator on the iframe does not see in', T(["await expect(page.locator('#pay').getByRole('button', { name: 'Ödə' })).toBeVisible();"]), false, /element\(s\) not found/],
  ['clicking through the iframe element times out', T(["await page.locator('#pay').getByRole('button', { name: 'Ödə' }).click();"]), false, /Test timeout/],
  ["the iframe element's text is empty", T(["await expect(page.locator('#pay')).toContainText('Ödəniş');"]), false, /toContainText/],
  ['filter has does not go through an iframe', T(["await expect(page.locator('#pay').filter({ has: page.getByRole('button', { name: 'Ödə' }) })).toHaveCount(1);"]), false, /toHaveCount/],
  ['the iframe tag works in any locator', T(["await expect(page.locator('iframe')).toBeVisible();", "await page.locator('iframe').contentFrame().getByRole('button', { name: 'Ödə' }).click();", "await expect(page.frameLocator('iframe[src*=\"pay\"]').getByTestId('pay-status')).toHaveText('Ödəniş qəbul olundu');"]), true],
  ['expect on a frame locator', T(["await expect(page.frameLocator('#pay')).toBeVisible();"]), false, /can be only used with Locator/],
  // dialogs answered twice
  ['two listeners answer once', T(["page.on('dialog', d => d.accept());", "page.on('dialog', d => d.dismiss());", DEL]), false, /already handled/],
  ['dialog.type() is not locator.type(): no await needed', T(["page.on('dialog', async d => {", '  const kind = d.type();', "  expect(kind).toBe('confirm');", '  await d.accept();', '});', DEL]), true],
  // page.route: every form of the pattern and of the answer, and the document itself
  ['a string body is the answer', T(["await page.route('**/api/orders', route => route.fulfill({ status: 200, body: JSON.stringify([{ id: 7 }]) }));", ORD, "await expect(page.getByText('Sifariş 7')).toBeVisible();"]), true],
  ["a string body's text and JSON", T(["await page.route('**/api/orders', route => route.fulfill({ status: 200, body: '[{\"id\":7}]' }));", "const p = page.waitForResponse('**/api/orders');", ORD, 'const r = await p;', "expect(await r.text()).toBe('[{\"id\":7}]');", 'const list = await r.json();', 'expect(list[0].id).toBe(7);']), true],
  ['a body that is not JSON lands in the page\'s catch', T(["await page.route('**/api/orders', route => route.fulfill({ status: 200, body: 'salam' }));", ORD, "await expect(page.getByRole('alert')).toHaveText('İnternet bağlantısı yoxdur');"]), true],
  ['a matcher function and a {a,b} group', T(["await page.route(url => url.pathname.includes('orders'), route => route.fulfill({ json: [] }));", ORD, "await expect(page.getByTestId('orders-empty')).toBeVisible();", "await page.route('**/api/{orders,users}', route => route.fulfill({ status: 500, json: {} }));", ORD, "await expect(page.getByRole('alert')).toContainText('500');"]), true],
  ['a path against baseURL', ["import { test, expect } from '@playwright/test';", "test.use({ baseURL: 'https://ministore.test' });", "test('t', async ({ page }) => {", "  await page.goto('/settings.html');", "  await page.route('/api/orders', route => route.fulfill({ json: [{ id: 9 }] }));", '  ' + ORD, "  await expect(page.getByText('Sifariş 9')).toBeVisible();", '});'].join('\n'), true],
  ['abort everything before goto', ["import { test, expect } from '@playwright/test';", "test('t', async ({ page }) => {", "  await page.route('**/*', route => route.abort());", '  ' + U, '});'].join('\n'), false, /net::ERR_FAILED/],
  ['the response of the page itself', ["import { test, expect } from '@playwright/test';", "test('t', async ({ page }) => {", "  const p = page.waitForResponse('**/settings.html');", '  const res = ' + U, '  const r = await p;', '  expect(r.status()).toBe(200);', '  expect(res.ok()).toBe(true);', '});'].join('\n'), true],
  ['a wait nobody finished fails the test', T(["const p = page.waitForResponse('**/heçnə');", 'expect(1).toBe(1);']), false, /page\.waitForResponse: Test ended/],
  // the file's variables are one scope
  ['a value from a test reaches afterAll', ["import { test, expect } from '@playwright/test';", 'let id;', "test('t', async () => {", '  id = 5;', '  expect(id).toBe(5);', '});', 'test.afterAll(async () => {', '  expect(id).toBe(5);', '});'].join('\n'), true],
  ['a top-level helper sees what beforeAll wrote', ["import { test, expect } from '@playwright/test';", 'let token;', 'const auth = () => `Bearer ${token}`;', 'test.beforeAll(async () => {', "  token = 'tok';", '});', "test('t', async () => {", "  expect(auth()).toBe('Bearer tok');", '});'].join('\n'), true],
  ['an undeclared name cannot be assigned', T(['token = 5;']), false, /ReferenceError: token is not defined/],
  // the mouse, labels, selects, closed pages
  ['a click moves the pointer onto the button', T(["await page.getByRole('button', { name: 'Kömək' }).click();", "await expect(page.getByRole('tooltip')).toBeVisible();"]), true],
  ['check moves it away', T(["await page.getByRole('button', { name: 'Kömək' }).hover();", "await page.getByLabel('Xəbərlər gəlsin').check();", "await expect(page.getByRole('tooltip')).toBeHidden();"]), true],
  ['a label reads as its field', T(["expect(await page.getByText('SMS bildirişləri').isChecked()).toBe(true);", "await expect(page.getByText('SMS bildirişləri')).toBeChecked();"]), true],
  ['not.* on a missing element fails', T(["await expect(page.getByLabel('Belə qutu yoxdur')).not.toBeChecked();"]), false, /element\(s\) not found/],
  ['not.toBeVisible on a missing element holds', T(["await expect(page.getByLabel('Belə qutu yoxdur')).not.toBeVisible();"]), true],
  ['selectOption by index and in an array', T(["const c = page.getByLabel('Ölkə');", 'await c.selectOption({ index: 1 });', "await expect(c).toHaveValue('ge');", "await c.selectOption(['tr']);", "await expect(c).toHaveValue('tr');"]), true],
  ['a closed page cannot be asked', T(['await page.close();', "await expect(page.getByTestId('title')).toBeVisible();"]), false, /has been closed/],
  ['page.click before goto is a timeout, not a crash', ["import { test, expect } from '@playwright/test';", "test('t', async ({ page }) => {", "  await page.click('#x');", '});'].join('\n'), false, /page\.click: Test timeout/],
  // array destructuring (18.13) and the older way of waiting for a tab
  ['Promise.all and const [x]', T(["const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Çatdırılma qaydaları' }).click()]);", "await expect(popup.getByRole('heading')).toHaveText('Çatdırılma qaydaları');", 'await popup.close();']), true],
  ['a reload starts the page over', T(["await page.getByRole('button', { name: 'Şərtlər' }).click();", 'await page.reload();', "await expect(page.getByRole('dialog')).toBeHidden();"]), true],
];
(async () => {
  const out = { cases: {} }; const ERRORS = []; const bad = [];
  let { browser, page, errors } = await setup({ hash: '#playwright-pw14', w: 1024, h: 1300, wait: 1200 });
  await page.click('[data-act="pw-tab"][data-v="test"]').catch(() => {});
  await page.waitForSelector('#pw-ed');
  for (const [name, code, passes, re] of CASES) {
    const r = await run(page, code), ok = r.sum.includes('1 passed') && !r.sum.includes('failed');
    out.cases[name] = r.sum || r.head;
    if (ok !== passes) bad.push(`case "${name}": ${r.sum || r.head} ${r.errs[0] || ''}`);
    if (re && !r.errs.some(e => re.test(e))) bad.push(`case "${name}": message ${JSON.stringify(r.errs).slice(0, 240)}`);
  }
  // toHaveScreenshot, page in beforeAll, Promise, an unawaited wait: said in plain words
  const say = async (name, code, re) => { const r = await run(page, code), all = r.errs.join(' ') + r.hint + r.lint.join(' '); out.cases[name] = (r.errs[0] || r.lint[0] || '').slice(0, 90); if (!re.test(all)) bad.push(`say "${name}": ${all.slice(0, 240)}`); return r; };
  await say('screenshot needs a real browser', T(["await expect(page).toHaveScreenshot('a.png');"]), /toHaveScreenshot bu kitabın modelində yoxdur[\s\S]*real brauzer/);
  await say('page in beforeAll', ["import { test, expect } from '@playwright/test';", "test.beforeAll(async ({ page }) => {", '  ' + U, '});', "test('t', async () => {});"].join('\n'), /"context" and "page" fixtures are not supported in "beforeAll"/);
  // the reader's code cannot make the engine's own values: the way out that a review found
  const out0 = async (name, lines) => { await say(name, T(lines), /açarı bu məşqdə işlədilə bilməz/); if (await page.evaluate(() => !!window.__pwned)) bad.push('real JavaScript ran: ' + name); };
  await out0('an object cannot pose as a method', ["const g = { $v: 'constructor', self: Number };", "const fn = g('window.__pwned = 1; return 1');", "const h = { $v: 'call', self: fn };", 'h();']);
  await out0('nor with a string key', ["const g = { '$v': 'constructor', self: Number };", "g('window.__pwned = 1');"]);
  await out0('nor by assignment', ['const g = {};', "g.$v = 'constructor';"]);
  await out0('__proto__ is not a key', ['const g = { __proto__: 1 };']);
  await say('JSON.parse drops such keys', T(["const g = JSON.parse('{\"$v\":\"constructor\",\"self\":1}');", 'g(1);']), /is not a function/);
  await say('destructuring a dialog gives nothing real', T(["page.on('dialog', ({ constructor }) => { constructor('window.__pwned = 1')(); });", DEL]), /is not a function/);
  if (await page.evaluate(() => !!window.__pwned)) bad.push('real JavaScript ran');
  await say('beforeAll inside a group says it is not modelled', ["import { test, expect } from '@playwright/test';", "test.describe('q', () => {", '  test.beforeAll(async () => {});', "  test('t', async () => {});", '});'].join('\n'), /test\.describe içində beforeAll bu məşqin modelində yoxdur/);
  await say('wait without await', T(["const w = page.waitForEvent('popup');", "await page.getByRole('link', { name: 'Çatdırılma qaydaları' }).click();", "await expect(w.getByRole('heading')).toBeVisible();"]), /hələ Promise-dir/);
  await say('route needs await', T(["page.route('**/api/orders', route => route.abort());"]), /await yoxdur/);
  await say('setInputFiles needs await', T(["page.getByLabel('CV faylı').setInputFiles('cv.pdf');"]), /await yoxdur/);
  await say('wrong event name', T(["page.on('console', m => m.text());"]), /page\.on\('console'\) bu məşqin modelində yoxdur/);
  await say("the reader's code cannot climb out of a dialog", T(["page.on('dialog', d => d.constructor('return 1')());", DEL]), /is not a function/);
  // 3. every new task: the model answer does it, the starter does not (t27 does this for all tasks; here the new ones with their details)
  const task = id => PWJ.tasks.find(t => t.id === id);
  await go(page, '#playwright-pw18');
  const s18 = await run(page, task('pw18').code.join('\n')), m18 = await run(page, task('pw18').model.join('\n'));
  out.pw18 = { starter: [s18.errs.length, s18.steps], model: [m18.errs.length, m18.steps, m18.reqs] };
  if (s18.errs.length !== 1 || !s18.steps.includes('skip') || s18.done) bad.push('pw18 starter: the first failure must stop the test');
  if (m18.errs.length !== 2 || m18.steps !== 'ok,bad,ok,bad' || !m18.done || !/1 failed/.test(m18.sum)) bad.push('pw18 model: ' + JSON.stringify(out.pw18.model));
  if (!/Parametrlər/.test(m18.errs[0]) || !/Fayl yoxdur/.test(m18.errs[1])) bad.push('pw18: both soft errors are shown');
  const allOk = T(["await expect.soft(page.getByTestId('title')).toHaveText('Ayarlar');"]), okR = await run(page, allOk);
  if (!okR.sum.includes('1 passed')) bad.push('a soft check that holds passes');
  await go(page, '#playwright-pw19');
  const s19 = await run(page, task('pw19').code.join('\n')), m19 = await run(page, task('pw19').model.join('\n'));
  out.pw19 = { starter: s19.sum, model: m19.sum, reps: m19.reps, src: m19.src.slice(0, 2) };
  if (!/2 failed/.test(s19.sum) || !m19.done || !/2 passed/.test(m19.sum)) bad.push('pw19: ' + JSON.stringify(out.pw19));
  if (!m19.src[0].startsWith('const res = await request.post')) bad.push('pw19: the first test\'s trace opens with beforeAll');
  await page.click('.pw-rep:nth-child(2)'); await page.waitForTimeout(80);
  const second = await page.$eval('#pw-out', el => ({ src: [...el.querySelectorAll('.pw-steps code')].map(c => c.textContent), out: (el.querySelector('.tr-out') || {}).textContent || '' }));
  out.pw19.second = second;
  if (second.src.some(x => x.includes('/login')) || !second.src.some(x => x.includes('Testlər bitdi')) || second.out !== 'Testlər bitdi') bad.push('pw19: beforeAll once, afterAll after the last test: ' + JSON.stringify(second));
  const H = ["import { test, expect } from '@playwright/test';", 'let x = 1;'];
  const hookFail = await run(page, H.concat(["test.beforeAll(async () => {", '  expect(x).toBe(2);', '});', "test('a', async ({ page }) => { expect(1).toBe(1); });", "test('b', async ({ page }) => { expect(1).toBe(1); });"]).join('\n'));
  out.hookFail = [hookFail.sum, hookFail.reps];
  if (!/^1 failed, 1 did not run/.test(hookFail.sum)) bad.push('a failing beforeAll: the first test fails, the rest did not run: ' + hookFail.sum);
  const hookClean = await run(page, H.concat(["test.beforeAll(async () => {", '  expect(x).toBe(2);', '});', "test.afterEach(async () => { console.log('E'); });", "test.afterAll(async () => { console.log('A'); });", "test('a', async ({ page }) => { expect(1).toBe(1); });", "test('b', async ({ page }) => { expect(1).toBe(1); });"]).join('\n'));
  if (hookClean.out !== 'A') bad.push('a failing beforeAll: afterAll runs, afterEach does not: ' + hookClean.out);
  // a failed test ends the worker: afterAll runs, the variables and beforeAll start over, as real Playwright does
  const restart = await run(page, H.concat(["test.beforeAll(async () => { console.log('B'); });", "test.afterAll(async () => { console.log('A'); });", "test('a', async ({ page }) => {", '  x = 5;', '  expect(1).toBe(2);', '});', "test('b', async ({ page }) => {", '  expect(x).toBe(1);', '});']).join('\n'));
  out.restart = [restart.sum, restart.out];
  if (!/1 failed, 1 passed/.test(restart.sum) || restart.out !== 'B\nA') bad.push('restart after a failed test: ' + JSON.stringify(out.restart));
  await page.click('.pw-rep:nth-child(2)'); await page.waitForTimeout(80);
  const restart2 = await page.$eval('#pw-out', el => (el.querySelector('.tr-out') || {}).textContent || '');
  if (restart2 !== 'B\nA') bad.push('the next test has its own beforeAll and afterAll: ' + restart2);
  const stopped = await run(page, T(["await expect.soft(page.getByTestId('title')).toHaveText('x');", "await expect(page.getByTestId('title')).toHaveText('y');", "await expect(page.getByTestId('title')).toHaveText('Ayarlar');"]));
  const stoppedHead = await page.$$eval('#pw-out .sm-fb-h', x => x.map(h => h.textContent));
  if (!stoppedHead.includes('2 xəta: test dayandı')) bad.push('a hard failure after a soft one stops the test: ' + stoppedHead.join(' | '));
  const hookOnly = await run(page, H.concat(["test.beforeAll(async () => {", '  x = 2;', '});', "test.skip('a', async ({ page }) => { expect(x).toBe(2); });", "test('b', async ({ page }) => { expect(x).toBe(2); });", "test('c', async ({ page }) => { expect(x).toBe(2); });"]).join('\n'));
  out.hookOnly = hookOnly.sum;
  if (!/2 passed/.test(hookOnly.sum) || /failed/.test(hookOnly.sum)) bad.push('beforeAll runs before the first test that runs: ' + hookOnly.sum);
  // 4. the view: the reader can see the page, on a phone too
  await go(page, '#playwright-pw15');
  const view = () => page.evaluate(() => { const d = [...document.querySelectorAll('.sm-case details')].find(x => x.textContent.includes('Məşq səhifəsinə bax')); if (d) d.open = true; return { title: d ? (d.querySelector('[data-test="title"]') || {}).textContent : null, frame: d ? !!d.querySelector('[data-frame]') : false, over: document.documentElement.scrollWidth - innerWidth }; });
  out.view = await view();
  if (out.view.title !== 'Ayarlar' || !out.view.frame || out.view.over > 0) bad.push('pw15 shows the page: ' + JSON.stringify(out.view));
  await page.waitForTimeout(100); await page.screenshot({ path: 'shots/pw-settings-1024.png', fullPage: true });
  await run(page, task('pw15').model.join('\n'));
  await page.screenshot({ path: 'shots/pw-settings-run-1024.png', fullPage: true });
  await browser.close();
  ({ browser, page, errors: out.phoneErrors } = await setup({ hash: '#playwright-pw15', w: 375, h: 800, wait: 1200 }));
  await page.waitForSelector('#pw-ed');
  out.phone = await view();
  if (out.phone.over > 0) bad.push('phone: horizontal scroll ' + out.phone.over);
  await page.waitForTimeout(100); await page.screenshot({ path: 'shots/pw-settings-375.png', fullPage: true });
  // 5. the book: the new sections with their layers, links and the class tracer
  await go(page, '#c19x8');
  const sec = await page.evaluate(() => ({ link: !!document.querySelector('[data-act="pw-open"][data-id="pw14"]'), h: (document.querySelector('.sec-h, h2, h1') || {}).textContent || '', over: document.documentElement.scrollWidth - innerWidth }));
  out.c19x8 = sec;
  if (!sec.link || sec.over > 0) bad.push('c19x8: ' + JSON.stringify(sec));
  await go(page, '#c18x1');
  const tr = await page.evaluate(() => { const t = document.querySelector('.tr[data-tr="js-class"]'); return { tr: !!t, over: document.documentElement.scrollWidth - innerWidth }; });
  out.c18x1 = tr;
  if (!tr.tr || tr.over > 0) bad.push('c18x1 tracer: ' + JSON.stringify(tr));
  await page.screenshot({ path: 'shots/c18x1-375.png', fullPage: false });
  await go(page, '#c18x2');
  const tbl = await page.evaluate(() => ({ tables: document.querySelectorAll('table').length, over: document.documentElement.scrollWidth - innerWidth }));
  out.c18x2 = tbl;
  if (tbl.over > 0) bad.push('c18x2 overflows on a phone: ' + tbl.over);
  await browser.close();
  errors.filter(e => !/net::ERR|favicon/.test(e)).forEach(e => ERRORS.push(e));
  (out.phoneErrors || []).filter(e => !/net::ERR|favicon/.test(e)).forEach(e => ERRORS.push(e));
  delete out.phoneErrors;
  console.log(JSON.stringify(out, null, 1));
  console.log('BAD', JSON.stringify(bad));
  console.log('ERRORS', JSON.stringify(ERRORS));
  if (bad.length || ERRORS.length) process.exit(1);
})();
