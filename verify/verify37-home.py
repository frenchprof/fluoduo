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

# 2b · EVERY DEPRESSED SHAPE IS OUTLINED (Dan, 1 Sep: "for those depressed items
#      … can you put a thin black outline on the shape of the depressed space,
#      including for the 3D view switch and the buttons that are greyed out
#      because nothing lies underneath").
#
#      A shadow ring, never a `border`: a border adds 2px to both axes, and
#      these wells sit in a row measured to the pixel (four keys and a 64px well
#      have 232px at 320). Checked as an INSET 0 0 0 1px layer for that reason —
#      if someone "fixes" it into a real border the row starts overflowing and
#      nothing else here would notice.
#
#      The disabled key is included because it IS a well — Rewind with nothing
#      waiting — and Dan named it in the same breath. Without the ring a
#      disabled key and a pale key are the same picture.
RING = re.compile(r"inset 0 0 0 1px")
for sel, what in (
    (r"\.neo-well\s*\{", "a well"),
    (r"\.neo-key\[disabled\][^{]*\{", "a key with nothing behind it"),
):
    m = re.search(sel + r"([^}]*)\}", css)
    ok(m and RING.search(m.group(1)) is not None,
       f"{what} carries the thin ring on the shape of the depressed space",
       f"{what} has no ring — a depressed space with no outline is not what Dan asked for")
    ok(m and "border:" not in m.group(1).replace("border: 0", ""),
       f"{what}'s outline is a shadow, not a border — it costs no layout",
       f"{what} draws its outline with a border, which adds 2px to a row measured to the pixel")

# 2c · BUTTONS STAND PROUDER, in z alone (Dan, same message: "greater thickness
#      … no difference to the x and y axis, but the z axis should show the
#      buttons with more protrusion"). The lip is a box-shadow, so nothing about
#      any button's box changes — measured before and after at 320 and 390, the
#      top bar's row height, the burger's position and the icon strip's right
#      edge are identical to the pixel. The two families are pinned at their own
#      depths because they started at different ones (2px and 4px).
lip = re.search(r"\.cahier-btn\s*\{[^}]*box-shadow:\s*0 (\d+)px 0 0", css)
ok(lip and int(lip.group(1)) >= 4,
   f".cahier-btn stands {lip.group(1) if lip else '?'}px proud — the burger included",
   "the site-wide button lip is back under 4px")
flip = re.search(r"\.fluo-btn\s*\{[^}]*box-shadow:\s*0 (\d+)px 0 0", css)
ok(flip and int(flip.group(1)) >= 7,
   f".fluo-btn stands {flip.group(1) if flip else '?'}px proud",
   "the fluo-btn lip is back under 7px")
# A press must travel the WHOLE lip or the button never lands.
act = re.search(r"\.cahier-btn:active\s*\{([^}]*)\}", css)
ok(act and re.search(r"translateY\((\d+)px\)", act.group(1))
   and int(re.search(r"translateY\((\d+)px\)", act.group(1)).group(1)) == int(lip.group(1)),
   "a pressed .cahier-btn travels its whole lip — it lands on the paper",
   "the press does not travel the full lip: a held button floats above the paper and never closes")

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
# THE SHEET RETIRED WITH ITS KEY (Dan, 7 Sep: "we can now remove the red
# button above the map" — the ☰ grid menu lists every activity). The claim
# inverts: the sheet must NOT come back to Home. StopSheet.tsx itself stays
# for /map's deep-link popup path; its Home door is gone.
ok("StopSheet" not in home,
   "Home opens no stop sheet — the ☰ grid is the activities menu",
   "a StopSheet door is back on Home — the red key Dan removed has a ghost")
# MOVED TO THE FAMILY ON 2026-09-11 with everything else that paints (Dan:
# *"the goal sheet keys too, make them family colors"*). The claim is
# unchanged — a row must carry its activity's colour, so a stop's activities
# are not one grey list — only which colour that is. `stripOf` still exists
# and still answers what the exercise demands; nothing paints from it now.
ok("familyOf" in sheet,
   "each row wears its activity's FAMILY colour (verify36)",
   "the sheet does not colour its rows — a stop's activities become one grey list")

# 5 · the keys are the dopamine roles, and Rewind sinks when nothing is due.
# (--dopa-reward left with the ▦ key, 7 Sep — verify32 pins its absence.)
for role in ("--dopa-win", "--dopa-focus"):
    ok(role in home, f"a key carries {role}", f"no key carries {role}")
