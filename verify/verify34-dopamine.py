#!/usr/bin/env python3
"""
The dopamine accents, pinned.

Approved 21 Aug 2026 with three guardrails, and this file is the guardrail
that CI can enforce:

  · the seven roles keep their measured contrast — every figure below is
    recomputed from the OKLCH in globals.css, not copied from the doc;
  · the Cahier ground stays untouchable — the accent block must not redefine
    a structural token;
  · the regions stay their own system — --region-* must not be folded in.

Why the maths lives here rather than a table of expected ratios: a table can
be edited to match a regression. Recomputing from the stylesheet means a
changed token either still passes its threshold or fails the build.

The reference ink is --cahier-ink as the LAST :root wins — oklch(28% 0.02 55)
= #312620, from the 10 Aug override block. The #2a2e6e declared ~700 lines
earlier is superseded; measuring against it understates every label ratio by
about 1.5 points (it is the trap that produced two wrong figures in the
21 Aug audit).

Run from the repo root:  python3 verify/verify30-dopamine.py
"""
import math, os, re, sys

CSS = "src/app/globals.css"
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

# ── colour maths (validated against the CSS Color 4 reference vectors) ──────
def _s2l(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def _l2s(c): return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055

def oklch(L, C, H):
    h = math.radians(H)
    a, b = C * math.cos(h), C * math.sin(h)
    l_, m_, s_ = (L + 0.3963377774 * a + 0.2158037573 * b,
                  L - 0.1055613458 * a - 0.0638541728 * b,
                  L - 0.0894841775 * a - 1.2914855480 * b)
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    return tuple(min(1, max(0, _l2s(v))) for v in (
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s))

def hexc(h):
    h = h.lstrip("#")
    if len(h) == 3: h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

def lum(c):
    r, g, b = (_s2l(x) for x in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)

def selfcheck():
    """A wrong implementation must not be able to bless a wrong palette."""
    got = ["%02x%02x%02x" % tuple(round(x * 255) for x in oklch(0.62796, 0.25768, 29.234)),
           "%02x%02x%02x" % tuple(round(x * 255) for x in oklch(0.86644, 0.29483, 142.495))]
    return got == ["ff0000", "00ff00"] and abs(ratio(hexc("#000"), hexc("#fff")) - 21) < 0.01

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)
src = open(CSS, encoding="utf-8").read()
nocom = re.sub(r"/\*[\s\S]*?\*/", "", src)

ok(selfcheck(), "the colour maths self-check passes",
   "the colour maths FAILED its own reference vectors — fix this file first")

def val(name):
    """Last :root declaration wins, exactly as the cascade resolves it."""
    hits = re.findall(rf"{re.escape(name)}\s*:\s*([^;]+);", nocom)
    return hits[-1].strip() if hits else None

def colour(name, depth=0):
    v = val(name)
    if v is None or depth > 8: return None
    m = re.fullmatch(r"var\((--[\w-]+)\)", v)
    if m: return colour(m.group(1), depth + 1)
    m = re.fullmatch(r"oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)", v)
    if m: return oklch(float(m.group(1)) / 100, float(m.group(2)), float(m.group(3)))
    if v.startswith("#"): return hexc(v)
    return None

PAPER, INK, WHITE = colour("--cahier-paper"), colour("--cahier-ink"), (1, 1, 1)
ok(PAPER is not None and INK is not None,
   "the Cahier ground resolves", "--cahier-paper / --cahier-ink no longer resolve")

ok(INK is not None and "%02x%02x%02x" % tuple(round(x * 255) for x in INK) == "312620",
   "--cahier-ink resolves to the override value #312620, not the superseded #2a2e6e",
   "--cahier-ink no longer resolves to #312620 — every label figure below shifts")

ROLES = ["joy", "win", "flow", "reward", "focus", "streak", "miss"]

# ── 1 · every role is present, and every measured threshold still holds ─────
for r in ROLES:
    fill, ink_, wash = colour(f"--dopa-{r}"), colour(f"--dopa-{r}-ink"), colour(f"--dopa-{r}-wash")
    on = colour(f"--dopa-{r}-on")
    if None in (fill, ink_, wash, on):
        FAIL.append(f"--dopa-{r}-* is incomplete or unresolvable"); continue
    lbl = ratio(on, fill)
    ok(lbl >= 4.5, f"{r}: label on fill {lbl:.2f}:1", f"{r}: LABEL ON FILL {lbl:.2f}:1 — under 4.5")
    tp = ratio(ink_, PAPER)
    ok(tp >= 4.5, f"{r}: -ink on paper {tp:.2f}:1", f"{r}: -ink ON PAPER {tp:.2f}:1 — under 4.5")
    tw = ratio(ink_, wash)
    ok(tw >= 4.5, f"{r}: -ink on its wash {tw:.2f}:1", f"{r}: -ink ON WASH {tw:.2f}:1 — under 4.5")

