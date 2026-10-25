const { setup } = require('./harness');
(async () => {
  for (const w of [360, 390]) {
    const { browser, page } = await setup({ hash: '#c3', w, h: 760 });
    await page.evaluate(() => document.querySelector('#c3s4 .sec-f').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(150);
    await page.screenshot({ path: `shots/44-footer-${w}.png` });
    const rows = await page.evaluate(() => { const r = document.querySelector('#c3s4 .ai-row'); return [...r.children].map(b => Math.round(b.getBoundingClientRect().top)); });
    console.log(w, 'chip tops', rows);
    await page.click('[data-act="toc"]'); await page.waitForTimeout(150);
    await page.click('[data-act="toc-go"][data-sec="c3s6"]'); await page.waitForTimeout(700);
    console.log(w, 'c3s6 top after toc', await page.evaluate(() => Math.round(document.getElementById('c3s6').getBoundingClientRect().top)));
    await browser.close();
  }
})();
