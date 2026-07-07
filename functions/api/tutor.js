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
- For course logistics — the schedule, tests/quizzes, deadlines, what a test covers, announcements — answer from the CLASS SITE reference below when it's there. If the reference doesn't contain the answer, say you couldn't find it on the class site and suggest checking with Dr Chan; don't invent dates or test coverage.`;

const MODEL = "claude-sonnet-5";

// The class site the tutor reads for schedule / test / announcement questions
// (Dan, 2026-07-07). Overridable via env so it can be re-pointed without a
// redeploy. Fetched server-side by the Worker (not the browser) and edge-cached.
const DEFAULT_SOURCE = "https://st2fr26.withdrchan.com/";

async function fetchCourseContext(env) {
  const url = (env && env.TUTOR_SOURCE_URL) || DEFAULT_SOURCE;
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 1800, cacheEverything: true },
      headers: { "user-agent": "FluoLingoTutor/1.0 (+https://fluolingo)" },
    });
    if (!res.ok) return "";
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 12000); // bound the prompt spend
  } catch {
    return "";
  }
}

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

  const courseText = await fetchCourseContext(env);
  const system = courseText
    ? `${SYSTEM_PROMPT}\n\nCLASS SITE (live, from ${(env && env.TUTOR_SOURCE_URL) || DEFAULT_SOURCE} — schedule, tests, announcements). Use it for course-logistics questions; if the answer isn't here, say so.\n---\n${courseText}\n---`
    : SYSTEM_PROMPT;

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
        system,
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
