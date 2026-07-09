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

const GRAMMAR = new Set([2, 11, 14, 19, 22, 24, 25, 26, 28, 32, 34, 35, 37, 42, 43, 44, 45, 46, 48]);
const PHRASES = new Set([1, 8, 9, 29, 36, 39]);
const PRODUCTION = new Set([10, 20, 30, 40, 49, 50]);

export function sioKind(sioId: string): SioKind {
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
