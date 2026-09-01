"use client";

/**
 * buildCards() — the lesson pager's deck of cards (patch 22).
 *
 * Twelve exercise cards, whose KIND is the difficulty tier the learner chose
 * (lib/lessonEntry.ts — Dan, 2026-08-31): Facile recognises and sorts,
 * Moyen completes one missing piece, Difficile completes two, Bonus
 * translates the whole sentence from English.
 *
 * NO RULE CARDS ANY MORE (Dan, same day: "Why is the same screen appearing
 * before the questions appear, it is a repeat?"). The Mémo used to open the
 * run as a rule card — authored when the pager was the whole lesson. Since
 * the six tabs arrived (LessonTabs, 30 Aug) the identical Mémo sits one tap
 * away under « Les formes », so the in-run copy showed every learner the
 * same screen twice. The tab is now its only home.
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
import type { Collection, Item } from "@/lib/collections/schema";
import type { DiceQuestion, NativeLesson } from "@/content/lessons/native/types";
import { gappedItems } from "@/lib/collections/gramMarathonReady";
import { gapDecoyPool, gapSentence, gapSentenceEn } from "@/lib/collections/gapSentence";
import { splitGap } from "@/lib/practice/cloze";
import { rampFor, type EntryLevel, type ExerciseKind } from "@/lib/lessonEntry";
import { metaLeaksAnswer, multiBlankCard, type ClozeSegment } from "@/content/lessons/native/cloze";
import { shuffle } from "@/lib/shuffle";

export type { ExerciseKind } from "@/lib/lessonEntry";

/** The default (Facile) ramp — one of four (lib/lessonEntry.ts): the level
 *  chooses the MECHANIC, never the length, so a higher level is harder work
 *  and not less of it. */
export const RAMP: ExerciseKind[] = rampFor(1);

/* THE ENTRY DIE IS STILL GONE, and this is the distinction that matters.
 * A d12 used to open the ramp and its face was a START INDEX — the pager did
 * `queue.slice(entry)`, so a 1 walked all twelve cards and a 12 left only the
 * translation. That made the die a run-length dial, and since the ramp runs
 * easy → hard a high roll bought less work at the hard end. Dan removed it
 * ("drop the shortcuts") and has since allowed entry at ★★★ — which is the
 * opposite request: same twelve cards, harder ones. rampFor() enforces that;
 * nothing slices the queue. (The die Dan means — a different variation of the
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
  /** Language of `big`; "en" also renders it as a reference, not a target. */
  bigLang?: "fr" | "en";
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
  /**
   * Typed at EVERY width — no word bank below sm.
   *
   * Difficile's single-blank fallback (a lesson whose generator has no slots
   * yet, or a deck item). On a phone the word bank's three tiles are visually
   * an MCQ — Dan, 31 Aug: "all the levels … why are they all mcq?" — so at
   * the level whose whole point is withdrawn scaffolding, the bank goes and
   * the learner types. Moyen keeps the bank: picking the one missing piece
   * from choices IS his old site's ★ mechanic.
   */
  typed?: boolean;
  /**
   * A cloze with MORE THAN ONE blank, for a question that authored `slots`.
   *
   * Present only at ★★ and above, and only where the generator gave the
   * question its parts — one blank still travels as `before`/`after`, byte for
   * byte as before, so ★ and all 46 slotless lessons are untouched by this.
   * `answer` is the blanks joined by a space, which is what the learner's
   * picks are joined into, so the existing graders need no change.
   */
  segments?: ClozeSegment[];
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

/* ── Question supplies ───────────────────────────────────────────────────── */

type Supply = { make: (kind: ExerciseKind) => Exercise | null };

