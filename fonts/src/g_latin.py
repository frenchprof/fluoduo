"""Latin-1 + Latin Extended-A extension, built from the source font's own parts."""
import skia, core
from core import parse, stroke, union, dot, R
from fontTools.ttLib import TTFont

_f = TTFont("FluOlinGoHandRegular.otf")
_gs = _f.getGlyphSet(); _hm = _f['hmtx']; _cmap = _f.getBestCmap()
S = lambda d: stroke(parse(d))

def src(ch):
    """Outline + advance of an existing glyph, by character."""
    n = _cmap[ord(ch)]
    return core.glyph_path(_gs, n), _hm[n][0]

def bx(p):        return core.bounds(p)
def cx_of(p):     b = bx(p); return (b[0] + b[2]) / 2.0
def flip_v(p):    return core.transform(p, 1, -1)
def rot180(p):    return core.transform(p, -1, -1)

def place(p, cx=None, top=None, bot=None, left=None):
    b = bx(p); dx = dy = 0.0
    if cx   is not None: dx = cx - (b[0]+b[2])/2.0
    if left is not None: dx = left - b[0]
    if top  is not None: dy = top - b[3]
    if bot  is not None: dy = bot - b[1]
    return core.translate(p, dx, dy)

# ------------------------------------------------------------------- marks
def _diff_contours(acc, base):
    ca = core.contours_of(core.glyph_path(_gs, _cmap[ord(acc)]))
    kb = set()
    for c in core.contours_of(core.glyph_path(_gs, _cmap[ord(base)])):
        kb.add(tuple(round(v,1) for s in core.to_segments(c)[0]['segs'] for pt in s[1] for v in pt))
    out = []
    for c in ca:
        k = tuple(round(v,1) for s in core.to_segments(c)[0]['segs'] for pt in s[1] for v in pt)
        if k not in kb: out.append(c)
    return union(out)

MARK = {}
MARK['acute']      = _diff_contours('é','e')
MARK['grave']      = _diff_contours('è','e')
MARK['circumflex'] = _diff_contours('ê','e')
MARK['dieresis']   = _diff_contours('ë','e')
MARK['caron']      = flip_v(MARK['circumflex'])
MARK['ring']       = core.glyph_path(_gs, _cmap[0xB0])            # reuse degree
MARK['dotaccent']  = core.clean(dot(0, 0))
MARK['macron']     = core.clean(S('M0,0 L300,0'))
MARK['breve']      = core.clean(S('M0,150 C0,45 75,0 150,0 C225,0 300,45 300,150'))
MARK['tilde']      = core.clean(S('M0,60 C40,175 105,180 155,120 C205,60 270,65 310,180'))
MARK['hungarumlaut'] = core.clean(union([
    place(MARK['acute'], cx=0,   bot=0), place(MARK['acute'], cx=185, bot=0)]))
MARK['cedilla']    = core.clean(S('M0,20 C0,-40 40,-62 40,-105 C40,-148 -5,-172 -60,-160'))
MARK['ogonek']     = core.clean(S('M0,20 C0,-40 55,-62 55,-108 C55,-150 10,-175 -45,-163'))
MARK['commabelow'] = core.glyph_path(_gs, _cmap[0x2C])            # reuse comma
MARK['commaabove'] = rot180(MARK['commabelow'])

ABOVE  = {'acute','grave','circumflex','caron','tilde','breve','macron',
          'dieresis','dotaccent','ring','hungarumlaut','commaabove'}
# outer BOTTOM of the mark, lowercase / uppercase.  Seating marks by their
# bottom (as the source font does) keeps tall marks clear of the letter.
BOT_LC = {'dieresis':568, 'dotaccent':580, 'macron':568, 'commaabove':560}
BOT_UC = {'dieresis':832, 'dotaccent':832, 'macron':832}
DEF_LC, DEF_UC = 500, 760

def _mark_x(base, mark):
    b = bx(base)
    if mark == 'ogonek':            # ogonek hangs off the right of the letter
        return b[0] + 0.68 * (b[2] - b[0])
    return (b[0] + b[2]) / 2.0

def anchor_for(mark, up):
    """Regular-weight seating value for a mark, plus whether it sits above."""
    if mark in ABOVE:
        return (BOT_UC if up else BOT_LC).get(mark, DEF_UC if up else DEF_LC), True
    return 14, False

