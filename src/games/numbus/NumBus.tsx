"use client";

/**
 * NumBus — one game: hear French numbers, type digits before time runs out.
 * Setup picks bus range (0–99), optional times, prices, and phones (FR/SG).
 * Speech is slow by default; ⏸ pause and 🔊/🐢 repeat are always available.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { speak, pauseSpeech, resumeSpeech, isSpeechPaused } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { sfx } from "@/games/audio/sfx";
import CreditsSplash from "@/games/CreditsSplash";
import SoundControl from "@/components/SoundControl";
import { logEvent } from "@/lib/firebase/usage";
import { holdDigitKeys } from "@/lib/useChoiceKeys";
import { blindWidth, configSummary, dealRound, type Blind, type NumBusConfig, type NumBusMode, type NumBusRound } from "./config";

const ROUNDS_PER_RUN = 10;
const LIVES = 3;
const ARRIVE_MS = 2200;
const LEAVE_MS = 2000;
const CORRECT_HOLD_MS = 2600;
const GRACE_MS = 1800;
const DEFAULT_RATE = 0.48;
const SLOWER_RATE = 0.32;

/** Rough spoken length, used only as a safety net when the voice reports
 *  nothing back. ~14 characters a second at rate 1, floored and capped so a
 *  freak string can neither cut the announcement off nor stall the round. */
const speechMs = (text: string, rate: number) =>
  Math.min(15000, Math.max(2500, (text.length / (14 * Math.max(0.2, rate))) * 1000));

/* ── shared board ──────────────────────────────────────────────────────── */

