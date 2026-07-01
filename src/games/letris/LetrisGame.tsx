"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildSentence, speak } from "./speech";
import { resolveBoard } from "./resolve";
import { chiptune } from "@/games/audio/chiptune";

export type LetrisCategory = {
  key: string;
  label: string;
  /** Literal prefix prepended when building the target sentence (e.g. "Il fait ", "Le ", "L'", ""). */
  prefix?: string;
};
export type LetrisTile = {
  text: string;
  category: string;
  /** Proper-cased form used in sentences / TTS (e.g. "beau", "Japon"). Defaults to text.toLowerCase(). */
  displayName?: string;
  meaning?: string;
  emoji?: string;
};
export type LetrisSet = {
  id: string;
  title: string;
  subtitle?: string;
  language?: string;
  categories: LetrisCategory[];
  tiles: LetrisTile[];
};

type Cell = LetrisTile | null;
type Active = { tile: LetrisTile; row: number; col: number };

const ROWS = 10;
const INITIAL_TICK_MS = 800;
const MIN_TICK_MS = 260;
const SPEEDUP_EVERY = 6;

/* One colour per category (the base + every tile that belongs to it). Revealed
 * only when a tile lands — while falling, a tile shows its word, not its colour. */
const PALETTE = [
  "#e2567f", // pink
  "#2bb6c2", // teal
  "#e8a300", // amber
  "#8a5fd4", // purple
  "#46b04a", // green
  "#e8852e", // orange
  "#4f86e0", // blue
];

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function emptyBoard(cols: number): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(cols).fill(null));
}

