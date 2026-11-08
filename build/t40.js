// Highlights (app.js hl*): select words in the book's text, mark them in one of four colours; the mark survives a reload and is
// saved in the hl-<chapter> doc (local and the artifact db); a tap opens it (colour, note, delete, the glossary term inside);
// overlapping highlights merge; a selection across two blocks cannot be marked; the deep layer and the short level have their own
// highlights; the list filters by colour, jumps to the place, copies, shows a highlight whose text left the book as lost; without
// Claude the bar has only the colours; the phone layout does not overflow. Also: a triple click, "Qeyd" over a highlight, another
// colour over part of one, chapter 16's SQL run bar, a link, the keyboard, editing from the list, damaged docs, a 320px screen.
const { setup } = require('./harness');

const select = (page, sel, start, len) => page.evaluate(([sel, start, len]) => { // select len characters of the first long enough text node
  const scope = document.querySelector(sel); const w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  let n = w.nextNode(); while (n && (n.parentElement.closest('figure,.gt') || n.data.length < start + len)) n = w.nextNode();
  const r = document.createRange(); r.setStart(n, start); r.setEnd(n, start + len);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r); return r.toString();
}, [sel, start, len]);
const doc = (page, cid) => page.evaluate(cid => JSON.parse(localStorage.getItem('qa-kitab:v1:hl-' + cid) || 'null'), cid);

