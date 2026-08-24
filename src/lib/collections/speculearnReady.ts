/**
 * NAMING: SpecuLearn and "devine" are the SAME entity — the game launched as
 * « Devine d'abord ! » and Dan renamed it SpecuLearn (2026-07-15); these code
 * identifiers caught up on 2026-07-19. Only data-facing legacy names remain
 * on purpose and must NOT be "modernised": the `devine:` SRS record prefix
 * (learners' history rides on it), `content/devine-aliments.json`, and the
 * `public/devine/` photo folder its img paths point into.
 *
 * Which decks offer SpecuLearn (/practice/speculearn/[id]). aliments
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
export const SPECULEARN_READY = [
  "aliments",
  "consignes",
  "countries-letris",
  "languages",
  "lieux-letris",
  "commerces",
  "colors",
  "transport",
  "objets-articles",
] as const;

export function isSpecuLearnReady(id: string): boolean {
  return (SPECULEARN_READY as readonly string[]).includes(id);
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

  // --- colors (SPECULEARN_ITEMS.md, 2026-08-24) ---
  "colors-12", // le beige — no swatch exists at all: no circle, no heart,
  //              and every tan-ish stand-in (🟤📦🧸) reads as marron
  //              (colors-07's twin). Dan: "just drop them" — no image.

  // --- transport (SPECULEARN_ITEMS.md, 2026-08-24) ---
  "transport-10-prendre-metro", // prendre le métro — image-twin of 🚇, already en métro
  "transport-11-prendre-voiture", // prendre la voiture — image-twin of 🚗, already en voiture
  "transport-12-prendre-avion", // prendre l'avion — image-twin of ✈️, already en avion
  // These three are also verb phrases (prendre + article + noun), unlike
  // the nine en/à prepositional phrases that stay — banning them is what
  // keeps the playable transport set one grammatical category (Dan's
  // amendment 1, 2026-08-24: "we cannot have verb phrases alongside
  // prepositional phrases"). Category purity check: every remaining
  // transport item carries tags col:en or col:a — no exceptions.
]);

/* Category-purity note (Dan, 2026-08-24 amendment 1): each deck's playable
 * SpecuLearn set must be ONE grammatical category.
 *   colors            → definite article + colour noun ("le rouge", …).
 *                        11/12 play once colors-12 (no image) is excluded.
 *   transport          → en/à prepositional phrases ONLY ("en train",
 *                        "à vélo", …). The three prendre-* verb phrases
 *                        above are excluded for exactly this reason, not
 *                        only the image-twin reason.
 *   objets-articles     → bare noun + col:un/col:une/col:des tag (the
 *                        indefinite article is rendered by withArticle() in
 *                        SpecuLearnContent.tsx). No exclusions needed here:
 *                        the six items with no honest emoji (below) get a
 *                        purpose-made SVG instead, so all 20 stay the same
 *                        category and all 20 play.
 */

/** Per-item image overrides (Dan, 2026-08-24 amendment 3: "don't force
 *  interpretations on emojis"). These six objets-articles items failed the
 *  honest-emoji test in SPECULEARN_ITEMS.md — no Unicode glyph depicts them
 *  without picturing a different object (gomme/agrafeuse/portefeuille/
 *  trousse/mouchoirs) or colliding with a deckmate (passeport vs 🪪 carte
 *  d'identité) — so each gets a small purpose-made flat SVG instead of a
 *  forced emoji. Mirrors the aliments photo-bank mechanism (an `img` path
 *  wins over `emoji` in SpecuLearnContent's Visual component) but keyed by
 *  item id rather than a whole separate deck, since the other 14
 *  objets-articles items already have an honest emoji and mixing the two
 *  per item is the smaller change (no new Item-schema field, just this
 *  lookup consulted from buildItems()). */
export const SPECULEARN_ITEM_IMAGES: Record<string, string> = {
  "objets-articles-07": "/objets-articles/passeport.svg", // passeport — visually
  //   distinct booklet (dark cover + gold emblem) vs -08's flat 🪪 card
  "objets-articles-09": "/objets-articles/trousse.svg", // trousse — zip pouch, not the 👝 clutch bag
  "objets-articles-11": "/objets-articles/gomme.svg", // gomme — no eraser emoji exists
  "objets-articles-12": "/objets-articles/portefeuille.svg", // portefeuille — bifold wallet, not the 👛 coin purse
  "objets-articles-17": "/objets-articles/mouchoirs.svg", // mouchoirs — tissue pack, not the 🧻 toilet roll
  "objets-articles-19": "/objets-articles/agrafeuse.svg", // agrafeuse — not the 📎 paperclip
};

/** Per-deck SpecuLearn prompt frame (Dan, 2026-08-24 amendment 2). The
 *  transport en/à items are answers to a specific question, not free-
 *  floating vocabulary — showing that question above the options is what
 *  keeps "en train" / "à vélo" honestly interpretable as a mode of
 *  transport rather than a stray noun. Rendered lang="fr" above the
 *  options in SpecuLearnContent.tsx; decks not listed here render nothing
 *  extra (unchanged behaviour). */
export const SPECULEARN_PROMPT_FRAME: Record<string, string> = {
  transport: "Tu y vas comment ?",
};
