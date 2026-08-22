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
 * The ranks themselves are NOT gone from the app — `levelForXp` still names
 * rows on the leaderboard. They are gone from the profile.
 *
 * Nothing here gates learning: gems buy a home accent colour and nothing else
 * ("nothing is locked", progress.ts).
 */
import { buyCosmetic, equipCosmetic, type Progress } from "@/lib/progress";
import { BADGES, COSMETICS, DEFAULT_ACCENT } from "@/lib/economy";

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
      className="flex min-h-[40px] items-center gap-1.5 rounded-md border-2 px-2 py-1 disabled:cursor-default"
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
