#!/usr/bin/env python3
"""
Stops that promised an act and taught only its vocabulary (2026-08-28).

Started as three. It is nine now — the same shape kept turning up, so rather
than a new file per batch the sections accumulate here. The filename still says
`three`; renaming it means re-wiring the workflow, and verify-wiring makes a
stale name harmless while a stale NUMBER is not.

Numbered 45. It was 42, then 43, and collided both times with a file the
colour-review session shipped in parallel (verify42-sio-source, then
verify43-lesson-axes). Two files sharing a number is how verify31-wordrill sat
unwired for a fortnight — the workflow names the number once and nobody
notices the other never runs. verify-wiring now makes that impossible to repeat.

WHY THIS EXISTS. An audit of all fifty can-do statements against the decks
behind them found the same shape three times: the stop names something the
learner will DO, and the deck teaches only the words that act needs.

  SIO-003  "say how a name is spelled, OR ASK how it is spelled"
           -> 26 letter cards, A to Z. « s'écrit » appeared once, in the Mémo.
           No lesson at all. And SIO-010's atelier then asks the learner to
           PERFORM « Comment ça s'écrit ? » — the phrase this stop owed them.

  SIO-017  "say WHICH LANGUAGE(S) ARE SPOKEN IN A GIVEN COUNTRY"
           -> 19 language NAMES. « parle » appeared once. Nothing anywhere
           joined a country to its language, which is the whole promise.

  SIO-018  "numbers 20-69 IN SIMPLE EXCHANGES (ages, prices, quantities)"
           -> 15 bare numerals. Zero occurrences of `ans`, `euro`, `€`, `prix`.

Dan's call, 2026-08-28: "3, 17, 18 fill the content." Three lessons were
written. This holds them to the promise that justified them.

The SIO freeze is NOT engaged: sios.json's only edit is SIO-002's can-do, and
Dan dictated that wording himself ("depending on whom I am addressing"), which
is the markup the freeze exists to wait for.

What this asserts:

  1  Each stop now HAS a lesson, and it leads that stop's rail.
  2  SIO-010 does NOT list the spelling lesson, though it depends on it.
     Making the dependency explicit was my first instinct and it was wrong:
     verify27 (from #44) holds one goal to one lesson, and a stop leading with
     another stop's lesson opens on someone else's screen. The atelier meets
     the phrase in its own model dialogue, which is what a production stop
     opens on. Asserted as an ABSENCE so the mistake cannot come back.
  3  The lessons actually teach the promised act, checked by EXECUTING each
     generator rather than reading it: every question is well-formed, its
     cloze reassembles into the graded sentence, and no option list repeats
     itself.
  4  The country->language data stays inside what the course teaches: every
     language is one of SIO-017's own 19 cards, and every country is one of
     SIO-016's 25. Filling a gap with a second gap is not filling it.
  5  The prepositions are right (en / au / aux / à), which the sentence cannot
     avoid choosing.
  6  SIO-011's « aussi / non plus » follows the polarity of the sentence it
     answers, and no preposition has crept back in (Dan, 29 Aug).
  7  The five stops filled on 29 Aug — 4, 7, 8, 21, 34 — each hold the rule
     Dan set for them, executed rather than read:
       4   « On est mardi. » / « C'est le matin. »
       7   counting, stopping AT TEN, plus « Il y a combien d'étudiants ? »
       8   exactly two lines: « Pardon, on fait quoi ? » and « Répétez s'il
           vous plaît. » Nothing else — "this is unit 0 for pete's sake".
       21  « C'est une gomme. » / « Ce sont des téléphones. »
       34  two places in ONE sentence, which is the stop's promise and the
           one thing its deck never did — with the contraction (de+le -> du,
           de+les -> des) that « loin de le parc » exists to prevent.

Run from the repo root:  python3 verify/verify48-three-stops.py
"""
import json, os, re, subprocess, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""
def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

