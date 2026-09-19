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

// The app's own scale, in Dan's stated order (2026-09-19: "Green, Yellow,
// Orange, Red"): Facile green, Moyen yellow, Difficile ORANGE, Bonus RED.
// The same colour fills the chosen banner cell AND the Your Answer box's
// background — the box tells you the level you are in at a glance.
const DIFF_HUE: Record<Difficulty, string> = {
  1: "var(--tier-good)",
  2: "var(--tier-medium)",
  3: "var(--dopa-reward)",
  4: "var(--tier-weak)",
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

  /** ONLY THE BUILT FRAMES GET DROPDOWNS (Dan, 2026-09-19: "we have not
   *  finished building all the various frames — there is nothing to do in
   *  the other cases"). The dropdown Exercise exists for subject·verb·ARTICLE·noun
   *  (aimer, faire) and subject·verb·PREPOSITION·place (aller). Any other
   *  slot shape renders the free-text fallback — its cue, its English line,
   *  an input at every tier — instead of a sentence with nothing to do or
   *  dropdowns that blank the wrong thing. The guard is the SET of blankable
   *  keys: exactly {verb, article} or exactly {verb, prep}. */
  const frameBuilt = useMemo(() => {
    const set = new Set(blankableKeys);
    if (set.size === 0) return false;
    return (
      (set.has("verb") && set.has("article") && set.size === 2) ||
      (set.has("verb") && set.has("prep") && set.size === 2)
    );
  }, [blankableKeys]);

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
  const blankedKeys = !frameBuilt
    ? []
    : difficulty === 1 ? [facileGap] : blankableKeys.slice(0, blankCount);

  // Map a slot's key to a pick index (the n-th blanked slot).
  const pickIndex = (key: string | undefined) =>
    key ? blankedKeys.indexOf(key) : -1;

  const buildUserSentence = (): string => {
    if (difficulty === 3) return freeText.trim();
    if (difficulty === 4) return freeText.trim();
    if (!frameBuilt) return freeText.trim();
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
        {/* THE COUNTED GRID (Dan, 2026-09-19: *"it does not have to be 4
            columns, it can be as many columns as the screen width can fit,
            and the screen size should naturally decide how many columns"*).
            `auto-fit` with a content-derived floor: a phone's column (~270px)
            fits the four tiers side by side at the size they already wore; a
            screen too narrow for four WRAPS rather than crushes; a wider
            screen grows the CELLS, never stretches four across the void. The
            screen decides — the counted form the no-pixel ruling set. */}
        <div className="grid w-full max-w-sm grid-cols-[repeat(auto-fit,minmax(min(100%,3.8rem),1fr))] gap-1.5">
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

      {/* THE PICKER, TWO OUTLINED BOXES (Dan, 2026-09-19: "the three boxes
          must be clearly outlined: Your Answer below - Your pick above left -
          Random pick above right"): Your Pick on the left — the formula
          SUJET + VERBE + OBJET plus the POLARITÉ toggle — and Random Pick on
          the right, each in its own ink-outlined box like Your Answer's.

          THE OBJET FOLLOWS THE VERB (Dan: "the objet is tied to the verb
          though, not any objet can go with any verb"): its options come from
          the generator's pairing, and changing the verb drops an object that
          no longer fits. */}
      {axes.length > 0 && (
        <div className="flex items-stretch gap-2">
          {/* LEFT BOX · YOUR PICK — HIDDEN AT BONUS (Dan, 2026-09-19: "for the
              Bonus round, to make it really challenging, we shall make the
              Your Pick section invisible — Only the Random pick button
              should remain visible"). Bonus is dealt what Random gives,
              unaimed. */}
          {difficulty !== 4 && (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl border-2 border-[color:var(--cahier-ink)] bg-white p-2">
            <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <div aria-hidden className="fluo-cue flex flex-col items-center">
                <div className="fluo-nextq">Your Pick</div>
                <div className="fluo-nextq-arrows"><span>↓</span><span>↓</span><span>↓</span></div>
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
          </div>
          )}

          {/* RIGHT BOX · RANDOM PICK — Random, the main button (Dan: "the
              main button to push is always the RANDOM"). */}
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-[color:var(--cahier-ink)] bg-white p-2">
            <div aria-hidden className="fluo-cue flex flex-col items-center">
              <div className="fluo-nextq">Random Pick</div>
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

      {/* NO META, NO BARE NOUN (Dan, 2026-09-19: "delete those two redundant
          lines") — the verb-gloss meta and the lone noun both duplicated what
          the gapped sentence below already shows, and the meta printed the
          conjugated verb the ★★ blank was about to ask for. The French
          gapped sentence is the prompt now, with the English translation
          directly beneath it ("english translation below the french gapped
          sentence") — inside the answer box, one place, one reading order. */}

      {/* At ★ the learner picks the ONE gap this question is about (Dan,
          2026-09-18) — content-sized chips, centred, never full width. Each
          chip wears its slot's colour (Dan's mockup, 2026-09-19): VERBE in
          the practice blue, dashed; ARTICLE in the highlighter orange on a
          cream wash. */}
      {difficulty === 1 && frameBuilt && (
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
      {/* THE ANSWER BOX (Dan, 2026-09-18: "the most important section — where
          the answer is requested"; 2026-09-19: one of the THREE clearly
          outlined boxes, its header in the SAME HAND FONT as the two above
          ("Use the same font for Your Answer, as copied from the above
          two"), and its BACKGROUND THE DIFFICULTY'S OWN COLOUR — "Green,
          Yellow, Orange, Red" — so the box itself says the level you are
          in. Content in white on the colour; the blanks stay white pills. */}
      <div
        className="flex h-[13rem] flex-col justify-center overflow-hidden rounded-xl border-2 border-[color:var(--cahier-ink)] p-3 text-white shadow-sm"
        style={{ background: DIFF_HUE[difficulty] }}
      >
        <p
          className="mb-1.5 text-center text-lg font-black leading-tight tracking-wide"
          style={{ fontFamily: "var(--font-fluohand-stack)" }}
        >
          Your Answer
        </p>
        {/* AT BONUS the English sentence is the prompt — "Translate: …" rides
            the top of this box (Dan, 2026-09-18) because nothing else may
            show. At every other tier the FRENCH gapped sentence leads and the
            English translation sits directly beneath it (Dan, 2026-09-19). */}
        {difficulty === 4 && question.en && (
          <p className="mb-2 card-hand text-center text-xl font-black leading-snug text-white" lang="en">
            Translate: {question.en}
          </p>
        )}
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
        ) : !frameBuilt ? (
          /* A LESSON WITHOUT SLOTS (the generator has no `slots`) still gets
             the whole Exercise: its cue and English line lead, the input
             stands at EVERY tier, and CHECK grades against the generator's
             own `correct`. No bullets pointing elsewhere (Dan, 2026-09-19:
             "do the same for all the other MneMemos"). */
          <>
            {question.meta && (
              <p className="text-center text-xs uppercase leading-tight tracking-wider text-white/75">
                {question.meta}
              </p>
            )}
            {question.en && (
              <p className="mt-1 text-center text-sm italic leading-tight text-white/85" lang="en">
                {question.en}
              </p>
            )}
            <input
              type="text"
              lang="fr"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") check();
              }}
              placeholder="Écrivez la phrase complète…"
              className="mt-2 w-full rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-center text-lg font-bold text-[color:var(--cahier-ink)] focus:border-[color:var(--cahier-ink)] focus:outline-none"
              autoCapitalize="sentences"
              spellCheck={false}
            />
          </>
        ) : (
          <p className="card-hand text-center text-xl leading-relaxed text-white" lang="fr">
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
                      : "border-[color:var(--cahier-ink)] text-[color:var(--cahier-ink)]"
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
        {/* THE ENGLISH TRANSLATION, directly beneath the French gapped
            sentence (Dan, 2026-09-19) — one reading order: French target
            first, reference under it, both inside the answer box. Slotless
            lessons carry their English inside the fallback above. */}
        {difficulty !== 4 && frameBuilt && question.en && (
          <p className="mt-2 text-center text-sm italic leading-tight text-white/80" lang="en">
            {question.en}
          </p>
        )}
      </div>

      {/* THE ACTION ROW — Listen in the SAME ROW as the three (Dan,
          2026-09-19: "the Listen button should be in the same row as the
          three below it"), then CHECK · REDO · END (English chrome, Dan
          2026-09-18). Four compact controls, one line, never spilling;
          Random remains the tab's one primary. */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={handlePronounce}
          className="cahier-btn cahier-btn--compact"
          title="Hear the correct sentence"
        >
          🔊 Listen
        </button>
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
