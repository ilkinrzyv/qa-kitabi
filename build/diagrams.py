"""New narrow diagrams for the interactive QA book.

Each entry: dict(slug, sid, target ('html'|'deep'), anchor (text snippet of the block to insert after, or '$end'),
cap (figcaption), svg (string)).
"""
from svgkit import D, P, S, AX, A, TINT, GOOD, CRIT, WARN, tw

W = 340
ALL = []


def reg(slug, sid, anchor, cap, d, target='html'):
    ALL.append(dict(slug=slug, sid=sid, anchor=anchor, cap=cap, d=d, target=target))


# 1. QA ⊃ QC ⊃ Testing ----------------------------------------------------------
def qaqc():
    d = D('qaqc', W, 286, 'Testing QC-nin, QC isə QA-nın içindədir')
    d.title('Testing QC-nin, QC isə QA-nın içindədir')
    y0 = 42
    d.rect(10, y0, 320, 234, fill=A, fo=0.06, stroke=A, rx=12)
    d.text(24, y0 + 24, 'QA · proses', w=600)
    d.text(24, y0 + 42, 'Problemin qarşısını almaq', size=12, fill=S)
    d.text(24, y0 + 59, 'Misal: gigiyena qaydaları, təlim', size=12, fill=S)
    d.rect(26, y0 + 74, 288, 144, fill=A, fo=0.1, stroke=A, rx=10)
    d.text(40, y0 + 98, 'QC · məhsul', w=600)
    d.text(40, y0 + 116, 'Problemi aşkar etmək', size=12, fill=S)
    d.text(40, y0 + 133, 'Misal: baş aşpaz yeməyi yoxlayır', size=12, fill=S)
    d.rect(42, y0 + 148, 256, 56, fill=A, fo=0.2, stroke=A, rx=8)
    d.text(56, y0 + 172, 'Testing · hərəkət', w=600)
    d.text(56, y0 + 190, 'Misal: şorbanın dadına baxmaq', size=12, fill=S)
    return d


reg('qaqc', 'c1s2', 'Testing QC-nin içindədir', 'QA, QC, testing · restoran misalı', qaqc())


# 2. Error -> defect -> failure ----------------------------------------------------
def chain():
    d = D('chain', W, 300, 'Səhv defekt yaradır, defekt işə düşəndə nasazlıq olur')
    ty = d.title('Səhv defekt yaradır, defekt işə düşəndə nasazlıq olur')
    x, w, h = 10, 196, 52
    y1 = ty + 22
    d.labelbox(x, y1, w, h, 'Səhv · error', '0.1 yerinə 0.01 yazılır')
    y2 = y1 + h + 34
    d.line(x + w / 2, y1 + h, x + w / 2, y2, end=True)
    d.text(x + w / 2 + 10, y1 + h + 21, 'koda düşür', size=12, fill=S)
    d.labelbox(x, y2, w, h, 'Defekt · bug', 'Kodda səhv düstur qalır', fill=WARN, fo=0.1, stroke=WARN)
    y3 = y2 + h + 34
    d.line(x + w / 2, y2 + h, x + w / 2, y3, end=True)
    d.text(x + w / 2 + 10, y2 + h + 21, 'kod işə düşür', size=12, fill=S)
    d.labelbox(x, y3, w, h, 'Nasazlıq · failure', '100 AZN-ə 1 AZN endirim', fill=CRIT, fo=0.1, stroke=CRIT)
    # branch: defect that never runs
    bx, bw, bh = 226, 104, 64
    by = y2 + h / 2 - bh / 2
    d.line(x + w, y2 + h / 2, bx, y2 + h / 2, dash='4 3', end=True)
    d.rect(bx, by, bw, bh, fill=TINT, stroke=AX, dash='4 3')
    d.text(bx + bw / 2, by + 21, 'İşə düşməsə:', size=12, w=600, anchor='middle', inside=(bx, by, bw, bh))
    d.text(bx + bw / 2, by + 37, 'istifadəçi', size=12, fill=S, anchor='middle', inside=(bx, by, bw, bh))
    d.text(bx + bw / 2, by + 52, 'heç nə görmür', size=12, fill=S, anchor='middle', inside=(bx, by, bw, bh))
    d.H = y3 + h + 10
    return d


reg('chain', 'c1s3', 'Müştəri 100 manatlıq mala', 'səhv → defekt → nasazlıq · endirim misalı', chain())


# 3. Late defect = more rework (staircase) -------------------------------------------
def rework():
    d = D('rework', W, 300, 'Defekt nə qədər gec tapılsa, bir o qədər çox iş təkrarlanır')
    ty = d.title('Defekt nə qədər gec tapılsa, bir o qədər çox iş təkrarlanır')
    cols = ['Tələb', 'Dizayn', 'Kod', 'Test', 'Canlı']
    rows = ['Tələbi düzəlt', 'Dizaynı dəyiş', 'Kodu dəyiş', 'Yenidən test et', 'Təcili reliz']
    lx, cx0, cw = 10, 118, 44
    hy = ty + 26
    d.text(cx0, hy, 'Defekt harada tapılıb:', size=12, fill=S)
    for j, c in enumerate(cols):
        d.text(cx0 + j * cw + cw / 2, hy + 20, c, size=12, w=600, anchor='middle')
    ry0, rh, rg = hy + 30, 26, 4
    for i, r in enumerate(rows):
        y = ry0 + i * (rh + rg)
        d.text(lx, y + rh / 2 + 4.3, r, size=12)
        for j in range(5):
            cx = cx0 + j * cw + 3
            if i <= j:
                last = (i == 4)
                d.rect(cx, y, cw - 6, rh, fill=CRIT if last else A, fo=0.28 if last else 0.22,
                       stroke=CRIT if last else A, sw=1, rx=4)
            else:
                d.rect(cx, y, cw - 6, rh, fill='none', stroke=AX, sw=1, rx=4, so=0.35, dash='3 3')
    yb = ry0 + 5 * (rh + rg) + 16
    d.text(lx, yb, 'Təkrarlanan iş', size=12, w=600)
    for j in range(5):
        d.text(cx0 + j * cw + cw / 2, yb, str(j + 1), size=13, w=600, anchor='middle', mono=True)
    d.text(lx, yb + 22, 'Canlıda üstəlik: müştəri itkisi və reputasiya', size=12, fill=CRIT)
    d.H = yb + 32
    return d


reg('rework', 'c2s3', 'Kod yazılandan sonra tapmaq isə', 'erkən test · təkrarlanan işin həcmi', rework())


