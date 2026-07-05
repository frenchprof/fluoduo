/**
 * AI café-waiter backend — a Cloudflare Pages Function (deploys with the site;
 * plain JS, not part of the Next build). Replaces the rule-based state machine
 * for Compose It's dialogue mode (Dan, 2026-07-05: the rules still accepted
 * nonsense like "Je prends Au revoir" — the waiter must actually understand).
 *
 * SETUP is shared with the tutor: the same ANTHROPIC_API_KEY env var on the
 * Pages project. Until it exists the endpoint answers 503 and ComposeDialogue
 * falls back to its rule-based engine.
 *
 * Contract: POST /api/compose  { scene, menu?, messages:[{role,content}] }
 *           → 200 { reply, done }  |  503 { error:"not-configured" }
 */

const SCENES = {
  cafe: {
    persona:
      "You are « le serveur », a warm, patient café waiter role-playing with an A1 French beginner who is practising how to order.",
    menu: `MENU (name — price):
un croissant — 2€ · un sandwich au fromage — 5€ · une salade verte — 6€ · une soupe à l'oignon — 7€ · un steak-frites — 12€ · une crêpe au chocolat — 4€
un café — 3€ · un thé — 3€ · un jus d'orange — 4€ · une eau minérale — 3€ · un coca — 4€`,
    flow: `FLOW: greet → take the order → if they have no drink yet ask « Et comme boisson ? » → « Autre chose ? » → when they finish (C'est tout / Non merci / l'addition), ADD UP the prices of what they actually ordered and say « Ça fait X euros. » → then a warm goodbye and set done=true.`,
  },
  // The itinerary builder (Compose It "solo" directions) used to accept any
  // string of chips with nothing checking the French (Dan, 2026-07-05). This
  // scene is a lost passer-by who READS the learner's whole set of directions
  // in one shot and reacts: confirms if they'd get there, else names the one
  // step that doesn't make sense. `context` carries this session's A→B route.
  directions: {
    persona:
      "You are « un passant » (a friendly passer-by) lost in a French town. An A1 French beginner has written you walking directions and you must react in character.",
    menu: "",
    flow: `FLOW: You receive the learner's full directions in one message. If they are clear, plausible French that would plausibly get you to the destination, react warmly, echo the route in your own words to show you followed it (« Alors je tourne à gauche, puis tout droit jusqu'au carrefour… »), thank them and set done=true. If a step is garbled, not real French, or contradictory, stay in character, DO NOT set done, and gently ask them to fix that ONE step (« Pardon, je tourne où exactement ? »). Never invent directions they didn't give.`,
  },
};

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) return json({ error: "not-configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const scene = SCENES[body && body.scene] || SCENES.cafe;
  // Per-session specifics (e.g. the directions route "from le parc to la gare").
  const context = typeof (body && body.context) === "string" ? body.context.slice(0, 300) : "";
  const messages = (Array.isArray(body && body.messages) ? body.messages : [])
    .slice(-24)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json({ error: "no-user-message" }, 400);
  }

  const system = `${scene.persona}
${scene.menu ? `\n${scene.menu}\n` : ""}
${scene.flow}
${context ? `\nTHIS SESSION: ${context}` : ""}

RULES:
- Reply ONLY in simple French, 1-2 short A1 sentences.
- If the customer's message is NOT coherent French, or jams fragments that don't form a real request (e.g. "un coca c'est tout", "je prends au revoir"), DO NOT accept it: stay in character and gently ask them to rephrase, e.g. « Pardon ? Vous voulez commander quoi ? ». Never bill or advance on nonsense.
- When they're close but missing a word, model the fix warmly (e.g. « Un croissant ET un coca, très bien ! »).
- Be encouraging; never switch to English.

Respond with ONLY a JSON object, no other text:
{"reply": "<your French line>", "done": <true ONLY after you have said goodbye>}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 300, system, messages }),
    });
    if (!r.ok) return json({ error: "upstream-" + r.status }, 502);
    const data = await r.json();
    const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    let reply = raw;
    let done = false;
    try {
      const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));
      if (parsed && typeof parsed.reply === "string") {
        reply = parsed.reply;
        done = parsed.done === true;
      }
    } catch {
      // model didn't return clean JSON — use its text as the reply
    }
    return json({ reply: reply || "…", done });
  } catch {
    return json({ error: "upstream-unreachable" }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
