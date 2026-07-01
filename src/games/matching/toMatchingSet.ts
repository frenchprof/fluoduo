/**
 * Adapter: unified Collection  ->  MatchingSet (the shape MatchingGame already reads).
 * Proves the collection layer feeds a real game without touching the game component.
 *
 * Reconstructs lefts / rights / validLefts from role-tagged items + gameConfig.matching.pairs.
 */
import type { Collection } from "@/lib/collections/schema";
import type { MatchingSet } from "./MatchingGame";

export function toMatchingSet(c: Collection): MatchingSet {
  const pairs = c.gameConfig?.matching?.pairs ?? [];
  const lefts = c.items
    .filter((it) => it.tags.includes("role:left"))
    .map((it) => ({ id: it.id, text: it.fr, meaning: it.en, emoji: it.emoji }));
  const rights = c.items
    .filter((it) => it.tags.includes("role:right"))
    .map((it) => ({
      id: it.id,
      text: it.fr,
      meaning: it.en,
      emoji: it.emoji,
      validLefts: pairs.filter((p) => p.rightId === it.id).map((p) => p.leftId),
    }));
  return { id: c.id, title: c.title, subtitle: c.subtitle, language: "fr", lefts, rights };
}
