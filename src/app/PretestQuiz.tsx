"use client";

/**
 * A pretest rendered the Unit-0 way (Dan: "the questions all visible at one
 * glance in the pop-up window with immediate autocorrection for each
 * question") — compact stacked cards inside the SIO popup, each graded the
 * moment an option is tapped, with the why-explanation inline.
 *
 * Question order AND option order re-randomise on every activation (each
 * popup open mounts this fresh). Shuffling happens in a mount effect, never
 * during render, so SSR hydration stays deterministic. Question wording must
 * therefore never reference other questions ("the previous question" …).
 */

import { useEffect, useState } from "react";
import { getPretest } from "@/content/pretests";
import { speak } from "@/games/letris/speech";
import type { PretestItem } from "@/lib/pretests/schema";

/** Speak the FULL sentence, never the lonely answer word. */
function ttsTextForItem(item: PretestItem): string {
  if (item.fullSentence && item.fullSentence.trim()) return item.fullSentence;
  return `${item.sentenceBefore} ${item.answer} ${item.sentenceAfter}`
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Q = { item: PretestItem; choices: string[] };

export default function PretestQuiz({ pretestId }: { pretestId: string }) {
  const pretest = getPretest(pretestId);
  const [qs, setQs] = useState<Q[]>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = getPretest(pretestId);
    if (!p) return;
    setQs(
      shuffle(p.items).map((item) => ({
        item,
        choices: shuffle([item.answer, ...item.distractors]),
      })),
    );
    setPicked({});
  }, [pretestId]);

  if (!pretest) return null;

  function pick(q: Q, choice: string) {
    if (picked[q.item.id] !== undefined) return;
    setPicked({ ...picked, [q.item.id]: choice });
    if (choice === q.item.answer) speak(ttsTextForItem(q.item), "fr-FR");
  }

  // Dan's litmus test (see AGENTS.md): no labels, no score line — just the
  // questions.
  return (
    <div className="space-y-3">
      {qs.map((q) => (
        <QuestionCard key={q.item.id} q={q} picked={picked[q.item.id]} onPick={(c) => pick(q, c)} />
      ))}
    </div>
  );
}

function QuestionCard({
  q,
  picked,
  onPick,
}: {
  q: Q;
  picked?: string;
  onPick: (c: string) => void;
}) {
  const { item, choices } = q;
  const showResult = picked !== undefined;
  const correct = picked === item.answer;

  // Minimalist per Dan: each question shows ONLY the gapped French sentence,
  // the TTS speaker, the English meaning, and the choices. No context labels,
  // grammar badges, icons, or explanation boxes.
  return (
    <div className="rounded-xl border-2 bg-[var(--fluo-card)] p-3" style={{ borderColor: "var(--fluo-line)" }}>
      <p className="fluo-serif mb-1 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
        <span lang="fr">{item.sentenceBefore}</span>
        <span
          className={`mx-1 inline-block min-w-[56px] rounded-md border-b-2 border-dashed px-1.5 text-center align-baseline ${
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
          onClick={() => speak(ttsTextForItem(item), "fr-FR")}
          title="Hear the full sentence"
          className="ml-1.5 align-middle text-sm opacity-60 transition hover:opacity-100"
        >
          🔊
        </button>
      </p>
      {item.sentenceTrans && (
        <p className="mb-1 text-xs italic text-[color:var(--fluo-ink-soft)]">{item.sentenceTrans}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {choices.map((c) => {
          const isPicked = picked === c;
          const isAnswer = c === item.answer;
          // Same strong solid-fill contrast as the Unit-0 quiz.
          const cls = !showResult
            ? "border-[color:var(--fluo-ink)] bg-[var(--fluo-card)] text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
            : isAnswer
              ? "border-[#178a4d] bg-[#178a4d] text-white"
              : isPicked
                ? "border-[#c0392b] bg-[#c0392b] text-white"
                : "border-[color:var(--fluo-line)] bg-transparent text-[color:var(--fluo-ink-soft)] opacity-40";
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

    </div>
  );
}