(async () => {
  const out = {}; const ERRORS = [];
  const want = (name, ok, got) => { if (!ok) ERRORS.push(`${name}: ${JSON.stringify(got)}`); };
  let { browser, ctx, page, errors } = await setup({ hash: '#c1', w: 390, h: 844, mobile: true, wait: 1400 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  // 1. select → bar → colour
  const sid = await page.evaluate(() => [...document.querySelectorAll('.sec [data-hl="m"]')].find(x => x.textContent.length > 400).closest('.sec').id);
  const picked = await select(page, `#${sid} [data-hl="m"]`, 4, 18);
  await page.waitForTimeout(500);
  const bar = await page.evaluate(() => { const p = document.getElementById('selpill'); return { shown: !p.hidden, nohl: p.classList.contains('nohl'), sw: [...p.querySelectorAll('.hl-c')].filter(b => b.offsetWidth).length, ai: !!p.querySelector('[data-sp="ai"]').offsetWidth }; });
  want('bar with colours and Claude', bar.shown && !bar.nohl && bar.sw === 4 && bar.ai, bar);
  await page.screenshot({ path: 'shots/hl-bar-390.png' });
  await page.click('#selpill [data-sp="g"]'); await page.waitForTimeout(150);
  const m1 = await page.evaluate(sid => [...document.querySelectorAll(`#${sid} mark.hl`)].map(m => ({ k: m.className, t: m.textContent, hid: m.dataset.hid })), sid);
  want('marked in green with the selected text', m1.length === 1 && m1[0].k.includes('hl-g') && m1[0].t === picked.trim(), [m1, picked]);
  want('bar hides and selection clears', await page.evaluate(() => document.getElementById('selpill').hidden && !String(getSelection())), 'bar');
  const cid = await page.evaluate(sid => document.getElementById(sid).closest('#view') && location.hash.slice(1), sid);
  let d = await doc(page, cid);
  want('saved in hl-<chapter>', d && d.h[sid] && d.h[sid].length === 1 && d.h[sid][0].t === picked.trim() && d.h[sid][0].k === 'g' && d.h[sid][0].s === 'm', d);
  await page.waitForTimeout(1200);
  want('artifact db has the doc', await page.evaluate(cid => !!(window.__mockDB[`data/users/u_test123/hl-${cid}`] || {}).h, cid), 'db');
  // 2. reload: the mark comes back in place
  await page.reload(); await page.waitForTimeout(1400);
  await page.evaluate(sid => document.getElementById(sid).scrollIntoView(), sid); await page.waitForTimeout(200);
  const m2 = await page.evaluate(sid => [...document.querySelectorAll(`#${sid} mark.hl`)].map(m => m.textContent), sid);
  want('restored after reload', m2.length === 1 && m2[0] === picked.trim(), m2);
  // 3. tap the mark: sheet, colour, note
  await page.click(`#${sid} mark.hl`); await page.waitForTimeout(450);
  want('tap opens the sheet', await page.evaluate(() => !!document.querySelector('.sheet .hl-sheet .hl-q')), 'sheet');
  await page.screenshot({ path: 'shots/hl-sheet-390.png' });
  await page.click('.hl-kind[data-k="p"]');
  await page.fill('#hl-n', 'Müsahibədə soruşurlar'); await page.waitForTimeout(1500);
  const m3 = await page.evaluate(sid => { const m = document.querySelector(`#${sid} mark.hl`); return { cls: m.className, title: m.title }; }, sid);
  d = await doc(page, cid);
  want('colour and note change', m3.cls.includes('hl-p') && m3.cls.includes('has-n') && m3.title === 'Müsahibədə soruşurlar' && d.h[sid][0].k === 'p' && d.h[sid][0].n === 'Müsahibədə soruşurlar', [m3, d.h[sid][0]]);
  await page.click('.sheet-head [data-act="sheet-close"]');
  // 4. an overlapping selection merges, the note stays
  const pick2 = await page.evaluate(sid => { // from inside the mark to a few characters after it
    const m = document.querySelector(`#${sid} mark.hl`), t = m.firstChild, after = m.nextSibling;
    const r = document.createRange(); r.setStart(t, 3); r.setEnd(after, Math.min(8, after.data.length));
    getSelection().removeAllRanges(); getSelection().addRange(r); return r.toString();
  }, sid);
  await page.waitForTimeout(500); await page.click('#selpill [data-sp="p"]'); await page.waitForTimeout(150);
  d = await doc(page, cid);
  const merged = d.h[sid];
  want('the same colour over a highlight merges into one', merged.length === 1 && merged[0].k === 'p' && merged[0].t.startsWith(picked.trim()) && merged[0].t.length > picked.trim().length && merged[0].n === 'Müsahibədə soruşurlar', [merged, pick2]);
  // 5. a selection across two blocks cannot be marked (Claude can still explain it)
  await page.evaluate(sid => {
    const a = document.querySelector(`#${sid} [data-hl="m"]`), b = document.querySelector(`#${sid} [data-hl="k"]`) || document.querySelector(`#${sid} .sec-f`);
    const r = document.createRange(); r.setStart(a.querySelector('p').firstChild, 0); r.setEnd(b, 1); getSelection().removeAllRanges(); getSelection().addRange(r);
  }, sid);
  await page.waitForTimeout(500);
  want('across blocks: no colours', await page.evaluate(() => { const p = document.getElementById('selpill'); return !p.hidden && p.classList.contains('nohl') && !p.querySelector('.hl-c').offsetWidth; }), 'nohl');
  await page.evaluate(() => getSelection().removeAllRanges()); await page.waitForTimeout(600);
  // 6. a highlight over a glossary link: the mark is inside the link, its sheet links the term
  const gl = await page.evaluate(() => {
    const g = [...document.querySelectorAll('[data-hl="m"] .gt')].find(x => x.previousSibling && x.previousSibling.nodeType === 3 && x.previousSibling.data.length > 6);
    const sec = g.closest('.sec'), r = document.createRange(); r.setStart(g.previousSibling, g.previousSibling.data.length - 5); r.setEnd(g.firstChild, Math.min(3, g.firstChild.data.length));
    g.scrollIntoView({ block: 'center' }); getSelection().removeAllRanges(); getSelection().addRange(r); return { sid: sec.id, g: g.dataset.g };
  });
  await page.waitForTimeout(500); await page.click('#selpill [data-sp="b"]'); await page.waitForTimeout(150);
  const inGt = await page.evaluate(gl => [...document.querySelectorAll(`#${gl.sid} mark.hl-b`)].map(m => !!m.closest('.gt')), gl);
  want('mark inside the glossary link', inGt.length === 2 && inGt[1], inGt);
  await page.click(`#${gl.sid} .gt mark.hl-b`); await page.waitForTimeout(450);
  want('sheet links the term', await page.evaluate(g => !!document.querySelector(`.hl-sheet [data-act="gt"][data-g="${g}"]`), gl.g), gl);
  await page.click('.sheet-head [data-act="sheet-close"]');
  // 7. the deep layer has its own highlights
  const deep = await page.evaluate(() => { const det = [...document.querySelectorAll('details.deep')].find(x => x.querySelector('.dbody').textContent.length > 200); det.open = true; det.scrollIntoView(); return det.closest('.sec').id; });
  await page.waitForTimeout(200);
  const dpick = await select(page, `#${deep} .dbody`, 0, 12); await page.waitForTimeout(500);
  await page.click('#selpill [data-sp="p"]'); await page.waitForTimeout(150);
  d = await doc(page, cid);
  want('deep highlight saved with s=d', d.h[deep] && d.h[deep].some(x => x.s === 'd' && x.t === dpick.trim()), [d.h[deep], dpick]);
  // 8. the list: filter, jump (opens the deep layer), lost highlight, copy
  await page.evaluate(() => { location.hash = '#isareler'; }); await page.waitForTimeout(500);
  const L = await page.evaluate(() => ({ items: document.querySelectorAll('.hl-item').length, chips: [...document.querySelectorAll('.hl-f .chip')].map(c => c.textContent.trim()) }));
  want('list shows every highlight', L.items === 3, L);
  await page.screenshot({ path: 'shots/hl-list-390.png' });
  await page.click('.hl-f [data-k="b"]'); await page.waitForTimeout(150);
  want('filter by colour', await page.evaluate(() => [...document.querySelectorAll('.hl-item')].every(x => x.classList.contains('hl-b')) && document.querySelectorAll('.hl-item').length === 1), 'filter');
  await page.click('.hl-f [data-k=""]'); await page.waitForTimeout(150);
  await page.click('[data-act="hl-copy"]'); await page.waitForTimeout(300);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  want('copy: chapters, colours, notes', clip.includes('[Sual]') && clip.includes('[Misal]') && clip.includes('Qeyd: Müsahibədə soruşurlar'), clip.slice(0, 300));
  await page.evaluate(() => { [...document.querySelectorAll('.sheet [data-act="sheet-close"]')].forEach(b => b.click()); });
  const deepId = (await doc(page, cid)).h[deep].find(x => x.s === 'd').id;
  await page.click(`.hl-go[data-hid="${deepId}"]`); await page.waitForTimeout(900);
  const jump = await page.evaluate(deep => { const m = document.querySelector(`#${deep} .dbody mark.hl`); if (!m) return null; const r = m.getBoundingClientRect(); return { open: m.closest('details').open, inView: r.top > 0 && r.bottom < innerHeight, fl: m.classList.contains('fl'), view: document.body.dataset.view }; }, deep);
  want('jump opens the deep layer and shows the mark', jump && jump.open && jump.inView && jump.fl && jump.view === 'reader', jump);
  // a highlight whose text is no longer in the book
  await page.evaluate(([cid, sid]) => { const k = 'qa-kitab:v1:hl-' + cid, D = JSON.parse(localStorage.getItem(k)); D.h[sid].push({ id: 'hold', s: 'm', o: 5, t: 'bu cümlə kitabda yoxdur', pre: '', suf: '', k: 'g', n: '', at: 1 }); localStorage.setItem(k, JSON.stringify(D)); }, [cid, sid]);
  await page.reload(); await page.waitForTimeout(1300);
  await page.evaluate(() => { location.hash = '#isareler'; }); await page.waitForTimeout(500);
  want('lost highlight is listed as lost', await page.evaluate(() => { const x = document.querySelector('.hl-item.lost'); return !!x && x.querySelector('.hl-go').disabled && !!x.querySelector('[data-act="hl-rm"]'); }), 'lost');
  await page.click('.hl-item.lost [data-act="hl-rm"]'); await page.waitForTimeout(150);
  want('lost highlight removed', await page.evaluate(() => !document.querySelector('.hl-item.lost') && document.querySelectorAll('.hl-item').length === 3), 'rm');
  // 9. the short level marks its own text; the progress page and the summary list them
  await page.evaluate(sid => { location.hash = '#' + sid; }, sid); await page.waitForTimeout(600);
  await page.click(`#${sid} .sec-h [data-v="short"]`); await page.waitForTimeout(300);
  const spick = await select(page, `#${sid} [data-hl="q"]`, 0, 9); await page.waitForTimeout(500);
  await page.click('#selpill [data-sp="y"]'); await page.waitForTimeout(150);
  d = await doc(page, cid);
  want('short text highlight', d.h[sid].some(x => x.s === 'q' && x.t === spick.trim()) && await page.evaluate(sid => document.querySelectorAll(`#${sid} [data-hl="q"] mark.hl`).length === 1, sid), d.h[sid]);
  await page.click('.tab[data-tab="progress"]'); await page.waitForTimeout(400);
  want('progress page lists the latest', await page.evaluate(() => document.querySelectorAll('.hl-list .hl-item').length === 3 && !!document.querySelector('[data-act="hl-open"]')), 'progress');
  await page.evaluate(() => { location.hash = '#c1'; }); await page.waitForTimeout(400);
  await page.click('[data-act="konspekt"]'); await page.waitForTimeout(400);
  want('konspekt lists the chapter\'s highlights', await page.evaluate(() => document.querySelectorAll('.hl-list .hl-item').length === 4), 'konspekt');
  // 10. delete from the sheet
  await page.evaluate(sid => { location.hash = '#' + sid; }, sid); await page.waitForTimeout(600);
  const before = (await doc(page, cid)).h[sid].length;
  await page.click(`#${sid} [data-v="std"]`).catch(() => { }); await page.waitForTimeout(300);
  const delId = await page.$eval(`#${sid} [data-hl="m"] mark.hl`, m => m.dataset.hid);
  await page.click(`#${sid} [data-hl="m"] mark.hl[data-hid="${delId}"]`); await page.waitForTimeout(450);
  await page.click('[data-act="hl-del"]'); await page.waitForTimeout(150);
  const after = (await doc(page, cid)).h[sid] || [];
  want('delete from the sheet', after.length === before - 1 && !after.some(x => x.id === delId) && await page.evaluate(id => !document.querySelector(`mark.hl[data-hid="${id}"]`), delId), [before, after.length]);
  out.overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  want('no overflow on a phone', out.overflow <= 0, out.overflow);
  // 11. no mark inside a diagram, even when the selection spans one
  await page.evaluate(() => { location.hash = '#c12'; }); await page.waitForTimeout(600);
  await page.evaluate(() => {
    const f = document.querySelector('figure[data-d="buglife"]'), prose = f.closest('[data-hl]');
    const w = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT), ns = []; for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.trim()) ns.push(n);
    const before = ns.filter(n => f.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING).pop(), after = ns.find(n => f.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING && !f.contains(n));
    const r = document.createRange(); r.setStart(before, 0); r.setEnd(after, Math.min(6, after.data.length));
    f.scrollIntoView(); getSelection().removeAllRanges(); getSelection().addRange(r);
  });
  await page.waitForTimeout(500); await page.click('#selpill [data-sp="g"]'); await page.waitForTimeout(150);
  want('a diagram stays outside the marks', await page.evaluate(() => document.querySelectorAll('figure mark.hl').length === 0 && document.querySelectorAll('[data-hl] mark.hl-g').length >= 2), 'figure');
  // 12. a triple click (the range ends at the start of the next block) still offers the colours and marks the paragraph
  await page.evaluate(() => { location.hash = '#c2'; }); await page.waitForTimeout(600);
  const tri = await page.evaluate(() => {
    const scope = [...document.querySelectorAll('.sec [data-hl="m"]')].find(x => x.nextElementSibling && x.lastElementChild && x.lastElementChild.tagName === 'P');
    const p = scope.lastElementChild, r = document.createRange(); r.setStart(p, 0); r.setEnd(scope.nextElementSibling, 0);
    p.scrollIntoView({ block: 'center' }); getSelection().removeAllRanges(); getSelection().addRange(r);
    return { sid: scope.closest('.sec').id, text: p.textContent.trim() };
  });
  await page.waitForTimeout(500);
  want('triple click: colours offered', await page.evaluate(() => { const p = document.getElementById('selpill'); return !p.hidden && !p.classList.contains('nohl'); }), 'tri');
  await page.click('#selpill [data-sp="b"]'); await page.waitForTimeout(150);
  const triDoc = (await doc(page, 'c2')).h[tri.sid];
  want('triple click: the whole paragraph', triDoc && triDoc.some(x => x.k === 'b' && x.t === tri.text), [triDoc && triDoc.map(x => x.t.slice(0, 40)), tri.text.slice(0, 40)]);
  // 13. "Qeyd" on a word inside a highlight keeps its colour and puts the cursor in the note
  await page.evaluate(sid => { const t = document.querySelector(`#${sid} mark.hl-b`).firstChild; const r = document.createRange(); r.setStart(t, 1); r.setEnd(t, Math.min(5, t.data.length)); getSelection().removeAllRanges(); getSelection().addRange(r); }, tri.sid);
  await page.waitForTimeout(500); await page.click('#selpill [data-sp="note"]'); await page.waitForTimeout(200);
  const qn = await page.evaluate(() => ({ sheet: !!document.querySelector('.hl-sheet'), focus: document.activeElement && document.activeElement.id, k: (document.querySelector('.hl-kind[aria-pressed="true"]') || { getAttribute: () => null }).getAttribute('data-k') }));
  want('Qeyd keeps the colour and focuses the note', qn.sheet && qn.focus === 'hl-n' && qn.k === 'b', qn);
  await page.click('.sheet-head [data-act="sheet-close"]');
  // 14. another colour over part of a highlight: the old one keeps what sticks out
  const cut = await page.evaluate(sid => { const t = document.querySelector(`#${sid} mark.hl-b`).firstChild; const r = document.createRange(); r.setStart(t, 0); r.setEnd(t, Math.min(8, t.data.length)); getSelection().removeAllRanges(); getSelection().addRange(r); return r.toString(); }, tri.sid);
  await page.waitForTimeout(500); await page.click('#selpill [data-sp="p"]'); await page.waitForTimeout(150);
  const cd = (await doc(page, 'c2')).h[tri.sid].filter(x => x.s === 'm');
  want('another colour cuts the old highlight', cd.some(x => x.k === 'p' && x.t === cut.trim()) && cd.some(x => x.k === 'b' && tri.text.endsWith(x.t) && x.t.length < tri.text.length), cd.map(x => [x.k, x.t.slice(0, 30)]));
  // 15. chapter 16: the SQL run bar inside the text is not part of it
  await page.evaluate(() => { location.hash = '#c16'; }); await page.waitForTimeout(900);
  const sq = await page.evaluate(() => {
    for (const run of document.querySelectorAll('[data-hl] .sql-run')) {
      const scope = run.closest('[data-hl]'), w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT), ns = [];
      for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.trim() && !n.parentElement.closest('.sql-run')) ns.push(n);
      const before = ns.filter(n => run.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING).pop(), after = ns.find(n => run.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (!before || !after) continue;
      const r = document.createRange(); r.setStart(before, Math.max(0, before.data.length - 6)); r.setEnd(after, Math.min(6, after.data.length));
      run.scrollIntoView({ block: 'center' }); getSelection().removeAllRanges(); getSelection().addRange(r); return scope.closest('.sec').id;
    }
    return null;
  });
  want('found a SQL run bar inside the text', !!sq, sq);
  if (sq) {
    await page.waitForTimeout(500); await page.click('#selpill [data-sp="y"]'); await page.waitForTimeout(150);
    const sd = (await doc(page, 'c16')).h[sq];
    want('the run bar stays outside the highlight', sd && sd.length === 1 && !/İşə sal|Bazanı yarat/.test(sd[0].t) && await page.evaluate(() => !document.querySelector('.sql-run mark')), sd);
    await page.reload(); await page.waitForTimeout(1500);
    want('the SQL highlight comes back after a reload', await page.evaluate(sq => document.querySelectorAll(`#${sq} mark.hl`).length > 0, sq), 'sqlreload');
  }
  // 16. a link inside a highlight still works
  await page.evaluate(() => { location.hash = '#c21'; }); await page.waitForTimeout(600);
  const ln = await page.evaluate(() => { const a = document.querySelector('[data-hl] a[href]'); if (!a) return null; a.scrollIntoView({ block: 'center' }); const r = document.createRange(); r.selectNodeContents(a); getSelection().removeAllRanges(); getSelection().addRange(r); return a.getAttribute('href'); });
  want('found a link in the text', !!ln, ln);
  if (ln) {
    await page.waitForTimeout(500); await page.click('#selpill [data-sp="g"]'); await page.waitForTimeout(150);
    await page.click('[data-hl] a[href] mark.hl'); await page.waitForTimeout(600);
    want('a link inside a highlight still opens', await page.evaluate(ln => !document.querySelector('.hl-sheet') && location.hash === ln, ln), ln);
  }
  // 17. keyboard: a highlight takes focus and Enter opens it; the list's edit button opens it and the list follows the change
  await page.evaluate(() => { location.hash = '#c2'; }); await page.waitForTimeout(600);
  await page.focus('mark.hl[role="button"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  want('Enter on a highlight opens it', await page.evaluate(() => !!document.querySelector('.hl-sheet')), 'kbd');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  await page.evaluate(() => { location.hash = '#isareler'; }); await page.waitForTimeout(500);
  await page.click('.hl-item:not(.lost) [data-act="hl-edit"]'); await page.waitForTimeout(200);
  const k0 = await page.$eval('.hl-kind[aria-pressed="true"]', b => b.dataset.k), k1 = k0 === 'g' ? 'p' : 'g';
  await page.click(`.hl-kind[data-k="${k1}"]`); await page.click('.sheet-head [data-act="sheet-close"]'); await page.waitForTimeout(200);
  want('edit from the list: the list follows', await page.evaluate(k1 => document.querySelector('.hl-item').classList.contains('hl-' + k1), k1), k1);
  // 18. damaged docs (an edited export file) are skipped and break nothing
  await page.evaluate(() => { localStorage.setItem('qa-kitab:v1:hl-c3', JSON.stringify({ h: null })); localStorage.setItem('qa-kitab:v1:hl-c4', JSON.stringify({ h: { c4s1: [{ id: 'x"><i id=bad>', t: 5, k: 'q' }, null, 'x', { id: 'ok1', t: 'yoxdur', k: 'zz', s: 'm' }] } })); });
  await page.reload(); await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = '#c4'; }); await page.waitForTimeout(500);
  await page.click('.tab[data-tab="progress"]'); await page.waitForTimeout(400);
  await page.evaluate(() => { location.hash = '#isareler'; }); await page.waitForTimeout(400);
  want('damaged docs are skipped', await page.evaluate(() => !!document.querySelector('.hl-list') && !document.getElementById('bad')), 'bad');
  ERRORS.push(...errors); await browser.close();

  // without Claude: the bar has only the colours; selections outside the book's text get no bar
  ({ browser, page, errors } = await setup({ hash: '#c2', w: 390, h: 844, mobile: true, mock: false, wait: 1200 }));
  await select(page, '.sec [data-hl="m"]', 0, 10); await page.waitForTimeout(500);
  want('no Claude: colours only', await page.evaluate(() => { const p = document.getElementById('selpill'); return !p.hidden && p.querySelectorAll('.hl-c').length === 4 && !p.querySelector('[data-sp="ai"]').offsetWidth; }), 'noai');
  await page.evaluate(() => { const t = document.querySelector('.task .task-q .prose'); t.scrollIntoView(); const r = document.createRange(); r.selectNodeContents(t); getSelection().removeAllRanges(); getSelection().addRange(r); });
  await page.waitForTimeout(600);
  want('no Claude, not the book\'s text: no bar', await page.evaluate(() => document.getElementById('selpill').hidden), 'task');
  ERRORS.push(...errors); await browser.close();

  // a 320px screen (large display size): the bar fits
  ({ browser, page, errors } = await setup({ hash: '#c1', w: 320, h: 700, mobile: true, wait: 1200 }));
  await select(page, '.sec [data-hl="m"]', 0, 10); await page.waitForTimeout(500);
  const nb = await page.evaluate(() => { const r = document.getElementById('selpill').getBoundingClientRect(); return { l: r.left, r: r.right, w: innerWidth }; });
  want('bar fits a 320px screen', nb.l >= 0 && nb.r <= nb.w, nb);
  await page.screenshot({ path: 'shots/hl-bar-320.png' });
  ERRORS.push(...errors); await browser.close();

  // PC: one look
  ({ browser, page, errors } = await setup({ hash: '#c3', w: 1440, h: 900, dark: true, wait: 1200 }));
  await select(page, '#c3s4 [data-hl="m"]', 0, 30); await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/hl-bar-1440-dark.png' });
  await page.click('#selpill [data-sp="b"]'); await page.waitForTimeout(150);
  await select(page, '#c3s4 [data-hl="m"]', 40, 20); await page.waitForTimeout(500);
  await page.click('#selpill [data-sp="y"]'); await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/hl-marks-1440-dark.png' });
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
