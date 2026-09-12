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
  const lines = new Set(); const heads = new Set(); const uses = new Set(); const models = new Set();
  for (let m = 0; m < 120; m++) {           // covers every pool size in use
    Date.now = () => m * 60000;
    let s; try { s = b.newScenario(); } catch { continue; }
    for (const t of [s.openingFr, s.headline, s.instructionEn, s.model?.text, ...(s.prompts ?? []).map((q) => q.ask)])
      if (t) lines.add(t);
    if (s.headline) heads.add(s.headline);
    for (const q of s.prompts ?? []) if (q.use) uses.add(q.use);
    if (s.model?.text) models.add(s.model.text);
  }
  Date.now = real;
  out.push({ id: b.id, lines: [...lines], heads: [...heads], uses: [...uses], models: [...models],
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

# ── 1b · a generated line starts with a capital ─────────────────────────────
# Found by driving the finished flow: the model paragraph opened « le Canada ? »
# because `countryName()` returns the mid-sentence form. Same species as the
# contraction — the app printing French nobody chose — and invisible in the
# template, which reads perfectly well.
lower = [f"{b['id']}: « {l} »" for b in BANKS for l in b["lines"]
         if l and l[0].islower() and l[0].isalpha()]
ok(not lower,
   "every generated line opens with a capital",
   "a generated line starts lower-case — correct mid-sentence, wrong as the "
   "first word:\n        " + "\n        ".join(lower))

# ── 2 · a chip list must cover the pool it serves ───────────────────────────
# THE POOLS THAT ARE ONE-PER-COUNTRY. Named one by one: a generic "every list
# covers every pool" cannot be written, because most chip groups are not tied to
# a rotating pool at all. Add a pair here when a new bank gains one.
pays = next((b for b in BANKS if b["id"] == "presenter-pays"), None)
if pays is None:
    ok(False, "", "the presenter-pays bank is gone — repoint or remove this clause")
else:
    # ONE HEADLINE PER COUNTRY — taken from the `headline` field itself, not
    # guessed at from the shape of every generated line. The first draft did
    # guess, and the moment the bank started emitting four prompts and a model
    # it counted 12 countries where there are 6. A heuristic over text that the
    # content is free to change is not a measurement.
    countries = set(pays["heads"])
    by_label = {c["label"]: c["phrases"] for c in pays["cats"]}
    # group          the frames, which are not pool members    what it lets a learner do
    ONE_EACH = {
        "Le pays":   (("C'est",),               "name the country"),
        "Habitants": (("Les habitants sont",),   "finish « Les habitants sont … »"),
        "Un fait":   ((),                        "state one fact about it"),
    }
    for label, (frames, need) in ONE_EACH.items():
        pool = [p for p in by_label.get(label, []) if p not in frames]
        ok(len(pool) >= len(countries),
           f"Présenter un pays · [{label}]: {len(pool)} chips for {len(countries)} countries — a learner can {need}",
           f"Présenter un pays · [{label}] carries {len(pool)} chips for {len(countries)} countries: whoever "
           f"draws the odd one out cannot {need}. These lists are generated from COUNTRIES — a country was "
           f"added without its field, or the group holds only the frame and none of the words that go in it.")

# ── 2c · a bank may not teach a word its own deck does not ──────────────────
# THE HAND-WRITTEN LIST IS THE ONE THAT DRIFTS. `Aux objets trouvés` takes its
# twenty nouns straight off `objets-articles`, so it cannot disagree with the
# deck — but `Les quatre repas` picks TWENTY of the forty-two entries in
# `aliments` by hand, because the deck carries de la farine, du sel and de
# l'huile, which are ingredients rather than meals, and a forty-chip group is a
# wall rather than a palette. A named subset is the right answer there; this is
# what makes it safe. Edit the deck, rename an item, and the bank fails here
# instead of silently offering a word the learner has never been taught.
DECK_BACKED = {
    "repas":   ("src/content/collections/aliments.json",         ("À manger", "À boire", "Le repas")),
    "magasin": ("src/content/collections/objets-articles.json",  ("Les objets",)),
}
for bank_id, (deck_path, labels) in DECK_BACKED.items():
    bank = next((b for b in BANKS if b["id"] == bank_id), None)
    if bank is None:
        ok(False, "", f"the {bank_id} bank is gone — repoint or remove this clause")
        continue
    with open(deck_path, encoding="utf-8") as fh:
        deck = json.load(fh)
    # Match on the bare noun: the meal chips are « Au petit-déjeuner » where the
    # deck says « le petit-déjeuner », because one is a sentence opener and the
    # other a dictionary entry. Stripping the article from both is what lets a
    # generated contraction be compared with the deck that feeds it.
    bare = lambda t: re.sub(r"^(au |à la |à l'|aux |le |la |les |l'|un |une |des |du |de la |de l')", "", t.strip().lower())
    known = {bare(i["fr"]) for i in deck["items"]}
    chips = [p for c in bank["cats"] if c["label"] in labels for p in c["phrases"]]
    unknown = [p for p in chips if bare(p) not in known]
    ok(chips and not unknown,
       f"{bank_id}: all {len(chips)} chips are words {deck['id']} teaches",
       (f"{bank_id}: the named groups {labels} are empty — the labels were renamed "
        f"and this clause stopped measuring anything" if not chips else
        f"{bank_id} offers {len(unknown)} chip(s) its own deck ({deck['id']}) does not teach: "
        + ", ".join(f"« {p} »" for p in unknown)))

# ── 2a · the model must be buildable from the chips ─────────────────────────
# THIS IS THE CLAUSE THAT COUNTS [Situer] AND [Langues], and it does it without
# a number. Six countries sit on four continents and share languages, so those
# two pools are smaller than the country list by design and a >= count would be
# wrong. What is actually required is stronger and simpler to state: the model
# paragraph the learner is shown must be assemblable, word for word, out of the
# chips they are given. A model written in French the palette cannot produce is
# a wall, not a model.
#
# It is also the clause that would have caught the two holes driving the app
# found by hand. Before that patch, « C'est quel pays ? » had no country name
# to tap and « On y parle quelle langue ? » had « On parle » and then nothing —
# a learner with no French was stuck on two of the four questions, and the
# nationality count sailed through green.
#
# IT RUNS OVER EVERY BANK THAT HAS A MODEL, from the `model.text` field itself.
# The first draft took the models to be "any generated line with three full
# stops", which worked while one bank had one — and would have quietly stopped
# testing anything the day a model was written as two sentences.
def buildable(text, chips):
    """Greedy longest-chip match. Returns the first remainder it cannot cover.

    CASE AND COMMAS COUNT; only sentence-final marks are dropped. The first
    draft lowercased and stripped commas, and driving the finished screens
    found two things it had waved through — both of them the model showing
    French the chips cannot actually make:

        model   « Au petit-déjeuner, je mange du pain »   the bank had no comma chip
        model   « …beau mais c'est nuageux »              the chip is « C'est nuageux »,
                                                          so the learner gets a capital
                                                          in the middle of their sentence

    Neither is a typo in the model; both are the palette and the model
    disagreeing, which is the exact thing this clause exists to catch. A full
    stop is different — the composer adds those between committed sentences,
    so no chip ever carries one.
    """
    strip = str.maketrans({c: " " for c in ".!?;:"})
    norm = lambda t: " ".join(t.translate(strip).split())
    rest, pool = norm(text), sorted({norm(c) for c in chips if norm(c)}, key=len, reverse=True)
    while rest:
        hit = next((c for c in pool if rest.startswith(c)), None)
        if not hit:
            return rest
        rest = rest[len(hit):].lstrip()
    return None

models = []
for b in BANKS:
    chips = [p for c in b["cats"] for p in c["phrases"]]
    for text in b["models"]:
        models.append((b["id"], text, buildable(text, chips)))
stuck = [f"{i}: « {l} »\n            first word the chips cannot make: « {r} »"
         for i, l, r in models if r]
ok(models and not stuck,
   f"every model paragraph is buildable from the bank's own chips "
   f"({len(models)} models, {len({m[0] for m in models})} banks)",
   ("no model paragraph was found to test — the clause is measuring nothing"
    if not models else
    "a model shows the learner French their chips cannot produce:\n        " + "\n        ".join(stuck)))

# ── 2b · a question must point at a group that exists ──────────────────────
# A prompt's `use` floats one chip group to the top — the whole of the guidance
# a learner with no French gets. ComposeSolo falls back to the bank's own order
# when the label matches nothing, so a typo or a renamed group does not throw,
# does not warn, and does not look different on any single screenshot: the
# guidance is simply gone. The check that a string equals a label is the only
# thing standing between a rename and a silently unguided exercise.
bad_use = [f"{b['id']}: prompt names group « {u} », which does not exist "
           f"(groups: {', '.join(c['label'] for c in b['cats'])})"
           for b in BANKS for u in b["uses"]
           if u not in {c["label"] for c in b["cats"]}]
guided = sum(len(b["uses"]) for b in BANKS)
ok(not bad_use,
   f"every question points at a chip group that exists ({guided} bindings)",
   "a question steers the learner at a group that is not there — the guidance "
   "silently falls back to the bank's own order:\n        " + "\n        ".join(bad_use))

# ── 2d · every bank has a persona on the server ─────────────────────────────
# THE SILENT WRONG ANSWER. functions/api/compose.js resolves the persona as
# `SCENES[body.scene] || SCENES.cafe`, so a bank whose id has no entry there
# does not error — it gets THE CAFÉ WAITER, menu and all. On 2026-09-12 eight
# of the fourteen banks were in that state: « Au restaurant » was run by the
# café's waiter off the café's menu, and the "check my work" pass on a written
# country paragraph was a waiter being handed four sentences about le Viêt Nam.
# Nothing threw, nothing 500'd, and no screenshot of any page looked wrong.
#
# The fallback is worth keeping — a scene that 500s is worse than one that
# improvises — but only because this clause makes it unreachable.
API = "functions/api/compose.js"
with open(API, encoding="utf-8") as fh:
    api = fh.read()
# Top-level keys of the SCENES object: two-space indent, bare or quoted.
personas = set(re.findall(r'^  "?([a-z][a-z-]*)"?: \{', api, re.M))
orphans = [b["id"] for b in BANKS if b["id"] not in personas]
ok(not orphans,
   f"every bank has its own persona in {API} ({len(personas)} scenes, {len(BANKS)} banks)",
   f"{len(orphans)} bank(s) have no persona and would silently get the café waiter — "
   + ", ".join(orphans)
   + f". Add a SCENES entry in {API}; the fallback is `SCENES[scene] || SCENES.cafe`, "
     "so this never shows up as an error.")

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
        # WORD BOUNDARIES, because "pay" is inside "pays" — French for
        # *country*. Without them this reported "presenter-pays: the task names
        # pay and the learner can do it", a cheerful PASS about a step that
        # bank has never had. A substring match over natural language is a
        # false green waiting to happen.
        asked = any(re.search(rf"\b{re.escape(w)}\b", tasks) for w in asked_words)
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
