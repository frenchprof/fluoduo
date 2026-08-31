#!/usr/bin/env python3
"""
No Sorting question prints its own answer.

Dan, 2026-08-31, on whether to keep Sorting: "it can be useful if phrased /
worded correctly". This is the wording. Three decks asked the learner to
choose a form that was sitting in the prompt:

    « Je mange du pain. »        DU · DE LA · DE L' · DES
    « en train »                 à — on foot · en — a vehicle
    « Il n'y a pas de café. »    ne … pas de/d' · ne … pas le/la/les · ne … plus

`partitifs` was ALL EIGHT of its questions — in the deck for the unit that
teaches the partitive. A learner with no French scores full marks by matching
letters. `transport` was 6 of 9, `negation-pas` 11 of 20.

`hideAnswer` in lib/practice/engine.ts blanks the correct column's form out of
the displayed prompt, so each becomes the question it was meant to be. 33 of
554 questions across 3 decks; the other 28 decks sort bare words and are
untouched.

WHY THIS RUNS THE REAL FUNCTION. verify55 shipped a version that
re-implemented its subject in Python, and stayed green when the code it was
guarding was deleted — it was testing the reimplementation. So this one
evaluates `hideAnswer` out of the engine source through node and asserts on
what the app will actually render.

Run from the repo root:  python3 verify/verify56-sorting-answers.py
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)

ENGINE = open(os.path.join(ROOT, "src/lib/practice/engine.ts"), encoding="utf-8").read()

# ── 1 · the engine must actually apply it ──────────────────────────────────
# Source-level, because a behavioural check on hideAnswer alone would stay
# green if toPracticeSet stopped calling it.
ok(re.search(r"fr:\s*hideAnswer\(item\.fr", ENGINE) is not None,
   "toPracticeSet renders the prompt through hideAnswer",
   "toPracticeSet no longer blanks the answer out of the prompt — every "
   "sentence deck goes back to printing the form it is asking for")
# The ASSIGNMENT, not the type declaration. `ttsText: string;` appears first in
# the file, so splitting on the bare key inspected the type and this assertion
# could not fail — found by break-testing it.
tts = re.search(r"ttsText:\s*correctFrame[\s\S]{0,200}?,\n", ENGINE)
ok(tts is not None and "hideAnswer" not in tts.group(0),
   "the spoken sentence is still the full one, not the blanked prompt",
   "ttsText is built from the blanked prompt — the learner would hear "
   "« Je mange ___ pain » read aloud as the correct answer")

# ── 2 · run the REAL hideAnswer over every deck ────────────────────────────
harness = r"""
const fs = require("node:fs");
const src = fs.readFileSync(process.argv[2], "utf8");
const body = src.slice(src.indexOf("const BLANK"), src.indexOf("export function toPracticeSet"));
eval(body.replace(/export function/g, "function").replace(/: string(\[\])?/g, ""));
const dir = process.argv[3];
const out = [];
for (const fn of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const c = JSON.parse(fs.readFileSync(dir + "/" + fn, "utf8"));
  const cols = c.gameConfig?.letris?.columns ?? [];
  if (cols.length < 2) continue;
  const lab = Object.fromEntries(cols.map((x) => [x.key, x.choiceLabel ?? x.label]));
  for (const it of c.items) {
    const t = (it.tags || []).find((x) => x.startsWith("col:"));
    if (!t || !lab[t.slice(4)]) continue;
    out.push({ deck: c.id, label: lab[t.slice(4)], others: Object.entries(lab).filter(([k]) => k !== t.slice(4)).map(([, v]) => v), shown: hideAnswer(it.fr, lab[t.slice(4)]) });
  }
}
console.log(JSON.stringify(out));
"""
hp = os.path.join(ROOT, "verify", ".verify56-harness.cjs")
open(hp, "w", encoding="utf-8").write(harness)
try:
    raw = subprocess.run(
        ["node", hp, os.path.join(ROOT, "src/lib/practice/engine.ts"),
         os.path.join(ROOT, "src/content/collections")],
        capture_output=True, text=True, timeout=90)
    rows = json.loads(raw.stdout) if raw.returncode == 0 else None
finally:
    if os.path.exists(hp): os.remove(hp)

ok(rows is not None and len(rows) > 400,
   f"{len(rows) if rows else 0} Sorting questions evaluated through the real hideAnswer",
   f"could not evaluate hideAnswer out of engine.ts — {(raw.stderr or '')[:160]}")
rows = rows or []

def fold(s):
    import unicodedata
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()

def forms(label):
    out = []
    for seg in label.split("—")[0].replace("___", " ").split("…"):
        alts = [re.sub(r"\s+", " ", p).strip() for p in seg.split("/")]
        alts = [a for a in alts if a]
        if not alts: continue
        lead = " ".join(alts[0].split(" ")[:-1])
        for i, a in enumerate(alts):
            out.append(f"{lead} {a}" if i and lead and " " not in a else a)
    return [f for f in set(out) if len(f) >= 2]

# THE RULE: after hideAnswer, no form that DISCRIMINATES the correct answer
# may survive in the prompt.
#
# Discriminates is the operative word, and the first version of this check got
# it wrong: it flagged « Je ne fais ___ tennis » for still containing "ne".
# But "ne" is in all three of that deck's labels — it gives nothing away,
# because every option starts with it. What must not survive is a form unique
# to the RIGHT answer, which is what makes the question answerable by matching
# letters instead of by knowing French.
def present(form, text):
    ff = fold(form)
    tail = "" if ff.endswith("'") else r"(?![a-z'])"
    return re.search(r"(?<![a-z'])" + re.escape(ff) + tail, text) is not None

guilty = []
for r in rows:
    flat = fold(r["shown"])
    shared = {fold(f) for lab in r["others"] for f in forms(lab)}
    for f in forms(r["label"]):
        if fold(f) in shared: continue          # every option has it
        if present(f, flat):
            guilty.append((r["deck"], r["shown"], f)); break
ok(not guilty,
   f"no question shows its own answer ({len(rows)} checked)",
   "these questions still print the form they ask for: "
   + "; ".join(f'{d}: {s!r} gives away {f!r}' for d, s, f in guilty[:4]))

# ── 3 · and it is not blanking things it should not ────────────────────────
# 28 of the 31 decks sort bare words; if the blank starts appearing there,
# something has become too eager.
blanked = {r["deck"] for r in rows if "___" in r["shown"]}
ok(blanked == {"partitifs", "transport", "negation-pas"},
   f"only the three sentence decks are blanked: {sorted(blanked)}",
   f"the blank now reaches {sorted(blanked)} — expected exactly partitifs, "
   f"transport and negation-pas; a word deck losing its prompt is over-eager "
   f"matching, not a fix")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
