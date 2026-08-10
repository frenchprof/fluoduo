/**
 * Student-identifying roster data — TEACHER SURFACES ONLY.
 *
 * WHY THIS FILE EXISTS (2026-08-10). These three maps used to live in
 * `accountAliases.ts`, which is also imported by `LeaderboardList.tsx` and
 * `firebase/progressSync.ts` — two modules on the learner's critical path. The
 * bundler put the whole module into a shared chunk, so a build check found a
 * student's email address inside a JavaScript file loaded by BOTH the home
 * page and the leaderboard. Every learner's browser downloaded the class's
 * email addresses on every visit.
 *
 * The values did not change. Only the module boundary did — and that is the
 * whole fix, because a bundler cannot pull a module into a chunk that never
 * imports it.
 *
 * RULE FOR THIS FILE: it may only ever be imported from `src/app/teacher/**`.
 * If you find yourself importing it anywhere else, the data you want is on the
 * `Learner` record that `buildRoster()` already returns from Firestore, behind
 * the rules that check `isAdmin()`.
 *
 * NOTE THIS IS NOT A SECURITY BOUNDARY. `/teacher` is still a statically
 * exported page on a public CDN and its own chunk still carries what is below.
 * The real fix is to stop serving the teacher dashboard as a static asset. See
 * the patch 18 README.
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

/** uid → display name, where the telemetry's own name is wrong or absent. */
export const ROSTER_NAMES: Record<string, string> = {
  "6uyQO9YgBTRLC5Dw1JuU7Fe2cTB3": "Jovan Tan", // old account, aliased to jovantan630
  "a529sUZMsYUgKdWn4rJXvPu4A6V2": "Tracy Pang", // tracypang0728, formerly shown as QiZhi Pang
};

/** Auth-console seeds (Dan, 2026-07-25): uid → email for accounts whose only
 *  sign-ins predate authEvents coverage (22 Jun) — without these the roster
 *  shows them email-blind (Tracy, wenyi) and email-keyed features miss them. */
export const KNOWN_EMAILS: Record<string, string> = {
  "a529sUZMsYUgKdWn4rJXvPu4A6V2": "tracypang0728@gmail.com", // Tracy Pang
  "C2sWIzLKdseHKUxgh67yPp3o7Rq1": "rr7280523@gmail.com", // wenyi zhang
  "8IcpkURn0ldOXLiApCdhdsqQoxW2": "sjc031103@gmail.com", // Su Yeon (primary)
  "ZKvLZyfOfLZFYAEUoTzApQMYClf2": "chosuyeon33@gmail.com", // Su Yeon (second)
  "6uyQO9YgBTRLC5Dw1JuU7Fe2cTB3": "jovantanyk@gmail.com", // Jovan (old)
  "k1sTtpYd4ZXCFKYQU4OiBA4dD4l1": "jovantan630@gmail.com", // Jovan (active)
  "1S70OPFAAVPEsu6vOr8JZdk2U022": "e1523337@u.nus.edu", // Kai Xin Chen
  "yzb1vTPlhIbxgqwTy21wVUYRudr1": "youth.romanticomedy@gmail.com", // Parker Jack
};

export function canonicalEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.toLowerCase();
  return ALIAS_EMAILS[e] ?? e;
}
