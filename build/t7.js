const { setup } = require('./harness');
(async () => {
  const shot = async (page, name) => page.screenshot({ path: `shots/${name}.png` });
  const log = (...a) => console.log(...a);
  // role-play
  let { browser, page, errors } = await setup({ w: 390, h: 844, mobile: true, hash: '#rol' });
  await page.waitForTimeout(400);
  log('rp cards', await page.$$eval('.rpcard', x => x.length));
  await shot(page, 'rp-list');
  await page.click('.rpcard[data-rp="dev-works"]'); await page.waitForTimeout(200);
  await shot(page, 'rp-brief');
  await page.evaluate(() => { window.__sampleReply = 'Salam. Bu report-u gördüm — məndə işləyir, yəqin email-i səhv yazmısan.'; });
  await page.click('[data-act="rp-start"]'); await page.waitForTimeout(1500);
  log('turns after start', await page.$$eval('#rpm .msg', x => x.length));
  const c0 = await page.evaluate(() => window.__sampleCalls[window.__sampleCalls.length - 1]);
  log('start input', Array.isArray(c0.input), c0.input.length, c0.input[0].content.slice(0, 60));
  await page.fill('#rpin', 'Elvin, email-i böyük hərflə yazanda (Aysel@Example.com) giriş alınmır. Video və Network cavabını əlavə etmişəm.');
  await page.evaluate(() => { window.__sampleReply = 'Hmm, mən kiçik hərflə yoxlamışdım. Videonu göstər.'; });
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  await page.fill('#rpin', 'Budur video, 0:12-də görünür. Kiçik hərflə işləyir, böyük hərflə yox. Report-u yenidən açaq?');
  await page.click('[data-act="rp-send"]'); await page.waitForTimeout(1500);
  const c2 = await page.evaluate(() => window.__sampleCalls[window.__sampleCalls.length - 1]);
  log('send input roles', c2.input.map(t => t.role).join(','));
  await page.evaluate(() => { window.__sampleReply = 'QİYMƏT: Yaxşı\n\n**Yaxşı alınanlar:** faktlar.\n\n**Yaxşılaşdırmaq olar:** mühiti də de.\n\n**Daha güclü ifadə:** “Gəl birlikdə baxaq.”\n\n**Meyarlar:** ...'; });
  await page.click('[data-act="rp-finish"]'); await page.waitForTimeout(1600);
  log('fb shown', await page.$eval('.rpfb', f => f.textContent.slice(0, 40)));
  await shot(page, 'rp-done');
  log('db roleplay', await page.evaluate(() => { const k = Object.keys(window.__mockDB).find(k => k.endsWith('/roleplay')); return k ? JSON.stringify(window.__mockDB[k]).slice(0, 160) : 'none (debounced)'; }));
  await page.click('[data-act="rp-list"]'); await page.waitForTimeout(200);
  log('list grade chip', await page.$eval('.rpcard[data-rp="dev-works"] .side', s => s.textContent));
  await page.click('[data-act="tutor-mode"][data-v="chat"]'); await page.waitForTimeout(200);
  log('chat mode', !!(await page.$('#tctx')));
  log('ERRORS', errors);
  await browser.close();
  // quiz mistakes + progress
  ({ browser, page, errors } = await setup({ w: 390, h: 844, mobile: true, hash: '#c8' }));
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('.ch-end [data-act="quiz"]').scrollIntoView());
  await page.click('.ch-end [data-act="quiz"]'); await page.waitForTimeout(200);
  for (let i = 0; i < 9; i++) {
    const n = await page.$$eval('.opt', o => o.length); if (!n) break;
    await page.click('.opt >> nth=0'); await page.waitForTimeout(80);
    await page.click('[data-act="qz-next"]'); await page.waitForTimeout(80);
  }
  log('result', await page.$eval('.result .big', b => b.textContent));
  const hasExplain = !!(await page.$('[data-act="qz-explain"]'));
  log('explain btn', hasExplain);
  await shot(page, 'qz-result');
  if (hasExplain) {
    await page.click('[data-act="qz-explain"]'); await page.waitForTimeout(1500);
    const cm = await page.evaluate(() => window.__sampleCalls[window.__sampleCalls.length - 1]);
    const tx = Array.isArray(cm.input) ? cm.input[0].content : cm.input;
    log('mistakes prompt', tx.includes('<səhvlər>'), (tx.match(/Mənim cavabım/g) || []).length);
    await page.click('.sheet-head [data-act="sheet-close"]');
  }
  await page.click('.tab[data-tab="progress"]'); await page.waitForTimeout(300);
  log('weak lesson btn', !!(await page.$('[data-act="weak-lesson"]')), await page.$eval('.tiles .tile:nth-child(2)', t => t.textContent.replace(/\s+/g, ' ')));
  await shot(page, 'progress');
  await page.click('[data-act="weak-lesson"]'); await page.waitForTimeout(1500);
  const cw = await page.evaluate(() => window.__sampleCalls[window.__sampleCalls.length - 1]);
  log('weak prompt', (Array.isArray(cw.input) ? cw.input[0].content : cw.input).includes('<zəif_yerlər>'));
  log('ERRORS', errors);
  await browser.close();
})();
