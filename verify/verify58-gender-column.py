#!/usr/bin/env python3
"""
A deck that records gender records it for EVERY word.

Dan, 30-31 Aug, settling the Tier 2 shape: "a vocab list with gender and so on,
as seen in SpecuLearn." `aliments` sorts into 23 masculine, 12 feminine, 5
feminine plural and 2 masculine plural — and NINE of those hide their gender
behind « de l' » or « des », where the article says nothing. A learner who only
ever meets « de l'eau » is never told that `eau` is feminine. That is what the
column is for.

`gender` had been in the Item schema all along with NO deck populating it — a
dead field. `aliments` is the first.

THE TRAP THIS GUARDS. A half-populated deck is worse than an empty one. The
lexique shows nothing where `gender` is absent, so on a partial deck a blank
cell means either "this word has no gender" or "nobody recorded it" — and the
learner cannot tell which. On a deck with no gender at all the column simply
does not appear, which is honest. So the rule is all or nothing.

It also checks that the emphasis still points somewhere: the filled badge marks
words whose ARTICLE does not give the gender away, and if a deck's every word
is `le`/`la`, the highlight would be decoration.

Run from the repo root:  python3 verify/verify58-gender-column.py
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)

VALID = {"m", "f", "mpl", "fpl"}
SHOWS = re.compile(r"^(le|la|un|une|du|de la)\s", re.I)

d = os.path.join(ROOT, "src/content/collections")
partial, populated = [], []
for fn in sorted(os.listdir(d)):
    if not fn.endswith(".json"): continue
    c = json.load(open(os.path.join(d, fn), encoding="utf-8"))
    items = c.get("items", [])
    have = [i for i in items if i.get("gender")]
    if not have: continue
    populated.append(c["id"])
    bad = [i["id"] for i in have if i["gender"] not in VALID]
    ok(not bad, f"{c['id']}: every gender is one of m/f/mpl/fpl",
       f"{c['id']} has genders outside the schema's four values: {bad[:5]}")
    if len(have) != len(items):
        partial.append((c["id"], len(have), len(items)))
    # the emphasis must point somewhere
    hidden = [i for i in have if not SHOWS.match(i["fr"].strip())]
    ok(len(hidden) > 0,
       f"{c['id']}: {len(hidden)} words hide their gender behind the article",
       f"{c['id']} records gender but every word's article already shows it — "
       f"the highlighted column is decoration there, not information")

ok(populated, f"{len(populated)} deck(s) record gender: {populated}",
   "no deck records gender — the column cannot render and `gender` is a dead "
   "field again")
ok(not partial,
   "every deck that records gender records it for all its words",
   "these decks are PARTIALLY genderd, so a blank cell means either 'no "
   "gender' or 'not recorded' and the learner cannot tell which: "
   + ", ".join(f"{n} {a}/{b}" for n, a, b in partial))

# the column must actually be wired
TABS = open(os.path.join(ROOT, "src/app/lessons/pager/LessonTabs.tsx"), encoding="utf-8").read()
ok("GENDER_LABEL" in TABS and "articleShowsGender" in TABS,
   "Le lexique renders the gender column",
   "LessonTabs no longer renders gender — the data is recorded and shown nowhere")
ok("it.gender ? GENDER_LABEL[it.gender] : undefined" in TABS,
   "a word with no recorded gender shows nothing, rather than a guess",
   "the lexique infers gender where it is not recorded — guessing from the "
   "article is the exact mistake the column exists to correct")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
