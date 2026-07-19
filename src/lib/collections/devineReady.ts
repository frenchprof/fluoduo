/**
 * Which decks offer SpecuLearn, né « Devine d'abord » (/practice/speculearn/[id]). aliments
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

/** Building-look emojis are banned from SpecuLearn (Dan, 2026-07-15): a
 *  generic storefront/tower can't tell épicerie from magasin (🏪 even
 *  serves two words in the same deck). Only unmistakable buildings stay —
 *  ⛪ église, 🏟️ stade, 🚉 gare read as themselves. Shared by the game
 *  (filters play) and the gallery (honest word counts). */
export const BUILDING_EMOJI = new Set(["🏬", "🏪", "🏛️", "🏛", "🏦", "🏥", "🏫", "🏨", "🏢", "🏤", "🏣", "🏩", "🏭"]);

/** Item-level SpecuLearn bans (Dan, 2026-07-15: "boutique is too ambiguous —
 *  all the images can be boutique… marché supermarché also impossible to
 *  tell the diff"). A target's image must map to exactly ONE word in its
 *  deck: product-for-shop metonymy only works when the product is exclusive
 *  to that shop (🥖 → boulangerie yes; 🍅 → marché OR supermarché no), and
 *  no picture can carry a singular/plural split (boutique vs boutiques).
 *  These items stay in Letris/Flip It/MCQ — they just can't be guessed. */
export const SPECULEARN_EXCLUDED_ITEMS = new Set([
  "commerces-01", // marché — a 🍅 is sold at the supermarché too
  "commerces-02", // supermarché — 🛒 vs 🍅 doesn't separate them
  "commerces-04", // centre commercial — 🛍️ is any shopping at all
  "commerces-11", // boutique — every shop image "can be boutique"
  "commerces-13", // boutiques — and no image shows the plural
  "lieux-letris-28-jardins-publics", // 🌳 already means parc in this deck
  "consignes-07", // Notez — 📝 vs ✍️ (Écrivez) both picture writing, and the
  //               words are near-synonyms: whichever is asked, the other is
  //               defensible (Dan, 2026-07-19). Écrivez stays; Notez keeps
  //               living in Flip It / Letris / MCQ.
]);
