#!/usr/bin/env python3
"""
Stops 36 and 40 give directions WITHOUT the imperative — and the frames obey too.

The guard-rail is Dan's, recorded in FINISH_BACKLOG item 10 and traceable to the
v9 CSV, which spells it out for SIO-036: *"Ask for and give directions **without
the imperative**, producing vous + present and c'est + preposition."* The stop
teaches « Vous tournez à gauche », « il faut continuer », « on prend la rue » —
never « Tournez ! ». SIO-040 chains those same steps with connectors.

WHY A CHECK AND NOT A NOTE. The rail was already honoured where anyone thought
to look — every keyed answer in the pretest bank is an infinitive after « il
faut », and « tournez » sits in the distractor list with a whyWrong that names
it as the vous imperative. That is the rail working exactly as designed.

It was the SENTENCES AROUND the blank that leaked. finale.ts printed

    pre: "Prenez la ", post: " rue à droite — la rue numéro un !"

and the learner's answer was « première ». No imperative is keyed; the check
that FINISH_BACKLOG proposed — *"Directions bank has no keyed imperative"* —
passes on that line. But the learner reads a bare imperative, in the stop built
to avoid it, printed by the app as model French. Same shape as « Bon chance »
in atelierModel: the wrong form is the MACHINE'S, not the learner's, and that
is the kind nobody catches by reading answer keys.

So this pins BOTH halves:

  1  no keyed imperative anywhere on stops 36 / 40 — the backlog's criterion;
  2  no imperative in the surrounding frame either — what actually broke;
  3  distractors stay free. « tournez » after « il faut » is the exact mistake
     the card exists to train out, and Dan's 1 Sep ruling is that a distractor's
     whole job is to be wrong.

Learner-visible strings ONLY. An earlier pass over the bank read

    { "id": "tournez", "text": "Vous tournez", ... }

and reported "tournez" as a bare imperative eleven times. It was reading KEYS.
Nothing in that file is imperative; every left-hand card says « Vous … ».
"""

import json
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

# The -ez forms this stop's verbs take. An imperative and a vous-present are the
# SAME STRING in French, which is the whole reason the rail needs a checker: the
# only thing telling them apart is whether « vous » stands in front.
VERBS = ("tournez", "allez", "prenez", "continuez", "traversez", "montez",
         "descendez", "sortez", "marchez", "suivez", "passez")
BARE = re.compile(r"(?<!\w)(?<!vous )(?<!Vous )(" + "|".join(VERBS) + r")(?!\w)", re.I)


def bare_imperatives(text):
    """The -ez forms in `text` that no « vous » governs."""
    return [m.group(1) for m in BARE.finditer(text or "")]


# ---- 1 · the directions bank, learner-visible text only -------------------
BANK = "src/content/directions-matching.json"
bank = json.loads(read(BANK) or "{}")
shown = [c.get("text", "") for c in bank.get("lefts", []) + bank.get("rights", [])]
ok(bool(shown), f"{BANK} has cards to check",
   f"{BANK} is missing or has no lefts/rights — the bank cannot be verified")
leaks = sorted({v for t in shown for v in bare_imperatives(t)})
ok(not leaks,
   f"the directions bank shows no bare imperative across {len(shown)} cards",
   f"{BANK} shows {leaks} with no « vous » in front — stop 36 gives directions "
   "in vous + present, so a card that reads « Tournez … » teaches the form the "
   "stop exists to avoid")

# ---- 2 · nothing imperative is KEYED on either stop -----------------------
# The pretest bank: `answer` is what the learner must produce.
PRE = "src/content/pretests/u3-sio036.json"
pre = json.loads(read(PRE) or "{}")
items = pre.get("items") or pre.get("questions") or []
keyed = [(i.get("id"), i.get("answer")) for i in items
         if bare_imperatives(i.get("answer", ""))]
ok(bool(items), f"{PRE} has items to check",
   f"{PRE} is missing or empty — the stop-36 answer keys cannot be verified")
ok(not keyed,
   f"no imperative is keyed as the answer across {len(items)} stop-36 items",
   f"{PRE} keys an imperative: {keyed} — after « il faut » the answer is the "
   "infinitive, and keying the -ez form inverts the lesson")

# Distractors are explicitly ALLOWED, and their presence is the evidence the
# stop is teaching the contrast rather than dodging it. Assert they survive, so
# a later tidy-up cannot "fix" this check by deleting the wrong answers.
distr = sorted({d for i in items for d in i.get("distractors", [])
                if bare_imperatives(d)})
ok(bool(distr),
   f"and the imperative still appears as a distractor ({', '.join(distr)})",
   f"{PRE} offers no imperative distractor any more — the -ez form after "
   "« il faut » is the mistake this stop trains out; removing it removes the "
   "error the card exists for (Dan, 1 Sep)")

# ---- 3 · and the frames around the blank obey it too ----------------------
FIN = "src/content/finale.ts"
fin = read(FIN)
rows = [m.group(0) for m in
        re.finditer(r"\{\s*id:\s*\"finale:SIO-0(?:36|40):\d+\"[^\n]*\}", fin)]
ok(len(rows) >= 8,
   f"finale.ts has {len(rows)} stop-36/40 frames to check",
   f"finale.ts yielded {len(rows)} stop-36/40 frames — expected the full set; "
   "the row shape changed and this check has gone blind")
bad = []
for row in rows:
    rid = re.search(r"finale:(SIO-0(?:36|40):\d+)", row).group(1)
    # Only the strings a learner reads: pre, post, and the accepted answers.
    seen = re.findall(r"(?:pre|post):\s*\"((?:[^\"\\]|\\.)*)\"", row)
    seen += re.findall(r"\"((?:[^\"\\]|\\.)*)\"", re.search(r"a:\s*\[([^\]]*)\]", row).group(1)) \
        if re.search(r"a:\s*\[([^\]]*)\]", row) else []
    hit = sorted({v for s in seen for v in bare_imperatives(s)})
    if hit:
        bad.append(f"{rid}: {hit}")
ok(not bad,
   f"no stop-36/40 frame prints a bare imperative ({len(rows)} frames read)",
   "finale.ts prints an imperative in a stop-36/40 frame — " + "; ".join(bad) +
   " — the answer key is clean but the learner still reads « Prenez … » as "
   "model French for the stop that forbids it")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
