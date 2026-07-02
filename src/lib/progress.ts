/**
 * The learner-progress store this app has been missing — see docs/handoff's
 * repeated "no persisted progress" caveat. Client-only, `localStorage`-backed,
 * one device per learner (no accounts/server yet — that's a further increment).
 *
 * Scope, deliberately kept simple for this first pass:
 *   - doneSios: a SIO is "done" when the learner self-marks it via the
 *     MarkDoneButton on its Post-lesson Practice section (see /sio/[id]). There
 *     is no game-completion telemetry wired up yet (Flip It / Match It / Letris
 *     don't report back), so self-marking is the only honest signal available —
 *     same pattern Flip It already uses for its Reviewed/To-Review toggle.
 *   - NOTHING IS LOCKED (Dan's explicit call, 2026-07-01: "we must not lock any
 *     of the future modules"). An earlier pass of this store had an
 *     `isSioLocked` sequential-unlock rule — it was removed. "Done" still
 *     drives the single "you are here" active-node cue on the home path, but
 *     every SIO is always reachable regardless of progress.
 *   - Gems: a flat amount per newly-done SIO. Not yet split by
 *     pretest-attempt-floor vs practice-completion — see docs/handoff §4.2 for
 *     that nuance, still to be layered in once pretests themselves write back.
 *   - Streak: bumps once per calendar day the learner marks anything done.
 *   - Hearts: a running pool, decremented by Match It on a wrong match (see
 *     ConveyorMatch.tsx). NOT YET used to gate entry to anything, and there is
 *     no refill mechanic yet (deliberately deferred — a refill/spend design
 *     needs its own decision, don't invent one here). Hearts must never be
 *     spent by the Pretest — see the pretesting-effect rule in the handoff doc.
 *   - itemSrs: per-item spacing state written by Practice-side surfaces with a
 *     binary correctness check (dice Practice, Match It, Flip It's Test
 *     Yourself). Fixed ladder, NOT SM-2 (src/lib/firebase/srs.ts stays the
 *     future synced upgrade path, unwired by design — it needs auth). Read by
 *     the Reviser (when built) to bias its mixed set toward due items. The
 *     Pretest and Say It never write here: the Pretest is a cold diagnostic,
 *     and Say It's STT grader is a placeholder, not a trustworthy signal yet.
 */

export type Progress = {
  doneSios: string[];
  hearts: number;
  gems: number;
  streak: number;
  lastActiveDay: string | null; // "YYYY-MM-DD"
  itemSrs: Record<string, ItemSrs>;
};

export type ItemSrs = {
  due: number; // epoch ms when the item should resurface
  intervalDays: number;
};

export const MAX_HEARTS = 5;
const GEMS_PER_DONE = 10;
const STORAGE_KEY = "fluolingo:progress";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultProgress(): Progress {
  return { doneSios: [], hearts: MAX_HEARTS, gems: 0, streak: 0, lastActiveDay: null, itemSrs: {} };
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

function saveProgress(p: Progress): Progress {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // localStorage unavailable — state still works for this session
  }
  return p;
}

function bumpStreakToday(p: Progress): Progress {
  const today = todayStr();
  if (p.lastActiveDay === today) return p;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak = p.lastActiveDay === yesterday ? p.streak + 1 : 1;
  return { ...p, streak, lastActiveDay: today };
}

export function isSioDone(id: string, p: Progress): boolean {
  return p.doneSios.includes(id);
}

export function markSioDone(id: string): Progress {
  let p = loadProgress();
  if (!p.doneSios.includes(id)) {
    p = { ...p, doneSios: [...p.doneSios, id], gems: p.gems + GEMS_PER_DONE };
  }
  return saveProgress(bumpStreakToday(p));
}

export function unmarkSioDone(id: string): Progress {
  const p = loadProgress();
  return saveProgress({ ...p, doneSios: p.doneSios.filter((x) => x !== id) });
}

/** Called on a wrong match in a Practice-side game (e.g. Match It). Never call this from a Pretest. */
export function spendHeart(): Progress {
  const p = loadProgress();
  return saveProgress({ ...p, hearts: Math.max(0, p.hearts - 1) });
}

// ladder: correct → 1d → 3d → 7d → 14d (cap); miss resets to 0 (due now)
const SRS_LADDER_DAYS = [1, 3, 7, 14];
const DAY_MS = 86_400_000;

/** Pure ladder step — exported so the Reviser (and tests) can reason about it. */
export function stepItemSrs(prev: ItemSrs | undefined, correct: boolean, now: number): ItemSrs {
  if (!correct) return { due: now, intervalDays: 0 };
  // Early review (item not due yet) doesn't climb the ladder — otherwise
  // re-matching a word across Match It levels would rush 1d → 14d in one sitting.
  if (prev && now < prev.due) return prev;
  const current = prev?.intervalDays ?? 0;
  const next = SRS_LADDER_DAYS.find((d) => d > current) ?? SRS_LADDER_DAYS[SRS_LADDER_DAYS.length - 1];
  return { due: now + next * DAY_MS, intervalDays: next };
}

/**
 * Record a binary practice result for one item. Call from event handlers only
 * (never during render — Date.now()). Every attempt writes: a miss resets the
 * ladder, so correct-after-retry lands back at the 1-day rung — that IS the
 * intended "repaired but fragile" signal, don't gate this to first attempts.
 */
export function recordItemResult(itemId: string, correct: boolean): Progress {
  const p = loadProgress();
  const itemSrs = { ...p.itemSrs, [itemId]: stepItemSrs(p.itemSrs[itemId], correct, Date.now()) };
  return saveProgress({ ...p, itemSrs });
}

/** True if the item was never practiced or its interval has elapsed — the Reviser's bias signal. */
export function isItemDue(itemId: string, p: Progress, now: number): boolean {
  const s = p.itemSrs[itemId];
  return !s || s.due <= now;
}
