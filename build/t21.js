// Practice API (api.json): every task is done through the Postman-like panel, the five planted bugs are found, tests built
// from rows run and show their pm code, environment variables flow from a response into the next request.
const { setup } = require('./harness');
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
async function tab(page, k) { await page.click(`#lab-req [data-act="lab-tab"][data-v="${k}"]`); await page.waitForTimeout(40); }
async function send(page, m, url, body, hdrs) {
  await page.selectOption('#lab-req [data-lab="m"]', m); await page.waitForTimeout(30);
  await page.fill('#lab-req [data-lab="url"]', url);
  await tab(page, 'body'); await page.fill('#lab-req [data-lab="body"]', body || '');
  await tab(page, 'hdrs'); await page.fill('#lab-req [data-lab="hdrs"]', hdrs || '');
  await page.click('#lab-req [data-act="lab-send"]');
  await page.waitForSelector('#lab-res .lab-st, #lab-res .ai-err', { timeout: 3000 });
  return res(page);
}
const res = page => page.$eval('#lab-res', el => ({
  st: (el.querySelector('.lab-st .chip') || {}).textContent || '', err: (el.querySelector('.ai-err') || {}).textContent || '',
  body: (el.querySelector('.lab-json') || {}).textContent || '', tests: (el.querySelector('.lab-meta .ok, .lab-meta .no') || {}).textContent || '',
  note: (el.querySelector('.sm-note') || {}).textContent || '' }));
