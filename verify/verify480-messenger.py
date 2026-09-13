#!/usr/bin/env python3
"""
One messenger, two surfaces — and every class it names actually exists.

WHY THIS EXISTS. Dan, 2026-09-13: *"the interface for all things chat-related
ChaTutor and ComposeIt please adopt the UI UX of how modern messenger works !"*

"All things chat-related" is the part a check has to hold. ChaTutor and
ComposeIt's dialogue mode had each grown a chat BY HAND, and by the time anyone
put them side by side they had drifted in ways nobody had chosen:

    ChaTutor    the 🤖 lived INSIDE the reply's text, so it came along when a
                learner copied the French out
    ComposeIt   the persona emoji was a span of its own
    ChaTutor    Enter sent the message
    ComposeIt   Enter did nothing; you had to reach for a button
    both        the input sat in the page flow, so on a long conversation the
                place you type scrolled off the bottom

Nothing there is a bug anyone would file. That is exactly why it needs a check:
two hand-rolled copies of one idea drift silently, and the fix — a shared kit —
only stays a fix while both surfaces actually use it.

THE THIRD CLAUSE IS THE ONE THAT EARNS ITS KEEP. A `.msgr-*` class that is
typo'd or renamed does not throw, does not warn, and does not fail a build: the
element simply renders unstyled, which on a bubble means a run of plain text
where a bubble used to be. Nothing but a screenshot would catch it, and only
if someone happened to open that surface.

Run from the repo root:  python3 verify/verify480-messenger.py
"""
import re, sys
from pathlib import Path

PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

ROOT = Path(".")
CSS = (ROOT / "src/app/globals.css").read_text(encoding="utf-8")

# The surfaces that must BE the messenger rather than imitate one. Add a file
# here when a new chat surface appears — that is the whole cost of the rule.
SURFACES = {
    "src/components/tools/ChaTutorPanel.tsx": "ChaTutor",
    "src/games/compose/ComposeDialogue.tsx": "ComposeIt (dialogue)",
}

# ── 1 · both surfaces use the shared kit ───────────────────────────────────
missing = []
for path, name in SURFACES.items():
    src = (ROOT / path).read_text(encoding="utf-8")
    for part in ("chat/ChatThread", "chat/ChatComposer"):
        if part not in src:
            missing.append(f"{name} ({path}) does not import {part}")
ok(not missing,
   f"both chat surfaces are built from components/chat ({len(SURFACES)} surfaces)",
   "a chat surface has stopped using the shared kit, which is how the two drifted "
   "apart in the first place:\n        " + "\n        ".join(missing))

# ── 2 · neither surface hand-rolls a thread of its own ─────────────────────
# The tell is a side-switching row: a flex container that justifies to one end
# or the other depending on who is speaking. That is the line both files used
# to open their bubble loop with, and it is what a re-grown chat would start
# from again.
HAND_ROLLED = re.compile(r"justify-(end|start)\W[^\n]*\?|\?[^\n]*justify-(end|start)")
rolled = []
for path, name in SURFACES.items():
    src = (ROOT / path).read_text(encoding="utf-8")
    for i, line in enumerate(src.splitlines(), 1):
        if HAND_ROLLED.search(line) and "msgr" not in line:
            rolled.append(f"{path}:{i}  {line.strip()[:90]}")
ok(not rolled,
   "neither surface rolls its own bubble row",
   "a chat surface is laying out its own left/right bubbles again — that belongs "
   "in components/chat, or both copies will drift:\n        " + "\n        ".join(rolled))

# ── 3 · every msgr-* class used in the app is defined in the CSS ───────────
# Both directions, because each failure is silent in its own way: a class the
# CSS does not define renders an unstyled element, and a class nothing uses is
# dead weight that the next reader takes for load-bearing.
defined = set(re.findall(r"\.(msgr-[a-z0-9-]+)", CSS))
used = set()
for f in list((ROOT / "src").rglob("*.tsx")) + list((ROOT / "src").rglob("*.ts")):
    used |= set(re.findall(r"\bmsgr-[a-z0-9-]+", f.read_text(encoding="utf-8")))
# `msgr` itself is the root class and carries no dash, so it is checked apart.
undefined = sorted(used - defined)
ok("msgr" in re.findall(r"\.(msgr)\b", CSS) and not undefined,
   f"every msgr-* class the app uses is defined in globals.css ({len(used)} used, {len(defined)} defined)",
   "a messenger class is used but never defined — the element renders unstyled, "
   "which on a bubble means a line of bare text and no error anywhere:\n        "
   + ", ".join(undefined))

unused = sorted(d for d in defined - used
                # State and structural classes are set by the kit's own JSX
                # through template strings, or exist only as modifiers.
                if not d.startswith(("msgr-run", "msgr-bubble", "msgr-typing")))
ok(not unused,
   f"no messenger class is defined and never used ({len(defined)} defined)",
   "a messenger class is defined in globals.css and used nowhere — dead CSS the "
   "next reader will take for load-bearing:\n        " + ", ".join(unused))

# ── 4 · the kit is not nailed to a pixel ──────────────────────────────────
# Dan, 2026-09-12: *"PLEASE NEVER EVER HARD CODE FONT SIZES AND BUTTON SIZES
# !!!"*. The one exemption is the 44px finger floor, and only inside `max()`,
# which is exactly the shape verify270 names: a floor that shrank with the type
# would stop being a floor.
# COMMENTS ARE STRIPPED FIRST. The first draft scanned the raw block and
# reported « 430px » and « 58px » — both of them inside the prose explaining
# where a measurement came from. A check that flags its own reasoning teaches
# the next person to write thinner comments, which is the opposite of what this
# repo wants.
block = CSS[CSS.index("═══ THE MESSENGER"):]
block = re.sub(r"/\*.*?\*/", "", block, flags=re.S)
pixels = []
for line in block.splitlines():
    if "px" not in line:
        continue
    for hit in re.findall(r"[-\d.]+px", line):
        if hit in ("2px", "-2px", "0px", "1px", "8px", "48px"):
            continue  # border widths, a shadow, and the thread's scroll slack
        if hit == "999px" and "border-radius" in line:
            continue  # "as round as it goes" — a shape, not a measurement
        if hit == "44px" and "max(" in line:
            continue  # the finger floor, pinned as verify270 requires
        pixels.append(f"{hit} in: {line.strip()[:80]}")
ok(not pixels,
   "no size in the messenger is nailed to a pixel (the 44px finger floor aside)",
   "a hard-coded size crept into the messenger — every length here is `em` off "
   "the bubble's own font, or a `calc()` on --fs-step:\n        " + "\n        ".join(pixels))

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