# Accented glyphs that shipped with the source font.  Their outlines are kept
# verbatim for Regular, but heavier weights must re-seat the mark rather than
# dilate a flattened letter+mark into a blob.
ORIG_ACC = [
 (0xC0,'A','grave'),(0xC2,'A','circumflex'),(0xC8,'E','grave'),(0xC9,'E','acute'),
 (0xCA,'E','circumflex'),(0xCB,'E','dieresis'),(0xCE,'I','circumflex'),
 (0xCF,'I','dieresis'),(0xD4,'O','circumflex'),(0xD9,'U','grave'),
 (0xDB,'U','circumflex'),(0xDC,'U','dieresis'),(0xE0,'a','grave'),
 (0xE2,'a','circumflex'),(0xE8,'e','grave'),(0xE9,'e','acute'),
 (0xEA,'e','circumflex'),(0xEB,'e','dieresis'),(0xEE,'i','circumflex'),
 (0xEF,'i','dieresis'),(0xF4,'o','circumflex'),(0xF9,'u','grave'),
 (0xFB,'u','circumflex'),(0xFC,'u','dieresis'),(0xFF,'y','dieresis'),
 (0x178,'Y','dieresis')]

# cp -> (base outline, base advance, mark name, regular anchor, sits_above, is_upper).
# Kept so each weight can re-seat its marks instead of inheriting Regular's.
RECIPES = {}

def compose(ch, mark):
    base, adv = src(ch)
    m = MARK[mark]
    up = ch.isupper()
    if mark in ABOVE:
        bot = (BOT_UC if up else BOT_LC).get(mark, DEF_UC if up else DEF_LC)
        m = place(m, cx=_mark_x(base, mark), bot=bot)
    else:
        m = place(m, cx=_mark_x(base, mark), top=14)
    return union([base, m]), adv

# ------------------------------------------------- hand-drawn extra letters
X = {}
def _o(ch): return src(ch)[0]

X['germandbls'] = (S('M40,0 L40,630 C40,715 105,770 195,770 C275,770 330,725 330,660 '
                     'C330,590 275,555 215,520 C305,512 370,455 370,370 '
                     'C370,285 300,235 210,235 C165,235 130,250 105,275'), None)
X['thorn']  = (union([_o('b'), S('M0,-280 L0,0')]), src('b')[1])
X['Thorn']  = (union([S('M0,0 L0,760'),
                      S('M0,620 L190,620 C300,620 370,555 370,455 '
                        'C370,355 300,290 190,290 L0,290')]), None)
X['Eth']    = (union([_o('Ð' if 0xD0 in _cmap else 'D'), S('M-80,380 L150,380')]),
               src('D')[1]) if False else (union([_o('D'), S('M-80,380 L150,380')]), src('D')[1])
# steep ascender off the bowl, crossed by a near-horizontal bar (~65 deg apart)
X['eth']    = (union([_o('o'), S('M120,440 C150,620 190,730 300,800'),
                      S('M60,632 L300,690')]), src('o')[1])
X['Oslash'] = (union([_o('O'), S('M-30,-60 L470,820')]), src('O')[1])
X['oslash'] = (union([_o('o'), S('M-30,-70 L350,530')]), src('o')[1])
X['Lslash'] = (union([_o('L'), S('M-90,285 L150,450')]), src('L')[1])
X['lslash'] = (union([_o('l'), S('M-70,350 L170,510')]), src('l')[1])
X['Dcroat'] = (union([_o('D'), S('M-80,380 L150,380')]), src('D')[1])
X['dcroat'] = (union([_o('d'), S('M250,645 L440,645')]), src('d')[1])
X['Hbar']   = (union([_o('H'), S('M-60,600 L460,600')]), src('H')[1])
X['hbar']   = (union([_o('h'), S('M-80,640 L140,640')]), src('h')[1])
X['Tbar']   = (union([_o('T'), S('M50,330 L350,330')]), src('T')[1])
X['tbar']   = (union([_o('t'), S('M20,150 L250,150')]), src('t')[1])
X['Eng']    = (union([_o('N'), S('M400,0 L400,-150 C400,-235 340,-280 255,-278')]), src('N')[1])
X['eng']    = (union([_o('n'), S('M320,0 L320,-150 C320,-235 260,-280 175,-278')]), src('n')[1])
X['kra']    = (union([S('M20,0 L20,460'), S('M290,460 L60,235'), S('M140,300 L300,0')]), None)
X['longs']  = (S('M120,0 L120,655 C120,725 165,770 230,770 C272,770 302,754 322,733'), None)
X['florin'] = (union([S('M35,-280 C120,-205 150,-105 150,15 L150,650 '
                        'C150,720 195,770 258,770 C298,770 330,752 350,730'),
                      S('M35,430 L300,430')]), None)
