#!/usr/bin/env python3
"""Turn the exported book markdown into structured JSON for the interactive reader."""
import json, re, sys, glob, os, html as htmlmod
from markdown_it import MarkdownIt
from mdit_py_plugins.tasklists import tasklists_plugin
from bs4 import BeautifulSoup, NavigableString
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, '..', 'book', 'book.md')
OUT = os.path.join(BASE, 'book.json')

md_text = open(SRC, encoding='utf-8').read()

# ---------- 1. text fixes and adaptations for the interactive version ----------
FIXES = [
    ('düən nə etdim', 'dünən nə etdim'),
    ('“bu necə sınacağ?”', '“bu necə sınacaq?”'),
    ('ünsüiyyət', 'ünsiyyət'), ('Ünsüiyyət', 'Ünsiyyət'),
    ('həkayə', 'hekayə'), ('Həkayə', 'Hekayə'),
    ('Dəmək olar sıfır', 'Demək olar ki, sıfır'),
    ('Dəmək olar təsiri yoxdur', 'Demək olar ki, təsiri yoxdur'),
    ('dəmək olar ki', 'demək olar ki'),
    ('inciyəmə', 'incimə'),
    ('“bəli” demsən', '“bəli” desən'),
    ('Həll edəndən sonra cavabını mənə göndər — yoxlayıb rəy verəcəyəm.',
     'Həll edəndən sonra cavabını tapşırığın altındakı sahəyə yaz və “Yoxla” düyməsini bas — Claude cavabını yoxlayıb rəy verəcək. İlişib qalsan, “İpucu” düyməsi həlli açmadan istiqamət göstərəcək.'),
    ('Çətin gələn yeri sənəddə seçib şərh (comment) yaz və ya çatda soruş. Həmin hissəni daha geniş, əlavə misallarla izah edəcəyəm.',
     'Çətin gələn bölmədə “Sadə izah et” və ya “Başqa misal” düyməsini bas, ya da mətndən bir hissəni seçib “Seçiləni izah et” de. İstənilən sualını “Müəllim” bölməsində yaz.'),
    ('linkini mənə göndər.', 'linkini cavab sahəsinə yaz.'),
    ('cavab yaz və mənə göndər — yoxlayıb rəy verərəm.', 'cavab yaz və “Yoxla” düyməsini bas — Claude rəy verəcək.'),
]
for a, b in FIXES:
    n = md_text.count(a)
    if n == 0:
        print('WARN fix not found:', a[:50], file=sys.stderr)
    md_text = md_text.replace(a, b)

# widget placeholders -> markers
DIAGRAMS = [
    ('V-model', 'vmodel', 1),
    ('vəziyyət keçidləri', 'state', 2),
    ('defektin həyat dövrü', 'buglife', 3),
    ('client-server', 'web', 4),
    ('test piramidası', 'pyramid', 5),
]
lines = md_text.split('\n')
for i, ln in enumerate(lines):
    if ln.startswith('&#91;embedded content:'):
        for key, slug, k in DIAGRAMS:
            if ('embedded content: ' + key) in ln:
                cap = ln.split('embedded content: ', 1)[1].rstrip('\\]').rstrip(']').strip()
                lines[i] = f'@@DIAGRAM:{slug}:{k}:{cap}@@'
                break
        else:
            print('WARN unknown placeholder', ln, file=sys.stderr)
md_text = '\n'.join(lines)

# ---------- 2. split by headings (fence-aware via markdown-it tokens) ----------
md = MarkdownIt('commonmark', {'html': False, 'typographer': False}).enable('table').use(tasklists_plugin)
tokens = md.parse(md_text)
heads = []  # (line, level, text)
for i, t in enumerate(tokens):
    if t.type == 'heading_open':
        level = int(t.tag[1])
        text = tokens[i + 1].content
        heads.append((t.map[0], level, text))
src_lines = md_text.split('\n')

def seg_lines(idx):
    start = heads[idx][0] + 1
    end = heads[idx + 1][0] if idx + 1 < len(heads) else len(src_lines)
    return '\n'.join(src_lines[start:end]).strip('\n')

