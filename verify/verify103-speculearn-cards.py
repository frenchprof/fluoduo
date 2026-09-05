#!/usr/bin/env python3
"""
A SpecuLearn card has exactly one answer.

Dan, 5 Sep, reading commerces cards one after another:

  "this question does not have an answer — remove it — and remove all
   questions like that … or rather have the options show other shops instead"
  "this seemes to have two answers possible"        (« Je vous en mets combien ? »)
  "picture of 10 euros : it can be dix euros just as it can be prix"
  "monnaie cannot be itself lah, nouns need articles!"   "same for le prix"
  "2 kg of apples : has two possible pictures that go with it"

Five reports, one cause. The commerces deck holds three different things —
shop nouns (col:un / col:une / col:des), whole utterances a customer or a
trader says (col:client / col:marchand), and a bag of untagged words (euros,
monnaie, prix, voudrais, ceci, voilà). SpecuLearn drew its four options from
all of them at once, so 📚 was offered against « Ça fait 5,89 euros. » and
« euros », and 💶 answered to « euros », « prix » AND « Ça fait combien ? ».
The untagged bag was doubly wrong: with no column there is no article, so
those options appeared as bare « monnaie » and « prix ».

The runtime fix is `specuLearnColumns` — a deck may name the columns it
plays, and commerces plays only its shop nouns. This check holds the
invariant that fix restores, for every deck, so the next deck to grow a
second category fails the build instead of a learner's card:

  1. one deck, one kind — a playable set is all words or all utterances,
     never a mix (Dan's own transport rule of 24 Aug, generalised);
  2. no two playable items share a visual, or the picture direction offers
     the same button twice and marks one of them wrong;
  3. at least four playable items, or an MCQ cannot fill its options;
  4. a noun plays with its article — an item that is not a phrase and gets
     no article from its column is a bare noun on the card.

The playable set is recomputed here from the SAME three data sources the
runtime reads — the deck JSON, SPECULEARN_EXCLUDED_ITEMS, BUILDING_EMOJI —
so a check cannot pass by being edited to match a regression.

aliments is skipped: it runs on the photo bank, not on deck emoji.

Run from the repo root:  python3 verify/verify103-speculearn-cards.py
"""
import json, os, re, sys

READY_TS = "src/lib/collections/speculearnReady.ts"
DECK_DIR = "src/content/collections"
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

src = open(READY_TS, encoding="utf-8").read()

def block(name, opener, closer):
    m = re.search(re.escape(name) + r".*?" + re.escape(opener) + r"(.*?)" + re.escape(closer), src, re.S)
    if not m:
        print(f"  FAIL  {name} is no longer in {READY_TS} in a shape this check can read")
        sys.exit(1)
    return m.group(1)

READY = re.findall(r'"([a-z0-9\-]+)"', block("SPECULEARN_READY", "[", "] as const"))
BUILDING = set(x for x in re.findall(r'"([^"]+)"', block("BUILDING_EMOJI", "new Set([", "])")))
EXCLUDED = set(re.findall(r'"([a-z0-9\-]+)"', block("SPECULEARN_EXCLUDED_ITEMS", "new Set([", "\n])")))
COLUMNS = {}
for deck, cols in re.findall(r'(\w[\w\-]*):\s*\[([^\]]*)\]',
                             block("SPECULEARN_DECK_COLUMNS", "= {", "\n};")):
    COLUMNS[deck] = re.findall(r'"([^"]+)"', cols)

ok(len(READY) >= 5, f"{len(READY)} decks offer SpecuLearn", "SPECULEARN_READY came back empty — this check read nothing")

# The article a column lends, mirroring COL_ARTICLE in SpecuLearnContent.
COL_ARTICLE = {"col:le": "le ", "col:la": "la ", "col:l_apos": "l'", "col:les": "les ",
               "col:un": "un ", "col:une": "une ", "col:des": "des "}
HAS_ARTICLE = re.compile(r"^(le |la |les |l'|un |une |des |du |de la |de l')", re.I)
# A phrase, not a noun: an utterance, or a prepositional/verbal chunk like
# « en train ». Neither wants an article in front of it. A proper noun is
# exempt too — « Cuba » and « Singapour » take no article in French, and the
# countries deck is a deck of names, not of common nouns.
IS_PHRASE = re.compile(r"[.!?]\s*$|^(en |à |au |aux |de |chez )", re.I)
IS_PROPER = re.compile(r"^[A-ZÀ-Ý]")

def playable(deck_id):
    path = os.path.join(DECK_DIR, deck_id + ".json")
    if not os.path.exists(path):
        return None
    deck = json.load(open(path, encoding="utf-8"))
    cols = COLUMNS.get(deck_id)
    out = []
    for it in deck.get("items", []):
        if not it.get("fr") or it["id"] in EXCLUDED:
            continue
        emoji = it.get("emoji")
        if not emoji or emoji in BUILDING:
            continue
        tags = it.get("tags") or []
        if cols and not any(t in cols for t in tags):
            continue
        art = next((COL_ARTICLE[t] for t in tags if t in COL_ARTICLE), "")
        shown = it["fr"] if HAS_ARTICLE.match(it["fr"]) else art + it["fr"]
        out.append({"id": it["id"], "fr": it["fr"], "shown": shown, "emoji": emoji})
    return out

def kind(shown):
    """An utterance is something a person SAYS — it ends in a full stop, a
    question mark or an exclamation. Length is not the test: « les feux de
    circulation » is four words and still a noun a picture can name."""
    return "utterance" if re.search(r"[.!?]\s*$", shown) else "word"

for deck_id in READY:
    if deck_id == "aliments":
        continue
    items = playable(deck_id)
    if items is None:
        FAIL.append(f"{deck_id} is in SPECULEARN_READY but has no deck JSON")
        continue

    kinds = {kind(i["shown"]) for i in items}
    if len(kinds) > 1:
        w = next(i["shown"] for i in items if kind(i["shown"]) == "word")
        u = next(i["shown"] for i in items if kind(i["shown"]) == "utterance")
        mixed = (f"{deck_id} mixes words and utterances in one option pool — "
                 f"« {w} » against « {u} ». Name the columns it plays in "
                 f"SPECULEARN_DECK_COLUMNS.")
    else:
        mixed = ""
    ok(len(kinds) <= 1,
       f"{deck_id}: all {len(items)} playable items are one kind ({', '.join(kinds) or 'none'})",
       mixed)

    seen = {}
    twins = []
    for i in items:
        if i["emoji"] in seen:
            twins.append(f"{i['emoji']} = {seen[i['emoji']]} and {i['shown']}")
        seen[i["emoji"]] = i["shown"]
    ok(not twins,
       f"{deck_id}: every playable item has its own picture",
       f"{deck_id} gives one picture to two words, so the picture round shows the same "
       f"button twice: " + "; ".join(twins))

    ok(len(items) >= 4,
       f"{deck_id}: {len(items)} playable items, enough to fill four options",
       f"{deck_id} has only {len(items)} playable item(s) — an MCQ needs the answer and three others")

    bare = [i["shown"] for i in items
            if not IS_PHRASE.search(i["shown"])
            and not IS_PROPER.match(i["shown"])
            and not HAS_ARTICLE.match(i["shown"])]
    ok(not bare,
       f"{deck_id}: every noun plays with its article",
       f"{deck_id} shows bare nouns — Dan, 5 Sep: \"nouns need articles!\": " + ", ".join(bare[:6]))

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
