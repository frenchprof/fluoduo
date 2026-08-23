"""Missing ASCII symbols, drawn as skeletons in the source font's own system."""
import math, skia, core
from core import parse, stroke, union, dot, R, XH, CAP, DESC

S = lambda d: stroke(parse(d))
G = {}   # name -> (outline, advance or None for auto)

# ---- # $ % & * + / < = > @ [ \ ] ^ _ ` { | } ~
G['numbersign'] = (union([
    S('M170,0 L120,620'), S('M370,0 L320,620'),
    S('M0,190 L450,190'), S('M20,430 L470,430')]), None)

G['percent'] = (union([
    S('M55,0 L445,760'),
    stroke(core.circle_skel(150, 605, 100)),
    stroke(core.circle_skel(350, 155, 100))]), None)

G['asterisk'] = (union([
    S(f'M190,585 L{190+185*math.cos(math.radians(a))},{585+185*math.sin(math.radians(a))}')
    for a in (90, 162, 234, 306, 18)]), None)

G['plus']  = (union([S('M0,288 L380,288'), S('M190,98 L190,478')]), None)
G['equal'] = (union([S('M0,180 L390,180'), S('M0,396 L390,396')]), None)
G['slash']     = (S('M0,-96 L330,816'), None)
G['backslash'] = (S('M0,816 L330,-96'), None)
G['bar']       = (S('M20,-140 L20,860'), 220)
G['brokenbar'] = (union([S('M20,-140 L20,290'), S('M20,430 L20,860')]), 220)
G['less']    = (S('M330,540 L40,288 L330,36'), None)
G['greater'] = (S('M40,540 L330,288 L40,36'), None)
G['bracketleft']  = (S('M190,-96 L40,-96 L40,816 L190,816'), None)
G['bracketright'] = (S('M0,-96 L150,-96 L150,816 L0,816'), None)
G['braceleft'] = (S('M250,-96 C170,-96 150,-40 150,40 L150,268 '
                    'C150,328 110,360 40,360 C110,360 150,392 150,452 '
                    'L150,680 C150,760 170,816 250,816'), None)
G['braceright'] = (S('M0,-96 C80,-96 100,-40 100,40 L100,268 '
                     'C100,328 140,360 210,360 C140,360 100,392 100,452 '
                     'L100,680 C100,760 80,816 0,816'), None)
G['asciicircum'] = (S('M0,560 L190,790 L380,560'), None)
G['underscore']  = (S('M0,-190 L460,-190'), None)
G['asciitilde']  = (S('M0,270 C55,370 135,375 195,305 '
                      'C255,235 335,240 390,340'), None)
def _at():
    import skia
    ring = skia.Path()
    ring.arcTo(skia.Rect(50, -20, 750, 680), -42, 318, True)   # open at lower right
    return union([stroke(ring),
                  stroke(core.circle_skel(365, 320, 100)),
                  S('M465,420 L465,240 C465,200 495,180 540,190')])
G['at'] = (_at(), None)
# One continuous stroke: tail tip -> bottom bowl -> up through the crossing ->
# top loop -> back down the diagonal, which crosses over the tail tip and runs on.
G['ampersand'] = (S(
    'M545,345 C520,165 420,-20 250,-20 C130,-20 40,55 40,160 '
    'C40,255 105,310 195,370 C285,430 345,485 345,575 '
    'C345,685 290,770 210,770 C135,770 85,715 85,650 '
    'C85,570 155,510 250,445 C360,370 490,300 600,155'), None)
G['dollar'] = None   # built from the real S in build step
