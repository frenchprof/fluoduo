#!/usr/bin/env python3
"""verify126 — a page never loses its coloured strip at the top.

Dan, 2026-09-07, over a screenshot of a pre-test that opened on bare paper:
*"we also need to make it a point that pages never loose their coloured strip
at the top, which means this should be illegal"*.

WHAT HE WAS LOOKING AT. `/practice/speculearn/pretest/<id>` had the pale site
bar, then nothing — ruled paper, a grey progress line, and the first question.
No « SpecuLearn », no goal circle, no ✕. The page could not say what it was.

WHY A BROWSER SCAN AND NOT A GREP. The strip goes missing in ways that look
nothing alike in source, and in every one of them each half reads as correct on
its own. All four shapes were live on main this morning:

  1 · HOST SUPPRESSES, FRAME HIDES.  `<CahierShell band={false}>` around an
      EmbedFrame is RIGHT for the five DrillShell activities — a drill's band
      carries its own ✕, goal chip and progress, so the frame's strip is the
      page's strip. It is WRONG when the framed page draws its band with
      CahierShell, because `html[data-embed]` hides a CahierShell band inside
      a frame. Suppressed + hidden = nothing. That was the pre-test.
  2 · THE PAGE CANNOT NAME ITSELF.  CahierShell rendered the band only when a
      title resolved, and a key with a family but no flap, no registry row and
      no hub resolves to `undefined`. That was `/moi` — whose own name lives
      under `/profil`, because they are one page.
  3 · THE REGISTRY ROW WAS RETIRED AND THE ROUTE KEPT.  DrillShell drew its
      band `{act && …}`, and `act` is undefined for exactly the routes whose
      tile was folded away on purpose: Diced Practice, Sorting (#93),
      iComplete (#97). The file already guards the EXIT on those same routes
      — "a drill you cannot leave is a trap" — and nobody had noticed the band
      going the same way. `/games/numbus` printed its own key as a heading:
      « numbus », lowercase, because NumBus's row went to the Numbers hub.
  4 · A GAME NEVER GOT WRAPPED.  Dan asked on 7 Sep for the games to be
      "embedded like the map, (with option to go full screen)". VocabulaRain
      and LexicaLater were wrapped that day; Match It and ComposeIt were
      missed, and opened on a white game bar carrying ✕ 🔊 ⛶ ⋯ and no name.

A grep for `band={false}` flags the five CORRECT uses and misses three of the
four shapes. Only the rendered page knows, so this drives it: every route in
src/app, two instances of each dynamic segment, counting VISIBLE `.page-band`
elements across the top document AND every frame.

EXACTLY ONE, not "at least one". Two strips is the same fault seen from the
other side, and it is what a careless fix produces — turn the pre-test host's
band back on without knowing the frame's is hidden and the learner meets two.

THE EXPORT MUST BE OPEN, for the reason verify79 states: the wall build renders
"Checking your sign-in…" where the activity should be, and a scan of that would
pass while guarding nothing. In verify.yml this runs after the same
`NEXT_PUBLIC_OPEN_APP=1 npm run build` step the jam scan uses.

Numbered 126: 110 belongs to the colour review (main's note, 7 Sep), 111-121
and 125 are taken, and this branch already holds 117 and 118.
"""
import os, subprocess, sys

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

probe = "out/practice/speculearn/pretest/atelier-sio-020.html"
if not os.path.isfile(probe):
    print("FAIL  out/ has no pre-test pages — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)
if "Checking your sign-in" in open(probe, encoding="utf-8").read():
    print("FAIL  out/ is a WALL build — the activities render the sign-in stub, so a")
    print("      strip scan would pass while measuring nothing. Rebuild with")
    print("      NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/band-scan.mjs"]).returncode)