# 4. Scrum cycle ----------------------------------------------------------------------
def scrum():
    d = D('scrum', W, 440, 'Hər sprint planlamayla başlayır və retrospektivlə bitir')
    ty = d.title('Hər sprint planlamayla başlayır və retrospektivlə bitir')
    x, w = 38, 158
    cx = x + w / 2
    ax = 206  # annotations
    items = [
        ('box', 'Product Backlog', None, 32),
        ('pill', 'Sprint Planning', ('AC-ni aydınlaşdırır,', 'testi qiymətləndirir'), 30),
        ('box', 'Sprint Backlog', None, 32),
        ('sprint', 'Sprint · 1–4 həftə', ('test edir,', 'maneələri deyir'), 62),
        ('box', 'Increment', ('işləyən nəticə', '(DoD ödənib)'), 32),
        ('pill', 'Sprint Review', ('demoya kömək edir',), 30),
        ('pill', 'Retrospective', ('prosesi yaxşılaşdırır',), 30),
    ]
    y = ty + 24
    d.text(ax, y + 20, 'Tester nə edir:', size=12, w=600, fill=A)
    pos = []
    for kind, label, ann, h in items:
        if pos:
            py, ph = pos[-1]
            d.line(cx, py + ph, cx, y, end=True)
        if kind == 'pill':
            d.rect(x, y, w, h, fill=A, fo=0.16, stroke=A, rx=h / 2)
            d.text(cx, y + h / 2 + 4.6, label, size=12.5, w=600, anchor='middle', inside=(x, y, w, h))
        elif kind == 'box':
            d.rect(x, y, w, h, fill=TINT, stroke=AX, rx=6)
            d.text(cx, y + h / 2 + 4.6, label, size=12.5, w=600, anchor='middle', inside=(x, y, w, h))
        else:
            d.rect(x, y, w, h, fill=A, fo=0.08, stroke=A, rx=10)
            d.text(cx, y + 21, label, size=12.5, w=600, anchor='middle', inside=(x, y, w, h))
            # daily loop
            lx, ly = x + 22, y + 43
            d.path(f'M {lx + 7:g} {ly:g} A 7 7 0 1 1 {lx:g} {ly - 7:g}', stroke=A, end=True)
            d.text(lx + 14, ly + 4.3, 'Daily Scrum · hər gün', size=12, fill=S, inside=(x, y, w, h))
        if ann:
            for k, a_ in enumerate(ann):
                yy = y + h / 2 + 4.3 - (len(ann) - 1) * 7.5 + k * 15
                d.text(ax, yy, a_, size=12, fill=S)
        pos.append((y, h))
        y += h + 20
    # loop back from Retrospective to Sprint Planning
    ry, rh = pos[-1]
    py, ph = pos[1]
    lx = 22
    d.path(f'M {x:g} {ry + rh / 2:g} H {lx:g} V {py + ph / 2:g} H {x - 1:g}', stroke=A, end=True)
    d.text(14, (ry + py) / 2 + 20, 'növbəti sprint', size=12, fill=A, anchor='middle', rotate=-90)
    d.H = ry + rh + 12
    return d


reg('scrum', 'c3s6', 'Sprint Retrospective', 'Scrum · bir sprintin dövrü', scrum())


# 5. Kanban WIP -----------------------------------------------------------------------
def kanban():
    d = D('kanban', W, 280, 'WIP limiti dolanda yeni iş gözləyir, komanda əvvəl başladığını bitirir')
    ty = d.title('WIP limiti dolanda yeni iş gözləyir, komanda əvvəl başladığını bitirir')
    cols = [('To Do', None, ['#16', '#17', '#18']), ('In Progress', 'WIP 3', ['#13', '#14', '#15']),
            ('Testing', 'WIP 3', ['#10', '#11', '#12']), ('Done', None, ['#7', '#8', '#9'])]
    x0, cw, g = 8, 76, 6
    top = ty + 18
    colh = 172
    for i, (name, wip, cards) in enumerate(cols):
        cx = x0 + i * (cw + g)
        full = name == 'Testing'
        d.rect(cx, top, cw, colh, fill=TINT, stroke=WARN if full else AX, sw=1.5 if full else 1, rx=8)
        d.text(cx + cw / 2, top + 19, name, size=12.5, w=600, anchor='middle', inside=(cx, top, cw, colh))
        if wip:
            d.text(cx + cw / 2, top + 36, wip, size=12, anchor='middle', fill=WARN if full else S,
                   w=600 if full else 400, inside=(cx, top, cw, colh))
        for k, c in enumerate(cards):
            yy = top + 48 + k * 38
            hot = c in ('#15', '#12')
            d.rect(cx + 8, yy, cw - 16, 28, fill=P, fo=0.04, stroke=A if hot else AX, sw=1.5 if hot else 1, rx=5)
            d.text(cx + cw / 2, yy + 18.5, c, size=12.5, anchor='middle', mono=True)
    # blocked move #15 -> Testing
    c15y = top + 48 + 2 * 38 + 14
    xa, xb = x0 + cw + g + cw - 8, x0 + 2 * (cw + g) + 8
    d.line(xa, c15y, xb - 1, c15y, stroke=CRIT, sw=1.5, end=True)
    mx = (xa + xb) / 2
    d.line(mx - 5, c15y - 5, mx + 5, c15y + 5, stroke=CRIT, sw=2)
    d.line(mx - 5, c15y + 5, mx + 5, c15y - 5, stroke=CRIT, sw=2)
    # #12 -> Done frees capacity
    xa2, xb2 = x0 + 2 * (cw + g) + cw - 8, x0 + 3 * (cw + g) + 8
    d.line(xa2, c15y, xb2 - 1, c15y, stroke=GOOD, sw=1.5, end=True)
    yb = top + colh + 24
    d.text(10, yb, '#15 gözləyir: Testing dolub (3/3).', size=12, fill=CRIT)
    d.text(10, yb + 18, '#12 bitəndə yer açılır və #15 testə keçir.', size=12, fill=GOOD)
    d.H = yb + 28
    return d


reg('kanban', 'c3s7', 'iş yığılmasının qarşısını alır', 'Kanban · WIP limiti işləyəndə', kanban())


