#!/usr/bin/env python3
"""
Patch 24's Index — RETIRED 2026-08-29 — and what replaced it.

WHAT THIS FILE USED TO HOLD
---------------------------
The Index redesign: an activity chip rail over a five-unit segmented control,
ten rows per unit, state in the URL, each cell saying how you DID on that
activity for that outcome; the activity hubs redirected into it with the
activity preselected; `?gaps=1` was the authoring backlog.

WHY IT IS GONE
--------------
Dan, 22 Aug, on the Index: "I really don't understand how to read it." A key
was added (assertion 9 below, now dropped with the page). It did not take, and
on 2026-08-29 he retired the page outright:

  "we shouldn't have to land on the index page at all. the maps should still
   be the front door for everything"

and, for the activity tiles:

  "it takes them to the landing page that lists all the X on the website, and
   perhaps highlight the one relevant to their latest Pre-test"

So the one page that did both jobs became two doors that each do one:

  the MAP  — choose a STOP. Tap it, get its popup, pick anything it has.
  a LANDING — you have already chosen the ACTIVITY; here is every stop that
             has it, in course order, one unit open at a time.

WHAT THIS FILE HOLDS NOW

  1  The Index is DELETED, not merely unlinked — page and IndexRedirect both
     gone, and nothing in src/ still links to /activities. A half-removed
     route that still renders is the worse outcome.
  2  ActivityLanding exists and the three activity hubs render it.
  3  The registry's three activity hrefs point at those landings, and the
     Practice family points at the map.
  4  The ghost state is DERIVED from cellHref, never a second list. A stop
     without the activity must still appear — a missing row says "this stop
     has nothing", when what it has is everything except this one activity.
  5  One unit open at a time, and a fallback for browsers without exclusive
     `<details name>` accordions.
  6  The last pre-tested stop is marked, read on mount rather than in render
     (localStorage does not exist on the server).
  7  The authoring backlog survived the deletion — it moved to /teacher
     rather than being lost with the page it was hiding inside.
  8  indexMatrix and activityLedger, which the Index used and the landings
     still use, keep the contracts patch 24 gave them.
  9  No hex literal in the new files (tokens only, verify19b's rule).

Run from the repo root:  python3 verify/verify24.py
"""
import os
import re
import sys

FAIL, OK = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

LANDING = "src/components/ActivityLanding.tsx"
REG = "src/content/activities.ts"
MATRIX = "src/lib/indexMatrix.ts"
LEDGER = "src/lib/activityLedger.ts"
GAPS = "src/app/teacher/Gaps.tsx"
HUBS = {
    "src/app/practice/flip-it/page.tsx": "flip",
    "src/app/practice/grammarathon/page.tsx": "grammarathon",
    "src/app/practice/speculearn/page.tsx": "speculearn",
}

# ---- 1 · the Index is really gone ------------------------------------------
for dead in ("src/app/activities/page.tsx", "src/app/activities", "src/components/IndexRedirect.tsx"):
    check(not os.path.exists(dead),
          f"{dead} is deleted",
          f"{dead} is back — the Index was retired on 2026-08-29")

# Nothing may link to it. Comments explaining the retirement are fine and this
# file is full of them; an href is not — a dead link is worse than the page it
# points at. So the scan runs over CODE, with comments stripped first.
def strip_comments(src: str) -> str:
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


linkers = []
for root, _dirs, files in os.walk("src"):
    for f in files:
        if not f.endswith((".ts", ".tsx")):
            continue
        fp = os.path.join(root, f)
        for m in re.finditer(r'["`](/activities[^"`]*)["`]', strip_comments(read(fp))):
            linkers.append(f"{fp} → {m.group(1)}")
check(not linkers,
      "nothing in src/ links to /activities",
      f"still linking to the retired Index: {linkers[:4]}")

# ---- 2 · the landing exists, and the hubs render it ------------------------
land = read(LANDING)
check(bool(land), f"{LANDING} exists", f"{LANDING} is missing — the tiles have nowhere to land")
for hub, key in HUBS.items():
    src = read(hub)
    check("ActivityLanding" in src and f'activityKey="{key}"' in src,
          f"{hub.split('/')[-2]} renders its own landing",
          f"{hub} does not render ActivityLanding with activityKey={key!r}")

