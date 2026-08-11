"use client";

/** Region icons for the Home course-map redesign — hand-coded SVG in the
 *  picture-book register: ONE stroke weight (cahier ink), flat solid fills
 *  from the cahier tokens, no gradients, no shading, no depth. One component
 *  per motif; a region tile composes its motifs.
 *
 *  Every region accent reads through a --region-* custom property, so the
 *  mockup's final palette recolours the set without touching a path. The
 *  fallbacks below are PROVISIONAL (Dan, 2026-08-11: build now, swap later).
 *
 *  Verified at true phone rendering before scaling (chalkboard, 28px @ DPR3):
 *  fine interior detail may soften at DPR1, the object must still read. */

import type { ReactNode } from "react";

const INK = "var(--cahier-ink, #2a2e6e)";
const PAPER = "var(--cahier-paper, #fbfbf6)";
const GOLD = "var(--cahier-gold, #c8a24b)";
const STROKE = 3;

/** Provisional region accents — one swap point when Design's hex values land. */
export const REGION_ACCENTS = {
  village: "var(--region-village, #3e7d5e)",
  heights: "var(--region-heights, #4a67c9)",
  valley: "var(--region-valley, #c9679a)",
  downtown: "var(--region-downtown, #518dbb)",
  market: "var(--region-market, #c9702e)",
} as const;

type IconProps = { size?: number; title?: string };

function Frame({ size, title, children }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={title}>
      {children}
    </svg>
  );
}

/* ── Welcome Village (U0 — the classroom) ─────────────────────────────────── */

export function ChalkboardIcon({ size = 96, title = "Chalkboard" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="10" y="14" width="76" height="56" rx="6" fill={GOLD} stroke={INK} strokeWidth={STROKE} />
      <rect x="18" y="22" width="60" height="40" rx="3" fill={REGION_ACCENTS.village} stroke={INK} strokeWidth={STROKE} />
      <g stroke={PAPER} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M31 51 L37 34 L43 51" />
        <path d="M33.5 45.5 H40.5" />
        <circle cx="55" cy="45.5" r="5.5" />
        <path d="M60.5 39 V51" />
        <path d="M31 57 C 37 55.5, 55 58.5, 65 56.5" />
      </g>
      <rect x="14" y="70" width="68" height="7" rx="3.5" fill={GOLD} stroke={INK} strokeWidth={STROKE} />
      <rect x="24" y="65.5" width="11" height="4.5" rx="2.25" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <rect x="58" y="64" width="14" height="6" rx="1.5" fill="var(--cahier-t5, #e290b6)" stroke={INK} strokeWidth={STROKE} />
    </Frame>
  );
}

export function NameTagIcon({ size = 96, title = "Name tag" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="14" y="24" width="68" height="48" rx="8" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <path d="M14 42 v-10 a8 8 0 0 1 8 -8 h52 a8 8 0 0 1 8 8 v10 Z" fill={REGION_ACCENTS.village} stroke={INK} strokeWidth={STROKE} />
      <g stroke={PAPER} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M30 33 H66" />
      </g>
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M24 53 H72" />
        <path d="M24 62 H54" />
      </g>
    </Frame>
  );
}

export function AbcBlocksIcon({ size = 96, title = "Letter blocks" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="16" y="34" width="28" height="28" rx="4" fill="var(--cahier-t3, #f0d24e)" stroke={INK} strokeWidth={STROKE} />
      <rect x="52" y="34" width="28" height="28" rx="4" fill="var(--cahier-t1, #8fd3cd)" stroke={INK} strokeWidth={STROKE} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M25 55 L30 41 L35 55" />
        <path d="M27 50.5 H33" />
        <path d="M61 41 V55" />
        <path d="M61 41 h5.5 a3.5 3.5 0 0 1 0 7 H61" />
        <path d="M61 48 h6.5 a3.5 3.5 0 0 1 0 7 H61" />
      </g>
    </Frame>
  );
}

