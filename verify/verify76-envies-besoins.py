#!/usr/bin/env python3
"""
SIO-039 has a lesson, and every word of its French is the deck's own.

WHY THIS EXISTS. `envies-besoins` had a deck and no
`src/content/lessons/native/<slug>.tsx`, so a concept had physically nowhere to
live and the 💡 Idea tab read "Idea has not been written for this lesson yet"
(docs/HANDOVER_LESSON_FILES.md; fluoduo-main split the nine-file handover on
1 Sep and gave this lane the deck-backed stops). The file supplies the Mémo,
the dice and the bonus; the `concept` slot stays empty for the concepts lane.

THE THREE THINGS THAT CAN SILENTLY BE WRONG ABOUT SUCH A FILE

  1 · THE REGISTRATION JOINTS. A lesson that exists and is not wired is
      invisible to a learner and looks completely finished in a diff. That is
      why verify68 checks all three; this repeats the shape for this slug —
      the import, the NATIVE_LESSONS entry, the LESSON_META row and the
      LESSONS_BY_SIO row.

  2 · THE TABLE IS THE DECK. `CARDS` decomposes each of the ten items' `fr`
      into frame · link · rest. A decomposition that has drifted from
      envies-besoins.json — a `de` added where the deck has none, an elision
      quietly normalised — reads as perfectly ordinary code and would teach a
      wrong frame. So this REASSEMBLES all ten and compares them to the JSON,
      rather than reading the table and believing it.

  3 · THE `de` SPLIT IS THE DECK'S, NOT AN OPINION. The lesson's whole claim is
      that three frames take their object bare and two need `de`. If that were
      hand-asserted it could be wrong; it is checked against which items in the
      JSON actually carry `de`/`d'` after the frame.

WHAT IS NOT CHECKED HERE, deliberately: the register scale (polite → blunt).
It is real and it is in the deck's own English glosses, but it is a claim about
usage rather than a fact about strings, and a check that asserted it would be
asserting the prose rather than the data. The concepts lane argues it; Dan
reads it. That is the read-before-ship rule doing its job.

Run from the repo root:  python3 verify/verify76-envies-besoins.py
"""
import json
import os
import subprocess
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

LESSON = "src/content/lessons/native/envies-besoins.tsx"
DECK = "src/content/collections/envies-besoins.json"
META = "src/content/lessons.ts"
REG = "src/content/lessons/native/index.tsx"

src = read(LESSON)
meta, reg = read(META), read(REG)
deck = json.loads(read(DECK)) if os.path.isfile(DECK) else {}

ok(bool(src), f"{LESSON} exists", f"{LESSON} is missing — SIO-039 has nowhere to put a concept")
ok(bool(deck), f"{DECK} exists", f"{DECK} is missing")

# ---- 1 · the registration joints -----------------------------------------
ok('from "./envies-besoins"' in reg,
   "the registry imports the lesson",
   "the native index does not import it — the file is invisible to a learner")
ok(re.search(r'"envies-besoins":\s*enviesBesoinsLesson', reg) is not None,
   "the registry maps the slug to the lesson",
   "NATIVE_LESSONS has no envies-besoins entry — the route 404s")
ok(re.search(r'"envies-besoins":\s*\{\s*slug:\s*"envies-besoins"', meta) is not None,
   "LESSON_META carries the slug",
   "LESSON_META has no envies-besoins row — the gallery cannot list it")
ok(re.search(r'"SIO-039":\s*\[\s*"envies-besoins"\s*\]', meta) is not None,
   "SIO-039 points at the lesson",
   "LESSONS_BY_SIO does not attach it to SIO-039 — the stop still has no lesson")

# ---- 2 · EXECUTED, not re-implemented ------------------------------------
# The generator lives in a JSX-free `.gen.ts` for exactly this reason: node can
# strip types from it, so this check runs the real code 4000 times instead of
# regex-reading a table and rebuilding sentences in Python.
#
# The first draft did the latter, reimplemented `sentence()`'s elision rule with
# the test on the wrong side, produced « J'ai besoind'un hôtel » and reported
# the LESSON as having invented French. The lesson was right; the checker was
# the second implementation and it was the broken one. Executing removes that
# class of failure rather than fixing one instance of it.
JS = r"""
const B = "./src/content/lessons/native/";
const fs = await import("node:fs");
const { enviesQuestion, CARDS, FRAMES, line } = await import(B + "envies-besoins.gen.ts");
const deck = JSON.parse(fs.readFileSync("./src/content/collections/envies-besoins.json", "utf8"));
const deckFr = new Set(deck.items.map((i) => i.fr));
const bad = [], seen = new Set(), nonDeck = new Set();
for (let i = 0; i < 4000; i++) {
  const q = enviesQuestion();
  if (!deckFr.has(q.correct)) bad.push("correct is not a deck line: " + q.correct);
  if (!q.easyOptions.includes(q.correct)) bad.push("options omit the answer: " + q.correct);
  if (new Set(q.easyOptions).size !== q.easyOptions.length) bad.push("duplicate option on: " + q.correct);
  if (!q.med.choices.includes(q.med.correct)) bad.push("med omits its answer: " + q.correct);
  seen.add(q.correct);
  for (const o of q.easyOptions) {
    if (!deckFr.has(o)) nonDeck.add(o);
    if (/\s{2,}/.test(o) || /besoind|envied|voudraisd|veuxd|aimeraisd/.test(o)) bad.push("jammed: " + o);
  }
}
const rebuilt = CARDS.map(line);
console.log(JSON.stringify({
  bad: [...new Set(bad)].slice(0, 8),
  covered: [...deckFr].every((f) => seen.has(f)),
  deckCount: deckFr.size,
  rebuiltMatchesDeck: rebuilt.length === deckFr.size && rebuilt.every((r) => deckFr.has(r)),
  nonDeck: [...nonDeck].sort(),
  needDe: FRAMES.filter((f) => f.de).map((f) => f.fr).sort(),
}));
"""
r = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS],
                   capture_output=True, text=True)
