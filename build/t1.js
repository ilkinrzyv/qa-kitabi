const { setup } = require('./harness');
(async () => {
  const { browser, page, errors } = await setup();
  const ov = async (label) => { const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); if (r.sw > r.iw) console.log('OVERFLOW', label, r); };
  await page.screenshot({ path: 'shots/01-home.png' });
  await ov('home');
  console.log('ai state', await page.evaluate(() => document.documentElement.getAttribute('data-ai')));
  // open chapter 8
  await page.click('[data-act="open-ch"][data-ch="c8"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shots/02-reader-top.png' });
  await ov('reader');
  // scroll to 8.3 section
  await page.evaluate(() => document.getElementById('c8s3').scrollIntoView());
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/03-reader-bva.png' });
  // example: reveal steps
  await page.evaluate(() => document.getElementById('c8s7').scrollIntoView());
  await page.click('[data-act="ex-next"][data-sec="c8s7"]');
  await page.click('[data-act="ex-next"][data-sec="c8s7"]');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getElementById('c8s7').scrollIntoView());
  await page.screenshot({ path: 'shots/04-example.png' });
  // learn toggle
  await page.click('[data-act="learn"][data-sec="c8s1"]');
  // task answer + check
  await page.evaluate(() => document.getElementById('c8t1').scrollIntoView());
  await page.fill('[data-ans="c8t1"]', 'Valid sinif: 3–15 latın hərfi və rəqəm. Invalid: 2 simvol, 16 simvol, boş, ə hərfi. BVA: 2, 3, 15, 16.');
  await page.click('[data-act="task-check"][data-task="c8t1"]');
  await page.waitForTimeout(1600);
  await page.evaluate(() => document.getElementById('c8t1').scrollIntoView());
  await page.screenshot({ path: 'shots/05-task-check.png' });
  // AI sheet simple explanation
  await page.click('[data-act="ai"][data-mode="simple"][data-sec="c8s2"]');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'shots/06-ai-sheet.png' });
  await page.click('[data-act="sh-save"]');
  await page.waitForTimeout(300);
  await page.click('.sheet-head [data-act="sheet-close"]');
  await page.waitForTimeout(1500);
  const db = await page.evaluate(() => window.__mockDB);
  console.log('db keys', Object.keys(db));
  console.log('progress learned', JSON.stringify(db['data/users/u_test123/progress'] && db['data/users/u_test123/progress'].learned));
  console.log('ans c8', JSON.stringify(db['data/users/u_test123/ans-c8']).slice(0, 300));
  console.log('notes c8', JSON.stringify(db['data/users/u_test123/notes-c8']).slice(0, 200));
  const calls = await page.evaluate(() => window.__sampleCalls.map(c => ({ opts: c.opts, len: typeof c.input === 'string' ? c.input.length : JSON.stringify(c.input).length, head: (typeof c.input === 'string' ? c.input : c.input[0].content).slice(-260) })));
  console.log(JSON.stringify(calls, null, 1));
  console.log('errors', errors);
  await browser.close();
})();
