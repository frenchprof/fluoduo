/**
 * Pre-generate the TTS audio bank (Dan, 2026-07-10: same studio voice on
 * every device; browser voices differ per machine). Reads every deck JSON,
 * collects each item's spoken strings (fr, say, example), synthesises each
 * once with Fish Audio (Dan, 2026-08-02: migrating off Google/browser voices
 * — s2.1-pro-free, urgent, the free tier may not last), and writes:
 *
 *   public/tts-bank/<hash>.mp3        one clip per distinct string
 *   public/tts-bank/manifest.json     { voice, generatedAt, entries: { "<normalized text>": "<hash>.mp3" } }
 *
 * The runtime (games/letris/speech.ts) looks up the manifest before falling
 * back to the browser voice, so a partial or missing bank never breaks
 * anything. Idempotent: existing clips are kept, only new strings are
 * synthesised — re-run after deck edits to top up.
 *
 * Run: FISH_AUDIO_API_KEY=... node scripts/generate-tts-bank.mjs
 * Or:  GitHub → Actions → "Generate TTS bank" (uses the repo secret).
 * Optional: FISH_TTS_MODEL (default "s2.1-pro-free"), FISH_VOICE_FR_F (a
 * fish.audio voice `reference_id` for the site's narrator — same env var
 * the live /api/tts backend uses for its fr-f slot, so setting it once
 * keeps the bank and live calls speaking with the same voice).
 */
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.FISH_AUDIO_API_KEY;
if (!KEY) {
  console.error("FISH_AUDIO_API_KEY is not set — aborting (nothing written).");
  process.exit(1);
}

const DECKS_DIR = "src/content/collections";
const OUT_DIR = "public/tts-bank";
const MODEL = process.env.FISH_TTS_MODEL || "s2.1-pro-free";
// The site-wide narrator: same voice the /api/tts studio's « Voix A » uses.
const REFERENCE_ID = process.env.FISH_VOICE_FR_F || undefined;
const VOICE_LABEL = `fish:${MODEL}${REFERENCE_ID ? ":" + REFERENCE_ID : ""}`;

const norm = (t) => t.replace(/\s+/g, " ").trim();

// ── Collect every distinct spoken string from the deck JSONs ────────────────
const strings = new Set();
for (const f of readdirSync(DECKS_DIR)) {
  if (!f.endsWith(".json")) continue;
  const deck = JSON.parse(readFileSync(join(DECKS_DIR, f), "utf8"));
  for (const it of deck.items ?? []) {
    for (const k of ["fr", "say", "example"]) {
      if (typeof it[k] === "string" && it[k].trim()) strings.add(norm(it[k]));
    }
  }
}
console.log(`${strings.size} distinct strings from ${DECKS_DIR}`);

mkdirSync(OUT_DIR, { recursive: true });
const manifestPath = join(OUT_DIR, "manifest.json");
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { voice: VOICE_LABEL, entries: {} };

let made = 0, kept = 0, failed = 0;
for (const text of [...strings].sort()) {
  const hash = createHash("sha1").update(text).digest("hex").slice(0, 16);
  const file = `${hash}.mp3`;
  if (manifest.entries[text] === file && existsSync(join(OUT_DIR, file))) { kept++; continue; }
  try {
    const payload = { text, format: "mp3" };
    if (REFERENCE_ID) payload.reference_id = REFERENCE_ID;
    const r = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + KEY, model: MODEL },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(join(OUT_DIR, file), buf);
    manifest.entries[text] = file;
    made++;
    if (made % 50 === 0) console.log(`…${made} synthesised`);
  } catch (e) {
    failed++;
    console.error(`FAILED «${text}»: ${e.message}`);
  }
}

manifest.voice = VOICE_LABEL;
manifest.generatedAt = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`done — ${made} new, ${kept} kept, ${failed} failed, manifest ${Object.keys(manifest.entries).length} entries`);
process.exit(failed > 0 && made === 0 ? 1 : 0);
