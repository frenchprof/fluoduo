"""Assemble the completed FluOlinGo Hand family (9 weights) from the Regular master."""
import os, sys, skia, core, g_ascii, g_sym
import g_latin as L
from fontTools.ttLib import TTFont
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen

SRCF = TTFont("FluOlinGoHandRegular.otf")
SRCG = SRCF.getGlyphSet(); SRCH = SRCF['hmtx']; SRCC = SRCF.getBestCmap()
UPM = 1512

ASCII_CP = {'numbersign':0x23,'percent':0x25,'ampersand':0x26,
  'asterisk':0x2A,'plus':0x2B,'slash':0x2F,'less':0x3C,'equal':0x3D,'greater':0x3E,
  'at':0x40,'bracketleft':0x5B,'backslash':0x5C,'bracketright':0x5D,
  'asciicircum':0x5E,'underscore':0x5F,'braceleft':0x7B,'bar':0x7C,
  'braceright':0x7D,'asciitilde':0x7E,'brokenbar':0xA6}
SYM_CP = {'exclamdown':0xA1,'questiondown':0xBF,'quotesinglbase':0x201A,
  'quotedblbase':0x201E,'guilsinglleft':0x2039,'guilsinglright':0x203A,
  'dagger':0x2020,'daggerdbl':0x2021,'bullet':0x2022,'periodcentered':0xB7,
  'fraction':0x2044,'prime':0x2032,'doubleprime':0x2033,'minus':0x2212,
  'logicalnot':0xAC,'perthousand':0x2030,'section':0xA7,'paragraph':0xB6,
  'grave':0x60,'acute':0xB4,'dieresis':0xA8,'macron':0xAF,'cedilla':0xB8,
  'circumflex':0x2C6,'caron':0x2C7,'breve':0x2D8,'dotaccent':0x2D9,'ring':0x2DA,
  'ogonek':0x2DB,'tilde':0x2DC,'hungarumlaut':0x2DD,
  'cent':0xA2,'sterling':0xA3,'currency':0xA4,'yen':0xA5,'ruble':0x20BD,
  'rupee':0x20B9,'won':0x20A9,'lira':0x20BA,'hryvnia':0x20B4,'bitcoin':0x20BF,
  'multiply':0xD7,'divide':0xF7,'plusminus':0xB1,'notequal':0x2260,
  'lessequal':0x2264,'greaterequal':0x2265,'approxequal':0x2248,'infinity':0x221E,
  'radical':0x221A,'summation':0x2211,'product':0x220F,'integral':0x222B,
  'partialdiff':0x2202,'increment':0x2206,'emptyset':0x2205,'mu':0xB5,
  'pi':0x3C0,'Omega':0x3A9,'ordfeminine':0xAA,'ordmasculine':0xBA,
  'onequarter':0xBC,'onehalf':0xBD,'threequarters':0xBE,'onethird':0x2153,
  'twothirds':0x2154,'oneeighth':0x215B,'threeeighths':0x215C,
  'fiveeighths':0x215D,'seveneighths':0x215E,'copyright':0xA9,'registered':0xAE,
  'trademark':0x2122,'lozenge':0x25CA,'blackstar':0x2605,'whitestar':0x2606,
  'heart':0x2665,'checkmark':0x2713,'ballotx':0x2717,'arrowleft':0x2190,
  'arrowup':0x2191,'arrowright':0x2192,'arrowdown':0x2193,'arrowboth':0x2194,
  'arrowupdn':0x2195,'onesuperior':0xB9,'twosuperior':0xB2,'threesuperior':0xB3}
_D = ['zero','one','two','three','four','five','six','seven','eight','nine']
for i, n in enumerate(_D):
    SYM_CP.setdefault(n+'superior', 0x2070+i if i not in (1,2,3) else None)
    SYM_CP[n+'inferior'] = 0x2080+i
