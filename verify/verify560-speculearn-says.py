#!/usr/bin/env python3
"""SpecuLearn reads the sentence when the deck wrote one — and its own article once.

Dan, 2026-09-13: *"SpecuLearn, I am still hearing TTS for individual parts words
WHEN I SHOULD BE HEARING FULL SENTENCES !"* — « still », because the 12 Sep pass
had recorded SpecuLearn as already correct.

WHY THAT PASS WAS HONESTLY WRONG. Dan's rule of 12 Sep was *"never TTS just
individual words when they can be TTS with another (e.g. a noun always with its
article, or an entire sentence if that is what we are dealing with)"*, and
SpecuLearn does say « le sport » and never « sport ». That is the first half.
The second half — the sentence — was never applied here, and `transport` is
twelve cards out of twelve of exactly that fault:

    said « en train »          example « J'y vais en train. »
    said « à pied »            example « J'y vais à pied. »
    said « prendre le métro »  example « Je prends le métro. »

The sentence was in the deck the whole time, unread.

TWO THINGS THIS CHECK EXISTS TO STOP, BOTH FOUND BY MEASURING THE FIX RATHER
THAN THE CODE, and each worse than the bug it was fixing:

  1  `colors` MUST KEEP ITS WORD. Its examples are things that ARE the colour —
     « le feu rouge », « le lait blanc ». A learner shown a red swatch must say
     « rouge »; reading « le feu rouge » at them teaches a different word. The
     first draft took every `example` and broke all twelve.
  2  `lieux-letris` WAS PRINTING « le au café ». `withArticle` pasted the
     column's article in front of French that already carried a contracted one
     (au = à + le), on all 23 items, on the card as the answer — not merely
     spoken.

WHAT IS PINNED

  1  ONE definition of what an item says, and SpecuLearnContent uses it at
     EVERY speak() call. Seven call sites — the say-it prompt, the reveal, the
     🔊 key and four replay buttons — and a fix applied to six is this bug.
  2  The three sentence decks speak sentences.
  3  `colors` speaks none, and neither does any item whose example is a noun
     phrase: the test is terminal punctuation, not a deck name.
  4  No item speaks a doubled article.

Numbered 560 and not 550: the frontier is 540 and a number next to it gets
claimed again while CI runs (AGENTS.md, 7 Sep).

Run from the repo root:  python3 verify/verify560-speculearn-says.py
"""
import json
import os
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

WORDS = "src/lib/speculearn/deckWords.ts"
CONTENT = "src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx"
src, ui = read(WORDS), read(CONTENT)

ok(bool(src) and bool(ui), "SpecuLearn's word list and its runner exist",
   f"{WORDS} or {CONTENT} is missing")

# ── 1 · one definition, used at every speak() ───────────────────────────────
ok("export function spokenFor" in src,
   "`spokenFor` is defined once, beside the word list",
   "`spokenFor` is gone — the runner is back to reading a field directly, and "
   "the next surface that speaks will pick its own")
bare = re.findall(r"speak\(\s*(?!spokenFor)([A-Za-z_$][\w.$]*\.w)\b", ui)
ok(not bare,
   "every speak() in SpecuLearn goes through `spokenFor`",
   f"{len(bare)} speak() call(s) read the bare word instead of `spokenFor`: "
   f"{sorted(set(bare))}. There are seven of them on this screen — the say-it "
   "prompt, the reveal, the 🔊 key and four replay buttons — and one left "
   "behind is a card that still speaks a fragment.")

# ── 2-4 · the data, put through the same policy the module applies ──────────
READY = ["aliments", "consignes", "countries-letris", "languages", "lieux-letris",
         "commerces", "colors", "transport", "objets-articles"]
# THE POLICY IS READ OUT OF THE MODULE, NOT RE-TYPED HERE, and the first
# version of this check got that wrong in a way worth recording. It carried its
# own Python copy of the two rules — the self-article regex and the
# sentence test — so it measured the DECKS against a policy it had invented.
# Break-tested: reverting `withArticle` to the code that printed « le au café »,
# and dropping the sentence test so `colors` read « le feu rouge » again,
# BOTH LEFT IT GREEN. A check with its own copy of the thing it is checking
# tests the copy.
def _code(t):
    """Source with comments stripped. The other half of the same fault: clause
    5 below looked for « au » in the file and found it in the PROSE explaining
    why « au » matters, so a deleted guard passed on its own documentation."""
    t = re.sub(r"/\*[\s\S]*?\*/", "", t)
    return re.sub(r"^\s*//.*$", "", t, flags=re.M)

