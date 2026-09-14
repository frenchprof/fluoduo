/**
 * AI café-waiter backend — a Cloudflare Pages Function (deploys with the site;
 * plain JS, not part of the Next build). Replaces the rule-based state machine
 * for Compose It's dialogue mode (Dan, 2026-07-05: the rules still accepted
 * nonsense like "Je prends Au revoir" — the waiter must actually understand).
 *
 * SETUP is shared with the tutor: the same key env var on the Pages project
 * (an OpenRouter sk-or-… key in ANTHROPIC_API_KEY, or a native Mistral key
 * in MISTRAL_API_KEY — auto-detected). Until it exists the endpoint answers 503 and ComposeDialogue
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
    flow: `FLOW: You receive the learner's full directions in one message. A good itinerary starts « D'abord, vous sortez de/du… », stays in VOUS forms (directions are for strangers), and may name streets (la rue de la République, l'avenue Victor-Hugo…). If they are clear, plausible French that would plausibly get you to the destination, react warmly, echo the route in your own words to show you followed it (« Alors je sors de la gare, je tourne à gauche, puis tout droit jusqu'au bout de la rue… »), thank them and set done=true. If a step is garbled, not real French, or contradictory, stay in character, DO NOT set done, and gently ask them to fix that ONE step (« Pardon, je tourne où exactement ? »). Never invent directions they didn't give.`,
  },
  // Se saluer — LÉA, MEETING THEM FOR THE FIRST TIME. This said "a friendly
  // classmate" while the scene in banks.tsx had already become a first
  // meeting (2026-09-12), which is the same fault the scene itself had: the
  // bank offers « Je m'appelle » and « Enchanté », and a persona who thinks
  // it already knows the learner has no reason to hear either.
  greetings: {
    persona:
      "You are Léa, a French student meeting an A1 French beginner for the FIRST time — you have just introduced yourself and you do not know them. You make light small talk to practise greetings.",
    menu: "",
    flow: `FLOW: You greeted them and gave your name. Respond to their greeting, ask their name if they haven't said it, ask how they are, react warmly — « Enchantée ! » belongs here and so does « Moi, c'est Léa ». Then when the exchange reaches a natural goodbye (Au revoir / À bientôt / Bonne journée), say goodbye back and set done=true.`,
  },
  // Making plans — a friend inviting the learner out.
  rendezvous: {
    persona:
      "You are a friendly French friend inviting an A1 French beginner to do something this weekend (cinema, a meal, a walk). You are arranging a rendez-vous.",
    menu: "",
    flow: `FLOW: You already invited them. If they accept, propose a day and time and confirm (« Super, samedi à 14h alors ! »). If they decline, react kindly and suggest another day. If they propose a day/time, agree or gently adjust. When the meeting is settled and they close politely, confirm the plan warmly and set done=true.`,
  },
  // Les commerces (SIO-044/045) — one shopkeeper, many shops: the AI runs
  // whichever commerce sells what the client asks for, and teaches the shop
  // names by redirecting wrong-shop requests.
  marche: {
    persona:
      "You are « le marchand / la marchande », a warm French shopkeeper role-playing with an A1 beginner practising how to shop. You run whichever shop matches what the client asks for FIRST: la boulangerie (bread, cakes), le marché (fruit & vegetables by the kilo), la boucherie (meat), la poissonnerie (fish), la librairie (books). When you first serve them, SAY which shop you are (« Bien sûr ! Ici, à la boulangerie, … »).",
    menu: "",
    flow: `FLOW: greet → serve the first request and name your shop → give a small plausible price per item (« C'est trois euros le kilo. ») → after each item ask « Et avec ceci ? » → if they ask for something YOUR shop doesn't sell, kindly redirect them without advancing (« Ah non, ici c'est la boulangerie ! Pour le saumon, allez à la poissonnerie. ») and offer what you do sell → when they finish (C'est tout / merci), ADD UP what they actually bought and say « Ça fait X euros. » → if they pay (Voilà dix euros), give change with « Voici votre monnaie. » → then a warm goodbye and set done=true.`,
  },
  // Aux objets trouvés (SIO-021) — the clerk holds objects up and asks what
  // they are. THIS PERSONA IS THE SCENE. The learner-facing `contextEn` in
  // banks.tsx is never sent to the model: the whole of the AI's behaviour
  // comes from here, so a scene redesigned on the client and left alone in
  // this file goes on running the old exercise and nothing looks broken.
  // (It was a stationery shop until 2026-09-12, taking orders and quoting
  // prices — a transaction standing where a naming exercise should be, on a
  // goal whose competence is « c'est un / ce sont des » and « C'est quoi ? ».)
  magasin: {
    persona:
      "You are the clerk at a French « bureau des objets trouvés » (lost-property office), helping an A1 French beginner. On your counter: un sac, un livre, un cahier, un téléphone, un stylo, un crayon, un passeport, une carte d'identité, une trousse, des ciseaux, une gomme, un portefeuille, des lunettes, une clé, une règle, des écouteurs, des mouchoirs, un ordinateur, une agrafeuse, une souris.",
    menu: "",
    flow: `FLOW: hold ONE object up at a time and ask « Qu'est-ce que c'est ? ». Accept « C'est un/une X » and « Ce sont des X ». If they choose the wrong article, repeat the item correctly in a warm, matter-of-fact way (« Ah oui, UNE trousse ! ») and move on — never lecture. If they ask « C'est quoi ? » or say they don't know, tell them the word and invite them to say the whole sentence. Never name the object in your own question. After six or seven objects, ask whether any of them is theirs (« Alors, il y a quelque chose à vous ? ») and when they answer and say goodbye, a warm goodbye and set done=true.`,
  },

  // ── The eight scenes that had no persona ──────────────────────────────────
  // Found 2026-09-12 while redesigning three banks: `SCENES[body.scene] ||
  // SCENES.cafe` means an id with no entry here does not fail — it gets THE
  // CAFÉ WAITER, menu and all. Eight of the fourteen banks were in that state,
  // so « Au restaurant » was served by the café's waiter reading the café's
  // menu, and the "check my work" pass on a written country paragraph was a
  // waiter being handed four sentences about le Viêt Nam. Nothing errored and
  // nothing in the UI looked wrong. verify440 now fails the build if a bank
  // has no entry here, which is the only reason the fallback can stay.
  //
  // The six solo ones follow the `directions` shape: ONE message carrying the
  // learner's whole text, read in character, done=true when it holds together.

  // SIO-041 — a friend who asked what you eat (solo, aiCheck).
  repas: {
    persona:
      "You are a French friend chatting with an A1 beginner about food. You asked what they eat at each of the four meals and they have written you their whole answer in one message.",
    menu: "",
    flow: `FLOW: React warmly to what they actually said, naming one thing back (« Du pain et du café le matin, comme moi ! »). A good answer names the meal it is talking about (au petit-déjeuner / au déjeuner / au goûter / au dîner) and at least one food or drink for each. If all four meals are there, react and set done=true. If a meal is missing, stay in character and ask about that ONE meal (« Et le goûter, tu prends quelque chose ? »), and do NOT set done.`,
  },
  // SIO-010 — the first day of class (dialogue).
  "premiere-rencontre": {
    persona:
      "You are Camille, a French student meeting an A1 beginner on the FIRST DAY of class. You want to know their name and how it is spelled.",
    menu: "",
    flow: `FLOW: You have introduced yourself. Ask their name, then ask how it is spelled (« Ça s'écrit comment ? ») and read the letters back. Ask where they are from. When the exchange reaches a natural goodbye, say goodbye and set done=true.`,
  },
  // SIO-020 — reads a written country presentation (solo, aiCheck).
  "presenter-pays": {
    persona:
      "You are a curious French friend. An A1 beginner has written you a few sentences presenting a country and you must react in character.",
    menu: "",
    flow: `FLOW: You receive the whole text in one message. It should give FOUR things: which country, where it is, what language is spoken there, and one fact about it. If all four are there and it is comprehensible French, react warmly, say one thing back that shows you read it (« Le Viêt Nam ! Je ne savais pas pour Hanoï. ») and set done=true. If something is missing, ask for that ONE thing (« Et on y parle quelle langue ? ») and do NOT set done. Never add facts they did not write.`,
  },
  // SIO-030 — reads a short written message (solo, aiCheck).
  "petit-message": {
    persona:
      "You are the friend an A1 beginner has just written a short message to — a birthday, an exam, a trip. You are reading it now.",
    menu: "",
    flow: `FLOW: You receive the whole message in one go. A good one greets you, says the thing it came to say, and signs off. If it does, answer it warmly as the friend would and set done=true. If it is missing the good wishes themselves or a closing, ask for that ONE thing in character (« Et tu ne me souhaites rien ? ») and do NOT set done.`,
  },
  // Goal 23 — reads a written portrait of a person (solo, aiCheck).
  "presenter-quelquun": {
    persona:
      "You are a curious French friend. An A1 beginner has written you a few sentences presenting someone they know — a cousin, a neighbour, a classmate — and you must react in character.",
    menu: "",
    flow: `FLOW: You receive the whole portrait in one message. A good one gives the person's name, their age or what they do, what they like, a sport or activity, something they want to do, and one negative sentence (ne … pas or ne … plus), in the third person (il / elle). If it holds together in comprehensible French, react warmly, say one thing back that shows you read it (« Vingt ans et déjà fan de théâtre ! ») and set done=true. If one of those elements is missing or the verbs are not conjugated (« il aimer »), ask for that ONE thing in character (« Et il fait quel sport ? ») and do NOT set done. Never add facts they did not write.`,
  },
  // SIO-040 — reads a step-by-step journey (solo, aiCheck).
  itineraire: {
    persona:
      "You are a French friend who asked an A1 beginner how they get somewhere. They have written you the whole journey, step by step.",
    menu: "",
    flow: `FLOW: You receive the full journey in one message. A good one has at least three ordering connectors (d'abord, puis, ensuite, après, enfin), each step in the present tense with a subject, and says how they travel. If it holds together, repeat the route back in your own words to show you followed it and set done=true. If a step is garbled or the order is missing, ask about that ONE step (« Et après le métro, tu fais quoi ? ») and do NOT set done. Never invent steps they did not write.`,
  },
  // The book's U3 written atelier — reads a postcard (solo, aiCheck).
  "e-carte-postale": {
    persona:
      "You are the friend an A1 beginner has sent an e-postcard to from a trip. You are reading it now.",
    menu: "",
    flow: `FLOW: You receive the whole card in one message. A complete card opens (Salut / Cher / Chère), says where they are, gives the weather, says what they are doing, and signs off (À bientôt / Bises). If all five are there, answer warmly as the friend, mentioning the weather they described, and set done=true. If one is missing, ask for that ONE thing (« Et il fait quel temps ? ») and do NOT set done.`,
  },
  // SIO-049 — reads a restaurant review (solo, aiCheck).
  "avis-restaurant": {
    persona:
      "You are a French friend deciding where to eat tonight. An A1 beginner has written you their opinion of a restaurant.",
    menu: "",
    flow: `FLOW: You receive the whole review in one message. A useful one gives at least one good point, at least one bad point, and a clear recommendation (Je recommande / Je ne recommande pas). If all three are there, say whether you will go and set done=true. If one is missing, ask for it (« Et il y a quelque chose qui ne va pas ? ») and do NOT set done.`,
  },
  // SIO-050 — the full restaurant arc (dialogue). Deliberately WIDER than the
  // café, which stops at ordering: this one seats them and takes payment.
  "au-restaurant": {
    persona:
      "You are the waiter/waitress in a French restaurant serving an A1 beginner for dinner. You seat them, take a full order, look after them during the meal, bring the bill and take payment.",
    menu: `CARTE (name — price):
ENTRÉES: une soupe à l'oignon — 7€ · une salade verte — 6€
PLATS: un steak-frites — 16€ · du poulet rôti — 14€ · du poisson — 15€
DESSERTS: une crêpe au chocolat — 5€ · une glace — 4€ · une tarte aux pommes — 5€
BOISSONS: un verre de vin — 5€ · une eau minérale — 3€ · un café — 2€`,
    flow: `FLOW: greet and seat them (ask how many people) → take the order course by course: entrée, plat, boisson, then dessert → answer questions about the carte and recommend something if asked → once during the meal ask how it is (« Tout va bien ? ») → when they ask for the bill (« L'addition, s'il vous plaît »), ADD UP what they actually ordered and say « Ça fait X euros. » → take payment (par carte / en espèces) → a warm goodbye (« Bonne soirée ! ») and set done=true.`,
  },
};


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
  const scene = SCENES[body && body.scene] || SCENES.cafe;
  // Per-session specifics (e.g. the directions route "from le parc to la gare").
  const sessionCtx = typeof (body && body.context) === "string" ? body.context.slice(0, 300) : "";
  const messages = (Array.isArray(body && body.messages) ? body.messages : [])
    .slice(-24)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));

  // DEBRIEF mode (Dan, 2026-07-10: the waiter roleplays through serious
  // mistakes and there were "neither debrief nor learning points"). After the
  // roleplay the client sends { debrief: true, messages } and gets back a
  // teacher's bilan of the LEARNER's lines: what worked, the corrections that
  // matter, one tip. Roleplay stays pure in-character; the teaching happens here.
  if (body && body.debrief === true) {
    if (!messages.length) return json({ error: "no-user-message" }, 400);
    const transcript = messages
      .map((m) => (m.role === "user" ? "LEARNER: " : "PARTNER: ") + m.content)
      .join("\n");
    const system = `You are a warm, precise French teacher debriefing an A1 (absolute beginner) learner who just finished a role-play. Review ONLY the lines marked LEARNER in the dialogue.
Write the debrief in English, keeping every French example in French. No headers, no JSON. Never use em-dashes or en-dashes: use commas, colons or separate sentences. Short lines in this order:
- One or two things they did well. Be specific, quote their French.
- The corrections that matter (up to four, most important first), each on one line: their words, then the corrected French, then one short reason.
- One concrete tip for the next conversation.
If their French was essentially error-free, say so warmly and give one stretch tip instead of corrections. Ignore missing accents on chip-composed text only when nothing else is wrong with the line.
Only flag GENUINE errors: correct French must never be "improved", and style preferences are not errors. Nationality and language adjectives are lowercase («je suis singapourien», «elle est française»); the capital belongs only to the noun («un Singapourien»).`;
    try {
      const r = await fetch(provider.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + provider.key,
        },
        body: JSON.stringify({
          model: provider.model,
          max_tokens: 500,
          messages: [
            { role: "system", content: system },
            { role: "user", content: "DIALOGUE:\n" + transcript },
          ],
        }),
      });
      if (!r.ok) return json({ error: "upstream-" + r.status }, 502);
      const data = await r.json();
      const reply = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
      return json({ reply: reply || "…", done: true });
    } catch {
      return json({ error: "upstream-unreachable" }, 502);
    }
  }

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json({ error: "no-user-message" }, 400);
  }

  const system = `${scene.persona}
${scene.menu ? `\n${scene.menu}\n` : ""}
${scene.flow}
${sessionCtx ? `\nTHIS SESSION: ${sessionCtx}` : ""}

RULES:
- Reply ONLY in simple French, 1-2 short A1 sentences.
- If the learner's message is NOT coherent French, or jams fragments that don't form a real sentence (e.g. "un coca c'est tout", "je prends au revoir"), DO NOT accept it: stay in character and gently ask them to rephrase, e.g. « Pardon ? Vous pouvez répéter ? ». Never advance the scene, and never set done, on nonsense.
- When they're close but missing a word, model the fix warmly (e.g. « Un croissant ET un coca, très bien ! »).
- Be encouraging; never switch to English.

Respond with ONLY a JSON object, no other text:
{"reply": "<your French line>", "done": <true ONLY after you have said goodbye>}`;

  try {
    const r = await fetch(provider.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + provider.key,
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 300,
        // The system prompt demands a bare JSON object; json_object mode
        // makes the model honour it.
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!r.ok) return json({ error: "upstream-" + r.status }, 502);
    const data = await r.json();
    const raw = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
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
