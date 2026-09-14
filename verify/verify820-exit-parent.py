#!/usr/bin/env python3
"""verify820 — the ✕ goes UP, and it goes somewhere that exists.

Dan, 2026-09-14: *"When closing the X it always goes back to the page where it
came from right? Like closing NumBus should back to Numbers where i came
from"*.

It did not. Measured across eighteen surfaces on the built app, every ✕ not
opened for a deck went to `/home`. On sixteen of them that is the right
answer — they are top-level doors off the ☰ and there is nothing above them.
The two exceptions are exactly the two he named:

    /games/numbus       ✕ -> /home        the hub above it, skipped
    /games/numbourse    ✕ -> /home        the hub above it, skipped

NumBus and NumBourse have no registry row of their own, because on 31 Aug Dan
parked them under ONE hub tile (*"park NumBus / NumBourse under a hub-tab
Numbers"*). So `activity()` answers nothing for them, `GameLanding` had no
stop to fall back to either, and the band took CahierShell's default. The page
above them exists — `/games/numbers` — and the ✕ stepped over it to the map,
which is the very hassle the 13 Sep ruling named: you have to find your way
back in again.

A DECLARED PARENT, NOT THE BROWSER'S HISTORY, and that is the part worth
writing down. Going literally "back" breaks on the three ways a learner really
arrives — a deep link, a refresh, and the ☰ menu, which is not a page to
return to — and it would quietly undo the 13 Sep ruling, which says the ✕
lands on the 🎯 page even when you came from the map. The order is: the stop
this was opened for, then the page above it, then Home.

WHY DRIVEN. `exitHref` is threaded GameLanding -> CahierShell -> PageBand with
a default at every hop, so which default wins on a given route is a question
only the rendered page can answer. Reading any one of those three files tells
you what that file would do.

What it asserts:

 1 · Every parked activity's ✕ points at the hub it is parked under. The list
     is NAMED, verify105-style, because a sweep would have to guess which
     activities have a page above them and would answer "yes" for a top-level
     door that happens to sit under a path segment.
 2 · No ✕ anywhere leads to a route the export does not contain. A way out
     that 404s is worse than none.
 3 · At least 12 bands were found at all, so a wall build or a route that
     stopped rendering cannot report "all clear" over an empty scan.

Run from the repo root:  python3 verify/verify820-exit-parent.py
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)
OUT = os.path.join(ROOT, "out")
if not os.path.isdir(OUT):
    print("no out/ — run `NEXT_PUBLIC_OPEN_APP=1 npm run build` first"); sys.exit(2)

# An activity that lives UNDER another page, and the page it lives under.
# Two entries today, both from Dan's 31 Aug parking of the number games.
PARKED = {
    "/games/numbus": "/games/numbers",
    "/games/numbourse": "/games/numbers",
}

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def exported(href):
    """Does the static export really contain this route?"""
    p = href.split("?")[0].split("#")[0].strip("/")
    if not p:
        return True
    f = os.path.join(OUT, p)
    return (os.path.isfile(f) or os.path.isfile(f + ".html")
            or os.path.isfile(os.path.join(f, "index.html")))


proc = subprocess.run(
    ["node", os.path.join("scripts", "exit-scan.mjs")],
    cwd=ROOT, capture_output=True, text=True, timeout=900,
)
if proc.returncode != 0:
    print("the scan did not run:\n" + (proc.stderr or "")[-2000:]); sys.exit(2)
exits = json.loads(proc.stdout)["exits"]

# ── 1 · a parked activity returns to its hub ────────────────────────────────
wrong = {r: exits.get(r) for r, want in PARKED.items() if exits.get(r) != want}
ok(not wrong,
   "every parked activity's ✕ returns to the page above it "
   + ", ".join(f"{r} → {h}" for r, h in PARKED.items()),
   "the ✕ steps over the page above it on: "
   + ", ".join(f"{r} → {got} (wanted {PARKED[r]})" for r, got in wrong.items()))

# ── 2 · no way out is a dead link ──────────────────────────────────────────
found = {r: h for r, h in exits.items() if h and not h.startswith("ERROR")}
dead = {r: h for r, h in found.items() if not exported(h)}
ok(not dead,
   f"all {len(found)} exits lead to a route the export contains",
   "the ✕ leads nowhere on: " + ", ".join(f"{r} → {h}" for r, h in dead.items()))

errors = {r: h for r, h in exits.items() if h and str(h).startswith("ERROR")}
ok(not errors,
   f"{len(exits)} routes driven, none errored",
   "routes that would not load: " + ", ".join(f"{r} ({h})" for r, h in list(errors.items())[:5]))

# ── 3 · the scan actually saw the app ──────────────────────────────────────
ok(len(found) >= 12,
   f"{len(found)} bands with a ✕ found — the scan reached the real pages",
   f"only {len(found)} exits found. An empty scan reports 'all clear', which "
   f"is the failure this floor exists to refuse.")

print(__doc__.splitlines()[0])
print("-" * 66)
for p in PASS:
    print(f"  ok    {p}")
for f in FAIL:
    print(f"  FAIL  {f}")
print("-" * 66)
if FAIL:
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print(f"  all {len(PASS)} checks passed")
