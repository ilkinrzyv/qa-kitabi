# QA Kitabı — notes for Claude

Interactive Azerbaijani textbook on software QA for a beginner (no programming background). One source, two outputs:

- `docs/` — offline PWA served by GitHub Pages (branch `main`, folder `/docs`) at https://ilkinrzyv.github.io/qa-kitabi/
- `dist/qa-kitab.html` — single-file page published as the claude.ai artifact https://claude.ai/artifact/ARfQ7Q2V6TsZ3nBnJdQzLq
  (artifact runtime contract 0.2.90: `window.claude.use('db' | 'user' | 'sample')`). Not committed.

## Build

```bash
pip install -r requirements.txt
python3 build/parse_book.py   # → build/book.json (gitignored); expect "deep layers 170 missing 0" and "errors 0"
python3 build/build_pwa.py    # → docs/ and dist/qa-kitabi-offline.zip; prints the new version
python3 build/build_page.py   # → dist/qa-kitab.html and build/test.html (page used by the t*.js checks)
python3 build/diagrams.py     # diagram self-check; must report 0 issues
```

Checks (Playwright 1.63, Chromium): `cd build && npm ci && npx playwright install chromium`, then
`npm run test:pwa` (service worker, offline reload, install card, update flow, mocked Anthropic API, export/import)
and `npm run test:app` (artifact mode with a mocked `window.claude`). They print JSON; look for `"errors": []` / `ERRORS []`.
Screenshots land in `build/shots/` (gitignored).

## Where things live

- `book/book.md` — chapter text. `parse_book.py` splits it into chapters and sections (ids like `c8s4`, numbered by
  position), highlights code with Pygments, inserts diagrams after their anchor text and links glossary terms. Saved
  progress, notes, answers and every `*.json` below are keyed by these ids, so a section added later carries its own id
  in the heading (`### 3.9. Title {#c3x1}`) and the sections after it keep theirs. New quiz questions go at the end of a
  chapter's list (quiz ids are positional too). Glossary ids are frozen in `build/glossary_ids.json` (flash-card
  progress is keyed by them): a new term needs a line there, an alias in `parse_book.py` (`_al`) and an interview line.
- `build/ctfl.json` — ISTQB CTFL v4.0 map: the six syllabus chapters with their topics, each pointing to the sections
  that teach it (`#istqb`). `parse_book.py` checks every id.
- `build/deep/cNN.txt` — depth layers per section: `=== <sid>`, then `@qısa`, `@yadda` (3 bullets), `@dərin`, `@nümunə`,
  `@addımlar` (3–6 steps), `@növbən`.
- `build/interview.json` — “Müsahibədə belə de” line for every glossary term, keyed by the English term; `parse_book.py`
  counts a missing or unknown term as an error. Shown in the term sheet, the glossary (folded) and on flipped flashcards.
- `build/compare.json` — good / bad writing cards keyed by section id (`tag`, `bad`, `good`, `why`); `parse_book.py`
  attaches them as `sec.cmp` and `cmpHTML()` renders them after the section text.
- `build/sorting.json` — drag-and-drop exercises keyed by section id: `order` (items in the right order) or `group`
  (`groups` + items with `g`); every item has a `why`. Pointer events with touch-action:none on the handles, tap-to-place
  and ▲▼ as fallbacks, edge auto-scroll while dragging. State lives in memory only.
- `build/interactive.json` — one interactive diagram per section id: `bva` (number line + slider + buggy-code switch),
  `state` (states with x/y, events, `moves` = from → event → [to, note, "warn"?]) or `dtable` (conditions + rules with
  `null` for "—"). Rendered by `ixHTML()` as theme-token SVG/HTML; the BVA slider only redraws `.bva-out`.
- Summary sheets (`vSummary()` in `app.js`; `#c3-xulase`, `#xulase` for all chapters): one printed A4 page per chapter,
  built from data the book already has (each section's `@qısa`, the chapter's first diagram, pitfalls, self-check,
  glossary terms). On `beforeprint` the sheets get `.paper` (the A4 layout) and `fitSheet()` lowers `--k` until each fits
  one page; `t17.js` prints all 21 to PDF and expects 21 pages. If `print()` is ignored (the claude.ai frame may not
  allow it), a help sheet links to the same sheet on GitHub Pages.
