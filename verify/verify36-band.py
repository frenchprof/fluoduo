#!/usr/bin/env python3
"""
The demand band — what an activity ASKS, as its page's colour.

Dan, 2026-08-26. The family axis (verify33) says where an activity LIVES in
the menu; it says nothing about what the activity does to you. On the
activity's own page, the second is the useful one — so the band over a drill
is now coloured by demand, and the family keeps the rail, the Menu and the
section pages.

Five branches, in the order of the evidence ladder already in
lib/evidence.ts (recognition -> constrained -> free / productive):

  guess   before you are taught      Pre-Test · SpecuLearn
  lesson  the rule, then practice    Memo
  recog   the answer is in view      4Mémoire · Sorting · Match It ·
                                     VocabulaRain · LexicaLater · ÉcouTexte
  prod    retrieve one right answer  iComplete · GramMarathon · ConjugaZone
                                     (written) · WorDrill (spoken)
  create  no single right answer     ComposeIt · ChaTutor

Dan on Produce's two halves: "keeping them apart is correct, but they are at
different sub-branches of the same branch" — so WorDrill shares `prod`, and
the channel is a sub-branch, not a colour.

Every ratio below is recomputed from globals.css, not copied.

Run from the repo root:  python3 verify/verify36-band.py
"""
import math, os, re, sys

PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)

