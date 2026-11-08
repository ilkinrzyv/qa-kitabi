// PC layout: from 1024px the tab bar is a left sidebar (an icon rail up to 1279px, the full sidebar with the chapter's
// sections / the practice tools from 1280px), sheets open as dialogs, Ctrl+K and / open search; the phone layout and print
// stay as they were; no view overflows sideways at PC widths.
const { setup } = require('./harness');
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(450));
const box = (page, sel) => page.$eval(sel, e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
const shown = (page, sel) => page.$eval(sel, e => !!(e.offsetWidth || e.offsetHeight)).catch(() => false);
const VIEWS = ['#', '#c3s4', '#c8s3', '#mesq', '#musahibe', '#ingilisce', '#ssenari-dev-works', '#magaza-tc04', '#reliz', '#reliz-tc06', '#devtools-dv3', '#playwright-pw3', '#lokator-l5', '#git-g5',
  '#sql', '#api', '#imtahan', '#istqb', '#muellim', '#rol', '#progress', '#luget', '#c3-xulase', '#gb'];
(async () => {
  const out = {}; const ERRORS = []; const bad = [];
  // 1440: the full sidebar
  let { browser, page, errors } = await setup({ hash: '#c3s4', w: 1440, h: 900, wait: 1400 });
  out.side = await box(page, '#tabbar');
  out.brand = await shown(page, '.side-brand');
  out.tabH = (await box(page, '.tab[data-tab="book"]')).h;
  out.viewX = (await box(page, '#view')).x;
  if (out.side.x !== 0 || out.side.y !== 0 || out.side.w !== 256 || out.side.h !== 900 || !out.brand || out.tabH > 48 || out.viewX < 256) bad.push('sidebar 1440');
  out.secs = await page.$$eval('#view .sec', x => x.length);
  out.sideSecs = await page.$$eval('#sidectx .side-i[data-sec]', x => x.length);
  out.cur = await page.$eval('#sidectx .side-i[aria-current="true"]', e => e.dataset.sec).catch(() => null);
  out.tocHidden = !(await shown(page, '#topbar [data-act="toc"]'));
  if (out.sideSecs !== out.secs || out.cur !== 'c3s4' || !out.tocHidden) bad.push('reader sidebar');
  await page.click('#sidectx [data-sec="c3s6"]'); await page.waitForTimeout(900);
  out.jump = await page.evaluate(() => ({ top: Math.round(document.getElementById('c3s6').getBoundingClientRect().top), cur: (document.querySelector('#sidectx [aria-current="true"]') || {}).dataset }));
  if (Math.abs(out.jump.top - 64) > 12 || !out.jump.cur || out.jump.cur.sec !== 'c3s6') bad.push('sidebar jump');
  await page.click('#c3s6 [data-act="learn"]'); await page.waitForTimeout(100);
  out.learned = await page.$eval('#sidectx [data-sec="c3s6"]', e => e.classList.contains('ok'));
  if (!out.learned) bad.push('learned mark');
  await page.screenshot({ path: 'shots/pc-reader-1440.png' });
  // search from the keyboard, as a dialog in the middle of the screen
  await page.keyboard.press('Control+k'); await page.waitForTimeout(250);
  out.dialog = await box(page, '.sheet-panel').catch(() => null);
  out.focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  if (!out.dialog || Math.abs(out.dialog.x + out.dialog.w / 2 - 720) > 4 || out.dialog.y + out.dialog.h > 900 - 24 || out.dialog.y < 24 || out.focus !== 'sq') bad.push('search dialog');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await page.keyboard.press('/'); await page.waitForTimeout(250);
  out.slash = !!(await page.$('.sheet'));
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await go(page, '#muellim');
  await page.click('#tin'); await page.keyboard.type('a/b');
  out.slashInInput = { sheet: !!(await page.$('.sheet')), value: await page.$eval('#tin', e => e.value) };
  if (!out.slash || out.slashInInput.sheet || out.slashInInput.value !== 'a/b') bad.push('slash key');
  await page.fill('#tin', '');
  // the practice tab: the sidebar lists the tools and opens them
  await page.click('[data-act="tab"][data-tab="practice"]'); await page.waitForTimeout(300);
  out.tools = await page.$$eval('#sidectx .side-i.tool', x => x.map(b => b.textContent.trim()));
  await page.click('#sidectx .side-i.tool[data-act="git-open-task"]'); await page.waitForTimeout(400);
  out.toGit = await page.evaluate(() => ({ view: document.body.dataset.view, cur: (document.querySelector('#sidectx [aria-current="true"]') || {}).textContent }));
  await page.click('#sidectx .side-i.tool[data-act="rel-open"]'); await page.waitForTimeout(400);
  out.toRel = await page.evaluate(() => document.body.dataset.view);
  if (out.tools.length !== 17 ||out.toGit.view !== 'git' || (out.toGit.cur || '').trim() !== 'Git' || out.toRel !== 'release') bad.push('practice sidebar');
  // tutor and progress: no list
  await page.click('[data-act="tab"][data-tab="progress"]'); await page.waitForTimeout(300);
  out.progressSide = await page.$eval('#sidectx', e => e.childElementCount);
  if (out.progressSide) bad.push('progress sidebar list');
  // nothing overflows sideways at PC widths
  out.over = {};
  for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const v of VIEWS) {
      await go(page, v);
      if (v === '#') { await page.click('[data-act="tab"][data-tab="book"]'); await page.waitForTimeout(250); }
      const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (o > 0) { out.over[`${w} ${v}`] = o; bad.push(`overflow ${w} ${v}`); }
    }
  }
  // the practice tools keep the task next to what it acts on, and the sticky pane stays in sight
  out.panes = {};
  const PANES = [['#magaza-tc04', '#sm-case', '#sm-dev'], ['#reliz-tc06', '#sm-case', '#sm-dev'], ['#devtools-dv3', '#dvt', '#sm-dev'], ['#reliz', '#rel-1', '.rel-card'],
    ['#playwright-pw3', '.pw-ed-wrap', '#pw-out'], ['#lokator-l5', '.pw-q', '#pw-dev'], ['#git-g5', '.git-term', '#git-panes'], ['#sql', '.sql-q', '#sql-schema'], ['#api', '#lab-req', '#lab-res']];
  for (const [w, h] of [[1024, 768], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const [hash, a, b] of PANES) {
      await go(page, hash);
      const r = await page.evaluate(([a, b]) => { const x = document.querySelector(a).getBoundingClientRect(), y = document.querySelector(b).getBoundingClientRect(); return { gap: Math.round(y.left - x.right), over: document.documentElement.scrollWidth - innerWidth, left: Math.round(x.width), right: Math.round(y.width) }; }, [a, b]);
      out.panes[`${w} ${hash}`] = r;
      if (r.gap < 0 || r.over > 0 || r.left < 300) bad.push(`panes ${w} ${hash}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await go(page, '#devtools-dv3');
  await page.evaluate(() => window.scrollTo(0, 400)); await page.waitForTimeout(150);
  out.sticky = await page.evaluate(() => { const r = document.getElementById('sm-dev').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; });
  if (out.sticky.top !== 72 || out.sticky.bottom > 900) bad.push('sticky shop');
  // the exam: the question beside its navigator
  await go(page, '#imtahan');
  await page.click('[data-act="exam-start"]'); await page.waitForTimeout(250);
  out.examGap = await page.evaluate(() => Math.round(document.querySelector('.exam-nav').getBoundingClientRect().left - document.querySelector('.qz-q').getBoundingClientRect().right));
  if (out.examGap < 0) bad.push('exam columns');
  await page.click('[data-act="exam-nav"][data-i="7"]'); await page.waitForTimeout(150);
  out.examNav = await page.$eval('.kicker', e => e.textContent.trim().slice(0, 11));
  // the lists: two columns, and the phone order inside them
  await page.click('[data-act="tab"][data-tab="book"]'); await page.waitForTimeout(300);
  out.homeCols = await page.$$eval('#view .part', x => new Set(x.map(e => Math.round(e.getBoundingClientRect().left))).size);
  await go(page, '#luget');
  out.glCols = await page.$$eval('.gl-item', x => new Set(x.map(e => Math.round(e.getBoundingClientRect().left))).size);
  if (out.homeCols !== 2 || out.glCols !== 2) bad.push('list columns');
  // resizing across 1280 draws / removes the sidebar list
  await page.setViewportSize({ width: 1440, height: 900 }); await go(page, '#c5s2');
  out.wideList = await page.$$eval('#sidectx .side-i', x => x.length);
  await page.setViewportSize({ width: 1100, height: 800 }); await page.waitForTimeout(250);
  out.railList = await page.$$eval('#sidectx .side-i', x => x.length);
  if (!out.wideList || out.railList) bad.push('resize list');
  ERRORS.push(...errors); await browser.close();
  // 1100: the icon rail, the TOC button is back in the reader
  ({ browser, page, errors } = await setup({ hash: '#c3s4', w: 1100, h: 800, wait: 1200 }));
  out.rail = { side: await box(page, '#tabbar'), brand: await shown(page, '.side-brand'), toc: await shown(page, '#topbar [data-act="toc"]'), list: await page.$eval('#sidectx', e => e.childElementCount) };
  if (out.rail.side.w !== 88 || out.rail.brand || !out.rail.toc || out.rail.list) bad.push('rail 1100');
  await page.click('#topbar [data-act="toc"]'); await page.waitForTimeout(250);
  out.tocDialog = await box(page, '.sheet-panel');
  if (out.tocDialog.y + out.tocDialog.h > 800 - 24) bad.push('toc dialog');
  await page.click('[data-act="toc-go"][data-sec="c3s6"]'); await page.waitForTimeout(800);
  out.tocJump = await page.evaluate(() => Math.round(document.getElementById('c3s6').getBoundingClientRect().top));
  if (Math.abs(out.tocJump - 64) > 12) bad.push('toc jump');
  await page.screenshot({ path: 'shots/pc-rail-1100.png' });
  ERRORS.push(...errors); await browser.close();
  // print: the PC rules are screen-only
  ({ browser, page, errors } = await setup({ hash: '#c3-xulase', w: 1440, h: 900, wait: 1200 }));
  await page.emulateMedia({ media: 'print' });
  out.print = await page.evaluate(() => ({ pad: getComputedStyle(document.body).paddingLeft, bar: getComputedStyle(document.getElementById('tabbar')).display }));
  if (out.print.pad !== '0px' || out.print.bar !== 'none') bad.push('print');
  ERRORS.push(...errors); await browser.close();
  // phone: the tab bar stays at the bottom, the sidebar parts stay hidden
  ({ browser, page, errors } = await setup({ hash: '#c3s4', w: 390, h: 844, mobile: true, wait: 1200 }));
  out.phone = { bar: await box(page, '#tabbar'), foot: await shown(page, '.side-foot'), brand: await shown(page, '.side-brand'), list: await page.$eval('#sidectx', e => e.childElementCount),
    pad: await page.evaluate(() => getComputedStyle(document.body).paddingLeft), toc: await shown(page, '#topbar [data-act="toc"]') };
  if (out.phone.bar.y !== 844 - out.phone.bar.h || out.phone.bar.w !== 390 || out.phone.foot || out.phone.brand || out.phone.list || out.phone.pad !== '0px' || !out.phone.toc) bad.push('phone');
  for (const [hash, a, b] of [['#magaza-tc04', '#sm-case', '#sm-dev'], ['#git-g5', '.git-term', '#git-panes'], ['#playwright-pw3', '.pw-ed-wrap', '.pw-acts'], ['#api', '#lab-req', '#lab-res']]) {
    await go(page, hash);
    const o = await page.evaluate(([a, b]) => document.querySelector(b).getBoundingClientRect().top - document.querySelector(a).getBoundingClientRect().bottom, [a, b]);
    if (o < -8) bad.push('phone column ' + hash);
  }
  await go(page, '#c3s4');
  await page.click('[data-act="toc"]'); await page.waitForTimeout(250);
  out.phoneSheet = await box(page, '.sheet-panel');
  if (out.phoneSheet.y + out.phoneSheet.h !== 844) bad.push('phone sheet');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
