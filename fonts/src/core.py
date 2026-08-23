"""Core geometry helpers for extending FluOlinGoHand.

The source font is monolinear: every glyph is a skeleton path expanded with a
round pen of radius R=48 (96 units wide) at UPM 1512.  Everything here works in
that same system so new glyphs are indistinguishable from the originals.
"""
import skia, pathops
from fontTools.pens.recordingPen import RecordingPen

R = 48                 # pen radius
W = 2 * R              # stroke width
UPM = 1512
BASE, XH, CAP, ASC, DESC = 0, 460, 760, 760, -280   # skeleton (centreline) metrics
RSB = 180              # constant right sidebearing, skeleton-relative

# ---------------------------------------------------------------- path input
def parse(d):
    """Tiny SVG-ish path parser -> skia.Path.  Supports M L C Q Z (absolute)."""
    import re
    p = skia.Path()
    toks = re.findall(r'[MLCQZmlcqz]|-?[0-9.]+', d)
    i = 0; cur = None; start = None
    while i < len(toks):
        c = toks[i]; i += 1
        if c in 'Zz':
            p.close(); cur = start; continue
        n = {'M':2,'L':2,'C':6,'Q':4}[c.upper()]
        v = [float(toks[i+k]) for k in range(n)]; i += n
        if c == 'M': p.moveTo(v[0],v[1]); cur=(v[0],v[1]); start=cur
        elif c == 'L': p.lineTo(v[0],v[1]); cur=(v[0],v[1])
        elif c == 'C': p.cubicTo(*v); cur=(v[4],v[5])
        elif c == 'Q': p.quadTo(*v); cur=(v[2],v[3])
    return p

def dot(x, y, r=R):
    """A round dot of radius r centred at (x,y) -- already an outline."""
    p = skia.Path(); p.addCircle(x, y, r); return p

def circle_skel(cx, cy, r):
    p = skia.Path(); p.addCircle(cx, cy, r); return p

# ------------------------------------------------------------------ stroking
def _paint(w, cap=skia.Paint.kRound_Cap):
    return skia.Paint(Style=skia.Paint.kStroke_Style, StrokeWidth=w,
                      StrokeCap=cap, StrokeJoin=skia.Paint.kRound_Join,
                      StrokeMiter=4)

def stroke(skel, w=W):
    """Expand a skeleton path with a round pen -> filled outline path."""
    out = skia.Path()
    _paint(w).getFillPath(skel, out)
    return out

def dilate(region, r):
    """Minkowski sum of a filled region with a disk of radius r."""
    if r <= 0: return region
    grown = skia.Path()
    _paint(2 * r).getFillPath(region, grown)
    return union([region, grown])

def scale_keep_weight(region, s, dx=0.0, dy=0.0):
    """Scale an already-stroked glyph outline but restore the 96-unit weight.

    outline = skeleton (+) disk(R).  Scaling gives skeleton*s (+) disk(R*s);
    dilating by R*(1-s) restores skeleton*s (+) disk(R) -- correct monolinear
    weight at the smaller size.
    """
    m = skia.Matrix()
    m.setScaleTranslate(s, s, dx, dy)
    small = skia.Path(); region.transform(m, small)
    return dilate(small, R * (1.0 - s))

def translate(p, dx, dy):
    m = skia.Matrix(); m.setTranslate(dx, dy)
    out = skia.Path(); p.transform(m, out); return out

def transform(p, sx, sy, dx=0.0, dy=0.0):
    m = skia.Matrix(); m.setScaleTranslate(sx, sy, dx, dy)
    out = skia.Path(); p.transform(m, out); return out

# ------------------------------------------------------- skia <-> fontTools
def _conic_to_quads(p0, p1, p2, w, pow2=2):
    return skia.Path.ConvertConicToQuads(p0, p1, p2, w, pow2)

def to_segments(path):
    """skia.Path -> list of contours, each a list of ('line'|'curve', pts)."""
    contours = []; cur = None; pen_at = None
    it = skia.Path.Iter(path, False)
    while True:
        verb, pts = it.next()
        if verb == skia.Path.kDone_Verb: break
        if verb == skia.Path.kMove_Verb:
            if cur: contours.append(cur)
            cur = {'start': (pts[0].x(), pts[0].y()), 'segs': []}
            pen_at = (pts[0].x(), pts[0].y())
        elif verb == skia.Path.kLine_Verb:
            cur['segs'].append(('line', [(pts[1].x(), pts[1].y())]))
            pen_at = (pts[1].x(), pts[1].y())
        elif verb == skia.Path.kQuad_Verb:
            p0 = pen_at; q = (pts[1].x(), pts[1].y()); p2 = (pts[2].x(), pts[2].y())
            c1 = (p0[0] + 2/3*(q[0]-p0[0]), p0[1] + 2/3*(q[1]-p0[1]))
            c2 = (p2[0] + 2/3*(q[0]-p2[0]), p2[1] + 2/3*(q[1]-p2[1]))
            cur['segs'].append(('curve', [c1, c2, p2])); pen_at = p2
        elif verb == skia.Path.kConic_Verb:
            w = it.conicWeight()
            qp = _conic_to_quads(pts[0], pts[1], pts[2], w)
            p0 = pen_at
            for k in range(0, len(qp)-1, 2):
                q = (qp[k+1].x(), qp[k+1].y()); p2 = (qp[k+2].x(), qp[k+2].y())
                c1 = (p0[0] + 2/3*(q[0]-p0[0]), p0[1] + 2/3*(q[1]-p0[1]))
                c2 = (p2[0] + 2/3*(q[0]-p2[0]), p2[1] + 2/3*(q[1]-p2[1]))
                cur['segs'].append(('curve', [c1, c2, p2])); p0 = p2
            pen_at = p0
        elif verb == skia.Path.kCubic_Verb:
            p3 = (pts[3].x(), pts[3].y())
            cur['segs'].append(('curve', [(pts[1].x(),pts[1].y()), (pts[2].x(),pts[2].y()), p3]))
            pen_at = p3
        elif verb == skia.Path.kClose_Verb:
            pass
    if cur: contours.append(cur)
    return contours

