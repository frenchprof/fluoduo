#!/usr/bin/env python3
"""
The origin animation ends on the NAME — FluOLinGo, four capitals, four words.

Decision 4 (31 Aug): the fluency-cycling animation is "to be REDONE in FluOLinGo
Hand", the two 30 Aug branches reference rather than a base. Rebuilt 1 Sep.

WHY THE REDO IS NOT A RE-SKIN. The 30 Aug cut ended on `Fluolingo`, all
lowercase. The next day Dan made the names law — *"FluOLinGo (with capitals
F,O,L,G) for FluencyOnLinguisticGoals"* — so the old ending spells a name that
no longer exists, in an animation whose entire job is to explain where the name
comes from. A font swap would have shipped that unchanged.

And the fix earns a beat rather than filling one. Up to the merge it is the
SPACES that mark the four words. Closing them is what makes the name, and it is
also what would throw the four words away: `Fluolingo` is one word, `FluOLinGo`
is still four. The capitals are what the spaces leave behind. That is why the
brand is spelt with those four capitals and no others, and it is why the last
stage exists.

WHAT IS PINNED, and why each would fail in silence

  1  THE ENDING IS THE BRAND, character for character, and the four capitals
     are DERIVED from the four words rather than typed — a hand-typed
     "FluOLinGo" would keep passing after someone changed `linguistic` to
     something else, and the animation would then be explaining a lie.
  2  THE TABLE'S INVARIANTS. `keep` only ever shrinks, `step` never goes
     backwards (the phrase gets shorter, so the size it frees is never taken
     back), and a gap is one space or none — never anything between, which is
     the state the 30 Aug cut sat on for a beat with holes in the phrase.
  3  THE BEATS ARE ORDERED and every stage change has a window; a hold cannot
     have negative length.
  4  `phaseAt` COVERS THE WHOLE TIMELINE. Executed at 2ms resolution over the
     full pass: no gap, no stage pair outside the table, and every stage
     actually reached. A renderer with its own `if` ladder is how a beat table
     and an animation drift apart — so there is one function and this walks it.
  5  THE LAYOUT RULE. A letter that does not survive takes NO WIDTH and sits on
     the seam it closed. Checked by reconstructing every stage's width from the
     advances of the survivors alone.
  6  THE RENDERER OWNS NO CONTENT. No sentence word, no millisecond, no stage
     text in the .tsx — if it decides one of those for itself, everything above
     is holding a copy rather than the thing that runs.
  7  FLUOLINGO HAND, and only the two weights the app actually loads.

Run from the repo root:  python3 verify/verify81-fluolingo-origin.py
"""
import json
import os
import re
import subprocess
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped. This file explains the capitals, the
    beats and the stage names at length in prose; a raw scan would pass on the
    documentation and let a real regression hide behind the words excusing it."""
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

SPEC = "src/lib/fluolingoOrigin.ts"
VIEW = "src/components/FluolingoOrigin.tsx"
PAGE = "src/app/hidden/fluolingo/page.tsx"
LAYOUT = "src/app/layout.tsx"

spec_src, view_src = read(SPEC), code(read(VIEW))
ok(bool(spec_src), f"{SPEC} exists", f"{SPEC} is missing — the animation has no spec to be held to")
ok(bool(view_src), f"{VIEW} exists", f"{VIEW} is missing")
ok(bool(read(PAGE)), f"{PAGE} exists — there is somewhere to watch it",
   f"{PAGE} is missing; the animation can only be judged inside whatever hosts it")

# ── EXECUTED, not regex-read ───────────────────────────────────────────────
# The spec has no runtime imports, so node strips its types and runs it. Every
# claim below is measured off the real functions rather than off a second
# implementation in Python — which is exactly the mistake verify76's first
# draft made, and it accused a correct lesson of inventing French.
JS = r"""
const S = await import("./src/lib/fluolingoOrigin.ts");
const { STAGES, SENTENCE, BEATS, stageText, stageWords, layoutStage, phaseAt,
        cycleTicks, cycleWordAt, FIELD_ONE, FIELD_TWO } = S;

// A stand-in metric: every letter one unit wide, a space half. The layout rule
// under test is about which letters take width, not about the typeface.
const adv = (ch) => (ch === " " ? 0.5 : 1);
const last = STAGES[STAGES.length - 1];
const fields = ["achieved", "customisable"];

// 1 · the ending, and where its capitals come from
const ending = stageText(last, fields);
const words = stageWords(last, fields);
const initials = words.filter((_, i) => last.keep[i] > 0).map((w) => w[0]).join("");
const fragments = words.map((w, i) => w.slice(0, last.keep[i])).filter(Boolean);

