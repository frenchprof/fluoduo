/**
 * The aimer generator — data, axes and question maker, split out of
 * aimer.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, pinnedGroup, roll } from "./axis.ts";
import { medFrom, sentence, type Slot } from "./cloze.ts";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
// Exported (2026-09-17) so the faire lesson can build its cumulative verb bank
// on aimer's stems — the buildup pattern, RECTIFICATION.md.
export const END_EXPORT = END;
export const VERBS = [
  { stem: "aim", en: "like" }, { stem: "ador", en: "love" }, { stem: "détest", en: "hate" },
] as const;
export const NOUNS: { fr: string; art: "le" | "la" | "l'" | "les"; en: string }[] = [
  { fr: "sport", art: "le", en: "sport" }, { fr: "football", art: "le", en: "football" },
  { fr: "tennis", art: "le", en: "tennis" }, { fr: "yoga", art: "le", en: "yoga" },
  { fr: "piano", art: "le", en: "piano" }, { fr: "cinéma", art: "le", en: "cinema" },
  { fr: "chant", art: "le", en: "singing" }, { fr: "danse", art: "la", en: "dance" },
  { fr: "natation", art: "la", en: "swimming" }, { fr: "musique", art: "la", en: "music" },
  { fr: "lecture", art: "la", en: "reading" }, { fr: "boxe", art: "la", en: "boxing" },
  { fr: "art", art: "l'", en: "art" }, { fr: "athlétisme", art: "l'", en: "athletics" },
  { fr: "escalade", art: "l'", en: "climbing" }, { fr: "équitation", art: "l'", en: "horse-riding" },
  { fr: "films", art: "les", en: "films" }, { fr: "livres", art: "les", en: "books" },
  { fr: "concerts", art: "les", en: "concerts" },
];
const ARTS = ["le", "la", "l'", "les"];

const np = (art: string, fr: string) => art + (art === "l'" ? "" : " ") + fr;
// Generalized (2026-09-17): callers outside this module pass their own subject
// and stem shapes, so the parameters say what the function needs rather than
// who defined the tables.
export const conj = (s: { slot: string }, v: { stem: string; en: string }) => v.stem + END[s.slot];

/* The English reference, as a WHOLE sentence — "He loves athletics." A bare
 * noun gloss cannot pin the verb, and at Difficile the meta (which named it)
 * is dropped for leaking the answer, so without this the card had several
 * defensible verbs (Dan, 31 Aug: "it seems multiple answers are possible …
 * unless there is an English reference to refer to"). */
const SUBJ_EN: Record<string, { pron: string; third: boolean }> = {
  Je: { pron: "I", third: false }, Tu: { pron: "You", third: false },
  Il: { pron: "He", third: true }, Elle: { pron: "She", third: true },
  On: { pron: "We", third: false }, Nous: { pron: "We", third: false },
  Vous: { pron: "You", third: false }, Ils: { pron: "They", third: false },
  Elles: { pron: "They", third: false },
};
function sentenceEn(s: (typeof SUBJECTS)[number], v: (typeof VERBS)[number], n: (typeof NOUNS)[number]): string {
  const e = SUBJ_EN[s.disp];
  return `${e.pron} ${e.third ? `${v.en}s` : v.en} ${n.en}.`;
}
function subjVerb(s: (typeof SUBJECTS)[number], v: (typeof VERBS)[number]): string {
  const c = conj(s, v);
  return s.slot === "je" && /^[aeiouéèêh]/i.test(c) ? `J'${c}` : `${s.disp} ${c}`;
}

/**
 * The sentence as its parts — subject (fixed) · VERB · ARTICLE · noun (fixed).
 *
 * This is the lesson: ★ takes the verb away, ★★ takes the verb and the article,
 * which is the contrast the whole stop exists to teach and which a single-blank
 * `med` could not express. The subject stays fixed at every level because
 * choosing it is not what this lesson is about.
 *
 * `J'aime` is one chunk with no space, so the subject slot carries the
 * apostrophe and `sentence()` glues across it.
 */
function slotsFor(
  s: (typeof SUBJECTS)[number],
  v: (typeof VERBS)[number],
  n: (typeof NOUNS)[number],
): Slot[] {
  const c = conj(s, v);
  const elides = s.slot === "je" && /^[aeiouéèêh]/i.test(c);
  return [
    { text: elides ? "J'" : s.disp },
    { key: "verb", text: c, choices: VERBS.map((x) => conj(s, x)) },
    { key: "article", text: n.art, choices: ARTS },
    { text: `${n.fr}.` },
  ];
}

/** Sujet and Verbe shape the sentence; Article is the point of the lesson. */
export const AIMER_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "verb", label: "Verbe", options: VERBS.map((v) => ({ value: v.stem, label: `${v.stem}er` })) },
  { key: "article", label: "Article", options: ARTS.map((a) => ({ value: a, label: a })) },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function aimerQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const v = pinned1(VERBS, pinned?.verb, (x) => x.stem);
  // A pinned article narrows the NOUNS rather than being applied on top of
  // one — « le danse » would be a wrong sentence, not a harder question.
  const n = roll(pinnedGroup(NOUNS, pinned?.article, (x) => x.art));
  const sv = subjVerb(s, v);
  const slots = slotsFor(s, v, n);
  return {
    meta: `${sv} … (${v.en})`,
    big: n.fr,
    en: sentenceEn(s, v, n),
    correct: sentence(slots),
    easyOptions: ARTS.map((a) => `${sv} ${np(a, n.fr)}.`),
    // Derived, not hand-written: the two can no longer drift apart, and the
    // value is byte-identical to what this generator used to build itself.
    med: medFrom(slots, "article"),
    slots,
  };
}