# 6. STLC chain --------------------------------------------------------------------------
def stlc():
    d = D('stlc', W, 440, 'Hər mərhələnin nəticəsi növbəti mərhələnin girişidir')
    ty = d.title('Hər mərhələnin nəticəsi növbəti mərhələnin girişidir')
    phases = [('1. Tələblərin analizi', 'oxu, sual ver, risk tap', 'suallar, risklər'),
              ('2. Planlaşdırma', 'scope, cədvəl, risklər', 'test planı'),
              ('3. Test dizaynı', 'case, checklist, data', 'test case-lər'),
              ('4. Test mühiti', 'server, build, hesablar', 'işlək mühit (smoke)'),
              ('5. Testin icrası', 'icra, report, retest', 'nəticələr, baqlar'),
              ('6. Bağlanış', 'metriklər, dərslər', 'yekun hesabat')]
    x, w, h, pitch = 10, 168, 34, 58
    y = ty + 20
    for i, (name, act, out) in enumerate(phases):
        yy = y + i * pitch
        last = i == len(phases) - 1
        d.rect(x, yy, w, h, fill=A, fo=0.12 if not last else 0.2, stroke=A, rx=6)
        d.text(x + 10, yy + h / 2 + 4.6, name, size=12.5, w=600, inside=(x, yy, w, h))
        d.text(x + w + 12, yy + h / 2 + 4.3, act, size=12, fill=S)
        # output label on the arrow below
        ay0, ay1 = yy + h, yy + pitch
        ax = x + 40
        if not last:
            d.line(ax, ay0, ax, ay1, end=True)
            d.text(ax + 10, (ay0 + ay1) / 2 + 4.3, out, size=12, w=600, fill=A)
        else:
            d.line(ax, ay0, ax, ay0 + 22, end=True)
            d.rect(x, ay0 + 22, w, 26, fill='none', stroke=A, dash='4 3', rx=6)
            d.text(x + 10, ay0 + 39.5, 'Test summary report', size=12, w=600, fill=A, inside=(x, ay0 + 22, w, 26))
            d.H = ay0 + 22 + 26 + 10
    return d


reg('stlc', 'c4s1', 'Test summary report', 'STLC · altı mərhələ və onların nəticələri', stlc())


# 7. Smoke / sanity / retest / regression map ---------------------------------------------
def changemap():
    d = D('changemap', W, 312, 'Dörd test növü: nə qədər geniş və nə qədər dərin yoxlayır')
    ty = d.title('Dörd test növü: nə qədər geniş və nə qədər dərin yoxlayır')
    x0, x1, yt, yb = 44, 326, ty + 28, ty + 234
    d.line(x0, yb, x1, yb, end=True)
    d.line(x0, yb, x0, yt, end=True)
    d.line((x0 + x1) / 2, yt + 6, (x0 + x1) / 2, yb, dash='3 4', so=0.45)
    d.line(x0, (yt + yb) / 2, x1 - 6, (yt + yb) / 2, dash='3 4', so=0.45)
    d.text(x1, yb + 20, 'genişlik: neçə sahə', size=12, fill=S, anchor='end')
    d.text(x0 + 4, yb + 20, 'dar', size=12, fill=S)
    d.text(26, (yt + yb) / 2, 'dərinlik', size=12, fill=S, anchor='middle', rotate=-90)
    pts = [('Smoke', 'hər yeni build', 276, yb - 30, 'end'),
           ('Regression', 'reliz öncəsi', 276, yt + 34, 'end'),
           ('Sanity', 'kiçik dəyişiklik', 112, yt + 46, 'start'),
           ('Retest', 'baq “Fixed” olanda', 70, yb - 82, 'start')]
    for name, sub, px, py, anc in pts:
        d.circle(px, py, 6, fill=A, stroke=A)
        lx = px - 12 if anc == 'end' else px + 12
        d.text(lx, py - 2, name, size=13, w=600, anchor=anc)
        d.text(lx, py + 14, sub, size=12, fill=S, anchor=anc)
    d.H = yb + 32
    return d


reg('changemap', 'c6s3', 'Ən çox avtomatlaşdırılan növ', 'smoke, sanity, retest, regression · genişlik və dərinlik', changemap())


# 8. Black / grey / white box ---------------------------------------------------------------
def boxes():
    d = D('boxes', W, 340, 'Fərq testerin sistemin içini nə qədər gördüyündədir')
    ty = d.title('Fərq testerin sistemin içini nə qədər gördüyündədir')
    rows = [('Black box', 'içini görmürsən', '2 + 2', '4'),
            ('Grey box', 'quruluşu bilirsən', 'Sifariş', 'UI + SQL'),
            ('White box', 'kodu görürsən', '20 AZN', '3 AZN')]
    bx, bw, bh = 98, 140, 58
    y = ty + 28
    for i, (name, sub, inp, out) in enumerate(rows):
        d.text(10, y, name, size=13, w=600)
        d.text(10 + tw(name + ' ', 13, 600), y, '— ' + sub, size=12.5, fill=S)
        top = y + 10
        cy = top + bh / 2
        d.text(10, cy + 4.6, inp, size=13, mono=True)
        d.line(70, cy, bx - 2, cy, end=True)
        if i == 0:
            d.rect(bx, top, bw, bh, fill='#25272d', stroke=AX)
            d.text(bx + bw / 2, cy + 8, '?', size=24, w=600, anchor='middle', fill='#f3f3f1')
        elif i == 1:
            d.rect(bx, top, bw, bh, fill=TINT, stroke=AX)
            d.rect(bx + 6, top + 6, 54, bh - 12, fill='#25272d', stroke=AX, sw=1, rx=5)
            d.text(bx + 33, cy + 4.3, 'kod', size=12, anchor='middle', fill='#f3f3f1')
            d.rect(bx + 68, top + 6, 64, 20, fill=A, fo=0.12, stroke=A, sw=1, rx=4)
            d.text(bx + 100, top + 20.3, 'API', size=12, w=600, anchor='middle')
            d.rect(bx + 68, top + 32, 64, 20, fill=A, fo=0.12, stroke=A, sw=1, rx=4)
            d.text(bx + 100, top + 46.3, 'Baza', size=12, w=600, anchor='middle')
        else:
            d.rect(bx, top, bw, bh, fill=A, fo=0.06, stroke=A)
            d.text(bx + 10, top + 17, 'if (total >= 50)', size=12, mono=True, inside=(bx, top, bw, bh))
            d.text(bx + 10, top + 33, '  return 0;', size=12, mono=True, fill=S, inside=(bx, top, bw, bh))
            d.text(bx + 10, top + 49, 'return 3;', size=12, mono=True, fill=S, inside=(bx, top, bw, bh))
        d.line(bx + bw + 2, cy, bx + bw + 26, cy, end=True)
        d.text(bx + bw + 32, cy + 4.6, out, size=13, mono=True)
        y = top + bh + 34
    d.H = y - 14
    return d


reg('boxes', 'c7s3', 'əslində grey box işləyir', 'black, grey, white box · tester nəyi görür', boxes())


