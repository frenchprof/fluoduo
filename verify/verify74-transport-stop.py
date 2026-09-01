#!/usr/bin/env python3
"""verify74 — SIO-038 has a lesson, and its French is the deck's own.

WHY THIS EXISTS
---------------
SIO-038 was the last Tier 1 stop with a deck and no
`src/content/lessons/native/<slug>.tsx`, so a concept had physically nowhere to
live (colour review's handover, 31 Aug). This check holds the file to the three
things that can silently be wrong about it.

  1 · THE THREE REGISTRATION JOINTS. A lesson file that exists and is not wired
      is invisible to a learner and looks completely finished in a diff. That is
      why verify68 was written to check all three, and this one repeats the
      shape for transport: the import, the NATIVE_LESSONS entry, the LESSONS row
      and the LESSONS_BY_SIO row.

  2 · THE TABLE IS THE DECK. `MODES` in transport.gen.ts decomposes each of the
      twelve items' own `example` into lead · gap · mode · end. A decomposition
      that has drifted from transport.json — a wrong preposition, a mode filed
      under the wrong frame, a gloss quietly rewritten — reads as perfectly
      ordinary code and would teach the wrong frame. So this EXECUTES the module
      and reassembles all twelve against the JSON, rather than reading it.

  3 · NO OPTION IS WRONG TWICE. Dan pulled « le orange fluo » from the colours
      lesson because it was wrong in TWO ways at once, letting a learner reject
      it without thinking about what the card teaches. Every generated card here
      must offer at least one distractor that differs from the correct sentence
      in exactly one word, and the correct sentence must be among the options.

  4 · ★ WITHDRAWS THE FRAME. The deck marks the preposition (or the article) as
      each item's `gap`. Facile must blank that slot and no other, or the stop
      drills the noun a learner already knows and never asks the only question
      it exists to ask.

The generator lives in a .gen.ts precisely so this file can run it under
`node --experimental-strip-types`; a .tsx would be unreachable from here.

Run from the repo root:  python3 verify/verify74-transport-stop.py
"""
import json
import os
import re
import subprocess
import sys

OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

NAT = "src/content/lessons/native"
PROBE = "verify/.verify74-probe.mjs"

# ---- 1 · the file, and the four joints -------------------------------------
src = read(f"{NAT}/transport.tsx")
gen = read(f"{NAT}/transport.gen.ts")
idx = read(f"{NAT}/index.tsx")
lessons = read("src/content/lessons.ts")

check(bool(src), "transport.tsx exists", "SIO-038 still has no lesson file — the last Tier 1 gap is open")
check(bool(gen), "transport.gen.ts exists",
      "the generator is not in a .gen.ts — verify46 cannot execute its axis, and neither can this file")
check("export const transportLesson" in src,
      "transport.tsx exports transportLesson",
      "transport.tsx does not export transportLesson")
check('import { transportLesson } from "./transport"' in idx,
      "transportLesson is imported by native/index.tsx",
      "transportLesson is never imported by native/index.tsx, so getNativeLesson('transport') returns undefined")
body = re.search(r"NATIVE_LESSONS[^=]*=\s*\{(.*?)\n\};", idx, re.S)
check(body is not None and re.search(r"\btransport:\s*transportLesson", body.group(1)) is not None,
      "transport is registered in NATIVE_LESSONS",
      "transport is imported but not put in the NATIVE_LESSONS map — an import with no map entry is dead")
check(re.search(r'"transport":\s*\{\s*slug:\s*"transport"', lessons) is not None,
      "transport has a LESSONS row",
      "transport is missing from LESSONS in lessons.ts — the /lessons gallery cannot see it")
check(re.search(r'"SIO-038":\s*\[[^\]]*"transport"', lessons) is not None,
      "SIO-038 points at the transport lesson",
      "LESSONS_BY_SIO has no SIO-038 -> transport row, so the stop still shows no lesson tab")

# `concept` is colour review's to write. Assert it is ABSENT rather than
# stubbed: a placeholder concept renders as a real argument to a learner and
# has to be found and deleted before the real one can land.
check(re.search(r"^\s*concept:", src, re.M) is None,
      "transport.tsx leaves `concept` to the concepts lane",
      "transport.tsx ships a `concept` — that field is colour review's, and a stub would read to a learner as the real argument")