/** The deck's own items — real item ids, so answers feed each item's SRS. */
function deckSupply(deck: Collection, activityKey: string, entry: EntryLevel = 1): Supply {
  const pool = gappedItems(deck);
  const hasGaps = pool.length > 0;
  const items = hasGaps ? pool : deck.items;
  // The wrong answers are NOT "the deck's other gaps" any more — they are that
  // pool put through the deck's `gapDecoys` (gapSentence.ts), so a deck holding
  // two interchangeable gap words can stop offering one as the other's mistake.
  // Per ITEM, because the substitution has to know which gap is the answer.
  const decoysFor = (answer: string) => gapDecoyPool(deck, answer);
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
      // fall back rather than fake a cloze. At Facile that fallback is MCQ;
      // at Moyen and up it is BUILD, because a learner who chose "complete
      // the sentence" and got twelve recognition cards is Dan's 31 Aug bug
      // report verbatim ("why are they all mcq?"). Assembling the sentence is
      // the nearest honest demand a gapless deck can make.
      const k = kind === "gap" && !(hasGaps && item.gap) ? (entry >= 2 ? "build" : "mcq") : kind;
      switch (k) {
        case "mcq": {
          if (hasGaps && item.gap) {
            const { before, after } = splitGap(sentence, item.gap);
            return {
              kind: "mcq", itemId: item.id, activity: `mcq:lesson:${activityKey}`,
              before, after, en,
              options: shuffle([item.gap, ...distractors(decoysFor(item.gap), item.gap)]),
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
            answer: item.gap!, say, gapGrade: true,
            ...(entry >= 3 ? { typed: true } : { bankPool: decoysFor(item.gap!) }),
          };
        }
        // `item.alt` (schema.ts) holds authored acceptable variants — Complete
        // It honoured it, these cards silently didn't, so a variant the deck
        // itself declares correct was marked wrong (31 Aug ambiguity audit).
        case "build":
          return {
            kind: "build", itemId: item.id, activity: `lesson:${activityKey}`,
            meta: "Build the sentence", big: en,
            answer: sentence, alternates: item.alt,
            bankPool: sentencePool, tiles: true, say,
          };
        case "translate":
          return {
            kind: "translate", itemId: item.id, activity: `lesson:${activityKey}`,
            meta: "Translate into French", big: en ?? item.en,
            answer: sentence, alternates: item.alt,
            bankPool: sentencePool, say,
          };
      }
    },
  };
}