export function RainbowIcon({ size = 96, title = "Rainbow" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <path d="M18 66 A30 30 0 0 1 78 66 H70 A22 22 0 0 0 26 66 Z" fill="var(--cahier-t5, #e290b6)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M26 66 A22 22 0 0 1 70 66 H62 A14 14 0 0 0 34 66 Z" fill="var(--cahier-t3, #f0d24e)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M34 66 A14 14 0 0 1 62 66 H54 A6 6 0 0 0 42 66 Z" fill="var(--cahier-t1, #8fd3cd)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <circle cx="19" cy="64" r="7" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <circle cx="77" cy="64" r="7" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
    </Frame>
  );
}

export function AppleIcon({ size = 96, title = "Apple" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <circle cx="48" cy="54" r="24" fill="var(--cahier-la, #d11149)" stroke={INK} strokeWidth={STROKE} />
      <path d="M48 32 C 48 26, 51 23, 55 20" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M50 29 C 55 20, 66 19, 69 23 C 66 30, 55 33, 50 29 Z" fill="var(--cahier-t4, #b6d77f)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </Frame>
  );
}

/* ── Identity Heights (U1 — who am I, and the wider world) ────────────────── */

export function IdBadgeIcon({ size = 96, title = "ID badge" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="24" y="22" width="48" height="60" rx="8" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <rect x="40" y="14" width="16" height="12" rx="3" fill={REGION_ACCENTS.heights} stroke={INK} strokeWidth={STROKE} />
      <rect x="33" y="34" width="18" height="18" rx="3" fill={REGION_ACCENTS.heights} stroke={INK} strokeWidth={STROKE} />
      <circle cx="42" cy="41" r="3.5" fill={PAPER} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M33 62 H63" />
        <path d="M33 71 H53" />
      </g>
    </Frame>
  );
}

export function GlobeIcon({ size = 96, title = "Globe" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <circle cx="48" cy="48" r="30" fill={REGION_ACCENTS.heights} stroke={INK} strokeWidth={STROKE} />
      <ellipse cx="48" cy="48" rx="13" ry="30" fill="none" stroke={INK} strokeWidth={STROKE} />
      <path d="M18 48 H78" fill="none" stroke={INK} strokeWidth={STROKE} />
      <path d="M28 32 C 34 26, 44 28, 42 36 C 40 42, 30 40, 28 32 Z" fill="var(--cahier-t4, #b6d77f)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </Frame>
  );
}

export function GradCapIcon({ size = 96, title = "Graduation cap" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <path d="M32 48 v9 c0 5 32 5 32 0 v-9" fill={REGION_ACCENTS.heights} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M48 26 L82 40 L48 54 L14 40 Z" fill={INK} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M48 42 V64" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
      <circle cx="48" cy="67" r="4" fill="var(--cahier-t3, #f0d24e)" stroke={INK} strokeWidth={STROKE} />
    </Frame>
  );
}

export function BriefcaseIcon({ size = 96, title = "Briefcase" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <path d="M38 38 v-8 a5 5 0 0 1 5 -5 h10 a5 5 0 0 1 5 5 v8" fill="none" stroke={INK} strokeWidth={STROKE} />
      <rect x="18" y="38" width="60" height="36" rx="6" fill={GOLD} stroke={INK} strokeWidth={STROKE} />
      <path d="M18 54 H78" fill="none" stroke={INK} strokeWidth={STROKE} />
      <rect x="43" y="50" width="10" height="9" rx="2" fill="var(--cahier-t3, #f0d24e)" stroke={INK} strokeWidth={STROKE} />
    </Frame>
  );
}

/* ── Wants & Wishes Valley (U2 — tastes, invitations, the friendly email) ─── */

export function BallIcon({ size = 96, title = "Ball" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <circle cx="48" cy="48" r="28" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <path d="M48 37 L59 45 L55 58 H41 L37 45 Z" fill={INK} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M48 37 V23" />
        <path d="M59 45 L72 40" />
        <path d="M55 58 L63 69" />
        <path d="M41 58 L33 69" />
        <path d="M37 45 L24 40" />
      </g>
    </Frame>
  );
}

export function MusicNoteIcon({ size = 96, title = "Music note" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <path d="M42 64 V30 L72 24 V58" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M42 30 L72 24 V33 L42 39 Z" fill={REGION_ACCENTS.valley} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <ellipse cx="34" cy="66" rx="8.5" ry="6.5" fill={REGION_ACCENTS.valley} stroke={INK} strokeWidth={STROKE} />
      <ellipse cx="64" cy="60" rx="8.5" ry="6.5" fill={REGION_ACCENTS.valley} stroke={INK} strokeWidth={STROKE} />
    </Frame>
  );
}

export function GiftIcon({ size = 96, title = "Gift" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="22" y="44" width="52" height="34" rx="4" fill={REGION_ACCENTS.valley} stroke={INK} strokeWidth={STROKE} />
      <rect x="18" y="32" width="60" height="12" rx="4" fill={REGION_ACCENTS.valley} stroke={INK} strokeWidth={STROKE} />
      <rect x="43" y="32" width="10" height="46" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <path d="M48 32 C 38 18, 26 22, 33 29 C 37 33, 44 32, 48 32 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M48 32 C 58 18, 70 22, 63 29 C 59 33, 52 32, 48 32 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </Frame>
  );
}

export function EnvelopeIcon({ size = 96, title = "Envelope" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="14" y="28" width="68" height="44" rx="6" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <path d="M14 33 L48 57 L82 33" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M48 51 c -2 -4.5 -9 -3.5 -9 1 c 0 3.5 4.5 5.5 9 9 c 4.5 -3.5 9 -5.5 9 -9 c 0 -4.5 -7 -5.5 -9 -1 Z" fill={REGION_ACCENTS.valley} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </Frame>
  );
}

/* ── Downtown District (U3 — the town: places, directions, transport) ─────── */

export function SignpostIcon({ size = 96, title = "Signpost" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="45" y="16" width="6" height="64" fill={GOLD} stroke={INK} strokeWidth={STROKE} />
      <path d="M26 24 H62 l9 8 l-9 8 H26 Z" fill={REGION_ACCENTS.downtown} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M70 46 H34 l-9 8 l9 8 h36 Z" fill="var(--cahier-t3, #f0d24e)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M32 32 H54" stroke={PAPER} strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M42 54 H64" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M34 82 H62" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
    </Frame>
  );
}

export function BuildingsIcon({ size = 96, title = "Buildings" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <rect x="18" y="26" width="22" height="56" fill={REGION_ACCENTS.downtown} stroke={INK} strokeWidth={STROKE} />
      <rect x="44" y="40" width="22" height="42" fill="var(--cahier-t0, #cbb7e6)" stroke={INK} strokeWidth={STROKE} />
      <rect x="70" y="52" width="14" height="30" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <g fill="var(--cahier-t3, #f0d24e)">
        <rect x="23" y="33" width="5.5" height="5.5" />
        <rect x="31" y="33" width="5.5" height="5.5" />
        <rect x="23" y="44" width="5.5" height="5.5" />
        <rect x="31" y="44" width="5.5" height="5.5" />
        <rect x="23" y="55" width="5.5" height="5.5" />
        <rect x="31" y="55" width="5.5" height="5.5" />
        <rect x="49" y="47" width="5.5" height="5.5" />
        <rect x="57" y="47" width="5.5" height="5.5" />
        <rect x="49" y="58" width="5.5" height="5.5" />
        <rect x="57" y="58" width="5.5" height="5.5" />
        <rect x="74" y="58" width="6" height="5.5" />
      </g>
      <path d="M14 82 H86" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
    </Frame>
  );
}

export function WeatherIcon({ size = 96, title = "Sun and cloud" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <circle cx="38" cy="38" r="13" fill="var(--cahier-t3, #f0d24e)" stroke={INK} strokeWidth={STROKE} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M38 18 V13" />
        <path d="M52.5 23.5 L56 20" />
        <path d="M58 38 H63" />
        <path d="M23.5 23.5 L20 20" />
        <path d="M18 38 H13" />
      </g>
      <path d="M34 76 a10 10 0 0 1 3 -19.5 a13 13 0 0 1 25 -2.5 a10 10 0 0 1 4 19 q -2 3 -6 3 H40 q -5 0 -6 0 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </Frame>
  );
}

export function BikeIcon({ size = 96, title = "Bicycle" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <circle cx="28" cy="62" r="14" fill="none" stroke={INK} strokeWidth={STROKE} />
      <circle cx="68" cy="62" r="14" fill="none" stroke={INK} strokeWidth={STROKE} />
      <path d="M28 62 L40 42 H56 L68 62 M40 42 L50 62 L56 42" fill="none" stroke={REGION_ACCENTS.downtown} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="50" cy="62" r="4" fill={INK} />
      <path d="M56 42 L61 33 h6" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M40 42 L36 34 M31 34 h9" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
    </Frame>
  );
}

/* ── Gourmet Market (U4 — food, the market, the restaurant finale) ────────── */

export function AwningIcon({ size = 96, title = "Market awning" }: IconProps) {
  const stripe = 13.6;
  return (
    <Frame size={size} title={title}>
      <rect x="12" y="26" width="72" height="7" rx="3.5" fill={GOLD} stroke={INK} strokeWidth={STROKE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={14 + i * stripe} y="33" width={stripe} height="14"
            fill={i % 2 === 0 ? REGION_ACCENTS.market : PAPER}
            stroke={INK} strokeWidth={STROKE}
          />
          <path
            d={`M${14 + i * stripe} 47 a${stripe / 2} ${stripe / 2} 0 0 0 ${stripe} 0 Z`}
            fill={i % 2 === 0 ? REGION_ACCENTS.market : PAPER}
            stroke={INK} strokeWidth={STROKE} strokeLinejoin="round"
          />
        </g>
      ))}
    </Frame>
  );
}

