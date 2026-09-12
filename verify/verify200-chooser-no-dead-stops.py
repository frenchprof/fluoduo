#!/usr/bin/env python3
"""
The stop chooser never offers a goal that goes nowhere.

***Dan, 2026-09-11: "just don't allow anyone to land on 'there is nothing
here'".***

WHAT THIS IS ANSWERING. The activity pop-up used to be a 1-to-50 slider with
no list of decks and no gate: it built a URL from `SIOS[stop-1].collectionId`
for every activity. Driven on the built export, from the ☰, pressing Confirm
on the stop the picker OPENS ON:

    ComposeIt      0 of 50 stops led to a page that exists
    VocabulaRain  28 of 50
    the other four 50 of 50

and worse, "the page exists" is not the same question as "the game can play
it". Measured against each activity's own gate:

    MémoiRecall   50/50      GramMarathon  27/50   <- page exists, opens EMPTY
    WorDrill      50/50      LexicaLocker  31/50   <- likewise
    VocabulaRain  33/50      ComposeIt     12/50

Across the six the slider offered 300 choices and 97 went nowhere, in two
different ways: a 404, or a page that loads with nothing in it. The second is
the one a 404-scan misses, and it is the shape `lib/collections/gapSentence.ts`
records as this repo's most expensive recurring bug — the gate said yes and the
game found nothing.

WHAT IS CHECKED, AND WHY IT IS CHECKED AGAINST THE BUILD. `playableStops()` and
`stopHref()` are the one source both the chooser and the router read, so a
source-reading check would only prove the file agrees with itself. This walks
every activity x every stop it offers, resolves the href, and asserts the
EXPORTED page is on disk. A gate that passes while the page 404s is the same
bug wearing a different coat — that is exactly how `modaux-plans` would have
slipped through, resolving through a set alias that `generateStaticParams`
never exported.

HOW IT ASKS THEM, AND WHY THAT CHANGED (11 Sep). It calls the app's own
functions through `scripts/chooser-probe.mjs`, which loads them with `jiti` —
TypeScript, straight from src/, no compiler in between. The alternative was
never a Python re-implementation of six activities' readiness rules; that is
precisely the "second opinion" gapSentence.ts was written to stop, and it is
still ruled out. The same modules answer by the same `@/…` specifiers.

It USED TO get its answer by writing a throwaway page into src/app and running
`npm run build` to render it — honest about its cost ("roughly a minute in CI",
this docstring said), but it made the app compile THREE times a run: the closed
build, the open rebuild, and this. Measured on run #755, that was 54s + 56s +
55s of a 7m33s run.

THE SWAP WAS PROVED, NOT ASSUMED: the build-rendered answer and the jiti answer
were captured on the same commit and compared field by field — all six
activities, all 203 offered stops, byte-identical. 98.5s became 1.4s.

It needs `out/` (to check each href against the real export, not to ask the
question):  NEXT_PUBLIC_OPEN_APP=1 npm run build
Run from the repo root: python3 verify/verify200-chooser-no-dead-stops.py
"""
import json, os, re, subprocess, sys

