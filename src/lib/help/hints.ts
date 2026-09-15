/**
 * Rule-based hint generators — Track D, row 6.
 *
 * WHY RULES FIRST: a hint must appear instantly, offline, on a phone in a
 * lecture hall with no signal. Every hint here is computed from the item
 * itself (answer, alternates, article, part of speech, example sentence,
 * the MCQ's options). No network, no model, no key. The LLM only ever
 * touches OPEN production (see feedback.ts) — where there is no single
 * answer to compute a hint from.
 *
 * The rungs map onto the assistance enum the evidence layer already stores
 * (evidence.ts / firestore.rules): nudge → question → scaffold → partial →
 * answer. A rung's `level` is decided by WHAT it gives away, not by its
 * position — a category hint is a nudge wherever it sits, a first letter is
 * a scaffold, a skeleton or model sentence is a partial reveal. The state
 * machine (ladder.ts) records the highest level actually shown.
 *
 * Pure: no React, no `@/` runtime imports, so verify28 runs it in node.
 */
import type { AssistanceLevel } from "@/lib/evidence";

export type Rung = {
  /** What the learner sees. French where it teaches, English chrome. */
  text: string;
  /** Which assistance level showing this rung amounts to. */
  level: AssistanceLevel;
  /** MCQ only: option labels the hint has eliminated. */
  eliminate?: string[];
};

/** The task contexts the ladder distinguishes (docs/TRACK_D_HELP_LADDER.md §2). */
export type TaskKind =
  | "mcq"        // pick one of N (Sorting, SpecuLearn, lesson mcq cards)
  | "cloze"      // one gap in a sentence (GramMarathon, lesson gap cards)
  | "typed"      // type the French for an English prompt (iComplete, 4Mémoire test, lesson translate/build)
  | "dictation"  // hear it, write it (ÉcouTexte)
  | "say"        // say it aloud (WorDrill, SpecuLearn 🎤)
  | "ordering"   // tiles in order (lesson build cards with tiles)
  | "flashcard"  // 4Mémoire test — typed, but the answer may be opened cold
  | "open";      // free production — LLM feedback (feedback.ts)

export type HintSource = {
  /** The canonical answer (what REVEAL shows). */
  answer: string;
  /** Accepted alternates — listed on the reveal so the learner sees them. */
  alternates?: string[];
  /** English gloss, if the prompt did not already show it. */
  en?: string;
  /** Article the answer is expected with ("le", "la", "l'", "un", "une"…). */
  article?: string;
  /** Explicit gender when the item carries one. */
  gender?: "m" | "f" | string;
  /** Part of speech ("verbe", "nom"…). */
  pos?: string;
  /** Category / deck topic ("Days + moments", "Aliments"). */
  category?: string;
  /** Where it was taught — the SIO topic. */
  topic?: string;
  /** A model sentence containing the answer (item.example). */
  example?: string;
  /** MCQ: the option labels on screen (the answer among them). */
  options?: string[];
  /**
   * THE ENGLISH OF THE WHOLE SENTENCE BEING DRILLED — the last clue before
   * the answer itself (Dan, 2026-09-14: *"for grammarathon, please add as a
   * final clue: the English rendering of the intended sentence"*).
   *
   * NOT `en`, WHICH IS THE ANSWER'S OWN GLOSS. On a gap card the two are
   * different things: `en` is « late » where this is « I'm late, sorry! », and
   * a session that mixed them would print a one-word clue that reads like the
   * answer. Keeping them apart is why this field exists instead of overloading
   * the one above it.
   *
   * OPT-IN, so it changes nothing anywhere it is not passed. On a typed card
   * the English IS the prompt, so a rung repeating it would be no clue at all.
   */
  sentenceEn?: string;
};

/** Letters we count and skeletonise over — spaces and apostrophes stay visible. */
const LETTER = /[a-zà-öø-ÿœæ]/i;

/** "d _ _ _" — first letter shown, every other letter an underscore, spaces kept. */
export function skeleton(answer: string): string {
  const a = answer.trim();
  if (!a) return "";
  return [...a]
    .map((ch, i) => (i === 0 ? ch : LETTER.test(ch) ? "_" : ch))
    .join(" ")
    .replace(/\s{2,}/g, "  ");
}

/** Count of letters (not spaces/punctuation). */
export function letterCount(answer: string): number {
  return [...answer].filter((ch) => LETTER.test(ch)).length;
}