ok(r.returncode == 0, "the generator executed in node",
   f"the generator would not run: {r.stderr[-400:]}")
if r.returncode == 0:
    d = json.loads(r.stdout.strip().splitlines()[-1])
    ok(not d["bad"],
       "4000 generated cards are well-formed — answer present, no duplicate option, med holds its answer",
       f"generated cards are malformed: {d['bad']}")
    ok(d["rebuiltMatchesDeck"],
       f"all {d['deckCount']} table rows rebuild to the deck's own `fr`, exactly",
       "the lesson's table no longer reassembles to envies-besoins.json — it is teaching French the deck does not contain")
    ok(d["covered"],
       "every card in the deck can come up",
       "some deck cards are unreachable — the generator cannot produce them")
    # THE ONLY FRENCH THIS FILE COMPOSES IS THE `de` ERROR, and it must be wrong
    # in exactly ONE way — same frame, same object, only the `de` moved. Tested
    # by NORMALISING it away rather than by pattern-matching the result: strip
    # any « de »/« d' » sitting between the frame and its object, and a correct
    # distractor collapses onto the deck line it was made from. Anything that
    # does not collapse is French nobody authored.
    #
    # A pattern here was wrong twice before it was right: « J'ai envie dormir »
    # is the intended error, and a rule saying "an avoir frame not followed by
    # d…" rejects it, because `dormir` begins with a d. Normalising has no such
    # edge — it compares strings, not shapes.
    def bare(x):
        return re.sub(r"^((?:Je voudrais|J'aimerais|Je veux|J'ai besoin|J'ai envie))\s*(?:d['’]|de\s)\s*",
                      r"\1 ", x)
    deck_bare = {bare(f) for f in (i["fr"] for i in deck.get("items", []))}
    strays = [x for x in d["nonDeck"] if bare(x) not in deck_bare]
    ok(not strays,
       f"the only non-deck options are the {len(d['nonDeck'])} deliberate « de » errors — "
       "each one a deck line with the « de » moved, and nothing else changed",
       f"the generator composes French that is neither the deck's nor the intended error: {strays[:3]}")

    # ---- 3 · the `de` split is the deck's, not an opinion ----------------
    deck_fr = [i["fr"] for i in deck.get("items", [])]
    deck_needs_de = sorted({m.group(1) for m in
                            (re.match(r"(J'ai \w+)\s*(d['’]|de\s)", fr) for fr in deck_fr) if m})
    ok(deck_needs_de and d["needDe"] == deck_needs_de,
       f"the frames marked as needing « de » are exactly the deck's ({deck_needs_de})",
       f"the lesson says {d['needDe']} need « de »; the deck's own strings say {deck_needs_de}")
    ok(any(re.search(r"d['’]", x) for x in deck_fr) and any(re.search(r"\bde\s", x) for x in deck_fr),
       "the deck contains both « d'… » and « de … », so the elision is shown, not asserted",
       "the deck no longer shows both forms of « de » — the Mémo's elision rule has nothing behind it")

# The generator must stay JSX-free, or the execution above silently becomes
# impossible and this file would have to go back to guessing.
gen = read("src/content/lessons/native/envies-besoins.gen.ts")
ok(bool(gen) and "</" not in gen and "className" not in gen,
   "the generator is JSX-free, so it stays executable",
   "the generator has grown JSX — node cannot strip types from it and this check would have to re-implement it again")
ok('from "./cloze.ts"' in gen,
   "the generator imports with an explicit .ts, as node's loader requires",
   "the generator uses an extensionless import — node resolves it to nothing and the check cannot run")

