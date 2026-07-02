/**
 * Unit 0's collective post-lesson MCQ bank — one small set per SIO, purely to
 * drive home the 10 foundational objectives (Dan, 2026-07-01). Ported from
 * Dan's existing pre-lesson app at laf1201.withdrchan.com (its "skill-data"
 * JSON blocks), then:
 *   - degendered: the source content exclusively addressed "Madame" for the
 *     teacher; Dan is a Monsieur, so every teacher-facing line here uses
 *     Monsieur instead. Do not reintroduce "Madame" as the sole address form.
 *   - stripped of legacy TTS-button HTML (SIO-003 alphabet items used inline
 *     `<button onclick=playTTS>` — reframed as text-based mnemonic questions:
 *     "Which letter is said 'a comme Anatole'?").
 *   - deduplicated and capped at ~6 items per SIO (the source has far more;
 *     this is meant as a light reinforcement quiz, not an exhaustive bank).
 * SIO-006 (core nouns) has no equivalent in the source site — those 6 items
 * were authored fresh for this pass (simple un/une gender-matching).
 * SIO-010 (the first-meeting role-play) is intentionally absent — it's a
 * mini-oral simulation done in class with the instructor, not an online MCQ.
 */

export type Unit0Question = {
  /** Scenario/prompt framing, shown when there's no fill-in-the-blank stem. */
  title?: string;
  /** Fill-in-the-blank frame, e.g. "[Moi,] Je ___ Dan." */
  stem?: string;
  /** English gloss of the stem, when present. */
  en?: string;
  options: { v: string; ok: boolean }[];
  explain?: string;
};

