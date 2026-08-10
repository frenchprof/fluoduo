"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { toPracticeSet } from "@/lib/practice/engine";
import { bareWord } from "@/lib/collections/display";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import { logEvent } from "@/lib/firebase/usage";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import type { PracticeChoice, PracticeItem, PracticeSet } from "@/lib/practice/engine";

const TTS_KEY = "fluolingo.practiceTts.v1";

type Verdict = { picked: string; correct: boolean };

export default function PracticePage({ collectionId, embedded = false }: { collectionId: string; embedded?: boolean }) {
  const collection = CURATED.find((c) => c.id === collectionId);
  const practiceSet = collection ? toPracticeSet(collection) : null;
  const tabs = withActive(deckActivityTabs(collectionId), "dice");

  if (!practiceSet) {
    if (embedded) {
      return <p className="py-10 text-center text-sm text-[color:var(--fluo-ink-soft)]">No dice practice for this deck yet.</p>;
    }
    return (
      <CahierShell tabs={tabs} active="dice">
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
      </CahierShell>
    );
  }

  if (embedded) return <PracticeRunner set={practiceSet} />;
  return (
    <CahierShell tabs={tabs} active="dice">
      <PracticeRunner set={practiceSet} />
    </CahierShell>
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

function PracticeRunner({ set }: { set: PracticeSet }) {
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [step, setStep] = useState(0);
  // First-attempt verdict per item id — drives the score AND which items get
  // the end-of-run review round (misses re-queued once, session-local only).
  const [firstResults, setFirstResults] = useState<Record<string, boolean>>({});
  const [reviewRound, setReviewRound] = useState(false);
  const [submitted, setSubmitted] = useState<Verdict | null>(null);
  const [ttsOn, setTtsOn] = useState(true);

  // Shuffle on mount (client-side only — avoids SSR hydration mismatch).
  useEffect(() => {
    setQueue(shuffle(set.items));
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

  const item = queue[step];
  const done = step >= queue.length && queue.length > 0;
  // Game telemetry (Dan, 2026-07-15: the Activities panel was empty because
  // no game ever logged) — one start per mount, one end at the recap.
  useEffect(() => {
    void logEvent("game.start", { game: "dice", collectionId: set.collectionId });
  }, [set.collectionId]);
  const endLogged = useRef(false);
  useEffect(() => {
    if (done && !endLogged.current) {
      endLogged.current = true;
      const finalScore = set.items.filter((it) => firstResults[it.id]).length;
      void logEvent("game.end", { game: "dice", collectionId: set.collectionId, score: finalScore });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  const uniqueTotal = set.items.length;

  // Random order every time an item is shown — the queue only ever has an
  // item post-mount, so Math.random here can't cause a hydration mismatch.
  const choices = useMemo(
    () => (item ? shuffle(item.choices) : []),
    [item],
  );

  useEffect(() => {
    if (submitted?.correct && ttsOn && item) {
      speak(item.ttsText, "fr-FR");
    }
  }, [submitted, ttsOn, item]);

  const score = set.items.filter((it) => firstResults[it.id]).length;
  // Misses recorded so far in the main pass — these become the review round.
  const missedSoFar = reviewRound
    ? []
    : queue.filter((it) => firstResults[it.id] === false);
  const willReview = missedSoFar.length > 0;
  const isLast = step === queue.length - 1 && !willReview;
  const inReview = reviewRound && step >= uniqueTotal;

  useChoiceKeys({
    count: choices.length,
    enabled: !!item,
    onPick: (i) => { if (choices[i]) pick(choices[i]); },
    onNext: () => { if (submitted) next(); },
    onSpeak: () => { if (item) speak(item.ttsText, "fr-FR"); },
  });

  function pick(choice: PracticeChoice) {
    if (submitted || !item) return;
    const correct = choice.key === item.correctColKey;
    if (correct) sfx.correct(); else sfx.wrong();
    setSubmitted({ picked: choice.key, correct });
    if (!(item.id in firstResults)) {
      setFirstResults({ ...firstResults, [item.id]: correct });
    }
    // Every attempt writes spacing state: a first-try miss resets the ladder,
    // a correct review-round repair steps back to the 1-day rung.
    recordItemResult(item.id, correct, undefined, `dice:${set.collectionId}`);
  }

  function next() {
    if (!submitted || !item) return;
    setSubmitted(null);
    if (step === queue.length - 1 && willReview) {
      setQueue([...queue, ...shuffle(missedSoFar)]);
      setReviewRound(true);
    } else if (step === queue.length - 1) {
      sfx.stage(); // last card, no review round — the recap is about to show
    }
    setStep(step + 1);
  }

  function restart() {
    setQueue(shuffle(set.items));
    setStep(0);
    setFirstResults({});
    setReviewRound(false);
    setSubmitted(null);
  }

  if (queue.length === 0) {
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
            {set.prompt ?? "Dice practice — sort each item into its correct group."}
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

      <ProgressBar
        current={Math.min(step, queue.length)}
        total={queue.length}
        score={score}
        scoreTotal={uniqueTotal}
        inReview={inReview}
      />

      {!done && item && (
        <ItemCard
          item={item}
          choices={choices}
          submitted={submitted}
          onPick={pick}
          onNext={next}
          onSpeak={() => ttsOn && item && speak(item.ttsText, "fr-FR")}
          isLast={isLast}
        />
      )}

      {done && (
        <Recap score={score} total={uniqueTotal} onRestart={restart} />
      )}
    </div>
  );
}

function ProgressBar({
  current,
  total,
  score,
  scoreTotal,
  inReview,
}: {
  current: number;
  total: number;
  score: number;
  scoreTotal: number;
  inReview: boolean;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>
          {Math.min(current + (current < total ? 1 : 0), total)} / {total}
          {inReview && <span className="ml-2 text-rose-500">· review round</span>}
        </span>
        <span>Score {score}/{scoreTotal}</span>
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
  choices: PracticeChoice[];
  submitted: Verdict | null;
  onPick: (c: PracticeChoice) => void;
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
      {/* bareWord: "chef (m)" would hand the learner the sorting answer */}
      <p className="mt-1 text-center text-base text-slate-500">{bareWord(item.en)}</p>

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
        {choices.map((c, i) => {
          const isPicked = submitted?.picked === c.key;
          const isAnswer = c.key === item.correctColKey;
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
              key={c.key}
              type="button"
              onClick={() => onPick(c)}
              disabled={!!submitted}
              lang="fr"
              className={`rounded-xl border-2 px-4 py-3 text-center text-lg font-extrabold transition ${cls}`}
            >
              {/* The 1-4 keys answer (useChoiceKeys) — show them (Dan, 2026-07-16). */}
              <span aria-hidden className="mr-2 align-middle text-xs font-bold opacity-50">{i + 1}</span>
              {c.label}
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
