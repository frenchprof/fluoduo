#!/usr/bin/env python3
"""
🧰 AMBIENT TOOLS — the summonable VoixLà & ChaTutor, and the corrects-first rule.

Dan's design (5 Sep): VoixLà and ChaTutor are TOOLS, consulted mid-exercise,
never completed. A floating 🧰 opens a tray (🔊 VoixLà · 🤖 ChaTutor); tapping
one slides a card up OVER the exercise, which never closes or navigates. First
pass: the three Skills trainers only — ÉcouTexte, WorDrill, ComposeIt.

And the amendment the same day, non-negotiable: **"the bot should not be made
to reinforce grammatically bad or wrongly written French to the learner. It
has to be corrected first!!"** The card, handed the learner's text, checks it
against /api/correct FIRST, shows the corrected sentence leading with the slip
marked beneath, and ▶ voices ONLY the corrected form. Checker unreachable →
nothing is spoken at all. No contradiction with the 1 Sep distractor ruling:
wrong French may be OFFERED for rejection on a card; it must never be
PERFORMED for imitation by the app's voice.

What this pins, and why each half matters:

  1  the panels are EXTRACTED (components/tools/) and mounted from BOTH homes
     — the standalone pages and the 🧰 card. One panel, two doors; a copied
     panel would drift the moment either home was edited.
  2  the three trainers mount the summon INSIDE their own content components,
     and DrillShell / GameFrame stay untouched — a parallel lane owns
     DrillShell, and a 🧰 in the shells would put the button on every drill
     and game, which is not this first pass.
  3  the corrects-first CODE SHAPE in VoixLaPanel: the one voice entry
     (speakText) is reachable with exactly three arguments — the raw text
     behind a `!correctsFirst` guard, the already-approved sentence, and the
     fresh checker result. The checker itself never speaks. A fourth call
     site, or a speak inside corriger's fallbacks, is the bug this exists
     to catch.
  4  WorDrill's mic is parked while a card is open — the recognizer must not
     transcribe the card's own voice and grade the browser.
"""

import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

VOIXLA = "src/components/tools/VoixLaPanel.tsx"
CHATUTOR = "src/components/tools/ChaTutorPanel.tsx"
SUMMON = "src/components/tools/ToolSummon.tsx"
voixla, chatutor, summon = read(VOIXLA), read(CHATUTOR), read(SUMMON)

# ---- 1 · extracted once, mounted from both homes ---------------------------
ok(bool(voixla) and bool(chatutor),
   "both panels live in components/tools/ (VoixLaPanel, ChaTutorPanel)",
   "a panel file is missing from src/components/tools/ — the extraction is "
   "the point: one panel, mounted by the page AND the card")

tts_page = read("src/app/tts/page.tsx")
tutor_page = read("src/app/tutor/page.tsx")
ok("<VoixLaPanel" in tts_page and "components/tools/VoixLaPanel" in tts_page,
   "/tts still mounts the extracted VoixLaPanel",
   "src/app/tts/page.tsx no longer mounts components/tools/VoixLaPanel — the "
   "standalone page and the card must share ONE panel")
ok("<ChaTutorPanel" in tutor_page and "components/tools/ChaTutorPanel" in tutor_page,
   "/tutor still mounts the extracted ChaTutorPanel",
   "src/app/tutor/page.tsx no longer mounts components/tools/ChaTutorPanel — "
   "the standalone page and the card must share ONE panel")
ok("<VoixLaPanel" in summon and "<ChaTutorPanel" in summon,
   "the 🧰 card mounts both panels too",
   "ToolSummon.tsx does not mount both panels — the card is the second door "
   "to the SAME components, not a reimplementation")
ok("correctsFirst" in summon and re.search(r"<VoixLaPanel\s+correctsFirst", summon),
   "the card's VoixLà mounts in corrects-first mode",
   "ToolSummon mounts VoixLaPanel WITHOUT correctsFirst — the in-exercise "
   "card is exactly the surface Dan's rule is about")

# ---- 2 · the three trainers summon; the shells stay clean ------------------
TRAINERS = {
    "ÉcouTexte": "src/app/practice/ecoutexte/EcouTexte.tsx",
    "WorDrill": "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
    "ComposeIt solo": "src/games/compose/ComposeSolo.tsx",
    "ComposeIt dialogue": "src/games/compose/ComposeDialogue.tsx",
}
for name, path in TRAINERS.items():
    src = read(path)
    ok("<ToolSummon" in src and "components/tools/ToolSummon" in src,
       f"{name} mounts the 🧰 summon inside its own content component",
       f"{path} does not mount ToolSummon — the door was assigned to the "
       "three Skills trainers (ÉcouTexte, WorDrill, ComposeIt)")

