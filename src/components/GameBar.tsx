"use client";

/**
 * GameBar v2 — the one bar every game wears (patch 23).
 *
 *   ┌────────────────────────────────────────────┐  56px
 *   │  ✕   ▓▓▓▓▓▓░░░░░░░░   ♥♥♡   240   ⋯        │
 *   └────────────────────────────────────────────┘
 *
 * v1 (patch 13) was a site bar borrowed for games: ← FluOLinGo, the game's
 * name, four destination icons and a help dot. It answered "where am I" but
 * it did not carry the game — score, lives and progress were still painted
 * by each game in its own header, in its own colours, one line lower. Six
 * games, six HUDs (audit §C). v2 is DrillShell's bar with the two things a
 * game has that a drill does not: hearts (where the game keeps them) and a
 * ⋯ menu for what used to be a row of pills — sound, help, music, hard mode,
 * quit. GameFrame owns the ⋯ sheet; this component only draws the bar.
 *
 * ON HEARTS: DrillShell refuses hearts because lives lockout is on the
 * refused list for CURRICULUM drills. The games are opt-in arcade play and
 * three of them (NumBus, NumBourse, LexicaLater) already run on lives — the
 * bar shows what the game has, and shows nothing when it has none.
 *
 * Tokens only.
 */

import Link from "next/link";
import type { ReactNode } from "react";

export type GameProgress = { done: number; total: number };
export type GameHearts = { left: number; total: number };

export default function GameBar({
  exitHref,
  onExit,
  progress,
  hearts,
  score,
  onMenu,
  menuOpen,
}: {
  /** The ✕. A game you cannot leave is a trap. */
  exitHref: string;
  /** When set the ✕ is a button (a setup step to return to), not a link. */
  onExit?: () => void;
  /** null = the game has no notion of progress (a free composer). */
  progress: GameProgress | null;
  /** Shown only for games that keep lives. */
  hearts?: GameHearts | null;
  /** The score / counter — the learner feedback Dan's litmus rule keeps. */
  score?: ReactNode;
  onMenu: () => void;
  menuOpen: boolean;
}) {
  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.done / progress.total) * 100))
    : 0;
  const exitCls =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/50 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]";
  return (
    <div className="game-bar flex h-14 shrink-0 items-center gap-3 border-b-2 border-[color:var(--cahier-ink)]/10 bg-[color:var(--cahier-paper-raised)]/80 px-3 backdrop-blur sm:px-5">
      {onExit ? (
        <button type="button" onClick={onExit} aria-label="Exit" className={exitCls}>✕</button>
      ) : (
        <Link href={exitHref} aria-label="Exit" className={exitCls}>✕</Link>
      )}

      {progress ? (
        <div
          className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[color:var(--cahier-ink)]/10"
          role="progressbar"
          aria-valuenow={progress.done}
          aria-valuemin={0}
          aria-valuemax={progress.total}
        >
          <div
            className="h-full rounded-full bg-[color:var(--drill-ok)] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {hearts && hearts.total > 0 && (
        <span
          className="shrink-0 text-base leading-none text-[color:var(--drill-bad)]"
          title="Lives"
          aria-label={`${hearts.left} of ${hearts.total} lives`}
        >
          {"♥".repeat(Math.max(0, hearts.left))}
          <span className="opacity-25">{"♥".repeat(Math.max(0, hearts.total - hearts.left))}</span>
        </span>
      )}

      {score !== undefined && score !== null && (
        <span className="cahier-mono shrink-0 text-sm font-bold text-[color:var(--cahier-ink)]/70">{score}</span>
      )}

      <button
        type="button"
        onClick={onMenu}
        aria-label="Menu"
        aria-expanded={menuOpen}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/60 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]"
      >
        ⋯
      </button>
    </div>
  );
}
