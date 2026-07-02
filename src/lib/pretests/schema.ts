/**
 * Pretest schema (authored MCQs migrated from LAF1201).
 *
 * Each pretest is a sequence of hand-authored gapfill-with-MCQ items:
 *   "Il <blank> beau aujourd'hui."  → ["fait", "est", "a", "y a"]  → correct: "fait"
 * with a why-explanation revealed on submit. Distractors are intentionally tricky
 * — these test GRAMMAR / USAGE, not vocab recall.
 *
 * One pretest belongs to one Lesson (unit + lessonNo + lessonSlug). The id encodes
 * those three: e.g. "u3-l1-weather".
 */

export type PretestItem = {
  /** Stable id within the pretest, used for resume / per-item analytics. */
  id: string;
  /** Scene description above the stimulus, e.g. "[Checking forecast] A sunny morning in Paris". */
  contextLabel?: string;
  /** Decorative emoji shown above the sentence. */
  icon?: string;
  /** Grammar hint badge, e.g. "il fait + adjective". */
  meta?: string;
  /** Sentence before the blank (verbatim, including trailing space if any). */
  sentenceBefore: string;
  /** Sentence after the blank. */
  sentenceAfter: string;
  /** The correct text that fills the blank. */
  answer: string;
  /** Wrong choices. Combined with `answer` and shuffled at runtime. */
  distractors: string[];
  /** Full assembled sentence — used in the recap and feedback. */
  fullSentence?: string;
  /** English translation of the full sentence. */
  sentenceTrans?: string;
  /**
   * Show the translation BEFORE the attempt. Only for questions where several
   * options are grammatical and the English meaning is what disambiguates
   * (e.g. modals: vais/dois/peux all fit — "I'm going to…" decides). Default
   * (absent/false): the translation appears only after the question has been
   * attempted — per Dan, showing it first leaks single-answer questions.
   */
  transFirst?: boolean;
  /** DEPRECATED general explanation blob — kept for reference, no longer displayed. */
  why?: string;
  /**
   * Why each WRONG choice is wrong, keyed by the distractor text. The WHY
   * button appears only when the learner picked a wrong option that has an
   * entry here, and shows only that entry (Dan, 2026-07-02: the Why must
   * only explain why the chosen answer is wrong).
   */
  whyWrong?: Record<string, string>;
};

export type RecapRow = {
  form: string;
  example: string;
  note?: string;
};

export type Pretest = {
  /** "u3-l1-weather". Encodes unit, lessonNo, lessonSlug. */
  id: string;
  unit: number;
  lessonNo: number;
  lessonSlug: string;
  title: string;
  subtitle?: string;
  /** One-line teaser shown on the home page. */
  blurb?: string;
  items: PretestItem[];
  recap?: RecapRow[];
};
