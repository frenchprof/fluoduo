import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
const key = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!key) { console.error("Set GOOGLE_APPLICATION_CREDENTIALS"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(key, "utf8"))) });
const db = getFirestore();

const board = new Map();
for (const d of (await db.collection("leaderboard").get()).docs) {
  const x = d.data();
  board.set(d.id, { name: x.name ?? d.id.slice(0,8), streak: Number(x.streak ?? 0) });
}
const per = new Map();
for (const doc of (await db.collectionGroup("responses").get()).docs) {
  const seg = doc.ref.path.split("/");
  if (seg[0] !== "users") continue;
  const d = doc.data();
  const g = per.get(seg[1]) ?? { n:0, met:0, missed:0, maxXp:0, over:0 };
  g.n++;
  if (d.status === "missed") g.missed++; else g.met++;
  const xp = Number(d.xp ?? 0);
  if (xp > g.maxXp) g.maxXp = xp;
  if (xp > 100) g.over++;
  per.set(seg[1], g);
}
const rows = [...per.entries()].map(([uid,g]) => ({
  name: board.get(uid)?.name ?? uid.slice(0,8),
  streak: board.get(uid)?.streak ?? 0,
  n:g.n, met:g.met, missed:g.missed,
  acc: g.n ? Math.round(g.met/g.n*100) : 0,
  maxXp:g.maxXp, over:g.over,
})).sort((a,b) => b.streak - a.streak);

const totalOver = rows.reduce((s,r) => s + r.over, 0);
const globalMax = rows.reduce((s,r) => Math.max(s, r.maxXp), 0);
console.log("\n" + rows.length + " learners with responses\n");
console.log("== A. any xp > 100 stored? ==");
console.log("   docs with xp > 100 : " + totalOver);
console.log("   highest xp stored  : " + globalMax);
console.log(totalOver === 0
  ? "   -> ZERO. Cap is rejecting the 120-XP writes. CONFIRMED."
  : "   -> some got through.");
console.log("\n== B. accuracy vs streak ==");
console.log("   " + "name".padEnd(20) + "streak".padStart(7) + "ans".padStart(7)
          + "right".padStart(7) + "wrong".padStart(7) + "acc".padStart(6) + "  maxXp");
for (const r of rows.slice(0,30))
  console.log("   " + r.name.slice(0,19).padEnd(20) + String(r.streak).padStart(7)
    + String(r.n).padStart(7) + String(r.met).padStart(7) + String(r.missed).padStart(7)
    + (r.acc+"%").padStart(6) + String(r.maxXp).padStart(7)
    + (r.streak >= 7 ? "   <-- x2, correct answers rejected" : ""));
const hi = rows.filter(r => r.streak >= 7);
const lo = rows.filter(r => r.streak < 7 && r.n > 20);
const avg = a => a.length ? Math.round(a.reduce((s,r)=>s+r.acc,0)/a.length) : "-";
console.log("\n== C. group comparison ==");
console.log("   streak >= 7 : " + hi.length + " learners, mean accuracy " + avg(hi) + "%");
console.log("   streak <  7 : " + lo.length + " learners, mean accuracy " + avg(lo) + "%\n");
