"use client";

/**
 * 🏁 Bilan de fluidité (Dan, 2026-07-08, episode model): the chapter-end
 * fluency check — harder than the lessons because it mixes EVERY deck of the
 * unité in one run. NO LOCKS: unlimited retakes, nothing gated on passing.
 * Every answer feeds the SRS via recordItemResult, so missed items land in
 * the Réviseur automatically — the bilan diagnoses, the Réviseur repairs.
 *
 * Question discipline (Dan, 2026-07-08): an item whose fr is a full sentence
 * NEVER becomes a category MCQ — the sentence would display the answer
 * (« Nous ne faisons pas de vélo » → "pas de or pas le?" is pointless).
 * Sentences are asked as CLOZE (the gap blanked at a word boundary) instead.
 * A ← / → lets the learner review already-answered questions at any time.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

const isSentence = (s: string) => s.includes(" ") && /[.!?…]$/.test(s.trim());

/** Blank the gap at a WORD BOUNDARY — a naive replace would hit « de » inside
 *  « du » ("faire du tennis → pas de tennis"). Elided gaps (d') may butt a
 *  vowel on the right. Returns null when no clean occurrence exists. */
function blankGap(sentence: string, gap: string): string | null {
  const letter = /[A-Za-zÀ-ÿ]/;
  for (let i = 0; (i = sentence.indexOf(gap, i)) !== -1; i += 1) {
    const before = i === 0 ? "" : sentence[i - 1];
    const after = sentence[i + gap.length] ?? "";
    const okBefore = before === "" || !letter.test(before);
    const okAfter = after === "" || !letter.test(after) || gap.endsWith("'");
    if (okBefore && okAfter) return `${sentence.slice(0, i)}____${sentence.slice(i + gap.length)}`;
  }
  return null;
}

function buildQuestions(unit: number): Q[] {
  const decks = CURATED.filter((c) => c.unit === unit);
  const pool: Q[] = [];
  for (const deck of decks) {
    // Category MCQs — the deck's own sort drill, cross-deck shuffled. Skipped
    // for sentence items: the sentence displays the sorted form already.
    const set = toPracticeSet(deck);
    if (set) {
      for (const it of set.items) {
        if (isSentence(it.fr)) continue;
        pool.push({
          id: it.id,
          prompt: set.prompt ?? "Which category does this belong to?",
          fr: it.fr,
          choices: it.choices.map((c) => c.label),
          correctIdx: it.choices.findIndex((c) => c.key === it.correctColKey),
          tts: it.ttsText,
        });
      }
    }
    // Cloze MCQs — sentence items (and gapped examples) with sibling gaps as
    // distractors. Prefer the item's own sentence over its example note.
    const gaps = [...new Set(deck.items.map((i) => i.gap).filter((g): g is string => !!g))];
    for (const it of deck.items) {
      if (!it.gap) continue;
      const source =
        isSentence(it.fr) && it.fr.includes(it.gap) ? it.fr
        : it.example && it.example.includes(it.gap) ? it.example
        : undefined;
      if (!source) continue;
      const blanked = blankGap(source, it.gap);
      if (!blanked) continue;
      // ≥1 distractor is enough — two-way contrasts (pas de / pas le) are
      // exactly the distinction some decks drill.
      const distractors = shuffle(gaps.filter((g) => g !== it.gap)).slice(0, 3);
      if (distractors.length < 1) continue;
      const choices = shuffle([it.gap, ...distractors]);
      pool.push({
        id: it.id,
        prompt: "Complétez :",
        fr: blanked,
        choices,
        correctIdx: choices.indexOf(it.gap),
        tts: source,
      });
    }
  }
  // One question per item id — cloze wins over category when both exist,
  // so sort cloze first before deduping.
  const seen = new Set<string>();
  const unique = shuffle(pool)
    .sort((a, b) => Number(b.prompt === "Complétez :") - Number(a.prompt === "Complétez :"))
    .filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
  return shuffle(unique).slice(0, QUIZ_LEN);
}

