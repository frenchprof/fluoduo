#!/usr/bin/env python3
"""verify840 — a hub's own door may not draw a second notebook inside the first.

Dan, 2026-09-14, sending a photograph of one phone screen carrying TWO site
bars, TWO bands and two sets of coils: *"Numbers is now nesting numbus - what
did you break"*.

Nothing, and that was checked before it was answered: the tree at `8612ec3` —
what was live that morning, before any of the day's merges — was built and
driven through the same click, and behaved identically. The fault was older
than the question, which is exactly why it needed a check rather than a fix.

WHAT IT IS. Every station runs in an iframe since 7 Sep, so a hub rendered from
an `/embed` route IS the framed document. A plain `<Link>` there navigates the
FRAME, and a whole page loaded into a frame brings its own site bar, coils and
band — inside the band that is still wrapped around it. Measured at 430x860
before the fix:

    main  /games/numbus   band "🔢 Numbers"   childIframes=1
    frame /games/numbus   band "🎮 NumBus"

The address bar said `/games/numbus` while the strip said Numbers, and the
learner had two of everything. `target="_top"` sends the destination to the
window, which is where a whole page belongs.

WHY DRIVEN, AND WHY IT IS THE ONLY WAY. A grep for `target="_top"` tests the
FIX, not the FAULT — it would pass on a hub that had grown a new door without
one, and it cannot see the case where the door is right but the destination
itself frames something. What a learner gets is one screen with one notebook
on it, and only a browser can count notebooks.

What it asserts, per hub, after really clicking a real door:

 1 · EXACTLY ONE BAND is on the screen. Two is the fault in its visible form.
 2 · THE BAND NAMES WHERE YOU LANDED, not where you came from. A single band
     saying « Numbers » over NumBus is the same bug wearing one strip.
 3 · NO DOCUMENT HOSTS ANOTHER. `childIframes` must be 0 after the walk: a
     station draws its own paper, so a station inside a station is two sheets.
 4 · AT LEAST THREE WALKS ACTUALLY HAPPENED, so a scan that found no doors —
     a wall build, a renamed key, a route that stopped rendering — cannot
     report "all clear" over nothing.

A walk whose door is not on screen is SKIPPED, not failed: `/path`'s
« ▶ Continue » exists only while a path run is live, and a cold arrival has
none. Clause 4 is what stops that leniency swallowing the whole scan.

Run from the repo root:  python3 verify/verify840-no-nested-notebook.py
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)
if not os.path.isdir(os.path.join(ROOT, "out")):
    print("no out/ — run `NEXT_PUBLIC_OPEN_APP=1 npm run build` first"); sys.exit(2)

# Where each walk should land, and the word its band must carry. Named, because
# "the band should name the page" is not a thing a scan can infer: a band shows
# a display name and the URL shows a key, and the two differ on purpose here
# (LexicaLater's route, LexicaLocker's name — the Memo-rename precedent).
EXPECT = {
    "/games/numbers": "NumBus",
    "/games/lexicalater": "LexicaLocker",
    "/games/vocabularain": "VocabulaRain",
    "/path": None,   # lands on whatever step is next; the band is not pinned
}

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


proc = subprocess.run(
    ["node", os.path.join("scripts", "nest-scan.mjs")],
    cwd=ROOT, capture_output=True, text=True, timeout=900,
)
if proc.returncode != 0:
    print("the scan did not run:\n" + (proc.stderr or "")[-2000:]); sys.exit(2)
report = json.loads(proc.stdout)["report"]

errors = [r for r in report if r.get("error")]
ok(not errors,
   f"{len(report)} hubs driven, none errored",
   "hubs that would not load: " + ", ".join(f"{r['hub']} ({r['error']})" for r in errors[:4]))

walked = [r for r in report if r.get("clicked")]
skipped = [r["hub"] for r in report if r.get("clicked") is False]

# ── 1 · one band ───────────────────────────────────────────────────────────
two = [r for r in walked if len(r.get("bands", [])) != 1]
ok(not two,
   f"every walk lands on ONE band ({len(walked)} walked"
   + (f", {len(skipped)} skipped: {', '.join(skipped)}" if skipped else "") + ")",
   "these land on a screen with more than one band — the page is drawn twice: "
   + "; ".join(f"{r['hub']} → {r.get('landed')} bands={r.get('bands')}" for r in two))

# ── 2 · the band names where you landed ────────────────────────────────────
wrong = []
for r in walked:
    want = EXPECT.get(r["hub"])
    if not want or len(r.get("bands", [])) != 1:
        continue
    if want.lower() not in re.sub(r"\s+", "", r["bands"][0]).lower():
        wrong.append(f"{r['hub']} → {r.get('landed')} band={r['bands'][0]!r} (wanted {want})")
ok(not wrong,
   "each band names the page the learner landed on, not the hub they left",
   "the band still names the hub: " + "; ".join(wrong))

# ── 3 · no document hosts another ──────────────────────────────────────────
hosting = [r for r in walked if r.get("nested", 0) != 0]
ok(not hosting,
   "no document is hosting another after the walk",
   "a station is drawn inside a station on: "
   + "; ".join(f"{r['hub']} → {r.get('landed')} ({r.get('nested')} iframe/s)" for r in hosting))

# ── 4 · the scan actually walked ───────────────────────────────────────────
ok(len(walked) >= 3,
   f"{len(walked)} doors really clicked — the scan reached the app",
   f"only {len(walked)} door/s were found to click. A skipped walk is allowed "
   f"(a path key needs a live run); a scan that finds almost none is a build "
   f"that stopped rendering, and it would otherwise report all clear.")

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
