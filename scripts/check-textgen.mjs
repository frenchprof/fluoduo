#!/usr/bin/env node
/**
 * ÉcouTexte guard-rail. Three properties, all of them things a hand-written
 * text generator gets wrong silently:
 *
 *  1. VOCABULARY CONTAINMENT — every French word a generator can emit must
 *     already exist in the syllabus at or below its unit: in a curated deck
 *     (item, example, deck title), in an atelier model dialogue, or in the
 *     closed-class list below. A word that drifts in fails the check by name.
 *  2. PREFIX COHERENCE — the n-sentence text must be exactly the first n
 *     sentences of the 5-sentence text drawn from the same seed. That is what
 *     makes "1 up to 5 sentences" one text told longer, not five texts.
 *  3. CAPACITY — how many DISTINCT sentences each beat can produce, measured
 *     by sampling. This is the real answer to "never hear the same sentence
 *     twice": the weakest beat is the ceiling, and it is printed, not guessed.
 *
 * Run: node scripts/check-textgen.mjs
 */

import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCES = [
  "src/lib/textgen/types.ts",
  "src/lib/textgen/french.ts",
  "src/lib/textgen/engine.ts",
  "src/content/textgen/unit0.ts",
  "src/content/textgen/unit1.ts",
  "src/content/textgen/unit2.ts",
  "src/content/textgen/unit3.ts",
  "src/content/textgen/unit4.ts",
  "src/content/textgen/index.ts",
];

/* ── Compile the generator tree to plain ESM so Node can run it ──────────── */

function buildModules() {
  const out = mkdtempSync(join(tmpdir(), "textgen-"));
  for (const rel of SOURCES) {
    const src = readFileSync(join(ROOT, rel), "utf8");
    const js = ts.transpileModule(src, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
    // Emitted specifiers stay extensionless; Node needs the real filename.
    const fixed = js.replace(/(from\s+["'])(\.[^"']+)(["'])/g, "$1$2.mjs$3");
    const dest = join(out, rel.replace(/\.ts$/, ".mjs"));
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, fixed);
  }
  return out;
}

/* ── The allow-list: what the syllabus has actually taught ───────────────── */

/**
 * Closed-class words and inflections a course teaches by use rather than as
 * deck entries. Kept explicit so the check stays honest — every addition here
 * is a claim that unité 0–2 taught it.
 */
const FUNCTION_WORDS = `
  le la les l un une des du de d au aux à en dans sur sous chez pour avec sans par
  je tu il elle on nous vous ils elles me te se moi toi lui y ce cet cette ces c
  mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs
  qui que qu quoi où quand comment pourquoi combien est-ce
  et ou mais aussi alors donc si comme très beaucoup peu trop assez plus
  ans parle
  ne pas jamais rien plus non oui voilà voici
  suis es est sommes êtes sont ai as a avons avez ont
  vais vas va allons allez vont aller
  fais fait faisons faites font faire
  peux peut pouvons pouvez peuvent pouvoir
  veux veut voulons voulez veulent vouloir voudrais aimerais
  dois doit devons devez doivent devoir faut falloir
  prends prend prenons prenez prennent prendre
  mange manges mangeons mangez mangent manger
  bois boit buvons buvez boivent boire
  achète achètes achetons achetez achètent acheter
  aime aimes aimons aimez aiment aimer adore adores adorons adorez adorent adorer
  vais-je s'il plaît merci pardon bonjour salut
  aujourd hui jusqu
  tourner tourne tournes tournez tournent
  traverser traverse traverses traversez traversent
  continuer continue continues continuez continuent
  sortir sors sort sortez sortent
  bon bonne bons bonnes cher chère chers chères
  délicieux délicieuse délicieuses frais fraîche fraîches
  rapide rapides lent lente lents lentes
  ici là là-bas partout tout toute tous toutes droit
  euros euro kilo besoin envie
  matin midi soir semaine week-end jour journée année été hiver printemps automne
  lundi mardi mercredi jeudi vendredi samedi dimanche aujourd'hui demain
`
  .split(/\s+/)
  .filter(Boolean);