- `build/store.json` — the practice store ("Mini Store", modelled on saucedemo.com, no real brand names): users,
  products, problem_user's bug labels, test cases (`start`, `pre`, `data`, `steps` with `on` = the event that ticks the
  step, `expect`/`see` = screen keys such as `title`, `badge`, `btn:<product>`, `item:<product>`, `error`, `field:<f>`,
  `result`, `bug` = title parts for the [harada] + [nə baş verir] + [hansı şərtdə] check) and section links.
  The shop's behaviour and problem_user's bugs are in `app.js` (`smEvent`, `SM_BUG`); after the last step the screen is
  recorded and the written actual result is compared with it. `#magaza`, `#magaza-tc04`. `t18.js` runs every test case
  and expects the computed status to equal `result`. `release` is build 1.1 for the release test (`#reliz`,
  `#reliz-tc06`): tickets (bug, key, the test case that retests it, its verdict), deferred defects, the smoke set,
  regression candidates (`need` + `why`), the regression's own bug (`bugs`: title check; its full report sits in
  `reports` with `user: ""`) and section links. 1.1's behaviour is in `smApply` (`st.ver`); checked runs land in
  `REL.runs`. `t25.js` runs every test case on 1.1 against this data and walks the four stages.
- `build/devtools.json` — the DevTools practice (`#devtools`, `#devtools-dv3`): error_user's bug labels, 13.10's five
  rows and the tasks (`start`, `pre`, `steps`, `bug`, `net`/`con` = whether the evidence is a request / a console error,
  `ev`, `row`, `side`, `why`, `model`). The shop logs what it sends in `dvtEvent` / `dvtLoad` (`app.js`, practice API
  paths); a planted bug's request or console line carries the bug's key, and that is what the diagnosis checks. A new
  page clears both logs unless Preserve log is on. The store has the same panel behind a toggle. `t26.js`.
- `build/trace.json` — code tracer programs keyed by section id (example sections too). `lang: js` steps have the line
  `l`, variables set `v` (JS literals as text), dropped `x`, console output `o` and a note `n`; `t19.js` runs each
  program in Node and expects the same console lines and final top-level values. `lang: pw` steps drive the practice
  store's shop (`a`: goto / type / login / add) and check it (`c`: url, visible, error, badge, btn); the first failed check
  ends the test, as in Playwright. `parse_book.py` pre-highlights every line (Pygments for JS; locator / action /
  assertion spans for Playwright).
- `build/playwright.json` — the Playwright practice (`#lokator-l5`, `#playwright-pw3`): locator exercises (`start`
  state, `target` = the model locator, `why`) and test tasks (`code` = starter, `model`, `hints`, `reqs`: pass / fail
  (`m` = the matcher it must fail on) / has / no (regex on the code) / state (page, cart)). The reader's code is parsed,
  never eval'd (`pwLex` / `pwParser` / `pwEval` in `app.js`): page, locators (role + accessible name, text, placeholder,
  label, test id = `data-test`, CSS, XPath, filter / first / last / nth), actions and web-first assertions with
  Playwright's strict mode, timeouts and error texts; missing `await` is a lint error. `pwDecorate` gives the shop's DOM
  saucedemo's data-test ids, so the book's code runs as written. Code and done marks are the `pw` store doc (exported).
  `t27.js` runs every model answer and the book's own Playwright programs from trace.json.
- `build/git.json` — the Git practice (`#git`, `#git-g5`): file templates (`files`, arrays of lines), tasks with a start
  repository (`commits` with `parents` / `set` / `br` / `mate`, `branches`, `head`, `work` / `index` overrides,
  `remote.branches`, `tracking`, `upstream`, `init: false` and `cfg: false` for an empty folder without an identity) and
  `checks` (init, head, branch, tree (+`re`, `not`), commits, lastOnly, untracked, ignored, msg, merge, pushed (+`re`),
  upstream, contains, clean; `moved: true` = only after a new commit, so nothing is green at the start). The terminal
  (`gitRun` in `app.js`) plays Git's commands on that model with Git's own messages (status, LCS diffs, a diff3 merge
  with conflict markers, push / pull / rebase / revert); `reset --hard` and `push --force` are refused with a reason.
  Done marks: `P().git`. `t28.js` solves every task in the terminal and the editor.
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