// 2 · table invariants
const tableFaults = [];
for (let i = 1; i < STAGES.length; i++) {
  const a = STAGES[i - 1], b = STAGES[i];
  if (b.step < a.step) tableFaults.push(`step goes backwards at ${b.key}`);
  a.keep.forEach((k, w) => { if (b.keep[w] > k) tableFaults.push(`keep grows at ${b.key} word ${w}`); });
  if (a.gap === "none" && b.gap === "space") tableFaults.push(`the gap reopens at ${b.key}`);
}
for (const s of STAGES) if (s.gap !== "space" && s.gap !== "none") tableFaults.push(`${s.key} has gap "${s.gap}"`);

// 3 · the beats run forwards and no hold is negative
const windows = [BEATS.reduceFields, BEATS.bloom, BEATS.reduceWords, BEATS.reduceOn, BEATS.merge, BEATS.name];
const beatFaults = [];
for (const w of windows) if (!(w[1] > w[0])) beatFaults.push(`window ${JSON.stringify(w)} does not run forwards`);
const order = [BEATS.reduceFields[1], BEATS.reduceWords[0], BEATS.reduceWords[1],
               BEATS.reduceOn[0], BEATS.reduceOn[1], BEATS.merge[0], BEATS.merge[1],
               BEATS.name[0], BEATS.name[1], BEATS.end];
for (let i = 1; i < order.length; i++) if (order[i] < order[i - 1]) beatFaults.push(`beat ${i} runs before the one before it`);

// 4 · phaseAt walks the whole pass
const reached = new Set(); const phaseFaults = [];
for (let t = 0; t <= BEATS.end; t += 2) {
  const ph = phaseAt(t);
  if (ph.from < 0 || ph.to >= STAGES.length) { phaseFaults.push(`t=${t} names stage ${ph.from}->${ph.to}`); break; }
  if (ph.p < 0 || ph.p > 1) { phaseFaults.push(`t=${t} has p=${ph.p}`); break; }
  if (ph.to !== ph.from && ph.to !== ph.from + 1) { phaseFaults.push(`t=${t} skips from ${ph.from} to ${ph.to}`); break; }
  reached.add(ph.from); reached.add(ph.to);
}

// 5 · the layout rule — width is the survivors' advances, and nothing else
const layoutFaults = [];
for (const s of STAGES) {
  const ws = stageWords(s, fields);
  const L = layoutStage(s, ws, adv);
  let expect = 0, live = 0;
  ws.forEach((w, i) => {
    const keep = Math.min(s.keep[i], w.length);
    if (keep > 0 && live > 0) expect += (s.gap === "space" ? adv(" ") : 0);
    for (let c = 0; c < keep; c++) expect += adv(w[c]);
    if (keep > 0) live++;
  });
  if (Math.abs(L.width - expect) > 1e-9) layoutFaults.push(`${s.key}: width ${L.width} != ${expect}`);
  // every ghost is zero-width: the next item starts where it does
  const ghosts = L.items.filter((i) => i.ghost);
  for (const g of ghosts) {
    const sib = L.items.find((i) => i.word === g.word && i.index === g.index + 1);
    if (sib && sib.x !== g.x) layoutFaults.push(`${s.key}: ghost ${g.ch} took width`);
  }
}

// 6 · the cycling fields land on the word the sentence keeps
const t1 = cycleTicks(BEATS.cycleOneEnds, FIELD_ONE.length);
const t2 = cycleTicks(BEATS.cycleTwoEnds, FIELD_TWO.length);
const settleFaults = [];
if (cycleWordAt(BEATS.cycleOneEnds, t1, FIELD_ONE) !== SENTENCE[1]) settleFaults.push("field one does not settle on " + SENTENCE[1]);
if (cycleWordAt(BEATS.cycleTwoEnds, t2, FIELD_TWO) !== SENTENCE[3]) settleFaults.push("field two does not settle on " + SENTENCE[3]);
for (let i = 1; i < t1.length; i++) if (t1[i] <= t1[i - 1]) settleFaults.push("field one's ticks do not run forwards");
// the intervals GROW — that IS the deceleration, and a constant cycle is the regression
const gaps = t1.slice(1).map((v, i) => v - t1[i]);
if (!(gaps[gaps.length - 1] > gaps[0] * 2)) settleFaults.push("field one no longer decelerates");

