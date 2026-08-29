/**
 * Keep the handoff CSV telling the truth about the 50 SIOs.
 *
 *   src/content/sios/sios.json  →  docs/handoff/LAF1201_SIOs_Flashcards_v9.csv
 *
 *   node scripts/sync-sio-csv.mjs           write the app's wording into the CSV
 *   node scripts/sync-sio-csv.mjs --check   fail if the two disagree (wired into
 *                                           `npm run build` as check:sios)
 *
 * WHY THIS REPLACES gen-sios.mjs, AND WHY IT RUNS THE OTHER WAY (2026-08-29).
 *
 * gen-sios.mjs claimed the CSV was the source and rebuilt sios.json from it.
 * Both halves of that had stopped being true, and the file was a loaded gun:
 *
 *  - sios.json had grown a `short` label (the map's phone-legible name, which
 *    check:short requires of all 50) that the CSV has no column for, and grown
 *    SIO-045A, which has no CSV row. A run deleted a required field from 50
 *    entries and an entire SIO.
 *  - Its two hardcoded maps had rotted: COLLECTION_BY_SIO knew 26 of the 50
 *    live deck wirings and disagreed with one of them, so a run also unwired
 *    half the course.
 *  - Worst: the CSV had fallen 17 SIOs behind the course. For 14 of them the
 *    TOPIC differs — a different objective under the same number (the app's
 *    SIO-047 is "Making plans"; the CSV's is "Commerces"). Unit 4 was
 *    renumbered in the app and the CSV never followed. A run would have
 *    reverted 17 objectives to superseded text.
 *
 * The app is the live course — every one of those topics has a real deck, a
 * real pretest and real lessons wired to it — so the app is the source and the
 * CSV follows. Dan's call, 2026-08-29.
 *
 * WHAT EACH SIDE OWNS
 *
 *   app owns   the WORDING — unit, topic, description, set id, CEFR mode,
 *              can-do, competence. This script writes these into the CSV.
 *   CSV owns   the FLASHCARD SPEC — Front side, Back side (flipped), Overview
 *              columns, Letris / Notes. The app holds none of it; this script
 *              never touches those columns.
 *
 * The first sync therefore left 6 rows with a correct objective beside a
 * flashcard spec describing a different one. Those were reassigned by hand the
 * same day — the specs were not wrong, they were displaced, and each one had a
 * home under some other number (SIO-047's shop cards belong to SIO-044, which
 * IS Commerces now, and so on). docs/CSV_SPEC_REASSIGNMENT.md is the record.
 * A future reorganisation will do the same thing again: this script moves the
 * objective, and a human moves the cards after it.
 *
 * And because a sync tool is only run when someone remembers to, --check runs
 * on every build. Edit either side and the build says so. That is the part
 * that stops the drift; the copying is just the remedy.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CSV = join(ROOT, "docs/handoff/LAF1201_SIOs_Flashcards_v9.csv");
const SIOS = join(ROOT, "src/content/sios/sios.json");
const rel = (p) => relative(ROOT, p);

/** app field → CSV column. The app is the authority on every one of these. */
const SYNCED = {
  unitLabel: "Unit",
  topic: "Topic",
  description: "SIO Description",
  setId: "Flashcard Set",
  cefrMode: "CEFR Mode",
  canDo: "Can-Do (A1)",
  competence: "Linguistic competence (measurable)",
};

/**
 * CSV slots the app has since given to a different objective. Applied when the
 * CSV is read, so the row keeps its position (and its flashcard spec) instead
 * of being orphaned. Once written the CSV holds the new id and this is a no-op
 * — kept as the record of what moved where.
 *
 * NOT a rename: the two ids are different objectives. From SIO-043 onward the
 * CSV is still on the OLD numbering, so its ids and the app's stopped lining up
 * years of edits ago. This maps the SLOT, and the resulting card-spec mismatch
 * is listed in docs/CSV_SPEC_REASSIGNMENT.md.
 */
