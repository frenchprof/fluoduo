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
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { Collection, Item } from "@/lib/collections/schema";
import type { DiceQuestion, NativeLesson } from "@/content/lessons/native/types";
import { gappedItems } from "@/lib/collections/gramMarathonReady";
import { gapSentence, gapSentenceEn } from "@/lib/collections/gapSentence";
import { splitGap } from "@/lib/practice/cloze";
import { shuffle } from "@/lib/shuffle";

export const RULE_CARDS_MAX = 3;

export type ExerciseKind = "mcq" | "gap" | "build" | "translate";

/** The 12-card ramp — 4 MCQ, 4 gap, 3 build, 1 translate. */
export const RAMP: ExerciseKind[] = [
  "mcq", "mcq", "mcq", "mcq",
  "gap", "gap", "gap", "gap",
  "build", "build", "build",
  "translate",
];

/** EtuDice is a d12 matching the 12-card ramp (Dan, 2026-08-11: "change
 *  EtuDice to a 12-sided die — each face maps to a specific starting card").
 *  Face N starts you at card N: a 1 walks the whole ramp, a 12 is the lone
 *  translation card. */
export const DIE_SIDES = 12;

/** Die face (1-12) → the ramp index you start at. */
export const ROLL_ENTRY: Record<number, number> = Object.fromEntries(
  Array.from({ length: DIE_SIDES }, (_, k) => [k + 1, k]),
);

const KIND_LABEL: Record<ExerciseKind, string> = {
  mcq: "MCQ",
  gap: "gap-fill",
  build: "sentence building",
  translate: "translation",
};

/** One line naming where the settled die drops you. */
export function rollLabel(entry: number): string {
  if (entry === 0) return "card 1 — the full ramp";
  return `start at card ${entry + 1} of ${RAMP.length} — ${KIND_LABEL[RAMP[entry]]}`;
}

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
 * Split a Mémo at its top-level children into at most RULE_CARDS_MAX cards.
 * The memo node is the outer card (rounded-2xl div or <Card>); each part is
 * that same element cloned with a slice of its children, so both markup
 * families (memos.tsx and the native lessons' hand-rolled divs) split the
 * same way. A short memo (≤3 children) stays one card.
 */
export function splitMemo(memo: ReactNode): ReactNode[] {
  if (memo == null) return [];
  if (!isValidElement(memo)) return [memo];
  const el = memo as ReactElement<{ children?: ReactNode }>;
  const kids = Children.toArray(el.props.children);
  if (kids.length <= 3) return [memo];
  const parts = Math.min(RULE_CARDS_MAX, Math.ceil(kids.length / 3));
  const per = Math.ceil(kids.length / parts);
  const out: ReactNode[] = [];
  for (let i = 0; i < kids.length; i += per) {
    out.push(cloneElement(el, { key: `memo-${i}` }, kids.slice(i, i + per)));
  }
  return out.slice(0, RULE_CARDS_MAX);
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
