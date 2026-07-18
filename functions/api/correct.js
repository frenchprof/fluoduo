/**
 * French proofreader backend — a Cloudflare Pages Function (Dan, 2026-07-10:
 * "an option for the text to show as a corrected version with tracked
 * changes look — glaring errors must be flagged out to the learner").
 * Returns ONLY the corrected French; the /tts page renders the tracked-
 * changes diff client-side and offers to adopt the correction.
 *
 * Shares the tutor/compose key — an OpenRouter sk-or-… key in
 * ANTHROPIC_API_KEY, or a native Mistral key in MISTRAL_API_KEY (auto-detected).
 * Provider: Mistral (Dan, 2026-07-10).
 *
 * Contract: POST /api/correct  { text }
 *           → 200 { corrected }  |  503 { error: "not-configured" }  |  502 { error }
 */


// Key + endpoint resolution: the live setup runs an OpenRouter key (sk-or-…)
// in the legacy ANTHROPIC_API_KEY slot (tutor.js does the same); a native
// Mistral key in MISTRAL_API_KEY works too. Same Mistral Large either way.
function resolveProvider(env) {
  const key = env.MISTRAL_API_KEY || env.OPENROUTER_API_KEY || env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return key.startsWith("sk-or-")
    ? { key, url: "https://openrouter.ai/api/v1/chat/completions", model: "mistralai/mistral-large-2512" }
    : { key, url: "https://api.mistral.ai/v1/chat/completions", model: "mistral-large-latest" };
}

// The text is destined to be SPOKEN (this backs the /tts page): inaudible
// typography is out of scope (Dan, 2026-07-18 — the model "corrected"
// «Je suis singapourien» to a capital S: wrong twice over, since nationality
// adjectives are lowercase in French AND capitalisation is inaudible).
const SYSTEM = `You are a precise French proofreader for A1 (absolute beginner) learners.
You receive a French text that will be READ ALOUD. Return ONLY the corrected French text — no preamble, no explanations, no quotes, no markdown.
- Fix real errors only: agreement, conjugation, spelling, wrong words, accents, articles, word order, missing elision (je aime → j'aime).
- NEVER change capitalization or punctuation — they are inaudible, so they are not errors here. Remember that French nationality, language and religion adjectives are correctly lowercase: «Je suis singapourien» is already correct.
- Keep the author's wording, register and sentence structure wherever they are correct — this is proofreading, not rewriting.
- If the text is already correct, return it EXACTLY unchanged.
- If the text is not French at all, return it unchanged.`;

export async function onRequestPost(context) {
  const { request, env } = context;
  const provider = resolveProvider(env);
  if (!provider) return json({ error: "not-configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const text = typeof (body && body.text) === "string" ? body.text.trim().slice(0, 1000) : "";
  if (!text) return json({ error: "no-text" }, 400);

  try {
    const r = await fetch(provider.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + provider.key,
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 600,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: text },
        ],
      }),
    });
    if (!r.ok) return json({ error: "upstream-" + r.status }, 502);
    const data = await r.json();
    const corrected = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
    return json({ corrected: corrected || text });
  } catch {
    return json({ error: "upstream-unreachable" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
