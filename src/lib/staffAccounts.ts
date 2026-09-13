/**
 * Dan's own sign-ins — ONE list, for every surface that must not treat the
 * teacher as a learner (Dan, 2026-09-13: "i need to hide both legacy roles and
 * my own test accountrs ... like the one i tested with today").
 *
 * These six addresses already existed in three places that were each other's
 * mirror by hand — `ADMIN_EMAILS` in src/app/teacher/data.ts, `isAdmin()` in
 * firestore.rules, and (imported from the teacher module) the VoixLà engine
 * A/B panel. A list kept in step by a comment drifts, and the way it drifts
 * here is silent: an address the rules do not know about publishes a
 * leaderboard row like any student's, and nothing in the app says so.
 *
 * WHY THIS FILE IS IN src/lib AND NOT WITH THE TEACHER DATA. accountAliases.ts
 * carries a standing rule — keep learner-identifying data out of any module a
 * learner's browser loads. These are the TEACHER'S own addresses, not a
 * learner's, and they already shipped in the learner bundle: VoixLaPanel.tsx
 * (the 🛠️ Outils tray, on most exercise screens) imports ADMIN_EMAILS from
 * the teacher module today. Moving them here changes no learner's download; it
 * stops a lib-level module having to reach into src/app/teacher to ask who the
 * teacher is.
 *
 * firestore.rules keeps its own copy — rules cannot import — and
 * verify600-staff-off-board.py fails if the two lists ever disagree.
 */

export const STAFF_EMAILS = [
  "drneilchan@gmail.com",
  "monsieur.chan@gmail.com",
  "dan@chank.wang",
  "kaygeedan@gmail.com",
  "daniel.chan@nus.edu.sg",
  "kwangguan@gmail.com",
];

/**
 * Dan's ALTER-EGO test identities (Dan, 2026-09-13: "these two are my alter
 * ego test identites pls gelp yo delete them") — accounts he plays a learner
 * with. They are NOT admins: they get no teacher page, no engine A/B panel and
 * no read of anyone else's data. The only thing they share with the six above
 * is that they never belong on the student board.
 *
 * The addresses came pasted out of a table row with the display name run into
 * the address and no space between them, so the second local part below is the
 * reading the domain supports and may be off by a letter. That is survivable,
 * because the address is the belt and NOT the braces: the
 * leaderboard writer also refuses any row whose display NAME is one the roster
 * hides (accountAliases.isHiddenRosterName), and both names are known exactly.
 */
export const TEST_ACCOUNT_EMAILS = [
  "docteur.daniel.chan@gmail.com",
  "u12@i12.work",
];

/** Is this the teacher (or one of his test sign-ins)? Case-folded: Google
 *  hands back the address as the user typed it, and « Dan@ » is the same
 *  account as « dan@ ». */
export function isStaffAccount(email: string | null | undefined): boolean {
  return matches(STAFF_EMAILS, email);
}

/** Is this an account that must never publish a leaderboard row — the teacher
 *  or one of his alter-ego test learners? */
export function isOffBoardAccount(email: string | null | undefined): boolean {
  return matches(STAFF_EMAILS, email) || matches(TEST_ACCOUNT_EMAILS, email);
}

function matches(list: string[], email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return list.some((s) => s.toLowerCase() === e);
}
