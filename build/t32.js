// Interview practice and scripted role plays. With Claude off: every preset's data, a run to the result, saved across a
// reload, the weak-question repeat, the timer; every script's graph over all its paths, the best, the worst and a middle way
// through the page; the scoring cannot be passed without reading (one letter, the longest answer). With Claude on: the way to
// the free conversation.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const SC = JSON.parse(fs.readFileSync(path.join(__dirname, 'roleplay_script.json'), 'utf8'));
const IV = JSON.parse(fs.readFileSync(path.join(__dirname, 'interview_sim.json'), 'utf8'));
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(350));
const nextOf = (n, o) => o.to || n.to;
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
// the page's own rule (rsState): keep it the same
function verdict(opts) {
  const pct = opts.reduce((a, o) => a + o.q, 0) / (opts.length * 2), last = opts[opts.length - 1];
  const end = opts.some(o => o.fail) || pct < .6 ? 'bad' : pct >= .85 && last.q === 2 && !opts.some(o => o.cap) ? 'good' : 'mid';
  return { pct, end };
}
function walk(sc, pick) {
  const ids = [], opts = []; let id = sc.start, guard = 0;
  while (id !== 'end' && guard++ < 40) { const n = sc.nodes[id], i = pick(n); ids.push(i); opts.push(n.opts[i]); id = nextOf(n, n.opts[i]); }
  return { ids, opts };
}
const best = n => n.opts.findIndex(o => o.q === 2 && !o.fail);
const worst = n => { let w = 0; n.opts.forEach((o, i) => { if (o.q < n.opts[w].q) w = i; }); return w; };
const longest = n => { let w = 0; n.opts.forEach((o, i) => { if (o.t.length > n.opts[w].t.length) w = i; }); return w; };
(async () => {
  const out = {}, bad = [];
  const want = (name, cond, got) => { out[name] = got; if (!cond) bad.push(name); };
  // ---- the scripts as data: every path
  out.scripts = {};
  Object.entries(SC).forEach(([id, sc]) => {
    const row = {}; let paths = 0, longestPath = 0, weakGood = 0;
    const dfs = (nid, trail) => {
      if (nid === 'end') {
        paths++; longestPath = Math.max(longestPath, trail.length);
        const v = verdict(trail);
        if (v.end === 'good' && trail[trail.length - 1].q < 2) weakGood++;
        return;
      }
      if (trail.length > 20) { bad.push('loop ' + id); return; }
      const n = sc.nodes[nid]; n.opts.forEach(o => dfs(nextOf(n, o), trail.concat(o)));
    };
    dfs(sc.start, []);
    row.paths = `${paths} yol, ən uzunu ${longestPath}`;
    if (weakGood) bad.push('a weak close reaches the good ending ' + id);
    // the perfect way: everything measured, every rule found, the good ending
    const b = walk(sc, best);
    const crit = new Set(b.opts.map(o => o.k)), found = new Set();
    b.opts.forEach(o => [].concat(o.f === undefined ? [] : o.f).forEach(f => found.add(f)));
    row.best = `${crit.size}/${sc.crit.length} meyar, ${found.size}/${(sc.facts || []).length} qayda`;
    if (crit.size !== sc.crit.length) bad.push('best path skips a criterion ' + id);
    if (found.size !== (sc.facts || []).length) bad.push('best path misses a fact ' + id);
    if (verdict(b.opts).end !== 'good') bad.push('best is not good ' + id);
    if (verdict(walk(sc, worst).opts).end !== 'bad') bad.push('worst is not bad ' + id);
    // pressing one letter or always taking the longest line must fail, or at least never earn the good ending
    const letters = [0, 1, 2].map(i => verdict(walk(sc, n => Math.min(i, n.opts.length - 1)).opts));
    row.letters = letters.map(v => Math.round(v.pct * 100)).join('/');
    letters.forEach((v, i) => { if (v.pct >= .7 || v.end === 'good') bad.push(`letter ${'ABC'[i]} passes ${id} (${Math.round(v.pct * 100)}%)`); });
    const lv = verdict(walk(sc, longest).opts);
    row.longest = Math.round(lv.pct * 100);
    if (lv.pct >= .7 || lv.end === 'good') bad.push(`the longest line passes ${id} (${row.longest}%)`);
    const at = Object.values(sc.nodes).map(n => n.opts.findIndex(o => o.q === 2));
    if (new Set(at).size < 2) bad.push('same position ' + id);
    out.scripts[id] = row;
  });
  // ---- the question data: sections and presets
  const qs = IV.questions;
  want('questions', qs.length === 66, qs.length);
  want('apiPreset', IV.presets.find(p => p.id === 'api').take.api === 4 && qs.filter(q => q.cat === 'api').some(q => /Postman/.test(q.q)), 'API round has Postman');
  const { browser, page, errors } = await setup({ hash: '#musahibe', w: 390, h: 844, mobile: true, mock: false, wait: 1500 });
  want('off', await page.evaluate(() => document.documentElement.getAttribute('data-ai')) !== 'on', 'Claude off');
  // ---- start screen
  want('presets', (await page.$$('[data-act="iv-start"]')).length === 5, (await page.$$('[data-act="iv-start"]')).length);
  // ---- a run: Junior preset, 12 questions in interview order
  await page.click('[data-act="iv-start"][data-p="junior"]'); await page.waitForTimeout(200);
  out.q1 = await page.$eval('#iv-q', e => e.textContent);
  want('timer', await page.$eval('#iv-time', e => /00:0\d/.test(e.textContent) && /\/ 0/.test(e.textContent)), await page.$eval('#iv-time', e => e.textContent));
  want('hiddenAnswer', !(await page.$('.ans')), 'answer hidden until the reader is done');
  // the note is kept as it is typed: a reload without leaving the box does not lose it
  await page.type('#iv-t', 'Mənim qeydim'); await page.waitForTimeout(120);
  await page.reload(); await page.waitForTimeout(1600);
  await page.click('[data-act="iv-go"]'); await page.waitForTimeout(200);
  want('typedKept', await page.$eval('#iv-t', e => e.value) === 'Mənim qeydim', await page.$eval('#iv-t', e => e.value));
  // the clock counts on the question only: away time is not added, the time on the question stays
  await page.waitForTimeout(2300);
  const t1 = await page.$eval('#iv-time b', e => e.textContent);
  await go(page, '#mesq'); await page.waitForTimeout(2300);
  await go(page, '#musahibe'); await page.click('[data-act="iv-go"]'); await page.waitForTimeout(150);
  const t2 = await page.$eval('#iv-time b', e => e.textContent);
  const secs = s => +s.split(':')[0] * 60 + +s.split(':')[1];
  want('awayNotCounted', secs(t2) <= secs(t1) + 1 && secs(t1) >= 1, [t1, t2]);
  await page.click('[data-act="iv-show"]'); await page.waitForTimeout(120);
  want('reveal', await page.$$eval('.ans input[data-ivc]', x => x.length) >= 2 && !!(await page.$('.ans .prose')), await page.$$eval('.ans input[data-ivc]', x => x.length));
  want('overflowQuestion', await overflow(page) <= 0, 'revealed question');
  // a new interview over this one asks first
  await go(page, '#mesq'); await go(page, '#musahibe');
  await page.click('[data-act="iv-start"][data-p="api"]'); await page.waitForTimeout(150);
  want('overRunAsks', !!(await page.$('.sheet')) && !!(await page.$('[data-act="iv-go"]')), 'sheet');
  await page.evaluate(() => document.querySelector('.sheet-bg').click()); await page.waitForTimeout(150);
  await page.click('[data-act="iv-go"]'); await page.waitForTimeout(150);
  // tick all on the first question, then reload: the run, the note and the ticks come back
  for (const b of await page.$$('.ans input[data-ivc]')) await b.check();
  out.n1 = await page.$eval('#iv-n', e => e.textContent);
  await page.waitForTimeout(350); await page.reload(); await page.waitForTimeout(1600);
  want('resumeOffer', !!(await page.$('[data-act="iv-go"]')), 'davam et');
  await page.click('[data-act="iv-go"]'); await page.waitForTimeout(200);
  want('resumed', await page.$eval('#iv-t', e => e.value) === 'Mənim qeydim' && await page.$$eval('.ans input:checked', x => x.length) >= 2, await page.$eval('#iv-t', e => e.value));
  // the rest: no ticks, so these questions turn weak
  let guard = 0;
  while (guard++ < 20) {
    await page.click('[data-act="iv-next"]'); await page.waitForTimeout(90);
    if (await page.$('.result')) break;
    await page.click('[data-act="iv-show"]'); await page.waitForTimeout(60);
  }
  want('asked12', guard === 12, guard);
  const res = await page.$eval('.result', e => e.innerText.replace(/\s+/g, ' '));
  want('result', /\d+%/.test(res) && /öz qiymətləndirmən/.test(res) && /yenidən cavab ver/.test(res), res);
  want('cats', (await page.$$('.partbars .pb')).length >= 5, (await page.$$('.partbars .pb')).length);
  want('review', (await page.$$('.iv-rev')).length === 12 && (await page.$$('.iv-rev.no')).length === 11, [(await page.$$('.iv-rev')).length, (await page.$$('.iv-rev.no')).length]);
  // a result row stays open after a look at its topic; the deep layer opens where the point is
  await page.evaluate(() => { document.querySelectorAll('.iv-rev').forEach(d => { d.open = true; }); }); await page.waitForTimeout(120);
  want('overflowResult', await overflow(page) <= 0, 'result, rows open');
  // weak questions come back as their own round
  await page.click('[data-act="iv-start"][data-p="weak"]'); await page.waitForTimeout(150);
  want('weakRound', /Zəif suallar · sual 1\/10/.test(await page.$eval('.exam-top', e => e.textContent)), await page.$eval('.exam-top', e => e.textContent));
  await page.click('[data-act="iv-quit"]'); await page.waitForTimeout(150);
  await page.click('.sheet .btn.primary'); await page.waitForTimeout(200);
  want('history', (await page.$$('.exam-hist .exam-h')).length === 1, (await page.$$('.exam-hist .exam-h')).length);
  // the term round takes its answers from the glossary's interview lines, and links to the glossary
  await page.click('[data-act="iv-start"][data-p="terms"]'); await page.waitForTimeout(150);
  await page.click('[data-act="iv-show"]'); await page.waitForTimeout(80);
  want('termRound', /nədir\?/.test(await page.$eval('#iv-q', e => e.textContent)) && !!(await page.$('.iv-links [data-act="gt"]')), await page.$eval('#iv-q', e => e.textContent));
  await page.click('[data-act="iv-quit"]'); await page.waitForTimeout(150);
  await page.click('.sheet .btn.primary'); await page.waitForTimeout(200);
  // a link to a deep layer opens it, for the questions whose point is only there
  await page.click('[data-act="iv-start"][data-p="hr"]'); await page.waitForTimeout(120);
  want('overflowIv', await overflow(page) <= 0, 'phone');
  await page.click('[data-act="iv-quit"]'); await page.waitForTimeout(120);
  await page.click('.sheet .btn.primary'); await page.waitForTimeout(150);
  // ---- role plays through the page: all seven, best way, worst way
  await go(page, '#ssenari');
  want('rsList', (await page.$$('.rpcard[data-act="rs-open"]')).length === 7, (await page.$$('.rpcard[data-act="rs-open"]')).length);
  const play = async (id, way) => {
    await go(page, '#ssenari-' + id);
    if (await page.$('[data-act="rs-reset"]')) { await page.click('[data-act="rs-reset"]'); await page.waitForTimeout(80); }
    for (const i of way) { await page.click(`[data-act="rs-pick"][data-i="${i}"]`); await page.waitForTimeout(30); }
    await page.waitForTimeout(60);
    return page.$eval('.rs-end', e => e.innerText.replace(/\s+/g, ' '));
  };
  out.grades = {};
  for (const [id, sc] of Object.entries(SC)) {
    const bw = walk(sc, best), ww = walk(sc, worst);
    const b = await play(id, bw.ids);
    if (await overflow(page) > 0) bad.push('overflow end ' + id);
    const w = await play(id, ww.ids);
    out.grades[id] = [b.split(' ')[0], w.split(' ').slice(0, 3).join(' ')];
    if (!b.startsWith('Əla') || !b.includes('100%') || !b.includes(sc.ends.good.slice(0, 25))) bad.push('best ' + id);
    if (!w.startsWith('Yenidən cəhd et') || !w.includes(sc.ends.bad.slice(0, 25))) bad.push('worst ' + id);
    if (sc.facts && !b.includes(`${sc.facts.length}/${sc.facts.length}`)) bad.push('facts ' + id);
    if (!b.includes(sc.strong[0].slice(0, 30))) bad.push('strong ' + id);
  }
  // the reply comes before the coach's note, and a dead end says what happened
  await go(page, '#ssenari-dev-works');
  await page.click('[data-act="rs-reset"]'); await page.waitForTimeout(80);
  const a = SC['dev-works'].nodes.a.opts.findIndex(o => o.to === 'x'), x = SC['dev-works'].nodes.x.opts.findIndex(o => o.fail);
  await page.click(`[data-act="rs-pick"][data-i="${a}"]`); await page.waitForTimeout(40);
  want('order', await page.evaluate(() => { const u = document.querySelector('#rs-last'); return u.nextElementSibling.classList.contains('a') && u.nextElementSibling.nextElementSibling.classList.contains('rs-fb'); }), 'cavab, sonra qeyd');
  want('overflowRs', await overflow(page) <= 0, 'middle of a talk');
  await page.click(`[data-act="rs-pick"][data-i="${x}"]`); await page.waitForTimeout(60);
  const dead = await page.$eval('.rs-end', e => e.innerText.replace(/\s+/g, ' '));
  want('deadEnd', dead.startsWith('Yenidən cəhd et') && dead.includes('Elvin report-u bağladı'), dead.slice(0, 90));
  // a middle way: the Yaxşı grade and the middle text
  const mid = Object.values(SC['dev-penny'].nodes.a.opts).findIndex(o => o.q === 1);
  const midWay = walk(SC['dev-penny'], n => n === SC['dev-penny'].nodes.a ? mid : n === SC['dev-penny'].nodes.d ? n.opts.findIndex(o => o.q === 1) : best(n));
  const m = await play('dev-penny', midWay.ids);
  want('midEnd', m.startsWith('Yaxşı') && m.includes(SC['dev-penny'].ends.mid.slice(0, 25)), m.slice(0, 80));
  // back from a finished talk's list: one press reaches the page before it
  await go(page, '#mesq');
  await page.click('.quizcta[data-act="rs-open"]'); await page.waitForTimeout(150);
  await page.click('.rpcard[data-rp="dev-penny"]'); await page.waitForTimeout(150);
  await page.click('.rs-end ~ .row [data-act="rs-open"]'); await page.waitForTimeout(150);
  want('onList', (await page.$$('.rpcard[data-act="rs-open"]')).length === 7, 'list');
  await page.click('[data-act="back"]'); await page.waitForTimeout(150);
  want('backOnce', !(await page.$('.rpcard[data-act="rs-open"]')) && !!(await page.$('.qgrid')), 'Məşq');
  // the result of a finished talk stays after a reload
  await play('po-promo', walk(SC['po-promo'], best).ids);
  await page.reload(); await page.waitForTimeout(1500);
  want('rsKept', !!(await page.$('.rs-end')), 'nəticə qalır');
  await go(page, '#ssenari');
  want('rsBest', (await page.$$eval('.rpcard .chip.pass', x => x.length)) === 7, await page.$$eval('.rpcard .chip.pass', x => x.length));
  want('overflowList', await overflow(page) <= 0, 'phone');
  // the chapter's link and the practice page reach them without Claude
  await go(page, '#c12');
  want('chapterLink', await page.$$eval('[data-act="rs-open"][data-rp="dev-works"]', x => x.filter(e => e.offsetParent !== null).length) === 1, 'c12');
  await go(page, '#c21s6');
  want('sectionLink', await page.$$eval('[data-act="iv-open"]', x => x.filter(e => e.offsetParent !== null).length) >= 1, '21.6');
  await go(page, '#mesq');
  want('practiceCard', !!(await page.$('[data-act="iv-open"]')) && !!(await page.$('[data-act="rs-open"]')), 'Məşq');
  await page.click('.tab[data-tab="tutor"]'); await page.waitForTimeout(200);
  want('tutorOff', !!(await page.$('#view [data-act="iv-open"]')), 'Müəllim tabı');
  // a run naming questions that no longer exist (an old version, an imported file) must not break the page
  await page.evaluate(() => { const k = 'qa-kitab:v1:iv', d = JSON.parse(localStorage.getItem(k)); d.run = { p: 'junior', ids: ['yoxdur'], i: 0, at: 1, a: {} }; d.last = { p: 'junior', ids: ['yoxdur'], a: {}, at: 1, pct: 0 }; d._ts = Date.now() + 60000; localStorage.setItem(k, JSON.stringify(d)); });
  await page.evaluate(() => { location.hash = '#musahibe'; }); await page.reload(); await page.waitForTimeout(1500);
  want('staleRun', !!(await page.$('[data-act="iv-start"]')) && !(await page.$('[data-act="iv-go"]')), 'start screen');
  // nor can any other odd shape in the stored doc lock the reader out of these pages
  await page.evaluate(() => { const k = 'qa-kitab:v1:iv'; localStorage.setItem(k, JSON.stringify({ run: { p: 'junior', ids: ['iv1'], i: 0, at: 1, a: { iv1: 5 } }, last: 7, hist: [null, 3], weak: null, seen: null, rp: { 'dev-works': {}, 'dev-call': { path: ['length', 0] } }, _ts: Date.now() + 120000 })); });
  await page.reload(); await page.waitForTimeout(1500);
  want('oddDocStart', !!(await page.$('[data-act="iv-go"]')) && !!(await page.$('[data-act="iv-start"][data-p="hr"]')), 'start screen');
  await page.click('[data-act="iv-go"]'); await page.waitForTimeout(120);
  await page.type('#iv-t', 'x'); await page.click('[data-act="iv-show"]'); await page.waitForTimeout(120);
  want('oddDocRun', !!(await page.$('.ans')), 'answer opens');
  await go(page, '#ssenari-dev-works');
  want('oddDocTalk', (await page.$$('[data-act="rs-pick"]')).length >= 2, 'talk opens');
  await go(page, '#ssenari-dev-call');
  want('oddDocTalk2', (await page.$$('[data-act="rs-pick"]')).length >= 2, 'talk opens');
  await browser.close();
  // ---- Claude on: the same talk, then the free conversation is one press away
  const on = await setup({ hash: '#ssenari-dev-call', w: 1440, h: 900, wait: 1500 });
  for (const i of walk(SC['dev-call'], best).ids) { await on.page.click(`[data-act="rs-pick"][data-i="${i}"]`); await on.page.waitForTimeout(30); }
  want('claudeLink', await on.page.$$eval('[data-act="rp-open"][data-rp="dev-call"]', x => x.filter(e => e.offsetParent !== null).length) === 1, 'Claude ilə sərbəst söhbət');
  want('overflowPc', await overflow(on.page) <= 0, 'PC');
  await on.browser.close();
  console.log(JSON.stringify(out, null, 1));
  const all = errors.concat(on.errors, bad);
  console.log('ERRORS', JSON.stringify(all));
  if (all.length) process.exit(1);
})();
