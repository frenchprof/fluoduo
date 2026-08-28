/**
 * Unit 0's collective post-lesson MCQ bank — one small set per SIO, purely to
 * drive home the 10 foundational objectives (Dan, 2026-07-01). Ported from
 * Dan's existing pre-lesson app at laf1201.withdrchan.com, then degendered
 * (teacher lines address Monsieur, not the source's "Madame") and adapted.
 *
 * WHY model (Dan, 2026-07-02): explanations are PER WRONG OPTION — each
 * distractor carries a `why` that explains why THAT choice is wrong. The UI
 * shows a WHY button only when the learner picked a wrong option that has
 * one; nothing explains a correct answer (the TTS + green fill do that job).
 *
 * SIO-006 (core nouns) has no equivalent in the source site — authored fresh.
 * SIO-010 (the first-meeting role-play) is intentionally absent — it's a
 * mini-oral simulation done in class with the instructor, not an online MCQ.
 *
 * 2026-07-05 QC pass: the remaining keepers from the same legacy bank were
 * ported (s'appellent + third-person introduction for SIO-001, dimanche + the
 * three moments for SIO-004, four more greetings for SIO-009) — full audit in
 * docs/audit2/LEGACY_MCQ_AUDIT_2026-07-05.md.
 */

export type Unit0Option = {
  v: string;
  ok: boolean;
  /** Why THIS (wrong) choice is wrong — never set on the correct option. */
  why?: string;
};

export type Unit0Question = {
  /** Prompt — kept to the bare minimum (Dan: just one word, e.g. "Tuesday"). */
  title?: string;
  /** Optional picture cue shown large before the title (SIO-006 nouns). */
  emoji?: string;
  /** Fill-in-the-blank frame, e.g. "[Moi,] Je ___ Dan." */
  stem?: string;
  /** Gloss/reveal — shown only after the question is attempted. */
  en?: string;
  /** Colour for the title text (the colours quiz shows "red" in red). */
  hue?: string;
  /** Spoken on a correct pick instead of the default (colours: "le rouge"). */
  tts?: string;
  /**
   * A worked example revealed on demand via an "exemple" button after the
   * question is attempted (colours: "le feu rouge — red traffic light"); its
   * French is spoken when revealed. Hidden before the attempt (it contains
   * the answer).
   */
  example?: { fr: string; en: string };
  options: Unit0Option[];
};

/**
 * A stable identity for one Unit-0 question, derived from its own text.
 *
 * These questions are authored as bare literals with no `id`, and the panel
 * shuffles both the bank and each question's options on every popup open — so
 * neither the array index nor the render order can key a saved record. The
 * question's prompt plus its correct answer is what actually distinguishes one
 * from another, so that is the key. Editing a question's wording therefore
 * orphans its old record, which is the behaviour we want: a reworded question
 * is a different question, and a stale "bring to class" line for a prompt that
 * no longer exists would be worse than losing it.
 */
export function unit0QuestionId(q: Unit0Question): string {
  const prompt = q.stem ?? q.title ?? q.emoji ?? "";
  const answer = q.options.find((o) => o.ok)?.v ?? "";
  return `${prompt}|${answer}`.replace(/\s+/g, " ").trim();
}

/** s'appeler forms → the subject each belongs to (for wrong-pick whys). */
const APPELER: Record<string, string> = {
  "m'appelle": "je",
  "t'appelles": "tu",
  "s'appelle": "il / elle",
  "s'appellent": "ils / elles",
  "nous appelons": "nous",
  "vous appelez": "vous",
};
const appelerOpts = (correct: string, wrongs: string[]): Unit0Option[] => [
  { v: correct, ok: true },
  ...wrongs.map((v) => ({ v, ok: false, why: `${v} goes with ${APPELER[v]}.` })),
];

/** French letter names (for wrong-pick whys in the alphabet set). */
const LETTER: Record<string, string> = {
  A: "ah", B: "bay", C: "say", D: "day", E: "uh", F: "eff", G: "jay",
  H: "arsh", I: "ee", J: "jee", K: "kah", L: "ell", M: "emm", N: "enn",
  O: "oh", P: "pay", Q: "kü", R: "air", S: "ess", T: "tay", U: "ü",
  V: "vay", W: "doo-bluh-vay", X: "eeks", Y: "i grec", Z: "zed",
};
const letterQ = (name: string, opts: [string, boolean][]): Unit0Question => ({
  title: `Which letter is “${name}”?`,
  options: opts.map(([v, ok]) => (ok ? { v, ok } : { v, ok, why: `${v} is “${LETTER[v]}”.` })),
});

