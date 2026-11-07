// Work process and thin CTFL topics: new sections with their layers and answers, the coverage widget against the code really run,
// 3-value BVA by the ISTQB rule, the new exercises and the corrected statements.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');

// run the widget's own code, instrumented, and compare it with its hand-written lines and branches
function coverageData(c) {
  const bad = [];
  const ids = ['a', 'b'];
  let k = 0;
  const src = c.code.map((line, i) => {
    const n = i + 1;
    let l = line.replace(/if \((.*)\) \{/, (_, cond) => `if (__b('${ids[k++]}', ${cond})) {`);
    if (c.stmts.includes(n)) l = `__s(${n});` + l;
    return l;
  }).join('\n');
  for (const t of c.tests) {
    const lines = new Set(), br = new Set();
    const fn = new Function('__s', '__b', `${src}\nreturn ${t.label};`);
    const ret = fn(n => lines.add(n), (id, v) => { br.add(id + (v ? '1' : '0')); return v; });
    const same = (a, b) => [...a].sort().join() === [...b].sort().join();
    if (ret !== t.ret) bad.push(`${t.label} returns ${ret}, data says ${t.ret}`);
    if (!same(lines, t.lines)) bad.push(`${t.label} lines ${[...lines]} vs ${t.lines}`);
    if (!same(br, t.br)) bad.push(`${t.label} branches ${[...br]} vs ${t.br}`);
  }
  return bad;
}

(async () => {
  const out = {}; const ERRORS = [];
  const ix = JSON.parse(fs.readFileSync(path.join(__dirname, 'interactive.json'), 'utf8'));
  ERRORS.push(...coverageData(ix.c7x2).map(x => 'coverage data: ' + x));

  let { browser, page, errors } = await setup({ hash: '#c7x2', w: 1024, h: 1100, wait: 1200 });
  const want = (name, ok, got) => { if (!ok) ERRORS.push(`${name}: ${JSON.stringify(got)}`); };

  // every new section has its depth layers and a mini-task answer; glossary and quiz grew
  const NEW = ['c3x3', 'c3x4', 'c4x2', 'c4x3', 'c4x4', 'c4x5', 'c7x2', 'c7x3', 'c8x1', 'c9x1', 'c10x1', 'c11x3', 'c12x1', 'c12x2', 'c12x3', 'c21x1'];
  const book = await page.evaluate(() => JSON.parse(document.getElementById('book-data').textContent));
  const secs = Object.fromEntries(book.chapters.flatMap(c => c.sections).map(s => [s.id, s]));
  for (const sid of NEW) {
    const s = secs[sid];
    want(`section ${sid}`, s && s.x && s.x.keys.length === 3 && s.x.ex.ans && s.x.ex.ans.a && s.x.ex.ans.h, sid);
    if (s) want(`section ${sid} steps`, s.x.ex.steps.length >= 3 && s.x.ex.steps.length <= 6, s.x.ex.steps.length);
  }
  out.glossary = book.glossary.length;
  want('glossary size', book.glossary.length === 125, book.glossary.length);
  const ids = book.glossary.map(g => g.id);
  want('glossary ids unique', new Set(ids).size === ids.length, ids.length);
  for (const en of ['Definition of Ready', 'Bug triage', 'Each Choice coverage', 'Hotfix', 'Test basis']) want(`term ${en}`, book.glossary.some(g => g.en === en && g.say), en);
  const qs = Object.values(book.quizzes).flat();
  out.quiz = qs.length;
  for (const q of qs) want(`quiz ${q.id}`, new Set(q.o).size === 4 && q.sec, q.q);

  // the map points at the new sections
  const map = book.ctfl.flatMap(c => c.topics);
  const topic = c => map.find(t => t.c === c);
  want('ctfl white-box', topic('4.3').s.includes('c7x2'), topic('4.3').s);
  want('ctfl black-box', topic('4.2').s.includes('c8x1') && topic('4.2').s.includes('c9x1'), topic('4.2').s);
  want('ctfl activities', topic('1.4').s.includes('c4x2'), topic('1.4').s);
  want('ctfl tools', topic('6.1').s.includes('c11s8'), topic('6.1').s);

  // corrected statements: none of the old claims survive
  const all = JSON.stringify(book);
  for (const old of ['QA-nın içində', 'adətən 100% statement', 'hər 10 test case-ə düşən', '17, 18, 19 yazılıb', '59, 60, 61 |', 'fault masking', 'Owner-ə sor', 'kodun hər sətri', 'statement coverage hər sətrin', 'Major həlsiz']) want(`old text "${old}"`, !all.includes(old), old);

  // coverage widget
  const S = '[data-ix="c7x2"]';
  await page.waitForSelector(S);
  const info = () => page.$eval(`${S} .ix-info`, el => el.innerText.replace(/\s+/g, ' '));
  const press = t => page.click(`${S} [data-act="ix-cov"][data-t="${t}"]`);
  out.t1 = await info();
  want('one test: statement 100, branch 50', /Statement coverage: 6 \/ 6 = 100%/.test(out.t1) && /Branch coverage: 2 \/ 4 = 50%/.test(out.t1) && /100% statement 100% branch demək deyil/.test(out.t1), out.t1);
  want('lines hit', (await page.$$(`${S} .cov-l.hit`)).length === 6 && (await page.$$(`${S} .cov-l.miss`)).length === 0, 'hit');
  await press('t2');
  out.t12 = await info();
  want('two tests: both 100', /Branch coverage: 4 \/ 4 = 100%/.test(out.t12) && /total > 100/.test(out.t12), out.t12);
  await press('t1');
  out.t2 = await info();
  want('second test alone', /Statement coverage: 4 \/ 6 = 67%/.test(out.t2) && /Branch coverage: 2 \/ 4 = 50%/.test(out.t2) && /yoxlanmayıb/.test(out.t2), out.t2);
  want('missed lines', (await page.$$(`${S} .cov-l.miss`)).length === 2, 'miss');
  await press('t2');
  out.none = await info();
  want('no tests', /0 \/ 6 = 0%/.test(out.none) && /Test seçilməyib/.test(out.none), out.none);
  await press('t3'); await press('t4');
  out.t34 = await info();
  want('other pair', /6 \/ 6 = 100%/.test(out.t34) && /4 \/ 4 = 100%/.test(out.t34), out.t34);
  await page.$eval(S, el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/ix-cover-1024.png' });

  // the BVA slider counts 3-value items the ISTQB way
  await page.evaluate(() => { location.hash = '#c8s3'; }); await page.waitForTimeout(900);
  await page.check('[data-ix="c8s3"] [data-ix-tg="three"]');
  out.chips3 = await page.$$eval('[data-ix="c8s3"] [data-act="ix-set"]', els => els.map(e => e.dataset.v).join(','));
  want('3-value chips', out.chips3 === '35,16,17,18,19,59,60,61,62', out.chips3);
  await page.click('[data-ix="c8s3"] [data-act="ix-set"][data-v="16"]');
  out.bva16 = await page.$eval('[data-ix="c8s3"] .ix-info', el => el.innerText.replace(/\s+/g, ' '));
  want('16 explained', /qonşu sinfin sərhəd dəyərinin qonşusu/.test(out.bva16) && /Xəta/.test(out.bva16), out.bva16);

  // new exercises are drawn; the release section links to the practice
  for (const [hash, sel, name] of [['#c4x2', '.srt, [data-srt]', 'sorting in 4.7'], ['#c4x4', '.srt, [data-srt]', 'sorting in 4.9'], ['#c3x3', '.cmp', 'card in 3.11'], ['#c12x1', '.cmp', 'card in 12.10'], ['#c4x5', '[data-act="rel-open"], [data-act="go"][data-to="reliz"], a[href="#reliz"]', 'release link in 4.10']]) {
    await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(700);
    want(name, await page.$(sel), hash);
  }

  // 9.7 draws its tables
  await page.evaluate(() => { location.hash = '#c9x1'; }); await page.waitForTimeout(800);
  out.c9x1table = await page.$$eval('.prose table', t => t.length);
  want('9.7 tables', out.c9x1table >= 3, out.c9x1table);

  ERRORS.push(...errors); await browser.close();

  // phone, dark: the code block scrolls inside itself, the page does not
  ({ browser, page, errors } = await setup({ hash: '#c7x2', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await page.waitForSelector(S);
  await page.$eval(S, el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'shots/ix-cover-360-dark.png' });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  want('no overflow on a phone', out.overflow360 <= 0, out.overflow360);
  ERRORS.push(...errors); await browser.close();

  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
