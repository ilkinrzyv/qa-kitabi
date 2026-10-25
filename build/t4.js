const { setup } = require('./harness');
(async () => {
  const { browser, page, errors } = await setup({ hash: '#c3' });
  await page.evaluate(() => document.querySelector('#c3s4 .sec-f').scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/40-footer.png' });
  await page.evaluate(() => document.querySelector('figure.diagram').scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: 'shots/41-vmodel.png' });
  // narrow phone 360
  await page.setViewportSize({ width: 360, height: 740 });
  await page.evaluate(() => document.querySelector('#c3s4 .sec-f').scrollIntoView({ block: 'end' }));
  await page.screenshot({ path: 'shots/42-footer-360.png' });
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
  console.log('360 overflow?', r);
  // desktop width
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.click('[data-act="back"]'); await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/43-desktop-home.png' });
  console.log('errors', errors);
  await browser.close();
})();
