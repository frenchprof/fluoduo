#!/usr/bin/env python3
"""
No French on a control a beginner has to read before they can act.

THE STANDING LOCK (docs/FINISH_BACKLOG.md, item 7): "Absolute beginners.
Chrome, CTAs, ranks-the-learner-must-act-on, and WHY language stay English.
French is the target on the card / chip / tile — never a door a beginner must
decode to act."

WHAT THIS GUARDS, and what it must never touch. The app teaches French, so
French text is everywhere and most of it is the POINT. This check looks only
at the handful of places that are unambiguously a control or a signpost:

  · the games hub's two buttons
  · a route's name in the learner's own history (lib/labels.ts)
  · the map legend, which is also what a screen reader announces per stop
  · the error message a game shows when a check fails

and it names them one by one rather than sweeping. A sweep over "any French
string in src/" would flag every deck, every card, every atelier — thousands
of them — and the first person to hit that wall would delete the check.

WHAT IS DELIBERATELY NOT HERE, AND STAYS THAT WAY. Four sets of French were
put to Dan on 6 Sep with the wording each would take in English:

    the unit flaps        Unité 0-4              -> Unit 0-4
    the ten rank names    Débutant … Maître      -> Beginner … Master
    the twelve badges     Premier pas, Diplômé…  -> First step, Graduate…
    two shop colours      Émeraude, Or           -> Emerald, Gold

**Dan: "None."** All four stay French. So they are not oversights this check
has yet to reach, and widening it to catch them would be undoing a ruling.
The line his answer draws is the useful one: French that BLOCKS AN ACTION is
a fault; French that merely decorates one is the app's character. A rank and
a badge each sit beside an English line saying how they were earned, and
"Unité 3" names a place rather than asking for a decision — nobody is stuck
in front of any of them. « Jouer » on the only button on the card was a
different thing entirely.

Run from the repo root:  python3 verify/verify105-en-chrome.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# A French word that a beginner cannot guess from English. Cognates are not
# listed: "expressions" and "communication" read the same in both languages,
# which is exactly why they survived the sweep.
FRENCH = re.compile(
    r"\b(jouer|choisir|accueil|carte|r[ée]glages|continuer|recommencer|suivant|"
    r"pr[ée]c[ée]dent|retour|valider|v[ée]rifier|annuler|fermer|ouvrir|commencer|"
    r"terminer|essayer|r[ée]essayez|revoir|r[ée]viser|vocabulaire|grammaire|"
    r"pardon|souci|autre)\b", re.I)

fails = []


def read(rel):
    return open(os.path.join(ROOT, rel), encoding="utf-8").read()


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"\{/\*.*?\*/\}", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


# --- 1. the games hub's buttons ----------------------------------------------
# The <Link> and the <button> under a game card: "Play" and "Choose another".
gallery = strip_comments(read("src/components/GameGallery.tsx"))
for m in re.finditer(r">\s*([^<>{}\n]{2,40}?)\s*</(?:Link|button)>", gallery):
    label = m.group(1).strip()
    if FRENCH.search(label):
        fails.append(f'GameGallery.tsx: a button says "{label}". The games hub is chrome — a beginner taps it before any French is taught.')

# --- 2. route names in the learner's own history ------------------------------
# lib/labels.ts feeds /moi/historique and the teacher views. Product names
# (ÉcouTexte, DéjàRevu, VoixLà, NumBourse) are NAMES, not words to decode, so
# only the generic route labels are checked.
labels = strip_comments(read("src/lib/labels.ts"))
PRODUCT = re.compile(r"[A-Z][a-z]+[A-Z]")  # CamelCase == a product name
for path, name in re.findall(r'\["(/[^"]*)",\s*"([^"]+)"\]', labels):
    if PRODUCT.search(name):
        continue
    if FRENCH.search(name):
        fails.append(f'lib/labels.ts: {path} is called "{name}" in a learner\'s history. Name the place in English.')
for m in re.finditer(r'label:\s*"([^"]+)"', labels):
    if FRENCH.search(m.group(1)):
        fails.append(f'lib/labels.ts: a route label says "{m.group(1)}".')

# --- 3. the map legend, which screen readers also announce --------------------
kinds = strip_comments(read("src/content/sioKinds.ts"))
block = re.search(r"KIND_LABEL[^=]*=\s*\{(.*?)\}", kinds, flags=re.S)
if not block:
    fails.append("content/sioKinds.ts: KIND_LABEL not found — the shape changed and this check went blind.")
else:
    for key, label in re.findall(r'(\w+):\s*"([^"]+)"', block.group(1)):
        if FRENCH.search(label):
            fails.append(f'sioKinds.ts: the map legend calls "{key}" -> "{label}". It is the key to the stop colours and every stop\'s aria-label.')

# --- 4. a failed check must say so in the learner's language ------------------
# ComposeIt's two files are full of French on purpose — the waiter speaks it,
# and the nudges QUOTE the French a learner should type ("refuse with Non,
# merci"). So this cannot look for French; it looks for APOLOGY, which is
# never dialogue and never a lesson. The string it was written for was
# « Pardon, un petit souci… réessayez ! », shown when the answer-checker
# itself fails — a beginner meeting a French apology has two problems.
#
# The first version of this assertion matched `setNudge|setError|setStatus`
# and caught nothing: the real call sites are `setFeedback({ reply: … })` and
# `setMessages(… text: …)`. It passed against the reverted code.
APOLOGY = re.compile(r"(un petit souci|r[ée]essayez|d[ée]sol[ée].{0,12}(erreur|probl[èe]me)|pardon,)", re.I)
for rel in ("src/games/compose/ComposeSolo.tsx", "src/games/compose/ComposeDialogue.tsx"):
    src = strip_comments(read(rel))
    for m in re.finditer(r'"([^"\\\n]{4,120})"', src):
        text = m.group(1)
        if APOLOGY.search(text):
            fails.append(
                f'{os.path.basename(rel)}: the learner is apologised to in French — "{text}". '
                f"When the checker breaks, say so in English.")

if fails:
    print("verify105-en-chrome: FAIL")
    for f in fails:
        print("  - " + f)
    sys.exit(1)

print("verify105-en-chrome: the games hub, history labels, map legend and game errors all speak English.")
