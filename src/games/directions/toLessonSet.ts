import type { LetrisSet } from "@/games/letris/LetrisGame";
import type { MatchingSet } from "@/games/matching/MatchingGame";

/**
 * Convert a directions-style matching set into a LetrisSet shape so we can
 * reuse the FlashcardLesson component for it. We simply flatten lefts +
 * rights into a single deck of cards under two synthetic categories.
 */
export function directionsToLessonSet(set: MatchingSet): LetrisSet {
  return {
    id: `${set.id}-lesson`,
    title: set.title,
    subtitle: set.subtitle,
    language: set.language,
    categories: [
      { key: "left", label: "Verb phrase", prefix: "" },
      { key: "right", label: "Completion", prefix: "" },
    ],
    tiles: [
      ...set.lefts.map((l) => ({
        text: l.text,
        displayName: l.text.toLowerCase(),
        category: "left",
        meaning: l.meaning,
        emoji: l.emoji,
      })),
      ...set.rights.map((r) => ({
        text: r.text,
        displayName: r.text.toLowerCase(),
        category: "right",
        meaning: r.meaning,
        emoji: r.emoji,
      })),
    ],
  };
}
