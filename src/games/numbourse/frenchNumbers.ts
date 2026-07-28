/**
 * French number words, 0–999 999 — the voice of the NumBourse brokers.
 * Traditional orthography, matching the hand-authored numbers decks
 * (soixante et onze, quatre-vingt-un, deux cent trois): hyphens only inside
 * the compound tens, « et » unhyphenated, plural -s on vingt/cent dropped
 * when another numeral follows (quatre-vingt-trois, deux cent mille).
 */

const UNITS = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];

function tens(n: number, followed: boolean): string {
  if (n < 20) return UNITS[n];
  if (n < 70) {
    const t = TENS[Math.floor(n / 10)];
    const u = n % 10;
    if (u === 0) return t;
    if (u === 1) return `${t} et un`;
    return `${t}-${UNITS[u]}`;
  }
  if (n < 80) {
    if (n === 71) return "soixante et onze";
    return `soixante-${UNITS[n - 60]}`;
  }
  if (n === 80) return followed ? "quatre-vingt" : "quatre-vingts";
  return `quatre-vingt-${UNITS[n - 80]}`;
}

function hundreds(n: number, followed: boolean): string {
  if (n < 100) return tens(n, followed);
  const h = Math.floor(n / 100);
  const r = n % 100;
  const head =
    h === 1 ? "cent" : `${UNITS[h]} cent${r === 0 && !followed ? "s" : ""}`;
  return r === 0 ? head : `${head} ${tens(r, followed)}`;
}

/** 0–999 999 → French words (« trois cent mille quarante-deux »). */
export function frenchNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999999) {
    throw new Error(`frenchNumber: out of range (${n})`);
  }
  if (n < 1000) return hundreds(n, false);
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  const head = th === 1 ? "mille" : `${hundreds(th, true)} mille`;
  return r === 0 ? head : `${head} ${hundreds(r, false)}`;
}

/** Digit grouping the French way: 123456 → « 123 456 » (narrow NBSP). */
export function frenchDigits(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
}
