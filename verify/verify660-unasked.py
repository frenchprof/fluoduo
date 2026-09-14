#!/usr/bin/env python3
"""THE APP DOES NOT PERFORM UNASKED — three bans from one message, 2026-09-13.

Dan, in one go:

    "The [victory] jingle is sometimes playing for no good reason.
     The floating tour button should now be deleted for good.
     The ComposeIt activity ... plays TTS even before the learner gets to
     look at the page"

Three different subsystems, one fault: the app doing something loud that the
learner never asked for. A float they did not summon, a fanfare they did not
earn, a voice they did not press play on.

WHY A CHECK AND NOT JUST A DIFF. The Geist ban is the precedent this file
follows to the letter: *"a ban that is not written down and not checked is not
a ban"*. Geist survived every session for weeks because the ruling lived only
in Dan's head, and every session that read the repo saw it and read it as a
decision. The ✨ chip is exactly that shape — a float with a plausible reason
("replay the tour") that the next session would happily restore.

AND EACH SECTION IS A LIST, for the same reason that file gives: the next
ruling will not be about this float, this button or this scene.

Run from the repo root:  python3 verify/verify660-unasked.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(p):
    """The file with comments stripped — a ban must be measured against what
    RUNS, not against prose explaining why it was banned. The note left where
    the ✨ chip used to be says « Replay the tour » in so many words, and a
    naive grep for that string would fail on the very patch that removed it."""
    s = read(p)
    s = re.sub(r"/\*[\s\S]*?\*/", "", s)
    s = re.sub(r"(?m)^\s*//.*$", "", s)
    s = re.sub(r"(?<![:\"'])//[^\n\"'`]*$", "", s, flags=re.M)
    return s


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

# ── 1 · FLOATS THAT NOBODY SUMMONED ─────────────────────────────────────────
# Each entry: what it was, the file it lived in, and the fragments that would
# mean it is back. A float is banned by adding a row here.
BANNED_FLOATS = [
    ("the ✨ replay-the-tour chip", "src/components/FirstTour.tsx",
     ['"Replay the tour"', "'Replay the tour'", '"chip"', "fl.float.tour"]),
]
for what, path, marks in BANNED_FLOATS:
    src = code(path)
    ok(bool(src), f"{path} is present", f"{path} is missing — this ban cannot be checked")
    back = [m for m in marks if m in src]
    ok(not back,
       f"{what} is gone from {os.path.basename(path)}",
       f"{what} IS BACK in {path} ({', '.join(back)}). Dan deleted it on "
       "2026-09-13: \"The floating tour button should now be deleted for "
       "good.\" A tour is offered once, on a first visit, and never again — "
       "there is deliberately no replay entry point. If one is wanted, it "
       "belongs in ⚙️ Réglages as a line of settings, never as a circle "
       "floating over the lesson.")

# The float register elsewhere must not carry it either — a drag key with no
# control is how a float comes back by halves.
drag_users = []
for root, _dirs, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")) and "fl.float.tour" in read(os.path.join(root, f)):
            drag_users.append(os.path.join(root, f))
ok(not drag_users,
   "no component claims the tour float's drag slot",
   f"'fl.float.tour' is still claimed by {drag_users} — the deleted float is "
   "half back.")

# ── 2 · THE VICTORY FANFARE IS FOR FINISHING, NOT FOR LEAVING ───────────────
# `sfx.stage()` is the full fanfare AND site-wide confetti. Each entry names a
# control that must NOT fire it, and the line that would mean it does.
#
# THE FIRST DRAFT OF THIS SECTION FAILED ON THE FIX ITSELF, and the reason is
# worth keeping. It matched `sfx.stage(); setScreen("table")` — the shape of
# ConjugaZone's give-up button — but that is ALSO the shape of the run's real
# completion three functions away, once comments are stripped:
#
#     if (queue && k + 1 >= queue.length) { sfx.stage(); setScreen("table"); }
#
# What separates the two is not the pair of calls; it is that one of them is a
# CLICK HANDLER. So the rule is stated the way it is actually meant: in these
# files the fanfare may be reached from the drill's own flow, and never
# directly from a control the learner pressed.
NO_FANFARE = [
    ("ConjugaZone's buttons — « See the table » gave up, « start » had answered "
     "nothing, and both played the full fanfare",
     "src/app/conjugaison/embed/page.tsx",
     r"onClick=\{[^}]*sfx\.stage\(\)"),
    ("WorDrill's « End here » — stopping a run is not completing one",
     "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
     r"endNow[\s\S]{0,260}?sfx\.stage"),
]
for what, path, pattern in NO_FANFARE:
    src = code(path)
    ok(bool(src), f"{os.path.basename(path)} is present", f"{path} is missing")
    ok(not re.search(pattern, src),
       f"no fanfare on {what}",
       f"THE VICTORY FANFARE IS BACK ON {what} ({path}). Dan, 2026-09-13: "
       "\"The [victory] jingle is sometimes playing for no good reason.\" "
       "sfx.stage() is the full fanfare plus confetti — it marks COMPLETING a "
       "run, never abandoning one and never starting one.")

# …and the fanfare that IS earned must still be there, or this check would
# pass just as well on an app that had lost its celebration entirely.
EARNED = [
    ("ConjugaZone, when the queue runs out", "src/app/conjugaison/embed/page.tsx",
     r"sfx\.stage\(\);"),
    ("WorDrill, when the queue empties in next()",
     "src/app/practice/say-it/[collectionId]/SayItContent.tsx", r"sfx\.stage\(\);"),
    ("GramMarathon, on the last item",
     "src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx",
     r"sfx\.stage\(\);"),
]
for what, path, pattern in EARNED:
    ok(bool(re.search(pattern, code(path))),
       f"the earned fanfare survives: {what}",
       f"{what} no longer celebrates at all ({path}) — the 13 Sep fix was "
       "meant to remove the UNEARNED jingles, not the run's own.")

# ── 3 · NOTHING SPEAKS BEFORE THE LEARNER HAS LOOKED ────────────────────────
# Each entry: a scene, and the mount-time speech that must not be in it.
NO_AUTOPLAY = [
    ("ComposeIt's opening line", "src/games/compose/ComposeDialogue.tsx",
     r"const start = \(\) => \{[\s\S]*?\n  \};"),
]
for what, path, block in NO_AUTOPLAY:
    src = code(path)
    m = re.search(block, src)
    ok(bool(m), f"{os.path.basename(path)}'s start() was found",
       f"start() no longer has the shape this check reads in {path} — re-point "
       "the read rather than letting the ban lapse silently.")
    if m:
        ok(not re.search(r"\bspeak(Sequence)?\s*\(", m.group(0)),
           f"{what} does not speak itself on arrival",
           f"{what.upper()} SPEAKS ON MOUNT AGAIN ({path}). Dan, 2026-09-13: it "
           "\"plays TTS even before the learner gets to look at the page\". "
           "start() runs from a mount effect, so this talks over the first "
           "paint. Every bubble carries its own 🔊 — the sound is the "
           "learner's to ask for.")
# The tap that replaces it has to exist, or "silent" is just "mute".
ok('aria-label="Listen"' in read("src/games/compose/ComposeDialogue.tsx"),
   "every ComposeIt bubble still has its own 🔊 to tap",
   "the per-message Listen button is gone from ComposeDialogue — without it, "
   "removing the mount-time speech leaves no way to hear the line at all.")

print("\nthe app does not perform unasked (13 Sep)\n" + "-" * 70)
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
