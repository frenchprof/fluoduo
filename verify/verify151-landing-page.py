#!/usr/bin/env python3
"""verify151 — the landing page (`/`) shows the road, and asks one thing.

Dan asked for a pre-home landing page on 7 Sep — *"It will be used as a
pre-home page landing page… The question is what are the items on this
purposefully bare page"* — and then narrowed it twice, which is the design:

  *"But the map, that was the real showcase that we must include here"*
  *"can the map fill the screen such that the night sky could serve as
   background for the top nav"*
  *"then we reduce the load of the blurred mirror: All we wanted was Start my
   journey now on the glass… You are COMPLETELY blocking the view of my
   winding road horizon, which is the WHOLE POINT of this page… Welcome to
   FluOLinGO can move into the dark sky space"*

So the page is laid out against the SCENE, not against itself:

    the sky, above 29% of the frame   the mark, the welcome, the promise
    the horizon                       nothing. This is the view.
    the near ground, the bottom       one glass pill, « Start my journey »

WHY A BROWSER SCAN AND NOT A GREP. The fault Dan sent back was a frosted panel
across the middle, and nothing in the source of that build said "panel" — a
panel is a div with a width, and it read as perfectly reasonable code. The only
place the fault exists is on the painted page, so `scripts/landing-scan.mjs`
asks every piece of overlay furniture where it actually is and requires the
horizon band to come back empty.

THE BAND IS READ FROM `projection.ts`, not typed in a second time: it runs from
SKYLINE_Y (where the sky stops) to HORIZON_Y + 0.18 (below the crest, over the
stretch of road coming down from it). Text ABOVE the skyline is the design;
text crossing it is standing on the land.

Two more assertions that are rules rather than taste:
  · the CTA is content-sized — the standing "no control spans the whole width"
    rule, which on this page also means "no wall laid across the road";
  · exactly one action, because a door has one.

AND ONE THAT IS THE SCENE'S, measured here because this is the surface where
the scene fills the whole screen and is judged as a picture. Every scenery pass
used to start at z ~ 0.15 — the start of the COURSE — while the camera sits
about 1.16 stops BEHIND goal 1 and can be dragged further back still, so the
nearest stretch of ground had nothing planted in it at all. That is the bottom
fifth of the frame, where the picture is biggest, on the first view every
learner and every visitor meets. Measured before: 196 sprites, 116 of them
packed into one band at the horizon, SIX in the bottom third and none at all
below 80%. After: 278 and 71. The floor is 12 — this catches the near ground
going empty again, it does not pin a density.

Break-tested by putting the scenery's start back to z = 0.15: red on the
desktop and the phone, "only 6 of 196".

THREE VIEWPORTS, because this is a geometry fault. The desktop and the phone
both passed the first build; the phone HELD SIDEWAYS did not, and that is the
case that found the real bug: at 844×390 the sky is about 113px deep, and the
two-line subline ran from 113 to 171 — across the horizon and over goals 5 and
6. Below 480px of height the subline is now dropped.

Break-tested twice: moving the welcome block from the sky to 30% of the frame
goes red on all three viewports naming the h1 and the p by their measured
tops; giving the CTA `w-full` goes red naming its width against the page's.

THE EXPORT MUST BE OPEN, for the reason verify79 states. In verify.yml this
runs after the same `NEXT_PUBLIC_OPEN_APP=1 npm run build` step the road scan
and the night sweep use.

Run from the repo root:  python3 verify/verify151-landing-page.py
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

fail = []
body = open(os.path.join(ROOT, "src/app/welcome/WelcomeBody.tsx"), encoding="utf-8").read()

# The scene IS the page. `fill` is what strips the card — border, corners,
# shadow, the 520/640px height, the 68vh cap — and drops the map's own
# furniture. Without it this is a headline over a postcard.
if not re.search(r"<HomeMap3D[^>]*\bfill\b", body, flags=re.S):
    fail.append("/welcome no longer renders the scene with `fill` — the map goes back to "
                "being a card on the page instead of being the page")

# The page must be as tall as the screen and no taller. 100dvh, not 100vh:
# a phone measures vh against its TALLEST chrome state, so a vh page hides its
# own bottom — the CTA — behind the address bar on arrival.
if "h-[100dvh]" not in body:
    fail.append("the page is no longer sized in dvh. With vh, a phone's address bar "
                "covers the bottom of the page on arrival, and the bottom of this page "
                "is the only button on it")

for m in fail:
    print(f"  FAIL {m}")
if fail:
    print(f"\n{len(fail)} failed")
    sys.exit(1)
print("  ok   the scene fills the page, and the page is sized to the visible screen")

# THE LANDING PAGE IS THE ROOT SINCE 2026-09-09 (Dan: "the first i see must
# be the one with Welcome to FluOLinGo in the horizon", and, asked, on every
# visit). It was /welcome; that address still exists and forwards here, so the
# page to probe is out/index.html.
probe = os.path.join(ROOT, "out/index.html")
if not os.path.isfile(probe):
    print("FAIL  out/ has no root page — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/landing-scan.mjs"], cwd=ROOT).returncode)
