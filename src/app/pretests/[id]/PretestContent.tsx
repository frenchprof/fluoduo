"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPretest, sioIdForPretest } from "@/content/pretests";
import { speak } from "@/games/letris/speech";
import { logEvent } from "@/lib/firebase/usage";
import { recordPretestAnswer, stemForItem } from "@/lib/pretestRecord";
import CahierShell, { type ShellTab } from "@/components/CahierShell";
import type { Pretest, PretestItem } from "@/lib/pretests/schema";

// The Pretest is a cold pre-lesson diagnostic — its tab rail deliberately does
// NOT link to Practice activities (pre/post boundary, see PRETEST_BLUEPRINT.md).
const PRETEST_TABS: ShellTab[] = [
  { key: "home", label: "Accueil", emoji: "🏠", href: "/" },
  { key: "pretest", label: "Pretest", emoji: "🧪" },
];

type Verdict = { picked: string; correct: boolean };

const TTS_KEY = "fluolingo.pretestTts.v1";

/** The sentence to SPEAK — always the full sentence, not the answer alone.
 *  Fixes the LAF1201 bug where TTS read only the correct word. */
function ttsTextForItem(item: PretestItem): string {
  if (item.fullSentence && item.fullSentence.trim()) return item.fullSentence;
  return `${item.sentenceBefore} ${item.answer} ${item.sentenceAfter}`
    .replace(/\s+/g, " ")
    .trim();
}