# ---------- 3. html post-processing ----------
FORMATTER = HtmlFormatter(nowrap=True)
LANG_ALIAS = {'javascript': 'javascript', 'js': 'javascript', 'sql': 'sql', 'bash': 'bash', 'json': 'json',
              'http': 'http', 'gherkin': 'gherkin', 'yaml': 'yaml', 'markdown': 'text', 'text': 'text'}
svgs = {}
for key, slug, k in DIAGRAMS:
    p = os.path.join(BASE, 'widgets', f'w{k}.svg')
    svgs[slug] = open(p, encoding='utf-8').read()

def render(mdsrc):
    h = md.render(mdsrc)
    soup = BeautifulSoup(h, 'html.parser')
    # diagrams
    for p in soup.find_all('p'):
        txt = p.get_text()
        m = re.match(r'^@@DIAGRAM:(\w+):(\d):(.*)@@$', txt.strip())
        if m:
            slug, k, cap = m.group(1), m.group(2), m.group(3)
            fig = BeautifulSoup(
                f'<figure class="diagram" data-d="{slug}"><div class="dg-scroll">{svgs[slug]}</div>'
                f'<figcaption>{htmlmod.escape(cap)}</figcaption></figure>', 'html.parser')
            p.replace_with(fig)
    # tables -> scroll wrapper
    for tb in soup.find_all('table'):
        wrap = soup.new_tag('div', attrs={'class': 'tbl'})
        tb.wrap(wrap)
    # code highlighting
    for pre in soup.find_all('pre'):
        code = pre.find('code')
        if not code:
            continue
        cls = code.get('class') or []
        lang = 'text'
        for c in cls:
            if c.startswith('language-'):
                lang = c[9:]
        src = code.get_text()
        lex_name = LANG_ALIAS.get(lang, 'text')
        try:
            lexer = get_lexer_by_name(lex_name)
            hl = highlight(src, lexer, FORMATTER)
        except Exception:
            hl = htmlmod.escape(src)
        new = BeautifulSoup(f'<pre class="code" data-lang="{lang}"><code>{hl}</code></pre>', 'html.parser')
        pre.replace_with(new)
    return soup

def inner(soup_or_tag):
    return ''.join(str(c) for c in soup_or_tag.contents).strip()

def is_block(el):
    return getattr(el, 'name', None) is not None

def blocks_of(soup):
    return [c for c in soup.contents if is_block(c)]

# ---------- 4. section builders ----------
SEC_NUM = re.compile(r'^((?:\d+|[A-Z])\.\d+)\.\s+(.*)$')
PRIN = re.compile(r'^(Prinsip \d)\.\s+(.*)$')

def split_title(t):
    m = SEC_NUM.match(t)
    if m:
        return m.group(1), m.group(2)
    m = PRIN.match(t)
    if m:
        return m.group(1), m.group(2)
    return '', t

def kind_of(title):
    if title.startswith('Diqqət'):
        return 'pitfalls'
    if title.startswith('Həll olunmuş nümunə'):
        return 'example'
    if title == 'Sənin növbən':
        return 'tasks'
    if title == 'Özünü yoxla':
        return 'selfcheck'
    return 'text'

def li_units(ol):
    out = []
    for li in ol.find_all('li', recursive=False):
        out.append(inner(li))
    return out

