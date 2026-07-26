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
// 43 (five adverbs), 44 (shop names), 45A (number words, like 007/018) → vocab;
// 45 (transactional chunks « Je voudrais… », « Ça fait combien ? ») → phrases —
// Unité 4 gains its expression stop.
const GRAMMAR = new Set([2, 11, 14, 19, 22, 24, 25, 26, 28, 32, 34, 35, 37, 38, 42, 46, 47, 48]);
const PHRASES = new Set([1, 8, 9, 29, 36, 39, 45]);
const PRODUCTION = new Set([10, 20, 30, 40, 49, 50]);

/** SECONDARY focus (Dan, 2026-07-26: "put the secondary focus under the
 *  primary ones") — only where the deck/lesson content genuinely carries a
 *  second load; null elsewhere means the stop is single-focus. Evidence-based
 *  from the July 2026 content audit; Dan red-pens.
 *  Sociolinguistic note: 2 (tu/vous) is register work grammaticalized — coded
 *  grammar by machinery, vocab secondary for its judged person-nouns. */
const SECONDARY: Partial<Record<number, SioKind>> = {
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
  44: "grammar",   // à la / au + shop contractions behind the shop names
  45: "vocab",     // numbers 70–99 merged into the market (prices)
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
  // 045A parses to 45 and would inherit au-marché's kind — but it is number
  // words, vocab like its siblings 007 and 018 (content audit 2026-07-25).
  if (sioId === "SIO-045A") return "vocab";
  const n = parseInt(sioId.split("-")[1] ?? "", 10);
  if (PRODUCTION.has(n)) return "production";
  if (GRAMMAR.has(n)) return "grammar";
  if (PHRASES.has(n)) return "phrases";
  return "vocab";
}

// Legend labels (Dan, 2026-07-08): "communication" over "atelier"; and
// "expressions" over "phrases" — the kind means formulaic chunks (English
// sense), and French « phrase » = sentence would mislead.
export const KIND_LABEL: Record<SioKind, string> = {
  vocab: "vocabulaire",
  grammar: "grammaire",
  phrases: "expressions",
  production: "communication",
};
