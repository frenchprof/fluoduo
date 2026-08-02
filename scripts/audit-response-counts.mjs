// One-off: count users/*/responses docs grouped by activityId, with the most
// recent timestamp per group. Cross-checks the static completion-write audit
// against what's actually landing in Firestore. Not wired into package.json
// scripts — run directly: GOOGLE_APPLICATION_CREDENTIALS=<key.json> node scripts/audit-response-counts.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON path.");
  process.exit(1);
}
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const snap = await db.collectionGroup("responses").get();

const groups = new Map(); // activityId -> { count, latest: ms }
for (const doc of snap.docs) {
  const data = doc.data();
  const activityId = data.activityId ?? "(missing activityId)";
  const ts = data.timestamp?.toMillis?.() ?? null;
  const g = groups.get(activityId) ?? { count: 0, latest: null };
  g.count += 1;
  if (ts !== null && (g.latest === null || ts > g.latest)) g.latest = ts;
  groups.set(activityId, g);
}

const rows = [...groups.entries()].sort((a, b) => b[1].count - a[1].count);
console.log(`Total response docs: ${snap.size}\n`);
console.log("activityId".padEnd(40), "count".padStart(8), "  most recent");
for (const [activityId, g] of rows) {
  const latest = g.latest ? new Date(g.latest).toISOString() : "(no timestamp)";
  console.log(activityId.padEnd(40), String(g.count).padStart(8), " ", latest);
}