export const UNIT0_QUESTIONS: Record<string, Unit0Question[]> = {
  "SIO-001": [
    { stem: "[Moi,] Je ___ Dan.", en: "My name is Dan. (literally: I call myself Dan.)", options: [{ v: "s'appellent", ok: false }, { v: "m'appelle", ok: true }, { v: "vous appelez", ok: false }, { v: "nous appelons", ok: false }], explain: "Je takes m'appelle. The reflexive pronoun me contracts to m' before the vowel-starting appelle." },
    { stem: "[Toi,] Tu ___ Marie ?", en: "Is your name Marie?", options: [{ v: "nous appelons", ok: false }, { v: "s'appellent", ok: false }, { v: "t'appelles", ok: true }, { v: "m'appelle", ok: false }], explain: "Tu takes t'appelles — final s, but silent. Reflexive te contracts to t'." },
    { stem: "[Lui,] Il ___ Pierre.", en: "His name is Pierre.", options: [{ v: "s'appelle", ok: true }, { v: "vous appelez", ok: false }, { v: "m'appelle", ok: false }, { v: "nous appelons", ok: false }], explain: "Il / elle / on all take s'appelle. Same audible form as m'appelle and t'appelles — pure spelling difference." },
    { stem: "[Elle,] Elle ___ Juliette.", en: "Her name is Juliette.", options: [{ v: "nous appelons", ok: false }, { v: "s'appelle", ok: true }, { v: "t'appelles", ok: false }, { v: "m'appelle", ok: false }], explain: "Elle takes s'appelle — same form as il." },
    { stem: "[Nous,] Nous ___ Marc et Léa.", en: "Our names are Marc and Léa.", options: [{ v: "s'appellent", ok: false }, { v: "nous appelons", ok: true }, { v: "s'appelle", ok: false }, { v: "m'appelle", ok: false }], explain: "Nous takes nous appelons — no apostrophe, single L, unlike the singular forms." },
    { stem: "[Vous,] Vous ___ comment ?", en: "What is your name? (formal/plural)", options: [{ v: "vous appelez", ok: true }, { v: "s'appelle", ok: false }, { v: "t'appelles", ok: false }, { v: "m'appelle", ok: false }], explain: "Vous takes vous appelez — no apostrophe, single L, just like nous." },
  ],
  "SIO-002": [
    { title: "You meet your French professor for the first time.", options: [{ v: "tu", ok: false }, { v: "vous", ok: true }], explain: "Teachers — always vous, especially first meeting. Wait for the invitation before switching to tu." },
    { title: "You meet a classmate your age in LAF1201.", options: [{ v: "vous", ok: false }, { v: "tu", ok: true }], explain: "Peers and classmates of similar age switch to tu almost immediately. Vous here would feel cold." },
  ],
  "SIO-003": [
    // Not the easy A-B-C-D-E-F set (too obvious a giveaway, per Dan) — these
    // are the 6 letters whose French names trip up English speakers because
    // they don't match the English letter name they resemble.
    { title: "Which letter is pronounced “jay”?", options: [{ v: "G", ok: true }, { v: "J", ok: false }, { v: "K", ok: false }], explain: "G is said “jay” in French — the opposite of English, where “jay” is J." },
    { title: "Which letter is pronounced “jee”?", options: [{ v: "J", ok: true }, { v: "G", ok: false }, { v: "K", ok: false }], explain: "J is said “jee” (“ji”) in French — swapped from English, where G sounds like this." },
    { title: "Which letter is pronounced “say”?", options: [{ v: "C", ok: true }, { v: "S", ok: false }, { v: "K", ok: false }], explain: "C is said “say” (“cé”) in French, not “see” like in English." },
    { title: "Which letter is pronounced “arsh”?", options: [{ v: "H", ok: true }, { v: "A", ok: false }, { v: "R", ok: false }], explain: "H is said “arsh” (“hache”) in French — nothing like its English name." },
    { title: "Which letter is pronounced “air”?", options: [{ v: "R", ok: true }, { v: "L", ok: false }, { v: "F", ok: false }], explain: "R is said “air” (“erre”) in French, with the guttural French R." },
    { title: "Which letter is pronounced “i grec”?", options: [{ v: "Y", ok: true }, { v: "I", ok: false }, { v: "U", ok: false }], explain: "Y is called “i grec” (“Greek i”) in French, to distinguish it from I (“i latin”)." },
  ],
  "SIO-004": [
    { title: "Which French word means Monday?", options: [{ v: "vendredi", ok: false }, { v: "dimanche", ok: false }, { v: "lundi", ok: true }, { v: "mercredi", ok: false }] },
    { title: "Which French word means Tuesday?", options: [{ v: "jeudi", ok: false }, { v: "vendredi", ok: false }, { v: "mercredi", ok: false }, { v: "mardi", ok: true }], explain: "From Mars — same root as English March." },
    { title: "Which French word means Wednesday?", options: [{ v: "mercredi", ok: true }, { v: "dimanche", ok: false }, { v: "samedi", ok: false }, { v: "lundi", ok: false }], explain: "From Mercure (Mercury). The longest day name." },
    { title: "Which French word means Thursday?", options: [{ v: "vendredi", ok: false }, { v: "jeudi", ok: true }, { v: "mercredi", ok: false }, { v: "samedi", ok: false }], explain: "From Jupiter. Sounds like \"zhuh-dee\"." },
    { title: "Which French word means Friday?", options: [{ v: "vendredi", ok: true }, { v: "jeudi", ok: false }, { v: "mardi", ok: false }, { v: "mercredi", ok: false }], explain: "From Vénus (Venus)." },
    { title: "Which French word means Saturday?", options: [{ v: "lundi", ok: false }, { v: "dimanche", ok: false }, { v: "samedi", ok: true }, { v: "mardi", ok: false }], explain: "From Saturne. The middle E is silent: \"sam-dee\"." },
  ],
  "SIO-005": [
    { title: "Which French word means red?", options: [{ v: "blanc", ok: false }, { v: "jaune", ok: false }, { v: "rose", ok: false }, { v: "rouge", ok: true }], explain: "une voiture rouge — a red car." },
    { title: "Which French word means blue?", options: [{ v: "gris", ok: false }, { v: "bleu", ok: true }, { v: "marron", ok: false }, { v: "rose", ok: false }], explain: "le ciel bleu — the blue sky." },
    { title: "Which French word means green?", options: [{ v: "noir", ok: false }, { v: "violet", ok: false }, { v: "vert", ok: true }, { v: "orange", ok: false }], explain: "un thé vert — a green tea." },
    { title: "Which French word means yellow?", options: [{ v: "jaune", ok: true }, { v: "noir", ok: false }, { v: "gris", ok: false }, { v: "orange", ok: false }], explain: "le soleil jaune — the yellow sun." },
    { title: "Which French word means black?", options: [{ v: "rose", ok: false }, { v: "rouge", ok: false }, { v: "violet", ok: false }, { v: "noir", ok: true }], explain: "un café noir — a black coffee." },
    { title: "Which French word means white?", options: [{ v: "orange", ok: false }, { v: "vert", ok: false }, { v: "rose", ok: false }, { v: "blanc", ok: true }], explain: "du vin blanc — white wine." },
  ],
  "SIO-006": [
    { title: "Which article goes with “prénom”?", options: [{ v: "un", ok: true }, { v: "une", ok: false }], explain: "un prénom (masculine) — first name." },
    { title: "Which article goes with “femme”?", options: [{ v: "un", ok: false }, { v: "une", ok: true }], explain: "une femme (feminine) — woman." },
    { title: "Which article goes with “homme”?", options: [{ v: "un", ok: true }, { v: "une", ok: false }], explain: "un homme (masculine) — man." },
    { title: "Which article goes with “salle de classe”?", options: [{ v: "un", ok: false }, { v: "une", ok: true }], explain: "une salle de classe (feminine) — classroom." },
    { title: "Which article goes with “tableau”?", options: [{ v: "un", ok: true }, { v: "une", ok: false }], explain: "un tableau (masculine) — board." },
    { title: "Which article goes with “étudiante”?", options: [{ v: "un", ok: false }, { v: "une", ok: true }], explain: "une étudiante (feminine) — student. The masculine form is un étudiant." },
  ],
  "SIO-007": [
    { title: "What is 0 in French?", options: [{ v: "quatorze", ok: false }, { v: "huit", ok: false }, { v: "seize", ok: false }, { v: "zéro", ok: true }] },
    { title: "What is 1 in French?", options: [{ v: "treize", ok: false }, { v: "trois", ok: false }, { v: "onze", ok: false }, { v: "un", ok: true }], explain: "Un is also French for \"a/an\" — same word, different role." },
    { title: "What is 2 in French?", options: [{ v: "douze", ok: false }, { v: "quatorze", ok: false }, { v: "quatre", ok: false }, { v: "deux", ok: true }], explain: "The X is silent." },
    { title: "What is 3 in French?", options: [{ v: "treize", ok: false }, { v: "dix", ok: false }, { v: "trois", ok: true }, { v: "huit", ok: false }], explain: "The S is silent." },
    { title: "What is 4 in French?", options: [{ v: "quatre", ok: true }, { v: "quatorze", ok: false }, { v: "cinq", ok: false }, { v: "sept", ok: false }] },
    { title: "What is 5 in French?", options: [{ v: "cinq", ok: true }, { v: "quinze", ok: false }, { v: "un", ok: false }, { v: "onze", ok: false }], explain: "The Q is pronounced — sounds like \"sank\"." },
  ],
  "SIO-008": [
    { title: "It's 9am. You meet your French professor in the hallway for the first time.", options: [{ v: "Enchanté.", ok: false }, { v: "Je m'appelle Dan.", ok: false }, { v: "Vous vous appelez comment ?", ok: false }, { v: "Bonjour, monsieur.", ok: true }], explain: "Bonjour = the all-purpose daytime hello. With a teacher you don't yet know well, add monsieur for respect." },
    { title: "You see your classmate just before class starts.", options: [{ v: "Au revoir.", ok: false }, { v: "Merci.", ok: false }, { v: "Bonsoir.", ok: false }, { v: "Salut !", ok: true }], explain: "Salut = casual hello (or goodbye) between friends and classmates. Don't use with strangers or authority." },
    { title: "It's 8pm. You greet a stranger you're seated next to at a dinner.", options: [{ v: "Bonsoir.", ok: true }, { v: "Bonne nuit", ok: false }, { v: "Tu t'appelles comment ?", ok: false }, { v: "Enchanté.", ok: false }], explain: "Bonsoir = good evening, used from roughly 6pm onwards." },
    { title: "You greet your closest friend as you arrive at a casual gathering.", options: [{ v: "Bonjour, monsieur.", ok: false }, { v: "Coucou !", ok: true }, { v: "Désolé.", ok: false }, { v: "Enchanté.", ok: false }], explain: "Coucou = very informal hello, reserved for close friends and family. Never with a stranger or teacher." },
    { title: "At a professional event, you turn to the man beside you and ask him his name.", options: [{ v: "Je m'appelle Dan.", ok: false }, { v: "Vous vous appelez comment ?", ok: true }, { v: "Tu t'appelles comment ?", ok: false }, { v: "Merci.", ok: false }], explain: "With someone you don't know, always use vous." },
    { title: "You're chatting with a fellow student your age whose name you don't know.", options: [{ v: "Je m'appelle Dan.", ok: false }, { v: "Tu t'appelles comment ?", ok: true }, { v: "Bonsoir.", ok: false }, { v: "Enchanté.", ok: false }], explain: "With peers, use tu t'appelles comment ? — with strangers, use the vous form instead." },
  ],
  "SIO-009": [
    { title: "It's your first day of class. The professor asks you to introduce yourself.", options: [{ v: "Enchanté.", ok: false }, { v: "Bonjour, monsieur.", ok: false }, { v: "Merci.", ok: false }, { v: "Je m'appelle Dan.", ok: true }], explain: "Je m'appelle = the standard way to introduce yourself by name." },
    { title: "Class is over. You say goodbye specifically to your professor as you leave.", options: [{ v: "Bonjour, monsieur.", ok: false }, { v: "Au revoir.", ok: true }, { v: "À bientôt !", ok: false }, { v: "Coucou !", ok: false }], explain: "Au revoir = the standard goodbye. Always polite, never wrong." },
    { title: "You're leaving a friend's place after a short visit. Which phrase is NOT appropriate here?", options: [{ v: "Adieu.", ok: true }, { v: "Salut !", ok: false }, { v: "À bientôt !", ok: false }, { v: "Au revoir.", ok: false }], explain: "Adieu means \"farewell forever\" — dramatic, almost never used in everyday speech." },
    { title: "You'll see your classmate again tomorrow. What do you say as you leave?", options: [{ v: "Bonne nuit.", ok: false }, { v: "À demain !", ok: true }, { v: "Enchanté.", ok: false }, { v: "Pardon.", ok: false }], explain: "À demain = see you tomorrow — use it when you know you'll meet again the next day." },
    { title: "You wave goodbye to a shopkeeper as you leave the store, around 7pm.", options: [{ v: "Bonne journée !", ok: false }, { v: "Bonsoir.", ok: false }, { v: "Bonne soirée !", ok: true }, { v: "Bonne nuit.", ok: false }], explain: "Bonne soirée = have a good evening. Bonne journée is the daytime equivalent; bonne nuit is only for bedtime." },
    { title: "Class ends in the early afternoon. You wish the professor a good rest of the day.", options: [{ v: "Bonne soirée !", ok: false }, { v: "Bonne journée !", ok: true }, { v: "Coucou !", ok: false }, { v: "Merci.", ok: false }], explain: "Bonne journée = have a good day, used in the daytime." },
  ],
};
