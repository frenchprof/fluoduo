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
 *   - Streak: bumps once per calendar day of ANY practice (recordItemResult)
 *     or self-mark — showing up counts, being wrong never breaks it.
 *   - Hearts: REMOVED (2026-07-04). The canonical Blueprint names hearts an
 *     anti-pattern ("punishes errors" [EST]); errors are learning signals here,
 *     never a cost. The streak took over as the show-up motivator.
 *   - itemSrs: per-item spacing state written by Practice-side surfaces with a
 *     binary correctness check (dice Practice, Match It, Flip It's Test
 *     Yourself, Complete It, Say It). Fixed ladder, NOT SM-2
 *     (src/lib/firebase/srs.ts stays the future synced upgrade path, unwired by
 *     design — it needs auth). Read by the Reviser to bias its set toward due
 *     items. Say It now feeds it too (Dan, 2026-07-03: the Reviser must "take
 *     note of what has been missed") — its grader has since been hardened
 *     (accents, hyphens, numeric forms). The Pretest still never writes here:
 *     it's a deliberate cold diagnostic on a separate item-id namespace.
 */

export type Progress = {
  doneSios: string[];
  gems: number;
  streak: number;
  lastActiveDay: string | null; // "YYYY-MM-DD"
  itemSrs: Record<string, ItemSrs>;
};

export type ItemSrs = {
  due: number; // epoch ms when the item should resurface
  intervalDays: number;
};

// Correctness-weighted XP: completing a SIO always earns the base; on top of
// that a mastery bonus scales with how many of the SIO's practice items the
// learner has actually gotten right (their itemSrs state). Someone who drilled
// the deck to mastery earns up to GEMS_BASE + GEMS_MASTERY_BONUS; a bare
// self-mark with no practice still earns the base.
const GEMS_BASE = 10;
export const GEMS_MASTERY_BONUS = 10;
const STORAGE_KEY = "fluolingo:progress";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultProgress(): Progress {
  return { doneSios: [], gems: 0, streak: 0, lastActiveDay: null, itemSrs: {} };
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

// The sync layer (lib/firebase/progressSync) registers here; progress.ts itself
// stays firebase-free so the static graph carries zero Firestore.
let onSave: ((p: Progress) => void) | null = null;
export function setOnProgressSave(fn: ((p: Progress) => void) | null) {
  onSave = fn;
}

function saveProgress(p: Progress): Progress {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // localStorage unavailable — state still works for this session
  }
  onSave?.(p);
  return p;
}

/** Overwrite local state WITHOUT notifying the sync listener (used by the sync
 *  layer itself after a pull-merge, to avoid an echo push loop). Broadcasts a
 *  window event so mounted HUDs (SioHub) can refresh. */
export function replaceProgress(p: Progress): Progress {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("fluolingo:progress-updated"));
  } catch {}
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

/**
 * Fraction (0..1) of the given items the learner has gotten right — an item
 * counts as "known" when its SRS ladder has advanced past 0 (a miss resets it
 * to 0). Returns 0 for an empty list. This is the correctness signal that
 * weights XP and the Reviser's due bias.
 */
export function itemsMastery(itemIds: string[], p: Progress): number {
  if (itemIds.length === 0) return 0;
  const known = itemIds.filter((id) => (p.itemSrs[id]?.intervalDays ?? 0) > 0).length;
  return known / itemIds.length;
}

/**
 * Mark a SIO done. `accuracy` (0..1) is the learner's demonstrated mastery of
 * its practice items — pass it to earn the mastery bonus on top of the base.
 * Omit it (or pass a deckless SIO's 0) and only the base is awarded.
 */
export function markSioDone(id: string, accuracy?: number): Progress {
  let p = loadProgress();
  if (!p.doneSios.includes(id)) {
    const acc = accuracy == null ? 0 : Math.max(0, Math.min(1, accuracy));
    const gain = GEMS_BASE + Math.round(GEMS_MASTERY_BONUS * acc);
    p = { ...p, doneSios: [...p.doneSios, id], gems: p.gems + gain };
  }
  return saveProgress(bumpStreakToday(p));
}

export function unmarkSioDone(id: string): Progress {
  const p = loadProgress();
  return saveProgress({ ...p, doneSios: p.doneSios.filter((x) => x !== id) });
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
  // Practising ANYTHING keeps the streak alive — motivation comes from showing
  // up, not from being right (hearts, which punished errors, are gone).
  return saveProgress(bumpStreakToday({ ...p, itemSrs }));
}

/** True if the item was never practiced or its interval has elapsed — the Reviser's bias signal. */
export function isItemDue(itemId: string, p: Progress, now: number): boolean {
  const s = p.itemSrs[itemId];
  return !s || s.due <= now;
}