/** First letter of the first word, upper-cased for display. */
export function firstLetter(answer: string): string {
  const m = answer.trim().match(LETTER);
  return m ? m[0].toUpperCase() : "";
}

function genderWord(src: HintSource): string | null {
  const g = (src.gender ?? "").toLowerCase();
  if (g.startsWith("m")) return "masculine";
  if (g.startsWith("f")) return "feminine";
  const art = (src.article ?? "").toLowerCase().replace(/[’']/g, "'");
  if (art === "le" || art === "un" || art === "du") return "masculine";
  if (art === "la" || art === "une" || art === "de la") return "feminine";
  return null;
}

/** Rung 1 for a produced answer: the KIND of thing wanted, never the thing.
 *  Gender / part of speech only — a category or topic repeats what the
 *  prompt already says (litmus test) unless the task is a pick-one, where
 *  it narrows the field (`wide`). */
function nudgeFor(src: HintSource, wide = false): Rung | null {
  const bits: string[] = [];
  const g = genderWord(src);
  if (g) bits.push(g);
  if (src.pos) bits.push(src.pos);
  if (wide && bits.length === 0 && src.category) bits.push(src.category);
  if (wide && bits.length === 0 && src.topic) return { text: `📘 ${src.topic}`, level: "question" };
  if (bits.length === 0) return null;
  return { text: `💡 ${bits.join(" · ")}`, level: "nudge" };
}

/** Rung: first letter + letter count. */
function firstLetterRung(src: HintSource): Rung {
  const n = letterCount(src.answer);
  const words = src.answer.trim().split(/\s+/).length;
  const shape = words > 1 ? `${words} words, ${n} letters` : `${n} letters`;
  return { text: `🔤 « ${firstLetter(src.answer)} » … ${shape}`, level: "scaffold" };
}

/** Rung: the skeleton, plus a model sentence when the item has one. */
function skeletonRung(src: HintSource): Rung {
  const model = src.example ? `  ·  « ${blankOut(src.example, src.answer)} »` : "";
  return { text: `✏️ ${skeleton(src.answer)}${model}`, level: "partial" };
}

/** Replace the answer inside a model sentence with a blank (word-boundary safe). */
export function blankOut(sentence: string, answer: string): string {
  const a = answer.trim();
  if (!a) return sentence;
  const esc = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^a-zà-öø-ÿœæ])${esc}(?=$|[^a-zà-öø-ÿœæ])`, "i");
  return re.test(sentence) ? sentence.replace(re, "$1____") : sentence;
}

/** The reveal text: the answer, plus alternates when the item accepts any. */
export function revealText(src: HintSource): string {
  const alts = (src.alternates ?? []).filter((x) => x && x !== src.answer);
  return alts.length ? `${src.answer}  (also: ${alts.join(", ")})` : src.answer;
}

/**
 * The hint rungs for one item in one task context. At most TWO — the ladder
 * is FRESH → HINT_1 → HINT_2 → REVEAL (ladder.ts). Fewer when the item
 * cannot support two without giving the answer away (a 2-option MCQ has no
 * hint at all: the only hint IS the answer).
 */
export function hintsFor(kind: TaskKind, src: HintSource): Rung[] {
  const answer = (src.answer ?? "").trim();
  if (!answer) return [];
  switch (kind) {
    case "mcq": {
      // A wrong pick IS the hint: the drill strikes it and the learner
      // picks again — but only when a retry still means something (≥ 3
      // options; with two, the other one is the answer, so wrong = reveal).
      // With ≥ 4 options a second rung strikes distractors down to two.
      const all = src.options ?? [];
      const opts = all.filter((o) => o !== answer);
      const rungs: Rung[] = [];
      if (all.length >= 3) rungs.push({ text: "🎯 Not that one — pick again", level: "scaffold" });
      if (all.length >= 4) rungs.push({ text: "🎯 One of two", level: "partial", eliminate: opts.slice(0, opts.length - 1) });
      return rungs;
    }
    case "cloze":
    case "typed":
    case "flashcard":
    case "ordering": {
      // Two rungs max: (gender/POS nudge, else first letter) then the
      // skeleton + model sentence. The skeleton shows the first letter too,
      // so nothing is lost when rung 1 was the nudge.
      //
      // AND A THIRD WHEN THE CALLER SUPPLIES THE SENTENCE'S ENGLISH — the last
      // step before REVEAL. It is last on purpose: a learner who is told what
      // the sentence MEANS can usually reason the missing word out, so giving
      // it earlier would skip the work the card exists to make them do.
      // `level: "partial"` rather than "answer", because it still is not the
      // answer — it is the strongest hint short of one.
      return [
        nudgeFor(src) ?? firstLetterRung(src),
        skeletonRung(src),
        ...(src.sentenceEn ? [{ text: `🇬🇧 « ${src.sentenceEn} »`, level: "partial" } as Rung] : []),
      ];
    }
    case "dictation": {
      const words = answer.split(/\s+/).length;
      return [
        { text: `👂 ${words} word${words > 1 ? "s" : ""} · starts « ${firstLetter(answer)} »`, level: "scaffold" },
        skeletonRung(src),
      ];
    }
    case "say": {
      // Saying it: rung 1 shows how it starts, rung 2 the whole written form
      // WITHOUT audio (reading it out is still production). Reveal = written
      // form + the model voice.
      return [
        { text: `🗣 « ${firstLetter(answer)}${answer.slice(1, Math.min(answer.length, 2)).toLowerCase()}… »  ${letterCount(answer)} letters`, level: "scaffold" },
        { text: `📖 ${skeleton(answer)}`, level: "partial" },
      ];
    }
    case "open": {
      // Nothing to compute from — the model answer IS the reveal; the hints
      // are the task's structure.
      const rungs: Rung[] = [];
      if (src.topic) rungs.push({ text: `📘 ${src.topic}`, level: "question" });
      if (src.example) rungs.push({ text: `✏️ « ${blankOut(src.example, answer)} »`, level: "partial" });
      return rungs;
    }
    default:
      return [];
  }
}

// ── Finale's five-rung Socratic ladder (pre-Track D, kept for the daily
// paper) ─────────────────────────────────────────────────────────────────
// Finale is not in DrillShell (it is the daily marathon paper) and hand-
// authors a `cat` per item, so it keeps the older nudge → question →
// scaffold → partial → answer sequence. Same enum, same evidence tagging.

export function buildLadder(opts: { answer: string; topic?: string; category?: string; english?: string }): Rung[] {
  const a = opts.answer ?? "";
  const rungs: Rung[] = [];
  if (opts.category) rungs.push({ text: `💡 ${opts.category}`, level: "nudge" });
  if (opts.topic) rungs.push({ text: `📘 Leçon : ${opts.topic}`, level: "question" });
  if (a) {
    rungs.push({ text: `🔤 Une réponse possible commence par « ${a[0]?.toUpperCase() ?? ""} »`, level: "scaffold" });
    const skel = a[0] + " " + [...a.slice(1)].map(() => "_").join(" ");
    rungs.push({ text: `✏️ ${skel}  (${a.length} lettres)`, level: "partial" });
    /* THE WHOLE SENTENCE IN ENGLISH, ONE RUNG BEFORE THE ANSWER (Dan,
       2026-09-14: *"For the clues, as a last resort, give the full sentence in
       English"*).
       IT SITS HERE AND NOT HIGHER ON PURPOSE. Given early it is a translation
       exercise and the French stops being read; given last it is the meaning a
       learner needs when the skeleton still has not landed — and it is the
       only rung that can rescue an item whose difficulty is the VOCABULARY
       rather than the grammar. Still short of the answer: knowing the sentence
       means « they don't like sweets » does not say whether the gap wants
       « les » or « de ». */
    if (opts.english) rungs.push({ text: `🇬🇧 ${opts.english}`, level: "partial" });
    rungs.push({ text: `✅ ${a}`, level: "answer" });
  }
  return rungs;
}

/** The rungs the learner has unlocked so far. */
export function shownRungs(rungs: Rung[], level: number): Rung[] {
  return rungs.slice(0, Math.max(0, Math.min(level, rungs.length)));
}

/** True once the answer rung has been opened. */
export function isRevealed(rungs: Rung[], level: number): boolean {
  return level >= rungs.length && rungs.length > 0;
}

/** The assistance tag for an answer given at this clue level (Finale). */
export function assistanceForLevel(rungs: Rung[], level: number): AssistanceLevel {
  if (level <= 0) return "none";
  const idx = Math.min(level, rungs.length) - 1;
  return rungs[idx]?.level ?? "none";
}
