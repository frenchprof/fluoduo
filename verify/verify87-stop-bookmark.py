#!/usr/bin/env python3
"""The stop bookmark — the learner's word on where they are outranks the
computation (Dan, 2026-09-02: "we need a way for users to book mark the stop
that they have left off, because if they have wandered out of curiosity, it
should not force them to resume at that spot. For the home page, we can make
the stop number indicator editable. For the map, could that editable
indicator be placed to the left of zoom control").

What this check holds, and why each clause is the one that matters:

  1. The bookmark lives in ONE place (lib/continuer.ts) and nextSioId takes
     it as an ARGUMENT — the render paths (Home, the map) must pass it from
     state, because reading localStorage during render breaks the prerender.
  2. The editable indicators exist: the TOP BAR's (all 28 surfaces) and the
     map's control row, the map's LEFT of the zoom cluster. Home's own hero
     well is deliberately NOT one of them any more — Dan, 12 Sep: *"there is
     no need to have the current stop mentioned twice"* — and clause 1 pins
     its absence rather than leaving the page free to grow a second reading.
  3. The handler-path callers (nextStep, the tour's Play card, the activity
     landing) go through continueSioId, so « Continue » follows the bookmark
     everywhere it is spoken, not only where it is drawn.
  4. Wandering never writes it: saveBookmark is called from StopBookmark's
     commit and NOWHERE else — a popup or a visited lesson writing the
     bookmark would rebuild exactly the fault Dan named.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
fails: list[str] = []


def ok(cond: bool, what: str, why: str) -> None:
    if not cond:
        fails.append(f"  ✗ {what}\n    {why}")


def read(p: str) -> str:
    return (ROOT / p).read_text(encoding="utf-8")


cont = read("src/lib/continuer.ts")
comp = read("src/components/StopBookmark.tsx")
home = read("src/app/HomeDashboard.tsx")
mapb = read("src/app/map/MapBody.tsx")

# ---- 1 · one home, argument not ambient ----------------------------------
ok("fluolingo:bookmark" in cont,
   "the bookmark's storage key lives in lib/continuer.ts",
   "the key moved or was respelled — two spellings of one key is two bookmarks")
ok(re.search(r"nextSioId\(progress:\s*Progress,\s*bookmarkNo\?", cont) is not None,
   "nextSioId takes the bookmark as an argument",
   "nextSioId reads storage itself — called during render on Home and the map, "
   "that makes the first client render disagree with the prerender")
# HOME NO LONGER READS THE BOOKMARK, AND THAT IS THE FIX RATHER THAN THE FAULT
# (12 Sep). Dan removed the hero's transport row — *"is it ok to do without the
# play, forward and rewind buttons"* — and with it the last thing on that page
# that needed the learner's progress. `HomeDashboard` now holds no state at
# all: it renders `MapBody`, which loads progress and the bookmark because it
# must, being the component `/map` framed.
#
# Asserting Home still reads the bookmark would now be asserting the SECOND
# COPY this branch exists to remove — two surfaces computing one stop is
# exactly how Home and the map drifted apart in the first place. So the loop
# names the surface that owns it, and the clause below pins that Home does not
# grow its own reading back.
ok("nextSioId" not in home and "BOOKMARK_EVENT" not in home,
   "Home keeps no second copy of the current stop",
   "HomeDashboard is computing the current stop again — one value, one owner; "
   "the map's control row is where it lives")
for surface, name in ((mapb, "MapBody"),):
    ok("nextSioId(progress, bookmark)" in surface,
       f"{name} passes the bookmark from STATE",
       f"{name} computes the current stop without the bookmark — the learner's "
       "word is written but not read there")
    ok("BOOKMARK_EVENT" in surface,
       f"{name} listens for bookmark saves",
       f"a save on the other surface never reaches {name} without a reload")

# ---- 2 · both indicators, the map's left of zoom -------------------------
# THE INDICATOR MOVED UP (Dan, 7 Sep: "replace the streak info with the
# stop info (and make that editable) at the top right"). Home's hero well is
# gone; the editable reading rides the TOP BAR (StopMark), so it is on all
# 28 surfaces instead of one — the claim survives at a better address.
# THE ADDRESS MOVED AGAIN, 2026-09-14, AND THE CLAIM WITH IT (Dan: "we don't
# have the stop field anymore, it s ben a while since it was take off"). It was
# on Home's hero, then the top bar; it is the map's control row now and nowhere
# else. What must not change is that the number a learner READS is a number
# they can EDIT — which is the claim this file has carried through all three
# addresses. So the bar is now checked for its ABSENCE, and the map for its
# presence, rather than the file quietly losing an assertion.
bar = read("src/components/SiteTopBar.tsx")
ok("<StopBookmark" not in bar,
   "the bar no longer carries the well — one number, one place",
   "the stop field is back in the top bar; it was taken off on 14 Sep")
mi = mapb.find("<StopBookmark")
ok(mi != -1, "the map's control row carries the indicator",
   "the map has no editable indicator")
ok(mi != -1 and mi < mapb.find('aria-label="Zoom"'),
   "and it sits LEFT of the zoom cluster",
   "Dan: 'could that editable indicator be placed to the left of zoom control'")

# ---- 3 · Continue follows the bookmark everywhere ------------------------
for p in ("src/lib/nextStep.ts", "src/components/ActivityLanding.tsx",
          "src/components/FirstTour.tsx"):
    src = read(p)
    ok("continueSioId(loadProgress())" in src and "nextSioId(loadProgress())" not in src,
       f"{p} resolves the current stop through continueSioId",
       "it computes without the bookmark — Continue would point one way on the "
       "map and another way when pressed")

# ---- 4 · wandering never writes it ---------------------------------------
writers = [
    str(p.relative_to(ROOT))
    for p in (ROOT / "src").rglob("*.ts*")
    if "saveBookmark" in p.read_text(encoding="utf-8")
]
ok(sorted(writers) == ["src/components/StopBookmark.tsx", "src/lib/continuer.ts"],
   "only the indicator itself writes the bookmark",
   f"saveBookmark is called from {sorted(writers)} — a visit or a popup writing "
   "it is exactly the 'wandered out of curiosity' fault the bookmark exists to end")

if fails:
    print("verify87-stop-bookmark: FAIL")
    print("\n".join(fails))
    sys.exit(1)
print("verify87-stop-bookmark: ok — the bookmark is one value, two faces, no silent writers")
