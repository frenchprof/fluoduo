#!/usr/bin/env python3
"""
Home, rebuilt in soft 3D — pinned (Dan's draft, 2026-08-26).

Two surfaces carry the whole page: the readings are WELLS pressed into the
paper, the actions are PILLOWS standing out of it, and a press inverts the
pillow into its own well. Depth is the affordance, so no control needs a
border or a word to say it is pressable.

And one rule of navigation, in Dan's words: "one must first choose the stop
before they can access the activity." The nine-square key opens the
activities OF THE CURRENT STOP, built from deckActivityTabs(collectionId), so
every door in it is already pointed at the stop the learner is on. The old
twenty-tile Menu asked "which activity?" before anyone had been asked "which
stop?", and then had to ask again.

Run from the repo root:  python3 verify/verify37-home.py
"""
import os, re, sys

PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read()
def strip_comments(s):
    return re.sub(r"//[^\n]*", "", re.sub(r"/\*[\s\S]*?\*/", "", s))

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

css = re.sub(r"/\*[\s\S]*?\*/", "", read("src/app/globals.css"))
home = strip_comments(read("src/app/HomeDashboard.tsx"))
sheet = strip_comments(read("src/components/StopSheet.tsx"))

# 1 · the two surfaces exist and mean opposite things
ok(".neo-well" in css and ".neo-key" in css,
   "both surfaces are defined: .neo-well and .neo-key",
   "the soft-3D surfaces are missing")
well = re.search(r"\.neo-well\s*\{([^}]*)\}", css)
ok(well and "inset" in well.group(1),
   "a well is INSET — pressed into the paper",
   "the well is not inset, so it does not read as recessed")
ok(re.search(r"\.neo-well[^{]*:hover", css) is None,
   "a well has no hover — it is read-only by construction",
   "a well responds to hover, which offers a press that does nothing")
act = re.search(r"\.neo-key:active\s*\{([^}]*)\}", css)
ok(act and "inset" in act.group(1),
   "pressing a key INVERTS it into its own well",
   "a pressed key does not invert — the affordance is not carried by depth")
ok(re.search(r"\.neo-key:focus-visible", css) is not None,
   "a key has a visible focus ring for the keyboard",
   "a key has no focus-visible style")
ok("prefers-reduced-motion" in css and re.search(
       r"prefers-reduced-motion[^}]*\}[^@]*?\.neo-key", css, re.S) is not None
   or ".neo-key, .neo-key:hover, .neo-key:active" in css,
   "the key's motion is dropped under prefers-reduced-motion",
   "the key animates regardless of prefers-reduced-motion")

# 2 · no borders: the draft's point is that shadow replaces the box
for sel in ("neo-well", "neo-key"):
    blk = re.search(rf"\.{sel}\s*\{{([^}}]*)\}}", css)
    ok(blk and "border: 0" in blk.group(1),
       f".{sel} carries no border — the shadow does that work",
       f".{sel} still draws a border")

# 3 · the welcome is a STRIP, not a card
ok(".home-strip" in css and "linear-gradient" in re.search(r"\.home-strip\s*\{([^}]*)\}", css).group(1),
   "the welcome is an edge-to-edge gradient strip",
   "the welcome strip is missing or has no gradient")
ok("home-strip" in home, "Home renders the strip", "Home does not render the strip")
ok('aria-label="Your progress"' not in home,
   "the old report-card section is gone",
   "the report-card section survives — the draft replaced it")

# 4 · STOP BEFORE ACTIVITY. This is the rule, so it gets the most checks.
ok("MenuSplash" not in home,
   "Home no longer opens the stop-less twenty-tile Menu",
   "Home still opens MenuSplash — the activity is reachable without a stop")
ok("StopSheet" in home, "Home opens the stop's own activities",
   "Home does not open a StopSheet")
ok("deckActivityTabs" in sheet,
   "the sheet is BUILT from the stop's deck, so every door is already aimed",
   "the sheet does not use deckActivityTabs — its links cannot be stop-scoped")
ok("collectionId" in sheet and "collectionId" in home,
   "the stop's deck is threaded from Home into the sheet",
   "no deck is passed — the sheet cannot know which stop it is for")
ok("activeSio?.collectionId" in home,
   "a stop with no deck cannot open the sheet (the key is disabled)",
   "the sheet can open on a stop with no deck, which would list nothing")
ok("bandOf" in sheet,
   "each row wears its demand band (verify36)",
   "the sheet does not colour its rows by band")

# 5 · the three keys are the dopamine roles, and Rewind sinks when nothing is due
for role in ("--dopa-win", "--dopa-focus", "--dopa-reward"):
    ok(role in home, f"a key carries {role}", f"no key carries {role}")
ok('aria-disabled="true"' in home,
   "Rewind is flat and inert when nothing is waiting",
   "Rewind offers a press with nothing behind it")

# 6 · it must FIT a phone. The draft sizes the phone down on purpose; a row
#     that overflows is the exact failure Dan called out on 21 Aug ("must not
#     go hiding into the overspill off the screen"). Measured live at
#     320/360/390/430 px — nothing clipped, scrollWidth == viewport — and the
#     responsive classes that make that true are pinned here.
ok("sm:h-[58px]" in home and "h-[50px]" in home,
   "the keys are 50px on a phone and 58px from sm",
   "the keys are one size — the row overflowed at 390px before this")
ok("sm:min-w-[80px]" in home and "min-w-[64px]" in home,
   "the wells are narrower on a phone",
   "the wells do not shrink — the row will not fit 320px")

# 7 · the ruler stayed deleted ("the map already shows where you are")
ok("pct" not in home,
   "no second progress line — the map is the one place that says where you are",
   "a percentage figure is back on Home")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