const AUTH = 'Authorization: Bearer {{token}}';
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  let { browser, page, errors } = await setup({ hash: '#api', w: 1024, h: 1300, wait: 1200 });
  const tasks = () => page.$eval('#lab-tasks .block-h .chip', el => el.textContent);
  const bugs = () => page.$eval('#lab-bugs .block-h .chip', el => el.textContent);
  out.start = { tasks: await tasks(), bugs: await bugs(), url: await page.$eval('#lab-req [data-lab="url"]', e => e.value) };
  // A1 + A9: the default request with its status test, then a body test; the pm code follows the rows
  let r = await send(page, 'GET', '{{baseUrl}}/products');
  out.a1 = { st: r.st, count: JSON.parse(r.body).length, tests: r.tests };
  await tab(page, 'tests');
  await page.click('#lab-req [data-act="lab-tadd"]'); await page.waitForTimeout(40);
  await page.fill('#lab-req [data-lt="1:p"]', 'length'); await page.fill('#lab-req [data-lt="1:v"]', '6');
  out.code = await page.$eval('#lab-code', el => el.textContent);
  await page.click('#lab-req [data-act="lab-send"]'); await page.waitForTimeout(450);
  out.a9 = (await res(page)).tests;
  if (out.a1.st !== '200 OK' || out.a1.count !== 6 || out.a9 !== 'Tests: 2/2' || !out.code.includes('pm.expect(data.length).to.eql(6)') || !out.code.includes('pm.response.to.have.status(200)')) bad.push('a1/a9');
  await page.click('#lab-req [data-act="lab-tdel"][data-i="1"]'); await page.click('#lab-req [data-act="lab-tdel"][data-i="0"]'); await page.waitForTimeout(40);
  // A2–A4
  r = await send(page, 'GET', '{{baseUrl}}/products/3'); out.a2 = r.st + ' ' + JSON.parse(r.body).name;
  r = await send(page, 'GET', '{{baseUrl}}/products/999'); out.a3 = r.st;
  r = await send(page, 'DELETE', '{{baseUrl}}/products/1'); out.a4 = r.st;
  await page.click('#lab-res [data-act="lab-rtab"][data-v="hdrs"]'); await page.waitForTimeout(40);
  out.allow = await page.$eval('#lab-res table', el => el.textContent.includes('AllowGET'));
  await page.click('#lab-res [data-act="lab-rtab"][data-v="body"]');
  if (out.a2 !== '200 OK Bolt T-Shirt' || out.a3 !== '404 Not Found' || out.a4 !== '405 Method Not Allowed' || !out.allow) bad.push('a2–a4');
  // A5: login, the token goes into the environment through a "set" row
  await tab(page, 'tests');
  await page.click('#lab-req [data-act="lab-tadd"]'); await page.waitForTimeout(40);
  await page.selectOption('#lab-req [data-lt="0:t"]', 'set'); await page.waitForTimeout(40);
  await page.fill('#lab-req [data-lt="0:name"]', 'token'); await page.fill('#lab-req [data-lt="0:p"]', 'token');
  out.setCode = await page.$eval('#lab-code', el => el.textContent);
  r = await send(page, 'POST', '{{baseUrl}}/login', '{"username": "standard_user", "password": "secret_sauce"}');
  out.a5 = { st: r.st, env: await page.$eval('#lab-env [data-le="1"]', e => e.value) };
  if (out.a5.st !== '200 OK' || !/^tok_/.test(out.a5.env) || !out.setCode.includes('pm.environment.set("token", data.token);')) bad.push('a5');
  await tab(page, 'tests'); await page.click('#lab-req [data-act="lab-tdel"][data-i="0"]');
  // A6–A8
  r = await send(page, 'GET', '{{baseUrl}}/cart'); out.a6 = r.st;
  await tab(page, 'hdrs'); await page.click('#lab-req [data-act="lab-auth"]'); await page.waitForTimeout(40);
  out.authBtn = await page.$eval('#lab-req [data-lab="hdrs"]', e => e.value);
  r = await send(page, 'POST', '{{baseUrl}}/cart', '{"productId": 1}', AUTH); out.a7 = r.st + ' ' + JSON.parse(r.body).total;
  r = await send(page, 'POST', '{{baseUrl}}/cart', '{"productId": 1}', AUTH); out.a8 = r.st;
  if (out.a6 !== '401 Unauthorized' || out.authBtn !== AUTH || out.a7 !== '201 Created 29.99' || out.a8 !== '409 Conflict') bad.push('a6–a8');
  // A10: PATCH changes one field, PUT needs all of them
  r = await send(page, 'PATCH', '{{baseUrl}}/users/me', '{"phone": "+994501234567"}', AUTH); out.a10 = [r.st, JSON.parse(r.body).phone];
  r = await send(page, 'PUT', '{{baseUrl}}/users/me', '{"phone": "+994501234567"}', AUTH); out.a10.push(r.st, JSON.parse(r.body).error);
  if (out.a10.join('|') !== '200 OK|+994501234567|400 Bad Request|PUT replaces the whole profile. Missing fields: firstName, lastName, email') bad.push('a10');
  // A11, A12: planted bugs
  r = await send(page, 'POST', '{{baseUrl}}/cart', '{"productId": "1"}', AUTH); out.a11 = r.st;
  r = await send(page, 'GET', '{{baseUrl}}/orders/1001', '', AUTH); out.a12 = r.st + ' ' + JSON.parse(r.body).lastName;
  if (out.a11 !== '500 Internal Server Error' || out.a12 !== '200 OK Quliyev') bad.push('a11/a12');
  out.tasks = await tasks();
  if (out.tasks !== '12/12') bad.push('tasks ' + out.tasks);
  // the other three bugs: pagination, a long name, problem_user's delete that keeps the item
  r = await send(page, 'GET', '{{baseUrl}}/products?limit=2&page=2'); out.page = JSON.parse(r.body).map(p => p.name).join(',');
  await send(page, 'POST', '{{baseUrl}}/cart', '{"productId": 2}', AUTH);
  r = await send(page, 'POST', '{{baseUrl}}/orders', JSON.stringify({ firstName: 'A'.repeat(51), lastName: 'Aliyev', zip: '1000' }), AUTH); out.long = r.st;
  r = await send(page, 'POST', '{{baseUrl}}/orders', JSON.stringify({ firstName: 'Ali', lastName: 'Aliyev', zip: '1000' }), AUTH); out.emptyCart = r.st;
  r = await send(page, 'POST', '{{baseUrl}}/login', '{"username": "problem_user", "password": "secret_sauce"}');
  await page.fill('#lab-env [data-le="1"]', JSON.parse(r.body).token);
  await send(page, 'POST', '{{baseUrl}}/cart', '{"productId": 3}', AUTH);
  r = await send(page, 'DELETE', '{{baseUrl}}/cart/3', '', AUTH); out.ghostDelete = r.st + ' ' + JSON.parse(r.body).items.length;
  r = await send(page, 'GET', '{{baseUrl}}/cart', '', AUTH); out.ghostGet = JSON.parse(r.body).items.length;
  out.bugs = await bugs();
  if (out.page !== 'Backpack,Bike Light' || out.long !== '201 Created' || out.emptyCart !== '422 Unprocessable Content' || out.ghostDelete !== '200 OK 0' || out.ghostGet !== 1 || out.bugs !== '5/5') bad.push('hidden bugs');
  // mistakes a tester makes: another host, broken JSON, an unknown variable; Enter in the URL sends
  r = await send(page, 'GET', 'https://ministore.com/products'); out.host = r.err.slice(0, 60);
  r = await send(page, 'POST', '{{baseUrl}}/cart', '{"productId": 1,}', AUTH); out.json = r.st + ' ' + JSON.parse(r.body).error;
  r = await send(page, 'GET', '{{baseUrl}}/products/{{productId}}'); out.unknownVar = r.st + ' | ' + r.note.slice(0, 40);
  await page.fill('#lab-req [data-lab="url"]', '{{baseUrl}}/products/5'); await page.press('#lab-req [data-lab="url"]', 'Enter'); await page.waitForTimeout(450);
  out.enter = (await res(page)).st;
  if (!out.host.includes('ENOTFOUND') || out.json !== '400 Bad Request Invalid JSON body' || !out.unknownVar.startsWith('400') || !out.unknownVar.includes('{{productId}}') || out.enter !== '200 OK') bad.push('mistakes');
  // history reloads a request; the API document lists the endpoints
  await page.click('#lab-bugs [data-act="lab-hist"][data-i="3"]'); await page.waitForTimeout(80);
  out.hist = await page.$eval('#lab-req [data-lab="url"]', e => e.value);
  out.doc = await page.$$eval('.lab-ep', x => x.length);
  if (out.hist !== '{{baseUrl}}/cart' || out.doc !== 12) bad.push('history / doc');
  await page.click('details.lab-card summary'); await page.waitForTimeout(80);
  await page.screenshot({ path: 'shots/api-1024.png', fullPage: true });
  // entry points: a book section lists its tasks, the practice tab has a card; Back returns to the section
  await go(page, '#c15s5');
  out.section = await page.$$eval('#c15s5 .sm-link button', x => x.map(b => b.textContent.trim()));
  await page.click('#c15s5 .sm-link button >> nth=0'); await page.waitForTimeout(300);
  out.opened = await page.$$eval('#lab-req', x => x.length);
  await page.click('#topbar [data-act="back"]'); await page.waitForTimeout(400);
  out.back = await page.$$eval('#c15s5', x => x.length);
  await go(page, '#mesq');
  out.practice = await page.$$eval('#view [data-act="lab-open"]', x => x.length);
  if (out.section.length !== 3 || !out.section.every(t => t.startsWith('✓')) || !out.opened || !out.back || out.practice !== 1) bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: the panel fits; reset clears the token and the carts
  ({ browser, page, errors } = await setup({ hash: '#api', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await send(page, 'GET', '{{baseUrl}}/products');
  await tab(page, 'tests');
  await page.screenshot({ path: 'shots/api-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
