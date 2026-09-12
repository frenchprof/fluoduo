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
 * Nothing here gates LEARNING: gems buy colours, the Streak-Freezer, and expert
 * GAME decks (Dan, 7 Sep) — never a goal, lesson, drill or revision
 * ("nothing is locked", progress.ts).
 */
import { type Progress } from "@/lib/progress";
import { BADGES } from "@/lib/economy";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";
const PAPER = "var(--cahier-paper-raised)";

export default function Rewards({ p }: { p: Progress }) {
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

      {/* WHAT USED TO BE BELOW THE BADGES IS GONE FROM HERE (Dan, 2026-09-12).
          The accent colours and the Streak-Freezer (« Bouclier » until that
          day) are preferences, and moved to Settings; the expert deck moved to
          FRILLS, beside the other things a learner unlocks by doing. The gem
          balance went with them — a price needs a balance beside it, and there
          are no prices left on this row. THRILLS is what you have earned. */}
    </div>
  );
}

/** One accent colour: the swatch IS the affordance, the state is the border. */
