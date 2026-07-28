"use client";

/**
 * NumBus — an original concept by Dr Daniel Chan.
 *
 * You are the only person at the stop who understands the announcements. A
 * bus pulls in, the tannoy calls its number in French, and the queue looks at
 * you: their thought bubbles hold a "?" until you key the number onto the
 * board. Get it right and they board; run the clock down and the bus leaves
 * without them.
 *
 * Nothing on screen explains the number — the announcement is the question and
 * the blind is the answer. The reasoning behind a number (why 97 is 4 × 20 +
 * 17, why 80 keeps its -s) waits behind the WHY button, on demand only.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { speak } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { sfx } from "@/games/audio/sfx";
import CreditsSplash from "@/games/CreditsSplash";
import SoundControl from "@/components/SoundControl";
import { logEvent } from "@/lib/firebase/usage";
import { holdDigitKeys } from "@/lib/useChoiceKeys";
import { blindWidth, getLine, type Blind, type NumBusLine, type NumBusRound } from "./lines";

const BUSES_PER_RUN = 10;
const LIVES = 3;
const ARRIVE_MS = 1500;
const LEAVE_MS = 1300;
const CORRECT_HOLD_MS = 1700;

/* ── the scenery ───────────────────────────────────────────────────────── */

type Backdrop = NumBusLine["backdrop"];

const SCENE: Record<Backdrop, { sky: string; ground: string; block: string; lit: boolean; ink: string }> = {
  jour: {
    sky: "linear-gradient(180deg,#5fb8ee 0%,#a8dcfa 52%,#e4f4fe 100%)",
    ground: "linear-gradient(180deg,#5c6470 0%,#3f4650 100%)",
    block: "#7f96ad",
    lit: false,
    ink: "#0b3d5c",
  },
  crepuscule: {
    sky: "linear-gradient(180deg,#3b3470 0%,#a75a75 55%,#f0a765 100%)",
    ground: "linear-gradient(180deg,#39323f 0%,#241f2a 100%)",
    block: "#4b3f5c",
    lit: true,
    ink: "#2a1a3a",
  },
  gare: {
    sky: "linear-gradient(180deg,#48586e 0%,#8ba0b8 50%,#cbd8e4 100%)",
    ground: "linear-gradient(180deg,#5a5f66 0%,#3a3e44 100%)",
    block: "#6a7787",
    lit: false,
    ink: "#20303f",
  },
  nuit: {
    sky: "linear-gradient(180deg,#070d26 0%,#141d46 58%,#2b3565 100%)",
    ground: "linear-gradient(180deg,#171a2c 0%,#0b0d18 100%)",
    block: "#1e2544",
    lit: true,
    ink: "#0a1030",
  },
};

/** A deterministic skyline — no Math.random in render, so the buildings stay
 *  put between frames. Widths and heights come off the index, which keeps the
 *  roofline irregular without a random seed. */
function Skyline({ backdrop }: { backdrop: Backdrop }) {
  const s = SCENE[backdrop];
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[52px] flex items-end gap-[5px] px-2 opacity-85">
      {Array.from({ length: 13 }).map((_, i) => {
        const h = 34 + ((i * 43) % 78);
        const w = 34 + ((i * 29) % 40);
        return (
          <div
            key={i}
            className="rounded-t-[4px]"
            style={{ height: h, width: w, background: s.block, boxShadow: "inset -5px 0 0 rgba(0,0,0,.2)" }}
          >
            {s.lit &&
              Array.from({ length: Math.max(1, Math.floor(h / 20)) }).map((_, r) => (
                <span key={r} className="mt-[5px] flex justify-center gap-[4px]">
                  {[0, 1].map((c) => (
                    <span
                      key={c}
                      className="block h-[4px] w-[5px] rounded-[1px]"
                      style={{ background: (i + r + c) % 3 === 0 ? "#ffd77a" : "rgba(255,215,122,.18)" }}
                    />
                  ))}
                </span>
              ))}
          </div>
        );
      })}
    </div>
  );
}

