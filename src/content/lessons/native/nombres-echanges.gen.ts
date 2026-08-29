/**
 * « J'ai vingt-cinq ans. » — the generator for SIO-018's lesson.
 *
 * WHY THIS LESSON EXISTS. SIO-018 promises numbers 20–69 "IN SIMPLE EXCHANGES
 * (AGES, PRICES, QUANTITIES)", and its deck is fifteen bare numerals — vingt,
 * vingt et un, trente. The deck contains zero occurrences of `ans`, `euro`,
 * `€` or `prix`. The numbers were taught; the exchanges were not, and counting
 * to sixty-nine is a different skill from answering « Vous avez quel âge ? ».
 * (Dan, 2026-08-28: "3, 17, 18 fill the content".)
 *
 * The three uses in the SIO's own words are the three the lesson drills, and
 * each carries a trap an English speaker reliably falls into:
 *
 *   ages       « J'AI vingt-cinq ANS »  — avoir, not être; `ans` is obligatory
 *   prices     « Ça coûte trente euros » — euro takes the plural s
 *   quantities « Il y a quarante étudiants » — il y a, not "there are"
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** The numbers, written out — SIO-018's own deck, 20 to 69. */
export const NUMBERS: Record<number, string> = {
  20: "vingt", 21: "vingt et un", 22: "vingt-deux", 25: "vingt-cinq", 28: "vingt-huit",
  30: "trente", 31: "trente et un", 33: "trente-trois", 35: "trente-cinq", 39: "trente-neuf",
  40: "quarante", 41: "quarante et un", 44: "quarante-quatre", 47: "quarante-sept",
  50: "cinquante", 51: "cinquante et un", 55: "cinquante-cinq", 58: "cinquante-huit",
  60: "soixante", 61: "soixante et un", 65: "soixante-cinq", 69: "soixante-neuf",
};

export const NUMBER_KEYS = Object.keys(NUMBERS).map(Number);

/**
 * `un` agrees with a feminine noun: « vingt et un ans » but « trente et une
 * personnes ». It is the one place a number changes shape in this range, and
 * the reason the quantity nouns below carry a gender.
 */
export function numberFor(n: number, feminine: boolean): string {
  const w = NUMBERS[n];
  return feminine ? w.replace(/\bun$/, "une") : w;
}

// No `euros` here: the price mode owns money, and a quantity card reading
// "Il y a trente et un euros" is both odd French and a duplicate of it.
export const QUANTITY_NOUNS = [
  { fr: "étudiants", en: "students", f: false },
  { fr: "personnes", en: "people", f: true },
  { fr: "minutes", en: "minutes", f: true },
  { fr: "pages", en: "pages", f: true },
  { fr: "livres", en: "books", f: false },
] as const;

export const PRICE_THINGS = [
  { fr: "le café", en: "the coffee" },
  { fr: "le livre", en: "the book" },
  { fr: "le sandwich", en: "the sandwich" },
  { fr: "le ticket", en: "the ticket" },
] as const;

type Mode = "age" | "prix" | "quantite";

export const NOMBRES_AXES: DiceAxis[] = [
  {
    key: "usage",
    label: "Situation",
    options: [
      { value: "age", label: "l'âge (age)" },
      { value: "prix", label: "le prix (price)" },
      { value: "quantite", label: "la quantité (quantity)" },
    ],
  },
  {
    key: "number",
    label: "Nombre",
    options: NUMBER_KEYS.map((n) => ({ value: String(n), label: `${n} — ${NUMBERS[n]}` })),
  },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function otherNumbers(n: number, count: number, feminine = false): string[] {
  const rest = NUMBER_KEYS.filter((x) => x !== n);
  const out: string[] = [];
  while (out.length < count && rest.length) {
    out.push(numberFor(rest.splice(Math.floor(Math.random() * rest.length), 1)[0], feminine));
  }
  return out;
}

export function nombresQuestion(pinned?: Record<string, string>): DiceQuestion {
  const pinnedN = Number(pinned?.number);
  const n = NUMBER_KEYS.includes(pinnedN) ? pinnedN : pick(NUMBER_KEYS);
  const mode: Mode =
    pinned?.usage === "age" || pinned?.usage === "prix" || pinned?.usage === "quantite"
      ? pinned.usage
      : pick(["age", "prix", "quantite"] as const);

  if (mode === "age") {
    // avoir, not être — the single most common English-speaker error here, so
    // the distractors are the sentence with être and the sentence without `ans`.
    const word = numberFor(n, false);
    const correct = `J'ai ${word} ans.`;
    return {
      meta: "l'âge 🎂",
      big: `« Tu as quel âge ? »  → ${n}`,
      en: `I am ${n} years old.`,
      correct,
      alternates: [`J'ai ${word} ans`],
      easyOptions: [
        correct,
        `Je suis ${word} ans.`,
        `J'ai ${word}.`,
        `Je suis ${word}.`,
      ],
      med: { before: "J'ai", choices: [`${word} ans`, ...otherNumbers(n, 3).map((w) => `${w} ans`)], correct: `${word} ans`, after: "." },
    };
  }

  if (mode === "prix") {
    const thing = pick(PRICE_THINGS);
    const word = numberFor(n, false);
    const correct = `Ça coûte ${word} euros.`;
    return {
      meta: "le prix 💶",
      big: `« ${thing.fr.charAt(0).toUpperCase()}${thing.fr.slice(1)}, c'est combien ? »  → ${n} €`,
      en: `It costs ${n} euros.`,
      correct,
      alternates: [`Ça coûte ${word} euros`, `C'est ${word} euros.`],
      easyOptions: [
        correct,
        `Ça coûte ${word} euro.`,
        ...otherNumbers(n, 2).map((w) => `Ça coûte ${w} euros.`),
      ],
      med: { before: "Ça coûte", choices: [word, ...otherNumbers(n, 3)], correct: word, after: "euros." },
    };
  }

  const noun = pick(QUANTITY_NOUNS);
  const word = numberFor(n, noun.f);
  const correct = `Il y a ${word} ${noun.fr}.`;
  return {
    meta: "la quantité 🔢",
    big: `${n} ${noun.fr}`,
    en: `There are ${n} ${noun.en}.`,
    correct,
    alternates: [`Il y a ${word} ${noun.fr}`],
    easyOptions: [
      correct,
      ...otherNumbers(n, 3, noun.f).map((w) => `Il y a ${w} ${noun.fr}.`),
    ],
    med: { before: "Il y a", choices: [word, ...otherNumbers(n, 3, noun.f)], correct: word, after: `${noun.fr}.` },
  };
}
