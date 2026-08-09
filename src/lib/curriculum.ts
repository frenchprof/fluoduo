/**
 * The curriculum spine — deck ↔ outcome ↔ item ↔ journey position.
 *
 * ONE index, built once, imported by everything that needs to know where a
 * thing sits in the course. Before this there were two: `labels.ts` and
 * `evidence.ts` each built their own `deckToSio` map from the same source, and
 * they had already drifted — only one of them resolved the `-letris` packaging
 * suffix, so the same deck answered differently depending on which module you
 * asked. That is the fourth time this codebase has grown a second copy of one
 * idea (gapSentence, labelActivity, hrefFor, and now this). The cure is the
 * same each time: one definition, imported.
 *
 * MEMBERSHIP, NOT SPELLING. `outcomeForItem` used to resolve deck items with
 * `itemId.startsWith(collectionId + "-")` — inside a file whose own header says
 * "never by parsing the id". Four decks author ids that don't begin with their
 * deck name (`nat-01-france` in `nationalities`, `num-70` in `numbers-70-99`,
 * `negpas-01` in `negation-pas`, `directions-full-01` in `directions-matching`),
 * so 84 of 806 curated items — one in ten — resolved to no outcome at all, and
 * clustered: a learner weak on numbers or nationalities saw a whole screen of
 * bare ids. This module indexes actual deck membership instead. Verified: no
 * item id is claimed by two decks, so the mapping is unambiguous.
 *
 * JOURNEY POSITION. Dan, 2026-08-10: "by right everything belongs to somewhere
 * along the learning journey levels of the map… we can label everything such
 * that we can sort them by what they should have looked like chronologically."
 * Every outcome has a unit and a sequence number, so every deck, item, route
 * and activity that resolves to an outcome inherits one. The handful that
 * genuinely span the whole course (ConjugaZone, DéjàRevu) or sit outside it
 * (Accueil, My Progress) get named tail buckets rather than a pretended
 * position — a wrong chronology would be worse than an honest "everywhere".
 */
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";

/** Where something sits on the learner's path. Sorts naturally by `key`. */
export type Journey = {
  /** 0–4, or the tail buckets below. */
  unit: number;
  /** Position within the unit. 0 = the unit itself, then SIO order. */
  seq: number;
  /** Sortable scalar: unit-major, sequence-minor. */
  key: number;
  /** What to show when the journey position is the label, e.g. "Unité 3". */
  band: string;
};

/** Spans every unit — conjugation drill, review queue. Not a position. */
export const UNIT_ALL = 98;
/** Outside the curriculum — home, profile, the teacher dashboard itself. */
export const UNIT_APP = 99;

function journey(unit: number, seq: number): Journey {
  const band =
    unit === UNIT_ALL ? "Toutes unités" : unit === UNIT_APP ? "Application" : `Unité ${unit}`;
  return { unit, seq, key: unit * 1000 + seq, band };
}

export const JOURNEY_ALL = journey(UNIT_ALL, 0);
export const JOURNEY_APP = journey(UNIT_APP, 0);

/** The unit's own hub page sorts ahead of everything taught in it. */
export function journeyForUnit(unit: number): Journey {
  return journey(unit, 0);
}

// ── indexes, built once ─────────────────────────────────────────────────────

type Idx = {
  deckToSio: Map<string, string>;
  itemToDeck: Map<string, string>;
  sioJourney: Map<string, Journey>;
};
let idx: Idx | null = null;

function build(): Idx {
  if (idx) return idx;
  const deckToSio = new Map<string, string>();
  const sioJourney = new Map<string, Journey>();
  for (const s of SIOS) {
    if (s.collectionId) deckToSio.set(s.collectionId, s.id);
    // `num` is the spec's 1..50 running order, which IS the taught order.
    sioJourney.set(s.id, journey(s.unit, s.num));
  }
  const itemToDeck = new Map<string, string>();
  for (const c of CURATED) {
    for (const it of c.items ?? []) {
      const id = (it as { id?: string })?.id;
      if (id && !itemToDeck.has(id)) itemToDeck.set(id, c.id);
    }
  }
  idx = { deckToSio, itemToDeck, sioJourney };
  return idx;
}

/**
 * Deck id → outcome. `-letris` is a VocabulaRain packaging detail and the
 * game's route drops it again, so the id is tried both ways: neither spelling
 * should read as unknown.
 */
export function sioForDeck(deckId: string): string | undefined {
  if (!deckId) return undefined;
  const { deckToSio } = build();
  const bare = deckId.replace(/-letris$/, "");
  return deckToSio.get(deckId) ?? deckToSio.get(bare) ?? deckToSio.get(`${deckId}-letris`);
}

/** Item id → the deck that actually contains it. */
export function deckForItem(itemId: string): string | undefined {
  if (!itemId) return undefined;
  return build().itemToDeck.get(itemId);
}

/** Item id → outcome, by membership. Undefined when the item is in no deck. */
export function sioForItem(itemId: string): string | undefined {
  const deck = deckForItem(itemId);
  return deck ? sioForDeck(deck) : undefined;
}

export function journeyForSio(sio: string | undefined): Journey | undefined {
  return sio ? build().sioJourney.get(sio) : undefined;
}

/**
 * Surfaces with no deck of their own, placed by what they teach.
 *
 * NumBus and NumBourse drill numbers, so they belong with the number outcomes —
 * the earliest one, since that is when a learner first meets them. WorDrill
 * without a deck is pronunciation practice, which starts at the alphabet.
 * ConjugaZone and DéjàRevu genuinely span the course.
 */
const SURFACE_SIO: Record<string, string> = {
  NumBus: "SIO-007", // Numbers 0–20, Unité 0
  NumBourse: "SIO-007",
  WorDrill: "SIO-003", // Alphabet, Unité 0
  "Say It": "SIO-003",
};
// Surfaces that genuinely run the whole course: the drill galleries (a
// gallery is every deck at once), the review queue, the conjugation trainer,
// the tutor, and the Finale — which draws from all fifty outcomes by design.
const SURFACE_ALL = new Set([
  "ConjugaZone",
  "DéjàRevu",
  "ChaTutor",
  "GramMarathon Final",
  "SpecuLearn",
  "VocabulaRain",
  "LexicaLater",
  "Flip It",
  "Complete It",
  "Dice",
  "GramMarathon",
  "Compose It",
  "Matching",
  "ÉcouTexte",
  "Pretest",
  "Picture pretest",
  "VoixLà",
  "Deck MCQ",
]);
const SURFACE_APP = new Set([
  "Accueil",
  "My Progress",
  "Teacher",
  "Index",
  "Leaderboard",
  "Profile",
  "Deck",
  "Leçon",
  "Guide",
  "À propos",
  "VocabulaRain (hi-scores)",
]);

/** Journey position for an activity NAME when no deck narrowed it down. */
export function journeyForSurface(name: string): Journey | undefined {
  if (SURFACE_ALL.has(name)) return JOURNEY_ALL;
  if (SURFACE_APP.has(name)) return JOURNEY_APP;
  const sio = SURFACE_SIO[name];
  return sio ? journeyForSio(sio) : undefined;
}

/** Sort comparator: chronological along the journey, unknowns last. */
export function byJourney<T>(get: (x: T) => Journey | undefined) {
  return (a: T, b: T) => (get(a)?.key ?? Number.MAX_SAFE_INTEGER) - (get(b)?.key ?? Number.MAX_SAFE_INTEGER);
}
