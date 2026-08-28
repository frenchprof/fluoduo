/**
 * How long a practice run is (Dan, 2026-08-25: "let the learner choose before
 * starting").
 *
 * THE PROBLEM THIS SOLVES. No drill capped its queue. iComplete on the
 * possessives deck served 21 nouns x 6 persons + 10 sentences = 136 questions
 * in one sitting; nationalities came to 100; WorDrill's "Tout" scope compiled
 * the entire curriculum into a single run. There was no finish line, so
 * quitting and finishing looked identical — to the learner, who never got the
 * satisfaction of completing anything, and to the app, which could not tell
 * the two apart either.
 *
 * WHY A CHOICE AND NOT A FIXED CAP. A fixed twelve would have been the smaller
 * change, and Dan was offered it. He picked the chooser: a learner with five
 * minutes and a learner revising for a test want different runs off the same
 * deck, and the app cannot know which one is at the keyboard. The cost is one
 * decision before any French happens, which is why the options are three and
 * the labels are lengths, not settings.
 *
 * SHORT DECKS DO NOT ASK. Offering "10 / 25 / all" on a deck of nine is a
 * question with one real answer, so `offer()` returns null and the caller
 * skips the chooser entirely — the run is simply the whole deck. The
 * threshold is deliberately just above the common deck size (most curated
 * decks are 15-30 items) so the chooser appears where it earns its place.
 */

/** The lengths on offer. `null` = every question in the deck. */
export const SESSION_LENGTHS = [10, 25, null] as const;
export type SessionLength = (typeof SESSION_LENGTHS)[number];

/** Below this, a run is already short enough that asking is noise. */
export const ASK_ABOVE = 14;

/**
 * The lengths worth offering for a queue of `total` questions, or null when
 * the question should not be asked at all.
 *
 * A length is only offered when it would actually shorten the run — there is
 * no point showing "25" on a deck of twenty, because it and "all" are the
 * same run wearing two labels.
 */
export function offer(total: number): SessionLength[] | null {
  if (total <= ASK_ABOVE) return null;
  const shorter = SESSION_LENGTHS.filter(
    (n): n is Exclude<SessionLength, null> => n !== null && n < total,
  );
  if (shorter.length === 0) return null;
  return [...shorter, null];
}

/** Take the learner's chosen length off an already-shuffled queue. */
export function cap<T>(queue: T[], choice: SessionLength): T[] {
  return choice === null ? queue : queue.slice(0, choice);
}

/** The label a length wears. `all` names the real number so the learner is
 *  choosing between three known quantities, not two numbers and a mystery. */
export function label(choice: SessionLength, total: number): string {
  return choice === null ? `All ${total}` : String(choice);
}