def build_example(soup):
    bl = blocks_of(soup)
    # find marker paragraph
    mi = None
    for i, b in enumerate(bl):
        if b.name == 'p':
            st = b.find('strong')
            if st and b.contents and b.contents[0] == st and st.get_text().startswith('Həll'):
                mi = i
                break
    if mi is None:
        raise ValueError('no Həll marker')
    task_html = ''.join(str(b) for b in bl[:mi])
    marker = bl[mi]
    rest = bl[mi + 1:]
    units = []
    pending = None
    st = marker.find('strong')
    mtext = st.get_text().strip()
    tail_after_strong = ''.join(str(c) for c in marker.contents[1:]).strip()
    if mtext not in ('Həll.', 'Həll'):
        # e.g. "Həll — pozitiv test case:" -> lead for first unit
        lead_txt = mtext.replace('Həll — ', '').replace('Həll —', '').strip()
        lead_txt = lead_txt[0].upper() + lead_txt[1:] if lead_txt else lead_txt
        pending = f'<p class="lead"><strong>{htmlmod.escape(lead_txt)}</strong>{(" " + tail_after_strong) if tail_after_strong else ""}</p>'
    elif tail_after_strong:
        units.append(f'<p>{tail_after_strong}</p>')
    for b in rest:
        if b.name == 'p' and b.contents and getattr(b.contents[0], 'name', None) == 'strong':
            stx = b.contents[0].get_text()
            if stx.startswith('Həll — '):
                nt = stx[len('Həll — '):]
                b.contents[0].string = nt[:1].upper() + nt[1:]
        if b.name == 'ol':
            for li in li_units(b):
                u = f'<div class="step-li">{li}</div>'
                if pending:
                    u = pending + u
                    pending = None
                units.append(u)
        elif b.name == 'p' and b.get_text().strip().endswith(':'):
            if pending:
                units.append(pending)
            pending = str(b)
        elif b.name == 'p' and b.contents and getattr(b.contents[0], 'name', None) == 'strong':
            if pending:
                units.append(pending)
                pending = None
            units.append(str(b))
        else:
            if pending:
                units.append(pending + str(b))
                pending = None
            elif units:
                units[-1] += str(b)
            else:
                units.append(str(b))
    if pending:
        units.append(pending)
    return task_html, units

def build_tasks(soup, prefix):
    bl = blocks_of(soup)
    intro = ''
    tasks = []
    for b in bl:
        if b.name == 'ol':
            for li in b.find_all('li', recursive=False):
                tasks.append(inner(li))
        else:
            if tasks:
                tasks[-1] += str(b)
            else:
                intro += str(b)
    return intro, [{'id': f'{prefix}t{i+1}', 'html': h} for i, h in enumerate(tasks)]

def build_selfcheck(soup, prefix):
    items = []
    for ul in soup.find_all(['ul', 'ol'], recursive=False):
        for li in ul.find_all('li', recursive=False):
            items.append(inner(li))
    return [{'id': f'{prefix}q{i+1}', 'html': h} for i, h in enumerate(items)]

def build_checklist(soup, prefix):
    items = []
    for ul in soup.find_all('ul', recursive=False):
        for li in ul.find_all('li', recursive=False):
            inp = li.find('input')
            if inp:
                inp.decompose()
            items.append(inner(li))
    return [{'id': f'{prefix}k{i+1}', 'html': h} for i, h in enumerate(items)]

# ---------- 5. walk the heading tree ----------
parts = []
chapters = []
cur_part = None
cur_ch = None
glossary = []

def new_chapter(title, part_id):
    global cur_ch
    m = re.match(r'^Fəsil (\d+)\.\s+(.*)$', title)
    if m:
        num = int(m.group(1)); t = m.group(2); cid = f'c{num}'
        kind = 'chapter'
    elif title.startswith('Əlavə A'):
        num = None; t = title.split('. ', 1)[1]; cid = 'ga'; kind = 'glossary'
    elif title.startswith('Əlavə B'):
        num = None; t = title.split('. ', 1)[1]; cid = 'gb'; kind = 'appendix'
    else:
        num = 0; t = title; cid = 'c0'; kind = 'intro'
    cur_ch = {'id': cid, 'num': num, 'title': t, 'fullTitle': title, 'kind': kind, 'part': part_id,
              'intro': '', 'sections': []}
    chapters.append(cur_ch)
    return cur_ch

