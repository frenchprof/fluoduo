#!/usr/bin/env python3
"""
Slots: the two-blank level is expressible, and `med` is derived, not drifting.

WHAT WENT WRONG BEFORE. `DiceQuestion.med` is `{ before, choices, correct,
after }` — one blank, chosen by the generator when it built the string. Dan's
ladder (renamed 2026-08-31: Facile / Moyen / Difficile / Bonus) needs

    Moyen      subject + article + noun shown  ->  pick the VERB
    Difficile  subject + BARE NOUN shown       ->  pick the VERB and the ARTICLE
    Bonus      nothing shown                   ->  the sentence from English

so the two-piece level could not be represented at all. `src/content/lessons/native/cloze.ts`
adds `slots`, and `aimer.gen.ts` is the first generator to author them.

WHY THIS RUNS THE CODE INSTEAD OF READING IT. A generator that builds the wrong
sentence from its slots looks, in source, exactly like one that builds the right
one — the same trap `verify41` was written around for pinned axes. So this
executes `aimerQuestion` many times and checks the OUTPUT.

THE ASSERTION THAT MATTERS MOST is that `medFrom(slots, "article")` equals the
`med` the generator used to hand-write. If that ever fails, a slotted generator
has started disagreeing with the 47 that are not, and every existing card
builder reads `med`.

Node runs the .ts directly (`--experimental-strip-types`), which is why cloze.ts
sits beside the generators: `@/` aliases do not resolve under bare node.

Numbered 57 after two collisions. This was 55 while on a branch; 55 and then 56
were taken on main by another session's atelier-cards and sorting-answers checks
while this one was in review. verify-wiring.py fails the build on a shared
leading number — which is how verify31-wordrill sat unrun for a fortnight — and
it caught both, in CI, on the first push. Working out of a branch for a day is
enough to collide twice.

Run from the repo root:  python3 verify/verify57-cloze-slots.py
"""
import json, os, subprocess, sys, tempfile

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

SRC = "src/content/lessons/native"
for f in ("cloze.ts", "aimer.gen.ts", "types.ts"):
    if not os.path.isfile(f"{SRC}/{f}"):
        print(f"FAIL {SRC}/{f} is missing"); sys.exit(1)

DRIVER = r"""
import { aimerQuestion } from "./src/content/lessons/native/aimer.gen.ts";
import { cloze, sentence, medFrom, blankKeysFor, isBlankable }
  from "./src/content/lessons/native/cloze.ts";

const rows = [];
for (let i = 0; i < 400; i++) {
  const q = aimerQuestion();
  const slots = q.slots ?? [];
  rows.push({
    correct: q.correct,
    fromSlots: sentence(slots),
    // The INDEPENDENT oracle. easyOptions is still built the old way, from the
    // subject/article/noun strings and not from the slots, so it can catch a
    // slot list that rebuilds the sentence wrongly. Comparing sentence(slots)
    // to `correct` cannot: `correct` IS sentence(slots), so both move together
    // and the assertion passes through any breakage. It did, until 31 Aug.
    inOptions: q.easyOptions.includes(q.correct),
    options: q.easyOptions,
    med: q.med,
    derived: slots.length ? medFrom(slots, "article") : null,
    blankable: slots.filter(isBlankable).map((s) => s.key),
    one: cloze(slots, blankKeysFor(2, slots)).filter((s) => s.kind === "blank").map((s) => s.key),
    two: cloze(slots, blankKeysFor(3, slots)).filter((s) => s.kind === "blank").map((s) => s.key),
    // What Difficile actually shows the learner: the bare noun must survive.
    twoText: cloze(slots, blankKeysFor(3, slots))
      .map((s) => (s.kind === "blank" ? `[${s.key}]` : s.text)).join(" "),
  });
}
// A pinned run must still slot correctly — the elision path is only reachable
// through "Je", and 400 random rolls could miss it.
const jes = [];
for (let i = 0; i < 60; i++) {
  const je = aimerQuestion({ subject: "Je" });
  jes.push({ correct: je.correct, fromSlots: sentence(je.slots ?? []),
             inOptions: je.easyOptions.includes(je.correct) });
}
console.log(JSON.stringify({ rows, jes }));
"""

