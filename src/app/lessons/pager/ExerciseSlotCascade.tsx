"use client";

/**
 * ExerciseSlotCascade — the slot-cascade Exercise tab, restored.
 *
 * The attached reference HTML (09-faire-du-de-la copy.html) opens L'exercice
 * with three live dropdowns at the top, a cycleable difficulty banner, a
 * slot-cascade prompt visual (subject + verb + activity), and a sentence area
 * whose shape changes with the difficulty: ★ blanks ONE gap — the learner
 * chooses which — ★★ blanks verb AND article, ★★★ is free text, and 🎁 Bonus
 * is the EN→FR round: the English sentence is the prompt and the whole French
 * sentence is typed. 🎲 Random (the main button) rolls every dropdown, 🔊
 * pronounces, ✏️ REDO deals again, 🏁 END hands the run to the pager.
 *
 * This component restores that shape, using the data the lesson already
 * declares: `lesson.dice.axes` are the dropdowns, `lesson.dice.newQuestion`
 * returns a `DiceQuestion` carrying `slots` (subject · verb · article · noun
 * in reading order, with `choices` on each blankable slot). The old
 * LessonPager wrapped that data in a one-card-at-a-time card flow that hid
 * the slot structure; this component renders it inline so the learner can see
 * how each slot's choice constrains the next.
 *
 * Two orange bands in the NEXT PART IS BELOW family point the way in (Dan,
 * 2026-09-18): PICK AS YOU WISH above the dropdowns, PICK FOR ME at Random.
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

type Difficulty = 1 | 2 | 3 | 4; // Facile / Moyen / Difficile / Bonus

// The app's own three-level scale (good/medium/weak) IS the ★/★★/★★★ ladder
// — never a second set of greens and reds (verify19b's ratchet holds this).
// Bonus wears the reward pen: it is the celebration tier, not a fourth danger.
const DIFF_HUE: Record<Difficulty, string> = {
  1: "var(--tier-good)",
  2: "var(--tier-medium)",
  3: "var(--tier-weak)",
  4: "var(--dopa-reward)",
};

/** How many blankable slots each difficulty withdraws.
 *  ★ — ONE gap, and the learner CHOOSES which (Dan, 2026-09-18: *"if
 *      intermédiaire involves two gaps, Facile should allow users to decide
 *      if they want to focus on one or the other"*).
 *  ★★ — the verb AND the article. ★★★ — free text. 🎁 — the Bonus round:
 *  the English sentence is the prompt and the whole French sentence is
 *  typed (Dan, 2026-09-18: *"that bonus round is missing a field for
 *  entering the full sentences"*). */
