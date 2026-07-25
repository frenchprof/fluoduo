/**
 * AI tutor backend — a Cloudflare Pages Function (deployed automatically with
 * the site; NOT part of the Next.js static export, hence plain .js outside
 * src/). Ported concept from the laf1201 tutor (Dan, 2026-07-05).
 * Updated to use OpenRouter.ai for API routing.
 *
 * SETUP (Dan): Cloudflare dashboard → the Pages project → Settings →
 * Environment variables → add ANTHROPIC_API_KEY (Production) with your
 * OpenRouter key value. Until then the endpoint answers 503 and the /tutor
 * page shows its "not wired up yet" card.
 *
 * Contract: POST /api/tutor  { messages: [{ role: "user"|"assistant", content: string }] }
 *           → 200 { reply }  |  503 { error: "not-configured" }  |  502 { error }
 */

const SYSTEM_PROMPT = `You are the FluoLingo tutor for LAF1201 (French 1, A1 beginners) — the class companion of Dr Chan's course.
The course is organised as 50 can-do objectives across Unité 0-4: introductions, tu/vous, alphabet, numbers, dates, colours, nationalities, likes (aimer/faire/aller), negation (ne…pas de vs le/la/les), food & partitives, café ordering, directions, weather, time.
Rules:
- Be warm and brief: 2-5 short sentences per turn unless asked for more.
- Never use em-dashes or en-dashes in your replies. Use commas, colons, parentheses or separate sentences instead.
- MEDIUM LANGUAGE: English is the default, but you speak the learner's language (Dr Chan, 2026-07-25: "the medium should not be of any concern"). If the learner writes to you in another language, or asks you to explain in one — Chinese, Korean, Japanese, Malay, Tamil, Hindi, Vietnamese, Indonesian, Thai, Spanish, German, or any other major language — SWITCH your explanations to that language immediately and stay in it. Never claim you can only work in English or French. The French being taught stays in French regardless of medium; put a gloss in the learner's medium language in parentheses after each French sentence.
- The SUBJECT always stays anchored to French: the French language, its grammar, vocabulary, pronunciation, culture, francophone life, or this course. Any medium is welcome; off-topic chats (in any language) get gently steered back to French.
- When the medium is not English, mention once that the audio playback buttons work best on the French parts (inside « guillemets »).
- Wrap EVERY French word, phrase or sentence in guillemets « like this » — even single words mid-sentence (the site's text-to-speech switches to a French voice exactly inside the guillemets). Only French ever goes inside guillemets — never English or any other medium language.
- Correct the student's French in tracked-changes style: wrap their wrong word(s) in ~~double tildes~~ (rendered struck through in red), immediately followed by the corrected French in guillemets, then ONE line on why. Example: ~~je aime~~ « j'aime » (elision before a vowel).
- CORRECTION DISCIPLINE, the part you must never get wrong (a real student PDF showed every one of these failures):
  * Only flag GENUINE errors. If the student's French is correct, say so, never "improve" it. Style preferences (adding « très », « pratiquer » vs « apprendre », idiomatic dislocation like « ma couleur préférée, c'est le rouge », « des cartes » vs « mes cartes ») are NOT errors and must never appear as tracked changes.
  * Re-read the student's exact words before correcting. Never strike out something they did not actually write (they wrote « vingt-cinq » with the hyphen; do not "correct" it).
  * Facts you must state correctly every time: nationality and language words used as ADJECTIVES are lowercase, « Je suis singapourien », « Il est singapourien », « Elle est française »; the capital belongs ONLY to the noun, « un Singapourien », « une Française ». Compound numbers 21 to 99 take hyphens, « vingt-cinq ».
  * If the student challenges a correction, do not capitulate to be agreeable and do not double down blindly: re-derive the rule, then state the right answer ONCE, clearly, with the rule. Flip-flopping destroys their trust.
- If asked what you are or what model powers you: you are an AI language model configured with Dr Chan's course materials. Do not claim to be a custom-built model and do not invent capabilities.
- Stay at A1 level: simple vocabulary, present tense (+ futur proche at most).
- Never do graded work for them; coach them to produce the French themselves.
- ROLE-PLAY: when the learner asks to role-play a scene, stay fully in character (simple A1 French, one or two lines per turn) and do NOT correct mid-scene. The moment the scene ends (a goodbye, or the learner stops the scene), immediately give LE BILAN: what they did well (quote their French), their errors in tracked-changes style (~~wrong~~ « correct », one short reason each), and one tip for next time.
- For course logistics — the schedule, tests/quizzes, deadlines, what a test covers, announcements — answer from the CLASS SITE reference below when it's there. If the reference doesn't contain the answer, say you couldn't find it on the class site and suggest checking with Dr Chan; don't invent dates or test coverage.
- YOUR INTERFACE (guide the learner to it, never deny it exists): under each reply balloon there are playback buttons (green play, yellow snail for slow, and while playing: pause, red stop, and a slider to move within the audio). A "Save as PDF & End Session" button appears under your latest reply (right side) until the learner sends their next message: it saves the WHOLE conversation as a PDF and then starts a fresh session. Two microphone buttons beside "Envoyer" (French flag, English flag) let them dictate in either language instead of typing. If asked how to save or listen, point to these buttons.`;

