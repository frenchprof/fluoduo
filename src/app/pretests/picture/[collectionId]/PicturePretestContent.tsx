"use client";

/**
 * Word↔picture PRETEST — the pretesting-effect format (Pan & Chua, NUS, Cognitive
 * Research 2026): learners make a multiple-choice GUESS before they've learned the
 * item, then get immediate corrective feedback. Tested in BOTH directions
 * (word→picture and picture→word), which the study found each help independently.
 *
 * This is a PRETEST: no stakes, errors are expected and productive. The "picture"
 * is the item's emoji (flags for countries, etc.). Missed items become a
 * "bring to class" gap report at the end.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import { logEvent } from "@/lib/firebase/usage";
import CahierShell, { type ShellTab } from "@/components/CahierShell";
import type { Collection, Item } from "@/lib/collections/schema";
import { shuffle } from "@/lib/shuffle";

// Cold pre-lesson diagnostic — no Practice-activity links on the rail
// (pre/post boundary, same rule as /pretests/[id]).
const PRETEST_TABS: ShellTab[] = [
  { key: "home", label: "Home", emoji: "🏠", href: "/" },
  { key: "pretest", label: "Pretest", emoji: "🧪" },
];

type Direction = "fr2pic" | "pic2fr";
type Question = { item: Item; direction: Direction; choices: Item[] };
type Verdict = { item: Item; correct: boolean };

const N_CHOICES = 4;

export default function PicturePretestPage({ collectionId }: { collectionId: string }) {
  const collection = CURATED.find((c) => c.id === collectionId);
  const pictureItems = collection
    ? collection.items.filter((i) => i.emoji && i.emoji.trim())
    : [];

  if (!collection || pictureItems.length < N_CHOICES) {
    return (
      <CahierShell tabs={PRETEST_TABS} active="pretest">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
            <div className="text-6xl" aria-hidden>🖼️</div>
            <h2 className="mt-3 text-xl font-black text-slate-900">
              No picture pretest available
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Collection{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5">
                {collectionId}
              </code>{" "}
              needs at least {N_CHOICES} items with an emoji/picture.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/" className="fluo-btn fluo-btn-ghost">← Home</Link>
            </div>
          </div>
        </div>
      </CahierShell>
    );
  }

  return (
    <CahierShell tabs={PRETEST_TABS} active="pretest">
      <PretestRunner collection={collection} pictureItems={pictureItems} />
    </CahierShell>
  );
}


/** Build one question per item, alternating direction, with N_CHOICES options. */
function buildQuestions(items: Item[]): Question[] {
  const pool = shuffle(items);
  return pool.map((item, idx) => {
    const others = shuffle(pool.filter((i) => i.id !== item.id)).slice(
      0,
      N_CHOICES - 1,
    );
    return {
      item,
      direction: idx % 2 === 0 ? "pic2fr" : "fr2pic",
      choices: shuffle([item, ...others]),
    };
  });
}

/**
 * The French name as it should ALWAYS be shown — carrying its article/frame from
 * the deck's `col:` tag (le Japon, la France, l'Allemagne, les États-Unis, ∅ Cuba).
 * For countries the article IS the learning objective, so it must ride on every
 * appearance; generalises to any letris-backed deck (il fait beau, le café…).
 */
function buildDisplayMap(collection: Collection): Record<string, string> {
  const cols = collection.gameConfig?.letris?.columns ?? [];
  const prefixByKey = new Map(cols.map((c) => [c.key, c.prefix ?? ""]));
  const map: Record<string, string> = {};
  for (const it of collection.items) {
    const colTag = it.tags.find((t) => t.startsWith("col:"));
    const raw = colTag ? prefixByKey.get(colTag.slice(4)) ?? "" : "";
    const prefix = raw ? raw.charAt(0).toLowerCase() + raw.slice(1) : "";
    map[it.id] = prefix + it.fr;
  }
  return map;
}