ok('aria-disabled="true"' in home,
   "Rewind is flat and inert when nothing is waiting",
   "Rewind offers a press with nothing behind it")

# 6 · it must FIT a phone. The draft sizes the phone down on purpose; a row
#     that overflows is the exact failure Dan called out on 21 Aug ("must not
#     go hiding into the overspill off the screen"). Measured live at
#     320/360/390/430 px — nothing clipped, scrollWidth == viewport — and the
#     responsive classes that make that true are pinned here.
#     RESIZED 1 Sep, and the claim is unchanged: the keys have a PHONE size and
#     a larger one from sm, and the phone size is whatever makes the row fit.
#     It was 50px for three keys. Dan's Next-stop key made it four, and 4x50 +
#     3 gaps is 224px against a row that is 232px wide at 320 and 271 at 360 —
#     the `1/50` well went from 64px to 0.4px and was drawn UNDER the keys at
#     both, escaping at 390 by 0.3px. So the literal 50 is gone and the RULE is
#     asserted instead: two sizes, and the phone one between the 44px
#     touch-target floor and 50px. verify25 pins the row's matching wrap.
#     AND THE TWO LITERAL SIZES ARE GONE (Dan, 2026-09-12: "PLEASE NEVER EVER
#     HARD CODE FONT SIZES AND BUTTON SIZES !!!"). The keys read `.home-key`
#     now — one fluid side off `--fs-step` with the 44px touch floor pinned by
#     `max()`, so a phone still gets exactly 44 and a desktop lands on ~58,
#     which is what the old breakpoint jumped to.
#     SO THE CLAIM MOVES FROM THE SPELLING TO THE RULE. Greping for `h-[44px]`
#     could only ever see how the size was typed; what matters is that the
#     floor is a floor and the growth is fluid. Both halves are asserted here,
#     and `verify106-fluidtype` owns the wider ban.
keys = re.findall(r'className=\{?[`"][^`"]*\bhome-key\b[^`"]*[`"]', home)
ok(len(keys) >= 3,
   f"the {len(keys)} keys take their size from .home-key, not from a pixel",
   "the keys no longer carry .home-key — a hard-coded size has come back")
ok(not re.search(r"h-\[\d+px\] w-\[\d+px\] place-items-center", home),
   "no key names its own pixel size",
   "a key is back to a literal h-[NNpx] w-[NNpx]")
rule = re.search(r"\.home-key\s*\{[^}]*\}", css or "", re.S)
body = rule.group(0) if rule else ""
ok("max(44px" in body.replace(" ", "") or "max(44px" in body,
   "the 44px touch floor is pinned with max(), and only the growth above it is fluid",
   ".home-key does not pin the 44px touch-target floor with max() — a key could shrink under a finger")
ok("--fs-step" in body,
   "the key grows with the type ramp rather than at a breakpoint",
   ".home-key does not read --fs-step, so the keys are fixed again")
# THE WELL LEFT THE ROW (Dan, 7 Sep: the editable stop rides the top bar
# now — "so we free up the space between the play rewind etc buttons").
# The fit-at-320 worry the shrink rule answered is gone with it: the row
# holds only the keys. The inverse is the claim now — a well creeping back
# into this row is the regression.
# (Pre-tests built Dan's earlier "squeeze the 1/50 in between" the same
# hour — min-w-[26px]. The later ruling moved the stop to the bar, so BOTH
# shapes of the well are the regression now.)
ok("min-w-[64px]" not in home and "min-w-[26px]" not in home,
   "no well shares the key row — the stop reading rides the top bar",
   "a well is back beside the keys — the row Dan freed on 7 Sep is crowded again")

# 6b · spent hints do not survive a correct answer (Dan, 2026-08-27: "The red
#      error stays after you fix it … 'Not that one, pick again' is still
#      sitting underneath it"). That line is a hint rung in hints.ts, and hints
#      accumulate in help.shown for the life of the card — so the tick landed
#      on top of the advice that produced it. The shell drops them on a correct
#      verdict; a WRONG verdict keeps its hints, because those are what the
#      learner is about to act on.
shell = read("src/components/DrillShell.tsx")
ok('feedback?.kind !== "correct"' in shell,
   "hints are dropped once the answer is right — spent advice does not linger",
   "a correct answer still renders the hints that led to it")

# 7 · the ruler stayed deleted ("the map already shows where you are")
ok("pct" not in home,
   "no second progress line — the map is the one place that says where you are",
   "a percentage figure is back on Home")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
