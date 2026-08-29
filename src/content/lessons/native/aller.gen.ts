/**
 * The "Aller à + lieu" generator — data, axes and question maker, split out of
 * aller.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. That matters more than it sounds: a
 * generator that silently ignores a pinned axis looks in source exactly like
 * one that honours it, so reading the code proves nothing. With the maker
 * here, verify41 imports this module and EXECUTES it against every pin.
 *
 * WHICH AXES. Sujet and Forme are the conjugation; Préposition is the actual
 * grammar this lesson teaches (au / à la / à l' / aux / en / chez), so pinning
 * it lets a learner drill the contraction they keep missing. The nineteen
 * PLACES are vocabulary, not grammar, and a nineteen-item dropdown would bury
 * the three axes that matter — so places stay rolled, filtered to whichever
 * preposition is pinned.
 */
import type { DiceAxis, DiceQuestion } from "./types";

export const SUBJECTS: { aff: string; neg: string }[] = [
  { aff: "je vais", neg: "je ne vais pas" },
  { aff: "tu vas", neg: "tu ne vas pas" },
  { aff: "il va", neg: "il ne va pas" },
  { aff: "elle va", neg: "elle ne va pas" },
  { aff: "on va", neg: "on ne va pas" },
  { aff: "nous allons", neg: "nous n'allons pas" },
  { aff: "vous allez", neg: "vous n'allez pas" },
  { aff: "ils vont", neg: "ils ne vont pas" },
  { aff: "elles vont", neg: "elles ne vont pas" },
];

export const PLACES: { lieu: string; pre: string; en: string }[] = [
  { lieu: "cinéma", pre: "au", en: "cinema" },
  { lieu: "parc", pre: "au", en: "park" },
  { lieu: "stade", pre: "au", en: "stadium" },
  { lieu: "restaurant", pre: "au", en: "restaurant" },
  { lieu: "café", pre: "au", en: "café" },
  { lieu: "supermarché", pre: "au", en: "supermarket" },
  { lieu: "piscine", pre: "à la", en: "swimming pool" },
  { lieu: "bibliothèque", pre: "à la", en: "library" },
  { lieu: "plage", pre: "à la", en: "beach" },
  { lieu: "montagne", pre: "à la", en: "mountain" },
  { lieu: "école", pre: "à l'", en: "school" },
  { lieu: "église", pre: "à l'", en: "church" },
  { lieu: "magasins", pre: "aux", en: "shops" },
  { lieu: "toilettes", pre: "aux", en: "toilets" },
  { lieu: "ville", pre: "en", en: "town" },
  { lieu: "médecin", pre: "chez le", en: "doctor" },
  { lieu: "coiffeur", pre: "chez le", en: "hairdresser" },
  { lieu: "ami", pre: "chez un", en: "a friend's place" },
  { lieu: "moi", pre: "chez", en: "my place" },
];

const CONTRACTIONS = ["au", "à la", "à l'", "aux"];
/** Plausible near-miss prepositions per correct form. */
export const ALT: Record<string, string[]> = {
  "au": CONTRACTIONS, "à la": CONTRACTIONS, "à l'": CONTRACTIONS, "aux": CONTRACTIONS,
  "en": ["en", "à la", "au", "aux"],
  "chez le": ["chez le", "au", "à la", "chez"],
  "chez un": ["chez un", "à l'", "au", "chez"],
  "chez": ["chez", "chez le", "à", "au"],
};

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
export const pp = (pre: string, lieu: string) => pre + (pre.endsWith("'") ? "" : " ") + lieu;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Every preposition the deck actually uses, in teaching order. */
const PREPS = [...new Set(PLACES.map((p) => p.pre))];

export const ALLER_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.aff, label: s.aff })) },
  { key: "prep", label: "Préposition", options: PREPS.map((p) => ({ value: p, label: p })) },
  {
    key: "polarity",
    label: "Forme",
    options: [
      { value: "aff", label: "affirmatif" },
      { value: "neg", label: "négatif" },
    ],
  },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors existed.
 */
export function allerQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = SUBJECTS.find((x) => x.aff === pinned?.subject) ?? pick(SUBJECTS);
  // A pinned preposition narrows the places rather than being applied on top
  // of one: "au" with "piscine" would be the wrong sentence, not a harder one.
  const inPrep = pinned?.prep ? PLACES.filter((x) => x.pre === pinned.prep) : [];
  const p = inPrep.length ? pick(inPrep) : pick(PLACES);
  const neg = pinned?.polarity === "neg" || (pinned?.polarity !== "aff" && Math.random() < 0.35);
  const sv = cap(neg ? s.neg : s.aff);
  const alts = ALT[p.pre];
  return {
    meta: `${sv} … (${neg ? "don't/doesn't go" : "go/goes"})`,
    big: p.lieu,
    en: p.en,
    correct: `${sv} ${pp(p.pre, p.lieu)}.`,
    easyOptions: alts.map((a) => `${sv} ${pp(a, p.lieu)}.`),
    med: { before: sv, choices: [...alts], correct: p.pre, after: `${p.lieu}.` },
  };
}