# ÉcouTexte offers ChaTutor ONLY (Dan, 5 Sep: "Voix-Là is for TTS. and it
# does NOT make any sense to have it im EcouTexte" — the exercise already
# speaks, and TTS there could read the hidden answer aloud).
ecoutexte = read(TRAINERS["ÉcouTexte"])
ok('tools={["chatutor"]}' in ecoutexte,
   "ÉcouTexte's 🧰 offers ChaTutor only — no TTS in a listening exercise",
   "ÉcouTexte's ToolSummon does not restrict tools to [\"chatutor\"] — "
   "VoixLà is TTS and Dan ruled it senseless in a listening exercise (5 Sep)")

for shell in ("src/components/DrillShell.tsx", "src/components/GameFrame.tsx"):
    src = read(shell)
    ok(src and "ToolSummon" not in src and "🧰" not in src,
       f"{os.path.basename(shell)} carries no 🧰 (untouched by this feature)",
       f"{shell} mentions the toolbox — the summon mounts inside each "
       "trainer's OWN component; a parallel lane owns DrillShell and the "
       "shells would spread the button to every drill and game")

# ---- 3 · corrects-first: the speak path's code shape -----------------------
# The one entry to the voice, and its exact call sites. Comments and the
# function's own definition don't call anything — code lines only.
code = "\n".join(
    ln for ln in voixla.splitlines()
    if not ln.lstrip().startswith(("*", "//", "/*")) and "function speakText" not in ln
)
calls = re.findall(r"speakText\(([^)]*)\)", code)
ok(sorted(calls) == ["approved", "corrected", "text"],
   "speakText has exactly three call sites: text · approved · corrected",
   f"speakText's call sites are {sorted(calls)} — expected exactly "
   "['approved', 'corrected', 'text']. A new site can voice unchecked text; "
   "a lost one breaks the flow. Re-read the corrects-first rule before "
   "touching this")

ok(re.search(r"if \(!correctsFirst\) \{ speakText\(text\)", voixla) is not None,
   "the raw-text speak stands behind the !correctsFirst guard",
   "VoixLaPanel speaks `text` outside an `if (!correctsFirst)` guard — in "
   "card mode the learner's raw sentence must NEVER reach the voice "
   "(Dan, 5 Sep: 'It has to be corrected first!!')")

ok(re.search(r"if \(approved !== null\) \{ speakText\(approved\)", voixla) is not None,
   "an already-approved sentence replays without a re-check",
   "the approved-replay branch is gone — ▶ on checked text should speak the "
   "checker's sentence, not re-fetch or fall back to raw text")

ok(re.search(
       r"const corrected = await corriger\(\);\s*\n\s*if \(corrected !== null\) speakText\(corrected\);",
       voixla) is not None,
   "the unchecked path is check-then-speak, and only on a checker result",
   "correctThenSpeak no longer speaks strictly the corriger() result — the "
   "voice may only perform what /api/correct returned")

# corriger() itself never speaks: unreachable checker = silence + the page's
# existing fallback message, never a voicing of unchecked text.
m = re.search(r"async function corriger\(\)[\s\S]*?\n  \}", voixla)
ok(m is not None and "speak" not in m.group(0) and "setFixErr" in m.group(0),
   "corriger() shows the fallback message and never touches the voice",
   "corriger() speaks, or lost its fallback message — when the checker is "
   "unreachable the card must show the existing 'not connected' text and "
   "voice NOTHING")

ok('correctsFirst ? approved ?? "" : text' in voixla,
   "the 🎧 MP3 is a voicing too: card mode renders only the approved form",
   "makeMp3 no longer sources from `approved` in corrects-first mode — an "
   "MP3 of the raw sentence performs the same broken French the ▶ guard "
   "exists to stop")

# The corrected sentence LEADS the display; the slip is marked beneath.
ok(re.search(r"correctsFirst && \(\s*\n\s*<p lang=\"fr\"", voixla) is not None,
   "in card mode the corrected sentence leads, the marked slip sits beneath",
   "the corrects-first display no longer leads with the corrected sentence — "
   "Dan's flow is: corrected leading, the learner's slip marked beneath")

# ---- 4 · audio ownership ---------------------------------------------------
ok("pauseSpeech()" in summon and "resumeSpeech()" in summon,
   "the card holds the exercise's speech while open (pause on open, resume on close)",
   "ToolSummon no longer pauses/resumes the exercise's speech — two voices "
   "over each other is the collision the hand-off exists to prevent")

sayit = read(TRAINERS["WorDrill"])
ok("toolOpenRef" in sayit and re.search(r"startListening = useCallback\(\(\) => \{\s*\n\s*if \(toolOpenRef.current\) return;", sayit),
   "WorDrill's mic refuses to start while a 🧰 card is open",
   "SayItContent's startListening no longer checks toolOpenRef — the "
   "recognizer would transcribe the card's own voice and grade the browser "
   "instead of the learner")
ok("onCardOpen={onToolOpen}" in sayit and "onCardClose={onToolClose}" in sayit,
   "WorDrill parks and releases the mic through the summon's callbacks",
   "SayItContent no longer wires onToolOpen/onToolClose into ToolSummon — "
   "opening a card must park the mic; closing must hand it back")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
