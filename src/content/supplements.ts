/**
 * Supplementary self-contained activities (Dan-authored standalone HTML in
 * public/supplements/), attached to a deck's activity flaps. PRE-lesson
 * supplements sit right after the Pre-Test in the learning order.
 */
export type Supplement = { key: string; label: string; emoji: string; href: string; hint?: string };

export const SUPPLEMENTS: Record<string, Supplement[]> = {
  // Unité 4 · Les aliments — « Devine d'abord ! » (guess-first, U4S1).
  aliments: [
    { key: "devine", label: "Devine d'abord", emoji: "🔮", href: "/supplements/aliments-devine.html", hint: "guess before the lesson" },
  ],
};

export function supplementsForDeck(id: string): Supplement[] {
  return SUPPLEMENTS[id] ?? [];
}
