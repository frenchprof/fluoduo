"use client";

/**
 * buildCards() — the lesson pager's deck of cards (patch 22).
 *
 * The audit's prescription (UI_AUDIT.md, "THE LESSON"): min(3, memoCards) + 12
 * cards. Rule cards come from splitting the Mémo at its top-level children;
 * exercises are a FIXED RAMP — difficulty stops being a button and becomes
 * the sequence itself:
 *
 *   cards 1-4   MCQ        recognise the form   (evidence: recognition)
 *   cards 5-8   gap        produce it in a frame (constrained)
 *   cards 9-11  build      assemble the full sentence from word tiles
 *   card  12    translate  produce the sentence from English alone
 *
 * Two question supplies exist and both are used when both exist, alternating:
 * the deck's own items (finite, SRS-keyed by real item ids) and the native
 * lesson's generated questions + bonus bank (authored for exactly this
 * grammar point). Decks whose items carry no gap skip the gap tier's frame —
 * those positions fall back to MCQ (there is no French-only cue to blank).
 *
 * Everything here runs in the pager's MOUNT EFFECT, never during render —
 * same SSR-hydration rule as every drill (shuffle in effects only).
 */
import { type ReactNode } from "react";
import type { Collection, Item } from "@/lib/collections/schema";
import type { DiceQuestion, NativeLesson } from "@/content/lessons/native/types";
import { gappedItems } from "@/lib/collections/gramMarathonReady";
import { gapSentence, gapSentenceEn } from "@/lib/collections/gapSentence";
import { splitGap } from "@/lib/practice/cloze";
import { shuffle } from "@/lib/shuffle";

/** A Mémo is one card, so a lesson carries exactly one rule card before the
 *  ramp. Kept as a named constant because the run length is rule cards + 12
 *  and reading `1` bare at the call site says nothing. See splitMemo. */
export const RULE_CARDS_MAX = 1;

export type ExerciseKind = "mcq" | "gap" | "build" | "translate";

/** The 12-card ramp — 4 MCQ, 4 gap, 3 build, 1 translate. */
export const RAMP: ExerciseKind[] = [
  "mcq", "mcq", "mcq", "mcq",
  "gap", "gap", "gap", "gap",
  "build", "build", "build",
  "translate",
];

/* NO ENTRY DIE (Dan, 2026-08-25: "drop the shortcuts, learning should not
 * allow that"). DIE_SIDES / ROLL_ENTRY / rollLabel are gone. A d12 used to
 * open the ramp and its face was a START INDEX — the pager did
 * `queue.slice(entry)`, so a 1 walked all twelve cards and a 12 left only the
 * translation. That made the die a run-length dial, and since the ramp runs
 * easy → hard a high roll bought less work at the hard end. Every learner now
 * walks the whole ramp. (The die Dan means — a different variation of the
 * same structure — is DiceConfig.newQuestion(), called per card below.) */

export type Exercise = {
  kind: ExerciseKind;
  /** SRS/response key: the deck item's id, or the generated sentence. */
  itemId: string;
  /** Threaded to recordItemResult → the evidence layer (evidence.ts). */
  activity: string;
  /** Small context line ("Quelle heure est-il ?", "Translate into French"). */
  meta?: string;
  /** The big prompt (a clock, the English sentence…). */
  big?: string;
  /** Muted English gloss. */
  en?: string;
  /** Cloze frame around the blank (mcq + gap cards). */
  before?: string;
  after?: string;
  /** MCQ options, already shuffled. */
  options?: string[];
  answer: string;
  alternates?: string[];
  /** Build cards: word tiles at every width (not just below sm). */
  tiles?: boolean;
  /** Same-supply strings WordBank draws distractor words from. */
  bankPool?: string[];
  /** Spoken on the verdict — always the full sentence. */
  say?: string;
  /** Grade with gradeGap (d'/de elision) instead of gradeAnswer. */
  gapGrade?: boolean;
};


/** Up to `n` distinct distractors from `pool`, never equal to `answer`. */
function distractors(pool: string[], answer: string, n = 3): string[] {
  const seen = new Set([answer]);
  const out: string[] = [];
  for (const s of shuffle(pool)) {
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= n) break;
  }
  return out;
}

/* ── Rule cards ──────────────────────────────────────────────────────────── */

/**
 * A Mémo is ONE card. It used to be sliced into up to three parts at
 * its top-level children, and the measurements say that did more harm than
 * good (Dan, 2026-08-27, on Units 0 and 1: "Memos are urgent").
 *
 * The heuristic was child COUNT, which turns out not to predict height at all
 * — measured across all 27 deck memos at 390x844 and 360x640:
 *
 *     nationalities   1 child   the TALLEST memo   never split (1 <= 3)
 *     salutations     1 child   459px              never split
 *     alphabet        8 kids    449px, shorter     split into 3
 *
 * So it chopped memos that fit and left the tall ones whole — backwards in
 * exactly the cases that matter. And the slicing was visibly wrong where it
 * did fire: cloning the wrapper stamped « L'alphabet — 7 familles de sons »
 * onto all three cards, the first of which showed three families; the third
 * held one letter and a closing line.
 *
 * Nothing is at risk from dropping it, because the app already relies on the
 * fallback for its tallest memos: at 390x844 no memo overflows its slot, and
 * at 360x640 the nine that do already scroll — verified on `salutations`
 * (459px in a 405px slot), which scrolls 102px with its last line reachable.
 * A reference you scroll beats a reference cut into arbitrary thirds.
 */
export function splitMemo(memo: ReactNode): ReactNode[] {
  return memo == null ? [] : [memo];
}

/* ── Question supplies ───────────────────────────────────────────────────── */

