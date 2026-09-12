"use client";
/**
 * THRILLS — the whole economy, inside one collapsed row.
 *
 * This is what is LEFT of /profil after the 2026-08-22 merge. The level ring,
 * the XP bar and the badge grid used to be the top of a page of their own; Dan
 * demoted the lot to a strip ("gamification: keep, visibly demoted"), and then
 * dropped N-levels outright ("we don't need levels lah"). What survives is
 * what a learner can act on: the badges they have and have not earned, and the
 * gem balance with the only thing it buys.
 *
 * [7 Sep: the rank NAMES are gone app-wide — level is a bare 0-4 number
 * now. The sentence below is kept for the 22 Aug story it tells.]
 * The ranks themselves are NOT gone from the app — `levelForXp` still names
 * rows on the leaderboard. They are gone from the profile.
 *
 * Nothing here gates LEARNING: gems buy colours, the Bouclier, and expert
 * GAME decks (Dan, 7 Sep) — never a goal, lesson, drill or revision
 * ("nothing is locked", progress.ts).
 */
import {buyShield, buyUnlock, type Progress } from "@/lib/progress";
import { BADGES, EXPERT_UNLOCKS, SHIELD_COST, SHIELD_MAX } from "@/lib/economy";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function Rewards({ p, onChange }: { p: Progress; onChange: (p: Progress) => void }) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* EARNED BADGES ONLY (Dan, 2026-09-12: "don't show the items that are
          not yet achieved"). They used to show as a set with holes — every
          badge at the same size, the unearned ones greyed with their price.
          That is a catalogue of what you have not done, on the page a learner
          opens to see what they have. */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {BADGES.filter((b) => p.badges.includes(b.id)).map((b) => {
          const has = true;
          return (
            <div
              key={b.id}
              title={`${b.label} — ${b.desc}`}
              className="flex flex-col items-center gap-0.5 rounded-lg border-2 px-1 py-2 text-center"
              style={{ borderColor: has ? INK : LINE, background: PAPER, opacity: has ? 1 : 0.55 }}
            >
              <span aria-hidden className={`text-lg leading-none ${has ? "" : "grayscale"}`}>{b.icon}</span>
              <span className="fluo-mono truncate text-[9px] font-black leading-tight" style={{ color: INK }}>{b.label}</span>
              <span className="fluo-mono text-[9px] font-bold leading-none" style={{ color: SOFT }}>{has ? "✓" : `💎${b.gems}`}</span>
            </div>
          );
        })}
      </div>

      {/* THE COLOURS MOVED TO SETTINGS (Dan, 2026-09-12: "As for the
          'payable' colors, move them into Settings instead") — see
          components/AccentColours.tsx. The gem balance stays here because the
          Bouclier and the expert decks below are still priced in gems, and a
          price with no balance beside it cannot be weighed. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="fluo-mono rounded-md border-2 px-2 py-1.5 text-[12px] font-bold" style={{ borderColor: LINE, color: INK }}>
          💎 {p.gems}
        </span>
      </div>

      {/* The utility shelf (Dan's 7 Sep rulings): the Bouclier and the expert
          game decks. Two columns, per the no-full-width rule. The shield's
          copy never mentions what a miss costs — it is protection bought on a
          good day, spent silently, celebrated the morning after. */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          disabled={(p.shields ?? 0) >= SHIELD_MAX || p.gems < SHIELD_COST}
          onClick={() => onChange(buyShield())}
          title={(p.shields ?? 0) >= SHIELD_MAX
            ? `Bouclier — holding ${p.shields}/${SHIELD_MAX}, the pouch is full`
            : `Bouclier — 💎 ${SHIELD_COST}. Held in advance; one missed day spends it and the chain holds`}
          className="flex items-center justify-between rounded-lg border-2 px-2.5 py-2 text-left text-[12px] font-bold disabled:opacity-55"
          style={{ borderColor: LINE, background: PAPER, color: INK }}
        >
          <span>🛡️ Bouclier {(p.shields ?? 0) > 0 && <b>×{p.shields}</b>}</span>
          <span className="fluo-mono text-[11px]" style={{ color: SOFT }}>
            {(p.shields ?? 0) >= SHIELD_MAX ? "✓ full" : `💎${SHIELD_COST}`}
          </span>
        </button>
        {EXPERT_UNLOCKS.map((u) => {
          const owned = (p.unlocks ?? []).includes(u.id);
          return (
            <button
              key={u.id}
              type="button"
              disabled={owned || p.gems < u.cost}
              onClick={() => onChange(buyUnlock(u.id))}
              title={owned ? `${u.label} — unlocked, find it in the games` : `${u.label} — an expert game deck, 💎 ${u.cost}`}
              className="flex items-center justify-between rounded-lg border-2 px-2.5 py-2 text-left text-[12px] font-bold disabled:opacity-55"
              style={{ borderColor: LINE, background: PAPER, color: INK }}
            >
              <span>{u.emoji} {u.label}</span>
              <span className="fluo-mono text-[11px]" style={{ color: SOFT }}>{owned ? "✓" : `💎${u.cost}`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** One accent colour: the swatch IS the affordance, the state is the border. */
