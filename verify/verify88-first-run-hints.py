#!/usr/bin/env python3
"""
First-run instructions: one per activity, none on a hub, dismissible for good.

Dan, 2026-09-02, twice in an hour. First, having just had MémoiRecall's
« Flip » button removed as redundant: *"add a pop up instruction for the first
time with a 'do not show me again' regarding what the user needs to do."* Then:
*"then can you add the same first timer pop ups instructions for all activity
pages (hub pages excluded)."*

WHY THE FIRST ASK EXISTED. « Flip » was doing two jobs and only one of them was
redundant. As a CONTROL it duplicated tapping the card, on the activity named
for that gesture. As a SIGN it was the only thing on screen saying the card
could be tapped at all. Removing it was right and left a card with nothing
under it — so the instruction comes back as an instruction, once.

WHAT IS PINNED, and why each would fail in silence

  1  BOTH SHELLS MOUNT IT, with the key they already carry. Every activity gets
     its popup by having a row in content/hints.ts and by nothing else; a
     regression that drops one mount takes fourteen screens with it and shows
     up in a diff as one deleted line.
  2  THE `on` TEST IS HONOURED. Two keys name two screens — `wordrill` is the
     Say It DRILL and the deck-picker PAGE at /practice/wordrill, `conjugaison`
     likewise. Drop `on` and the picker fires the drill's instruction over a
     list of decks, which no other check here would notice.
  3  NO HUB HAS A ROW. This is Dan's own exception, and the failure mode is a
     popup on a page where there is nothing to do.
  4  EVERY ROW NAMES SOMETHING REAL. A typo'd key is a hint that never fires
     and never errors — the worst shape a check can be asked to catch, and the
     reason this one resolves the keys against the real registry rather than a
     list retyped here.
  5  « DO NOT SHOW ME AGAIN » MEANS IT, AND ONLY IT. The flag is written when
     the box is TICKED and not otherwise: write it always and « first time »
     is a lie in one direction; never and the checkbox is decoration, which is
     the sort of control the litmus test deletes.
  6  ONE KEY PER ACTIVITY, namespaced. A shared key means dismissing MémoiRecall
     silently dismisses ChaTutor.
  7  IT PORTALS TO THE BODY. A drill's root is `overflow-hidden`; rendered
     inside it, a fixed overlay is clipped to the paper and half the modal is
     simply not there.
  8  IT SITS BELOW CreditsSplash. Two games open on the credits (z-80, « TAP TO
     SKIP », auto-clearing after 3s). Above them the instruction covers the
     credits AND eats the tap meant to skip them. BOTH numbers are read out of
     the source and compared, never restated here.
  9  THE GAMES REUSE THEIR OWN help NODE. GameFrame already carries "how to
     play" behind ⋯ → Help; the popup shows that same node, so the two cannot
     drift. A second hand-written copy in content/hints.ts is the drift.

Run from the repo root:  python3 verify/verify88-first-run-hints.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped.

    Every file here EXPLAINS this feature at length — "hub", "do not show me
    again", "CreditsSplash" and "z-80" all appear in prose describing it. A raw
    scan would pass on the documentation, and worse, would let a regression
    hide behind the words that excuse it.
    """
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

HINTS = "src/content/hints.ts"
HINT_C = "src/components/FirstRunHint.tsx"
DRILL = "src/components/DrillShell.tsx"
CAHIER = "src/components/CahierShell.tsx"
GAME = "src/components/GameFrame.tsx"
CREDITS = "src/games/CreditsSplash.tsx"
ACTS = "src/content/activities.ts"

hints, hintc = code(read(HINTS)), code(read(HINT_C))
drill, cahier, game = code(read(DRILL)), code(read(CAHIER)), code(read(GAME))
ok(bool(hints) and bool(hintc), "the hint roster and its component both exist",
   f"{HINTS} or {HINT_C} is missing")

# ---- 1 · both shells mount it --------------------------------------------
ok(re.search(r"<ActivityFirstRun\s+activityKey=\{activity\}\s+on=\"drill\"", drill) is not None,
   "DrillShell mounts the hint with its own activity key",
   "DrillShell does not mount ActivityFirstRun — every drill loses its instruction, in one deleted line")
ok(re.search(r"<ActivityFirstRun\s+activityKey=\{active\}\s+on=\"page\"", cahier) is not None,
   "CahierShell mounts it with its own active key",
   "CahierShell does not mount ActivityFirstRun — the pre-tests, VoixLà, ChaTutor and DéjàRevu lose theirs")

# ---- 2 · the on test is real ---------------------------------------------
ok(re.search(r"hint\.on\s*!==\s*on", hintc) is not None,
   "a row only fires on the shell it belongs to",
   "ActivityFirstRun ignores `on` — /practice/wordrill (a deck picker) would fire the Say It drill's instruction")
# AND the roster still distinguishes them, or the test above has nothing to do.
ons = set(re.findall(r'on:\s*"(drill|page)"', hints))
ok(ons == {"drill", "page"},
   "the roster uses both values, so the distinction is live",
   f"every row is on={ons or 'nothing'} — the shell test is inert and the next dual-key activity misfires")