export function BasketIcon({ size = 96, title = "Bread basket" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <ellipse cx="38" cy="40" rx="15" ry="7.5" transform="rotate(-24 38 40)" fill="var(--cahier-t2, #f3cba0)" stroke={INK} strokeWidth={STROKE} />
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M32 41 l4 -3" />
        <path d="M37 38 l4 -3" />
        <path d="M42 35 l4 -3" />
      </g>
      <circle cx="58" cy="42" r="8.5" fill="var(--cahier-la, #d11149)" stroke={INK} strokeWidth={STROKE} />
      <circle cx="69" cy="47" r="6.5" fill={REGION_ACCENTS.market} stroke={INK} strokeWidth={STROKE} />
      <path d="M22 52 H74 L68 78 H28 Z" fill={GOLD} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M26 61 H70" />
        <path d="M28 70 H68" />
      </g>
      <rect x="20" y="48" width="56" height="8" rx="4" fill={GOLD} stroke={INK} strokeWidth={STROKE} />
    </Frame>
  );
}

export function ReceiptIcon({ size = 96, title = "Receipt" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <path d="M30 14 H66 V74 l-6 -5 -6 5 -6 -5 -6 5 -6 -5 -6 5 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x="34" y="50" width="28" height="9" fill="var(--cahier-t3, #f0d24e)" />
      <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
        <path d="M36 26 H60" />
        <path d="M36 34 H54" />
        <path d="M36 42 H60" />
        <path d="M36 54.5 H60" />
      </g>
    </Frame>
  );
}

export function UmbrellaIcon({ size = 96, title = "Café umbrella" }: IconProps) {
  return (
    <Frame size={size} title={title}>
      <path d="M18 48 A 30 30 0 0 1 78 48 Z" fill={REGION_ACCENTS.market} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <g stroke={INK} strokeWidth={STROKE} fill="none">
        <path d="M36 21.5 L38 48" />
        <path d="M60 21.5 L58 48" />
      </g>
      <circle cx="48" cy="15" r="3.5" fill={GOLD} stroke={INK} strokeWidth={STROKE} />
      {/* straight pole — a terrace parasol, not a rain umbrella */}
      <path d="M48 48 V82" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M38 82 H58" fill="none" stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
    </Frame>
  );
}
