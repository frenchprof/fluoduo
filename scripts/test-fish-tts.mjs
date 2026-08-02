/**
 * Fish Audio TTS smoke test (Dan, 2026-08-02) — run this FIRST, before the
 * full bank generation, to confirm the API key + model work and that
 * French accented characters render correctly. Synthesises one accented
 * sentence and saves it locally so it can be listened to directly.
 *
 * Run: FISH_AUDIO_API_KEY=... node scripts/test-fish-tts.mjs
 */
import { writeFileSync } from "node:fs";

const KEY = process.env.FISH_AUDIO_API_KEY;
if (!KEY) {
  console.error("FISH_AUDIO_API_KEY is not set — aborting.");
  process.exit(1);
}

const MODEL = process.env.FISH_TTS_MODEL || "s2.1-pro-free";
const TEXT = "Élève, écoute bien : le café est déjà prêt à côté de la forêt, où l'on entend l'écho.";
const OUT = "fish-tts-test.mp3";

const payload = { text: TEXT, format: "mp3" };
if (process.env.FISH_VOICE_FR_F) payload.reference_id = process.env.FISH_VOICE_FR_F;

console.log(`POST https://api.fish.audio/v1/tts (model=${MODEL})`);
const r = await fetch("https://api.fish.audio/v1/tts", {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${KEY}`, model: MODEL },
  body: JSON.stringify(payload),
});

if (!r.ok) {
  console.error(`FAILED — HTTP ${r.status}`);
  console.error((await r.text()).slice(0, 500));
  process.exit(1);
}

const buf = Buffer.from(await r.arrayBuffer());
writeFileSync(OUT, buf);
console.log(`OK — wrote ${OUT} (${buf.length} bytes)`);
console.log(`Listen and confirm the accents ("Élève", "déjà", "à côté", "l'écho") render correctly.`);