function Board({
  blind,
  value,
  suffix,
  showCursor,
  state,
  warm,
}: {
  blind: Blind;
  value: string;
  suffix?: string;
  showCursor: boolean;
  state: "typing" | "ok" | "bad";
  warm?: boolean;
}) {
  const colour = state === "ok" ? "#8ce563" : state === "bad" ? "#ff7a7a" : warm ? "#ffb84d" : "#ffc233";
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
          {part.trim() || " "}
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

/* ── bus + time scenery ────────────────────────────────────────────────── */

type VehicleSpot = "off" | "stop" | "gone";

const QUEUE = ["👵", "🧑‍🦱", "🧔", "👩‍🦰", "👨‍🦳"];

function Queue({ bubble, boarding }: { bubble: string; boarding: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-[48px] left-[3.6rem] flex items-end gap-0 sm:left-[11.8rem]">
      {QUEUE.map((p, i) => (
        <span
          key={i}
          className={`relative block text-[22px] leading-none transition-all duration-700 sm:text-[30px] ${i >= 3 ? "hidden sm:block" : "block"}`}
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

function Vehicle({
  spot,
  panel,
  state,
  train,
}: {
  spot: VehicleSpot;
  panel: string;
  state: "waiting" | "ok" | "bad";
  train?: boolean;
}) {
  const skin = train ? "#dfe6ee" : "#f4b400";
  const trim = train ? "#1f5fa8" : "#d18f00";
  const width = train ? 252 : 210;
  return (
    <div className="absolute bottom-[52px] right-2 origin-bottom-right scale-[0.74] sm:right-6 sm:scale-100" style={{ width }}>
      <div
        style={{
          transform: spot === "off" ? "translateX(150%)" : spot === "gone" ? "translateX(-190%)" : "none",
          transition: `transform ${spot === "gone" ? LEAVE_MS : ARRIVE_MS}ms cubic-bezier(.24,.72,.32,1)`,
        }}
      >
        <div
          className="relative rounded-t-2xl rounded-b-md border-b-4 shadow-xl"
          style={{
            height: train ? 74 : 84,
            background: `linear-gradient(180deg, ${skin} 0%, ${skin} 62%, ${trim} 62%, ${trim} 100%)`,
            borderColor: "rgba(0,0,0,.35)",
            borderTopLeftRadius: train ? 34 : 16,
          }}
        >
          <div
            className="absolute left-1/2 top-1.5 -translate-x-1/2 rounded border border-black/50 bg-[#10151b] px-2 py-[2px] font-mono text-[13px] font-black tracking-[0.12em] shadow-inner"
            style={{ color: state === "bad" ? "#ff7a7a" : state === "ok" ? "#8ce563" : "#ffc233" }}
          >
            {panel}
          </div>
          <div className="absolute inset-x-2 top-8 flex gap-1.5">
            {Array.from({ length: train ? 6 : 4 }).map((_, i) => (
              <span key={i} className="h-[22px] flex-1 rounded-[3px]" style={{ background: "linear-gradient(180deg,#cfeaf8,#8dc2df)", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.12)" }} />
            ))}
          </div>
        </div>
        <div className="relative -mt-[7px] flex justify-between px-6">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="block h-[18px] w-[18px] rounded-full border-[4px] border-[#22262b] bg-[#5b626b]"
              style={{ animation: spot !== "stop" ? "nbwheel .45s linear infinite" : undefined }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BusStopScene({
  mode,
  label,
  spot,
  panel,
  boardState,
  bubble,
  boarding,
  left,
  timerHue,
  onRepeat,
  talking,
}: {
  mode: "bus" | "time";
  label: string;
  spot: VehicleSpot;
  panel: string;
  boardState: "waiting" | "ok" | "bad";
  bubble: string;
  boarding: boolean;
  left: number;
  timerHue: string;
  onRepeat: () => void;
  talking: boolean;
}) {
  const train = mode === "time";
  const sky = train
    ? "linear-gradient(180deg,#48586e 0%,#8ba0b8 50%,#cbd8e4 100%)"
    : "linear-gradient(180deg,#5fb8ee 0%,#a8dcfa 52%,#e4f4fe 100%)";
  const ground = train
    ? "linear-gradient(180deg,#5a5f66 0%,#3a3e44 100%)"
    : "linear-gradient(180deg,#5c6470 0%,#3f4650 100%)";
  return (
    <div className="relative h-[248px] overflow-hidden rounded-3xl border-4 border-white shadow-xl" style={{ background: sky }}>
      <div className="pointer-events-none absolute inset-x-0 bottom-[52px] flex items-end gap-[5px] px-2 opacity-85">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="rounded-t-[4px] bg-[#7f96ad]" style={{ height: 34 + ((i * 43) % 68), width: 34 + ((i * 29) % 36), boxShadow: "inset -5px 0 0 rgba(0,0,0,.2)" }} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[56px]" style={{ background: ground }}>
        <div
          className="absolute inset-x-0 top-1/2 h-[4px]"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg,#f5f0d8 0 48px,transparent 48px 96px)",
            animation: spot === "stop" ? undefined : "nbroad .5s linear infinite",
          }}
        />
      </div>
      <div className="pointer-events-none absolute bottom-[50px] left-1 flex items-end sm:left-4">
        <div className="flex flex-col items-center">
          <div className="rounded-md border-2 border-white/90 bg-[#14304a] px-2 py-[3px] text-[10px] font-black tracking-wider text-[#ffc233] shadow-md">
            {label}
          </div>
          <div className="h-[86px] w-[4px] bg-[#aeb9c4]" />
        </div>
      </div>
      {mode === "bus" && <Queue bubble={bubble} boarding={boarding} />}
      {mode === "time" && (
        <div className="pointer-events-none absolute bottom-[58px] left-1/2 -translate-x-1/2 rounded-lg border-2 border-[#1e3a52] bg-[#0c1824] px-4 py-2 shadow-xl">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#7eb8e8]">Prochains départs</p>
          <p className="mt-1 text-center font-mono text-2xl font-black text-[#ffc233]">{panel === "??" ? "--:--" : `${panel.slice(0, 2)}:${panel.slice(2, 4)}`}</p>
        </div>
      )}
      {mode === "bus" && <Vehicle spot={spot} panel={panel} state={boardState} />}
      {mode === "time" && spot !== "off" && spot !== "gone" && (
        <Vehicle spot="stop" panel={panel} state={boardState} train />
      )}
      <button
        type="button"
        onClick={onRepeat}
        title="Repeat"
        className="absolute left-3 top-4 text-2xl transition sm:text-3xl"
        style={{ animation: talking ? "nbring .7s ease-in-out infinite" : undefined }}
      >
        📢
      </button>
      <div className="absolute inset-x-0 top-0 h-[6px] bg-black/20">
        <div className="h-full transition-[width] duration-100 ease-linear" style={{ width: `${Math.max(0, left) * 100}%`, background: timerHue }} />
      </div>
    </div>
  );
}

/* ── NumBurger checkout ────────────────────────────────────────────────── */

function BurgerScene({
  left,
  timerHue,
  totalLabel,
  onRepeat,
  talking,
}: {
  left: number;
  timerHue: string;
  totalLabel: string;
  onRepeat: () => void;
  talking: boolean;
}) {
  return (
    <div
      className="relative h-[248px] overflow-hidden rounded-3xl border-4 border-[#ffb74d] shadow-xl"
      style={{ background: "linear-gradient(180deg,#fff8e8 0%,#ffe0b2 55%,#ffcc80 100%)" }}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b-2 border-[#e65100]/20 bg-[#ff6f00] px-4 py-2">
        <span className="text-lg font-black text-white">🍔 Num<span className="text-[#ffe082]">Burger</span></span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">caisse</span>
      </div>
      <div className="absolute left-4 top-14 text-6xl opacity-90" aria-hidden>🍔</div>
      <div className="absolute right-4 top-14 text-5xl opacity-70" aria-hidden>🍟</div>
      <div className="absolute inset-x-6 bottom-16 rounded-2xl border-2 border-[#bf360c] bg-[#3e2723] px-4 py-3 shadow-inner">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a1887f]">Total à payer</p>
        <p className="mt-1 font-mono text-3xl font-black text-[#ffb74d]">{totalLabel || "· · ·"}</p>
      </div>
      <button type="button" onClick={onRepeat} title="Repeat" className="absolute left-3 top-14 text-2xl" style={{ animation: talking ? "nbring .7s ease-in-out infinite" : undefined }}>
        📢
      </button>
      <div className="absolute inset-x-0 top-[42px] h-[6px] bg-black/10">
        <div className="h-full transition-[width] duration-100 ease-linear" style={{ width: `${Math.max(0, left) * 100}%`, background: timerHue }} />
      </div>
    </div>
  );
}

/* ── NumBureau desk ────────────────────────────────────────────────────── */

function BureauScene({
  left,
  timerHue,
  onRepeat,
  talking,
  phoneStyle,
}: {
  left: number;
  timerHue: string;
  onRepeat: () => void;
  talking: boolean;
  phoneStyle: "fr" | "sg";
}) {
  return (
    <div
      className="relative h-[248px] overflow-hidden rounded-3xl border-4 border-[#90a4ae] shadow-xl"
      style={{ background: "linear-gradient(180deg,#eceff1 0%,#cfd8dc 55%,#b0bec5 100%)" }}
    >
      <div className="absolute inset-x-0 top-0 border-b border-[#78909c] bg-[#546e7a] px-4 py-2">
        <span className="text-lg font-black text-white">📞 Num<span className="text-[#b0bec5]">Bureau</span></span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#8d6e63] to-[#a1887f]" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-7xl drop-shadow-lg" aria-hidden>☎️</div>
      <div className="absolute bottom-24 left-6 text-4xl opacity-60" aria-hidden>📁</div>
      <div className="absolute bottom-24 right-6 text-4xl opacity-60" aria-hidden>🗂️</div>
      <p className="absolute left-0 right-0 top-16 text-center text-xs font-bold uppercase tracking-widest text-[#455a64]">
        {phoneStyle === "sg" ? "Singapore — four two-digit blocks" : "Standard — five two-digit blocks"}
      </p>
      <button type="button" onClick={onRepeat} title="Repeat" className="absolute left-3 top-14 text-2xl" style={{ animation: talking ? "nbring .7s ease-in-out infinite" : undefined }}>
        📢
      </button>
      <div className="absolute inset-x-0 top-[42px] h-[6px] bg-black/10">
        <div className="h-full transition-[width] duration-100 ease-linear" style={{ width: `${Math.max(0, left) * 100}%`, background: timerHue }} />
      </div>
    </div>
  );
}

/* ── the game ──────────────────────────────────────────────────────────── */

type Stage = "arriving" | "asking" | "revealed" | "leaving" | "terminus";

export default function NumBus({ config, onQuit }: { config: NumBusConfig; onQuit?: () => void }) {
  const [creditsDone, setCreditsDone] = useState(false);
  const [round, setRound] = useState<NumBusRound | null>(null);
  const [stage, setStage] = useState<Stage>("arriving");
  const [typed, setTyped] = useState("");
  const [served, setServed] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [correct, setCorrect] = useState(false);
  const [left, setLeft] = useState(1);
  const leftRef = useRef(1);
  const [typingOpen, setTypingOpen] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [music, setMusic] = useState(false);
  const [talking, setTalking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);

  const mode = round?.mode ?? "bus";

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

  // The hidden input exists so a physical keyboard can type digits. On a phone,
  // focusing it only summons the OS keyboard over the game, so touch devices
  // drive the on-screen keypad instead and never take focus.
  const focus = useCallback(() => {
    try {
      if (!window.matchMedia("(pointer: fine)").matches) return;
    } catch {}
    inputRef.current?.focus({ preventScroll: true });
  }, []);

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

  const announce = useCallback((text: string, rate = DEFAULT_RATE) => {
    setTalking(true);
    setSpeechPaused(false);
    setTypingOpen(false);
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      setTalking(false);
      setTypingOpen(true);
    };
    speak(text, "fr-FR", {
      rate,
      onDone: () => {
        setTalking(false);
        after(GRACE_MS, open);
      },
    });
    // iOS Safari never fires `onend` for speech it didn't start from a tap, and
    // a muted or banked voice skips onDone altogether. Without this fallback
    // typing would never open and the keypad would stay disabled for good.
    after(speechMs(text, rate) + GRACE_MS, open);
  }, [after]);

  /** Replay without freezing an open countdown — for 🔊/🐢/⏸ mid-round. */
  const repeatSay = useCallback((text: string, rate = DEFAULT_RATE) => {
    setTalking(true);
    setSpeechPaused(false);
    speak(text, "fr-FR", { rate, onDone: () => setTalking(false) });
  }, []);

  const pullIn = useCallback(() => {
    const next = dealRound(config);
    setRound(next);
    setTyped("");
    setCorrect(false);
    setShowWhy(false);
    setLeft(1);
    leftRef.current = 1;
    setTypingOpen(false);
    setStage("arriving");
    after(ARRIVE_MS, () => {
      setStage("asking");
      announce(next.say);
      focus();
    });
  }, [after, announce, config, focus]);

  useEffect(() => {
    if (!creditsDone) return;
    void logEvent("game.start", { game: "numbus", collectionId: configSummary(config) });
    after(0, pullIn);
  }, [creditsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolve = useCallback(
    (answer: string) => {
      if (!round) return;
      clearTimers();
      setTypingOpen(false);
      const won = answer.padStart(blindWidth(round.blind), "0") === round.digits;
      const fast = leftRef.current > 0.5;
      setCorrect(won);
      setStage("revealed");
      setTyped(round.digits);
      setServed((n) => n + 1);
      void import("@/lib/firebase/responses")
        .then((m) => m.recordResponse(round.words, won, { given: answer || "—", activity: "numbus" }))
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
        setShowWhy(true);
      }
    },
    [after, clearTimers, round, streak],
  );

  useEffect(() => {
    if (stage !== "asking" || !round || !typingOpen) return;
    const total = round.seconds * 1000;
    const start = performance.now();
    leftRef.current = 1;
    setLeft(1);
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
  }, [stage, round, typingOpen, resolve]);

  useEffect(() => {
    if (stage !== "leaving") return;
    after(LEAVE_MS, () => {
      const dead = lives <= 0;
      const runDone = served >= ROUNDS_PER_RUN;
      if (dead || runDone) {
        setStage("terminus");
        if (!dead) sfx.stage();
        void logEvent("game.end", { game: "numbus", collectionId: configSummary(config), score });
        chiptune.stop();
        setMusic(false);
      } else {
        pullIn();
      }
    });
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const startMusic = useCallback(() => {
    if (music || chiptune.playing()) return;
    chiptune.play("numbus");
    setMusic(true);
  }, [music]);

  const autoSubmits = width > 0 && width <= 4;

  const key = useCallback(
    (k: string) => {
      startMusic();
      focus();
      if (stage !== "asking" || !round) return;
      // A tap is also consent to start the clock: if the voice never reported
      // back, the first key opens typing rather than being swallowed.
      if (!typingOpen) setTypingOpen(true);
      if (k === "⌫") setTyped((t) => t.slice(0, -1));
      else if (k === "✓") resolve(typed);
      else if (typed.length < width) {
        const next = typed + k;
        setTyped(next);
        if (autoSubmits && next.length === width) after(180, () => resolve(next));
      }
    },
    [after, autoSubmits, focus, resolve, round, stage, startMusic, typed, typingOpen, width],
  );

  const togglePause = useCallback(() => {
    if (isSpeechPaused()) {
      resumeSpeech();
      setSpeechPaused(false);
      if (stage === "asking") setTypingOpen(true);
    } else {
      pauseSpeech();
      setSpeechPaused(true);
      setTypingOpen(false);
    }
  }, [stage]);

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

  const brandHue = mode === "price" ? "#e65100" : mode === "phone" ? "#546e7a" : "#e0567f";
  const progressLabel = `${Math.min(served + (stage === "terminus" ? 0 : 1), ROUNDS_PER_RUN)}/${ROUNDS_PER_RUN}`;

  const priceDisplay =
    round && mode === "price" && typed.length >= 2
      ? `${typed.slice(0, 2)},${typed.slice(2).padEnd(2, "·")}`
      : round && mode === "price" && typed.length > 0
        ? `${typed.padEnd(2, "·")},··`
        : "";

  const sceneProps = {
    left,
    timerHue,
    onRepeat: () => round && stage === "asking" && repeatSay(round.say),
    talking,
  };

  const stopLabel = mode === "time" ? "Horaires" : `${config.min}–${config.max}`;

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
            {mode === "price" ? (
              <>🍔 Num<span style={{ color: brandHue }}>Burger</span></>
            ) : mode === "phone" ? (
              <>📞 Num<span style={{ color: brandHue }}>Bureau</span></>
            ) : mode === "time" ? (
              <>🕑 Horaires</>
            ) : (
              <>🚌 Num<span style={{ color: brandHue }}>Bus</span></>
            )}
          </h1>
          <p className="text-sm font-bold text-slate-600">{configSummary(config)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 font-mono text-sm">
          <span className="rounded-xl border-2 border-white/70 bg-white/85 px-2.5 py-1 font-bold shadow-sm">{progressLabel}</span>
          <span className="rounded-xl border-2 border-white/70 bg-white/85 px-2.5 py-1 font-bold shadow-sm"><b className="text-[#58cc02]">{score}</b></span>
          <span className="rounded-xl border-2 border-white/70 bg-white/85 px-2.5 py-1 shadow-sm" title="Lives">
            {"❤️".repeat(Math.max(0, lives))}
            <span className="opacity-25">{"🖤".repeat(Math.max(0, LIVES - lives))}</span>
          </span>
          <button type="button" onClick={() => setShowHelp(true)} title="How to play" className={pillCls}>?</button>
          {onQuit && (
            <button type="button" onClick={onQuit} title="Settings" className={pillCls}>
              ⚙️
            </button>
          )}
          <button type="button" title="Music" className={pillCls} onClick={() => { if (chiptune.playing()) { chiptune.stop(); setMusic(false); } else { chiptune.play("numbus"); setMusic(true); } }}>
            {music ? "🔊" : "🔇"}
          </button>
          <SoundControl />
        </div>
      </header>

      {mode === "bus" || mode === "time" ? (
        <BusStopScene
          mode={mode}
          label={stopLabel}
          spot={spot}
          panel={stage === "revealed" ? plate : "??"}
          boardState={boardState === "typing" ? "waiting" : boardState}
          bubble={bubble}
          boarding={stage === "revealed" && correct}
          {...sceneProps}
        />
      ) : mode === "price" ? (
        <BurgerScene {...sceneProps} totalLabel={priceDisplay} />
      ) : (
        <BureauScene {...sceneProps} phoneStyle={config.phoneStyle} />
      )}

      <div
        className={`relative rounded-3xl border-4 px-4 py-3 shadow-xl transition focus-within:border-[#8ec5ff] ${
          mode === "price" ? "border-[#ffb74d] bg-[#3e2723]/95" : mode === "phone" ? "border-[#78909c] bg-[#37474f]/95" : "border-white bg-slate-900/90"
        }`}
      >
        {stage === "revealed" && round && round.why.length > 0 && (
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
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
            showCursor={stage === "asking" && typingOpen}
            state={boardState}
            warm={mode === "price"}
          />
        )}
        <input
          ref={inputRef}
          value={typed}
          inputMode="numeric"
          autoComplete="off"
          aria-label="Answer digits"
          style={{ outline: "none" }}
          className="absolute inset-x-4 top-3 h-[78px] w-auto cursor-pointer bg-transparent text-transparent caret-transparent pointer-coarse:pointer-events-none"
          onChange={(e) => {
            if (stage !== "asking") return;
            if (!typingOpen) setTypingOpen(true);
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

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => round && repeatSay(round.say)}
          disabled={!round || stage !== "asking"}
          title="Repeat"
          className="rounded-2xl border-2 border-b-4 border-sky-300 bg-sky-100 py-3 text-xl font-black text-sky-800 transition hover:bg-sky-50 active:translate-y-[2px] active:border-b-2 disabled:opacity-40"
        >
          🔊
        </button>
        <button
          type="button"
          onClick={togglePause}
          disabled={!round || stage !== "asking" || !talking && !speechPaused}
          title={speechPaused ? "Resume" : "Pause"}
          className="rounded-2xl border-2 border-b-4 border-violet-300 bg-violet-100 py-3 text-xl font-black text-violet-800 transition hover:bg-violet-50 active:translate-y-[2px] active:border-b-2 disabled:opacity-40"
        >
          {speechPaused ? "▶️" : "⏸"}
        </button>
        <button
          type="button"
          onClick={() => round && repeatSay(round.say, SLOWER_RATE)}
          disabled={!round || stage !== "asking"}
          title="Repeat slowly"
          className="rounded-2xl border-2 border-b-4 border-amber-300 bg-amber-100 py-3 text-xl font-black text-amber-900 transition hover:bg-amber-50 active:translate-y-[2px] active:border-b-2 disabled:opacity-40"
        >
          🐢
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {KEYPAD.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => key(k)}
            disabled={stage !== "asking"}
            className={`rounded-2xl border-2 border-b-4 py-3 text-xl font-black transition active:translate-y-[2px] active:border-b-2 disabled:opacity-40 ${
              k === "✓" ? "border-[#46a302] bg-[#58cc02] text-white" : k === "⌫" ? "border-slate-400 bg-slate-200 text-slate-700" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {stage === "revealed" && !correct && (
        <button type="button" onClick={() => setStage("leaving")} className="rounded-2xl border-b-4 border-[#e08600] bg-[#ffc800] py-2 text-base font-black text-slate-900 transition hover:brightness-105 active:translate-y-[2px] active:border-b-0">
          {lives > 0 && served < ROUNDS_PER_RUN ? "Suivant ▶" : "Terminus ▶"}
        </button>
      )}

      {stage === "terminus" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-sm rounded-3xl border-4 border-white/80 bg-white p-6 text-center shadow-2xl">
            <div className="text-5xl" aria-hidden>{lives > 0 ? "🎉" : "🚏"}</div>
            <h2 className="mt-2 text-2xl font-black text-slate-800">Terminus</h2>
            <p className="mt-1 text-lg font-bold text-slate-700">
              <b className="text-[#58cc02]">{score}</b>
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button type="button" onClick={restart} className="w-full rounded-2xl border-b-4 border-[#46a302] bg-[#58cc02] py-2 text-base font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0">
                Encore ▶
              </button>
              {onQuit && (
                <button type="button" onClick={onQuit} className="w-full rounded-2xl border-b-4 border-slate-300 bg-white py-2 text-base font-black text-slate-700 transition hover:bg-slate-50 active:translate-y-[2px] active:border-b-0">
                  ⚙️ Réglages
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowHelp(false)}>
          <div className="max-w-sm rounded-3xl border-4 border-white bg-white p-6 text-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-3 text-xl font-black">How to play NumBus 🚌</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Listen to the French number — it speaks <b>slowly</b>. ⏸ pauses, 🔊 repeats, 🐢 even slower.</li>
              <li>Type the answer in <b>digits</b> once the bar starts — the clock waits until the speech finishes.</li>
              <li>Clear ten rounds. Miss three and it&rsquo;s the terminus.</li>
            </ol>
            <button type="button" onClick={() => setShowHelp(false)} className="mt-4 w-full rounded-2xl border-b-4 border-[#46a302] bg-[#58cc02] py-2 text-sm font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0">
              Got it — play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export type { NumBusMode };
