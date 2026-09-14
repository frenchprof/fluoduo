#!/usr/bin/env python3
"""TWO HOLES IN THE REVISION PATH, PATCHED — and the traps in patching them.

Dan, 2026-09-14, after an audit of what a learner can actually revise:
*"WE NEED TO PATCH THOSE HOLES IN THE PATH PLEASE."*

    word order        nothing scrambled a sentence and asked for it back
    transfer          every nationality the app asks for is one of the 25 it
                      taught, so nothing tells a learner who knows the RULE
                      from one who memorised 25 pairs
    « en retard »     in 0 of 44 decks, so goal 27 could say WHEN something
                      happens but never whether you were on time

WHY EACH CLAUSE BELOW EXISTS, because none of them is obvious:

 1 · A TRANSFER ITEM THE DECK ALREADY TEACHES IS NOT A TRANSFER ITEM. It is a
     duplicate, and it proves nothing: the learner recalls it instead of
     deriving it, and the screen still says « un mot nouveau ». This is the
     clause the whole idea rests on, and it is one careless edit away at all
     times — someone adding « italien » to the taught deck would silently turn
     a transfer item into a memory test.

 2 · THE RULE MUST ACTUALLY PRODUCE THE ANSWER. Each item states the pattern
     it tests (« -ien → -ienne ») and the app PRINTS that to the learner after
     they answer. A stated rule that does not derive `fs` from `ms` is the app
     teaching a wrong rule at the exact moment the learner is most likely to
     believe it. Checked by applying the stated transformation, not by trusting
     it.

 3 · THE « COMME … » EXAMPLE MUST BE A WORD THE DECK REALLY TEACHES. The whole
     consolation is "you already know this one". If the example is not in the
     deck, that sentence is false and the reassurance is worse than none.

 4 · THE PROBE MAY NOT REACH THE SCORING PATH. A word the app never taught
     cannot count against a learner — same ruling as SpecuLearn's pre-lesson
     answers (verify40, "remember it, but don't score it"). This greps for the
     three doors into the ledger, because the failure would be invisible: the
     screen looks identical whether or not it wrote a miss.

 5 · THE TWO DECKS STAY LOCK-STEPPED. Goal 15's countries and goal 16's
     nationalities are the same subjects in the same order, and transfer items
     exist precisely so nobody "fixes" a missing word by adding a 26th entry to
     one of them. Pinning the pairing is what makes that ruling enforceable
     rather than a comment.

 6 · AN UNSCRAMBLE BANK NEEDS SENTENCES, AND AN EMPTY POOL. A bank pointed at
     a deck with nothing long enough to scramble is a door onto an empty room.
     And WordBank adds up to four DISTRACTOR words from `pool` — passing
     anything but an empty list turns a reorder into a different exercise
     without looking any different in the diff.

Run from the repo root:  python3 verify/verify700-transfer-and-order.py
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


def code(p):
    """The file with its comments stripped.

    THIS FUNCTION EXISTS BECAUSE CLAUSE 4 FAILED ON ITSELF. TransferProbe's own
    docstring says "nothing here can reach `recordItemResult`" — and a grep for
    that name found it there and reported the probe as writing to the ledger.
    The same trap caught verify560 in September: a clause looking for « au »
    found it in the prose explaining why « au » matters. A check must read what
    RUNS, never what a comment says about what runs."""
    s = read(p)
    s = re.sub(r"/\*[\s\S]*?\*/", "", s)
    s = re.sub(r"(?m)^\s*//.*$", "", s)
    return re.sub(r"(?<![:\"'])//[^\n\"'`]*$", "", s, flags=re.M)


def deck(deck_id):
    p = f"src/content/collections/{deck_id}.json"
    return json.load(open(p, encoding="utf-8")) if os.path.isfile(p) else None


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

# ── read the transfer table out of the module, not a copy of it ─────────────
src = read("src/content/transfer.ts")
ok(bool(src), "src/content/transfer.ts is present", "src/content/transfer.ts is missing")
blocks = re.findall(
    r'\{\s*ms:\s*"([^"]+)",\s*fs:\s*"([^"]+)",\s*en:\s*"([^"]+)",\s*'
    r'rule:\s*"([^"]+)",\s*like:\s*"([^"]+)"\s*\}', src)
ok(len(blocks) >= 4,
   f"{len(blocks)} transfer items read from the module",
   "could not read the transfer items — re-point this parse rather than "
   "letting the clauses below pass over an empty list.")

nat = deck("nationalities")
ok(nat is not None, "the nationalities deck loads", "nationalities.json is missing")
taught = set()
for it in (nat or {}).get("items", []):
    n = it.get("nat") or {}
    taught.update(x for x in (n.get("ms"), n.get("fs"), n.get("mp"), n.get("fp")) if x)

# ── 1 · a transfer item may not be a word the deck teaches ──────────────────
clash = [f"{ms}/{fs}" for ms, fs, _en, _r, _l in blocks if ms in taught or fs in taught]
ok(not clash,
   f"no transfer item is a word the deck already teaches ({len(taught)} taught forms)",
   f"THESE ARE NOT TRANSFER ITEMS, THEY ARE DUPLICATES: {clash}. The deck "
   "teaches them, so the learner recalls them instead of deriving them and the "
   "screen still says « un mot nouveau ». Either drop the item or drop it from "
   "the deck — and if a word was added to the taught deck, check goal 15's "
   "countries deck too: the two are lock-stepped (clause 5).")

# ── 2 · the stated rule must derive fs from ms ──────────────────────────────
def derives(ms: str, fs: str, rule: str) -> bool:
    r = rule.strip()
    m = re.fullmatch(r"-(\w+) → -(\w+)", r)
    if m:
        end, new = m.group(1), m.group(2)
        return ms.endswith(end) and fs == ms[: -len(end)] + new
    if r == "ends in -s → add -e":
        return ms.endswith("s") and fs == ms + "e"
    if r == "no change":
        return ms == fs
    return False


bad_rule = [f"« {r} » does not turn {ms} into {fs}" for ms, fs, _en, r, _l in blocks
            if not derives(ms, fs, r)]
ok(not bad_rule,
   f"every stated rule really derives the feminine ({len(blocks)} items)",
   "THE APP WOULD PRINT A WRONG RULE at the moment the learner is most likely "
   "to believe it: " + "; ".join(bad_rule))

# ── 3 · the « comme … » example must be taught ──────────────────────────────
bad_like = []
for ms, fs, _en, _r, like in blocks:
    parts = [x.strip() for x in like.split("→")]
    if len(parts) != 2 or parts[0] not in taught or parts[1] not in taught:
        bad_like.append(f"{ms}: « comme {like} », which this deck does not teach")
ok(not bad_like,
   "every « comme … » example is a word the deck really teaches",
   "the reassurance is false — « you already know this one » about a word the "
   "learner has never seen: " + "; ".join(bad_like))

# ── 4 · the probe may not reach the ledger ──────────────────────────────────
probe = code("src/components/TransferProbe.tsx")
ok(bool(probe.strip()), "TransferProbe.tsx is present", "src/components/TransferProbe.tsx is missing")
LEDGER = ["recordItemResult", "queueForReview", "setBucket", "awardConversationXp",
          "recordResponse", "addXp"]
reached = [d for d in LEDGER if d in probe]
ok(not reached,
   "the transfer probe touches nothing that scores (6 doors checked)",
   f"THE PROBE NOW WRITES TO THE LEDGER via {reached}. A word the app never "
   "taught must not dent accuracy, cost XP or enter the review queue — "
   "verify40's ruling, 'remember it, but don't score it'. The screen looks "
   "identical either way, which is exactly why this is a check and not a "
   "reading.")

# ── 5 · the two decks stay lock-stepped ─────────────────────────────────────
cty = deck("countries-letris")
n_items = (nat or {}).get("items", [])
c_items = (cty or {}).get("items", [])
ok(len(n_items) == len(c_items) and len(n_items) > 0,
   f"goal 15 and goal 16 still hold the same number of subjects ({len(n_items)})",
   f"THE TWO DECKS HAVE DRIFTED: countries {len(c_items)}, nationalities "
   f"{len(n_items)}. They are the same subjects in the same order, and a word "
   "added to one alone desynchronises two decks and the games that read them. "
   "If a nationality was 'missing', it belongs in transfer.ts, not here.")
slug = lambda i: i["id"].rsplit("-", 1)[-1]
pairs = [(slug(a), slug(b)) for a, b in zip(c_items, n_items)]
off = [f"{a} ≠ {b}" for a, b in pairs if a != b]
ok(not off,
   f"the two decks pair one to one, in order ({len(pairs)} subjects)",
   "the decks list their subjects in different orders now: " + "; ".join(off[:6]))

# ── 6 · an unscramble bank needs sentences, and an empty distractor pool ────
banks = code("src/games/compose/banks-production.tsx")
un = re.findall(r'unscrambleBank\("([a-z0-9\-]+)"', banks)
ok(bool(un), f"{len(un)} unscramble bank(s) registered",
   "no unscramble bank found — re-point this parse or the clauses below test "
   "nothing.")
SENT = re.compile(r"[.!?…]\s*$")
thin = []
for d in un:
    j = deck(d)
    n = sum(1 for i in (j or {}).get("items", [])
            if SENT.search(i.get("fr", "")) and len(i.get("fr", "").split()) >= 4)
    if n < 6:
        thin.append(f"{d} has only {n}")
ok(not thin,
   f"every unscramble bank's deck carries 6+ scrambleable sentences ({', '.join(un)})",
   "an unscramble bank is pointed at a deck with almost nothing to scramble — "
   "a door onto an empty room: " + "; ".join(thin))

engine = code("src/games/compose/ComposeUnscramble.tsx")
ok(re.search(r"pool=\{\[\]\}", engine),
   "the reorder passes WordBank an empty distractor pool",
   "WordBank is being given a non-empty `pool`, so it will add up to four "
   "words that are NOT in the sentence. That is a different exercise — the "
   "learner can no longer tell 'these are the words, find the order' — and it "
   "looks like nothing in a diff.")

print("\nthe path's holes stay patched (14 Sep)\n" + "-" * 70)
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
