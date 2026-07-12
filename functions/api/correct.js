/**
 * French proofreader backend — a Cloudflare Pages Function (Dan, 2026-07-10:
 * "an option for the text to show as a corrected version with tracked
 * changes look — glaring errors must be flagged out to the learner").
 * Returns ONLY the corrected French; the /tts page renders the tracked-
 * changes diff client-side and offers to adopt the correction.
 *
 * Shares MISTRAL_API_KEY with the tutor/compose functions — no extra setup.
 * Provider: Mistral (Dan, 2026-07-10).
 *
 * Contract: POST /api/correct  { text }
 *           → 200 { corrected }  |  503 { error: "not-configured" }  |  502 { error }
 */

const SYSTEM = `You are a precise French proofreader for A1 (absolute beginner) learners.
You receive a French text. Return ONLY the corrected French text — no preamble, no explanations, no quotes, no markdown.
- Fix real errors: agreement, conjugation, spelling, accents, articles, word order, missing elision (je aime → j'aime).
- Keep the author's wording, register and sentence structure wherever they are correct — this is proofreading, not rewriting.
- If the text is already correct, return it EXACTLY unchanged.
- If the text is not French at all, return it unchanged.`;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.MISTRAL_API_KEY) return json({ error: "not-configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const text = typeof (body && body.text) === "string" ? body.text.trim().slice(0, 1000) : "";
  if (!text) return json({ error: "no-text" }, 400);

  try {
    const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + env.MISTRAL_API_KEY,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
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
