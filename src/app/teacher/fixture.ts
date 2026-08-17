/**
 * A synthetic class for the teacher page — SCREENSHOTS AND CHECKS ONLY.
 *
 * The teacher page reads live Firestore behind an admin sign-in, so nothing
 * on it can be rendered by a build machine or a Playwright run. This module
 * fabricates sixteen learners with plausible answer logs and events, and is
 * reached ONLY when the build sets NEXT_PUBLIC_TEACHER_FIXTURE=1 (data.ts
 * dynamic-imports it behind that inlined constant, so a production build
 * neither runs nor bundles it). No real name, uid or email appears here —
 * verify18b walks the built output for those.
 *
 *   NEXT_PUBLIC_TEACHER_FIXTURE=1 REQUIRE_SIGN_IN=false npm run build
 */
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { CURRENT_TERM } from "@/lib/term";
import type { BoardRow, Ev, RosterMeta, StudentDetail } from "./data";

/** Deterministic PRNG so two builds shoot the same picture. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const NAMES = [
  "Élève Un", "Élève Deux", "Élève Trois", "Élève Quatre", "Élève Cinq", "Élève Six",
  "Élève Sept", "Élève Huit", "Élève Neuf", "Élève Dix", "Élève Onze", "Élève Douze",
  "Élève Treize", "Élève Quatorze", "Élève Quinze", "Élève Seize",
];
export const FIXTURE_UIDS = NAMES.map((_, i) => `fixture-${String(i + 1).padStart(2, "0")}-uid`);

const NOW = Date.now();
const DAY = 86_400_000;

/** Every deck item, in course order, so answers land on real outcomes. */
const ITEMS: { id: string; sio: string; unit: number }[] = [];
for (const s of SIOS) {
  const c = CURATED.find((x) => x.id === s.collectionId);
  for (const it of c?.items ?? []) ITEMS.push({ id: (it as { id: string }).id, sio: s.id, unit: s.unit });
}

/** Learner i has "reached" a point in the course and a personal accuracy;
 *  earlier outcomes are stronger, the frontier is where the misses cluster. */
function profile(i: number) {
  const r = rng(1000 + i);
  const reach = 6 + Math.floor(r() * 30); // SIO index reached
  const skill = 0.55 + r() * 0.4;          // base accuracy
  return { r, reach, skill };
}

export function fixtureDetail(uid: string): StudentDetail {
  const i = FIXTURE_UIDS.indexOf(uid);
  if (i < 0) return { progress: null, sessions: [], responses: [], attemptsCount: null };
  const { r, reach, skill } = profile(i);
  const responses: StudentDetail["responses"] = [];
  const doneSios: string[] = [];
  const pool = ITEMS.filter((it) => SIOS.findIndex((s) => s.id === it.sio) < reach);
  for (let k = 0; k < reach; k++) if (r() < 0.8) doneSios.push(SIOS[k].id);
  const nAns = 120 + Math.floor(r() * 200);
  for (let k = 0; k < nAns; k++) {
    // Bias toward the frontier: the last few outcomes get half the answers.
    const it = r() < 0.5 ? pool[Math.floor(pool.length * (0.75 + r() * 0.25))] : pool[Math.floor(r() * pool.length)];
    if (!it) continue;
    const idx = SIOS.findIndex((s) => s.id === it.sio);
    const hardness = idx / Math.max(1, reach); // frontier is harder
    const ok = r() < skill - 0.35 * hardness;
    const ago = r() * 20 * DAY;
    responses.push({
      item: it.id, status: ok ? "met" : "missed", xp: ok ? 10 : 0, latencyMs: 2000 + Math.floor(r() * 6000),
      givenAnswer: ok ? null : "…", activityId: `/practice/flip-it/${SIOS[idx].collectionId}`,
      ts: new Date(NOW - ago),
    });
  }
  // Two learners are "live": a burst in the last ten minutes, one of them a
  // three-in-a-row miss on one outcome (the Class-now red flag).
  if (i === 3 || i === 7) {
    const it = pool[pool.length - 1];
    for (let k = 0; k < 6; k++) {
      responses.push({
        item: it.id, status: i === 3 && k >= 3 ? "missed" : k % 2 ? "missed" : "met", xp: 0, latencyMs: 3000,
        givenAnswer: null, activityId: `/practice/flip-it/${SIOS[SIOS.findIndex((s) => s.id === it.sio)].collectionId}`,
        ts: new Date(NOW - (6 - k) * 60_000),
      });
    }
  }
  responses.sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0));
  return {
    progress: { xp: 300 + i * 40, gems: 10 + i, streak: i % 5, lastActiveDay: null, doneSios, badges: [], itemSrs: {}, updatedAt: NOW },
    sessions: [],
    responses,
    attemptsCount: responses.length,
  };
}

export function fixtureEvents(): Ev[] {
  const out: Ev[] = [];
  for (let i = 0; i < FIXTURE_UIDS.length; i++) {
    const { r } = profile(i);
    const days = 3 + Math.floor(r() * 12);
    for (let d = 0; d < days; d++) {
      const t = NOW - d * DAY - r() * 8 * 3_600_000;
      out.push({ uid: FIXTURE_UIDS[i], type: "page.view", ts: new Date(t), payload: { path: "/activities", name: NAMES[i] } });
      if (r() < 0.6) out.push({ uid: FIXTURE_UIDS[i], type: "game.start", ts: new Date(t + 60_000), payload: { game: "flip-it", collectionId: SIOS[Math.floor(r() * 20)].collectionId } });
    }
  }
  // The two live ones were seen a minute ago; a third one today.
  for (const i of [3, 7]) out.push({ uid: FIXTURE_UIDS[i], type: "page.view", ts: new Date(NOW - 60_000), payload: { path: "/practice/flip-it/aliments", name: NAMES[i] } });
  out.push({ uid: FIXTURE_UIDS[11], type: "page.view", ts: new Date(NOW - 3 * 3_600_000), payload: { path: "/", name: NAMES[11] } });
  out.sort((a, b) => (a.ts?.getTime() ?? 0) - (b.ts?.getTime() ?? 0));
  return out;
}

export function fixtureBoard(): Map<string, BoardRow> {
  const m = new Map<string, BoardRow>();
  FIXTURE_UIDS.forEach((uid, i) => m.set(uid, { name: NAMES[i], xp: 300 + i * 40, level: 1 + (i % 4), gems: 10 + i, streak: i % 5, term: CURRENT_TERM }));
  return m;
}

export function fixtureRosterMeta(): RosterMeta {
  return { aliasEmails: {}, rosterNames: {}, knownEmails: {} };
}
