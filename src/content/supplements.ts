/**
 * Supplementary self-contained activities (Dan-authored standalone HTML in
 * public/supplements/), attached to a deck's activity flaps. PRE-lesson
 * supplements sit right after the Pre-Test in the learning order.
 */
export type Supplement = { key: string; label: string; emoji: string; href: string; hint?: string };

// « Devine d'abord » graduated to a native activity (/practice/devine/…,
// Dan 2026-07-14) — the registry stays for future standalone material.
export const SUPPLEMENTS: Record<string, Supplement[]> = {};

export function supplementsForDeck(id: string): Supplement[] {
  return SUPPLEMENTS[id] ?? [];
}
