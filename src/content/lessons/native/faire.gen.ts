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
 * 2026-09-17 RETROFIT — the cumulative buildup (RECTIFICATION.md). The faire
 * lesson (SIO-024) does not replace aimer (SIO-023); it builds on it, so the
 * verb bank carries BOTH frames — aimer's liking verbs (Frame A, definite
 * article) and faire (Frame B, partitive) — and the contrast IS the lesson:
 * le/la/l'/les for liking, du/de la/de l'/des for doing, and only the
 * partitive collapsing to de/d' in the negative. The article slot offers all
 * ten French articles; the check validates the pick against the verb's frame.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, pinnedNeg, roll, POLARITY_AXIS } from "./axis.ts";
import { medFrom, sentence, type Slot } from "./cloze.ts";
import { VERBS as AIMER_VERBS, NOUNS as AIMER_NOUNS, END_EXPORT as AIMER_END } from "./aimer.gen.ts";

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

// ── THE CUMULATIVE VERB BANK ────────────────────────────────────────────────
// Each verb is typed by its argument frame (RECTIFICATION.md's taxonomy):
//   A = liking → DEFINITE article, which survives the negative
//   B = doing  → PARTITIVE article, which becomes de/d' when negated

export type VerbFrame = "A" | "B";
export type VerbEntry = {
  lemma: string;
  frame: VerbFrame;
  conj: (slot: string) => string;
  en: string;
};

export const VERB_BANK: VerbEntry[] = [
  // Frame A — aimer's liking verbs (SIO-023), carried forward cumulatively.
  ...AIMER_VERBS.map((v) => ({
    lemma: `${v.stem}er`,
    frame: "A" as const,
    conj: (slot: string) => v.stem + AIMER_END[slot],
    en: v.en,
  })),
  // Frame B — this lesson's own verb.
  { lemma: "faire", frame: "B", conj: (slot: string) => FAIRE[slot], en: "do" },
];

// ── THE CUMULATIVE NOUN BANK ────────────────────────────────────────────────
// aimer's nouns (definite known, partitive derived) merged with faire's
// activities (partitive known, definite derived). The two derivations agree on
// every noun both lists carry — checked by construction, not asserted here.

export type NounEntry = {
  fr: string;
  en: string;
  defArt: "le" | "la" | "l'" | "les";
  partArt: "du" | "de la" | "de l'" | "des";
  /** Fair game when the chosen verb is Frame A (aimer & co.). */
  canAimer: boolean;
  /** Fair game when the chosen verb is Frame B (faire). */
  canFaire: boolean;
};

/* Not everything one likes is something one DOES: « faire du piano » is not
 * French (one plays the piano), and films, livres and concerts are watched,
 * read and attended. « lecture » stays faire-able — « faire de la lecture »
 * is ordinary French. */
const NOT_FAIREABLE = new Set(["films", "livres", "concerts", "piano", "cinéma"]);

const DEF_TO_PART: Record<NounEntry["defArt"], NounEntry["partArt"]> =
  { le: "du", la: "de la", "l'": "de l'", les: "des" };
const PART_TO_DEF: Record<NounEntry["partArt"], NounEntry["defArt"]> =
  { du: "le", "de la": "la", "de l'": "l'", des: "les" };

export const NOUN_BANK: NounEntry[] = (() => {
  const byFr = new Map<string, NounEntry>();
  for (const n of AIMER_NOUNS) {
    byFr.set(n.fr, {
      fr: n.fr, en: n.en, defArt: n.art, partArt: DEF_TO_PART[n.art],
      canAimer: true, canFaire: !NOT_FAIREABLE.has(n.fr),
    });
  }
  for (const a of ACTIVITIES) {
    const hit = byFr.get(a.fr);
    // A noun both lessons carry keeps aimer's definite (the two agree) and
    // gains faire-ability.
    if (hit) { hit.canFaire = true; continue; }
    byFr.set(a.fr, {
      fr: a.fr, en: a.en, defArt: PART_TO_DEF[a.part], partArt: a.part,
      canAimer: true, canFaire: true,
    });
  }
  return [...byFr.values()];
})();

/** All ten French articles the learner chooses from — the point is that the
 *  wrong ones are ON the list (the distractor ruling, AGENTS.md 1 Sep). */
export const ALL_ARTICLES = ["le", "la", "l'", "les", "du", "de la", "de l'", "des", "de", "d'"];

const np = (art: string, fr: string) => art + (art.endsWith("'") ? "" : " ") + fr;
const isVowel = (fr: string) => /^[aeiouéèêàh]/i.test(fr);

