"use client";

/**
 * 🏁 Bilan de fluidité (Dan, 2026-07-08, episode model): the chapter-end
 * fluency check — harder than the lessons because it mixes EVERY deck of the
 * unité in one run. NO LOCKS: unlimited retakes, nothing gated on passing.
 * Every answer feeds the SRS via recordItemResult, so missed items land in
 * the Réviseur automatically — the bilan diagnoses, the Réviseur repairs.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { CURATED } from "@/content/collections";
import { CHAPTERS } from "@/content/chapters";
import { toPracticeSet } from "@/lib/practice/engine";
import { recordItemResult } from "@/lib/progress";
import { speak } from "@/games/letris/speech";
import { sfx } from "@/games/audio/sfx";

const QUIZ_LEN = 15;
const PASS = 0.8;

type Q = {
  id: string;
  prompt: string;
  fr: string; // the stem shown big (word or gapped sentence)
  choices: string[];
  correctIdx: number;
  tts: string; // spoken on a correct answer
};

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuestions(unit: number): Q[] {
  const decks = CURATED.filter((c) => c.unit === unit);
  const pool: Q[] = [];
  for (const deck of decks) {
    // Column MCQs — the deck's own sort drill, cross-deck shuffled.
    const set = toPracticeSet(deck);
    if (set) {
      for (const it of set.items) {
        const choices = it.choices.map((c) => c.label);
        pool.push({
          id: it.id,
          prompt: set.prompt ?? "Quelle forme va avec… ?",
          fr: it.fr,
          choices,
          correctIdx: it.choices.findIndex((c) => c.key === it.correctColKey),
          tts: it.ttsText,
        });
      }
    }
    // Cloze MCQs — gapped examples with sibling gaps as distractors.
    const gaps = [...new Set(deck.items.map((i) => i.gap).filter((g): g is string => !!g))];
    for (const it of deck.items) {
      const sentence = it.example ?? (it.gap && it.fr.includes(it.gap) ? it.fr : undefined);
      if (!it.gap || !sentence || !sentence.includes(it.gap)) continue;
      const distractors = shuffle(gaps.filter((g) => g !== it.gap)).slice(0, 3);
      if (distractors.length < 2) continue;
      const choices = shuffle([it.gap, ...distractors]);
      pool.push({
        id: it.id,
        prompt: "Complétez :",
        fr: sentence.replace(it.gap, "____"),
        choices,
        correctIdx: choices.indexOf(it.gap),
        tts: sentence,
      });
    }
  }
  // One question per item id (an item can appear in both builders).
  const seen = new Set<string>();
  const unique = shuffle(pool).filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
  return unique.slice(0, QUIZ_LEN);
}

export default function BilanQuiz({ unit }: { unit: number }) {
  const [round, setRound] = useState(0); // bump to rebuild a fresh quiz
  const questions = useMemo(() => buildQuestions(unit), [unit, round]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [missed, setMissed] = useState<Q[]>([]);

  const q = questions[idx];
  const finished = idx >= questions.length;
  const pct = questions.length ? score / questions.length : 0;
  const passed = finished && pct >= PASS;

  function answer(i: number) {
    if (pickedIdx !== null || !q) return;
    setPickedIdx(i);
    const ok = i === q.correctIdx;
    recordItemResult(q.id, ok);
    if (ok) {
      setScore((s) => s + 1);
      sfx.correct();
      speak(q.tts, "fr-FR");
    } else {
      sfx.wrong();
      setMissed((m) => [...m, q]);
    }
    window.setTimeout(() => {
      setPickedIdx(null);
      setIdx((n) => {
        const next = n + 1;
        if (next >= questions.length) {
          const finalScore = ok ? score + 1 : score;
          if (questions.length && finalScore / questions.length >= PASS) sfx.stage();
          // Remember the best run — the home map's 🏁 node turns solid on a pass.
          try {
            const key = `fluolingo:bilan.u${unit}`;
            const best = parseFloat(window.localStorage.getItem(key) ?? "0");
            const now = Math.round((finalScore / questions.length) * 100);
            if (now > best) window.localStorage.setItem(key, String(now));
          } catch {}
        }
        return next;
      });
    }, ok ? 700 : 1400);
  }

  function restart() {
    setIdx(0);
    setScore(0);
    setMissed([]);
    setPickedIdx(null);
    setRound((r) => r + 1);
  }

  if (questions.length === 0) {
    return <p className="text-sm text-[color:var(--cahier-ink-soft)]">Rien à tester ici pour l&rsquo;instant.</p>;
  }

  return (
    <AuthGate what="take the bilan" compact>
      {!finished && q ? (
        <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/80 p-5">
          <div className="mb-3 flex items-center justify-between text-xs font-bold text-[color:var(--cahier-ink-soft)]">
            <span>{idx + 1} / {questions.length}</span>
            <span>✓ {score}</span>
          </div>
          <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">{q.prompt}</p>
          <p lang="fr" className="cahier-display my-3 text-2xl font-black text-[color:var(--cahier-ink)]">{q.fr}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.choices.map((c, i) => {
              const state =
                pickedIdx === null ? "" :
                i === q.correctIdx ? "!border-emerald-600 !bg-emerald-600/10" :
                i === pickedIdx ? "!border-rose-600 !bg-rose-600/10" : "opacity-50";
              return (
                <button key={`${c}-${i}`} type="button" lang="fr" onClick={() => answer(i)}
                  className={`cahier-option rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-left font-bold text-[color:var(--cahier-ink)] transition ${state}`}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/80 p-5 text-center">
          <p className="text-4xl" aria-hidden>{passed ? "🏁" : "💪"}</p>
          <p className="cahier-display mt-2 text-xl font-black text-[color:var(--cahier-ink)]">
            {score} / {questions.length} {passed ? "— Bilan réussi !" : "— pas encore 80 %"}
          </p>
          {missed.length > 0 && (
            <p className="mt-2 text-sm text-[color:var(--cahier-ink-soft)]">
              Vos points faibles sont déjà dans le <Link href="/reviser" className="font-bold underline">🔁 Réviseur</Link>.
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={restart} className="cahier-btn cahier-btn-primary">↻ Réessayer</button>
            <Link href={`/unit/${unit}`} className="cahier-btn">← {CHAPTERS[unit]?.scenario ?? `Unité ${unit}`}</Link>
            {passed && unit < 4 && (
              <Link href={`/unit/${unit + 1}`} className="cahier-btn">Chapitre suivant →</Link>
            )}
          </div>
        </div>
      )}
    </AuthGate>
  );
}
