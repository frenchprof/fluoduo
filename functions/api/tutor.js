const SYSTEM_PROMPT = `You are the FluoLingo tutor for LAF1201 (French 1, A1 beginners) — the class companion of Dr Chan's course.
The course is organised as 50 can-do objectives across Unité 0-4: introductions, tu/vous, alphabet, numbers, dates, colours, nationalities, likes (aimer/faire/aller), negation (ne…pas de vs le/la/les), food & partitives, café ordering, directions, weather, time.
Rules:
- Be warm and brief: 2-5 short sentences per turn unless asked for more.
- Answer in English with the French examples IN French; put an English gloss in parentheses after each French sentence.
- Gently correct the student's French: show the corrected sentence, then ONE line on why.
- Stay at A1 level: simple vocabulary, present tense (+ futur proche at most).
- Never do graded work for them; coach them to produce the French themselves.
- For course logistics — the schedule, tests/quizzes, deadlines, what a test covers, announcements — answer from the CLASS SITE reference below when it's there. If the reference doesn't contain the answer, say you couldn't find it on the class site and suggest checking with Dr Chan; don't invent dates or test coverage.`;

const MODEL = "meta-llama/llama-3.1-8b-instruct";

const DEFAULT_SOURCE = "https://st2fr26.withdrchan.com/";

const COURSE_FALLBACK = `LAF1201 French 1 — Special Term 2, 2025/26 (NUS, Centre for Language Studies). 22 June → 29 July 2026, Mondays & Wednesdays 1pm–4pm, room AS8-04-01. 100% continuous assessment — NO final exam.
Weights: Tests (Reading+Writing) 40% · Oral (Listening+Speaking) 35% · Quizzes 10% · Homework (e-learning + group project) 10% · Attendance & participation 5%.
Schedule (unit coverage + assessments):
- Week 1: Mon 22 Jun Unit 0–1 · Wed 24 Jun Unit 1
- Week 2: Mon 29 Jun Unit 1–2 — QUIZ 1 · Wed 1 Jul Unit 2
- Week 3: Mon 6 Jul Unit 2–3 · Wed 8 Jul Unit 3 — TEST 1 (Vodcast HW due 8 Jul 23:59)
- Week 4: Mon 13 Jul Unit 3 · Wed 15 Jul Unit 4 — QUIZ 2
- Week 5: Mon 20 Jul Unit 4 · Wed 22 Jul E-learning (Cultural project «Voyage francophone» due Fri 24 Jul 23:59)
- Week 6: Mon 27 Jul Unit 4 · Wed 29 Jul Review — FINAL + ORAL TEST
What each covers:
- Quizzes ×2 — short in-class checks on the most recent units (vocab, grammar, basic comprehension). Quiz 1 = Mon 29 Jun; Quiz 2 = Wed 15 Jul.
- Tests ×2 (40%) — reading comprehension + writing at A1. Test 1 = Wed 8 Jul, covers Units 2–3.
- Oral test — role-play (pair/trio) on the final day (Wed 29 Jul): three scenarios to prepare (1 premier jour à NUS, 2 au restaurant, 3), one drawn at random. See oraltest.withdrchan.com.
- Vodcast — 2-minute self-introduction video in French, due 8 July 23:59.
- «Voyage francophone» cultural project — reflection under 250 words on a Francophone-culture activity in Singapore, due Fri 24 July 23:59.
Textbook: L'atelier+ A1 (2022 edition, with the "+") — Livre de l'élève + Cahier d'activités.`;

async function fetchCourseContext(env) {
  const url = (env && env.TUTOR_SOURCE_URL) || DEFAULT_SOURCE;
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 1800, cacheEverything: true },
      headers: { "user-agent": "FluoLingoTutor/1.0 (+https://fluolingo)" },
    });
    if (!res.ok) return "";
    const html = await res.text();
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim();
    return text.slice(0, 24000);
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
  const messages = raw.slice(-20).filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ error: "no-user-message" }, 400);
  }

  const courseText = (await fetchCourseContext(env)) || COURSE_FALLBACK;
  const system = `${SYSTEM_PROMPT}\n\nCLASS SITE (from ${(env && env.TUTOR_SOURCE_URL) || DEFAULT_SOURCE} — schedule, tests, deadlines, announcements). Use it for course-logistics questions; if the answer isn't here, say so.\n---\n${courseText}\n---`;

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${env.ANTHROPIC_API_KEY}`,
        "HTTP-Referer": "https://fluolingo.pages.dev",
        "X-Title": "FluoLingo Tutor",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          ...messages
        ],
      }),
    });

    let data;
    try {
      data = await r.json();
    } catch (parseError) {
      return json({ error: `upstream-invalid-json` }, 502);
    }

    if (!r.ok) {
      const orError = (data && data.error && data.error.message) || `Status ${r.status}`;
      return json({ error: `upstream-${r.status}: ${orError}` }, 502);
    }

    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "…";
    return json({ reply: reply.trim() });
  } catch (err) {
    return json({ error: `upstream-unreachable: ${err.message}` }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
