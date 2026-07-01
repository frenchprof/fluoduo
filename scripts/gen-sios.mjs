/**
 * Generate the 50-SIO data spine from the v9 spec CSV.
 *   docs/handoff/LAF1201_SIOs_Flashcards_v9.csv  →  src/content/sios/sios.json
 *
 * The CSV has quoted fields with embedded newlines/commas, so we parse it properly
 * rather than splitting on lines. We only keep the columns the hub needs.
 *
 * Run: node scripts/gen-sios.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CSV = join(ROOT, "docs/handoff/LAF1201_SIOs_Flashcards_v9.csv");
const OUT_DIR = join(ROOT, "src/content/sios");
const OUT = join(OUT_DIR, "sios.json");

/** Minimal RFC-4180 CSV parser: handles quotes, escaped "", embedded newlines/commas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // ignore; \n handles the row break
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Existing curated decks to wire into the Practice section, keyed by SIO id. */
const COLLECTION_BY_SIO = {
  "SIO-015": "countries-letris",
  "SIO-016": "nationalities",
  "SIO-017": "languages",
  "SIO-031": "weather-letris",
  "SIO-033": "lieux-letris",
  "SIO-034": "loin-lesson",
  "SIO-036": "directions-matching",
  // Units 0-3 completion pass (2026-07-01) — see docs/handoff §4.9. SIO ids
  // are POST-renumbering (see §4.8) — don't map against an older SIO list.
  "SIO-004": "days",
  "SIO-005": "colors",
  "SIO-006": "core-nouns",
  "SIO-007": "numbers-0-20",
  "SIO-011": "stress-pronouns",
  "SIO-012": "professions",
  "SIO-013": "matieres",
  "SIO-018": "numbers-20-69",
  "SIO-019": "avoir-etats",
  "SIO-021": "objets-articles",
  "SIO-022": "possessives",
  "SIO-023": "aimer-activites",
  "SIO-024": "faire-activites",
  "SIO-026": "aller-destinations",
  "SIO-027": "quand-time",
  "SIO-028": "avec-qui",
  "SIO-032": "en-au-aux-a",
  "SIO-035": "question-words",
  "SIO-038": "transport",
};

/** Production SIOs assessed by a writing/speaking rubric, NOT an MCQ battery. */
const PRODUCTION_SIOS = new Set([
  "SIO-010", // first meeting role-play (spoken interaction) — Unité 0's Atelier
  "SIO-020", // present a country (written)
  "SIO-030", // holiday email (written)
  "SIO-040", // itinerary (spoken production)
  "SIO-049", // restaurant review (spoken production)
  "SIO-050", // restaurant role-play (spoken interaction)
]);

/** Map the CEFR-mode free text to a coarse skill bucket for badges/wiring. */
function skillFromMode(mode) {
  const m = mode.toLowerCase();
  if (m.includes("listening")) return "listening";
  if (m.includes("written")) return "writing";
  if (m.includes("interaction")) return "interaction";
  if (m.includes("production")) return "production";
  return "interaction";
}

const text = readFileSync(CSV, "utf8");
const rows = parseCsv(text);
const header = rows[0].map((h) => h.trim());
const col = (name) => header.findIndex((h) => h === name);

const idx = {
  unit: col("Unit"),
  sio: col("SIO #"),
  topic: col("Topic"),
  desc: col("SIO Description"),
  set: col("Flashcard Set"),
  mode: col("CEFR Mode"),
  canDo: col("Can-Do (A1)"),
  comp: col("Linguistic competence (measurable)"),
};

const sios = [];
const seen = new Set();
for (const r of rows.slice(1)) {
  const id = (r[idx.sio] || "").trim();
  if (!/^SIO-\d{3}$/.test(id)) continue; // skip blank/continuation rows
  if (seen.has(id)) continue;
  seen.add(id);

  const unitLabel = (r[idx.unit] || "").trim(); // "Unité 0"
  const unitNum = Number((unitLabel.match(/(\d+)/) || [])[1] ?? -1);
  const mode = (r[idx.mode] || "").trim();

  sios.push({
    id,
    num: Number(id.slice(4)),
    unit: unitNum,
    unitLabel,
    topic: (r[idx.topic] || "").trim(),
    description: (r[idx.desc] || "").trim(),
    setId: (r[idx.set] || "").trim(),
    cefrMode: mode,
    skill: skillFromMode(mode),
    isProduction: PRODUCTION_SIOS.has(id),
    canDo: (r[idx.canDo] || "").trim(),
    competence: (r[idx.comp] || "").trim(),
    collectionId: COLLECTION_BY_SIO[id] ?? null,
  });
}

sios.sort((a, b) => a.num - b.num);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(sios, null, 2) + "\n");

console.log(`Wrote ${sios.length} SIOs → ${OUT}`);
const byUnit = sios.reduce((m, s) => ((m[s.unit] = (m[s.unit] || 0) + 1), m), {});
console.log("Per unit:", byUnit);
const wired = sios.filter((s) => s.collectionId).map((s) => s.id);
console.log("Wired to decks:", wired.join(", "));
const missingCanDo = sios.filter((s) => !s.canDo).map((s) => s.id);
if (missingCanDo.length) console.log("⚠️ missing Can-Do:", missingCanDo.join(", "));
const missingComp = sios.filter((s) => !s.competence).map((s) => s.id);
if (missingComp.length) console.log("⚠️ missing competence:", missingComp.join(", "));
