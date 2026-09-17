/**
 * The faire generator — data, axes and question maker, split out of
 * faire.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 *
 * 2026-09-18 — FAIRE STANDS ALONE (Dan: *"I prefer to keep Faire separate on
 * its own to allow it to be worked on on its own"*). Its Exercise drills the
 * PARTITIVE HOBBY-VERB FAMILY — faire, écouter, lire, regarder — each with the
 * nouns it actually takes. The aimer verbs stay in the aimer lesson; nothing
 * is imported across. The lesson's point is unchanged: doing-and-consuming
 * verbs take du / de la / de l' / des, which collapses to de / d' when
 * negated, and all ten articles stay on the list so the wrong ones can be
 * picked (the distractor ruling, AGENTS.md 1 Sep).
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, pinnedNeg, roll, POLARITY_AXIS } from "./axis.ts";
import { medFrom, sentence, type Slot } from "./cloze.ts";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;

/** Regular -er endings — écouter and regarder conjugate on this table. */
const ER_END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const FAIRE: Record<string, string> = { je: "fais", tu: "fais", il: "fait", nous: "faisons", vous: "faites", ils: "font" };
const LIRE: Record<string, string> = { je: "lis", tu: "lis", il: "lit", nous: "lisons", vous: "lisez", ils: "lisent" };
const erConj = (stem: string) =>
  Object.fromEntries(Object.entries(ER_END).map(([k, v]) => [k, stem + v])) as Record<string, string>;

/** Every activity noun in the lesson, with its partitive. */
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
  { fr: "chansons", part: "des", en: "songs" }, { fr: "livres", part: "des", en: "books" },
  { fr: "BDs", part: "des", en: "comics" }, { fr: "films", part: "des", en: "films" },
  { fr: "vidéos", part: "des", en: "videos" },
];

/** THE ONE SOURCE of the verb↔noun pairing — which nouns each family verb
 *  genuinely takes. « écouter du sport » is not French, so the noun pool
 *  follows the verb; « faire des livres » isn't either, so the exclusively-
 *  owned nouns (livres → lire, films → regarder…) leave faire's list. */
const NOUNS_FOR: Record<string, string[]> = (() => {
  const ownedByAnother: Set<string> = new Set(["chansons", "livres", "BDs", "films", "vidéos"]);
  return {
    faire: ACTIVITIES.filter((a) => !ownedByAnother.has(a.fr)).map((a) => a.fr),
    écouter: ["musique", "chansons"],
    lire: ["livres", "BDs"],
    regarder: ["films", "vidéos"],
  };
})();

export type VerbEntry = {
  lemma: string;
  /** English base and third-person gloss — "listen to" / "listens to". */
  en: string;
  en3: string;
  conj: Record<string, string>;
  nouns: string[];
};

export const VERB_BANK: VerbEntry[] = [
  { lemma: "faire", en: "do", en3: "does", conj: FAIRE },
  { lemma: "écouter", en: "listen to", en3: "listens to", conj: erConj("écout") },
  { lemma: "lire", en: "read", en3: "reads", conj: LIRE },
  { lemma: "regarder", en: "watch", en3: "watches", conj: erConj("regard") },
].map((v) => ({ ...v, nouns: NOUNS_FOR[v.lemma] }));

export type NounEntry = { fr: string; en: string; part: "du" | "de la" | "de l'" | "des" };

export const NOUN_BANK: NounEntry[] = ACTIVITIES.map(({ fr, en, part }) => ({ fr, en, part }));

/** All ten French articles the learner chooses from — the point is that the
 *  wrong ones are ON the list (the distractor ruling, AGENTS.md 1 Sep). */
export const ALL_ARTICLES = ["le", "la", "l'", "les", "du", "de la", "de l'", "des", "de", "d'"];

const np = (art: string, fr: string) => art + (art.endsWith("'") ? "" : " ") + fr;
const isVowel = (fr: string) => /^[aeiouéèêàh]/i.test(fr);

/** Every conjugated form in the family for one subject — the verb dropdown. */
export function verbChoicesFor(slot: string): string[] {
  return [...new Set(VERB_BANK.map((v) => v.conj[slot]))];
}