function words(text) {
  return text
    .toLocaleLowerCase("fr-FR")
    .replace(/[«»"“”.,!?;:()…]/g, " ")
    .replace(/’/g, "'")
    // Split on the apostrophe so "j'aime" contributes j + aime.
    .split(/[\s'’]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function buildAllowed(maxUnit) {
  const allowed = new Set(FUNCTION_WORDS);

  const dir = join(ROOT, "src/content/collections");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const deck = JSON.parse(readFileSync(join(dir, file), "utf8"));
    if (typeof deck.unit !== "number" || deck.unit > maxUnit) continue;
    for (const text of [deck.title, deck.subtitle]) if (text) words(text).forEach((w) => allowed.add(w));
    for (const item of deck.items ?? []) {
      for (const text of [item.fr, item.example]) if (text) words(text).forEach((w) => allowed.add(w));
      // Structured gender/number forms (nationalities' nat.ms/fs/mp/fp) ARE
      // the deck's taught words — the fr field carries only the country.
      if (item.nat) for (const v of Object.values(item.nat)) words(String(v)).forEach((w) => allowed.add(w));
    }
  }

  // The atelier model dialogues ARE the unit's production targets. Their
  // unit comes from sios.json — SIO numbers do NOT map to units by decade.
  const sioUnits = new Map(
    JSON.parse(readFileSync(join(ROOT, "src/content/sios/sios.json"), "utf8")).map((s) => [s.id, s.unit]),
  );
  const ateliers = readFileSync(join(ROOT, "src/content/ateliers.ts"), "utf8");
  for (const m of ateliers.matchAll(/"(SIO-\d+)":\s*\[([\s\S]*?)\n\s{2}\]/g)) {
    const sioUnit = sioUnits.get(m[1]);
    if (sioUnit === undefined || sioUnit > maxUnit) continue;
    for (const line of m[2].matchAll(/fr:\s*"((?:[^"\\]|\\.)*)"/g)) {
      words(line[1].replace(/\\"/g, '"')).forEach((w) => allowed.add(w));
    }
  }
  return allowed;
}

/**
 * A word counts as taught if the deck shows any number variant of it: a course
 * that puts « les billets » on a card has taught « billet ». Gender/number
 * agreement of adjectives is listed explicitly above instead — guessing at
 * stems there would wave through real mistakes.
 */
function isTaught(word, allowed) {
  if (allowed.has(word)) return true;
  const variants = [word + "s", word + "x", word.replace(/s$/, ""), word.replace(/x$/, "")];
  return variants.some((v) => v !== word && allowed.has(v));
}

/* ── Checks ──────────────────────────────────────────────────────────────── */

const SAMPLES = 4000;
const failures = [];

const modules = buildModules();
const { TEXTGENS } = await import(pathToFileURL(join(modules, "src/content/textgen/index.mjs")).href);
const { generateText, makeRng, fingerprint } = await import(
  pathToFileURL(join(modules, "src/lib/textgen/engine.mjs")).href
);

for (const gen of TEXTGENS) {
  const allowed = buildAllowed(gen.unit);
  const unknown = new Map();
  const perBeat = gen.scenarios.map(() => Array.from({ length: 5 }, () => new Set()));
  const allSentences = new Set();

  for (let i = 0; i < SAMPLES; i++) {
    const seed = 1000 + i;

    for (let s = 0; s < gen.scenarios.length; s++) {
      const full = gen.scenarios[s].write(makeRng(seed), 5);
      full.forEach((line, b) => {
        perBeat[s][b].add(fingerprint(line.fr));
        allSentences.add(fingerprint(line.fr));
        for (const w of words(line.fr)) {
          if (!isTaught(w, allowed)) unknown.set(w, (unknown.get(w) ?? 0) + 1);
        }
      });

      // 2. Prefix coherence — n sentences == the first n of the five.
      for (let n = 1; n <= 5; n++) {
        const short = gen.scenarios[s].write(makeRng(seed), n);
        if (short.length !== n) {
          failures.push(`unité ${gen.unit} ${gen.scenarios[s].id}: asked ${n}, got ${short.length}`);
        }
        for (let k = 0; k < n - 1; k++) {
          // Only the CLOSING sentence may differ (it takes "Enfin,").
          if (short[k].fr !== full[k].fr && n === 5) {
            failures.push(
              `unité ${gen.unit} ${gen.scenarios[s].id} seed ${seed}: sentence ${k + 1} differs at n=${n}`,
            );
          }
        }
      }
    }
  }

  // Sanity: the top-level draw actually reaches every scenario.
  const reached = new Set();
  for (let i = 0; i < 500; i++) reached.add(generateText(gen, { sentences: 5, seed: 5000 + i }).scenario);
  if (reached.size !== gen.scenarios.length) {
    failures.push(`unité ${gen.unit}: only ${reached.size}/${gen.scenarios.length} scenarios reachable`);
  }

  console.log(`\n═══ Unité ${gen.unit} — ${gen.title} ═══`);
  console.log(`allowed vocabulary: ${allowed.size} words (decks + ateliers of unités 0–${gen.unit})`);
  console.log(`distinct sentences reachable: ${allSentences.size}`);
  for (let s = 0; s < gen.scenarios.length; s++) {
    const counts = perBeat[s].map((set) => set.size);
    console.log(
      `  ${gen.scenarios[s].id.padEnd(14)} beats ${counts.map((n) => String(n).padStart(4)).join(" ")}` +
        `   → ceiling at 5 sentences: ${Math.min(...counts)} texts before a sentence must repeat`,
    );
  }

  if (unknown.size) {
    failures.push(
      `unité ${gen.unit}: ${unknown.size} word(s) outside the syllabus — ` +
        [...unknown.keys()].sort().join(", "),
    );
  }
}

console.log("");
if (failures.length) {
  for (const f of failures) console.error(`✗ ${f}`);
  process.exit(1);
}
console.log("✓ vocabulary contained, prefixes coherent, every scenario reachable");

// --show prints real output at every length, for reading it as a human.
if (process.argv.includes("--show")) {
  for (const gen of TEXTGENS) {
    console.log(`\n═══ Unité ${gen.unit} — ${gen.title} — samples ═══`);
    for (const s of gen.scenarios) {
      for (const n of [1, 3, 5]) {
        const seed = 40 + n * 7;
        console.log(`\n  ${s.id} · ${n} sentence${n > 1 ? "s" : ""} (seed ${seed})`);
        for (const line of s.write(makeRng(seed), n)) console.log(`    ${line.fr}\n      ${line.en}`);
      }
    }
  }
}
