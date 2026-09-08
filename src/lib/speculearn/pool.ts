/**
 * ONE SPECULEARN PER GOAL — the three sources, merged into one pool.
 *
 * Dan, 2026-09-07, over a screenshot of SIO-041 with two 💡 on it:
 * *"it does not matter if they are different versions, but the combined pool
 * between them consists only of MCQ, so they CAN be and MUST NOW BE MERGED AS
 * ONE!"*
 *
 * WHY THERE WERE TWO. Three engines grew separately and each kept its own
 * door:
 *
 *     authored pre-tests   35 goals   a gap in a French sentence, with audio
 *     unit-0 banks         10 goals   a prompt and four options
 *     generated SpecuLearn  9 goals   a picture or a word, options from the deck
 *
 * Nine goals have BOTH an authored pre-test and a generated run — colors,
 * consignes, countries, languages, objets-articles, lieux, transport, aliments
 * and commerces — so those nine showed the learner two identical-looking
 * lightbulbs. That duplication was always there; it only became VISIBLE on
 * 6 Sep when the pre-test's 🧪 and its "Pre-Test" label were unified with
 * SpecuLearn's, which is what made one thing with two front doors look like
 * one thing with two front doors.
 *
 * WHY THEY CAN MERGE AT ALL, which is Dan's point and not an assumption: the
 * repo already carries his older rule, quoted in unit0-questions.ts —
 *
 *     "pre-tests should only involve MCQ, if it is not an MCQ then it is a
 *      post-lesson activity"
 *
 * — and `verify40` holds it across every pre-test surface. Three sources that
 * are each guaranteed MCQ have a common shape by construction. This file is
 * that shape.
 *
 * WHAT IS DELIBERATELY NOT HERE. The generated engine's `say-t` / `say-s`
 * directions are speech, not multiple choice, so they are not pool items —
 * saying a word out loud is WorDrill's job and lives behind its own door. Only
 * the `wi` / `iw` directions (word→picture, picture→word) become MCQs.
 */

import { getPretestForSio } from "@/content/pretests";
import { UNIT0_QUESTIONS, type Unit0Question } from "@/content/sios/unit0-questions";
import type { PretestItem } from "@/lib/pretests/schema";

/** Where one pooled question came from — kept so the runner can render it and
 *  the ledger can still tell an authored miss from a generated one. */
export type PoolSource = "authored" | "unit0" | "deck";

/**
 * One MULTIPLE-CHOICE question, whatever produced it.
 *
 * The three sources differ in what they show ABOVE the options — a sentence
 * with a gap, a bare prompt, a picture — and agree on everything below it.
 * So the prompt is a small union and the answer side is one shape.
 */
export type PoolItem = {
  /** Stable within a goal's pool. Prefixed by source so two engines cannot
   *  collide on a bare index, which is how a resume lands on the wrong item. */
  id: string;
  source: PoolSource;
  /** French sentence split around the gap. Absent on a picture/word prompt. */
  sentenceBefore?: string;
  sentenceAfter?: string;
  /** Shown instead of a sentence: the bare prompt, or the instruction over a
   *  picture. */
  prompt?: string;
  /** A picture cue. `img` is a deck photo path; `emoji` its fallback. */
  img?: string;
  emoji?: string;
  /** English gloss. Shown after the attempt unless `transFirst`. */
  en?: string;
  transFirst?: boolean;
  /** The text that is correct. Always one of `options`. */
  answer: string;
  /** Four choices, unshuffled — the runner shuffles once per mount so going
   *  back to an answered question shows it as it was answered. */
  options: string[];
  /** Why a particular wrong choice is wrong, keyed by that choice. */
  whyWrong?: Record<string, string>;
  /** What to speak: the full sentence for an authored item, the word for a
   *  deck one. Absent = nothing to speak. */
  speak?: string;
  /**
   * The ORIGINAL authored item, carried through untouched.
   *
   * `judgePretestAnswer` writes the gap report and the usage ledger, and it is
   * keyed on the authored item — so an authored question must still reach it
   * in the shape it was written in. A generated one has no ledger to write:
   * it was never part of the authored pre-test the teacher's dashboard reports
   * on, and inventing an entry for it would put questions in that report that
   * no pre-test contains.
   */
  authored?: PretestItem;
  /**
   * The ORIGINAL unit-0 question, carried through for the same reason.
   *
   * Dan, 2026-08-27, of a pre-lesson guess: *"remember it, but don't score
   * it"* — a Unit-0 miss goes into the pre-test record so a teacher can see
   * what the class did not know, and never into the score. The page that used
   * to do that writing (`/pretests/unit0/<stop>`) has been a forward to this
   * run since 2026-09-08, so the runner has to do it, and it needs the
   * question's own id and option set to do it the same way.
   */
  unit0?: Unit0Question;
};

