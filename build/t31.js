// The framework part of the Playwright practice (19.7, 19.12–19.16): Page Object classes, data-driven tests, fixtures with
// clean-up, the request fixture on the practice API, saved login state, test.step, and what the reader's code cannot reach.
const { setup } = require('./harness');
const IMP = "import { test, expect } from '@playwright/test';";
const LOGIN = u => [`await page.goto('https://www.saucedemo.com/');`, `await page.getByPlaceholder('Username').fill('${u}');`, `await page.getByPlaceholder('Password').fill('secret_sauce');`, `await page.getByRole('button', { name: 'Login' }).click();`].join('\n');
const CLS = `class LoginPage {
  constructor(page) { this.page = page; this.user = page.getByPlaceholder('Username'); this.pass = page.getByPlaceholder('Password'); this.btn = page.getByRole('button', { name: 'Login' }); }
  async open() { await this.page.goto('https://www.saucedemo.com/'); }
  async login(u, p) { await this.user.fill(u); await this.pass.fill(p); await this.btn.click(); }
  async heading() { return await this.page.locator('.title').textContent(); }
}`;
const API = 'https://api.ministore.test';
async function run(page, code) {
  await page.fill('#pw-ed', code); await page.click('[data-act="pw-run"]'); await page.waitForTimeout(150);
  return page.$eval('#pw-out', el => ({
    sum: (el.querySelector('.tr-sum') || {}).textContent || '', err: (el.querySelector('.pw-err') || {}).textContent || '', hint: (el.querySelector('.pw-hint') || {}).textContent || '',
    lint: [...el.querySelectorAll('.pw-lint li')].map(l => l.textContent.trim()).join(' | '),
    steps: [...el.querySelectorAll('.pw-steps button')].map(b => b.className.replace(' cur', '') + ' ' + b.textContent.trim()), out: (el.querySelector('.tr-out') || {}).textContent || '' }));
}
(async () => {
  const out = {}, bad = [];
  const { browser, page, errors } = await setup({ hash: '#playwright-pw1', w: 1024, h: 1300, wait: 1200 });
  const want = (name, cond, got) => { out[name] = got; if (!cond) bad.push(name); };
  let r;
  // ---- Page Object
  r = await run(page, `${IMP}\n${CLS}\ntest('t', async ({ page }) => {\n  const p = new LoginPage(page);\n  await p.open();\n  await p.login('standard_user', 'secret_sauce');\n  expect(await p.heading()).toBe('Products');\n});`);
  want('pom', /1 passed/.test(r.sum) && !r.err, r.sum + r.err);
  r = await run(page, `${IMP}\n${CLS}\ntest('t', async ({ page }) => {\n  const p = new LoginPage(page);\n  await p.open();\n  p.login('standard_user', 'secret_sauce');\n  await expect(page).toHaveURL(/inventory/);\n});`);
  want('pomNoAwait', /await yoxdur/.test(r.lint) && !r.sum.includes('passed'), r.lint);
  r = await run(page, `${IMP}\n${CLS}\ntest('t', async ({ page }) => {\n  const p = new LoginPage(page);\n  await p.logn('a', 'b');\n  await expect(page).toHaveURL(/inventory/);\n});`);
  want('pomTypo', /p\.logn is not a function/.test(r.err) && /login/.test(r.hint), r.err + ' ' + r.hint);
  r = await run(page, `${IMP}\ntest('t', async ({ page }) => {\n  const p = new LoginPage(page);\n  await expect(page).toHaveURL(/x/);\n});`);
  want('pomMissing', /LoginPage is not defined/.test(r.err) && /eyni redaktorda/.test(r.hint), r.err + ' ' + r.hint);
  // ---- Data-driven
  const rows = "const cases = [\n{ u: 'locked_out_user', e: 'locked out' },\n{ u: 'standard_user', e: 'səhv mətn' },\n{ u: '', e: 'Username is required' },\n];\n";
  const loop = name => `for (const { u, e } of cases) {\n  test(${name}, async ({ page }) => {\n    await page.goto('https://www.saucedemo.com/');\n    await page.getByPlaceholder('Username').fill(u);\n    await page.getByPlaceholder('Password').fill('secret_sauce');\n    await page.getByRole('button', { name: 'Login' }).click();\n    await expect(page.locator('[data-test="error"]')).toContainText(e);\n  });\n}`;
  r = await run(page, `${IMP}\n${rows}${loop('`xəta: ${u}`')}`);
  want('dataRows', /1 failed/.test(r.sum) && /2 passed/.test(r.sum), r.sum); // one bad row does not stop the others
  r = await run(page, `${IMP}\n${rows}${loop("'eyni ad'")}`);
  want('dataDuplicate', /duplicate test title/.test(r.lint), r.lint);
  // ---- Fixtures: set-up before the test, clean-up after it, even when the test fails
  const fx = (after = "console.log('təmizlik');") => `import { test as base, expect } from '@playwright/test';\nconst test = base.extend({\n  ready: async ({ page }, use) => {\n    console.log('hazırlıq');\n${LOGIN('standard_user')}\n    await use(page);\n    ${after}\n  },\n});\n`;
  r = await run(page, `${fx()}test('keçir', async ({ ready }) => {\n  console.log('test');\n  await expect(ready).toHaveURL(/inventory/);\n});`);
  want('fixtureOrder', /1 passed/.test(r.sum) && r.out.replace(/\s+/g, ' ').includes('hazırlıq test təmizlik'), r.sum + ' / ' + r.out);
  r = await run(page, `${fx()}test('düşür', async ({ ready }) => {\n  await expect(ready).toHaveURL(/yoxdur/);\n});`);
  want('fixtureCleanupOnFail', /1 failed/.test(r.sum) && r.out.includes('təmizlik'), r.sum + ' / ' + r.out);
  r = await run(page, `import { test as base, expect } from '@playwright/test';\nconst test = base.extend({\n  ready: async ({ page }, use) => {\n    await page.goto('https://www.saucedemo.com/');\n  },\n});\ntest('t', async ({ ready }) => {\n  await expect(ready).toHaveURL(/x/);\n});`);
  want('fixtureNoUse', /while setting up "ready"/.test(r.err) && /await use/.test(r.hint), r.err);
  r = await run(page, `import { test as base, expect } from '@playwright/test';\nconst test = base.extend({\n  ready: async ({ page }, use) => {\n    use(page);\n  },\n});\ntest('t', async ({ ready }) => {\n  await expect(ready).toHaveURL(/x/);\n});`);
  want('fixtureUseNoAwait', /await yoxdur: use/.test(r.lint), r.lint);
  r = await run(page, `${IMP}\ntest('t', async ({ page, olmayan }) => {\n  await expect(page).toHaveURL(/x/);\n});`);
  want('fixtureUnknown', /unknown parameter "olmayan"/.test(r.err), r.err);
  r = await run(page, `${IMP}\ntest('t', async (page) => {\n  await expect(page).toHaveURL(/x/);\n});`);
  want('fixturePattern', /object destructuring pattern/.test(r.err), r.err);
  r = await run(page, `${IMP}\ntest('t', async () => {\n  await page.goto('https://www.saucedemo.com/');\n  await expect(page).toHaveURL(/x/);\n});`);
  want('pageNotAsked', /page is not defined/.test(r.err) && /fixture/.test(r.hint), r.err);
  // ---- API
  r = await run(page, `${IMP}\nconst API = '${API}';\ntest('t', async ({ request }) => {\n  const res = await request.get(\`\${API}/products/1\`);\n  expect(res.status()).toBe(200);\n  expect(res.ok()).toBeTruthy();\n  const p = await res.json();\n  expect(p.id).toBe(1);\n  expect(p).toHaveProperty('price');\n});`);
  want('apiGet', /1 passed/.test(r.sum), r.sum + r.err);
  r = await run(page, `${IMP}\ntest('t', async ({ request }) => {\n  const res = await request.get('${API}/products/1');\n  const p = res.json();\n  expect(p.id).toBe(1);\n});`);
  want('apiNoAwait', /await yoxdur/.test(r.lint), r.lint);
  r = await run(page, `${IMP}\ntest('t', async ({ request }) => {\n  const res = await request.get('https://jsonplaceholder.typicode.com/users/1');\n  expect(res.status()).toBe(200);\n});`);
  want('apiHost', /ENOTFOUND jsonplaceholder/.test(r.err) && /Mini Store API/.test(r.hint), r.err);
  r = await run(page, `${IMP}\ntest('t', async ({ request }) => {\n  const res = await request.get('${API}/cart');\n  await expect(res).toBeOK();\n});`);
  want('apiNoToken', /Received: 401/.test(r.err), r.err);
  r = await run(page, `${IMP}\nconst API = '${API}';\ntest('giriş', async ({ request }) => {\n  const login = await request.post(\`\${API}/login\`, { data: { username: 'standard_user', password: process.env.SAUCE_PASSWORD } });\n  const { token } = await login.json();\n  const add = await request.post(\`\${API}/cart\`, { data: { productId: 2 }, headers: { Authorization: \`Bearer \${token}\` } });\n  expect(add.status()).toBe(201);\n  const again = await request.post(\`\${API}/cart\`, { data: { productId: 2 }, headers: { Authorization: \`Bearer \${token}\` } });\n  expect(again.status()).toBe(409);\n});`);
  want('apiTokenFlow', /1 passed/.test(r.sum), r.sum + r.err);
  // ---- saved login state
  const save = `test('saxla', async ({ page }) => {\n${LOGIN('standard_user')}\n  await page.context().storageState({ path: 'u.json' });\n  await expect(page).toHaveURL(/inventory/);\n});\n`;
  r = await run(page, `${IMP}\n${save}test.describe('q', () => {\n  test.use({ storageState: 'u.json' });\n  test('səbət', async ({ page }) => {\n    await page.goto('https://www.saucedemo.com/cart.html');\n    await expect(page.getByText('Your Cart')).toBeVisible();\n  });\n});`);
  want('stateWorks', /2 passed/.test(r.sum), r.sum + r.err);
  r = await run(page, `${IMP}\ntest.use({ storageState: 'yoxdur.json' });\ntest('t', async ({ page }) => {\n  await page.goto('https://www.saucedemo.com/cart.html');\n  await expect(page.getByText('Your Cart')).toBeVisible();\n});`);
  want('stateMissing', /ENOENT/.test(r.err) && /setup/.test(r.hint), r.err);
  r = await run(page, `${IMP}\n${save}test.describe('q', () => {\n  test.use({ storageState: { cookies: [], origins: [] } });\n  test('boş', async ({ page }) => {\n    await page.goto('https://www.saucedemo.com/cart.html');\n    await expect(page.locator('[data-test="error"]')).toContainText('logged in');\n  });\n});`);
  want('stateEmpty', /2 passed/.test(r.sum), r.sum + r.err);
  // ---- baseURL, test.step, tags, sorting
  r = await run(page, `${IMP}\ntest.use({ baseURL: 'https://www.saucedemo.com' });\ntest('addımlar', { tag: '@smoke' }, async ({ page }) => {\n  await test.step('giriş', async () => {\n    await page.goto('/');\n    await page.getByPlaceholder('Username').fill('standard_user');\n    await page.getByPlaceholder('Password').fill('secret_sauce');\n    await page.getByRole('button', { name: 'Login' }).click();\n  });\n  await test.step('yoxla', async () => {\n    await expect(page).toHaveURL(/inventory/);\n  });\n});`);
  want('stepBase', /1 passed/.test(r.sum) && !/yoxlama \(expect\) yoxdur/.test(r.lint), r.sum + r.err + r.lint);
  r = await run(page, `${IMP}\ntest('sıra', async ({ page }) => {\n${LOGIN('standard_user')}\n  await page.locator('[data-test="product-sort-container"]').selectOption({ label: 'Name (Z to A)' });\n  const names = await page.locator('.inventory_item_name').allTextContents();\n  expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));\n  expect(names).toHaveLength(6);\n});`);
  want('sortZA', /1 passed/.test(r.sum), r.sum + r.err);
  r = await run(page, `${IMP}\nlet shared;\ntest('bağlılıq', async ({ page }) => {\n  let total = 0;\n  await test.step('s', async () => { total = 2; });\n  for (const x of [1, 2]) { console.log(\`x=\${x}\`); }\n  if (total) { console.log('var'); } else { console.log('yox'); }\n  expect(total).toBe(2);\n});`);
  want('closure', /1 passed/.test(r.sum) && /x=1/.test(r.out) && /var/.test(r.out), r.sum + r.err + r.out);
  // ---- the reader's code reaches nothing but the model
  for (const [name, line, re] of [
    ['noWindow', 'const w = window;', /window is not defined/],
    ['noDocument', 'const w = document.cookie;', /document is not defined/],
    ['noCtor', "const f = Number.constructor('return 1');", /bu modeldə yoxdur|not a function/],
    ['noCtorStr', "const f = 'a'['constructor']('return 1');", /not a function/],
    ['noProto', "const o = {}; const f = o.constructor('return 1');", /not a function/],
  ]) {
    r = await run(page, `${IMP}\ntest('t', async ({ page }) => {\n  ${line}\n  expect(1).toBe(1);\n});`);
    want(name, re.test(r.err), r.err);
  }
  r = await run(page, `${IMP}\ntest('t', async ({ page }) => {\n  const a = 1 + 2;\n  expect(a).toBe(3);\n});`);
  want('operatorHint', /gözlənilməz simvol/.test(r.err) && /operator/.test(r.hint), r.err);
  out.errors = errors; out.bad = bad;
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', JSON.stringify(errors.concat(bad)));
  await browser.close();
  if (errors.length || bad.length) process.exit(1);
})();