# 9. Branch coverage --------------------------------------------------------------------------
def branch():
    d = D('branch', W, 330, 'İki test iki budağı işə salır: branch coverage 100% olur')
    ty = d.title('İki test, iki budaq: branch coverage 100%')
    cx = 170
    sy = ty + 18
    d.rect(cx - 92, sy, 184, 28, fill=TINT, stroke=AX, rx=14)
    d.text(cx, sy + 18.5, 'getShippingCost(total)', size=12, mono=True, anchor='middle')
    dy = sy + 28 + 22 + 28
    d.line(cx, sy + 28, cx, dy - 28, end=True)
    d.poly([(cx, dy - 28), (cx + 84, dy), (cx, dy + 28), (cx - 84, dy)], fill=A, fo=0.1, stroke=A)
    d.text(cx, dy + 4.4, 'total >= 50 ?', size=12.5, mono=True, anchor='middle')
    by = dy + 70
    for side, xx, lab, test, ret in ((-1, cx - 84, 'bəli', '80', 'return 0'), (1, cx + 84, 'xeyr', '20', 'return 3')):
        d.line(xx, dy, xx, by - 1, stroke=A, sw=1.5, end=True)
        tx = xx + 8 * (-side) if False else xx + (10 if side < 0 else -10)
        d.text(tx, dy + 30, lab, size=12, fill=S, anchor='start' if side < 0 else 'end')
        d.text(tx, dy + 46, 'test: ' + test, size=12, w=600, fill=A, anchor='start' if side < 0 else 'end')
        d.rect(xx - 52, by, 104, 30, fill=A, fo=0.12, stroke=A, rx=6)
        d.text(xx, by + 19.5, ret, size=12.5, mono=True, anchor='middle')
    ty2 = by + 58
    d.text(10, ty2, 'Testlər', size=12, w=600, fill=S)
    d.text(330, ty2, 'Branch coverage', size=12, w=600, fill=S, anchor='end')
    for k, (lab, frac, val) in enumerate((('yalnız 80', 0.5, '1/2 · 50%'), ('80 və 20', 1.0, '2/2 · 100%'))):
        yy = ty2 + 20 + k * 24
        d.text(10, yy + 4, lab, size=12.5, mono=False)
        bx, bw = 96, 150
        d.rect(bx, yy - 6, bw, 12, fill=TINT, stroke=AX, sw=1, rx=6)
        d.rect(bx, yy - 6, bw * frac, 12, fill=GOOD if frac == 1 else WARN, fo=0.85, rx=6)
        d.text(330, yy + 4, val, size=12.5, mono=True, anchor='end')
    d.H = ty2 + 20 + 24 + 16
    return d


reg('branch', 'c7s2', 'branch coverage 50%-dir', 'branch coverage · getShippingCost', branch())


# 10. EP + BVA on a number line ------------------------------------------------------------------
def bva():
    d = D('bva', W, 300, 'Yaş üçün 8 testin 5-i ədəd oxundan gəlir: dörd sərhəd dəyəri və bir nümayəndə')
    ty = d.title('Yaş üçün 8 testin 5-i ədəd oxundan gəlir: sərhədlər və bir nümayəndə')
    ay = ty + 104
    zl, zm1, zm2, zr = 12, 90, 270, 328
    d.rect(zl, ay - 12, zm1 - zl, 24, fill=CRIT, fo=0.14, rx=4)
    d.rect(zm1, ay - 12, zm2 - zm1, 24, fill=GOOD, fo=0.14, rx=0)
    d.rect(zm2, ay - 12, zr - zm2, 24, fill=CRIT, fo=0.14, rx=4)
    d.line(zl, ay, zr, ay, stroke=AX)
    for bxp in (149, 211):  # scale breaks
        d.line(bxp - 4, ay + 6, bxp, ay - 6, stroke=AX, sw=1.25)
        d.line(bxp + 1, ay + 6, bxp + 5, ay - 6, stroke=AX, sw=1.25)
    d.text((zl + zm1) / 2, ay - 52, 'invalid', size=12, w=600, fill=CRIT, anchor='middle')
    d.text((zm1 + zm2) / 2, ay - 52, 'valid: 18–60', size=12, w=600, fill=GOOD, anchor='middle')
    d.text((zm2 + zr) / 2, ay - 52, 'invalid', size=12, w=600, fill=CRIT, anchor='middle')
    pts = [(17, 60, 'BVA', 'xəta', CRIT), (18, 118, 'BVA', 'qəbul', GOOD), (35, 180, 'EP', 'qəbul', GOOD),
           (60, 242, 'BVA', 'qəbul', GOOD), (61, 298, 'BVA', 'xəta', CRIT)]
    for v, x, tag, res, col in pts:
        d.circle(x, ay, 6, fill=col, stroke=col)
        d.text(x, ay - 22, tag, size=12, w=600, fill=S, anchor='middle')
        d.text(x, ay + 32, str(v), size=13, w=600, mono=True, anchor='middle')
        d.text(x, ay + 49, res, size=12, fill=col, anchor='middle')
    yb = ay + 82
    d.text(12, yb, 'Oxda olmayan invalid siniflər (EP):', size=12, w=600, fill=S)
    chips = [('25,5', 'kəsr'), ('abc', 'hərflər'), ('(boş)', 'boş sahə')]
    for k, (v, lab) in enumerate(chips):
        cx = 12 + k * 108
        d.rect(cx, yb + 10, 100, 28, fill=CRIT, fo=0.08, stroke=CRIT, sw=1, rx=14)
        d.rich(cx + 50, yb + 28.5, [(v, P, 600), ('  ' + lab, S, 400)], size=12, mono=False, anchor='middle',
               inside=(cx, yb + 10, 100, 28))
    d.H = yb + 48
    return d


reg('bva', 'c8s4', '8 test bütün vacib halları', 'EP + BVA · yaş 18–60', bva())


# 11. Story -> AC -> test cases --------------------------------------------------------------------
def trace():
    d = D('trace', W, 340, 'Hər test case bir qəbul meyarından doğur')
    ty = d.title('Hər test case bir qəbul meyarından doğur')
    sy = ty + 16
    d.rect(10, sy, 320, 62, fill=A, fo=0.08, stroke=A, rx=10)
    d.text(22, sy + 19, 'USER STORY', size=11.5, w=600, fill=A, ls=0.8)
    d.text(22, sy + 37, 'Alıcı kimi məhsulları qiymətə görə sıralamaq', size=12.5, inside=(10, sy, 320, 62))
    d.text(22, sy + 53, 'istəyirəm ki, büdcəmə uyğun olanı tez tapım.', size=12.5, inside=(10, sy, 320, 62))
    acs = [('AC1', 'İki sıralama seçimi', [('TC-1', 'Artan sıra'), ('TC-2', 'Azalan sıra')]),
           ('AC2', 'Filtrlər sıfırlanmır', [('TC-3', 'Filtr + sıralama')]),
           ('AC3', 'Yeniləyəndə qalır', [('TC-4', 'F5-dən sonra')])]
    ax, aw, tx, tw_ = 10, 146, 176, 154
    y = sy + 62 + 26
    d.line(84, sy + 62, 84, y - 1, end=True)
    for code, text, tcs in acs:
        n = len(tcs)
        blockh = n * 30 + (n - 1) * 8
        ah = 44
        ay = y + blockh / 2 - ah / 2
        d.rect(ax, ay, aw, ah, fill=TINT, stroke=AX, rx=6)
        d.text(ax + 10, ay + 18, code, size=12, w=600, fill=A)
        d.text(ax + 10, ay + 34, text, size=12, inside=(ax, ay, aw, ah))
        for k, (tc, tt) in enumerate(tcs):
            tyy = y + k * 38
            d.rect(tx, tyy, tw_, 30, fill=A, fo=0.12, stroke=A, rx=6)
            d.rich(tx + 10, tyy + 19.5, [(tc + '  ', A, 600), (tt, P, 400)], size=12, mono=False,
                   inside=(tx, tyy, tw_, 30))
            d.line(ax + aw, ay + ah / 2, tx - 1, tyy + 15, end=True)
        y += blockh + 18
    d.text(10, y + 8, 'Test düşəndə hansı meyarın pozulduğu dərhal bəllidir.', size=12, fill=S)
    d.H = y + 18
    return d


