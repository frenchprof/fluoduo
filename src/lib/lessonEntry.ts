/**
 * WHERE A LEARNER ENTERS THE RAMP — Dan's difficulty ladder, in his own
 * names (2026-08-31: "instead of Découverte, Entraînement, Maîtrise, it was
 * supposed to be Facile, Moyen and Difficile … and there should be a bonus
 * for translating simple sentences").
 *
 * The tiers are a CLASSIFICATION OF MECHANICS, ruled the same day:
 *
 *   Facile     sorting — the words are all given, put them in order
 *              (his module 10: "Click the words in the correct order"),
 *              with recognition cards to open.
 *   Moyen      complete the sentence, ONE piece missing.
 *   Difficile  complete the sentence, TWO pieces missing.
 *   Bonus      the whole sentence from English — "if it requires the entire
 *              sentence, it should have been Bonus."
 *
 * THE MISTAKE THIS MUST NOT REPEAT. A d12 used to open the lesson and its face
 * was a START INDEX: the pager did `queue.slice(entry)`, so a 1 walked all
 * twelve cards and a 12 left the lone translation. That is a run-LENGTH dial
 * wearing a difficulty costume, and because the ramp runs easy → hard it sold
 * the least work at the hard end — precisely backwards. It was removed on
 * 2026-08-25 ("drop the shortcuts, learning should not allow that").
 *
 * So the rule here is absolute and checked: **every entry level is the same
 * number of cards.** Choosing Difficile does not buy a shorter lesson, it
 * buys a harder one — the mechanic changes, the length does not. A learner
 * who wants a shorter sitting uses the session-length chooser
 * (lib/sessionLength.ts), which is a separate, honest control.
 *
 * WHERE "two pieces missing" ACTUALLY HAPPENS: cloze.ts's blankKeysFor —
 * Difficile withdraws every blankable slot, Moyen exactly one. A generator
 * that has not authored `slots` yet can only serve one blank, so its
 * Difficile run falls back to Moyen's card until it is converted; the slots
 * sweep (content lane) closes that gap lesson by lesson.
 */

export type ExerciseKind = "mcq" | "gap" | "build" | "translate";

export type EntryLevel = 1 | 2 | 3 | 4;

export const ENTRY_LEVELS: readonly EntryLevel[] = [1, 2, 3, 4];

/** How many cards a lesson run holds, at every level. See the note above. */
export const RAMP_LENGTH = 12;

const RAMPS: Record<EntryLevel, ExerciseKind[]> = {
  // Facile — 4 recognise, then 8 sort: every word is on the table, the work
  // is putting them in order. Nothing here asks the learner to produce a
  // form from nothing.
  1: ["mcq", "mcq", "mcq", "mcq", "build", "build", "build", "build", "build", "build", "build", "build"],
  // Moyen — complete the sentence, one piece missing, every card.
  2: ["gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap"],
  // Difficile — the same frames with TWO pieces withdrawn (cloze.ts).
  3: ["gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap", "gap"],
  // Bonus — the entire sentence, from English alone.
  4: ["translate", "translate", "translate", "translate", "translate", "translate", "translate", "translate", "translate", "translate", "translate", "translate"],
};

export function isEntryLevel(n: unknown): n is EntryLevel {
  return n === 1 || n === 2 || n === 3 || n === 4;
}

/** The card sequence for one entry level. Always RAMP_LENGTH long. */
export function rampFor(level: EntryLevel): ExerciseKind[] {
  return [...RAMPS[level]];
}

export const ENTRY_LABELS: Record<EntryLevel, { stars: string; name: string; blurb: string }> = {
  1: { stars: "★", name: "Facile", blurb: "Sort the words into order — they are all given." },
  2: { stars: "★★", name: "Moyen", blurb: "Complete the sentence — one piece missing." },
  3: { stars: "★★★", name: "Difficile", blurb: "Complete the sentence — two pieces missing." },
  // 🎁, not ⭐ (Dan, 2026-09-07: "The bonus should a gift emoji"). The other
  // three count stars — one, two, three — so a fourth star said "four" and
  // read as one more rung of the same ladder. Bonus is not harder by a step,
  // it is a different exercise: whole sentences, translated. A gift says
  // "something else", which a fourth star cannot.
  4: { stars: "🎁", name: "Bonus", blurb: "Translate whole sentences into French." },
};
