const { setup } = require('./harness');
(async () => {
  // A. no claude at all: AI hidden, local persistence across reload
  {
    const { browser, ctx, page, errors } = await setup({ mock: false, hash: '#c2' });
    const vis = await page.evaluate(() => ({ ai: document.documentElement.getAttribute('data-ai'), lang: document.documentElement.lang, aiBtns: [...document.querySelectorAll('.aib')].filter(b => b.offsetParent).length, view: document.querySelector('.ch-hero h1').textContent }));
    console.log('A no-claude', JSON.stringify(vis));
    await page.click('[data-act="learn"][data-sec="c2s1"]');
    await page.fill('[data-ans="c2t1"]', 'test cavab');
    await page.waitForTimeout(1200);
    await page.reload(); await page.waitForTimeout(700);
    // after reload: home (hash still #c2 → reader)
    const st = await page.evaluate(() => ({ pressed: document.querySelector('[data-act="learn"][data-sec="c2s1"]').getAttribute('aria-pressed'), ans: document.querySelector('[data-ans="c2t1"]').value }));
    console.log('A after reload', JSON.stringify(st));
    await page.click('[data-act="tab"][data-tab="tutor"]'); await page.waitForTimeout(200);
    console.log('A tutor text:', (await page.textContent('#view')).slice(0, 80));
    await page.screenshot({ path: 'shots/30-reader-noai.png' });
    console.log('A errors', errors);
    await browser.close();
  }
  // B. remote newer than local: remote wins at load
  {
    const remote = { 'data/users/u_test123/progress': { learned: { c1s1: 1, c1s2: 1 }, last: { ch: 'c5', sec: 'c5s3' }, quiz: { 5: { best: 7, last: 7, n: 8, at: 1, wrong: ['q5-2'] } }, _ts: Date.now() + 100000 } };
    const { browser, page, errors } = await setup({ initDB: remote });
    await page.waitForTimeout(500);
    const t = await page.evaluate(() => document.querySelector('.cont') && document.querySelector('.cont').textContent);
    console.log('B continue card:', t);
    await page.screenshot({ path: 'shots/31-home-remote.png' });
    await page.click('[data-act="continue"]'); await page.waitForTimeout(500);
    const top = await page.evaluate(() => { const r = document.getElementById('c5s3').getBoundingClientRect(); return Math.round(r.top); });
    console.log('B c5s3 top after continue', top);
    console.log('B errors', errors);
    await browser.close();
  }
  // C. selection pill, quiz AI, hint without answer, stop, error codes
  {
    const { browser, page, errors } = await setup({ hash: '#c6' });
    await page.evaluate(() => { const p = document.querySelector('#c6s1 .prose p'); const r = document.createRange(); r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
    await page.waitForTimeout(500);
    const pillShown = await page.evaluate(() => !document.getElementById('selpill').hidden);
    console.log('C pill shown', pillShown);
    await page.dispatchEvent('#selpill', 'pointerdown');
    await page.waitForTimeout(1500);
    const sheetTitle = await page.evaluate(() => document.querySelector('.sheet .kicker') && document.querySelector('.sheet .kicker').textContent);
    const lastInput = await page.evaluate(() => { const c = window.__sampleCalls.at(-1); return (typeof c.input === 'string' ? c.input : c.input[0].content).slice(-300); });
    console.log('C sheet', sheetTitle, '| prompt tail:', lastInput.replace(/\n/g, ' ').slice(0, 300));
    await page.screenshot({ path: 'shots/32-selection-sheet.png' });
    // follow-up message in sheet
    await page.fill('#shin', 'Bir misal də ver');
    await page.click('#shsend');
    await page.waitForTimeout(1500);
    const turns = await page.evaluate(() => { const c = window.__sampleCalls.at(-1); return Array.isArray(c.input) ? c.input.map(t => t.role) : 'string'; });
    console.log('C follow-up roles', JSON.stringify(turns));
    await page.keyboard.press('Escape');
    // hint with empty answer
    await page.evaluate(() => document.getElementById('c6t2').scrollIntoView());
    await page.click('[data-act="task-hint"][data-task="c6t2"]');
    await page.waitForTimeout(1500);
    console.log('C hint fb:', (await page.textContent('[data-fb="c6t2"]')).slice(0, 80));
    // stop: slow sample
    await page.evaluate(() => { window.__sampleReply = 'x'.repeat(4000); });
    await page.fill('[data-ans="c6t3"]', 'cavab');
    await page.click('[data-act="task-check"][data-task="c6t3"]');
    await page.waitForTimeout(700);
    await page.click('[data-act="task-check"][data-task="c6t3"]'); // acts as stop
    await page.waitForTimeout(500);
    console.log('C after stop:', (await page.textContent('[data-fb="c6t3"]')).slice(-40));
    // error: rate_limited
    await page.evaluate(() => { window.__realUse = window.claude.use; });
    await page.evaluate(() => { window.__sampleReply = null; });
    console.log('C errors', errors);
    await browser.close();
  }
  // D. sample rejects not_granted → AI hidden afterwards
  {
    const { browser, page, errors } = await setup({ hash: '#c3' });
    await page.evaluate(() => {
      const orig = window.claude.use;
      window.claude = { use: async n => n === 'sample' ? (async () => { throw { code: 'not_granted', message: 'no' }; }) : orig(n) };
    });
    // re-init AI by calling through a section button (AI.fn still old mock) → patch via reload-free path: emulate by clicking and forcing error
    await page.evaluate(() => { window.__sampleReply = null; });
    await browser.close();
  }
  console.log('done');
})();
