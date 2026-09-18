"use client";

/**
 * ExerciseSlotCascade — the slot-cascade Exercise tab, restored.
 *
 * The attached reference HTML (09-faire-du-de-la copy.html) opens L'exercice
 * with three live dropdowns at the top, a cycleable difficulty banner, a
 * slot-cascade prompt visual (subject + verb + activity), and a sentence area
 * whose shape changes with the difficulty: ★ blanks ONE gap — the learner
 * chooses which — ★★ blanks verb AND article, ★★★ is free text, and 🎁 Bonus
 * is the EN→FR round: "Translate: …" is the prompt and the whole French
 * sentence is typed. 🎲 Random (the main button) rolls every dropdown, 🔊
 * pronounces, ✏️ REDO deals again, 🏁 END hands the run to the pager.
 *
 * This component restores that shape, using the data the lesson already
 * declares: `lesson.dice.axes` are the dropdowns, `lesson.dice.newQuestion`
 * returns a `DiceQuestion` carrying `slots`. The old LessonPager wrapped that
 * data in a one-card-at-a-time card flow that hid the slot structure; this
 * component renders it inline so the learner can see how each slot's choice
 * constrains the next.
 *
 * COMPACT (Dan, 2026-09-18: *"make sure the items on the page remain within
 * one screen view"*): the whole tab is sized to one phone screen — a
 * four-cell banner one row tall, the three axis dropdowns on ONE row each
 * only as wide as its longest word, cue bands in `.fluo-cue`'s compact scale,
 * and the buttons in `cahier-btn--compact` so a step's controls never spill
 * past their line. Explanatory lines are POINT FORM, never prose.
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
    if (difficulty === 4) return freeText.trim();
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

  /** An axis's options for the CURRENT pins — cascaded axes are functions
   *  (the OBJET follows the VERB, Dan's mockup). */
  const optionsOf = (
    ax: (typeof axes)[number],
    pins: Record<string, string>,
  ) => (typeof ax.options === "function" ? ax.options(pins) : ax.options);

  const handleRandom = () => {
    const next: Record<string, string> = {};
    // Sequential, so a cascaded axis sees the pins already drawn — Random
    // rolls the verb BEFORE the objet, and the objet lands on a noun that
    // verb genuinely takes.
    axes.forEach((ax) => {
      next[ax.key] = pick(optionsOf(ax, next)).value;
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
    <div className="space-y-2.5 pt-1">
      {/* Difficulty banner — cycleable mid-run, no one-shot chooser.
          FOUR EQUAL CELLS, STARS STACKED OVER NAME — the entry chooser's own
          shape (Dan, 2026-09-07: *"Can the choice of difficulty be in four
          horizontal buttons"*). A tier's colour is its identity either way:
          the border and text when it stands, the whole cell when it is
          chosen. */}
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/60 p-2">
        <p className="fluo-serif text-lg font-black leading-tight text-[color:var(--fluo-ink)]">
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
                className={`flex flex-col items-center gap-0 rounded-lg border-2 px-1 py-1.5 transition ${
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

      {/* THE PICKER, IN TWO HALVES (Dan's 19 Sep mockup): PICK AS YOU WISH on
          the left — the formula SUJET + VERBE + OBJET, plus the POLARITÉ
          toggle — and PICK FOR ME on the right, over Random, the main
          button. A divider between them; one box, two ways in.

          THE OBJET FOLLOWS THE VERB (Dan: "the objet is tied to the verb
          though, not any objet can go with any verb"): its options come from
          the generator's pairing, and changing the verb drops an object that
          no longer fits. */}
      {axes.length > 0 && (
        <div className="flex items-stretch gap-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/60 p-2">
          {/* LEFT · PICK AS YOU WISH */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div aria-hidden className="fluo-cue flex flex-col items-center">
              <div className="fluo-nextq">PICK AS YOU WISH</div>
              <div className="fluo-nextq-arrows"><span>↓</span><span>↓</span><span>↓</span></div>
            </div>
            {/* THE FORMULA ROW — Sujet + Verbe + Objet, "+" between */}
            <div className="flex flex-wrap items-end justify-center gap-1">
              {axes.filter((ax) => ax.key !== "polarity").map((ax, i, all) => (
                <div key={ax.key} className="flex items-end gap-1">
                  {i > 0 && <span aria-hidden className="pb-1.5 text-base font-black text-[color:var(--cahier-ink)]/50">+</span>}
                  <label className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--cahier-ink)]/60">{ax.label}</span>
                    <select
                      value={pinned[ax.key] ?? ""}
                      onChange={(e) => {
                        const next = { ...pinned, [ax.key]: e.target.value };
                        // THE CASCADE: a new verb can orphan the pinned objet
                        // — drop it rather than offer a pair the generator
                        // would refuse.
                        if (ax.key === "verb" && next.object && !optionsOf(axes.find((a) => a.key === "object")!, next).some((o) => o.value === next.object)) {
                          delete next.object;
                        }
                        setPinned(next);
                        generate(next);
                      }}
                      className="rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-1.5 py-1 text-sm font-bold text-[color:var(--cahier-ink)]"
                      lang="fr"
                    >
                      <option value="">— any —</option>
                      {optionsOf(ax, pinned).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
            {/* POLARITÉ — a split pill, not a dropdown. Tapping the selected
                side unpins it (back to the roll); −ve answers "négatif",
                +ve "affirmatif", straight into `pinned.polarity`. */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--cahier-ink)]/60">Polarité</span>
              <div className="flex overflow-hidden rounded-lg border-2 border-[color:var(--cahier-ink)] text-xs font-black">
                {([["neg", "−ve."], ["aff", "+ve."]] as const).map(([val, label]) => {
                  const on = pinned.polarity === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        const next = { ...pinned };
                        if (on) delete next.polarity; else next.polarity = val;
                        setPinned(next);
                        generate(next);
                      }}
                      className={`px-2.5 py-1 leading-none transition ${
                        on
                          ? val === "neg"
                            ? "bg-[color:var(--drill-bad)] text-white"
                            : "bg-[color:var(--tier-good)] text-white"
                          : "bg-white text-[color:var(--cahier-ink)]/60 hover:bg-[color:var(--cahier-rule)]/30"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* THE DIVIDER */}
          <div aria-hidden className="w-0 self-stretch border-l-2 border-[color:var(--cahier-rule)]" />

          {/* RIGHT · PICK FOR ME — Random, the main button (Dan: "the main
              button to push is always the RANDOM"). */}
          <div className="flex flex-col items-center justify-center gap-1">
            <div aria-hidden className="fluo-cue flex flex-col items-center">
              <div className="fluo-nextq">PICK FOR ME</div>
              <div className="fluo-nextq-arrows"><span>↓</span><span>↓</span><span>↓</span></div>
            </div>
            <button
              type="button"
              onClick={handleRandom}
              className="cahier-btn cahier-btn-primary cahier-btn--compact"
              title="Pick random values for every dropdown"
            >
              🎲🎲 Random
            </button>
          </div>
        </div>
      )}

      {/* LISTEN — standalone, centred between the picker and the answer
          (Dan's mockup): one pill, its own line. */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handlePronounce}
          className="cahier-btn cahier-btn--compact"
          title="Hear the correct sentence"
        >
          🔊 Listen
        </button>
      </div>

      {/* Slot-cascade prompt visual: the prompt meta + the bare noun (the
          thing the rest of the sentence is built around) + the English
          reference. AT BONUS NONE OF THE FRENCH SHOWS — the meta prints the
          conjugated verb and the noun, which are the whole answer there; the
          English sentence becomes the prompt ("Translate: …", Dan
          2026-09-18) and everything the learner must produce is withdrawn. */}
      {difficulty !== 4 && question.meta && (
        <p className="text-center text-xs uppercase leading-tight tracking-wider text-[color:var(--cahier-ink)]/60">
          {question.meta}
        </p>
      )}
      {difficulty !== 4 && question.big && (
        <p
          className="card-hand text-center text-xl font-black leading-snug text-[color:var(--cahier-ink)]"
          lang={question.bigLang ?? "fr"}
        >
          {question.big}
        </p>
      )}
      {question.en && (
        <p
          className={
            difficulty === 4
              ? "card-hand text-center text-xl font-black leading-snug text-[color:var(--cahier-ink)]"
              : "text-center text-sm italic leading-tight text-[color:var(--cahier-ink)]/70"
          }
          lang="en"
        >
          {difficulty === 4 ? `Translate: ${question.en}` : question.en}
        </p>
      )}

      {/* At ★ the learner picks the ONE gap this question is about (Dan,
          2026-09-18) — content-sized chips, centred, never full width. Each
          chip wears its slot's colour (Dan's mockup, 2026-09-19): VERBE in
          the practice blue, dashed; ARTICLE in the highlighter orange on a
          cream wash. */}
      {difficulty === 1 && slots.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="text-[color:var(--cahier-ink)]/70">Focus on:</span>
          {(["verb", "article"] as const).map((g) => {
            const on = facileGap === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => chooseGap(g)}
                className={
                  on
                    ? "rounded-lg border-2 border-[color:var(--cahier-ink)] bg-[color:var(--cahier-rule)]/40 px-2.5 py-0.5 uppercase tracking-wide"
                    : g === "verb"
                      ? "rounded-lg border-2 border-dashed border-[color:var(--fam-practice-ink)] bg-white px-2.5 py-0.5 uppercase tracking-wide text-[color:var(--fam-practice-ink)]"
                      : "rounded-lg border-2 border-[color:var(--fam-tools)] bg-[color:var(--cahier-hl)]/30 px-2.5 py-0.5 uppercase tracking-wide text-[color:var(--fam-tools)]"
                }
              >
                {g === "verb" ? "Verbe" : "Article"}
              </button>
            );
          })}
        </div>
      )}

      {/* THE ANSWER SECTION IS THE HERO (Dan, 2026-09-18: *"the most important
          section — where the answer is requested"*). Everything else on this
          tab prepares this box; the hierarchy rule says the most important
          thing is bigger and heavier, so it takes the strongest frame on the
          page (the house ink, full white paper) and the largest French on the
          tab, with a small caps label naming it — the one label that earns
          its place by naming where the learner acts. */}
      <div className="flex min-h-[6.5rem] flex-col justify-center rounded-xl border-2 border-[color:var(--cahier-ink)] bg-white p-3 shadow-sm">
        <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-[color:var(--cahier-ink)]/50">
          Your answer
        </p>
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
          /* POINT FORM, NOT PROSE (Dan, 2026-09-18: "all explanatory texts
             should be in point form rather than in paragraph prose"). */
          <ul className="list-disc space-y-1 pl-5 text-left text-sm text-[color:var(--cahier-ink)]/70">
            <li>This lesson has no slots to pick from.</li>
            <li>Choose ★★★ and type the whole sentence.</li>
          </ul>
        ) : (
          <p className="card-hand text-center text-xl leading-relaxed text-[color:var(--cahier-ink)]" lang="fr">
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
              // Blanked slot — render a dropdown inline, no wider than its
              // longest word (Dan, 2026-09-18), but at the HERO size: this
              // is where the answer is given. When ★ focuses the ARTICLE,
              // the article blank wears the highlighter orange (Dan's
              // mockup) — the chip and the gap it chooses are one colour.
              const idx = pickIndex(s.key)!;
              const value = picks[idx] ?? "";
              const hl = s.key === "article" && difficulty === 1 && facileGap === "article";
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
                  className={`mx-1 inline-block min-w-[2.5em] rounded-md border-2 border-dashed px-2 py-0.5 align-baseline text-lg font-bold ${
                    hl
                      ? "border-[color:var(--fam-tools)] text-[color:var(--fam-tools)]"
                      : "border-[color:var(--cahier-ink)]"
                  } bg-white`}
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
          primary. The three sit on ONE line, compact — they are the same
          step's controls and must not spill (Dan, 2026-09-18). */}
      <div className="flex flex-nowrap justify-center gap-2">
        <button
          type="button"
          onClick={check}
          className="cahier-btn cahier-btn--compact"
        >
          ✅ CHECK
        </button>
        <button type="button" onClick={handleRedo} className="cahier-btn cahier-btn--compact">
          ✏️ REDO
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={entries.length === 0}
          className="cahier-btn cahier-btn--compact disabled:opacity-40"
        >
          🏁 END
        </button>
      </div>

      {/* Feedback */}
      {result && (
        <div
          className={`rounded-lg border-2 p-2 text-center text-sm leading-tight ${
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
    </div>
  );
}
