"use client";

import { useEffect, useMemo, useState } from "react";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import { speak } from "@/games/letris/speech";
import { cardsFor, shuffle, type WeatherCard } from "./helpers";

const BATCH_SIZE = 6;

export default function WeatherMatchingGame({ set }: { set: LetrisSet }) {
  const allCards = useMemo(() => cardsFor(set), [set]);
  const lang = set.language ? `${set.language}-FR` : "fr-FR";

  // Stable initial batches (source order) for SSR; shuffled on mount.
  const makeBatches = (cards: WeatherCard[]) => {
    const out: WeatherCard[][] = [];
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      out.push(cards.slice(i, i + BATCH_SIZE));
    }
    return out;
  };
  const [batches, setBatches] = useState<WeatherCard[][]>(() => makeBatches(allCards));
  const [batchIdx, setBatchIdx] = useState(0);
  const [rightOrder, setRightOrder] = useState<WeatherCard[]>(
    () => batches[0] ?? [],
  );
  useEffect(() => {
    const shuffledBatches = makeBatches(shuffle(allCards));
    setBatches(shuffledBatches);
    setRightOrder(shuffle(shuffledBatches[0] ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ id: string; kind: "ok" | "bad" } | null>(
    null,
  );
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [audioOn, setAudioOn] = useState(true);

  const current = batches[batchIdx] ?? [];
  const batchDone =
    current.length > 0 &&
    current.every((c) => matchedIds.has(c.id));
  const overallDone = batchIdx >= batches.length - 1 && batchDone;

  const goNextBatch = () => {
    if (batchIdx >= batches.length - 1) return;
    const nextIdx = batchIdx + 1;
    setBatchIdx(nextIdx);
    setRightOrder(shuffle(batches[nextIdx]));
    setMatchedIds(new Set());
    setSelectedLeft(null);
    setFlash(null);
  };

  const tryMatch = (leftId: string, rightId: string) => {
    setAttempts((a) => a + 1);
    const isMatch = leftId === rightId;
    setFlash({ id: rightId, kind: isMatch ? "ok" : "bad" });
    window.setTimeout(() => setFlash(null), 350);
    if (isMatch) {
      const card = current.find((c) => c.id === leftId);
      if (card && audioOn) speak(card.sentence, lang);
      setCorrect((c) => c + 1);
      setMatchedIds((s) => {
        const n = new Set(s);
        n.add(leftId);
        return n;
      });
    }
    setSelectedLeft(null);
  };

  const onLeftClick = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedLeft((cur) => (cur === id ? null : id));
  };

  const onRightClick = (id: string) => {
    if (matchedIds.has(id)) return;
    if (!selectedLeft) {
      setFlash({ id, kind: "bad" });
      window.setTimeout(() => setFlash(null), 250);
      return;
    }
    tryMatch(selectedLeft, id);
  };

  const restart = () => {
    setBatchIdx(0);
    setRightOrder(shuffle(batches[0]));
    setMatchedIds(new Set());
    setSelectedLeft(null);
    setFlash(null);
    setAttempts(0);
    setCorrect(0);
  };

  const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
  const matchedTotal =
    batchIdx * BATCH_SIZE +
    current.filter((c) => matchedIds.has(c.id)).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 text-[color:var(--cahier-ink)]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="cahier-display text-2xl font-black">{set.title}</h1>
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">
            Matching · batch {batchIdx + 1} of {batches.length}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-mono">
          <span>
            Matched <b className="text-emerald-700">{matchedTotal}</b>/
            {allCards.length}
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
          style={{ width: `${(matchedTotal / allCards.length) * 100}%` }}
        />
      </div>

      {overallDone ? (
        <div className="rounded-2xl border-2 border-emerald-600 bg-white p-10 text-center">
          <div className="text-6xl">🎉</div>
          <h2 className="mt-2 text-3xl font-black">All matched!</h2>
          <p className="mt-2 text-[color:var(--cahier-ink-soft)]">
            {correct} correct out of {attempts} attempts ({accuracy}%).
          </p>
          <button
            type="button"
            onClick={restart}
            className="cahier-btn cahier-btn-primary mt-6"
          >
            Play again
          </button>
        </div>
      ) : batchDone ? (
        <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white p-8 text-center">
          <h2 className="text-2xl font-black">Batch {batchIdx + 1} complete</h2>
          <p className="mt-2 text-[color:var(--cahier-ink-soft)]">
            On to the next {Math.min(BATCH_SIZE, allCards.length - (batchIdx + 1) * BATCH_SIZE)} pairs.
          </p>
          <button
            type="button"
            onClick={goNextBatch}
            className="cahier-btn cahier-btn-primary mt-6"
          >
            Next batch →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3">
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-[color:var(--cahier-le)]">
              French sentence
            </h3>
            <ul className="flex flex-col gap-2">
              {current.map((c) => {
                const isSel = selectedLeft === c.id;
                const solved = matchedIds.has(c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onLeftClick(c.id)}
                      disabled={solved}
                      className={`flex w-full items-center gap-2 rounded-lg border-2 px-3 py-3 text-left transition ${
                        solved
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 opacity-70"
                          : isSel
                            ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl)]/40 ring-2 ring-[color:var(--cahier-ink)]"
                            : "border-[color:var(--cahier-rule)] bg-white hover:border-[color:var(--cahier-ink-soft)] hover:bg-[color:var(--cahier-paper-2)]"
                      }`}
                    >
                      <span className="text-base font-bold uppercase sm:text-lg">
                        {c.sentence}
                      </span>
                      {solved && (
                        <span className="ml-auto text-emerald-600" aria-hidden>
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3">
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
              Meaning
            </h3>
            <ul className="flex flex-col gap-2">
              {rightOrder.map((c) => {
                const solved = matchedIds.has(c.id);
                const isFlash = flash && flash.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onRightClick(c.id)}
                      disabled={solved}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-3 text-left transition ${
                        solved
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 opacity-70"
                          : "border-[color:var(--cahier-rule)] bg-white hover:border-[color:var(--cahier-ink-soft)] hover:bg-[color:var(--cahier-paper-2)]"
                      } ${
                        !solved && isFlash && flash!.kind === "ok"
                          ? "!border-emerald-500 !bg-emerald-100"
                          : ""
                      } ${
                        !solved && isFlash && flash!.kind === "bad"
                          ? "!border-rose-500 !bg-rose-100"
                          : ""
                      }`}
                    >
                      <span className="text-3xl" aria-hidden>
                        {c.emoji}
                      </span>
                      <span className="flex-1 text-sm sm:text-base">
                        {c.meaning}
                      </span>
                      {solved && (
                        <span className="text-lg text-emerald-600" aria-hidden>
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
