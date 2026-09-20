/**
 * Clear a learner's data so the account starts fresh (Dan, 19 Aug 2026).
 *
 * For each email given on the command line:
 *   1. resolve the Firebase Auth user (email → uid)
 *   2. recursively delete users/{uid}        (progress, responses, everything under it)
 *   3. delete leaderboard/{uid}
 *   4. delete every events doc where uid == that uid
 * The Auth ACCOUNT itself is kept (they can sign straight back in) unless
 * you pass --delete-account too.
 *
 * Run from the repo root on a machine that has the service-account key:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json \
 *     node scripts/clear-learner-data.mjs dan@chank.wang monsieur.chan@gmail.com daniel.chan@nus.edu.sg
 *
 * Add --dry-run first to see what WOULD be deleted without touching anything.
 *
 * NOTE the browser side: progress also lives in localStorage on each device
 * (and would re-sync back up on next sign-in). After running this, on each
 * device/browser used by these accounts: sign out, then clear the site's
 * data (Safari: Settings → Privacy → Manage Website Data → fluolingo;
 * Chrome: lock icon → Site settings → Delete data) BEFORE signing in again.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) { console.error("Set GOOGLE_APPLICATION_CREDENTIALS"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const db = getFirestore();
const auth = getAuth();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const deleteAccount = args.includes("--delete-account");
const emails = args.filter((a) => a.includes("@"));
if (emails.length === 0) { console.error("Give at least one email."); process.exit(1); }

for (const email of emails) {
  let user;
  try { user = await auth.getUserByEmail(email); }
  catch { console.log(`✗ ${email}: no Auth user — nothing to clear server-side`); continue; }
  const uid = user.uid;
  console.log(`\n${email} → uid ${uid}${dryRun ? "  (dry run)" : ""}`);

  // users/{uid} recursively
  const userDoc = db.doc(`users/${uid}`);
  if (dryRun) {
    let n = 0;
    for (const col of await userDoc.listCollections()) n += (await col.count().get()).data().count;
    console.log(`  would delete users/${uid} (+ ${n} docs in subcollections)`);
  } else {
    await db.recursiveDelete(userDoc);
    console.log(`  ✓ users/${uid} deleted recursively`);
  }

  // leaderboard/{uid}
  const lb = db.doc(`leaderboard/${uid}`);
  if ((await lb.get()).exists) {
    if (!dryRun) await lb.delete();
    console.log(`  ${dryRun ? "would delete" : "✓ deleted"} leaderboard/${uid}`);
  }

  // events where uid == uid (batched)
  let total = 0;
  for (;;) {
    const snap = await db.collection("events").where("uid", "==", uid).limit(400).get();
    if (snap.empty) break;
    total += snap.size;
    if (dryRun) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  if (total) console.log(`  ${dryRun ? `would delete ≥${total}` : `✓ deleted ${total}`} events docs`);

  if (deleteAccount && !dryRun) {
    await auth.deleteUser(uid);
    console.log(`  ✓ Auth account deleted`);
  }
}
console.log(dryRun ? "\nDry run only — nothing was changed." : "\nDone.");
