/* THE INTERACTION NEITHER BRANCH COULD TEST.
 *
 * #335 (Favourites) and #331 (rules hardening) both edit firestore.rules and
 * git merges them without a conflict. That proves the TEXT does not overlap.
 * It proves nothing about the rules, because Firestore ORs its matches: a
 * shaped `favourites` rule sitting beside a permissive `users/{uid}/{sub=**}`
 * is decorative — the wildcard allows what the shaped rule refuses.
 *
 * So this asserts the shaped rule actually BITES on the merged file, and —
 * the half that matters more — that a legitimate list still writes. A rule
 * that denies everything passes every attack test.
 */
import { initializeTestEnvironment, assertFails, assertSucceeds }
  from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import fs from "node:fs";
import { clearWithRetry } from "./clear.mjs";

const RULES = process.argv[2];
const LABEL = process.argv[3] || "favourites";
const env = await initializeTestEnvironment({
  projectId: "demo-fluo-rules",
  firestore: { host: "127.0.0.1", port: 8181, rules: fs.readFileSync(RULES, "utf8") },
});
await clearWithRetry(env);

const me = env.authenticatedContext("owner1", { email: "o1@x.com", email_verified: true }).firestore();
const other = env.authenticatedContext("owner2", { email: "o2@x.com", email_verified: true }).firestore();
const ref = (db, uid = "owner1") => doc(db, `users/${uid}/favourites/list`);

const rows = [];
const check = async (want, name, fn) => {
  try {
    await (want === "allow" ? assertSucceeds(fn()) : assertFails(fn()));
    rows.push(["PASS", want, name]);
  } catch (e) {
    rows.push(["FAIL", want, name, String(e).slice(0, 120)]);
  }
};

const good = { v: 1, items: [{ href: "/map", label: "Map" }], folders: [], updatedAt: 1 };

// The legitimate path FIRST — if this breaks, the hardening broke a learner.
await check("allow", "owner writes a normal favourites list",
  () => setDoc(ref(me), good));

// The shaped rule must bite. Each of these is refused ONLY because
// 'favourites' is excluded from the {sub=**} wildcard.
await check("deny", "201 items exceeds the 200 cap",
  () => setDoc(ref(me), { ...good, items: Array.from({ length: 201 }, () => ({ href: "/x" })) }));
await check("deny", "21 folders exceeds the 20 cap",
  () => setDoc(ref(me), { ...good, folders: Array.from({ length: 21 }, () => ({ name: "f" })) }));
await check("deny", "an unknown top-level key",
  () => setDoc(ref(me), { ...good, evil: true }));
await check("deny", "items is not a list",
  () => setDoc(ref(me), { ...good, items: "not-a-list" }));
await check("deny", "another learner writes MY favourites",
  () => setDoc(ref(other, "owner1"), good));

// And a deeper path under favourites must not slip through the wildcard
// either — sub[0] is still 'favourites' there.
await check("deny", "a nested doc under favourites dodges the cap",
  () => setDoc(doc(me, "users/owner1/favourites/list/sneaky/doc"), { anything: "x".repeat(10) }));

console.log(`\n  ${LABEL}`);
console.log("  " + "-".repeat(60));
for (const [res, want, name, err] of rows) {
  console.log(`  ${res}  want ${want.padEnd(5)} ${name}${err ? "\n        " + err : ""}`);
}
const failed = rows.filter((r) => r[0] === "FAIL").length;
console.log(`\n  ${rows.length - failed}/${rows.length} passed\n`);
await env.cleanup();
process.exit(failed ? 1 : 0);