REG = "src/content/lessons.ts"
NAT = "src/content/lessons/native/index.tsx"
GENS = {
    "moi-aussi": "src/content/lessons/native/moi-aussi.gen.ts",
    "ca-secrit": "src/content/lessons/native/ca-secrit.gen.ts",
    "langues-pays": "src/content/lessons/native/langues-pays.gen.ts",
    "nombres-echanges": "src/content/lessons/native/nombres-echanges.gen.ts",
    # The five stops filled 29 Aug, on Dan's rulings (see section 7).
    "quel-jour": "src/content/lessons/native/quel-jour.gen.ts",
    "combien": "src/content/lessons/native/combien.gen.ts",
    "on-fait-quoi": "src/content/lessons/native/on-fait-quoi.gen.ts",
    "qu-est-ce-que-c-est": "src/content/lessons/native/qu-est-ce-que-c-est.gen.ts",
    "ou-est": "src/content/lessons/native/ou-est.gen.ts",
}
for slug, p in GENS.items():
    check(os.path.isfile(p), f"{slug} generator present", f"MISSING {p}")
    check(os.path.isfile(p.replace(".gen.ts", ".tsx")), f"{slug} Mémo present",
          f"MISSING {p.replace('.gen.ts', '.tsx')}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

reg, nat = read(REG), read(NAT)

# ---- 1-2 · each stop has its lesson, and it leads -------------------------
for sio, slug in (("SIO-003", "ca-secrit"), ("SIO-017", "langues-pays"),
                  ("SIO-018", "nombres-echanges"), ("SIO-011", "moi-aussi"),
                  ("SIO-004", "quel-jour"), ("SIO-007", "combien"),
                  ("SIO-008", "on-fait-quoi"), ("SIO-021", "qu-est-ce-que-c-est"),
                  ("SIO-035", "ou-est")):
    m = re.search(r'"%s":\s*\[([^\]]*)\]' % sio, reg)
    listed = [s.strip().strip('"') for s in m.group(1).split(",")] if m else []
    check(bool(m) and listed and listed[0] == slug,
          f"{sio} leads with {slug}",
          f"{sio} does not lead with {slug} (has {listed or 'no lesson'}) — the stop "
          "opens on someone else's lesson, or on none")
    check(f'"{slug}"' in reg and slug in nat,
          f"{slug} is registered in both the gallery and the native index",
          f"{slug} is missing from LESSONS or NATIVE_LESSONS — the route 404s")

# The atelier depends on `ca-secrit` but must not LEAD with it — one goal, one
# lesson (verify27). I made exactly this mistake and the rule caught it.
_m10 = re.search(r'"SIO-010":\s*\[([^\]]*)\]', reg)
check(not _m10 or "ca-secrit" not in _m10.group(1),
      "SIO-010 does not borrow SIO-003's lesson (one goal, one lesson)",
      "SIO-010 leads with `ca-secrit` — a production stop opening on another "
      "stop's lesson is exactly what verify27 forbids")

# ---- 3-5 · the generators, EXECUTED --------------------------------------
# Read, not executed, is not enough: a generator that produces malformed French
# or a cloze that does not rebuild its own sentence looks fine in source.
JS = r"""
import { caSecritQuestion, NAMES } from "./src/content/lessons/native/ca-secrit.gen.ts";
import { languesPaysQuestion, PLACES, bareLang } from "./src/content/lessons/native/langues-pays.gen.ts";
import { nombresQuestion, NUMBER_KEYS } from "./src/content/lessons/native/nombres-echanges.gen.ts";

const norm = s => s.replace(/\s+/g, " ").replace(/\s+([?!.,])/g, "$1").trim();
const bad = [];
function audit(label, q) {
  const w = m => { if (bad.length < 8) bad.push(`${label}: ${m}`); };
  if (!q.correct || !q.correct.trim()) w("empty answer");
  if (!q.easyOptions.includes(q.correct)) w(`answer missing from its own options: ${q.correct}`);
  if (new Set(q.easyOptions).size !== q.easyOptions.length) w(`repeated option: ${JSON.stringify(q.easyOptions)}`);
  if (q.easyOptions.length < 4) w(`only ${q.easyOptions.length} options`);
  if (!q.med.choices.includes(q.med.correct)) w("cloze answer not among its choices");
  if (new Set(q.med.choices).size !== q.med.choices.length) w(`repeated cloze choice: ${JSON.stringify(q.med.choices)}`);
  if (norm(`${q.med.before} ${q.med.correct} ${q.med.after}`) !== norm(q.correct))
    w(`cloze does not rebuild the graded sentence: "${norm(`${q.med.before} ${q.med.correct} ${q.med.after}`)}" vs "${norm(q.correct)}"`);
  if (/undefined|NaN|\[object/.test(JSON.stringify(q))) w("a placeholder leaked into the card");
}
for (let i = 0; i < 2000; i++) audit("ca-secrit", caSecritQuestion());
for (let i = 0; i < 2000; i++) audit("langues", languesPaysQuestion());
for (let i = 0; i < 2000; i++) audit("nombres", nombresQuestion());

// Pins honoured, and the promised act actually asked for.
let asked = { spell: 0, ask: 0, lang: 0, prep: 0, age: 0, prix: 0, qty: 0 };
for (const n of NAMES) {
  const t = caSecritQuestion({ name: n.name, mode: "tell" });
  if (!t.correct.includes(n.letters.join(" – "))) bad.push(`ca-secrit pin ignored: ${n.name}`);
  if (t.correct.includes("s'écrit")) asked.spell++;
  const a = caSecritQuestion({ name: n.name, mode: "ask" });
  if (/^Comment ça s'écrit/.test(a.correct)) asked.ask++;
}
for (const p of PLACES) {
  const q = languesPaysQuestion({ country: p.country, mode: "lang" });
  if (!q.correct.includes(p.country)) bad.push(`langues pin ignored: ${p.country}`);
  if (!q.correct.includes(bareLang(p.langs[0]))) bad.push(`wrong language for ${p.country}: ${q.correct}`);
  // The preposition is not optional in this sentence and must be the right one.
  const head = `${p.prep.charAt(0).toUpperCase()}${p.prep.slice(1)} ${p.country},`;
  if (!q.correct.startsWith(head)) bad.push(`wrong preposition for ${p.country} (want "${p.prep}"): ${q.correct}`);
  asked.lang++;
  const r = languesPaysQuestion({ country: p.country, mode: "prep" });
  if (!r.correct.includes(` ${p.prep} ${p.country}`)) bad.push(`prep mode wrong for ${p.country}: ${r.correct}`);
  asked.prep++;
}
for (const n of NUMBER_KEYS) {
  const a = nombresQuestion({ number: String(n), usage: "age" });
  if (!/^J'ai .* ans\.$/.test(a.correct)) bad.push(`age not "J'ai ... ans": ${a.correct}`);
  asked.age++;
  const p = nombresQuestion({ number: String(n), usage: "prix" });
  if (!/euros\.$/.test(p.correct)) bad.push(`price not in euros: ${p.correct}`);
  asked.prix++;
  const q = nombresQuestion({ number: String(n), usage: "quantite" });
  if (!/^Il y a /.test(q.correct)) bad.push(`quantity not "Il y a": ${q.correct}`);
  asked.qty++;
}
// 21/31/41/51/61 + a feminine noun must agree: "trente et une personnes".
for (const n of [21, 31, 41, 51, 61]) {
  let sawFem = false;
  for (let k = 0; k < 200; k++) {
    const q = nombresQuestion({ number: String(n), usage: "quantite" });
    if (/(personnes|minutes|pages)/.test(q.correct)) {
      sawFem = true;
      if (!/ et une /.test(q.correct)) bad.push(`no feminine agreement: ${q.correct}`);
    } else if (/ et une /.test(q.correct)) bad.push(`feminine on a masculine noun: ${q.correct}`);
  }
  if (!sawFem) bad.push(`never drew a feminine noun for ${n}`);
}
console.log(JSON.stringify({ bad: bad.slice(0, 8), asked }));
"""
r = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS],
                   capture_output=True, text=True)
