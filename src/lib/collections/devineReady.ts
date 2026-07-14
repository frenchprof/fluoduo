/**
 * Which decks offer « Devine d'abord » (/practice/devine/[id]). aliments
 * runs on its photo bank; the rest qualified in the 2026-07-14 audit by
 * having an emoji on (almost) every item — the emoji plays the image role.
 * negation-pas was audited and excluded: full sentences don't fit a
 * guess-the-word game.
 */
export const DEVINE_READY = [
  "aliments",
  "consignes",
  "salutations",
  "tu-vous",
  "countries-letris",
  "languages",
  "nationalities",
  "lieux-letris",
  "weather-letris",
  "commerces",
  "demonstratifs",
] as const;

export function isDevineReady(id: string): boolean {
  return (DEVINE_READY as readonly string[]).includes(id);
}
