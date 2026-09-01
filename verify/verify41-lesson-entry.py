#!/usr/bin/env python3
"""
Entry level and the restored selectors (2026-08-28; renamed and remapped
2026-08-31).

WHY THIS EXISTS. Three of Dan's rulings land in the lesson pager:

  "yes a learner may choose to start at 3 stars"                   (27 Aug)
  "both — dropdowns and dice"                                      (27 Aug)
  "instead of Découverte, Entraînement, Maîtrise, it was supposed
   to be Facile, Moyen and Difficile (Difficulty level) and there
   should be a bonus for translating simple sentences"             (31 Aug)

THE 31 AUG CLASSIFICATION, in his words: Sorting is Facile; CompleteIt is
Difficile if it involves two items, Moyen if it involves one; the entire
sentence is Bonus. In ramp vocabulary: Facile recognises (mcq) and sorts the
given words into order (build); Moyen is gap with ONE blank; Difficile is gap
with TWO blanks where the generator authored slots; Bonus is translate.

THE MISTAKE THE LADDER MUST NOT REPEAT. A d12 used to open the ramp and its
face was a START INDEX: the pager did `queue.slice(entry)`, so a 1 walked all
twelve cards and a 12 left the lone translation. A run-length dial dressed as
difficulty. It was removed on 25 Aug ("drop the shortcuts"), so the invariant
this file exists to hold is:

    every entry level is the SAME NUMBER OF CARDS.

Difficile buys a harder run, never a shorter one. A learner who wants a
shorter sitting uses the session-length chooser, which is honest about being
one.

THE SELECTORS. Per-lesson because the axes ARE the grammar — conjugaison-u1
varies subject x verb x polarity and most lessons vary something else, so one
fixed triple would be wrong nearly everywhere. A lesson declares `dice.axes`;
the pager shows the row only for lessons that do; and `newQuestion(pinned)`
must actually honour what was pinned, which is checked here by EXECUTING the
generator rather than reading it.

What this asserts:

  1  All four ramps are the same length, and that length is RAMP_LENGTH.
     This is the load-bearing one — it is what the old die got wrong.
  2  The mechanics match Dan's classification: Facile = mcq + build and
     nothing produced from nothing; Moyen and Difficile are all gap; Bonus is
     all translate. blankKeysFor gives Moyen ONE key and Difficile all of
     them — executed, since that is where "one piece / two pieces" lives.
  3  The labels are Dan's names — Facile / Moyen / Difficile / Bonus.
  4  Nothing slices the queue by entry level (the old `slice(entry)` bug).
  5  buildCards takes the level and the pins, and the pager passes both.
  6  The generator HONOURS a pin: conjugaison-u1's is executed 2000 times
     across pin combinations, and every question must match what was asked
     for. A pin that is silently ignored is worse than no selector at all.
  7  An unpinned call still varies everything — the selector must not have
     frozen the default behaviour.
  8  Steered runs drop the supplies that cannot honour a pin: the deck's own
     items, and the authored bonus bank. Both would serve off-target cards
     into a run that claims to be about the learner's selection.

Run from the repo root:  python3 verify/verify41-lesson-entry.py
"""
import os, re, subprocess, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

ENTRY  = "src/lib/lessonEntry.ts"
BUILD  = "src/app/lessons/pager/buildCards.tsx"
PAGER  = "src/app/lessons/pager/LessonPager.tsx"
TYPES  = "src/content/lessons/native/types.ts"
LESSON = "src/content/lessons/native/conjugaison-u1.tsx"
GEN    = "src/content/lessons/native/conjugaison-u1.gen.ts"

for p in (ENTRY, BUILD, PAGER, TYPES, LESSON, GEN):
    check(os.path.isfile(p), f"{p} present", f"MISSING {p}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

entry, build, pager = read(ENTRY), read(BUILD), read(PAGER)
types, lesson = read(TYPES), read(LESSON)
gen = read(GEN)

# ---- 1-3 · the ramps, the blanks and the names, executed -------------------
# Read the ramps out of the module itself rather than re-typing them here: a
# copy in this file would pass while the app shipped something else.
RAMP_JS = r"""
import { rampFor, ENTRY_LEVELS, ENTRY_LABELS, RAMP_LENGTH } from "./src/lib/lessonEntry.ts";
import { blankKeysFor } from "./src/content/lessons/native/cloze.ts";
const out = {};
for (const lv of ENTRY_LEVELS) {
  const r = rampFor(lv);
  out[lv] = {
    len: r.length,
    mcq: r.filter(k => k === "mcq").length,
    gap: r.filter(k => k === "gap").length,
    build: r.filter(k => k === "build").length,
    translate: r.filter(k => k === "translate").length,
    name: ENTRY_LABELS[lv].name,
  };
}
const slots = [
  { key: "verb", text: "aime", choices: ["aime", "aimes"] },
  { text: "le" },
  { key: "noun", text: "sport", choices: ["sport", "tennis"] },
];
const blanks = Object.fromEntries(ENTRY_LEVELS.map(lv => [lv, blankKeysFor(lv, slots).length]));
console.log(JSON.stringify({ out, blanks, RAMP_LENGTH }));
"""
n = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", RAMP_JS],
                   capture_output=True, text=True)