reg('trace', 'c10s4', 'Cucumber', 'user story → qəbul meyarları → test case-lər', trace())


# 12. Session cookie sequence ---------------------------------------------------------------------
def session():
    d = D('session', W, 400, 'Cookie sessiyanı tanıdır; logout-dan sonra köhnə cookie işləməməlidir')
    ty = d.title('Cookie sessiyanı tanıdır; logout-dan sonra köhnə cookie işləməməlidir')
    bxl, sxl = 46, 228
    hy = ty + 16
    for lx, lab in ((bxl, 'Brauzer'), (sxl, 'Server')):
        d.rect(lx - 40, hy, 80, 26, fill=TINT, stroke=AX, rx=6)
        d.text(lx, hy + 17.5, lab, size=12.5, w=600, anchor='middle')
    msgs = [  # (direction, lines, color, note)
        ('r', ['POST /login'], AX, 'sessiya yaranır'),
        ('l', ['Set-Cookie: session=a1b2'], AX, None),
        ('r', ['GET /orders', 'Cookie: session=a1b2'], AX, 'a1b2 tanınır'),
        ('l', ['200 OK'], GOOD, None),
        ('r', ['POST /logout'], AX, 'a1b2 silinir'),
        ('r', ['GET /orders', 'Cookie: session=a1b2'], AX, 'a1b2 yoxdur'),
        ('l', ['401 Unauthorized'], GOOD, None),
    ]
    y = hy + 26 + 14
    top = hy + 26
    rows = []
    for dirn, lines, col, note in msgs:
        y += 12 * len(lines) + 6
        rows.append((dirn, lines, col, note, y))
        y += 14
    bottom = y
    d.line(bxl, top, bxl, bottom, dash='3 4')
    d.line(sxl, top, sxl, bottom, dash='3 4')
    mid = (bxl + sxl) / 2
    for dirn, lines, col, note, ay in rows:
        for k, ln in enumerate(lines):
            yy = ay - 6 - (len(lines) - 1 - k) * 14
            d.text(mid, yy, ln, size=12, mono=True, anchor='middle', fill=P if k == 0 else S)
        if dirn == 'r':
            d.line(bxl + 2, ay, sxl - 2, ay, stroke=col if col != AX else AX, end=True)
        else:
            d.line(sxl - 2, ay, bxl + 2, ay, stroke=col if col != AX else AX, end=True)
        if note:
            d.text(sxl + 8, ay + 4.3, note, size=12, fill=A)
    d.text(10, bottom + 22, 'Test: cookie-ni sil və ya logout-dan sonra köhnə', size=12, fill=S)
    d.text(10, bottom + 38, 'cookie ilə sorğu göndər — giriş rədd olunmalıdır.', size=12, fill=S)
    d.H = bottom + 48
    return d


reg('session', 'c13s7', 'sessionStorage tab bağlananda silinir', 'cookie və sessiya · login → logout', session())


# 13. Response value -> env var -> next request ----------------------------------------------------
def tokenflow():
    d = D('tokenflow', W, 400, 'Cavabdakı dəyər dəyişənə, oradan növbəti sorğuya keçir')
    ty = d.title('Cavabdakı dəyər dəyişənə, oradan növbəti sorğuya keçir')
    steps = [
        ('1. Sorğu', [('POST {{baseUrl}}/login', P, 400)], 'server cavab verir'),
        ('2. Cavab · 200 OK', [('{"token": "', P, 400), ('eyJhbGci…', A, 600), ('"}', P, 400)], 'skript oxuyur'),
        ('3. Tests skripti', [('pm.environment.set("token", …)', P, 400)], 'dəyəri saxlayır'),
        ('4. Environment', [('token = ', P, 400), ('eyJhbGci…', A, 600)], '{{token}} əvəzlənir'),
        ('5. Növbəti sorğu', [('Authorization: Bearer ', P, 400), ('{{token}}', A, 600)], None),
    ]
    x, w, h, gap = 10, 320, 46, 26
    y = ty + 16
    for i, (head, segs, arrow_lab) in enumerate(steps):
        env = head.startswith('4')
        d.rect(x, y, w, h, fill=A if env else TINT, fo=0.1 if env else None, stroke=A if env else AX, rx=8)
        d.text(x + 12, y + 18, head, size=12, w=600, fill=S)
        d.rich(x + 12, y + 36, segs, size=12, mono=True, inside=(x, y, w, h))
        if arrow_lab:
            d.line(60, y + h, 60, y + h + gap - 1, end=True)
            d.text(70, y + h + gap / 2 + 4.3, arrow_lab, size=12, fill=S)
        y += h + gap
    d.H = y - gap + 10
    return d


reg('tokenflow', 'c15s7', 'token məhz belə saxlanılır', 'Postman · cavabdan dəyişənə, dəyişəndən sorğuya', tokenflow())


