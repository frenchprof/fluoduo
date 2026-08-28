#!/usr/bin/env python3
"""
Entry level and the restored selectors (2026-08-28).

WHY THIS EXISTS. Two of Dan's rulings land in the lesson pager:

  "yes a learner may choose to start at 3 stars"   (27 Aug)
  "both — dropdowns and dice"                      (27 Aug)

THE MISTAKE THE FIRST ONE MUST NOT REPEAT. A d12 used to open the ramp and its
face was a START INDEX: the pager did `queue.slice(entry)`, so a 1 walked all
twelve cards and a 12 left the lone translation. A run-length dial dressed as
difficulty — and because the ramp runs easy → hard, a high roll bought less
work at the hard end. It was removed on 25 Aug ("drop the shortcuts"). Dan's
reversal is about ENTRY, not about shortening, so the invariant this file
exists to hold is:

    every entry level is the SAME NUMBER OF CARDS.

★★★ buys a harder run, never a shorter one. A learner who wants a shorter
sitting uses the session-length chooser, which is honest about being one.

THE SECOND. The selectors are per-lesson because the axes ARE the grammar —
conjugaison-u1 varies subject x verb x polarity and most lessons vary
something else, so one fixed triple would be wrong nearly everywhere. A lesson
declares `dice.axes`; the pager shows the row only for lessons that do; and
`newQuestion(pinned)` must actually honour what was pinned, which is checked
here by EXECUTING the generator rather than reading it.

What this asserts:

  1  All three ramps are the same length, and that length is RAMP_LENGTH.
     This is the load-bearing one — it is what the old die got wrong.
  2  The ramps get harder: no level has more MCQ than the one below it, and
     ★★/★★★ contain none at all.
  3  Nothing slices the queue by entry level (the old `slice(entry)` bug).
  4  buildCards takes the level and the pins, and the pager passes both.
  5  The generator HONOURS a pin: conjugaison-u1's is executed 2000 times
     across pin combinations, and every question must match what was asked
     for. A pin that is silently ignored is worse than no selector at all.
  6  An unpinned call still varies everything — the selector must not have
     frozen the default behaviour.
  7  Steered runs drop the supplies that cannot honour a pin: the deck's own
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

# ---- 1-2 · the ramps, executed --------------------------------------------
# Read the ramps out of the module itself rather than re-typing them here: a
# copy in this file would pass while the app shipped something else.
RAMP_JS = r"""
import { rampFor, ENTRY_LEVELS, RAMP_LENGTH } from "./src/lib/lessonEntry.ts";
const out = {};
for (const lv of ENTRY_LEVELS) {
  const r = rampFor(lv);
  out[lv] = { len: r.length, mcq: r.filter(k => k === "mcq").length,
              hard: r.filter(k => k === "build" || k === "translate").length };
}
console.log(JSON.stringify({ out, RAMP_LENGTH }));
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
    mcq = {lv: v["mcq"] for lv, v in d["out"].items()}
    hard = {lv: v["hard"] for lv, v in d["out"].items()}
    check(mcq["1"] > 0 and mcq["2"] == 0 and mcq["3"] == 0,
          "★ recognises first; ★★ and ★★★ have no multiple choice",
          f"MCQ counts do not ramp: {mcq}")
    check(hard["1"] < hard["2"] < hard["3"],
          f"harder work strictly increases with the stars {hard}",
          f"the levels do not get harder: build+translate counts {hard}")

# ---- 3 · nothing slices the queue by level ---------------------------------
code = re.sub(r"/\*.*?\*/", "", build + pager, flags=re.S)
code = re.sub(r"//[^\n]*", "", code)
check("slice(entry" not in code and ".slice(level" not in code,
      "the entry level never slices the queue",
      "something slices the queue by entry level — that is exactly the removed die")

# ---- 4 · the level and the pins are threaded -------------------------------
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

# ---- 5-6 · the generator actually honours a pin ----------------------------
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

# ---- 7 · steered runs drop the supplies that cannot honour a pin -----------
check("steered" in build and "!(steered && lesson)" in build,
      "a steered run drops the deck supply, which cannot honour a pin",
      "a steered run still mixes in deck items, which ignore the selection")
check(re.search(r"steered \? null : drawBonus\(\)", build) is not None,
      "a steered run does not draw from the fixed bonus bank",
      "a steered run still draws authored bonus sentences, which ignore the selection")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
