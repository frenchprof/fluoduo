/**
 * Dice-only Practice engine.
 *
 * Derives a ready-to-run MCQ set from any collection that has
 * gameConfig.letris defined. Each item's col: tag is the correct answer;
 * all other column labels become distractors. No content authoring needed.
 */

import type { Collection } from "@/lib/collections/schema";

export type PracticeItem = {
  id: string;
  fr: string;
  en: string;
  emoji?: string;
  correctColKey: string;
  correctLabel: string;
  ttsText: string;
};

export type PracticeSet = {
  collectionId: string;
  title: string;
  items: PracticeItem[];
  allLabels: string[];
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
    items.push({
      id: item.id,
      fr: item.fr,
      en: item.en,
      emoji: item.emoji,
      correctColKey: colKey,
      correctLabel: column.label,
      ttsText: (column.prefix ?? "") + item.fr,
    });
  }

  if (items.length < 2) return null;

  return {
    collectionId: collection.id,
    title: collection.title,
    items,
    allLabels: letrisConfig.columns.map((c) => c.label),
  };
}
