#!/usr/bin/env python3
"""
Family identity — the site's second colour axis, pinned.

Dan, 2026-08-21, on the profile page from pm/profile-learner-model: "this
almost sets the dopamine colour gold standard for the rest of the website.
Nowhere is there the same kind of surprising colour schemes." Measured, he was
right: the core learning surfaces render 2.5-3% saturated pixels (/reviser 2.5,
/conjugaison 3.0, /leaderboard 2.7) — effectively monochrome paper.

What that page does, and this layer generalises: a FIXED hue per section, at
four intensities with four jobs. It is not the rotating-hue pattern
COLOR_REVIEW asked to demote — rotation by list index encodes nothing, whereas
a stable per-section hue tells a learner which world they are in. Same tokens,
opposite value; the review's Finding B was half wrong and says so now.

The correction this layer makes to the reference: the reference filled the
spine and the status pill with the FULL hue and put paper text on them —
1.99:1 on gold, 2.27:1 on teal, failing on all six. Both take --fam-X-ink
here. The full hue is decoration only.

Every ratio below is recomputed from globals.css, not copied.

Run from the repo root:  python3 verify/verify33-family.py
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
css = re.sub(r"/\*[\s\S]*?\*/", "", open("src/app/globals.css", encoding="utf-8").read())

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

PAPER, INK = colour("--cahier-paper"), colour("--cahier-ink")
FAMS = ["goals", "practice", "svplay", "review", "skills", "user"]

for f in FAMS:
    full, ink, wash = colour(f"--fam-{f}"), colour(f"--fam-{f}-ink"), colour(f"--fam-{f}-wash")
    if None in (full, ink, wash):
        FAIL.append(f"--fam-{f}-* is incomplete or unresolvable"); continue
    # the band's label is near-black on the wash
    v = ratio(INK, wash)
    ok(v >= 4.5, f"{f}: band label on wash {v:.2f}:1", f"{f}: BAND LABEL {v:.2f}:1 — under 4.5")
    # the pill is paper on -ink
    v = ratio(PAPER, ink)
    ok(v >= 4.5, f"{f}: pill label on -ink {v:.2f}:1", f"{f}: PILL LABEL {v:.2f}:1 — under 4.5")
    # the spine is -ink, and must read against BOTH its band and the page
    v1, v2 = ratio(ink, wash), ratio(ink, PAPER)
    ok(v1 >= 3.0 and v2 >= 3.0,
       f"{f}: spine {v1:.2f}:1 on its band, {v2:.2f}:1 on paper",
       f"{f}: SPINE {v1:.2f}/{v2:.2f} — under the 3:1 an identity marker needs")
    # and the guard that caught the reference: the FULL hue must never be
    # mistaken for something that can carry meaning
    v = ratio(PAPER, full)
    ok(v < 4.5, f"{f}: the full hue is correctly decoration-only (paper on it {v:.2f}:1)",
       f"{f}: the full hue now passes 4.5 — harmless, but check nothing relies on it")

# ── the layer is used, not just declared ──────────────────────────────────
band = open("src/components/SectionBand.tsx", encoding="utf-8").read() if os.path.isfile("src/components/SectionBand.tsx") else ""
ok(bool(band), "SectionBand exists", "SectionBand.tsx is gone — the pattern is trapped in one page again")
ok("var(--fam-ink)" in band and "var(--fam-wash)" in band,
   "the band reads the family trio, never a hard-coded hue",
   "SectionBand hard-codes a hue — a new family would mean editing the component")
ok('borderLeft: spine' in band and 'var(--fam-ink)' in band,
   "the spine takes --fam-ink (the reference used the full hue and failed 3:1)",
   "the spine is back on the full hue — it fails 3:1 against its own band")
ok('background: "var(--fam-ink)", color: "var(--cahier-paper)"' in band,
   "the pill takes --fam-ink with paper on it (the reference's pill was 1.99:1)",
   "the pill is back on the full hue — paper on it measures 1.99-4.17:1")
ok(re.search(r"\.fam-none\s*\{", css) is not None,
   "a colourless family exists — a stack where every row is coloured has no hierarchy",
   "fam-none is gone; nothing can be deliberately neutral")
users = [p for p in ["src/app/reviser/page.tsx"] if "SectionBand" in open(p, encoding="utf-8").read()]
ok(bool(users), f"the band is in use ({len(users)} surface)",
   "nothing uses SectionBand — it would be dead code")

print("\n".join("  ok    " + m for m in PASS))
if FAIL: print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
