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

/**
 * NOTE (2026-08-10): ALIAS_EMAILS, ROSTER_NAMES, KNOWN_EMAILS and
 * canonicalEmail() left this file for `src/lib/rosterPrivate.ts`.
 *
 * They are teacher data, but this module is imported by LeaderboardList.tsx
 * and progressSync.ts, so the bundler folded it into a chunk that index.html
 * and leaderboard.html both load — putting students' email addresses in every
 * learner's browser on every visit. Nothing about the values was wrong; the
 * module boundary was.
 *
 * Keep this file free of anything that identifies a learner. What is left is
 * display names already shown on the public board, and opaque uids.
 */

/** Rosters/boards hide these entirely (Dan, 2026-07-16: "need not be
 *  monitored") — prior-term leaderboard leftovers and one-off test accounts.
 *  Display-time only; their docs stay untouched. */
export const HIDDEN_ROSTER_NAMES = new Set([
  "Étudiant Type Sample Student",
  "Chee How Chua",
  "Kavita Devi",
  // Retired 2026-07-28 (Dan: "we can retire Cagey Chan and Georgina from the
  // learner analytics") — one of Dan's own sign-ins, not a learner.
  "Cagey Chan",
]);

/** Retired accounts known by first name only — matched case-insensitively on
 *  the whole name or its first word, since the display name may carry a
 *  surname we have never seen. */
export const HIDDEN_ROSTER_NAME_PREFIXES = ["georgina"];

/** Does this display name belong to an account retired from the roster? */
export function isHiddenRosterName(name: string | null | undefined): boolean {
  if (!name) return false;
  if (HIDDEN_ROSTER_NAMES.has(name)) return true;
  const n = name.trim().toLowerCase();
  return HIDDEN_ROSTER_NAME_PREFIXES.some((p) => n === p || n.startsWith(`${p} `));
}

// a529sUZM (QiZhi/Tracy) UN-hidden 2026-07-25: identified as tracypang0728 —
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
/** uid → the one name an aliased learner publishes under.
 *
 *  Keyed by UID since 2026-08-10. It used to be keyed by email address, which
 *  meant every learner's browser downloaded both of Su Yeon's addresses in
 *  order to look up their own. A uid is opaque, and it is a stabler key than
 *  an email anyway — which was the original reason for not using displayName. */
export const ALIAS_PUBLISH_UIDS: Record<string, string> = {
  "8IcpkURn0ldOXLiApCdhdsqQoxW2": "Su Yeon", // primary
  "ZKvLZyfOfLZFYAEUoTzApQMYClf2": "Su Yeon", // second account
};

/** The canonical names above, for the board's same-name fold. */
export const ALIAS_CANON_NAMES: string[] = Array.from(new Set(Object.values(ALIAS_PUBLISH_UIDS)));

/** THE name a learner is on the board as — one function for the writer
 *  (progressSync publishes it) and the reader (LeaderboardList marks "you"
 *  by it). Alias first, then the Google display name, then a neutral word.
 *  NEVER an email or its local part: the writer used to fall back to
 *  `email.split("@")[0]`, so a learner with no display name was published
 *  under half their address, and the roster/board disagreed about who they
 *  were (the leaderboard identity mismatch, closed 2026-08-17). */
export function boardName(uid: string, displayName: string | null | undefined): string {
  return ALIAS_PUBLISH_UIDS[uid] || (displayName ?? "").trim() || "Anonymous";
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