for idx, (ln, level, text) in enumerate(heads):
    body = seg_lines(idx)
    if level == 1:
        if idx == 0:
            continue  # book title
        cur_part = {'id': f'p{len(parts)+1}', 'title': text, 'chapters': []}
        parts.append(cur_part)
        continue
    if level == 2:
        pid = cur_part['id'] if cur_part else None
        ch = new_chapter(text, pid)
        if cur_part:
            cur_part['chapters'].append(ch['id'])
        soup = render(body) if body.strip() else None
        if ch['kind'] == 'glossary':
            # intro paragraph + table
            ch['intro'] = ''.join(str(p) for p in soup.find_all('p', recursive=False))
            rows = soup.find('table').find('tbody').find_all('tr')
            for i, tr in enumerate(rows):
                tds = [td.get_text().strip() for td in tr.find_all('td')]
                glossary.append({'id': f'g{i+1}', 'en': tds[0], 'az': tds[1], 'def': tds[2],
                                 'ch': [int(x) for x in re.findall(r'\d+', tds[3])]})
        elif soup is not None:
            ch['intro'] = str(soup)
        continue
    if level == 3:
        ch = cur_ch
        num, t = split_title(text)
        k = kind_of(text)
        sid = f"{ch['id']}s{len(ch['sections'])+1}"
        soup = render(body)
        sec = {'id': sid, 'num': num, 'title': t, 'kind': k}
        if ch['kind'] == 'appendix':
            if soup.find('input', attrs={'type': 'checkbox'}):
                sec['kind'] = 'checklist'
                sec['items'] = build_checklist(soup, sid)
            else:
                sec['kind'] = 'template'
                sec['html'] = str(soup)
        elif k == 'example':
            task, units = build_example(soup)
            sec['task'] = task
            sec['steps'] = units
        elif k == 'tasks':
            intro, tasks = build_tasks(soup, ch['id'])
            sec['intro'] = intro
            sec['tasks'] = tasks
        elif k == 'selfcheck':
            sec['items'] = build_selfcheck(soup, ch['id'])
        else:
            sec['html'] = str(soup)
        ch['sections'].append(sec)

# intro chapter (Bu kitabı necə oxumalı) has no part
for ch in chapters:
    if ch['kind'] == 'intro':
        ch['part'] = None

# ---------- 5b. deep layers (deep/cNN.txt) ----------
FIELD_RE = re.compile(r'^@(qısa|yadda|dərin|nümunə|addımlar|növbən)\s*$', re.M)
deep_missing = []
deep_count = 0
for f in sorted(glob.glob(os.path.join(BASE, 'deep', 'c*.txt'))):
    raw = open(f, encoding='utf-8').read()
    for FIX_A, FIX_B in [('ünsüiyyət', 'ünsiyyət'), ('həkayə', 'hekayə'), ('dəmək', 'demək')]:
        raw = raw.replace(FIX_A, FIX_B)
    dblocks = re.split(r'^=== (\S+)\s*$', raw, flags=re.M)
    for i in range(1, len(dblocks), 2):
        sid, body = dblocks[i].strip(), dblocks[i + 1]
        if sid not in {s['id'] for c in chapters for s in c['sections']}:
            print('WARN deep: unknown section', sid, file=sys.stderr); continue
        fparts = FIELD_RE.split(body)
        fields = {}
        for j in range(1, len(fparts), 2):
            fields[fparts[j]] = fparts[j + 1].strip('\n').strip()
        need = ['qısa', 'yadda', 'dərin', 'nümunə', 'addımlar', 'növbən']
        miss = [k for k in need if not fields.get(k)]
        if miss:
            print('WARN deep: missing fields', sid, miss, file=sys.stderr)
        sec = next(s for c in chapters for s in c['sections'] if s['id'] == sid)
        keys = [re.sub(r'^\s*[-•]\s+', '', ln).strip() for ln in fields.get('yadda', '').split('\n') if ln.strip()]
        keys_html = [md.renderInline(k) for k in keys]
        steps_soup = render(fields.get('addımlar', ''))
        steps = []
        for b in blocks_of(steps_soup):
            if b.name == 'ol':
                steps.extend(f'<div class="step-li">{li}</div>' for li in li_units(b))
            elif steps:
                steps[-1] += str(b)
            else:
                steps.append(str(b))
        sec['x'] = {
            'short': str(render(fields.get('qısa', ''))),
            'keys': keys_html,
            'deep': str(render(fields.get('dərin', ''))),
            'ex': {'task': str(render(fields.get('nümunə', ''))), 'steps': steps,
                   'try': str(render(fields.get('növbən', ''))), 'id': sid + 'm'},
        }
        if len(keys) != 3:
            print('NOTE deep: keys count', sid, len(keys), file=sys.stderr)
        if not (3 <= len(steps) <= 6):
            print('NOTE deep: steps count', sid, len(steps), file=sys.stderr)
        deep_count += 1
