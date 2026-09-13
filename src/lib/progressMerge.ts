/**
 * The pull-merge of sign-in, as a PURE function (no Firebase, no window) —
 * split out of progressSync.ts on 2026-08-17 so verify27 can compile it
 * alone and run the merge table in node, the way verify-grading runs the
 * grader. progressSync re-exports it; nothing else changed hands.
 *
 * Merge favours the learner: union of done SIOs, max gems/streak, monotonic
 * xp, the LATER lastActiveDay, and per-item SRS keeps whichever entry is
 * scheduled further out (the more-learned state).
 *
 * D11 (data-truth backlog): `timeZone` is the IANA zone `lastActiveDay` was
 * computed in — the pair must travel together. The old line
 * `local.timeZone ?? remote.timeZone` kept the field but could pair a fresh
 * device's zone with the OTHER device's day (a learner in Singapore whose
 * phone last bumped the streak in Paris → the day key was Paris's, the
 * zone said Singapore, and the next rollover check ran a day off). Now the
 * zone comes from whichever side supplied the winning lastActiveDay.
 */
import { weekKey, previousWeek } from "./dayKey.ts";
import type { Progress } from "@/lib/progress";

/** Reconcile the weekly XP bucket across two devices — and keep LAST week's
 *  figure alive while doing it (7 Sep, "you vs last week"). Four candidates
 *  can hold it: either side's stash, and either side's stale bucket that this
 *  very merge is about to drop. The adjacent week wins; a same-key tie takes
 *  the larger figure (the usual favours-the-learner rule). */
function mergeWeek(local: Progress, remote: Partial<Progress>): {
  weekXp: number; weekKey: string | null; prevWeekXp: number; prevWeekKey: string | null;
} {
  const now = weekKey();
  const lw = local.weekKey === now ? (local.weekXp ?? 0) : 0;
  const rw = remote.weekKey === now ? (remote.weekXp ?? 0) : 0;
  const best = Math.max(lw, rw);
  const prev = previousWeek(now);
  const candidates: Array<[string | null | undefined, number | undefined]> = [
    [local.prevWeekKey, local.prevWeekXp],
    [remote.prevWeekKey, remote.prevWeekXp],
    [local.weekKey === now ? null : local.weekKey, local.weekXp],
    [remote.weekKey === now ? null : remote.weekKey, remote.weekXp],
  ];
  let prevWeekXp = 0;
  let prevWeekKey: string | null = null;
  for (const [k, xp] of candidates) {
    if (!k || !(xp && xp > 0)) continue;
    // The adjacent week is the one the board can call "last week"; among
    // older stashes keep the latest so a future adjacent read stays possible.
    if (prevWeekKey === null || k > prevWeekKey || (k === prevWeekKey && xp > prevWeekXp)) {
      prevWeekXp = xp; prevWeekKey = k;
    }
    if (k === prev && xp >= prevWeekXp) { prevWeekXp = xp; prevWeekKey = k; }
  }
  return { weekXp: best > 0 ? best : 0, weekKey: now, prevWeekXp, prevWeekKey };
}

/** Reconcile the lucky find's books (PR 202) — dropping them here was a guard
 *  erosion: a sign-in reset findGems, so the daily cap started over. Same
 *  learner-day → the TIGHTER book wins on the cap counter and the FURTHER
 *  pity progress is kept; different days → the later day's books. */
function mergeFind(local: Progress, remote: Partial<Progress>): {
  findDay: string | null; findGems: number; findDry: number;
} {
  const ld = local.findDay ?? null, rd = remote.findDay ?? null;
  const lg = local.findGems ?? 0, rg = remote.findGems ?? 0;
  const ldry = local.findDry ?? 0, rdry = remote.findDry ?? 0;
  if (ld === rd) return { findDay: ld, findGems: Math.max(lg, rg), findDry: Math.max(ldry, rdry) };
  const localWins = !!ld && (!rd || ld > rd);
  return localWins
    ? { findDay: ld, findGems: lg, findDry: ldry }
    : { findDay: rd, findGems: rg, findDry: rdry };
}

