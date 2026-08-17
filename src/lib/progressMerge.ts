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
import type { Progress } from "@/lib/progress";

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
  };
}
