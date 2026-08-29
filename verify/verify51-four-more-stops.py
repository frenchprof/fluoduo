#!/usr/bin/env python3
"""
Four more promises whose deck taught only the vocabulary (2026-08-29).

Dan asked for a fresh audit after the ten missing bug texts turned out to be
unrecoverable. Eight stops had a can-do naming an ACT and no lesson behind it.
**Three of the eight were not gaps at all** and this file records that, because
the finding that costs most is the false one:

  SIO-025  « Pourquoi ? »      — every card carries the question in its
                                 `example` field ("Pourquoi tu aimes le
                                 sport ?"). Both halves already taught.
  SIO-038  Getting around      — same shape ("Tu y vas en bus ?").
  SIO-039  Wants & needs       — the cards ARE the polite act ("Je voudrais un
                                 café."), not vocabulary for it.

That is the third time this session a deck looked empty because the teaching
was somewhere a literal search does not reach — frames, letris columns, and
now `example` fields. The four below are the ones that survived looking.

  SIO-013  "say AND ASK what someone is studying"
           -> 16 subject names sorted by article. « Quelle matière ? » is the
           deck's TITLE and appears on no card.

  SIO-036  "ask for AND give simple directions, without using commands"
           -> 8 verb phrases x 13 completions, all present tense, which is the
           GIVING half done well. « Quel est le chemin pour … ? » is, again,
           the title only.

  SIO-044  "shop for food, ask the price, ask politely, handle a market
           exchange ON EITHER SIDE of the stall" — four acts
           -> 14 shop NAMES sorted by article. None of the four.

  SIO-045A "the numbers 70 to 99, INCLUDING IN PRICES"
           -> 30 bare numerals. The words without the arithmetic, which is the
           only hard thing about the range.

What this asserts:

  1  Each of the four now has a lesson, and it leads that stop's rail.
  2  The three NON-gaps still have no lesson — asserted as an absence, so the
     next audit does not re-flag them and build a lesson on top of teaching
     that is already there (verify27: one goal, one lesson).
  3  The generators, EXECUTED: 12,000 cards well-formed, every cloze rebuilds
     its own sentence, every pin honoured.
  4  The rules each lesson exists for, checked as rules rather than as text:
       36   à + le -> au, à + les -> aux, and never an imperative — the
            can-do says "without using commands".
       13   the article never drops: « J'étudie LE français ».
       44   a quantity takes bare `de` — « un kilo de tomates », never « des ».
       45A  the arithmetic, against the known forms, and the -s that belongs
            to 80 alone.

Run from the repo root:  python3 verify/verify51-four-more-stops.py
"""
import json, os, re, subprocess, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