for c in chapters:
    if c['kind'] != 'chapter':
        continue
    for s in c['sections']:
        if s['kind'] == 'text' and 'x' not in s:
            deep_missing.append(s['id'])

# ---------- 6. quizzes ----------
quizzes = {}
for f in sorted(glob.glob(os.path.join(BASE, 'quiz_*.json'))):
    quizzes.update(json.load(open(f, encoding='utf-8')))
errors = 0
for chn, qs in quizzes.items():
    ch = next(c for c in chapters if c['num'] == int(chn))
    for i, q in enumerate(qs):
        q['id'] = f'q{chn}-{i+1}'
        s = q.pop('s')
        target = None
        for sec in ch['sections']:
            if s == 'Diqqət' and sec['kind'] == 'pitfalls':
                target = sec; break
            if s == 'Həll' and sec['kind'] == 'example':
                target = sec; break
            if sec['num'] == s:
                target = sec; break
        if not target:
            print('ERR quiz section not found', chn, s, file=sys.stderr); errors += 1
        else:
            q['sec'] = target['id']
        assert len(q['o']) == 4 and 0 <= q['a'] < 4, q
# ---------- 6c. "say it in an interview" lines for every glossary term (interview.json, keyed by English term) ----------
say = json.load(open(os.path.join(BASE, 'interview.json'), encoding='utf-8'))
for g in glossary:
    if not (say.get(g['en']) or '').strip():
        print('ERR interview line missing', g['en'], file=sys.stderr); errors += 1
    else:
        g['say'] = say[g['en']].strip()
for k in set(say) - {g['en'] for g in glossary}:
    print('ERR interview line for unknown term', k, file=sys.stderr); errors += 1
# ---------- 6a. good / bad comparison cards (compare.json, keyed by section id) ----------
cmp_count = 0
for sid, cards in json.load(open(os.path.join(BASE, 'compare.json'), encoding='utf-8')).items():
    sec = next((s for c in chapters for s in c['sections'] if s['id'] == sid), None)
    if not sec:
        print('ERR compare section not found', sid, file=sys.stderr); errors += 1; continue
    for k in cards:
        if set(k) != {'tag', 'bad', 'good', 'why'} or not all(isinstance(v, str) and v.strip() for v in k.values()):
            print('ERR compare card fields', sid, k, file=sys.stderr); errors += 1
    sec['cmp'] = cards
    cmp_count += len(cards)
# ---------- 6d. sorting exercises (sorting.json, keyed by section id): order the steps or sort items into groups ----------
srt_count = 0
for sid, exs in json.load(open(os.path.join(BASE, 'sorting.json'), encoding='utf-8')).items():
    sec = next((s for c in chapters for s in c['sections'] if s['id'] == sid), None)
    if not sec:
        print('ERR sorting section not found', sid, file=sys.stderr); errors += 1; continue
    for ex in exs:
        bad = ex.get('type') not in ('order', 'group') or not ex.get('title') or len(ex.get('items', [])) < 3 \
            or any(not (it.get('t') and it.get('why')) for it in ex['items'])
        if ex.get('type') == 'group':
            bad = bad or len(ex.get('groups', [])) < 2 or any(it.get('g') not in ex['groups'] for it in ex['items']) \
                or any(not any(it['g'] == g for it in ex['items']) for g in ex['groups'])
        if bad:
            print('ERR sorting exercise', sid, ex.get('title'), file=sys.stderr); errors += 1
    sec['srt'] = exs
    srt_count += len(exs)