# ---- 2-4 · execute the generator -------------------------------------------
probe = """
// Written by verify74.
const m = await import("../src/content/lessons/native/transport.gen.ts");
const { MODES, exampleOf, transportQuestion, TRANSPORT_AXES } = m;
const cards = [];
for (let i = 0; i < 600; i++) {
  const q = transportQuestion();
  cards.push({
    correct: q.correct, meta: q.meta, big: q.big, bigLang: q.bigLang,
    easyOptions: q.easyOptions,
    slots: q.slots.map((s) => ({ key: s.key ?? null, text: s.text, choices: s.choices ?? null })),
    med: q.med,
  });
}
const byFrame = {};
for (const ax of TRANSPORT_AXES) for (const o of ax.options) {
  byFrame[o.value] = [...new Set(Array.from({ length: 120 }, () => transportQuestion({ [ax.key]: o.value }).correct))];
}
console.log("@@JSON@@" + JSON.stringify({
  modes: MODES.map((x) => ({ ...x, example: exampleOf(x) })),
  cards, byFrame,
}));
"""
os.makedirs("verify", exist_ok=True)
open(PROBE, "w", encoding="utf-8").write(probe)
try:
    r = subprocess.run(["node", "--experimental-strip-types", PROBE],
                       capture_output=True, text=True, timeout=300)
finally:
    if os.path.isfile(PROBE):
        os.remove(PROBE)

marker = [l for l in r.stdout.splitlines() if l.startswith("@@JSON@@")]
if not marker:
    print("  FAIL the transport generator could not be executed:")
    print((r.stderr or r.stdout)[-2000:])
    sys.exit(1)
data = json.loads(marker[0][len("@@JSON@@"):])

deck = json.load(open("src/content/collections/transport.json", encoding="utf-8"))
items = deck["items"]
modes = data["modes"]

check(len(modes) == len(items) == 12,
      f"the table carries all {len(items)} deck items",
      f"the table has {len(modes)} rows against the deck's {len(items)} — an item is being taught or dropped silently")

# 2 · every reassembled sentence IS the deck's example, in the deck's order,
#     and every gap IS the gap the deck marks.
for i, (row, item) in enumerate(zip(modes, items)):
    check(row["example"] == item["example"],
          f"item {i + 1} reassembles to the deck's example — {item['example']}",
          f"item {i + 1} reassembles to {row['example']!r}, the deck says {item['example']!r} — the table has drifted")
    check(row["gap"] == item["gap"],
          f"item {i + 1} blanks the gap the deck marks ({item['gap']})",
          f"item {i + 1} blanks {row['gap']!r}, the deck marks {item['gap']!r}")
    check(row["enFull"] == item["exampleEn"],
          f"item {i + 1}'s prompt is the deck's exampleEn",
          f"item {i + 1}'s prompt is {row['enFull']!r}, the deck says {item['exampleEn']!r} — an English gloss invented here")
    check(row["fr"] == item["fr"],
          f"item {i + 1} is the deck's {item['fr']}",
          f"item {i + 1} says {row['fr']!r}, the deck says {item['fr']!r}")

# The frames are the deck's own split: `col:en` and `col:a` tag the first nine,
# the last three carry an article. A mode filed under the wrong frame teaches
# the wrong preposition and is invisible in a diff.
for i, (row, item) in enumerate(zip(modes, items)):
    tags = item.get("tags") or []
    want = "en" if "col:en" in tags else "à" if "col:a" in tags else "prendre"
    check(row["frame"] == want,
          f"item {i + 1} sits in the {want} frame, as the deck tags it",
          f"item {i + 1} is filed as {row['frame']!r} but the deck tags it {want!r}")

cards = data["cards"]
check(len({c["correct"] for c in cards}) == 12,
      f"all 12 sentences are reachable ({len({c['correct'] for c in cards})} seen in 600 rolls)",
      f"only {len({c['correct'] for c in cards})} of 12 sentences ever generate — items are unreachable")

examples = {it["example"] for it in items}
check(all(c["correct"] in examples for c in cards),
      "every card's answer is a sentence the deck itself writes",
      "a card graded against French that is not in the deck — the no-invented-French rule")

# The prompt is English, and says so. A prompt tagged lang="fr" is read aloud
# by the 🔊 button with French phonics (Dan, 31 Aug).
check(all(c["bigLang"] == "en" for c in cards),
      "the English prompt is tagged as English",
      "a card's English prompt is not tagged bigLang='en' — 🔊 would read it with French phonics")

