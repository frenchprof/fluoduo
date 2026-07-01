#!/usr/bin/env node
/**
 * FLUOLINGO migration v2: legacy per-game JSON -> unified collections (schema v2).
 *
 * v2 differences:
 *  - No per-item `eligible` field (games filter themselves at render time).
 *  - No `unit:`/`sit:`/`sub:`/`theme:` tags. Unit/lesson are first-class on the
 *    Collection (`unit`, `lessonNo`, `lessonSlug`, `crossRefs`).
 *  - Reserved structural tags `col:<key>` and `role:left|right` stay — those are
 *    item-level data the games need.
 *
 *   node scripts/migrate-collections.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src/content");
const OUT = resolve(ROOT, "src/content/collections");
mkdirSync(OUT, { recursive: true });

const read = (f) => JSON.parse(readFileSync(resolve(SRC, f), "utf8"));

/**
 * Syllabus position per curated deck. Confirmed against LAF1201 (Unit 3 = "On va
 * où cet été?", Unit 1 covers articles devant les noms de pays).
 *
 * `seq` is the homepage ordering hint and matches LAF1201 lesson order within unit.
 */
const TAXONOMY = {
  "weather-letris": {
    unit: 3,
    lessonNo: 1,
    lessonSlug: "weather",
    kind: "letris",
  },
  "countries-letris": {
    // Primary lesson is Unit 1 (les articles devant les noms de pays).
    // Same content is revisited in Unit 3 under prép. devant villes/pays.
    unit: 1,
    lessonNo: 6,
    lessonSlug: "countries",
    crossRefs: [
      {
        unit: 3,
        lessonNo: 2,
        lessonSlug: "city-preps",
        note: "Prépositions devant villes/pays.",
      },
    ],
    kind: "letris",
  },
  "lieux-letris": {
    unit: 3,
    lessonNo: 7,
    lessonSlug: "attractions",
    kind: "letris",
  },
  "loin-lesson": {
    unit: 3,
    lessonNo: 9,
    lessonSlug: "place-preps",
    kind: "letris",
  },
  "loin-letris": {
    unit: 3,
    lessonNo: 9,
    lessonSlug: "place-preps",
    kind: "letris",
  },
  "directions-matching": {
    unit: 3,
    lessonNo: 8,
    lessonSlug: "directions",
    kind: "matching",
  },
};

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

/* ---------- letris-family migration ---------- */
function migrateLetris(slug, raw, tax) {
  const collection = {
    id: slug,
    title: raw.title,
    subtitle: raw.subtitle,
    langPair: "fr-en",
    owner: "curated",
    visibility: "public",
    unit: tax.unit,
    lessonNo: tax.lessonNo,
    lessonSlug: tax.lessonSlug,
    ...(tax.crossRefs ? { crossRefs: tax.crossRefs } : {}),
    tags: [],
    seq: tax.unit * 100 + tax.lessonNo,
    items: [],
    gameConfig: {
      letris: {
        columns: (raw.categories ?? []).map((c) => ({
          key: c.key,
          label: c.label,
          prefix: c.prefix,
        })),
      },
    },
    source: `${slug}.json`,
  };
  (raw.tiles ?? []).forEach((t, i) => {
    const fr = t.displayName ?? String(t.text).toLowerCase();
    const item = {
      id: `${slug}-${String(i + 1).padStart(2, "0")}-${slugify(fr)}`,
      fr,
      en: t.meaning ?? "",
      ...(t.note ? { note: t.note } : {}),
      emoji: t.emoji,
      tags: [`col:${t.category}`],
    };
    collection.items.push(item);
  });
  return collection;
}

/* ---------- matching-family migration ---------- */
function migrateMatching(slug, raw, tax) {
  const collection = {
    id: slug,
    title: raw.title,
    subtitle: raw.subtitle,
    langPair: "fr-en",
    owner: "curated",
    visibility: "public",
    unit: tax.unit,
    lessonNo: tax.lessonNo,
    lessonSlug: tax.lessonSlug,
    ...(tax.crossRefs ? { crossRefs: tax.crossRefs } : {}),
    tags: [],
    seq: tax.unit * 100 + tax.lessonNo,
    items: [],
    gameConfig: { matching: { pairs: [] } },
    source: `${slug}.json`,
  };
  const idFor = (role, origId) => `${slug}-${role}-${origId}`;
  (raw.lefts ?? []).forEach((l) =>
    collection.items.push({
      id: idFor("L", l.id),
      fr: l.text,
      en: l.meaning ?? "",
      emoji: l.emoji,
      tags: ["role:left"],
    }),
  );
  (raw.rights ?? []).forEach((r) => {
    collection.items.push({
      id: idFor("R", r.id),
      fr: r.text,
      en: r.meaning ?? "",
      emoji: r.emoji,
      tags: ["role:right"],
    });
    (r.validLefts ?? []).forEach((leftOrig) =>
      collection.gameConfig.matching.pairs.push({
        leftId: idFor("L", leftOrig),
        rightId: idFor("R", r.id),
      }),
    );
  });
  return collection;
}

/* ---------- run ---------- */
const summary = [];
for (const [slug, tax] of Object.entries(TAXONOMY)) {
  const raw = read(`${slug}.json`);
  const col =
    tax.kind === "matching"
      ? migrateMatching(slug, raw, tax)
      : migrateLetris(slug, raw, tax);
  writeFileSync(
    resolve(OUT, `${slug}.json`),
    JSON.stringify(col, null, 2) + "\n",
    "utf8",
  );
  summary.push({
    slug,
    seq: col.seq,
    unit: col.unit,
    lessonNo: col.lessonNo,
    lessonSlug: col.lessonSlug,
    items: col.items.length,
    cols: col.gameConfig?.letris?.columns?.length ?? "-",
    pairs: col.gameConfig?.matching?.pairs?.length ?? "-",
  });
}

console.log("\nMigrated collections (v2) -> src/content/collections/\n");
summary.sort((a, b) => a.seq - b.seq);
for (const s of summary) {
  console.log(
    `[seq ${String(s.seq).padStart(4)}] U${s.unit}·L${String(s.lessonNo).padStart(2)} ${s.lessonSlug.padEnd(14)} ${s.slug.padEnd(20)} items:${String(s.items).padStart(2)}  cols:${s.cols}  pairs:${s.pairs}`,
  );
}
