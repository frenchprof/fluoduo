#!/usr/bin/env python3
"""
A game sits IN a page, and full screen is a key you press — not the default.

Dan, 7 Sep: "for the games like lexicalator and vocabularain, can we have them
embedded like the map, (with option to go full screen), and remember the
landscape modes", then "and watch out for the desktop version for all pages",
and when asked which games: "Mostly VocabulaRain, Lexicalator, Numbus and
Numbourse."

WHAT EACH ASSERTION IS FOR — every one is a fault that was on screen, not a
hypothetical:

  1  EMBEDDED IS THE DEFAULT. GameFrame was `height: 100dvh` unconditionally,
     so opening LexicaLater replaced FluOLinGo: no band naming the activity,
     no spine, no way back except the game's own ✕. The frame is boxed now and
     `position: fixed` appears only on the full-screen branch. If the fixed
     overlay ever becomes the resting state again, this goes red.

  2  THE BOX HAS A FLOOR AND A CEILING. A bare `74dvh` is two different bugs
     at once: a phone held sideways is ~390px tall, so the board came out at
     ~280px, and a tall desktop monitor gave a board whose bottom row was off
     the fold. `clamp(340px, 74dvh, 640px)` is the floor for landscape and the
     ceiling for the desktop, and both numbers are load-bearing — a clamp with
     a dvh floor or no ceiling is the same bug wearing a clamp.

  3  THE ⛶ KEY IS ON THE BAR, NOT IN THE SHEET. Full screen is reached for
     mid-game; a control you must open a bottom sheet to find is a control
     nobody uses. It must also say which state it is in (`aria-pressed`), or a
     screen-reader user cannot tell full from boxed.

  4  THE VIEWPORT PIN IS FULL-SCREEN ONLY. `documentElement.style.overflow =
     "hidden"` is what stops the GameBar scrolling off the top of a fixed
     overlay. Applied while EMBEDDED it freezes the page the game is sitting
     in, so the learner cannot scroll to anything below the board. The effect
     must bail before touching overflow when the frame is boxed.

  5  THERE IS A KEYBOARD WAY OUT. A fixed overlay covering the whole screen
     with no Escape is a trap for anyone not on a touchscreen.

  6  THE CHROME BELONGS TO THE BOX. Rounded corners, the border and the card
     shadow are how the frame reads as an object on the page; drawn on a
     full-screen overlay they are a 2px line round the edge of the display.

  7  THE FOUR GAMES DAN NAMED ARE ALL WRAPPED. The point is not one game in a
     page — it is that a learner meets every game the same way. All four go
     through GameLanding with `bleed`, so the band, the emoji and the blurb
     come from the registry rather than being retyped per route.

  8  A PLAYING GAME HAS NO HEADER. The landing printed the activity's name
     and blurb one line under a heading band already reading VOCABULARAIN in
     that activity's colour — the litmus test's exact case. Measured on a
     390×844 phone: with the header, VocabulaRain's puddle row — the four
     things you tap — sat on the very bottom edge of the screen, under the
     feedback bubble. Without it the frame's bottom edge is at 757px and the
     whole game is on one screen, which is the collapse rule.
     A SETTINGS step keeps its heading; that page is text.

  9  BLEED ACTUALLY BLEEDS. The landing's reading column (`max-w-3xl px-4`)
     left a 390px phone only 265px of board — 68% of the screen, with the
     game squeezed to make room for a margin nobody reads. While `bleed` the
     column widens and the side padding goes to zero on a phone.

Run from the repo root:  python3 verify/verify121-embedded-games.py
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
    """Drop // and /* */ and {/* */} so an assertion cannot be satisfied by
    the paragraph explaining the thing it is meant to be checking."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


frame = strip_comments(read("src/components/GameFrame.tsx"))
bar = strip_comments(read("src/components/GameBar.tsx"))
landing = strip_comments(read("src/components/GameLanding.tsx"))

# 1 ── embedded is the default; fixed is the exception.
m = re.search(r"const frameStyle[^=]*=\s*full\s*\?(.*?)\n\s*:\s*\{(.*?)\n\s*\};",
              frame, flags=re.S)
