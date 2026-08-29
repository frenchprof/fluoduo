#!/usr/bin/env python3
"""verify46 — every lesson that offers selectors actually honours them.

WHY THIS EXISTS
---------------
conjugaison-u1 proved the mechanism on one lesson (verify41). Fourteen more
now declare `dice.axes`, and the failure mode they share is invisible: a
generator that ignores its `pinned` argument compiles, renders, and looks in
source EXACTLY like one that honours it. The learner picks « Nous », gets
« Je », and concludes the dropdowns are decorative.

So this suite does not read the generators. It EXECUTES them.

WHAT IT ASSERTS

  1 · Every lesson with axes declares at least one, each with ≥2 options, and
      every option carries a value and a label.
  2 · Every declared axis key is READ by its generator (`pinned?.<key>` or
      `pinned.<key>` appears). A declared axis nothing reads is the exact bug
      above, caught statically and cheaply.
  3 · Pinning CHANGES the output. For each axis there must exist two option
      values whose sampled outputs are disjoint. "Exists a pair" rather than
      "all pairs" on purpose: pouvoir's « permission » pin only applies to a
      subject that could be asking, and falls back to a statement otherwise —
      a legitimate narrowing that all-pairs would call a failure.
  4 · An unpinned call still varies. A selector must not freeze the default
      run into one question, which is the other way to "honour" a pin badly.
  5 · The generators load under plain `node --experimental-strip-types` — no
      `@/` alias, since that is a bundler feature and would make every check
      here impossible to run.

Renumbered 43 -> 46 on 2026-08-29: it shipped as verify43 while
verify43-three-stops.py already held that number, and the workflow names a
number once — so this script was in the repo and never ran, which is the exact
trap its own session had renamed 42 -> 43 to avoid hours earlier. (The
colour-review session then picked 44, which was also taken, and moved to 45.
Three collisions in one day: check `ls verify/` before choosing.)

Run from the repo root:  python3 verify/verify46-lesson-axes.py
"""
import json
import os
import re
import subprocess
import sys

OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

NAT = "src/content/lessons/native"
PROBE = "verify/.verify46-probe.mjs"

# The lessons that carry selectors. Derived from the directory rather than
# typed out, so a new .gen.ts is covered the day it lands instead of the day
# someone remembers this file.
SLUGS = sorted(
    f[:-len(".gen.ts")] for f in os.listdir(NAT) if f.endswith(".gen.ts")
)
check(len(SLUGS) >= 14,
      f"{len(SLUGS)} steerable lessons found",
      f"only {len(SLUGS)} .gen.ts files — the selectors have been reverted")

# ---- 5 · nothing here may use the bundler alias ----------------------------
for slug in SLUGS:
    src = read(f"{NAT}/{slug}.gen.ts")
    check('from "@/' not in src,
          f"{slug}.gen.ts has no @/ alias",
          f"{slug}.gen.ts imports through @/ — node cannot resolve it, so this suite could not run")

# ---- drive the generators in node ------------------------------------------
probe = """
// Written by verify46. Executes every steerable generator across its own axes.
const SLUGS = %s;
const out = {};
for (const slug of SLUGS) {
  const mod = await import(`../src/content/lessons/native/${slug}.gen.ts`);
  const axes = Object.entries(mod).find(([k]) => k.endsWith("_AXES"))?.[1];
  const gen  = Object.entries(mod).find(([k]) => k.endsWith("Question") && typeof mod[k] === "function")?.[1];
  if (!axes || !gen) { out[slug] = { error: `no axes/generator export (${Object.keys(mod)})` }; continue; }
  const sig = (q) => `${q.correct}|${q.big}|${q.meta}`;
  // A generator that THROWS on some pin must be reported as that pin
  // generating nothing, not kill the whole run — otherwise the "every option
  // generates something" assertion can never go red and is decoration.
  const sample = (pin) => { try { return sig(gen(pin)); } catch { return null; } };
  const free = new Set();
  for (let i = 0; i < 400; i++) { const v = sample(undefined); if (v) free.add(v); }
  const byAxis = {};
  for (const ax of axes) {
    byAxis[ax.key] = {};
    for (const o of ax.options) {
      const s = new Set();
      for (let i = 0; i < 200; i++) { const v = sample({ [ax.key]: o.value }); if (v) s.add(v); }
      byAxis[ax.key][o.value] = [...s];
    }
  }
  out[slug] = {
    axes: axes.map((a) => ({ key: a.key, label: a.label, options: a.options })),
    free: free.size,
    byAxis,
  };
}
console.log("@@JSON@@" + JSON.stringify(out));
""" % json.dumps(SLUGS)

os.makedirs("verify", exist_ok=True)
open(PROBE, "w", encoding="utf-8").write(probe)
try:
    r = subprocess.run(["node", "--experimental-strip-types", PROBE],
                       capture_output=True, text=True, timeout=600)
finally:
    if os.path.isfile(PROBE):
        os.remove(PROBE)

marker = [l for l in r.stdout.splitlines() if l.startswith("@@JSON@@")]
if not marker:
    print("  FAIL the generators could not be executed:")
    print((r.stderr or r.stdout)[-2000:])
    sys.exit(1)
data = json.loads(marker[0][len("@@JSON@@"):])

for slug in SLUGS:
    d = data.get(slug, {})
    if "error" in d:
        FAIL.append(f"{slug}: {d['error']}")
        continue
    axes = d["axes"]

    # ---- 1 · the axes are real --------------------------------------------
    check(len(axes) >= 1,
          f"{slug} declares {len(axes)} axis/axes",
          f"{slug} declares an EMPTY axes array — the pager would draw a dropdown row with nothing in it")
    for ax in axes:
        check(len(ax["options"]) >= 2,
              f"{slug}.{ax['key']} offers {len(ax['options'])} options",
              f"{slug}.{ax['key']} has fewer than 2 options — a dropdown with one answer")
        check(all(o.get("value") and o.get("label") for o in ax["options"]),
              f"{slug}.{ax['key']} options all carry a value and a label",
              f"{slug}.{ax['key']} has an option missing its value or label")

    # ---- 2 · the generator READS each declared key -------------------------
    src = read(f"{NAT}/{slug}.gen.ts")
    for ax in axes:
        check(re.search(rf"pinned\??\.{re.escape(ax['key'])}\b", src) is not None,
              f"{slug}.{ax['key']} is read by the generator",
              f"{slug} declares axis '{ax['key']}' and never reads it — the dropdown would be decorative")

    # ---- 3 · pinning changes the output ------------------------------------
    for ax in axes:
        sets = {v: set(o) for v, o in d["byAxis"][ax["key"]].items()}
        vals = list(sets)
        disjoint = any(
            sets[a] and sets[b] and not (sets[a] & sets[b])
            for i, a in enumerate(vals) for b in vals[i + 1:]
        )
        check(disjoint,
              f"{slug}.{ax['key']} — pinning it changes what is generated",
              f"{slug}.{ax['key']} produces overlapping output for every pair of options over 200 samples "
              f"— the pin is being ignored")
        dead = [v for v in vals if not sets[v]]
        check(not dead,
              f"{slug}.{ax['key']} — every option generates something",
              f"{slug}.{ax['key']} option(s) {dead} generate NOTHING — a pin that empties or crashes the lesson")

    # ---- 4 · unpinned still varies -----------------------------------------
    check(d["free"] > 1,
          f"{slug} unpinned still varies ({d['free']} distinct in 400)",
          f"{slug} unpinned produces {d['free']} distinct question(s) — the selector froze the default run")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
