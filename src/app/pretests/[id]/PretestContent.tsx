"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getPretest } from "@/content/pretests";
import { speak } from "@/games/letris/speech";
import CahierShell, { type ShellTab } from "@/components/CahierShell";
import type { Pretest, PretestItem } from "@/lib/pretests/schema";

// The Pretest is a cold pre-lesson diagnostic — its tab rail deliberately does
// NOT link to Practice activities (pre/post boundary, see PRETEST_BLUEPRINT.md).
const PRETEST_TABS: ShellTab[] = [
  { key: "home", label: "Accueil", emoji: "🏠", href: "/" },
  { key: "pretest", label: "Pretest", emoji: "🧪" },
];

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

type Q = { item: PretestItem; choices: string[] };

function PretestRunner({ pretest }: { pretest: Pretest }) {
  // All questions shown at once, Unit-0 style (per Dan: "pretty neat and
  // doesn't require too much space") — compact cards, pill options, instant
  // per-question feedback. Question order AND option order re-randomise on
  // every activation (mount and Retry); shuffling lives in mount/reset paths,
  // not render, so SSR hydration stays deterministic.
  const [qs, setQs] = useState<Q[]>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [ttsOn, setTtsOn] = useState(true);

  const deal = useCallback(() => {
    setQs(
      shuffle(pretest.items).map((item) => ({
        item,
        choices: shuffle([item.answer, ...item.distractors]),
      })),
    );
    setPicked({});
  }, [pretest]);
  useEffect(() => {
    deal();
  }, [deal]);

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

  const total = qs.length;
  const answered = Object.keys(picked).length;
  const score = qs.filter((q) => picked[q.item.id] === q.item.answer).length;
  const done = total > 0 && answered === total;

  function pick(q: Q, choice: string) {
    if (picked[q.item.id] !== undefined) return;
    setPicked({ ...picked, [q.item.id]: choice });
    // Speak the CORRECT full sentence as feedback arrives (never the lonely word).
    if (ttsOn && choice === q.item.answer) speak(ttsTextForItem(q.item), "fr-FR");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
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

      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
        Answered {answered}/{total} · Score {score}/{total}
      </p>

      <div className="space-y-3">
        {qs.map((q) => (
          <QuestionCard
            key={q.item.id}
            q={q}
            picked={picked[q.item.id]}
            onPick={(c) => pick(q, c)}
            onSpeak={() => ttsOn && speak(ttsTextForItem(q.item), "fr-FR")}
          />
        ))}
      </div>

      {done && (
        <div className="mt-6">
          <Recap pretest={pretest} score={score} total={total} onRestart={deal} />
        </div>
      )}
    </div>
  );
}

/** One compact question card — the Unit-0 popup quiz look (solid green/red pills). */
function QuestionCard({
  q,
  picked,
  onPick,
  onSpeak,
}: {
  q: Q;
  picked?: string;
  onPick: (c: string) => void;
  onSpeak: () => void;
}) {
  const { item, choices } = q;
  const showResult = picked !== undefined;
  const correct = picked === item.answer;

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        {item.contextLabel && (
          <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500">
            {item.contextLabel}
          </span>
        )}
        {item.meta && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-700">
            {item.meta}
          </span>
        )}
      </div>
      <p className="my-2 text-lg font-bold leading-snug text-slate-900">
        {item.icon && <span className="mr-1.5" aria-hidden>{item.icon}</span>}
        <span lang="fr">{item.sentenceBefore}</span>
        <span
          className={`mx-1 inline-block min-w-[64px] rounded-md border-b-2 border-dashed px-2 text-center align-baseline ${
            !showResult
              ? "border-sky-400 bg-sky-50 text-sky-600"
              : correct
                ? "border-[#178a4d] bg-emerald-50 text-[#178a4d]"
                : "border-[#c0392b] bg-rose-50 text-[#c0392b] line-through"
          }`}
        >
          {showResult ? picked : "?"}
        </span>
        <span lang="fr">{item.sentenceAfter}</span>
        <button
          type="button"
          onClick={onSpeak}
          title="Hear the full sentence"
          className="ml-2 align-middle text-base opacity-60 transition hover:opacity-100"
        >
          🔊
        </button>
      </p>
      {item.sentenceTrans && (
        <p className="mb-1 text-xs italic text-slate-500">{item.sentenceTrans}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {choices.map((c) => {
          const isPicked = picked === c;
          const isAnswer = c === item.answer;
          // Same strong solid-fill contrast as the Unit-0 quiz (Dan: "i cannot
          // tell what is what if everything is of the same color").
          const cls = !showResult
            ? "border-slate-700 bg-white text-slate-900 hover:bg-slate-50"
            : isAnswer
              ? "border-[#178a4d] bg-[#178a4d] text-white"
              : isPicked
                ? "border-[#c0392b] bg-[#c0392b] text-white"
                : "border-slate-200 bg-transparent text-slate-400 opacity-50";
          return (
            <button
              key={c}
              type="button"
              disabled={showResult}
              onClick={() => onPick(c)}
              lang="fr"
              className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${cls}`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {showResult && item.why && (
        <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
          <span dangerouslySetInnerHTML={{ __html: item.why }} />
        </div>
      )}
    </div>
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
            ? "Sans-faute. You’re ready for the speed drill."
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
