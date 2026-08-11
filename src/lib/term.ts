/**
 * The cohort/term marker (Dan, 2026-08-11: "cohort reset — a filter, not a
 * deletion"). Every current-facing view (leaderboard, teacher roster,
 * dashboards) defaults to the CURRENT term; prior students' data stays in
 * Firestore untouched for the research programme (work/active-cohort.mjs).
 *
 * How an account gets its term:
 *   · a brand-new account (no users/{uid}/app/progress doc on first
 *     sign-in) is stamped CURRENT_TERM;
 *   · an account whose progress doc predates the marker (no `term` field),
 *     or that has a leaderboard row but no progress doc, is stamped
 *     LEGACY_TERM — "existed before the 2026-08-11 reset". The label is
 *     deliberately not "ST2FR26": some traces predate that term, and the
 *     research pipeline segments precisely by uid, not by this field.
 * The stamp is written once and then travels with the progress blob, so a
 * legacy student signing in after the reset stays legacy.
 *
 * Renaming CURRENT_TERM is a one-line change ONLY until the first new
 * account signs in — after that it is data.
 */

export const CURRENT_TERM = "AY2627S1";
export const LEGACY_TERM = "legacy";

/** The reset moment. An account first seen (events) after this instant with
 *  no legacy trace belongs to the current cohort — the teacher roster uses
 *  this so brand-new sign-ups appear even before their first board row. */
export const TERM_START_MS = Date.UTC(2026, 7, 11); // 11 Aug 2026

export function isCurrentTerm(term: string | null | undefined): boolean {
  return term === CURRENT_TERM;
}