# ---- 3 · no hub has a row -------------------------------------------------
KEYS = set(re.findall(r"^  ([a-z][a-z0-9]*):\s*\{", hints, flags=re.M))
ok(bool(KEYS), "the roster has rows", "no rows found in content/hints.ts")
# The six families, plus the pickers, galleries and landings. Named here
# because they are exactly what Dan exempted; a row for any of them is a popup
# on a page with nothing to do on it.
HUBS = {
    "goals", "practice", "svplay", "review", "skills", "user",       # families
    "home", "map", "index", "numbers",                              # front doors
    "deck", "mcq", "study", "new",                                  # deck pages
    "guide", "teacher", "leaderboard", "profil", "moi", "reglages",  # read-only
}
stray = sorted(KEYS & HUBS)
ok(not stray,
   f"no hub, picker or landing carries a hint ({len(KEYS)} rows, none of them a hub)",
   f"a hub has a first-run popup: {stray} — Dan's exception was 'hub pages excluded'")

# ---- 4 · every row names something real -----------------------------------
# Resolved against the REGISTRY, not a list retyped here: a key that matches
# nothing is a hint that never fires and never errors.
acts = code(read(ACTS))
REG = set(re.findall(r'\{\s*key:\s*"([a-z0-9]+)"', acts))
# `pretest` is SpecuLearn's second engine rather than its own registry row (the
# 2026-08-10 merger), and it IS the key CahierShell passes on all 90 pre-test
# pages — so it is real, and named here as the one deliberate exception.
EXTRA = {"pretest"}
unknown = sorted(KEYS - REG - EXTRA)
ok(not unknown,
   "every row's key is one the app actually passes to a shell",
   f"these rows can never fire — no activity has that key: {unknown}")

# ---- 5 · the checkbox is what makes it the last one -----------------------
i_dismiss = hintc.find("const dismiss")
dismiss = hintc[i_dismiss:i_dismiss + 500] if i_dismiss >= 0 else ""
ok(bool(dismiss), "the hint has a dismiss path", "FirstRunHint has no dismiss()")
ok(re.search(r"if\s*\(\s*never\s*\)", dismiss) is not None and "setItem(" in dismiss,
   "the flag is written only when « do not show me again » is ticked",
   "dismiss() writes the flag unconditionally or not at all — either the checkbox is decoration "
   "or « first time » becomes a one-shot the learner never chose")
ok(re.search(r'type="checkbox"', hintc) is not None and "Do not show me again" in hintc,
   "and the box is on screen, inside a label so the words are part of the target",
   "the « do not show me again » control is gone — Dan asked for it by name")

# ---- 6 · one key per activity --------------------------------------------
ok(re.search(r'`fluolingo:hint\.\$\{k\}`|"fluolingo:hint\." \+ k', hintc) is not None,
   "the stored flag is namespaced per activity",
   "the hint's storage key is not per-activity — dismissing one would dismiss them all")

# ---- 7 · it portals out of the drill --------------------------------------
ok("createPortal(" in hintc and "document.body" in hintc,
   "the modal is portalled to the body, clear of the drill's overflow-hidden root",
   "FirstRunHint renders in place — inside DrillShell's `overflow-hidden` root it is clipped to the paper")

# ---- 8 · below the credits splash -----------------------------------------
# BOTH numbers read from source and compared. Restating either here is how the
# two would come apart without anything failing.
z_hint = re.search(r"className=\"fixed inset-0 z-\[(\d+)\]", hintc)
z_cred = re.search(r"className=\"fixed inset-0 z-\[(\d+)\]", code(read(CREDITS)))
ok(z_hint is not None and z_cred is not None,
   "both the hint's and the credits splash's z are readable from the source",
   "cannot read one of the two z-indexes — the comparison below would be guessing")
if z_hint and z_cred:
    ok(int(z_hint.group(1)) < int(z_cred.group(1)),
       f"the hint sits below the credits splash ({z_hint.group(1)} < {z_cred.group(1)}) — credits first, then what to do",
       f"the hint is at z-{z_hint.group(1)} and CreditsSplash at z-{z_cred.group(1)}: it covers the credits for "
       "three seconds and swallows the tap meant to skip them")

# ---- 9 · the games reuse their own help node ------------------------------
ok(re.search(r"help && hintKey && \(", game) is not None and re.search(r"<FirstRunHint[\s\S]{0,200}\{help\}", game) is not None,
   "a game's first-run popup IS its ⋯ → Help node, not a second copy of it",
   "GameFrame no longer shows `help` first-run, or shows something else — the popup and the menu "
   "would then be two texts that drift")
GAMEKEYS = {"vocabularain", "lexicalater", "compose", "matching", "numbus", "numbourse"}
dupes = sorted(KEYS & GAMEKEYS)
ok(not dupes,
   "and no game has a second, hand-written instruction in content/hints.ts",
   f"these games have their help written twice, in two files: {dupes}")
# The callers must actually pass the key, or the prop is dead and every game
# silently loses its popup.
passers = [p for p in (
    "src/games/letris/LetrisGame.tsx",
    "src/games/lexicalator/Lexicalator.tsx",
    "src/games/compose/ComposeDialogue.tsx",
    "src/games/compose/ComposeSolo.tsx",
) if re.search(r'hintKey="[a-z]+"', code(read(p)))]
ok(len(passers) == 4,
   "VocabulaRain, LexicaLater and both ComposeIt modes ask for the first-run popup",
   f"only {len(passers)} of the 4 games pass hintKey — the rest show their help only to someone who opens ⋯")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
