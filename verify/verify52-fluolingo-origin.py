#!/usr/bin/env python3
"""
Where the name comes from — the animation holds its shape (2026-08-30).

  Fluency {achieved} on {customisable} linguistic goals  ->  Fluolingo

WHY THIS EXISTS. The first cut of this animation was rejected for one reason,
and it is a reason a screenshot catches and a description never does: it sat
on

    Flu   o   lin   go

with holes where the deleted letters used to be. Dan's note is exact about
why that is wrong. There are TWO operations in the show and they must look
different:

  reduction  letters leave, and the survivors close up to ONE ORDINARY SPACE
             (Fluency on linguistic goals -> Flu on lin go)
  merge      no letter leaves; the three ordinary spaces themselves close
             (Flu o lin go -> Fluolingo)

A wide gap is what you get when the two are smeared together — a reduction
that stops at the merge's spacing, or a stale word width nothing cleared. So
the guarantee this file exists to hold is: **a gap is one ordinary space or it
is zero, and there is nothing in between anywhere in the table.**

The second rule is the font size. Once the sentence has settled it must never
step back down; the phrase gets shorter at every stage, so the room that
frees is spent on size and never taken back. `step` counts the growth applied
so far and the renderer turns it into `base * (1 + growth) ** step` — so the
rule reduces to "step never decreases", which is arithmetic and checkable.

Neither rule can be checked from the rendered pixels in CI: there is no
browser here. Both CAN be checked from the layout arithmetic, which is why
`src/lib/fluolingoOrigin.ts` holds the stages, the beats and the placement
maths with no DOM anywhere in it, `fluolingoOriginRender.ts` is the renderer
in plain DOM, and `FluolingoOrigin.tsx` only mounts it. This file EXECUTES
the arithmetic module — under Node's type stripping, the
same code the browser runs, not a paraphrase of it.

What this asserts:

  1  The five stages read as exactly the five phrases Dan specified, and the
     last one is the word « Fluolingo » with no space in it.
  2  Every gap is one ordinary space (stages 0-3) or exactly zero (the merge).
     Executed against the layout function, fragment by fragment — this is the
     rejected `Flu   o   lin   go` state proved unreachable.
  3  A departed letter takes ZERO width and sits on the seam its phrase closed
     over, so no stale word width can survive to leave a hole behind.
  4  The growth step never decreases: the text never gets smaller.
  5  The two cycling lists are Dan's, in his order, and each ENDS on the word
     the sentence settles on — so the deceleration cannot stop on the wrong
     word.
  6  The cycling really decelerates: every interval is longer than the one
     before it, and the settled word is held longest.
  7  The beats run forwards, every hold is long enough to read the new phrase,
     and the final hold is the longest of all.
  8  The renderer takes all of the above FROM the module rather than keeping
     its own copy, and writes no CSS transition that would fight the frame
     loop or re-centre the phrase in one jump.

Run from the repo root:  python3 verify/verify52-fluolingo-origin.py
"""
import json, os, re, subprocess, sys, tempfile

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""
def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

LIB = "src/lib/fluolingoOrigin.ts"
REND = "src/lib/fluolingoOriginRender.ts"
COMP = "src/components/FluolingoOrigin.tsx"
PAGE = "src/app/hidden/fluolingo/page.tsx"
BUILD = "scripts/build-origin-html.mjs"
HTML = "work/fluolingo-origin/fluolingo-origin.html"

for p in (LIB, REND, COMP, PAGE, BUILD, HTML):
    check(os.path.isfile(p), f"{p} is there", f"MISSING {p}")
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL)); sys.exit(1)

