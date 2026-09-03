#!/usr/bin/env python3
"""
SIO-010 pretest keys Enchantée for Léa, Enchanté for Marc; Libéria has its accent.

WHY THIS EXISTS. After the learner has just said she is Léa, the Unit-0 /
SpecuLearn pretest for SIO-010 keyed only `Enchanté !` / `Enchanté, madame.`
— masculine forms, no EN WHY, no role cue. The atelier two doors away already
has Léa say Enchantée. A learner who copied the green key left with the wrong
agreement for herself.

Dan + Pedagogy, 3 Sep: gender-conditioned keys, EN role cue before the guess
(`Léa · she`, never FR-only gender), EN WHY on the wrong form, reveal styling
wired into the existing grade UI. Masculine path (Marc) still keys Enchanté.

Libéria on the expert Letris list was spelled the English way (Liberia /
LIBERIA). Tile text already carries accents elsewhere (CÔTE D'IVOIRE, NÉPAL).

WHAT THIS ASSERTS

  1  Default bank (Léa) keys Enchantée / Enchantée, madame. on all three tabs.
     Enchanté is offered and is WRONG, with an EN WHY that names the woman /
     Enchantée pair.
  2  Marc path keys Enchanté / Enchanté, madame. Enchantée is the wrong option.
  3  The pretest renders the EN role cue (name · pronoun) before the guess,
     plus a --gram-fem / --gram-masc mark. No FR-only gender label.
  4  Reveal uses .cahier-hl + --gram-* on the keyed form and --dopa-miss /
     strike on the other — existing tokens, not a new grade system.
  5  Expert country tile is LIBÉRIA / Libéria. English meaning may stay
     Liberia. Bélarus / Birmanie / Cap-Vert are not thrashed.

Run from the repo root:  python3 verify/verify91-enchantee-liberia.py
"""
import json, os, re, subprocess, sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

BANK = "src/content/sios/unit0-questions.ts"
PRETEST = "src/components/Unit0Pretest.tsx"
EXPERT = "src/content/countries-expert-letris.json"
bank, pretest, expert = read(BANK), read(PRETEST), read(EXPERT)

ok(os.path.isfile(BANK), "unit0-questions.ts present", "MISSING unit0-questions.ts")
ok(os.path.isfile(PRETEST), "Unit0Pretest.tsx present", "MISSING Unit0Pretest.tsx")
ok(os.path.isfile(EXPERT), "countries-expert-letris.json present", "MISSING expert countries")

# ---- execute the bank: Léa default + Marc path ----------------------------
probe = """
const u = await import("../src/content/sios/unit0-questions.ts");
const lea = u.SIO010_SITUATIONS;
const marc = u.sio010SituationsFor(u.YOU_MARC);
function meet(sits) {
  return sits.map((s) => {
    const q = s.questions.find((x) => /exchanged names|given you their name/i.test(x.title ?? ""));
    return {
      key: s.key,
      title: q?.title ?? null,
      you: q?.you ? { name: q.you.name, pronoun: q.you.pronoun, gender: q.you.gender } : null,
      options: (q?.options ?? []).map((o) => ({ v: o.v, ok: o.ok, why: o.why ?? null, mark: o.mark ?? null })),
    };
  });
}
console.log("@@JSON@@" + JSON.stringify({
  leaYou: { name: u.YOU_LEA.name, pronoun: u.YOU_LEA.pronoun, gender: u.YOU_LEA.gender },
  marcYou: { name: u.YOU_MARC.name, pronoun: u.YOU_MARC.pronoun, gender: u.YOU_MARC.gender },
  lea: meet(lea),
  marc: meet(marc),
  leaForm: u.enchanteForm(u.YOU_LEA),
  marcForm: u.enchanteForm(u.YOU_MARC),
}));
"""
probe_path = "verify/_verify91_probe.mts"
open(probe_path, "w", encoding="utf-8").write(probe)
try:
    r = subprocess.run(
        ["node", "--experimental-strip-types", probe_path],
        capture_output=True, text=True, timeout=60,
    )
finally:
    if os.path.isfile(probe_path):
        os.remove(probe_path)

marker = [l for l in r.stdout.splitlines() if l.startswith("@@JSON@@")]
if not marker:
    print("  FAIL could not execute unit0-questions.ts:")
    print((r.stderr or r.stdout)[-2000:])
    sys.exit(1)
d = json.loads(marker[0][len("@@JSON@@"):])

ok(d["leaYou"] == {"name": "Léa", "pronoun": "she", "gender": "f"},
   "YOU_LEA is Léa · she",
   f"YOU_LEA drifted: {d['leaYou']}")
ok(d["marcYou"] == {"name": "Marc", "pronoun": "he", "gender": "m"},
   "YOU_MARC is Marc · he",
   f"YOU_MARC drifted: {d['marcYou']}")
ok(d["leaForm"] == "Enchantée" and d["marcForm"] == "Enchanté",
   "enchanteForm is Enchantée for Léa, Enchanté for Marc",
   f"enchanteForm drifted: lea={d['leaForm']} marc={d['marcForm']}")

ok(len(d["lea"]) == 3 and {m["key"] for m in d["lea"]} == {"informal", "formal", "group"},
   "all three SIO-010 tabs have a meet step (Léa)",
   f"Léa meet steps: {d['lea']}")

