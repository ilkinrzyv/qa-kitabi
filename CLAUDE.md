# QA Kitabı — notes for Claude

Interactive Azerbaijani textbook on software QA for a beginner (no programming background). One source, two outputs:

- `docs/` — offline PWA served by GitHub Pages (branch `main`, folder `/docs`) at https://ilkinrzyv.github.io/qa-kitabi/
- `dist/qa-kitab.html` — single-file page published as the claude.ai artifact https://claude.ai/artifact/ARfQ7Q2V6TsZ3nBnJdQzLq
  (artifact runtime contract 0.2.90: `window.claude.use('db' | 'user' | 'sample')`). Not committed.

## Build

```bash
pip install -r requirements.txt
python3 build/parse_book.py   # → build/book.json (gitignored); expect "deep layers 160 missing 0" and "errors 0"
python3 build/build_pwa.py    # → docs/ and dist/qa-kitabi-offline.zip; prints the new version
python3 build/build_page.py   # → dist/qa-kitab.html and build/test.html (page used by the t*.js checks)
python3 build/diagrams.py     # diagram self-check; must report 0 issues
```

Checks (Playwright 1.63, Chromium): `cd build && npm ci && npx playwright install chromium`, then
`npm run test:pwa` (service worker, offline reload, install card, update flow, mocked Anthropic API, export/import)
and `npm run test:app` (artifact mode with a mocked `window.claude`). They print JSON; look for `"errors": []` / `ERRORS []`.
Screenshots land in `build/shots/` (gitignored).

## Where things live

- `book/book.md` — chapter text. `parse_book.py` splits it into chapters and sections (ids like `c8s4`), highlights code
  with Pygments, inserts diagrams after their anchor text and links glossary terms.
- `build/deep/cNN.txt` — depth layers per section: `=== <sid>`, then `@qısa`, `@yadda` (3 bullets), `@dərin`, `@nümunə`,
  `@addımlar` (3–6 steps), `@növbən`.
- `build/interview.json` — “Müsahibədə belə de” line for every glossary term, keyed by the English term; `parse_book.py`
  counts a missing or unknown term as an error. Shown in the term sheet, the glossary (folded) and on flipped flashcards.
- `build/compare.json` — good / bad writing cards keyed by section id (`tag`, `bad`, `good`, `why`); `parse_book.py`
  attaches them as `sec.cmp` and `cmpHTML()` renders them after the section text.
- `build/sorting.json` — drag-and-drop exercises keyed by section id: `order` (items in the right order) or `group`
  (`groups` + items with `g`); every item has a `why`. Pointer events with touch-action:none on the handles, tap-to-place
  and ▲▼ as fallbacks, edge auto-scroll while dragging. State lives in memory only.
- `build/quiz_*.json` — chapter quizzes. `build/diagrams.py` — SVG diagrams registered with `reg(slug, sid, anchor, cap, d)`,
  drawn with `svgkit.py` (text measured with the vendored fonts in `fonts/`, overlap and overflow checks).
- `build/app.js` — the whole UI in one IIFE, no framework. `PWA = window.QA_PWA` exists only in the offline build:
  guard PWA-only code with `if (PWA)` so the artifact keeps working.
- Offline app without a key: `claudeGate()` opens the artifact at `#<id>-<action>` (`#c3s4-simple`, `#c3-lesson`,
  `#c3-konspekt`, `#g12-term`); `routeHash()` there starts that action once. Only book ids travel in the link — typed
  text goes to the clipboard. The handoff needs the artifact republished from the same `app.js`.
- Screen-words hint (`SW_RULES` in `app.js`): answers to items that ask for written results (`SW_TASK`) get an offline
  hint for opinion, ability, inference, "-malıdır", description-instead-of-value and bare-negation words; quoted text
  is skipped because it is copied from the screen.
- `build/pwa.js` — offline layer: service-worker registration, install prompt, Claude through the reader's own Anthropic
  API key (Messages API, streamed SSE, `anthropic-dangerous-direct-browser-access`, default model `claude-opus-5-5`,
  `output_config.effort`), progress export/import. Its `sample()` keeps the artifact runtime's contract
  (`{text, truncated}` or a rejected `{code, message, text?}`), so app.js calls Claude the same way in both builds.
- `build/sw.template.js` — cache-first service worker; the build injects VERSION (content hash) and the precache list.
  Navigations are answered with the cached `./`.

## Rules

- Reader-facing text is Azerbaijani (Latin script). Keep the book's terminology; give the English term in parentheses
  on first use.
- Never edit `docs/` by hand: change the sources, rebuild, and commit `docs/` together with the source change.
- Keep shared code safe for the claude.ai artifact sandbox (no external fetches, service workers or downloads outside
  `if (PWA)` branches).
- Nothing secret goes in the repo. The reader's API key lives only in their browser's localStorage.
- Run the relevant checks before pushing and say what could not be verified.
