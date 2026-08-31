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
import { medFrom, sentence, type Slot } from "./cloze.ts";

/**
 * `pron` and `verb` are the same sentence as `aff`/`neg`, taken apart.
 *
 * The whole phrases stay because the axis dropdown and every existing caller
 * read them; the parts were added (2026-08-31) so the ★ ladder can blank the
 * VERB as well as the preposition — a phrase cannot be half-withdrawn.
 */
export const SUBJECTS: { aff: string; neg: string; pron: string; verb: string }[] = [
  { aff: "je vais", neg: "je ne vais pas", pron: "je", verb: "vais" },
  { aff: "tu vas", neg: "tu ne vas pas", pron: "tu", verb: "vas" },
  { aff: "il va", neg: "il ne va pas", pron: "il", verb: "va" },
  { aff: "elle va", neg: "elle ne va pas", pron: "elle", verb: "va" },
  { aff: "on va", neg: "on ne va pas", pron: "on", verb: "va" },
  { aff: "nous allons", neg: "nous n'allons pas", pron: "nous", verb: "allons" },
  { aff: "vous allez", neg: "vous n'allez pas", pron: "vous", verb: "allez" },
  { aff: "ils vont", neg: "ils ne vont pas", pron: "ils", verb: "vont" },
  { aff: "elles vont", neg: "elles ne vont pas", pron: "elles", verb: "vont" },
];
/** Every distinct form of ALLER — the options when the verb is the blank. */
const ALLER_FORMS = ["vais", "vas", "va", "allons", "allez", "vont"];

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
  // The sentence as its parts — pronoun · VERB · (pas) · PREPOSITION · place.
  // ★ takes the verb; ★★ takes the verb AND the preposition, which is the
  // contraction this stop exists to teach. In the negative the verb sits inside
  // « ne … pas », and « nous n'allons » elides, so the pronoun chunk carries the
  // apostrophe and sentence() glues across it.
  const verb: Slot = { key: "verb", text: s.verb, choices: ALLER_FORMS };
  const prep: Slot = { key: "prep", text: p.pre, choices: [...alts] };
  const tail: Slot = { text: `${p.lieu}.` };
  const slots: Slot[] = neg
    ? [{ text: `${cap(s.pron)} ${/^[aeiouéèêh]/i.test(s.verb) ? "n'" : "ne"}` }, verb, { text: "pas" }, prep, tail]
    : [{ text: cap(s.pron) }, verb, prep, tail];
  return {
    meta: `${sv} … (${neg ? "don't/doesn't go" : "go/goes"})`,
    big: p.lieu,
    en: p.en,
    correct: sentence(slots),
    easyOptions: alts.map((a) => `${sv} ${pp(a, p.lieu)}.`),
    // Derived, not hand-written — the two can no longer drift apart.
    med: medFrom(slots, "prep"),
    slots,
  };
}