# ---- run the real module ---------------------------------------------------
# Node 22 strips the types; the driver imports the SAME file the app imports,
# so nothing here is a restatement of the animation's rules.
DRIVER = r"""
import * as m from "%s";

// a measuring stub: every character one half-em, so a gap in the output is a
// gap the arithmetic put there and not a quirk of some font's metrics
const adv = () => 0.5;
const SPACE = adv(" ");

const stages = m.STAGES.map((s) => ({
  key: s.key, gap: s.gap, step: s.step, keep: [...s.keep], text: m.stageText(s),
}));

// fragment boxes, per stage, straight out of the layout function
const frames = m.STAGES.map((s) => {
  const L = m.layoutStage(s, m.SENTENCE, adv);
  const frags = [];
  m.SENTENCE.forEach((w, wi) => {
    const live = L.items.filter((it) => it.word === wi && !it.ghost);
    if (live.length) frags.push({ word: wi, x0: live[0].x, x1: live[live.length - 1].x + adv() });
  });
  // every departed letter: zero width, and parked on its fragment's seam
  const ghosts = L.items.filter((it) => it.ghost).map((it) => {
    const live = L.items.filter((o) => o.word === it.word && !o.ghost);
    const seam = live.length ? live[live.length - 1].x + adv() : null;
    return { key: it.key, x: it.x, seam };
  });
  const gaps = frags.slice(1).map((f, i) => f.x0 - frags[i].x1);
  const sumLive = L.items.filter((it) => !it.ghost).length * adv();
  return { key: s.key, gaps, width: L.width, sumLive, nFrags: frags.length, ghosts };
});

const t1 = m.cycleTicks(m.BEATS.cycleOneEnds, m.FIELD_ONE.length);
const t2 = m.cycleTicks(m.BEATS.cycleTwoEnds, m.FIELD_TWO.length);
const iv = (t) => t.slice(1).map((x, i) => x - t[i]);

console.log(JSON.stringify({
  stages, frames, SPACE,
  sentence: [...m.SENTENCE],
  one: [...m.FIELD_ONE], two: [...m.FIELD_TWO],
  slots: [...m.FIELD_SLOT],
  beats: JSON.parse(JSON.stringify(m.BEATS)),
  chipFade: [...m.CHIP_FADE],
  ticks: { one: t1, two: t2, ivOne: iv(t1), ivTwo: iv(t2),
           dwellOne: m.BEATS.cycleOneEnds - t1[t1.length - 1],
           dwellTwo: m.BEATS.cycleTwoEnds - t2[t2.length - 1],
           landsOne: m.cycleWordAt(m.BEATS.cycleOneEnds - 1, t1, m.FIELD_ONE),
           landsTwo: m.cycleWordAt(m.BEATS.cycleTwoEnds - 1, t2, m.FIELD_TWO) },
}));
""" % ("file://" + os.path.abspath(LIB))

with tempfile.TemporaryDirectory() as d:
    drv = os.path.join(d, "drive.mjs")
    open(drv, "w", encoding="utf-8").write(DRIVER)
    r = subprocess.run(
        ["node", "--experimental-strip-types", "--no-warnings", drv],
        capture_output=True, text=True)
check(r.returncode == 0 and r.stdout.strip().startswith("{"),
      "the animation module runs under Node's type stripping",
      f"the module would not execute: {(r.stderr or r.stdout)[-400:]}")
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL)); sys.exit(1)
D = json.loads(r.stdout)

# ---- 1 · the five phrases --------------------------------------------------
WANT = [
    "Fluency achieved on customisable linguistic goals",
    "Fluency on linguistic goals",
    "Flu on lin go",
    "Flu o lin go",
    "Fluolingo",
]
got = [s["text"] for s in D["stages"]]
check(got == WANT,
      "the five stages read as Dan's five phrases",
      f"the stages read {got}, not {WANT}")
check(" " not in got[-1] and got[-1] == "Fluolingo",
      "the show ends on « Fluolingo » — one word, no space in it",
      f"the last stage is {got[-1]!r}")

# the name is literally made of the pieces the sentence keeps
pieces = [w[:k] for w, k in zip(D["sentence"], D["stages"][-1]["keep"]) if k]
check("".join(pieces) == "Fluolingo" and pieces == ["Flu", "o", "lin", "go"],
      "Flu + o + lin + go — the name is the four surviving pieces, in order",
      f"the surviving pieces are {pieces}")

