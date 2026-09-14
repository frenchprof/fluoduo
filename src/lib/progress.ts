/**
 * The learner-progress store this app has been missing — see docs/handoff's
 * repeated "no persisted progress" caveat. Client-only, `localStorage`-backed,
 * one device per learner (no accounts/server yet — that's a further increment).
 *
 * Scope, deliberately kept simple for this first pass:
 *   - doneSios: a SIO is "done" when every activity the stop OFFERS has been
 *     attempted — derived, not declared (Dan, 2026-08-31: "it should only be
 *     marked done if it is really FULLY done, so we should remove it"). The
 *     rule and its reasoning live in lib/doneness.ts; it fires from
 *     activityLedger's noteAttempt, the one write path a graded answer already
 *     takes, and still goes through markSioDone below so XP, gems, the streak
 *     and the badges are unchanged.
 *     Until then this was SELF-MARKED via a MarkDoneButton, because no game
 *     reported completion back to any shared store. The activity ledger (added
 *     later) is that telemetry, which is what made the button removable.
 *     GRANDFATHERED: entries written by the old button stand, and the derived
 *     rule only ever adds — nothing can un-tick.
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
import { ensureRenumber3435 } from "./migrations/renumber3435";

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
  XP_ACTIVITY_FIRST,
  XP_ACTIVITY_BEST,
  WELCOME_GEMS,
  BUG_BOUNTY_ON_REPORT,
  BUG_BOUNTY_DAILY_CAP,
  FIND_BIG,
  luckyFind,
  LEVEL_UP_GEMS,
  SHIELD_COST,
  SHIELD_MAX,
  EXPERT_UNLOCKS,
} from "@/lib/economy";
import { dayKey, previousDay, learnerZone, weekKey, previousWeek } from "@/lib/dayKey";
import { buildEvidence, type AssistanceLevel } from "@/lib/evidence";
import { CURRENT_TERM } from "@/lib/term";
import { SIOS } from "@/content/sios";

export type Progress = {
  doneSios: string[];
  gems: number; // SPENDABLE balance (paid by badges, spent on cosmetics)
  xp: number; // lifetime score (drives levels + leaderboard); never spent
  streak: number;
  /** XP earned inside the current ISO week, for the weekly board. Resets when
   *  `weekKey` moves on — a cumulative board is decided by week three, and
   *  everyone deserves a live race (DOPAMINE_REVIEW §9). */
  weekXp: number;
  /** The ISO week `weekXp` belongs to ("YYYY-Www"), learner-local. */
  weekKey: string | null;
  /** LAST week's final figure, stashed when `weekKey` rolls over, so the
   *  board can say "you vs last week" without publishing anything new —
   *  self-comparison only, never anyone else's data (Dan, 7 Sep). */
  prevWeekXp?: number;
  /** The ISO week `prevWeekXp` belongs to. Only an ADJACENT week reads as
   *  "last week" on screen; an older stash truthfully shows a 0 last week. */
  prevWeekKey?: string | null;
  lastActiveDay: string | null; // "YYYY-MM-DD", learner-local, 04:00 rollover
  timeZone?: string; // IANA zone lastActiveDay was computed in
  itemSrs: Record<string, ItemSrs>;
  badges: string[]; // earned badge ids
  cosmetics: { owned: string[]; equipped: Record<string, string> };
  /** Cohort marker (src/lib/term.ts). Stamped once — CURRENT_TERM for
   *  accounts born after the 2026-08-11 reset, LEGACY_TERM for accounts
   *  whose remote doc predates the field (progressSync decides). */
  term?: string;
  /** The pinned goal (Design handoff, 2026-08-22): WHICH of the fifty you are
   *  aiming at and BY WHEN. Deliberately not a copy of the can-do sentence —
   *  the spine is the source of truth for what the outcome says; this stores
   *  only the commitment the spine cannot hold. Absent until one is set. */
  goal?: { sio: string; by: string | null };
  /** THE LUCKY FIND's books (see `luckyFind` in economy.ts). `findDay` is the
   *  learner-local day `findGems` counts in — both reset when the day turns.
   *  `findDry` is paying answers since the last find and deliberately does NOT
   *  reset at midnight: the pity floor belongs to the learner's run of bad
   *  luck, not to the calendar, or every day would start owing them one. */
  findDay?: string | null;
  findGems?: number;
  findDry?: number;
  /** BOUCLIERS held (0..SHIELD_MAX) — bought in advance in the boutique; one
   *  spends itself silently when exactly one day is missed, and the chain
   *  holds. Never offered at the moment of loss (economy.ts, 7 Sep). */
  shields?: number;
  /** Your best score so far per activity-at-a-goal, keyed `<activity>:<goal>`
   *  (a goal-less game like NumBus keys `<activity>:-`). Written only when a
   *  run BEATS the stored number, which is exactly when XP is paid — see
   *  `awardActivityRun`. Absent key = never finished it. */
  bests?: Record<string, number>;
  /** The BUG BOUNTY's books, shaped exactly like the lucky find's above and for
   *  the same reason: the payout is made by the client, so the ceiling is
   *  arithmetic on these two and they must survive a sign-in. `bugDay` is the
   *  learner-local day key the counter belongs to. */
  bugDay?: string | null;
  bugGems?: number;
  /** Has this account been paid the WELCOME_GEMS purse? A one-time flag, never
   *  cleared — it is what stops a sign-in, a second device or a cleared cache
   *  from paying the grant again. Absent on every blob written before
   *  2026-09-13, which is precisely how those learners get theirs. */
  welcomed?: boolean;
  /** Expert-GAME unlock ids the learner has bought (EXPERT_UNLOCKS). Games
   *  only — the course spine never appears here. */
  unlocks?: string[];
};

