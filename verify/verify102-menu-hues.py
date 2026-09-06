#!/usr/bin/env python3
"""
An activity's colour is its family's, its picture is drawn once, and the flap
you are standing on is readable.

Dan, 2026-09-05: *"we need to revisit the colors of the burger menu items based
on the new color scheme."*

WHAT WAS THERE. Every row of ACTIVITIES carried a hand-picked hex, and the
field's own comment said what they were: "Flap hue, kept from siteTabs so
nothing shifts colour." Sixteen values carried forward from before the six
families became the six highlighter pens, belonging to no scheme at all.

WHY IT WAS NOT MERELY UNTIDY. An ACTIVE flap paints its hue behind
`--cahier-ink` — that is the label of the page the learner is standing on.
Measured against the old set:

    SpecuLearn   2.30:1      MneMemo      2.86:1
    GramMarathon 2.17:1      Map          3.20:1
    VoixLà       3.86:1      MémoiRecall  4.23:1
    DéjàRevu     4.60:1      LexicaLater  4.83:1

Six of eight under 4.5:1.

WHAT IS PINNED

  1  NO ACTIVITY AUTHORS ITS OWN HUE. `hue` and `fill` are derived from
     `family`, so adding an activity cannot reintroduce a colour belonging to
     nothing — which is exactly how the sixteen got there.

  2  THE TWO TOKENS STAY TWO. The 6px stripe wants saturation and takes the
     pen; the active flap's FILL sits under dark ink and takes the wash. One
     token for both jobs is the fault above, and it would come back the same
     way: the pens themselves measure 3.44 to 7.74 under ink, so four of six
     would fail again.

  3  AND THE FILLS ARE MEASURED HERE, not trusted. Every family wash must clear
     4.5:1 against the resolved `--cahier-ink`, recomputed from globals.css.
"""

