#!/usr/bin/env python3
"""
No CONTROL is nailed to a pixel — the other half of the font rule.

***Dan, 2026-09-12: "PLEASE NEVER EVER HARD CODE FONT SIZES AND BUTTON SIZES
!!!"*** — said after a goal-card row whose tiles were pinned to `5.958rem`, a
width lifted from the ☰ menu's dropdown, which fitted two across a phone and
would not count the room it was actually given.

WHY IT NEEDED ITS OWN RULE. The font half has held since 5 Sep and verify106
enforces it. That is exactly what made this fault hard to see: the TEXT was
obedient and the BOX around it was frozen, so they came apart on a big screen.

    tile width  w-[5.958rem]          phone 95px  · desktop 95px
    name inside text-[16px] (ramped)  phone 16px  · desktop ~21px

The name grew a third, the box did not, and « GramMarathon » rendered as
« GramMara… ». Nobody reads that as a hard-coded width; they read it as a name
that is too long, and the next session shortens the name. A fault that
disguises itself as a content problem is worth a check on its own.

A CONTROL'S SIZE IS EITHER COUNTED OR RAMPED, and the app already has both:

    counted   .fluo-tilegrid   no column wider than half, none narrower than a
                               quarter — two to four, counting the room
    ramped    calc(4rem + var(--fs-step) * 4)
                               64px on a phone, growing with its own label

A bare `w-[95px]` on a control is neither.

WHAT THIS IS NOT: A SWEEP. There were 127 arbitrary box sizes across 34 files when this was written,
and most are not controls at all — a 6px progress rail, an 18px swatch, a
`max-w-[600px]` reading column. Failing all of them would paint every pull
request red on day one, which is the mistake AGENTS.md already records about
lint. So this holds two narrow things instead:

  1 · THE SHARED CONTROL DEFINITIONS carry no frozen box. These are named one
      by one, because each of them sizes every door in the app at once — the
      same reason verify119 keeps a LIST of banned fonts rather than one name.

  2 · A RATCHET on everything else, the device verify19b uses for raw hex. The
      count may fall; it may not rise. A new hard-coded control size fails, and
      fixing an old one lowers the bar behind you.

Run from the repo root:  python3 verify/verify270-fluid-controls.py
"""
import os, re, sys

SRC = "src"
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

def bare(src):
    """Comments stripped. This repo has burned three checks on reading their own
       documentation as the defect (verify152, verify153, and verify106's first
       run), and the note above `TILE` spells out the very string being banned."""
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*[\s\S]*?\*/", "", src))

def read(p):
    return open(p, encoding="utf-8").read()

# A frozen box: an arbitrary width/height utility whose value is a bare number.
# `calc(...)` is deliberately allowed through — that is the ramped form, and it
# always contains var(--fs-step) to be worth anything, which clause 1 checks.
FROZEN_ANY = re.compile(r"\b(?:min-h|max-h|h|min-w|max-w|w)-\[[0-9.]+(?:px|rem)\]")

# THE TOUCH FLOOR IS NOT A SIZE. Raised by the lane that answered the same
# instruction the same hour (#317): `min-h-[44px]` is the smallest target a
# finger reliably hits, and a FLOOR is not a size — it does not want to grow on
# a desktop, because the finger does not. Exactly this pair is exempt and
# nothing else: `min-h`/`min-w` at 44. A `h-[44px]` is still a frozen box, since
# that pins the height rather than guaranteeing it.
TOUCH_FLOOR = re.compile(r"\b(?:min-h|min-w)-\[44px\]")

def frozen_in(text):
    return [m for m in FROZEN_ANY.findall(text) if not TOUCH_FLOOR.fullmatch(m)]

class _F:
    @staticmethod
    def findall(text):
        return frozen_in(text)
FROZEN = _F