# 14. JOIN on the practice DB -------------------------------------------------------------------------
def join():
    d = D('join', W, 400, 'JOIN cütləri izləyir: Nigarın sifarişi yoxdur, 107-nin müştərisi yoxdur')
    ty = d.title('JOIN cütləri izləyir: Nigarın sifarişi yoxdur, 107-nin müştərisi yoxdur')
    hy = ty + 22
    d.text(10, hy, 'customers', size=12, w=600, mono=True, fill=S)
    d.text(208, hy, 'orders', size=12, w=600, mono=True, fill=S)
    oy0, op, oh = hy + 12, 30, 24
    orders = [(101, 1), (102, 1), (103, 2), (104, 3), (105, 3), (106, 4), (107, 9)]
    ocy = {}
    for i, (oid, cid) in enumerate(orders):
        y = oy0 + i * op
        orphan = cid == 9
        d.rect(208, y, 122, oh, fill=CRIT if orphan else TINT, fo=0.1 if orphan else None,
               stroke=CRIT if orphan else AX, rx=5)
        d.text(218, y + 16.5, str(oid), size=12, w=600, mono=True, inside=(208, y, 122, oh))
        d.text(320, y + 16.5, f'müştəri {cid}', size=12, fill=CRIT if orphan else S, anchor='end',
               inside=(208, y, 122, oh))
        ocy[oid] = y + oh / 2
    custs = [(1, 'Aysel', (101, 102)), (2, 'Murad', (103,)), (3, 'Leyla', (104, 105)), (4, 'Orxan', (106,))]
    for cid, name, oids in custs:
        cy = sum(ocy[o] for o in oids) / len(oids)
        d.rect(10, cy - oh / 2, 104, oh, fill=A, fo=0.12, stroke=A, rx=5)
        d.rich(20, cy + 4.5, [(str(cid), S, 400), ('  ' + name, P, 600)], size=12, mono=False,
               inside=(10, cy - oh / 2, 104, oh))
        for o in oids:
            d.line(114, cy, 207, ocy[o], stroke=A, sw=1.25)
    ny = ocy[107] + 44
    d.rect(10, ny - oh / 2, 104, oh, fill='none', stroke=A, dash='4 3', rx=5)
    d.rich(20, ny + 4.5, [('5', S, 400), ('  Nigar', P, 600)], size=12, mono=False, inside=(10, ny - oh / 2, 104, oh))
    d.text(124, ny + 4.3, 'sifariş yoxdur', size=12, fill=S)
    d.text(269, ocy[107] + 30, 'belə müştəri yoxdur', size=12, fill=CRIT, anchor='middle')
    yb = ny + 34
    d.rich(10, yb, [('INNER JOIN', P, 600), (' — 6 sətir: yalnız xətti olanlar', S, 400)], size=12, mono=False)
    d.rich(10, yb + 18, [('LEFT JOIN', P, 600), (' — 7 sətir: + Nigar | NULL | NULL', S, 400)], size=12, mono=False)
    d.rich(10, yb + 36, [('107', CRIT, 600), (' heç birinə düşmür: sol cədvəldə cütü yoxdur', S, 400)], size=12,
           mono=False)
    d.H = yb + 46
    return d


reg('join', 'c16s8', 'Sifarişi olmayan müştəriləri tapmaq üçün idealdır', 'INNER və LEFT JOIN · məşq bazası', join())


# 15. Frame time vs average FPS (deep layer) ------------------------------------------------------------
def frametime():
    d = D('frametime', W, 320, 'Orta FPS yaxşı görünür, amma sıçrayan kadrlar qırıqlıq yaradır')
    ty = d.title('Orta FPS yaxşı görünür, amma sıçrayan kadrlar qırıqlıq yaradır')
    vals = [16.2, 16.8, 15.9, 16.5, 17.1, 16.0, 50, 16.9, 15.8, 16.4, 16.3, 16.6, 16.1, 50, 16.2, 15.9, 16.8,
            16.4, 16.0, 16.7, 16.5, 16.2, 16.9, 16.3]
    avg = sum(vals) / len(vals)
    fps = 1000 / avg
    x0, x1, yt = 44, 330, ty + 38
    yb = yt + 180
    sc = (yb - yt) / 60.0
    d.text(x0, yt - 12, 'kadr vaxtı, ms', size=12, fill=S)
    for v in (0, 16.7, 33.3, 50):
        yy = yb - v * sc
        d.line(x0, yy, x1, yy, stroke=AX, sw=1, so=0.35 if v else 1, dash=None if v == 0 else '3 4')
        d.text(x0 - 6, yy + 4.2, ('%g' % v).replace('.', ','), size=12, mono=True, fill=S, anchor='end')
    n = len(vals)
    pitch = (x1 - x0 - 6) / n
    for i, v in enumerate(vals):
        bx = x0 + 6 + i * pitch
        spike = v > 33.3
        d.rect(bx, yb - v * sc, pitch - 4, v * sc, fill=CRIT if spike else A, fo=0.9 if spike else 0.55, rx=2)
    d.text(x1, yb - 16.7 * sc - 5, '60 FPS büdcəsi', size=12, fill=GOOD, anchor='end', halo=True)
    d.text(x1, yb - 33.3 * sc - 5, '30 FPS', size=12, fill=WARN, anchor='end', halo=True)
    d.text(x1, yb + 18, 'ardıcıl kadrlar', size=12, fill=S, anchor='end')
    d.text(10, yb + 42, f'Orta: {avg:.1f} ms ≈ {fps:.0f} FPS'.replace('.', ',').replace('≈', '~'), size=12.5, w=600)
    d.text(10, yb + 60, 'Ən pis kadr: 50 ms — oyunçu “ilişmə” hiss edir.', size=12, fill=CRIT)
    d.H = yb + 70
    return d


reg('frametime', 'c17s6', '1% low', 'FPS və kadr vaxtı · stutter', frametime(), target='deep')


# 16. await timeline ---------------------------------------------------------------------------------------
def awaitd():
    d = D('await', W, 300, 'await nəticə gələnə qədər növbəti sətri saxlayır')
    ty = d.title('await nəticə gələnə qədər növbəti sətri saxlayır')
    x0, x1 = 24, 322
    panels = [('await-siz', False), ('await ilə', True)]
    y = ty + 28
    for name, has in panels:
        d.text(10, y, name, size=13, w=600, mono=False)
        ay = y + 46
        d.line(x0, ay, x1, ay, end=True)
        t_req, t_resp = 40, 262
        d.circle(t_req, ay, 5, fill=AX)
        d.text(t_req - 6, ay - 12, 'sorğu getdi', size=12, fill=S)
        d.circle(t_resp, ay, 5, fill=AX)
        d.text(t_resp, ay - 12, 'cavab gəldi', size=12, fill=S, anchor='middle')
        if not has:
            lx = 70
            d.circle(lx, ay, 6, fill=CRIT, stroke=CRIT)
            d.text(lx - 12, ay + 22, 'console.log(response)', size=12, mono=True)
            d.text(lx - 12, ay + 38, 'Promise { <pending> }', size=12, mono=True, fill=CRIT)
        else:
            d.rect(t_req + 9, ay - 10, t_resp - t_req - 18, 20, fill=A, fo=0.16, rx=10)
            d.text((t_req + t_resp) / 2, ay + 4.3, 'await: gözləyir', size=12, w=600, fill=A, anchor='middle',
                   halo=True)
            lx = 292
            d.circle(lx, ay, 6, fill=GOOD, stroke=GOOD)
            d.text(330, ay + 24, 'console.log(user.name)', size=12, mono=True, anchor='end')
            d.text(330, ay + 40, 'Leanne Graham', size=12, mono=True, fill=GOOD, anchor='end')
        y = ay + 72
    d.H = y - 10
    return d


reg('await', 'c18s9', 'nəticə gələnə qədər gözlə', 'async/await · iki zaman xətti', awaitd())