# ---- 3 · the registry points at the new doors ------------------------------
reg = read(REG)
for key, href in (("speculearn", "/practice/speculearn"),
                  ("flip", "/practice/flip-it"),
                  ("grammarathon", "/practice/grammarathon")):
    check(f'href: "{href}"' in reg,
          f"registry: {key} → {href}",
          f"registry: {key} does not point at {href}")
fam = reg.split("export const FAMILIES")[-1]
check('"/map"' in fam,
      "registry: the Practice family opens the map",
      "the Practice family no longer reaches the map")

# ---- 4 · the ghost is derived, and the row keeps its place -----------------
check("cellHref(" in land,
      "the landing asks cellHref whether a stop has the activity",
      "the landing derives availability some other way — that is a second list to keep in step")
check("aria-disabled" in land and "border-dashed" in land,
      "the landing has a ghost state to render",
      "the landing has no ghost state — a stop lacking the activity would vanish")
# ...and actually RENDERS it. The check above only proves the ghost branch
# exists; filtering the list before the map would leave every one of its
# strings in place while dropping the rows. Break-testing that is what caught
# this: the sabotage passed. So the row list must reach `.map` unfiltered.
row_map = re.search(r"\{(\w+)(\.filter\([^)]*\))?\.map\(\(\{ sio, href \}\)", land)
check(row_map is not None and row_map.group(2) is None,
      "every stop reaches the row list — the ghosts are rendered, not filtered out",
      "the landing filters its rows before rendering, so stops lacking the activity disappear")

# ---- 5 · one unit open at a time -------------------------------------------
check('name="unit"' in land,
      "the units are one exclusive `<details name>` accordion",
      "the landing's units are not an exclusive accordion — fifty rows at once is the wall the Index was")
check("d.open = false" in land,
      "a fallback closes the others where exclusive accordions are unsupported",
      "no fallback: on a browser without exclusive `<details name>` every unit would stay open")

# ---- 6 · the last pre-test is marked, safely -------------------------------
check("latestPretestSio" in land,
      "the landing marks the learner's last pre-tested stop",
      "the landing does not use latestPretestSio — Dan asked for that highlight")
check("useEffect" in land and "latestPretestSio()" not in land.split("useEffect")[0],
      "the record is read on mount, not during render",
      "latestPretestSio is read in the render body — localStorage does not exist on the server")

# ---- 7 · the authoring backlog survived ------------------------------------
gaps = read(GAPS)
check(bool(gaps), "the authoring backlog moved to /teacher", "the ?gaps=1 backlog was lost with the Index")
check("gapCells(" in gaps,
      "the backlog is still derived from gapCells",
      "the backlog no longer derives from gapCells — it has become a list to maintain")
# Both halves, because either alone is satisfied by the other's leftovers:
# deleting the PANELS entry leaves `panel === "gaps"` in the render, and
# deleting the render leaves the tab. Break-testing found that too.
teach = read("src/app/teacher/page.tsx")
check('{ key: "gaps"' in teach and 'panel === "gaps"' in teach and "<Gaps" in teach,
      "the backlog has a tab AND a render on /teacher",
      "the /teacher gaps panel is half-wired — a tab with nothing behind it, or a render with no way in")

# ---- 8 · the contracts patch 24 gave the shared helpers --------------------
mx = read(MATRIX)
check("CHIP_KEYS" in mx and "ROW_BUTTON_KEYS" in mx,
      "indexMatrix still names the content-gated and always-present activities",
      "indexMatrix lost its activity split")
check("deckActivityTabs" in mx,
      "cellHref resolves through deckActivityTabs (eligibility is not re-derived)",
      "indexMatrix re-derives eligibility instead of using deckActivityTabs")
led = read(LEDGER)
check("recordResponse" in led,
      "activityLedger still has its one writer",
      "activityLedger's writer is gone")

# ---- 9 · tokens, not hex ---------------------------------------------------
for p in (LANDING, GAPS):
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", read(p))
    check(not hexes,
          f"{p.split('/')[-1]} uses tokens, no raw hex",
          f"{p} has raw hex {hexes[:3]} — verify19b's rule")

print("\n".join(f"  ok    {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL  {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
