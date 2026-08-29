#!/usr/bin/env python3
"""
Possessives — the full paradigm in Complete It (2026-08-24).

WHY THIS EXISTS. SIO-022's competence line has always asked the learner to
"select the correct possessive (mon/ma/mes … son/sa/ses, + notre/votre/leur)
by the noun's gender/number". The deck never asked for more than the 1st
person, and Complete It made it worse: for a `col:`-tagged noun it PRINTED
the possessive in the prompt ("mon book") and the learner copied it across
into "mon livre". Nothing was selected. A learner could score 100% without
ever demonstrating the competence the SIO claims to measure.

The gap was reported on 23 Aug as deck-vs-book ("Atelier's table extends to
ton/son/votre"). It was deck-vs-SIO, which is worse, because the objective
was making a promise the drill did not keep.

Dan ruled GO on 24 Aug with all six persons. The fix follows the shape the
repo already ships for nationalities: one item expands into several
sub-questions, the prompt gives the CUE, the learner produces the agreeing
form. Two deliberate differences from `nat`:

  - the forms are DERIVED, not stored. Nationality adjectives are irregular
    so `item.nat` holds them; possessives are regular, and the noun's
    agreement class is already declared by its `col:mon|ma|mes` Letris tag.
  - the opt-in is that same existing declaration, not a new schema field —
    which is why check 2 below matters. A Letris column rename would
    silently switch the expansion off and restore the giveaway, so this
    file is the tripwire.

REJECTED ROUTE, recorded so it is not re-proposed: re-gearing the Letris
columns to masculine/feminine/plural and letting items span the persons.
`prefix` lives on the column and never on the item (seven consumers build
their phrase from `column.prefix + item.fr`), so the person would have had
to move into `item.fr` — putting "ton stylo" on the tile, i.e. the answer
on the face of the question. The Letris board is untouched instead.

What this asserts:

  1  The paradigm table is complete and is correct French — six persons,
     three agreement classes, nos/vos/leurs in the plural.
  2  The expansion is SWITCHED ON for the possessives deck: its Letris
     columns are still exactly mon/ma/mes.
  3  The giveaway is gone — no prompt path prints the possessive before the
     learner has produced it.
  4  The Letris board is untouched: three columns, MON/MA/MES, prefixes.
  5  One expansion code path (the initial build and `restart` share it), so
     the run and the replay can never drill different things.
  6  The elision rule is present (ma -> mon before a vowel).
  7  The question census: 21 nouns x 6 persons + 10 sentence items = 136.

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

DRILL = "src/app/practice/complete-it/[collectionId]/CompleteItContent.tsx"
src = read(DRILL)
check(bool(src), "the Complete It drill exists", f"{DRILL} missing")

deck_path = "src/content/collections/possessives.json"
deck = json.loads(read(deck_path)) if os.path.isfile(deck_path) else {}
check(bool(deck), "the possessives deck exists", f"{deck_path} missing")

# 1 · the paradigm table, and its French
check("POSS_PERSONS" in src and "POSS_FORM" in src and "POSS_CUE" in src,
      "the possessive paradigm table is present",
      "POSS_PERSONS / POSS_FORM / POSS_CUE are missing — the expansion is gone")
for person in ("je", "tu", "il", "nous", "vous", "ils"):
    check(re.search(rf"\b{person}\s*:", src) is not None,
          f"the {person} person is in the paradigm",
          f"the {person} person left the paradigm — SIO-022 asks for all six")
# The forms themselves. Getting one of these wrong teaches bad French, so
# they are asserted literally rather than counted.
for form in ("mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
             "notre", "nos", "votre", "vos", "leur", "leurs"):
    check(re.search(rf'"{form}"', src) is not None,
          f"« {form} » is in the table",
          f"« {form} » is missing from the paradigm table")
check('p: "leurs"' in src and 'p: "nos"' in src and 'p: "vos"' in src,
      "the plurals agree: nos / vos / leurs (not notre / votre / leur)",
      "a plural possessive is wrong — nos/vos/leurs are required before a plural noun")

# 2 · the expansion is switched ON for this deck (the tripwire)
cols = (deck.get("gameConfig", {}).get("letris", {}) or {}).get("columns", [])
keys = [c.get("key") for c in cols]
check(sorted(keys) == ["ma", "mes", "mon"],
      "the deck still declares mon/ma/mes columns — the expansion is switched on",
      f"the Letris column keys are {keys}, so isPossessiveDeck() is now FALSE "
      "and the drill has silently reverted to the giveaway prompt")
check("isPossessiveDeck" in src and "POSS_COL_AGREEMENT" in src,
      "the opt-in reads the deck's own column declaration",
      "isPossessiveDeck / POSS_COL_AGREEMENT are gone — nothing turns the expansion on")

# 3 · the giveaway is gone
check(re.search(r"const art = \(!inflected && item\)", src) is not None,
      "the article is blank on an inflected question — the possessive is not printed",
      "the prompt can print the possessive again (`art` is no longer gated on "
      "`inflected`) — this is the exact 'mon book -> mon livre' giveaway")
check("possPerson ?" in src and "POSS_CUE[possPerson]" in src,
      "the possessive prompt shows the ENGLISH cue, not the French form",
      "the possessive prompt branch is missing")

# 3b · generalised 2026-08-25 (Dan): the SAME giveaway existed on every
# ordinary article deck — the prompt printed « le » in grey and then required
# it in the typed answer, so the learner copied the one thing being asked.
# The possessive fix above only ever blanked it for inflected questions. The
# plain branch must now print NO article either; `art` survives for the
# answer, the alternates and the help ladder, whose first rung reports
# masculine/feminine on demand.
# `art` is a VALUE (answer, alternates, ladder) and must never again be a
# rendered node. Asserting on the whole file, not a slice: an earlier version
# of this check sliced from the last ") : (" and silently landed on the
# feedback block, so it passed with the giveaway fully restored. Whole-file is
# both stricter and un-fool-able here, because `{art &&` has exactly one
# meaning in JSX — render it.
check("{art &&" not in src,
      "the prompt no longer renders the article — gender is the question, not the cue",
      "`{art &&` is back in the prompt: the learner is shown « le » and then asked "
      "to type it back, which tests spelling only")
check("article: art" in src,
      "`art` still feeds the help ladder (gender available behind the ? button)",
      "`art` no longer reaches hintsFor — removing the print also removed the "
      "on-demand gender hint, which is a net loss for the learner")
# The (m)/(f)/(pl) gloss is the answer to the question being asked.
poss_branch = src[src.find("possPerson ? ("):src.find("POSS_CUE[possPerson]") + 400] if "possPerson ? (" in src else ""
check("bareWord(item.en)" in poss_branch,
      "the gender gloss is stripped from the cue — the learner must know it",
      "the possessive prompt shows the raw `en`, whose '(m)'/'(f)' marker gives "
      "the agreement away")

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

# 5 · one expansion path
check("function buildEntries" in src,
      "one buildEntries() serves both the first run and restart()",
      "buildEntries() is gone — the run and the replay can drill different things")
check(src.count("POSS_PERSONS.forEach") == 1 and src.count("NAT_FORMS.forEach") == 1,
      "the expansion is written once, not duplicated into restart()",
      "the expansion logic is duplicated — the two copies will drift")

# 6 · elision
check("POSS_ELIDES" in src,
      "the elision rule is present — ma/ta/sa become mon/ton/son before a vowel",
      "the elision rule is gone; a vowel-initial feminine noun would be taught "
      "as « ma école »")

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
check(expected == 136,
      f"the run is {len(nouns)}x6 + {len(sentences)} = {expected} questions (was 31)",
      f"the census came to {expected}, not 136")

print("\npossessives check (SIO-022 — the full paradigm)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
