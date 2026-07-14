/**
 * The level name, dressed for its rank (Dan, 2026-07-08: "most dull at N1 to
 * most eyecatching at N10" — the styling escalates, not the word). Tiers live
 * in globals.css (.fluo-rank-1 … -10): plain grey text → outlined → tinted →
 * solid colour → gradients → glowing gold shimmer. N10+ adds the crown.
 */
export default function RankBadge({
  level,
  name,
  className = "",
  compact = false,
}: {
  level: number;
  name: string;
  className?: string;
  /** Digit-only variant (same tier background) — for tight rows like the
   *  leaderboard on mobile (Dan, 2026-07-08); full name stays in the title. */
  compact?: boolean;
}) {
  const tier = Math.min(10, Math.max(1, level));
  return (
    <span
      className={`fluo-rank fluo-rank-${tier} ${className}`}
      title={`N${level} · ${name}`}
    >
      {compact ? <>N{level}</> : (
        <>
          {tier >= 10 && <span aria-hidden>👑 </span>}
          N{level} · {name}
        </>
      )}
    </span>
  );
}
