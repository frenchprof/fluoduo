#!/usr/bin/env python3
"""
Three stops that promised an act and taught only its vocabulary (2026-08-28).

Numbered 45. It was 42, then 43, and collided both times with a file the
colour-review session shipped in parallel (verify42-sio-source, then
verify43-lesson-axes). Two files sharing a number is how verify31-wordrill sat
unwired for a fortnight — the workflow names the number once and nobody
notices the other never runs. verify46 now makes that impossible to repeat.

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

Run from the repo root:  python3 verify/verify45-three-stops.py
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
    "epeler": "src/content/lessons/native/epeler.gen.ts",
    "langues-pays": "src/content/lessons/native/langues-pays.gen.ts",
    "nombres-echanges": "src/content/lessons/native/nombres-echanges.gen.ts",
}
for slug, p in GENS.items():
    check(os.path.isfile(p), f"{slug} generator present", f"MISSING {p}")
    check(os.path.isfile(p.replace(".gen.ts", ".tsx")), f"{slug} Mémo present",
          f"MISSING {p.replace('.gen.ts', '.tsx')}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

reg, nat = read(REG), read(NAT)

# ---- 1-2 · each stop has its lesson, and it leads -------------------------
for sio, slug in (("SIO-003", "epeler"), ("SIO-017", "langues-pays"),
                  ("SIO-018", "nombres-echanges")):
    m = re.search(r'"%s":\s*\[([^\]]*)\]' % sio, reg)
    listed = [s.strip().strip('"') for s in m.group(1).split(",")] if m else []
    check(bool(m) and listed and listed[0] == slug,
          f"{sio} leads with {slug}",
          f"{sio} does not lead with {slug} (has {listed or 'no lesson'}) — the stop "
          "opens on someone else's lesson, or on none")
    check(f'"{slug}"' in reg and slug in nat,
          f"{slug} is registered in both the gallery and the native index",
          f"{slug} is missing from LESSONS or NATIVE_LESSONS — the route 404s")

# The atelier depends on `epeler` but must not LEAD with it — one goal, one
# lesson (verify27). I made exactly this mistake and the rule caught it.
_m10 = re.search(r'"SIO-010":\s*\[([^\]]*)\]', reg)
check(not _m10 or "epeler" not in _m10.group(1),
      "SIO-010 does not borrow SIO-003's lesson (one goal, one lesson)",
      "SIO-010 leads with `epeler` — a production stop opening on another "
      "stop's lesson is exactly what verify27 forbids")

# ---- 3-5 · the generators, EXECUTED --------------------------------------
# Read, not executed, is not enough: a generator that produces malformed French
# or a cloze that does not rebuild its own sentence looks fine in source.
JS = r"""
import { epelerQuestion, NAMES } from "./src/content/lessons/native/epeler.gen.ts";
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
for (let i = 0; i < 2000; i++) audit("epeler", epelerQuestion());
for (let i = 0; i < 2000; i++) audit("langues", languesPaysQuestion());
for (let i = 0; i < 2000; i++) audit("nombres", nombresQuestion());

// Pins honoured, and the promised act actually asked for.
let asked = { spell: 0, ask: 0, lang: 0, prep: 0, age: 0, prix: 0, qty: 0 };
for (const n of NAMES) {
  const t = epelerQuestion({ name: n.name, mode: "tell" });
  if (!t.correct.includes(n.letters.join(" – "))) bad.push(`epeler pin ignored: ${n.name}`);
  if (t.correct.includes("s'écrit")) asked.spell++;
  const a = epelerQuestion({ name: n.name, mode: "ask" });
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

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
