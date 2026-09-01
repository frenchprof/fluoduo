#!/usr/bin/env python3
"""verify76 — SIO-025 and SIO-039 have a lesson, built from their own decks.

WHY THIS EXISTS
---------------
The last two ordinary stops from colour review's handover. Both decks share one
shape and one failure mode: every card already shows the choice made — a reason
with its frame attached, a request with its opener attached — so the thing the
stop exists to teach is the only thing the deck never asks. A lesson that got
the split wrong would look completely ordinary in a diff and would drill the
wrong half.

  1 · THE TABLES ARE THE DECKS. Both lessons decompose their items and
      reassemble them. This EXECUTES both and rebuilds every sentence against
      parce-que.json and envies-besoins.json, so a frame filed under the wrong
      opening, or a phrase quietly re-typed, goes red.

  2 · ★ WITHDRAWS THE CHOICE THE STOP IS ABOUT — the frame after « parce que »,
      the opener before what is wanted. Not the content word a learner already
      has from the English.

  3 · THE OPENER IS THE WHOLE OPENER. envies-besoins marks its `gap` as the
      verb alone (voudrais, besoin d'), but the SUBJECT changes with it: « Je
      voudrais » against « J'ai besoin ». A card that blanked the deck's gap
      literally would offer « Je besoin d'un hôtel. ». So the deck's gap is
      asserted to sit INSIDE the slot rather than to equal it.

  4 · NO INVENTED FRENCH, AND ELISION IS THE PLACE IT WOULD CREEP IN. The deck
      writes « J'ai envie de dormir » and « J'ai envie d'un chocolat chaud »,
      and contains no « J'ai besoin de » at all. Every opener a card offers must
      be one the deck actually writes, and must elide the way its own reason
      requires — otherwise the apostrophe answers the question.

Run from the repo root:  python3 verify/verify76-two-tier3-stops.py
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
PROBE = "verify/.verify76-probe.mjs"

idx = read(f"{NAT}/index.tsx")
lessons = read("src/content/lessons.ts")
body = re.search(r"NATIVE_LESSONS[^=]*=\s*\{(.*?)\n\};", idx, re.S)

# ---- the joints, for both ---------------------------------------------------
for slug, export, sio, deck in (
    ("parce-que", "parceQueLesson", "SIO-025", "parce-que"),
    ("wants-needs", "wantsNeedsLesson", "SIO-039", "envies-besoins"),
):
    src = read(f"{NAT}/{slug}.tsx")
    check(bool(src), f"{slug}.tsx exists", f"{sio} still has no lesson file")
    check(f"export const {export}" in src, f"{slug}.tsx exports {export}",
          f"{slug}.tsx does not export {export}")
    check(f'import {{ {export} }} from "./{slug}"' in idx,
          f"{export} is imported by native/index.tsx",
          f"{export} is never imported — getNativeLesson('{slug}') returns undefined")
    check(body is not None and re.search(rf'"{slug}":\s*{export}', body.group(1)) is not None,
          f"{slug} is registered in NATIVE_LESSONS",
          f"{slug} is imported but not in the NATIVE_LESSONS map — an import with no entry is dead")
    check(re.search(rf'"{slug}":\s*\{{\s*slug:\s*"{slug}"', lessons) is not None,
          f"{slug} has a LESSONS row", f"{slug} is missing from LESSONS — the gallery cannot see it")
    check(re.search(rf'"{sio}":\s*\[[^\]]*"{slug}"', lessons) is not None,
          f"{sio} points at the {slug} lesson",
          f"LESSONS_BY_SIO has no {sio} -> {slug} row, so the stop shows no lesson")
    check(re.search(r"^\s*concept:", src, re.M) is None,
          f"{slug}.tsx leaves `concept` to the concepts lane",
          f"{slug}.tsx ships a `concept` — a stub reads to a learner as the real argument")

# The lesson slug is the DECK's own declaration, so the two names for one stop
# cannot drift. envies-besoins.json says "wants-needs", and that is why the
# lesson is not called envies-besoins.
for deck, slug in (("parce-que", "parce-que"), ("envies-besoins", "wants-needs")):
    j = json.load(open(f"src/content/collections/{deck}.json", encoding="utf-8"))
    check(j.get("lessonSlug") == slug,
          f"{deck}.json declares lessonSlug {slug!r}, and the lesson uses it",
          f"{deck}.json declares lessonSlug {j.get('lessonSlug')!r} but the lesson is called {slug!r}")

# ---- execute both generators ------------------------------------------------
probe = """
// Written by verify76.
const pq = await import("../src/content/lessons/native/parce-que.tsx").catch(() => null);
const wn = await import("../src/content/lessons/native/wants-needs.gen.ts");
const out = { wants: { items: wn.ITEMS.map((i) => ({ ...i, sentence: wn.sentenceOf(i) })), cards: [], byWant: {} } };
for (let i = 0; i < 600; i++) {
  const q = wn.wantsQuestion();
  out.wants.cards.push({ meta: q.meta, big: q.big, bigLang: q.bigLang, correct: q.correct,
    easyOptions: q.easyOptions,
    slots: q.slots.map((s) => ({ key: s.key ?? null, text: s.text, choices: s.choices ?? null })),
    med: q.med });
}
for (const o of wn.WANTS_AXES[0].options) {
  out.wants.byWant[o.value] = [...new Set(Array.from({ length: 200 },
    () => wn.wantsQuestion({ want: o.value }).correct))];
}
out.wants.openers = { vowel: wn.openersFor("un hôtel."), consonant: wn.openersFor("dormir.") };
console.log("@@JSON@@" + JSON.stringify(out));
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
    print("  FAIL the wants-needs generator could not be executed:")
    print((r.stderr or r.stdout)[-2000:])
    sys.exit(1)