OK, FAIL = [], []
def ok(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)
if not os.path.isdir("out"):
    print("  FAIL  out/ is missing — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

KEYS = ["flip", "grammarathon", "wordrill", "lexicalator", "vocabularain", "compose"]

# ---- 1 · the chooser and the router read ONE source ---------------------------

# THE CHOOSER MOVED, 12 Sep: it is no longer a pop-up but the ☰ menu's own
# GO TO row, so this reads MenuGrid. The clauses below are unchanged in
# substance — they still ask whether the thing a learner chooses with routes
# through ONE gate — and that is why they survived the move at all: they were
# written about the question, not about the modal that used to ask it.
picker = open("src/components/MenuGrid.tsx", encoding="utf-8").read()
code = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", picker)
code = re.sub(r"(?m)^\s*//.*$", "", code)

ok("stopHref(" in code,
   "the menu's per-stop doors route through lib/activityStops",
   "MenuGrid no longer calls stopHref — it is back to building its own URLs, "
   "which is what offered 97 dead choices. The GO TO row's greying reads the "
   "same function: without it the row sets a number nothing checks")

ok("type=\"range\"" not in code and "fluo-goal-slider" not in code,
   "the 1-to-50 slider is gone",
   "the slider is back — it offers every stop whether the activity has one or not")

ok("SIO_HREF" not in code,
   "the old ungated route table is gone",
   "SIO_HREF is back; it could not say whether a deck was playable")

# AND THE GREYING IS PART OF THE SAME PROMISE. Dan's rule was "just don't allow
# anyone to land on 'there is nothing here'"; the row answers it by SHOWING
# which doors are dead rather than by hiding them, so a door with no href must
# still render as a disabled tile. Dropping that branch would re-open the
# fault from the other side: a live-looking tile with nowhere to go.
ok("aria-disabled" in code,
   "a door with nothing at the chosen stop is greyed, not left live",
   "MenuGrid no longer renders a disabled tile for a stop an activity cannot "
   "play — the GO TO row would then offer doors that go nowhere")

# ---- 2 · every offered stop resolves to a page that was really exported -------
# Ask the app itself rather than re-implementing it: chooser-probe.mjs imports
# playableStops/stopHref and the six item functions by their `@/…` specifiers and
# prints what the pop-up would offer. It needs no build and no out/ of its own —
# out/ is still read below, to check each offered href against the real export.
data = {}
probe_err = ""
try:
    r = subprocess.run(["node", "scripts/chooser-probe.mjs"],
                       capture_output=True, text=True)
    if r.returncode == 0:
        data = json.loads(r.stdout)
    else:
        probe_err = (r.stderr or "").strip().splitlines()[-1:] or [""]
        probe_err = probe_err[0][:200]
except (OSError, ValueError) as e:
    probe_err = str(e)[:200]

ok(bool(data), "the chooser's own functions produced its offer list",
   "scripts/chooser-probe.mjs did not answer, so the offers cannot be checked "
   "against the export" + (f" — {probe_err}" if probe_err else ""))

if data:
    total, dead, empty = 0, [], []
    for key in KEYS:
        rows = data.get(key) or []
        ok(len(rows) > 0, f"{key}: offers {len(rows)} stop(s)",
           f"{key}: offers NOTHING — every stop was gated out, which is a bug in the gate")
        for row in rows:
            total += 1
            h, n = row.get("href"), row.get("items", 0)
            if not h:
                dead.append(f"{key}: stop {row.get('stop')} offered with a null href"); continue
            # (a) the page was really exported — catches a URL in the wrong namespace
            if not os.path.isfile("out" + h + ".html"):
                dead.append(f"{key}: {h} is offered but out{h}.html was never exported")
            # (b) AND the game has something to play there — catches the silent
            #     kind, where the page exists and opens empty. Counted with the
            #     activity's own item function, not its gate, so a removed gate
            #     shows up here. Found by break-testing this very check: with
            #     only (a), deleting GramMarathon's readiness test still passed.
            if n <= 0:
                empty.append(f"{key}: stop {row.get('stop')} ({h}) is offered but the game has 0 items there")
    ok(not dead,
       f"all {total} offered stops resolve to a page that exists",
       "OFFERED BUT MISSING — " + "; ".join(dead[:5]) + (f" (+{len(dead)-5} more)" if len(dead) > 5 else ""))
    ok(not empty,
       f"all {total} offered stops have something for the game to play",
       "OFFERED BUT EMPTY — " + "; ".join(empty[:5]) + (f" (+{len(empty)-5} more)" if len(empty) > 5 else ""))

# ---- 3 · ÉcouTexte does not ask a question it cannot use ---------------------

grid = open("src/components/MenuGrid.tsx", encoding="utf-8").read()
gcode = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", grid)
gcode = re.sub(r"(?m)^\s*//.*$", "", gcode)
ok('sioKey: "ecoutexte"' not in gcode,
   "ÉcouTexte opens straight to its topic picker — no question it would discard",
   "ÉcouTexte is a chooser tile again; it has no per-stop route, so the pop-up "
   "takes an answer it cannot use")

print("\n".join("  ok    " + s for s in OK))
if FAIL: print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
