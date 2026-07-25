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
  // Jovan Tan signed in with two accounts (Auth reconciliation, 2026-07-25):
  // jovantanyk (22 Jun, abandoned) folds into jovantan630 (active).
  "jovantanyk@gmail.com": "jovantan630@gmail.com",
  // Dan's own sign-ins (2026-07-16: "they are all me") — one teacher row.
  "monsieur.chan@gmail.com": "dan@chank.wang",
  "kwangguan@gmail.com": "dan@chank.wang",
  "daniel.chan@nus.edu.sg": "dan@chank.wang",
  "drneilchan@gmail.com": "dan@chank.wang",
  "kaygeedan@gmail.com": "dan@chank.wang",
};

/** Rosters/boards hide these entirely (Dan, 2026-07-16: "need not be
 *  monitored") — prior-term leaderboard leftovers and one-off test accounts.
 *  Display-time only; their docs stay untouched. */
export const HIDDEN_ROSTER_NAMES = new Set([
  "Étudiant Type Sample Student",
  "Chee How Chua",
  "Kavita Devi",
]);
// a529sUZM (QiZhi) UN-hidden 2026-07-25: identified as tracypang0728 —
// a real ST2FR26 student, not a test account (Auth-console reconciliation).
export const HIDDEN_ROSTER_UID_PREFIXES: string[] = [];

/** alias board display-name → canonical board display-name. Covers rows
 *  already written before the email anchoring below existed. */
export const ALIAS_BOARD_NAMES: Record<string, string> = {
  "su yeoniiOO315": "Su Yeon",
};

/** EMAIL-anchored board identity (Dan, 2026-07-16: "i also gave u the two
 *  email addresses"): when one of these emails signs in, its leaderboard row
 *  publishes under the canonical display name — so the board merge no longer
 *  depends on what she renames her Google accounts to. The row itself still
 *  carries no email (any student can read the board). */
export const ALIAS_PUBLISH_NAMES: Record<string, string> = {
  "chosuyeon33@gmail.com": "Su Yeon",
  "sjc031103@gmail.com": "Su Yeon",
};

export function canonicalEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.toLowerCase();
  return ALIAS_EMAILS[e] ?? e;
}

/** Prior-term leaderboard docs (Dan, 2026-07-07) — hidden from the public
 *  board AND the teacher roster. Firestore rules can't retroactively hide
 *  existing docs from a collection read, so both surfaces filter here.
 *  (Their XP still carries over if they ever sign in — display-only.) */
// ZKvLZ (chosuyeon33/Su Yeon) and 6uyQO9 (jovantanyk/Jovan) REMOVED
// 2026-07-25: they are CURRENT students' second accounts, wrongly filed as
// prior-term leftovers — exclusion nuked the whole alias-merged person from
// the roster (Dan: "why is su yeon missing altogether"). Aliasing owns them.
export const EXCLUDED_BOARD_UIDS = new Set([
  "6pHSergetUdBoTicHe930dztnq03",
  "8FXea0gBTQWry0mz9V0hGQpcHcn1",
  "A0gPWad5dbhrEj7xPl1ZvxELlsD2",
  "A7BPzNnI3MWlSIXqSkdKpwGALFB2",
  "F72Cp1q1wPWzNFBhnSaJuvGNvJi2",
  "K2oqGupnUJhJXr9l54eJxUG7gHx2",
  "MCa37VnnyBUfBV13JMw6jMub79S2",
  "S7uVFj2wtDYy5k97UJiRlDAxHaH2",
  "SB1hAmMEcrZGhNByqqY2leKVnho2",
  "TW4D8HEgNHONelHbtlAY83KR7EG2",
  "UCzhJxIRauVYfiA7s7KVm1f9EuH2",
  "Ucxgyw7PRNhIYQlZBYq5hCMlWVq1",
  "UhUSSLlSRqRjmmjuHw6UJNuKru93",
  "VURCmcsjTaXvMjbHjf1DCeumqWm2",
  "Xtn5klg5SVa4eUtI09pWxFcJFZi2",
  "Y8VWbC1DgYOCsJvSTwc2yTjHO982",
  "aPngs8CtKZhwqjNTDjELv0BJNYK2",
  "ao8eQgHtKXU23d5CRZ6qvkZTKuH3",
  "dENNssIfItW6a9mhxCNYN7O3WbA3",
  "f8QFvdmv33VQlkaIzVSlAKUl1vp1",
  "fmbfRMU475U4bNAmroFIAChjRRC3",
  "hFDtdL7VbUOVH6LQojinNNEddxA3",
  "lf98Dn7AniMtDDW2QYZjB9zqGBX2",
  "lzRqpbYzAfWOHv2BGuNwaRFjJK23",
  "nObXWQxQCGO6TNugnrgC5xsAQhx1",
  "nnO1UHbvTrdAXcLdff6f6egfr5L2",
  "oJRObzsgLOQw9BfFGRmqJAWwBOy1",
  "qvrNbMnULycr5sczxjNGqiAxWPj2",
  "rYwNEok19RN7eDafWhA0dxgszN42",
  "reJvyqud8JhuhtVC8Qfvj5Ow9uu2",
  "urmvD4pzesNDvLtCggdi3212I5b2",
  "wvEs5cMH9cOcPLpyWlYFNdGapAg1",
]);
