/**
 * Pre-generate the TTS audio bank (Dan, 2026-07-10: same studio voice on
 * every device; browser voices differ per machine). Reads every deck JSON,
 * collects each item's spoken strings (fr, say, example), synthesises each
 * once with Google Cloud TTS, and writes:
 *
 *   public/tts-bank/<hash>.mp3        one clip per distinct string
 *   public/tts-bank/manifest.json     { voice, generatedAt, entries: { "<normalized text>": "<hash>.mp3" } }
 *
 * The runtime (games/letris/speech.ts) looks up the manifest before falling
 * back to the browser voice, so a partial or missing bank never breaks
 * anything. Idempotent: existing clips are kept, only new strings are
 * synthesised — re-run after deck edits to top up.
 *
 * Run: GOOGLE_TTS_API_KEY=... node scripts/generate-tts-bank.mjs
 * Or:  GitHub → Actions → "Generate TTS bank" (uses the repo secret).
 *
 * Cost: ~770 strings ≈ 10k characters ≈ 1% of Google's FREE monthly Neural2
 * tier for the entire bank.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.GOOGLE_TTS_API_KEY;
if (!KEY) {
  console.error("GOOGLE_TTS_API_KEY is not set — aborting (nothing written).");
  process.exit(1);
}

const DECKS_DIR = "src/content/collections";
const OUT_DIR = "public/tts-bank";
// The site-wide narrator: same voice the /api/tts studio's « Voix A » uses.
const VOICE = { languageCode: "fr-FR", name: "fr-FR-Neural2-A" };

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
  : { voice: VOICE.name, entries: {} };

let made = 0, kept = 0, failed = 0;
for (const text of [...strings].sort()) {
  const hash = createHash("sha1").update(text).digest("hex").slice(0, 16);
  const file = `${hash}.mp3`;
  if (manifest.entries[text] === file && existsSync(join(OUT_DIR, file))) { kept++; continue; }
  try {
    const r = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize?key=" + KEY,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: VOICE,
          audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
        }),
      },
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const { audioContent } = await r.json();
    writeFileSync(join(OUT_DIR, file), Buffer.from(audioContent, "base64"));
    manifest.entries[text] = file;
    made++;
    if (made % 50 === 0) console.log(`…${made} synthesised`);
  } catch (e) {
    failed++;
    console.error(`FAILED «${text}»: ${e.message}`);
  }
}

manifest.voice = VOICE.name;
manifest.generatedAt = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`done — ${made} new, ${kept} kept, ${failed} failed, manifest ${Object.keys(manifest.entries).length} entries`);
process.exit(failed > 0 && made === 0 ? 1 : 0);
