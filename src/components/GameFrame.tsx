"use client";

/**
 * GameFrame — ONE shell for every game (patch 23), the way DrillShell is one
 * shell for every drill (patches 20–21).
 *
 *   ┌────────────────────────────────────────────┐  GameBar v2, 56px
 *   │  ✕   ▓▓▓▓▓▓░░░░░░░░   ♥♥♡   240   ⋯        │
 *   ├──────────────────────────────┬─────────────┤
 *   │                              │  live record│  ≥1024px: two panes
 *   │        THE BOARD             │  (desktop   │  (board left, record right)
 *   │   fills what is left,        │   only)     │
 *   │   never scrolls the page     │             │
 *   └──────────────────────────────┴─────────────┘
 *
 * The frame is `height: 100dvh; overflow: hidden` — the page never scrolls
 * during play, at 390×844 or 1024×768. Whatever a game needs to fit, it fits
 * INTO the board area: the frame measures that area (ResizeObserver) and hands
 * the size down as CSS custom properties `--board-w` / `--board-h` on the
 * board element and as numbers through `useBoardSize()`, so a grid can pick
 * its row height from the room it actually has instead of a hard-coded 48px.
 *
 * WHAT MOVED INTO THE ⋯ MENU: everything the six per-game headers used to
 * hold as a row of pills — help, sound, music, hard mode, settings, quit. The
 * bar carries the four things a game HAS: a way out, progress, hearts (if it
 * keeps them), score. Instructions moved behind ⋯ → Help (Dan's litmus test:
 * text that, removed, does not stop the learner finding the answer, goes).
 *
 * The bar is aware of the phone's safe area and, on pages where the bottom
 * nav is mounted, of `--bottombar-floor` — the frame's own padding-bottom is
 * the larger of the two, so a board's last row is never under a home
 * indicator or a nav bar.
 *
 * Tokens only (verify19b ratchet).
 */

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import GameBar, { type GameHearts, type GameProgress } from "@/components/GameBar";
import BottomSheet from "@/components/BottomSheet";
import SoundControl from "@/components/SoundControl";
import FirstRunHint from "@/components/FirstRunHint";

export type { GameHearts, GameProgress };

export type GameMenuItem = {
  label: ReactNode;
  onClick: () => void;
  /** Toggle state, when the item is a switch (music, hard mode). */
  active?: boolean;
};

export type BoardSize = { width: number; height: number };
const BoardSizeContext = createContext<BoardSize>({ width: 0, height: 0 });