export default function LetrisGame({ set }: { set: LetrisSet }) {
  const cols = set.categories.length;
  const catIndex = useMemo(() => {
    const m = new Map<string, number>();
    set.categories.forEach((c, i) => m.set(c.key, i));
    return m;
  }, [set.categories]);

  const catColor = useCallback((i: number) => PALETTE[i % PALETTE.length], []);
  // A tile's TRUE colour = the colour of the column it really belongs to.
  const colorOf = useCallback(
    (t: LetrisTile) => catColor(catIndex.get(t.category) ?? 0),
    [catColor, catIndex],
  );

  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard(cols));
  const [active, setActive] = useState<Active | null>(null);
  const [queue, setQueue] = useState<LetrisTile[]>(() => shuffle(set.tiles));
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [music, setMusic] = useState(false);
  const musicAutoRef = useRef(false);
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => () => chiptune.stop(), []); // stop the loop on unmount
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<{ col: number; kind: "ok" | "bad" } | null>(null);

  const tickRef = useRef(INITIAL_TICK_MS);
  const lastDropRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({ board, active, queue, paused, gameOver });
  stateRef.current = { board, active, queue, paused, gameOver };

  const spawnTile = useCallback(() => {
    setQueue((q) => {
      let next = q;
      if (next.length === 0) next = shuffle(set.tiles);
      const tile = next[0];
      const startCol = Math.floor(Math.random() * cols);
      setActive({ tile, row: 0, col: startCol });
      return next.slice(1);
    });
  }, [set.tiles, cols]);

  const restart = useCallback(() => {
    setBoard(emptyBoard(cols));
    setActive(null);
    setQueue(shuffle(set.tiles));
    setScore(0);
    setPaused(false);
    setGameOver(false);
    setFlash(null);
    tickRef.current = INITIAL_TICK_MS;
  }, [cols, set.tiles]);

  const landTile = useCallback(
    (a: Active) => {
      const correct = catIndex.get(a.tile.category) === a.col;
      setFlash({ col: a.col, kind: correct ? "ok" : "bad" });
      window.setTimeout(() => setFlash(null), 220);
      if (correct) {
        speak(
          buildSentence(set.categories[a.col], a.tile),
          set.language ? `${set.language}-FR` : "fr-FR",
          { interrupt: false },
        );
      }

      setBoard((b) => {
        const nb = b.map((row) => row.slice());
        // place on top of the column's stack (lowest empty row)
        let landRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (nb[r][a.col] === null) {
            landRow = r;
            break;
          }
        }
        if (landRow < 0) {
          setGameOver(true);
          return nb;
        }
        nb[landRow][a.col] = a.tile;

        // resolve match-3 across the whole board — vertical (base-anchored) AND
        // horizontal rows — with gravity + cascade.
        const { board: resolved, cleared } = resolveBoard(nb, ROWS, cols, catColor, colorOf);
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < cols; c++) nb[r][c] = resolved[r][c];

        if (cleared > 0) {
          setScore((s) => {
            const ns = s + cleared * 10;
            // speed up every SPEEDUP_EVERY clears (≈ every 60 pts)
            if (Math.floor(ns / (SPEEDUP_EVERY * 10)) > Math.floor(s / (SPEEDUP_EVERY * 10))) {
              tickRef.current = Math.max(MIN_TICK_MS, tickRef.current - 50);
            }
            return ns;
          });
        }
        if (nb[0][a.col] !== null) setGameOver(true); // landing column stacked to the top
        return nb;
      });
      setActive(null);
    },
    [catIndex, catColor, colorOf, set.categories, set.language],
  );

  useEffect(() => {
    if (!active && !gameOver && !paused) {
      const t = window.setTimeout(spawnTile, 250);
      return () => window.clearTimeout(t);
    }
  }, [active, gameOver, paused, spawnTile]);

  useEffect(() => {
    const step = (ts: number) => {
      const s = stateRef.current;
      if (s.paused || s.gameOver || !s.active) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      if (ts - lastDropRef.current >= tickRef.current) {
        lastDropRef.current = ts;
        const a = s.active;
        const nextRow = a.row + 1;
        const blocked =
          nextRow >= ROWS || (s.board[nextRow] && s.board[nextRow][a.col] !== null);
        if (blocked) {
          if (a.row === 0 && s.board[0][a.col] !== null) setGameOver(true);
          else landTile({ ...a, row: Math.max(0, nextRow - 1) });
        } else {
          setActive({ ...a, row: nextRow });
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [landTile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === "Enter" || e.key === " ") restart();
        return;
      }
      if (e.key === "p" || e.key === "P") {
        setPaused((p) => !p);
        return;
      }
      if (paused || !active) return;
      if (!musicAutoRef.current) {
        musicAutoRef.current = true;
        chiptune.play("letris");
        setMusic(true);
      }
      if (e.key === "ArrowLeft") {
        const nc = Math.max(0, active.col - 1);
        if (board[active.row][nc] === null) setActive({ ...active, col: nc });
      } else if (e.key === "ArrowRight") {
        const nc = Math.min(cols - 1, active.col + 1);
        if (board[active.row][nc] === null) setActive({ ...active, col: nc });
      } else if (e.key === "ArrowDown") {
        const nr = active.row + 1;
        if (nr >= ROWS || board[nr][active.col] !== null) {
          setActive(null);
          landTile(active);
        } else setActive({ ...active, row: nr });
      } else if (e.key === " ") {
        e.preventDefault();
        let r = active.row;
        while (r + 1 < ROWS && board[r + 1][active.col] === null) r++;
        setActive(null);
        landTile({ ...active, row: r });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, board, cols, gameOver, landTile, paused, restart]);

  const moveTo = (col: number) => {
    if (!active || paused || gameOver) return;
    if (board[active.row][col] !== null) return;
    setActive({ ...active, col });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 text-white">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{set.title}</h1>
          {set.subtitle && <p className="text-sm text-slate-300">{set.subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 font-mono text-sm">
          <span>Score <b className="text-emerald-400">{score}</b></span>
          <button type="button" onClick={() => setShowHelp(true)}
            title="How to play" className="rounded border border-slate-500 px-2 py-1 hover:bg-slate-700">?</button>
          <button type="button" onClick={() => { chiptune.toggle("letris"); setMusic(chiptune.playing() === "letris"); }}
            title="Music" className="rounded border border-slate-500 px-2 py-1 hover:bg-slate-700">{music ? "🔊" : "🎵"}</button>
          <button type="button" onClick={() => setPaused((p) => !p)} className="rounded border border-slate-500 px-2 py-1 hover:bg-slate-700">
            {paused ? "Resume" : "Pause"}
          </button>
          <button type="button" onClick={restart} className="rounded border border-slate-500 px-2 py-1 hover:bg-slate-700">
            Restart
          </button>
        </div>
      </header>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowHelp(false)}>
          <div className="max-w-sm rounded-2xl bg-slate-800 p-6 text-white shadow-2xl ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-3 text-xl font-bold">How to play Letris</h2>
            <ol className="space-y-2 text-sm text-slate-200 list-decimal list-inside">
              <li>A word falls from the top — read it.</li>
              <li>Use <b>← →</b> or tap a column to steer it into the right basket.</li>
              <li>Press <b>↓</b> to nudge it down, or <b>Space</b> to drop it instantly.</li>
              <li>Line up <b>3 tiles of the same colour</b> in a column or row to clear them.</li>
            </ol>
            <p className="mt-3 text-xs text-slate-400">
              The goal is to sort, not just drop — every correct placement reinforces the grammar rule.
            </p>
            <button type="button" onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold hover:bg-emerald-500">
              Got it — play!
            </button>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
        <div
          className="relative grid bg-slate-950"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, 48px)`,
          }}
        >
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const stacked = board[r][c];
              const isActive = active && active.row === r && active.col === c;
              const tile = isActive ? active!.tile : stacked;
              const isFlashCol = flash && flash.col === c && r === ROWS - 1;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex items-center justify-center border-b border-slate-800 px-1 text-center ${
                    c < cols - 1 ? "border-r border-slate-800" : ""
                  } ${isFlashCol ? (flash!.kind === "ok" ? "bg-emerald-500/30" : "bg-rose-500/30") : ""}`}
                  onClick={() => moveTo(c)}
                >
                  {tile && (
                    <div
                      className="flex h-[44px] w-[96%] items-center justify-center rounded-md px-1 text-[11px] font-bold leading-tight shadow-md sm:text-xs"
                      style={
                        isActive
                          ? { background: "#fde68a", color: "#1e293b" } // falling: colour hidden
                          : { background: colorOf(tile), color: "#fff" } // landed: colour revealed
                      }
                    >
                      {tile.text}
                    </div>
                  )}
                </div>
              );
            }),
          )}
        </div>

        {/* coloured bases */}
        <div className="grid border-t-2 border-amber-400/60" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {set.categories.map((c, i) => (
            <div
              key={c.key}
              className={`px-2 py-3 text-center text-sm font-bold tracking-wider text-white sm:text-base ${
                i < cols - 1 ? "border-r border-slate-900/40" : ""
              }`}
              style={{ background: catColor(i) }}
            >
              {c.label}
            </div>
          ))}
        </div>

        {(paused || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/85 backdrop-blur-sm">
            <h2 className="text-3xl font-bold">{gameOver ? "Game Over" : "Paused"}</h2>
            {gameOver && <p className="text-lg">Final score: <b className="text-emerald-400">{score}</b></p>}
            <button
              type="button"
              onClick={gameOver ? restart : () => setPaused(false)}
              className="rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300"
            >
              {gameOver ? "Play again" : "Resume"}
            </button>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5">←</kbd>{" "}
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5">→</kbd> move
          {"  · "}
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5">↓</kbd> soft drop
          {"  · "}
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5">Space</kbd> hard drop
          {"  · "}
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5">P</kbd> pause
        </div>
        <div>Tap a column to move the active tile.</div>
      </footer>
    </div>
  );
}