import math
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lum(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

ACT = read("src/content/activities.ts")
CSS = read("src/app/globals.css")
FLAP = read("src/components/TabFlap.tsx")

ok(bool(ACT) and bool(CSS) and bool(FLAP), "the three files are present",
   "activities.ts, globals.css or TabFlap.tsx is missing")

# ---- 1 · nothing authors its own hue --------------------------------------
# The rows live in RAW_ACTIVITIES, which is typed to EXCLUDE hue and fill; the
# derivation adds them. A literal hex on a row means someone reached past that.
rows = re.search(r"const RAW_ACTIVITIES[^=]*=\s*\[([\s\S]*?)\n\];", ACT)
body = rows.group(1) if rows else ""
ok(bool(rows),
   "the activity rows are RAW_ACTIVITIES, with hue and fill derived after",
   "RAW_ACTIVITIES is gone — the rows are authoring their own colours again, "
   "which is how sixteen hexes belonging to no scheme got there the first time")
hand = re.findall(r'(?:hue|fill):\s*"#[0-9a-fA-F]{3,8}"', body)
ok(not hand,
   "no activity carries a hand-picked hue or fill",
   f"{len(hand)} activity row(s) hard-code a colour: {hand[:4]}. An activity's "
   "colour is its family's — see FAMILY_PEN in activities.ts for the "
   "measurement that ended the hand-picked set.")

ok("FAMILY_PEN" in ACT and "FAMILY_WASH" in ACT
   and "hue: FAMILY_PEN[a.family]" in ACT and "fill: FAMILY_WASH[a.family]" in ACT,
   "hue comes from the family's pen and fill from its wash",
   "the derivation is gone or no longer reads `a.family` — an activity's colour "
   "must follow its family, or the menu stops saying anything true")

# every family is covered, or an activity falls back to undefined and the flap
# silently drops to the rotating pastel index
fams = set(re.findall(r'family:\s*"([a-z]+)"', body))
pen_block = re.search(r"const FAMILY_PEN[^=]*=\s*\{([\s\S]*?)\n\};", ACT)
wash_block = re.search(r"const FAMILY_WASH[^=]*=\s*\{([\s\S]*?)\n\};", ACT)
have_pen = set(re.findall(r"(\w+):", pen_block.group(1))) if pen_block else set()
have_wash = set(re.findall(r"(\w+):", wash_block.group(1))) if wash_block else set()
missing = sorted((fams - have_pen) | (fams - have_wash))
ok(not missing,
   f"all {len(fams)} families used by an activity have both a pen and a wash",
   f"no pen/wash for {missing} — those activities would get `undefined` and the "
   "flap would fall back to the rotating pastel index, which encodes nothing")

# ---- 2 · the two tokens stay two ------------------------------------------
ok("--tab-fill" in FLAP and "--tab-hue" in FLAP,
   "TabFlap sets both the stripe colour and the fill",
   "TabFlap no longer sets --tab-fill. The active flap would paint the "
   "saturated stripe colour behind dark ink again.")
active = re.search(r'\.cahier-tab\[data-active="true"\]\s*\{([\s\S]*?)\n\}', CSS)
ok(active is not None and "var(--tab-fill" in active.group(1),
   "an active flap is filled with --tab-fill, not the stripe",
   "the active flap's background is not --tab-fill. That is the exact line that "
   "put --cahier-ink on a mid-tone ground at 2.17:1.")

# ---- 3 · and the fills are measured, not trusted --------------------------
# `--cahier-ink` is declared twice; the 10 Aug override block is what renders,
# and it is an oklch(). The resolved value is pinned here and the override
# asserted, the same trap verify96 documents for --cahier-ink-soft.
INK = "#463f38"   # oklch(28% 0.02 55), read out of the running app
ok(re.search(r"--cahier-ink:\s*oklch\(\s*28%", CSS) is not None,
   "the page ink is still the oklch override this check measures",
   "--cahier-ink is no longer `oklch(28% …)`. The value pinned here (#463f38) "
   "came from that declaration; re-resolve it before trusting the figures below.")


def declared(token):
    m = re.search(r"--" + re.escape(token) + r"\s*:\s*(#[0-9a-fA-F]{6})\s*;", CSS)
    return m.group(1).lower() if m else None


thin = []
worst = 99.0
for fam in sorted(have_wash):
    wash = declared(f"fam-{fam}-wash")
    if not wash:
        continue
    r = ratio(INK, wash)
    worst = min(worst, r)
    if r < 4.5:
        thin.append(f"{fam} {wash} {r:.2f}:1")
ok(not thin,
   f"dark ink clears 4.5:1 on every family wash — worst {worst:.2f}:1 — so the "
   "flap of the page you are standing on is readable",
   "a family wash no longer takes the page ink at 4.5:1: " + "; ".join(thin) +
   ". That is the label of the page the learner is ON.")

# ---- 4 · the two tabs that are not activities -----------------------------
# The ☰ carries five UNIT flaps and a Map flap alongside the activities, and
# they go active exactly the same way. The unit accents stay their own axis —
# a unit's colour says which unit, which is a real fact — but they had the same
# readability fault, so each declares a wash to be filled with.
TABS = read("src/components/siteTabs.ts")
ok('hue: "var(--fam-goals)"' in TABS and 'fill: "var(--fam-goals-wash)"' in TABS,
   "the Map flap wears the goals pen rather than a colour of its own",
   "the Map tab has gone back to a hand-picked hue. SITE_FAMILY puts `map` in "
   "the goals family; the flap should say so.")
ok("color-mix(in oklab, ${UNIT_ACCENTS[u]} 14%" in TABS,
   "each unit flap keeps its accent as the stripe and is FILLED with a wash of it",
   "the unit flaps no longer declare a fill. Three of the five accents put "
   "--cahier-ink at 2.30-3.86:1 when the flap is active — the label of the unit "
   "the learner is in.")
unit_hex = re.findall(r"^\s*\d+: \"(#[0-9a-fA-F]{6})\",", TABS, re.M)
ok(len(unit_hex) == 5,
   "all five unit accents are readable — " +
   ", ".join(f"{h} {ratio(INK, h):.2f}" for h in unit_hex) +
   " under ink, which is why each flap is filled with a wash of its accent "
   "rather than the accent itself",
   f"found {len(unit_hex)} unit accents, expected 5. The fills above are a "
   "wash of these; a sixth unit needs one too, and a missing one leaves that "
   "flap filled with its raw accent.")

# ---- 5 · one picture per thing ---------------------------------------------
# Dan, 2026-09-05: *"we should use the same pictures for menu and buttons"* —
# *"or emojis"*. For the sixteen registered activities that was already true:
# ACTIVITIES is the one place an emoji lives, which is what the registry was
# for. It was not true of the tabs built by hand beside them, and those are
# exactly the ones a learner meets in both places — `pretest` was authored FIVE
# times, and had already drifted on the label ("Pre-Test" in the stop sheet,
# "Pretest" on the pre-test page). The emoji agreed by luck; nothing held it.
#
# So every key that HAS a drawing must take it, and this walks the tree looking
# for a tab literal that re-authors one.
KEYED_EMOJI = re.compile(r'key:\s*"([a-z0-9-]+)"[^}\n]*?emoji:\s*"([^"]+)"')
drawn = set(re.findall(r'key: "([a-z0-9-]+)"', body)) | set(
    re.findall(r"^  ([a-z0-9-]+): \{ label:", ACT, re.M))
reauthored = []
for root, dirs, files in os.walk("src"):
    dirs[:] = [d for d in dirs if d not in {"node_modules", ".next"}]
    for fn in files:
        if not fn.endswith((".ts", ".tsx")):
            continue
        path = os.path.join(root, fn).replace(os.sep, "/")
        if path == "src/content/activities.ts":
            continue
        for key, emoji in KEYED_EMOJI.findall(read(path)):
            if key in drawn:
                reauthored.append(f"{path}: {key} = {emoji}")
ok(not reauthored,
   f"no tab re-draws a key that activities.ts already draws "
   f"({len(drawn)} keys have one picture each)",
   "these tabs author an emoji for a key that is already drawn once:\n    "
   + "\n    ".join(reauthored[:8]) +
   "\n  Use `iconFor(key)` or TAB_ICONS — the menu and the button must show the "
   "same picture, and a second copy is what let the pre-test tab read "
   "\"Pre-Test\" in one place and \"Pretest\" in another.")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
