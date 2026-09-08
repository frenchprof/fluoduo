#!/usr/bin/env python3
"""
Two faults a phone could never show: the desktop pass of 7 Sep.

Dan: *"and watch out for the desktop versio for all pages"*, then *"fix
everything, show me at the end"*.

Twenty-four page types were driven at 1440×900 and measured, not eyeballed —
no horizontal scroll anywhere, no single control wearing the page's width, and
nothing painted outside the notebook. Two things were genuinely wrong, and both
are invisible on a phone, which is why they had survived.

  1  THE DECK PAGE DREW ITS VIEW SWITCH TWICE. `VIEW_TABS` was handed to
     CahierFrame AND mapped into the "View & mode" row, so a desktop showed
     « ▦ List · ▤ All » in the row and the same pair again as flaps off the
     right edge of the paper. Both called the same `setView`. Below the `sm`
     breakpoint the flap rail collapses into ☰, so a phone only ever showed
     one — which is exactly why nobody caught it. Two doors to one control on
     one screen is the HelpDot fault the repo has named before.

     The row is the one Dan designed (2026-07-20: views as short buttons, the
     study–test switch beside them, the drill's door first), so the rail is
     the copy that goes. Measured after: the notebook page went from 1172px to
     1354px wide, matching every other page in the app, because the rail was
     taking a bite out of the desk.

  2  HOME'S MAP POSTCARD WAS A LETTERBOX ON A WIDE SCREEN. The crop was
     `h-[330px]` — a fixed slice of map height at EVERY card width. On a phone
     that is 293×153, the deliberate glimpse Dan designed. On a 1440px desktop
     the card grows to 764px wide and stayed 153px tall: a 5:1 slot showing
     three rows of stops out of ten, with the « Enter the map » band lying
     across the third.

     Above `sm` it takes a ratio instead. A ratio is scale-invariant, so it
     survives the card's 0.44 zoom with no arithmetic against it. The number
     itself was settled by Dan on 8 Sep, from three heights rendered side by
     side; he picked the middle, and 3.7 is what puts the card there — 202px on
     a 1440 desktop, against 234px at the 3.2 first shipped here. So the
     assertion below holds that a ratio EXISTS, not which one: the height is
     Dan's to move, the letterbox is the fault.

     THE PHONE MUST NOT MOVE. `h-[330px]` stays as the base and the ratio is
     an `sm:` override, so a phone renders 293×153 exactly as before. An
     assertion below holds that, because "improve the desktop" is precisely
     the kind of change that quietly costs the phone its design.

Run from the repo root:  python3 verify/verify124-desktop-pass.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(rel):
    return open(os.path.join(ROOT, rel), encoding="utf-8").read()


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


deck = strip_comments(read("src/app/decks/[id]/CuratedDeckTable.tsx"))
frame = strip_comments(read("src/app/practice/flip-it/CahierFrame.tsx"))
home = strip_comments(read("src/app/HomeDashboard.tsx"))

# 1 ── one view switch on the deck page, not two.
check(re.search(r"<CahierFrame\s+tabs=\{\[\]\}", deck) is not None,
      "the deck page hands CahierFrame no tabs — it draws its own view switch",
      "the deck page passes tabs to CahierFrame again, so « ▦ List · ▤ All » "
      "is drawn twice on a desktop: once in the 'View & mode' row and once as "
      "flaps off the right edge, both driving the same setView. A phone hides "
      "the rail below `sm`, so this does not show there")
check(deck.count("VIEW_TABS.map(") == 1,
      "VIEW_TABS is rendered in exactly one place",
      "VIEW_TABS is mapped more than once — the duplication is back, in a "
      "different shape")
check(re.search(r"\{tabs\.length > 0 && \(", frame) is not None,
      "CahierFrame draws no rail when it is given no tabs",
      "CahierFrame renders its <nav> unconditionally again — with an empty "
      "tabs array that is an empty rail still taking its width, leaving a bite "
      "out of the desk beside the paper")

# 2 ── THE POSTCARD IS GONE, so its three assertions went with it.
#
# They pinned a card that no longer exists: Home's cropped 2D map under the
# « Enter the map » band. Dan retired it on 8 Sep, shown a screenshot of it —
# *"retire the unresponsive 2d map with start here button. we have replaced
# that with the new landing page that peers has edited"*, then *"we don't
# need this anymore"*.
#
# THIS IS A RETARGET, NOT A RELAXATION, and the difference is where the
# ruling went rather than whether it survives. What these three held was
# "the postcard must not letterbox on a desktop" — a rule about a card. The
# card is retired, so the rule has no subject here; `verify80-home-postcard`
# now fails if any map comes back to Home, which is the stronger claim and
# the one Dan actually made. Section 1 above is untouched: the deck's view
# tabs and CahierFrame's rail are the rest of the same desktop pass and are
# still live.

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
