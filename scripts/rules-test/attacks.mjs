/* THE ATTACKS. Each case is a document a signed-in student could actually
 * send, written as the attacker would send it. Three of these were ACCEPTED by
 * the rules as they stood on 2026-09-12; the comment on each says which.
 *
 * Run through scripts/rules-test/run.mjs, which supplies the emulator.
 */
import { initializeTestEnvironment, assertFails, assertSucceeds }
  from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import fs from "node:fs";
import { clearWithRetry } from "./clear.mjs";

const RULES = process.argv[2];
const LABEL = process.argv[3];

const env = await initializeTestEnvironment({
  projectId: "demo-fluo-rules",
  firestore: { host: "127.0.0.1", port: 8181, rules: fs.readFileSync(RULES, "utf8") },
});

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

const student  = env.authenticatedContext("student1", { email: "s1@x.com", email_verified: true }).firestore();
const attacker = env.authenticatedContext("attacker", { email: "bad@x.com", email_verified: true }).firestore();

const results = [];
const check = async (name, expect, fn) => {
  let ok;
  try { await (expect === "deny" ? assertFails(fn()) : assertSucceeds(fn())); ok = true; }
  catch { ok = false; }
  results.push({ name, expect, ok });
};

// seed state that rules read, with rules disabled
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "leaderboard/student1"), { name: "S", xp: 5000, level: 3, gems: 0, streak: 1, term: "T1" });
  await setDoc(doc(db, "collections/deck-no-vis"), { owner: "student1", title: "T", items: [{ a: 1 }] }); // NO visibility
  await setDoc(doc(db, "oralST2_2026_invites/victim@x.com"), { by: "student1", byName: "S", size: 2, ts: new Date() });
});

// 1 · MAIL: can a student email an address they have no invite for?
await check("mail to an arbitrary address", "deny", () =>
  addDoc(collection(attacker, "mail"), { to: ["victim@anywhere.com"], message: { subject: "hi", text: "x" } }));

/* 2 · MAIL: the letterbox is CLOSED, so even the nudge it was built for is
 * refused. This case USED TO EXPECT "allow" — the 12 Sep rule let a leader
 * mail an address they themselves had invited — and Dan retired the whole
 * feature the same day: *"i am never going to be using this to do oral exam
 * ever again"*. With no legitimate sender left, the rule denies everything
 * rather than trying to tell a good letter from a bad one, because the
 * Trigger Email extension sends whatever lands here from the school's own
 * account.
 *
 * KEPT RATHER THAN DELETED, with its expectation flipped: a suite that simply
 * dropped the case would go green again if someone re-opened /mail. */
await check("mail to own invitee — the box is closed", "deny", () =>
  addDoc(collection(student, "mail"), { to: ["victim@x.com"], message: { subject: "hi", text: "x" } }));

// 3 · INVITES: squatting a classmate's address with no booking of your own
await check("squat an invite with no booking", "deny", () =>
  setDoc(doc(attacker, "oralST2_2026_invites/classmate@x.com"),
         { by: "attacker", byName: "Dr Chan", size: 2, ts: serverTimestamp() }));

// 4 · LEADERBOARD: push XP downward
await check("lower own leaderboard XP", "deny", () =>
  setDoc(doc(student, "leaderboard/student1"),
         { name: "S", xp: 10, level: 3, gems: 0, streak: 1, term: "T1" }, { merge: true }));

// 5 · LEADERBOARD: raise it (must still work)
await check("raise own leaderboard XP", "allow", () =>
  setDoc(doc(student, "leaderboard/student1"),
         { name: "S", xp: 9000, level: 3, gems: 0, streak: 1, term: "T1" }, { merge: true }));

// 6 · COLLECTIONS: owner reads their own deck that has no `visibility`
await check("owner reads deck lacking visibility", "allow", () =>
  getDoc(doc(student, "collections/deck-no-vis")));

console.log(`\n  ${LABEL}`);
console.log("  " + "-".repeat(64));
for (const r of results)
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  want ${r.expect.padEnd(5)} ${r.name}`);
await env.cleanup();
process.exit(results.every((r) => r.ok) ? 0 : 1);
