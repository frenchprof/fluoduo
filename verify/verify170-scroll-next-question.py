#!/usr/bin/env python3
"""One gesture, two answers — and it may never answer a question for you.

Dan, 2026-09-07: *"the technique you used for going to a different page by just
scrolling is something we want replicate across all activities, but between
questions of the same lesson, instead of scrolling into another url, it should
be scrolling to the next bookmarked item below on the same page"*.

Two surfaces already did it — SpecuLearn and the goals scroller stack their
questions in a SnapFeed, so a swipe moves one row. The other eleven activities
could not, because a drill GENERATES its next question from the answer you just
gave: there is nothing below to scroll to until you have answered. What they
all share is DrillShell, so the pull past the end presses that shell's one
visible button.

THREE THINGS HOLD IT UP, and each of them is a way the feature turns from a
convenience into a fault:

 1 · THE GATE. The gesture may only fire the TRAY's Continue or a finished
     run's « Next › » — never the base « Check ». Lose the gate and a scroll
     answers an unread question, or skips it: the learner is graded on a card
     they never saw. This is the one that must never come out.
 2 · THE HATCH. Two readers of one gesture live on a drill page — the rail's
     and the shell's. Without `data-no-scroll-on` a single pull fires both, so
     the question advances AND the page navigates away from it.
 3 · ONE READER. The finger is read in `usePullPastEnd` and nowhere else. The
     rail and the shell differ only in where the pull LEADS. Two copies of the
     reading is how the app came to have two ideas of "forward" on 6 Sep, which
     is the fault verify117 exists for.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
fails = []

hook = SRC / "components" / "usePullPastEnd.ts"
shell = SRC / "components" / "DrillShell.tsx"

if not hook.exists():
    fails.append(
        "components/usePullPastEnd.ts is gone — the pull past the end has no reader.\n"
        "    Both the rail's carry-on and a drill's next question are that one gesture."
    )
else:
    h = hook.read_text(encoding="utf-8")
    # THE HOOK NEVER NAVIGATES. It reads a finger and calls back; where the
    # pull leads is the caller's to answer. A route spelled inside the gesture
    # reader is exactly the 6 Sep state by another name.
    for bad in ("router.push", "location.href", "location.assign", "location.replace"):
        if bad in h:
            fails.append(
                f"usePullPastEnd navigates ({bad}). It must only read the gesture —\n"
                "    the rail decides a station, DrillShell decides a question, and\n"
                "    neither belongs inside the reader they share."
            )

if not shell.exists():
    fails.append("components/DrillShell.tsx is gone.")
else:
    d = shell.read_text(encoding="utf-8")
    if "usePullPastEnd" not in d:
        fails.append(
            "DrillShell no longer reads the pull past the end.\n"
            "    Eleven activities advance by that gesture and by nothing else Dan\n"
            "    asked for; without this line a learner is back to hunting for the\n"
            "    Continue button on every question."
        )
    # GUARD 1 — the gate. `pullable` is `!!feedback || !!finish`: the tray is up,
    # or the run is over. Anything looser reaches the base « Check ».
    if "const pullable = !!feedback || !!finish" not in d:
        fails.append(
            "DrillShell's pull is no longer gated on the tray being up.\n"
            "    The gesture may fire the tray's Continue or a finished run's Next,\n"
            "    and NOTHING else. Ungated, a scroll answers or skips a question the\n"
            "    learner has not read — the drill grades a card they never saw."
        )
    # GUARD 2 — the hatch IS the gate, and the two were separated for exactly
    # one day. `owns` used to be "the shell has a footer action at all", so a
    # drill claimed the pull while « Check » was on screen and then did nothing
    # with it. That was defensible while downwards meant LEAVE THE ACTIVITY.
    #
    # Dan's grid (2026-09-08) made downwards mean the next GOAL, same activity —
    # so there is nothing to protect a learner from, and swallowing the gesture
    # broke it. Measured: from a fresh lesson the pull carried on; from the
    # lesson it landed on it never worked again, because the arriving lesson
    # opens on its level picker, which gives the shell a `cta`, which planted
    # the hatch for a gesture the shell then ignored.
    if "const owns" in d:
        fails.append(
            "DrillShell has a hatch wider than its gate again.\n"
            "    A shell that stands the rail down for a gesture it does not act on\n"
            "    is a dead end: measured on the built export, three pulls in a row\n"
            "    refused and there was no way on to the next goal."
        )
    if 'data-no-scroll-on={pullable ? "" : undefined}' not in d:
        fails.append(
            "DrillShell no longer marks itself `data-no-scroll-on` while it can act.\n"
            "    The rail reads the same pull on the same page: without the hatch one\n"
            "    gesture advances the question AND carries the learner to the next goal."
        )

if fails:
    print("verify170: the scroll between questions has come apart.\n")
    for f in fails:
        print("  ✗ " + f + "\n")
    sys.exit(1)
print("verify170 ok — one reader for the pull, gated on an answered question, "
      "and the rail stands down while a drill can act on it.")