# ── 1 · the definitions that size every door in the app ─────────────────────
# A LIST, so the next session adds a file with its reason rather than rewriting
# the check. Each of these is a shared control string or a call site that hands
# one its box.
SHARED_CONTROLS = {
    "src/components/familyTile.ts":  "the door tile shared by the menu and every goal card",
    "src/components/GoalCard.tsx":   "a goal's row of doors",
    # Added when #317 landed: the ☰'s own box was a fixed w-[20.6rem] while the
    # names inside it rode the ramp, so seven of the twenty clipped on a
    # desktop. Same fault as the goal card's tiles, other side of the screen,
    # found by a different lane the same hour — which is the argument for
    # naming this file rather than trusting the ratchet to notice.
    "src/components/MenuGrid.tsx":   "the ☰ menu's grid, which sizes every family row",
}

for path, what in sorted(SHARED_CONTROLS.items()):
    if not os.path.isfile(path):
        ok(False, "", f"{path} is gone — {what}. Point this list at wherever it moved, "
                      "or the rule stops being checked without anything failing")
        continue
    frozen = sorted(set(FROZEN.findall(bare(read(path)))))
    ok(not frozen,
       f"{what}: no frozen box size",
       f"{path} pins a control's box: {', '.join(frozen)} — {what}. Size it by "
       "PROPORTION (.fluo-tilegrid counts the room) or on the RAMP "
       "(calc(Xrem + var(--fs-step) * X)), never a bare number")

# And the shared tile must actually be SIZED fluidly, by one of the two means
# the app has. This clause was written when the tile carried an inline
# `calc(4rem + var(--fs-step) * 4)` and it asked only that such a calc read the
# step — because `calc(4rem + 0px)` is a constant wearing brackets.
#
# IT WENT VACUOUS THE MOMENT THAT CALC WAS REPLACED. The subdomains lane swapped
# it for `.fluo-row-tall`, which is the better form — a named class beside
# `.fluo-tap`, the touch floor — and the clause then found zero calcs and passed
# by finding nothing, reporting "0 of them" in its own success line. A check
# that passes because its subject disappeared is the quietest way for a rule to
# stop being enforced, and this file's whole argument is that a shared control
# must not be frozen. So it asks the real question now: the tile is sized by a
# ramped calc OR by one of the named fluid classes, and never by neither.
FLUID_CLASSES = ("fluo-row-tall", "fluo-row", "fluo-tap")
tile = bare(read("src/components/familyTile.ts")) if os.path.isfile("src/components/familyTile.ts") else ""
sized = re.findall(r"\b(?:min-h|max-h|h|min-w|max-w|w)-\[calc\([^\]]*\]", tile)
named = [c for c in FLUID_CLASSES if c in tile]
ok(sized or named,
   f"the shared tile is sized fluidly ({len(sized)} ramped calc(s), classes: {', '.join(named) or 'none'})",
   "src/components/familyTile.ts sizes its tile by neither a ramped calc() nor "
   "one of " + "/".join(FLUID_CLASSES) + " — so every door in the app is a "
   "frozen box again")
ok(all("--fs-step" in s for s in sized),
   f"every calc() box in the shared tile reads --fs-step ({len(sized)} of them)",
   "a calc() box in familyTile.ts does not read --fs-step, so it is a constant "
   "with extra brackets: " + ", ".join(s for s in sized if "--fs-step" not in s))