code = _code(src)
_col = re.search(r"COL_ARTICLE[^=]*=\s*\{(.*?)\}", code, re.S)
COL = dict(re.findall(r'"(col:[a-z_]+)":\s*"([^"]*)"', _col.group(1) if _col else ""))
_has = re.search(r"HAS_ARTICLE\s*=\s*/\^\((.*?)\)/i", code)
_sent = re.search(r"function isSentence[\s\S]*?/(\[[^/]*\])\$/", code)
_gated = re.search(r"say:\s*isSentence\(", code) is not None

ok(bool(COL) and bool(_has) and bool(_sent),
   "the check reads SpecuLearn's own article list, opening list and sentence test",
   "one of the three could not be read out of deckWords.ts — COL_ARTICLE, "
   "HAS_ARTICLE or isSentence has been renamed or reshaped. Re-point the "
   "extraction rather than re-typing the rule here: a copy tests the copy.")
ok(_gated,
   "`say` is gated on isSentence, so a noun-phrase example is never spoken",
   "`say` takes the example unconditionally again — `colors` will read "
   "« le feu rouge » at a learner who must say « rouge ».")

HAS = re.compile("^(" + (_has.group(1) if _has else "x^") + ")", re.I)
SENT = re.compile((_sent.group(1) if _sent else "x^") + "$")

def say_of(it):
    fr = str(it.get("fr", ""))
    w = fr if HAS.match(fr) else next(
        (COL[t] + fr for t in (it.get("tags") or []) if t in COL), fr)
    ex = (it.get("example") or "").strip()
    return w, (ex if _gated and SENT.search(ex) else (ex or w) if not _gated else w)

spoken = {}
for deck in READY:
    p = f"src/content/collections/{deck}.json"
    if not os.path.isfile(p):
        continue
    spoken[deck] = [say_of(it) for it in json.loads(read(p)).get("items", [])]

for deck in ("transport", "lieux-letris"):
    rows = spoken.get(deck, [])
    n = sum(1 for w, s in rows if s != w)
    ok(rows and n == len(rows),
       f"{deck}: all {len(rows)} items speak their sentence",
       f"{deck}: only {n} of {len(rows)} items speak a sentence. This deck is "
       "fragments with the sentence in `example`; a card that reads the "
       "fragment is the fault Dan reported.")

rows = spoken.get("colors", [])
ok(rows and all(s == w for w, s in rows),
   f"colors: all {len(rows)} items keep their word, not their example",
   "colors is reading its examples — « le feu rouge » for « le rouge ». Those "
   "examples are things that ARE the colour, not sentences: a learner shown a "
   "red swatch must say « rouge ». The test is terminal punctuation.")

DOUBLE = re.compile(r"^(le|la|les|l'|un|une|des)\s*(au |aux |à la |à l'|du |de la |le |la |les )", re.I)
bad = [w for rows in spoken.values() for w, _ in rows if DOUBLE.match(w)]
ok(not bad,
   "no item wears its article twice",
   f"{len(bad)} item(s) have the column's article pasted onto French that "
   f"already carried one — {bad[:4]}. « le au café » is not French and it is "
   "printed on the card, not just spoken.")

# ── 5 · the module's own guard still knows the contracted forms ─────────────
for form in ("au ", "à la ", "à l'", "en "):
    ok(form in (_has.group(1) if _has else ""),
       f"the self-article guard still knows « {form.strip()} »",
       f"`withArticle` no longer recognises « {form.strip()} » as an article a "
       "word already carries, so lieux-letris goes back to « le au café ».")

print("\nSpecuLearn says the sentence (13 Sep)\n" + "-" * 70)
for deck, rows in spoken.items():
    n = sum(1 for w, s in rows if s != w)
    if n:
        print(f"  {deck}: {n} of {len(rows)} speak their sentence")
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
