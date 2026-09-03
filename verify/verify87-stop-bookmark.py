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
  2. Both editable indicators exist: Home's hero well and the map's control
     row, the map's LEFT of the zoom cluster.
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
for surface, name in ((home, "HomeDashboard"), (mapb, "MapBody")):
    ok("nextSioId(progress, bookmark)" in surface,
       f"{name} passes the bookmark from STATE",
       f"{name} computes the current stop without the bookmark — the learner's "
       "word is written but not read there")
    ok("BOOKMARK_EVENT" in surface,
       f"{name} listens for bookmark saves",
       f"a save on the other surface never reaches {name} without a reload")

# ---- 2 · both indicators, the map's left of zoom -------------------------
ok("<StopBookmark" in home, "Home's hero well is the editable indicator",
   "Home shows a number that cannot be edited — Dan: 'we can make the stop "
   "number indicator editable'")
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
