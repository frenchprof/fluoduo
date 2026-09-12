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
import { buyCosmetic, buyShield, buyUnlock, equipCosmetic, type Progress } from "@/lib/progress";
import { BADGES, COSMETICS, DEFAULT_ACCENT, EXPERT_UNLOCKS, SHIELD_COST, SHIELD_MAX } from "@/lib/economy";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function Rewards({ p, onChange }: { p: Progress; onChange: (p: Progress) => void }) {
  const equipped = p.cosmetics.equipped.homeAccent ?? null;
  return (
    <div className="flex flex-col gap-3.5">
      {/* Badges — earned ones in ink, the rest greyed at the same size, so the
          collection reads as a set with holes rather than a list of locks. */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {BADGES.map((b) => {
          const has = p.badges.includes(b.id);
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

      {/* The gem balance and the one thing it buys. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="fluo-mono rounded-md border-2 px-2 py-1.5 text-[12px] font-bold" style={{ borderColor: LINE, color: INK }}>
          💎 {p.gems}
        </span>
        <SwatchButton
          swatch={DEFAULT_ACCENT}
          label="Default"
          state={equipped === null ? "equipped" : "owned"}
          onClick={() => onChange(equipCosmetic(null))}
        />
        {COSMETICS.map((c) => {
          const owned = p.cosmetics.owned.includes(c.id);
          const state = equipped === c.id ? "equipped" : owned ? "owned" : p.gems >= c.cost ? "buyable" : "locked";
          return (
            <SwatchButton
              key={c.id}
              swatch={c.swatch}
              label={c.label}
              cost={owned ? undefined : c.cost}
              state={state}
              onClick={() => onChange(owned ? equipCosmetic(c.id) : buyCosmetic(c.id))}
            />
          );
        })}
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
function SwatchButton({
  swatch, label, cost, state, onClick,
}: {
  swatch: string;
  label: string;
  cost?: number;
  state: "equipped" | "owned" | "buyable" | "locked";
  onClick: () => void;
}) {
  const title = state === "equipped" ? `${label} — equipped`
    : state === "locked" ? `${label} — 💎 ${cost}, not enough gems`
    : state === "buyable" ? `${label} — buy for 💎 ${cost}`
    : `${label} — equip`;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "locked" || state === "equipped"}
      aria-label={title}
      title={title}
      className="flex fluo-tap items-center gap-1.5 rounded-md border-2 px-2 py-1 disabled:cursor-default"
      style={{
        borderColor: state === "equipped" ? INK : LINE,
        background: PAPER,
        opacity: state === "locked" ? 0.45 : 1,
      }}
    >
      <span aria-hidden className="h-4 w-4 shrink-0 rounded-full border-2" style={{ background: swatch, borderColor: INK }} />
      {cost !== undefined && <span className="fluo-mono text-[10px] font-bold" style={{ color: SOFT }}>💎{cost}</span>}
      {state === "equipped" && <span aria-hidden className="fluo-mono text-[10px] font-black" style={{ color: INK }}>✓</span>}
    </button>
  );
}
