/**
 * The faire generator — data, axes and question maker, split out of
 * faire.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, pinnedGroup, pinnedNeg, roll, POLARITY_AXIS } from "./axis.ts";
import { medFrom, sentence, type Slot } from "./cloze.ts";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const FAIRE: Record<string, string> = { je: "fais", tu: "fais", il: "fait", nous: "faisons", vous: "faites", ils: "font" };
const ACTIVITIES: { fr: string; part: "du" | "de la" | "de l'" | "des"; en: string }[] = [
  { fr: "yoga", part: "du", en: "yoga" }, { fr: "sport", part: "du", en: "sport" },
  { fr: "karaté", part: "du", en: "karate" }, { fr: "vélo", part: "du", en: "cycling" },
  { fr: "football", part: "du", en: "football" }, { fr: "basket", part: "du", en: "basketball" },
  { fr: "tennis", part: "du", en: "tennis" }, { fr: "ski", part: "du", en: "skiing" },
  { fr: "chant", part: "du", en: "singing" }, { fr: "danse", part: "de la", en: "dance" },
  { fr: "natation", part: "de la", en: "swimming" }, { fr: "musique", part: "de la", en: "music" },
  { fr: "photographie", part: "de la", en: "photography" }, { fr: "peinture", part: "de la", en: "painting" },
  { fr: "boxe", part: "de la", en: "boxing" }, { fr: "escalade", part: "de l'", en: "climbing" },
  { fr: "équitation", part: "de l'", en: "horse riding" }, { fr: "athlétisme", part: "de l'", en: "athletics" },
  { fr: "escrime", part: "de l'", en: "fencing" }, { fr: "arts martiaux", part: "des", en: "martial arts" },
];

const np = (art: string, fr: string) => art + (art.endsWith("'") ? "" : " ") + fr;
const isVowel = (fr: string) => /^[aeiouéèêàh]/i.test(fr);
/** Every distinct form of FAIRE — the options when the verb is the blank. */
const FAIRE_FORMS = [...new Set(Object.values(FAIRE))];

/**
 * The sentence as its parts — subject · VERB · (pas) · PARTITIVE · activity.
 *
 * This is L09, carrying the same contrast as L08 from the other side: ★ takes
 * the verb, ★★ takes the verb AND the partitive, which is the du/de la decision
 * the whole stop exists to teach.
 *
 * In the negative the verb sits INSIDE the negation — « Tu ne fais pas … » — so
 * `ne` and `pas` are two separate pieces of scenery with the blank between them.
 * Blanking the wrong word there would still look right in source, which is why
 * verify58 executes this rather than reading it.
 */
function slotsFor(
  s: (typeof SUBJECTS)[number],
  a: (typeof ACTIVITIES)[number],
  neg: boolean,
  art: string,
  arts: string[],
): Slot[] {
  const verb: Slot = { key: "verb", text: FAIRE[s.slot], choices: FAIRE_FORMS };
  const article: Slot = { key: "article", text: art, choices: arts };
  const tail: Slot = { text: `${a.fr}.` };
  return neg
    ? [{ text: `${s.disp} ne` }, verb, { text: "pas" }, article, tail]
    : [{ text: s.disp }, verb, article, tail];
}

export const FAIRE_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "partitive", label: "Partitif", options: [...new Set(ACTIVITIES.map((a) => a.part))].map((p) => ({ value: p, label: p })) },
  POLARITY_AXIS,
];

/* The English reference, as a WHOLE sentence — "He does yoga." / "He doesn't
 * do yoga." A bare noun gloss cannot pin the polarity or the verb once the
 * meta is dropped for leaking answers (Dan, 31 Aug: "multiple answers are
 * possible … unless there is an English reference"). */
const SUBJ_EN: Record<string, { pron: string; third: boolean }> = {
  Je: { pron: "I", third: false }, Tu: { pron: "You", third: false },
  Il: { pron: "He", third: true }, Elle: { pron: "She", third: true },
  On: { pron: "We", third: false }, Nous: { pron: "We", third: false },
  Vous: { pron: "You", third: false }, Ils: { pron: "They", third: false },
  Elles: { pron: "They", third: false },
};
function sentenceEn(s: (typeof SUBJECTS)[number], a: (typeof ACTIVITIES)[number], neg: boolean): string {
  const e = SUBJ_EN[s.disp];
  if (neg) return `${e.pron} ${e.third ? "doesn't" : "don't"} do ${a.en}.`;
  return `${e.pron} ${e.third ? "does" : "do"} ${a.en}.`;
}

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function faireQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const a = roll(pinnedGroup(ACTIVITIES, pinned?.partitive, (x) => x.part));
  const neg = pinnedNeg(pinned?.polarity, 0.4);
      const f = FAIRE[s.slot];
      const sv = neg ? `${s.disp} ne ${f} pas` : `${s.disp} ${f}`;
      const art = neg ? (isVowel(a.fr) ? "d'" : "de") : a.part;
      const arts = neg
        ? [art, art === "d'" ? "de" : "d'", a.part, a.part === "du" ? "de la" : "du"]
        : ["du", "de la", "de l'", "des"];
  const slots = slotsFor(s, a, neg, art, [...new Set(arts)]);
  return {
    meta: `${sv} … (${neg ? "don't do" : "do"})`,
    big: a.fr,
    en: sentenceEn(s, a, neg),
    correct: sentence(slots),
    easyOptions: [...new Set(arts)].map((x) => `${sv} ${np(x, a.fr)}.`),
    // Derived, not hand-written — the two can no longer drift apart.
    med: medFrom(slots, "article"),
    slots,
  };
}