check(r.returncode == 0, "the three generators executed in node",
      f"generator run failed: {r.stderr[-500:]}")
if r.returncode == 0:
    d = json.loads(r.stdout.strip().splitlines()[-1])
    check(not d["bad"],
          "6000 generated cards are well-formed, and every pin is honoured",
          f"generated cards are malformed: {d['bad']}")
    a = d["asked"]
    check(a["spell"] > 0 and a["ask"] > 0,
          f"SIO-003's lesson both ASKS and ANSWERS the spelling question "
          f"({a['ask']} ask, {a['spell']} answer)",
          f"the spelling lesson does not cover both halves of the promise: {a}")
    check(a["lang"] > 0 and a["prep"] > 0,
          f"SIO-017's lesson links country to language in {a['lang']} places",
          f"the languages lesson does not link country to language: {a}")
    check(a["age"] > 0 and a["prix"] > 0 and a["qty"] > 0,
          f"SIO-018's lesson covers ages, prices AND quantities "
          f"({a['age']}/{a['prix']}/{a['qty']})",
          f"the numbers lesson misses one of the three promised uses: {a}")

# ---- 4 · the content stays inside what the course teaches -----------------
langs_deck = json.load(open("src/content/collections/languages.json", encoding="utf-8"))
known_langs = {i["fr"].replace("l'", "").replace("le ", "").replace("la ", "")
               for i in langs_deck["items"]}
