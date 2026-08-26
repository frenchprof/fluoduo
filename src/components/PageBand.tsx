import type { ReactNode } from "react";

/**
 * The page's heading band — ONE structure site-wide (Dan, 2026-08-23,
 * "replicate the [profile] heading structure across the website but in
 * different colors", picked variant A of three): a solid band in the
 * family's ink, the hand-written page name in white, and at most ONE
 * number pinned right on the highlighter chip. The sub-line is for DATA
 * (course · week, deck · count), never description — the litmus rule.
 *
 * The colour comes off the page's own class, with no prop. A `band-*`
 * class (--band) wins where one is set — that is WHAT THE ACTIVITY ASKS
 * of the learner, which is what its own page should say (Dan,
 * 2026-08-26). Otherwise it falls back to the `fam-*` family ink, which
 * still colours the section pages. /moi and /profil never see either
 * (both lookups return null there — their five-row scheme is the
 * original this band replicates).
 */
export default function PageBand({
  title,
  sub,
  stat,
  className = "",
}: {
  title: ReactNode;
  sub?: ReactNode;
  stat?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`page-band flex items-center justify-between gap-3 py-3 pr-4 sm:pr-6 ${className}`}
      style={{ background: "var(--band, var(--fam-ink, var(--cahier-ink)))", borderBottom: "3px solid var(--cahier-ink)" }}
    >
      <div className="min-w-0">
        <h1
          className="fluo-band-hand truncate font-normal leading-none text-white"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          {title}
        </h1>
        {sub && (
          <span className="fluo-mono mt-1.5 block truncate text-[10px] font-bold leading-none tracking-[0.06em] text-white/90">
            {sub}
          </span>
        )}
      </div>
      {stat != null && (
        <span
          className="fluo-mono shrink-0 rounded-md px-2 py-1.5 text-[11px] font-black"
          style={{ background: "var(--cahier-hl)", color: "var(--cahier-ink)" }}
        >
          {stat}
        </span>
      )}
    </header>
  );
}
