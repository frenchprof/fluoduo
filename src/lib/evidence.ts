/**
 * The evidence model — what a stored answer MEANS, not just whether it was right.
 *
 * PRD §7: "Independently producing an answer in a new context after a delay is
 * stronger evidence than selecting the same answer correctly from options
 * immediately after studying it." Until now the response store recorded only
 * `status: met | missed`, so those two cases were indistinguishable and no
 * mastery estimate built on them could be trusted.
 *
 * Four facts turn a graded answer into evidence:
 *
 *   outcomeId     WHICH curriculum outcome it bears on
 *   evidenceType  WHAT KIND of performance it was (recognition ... free production)
 *   assistance    HOW MUCH help was taken before answering
 *   independent   derived: assistance === "none"
 *
 * All four are optional in firestore.rules (deployed 2026-08-10), so every
 * existing writer keeps working untouched and callers can adopt them one at a
 * time.
 *
 * NOTE ON THE CAP: the same rules deploy raised the responses `xp` ceiling from
 * 100 to 2000. The old ceiling silently rejected every correct answer from a
 * learner on a 7+ day streak (60 x2 = 120), so this evidence layer is being
 * built on a store with a known-bad window. Any analysis spanning before
 * 2026-08-10 must carry that caveat.
 */
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { sioForDeck, sioForItem } from "@/lib/curriculum";
import { PRETESTS, sioIdForPretest } from "@/content/pretests";

/** Kinds of performance, ordered roughly weakest → strongest as evidence.
 *  Mirrors the enum in firestore.rules — keep them in step. */
export type EvidenceType =
  | "recognition"   // pick from options, sort into a column, reassemble syllables
  | "constrained"   // produce a specific target: cloze, typed article, conjugation
  | "free"          // open production with no single right answer
  | "receptive"     // listening / reading comprehension
  | "productive"    // spoken production
  | "transfer"      // the outcome applied in an unfamiliar context
  | "delayed"       // retrieval after a spacing interval
  | "diagnostic"    // cold pretest, before instruction
  | "teacher";      // teacher sign-off

/** Rungs of the help ladder (PRD §8). Mirrors firestore.rules. */
export type AssistanceLevel =
  | "none"          // unaided
  | "nudge"         // rung 1
  | "question"      // rung 2 — a guiding question
  | "scaffold"      // rung 3
  | "partial"       // rung 4 — partial reveal
  | "answer";       // rung 5 — the answer was shown

export type EvidenceMeta = {
  outcomeId?: string;
  evidenceType?: EvidenceType;
  assistance?: AssistanceLevel;
  assistCount?: number;
  independent?: boolean;
};

// ── activity → evidence type ────────────────────────────────────────────────
// Longest prefix wins. Keys match the `activity` tag threaded through
// recordItemResult since commit 709d7a0, and the pathname fallback.
const ACTIVITY_EVIDENCE: Array<[string, EvidenceType]> = [
  ["pretest", "diagnostic"],
  ["/pretests/", "diagnostic"],
  ["grammarathon:", "constrained"],
  ["/practice/grammarathon/finale", "delayed"],   // SRS-scheduled, weakness-weighted
  ["/practice/grammarathon/", "constrained"],
  ["complete-it", "constrained"],
  ["/practice/complete-it/", "constrained"],
  ["dice-practice", "constrained"],
  ["/practice/dice/", "constrained"],
  ["lesson-dice:", "constrained"],
  ["conj", "constrained"],
  ["/conjugaison", "constrained"],
  ["say-it", "productive"],
  ["/practice/say-it/", "productive"],
  ["/practice/wordrill", "productive"],
  ["compose-solo", "free"],
  ["compose:", "free"],
  ["/games/compose/", "free"],
  ["ecoutexte", "receptive"],
  ["/practice/ecoutexte", "receptive"],
  ["speculearn", "receptive"],
  ["/practice/speculearn/", "receptive"],
  ["/practice/flip-it/", "recognition"],
  ["flip-it", "recognition"],
  ["/games/lexicalater", "recognition"],
  ["/games/vocabularain", "recognition"],
  ["/games/letris", "recognition"],
  ["/games/matching", "recognition"],
  ["numbourse", "recognition"],
  ["/games/numbourse", "recognition"],
  ["numbus", "recognition"],
  ["/games/numbus", "recognition"],
  ["mcq:", "recognition"],
  ["/reviser", "delayed"],                        // the review queue IS spaced retrieval
];

export function evidenceTypeFor(activityId: string | undefined): EvidenceType | undefined {
  if (!activityId) return undefined;
  let best: EvidenceType | undefined;
  let bestLen = -1;
  for (const [prefix, type] of ACTIVITY_EVIDENCE) {
    if (activityId.startsWith(prefix) && prefix.length > bestLen) {
      best = type;
      bestLen = prefix.length;
    }
  }
  return best;
}