nat_deck = json.load(open("src/content/collections/nationalities.json", encoding="utf-8"))
known_countries = {i["fr"] for i in nat_deck["items"]}

gen = read(GENS["langues-pays"])
used_langs = set(re.findall(r'"(?:le |la |l\')([a-zéèêàçôûîï\-]+)"', gen))
used_countries = set(re.findall(r'\{ country: "([^"]+)"', gen))
stray_l = sorted(used_langs - known_langs)
stray_c = sorted(used_countries - known_countries)
check(not stray_l,
      f"every language taught is one of SIO-017's own {len(known_langs)} cards",
      f"the lesson answers with languages the course never teaches: {stray_l}")
check(not stray_c,
      f"every country used is one the learner met in SIO-016 ({len(known_countries)} cards)",
      f"the lesson asks about countries the learner has never seen: {stray_c}")

# ---- 5 · the preposition, checked against an INDEPENDENT source ------------
# The first version of this asked the generator whether it agreed with its own
# table — `prep` came from PLACES and the expectation came from PLACES — so
# changing "au Portugal" to "en Portugal" produced a happily consistent, wrong
# lesson and a green check. Caught by breaking it and seeing nothing fail.
#
# The real authority is the country's ARTICLE, which the nationalities deck
# tags independently for its Letris columns: la / l' -> en, le -> au,
# les -> aux, no article -> à. That table was authored years apart from this
# lesson, so agreeing with it means something.
ART_TO_PREP = {"la": "en", "l_apos": "en", "le": "au", "les": "aux", "no_article": "à"}
article = {}
for it in nat_deck["items"]:
    tag = next((t[4:] for t in it.get("tags", []) if t.startswith("col:")), None)
    if tag:
        article[it["fr"]] = tag

wrong_prep = []
for country, prep in re.findall(r'\{ country: "([^"]+)",\s*prep: "([^"]+)"', gen):
    want = ART_TO_PREP.get(article.get(country, ""))
    if want and prep != want:
        wrong_prep.append(f'{country}: lesson says "{prep} {country}", but the deck tags it '
                          f'"{article[country]}" which takes "{want}"')
check(not wrong_prep,
      f"every preposition agrees with the country's article in the nationalities deck "
      f"({len(article)} countries tagged)",
      "the lesson teaches a wrong preposition: " + "; ".join(wrong_prep))

