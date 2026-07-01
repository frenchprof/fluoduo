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
 */

export type Progress = {
  doneSios: string[];
  hearts: number;
  gems: number;
  streak: number;
  lastActiveDay: string | null; // "YYYY-MM-DD"
};

export const MAX_HEARTS = 5;
const GEMS_PER_DONE = 10;
const STORAGE_KEY = "fluolingo:progress";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultProgress(): Progress {
  return { doneSios: [], hearts: MAX_HEARTS, gems: 0, streak: 0, lastActiveDay: null };
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