# 17. POM vs no POM -------------------------------------------------------------------------------------------
def pom():
    d = D('pom', W, 400, 'Lokator dəyişəndə POM ilə yalnız bir fayl düzəlir')
    ty = d.title('Lokator dəyişəndə POM ilə bir fayl düzəlir')
    tests = ['login.spec', 'cart.spec', 'order.spec']
    tx = [8, 120, 232]
    tw_ = 100

    def tests_row(y, col):
        for x, t in zip(tx, tests):
            d.rect(x, y, tw_, 26, fill=TINT, stroke=AX, rx=5)
            d.text(x + tw_ / 2, y + 17.5, t, size=12, mono=True, anchor='middle', inside=(x, y, tw_, 26))

    # without POM
    y = ty + 26
    d.text(10, y, 'POM-suz', size=13, w=600)
    ty1 = y + 10
    tests_row(ty1, CRIT)
    ub = (90, ty1 + 26 + 44, 160, 40)
    for x in tx:
        d.line(x + tw_ / 2, ty1 + 26, ub[0] + ub[2] / 2 + (x - 120) * 0.45, ub[1] - 1, stroke=CRIT, end=True)
    d.rect(*ub, fill=CRIT, fo=0.08, stroke=CRIT, rx=6)
    d.text(ub[0] + ub[2] / 2, ub[1] + 17, 'Login düyməsi', size=12.5, w=600, anchor='middle', inside=ub)
    d.text(ub[0] + ub[2] / 2, ub[1] + 32, '#login-button', size=12, mono=True, fill=S, anchor='middle', inside=ub)
    d.text(258, ub[1] + 15, 'lokator', size=12, fill=CRIT)
    d.text(258, ub[1] + 31, '3 yerdə', size=12, w=600, fill=CRIT)
    sep = ub[1] + ub[3] + 18
    d.line(10, sep, 330, sep, stroke=AX, sw=1, so=0.4)
    # with POM
    y = sep + 24
    d.text(10, y, 'POM ilə', size=13, w=600)
    ty2 = y + 10
    tests_row(ty2, GOOD)
    pb = (90, ty2 + 26 + 40, 160, 40)
    for x in tx:
        d.line(x + tw_ / 2, ty2 + 26, pb[0] + pb[2] / 2 + (x - 120) * 0.45, pb[1] - 1, stroke=AX, end=True)
    d.rect(*pb, fill=GOOD, fo=0.1, stroke=GOOD, rx=6)
    d.text(pb[0] + pb[2] / 2, pb[1] + 17, 'LoginPage', size=12.5, w=600, anchor='middle', inside=pb)
    d.text(pb[0] + pb[2] / 2, pb[1] + 32, 'this.loginButton', size=12, mono=True, fill=S, anchor='middle', inside=pb)
    d.text(258, pb[1] + 15, 'lokator', size=12, fill=GOOD)
    d.text(258, pb[1] + 31, '1 yerdə', size=12, w=600, fill=GOOD)
    ub2 = (90, pb[1] + pb[3] + 30, 160, 32)
    d.line(170, pb[1] + pb[3], 170, ub2[1] - 1, end=True)
    d.rect(*ub2, fill=TINT, stroke=AX, rx=6)
    d.text(170, ub2[1] + 20.5, 'Login düyməsi', size=12.5, w=600, anchor='middle', inside=ub2)
    d.H = ub2[1] + ub2[3] + 10
    return d


reg('pom', 'c19s7', '$end', 'Page Object Model · dəyişiklik bir yerdə', pom())


# 18. Fixed wait vs auto-wait -----------------------------------------------------------------------------------
def waitd():
    d = D('wait', W, 330, 'Sabit gözləmə vaxtı tutmayanda düşür, şərti gözləmə nəticəni gözləyir')
    ty = d.title('Sabit gözləmə vaxtı tutmayanda düşür, şərti gözləmə nəticəni gözləyir')
    x0, x1 = 24, 314
    pps = (x1 - x0) / 2.0  # 0..2 s

    def X(t):
        return x0 + t * pps

    top = ty + 40
    lane1, lane2 = top + 40, top + 128
    bottom = lane2 + 52
    for t, lab in ((0.8, 'tez: 0,8 s'), (1.4, 'yavaş: 1,4 s')):
        d.line(X(t), top - 6, X(t), bottom - 18, stroke=A, dash='4 3', sw=1.25)
        d.text(X(t), top - 14, lab, size=12, w=600, fill=A, anchor='middle')
    # lane 1: fixed wait 1.0 s
    d.text(10, lane1 - 18, 'waitForTimeout(1000)', size=12, mono=True, halo=True)
    d.rect(X(0), lane1 - 6, X(1.0) - X(0), 12, fill=AX, fo=0.25, rx=6)
    d.poly([(X(1.0), lane1 - 8), (X(1.0) + 8, lane1), (X(1.0), lane1 + 8), (X(1.0) - 8, lane1)], fill=P)
    d.text(10, lane1 + 26, 'Yoxlama 1,0 s-də: tez gündə keçir, yavaş gündə düşür.', size=12, fill=CRIT, halo=True)
    # lane 2: polling
    d.text(10, lane2 - 18, 'await expect(…)', size=12, mono=True, halo=True)
    t = 0.0
    while t <= 1.4001:
        d.circle(X(t), lane2, 2.4, fill=AX)
        t += 0.1
    d.circle(X(1.4), lane2, 6, fill=GOOD, stroke=GOOD)
    d.text(10, lane2 + 26, 'Şərt ödənənə qədər təkrar yoxlayır: hər iki gündə keçir.', size=12, fill=GOOD, halo=True)
    # axis
    ay = bottom
    d.line(x0, ay, x1 + 8, ay, end=True)
    for tt in (0, 0.5, 1.0, 1.5, 2.0):
        d.line(X(tt), ay - 4, X(tt), ay + 4)
        d.text(X(tt), ay + 18, ('%g s' % tt).replace('.', ','), size=12, mono=True, fill=S, anchor='middle')
    d.H = ay + 28
    return d


reg('wait', 'c19s9', 'trace viewer', 'flaky test · sabit və şərti gözləmə', waitd())


