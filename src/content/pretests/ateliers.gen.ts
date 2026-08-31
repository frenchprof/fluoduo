/**
 * Atelier pre-tests — match the English line to the French line that says it.
 *
 * Dan, 2026-08-31: *"i need your help to build the pre-test which will consist
 * of questions with English line, and a choice between 4 french lines. Until
 * all the french lines are covered"*.
 *
 * The five atelier stops (SIO-020, 030, 040, 049, 050) had no pre-test at all.
 * They have no deck and no authored MCQs — their whole content is the model
 * mini-dialogue in `content/ateliers.ts`, which until now only played inside
 * the SIO popup. So the dialogue becomes the pre-test: every line takes its
 * turn as the answer, and the wrong options are OTHER LINES OF THE SAME
 * DIALOGUE.
 *
 * WHY THE OPTIONS ARE LINES AND NOT INVENTED DISTRACTORS. Dan's words were "a
 * choice between 4 french lines", and taking him literally is also the only
 * safe reading: every option here is French Dan already wrote and approved. A
 * generator that minted plausible-but-wrong French would be an agent drafting
 * 135 new sentences straight to a learner, which is exactly what the 31 Aug
 * rule forbids after « Je prends toujours LE poisson » shipped past a check.
 * Nothing in this file invents a word.
 *
 * WHAT IT TESTS. Not grammar in isolation — whether the learner can hear an
 * intention in English and pick the French that performs it. That is what an
 * atelier is assessed on in class, so the pre-test asks the same question
 * cold, before the model has been read. Which is the point: the dialogue is
 * the ANSWER KEY, so the popup must not show it first.
 *
 * SIO-010 is deliberately absent. It is an atelier too, but Dan authored it a
 * bespoke three-situation pre-test (`SIO010_SITUATIONS` in unit0-questions.ts)
 * that asks something this generator cannot: which greeting is appropriate for
 * WHICH audience. A generated line-match would be a downgrade.
 *
 * DETERMINISTIC, because a pre-test is built into a static page and its item
 * ids are the keys of the learner's own miss records. The three wrong options
 * for line `i` are the next three distinct lines round the dialogue —
 * `(i+1) % n`, `(i+2) % n`, `(i+3) % n` — which are provably distinct from
 * each other and from `i` whenever `n >= 4`. The renderer shuffles the four
 * before showing them, so position is never a tell.
 */
// Relative, not "@/": verify63 executes this file with
// `node --experimental-strip-types`, which cannot resolve the bundler alias.
import { ATELIER_DIALOGUES } from "../ateliers.ts";
import type { Pretest, PretestItem } from "../../lib/pretests/schema.ts";

/** The stops this generator serves, with the fields the schema demands. */
const ATELIER_PRETESTS = [
  { sio: "SIO-020", unit: 1, lessonNo: 90, slug: "atelier-presenter-un-pays", title: "Atelier — present a country" },
  { sio: "SIO-030", unit: 2, lessonNo: 90, slug: "atelier-ecrire-un-message", title: "Atelier — write a friendly message" },
  { sio: "SIO-040", unit: 3, lessonNo: 90, slug: "atelier-donner-un-itineraire", title: "Atelier — give an itinerary" },
  { sio: "SIO-049", unit: 4, lessonNo: 90, slug: "atelier-ecrire-un-avis", title: "Atelier — write a review" },
  { sio: "SIO-050", unit: 4, lessonNo: 91, slug: "atelier-au-restaurant", title: "Atelier — at the restaurant" },
] as const;

/** Four options minimum — one answer and three others. Below this a dialogue
 *  cannot make a question at all, and silently emitting a 2-option MCQ would
 *  be worse than emitting none. */
const MIN_LINES = 4;

/**
 * A line worth asking about.
 *
 * Two are dropped. A line whose French and English are the SAME string tests
 * nothing — that is SIO-030's sign-off, « Léa », where the "translation" is
 * the name again. And a line whose French repeats one already used is dropped
 * so the answer can never appear twice among the four options: SIO-010's
 * « Bonjour ! » is spoken by both people, and a question with two correct
 * buttons is a broken question, not a hard one.
 */
function testableLines(lines: readonly { fr: string; en: string }[]): { fr: string; en: string }[] {
  const seen = new Set<string>();
  const out: { fr: string; en: string }[] = [];
  for (const l of lines) {
    if (l.fr.trim() === l.en.trim()) continue;
    if (seen.has(l.fr)) continue;
    seen.add(l.fr);
    out.push({ fr: l.fr, en: l.en });
  }
  return out;
}

function itemsFor(sio: string, lines: { fr: string; en: string }[]): PretestItem[] {
  const n = lines.length;
  return lines.map((line, i) => ({
    // The stop, not the line's position in the ORIGINAL dialogue: dropping an
    // untestable line must not renumber the ones after it, or every stored
    // miss would re-point the next time a dialogue gains a line.
    id: `${sio.toLowerCase()}-line-${String(i + 1).padStart(2, "0")}`,
    // The whole line IS the blank: there is no sentence around it. The
    // renderer draws a "?" pill where the answer goes, then the English under
    // it, then the four French lines.
    sentenceBefore: "",
    sentenceAfter: "",
    answer: line.fr,
    distractors: [1, 2, 3].map((k) => lines[(i + k) % n].fr),
    fullSentence: line.fr,
    sentenceTrans: line.en,
    // The English is the PROMPT, not the reward. Without this the learner
    // would be picking between four French lines with nothing asked.
    transFirst: true,
  }));
}

export const ATELIER_GENERATED: Pretest[] = ATELIER_PRETESTS.flatMap(
  ({ sio, unit, lessonNo, slug, title }) => {
    const lines = testableLines(ATELIER_DIALOGUES[sio] ?? []);
    if (lines.length < MIN_LINES) return [];
    return [{
      id: `atelier-${sio.toLowerCase()}`,
      unit,
      lessonNo,
      lessonSlug: slug,
      title,
      items: itemsFor(sio, lines),
    }];
  },
);

/** SIO -> generated pretest id, for the registry's own attachment map. */
export const ATELIER_PRETEST_BY_SIO: Record<string, string> = Object.fromEntries(
  ATELIER_PRETESTS.map(({ sio }) => [sio, `atelier-${sio.toLowerCase()}`]).filter(
    ([, id]) => ATELIER_GENERATED.some((p) => p.id === id),
  ),
);
