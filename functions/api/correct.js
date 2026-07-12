/**
 * French proofreader backend — a Cloudflare Pages Function (Dan, 2026-07-10:
 * "an option for the text to show as a corrected version with tracked
 * changes look — glaring errors must be flagged out to the learner").
 * Returns ONLY the corrected French; the /tts page renders the tracked-
 * changes diff client-side and offers to adopt the correction.
 *
 * Shares ANTHROPIC_API_KEY with the tutor/compose functions — no extra setup.
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
  if (!env.ANTHROPIC_API_KEY) return json({ error: "not-configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const text = typeof (body && body.text) === "string" ? body.text.trim().slice(0, 1000) : "";
  if (!text) return json({ error: "no-text" }, 400);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 600,
        system: SYSTEM,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!r.ok) return json({ error: "upstream-" + r.status }, 502);
    const data = await r.json();
    const corrected = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return json({ corrected: corrected || text });
  } catch {
    return json({ error: "upstream-unreachable" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
