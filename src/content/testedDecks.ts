/**
 * THE DECKS THE TEST REACHES — the seventeen tested stops, as deck ids.
 *
 * Dan, 2026-09-14, choosing the shape of the MémoiRecall step: *"One step,
 * drawing across all 17 — a single ~10 min run that mixes cards"*.
 *
 * DERIVED FROM `TESTED_STOPS`, NEVER LISTED AGAIN. The stops are decided once,
 * in content/finale.ts, with the reasoning for every stop left out written
 * beside them. A second hand-written list here would be right this evening and
 * wrong the first time Dan changes his mind about a stop — which he has done
 * twice today already (stop 12 out, « en retard » out).
 *
 * A STOP WITHOUT A DECK IS SKIPPED, not an error. All thirty of the first
 * thirty stops have a MémoiRecall deck today; that is a fact about the content
 * and not a guarantee, and a missing one should cost a learner one deck rather
 * than the whole run.
 */
import { TESTED_STOPS } from "@/content/finale";
import { SIOS } from "@/content/sios";

export const TESTED_DECK_IDS: string[] = TESTED_STOPS
  .map((n) => SIOS[n - 1]?.collectionId)
  .filter((id): id is string => !!id);