# ---------- 6e. interactive diagrams (interactive.json, keyed by section id): bva / state / dtable ----------
ix_count = 0
for sid, ix in json.load(open(os.path.join(BASE, 'interactive.json'), encoding='utf-8')).items():
    sec = next((s for c in chapters for s in c['sections'] if s['id'] == sid), None)
    t = ix.get('type')
    if t == 'bva':
        ok = all(isinstance(ix.get(k), int) for k in ('min', 'max', 'from', 'to', 'ep')) and ix['from'] < ix['min'] - 1 and ix['max'] + 1 < ix['to']
    elif t == 'state':
        ids = {s['id'] for s in ix.get('states', [])}
        evs = {e['id'] for e in ix.get('events', [])}
        ok = ix.get('start') in ids and all(f in ids and e in evs and m[0] in ids for f, mm in ix.get('moves', {}).items() for e, m in mm.items())
    elif t == 'dtable':
        cids = {c['id'] for c in ix.get('conditions', [])}
        ok = len(ix.get('rules', [])) >= 2 and all(set(r['when']) == cids and r.get('result') for r in ix['rules'])
    else:
        ok = False
    if not sec or not ok or not ix.get('title'):
        print('ERR interactive diagram', sid, t, file=sys.stderr); errors += 1; continue
    sec['ix'] = ix
    ix_count += 1
# ---------- 6b. new narrow diagrams (diagrams.py) ----------
sys.path.insert(0, BASE)
from diagrams import ALL as NEW_DIAGRAMS
dg_count = 0
for e in NEW_DIAGRAMS:
    sec = next((s for c in chapters for s in c['sections'] if s['id'] == e['sid']), None)
    if not sec:
        print('ERR diagram section', e['slug'], file=sys.stderr); errors += 1; continue
    holder, key = (sec, 'html') if e['target'] == 'html' else (sec['x'], 'deep')
    soup = BeautifulSoup(holder[key], 'html.parser')
    bl = blocks_of(soup)
    if e['anchor'] == '$end':
        tgt = bl[-1]
    else:
        m = [b for b in bl if e['anchor'] in b.get_text()]
        if not m:
            print('ERR diagram anchor', e['slug'], e['anchor'], file=sys.stderr); errors += 1; continue
        tgt = m[0]
    svg = e['d'].svg()
    if e['d'].errs:
        print('WARN diagram issues', e['slug'], e['d'].errs, file=sys.stderr)
    ph = soup.new_tag('div', attrs={'data-ph': e['slug']})
    tgt.insert_after(ph)
    fig = (f'<figure class="diagram narrow" data-d="{e["slug"]}"><div class="dg-scroll">{svg}</div>'
           f'<figcaption>{htmlmod.escape(e["cap"])}</figcaption></figure>')
    holder[key] = str(soup).replace(f'<div data-ph="{e["slug"]}"></div>', fig)
    dg_count += 1
print('new diagrams', dg_count)
# ---------- 6c. glossary term links (first occurrence per block) ----------
GL_ALIASES = []  # (gid, pattern, chapters or None, case_sensitive)
def _al(gid, *pats, chs=None, cs=False):
    for p_ in pats:
        GL_ALIASES.append((gid, p_, chs, cs))