# ---- 2 · a gap is one space, or it is nothing ------------------------------
# THE rejected state. Every gap in every stage, measured off the layout.
gapmodes = {s["gap"] for s in D["stages"]}
check(gapmodes == {"space", "none"},
      "a stage's gap is « space » or « none » — the table offers no third width",
      f"the stage table carries gap modes {sorted(gapmodes)}")
check([s["gap"] for s in D["stages"]] == ["space"] * 4 + ["none"],
      "the four reductions keep one ordinary space; only the merge closes it",
      f"the gap modes run {[s['gap'] for s in D['stages']]}")

SP = D["SPACE"]
for st, fr in zip(D["stages"], D["frames"]):
    want = SP if st["gap"] == "space" else 0.0
    bad = [g for g in fr["gaps"] if abs(g - want) > 1e-9]
    check(not bad,
          f"{st['key']}: every gap is exactly "
          + ("one ordinary space" if want else "zero")
          + f" ({fr['nFrags']} pieces)",
          f"{st['key']}: gap(s) {[round(g / SP, 3) for g in bad]} x a space — "
          "this is the « Flu   o   lin   go » state the animation was rejected for")

merged = D["frames"][-1]
check(merged["gaps"] == [] or all(g == 0 for g in merged["gaps"]),
      "Fluolingo has zero residual spacing between Flu, o, lin and go",
      f"the merged word still carries gaps {merged['gaps']}")

# ---- 3 · a departed letter leaves nothing behind ---------------------------
for st, fr in zip(D["stages"], D["frames"]):
    stray = [g for g in fr["ghosts"] if g["seam"] is not None and abs(g["x"] - g["seam"]) > 1e-9]
    check(not stray,
          f"{st['key']}: every departed letter sits on the seam its phrase closed",
          f"{st['key']}: {[g['key'] for g in stray]} are parked off the seam — "
          "a survivor would have to travel through them")
    # width accounts for the survivors and the spaces between them, nothing else
    want = fr["sumLive"] + (SP if st["gap"] == "space" else 0) * max(0, fr["nFrags"] - 1)
    check(abs(fr["width"] - want) < 1e-9,
          f"{st['key']}: the phrase is exactly its survivors plus its spaces",
          f"{st['key']}: width {fr['width']:.4f} against {want:.4f} — "
          "a departed letter is still taking width")

# ---- 4 · the text never gets smaller ---------------------------------------
steps = [s["step"] for s in D["stages"]]
check(steps == sorted(steps),
      f"the growth step never decreases ({'→'.join(map(str, steps))}) — "
      "the settled sentence is the smallest the text ever is",
      f"the growth steps run {steps}: the text would shrink")
check(steps[0] == 0 and steps[-1] == len(steps) - 1,
      "one growth step per transformation, from the settled sentence on",
      f"the steps run {steps} for {len(steps)} stages")
comp = code(read(REND))
check(re.search(r"\(1 \+ grow\) \*\* STAGES\[\w+\]\.step", comp) is not None,
      "the renderer sizes every stage as base * (1 + growth) ** step",
      "the renderer no longer derives the size from the step — the "
      "never-shrink rule is not being applied")
check(re.search(r"Math\.max\(0, opts\.growth", comp) is not None,
      "a negative growth cannot be passed in to make the text shrink",
      "growth is not clamped: FluolingoOrigin growth={-0.1} would shrink the text")

# ---- 5 · the two cycling lists ---------------------------------------------
ONE = ["built", "developed", "enhanced", "cultivated", "fostered",
       "measured", "assessed", "evaluated", "achieved"]
TWO = ["your course’s", "named", "structured", "shared", "bespoke",
       "personal", "chosen", "tailored", "customisable"]
check(D["one"] == ONE, "the first field cycles Dan's nine words, in his order",
      f"the first field is {D['one']}")
check(D["two"] == TWO, "the second field cycles Dan's nine words, in his order",
      f"the second field is {D['two']}")
