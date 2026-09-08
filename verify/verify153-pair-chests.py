#!/usr/bin/env python3
"""verify153 — a deck's matching pairs are playable, in both homes Dan chose.

Dan, 8 Sep, on what to do with « Match It »: *"i accept 1, 2, and 3"* — and
option 2 was *"Into LexicaLater — its neighbour in Games stitches word parts
back together; this stitches phrase parts. One mechanic, two names."*

It is one mechanic. LexicaLater deals a chest whose lock is a row of keyholes
and you forge the French from keys on a belt. A matching pair is that with two
keyholes and phrases for keys:

    chest   « You turn to the left »
    lock    [ Vous tournez ][ à gauche ]
    belt    à droite · Vous prenez · tout droit · Vous traversez · …

TWO KINDS OF FAULT LIVE HERE, and they need different checks.

THE CONTENT can rot silently. A pair names two item ids; rename an item, drop
one, or mistag a left as a right, and the pair does not error — the chest is
just quietly not dealt, and a deck that offers ten sentences plays nine. So
every pair is resolved against the deck's own items here, exactly as
`pairChests` resolves it, and both halves must carry the role the pair uses
them for.

THE MECHANIC can be re-cut out from under itself. LexicaLater re-gears a chest
for the level: whole word at 1, hand-authored syllables at 2–3, random spelling
chunks at 4+. A phrase chest is not a word broken up — it is two pieces that
make a sentence, and its two keyholes ARE the exercise. Re-cut at level 1 it
hands over the whole answer as one key; at level 4 it shatters across the
joint. `fixed` is what stops that, and it is one early return that a later edit
could drop without anything looking wrong.

The belt has the same trap from the other side: the level-1 bait is other whole
ANSWERS of the deck, which on a phrase deck means baiting a two-hole lock with
whole sentences — not a temptation, a give-away, since the wrong keys are the
only ones too long to fit.

AND THE SAME PAIRS ARE A GAP-FILL — option 1 of Dan's three: *"Into ComposeIt
or GramMarathon — the content is already a sentence in two halves, which is
what a gap-fill is. « Vous tournez ___ » with the eight completions as options
is the same exercise with a home, an existing tile and spacing that already
works."* `pairGapItems` projects each join into an item with a `gap`, so the
deck reaches GramMarathon with no new content and nothing to keep in step.

TWO PROPERTIES OF THAT PROJECTION ARE LOAD-BEARING and neither is obvious.

The sentence must END IN A FULL STOP. `gapSentence` decides which of `fr` and
`example` holds the gap, and its test for "a sentence rather than a grid label"
is final punctuation — gapSentence.ts is the record of what a missing one cost:
transport dealt « ? train » instead of « J'y vais ? moto » on twelve cards.

The gap must be the RIGHT half. « Vous tournez ___ » is the exercise the deck
is for; « ___ à droite » would be asking which verb takes a completion, which
is not a thing this deck teaches.

AND THERE IS ONE POOL. gapSentence.ts exists because five call sites answered
"which items does this deck play?" separately and three decks turned out to be
silently unplayable — the readiness gate said yes, the game found nothing. A
DERIVED question set would reopen that immediately, so the gate, the tab and
the game all read `gappedItems` and nothing filters its own copy.

Break-tested five ways: dropping the `fixed` early return from gearEntry;
pointing a pair at an id the deck does not have; taking the role tag off a
left; gapping the left half instead of the right; and dropping the full stop.
Each names its own failure.

Run from the repo root:  python3 verify/verify153-pair-chests.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(rel):
    return open(os.path.join(ROOT, rel), encoding="utf-8").read()


def code(rel):
    """The file with its comments stripped.

    The first version of the two "nothing filters its own copy" checks grepped
    the raw source and failed a correct file, because the comment that EXPLAINS
    why the filter was removed names it. Same trap verify152 hit an hour
    earlier with `.cahier-page`."""
    src = re.sub(r"/\*.*?\*/", "", read(rel), flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


# ── the content ─────────────────────────────────────────────────────────────
COLL = os.path.join(ROOT, "src/content/collections")
decks_with_pairs = []
for name in sorted(os.listdir(COLL)):
    if not name.endswith(".json"):
        continue
    d = json.load(open(os.path.join(COLL, name), encoding="utf-8"))
    pairs = ((d.get("gameConfig") or {}).get("matching") or {}).get("pairs") or []
    if not pairs:
        continue
    decks_with_pairs.append(d["id"])
    items = {it["id"]: it for it in d.get("items", [])}
    missing, mistagged = [], []
    for p in pairs:
        for side, key in (("left", "leftId"), ("right", "rightId")):
            it = items.get(p.get(key))
            if it is None:
                missing.append(f"{p.get(key)} ({side})")
            elif f"role:{side}" not in (it.get("tags") or []):
                mistagged.append(f"{p.get(key)} is used as the {side} but is not tagged role:{side}")
    check(not missing,
          f"{d['id']}: all {len(pairs)} pairs resolve to items in the deck",
          f"{d['id']}: {len(missing)} pair id(s) name no item in the deck — {', '.join(missing[:4])}. "
          "A pair that does not resolve is not an error at runtime, it is a chest that is "
          "silently never dealt, so the deck quietly offers fewer sentences than it says")
    check(not mistagged,
          f"{d['id']}: every paired item carries the role the pair uses it for",
          f"{d['id']}: {'; '.join(mistagged[:3])}. The roles are what put a half on the belt, "
          "so a mistagged item is a key the learner can never be offered")
    # A left with no right (or the reverse) is an item that can never be played.
    used = {p["leftId"] for p in pairs} | {p["rightId"] for p in pairs}
    orphans = [i["id"] for i in d.get("items", [])
               if any(t.startswith("role:") for t in (i.get("tags") or [])) and i["id"] not in used]
    check(not orphans,
          f"{d['id']}: no role-tagged item is left out of every pair",
          f"{d['id']}: {len(orphans)} role-tagged item(s) appear in no pair — {', '.join(orphans[:4])}. "
          "They are dealt as belt keys that are wrong for EVERY chest, which is a decoy "
          "the exercise never explains")

check(len(decks_with_pairs) > 0,
      f"{len(decks_with_pairs)} deck(s) author matching pairs: {', '.join(decks_with_pairs)}",
      "no deck authors matching pairs any more — the phrase chests have no content to deal")

# ── the mechanic ────────────────────────────────────────────────────────────
lex = read("src/games/lexicalator/Lexicalator.tsx")
page = read("src/app/games/lexicalater/[deckId]/page.tsx")

check(re.search(r"if \(e\.fixed\) return e;", lex) is not None,
      "gearEntry leaves a fixed chest exactly as authored",
      "gearEntry no longer honours `fixed`. A phrase chest is re-cut with every other "
      "chest: at level 1 its two keyholes collapse into one and the whole sentence is "
      "handed over as a single key; at level 4 it is chopped into spelling chunks that "
      "cross the joint between the halves")
check("fixed?: boolean" in lex,
      "LexEntry still carries `fixed`",
      "LexEntry has lost `fixed`, so nothing can mark a chest whose joints are the exercise")
check(re.search(r"const fixedLane = chests\.some\(\(c\) => c\.entry\.fixed\)", lex) is not None
      and re.search(r"level <= 1 && !fixedLane", lex) is not None,
      "the belt's level-1 bait steps aside for a lane of phrase chests",
      "the belt baits a phrase lane with whole ANSWERS again. Against a two-hole lock a "
      "whole sentence is not a temptation, it is a give-away — the wrong keys are the "
      "only ones too long to fit")
check(re.search(r"entries=\{phrases\.length \? phrases : entries\}", page) is not None,
      "a deck with pairs deals its phrases, not its halves as chests too",
      "the LexicaLater deck page no longer prefers phrase chests. Dealt alongside the "
      "word chests, a bare half arrives as a one-keyhole chest of its own next to the "
      "sentence it belongs in, and the belt carries whole sentences beside the halves "
      "they are made of")
check("pairDecoys(collection)" in page,
      "the belt is fed the deck's own other halves as decoys",
      "the phrase lane has lost its decoys — every key on the belt would then be a key "
      "the lane needs, and there is no choice left to make")

# ── the gap-fill projection ─────────────────────────────────────────────────
pc = read("src/lib/collections/pairChests.ts")
gmr = read("src/lib/collections/gramMarathonReady.ts")
gmc = code("src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx")
shell = code("src/components/CahierShell.tsx")

check(re.search(r"gap: ch\.syllables\[1\]", pc) is not None,
      "the blank is the COMPLETION — « Vous tournez ___ »",
      "the gap-fill blanks the wrong half. « ___ à droite » asks which verb takes a "
      "completion, which is not what this deck teaches; the deck is for which completion "
      "a verb phrase takes")
check(re.search(r'fr: `\$\{ch\.fr\}\.`', pc) is not None,
      "each projected sentence ends in a full stop, so gapSentence reads it as a sentence",
      "the projected sentences have lost their final punctuation. `gapSentence` uses it to "
      "tell a sentence from a grid label — without it the item falls to the `example` "
      "branch, and gapSentence.ts records what that cost transport: twelve cards dealt "
      "« ? train » instead of « J'y vais ? moto »")
check("pairGapItems(c)" in gmr,
      "gappedItems includes the pairs' gap-fill projection",
      "gappedItems no longer includes the projected pairs, so a pairs deck offers "
      "GramMarathon nothing and the tab either vanishes or opens an empty marathon")
check("isPlayableGap" not in gmc and "gappedItems" in gmc,
      "GramMarathon plays gappedItems — it does not filter its own copy",
      "GramMarathonContent filters `deck.items` for itself again. That is the exact split "
      "gapSentence.ts was written to close: the readiness gate and the game answered "
      "'which items play?' differently and three decks were silently unplayable")
check("isPlayableGap" not in shell and "gappedItems" in shell,
      "the deck's GramMarathon tab appears on the same pool the game plays",
      "CahierShell decides the tab on its own filter again, so the tab and the game can "
      "disagree about whether a deck has questions")

for did in decks_with_pairs:
    d = json.load(open(os.path.join(COLL, f"{did}.json"), encoding="utf-8"))
    n = len(((d.get("gameConfig") or {}).get("matching") or {}).get("pairs") or [])
    check(n >= 4,
          f"{did}: {n} projected questions — enough for a marathon (MIN_GAPPED is 4)",
          f"{did} authors only {n} pair(s). GramMarathon needs four to offer itself, so "
          "the deck would carry a tab that opens a two-question 'marathon'")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
