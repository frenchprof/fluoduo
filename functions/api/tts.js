/**
 * MP3 generator backend — a Cloudflare Pages Function (deploys with the site;
 * plain JS, not part of the Next build). The browser speechSynthesis engine
 * the site uses everywhere is free but exposes NO timeline and NO audio
 * stream — nothing to scrub, nothing to save (Dan, 2026-07-10: "The TTS page
 * was supposed to have an mp3 generator… no stop, play, forward, rewind").
 * Real transport controls need a real audio file, so this calls Google Cloud
 * Text-to-Speech and returns an MP3 the page can play in a native <audio>
 * player (play/pause/drag-to-seek) and download.
 *
 * SETUP (Dan): Google Cloud console → project laf1201 → enable the
 * "Cloud Text-to-Speech API" → Credentials → Create API key (restrict it to
 * that one API) → Cloudflare Pages → Settings → Environment variables → add
 * GOOGLE_TTS_API_KEY (encrypted, Production). Until then this answers 503
 * and the page hides the MP3 studio. Free tier: ~1M Neural2 chars/month.
 *
 * Contract: POST /api/tts  { text, voice?: "fr-f"|"fr-m"|"en-f"|"en-m", rate?: number,
 *                            engine?: "google"|"mistral" }
 *           → 200 audio/mpeg  |  503 { error: "not-configured" }  |  502 { error }
 */

// Two Google voice generations (Dan, 2026-07-18: "google neurals sound so
// unhuman"): Chirp 3 HD is the current, far more natural family — same API,
// same 1M-chars/month free tier — with quirks: no SSML, and speakingRate
// support varies. So: try HD first (rate sent only when ≠1), and any non-OK
// answer retries the same request on the classic Neural2 voice, which
// accepts everything. Worst case a clip sounds like it did before.
const VOICES_HD = {
  "fr-f": { languageCode: "fr-FR", name: "fr-FR-Chirp3-HD-Kore" },
  "fr-m": { languageCode: "fr-FR", name: "fr-FR-Chirp3-HD-Charon" },
  "en-f": { languageCode: "en-US", name: "en-US-Chirp3-HD-Kore" },
  "en-m": { languageCode: "en-US", name: "en-US-Chirp3-HD-Charon" },
};
const VOICES = {
  "fr-f": { languageCode: "fr-FR", name: "fr-FR-Neural2-A" },
  "fr-m": { languageCode: "fr-FR", name: "fr-FR-Neural2-B" },
  "en-f": { languageCode: "en-US", name: "en-US-Neural2-F" },
  "en-m": { languageCode: "en-US", name: "en-US-Neural2-D" },
};

export async function onRequestPost(context) {
  const { request, env } = context;
  // Neither key → 503 (engine choice happens after the body is parsed).
  // Note the OpenRouter sk-or- key can NOT reach Mistral's audio endpoint —
  // only a native MISTRAL_API_KEY counts.
  if (!env.MISTRAL_API_KEY && !env.GOOGLE_TTS_API_KEY) return json({ error: "not-configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const text = typeof (body && body.text) === "string" ? body.text.trim().slice(0, 1000) : "";
  if (!text) return json({ error: "no-text" }, 400);
  const voiceKey = VOICES[body && body.voice] ? body.voice : "fr-f";
  const rate = Math.min(1.4, Math.max(0.5, Number(body && body.rate) || 1));
  // Engine choice (Dan, 2026-07-18: "only use google api for tts from now"):
  // GOOGLE is the default whenever its key exists — its Neural2 pair is the
  // only engine that honours the page's 👩/👨 voice choice (Mistral's sole
  // French voice is Marie). Mistral speaks only when explicitly asked — the
  // admin 🎛 button's per-request `engine`, or TTS_PROVIDER=mistral — or
  // when the Google key is missing. Pins never brick the studio: a pin
  // pointing at a missing key falls back to whichever engine has one.
  const reqEngine = typeof (body && body.engine) === "string" ? body.engine.toLowerCase() : "";
  const pin = reqEngine === "google" || reqEngine === "mistral" ? reqEngine : (env.TTS_PROVIDER || "").trim().toLowerCase();
  const tryMistral = Boolean(env.MISTRAL_API_KEY) && (pin === "mistral" || !env.GOOGLE_TTS_API_KEY);

  // ── Mistral TTS (docs.mistral.ai → Studio API → audio → text_to_speech).
  // OpenAI-compatible shape; model/voice are env-overridable so the exact
  // ids from the docs can be set without a redeploy of code:
  //   MISTRAL_TTS_MODEL  (e.g. the TTS model id shown in the docs)
  //   MISTRAL_TTS_VOICE  (a voice id from the docs; optional)
  if (tryMistral) {
    try {
      const payload = {
        model: env.MISTRAL_TTS_MODEL || "voxtral-tts-latest",
        input: text,
        response_format: "mp3",
        speed: rate,
      };
      if (env.MISTRAL_TTS_VOICE) payload.voice = env.MISTRAL_TTS_VOICE;
      const r = await fetch("https://api.mistral.ai/v1/audio/speech", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + env.MISTRAL_API_KEY,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const detail = await r.text();
        console.error("Mistral TTS upstream error:", r.status, detail);
        // If Google is also configured, fall through to it instead of failing.
        if (!env.GOOGLE_TTS_API_KEY) return json({ error: "upstream-" + r.status, detail: detail.slice(0, 400) }, 502);
      } else {
        const buf = await r.arrayBuffer();
        return new Response(buf, {
          // x-tts-engine: proof of provenance (Dan, 2026-07-18: "how do we
          // know it will go to google") — the page shows it to admins.
          headers: { "content-type": "audio/mpeg", "cache-control": "no-store", "x-tts-engine": "mistral" },
        });
      }
    } catch (e) {
      console.error("Mistral TTS unreachable:", e);
      if (!env.GOOGLE_TTS_API_KEY) return json({ error: "upstream-unreachable" }, 502);
    }
  }

  try {
    const synth = (v) =>
      fetch("https://texttospeech.googleapis.com/v1/text:synthesize?key=" + env.GOOGLE_TTS_API_KEY, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: v,
          // speakingRate only when the caller actually wants one — the HD
          // voices can reject the parameter, and a plain request gives them
          // their best shot before the Neural2 retry below.
          audioConfig: rate === 1 ? { audioEncoding: "MP3" } : { audioEncoding: "MP3", speakingRate: rate },
        }),
      });
    let used = VOICES_HD[voiceKey];
    let r = await synth(used);
    if (!r.ok) {
      used = VOICES[voiceKey];
      r = await synth(used);
    }
    if (!r.ok) return json({ error: "upstream-" + r.status }, 502);
    const data = await r.json();
    if (!data || typeof data.audioContent !== "string") return json({ error: "no-audio" }, 502);
    const bin = atob(data.audioContent);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Response(bytes, {
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "no-store",
        "x-tts-engine": "google:" + used.name,
      },
    });
  } catch {
    return json({ error: "upstream-unreachable" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
