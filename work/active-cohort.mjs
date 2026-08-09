// READ-ONLY. Establishes the Track E denominator: the active current cohort.
//
//   GOOGLE_APPLICATION_CREDENTIALS=~/Downloads/serviceAccountKey.json \
//     node work/active-cohort.mjs
//
// WHY THIS EXISTS
//   Dan, 2026-08-10: "The ~75 figure isn't a clean population — it mixes two
//   separate special-term cohorts from different times with different
//   students, plus test accounts. Use percent of active current users as the
//   denominator."
//
//   Every prior figure quoted in this programme (~75, 19, 16, 14) came from a
//   different filter applied at a different surface. This script applies ONE
//   pipeline and shows what each stage removes, so the denominator is
//   auditable rather than asserted.
//
// THE PIPELINE, in order. Each stage prints who it drops and why.
//   1. every uid with any trace (leaderboard row, progress doc, or response)
//   2. − ADMIN_EMAILS ........... the teacher's own accounts
//   3. − EXCLUDED_BOARD_UIDS .... prior special-term leftovers (32 uids)
//   4. − HIDDEN_ROSTER_NAMES .... test/sample accounts and retired sign-ins
//   5. − alias merge ............ two Google accounts, one person
//   6. = enrolled current cohort
//   7. ∩ activity window ........ the ACTIVE denominator, at three windows
//
// ON "ACTIVE": three windows are reported rather than one, because the right
// choice depends on the measure. A usability study wants "signed in at all
// this term"; a behavioural trend wants a recent window. Pick one, write it
// into the ledger, and use it everywhere — the failure mode this script
// exists to prevent is each analysis quietly choosing its own.

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

const key = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!key) { console.error("Set GOOGLE_APPLICATION_CREDENTIALS"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(key, "utf8"))) });
const db = getFirestore();

// ── the exclusion lists, kept in step with src/lib/accountAliases.ts ────────
// If these drift from the app, the denominator drifts from what the dashboard
// shows. Re-copy on any change there.
const ADMIN_EMAILS = new Set([
  "drneilchan@gmail.com", "monsieur.chan@gmail.com", "dan@chank.wang",
  "kaygeedan@gmail.com", "daniel.chan@nus.edu.sg", "kwangguan@gmail.com",
]);
const ALIAS_EMAILS = {
  "chosuyeon33@gmail.com": "sjc031103@gmail.com",
  "jovantanyk@gmail.com": "jovantan630@gmail.com",
  "monsieur.chan@gmail.com": "dan@chank.wang",
  "kwangguan@gmail.com": "dan@chank.wang",
  "daniel.chan@nus.edu.sg": "dan@chank.wang",
  "drneilchan@gmail.com": "dan@chank.wang",
  "kaygeedan@gmail.com": "dan@chank.wang",
};
const HIDDEN_NAMES = new Set([
  "Étudiant Type Sample Student", "Chee How Chua", "Kavita Devi", "Cagey Chan",
]);
const HIDDEN_PREFIXES = ["georgina"];
const EXCLUDED_BOARD_UIDS = new Set([
  "6pHSergetUdBoTicHe930dztnq03","8FXea0gBTQWry0mz9V0hGQpcHcn1","A0gPWad5dbhrEj7xPl1ZvxELlsD2",
  "A7BPzNnI3MWlSIXqSkdKpwGALFB2","F72Cp1q1wPWzNFBhnSaJuvGNvJi2","K2oqGupnUJhJXr9l54eJxUG7gHx2",
  "MCa37VnnyBUfBV13JMw6jMub79S2","S7uVFj2wtDYy5k97UJiRlDAxHaH2","SB1hAmMEcrZGhNByqqY2leKVnho2",
  "TW4D8HEgNHONelHbtlAY83KR7EG2","UCzhJxIRauVYfiA7s7KVm1f9EuH2","Ucxgyw7PRNhIYQlZBYq5hCMlWVq1",
]);
// NOTE: src/lib/accountAliases.ts lists 32 uids here. Only the ones needed to
// reproduce the roster are inlined above; the script re-reads the full set
// from the repo if it can find it, so the two cannot silently disagree.
try {
  const src = readFileSync(new URL("../src/lib/accountAliases.ts", import.meta.url), "utf8");
  const block = /EXCLUDED_BOARD_UIDS = new Set\(\[([\s\S]*?)\]\)/.exec(src);
  if (block) {
    let n = 0;
    for (const m of block[1].matchAll(/"([A-Za-z0-9]{20,})"/g)) { EXCLUDED_BOARD_UIDS.add(m[1]); n++; }
    console.log(`(read ${n} excluded uids from accountAliases.ts)`);
  }
} catch { console.log("(accountAliases.ts not readable here — using the inlined subset)"); }

const isHiddenName = (n) => {
  if (!n) return false;
  if (HIDDEN_NAMES.has(n)) return true;
  const s = n.trim().toLowerCase();
  return HIDDEN_PREFIXES.some((p) => s === p || s.startsWith(`${p} `));
};
const canonical = (e) => (e ? (ALIAS_EMAILS[e.toLowerCase()] ?? e.toLowerCase()) : null);

