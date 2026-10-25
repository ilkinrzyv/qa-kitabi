const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
const SCR = path.resolve(__dirname, '..'); const FONTS = path.join(SCR, 'fonts');
const ranges = {
  'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF' };
function fontCss() { let css = '';
  for (const [name, dir, slug, ws] of [['IBM Plex Sans','fontsource-ibm-plex-sans-5.3.0','ibm-plex-sans',[400,500,600,700]],['IBM Plex Mono','fontsource-ibm-plex-mono-5.3.0','ibm-plex-mono',[400,500,600]]])
    for (const w of ws) for (const sub of ['latin-ext','latin']) { const f = `${slug}-${sub}-${w}-normal.woff2`; if (!fs.existsSync(path.join(FONTS, dir,'package','files',f))) continue;
      css += `@font-face{font-family:'${name}';font-weight:${w};src:url(https://fonts.gstatic.com/local/${dir}/${f}) format('woff2');unicode-range:${ranges[sub]};}\n`; }
  return css; }
(async () => {
  const which = process.argv[2] || 'all';
  const browser = await chromium.launch();
  for (const [mode, w] of [['light', 360], ['dark', 360], ['light', 1280]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2, colorScheme: mode });
    await ctx.route('https://fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body: fontCss() }));
    await ctx.route('https://fonts.gstatic.com/local/**', r => { const [dir, f] = r.request().url().split('/local/')[1].split('/'); r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(FONTS, dir, 'package', 'files', f)) }); });
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(__dirname, 'gallery.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const slugs = await page.$$eval('section', s => s.map(x => x.dataset.slug));
    const info = await page.evaluate(() => [...document.querySelectorAll('figure svg')].map(svg => { const r = svg.getBoundingClientRect(); return [svg.closest('section').dataset.slug, Math.round(r.width), Math.round(r.height)]; }));
    if (mode === 'light' && w === 360) console.log(JSON.stringify(info));
    // overflow check: each text bbox within svg viewBox
    const over = await page.evaluate(() => { const out = []; for (const svg of document.querySelectorAll('figure svg')) { const vb = svg.viewBox.baseVal; for (const t of svg.querySelectorAll('text')) { if (t.getAttribute('transform')) continue; const b = t.getBBox(); if (b.x < 0.5 || b.x + b.width > vb.width - 0.5 || b.y < 0 || b.y + b.height > vb.height) out.push(svg.closest('section').dataset.slug + ': ' + t.textContent + ' ' + [b.x, b.y, b.width, b.height].map(v => v.toFixed(1)).join(',')); } } return out; });
    if (over.length) console.log(mode, w, 'OVER', over);
    for (const s of slugs) { if (which !== 'all' && !which.split(',').includes(s)) continue;
      const el = await page.$(`section[data-slug="${s}"] figure`);
      await el.screenshot({ path: path.join(__dirname, 'shots', `dg-${s}-${mode}-${w}.png`) }); }
    await ctx.close();
  }
  await browser.close();
})();
