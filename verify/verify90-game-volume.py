#!/usr/bin/env python3
"""Every game shows the volume button, and the bar it sits on cannot leave
(Dan, 2026-09-02: "some games are missing the volume button", then naming
them: "Numbers Numbus Numbourse").

Two faults, measured before fixing:

  1. SOUND WAS BURIED. Patch 23 folded SoundControl into GameFrame's ⋯
     sheet, which made the games the only surfaces in the app without the
     visible 🔊 every page's top bar shows. The control belongs ON GameBar —
     the same component the site bar mounts, so a mute here is a mute
     everywhere — and the ⋯ sheet must NOT also carry it (two doors to one
     control on one screen is the HelpDot fault the deck band already paid
     for).
  2. THE BAR COULD SCROLL AWAY. The site layout stacks its footer under the
     100dvh frame, so a game page was ~90px taller than the screen —
     focusing NumBus's keypad scrolled the whole bar (✕, 🔊, ⋯) off the top:
     bar measured at y=-85 with scrollY 85. GameFrame now pins the viewport
     while mounted and releases it on unmount.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
fails: list[str] = []


def ok(cond: bool, what: str, why: str) -> None:
    if not cond:
        fails.append(f"  ✗ {what}\n    {why}")


def read(p: str) -> str:
    return (ROOT / p).read_text(encoding="utf-8")


bar = read("src/components/GameBar.tsx")
frame = read("src/components/GameFrame.tsx")

# ---- 1 · the 🔊 is on the bar, and only there --------------------------
ok("<SoundControl" in bar,
   "GameBar mounts SoundControl — the visible 🔊 on every game",
   "the games are again the only surfaces without the volume button their "
   "learner sees on every other page")
ok("<SoundControl" not in frame,
   "GameFrame's ⋯ sheet no longer duplicates it",
   "two doors to one control on one screen — the HelpDot fault again")

# ---- 2 · the frame pins the viewport ------------------------------------
ok(re.search(r'documentElement\.style\.overflow\s*=\s*"hidden"', frame) is not None
   and "window.scrollTo(0, 0)" in frame,
   "GameFrame locks page scroll while a game is mounted",
   "the layout's footer makes a game page ~90px taller than the screen, and "
   "a keypad focus scrolls ✕, 🔊 and ⋯ clean off the top — NumBus, measured")
ok(re.search(r"return\s*\(\)\s*=>\s*\{[^}]*overflow\s*=\s*prev", frame) is not None,
   "and unlocks it on the way out",
   "leaving a game would leave the whole site unscrollable")

if fails:
    print("verify90-game-volume: FAIL")
    print("\n".join(fails))
    sys.exit(1)
print("verify90-game-volume: ok — 🔊 on every game's bar, and the bar stays put")