type Supply = { make: (kind: ExerciseKind) => Exercise | null };

/** The deck's own items — real item ids, so answers feed each item's SRS. */
function deckSupply(deck: Collection, activityKey: string): Supply {
  const pool = gappedItems(deck);
  const hasGaps = pool.length > 0;
  const items = hasGaps ? pool : deck.items;
  const gapPool = pool.map((it) => it.gap!).filter(Boolean);
  const frPool = deck.items.map((it) => it.fr).filter(Boolean);
  const sentencePool = items.map((it) => gapSentence(it));
  let bag: Item[] = [];
  const draw = (): Item | null => {
    if (!items.length) return null;
    if (!bag.length) bag = shuffle(items);
    return bag.pop()!;
  };

  return {
    make(kind) {
      const item = draw();
      if (!item) return null;
      const sentence = gapSentence(item);
      const en = gapSentenceEn(item);
      const say = sentence;
      // A gapless deck has no French-only frame to blank — its gap positions
      // fall back to MCQ rather than fake a cloze.
      const k = kind === "gap" && !(hasGaps && item.gap) ? "mcq" : kind;
      switch (k) {
        case "mcq": {
          if (hasGaps && item.gap) {
            const { before, after } = splitGap(sentence, item.gap);
            return {
              kind: "mcq", itemId: item.id, activity: `mcq:lesson:${activityKey}`,
              before, after, en,
              options: shuffle([item.gap, ...distractors(gapPool, item.gap)]),
              answer: item.gap, say,
            };
          }
          return {
            kind: "mcq", itemId: item.id, activity: `mcq:lesson:${activityKey}`,
            meta: "Choose the French", big: item.en,
            options: shuffle([item.fr, ...distractors(frPool, item.fr)]),
            answer: item.fr, say: item.fr,
          };
        }
        case "gap": {
          const { before, after } = splitGap(sentence, item.gap!);
          return {
            kind: "gap", itemId: item.id, activity: `lesson:${activityKey}`,
            meta: item.lemma ? `(${item.lemma})` : undefined,
            before, after, en,
            answer: item.gap!, bankPool: gapPool, say, gapGrade: true,
          };
        }
        case "build":
          return {
            kind: "build", itemId: item.id, activity: `lesson:${activityKey}`,
            meta: "Build the sentence", big: en,
            answer: sentence, bankPool: sentencePool, tiles: true, say,
          };
        case "translate":
          return {
            kind: "translate", itemId: item.id, activity: `lesson:${activityKey}`,
            meta: "Translate into French", big: en ?? item.en,
            answer: sentence, bankPool: sentencePool, say,
          };
      }
    },
  };
}

/** The native lesson's generated questions + its EN→FR bonus bank. */
function lessonSupply(lesson: NativeLesson, activityKey: string): Supply {
  let bonusBag = shuffle(lesson.bonus);
  const drawBonus = () => {
    if (!lesson.bonus.length) return null;
    if (!bonusBag.length) bonusBag = shuffle(lesson.bonus);
    return bonusBag.pop()!;
  };
  const q = (): DiceQuestion => lesson.dice.newQuestion();

  return {
    make(kind) {
      switch (kind) {
        case "mcq": {
          const x = q();
          return {
            kind, itemId: x.correct, activity: `mcq:lesson:${activityKey}`,
            meta: x.meta, big: x.big, en: x.en,
            options: shuffle(x.easyOptions),
            answer: x.correct, alternates: x.alternates, say: x.correct,
          };
        }
        case "gap": {
          const x = q();
          return {
            kind, itemId: x.correct, activity: `lesson:${activityKey}`,
            meta: x.meta, big: x.big, en: x.en,
            before: x.med.before, after: x.med.after,
            answer: x.med.correct, bankPool: x.easyOptions, say: x.correct,
          };
        }
        case "build": {
          const x = q();
          return {
            kind, itemId: x.correct, activity: `lesson:${activityKey}`,
            meta: x.meta, big: x.big, en: x.en,
            answer: x.correct, alternates: x.alternates,
            bankPool: x.easyOptions, tiles: true, say: x.correct,
          };
        }
        case "translate": {
          const b = drawBonus();
          if (b) {
            return {
              kind, itemId: b.fr, activity: `lesson:${activityKey}`,
              meta: "Translate into French", big: b.en,
              answer: b.fr, alternates: b.alt, say: b.fr,
            };
          }
          const x = q();
          return {
            kind, itemId: x.correct, activity: `lesson:${activityKey}`,
            meta: x.meta, big: x.big, en: x.en,
            answer: x.correct, alternates: x.alternates, say: x.correct,
          };
        }
      }
    },
  };
}

/* ── The deck of cards ───────────────────────────────────────────────────── */

export function buildCards({
  deck,
  lesson,
  memo,
  activityKey,
}: {
  deck?: Collection;
  lesson?: NativeLesson;
  /** The Mémo to split — lesson.memo ?? memoForDeck(deck.id), resolved by the caller. */
  memo?: ReactNode;
  activityKey: string;
}): { rules: ReactNode[]; exercises: Exercise[] } {
  const supplies: Supply[] = [];
  if (deck) supplies.push(deckSupply(deck, activityKey));
  if (lesson) supplies.push(lessonSupply(lesson, activityKey));

  const exercises: Exercise[] = [];
  RAMP.forEach((kind, i) => {
    for (let s = 0; s < supplies.length; s++) {
      // Alternate supplies card by card; fall through if one can't serve.
      const ex = supplies[(i + s) % supplies.length].make(kind);
      if (ex) { exercises.push(ex); return; }
    }
  });

  return { rules: splitMemo(memo), exercises };
}