check(D["one"][-1] == D["sentence"][D["slots"][0]]
      and D["two"][-1] == D["sentence"][D["slots"][1]],
      "each list ends on the word its slot settles on (achieved · customisable)",
      "a list does not end on the word the settled sentence uses — the "
      "deceleration would stop on the wrong word")
check(D["ticks"]["landsOne"] == "achieved" and D["ticks"]["landsTwo"] == "customisable",
      "the cycling lands on « achieved » and « customisable »",
      f"it lands on {D['ticks']['landsOne']} / {D['ticks']['landsTwo']}")

# ---- 6 · it really decelerates ---------------------------------------------
for name in ("One", "Two"):
    iv = D["ticks"]["iv" + name]
    rising = all(b > a for a, b in zip(iv, iv[1:]))
    check(rising,
          f"field {name.lower()} decelerates: {len(iv)} intervals, "
          f"{iv[0]:.0f}ms to {iv[-1]:.0f}ms, every one longer than the last",
          f"field {name.lower()} does not decelerate monotonically: "
          f"{[round(x) for x in iv]}")
    check(D["ticks"]["dwell" + name] >= iv[-1],
          f"field {name.lower()} holds its final word longest of all",
          f"field {name.lower()} rushes off its final word "
          f"({D['ticks']['dwell' + name]:.0f}ms against a {iv[-1]:.0f}ms interval)")

# ---- 7 · the beats ---------------------------------------------------------
B = D["beats"]
order = [
    ("cycling starts", 0),
    ("field one stops", B["cycleOneEnds"]),
    ("field two stops", B["cycleTwoEnds"]),
    ("the sentence has been read", B["holdSentenceEnds"]),
    ("the fields leave", B["reduceFields"][1]),
    ("Fluency on linguistic goals has been read", B["holdUnfilledEnds"]),
    ("the words are clipped", B["reduceWords"][1]),
    ("Flu on lin go has been read", B["holdClippedEnds"]),
    ("on is clipped", B["reduceOn"][1]),
    ("Flu o lin go has been read", B["holdShortenedEnds"]),
    ("the spaces close", B["merge"][1]),
    ("the end", B["end"]),
]
ts = [t for _, t in order]
check(ts == sorted(ts) and len(set(ts)) == len(ts),
      "the beats run forwards, one after another, none of them coincident",
      f"the beats are out of order: {list(zip([n for n, _ in order], ts))}")

HOLDS = [
    ("the finished sentence", B["cycleTwoEnds"], B["holdSentenceEnds"]),
    ("Fluency on linguistic goals", B["reduceFields"][1], B["holdUnfilledEnds"]),
    ("Flu on lin go", B["reduceWords"][1], B["holdClippedEnds"]),
    ("Flu o lin go", B["reduceOn"][1], B["holdShortenedEnds"]),
    ("Fluolingo", B["merge"][1], B["end"]),
]
for name, a, b in HOLDS:
    check(b - a >= 600,
          f"« {name} » is held {b - a}ms — long enough to read before it changes",
          f"« {name} » is held only {b - a}ms: the transformation would read as a cut")
final = B["end"] - B["merge"][1]
check(final == max(b - a for _, a, b in HOLDS) and final >= 2000,
      f"the finished name is held longest of all ({final}ms)",
      f"the final hold is {final}ms — not the longest of the five")

# the survivors take their colours BEFORE the letters they keep are cut, which
# is what explains where Flu + o + lin + go came from
check(B["bloom"][1] <= B["reduceWords"][0] and B["bloom"][0] >= B["reduceFields"][1],
      "the surviving pieces colour up in the hold BEFORE the words are clipped",
      f"the colour bloom {B['bloom']} does not sit inside the hold "
      f"{B['reduceFields'][1]}-{B['reduceWords'][0]}")
# the field chips belong to the cycling, and go with it
check(D["chipFade"][0] >= B["holdSentenceEnds"] and D["chipFade"][1] <= B["reduceFields"][1],
      "the two field chips last exactly as long as the fields do",
      f"the chip fade {D['chipFade']} outlives the fields it marks")