W = json.loads(marker[0][len("@@JSON@@"):])["wants"]

# ---- SIO-039 · 1 · the table is the deck -----------------------------------
deck = json.load(open("src/content/collections/envies-besoins.json", encoding="utf-8"))["items"]
check(len(W["items"]) == len(deck) == 10,
      f"wants-needs carries all {len(deck)} deck items",
      f"the table has {len(W['items'])} rows against the deck's {len(deck)}")
for i, (row, item) in enumerate(zip(W["items"], deck)):
    check(row["sentence"] == item["fr"],
          f"item {i + 1} reassembles to {item['fr']}",
          f"item {i + 1} reassembles to {row['sentence']!r}, the deck says {item['fr']!r} — the table has drifted")
    check(row["en"] == item["en"],
          f"item {i + 1}'s prompt is the deck's own English",
          f"item {i + 1}'s prompt is {row['en']!r}, the deck says {item['en']!r} — a gloss invented here")
    # ---- 3 · the deck's gap sits INSIDE the opener, and is not the slot -----
    check(item["gap"] in row["opener"],
          f"item {i + 1}: the deck's gap {item['gap']!r} sits inside the opener {row['opener']!r}",
          f"item {i + 1}: the deck marks {item['gap']!r} and the opener is {row['opener']!r} — the two "
          f"have come apart, and the card would blank something the deck does not teach")
    check(row["want"] == item["gap"],
          f"item {i + 1} is filed under the deck's own gap ({item['gap']})",
          f"item {i + 1} is filed as {row['want']!r} but the deck marks {item['gap']!r}")

cards = W["cards"]
sentences = {it["fr"] for it in deck}
check(len({c["correct"] for c in cards}) == 10,
      f"all 10 sentences are reachable ({len({c['correct'] for c in cards})} in 600 rolls)",
      f"only {len({c['correct'] for c in cards})} of 10 sentences ever generate")
check(all(c["correct"] in sentences for c in cards),
      "every card's answer is a sentence the deck itself writes",
      "a card graded against French that is not in the deck")
check(all(c["bigLang"] == "en" for c in cards),
      "the English prompt is tagged as English",
      "a card's English prompt is not tagged bigLang='en' — 🔊 would read it with French phonics")

# ---- 2 · ★ withdraws the opener --------------------------------------------
bad = [c for c in cards if c["med"]["correct"] != c["slots"][0]["text"]]
check(not bad,
      "Facile blanks the opener — the choice the stop is about",
      f"{len(bad)} card(s) blank something other than the opener at ★")

# ---- 4 · no invented French, and elision never gives the answer away --------
openers = {it["opener"] for it in W["items"]}
stray = sorted({o for c in cards for o in c["slots"][0]["choices"]} - openers)
check(not stray, f"every opener offered is one the deck writes ({len(openers)} distinct)",
      f"cards offer openers the deck does not contain: {stray}")
# Not "all the openers look alike" — « Je voudrais » has nothing to elide and
# fits either way, so a mixed-looking list is correct. What must hold is that
# every opener offered would still be FRENCH in front of this card's reason: a
# d' form only before a vowel, a de form only before a consonant. Get that
# wrong and the apostrophe, not the meaning, picks the answer.
vowel = lambda s: bool(re.match(r"[aeiouéèêîôûh]", s, re.I))
ungrammatical = []
for c in cards:
    rest = c["slots"][1]["text"]
    for o in c["slots"][0]["choices"]:
        if re.search(r"['’]$", o) and not vowel(rest):
            ungrammatical.append(f"{o}{rest}")
        elif re.search(r"\bde$", o) and vowel(rest):
            ungrammatical.append(f"{o} {rest}")
check(not ungrammatical,
      "every opener a card offers is grammatical in front of that card's reason",
      f"{len(ungrammatical)} option(s) put the wrong form of « de » before the reason, e.g. "
      f"{sorted(set(ungrammatical))[:3]} — the apostrophe answers the question")
