"use client";

/**
 * The mixed revision run: MémoiRecall drawing across all seventeen tested
 * stops in one sitting, rather than seventeen separate doors (Dan,
 * 2026-09-14).
 *
 * It is the SAME DRILL, given a list instead of one deck — no second copy of
 * the flashcard logic to drift out of step with the per-deck route. Rows are
 * built per deck inside it, because an item's article prefix is defined by its
 * own deck.
 */
import FlipItPage from "@/app/practice/flip-it/[collectionId]/FlipItContent";
import { TESTED_DECK_IDS } from "@/content/testedDecks";

export default function Page() {
  return <FlipItPage collectionIds={TESTED_DECK_IDS} title="revision" />;
}
