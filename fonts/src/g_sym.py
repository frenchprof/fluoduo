"""Punctuation, currency, math, super/subscripts, fractions, arrows, symbols."""
import math, skia, core, g_ascii
from core import parse, stroke, union, dot, R
from g_latin import src, place, bx, flip_v, rot180, MARK, cx_of

S = lambda d: stroke(parse(d))
G = {}
def sc(ch, s): return core.scale_keep_weight(src(ch)[0], s)

# ---------------------------------------------------------------- punctuation
G['exclamdown']   = (place(flip_v(src('!')[0]), top=500), src('!')[1])
G['questiondown'] = (place(flip_v(src('?')[0]), top=500), src('?')[1])
G['quotesinglbase'] = (place(src(',')[0], top=88), src(',')[1])
_cm = src(',')[0]
G['quotedblbase'] = (union([_cm, core.translate(_cm, 190, 0)]), None)
G['guilsinglleft']  = (S('M170,420 L40,224 L170,28'), None)
G['guilsinglright'] = (S('M40,420 L170,224 L40,28'), None)
G['dagger']    = (union([S('M170,-170 L170,760'), S('M20,565 L320,565')]), None)
G['daggerdbl'] = (union([S('M170,-170 L170,760'), S('M20,600 L320,600'),
                         S('M20,180 L320,180')]), None)
G['bullet']    = (core.clean(dot(120, 300, 120)), None)
G['periodcentered'] = (core.clean(dot(0, 290)), 200)
G['fraction']  = (S('M0,-60 L260,820'), None)
G['prime']       = (S('M70,760 L20,530'), None)
G['doubleprime'] = (union([S('M70,760 L20,530'), S('M250,760 L200,530')]), None)
G['minus']     = (S('M0,288 L380,288'), None)
G['logicalnot'] = (S('M0,450 L360,450 L360,250'), None)
_pct = g_ascii.G['percent'][0]
G['perthousand'] = (union([_pct, stroke(core.circle_skel(
                     bx(_pct)[2] + 152, 155, 100))]), None)
# section: two S's, one rotated 180, overlapping in the middle
G['section'] = (union([
    S('M335,690 C335,740 280,772 208,772 C132,772 68,736 68,672 '
      'C68,600 132,566 212,520 C300,470 352,428 352,348 C352,276 292,232 206,232'),
    S('M65,88 C65,38 120,6 192,6 C268,6 332,42 332,106 '
      'C332,178 268,212 188,258 C100,308 48,350 48,430 C48,502 108,546 194,546')]),
    None)
G['paragraph'] = (union([
    S('M420,760 L200,760 C90,760 20,690 20,570 C20,450 90,380 200,380 L200,-40'),
    S('M340,760 L340,-40')]), None)

# ------------------------------------------------------------- spacing marks
for _n, _b in (('acute',500),('grave',500),('circumflex',496),('caron',496),
               ('tilde',500),('breve',500),('dieresis',568),('dotaccent',580),
               ('ring',500),('hungarumlaut',500),('macron',568)):
    G[_n] = (place(MARK[_n], bot=_b, left=0), None)
G['cedilla'] = (place(MARK['cedilla'], top=14, left=0), None)
G['ogonek']  = (place(MARK['ogonek'],  top=14, left=0), None)

# ----------------------------------------------------------------- currency
G['cent']     = (union([src('c')[0], S('M150,-90 L150,570')]), src('c')[1])
G['sterling'] = (union([S('M495,712 C470,753 425,780 365,780 C250,780 175,700 175,570 L175,0'),
                        S('M30,0 L465,0'), S('M60,330 L345,330')]), None)
G['yen']      = (union([src('Y')[0], S('M25,200 L375,200'), S('M25,350 L375,350')]),
                 src('Y')[1])
G['currency'] = (union([stroke(core.circle_skel(250, 340, 170)),
                        S('M60,530 L145,450'), S('M440,530 L355,450'),
                        S('M60,150 L145,230'), S('M440,150 L355,230')]), None)
G['ruble']    = (union([S('M70,0 L70,760'),
                        S('M70,760 L235,760 C345,760 415,700 415,608 '
                          'C415,516 345,458 235,458 L70,458'),
                        S('M-20,300 L210,300')]), None)
