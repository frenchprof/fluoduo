"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import { speak } from "@/games/letris/speech";
import { cardsFor, normalise, shuffle, type WeatherCard } from "./helpers";

export default function WeatherGapfillGame({ set }: { set: LetrisSet }) {
  const allCards = useMemo(() => cardsFor(set), [set]);
  const lang = set.language ? `${set.language}-FR` : "fr-FR";

  // Stable initial order for SSR; shuffled on mount.
  const [order, setOrder] = useState<WeatherCard[]>(allCards);
  useEffect(() => {
    setOrder(shuffle(allCards));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [verdict, setVerdict] = useState<"ok" | "bad" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = order[idx];
  const done = idx >= order.length;

  // The "answer" is the proper-cased displayName (e.g. "beau") so accents
  // are tolerated by normalise().
  const answer = current?.tile.displayName ?? current?.tile.text.toLowerCase() ?? "";
  const prefix = useMemo(() => {
    if (!current) return "";
    const cat = set.categories.find((c) => c.key === current.tile.category);
    return cat?.prefix ?? `${current.categoryLabel} `;
  }, [current, set.categories]);

  useEffect(() => {
    setInput("");
    setVerdict(null);
    setRevealed(false);
    inputRef.current?.focus();
  }, [idx]);

  const submit = () => {
    if (!current || verdict === "ok") return;
    const ok = normalise(input) === normalise(answer);
    setAttempts((a) => a + 1);
    if (ok) {
      setVerdict("ok");
      setCorrectCount((c) => c + 1);
      if (audioOn) speak(current.sentence, lang);
    } else {
      setVerdict("bad");
    }
  };

  const reveal = () => {
    setRevealed(true);
    setVerdict("bad");
    if (audioOn && current) speak(current.sentence, lang);
  };

  const next = () => {
    setIdx((i) => i + 1);
  };

  const restart = () => {
    setOrder(shuffle(allCards));
    setIdx(0);
    setInput("");
    setVerdict(null);
    setRevealed(false);
    setCorrectCount(0);
    setAttempts(0);
  };

  const accuracy = attempts === 0 ? 0 : Math.round((correctCount / attempts) * 100);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 text-white">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{set.title}</h1>
          <p className="text-sm text-slate-300">
            Gapfill · question {Math.min(idx + 1, order.length)} of {order.length}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-mono">
          <span>
            Score <b className="text-emerald-400">{correctCount}</b>/{attempts}
          </span>
          <span>
            Accuracy <b className="text-amber-300">{accuracy}%</b>
          </span>
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={audioOn}
              onChange={(e) => setAudioOn(e.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            Audio
          </label>
          <button
            type="button"
            onClick={restart}
            className="rounded border border-slate-500 px-2 py-1 hover:bg-slate-700"
          >
            Restart
          </button>
        </div>
      </header>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-amber-400 transition-all duration-200"
          style={{ width: `${(idx / order.length) * 100}%` }}
        />
      </div>

      {done ? (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 p-10 text-center shadow-xl">
          <div className="text-6xl">🎉</div>
          <h2 className="mt-2 text-3xl font-bold">All done!</h2>
          <p className="mt-2 text-emerald-100">
            {correctCount} correct out of {order.length} ({accuracy}%).
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-6 rounded-md bg-white px-6 py-3 font-bold text-emerald-800 hover:bg-emerald-50"
          >
            Play again
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-slate-800 p-8 text-center shadow-xl">
            <div className="text-7xl" aria-hidden>
              {current.emoji}
            </div>
            <div className="mt-2 text-sm italic text-slate-300">
              {current.meaning}
            </div>
            <div className="mt-5 text-3xl font-bold sm:text-4xl">
              <span>{prefix.trim()}</span>{" "}
              <span className="rounded bg-slate-700 px-3 py-1">
                {verdict === "ok" || revealed ? answer : "___"}
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (verdict === "ok" || revealed) {
                next();
              } else {
                submit();
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(e) => {
                setInput(e.target.value);
                if (verdict === "bad" && !revealed) setVerdict(null);
              }}
              disabled={verdict === "ok" || revealed}
              placeholder="Fill in the missing word(s)"
              className={`w-full rounded-lg border bg-slate-900 px-4 py-3 text-lg outline-none transition ${
                verdict === "ok"
                  ? "border-emerald-400"
                  : verdict === "bad"
                    ? "border-rose-400"
                    : "border-slate-700 focus:border-amber-300"
              }`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-500">
                Accents and capitalisation don&apos;t matter.
              </div>
              <div className="flex gap-2">
                {verdict !== "ok" && !revealed && (
                  <button
                    type="button"
                    onClick={reveal}
                    className="rounded border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
                  >
                    Show answer
                  </button>
                )}
                {verdict === "ok" || revealed ? (
                  <button
                    type="submit"
                    className="rounded-md bg-amber-400 px-5 py-2 font-bold text-slate-900 hover:bg-amber-300"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-500 px-5 py-2 font-bold text-white hover:bg-emerald-400"
                  >
                    Check
                  </button>
                )}
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