/** The partitive the verb demands, de / d' when negated. */
export function articleFor(n: NounEntry, neg: boolean): string {
  return neg ? (isVowel(n.fr) ? "d'" : "de") : n.part;
}

/**
 * The sentence as its parts — subject · VERB · (pas) · ARTICLE · noun.
 *
 * ★ takes one gap (the learner chooses which), ★★ takes the verb AND the
 * article — the du / de la decision the whole stop exists to teach.
 *
 * Elision is built into the fixed chunks and mirrors sentence(): « J'écoute »,
 * « Je n'écoute pas », « de l'athlétisme » are glued, never spaced.
 */
function slotsFor(
  s: (typeof SUBJECTS)[number],
  v: VerbEntry,
  n: NounEntry,
  neg: boolean,
  art: string,
): Slot[] {
  const c = v.conj[s.slot];
  const verb: Slot = { key: "verb", text: c, choices: verbChoicesFor(s.slot) };
  const article: Slot = { key: "article", text: art, choices: ALL_ARTICLES };
  const tail: Slot = { text: `${n.fr}.` };
  if (neg) {
    const ne = isVowel(c) ? "n'" : "ne";
    return [{ text: `${s.disp} ${ne}` }, verb, { text: "pas" }, article, tail];
  }
  const elides = s.slot === "je" && isVowel(c);
  return [elides ? { text: "J'" } : { text: s.disp }, verb, article, tail];
}

/** Sujet, Verbe and polarity shape the sentence; the article is the ANSWER
 *  asked at ★★, so it is never pinned. */
export const FAIRE_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "verb", label: "Verbe", options: VERB_BANK.map((v) => ({ value: v.lemma, label: v.lemma })) },
  POLARITY_AXIS,
];

/* The English reference, as a WHOLE sentence — "He does yoga." / "She doesn't
 * listen to music." — pinning verb, polarity and noun at once (Dan, 31 Aug:
 * without it "multiple answers are possible"). It is also the Bonus round's
 * prompt, where the French scaffolding is withdrawn entirely. */
const SUBJ_EN: Record<string, { pron: string; third: boolean }> = {
  Je: { pron: "I", third: false }, Tu: { pron: "You", third: false },
  Il: { pron: "He", third: true }, Elle: { pron: "She", third: true },
  On: { pron: "We", third: false }, Nous: { pron: "We", third: false },
  Vous: { pron: "You", third: false }, Ils: { pron: "They", third: false },
  Elles: { pron: "They", third: false },
};
function sentenceEn(s: (typeof SUBJECTS)[number], v: VerbEntry, n: NounEntry, neg: boolean): string {
  const e = SUBJ_EN[s.disp];
  if (neg) return `${e.pron} ${e.third ? "doesn't" : "don't"} ${v.en} ${n.en}.`;
  return `${e.pron} ${e.third ? v.en3 : v.en} ${n.en}.`;
}

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled. The verb is rolled from the family bank, and the noun follows the
 * verb — only the nouns that verb genuinely takes are in play.
 */
export function faireQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const v = pinned1(VERB_BANK, pinned?.verb, (x) => x.lemma);
  const neg = pinnedNeg(pinned?.polarity, 0.4);
  const n = roll(NOUN_BANK.filter((x) => v.nouns.includes(x.fr)));
  const c = v.conj[s.slot];
  // Built the way sentence() glues: « n'écoute » and « J'écoute » carry no
  // space across the apostrophe, or the correct answer is not in easyOptions.
  const sv = neg
    ? `${s.disp} ${isVowel(c) ? `n'${c}` : `ne ${c}`} pas`
    : s.slot === "je" && isVowel(c) ? `J'${c}` : `${s.disp} ${c}`;
  const art = articleFor(n, neg);
  const slots = slotsFor(s, v, n, neg, art);
  return {
    meta: `${sv} … (${neg ? `don't ${v.en}` : v.en})`,
    big: n.fr,
    en: sentenceEn(s, v, n, neg),
    correct: sentence(slots),
    // Assembled from the SAME sv the slots use, so the correct sentence is
    // always among them — the oracle verify58 checks against.
    easyOptions: ALL_ARTICLES.map((x) => `${sv} ${np(x, n.fr)}.`),
    // Derived, not hand-written — the two can no longer drift apart.
    med: medFrom(slots, "article"),
    slots,
  };
}
