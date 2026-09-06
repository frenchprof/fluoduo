/**
 * « soixante-quinze » — the generator for SIO-045.
 *
 * WHY THIS LESSON EXISTS. The can-do is "the numbers from 70 to 99, INCLUDING
 * IN PRICES", and the `numbers-70-99` deck is thirty bare numerals in three
 * letris columns. It gives the learner the words. What it never gives them is
 * the ARITHMETIC, which is the only hard thing about this range and the reason
 * it needs a stop of its own at all:
 *
 *     70  soixante-dix          60 + 10
 *     75  soixante-quinze       60 + 15
 *     80  quatre-vingts         4 x 20        (the only one with an -s)
 *     90  quatre-vingt-dix      4 x 20 + 10
 *     95  quatre-vingt-quinze   4 x 20 + 15
 *
 * A learner who has met the words but not the pattern can read « quatre-vingt-
 * douze » and still not build it, and will say « septante » or « nonante » —
 * correct in Belgium and Switzerland, not in the course's French.
 *
 * The « -s » of quatre-vingts is the one spelling trap: it appears on 80 alone
 * and disappears the moment anything follows it — quatre-vingt-un, quatre-
 * vingt-dix. That is drilled as a distractor, not explained.
 *
 * Prices are the applied half the can-do names. SIO-044's market exchange uses
 * these numbers from the customer's side; this stop is where the numbers
 * themselves are built.
 */
import type { DiceAxis, DiceQuestion } from "./types";

const UNITS: Record<number, string> = {
  1: "et un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq", 6: "six",
  7: "sept", 8: "huit", 9: "neuf", 10: "dix", 11: "onze", 12: "douze",
  13: "treize", 14: "quatorze", 15: "quinze", 16: "seize",
  17: "dix-sept", 18: "dix-huit", 19: "dix-neuf",
};

/**
 * 70-99, built the way French builds them. Written as a function rather than a
 * table so the rule is the code: 70-79 is sixty plus a teen, 80-99 is four
 * twenties plus the rest.
 */
export function numberFor(n: number): string {
  if (n === 80) return "quatre-vingts";           // the lone -s
  if (n < 80) {
    if (n === 70) return "soixante-dix";
    if (n === 71) return "soixante et onze";      // et, and no hyphen
    return `soixante-${UNITS[n - 60]}`;
  }
  if (n === 90) return "quatre-vingt-dix";
  if (n === 81) return "quatre-vingt-un";         // no `et` in the 80s
  return `quatre-vingt-${UNITS[n - 80]}`;
}

export const KEYS = Array.from({ length: 30 }, (_, i) => 70 + i);

export const BANDS = [
  { key: "70", label: "70–79", from: 70, to: 79 },
  { key: "80", label: "80–89", from: 80, to: 89 },
  { key: "90", label: "90–99", from: 90, to: 99 },
] as const;

export const SOIXANTE_AXES: DiceAxis[] = [
  { key: "band", label: "Quelle dizaine ?", options: BANDS.map((b) => ({ value: b.key, label: b.label })) },
  { key: "mode", label: "Nombre ou prix ?", options: [
    { value: "nombre", label: "le nombre" },
    { value: "prix", label: "le prix" },
  ] },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const dedupe = (xs: string[]): string[] => [...new Set(xs)];

function nearby(n: number, count: number): number[] {
  const pool = KEYS.filter((x) => x !== n);
  const out: number[] = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

export function soixanteQuestion(pinned?: Record<string, string>): DiceQuestion {
  const band = BANDS.find((b) => b.key === pinned?.band);
  const pool = band ? KEYS.filter((n) => n >= band.from && n <= band.to) : KEYS;
  const n = pick(pool);
  const word = numberFor(n);
  const isPrice = pinned?.mode === "prix" ? true : pinned?.mode === "nombre" ? false : Math.random() < 0.5;

  // The two real errors: the Belgian/Swiss forms, and the stray -s.
  const regional = n >= 70 && n < 80 ? `septante-${UNITS[n - 60] ?? ""}`.replace("-et un", " et un")
    : n >= 90 ? `nonante-${UNITS[n - 90] ?? "dix"}`.replace("-dix", "")
    : "octante";
  const strayS = word.includes("quatre-vingt-") ? word.replace("quatre-vingt-", "quatre-vingts-") : `${word}s`;

  if (isPrice) {
    const correct = `Ça fait ${word} euros.`;
    return {
      meta: "le prix 💶",
      big: `« Ça fait combien ? »  →  ${n} €`,
      en: `That's ${n} euros.`,
      correct,
      alternates: [`${word} euros`, `Ça fait ${word} euros`],
      easyOptions: dedupe([
        correct,
        `Ça fait ${strayS} euros.`,
        ...nearby(n, 2).map((m) => `Ça fait ${numberFor(m)} euros.`),
      ]).slice(0, 4),
      med: {
        before: "Ça fait",
        choices: dedupe([word, strayS, ...nearby(n, 2).map(numberFor)]).slice(0, 4),
        correct: word,
        after: "euros.",
      },
    };
  }

  const correct = word;
  return {
    meta: n >= 80 ? "4 × 20 ✏️" : "60 + … ✏️",
    big: String(n),
    en: n === 80 ? "eighty — the only one that takes an -s" : `write ${n} in French`,
    correct,
    easyOptions: dedupe([
      correct,
      strayS,
      regional,
      ...nearby(n, 2).map(numberFor),
    ]).slice(0, 4),
    med: {
      before: "",
      choices: dedupe([word, strayS, regional, ...nearby(n, 1).map(numberFor)]).slice(0, 4),
      correct: word,
      after: "",
    },
  };
}
