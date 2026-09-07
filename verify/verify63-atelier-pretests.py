#!/usr/bin/env python3
"""
The atelier pre-tests — every line covered, and not one word of invented French.

Dan, 2026-08-31: "i need your help to build the pre-test which will consist of
questions with English line, and a choice between 4 french lines. Until all the
french lines are covered".

The five atelier stops (SIO-020, 030, 040, 049, 050) had no pre-test of any
kind: no deck, no authored MCQs, nothing but the model dialogue that played
inside the SIO popup. `src/content/pretests/ateliers.gen.ts` turns that dialogue
into the pre-test — each line takes its turn as the answer, the three wrong
options are other lines of the same dialogue.

WHY THIS SUITE EXECUTES THE GENERATOR RATHER THAN READING IT. A generator that
invents French looks, in source, exactly like one that reuses it — the giveaway
is in the OUTPUT, not the code. So the checks below import the module under
`node --experimental-strip-types` and test the items it actually produces.
(That is also why the module imports `../ateliers.ts` relatively: node cannot
resolve the `@/` bundler alias. Same reason as the lesson generators, verify46.)

WHAT IS PINNED

  1  All five atelier stops have a pre-test attached, and it resolves.
  2  EVERY testable line of each dialogue is covered exactly once as an answer
     — Dan's "until all the french lines are covered", checked against the
     dialogue itself rather than against a number written down here.
  3  NO INVENTED FRENCH. Every option of every question is a line of that same
     dialogue. This is the assertion that matters: the 31 Aug rule (French
     drafted by an agent reaches Dan before it reaches a learner) exists
     because « Je prends toujours LE poisson » shipped past a check that was
     looking at something else.
  4  Four distinct options per question, the answer among them.
  5  The English shows BEFORE the attempt (`transFirst`) — it is the whole
     question, not the reward.
  6  A BARE item (no sentence around the blank) hides the "Hear the full
     sentence" button and the gap pill until it has been answered. For these
     items the "full sentence" IS the answer, so an ungated speak button reads
     the correct line aloud to a learner who has not picked yet.
  7  SIO-010 keeps its own bespoke three-situation pre-test — a generated
     line-match cannot ask which greeting suits which audience.

Run from the repo root:  python3 verify/verify63-atelier-pretests.py
"""
import json
import os
import re
import subprocess
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

GEN = "src/content/pretests/ateliers.gen.ts"
REG = "src/content/pretests/index.ts"
DIALOGUES = "src/content/ateliers.ts"
RENDER = "src/app/practice/speculearn/pretest/[id]/PretestFeed.tsx"
STOPS = ["SIO-020", "SIO-030", "SIO-040", "SIO-049", "SIO-050"]

gen_src = read(GEN)
ok(bool(gen_src), f"{GEN} exists", f"{GEN} is missing — the ateliers have no pre-test again")

# The alias would make every check below unrunnable, so it is checked, not assumed.
ok('from "@/' not in gen_src,
   "the generator imports relatively, so node can execute it",
   "the generator imports through @/ — node cannot resolve it, so this suite could not run")

# ---- drive the generator, and the dialogues it reads ------------------------
PROBE = "verify/.atelier-probe.mjs"
open(PROBE, "w", encoding="utf-8").write(
    """
const gen = await import("../src/content/pretests/ateliers.gen.ts");
const { ATELIER_DIALOGUES } = await import("../src/content/ateliers.ts");
console.log(JSON.stringify({
  pretests: gen.ATELIER_GENERATED,
  bySio: gen.ATELIER_PRETEST_BY_SIO,
  dialogues: ATELIER_DIALOGUES,
}));
"""
)
try:
    r = subprocess.run(["node", "--experimental-strip-types", PROBE],
                       capture_output=True, text=True, timeout=120)
    data = json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else None
finally:
    os.remove(PROBE)

if data is None:
    print(f"  FAIL  the generator would not execute:\n{(r.stderr or '')[-1500:]}")
    sys.exit(1)

pretests = {p["id"]: p for p in data["pretests"]}
by_sio = data["bySio"]
dialogues = data["dialogues"]

# ---- 1 · every atelier stop has one, and the registry attaches it -----------
reg = read(REG)
# The SPREAD, not the name: the import line at the top of the registry carries
# both names, so a substring test stayed green with the spread deleted and the
# pre-tests unregistered. Break-testing caught it — the same shape of vacuous
# assertion verify29 was carrying.
ok("...ATELIER_GENERATED" in reg,
   "the registry actually spreads the generated pre-tests into PRETESTS",
   "PRETESTS no longer includes the generated pre-tests — their pages would not build")