/** The stop itself: the line's sign on its post, and — where there is room for
 *  it — the glass shelter behind the queue. A phone-width screen has to fit a
 *  bus as well, so the shelter is the part that gives way. */
function Shelter({ line }: { line: NumBusLine }) {
  return (
    <div className="pointer-events-none absolute bottom-[50px] left-1 flex items-end sm:left-4">
      <div className="flex flex-col items-center self-start">
        <div className="rounded-md border-2 border-white/90 bg-[#14304a] px-2 py-[3px] text-[10px] font-black tracking-wider text-[#ffc233] shadow-md">
          {line.label}
        </div>
        <div className="h-[86px] w-[4px] bg-[#aeb9c4]" />
      </div>
      <div className="relative ml-[-2px] hidden h-[78px] w-[108px] sm:block">
        <div className="absolute inset-x-0 top-0 h-[8px] rounded-sm bg-[#8d9aa8] shadow-md" />
        <div className="absolute inset-x-[6px] bottom-0 top-[8px] rounded-b-sm border-x-[5px] border-[#8d9aa8] bg-white/30" />
        <div className="absolute inset-x-[14px] bottom-[10px] h-[7px] rounded-sm bg-[#b0762f]" />
      </div>
    </div>
  );
}

// All faces, so the queue lines up at one height whatever the platform's emoji
// font does with full-body figures.
const QUEUE = ["👵", "🧑‍🦱", "🧔", "👩‍🦰", "👨‍🦳"];

/** The people who cannot follow the announcement. Their bubbles carry a "?"
 *  until you put the number up for them. */
function Queue({ bubble, boarding }: { bubble: string; boarding: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-[48px] left-[3.6rem] flex items-end gap-0 sm:left-[11.8rem]">
      {QUEUE.map((p, i) => (
        <span
          key={i}
          className={`relative block text-[22px] leading-none transition-all duration-700 sm:text-[30px] ${
            i >= 3 ? "hidden sm:block" : "block"
          }`}
          style={{
            transform: boarding ? `translateX(${120 + i * 14}px)` : "none",
            opacity: boarding ? 0 : 1,
            transitionDelay: `${i * 90}ms`,
          }}
        >
          <span
            className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border border-black/10 bg-white px-1.5 py-[1px] text-[10px] font-black text-slate-800 shadow-sm"
            style={{ opacity: bubble ? 1 : 0, transition: "opacity .25s" }}
          >
            {bubble}
          </span>
          {p}
        </span>
      ))}
    </div>
  );
}

type VehicleSpot = "off" | "stop" | "gone";

