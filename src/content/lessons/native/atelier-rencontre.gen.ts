/**
 * The SIO-010 atelier generator — « Une première rencontre », and the prototype
 * the other five ateliers follow.
 *
 * WHAT AN ATELIER LESSON HAS TO DRILL, AND WHY IT IS NOT THE DIALOGUE.
 * `ATELIER_DECKS` already deals the model's nine turns as cards, so a generator
 * that walked the same lines would be a second door onto one thing. The model
 * is also `tu` throughout, and SIO-010's competence is explicit that `tu` is one
 * third of the stop:
 *
 *   "Complete every step … in the register the situation calls for: tu, vous,
 *    or the plural vous of a group (≥6/7 steps in each of the 3)."
 *
 * Producing the right line FOR A GIVEN AUDIENCE is the thing the deck cannot
 * ask, because the deck has only one audience in it. That is what this drills.
 *
 * EVERY FRENCH STRING IS AUTHORED ALREADY. `SIO010_SITUATIONS`
 * (src/content/sios/unit0-questions.ts) holds all three audiences × seven steps
 * with the correct option marked and a hand-written `why` on each wrong one —
 * which also means every distractor here was written by a person to be wrong in
 * exactly one way. Nothing is invented, selected or re-typed: the card IS the
 * authored question.
 *
 * THE GREETING STEP IS EXCLUDED. It is `multi: true` — several greetings are
 * right — and a DiceQuestion has one `correct`. Offering it here would grade a
 * correct answer wrong. It stays in the pre-test, where the multi-select UI
 * exists; six steps remain, which is exactly the "≥6/7" the competence asks.
 *
 * Loadable by `node --experimental-strip-types`, so the axes can be executed
 * rather than read: unit0-questions.ts imports nothing at all, and the path
 * below is relative because `@/` is a bundler feature verify46 forbids here.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1 } from "./axis.ts";
import { SIO010_SITUATIONS } from "../../sios/unit0-questions.ts";

/**
 * The seven steps of a first meeting, in the order all three situations author
 * them — and they ARE parallel, question for question. The labels are the only
 * new text in this file, and they are English: a dropdown needs a short name
 * where the authored `title` is a whole sentence. verify75 asserts the
 * parallelism, because a question added to one situation and not the others
 * would silently re-point every label to the wrong question.
 */
export const STEPS = [
  { key: "greet", label: "greet", multi: true },
  { key: "ask", label: "ask their name", multi: false },
  { key: "give", label: "give your name", multi: false },
  { key: "spelling", label: "ask the spelling", multi: false },
  { key: "spell", label: "spell your own", multi: false },
  { key: "meet", label: "nice to meet you", multi: false },
  { key: "leave", label: "take leave", multi: false },
] as const;

/** The steps a single-answer card can be built from. */
export const ASKABLE = STEPS.filter((s) => !s.multi);

/** The correct line for one audience at one step, from the authored options. */
export function answerAt(situationIndex: number, stepIndex: number): string {
  const q = SIO010_SITUATIONS[situationIndex].questions[stepIndex];
  return q.options.find((o) => o.ok)!.v;
}

/**
 * The step's prompt, with the authored « You say: » tail removed.
 *
 * The pre-test needs that tail — it sits above a list of options and has to say
 * what the list is for. On a card whose whole job is "produce the line", it is
 * text whose removal costs a learner nothing, which is Dan's litmus test.
 */
export const promptAt = (situationIndex: number, stepIndex: number): string =>
  (SIO010_SITUATIONS[situationIndex].questions[stepIndex].title ?? "").replace(/\s*You say:\s*$/, "");

export const RENCONTRE_AXES: DiceAxis[] = [
  // The audience decides every answer from step 2 on, so it is the axis that
  // matters; `who` is already the two-word face the pre-test's tabs wear.
  { key: "audience", label: "Audience", options: SIO010_SITUATIONS.map((s) => ({ value: s.key, label: s.who })) },
  { key: "step", label: "Step", options: ASKABLE.map((s) => ({ value: s.key, label: s.label })) },
];

export function rencontreQuestion(pinned?: Record<string, string>): DiceQuestion {
  const sit = pinned1(SIO010_SITUATIONS, pinned?.audience, (s) => s.key);
  const si = SIO010_SITUATIONS.indexOf(sit);
  const step = pinned1(ASKABLE, pinned?.step, (s) => s.key);
  const qi = STEPS.findIndex((s) => s.key === step.key);

  const options = SIO010_SITUATIONS[si].questions[qi].options.map((o) => o.v);
  const correct = answerAt(si, qi);

  return {
    // The audience in full. It is not decoration: `label` carries the register,
    // and without it steps 2 to 7 have no single right answer at all.
    meta: sit.label,
    big: promptAt(si, qi),
    bigLang: "en" as const,
    correct,
    // The authored four, whole. There is no French frame to blank on this
    // stop — the unit of choice is the utterance — so `med` offers the same
    // four, which is the shape salutations.tsx settled on for the same reason.
    easyOptions: options,
    med: { before: "", choices: options, correct, after: "" },
  };
}
