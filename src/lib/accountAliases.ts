/**
 * One student, several Google accounts (Dan, 2026-07-16: "are the same
 * person, please make all XPs from them appear as 1 person"). Display-time
 * merges only — the underlying Firestore stores stay per-uid, so nothing is
 * lost if an alias is ever removed.
 *
 * Two keys because the surfaces know different things: the teacher data has
 * emails (stamped into every event); the public leaderboard rows carry only
 * display names.
 */

/** alias email → canonical email (all lowercase). */
export const ALIAS_EMAILS: Record<string, string> = {
  "chosuyeon33@gmail.com": "sjc031103@gmail.com",
};

/** alias board display-name → canonical board display-name. */
export const ALIAS_BOARD_NAMES: Record<string, string> = {
  "su yeoniiOO315": "Su Yeon",
};

export function canonicalEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.toLowerCase();
  return ALIAS_EMAILS[e] ?? e;
}
