#!/usr/bin/env python3
"""
Possessives — the full paradigm (SIO-022).

WHY THIS EXISTS. SIO-022's competence line has always asked the learner to
"select the correct possessive (mon/ma/mes … son/sa/ses, + notre/votre/leur)
by the noun's gender/number". The deck never asked for more than the 1st
person, and Complete It made it worse: for a `col:`-tagged noun it PRINTED
the possessive in the prompt ("mon book") and the learner copied it across
into "mon livre". Nothing was selected. A learner could score 100% without
ever demonstrating the competence the SIO claims to measure.

The gap was reported on 23 Aug as deck-vs-book ("Atelier's table extends to
ton/son/votre"). It was deck-vs-SIO, which is worse, because the objective
was making a promise the drill did not keep. Dan ruled GO on 24 Aug with all
six persons, and Complete It grew a ×6 expansion over the deck's 21 nouns.

REWRITTEN 2026-08-31 — WHAT MOVED, AND WHAT IS GONE.

Complete It's route was deleted (Dan: "iComplete is to be deleted, or at
least converted to Intermediaire and Difficile within Memo"). So this file no
longer reads a drill. It reads the two places SIO-022's possessives now live:

  · the DECK — its Letris columns are still the agreement declaration, its 21
    nouns still carry a class, its 10 sentence items still stand apart;
  · the LESSON — `content/lessons/native/possessifs.tsx`, which the Memo
    ladder teaches, and which carries the whole paradigm as a table: six
    persons, the three agreement columns, nos/vos/leurs in the plural, and the
    elision rule (« mon ordinateur », a feminine noun taking the masculine
    form before a vowel).

  These are not a weaker home for the French. They are a BETTER one: the
  lesson's table is what a learner reads, where the drill's constant was
  something they only ever met one cell of at a time.

WHAT IS HONESTLY LOST, and reported to Dan rather than papered over here: the
×6 PRODUCTION drill — type the agreeing form for each of the deck's 21 nouns
across all six persons, 126 questions of it — has no home. The lesson teaches
the paradigm and the Memo ladder completes sentences from it, but neither asks
for the deck's own nouns across the persons, which is the exercise Dan ruled GO
on 24 Aug. It went dark a week before this deletion (#97 retired the activity,
#99 removed its door), so cutting the route made an existing orphan visible
rather than creating one. Re-homing it is a curriculum call, not a refactor.

What this asserts:

  1  The paradigm is complete and is correct French — six persons, the three
     agreement columns, nos/vos/leurs in the plural — in the lesson that
     teaches it.
  2  The deck's agreement declaration survives: its Letris columns are still
     exactly mon/ma/mes, which is what any future expansion would read.
  3  The Letris board is untouched: three columns, MON/MA/MES, prefixes.
  4  The elision rule is present (ma -> mon before a vowel).
  5  The census the drill was built on: 21 classed nouns + 10 sentence items.

Run from the repo root:  python3 verify/verify35-possessives.py
"""
import json
import os
import re
import sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# The paradigm's home since 31 Aug: the lesson the Memo ladder teaches. The
# drill this file used to read is deleted — see the header.
LESSON = "src/content/lessons/native/possessifs.tsx"
src = read(LESSON)
check(bool(src), "the possessives lesson exists",
      f"{LESSON} missing — SIO-022 would have no surface teaching the paradigm at all")
check(not os.path.isdir("src/app/practice/complete-it"),
      "the Complete It route is gone, as Dan asked",
      "the Complete It route is back — this file was rewritten on the premise that it went")

deck_path = "src/content/collections/possessives.json"
deck = json.loads(read(deck_path)) if os.path.isfile(deck_path) else {}
check(bool(deck), "the possessives deck exists", f"{deck_path} missing")

# 1 · the paradigm table, and its French
check("OWNERS" in src and "ROWS" in src and "ALL_POSS" in src,
      "the possessive paradigm table is present in the lesson",
      "OWNERS / ROWS / ALL_POSS are missing — the lesson no longer carries the paradigm")
# All six persons, by the English the learner reads. The lesson splits his/her
# and their (m./f.) across eight OWNERS rows; the Mémo table folds them to six.
for person, label in (("je", "my"), ("tu", "your (tu)"), ("il", "his"),
                      ("nous", "our"), ("vous", "your (vous)"), ("ils", "their")):
    check(re.search(rf'"{re.escape(label)}[^"]*"', src) is not None,
          f"the {person} person is in the paradigm (« {label} »)",
          f"the {person} person left the paradigm — SIO-022 asks for all six")
# The forms themselves. Getting one of these wrong teaches bad French, so
# they are asserted literally rather than counted.
for form in ("mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
             "notre", "nos", "votre", "vos", "leur", "leurs"):
    check(re.search(rf'"{form}"', src) is not None,
          f"« {form} » is in the table",
          f"« {form} » is missing from the paradigm table")
