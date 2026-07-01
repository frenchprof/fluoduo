"use client";

import { useEffect, useMemo, useState } from "react";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import { speak } from "@/games/letris/speech";
import { cardsFor, shuffle, type WeatherCard } from "./helpers";

const OPTIONS_PER_QUESTION = 4;

export default function WeatherMCQGame({ set }: { set: LetrisSet }) {
  const allCards = useMemo(() => cardsFor(set), [set]);
  const lang = set.language ? `${set.language}-FR` : "fr-FR";

  // Stable initial order for SSR; shuffled on mount.
  const [order, setOrder] = useState<WeatherCard[]>(allCards);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setOrder(shuffle(allCards));
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [audioOn, setAudioOn] = useState(true);

  const current = order[idx];
  const done = idx >= order.length;

  const options = useMemo(() => {
    if (!current || !mounted) return [] as WeatherCard[];
    const distractors = shuffle(
      allCards.filter((c) => c.id !== current.id),
    ).slice(0, OPTIONS_PER_QUESTION - 1);
    return shuffle([current, ...distractors]);
  }, [current, allCards, mounted]);

  // Auto-play the correct answer's emoji+English appears on screen; we DON'T
  // auto-speak the correct French (would give the answer away).

  const pick = (cardId: string) => {
    if (picked) return;
    setPicked(cardId);
    setAttempts((a) => a + 1);
    if (cardId === current.id) {
      setCorrectCount((c) => c + 1);
      if (audioOn) speak(current.sentence, lang);
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
  };

  const restart = () => {
    setOrder(shuffle(allCards));
    setIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setAttempts(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) {
        if (e.key === "Enter" || e.key === " ") restart();
        return;
      }
      if (!picked) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= options.length) {
          pick(options[n - 1].id);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, options, done]);

  const accuracy = attempts === 0 ? 0 : Math.round((correctCount / attempts) * 100);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 text-white">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{set.title}</h1>
          <p className="text-sm text-slate-300">
            MCQ · question {Math.min(idx + 1, order.length)} of {order.length}
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
          <h2 className="mt-2 text-3xl font-bold">Quiz complete!</h2>
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
            <div className="mt-3 text-xl italic text-slate-200 sm:text-2xl">
              {current.meaning}
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">
              Pick the correct French sentence
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((o, i) => {
              const isCorrect = o.id === current.id;
              const isPicked = picked === o.id;
              let color =
                "border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700";
              if (picked) {
                if (isCorrect) {
                  color = "border-emerald-400 bg-emerald-900/40";
                } else if (isPicked) {
                  color = "border-rose-400 bg-rose-900/40";
                } else {
                  color = "border-slate-800 bg-slate-900/50 opacity-60";
                }
              }
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    disabled={!!picked}
                    onClick={() => pick(o.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-4 text-left transition ${color}`}
                  >
                    <span className="font-mono text-sm text-slate-400">
                      {i + 1}
                    </span>
                    <span className="text-base font-bold uppercase sm:text-lg">
                      {o.sentence}
                    </span>
                    {picked && isCorrect && (
                      <span className="ml-auto text-emerald-300" aria-hidden>
                        ✓
                      </span>
                    )}
                    {picked && isPicked && !isCorrect && (
                      <span className="ml-auto text-rose-300" aria-hidden>
                        ✗
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {picked && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {picked === current.id ? "Nice." : "Correct answer above."}
              </p>
              <button
                type="button"
                onClick={next}
                className="rounded-md bg-amber-400 px-5 py-2 font-bold text-slate-900 hover:bg-amber-300"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