check(n.returncode == 0, "the ramps executed in node", f"ramp run failed: {n.stderr[-400:]}")
if n.returncode == 0:
    import json
    d = json.loads(n.stdout.strip().splitlines()[-1])
    lens = {lv: v["len"] for lv, v in d["out"].items()}
    check(len(set(lens.values())) == 1,
          f"every entry level is the same length ({sorted(set(lens.values()))[0]} cards)",
          f"entry levels differ in LENGTH {lens} — that is the old slice() bug: "
          "a higher level must be harder, never shorter")
    check(all(v == d["RAMP_LENGTH"] for v in lens.values()),
          f"every ramp is RAMP_LENGTH ({d['RAMP_LENGTH']})",
          f"a ramp is not RAMP_LENGTH: {lens} vs {d['RAMP_LENGTH']}")

    o = d["out"]
    check(o["1"]["mcq"] > 0 and o["1"]["build"] > 0
          and o["1"]["gap"] == 0 and o["1"]["translate"] == 0,
          "Facile recognises and sorts — mcq + build, nothing produced from nothing",
          f"Facile is not mcq+build: {o['1']}")
    check(o["2"]["gap"] == d["RAMP_LENGTH"],
          "Moyen is CompleteIt throughout — every card a gap",
          f"Moyen is not all gap: {o['2']}")
    check(o["3"]["gap"] == d["RAMP_LENGTH"],
          "Difficile is CompleteIt throughout — every card a gap",
          f"Difficile is not all gap: {o['3']}")
    check(o["4"]["translate"] == d["RAMP_LENGTH"],
          "Bonus is the entire sentence — every card a translate",
          f"Bonus is not all translate: {o['4']}")

    # "Moyen if it involves one, Difficile if it involves two" lives in
    # blankKeysFor — with two blankable slots on offer, Moyen takes 1 and
    # Difficile takes both.
    b = d["blanks"]
    check(b["2"] == 1,
          "Moyen withdraws ONE piece (blankKeysFor gives one key)",
          f"Moyen withdraws {b['2']} pieces — Dan: 'Moyen if it involves one'")
    check(b["3"] == 2,
          "Difficile withdraws TWO pieces (blankKeysFor gives every key)",
          f"Difficile withdraws {b['3']} pieces — Dan: 'Difficile if it involves two items'")

    names = [o[str(lv)]["name"] for lv in (1, 2, 3, 4)]
    check(names == ["Facile", "Moyen", "Difficile", "Bonus"],
          "the levels wear Dan's names: Facile / Moyen / Difficile / Bonus",
          f"the level names drifted: {names} — Dan replaced "
          "Découverte/Entraînement/Maîtrise on 31 Aug")
    # Comments may QUOTE the old names (the header quotes Dan's ruling); only
    # code that could still render them is a failure.
    _live = re.sub(r"/\*.*?\*/", "", entry + pager, flags=re.S)
    _live = re.sub(r"//[^\n]*", "", _live)
    for old in ("Découverte", "Entraînement", "Maîtrise"):
        check(old not in _live,
              f"the old name {old!r} is gone from live code",
              f"{old!r} survives outside comments — the 31 Aug rename is half-applied")

# ---- 4 · nothing slices the queue by level ---------------------------------
code = re.sub(r"/\*.*?\*/", "", build + pager, flags=re.S)
code = re.sub(r"//[^\n]*", "", code)
check("slice(entry" not in code and ".slice(level" not in code,
      "the entry level never slices the queue",
      "something slices the queue by entry level — that is exactly the removed die")

# ---- 5 · the level and the pins are threaded -------------------------------
check("entry?: EntryLevel" in build and "rampFor(entry)" in build,
      "buildCards takes the entry level and builds its ramp from it",
      "buildCards ignores the entry level")
check("pinned?: Record<string, string>" in build,
      "buildCards takes the pins",
      "buildCards does not accept pinned axes")
# Assert the CALL carries both, not a particular spelling: this first read
# `"entry: level" in pager`, which went red when build() was refactored to take
# them from state and pass shorthand — a correct change reported as a fault.
_call = re.search(r"buildCards\(\{(.*?)\}\)", pager, re.S)
_args = _call.group(1) if _call else ""
check(re.search(r"\bentry\b", _args) is not None and re.search(r"\bpinned\b", _args) is not None,
      "the pager passes both the entry level and the pins to buildCards",
      f"the pager's buildCards call is missing entry / pinned: {_args.strip()[:160]!r}")
