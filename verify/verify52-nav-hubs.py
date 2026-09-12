#!/usr/bin/env python3
"""
Every bottom-bar slot opens its FAMILY, not one member of it.

Dan, 2026-08-30: "i think it is extremely odd that the bottom row of icons are
in different colors every single time. Can we first establish if those are
really the five that we need anchored below? The most likely shortcuts needed
by learners should go there."

The five slots were already his (2026-08-22, `BOTTOM_NAV` = the families minus
User). What was wrong was where two of them GO. `BOTTOM_NAV` takes each href
straight from `FAMILIES`, and four families already had a hub page under
another name — Goals is Home, Practice is the map, Review is the Reviser, User
is /moi. SvPlay and Skills had none, so their href named one arbitrary member:

    svplay  ->  /games/vocabularain     one game of four
    skills  ->  /conjugaison            one activity of six

A learner tapping 🎮 got VocabulaRain whether or not that is what they wanted,
and NumBus, NumBourse and LexicaLater had no shortcut at all. /games and
/skills are the pages that were missing.

This is the check that keeps it that way. It fails if a family's door is an
activity's door, if a door leads to a route that does not exist, if a hub is
missing its colour wiring, or if a hub would render empty.

Run from the repo root:  python3 verify/verify52-nav-hubs.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)

def read(rel):
    # "" for a missing file, so a DELETED hub page is reported by name instead
    # of raising FileNotFoundError. Deleting src/app/practice/page.tsx is
    # exactly what this suite exists to catch, and until 1 Sep it answered with
    # a traceback — the same fault verify58 had, found the same way.
    p = os.path.join(ROOT, rel)
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

def nocomment(src):
    """Strip comments. A rule that a comment can satisfy is not a rule — a
    docstring naming `/games/vocabularain` must not be able to pass or fail
    an assertion about the code."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)

ACT = read("src/content/activities.ts")
ACT_C = nocomment(ACT)

# ── the registry, parsed rather than retyped ─────────────────────────────────
FAMILIES = re.findall(
    r'\{\s*key:\s*"([a-z]+)",\s*name:\s*"([^"]+)",\s*emoji:\s*"([^"]+)",\s*href:\s*"([^"]+)"\s*\}',
    ACT_C)
# SEVEN since 2026-09-09 — Skills retired, split into Oral and Tools (see
# activities.ts FAMILIES and AGENTS.md).
ok(len(FAMILIES) == 7, "seven families parsed from the registry",
   f"expected 7 families, parsed {len(FAMILIES)} — has the shape of FAMILIES changed?")

ACTIVITIES = re.findall(
    r'\{\s*key:\s*"([a-z]+)",\s*name:\s*"([^"]+)",\s*(?:short:\s*"[^"]*",\s*)?emoji:\s*"[^"]*",\s*'
    r'family:\s*"([a-z]+)",\s*href:\s*(?:"([^"]+)"|null)', ACT_C)
# Floor moved 31 Aug — Dan's 16 (4x4): Sorting, iComplete, NumBus/NumBourse
# (one Numbers hub) and My Progress all left the tile grid.
ok(len(ACTIVITIES) >= 16, f"{len(ACTIVITIES)} activities parsed from the registry",
   f"only {len(ACTIVITIES)} activities parsed — has the shape of ACTIVITIES changed?")

act_hrefs = {h for _, _, _, h in ACTIVITIES if h}

# ── 1 · no family door is an activity door BY ACCIDENT ──────────────────────
# The whole point. /games and /games/vocabularain differ by one path segment
# and by everything that matters. A family may still open one activity, but
# only where the registry says so and says why — otherwise "the door a learner
# needs" and "whatever sorted first" are the same line of code.
door = re.search(r"DELIBERATE_DOOR:\s*Record<[^>]*>\s*=\s*\{([^}]*)\}", ACT_C)
DELIBERATE = dict(re.findall(r'(\w+):\s*"([a-z]+)"', door.group(1))) if door else {}
for key, name, _emoji, href in FAMILIES:
    owner = next(((k, n) for k, n, _f, h in ACTIVITIES if h == href), None)
    if owner is None:
        PASS.append(f"{name} opens the family, not one activity ({href})")
    else:
        ok(DELIBERATE.get(key) == owner[0],
           f"{name} deliberately opens {owner[1]} ({href}), as the registry records",
           f"{name}'s shortcut opens {owner[1]} ({href}) — a family door may only be "
           f"one member's door where DELIBERATE_DOOR names it and says why")

