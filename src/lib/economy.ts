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
 *   🔥 Fire  — the streak, now a live XP multiplier (×1 → ×1.5 → ×2).
 *   🎖️ Badges — milestone achievements, auto-awarded from signals we already
 *             track (SIOs done, streak, items mastered, level). Each pays gems.
 *   🎚️ Levels — XP thresholds with French rank names. Cosmetic status only.
 *
 * One flow: action → XP ×fire → level & leaderboard; milestones → badges →
 * gems → cosmetics.
 */
import type { Progress } from "@/lib/progress";

// ── XP earning amounts ──────────────────────────────────────────────────────
export const XP_CORRECT = 3; // a right practice answer
export const XP_WRONG = 1; // a wrong one — effort still counts, never punished
export const XP_SIO_BASE = 15; // completing a SIO
export const XP_SIO_MASTERY = 15; // + up to this, scaled by demonstrated mastery
export const XP_CONVERSATION = 6; // finishing an AI role-play

/** Fire streak → XP multiplier. Showing up for days in a row earns faster. */
export function xpMultiplier(streak: number): number {
  if (streak >= 7) return 2;
  if (streak >= 3) return 1.5;
  return 1;
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

/** Cost to climb from `level` to the next — a gentle ramp. */
function levelCost(level: number): number {
  return 30 * level + 20; // L1→2: 50, L2→3: 80, L3→4: 110, …
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
  { id: "premier-pas", icon: "🎉", label: "Premier pas", desc: "Finir votre première SIO", gems: 5, earned: (p) => p.doneSios.length >= 1 },
  { id: "en-route", icon: "🧭", label: "En route", desc: "Finir 10 SIO", gems: 10, earned: (p) => p.doneSios.length >= 10 },
  { id: "a-mi-chemin", icon: "🏔️", label: "À mi-chemin", desc: "Finir 25 SIO", gems: 20, earned: (p) => p.doneSios.length >= 25 },
  { id: "diplome", icon: "🎓", label: "Diplômé", desc: "Finir 50 SIO", gems: 50, earned: (p) => p.doneSios.length >= 50 },
  { id: "assidu-3", icon: "🔥", label: "Assidu", desc: "Série de 3 jours", gems: 5, earned: (p) => p.streak >= 3 },
  { id: "en-feu", icon: "🔥", label: "En feu", desc: "Série de 7 jours", gems: 10, earned: (p) => p.streak >= 7 },
  { id: "inarretable", icon: "🌟", label: "Inarrêtable", desc: "Série de 30 jours", gems: 30, earned: (p) => p.streak >= 30 },
  { id: "collectionneur", icon: "📚", label: "Collectionneur", desc: "Maîtriser 50 mots", gems: 15, earned: (_p, c) => c.mastered >= 50 },
  { id: "erudit", icon: "🦉", label: "Érudit", desc: "Maîtriser 200 mots", gems: 30, earned: (_p, c) => c.mastered >= 200 },
  { id: "niveau-5", icon: "🎚️", label: "Niveau 5", desc: "Atteindre le niveau 5", gems: 10, earned: (_p, c) => c.level >= 5 },
  { id: "niveau-10", icon: "👑", label: "Niveau 10", desc: "Atteindre le niveau 10", gems: 25, earned: (_p, c) => c.level >= 10 },
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