check("axes" in types and "newQuestion: (pinned?" in types,
      "DiceConfig declares axes and a steerable newQuestion",
      "DiceConfig has no axes / newQuestion is not steerable")

# ---- 6-7 · the generator actually honours a pin ----------------------------
# Executed, not read. A pin that is quietly ignored looks identical in source
# to one that works, and is worse than offering no selector at all.
GEN_JS = r"""
// The .tsx cannot be loaded (JSX); the generator lives in its own .ts for
// exactly this reason — see conjugaison-u1.gen.ts.
import { conjugaisonU1Question as g } from "./src/content/lessons/native/conjugaison-u1.gen.ts";
const SUBJ = ["Je","Tu","Il","Elle","Nous","Vous","Ils","Elles"];
const VERB = ["s'appeler","être","avoir"];
const POL  = ["aff","neg"];
let bad = [];
let n = 0;
for (const s of SUBJ) for (const v of VERB) for (const p of POL) {
  for (let k = 0; k < 42; k++) {
    const q = g({ subject: s, verb: v, polarity: p });
    n++;
    // The prompt names the subject and the verb; the meta names the polarity.
    if (!q.big.startsWith(s.toLowerCase() + " + ")) bad.push(`subject ${s} -> ${q.big}`);
    if (!q.big.endsWith(" + " + v)) bad.push(`verb ${v} -> ${q.big}`);
    const wantNeg = p === "neg";
    const isNeg = q.meta.includes("négatif");
    if (wantNeg !== isNeg) bad.push(`polarity ${p} -> ${q.meta}`);
    // The graded answer must carry the pinned subject too.
    if (!q.correct.toLowerCase().startsWith(s.toLowerCase().replace(/^je$/, "j"))) {
      if (!q.correct.toLowerCase().startsWith(s.toLowerCase())) bad.push(`answer ${s} -> ${q.correct}`);
    }
    if (bad.length > 4) break;
  }
}
// Unpinned must still vary everything.
const free = new Set();
for (let k = 0; k < 400; k++) free.add(g().big);
console.log(JSON.stringify({ n, bad: bad.slice(0, 5), freeVariety: free.size }));
"""
g = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", GEN_JS],
                   capture_output=True, text=True)
check(g.returncode == 0, "the generator executed in node",
      f"generator run failed: {g.stderr[-500:]}")
if g.returncode == 0:
    import json
    r = json.loads(g.stdout.strip().splitlines()[-1])
    check(not r["bad"],
          f"every one of {r['n']} pinned questions honoured its pin",
          f"the generator IGNORES pins: {r['bad']}")
    check(r["freeVariety"] > 10,
          f"an unpinned call still varies freely ({r['freeVariety']} distinct prompts in 400)",
          f"unpinned generation collapsed to {r['freeVariety']} prompts — the selector froze the default")

# ---- 8 · steered runs drop the supplies that cannot honour a pin -----------
check("steered" in build and "!(steered && lesson)" in build,
      "a steered run drops the deck supply, which cannot honour a pin",
      "a steered run still mixes in deck items, which ignore the selection")
check(re.search(r"steered \? null : drawBonus\(\)", build) is not None,
      "a steered run does not draw from the fixed bonus bank",
      "a steered run still draws authored bonus sentences, which ignore the selection")

# ---- 9 · Difficile means two pieces, and its scaffold is really withdrawn --
# Dan's live-site report, 31 Aug: "all the levels … why are they all mcq?"
# Three causes, three fixes, each pinned here as a source check:
check('entry === 3 && slotted' in build,
      "a Difficile run on a slotted lesson drops the deck supply (one-piece cards)",
      "Difficile mixes deck cards back in — half its run is Moyen again")
check(build.count("entry >= 3 ? { typed: true }") == 2,
      "Difficile's single-blank fallbacks are TYPED — no word bank playing MCQ",
      "a Difficile gap card carries a word bank again: three tiles read as MCQ, "
      "the withdrawn scaffold handed back")
check('entry >= 2 ? "build" : "mcq"' in build,
      "a gapless deck falls back to BUILD at Moyen and up, MCQ only at Facile",
      "a gapless deck turns Moyen/Difficile gap cards into MCQ — Dan's "
      "'why are they all mcq?' verbatim")
check('ex.typed ? "block" : "hidden sm:block"' in pager and "!ex.typed &&" in pager,
      "the pager renders a typed card as an input at every width, bank gone",
      "the pager still offers the word bank on a typed card")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
