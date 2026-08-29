import type { ReactNode } from "react";

/**
 * One generated question (authored per-lesson in the `dice` config). These
 * types lived in DiceTrainer.tsx until patch 22 retired that widget — the
 * lesson pager now consumes the same configs headlessly, so the contract
 * lives with the content that authors it.
 */
export type DiceQuestion = {
  /** Small context line above the prompt ("Quelle heure est-il ?"). */
  meta: string;
  /** The big prompt itself (a clock, a cue phrase…). */
  big: string;
  /** Muted English gloss under the prompt. */
  en?: string;
  /** The full correct sentence — graded against, and spoken. */
  correct: string;
  /** Extra accepted phrasings when the learner TYPES. */
  alternates?: string[];
  /** Full-sentence options for the MCQ tier (must include `correct`). */
  easyOptions: string[];
  /** The cloze tier: a frame with the answer typed into it. */
  med: { before: string; choices: string[]; correct: string; after: string };
};

/**
 * One steerable axis of a lesson's generator — the dropdowns Dan's original
 * course site had above the dice (2026-08-27: "both — dropdowns and dice").
 *
 * The axes are per-lesson because they ARE the grammar: conjugaison-u1 varies
 * subject x verb x polarity, meteo varies something else entirely, and a
 * single fixed "subject/topic/verb" triple would be wrong for most lessons.
 * So a lesson DECLARES its own axes, and `newQuestion` receives whatever the
 * learner pinned.
 */
export type DiceAxis = {
  /** Key passed back in the `pinned` record. */
  key: string;
  /** Dropdown label ("Sujet", "Verbe"). */
  label: string;
  /** `value` is what newQuestion receives; `label` is what the learner reads. */
  options: { value: string; label: string }[];
};

export type DiceConfig = {
  instruction: string;
  /**
   * `pinned` holds the axis values the learner chose; an axis absent from it
   * (or set to "") is free and the generator picks at random, exactly as
   * before. Generators that ignore the argument keep working unchanged —
   * which is why this is optional rather than a rewrite of all 34 lessons.
   */
  newQuestion: (pinned?: Record<string, string>) => DiceQuestion;
  /** Declared only by lessons whose axes are real; the pager shows the
   *  dropdown row and the 🎲 button only when this is present. */
  axes?: DiceAxis[];
};

/** A lesson converted from iframed drchan HTML to real in-app content:
 *  Mémo (the grammar reference) + generated questions + EN→FR bonus. */
export type NativeLesson = {
  slug: string;
  memo: ReactNode;
  dice: DiceConfig;
  bonus: { en: string; fr: string; alt?: string[] }[];
};