export default function PretestPage({ id }: { id: string }) {
  const pretest = getPretest(id);

  if (!pretest) {
    return (
      <CahierShell tabs={PRETEST_TABS} active="pretest" crumb="🧪 Pretest">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
            <div className="text-6xl" aria-hidden>🤷</div>
            <h2 className="mt-3 text-xl font-black text-slate-900">
              No pretest found
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              No pretest with id <code className="rounded bg-slate-100 px-1.5 py-0.5">{id}</code>.
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
    <CahierShell
      tabs={PRETEST_TABS}
      active="pretest"
      crumb={`🧪 Unit ${pretest.unit} · Lesson ${pretest.lessonNo} · ${pretest.lessonSlug}`}
    >
      <PretestRunner pretest={pretest} />
    </CahierShell>
  );
}

/* ──────────────────────────────────────────────────────────── */

function PretestRunner({ pretest }: { pretest: Pretest }) {
  // Question order AND option order re-randomise on every activation (mount
  // and Restart) — never a fixed or per-item-seeded sequence. Shuffling lives
  // in mount/reset paths, not render, so SSR hydration stays deterministic.
  const [items, setItems] = useState<PretestItem[]>([]);
  const [step, setStep] = useState(0); // 0..total-1 = item; total = recap
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [submitted, setSubmitted] = useState<Verdict | null>(null);
  const [ttsOn, setTtsOn] = useState(true);

  useEffect(() => {
    setItems(shuffle(pretest.items));
  }, [pretest]);
  const total = items.length;

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

  const item = items[step];
  const choices = useMemo(
    () => (item ? shuffle([item.answer, ...item.distractors]) : []),
    [item],
  );

  // Auto-speak full sentence the moment the learner submits, so they hear the
  // CORRECT sentence (not the lonely answer word) as feedback arrives.
  useEffect(() => {
    if (submitted && submitted.correct && ttsOn && item) {
      speak(ttsTextForItem(item), "fr-FR");
    }
  }, [submitted, ttsOn, item]);

  const score = verdicts.filter((v) => v.correct).length;
  const done = total > 0 && step >= total;

  function pick(choice: string) {
    if (submitted || !item) return;
    const correct = choice === item.answer;
    setSubmitted({ picked: choice, correct });
    // Gap report (audit R1): persist the verdict so it survives navigation.
    recordPretestAnswer({
      pretestId: pretest.id,
      sioId: sioIdForPretest(pretest.id) ?? "",
      itemId: item.id,
      correct,
      picked: choice,
      answer: item.answer,
      stem: stemForItem(item),
    });
    void logEvent("pretest.answer", {
      pretestId: pretest.id,
      itemId: item.id,
      correct,
      picked: choice,
    });
  }
  function next() {
    if (!submitted || !item) return;
    setVerdicts([...verdicts, submitted]);
    setSubmitted(null);
    setStep(step + 1);
  }
  function restart() {
    setItems(shuffle(pretest.items));
    setStep(0);
    setVerdicts([]);
    setSubmitted(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{pretest.title}</h1>
          {pretest.subtitle && (
            <p className="mt-1 text-base text-slate-600">{pretest.subtitle}</p>
          )}
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
          onSpeak={() => ttsOn && speak(ttsTextForItem(item), "fr-FR")}
          isLast={step === total - 1}
        />
      )}

      {done && (
        <Recap pretest={pretest} score={score} total={total} onRestart={restart} />
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
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>
          {Math.min(current + (current < total ? 1 : 0), total)} / {total}
        </span>
        <span>
          Score {score}/{total}
        </span>
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
  item: PretestItem;
  choices: string[];
  submitted: Verdict | null;
  onPick: (c: string) => void;
  onNext: () => void;
  onSpeak: () => void;
  isLast: boolean;
}) {
  // Minimalist per Dan: gapped sentence, TTS, English meaning, choices — only.
  return (
    <article className="fluo-card fluo-h-1" data-hue={1}>
      <p className="my-3 text-center text-2xl font-bold leading-snug text-slate-900">
        <span lang="fr">{item.sentenceBefore}</span>
        <span
          className="mx-1.5 inline-block min-w-[110px] rounded-md border-b-2 border-dashed px-3 py-0.5 align-baseline"
          style={{
            borderColor: submitted
              ? submitted.correct
                ? "var(--fluo-primary)"
                : "var(--fluo-danger)"
              : "var(--fluo-secondary)",
            background: submitted
              ? submitted.correct
                ? "var(--fluo-primary-soft)"
                : "#ffe1e1"
              : "#eaf6ff",
            color: submitted
              ? submitted.correct
                ? "#2f6c00"
                : "#7a1010"
              : "var(--fluo-secondary)",
          }}
        >
          {submitted ? submitted.picked : "?"}
        </span>
        <span lang="fr">{item.sentenceAfter}</span>
      </p>
      {item.sentenceTrans && item.transFirst && !submitted ? (
        <p className="mx-auto mt-1 w-fit rounded-lg border-l-4 border-[color:var(--fluo-hl)] bg-[color:var(--fluo-hl)]/20 px-3 py-1.5 text-center text-base font-bold text-[color:var(--fluo-ink)]">
          🎯 {item.sentenceTrans}
        </p>
      ) : item.sentenceTrans && submitted ? (
        <p className="text-center text-sm italic text-slate-500">
          {item.sentenceTrans}
        </p>
      ) : null}

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onSpeak}
          title="Hear the FULL sentence read aloud"
          className="rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
        >
          🔊 Hear the full sentence
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {choices.map((c) => {
          const isPicked = submitted?.picked === c;
          const isAnswer = c === item.answer;
          let cls = "border-slate-200 bg-white text-slate-900 hover:border-slate-400";
          if (submitted) {
            if (isAnswer) cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isPicked) cls = "border-rose-500 bg-rose-50 text-rose-900";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={c}
              type="button"
              // Once answered, every option stays tappable purely for its sound
              // (Dan, 2026-07-04) — same pattern as the Unit-0 alphabet quiz.
              onClick={() => (submitted ? speak(c, "fr-FR") : onPick(c))}
              lang="fr"
              className={`rounded-xl border-2 px-4 py-3 text-left text-base font-bold transition ${cls}`}
            >
              {c}
              {submitted && isAnswer && <span className="ml-2" aria-hidden>✓</span>}
              {submitted && isPicked && !isAnswer && <span className="ml-2" aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

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
  pretest,
  score,
  total,
  onRestart,
}: {
  pretest: Pretest;
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <article className="fluo-card fluo-h-5" data-hue={5}>
      <div className="text-center">
        <div className="text-6xl" aria-hidden>
          {pct === 100 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "💪" : "📖"}
        </div>
        <h2 className="mt-2 text-2xl font-black text-slate-900">
          {score} / {total} correct
        </h2>
        <p className="text-slate-600">
          {pct === 100
            ? "Sans-faute !"
            : pct >= 75
              ? "Solid grasp — drill the missed ones once more."
              : pct >= 50
                ? "Halfway there — check the recap, then go again."
                : "Read the recap, then try again."}
        </p>
      </div>

      {pretest.recap && pretest.recap.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-xl border-2 border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Form</th>
                <th className="px-3 py-2 text-left">Example</th>
                <th className="px-3 py-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {pretest.recap.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-bold text-slate-900" lang="fr">{r.form}</td>
                  <td className="px-3 py-2 italic text-slate-700" lang="fr">{r.example}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRestart} className="fluo-btn fluo-btn-lg">
          ↻ Retry pretest
        </button>
        <Link href="/" className="fluo-btn fluo-btn-ghost">
          ← Back to lessons
        </Link>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