/** What rides on `fluolingo:reward`. `size` drives how loud the celebration
 *  is — see RewardToast. */
export type RewardDetail =
  | { type: "level"; size: RewardSize; level: number }
  | { type: "badge"; size: RewardSize; id: string }
  | { type: "streak"; size: RewardSize; streak: number; mult: number }
  | { type: "multiplier"; size: RewardSize; mult: number; streak: number }
  | { type: "sio"; size: RewardSize; id: string }
  | { type: "unit"; size: RewardSize; unit: number; count: number }
  | { type: "mastery"; size: RewardSize; count: number }
  | { type: "perfect"; size: RewardSize; count: number }
  | { type: "find"; size: RewardSize; gems: number }
  | { type: "shield"; size: RewardSize; streak: number };

/** chime = a tick of acknowledgement · full = the fanfare, once a unit. */
export type RewardSize = "chime" | "small" | "big" | "full";

export type ItemSrs = {
  due: number; // epoch ms when the item should resurface
  intervalDays: number;
};

// ── THE ONE DEFINITION OF "WEAK" (data-truth backlog, 2026-08-17) ──────────
// Four rules used to coexist: the tier scale (accuracy < 50 red, < 75 amber)
// in outcomeRows.ts AND again in activityLedger.ts; the teacher's missColor
// (miss rate >= 50 red, >= 25 amber — the same idea, off by one at 75); the
// Reviser's "weak" (SRS interval reset to 0 by a miss); /moi's and the
// Finale's "weak" (interval <= 1 day). Every site now calls these two.
/** Accuracy below this is WEAK (red). */
export const WEAK_BELOW = 50;
/** Accuracy from this up is GOOD (green); between = MEDIUM (amber). */
export const GOOD_FROM = 75;
export type Tier = "weak" | "medium" | "good";
/** The tier of a 0..100 accuracy; null when nothing was answered. */
export function tierFor(pct: number | null | undefined): Tier | null {
  if (pct == null || Number.isNaN(pct)) return null;
  if (pct < WEAK_BELOW) return "weak";
  if (pct < GOOD_FROM) return "medium";
  return "good";
}
/** An SRS item is WEAK while its interval is at most one day: just missed
 *  (0, the ladder reset) or repaired-but-fragile (1, the first rung back). */
