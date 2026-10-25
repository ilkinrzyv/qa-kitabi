// Local test harness: serves the page with local CDN/font copies and a mock window.claude.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
const SCR = path.resolve(__dirname, '..');
const LIBS = path.join(SCR, 'libs');
const FONTS = path.join(SCR, 'fonts');

function fontCss() {
  const fam = [
    ['IBM Plex Sans', 'fontsource-ibm-plex-sans-5.3.0', 'ibm-plex-sans', [400, 500, 600, 700], false],
    ['IBM Plex Mono', 'fontsource-ibm-plex-mono-5.3.0', 'ibm-plex-mono', [400, 500, 600], false],
    ['Literata', 'fontsource-literata-5.3.0', 'literata', [400, 500, 600, 700], true],
  ];
  const ranges = {
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF'
  };
  let css = '';
  for (const [name, dir, slug, weights, italic] of fam) {
    for (const w of weights) for (const style of italic ? ['normal', 'italic'] : ['normal']) for (const sub of ['latin-ext', 'latin']) {
      const f = `${slug}-${sub}-${w}-${style}.woff2`;
      if (!fs.existsSync(path.join(FONTS, dir, 'package', 'files', f))) continue;
      css += `@font-face{font-family:'${name}';font-style:${style};font-weight:${w};font-display:swap;src:url(https://fonts.gstatic.com/local/${dir}/${f}) format('woff2');unicode-range:${ranges[sub]};}\n`;
    }
  }
  return css;
}

const MOCK = `
(() => {
  window.__mockDB = window.__mockDB || {};
  window.__sampleCalls = [];
  const clone = o => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
  const snap = (p) => ({ id: p.split('/').pop(), exists: p in window.__mockDB, data: () => clone(window.__mockDB[p]), metadata: { fromCache: false, hasPendingWrites: false } });
  const db = {
    doc(p) { return { id: p.split('/').pop(), path: p, get: async () => snap(p), set: async d => { window.__mockDB[p] = clone(d); window.__writes = (window.__writes||0)+1; }, update: async d => { Object.assign(window.__mockDB[p], clone(d)); }, delete: async () => { delete window.__mockDB[p]; } }; },
    collection(p) { const n = p.split('/').length; return { path: p, doc: id => db.doc(p + '/' + id), get: async () => { const docs = Object.keys(window.__mockDB).filter(k => k.startsWith(p + '/') && k.split('/').length === n + 1).map(snap); return { docs, size: docs.length, empty: !docs.length, docChanges: () => [] }; } }; }
  };
  const user = { id: async () => 'u_test123', isOwner: async () => true, canEdit: async () => true, can: async () => true };
  const sample = async (input, opts) => {
    window.__sampleCalls.push({ input, opts: Object.assign({}, opts, { onText: !!opts.onText, signal: !!opts.signal }) });
    const isCheck = typeof input === 'string' && input.includes('QİYMƏT');
    const text = window.__sampleReply || (isCheck ? 'QİYMƏT: Yaxşı\\n\\n**Düzgün olanlar:** sinifləri düzgün ayırmısan.\\n\\n**Düzəltmək lazımdır:** sərhəd dəyərlərini unutma.\\n\\n**Növbəti addım:** 17 və 18-i yoxla.' : 'Təsəvvür et ki, **muzeyə** gedirsən.\\n\\n| Sinif | Nümayəndə |\\n|---|---|\\n| 18–60 | 35 |\\n\\n- birinci fikir\\n- ikinci fikir\\n\\n\`\`\`javascript\\nconst a = 1;\\n\`\`\`\\n\\nƏsas fikir: bir sinifdən bir dəyər kifayətdir.');
    await new Promise(r => setTimeout(r, 400));
    let acc = '';
    for (const part of text.match(/[\\s\\S]{1,24}/g)) {
      if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'x', text: acc };
      acc += part; opts.onText && opts.onText({ text: acc, delta: part });
      await new Promise(r => setTimeout(r, 15));
    }
    return { text, truncated: false, modelTierApplied: 'complex', modelApplied: opts.model };
  };
  window.claude = { use: async name => ({ db, user, sample })[name] || null };
})();`;

async function setup(opts = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: opts.w || 390, height: opts.h || 844 }, deviceScaleFactor: 2, colorScheme: opts.dark ? 'dark' : 'light', hasTouch: true, isMobile: !!opts.mobile });
  await ctx.route('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js', r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(LIBS, 'marked-12.0.2/package/marked.min.js')) }));
  await ctx.route('https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js', r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(LIBS, 'dompurify-3.1.6/package/dist/purify.min.js')) }));
  await ctx.route('https://fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body: fontCss() }));
  await ctx.route('https://fonts.gstatic.com/local/**', r => {
    const rel = r.request().url().split('/local/')[1];
    const [dir, f] = rel.split('/');
    r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(FONTS, dir, 'package', 'files', f)) });
  });
  if (opts.mock !== false) await ctx.addInitScript(MOCK);
  if (opts.initDB) await ctx.addInitScript(`window.__mockDB = ${JSON.stringify(opts.initDB)};`);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(__dirname, 'test.html') + (opts.hash || ''));
  await page.waitForTimeout(opts.wait || 700);
  return { browser, ctx, page, errors };
}
module.exports = { setup };
