#!/usr/bin/env python3
"""verify75 — an atelier's lesson adds the register and does not eat the model.

WHY THIS EXISTS
---------------
SIO-010 is the first of six ateliers to get a lesson file (colour review's
handover), and the shape it settles is the shape the other five copy. Three
things about that shape are load-bearing and every one of them fails silently.

  1 · THE MÉMO IS THE MODEL, PASSED THROUGH. `LessonPager` resolves the panel as
      `memo={lesson?.memo ?? memoForDeck(collectionId)}`. So REGISTERING a
      lesson for an atelier is enough, on its own, to delete the model dialogue
      from Forms — the one panel an atelier opens on, and the thing Dan asked
      for by name on 31 Aug. verify71 cannot see it: that suite reads memos.tsx,
      which stays perfectly correct while nothing renders it. The fallback is
      the fragile half of the expression, so this asserts the lesson takes the
      generated Mémo rather than writing one.

  2 · THE STEPS OF THE THREE AUDIENCES ARE PARALLEL. The generator addresses a
      question by INDEX across `SIO010_SITUATIONS` — step 4 of the student's
      run is step 4 of the client's. A question inserted into one situation and
      not the others re-points every label to the wrong question, and every card
      still renders. So the three runs are held to one length and one shape.

  3 · THE GREETING STEP IS EXCLUDED, AND ONLY IT. The other six ask the learner
      to PRODUCE a line — each of their titles ends « You say: » — which is what
      a Dice card is. The greeting step asks a judgement instead ("which is the
      LEAST appropriate with a business client?"), so there is no line to build
      a card from. The exclusion must be driven by the step's own `produces`
      flag, not by the index 0 happening to be the greeting, and that flag must
      agree with what the authored titles actually ask for.

      It was `multi: true` until 2026-09-08 — several greetings were right — and
      the exclusion rode on that. Dan rewrote the three greeting questions to a
      single answer each, so `multi` stopped being true and stopped being the
      reason; the reason it replaced it with is the one above.

It also pins the ordinary things: the three registration joints, `concept` left
to the concepts lane, and no invented French — every option a card offers must
be a string that already exists in unit0-questions.ts.

Run from the repo root:  python3 verify/verify75-atelier-lesson.py
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
PROBE = "verify/.verify75-probe.mjs"

src = read(f"{NAT}/atelier-rencontre.tsx")
gen = read(f"{NAT}/atelier-rencontre.gen.ts")
idx = read(f"{NAT}/index.tsx")
lessons = read("src/content/lessons.ts")
pager = read("src/app/lessons/pager/LessonPager.tsx")

# ---- the three joints ------------------------------------------------------
check(bool(src) and bool(gen),
      "SIO-010 has a lesson file and a loadable generator",
      "atelier-rencontre.tsx / .gen.ts is missing — SIO-010 still has nowhere to put a concept")
check('import { atelierRencontreLesson } from "./atelier-rencontre"' in idx,
      "atelierRencontreLesson is imported by native/index.tsx",
      "atelierRencontreLesson is never imported — getNativeLesson('atelier-rencontre') returns undefined")
body = re.search(r"NATIVE_LESSONS[^=]*=\s*\{(.*?)\n\};", idx, re.S)
check(body is not None and '"atelier-rencontre": atelierRencontreLesson' in body.group(1),
      "atelier-rencontre is registered in NATIVE_LESSONS",
      "atelier-rencontre is imported but not put in the NATIVE_LESSONS map — an import with no map entry is dead")
check(re.search(r'"atelier-rencontre":\s*\{\s*slug:\s*"atelier-rencontre"', lessons) is not None,
      "atelier-rencontre has a LESSONS row",
      "atelier-rencontre is missing from LESSONS — the /lessons gallery cannot see it")
check(re.search(r'"SIO-010":\s*\[[^\]]*"atelier-rencontre"', lessons) is not None,
      "SIO-010 points at its own lesson",
      "LESSONS_BY_SIO has no SIO-010 -> atelier-rencontre row, so the stop shows no lesson")
# CROSS-LANE EDIT — concepts lane, 1 Sep. Read this before reverting it.
#
# As pushed this asserted `concept` was ABSENT, which was right while the field
# was owed: a stub reads to a learner as the real argument and has to be hunted
# down before the true one lands. SIO-010's concept is now written, so absence
# has flipped meaning — it would mean a merge dropped it. Same intent, asserted
# from the other side.
check(re.search(r"^\s*concept:", src, re.M) is not None,
      "atelier-rencontre.tsx carries its concept",
      "atelier-rencontre.tsx has no `concept` — SIO-010 is the atelier prototype, and the other five copy its shape")

# Presence alone cannot tell a concept from a placeholder, so every required
# slot must be filled too.
for slot in ("subtitle", "contrast", "question", "answer", "remember"):
    check(re.search(rf"^\s+{slot}:", src, re.M) is not None,
          f"the concept fills `{slot}`",
          f"atelier-rencontre.tsx's concept has no `{slot}` — a concept missing a required slot is a stub with a type annotation")

# find(), not index(): with the concept gone the check above has already said so
# in words, and index() would raise here, turning a diagnosed failure into a
# traceback that names no cause.
_at = src.find("  concept: {")
concept_src = src[_at:] if _at != -1 else ""

# THE ARGUMENT IS THE REGISTER, AND ITS PROOF IS THE LINE THAT DOES NOT MOVE.
# « Comment ça s'écrit ? » is correct to a student, a client and a group alike,
# because it asks about letters rather than about the person. A concept that
# never sets the three audiences against each other is not making this stop's
# argument, whatever else it says.
for needle, why in (
        ("Comment tu t", "the tu line the model actually runs on"),
        ("Comment vous vous appelez", "the vous line the other two audiences take"),
        ("Bonjour à tous", "the plural greeting that separates a group from one person"),
        ("crit ?", "« Comment ça s'écrit ? », the one line register does not touch"),
):
    check(needle in concept_src,
          f"the claim uses {why}",
          f"the concept never names {why}, so it is not arguing that the register governs the whole exchange")

# EVERY FRENCH LINE IN THE CONCEPT MUST BE DAN'S, AND THE CHECK HAS TO FIND THEM
# ITSELF. A first draft of this block listed six known-good strings and asserted
# each was in the source *if it appeared* — which can only fail if the source
# changes, and passes cleanly on French nobody has ever seen. That is the fault
# this suite has hit twice already: a pin that passes when it cannot find its
# site. So the strings are EXTRACTED from the concept, and each must be
# accounted for.
#
# Apostrophes are normalised on BOTH sides. The concept writes `&rsquo;` (U+2019)
# because JSX must; unit0-questions.ts writes a straight quote. Comparing them
# raw reports every contraction in the lesson as invented French — which is a
# check crying wolf until someone silences it.
_norm = lambda t: re.sub(r"\s+", " ", t.replace("’", "'").replace("&rsquo;", "'")
                                        .replace("&mdash;", "—").replace("&nbsp;", " ")).strip()
_haystack = _norm(read("src/content/sios/unit0-questions.ts") + read("src/content/ateliers.ts"))
_fr = re.findall(r'<i lang="fr">(.*?)</i>', concept_src, re.S)
_unaccounted = []
for raw in _fr:
    txt = _norm(re.sub(r"\{\" \"\}", " ", raw))
    # a quoted span may elide the middle of an authored line with « … »
    parts = [c.strip() for c in txt.split("…") if c.strip()]
    if not all(c in _haystack for c in parts):
        _unaccounted.append(txt)

check(len(_fr) >= 8,
      f"the concept quotes the stop's French ({len(_fr)} spans)",
      "the concept quotes almost no French — the register argument cannot be made without the lines it moves")
check(not _unaccounted,
      "every French line in the concept comes from the pre-test or the model dialogue",
      "invented French in the concept, in no source file: " + "; ".join(f"« {u} »" for u in _unaccounted[:3]))

# ---- 1 · the Mémo is the model, and the fallback that made it so is intact --
check(re.search(r"memo:\s*memoForDeck\(", src) is not None,
      "the lesson passes the GENERATED Mémo through — the model survives registration",
      "the lesson authors its own Mémo. Registering it replaces memoForDeck(), so « Le modèle » "
      "vanishes from the panel an atelier opens on, and verify71 stays green while it happens")
check(re.search(r'const DECK = `atelier-\$\{SIO\.toLowerCase\(\)\}`', src) is not None,
      "the deck id is derived from the SIO id, the way atelierDecks.ts derives it",
      "the deck id is typed out; a typo yields `undefined` and an empty Mémo with no error anywhere")
check(re.search(r"memo=\{lesson\?\.memo \?\? \(collectionId \? memoForDeck\(collectionId\) : undefined\)\}", pager) is not None,
      "LessonPager still prefers the lesson's Mémo over the deck's",
      "the pager's memo resolution changed — re-read whether an atelier lesson still needs to pass the model through")

# ---- 3 · the exclusion is driven by `multi`, not by an index ---------------
check(re.search(r"ASKABLE\s*=\s*STEPS\.filter\(\(s\) => s\.produces\)", gen) is not None,
      "the judgement step is excluded by its own `produces` flag",
      "the askable steps are chosen some other way — an index test breaks the moment a step moves, "
      "and a judgement question on a produce-the-line card asks for a line it never names")

# ---- execute: the parallel steps, the options, the axes --------------------
probe = """
// Written by verify75.
const g = await import("../src/content/lessons/native/atelier-rencontre.gen.ts");
const u = await import("../src/content/sios/unit0-questions.ts");
const sits = u.SIO010_SITUATIONS;
const cards = [];
for (let i = 0; i < 400; i++) {
  const q = g.rencontreQuestion();
  cards.push({ meta: q.meta, big: q.big, bigLang: q.bigLang, correct: q.correct,
               easyOptions: q.easyOptions, med: q.med });
}
const byAxis = {};
for (const ax of g.RENCONTRE_AXES) {
  byAxis[ax.key] = {};
  for (const o of ax.options) {
    byAxis[ax.key][o.value] = [...new Set(Array.from({ length: 150 },
      () => { const q = g.rencontreQuestion({ [ax.key]: o.value }); return q.meta + "||" + q.correct; }))];
  }
}
console.log("@@JSON@@" + JSON.stringify({
  steps: g.STEPS.map((s) => ({ key: s.key, label: s.label, produces: s.produces })),
  askable: g.ASKABLE.map((s) => s.key),
  situations: sits.map((s) => ({
    key: s.key, who: s.who, label: s.label,
    questions: s.questions.map((q) => ({
      title: q.title ?? null, multi: !!q.multi,
      options: q.options.map((o) => o.v), ok: q.options.filter((o) => o.ok).map((o) => o.v),
    })),
  })),
  cards, byAxis,
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
    print("  FAIL the atelier generator could not be executed:")
    print((r.stderr or r.stdout)[-2000:])
    sys.exit(1)
d = json.loads(marker[0][len("@@JSON@@"):])
sits, steps, cards = d["situations"], d["steps"], d["cards"]

# ---- 2 · the three audiences are parallel ---------------------------------
check(len(sits) == 3, f"three audiences are authored ({len(sits)})",
      f"{len(sits)} audiences — the stop's competence names three (tu, vous, plural vous)")
lens = {len(s["questions"]) for s in sits}
check(len(lens) == 1,
      f"all three audiences run the same {lens.pop() if len(lens) == 1 else '?'} steps",
      f"the audiences have different question counts {sorted(lens)} — the generator addresses a step by "
      f"INDEX, so an extra question in one run re-points every label to the wrong question")
check(len(steps) == len(sits[0]["questions"]),
      f"the STEPS table has one row per authored question ({len(steps)})",
      f"STEPS has {len(steps)} rows against {len(sits[0]['questions'])} authored questions — the labels "
      f"have slipped off the questions they name")
for i, st in enumerate(steps):
    # EVERY step is single-answer now, drillable or not — the whole pre-test is
    # MCQ since 2026-09-08 (Dan's own older rule, applied to the last three that
    # were not). A step that grows a second correct answer breaks two things at
    # once: the merged SpecuLearn, which cannot grade it, and any card built
    # from it.
    singles = [len(s["questions"][i]["ok"]) for s in sits]
    check(set(singles) == {1},
          f"step {i + 1} ({st['key']}) has exactly one correct answer in each audience",
          f"step {i + 1} ({st['key']}) has {singles} correct answers — the pre-test is MCQ only, and a "
          f"one-answer card would grade a correct answer wrong")
    # AND `produces` says what the authored titles say. A step marked drillable
    # whose question does not ask for a line is a card asking for a line nobody
    # named; a step marked judgement whose question DOES ask for one is a card
    # the lesson is needlessly missing.
    says = [(s["questions"][i]["title"] or "").rstrip().endswith("You say:") for s in sits]
    check(len(set(says)) == 1 and says[0] == st["produces"],
          f"step {i + 1} ({st['key']}) is marked {'produce-a-line' if st['produces'] else 'judgement'}, "
          f"and its authored titles agree",
          f"step {i + 1} ({st['key']}) is marked produces={st['produces']} but its titles say {says} — "
          f"the flag and the questions disagree about what the step asks for")

check(d["askable"] == [s["key"] for s in steps if s["produces"]],
      f"the drillable steps are exactly the produce-a-line ones ({len(d['askable'])})",
      "ASKABLE and the `produces` flags disagree")
check(len(d["askable"]) >= 6,
      f"{len(d['askable'])} steps are drillable — the competence asks for ≥6 of 7",
      f"only {len(d['askable'])} drillable steps; SIO-010's competence asks for ≥6/7 in each audience")

# ---- no invented French ----------------------------------------------------
authored = {v for s in sits for q in s["questions"] for v in q["options"]}
stray = sorted({o for c in cards for o in c["easyOptions"]} - authored)
check(not stray,
      f"every option a card offers is authored in unit0-questions.ts ({len(authored)} strings)",
      f"cards offer French that is authored nowhere: {stray[:4]}")
check(all(c["correct"] in c["easyOptions"] for c in cards),
      "every card's answer is among its own options",
      "a card's correct answer is missing from its options")
check(all(len(set(c["easyOptions"])) == len(c["easyOptions"]) for c in cards),
      "no card repeats an option",
      "a card offers the same option twice — a free elimination")
check(all(c["med"]["choices"] == c["easyOptions"] and c["med"]["correct"] == c["correct"] for c in cards),
      "the cloze tier offers the same authored four",
      "med and easyOptions have drifted apart")

# The answer must be the one the pre-test marks correct for THAT audience —
# a card that pairs the student's line with the client's prompt is the whole
# failure this stop exists to prevent, and it renders perfectly.
bywho = {s["label"]: s for s in sits}
bad = []
for c in cards:
    sit = bywho.get(c["meta"])
    if not sit:
        bad.append(f"meta {c['meta']!r} names no authored audience")
        continue
    hit = [q for q in sit["questions"] if (q["title"] or "").startswith(c["big"])]
    if not hit:
        bad.append(f"prompt {c['big']!r} is not a question of {c['meta']!r}")
    elif c["correct"] not in hit[0]["ok"]:
        bad.append(f"{c['meta']!r} + {c['big']!r} graded on {c['correct']!r}, not its own answer")
check(not bad, "every card pairs an audience with ITS OWN correct line",
      f"{len(bad)} mismatched card(s): {bad[:3]}")

# The prompt is English and says so; the « You say: » tail is gone.
check(all(c["bigLang"] == "en" for c in cards),
      "the English prompt is tagged as English",
      "a card's English prompt is not tagged bigLang='en' — 🔊 would read it with French phonics")
check(not any(c["big"].rstrip().endswith("You say:") for c in cards),
      "the authored « You say: » tail is trimmed from the card's prompt",
      "a card's prompt still ends « You say: » — the list it referred to is not on this card")

# The context line names the audience, and leaks no answer.
leaks = [c for c in cards if any(
    re.search(rf"(^|[\s'’]){re.escape(o)}([\s.,!?]|$)", c["meta"], re.I) for o in c["easyOptions"])]
check(not leaks, "the context line prints no answer",
      f"{len(leaks)} card(s) print an option in the line above the gap")

# ---- the axes are real -----------------------------------------------------
for value, seen in d["byAxis"]["audience"].items():
    sit = [s for s in sits if s["key"] == value][0]
    check(seen and all(x.split("||")[0] == sit["label"] for x in seen),
          f"pinning « {sit['who']} » stays with that audience ({len(seen)} cards)",
          f"pinning « {value} » produced another audience's card — the dropdown is a lie")
for value, seen in d["byAxis"]["step"].items():
    check(bool(seen), f"pinning the « {value} » step generates cards",
          f"pinning « {value} » generates NOTHING — a pin that empties the lesson")
check(len({x for v in d["byAxis"]["step"].values() for x in v}) > len(d["byAxis"]["step"]),
      "the step axis narrows without freezing — each step still varies by audience",
      "pinning a step yields one card; the audience axis has stopped mattering")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