SYM_CP['zerosuperior']=0x2070; SYM_CP['foursuperior']=0x2074
for i in range(5,10): SYM_CP[_D[i]+'superior']=0x2070+i
SYM_CP = {k:v for k,v in SYM_CP.items() if v}
ALIAS = {0xA0:'space', 0xAD:'uni002D', 0x2010:'uni002D', 0x3BC:'uni00B5',
         0x2126:'uni03A9', 0x2007:'space', 0x2009:'space', 0x202F:'space'}

def collect():
    """codepoint -> (skia outline, advance), the Regular master."""
    G = {}
    for cp, gname in SRCC.items():                       # untouched originals
        G[cp] = (core.glyph_path(SRCG, gname), SRCH[gname][0])
    drawn = set()
    for name, cp in list(ASCII_CP.items()) + [('dollar', 0x24)]:
        v = g_ascii.G.get(name) or g_sym.G.get(name)
        if v: G[cp] = v; drawn.add(cp)
    for name, cp in SYM_CP.items():
        if name in g_sym.G: G[cp] = g_sym.G[name]; drawn.add(cp)
    for gname, v in L.build().items():
        G[int(gname[3:], 16)] = v
    out = {}
    for cp, (p, adv) in G.items():
        p = core.clean(p)
        b = core.bounds(p)
        # Only glyphs drawn from scratch get their origin normalised; originals
        # and accent composites keep the source font's own positioning (marks on
        # narrow letters legitimately overhang to the left, as in the source i-circumflex).
        if cp in drawn and b[2] - b[0] > 0:
            dx = -48 - b[0]
            if abs(dx) > 0.5: p = core.translate(p, dx, 0)
            b = core.bounds(p)
        out[cp] = (p, adv or round(b[2] - 48 + 180))
    return out

WEIGHTS = [('Thin',100,15),('ExtraLight',200,22),('Light',300,32),
           ('Regular',400,48),('Medium',500,58),('SemiBold',600,72),
           ('Bold',700,88),('ExtraBold',800,106),('Black',900,126)]

def gname(cp): return 'space' if cp == 0x20 else 'uni%04X' % cp

# A lift of 1.0 keeps the Regular letter/mark gap exactly. Heavier weights get
# extra clearance so marks never weld onto the letter: caps need more than
# lowercase because the source design deliberately overlaps them by 48 units.
LIFT_LC, LIFT_UC = 1.5, 2.4

