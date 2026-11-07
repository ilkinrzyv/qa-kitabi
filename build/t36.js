// Part colours and chapter banners: every part has its own colour on the home page and in the reader, in light and dark,
// readable as text; each chapter's banner shows its number and icon; the phone layout does not overflow; print hides the banner.
const { setup } = require('./harness');

const lum = rgb => { const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => v / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

(async () => {
  const out = {}; const ERRORS = [];
  const want = (name, ok, got) => { if (!ok) ERRORS.push(`${name}: ${JSON.stringify(got)}`); };
  for (const dark of [false, true]) {
    const tag = dark ? 'dark' : 'light';
    let { browser, page, errors } = await setup({ hash: '#', w: 390, h: 844, mobile: true, dark, wait: 1200 });
    const home = await page.evaluate(() => {
      const bg = getComputedStyle(document.body).backgroundColor;
      return { bg, parts: [...document.querySelectorAll('.part[data-part]')].map(p => ({ id: p.dataset.part, pn: getComputedStyle(p.querySelector('.pn') || p).color, bar: getComputedStyle(p.querySelector('.chlist')).borderLeftColor })) };
    });
    out[tag + 'Parts'] = home.parts.length;
    want(`${tag}: every part is coloured`, home.parts.length === 9, home.parts.map(p => p.id));
    const colours = new Set(home.parts.filter(p => !['p0', 'p8'].includes(p.id)).map(p => p.bar));
    want(`${tag}: seven distinct part colours`, colours.size === 7, [...colours]);
    for (const p of home.parts) want(`${tag}: ${p.id} number readable`, contrast(p.pn, home.bg) >= 4.5, [p.pn, home.bg, contrast(p.pn, home.bg).toFixed(2)]);
    await page.screenshot({ path: `shots/parts-home-390-${tag}.png` });
    // reader: the banner of a chapter in each part
    for (const [ch, num, ico, part] of [['c1', '01', 'search', 'p1'], ['c8', '08', 'sliders', 'p3'], ['c12', '12', 'bug', 'p4'], ['c19', '19', 'play', 'p6'], ['c0', '00', 'book', 'p0'], ['gb', 'B', 'copy', 'p8']]) {
      await page.evaluate(h => { location.hash = h; }, '#' + ch); await page.waitForTimeout(500);
      const b = await page.evaluate(() => {
        const el = document.querySelector('.ch-banner'); if (!el) return null;
        const r = el.getBoundingClientRect();
        return { part: el.dataset.part, num: el.querySelector('.ch-bnum').textContent, icon: el.querySelector('.ch-bico svg').innerHTML.length, w: r.width, h: r.height, hidden: el.getAttribute('aria-hidden'),
          kicker: getComputedStyle(document.querySelector('.ch-hero .kicker b')).color, bg: getComputedStyle(document.body).backgroundColor, pat: !!el.querySelector('pattern') };
      });
      want(`${tag}: ${ch} banner`, b && b.part === part && b.num === num && b.icon > 20 && b.pat && b.hidden === 'true', b);
      if (b) want(`${tag}: ${ch} kicker readable`, contrast(b.kicker, b.bg) >= 4.5, [b.kicker, b.bg]);
      if (ch === 'c8') await page.screenshot({ path: `shots/parts-c8-390-${tag}.png` });
      const secNum = await page.evaluate(() => { const n = document.querySelector('.sec .sec-num'); return n && { c: getComputedStyle(n).color, k: getComputedStyle(document.querySelector('.ch-hero .kicker b')).color, part: document.body.dataset.part }; });
      if (secNum) want(`${tag}: ${ch} section numbers in the part colour`, secNum.c === secNum.k && secNum.part === part, secNum);
    }
    await page.evaluate(() => { location.hash = '#mesq'; }); await page.waitForTimeout(400);
    want(`${tag}: other views drop the part colour`, await page.evaluate(() => !document.body.dataset.part), 'part');
    {
    }
    out[tag + 'Overflow'] = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    want(`${tag}: no overflow`, out[tag + 'Overflow'] <= 0, out[tag + 'Overflow']);
    ERRORS.push(...errors); await browser.close();
  }
  // PC and print
  let { browser, page, errors } = await setup({ hash: '#c19', w: 1440, h: 900, wait: 1200 });
  out.pcBanner = await page.$eval('.ch-banner', el => Math.round(el.getBoundingClientRect().height));
  want('PC banner taller', out.pcBanner >= 130, out.pcBanner);
  await page.screenshot({ path: 'shots/parts-c19-1440.png' });
  await page.emulateMedia({ media: 'print' });
  out.printHidden = await page.$eval('.ch-banner', el => getComputedStyle(el).display === 'none');
  want('print hides the banner', out.printHidden, out.printHidden);
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