export default function BilanQuiz({ unit }: { unit: number }) {
  const [round, setRound] = useState(0); // bump to rebuild a fresh quiz
  const questions = useMemo(() => buildQuestions(unit), [unit, round]);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  // cursor ranges 0..questions.length — the last position is the results view.
  const [cursor, setCursor] = useState(0);
  const endedRef = useRef(false);

  const progress = answers.indexOf(null); // next unanswered; -1 = all answered
  const finished = progress === -1 && questions.length > 0;
  const score = questions.reduce((n, q, i) => n + (answers[i] === q.correctIdx ? 1 : 0), 0);
  const passed = finished && score / questions.length >= PASS;
  const missedCount = questions.reduce((n, q, i) => n + (answers[i] !== null && answers[i] !== q.correctIdx ? 1 : 0), 0);

  // End-of-run side effects once: fanfare on a pass, remember the best score.
  useEffect(() => {
    if (!finished || endedRef.current) return;
    endedRef.current = true;
    if (passed) sfx.stage();
    try {
      const key = `fluolingo:bilan.u${unit}`;
      const best = parseFloat(window.localStorage.getItem(key) ?? "0") || 0;
      const now = Math.round((score / questions.length) * 100);
      if (now > best) window.localStorage.setItem(key, String(now));
    } catch {}
  }, [finished, passed, score, questions.length, unit]);

  function answer(i: number) {
    const q = questions[cursor];
    if (!q || answers[cursor] !== null || cursor !== progress) return;
    const ok = i === q.correctIdx;
    setAnswers((a) => a.map((x, k) => (k === cursor ? i : x)));
    recordItemResult(q.id, ok);
    if (ok) {
      sfx.correct();
      speak(q.tts, "fr-FR");
    } else {
      sfx.wrong();
    }
    window.setTimeout(() => setCursor((c) => c + 1), ok ? 700 : 1400);
  }

  function restart() {
    endedRef.current = false;
    setRound((r) => r + 1);
    setCursor(0);
    setAnswers([]); // refilled by the effect below once questions rebuild
  }
  useEffect(() => {
    setAnswers(questions.map(() => null));
    setCursor(0);
  }, [questions]);

  if (questions.length === 0) {
    return <p className="text-sm text-[color:var(--cahier-ink-soft)]">Rien à tester ici pour l&rsquo;instant.</p>;
  }

  const q = questions[cursor];
  const reviewing = q !== undefined && answers[cursor] !== null;
  // ← reviews past questions any time; → returns toward the live one/results.
  const nav = (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => setCursor((c) => Math.max(0, c - 1))}
        disabled={cursor === 0} aria-label="Question précédente"
        className="cahier-btn cahier-btn-sm disabled:opacity-40">←</button>
      <button type="button" onClick={() => setCursor((c) => Math.min(questions.length, c + 1))}
        disabled={cursor >= questions.length || answers[cursor] === null}
        aria-label="Question suivante"
        className="cahier-btn cahier-btn-sm disabled:opacity-40">→</button>
    </div>
  );

  return (
    <AuthGate what="take the bilan" compact>
      {q ? (
        <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/80 p-5">
          <div className="mb-3 flex items-center justify-between text-xs font-bold text-[color:var(--cahier-ink-soft)]">
            <span>{cursor + 1} / {questions.length}{reviewing && " · revue"}</span>
            <div className="flex items-center gap-2">
              <span>✓ {score}</span>
              {nav}
            </div>
          </div>
          <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">{q.prompt}</p>
          <p lang="fr" className="cahier-display my-3 text-2xl font-black text-[color:var(--cahier-ink)]">{q.fr}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.choices.map((c, i) => {
              const picked = answers[cursor];
              const state =
                picked === null ? "" :
                i === q.correctIdx ? "!border-emerald-600 !bg-emerald-600/10" :
                i === picked ? "!border-rose-600 !bg-rose-600/10" : "opacity-50";
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
          {missedCount > 0 && (
            <p className="mt-2 text-sm text-[color:var(--cahier-ink-soft)]">
              Vos points faibles sont déjà dans le <Link href="/reviser" className="font-bold underline">🔁 Réviseur</Link>.
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setCursor(questions.length - 1)} className="cahier-btn">← Revoir les questions</button>
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