_al('g1', 'acceptance criteria', 'qəbul meyar~'); _al('g2', 'acceptance testing', 'qəbul test~')
_al('g3', 'ad hoc'); _al('g4', 'agile'); _al('g5', 'API', cs=True); _al('g6', 'assertion~')
_al('g7', 'black box', 'qara qutu'); _al('g8', 'blocker', 'bloklayıcı')
_al('g9', 'boundary value analysis', 'sərhəd dəyər~'); _al('g9', 'BVA', cs=True)
_al('g10', 'branch', 'budaq~', chs=[20]); _al('g11', 'baq', 'defekt', chs=[1, 2])
_al('g12', 'bug life cycle', 'defektin həyat dövrü'); _al('g13', 'bug report'); _al('g14', 'build')
_al('g15', 'checklist~'); _al('g16', 'CI/CD', cs=True); _al('g17', 'commit', chs=[20, 21]); _al('g18', 'compatibility testing', 'uyğunluq test~')
_al('g19', 'cookie~'); _al('g20', 'coverage'); _al('g21', 'CRUD', cs=True); _al('g22', 'decision table', 'qərar cədvəl~')
_al('g23', 'defect clustering', 'defektlərin qruplaşması'); _al('g24', 'definition of done'); _al('g24', 'DoD', cs=True)
_al('g25', 'deployment', 'deploy'); _al('g26', 'DevTools', cs=True); _al('g27', 'duplicate'); _al('g27', 'dublikat~', chs=[12])
_al('g28', 'end-to-end', 'uçdan-uca'); _al('g28', 'E2E', cs=True); _al('g29', 'endpoint~')
_al('g30', 'entry criteria', 'exit criteria', 'giriş meyar~', 'çıxış meyar~'); _al('g31', 'environment', chs=[4])
_al('g32', 'equivalence partitioning', 'ekvivalent sinif~'); _al('g32', 'EP', cs=True)
_al('g34', 'error guessing', 'səhv təxmini'); _al('g35', 'expected result', 'actual result', 'gözlənilən nəticə~', 'faktiki nəticə~')
_al('g36', 'exploratory testing', 'exploratory', 'kəşfiyyat test~'); _al('g37', 'failure'); _al('g37', 'nasazlıq~', chs=[1, 2])
_al('g38', 'flaky', 'qeyri-sabit test~'); _al('g39', 'functional testing', 'funksional test~'); _al('g40', 'Gherkin', cs=True)
_al('g41', 'grey box', 'boz qutu'); _al('g42', 'HTTP status code', 'status kod~'); _al('g43', 'integration testing', 'inteqrasiya test~')
_al('g44', 'JQL', cs=True); _al('g45', 'JSON', cs=True); _al('g46', 'load testing', 'yük test~'); _al('g47', 'locator~', 'lokator~')
_al('g48', 'mock', 'stub'); _al('g49', 'negative testing', 'neqativ test~'); _al('g50', 'non-functional testing', 'qeyri-funksional test~')
_al('g51', 'page object model'); _al('g51', 'POM', cs=True); _al('g52', 'pairwise'); _al('g53', 'pesticide paradox', 'pestisid paradoks~')
_al('g54', 'positive testing', 'pozitiv test~'); _al('g55', 'precondition~', 'ilkin şərt~'); _al('g56', 'priority'); _al('g56', 'prioritet', chs=[11, 12])
_al('g57', 'production', 'canlı mühit~'); _al('g58', 'pull request~'); _al('g58', 'PR', cs=True, chs=[20, 21])
_al('g59', 'QA', 'QC', cs=True, chs=[1]); _al('g60', 'regression testing', 'regression', 'reqressiya test~'); _al('g61', 'release', 'reliz~')
_al('g62', 'requirement~'); _al('g63', 'retest', 'confirmation testing', 'təkrar yoxlama'); _al('g64', 'RTM', cs=True)
_al('g65', 'sanity test~'); _al('g66', 'Scrum', cs=True); _al('g67', 'SDLC', cs=True); _al('g68', 'severity', 'ciddilik')
_al('g69', 'smoke test~'); _al('g70', 'sprint~'); _al('g71', 'SQL', cs=True); _al('g72', 'staging')
_al('g73', 'state transition', 'vəziyyət keçid~'); _al('g74', 'static testing', 'statik test~'); _al('g75', 'STLC', cs=True)
_al('g76', 'stress test~'); _al('g77', 'system testing', 'sistem test~'); _al('g78', 'test case~'); _al('g79', 'test data', 'test məlumatları')
_al('g80', 'test plan', 'test planı~'); _al('g81', 'test scenario~', 'test ssenari~'); _al('g82', 'test suite~', 'test dəsti~')
_al('g83', 'UAT', cs=True); _al('g84', 'unit test~'); _al('g85', 'usability', 'istifadə rahatlığı'); _al('g86', 'user story', 'istifadəçi hekayə~')
_al('g87', 'verification', 'validation'); _al('g88', 'white box', 'ağ qutu'); _al('g89', 'workaround~', 'müvəqqəti həll')
GL_TAIL = '[a-zəğıöüşçA-ZƏĞIİÖÜŞÇ]*'
def _gl_regex(chnum):
    alts, idx = [], {}
    items = [(gid, p_, chs, cs) for gid, p_, chs, cs in GL_ALIASES if chs is None or chnum in chs]
    items.sort(key=lambda x: -len(x[1]))
    for k, (gid, p_, chs, cs) in enumerate(items):
        body = re.escape(p_.replace('~', '')) + (GL_TAIL if p_.endswith('~') else '')
        alts.append(f'(?P<a{k}>{body})' if cs else f'(?P<a{k}>(?i:{body}))')
        idx[f'a{k}'] = gid
    return re.compile(r'(?<![\w])(?:' + '|'.join(alts) + r')(?![\w])'), idx
