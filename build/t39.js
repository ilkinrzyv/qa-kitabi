// Step-by-step diagrams (diagrams.py steps + LEGACY, app.js dga*): every diagram with data-anim plays all its steps — the current
// step's parts in full, earlier ones dimmed, later ones faint, the caption and counter in step; lines draw in and a dot runs along
// the arrows, arrowheads come back; ← → and Esc work; "Avtomatik" moves on by itself; reduced motion has no effects; print shows the
// whole diagram without the bar; a wide diagram scrolls to the current step on a phone; the summary sheet has no bar.
const { setup } = require('./harness');

(async () => {
  const out = { figures: 0, steps: 0 }; const ERRORS = [];
  const want = (name, ok, got) => { if (!ok) ERRORS.push(`${name}: ${JSON.stringify(got)}`); };
  let { browser, page, errors } = await setup({ hash: '#c1', w: 390, h: 844, mobile: true, wait: 1200 });
  const seen = [];
  for (let n = 1; n <= 21; n++) {
    await page.evaluate(h => { location.hash = h; }, '#c' + n); await page.waitForTimeout(450);
    const figs = await page.$$eval('figure.diagram[data-anim]', fs => fs.map(f => ({ d: f.dataset.d, n: +f.dataset.anim, bar: !!f.querySelector(':scope > .dga .dga-go'), li: f.querySelectorAll('.dga-steps li').length })));
    for (const f of figs) {
      seen.push(f.d);
      want(`${f.d}: idle bar and captions`, f.bar && f.li === f.n && f.n >= 2, f);
      // walk every step with the buttons
      await page.$eval(`figure[data-d="${f.d}"] .dga-go`, b => { b.scrollIntoView({ block: 'center' }); b.click(); });
      for (let i = 1; i <= f.n; i++) {
        await page.waitForTimeout(60);
        const st = await page.$eval(`figure[data-d="${f.d}"]`, (fig, i) => {
          const parts = [...fig.querySelectorAll('[data-s]')].map(el => ({ s: el.getAttribute('data-s').split(' ').map(Number), c: el.classList.contains('dga-c'), p: el.classList.contains('dga-p'), f: el.classList.contains('dga-f'), box: el.getBoundingClientRect().width > 0 }));
          const bad = parts.filter(x => x.c !== x.s.includes(i) || x.p !== (!x.s.includes(i) && Math.min(...x.s) < i) || x.f !== (!x.s.includes(i) && Math.min(...x.s) > i));
          const li = fig.querySelectorAll('.dga-steps li')[i - 1].textContent, cap = fig.querySelector('.dga-t').textContent;
          return { on: fig.classList.contains('dga-on'), cur: parts.filter(x => x.c && x.box).length, bad: bad.length, capOk: cap === li, n: fig.querySelector('.dga-n').textContent,
            dot: fig.querySelector('.dga-dots [aria-current]') && fig.querySelector('.dga-dots [aria-current]').dataset.i,
            prev: fig.querySelector('[data-v="prev"]').disabled, next: fig.querySelector('.dga-next').dataset.v };
        }, i);
        out.steps++;
        want(`${f.d} step ${i}`, st.on && st.cur > 0 && !st.bad && st.capOk && st.n === `${i}/${f.n}` && st.dot === String(i) && st.prev === (i === 1) && st.next === (i < f.n ? 'next' : 'stop'), st);
        if (i < f.n) await page.click(`figure[data-d="${f.d}"] .dga-next`);
      }
      // back one step, then "Bitir": the whole diagram again
      await page.click(`figure[data-d="${f.d}"] [data-v="prev"]`); await page.waitForTimeout(40);
      want(`${f.d}: back`, await page.$eval(`figure[data-d="${f.d}"] .dga-n`, el => el.textContent) === `${f.n - 1}/${f.n}`, 'prev');
      await page.click(`figure[data-d="${f.d}"] .dga-next`); await page.click(`figure[data-d="${f.d}"] .dga-next`); await page.waitForTimeout(40);
      const end = await page.$eval(`figure[data-d="${f.d}"]`, fig => ({ on: fig.classList.contains('dga-on'), cls: fig.querySelectorAll('.dga-c,.dga-p,.dga-f').length, idle: !!fig.querySelector('.dga-go'), fx: !!fig.querySelector('.dga-fx'), focus: document.activeElement && document.activeElement.classList.contains('dga-go') }));
      want(`${f.d}: Bitir shows the whole diagram`, !end.on && !end.cls && end.idle && !end.fx && end.focus, end);
      out.figures++;
    }
  }
  want('21 step-by-step diagrams', out.figures === 21, seen);
  out.seen = seen.join(' ');

  // effects: lines draw in (arrowheads wait and come back), a dot runs along the arrows; one diagram plays at a time
  await page.evaluate(() => { location.hash = '#c20'; }); await page.waitForTimeout(500);
  const mk0 = await page.$eval('figure[data-d="gitareas"]', f => f.querySelectorAll('[marker-end]').length);
  await page.$eval('figure[data-d="gitareas"] .dga-go', b => { b.scrollIntoView({ block: 'center' }); b.click(); });
  await page.click('figure[data-d="gitareas"] .dga-next'); await page.waitForTimeout(120);
  const fx = await page.$eval('figure[data-d="gitareas"]', f => ({ anims: document.getAnimations().length, noMarker: [...f.querySelectorAll('.dga-c line,.dga-c path')].filter(p => !p.getAttribute('marker-end')).length, dots: f.querySelectorAll('.dga-fx circle').length }));
  want('lines draw in, arrowhead waits', fx.anims > 0 && fx.noMarker > 0 && fx.dots > 0, fx);
  let dot = null;
  for (let k = 0; k < 40 && !(dot && dot.o === '1'); k++) { // the dot runs for a moment, then rests before its next run
    await page.waitForTimeout(40);
    dot = await page.$eval('figure[data-d="gitareas"]', f => { const c = f.querySelector('.dga-fx circle'), vb = f.querySelector('svg').viewBox.baseVal; return { o: c.style.opacity, x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), w: vb.width, h: vb.height }; });
  }
  await page.waitForTimeout(600);
  const mk1 = await page.$eval('figure[data-d="gitareas"]', f => f.querySelectorAll('[marker-end]').length);
  want('the dot runs inside the diagram and arrowheads are back', dot.o === '1' && dot.x > 0 && dot.x < dot.w && dot.y > 0 && dot.y < dot.h && mk1 === mk0, [dot, mk0, mk1]);
  await page.screenshot({ path: 'shots/dga-gitareas-390.png' });
  await page.$eval('figure[data-d="prflow"] .dga-go', b => { b.scrollIntoView({ block: 'center' }); b.click(); }); await page.waitForTimeout(80);
  const one = await page.evaluate(() => ({ on: [...document.querySelectorAll('figure.dga-on')].map(f => f.dataset.d), git: !!document.querySelector('figure[data-d="gitareas"] .dga-go') }));
  want('one diagram plays at a time', one.on.join() === 'prflow' && one.git, one);
  // keyboard
  await page.focus('figure[data-d="prflow"] .dga-next');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft');
  want('← → walk the steps', await page.$eval('figure[data-d="prflow"] .dga-n', el => el.textContent) === '2/5', 'keys');
  await page.keyboard.press('Escape'); await page.waitForTimeout(40);
  want('Esc shows the whole diagram', await page.$eval('figure[data-d="prflow"]', f => !f.classList.contains('dga-on') && !!f.querySelector('.dga-go')), 'esc');
  // Avtomatik: the next step after the reading time of this one (step 1 of tokenflow is short)
  await page.evaluate(() => { location.hash = '#c15'; }); await page.waitForTimeout(500);
  await page.$eval('figure[data-d="tokenflow"] .dga-go', b => { b.scrollIntoView({ block: 'center' }); b.click(); });
  await page.click('figure[data-d="tokenflow"] [data-v="auto"]');
  const au = await page.$eval('figure[data-d="tokenflow"] [data-v="auto"]', b => b.getAttribute('aria-pressed') + ' ' + b.textContent);
  want('Avtomatik is on', au === 'true Dayandır', au);
  await page.waitForTimeout(6200);
  want('Avtomatik moved on', await page.$eval('figure[data-d="tokenflow"] .dga-n', el => el.textContent) === '2/5', 'auto');
  await page.click('figure[data-d="tokenflow"] [data-v="auto"]');
  // print: the whole diagram, no bar
  await page.emulateMedia({ media: 'print' }); await page.waitForTimeout(50);
  const pr = await page.$eval('figure[data-d="tokenflow"]', f => ({ bar: getComputedStyle(f.querySelector('.dga')).display, faint: [...f.querySelectorAll('[data-s]')].filter(el => getComputedStyle(el).opacity !== '1').length }));
  want('print: whole diagram, no bar', pr.bar === 'none' && pr.faint === 0, pr);
  await page.emulateMedia({ media: 'screen' });
  // reduced motion: no animations, no dots
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.click('figure[data-d="tokenflow"] .dga-next'); await page.waitForTimeout(80);
  const rm = await page.$eval('figure[data-d="tokenflow"]', f => ({ anims: document.getAnimations().filter(a => a.effect && a.effect.target && f.contains(a.effect.target)).length, dots: f.querySelectorAll('.dga-fx circle').length }));
  want('reduced motion: no effects', rm.anims === 0 && rm.dots === 0, rm);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // a wide diagram on a phone scrolls to the current step (Reopened is on the right of the bug life cycle)
  await page.evaluate(() => { location.hash = '#c12'; }); await page.waitForTimeout(500);
  await page.$eval('figure[data-d="buglife"] .dga-go', b => { b.scrollIntoView({ block: 'center' }); b.click(); });
  for (let i = 1; i < 6; i++) await page.click('figure[data-d="buglife"] .dga-next');
  await page.waitForTimeout(700);
  const wide = await page.$eval('figure[data-d="buglife"]', f => { const sc = f.querySelector('.dg-scroll'), r = sc.getBoundingClientRect(), b = f.querySelector('g[data-claude-anchor="st-reopened"]').getBoundingClientRect(); return { wide: sc.scrollWidth > sc.clientWidth, left: sc.scrollLeft, inView: b.left >= r.left - 1 && b.right <= r.right + 1 }; });
  want('wide diagram follows the step', wide.wide && wide.left > 0 && wide.inView, wide);
  await page.screenshot({ path: 'shots/dga-buglife-390.png' });
  out.overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  want('no page overflow on a phone', out.overflow <= 0, out.overflow);
  // a new view drops the player; the summary sheet's diagram has no bar
  await page.evaluate(() => { location.hash = '#c20-xulase'; }); await page.waitForTimeout(600);
  want('summary sheet: no bar', await page.evaluate(() => document.querySelectorAll('.sum figure .dga').length === 0 && document.querySelectorAll('.sum figure').length === 1), 'sum');
  ERRORS.push(...errors); await browser.close();

  // dark theme + PC: one screenshot each for a look
  ({ browser, page, errors } = await setup({ hash: '#c13', w: 1440, h: 900, dark: true, wait: 1200 }));
  await page.$eval('figure[data-d="web"] .dga-go', b => { b.scrollIntoView({ block: 'center' }); b.click(); });
  await page.click('figure[data-d="web"] .dga-next'); await page.waitForTimeout(500);
  await page.$eval('figure[data-d="web"]', f => f.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: 'shots/dga-web-1440-dark.png' });
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
