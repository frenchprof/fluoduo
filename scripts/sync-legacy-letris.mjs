#!/usr/bin/env node
/**
 * One-off sync: the legacy VocabulaRain tile files (src/content/*.json,
 * LetrisSet shape: {categories, tiles}) drifted from the v2 collections
 * (src/content/collections/*.json, the authoritative source since the
 * 2026-06-22 migration) as v2 items were added/edited afterward. This
 * regenerates each legacy file's `categories`/`tiles` from its v2
 * counterpart's `gameConfig.letris.columns`/`items`, keeping only the
 * col:<key> items whose key is one of the legacy file's OWN categories
 * (so decks whose v2 version grew extra columns, e.g. commerces' Letris
 * client/marchand exchange, don't leak non-word content into the falling-
 * word game). Top-level id/title/subtitle/language are left untouched —
 * only the content arrays are resynced.
 *
 *   node scripts/sync-legacy-letris.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DECKS = [
  "countries-letris",
  "commerces",
  "possessives",
  "faire-activites",
  "professions",
  "objets-articles",
  "weather-letris",
  "en-au-aux-a",
  "core-nouns",
];

for (const d of DECKS) {
  const legacyPath = resolve(ROOT, `src/content/${d}.json`);
  const v2Path = resolve(ROOT, `src/content/collections/${d}.json`);
  const legacy = JSON.parse(readFileSync(legacyPath, "utf8"));
  const v2 = JSON.parse(readFileSync(v2Path, "utf8"));

  const legacyKeys = new Set((legacy.categories ?? []).map((c) => c.key));
  const v2cols = v2.gameConfig?.letris?.columns ?? [];

  const newCategories = legacy.categories.map((lc) => {
    const v2c = v2cols.find((c) => c.key === lc.key);
    return v2c ? { key: v2c.key, label: v2c.label, prefix: v2c.prefix ?? "" } : lc;
  });

  const newTiles = v2.items
    .filter((it) => it.tags.some((t) => t.startsWith("col:") && legacyKeys.has(t.slice(4))))
    .map((it) => {
      const category = it.tags.find((t) => t.startsWith("col:")).slice(4);
      const tile = { text: it.fr.toUpperCase(), displayName: it.fr, category, meaning: it.en };
      if (it.emoji) tile.emoji = it.emoji;
      return tile;
    });

  console.log(`${d}: ${legacy.tiles.length} -> ${newTiles.length} tiles`);
  legacy.categories = newCategories;
  legacy.tiles = newTiles;
  writeFileSync(legacyPath, JSON.stringify(legacy, null, 2) + "\n", "utf8");
}
