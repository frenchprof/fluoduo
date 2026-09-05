/**
 * NAMING: SpecuLearn and "devine" are the SAME entity — the game launched as
 * « Devine d'abord ! » and Dan renamed it SpecuLearn (2026-07-15); these code
 * identifiers caught up on 2026-07-19. Only data-facing legacy names remain
 * on purpose and must NOT be "modernised": the `devine:` SRS record prefix
 * (learners' history rides on it), `content/devine-aliments.json`, and the
 * `public/devine/` photo folder its img paths point into.
 *
 * Which decks offer SpecuLearn (/practice/speculearn/[id]).
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

export const BUILDING_EMOJI = new Set(["🏬", "🏪", "🏛️", "🏛", "🏦", "🏥", "🏫", "🏨", "🏢", "🏤", "🏣", "🏩", "🏭"]);

export const SPECULEARN_EXCLUDED_ITEMS = new Set([
  "commerces-01", "commerces-02", "commerces-04", "commerces-11", "commerces-13",
  "lieux-letris-28-jardins-publics", "consignes-07", "colors-12",
  "transport-10-prendre-metro", "transport-11-prendre-voiture", "transport-12-prendre-avion",
  "objets-articles-07", "objets-articles-09", "objets-articles-11", "objets-articles-12",
  "objets-articles-17", "objets-articles-19",
]);

/** Per-item commerce image overrides. */
export const SPECULEARN_ITEM_IMAGES: Record<string, string> = {
  "commerces-15": "/speculearn/commerces-15.png",
  "commerces-16": "/speculearn/commerces-16.png",
  "commerces-17": "/speculearn/commerces-17.png",
  "commerces-18": "/speculearn/commerces-18.png",
  "commerces-19": "/speculearn/commerces-19.png",
  "commerces-20": "/speculearn/commerces-20.png",
  "commerces-21": "/speculearn/commerces-21.png",
  "commerces-22": "/speculearn/commerces-22.png",
  "commerces-23": "/speculearn/commerces-23.png",
  "commerces-24": "/speculearn/commerces-24.png",
  "commerces-25": "/speculearn/commerces-25.png",
  "commerces-26": "/speculearn/commerces-26.png",
  "commerces-27": "/speculearn/commerces-27.png",
  "commerces-28": "/speculearn/commerces-28.png",
};

export const SPECULEARN_PROMPT_FRAME: Record<string, string> = {
  transport: "Tu y vas comment ?",
};