# ---- 6 · SIO-011: the tail follows the OTHER sentence ---------------------
# The whole lesson is one rule — a negative takes « non plus », an affirmative
# takes « aussi » — so that is what gets executed, not read. The distractor
# set matters too: four of the eight pronouns do not change shape, and the
# subject-form distractor collides with the answer for those (it shipped that
# way for ten minutes and the generator caught it).
JS11 = r"""
import { echoCard, cestCard, ASKED } from "./src/content/lessons/native/moi-aussi.gen.ts";
const bad = [];
const norm = s => s.replace(/\s+/g, " ").replace(/\s+([?!.,])/g, "$1").trim();
function audit(q, l) {
  const w = m => { if (bad.length < 6) bad.push(`${l}: ${m}`); };
  if (!q.easyOptions.includes(q.correct)) w("answer not among its options");
  if (new Set(q.easyOptions).size !== q.easyOptions.length) w(`repeated option ${JSON.stringify(q.easyOptions)}`);
  if (q.easyOptions.length < 4) w(`only ${q.easyOptions.length} options`);
  if (new Set(q.med.choices).size !== q.med.choices.length) w("repeated cloze choice");
  if (norm(`${q.med.before} ${q.med.correct} ${q.med.after}`) !== norm(q.correct)) w("cloze does not rebuild the answer");
  const isNeg = /\bne \b|n'/.test(q.big);
  if (isNeg && /aussi\.$/.test(q.correct)) w(`AUSSI after a negative: ${q.big} -> ${q.correct}`);
  if (!isNeg && /non plus\.$/.test(q.correct)) w(`NON PLUS after an affirmative: ${q.big} -> ${q.correct}`);
}
for (let i = 0; i < 3000; i++) audit(echoCard(), "free");
for (const a of ASKED) for (const p of ["aff", "neg"]) for (let k = 0; k < 30; k++) {
  const q = echoCard({ person: a.answer, polarity: p });
  audit(q, "pin");
  if (!q.correct.startsWith(a.answer)) bad.push(`pin ignored: ${a.answer} -> ${q.correct}`);
  if ((p === "neg") !== /non plus/.test(q.correct)) bad.push(`wrong tail for ${p}: ${q.correct}`);
}
for (const a of ASKED) audit(cestCard({ person: a.answer }), "cest");
// « Et moi ? » must not return: every statement is first person, so it made the
// speaker ask about themselves — a well-formed card that means nothing.
const selfAsk = ASKED.some(a => /^Et moi/.test(a.cue));
console.log(JSON.stringify({ bad: bad.slice(0, 6), selfAsk, people: ASKED.length }));
"""
r11 = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS11],
                     capture_output=True, text=True)
check(r11.returncode == 0, "SIO-011's generator executed in node",
      f"moi-aussi run failed: {r11.stderr[-400:]}")
if r11.returncode == 0:
    d11 = json.loads(r11.stdout.strip().splitlines()[-1])
    check(not d11["bad"],
          "every « aussi / non plus » card follows the sentence it answers",
          f"the tail rule is broken: {d11['bad']}")
    check(not d11["selfAsk"],
          "« Et moi ? » is not in the echo drill (it made the speaker ask about themselves)",
          "« Et moi ? » is back: with first-person statements it produces "
          "\"J'ai un frère. Et moi ?\" — the speaker asking about themselves")

# No prepositions in SIO-011 (Dan, 2026-08-29: "we don't want to see chez,
# sans or other prepositions"). They were also Unit-3 material seven stops early.
# The rule reads the CODE, not the prose. The first version searched raw source
# and fired on this file's own header, which quotes Dan's ruling verbatim —
# "chez, sans or other prepositions" — the same way verify40 first failed on the
# comments explaining that pretests are not scored. Strip comments, then look
# only inside the French string literals a learner could actually be shown.
_ma = code(read(GENS["moi-aussi"]))
_fr = re.findall(r'"([^"\n]*)"', _ma) + re.findall(r"`([^`\n]*)`", _ma)
BANNED = ("chez", "avec", "sans", "pour", "devant", "derrière")
_prep = sorted({w for w in BANNED
                for t in _fr if re.search(r"\b" + w + r"\b\s+\w", t)})
check(not _prep,
      "SIO-011 teaches no prepositions (Dan, 29 Aug)",
      f"a preposition is back in SIO-011: {_prep} — Dan ruled them out, and they "
      "are Unit-3 material seven stops early")

