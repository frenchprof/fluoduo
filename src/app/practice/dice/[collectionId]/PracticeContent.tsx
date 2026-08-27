"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { toPracticeSet } from "@/lib/practice/engine";
import { bareWord } from "@/lib/collections/display";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";
import { hintsFor } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import { logEvent } from "@/lib/firebase/usage";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import type { PracticeChoice, PracticeItem, PracticeSet } from "@/lib/practice/engine";
import { shuffle } from "@/lib/shuffle";

const TTS_KEY = "fluolingo.practiceTts.v1";

type Verdict = { picked: string; correct: boolean };

export default function PracticePage({ collectionId, embedded = false }: { collectionId: string; embedded?: boolean }) {
  const collection = CURATED.find((c) => c.id === collectionId);
  const practiceSet = collection ? toPracticeSet(collection) : null;
  const tabs = withActive(deckActivityTabs(collectionId), "dice");

  if (!practiceSet) {
    if (embedded) {
      return <p className="py-10 text-center text-sm text-[color:var(--fluo-ink-soft)]">No sorting exercise for this deck yet.</p>;
    }
    return (
      <CahierShell tabs={tabs} active="dice">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
            <div className="text-6xl" aria-hidden>🗂️</div>
            <h2 className="mt-3 text-xl font-black text-slate-900">
              No practice available
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Collection{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5">
                {collectionId}
              </code>{" "}
              doesn't have sorting groups yet.
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
  // Full page = DrillShell (patch 20–21) — no unit map, no popup, the first
  // question is the first thing on screen.
  return <PracticeRunner set={practiceSet} inShell />;
}


function PracticeRunner({ set, inShell = false }: { set: PracticeSet; inShell?: boolean }) {
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [step, setStep] = useState(0);
  // First-attempt verdict per item id — drives the score AND which items get
  // the end-of-run review round (misses re-queued once, session-local only).
  const [firstResults, setFirstResults] = useState<Record<string, boolean>>({});
  const [reviewRound, setReviewRound] = useState(false);
  const [submitted, setSubmitted] = useState<Verdict | null>(null);
  // Select-then-commit (patch 20–21, DrillShell only): tapping an option
  // SELECTS it; the shell's Vérifier COMMITS. Six drills had four different
  // interaction grammars — this is the one the shell standardizes on. The
  // SioModal-embedded form keeps instant-commit until the drill popup itself
  // is retired (patch 22 took only the LESSON out of the popup).
  const [selected, setSelected] = useState<PracticeChoice | null>(null);
  const [ttsOn, setTtsOn] = useState(true);
  // Track D: a wrong pick that is NOT final — the pick is struck, the
  // learner picks again (≥ 3 options). `struck` = keys out of play.
  const [retry, setRetry] = useState(false);
  const [struck, setStruck] = useState<string[]>([]);

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

  // The help ladder (Track D). MCQ has no cold hint: the first rung is the
  // struck wrong pick; with ≥ 4 options a second strikes down to two.
  const hints = useMemo(
    () => (item ? hintsFor("mcq", { answer: item.correctLabel, options: choices.map((c) => c.label) }) : []),
    [item, choices],
  );
  const ladder = useHelpLadder({
    kind: "mcq",
    itemKey: item ? `${item.id}:${step}` : null,
    itemId: item?.id,
    surface: "dice",
    hints,
    reveal: item?.correctLabel ?? "",
    enabled: inShell && !done && !!item,
  });
  const eliminatedKeys = useMemo(
    () => choices.filter((c) => ladder.eliminated.includes(c.label) && item && c.key !== item.correctColKey).map((c) => c.key),
    [choices, ladder.eliminated, item],
  );
  const outOfPlay = useMemo(() => [...new Set([...struck, ...eliminatedKeys])], [struck, eliminatedKeys]);

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
    // In DrillShell the shell's own Enter/Space binding fires the tray CTA —
    // a second Enter handler here would advance twice.
    onNext: inShell ? undefined : () => { if (submitted) next(); },
    onSpeak: () => { if (item) speak(item.ttsText, "fr-FR"); },
  });

  /** Tap: instant-commit in the popup, select in the shell. */
  function pick(choice: PracticeChoice) {
    if (submitted || !item) return;
    if (inShell) { setSelected(choice); return; }
    commit(choice);
  }

  function commit(choice: PracticeChoice) {
    if (submitted || !item) return;
    const correct = choice.key === item.correctColKey;
    if (correct) sfx.correct(); else sfx.wrong();
    if (!(item.id in firstResults)) {
      setFirstResults({ ...firstResults, [item.id]: correct });
    }
    if (!inShell) {
      // The popup keeps its one-shot grammar (no ladder there).
      recordItemResult(item.id, correct, undefined, `dice:${set.collectionId}`);
      setSubmitted({ picked: choice.key, correct });
      return;
    }
    // Every attempt writes spacing state + evidence (via the ladder): a
    // first-try miss resets the SRS ladder, a correct repair steps back to
    // the 1-day rung — and a hinted item is queued for ReVue when it closes.
    const r = ladder.attempt(correct, { given: choice.label, activity: `dice:${set.collectionId}` });
    if (r.effect === "done" || r.effect === "reveal") {
      setSubmitted({ picked: choice.key, correct });
    } else {
      setStruck((k) => [...k, choice.key]);
      setSelected(null);
      setRetry(true);
    }
  }

  function next() {
    if (!submitted || !item) return;
    ladder.skip();
    setSubmitted(null);
    setSelected(null);
    setRetry(false);
    setStruck([]);
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
    setSelected(null);
    setRetry(false);
    setStruck([]);
  }

  if (queue.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (inShell) {
    return (
      <DrillShell
        exitHref={drillExitHref(set.collectionId)}
        progress={done ? null : { done: step, total: queue.length }}
        right={<>✓ {score}/{uniqueTotal}{inReview ? " · review" : ""}</>}
        cta={
          done
            ? { label: "Sort again", onClick: restart }
            : !submitted && !retry
              ? { label: "Check", onClick: () => { if (selected) commit(selected); }, disabled: !selected }
              : null
        }
        help={done ? null : ladder.help}
        feedback={
          !done && retry && !submitted
            ? { kind: "wrong", body: "Not yet", cta: { label: "Pick again", onClick: () => setRetry(false) } }
            : !done && submitted
            ? {
                kind: submitted.correct ? "correct" : "wrong",
                body: (
                  <>
                    {submitted.correct ? "Correct !" : "The answer:"}{" "}
                    <span lang="fr" className="font-extrabold">{item?.correctLabel}</span>
                  </>
                ),
                cta: { label: isLast ? "🏁 See recap" : "Continue", onClick: next },
              }
            : null
        }
      >
        {!done && item && (
          <ItemCard
            item={item}
            choices={choices}
            submitted={submitted}
            selected={selected}
            struck={outOfPlay}
            onPick={pick}
            onNext={next}
            onSpeak={() => ttsOn && item && speak(item.ttsText, "fr-FR")}
            isLast={isLast}
            inline={false}
            ttsOn={ttsOn}
            onToggleTts={() => setTtsOn((v) => !v)}
          />
        )}
        {done && <Recap score={score} total={uniqueTotal} onRestart={restart} inShell />}
      </DrillShell>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{set.title}</h1>
          <p className="mt-1 text-base text-slate-600">
            {set.prompt ?? "Sort each item into its correct group."}
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
  selected = null,
  struck = [],
  onPick,
  onNext,
  onSpeak,
  isLast,
  /** false under DrillShell: the shell renders the verdict tray and the
   *  Next CTA, so the card is the prompt and the options only. */
  inline = true,
  ttsOn,
  onToggleTts,
}: {
  item: PracticeItem;
  choices: PracticeChoice[];
  submitted: Verdict | null;
  /** Shell mode only: the picked-but-not-committed option. */
  selected?: PracticeChoice | null;
  /** Shell mode only: option keys the ladder has struck out (wrong picks,
   *  eliminated distractors). Disabled and dimmed. */
  struck?: string[];
  onPick: (c: PracticeChoice) => void;
  onNext: () => void;
  onSpeak: () => void;
  isLast: boolean;
  inline?: boolean;
  ttsOn?: boolean;
  onToggleTts?: () => void;
}) {
  return (
    <article className={inline ? "fluo-card fluo-h-2" : undefined} data-hue={inline ? 2 : undefined}>
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

      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={onSpeak}
          title="Hear the item read aloud"
          className="rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
        >
          🔊 Listen
        </button>
        {onToggleTts && (
          <button
            type="button"
            onClick={onToggleTts}
            title={ttsOn ? "TTS on — click to mute" : "TTS muted — click to enable"}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
              ttsOn ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {ttsOn ? "🔊" : "🔇"}
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {choices.map((c, i) => {
          const isPicked = submitted?.picked === c.key;
          const isAnswer = c.key === item.correctColKey;
          const isStruck = !submitted && struck.includes(c.key);
          let cls =
            "border-slate-200 bg-white text-slate-900 hover:border-slate-400";
          if (isStruck) {
            cls = "border-slate-200 bg-white text-slate-300 line-through";
          } else if (submitted) {
            if (isAnswer)
              cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isPicked)
              cls = "border-rose-500 bg-rose-50 text-rose-900";
            else cls = "border-slate-200 bg-white text-slate-400";
          } else if (selected?.key === c.key) {
            cls = "answer-picked";
          }
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onPick(c)}
              disabled={!!submitted || isStruck}
              lang="fr"
              className={`rounded-xl border-2 px-4 py-3 text-center text-lg font-extrabold transition ${cls}`}
            >
              {/* The 1-4 keys answer (useChoiceKeys) — show them (Dan, 2026-07-16). */}
              <span aria-hidden className="answer-key mr-2 align-middle text-xs font-bold opacity-50">{i + 1}</span>
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

      {inline && submitted && (
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

      {inline && submitted && (
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
  /** true under DrillShell: the shell's CTA is the Roll-again and its ✕ is
   *  the exit, so the card carries no buttons of its own. */
  inShell = false,
}: {
  score: number;
  total: number;
  onRestart: () => void;
  inShell?: boolean;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <article className={inShell ? undefined : "fluo-card fluo-h-5"} data-hue={inShell ? undefined : 5}>
      <div className="text-center">
        <div className="text-6xl" aria-hidden>
          {pct === 100 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "💪" : "🗂️"}
        </div>
        <h2 className="mt-2 text-2xl font-black text-slate-900">
          {score} / {total} correct
        </h2>
        <p className="text-slate-600">
          {pct === 100
            ? "Parfait. Go again to stay sharp."
            : pct >= 75
              ? "Strong round — one more pass on the tricky ones."
              : pct >= 50
                ? "Getting there. Go again."
                : "Keep going — repetition is the game."}
        </p>
      </div>
      {!inShell && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={onRestart} className="fluo-btn fluo-btn-lg">
            Sort again
          </button>
          <Link href="/" className="fluo-btn fluo-btn-ghost">
            ← Back to lessons
          </Link>
        </div>
      )}
    </article>
  );
}
