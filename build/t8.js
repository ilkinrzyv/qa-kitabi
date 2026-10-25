const { setup } = require('./harness');
(async () => {
  const log = (...a) => console.log(...a);
  for (const [w, dark] of [[360, false], [390, true]]) {
    const { browser, page, errors } = await setup({ w, h: 800, mobile: true, dark, initDB: { 'data/users/u_test123/prefs': { theme: 'system', fs: 17, dir: 'en', lvl: 'deep', _ts: Date.now() } } });
    await page.waitForTimeout(400);
    const bad = [];
    for (let n = 1; n <= 21; n++) {
      await page.evaluate(n => { location.hash = ''; }, n);
      await page.evaluate(n => { const b = document.createElement('button'); b.dataset.act = 'open-ch'; b.dataset.ch = 'c' + n; document.body.appendChild(b); b.click(); b.remove(); }, n);
      await page.waitForTimeout(250);
      const r = await page.evaluate(() => {
        document.querySelectorAll('details').forEach(d => { d.open = true; });
        const sw = document.documentElement.scrollWidth, iw = window.innerWidth;
        const wideNarrow = [...document.querySelectorAll('figure.diagram.narrow')].filter(f => { const s = f.querySelector('.dg-scroll'); return s.scrollWidth > s.clientWidth + 2; }).map(f => f.dataset.d);
        const offenders = sw > iw ? [...document.querySelectorAll('#view *')].filter(e => e.getBoundingClientRect().right > iw + 1 && !e.closest('.tbl,pre,.dg-scroll')).slice(0, 3).map(e => e.tagName + '.' + e.className + ':' + Math.round(e.getBoundingClientRect().right)) : [];
        return { sw, iw, wideNarrow, offenders, lvl: document.querySelectorAll('.sec details.deep[open]').length, secs: document.querySelectorAll('.sec').length };
      });
      if (r.sw > r.iw || r.wideNarrow.length) bad.push({ n, ...r });
    }
    log(w, dark ? 'dark' : 'light', 'issues', JSON.stringify(bad), 'errors', errors);
    await browser.close();
  }
})();