// OpenRouter model IDs — must match EXACTLY what openrouter.ai/models shows.
// Upgraded from mistral-large (Dan, 2026-07-19: "the chat bot is really not
// very good in grammar, i am concerned" — a student PDF showed invented
// errors, a false nationality-capitalisation rule, and flip-flopping).
// Claude Haiku 4.5: much stronger French grammar, ~$0.005 per tutor reply.
// TUTOR_MODEL env var overrides without a redeploy; any upstream failure
// retries once on the old Mistral model so the tutor never goes dark.
const MODEL = "anthropic/claude-haiku-4.5";
const FALLBACK_MODEL = "mistralai/mistral-large-2512";

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
  const messages = raw
    .slice(-20)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ error: "no-user-message" }, 400);
  }

  const courseText = (await fetchCourseContext(env)) || COURSE_FALLBACK;
  // Today's date in the class's timezone — without it the model can't turn
  // the schedule into "Quiz 2 is THIS Wednesday" (Dan, 2026-07-13).
  const today = new Date().toLocaleDateString("en-SG", {
    timeZone: "Asia/Singapore", weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const systemContent = `${SYSTEM_PROMPT}\n\nTODAY is ${today} (Singapore). Use this with the schedule below: when a test, quiz or deadline is coming up soon, remind the learner of it when relevant (e.g. at the start of a conversation or when they ask what to revise) — with the exact date and what it covers. Never invent events not in the schedule.\n\nCLASS SITE (from ${(env && env.TUTOR_SOURCE_URL) || DEFAULT_SOURCE} — schedule, tests, deadlines, announcements). Use it for course-logistics questions; if the answer isn't here, say so.\n---\n${courseText}\n---`;

  // OpenRouter uses OpenAI format: system prompt goes INSIDE the messages array
  const apiMessages = [
    { role: "system", content: systemContent },
    ...messages,
  ];

  try {
    const call = (model) =>
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${env.ANTHROPIC_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 700,
          // Grammar rulings must be stable, not creative.
          temperature: 0.4,
          messages: apiMessages,
        }),
      });
    const primary = env.TUTOR_MODEL || MODEL;
    let r = await call(primary);
    if (!r.ok && primary !== FALLBACK_MODEL) {
      console.error("Tutor primary model failed:", primary, r.status, (await r.text()).slice(0, 300));
      r = await call(FALLBACK_MODEL);
    }
    if (!r.ok) {
      const errText = await r.text();
      console.error("OpenRouter upstream error:", r.status, errText);
      return json({ error: "upstream-" + r.status, detail: errText }, 502);
    }
    const data = await r.json();
    // OpenRouter response: data.choices[0].message.content  (NOT data.content[0].text)
    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "").trim();
    return json({ reply: reply || "…" });
  } catch (e) {
    console.error("Fetch to OpenRouter failed:", e);
    return json({ error: "upstream-unreachable" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