GL_SKIP = {'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'figure', 'svg', 'button', 'th', 'kbd'}
def gl_wrap(html_s, rx, idx, cap):
    soup = BeautifulSoup(html_s, 'html.parser')
    used, n = set(), 0
    for node in list(soup.find_all(string=True)):
        if n >= cap:
            break
        if any(getattr(par, 'name', None) in GL_SKIP for par in node.parents):
            continue
        text = str(node)
        pieces, last = [], 0
        for m in rx.finditer(text):
            gid = idx[m.lastgroup]
            if gid in used or n >= cap:
                continue
            used.add(gid); n += 1
            pieces.append(htmlmod.escape(text[last:m.start()], quote=False))
            pieces.append(f'<button class="gt" data-act="gt" data-g="{gid}">{htmlmod.escape(m.group(0), quote=False)}</button>')
            last = m.end()
        if pieces:
            pieces.append(htmlmod.escape(text[last:], quote=False))
            node.replace_with(BeautifulSoup(''.join(pieces), 'html.parser'))
    return str(soup), n
gl_total = 0
for c in chapters:
    if c['kind'] != 'chapter':
        continue
    rx, idx = _gl_regex(c['num'])
    for s in c['sections']:
        if s.get('html') and s['kind'] in ('text', 'pitfalls'):
            s['html'], k = gl_wrap(s['html'], rx, idx, 6); gl_total += k
        if s.get('x'):
            s['x']['deep'], k = gl_wrap(s['x']['deep'], rx, idx, 4); gl_total += k
            s['x']['short'], k = gl_wrap(s['x']['short'], rx, idx, 2); gl_total += k
print('glossary links', gl_total)
out = {'title': 'QA Kitabı: Sıfırdan Peşəkar Testerə', 'parts': parts, 'chapters': chapters,
       'glossary': glossary, 'quizzes': quizzes}
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# ---------- 7. report ----------
print('parts', len(parts), [p['title'] for p in parts])
print('chapters', len(chapters))
tot_sec = 0
for ch in chapters:
    kinds = {}
    for s in ch['sections']:
        kinds[s['kind']] = kinds.get(s['kind'], 0) + 1
    tot_sec += len(ch['sections'])
    extra = ''
    for s in ch['sections']:
        if s['kind'] == 'example':
            extra += f" ex{len(s['steps'])}"
        if s['kind'] == 'tasks':
            extra += f" t{len(s['tasks'])}"
        if s['kind'] == 'selfcheck':
            extra += f" q{len(s['items'])}"
        if s['kind'] == 'checklist':
            extra += f" k{len(s['items'])}"
    print(f"  {ch['id']:4} {ch['kind']:9} {str(ch['num']):5} secs={len(ch['sections']):2} {kinds} {extra} | {ch['title'][:50]}")
print('deep layers', deep_count, 'missing', len(deep_missing))
print('total sections', tot_sec, 'glossary', len(glossary), 'quiz chapters', len(quizzes), 'quiz q', sum(len(v) for v in quizzes.values()), 'compare cards', cmp_count, 'sorting', srt_count, 'interactive', ix_count, 'interview lines', sum(1 for g in glossary if g.get('say')), 'errors', errors)
print('json bytes', os.path.getsize(OUT))