# The three darker fills must also clear 3:1 unaided — they are the only ones
# allowed to be drawn as a bare mark (a dot, a bar, a badge) with no hairline.
for r in ["focus", "streak", "miss"]:
    f = colour(f"--dopa-{r}")
    if f is None: continue
    v = ratio(f, PAPER)
    ok(v >= 3.0, f"{r}: bare mark on paper {v:.2f}:1",
       f"{r}: BARE MARK {v:.2f}:1 — under 3, so it may no longer be drawn unaided")

# ── 2 · guardrail: the Cahier ground is untouchable ─────────────────────────
block = nocom[nocom.index("--dopa-joy"):] if "--dopa-joy" in nocom else ""
intruders = [t for t in ["--cahier-paper:", "--cahier-ink:", "--cahier-ink-soft:",
                         "--cahier-line:", "--cahier-desk:", "--cahier-paper-2:"] if t in block]
ok(not intruders, "the accent block redefines no structural Cahier token",
   f"the accent block redefines the Cahier ground: {', '.join(intruders)}")

# ── 3 · guardrail: the regions stay a separate system ───────────────────────
ok("--region-" not in block, "--region-* stays its own system, not folded into the accents",
   "--region-* has been folded into the dopamine block — Decision 4 keeps them separate")

# ── 4 · the three approved accessibility fixes, still in place ──────────────
for sel, why in [
    (r"\.home-map3d-node:focus-visible\s*\{[^}]*outline-color:\s*var\(--dopa-focus\)",
     "the 3D map focus ring uses --dopa-focus (was gold at 2.24:1)"),
    (r"\.fluo-btn-secondary\s*\{[^}]*color:\s*var\(--cahier-ink\)",
     "the secondary button takes ink, not white (was 2.45:1)"),
    (r"\.cahier-page textarea\s*\{\s*border-color:\s*var\(--cahier-ink-soft\)",
     "form inputs take a 3:1-capable border (was --cahier-line at 1.25:1)")]:
    ok(re.search(sel, nocom) is not None, why, "REGRESSED: " + why)

border = colour("--cahier-ink-soft")
if border and PAPER:
    v = ratio(border, PAPER)
    ok(v >= 3.0, f"the input border clears the control threshold at {v:.2f}:1",
       f"the input border is {v:.2f}:1 — under the 3:1 a control boundary needs")

# ── 5 · three call sites that used to wear leftover Duo / drill colours ───
# The due pill, the game progress fill / hearts, and VocabulaRain's
# clear / miss flashes. Accent only — boards stay on Cahier paper.
def src(path):
    return open(path, encoding="utf-8").read()

bar = src("src/components/BottomBar.tsx")
ok("--dopa-streak" in bar and "--fluo-danger" not in bar,
   "the due pill wears --dopa-streak, not --fluo-danger",
   "the due pill is still --fluo-danger (or no longer --dopa-streak)")
ok("--dopa-streak-on" in bar,
   "the due count sits on --dopa-streak-on",
   "the due count dropped --dopa-streak-on — contrast is no longer the token pair")

gbar = src("src/components/GameBar.tsx")
ok("--dopa-win" in gbar and "--drill-ok" not in gbar,
   "GameBar progress is --dopa-win",
   "GameBar progress is still --drill-ok (or no longer --dopa-win)")
ok("--dopa-miss" in gbar and "--drill-bad" not in gbar,
   "GameBar hearts are --dopa-miss",
   "GameBar hearts are still --drill-bad (or no longer --dopa-miss)")

letris = src("src/games/letris/LetrisGame.tsx")
ok("--dopa-win" in letris and "--dopa-miss" in letris,
   "VocabulaRain's clear / miss accents use --dopa-win / --dopa-miss",
   "VocabulaRain no longer tokens its clear / miss accents")
ok("--drill-ok" not in letris and "--drill-bad" not in letris,
   "VocabulaRain dropped the leftover --drill-ok / --drill-bad accents",
   "VocabulaRain still paints clear / miss with --drill-ok / --drill-bad")
ok("bg-lime-300" not in letris and "bg-rose-400" not in letris and "#2e7d00" not in letris,
   "VocabulaRain's flash / toast no longer use raw lime / rose / Duo green",
   "VocabulaRain still flashes lime / rose or #2e7d00 instead of the dopa tokens")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