G['rupee']    = (union([S('M40,760 L400,760'), S('M40,555 L400,555'),
                        S('M150,555 L150,350'), S('M150,350 L410,0'),
                        S('M150,350 L275,350 C365,350 415,415 415,490 '
                          'C415,540 395,555 355,555')]), None)
G['won']      = (union([src('W')[0], S('M25,230 L575,230'), S('M25,380 L575,380')]),
                 src('W')[1])
G['lira']     = (union([S('M120,0 C300,0 400,90 425,230'),
                        S('M120,760 L120,120'), S('M20,430 L260,510'),
                        S('M20,280 L260,360')]), None)
G['hryvnia']  = (union([S('M420,640 C420,720 340,770 240,770 C130,770 50,715 50,625 '
                          'C50,520 165,470 275,415 C375,365 435,315 435,220 '
                          'C435,120 350,50 240,50 C145,50 70,95 50,175'),
                        S('M10,330 L450,330'), S('M10,480 L450,480')]), None)
G['bitcoin']  = (union([src('B')[0], S('M110,760 L110,880'), S('M280,760 L280,880'),
                        S('M110,-120 L110,0'), S('M280,-120 L280,0')]), src('B')[1])

# --------------------------------------------------------------------- math
G['multiply']  = (union([S('M0,148 L280,428'), S('M0,428 L280,148')]), None)
G['divide']    = (union([S('M0,288 L300,288'), core.clean(dot(150,110)),
                         core.clean(dot(150,466))]), None)
G['plusminus'] = (union([S('M0,340 L360,340'), S('M180,160 L180,520'),
                         S('M0,20 L360,20')]), None)
G['notequal']  = (union([S('M20,180 L410,180'), S('M20,396 L410,396'),
                         S('M100,60 L330,520')]), None)
G['lessequal']    = (union([S('M340,600 L40,370 L340,140'), S('M40,20 L340,20')]), None)
G['greaterequal'] = (union([S('M40,600 L340,370 L40,140'), S('M40,20 L340,20')]), None)
G['approxequal']  = (union([
    S('M0,170 C50,280 120,285 175,220 C230,155 300,160 350,270'),
    S('M0,390 C50,500 120,505 175,440 C230,375 300,380 350,490')]), None)
G['infinity'] = (union([stroke(core.circle_skel(130,288,120)),
                        stroke(core.circle_skel(370,288,120))]), None)
G['radical']  = (S('M0,300 L100,300 L230,-40 L450,760 L700,760'), None)
G['summation'] = (S('M420,760 L30,760 L250,370 L30,-20 L430,-20'), None)
G['product']  = (union([S('M0,760 L470,760'), S('M85,760 L85,-20'),
                        S('M385,760 L385,-20')]), None)
G['integral'] = (S('M280,800 C280,862 228,882 188,866 C150,851 140,800 140,720 '
                   'L140,-160 C140,-247 105,-292 60,-297 C30,-300 10,-283 0,-262'), None)
G['partialdiff'] = (S('M70,650 C140,730 220,762 300,752 C405,738 445,645 445,515 '
                      'C445,295 385,-20 205,-20 C95,-20 35,60 35,160 '
                      'C35,270 115,330 215,330 C315,330 385,270 405,190'), None)
G['increment'] = (S('M20,0 L240,760 L460,0 Z'), None)
G['emptyset']  = (union([stroke(core.circle_skel(230,340,230)),
                         S('M-20,50 L480,630')]), None)
G['mu']    = (union([src('u')[0], S('M0,-280 L0,0')]), src('u')[1])
G['pi']    = (union([S('M20,460 L400,460'), S('M120,460 L95,0'),
                     S('M300,460 L325,0')]), None)
G['Omega'] = (S('M30,0 L165,0 C165,170 45,245 45,420 C45,610 175,760 330,760 '
                'C485,760 615,610 615,420 C615,245 495,170 495,0 L630,0'), None)