/** Best-per-activity, keeping the higher score on each key (see Progress.bests
 *  and awardActivityRun): dropping this map on sign-in would let a second
 *  device collect the first-finish XP for work already finished. */
function mergeBests(local: Progress, remote: Partial<Progress>): Record<string, number> {
  const out: Record<string, number> = { ...(remote.bests ?? {}) };
  for (const [k, v] of Object.entries(local.bests ?? {})) {
    out[k] = Math.max(out[k] ?? 0, v);
  }
  return out;
}

export function mergeProgress(local: Progress, remote: Partial<Progress> | undefined): Progress {
  if (!remote) return local;
  const itemSrs = { ...(remote.itemSrs ?? {}) };
  for (const [id, s] of Object.entries(local.itemSrs)) {
    const r = itemSrs[id];
    itemSrs[id] = !r || s.due >= r.due ? s : r;
  }
  // The later day wins; its zone comes with it. Same day on both sides →
  // the device the learner is on wins (its zone is the one they are in).
  const remoteDay = remote.lastActiveDay ?? null;
  const localDay = local.lastActiveDay;
  const remoteWins = !!remoteDay && (!localDay || remoteDay > localDay);
  const lastActiveDay = remoteWins ? remoteDay : (localDay ?? remoteDay ?? null);
  const timeZone = remoteWins
    ? (remote.timeZone ?? local.timeZone)
    : (local.timeZone ?? remote.timeZone);
  return {
    doneSios: [...new Set([...(remote.doneSios ?? []), ...local.doneSios])],
    // gems are a spendable balance; max favours the learner (a tiny refund on
    // the rare spend-then-merge is acceptable in beta). xp is monotonic.
    gems: Math.max(local.gems, remote.gems ?? 0),
    xp: Math.max(local.xp ?? 0, remote.xp ?? 0),
    streak: Math.max(local.streak, remote.streak ?? 0),
    // The weekly bucket only merges within the SAME week — two devices in the
    // same week take the larger figure (same "favours the learner" rule as
    // gems), a stale week is dropped rather than carried into a new one, and
    // a bucket from a week neither side is in any more is simply gone. A
    // weekly board that inherits last week's total is not a weekly board.
    ...mergeWeek(local, remote),
    ...mergeFind(local, remote),
    // Shields: max favours the learner (same rule as gems); the cap is
    // normalize()'s job on read. Unlocks are purchases — union, like owned
    // cosmetics.
    shields: Math.max(local.shields ?? 0, remote.shields ?? 0),
    unlocks: [...new Set([...(remote.unlocks ?? []), ...(local.unlocks ?? [])])],
    lastActiveDay,
    timeZone,
    itemSrs,
    badges: [...new Set([...(remote.badges ?? []), ...(local.badges ?? [])])],
    cosmetics: {
      owned: [...new Set([...(remote.cosmetics?.owned ?? []), ...(local.cosmetics?.owned ?? [])])],
      // equipped: the device the learner is on wins, else whatever remote had.
      equipped: { ...(remote.cosmetics?.equipped ?? {}), ...(local.cosmetics?.equipped ?? {}) },
    },
    // Cohort marker: once stamped remotely it never changes. startProgressSync
    // handles the pre-marker cases (remote doc without the field = legacy).
    term: remote.term ?? local.term,
    // Personal bests, so a second device cannot re-collect the first-finish XP
    // for an activity this learner has already finished. Per key, the HIGHER
    // score wins — the same favours-the-learner rule as gems, and the same one
    // awardActivityRun applies when it decides whether a run improved.
    bests: mergeBests(local, remote),
    // The welcome purse is paid ONCE. This function rebuilds Progress from a
    // fixed key list, so a flag that is not named here is DROPPED on every
    // sign-in — and normalize() would then pay the grant again on the next
    // read, every read, on every device. Sticky true: whichever side has been
    // paid, the account has been paid.
    welcomed: (local.welcomed ?? false) || (remote.welcomed ?? false),
  };
}
