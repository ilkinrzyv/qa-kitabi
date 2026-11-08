// Skill map (#bacariq): 21 chapter nodes in part bands, tools beside their chapter, the next step follows what is learned,
// nodes and tools open their pages, labels never cover a node, no overflow on a phone; light, dark and PC.
const { setup } = require('./harness');

(async () => {
  const out = {}; const ERRORS = [];
  const want = (name, ok, got) => { if (!ok) ERRORS.push(`${name}: ${JSON.stringify(got)}`); };
  const go = (page, h) => page.evaluate(x => { location.hash = x; }, h).then(() => page.waitForTimeout(500));
  const state = page => page.evaluate(() => ({
    view: document.body.dataset.view,
    nodes: document.querySelectorAll('.sk-node').length, bands: document.querySelectorAll('.sk-band').length, tools: document.querySelectorAll('.sk-tool').length,
    next: (document.querySelector('.sk-node.next') || {}).dataset ? document.querySelector('.sk-node.next').dataset.ch : null,
    done: [...document.querySelectorAll('.sk-node.done')].map(n => n.dataset.ch), on: document.querySelectorAll('.sk-seg.on').length,
    sum: (document.querySelector('.sk-sum b') || {}).textContent, cont: (document.querySelector('.cont .n') || {}).textContent,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    clash: (() => { const bad = []; const nodes = [...document.querySelectorAll('.sk-node')].map(n => n.getBoundingClientRect()); const map = document.querySelector('.sk-map').getBoundingClientRect();
      document.querySelectorAll('.sk-lab').forEach((l, i) => { const r = l.getBoundingClientRect();
        if (r.left < map.left - 1 || r.right > map.right + 1) bad.push('out ' + i);
        l.querySelectorAll('.sk-tool').forEach((b, k) => { const q = b.getBoundingClientRect(); if (q.left < map.left - 1 || q.right > map.right + 1) bad.push(`tool ${i}.${k} out`); });
        nodes.forEach((n, j) => { if (r.left < n.right && r.right > n.left && r.top < n.bottom && r.bottom > n.top) bad.push(`label ${i} on node ${j}`); }); });
      return bad; })(),
  }));

  let { browser, page, errors } = await setup({ hash: '#bacariq', w: 390, h: 844, mobile: true, wait: 1200 });
  let s = await state(page);
  out.start = s;
  want('map drawn', s.view === 'skills' && s.nodes === 21 && s.bands === 7 && s.tools === 11, s);
  want('first step is chapter 1', s.next === 'c1' && !s.done.length && s.on === 0 && /^Fəsil 01/.test(s.cont || ''), s);
  want('labels clear of nodes, inside the map', !s.clash.length, s.clash);
  want('no overflow on a phone', s.overflow <= 0, s.overflow);
  await page.screenshot({ path: 'shots/skills-390-light.png' });

  // learn every section of chapter 1: the node fills, the path to chapter 2 lights up, the next step moves on
  await go(page, '#c1');
  for (const b of await page.$$('[data-act="learn"][aria-pressed="false"]')) { await b.click(); await page.waitForTimeout(30); }
  await go(page, '#bacariq');
  s = await state(page);
  out.afterC1 = { next: s.next, done: s.done, on: s.on, sum: s.sum };
  want('chapter 1 done', s.done.join() === 'c1' && s.next === 'c2' && s.on === 1 && /^1\/21/.test(s.sum || ''), s);
  await page.$eval('.sk-node[data-ch="c1"]', el => el.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: 'shots/skills-390-c1-done.png' });

  // a node opens its chapter, a tool its practice
  await page.click('.sk-node[data-ch="c8"]'); await page.waitForTimeout(400);
  out.c8 = await page.evaluate(() => ({ view: document.body.dataset.view, num: (document.querySelector('.ch-bnum') || {}).textContent }));
  want('node opens the chapter', out.c8.view === 'reader' && out.c8.num === '08', out.c8);
  await go(page, '#mesq'); await go(page, '#bacariq'); // in-app navigation keeps the old hash, so leave it first
  await page.click('.sk-tool[data-act="sql-open"]'); await page.waitForTimeout(500);
  out.tool = await page.evaluate(() => document.body.dataset.view);
  want('tool opens the practice', out.tool === 'sql', out.tool);
  // entry points
  await page.click('[data-act="tab"][data-tab="book"]'); await page.waitForTimeout(300);
  want('home links the map', await page.$('.block [data-act="skills-open"]'), 'home');
  await page.click('.block [data-act="skills-open"]'); await page.waitForTimeout(400);
  want('the link opens the map', await page.evaluate(() => document.body.dataset.view === 'skills'), 'open');
  await go(page, '#progress');
  want('progress links the map', await page.$('[data-act="skills-open"]'), 'progress');
  ERRORS.push(...errors); await browser.close();

  ({ browser, page, errors } = await setup({ hash: '#bacariq', w: 390, h: 844, mobile: true, dark: true, wait: 1200 }));
  s = await state(page);
  want('dark: labels clear', !s.clash.length && s.overflow <= 0, [s.clash, s.overflow]);
  await page.screenshot({ path: 'shots/skills-390-dark.png' });
  ERRORS.push(...errors); await browser.close();

  ({ browser, page, errors } = await setup({ hash: '#bacariq', w: 1440, h: 900, wait: 1200 }));
  s = await state(page);
  want('PC: labels clear', !s.clash.length, s.clash);
  out.side = await page.$$eval('#sidectx .side-i.tool', x => x.map(b => b.textContent.trim()).filter(t => /Bacarıq/.test(t)).length);
  await go(page, '#mesq');
  out.sidePractice = await page.$$eval('#sidectx .side-i.tool', x => x.some(b => /Bacarıq xəritəsi/.test(b.textContent)));
  want('PC sidebar lists the map', out.sidePractice, out.sidePractice);
  await go(page, '#bacariq');
  await page.screenshot({ path: 'shots/skills-1440.png' });
  ERRORS.push(...errors); await browser.close();

  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