/** Simple gloss maps for wrong-pick whys. */
const DAY: Record<string, string> = {
  lundi: "Monday", mardi: "Tuesday", mercredi: "Wednesday", jeudi: "Thursday",
  vendredi: "Friday", samedi: "Saturday", dimanche: "Sunday",
};
const MOMENT: Record<string, string> = {
  matin: "the morning", "après-midi": "the afternoon",
  soir: "the evening", nuit: "the night",
};
const COLOR: Record<string, string> = {
  rouge: "red", bleu: "blue", vert: "green", jaune: "yellow", noir: "black",
  blanc: "white", rose: "pink", gris: "grey", marron: "brown", violet: "purple",
  orange: "orange", beige: "beige",
};

/** One colour question: the English word IN its colour, mnemonic revealed +
 *  spoken on success (le feu rouge — red traffic light). */
const colorQ = (
  en: string,
  fr: string,
  hue: string,
  mnemonicFr: string,
  mnemonicEn: string,
  wrongs: string[],
): Unit0Question => ({
  title: en,
  hue,
  // Speak the colour itself on a correct pick — "le rouge" / "l'orange".
  tts: `${/^[aeiou]/i.test(fr) ? "l'" : "le "}${fr}`,
  // The mnemonic sits behind the "exemple" button (revealed + spoken there).
  example: { fr: mnemonicFr, en: mnemonicEn },
  options: [
    { v: fr, ok: true },
    ...wrongs.map((v) => ({ v, ok: false, why: `${v} is ${COLOR[v]}.` })),
  ],
});
const NUMBER: Record<string, string> = {
  "zéro": "0", un: "1", deux: "2", trois: "3", quatre: "4", cinq: "5",
  six: "6", sept: "7", huit: "8", neuf: "9", dix: "10", onze: "11",
  douze: "12", treize: "13", quatorze: "14", quinze: "15", seize: "16",
  vingt: "20",
};
const glossQ = (
  title: string,
  correct: string,
  wrongs: string[],
  gloss: Record<string, string>,
): Unit0Question => ({
  title,
  options: [
    { v: correct, ok: true },
    ...wrongs.map((v) => ({ v, ok: false, why: `${v} is ${gloss[v]}.` })),
  ],
});

const tuVous = (situation: string, correct: "tu" | "vous", whyWrong: string): Unit0Question => ({
  title: situation,
  options: [
    { v: "tu", ok: correct === "tu", ...(correct === "vous" ? { why: whyWrong } : {}) },
    { v: "vous", ok: correct === "vous", ...(correct === "tu" ? { why: whyWrong } : {}) },
  ],
});

/**
 * SIO-006 core-noun article question. Prompt is an emoji when one reads
 * clearly, else the English word; options are un / une; the full article +
 * noun is revealed (after attempt) and spoken on a correct pick (Dan,
 * 2026-07-02). Gendered person-emojis resolve the un professeur / une
 * professeure ambiguity by fixing the referent's sex.
 */
const nounQ = (emoji: string, fr: string, g: "un" | "une", en: string): Unit0Question => ({
  emoji: emoji || undefined,
  // The FRENCH word is the prompt — you can only judge un/une from it (Dan,
  // 2026-07-03: "it only makes sense to ask un or une if the French word is
  // given first"). The article is withheld (it's the answer); the English
  // meaning is revealed after the attempt.
  title: fr,
  en,
  tts: `${g} ${fr}`,
  options: [
    { v: "un", ok: g === "un", ...(g === "une" ? { why: `${fr} is feminine — une ${fr}.` } : {}) },
    { v: "une", ok: g === "une", ...(g === "un" ? { why: `${fr} is masculine — un ${fr}.` } : {}) },
  ],
});

/** M. / Mme forms of address (part of SIO-006 per Dan). */
const addressQ = (prompt: string, correct: "Monsieur" | "Madame", en: string): Unit0Question => ({
  title: prompt,
  en,
  tts: correct,
  options: [
    { v: "Monsieur", ok: correct === "Monsieur", ...(correct === "Madame" ? { why: "Monsieur (M.) is for a man." } : {}) },
    { v: "Madame", ok: correct === "Madame", ...(correct === "Monsieur" ? { why: "Madame (Mme) is for a woman." } : {}) },
  ],
});

