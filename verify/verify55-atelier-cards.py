#!/usr/bin/env python3
"""
An atelier's dialogue is not automatically a deck of cards.

Dan, 2026-08-31, on the six atelier phrase sets: "yes pls fix". Three faults,
found by reading the lines a learner would actually be dealt:

  · SIO-010 dealt « Bonjour ! » TWICE in a row — the dialogue is right (two
    people greet each other) but the flashcard deck is not, and a duplicate
    card is a free point that teaches nothing.
  · SIO-030 ended on a card reading « Léa » / "Léa" — the sender's signature.
    Correct in an e-mail, and as a card it asks the learner to recall nothing.
  · SIO-049 reviewed a restaurant without naming a single thing eaten.

The first two are fixed on the DECK, in atelierDecks.ts, so the dialogue keeps
its shape and Les formes still renders « Le modèle » complete, turn by turn.
The third is content, in ateliers.ts.

WHAT THIS ASSERTS, and why each rule is here rather than left to care:

  1  no card is dealt twice in one deck
  2  no card has identical French and English — that is a proper name, not
     language to learn
  3  ids stay tied to the DIALOGUE's index, not the card's. Ids are SRS keys
     and stored-response keys, so renumbering after a filter would silently
     detach every learner's history for these decks. This is the rule most
     likely to be broken by someone tidying the filter later, and the only
     one whose breakage is invisible in the UI.
  4  every atelier still deals at least four cards — a filter that empties a
     deck has stopped being a filter

Run from the repo root:  python3 verify/verify55-atelier-cards.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)
def read(rel): return open(os.path.join(ROOT, rel), encoding="utf-8").read()

def nocomment(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)

DIA = nocomment(read("src/content/ateliers.ts"))
DECK = nocomment(read("src/content/collections/atelierDecks.ts"))

# ── the dialogues, parsed by brace matching rather than a greedy regex ──────
sets = {}
for m in re.finditer(r'"(SIO-\d+)":\s*\[', DIA):
    sid, i, depth, j = m.group(1), m.end(), 1, m.end()
    while depth and j < len(DIA):
        if DIA[j] == "[": depth += 1
        elif DIA[j] == "]": depth -= 1
        j += 1
    sets[sid] = re.findall(
        r'fr:\s*"((?:[^"\\]|\\.)*)"\s*,\s*en:\s*"((?:[^"\\]|\\.)*)"', DIA[i:j])

ok(len(sets) >= 6, f"{len(sets)} atelier dialogues parsed",
   f"only {len(sets)} dialogues parsed — the scan has stopped seeing them, "
   f"which would make every rule below vacuously true")

# ── the deck's own filter, applied here the same way ───────────────────────
def cards(lines):
    out, seen = [], set()
    for fr, en in lines:
        if fr.strip() == en.strip(): continue
        if fr in seen: continue
        seen.add(fr); out.append(fr)
    return out

for sid, lines in sorted(sets.items()):
    c = cards(lines)
    # 1 · no duplicate
    ok(len(c) == len(set(c)), f"{sid}: no card is dealt twice",
       f"{sid} deals the same card twice — a duplicate is a free point")
    # 2 · nothing that is only a name
    names = [fr for fr, en in lines if fr.strip() == en.strip()]
    ok(all(n not in c for n in names),
       f"{sid}: name-only lines stay in the dialogue, out of the deck" if names
       else f"{sid}: no name-only lines",
       f"{sid} deals {names} as a card — identical French and English is a "
       f"proper name, and recalling it teaches nothing")
    # 4 · still a deck
    ok(len(c) >= 4, f"{sid}: {len(c)} cards",
       f"{sid} deals only {len(c)} cards — the filter has emptied the deck")

# ── 2b · THE DECK MUST ACTUALLY APPLY THESE RULES ──────────────────────────
# Everything above derives the cards by re-implementing the filter in Python,
# which tests the reimplementation and not the code: with only those rules,
# deleting the dedupe from atelierDecks.ts left this script green. (Found by
# break-testing it, which is the whole reason for the standing rule.) So the
# source must be asserted too — the derived rules say what the cards should
# be, these two say the deck is the thing that makes them so.
ok(re.search(r"findIndex\(\(o\)\s*=>\s*o\.fr\s*===\s*it\.fr\)\s*===\s*i", DECK) is not None,
   "the deck drops a line whose French was already dealt",
   "atelierDecks no longer de-duplicates — SIO-010 will deal « Bonjour ! » "
   "twice again and nothing else here would notice")
ok(re.search(r"it\.fr\.trim\(\)\s*===\s*it\.en\.trim\(\)", DECK) is not None,
   "the deck drops a line whose French and English are identical",
   "atelierDecks no longer drops name-only lines — « Léa » / \"Léa\" returns "
   "as a card and nothing else here would notice")

# ── 3 · ids follow the DIALOGUE index ──────────────────────────────────────
# The map must run BEFORE the filter, so the id is computed from the line's
# own position. Filtering first and numbering after renumbers every card that
# follows a removed line.
mapped = DECK.find(".map((l, i) =>")
filtered = DECK.find(".filter((it, i, all)")
ok(mapped >= 0 and filtered > mapped,
   "ids are assigned before the filter, so they follow the dialogue's index",
   "atelierDecks filters before it numbers — every card after a removed line "
   "gets a new id, which silently detaches every learner's SRS history and "
   "stored responses for these decks")
ok('`${idBase}-${String(i + 1).padStart(2, "0")}`' in DECK,
   "the id shape is unchanged",
   "the atelier id shape has changed — stored history keys on it")

# ── the three faults Dan named, by name ────────────────────────────────────
ok(cards(sets.get("SIO-010", [])).count("Bonjour !") <= 1,
   "SIO-010 no longer deals « Bonjour ! » twice",
   "SIO-010 deals « Bonjour ! » twice again")
ok(not any(fr.strip() == "Léa" for fr in cards(sets.get("SIO-030", []))),
   "SIO-030 no longer deals the signature as a card",
   "SIO-030 deals « Léa » as a card again")
FOOD = re.compile(r"poisson|frites|viande|poulet|salade|soupe|p[âa]tes|riz|"
                  r"croissant|pain|fromage|pomme", re.I)
ok(any(FOOD.search(fr) for fr in cards(sets.get("SIO-049", []))),
   "SIO-049 names something eaten",
   "SIO-049 reviews a restaurant without naming a single dish — the one thing "
   "a review is for")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