# 19. Git areas ----------------------------------------------------------------------------------------------------------
def gitareas():
    d = D('gitareas', W, 360, 'Dəyişiklik dörd yerdən keçir və hər keçid bir əmrdir')
    ty = d.title('Dəyişiklik dörd yerdən keçir və hər keçid bir əmrdir')
    x, w, h, pitch = 30, 196, 46, 76
    items = [('İşçi qovluq', 'redaktə etdiyin fayllar'), ('Staging', 'commit-ə hazır dəyişikliklər'),
             ('Lokal repo', 'commit-lərin tarixçəsi'), ('GitHub (remote)', 'komandanın ortaq nüsxəsi')]
    cmds = ['git add', 'git commit -m', 'git push']
    y0 = ty + 20
    for i, (t, s) in enumerate(items):
        y = y0 + i * pitch
        gh = i == 3
        d.labelbox(x, y, w, h, t, s, fill=A, fo=0.16 if gh else 0.08, stroke=A)
        if i < 3:
            d.line(x + 56, y + h, x + 56, y + pitch - 1, end=True)
            d.text(x + 66, y + h + (pitch - h) / 2 + 4.3, cmds[i], size=12.5, w=500, mono=True, fill=A)
    # pull arrow
    yl = y0 + 3 * pitch + h / 2
    yf = y0 + h / 2
    rx = 262
    d.path(f'M {x + w:g} {yl:g} H {rx:g} V {yf:g} H {x + w + 1:g}', stroke=GOOD, end=True)
    d.text(rx + 8, (yl + yf) / 2 + 4.3, 'git pull', size=12.5, w=500, mono=True, fill=GOOD)
    d.H = y0 + 3 * pitch + h + 12
    return d


reg('gitareas', 'c20s2', 'Faylın yolu belədir', 'Git · işçi qovluqdan GitHub-a', gitareas())


# 20. Branch + PR flow -----------------------------------------------------------------------------------------------------
def prflow():
    d = D('prflow', W, 350, 'Hər tapşırıq ayrıca budaqda gedir və main-ə yalnız PR ilə qayıdır')
    ty = d.title('Hər tapşırıq ayrıca budaqda gedir və main-ə yalnız PR ilə qayıdır')
    my, fy = ty + 50, ty + 118
    d.text(10, my - 14, 'main', size=12, w=600, mono=True, fill=A)
    d.line(16, my, 326, my, stroke=A, sw=2, end=True)
    for x in (34, 84):
        d.circle(x, my, 6, fill=A, stroke=A)
    d.circle(296, my, 7, fill=GOOD, stroke=GOOD)
    # branch
    d.path(f'M 84 {my:g} C 100 {my:g} 104 {fy:g} 124 {fy:g} H 236', stroke=AX, sw=2)
    for x in (140, 190, 236):
        d.circle(x, fy, 6, fill='none', stroke=AX, sw=2)
    d.path(f'M 236 {fy:g} C 264 {fy:g} 270 {my:g} 289 {my:g}', stroke=GOOD, sw=2, dash='5 4', end=True)
    d.text(124, fy + 26, 'feature/login-tests', size=12, mono=True, fill=S)
    badges = [(1, 98, my + 30), (2, 190, fy - 22), (3, 236, fy - 22), (4, 270, fy - 8), (5, 296, my - 22)]
    for n, bx, by in badges:
        d.circle(bx, by, 9, fill=P)
        d.text(bx, by + 4.3, str(n), size=12, w=600, anchor='middle', fill=TINT, check=False)
    legend = [('budaq aç', 'git switch -c feature/login-tests'),
              ('commit-lər', 'kiçik, mənalı mesajlarla'),
              ('push + PR', 'GitHub-da pull request aç'),
              ('review + CI', 'təsdiq və yaşıl testlər'),
              ('merge', 'main yenə işlək qalır')]
    ly = fy + 56
    for i, (a_, b) in enumerate(legend):
        yy = ly + i * 22
        d.circle(19, yy - 4, 8, fill=P)
        d.text(19, yy + 0.3, str(i + 1), size=11.5, w=600, anchor='middle', fill=TINT, check=False)
        d.rich(34, yy, [(a_, P, 600), ('  ' + b, S, 400)], size=12, mono=False)
    d.H = ly + 4 * 22 + 12
    return d


reg('prflow', 'c20s4', 'PR main-ə birləşdirilir', 'budaq → pull request → merge', prflow())


# 21. CI pipeline with gates ------------------------------------------------------------------------------------------------
def pipeline():
    d = D('pipeline', W, 440, 'Hər mərhələ qapıdır: düşən mərhələdən sonra pipeline dayanır')
    ty = d.title('Hər mərhələ qapıdır: düşən mərhələdən sonra pipeline dayanır')
    stages = ['Push / PR', 'Build', 'Linter + unit testlər', 'API testləri', 'Deploy: staging', 'E2E + smoke',
              'Deploy: production']
    x, w, h, pitch = 38, 172, 32, 50
    y0 = ty + 20
    cx = x + w / 2
    for i, s in enumerate(stages):
        y = y0 + i * pitch
        if i == 0:
            d.rect(x, y, w, h, fill=A, fo=0.18, stroke=A, rx=h / 2)
        elif s.startswith('Deploy'):
            d.rect(x, y, w, h, fill=GOOD, fo=0.1, stroke=GOOD, rx=6)
        else:
            d.rect(x, y, w, h, fill=TINT, stroke=AX, rx=6)
        d.text(cx, y + h / 2 + 4.5, s, size=12.5, w=600, anchor='middle', inside=(x, y, w, h))
        if i < len(stages) - 1:
            d.line(cx, y + h, cx, y + pitch - 1, end=True)
    # fail branch at API tests
    fy = y0 + 3 * pitch + h / 2
    fx = 236
    d.line(x + w, fy, fx - 1, fy, stroke=CRIT, sw=1.5, end=True)
    d.rect(fx, fy - 30, 96, 60, fill=CRIT, fo=0.08, stroke=CRIT, rx=6)
    d.text(fx + 48, fy - 11, 'Düşdü?', size=12, w=600, fill=CRIT, anchor='middle')
    d.text(fx + 48, fy + 5, 'deploy olmur,', size=12, fill=S, anchor='middle')
    d.text(fx + 48, fy + 20, 'xəbər gedir', size=12, fill=S, anchor='middle')
    # delivery vs deployment
    ly = y0 + 5 * pitch + h + (pitch - h) / 2
    d.text(cx + 10, ly + 4.3, 'Delivery: əl ilə təsdiq', size=12, fill=S)
    # speed axis
    d.line(18, y0 + pitch, 18, y0 + 5 * pitch + h, stroke=AX, end=True)
    d.text(13, y0 + 3 * pitch + h / 2, 'əvvəl sürətli, sonra yavaş', size=12, fill=S, anchor='middle', rotate=-90)
    d.H = y0 + 6 * pitch + h + 12
    return d


reg('pipeline', 'c20s7', 'Mühitlər zənciri', 'CI/CD · mərhələlər və qapılar', pipeline())


if __name__ == '__main__':
    import svgkit
    bad = 0
    for e in ALL:
        dd = e['d']
        dd.svg()
        if dd.errs:
            bad += 1
            print('==', e['slug'])
            for er in dd.errs:
                print('   ', er)
    print('diagrams', len(ALL), 'with issues', bad, 'missing glyphs', sorted(svgkit.MISSING))
