import html, sys
sys.path.insert(0, '.')
from diagrams import ALL
css = open('app.css', encoding='utf-8').read()
figs = []
for e in ALL:
    figs.append(f'<section data-slug="{e["slug"]}"><figure class="diagram narrow" data-d="{e["slug"]}"><div class="dg-scroll">{e["d"].svg()}</div>'
                f'<figcaption>{html.escape(e["cap"])}</figcaption></figure></section>')
page = ('<!doctype html><html lang="az"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">'
        f'<style>{css}\nsection{{max-width:680px;margin:0 auto}}</style></head><body><main class="wrap">'
        + ''.join(figs) + '</main></body></html>')
open('gallery.html', 'w', encoding='utf-8').write(page)
print('figs', len(figs))
