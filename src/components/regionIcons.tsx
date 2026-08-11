"use client";

/** Region icons for the Home course-map redesign — hand-coded SVG in the
 *  picture-book register: ONE stroke weight (cahier ink), flat solid fills
 *  from the cahier tokens, no gradients, no shading, no depth. One component
 *  per motif; a region tile composes its motifs.
 *
 *  First motif (approved before the rest are built): Welcome Village's
 *  chalkboard — U0, the classroom. The board green reads through
 *  --region-village so the mockup's region accent can recolour it without
 *  touching the drawing. */

const INK = "var(--cahier-ink, #2a2e6e)";
const STROKE = 3;

export function ChalkboardIcon({ size = 96, title = "Chalkboard" }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={title}>
      {/* wooden frame, then the board */}
      <rect x="10" y="14" width="76" height="56" rx="6" fill="var(--cahier-gold, #c8a24b)" stroke={INK} strokeWidth={STROKE} />
      <rect x="18" y="22" width="60" height="40" rx="3" fill="var(--region-village, #3e7d5e)" stroke={INK} strokeWidth={STROKE} />
      {/* chalk writing: Aa and an underline — the alphabet is U0's first lesson */}
      <g stroke="var(--cahier-paper, #fbfbf6)" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M31 51 L37 34 L43 51" />
        <path d="M33.5 45.5 H40.5" />
        <circle cx="55" cy="45.5" r="5.5" />
        <path d="M60.5 39 V51" />
        <path d="M31 57 C 37 55.5, 55 58.5, 65 56.5" />
      </g>
      {/* chalk tray, a chalk stick, the eraser */}
      <rect x="14" y="70" width="68" height="7" rx="3.5" fill="var(--cahier-gold, #c8a24b)" stroke={INK} strokeWidth={STROKE} />
      <rect x="24" y="65.5" width="11" height="4.5" rx="2.25" fill="var(--cahier-paper, #fbfbf6)" stroke={INK} strokeWidth={STROKE} />
      <rect x="58" y="64" width="14" height="6" rx="1.5" fill="var(--cahier-t5, #e290b6)" stroke={INK} strokeWidth={STROKE} />
    </svg>
  );
}