# 3 · the options: correct present, and at least one single-word distractor.
def words(s):
    # Elision is a word boundary French does not spell with a space. Without
    # this, « Nous prenons l'avion. » is three tokens and « Nous prenons le
    # avion. » is four, and the single-fault swap the lesson deliberately makes
    # would be reported as a double fault.
    return re.sub(r"(['’])", r"\1 ", s).split()


def one_word_apart(a, b):
    x, y = words(a), words(b)
    return len(x) == len(y) and sum(1 for p, q in zip(x, y) if p != q) == 1

for c in cards[:200]:
    opts = c["easyOptions"]
    if c["correct"] not in opts:
        FAIL.append(f"a card's correct answer {c['correct']!r} is not among its own options")
        break
    if len(set(opts)) != len(opts):
        FAIL.append(f"a card offers the same option twice: {opts}")
        break
    if not any(o != c["correct"] and one_word_apart(c["correct"], o) for o in opts):
        FAIL.append(
            f"no option for {c['correct']!r} differs by exactly one word — every distractor is "
            f"wrong more than once, and can be rejected without thinking about the frame: {opts}")
        break
else:
    OK.append("200 cards: the answer is present, options are distinct, and one distractor is a single word out")

# The single-word test above counts SUBSTITUTIONS; it cannot see that « la
# avion » is wrong twice over — feminine AND unelided — while « le avion » is
# wrong only once. So the elided item's swap is pinned directly. This is the
# assertion that stayed green through a mutation until it was written, which is
# the whole reason it exists.
elided = [c for c in cards if c["slots"][1]["text"] == "l'"]
check(bool(elided), "the elided item (prendre l'avion) is reachable", "no card ever offers the l' gap")
wrong_twice = [c for c in elided if c["correct"].replace("l'", "le ") not in c["easyOptions"]]
check(not wrong_twice,
      "an elided item swaps to « le » — wrong by the elision alone, never by gender as well",
      f"{len(wrong_twice)} elided card(s) offer a swap that is wrong twice over; « le avion » keeps the "
      f"right gender and tests only the elision the deck records as the gap")

# 4 · ★ withdraws the frame word, and only it.
bad = [c for c in cards if c["med"]["correct"] != c["slots"][1]["text"]]
check(not bad,
      "Facile blanks the frame word (the deck's own gap), not the mode",
      f"{len(bad)} card(s) blank something other than the frame word at ★ — the stop would drill the noun instead")

# The gap's choices never mix the preposition contrast with the article one:
# a four-way list smuggles in a second question this stop does not ask.
mixed = [c for c in cards
         if len({"en", "à"} & set(c["slots"][1]["choices"])) and
            len({"le", "la", "l'"} & set(c["slots"][1]["choices"]))]
check(not mixed,
      "the gap offers prepositions OR articles, never both",
      f"{len(mixed)} card(s) offer prepositions and articles in one list — two questions on one card")

# The mode choices all wear the card's own punctuation, so a stray "?" cannot
# mark out which sentence a fragment was lifted from.
punct = [c for c in cards
         if len({o[-1] for o in c["slots"][2]["choices"]}) != 1]
check(not punct,
      "the mode choices share one punctuation, so none is identifiable by its end",
      f"{len(punct)} card(s) mix '.' and '?' in the mode choices — the punctuation gives the answer away")

# The context line must not hand over an answer it is about to ask for.
answers = {c["slots"][1]["text"] for c in cards} | {c["slots"][2]["text"] for c in cards}
leaks = [a for a in answers if re.search(rf"(^|[\s'’]){re.escape(a)}([\s.,!?]|$)", cards[0]["meta"], re.I)]
check(not leaks,
      f"the context line {cards[0]['meta']!r} prints no answer",
      f"the context line prints the answer(s) {leaks} directly above the gap")

# The axis is real: pinning a frame confines the roll to that frame.
for value, seen in data["byFrame"].items():
    want = {m_["example"] for m_ in modes if m_["frame"] == value}
    check(seen and set(seen) <= want,
          f"pinning « {value} » stays inside that frame ({len(seen)} of {len(want)} sentences)",
          f"pinning « {value} » produced {sorted(set(seen) - want)} from another frame — the dropdown is a lie")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