check(W["openers"]["vowel"] == ["Je voudrais", "J'aimerais", "J'ai besoin d'", "Je veux", "J'ai envie d'"],
      "a vowel-initial reason is offered the five elided-compatible openers",
      f"the vowel opener list is {W['openers']['vowel']}")
check(W["openers"]["consonant"] == ["Je voudrais", "J'aimerais", "Je veux", "J'ai envie de"],
      "a consonant-initial reason is offered four — the deck contains no « J'ai besoin de », "
      "and one is not invented to square the list",
      f"the consonant opener list is {W['openers']['consonant']}")

# The options: the answer present, distinct, and one of them a single swap.
def words(s):
    return re.sub(r"(['’])", r"\1 ", s).split()


def one_word_apart(a, b):
    x, y = words(a), words(b)
    return len(x) == len(y) and sum(1 for p, q in zip(x, y) if p != q) == 1


for c in cards[:200]:
    if c["correct"] not in c["easyOptions"]:
        FAIL.append(f"a card's answer {c['correct']!r} is not among its options")
        break
    if len(set(c["easyOptions"])) != len(c["easyOptions"]):
        FAIL.append(f"a card repeats an option: {c['easyOptions']}")
        break
    swap = [o for o in c["easyOptions"] if o != c["correct"] and o.endswith(c["slots"][1]["text"])]
    if not swap:
        FAIL.append(f"no option asks for the SAME thing another way — {c['correct']!r}: {c['easyOptions']}")
        break
else:
    OK.append("200 cards: the answer is present, options are distinct, and one asks for the same "
              "thing with a different opener")

# The context line must hand over nothing.
leaks = [c for c in cards if any(
    re.search(rf"(^|[\s'’]){re.escape(t)}([\s.,!?]|$)", c["meta"], re.I)
    for t in (c["slots"][0]["text"], c["slots"][1]["text"]))]
check(not leaks, f"the context line {cards[0]['meta']!r} prints no answer",
      f"{len(leaks)} card(s) print an answer in the line above the gap")

for value, seen in W["byWant"].items():
    want = {it["sentence"] for it in W["items"] if it["want"] == value}
    check(seen and set(seen) <= want,
          f"pinning « {value} » stays with that opener ({len(seen)} of {len(want)})",
          f"pinning « {value} » produced {sorted(set(seen) - want)} — the dropdown is a lie")

# ---- SIO-025 · the table is the deck ---------------------------------------
# parce-que.tsx is a .tsx and cannot be imported by node, so its table is read
# and rebuilt here. The reassembly rule is « Parce que » + frame + rest, which
# is the one line of logic the file has.
pq_src = read(f"{NAT}/parce-que.tsx")
rows = re.findall(
    r'\{\s*ask:\s*"([^"]+)",\s*frame:\s*"([^"]+)",\s*rest:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}', pq_src)
pq_deck = json.load(open("src/content/collections/parce-que.json", encoding="utf-8"))["items"]
check(len(rows) == len(pq_deck) == 6,
      f"parce-que carries all {len(pq_deck)} deck items",
      f"the table has {len(rows)} rows against the deck's {len(pq_deck)} — a reason is being taught "
      f"or dropped silently")
for i, ((ask, frame, rest, en), item) in enumerate(zip(rows, pq_deck)):
    rebuilt = f"Parce que {frame} {rest}"
    check(rebuilt == item["fr"],
          f"reason {i + 1} reassembles to {item['fr']}",
          f"reason {i + 1} reassembles to {rebuilt!r}, the deck says {item['fr']!r} — the frame is "
          f"filed wrong, and a wrong frame teaches the wrong opening")
    check(ask == item["example"],
          f"reason {i + 1} keeps the deck's own question",
          f"reason {i + 1} asks {ask!r}, the deck asks {item['example']!r}")
    check(en == item["en"],
          f"reason {i + 1}'s prompt is the deck's own English",
          f"reason {i + 1}'s prompt is {en!r}, the deck says {item['en']!r}")

# ★ must take the frame, not « Parce que » and not the reason.
check(re.search(r'medFrom\(slots,\s*"frame"\)', pq_src) is not None,
      "parce-que blanks the FRAME at ★ — the choice the stop is about",
      "parce-que blanks something else at ★; the stop would drill a word the English already gives")
check(re.search(r'\{\s*text:\s*"Parce que"\s*\}', pq_src) is not None,
      "« Parce que » is scaffolding the learner always sees",
      "« Parce que » has become blankable — the connector is the one word this stop does not "
      "need to teach")
# The prompt is the English, for the reason written into the file: six generic
# reasons do not pair one-to-one with six questions.
check(re.search(r'big:\s*r\.en', pq_src) is not None and re.search(r'meta:\s*r\.ask', pq_src) is not None,
      "the English reason is the prompt and the deck's question is the context",
      "parce-que prompts with the QUESTION — « Pourquoi tu aimes le sport ? » is answered by three "
      "of the six reasons, so a card grading one of them marks two correct answers wrong")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
