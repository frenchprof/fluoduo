/**
 * WHERE YOU WERE IN THE LESSON (Dan #5, 2026-08-27: leaving a lesson loses
 * your place).
 *
 * What was actually lost, measured before writing this: only the POSITION.
 * XP, streak, badges and the SRS word history all survive a reload — they
 * live in `fluolingo:progress` and are written per answer. The run itself was
 * plain component state (`const [i, setI] = useState(0)` in LessonPager), so
 * closing the tab dropped the queue and the score with it, and the lesson
 * restarted from card one with the answered cards counted as never seen.
 *
 * WHY THE QUEUE IS SAVED AND NOT A SEED. The obvious cheap fix — remember the
 * index — does not work here, and would have looked like it did. buildCards()
 * shuffles seven times, so a rebuild produces a DIFFERENT twelve cards;
 * restoring index 7 would land on someone else's question while looking
 * perfectly correct. The alternative was to thread a seeded `rand` through
 * every generator, but Exercise is plain data (strings and string arrays, no
 * React nodes), so the run itself round-trips through JSON for about 4KB.
 * That also survives the requeue mechanic for free: a wrong answer appends to
 * the queue, so the queue IS the state, and a seed would have to replay the
 * mistakes to reproduce it.
 *
 * The rule cards are NOT saved: they are ReactNode, and they are the
 * deterministic half of buildCards — the same lesson yields the same rules.
 * `rulesLen` is kept only as a guard, because the pager's index spans rules
 * and exercises in one sequence; if a lesson is re-authored with a different
 * number of rule cards, a saved index would silently point one card off. On
 * any mismatch the run is discarded rather than resumed wrong.
 *
 * One run is held at a time — the lesson you walked away from — so this
 * cannot grow without bound. It is cleared when the run ends, so re-entering
 * a finished lesson starts fresh, and it expires, because silently resuming
 * a lesson from three days ago is not "my place" any more.
 */

const KEY = "fluolingo:lessonRun.v1";

/** Beyond this a saved run is stale: you are starting again, not returning. */
export const RUN_TTL_MS = 12 * 60 * 60 * 1000;

export type SavedRun<Q> = {
  v: 1;
  /** Which lesson this run belongs to (the pager's activityKey + slug). */
  key: string;
  /** Guard: the deterministic half of buildCards must still agree. */
  rulesLen: number;
  queue: Q[];
  i: number;
  score: { ok: number; total: number };
  misses: unknown[];
  /** So the end card reports the whole lesson's XP, not just this sitting's. */
  xpAtStart: number;
  savedAt: number;
};

/** Save the run in progress. Called on every advance; cheap and synchronous. */
export function saveRun<Q>(run: Omit<SavedRun<Q>, "v" | "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: SavedRun<Q> = { ...run, v: 1, savedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* private mode, or the quota is full — losing your place is not worth
       throwing inside a render path. */
  }
}

/**
 * The saved run for `key`, or null. Returns null — and clears — whenever the
 * save cannot be trusted: another lesson, a re-authored rule count, an
 * expired sitting, or anything that does not parse.
 */
export function loadRun<Q>(key: string, rulesLen: number): SavedRun<Q> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SavedRun<Q>;
    if (p?.v !== 1 || p.key !== key) return null;
    if (!Array.isArray(p.queue) || typeof p.i !== "number") return null;
    if (p.rulesLen !== rulesLen) { clearRun(); return null; }
    if (Date.now() - p.savedAt > RUN_TTL_MS) { clearRun(); return null; }
    // A run that never got past the rule cards is not a place worth keeping;
    // resuming it would look identical to starting, minus the Mémo.
    if (p.i <= rulesLen) return null;
    // Past the end: the run finished but the clear did not land. Not resumable.
    if (p.i >= rulesLen + p.queue.length) { clearRun(); return null; }
    return p;
  } catch {
    return null;
  }
}

/** Drop the saved run — on completion, or when it cannot be trusted. */
export function clearRun(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do; a stale run expires on its own. */
  }
}