/** The native lesson's generated questions + its EN→FR bonus bank. */
function lessonSupply(
  lesson: NativeLesson,
  activityKey: string,
  pinned?: Record<string, string>,
  entry: EntryLevel = 1,
): Supply {
  const steered = !!pinned && Object.values(pinned).some(Boolean);
  let bonusBag = shuffle(lesson.bonus);
  const drawBonus = () => {
    if (!lesson.bonus.length) return null;
    if (!bonusBag.length) bonusBag = shuffle(lesson.bonus);
    return bonusBag.pop()!;
  };
  const q = (): DiceQuestion => lesson.dice.newQuestion(pinned);

  return {
    make(kind) {
      switch (kind) {
        case "mcq": {
          const x = q();
          return {
            kind, itemId: x.correct, activity: `mcq:lesson:${activityKey}`,
            meta: x.meta, big: x.big, bigLang: x.bigLang, en: x.en,
            options: shuffle(x.easyOptions),
            answer: x.correct, alternates: x.alternates, say: x.correct,
          };
        }
        case "gap": {
          const x = q();
          // THE ★ LADDER, where it actually happens. A question that authored
          // `slots` can have more than one piece withdrawn: ★ takes the verb,
          // ★★ takes the verb AND the article — Dan's L08 — and the vocabulary
          // ladder takes the article, then the article and the noun.
          //
          // Two blanks or more go down the segmented path; one blank keeps the
          // before/after shape it has always had, so ★ and every slotless
          // generator produce exactly the card they produced yesterday.
          const multi = multiBlankCard(x, entry);
          if (multi) {
            // THE PROMPT MAY NOT PRINT ITS OWN ANSWER. `meta` is a context line
            // the generator wrote for the single-blank card — aimer's is
            // "Tu adores … (love)" — and at ★★ the verb is one of the blanks,
            // so that line hands the learner the answer it is about to ask for.
            // Found by opening the card, not by reading the code; the same
            // fault verify35 and verify56 were written for.
            const blanked = multi.segments.flatMap((sg) => (sg.kind === "blank" ? [sg.answer] : []));
            return {
              kind, itemId: x.correct, activity: `lesson:${activityKey}`,
              meta: metaLeaksAnswer(x.meta, blanked) ? undefined : x.meta,
              // A FRENCH `big` is dropped here: the generators' big is the
              // bare noun the segmented sentence already shows — a repeat,
              // not a prompt (#97). An ENGLISH big (bigLang: "en") survives:
              // it IS the card's reference — "an orange highlighter" over
              // « le fluo ___ » (Peers' colours ladder) — and `en` remains
              // the fallback full-sentence reference where no big is given
              // (Dan, 31 Aug: "it seems multiple answers are possible …
              // unless there is an English reference to refer to").
              big: x.bigLang === "en" ? x.big : undefined,
              bigLang: x.bigLang,
              en: x.en,
              segments: multi.segments, answer: multi.answer,
              bankPool: x.easyOptions, say: x.correct,
            };
          }
          // A generator's `alternates` are FULL sentences ("Aux Philippines,
          // on parle anglais."), but this card grades only the blank — so a
          // prompt that says "they speak filipino, anglais — give one" marked
          // the invited second answer wrong (31 Aug ambiguity audit). Where an
          // alternate fits the same frame, its middle is this blank's own
          // alternate; where the whole sentence IS the blank, that middle is
          // the whole alternate, so both shapes are covered by one rule.
          const gapAlts = (x.alternates ?? []).flatMap((alt) => {
            if (!alt.startsWith(x.med.before) || !alt.endsWith(x.med.after)) return [];
            const mid = alt.slice(x.med.before.length, alt.length - x.med.after.length).trim();
            return mid && mid !== x.med.correct ? [mid] : [];
          });
          return {
            kind, itemId: x.correct, activity: `lesson:${activityKey}`,
            meta: x.meta, big: x.big, bigLang: x.bigLang, en: x.en,
            before: x.med.before, after: x.med.after,
            answer: x.med.correct, say: x.correct,
            alternates: gapAlts.length ? gapAlts : undefined,
            ...(entry >= 3 ? { typed: true } : { bankPool: x.easyOptions }),
          };
        }
        case "build": {
          const x = q();
          return {
            kind, itemId: x.correct, activity: `lesson:${activityKey}`,
            meta: x.meta, big: x.big, bigLang: x.bigLang, en: x.en,
            answer: x.correct, alternates: x.alternates,
            bankPool: x.easyOptions, tiles: true, say: x.correct,
          };
        }
        case "translate": {
          // The bonus bank is a fixed authored list, so it cannot honour a
          // pinned axis: a learner who asked for "vous + être + négatif" would
          // get a translate card about anything at all, in a run that claims to
          // be about their selection. Steered runs generate instead.
          const b = steered ? null : drawBonus();
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
            meta: x.meta, big: x.big, bigLang: x.bigLang, en: x.en,
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
  activityKey,
  entry = 1,
  pinned,
}: {
  deck?: Collection;
  lesson?: NativeLesson;
  activityKey: string;
  /** The difficulty tier: Facile / Moyen / Difficile / Bonus. Same card
   *  count at every level — see lib/lessonEntry.ts on why that is
   *  load-bearing. */
  entry?: EntryLevel;
  /** Axis values the learner pinned in the dropdowns; see DiceConfig.axes. */
  pinned?: Record<string, string>;
}): { exercises: Exercise[] } {
  const supplies: Supply[] = [];
  // With axes pinned, the DECK supply is dropped: its questions are drawn from
  // the deck's own items and cannot honour "only vous + être", so mixing it in
  // would serve cards that ignore the learner's selection while looking like
  // they answer it. A steered run is the lesson generator's alone.
  const steered = !!pinned && Object.values(pinned).some(Boolean);
  // Same argument at Difficile on a lesson whose generator authors slots: the
  // deck supply can only ever withdraw ONE piece, so mixing it in serves
  // Moyen cards into a run the learner chose for two (Dan, 31 Aug:
  // "Difficile if it involves two items"). Slots are structural — one probe
  // says whether this generator has them.
  const slotted = !!lesson && !!lesson.dice.newQuestion(pinned)?.slots?.length;
  if (deck && !(steered && lesson) && !(entry === 3 && slotted)) supplies.push(deckSupply(deck, activityKey, entry));
  if (lesson) supplies.push(lessonSupply(lesson, activityKey, pinned, entry));

  const exercises: Exercise[] = [];
  rampFor(entry).forEach((kind, i) => {
    for (let s = 0; s < supplies.length; s++) {
      // Alternate supplies card by card; fall through if one can't serve.
      const ex = supplies[(i + s) % supplies.length].make(kind);
      if (ex) { exercises.push(ex); return; }
    }
  });

  return { exercises };
}