REG = "src/content/lessons.ts"
NAT = "src/content/lessons/native/index.tsx"
GENS = {
    "le-chemin": "SIO-036",
    "quelle-matiere": "SIO-013",
    "au-marche": "SIO-044",
    "soixante-dix": "SIO-045A",
}
for slug in GENS:
    p = f"src/content/lessons/native/{slug}.gen.ts"
    check(os.path.isfile(p), f"{slug} generator present", f"MISSING {p}")
    check(os.path.isfile(p.replace(".gen.ts", ".tsx")), f"{slug} Mémo present",
          f"MISSING {p.replace('.gen.ts', '.tsx')}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

reg, nat = read(REG), read(NAT)

# ---- 1 · each stop leads with its lesson ------------------------------------
for slug, sio in GENS.items():
    m = re.search(r'"%s":\s*\[([^\]]*)\]' % re.escape(sio), reg)
    listed = [s.strip().strip('"') for s in m.group(1).split(",")] if m else []
    check(bool(m) and listed and listed[0] == slug,
          f"{sio} leads with {slug}",
          f"{sio} does not lead with {slug} (has {listed or 'no lesson'})")
    check(f'"{slug}"' in reg and slug in nat,
          f"{slug} is registered in the gallery and the native index",
          f"{slug} is missing from LESSONS or NATIVE_LESSONS — the route 404s")

# ---- 2 · the three NON-gaps keep no lesson ---------------------------------
# An absence, deliberately. Their decks already teach both halves in the
# `example` field, and a lesson on top would be a second door onto one goal.
for sio, why in (("SIO-025", "every card carries « Pourquoi … ? » in its example"),
                 ("SIO-038", "every card carries « Tu y vas en … ? » in its example"),
                 ("SIO-039", "the cards are the polite act, not vocabulary for it")):
    m = re.search(r'"%s":\s*\[([^\]]*)\]' % sio, reg)
    check(m is None or not m.group(1).strip(),
          f"{sio} still has no lesson — it was never a gap ({why})",
          f"{sio} has been given a lesson, but it was not a gap: {why}. "
          "Re-read the deck's example fields before adding one.")

# ---- 3-4 · the generators, EXECUTED ----------------------------------------
JS = r"""
const B = "./src/content/lessons/native/";
const { cheminQuestion, ASKS, PLACES, aPlace } = await import(B + "le-chemin.gen.ts");
const { matiereQuestion, PEOPLE, SUBJECTS, withArticle } = await import(B + "quelle-matiere.gen.ts");
const { marcheQuestion, ROLES, GOODS } = await import(B + "au-marche.gen.ts");
const { soixanteQuestion, numberFor, KEYS, BANDS } = await import(B + "soixante-dix.gen.ts");
const norm = s => s.replace(/\s+/g, " ").replace(/\s+([?!.,])/g, "$1").trim();
const bad = [];
const w = m => { if (bad.length < 10) bad.push(m); };
function audit(q, l) {
  if (!q.easyOptions.includes(q.correct)) w(`${l}: answer not among its options`);
  if (new Set(q.easyOptions).size !== q.easyOptions.length) w(`${l}: repeated option`);
  if (q.easyOptions.length < 4) w(`${l}: only ${q.easyOptions.length} options`);
  if (new Set(q.med.choices).size !== q.med.choices.length) w(`${l}: repeated cloze choice`);
  if (norm(`${q.med.before} ${q.med.correct} ${q.med.after}`) !== norm(q.correct)) w(`${l}: cloze does not rebuild the answer`);
}
for (let i = 0; i < 3000; i++) {
  const q = cheminQuestion(); audit(q, "36");
  // NOT \bà le\b. `à` is not an ASCII word character, so there is no word
  // boundary between the space and it and the whole test never fires — this
  // assertion shipped vacuous and was caught by breaking aPlace and watching
  // it stay green. Fourth time this session; match the space, not the word.
  if (/(^|\s)à (le|les)(\s|$)/.test(q.correct)) w(`36 uncontracted à: ${q.correct}`);
  // "without using commands" — the graded answer is never an imperative.
  if (/^(Allez|Tournez|Prenez|Continuez|Traversez|Sortez)\b/.test(q.correct)) w(`36 imperative: ${q.correct}`);
}
for (let i = 0; i < 3000; i++) {
  const q = matiereQuestion(); audit(q, "13");
  // The article never drops: « J'étudie LE français ».
  if (!/(\ble |\bla |\bl'|\bles )/.test(q.correct)) w(`13 lost the article: ${q.correct}`);
}
for (let i = 0; i < 3000; i++) {
  const q = marcheQuestion(); audit(q, "44");
  if (/^Je veux\b/.test(q.correct)) w(`44 graded the rude form: ${q.correct}`);
}
for (let i = 0; i < 3000; i++) audit(soixanteQuestion(), "45A");
for (const a of ASKS) for (const p of PLACES) {
  const q = cheminQuestion({ ask: a.key, place: p.fr });
  audit(q, "36pin");
  if (q.correct !== a.build(p)) bad.push(`36 pin ignored: ${a.key}/${p.fr}`);
  if (a.key !== "cherche" && !q.correct.includes(aPlace(p))) bad.push(`36 lost the à-form: ${q.correct}`);
}
for (const p of PEOPLE) for (const s of SUBJECTS) {
  const q = matiereQuestion({ person: p.key, subject: s.fr });
  audit(q, "13pin");
  if (!q.correct.includes(withArticle(s))) bad.push(`13 pin ignored: ${p.key}/${s.fr} -> ${q.correct}`);
}
for (const r of ROLES) for (const g of GOODS) {
  const q = marcheQuestion({ role: r.key, good: g.fr });
  audit(q, "44pin");
  // A quantity takes bare `de` — « un kilo de tomates », never « des ».
  if (r.key === "client" && /\bdes \w|\bde (le|la|les) /.test(q.correct)) bad.push(`44 quantity took an article: ${q.correct}`);
}
for (const b of BANDS) for (const m of ["nombre", "prix"]) for (let k = 0; k < 40; k++) audit(soixanteQuestion({ band: b.key, mode: m }), "45Apin");

// 45A's arithmetic, against the forms themselves.
const EXP = { 70:"soixante-dix", 71:"soixante et onze", 75:"soixante-quinze",
              80:"quatre-vingts", 81:"quatre-vingt-un", 90:"quatre-vingt-dix",
              91:"quatre-vingt-onze", 95:"quatre-vingt-quinze", 99:"quatre-vingt-dix-neuf" };
for (const [n, e] of Object.entries(EXP)) if (numberFor(+n) !== e) bad.push(`numberFor(${n}) = ${numberFor(+n)}, expected ${e}`);
for (const n of KEYS) if (/undefined|NaN/.test(numberFor(n))) bad.push(`numberFor(${n}) = ${numberFor(n)}`);
// The -s belongs to 80 alone.
const withS = KEYS.filter(n => /quatre-vingts/.test(numberFor(n)));
console.log(JSON.stringify({ bad: bad.slice(0, 10), withS, count: KEYS.length }));
"""
r = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS],
                   capture_output=True, text=True)
check(r.returncode == 0, "the four generators executed in node",
      f"run failed: {r.stderr[-500:]}")
if r.returncode == 0:
    d = json.loads(r.stdout.strip().splitlines()[-1])
    check(not d["bad"], "12000 cards across stops 13, 36, 44 and 45A are well-formed",
          f"generated cards are wrong: {d['bad']}")
    check(d["withS"] == [80],
          "the -s of « quatre-vingts » belongs to 80 alone",
          f"the -s is on {d['withS']} — it goes the moment anything follows 80")
    check(d["count"] == 30, "45A covers all thirty numbers 70-99",
          f"45A covers {d['count']} numbers, expected 30")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