# The plurals, on the OWNERS rows that generate the exercise — nos/vos/leurs,
# never notre/votre/leur, before a plural noun. Asserted on the generator's own
# rows rather than the printed table: the table is read, the rows are DRILLED,
# and it is the drilled form a learner will repeat.
check(re.search(r'en: "our",[^}]*pl: "nos"', src) is not None,
      "« nos » is the plural of notre in the generator",
      "a plural possessive is wrong — « nos » is required before a plural noun")
check(re.search(r'en: "your \(vous\)",[^}]*pl: "vos"', src) is not None,
      "« vos » is the plural of votre in the generator",
      "a plural possessive is wrong — « vos » is required before a plural noun")
check(len(re.findall(r'pl: "leurs"', src)) == 2,
      "« leurs » is the plural of leur, on both their-rows",
      "a plural possessive is wrong — « leurs » is required before a plural noun")

# 2 · the expansion is switched ON for this deck (the tripwire)
cols = (deck.get("gameConfig", {}).get("letris", {}) or {}).get("columns", [])
keys = [c.get("key") for c in cols]
check(sorted(keys) == ["ma", "mes", "mon"],
      "the deck still declares mon/ma/mes columns — the expansion is switched on",
      f"the Letris column keys are {keys}, so isPossessiveDeck() is now FALSE "
      "and the drill has silently reverted to the giveaway prompt")
# The opt-in itself (isPossessiveDeck / POSS_COL_AGREEMENT) went with the
# drill. The DECLARATION above is what matters and is asserted: a rename of
# those columns is what would break any future re-home of the ×6 drill, and it
# would break the Letris board today regardless.

# 3 · THE GIVEAWAY CHECKS ARE RETIRED WITH THEIR PROMPT (31 Aug).
#
# Five checks here asserted that Complete It's prompt did not print the answer
# — no « le » in grey above a box asking for « le », no French possessive above
# a box asking for the French possessive, and the (m)/(f) gloss stripped from
# the cue. They were the sharpest checks in this file and they are gone because
# the prompt is gone, not because the rule relaxed.
#
# The rule itself is alive elsewhere: verify56 holds it for Sorting's answers
# and verify40 for all four pre-test surfaces. If the ×6 drill is ever re-homed
# (see the header), these five come back with it — that is the whole reason
# they are described here rather than deleted.

# 4 · the Letris board is untouched
check(len(cols) == 3,
      "the Letris board still has exactly three columns",
      f"the Letris board has {len(cols)} columns — it was supposed to be untouched")
labels = sorted((c.get("label") or "") for c in cols)
check(labels == ["MA", "MES", "MON"],
      "the Letris labels are still MON / MA / MES",
      f"the Letris labels changed to {labels} — the board was to be left alone")
check(all(c.get("prefix") for c in cols),
      "every Letris column keeps its prefix (no per-item prefix was introduced)",
      "a Letris column lost its prefix — the seven prefix consumers are at risk")

# 5 · ONE expansion path — retired with buildEntries(), which served the drill's
# first run and its restart() from one place so the two could not drift. There
# is no run to build any more.

# 6 · elision — ma/ta/sa become mon/ton/son before a vowel. The lesson both
# STATES it (a « fém. + voyelle » column in the Mémo table) and APPLIES it (its
# possessive() picks the masculine form for a vowel-initial feminine noun), so
# both halves are asserted: a table that says it while the generator ignores it
# would teach « ma agrafeuse » in the very exercise that just taught otherwise.
check("fém. + voyelle" in src,
      "the Mémo table has the « fém. + voyelle » column",
      "the elision column is gone from the table — the learner is never told the rule")
check(re.search(r"n\.g === \"m\" \|\| n\.vowel", src) is not None,
      "the generator applies the elision rule",
      "the generator no longer takes the masculine form before a vowel; a "
      "vowel-initial feminine noun would be drilled as « ma école »")

# 7 · the census
items = deck.get("items", [])
nouns = [i for i in items if any(str(t).startswith("col:") for t in (i.get("tags") or []))]
sentences = [i for i in items if not any(str(t).startswith("col:") for t in (i.get("tags") or []))]
expected = len(nouns) * 6 + len(sentences)
check(len(nouns) == 21,
      f"{len(nouns)} nouns carry an agreement class",
      f"{len(nouns)} nouns carry a col: tag (expected 21)")
check(len(sentences) == 10,
      f"{len(sentences)} full-sentence items stay 1:1 (they never showed the answer)",
      f"{len(sentences)} untagged items (expected 10)")
# The 136 is kept as the CENSUS OF THE MATERIAL, not of a run: 21 classed nouns
# across six persons plus 10 sentence items is the size of the exercise that has
# no home today, and the number Dan needs when he decides whether to re-home it.
check(expected == 136,
      f"the material is {len(nouns)}x6 + {len(sentences)} = {expected} questions "
      "(no surface asks for them today — see the header)",
      f"the census came to {expected}, not 136")

print("\npossessives check (SIO-022 — the full paradigm)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
