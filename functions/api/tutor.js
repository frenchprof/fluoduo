/**
 * AI tutor backend — a Cloudflare Pages Function (deployed automatically with
 * the site; NOT part of the Next.js static export, hence plain .js outside
 * src/). Ported concept from the laf1201 tutor (Dan, 2026-07-05).
 *
 * SETUP (Dan): Cloudflare dashboard → the Pages project → Settings →
 * Environment variables → add ANTHROPIC_API_KEY (Production). Until then the
 * endpoint answers 503 and the /tutor page shows its "not wired up yet" card.
 *
 * Contract: POST /api/tutor  { messages: [{ role: "user"|"assistant", content: string }] }
 *           → 200 { reply }  |  503 { error: "not-configured" }  |  502 { error }
 */

// Edit freely — this is the tutor's whole personality. Replace with the
// laf1201 tutor prompt (or merge the two) when Dan digs it out.
const SYSTEM_PROMPT = `You are the FluoLingo tutor for LAF1201 (French 1, A1 beginners) — the class companion of Dr Chan's course.
The course is organised as 50 can-do objectives across Unité 0-4: introductions, tu/vous, alphabet, numbers, dates, colours, nationalities, likes (aimer/faire/aller), negation (ne…pas de vs le/la/les), food & partitives, café ordering, directions, weather, time.
Rules:
- Be warm and brief: 2-5 short sentences per turn unless asked for more.
- Answer in English with the French examples IN French; put an English gloss in parentheses after each French sentence.
- Gently correct the student's French: show the corrected sentence, then ONE line on why.
- Stay at A1 level: simple vocabulary, present tense (+ futur proche at most).
- Never do graded work for them; coach them to produce the French themselves.
- If asked something outside French learning, redirect kindly to the course.`;

const MODEL = "claude-sonnet-5";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "not-configured" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const raw = Array.isArray(body && body.messages) ? body.messages : [];
  // Hard caps: this endpoint is public on the site, so bound the spend.
  const messages = raw
    .slice(-20)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ error: "no-user-message" }, 400);
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
    if (!r.ok) {
      return json({ error: "upstream-" + r.status }, 502);
    }
    const data = await r.json();
    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return json({ reply: reply || "…" });
  } catch {
    return json({ error: "upstream-unreachable" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
