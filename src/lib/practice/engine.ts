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
      fr: item.fr,
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
