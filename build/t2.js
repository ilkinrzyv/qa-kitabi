const { setup } = require('./harness');
(async () => {
  const { browser, page, errors } = await setup();
  const ov = async (label) => { const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); if (r.sw > r.iw) console.log('OVERFLOW', label, r); };
  // practice tab
  await page.click('[data-act="tab"][data-tab="practice"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/10-practice.png' }); await ov('practice');
  // quiz 8
  await page.click('[data-act="quiz"][data-ch="8"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/11-quiz-q.png' });
  // answer: first option each time, record
  for (let i = 0; i < 9; i++) {
    await page.click('.opt >> nth=0');
    await page.waitForTimeout(120);
    if (i === 0) await page.screenshot({ path: 'shots/12-quiz-ex.png' });
    await page.click('[data-act="qz-next"]');
    await page.waitForTimeout(80);
  }
  await page.screenshot({ path: 'shots/13-quiz-result.png', fullPage: false }); await ov('quiz result');
  // retry wrong only
  const hasWrong = await page.$('[data-act="qz-wrong"]');
  console.log('has wrong retry', !!hasWrong);
  // cards
  await page.click('[data-act="tab"][data-tab="practice"]');
  await page.click('[data-act="cards"] >> nth=0');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/14-card-front.png' });
  await page.click('.fc');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/15-card-back.png' });
  await page.click('[data-act="card-yes"]');
  await page.click('.fc'); await page.waitForTimeout(500);
  await page.click('[data-act="card-no"]');
  // glossary
  await page.click('[data-act="tab"][data-tab="practice"]');
  await page.click('[data-act="glossary"] >> nth=0');
  await page.fill('#glq', 'reqressiya');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/16-glossary.png' }); await ov('glossary');
  // tutor
  await page.click('[data-act="tab"][data-tab="tutor"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/17-tutor-empty.png' });
  await page.fill('#tin', 'Sərhəd dəyəri ilə ekvivalent sinif arasında fərq nədir?');
  await page.click('#tsend');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: 'shots/18-tutor-answer.png' }); await ov('tutor');
  // progress
  await page.click('[data-act="tab"][data-tab="progress"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/19-progress.png' }); await ov('progress');
  await page.screenshot({ path: 'shots/19b-progress-full.png', fullPage: true });
  // search
  await page.click('[data-act="tab"][data-tab="book"]');
  await page.click('[data-act="search"]');
  await page.fill('#sq', 'seker');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shots/20-search.png' });
  await page.fill('#sq', '401 403');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shots/20b-search.png' });
  await page.keyboard.press('Escape');
  // settings
  await page.click('[data-act="settings"]');
  await page.waitForTimeout(200);
  await page.click('[data-act="pref"][data-k="theme"][data-v="dark"]');
  await page.click('[data-act="fs"][data-d="1"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/21-settings-dark.png' });
  await page.keyboard.press('Escape');
  await page.click('[data-act="tab"][data-tab="book"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/22-home-dark.png' });
  await page.click('[data-act="open-ch"][data-ch="c13"]');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('figure.diagram').scrollIntoView());
  await page.screenshot({ path: 'shots/23-diagram-dark.png' }); await ov('reader c13');
  await page.evaluate(() => document.querySelector('#c13s6').scrollIntoView());
  await page.screenshot({ path: 'shots/24-table-dark.png' });
  // appendix B checklist
  await page.click('[data-act="back"]');
  await page.click('[data-act="open-ch"][data-ch="gb"]');
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('#gbs5').scrollIntoView());
  await page.click('input[data-chk="gbs5k1"]');
  await page.click('input[data-chk="gbs5k3"]');
  await page.screenshot({ path: 'shots/25-checklist-dark.png' });
  await page.waitForTimeout(1500);
  const db = await page.evaluate(() => window.__mockDB);
  console.log('db keys', Object.keys(db));
  console.log('quiz rec', JSON.stringify(db['data/users/u_test123/progress'].quiz));
  console.log('cards', JSON.stringify(db['data/users/u_test123/cards']));
  console.log('checks', JSON.stringify(db['data/users/u_test123/checks']));
  console.log('chat turns', db['data/users/u_test123/chat'].turns.length, db['data/users/u_test123/chat'].ctx);
  console.log('prefs', JSON.stringify(db['data/users/u_test123/prefs']));
  console.log('errors', errors);
  await browser.close();
})();
