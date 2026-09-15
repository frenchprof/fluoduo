#!/usr/bin/env python3
"""Every raised key wears an outlined top surface — measured in a browser.

Dan, 2026-09-14, over a screenshot of the revision path: *"the buttons are
missing the outlined top surface"*.

WHY READING THE CSS SAID YES. `.neo-key`'s 3D is four shadows and one of them
— `inset 1px 3px 0 white 62%` — is exactly a lit top face. On a DARK key it
reads. On a pale one it cannot: the path's « ▶ Open » sits on
--fam-review-wash, rgb(205,244,231), and a 62%-white highlight on near-white is
nothing at all. So one class looked like a 3D key on the gold START and a flat
pill six rows below it, which reads as a bug in the flat ones rather than as a
rule nobody had written.

Driven across eleven routes in the built app: **42 of 50 raised keys had no
outline of any kind.** The eight that did were the ☰ menu's tiles, which add
`border-2` themselves in familyTile.ts and colour it with the family's darkest
rung — Dan's ruling of 11 Sep. The fix made that the rule: `.neo-key` carries
`border: 2px solid var(--key-edge, var(--cahier-ink))`, and `--key-edge` is the
`--key-bg` mechanism again, so a caller can set the edge inline and always win.

WHAT IS PINNED

  1  ZERO un-outlined keys. Not a ratchet — the app is at zero, and a ratchet
     waves the next one through. verify540's reasoning, unchanged.
  2  A FLOOR ON THE CENSUS. Fewer than 30 keys found is a FAIL, not a pass: a
     wall build or a route that stopped rendering would otherwise report "all
     clear" over an empty page. verify79, verify126 and verify540 each record
     that mistake; this is the fourth time it is worth writing down.

WHAT IS DELIBERATELY NOT A KEY. `.fluo-stop` — the map's fifty stop coins — and
the 3D map's stop node keep `border: 0`, by Dan's own ruling of 8 Sep, *"a coin,
not a neumorphic pill"*. That line needs no new class: a coin never carries
`.neo-key`, and this scan reads `.neo-key` and `.fluo-tile-key` only.

THE EXPORT MUST BE OPEN, for the same reason verify540 says so: a sign-in-walled
build renders the stub where the activity should be, and its controls are not
the app's.

Numbered 800 and not 770: the frontier was at 760 and a number next to it gets
claimed again while CI runs (AGENTS.md, 7 Sep).

Run from the repo root:  python3 verify/verify900-key-outline.py
"""
import os
import subprocess
import sys

if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

probe = "out/decks/salutations.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no /decks/salutations — build first: "
          "NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — rebuild with NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/key-outline-scan.mjs"]).returncode)