check(m is not None,
      "GameFrame picks its box from `full` — one style when full, another when "
      "embedded",
      "GameFrame no longer branches its frame style on `full`; the assertions "
      "below cannot tell the two states apart")
full_style, box_style = (m.group(1), m.group(2)) if m else ("", "")
check('position: "fixed"' in full_style and "fixed" not in box_style,
      "only the full-screen branch is a fixed overlay",
      "the EMBEDDED branch has become position:fixed — the game has gone back "
      "to replacing the page instead of sitting in it")
check("100dvh" in full_style and "100dvh" not in box_style,
      "100dvh belongs to full screen alone",
      "the embedded frame is 100dvh tall again, which is the whole screen with "
      "the page's chrome pushed off it")

# 2 ── the box has a floor and a ceiling, both in px.
cl = re.search(r"height:\s*\"clamp\(\s*([\d.]+)px\s*,\s*[^,]+,\s*([\d.]+)px\s*\)\"",
               box_style)
check(cl is not None,
      "the embedded height is a clamp between two pixel bounds",
      "the embedded height has lost its px floor or px ceiling — a bare dvh "
      "gives a ~280px board on a phone held sideways and an unreachable bottom "
      "row on a desktop monitor")
if cl:
    check(float(cl.group(1)) >= 320,
          f"the landscape floor is {cl.group(1)}px, tall enough to play in",
          f"the floor has dropped to {cl.group(1)}px — that is below the board "
          f"height a phone held sideways was already giving before this work")
    check(float(cl.group(2)) <= 720,
          f"the desktop ceiling is {cl.group(2)}px, so the board stays in view",
          f"the ceiling has risen to {cl.group(2)}px, which is taller than the "
          f"fold on a laptop")

# 3 ── the key is on the bar, and it says which state it is in.
check("onToggleFull" in bar and "onToggleFull" in frame,
      "GameFrame hands the toggle to GameBar",
      "the full-screen toggle is no longer wired from the frame to the bar")
btn = re.search(r"\{onToggleFull && \((.*?)\n\s*\)\}", bar, flags=re.S)
check(btn is not None and "aria-pressed" in btn.group(1),
      "the ⛶ key declares its own state with aria-pressed",
      "the ⛶ key does not say whether it is on — a screen-reader user cannot "
      "tell a boxed game from a full-screen one")
check("gap-1.5" in bar and "sm:gap-3" in bar and "sm:h-9 sm:w-9" in bar,
      "the bar tightens on a narrow board instead of running off its edge",
      "the bar is back to one fixed gap and one fixed key size — measured at "
      "293px of embedded board, ✕ + progress + ♥♥♥ + score + 🔊 + ⛶ + ⋯ come "
      "to 336px and the ⋯ is half off the right edge")
check("⛶" in bar,
      "the ⛶ key is on the bar, beside ⋯",
      "the ⛶ key has left the bar; a control buried in the ⋯ sheet is one "
      "nobody reaches for mid-game")

# 4 ── the pin is full-screen only.
pin = re.search(r"useEffect\(\(\) => \{(.*?documentElement\.style\.overflow.*?)\}, \[full\]\)",
                frame, flags=re.S)
check(pin is not None and re.search(r"if \(!full\) return;", pin.group(1)),
      "the viewport pin bails out while the game is embedded",
      "the frame pins documentElement overflow even when embedded — the page "
      "around the game would stop scrolling")

# 4b ── a sideways phone opens full.
land = re.search(r"useEffect\(\(\) => \{(.*?matchMedia.*?)\}, \[\]\)", frame, flags=re.S)
check(land is not None
      and "max-height" in land.group(1)
      and "orientation: landscape" in land.group(1)
      and "pointer: coarse" in land.group(1),
      "a short touchscreen in landscape opens the game full, and only that",
      "the landscape rule is gone or has lost one of its three conditions — "
      "without max-height a tall phone goes full, without pointer:coarse a "
      "desktop window someone dragged short goes full on them")

