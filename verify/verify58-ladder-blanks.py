#!/usr/bin/env python3
"""
A2 — the ladder withdraws SCAFFOLDING; Facile and Moyen keep yesterday's card.

WHAT THIS GUARDS. `lessonEntry.ts` varies the KIND of exercise across levels,
which produces a difficulty gradient without the mechanism Dan's pages
describe: his levels remove scaffolding from ONE sentence. `multiBlankCard` is
where that now happens — it decides, for a level, how much of a slotted
question to take away. Renamed and remapped 2026-08-31 to Dan's
classification: "CompleteIt is supposed to [be] Difficile if it involves two
items, or Moyen if it involves one."

THE TWO THINGS THAT MUST BOTH HOLD, and they pull against each other:

  1. Difficile (level 3) must give TWO blanks on a slotted question. That is
     the whole point, and it is what `med` could never express.
  2. Facile, Moyen and every one of the 46 unconverted generators must produce
     EXACTLY the single-blank card they produced before — `multiBlankCard`
     returns null for them and the old `med` path runs untouched. A ladder
     that quietly changed an easier level for every lesson in the app would be
     a regression wearing a feature's clothes.

WHY IT LIVES IN A .ts AND NOT IN buildCards.tsx. `node --experimental-strip-types`
cannot load a .tsx, so anything in the pager is unreachable from a check — the
same reason `axis.ts` and the generators sit beside the lessons. A ladder that
blanks the wrong slot looks, in source, exactly like one that blanks the right
one, so this EXECUTES it.

WHAT THIS DOES NOT COVER, stated so nobody mistakes it for coverage: the
rendering of two blanks in `LessonPager.tsx` is React and is not run here. The
data reaching the renderer is what is asserted.

Run from the repo root:  python3 verify/verify58-ladder-blanks.py
"""
import json, os, subprocess, sys, tempfile

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

DRIVER = r"""
import { aimerQuestion } from "./src/content/lessons/native/aimer.gen.ts";
import { faireQuestion } from "./src/content/lessons/native/faire.gen.ts";
import { allerQuestion } from "./src/content/lessons/native/aller.gen.ts";
import { metaLeaksAnswer, multiBlankCard } from "./src/content/lessons/native/cloze.ts";

// Every generator converted to slots, with the keys its ladder must blank and
// the key `med` is derived from. Add a row when you convert the next one — a
// generator absent from here is a generator nothing checks.
const GENS = [
  { name: "aimer", fn: aimerQuestion, keys: ["verb", "article"] },
  { name: "faire", fn: faireQuestion, keys: ["verb", "article"] },
  { name: "aller", fn: allerQuestion, keys: ["verb", "prep"] },
];

const out = { 1: [], 2: [], 3: [] };
for (const level of [1, 2, 3]) {
  for (const g of GENS) {
  for (let i = 0; i < 120; i++) {
    const q = g.fn();
    const card = multiBlankCard(q, level);
    out[level].push({
      isMulti: card !== null,
      blanks: card ? card.segments.filter((s) => s.kind === "blank").length : 0,
      keys: card ? card.segments.flatMap((s) => (s.kind === "blank" ? [s.key] : [])) : [],
      answer: card ? card.answer : null,
      // The visible sentence with the blanks knocked out. The learner must
      // still be able to SEE the noun at two stars, or there is nothing to
      // choose an article for.
      shown: card ? card.segments.map((s) => (s.kind === "blank" ? "___" : s.text)).join(" ") : null,
      full: q.correct,
      med: q.med,
      slotted: !!q.slots,
      meta: q.meta,
      // The context line above the gap must not contain a word the card is
      // about to ask for.
      metaLeaks: card
        ? metaLeaksAnswer(q.meta, card.segments.flatMap((s) => (s.kind === "blank" ? [s.answer] : [])))
        : false,
      // The per-blank answers. NOT the same as answer.split(" "): a single
      // blank's answer can itself contain a space — "de la", "à la", "chez le"
      // — which is exactly what broke the first version of the assertion below.
      answers: card ? card.segments.flatMap((s) => (s.kind === "blank" ? [s.answer] : [])) : [],
      gen: g.name,
      want: g.keys,
      // The independent oracle: easyOptions is still assembled the old way, so
      // it can catch slots that rebuild the sentence wrongly. Comparing
      // sentence(slots) to `correct` cannot — `correct` IS sentence(slots).
      inOptions: q.easyOptions.includes(q.correct),
      options: q.easyOptions,
    });
  }
  }
}
// A generator that authored no slots must be left completely alone. So must
// one whose slots are all scenery — there is nothing there to withdraw.
const bare = multiBlankCard({ slots: undefined }, 3);
const empty = multiBlankCard({ slots: [] }, 3);
const scenery = multiBlankCard({ slots: [{ text: "Je" }, { text: "aime." }] }, 3);
console.log(JSON.stringify({ out, bare, empty, scenery }));
"""

