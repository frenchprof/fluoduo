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
