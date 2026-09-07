/**
 * The reward economy — ONE earning event feeds everything (Dan, 2026-07-06:
 * "there is no link between gems, fire, XP, leaderboard, badges, tokens,
 * levels"). This module holds the PURE definitions and functions; the
 * mutations that write them live in progress.ts (which imports from here).
 *
 * The model, deliberately just two quantities so an A1 beginner isn't juggling
 * six currencies:
 *
 *   ⭐ XP    — lifetime score. Every learning action earns it, MULTIPLIED by
 *             the 🔥 fire streak. Drives Levels and the leaderboard. Never
 *             spent. (Absorbs the old "gems == XP" conflation, plus tokens /
 *             points / score.)
 *   💎 Gems  — a SPENDABLE balance, paid out by badges/milestones and spent in
 *             the cosmetic locker (home accent colour). Never gates learning —
 *             "nothing is locked" (progress.ts) is a hard rule, so cosmetics
 *             are the only thing gems buy.
 *   🔥 Fire  — the streak, a live XP multiplier (×1 → ×1.5 → ×2 → ×2.5 → ×3).
 *   🎖️ Badges — milestone achievements, auto-awarded from signals we already
 *             track (SIOs done, streak, items mastered, level). Each pays gems.
 *   🎚️ Levels — XP thresholds with French rank names. Cosmetic status only.
 *
 * One flow: action → XP ×fire → level & leaderboard; milestones → badges →
 * gems → cosmetics.
 */
import type { Progress } from "@/lib/progress";

// ── XP earning amounts ──────────────────────────────────────────────────────
// Scale (Dan, 2026-07-07): ×20 vs the first pass, so new work is commensurate
// with the XP carried over from the old platform (totals in the thousands —
// donny ~22k, Jordan ~26k). The level curve below is scaled by the same ×20,
// so level pacing for a fresh learner is IDENTICAL; only the numbers are
// bigger, and a returning student's ranking is no longer frozen.
export const XP_CORRECT = 60; // a right practice answer
export const XP_WRONG = 20; // a wrong one — effort still counts, never punished
export const XP_SIO_BASE = 300; // completing a SIO
export const XP_SIO_MASTERY = 300; // + up to this, scaled by demonstrated mastery
export const XP_CONVERSATION = 120; // finishing an AI role-play

// THE LADDER, one place (Dan, 2026-09-07 — from the retention read: the old
// ladder stopped at day 7, so day 40 paid exactly what day 7 paid and the
// video's point about compounding was being left on the table). Day 30 agrees
// with the « Inarrêtable » badge on purpose: the ladder's top rung and the
// streak's top badge are the same day, so the two systems tell one story.
// GAIN-FRAMED ONLY: every surface that names a rung says what the next day
// PAYS, never what a missed day costs — verify32 greps the loss words out.
const FIRE_LADDER = [
  { day: 3, mult: 1.5 },
  { day: 7, mult: 2 },
  { day: 14, mult: 2.5 },
  { day: 30, mult: 3 },
] as const;

/** Fire streak → XP multiplier. Showing up for days in a row earns faster. */
export function xpMultiplier(streak: number): number {
  let mult = 1;
  for (const rung of FIRE_LADDER) if (streak >= rung.day) mult = rung.mult;
  return mult;
}

/** The next rung above `streak`, so the multiplier can say what it is worth
 *  keeping on for — or null from the top rung up, where the ladder is done
 *  climbing and the fire simply burns at full strength. */
export function nextFireMilestone(streak: number): { day: number; mult: number } | null {
  return FIRE_LADDER.find((rung) => streak < rung.day) ?? null;
}

// ── Levels ──────────────────────────────────────────────────────────────────
// French rank names; beyond the list, "Maître · N" keeps climbing.
const RANKS = [
  "Débutant",
  "Apprenti",
  "Explorateur",
  "Voyageur",
  "Bavard",
  "Complice",
  "Éloquent",
  "Virtuose",
  "Érudit",
  "Maître",
] as const;

