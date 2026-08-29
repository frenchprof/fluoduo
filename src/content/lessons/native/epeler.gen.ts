/**
 * « Comment ça s'écrit ? » — the generator for SIO-003's lesson.
 *
 * WHY THIS LESSON EXISTS. SIO-003 promises "I can say how a name is spelled,
 * OR ASK how it is spelled", and its deck is twenty-six letter cards, A to Z.
 * The letters were taught; the exchange was not. « s'écrit » appeared exactly
 * once in the whole stop, inside the Mémo.
 *
 * It is not a cosmetic gap. Seven stops later, SIO-010's atelier asks a
 * learner to PERFORM this, from memory, in front of the class:
 *
 *     B  Comment ça s'écrit ?
 *     A  Ça s'écrit L – É – A.
 *
 * The course asked for the phrase before it had ever given it. This lesson
 * gives it (Dan, 2026-08-28: "3, 17, 18 fill the content").
 *
 * The generator lives apart from the Mémo's JSX so a check can EXECUTE it —
 * node cannot strip types from a .tsx. Same reason as conjugaison-u1.gen.ts.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** French letter names, from the alphabet deck (SIO-003's own cards). */
export const LETTER_NAME: Record<string, string> = {
  A: "ah", B: "bé", C: "cé", D: "dé", E: "euh", F: "èf", G: "gé", H: "ache",
  I: "i", J: "ji", K: "ka", L: "èl", M: "èm", N: "èn", O: "o", P: "pé",
  Q: "ku", R: "èr", S: "ès", T: "té", U: "u", V: "vé", W: "double vé",
  X: "iks", Y: "i grec", Z: "zèd",
};

/**
 * The names drilled. Short on purpose — a learner spelling aloud for the first
 * time needs three to five letters, not a surname. Léa and Marc are the two
 * from SIO-010's atelier, so the lesson rehearses the exact exchange the
 * atelier will ask for. `accent` names the letter that needs saying aloud:
 * « É » is "e accent aigu", which is the one thing an English speaker cannot
 * guess and the reason « Ça s'écrit L – É – A » is hard to say at all.
 */
type SpellName = { name: string; letters: readonly string[]; accent?: string };

export const NAMES: readonly SpellName[] = [
  { name: "Léa", letters: ["L", "É", "A"], accent: "É" },
  { name: "Marc", letters: ["M", "A", "R", "C"] },
  { name: "Emma", letters: ["E", "M", "M", "A"] },
  { name: "Hugo", letters: ["H", "U", "G", "O"] },
  { name: "Chloé", letters: ["C", "H", "L", "O", "É"], accent: "É" },
  { name: "Yann", letters: ["Y", "A", "N", "N"] },
  { name: "Zoé", letters: ["Z", "O", "É"], accent: "É" },
  { name: "Paul", letters: ["P", "A", "U", "L"] },
  { name: "Inès", letters: ["I", "N", "È", "S"], accent: "È" },
  { name: "Théo", letters: ["T", "H", "É", "O"], accent: "É" },
];

/** How a letter is SAID when spelling aloud. É is not "e" (audit of SIO-010). */
export function sayLetter(l: string): string {
  if (l === "É") return "e accent aigu";
  if (l === "È") return "e accent grave";
  return LETTER_NAME[l] ?? l.toLowerCase();
}

/** « Ça s'écrit L – É – A. » — the written form. */
export function spelledOut(letters: readonly string[]): string {
  return letters.join(" – ");
}

/** What the TTS should read, so it says the letters rather than a word. */
export function spelledAloud(letters: readonly string[]): string {
  return letters.map(sayLetter).join(", ");
}

type Mode = "ask" | "tell";

export const EPELER_AXES: DiceAxis[] = [
  { key: "name", label: "Prénom", options: NAMES.map((n) => ({ value: n.name, label: n.name })) },
  {
    key: "mode",
    label: "Rôle",
    options: [
      { value: "ask", label: "demander (ask)" },
      { value: "tell", label: "répondre (answer)" },
    ],
  },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

/**
 * ASK is a fixed phrase with three plausible near-misses, all of which a
 * learner actually produces: « Comment ça écrit ? » (the reflexive dropped),
 * « Comment ça s'appelle ? » (the wrong verb — it is the verb they DO know
 * from SIO-001, which is exactly why it is the tempting error), and
 * « Comment tu écris ? » (the right idea, the wrong person).
 */
const ASK_ANSWER = "Comment ça s'écrit ?";
const ASK_ALTERNATES = ["Ça s'écrit comment ?"];
const ASK_WRONG = [
  "Comment ça écrit ?",
  "Comment ça s'appelle ?",
  "Comment tu écris ?",
];

export function epelerQuestion(pinned?: Record<string, string>): DiceQuestion {
  const n = NAMES.find((x) => x.name === pinned?.name) ?? pick(NAMES);
  const mode: Mode = pinned?.mode === "ask" || pinned?.mode === "tell"
    ? pinned.mode
    : pick(["ask", "tell"] as const);

  if (mode === "ask") {
    return {
      meta: "demander 🗣️",
      big: `« Je m'appelle ${n.name}. »`,
      en: "You did not catch the spelling. Ask for it.",
      correct: ASK_ANSWER,
      alternates: ASK_ALTERNATES,
      easyOptions: [ASK_ANSWER, ...ASK_WRONG],
      med: { before: "Comment ça", choices: ["s'écrit ?", "écrit ?", "s'appelle ?", "écris ?"], correct: "s'écrit ?", after: "" },
    };
  }

  const correct = `Ça s'écrit ${spelledOut(n.letters)}.`;
  const wrong = others(NAMES, n, 3).map((o) => `Ça s'écrit ${spelledOut(o.letters)}.`);
  return {
    meta: "répondre ✍️",
    big: n.name,
    en: `Spell it out loud${n.accent ? ` — mind the ${n.accent}` : ""}.`,
    correct,
    easyOptions: [correct, ...wrong],
    med: {
      before: "Ça",
      choices: ["s'écrit", "écrit", "s'appelle", "est écrit"],
      correct: "s'écrit",
      after: `${spelledOut(n.letters)}.`,
    },
  };
}
