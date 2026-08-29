#!/usr/bin/env node
/**
 * Build check for the Home map's `short` labels (patch 25, 2026-08-17).
 *
 * Every SIO in src/content/sios/sios.json carries a `short` label — the
 * phone-legible name that sits under its stop on the course map (the full
 * `topic` stays for titles and the unit list). A label that is missing or
 * longer than 14 characters overflows an 86px column at 390px wide, so this
 * check fails the build instead of letting the map ship with a clipped or
 * missing name.  Wired as `npm run check:short`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MAX = 14;
const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, "..", "src", "content", "sios", "sios.json");
const sios = JSON.parse(readFileSync(file, "utf8"));

const problems = [];
for (const s of sios) {
  const label = typeof s.short === "string" ? s.short.trim() : "";
  const len = [...label].length; // code points, not UTF-16 units (– and … count as one)
  if (!label) problems.push(`${s.id}: no short label`);
  else if (len > MAX) problems.push(`${s.id}: "${label}" is ${len} chars (max ${MAX})`);
  else if (label.endsWith("...")) problems.push(`${s.id}: "${label}" looks truncated — write a real short name`);
}

if (problems.length) {
  console.error(`check-short-labels: ${problems.length} problem(s)`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`check-short-labels: ${sios.length} SIOs, every short label present and ≤ ${MAX} chars`);