def build_weight(master, style, wclass, r, outdir):
    d = 1.5 * (r - 48)
    glyphs = {}
    for cp, (p, adv) in master.items():
        if r != 48 and cp in L.RECIPES:
            # Re-seat the mark for this weight so it never fuses into the letter.
            bp, ba, mk, anc, above, up = L.RECIPES[cp]
            b2 = core.reweight(core.clean(bp), r)
            m2 = core.reweight(core.clean(L.MARK[mk]), r)
            dr = r - 48
            shift = dr * ((LIFT_UC if up else LIFT_LC) if dr > 0 else 1.0)
            if above: m2 = L.place(m2, cx=L._mark_x(b2, mk), bot=anc + shift)
            else:     m2 = L.place(m2, cx=L._mark_x(b2, mk), top=anc - shift)
            q = core.union([b2, m2])
        else:
            q = core.reweight(p, r) if r != 48 else p
        glyphs[gname(cp)] = (q, max(1, round(adv + d)))
    order = ['.notdef'] + [gname(cp) for cp in sorted(master)]
    notdef = core.glyph_path(SRCG, '.notdef')
    glyphs['.notdef'] = (core.reweight(core.clean(notdef), r) if r != 48
                         else core.clean(notdef), round(SRCH['.notdef'][0] + d))
    cs, metrics = {}, {}
    ymin, ymax = 0, 0
    for n in order:
        p, adv = glyphs[n]
        pen = T2CharStringPen(adv, None)
        core.draw_to(p, pen)
        cs[n] = pen.getCharString()
        b = core.bounds(p)
        lsb = round(b[0]) if b[2] - b[0] > 0 else 0
        if b[2] - b[0] > 0: ymin = min(ymin, b[1]); ymax = max(ymax, b[3])
        metrics[n] = (adv, lsb)
    fam = "FluOlinGo Hand"
    ribbi = style in ('Regular', 'Bold')
    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    cmap = {cp: gname(cp) for cp in master}
    for cp, target in ALIAS.items():
        if target in cs: cmap[cp] = target
    fb.setupCharacterMap(cmap)
    fb.setupCFF("FluOlinGoHand-" + style.replace(' ', ''),
                {"FullName": f"{fam} {style}", "FamilyName": fam,
                 "Weight": style}, cs, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=1080, descent=-432, lineGap=0)
    fb.setupNameTable({
        "familyName": fam if ribbi else f"{fam} {style}",
        "styleName": "Bold" if style == 'Bold' else "Regular",
        "uniqueFontIdentifier": f"{fam} {style}; 2.000",
        "fullName": f"{fam} {style}",
        "psName": "FluOlinGoHand-" + style.replace(' ', ''),
        "version": "Version 2.000",
        "typographicFamily": fam, "typographicSubfamily": style})
    fb.setupOS2(sTypoAscender=1080, sTypoDescender=-432, sTypoLineGap=0,
                usWinAscent=max(1080, round(ymax)), usWinDescent=max(432, round(-ymin)),
                sCapHeight=808, sxHeight=510, usWeightClass=wclass,
                fsSelection=(1 << 7) | (1 << 5 if style == 'Bold' else 1 << 6),
                achVendID="FLUO", fsType=0, version=4)
    fb.setupPost(italicAngle=0.0, underlinePosition=-200, underlineThickness=96)
    f = fb.font
    if style == 'Bold': f['head'].macStyle |= 1
    ps = "FluOlinGoHand-" + style.replace(' ', '')
    os.makedirs(outdir, exist_ok=True)
    f.save(f"{outdir}/{ps}.otf")
    f.flavor = "woff2"; f.save(f"{outdir}/{ps}.woff2"); f.flavor = None
    # --- TrueType flavour ---
    tt = FontBuilder(UPM, isTTF=True)
    tt.setupGlyphOrder(order); tt.setupCharacterMap(cmap)
    gl = {}
    for n in order:
        p, adv = glyphs[n]
        tp = TTGlyphPen(None)
        core.draw_to(p, Cu2QuPen(tp, 0.6))
        gl[n] = tp.glyph()
    tt.setupGlyf(gl)
    tt.setupHorizontalMetrics(metrics)
    tt.setupHorizontalHeader(ascent=1080, descent=-432, lineGap=0)
    tt.setupNameTable({
        "familyName": fam if ribbi else f"{fam} {style}",
        "styleName": "Bold" if style == 'Bold' else "Regular",
        "uniqueFontIdentifier": f"{fam} {style}; 2.000",
        "fullName": f"{fam} {style}",
        "psName": ps, "version": "Version 2.000",
        "typographicFamily": fam, "typographicSubfamily": style})
    tt.setupOS2(sTypoAscender=1080, sTypoDescender=-432, sTypoLineGap=0,
                usWinAscent=max(1080, round(ymax)), usWinDescent=max(432, round(-ymin)),
                sCapHeight=808, sxHeight=510, usWeightClass=wclass,
                fsSelection=(1 << 7) | (1 << 5 if style == 'Bold' else 1 << 6),
                achVendID="FLUO", fsType=0, version=4)
    tt.setupPost(italicAngle=0.0, underlinePosition=-200, underlineThickness=96)
    if style == 'Bold': tt.font['head'].macStyle |= 1
    tt.font.save(f"{outdir}/{ps}.ttf")
    return len(order)

if __name__ == '__main__':
    m = collect()
    print("master glyphs (incl .notdef): %d   codepoints: %d" % (len(m)+1, len(m)))
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for style, wc, r in WEIGHTS:
        if only and style != only: continue
        n = build_weight(m, style, wc, r, "dist")
        print("  built %-11s w=%3d R=%3d  glyphs=%d" % (style, wc, r, n))