# ---- 8 · one renderer, mounted twice ---------------------------------------
for name in ("STAGES", "BEATS", "layoutStage", "cycleTicks", "widestSentenceEm"):
    check(re.search(rf"\b{name}\b", comp) is not None,
          f"the renderer takes {name} from the module",
          f"the renderer does not use {name} — it may be keeping its own copy")
for phrase in ("Fluolingo", "linguistic", "customisable"):
    check(f'"{phrase}"' not in comp and f"'{phrase}'" not in comp,
          f"« {phrase} » is not written into the renderer as a literal",
          f"the renderer hard-codes « {phrase} » — two copies of the phrase "
          "will drift, and this check only guards one of them")
check("transition" not in comp,
      "no CSS transition on the glyphs — the frame loop is the only thing "
      "moving them, so no stage can be re-centred in a single jump",
      "the renderer sets a CSS transition: it would fight the frame loop")
# every colour is a token: the renderer holds no hex of its own, so the palette
# stays one file's business and verify19b's ratchet stays honest
check(not re.search(r"#[0-9a-fA-F]{3,8}\b", comp),
      "the renderer carries no raw colour — every hue is a --fluo-origin-* token",
      "the renderer hard-codes a colour: the palette now lives in two places")
css = read("src/app/globals.css")
# the ground is the host's own background, so the mount sets it; the rest are
# per-glyph and belong to the engine
users = comp + read(COMP) + read(BUILD)
for token in ("ground", "flu", "o", "lin", "go", "field-1", "field-2"):
    name = f"--fluo-origin-{token}"
    check(name in css and name in users,
          f"{name} is declared in globals.css and used",
          f"{name} is missing from globals.css or used by nothing")
check("var(--fluo-ink)" in comp,
      "the un-coloured letters are the site's own ink",
      "the renderer does not take its ink from --fluo-ink")

check(re.search(r"centreX - \(L\.width \* size\) / 2", comp) is not None,
      "every stage is laid out from its own centre, so neither edge is the anchor",
      "the phrase is no longer centred on its own width — one side will read "
      "as the fixed anchor")

page = code(read(PAGE))
check("FluolingoOrigin" in page and "@/components/FluolingoOrigin" in page,
      "/hidden/fluolingo mounts the animation",
      "the preview page does not mount FluolingoOrigin — the animation ships "
      "with nowhere to watch it")

# The React component must stay a MOUNT. The engine is plain DOM so the same
# code can be compiled into a standalone page; the moment any of the layout
# maths creeps back into the .tsx there are two renderers, and only one of them
# is the one being watched.
tsx = code(read(COMP))
check("mountOrigin" in tsx,
      "the React component mounts the shared engine rather than owning one",
      "FluolingoOrigin.tsx no longer calls mountOrigin — the renderer has "
      "been forked back into the component")
for owned in ("layoutStage", "cycleTicks", "requestAnimationFrame", "getComputedStyle"):
    check(owned not in tsx,
          f"the component leaves {owned} to the engine",
          f"FluolingoOrigin.tsx calls {owned}: the engine is being duplicated "
          "in React, and the standalone page will drift from the app")

# The standalone file is a build output, and a stale one is worse than none:
# it is the copy that gets opened and sent on. Regenerate and compare.
build = read(BUILD)
check("fluolingoOriginRender" in build and "fluolingoOrigin.ts" in build,
      "the standalone page is compiled from the app's own two modules",
      "the build script no longer compiles the app's modules — the shared "
      "page would be a second implementation")
before = read(HTML)
r2 = subprocess.run(["node", BUILD], capture_output=True, text=True)
check(r2.returncode == 0,
      "scripts/build-origin-html.mjs runs",
      f"the standalone build failed: {(r2.stderr or r2.stdout)[-400:]}")
check(read(HTML) == before,
      f"{HTML} is current — it is the same code the app runs",
      f"{HTML} is STALE: re-run `node {BUILD}` and commit the result")
check("<script" in before and "src=" not in before.split("<style>")[0],
      "the standalone page is self-contained — no server, no network, one file",
      "the standalone page pulls something in from outside itself")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
