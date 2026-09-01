#!/usr/bin/env python3
"""
Home's two control rows, and a view switch that actually opens the map.

Dan, 2026-09-01, in one sentence with four asks in it: *"can we transfer the
labels of the 3D switch into the switch itself, like this, then move it to the
left under the 4/30, then we swap the positions of the four buttons and the
next stop's name: the buttons down and the name of the next stop up. and while
at that make sure the switch literally takes you the map it promises to."*

WHAT WAS WRONG WITH EACH.

  THE LABEL. « 3D view » sat OUTSIDE the track, so it named the property and
  not the state: a knob to the right of the words "3D view", sitting off, does
  not say whether you are about to get 3D. Two characters inside the track say
  it exactly, and the caption's removal then costs a learner nothing — which is
  the litmus test's whole test.

  THE ROWS. The counter sat with the four keys and the destination's NAME sat
  with the switch, so each row held one thing to read and one thing to press,
  and neither row had a subject. Swapped, row A is where you are and where you
  are going, row B is what you can do about it.

  THE PROMISE, and this was a real defect rather than a layout opinion. Home's
  switch started at 2D on EVERY visit, whatever the learner had chosen, and its
  map link carried `?view=2d` — which /map then saved. So choosing 3D on the
  map, going Home and coming back put you in 2D, and the thing that changed
  your mind was a control that looked like it was only reporting the state.
  Home now reads and writes the same store the map does, and flipping the
  switch OPENS the map in the view it names: it is across the page from the map
  card now, so a control naming a view and doing nothing visible is a dead end.

WHAT IS PINNED, and why each would fail silently

  1  ROW A holds the counter and « Next: … »; ROW B holds the switch and the
     keys. A swap that half-lands looks fine in a diff.
  2  The label is INSIDE the button, and the old external caption is gone.
  3  The switch navigates, through the shared href helper — a hand-spelt
     `/map?view=` here and a reader over there is exactly how the promise broke
     the first time.
  4  ONE store for the view. Three surfaces set it; a second copy of the key is
     how they start disagreeing (the `gapSentence` lesson, again).
  5  /map still READS `?view=` — without that the switch navigates and lands in
     the wrong view, and every other check here would still pass.
  6  THE ARITHMETIC. The knob's travel must equal track − padding − knob, or the
     knob stops short of the end or runs past it; and the switch plus the four
     keys must fit 360px, or Dan's two rows silently become three. Both numbers
     are read out of the source and recomputed here, never asserted twice.

Run from the repo root:  python3 verify/verify80-home-view-switch.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped.

    Every file here EXPLAINS this change at length — "3D view", "?view=",
    "under the counter" and "the buttons down" all appear in prose describing
    it. A raw scan would pass on the documentation, and worse, would let a real
    regression hide behind the words that excuse it.
    """
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

HOME = "src/app/HomeDashboard.tsx"
MAPB = "src/app/map/MapBody.tsx"
VIEW = "src/lib/mapView.ts"

home, mapb, view = code(read(HOME)), code(read(MAPB)), code(read(VIEW))
ok(bool(home) and bool(mapb), "Home and the map body exist", f"{HOME} or {MAPB} is missing")

# ---- 1 · the rows, and which control sits in which ------------------------
# Positional, not by name: `<ViewSwitch` appearing anywhere in the file says
# nothing about which row it is in. These indices say it.
i_dl = home.find("<dl")
i_next = home.find("Next:")
i_switch = home.find("<ViewSwitch")
i_keys = home.find('aria-label={`Continue')
ok(min(i_dl, i_next, i_switch, i_keys) > 0,
   "the counter, « Next: … », the switch and the Continue key are all on the page",
   "one of the four pieces of the two rows is missing from Home")
ok(i_dl < i_next < i_switch,
   "ROW A is the counter then « Next: … », and the switch comes after both",
   "« Next: … » is no longer between the counter and the switch — the swap Dan asked for has come undone")
ok(i_switch < i_keys,
   "ROW B is the switch then the four keys — the switch on the left, under the counter",
   "the four keys come before the switch; Dan put the switch on the left, under the counter")
# The two must be SEPARATE rows, or "up" and "down" mean nothing. Row A's
# container closes before the switch's opens.
between = home[i_next:i_switch]
ok(between.count("</div>") >= 1,
   "the two rows are two containers — row A closes before row B opens",
   "the counter, the name, the switch and the keys are in one flex row again; nothing is 'up' or 'down'")

# ---- 2 · the label lives inside the switch --------------------------------
# GUARDED, because `str.find` returns -1 and `home[-1:]` is a non-empty string
# — so the unguarded slice made "the switch is its own component" true even
# when ViewSwitch had been renamed away. Break-testing caught it.
i_fn = home.find("function ViewSwitch(")
sw = home[i_fn:] if i_fn >= 0 else ""
ok(bool(sw), "the switch is its own component", "ViewSwitch is gone — nothing draws the track, the label or the knob")
ok(re.search(r'const name = on \? "3D" : "2D"', sw) is not None and "{name}" in sw,
   "the switch renders its own state as text — « 2D » / « 3D » inside the track",
   "the switch no longer draws a label; Dan asked for the labels transferred INTO the switch")