export type LevelInfo = {
  level: number;
  name: string;
  into: number; // XP earned into the current level
  span: number; // XP the current level spans
  floor: number; // cumulative XP at the start of this level
};

/** Cost to climb from `level` to the next — a gentle ramp (×20 with the
 *  award scale above, so pacing is unchanged). */
function levelCost(level: number): number {
  return 600 * level + 400; // L1→2: 1000, L2→3: 1600, L3→4: 2200, …
}

export function levelForXp(xp: number): LevelInfo {
  const x = Math.max(0, Math.floor(xp || 0));
  let level = 1;
  let floor = 0;
  let cost = levelCost(1);
  while (x >= floor + cost) {
    floor += cost;
    level += 1;
    cost = levelCost(level);
  }
  const name = level <= RANKS.length ? RANKS[level - 1] : `${RANKS[RANKS.length - 1]} · ${level}`;
  return { level, name, into: x - floor, span: cost, floor };
}

// ── Badges ──────────────────────────────────────────────────────────────────
// Every badge is derivable from state we ALREADY track — no new telemetry.
// `gems` is the bounty paid the first time it's earned.
export type BadgeDef = {
  id: string;
  icon: string;
  label: string;
  desc: string;
  gems: number;
  earned: (p: Progress, ctx: BadgeCtx) => boolean;
};

/** Cheap derived numbers the badge predicates lean on. */
export type BadgeCtx = { mastered: number; level: number };

export function badgeContext(p: Progress): BadgeCtx {
  const mastered = Object.values(p.itemSrs).filter((s) => s.intervalDays > 0).length;
  return { mastered, level: levelForXp(p.xp).level };
}