/** The board area's current size in px (0×0 before the first measure). */
export function useBoardSize(): BoardSize {
  return useContext(BoardSizeContext);
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function GameFrame({
  title,
  exitHref,
  onExit,
  progress,
  hearts,
  score,
  help,
  hint,
  hintKey,
  menu,
  record,
  recordTitle,
  background,
  boardClassName,
  onMenuToggle,
  children,
}: {
  /** The game's name with its emoji — heads the ⋯ sheet, never the board. */
  title: ReactNode;
  /** Where ✕ leads. */
  exitHref: string;
  /** When the ✕ should step back inside the game (NumBus → its setup) rather than navigate. */
  onExit?: () => void;
  progress: GameProgress | null;
  hearts?: GameHearts | null;
  score?: ReactNode;
  /** How to play — lives behind ⋯ → Help. Omit and the menu has no Help row. */
  help?: ReactNode;
  /**
   * Set this and `help` ALSO opens by itself the first time, with a "do not
   * show me again" (Dan, 2026-09-02: "add the same first timer pop ups
   * instructions for all activity pages"). It is the same node, not a second
   * copy — a game's instructions cannot come to differ between the popup and
   * the ⋯ menu, which is what a hand-written second version would guarantee
   * within a month. Stable and never a display name: a rename must not
   * re-open a hint the learner has dismissed.
   *
   * Games that already open on a LANDING that explains them (NumBus,
   * NumBourse — Dan asked for those on 2026-08-29) pass nothing: they would
   * be telling a learner the same thing twice, one tap apart.
   */
  hintKey?: string;
  /**
   * The FIRST-RUN cut of `help`, where the full text is too long to meet a
   * learner with. Dan, 2026-09-02, on LexicaLater's popup: it is that game's
   * ⋯ → Help unedited, four paragraphs of levels, decoys and hard mode, and it
   * reads long as an arrival card even though it is right in a menu you chose
   * to open.
   *
   * IT MUST BE A NODE THAT `help` ALSO RENDERS — the same constant used twice,
   * never a second wording. A paraphrase here is two texts that drift, which
   * is the whole reason the popup shows the help node in the first place.
   * verify87 checks that the identifier passed here appears inside `help`.
   */
  hint?: ReactNode;
  /** Game-specific rows for the ⋯ sheet (music, hard mode, restart…). */
  menu?: GameMenuItem[];
  /** The live record (trésor, blotter, transcript…) — the desktop right pane. */
  record?: ReactNode;
  recordTitle?: ReactNode;
  /** The game's full-bleed sky. A CSS background value built from tokens. */
  background?: string;
  /** Extra classes for the board element (a game's ink colour, a font). */
  boardClassName?: string;
  /** Fires when the ⋯ sheet opens/closes — a real-time game pauses its clock. */
  onMenuToggle?: (open: boolean) => void;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpenRaw] = useState(false);
  const [helpOpen, setHelpOpenRaw] = useState(false);
  // Either sheet up = the game is "away"; the toggle callback sees one bit.
  const setMenuOpen = (v: boolean) => { setMenuOpenRaw(v); onMenuToggle?.(v || helpOpen); };
  const setHelpOpen = (v: boolean) => { setHelpOpenRaw(v); onMenuToggle?.(v || menuOpen); };
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<BoardSize>({ width: 0, height: 0 });

  // Measure the board area and publish it — as CSS vars for stylesheets and
  // as numbers for grids that compute. Layout effect so the first paint of a
  // sized board already knows its room.
  useIsoLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const publish = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      el.style.setProperty("--board-w", `${w}px`);
      el.style.setProperty("--board-h", `${h}px`);
      setSize((s) => (s.width === w && s.height === h ? s : { width: w, height: h }));
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frameStyle: CSSProperties = {
    height: "100dvh",
    background: background ?? "var(--cahier-paper)",
    paddingBottom: "max(env(safe-area-inset-bottom, 0px), var(--bottombar-floor, 0px))",
  };

  return (
    <div className="game-frame flex flex-col overflow-hidden text-[color:var(--cahier-ink)]" style={frameStyle}>
      <GameBar
        exitHref={exitHref}
        onExit={onExit}
        progress={progress}
        hearts={hearts}
        score={score}
        onMenu={() => setMenuOpen(true)}
        menuOpen={menuOpen}
      />

      <div className="game-frame-body flex min-h-0 flex-1 flex-col lg:flex-row">
        <BoardSizeContext.Provider value={size}>
          <div
            ref={boardRef}
            className={`game-board relative min-h-0 min-w-0 flex-1 overflow-hidden ${boardClassName ?? ""}`}
          >
            {children}
          </div>
        </BoardSizeContext.Provider>

        {record !== undefined && record !== null && (
          <aside
            className="game-record hidden min-h-0 w-80 shrink-0 flex-col overflow-y-auto border-l-2 border-[color:var(--cahier-ink)]/10 bg-[color:var(--cahier-paper-raised)]/70 px-4 py-3 lg:flex"
            aria-label="Live record"
          >
            {recordTitle && (
              <p className="mb-2 shrink-0 text-[0.7rem] font-black uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
                {recordTitle}
              </p>
            )}
            <div className="min-h-0 flex-1">{record}</div>
          </aside>
        )}
      </div>

      {/* ── ⋯ menu ───────────────────────────────────────────────────── */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={title}>
        <ul className="flex flex-col gap-1.5">
          {help && (
            <li>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setHelpOpen(true); }}
                className="cahier-btn w-full justify-start"
              >
                ❓ Help
              </button>
            </li>
          )}
          <li className="flex items-center gap-2 rounded-lg border-2 border-[color:var(--cahier-line)] px-3 py-2">
            <span className="flex-1 text-sm font-bold">🔊 Sound</span>
            <SoundControl />
          </li>
          {menu?.map((m, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => { m.onClick(); }}
                aria-pressed={m.active === undefined ? undefined : m.active}
                className={`cahier-btn w-full justify-start ${m.active ? "cahier-btn-accent" : ""}`}
              >
                {m.label}
                {m.active !== undefined && (
                  <span className="ml-auto text-xs opacity-70">{m.active ? "on" : "off"}</span>
                )}
              </button>
            </li>
          ))}
          <li className="mt-2">
            {onExit ? (
              <button type="button" onClick={() => { setMenuOpen(false); onExit(); }} className="cahier-btn w-full justify-start">
                ✕ Quit
              </button>
            ) : (
              <Link href={exitHref} className="cahier-btn w-full justify-start no-underline">
                ✕ Quit
              </Link>
            )}
          </li>
        </ul>
      </BottomSheet>

      {/* ── Help ─────────────────────────────────────────────────────── */}
      {help && (
        <BottomSheet open={helpOpen} onClose={() => setHelpOpen(false)} title={<>❓ {title}</>}>
          <div className="game-help text-sm text-[color:var(--cahier-ink)]">{help}</div>
        </BottomSheet>
      )}
      {/* …and the same node, unbidden, the first time — or the short cut of it
          where a game has one. The « more under ⋯ » line is drawn HERE, once,
          rather than written into each game's `hint`: it is true exactly when
          something was left out, which is exactly when `hint` is set. */}
      {help && hintKey && (
        <FirstRunHint hintKey={hintKey} title={`How to play`}>
          <div className="game-help">{hint ?? help}</div>
          {hint && (
            <p className="mt-3 text-xs text-[color:var(--cahier-ink-soft)]">
              The rest — levels, lives, settings — is under ⋯ → Help.
            </p>
          )}
        </FirstRunHint>
      )}
    </div>
  );
}
