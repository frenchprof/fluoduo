/**
 * Dice-only Practice engine.
 *
 * Derives a ready-to-run MCQ set from any collection that has
 * gameConfig.letris defined. Each item's col: tag is the correct answer;
 * all other column labels become distractors. No content authoring needed.
 *
 * Choice text: an item's `frames` map (keyed by column key) overrides the
 * static column label, so a choice can be a syntactic frame conjugated for
 * that item — "___ m'appelle" for je, "___ t'appelles" for tu. "___" marks
 * the slot; TTS fills it with the item's `fr` on a correct answer.
 */

import type { Collection } from "@/lib/collections/schema";

export type PracticeChoice = { key: string; label: string };

export type PracticeItem = {
  id: string;
  fr: string;
  en: string;
  emoji?: string;
  correctColKey: string;
  correctLabel: string;
  ttsText: string;
  choices: PracticeChoice[];
};

export type PracticeSet = {
  collectionId: string;
  title: string;
  /** Custom question line (gameConfig.practice.prompt), if the deck sets one. */
  prompt?: string;
  items: PracticeItem[];
};

/**
 * A SORTING QUESTION MUST NOT PRINT ITS OWN ANSWER (Dan, 2026-08-31: keep
 * Sorting, "it can be useful if phrased / worded correctly" — this is the
 * wording).
 *
 * Three decks asked the learner to choose a form that was sitting in the
 * prompt. `partitifs` was every one of its eight questions: « Je mange du
 * pain. » over DU · DE LA · DE L' · DES. A learner with no French scores full
 * marks by matching letters, and this is the deck for the unit that teaches
 * the partitive. `transport` did it in 6 of 9, `negation-pas` in 11 of 20.
 *
 * The fix is here rather than in 25 hand-edited items, because the fault is
 * structural: whenever a deck sorts SENTENCES (rather than bare words) by a
 * form those sentences contain, every question gives itself away. Blanking it
 * turns each one into the question it was meant to be — « Je mange ___ pain. »
 * — and any future sentence deck is born correct.
 *
 * ONLY THE CORRECT COLUMN'S FORM IS BLANKED. A wrong option appearing in the
 * prompt is not a giveaway, it is a distractor doing its job.
 *
 * Elision is why this is not a word-boundary regex: « de l' » is followed
 * immediately by its noun in « de l'eau », so a form ending in an apostrophe
 * must match with no boundary after it.
 */
const BLANK = "___";

/**
 * Surface forms a column label can appear as, longest first.
 *
 * Labels come in three shapes and the order of operations matters:
 *   "DU"                      one form
 *   "à — on foot or astride"  a form and a gloss; the gloss is dropped
 *   "ne … pas le / la / les"  a GAP, then ALTERNATIVES sharing a prefix
 *
 * So: drop the gloss, split on the gap, and read alternatives out of each
 * segment separately. Splitting on "/" and "…" together made "ne" the first
 * part of the last example, so the shared prefix was taken from the wrong
 * segment — « Je n'aime pas le tennis » lost "pas le" while « Elle n'aime pas
 * la natation » lost only "la", and one deck asked two different questions.
 *
 * ALTERNATIVES INHERIT THEIR SEGMENT'S PREFIX: "pas le / la / les" yields
 * "pas le", "pas la", "pas les" — not "pas le", "la", "les".
 */
function surfaceForms(label: string): string[] {
  const out: string[] = [];
  for (const segment of label.split("—")[0].replace(/___/g, " ").split("…")) {
    const alts = segment
      .split("/")
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    if (!alts.length) continue;
    const lead = alts[0].split(" ").slice(0, -1).join(" ");
    for (const [i, alt] of alts.entries()) {
      out.push(i > 0 && lead && !alt.includes(" ") ? `${lead} ${alt}` : alt);
    }
  }
  // longest first, so "de la" is tried before "de" and "pas le" before "le"
  return [...new Set(out)].filter((f) => f.length >= 2).sort((x, y) => y.length - x.length);
}

/** Fold accents and case so « À LA » matches « à la ». */
function fold(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** The prompt with the correct column's form blanked out, or unchanged when
 *  it does not appear — which is the case for 28 of the 31 decks. */
export function hideAnswer(fr: string, correctLabel: string): string {
  const flat = fold(fr);
  for (const form of surfaceForms(correctLabel)) {
    const f = fold(form);
    // A form ending in an apostrophe elides into its noun, so it needs a
    // boundary before it only.
    const tail = f.endsWith("'") ? "" : "(?![a-z'])";
    const re = new RegExp(`(?<![a-z'])${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${tail}`, "i");
    const m = re.exec(flat);
    if (m) return fr.slice(0, m.index) + BLANK + fr.slice(m.index + form.length);
  }
  return fr;
}

export function toPracticeSet(collection: Collection): PracticeSet | null {
  const letrisConfig = collection.gameConfig?.letris;
  if (!letrisConfig || letrisConfig.columns.length < 2) return null;

  const columnMap = new Map(letrisConfig.columns.map((c) => [c.key, c]));

  const items: PracticeItem[] = [];
  for (const item of collection.items) {
    const colTag = item.tags.find((t) => t.startsWith("col:"));
    if (!colTag) continue;
    const colKey = colTag.slice(4);
    const column = columnMap.get(colKey);
    if (!column) continue;
    const choices: PracticeChoice[] = letrisConfig.columns.map((c) => ({
      key: c.key,
      label: item.frames?.[c.key] ?? c.choiceLabel ?? c.label,
    }));
    const correctFrame = item.frames?.[colKey];
    items.push({
      id: item.id,
      // The DISPLAY copy only — the deck's own `fr` is untouched, and `ttsText`
      // below still speaks the full sentence on a correct answer.
      fr: hideAnswer(item.fr, choices.find((c) => c.key === colKey)!.label),
      en: item.en,
      emoji: item.emoji,
      correctColKey: colKey,
      correctLabel: choices.find((c) => c.key === colKey)!.label,
      ttsText: correctFrame?.includes("___")
        ? correctFrame.replace("___", item.fr)
        : (column.prefix ?? "") + item.fr,
      choices,
    });
  }

  if (items.length < 2) return null;

  return {
    collectionId: collection.id,
    title: collection.title,
    prompt: collection.gameConfig?.practice?.prompt,
    items,
  };
}
