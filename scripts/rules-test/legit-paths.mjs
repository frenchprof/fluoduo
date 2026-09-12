/* THE LEGITIMATE PATHS — the half that catches the expensive mistake.
 *
 * A rule that denies everything passes every attack test. This repo has twice
 * shipped a rule that quietly denied real learners and nobody noticed, because
 * both writes are wrapped in a client-side catch:
 *
 *   · `xp <= 100` on responses/ rejected EVERY correct answer from a learner
 *     on a 7-day streak (the x2 tier pays 120), keeping their errors and
 *     discarding their successes.
 *   · the leaderboard create allowlist had to gain `weekXp`/`weekKey` before a
 *     brand-new learner could join the board at all — the client's catch then
 *     DELETED the row it had just failed to write.
 *
 * So every hardening change is checked against the three awkward shapes that
 * actually exist in this database: a brand-new learner, a legacy laf1201 row
 * with no `xp` and no `term`, and a cohort reset where XP legitimately falls.
 *
 * Run through scripts/rules-test/run.mjs, which supplies the emulator.
 */
import { initializeTestEnvironment, assertFails, assertSucceeds }
  from "@firebase/rules-unit-testing";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import fs from "node:fs";
import { clearWithRetry } from "./clear.mjs";
const RULES = process.argv[2], LABEL = process.argv[3];
const env = await initializeTestEnvironment({ projectId: "demo-fluo-rules",
  firestore: { host: "127.0.0.1", port: 8181, rules: fs.readFileSync(RULES, "utf8") } });

/* CLEAR THE DATABASE FIRST — and this line is here because its absence
 * produced a FALSE PASS, in this very file, on 2026-09-12.
 *
 * The emulator keeps data for its whole lifetime, across runs. So the second
 * run of "a BRAND-NEW learner creates their first board row" found the row the
 * FIRST run had left behind, and Firestore evaluated `allow update` instead of
 * `allow create` — the one rule the test exists to exercise. It reported PASS
 * against a rules file that in fact DENIES that create (the leaderboard key
 * allowlist without weekXp/weekKey). Verified after adding this line: the same
 * file now correctly reports DENIED.
 *
 * A create test that silently becomes an update test is exactly the false
 * green this suite was written to prevent, so: clear, and use a uid nothing
 * else has used. */
await clearWithRetry(env);
const FRESH = (p) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

const results = [];
const check = async (name, expect, fn) => {
  let ok;
  try { await (expect === "deny" ? assertFails(fn()) : assertSucceeds(fn())); ok = true; }
  catch { ok = false; }
  results.push({ name, expect, ok });
};

// The EXACT payload publishLeaderboard() sends (progressSync.ts).
const payload = (xp) => ({ name: "New Learner", xp, level: 3, gems: 10, streak: 2,
  weekXp: 50, weekKey: "2026-W37", term: "T2", updatedAt: Date.now() });

const NEWBIE = FRESH("newbie");
const fresh = env.authenticatedContext(NEWBIE, { email: `${NEWBIE}@x.com`, email_verified: true }).firestore();
await check("BRAND-NEW learner creates their first board row", "allow", () =>
  setDoc(doc(fresh, `leaderboard/${NEWBIE}`), payload(120), { merge: true }));

// A legacy laf1201 row: no `xp`, no `term` — only totalXP.
await env.withSecurityRulesDisabled(async (c) =>
  setDoc(doc(c.firestore(), "leaderboard/legacy"), { name: "Old", totalXP: 4321 }));
const legacy = env.authenticatedContext("legacy", { email: "old@x.com", email_verified: true }).firestore();
await check("LEGACY row (no xp, no term) still updatable", "allow", () =>
  setDoc(doc(legacy, "leaderboard/legacy"), payload(600), { merge: true }));

// Cohort reset: term changes, xp legitimately drops.
await env.withSecurityRulesDisabled(async (c) =>
  setDoc(doc(c.firestore(), "leaderboard/reset"), { name: "R", xp: 9000, level: 9, gems: 0, streak: 0, term: "T1" }));
const reset = env.authenticatedContext("reset", { email: "r@x.com", email_verified: true }).firestore();
await check("COHORT RESET may lower xp when term changes", "allow", () =>
  setDoc(doc(reset, "leaderboard/reset"), payload(0), { merge: true }));

console.log(`\n  ${LABEL}`);
console.log("  " + "-".repeat(60));
for (const r of results)
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  want ${r.expect.padEnd(5)} ${r.name}`);
await env.cleanup();
process.exit(results.every((r) => r.ok) ? 0 : 1);