# A deliberate door must name a real activity IN that family, or it is a note
# that has quietly stopped describing the code.
for fam, act_key in DELIBERATE.items():
    hit = next(((k, f) for k, _n, f, _h in ACTIVITIES if k == act_key), None)
    ok(hit is not None and hit[1] == fam,
       f"DELIBERATE_DOOR: {fam} -> {act_key} names an activity in that family",
       f"DELIBERATE_DOOR says {fam} opens \"{act_key}\", which is "
       + ("in family " + hit[1] if hit else "not an activity at all"))

# ── 2 · every door leads somewhere that exists ──────────────────────────────
# `output: \"export\"` means a dead href is a 404 in the built bundle, not a
# redirect the server can paper over.
for key, name, _emoji, href in FAMILIES:
    seg = href.strip("/")
    page = os.path.join("src", "app", *seg.split("/"), "page.tsx") if seg else "src/app/page.tsx"
    ok(os.path.exists(os.path.join(ROOT, page)),
       f"{name} -> {href} is a real route",
       f"{name} points at {href}, but {page} does not exist")

# ── 3 · no family has a hub page of its own left ────────────────────────────
# ALL THREE HUBS ARE RETIRED NOW (2026-09-09): Skills first, then Practice,
# then Games (Dan hedged on Games as "nearly all" of the hub pages being
# redundant, then confirmed it: "retire /games"). Each retired hub's route
# still exists — it redirects rather than disappearing outright, so a
# bookmark or an old link still lands somewhere — but none of them renders
# <FamilyHub> any more, and FAMILY_HUBS is empty.
#
# THE COMPONENT ITSELF IS GONE TOO (Dan, 2026-09-11: *"delete FamilyHub"*).
# It had been rendered by nothing since the three hubs were retired on 9 Sep —
# dead code carrying a hard two-column grid, which is exactly the kind of file
# a later session restyles without noticing that the page it draws does not
# exist. The rows below already fail if a retired route starts rendering
# <FamilyHub>; this one fails if the file comes back without a route.
ok(not os.path.exists("src/components/FamilyHub.tsx"),
   "FamilyHub.tsx is gone — no family has a hub page to draw",
   "src/components/FamilyHub.tsx is back. Every family hub redirects to its "
   "DELIBERATE_DOOR (9 Sep) and FAMILY_HUBS is empty, so this component has "
   "no page to render — delete it, or restore a hub on purpose and say so.")

# ── EVERY DOOR IN THE ☰ IS A LINK TO A PAGE ────────────────────────────────
#
# Dan, 2026-09-12: *"replace all the pop ups for activities by actual pages (no
# more pop ups for going into those activities)"*.
#
# On 9 Sep seven tiles traded a hub page for a pop-up: six opened a 1-to-50
# slider, one a two-choice card. The reasoning recorded at the time was that
# the hubs had been "made redundant". What it missed is that a family HUB and
# an activity's own CHOOSER were never the same page, and only the hubs went —
# every one of those activities still had a real page listing what it can play,
# and had throughout:
#
#   MémoiRecall   /practice/flip-it        ActivityLanding, fifty stops
#   GramMarathon  /practice/grammarathon   ActivityLanding, fifty stops
#   WorDrill      /practice/wordrill       its own page
#   VocabulaRain  /games/vocabularain      every set, folded by unit
#   LexicaLocker  /games/lexicalater       every deck, folded by unit
#   ComposeIt     /games/compose           every bank, folded by unit
#   Numbers       /games/numbers           NumBus and NumBourse — Dan's own
#                                          hub-tab from 31 Aug
#
# So carrying this out wrote no page at all: the tiles stopped intercepting
# the click. Three of those pages were only HALF true when this was written —
# VocabulaRain, LexicaLocker and ComposeIt each showed one card and a "Choose
# another" button that opened a bottom sheet, so the pop-up had not gone, it
# had moved a click later. Dan spotted it in a screenshot the same day ("do
# those three") and verify23 item 8 now holds their shape. These rows are what
# stops a pop-up growing back in front of a page that already works.
ok(not os.path.exists("src/components/ActivityGoalPicker.tsx"),
   "the activity pop-ups are gone — every ☰ door is a link",
   "src/components/ActivityGoalPicker.tsx is back. Dan retired the slider and "
   "two-choice pop-ups on 2026-09-12: an activity is entered through its own "
   "page, not a card in front of one.")

