"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { toPracticeSet } from "@/lib/practice/engine";
import { speak } from "@/games/letris/speech";
import type { PracticeItem, PracticeSet } from "@/lib/practice/engine";

const TTS_KEY = "fluolingo.practiceTts.v1";

type Verdict = { picked: string; correct: boolean };

export default function PracticePage({ collectionId }: { collectionId: string }) {
  const collection = CURATED.find((c) => c.id === collectionId);
  const practiceSet = collection ? toPracticeSet(collection) : null;

  if (!practiceSet) {
    return (
      <main className="fluo-surface min-h-screen">
        <TopBar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
            <div className="text-6xl" aria-hidden>🎲</div>
            <h2 className="mt-3 text-xl font-black text-slate-900">
              No practice available
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Collection{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5">
                {collectionId}
              </code>{" "}
              doesn't have a dice-practice configuration yet.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/" className="fluo-btn fluo-btn-ghost">
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fluo-surface min-h-screen">
      <TopBar crumb={practiceSet.title} />
      <PracticeRunner set={practiceSet} />
    </main>
  );
}

function TopBar({ crumb }: { crumb?: string }) {
  return (
    <div className="border-b-2 border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          ← Apps &amp; Games
        </Link>
        <span className="text-sm font-bold text-slate-500">
          🎲 Practice{crumb ? ` · ${crumb}` : ""}
        </span>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function stableShuffle<T>(arr: T[], seed: string): T[] {
  const out = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function PracticeRunner({ set }: { set: PracticeSet }) {
  const [shuffledItems, setShuffledItems] = useState<PracticeItem[]>([]);
  const [step, setStep] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [submitted, setSubmitted] = useState<Verdict | null>(null);
  const [ttsOn, setTtsOn] = useState(true);

  // Shuffle on mount (client-side only — avoids SSR hydration mismatch).
  useEffect(() => {
    setShuffledItems(shuffle(set.items));
  }, [set]);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TTS_KEY);
      if (t === "0") setTtsOn(false);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(TTS_KEY, ttsOn ? "1" : "0");
    } catch {}
  }, [ttsOn]);

  const total = shuffledItems.length;
  const item = shuffledItems[step];
  const done = step >= total && total > 0;

  const choices = useMemo(
    () => (item ? stableShuffle(set.allLabels, item.id) : []),
    [item, set.allLabels],
  );

  useEffect(() => {
    if (submitted?.correct && ttsOn && item) {
      speak(item.ttsText, "fr-FR");
    }
  }, [submitted, ttsOn, item]);

  const score = verdicts.filter((v) => v.correct).length;

  function pick(choice: string) {
    if (submitted || !item) return;
    setSubmitted({ picked: choice, correct: choice === item.correctLabel });
  }

  function next() {
    if (!submitted || !item) return;
    setVerdicts([...verdicts, submitted]);
    setSubmitted(null);
    setStep(step + 1);
  }

  function restart() {
    setShuffledItems(shuffle(set.items));
    setStep(0);
    setVerdicts([]);
    setSubmitted(null);
  }

  if (total === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{set.title}</h1>
          <p className="mt-1 text-base text-slate-600">
            Dice practice — sort each item into its correct group.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTtsOn((v) => !v)}
          className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
            ttsOn
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-500"
          }`}
          title={ttsOn ? "TTS on — click to mute" : "TTS muted — click to enable"}
        >
          {ttsOn ? "🔊 TTS on" : "🔇 TTS off"}
        </button>
      </header>

      <ProgressBar current={Math.min(step, total)} total={total} score={score} />

      {!done && item && (
        <ItemCard
          item={item}
          choices={choices}
          submitted={submitted}
          onPick={pick}
          onNext={next}
          onSpeak={() => ttsOn && item && speak(item.ttsText, "fr-FR")}
          isLast={step === total - 1}
        />
      )}

      {done && (
        <Recap score={score} total={total} onRestart={restart} />
      )}
    </div>
  );
}

function ProgressBar({
  current,
  total,
  score,
}: {
  current: number;
  total: number;
  score: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>
          {Math.min(current + (current < total ? 1 : 0), total)} / {total}
        </span>
        <span>Score {score}/{total}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--fluo-primary)" }}
        />
      </div>
    </div>
  );
}

function ItemCard({
  item,
  choices,
  submitted,
  onPick,
  onNext,
  onSpeak,
  isLast,
}: {
  item: PracticeItem;
  choices: string[];
  submitted: Verdict | null;
  onPick: (c: string) => void;
  onNext: () => void;
  onSpeak: () => void;
  isLast: boolean;
}) {
  return (
    <article className="fluo-card fluo-h-2" data-hue={2}>
      {item.emoji && (
        <div className="my-2 text-center text-6xl" aria-hidden>
          {item.emoji}
        </div>
      )}

      <p className="text-center text-3xl font-black text-slate-900" lang="fr">
        {item.fr}
      </p>
      <p className="mt-1 text-center text-base text-slate-500">{item.en}</p>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onSpeak}
          title="Hear the item read aloud"
          className="rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
        >
          🔊 Listen
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {choices.map((c) => {
          const isPicked = submitted?.picked === c;
          const isAnswer = c === item.correctLabel;
          let cls =
            "border-slate-200 bg-white text-slate-900 hover:border-slate-400";
          if (submitted) {
            if (isAnswer)
              cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isPicked)
              cls = "border-rose-500 bg-rose-50 text-rose-900";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={c}
              type="button"
              onClick={() => onPick(c)}
              disabled={!!submitted}
              lang="fr"
              className={`rounded-xl border-2 px-4 py-3 text-center text-lg font-extrabold transition ${cls}`}
            >
              {c}
              {submitted && isAnswer && (
                <span className="ml-2" aria-hidden>
                  ✓
                </span>
              )}
              {submitted && isPicked && !isAnswer && (
                <span className="ml-2" aria-hidden>
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          className={`mt-5 rounded-xl border-2 p-3 text-sm font-bold ${
            submitted.correct
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {submitted.correct ? (
            <>Correct! The answer is <span lang="fr">{item.correctLabel}</span>.</>
          ) : (
            <>
              The correct answer is{" "}
              <span lang="fr" className="font-extrabold">
                {item.correctLabel}
              </span>
              .
            </>
          )}
        </div>
      )}

      {submitted && (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onNext} className="fluo-btn fluo-btn-lg">
            {isLast ? "🏁 See recap" : "Next →"}
          </button>
        </div>
      )}
    </article>
  );
}

function Recap({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <article className="fluo-card fluo-h-5" data-hue={5}>
      <div className="text-center">
        <div className="text-6xl" aria-hidden>
          {pct === 100 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "💪" : "🎲"}
        </div>
        <h2 className="mt-2 text-2xl font-black text-slate-900">
          {score} / {total} correct
        </h2>
        <p className="text-slate-600">
          {pct === 100
            ? "Parfait. Roll again to stay sharp."
            : pct >= 75
              ? "Strong round — one more pass on the tricky ones."
              : pct >= 50
                ? "Getting there. Roll again."
                : "Keep rolling — repetition is the game."}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRestart} className="fluo-btn fluo-btn-lg">
          🎲 Roll again
        </button>
        <Link href="/" className="fluo-btn fluo-btn-ghost">
          ← Back to lessons
        </Link>
      </div>
    </article>
  );
}