# ---- 7 · the five stops filled on 29 Aug ----------------------------------
# Each carries a rule Dan set, and each is EXECUTED rather than read.
JS5 = r"""
const B = "./src/content/lessons/native/";
const { quelJourQuestion } = await import(B + "quel-jour.gen.ts");
const { combienQuestion, KEYS } = await import(B + "combien.gen.ts");
const { onFaitQuoiQuestion, REPLIES } = await import(B + "on-fait-quoi.gen.ts");
const { quEstCeQuestion, OBJECTS, PLURALS, pronounFor } = await import(B + "qu-est-ce-que-c-est.gen.ts");
const { ouEstQuestion, PLACES, AVEC_DE, SANS_DE, TOUT_SEUL } = await import(B + "ou-est.gen.ts");
const norm = s => s.replace(/\s+/g, " ").replace(/\s+([?!.,])/g, "$1").trim();
const bad = [];
function audit(q, l) {
  const w = m => { if (bad.length < 8) bad.push(`${l}: ${m}`); };
  if (!q.easyOptions.includes(q.correct)) w("answer not among its options");
  if (new Set(q.easyOptions).size !== q.easyOptions.length) w(`repeated option ${JSON.stringify(q.easyOptions)}`);
  if (q.easyOptions.length < 4) w(`only ${q.easyOptions.length} options`);
  if (new Set(q.med.choices).size !== q.med.choices.length) w("repeated cloze choice");
  if (norm(`${q.med.before} ${q.med.correct} ${q.med.after}`) !== norm(q.correct)) w("cloze does not rebuild the answer");
}
for (let i = 0; i < 2000; i++) audit(quelJourQuestion(), "4");
for (let i = 0; i < 2000; i++) audit(combienQuestion(), "7");
for (let i = 0; i < 2000; i++) audit(onFaitQuoiQuestion(), "8");
for (let i = 0; i < 2000; i++) audit(quEstCeQuestion(), "21");
// Dan, 29 Aug: "il/elle for objects should go to 21, which should also include
// ils/elles (sac, gomme, ciseaux, lunettes)." All four forms, and the verb
// moving with the number — English has only "it" and "they" for the lot.
const forms = new Set();
for (let i = 0; i < 3000; i++) {
  const q = quEstCeQuestion({ kind: "pronom" });
  audit(q, "21-pronom");
  const m = q.correct.match(/^(Il|Elle|Ils|Elles) (est|sont) là\.$/);
  if (!m) { bad.push(`21 pronoun card malformed: ${q.correct}`); continue; }
  const [, p, v] = m;
  forms.add(p);
  const plural = p === "Ils" || p === "Elles";
  if (plural !== (v === "sont")) bad.push(`21 verb does not follow number: ${q.correct}`);
  const noun = [...OBJECTS, ...PLURALS].find(n => q.big.includes(n.fr));
  if (!noun) { bad.push(`21 pronoun prompt names no noun: ${q.big}`); continue; }
  const isPl = PLURALS.some(x => x.fr === noun.fr);
  if (p !== pronounFor(noun.f, isPl)) bad.push(`21 ${noun.fr}: got ${p}, want ${pronounFor(noun.f, isPl)}`);
}
// The plural cards are the deck's OWN plural-only nouns. They used to be a
// singular with a bare + "s" ("Ce sont des sacs"), which is true French but
// not what the deck teaches; `ciseaux` and `lunettes` have no singular at all.
for (let i = 0; i < 1000; i++) {
  const q = quEstCeQuestion({ kind: "pluriel" });
  if (!PLURALS.some(p => q.correct === `Ce sont des ${p.fr}.`))
    bad.push(`21 plural is not a deck plural-only noun: ${q.correct}`);
}
for (let i = 0; i < 3000; i++) {
  const q = ouEstQuestion(); audit(q, "34");
  // « Les toilettes SONT » — the deck's one plural place, and the generator
  // shipped "est" until every preposition x every place was run.
  if (/^Les \S+ est /.test(q.correct)) bad.push(`plural subject, singular verb: ${q.correct}`);
  if (/Où est les /.test(q.big)) bad.push(`plural in the prompt: ${q.big}`);
}
// Dan: stop 7 stops at ten.
for (const n of KEYS) if (n > 10) bad.push(`stop 7 goes past ten: ${n}`);
// Dan: stop 8 teaches only two lines.
for (let i = 0; i < 300; i++) {
  const q = onFaitQuoiQuestion();
  if (!REPLIES.some(r => r.fr === q.correct)) bad.push(`stop 8 taught a third line: ${q.correct}`);
}
// Stop 34's contraction: de+le -> du, de+les -> des, and never "de le".
for (const p of [...AVEC_DE, ...SANS_DE]) for (const pl of PLACES) {
  const q = ouEstQuestion({ preposition: p, place: pl.fr });
  audit(q, "34-pin");
  if (!q.correct.includes(p)) bad.push(`preposition pin ignored: ${p} -> ${q.correct}`);
  if (/\bde le\b|\bde les\b/.test(q.correct)) bad.push(`uncontracted de: ${q.correct}`);
  const takesDe = AVEC_DE.includes(p);
  // No trailing \b — "de l'école" has no word boundary after the apostrophe.
  if (takesDe && !/(\bdu |\bdes |\bde la |\bde l')/.test(q.correct)) bad.push(`${p} lost its de: ${q.correct}`);
}
for (const p of TOUT_SEUL) {
  const q = ouEstQuestion({ preposition: p });
  if (/\bde\b|\bdu\b|\bdes\b/.test(q.correct)) bad.push(`${p} should take no place: ${q.correct}`);
}
console.log(JSON.stringify({ bad: bad.slice(0, 8), maxSeven: Math.max(...KEYS), replies: REPLIES.length, forms: [...forms].sort() }));
"""
r5 = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS5],
                    capture_output=True, text=True)
