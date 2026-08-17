"use client";

/**
 * NumBourse — the floor-trader number dictation game (Dan's concept,
 * 2026-07-28). You are a floor trader at the Paris Bourse on a volatile day:
 * brokers shout stock valuations in French and you must type the value in
 * digits and lock the trade before the ticket expires. Eight levels widen the
 * range — single digits, then the vingt/soixante zone, the soixante-dix and
 * quatre-vingt traps, then hundreds and thousands up to 999 999.
 *
 * Aesthetics and chrome follow VocabulaRain / LexicaLater: CreditsSplash,
 * chiptune loop + sfx jingles, HUD chips, popup overlays, Tailwind + inline
 * gradients and keyframes. The quote board itself is the classic dark-green
 * exchange board with amber "LED" figures.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { logEvent } from "@/lib/firebase/usage";
import { recordResponse } from "@/lib/firebase/responses";
import { speak } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { sfx } from "@/games/audio/sfx";
import CreditsSplash from "@/games/CreditsSplash";
import GameFrame from "@/components/GameFrame";
import GameOver, { type GameMiss } from "@/components/GameOver";
import { reviewItemByFrench } from "@/lib/reviser";
import { frenchNumber, frenchDigits } from "./frenchNumbers";
import { holdDigitKeys } from "@/lib/useChoiceKeys";

const START_LIVES = 3;
const QUOTA = 6; // trades to close a level
// Ticket timers pause for a beat while the broker is still shouting.
const GRACE_MS = 1200;

// The level ladder (Dan, 2026-07-28): 1 single digits · 2 ≤20 · 3 ≤69 ·
// 4 ≤80 (the soixante-dix zone) · 5 ≤99 (quatre-vingt-dix) · 6 ≤999 ·
// 7 ≤99 999 · 8 ≤999 999. Seconds per ticket grow with the digit count.
const LEVELS: { max: number; secs: number }[] = [
  { max: 9, secs: 8 },
  { max: 20, secs: 8 },
  { max: 69, secs: 9 },
  { max: 80, secs: 9 },
  { max: 99, secs: 9 },
  { max: 999, secs: 11 },
  { max: 99999, secs: 14 },
  { max: 999999, secs: 16 },
];

// CAC-40 flavour for the tickets and the decorative tape.
const COMPANIES: [string, string][] = [
  ["AIR", "Airbus"], ["MC", "LVMH"], ["OR", "L'Oréal"], ["BNP", "BNP Paribas"],
  ["RNO", "Renault"], ["TTE", "TotalEnergies"], ["ML", "Michelin"], ["BN", "Danone"],
  ["CA", "Carrefour"], ["DG", "Vinci"], ["SU", "Schneider"], ["SGO", "Saint-Gobain"],
  ["KER", "Kering"], ["EN", "Bouygues"], ["VIE", "Veolia"], ["HO", "Thales"],
];

type Order = { value: number; words: string; sym: string; name: string; side: "ACHAT" | "VENTE" };

// Draw mostly from the level's NEW band (above the previous level's ceiling)
// with some review below it, and never the same value twice running.
function dealValue(level: number, prev: number | null): number {
  const { max } = LEVELS[level - 1];
  const lo = level === 1 ? 0 : LEVELS[level - 2].max + 1;
  for (let guard = 0; guard < 24; guard++) {
    const fresh = level === 1 || Math.random() < 0.75;
    const v = fresh
      ? lo + Math.floor(Math.random() * (max - lo + 1))
      : Math.floor(Math.random() * lo);
    if (v !== prev) return v;
  }
  return max;
}

export default function NumBourse() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [doneCount, setDoneCount] = useState(0);
  const [levelDone, setLevelDone] = useState(false);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hard, setHard] = useState(false);
  const [music, setMusic] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [typed, setTyped] = useState("");
  const [flash, setFlash] = useState<"ok" | null>(null);
  const [reveal, setReveal] = useState(false); // wrong/expired → show the digits
  const [timeFrac, setTimeFrac] = useState(1);
  const [history, setHistory] = useState<Order[]>([]);

  const lastValueRef = useRef<number | null>(null);
  const dealtAtRef = useRef(0);
  const resolvedRef = useRef(false); // the current ticket is settled (win/miss)
  const musicAutoRef = useRef(false);
  // Lost tickets, with what was typed — the post-mortem's three columns.
  const missedRef = useRef<Array<{ order: Order; given: string }>>([]);
  const typedRef = useRef("");
  typedRef.current = typed;
  const inputRef = useRef<HTMLInputElement>(null);
  // The hidden input exists so a physical keyboard can type digits. On a phone,
  // focusing it only summons the OS keypad over the game — and that keypad has
  // no return key, so it cannot even submit. Touch devices drive the on-screen
  // keypad instead and never take focus.
  const focusTyping = useCallback(() => {
    try {
      if (!window.matchMedia("(pointer: fine)").matches) return;
    } catch {}
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => setMounted(true), []);
  useEffect(() => holdDigitKeys(), []);
  useEffect(() => () => chiptune.stop(), []);
  useEffect(() => {
    void logEvent("game.start", { game: "numbourse" });
  }, []);
  useEffect(() => {
    try {
      const v = parseFloat(window.localStorage.getItem("fluolingo:volume") ?? "");
      if (!Number.isNaN(v)) chiptune.setVolume(v);
    } catch {}
  }, []);

  const deal = useCallback((lv: number) => {
    const value = dealValue(lv, lastValueRef.current);
    lastValueRef.current = value;
    const [sym, name] = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    const next: Order = {
      value,
      words: frenchNumber(value),
      sym,
      name,
      side: Math.random() < 0.5 ? "ACHAT" : "VENTE",
    };
    resolvedRef.current = false;
    dealtAtRef.current = performance.now();
    setOrder(next);
    setTyped("");
    setFlash(null);
    setReveal(false);
    setTimeFrac(1);
    speak(next.words, "fr-FR");
  }, []);

  // Deal the level's first ticket — on start and on each level change.
  useEffect(() => {
    if (!started) return;
    setDoneCount(0);
    setLevelDone(false);
    deal(level);
  }, [level, started, deal]);

  // Auto-advance between levels (same beat as LexicaLater — no OK tap).
  useEffect(() => {
    if (!levelDone) return;
    void logEvent("game.end", { game: "numbourse", level, score });
    const t = window.setTimeout(() => setLevel((l) => l + 1), 1800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelDone]);

  // The ticket clock — a settled/paused ticket doesn't tick.
  const frozen = !started || !order || over || won || levelDone || flash === "ok" || reveal;
  useEffect(() => {
    if (frozen) return;
    const id = window.setInterval(() => {
      if (resolvedRef.current) return;
      const dur = LEVELS[level - 1].secs * 1000;
      const frac = 1 - (performance.now() - dealtAtRef.current - GRACE_MS) / dur;
      setTimeFrac(Math.max(0, Math.min(1, frac)));
      if (frac <= 0) miss();
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozen, level, order]);

  // The loop starts on the first keypress — a user gesture, so the
  // AudioContext may be created (same pattern as LexicaLater's first pick).
  const ensureMusic = useCallback(() => {
    if (musicAutoRef.current) return;
    musicAutoRef.current = true;
    chiptune.play("bourse");
    setMusic(true);
  }, []);

  function miss() {
    if (!order || resolvedRef.current) return;
    resolvedRef.current = true;
    recordResponse(order.words, false, { activity: "numbourse" });
    sfx.wrong();
    setCombo(0);
    missedRef.current = [...missedRef.current, { order, given: typedRef.current }];
    setReveal(true);
    const nl = lives - 1;
    setLives(nl);
    window.setTimeout(() => {
      if (nl <= 0) {
        setOver(true);
        chiptune.gameOver(); // stops the loop for the sad descent
        setMusic(false);
        void logEvent("game.end", { game: "numbourse", level, score });
      } else {
        deal(level);
      }
    }, 1800);
  }

  function submit() {
    if (!order || resolvedRef.current || !typed) return;
    if (Number(typed) !== order.value) {
      miss();
      return;
    }
    resolvedRef.current = true;
    recordResponse(order.words, true, { activity: "numbourse" });
    sfx.correct();
    setScore((s) => s + 10 + Math.min(combo, 5) * 2);
    setCombo((c) => c + 1);
    setHistory((h) => [...h.slice(-11), order]);
    setFlash("ok");
    const n = doneCount + 1;
    setDoneCount(n);
    if (n >= QUOTA) {
      sfx.stage();
      if (level >= LEVELS.length) {
        setWon(true);
        void logEvent("game.end", { game: "numbourse", level, score, won: true });
      } else {
        setLevelDone(true);
      }
    } else {
      window.setTimeout(() => deal(level), 450);
    }
  }

  function press(key: string) {
    if (!order || resolvedRef.current || over || won || levelDone) return;
    ensureMusic();
    focusTyping();
    if (key === "back") setTyped((t) => t.slice(0, -1));
    else setTyped((t) => (t.length >= 6 ? t : t + key));
  }

  const canType =
    started && !!order && !resolvedRef.current && !over && !won && !levelDone && flash !== "ok" && !reveal;

  // Keep the numeric field focused while a ticket is live — digits stay in
  // the input (NumBus pattern) so site-wide 1–4 pretest shortcuts are never
  // captured at the window level.
  useEffect(() => {
    if (!canType) return;
    focusTyping();
  }, [canType, order?.value, focusTyping]);

  function reset() {
    setScore(0);
    setLives(START_LIVES);
    setCombo(0);
    setOver(false);
    setWon(false);
    setHistory([]);
    missedRef.current = [];
    // Re-arm the auto-start so the first keypress of the new session brings
    // the loop back (gameOver() silenced it).
    if (chiptune.playing() !== "bourse") musicAutoRef.current = false;
    setDoneCount(0);
    setLevelDone(false);
    if (level === 1) deal(1);
    else setLevel(1);
  }

  // Decorative tape quotes — random deltas, rolled once per mount.
  const tape = useMemo(
    () =>
      COMPANIES.map(([sym]) => ({
        sym,
        delta: Math.round((Math.random() * 8 - 4) * 10) / 10,
      })),
    [],
  );

  const barColor = timeFrac > 0.5 ? "#58cc02" : timeFrac > 0.25 ? "#ffc800" : "#ff4b4b";

  // Client-only: tickets and the tape roll with Math.random — don't SSR them.
  if (!mounted) return null;

  const misses: GameMiss[] = missedRef.current.map((m) => ({
    itemId: reviewItemByFrench(m.order.words)?.id,
    prompt: m.order.words,
    expected: `${frenchDigits(m.order.value)} €`,
    given: m.given ? `${m.given} €` : undefined,
  }));

  const help = (
    <>
      <p>Type the shouted valuation in digits, then Enter — before the ticket expires.</p>
      <p className="mt-2">Six trades close a level; eight levels widen the range up to 999 999 €. A wrong or expired trade costs a life.</p>
      <p className="mt-2"><b>Hard</b>: the value is heard, never shown — tap 🔊 to hear it again.</p>
    </>
  );

  // The blotter — the desktop live record.
  const record = (
    <ol className="flex flex-col gap-1.5">
      {[...history].reverse().map((h, i) => (
        <li key={history.length - i} lang="fr" title={h.words}
          className="flex items-baseline gap-2 rounded-lg border-2 border-[color:var(--drill-ok-soft)] bg-[color:var(--drill-ok-bg)] px-2 py-1 text-sm">
          <span aria-hidden>{h.side === "ACHAT" ? "▲" : "▼"}</span>
          <span className="min-w-0 flex-1 truncate font-bold">{h.words}</span>
          <span className="cahier-mono shrink-0 font-black">{frenchDigits(h.value)} €</span>
        </li>
      ))}
    </ol>
  );

  return (
    <GameFrame
      title="📈 NumBourse"
      exitHref="/"
      progress={{ done: doneCount, total: QUOTA }}
      hearts={{ left: lives, total: START_LIVES }}
      score={<>{score} · L{level}</>}
      help={help}
      menu={[
        { label: "🎵 Music", active: music, onClick: () => { chiptune.toggle("bourse"); setMusic(chiptune.playing() === "bourse"); } },
        { label: "😤 Hard", active: hard, onClick: () => setHard((h) => !h) },
      ]}
      record={record}
      recordTitle="📋 Your orders"
      background="linear-gradient(180deg, var(--region-village-band) 0%, var(--cahier-paper) 60%)"
    >
    {/* data-kbnav-off: digits type the trade here — the site-wide keyboard
        navigation must stand down on this page. */}
    <div data-kbnav-off className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-3" style={{ color: "#0c4a6e" }}>
      <CreditsSplash game="NumBourse" emoji="📈" onDone={() => setStarted(true)} />
      <style>{`
        @keyframes nbscroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes nbflash{0%{box-shadow:0 0 0 0 rgba(88,204,2,0)}30%{box-shadow:0 0 0 8px rgba(88,204,2,.55)}100%{box-shadow:0 0 0 0 rgba(88,204,2,0)}}
        @keyframes nbshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        @keyframes nbcaret{0%,100%{opacity:1}50%{opacity:.1}}
        @keyframes nbland{0%{transform:translateY(-14px) scale(1.06);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
      `}</style>

      {/* Ticker tape — decorative market noise above the board. */}
      <div className="overflow-hidden rounded-t-2xl border-4 border-b-0 border-white" style={{ background: "#081712" }} aria-hidden>
        <div className="flex w-max gap-5 px-3 py-1.5" style={{ animation: "nbscroll 28s linear infinite" }}>
          {[...tape, ...tape].map((q, i) => (
            <span key={i} className="whitespace-nowrap font-mono text-[11px] font-bold tracking-wider">
              <span style={{ color: "#7aa695" }}>{q.sym}</span>{" "}
              <span style={{ color: q.delta >= 0 ? "#4ade80" : "#f87171" }}>
                {q.delta >= 0 ? "▲" : "▼"} {Math.abs(q.delta).toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* The quote board — the broker's ticket. */}
      <div
        className="overflow-hidden rounded-b-2xl border-4 border-white"
        style={{
          background: "linear-gradient(180deg,#10231b,#0a1a13)",
          animation: flash === "ok" ? "nbflash 500ms" : reveal ? "nbshake 300ms" : undefined,
        }}
      >
        {order && (
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="rounded-md px-1.5 py-0.5 font-mono text-xs font-black tracking-widest" style={{ background: "#1d3a2d", color: "#9ad2b8" }}>
                {order.sym}
              </span>
              <span className="text-xs font-bold" style={{ color: "#6f9c88" }}>{order.name}</span>
              <span
                className="rounded-md px-1.5 py-0.5 text-xs font-black"
                style={{
                  background: order.side === "ACHAT" ? "rgba(74,222,128,.15)" : "rgba(248,113,113,.15)",
                  color: order.side === "ACHAT" ? "#4ade80" : "#f87171",
                }}
              >
                {order.side === "ACHAT" ? "▲ ACHAT" : "▼ VENTE"}
              </span>
              <button
                type="button"
                onClick={() => speak(order.words, "fr-FR", { analytic: "word" })}
                title="Hear the broker again"
                aria-label="Hear the broker again"
                className="ml-auto rounded-lg border-2 border-b-4 border-[#e08600] bg-[#ffc800] px-2 py-0.5 text-sm font-black text-[#5a3a08] transition active:translate-y-0.5 active:border-b-2"
              >
                🔊
              </button>
            </div>

            {/* The shout — hidden in hard mode until the reveal. */}
            <div className="min-h-[4.5rem] py-3 text-center">
              {(!hard || reveal) ? (
                <p lang="fr" className="text-2xl font-black leading-snug sm:text-3xl" style={{ color: "#ffb84d", textShadow: "0 0 18px rgba(255,184,77,.35)" }}>
                  « {order.words} ! »
                </p>
              ) : (
                <p className="text-2xl font-black tracking-[0.3em]" style={{ color: "#3d6b56" }} aria-label="Listen to the broker">
                  🔊 · · ·
                </p>
              )}
              {reveal && (
                <p className="mt-1 text-xl font-black" style={{ color: "#f87171" }}>
                  = {frenchDigits(order.value)} €
                </p>
              )}
            </div>

            {/* The trade being typed — LED figures; a real field sits on top so
                digits never register as site-wide shortcuts. */}
            <div className="relative mx-auto max-w-xs">
              <div
                className="pointer-events-none flex h-14 items-center justify-center rounded-xl border-2 font-mono text-3xl font-black tracking-wider"
                style={{ borderColor: "#1d3a2d", background: "#061410", color: "#4ade80" }}
                aria-hidden
              >
                {typed.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f")}
                {canType && <span style={{ animation: "nbcaret 1s step-end infinite" }}>▮</span>}
                <span className="ml-2" style={{ color: "#3d6b56" }}>€</span>
              </div>
              <input
                ref={inputRef}
                value={typed}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Your typed value"
                readOnly={!canType}
                tabIndex={canType ? 0 : -1}
                style={{ outline: "none" }}
                className="absolute inset-0 cursor-text bg-transparent text-transparent caret-transparent pointer-coarse:pointer-events-none"
                onFocus={() => ensureMusic()}
                onChange={(e) => {
                  if (!canType) return;
                  ensureMusic();
                  setTyped(e.target.value.replace(/\D/g, "").slice(0, 6));
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  submit();
                }}
              />
            </div>

            {/* Ticket clock */}
            <div className="mx-auto mt-3 h-2 max-w-md overflow-hidden rounded-full" style={{ background: "#123024" }}>
              <div className="h-full rounded-full transition-[width] duration-100 ease-linear" style={{ width: `${timeFrac * 100}%`, background: barColor }} />
            </div>
          </div>
        )}
        {!order && <div className="grid h-48 place-items-center text-sm font-bold" style={{ color: "#3d6b56" }}>🔔 …</div>}
      </div>

      {/* Keypad — trading-terminal keys for touch play. */}
      <div className="mx-auto mt-3 grid max-w-[16rem] grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "enter"].map((k) =>
          k === "enter" ? (
            <button
              key={k}
              type="button"
              onClick={submit}
              title="Lock the trade (Enter)"
              className="rounded-xl border-2 border-b-4 border-[#3f9c17] bg-[#58cc02] py-2 text-lg font-black text-white transition active:translate-y-0.5 active:border-b-2"
            >
              ✓
            </button>
          ) : k === "back" ? (
            <button
              key={k}
              type="button"
              onClick={() => press("back")}
              title="Delete (Backspace)"
              className="rounded-xl border-2 border-b-4 border-[#c4b5a0] bg-[#f3ede2] py-2 text-lg font-black text-[#5a3a08] transition active:translate-y-0.5 active:border-b-2"
            >
              ⌫
            </button>
          ) : (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className="rounded-xl border-2 border-b-4 border-[#4a94c4] bg-white py-2 text-lg font-black text-[#0c4a6e] transition active:translate-y-0.5 active:border-b-2"
            >
              {k}
            </button>
          ),
        )}
      </div>

      {/* Trades locked — the session blotter; on a desktop it lives in the
          frame's record pane, so this row is phones only. */}
      <div className="mt-3 flex min-h-[2.5rem] flex-wrap items-center gap-2 lg:hidden">
        {history.map((h, i) => (
          <span
            key={i}
            lang="fr"
            title={h.words}
            className="inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 font-mono text-sm font-black"
            style={{ borderColor: "#0f8a5f", background: "#e8f7ef", color: "#0a6b48", animation: "nbland 420ms cubic-bezier(.2,.7,.3,1.25) both" }}
          >
            {h.side === "ACHAT" ? "▲" : "▼"} {frenchDigits(h.value)} €
          </span>
        ))}
      </div>

      {/* Level-done: a beat of fanfare, then the next level deals itself. */}
      {levelDone && !over && !won && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl border-4 border-sky-200 bg-white p-5 text-center shadow-2xl">
            <p className="text-2xl font-black" style={{ color: "#ff9600" }}>Level {level} complete!</p>
            <p className="text-sm font-semibold" style={{ color: "#075985" }}>
              Score {score} · level {level + 1}: up to {frenchDigits(LEVELS[Math.min(level, LEVELS.length - 1)].max)}…
            </p>
          </div>
        </div>
      )}

      {/* Closing bell / margin call — the post-mortem (patch 23). */}
      {(over || won) && (
        <GameOver
          emoji={won ? "🔔" : "📉"}
          title={won ? "Market closed!" : "Appel de marge !"}
          score={<>{score} · level {level}</>}
          won={won}
          misses={misses}
          fallbackSio="SIO-007"
          onReplay={reset}
          exitHref="/"
        />
      )}
    </div>
    </GameFrame>
  );
}