// ── gather ─────────────────────────────────────────────────────────────────
const people = new Map(); // uid -> { name, email, responses, lastTs }

for (const d of (await db.collection("leaderboard").get()).docs) {
  const x = d.data();
  people.set(d.id, { name: x.name ?? null, email: null, responses: 0, lastTs: 0 });
}
for (const doc of (await db.collectionGroup("responses").get()).docs) {
  const seg = doc.ref.path.split("/");
  if (seg[0] !== "users") continue;
  const uid = seg[1];
  const p = people.get(uid) ?? { name: null, email: null, responses: 0, lastTs: 0 };
  p.responses += 1;
  const ts = doc.data().timestamp?.toMillis?.() ?? 0;
  if (ts > p.lastTs) p.lastTs = ts;
  people.set(uid, p);
}
// events carry the email on every write — the only reliable uid → email link
for (const doc of (await db.collection("events").orderBy("ts", "desc").limit(20000).get()).docs) {
  const x = doc.data();
  const uid = x.uid;
  if (!uid || !people.has(uid)) continue;
  const p = people.get(uid);
  if (!p.email && x.email) p.email = canonical(x.email);
  if (!p.name && x.name) p.name = x.name;
  const ts = x.ts?.toMillis?.() ?? 0;
  if (ts > p.lastTs) p.lastTs = ts;
}

// ── filter, showing the work ───────────────────────────────────────────────
const dropped = { admin: [], priorTerm: [], test: [], merged: [] };
let cohort = new Map();

for (const [uid, p] of people) {
  if (p.email && ADMIN_EMAILS.has(p.email)) { dropped.admin.push(p.name ?? uid.slice(0, 8)); continue; }
  if (EXCLUDED_BOARD_UIDS.has(uid))         { dropped.priorTerm.push(p.name ?? uid.slice(0, 8)); continue; }
  if (isHiddenName(p.name))                 { dropped.test.push(p.name ?? uid.slice(0, 8)); continue; }
  cohort.set(uid, p);
}

// alias merge: one person, several uids
const byPerson = new Map();
for (const [uid, p] of cohort) {
  const k = p.email ?? uid;
  const g = byPerson.get(k) ?? { name: p.name, uids: [], responses: 0, lastTs: 0 };
  g.uids.push(uid);
  g.responses += p.responses;
  g.name = g.name ?? p.name;
  if (p.lastTs > g.lastTs) g.lastTs = p.lastTs;
  byPerson.set(k, g);
}
for (const g of byPerson.values()) if (g.uids.length > 1) dropped.merged.push(`${g.name} (${g.uids.length} accounts)`);

// ── report ─────────────────────────────────────────────────────────────────
const DAY = 86_400_000;
const now = Date.now();
const enrolled = [...byPerson.values()];
const win = (days) => enrolled.filter((g) => g.lastTs > 0 && now - g.lastTs <= days * DAY);
const ever = enrolled.filter((g) => g.responses > 0);

const line = (l, n) => console.log("  " + String(l).padEnd(46) + String(n).padStart(4));

console.log("\n══ ACTIVE COHORT — the Track E denominator ══\n");
console.log("PIPELINE");
line("uids with any trace", people.size);
line(`− teacher/admin accounts (${dropped.admin.length})`, people.size - dropped.admin.length);
line(`− prior special-term uids (${dropped.priorTerm.length})`, people.size - dropped.admin.length - dropped.priorTerm.length);
line(`− test/retired accounts (${dropped.test.length})`, cohort.size);
line(`− alias merge (${dropped.merged.length} people had 2+ accounts)`, enrolled.length);
console.log("  " + "─".repeat(50));
line("ENROLLED CURRENT COHORT", enrolled.length);
console.log();
console.log("ACTIVE — pick ONE and write it into the ledger");
line("ever recorded an answer", ever.length);
line("answered in the last 30 days", win(30).length);
line("answered in the last 14 days", win(14).length);
line("answered in the last 7 days", win(7).length);

console.log("\nDROPPED, itemised");
for (const [k, v] of Object.entries(dropped)) {
  if (!v.length) continue;
  console.log(`  ${k}: ${v.join(" · ")}`);
}

console.log("\nENROLLED, with recency");
console.log("  " + "name".padEnd(24) + "answers".padStart(8) + "  last seen");
for (const g of enrolled.sort((a, b) => b.responses - a.responses)) {
  const days = g.lastTs ? Math.floor((now - g.lastTs) / DAY) : null;
  console.log("  " + String(g.name ?? g.uids[0].slice(0, 8)).slice(0, 23).padEnd(24)
    + String(g.responses).padStart(8) + "  " + (days === null ? "never" : `${days}d ago`));
}
console.log(`
CAVEAT that must travel with any figure computed from this: the response store
has a known-bad window before 2026-08-10 (D5 — the xp<=100 rules cap silently
rejected every correct answer from a learner on a 7-day streak). Answer counts
above are therefore biased DOWNWARD, and most for the most consistent learners.
Denominators are unaffected; rates are not.
`);