export const BADGES: BadgeDef[] = [
  { id: "premier-pas", icon: "🎉", label: "Premier pas", desc: "Finish your first SIO", gems: 5, earned: (p) => p.doneSios.length >= 1 },
  { id: "en-route", icon: "🧭", label: "En route", desc: "Finish 10 SIOs", gems: 10, earned: (p) => p.doneSios.length >= 10 },
  { id: "a-mi-chemin", icon: "🏔️", label: "À mi-chemin", desc: "Finish 25 SIOs", gems: 20, earned: (p) => p.doneSios.length >= 25 },
  { id: "diplome", icon: "🎓", label: "Diplômé", desc: "Finish 50 SIOs", gems: 50, earned: (p) => p.doneSios.length >= 50 },
  { id: "assidu-3", icon: "🔥", label: "Assidu", desc: "3-day streak", gems: 5, earned: (p) => p.streak >= 3 },
  { id: "en-feu", icon: "🔥", label: "En feu", desc: "7-day streak", gems: 10, earned: (p) => p.streak >= 7 },
  { id: "inarretable", icon: "🌟", label: "Inarrêtable", desc: "30-day streak", gems: 30, earned: (p) => p.streak >= 30 },
  { id: "collectionneur", icon: "📚", label: "Collectionneur", desc: "Master 50 words", gems: 15, earned: (_p, c) => c.mastered >= 50 },
  // "Savant", not "Érudit" — Érudit is the N9 RANK name; a badge sharing it
  // read as the same thing (Dan, 2026-07-08). Ids stay stable (already earned).
  { id: "erudit", icon: "🦉", label: "Savant", desc: "Master 200 words", gems: 30, earned: (_p, c) => c.mastered >= 200 },
  // The level badges carry their RANK names so the two systems visibly agree.
  { id: "niveau-5", icon: "🎚️", label: "Bavard", desc: "Reach level 5 · Bavard", gems: 10, earned: (_p, c) => c.level >= 5 },
  { id: "niveau-10", icon: "👑", label: "Maître", desc: "Reach level 10 · Maître", gems: 25, earned: (_p, c) => c.level >= 10 },
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

// ── Cosmetics (the only thing gems buy — never learning content) ────────────
export type Cosmetic = { id: string; slot: "homeAccent"; label: string; cost: number; swatch: string };

// The default home accent (matches the current hero red) is always owned & free.
export const DEFAULT_ACCENT = "#e0384e";

export const COSMETICS: Cosmetic[] = [
  { id: "accent-rose", slot: "homeAccent", label: "Rose", cost: 20, swatch: "#e0567f" },
  { id: "accent-teal", slot: "homeAccent", label: "Turquoise", cost: 20, swatch: "#2bb6c2" },
  { id: "accent-violet", slot: "homeAccent", label: "Violet", cost: 30, swatch: "#8a5fd4" },
  { id: "accent-emerald", slot: "homeAccent", label: "Émeraude", cost: 30, swatch: "#2f9e56" },
  { id: "accent-gold", slot: "homeAccent", label: "Or", cost: 50, swatch: "#c8a24b" },
];

export function cosmeticById(id: string): Cosmetic | undefined {
  return COSMETICS.find((c) => c.id === id);
}

/** The resolved home accent colour for the equipped cosmetic (or the default). */
export function equippedAccent(p: Progress): string {
  const id = p.cosmetics?.equipped?.homeAccent;
  return (id && cosmeticById(id)?.swatch) || DEFAULT_ACCENT;
}

// ── The lucky find ──────────────────────────────────────────────────────────
// Dan, 6 Sep, after a breakdown of variable-ratio reward: "Craving — add
// surprise". The economy above is entirely predictable — 60 for a right
// answer, 20 for a wrong one, 300 for a SIO, badges at 1/10/25/50 — so nothing
// in the app has ever been able to surprise a learner.
//
// WHY THE FIND PAYS GEMS AND NOT XP, which is the one real decision here. XP
// drives the level, the rank and the leaderboard, and this file's own rule is
// that a receipt states the EXACT amount an answer pays. Random XP breaks
// both: a rank stops meaning work done, and an honest receipt becomes
// impossible. Gems buy cosmetics and gate nothing (`buyCosmetic`: "the only
// thing gems ever buy — never learning"), so a random gem changes what a
// learner FEELS without touching what their score MEANS.
//
// FOUR GUARDS, because unguarded variable reward is a slot machine:
//
//   SEEDED, NOT ROLLED. The outcome is a hash of (item, day), so re-answering
//   the same item cannot reroll it. Without this a learner can fish for drops
//   by repeating one card, which turns craving into grinding — and the SRS
//   would quietly record all that repetition as study.
//
//   A PITY FLOOR. A find is guaranteed by the FIND_PITY-th dry answer. The
//   surprise is in WHEN, never in WHETHER, so a bad run cannot feel like the
//   app has stopped noticing you.
//
//   A DAILY CAP. Finds stop paying past FIND_DAILY_CAP gems a day, so the
//   loop cannot become the reason to practise.
//
//   NEVER NEGATIVE. There is no bad outcome, no loss, no near-miss. Hearts
//   were removed from this app for punishing errors; a find that could take
//   something away would walk that back in a new costume.
export const FIND_ODDS = 0.12;      // ~1 answer in 8
export const FIND_SMALL = 2;        // gems
export const FIND_BIG = 10;         // gems, the rarer one
export const FIND_BIG_SHARE = 0.08; // of finds, not of answers
export const FIND_PITY = 12;        // dry answers before one is guaranteed
export const FIND_DAILY_CAP = 40;   // gems from finds per learner per day

/** A small, stable hash → [0, 1). Same string, same number, every time and on
 *  every device: the find must not depend on Math.random, or a reload rerolls
 *  it and the seeding guard above is worthless. */
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Gems this answer finds, if any.
 *
 * @param seed      stable per answer — item id + day. NOT random.
 * @param dry       paying answers since the last find.
 * @param foundToday gems already found today, for the cap.
 */
export function luckyFind(seed: string, dry: number, foundToday: number): number {
  const room = FIND_DAILY_CAP - Math.max(0, foundToday);
  if (room <= 0) return 0;
  const hit = hash01(seed) < FIND_ODDS || dry + 1 >= FIND_PITY;
  if (!hit) return 0;
  const size = hash01(`${seed}:size`) < FIND_BIG_SHARE ? FIND_BIG : FIND_SMALL;
  return Math.min(size, room);
}