export function isWeakSrs(s: ItemSrs | undefined | null): boolean {
  return !!s && s.intervalDays <= 1;
}

// Correctness-weighted XP: completing a SIO always earns the base; on top of
// that a mastery bonus scales with how many of the SIO's practice items the
// learner has actually gotten right (their itemSrs state). Someone who drilled
// the deck to mastery earns up to GEMS_BASE + GEMS_MASTERY_BONUS; a bare
// self-mark with no practice still earns the base.
export const GEMS_MASTERY_BONUS = XP_SIO_MASTERY; // kept as a re-export for callers
const STORAGE_KEY = "fluolingo:progress";

// todayStr() replaced by dayKey() - learner-local zone, 04:00 rollover.

export function defaultProgress(): Progress {
  return { doneSios: [], gems: WELCOME_GEMS, welcomed: true, bugDay: null, bugGems: 0, xp: 0, streak: 0, weekXp: 0, weekKey: null, lastActiveDay: null, itemSrs: {}, badges: [], cosmetics: { owned: [], equipped: {} }, term: CURRENT_TERM, findDay: null, findGems: 0, findDry: 0, prevWeekXp: 0, prevWeekKey: null, shields: 0, unlocks: [], bests: {} };
}

/** Fill in fields added after a learner's blob was first written, and migrate
 *  pre-economy saves: their old `gems` total WAS lifetime XP (the code used the
 *  two interchangeably), so seed `xp` from it and let `gems` become the fresh
 *  spendable balance. Idempotent — only seeds when `xp` is absent. */
