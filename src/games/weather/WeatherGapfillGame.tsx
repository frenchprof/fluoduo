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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 text-[color:var(--cahier-ink)]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="cahier-display text-2xl font-black">{set.title}</h1>
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">
            Gapfill · question {Math.min(idx + 1, order.length)} of {order.length}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-mono">
          <span>
            Score <b className="text-emerald-700">{correctCount}</b>/{attempts}
          </span>
          <span>
            Accuracy <b className="text-amber-700">{accuracy}%</b>
          </span>
          <label className="flex items-center gap-2 text-[color:var(--cahier-ink-soft)]">
            <input
              type="checkbox"
              checked={audioOn}
              onChange={(e) => setAudioOn(e.target.checked)}
              className="h-4 w-4 accent-[#2a2e6e]"
            />
            Audio
          </label>
          <button type="button" onClick={restart} className="cahier-btn cahier-btn-sm">
            Restart
          </button>
        </div>
      </header>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--cahier-rule)]">
        <div
          className="h-full bg-[color:var(--cahier-hl-edge)] transition-all duration-200"
          style={{ width: `${(idx / order.length) * 100}%` }}
        />
      </div>

      {done ? (
        <div className="rounded-2xl border-2 border-emerald-600 bg-white p-10 text-center">
          <div className="text-6xl">🎉</div>
          <h2 className="mt-2 text-3xl font-black">All done!</h2>
          <p className="mt-2 text-[color:var(--cahier-ink-soft)]">
            {correctCount} correct out of {order.length} ({accuracy}%).
          </p>
          <button
            type="button"
            onClick={restart}
            className="cahier-btn cahier-btn-primary mt-6"
          >
            Play again
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white p-8 text-center">
            <div className="text-7xl" aria-hidden>
              {current.emoji}
            </div>
            <div className="mt-2 text-sm italic text-[color:var(--cahier-ink-soft)]">
              {current.meaning}
            </div>
            <div className="mt-5 text-3xl font-bold sm:text-4xl">
              <span>{prefix.trim()}</span>{" "}
              <span className="rounded border-b-2 border-[color:var(--cahier-ink)] bg-[color:var(--cahier-paper-2)] px-3 py-1">
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
              className={`w-full rounded-lg px-4 py-3 text-lg outline-none transition ${
                verdict === "ok"
                  ? "!border-emerald-500"
                  : verdict === "bad"
                    ? "!border-rose-500"
                    : ""
              }`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-[color:var(--cahier-ink-soft)]">
                Accents and capitalisation don&apos;t matter.
              </div>
              <div className="flex gap-2">
                {verdict !== "ok" && !revealed && (
                  <button type="button" onClick={reveal} className="cahier-btn cahier-btn-sm">
                    Show answer
                  </button>
                )}
                {verdict === "ok" || revealed ? (
                  <button type="submit" className="cahier-btn cahier-btn-primary">
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="cahier-btn cahier-btn-primary">
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