/** SIO-008 classroom instructions: emoji + (English) prompt -> French imperative. */
const instructionQ = (
  emoji: string,
  fr: string,
  en: string,
  wrongs: [string, string][],
): Unit0Question => ({
  emoji,
  title: `(${en})`,
  tts: fr,
  options: [
    { v: fr, ok: true },
    ...wrongs.map(([wf, we]) => ({ v: wf, ok: false, why: `That is \u201c${we}\u201d.` })),
  ],
});

export const UNIT0_QUESTIONS: Record<string, Unit0Question[]> = {
  "SIO-001": [
    { stem: "[Moi,] Je ___ Dan.", en: "My name is Dan.", options: appelerOpts("m'appelle", ["s'appellent", "vous appelez", "nous appelons"]) },
    { stem: "[Toi,] Tu ___ Marie ?", en: "Is your name Marie?", options: appelerOpts("t'appelles", ["nous appelons", "s'appellent", "m'appelle"]) },
    { stem: "[Lui,] Il ___ Pierre.", en: "His name is Pierre.", options: appelerOpts("s'appelle", ["vous appelez", "m'appelle", "nous appelons"]) },
    { stem: "[Elle,] Elle ___ Juliette.", en: "Her name is Juliette.", options: appelerOpts("s'appelle", ["nous appelons", "t'appelles", "m'appelle"]) },
    { stem: "[Nous,] Nous ___ Marc et Léa.", en: "Our names are Marc and Léa.", options: appelerOpts("nous appelons", ["s'appellent", "s'appelle", "m'appelle"]) },
    { stem: "[Vous,] Vous ___ comment ?", en: "What is your name? (formal/plural)", options: appelerOpts("vous appelez", ["s'appelle", "t'appelles", "m'appelle"]) },
    // 2026-07-05 port: the ils/elles person + introducing a third person.
    { stem: "[Eux,] Ils ___ Pierre et Marc.", en: "Their names are Pierre and Marc.", options: appelerOpts("s'appellent", ["s'appelle", "nous appelons", "vous appelez"]) },
    { stem: "[Elles,] Elles ___ Marie et Léa.", en: "Their names are Marie and Léa.", options: appelerOpts("s'appellent", ["m'appelle", "t'appelles", "s'appelle"]) },
    { title: "You're introducing your friend Marc to your professor.", options: [
      { v: "Monsieur, je vous présente Marc. Il s'appelle Marc Tan.", ok: true },
      { v: "Monsieur, je te présente Marc.", ok: false, why: "Te is tu-register — with your professor it's je vous présente." },
      { v: "Monsieur, je m'appelle Marc.", ok: false, why: "Je m'appelle gives YOUR name — you're introducing Marc." },
      { v: "Monsieur, vous vous appelez Marc.", ok: false, why: "That tells the professor his own name is Marc." },
    ] },
  ],
  "SIO-002": [
    // All 12 situations represented, per Dan (2026-07-02).
    tuVous("With a much younger person", "tu", "Vous is too formal here — tu is usual with children and many teenagers."),
    tuVous("With a peer or a friend", "tu", "Vous with a friend feels cold — peers take tu."),
    tuVous("With a family member", "tu", "Vous with family is overly formal — family takes tu."),
    tuVous("With a partner", "tu", "Vous with a partner is comically formal — tu."),
    tuVous("With a close colleague", "tu", "Vous keeps distance — a close colleague takes tu."),
    tuVous("With a not-so-close colleague", "vous", "Tu presumes closeness — professional distance takes vous until you're invited."),
    tuVous("With one's teacher", "vous", "Tu with a teacher is too familiar — always vous, at least at first."),
    tuVous("With one's boss", "vous", "Tu with your boss skips the hierarchy — vous."),
    tuVous("With a client", "vous", "Tu with a client is unprofessional — vous."),
    tuVous("With a stranger", "vous", "Tu with an unknown adult is intrusive — vous is the default."),
    tuVous("With an elderly person", "vous", "Tu can read as disrespectful to an elder — vous."),
    tuVous("With a group", "vous", "Tu is singular — more than one person is always vous."),
  ],
  "SIO-003": [
    // Dan's exact 7-question set (2026-07-02), 4 options each.
    letterQ("arsh", [["R", false], ["H", true], ["A", false], ["Z", false]]),
    letterQ("air", [["U", false], ["F", false], ["R", true], ["L", false]]),
    letterQ("jay", [["G", true], ["K", false], ["J", false], ["V", false]]),
    letterQ("say", [["S", false], ["T", false], ["C", true], ["X", false]]),
    letterQ("i grec", [["E", false], ["I", false], ["Y", true], ["U", false]]),
    letterQ("jee", [["B", false], ["G", false], ["J", true], ["W", false]]),
    letterQ("kü", [["K", false], ["Q", true], ["P", false], ["M", false]]),
  ],
  "SIO-004": [
    // Concise per Dan (2026-07-02): just the word, choices beside it.
    glossQ("Monday", "lundi", ["vendredi", "dimanche", "mercredi"], DAY),
    glossQ("Tuesday", "mardi", ["jeudi", "vendredi", "mercredi"], DAY),
    glossQ("Wednesday", "mercredi", ["dimanche", "samedi", "lundi"], DAY),
    glossQ("Thursday", "jeudi", ["vendredi", "mercredi", "samedi"], DAY),
    glossQ("Friday", "vendredi", ["jeudi", "mardi", "mercredi"], DAY),
    glossQ("Saturday", "samedi", ["lundi", "dimanche", "mardi"], DAY),
    // 2026-07-05 port: dimanche + the 3 moments of the day (SIO-004 scope).
    glossQ("Sunday", "dimanche", ["mardi", "lundi", "jeudi"], DAY),
    glossQ("Morning", "matin", ["soir", "nuit", "après-midi"], MOMENT),
    glossQ("Afternoon", "après-midi", ["matin", "soir", "nuit"], MOMENT),
    glossQ("Evening", "soir", ["après-midi", "nuit", "matin"], MOMENT),
  ],
  "SIO-005": [
    // Dan's 12 colours (2026-07-02) — the word shown IN its colour; the
    // mnemonic (le feu rouge — red traffic light) is spoken on success and
    // revealed after the attempt.
    colorQ("red", "rouge", "#e02020", "le feu rouge", "red traffic light", ["blanc", "jaune", "rose"]),
    colorQ("pink", "rose", "#f06292", "le flamant rose", "pink flamingo", ["rouge", "violet", "marron"]),
    colorQ("orange", "orange", "#f57c00", "le fluo orange", "orange highlighter", ["jaune", "rouge", "marron"]),
    colorQ("yellow", "jaune", "#e6b800", "le citron jaune", "yellow lemon", ["orange", "vert", "gris"]),
    colorQ("green", "vert", "#2e9e44", "le concombre vert", "green cucumber", ["bleu", "jaune", "noir"]),
    colorQ("blue", "bleu", "#1c6fe0", "le ciel bleu", "blue sky", ["vert", "gris", "violet"]),
    colorQ("purple", "violet", "#7b3fbf", "le raisin violet", "purple grape", ["rose", "bleu", "marron"]),
    colorQ("grey", "gris", "#808080", "le nuage gris", "grey cloud", ["blanc", "noir", "beige"]),
    colorQ("brown", "marron", "#7b4a12", "le chocolat marron", "brown chocolate", ["noir", "beige", "orange"]),
    colorQ("black", "noir", "#1a1a1a", "le café noir", "black coffee", ["gris", "marron", "bleu"]),
    colorQ("white", "blanc", "#ffffff", "le lait blanc", "white milk", ["beige", "gris", "jaune"]),
    colorQ("beige", "beige", "#d9c39a", "le sable beige", "beige sand", ["marron", "blanc", "jaune"]),
  ],
  "SIO-006": [
    // Identity / people — the French word is the prompt; the learner picks un/une
    nounQ("", "prénom", "un", "first name"),
    nounQ("", "nom", "un", "surname"),
    nounQ("👨", "homme", "un", "man"),
    nounQ("🎩", "monsieur", "un", "gentleman / sir"),
    nounQ("👩", "femme", "une", "woman"),
    nounQ("👦", "garçon", "un", "boy"),
    nounQ("👧", "fille", "une", "girl"),
    nounQ("", "dame", "une", "lady"),
    nounQ("🧑‍🤝‍🧑", "ami", "un", "friend (m)"),
    nounQ("👨‍🏫", "professeur", "un", "teacher (m)"),
    nounQ("👨‍🎓", "étudiant", "un", "student (m)"),
    // Classroom objects
    nounQ("🏫", "salle de classe", "une", "classroom"),
    nounQ("🚪", "salle", "une", "room"),
    nounQ("👩‍🏫", "classe", "une", "class"),
    nounQ("", "table", "une", "table"),
    nounQ("🪑", "chaise", "une", "chair"),
    nounQ("", "tableau", "un", "board"),
    nounQ("📖", "livre", "un", "book"),
    nounQ("✏️", "crayon", "un", "pencil"),
    nounQ("📓", "cahier", "un", "exercise book"),
    nounQ("🎧", "casque", "un", "headset"),
    nounQ("🎤", "micro", "un", "microphone"),
    // Forms of address
    addressQ("Addressing a man", "Monsieur", "Monsieur (M.) — how to address a man."),
    addressQ("Addressing a woman", "Madame", "Madame (Mme) — how to address a woman."),
  ],
  "SIO-007": [
    // 0–16 + 20 (17–19 excluded, per Dan 2026-07-02). Distractors are the
    // easily-confused numbers (six/seize, deux/douze, trois/treize…).
    glossQ("0", "zéro", ["quatorze", "huit", "seize"], NUMBER),
    glossQ("1", "un", ["treize", "trois", "onze"], NUMBER),
    glossQ("2", "deux", ["douze", "quatorze", "quatre"], NUMBER),
    glossQ("3", "trois", ["treize", "dix", "huit"], NUMBER),
    glossQ("4", "quatre", ["quatorze", "cinq", "sept"], NUMBER),
    glossQ("5", "cinq", ["quinze", "un", "onze"], NUMBER),
    glossQ("6", "six", ["seize", "sept", "deux"], NUMBER),
    glossQ("7", "sept", ["six", "cinq", "seize"], NUMBER),
    glossQ("8", "huit", ["dix", "deux", "six"], NUMBER),
    glossQ("9", "neuf", ["dix", "quatre", "deux"], NUMBER),
    glossQ("10", "dix", ["deux", "six", "seize"], NUMBER),
    glossQ("11", "onze", ["un", "douze", "treize"], NUMBER),
    glossQ("12", "douze", ["deux", "treize", "onze"], NUMBER),
    glossQ("13", "treize", ["trois", "douze", "quatorze"], NUMBER),
    glossQ("14", "quatorze", ["quatre", "quinze", "treize"], NUMBER),
    glossQ("15", "quinze", ["cinq", "quatorze", "seize"], NUMBER),
    glossQ("16", "seize", ["six", "quinze", "dix"], NUMBER),
    glossQ("20", "vingt", ["deux", "dix", "quatre"], NUMBER),
  ],
  "SIO-008": [
    // Classroom instructions — emoji + (English) prompt, pick the French
    // imperative (the one SIO where imperatives are allowed). Dan's set,
    // 2026-07-02.
    instructionQ("👂", "Écoutez !", "Listen", [["Regardez !", "Look"], ["Répétez !", "Repeat"], ["Parlez !", "Speak"]]),
    instructionQ("👀", "Regardez !", "Look", [["Écoutez !", "Listen"], ["Lisez !", "Read"], ["Notez !", "Note down"]]),
    instructionQ("🔁", "Répétez !", "Repeat", [["Écoutez !", "Listen"], ["Parlez !", "Speak"], ["Notez !", "Note down"]]),
    instructionQ("📖", "Lisez !", "Read", [["Écrivez !", "Write"], ["Regardez !", "Look"], ["Notez !", "Note down"]]),
    instructionQ("✍️", "Écrivez !", "Write", [["Lisez !", "Read"], ["Notez !", "Note down"], ["Parlez !", "Speak"]]),
    instructionQ("🗣️", "Parlez !", "Speak", [["Écoutez !", "Listen"], ["Répétez !", "Repeat"], ["Lisez !", "Read"]]),
    instructionQ("📝", "Notez !", "Note down", [["Écrivez !", "Write"], ["Lisez !", "Read"], ["Comptez !", "Count"]]),
    instructionQ("🔢", "Comptez !", "Count", [["Notez !", "Note down"], ["Associez !", "Match"], ["Écrivez !", "Write"]]),
    instructionQ("🔗", "Associez !", "Match", [["Comptez !", "Count"], ["Notez !", "Note down"], ["Regardez !", "Look"]]),
  ],
  "SIO-009": [
    { title: "It's your first day of class. The professor asks you to introduce yourself.", options: [
      { v: "Je m'appelle Dan.", ok: true },
      { v: "Enchanté.", ok: false, why: "Enchanté is the reply when someone ELSE is introduced to you." },
      { v: "Bonjour, monsieur.", ok: false, why: "A greeting — the professor asked you to introduce yourself." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
    { title: "Class is over. You say goodbye specifically to your professor as you leave.", options: [
      { v: "Au revoir.", ok: true },
      { v: "Bonjour, monsieur.", ok: false, why: "That's a hello, not a goodbye." },
      { v: "À plus !", ok: false, why: "À plus is casual slang between friends — the safe goodbye to a professor is Au revoir." },
      { v: "Coucou !", ok: false, why: "Coucou is a very informal hello — not a goodbye, not for professors." },
    ] },
    { title: "You're leaving a friend's place after a short visit. Which phrase is NOT appropriate here?", options: [
      { v: "Adieu.", ok: true },
      { v: "Salut !", ok: false, why: "Salut is perfectly normal between friends — the odd one out is Adieu ('farewell forever')." },
      { v: "À bientôt !", ok: false, why: "À bientôt is perfectly normal here — the odd one out is Adieu ('farewell forever')." },
      { v: "Au revoir.", ok: false, why: "Au revoir is always fine — the odd one out is Adieu ('farewell forever')." },
    ] },
    { title: "You'll see your classmate again tomorrow. What do you say as you leave?", options: [
      { v: "À demain !", ok: true },
      { v: "Bonne nuit.", ok: false, why: "Bonne nuit is for bedtime, not leaving class." },
      { v: "Enchanté.", ok: false, why: "Enchanté is for first meetings." },
      { v: "Pardon.", ok: false, why: "Pardon means 'excuse me'." },
    ] },
    { title: "You wave goodbye to a shopkeeper as you leave the store, around 7pm.", options: [
      { v: "Bonne soirée !", ok: true },
      { v: "Bonne journée !", ok: false, why: "Bonne journée is the daytime wish — at 7pm wish a good evening." },
      { v: "Bonjour !", ok: false, why: "Bonjour is a daytime hello — at 7pm, and when leaving, you wish Bonne soirée." },
      { v: "Bonne nuit.", ok: false, why: "Bonne nuit is only for bedtime." },
    ] },
    { title: "Class ends in the early afternoon. You wish the professor a good rest of the day.", options: [
      { v: "Bonne journée !", ok: true },
      { v: "Bonne soirée !", ok: false, why: "Bonne soirée is for the evening — it's early afternoon." },
      { v: "Coucou !", ok: false, why: "Coucou is a very informal hello." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
    // 2026-07-05 port: the greeting side (hellos by time + register) — the
    // first six items were all leave-takings.
    { title: "It's 9am. You meet your French professor in the hallway for the first time.", options: [
      { v: "Bonjour, monsieur.", ok: true },
      { v: "Enchanté.", ok: false, why: "Enchanté is the reply when someone is introduced to you." },
      { v: "Je m'appelle Dan.", ok: false, why: "That gives your name — greet first." },
      { v: "Vous vous appelez comment ?", ok: false, why: "That asks a name — greet first." },
    ] },
    { title: "You see your classmate just before class starts.", options: [
      { v: "Salut !", ok: true },
      { v: "Bonsoir.", ok: false, why: "Bonsoir is the evening greeting — and formal for a classmate." },
      { v: "Au revoir.", ok: false, why: "That's a goodbye, not a hello." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
    { title: "It's 8pm. You greet a stranger you're seated next to at a dinner.", options: [
      { v: "Bonsoir.", ok: true },
      { v: "Bonjour, monsieur.", ok: false, why: "Bonjour is the daytime greeting — after ~6pm it's Bonsoir." },
      { v: "Tu t'appelles comment ?", ok: false, why: "Tu is too familiar for a stranger — and greet before asking a name." },
      { v: "Enchanté.", ok: false, why: "Enchanté is for when you're introduced to someone — just greet: Bonsoir." },
    ] },
    { title: "You're heading to bed and say this to family before sleeping.", options: [
      { v: "Bonne nuit.", ok: true },
      { v: "Bonsoir.", ok: false, why: "Bonsoir greets in the evening — at bedtime you wish Bonne nuit." },
      { v: "Bonne journée !", ok: false, why: "Bonne journée is a daytime send-off." },
      { v: "Bonjour, monsieur.", ok: false, why: "A formal daytime hello — not a bedtime wish to family." },
    ] },
  ],
};