function normalize(raw: Partial<Progress>): Progress {
  const p = { ...defaultProgress(), ...raw };
  if (raw.xp == null && typeof raw.gems === "number") p.xp = raw.gems;
  // THE WELCOME PURSE, paid once (economy.ts WELCOME_GEMS, 2026-09-13). Every
  // blob written before today lacks the flag, so each existing learner is paid
  // exactly once, here, on their next read — and a learner who has spent the
  // grant is not paid again, because the flag survives the spending.
  //
  // ADDED to the balance rather than assigned: `{...defaultProgress(), ...raw}`
  // has already restored this learner's own gems, and a bare assignment would
  // hand a learner with 300 gems a purse of 20.
  if (raw.welcomed !== true) {
    p.gems = Math.max(0, Number.isFinite(p.gems) ? p.gems : 0) + WELCOME_GEMS;
    p.welcomed = true;
  }
  p.badges = Array.isArray(raw.badges) ? raw.badges : [];
  p.cosmetics = {
    owned: Array.isArray(raw.cosmetics?.owned) ? raw.cosmetics!.owned : [],
    equipped: raw.cosmetics?.equipped && typeof raw.cosmetics.equipped === "object" ? raw.cosmetics.equipped : {},
  };
  // The find counters are guarded because the DAILY CAP is arithmetic on them:
  // a blob carrying `findGems: "40"` (a hand-edited save, a half-written sync)
  // makes `FIND_DAILY_CAP - foundToday` NaN, NaN fails every comparison, and
  // the learner's gem balance is then NaN forever. A spread default cannot
  // catch that — the key IS present, it is just not a number.
  p.findGems = Number.isFinite(raw.findGems) ? Math.max(0, raw.findGems as number) : 0;
  // Same guard as findGems, same reason: the daily cap is arithmetic on this,
  // and a blob carrying `bugGems: "10"` would make every comparison NaN and the
  // balance NaN forever.
  p.bugGems = Number.isFinite(raw.bugGems) ? Math.max(0, raw.bugGems as number) : 0;
  p.bugDay = typeof raw.bugDay === "string" ? raw.bugDay : null;
  p.findDry = Number.isFinite(raw.findDry) ? Math.max(0, raw.findDry as number) : 0;
  p.prevWeekXp = Number.isFinite(raw.prevWeekXp) ? Math.max(0, raw.prevWeekXp as number) : 0;
  p.shields = Number.isFinite(raw.shields) ? Math.max(0, Math.min(SHIELD_MAX, raw.shields as number)) : 0;
  p.unlocks = Array.isArray(raw.unlocks) ? raw.unlocks.filter((u): u is string => typeof u === "string") : [];
  p.prevWeekKey = typeof raw.prevWeekKey === "string" ? raw.prevWeekKey : null;
  p.findDay = typeof raw.findDay === "string" ? raw.findDay : null;
  return p;
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  ensureRenumber3435();
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
  // Announce EVERY save, not just sync pull-merges (patch 22): the Home road
  // and unit HUDs listen for this event, so before this line an SIO write from
  // a lesson's end card never repainted the path until a full reload.
  try {
    window.dispatchEvent(new CustomEvent("fluolingo:progress-updated"));
  } catch {}
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

/** Pin (or re-pin) the goal — which outcome, by when. Passing null clears it.
 *  Persisted like any other progress field, so it syncs with the blob. */
export function setGoal(sio: string | null, by: string | null): Progress {
  const p = loadProgress();
  return saveProgress({ ...p, goal: sio ? { sio, by } : undefined });
}

/** Add XP for one action, scaled by today's fire multiplier.
 *
 *  Also fills the weekly bucket (rolling it over when the ISO week turns) and
 *  announces the award on `fluolingo:xp`, so the floating +XP can show the
 *  multiplier actually paying out. Before this, XP was earned on every right
 *  answer and shown nowhere at the time — the whole reason a streak is worth
 *  having was invisible (DOPAMINE_REVIEW §4). */
function addXp(p: Progress, base: number): Progress {
  const mult = xpMultiplier(p.streak);
  const paid = Math.round(base * mult);
  const wk = weekKey();
  const rolled = p.weekKey === wk ? (p.weekXp ?? 0) : 0;
  // When the week turns, last week's figure is STASHED, not dropped (7 Sep):
  // the board's "you vs last week" reads it back. An empty old bucket keeps
  // the earlier stash — a week of silence should not erase the last real one.
  const stash = p.weekKey !== wk && p.weekKey != null && (p.weekXp ?? 0) > 0;
  const prevWeekXp = stash ? (p.weekXp ?? 0) : (p.prevWeekXp ?? 0);
  const prevWeekKey = stash ? p.weekKey : (p.prevWeekKey ?? null);
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fluolingo:xp", { detail: { base, mult, paid } }));
    }
  } catch {
    /* the float is decoration; never let it break an award */
  }
  return { ...p, xp: p.xp + paid, weekXp: rolled + paid, weekKey: wk, prevWeekXp, prevWeekKey };
}

/** The two figures the board's self-strip compares (7 Sep). "Last week"
 *  means exactly the ADJACENT week: an older stash reads as 0, because a
 *  learner who earned nothing last week genuinely has a 0 to look at.
 *  Two candidates can hold last week's figure — the rollover stash, and a
 *  live bucket nothing has rolled yet (no XP earned this week) — so both
 *  are consulted. Pure, so a check can execute it. */
export function weekPair(p: Progress, wk: string = weekKey()): { thisWeek: number; lastWeek: number } {
  const thisWeek = p.weekKey === wk ? (p.weekXp ?? 0) : 0;
  const prev = previousWeek(wk);
  let lastWeek = p.prevWeekKey === prev ? (p.prevWeekXp ?? 0) : 0;
  if (p.weekKey === prev) lastWeek = Math.max(lastWeek, p.weekXp ?? 0);
  return { thisWeek, lastWeek };
}

/** Award any newly-earned badges (crediting their gem bounty), then persist.
 *  Emits a `fluolingo:reward` event per new badge and on a level-up so any
 *  mounted HUD can celebrate. Every earning path ends here. */
