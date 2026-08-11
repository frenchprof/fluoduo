/**
 * Generate the per-stop Specific Instructional Objectives from the authored doc.
 *   docs/SIO_OBJECTIVES.md  →  src/content/sios/objectives.json
 *
 * The doc is the source of truth (regenerate, don't hand-edit the JSON — same
 * rule as gen-sios.mjs). Each entry is one markdown paragraph of the form
 * `**SIO-xxx · Topic** — body…`; the body keeps its *italic* markers so the UI
 * can render the French examples in italics.
 *
 * Run: node scripts/gen-sio-objectives.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "docs/SIO_OBJECTIVES.md");
const OUT = join(ROOT, "src/content/sios/objectives.json");

const md = readFileSync(SRC, "utf8");

// Paragraphs are blank-line separated; an objective paragraph opens with the
// bold "**SIO-xxx · Topic**" header followed by " — " and the body.
const out = {};
for (const para of md.split(/\n\s*\n/)) {
  const m = para.trim().match(/^\*\*(SIO-[0-9]+[A-Z]?) · [^*]+\*\* — ([\s\S]+)$/);
  if (!m) continue;
  out[m[1]] = m[2].replace(/\s*\n\s*/g, " ").trim();
}

const n = Object.keys(out).length;
if (n !== 50) throw new Error(`Expected 50 objectives, parsed ${n}`);
writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`Wrote ${n} objectives → ${OUT}`);
