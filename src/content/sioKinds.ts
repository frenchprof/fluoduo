/**
 * What kind of work each SIO is (Dan, 2026-07-08: "some are vocab heavy, some
 * are grammar heavy — a different shape for each might do the trick"). Drives
 * the node shapes on the level map:
 *   vocab      → circle      (word sets: colours, countries, aliments…)
 *   grammar    → square      (rule drills: être, partitifs, prépositions…)
 *   phrases    → bubble      (formulaic language: salutations, inviter…)
 *   production → diamond     (the ateliers: role-plays, e-mail, itinéraire)
 */
export type SioKind = "vocab" | "grammar" | "phrases" | "production";

// Content-audited 2026-07-25 (Dan: align the description with what the
// content truly looks at, THEN identify the focus):
// 38 (12/12 gapped en/à drills) + 47 (12/12 gapped modal sentences) → grammar;
// 43 (five adverbs), 44 (shop names), 45/45A (number words, like 007/018) → vocab.
// Re-audited 2026-08-11 against the formulated SIO objectives: the market
// transaction chunks (« Je voudrais… », « Ça fait combien ? ») now live in 44,
// so the 45 slot — whichever id holds it — is purely numbers 70–99, vocab.
const GRAMMAR = new Set([2, 11, 14, 19, 22, 24, 25, 26, 28, 32, 34, 35, 37, 38, 42, 46, 47, 48]);
const PHRASES = new Set([1, 8, 9, 29, 36, 39]);
const PRODUCTION = new Set([10, 20, 30, 40, 49, 50]);

/** SECONDARY focus (Dan, 2026-07-26: "put the secondary focus under the
 *  primary ones") — only where the deck/lesson content genuinely carries a
 *  second load; null elsewhere means the stop is single-focus. Evidence-based
 *  from the July 2026 content audit; Dan red-pens.
 *  Sociolinguistic note: 2 (tu/vous) is register work grammaticalized — coded
 *  grammar by machinery, vocab secondary for its judged person-nouns. */
const SECONDARY: Partial<Record<number, SioKind>> = {
  1: "grammar",    // s'appeler conjugated across all 8 forms under the formulas
  2: "vocab",      // tu/vous judged over person-nouns (le copain, la dame…)
  19: "phrases",   // avoir states are chunks: j'ai faim, j'ai … ans
  21: "grammar",   // c'est un / ce sont des frames around the object nouns
  22: "vocab",     // possessions & family nouns carry the possessive drill
  23: "grammar",   // aimer + infinitive/noun structures under the activities
  26: "vocab",     // the places being gone to (au cinéma, à la piscine)
  27: "phrases",   // time formulas: Quelle heure est-il ?, à huit heures
  28: "phrases",   // daily-routine chunks ride the reflexive drills
  31: "phrases",   // weather is formulaic: Il fait beau, il y a du soleil
  32: "vocab",     // the country/city names the prepositions attach to
  34: "vocab",     // food nouns under the partitive drill
  35: "phrases",   // est-ce que / qu'est-ce que interrogative frames
  36: "vocab",     // ordinal numbers inside the directions chunks
  38: "vocab",     // transport nouns under the en/à drill
  42: "vocab",     // quantities & containers nouns
  43: "grammar",   // adverb placement behind the frequency word-set
  44: "phrases",   // the absorbed market dialogue: Je voudrais…, Ça fait
                   // combien ?, Et avec ceci ? — a bigger second load than
                   // the à la / au contractions it previously credited
  46: "vocab",     // food nouns under the demonstrative drill
  47: "phrases",   // plan-making chunks: On va… ?, Tu veux venir ?
  48: "phrases",   // same modal deck: suggestion/obligation chunks
  49: "phrases",   // restaurant politeness liturgy in the written review
  50: "phrases",   // je vais prendre…, l'addition s'il vous plaît
};

/** Secondary focus of a SIO, or null if single-focus. */
export function sioSecondary(sioId: string): SioKind | null {
  const n = parseInt(sioId.split("-")[1] ?? "", 10);
  return (Number.isFinite(n) && SECONDARY[n]) || null;
}

export function sioKind(sioId: string): SioKind {
  // SIO-045 parses to 45, which is in no set → vocab, same as a plain
  // SIO-045 would be — no special case needed since the market chunks
  // moved into 44 (re-audit 2026-08-11).
  const n = parseInt(sioId.split("-")[1] ?? "", 10);
  if (PRODUCTION.has(n)) return "production";
  if (GRAMMAR.has(n)) return "grammar";
  if (PHRASES.has(n)) return "phrases";
  return "vocab";
}

// Legend labels (Dan, 2026-07-08): "communication" over "atelier"; and
// "expressions" over "phrases" — the kind means formulaic chunks (English
// sense), and French « phrase » = sentence would mislead.
//
// ENGLISH SINCE 6 SEP (item 7). This is the map's LEGEND — the key a learner
// reads to know what a stop's colour means, and the words a screen reader
// announces for every stop (Map2DGrid puts KIND_LABEL in each node's
// aria-label). Chrome, not content, so it speaks the learner's language.
// Dan's July ruling survives intact: it chose WHICH word, not which language,
// and both of its choices are the same in English — "expressions" over
// "phrases" still avoids « phrase » = sentence, and "communication" still
// beats "atelier". Only two words actually change.
export const KIND_LABEL: Record<SioKind, string> = {
  vocab: "vocabulary",
  grammar: "grammar",
  phrases: "expressions",
  production: "communication",
};