# ── 2 · the ratchet ─────────────────────────────────────────────────────────
# Counted over the whole of src/, comments stripped. Lower it when you fix one;
# never raise it. It is a COUNT and not a list of places on purpose: a list
# invites the next session to append rather than to fix.
# 120 -> 86 on 2026-09-12, and NOT because anything was fixed that day. The
# real count has been 86 on both main and the branch that lowered this: 120 was
# slack. (Integration lane, same day: it is 84 now — #325/#328/#329 removed two
# more between that measurement and this merge, and the check's own advice line
# is what said so. Lowered again, for the branch's own reason: an empty slot is
# a frozen box somebody can add without failing anything.)
# slack from the hour this check was written, and 34 empty slots is 34 frozen
# boxes the next session can add without failing anything.
#
# THE TRAP THAT ALMOST WENT IN AS THE REASON, recorded because it is the same
# shape as the fault the check is about. FROZEN_ANY matches `px` AND `rem`, on
# purpose — a bare `4.25rem` is as frozen as `68px`; it follows the learner's
# text size but not the screen. So a sweep converting px to rem moves this
# number by ZERO, and the branch that did 47 of them read the drop from 120 as
# its own work. Measured: origin/main 86, that branch 86.
# 84 -> 81 (integration of claude/user-pages-tabs, 12 Sep). That branch fixes
# the three frozen boxes on the PROFILE — the FRILLS slots' h-[58px], which
# clipped at large browser text, and two px floors — which main's own sweep
# deliberately left alone ("already fixed on claude/user-pages-tabs ... editing
# the same lines would collide for nothing"). The check's own advice line asked
# for this number; leaving 84 would hold three slots of slack open behind it.
BUDGET = 81

# WHAT THE NUMBER IS MADE OF (added 12 Sep, after Dan asked "what exactly are
# we cleaning up in the 116 — I NEED TO SEE"). A single lump is not a to-do
# list: a 3px hairline and a 58px button round an emoji are not the same debt,
# and only one of them is ever going to be cleaned. Printing the split says
# where the next patch should start, and stops the total reading as 116
# identical wounds. It also says plainly that the target is NOT zero.
#
# AND A TOKEN IS NOT A SITE. `h-[44px] w-[44px] sm:h-[58px] sm:w-[58px]` is ONE
# button and four counts, so the distinct-line figure travels beside it.
KIND = re.compile(r"\b(min-h|max-h|h|min-w|max-w|w)-\[([0-9.]+)(px|rem)\]")
kinds = {"frozen": 0, "hairline": 0, "floor": 0, "cap": 0}
sites = set()

total = 0
for dirpath, _dirs, files in os.walk(SRC):
    for f in files:
        if not f.endswith((".tsx", ".ts")):
            continue
        path = os.path.join(dirpath, f)
        src = bare(read(path))
        total += len(FROZEN.findall(src))
        for ln, line in enumerate(src.splitlines(), 1):
            for axis, val, unit in KIND.findall(line):
                if TOUCH_FLOOR.fullmatch(f"{axis}-[{val}{unit}]"):
                    continue
                px = float(val) * (16 if unit == "rem" else 1)
                if axis.startswith("min"):
                    kinds["floor"] += 1
                elif axis.startswith("max"):
                    kinds["cap"] += 1
                elif px <= 24:
                    kinds["hairline"] += 1
                else:
                    kinds["frozen"] += 1
                    sites.add((path, ln))

ok(total <= BUDGET,
   f"{total} frozen box sizes in src/, within the budget of {BUDGET}",
   f"{total} frozen box sizes in src/, up from {BUDGET}. A new one has been "
   "added: size it by proportion or on the ramp. If you genuinely removed some "
   "instead, lower BUDGET to the new number in the same patch")
if total < BUDGET:
    PASS.append(f"…and {BUDGET - total} fewer than the budget — lower BUDGET to {total}")

BREAKDOWN = (
    "\n  what the count is made of — the target is NOT zero:\n"
    f"      a fixed box >24px round text or an emoji ... {kinds['frozen']:3}"
    f"   <- the real cleanup ({len(sites)} distinct lines)\n"
    f"      a hairline, dot, wheel or tick box <=24px . {kinds['hairline']:3}"
    "   leave it: it holds no text\n"
    f"      a min-* floor ............................. {kinds['floor']:3}"
    "   right shape already, px spelling\n"
    f"      a max-* reading cap ....................... {kinds['cap']:3}"
    "   leave it: Dan's own \"show less per width\""
)

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
print(BREAKDOWN)
sys.exit(1 if FAIL else 0)
