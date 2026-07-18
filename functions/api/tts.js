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

const VOICES = {
  "fr-f": { languageCode: "fr-FR", name: "fr-FR-Neural2-A" },
  "fr-m": { languageCode: "fr-FR", name: "fr-FR-Neural2-B" },
  "en-f": { languageCode: "en-US", name: "en-US-Neural2-F" },
  "en-m": { languageCode: "en-US", name: "en-US-Neural2-D" },
};

export async function onRequestPost(context) {
  const { request, env } = context;
  // Provider preference (Dan, 2026-07-13: "integrate Voxtral as TTS";
  // 2026-07-18: "how do I choose the TTS engine"): with BOTH keys present the
  // engine used to be whichever won the try-order, invisible from the page.
  // TTS_PROVIDER (Cloudflare env var, "google" or "mistral") now pins it —
  // no code change needed to switch. Unset → Mistral first (native
  // MISTRAL_API_KEY only; the OpenRouter sk-or- key can NOT reach Mistral's
  // audio endpoint), Google as fallback. Neither key → 503.
  if (!env.MISTRAL_API_KEY && !env.GOOGLE_TTS_API_KEY) return json({ error: "not-configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const text = typeof (body && body.text) === "string" ? body.text.trim().slice(0, 1000) : "";
  if (!text) return json({ error: "no-text" }, 400);
  const voice = VOICES[body && body.voice] || VOICES["fr-f"];
  const rate = Math.min(1.4, Math.max(0.5, Number(body && body.rate) || 1));
  // Engine pin: a per-request `engine` (the page's admin-only A/B toggle,
  // Dan 2026-07-18: "how do I know how each one sounds") beats the
  // TTS_PROVIDER env pin. A pin pointing at a missing key must not brick
  // the studio — fall back to whichever engine has a key.
  const reqEngine = typeof (body && body.engine) === "string" ? body.engine.toLowerCase() : "";
  const pin = reqEngine === "google" || reqEngine === "mistral" ? reqEngine : (env.TTS_PROVIDER || "").trim().toLowerCase();
  const tryMistral = Boolean(env.MISTRAL_API_KEY) && (pin !== "google" || !env.GOOGLE_TTS_API_KEY);

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
          headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
        });
      }
    } catch (e) {
      console.error("Mistral TTS unreachable:", e);
      if (!env.GOOGLE_TTS_API_KEY) return json({ error: "upstream-unreachable" }, 502);
    }
  }

  try {
    const r = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize?key=" + env.GOOGLE_TTS_API_KEY,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice,
          audioConfig: { audioEncoding: "MP3", speakingRate: rate },
        }),
      },
    );
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
      },
    });
  } catch {
    return json({ error: "upstream-unreachable" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
