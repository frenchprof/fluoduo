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
 * SIO-010 (the first-meeting role-play) WAS intentionally absent — a mini-oral
 * done in class, not an online MCQ. Dan reversed that on 2026-08-28: the
 * role-play now has a pretest of its own, one run per audience — see
 * SIO010_SITUATIONS below.
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
  /**
   * A literal substring of `title` that wears the highlighter (Dan,
   * 2026-08-28: "Q5 highlight 'around 7pm'"). Rendered, not stored — the
   * saved record still keys on the plain title.
   */
  hl?: string;
  /**
   * Several options are correct and the learner picks EVERY one that fits
   * ("which of the following ARE appropriate greetings…", SIO-010). The pick
   * is graded on the exact set: a missing correct answer is as wrong as an
   * extra one.
   */
  multi?: true;
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
  V: "vay", W: "doo-bluh-vay", X: "eeks", Y: "yi grek", Z: "zed",
};
const letterQ = (name: string, opts: [string, boolean][], note?: string): Unit0Question => ({
  title: `Which letter is “${name}”?${note ? ` ${note}` : ""}`,
  options: opts.map(([v, ok]) => (ok ? { v, ok } : { v, ok, why: `${v} is “${LETTER[v]}”.` })),
});

/** Simple gloss maps for wrong-pick whys. */
const DAY: Record<string, string> = {
  lundi: "Monday", mardi: "Tuesday", mercredi: "Wednesday", jeudi: "Thursday",
  vendredi: "Friday", samedi: "Saturday", dimanche: "Sunday",
};
const MOMENT: Record<string, string> = {
  matin: "the morning", midi: "midday", "après-midi": "the afternoon",
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

/**
 * SIO-010 — the first-meeting role-play. Dan, 2026-08-28: "a pre-test for all
 * the expected lines needed in that Simulated dialogue, but with lines that
 * are answers to the following questions as multiple choices."
 *
 * The seven questions are the seven moves of the atelier dialogue (greet · ask
 * a name · give yours · ask how it's written · say how it's written · enchanté ·
 * take leave), and the SAME seven are asked of three situations, because the
 * line changes with the audience:
 *
 *   A informal 1:1 (another student) · B formal 1:1 (a client) · C informal
 *   one-to-many (a group).
 *
 * The learner PICKS the situation first — Q2-Q7 are undecidable without it
 * (tu or vous is exactly what the situation settles), so a shuffled pool of all
 * 21 would be unanswerable. Each situation is its own 7-question run.
 *
 * Q1 is `multi`: "which of the following ARE appropriate greetings" has more
 * than one right answer, and a register is a SET of usable openings, not a
 * single best one.
 */
export type Unit0Situation = {
  key: string;
  /** Flap label — the audience, which is all the learner needs to choose. */
  label: string;
  questions: Unit0Question[];
};

/** Joins a multi-answer pick into the single string the record stores. */
export const MULTI_SEP = " · ";

export const SIO010_SITUATIONS: Unit0Situation[] = [
  {
    key: "informal",
    label: "🎓 A student (informal, 1:1)",
    questions: [
      { multi: true, title: "Which of these are appropriate greetings with another university student?", options: [
        { v: "Salut !", ok: true },
        { v: "Bonjour !", ok: true },
        { v: "Coucou !", ok: true },
        { v: "Bonjour, monsieur.", ok: false, why: "Monsieur is formal address — over-formal for a fellow student." },
        { v: "Au revoir !", ok: false, why: "That's a goodbye, not a greeting." },
      ] },
      { title: "You ask the other student their name. You say:", options: [
        { v: "Comment tu t'appelles ?", ok: true },
        { v: "Comment vous vous appelez ?", ok: false, why: "Vous is formal or plural — one fellow student takes tu." },
        { v: "Comment ça s'écrit ?", ok: false, why: "That asks how a name is SPELLED, not what it is." },
        { v: "Je m'appelle comment ?", ok: false, why: "That asks what YOUR own name is." },
      ] },
      { title: "You give your own name. You say:", options: [
        { v: "Moi, je m'appelle Léa.", ok: true },
        { v: "Tu t'appelles Léa.", ok: false, why: "That tells the other person THEIR name is Léa." },
        { v: "Elle s'appelle Léa.", ok: false, why: "That gives a third person's name — 'her name is Léa'." },
        { v: "Ça s'écrit Léa.", ok: false, why: "Ça s'écrit spells a name out letter by letter." },
      ] },
      { title: "You ask how that name is written. You say:", options: [
        { v: "Comment ça s'écrit ?", ok: true },
        { v: "Comment tu t'appelles ?", ok: false, why: "That asks the name itself — you already have it." },
        { v: "Comment ça va ?", ok: false, why: "That asks how they are." },
        { v: "Ça s'écrit L – É – A.", ok: false, why: "That ANSWERS the question — it spells the name out." },
      ] },
      { title: "You spell your own name out loud. You say:", tts: "Ça s'écrit, L, É, A", options: [
        { v: "Ça s'écrit L – É – A.", ok: true },
        { v: "Comment ça s'écrit ?", ok: false, why: "That ASKS the question." },
        { v: "Je m'appelle L – É – A.", ok: false, why: "Je m'appelle gives the name, not its letters." },
        { v: "Ça s'appelle L – É – A.", ok: false, why: "S'appeler is for names; spelling uses s'écrire." },
      ] },
      { title: "You have just exchanged names. You say:", options: [
        { v: "Enchanté !", ok: true },
        { v: "Merci !", ok: false, why: "Merci means 'thank you'." },
        { v: "Au revoir !", ok: false, why: "That's a goodbye — you have only just met." },
        { v: "S'il te plaît.", ok: false, why: "That means 'please'." },
      ] },
      { title: "You leave the other student. You say:", options: [
        { v: "Au revoir !", ok: true },
        { v: "Bonjour !", ok: false, why: "That's a hello." },
        { v: "Enchanté !", ok: false, why: "That's for the moment you are introduced." },
        { v: "Comment ça va ?", ok: false, why: "That asks how they are — you are leaving." },
      ] },
    ],
  },
  {
    key: "formal",
    label: "💼 A client (formal, 1:1)",
    questions: [
      { multi: true, title: "Which of these are appropriate greetings with a business client?", options: [
        { v: "Bonjour, madame.", ok: true },
        { v: "Bonjour, monsieur.", ok: true },
        { v: "Bonsoir, madame.", ok: true },
        { v: "Salut !", ok: false, why: "Salut is casual — too familiar for a client." },
        { v: "Coucou !", ok: false, why: "Coucou is very informal — friends and family only." },
      ] },
      { title: "You ask the client their name. You say:", options: [
        { v: "Comment vous vous appelez ?", ok: true },
        { v: "Comment tu t'appelles ?", ok: false, why: "Tu is too familiar with a client — vous." },
        { v: "Comment ça s'écrit ?", ok: false, why: "That asks how a name is SPELLED, not what it is." },
        { v: "Je m'appelle comment ?", ok: false, why: "That asks what YOUR own name is." },
      ] },
      { title: "You give your own name to the client. You say:", options: [
        { v: "Je m'appelle Léa Martin.", ok: true },
        { v: "Vous vous appelez Léa Martin.", ok: false, why: "That tells the client THEIR name is Léa Martin." },
        { v: "Elle s'appelle Léa Martin.", ok: false, why: "That gives a third person's name." },
        { v: "Enchanté, Léa Martin.", ok: false, why: "Enchanté is 'nice to meet you' — it doesn't give your name." },
      ] },
      { title: "You ask the client how their name is written. You say:", options: [
        { v: "Comment ça s'écrit ?", ok: true },
        { v: "Comment vous vous appelez ?", ok: false, why: "That asks the name itself — you already have it." },
        { v: "Comment allez-vous ?", ok: false, why: "That asks how they are." },
        { v: "Ça s'écrit M – A – R – T – I – N.", ok: false, why: "That ANSWERS the question — it spells the name out." },
      ] },
      { title: "You spell your own surname for the client. You say:", tts: "Ça s'écrit, M, A, R, T, I, N", options: [
        { v: "Ça s'écrit M – A – R – T – I – N.", ok: true },
        { v: "Comment ça s'écrit ?", ok: false, why: "That ASKS the question." },
        { v: "Je m'appelle M – A – R – T – I – N.", ok: false, why: "Je m'appelle gives the name, not its letters." },
        { v: "Ça s'appelle M – A – R – T – I – N.", ok: false, why: "S'appeler is for names; spelling uses s'écrire." },
      ] },
      { title: "The client has just given you their name. You say:", options: [
        { v: "Enchanté, madame.", ok: true },
        { v: "Merci, madame.", ok: false, why: "Merci is 'thank you' — on meeting someone it's Enchanté." },
        { v: "Salut !", ok: false, why: "Salut is casual — too familiar for a client." },
        { v: "Au revoir, madame.", ok: false, why: "That's a goodbye — you have only just met." },
      ] },
      { title: "You take leave of the client. You say:", options: [
        { v: "Au revoir, madame.", ok: true },
        { v: "Salut !", ok: false, why: "Salut is casual — too familiar for a client." },
        { v: "Bonjour, madame.", ok: false, why: "That's a hello." },
        { v: "Enchanté, madame.", ok: false, why: "That's for the moment you are introduced." },
      ] },
    ],
  },
  {
    key: "group",
    label: "👥 A group (informal, 1 to many)",
    questions: [
      { multi: true, title: "Which of these are appropriate greetings with more than one person?", options: [
        { v: "Bonjour à tous !", ok: true },
        { v: "Salut tout le monde !", ok: true },
        { v: "Bonjour !", ok: true },
        { v: "Bonjour, monsieur.", ok: false, why: "Monsieur addresses ONE man — a group takes à tous / tout le monde." },
        { v: "Au revoir tout le monde !", ok: false, why: "That's a goodbye, not a greeting." },
      ] },
      { title: "You ask the group their names. You say:", options: [
        { v: "Comment vous vous appelez ?", ok: true },
        { v: "Comment tu t'appelles ?", ok: false, why: "Tu is singular — more than one person is always vous, even among friends." },
        { v: "Comment ils s'appellent ?", ok: false, why: "That asks about a third group — 'what are THEIR names?'" },
        { v: "Comment nous nous appelons ?", ok: false, why: "That asks what OUR own names are." },
      ] },
      { title: "You give your own name to the group. You say:", options: [
        { v: "Moi, je m'appelle Léa.", ok: true },
        { v: "Nous nous appelons Léa.", ok: false, why: "Nous is 'we' — you are one person." },
        { v: "Vous vous appelez Léa.", ok: false, why: "That tells the group THEIR name is Léa." },
        { v: "Ils s'appellent Léa.", ok: false, why: "That gives a third group's name." },
      ] },
      { title: "You ask the group how their names are written. You say:", options: [
        { v: "Comment ça s'écrit ?", ok: true },
        { v: "Comment vous vous appelez ?", ok: false, why: "That asks the names themselves — you already have them." },
        { v: "Comment ça va ?", ok: false, why: "That asks how they are." },
        { v: "Ça s'écrit L – É – A.", ok: false, why: "That ANSWERS the question — it spells the name out." },
      ] },
      { title: "You spell your own name for the group. You say:", tts: "Ça s'écrit, L, É, A", options: [
        { v: "Ça s'écrit L – É – A.", ok: true },
        { v: "Comment ça s'écrit ?", ok: false, why: "That ASKS the question." },
        { v: "Je m'appelle L – É – A.", ok: false, why: "Je m'appelle gives the name, not its letters." },
        { v: "Vous vous écrivez L – É – A.", ok: false, why: "It is the NAME that is written, not the people: ça s'écrit…" },
      ] },
      { title: "You have just exchanged names with the group. You say:", options: [
        { v: "Enchanté !", ok: true },
        { v: "Merci !", ok: false, why: "Merci means 'thank you'." },
        { v: "Salut !", ok: false, why: "Salut is a hello or a bye — not 'nice to meet you'." },
        { v: "Au revoir tout le monde !", ok: false, why: "That's a goodbye — you have only just met." },
      ] },
      { title: "You leave the group. You say:", options: [
        { v: "Au revoir tout le monde !", ok: true },
        { v: "Bonjour à tous !", ok: false, why: "That's a hello." },
        { v: "Au revoir, monsieur.", ok: false, why: "Monsieur addresses ONE man — a group takes tout le monde / à tous." },
        { v: "Enchanté !", ok: false, why: "That's for the moment you are introduced." },
      ] },
    ],
  },
];

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
    { title: "You're introducing your friend Marc to your [male] professor.", options: [
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
    letterQ("yi grek", [["E", false], ["I", false], ["Y", true], ["U", false]]),
    letterQ("jee", [["B", false], ["G", false], ["J", true], ["W", false]]),
    letterQ("kü", [["K", false], ["Q", true], ["P", false], ["M", false]],
      "(Note: the ü sound also exists in languages like German e.g. ‘für’ and Mandarin e.g. ‘yu’.)"),
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
    // 2026-08-28 (Dan): midi joins the moments of the day.
    glossQ("Midday", "midi", ["matin", "après-midi", "nuit"], MOMENT),
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
  // 2026-08-28 (Dan): every situation now ends on the cue "You say:" — the
  // learner produces the line, they don't judge a description. The Adieu
  // odd-one-out question is retired (it asked which phrase does NOT fit —
  // the only question in the bank that ran backwards).
  "SIO-009": [
    { title: "It's your first day of class. The professor asks you to introduce yourself. You say:", options: [
      { v: "Je m'appelle Dan.", ok: true },
      { v: "Enchanté.", ok: false, why: "Enchanté is the reply when someone ELSE is introduced to you." },
      { v: "Bonjour, monsieur.", ok: false, why: "A greeting — the professor asked you to introduce yourself." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
    { title: "Class is over. You take leave of your professor. You say:", options: [
      { v: "Au revoir.", ok: true },
      { v: "Bonjour, monsieur.", ok: false, why: "That's a hello, not a goodbye." },
      { v: "À plus !", ok: false, why: "À plus is casual slang between friends — the safe goodbye to a professor is Au revoir." },
      { v: "Coucou !", ok: false, why: "Coucou is a very informal hello — not a goodbye, not for professors." },
    ] },
    { title: "You'll see your classmate again tomorrow. What do you say as you leave?", options: [
      { v: "À demain !", ok: true },
      { v: "Bonne nuit.", ok: false, why: "Bonne nuit is for bedtime, not leaving class." },
      { v: "Enchanté.", ok: false, why: "Enchanté is for first meetings." },
      { v: "Pardon.", ok: false, why: "Pardon means 'excuse me'." },
    ] },
    { title: "You wave goodbye to a shopkeeper as you leave the store, around 7pm. You say:", hl: "around 7pm", options: [
      { v: "Bonne soirée !", ok: true },
      { v: "Bonne journée !", ok: false, why: "Bonne journée is the daytime wish — at 7pm wish a good evening." },
      { v: "Bonjour !", ok: false, why: "Bonjour is a daytime hello — at 7pm, and when leaving, you wish Bonne soirée." },
      { v: "Bonne nuit.", ok: false, why: "Bonne nuit is only for bedtime." },
    ] },
    { title: "Class ends in the early afternoon. You wish the professor a good rest of the day. You say:", options: [
      { v: "Bonne journée !", ok: true },
      { v: "Bonne soirée !", ok: false, why: "Bonne soirée is for the evening — it's early afternoon." },
      { v: "Coucou !", ok: false, why: "Coucou is a very informal hello." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
    // 2026-07-05 port: the greeting side (hellos by time + register) — the
    // first six items were all leave-takings.
    { title: "Your French prof and you already know each other. You have just arrived in school and run into your prof that morning. You say:", options: [
      { v: "Bonjour, monsieur.", ok: true },
      { v: "Enchanté.", ok: false, why: "Enchanté is the reply when someone is introduced to you — you already know each other." },
      { v: "Je m'appelle Dan.", ok: false, why: "That gives your name — your prof already knows it." },
      { v: "Vous vous appelez comment ?", ok: false, why: "That asks a name — you already know each other." },
    ] },
    { title: "You see your classmate just before class starts. You say:", options: [
      { v: "Salut !", ok: true },
      { v: "Bonsoir.", ok: false, why: "Bonsoir is the evening greeting — and formal for a classmate." },
      { v: "Au revoir.", ok: false, why: "That's a goodbye, not a hello." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you'." },
    ] },
    { title: "It's 8pm. You are seated next to a stranger at a dinner. You say:", options: [
      { v: "Bonsoir.", ok: true },
      { v: "Tu t'appelles comment ?", ok: false, why: "Tu is too familiar for a stranger — and greet before asking a name." },
      { v: "Pardon.", ok: false, why: "Pardon means 'excuse me' — it apologises, it doesn't greet." },
      { v: "Merci.", ok: false, why: "Merci means 'thank you' — greet first: Bonsoir." },
    ] },
    { title: "You're heading to bed and say this to family before sleeping.", options: [
      { v: "Bonne nuit.", ok: true },
      { v: "Bonsoir.", ok: false, why: "Bonsoir greets in the evening — at bedtime you wish Bonne nuit." },
      { v: "Bonne journée !", ok: false, why: "Bonne journée is a daytime send-off." },
      { v: "Bonjour, monsieur.", ok: false, why: "A formal daytime hello — not a bedtime wish to family." },
    ] },
  ],
  // The flat union — what every generic consumer (the Pre-Test flap,
  // pretestHrefForDeck) asks: does this SIO have questions? The panel renders
  // SIO-010 one situation at a time, so nothing ever shows all 21 at once.
  "SIO-010": SIO010_SITUATIONS.flatMap((sit) => sit.questions),
};