for row in d["lea"]:
    oks = [o["v"] for o in row["options"] if o["ok"]]
    wrongs = [o for o in row["options"] if not o["ok"]]
    want = "Enchantée, madame." if row["key"] == "formal" else "Enchantée !"
    other = "Enchanté, madame." if row["key"] == "formal" else "Enchanté !"
    ok(oks == [want],
       f"Léa {row['key']} keys {want}",
       f"Léa {row['key']} keys {oks} — want [{want}]")
    other_opt = next((o for o in wrongs if o["v"] == other), None)
    ok(other_opt is not None,
       f"Léa {row['key']} still offers {other} as a distractor",
       f"Léa {row['key']} dropped {other} — both forms must be on the card")
    why = (other_opt or {}).get("why") or ""
    ok("Enchantée" in why and re.search(r"\b(she|woman)\b", why, re.I) is not None
       and not re.search(r"\b(féminin|masculin|elle est)\b", why, re.I),
       f"Léa {row['key']} EN WHY names Enchantée + she/woman",
       f"Léa {row['key']} WHY is missing or not beginner-EN: {why!r}")
    ok(row["you"] == {"name": "Léa", "pronoun": "she", "gender": "f"},
       f"Léa {row['key']} meet step carries you = Léa · she",
       f"Léa {row['key']} meet step you={row['you']}")

for row in d["marc"]:
    oks = [o["v"] for o in row["options"] if o["ok"]]
    want = "Enchanté, madame." if row["key"] == "formal" else "Enchanté !"
    other = "Enchantée, madame." if row["key"] == "formal" else "Enchantée !"
    ok(oks == [want],
       f"Marc {row['key']} keys {want}",
       f"Marc {row['key']} keys {oks} — masculine path must still accept Enchanté")
    ok(any(o["v"] == other and not o["ok"] for o in row["options"]),
       f"Marc {row['key']} offers {other} as the wrong form",
       f"Marc {row['key']} lost the feminine distractor")

# Neither path marks both forms correct.
for label, rows in (("Léa", d["lea"]), ("Marc", d["marc"])):
    for row in rows:
        enchs = [o for o in row["options"] if "Enchanté" in o["v"]]
        ok(sum(1 for o in enchs if o["ok"]) == 1,
           f"{label} {row['key']} keys exactly one Enchanté(e) form",
           f"{label} {row['key']} keyed { [o['v'] for o in enchs if o['ok']] } — both-correct hides the point")

# ---- UI: role cue before the guess, EN, gram tokens -----------------------
ui = code(pretest)
ok("YouAreCue" in pretest and "RoleCue" in pretest,
   "the pretest mounts a You-are cue and a per-question role cue",
   "the role cue is gone — a beginner cannot see they are Léa · she before guessing")
ok("q.you" in ui and "RoleCue" in ui,
   "the per-question cue renders when the question carries `you`",
   "the role cue is gone from QuizQuestion")
# The cue is next to the prompt, not inside `{picked && …}`.
cue_line = next((ln for ln in pretest.splitlines() if "RoleCue" in ln and "q.you" in ln), "")
ok(bool(cue_line) and "picked" not in cue_line,
   "the question role cue is not gated on `picked` — readable before the guess",
   f"the role cue sits behind a pick: {cue_line!r}")
ok(re.search(r"\{you\.name\} · \{you\.pronoun\}", pretest) is not None,
   "the cue is `Name · she/he` — EN pronoun, not FR gender",
   "the cue no longer prints name · pronoun")
ok("--gram-fem" in pretest and "--gram-masc" in pretest,
   "the cue wears the existing --gram-fem / --gram-masc marks",
   "the gram tokens are unused — the small f/m mark is gone")
ok("féminin" not in pretest and '"masculin"' not in pretest,
   "no FR-only gender label in the pretest chrome",
   "the cue learned a French gender word — beginners don't have those yet")

# ---- reveal styling uses existing tokens ----------------------------------
ok("cahier-hl" in pretest and "--dopa-miss" in pretest and "line-through" in pretest,
   "reveal paints the keyed form with .cahier-hl and the miss with --dopa-miss + strike",
   "reveal styling for the Enchanté(e) pair is gone")

# ---- Libéria --------------------------------------------------------------
ok('"text": "LIBÉRIA"' in expert and '"displayName": "Libéria"' in expert,
   "expert tile is LIBÉRIA / Libéria",
   "Liberia is still unaccented on the expert list")
ok('"meaning": "Liberia"' in expert,
   "English meaning stays Liberia",
   "the English gloss was rewritten — leave it")
# Held naming: do not thrash these.
for held, tile in (("Biélorussie", "BIÉLORUSSIE"), ("Birmanie", "BIRMANIE"), ("Cap-Vert", "CAP-VERT")):
    ok(f'"displayName": "{held}"' in expert and f'"text": "{tile}"' in expert,
       f"{held} left as-is",
       f"{held} was rewritten — hold that naming")
ok("LIBERIA" not in expert and '"displayName": "Liberia"' not in expert,
   "no leftover unaccented LIBERIA / Liberia display form",
   "an unaccented Liberia string is still in the expert list")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