function finalize(p: Progress): Progress {
  const before = loadProgress(); // persisted state, pre-save
  const beforeXp = before.xp;
  const ctx = badgeContext(p);
  let gems = p.gems;
  // +20 gems per level-up (Dan, 7 Sep: "yes"). Diffed against the persisted
  // state so the bonus pays exactly once per rung, whichever earning path
  // crossed it; multiple rungs in one save (a big import) each pay.
  const levelsUp = levelForXp(p.xp).level - levelForXp(before.xp).level;
  if (levelsUp > 0) gems += LEVEL_UP_GEMS * levelsUp;
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
  // Every earning path funnels through here, so every celebration is decided
  // here too — by diffing the persisted state against the saved one. Before
  // this, `fluolingo:reward` fired on 2 of the 8 moments the app already
  // tracked: a level-up and a badge. Crossing into a x1.5 multiplier — the
  // single biggest improvement a learner can earn — showed nothing at all
  // (DOPAMINE_REVIEW §5).
  //
  // `size` is what stops this becoming noise. If every moment gets confetti,
  // none of them mean anything, so the ladder runs chime -> small -> big ->
  // full and only a finished unit gets the fanfare.
  try {
    if (typeof window !== "undefined") {
      const fire = (detail: RewardDetail) =>
        window.dispatchEvent(new CustomEvent("fluolingo:reward", { detail }));

      if (levelForXp(saved.xp).level > levelForXp(beforeXp).level) {
        fire({ type: "level", size: "big", level: levelForXp(saved.xp).level });
      }
      for (const id of fresh) fire({ type: "badge", size: "big", id });

      // The Streak-Freezer held: shields went DOWN while the chain went on — say
      // so, the morning after, as a win ("day N — the chain held"). This is
      // the only moment the shield is ever mentioned around a missed day.
      if ((before.shields ?? 0) > (saved.shields ?? 0) && saved.streak > before.streak) {
        fire({ type: "shield", size: "small", streak: saved.streak });
      }

      // The streak, and the multiplier tier it may have just unlocked.
      if (saved.streak > before.streak) {
        const was = xpMultiplier(before.streak);
        const now = xpMultiplier(saved.streak);
        fire({ type: "streak", size: "small", streak: saved.streak, mult: now });
        if (now > was) fire({ type: "multiplier", size: "big", mult: now, streak: saved.streak });
      }

      // A finished objective — and, if it was the last of its unit, the unit.
      const freshSio = saved.doneSios.find((id) => !before.doneSios.includes(id));
      if (freshSio) {
        fire({ type: "sio", size: "small", id: freshSio });
        const unit = SIOS.find((s) => s.id === freshSio)?.unit;
        if (unit != null) {
          const inUnit = SIOS.filter((s) => s.unit === unit);
          if (inUnit.length > 0 && inUnit.every((s) => saved.doneSios.includes(s.id))) {
            fire({ type: "unit", size: "full", unit, count: inUnit.length });
          }
        }
      }

      // A word that has just climbed onto the spacing ladder for the first time.
      const mastered = (q: Progress) =>
        Object.values(q.itemSrs).filter((s) => s.intervalDays > 0).length;
      const gained = mastered(saved) - mastered(before);
      if (gained > 0) fire({ type: "mastery", size: "chime", count: gained });
    }
  } catch {
    /* celebration is best-effort */
  }
  return saved;
}

function bumpStreakToday(p: Progress): Progress {
  const today = dayKey();
  if (p.lastActiveDay === today) return p;
  const step = nextStreak(p.lastActiveDay, p.streak, p.shields ?? 0, today);
  return { ...p, streak: step.streak, shields: step.shields, lastActiveDay: today, timeZone: learnerZone() };
}

/** The streak decision, PURE so verify116 can execute it (the verify109
 *  pattern). Consecutive day → +1. Exactly ONE missed day with a Streak-Freezer in
 *  hand → the shield spends itself and the chain holds (+1); the learner is
 *  told the morning after, gain-framed, via the shield toast — never warned
 *  before. Two or more missed days → the chain restarts at 1 and the shield
 *  is NOT spent: it protects a single slip, and burning it on a gap it
 *  cannot bridge would be paying for nothing. */