X['dotlessi'] = (core.contours_of(_o('i'))[1] if bx(core.contours_of(_o('i'))[0])[1] > 300
                 else core.contours_of(_o('i'))[0], src('i')[1])
X['dotlessj'] = (core.contours_of(_o('j'))[1] if bx(core.contours_of(_o('j'))[0])[1] > 300
                 else core.contours_of(_o('j'))[0], src('j')[1])


# ------------------------------------------------------------- composites
ACC = [
 (0xC1,'A','acute'),(0xC3,'A','tilde'),(0xC4,'A','dieresis'),(0xC5,'A','ring'),
 (0xCC,'I','grave'),(0xCD,'I','acute'),(0xD1,'N','tilde'),(0xD2,'O','grave'),
 (0xD3,'O','acute'),(0xD5,'O','tilde'),(0xD6,'O','dieresis'),(0xDA,'U','acute'),
 (0xDD,'Y','acute'),(0xE1,'a','acute'),(0xE3,'a','tilde'),(0xE4,'a','dieresis'),
 (0xE5,'a','ring'),(0xF1,'n','tilde'),(0xF2,'o','grave'),(0xF3,'o','acute'),
 (0xF5,'o','tilde'),(0xF6,'o','dieresis'),(0xFA,'u','acute'),(0xFD,'y','acute'),
 (0x100,'A','macron'),(0x102,'A','breve'),(0x104,'A','ogonek'),
 (0x106,'C','acute'),(0x108,'C','circumflex'),(0x10A,'C','dotaccent'),(0x10C,'C','caron'),
 (0x10E,'D','caron'),(0x112,'E','macron'),(0x114,'E','breve'),(0x116,'E','dotaccent'),
 (0x118,'E','ogonek'),(0x11A,'E','caron'),(0x11C,'G','circumflex'),(0x11E,'G','breve'),
 (0x120,'G','dotaccent'),(0x122,'G','commabelow'),(0x124,'H','circumflex'),
 (0x128,'I','tilde'),(0x12A,'I','macron'),(0x12C,'I','breve'),(0x12E,'I','ogonek'),
 (0x130,'I','dotaccent'),(0x134,'J','circumflex'),(0x136,'K','commabelow'),
 (0x139,'L','acute'),(0x13B,'L','commabelow'),(0x13D,'L','caron'),
 (0x143,'N','acute'),(0x145,'N','commabelow'),(0x147,'N','caron'),
 (0x14C,'O','macron'),(0x14E,'O','breve'),(0x150,'O','hungarumlaut'),
 (0x154,'R','acute'),(0x156,'R','commabelow'),(0x158,'R','caron'),
 (0x15A,'S','acute'),(0x15C,'S','circumflex'),(0x15E,'S','cedilla'),(0x160,'S','caron'),
 (0x162,'T','cedilla'),(0x164,'T','caron'),(0x168,'U','tilde'),(0x16A,'U','macron'),
 (0x16C,'U','breve'),(0x16E,'U','ring'),(0x170,'U','hungarumlaut'),(0x172,'U','ogonek'),
 (0x174,'W','circumflex'),(0x176,'Y','circumflex'),
 (0x179,'Z','acute'),(0x17B,'Z','dotaccent'),(0x17D,'Z','caron'),
 (0x218,'S','commabelow'),(0x21A,'T','commabelow'),
 (0x101,'a','macron'),(0x103,'a','breve'),(0x105,'a','ogonek'),
 (0x107,'c','acute'),(0x109,'c','circumflex'),(0x10B,'c','dotaccent'),(0x10D,'c','caron'),
 (0x113,'e','macron'),(0x115,'e','breve'),(0x117,'e','dotaccent'),
 (0x119,'e','ogonek'),(0x11B,'e','caron'),(0x11D,'g','circumflex'),(0x11F,'g','breve'),
 (0x121,'g','dotaccent'),(0x123,'g','commaabove'),(0x125,'h','circumflex'),
 (0x137,'k','commabelow'),(0x13C,'l','commabelow'),
 (0x144,'n','acute'),(0x146,'n','commabelow'),(0x148,'n','caron'),
 (0x14D,'o','macron'),(0x14F,'o','breve'),(0x151,'o','hungarumlaut'),
 (0x155,'r','acute'),(0x157,'r','commabelow'),(0x159,'r','caron'),
 (0x15B,'s','acute'),(0x15D,'s','circumflex'),(0x15F,'s','cedilla'),(0x161,'s','caron'),
 (0x163,'t','cedilla'),(0x169,'u','tilde'),(0x16B,'u','macron'),(0x16D,'u','breve'),
 (0x16F,'u','ring'),(0x171,'u','hungarumlaut'),(0x173,'u','ogonek'),
 (0x175,'w','circumflex'),(0x177,'y','circumflex'),
 (0x17A,'z','acute'),(0x17C,'z','dotaccent'),(0x17E,'z','caron'),
 (0x219,'s','commabelow'),(0x21B,'t','commabelow'),
 (0xEC,'i','grave'),(0xED,'i','acute'),(0x129,'i','tilde'),(0x12B,'i','macron'),
 (0x12D,'i','breve'),(0x12F,'i','ogonek'),(0x135,'j','circumflex'),
]
# dotless bases for i / j
DOTLESS = {'i':'dotlessi','j':'dotlessj'}

