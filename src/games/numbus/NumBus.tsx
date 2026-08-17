"use client";

/**
 * NumBus — one game: hear French numbers, type digits before time runs out.
 * Setup picks bus range (0–99), optional times, prices, and phones (FR/SG).
 * Speech is slow by default; ⏸ pause and 🔊/🐢 repeat are always available.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { speak, pauseSpeech, resumeSpeech, isSpeechPaused } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { sfx } from "@/games/audio/sfx";
import CreditsSplash from "@/games/CreditsSplash";
import { isChannelMuted, onChannelMuteChange, setChannelMuted } from "@/games/audio/mute";
import GameFrame from "@/components/GameFrame";
import GameOver, { type GameMiss } from "@/components/GameOver";
import { reviewItemByFrench } from "@/lib/reviser";
import { logEvent } from "@/lib/firebase/usage";
import { claimDigitKeys } from "@/lib/useChoiceKeys";
import { blindWidth, configKey, dealRound, type Blind, type NumBusConfig, type NumBusMode, type NumBusRound } from "./config";

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
    <div className="relative h-[186px] overflow-hidden rounded-3xl border-4 border-white shadow-xl sm:h-[248px]" style={{ background: sky }}>
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
      {/* On a phone the train and the departures board fight for the same
          strip, and the board is the one carrying the answer. */}
      {mode === "time" && spot !== "off" && spot !== "gone" && (
        <div className="hidden sm:block">
          <Vehicle spot="stop" panel={panel} state={boardState} train />
        </div>
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
      className="relative h-[124px] overflow-hidden rounded-3xl border-4 border-[#ffb74d] shadow-xl sm:h-[248px]"
      style={{ background: "linear-gradient(180deg,#fff8e8 0%,#ffe0b2 55%,#ffcc80 100%)" }}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b-2 border-[#e65100]/20 bg-[#ff6f00] px-4 py-2">
        <span className="text-lg font-black text-white">🍔 Num<span className="text-[#ffe082]">Burger</span></span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">caisse</span>
      </div>
      {/* The brand already says burger; a second one only pushed the total down
          the screen (Dan, 2026-07-28). The fries stay, out of the way. */}
      <div className="absolute right-4 top-12 hidden text-4xl opacity-70 sm:block sm:top-14 sm:text-5xl" aria-hidden>🍟</div>
      <div className="absolute inset-x-4 bottom-2.5 rounded-2xl border-2 border-[#bf360c] bg-[#3e2723] px-4 py-2 shadow-inner sm:inset-x-6 sm:bottom-16 sm:py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a1887f]">Total à payer</p>
        <p className="mt-1 font-mono text-2xl font-black text-[#ffb74d] sm:text-3xl">{totalLabel || "· · ·"}</p>
      </div>
      <button type="button" onClick={onRepeat} title="Repeat" className="absolute left-4 top-[50px] text-2xl sm:left-1/2 sm:-translate-x-1/2" style={{ animation: talking ? "nbring .7s ease-in-out infinite" : undefined }}>
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
      className="relative h-[186px] overflow-hidden rounded-3xl border-4 border-[#90a4ae] shadow-xl sm:h-[248px]"
      style={{ background: "linear-gradient(180deg,#eceff1 0%,#cfd8dc 55%,#b0bec5 100%)" }}
    >
      <div className="absolute inset-x-0 top-0 border-b border-[#78909c] bg-[#546e7a] px-4 py-2">
        <span className="text-lg font-black text-white">📞 Num<span className="text-[#b0bec5]">Bureau</span></span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#8d6e63] to-[#a1887f] sm:h-24" />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-6xl drop-shadow-lg sm:bottom-10 sm:text-7xl" aria-hidden>☎️</div>
      <div className="absolute bottom-24 left-6 hidden text-4xl opacity-60 sm:block" aria-hidden>📁</div>
      <div className="absolute bottom-24 right-6 hidden text-4xl opacity-60 sm:block" aria-hidden>🗂️</div>
      <p className="absolute left-0 right-0 top-14 text-center text-[11px] font-bold uppercase tracking-widest text-[#455a64] sm:top-16 sm:text-xs">
        {phoneStyle === "sg" ? "Singapore — four two-digit blocks" : "Standard — five two-digit blocks"}
      </p>
      <button type="button" onClick={onRepeat} title="Repeat" className="absolute right-3 top-12 text-2xl sm:top-14" style={{ animation: talking ? "nbring .7s ease-in-out infinite" : undefined }}>
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
  const [music, setMusic] = useState(false);
  const [talking, setTalking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);
  // The run's record — every stop, what was said, what was typed. Feeds the
  // desktop live pane and, at the terminus, the post-mortem (patch 23).
  const [log, setLog] = useState<Array<{ words: string; digits: string; suffix?: string; given: string; ok: boolean }>>([]);

  const mode = round?.mode ?? "bus";

  // Listening practice with the voice muted is unplayable. The floating 🔇
  // mutes every channel at once, which is the usual way this happens.
  const voiceOff = useSyncExternalStore(
    onChannelMuteChange,
    () => isChannelMuted("voice"),
    () => false,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const keypadRef = useRef<HTMLDivElement>(null);
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

  // Physical-keyboard digits typed while the hidden input does not have focus
  // still reach the game, arbitrated centrally (see claimDigitKeys) so they can
  // never shadow another activity's answer keys.
  const keyRef = useRef<(k: string) => void>(() => {});
  useEffect(() => claimDigitKeys((d) => keyRef.current(d)), []);
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
    void logEvent("game.start", { game: "numbus", collectionId: configKey(config) });
    after(0, pullIn);
  }, [creditsDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // A pending auto-submit lives outside the general timer pool so a correction
  // can cancel it without disturbing the round's other timers.
  const submitTimer = useRef<number | null>(null);
  const cancelAutoSubmit = useCallback(() => {
    if (submitTimer.current === null) return;
    window.clearTimeout(submitTimer.current);
    submitTimer.current = null;
  }, []);
  useEffect(() => cancelAutoSubmit, [cancelAutoSubmit]);

  const resolve = useCallback(
    (answer: string) => {
      if (!round) return;
      clearTimers();
      cancelAutoSubmit();
      setTypingOpen(false);
      const won = answer.padStart(blindWidth(round.blind), "0") === round.digits;
      const fast = leftRef.current > 0.5;
      setCorrect(won);
      setStage("revealed");
      setTyped(round.digits);
      setServed((n) => n + 1);
      setLog((l) => [...l, { words: round.words, digits: round.digits, suffix: round.suffix, given: answer, ok: won }]);
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
      }
    },
    [after, cancelAutoSubmit, clearTimers, round, streak],
  );

  /** A full answer submits itself. iOS shows a digits-only keypad with no
   *  return key, so Enter can never be the only way through — and the longer
   *  shapes still leave a beat to backspace a mistyped last digit. */
  const armAutoSubmit = useCallback(
    (answer: string) => {
      cancelAutoSubmit();
      submitTimer.current = window.setTimeout(() => {
        submitTimer.current = null;
        resolve(answer);
      }, width <= 4 ? 180 : 1200);
    },
    [cancelAutoSubmit, resolve, width],
  );

  // Anchor the view on the pad as typing opens: on a phone the scene, the board
  // and the pad together are taller than the screen, and a pad half below the
  // fold is a pad you cannot use (Dan, 2026-07-28).
  useEffect(() => {
    if (stage !== "asking" || !typingOpen) return;
    keypadRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [stage, typingOpen, round]);

  useEffect(() => {
    if (stage !== "asking" || !round || !typingOpen || voiceOff) return;
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
  }, [stage, round, typingOpen, resolve, voiceOff]);

  useEffect(() => {
    if (stage !== "leaving") return;
    after(LEAVE_MS, () => {
      const dead = lives <= 0;
      const runDone = served >= ROUNDS_PER_RUN;
      if (dead || runDone) {
        setStage("terminus");
        if (!dead) sfx.stage();
        void logEvent("game.end", { game: "numbus", collectionId: configKey(config), score });
        chiptune.stop();
        setMusic(false);
      } else {
        pullIn();
      }
    });
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const startMusic = useCallback(() => {
    // Auto-start must respect a site-wide music mute — only the 🎵 button
    // itself overrides it, since pressing it is an explicit request.
    if (music || chiptune.playing() || isChannelMuted("music")) return;
    chiptune.play("numbus");
    setMusic(true);
  }, [music]);

  const key = useCallback(
    (k: string) => {
      startMusic();
      focus();
      if (stage !== "asking" || !round) return;
      cancelAutoSubmit();
      // A tap is also consent to start the clock: if the voice never reported
      // back, the first key opens typing rather than being swallowed.
      if (!typingOpen) setTypingOpen(true);
      if (k === "⌫") setTyped((t) => t.slice(0, -1));
      else if (k === "✓") resolve(typed);
      else if (typed.length < width) {
        const next = typed + k;
        setTyped(next);
        if (next.length === width) armAutoSubmit(next);
      }
    },
    [armAutoSubmit, cancelAutoSubmit, focus, resolve, round, stage, startMusic, typed, typingOpen, width],
  );
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

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
    setLog([]);
    pullIn();
  }, [clearTimers, pullIn]);

  /**
   * ⏎ submit, then ⏎ again for the next stop · Space play/pause · ⇧Space
   * slower · R from the top · Esc settings.
   *
   * Digits are deliberately NOT captured here: they belong to the focused
   * input, and a window-level digit listener would fight the 1–4 answer keys
   * the rest of the site uses.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (stage === "asking") resolve(typed);
        else if (stage === "revealed") setStage("leaving");
        else if (stage === "terminus") restart();
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (!round) return;
        if (e.shiftKey) repeatSay(round.say, SLOWER_RATE);
        else if (talking || speechPaused) togglePause();
        else if (stage === "asking") repeatSay(round.say);
        return;
      }
      if ((e.key === "r" || e.key === "R") && round && stage === "asking") {
        e.preventDefault();
        repeatSay(round.say);
        return;
      }
      if (e.key === "Escape" && onQuit) {
        e.preventDefault();
        onQuit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onQuit, repeatSay, resolve, restart, round, speechPaused, stage, talking, togglePause, typed]);

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
  const timerHue = left > 0.5 ? "#58cc02" : left > 0.25 ? "#ffc800" : "#e0567f";

  const gameTitle =
    mode === "price" ? "🍔 NumBurger" : mode === "phone" ? "📞 NumBureau" : mode === "time" ? "🕑 Timetable" : "🚌 NumBus";
  // Every wrong stop, as the post-mortem wants it: the spoken words, the digits
  // that were right, the digits typed. A number the course has a deck row for
  // (numbers-0-20 … 70-99) carries that item id, so it can be queued for ReVue.
  const misses: GameMiss[] = log
    .filter((r) => !r.ok)
    .map((r) => ({
      itemId: reviewItemByFrench(r.words)?.id,
      prompt: r.words,
      expected: r.digits.replace(/^0+(?=\d)/, "") + (r.suffix ? ` ${r.suffix}` : ""),
      given: r.given ? r.given : undefined,
    }));

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

  const stopLabel = mode === "time" ? "Timetable" : `${config.min}–${config.max}`;

  const help = (
    <>
      <ol className="list-inside list-decimal space-y-2">
        <li>Listen to the French number — it speaks <b>slowly</b>. ⏸ pauses, 🔊 repeats, 🐢 even slower.</li>
        <li>Type the answer in <b>digits</b> once the bar starts — the clock waits until the speech finishes.</li>
        <li>A full answer sends itself; ✓ sends a short one.</li>
        <li>Clear ten rounds. Miss three and it&rsquo;s the terminus.</li>
      </ol>
      {/* Keyboard shortcuts only where a keyboard exists (patch 20–21). */}
      <p className="mt-3 hidden rounded-2xl bg-[color:var(--cahier-paper)] p-3 text-[13px] font-bold text-[color:var(--cahier-ink-soft)] pointer-fine:block">
        ⏎ submit, ⏎ again for the next stop · Space play/pause · ⇧Space slower · R from the top · Esc settings
      </p>
    </>
  );

  // The desktop live record: every stop so far, newest first.
  const record = (
    <ol className="flex flex-col gap-1.5">
      {[...log].reverse().map((r, i) => (
        <li
          key={log.length - i}
          lang="fr"
          className={`flex items-baseline gap-2 rounded-lg border-2 px-2 py-1 text-sm ${
            r.ok
              ? "border-[color:var(--drill-ok-soft)] bg-[color:var(--drill-ok-bg)]"
              : "border-[color:var(--drill-bad-soft)] bg-[color:var(--drill-bad-bg)]"
          }`}
        >
          <span aria-hidden>{r.ok ? "✓" : "✗"}</span>
          <span className="min-w-0 flex-1 truncate font-bold">{r.words}</span>
          <span className="cahier-mono shrink-0 font-black">{r.digits.replace(/^0+(?=\d)/, "")}{r.suffix ? ` ${r.suffix}` : ""}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <GameFrame
      title={gameTitle}
      exitHref="/"
      onExit={onQuit}
      progress={{ done: Math.min(served, ROUNDS_PER_RUN), total: ROUNDS_PER_RUN }}
      hearts={{ left: lives, total: LIVES }}
      score={score}
      help={help}
      menu={[
        {
          label: "🎵 Music",
          active: music,
          onClick: () => {
            if (chiptune.playing()) {
              chiptune.stop();
              setMusic(false);
              return;
            }
            // The music channel may be muted site-wide, in which case play()
            // runs silently — asking for music here means wanting to hear it.
            setChannelMuted("music", false);
            chiptune.play("numbus");
            setMusic(true);
          },
        },
        ...(onQuit ? [{ label: "⚙️ Settings", onClick: onQuit }] : []),
      ]}
      record={record}
      recordTitle="🚏 Stops"
      background="linear-gradient(180deg, var(--region-downtown-band) 0%, var(--cahier-paper) 60%)"
    >
    <div data-kbnav-off className="mx-auto flex h-full w-full max-w-3xl flex-col gap-2 overflow-y-auto px-3 py-3 sm:gap-3 sm:px-4">
      <CreditsSplash game="NumBus" emoji="🚌" onDone={() => setCreditsDone(true)} />
      <style>{`
        @keyframes nbflip{0%{transform:rotateX(-88deg);opacity:.25}100%{transform:none;opacity:1}}
        @keyframes nbwheel{to{transform:rotate(360deg)}}
        @keyframes nbroad{to{background-position-x:-96px}}
        @keyframes nbring{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.18);opacity:1}}
      `}</style>

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
        className={`relative rounded-3xl border-4 px-2 py-2.5 shadow-xl transition focus-within:border-[#8ec5ff] sm:px-4 sm:py-3 ${
          mode === "price" ? "border-[#ffb74d] bg-[#3e2723]/95" : mode === "phone" ? "border-[#78909c] bg-[#37474f]/95" : "border-white bg-slate-900/90"
        }`}
      >
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
          enterKeyHint="done"
          autoComplete="off"
          aria-label="Answer digits"
          style={{ outline: "none" }}
          className="absolute inset-x-2 top-2.5 h-[68px] w-auto cursor-pointer bg-transparent text-transparent caret-transparent pointer-coarse:pointer-events-none sm:inset-x-4 sm:top-3 sm:h-[78px]"
          onChange={(e) => {
            if (stage !== "asking") return;
            if (!typingOpen) setTypingOpen(true);
            cancelAutoSubmit();
            const next = e.target.value.replace(/\D/g, "").slice(0, width);
            startMusic();
            setTyped(next);
            if (next.length === width) armAutoSubmit(next);
          }}
        />
        {stage === "revealed" && round && (
          <p className="mt-2 text-center text-base font-black sm:mt-3 sm:text-lg" lang="fr" style={{ color: correct ? "#8ce563" : "#ff9d9d" }}>
            {round.words}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => round && repeatSay(round.say)}
          disabled={!round || stage !== "asking"}
          title="Repeat"
          className="rounded-2xl border-2 border-b-4 border-sky-300 bg-sky-100 py-2.5 text-xl font-black text-sky-800 sm:py-3 transition hover:bg-sky-50 active:translate-y-[2px] active:border-b-2 disabled:opacity-40"
        >
          🔊
        </button>
        <button
          type="button"
          onClick={togglePause}
          disabled={!round || stage !== "asking" || !talking && !speechPaused}
          title={speechPaused ? "Resume" : "Pause"}
          className="rounded-2xl border-2 border-b-4 border-violet-300 bg-violet-100 py-2.5 text-xl font-black text-violet-800 sm:py-3 transition hover:bg-violet-50 active:translate-y-[2px] active:border-b-2 disabled:opacity-40"
        >
          {speechPaused ? "▶️" : "⏸"}
        </button>
        <button
          type="button"
          onClick={() => round && repeatSay(round.say, SLOWER_RATE)}
          disabled={!round || stage !== "asking"}
          title="Repeat slowly"
          className="rounded-2xl border-2 border-b-4 border-amber-300 bg-amber-100 py-2.5 text-xl font-black text-amber-900 sm:py-3 transition hover:bg-amber-50 active:translate-y-[2px] active:border-b-2 disabled:opacity-40"
        >
          🐢
        </button>
      </div>

      {/* Three columns on a phone is the dial pad every thumb already knows
          (1-2-3 / … / ⌫-0-✓); one row on a desktop, where width is free. */}
      <div ref={keypadRef} className="grid grid-cols-3 gap-2 sm:grid-cols-12">
        {KEYPAD.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => key(k)}
            disabled={stage !== "asking"}
            className={`rounded-2xl border-2 border-b-4 py-2.5 text-xl font-black transition active:translate-y-[2px] active:border-b-2 disabled:opacity-40 sm:py-3 ${
              k === "✓" ? "border-[#46a302] bg-[#58cc02] text-white" : k === "⌫" ? "border-slate-400 bg-slate-200 text-slate-700" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {stage === "revealed" && !correct && (
        <button type="button" onClick={() => setStage("leaving")} className="rounded-2xl border-b-4 border-[#e08600] bg-[#ffc800] py-2 text-base font-black text-slate-900 transition hover:brightness-105 active:translate-y-[2px] active:border-b-0">
          {lives > 0 && served < ROUNDS_PER_RUN ? "Next ▶" : "Terminus ▶"}
        </button>
      )}

      {/* Muting the voice makes a listening drill impossible, so it stops the
          game outright instead of leaving a silent bus stop and a draining
          clock. Sits above every other layer. */}
      {voiceOff && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#7f0f22]/95 p-4">
          <div className="w-full max-w-sm rounded-3xl border-4 border-white bg-white p-6 text-center shadow-2xl">
            <div className="text-6xl" aria-hidden style={{ animation: "nbring 1s ease-in-out infinite" }}>
              🔇
            </div>
            <h2 className="mt-3 text-2xl font-black text-[#a3172b]">The sound is off</h2>
            <p className="mt-2 text-sm font-bold text-slate-600">
              NumBus is a listening game — there is nothing to see, only a number to hear.
            </p>
            <button
              type="button"
              onClick={() => {
                setChannelMuted("voice", false);
                if (round && stage === "asking") repeatSay(round.say);
              }}
              className="mt-5 w-full rounded-2xl border-b-4 border-[#46a302] bg-[#58cc02] py-3 text-lg font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0"
            >
              🔊 Turn the sound on
            </button>
            {onQuit && (
              <button
                type="button"
                onClick={onQuit}
                className="mt-2 w-full rounded-2xl border-b-4 border-slate-300 bg-white py-2 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:translate-y-[2px] active:border-b-0"
              >
                ⚙️ Settings
              </button>
            )}
          </div>
        </div>
      )}

      {stage === "terminus" && (
        <GameOver
          emoji={lives > 0 ? "🎉" : "🚏"}
          title="Terminus"
          score={score}
          won={lives > 0}
          misses={misses}
          fallbackSio="SIO-007"
          onReplay={restart}
          exitHref="/"
          onExit={onQuit}
        />
      )}
    </div>
    </GameFrame>
  );
}

export type { NumBusMode };