with tempfile.NamedTemporaryFile("w", suffix=".ts", dir=".", delete=False, encoding="utf-8") as fh:
    fh.write(DRIVER)
    driver = fh.name
try:
    r = subprocess.run(["node", "--experimental-strip-types", driver],
                       capture_output=True, text=True)
finally:
    os.unlink(driver)

if r.returncode != 0:
    print("  FAIL the generator did not run:\n" + (r.stderr or "")[-2500:])
    sys.exit(1)

data = json.loads(r.stdout)
rows = data["rows"]

check(len(rows) == 400, f"{len(rows)} questions generated",
      f"only {len(rows)} generated — a scan that produces nothing passes vacuously")

# 1 · every question carries slots, and they rebuild the sentence exactly.
missing = [x for x in rows if not x["blankable"]]
check(not missing, "every question carries blankable slots",
      f"{len(missing)} of {len(rows)} carry no blankable slot — `slots` is absent or unkeyed")

# Checked against easyOptions, NOT against `correct`: the generator now builds
# `correct` from the slots, so "sentence(slots) == correct" is a tautology that
# stays green through any slot bug. easyOptions is still assembled the old way.
bad = [x for x in rows if not x["inOptions"]][:3]
check(not bad,
      "the sentence the slots build is one the old formula also builds",
      "the slots build a sentence easyOptions does not contain, so they are "
      "assembling it wrongly: " +
      "; ".join(f"{x['correct']!r} not in {x['options']}" for x in bad))

jes = data["jes"]
elided = [x for x in jes if not x["inOptions"]][:3]
check(not elided,
      f"the elided form survives the slots ({jes[0]['correct']!r})",
      "elision is wrong — a space crept into J'aime, or the apostrophe was "
      "lost: " + "; ".join(f"{x['correct']!r}" for x in elided))
check(any(x["correct"].startswith("J'") for x in jes),
      "the elided path was actually exercised",
      "no pinned-Je question elided, so the elision assertions above are "
      "vacuous — has the subject axis stopped being honoured?")

# 2 · med is DERIVED and identical to the legacy hand-written shape.
drift = [x for x in rows if x["derived"] != x["med"]][:3]
check(not drift,
      "`med` equals medFrom(slots, \"article\") on every question",
      "the derived med disagrees with the shipped med — every existing card "
      "builder reads `med`, so this is a live rendering bug: " +
      "; ".join(f"{x['derived']} != {x['med']}" for x in drift))

shape = [x for x in rows if sorted(x["med"].keys()) != ["after", "before", "choices", "correct"]][:2]
check(not shape, "the derived med keeps the four legacy keys",
      f"med has the wrong keys: {[x['med'] for x in shape]}")

# 3 · THE POINT: one blank at Moyen, two at Difficile (Dan, 31 Aug:
#     "Moyen if it involves one … Difficile if it involves two items").
ones = {tuple(x["one"]) for x in rows}
twos = {tuple(x["two"]) for x in rows}
check(ones == {("verb",)},
      "Moyen blanks exactly one slot, the verb",
      f"Moyen should blank the verb alone; it blanks {sorted(ones)}")
check(twos == {("verb", "article")},
      "Difficile blanks TWO slots — verb and article, which `med` could not express",
      f"Difficile should blank verb+article; it blanks {sorted(twos)}")

# 4 · Difficile must still show the bare noun. If the noun vanished, the
#     learner has nothing to choose an article FOR, and the contrast is gone.
noun_gone = [x for x in rows if x["twoText"].count("[") != 2][:3]
check(not noun_gone,
      "Difficile leaves the subject and the bare noun standing",
      "Difficile blanked something other than exactly two slots: " +
      "; ".join(x["twoText"] for x in noun_gone))

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