const BLANK_COUNT: Record<Difficulty, number> = { 1: 1, 2: 2, 3: 0, 4: 0 };

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
  /** At ★ the learner chooses the ONE gap to focus on (verb or article). */
  const [facileGap, setFacileGap] = useState<"verb" | "article">("verb");
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

  // Initial mount — generate the first question. Mount-only: generation
  // shuffles (Math.random), which must live in an effect so SSR and the first
  // client render agree — the house rule every drill follows.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- randomness lives in effects (SSR hydration rule)
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A pin change regenerates IN ITS HANDLER (setPinned + generate together),
  // not in an effect on `pinned` — no first-run guard, no setState-in-effect.

  if (!question) return null;

  const slots = question.slots ?? [];
  const blankCount = BLANK_COUNT[difficulty];
  // At ★ the blanked gap is the learner's CHOICE, not the leftmost — the
  // whole point of the tier (Dan, 2026-09-18). Above ★ the reading order
  // stands.
  const blankedKeys =
    difficulty === 1 ? [facileGap] : blankableKeys.slice(0, blankCount);

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
    generate(next);
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

  /** Switching the ★ focus gap is the same reset as cycling the tier — the
   *  blanks change, so any half-made pick and its verdict must go. */
  const chooseGap = (g: "verb" | "article") => {
    if (g === facileGap) return;
    setFacileGap(g);
    setResult(null);
    setPicks([]);
    setFreeText("");
  };

  // ── MAIN EXERCISE UI ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pt-2">
      {/* Difficulty banner — cycleable mid-run, no one-shot chooser.
          FOUR EQUAL CELLS, STARS STACKED OVER NAME — the entry chooser's own
          shape (Dan, 2026-09-07: *"Can the choice of difficulty be in four
          horizontal buttons"*; stacked because a quarter of a 390px phone is
          ~85px and « ★★★ Difficile » on one line needs 120). A tier's colour
          is its identity either way: the border and text when it stands,
          the whole cell when it is chosen. 2026-09-18: the four content-sized
          chips this replaces wrapped raggedly — "haphazard, not neat". */}
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/60 p-2.5">
        <p className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)]">
          Choose your difficulty
        </p>
        <div className="grid w-full max-w-sm grid-cols-4 gap-1.5">
          {([1, 2, 3, 4] as Difficulty[]).map((lv) => {
            const sel = difficulty === lv;
            return (
              <button
                key={lv}
                type="button"
                onClick={() => cycleDifficulty(lv)}
                title={ENTRY_LABELS[lv].blurb}
                style={sel
                  ? { background: DIFF_HUE[lv] }
                  : { borderColor: DIFF_HUE[lv], color: DIFF_HUE[lv] }}
                className={`flex flex-col items-center gap-0 rounded-lg border-2 px-1 py-2.5 transition ${
                  sel
                    ? "text-white shadow-sm ring-2 ring-[color:var(--cahier-ink)] ring-offset-1"
                    : "bg-white hover:brightness-95"
                }`}
              >
                <span className="text-xs leading-none">{ENTRY_LABELS[lv].stars}</span>
                <span className="mt-1 whitespace-nowrap text-[11px] font-black tracking-wide min-[390px]:text-xs">
                  {ENTRY_LABELS[lv].name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live dropdowns for the lesson's declared axes. Two orange bands in
          the NEXT PART IS BELOW family point at the two ways in (Dan,
          2026-09-18): PICK AS YOU WISH at the dropdowns, PICK FOR ME at
          Random — the main button, always. */}
      {axes.length > 0 && (
        <div className="space-y-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/60 p-2.5">
          <div aria-hidden className="flex flex-col items-center">
            <div className="fluo-nextq">PICK AS YOU WISH</div>
            <div className="fluo-nextq-arrows"><span>↓</span><span>↓</span><span>↓</span></div>
          </div>
          {axes.map((ax) => (
            <label key={ax.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-bold text-[color:var(--cahier-ink)]/70">{ax.label}</span>
              <select
                value={pinned[ax.key] ?? ""}
                onChange={(e) => {
                  const next = { ...pinned, [ax.key]: e.target.value };
                  setPinned(next);
                  generate(next);
                }}
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
          <div className="flex flex-col items-center gap-1 pt-1">
            <div aria-hidden className="flex flex-col items-center">
              <div className="fluo-nextq">PICK FOR ME</div>
              <div className="fluo-nextq-arrows"><span>↓</span><span>↓</span><span>↓</span></div>
            </div>
            <div className="flex justify-center gap-2">
              {/* THE MAIN BUTTON (Dan, 2026-09-18: *"the main button to push
                  is always the RANDOM"*) — primary and a size up; everything
                  else on this tab is secondary to it. */}
              <button
                type="button"
                onClick={handleRandom}
                className="cahier-btn cahier-btn-primary px-4 py-2.5 text-base"
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
        </div>
      )}

      {/* Slot-cascade prompt visual: the prompt meta + the bare noun (the
          thing the rest of the sentence is built around) + the English
          reference. AT BONUS NONE OF THIS SHOWS — the meta prints the
          conjugated verb and the noun, which are the whole answer there;
          the English sentence below becomes the prompt and everything the
          learner must produce is withdrawn. */}
      {difficulty !== 4 && question.meta && (
        <p className="text-center text-xs uppercase tracking-wider text-[color:var(--cahier-ink)]/60">
          {question.meta}
        </p>
      )}
      {difficulty !== 4 && question.big && (
        <p
          className="card-hand text-center text-2xl font-black leading-snug text-[color:var(--cahier-ink)]"
          lang={question.bigLang ?? "fr"}
        >
          {question.big}
        </p>
      )}
      {question.en && (
        <p
          className={
            difficulty === 4
              ? "card-hand text-center text-2xl font-black leading-snug text-[color:var(--cahier-ink)]"
              : "text-center text-sm italic text-[color:var(--cahier-ink)]/70"
          }
          lang="en"
        >
          {question.en}
        </p>
      )}

      {/* At ★ the learner picks the ONE gap this question is about (Dan,
          2026-09-18) — content-sized buttons, centred, never full width. */}
      {difficulty === 1 && slots.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="text-[color:var(--cahier-ink)]/70">Focus on:</span>
          {(["verb", "article"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => chooseGap(g)}
              className={
                facileGap === g
                  ? "rounded-lg border-2 border-[color:var(--cahier-ink)] bg-[color:var(--cahier-rule)]/40 px-3 py-1 uppercase tracking-wide"
                  : "rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-1 uppercase tracking-wide text-[color:var(--cahier-ink)]/70"
              }
            >
              {g === "verb" ? "Verb" : "Article"}
            </button>
          ))}
        </div>
      )}

      {/* Sentence area — ★/★★ show inline dropdowns, ★★★ free text, 🎁 the
          Bonus round: the whole French sentence from the English prompt. */}
      <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-3">
        {difficulty === 3 || difficulty === 4 ? (
          <input
            type="text"
            lang="fr"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
            placeholder={difficulty === 4 ? "Write the whole sentence in French…" : "Écrivez la phrase complète…"}
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

      {/* Check button — English chrome (Dan, 2026-09-18: "CHECK - REDO -
          END"), and deliberately secondary: Random is this tab's one
          primary. */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={check}
          className="cahier-btn"
        >
          ✅ CHECK
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
          ✏️ REDO
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={entries.length === 0}
          className="cahier-btn disabled:opacity-40"
        >
          🏁 END
        </button>
      </div>
    </div>
  );
}
