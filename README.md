# QA Kitabı — Sıfırdan Peşəkar Testerə

İnteraktiv QA (proqram təminatının testi) kitabı: 21 fəsil, hər bölmədə üç səviyyəli izah, həll olunmuş
mini-nümunələr, tapşırıqlar, fəsil testləri, 89 terminlik fleş kartlar, diaqramlar və Claude müəllim.

- **Offline tətbiq:** https://ilkinrzyv.github.io/qa-kitabi/ — telefonda aç və ana ekrana əlavə et.
  Bir dəfə açandan sonra internetsiz işləyir.
- **claude.ai versiyası:** https://claude.ai/artifact/ARfQ7Q2V6TsZ3nBnJdQzLq — Claude öz hesabınla işləyir.

Quraşdırma, Claude API açarı və məlumatların ixracı haqqında: [docs/README.md](docs/README.md).

## Repo-nun quruluşu

| Yer | Nə var |
|---|---|
| `book/book.md` | Kitabın əsas mətni (markdown) |
| `build/deep/` | Hər bölmənin əlavə qatları: qısa izah, “Yadda saxla”, “Dərindən”, mini-nümunə |
| `build/quiz_*.json` | Fəsil testləri |
| `build/diagrams.py`, `build/svgkit.py`, `build/widgets/` | SVG diaqramlar |
| `build/app.js`, `build/app.css` | Tətbiqin interfeysi |
| `build/pwa.js`, `build/pwa.css`, `build/sw.template.js` | Offline rejim, quraşdırma, Claude API, ixrac/idxal |
| `build/t*.js`, `build/tp*.js` | Playwright yoxlamaları |
| `fonts/`, `libs/` | Şriftlər və marked, DOMPurify kitabxanaları |
| `docs/` | **Hazır sayt** — GitHub Pages buradan yayımlayır. Əl ilə dəyişmə, build ilə yaradılır. |

## Dəyişiklik etmək

```bash
pip install -r requirements.txt
python3 build/parse_book.py     # book.md + qatlar + testlər + diaqramlar → build/book.json
python3 build/build_pwa.py      # → docs/ (sayt) və dist/qa-kitabi-offline.zip
python3 build/build_page.py     # → dist/qa-kitab.html (claude.ai versiyası üçün)
```

Yoxlamalar (Playwright, Chromium):

```bash
cd build && npm ci && npx playwright install chromium
npm run test:pwa    # offline, quraşdırma, yeniləmə, Claude API (mock), ixrac/idxal
npm run test:app    # claude.ai versiyasının rejimi
```

`docs/` qovluğunu commit edib push edəndə GitHub Pages saytı 1–2 dəqiqəyə yeniləyir. Quraşdırılmış
tətbiq növbəti açılışda yeni versiyanı yükləyir və “Yenilə” düyməsini göstərir.

## Lisenziyalar

Şriftlər: IBM Plex Sans, IBM Plex Mono, Literata — SIL Open Font License 1.1 (`fonts/*/package/LICENSE`).
marked — MIT. DOMPurify — Apache-2.0 və ya MPL-2.0.
