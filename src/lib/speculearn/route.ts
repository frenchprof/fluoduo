/**
 * WHERE A GOAL'S SPECULEARN LIVES — one answer, for the surfaces that ask.
 *
 * Dan, 2026-09-07: *"they CAN be and MUST NOW BE MERGED AS ONE!"*
 *
 * Three places wrote this address by hand — the goal card's tab row, the swipe
 * rail's forward step, and the activity label table — and after the merge they
 * disagreed: the rail still sent a learner to `/practice/speculearn/<deck>`
 * while the card sent them to the merged run. Three copies of one fact is how
 * they start disagreeing, which is exactly why `pretestHrefForDeck` was pulled
 * out of CahierShell on 7 Sep. Same lesson, one file later.
 *
 * KEYED BY THE GOAL because the pool is: 36 goals have an authored pre-test
 * and no generated deck, so an address keyed on the deck cannot reach them.
 */

import { stopForDeck } from "@/lib/stopTag";

/** The merged SpecuLearn for a goal. The question is a hash on this one page. */
export function speculearnHref(sioId: string): string {
  return `/practice/speculearn/goal/${sioId}`;
}

/** …asked with a deck instead, which is what most callers have to hand. */
export function speculearnHrefForDeck(collectionId: string | null | undefined): string | null {
  const sio = stopForDeck(collectionId);
  return sio ? speculearnHref(sio.id) : null;
}