/** An authored pre-test item is already this shape bar the naming. */
function fromAuthored(it: PretestItem, i: number): PoolItem {
  return {
    id: `a${i}-${it.id}`,
    source: "authored",
    sentenceBefore: it.sentenceBefore,
    sentenceAfter: it.sentenceAfter,
    prompt: it.contextLabel,
    emoji: it.icon,
    en: it.sentenceTrans,
    transFirst: it.transFirst,
    answer: it.answer,
    options: [it.answer, ...it.distractors],
    whyWrong: it.whyWrong,
    speak: it.fullSentence ?? `${it.sentenceBefore}${it.answer}${it.sentenceAfter}`,
    authored: it,
  };
}

/**
 * A unit-0 question. `multi` ones are dropped rather than converted: they are
 * graded on the exact SET of picks, which is a different interaction from
 * "choose one of four" and would need a second answer model in the runner.
 * They keep working where they live; they are simply not pooled.
 */
function fromUnit0(q: Unit0Question, i: number): PoolItem | null {
  if (q.multi) return null;
  const right = q.options.find((o) => o.ok);
  if (!right) return null;
  return {
    id: `u${i}-${(q.title ?? q.stem ?? "q").slice(0, 24)}`,
    source: "unit0",
    prompt: q.title,
    emoji: q.emoji,
    en: q.en,
    answer: right.v,
    options: q.options.map((o) => o.v),
    whyWrong: Object.fromEntries(
      q.options.filter((o) => !o.ok && o.why).map((o) => [o.v, o.why!]),
    ),
    speak: q.tts ?? right.v,
    unit0: q,
    ...(q.stem ? sentenceFromStem(q.stem) : {}),
  };
}

/**
 * A unit-0 `stem` is a gapped frame written with underscores — "Je ___ Dan."
 * Splitting it into before/after lets a stem question render exactly like an
 * authored one rather than as a prompt with the gap spelled out in text.
 */
function sentenceFromStem(stem: string): Pick<PoolItem, "sentenceBefore" | "sentenceAfter"> {
  const m = stem.match(/^([\s\S]*?)_{2,}([\s\S]*)$/);
  return m ? { sentenceBefore: m[1], sentenceAfter: m[2] } : {};
}

/**
 * The generated side. A deck word becomes a picture→word question: the cue is
 * the photo (or emoji), the options are four words from the same deck.
 *
 * Only ONE direction is pooled, not both. The generated engine also runs
 * word→picture, where the options are pictures rather than text — a different
 * card, and pooling both would ask the same item twice in one run.
 */
export type DeckWord = { w: string; img?: string; emoji?: string };

function fromDeck(word: DeckWord, all: DeckWord[], i: number): PoolItem | null {
  const visual = word.img ?? word.emoji;
  if (!visual) return null;
  // Distractors must not repeat the cue: two options showing the same picture
  // is two identical buttons, one marked wrong (Dan, 5 Sep, on commerces).
  const seen = new Set([word.img ?? word.emoji ?? word.w]);
  const others: string[] = [];
  for (const x of all) {
    if (x.w === word.w) continue;
    const key = x.img ?? x.emoji ?? x.w;
    if (seen.has(key)) continue;
    seen.add(key);
    others.push(x.w);
    if (others.length === 3) break;
  }
  if (others.length < 3) return null;
  return {
    id: `d${i}-${word.w}`,
    source: "deck",
    prompt: "Pick the right word.",
    img: word.img,
    emoji: word.emoji,
    answer: word.w,
    options: [word.w, ...others],
    speak: word.w,
  };
}

/**
 * Every MCQ this goal can ask, in one list.
 *
 * ORDER IS SOURCE ORDER, not shuffled here. The authored questions are written
 * to the goal and generally harder; putting them first means a learner meets
 * the sentence work while they are freshest, and the deck's vocabulary round
 * carries on from there. The runner shuffles nothing — a pre-test is a cold
 * guess, and a stable order is what makes a resume land where it left off.
 */
export function speculearnPool(sioId: string, deckWords: DeckWord[] = []): PoolItem[] {
  const out: PoolItem[] = [];

  const authored = getPretestForSio(sioId);
  if (authored) authored.items.forEach((it, i) => out.push(fromAuthored(it, i)));

  (UNIT0_QUESTIONS[sioId] ?? []).forEach((q, i) => {
    const p = fromUnit0(q, i);
    if (p) out.push(p);
  });

  deckWords.forEach((w, i) => {
    const p = fromDeck(w, deckWords, i);
    if (p) out.push(p);
  });

  return out;
}

/** Does this goal have any SpecuLearn at all? One door, one answer. */
export function hasSpeculearn(sioId: string, deckWords: DeckWord[] = []): boolean {
  return speculearnPool(sioId, deckWords).length > 0;
}