ok('id="view-switch-label"' not in home and '"3D view"' not in home and ">\n          3D view" not in home,
   "the external « 3D view » caption is gone",
   "the caption outside the track is back — it names the property and not the state, and the litmus test deletes it")
# The label must be pinned to the END THE KNOB IS NOT AT, or it sits under it.
ok(re.search(r'\[on \? "left" : "right"\]', sw) is not None,
   "the label swaps ends with the knob, so it is never underneath it",
   "the label is pinned to one side regardless of state — the knob covers it in one of the two positions")

# ---- 3 · it navigates, through the shared helper --------------------------
i_flip = home.find("onFlip={")
flip = home[i_flip:i_flip + 700] if i_flip >= 0 else ""
ok("router.push(mapHref(" in flip,
   "flipping the switch opens the map, in the view it names",
   "the switch sets a value and stops — Dan: 'make sure the switch literally takes you the map it promises to'")
ok("saveMapView(" in flip,
   "the choice is remembered",
   "the flip is not persisted; coming back Home would show the other view")
ok(re.search(r'href=\{`?/map\?view=', home) is None,
   "no hand-spelt /map?view= anywhere in Home",
   "Home spells the query itself again; the helper exists so the writer and the reader cannot drift apart")
ok("mapHref(" in home,
   "the map card's link comes from the same helper",
   "the card no longer uses mapHref — two spellings of one query is how this broke the first time")

# ---- 4 · one store for the view ------------------------------------------
ok(re.search(r'MAP_VIEW_KEY = "fluo\.homeMapView"', view) is not None,
   "lib/mapView.ts owns the storage key",
   "the shared module does not define the key")
ok("loadMapView()" in home,
   "Home seeds the switch from the SAVED choice",
   "Home starts the switch at 2D whatever the learner chose — the defect Dan's last clause names")
ok('"fluo.homeMapView"' not in home and '"fluo.homeMapView"' not in mapb,
   "neither surface carries its own copy of the key",
   "the storage key is spelt in a second place; the surfaces will eventually disagree about it")
# THE CALL, not the name — `"loadMapView" in mapb` is satisfied by the import
# line that brings it in, which is the vacuous shape this repo has now caught
# six times. Break-testing found it here: replacing the call with a raw
# localStorage read left the import standing and the assertion passing.
ok("loadMapView()" in mapb and "saveMapView(" in mapb,
   "the map CALLS the shared reader and writer",
   "the map has its own storage access again — the two ends of one setting, kept apart")

# ---- 5 · and /map still honours ?view= ------------------------------------
# The cross-check that gives the switch's navigation any meaning at all.
ok(re.search(r'URLSearchParams\(window\.location\.search\)\.get\("view"\)', mapb) is not None,
   "/map still reads ?view= — the view the switch promises is the view it gets",
   "/map ignores ?view=; the switch would navigate and land in whichever view was saved")

# ---- 6 · the arithmetic ---------------------------------------------------
def px(pattern, src, what):
    m = re.search(pattern, src)
    if not m:
        FAIL.append(f"cannot read {what} out of the source — the check below is guessing")
        return None
    return int(m.group(1))

track = px(r"w-\[(\d+)px\] shrink-0 items-center rounded-full p-\[(?:\d+)px\]", sw, "the track width")
pad = px(r"rounded-full p-\[(\d+)px\]", sw, "the track padding")
knob = px(r"neo-key block h-\[(\d+)px\]", sw, "the knob size")
travel = px(r'transform: on \? "translateX\((\d+)px\)"', sw, "the knob travel")
if None not in (track, pad, knob, travel):
    ok(travel == track - 2 * pad - knob,
       f"the knob's travel is exactly the room it has ({track} − 2×{pad} − {knob} = {travel})",
       f"the knob travels {travel}px but has {track - 2 * pad - knob}px of room — it stops short of the end or runs past it")

# Dan's two rows stay two rows at 360. The key group is read from the source
# too, so a key that grows re-does this sum rather than quietly wrapping.
keyw = px(r"neo-key grid h-\[(\d+)px\] w-\[\d+px\] place-items-center rounded-\[13px\]", home, "the key size")
keygap = px(r'className="flex shrink-0 items-center gap-(\d)(?: sm:gap-2)?"', home, "the key gap step")
if None not in (track, keyw, keygap):
    # tailwind gap-N is N × 4px
    group = 4 * keyw + 3 * (keygap * 4)
    total = track + 8 + group          # 8px = gap-x-2 between the switch and the group
    ok(total <= 272,
       f"the switch and the four keys fit one row on a 360px phone ({track} + 8 + {group} = {total} ≤ 272)",
       f"the switch and the keys need {total}px and a 360px phone has 272 — the keys wrap onto a third line "
       "and Dan's two rows become three")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
