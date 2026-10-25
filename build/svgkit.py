"""Tiny SVG kit for the book diagrams: font-metric text measuring + fit/overlap checks."""
import html
import os
from fontTools.ttLib import TTFont

BASE = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(BASE, '..', 'fonts')

P = 'var(--cds-text-primary)'
S = 'var(--cds-text-secondary)'
AX = 'var(--cds-chart-axis)'
A = 'var(--cds-chart-categorical-1)'
TINT = 'var(--cds-chart-reference-tint)'
GOOD = 'var(--cds-chart-status-good)'
CRIT = 'var(--cds-chart-status-critical)'
WARN = 'var(--cds-chart-status-warning)'

_fcache = {}


def _fonts(mono, weight):
    key = (mono, weight)
    if key in _fcache:
        return _fcache[key]
    if mono:
        d = os.path.join(FD, 'fontsource-ibm-plex-mono-5.3.0', 'package', 'files')
        pre = 'ibm-plex-mono'
        weight = 500 if weight >= 500 else 400
    else:
        d = os.path.join(FD, 'fontsource-ibm-plex-sans-5.3.0', 'package', 'files')
        pre = 'ibm-plex-sans'
    res = []
    for sub in ('latin', 'latin-ext'):
        f = TTFont(os.path.join(d, f'{pre}-{sub}-{weight}-normal.woff2'))
        res.append((f.getBestCmap(), f['hmtx'], f['head'].unitsPerEm))
    _fcache[key] = res
    return res


MISSING = set()


def tw(s, size, weight=400, mono=False):
    fonts = _fonts(mono, weight)
    w = 0.0
    for ch in s:
        cp = ord(ch)
        for cmap, hmtx, upm in fonts:
            g = cmap.get(cp)
            if g:
                w += hmtx[g][0] / upm * size
                break
        else:
            MISSING.add(ch)
            w += 0.62 * size
    return w


def esc(s):
    return html.escape(s, quote=True)