# ------------------------------------------------ super / subscripts, ordinals
SUP, SUB = 0.56, 0.56
for _i, _d in enumerate('0123456789'):
    G['%ssuperior' % ['zero','one','two','three','four',
                      'five','six','seven','eight','nine'][_i]] = (
        place(sc(_d, SUP), top=790, left=0), None)
    G['%sinferior' % ['zero','one','two','three','four',
                      'five','six','seven','eight','nine'][_i]] = (
        place(sc(_d, SUB), bot=-190, left=0), None)
G['ordfeminine']  = (place(sc('a', 0.58), top=790, left=0), None)
G['ordmasculine'] = (place(sc('o', 0.58), top=790, left=0), None)

# ---------------------------------------------------------------- fractions
def _frac(num, den):
    n = place(sc(num, 0.55), top=790, left=0)
    f = place(S('M0,-60 L250,800'), left=bx(n)[2] - 30)
    d = place(sc(den, 0.55), bot=-48, left=bx(f)[2] - 40)
    return union([n, f, d]), None
for _k, _n, _d in (('onequarter','1','4'),('onehalf','1','2'),
                   ('threequarters','3','4'),('onethird','1','3'),
                   ('twothirds','2','3'),('oneeighth','1','8'),
                   ('threeeighths','3','8'),('fiveeighths','5','8'),
                   ('seveneighths','7','8')):
    G[_k] = _frac(_n, _d)

# ------------------------------------------------------------------- symbols
G['copyright'] = (union([stroke(core.circle_skel(398,380,350)),
                         place(core.scale_keep_weight(src('C')[0],0.51),
                               left=398-115, bot=380-170)]), None)
G['registered'] = (union([stroke(core.circle_skel(398,380,350)),
                          place(core.scale_keep_weight(src('R')[0],0.46),
                                left=398-105, bot=380-175)]), None)
_tmT = place(core.scale_keep_weight(src('T')[0], 0.5), top=808, left=0)
G['trademark'] = (union([_tmT, place(core.scale_keep_weight(src('M')[0], 0.5),
                                     top=808, left=bx(_tmT)[2] + 45)]), None)
# dollar: the real S with a bar driven through it
G['dollar'] = (union([src('S')[0], S('M188,-70 L188,790')]), src('S')[1])
G['lozenge'] = (S('M200,0 L380,380 L200,760 L20,380 Z'), None)
def _star(ro, ri, cx, cy):
    pts = []
    for k in range(10):
        a = math.radians(90 + k*36); r = ro if k % 2 == 0 else ri
        pts.append((cx + r*math.cos(a), cy + r*math.sin(a)))
    d = 'M%f,%f ' % pts[0] + ' '.join('L%f,%f' % p for p in pts[1:]) + ' Z'
    return d
G['blackstar'] = (core.clean(union([stroke(parse(_star(380,160,380,380))),
                                    core.clean(parse(_star(380,160,380,380)))])), None)
G['whitestar'] = (S(_star(380,160,380,380)), None)
G['heart'] = (S('M250,55 C110,215 25,315 25,455 C25,572 100,652 196,652 '
                'C242,652 250,600 250,538 C250,600 259,652 305,652 '
                'C401,652 476,572 476,455 C476,315 391,215 250,55 Z'), None)
G['checkmark'] = (S('M0,320 L170,70 L500,690'), None)
G['ballotx']   = (S('M0,60 L440,640') , None)
G['ballotx']   = (union([S('M0,60 L440,640'), S('M0,640 L440,60')]), None)
for _k, _d in (('arrowleft',  'M0,288 L470,288|M180,468 L0,288 L180,108'),
               ('arrowright', 'M0,288 L470,288|M290,468 L470,288 L290,108'),
               ('arrowup',    'M235,0 L235,700|M60,520 L235,700 L410,520'),
               ('arrowdown',  'M235,0 L235,700|M60,180 L235,0 L410,180'),
               ('arrowboth',  'M0,288 L560,288|M180,468 L0,288 L180,108|M380,468 L560,288 L380,108'),
               ('arrowupdn',  'M235,0 L235,760|M60,580 L235,760 L410,580|M60,180 L235,0 L410,180')):
    G[_k] = (union([S(x) for x in _d.split('|')]), None)
