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
  /** HTML explanation shown after the learner submits. Inline <strong>/<em> allowed. */
  why?: string;
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
