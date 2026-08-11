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

export type DiceConfig = {
  instruction: string;
  newQuestion: () => DiceQuestion;
};

/** A lesson converted from iframed drchan HTML to real in-app content:
 *  Mémo (the grammar reference) + generated questions + EN→FR bonus. */
export type NativeLesson = {
  slug: string;
  memo: ReactNode;
  dice: DiceConfig;
  bonus: { en: string; fr: string; alt?: string[] }[];
};