def _append_right(base, adv, extra, gap=60):
    e = place(extra, left=adv + gap)
    return union([base, e]), round(bx(e)[2] - 48 + 180)

def build():
    out = {}
    for cp, ch, mk in ACC:
        up = ch.isupper()
        if ch in DOTLESS and mk in ABOVE and mk != 'dotaccent':
            bp, ba = X[DOTLESS[ch]]
            anc, above = anchor_for(mk, up)
            m = place(MARK[mk], cx=cx_of(bp), bot=anc)
            out['uni%04X' % cp] = (union([bp, m]), ba)
            RECIPES[cp] = (bp, ba, mk, anc, above, up)
        else:
            out['uni%04X' % cp] = compose(ch, mk)
            bp, ba = src(ch)
            anc, above = anchor_for(mk, up)
            RECIPES[cp] = (bp, ba, mk, anc, above, up)
    # -- Czech/Slovak apostrophe caron, L-middot, ligatures, specials
    apo = core.scale_keep_weight(src("\u2019")[0], 0.82)
    apo = place(apo, top=808)
    for cp, ch in ((0x10F,'d'), (0x13E,'l'), (0x165,'t')):
        b, a = src(ch); out['uni%04X' % cp] = _append_right(b, a, apo, 20)
    mid = place(core.clean(dot(0, 290)), left=0)
    for cp, ch in ((0x13F,'L'), (0x140,'l')):
        b, a = src(ch); out['uni%04X' % cp] = _append_right(b, a, mid, 90)
    b, a = src('n'); out['uni0149'] = (union([core.translate(b, 250, 0),
                                              place(apo, left=0)]), a + 250)
    for cp, hi, lo in ((0x132,'I','J'), (0x133,'i','j')):
        p1, a1 = src(hi); p2, a2 = src(lo)
        out['uni%04X' % cp] = (union([p1, core.translate(p2, a1, 0)]), a1 + a2)
    out['uni013A'] = (union([src('l')[0],
                     place(MARK['acute'], cx=cx_of(src('l')[0]), bot=DEF_UC)]), src('l')[1])
    RECIPES[0x13A] = (src('l')[0], src('l')[1], 'acute', DEF_UC, True, True)
    for cp, ch, mk in ORIG_ACC:          # recipes only - Regular keeps the originals
        up = ch.isupper()
        anc, above = anchor_for(mk, up)
        if ch.lower() in DOTLESS and mk in ABOVE:
            bp, ba = X[DOTLESS[ch.lower()]]
            if up: bp, ba = src('I')[0], src('I')[1]
        else:
            bp, ba = src(ch)
        RECIPES[cp] = (bp, ba, mk, anc, above, up)
    for cp, key in ((0xDF,'germandbls'),(0xDE,'Thorn'),(0xFE,'thorn'),(0xD0,'Eth'),
                    (0xF0,'eth'),(0xD8,'Oslash'),(0xF8,'oslash'),(0x141,'Lslash'),
                    (0x142,'lslash'),(0x110,'Dcroat'),(0x111,'dcroat'),(0x126,'Hbar'),
                    (0x127,'hbar'),(0x166,'Tbar'),(0x167,'tbar'),(0x14A,'Eng'),
                    (0x14B,'eng'),(0x138,'kra'),(0x17F,'longs'),(0x192,'florin'),
                    (0x131,'dotlessi')):
        p, a = X[key]
        out['uni%04X' % cp] = (p, a or round(bx(core.clean(p))[2] - 48 + 180))
    return out
