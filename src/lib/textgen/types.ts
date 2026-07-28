/**
 * ÉcouTexte — generated mini-texts for listening scaffolding.
 *
 * A generator is NOT a bag of sentences. It is a DISCOURSE PLAN: a scenario
 * draws its cast (one place, one food, one shop…) ONCE, then lays out five
 * ordered beats that all refer back to that cast. Asking for n sentences
 * renders beats[0..n-1] — so every length is the same text, told shorter or
 * longer, never a different text. The prefix property is the whole design:
 *
 *   beat 0 introduces every referent with a full noun phrase;
 *   beats 1–4 may then use anaphora (y, c'est, ce/cette/ces, le/la défini)
 *   because beat 0 has already established what they point at.
 *
 * Cohesion is deliberately built out of the unit's OWN grammar, so listening
 * to a text rehearses the same machinery the unit teaches:
 *   Unité 3 — connectors (d'abord/ensuite/enfin), the pronoun y, c'est + place
 *   Unité 4 — demonstratives (ce/cette/ces) as second mention, le/la défini
 *             against du/de la partitif, frequency adverbs, futur proche
 */

/** The agreement features a noun needs before an article can be chosen. */
export type Gram = {
  g: "m" | "f";
  /** Plural headword ("pâtes", "légumes"). */
  pl?: boolean;
  /** Starts with a vowel or mute h — drives elision (l', de l', cet). */
  vowel?: boolean;
};

/** A lexicon headword. `fr` is the BARE noun — articles are computed. */
export type Noun = Gram & { fr: string; en: string };

/**
 * A country or city. French fixes its preposition by name, not by rule the
 * learner can apply from the headword alone, so it is stored, not derived.
 */
export type Destination = { fr: string; en: string; prep: string; enPrep: string };

/** Adjective with its four written forms, in the order ms, fs, mp, fp. */
export type Adj = { ms: string; fs: string; mp: string; fp: string; en: string };

/** Deterministic RNG — every text is a pure function of its seed. */
export type Rng = () => number;

/** Where a beat sits in the text being rendered right now. */
export type Pos = {
  /** 0-based index of this beat. */
  i: number;
  /** How many sentences the learner asked for. */
  n: number;
  /** True when this beat closes the text — drives "Enfin, …". */
  last: boolean;
};

export type Sentence = { fr: string; en: string };

export type MiniText = {
  unit: number;
  scenario: string;
  seed: number;
  sentences: Sentence[];
};

/** A scenario with its cast type erased, so a unit can hold a mixed list. */
export type Scenario = {
  id: string;
  /** Renders the first `n` beats (1 ≤ n ≤ 5) as one cohesive text. */
  write: (rng: Rng, n: number) => Sentence[];
};

export type UnitTextGen = {
  unit: number;
  /** Chapter name, e.g. "En ville". */
  title: string;
  scenarios: Scenario[];
};

export const MAX_SENTENCES = 5;