with tempfile.NamedTemporaryFile("w", suffix=".ts", dir=".", delete=False, encoding="utf-8") as fh:
    fh.write(DRIVER)
    driver = fh.name
try:
    r = subprocess.run(["node", "--experimental-strip-types", driver], capture_output=True, text=True)
finally:
    os.unlink(driver)

if r.returncode != 0:
    print("  FAIL the ladder did not run:\n" + (r.stderr or "")[-2500:])
    sys.exit(1)

data = json.loads(r.stdout)
lv = {int(k): v for k, v in data["out"].items()}

GENS = sorted({x["gen"] for x in lv[1]})
check(all(len(v) == 360 for v in lv.values()) and len(GENS) == 3,
      f"1080 cards built across three levels and {len(GENS)} generators ({', '.join(GENS)})",
      f"expected 360 per level over 3 generators, got {[len(v) for v in lv.values()]} "
      f"across {GENS} — a run that builds nothing passes vacuously")

check(all(x["slotted"] for x in lv[1]),
      "every generator under test really does author slots",
      "a converted generator stopped authoring slots, so the assertions below "
      "are vacuous for it")

# The sentence the slots build must be one the OLD formula also builds.
off = [x for x in lv[2] if not x["inOptions"]][:3]
check(not off,
      "every slotted sentence is one easyOptions also contains",
      "slots are assembling the sentence wrongly: " +
      "; ".join(f"[{x['gen']}] {x['correct']!r} not in {x['options']}" for x in off))

# ── 1 · Facile and Moyen are untouched (one piece missing = the med path) ──
for level in (1, 2):
    rows = lv[level]
    single = [x for x in rows if x["isMulti"]]
    check(not single,
          f"level {level} ({'Facile' if level == 1 else 'Moyen'}) takes the "
          "single-blank path — the card it built yesterday",
          f"{len(single)} of {len(rows)} level-{level} cards became multi-blank. "
          "Moyen is ONE piece missing (Dan, 31 Aug); the med path must hold.")

    check(all(x["med"] and x["med"]["correct"] for x in rows),
          f"level {level} still carries a populated `med`",
          f"a level-{level} card lost its med — the old path is what 46 "
          "generators depend on")

# ── 2 · Difficile withdraws TWO ────────────────────────────────────────────
for level in (3,):
    rows = lv[level]
    multi = [x for x in rows if x["isMulti"]]
    check(len(multi) == len(rows),
          "Difficile builds a multi-blank card every time",
          f"only {len(multi)} of {len(rows)} cards at level {level} withdrew more "
          "than one piece — the level is not withdrawing scaffolding")

    counts = {x["blanks"] for x in multi}
    check(counts == {2},
          "Difficile withdraws exactly two pieces",
          f"level {level} blank counts are {sorted(counts)}, expected 2")

    off = [x for x in multi if x["keys"] != x["want"]][:3]
    check(not off,
          "Difficile blanks each generator's own two keys "
          "— aimer and faire the verb and article, aller the verb and preposition",
          f"level {level} blanked the wrong slots: " +
          "; ".join(f"[{x['gen']}] {x['keys']} != {x['want']}" for x in off))

# ── 3 · the noun must survive, or there is nothing to choose an article for ─
naked = [x for x in lv[3] if x["shown"].count("___") != 2][:3]
check(not naked,
      "Difficile leaves the subject and the bare noun standing",
      "Difficile blanked something other than exactly two pieces: " +
      "; ".join(f"[{x['gen']}] {x['shown']}" for x in naked))

