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
  7  AND EVERY STUDY–TEST SWITCH IS THIS SWITCH. Dan, 1 Sep: *"the study-test
     switch should be redone like the 2D 3D switch."* There were TWO of them —
     the deck table's and Flip It's — and only the first was found, so for a
     day the app had the new pill on one screen and the old bare knob with
     « Study » printed beside it on the other. Nothing about either screen
     alone looked wrong, which is the same shape as the 91-route chrome sweep:
     a uniformity fault is only visible between screens. Pinned by SHAPE, not
     by a list of files — it fails on the next surface that hand-rolls one.

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
# THE SWITCH MOVED, 1 Sep, and this file follows it. It was `ViewSwitch`,
# written inside HomeDashboard; Dan then asked for the deck's study–test
# control to be "redone like the 2D 3D switch", so it became
# components/PillSwitch.tsx and Home is one of two callers now. Every claim
# below is unchanged — the geometry, the label that swaps ends, the navigation
# — only where each lives moved.
PILL = "src/components/PillSwitch.tsx"

home, mapb, view = code(read(HOME)), code(read(MAPB)), code(read(VIEW))
pill = code(read(PILL))
ok(bool(home) and bool(mapb), "Home and the map body exist", f"{HOME} or {MAPB} is missing")

# ---- 1 · ONE ROW, AND WHAT SITS WHERE IN IT -------------------------------
#
# THIS RULE HAS BEEN REWRITTEN, NOT WEAKENED. It used to pin TWO rows — the
# counter beside « Next: … » above, the switch beside the keys below — which is
# the arrangement Dan asked for on 1 Sep ("we swap the positions of the four
# buttons and the next stop's name").
#
# He retired it on 2026-09-07: *"can we squeeze the 1/50 into between 2D and
# Play, but in smaller space of course. Then we can take out the 'Next...'."*
# « Next: Introductions » named the stop that the ▶ key opens and that the map
# below highlights — a third telling — and it cost a whole band of the hero to
# do it. So row A is gone and the counter moved down between the switch and the
# keys, which is the order pinned here.
#
# Positional, not by name: `<PillSwitch` appearing anywhere in the file says
# nothing about where it is. These indices say it.
i_switch = home.find("<PillSwitch")
i_dl = home.find("<dl")
i_keys = home.find('aria-label={`Continue')
ok(min(i_switch, i_dl, i_keys) > 0,
   "the switch, the counter and the Continue key are all on the page",
   "one of the three pieces of the control row is missing from Home")
ok(i_switch < i_dl < i_keys,
   "the row reads 2D · 1/50 · the keys — the counter between the switch and Play",
   "the counter is no longer between the 2D switch and the keys (Dan, 7 Sep)")
ok("Next:" not in home,
   "« Next: … » is gone — the ▶ key and the map already name that stop",
   "« Next: … » is back on Home. Dan took it out on 7 Sep as a third telling of "
   "the stop the Continue key opens and the map highlights.")

# ---- 2 · the label lives inside the switch --------------------------------
# GUARDED, because `str.find` returns -1 and a negative slice is non-empty —
# the unguarded version made "the switch is its own component" true even when
# the component had been renamed away. Break-testing caught it.
i_fn = pill.find("export default function PillSwitch(")
sw = pill[i_fn:] if i_fn >= 0 else ""
ok(bool(sw), "the switch is its own shared component",
   "PillSwitch is gone — nothing draws the track, the label or the knob")
ok('const name = on ? onLabel : offLabel;' in sw and "{name}" in sw,
   "the switch renders its own state as text, inside the track",
   "the switch no longer draws a label; Dan asked for the labels transferred INTO the switch")
# AND HOME STILL NAMES ITS TWO STATES. The component is generic now, so the
# labels moved to the caller — an assertion that only read the component would
# pass with Home passing nothing at all.
ok(re.search(r'offLabel="2D"', home) is not None and re.search(r'onLabel="3D"', home) is not None,
   "Home's switch is still labelled « 2D » / « 3D »",
   "Home no longer passes the two view labels — the pill would render empty")
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
# RE-POINTED 2 Sep (re-applied here after the PillSwitch relocation): the
# 1 Sep "make sure the switch literally takes you the map it promises to"
# gave way, one day later and looking at the hero, to "this needs to stay
# on screen when users tap 2D>3D>2D and so on. The separate map interface
# is for fuller-screen map." The visible consequence is the postcard
# flipping below; the flip no longer navigates.
ok("router.push(" not in flip,
   "flipping the switch stays on Home — the postcard flips instead",
   "the switch navigates again; Dan (2 Sep): toggling 2D>3D>2D must stay on screen")
ok("view3d ? (" in home and "<HomeMap3D" in home,
   "the postcard renders the view the switch names",
   "the switch flips a value the postcard ignores — a control with no visible consequence, the 1 Sep complaint reborn")
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

# ---- 7 · both study–test switches are this switch --------------------------
# `cahier-modeswitch` is the old bare-knob control. It legitimately survives on
# FlashcardLesson's 🔊 and 🔀 toggles, which are not two named STATES of one
# property — they are two independent on/offs, and a pill that reads « 🔊 » in
# both positions would say nothing. What must not come back is a study–test
# control built out of it: this looks for the old shape STANDING NEXT TO the
# words, which is precisely what Dan asked to be replaced.
STUDYTEST = (
    "src/app/decks/[id]/CuratedDeckTable.tsx",
    "src/app/practice/flip-it/[collectionId]/FlipItContent.tsx",
)
for path in STUDYTEST:
    body = code(read(path))
    ok(bool(body), f"{os.path.basename(path)} exists", f"{path} is missing")
    ok("<PillSwitch" in body,
       f"{os.path.basename(path)}'s study–test control is the shared pill",
       f"{path} does not use PillSwitch — Dan asked for the study-test switch redone like the 2D/3D one")
    ok('offSpoken="Study"' in body and 'onSpoken="Test"' in body,
       f"and it still SAYS « Study » / « Test » to a screen reader",
       f"{path}'s pill shows 📖/✍️ with nothing spoken — an emoji is a fine thing to look at "
       "and a useless thing to be read aloud")
    ok("cahier-modeswitch" not in body,
       f"{os.path.basename(path)} has no hand-rolled knob left over",
       f"{path} still draws the old cahier-modeswitch beside the new pill")

# THE CAPTION IS GONE FROM BOTH, which is the half of the ask the pill does not
# do by itself: a pill with « Study » still printed next to it is the same
# control it was, plus a track.
for path in STUDYTEST:
    body = code(read(path))
    ok(re.search(r'>\s*\{test \? "Test" : "Study"\}\s*<', body) is None,
       f"{os.path.basename(path)} prints no « Study »/« Test » caption outside the track",
       f"{path} still captions the switch from outside — that names the property and not the "
       "state, and the litmus test deletes it")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
