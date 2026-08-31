#!/usr/bin/env python3
"""
A2 — the ★ ladder withdraws SCAFFOLDING, and ★ still gets yesterday's card.

WHAT THIS GUARDS. `lessonEntry.ts` varies the KIND of exercise across levels
(mcq / gap / build / translate), which produces a difficulty gradient without
the mechanism Dan's pages describe: his levels remove scaffolding from ONE
sentence. `multiBlankCard` is where that now happens — it decides, for a level,
how much of a slotted question to take away.

THE TWO THINGS THAT MUST BOTH HOLD, and they pull against each other:

  1. ★★ and ★★★ must give TWO blanks on a slotted question. That is the whole
     point, and it is what `med` could never express.
  2. ★ and every one of the 46 unconverted generators must produce EXACTLY the
     card they produced before — `multiBlankCard` returns null for them and the
     old `med` path runs untouched. A ladder that quietly changed the easiest
     level for every lesson in the app would be a regression wearing a feature's
     clothes.

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
import { multiBlankCard, sentence } from "./src/content/lessons/native/cloze.ts";

const out = { 1: [], 2: [], 3: [] };
for (const level of [1, 2, 3]) {
  for (let i = 0; i < 200; i++) {
    const q = aimerQuestion();
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
    });
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

check(all(len(v) == 200 for v in lv.values()),
      "600 cards built across the three levels",
      f"expected 200 per level, got {[len(v) for v in lv.values()]} — a run that "
      "builds nothing passes vacuously")

check(all(x["slotted"] for x in lv[1]),
      "the generator under test really does author slots",
      "aimer stopped authoring slots, so every assertion below is vacuous")

# ── 1 · one star is untouched ──────────────────────────────────────────────
star1 = [x for x in lv[1] if x["isMulti"]]
check(not star1,
      "★ takes the single-blank path — the card it built yesterday",
      f"{len(star1)} of 200 ★ cards became multi-blank. ★ must keep the med "
      "path byte for byte, or this ladder silently changed the easiest level "
      "for every learner.")

check(all(x["med"] and x["med"]["correct"] for x in lv[1]),
      "★ still carries a populated `med`",
      "a ★ card lost its med — the old path is what 46 generators depend on")

# ── 2 · two stars and up withdraw TWO ──────────────────────────────────────
for level in (2, 3):
    rows = lv[level]
    multi = [x for x in rows if x["isMulti"]]
    check(len(multi) == len(rows),
          f"{'★★' if level == 2 else '★★★'} builds a multi-blank card every time",
          f"only {len(multi)} of {len(rows)} cards at level {level} withdrew more "
          "than one piece — the level is not withdrawing scaffolding")

    counts = {x["blanks"] for x in multi}
    check(counts == {2},
          f"{'★★' if level == 2 else '★★★'} withdraws exactly two pieces",
          f"level {level} blank counts are {sorted(counts)}, expected 2")

    keys = {tuple(x["keys"]) for x in multi}
    check(keys == {("verb", "article")},
          f"{'★★' if level == 2 else '★★★'} takes the verb AND the article — Dan's L08",
          f"level {level} blanks {sorted(keys)}, expected the verb and the article")

# ── 3 · the noun must survive, or there is nothing to choose an article for ─
naked = [x for x in lv[2] if x["shown"].count("___") != 2][:3]
check(not naked,
      "★★ leaves the subject and the bare noun standing",
      "★★ blanked something other than exactly two pieces: " +
      "; ".join(x["shown"] for x in naked))

# The joined answer must be the two words, in reading order — that is what the
# learner's picks are compared against.
wrong = [x for x in lv[2] if len(x["answer"].split(" ")) != 2][:3]
check(not wrong,
      "the graded answer is the two blanks joined in reading order",
      "a ★★ answer is not two words: " + "; ".join(repr(x["answer"]) for x in wrong))

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

contained = [x for x in lv[2] if not in_order(x)][:3]
check(not contained,
      "both blanked words come out of the sentence, IN READING ORDER",
      "a blank's answers are missing or out of order against the sentence they "
      "were taken from: " +
      "; ".join(f"{x['answer']!r} vs {x['full']!r}" for x in contained))

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

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