MENU_SRC = read("src/components/MenuGrid.tsx")
for gone, what in (("openSlider", "the 1-to-50 goal slider"),
                   ("openTwoChoice", "the two-choice card"),
                   ('kind: "picker"', "the picker cell kind"),
                   ('kind: "numbers"', "the numbers cell kind")):
    ok(gone not in nocomment(MENU_SRC),
       f"MenuGrid has no {what}",
       f"MenuGrid is calling {what} again — a door that opens a pop-up instead "
       f"of navigating (Dan, 2026-09-12)")

# lib/activityStops.ts existed ONLY to gate and route that slider, and went
# with it. `lib/indexMatrix.cellHref` is the gate the landing pages use and is
# untouched, so the app kept one implementation of "can this activity play
# this stop" instead of two.
ok(not os.path.exists("src/lib/activityStops.ts"),
   "the slider's own stop gate is gone; cellHref is the one left",
   "src/lib/activityStops.ts is back. It existed only to gate and route the "
   "goal slider; the landing pages gate themselves through indexMatrix's "
   "cellHref, and two implementations of the same question is what this repo "
   "keeps learning not to keep.")

hubs = re.search(r"FAMILY_HUBS[^=]*=\s*\{([^}]*)\}", ACT_C)
ok(hubs is not None, "FAMILY_HUBS is declared", "FAMILY_HUBS has gone from activities.ts")
hub_keys = dict(re.findall(r'(\w+):\s*"([a-z]+)"', hubs.group(1))) if hubs else {}
ok(hub_keys == {},
   "FAMILY_HUBS is empty — no family has a hub page of its own any more",
   f"FAMILY_HUBS is {hub_keys or 'unreadable'}, expected empty — every family's "
   "hub retired 2026-09-09")
for retired_route in ("src/app/skills/page.tsx", "src/app/practice/page.tsx", "src/app/games/page.tsx"):
    body = nocomment(read(retired_route))
    ok("<FamilyHub" not in body,
       f"{retired_route} no longer renders <FamilyHub> — its hub is retired",
       f"{retired_route} still renders <FamilyHub> — FAMILY_HUBS says it "
       "shouldn't be a hub any more")

# ── 4 · a hub page must be COLOURED, or it is a white page with a white band ─
site_fam = re.search(r"SITE_FAMILY:\s*Record<[^>]*>\s*=\s*\{(.*?)\n\};", ACT_C, re.S)
site_keys = dict(re.findall(r'(\w+):\s*"([a-z]+)"', site_fam.group(1))) if site_fam else {}
for k, fam in hub_keys.items():
    ok(site_keys.get(k) == fam,
       f"familyOf(\"{k}\") returns {fam}, so the hub is painted",
       f"SITE_FAMILY has no \"{k}\" -> \"{fam}\": familyOf returns null there and the "
       f"hub renders with no family colour and no band at all")

# ── 5 · a hub with nothing in it is a dead end ──────────────────────────────
for k, fam in hub_keys.items():
    n = len([1 for _key, _n, f, h in ACTIVITIES if f == fam and h])
    # Two is the floor and Practice sits exactly on it: SpecuLearn and 4Mémoire
    # have doors, Memo is reached from a stop and has none. A third would make
    # this comfortable; a second going away would make the hub a redirect.
    ok(n >= 2, f"the {fam} hub lists {n} activities",
       f"the {fam} hub would list {n} activities — a hub for one thing should be "
       f"that thing's page instead")

# ── 6 · the bar still derives from the families, all five of them ───────────
NAV = nocomment(read("src/content/nav.ts"))
ok('FAMILIES.filter((f) => f.key !== "user")' in NAV,
   "BOTTOM_NAV is still the families minus User, derived not retyped",
   "BOTTOM_NAV no longer derives from FAMILIES — the bar, the rail and the "
   "Menu can now disagree about what the five shortcuts are")
ok("familyShort(f)" in NAV,
   "the bar's short labels come from familyShort()",
   "nav.ts spells the \"FluOlin \" strip out itself again — that regex now "
   "lives in familyShort(), used by the bar and the hub headings alike")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
