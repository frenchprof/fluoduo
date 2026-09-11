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

# 1 · every band token resolves, is one of the twelve, and carries BLACK TEXT.
#
# Dan, 2026-09-06: *"whatever it is, every color on the web can only be one of
# these"* — the twelve marks in src/content/highlighterMarks.ts — and
# *"use black ink if you have to - for words"*.
#
# BOTH HALVES OF THAT ARE CHECKED HERE, because either alone is a trap. The
# bands are now the palette's pens at full highlighter strength, so white on
# them measures 1.84-2.84:1: a future edit that puts white back is unreadable
# the moment it lands, and nothing else in the repo would notice. And a band
# that drifts off the palette is the exact fault Dan sent back twice.
#
# This REPLACES a white-on-band rule and an ink-on-paper rule. The second is
# gone rather than relaxed: it asked whether the band colour would work as
# TEXT on the cahier paper, which was true of the dimmed set and is not the
# job these do. A band is a ground.
PALETTE = dict(re.findall(r'block: "(#[0-9a-fA-F]{6})"', read("src/content/highlighterMarks.ts")) and
               [(m.group(1), m.group(2)) for m in re.finditer(
                   r'key: "([a-z]+)",\s+name: "[^"]+",\s+hue:\s*\d+,\s+reverseOf: "[a-z]+",\s+block: "(#[0-9a-fA-F]{6})"',
                   read("src/content/highlighterMarks.ts"))])
ok(len(PALETTE) == 12,
   f"the twelve-mark palette is readable from highlighterMarks.ts ({len(PALETTE)} marks)",
   f"could not read the twelve marks — found {len(PALETTE)}. Every band colour is "
   "checked against them, so this file is the source and the scrape must hold.")
BLACK = (0.0, 0.0, 0.0)


def as_hex(c):
    """`colour()` hands back 0-1 RGB; the palette is written in hex."""
    return "#%02x%02x%02x" % tuple(round(x * 255) for x in c)
for b in BANDS:
    c = colour(f"--band-{b}")
    if c is None:
        FAIL.append(f"--band-{b} is missing or unresolvable"); continue
    ch = as_hex(c)
    hit = [n for n, h in PALETTE.items() if h.lower() == ch]
    ok(bool(hit),
       f"{b}: {ch} is {hit[0] if hit else ''} from the twelve",
       f"{b}: {ch} IS NOT ONE OF THE TWELVE. Dan, 6 Sep: \"every color on the web "
       "can only be one of these\" — see highlighterMarks.ts.")
    v = ratio(BLACK, c)
    ok(v >= 4.5, f"{b}: black on the band {v:.2f}:1", f"{b}: BLACK ON BAND {v:.2f}:1 — under 4.5")

# 2 · THE COLOUR-BLINDNESS RULE IS GONE — Dan's call, recorded not buried.
#
# What stood here: the five bands had to separate by >= 0.10 dEok in OKLab
# AND through Machado deuteranopia and protanopia simulation. It was written
# because the obvious semantic palette for five learning modes (amber / green
# / crimson) sits squarely on the axis red-green colour blindness flattens; a
# hand-picked set measured 0.038 at its worst pair and the search-derived
# replacement measured 0.120.
#
# It cannot survive Dan's 6 Sep ruling that *"every color on the web can only
# be one of these"* — the twelve marks. No five of the twelve pass the bar:
# they are one hue wheel at one lightness, which is what makes them a set, and
# lightness is the only channel colour blindness leaves. The best five of all
# 792 combinations measure 0.073. The current five measure 0.008 at Sky
# against Magenta.
#
# Put to Dan with the simulation and the numbers, and offered the alternative
# (the same hues dimmed until they separate, at 0.121): *"don't care about
# color blindness pls"*, *"it is NOT OUR CONCERN"*.
#
# So it is deleted rather than loosened to a number nobody chose. What still
# holds is §2b below, which was always the stronger guarantee: the band prints
# the activity's name, so no learner navigates by colour alone. Restore this
# section only on a ruling from Dan, and if you do, note that it and the
# palette rule in §1 cannot both be satisfied.

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
# THE PAINTERS READ stripOf, NOT bandOf, SINCE 2026-09-08 (Dan: "ConjugaZone
# pages should be in Teal colored strip ok"). `bandOf` still answers what the
# exercise DEMANDS — verify62 holds it against the teacher's record — and
# `stripOf` answers what colour that is, which an activity may now own outright.
# The rule this check exists for is unchanged and is the reason it follows the
# rename rather than being deleted: a surface must take its fill from the one
# table, never from a hue of its own.
ok("export function stripOf" in reg, "stripOf() is exported from the registry",
   "stripOf() is missing — the painting surfaces have no one table to read")
ok(re.search(r"stripOf[\s\S]{0,400}OWN_STRIP\[activeKey\] \?\? bandOf", reg) is not None,
   "stripOf falls back to the band, so an activity without its own colour still has one",
   "stripOf no longer falls back to bandOf — an activity with no colour of its own\n"
   "     would go unpainted, which is how a page ends up borrowing a hue at random")
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
    ok("stripOf" in src and "band-${bandKey}" in src,
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
_ok = "stripOf(activityKey)" in _icon and "var(--band" in _icon
(PASS if _ok else FAIL).append(
    "ActivityIcon.tsx is the one banded tile (stripOf + var(--band))"
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

# The landings deliberately do NOT use it (Dan, 2026-08-29: "there is no need
# to have one icon per line. it's a bloody waste of space") — that page is ONE
# activity, so its icon belongs in the band at the top, once. The tile is a
# stop-sheet thing, where every row is a different activity.
for _f, _who in (("src/components/StopSheet.tsx", "the stop sheet"),):
    # `<ActivityIcon` — the RENDER, not the name. Checking the bare name
    # passed with the element deleted, because the import line alone satisfied
    # it (the `function AllCards` lesson, 2026-08-28).
    _src = open(_f, encoding="utf-8").read()
    _u = "<ActivityIcon" in _src
    (PASS if _u else FAIL).append(
        f"{_who} draws its activities with ActivityIcon"
        if _u else f"{_who} no longer uses ActivityIcon")

# ── every activity page names ITSELF in the strip (2026-08-29) ────────────
# Dan: "why is the coloured heading strip not consistently showing the name of
# activity". CahierShell takes the strip's label, its family wash AND its
# demand band from `active`, so an activity page that passes anything else
# gets someone else's identity. The landings passed `unit-${openUnit}` and so
# every one of them announced itself as "Unité 0".
_al = _nocomment(open("src/components/ActivityLanding.tsx", encoding="utf-8").read())
_ok = "active={activityKey}" in _al and "active={`unit-" not in _al
(PASS if _ok else FAIL).append(
    "the activity landings pass their own key as CahierShell's `active`"
    if _ok else "an activity landing passes a unit as `active` — its strip will say Unité N")

# NumBus and NumBourse were the only two activities in the app with no strip
# at all: both dropped the learner straight into a GameFrame. Dan: "even if
# they do not have 50-stop list, it should still have a landing page before
# the game begins, e.g. for settings and so on."
for _f, _who in (("src/app/games/numbus/page.tsx", "NumBus"),
                 ("src/app/games/numbourse/page.tsx", "NumBourse")):
    _src = _nocomment(open(_f, encoding="utf-8").read())
    _u = "<GameLanding" in _src
    (PASS if _u else FAIL).append(
        f"{_who} opens on a landing page, not straight into the game"
        if _u else f"{_who} no longer has a landing page before the game")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