class D:
    def __init__(self, slug, W, H, label):
        self.slug, self.W, self.H, self.label = slug, W, H, label
        self.defs, self.parts, self.boxes, self.errs, self.rects = [], [], [], [], []
        self._markers = {}

    # ---------- primitives ----------
    def arrowhead(self, color=AX):
        if color not in self._markers:
            mid = f'{self.slug}-m{len(self._markers)}'
            self.defs.append(
                f'<marker id="{mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" '
                f'orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{color}"></path></marker>')
            self._markers[color] = mid
        return f'url(#{self._markers[color]})'

    def rect(self, x, y, w, h, fill='none', fo=None, stroke=None, sw=1.25, rx=8, dash=None, so=None):
        a = f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="{rx:g}" fill="{fill}"'
        if fo is not None:
            a += f' fill-opacity="{fo:g}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw:g}"'
            if so is not None:
                a += f' stroke-opacity="{so:g}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        self.parts.append(a + '></rect>')
        self.rects.append((x, y, w, h))
        return (x, y, w, h)

    def line(self, x1, y1, x2, y2, stroke=AX, sw=1.25, dash=None, end=False, start=False, so=None):
        a = f'<line x1="{x1:g}" y1="{y1:g}" x2="{x2:g}" y2="{y2:g}" stroke="{stroke}" stroke-width="{sw:g}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        if so is not None:
            a += f' stroke-opacity="{so:g}"'
        if end:
            a += f' marker-end="{self.arrowhead(stroke)}"'
        if start:
            a += f' marker-start="{self.arrowhead(stroke)}"'
        self.parts.append(a + '></line>')

    def path(self, d, stroke=AX, sw=1.25, fill='none', dash=None, end=False, start=False, fo=None):
        a = f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw:g}" stroke-linejoin="round"'
        if fo is not None:
            a += f' fill-opacity="{fo:g}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        if end:
            a += f' marker-end="{self.arrowhead(stroke)}"'
        if start:
            a += f' marker-start="{self.arrowhead(stroke)}"'
        self.parts.append(a + '></path>')

    def poly(self, pts, fill='none', fo=None, stroke=None, sw=1.25):
        p = ' '.join(f'{x:g},{y:g}' for x, y in pts)
        a = f'<polygon points="{p}" fill="{fill}"'
        if fo is not None:
            a += f' fill-opacity="{fo:g}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw:g}"'
        self.parts.append(a + '></polygon>')

    def circle(self, cx, cy, r, fill='none', stroke=None, sw=1.25, fo=None):
        a = f'<circle cx="{cx:g}" cy="{cy:g}" r="{r:g}" fill="{fill}"'
        if fo is not None:
            a += f' fill-opacity="{fo:g}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw:g}"'
        self.parts.append(a + '></circle>')

    # ---------- text ----------
    def _bbox(self, x, y, width, size, anchor):
        x0 = x if anchor == 'start' else (x - width / 2 if anchor == 'middle' else x - width)
        return (x0, y - 0.76 * size, x0 + width, y + 0.24 * size)

    def text(self, x, y, s, size=13, w=400, fill=P, anchor='start', mono=False, inside=None, ls=None,
             rotate=None, check=True, halo=False):
        if mono:
            s = s.replace('  ', '\u00a0\u00a0')
            if s.startswith(' '):
                s = '\u00a0' + s[1:]
        width = tw(s, size, w, mono) + (len(s) * ls if ls else 0)
        attrs = f'x="{x:g}" y="{y:g}" font-size="{size:g}"'
        if w != 400:
            attrs += f' font-weight="{w}"'
        if anchor != 'start':
            attrs += f' text-anchor="{anchor}"'
        if mono:
            attrs += ' class="mono"'
        if ls:
            attrs += f' letter-spacing="{ls:g}"'
        if rotate is not None:
            attrs += f' transform="rotate({rotate:g} {x:g} {y:g})"'
        if halo:
            attrs += ' stroke="var(--surface)" stroke-width="4" stroke-linejoin="round" paint-order="stroke"'
        self.parts.append(f'<text {attrs} fill="{fill}">{esc(s)}</text>')
        if rotate is None and check:
            bb = self._bbox(x, y, width, size, anchor)
            self.boxes.append((bb, s))
            if bb[0] < 1 or bb[2] > self.W - 1:
                self.errs.append(f'text out of view: "{s}" {bb[0]:.1f}..{bb[2]:.1f}')
            if inside:
                bx, by, bw, bh = inside
                if bb[0] < bx + 3 or bb[2] > bx + bw - 3 or bb[1] < by + 1 or bb[3] > by + bh - 1:
                    self.errs.append(f'text not inside box: "{s}" bb={tuple(round(v, 1) for v in bb)} box={inside}')
        return width

    def rich(self, x, y, segs, size=12, mono=True, anchor='start', inside=None):
        """segs: list of (text, fill, weight)"""
        width = sum(tw(t, size, wt, mono) for t, _, wt in segs)
        attrs = f'x="{x:g}" y="{y:g}" font-size="{size:g}"'
        if anchor != 'start':
            attrs += f' text-anchor="{anchor}"'
        if mono:
            attrs += ' class="mono"'
        inner = ''.join(
            f'<tspan fill="{f}"' + (f' font-weight="{wt}"' if wt != 400 else '') + f'>{esc(t)}</tspan>'
            for t, f, wt in segs)
        self.parts.append(f'<text {attrs} xml:space="preserve">{inner}</text>')
        bb = self._bbox(x, y, width, size, anchor)
        self.boxes.append((bb, ''.join(t for t, _, _ in segs)))
        if bb[0] < 1 or bb[2] > self.W - 1:
            self.errs.append(f'rich out of view: {bb}')
        if inside:
            bx, by, bw, bh = inside
            if bb[0] < bx + 3 or bb[2] > bx + bw - 3:
                self.errs.append(f'rich not inside box: {"".join(t for t, _, _ in segs)} {bb} {inside}')
        return width

    def wrap(self, s, size, w, maxw, mono=False):
        words, lines, cur = s.split(' '), [], ''
        for word in words:
            t = (cur + ' ' + word).strip()
            if tw(t, size, w, mono) <= maxw or not cur:
                cur = t
            else:
                lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
        return lines

    def title(self, s, y=22, size=14.5, lh=19):
        lines = self.wrap(s, size, 600, self.W - 20)
        for i, ln in enumerate(lines):
            self.text(10, y + i * lh, ln, size=size, w=600)
        return y + (len(lines) - 1) * lh

    # ---------- composite ----------
    def labelbox(self, x, y, w, h, title, sub=None, fill=A, fo=0.1, stroke=A, tsize=13, ssize=12, anchor='start',
                 mono_sub=False, sub_fill=S, rx=8, dash=None):
        self.rect(x, y, w, h, fill=fill, fo=fo, stroke=stroke, rx=rx, dash=dash)
        tx = x + 12 if anchor == 'start' else x + w / 2
        if sub:
            gap = 17
            ty = y + h / 2 - gap / 2 + tsize * 0.36
            self.text(tx, ty, title, size=tsize, w=600, anchor=anchor, inside=(x, y, w, h))
            self.text(tx, ty + gap, sub, size=ssize, fill=sub_fill, anchor=anchor, mono=mono_sub,
                      inside=(x, y, w, h))
        else:
            self.text(tx, y + h / 2 + tsize * 0.36, title, size=tsize, w=600, anchor=anchor,
                      inside=(x, y, w, h))

    def check_overlaps(self, allow=()):
        bs = self.boxes
        for i in range(len(bs)):
            for j in range(i + 1, len(bs)):
                a, sa = bs[i]
                b, sb = bs[j]
                if a[0] < b[2] - 0.5 and b[0] < a[2] - 0.5 and a[1] < b[3] - 0.5 and b[1] < a[3] - 0.5:
                    if (sa, sb) in allow or (sb, sa) in allow:
                        continue
                    self.errs.append(f'overlap: "{sa}" × "{sb}"')

    def svg(self):
        self.check_overlaps()
        for (x, y, w, h) in self.rects:
            if x < -0.5 or y < -0.5 or x + w > self.W + 0.5 or y + h > self.H + 0.5:
                self.errs.append(f'rect out of view {x},{y},{w},{h} (H={self.H})')
        for bb, s in self.boxes:
            if bb[1] < 0 or bb[3] > self.H:
                self.errs.append(f'text out of view vertically: "{s}" {bb[1]:.1f}..{bb[3]:.1f} (H={self.H})')
        defs = f'<defs>{"".join(self.defs)}</defs>' if self.defs else ''
        return (f'<svg viewBox="0 0 {self.W:g} {self.H:g}" role="img" aria-label="{esc(self.label)}" '
                f'font-size="13">{defs}{"".join(self.parts)}</svg>')
