#!/usr/bin/env python3
"""verify77 — the five remaining ateliers, and the two traps they share.

WHY THIS EXISTS
---------------
SIO-020, 030, 040, 049 and 050 complete colour review's nine. They copy
atelier-rencontre's shape, so they copy the trap it found, and a regression on
it is silent on all five at once.

  1 · THE MÉMO IS THE MODEL, PASSED THROUGH. `LessonPager` resolves the panel as
      `memo={lesson?.memo ?? memoForDeck(collectionId)}`, so REGISTERING a
      lesson for an atelier is enough, by itself, to delete « Le modèle » from
      the panel an atelier opens on. verify71 cannot see it — that suite reads
      memos.tsx, which stays perfectly correct while nothing renders it. Six
      files now depend on this and none shows a symptom in a diff.

  2 · NOTHING IS SUBSTITUTED INTO ANYTHING. This one was learned the hard way.
      The exercise was built first out of `FINALE_BANK` — Dan's own red-penned
      items, keyed by stop, holding exactly what each atelier is graded on. It
      built, it typechecked, 141 assertions passed, and then a card was opened:

          A WELL-WISH WORD
          Tu pars en France demain : « Bon chance ! »

      Those items were authored for a TYPE-IN game. A bank item guarantees that
      ITS answer fits ITS frame, and nothing at all about another item's answer
      in that frame — so every multiple choice built by substitution is a gamble
      on agreement, elision and word order. Widening the gap fixed the
      well-wishes and « un sympa restaurant » was waiting in the adjectives; a
      scan for "categories whose frame governs the answer" fires on sixty of
      them, which is to say it separates nothing.

      So the options are whole turns of the model, verbatim, and that is what
      this asserts: every option a card offers must be a line of that stop's own
      dialogue, character for character. It is the property the bank could not
      give, and it is the same root cause as the deck supply's « J'veux »
      (task_da59bc63) reached from the opposite direction.

Run from the repo root:  python3 verify/verify77-five-ateliers.py
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
PROBE = "verify/.verify77-probe.mjs"

FIVE = [
    ("SIO-020", "atelier-pays", "atelierPaysLesson"),
    ("SIO-030", "atelier-email", "atelierEmailLesson"),
    ("SIO-040", "atelier-itineraire", "atelierItineraireLesson"),
    ("SIO-049", "atelier-avis-resto", "atelierAvisRestoLesson"),
    ("SIO-050", "atelier-resto", "atelierRestoLesson"),
]

idx = read(f"{NAT}/index.tsx")
lessons = read("src/content/lessons.ts")
pager = read("src/app/lessons/pager/LessonPager.tsx")
body = re.search(r"NATIVE_LESSONS[^=]*=\s*\{(.*?)\n\};", idx, re.S)
decks = read("src/content/collections/atelierDecks.ts")

check(re.search(r"memo=\{lesson\?\.memo \?\? \(collectionId \? memoForDeck\(collectionId\) : undefined\)\}", pager) is not None,
      "LessonPager still prefers the lesson's Mémo over the deck's",
      "the pager's memo resolution changed — re-read whether an atelier lesson still needs to pass "
      "the model through, and fix all six at once if it does not")

for sio, slug, export in FIVE:
    src = read(f"{NAT}/{slug}.tsx")
    check(bool(src), f"{slug} has a lesson file", f"{sio} still has no lesson file")
    check(f"export const {export}" in src, f"{slug}.tsx exports {export}",
          f"{slug}.tsx does not export {export}")
    check(f'import {{ {export} }} from "./{slug}"' in idx,
          f"{export} is imported by native/index.tsx",
          f"{export} is never imported — getNativeLesson('{slug}') returns undefined")
    check(body is not None and f'"{slug}": {export}' in body.group(1),
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

    # ---- 1 · the model survives registration -------------------------------
    check(re.search(r"memo:\s*memoForDeck\(", src) is not None,
          f"{slug} passes the GENERATED Mémo through — the model survives registration",
          f"{slug} authors its own Mémo. Registering it replaces memoForDeck(), so « Le modèle » "
          f"vanishes from the panel {sio} opens on, and verify71 stays green while it happens")
    check(re.search(r'const DECK = `atelier-\$\{SIO\.toLowerCase\(\)\}`', src) is not None,
          f"{slug} derives its deck id the way atelierDecks.ts does",
          f"{slug} types its deck id out; a typo yields `undefined` and an empty Mémo with no error")
    check(re.search(rf'const SIO = "{sio}"', src) is not None,
          f"{slug} names {sio}", f"{slug} does not name {sio}")
    check("atelierModel" in src,
          f"{slug}'s cards come from the model's own turns",
          f"{slug} builds its cards some other way — read atelierModel.ts before changing this: "
          f"an option assembled rather than quoted is a gamble on agreement")

    # A .gen.ts exists so verify46 can execute a DECLARED axis. None of the five
    # declares one — a model's turns are not kinds to filter — so none should
    # carry the file either, and verify46 fails on a .gen.ts with no axis.
    check(not read(f"{NAT}/{slug}.gen.ts"),
          f"{slug} has no .gen.ts, because it declares no axis",
          f"{slug} ships a .gen.ts with no axis; verify46 requires one of every .gen.ts")
    check("axes:" not in src,
          f"{slug} declares no axis — a model's turns are not a set of kinds",
          f"{slug} declares an axis; if it is real it needs a .gen.ts, and if it has one option it "
          f"is decoration")

    check(re.search(rf'"{sio}":\s*\{{[^}}]*slug:\s*"{slug}"', decks) is not None,
          f"{slug} is {sio}'s own lessonSlug in atelierDecks.ts",
          f"atelierDecks.ts does not give {sio} the slug {slug!r} — the deck and the lesson would "
          f"be two names for one stop")

# ---- execute all five ------------------------------------------------------
probe = """
// Written by verify77.
const A = await import("../src/content/ateliers.ts");
const M = await import("../src/content/lessons/native/atelierModel.ts");
const out = {};
for (const sio of %s) {
  const cards = [];
  for (let i = 0; i < 500; i++) {
    const q = M.questionFor(sio);
    cards.push({ meta: q.meta, big: q.big, bigLang: q.bigLang, correct: q.correct,
                 easyOptions: q.easyOptions, med: q.med });
  }
  out[sio] = { lines: A.ATELIER_DIALOGUES[sio], usable: M.linesFor(sio), cards };
}
console.log("@@JSON@@" + JSON.stringify(out));
""" % json.dumps([s for s, _, _ in FIVE])

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
    print("  FAIL the atelier generators could not be executed:")
    print((r.stderr or r.stdout)[-2000:])
    sys.exit(1)
D = json.loads(marker[0][len("@@JSON@@"):])

for sio, slug, _ in FIVE:
    S = D[sio]
    cards, lines, usable = S["cards"], S["lines"], S["usable"]
    fr = {l["fr"] for l in lines}

    # ---- 2 · nothing is substituted into anything ---------------------------
    stray = sorted({o for c in cards for o in c["easyOptions"]} - fr)
    check(not stray,
          f"{sio}: every option is a turn of this model, verbatim ({len(fr)} turns)",
          f"{sio}: {len(stray)} option(s) are not a line of the dialogue: {stray[:2]} — an option "
          f"assembled from parts can be ungrammatical however carefully the parts were chosen")
    check(all(c["correct"] in fr for c in cards),
          f"{sio}: every answer is a line of the model",
          f"{sio}: a card is graded against French the model does not contain")

    # atelierDecks.ts's own filter, applied here too, so the lesson and the deck
    # cannot disagree about what counts as a card.
    names = {l["fr"] for l in lines if l["fr"] == l["en"]}
    check(all(u["fr"] not in names for u in usable),
          f"{sio}: a line whose French and English are identical is not dealt",
          f"{sio}: a proper name is dealt as a card — it asks the learner to recall nothing")
    check(len({u["fr"] for u in usable}) == len(usable),
          f"{sio}: no turn is dealt twice ({len(usable)} usable of {len(lines)})",
          f"{sio}: a repeated line is dealt twice — a duplicate card is a free point")
    check(len(usable) >= 4,
          f"{sio}: {len(usable)} usable turns — enough for a four-option card",
          f"{sio}: only {len(usable)} usable turns; a card cannot offer four distinct options")

    check(all(len(c["easyOptions"]) >= 4 for c in cards),
          f"{sio}: every card offers four options",
          f"{sio}: {sum(1 for c in cards if len(c['easyOptions']) < 4)} card(s) offer fewer than four")
    check(all(c["correct"] in c["easyOptions"] for c in cards),
          f"{sio}: the answer is among its own options",
          f"{sio}: a card's answer is missing from its options")
    check(all(len(set(c["easyOptions"])) == len(c["easyOptions"]) for c in cards),
          f"{sio}: no card repeats an option",
          f"{sio}: a card repeats an option — a free elimination")
    check(len({c["correct"] for c in cards}) == len(usable),
          f"{sio}: every usable turn is reachable ({len({c['correct'] for c in cards})})",
          f"{sio}: only {len({c['correct'] for c in cards})} of {len(usable)} turns ever generate")

    # The prompt is the line's own English, tagged as English.
    en = {l["fr"]: l["en"] for l in lines}
    check(all(c["big"] == en.get(c["correct"]) for c in cards),
          f"{sio}: the prompt is the line's own English",
          f"{sio}: a card's prompt is not the dialogue's own gloss for that line")
    check(all(c["bigLang"] == "en" for c in cards),
          f"{sio}: the English prompt is tagged as English",
          f"{sio}: a prompt is not tagged bigLang='en' — 🔊 would read it with French phonics")

    # The context line carries no French, so it cannot leak an answer.
    leaks = [c for c in cards if any(o in c["meta"] for o in c["easyOptions"])]
    check(not leaks, f"{sio}: the context line prints no option",
          f"{sio}: {len(leaks)} card(s) print an option in the line above")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
