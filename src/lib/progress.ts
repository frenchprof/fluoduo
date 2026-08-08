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

import {
  BADGES,
  badgeContext,
  cosmeticById,
  levelForXp,
  xpMultiplier,
  XP_CORRECT,
  XP_WRONG,
  XP_SIO_BASE,
  XP_SIO_MASTERY,
  XP_CONVERSATION,
} from "@/lib/economy";
import { dayKey, previousDay, learnerZone } from "@/lib/dayKey";

export type Progress = {
  doneSios: string[];
  gems: number; // SPENDABLE balance (paid by badges, spent on cosmetics)
  xp: number; // lifetime score (drives levels + leaderboard); never spent
  streak: number;
  lastActiveDay: string | null; // "YYYY-MM-DD", learner-local, 04:00 rollover
  timeZone?: string; // IANA zone lastActiveDay was computed in
  itemSrs: Record<string, ItemSrs>;
  badges: string[]; // earned badge ids
  cosmetics: { owned: string[]; equipped: Record<string, string> };
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
export const GEMS_MASTERY_BONUS = XP_SIO_MASTERY; // kept as a re-export for callers
const STORAGE_KEY = "fluolingo:progress";

// todayStr() replaced by dayKey() - learner-local zone, 04:00 rollover.

export function defaultProgress(): Progress {
  return { doneSios: [], gems: 0, xp: 0, streak: 0, lastActiveDay: null, itemSrs: {}, badges: [], cosmetics: { owned: [], equipped: {} } };
}

/** Fill in fields added after a learner's blob was first written, and migrate
 *  pre-economy saves: their old `gems` total WAS lifetime XP (the code used the
 *  two interchangeably), so seed `xp` from it and let `gems` become the fresh
 *  spendable balance. Idempotent — only seeds when `xp` is absent. */
function normalize(raw: Partial<Progress>): Progress {
  const p = { ...defaultProgress(), ...raw };
  if (raw.xp == null && typeof raw.gems === "number") p.xp = raw.gems;
  p.badges = Array.isArray(raw.badges) ? raw.badges : [];
  p.cosmetics = {
    owned: Array.isArray(raw.cosmetics?.owned) ? raw.cosmetics!.owned : [],
    equipped: raw.cosmetics?.equipped && typeof raw.cosmetics.equipped === "object" ? raw.cosmetics.equipped : {},
  };
  return p;
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return normalize(JSON.parse(raw));
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

/** Wipe all device-local LEARNER data — progress + reviser schedule
 *  (fluolingo:progress), pretest misses (fluolingo:pretest.v1), and per-deck
 *  notes / study buckets (fln-*). Called on sign-out so the next user on a
 *  shared device never sees or merges someone else's work (Dan, 2026-07-05:
 *  "if i have signed out why do i still see the information about what i have
 *  left to revise"). Device preferences (volume, tour flags, widths) are kept. */
export function clearLocalLearnerData(): void {
  if (typeof window === "undefined") return;
  try {
    const ls = window.localStorage;
    const kill: string[] = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (
        k &&
        (k === STORAGE_KEY ||
          k === "fluolingo:pretest.v1" ||
          k.startsWith("fln-notes:") ||
          k.startsWith("fln-notes-meta:") ||
          k.startsWith("fln-buckets:"))
      ) {
        kill.push(k);
      }
    }
    kill.forEach((k) => ls.removeItem(k));
    window.dispatchEvent(new CustomEvent("fluolingo:progress-updated"));
  } catch {}
}

/** Add XP for one action, scaled by today's fire multiplier. */
function addXp(p: Progress, base: number): Progress {
  return { ...p, xp: p.xp + Math.round(base * xpMultiplier(p.streak)) };
}

/** Award any newly-earned badges (crediting their gem bounty), then persist.
 *  Emits a `fluolingo:reward` event per new badge and on a level-up so any
 *  mounted HUD can celebrate. Every earning path ends here. */
function finalize(p: Progress): Progress {
  const beforeXp = loadProgress().xp; // persisted state, pre-save
  const ctx = badgeContext(p);
  let gems = p.gems;
  const badges = [...p.badges];
  const fresh: string[] = [];
  for (const b of BADGES) {
    if (!badges.includes(b.id) && b.earned(p, ctx)) {
      badges.push(b.id);
      gems += b.gems;
      fresh.push(b.id);
    }
  }
  const saved = saveProgress({ ...p, gems, badges });
  try {
    if (typeof window !== "undefined") {
      if (levelForXp(saved.xp).level > levelForXp(beforeXp).level) {
        window.dispatchEvent(new CustomEvent("fluolingo:reward", { detail: { type: "level", level: levelForXp(saved.xp).level } }));
      }
      for (const id of fresh) {
        window.dispatchEvent(new CustomEvent("fluolingo:reward", { detail: { type: "badge", id } }));
      }
    }
  } catch {
    /* celebration is best-effort */
  }
  return saved;
}

function bumpStreakToday(p: Progress): Progress {
  const today = dayKey();
  if (p.lastActiveDay === today) return p;
  const streak = p.lastActiveDay === previousDay(today) ? p.streak + 1 : 1;
  return { ...p, streak, lastActiveDay: today, timeZone: learnerZone() };
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
  let p = bumpStreakToday(loadProgress());
  if (!p.doneSios.includes(id)) {
    const acc = accuracy == null ? 0 : Math.max(0, Math.min(1, accuracy));
    p = { ...p, doneSios: [...p.doneSios, id] };
    p = addXp(p, XP_SIO_BASE + Math.round(XP_SIO_MASTERY * acc));
  }
  return finalize(p);
}

/** Award XP for finishing an AI role-play conversation (café, greetings, …). */
export function awardConversationXp(): Progress {
  return finalize(addXp(bumpStreakToday(loadProgress()), XP_CONVERSATION));
}

/** Buy a cosmetic with gems and equip it (idempotent; no-op if owned already or
 *  the balance is short). The only thing gems ever buy — never learning. */
export function buyCosmetic(id: string): Progress {
  const p = loadProgress();
  const c = cosmeticById(id);
  if (!c) return p;
  if (p.cosmetics.owned.includes(id)) return equipCosmetic(id);
  if (p.gems < c.cost) return p;
  return saveProgress({
    ...p,
    gems: p.gems - c.cost,
    cosmetics: { owned: [...p.cosmetics.owned, id], equipped: { ...p.cosmetics.equipped, [c.slot]: id } },
  });
}

/** Equip an owned cosmetic, or pass null to revert a slot to its default. */
export function equipCosmetic(id: string | null): Progress {
  const p = loadProgress();
  if (id === null) {
    const equipped = { ...p.cosmetics.equipped };
    delete equipped.homeAccent;
    return saveProgress({ ...p, cosmetics: { ...p.cosmetics, equipped } });
  }
  const c = cosmeticById(id);
  if (!c || !p.cosmetics.owned.includes(id)) return p;
  return saveProgress({ ...p, cosmetics: { ...p.cosmetics, equipped: { ...p.cosmetics.equipped, [c.slot]: id } } });
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
 *
 * `activity` overrides the evidence record's activityId (otherwise it falls
 * back to `location.pathname` — see responses.ts). Pass it explicitly for any
 * game that can render embedded inside SioModal's tab-switcher, since that
 * never navigates and would otherwise tag every embedded game's writes with
 * whatever host page happened to be open (audit 2026-08-02).
 */
export function recordItemResult(itemId: string, correct: boolean, given?: string, activity?: string): Progress {
  const prev = loadProgress();
  const itemSrs = { ...prev.itemSrs, [itemId]: stepItemSrs(prev.itemSrs[itemId], correct, Date.now()) };
  // Practising ANYTHING keeps the streak alive — motivation comes from showing
  // up, not from being right (hearts, which punished errors, are gone). A right
  // answer earns more XP than a wrong one, but a wrong one still earns (effort
  // counts, errors are never punished).
  const p = bumpStreakToday({ ...prev, itemSrs });
  // Evidence trail (Dan, 2026-07-13: "every question, every attempt"): every
  // graded answer anywhere also lands in users/{uid}/responses for the
  // teacher dashboard. The receipt states the EXACT amount this answer pays
  // (base × streak multiplier — audit 2026-07-19, honest receipts). Dynamic
  // import keeps Firestore out of this module's static graph (usage.ts
  // rule); fire-and-forget, signed-out is a no-op.
  const paid = Math.round((correct ? XP_CORRECT : XP_WRONG) * xpMultiplier(p.streak));
  void import("@/lib/firebase/responses")
    .then((m) => m.recordResponse(itemId, correct, { given, xpPaid: paid, activity }))
    .catch(() => {});
  return finalize(addXp(p, correct ? XP_CORRECT : XP_WRONG));
}

/** True if the item was never practiced or its interval has elapsed — the Reviser's bias signal. */
export function isItemDue(itemId: string, p: Progress, now: number): boolean {
  const s = p.itemSrs[itemId];
  return !s || s.due <= now;
}