const SLOT_REUSED = {
  // The CSV's 5th Unit-4 row is "Frequency adverbs" — which the app now calls
  // SIO-043. The app's own SIO-045 was "Market phrases", retired into SIO-044
  // (Commerces) on 2026-08-02 with its number left as a deliberate permanent
  // gap so nothing downstream would shift; "Numbers 70–99" was then added in
  // that gap as SIO-045A. See the history note in src/content/pretests/index.ts.
  "SIO-045": "SIO-045A",
};

/** RFC-4180 parser: quotes, escaped "", embedded newlines/commas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\r") {
      // line ending; the \n closes the row
    } else if (c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

/**
 * Serialise back the way the file was written (Python csv, QUOTE_MINIMAL,
 * CRLF): quote only when the field carries a comma, a quote or a line break.
 * Getting this wrong would rewrite all 51 rows and bury the real change, so
 * the round-trip is asserted below before anything is written.
 */
function serializeCsv(rows) {
  const cell = (f) => (/[",\r\n]/.test(f) ? `"${f.replace(/"/g, '""')}"` : f);
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

// ---- read both sides -------------------------------------------------------
const original = readFileSync(CSV, "utf8");
const rows = parseCsv(original);
const header = rows[0].map((h) => h.trim());

// A serializer that cannot reproduce the file it just parsed must not be
// allowed to write it. This is the guard that makes the whole tool safe.
if (serializeCsv(rows) !== original) {
  console.error(
    `sync-sio-csv: round-tripping ${rel(CSV)} does not reproduce it byte for byte.\n` +
      `Refusing to write — fix serializeCsv() before trusting this script.`,
  );
  process.exit(1);
}

const colOf = {};
for (const [field, name] of Object.entries(SYNCED)) {
  const i = header.indexOf(name);
  if (i < 0) {
    console.error(`sync-sio-csv: the CSV has no "${name}" column. Header:\n  ${header.join(" | ")}`);
    process.exit(1);
  }
  colOf[field] = i;
}
const I_SIO = header.indexOf("SIO #");
if (I_SIO < 0) { console.error(`sync-sio-csv: the CSV has no "SIO #" column.`); process.exit(1); }

const app = new Map(JSON.parse(readFileSync(SIOS, "utf8")).map((s) => [s.id, s]));

/**
 * Repair rows that are WIDER than the header.
 *
 * Two rows arrived that way (SIO-036 at 13 fields, SIO-040 at 14): a competence
 * containing commas was once pasted in unquoted, so the parser split it and the
 * tail spilled into phantom columns. Left alone, a sync writes the correct value
 * into the real column and leaves the orphan fragments sitting after it — the
 * row then reads as the sentence followed by half of itself again.
 *
 * A spill is only ever collapsed when it can be PROVED to be one: re-joining the
 * row's tail with commas has to reproduce, exactly, the value the app holds for
 * that SIO. Anything else is unexplained data and the script stops rather than
 * deleting it.
 */
function healSpills(rows, header, app, I_SIO, colOf, SLOT_REUSED) {
  const healed = [];
  for (const r of rows.slice(1)) {
    if (r.length <= header.length) continue;
    const raw = (r[I_SIO] || "").trim();
    const s = app.get(SLOT_REUSED[raw] ?? raw);
    const last = header.length - 1;
    const rejoined = r.slice(last).join(",");
    const target = s && Object.entries(colOf).find(([, i]) => i === last);
    if (!s || !target || rejoined !== (s[target[0]] ?? "")) {
      console.error(
        `sync-sio-csv: ${raw || "(unnamed row)"} has ${r.length} fields where the header has ` +
          `${header.length}, and the overflow does not re-join into its app value.\n` +
          `  overflow: ${JSON.stringify(r.slice(header.length))}\n` +
          `Refusing to touch it — that is unexplained data, not a known spill.`,
      );
      process.exit(1);
    }
    r.splice(last, r.length - last, rejoined);
    healed.push(raw);
  }
  return healed;
}

const healed = healSpills(rows, header, app, I_SIO, colOf, SLOT_REUSED);

// ---- compare ---------------------------------------------------------------
const changes = [];   // { id, column, from, to }
const reslots = []; // { from, to }
const seen = new Set();

for (const r of rows.slice(1)) {
  const raw = (r[I_SIO] || "").trim();
  if (!/^SIO-\d{3}[A-Z]?$/.test(raw)) continue; // blank / continuation row
  const id = SLOT_REUSED[raw] ?? raw;
  if (id !== raw) reslots.push({ from: raw, to: id });
  const s = app.get(id);
  if (!s) continue; // reported below as CSV-only
  seen.add(id);
  for (const [field, name] of Object.entries(SYNCED)) {
    const was = r[colOf[field]] ?? "";
    const now = s[field] ?? "";
    if (was !== now) changes.push({ id, column: name, from: was, to: now });
  }
}

const csvIds = new Set(rows.slice(1).map((r) => SLOT_REUSED[(r[I_SIO] || "").trim()] ?? (r[I_SIO] || "").trim()));
const appOnly = [...app.keys()].filter((id) => !csvIds.has(id));
const csvOnly = [...csvIds].filter((id) => /^SIO-/.test(id) && !app.has(id));

// ---- report ----------------------------------------------------------------
const check = process.argv.includes("--check");
const clean = !changes.length && !reslots.length && !appOnly.length && !csvOnly.length && !healed.length;

if (clean) {
  console.log(`check:sios — ${rel(CSV)} matches sios.json on all ${seen.size} SIOs.`);
  process.exit(0);
}

for (const id of healed) console.log(`${id}: comma-spill across phantom columns, re-joined into one field.`);
for (const { from, to } of reslots) console.log(`${from} → ${to} (the app gave this slot to a different objective)`);
for (const c of changes) {
  console.log(`${c.id}  ${c.column}`);
  console.log(`  CSV: ${JSON.stringify(c.from)}`);
  console.log(`  app: ${JSON.stringify(c.to)}`);
}
for (const id of appOnly) console.log(`${id}: in sios.json but has no CSV row.`);
for (const id of csvOnly) console.log(`${id}: in the CSV but not in sios.json.`);

if (check) {
  console.error(
    `\ncheck:sios FAILED — ${rel(CSV)} disagrees with sios.json on ${changes.length} field(s)` +
      `${reslots.length ? `, ${reslots.length} reslotted row(s)` : ""}` +
      `${appOnly.length || csvOnly.length ? `, ${appOnly.length + csvOnly.length} row(s) present on only one side` : ""}.\n\n` +
      `The app owns the wording (${Object.values(SYNCED).join(", ")}).\n` +
      `If the app is right (it usually is):  node scripts/sync-sio-csv.mjs\n` +
      `If the CSV is right:                  make the same edit in ${rel(SIOS)}\n` +
      `The CSV's flashcard-spec columns are never touched either way.`,
  );
  process.exit(1);
}

if (appOnly.length || csvOnly.length) {
  console.error(
    `\nRefusing to write: ${[...appOnly, ...csvOnly].join(", ")} exists on only one side.\n` +
      `A missing row is a decision (add it? renumber it? drop it?), not something to sync.\n` +
      `Add it to SLOT_REUSED in this script, or add the row by hand, then run again.`,
  );
  process.exit(1);
}

// ---- write -----------------------------------------------------------------
for (const r of rows.slice(1)) {
  const raw = (r[I_SIO] || "").trim();
  if (!/^SIO-\d{3}[A-Z]?$/.test(raw)) continue;
  const id = SLOT_REUSED[raw] ?? raw;
  const s = app.get(id);
  if (!s) continue;
  r[I_SIO] = id;
  for (const [field] of Object.entries(SYNCED)) r[colOf[field]] = s[field] ?? "";
}

writeFileSync(CSV, serializeCsv(rows));
console.log(`\nWrote ${changes.length} field change(s)${reslots.length ? ` and ${reslots.length} reslot(s)` : ""} → ${rel(CSV)}`);
console.log(`The flashcard-spec columns were not touched — see docs/CSV_SPEC_REASSIGNMENT.md for the rows whose cards now describe a different objective.`);
