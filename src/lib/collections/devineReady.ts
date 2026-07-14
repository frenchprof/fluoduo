/**
 * Which decks offer « Devine d'abord » (/practice/devine/[id]). aliments
 * runs on its photo bank; the rest qualified in the 2026-07-14 audit by
 * having an emoji on (almost) every item — the emoji plays the image role.
 * EXCLUDED after review (Dan, 2026-07-14: demonstratifs "is not making any
 * sense"): decks whose learning point an image cannot carry —
 *   demonstratifs  (the point is ce/cet/cette/ces, not the nouns)
 *   nationalities  (word side is the country name → duplicates countries,
 *                   tests zero nationality forms)
 *   tu-vous        (the point is the register choice; the person emoji are
 *                   near-indistinguishable as options)
 *   negation-pas   (full sentences don't fit a guess-the-word game)
 *   weather-letris (Dan, 2026-07-14: "the pictures are not at all a match")
 *   salutations    (Dan, 2026-07-14: impossible to picture the register)
 */
export const DEVINE_READY = [
  "aliments",
  "consignes",
  "countries-letris",
  "languages",
  "lieux-letris",
  "commerces",
] as const;

export function isDevineReady(id: string): boolean {
  return (DEVINE_READY as readonly string[]).includes(id);
}