function Vehicle({
  line,
  spot,
  panel,
  state,
}: {
  line: NumBusLine;
  spot: VehicleSpot;
  panel: string;
  state: "waiting" | "ok" | "bad";
}) {
  const moving = spot !== "stop";
  const skin =
    line.vehicle === "train" ? "#dfe6ee" : line.vehicle === "car" ? "#f0f3f6" : "#f4b400";
  const trim =
    line.vehicle === "train" ? "#1f5fa8" : line.vehicle === "car" ? "#2f6f4f" : "#d18f00";
  const width = line.vehicle === "train" ? 252 : line.vehicle === "car" ? 232 : 210;

  return (
    // Scale lives on the outer wrapper so the slide-in transform below stays
    // a clean translate — a phone screen has to fit the queue too.
    <div
      className="absolute bottom-[52px] right-2 origin-bottom-right scale-[0.74] sm:right-6 sm:scale-100"
      style={{ width }}
    >
    <div
      style={{
        transform:
          spot === "off"
            ? "translateX(150%)"
            : spot === "gone"
              ? "translateX(-190%)"
              : "none",
        transition: `transform ${spot === "gone" ? LEAVE_MS : ARRIVE_MS}ms cubic-bezier(.24,.72,.32,1)`,
      }}
    >
      <div
        className="relative rounded-t-2xl rounded-b-md border-b-4 shadow-xl"
        style={{
          height: line.vehicle === "train" ? 74 : 84,
          background: `linear-gradient(180deg, ${skin} 0%, ${skin} 62%, ${trim} 62%, ${trim} 100%)`,
          borderColor: "rgba(0,0,0,.35)",
          borderTopLeftRadius: line.vehicle === "train" ? 34 : 16,
        }}
      >
        {/* the route panel above the windscreen — "??" until you answer */}
        <div
          className="absolute left-1/2 top-1.5 -translate-x-1/2 rounded border border-black/50 bg-[#10151b] px-2 py-[2px] font-mono text-[13px] font-black tracking-[0.12em] shadow-inner"
          style={{ color: state === "bad" ? "#ff7a7a" : state === "ok" ? "#8ce563" : "#ffc233" }}
        >
          {panel}
        </div>
        <div className="absolute inset-x-2 top-8 flex gap-1.5">
          {Array.from({ length: line.vehicle === "train" ? 6 : 4 }).map((_, i) => (
            <span
              key={i}
              className="h-[22px] flex-1 rounded-[3px]"
              style={{ background: "linear-gradient(180deg,#cfeaf8,#8dc2df)", boxShadow: "inset 0 -3px 0 rgba(0,0,0,.12)" }}
            />
          ))}
        </div>
        <span className="absolute bottom-[2px] left-3 h-[18px] w-[26px] rounded-[2px] bg-black/25" />
        <span className="absolute -right-[3px] top-9 h-3 w-3 rounded-full bg-[#fff2b8] shadow-[0_0_10px_#ffe27a]" />
      </div>
      <div className="relative -mt-[7px] flex justify-between px-6">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="block h-[18px] w-[18px] rounded-full border-[4px] border-[#22262b] bg-[#5b626b]"
            style={{ animation: moving ? "nbwheel .45s linear infinite" : undefined }}
          />
        ))}
      </div>
    </div>
    </div>
  );
}

/* ── the board you fill in ─────────────────────────────────────────────── */