console.log(JSON.stringify({
  ending, initials, fragments,
  stageTexts: STAGES.map((s) => stageText(s, fields)),
  tableFaults, beatFaults, phaseFaults, layoutFaults, settleFaults,
  reachedAll: reached.size === STAGES.length,
  stageCount: STAGES.length,
  pass: BEATS.end,
}));
"""
r = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS],
                   capture_output=True, text=True)
ok(r.returncode == 0, "the spec executed in node",
   f"the spec would not run: {r.stderr[-400:]}")

if r.returncode == 0:
    d = json.loads(r.stdout.strip().splitlines()[-1])

    # ---- 1 · the ending IS the brand, and its capitals are the four words --
    ok(d["ending"] == "FluOLinGo",
       "the animation ends on FluOLinGo — the spelling Dan made law",
       f"it ends on «{d['ending']}»; the brand is FluOLinGo, capitals F O L G")
    ok(d["initials"] == "FOLG",
       "the four capitals are the four words' own initials (F·O·L·G), derived and not typed",
       f"the surviving words' initials are «{d['initials']}», not FOLG — the name would no longer explain itself")
    # TWO assertions, not one. As one it reported "the fragments do not join to
    # …" when the join was perfect and only the COUNT was wrong (break-test 12,
    # which let a fifth word survive) — a failure message that sends the next
    # reader to look at the wrong thing is barely better than no message.
    ok("".join(d["fragments"]) == d["ending"],
       f"the name is exactly its fragments joined: {' + '.join(d['fragments'])}",
       f"the fragments {d['fragments']} do not join to «{d['ending']}»")
    ok(len(d["fragments"]) == 4,
       "the name is made of FOUR fragments — one per word of Fluency On Linguistic Goals",
       f"the name is made of {len(d['fragments'])} fragments ({d['fragments']}), not the four words it is named for")
    # AND THE OLD ENDING IS NOT THE ENDING. `Fluolingo` is still a legitimate
    # stage — the merge, one beat before the capitals — so this asserts its
    # POSITION, never its absence.
    ok(d["stageTexts"][-2] == "Fluolingo" and d["stageTexts"][-1] == "FluOLinGo",
       "the lowercase merge is the second-to-last stage and the name is the last",
       f"the last two stages are {d['stageTexts'][-2:]}; the merge must be followed by the naming, "
       "or the animation stops on a spelling that does not exist")

    # ---- 2..6 · the invariants -------------------------------------------
    ok(not d["tableFaults"],
       "the stage table only ever shrinks: keep never grows, step never goes backwards, no gap reopens",
       f"the stage table breaks its own rules: {d['tableFaults'][:3]}")
    ok(not d["beatFaults"],
       "every beat window runs forwards, and the beats are in order",
       f"the beat table is out of order: {d['beatFaults'][:3]}")
    ok(not d["phaseFaults"] and d["reachedAll"],
       f"phaseAt walks all {d['stageCount']} stages across the {d['pass'] / 1000:.1f}s pass, "
       "with no gap and no stage skipped",
       f"the timeline is not covered: {d['phaseFaults'][:2] or 'a stage is never reached'}")
    ok(not d["layoutFaults"],
       "a letter that does not survive takes NO width and sits on the seam it closed",
       f"the layout leaves holes: {d['layoutFaults'][:3]}")
    ok(not d["settleFaults"],
       "both cycling fields decelerate and stop on the word the sentence keeps",
       f"the cycling fields are wrong: {d['settleFaults'][:3]}")

# ---- 7 · the renderer owns no content --------------------------------------
# Assert what is ABSENT from the code, not what is present: a renderer that
# imports the spec and ALSO hardcodes a beat passes any "does it import?" test.
for word in ("linguistic", "customisable", "achieved"):
    ok(word not in view_src,
       f"the renderer does not carry the word «{word}» of its own",
       f"the renderer hardcodes «{word}» — the spec and the animation can now disagree")
stray_ms = [m for m in re.findall(r"\b(\d{4,5})\b", view_src) if 1000 <= int(m) <= 30000]
ok(not stray_ms,
   "no millisecond constant in the renderer — every beat comes from BEATS",
   f"the renderer carries its own timings {stray_ms[:3]}; the beat table would stop being the beat table")

# ---- 8 · FluOLinGo Hand, and only the weights the app loads -----------------
ok("cahier-hand" in view_src,
   "the animation is set in FluOLinGo Hand",
   "the animation no longer uses the hand — which is the whole of decision 4")
layout = read(LAYOUT)
loaded = set(re.findall(r'FluOlinGoHand-\w+\.woff2", weight: "(\d+)"', layout))
asked = set(re.findall(r'`(\d00) \$\{REF\}px', view_src)) | set(re.findall(r'fontWeight = t >= [^?]+\? "(\d+)" : "(\d+)"', view_src)[0] if re.search(r'fontWeight = t', view_src) else [])
ok(loaded and asked <= loaded,
   f"the animation asks only for weights the app actually loads ({sorted(loaded)})",
   f"it asks for {sorted(asked - loaded)}, which layout.tsx does not load — the browser would synthesise a fake bold")

# ---- 9 · reduced motion ----------------------------------------------------
ok("prefers-reduced-motion" in view_src and "requestAnimationFrame" in view_src,
   "the show is skipped for prefers-reduced-motion, and the name is drawn once",
   "reduced motion is not honoured — 14 seconds of movement is exactly what that setting is for")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