ok("...ATELIER_PRETEST_BY_SIO" in reg,
   "the registry actually spreads their SIO attachments",
   "the atelier stops are no longer attached to their pre-tests — the stops show nothing again")
for sio in STOPS:
    pid = by_sio.get(sio)
    ok(pid is not None and pid in pretests,
       f"{sio} has a pre-test ({pid})",
       f"{sio} has no pre-test — that stop is back to having nothing")

# ---- 2 · every line covered, exactly once ----------------------------------
for sio in STOPS:
    pid = by_sio.get(sio)
    if pid not in pretests:
        continue
    lines = dialogues.get(sio, [])
    # The generator's own two exclusions, restated here from the DIALOGUE so
    # this is an independent count and not an echo of the generator: a line
    # whose French is its English tests nothing, and a repeated French line
    # would put the answer in the options twice.
    seen, testable = set(), []
    for l in lines:
        if l["fr"].strip() == l["en"].strip() or l["fr"] in seen:
            continue
        seen.add(l["fr"])
        testable.append(l["fr"])
    answers = [it["answer"] for it in pretests[pid]["items"]]
    ok(sorted(answers) == sorted(testable),
       f"{sio}: all {len(testable)} lines covered, once each",
       f"{sio}: answers do not cover the dialogue — "
       f"{len(answers)} questions for {len(testable)} lines; "
       f"missing {sorted(set(testable) - set(answers))[:3]}")

# ---- 3 · NOT ONE INVENTED WORD ---------------------------------------------
for sio in STOPS:
    pid = by_sio.get(sio)
    if pid not in pretests:
        continue
    corpus = {l["fr"] for l in dialogues.get(sio, [])}
    strays = []
    for it in pretests[pid]["items"]:
        for opt in [it["answer"], *it["distractors"]]:
            if opt not in corpus:
                strays.append(opt)
    ok(not strays,
       f"{sio}: every option is a line Dan wrote",
       f"{sio}: {len(strays)} option(s) are NOT in the dialogue — invented French "
       f"reaching a learner: {strays[:2]}")

# ---- 4 · four distinct options, answer among them --------------------------
bad = []
for pid, p in pretests.items():
    for it in p["items"]:
        opts = [it["answer"], *it["distractors"]]
        if len(opts) != 4 or len(set(opts)) != 4:
            bad.append(f'{pid}/{it["id"]}')
ok(not bad,
   "every question offers four distinct options",
   f"questions with a duplicate or a missing option (two right buttons, or a 3-way): {bad[:3]}")

# ---- 5 · the English is the question, not the reward -----------------------
noprompt = [f'{pid}/{it["id"]}' for pid, p in pretests.items() for it in p["items"]
            if not it.get("transFirst") or not (it.get("sentenceTrans") or "").strip()]
ok(not noprompt,
   "every question shows its English line before the attempt",
   f"questions with no visible prompt — four French lines and nothing asked: {noprompt[:3]}")

# ---- 6 · the bare item does not read the answer aloud ----------------------
# These items have no sentence around the blank, so `ttsTextForItem` returns the
# ANSWER. Both routes to it — the button and the keyboard shortcut — must wait
# for the pick.
render = read(RENDER)
nocom = re.sub(r"\{?/\*[\s\S]*?\*/\}?", "", render)
nocom = re.sub(r"^\s*//.*$", "", nocom, flags=re.M)
ok("const bare" in nocom and "sentenceBefore.trim()" in nocom,
   "the renderer knows a bare item from a gapfill",
   "the renderer no longer distinguishes a bare item — the empty gap pill is back")
ok(nocom.count("(!bare || submitted)") >= 2,
   "a bare item hides both the gap pill and the speak button until it is answered",
   "the speak button or the gap pill is no longer gated on a bare item — "
   "'Hear the full sentence' would read the answer aloud before the learner picks")
ok(re.search(r"bare && !submitted\)?\s*return", nocom) is not None,
   "the keyboard speak shortcut is gated too",
   "the speak KEY still fires on an unanswered bare item — the button was gated and the key was not")

# ---- 7 · SIO-010 keeps its authored pre-test -------------------------------
ok("SIO-010" not in by_sio,
   "SIO-010 keeps its bespoke three-situation pre-test",
   "SIO-010 was given a generated line-match — it loses the audience question Dan authored")
ok('"SIO-010": SIO010_SITUATIONS' in read("src/content/sios/unit0-questions.ts"),
   "SIO-010's three situations are still its bank",
   "SIO-010's situation bank is gone")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