export function nextStreak(
  lastActiveDay: string | null,
  streak: number,
  shields: number,
  today: string,
): { streak: number; shields: number } {
  if (lastActiveDay === previousDay(today)) return { streak: streak + 1, shields };
  if (shields > 0 && lastActiveDay === previousDay(previousDay(today)))
    return { streak: streak + 1, shields: shields - 1 };
  return { streak: 1, shields };
}

/**
 * "Showing up counts": mark today practised, nothing else. For the graded
 * surfaces that deliberately stay OUTSIDE recordItemResult — MCQ never feeds
 * the SRS, so its answers wrote only the evidence trail and the learner's
 * streak never moved on it (Dan, 2026-09-02: "the streaks are not working
 * yet?" — driven and confirmed: an MCQ answer left progress untouched).
 * No XP and no SRS step here, so those decisions stay where they are; the
 * finalize() funnel still runs so the bump saves, announces itself, and can
 * fire the streak/multiplier celebrations like every other earning path.
 */
export function notePracticeDay(): Progress {
  return finalize(bumpStreakToday(loadProgress()));
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

/** NO ACTIVITY PAYS NOTHING, AND ONLY IMPROVEMENT PAYS TWICE (Dan, 13 Sep:
 *  *"if there were any activity that comes with 0 XP and 0 anything, then
 *  nobody will ever be motivated to touch them"*, and *"there is nothing wrong
 *  with letting someone farm an afternoon if they are successful in improving
 *  their scores each time (we will not reward worser scores)"*).
 *
 *  Call it when a run ENDS, with whatever that activity counts as a score —
 *  words sorted, rounds won, cards right. It pays on the first finish and on
 *  every personal best after it, and pays nothing for a worse run, so an
 *  afternoon of play is worth exactly as much as it improves you.
 *
 *  `score` of null means "this activity is not scored" (SpecuLearn): the first
 *  finish pays and later ones do not, because scoring a cold guess would make
 *  the profitable move taking it AFTER the lesson.
 *
 *  Returns the XP paid, so a caller can show it; 0 means the run did not beat
 *  the stored best. The streak bumps on any finish — showing up counts, which
 *  is the rule everywhere else in this file. */
/**
 * Pay a learner for filing a bug report (Dan, 2026-09-14). Returns the gems
 * paid — 0 when today's cap is already spent, which the caller shows rather
 * than hiding.
 *
 * THE OTHER 66% IS NOT PAID HERE, and this is what it would take. Dan decides
 * which bugs are major, so the payment has to travel from his judgement to the
 * learner's browser, and today there is no road: `feedback` documents are
 * admin-read-only in firestore.rules, so a learner cannot see their own report,
 * let alone a verdict on it. The smallest honest version is
 *
 *     rules   allow read: if isAdmin() || (isSignedIn() && resource.data.uid == request.auth.uid)
 *     teacher a « major » tick on the feedback triage row, writing { major: true }
 *     client  on sign-in, read your own feedback docs, pay BUG_BOUNTY_MAJOR for
 *             each one marked major that you have not already been paid for
 *             (the ids go in a `bugPaid` list, exactly like `badges`)
 *
 * That needs a rules deploy, which is a hand action in the Firebase console, so
 * it is deliberately NOT half-built here. Nothing in the app tells a learner a
 * second payment is coming — the surprise stays a surprise, and an unkept
 * promise is not made in the meantime.
 */
export function awardBugReport(): number {
  const p0 = loadProgress();
  const today = dayKey();
  const sameDay = p0.bugDay === today;
  const spent = sameDay ? (p0.bugGems ?? 0) : 0;
  const room = BUG_BOUNTY_DAILY_CAP - spent;
  if (room <= 0) return 0;
  const pay = Math.min(BUG_BOUNTY_ON_REPORT, room);
  finalize({ ...p0, gems: p0.gems + pay, bugDay: today, bugGems: spent + pay });
  return pay;
}

export function awardActivityRun(activity: string, goal: string | null, score: number | null): number {
  const key = `${activity}:${goal ?? "-"}`;
  const p0 = loadProgress();
  const bests = p0.bests ?? {};
  const seen = Object.prototype.hasOwnProperty.call(bests, key);
  const best = bests[key] ?? 0;

  // First finish always pays. After that, only a strictly better score does —
  // and an unscored activity has no "better", so it pays once and no more.
  const first = !seen;
  const beat = seen && score !== null && score > best;
  if (!first && !beat) {
    // Still a day of practice, even when it pays nothing.
    finalize(bumpStreakToday(p0));
    return 0;
  }

  const base = first ? XP_ACTIVITY_FIRST : XP_ACTIVITY_BEST;
  const next = { ...p0, bests: { ...bests, [key]: Math.max(best, score ?? 0) } };
  const before = next.xp;
  const after = finalize(addXp(bumpStreakToday(next), base));
  return after.xp - before;
}

/** Buy a cosmetic with gems and equip it (idempotent; no-op if owned already or
 *  the balance is short). The only thing gems ever buy — never learning. */
/** Buy a Streak-Freezer IN ADVANCE (never offered after a miss). Caps at
 *  SHIELD_MAX; a no-op returns state unchanged rather than erroring. */
export function buyShield(): Progress {
  const p = loadProgress();
  if ((p.shields ?? 0) >= SHIELD_MAX || p.gems < SHIELD_COST) return p;
  return finalize({ ...p, gems: p.gems - SHIELD_COST, shields: (p.shields ?? 0) + 1 });
}

/** Buy an expert-GAME unlock (EXPERT_UNLOCKS — games only, never the spine). */
export function buyUnlock(id: string): Progress {
  const p = loadProgress();
  const def = EXPERT_UNLOCKS.find((u) => u.id === id);
  if (!def || (p.unlocks ?? []).includes(id) || p.gems < def.cost) return p;
  return finalize({ ...p, gems: p.gems - def.cost, unlocks: [...(p.unlocks ?? []), id] });
}

export function hasUnlock(p: Progress, id: string): boolean {
  return (p.unlocks ?? []).includes(id);
}

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

/**
 * Un-tick a stop. NOTHING CALLS THIS since the Mark-as-done button was deleted
 * on 2026-08-31 and done-ness became derived — kept because the reset path and
 * a future teacher correction are the obvious callers, and because deleting it
 * would take the only way back from a wrong tick with it.
 *
 * It is NOT part of the derived rule: that rule only ever adds (grandfathering
 * is exactly this — nothing un-ticks on its own).
 */
export function unmarkSioDone(id: string): Progress {
  const p = loadProgress();
  return saveProgress({ ...p, doneSios: p.doneSios.filter((x) => x !== id) });
}

// ladder: correct → 1d → 3d → 7d → 14d (cap); miss resets to 0 (due now)
const SRS_LADDER_DAYS = [1, 3, 7, 14];
const DAY_MS = 86_400_000;

/** Today's find books, rolled forward if the day has turned. `findGems` starts
 *  the new day at zero (the cap is daily); `findDry` carries over (the pity
 *  floor is about a run of bad luck, not about midnight). */
function findBooks(p: Progress): { findDay: string; findGems: number; findDry: number } {
  const today = dayKey();
  return {
    findDay: today,
    findGems: p.findDay === today ? (p.findGems ?? 0) : 0,
    findDry: p.findDry ?? 0,
  };
}

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
export function recordItemResult(
  itemId: string,
  correct: boolean,
  given?: string,
  activity?: string,
  /** How the answer was produced (PRD §7). Omit and the record still
   *  stores, just without evidence meaning — adoption is incremental. */
  ev?: {
    hintsTaken?: number; revealed?: boolean; latencyMs?: number; assistance?: AssistanceLevel;
    /** FALSE for a re-attempt on an item already answered in this run — the
     *  response is still recorded (the evidence trail wants every attempt),
     *  but it pays nothing. See the XP note below. */
    award?: boolean;
  },
): Progress {
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
  // ONE PAYMENT PER ITEM PER RUN (Dan, 2026-08-27: "getting it wrong earns you
  // points … guessing first and correcting earns 80, while getting it right
  // immediately earns only 60. The app pays you more for not knowing.")
  //
  // He was exactly right: the help ladder calls this on EVERY attempt, so a
  // wrong answer paid XP_WRONG and the correction then paid XP_CORRECT on top.
  // The fix is not to stop paying for errors — effort counting is the settled
  // rule, and hearts are on the refused list — it is to pay ONCE. The first
  // attempt on an item is what pays; a re-attempt after it records the answer
  // and steps the SRS, but earns nothing further. So:
  //     right first time            60
  //     wrong, then right           20
  //     wrong, wrong, then right    20
  // Knowing it always beats guessing at it, and trying still beats not trying.
  const award = ev?.award !== false;
  const paid = award ? Math.round((correct ? XP_CORRECT : XP_WRONG) * xpMultiplier(p.streak)) : 0;
  // THE LUCKY FIND (Dan, 6 Sep: "Craving — add surprise"). It rides the SAME
  // `award` gate as the XP, which is what keeps it honest: the gate already
  // means "this is the first attempt on this item in this run", so a learner
  // cannot answer, undo and answer again to fish for a drop. A wrong answer
  // can find gems too — effort counts here, and a find that only ever followed
  // a right answer would just be XP wearing a costume.
  //
  // The seed is (item, day), never Math.random: the same answer on the same
  // day always has the same outcome, so a reload cannot reroll it.
  const books = findBooks(p);
  const find = award ? luckyFind(`${itemId}:${books.findDay}`, books.findDry, books.findGems) : 0;
  const found = {
    ...books,
    findGems: books.findGems + find,
    findDry: find > 0 ? 0 : books.findDry + (award ? 1 : 0),
  };
  void import("@/lib/firebase/responses")
    .then((m) =>
      m.recordResponse(itemId, correct, {
        given,
        xpPaid: paid,
        activity,
        latencyMs: ev?.latencyMs,
        evidence: buildEvidence(itemId, activity, {
          hintsTaken: ev?.hintsTaken,
          revealed: ev?.revealed,
          assistance: ev?.assistance,
        }),
      }),
    )
    .catch(() => {});
  // Announced BEFORE finalize, so a level-up or a badge earned by the same
  // answer lands after it and takes the banner. A find is the smallest thing
  // that can happen on an answer; it must never cover the biggest.
  if (find > 0) {
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fluolingo:reward", {
            detail: { type: "find", size: find >= FIND_BIG ? "big" : "small", gems: find } as RewardDetail,
          }),
        );
      }
    } catch {
      /* the banner is decoration; never let it break an award */
    }
  }
  const withFind = { ...p, ...found, gems: p.gems + find };
  return finalize(award ? addXp(withFind, correct ? XP_CORRECT : XP_WRONG) : withFind);
}

/**
 * Put items into the review queue NOW (patch 23 — the game-over post-mortem's
 * CORRIGER MAINTENANT). Each item's ladder drops to the "due immediately"
 * rung, which is exactly what `dueForReview` reads — so the ReVue page shows
 * them the moment it opens. Deliberately NOT recordItemResult: the game has
 * already graded and paid the attempt (evidence + XP) when the miss happened;
 * queueing it again must not write a second wrong answer or a second receipt.
 * Unknown ids (a spoken number with no curated item) are skipped by the
 * caller — this writes whatever it is given.
 */
export function queueForReview(itemIds: string[]): Progress {
  const prev = loadProgress();
  if (itemIds.length === 0) return prev;
  const now = Date.now();
  const itemSrs = { ...prev.itemSrs };
  for (const id of itemIds) itemSrs[id] = { due: now, intervalDays: 0 };
  return saveProgress({ ...prev, itemSrs });
}

/** True if the item was never practiced or its interval has elapsed — the Reviser's bias signal. */
export function isItemDue(itemId: string, p: Progress, now: number): boolean {
  const s = p.itemSrs[itemId];
  return !s || s.due <= now;
}
