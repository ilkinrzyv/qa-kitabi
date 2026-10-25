const { setup } = require('./harness');
(async () => {
  const { browser, page, errors } = await setup({ w: 390, h: 844, mobile: true, mock: false, hash: '#c12', wait: 12000 });
  const r = await page.evaluate(() => ({
    ai: document.documentElement.getAttribute('data-ai'),
    visibleAi: [...document.querySelectorAll('.ai-only')].filter(e => e.offsetParent !== null).length,
    lvl: document.querySelectorAll('.sec .lvl').length, mini: document.querySelectorAll('details.mini').length,
    rpLinkVisible: [...document.querySelectorAll('[data-act="rp-open"]')].filter(e => e.offsetParent !== null).length
  }));
  console.log(JSON.stringify(r));
  await page.click('.tab[data-tab="tutor"]'); await page.waitForTimeout(200);
  console.log('tutor off text', (await page.$eval('#view', v => v.textContent)).slice(0, 60));
  // local persistence of level + mini answer
  await page.click('.tab[data-tab="book"]'); await page.waitForTimeout(200);
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.act = 'open-ch'; b.dataset.ch = 'c12'; document.body.appendChild(b); b.click(); b.remove(); });
  await page.waitForTimeout(200);
  await page.click('.ch-lvl button[data-v="deep"]'); await page.waitForTimeout(200);
  await page.evaluate(() => { const t = document.querySelector('details.mini textarea'); t.value = 'Test cavabı'; t.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(1200);
  await page.reload(); await page.waitForTimeout(800);
  console.log('after reload', JSON.stringify(await page.evaluate(() => ({ deepOpen: document.querySelectorAll('.sec details.deep[open]').length, ans: document.querySelector('details.mini textarea') && document.querySelector('details.mini textarea').value }))));
  console.log('ERRORS', errors);
  await browser.close();
})();
