"use client";

/**
 * ExerciseSlotCascade — the slot-cascade Exercise tab, restored.
 *
 * The attached reference HTML (09-faire-du-de-la copy.html) opens L'exercice
 * with three live dropdowns at the top, a cycleable difficulty banner, a
 * slot-cascade prompt visual (subject + verb + activity), and a sentence area
 * whose shape changes with the difficulty: ★ blanks the verb only, ★★ blanks
 * verb AND article, ★★★ is a free-text input. 🎲 randomises, 🔊 pronounces,
 * ✏️ redo, 🏁 finish.
 *
 * This component restores that shape, using the data the lesson already
 * declares: `lesson.dice.axes` are the dropdowns, `lesson.dice.newQuestion`
 * returns a `DiceQuestion` carrying `slots` (subject · verb · article · noun
 * in reading order, with `choices` on each blankable slot). The old
 * LessonPager wrapped that data in a one-card-at-a-time card flow that hid
 * the slot structure; this component renders it inline so the learner can see
 * how each slot's choice constrains the next.
 *
 * SCOPE — wired only to the `faire` lesson via LessonPager's `exercise` prop.
 * 🏁 hands the run to the parent through `onFinish` — LessonPager's own end
 * card owns the SIO write, XP and elapsed, so the cascade carries no score
 * panel and no summary of its own.
 */
import { useEffect, useMemo, useState } from "react";
import type { DiceQuestion, NativeLesson } from "@/content/lessons/native/types";
import { sentence as joinSlots } from "@/content/lessons/native/cloze";
import { speak } from "@/games/letris/speech";
import { ENTRY_LABELS } from "@/lib/lessonEntry";

type Difficulty = 1 | 2 | 3; // Facile / Intermédiaire / Difficile

// Derived from ENTRY_LABELS, the one source (verify22: a second hand-built
// picker is what the literal would mean). The cascade's banner is MID-RUN and
// cycleable, unlike the entry chooser — but it wears the entry chooser's names.
const DLABEL: Record<Difficulty, string> = {
  1: `${ENTRY_LABELS[1].stars} ${ENTRY_LABELS[1].name}`,
  2: `${ENTRY_LABELS[2].stars} ${ENTRY_LABELS[2].name}`,
  3: `${ENTRY_LABELS[3].stars} ${ENTRY_LABELS[3].name}`,
};

// The app's own three-level scale (good/medium/weak) IS the ★/★★/★★★ ladder
// — never a second set of greens and reds (verify19b's ratchet holds this).
const DIFF_HUE: Record<Difficulty, string> = {
  1: "var(--tier-good)",
  2: "var(--tier-medium)",
  3: "var(--tier-weak)",
};

/** How many blankable slots each difficulty withdraws.
 *  ★ — the verb (first blankable). ★★ — verb + article. ★★★ — none (free text). */
const BLANK_COUNT: Record<Difficulty, number> = { 1: 1, 2: 2, 3: 0 };

type Entry = {
  prompt: string;
  user: string;
  correct: string;
  ok: boolean;
  difficulty: Difficulty;
};

type Props = {
  lesson: NativeLesson;
  activityKey: string;
  /** Called when the learner presses 🏁. The parent may wire XP / SIO writes. */
  onFinish?: (entries: Entry[]) => void;
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?,;:]+$/g, "");
}

