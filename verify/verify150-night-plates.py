#!/usr/bin/env python3
"""verify150 — the map's text follows the clock, and stays readable doing it.

Dan, 2026-09-08: *"a fun idea: could it land day when it's daytime and night
when it is night time, with the fonts adapting accordingly?"*

The sky already followed the clock — `nightness(hour)` existed in sky.ts and
drove the gradient, the stars and the moon. What did not follow it were the two
TEXT PLATES the scene paints: the goal's name under a standing coin
(« Introductions ») and the tag under a scenery prop. Both were a white pill
with dark ink at every hour, so at 23:00 they were the two brightest objects on
a night map — the one place the eye should not be pulled.

Both now read `--m3d-plate` and `--m3d-plate-ink`, set ONCE on the scene box
from `nightness(hour)`, so a third plate added later inherits the behaviour
instead of re-deciding it.

WHY THIS IS A BROWSER SWEEP OF ALL TWENTY-FOUR HOURS, and not a grep.

The first fix was worse than the fault. Crossfading BOTH the ink and the plate
across `nightness` reads as obviously right and is obviously wrong: the two
colours pass THROUGH each other on the way. Measured on that build, at 06:00
the label was ink L 0.635 sitting on plate L 0.612 — about 1.3:1, invisible —
on a map that looked perfect at noon and perfect at midnight. Any check that
sampled day and night would have waved it through, and so would any grep, since
the source said exactly what it meant to do.

So `scripts/night-plate-scan.mjs` pins the clock at each hour in turn
(`?hour=`), reads what is actually painted, and holds two things:

  1  every plate clears 7:1 (WCAG AAA) against its own ink — measured over a
     sweep of backdrops from black to white, because the plate is translucent
     and the map puts grass, tarmac, shadow and night sky behind it;
  2  the plate actually TURNS OVER — some hour dark, some hour light. Twenty-
     four readable hours in one colour is the app as it was, which is what Dan
     asked to change.

Two measurement traps are handled in the scanner, both of which produced
confident wrong numbers while this was being built: the computed values are
`lab()` / `oklch()` and must be resolved through a canvas rather than
regex-scraped as rgb; and the scene is reached at `/home?view=3d`, because
`/map` frames it and the frame reads `?hour=` off its own search.

Break-tested: with the night plate lightened to rgba(230,226,240,0.80) and the
ink left as PAPER, the sweep goes red at hours 20–23 with « Introductions » at
1.2:1, and again on the turnover assertion.

THE EXPORT MUST BE OPEN, for the reason verify79 states. In verify.yml this
runs after the same `NEXT_PUBLIC_OPEN_APP=1 npm run build` step the road scan
and the jam scan use.

Run from the repo root:  python3 verify/verify150-night-plates.py
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

# ── the source side: one decision, taken once, at a threshold ────────────────
src = open(os.path.join(ROOT, "src/components/HomeMap3D.tsx"), encoding="utf-8").read()
fail = []

if not re.search(r"const night = nightness\(hour\)", src):
    fail.append("the scene no longer derives `night` from nightness(hour) — the sky "
                "would still follow the clock while the labels stopped")

# The ink and the plate must be picked by the SAME comparison. Two thresholds
# that drift apart is precisely how light ink lands on a light plate.
inks = re.findall(r"--m3d-plate-ink\"[^\]]*\]:\s*night\s*>\s*([0-9.]+)", src)
plates = re.findall(r"--m3d-plate\"[^\]]*\]:\s*night\s*>\s*([0-9.]+)", src)
if not inks or not plates:
    fail.append("--m3d-plate / --m3d-plate-ink are no longer chosen by a `night > …` "
                "threshold. A CROSSFADE is the trap here: fading ink and plate across "
                "nightness puts them at 1.3:1 at 06:00, readable at noon and midnight")
elif set(inks) != set(plates):
    fail.append(f"the ink switches at night > {inks} but the plate at night > {plates}. "
                "They must turn over together, or one hour has light ink on a light plate")

if "var(--m3d-plate)" not in src or "var(--m3d-plate-ink)" not in src:
    fail.append("nothing reads the shared plate variables any more — each label is "
                "deciding its own colour again, which is what this replaced")

for m in fail:
    print(f"  FAIL {m}")
if fail:
    print(f"\n{len(fail)} failed")
    sys.exit(1)
print("  ok   the plate and its ink turn over together, on one threshold, from nightness(hour)")

# ── the painted side: all 24 hours, in a browser ─────────────────────────────
probe = os.path.join(ROOT, "out/home.html")
if not os.path.isfile(probe):
    probe = os.path.join(ROOT, "out/home/index.html")
if not os.path.isfile(probe):
    print("FAIL  out/ has no map embed — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — rebuild with NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/night-plate-scan.mjs"], cwd=ROOT).returncode)
