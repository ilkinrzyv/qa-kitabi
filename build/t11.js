// Links from the offline app into the claude.ai version: #<id>-<action> opens the place and starts that Claude action once.
const { setup } = require('./harness');
(async () => {
  const out = {}; const ERRORS = [];
  const open = async (hash, opts) => {
    const r = await setup(Object.assign({ hash, wait: 1500 }, opts || {}));
    const res = await r.page.evaluate(() => ({
      calls: (window.__sampleCalls || []).length,
      kicker: (document.querySelector('.sheet-head .kicker') || {}).textContent || null,
      prompt: window.__sampleCalls && window.__sampleCalls[0] ? JSON.stringify(window.__sampleCalls[0].input) : '',
      hash: location.hash,
      view: document.querySelector('.sec') ? 'reader' : document.querySelector('[data-act="ai-term"]') ? 'glossary' : 'other',
      toast: (document.querySelector('.toast:not([hidden])') || {}).textContent || null
    }));
    ERRORS.push(...r.errors.map(e => hash + ' ' + e));
    return { r, res };
  };
  let { r, res } = await open('#c3s2-simple');
  out.section = { calls: res.calls, kicker: res.kicker, asksSimple: res.prompt.includes('daha sadə dillə'), hasSection: res.prompt.includes('3.2'), hashAfter: res.hash };
  await r.page.screenshot({ path: 'shots/art-handoff-c3s2-simple.png' });
  // reload must not repeat the action
  await r.page.reload(); await r.page.waitForTimeout(1500);
  out.afterReload = await r.page.evaluate(() => ({ calls: window.__sampleCalls.length, sheet: !!document.querySelector('.sheet-head') }));
  // a link clicked while the page is open
  await r.page.evaluate(() => { location.hash = '#c4s1-example'; }); await r.page.waitForTimeout(1200);
  out.hashchange = await r.page.evaluate(() => ({ calls: window.__sampleCalls.length, kicker: document.querySelector('.sheet-head .kicker').textContent, hash: location.hash }));
  await r.browser.close();
  ({ r, res } = await open('#c3-lesson')); out.chapterLesson = { calls: res.calls, kicker: res.kicker }; await r.browser.close();
  ({ r, res } = await open('#c3-konspekt')); out.konspekt = { calls: res.calls, kicker: res.kicker }; await r.browser.close();
  ({ r, res } = await open('#g5-term')); out.term = { calls: res.calls, kicker: res.kicker, view: res.view }; await r.browser.close();
  // places only, unknown actions and made-up ids start nothing
  ({ r, res } = await open('#c3s2')); out.placeOnly = { calls: res.calls, view: res.view }; await r.browser.close();
  ({ r, res } = await open('#c3s2-bogus')); out.unknownAction = { calls: res.calls, view: res.view }; await r.browser.close();
  ({ r, res } = await open('#c3s99-simple')); out.unknownSection = { calls: res.calls, view: res.view }; await r.browser.close();
  ({ r, res } = await open('#constructor-term')); out.protoKey = { calls: res.calls }; await r.browser.close();
  ({ r, res } = await open('#toString-simple')); out.protoKey2 = { calls: res.calls }; await r.browser.close();
  // Claude not granted in this view: explain, do not fail
  ({ r, res } = await open('#c3s2-simple', { mock: false })); out.noClaude = { kicker: res.kicker, toast: res.toast }; await r.browser.close();
  out.ERRORS = ERRORS;
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
})();
