"use client";

/**
 * GameBar v2 — the one bar every game wears (patch 23).
 *
 *   ┌────────────────────────────────────────────┐  56px
 *   │  ✕   ▓▓▓▓▓▓░░░░░░░░   ♥♥♡   240   🔊  ⋯    │
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
import SoundControl from "@/components/SoundControl";

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
  full,
  onToggleFull,
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
  /** null = this frame cannot go full screen (it already is). */
  full?: boolean;
  onToggleFull?: () => void;
}) {
  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.done / progress.total) * 100))
    : 0;
  const exitCls =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/50 sm:h-9 sm:w-9 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]";
  return (
    <div className="game-bar flex h-14 shrink-0 items-center gap-1.5 border-b-2 border-[color:var(--cahier-ink)]/10 bg-[color:var(--cahier-paper-raised)]/80 px-2 backdrop-blur sm:gap-3 sm:px-5">
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
            className="h-full rounded-full bg-[color:var(--dopa-win)] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {hearts && hearts.total > 0 && (
        <span
          className="shrink-0 text-base leading-none text-[color:var(--dopa-miss)]"
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

      {/* 🔊 VISIBLE, on every game (Dan, 2026-09-02: "some games are missing
          the volume button"). Patch 23 folded sound into the ⋯ sheet, which
          left the games the only surfaces without the top-bar 🔊 every drill
          and page shows — a learner mid-game had to know the control was
          behind a menu. The same SoundControl the site bar mounts, so muting
          a channel here is muting it everywhere. The ⋯ sheet's Sound row is
          gone with this: two doors to one control on one screen is the
          HelpDot fault again. */}
      <SoundControl />

      {/* FULL SCREEN (Dan, 7 Sep: games "embedded like the map, (with option
          to go full screen)"). Beside ⋯ rather than inside it: it is a thing
          you reach for mid-game, and a control you have to open a sheet to
          find is a control you do not use. */}
      {onToggleFull && (
        <button
          type="button"
          onClick={onToggleFull}
          aria-pressed={full}
          aria-label={full ? "Leave full screen" : "Play full screen"}
          title={full ? "Leave full screen" : "Play full screen"}
          /* THE HOOK A HAND-HOLD POINTS AT (Dan, 2026-09-15, of LexicaLocker:
             *"make sure that it is played in full screen - by pointing to the
             full screen button!"*). It is on the BAR, so every game has it; a
             game opts into being pointed at it by passing `guide` to
             GameFrame, which is what keeps this from becoming a lecture that
             every game gives. */
          data-tour="full-screen"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base font-black text-[color:var(--cahier-ink)]/60 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)] sm:h-9 sm:w-9"
        >
          <span aria-hidden>{full ? "⤡" : "⛶"}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onMenu}
        aria-label="Menu"
        aria-expanded={menuOpen}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/60 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)] sm:h-9 sm:w-9"
      >
        ⋯
      </button>
    </div>
  );
}