check(r5.returncode == 0, "the five 29-Aug generators executed in node",
      f"run failed: {r5.stderr[-400:]}")
if r5.returncode == 0:
    d5 = json.loads(r5.stdout.strip().splitlines()[-1])
    check(not d5["bad"], "11000 cards across stops 4, 7, 8, 21 and 34 are well-formed",
          f"generated cards are wrong: {d5['bad']}")
    check(d5["maxSeven"] == 10, "stop 7 stops at ten (Dan, 29 Aug)",
          f"stop 7 goes to {d5['maxSeven']} — Dan capped it at ten")
    check(d5["replies"] == 2, "stop 8 teaches exactly two lines (Dan, 29 Aug)",
          f"stop 8 teaches {d5['replies']} lines — Dan asked for two")
    check(d5["forms"] == ["Elle", "Elles", "Il", "Ils"],
          "stop 21 drills all four pronouns — il · elle · ils · elles (Dan, 29 Aug)",
          f"stop 21 produces only {d5['forms']} — Dan asked for ils/elles too, on "
          "sac, gomme, ciseaux and lunettes")

# ── the word « épeler » is retired (Dan, 2026-08-29) ──────────────────────
# "i want to remove the word epeler throughout the website, since it already
# commented ça s'écrit which is a lot more useful". The lesson's visible text
# was already « Comment ça s'écrit ? »; the word survived in its slug (so in
# /lessons/epeler), in a ComposeIt bank label a learner reads, and in two
# comments. Asserted over the whole tree, not the three files it was in,
# because the point is that it does not come BACK.
import glob as _g, re as _re
_hits = [f for f in (_g.glob("src/**/*.ts", recursive=True)
                     + _g.glob("src/**/*.tsx", recursive=True)
                     + _g.glob("src/**/*.json", recursive=True))
         if _re.search(r"[\u00e9e]peler", open(f, encoding="utf-8").read(), _re.I)]
check(not _hits, "the word \u00ab \u00e9peler \u00bb appears nowhere in src/",
      f"\u00ab \u00e9peler \u00bb is back in: {_hits}")
# And the lesson is still wired under its new slug: a rename that quietly
# unhooks SIO-003 would pass the check above and fail the learner.
_ls = read("src/content/lessons.ts")
check('"SIO-003": ["ca-secrit"]' in _ls and '"ca-secrit":' in _ls,
      "SIO-003 opens the lesson under its new slug ca-secrit",
      "SIO-003 is no longer wired to ca-secrit")
check('"ca-secrit": caSecritLesson' in read("src/content/lessons/native/index.tsx"),
      "ca-secrit is registered as a native lesson",
      "ca-secrit is not in the native registry \u2014 the stop would fall back")


print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)

print(f"\nall {len(OK)} checks passed")
