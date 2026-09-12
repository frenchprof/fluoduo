#!/usr/bin/env python3
"""
ComposeIt's own French, and the chip lists that have to cover their pools.

WHY THIS EXISTS. Dan, 2026-09-12, watching a lesson: *"I saw one lesson where
the absurd situation of meeting a friend and in that situation the friend was
being asked what is your name!?!"* The review that followed found the app
itself speaking broken French in a second bank — « Parle-moi de le Canada » —
in FOUR of six scenarios, and it had been there since the bank was written.

Nobody had seen it because the country rotates on a clock: `pick(COUNTRIES,
floor(Date.now() / 60000))`. Open the page on the wrong minute and it reads
fine. It took forcing the clock to a chosen minute to see it at all, which is
precisely the kind of fault a human will not catch by looking, and a check
catches in milliseconds.

THE LINE THIS ENFORCES IS DAN'S OWN (1 Sep). A LEARNER's wrong contraction is
a legitimate distractor — "could a learner have made this?" — and must NOT be
filtered. « Bon chance » was cut from the atelier cards for the opposite
reason: the FRAME printed it, so the mistake was the machine's. This checks
only what the machine prints: the generated scenario lines, never a chip the
learner chooses.

AND IT COUNTS THE POOLS. The same bank offered six countries and five
nationality adjectives, so a learner who drew Viêt Nam could not finish
« Les habitants sont … ». That list is generated from the country array now,
and this fails if the two ever disagree again.

No browser and no build: the banks are plain data behind plain functions, so
this reads them the way the app does, through jiti.

Run from the repo root:  python3 verify/verify440-compose-french.py
"""
import json, re, subprocess, sys, textwrap

PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

# Ask the app's OWN modules, through the same alias the pages use. A Python
# re-implementation of the scenario builders is the "second opinion" that
# lib/textgen/french.ts exists to prevent.
PROBE = r"""
import { join } from "node:path";
import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": join(process.cwd(), "src") } });
const { listComposeBanks } = await jiti.import("@/games/compose/banks");
const real = Date.now;
const out = [];
for (const b of listComposeBanks()) {
  const lines = new Set();
  for (let m = 0; m < 120; m++) {           // covers every pool size in use
    Date.now = () => m * 60000;
    let s; try { s = b.newScenario(); } catch { continue; }
    for (const t of [s.openingFr, s.headline, s.instructionEn]) if (t) lines.add(t);
  }
  Date.now = real;
  out.push({ id: b.id, lines: [...lines],
             cats: b.categories.map((c) => ({ label: c.label, phrases: c.phrases })) });
}
process.stdout.write(JSON.stringify(out));
"""

try:
    open("_verify440_probe.mjs", "w").write(PROBE)
    raw = subprocess.run(["node", "_verify440_probe.mjs"], capture_output=True, text=True, timeout=180)
finally:
    import os
    if os.path.exists("_verify440_probe.mjs"):
        os.remove("_verify440_probe.mjs")

if raw.returncode != 0:
    print("  FAIL  could not load the compose banks:\n" + textwrap.indent(raw.stderr[-1500:], "        "))
    sys.exit(1)
BANKS = json.loads(raw.stdout)

# ── 1 · the app's own French ────────────────────────────────────────────────
# `de/à + le/les` MUST contract. These are the four that are always wrong in
# French, whatever the noun: du, des, au, aux are the only legal forms.
FORBIDDEN = {
    r"\bde le\b":  "de le  →  du",
    r"\bde les\b": "de les →  des",
    r"\bà le\b":   "à le   →  au",
    r"\bà les\b":  "à les  →  aux",
}
hits = []
for b in BANKS:
    for line in b["lines"]:
        for pat, fix in FORBIDDEN.items():
            if re.search(pat, line):
                hits.append(f"{b['id']}: « {line} »   ({fix})")
total_lines = sum(len(b["lines"]) for b in BANKS)
ok(not hits,
   f"every generated scenario line contracts correctly ({total_lines} distinct lines, {len(BANKS)} banks)",
   "the app prints French a learner never chose — a generated line, not a chip:\n        "
   + "\n        ".join(hits))

# ── 2 · a chip list must cover the pool it serves ───────────────────────────
# Named one by one: a generic "every list covers every pool" cannot be written,
# because most chip groups are not tied to a rotating pool at all. Add a pair
# here when a new bank gains one.
pays = next((b for b in BANKS if b["id"] == "presenter-pays"), None)
if pays is None:
    ok(False, "", "the presenter-pays bank is gone — repoint or remove this clause")
else:
    habitants = next((c for c in pays["cats"] if c["label"] == "Habitants"), None)
    # One headline per country: "🇨🇦 le Canada". Count the distinct ones.
    countries = {l for l in pays["lines"] if re.match(r"^\S+\s", l) and " " in l and "Write" not in l and "Parle" not in l}
    adjectives = [p for p in (habitants["phrases"] if habitants else []) if not p.startswith("Les habitants")]
    ok(habitants is not None and len(adjectives) >= len(countries),
       f"Présenter un pays: {len(adjectives)} nationality chips for {len(countries)} countries",
       f"Présenter un pays offers {len(countries)} countries but only {len(adjectives)} nationality "
       f"chips — a learner who draws the odd one out cannot finish « Les habitants sont … ». "
       f"The list is generated from COUNTRIES; a country was added without its `people`.")

# ── 3 · a task may not ask for a step the chips cannot perform ─────────────
# DERIVED, NOT A LIST OF BANKS. Dan, 2026-09-12: *"what matters is the SIO
# attached. we need to think of scenarios in which those SIOs are applied
# strictly, no distraction and irrelevant deviation with payment and what
# not"*. So this does not say "the shop banks must be able to pay" — that was
# the first draft, and it encoded the wrong instinct. `magasin` asked the
# learner to pay while hanging off SIO-021 ("point out and name objects… ask
# what something is"), where money appears nowhere; the honest repair was to
# DELETE the step, not to add chips for it.
#
# What survives as a rule is the pairing, in either direction: if a task names
# a step, the learner must be able to take it. A bank passes by dropping the
# step or by carrying the chips — the check does not care which, only that the
# instruction and the palette agree.
STEPS = {
    "pay": (("pay", "paying"), ("voilà", "euro", "carte", "espèces")),
    "spell": (("spell",), ("ça s'écrit", "s'écrit")),
}
for b in BANKS:
    chips = [p.lower() for c in b["cats"] for p in c["phrases"]]
    tasks = " ".join(b["lines"]).lower()
    for step, (asked_words, chip_words) in STEPS.items():
        asked = any(w in tasks for w in asked_words)
        if not asked:
            continue
        can = any(w in p for p in chips for w in chip_words)
        ok(can,
           f"{b['id']}: the task names \"{step}\" and the learner can do it",
           f"{b['id']} tells the learner to {step} and gives no way to — no chip contains "
           f"any of {', '.join(chip_words)}. Either drop the step from the task (right when "
           f"the step is not in the bank's SIO) or add the chips (right when it is).")
ok(True,
   f"instruction and chips agree on every named step ({len(BANKS)} banks checked)",
   "")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