function PretestRunner({
  collection,
  pictureItems,
}: {
  collection: Collection;
  pictureItems: Item[];
}) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [submitted, setSubmitted] = useState<{ id: string; correct: boolean } | null>(
    null,
  );

  const displayMap = useMemo(() => buildDisplayMap(collection), [collection]);

  useEffect(() => {
    setQuestions(buildQuestions(pictureItems));
  }, [pictureItems]);

  const total = questions.length;
  const q = questions[step];
  const done = started && step >= total && total > 0;

  // Speak the name WITH its article on feedback — the article is the takeaway.
  useEffect(() => {
    if (submitted && q) speak(displayMap[q.item.id] ?? q.item.fr, "fr-FR");
  }, [submitted, q, displayMap]);

  function start() {
    setQuestions(buildQuestions(pictureItems));
    setStep(0);
    setVerdicts([]);
    setSubmitted(null);
    setStarted(true);
  }
  function pick(choice: Item) {
    if (submitted || !q) return;
    const correct = choice.id === q.item.id;
    setSubmitted({ id: choice.id, correct });
    // This format used to record NOTHING — every picture pretest a class sat was
    // invisible to the gap report. Same event and shape as the authored pretests
    // (/pretests/[id]) and the SIO popup quiz, keyed by deck since these are
    // generated per deck rather than authored one by one.
    void logEvent("pretest.answer", {
      pretestId: `picture:${collection.id}`,
      itemId: q.item.id,
      correct,
      picked: displayMap[choice.id] ?? choice.fr,
      direction: q.direction,
    });
  }
  function next() {
    if (!submitted || !q) return;
    setVerdicts([...verdicts, { item: q.item, correct: submitted.correct }]);
    setSubmitted(null);
    setStep(step + 1);
  }

  if (!started) {
    return <Intro collection={collection} count={total} onStart={start} />;
  }
  if (done) {
    return <GapReport verdicts={verdicts} displayMap={displayMap} onRetry={start} />;
  }
  if (!q) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-slate-500">
        Loading…
      </div>
    );
  }

  const score = verdicts.filter((v) => v.correct).length;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ProgressBar current={step} total={total} score={score} />
      <QuestionCard
        q={q}
        displayMap={displayMap}
        submitted={submitted}
        onPick={pick}
        onNext={next}
        isLast={step === total - 1}
      />
    </div>
  );
}

