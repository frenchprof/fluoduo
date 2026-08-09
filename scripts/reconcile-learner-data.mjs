import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "node:fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) { console.error("Set GOOGLE_APPLICATION_CREDENTIALS"); process.exit(1); }
const TZ = process.env.TZ_TARGET || "Asia/Singapore";
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const db = getFirestore();

const utcKey = (d) => d.toISOString().slice(0, 10);
const zoneFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const zoneKey = (d) => zoneFmt.format(d);
const dayNum = (k) => Math.floor(Date.parse(k + "T00:00:00Z") / 86400000);

const board = new Map();
for (const doc of (await db.collection("leaderboard").get()).docs) {
  const d = doc.data();
  board.set(doc.id, { name: d.name ?? null, xp: Number(d.xp ?? 0), level: Number(d.level ?? 1), gems: Number(d.gems ?? 0), streak: Number(d.streak ?? 0) });
}

const progress = new Map();
for (const doc of (await db.collectionGroup("app").get()).docs) {
  const seg = doc.ref.path.split("/");
  if (seg[0] !== "users" || seg[2] !== "app" || seg[3] !== "progress") continue;
  const d = doc.data();
  progress.set(seg[1], { xp: Number(d.xp ?? 0), gems: Number(d.gems ?? 0), streak: Number(d.streak ?? 0), lastActiveDay: d.lastActiveDay ?? null });
}

const activity = new Map();
for (const doc of (await db.collectionGroup("responses").get()).docs) {
  const seg = doc.ref.path.split("/");
  if (seg[0] !== "users") continue;
  const d = doc.data();
  const ms = d.timestamp?.toMillis?.() ?? null;
  if (ms === null) continue;
  const dt = new Date(ms);
  const a = activity.get(seg[1]) ?? { utc: new Set(), zone: new Set(), last: null, n: 0 };
  a.utc.add(utcKey(dt)); a.zone.add(zoneKey(dt)); a.n++;
  if (!a.last || dt > a.last) a.last = dt;
  activity.set(seg[1], a);
}

function longestRun(set) {
  const ns = [...set].map(dayNum).sort((a, b) => a - b);
  let best = ns.length ? 1 : 0, run = 1;
  for (let i = 1; i < ns.length; i++) { run = ns[i] === ns[i-1] + 1 ? run + 1 : 1; if (run > best) best = run; }
  return best;
}

const rows = [];
for (const uid of new Set([...board.keys(), ...progress.keys(), ...activity.keys()])) {
  const b = board.get(uid), p = progress.get(uid), a = activity.get(uid);
  const ru = a ? longestRun(a.utc) : 0, rz = a ? longestRun(a.zone) : 0;
  rows.push({ uid, name: b?.name ?? null, xpProgress: p?.xp ?? null, xpBoard: b?.xp ?? null,
    xpDelta: p && b ? p.xp - b.xp : null, streakProgress: p?.streak ?? null, streakBoard: b?.streak ?? null,
    lastActiveDay: p?.lastActiveDay ?? null, lastResponseUtc: a?.last ? utcKey(a.last) : null,
    lastResponseZone: a?.last ? zoneKey(a.last) : null, activeDaysUtc: a?.utc.size ?? 0,
    activeDaysZone: a?.zone.size ?? 0, longestRunUtc: ru, longestRunZone: rz, streakPenalty: rz - ru, responses: a?.n ?? 0 });
}

const n = (x) => (x === null ? "-" : String(x));
console.log("\nReconciliation - zone " + TZ + " - " + rows.length + " learners\n");
console.log("== A. XP divergence (progress blob vs leaderboard doc) ==");
const xpBad = rows.filter((r) => r.xpDelta !== null && r.xpDelta !== 0);
console.log("   " + xpBad.length + " of " + rows.filter((r) => r.xpProgress !== null && r.xpBoard !== null).length + " comparable learners disagree");
for (const r of xpBad.sort((a,b) => Math.abs(b.xpDelta) - Math.abs(a.xpDelta)).slice(0,25))
  console.log("   " + (r.name ?? r.uid.slice(0,8)).padEnd(22) + " progress=" + n(r.xpProgress).padStart(8) + "  board=" + n(r.xpBoard).padStart(8) + "  d=" + n(r.xpDelta));

console.log("\n== B. missing on one side ==");
console.log("   progress but no leaderboard: " + rows.filter((r) => r.xpProgress !== null && r.xpBoard === null).length);
console.log("   leaderboard but no progress: " + rows.filter((r) => r.xpBoard !== null && r.xpProgress === null).length);
console.log("   responses but no progress  : " + rows.filter((r) => r.responses > 0 && r.xpProgress === null).length);

console.log("\n== C. streak divergence (blob vs leaderboard) ==");
const stBad = rows.filter((r) => r.streakProgress !== null && r.streakBoard !== null && r.streakProgress !== r.streakBoard);
console.log("   " + stBad.length + " learners disagree");
for (const r of stBad.slice(0,20)) console.log("   " + (r.name ?? r.uid.slice(0,8)).padEnd(22) + " progress=" + n(r.streakProgress) + "  board=" + n(r.streakBoard));

console.log("\n== D. D1 victims: streak shortened by the UTC boundary ==");
const v = rows.filter((r) => r.streakPenalty > 0);
console.log("   " + v.length + " learners have a longer real streak in " + TZ + " than UTC gives them");
for (const r of v.sort((a,b) => b.streakPenalty - a.streakPenalty).slice(0,25))
  console.log("   " + (r.name ?? r.uid.slice(0,8)).padEnd(22) + " " + TZ + "=" + String(r.longestRunZone).padStart(3) + "d  UTC=" + String(r.longestRunUtc).padStart(3) + "d  lost " + r.streakPenalty + "d");

console.log("\n== E. last-active disagreement ==");
const la = rows.filter((r) => r.lastActiveDay && r.lastResponseZone && r.lastActiveDay !== r.lastResponseZone);
console.log("   " + la.length + " learners: stored lastActiveDay != last response day in " + TZ);
for (const r of la.slice(0,20)) console.log("   " + (r.name ?? r.uid.slice(0,8)).padEnd(22) + " stored=" + r.lastActiveDay + "  actual(" + TZ + ")=" + r.lastResponseZone + "  actual(UTC)=" + r.lastResponseUtc);

console.log("\n== F. duplicate display names (identity-merge candidates) ==");
const byName = new Map();
for (const r of rows) if (r.name) byName.set(r.name, [...(byName.get(r.name) ?? []), r]);
const dupes = [...byName.entries()].filter(([, x]) => x.length > 1);
console.log("   " + dupes.length + " names map to more than one uid");
for (const [name, x] of dupes) console.log("   " + name.padEnd(22) + " " + x.length + " uids - xp " + x.map((r) => n(r.xpBoard)).join(" + ") + " -> teacher shows " + x.reduce((s,r) => s + (r.xpBoard ?? 0), 0));

console.log("\n== G. totals ==");
console.log("   leaderboard " + board.size + " - progress " + progress.size + " - with responses " + activity.size);
console.log("   response docs " + rows.reduce((s,r) => s + r.responses, 0));

if (process.env.CSV) {
  const cols = Object.keys(rows[0] ?? {});
  writeFileSync("reconcile-report.csv", [cols.join(","), ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))].join("\n"));
  console.log("\n   wrote reconcile-report.csv");
}
console.log("");
