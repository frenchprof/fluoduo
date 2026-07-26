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
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import { getPretest, sioIdForPretest } from "@/content/pretests";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { logEvent } from "@/lib/firebase/usage";
import { recordPretestAnswer, stemForItem } from "@/lib/pretestRecord";
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

  const total = qs.length;
  const answered = Object.keys(picked).length;
  const score = qs.filter((q) => picked[q.item.id] === q.item.answer).length;

  // Keyboard (Dan, 2026-07-14): with several questions on screen, digits
  // answer the FIRST unanswered one (the natural reading order), then the
  // next unanswered question scrolls into view; Enter jumps to it.
  const activeQ = qs.find((q) => picked[q.item.id] === undefined);
  const scrollToActive = () => {
    window.setTimeout(() => {
      document.querySelector("[data-preq-active]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 60);
  };
  useChoiceKeys({
    count: activeQ?.choices.length ?? 0,
    enabled: !!activeQ,
    onPick: (i) => {
      if (activeQ && activeQ.choices[i] !== undefined) {
        pick(activeQ, activeQ.choices[i]);
        scrollToActive();
      }
    },
    onNext: scrollToActive,
  });

  function pick(q: Q, choice: string) {
    if (picked[q.item.id] !== undefined) return;
    setPicked({ ...picked, [q.item.id]: choice });
    // Last answer in → the popup may reveal its post-pretest content (Dan,
    // 2026-07-05: the lesson button appears only AFTER the pretest is done).
    const last = Object.keys(picked).length + 1 === total && total > 0;
    if (last) {
      window.dispatchEvent(new CustomEvent("fluolingo:pretest-complete", { detail: { id: pretestId } }));
    }
    const correct = choice === q.item.answer;
    if (correct) sfx.correct(); else sfx.wrong();
    if (last) sfx.stage(); // pretest finished — the bigger stage jingle too
    if (correct) speak(ttsTextForItem(q.item), "fr-FR");
    // Gap report (audit R1): persist the verdict so it survives popup close.
    recordPretestAnswer({
      pretestId,
      sioId: sioIdForPretest(pretestId) ?? "",
      itemId: q.item.id,
      correct,
      picked: choice,
      answer: q.item.answer,
      stem: stemForItem(q.item),
    });
    void logEvent("pretest.answer", {
      pretestId,
      itemId: q.item.id,
      correct,
      picked: choice,
    });
  }

  // Per Dan: the counter stays (learners track progress with it); no labels.
  return (
    <div className="space-y-3">
      {answered > 0 && (
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">
          {answered}/{total} · ✓ {score}
        </p>
      )}
      {qs.map((q) => (
        <div key={q.item.id} {...(q === activeQ ? { "data-preq-active": true } : {})}>
          <QuestionCard q={q} picked={picked[q.item.id]} active={q === activeQ} onPick={(c) => pick(q, c)} />
        </div>
      ))}
    </div>
  );
}

function QuestionCard({
  q,
  picked,
  active = false,
  onPick,
}: {
  q: Q;
  picked?: string;
  /** The first unanswered question — the one the 1-4 keys answer. Only IT
   *  wears the numeral chips (Dan, 2026-07-16: "appear on the active
   *  question waiting to be answered, and not on others [yet]"). */
  active?: boolean;
  onPick: (c: string) => void;
}) {
  const { item, choices } = q;
  const showResult = picked !== undefined;
  const correct = picked === item.answer;
  const [showWhy, setShowWhy] = useState(false);
  // WHY appears only on a WRONG answer, and explains only why THAT choice is
  // wrong (Dan, 2026-07-02). Correct answers get TTS + green — no explanation.
  const whyText = !correct && picked !== undefined ? item.whyWrong?.[picked] : undefined;

  return (
    <div className="relative rounded-xl border-2 bg-[var(--fluo-card)] p-3" style={{ borderColor: "var(--fluo-line)" }}>
      {whyText && (
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className={`absolute right-2 top-2 rounded-full border-2 px-2 py-0.5 text-[0.6rem] font-black tracking-wider transition ${
            showWhy
              ? "border-[color:var(--fluo-ink)] bg-[color:var(--fluo-ink)] text-white"
              : "border-[color:var(--fluo-ink)] bg-white text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
          }`}
        >
          WHY
        </button>
      )}
      {/* Sentence and options share one row where they fit (Dan, 2026-07-02);
          the options travel as ONE group so they never split across lines. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pr-9">
        <span className="fluo-serif text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
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
        </span>
        <span className="flex flex-wrap items-center gap-2">
          {choices.map((c, i) => {
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
                // Answered → every option stays tappable purely for its sound
                // (Dan, 2026-07-04), matching the Unit-0 quiz behaviour.
                onClick={() => (showResult ? speak(c, "fr-FR") : onPick(c))}
                lang="fr"
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${cls}`}
              >
                {active && !showResult && (
                  <span aria-hidden className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--fluo-ink)] text-[10px] font-black text-white">
                    {i + 1}
                  </span>
                )}
                {c}
              </button>
            );
          })}
        </span>
      </div>
      {item.sentenceTrans && item.transFirst && !showResult ? (
        <p className="mt-1 w-fit rounded-md border-l-4 border-[color:var(--fluo-hl)] bg-[color:var(--fluo-hl)]/20 px-2 py-1 text-sm font-bold text-[color:var(--fluo-ink)]">
          🎯 {item.sentenceTrans}
        </p>
      ) : item.sentenceTrans && showResult ? (
        <p className="mt-1 text-xs italic text-[color:var(--fluo-ink-soft)]">{item.sentenceTrans}</p>
      ) : null}

      {showWhy && whyText && (
        {/* Red border on the why-box (Dan, 2026-07-27): the explanation of a
            wrong answer should look like what it is — a correction. */}
        <div className="mt-2 rounded-lg border-2 border-rose-500 bg-white/70 p-2.5 text-xs text-[color:var(--fluo-ink)]">{whyText}</div>
      )}
    </div>
  );
}
