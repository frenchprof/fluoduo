// Pushes scripts/roster-private.json to Firestore admin/rosterPrivate.
//
//   GOOGLE_APPLICATION_CREDENTIALS=~/Downloads/serviceAccountKey.json \
//     node scripts/seed-roster-private.mjs
//
// WHY THIS EXISTS (2026-08-10). The roster maps (student emails, name
// overrides, uid->email seeds) used to be compiled into the /teacher page —
// a statically exported page on a public CDN with no auth in front of it, so
// anyone with the chunk URL could download the class's email addresses. The
// teacher dashboard now reads them from admin/rosterPrivate at runtime,
// behind the same isAdmin() Firestore rules as every other collection it
// uses. This script is the only writer; run it once after deploying the
// rules, and again whenever roster-private.json changes.
//
// verify/verify18b.py proves the build output stayed clean of everything in
// roster-private.json — it runs in CI on every push.
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) { console.error("Set GOOGLE_APPLICATION_CREDENTIALS"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const db = getFirestore();

const src = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "roster-private.json"), "utf8"));

// Only the three maps go up — `notes` is repo documentation, not app data.
const stringMap = (name) => {
  const m = src[name];
  if (!m || typeof m !== "object" || Array.isArray(m)) throw new Error(`${name} must be an object`);
  for (const [k, v] of Object.entries(m)) {
    if (typeof v !== "string" || !k) throw new Error(`${name}.${k} must map to a string`);
  }
  return m;
};
const doc = {
  aliasEmails: stringMap("aliasEmails"),
  rosterNames: stringMap("rosterNames"),
  knownEmails: stringMap("knownEmails"),
  updatedAt: Date.now(),
};

await db.doc("admin/rosterPrivate").set(doc);
const back = (await db.doc("admin/rosterPrivate").get()).data();
console.log("admin/rosterPrivate written:");
console.log(`  aliasEmails ${Object.keys(back.aliasEmails).length}`);
console.log(`  rosterNames ${Object.keys(back.rosterNames).length}`);
console.log(`  knownEmails ${Object.keys(back.knownEmails).length}`);