// ── item → outcome ──────────────────────────────────────────────────────────
// THE JOIN TABLE. Item ids do NOT reliably encode their outcome: after the
// 2026-07-14 re-cut the pretest FILES kept their old names, so `u4-sio045-01`
// is frequency-adverb content belonging to SIO-043, and `u4-sio047-01` is
// Commerces belonging to SIO-044. Anything that infers an outcome by parsing
// digits out of an item id will misattribute those. Always resolve here.

// The deck→outcome index lives in @/lib/curriculum now — this module used to
// build a second, subtly different copy of it (it never resolved the `-letris`
// suffix, so three decks answered differently here than in labels.ts).
let pretestToSio: Map<string, string> | null = null;

function indexes() {
  if (!pretestToSio) {
    // PRETEST_BY_SIO is module-private; sioIdForPretest is its exported reverse.
    pretestToSio = new Map();
    for (const p of PRETESTS) {
      const sio = sioIdForPretest(p.id);
      if (sio) pretestToSio.set(p.id, sio);
    }
  }
  return { pretestToSio: pretestToSio! };
}

/**
 * Resolve a stored item id to its curriculum outcome, or undefined when the
 * item genuinely has no outcome behind it (some games pass raw French through,
 * e.g. `recordItemResult(cur.fr)` — those are unresolvable by design, and
 * returning undefined is more honest than guessing).
 */
export function outcomeForItem(itemId: string): string | undefined {
  if (!itemId) return undefined;
  const { pretestToSio } = indexes();

  // finale:SIO-034:2 — the outcome is stated outright
  if (itemId.startsWith("finale:")) {
    const parts = itemId.split(":");
    return parts[1]?.startsWith("SIO-") ? parts[1] : undefined;
  }

  // Pretest items: `<pretestId>-NN`. Longest matching pretest id wins, so
  // `u4-sio047-plans-01` resolves to SIO-047 rather than colliding with
  // `u4-sio047` (Commerces → SIO-044).
  let bestPretest: string | undefined;
  let bestLen = -1;
  for (const [pretestId, sio] of pretestToSio) {
    if (itemId.startsWith(pretestId + "-") && pretestId.length > bestLen) {
      bestPretest = sio;
      bestLen = pretestId.length;
    }
  }
  if (bestPretest) return bestPretest;

  // Deck items: resolved by MEMBERSHIP — which deck actually contains this id.
  //
  // This used to match on `itemId.startsWith(collectionId + "-")`, inside a
  // function whose own header says "never by parsing the id". Four decks author
  // ids that don't begin with their deck name (`nat-01-france` in
  // `nationalities`, `num-70` in `numbers-70-99`, `negpas-01` in
  // `negation-pas`, `directions-full-01` in `directions-matching`), so 84 of
  // 806 curated items resolved to nothing — one in ten, and clustered, so a
  // learner weak on numbers saw a whole screen of unlabelled ids.
  const byMembership = sioForItem(itemId);
  if (byMembership) return byMembership;

  // Fallback for ids generated outside CURATED (a few games synthesise them).
  // Longest prefix wins, so `modaux-plans-03` beats a hypothetical `modaux-`.
  let bestDeck: string | undefined;
  bestLen = -1;
  for (const c of CURATED) {
    const sio = sioForDeck(c.id);
    if (sio && itemId.startsWith(c.id + "-") && c.id.length > bestLen) {
      bestDeck = sio;
      bestLen = c.id.length;
    }
  }
  return bestDeck;
}

// ── assistance ──────────────────────────────────────────────────────────────
/** Map a count of hints taken to its ladder rung. Rung 5 (`answer`) is set
 *  explicitly by the caller that revealed it, never inferred from a count. */
export function assistanceFromHints(hintsTaken: number): AssistanceLevel {
  if (hintsTaken <= 0) return "none";
  if (hintsTaken === 1) return "nudge";
  if (hintsTaken === 2) return "question";
  if (hintsTaken === 3) return "scaffold";
  return "partial";
}

/**
 * Build the evidence block for one graded answer. Every field is optional, so
 * a caller that knows nothing extra still produces a valid (if uninformative)
 * record — adoption can be incremental.
 */
export function buildEvidence(
  itemId: string,
  activityId: string | undefined,
  opts: { hintsTaken?: number; revealed?: boolean; evidenceType?: EvidenceType } = {},
): EvidenceMeta {
  const assistance: AssistanceLevel = opts.revealed
    ? "answer"
    : assistanceFromHints(opts.hintsTaken ?? 0);
  const meta: EvidenceMeta = {
    assistance,
    assistCount: Math.min(20, Math.max(0, opts.hintsTaken ?? 0)),
    // PRD §7: assistance changes evidentiary strength; it does not erase the
    // learning event. A revealed answer still counts as encountered and
    // practised — it just isn't evidence of independent mastery.
    independent: assistance === "none",
  };
  const outcomeId = outcomeForItem(itemId);
  if (outcomeId) meta.outcomeId = outcomeId;
  const type = opts.evidenceType ?? evidenceTypeFor(activityId);
  if (type) meta.evidenceType = type;
  return meta;
}
