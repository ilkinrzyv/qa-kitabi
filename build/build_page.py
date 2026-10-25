#!/usr/bin/env python3
"""Assemble the single-file artifact page from book.json, app.css and app.js."""
import json, os
BASE = os.path.dirname(os.path.abspath(__file__))
book = json.load(open(os.path.join(BASE, 'book.json'), encoding='utf-8'))
css = open(os.path.join(BASE, 'app.css'), encoding='utf-8').read()
js = open(os.path.join(BASE, 'app.js'), encoding='utf-8').read()
data = json.dumps(book, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
assert '</script' not in js.lower()

FONTS = ('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600'
         '&family=IBM+Plex+Sans:wght@400;500;600;700'
         '&family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&display=swap')

page = f'''<title>İnteraktiv QA Kitabı</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="QA kitabının interaktiv versiyası: 21 fəsil, addım-addım nümunələr, tapşırıqlar, testlər, fleş kartlar və Claude Opus 5.5 müəllim.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>
{css}
</style>
<header id="topbar" class="topbar"><div class="wrap"></div></header>
<main id="view" class="wrap" aria-live="polite"></main>
<nav id="tabbar" class="tabbar" aria-label="Əsas bölmələr"></nav>
<script type="application/json" id="book-data">{data}</script>
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js"></script>
<script>
{js}
</script>
'''
out = os.path.join(BASE, '..', 'dist', 'qa-kitab.html')  # single-file page for the claude.ai artifact
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(page)

# local test wrapper that mimics the published skeleton
skeleton_reset = (':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
                  'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}')
test = ('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
        f'<style>{skeleton_reset}</style></head><body>{page}</body></html>')
open(os.path.join(BASE, 'test.html'), 'w', encoding='utf-8').write(test)
print('page bytes', len(page.encode('utf-8')))
