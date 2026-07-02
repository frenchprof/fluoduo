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
  /** Fill-in-the-blank frame, e.g. "[Moi,] Je ___ Dan." */
  stem?: string;
  /** Gloss/reveal — shown only after the question is attempted. */
  en?: string;
  /** Colour for the title text (the colours quiz shows "red" in red). */
  hue?: string;
  /** Spoken on a correct pick instead of the default (e.g. "le feu rouge"). */
  tts?: string;
  options: Unit0Option[];
};

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
  tts: mnemonicFr,
  en: `${mnemonicFr} — ${mnemonicEn}`,
  options: [
    { v: fr, ok: true },
    ...wrongs.map((v) => ({ v, ok: false, why: `${v} is ${COLOR[v]}.` })),
  ],
});
const NUMBER: Record<string, string> = {
  "zéro": "0", un: "1", deux: "2", trois: "3", quatre: "4", cinq: "5",
  sept: "7", huit: "8", dix: "10", onze: "11", douze: "12", treize: "13",
  quatorze: "14", quinze: "15", seize: "16",
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

const unUne = (noun: string, correct: "un" | "une", en: string): Unit0Question => ({
  title: noun,
  options: [
    { v: "un", ok: correct === "un", ...(correct === "une" ? { why: `${noun} (${en}) is feminine — une ${noun}.` } : {}) },
    { v: "une", ok: correct === "une", ...(correct === "un" ? { why: `${noun} (${en}) is masculine — un ${noun}.` } : {}) },
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
    unUne("prénom", "un", "first name"),
    unUne("femme", "une", "woman"),
    unUne("homme", "un", "man"),
    unUne("salle de classe", "une", "classroom"),
    unUne("tableau", "un", "board"),
    unUne("étudiante", "une", "female student"),
  ],
  "SIO-007": [
    glossQ("0", "zéro", ["quatorze", "huit", "seize"], NUMBER),
    glossQ("1", "un", ["treize", "trois", "onze"], NUMBER),
    glossQ("2", "deux", ["douze", "quatorze", "quatre"], NUMBER),
    glossQ("3", "trois", ["treize", "dix", "huit"], NUMBER),
    glossQ("4", "quatre", ["quatorze", "cinq", "sept"], NUMBER),
    glossQ("5", "cinq", ["quinze", "un", "onze"], NUMBER),
  ],
  "SIO-008": [
    { title: "It's 9am. You meet your French professor in the hallway for the first time.", options: [
      { v: "Bonjour, monsieur.", ok: true },
      { v: "Enchanté.", ok: false, why: "Enchanté responds to an introduction — no one has been introduced." },
      { v: "Je m'appelle Dan.", ok: false, why: "That's an introduction, not a greeting." },
      { v: "Vous vous appelez comment ?", ok: false, why: "That asks his name instead of greeting him." },
    ] },
    { title: "You see your classmate just before class starts.", options: [
      { v: "Salut !", ok: true },
      { v: "Au revoir.", ok: false, why: "Au revoir is a goodbye, not a hello." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
      { v: "Bonsoir.", ok: false, why: "Bonsoir is for the evening — class is starting in the daytime." },
    ] },
    { title: "It's 8pm. You greet a stranger you're seated next to at a dinner.", options: [
      { v: "Bonsoir.", ok: true },
      { v: "Bonne nuit", ok: false, why: "Bonne nuit is only for bedtime." },
      { v: "Tu t'appelles comment ?", ok: false, why: "That's a question — and tu with a stranger is wrong anyway." },
      { v: "Enchanté.", ok: false, why: "Enchanté responds to an introduction — no one has been introduced." },
    ] },
    { title: "You greet your closest friend as you arrive at a casual gathering.", options: [
      { v: "Coucou !", ok: true },
      { v: "Bonjour, monsieur.", ok: false, why: "Far too formal for your closest friend." },
      { v: "Désolé.", ok: false, why: "Désolé means 'sorry'." },
      { v: "Enchanté.", ok: false, why: "Enchanté is for first meetings — this is your closest friend." },
    ] },
    { title: "At a professional event, you turn to the man beside you and ask him his name.", options: [
      { v: "Vous vous appelez comment ?", ok: true },
      { v: "Je m'appelle Dan.", ok: false, why: "That gives YOUR name instead of asking his." },
      { v: "Tu t'appelles comment ?", ok: false, why: "Tu with someone you don't know — use the vous form." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
    { title: "You're chatting with a fellow student your age whose name you don't know.", options: [
      { v: "Tu t'appelles comment ?", ok: true },
      { v: "Je m'appelle Dan.", ok: false, why: "That gives your name instead of asking theirs." },
      { v: "Bonsoir.", ok: false, why: "Bonsoir is a greeting, not a question." },
      { v: "Enchanté.", ok: false, why: "Enchanté responds to an introduction." },
    ] },
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
      { v: "À bientôt !", ok: false, why: "À bientôt is casual — the safe goodbye to a professor is Au revoir." },
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
      { v: "Bonsoir.", ok: false, why: "Bonsoir is an evening hello, not a leaving wish." },
      { v: "Bonne nuit.", ok: false, why: "Bonne nuit is only for bedtime." },
    ] },
    { title: "Class ends in the early afternoon. You wish the professor a good rest of the day.", options: [
      { v: "Bonne journée !", ok: true },
      { v: "Bonne soirée !", ok: false, why: "Bonne soirée is for the evening — it's early afternoon." },
      { v: "Coucou !", ok: false, why: "Coucou is a very informal hello." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
  ],
};