def _s2l(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def _l2s(c): return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055
def oklch(L, C, H):
    h = math.radians(H); a, b = C * math.cos(h), C * math.sin(h)
    l_, m_, s_ = (L + .3963377774*a + .2158037573*b, L - .1055613458*a - .0638541728*b,
                  L - .0894841775*a - 1.2914855480*b)
    l, m, s = l_**3, m_**3, s_**3
    return tuple(min(1, max(0, _l2s(v))) for v in (
        +4.0767416621*l - 3.3077115913*m + .2309699292*s,
        -1.2684380046*l + 2.6097574011*m - .3413193965*s,
        -0.0041960863*l - .7034186147*m + 1.7076147010*s))
def hexc(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
def lum(c):
    r, g, b = (_s2l(x) for x in c); return .2126*r + .7152*g + .0722*b
def ratio(a, b):
    la, lb = lum(a), lum(b); return (max(la, lb) + .05) / (min(la, lb) + .05)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

def read(p): return open(p, encoding="utf-8").read()
def strip_comments(s):
    return re.sub(r"//[^\n]*", "", re.sub(r"/\*[\s\S]*?\*/", "", s))

css = re.sub(r"/\*[\s\S]*?\*/", "", read("src/app/globals.css"))
def val(name):
    hits = re.findall(rf"{re.escape(name)}\s*:\s*([^;]+);", css)
    return hits[-1].strip() if hits else None
def colour(name, depth=0):
    v = val(name)
    if v is None or depth > 8: return None
    m = re.fullmatch(r"var\((--[\w-]+)\)", v)
    if m: return colour(m.group(1), depth + 1)
    m = re.fullmatch(r"oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)", v)
    if m: return oklch(float(m.group(1))/100, float(m.group(2)), float(m.group(3)))
    return hexc(v) if v.startswith("#") else None

WHITE = (1.0, 1.0, 1.0)
PAPER = colour("--cahier-paper")
BANDS = ["guess", "lesson", "recog", "prod", "create"]

# 1 · every band token resolves, and carries WHITE TEXT — that is what the
#     band is. It must also hold up if it is ever laid on paper instead.
for b in BANDS:
    c = colour(f"--band-{b}")
    if c is None:
        FAIL.append(f"--band-{b} is missing or unresolvable"); continue
    v = ratio(WHITE, c)
    ok(v >= 4.5, f"{b}: white on the band {v:.2f}:1", f"{b}: WHITE ON BAND {v:.2f}:1 — under 4.5")
    v = ratio(c, PAPER)
    ok(v >= 4.5, f"{b}: the same ink on paper {v:.2f}:1", f"{b}: INK ON PAPER {v:.2f}:1 — under 4.5")

# 2 · the five must be distinguishable from EACH OTHER, or the axis carries
#     nothing — and WCAG contrast is the WRONG instrument for that. These all
#     hold white text, so they are all much the same lightness; what separates
#     them is hue. Measure it in OKLab, and measure it again through Machado
#     deuteranopia and protanopia, because the obvious semantic palette for
#     five learning modes (amber / green / crimson) sits squarely on the axis
#     red-green colour blindness flattens. A hand-picked set measured 0.038 at
#     its worst pair; the derived set in globals.css measures 0.120.
def _oklab(c):
    r, g, b = (_s2l(x) for x in c)
    l = (0.4122214708*r + 0.5363325363*g + 0.0514459929*b) ** (1/3)
    m = (0.2119034982*r + 0.6806995451*g + 0.1073969566*b) ** (1/3)
    s_ = (0.0883024619*r + 0.2817188376*g + 0.6299787005*b) ** (1/3)
    return (0.2104542553*l + 0.7936177850*m - 0.0040720468*s_,
            1.9779984951*l - 2.4285922050*m + 0.4505937099*s_,
            0.0259040371*l + 0.7827717662*m - 0.8086757660*s_)
def dE(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(_oklab(a), _oklab(b))))
DEUT = ((0.367322, 0.860646, -0.227968), (0.280085, 0.672501, 0.047413),
        (-0.011820, 0.042940, 0.968881))
PROT = ((0.152286, 1.052583, -0.204868), (0.114503, 0.786281, 0.099216),
        (-0.003882, -0.048116, 1.051998))
def simulate(c, M):
    return tuple(min(1, max(0, sum(M[i][j] * c[j] for j in range(3)))) for i in range(3))
def separation(a, b):
    return min(dE(a, b), dE(simulate(a, DEUT), simulate(b, DEUT)),
               dE(simulate(a, PROT), simulate(b, PROT)))

BAR = 0.10   # below this, two bands read as the same colour to someone
for i, a in enumerate(BANDS):
    for b in BANDS[i+1:]:
        ca, cb = colour(f"--band-{a}"), colour(f"--band-{b}")
        if None in (ca, cb): continue
        v = separation(ca, cb)
        ok(v >= BAR, f"{a} vs {b} separate under deutan/protan (dEok {v:.3f})",
                     f"{a} vs {b} COLLAPSE (dEok {v:.3f} — under {BAR})")

# 2b · colour is never the only channel: the band always prints the name.
pb_src = read("src/components/PageBand.tsx")
ok("{title}" in pb_src, "the band always carries the activity's name, so colour only reinforces",
   "PageBand no longer prints a title — colour would be the only channel")

# 3 · one class per band, exactly like the families
for b in BANDS:
    ok(f".band-{b}" in css, f".band-{b} sets the pair", f".band-{b} class is missing")

# 4 · the registry knows the mapping, and Dan's rulings are pinned in it
reg = strip_comments(read("src/content/activities.ts"))
ok("export function bandOf" in reg, "bandOf() is exported from the registry",
   "bandOf() is missing — nothing can colour by demand")
EXPECT = {"pretest": "guess", "speculearn": "guess", "lesson": "lesson",
          "dice": "recog", "flip": "recog", "matching": "recog",
          "vocabularain": "recog", "lexicalator": "recog",
          "complete": "prod", "grammarathon": "prod", "say": "prod",
          "compose": "create"}
m = re.search(r"const BAND: Record<string, BandKey> = \{(.*?)\n\};", reg, re.S)
got = dict(re.findall(r'(\w+):\s*"(\w+)"', m.group(1))) if m else {}
for k, want in EXPECT.items():
    ok(got.get(k) == want, f"{k} -> {want}", f"{k} -> {got.get(k)!r}, expected {want!r}")
ok(got.get("say") == got.get("complete"),
   "WorDrill shares Produce with iComplete — the channel is a sub-branch, not a colour",
   "WorDrill has broken out of Produce — Dan ruled it the same branch, 26 Aug")
ok(got.get("dice") == "recog",
   "Sorting is Recognise — nothing is produced, the answer is on screen",
   "Sorting is not Recognise — evidence.ts's own definition names sorting into a column")

# 5 · the band is what the page actually paints, with the family as fallback
pb = read("src/components/PageBand.tsx")
ok("var(--band, var(--fam-ink" in pb,
   "PageBand takes --band first and falls back to the family ink",
   "PageBand does not prefer --band — the demand axis is not painted")
for f in ("src/components/DrillShell.tsx", "src/components/CahierShell.tsx"):
    src = read(f)
    ok("bandOf" in src and "band-${bandKey}" in src,
       f"{os.path.basename(f)} puts the band class on its page",
       f"{os.path.basename(f)} does not apply band-*")

# 6 · the exemption the family axis already makes must hold here too
ok(re.search(r"bandOf[\s\S]{0,300}SELF_COLOURED\.has", reg) is not None,
   "/moi and /profil keep their own scheme — bandOf returns null there",
   "bandOf does not exempt the self-coloured pages")

# ── the banded icon tile lives in ONE file (2026-08-29) ───────────────────
# Dan, on seeing the stop sheet: "actually those icons are very good. i want
# to use them" — so the tile that had been inline in StopSheet now serves the
# activity landings too. Two copies of it is precisely how one activity ends
# up wearing two different colours on two screens, which is the fault the
# registry exists to prevent. Asserted structurally: exactly one component
# defines it, and nobody hand-rolls a second.
import glob as _glob

# Strip comments first. The docstring of ActivityIcon.tsx EXPLAINS that the
# fill comes from bandOf(), so a check over the raw file passed with the call
# itself deleted — the third time this repo has caught a check reading its own
# explanation (verify19b, verify40).
def _nocomment(src):
    import re as _re
    src = _re.sub(r"/\*.*?\*/", "", src, flags=_re.S)
    return _re.sub(r"^\s*//.*$", "", src, flags=_re.M)

_icon = _nocomment(open("src/components/ActivityIcon.tsx", encoding="utf-8").read())
_ok = "bandOf(activityKey)" in _icon and "var(--band" in _icon
(PASS if _ok else FAIL).append(
    "ActivityIcon.tsx is the one banded tile (bandOf + var(--band))"
    if _ok else "ActivityIcon.tsx missing, or it no longer derives its fill from bandOf")

# A hand-rolled copy is a SMALL SQUARE tile filled with the band — a grid box
# that centres one glyph. Matching `var(--band` alone was too loose and fired
# on PageBand.tsx, which fills a whole page strip with the same variable and
# is not a copy of anything; the tile is distinguished by centring a glyph in
# a box, which a page-wide strip never does.
_copies = []
for _f in _glob.glob("src/**/*.tsx", recursive=True):
    if _f.replace("\\", "/").endswith("components/ActivityIcon.tsx"):
        continue
    _src = open(_f, encoding="utf-8").read()
    if 'var(--band' in _src and "place-items-center" in _src:
        _copies.append(_f)
(PASS if not _copies else FAIL).append(
    "no second copy of the tile — every caller imports ActivityIcon"
    if not _copies else f"the tile is hand-rolled again in: {_copies}")

for _f, _who in (("src/components/StopSheet.tsx", "the stop sheet"),
                 ("src/components/ActivityLanding.tsx", "the activity landings")):
    # `<ActivityIcon` — the RENDER, not the name. Checking the bare name
    # passed with the element deleted, because the import line alone satisfied
    # it (the `function AllCards` lesson, 2026-08-28).
    _src = open(_f, encoding="utf-8").read()
    _u = "<ActivityIcon" in _src
    (PASS if _u else FAIL).append(
        f"{_who} draws its activities with ActivityIcon"
        if _u else f"{_who} no longer uses ActivityIcon")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
