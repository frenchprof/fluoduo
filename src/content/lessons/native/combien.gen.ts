/**
 * « Il y a combien d'étudiants ? » — the generator for SIO-007's lesson.
 *
 * The deck is twenty-one numerals in two letris columns and « combien »
 * appears nowhere, so the promise's second half — "or ask how many students
 * there are in the classroom" — had nothing behind it.
 *
 * Dan's ruling, 2026-08-29, is deliberately narrow: "Stop 7 should stop at
 * number 10 and just add: Il y a combien d'étudiants ?" So this teaches ONE
 * question and its answer, with 0-10. Numbers 11-20 stay a counting deck, and
 * the fuller set of exchanges (ages, prices, quantities) belongs to SIO-018,
 * which is a different point in the course and stays a separate lesson.
 */
import type { DiceAxis, DiceQuestion } from "./types";

export const NUMBERS: Record<number, string> = {
  0: "zéro", 1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq",
  6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
};
export const KEYS = Object.keys(NUMBERS).map(Number);

/** `un` agrees: « une étudiante », « une personne ». */
export const COUNTED = [
  { fr: "étudiants", en: "students", f: false },
  { fr: "étudiantes", en: "female students", f: true },
  { fr: "professeurs", en: "teachers", f: false },
  { fr: "personnes", en: "people", f: true },
] as const;

export function numberFor(n: number, feminine: boolean): string {
  return feminine && NUMBERS[n] === "un" ? "une" : NUMBERS[n];
}

export const COMBIEN_AXES: DiceAxis[] = [
  { key: "number", label: "Combien ?", options: KEYS.map((n) => ({ value: String(n), label: `${n} — ${NUMBERS[n]}` })) },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function otherNumbers(n: number, count: number, f = false): string[] {
  const rest = KEYS.filter((x) => x !== n);
  const out: string[] = [];
  while (out.length < count && rest.length) out.push(numberFor(rest.splice(Math.floor(Math.random() * rest.length), 1)[0], f));
  return out;
}

export function combienQuestion(pinned?: Record<string, string>): DiceQuestion {
  const pn = Number(pinned?.number);
  const n = KEYS.includes(pn) ? pn : pick(KEYS);
  const c = pick(COUNTED);
  const word = numberFor(n, c.f);
  // The NOUN agrees with the count. The answer key used to read « Il y a un
  // étudiants » and « zéro professeurs » (found by executing the generator,
  // 31 Aug) — after un/une and zéro, French takes the singular.
  const noun = n <= 1 ? c.fr.replace(/s$/, "") : c.fr;
  // « combien de » only elides before a vowel: d'étudiants, but DE personnes.
  const de = /^[aeiouéèêh]/i.test(c.fr) ? "d'" : "de ";
  const correct = `Il y a ${word} ${noun}.`;
  return {
    meta: "combien ? 🔢",
    big: `« Il y a combien ${de}${c.fr} ? »  → ${n}`,
    en: n === 1 ? `There is 1 ${c.en.replace(/s$/, "").replace("people", "person")}.` : `There are ${n} ${c.en}.`,
    correct,
    alternates: [`Il y a ${word} ${noun}`],
    easyOptions: [
      correct,
      `Il a ${word} ${noun}.`,
      ...otherNumbers(n, 2, c.f).map((w) => `Il y a ${w} ${noun}.`),
    ],
    med: { before: "Il y a", choices: [word, ...otherNumbers(n, 3, c.f)], correct: word, after: `${noun}.` },
  };
}