# ---- 4 · the concept, now written -----------------------------------------
#
# CROSS-LANE EDIT — concepts lane, 1 Sep. Read this before reverting it.
#
# As pushed this asserted `concept` was ABSENT, which was right while the field
# was owed: a stub renders to a learner as the real argument. SIO-039's concept
# is now written, so absence has flipped meaning — it would mean a merge dropped
# it. Same intent, asserted from the other side. This is the third file to take
# this edit (verify74, verify75, and now here); the wording is kept identical
# across the three so they read as one decision rather than three.
ok(re.search(r"^\s*concept:", src, flags=re.M) is not None,
   "envies-besoins.tsx carries its concept",
   "envies-besoins.tsx has no `concept` — SIO-039 was the stop that read 'Idea has not been written for this lesson yet'")

for slot in ("subtitle", "contrast", "question", "answer", "remember"):
    ok(re.search(rf"^\s+{slot}:", src, flags=re.M) is not None,
       f"the concept fills `{slot}`",
       f"the concept has no `{slot}` — a concept missing a required slot is a stub with a type annotation")

# find(), not index(): with the concept gone the check above has already said so
# in words, and index() would raise here, turning a diagnosed failure into a
# traceback that names no cause.
_at = src.find("  concept: {")
_concept = src[_at:] if _at != -1 else ""

# THE ARGUMENT IS THE SPLIT, AND A STUB CANNOT FAKE IT. The Memo already states
# that three frames take their object bare and two need `de`; the concept exists
# to say WHY, which means it has to set a verb frame against an avoir frame. A
# concept naming only one side is not making this stop's argument.
for needle, why in (
        ("Je veux", "a bare verb frame"),
        ("besoin", "an avoir frame, which is the half that needs de"),
        ("noun", "the noun — the reason de is there at all"),
):
    ok(needle in _concept,
       f"the claim uses {why}",
       f"the concept never names {why}, so it is not explaining the split the Memo states")

# NO NEW FRENCH: every quoted French line must already exist in the deck, in
# this file, or in another concept. Extracted rather than listed — a check that
# names its own examples passes on French nobody has ever seen.
_norm = lambda t: re.sub(r"\s+", " ", t.replace("\u2019", "'").replace("&rsquo;", "'")
                                        .replace("&mdash;", "-").replace("&nbsp;", " ")).strip()
_hay = _norm(read("src/content/collections/envies-besoins.json")
             + "".join(read(f"src/content/lessons/native/{n}.tsx")
                       for n in ("au-marche", "nombres-echanges")))
#
# THE `wrong:` COLUMN IS EXEMPT, AND HAS TO BE. A pitfall table's left column is
# deliberately incorrect French — « Je veux de partir » exists in no source file
# BECAUSE IT IS THE ERROR. A first draft of this check flagged all four of them
# and would have been silenced rather than fixed, which is worse than not
# having it. So the wrong cells are cut out before the scan, and everything that
# remains — the claim, the right column, the flow, the checks — must be real.
_scanned = re.sub(r"wrong:.*?(?=\n\s*right:)", "", _concept, flags=re.S)
_unaccounted = []
for raw in re.findall(r'<i lang="fr">(.*?)</i>', _scanned, flags=re.S):
    txt = _norm(re.sub(r'\{" "\}', " ", re.sub(r"<[^>]+>", "", raw)))
    if not txt:
        continue
    # A GAP IS NOT INVENTED FRENCH. A mini-check prints the deck's own sentence
    # with a blank in it — « J'ai besoin ___ un hôtel » is « J'ai besoin d'un
    # hôtel » minus the answer. So a line is split on its gap (or on an elided
    # middle) and every part must be real; the whole never will be.
    parts = [c.strip(" .!?…") for c in re.split(r"_{2,}|…", txt) if c.strip(" .!?…")]
    if all(c.lower() in _hay.lower() for c in parts):
        continue
    _unaccounted.append(txt)
ok(not _unaccounted,
   "every French line in the concept comes from the deck or an existing lesson",
   "French in the concept that appears in no source file: " + "; ".join(f"<< {u} >>" for u in _unaccounted[:4]))

# ---- 5 · one composed string, and it is the error ------------------------
# Read from the GENERATOR, not the .tsx — the card logic moved there so it could
# be executed, and a check left pointing at the old home passes on absence.
# IN THE OPTIONS, not merely declared. `"shapeError" in gen` passed while the
# option list had been changed to `[correct, ...decoys]` and the constant sat
# there unused — the same vacuous shape that has now been caught five times in
# this repo: a NAME is satisfied by its own definition. Assert the use.
ok(re.search(r"easyOptions:\s*\[[^\]]*\bshapeError\b", gen) is not None,
   "the deliberate « de » error is actually offered as an option",
   "the distractor is declared but not offered — the MCQ has nothing that tests the rule")
ok(gen.count("easyOptions") == 1,
   "the generator builds its option list once",
   "the option list is assembled in more than one place — two shapes of card from one lesson")
ok("newQuestion: enviesQuestion" in src,
   "the lesson delegates its card to the executable generator",
   "the lesson has its own inline generator again — verify76 could not execute it")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