# 5 ── Escape leaves full screen.
esc = re.search(r"useEffect\(\(\) => \{(.*?Escape.*?)\}, \[full\]\)", frame, flags=re.S)
check(esc is not None and "setFull(false)" in esc.group(1),
      "Escape leaves full screen",
      "the full-screen overlay has no keyboard way out")

# 6 ── the box's chrome is the box's.
chrome = re.search(r"full \? \"\" : \"([^\"]*)\"", frame)
check(chrome is not None
      and "rounded" in chrome.group(1)
      and "border" in chrome.group(1),
      "the border and the rounding are drawn only while embedded",
      "the frame's card chrome is no longer conditional on `full` — a border "
      "and rounded corners round the edge of the whole display")

# 7 ── all four of the games Dan named go through the landing, bleeding.
GAMES = {
    "src/app/games/vocabularain/[setId]/page.tsx": "vocabularain",
    "src/app/games/lexicalater/[deckId]/page.tsx": "lexicalator",
    "src/app/games/numbus/page.tsx": "numbus",
    "src/app/games/numbourse/page.tsx": "numbourse",
}
for path, key in GAMES.items():
    src = strip_comments(read(path))
    check(f'<GameLanding activityKey="{key}" bleed>' in src,
          f"{key}: the game is wrapped in its own landing shell",
          f"{key}: the game is no longer inside GameLanding — it is back to "
          f"being the whole page, with nothing on screen naming the activity")

# 8 ── a playing game has no header; a settings step keeps one.
check("{!bleed && (" in landing and "<header" in landing,
      "the header is drawn only on a settings step, never over a board",
      "the landing draws its header while playing again — the name and blurb "
      "repeat the band directly above them and cost the board ~98px")
check(landing.count("<header") == 1,
      "there is one header in the landing, not a second copy for `bleed`",
      "a second <header> has appeared — the point was to have none while "
      "playing, not to have two spellings of one")

# 9 ── bleed actually bleeds.
col = re.search(r"bleed \? \"([^\"]*)\" : \"([^\"]*)\"", landing)
check(col is not None and "px-0" in col.group(1) and "px-4" in col.group(2),
      "a playing game gets the phone's full width; a settings step keeps its "
      "margin",
      "the bleed column still carries the landing's side padding, which is the "
      "125px of a 390px phone the board was losing")

# 10 ── the game's own labels size to the board, not to the phone.
letris = strip_comments(read("src/games/letris/LetrisGame.tsx"))
check("binFont" in letris and "var(--board-w" in letris,
      "VocabulaRain's puddle labels are sized from the board's own width",
      "the puddle labels are back to a fixed size — at 293px of board that is "
      "« LÉGUME » and « BOISSO », each word clipped by its neighbour")
check("useBoardSize" not in letris,
      "the sky no longer sizes itself from a hook that cannot work here",
      "the board size is back on `useBoardSize()` — this component RENDERS "
      "GameFrame, so that hook sits above its own provider and returns {0,0}: "
      "every row silently becomes the 48px fallback and 10 of them plus the "
      "puddle row do not fit a 565px board")
check(re.search(r"gridTemplateRows: `repeat\(\$\{ROWS\}, minmax\(0, 1fr\)\)`", letris)
      and "flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl" in letris,
      "the sky is a flex child whose rows divide the room it is given",
      "the sky is back to fixed row heights — at 334px of board (a sideways "
      "phone) ten of them plus the puddle row overflow, and it is the puddles "
      "that go, which are the only things you tap")
check('className="grid shrink-0 border-t-4' in letris,
      "the puddle row keeps its height while the sky gives way",
      "the puddle row can be squashed by the flex column — the row that must "
      "never shrink is the one the learner aims at")
check(not re.search(r"text-sm[^\"]*tracking-wider[^\"]*sm:text-base", letris),
      "no fixed type size is left on the puddles to fight the computed one",
      "a Tailwind text size is back on the puddle buttons alongside the "
      "computed one — one of the two wins and it will not be the measured one")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