export default function ExerciseSlotCascade({ lesson, activityKey, onFinish }: Props) {
  const axes = lesson.dice.axes ?? [];

  const [pinned, setPinned] = useState<Record<string, string>>({});
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [question, setQuestion] = useState<DiceQuestion | null>(null);
  const [picks, setPicks] = useState<string[]>([]); // one per blank, in reading order
  const [freeText, setFreeText] = useState("");
  const [result, setResult] = useState<{ ok: boolean; correct: string; user: string } | null>(null);

  /** One answered item, handed to the parent on 🏁 — the pager's end card
   *  computes its own accuracy from these. */
  const [entries, setEntries] = useState<Entry[]>([]);

  const blankableKeys = useMemo(() => {
    if (!question?.slots) return [];
    return question.slots.filter((s) => s.key && Array.isArray(s.choices) && s.choices.length > 0).map((s) => s.key!);
  }, [question]);

  // Generate a fresh question for the current pin. Kept as a stable callback
  // so we can call it from initial mount, 🎲 random, and ✏️ redo.
  const generate = (nextPinned?: Record<string, string>) => {
    const p = nextPinned ?? pinned;
    const q = lesson.dice.newQuestion(p);
    setQuestion(q);
    setPicks([]);
    setFreeText("");
    setResult(null);
  };

  // Initial mount — generate the first question. Mount-only, so the learner's
  // first impression is a real slot-cascade, not an empty slot.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-generate when an axis pin changes — the slot-cascade should react to
  // the dropdown. Skipped on initial mount (the effect above handles that).
  const firstRun = useMemo(() => ({ done: false }), []);
  useEffect(() => {
    if (firstRun.done) generate();
    firstRun.done = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  if (!question) return null;

  const slots = question.slots ?? [];
  const blankCount = BLANK_COUNT[difficulty];
  const blankedKeys = blankableKeys.slice(0, blankCount);

  // Map a slot's key to a pick index (the n-th blanked slot).
  const pickIndex = (key: string | undefined) =>
    key ? blankedKeys.indexOf(key) : -1;

  const buildUserSentence = (): string => {
    if (difficulty === 3) return freeText.trim();
    if (slots.length === 0) return freeText.trim();
    const rebuilt = slots.map((s) => {
      const idx = pickIndex(s.key);
      if (idx >= 0 && picks[idx]) return { ...s, text: picks[idx] };
      return s;
    });
    return joinSlots(rebuilt);
  };

  const check = () => {
    const user = buildUserSentence();
    if (!user) return;
    const acceptable = [question.correct, ...(question.alternates ?? [])];
    const ok = acceptable.some((a) => norm(a) === norm(user));
    setResult({ ok, correct: question.correct, user });
    setEntries((e) => [
      ...e,
      { prompt: question.meta, user, correct: question.correct, ok, difficulty },
    ]);
  };

  const handleRandom = () => {
    const next: Record<string, string> = {};
    axes.forEach((ax) => {
      next[ax.key] = pick(ax.options).value;
    });
    setPinned(next);
  };

  const handlePronounce = () => {
    if (question.correct) speak(question.correct, "fr-FR");
  };

  const handleRedo = () => generate();

  const handleFinish = () => onFinish?.(entries);

  const cycleDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setResult(null);
    setPicks([]);
    setFreeText("");
  };

  // ── MAIN EXERCISE UI ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pt-2">
      {/* Difficulty banner — cycleable mid-run, no one-shot chooser */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-yellow-300 bg-yellow-50 p-2.5">
        <span className="text-xs font-bold text-yellow-900">Choose your difficulty:</span>
        {([1, 2, 3] as Difficulty[]).map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => cycleDifficulty(lv)}
              style={{ background: DIFF_HUE[lv] }}
              className={`rounded-lg px-3 py-1.5 text-xs font-black text-white shadow-sm transition ${
              difficulty === lv ? "ring-2 ring-black ring-offset-1" : "opacity-70 hover:opacity-100"
            }`}
          >
            {DLABEL[lv]}
          </button>
        ))}
      </div>

      {/* Live dropdowns for the lesson's declared axes */}
      {axes.length > 0 && (
        <div className="space-y-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/60 p-2.5">
          {axes.map((ax) => (
            <label key={ax.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-bold text-[color:var(--cahier-ink)]/70">{ax.label}</span>
              <select
                value={pinned[ax.key] ?? ""}
                onChange={(e) =>
                  setPinned((p) => ({ ...p, [ax.key]: e.target.value }))
                }
                className="min-w-32 rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-2 py-1 font-bold text-[color:var(--cahier-ink)]"
                lang="fr"
              >
                <option value="">— any —</option>
                {ax.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleRandom}
              className="cahier-btn"
              title="Pick random values for every dropdown"
            >
              🎲🎲 Random
            </button>
            <button
              type="button"
              onClick={handlePronounce}
              className="cahier-btn"
              title="Hear the correct sentence"
            >
              🔊 Listen
            </button>
          </div>
        </div>
      )}

      {/* Slot-cascade prompt visual: the prompt meta + the bare noun (the
          thing the rest of the sentence is built around) + the English
          reference. */}
      {question.meta && (
        <p className="text-center text-xs uppercase tracking-wider text-[color:var(--cahier-ink)]/60">
          {question.meta}
        </p>
      )}
      {question.big && (
        <p
          className="card-hand text-center text-2xl font-black leading-snug text-[color:var(--cahier-ink)]"
          lang={question.bigLang ?? "fr"}
        >
          {question.big}
        </p>
      )}
      {question.en && (
        <p
          className="text-center text-sm italic text-[color:var(--cahier-ink)]/70"
          lang="en"
        >
          {question.en}
        </p>
      )}

      {/* Sentence area — ★/★★ show inline dropdowns; ★★★ shows free text */}
      <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-3">
        {difficulty === 3 ? (
          <input
            type="text"
            lang="fr"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
            placeholder="Écrivez la phrase complète…"
            className="w-full rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-center text-lg font-bold text-[color:var(--cahier-ink)] focus:border-[color:var(--cahier-ink)] focus:outline-none"
            autoCapitalize="sentences"
            spellCheck={false}
          />
        ) : slots.length === 0 ? (
          <p className="text-center text-sm text-[color:var(--cahier-ink)]/60">
            This lesson&apos;s generator has no slots; use ★★★ to type the sentence.
          </p>
        ) : (
          <p className="card-hand text-center text-lg leading-loose text-[color:var(--cahier-ink)]" lang="fr">
            {slots.map((s, i) => {
              // Fixed text slot — render as-is, with a trailing space unless
              // the chunk ends in an apostrophe (French elision: « l' », « d' »
              // glue to the following word with no space). Mirrors the
              // joinSlots() rule so the on-screen sentence and the
              // check-time string cannot drift apart.
              if (!s.key || pickIndex(s.key) < 0) {
                const tail = /['’]$/.test(s.text) ? "" : " ";
                return (
                  <span key={i}>
                    {s.text}
                    {tail}
                  </span>
                );
              }
              // Blanked slot — render a dropdown inline.
              const idx = pickIndex(s.key)!;
              const value = picks[idx] ?? "";
              return (
                <select
                  key={i}
                  value={value}
                  onChange={(e) =>
                    setPicks((p) => {
                      const next = [...p];
                      while (next.length <= idx) next.push("");
                      next[idx] = e.target.value;
                      return next;
                    })
                  }
                  className="mx-1 inline-block min-w-32 rounded-md border-2 border-dashed border-[color:var(--cahier-ink)] bg-white px-2 py-0.5 align-baseline text-base font-bold"
                >
                  <option value="">[{s.key}]</option>
                  {(s.choices ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              );
            })}
          </p>
        )}
      </div>

      {/* Check button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={check}
          className="cahier-btn cahier-btn-primary"
        >
          ✅ Je vérifie
        </button>
      </div>

      {/* Feedback */}
      {result && (
        <div
          className={`rounded-lg border-2 p-3 text-center text-sm ${
            result.ok
              ? "border-[color:var(--drill-ok)] bg-[color:var(--drill-ok-bg)]"
              : "border-[color:var(--drill-bad)] bg-[color:var(--drill-bad-bg)]"
          }`}
        >
          {result.ok ? (
            <span className={`font-bold text-[color:var(--drill-ok-ink)]`}>
              ✔ C&apos;est correct !
            </span>
          ) : (
            <span className={`font-bold text-[color:var(--drill-bad-ink)]`}>
              ✘ Pas correct. → <span lang="fr">{result.correct}</span>{" "}
              <button
                type="button"
                onClick={handlePronounce}
                className="ml-1 align-middle"
                aria-label="Hear the correct sentence"
              >
                🔊
              </button>
            </span>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex justify-center gap-2">
        <button type="button" onClick={handleRedo} className="cahier-btn">
          ✏️ Refaire
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={entries.length === 0}
          className="cahier-btn disabled:opacity-40"
        >
          🏁 Terminer
        </button>
      </div>
    </div>
  );
}
