#!/usr/bin/env python3
"""verify211 — the map's wheel comes back, and the finger is left alone.

Dan, 2026-09-11: *"scrolling up and down the 3d map : by default it should be
the other way around, At the same time we also want the user to decide IN THE
SETTINGS which way is more naturel for him"* — and then, before anyone could
get it wrong:

    "there are two things: swipe down with finger, and scroll down with mouse.
     don't confuse them"

He was right to draw that line, and measuring it showed why. The box is a
native scroll container, so both inputs arrive as the same `scrollTop` — but
they are not the same gesture, and from one starting point they already did
OPPOSITE things:

    wheel down    goals 1-14 -> 2-17     the camera travelled AWAY, up the road
    finger down   goals 1-14 -> 1-12     the road came TOWARD the viewer

Each matched its own convention: a wheel scrolls a page, a finger drags the
thing under it. Shown both, Dan picked — *"the wheel is the wrong one"*. So the
wheel is flipped and the finger is untouched. **Flipping the scroll container
would have flipped both**, and that is the fault this check exists to catch.

WHY IT IS DRIVEN AND NOT GREPPED, and this is the whole reason for the file.
The flip is a cancelled wheel event, and `preventDefault()` is IGNORED on a
passive listener — which is exactly what React attaches for an `onWheel` prop.
A source check would find the handler, read it as correct, and pass a build
where the wheel had quietly gone back to scrolling forward. Nothing would
error. Only the running page knows.

The half that must NOT change cannot be grepped at all: nothing in the source
says "the finger still works", because the finger works by the browser doing
what it always does.

Three cases, each driven on the built app:
  · the wheel at the new default — must bring the road toward the viewer;
  · the wheel with the setting turned off — must hand the old behaviour back;
  · a real finger drag — must be exactly as it was.

Break-tested three ways: registering the listener as passive (the default case
goes red naming the moved distance); flipping the scroll container instead of
the wheel (the FINGER case goes red, which is the point); and dropping the
`still` guard, which cancels a wheel on the door where nothing scrolls.

THE EXPORT MUST BE OPEN, for the reason verify79 states. In verify.yml this
runs after the same `NEXT_PUBLIC_OPEN_APP=1 npm run build` the other scans use.

Run from the repo root:  python3 verify/verify211-map-wheel.py
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

fail = []

src = open(os.path.join(ROOT, "src/components/HomeMap3D.tsx"), encoding="utf-8").read()
# Comments explaining the rule must not satisfy the rule — the trap verify152
# and verify153 each hit on their first run.
code = re.sub(r"/\*[\s\S]*?\*/", "", src)
code = re.sub(r"(?m)^\s*//.*$", "", code)

if "{ passive: false }" not in code:
    fail.append("the wheel listener is not registered with `{ passive: false }`. "
                "preventDefault() is ignored on a passive listener, so the flip stops "
                "happening and NOTHING reports it")
if 'addEventListener("wheel"' not in code:
    fail.append("no real wheel listener on the scene box. React's `onWheel` is attached "
                "passive, so it cannot cancel the scroll it needs to replace")

prefs = open(os.path.join(ROOT, "src/lib/uiPrefs.ts"), encoding="utf-8").read()
if "wheelDownComesBack: true" not in prefs:
    fail.append("the default is no longer 'wheel down comes back'. Dan asked for the "
                "behaviour changed AND a setting to change it back, in that order")

# 12 Sep: /reglages became a redirect to the User page's Settings tab, so the
# switch itself lives here now. This check is the reason the move did not eat
# it — it read for `wheelDownComesBack`, did not find it, and said so.
reglages = open(os.path.join(ROOT, "src/app/reglages/SettingsContent.tsx"), encoding="utf-8").read()
if "wheelDownComesBack" not in reglages:
    fail.append("Settings no longer offers the choice. Dan asked for it by name: "
                "\"we also want the user to decide IN THE SETTINGS which way is more "
                "naturel for him\"")

for m in fail:
    print(f"  FAIL {m}")
if fail:
    print(f"\n{len(fail)} failed")
    sys.exit(1)
print("  ok   the wheel is cancelled by a non-passive listener, and Settings offers the choice")

probe = os.path.join(ROOT, "out/home.html")
if not os.path.isfile(probe):
    probe = os.path.join(ROOT, "out/home/index.html")
if not os.path.isfile(probe):
    print("FAIL  out/ has no Home — build first: NEXT_PUBLIC_OPEN_APP=1 npm run build")
    sys.exit(1)

sys.exit(subprocess.run(["node", "scripts/wheel-scan.mjs"], cwd=ROOT).returncode)
