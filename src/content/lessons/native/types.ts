import type { ReactNode } from "react";
import type { Slot } from "./cloze";

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
  /** The cloze tier: a frame with the answer typed into it.
   *  ONE blank, chosen by the generator — see `slots` for why that is not
   *  enough, and `medFrom` in cloze.ts for how a slotted generator keeps
   *  producing this without hand-writing it. */
  med: { before: string; choices: string[]; correct: string; after: string };
  /**
   * The sentence as its parts, so a LEVEL can decide how much to withdraw
   * rather than the generator deciding once (2026-08-31).
   *
   * `med` holds one blank, so Dan's ★★ — "subject + bare noun shown, pick the
   * verb AND the article" — could not be expressed, and neither could the
   * vocabulary ladder's ★★★, "fill in the article and the noun". Optional
   * because 47 generators predate it and must keep working untouched; where it
   * is present, `med` should be derived from it with `medFrom` so the two can
   * never drift apart.
   */
  slots?: Slot[];
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

/**
 * « Le concept » — the tab that says WHY, before Les formes says HOW.
 *
 * Dan, 2026-08-30, sending three of his original course lessons: "this
 * framework is how it should be in EVERY SIO". His six tabs are Le parcours ·
 * Le concept · Les formes · L'exercice · Le bonus · Le lexique. Three of them
 * were already here under other names — the Mémo IS Les formes, `dice` IS
 * L'exercice, `bonus` IS Le bonus. This is the first of the three that were
 * not.
 *
 * THE SHAPE IS HIS, taken from the concept tabs of his own lessons rather
 * than invented: a stated contrast between English logic and French logic,
 * one question, its answer, and the apparatus that makes the answer stick.
 * The possessifs lesson is the clearest specimen — "In English, his/her
 * depends on the owner's gender. In French, son/sa/ses depends on the noun's
 * gender and number. This is the key insight."
 *
 * WHAT IS REQUIRED, AND WHY ONLY THIS MUCH. Every concept must make a claim
 * and answer a question — without those it is not a concept, it is a second
 * Mémo. The apparatus (pitfall table, flowchart, mini-check) varies across
 * his three originals, so it is optional here rather than forced onto lessons
 * whose grammar does not need it.
 *
 * A NOTE FOR WHOEVER DRAFTS THESE. `contrast` and `remember` are the
 * pedagogical claim — the two fields where a wrong sentence teaches a wrong
 * rule. They are drafted for Dan, never shipped past him. Fill them from the
 * lesson's existing Mémo and invent no grammar that is not already there.
 */
export type LessonConcept = {
  /** The contrast as a heading — "Why possessives agree with the noun, not
   *  the owner". States the claim; does not tease it. */
  subtitle: string;
  /** English logic against French logic, in about two sentences. THE claim. */
  contrast: ReactNode;
  /** The one question the tab exists to answer. */
  question: ReactNode;
  /** One sentence, then the worked instance. */
  answer: ReactNode;
  /** ⚠ The pitfall: what English logic predicts, against what French does. */
  pitfall?: { label: ReactNode; wrong: ReactNode; right: ReactNode }[];
  /** The branching rule as a learner runs it. `depth` indents the line. */
  flow?: { depth: number; text: string }[];
  /** ✅ Mini-check — questions whose answers stay hidden until asked for. */
  check?: { q: ReactNode; a: ReactNode }[];
  /** The whole system, compressed. */
  inShort?: ReactNode;
  /** "If you remember only one thing…" — the sentence that survives the week. */
  remember: ReactNode;
};

/** A lesson converted from iframed drchan HTML to real in-app content:
 *  Le concept (why) + Les formes (the Mémo) + L'exercice (the generator) +
 *  Le bonus. `concept` is optional while the 47 lessons are drafted — a
 *  lesson without one renders the tab as honestly empty rather than absent,
 *  so the gap is visible instead of silent. */
export type NativeLesson = {
  slug: string;
  memo: ReactNode;
  dice: DiceConfig;
  bonus: { en: string; fr: string; alt?: string[] }[];
  concept?: LessonConcept;
};