function Intro({
  collection,
  count,
  onStart,
}: {
  collection: Collection;
  count: number;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article className="fluo-card fluo-h-2" data-hue={2}>
        <div className="text-center text-5xl" aria-hidden>🎲🖼️</div>
        <h1 className="mt-3 text-center text-3xl font-black text-slate-900">
          {collection.title}
        </h1>
        <p className="mt-3 text-center text-base text-slate-700">
          This is a <strong>pretest</strong>{" "}— you haven&apos;t learned these yet,
          so <strong>guess anyway</strong>. Getting it wrong is how this works:
          attempting first and then seeing the answer makes the word stick far
          better than just reading it.
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          {count}&nbsp;quick guesses, both directions.
          You&apos;ll see the right answer right after each guess. No score
          pressure — whatever you miss becomes your focus list for class.
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Method: guessing-with-feedback (Pan &amp; Chua, NUS · Cognitive Research,
          2026).
        </p>
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={onStart} className="fluo-btn fluo-btn-lg">
            Start guessing →
          </button>
        </div>
      </article>
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
        <span>{Math.min(current + 1, total)} / {total}</span>
        <span>{score} so far</span>
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

function QuestionCard({
  q,
  displayMap,
  submitted,
  onPick,
  onNext,
  isLast,
}: {
  q: Question;
  displayMap: Record<string, string>;
  submitted: { id: string; correct: boolean } | null;
  onPick: (c: Item) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const isPic2Fr = q.direction === "pic2fr";
  const nameOf = (it: Item) => displayMap[it.id] ?? it.fr;
  return (
    <article className="fluo-card fluo-h-2" data-hue={2}>
      <div className="text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">
        {isPic2Fr ? "Which French word?" : "Which picture?"}
      </div>

      {/* Stimulus */}
      <div className="my-4 text-center">
        {isPic2Fr ? (
          <span className="text-7xl" aria-label="picture">{q.item.emoji}</span>
        ) : (
          <span lang="fr" className="text-4xl font-black text-slate-900">
            {nameOf(q.item)}
          </span>
        )}
      </div>

      {/* Choices */}
      <div
        className={`mt-4 grid gap-2.5 ${
          isPic2Fr ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        {q.choices.map((c) => {
          const isPicked = submitted?.id === c.id;
          const isAnswer = c.id === q.item.id;
          let cls = "border-slate-200 bg-white text-slate-900 hover:border-slate-400";
          if (submitted) {
            if (isAnswer) cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isPicked) cls = "border-rose-500 bg-rose-50 text-rose-900";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              disabled={!!submitted}
              lang={isPic2Fr ? "fr" : undefined}
              className={`rounded-xl border-2 px-4 py-4 text-center font-bold transition ${cls} ${
                isPic2Fr ? "text-lg" : "text-5xl"
              }`}
            >
              {isPic2Fr ? nameOf(c) : c.emoji}
              {submitted && isAnswer && (
                <span className="ml-1 align-middle text-base" aria-hidden>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Immediate corrective feedback — the correct pairing */}
      {submitted && (
        <div
          className={`mt-5 rounded-xl border-2 p-4 ${
            submitted.correct
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center justify-center gap-3 text-center">
            <span className="text-4xl" aria-hidden>{q.item.emoji}</span>
            <div>
              <div lang="fr" className="text-xl font-black text-slate-900">
                {nameOf(q.item)}
              </div>
              <div className="text-sm text-slate-600">
                {q.item.en}
                {q.item.note ? ` ${q.item.note}` : ""}
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs font-bold text-slate-500">
            {submitted.correct
              ? "Nice — that one's already sticking."
              : "Now you've seen it — that's the one to remember."}
          </p>
        </div>
      )}

      {submitted && (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onNext} className="fluo-btn fluo-btn-lg">
            {isLast ? "🏁 See focus list" : "Next →"}
          </button>
        </div>
      )}
    </article>
  );
}

function GapReport({
  verdicts,
  displayMap,
  onRetry,
}: {
  verdicts: Verdict[];
  displayMap: Record<string, string>;
  onRetry: () => void;
}) {
  const missed = verdicts.filter((v) => !v.correct).map((v) => v.item);
  const got = verdicts.length - missed.length;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article className="fluo-card fluo-h-5" data-hue={5}>
        <div className="text-center">
          <div className="text-6xl" aria-hidden>📋</div>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            {got} / {verdicts.length} guessed right
          </h2>
          <p className="text-slate-600">
            You did this <em>before</em> the lesson — every guess, right or wrong,
            primed your memory. Bring the list below to class.
          </p>
        </div>

        {missed.length > 0 ? (
          <div className="mt-5">
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              🎯 Focus on these in class
            </h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {missed.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-3 py-2"
                >
                  <span className="text-3xl" aria-hidden>{m.emoji}</span>
                  <span>
                    <span lang="fr" className="font-bold text-slate-900">{displayMap[m.id] ?? m.fr}</span>
                    <span className="ml-2 text-sm text-slate-500">{m.en}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-5 text-center text-sm font-bold text-emerald-700">
            You guessed them all — but the real win is the priming. You&apos;ll
            lock these in fast in class.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={onRetry} className="fluo-btn fluo-btn-lg">
            ↻ Guess again
          </button>
          <Link href="/" className="fluo-btn fluo-btn-ghost">← Back to lessons</Link>
        </div>
      </article>
    </div>
  );
}
