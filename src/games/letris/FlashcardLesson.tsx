"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildSentence, speak } from "./speech";
import type { LetrisSet } from "./LetrisGame";

import { shuffle as shuffleArr } from "@/lib/shuffle";

type Card = {
  sentence: string;
  tile: string;
  meaning?: string;
  emoji?: string;
  categoryKey: string;
  categoryLabel: string;
};

/* Pastel index-tab hues (same family as the cahier tab flaps), ink text. */
const CATEGORY_BG: Record<string, string> = {
  0: "bg-[#cbb7e6]",
  1: "bg-[#8fd3cd]",
  2: "bg-[#f3cba0]",
  3: "bg-[#f0d24e]",
};
const CATEGORY_BG_FALLBACK = "bg-[#b6d77f]";

type Rating = "got" | "review";

function ListView({
  cards,
  categories,
  lang,
}: {
  cards: Card[];
  categories: LetrisSet["categories"];
  lang: string;
}) {
  const byKey = useMemo(() => {
    const m = new Map<string, Card[]>();
    categories.forEach((c) => m.set(c.key, []));
    cards.forEach((c) => {
      if (!m.has(c.categoryKey)) m.set(c.categoryKey, []);
      m.get(c.categoryKey)!.push(c);
    });
    return m;
  }, [cards, categories]);

  return (
    <div className="flex flex-col gap-5">
      {categories.map((cat, i) => {
        const items = byKey.get(cat.key) || [];
        if (items.length === 0) return null;
        const bg = CATEGORY_BG[i] ?? CATEGORY_BG_FALLBACK;
        return (
          <section
            key={cat.key}
            className="overflow-hidden rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white"
          >
            <header
              className={`px-4 py-3 text-sm font-bold uppercase tracking-widest text-[color:var(--cahier-ink)] ${bg}`}
            >
              {cat.label}
              <span className="ml-2 text-xs font-normal opacity-70">
                {items.length} items
              </span>
            </header>
            <ul className="divide-y divide-[color:var(--cahier-rule)]">
              {items.map((it, j) => (
                <li
                  key={`${cat.key}-${j}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[color:var(--cahier-paper-2)]"
                >
                  <span className="shrink-0 text-2xl" aria-hidden>
                    {it.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-bold uppercase tracking-wide">
                      {it.sentence}
                    </div>
                    {it.meaning && (
                      <div className="truncate text-xs italic text-[color:var(--cahier-ink-soft)]">
                        {it.meaning}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(it.sentence, lang)}
                    aria-label={`Play ${it.sentence}`}
                    className="cahier-btn cahier-btn-sm shrink-0"
                  >
                    🔊
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default function FlashcardLesson({
  set,
  onStartGame,
}: {
  set: LetrisSet;
  onStartGame: () => void;
}) {
  const cards: Card[] = useMemo(() => {
    const order = new Map<string, number>();
    set.categories.forEach((c, i) => order.set(c.key, i));
    const sorted = set.tiles.slice().sort((a, b) => {
      const oa = order.get(a.category) ?? 99;
      const ob = order.get(b.category) ?? 99;
      return oa - ob;
    });
    return sorted.map((t) => {
      const cat = set.categories.find((c) => c.key === t.category)!;
      return {
        sentence: buildSentence(cat, t),
        tile: t.text,
        meaning: t.meaning,
        emoji: t.emoji,
        categoryKey: cat.key,
        categoryLabel: cat.label,
      };
    });
  }, [set]);

  // Pass state
  const [pass, setPass] = useState(1);
  const [queue, setQueue] = useState<number[]>(() =>
    cards.map((_, i) => i),
  );
  const [pos, setPos] = useState(0);
  // ratings keyed by ORIGINAL card index (not queue index)
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const [flipped, setFlipped] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [view, setView] = useState<"cards" | "list">("cards");
  // 'lesson' = a card on screen; 'pass-complete' = interstitial; 'done' = ready for game
  const [stage, setStage] = useState<"lesson" | "pass-complete" | "done">(
    "lesson",
  );

  const lang = set.language ? `${set.language}-FR` : "fr-FR";
  const cardIndex = queue[pos];
  const card = cards[cardIndex];
  const categoryIdx = set.categories.findIndex(
    (c) => c.key === card?.categoryKey,
  );

  // Stats for current pass
  const ratedInPass = queue.filter((idx) => ratings[idx] !== undefined).length;
  const reviewedInPass = queue.filter(
    (idx) => ratings[idx] === "review",
  ).length;
  const gotInPass = queue.filter((idx) => ratings[idx] === "got").length;

  // ---- Auto-speak the French sentence whenever we land on a new card ----
  // Use a ref so toggling autoSpeak mid-card doesn't re-fire.
  const lastSpokenRef = useRef<number | null>(null);
  useEffect(() => {
    if (stage !== "lesson") return;
    if (!card) return;
    if (lastSpokenRef.current === cardIndex) return;
    lastSpokenRef.current = cardIndex;
    setFlipped(false);
    if (autoSpeak) speak(card.sentence, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIndex, stage]);

  // ---- Shuffle toggle: re-order the current queue when shuffleOn flips ----
  useEffect(() => {
    setQueue((q) => {
      if (q.length === 0) return q;
      const nq = shuffleOn
        ? shuffleArr(q)
        : q.slice().sort((a, b) => a - b);
      // Jump to first unrated card in the new order
      const firstUnrated = nq.findIndex((idx) => ratings[idx] === undefined);
      setPos(firstUnrated === -1 ? 0 : firstUnrated);
      lastSpokenRef.current = null;
      return nq;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleOn]);

  // ---- Rating / advancement ----
  function findNextUnrated(
    fromPos: number,
    q: number[],
    r: Record<number, Rating>,
  ): number {
    for (let p = fromPos; p < q.length; p++) {
      if (r[q[p]] === undefined) return p;
    }
    // Wrap to start
    for (let p = 0; p < fromPos; p++) {
      if (r[q[p]] === undefined) return p;
    }
    return -1;
  }

  function rateAndAdvance(value: Rating) {
    if (!card) return;
    const newRatings = { ...ratings, [cardIndex]: value };
    setRatings(newRatings);
    const next = findNextUnrated(pos + 1, queue, newRatings);
    if (next === -1) {
      // Pass complete
      setStage("pass-complete");
      lastSpokenRef.current = null;
      // Stop any in-flight TTS
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    } else {
      setPos(next);
    }
  }

  function startNextPass() {
    const reviewIndices = queue.filter((idx) => ratings[idx] === "review");
    if (reviewIndices.length === 0) {
      setStage("done");
      return;
    }
    // Clear ratings only for cards going into the next pass
    const cleared: Record<number, Rating> = { ...ratings };
    reviewIndices.forEach((idx) => delete cleared[idx]);
    setRatings(cleared);
    setQueue(reviewIndices);
    setPos(0);
    setPass((p) => p + 1);
    setStage("lesson");
    lastSpokenRef.current = null;
  }

  // ---- Keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stage === "pass-complete") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startNextPass();
        }
        return;
      }
      if (stage === "done") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartGame();
        }
        return;
      }
      // stage === "lesson" — keyboard shortcuts only in cards view
      if (view !== "cards") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = findNextUnrated(pos + 1, queue, ratings);
        if (next !== -1) setPos(next);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPos((p) => Math.max(0, p - 1));
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "r" || e.key === "R") {
        if (card) speak(card.sentence, lang);
      } else if (flipped && (e.key === "1" || e.key === "g" || e.key === "G")) {
        e.preventDefault();
        rateAndAdvance("got");
      } else if (flipped && (e.key === "2" || e.key === "n" || e.key === "N")) {
        e.preventDefault();
        rateAndAdvance("review");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, pos, queue, ratings, flipped, card, lang]);

  const bg = CATEGORY_BG[categoryIdx] ?? CATEGORY_BG_FALLBACK;
  const progress = queue.length === 0 ? 100 : (ratedInPass / queue.length) * 100;
  const passLabel =
    pass === 1 ? "Pass 1" : `Review pass ${pass}`;

  // ===== RENDER =====
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 text-[color:var(--cahier-ink)]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="cahier-display text-2xl font-black">{set.title}</h1>
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">
            {passLabel} · {queue.length} card{queue.length === 1 ? "" : "s"} ·{" "}
            <span className="text-emerald-700">{gotInPass} ✓</span>{" "}
            <span className="text-amber-700">{reviewedInPass} ⟳</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-[color:var(--cahier-ink-soft)]">
            <span
              className="cahier-modeswitch"
              data-on={autoSpeak}
              role="switch"
              aria-checked={autoSpeak}
              onClick={() => setAutoSpeak((s) => !s)}
            >
              <span className="cahier-modeswitch-knob">🔊</span>
            </span>
            Auto-play audio
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[color:var(--cahier-ink-soft)]">
            <span
              className="cahier-modeswitch"
              data-on={shuffleOn}
              role="switch"
              aria-checked={shuffleOn}
              onClick={() => setShuffleOn((s) => !s)}
            >
              <span className="cahier-modeswitch-knob">🔀</span>
            </span>
            Shuffle
          </label>
          <button
            type="button"
            onClick={() => setView((v) => (v === "cards" ? "list" : "cards"))}
            className="cahier-btn cahier-btn-sm"
            title="Toggle view"
          >
            {view === "cards" ? "📋 List" : "🃏 Cards"}
          </button>
          <button
            type="button"
            onClick={onStartGame}
            className="cahier-btn cahier-btn-sm"
          >
            Skip to game →
          </button>
        </div>
      </header>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--cahier-rule)]">
        <div
          className="h-full bg-[color:var(--cahier-hl-edge)] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="-mt-4 text-right text-xs text-[color:var(--cahier-ink-soft)]">
        {ratedInPass} / {queue.length}
      </div>

      {stage === "lesson" && view === "list" && (
        <ListView cards={cards} categories={set.categories} lang={lang} />
      )}

      {stage === "lesson" && view === "cards" && card && (
        <>
          <div
            className="relative mx-auto h-[340px] w-full max-w-2xl cursor-pointer select-none"
            style={{ perspective: "1200px" }}
            onClick={() => setFlipped((f) => !f)}
            role="button"
            aria-label={flipped ? "Show French sentence" : "Reveal meaning"}
          >
            <div
              className="relative h-full w-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* FRONT — French target sentence */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-[color:var(--cahier-ink)]/20 ${bg} p-10 text-[color:var(--cahier-ink)] shadow-lg`}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                  {card.categoryLabel}
                </span>
                <div className="text-center">
                  <div className="text-4xl font-bold uppercase tracking-wide sm:text-6xl">
                    {card.sentence}
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-pulse">
                  <span
                    className="cahier-btn cahier-btn-sm"
                    style={{ pointerEvents: "none" }}
                  >
                    👆 Tap the card to see the meaning
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(card.sentence, lang);
                  }}
                  aria-label="Replay audio"
                  className="cahier-btn cahier-btn-sm absolute right-4 top-4"
                >
                  🔊 Replay
                </button>
              </div>

              {/* BACK — meaning + rating */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white p-8 text-[color:var(--cahier-ink)] shadow-lg"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {card.emoji && (
                  <div
                    aria-hidden
                    className="text-6xl leading-none drop-shadow-sm sm:text-7xl"
                  >
                    {card.emoji}
                  </div>
                )}
                <div className="px-4 text-center">
                  {card.meaning && (
                    <div className="text-2xl font-semibold leading-snug sm:text-3xl">
                      {card.meaning}
                    </div>
                  )}
                </div>
                <div
                  className="mt-2 flex w-full max-w-md gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => rateAndAdvance("review")}
                    className="flex flex-1 items-center justify-center rounded-xl border-2 border-amber-600 bg-amber-100 px-4 py-2 font-bold text-amber-900 transition hover:bg-amber-200"
                    style={{ flexDirection: "column", gap: 0 }}
                    title="Review again (key: 2)"
                  >
                    <span>⟳ Review</span>
                    <span className="text-[10px] font-normal opacity-70">
                      key 2
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => rateAndAdvance("got")}
                    className="flex flex-1 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-100 px-4 py-2 font-bold text-emerald-900 transition hover:bg-emerald-200"
                    style={{ flexDirection: "column", gap: 0 }}
                    title="Got it (key: 1)"
                  >
                    <span>✓ Got it</span>
                    <span className="text-[10px] font-normal opacity-80">
                      key 1
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={pos === 0}
              onClick={() => setPos((p) => Math.max(0, p - 1))}
              className="cahier-btn cahier-btn-sm"
            >
              ← Previous
            </button>

            <div className="text-center text-xs text-[color:var(--cahier-ink-soft)]">
              <kbd className="rounded border border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] px-1.5 py-0.5">Space</kbd>{" "}
              flip ·{" "}
              <kbd className="rounded border border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] px-1.5 py-0.5">1</kbd>{" "}
              got ·{" "}
              <kbd className="rounded border border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] px-1.5 py-0.5">2</kbd>{" "}
              review ·{" "}
              <kbd className="rounded border border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] px-1.5 py-0.5">R</kbd>{" "}
              replay
            </div>

            <button
              type="button"
              onClick={() => {
                const next = findNextUnrated(pos + 1, queue, ratings);
                if (next !== -1) setPos(next);
              }}
              className="cahier-btn cahier-btn-sm"
            >
              Skip →
            </button>
          </div>
        </>
      )}

      {stage === "pass-complete" && (
        <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white p-8 text-center">
          <h2 className="text-2xl font-black">Pass {pass} complete</h2>
          <p className="mt-2 text-[color:var(--cahier-ink-soft)]">
            You got <span className="font-bold text-emerald-700">{gotInPass}</span>{" "}
            and marked{" "}
            <span className="font-bold text-amber-700">{reviewedInPass}</span>{" "}
            for review.
          </p>
          <div className="mt-6 flex justify-center">
            {reviewedInPass === 0 ? (
              <button
                type="button"
                onClick={() => setStage("done")}
                className="cahier-btn cahier-btn-primary"
              >
                All learned — continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={startNextPass}
                className="cahier-btn cahier-btn-primary"
              >
                Review the {reviewedInPass} card
                {reviewedInPass === 1 ? "" : "s"} →
              </button>
            )}
          </div>
          <div className="mt-3 text-xs text-[color:var(--cahier-ink-soft)]">
            (Space / Enter to continue)
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="rounded-2xl border-2 border-emerald-600 bg-white p-10 text-center">
          <div className="text-6xl">🎉</div>
          <h2 className="mt-2 text-3xl font-black">All learned!</h2>
          <p className="mt-2 text-[color:var(--cahier-ink-soft)]">
            You marked every card as known. Time to test it in the game.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onStartGame}
              className="cahier-btn cahier-btn-primary"
            >
              Start Vocabularain →
            </button>
          </div>
          <div className="mt-3 text-xs text-[color:var(--cahier-ink-soft)]">
            (Space / Enter to start)
          </div>
        </div>
      )}
    </div>
  );
}
