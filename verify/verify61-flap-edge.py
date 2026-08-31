#!/usr/bin/env python3
"""verify61 — the rail's hierarchy steps down on the COLOURED edge.

A flap's tier is drawn by the thickness of its coloured edge: 6px for a site
row, 5px for a deck activity, 4px for an in-page view. That is the only thing
carrying "site row > deck activities > Flip It" visually.

On 30 Aug the desk moved left (be0930c) and a blanket left->right sweep caught
two lines that were ALREADY correct: `.cahier-tab--sm/--xs` went from
`border-left-width` to `border-right-width`. Measured in a browser afterwards,
the shipped result was:

    cahier-tab       left=6px right=1px      <- base, correct
    cahier-tab--sm   left=6px right=5px      <- no step-down, stray grey edge
    cahier-tab--xs   left=6px right=4px      <- same

So all three tiers wore an identical 6px hue and the two lower ones grew a
5px/4px GREY edge on the opposite side that nothing asked for. Both files
parsed, every check stayed green, and nothing looked wrong in the source.

This check does NOT pin the side. Dan has moved the binding once and may move
it again; pinning "left" would make a future correct mirror fail here for the
wrong reason. It reads which side the BASE rule paints with `--tab-hue` and
asserts the modifiers step that same side down and leave the other alone.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS = ROOT / "src/app/globals.css"
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

if not CSS.exists():
    print("FAIL  src/app/globals.css is missing — this check cannot run and must not pass")
    sys.exit(1)
src = CSS.read_text(encoding="utf-8")

def rule(selector):
    """The declaration block of an exact selector, or None."""
    m = re.search(r"(?:^|\})\s*" + re.escape(selector) + r"\s*\{([^}]*)\}", src, re.M)
    return m.group(1) if m else None

BASE = rule(".cahier-tab")
ok(BASE is not None, "`.cahier-tab` found",
   "`.cahier-tab` has no rule in globals.css — it has been renamed, and every "
   "assertion below would be vacuous")
if BASE is None:
    print("\n".join(f"FAIL  {x}" for x in FAIL)); sys.exit(1)

# ── which side carries the hue ─────────────────────────────────────────────
hue = re.search(r"border-(left|right)\s*:\s*(\d+)px\s+solid\s+var\(\s*--tab-hue",
                BASE)
ok(hue is not None, None,
   "`.cahier-tab` no longer paints one border with `var(--tab-hue)`. The flap's "
   "coloured edge IS its tier marker; without it the rail has no hierarchy to "
   "step down. If the hue moved to a background or shadow, rewrite this check "
   "against whatever now carries it — do not delete it.")
if hue is None:
    for line in PASS:
        if line: print(f"  ok  {line}")
    for line in FAIL: print(f"FAIL  {line}")
    sys.exit(1)

SIDE, OTHER = hue.group(1), ("right" if hue.group(1) == "left" else "left")
BASE_W = int(hue.group(2))
ok(True, f"the coloured edge is border-{SIDE}, {BASE_W}px on the base flap", None)

# ── the two lower tiers step that same edge down ───────────────────────────
EXPECTED = {".cahier-tab--sm": 5, ".cahier-tab--xs": 4}
widths = [BASE_W]
for sel, want in EXPECTED.items():
    block = rule(sel)
    ok(block is not None, f"`{sel}` found",
       f"`{sel}` has no rule — the rail's tier below the base one has lost its "
       f"size step entirely")
    if block is None:
        continue

    on_side = re.search(rf"border-{SIDE}-width\s*:\s*(\d+)px", block)
    on_other = re.search(rf"border-{OTHER}-width\s*:\s*(\d+)px", block)

    ok(on_side is not None,
       f"{sel} steps border-{SIDE} down",
       f"{sel} sets no `border-{SIDE}-width`, so it inherits the base {BASE_W}px "
       f"and is indistinguishable from a site row. This is exactly the be0930c "
       f"regression: the declaration exists but names the wrong side.")
    ok(on_other is None,
       f"{sel} leaves border-{OTHER} alone",
       f"{sel} sets `border-{OTHER}-width: {on_other.group(1) if on_other else '?'}px`. "
       f"The hue is on border-{SIDE}, so this thickens the plain grey edge on the "
       f"opposite side — a stray rule nothing asked for, and the visible half of "
       f"the be0930c regression.")
    if on_side:
        w = int(on_side.group(1))
        widths.append(w)
        ok(w == want, f"{sel}: {w}px", f"{sel} is {w}px on the coloured edge, expected {want}px")

ok(widths == sorted(widths, reverse=True) and len(set(widths)) == len(widths),
   f"the three tiers are strictly thinner down the rail: {widths}",
   f"the tier widths are {widths} — they must decrease strictly, or two tiers "
   f"read as the same rank and the hierarchy is not visible")

for line in PASS:
    if line: print(f"  ok  {line}")
for line in FAIL: print(f"FAIL  {line}")
print(f"\n{len([p for p in PASS if p])} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
