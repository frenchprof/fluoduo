/**
 * WHERE A LEARNER ENTERS THE RAMP (Dan, 2026-08-27: "yes a learner may choose
 * to start at 3 stars").
 *
 * THE MISTAKE THIS MUST NOT REPEAT. A d12 used to open the lesson and its face
 * was a START INDEX: the pager did `queue.slice(entry)`, so a 1 walked all
 * twelve cards and a 12 left the lone translation. That is a run-LENGTH dial
 * wearing a difficulty costume, and because the ramp runs easy → hard it sold
 * the least work at the hard end — precisely backwards. It was removed on
 * 2026-08-25 ("drop the shortcuts, learning should not allow that"), and Dan's
 * reversal above is about ENTRY, not about shortening.
 *
 * So the rule here is absolute and checked: **every entry level is the same
 * number of cards.** Choosing ★★★ does not buy a shorter lesson, it buys a
 * harder one — the mix shifts, the length does not. A learner who wants a
 * shorter sitting uses the session-length chooser (lib/sessionLength.ts),
 * which is a separate, honest control.
 *
 *   ★    the whole ramp, recognition first — the default, and what a learner
 *        meeting the grammar for the first time should walk.
 *   ★★   no multiple choice at all: production from the first card.
 *   ★★★  mostly building and translating whole sentences from English.
 */

export type ExerciseKind = "mcq" | "gap" | "build" | "translate";

export type EntryLevel = 1 | 2 | 3;

export const ENTRY_LEVELS: readonly EntryLevel[] = [1, 2, 3];

/** How many cards a lesson run holds, at every level. See the note above. */
export const RAMP_LENGTH = 12;

const RAMPS: Record<EntryLevel, ExerciseKind[]> = {
  // 4 recognise · 4 produce in a frame · 3 assemble · 1 from English
  1: ["mcq", "mcq", "mcq", "mcq", "gap", "gap", "gap", "gap", "build", "build", "build", "translate"],
  // 5 produce in a frame · 5 assemble · 2 from English
  2: ["gap", "gap", "gap", "gap", "gap", "build", "build", "build", "build", "build", "translate", "translate"],
  // 2 produce in a frame · 5 assemble · 5 from English
  3: ["gap", "gap", "build", "build", "build", "build", "build", "translate", "translate", "translate", "translate", "translate"],
};

export function isEntryLevel(n: unknown): n is EntryLevel {
  return n === 1 || n === 2 || n === 3;
}

/** The card sequence for one entry level. Always RAMP_LENGTH long. */
export function rampFor(level: EntryLevel): ExerciseKind[] {
  return [...RAMPS[level]];
}

export const ENTRY_LABELS: Record<EntryLevel, { stars: string; name: string; blurb: string }> = {
  1: { stars: "★",   name: "Découverte",   blurb: "Recognise it first, then produce it." },
  2: { stars: "★★",  name: "Entraînement", blurb: "No multiple choice — produce from the start." },
  3: { stars: "★★★", name: "Maîtrise",     blurb: "Build and translate whole sentences." },
};