/** Every conjugated form in the bank for one subject — the verb dropdown. */
export function verbChoicesFor(slot: string): string[] {
  return [...new Set(VERB_BANK.map((v) => v.conj(slot)))];
}

/** The article a verb's frame demands of a noun: definite for liking (kept in
 *  the negative), partitive for doing (de/d' when negated). */
export function articleFor(v: VerbEntry, n: NounEntry, neg: boolean): string {
  if (v.frame === "A") return n.defArt;
  return neg ? (isVowel(n.fr) ? "d'" : "de") : n.partArt;
}

/**
 * The sentence as its parts — subject · VERB · (pas) · ARTICLE · noun.
 *
 * ★ takes the verb, ★★ takes the verb AND the article — which, with the
 * cumulative bank, is now the le-vs-du decision across BOTH frames. The
 * subject stays fixed at every level because choosing it is not what this
 * lesson is about.
 *
 * Elision is built into the fixed chunks and mirrors sentence(): « J'aime »,
 * « Je n'aime pas », « de l'athlétisme » are glued, never spaced.
 */
function slotsFor(
  s: (typeof SUBJECTS)[number],
  v: VerbEntry,
  n: NounEntry,
  neg: boolean,
  art: string,
): Slot[] {
  const c = v.conj(s.slot);
  const verb: Slot = { key: "verb", text: c, choices: verbChoicesFor(s.slot) };
  const article: Slot = { key: "article", text: art, choices: ALL_ARTICLES };
  const tail: Slot = { text: `${n.fr}.` };
  if (neg) {
    // The verb sits INSIDE the negation, and ne elides before a vowel verb.
    const ne = isVowel(c) ? "n'" : "ne";
    return [{ text: `${s.disp} ${ne}` }, verb, { text: "pas" }, article, tail];
  }
  const elides = s.slot === "je" && isVowel(c);
  return [elides ? { text: "J'" } : { text: s.disp }, verb, article, tail];
}

/** Sujet and Verbe shape the sentence; the polarity too. The old partitive
 *  axis is gone — the article is the ANSWER now, asked at ★★, so pinning it
 *  would pin the answer. */
export const FAIRE_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "verb", label: "Verbe", options: VERB_BANK.map((v) => ({ value: v.lemma, label: v.lemma })) },
  POLARITY_AXIS,
];

/* The English reference, as a WHOLE sentence — "He does yoga." / "She doesn't
 * like art." — pinning verb, polarity and noun at once (Dan, 31 Aug: without
 * it "multiple answers are possible"). */
const SUBJ_EN: Record<string, { pron: string; third: boolean }> = {
  Je: { pron: "I", third: false }, Tu: { pron: "You", third: false },
  Il: { pron: "He", third: true }, Elle: { pron: "She", third: true },
  On: { pron: "We", third: false }, Nous: { pron: "We", third: false },
  Vous: { pron: "You", third: false }, Ils: { pron: "They", third: false },
  Elles: { pron: "They", third: false },
};
function sentenceEn(s: (typeof SUBJECTS)[number], v: VerbEntry, n: NounEntry, neg: boolean): string {
  const e = SUBJ_EN[s.disp];
  if (v.frame === "A") {
    if (neg) return `${e.pron} ${e.third ? "doesn't" : "don't"} ${v.en} ${n.en}.`;
    return `${e.pron} ${e.third ? `${v.en}s` : v.en} ${n.en}.`;
  }
  if (neg) return `${e.pron} ${e.third ? "doesn't" : "don't"} do ${n.en}.`;
  return `${e.pron} ${e.third ? "does" : "do"} ${n.en}.`;
}

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors. The
 * verb is rolled from the CUMULATIVE bank, and the frame filters the nouns:
 * liking verbs ask about anything aimer taught, doing verbs only about
 * activities.
 */
export function faireQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const v = pinned1(VERB_BANK, pinned?.verb, (x) => x.lemma);
  const neg = pinnedNeg(pinned?.polarity, 0.4);
  const pool = NOUN_BANK.filter((n) => (v.frame === "A" ? n.canAimer : n.canFaire));
  const n = roll(pool);
  const c = v.conj(s.slot);
  // Built the way sentence() glues: « n'adorent » and « J'aime » carry no
  // space across the apostrophe, or the correct answer is not in easyOptions.
  const sv = neg
    ? `${s.disp} ${isVowel(c) ? `n'${c}` : `ne ${c}`} pas`
    : s.slot === "je" && isVowel(c) ? `J'${c}` : `${s.disp} ${c}`;
  const art = articleFor(v, n, neg);
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
