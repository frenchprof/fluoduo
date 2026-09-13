#!/usr/bin/env python3
"""A card prints its Letris frame ONCE.

WHAT WAS BROKEN, MEASURED IN THE BUILT APP AT 430px ON 2026-09-13.
MémoiRecall dealt « il fait Il fait beau. » and « un un sac », and VoixLà asked
the learner to SAY that sentence and graded their speech against it.

WHY. A Letris column carries a `prefix` so a deck may store the bare fragment
and let the board supply the frame — « du vent » under IL Y A. Three decks do
not work that way: they store the whole sentence in `fr` and keep the col: tag
only so the board can still sort them. `frFull()` pasted the frame on either
way, so those rows got it twice:

    weather-letris    23 rows   « il fait » + « Il fait beau. »
    objets-articles   20 rows   « un »      + « un sac »
    en-au-aux-a       17 rows   « en »      + « en France »

Nothing caught it because BOTH shapes are legitimate — the deck data is not
wrong, the join was — and because VoixLà held a byte-clone of the function, so
fixing one surface would have left the other broken and silent.

WHAT IS PINNED

  1  ONE definition of frFull in the whole app. The clone is what made this a
     two-surface bug; a new copy would make it a three-surface bug.
  2  The join tests whether the French ALREADY opens with the frame.
  3  The test is on the joined head — « ma » plus a space — never the bare
     word. « ma » is a prefix of « maison », and a spaceless test would eat the
     frame off the one possessives row that starts with those two letters.
  4  The three decks above still hold whole sentences under a col: tag, so the
     guard still has something to guard. If that stops being true the check
     says so out loud rather than passing on an app where nothing is tested.

Run from the repo root:  python3 verify/verify520-frame-once.py
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

SHARED = "src/app/practice/flip-it/shared.tsx"
src = read(SHARED)
ok(bool(src), f"{SHARED} exists", f"{SHARED} is missing — the join lives there")

# ── 1 · one definition, app-wide ────────────────────────────────────────────
defs = []
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            if re.search(r"function\s+frFull\s*\(", read(p)):
                defs.append(p)
ok(defs == [SHARED],
   "frFull is defined once, in flip-it/shared.tsx, and imported everywhere else",
   f"frFull is defined in {len(defs)} files: {defs}. A second copy is how this bug "
   "survived a fix once already — VoixLà kept asking the learner to say « il fait "
   "Il fait beau. » after the flip cards were mended.")

# ── 2 & 3 · the guard, and the shape of its test ────────────────────────────
body = src[src.find("export function frFull("):]
body = body[: body.find("\n}") + 2]
ok("startsWith" in body,
   "the join asks whether the French already opens with the frame",
   "frFull no longer tests the French before pasting the frame on — every deck that "
   "stores whole sentences under a col: tag prints its frame twice again")
ok(re.search(r'`\$\{article\}\s`|article \+ " "|\$\{article\} `', body) is not None
   or '`${article} `' in body,
   "the test is on the frame PLUS its space, not the bare word",
   "the guard compares against the bare article. « ma » is a prefix of « maison », "
   "so a spaceless test would strip the frame off possessives' own row and print "
   "« maison » where « ma maison » belongs.")

# ── 4 · the decks the guard exists for ──────────────────────────────────────
C = "src/content/collections"
census = {}
for f in sorted(os.listdir(C)) if os.path.isdir(C) else []:
    if not f.endswith(".json"):
        continue
    deck = json.loads(read(os.path.join(C, f)))
    cols = {c.get("key"): c.get("prefix") or ""
            for c in ((deck.get("gameConfig") or {}).get("letris") or {}).get("columns", [])}
    if not cols:
        continue
    n = 0
    for it in deck.get("items", []):
        tag = next((t for t in (it.get("tags") or []) if str(t).startswith("col:")), None)
        if not tag:
            continue
        head = cols.get(tag[4:], "")
        if head and str(it.get("fr", "")).lower().startswith(head.lower()):
            n += 1
    if n:
        census[f[:-5]] = n

for deck in ("weather-letris", "objets-articles", "en-au-aux-a"):
    ok(census.get(deck, 0) > 0,
       f"{deck} still stores whole sentences under a col: tag ({census.get(deck, 0)} rows) — "
       "the guard is doing work here",
       f"{deck} no longer has a single row whose French opens with its own column's "
       "frame. Either the deck was rewritten to bare fragments — in which case say so "
       "here — or the col: tags were dropped and its Letris board is broken.")

print("\na card prints its frame once (13 Sep)\n" + "-" * 70)
print("  decks relying on the guard: " + ", ".join(f"{k} ({v})" for k, v in census.items()))
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
