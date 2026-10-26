// SQL practice (sql.json): SQLite runs in the page; chapter 16's code blocks run in place, the console runs free queries,
// gives hints for typical mistakes and checks every task on a fresh copy of the database.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const SQLJ = JSON.parse(fs.readFileSync(path.join(__dirname, 'sql.json'), 'utf8'));
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(400));
const settle = page => page.waitForFunction(() => !document.querySelector('#view .thinking'), null, { timeout: 15000 }).then(() => page.waitForTimeout(80));
async function runPre(page, sid, n) {
  const btn = page.locator(`#${sid} .sql-run [data-act="sql-pre"]`).nth(n || 0);
  await btn.click(); await settle(page);
  return btn.locator('xpath=ancestor::div[contains(@class,"sql-run")]').evaluate(el => ({
    ok: [...el.querySelectorAll('.sql-ok')].map(x => x.textContent.trim()), rows: [...el.querySelectorAll('tbody tr')].map(tr => [...tr.cells].map(td => td.textContent).join('|')),
    err: (el.querySelector('.ai-err') || {}).textContent || '', notes: [...el.querySelectorAll('.sql-warn')].map(x => x.textContent), reset: !!el.querySelector('[data-act="sql-reset"]') }));
}
async function query(page, q) {
  await page.fill('[data-sqlq]', q);
  await page.click('[data-act="sql-go"]'); await settle(page);
  return page.$eval('#sql-out', el => ({ rows: [...el.querySelectorAll('tbody tr')].map(tr => [...tr.cells].map(td => td.textContent).join('|')), cap: (el.querySelector('.sql-cap') || {}).textContent || '',
    err: (el.querySelector('.ai-err') || {}).textContent || '', notes: [...el.querySelectorAll('.sql-warn')].map(x => x.textContent), empty: !!el.querySelector('.sql-empty') }));
}
async function check(page, i, q) {
  await page.evaluate(i => { while (true) { const h = document.querySelector('#sql-task h2').textContent; const cur = +h.match(/(\d+)\//)[1] - 1; if (cur === i) break; document.querySelector(`#sql-task [data-act="sql-task"][data-d="${cur < i ? 1 : -1}"]`).click(); } }, i);
  await page.fill('[data-sqlq]', q);
  await page.click('[data-act="sql-check"]'); await page.waitForTimeout(150); await settle(page);
  return page.$eval('#sql-task', el => ({ ok: !!el.querySelector('.sm-st.ok'), msg: (el.querySelector('.sm-st') || {}).textContent || '' }));
}
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  let { browser, page, errors } = await setup({ hash: '#c16s3', w: 1024, h: 1300, wait: 1200 });
  // in the book: 16.3 creates the database, the next blocks run against it
  out.seed = await runPre(page, 'c16s3');
  await go(page, '#c16s5'); out.where = await runPre(page, 'c16s5');
  await go(page, '#c16s10'); out.write = await runPre(page, 'c16s10');
  if (!/customers — 5 sətir, orders — 7 sətir/.test(out.seed.ok.join()) || out.where.rows.join(';') !== 'Aysel Məmmədova|Bakı;Leyla Hüseynova|Bakı'
    || out.write.ok.length !== 3 || !out.write.reset) bad.push('book blocks');
  await page.screenshot({ path: 'shots/sql-book-1024.png' });
  // "Open in console" carries the query; the shared database keeps 16.10's changes until reset
  await go(page, '#c16s4');
  await page.click('#c16s4 [data-act="sql-open"][data-pre]'); await page.waitForTimeout(400);
  out.carried = await page.$eval('[data-sqlq]', e => e.value.split('\n')[0]);
  let r = await query(page, 'SELECT * FROM customers;'); out.afterWrite = r.cap;
  await page.click('.lab-card [data-act="sql-reset"]'); await page.waitForTimeout(300); await settle(page);
  r = await query(page, 'SELECT * FROM customers;'); out.afterReset = r.cap;
  out.schema = await page.$eval('#sql-schema', el => el.textContent.replace(/\s+/g, ' ').slice(0, 80));
  if (!out.carried.startsWith('SELECT * FROM customers;') || out.afterWrite !== '6 sətir' || out.afterReset !== '5 sətir' || !out.schema.includes('customers 5 sətir')) bad.push('console / reset');
  // typical mistakes get hints
  r = await query(page, 'SELECT name FROM customers WHERE email = NULL;'); out.eqNull = { empty: r.empty, note: r.notes[0] || '' };
  r = await query(page, 'SELECT * FROM customers WHERE city = Bakı;'); out.quote = r.err;
  r = await query(page, 'SELECT name FROM customers WHERE'); out.incomplete = r.err;
  r = await query(page, 'DELETE FROM orders;'); out.noWhere = r.notes[0] || '';
  r = await query(page, 'SELECT COUNT(*) FROM orders;'); out.afterDelete = r.rows[0];
  if (!out.eqNull.empty || !out.eqNull.note.includes('IS NULL') || !out.quote.includes("dırnağa al: 'Bakı'") || !out.incomplete.includes('yarımçıq')
    || !out.noWhere.includes('WHERE yoxdur') || out.afterDelete !== '0') bad.push('hints');
  // every task: the model solution passes on a fresh copy (orders is empty right now), typical wrong answers do not
  out.tasks = [];
  for (const [i, t] of SQLJ.tasks.entries()) { const v = await check(page, i, t.sol[t.sol.length - 1]); out.tasks.push(t.id + (v.ok ? '✓' : '✗ ' + v.msg)); if (!v.ok) bad.push('task ' + t.id); }
  const wrong = {
    0: 'SELECT COUNT(*) FROM customers;',
    2: 'SELECT c.name, SUM(o.total) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.name;',
    3: 'SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id;',
    5: 'SELECT name FROM customers WHERE email = NULL;',
    8: "UPDATE orders SET status = 'paid';"
  };
  out.wrong = {};
  for (const [i, q] of Object.entries(wrong)) { const v = await check(page, +i, q); out.wrong[SQLJ.tasks[i].id] = (v.ok ? 'PASSED?! ' : '') + v.msg.slice(0, 200); if (v.ok) bad.push('wrong answer passed ' + SQLJ.tasks[i].id); }
  if (!out.wrong.q3.includes('sıra fərqlidir') || !out.wrong.q9.includes('WHERE çox geniş') || !out.wrong.q6.includes('IS NULL')) bad.push('wrong-answer messages');
  out.done = await page.$eval('#sql-task .block-h .chip', el => el.textContent);
  if (out.done !== '10/10 həll') bad.push('done ' + out.done);
  await page.screenshot({ path: 'shots/sql-console-1024.png', fullPage: true });
  // entry points: a section lists its tasks and opens the console on that task; the practice tab has a card
  await go(page, '#c16s7');
  out.links = await page.$$eval('#c16s7 .sm-link button', x => x.map(b => b.textContent.trim()));
  await page.click('#c16s7 .sm-link button >> nth=2'); await page.waitForTimeout(400);
  out.opened = await page.$eval('#sql-task h2', el => el.textContent);
  await go(page, '#mesq');
  out.practice = await page.$$eval('#view [data-act="sql-open"]', x => x.length);
  if (out.links.length !== 3 || out.opened !== 'Tapşırıq 8/10' || out.practice !== 1) bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: Ctrl+Enter runs; nothing overflows
  ({ browser, page, errors } = await setup({ hash: '#sql', w: 360, h: 760, mobile: true, dark: true, wait: 1500 }));
  await settle(page);
  await page.fill('[data-sqlq]', 'SELECT c.name, o.id, o.total FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;');
  await page.press('[data-sqlq]', 'Control+Enter'); await settle(page);
  out.ctrlEnter = await page.$eval('#sql-out .sql-cap', el => el.textContent);
  await page.screenshot({ path: 'shots/sql-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.ctrlEnter !== '7 sətir' || out.overflow360 > 0) bad.push('phone');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