function Board({
  blind,
  value,
  suffix,
  showCursor,
  state,
}: {
  blind: Blind;
  value: string;
  suffix?: string;
  showCursor: boolean;
  state: "typing" | "ok" | "bad";
}) {
  const colour = state === "ok" ? "#8ce563" : state === "bad" ? "#ff7a7a" : "#ffc233";
  // A two-digit bus number gets big flaps; a ten-digit phone number has to
  // shrink to keep the whole board on one line on a phone.
  const wide = blindWidth(blind) <= 5;
  const cellCls = wide
    ? "h-[56px] w-[44px] text-[30px] sm:h-[66px] sm:w-[54px] sm:text-[38px]"
    : "h-[44px] w-[26px] text-[19px] sm:h-[54px] sm:w-[38px] sm:text-[28px]";
  const glyphCls = wide ? "text-3xl sm:text-4xl" : "text-lg sm:text-2xl";
  let cell = 0;
  const parts: React.ReactNode[] = [];
  blind.forEach((part, pi) => {
    if (typeof part === "string") {
      parts.push(
        <span key={`s${pi}`} className={`px-[1px] font-black ${glyphCls}`} style={{ color: colour }}>
          {part.trim() || " "}
        </span>,
      );
      return;
    }
    for (let k = 0; k < part; k++) {
      const at = cell++;
      const ch = value[at];
      const isCursor = showCursor && at === value.length;
      parts.push(
        <span
          key={`c${pi}-${k}`}
          className={`relative flex items-center justify-center rounded-[5px] border border-black/60 font-mono font-black shadow-inner ${cellCls}`}
          style={{
            background: "linear-gradient(180deg,#1c222b 0 48%,#0a0e13 48% 52%,#1c222b 52%)",
            color: colour,
            outline: isCursor ? `2px solid ${colour}` : undefined,
            outlineOffset: 1,
          }}
        >
          {ch ? (
            <span key={`${at}-${ch}`} style={{ animation: "nbflip .26s ease-out both" }}>
              {ch}
            </span>
          ) : null}
        </span>,
      );
    }
  });
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {parts}
      {suffix && (
        <span className={`ml-1 font-black ${glyphCls}`} style={{ color: colour }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];

/* ── the game ──────────────────────────────────────────────────────────── */

type Stage = "arriving" | "asking" | "revealed" | "leaving" | "terminus";

// A line carries its own round generator, so it crosses the server/client
// boundary as an id and is looked up here rather than passed as a prop.
export default function NumBus({ lineId }: { lineId: string }) {
  const line = getLine(lineId)!;
  const scene = SCENE[line.backdrop];
  const [creditsDone, setCreditsDone] = useState(false);
  const [round, setRound] = useState<NumBusRound | null>(null);
  const [stage, setStage] = useState<Stage>("arriving");
  const [typed, setTyped] = useState("");
  const [served, setServed] = useState(0); // buses resolved so far
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [correct, setCorrect] = useState(false);
  const [left, setLeft] = useState(1); // fraction of the wait remaining
  // Read by resolve() for the speed bonus: keeping it out of resolve's deps is
  // what stops the countdown effect from restarting itself ten times a second.
  const leftRef = useRef(1);
  const [showWhy, setShowWhy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [music, setMusic] = useState(false);
  const [talking, setTalking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const width = round ? blindWidth(round.blind) : 0;
  const focus = useCallback(() => inputRef.current?.focus({ preventScroll: true }), []);

  // Digits mean answers here, so the site-wide two-digit SIO jump stands down
  // for as long as the game is mounted.
  useEffect(() => holdDigitKeys(), []);

  useEffect(() => {
    try {
      const v = parseFloat(window.localStorage.getItem("fluolingo:volume") ?? "");
      if (!Number.isNaN(v)) chiptune.setVolume(v);
    } catch {}
    return () => {
      chiptune.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const announce = useCallback((text: string, rate?: number) => {
    setTalking(true);
    window.setTimeout(() => setTalking(false), 2200);
    speak(text, "fr-FR", { rate });
  }, []);

  const pullIn = useCallback(() => {
    const next = line.next();
    setRound(next);
    setTyped("");
    setCorrect(false);
    setShowWhy(false);
    setLeft(1);
    setStage("arriving");
    after(ARRIVE_MS, () => {
      setStage("asking");
      announce(next.say);
      focus();
    });
  }, [after, announce, focus, line]);

  // The run begins when the credits clear.
  useEffect(() => {
    if (!creditsDone) return;
    void logEvent("game.start", { game: "numbus", collectionId: line.id });
    after(0, pullIn);
  }, [creditsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolve = useCallback(
    (answer: string) => {
      if (!round) return;
      clearTimers();
      const won = answer.padStart(blindWidth(round.blind), "0") === round.digits;
      const fast = leftRef.current > 0.5;
      setCorrect(won);
      setStage("revealed");
      setTyped(round.digits);
      setServed((n) => n + 1);
      void import("@/lib/firebase/responses")
        .then((m) =>
          m.recordResponse(round.words, won, {
            given: answer || "—",
            activity: `numbus:${line.id}`,
          }),
        )
        .catch(() => {});

      if (won) {
        const run = streak + 1;
        setStreak(run);
        setScore((s) => s + 10 + (fast ? 5 : 0) + (run % 3 === 0 ? 10 : 0));
        sfx.correct();
        after(CORRECT_HOLD_MS, () => setStage("leaving"));
      } else {
        setStreak(0);
        setLives((l) => l - 1);
        sfx.wrong();
        setShowWhy(true); // a wrong answer triggers the explanation
      }
    },
    [after, clearTimers, line.id, round, streak],
  );

  // The wait: the bar drains while the bus idles, and empties into a miss.
  useEffect(() => {
    if (stage !== "asking" || !round) return;
    const total = line.seconds * 1000;
    const start = performance.now();
    leftRef.current = 1;
    const id = window.setInterval(() => {
      const remaining = 1 - (performance.now() - start) / total;
      leftRef.current = Math.max(0, remaining);
      setLeft(leftRef.current);
      if (remaining <= 0) {
        window.clearInterval(id);
        resolve("");
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [stage, round, line.seconds, resolve]);

  // Pulling away, then either the next bus or the terminus.
  useEffect(() => {
    if (stage !== "leaving") return;
    after(LEAVE_MS, () => {
      if (lives <= 0 || served >= BUSES_PER_RUN) {
        setStage("terminus");
        if (lives > 0) sfx.stage();
        void logEvent("game.end", { game: "numbus", collectionId: line.id, score });
        chiptune.stop();
        setMusic(false);
      } else pullIn();
    });
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const startMusic = useCallback(() => {
    if (music || chiptune.playing()) return;
    chiptune.play("numbus");
    setMusic(true);
  }, [music]);

  // A short blind fires as soon as its last cell fills; a long one (a phone
  // number, a six-figure counter) waits for ✓, so a slip halfway through can
  // still be backspaced.
  const autoSubmits = width > 0 && width <= 4;

  const key = useCallback(
    (k: string) => {
      startMusic();
      focus();
      if (stage !== "asking" || !round) return;
      if (k === "⌫") setTyped((t) => t.slice(0, -1));
      else if (k === "✓") resolve(typed);
      else if (typed.length < width) {
        const next = typed + k;
        setTyped(next);
        if (autoSubmits && next.length === width) after(180, () => resolve(next));
      }
    },
    [after, autoSubmits, focus, resolve, round, stage, startMusic, typed, width],
  );

  const restart = useCallback(() => {
    clearTimers();
    setScore(0);
    setStreak(0);
    setLives(LIVES);
    setServed(0);
    pullIn();
  }, [clearTimers, pullIn]);

  const spot: VehicleSpot = stage === "arriving" ? "off" : stage === "leaving" || stage === "terminus" ? "gone" : "stop";
  const boardState = stage === "revealed" ? (correct ? "ok" : "bad") : "typing";
  const plate = round ? round.digits.replace(/^0+(?=\d)/, "") : "";
  // The queue's bubble is the whole premise: a "?" they cannot resolve, then
  // the number you put up for them. Long answers won't fit — they just cheer.
  const bubble =
    stage === "revealed"
      ? correct
        ? plate.length <= 4
          ? plate
          : "👍"
        : "😕"
      : stage === "asking"
        ? "?"
        : "";
  const pillCls =
    "rounded-xl border-2 border-b-4 border-white/70 bg-white/85 px-2.5 py-1 font-bold text-slate-800 shadow-sm transition hover:bg-white active:translate-y-[2px] active:border-b-2";

  const timerHue = left > 0.5 ? "#58cc02" : left > 0.25 ? "#ffc800" : "#e0567f";

  return (
    <div data-kbnav-off className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-5">
      <CreditsSplash game="NumBus" emoji="🚌" onDone={() => setCreditsDone(true)} />
      <style>{`
        @keyframes nbflip{0%{transform:rotateX(-88deg);opacity:.25}100%{transform:none;opacity:1}}
        @keyframes nbwheel{to{transform:rotate(360deg)}}
        @keyframes nbroad{to{background-position-x:-96px}}
        @keyframes nbring{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.18);opacity:1}}
      `}</style>

      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800" style={{ textShadow: "0 2px 0 #fff" }}>
            🚌 Num<span className="text-[#e0567f]">Bus</span>
          </h1>
          <p className="text-sm font-bold text-slate-600">
            {line.place} <span className="font-medium text-slate-500">— {line.label}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 font-mono text-sm">
          <span className="rounded-xl border-2 border-white/70 bg-white/85 px-2.5 py-1 font-bold shadow-sm">
            {Math.min(served + (stage === "terminus" ? 0 : 1), BUSES_PER_RUN)}/{BUSES_PER_RUN}
          </span>
          <span className="rounded-xl border-2 border-white/70 bg-white/85 px-2.5 py-1 font-bold shadow-sm">
            <b className="text-[#58cc02]">{score}</b>
          </span>
          <span className="rounded-xl border-2 border-white/70 bg-white/85 px-2.5 py-1 shadow-sm" title="Buses left to miss">
            {"❤️".repeat(Math.max(0, lives))}
            <span className="opacity-25">{"🖤".repeat(Math.max(0, LIVES - lives))}</span>
          </span>
          <button type="button" onClick={() => setShowHelp(true)} title="How to play" className={pillCls}>?</button>
          <button
            type="button"
            title="Music"
            className={pillCls}
            onClick={() => {
              if (chiptune.playing()) { chiptune.stop(); setMusic(false); }
              else { chiptune.play("numbus"); setMusic(true); }
            }}
          >
            {music ? "🔊" : "🔇"}
          </button>
          <SoundControl />
        </div>
      </header>

      {/* ── the stop ── */}
      <div className="relative h-[248px] overflow-hidden rounded-3xl border-4 border-white shadow-xl" style={{ background: scene.sky }}>
        <Skyline backdrop={line.backdrop} />

        {/* The road is laid before anything that stands on it, so the queue's
            feet and the wheels sit ON the tarmac instead of under it. */}
        <div className="absolute inset-x-0 bottom-0 h-[56px]" style={{ background: scene.ground }}>
          <div
            className="absolute inset-x-0 top-1/2 h-[4px]"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg,#f5f0d8 0 48px,transparent 48px 96px)",
              animation: spot === "stop" ? undefined : "nbroad .5s linear infinite",
            }}
          />
        </div>

        <Shelter line={line} />
        <Queue bubble={bubble} boarding={stage === "revealed" && correct} />
        {round && (
          <Vehicle
            line={line}
            spot={spot}
            panel={stage === "revealed" ? plate : "??"}
            state={boardState === "typing" ? "waiting" : boardState}
          />
        )}

        {/* the tannoy, pulsing while it speaks */}
        <button
          type="button"
          onClick={() => round && stage === "asking" && announce(round.say)}
          title="Repeat"
          className="absolute left-3 top-4 text-2xl transition sm:text-3xl"
          style={{ animation: talking ? "nbring .7s ease-in-out infinite" : undefined }}
        >
          📢
        </button>

        {/* the wait */}
        <div className="absolute inset-x-0 top-0 h-[6px] bg-black/20">
          <div
            className="h-full transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.max(0, left) * 100}%`, background: timerHue }}
          />
        </div>
      </div>

      {/* ── the board ── */}
      <div className="relative rounded-3xl border-4 border-white bg-slate-900/90 px-4 py-3 shadow-xl transition focus-within:border-[#8ec5ff]">
        {stage === "revealed" && round && round.why.length > 0 && (
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            // Rides the board's top edge rather than sitting inside it: a
            // ten-cell phone number needs every pixel of the width.
            className={`absolute -top-3 right-4 z-10 rounded-full border-2 px-2 py-0.5 text-[0.6rem] font-black tracking-wider transition ${
              showWhy ? "border-white bg-white text-slate-900" : "border-white/70 bg-slate-800 text-white/90 hover:bg-slate-700"
            }`}
          >
            WHY
          </button>
        )}

        {round && (
          <Board
            blind={round.blind}
            value={typed}
            suffix={round.suffix}
            showCursor={stage === "asking"}
            state={boardState}
          />
        )}

        {/* Focus lives in a real field so the browser offers a numeric keypad
            on touch and the site-wide digit shortcuts keep out of the way. */}
        <input
          ref={inputRef}
          value={typed}
          inputMode="numeric"
          autoComplete="off"
          aria-label="Bus number"
          // The board itself shows the focus (its border lights up), so the
          // site-wide focus ring would only draw a box round nothing.
          style={{ outline: "none" }}
          className="absolute inset-x-4 top-3 h-[78px] w-auto cursor-pointer bg-transparent text-transparent caret-transparent"
          onChange={(e) => {
            if (stage !== "asking") return;
            const next = e.target.value.replace(/\D/g, "").slice(0, width);
            startMusic();
            setTyped(next);
            if (autoSubmits && next.length === width) after(180, () => resolve(next));
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (stage === "asking") resolve(typed);
            else if (stage === "revealed" && !correct) setStage("leaving");
          }}
        />

        {stage === "revealed" && round && (
          <p className="mt-3 text-center text-lg font-black" lang="fr" style={{ color: correct ? "#8ce563" : "#ff9d9d" }}>
            {round.words}
          </p>
        )}
        {showWhy && stage === "revealed" && round && (
          <ul className="mt-2 space-y-1 rounded-2xl bg-white/10 p-3 text-[13px] leading-snug text-white/90">
            {round.why.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {/* ── the announcement again, at speed or slowly ── */}
      <div className="grid grid-cols-2 gap-2">
        {([
          ["🔊", undefined, "Repeat"],
          ["🐢", 0.55, "Repeat slowly"],
        ] as const).map(([glyph, rate, title]) => (
          <button
            key={glyph}
            type="button"
            onClick={() => round && announce(round.say, rate)}
            disabled={!round || stage !== "asking"}
            title={title}
            className="rounded-2xl border-2 border-b-4 border-sky-300 bg-sky-100 py-3 text-xl font-black text-sky-800 transition hover:bg-sky-50 active:translate-y-[2px] active:border-b-2 disabled:opacity-40"
          >
            {glyph}
          </button>
        ))}
      </div>

      {/* ── the keypad ── */}
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {KEYPAD.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => key(k)}
            disabled={stage !== "asking"}
            className={`rounded-2xl border-2 border-b-4 py-3 text-xl font-black transition active:translate-y-[2px] active:border-b-2 disabled:opacity-40 ${
              k === "✓"
                ? "border-[#46a302] bg-[#58cc02] text-white"
                : k === "⌫"
                  ? "border-slate-400 bg-slate-200 text-slate-700"
                  : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {stage === "revealed" && !correct && (
        <button
          type="button"
          onClick={() => setStage("leaving")}
          className="rounded-2xl border-b-4 border-[#e08600] bg-[#ffc800] py-2 text-base font-black text-slate-900 transition hover:brightness-105 active:translate-y-[2px] active:border-b-0"
        >
          {lives > 0 && served < BUSES_PER_RUN ? "Bus suivant ▶" : "Terminus ▶"}
        </button>
      )}

      {stage === "terminus" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-sm rounded-3xl border-4 border-white/80 bg-white p-6 text-center shadow-2xl">
            <div className="text-5xl" aria-hidden>{lives > 0 ? "🎉" : "🚏"}</div>
            <h2 className="mt-2 text-2xl font-black text-slate-800">Terminus</h2>
            <p className="mt-1 text-lg font-bold text-slate-700">
              <b className="text-[#58cc02]">{score}</b> · {served}/{BUSES_PER_RUN}
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-5 w-full rounded-2xl border-b-4 border-[#46a302] bg-[#58cc02] py-2 text-base font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0"
            >
              Encore ▶
            </button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowHelp(false)}>
          <div className="max-w-sm rounded-3xl border-4 border-white bg-white p-6 text-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-3 text-xl font-black">How to play NumBus 🚌</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>The tannoy calls the bus number in French — <b>listen</b>.</li>
              <li>Key it onto the board in <b>digits</b>. 🔊 repeats it, 🐢 repeats it slowly.</li>
              <li>Beat the bar and the queue boards. Miss three buses and it&rsquo;s the terminus.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-2xl border-b-4 border-[#46a302] bg-[#58cc02] py-2 text-sm font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0"
            >
              Got it — play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