# The graded string must be the blanks joined in reading order — that is exactly
# what the learner's picks are joined into before grading.
#
# Count BLANKS, not words. The first version of this counted words and failed on
# faire: "fais de la" is three words and two blanks, because a partitive is two
# words. An assertion shaped around one generator is an assertion that will
# reject the next one.
wrong = [x for x in lv[3] if x["answer"] != " ".join(x["answers"])][:3]
check(not wrong,
      "the graded string is the blanks joined in reading order",
      "the answer is not its blanks joined: " +
      "; ".join(f"[{x['gen']}] {x['answer']!r} != {x['answers']}" for x in wrong))

two = [x for x in lv[3] if len(x["answers"]) != 2][:3]
check(not two,
      "Difficile has exactly two blanks to fill, whatever their word count",
      "a Difficile card has the wrong number of blanks: " +
      "; ".join(f"[{x['gen']}] {x['answers']}" for x in two))

# ORDER, not just membership. The picks are joined in reading order and graded
# as one string, so an answer assembled backwards would grade every correct
# learner wrong. Checking only that both words appear cannot see that — it was
# green through a deliberate reversal until 31 Aug.
def in_order(row):
    at, pos = 0, []
    for w in row["answer"].split(" "):
        k = row["full"].find(w, at)
        if k < 0:
            return False
        pos.append(k)
        at = k + len(w)
    return pos == sorted(pos)

contained = [x for x in lv[3] if not in_order(x)][:3]
check(not contained,
      "both blanked words come out of the sentence, IN READING ORDER",
      "a blank's answers are missing or out of order against the sentence they "
      "were taken from: " +
      "; ".join(f"[{x['gen']}] {x['answer']!r} vs {x['full']!r}" for x in contained))

# ── 3b · the prompt must not print an answer ───────────────────────────────
# aimer's meta is "Tu adores … (love)". At Moyen that is exactly right — the
# verb is shown and the article is the question. At Difficile the verb IS the
# question, so the same line prints the answer above the gap. Found by opening the card
# in a browser, not by reading the code, which is the whole argument for doing
# that once per feature.
leaky = [x for x in lv[3] if x["metaLeaks"]]
check(leaky,
      f"the raw generator meta does leak at Difficile ({len(leaky)}/{len(lv[3])}) — "
      "so the guard in buildCards has something to do",
      "no Difficile meta leaks an answer, which makes the guard below untestable "
      "here: has aimer's meta changed? If so this assertion is the one to update.")

lone = [x for x in lv[1] + lv[2] if x["metaLeaks"]]
check(not lone,
      "Facile/Moyen never leak — their meta shows the verb because the verb is "
      "not the question",
      f"{len(lone)} single-blank cards leak their own answer, which would be a "
      "real bug in the med path")

# ── 4 · a slotless generator is left completely alone ──────────────────────
# NOTE ON THIS ONE. The outcome is protected twice — by the `!q.slots?.length`
# guard and again by `keys.length < 2` — so breaking either alone leaves it
# green. It asserts the behaviour that matters rather than one line of it, and
# the `scenery` case (slots present, none blankable) is the one that is singly
# guarded.
check(data["bare"] is None and data["empty"] is None and data["scenery"] is None,
      "no slots, empty slots, or slots that are all scenery — none gets a card",
      f"multiBlankCard invented a card where there was nothing to withdraw: "
      f"bare={data['bare']}, empty={data['empty']}, scenery={data['scenery']} — "
      "that would change all 46 unconverted lessons")

# ── 5 · the segmented card must not ALSO offer the typed input ─────────────
# A source check, not an executed one, and said so plainly: the render is React
# and is not run here. It is worth having anyway, because the fault it guards
# was invisible from the code — both halves are individually correct, and only
# opening the card showed the learner being given two ways to answer it with the
# answer spelled out in the word bank's pills.
pager = "src/app/lessons/pager/LessonPager.tsx"
src = open(pager, encoding="utf-8").read()
check('ex.kind !== "mcq" && !ex.segments' in src,
      "the typed input and word bank are suppressed on a segmented card",
      f"{pager} renders the word bank for a segmented cloze as well as its own "
      "choice rows — two ways to answer one card, with the answer printed in "
      "the pills")

check("metaLeaksAnswer(x.meta" in open("src/app/lessons/pager/buildCards.tsx", encoding="utf-8").read(),
      "buildCards drops a meta line that would print a blanked answer",
      "buildCards no longer guards the context line, so a Difficile card can "
      "print the verb it is about to ask for")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