def draw_to(path, pen):
    for c in to_segments(path):
        if not c['segs']: continue
        pen.moveTo(c['start'])
        for kind, pts in c['segs']:
            if kind == 'line': pen.lineTo(pts[0])
            else: pen.curveTo(*pts)
        pen.closePath()

# ------------------------------------------------------------ boolean/clean
def _to_pathops(path):
    p = pathops.Path()
    pen = p.getPen()
    draw_to(path, pen)
    return p

def _from_pathops(p):
    out = skia.Path()
    for verb, pts in p.segments:
        if verb == 'moveTo': out.moveTo(*pts[0])
        elif verb == 'lineTo': out.lineTo(*pts[0])
        elif verb == 'curveTo': out.cubicTo(*pts[0], *pts[1], *pts[2])
        elif verb == 'qCurveTo':
            pts = list(pts)
            if pts and pts[-1] is None:
                # closed contour with no on-curve points: on-curves are the
                # midpoints between consecutive off-curve control points
                off = pts[:-1]
                if not off: continue
                mid = lambda a, b: ((a[0]+b[0])/2.0, (a[1]+b[1])/2.0)
                out.moveTo(*mid(off[-1], off[0]))
                for k, cpt in enumerate(off):
                    out.quadTo(*cpt, *mid(cpt, off[(k+1) % len(off)]))
                out.close()
            else:
                for k in range(len(pts)-1):
                    out.quadTo(*pts[k], *pts[k+1])
        elif verb == 'closePath': out.close()
    return out

def union(paths):
    """Union a list of skia paths, returning a clean non-overlapping path."""
    acc = pathops.Path()
    for p in paths:
        if p is None: continue
        pen = acc.getPen(); draw_to(p, pen)
    acc.simplify(fix_winding=True, keep_starting_points=False)
    return _from_pathops(acc)

def difference(a, b):
    out = pathops.Path()
    pathops.difference([_to_pathops(a)], [_to_pathops(b)], out.getPen())
    return _from_pathops(out)

def erode(region, r):
    """Minkowski erosion by a disk of radius r (inverse of dilate)."""
    if r <= 0: return region
    x0, y0, x1, y1 = bounds(region)
    m = r + 60
    box = skia.Path(); box.addRect(skia.Rect(x0-m, y0-m, x1+m, y1+m))
    return difference(box, dilate(difference(box, region), r))

def reweight(region, r_new, r_old=R):
    """Re-stroke a monolinear outline at a different pen radius."""
    if r_new > r_old: return dilate(region, r_new - r_old)
    if r_new < r_old: return erode(region, r_old - r_new)
    return region

def clean(path):
    return union([path])

def bounds(path):
    r = path.getBounds()
    return (r.left(), r.top(), r.right(), r.bottom())

# ------------------------------------------------------------ source access
class SkiaPen:
    def __init__(self): self.path = skia.Path()
    def moveTo(self, p): self.path.moveTo(*p)
    def lineTo(self, p): self.path.lineTo(*p)
    def curveTo(self, *pts): self.path.cubicTo(*pts[0], *pts[1], *pts[2])
    def qCurveTo(self, *pts):
        for k in range(len(pts)-1): self.path.quadTo(*pts[k], *pts[k+1])
    def closePath(self): self.path.close()
    def endPath(self): pass
    def addComponent(self, *a, **k): pass

def glyph_path(glyphset, name):
    pen = SkiaPen(); glyphset[name].draw(pen); return pen.path

def contours_of(path):
    """Split a skia path into one skia.Path per contour."""
    out = []
    for c in to_segments(path):
        p = skia.Path(); p.moveTo(*c['start'])
        for kind, pts in c['segs']:
            if kind == 'line': p.lineTo(*pts[0])
            else: p.cubicTo(*pts[0], *pts[1], *pts[2])
        p.close(); out.append(p)
    return out
