// Work English practice (#ingilisce): every model answer passes its own check and the mistake rules, the rules catch what they
// promise and leave correct English alone, every drill can be done in the page, progress is kept.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');

(async () => {
  const out = {}; const ERRORS = [];
  const want = (name, ok, got) => { if (!ok) ERRORS.push(`${name}: ${JSON.stringify(got)}`); };
  const E = JSON.parse(fs.readFileSync(path.join(__dirname, 'english.json'), 'utf8'));
  const rules = E.rules.map(r => ({ ...r, rx: new RegExp(r.re, r.cs ? 'g' : 'gi') }));
  const hits = t => { const c = t.replace(/“[^”]*”|"[^"]*"/g, m => ' '.repeat(m.length)); return rules.filter(r => { r.rx.lastIndex = 0; return r.rx.test(c); }); };

  // data: models and rules, positions of the right option
  for (const d of E.drills) {
    if (d.type === 'write') {
      for (const n of d.need) want(`${d.id} model misses "${n.l}"`, new RegExp(n.re, 'i').test(d.model), d.model);
      want(`${d.id} model hits a rule`, !hits(d.model).length, hits(d.model).map(r => r.w));
    }
    if (d.type === 'build') want(`${d.id} answer hits a rule`, !hits(d.a).length, d.a);
    if (d.type === 'pick') {
      const right = d.o.find(o => o.ok);
      want(`${d.id} right option hits a rule`, !hits(right.t).filter(r => r.kind === 'err').length, right.t);
    }
  }
  const picks = E.drills.filter(d => d.type === 'pick').map(d => d.o.findIndex(o => o.ok));
  out.pickPositions = [0, 1, 2, 3].map(i => picks.filter(p => p === i).length);
  want('right option in every position', out.pickPositions.every(n => n >= 3), out.pickPositions);
  // a reader who always picks the longest option must not pass
  const longest = E.drills.filter(d => d.type === 'pick').filter(d => { const m = Math.max(...d.o.map(o => o.t.length)); return d.o.find(o => o.ok).t.length === m; }).length;
  out.longestWins = `${longest}/${picks.length}`;

  // rules: must catch
  const BAD = {
    'The button is not work.': 'is not work', "It doesn't works.": "doesn't works", 'We can to test it.': 'can to test', 'I need more informations.': 'informations',
    'an user': 'an user', 'It shows a error.': 'a error', 'I am agree.': 'I am agree', 'It is more better.': 'more better', 'It fails since 2 days.': 'since 2 days',
    'I cannot login.': 'cannot login', 'I want to setup it.': 'to setup', 'I make a test.': 'make a test', 'I wrote a bug.': 'write a bug', 'He solved the bug.': 'solve the bug',
    'Click to the button.': 'click to the button', 'Enter to the page.': 'enter to the page', 'It depends from data.': 'depends from', 'According to me it is fine.': 'according to me',
    'An error is appear.': 'is appear', 'I have a question to you.': 'a question to you', 'They are same.': 'is same', 'It fails in the Chrome.': 'in the Chrome', 'It failed in Monday.': 'in Monday',
    'Many peoples use it.': 'peoples', 'i tested it': 'i tested', 'It does not work.': 'does not work',
  };
  for (const [t, w] of Object.entries(BAD)) want(`rule misses "${t}"`, hits(t).some(r => r.w.includes(w) || w.includes(r.w.split(',')[0])), hits(t).map(r => r.w));
  // rules: must stay quiet on correct English a tester writes
  const GOOD = ['The page redirects to login page.', 'Go to checkout.', 'Proceed to checkout and click “Apply”.', 'I wrote a bug report about the cart.', 'Click to expand the menu.', 'Press to continue.',
    'The page is not open yet.', 'The total is not updated.', 'It opens in the Chrome browser.', 'The Android app crashes.', 'It happens on the Android app.', 'I cannot log in.', 'It fails with an error.', 'a user and a URL',
    'an update', 'an item', 'Same as before.', 'They are the same.', 'It has failed since Monday.', 'It failed for 2 days.', 'We run a test on Monday.', 'The login page shows “is not work” as text.'];
  for (const t of GOOD) want(`false alarm on "${t}"`, !hits(t).length, hits(t).map(r => r.w));

  let { browser, page, errors } = await setup({ hash: '#ingilisce', w: 390, h: 844, mobile: true, wait: 1200 });
  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(500); };
  want('sets drawn', (await page.$$('[data-act="en-set"]')).length === E.sets.length, 'sets');
  want('hash opens the view', await page.evaluate(() => document.body.dataset.view === 'en'), 'view');

  // play every drill the way a reader does
  for (const set of E.sets) {
    await page.click(`[data-act="en-set"][data-s="${set.id}"]`); await page.waitForTimeout(120);
    const list = E.drills.filter(d => d.set === set.id);
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      if (d.type === 'pick') {
        const wrong = d.o.findIndex(o => !o.ok);
        await page.click(`[data-act="en-pick"][data-i="${d.o.findIndex(o => o.ok)}"]`);
        want(`${d.id} verdict`, await page.$('.qz-ex .verdict.ok'), d.id);
        want(`${d.id} wrong option not used`, wrong >= 0, d.id);
      } else if (d.type === 'build') {
        const before = await page.$$eval('.en-pool [data-act="en-word"]', x => x.map(b => b.textContent));
        want(`${d.id} not already solved`, before.join(' ') !== d.a, before.join(' '));
        want(`${d.id} has every word`, [...before].sort().join(' ') === d.a.split(' ').sort().join(' '), before);
        for (const w of d.a.split(' ')) {
          const chips = await page.$$('.en-pool [data-act="en-word"]');
          for (const c of chips) { if ((await c.textContent()) === w) { await c.click(); break; } }
          await page.waitForTimeout(15);
        }
        await page.click('[data-act="en-check"]');
        want(`${d.id} solved`, await page.$('.qz-ex .verdict.ok'), d.id);
      } else {
        await page.fill('#en-t', 'some wrong text');
        await page.click('[data-act="en-write"]');
        want(`${d.id} empty answer not done`, !(await page.$('.qz-ex .verdict.ok')), d.id);
        await page.fill('#en-t', d.model);
        await page.click('[data-act="en-write"]');
        want(`${d.id} model accepted`, await page.$('.qz-ex .verdict.ok'), d.id);
      }
      await page.waitForTimeout(40);
      await page.click(i < list.length - 1 ? '[data-act="en-move"][data-d="1"]' : '[data-act="en-sets"]');
      await page.waitForTimeout(40);
    }
  }
  await page.waitForTimeout(3000);
  out.done = await page.evaluate(() => { const k = Object.keys(window.__mockDB).find(x => x.endsWith('/en')); return k ? Object.keys(window.__mockDB[k].done).length : -1; });
  want('every drill saved', out.done === E.drills.length, out.done);

  // phrases: hide and reveal, speech does not break anything
  await page.click('[data-act="en-tab"][data-t="phrases"]'); await page.waitForTimeout(100);
  out.phraseRows = (await page.$$('.en-ph-r')).length;
  want('all phrases drawn', out.phraseRows === E.phrases.reduce((a, g) => a + g.items.length, 0), out.phraseRows);
  const sayBtn = await page.$('[data-act="en-say"]');
  if (sayBtn) await sayBtn.click();
  await page.check('#en-hide'); await page.waitForTimeout(100);
  want('english hidden', !(await page.$('.en-en')) && (await page.$('[data-act="en-reveal"]')), 'hide');
  await page.click('[data-act="en-reveal"] >> nth=0'); await page.waitForTimeout(80);
  want('one revealed', (await page.$$('.en-en')).length === 1, 'reveal');
  await page.screenshot({ path: 'shots/en-phrases-390.png' });

  // mistakes: free text
  await page.click('[data-act="en-tab"][data-t="rules"]'); await page.waitForTimeout(100);
  await page.fill('#en-own', 'The login is not work since 2 days. I wrote a bug. “is not work” is on the page.');
  await page.click('[data-act="en-own"]'); await page.waitForTimeout(100);
  out.own = await page.$$eval('.swc mark', x => x.map(m => m.textContent));
  want('own text checked', out.own.length === 3, out.own);
  want('own text stays', (await page.$eval('#en-own', e => e.value)).startsWith('The login'), 'own');
  await page.fill('#en-own', 'The total is not updated.');
  await page.click('[data-act="en-own"]'); await page.waitForTimeout(100);
  want('clean text', (await page.$eval('.qz-ex', e => e.textContent)).includes('tapılmadı'), 'clean');
  await page.screenshot({ path: 'shots/en-rules-390.png' });
  out.overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  want('no overflow on a phone', out.overflow <= 0, out.overflow);

  // section links and the practice tab
  await go('#c21x2');
  want('section links the practice', await page.$('#c21x2 [data-act="en-open"], [data-act="en-open"]'), 'link');
  await go('#mesq');
  want('practice card', await page.$('[data-act="en-open"]'), 'card');
  ERRORS.push(...errors); await browser.close();

  // a fresh reader: a wrong word order is refused, removing a word puts it back, then the answer can be shown
  ({ browser, page, errors } = await setup({ hash: '#ingilisce', w: 390, h: 844, mobile: true, wait: 1200 }));
  const d5 = E.drills.find(d => d.id === 'b5');
  await page.click('[data-act="en-set"][data-s="bug"]'); await page.waitForTimeout(100);
  while ((await page.$eval('.qz-q', e => e.textContent)) !== d5.q) { await page.click('[data-act="en-move"][data-d="1"]'); await page.waitForTimeout(40); }
  for (const w of d5.a.split(' ').reverse()) {
    const chips = await page.$$('.en-pool [data-act="en-word"]');
    for (const c of chips) { if ((await c.textContent()) === w) { await c.click(); break; } }
    await page.waitForTimeout(15);
  }
  await page.click('.en-line [data-act="en-word"] >> nth=0'); await page.waitForTimeout(40);
  want('word goes back to the pool', (await page.$$('.en-pool [data-act="en-word"]')).length === 1, 'pool');
  want('check waits for all words', await page.$eval('[data-act="en-check"]', b => b.disabled), 'disabled');
  await page.click('.en-pool [data-act="en-word"]'); await page.waitForTimeout(40);
  await page.click('[data-act="en-check"]'); await page.waitForTimeout(40);
  want('wrong order refused', await page.$('.qz-ex .verdict.no'), 'refused');
  await page.click('[data-act="en-show"]'); await page.waitForTimeout(40);
  want('answer shown', (await page.$eval('.qz-ex', e => e.textContent)).includes(d5.a), 'shown');
  await page.screenshot({ path: 'shots/en-build-390.png' });
  ERRORS.push(...errors); await browser.close();

  // PC, dark
  ({ browser, page, errors } = await setup({ hash: '#ingilisce', w: 1280, h: 900, dark: true, wait: 1200 }));
  await page.click('[data-act="en-set"][data-s="bug"]'); await page.waitForTimeout(100);
  await page.screenshot({ path: 'shots/en-pick-1280-dark.png' });
  ERRORS.push(...errors); await browser.close();

  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
