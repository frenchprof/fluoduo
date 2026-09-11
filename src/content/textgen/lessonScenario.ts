/**
 * WHICH LISTENING TEXT BELONGS TO WHICH LESSON.
 *
 * Dan, 2026-09-08, laying out the swipe chain: *"WorDrill — swipe left for
 * ÉcouText for that lesson"*. Until now there was no such thing: ÉcouTexte is
 * a TOPIC PICKER over fifteen scenarios, three per unit, and a learner arriving
 * from a lesson landed on whatever the dropdown happened to be showing.
 *
 * WHY A TABLE AND NOT A RULE. The unit is derived — a stop knows its own —
 * but which of that unit's three scenarios fits a lesson is a judgement about
 * CONTENT, and there is no field on a stop that answers it. SIO-036 is
 * « Directions + ordinal numbers » and wants the itinerary; SIO-031 is
 * « Weather » and wants the text about a town. Nothing derivable separates
 * those two, so they are written down, once, here.
 *
 * FIFTY LESSONS ONTO FIFTEEN TEXTS, which is the shape of the thing rather
 * than a compromise: a unit's three scenarios are the three situations that
 * unit teaches, and its ten lessons are the pieces those situations are made
 * of. Three or four lessons share a scenario and each meets it having been
 * taught a different part of it.
 *
 * The generator never repeats a sentence it has played (lib/textgen/heard), so
 * sharing a scenario does not mean sharing a text.
 */
import { SIOS } from "@/content/sios";

/** Stop id -> the scenario within that stop's own unit. */
const SCENARIO: Record<string, string> = {
  // ── Unité 0 · meeting people, and the first class ──────────────────────
  "SIO-001": "la-rencontre",      // Introductions
  "SIO-002": "la-rencontre",      // Tu / Vous — the register you meet someone in
  "SIO-003": "le-premier-cours",  // Alphabet — spelling a name out in class
  "SIO-004": "le-premier-cours",  // Days + moments — the timetable
  "SIO-005": "qui-est-ce",        // Colours — describing what you can see
  "SIO-006": "le-premier-cours",  // Some nouns — the things on the desk
  "SIO-007": "le-premier-cours",  // Numbers 0–20 — how many in the room
  "SIO-008": "le-premier-cours",  // Classroom instructions
  "SIO-009": "la-rencontre",      // Greetings
  "SIO-010": "la-rencontre",      // First meeting role-play
  // ── Unité 1 · who people are ───────────────────────────────────────────
  "SIO-011": "cest-qui",          // Stressed pronouns — moi, toi, lui
  "SIO-012": "cest-qui",          // Professions
  "SIO-013": "le-camarade",       // School subjects
  "SIO-014": "ma-presentation",   // Subject pronouns + ÊTRE
  "SIO-015": "ma-presentation",   // Countries
  "SIO-016": "ma-presentation",   // Nationalities
  "SIO-017": "ma-presentation",   // Languages
  "SIO-018": "le-camarade",       // Numbers 20–69 — ages
  "SIO-019": "le-camarade",       // Avoir — age and states
  "SIO-020": "ma-presentation",   // Mini-text: present a country
  // ── Unité 2 · what you do, and asking someone along ────────────────────
  "SIO-021": "mes-loisirs",       // Everyday objects
  "SIO-022": "mes-loisirs",       // Possessives — mine, yours
  "SIO-023": "mes-loisirs",       // Leisure activities
  "SIO-024": "le-week-end",       // faire + activities
  "SIO-025": "l-invitation",      // pourquoi ? parce que — accepting, refusing
  "SIO-026": "le-week-end",       // aller + destinations
  "SIO-027": "le-week-end",       // Time — when I do it
  "SIO-028": "l-invitation",      // Négation — saying no
  "SIO-029": "l-invitation",      // vouloir — invite, accept, refuse
  "SIO-030": "l-invitation",      // Well wishes + connectors for a short email
  // ── Unité 3 · finding your way round a town ────────────────────────────
  "SIO-031": "mon-lieu",          // Weather
  "SIO-032": "le-voyage",         // en / au / aux — countries and cities
  "SIO-033": "mon-lieu",          // Places in town
  "SIO-034": "itineraire",        // Question words — asking the way
  "SIO-035": "mon-lieu",          // Locating places
  "SIO-036": "itineraire",        // Directions + ordinal numbers
  "SIO-037": "mon-lieu",          // pouvoir — what one can do, and where
  "SIO-038": "le-voyage",         // Transport
  "SIO-039": "le-voyage",         // Wants and needs
  "SIO-040": "itineraire",        // Describe itinerary steps
  // ── Unité 4 · eating, shopping, ordering ───────────────────────────────
  "SIO-041": "mes-repas",         // Aliments + meals
  "SIO-042": "mes-repas",         // Partitives + manger / boire
  "SIO-043": "mes-repas",         // Frequency adverbs
  "SIO-044": "les-courses",       // Commerces
  "SIO-045": "les-courses",       // Numbers 70–99 — prices
  "SIO-046": "les-courses",       // Demonstratives — ce / cette at the market
  "SIO-047": "au-restaurant",     // Making plans
  "SIO-048": "au-restaurant",     // Giving advice
  "SIO-049": "au-restaurant",     // Reviewing a restaurant
  "SIO-050": "au-restaurant",     // Role-play: restaurant scene
};

/** The listening text a stop opens on: its own unit, and one of that unit's
 *  three scenarios. Null for a stop with no entry — the caller then shows the
 *  picker rather than guessing. */
export function lessonListening(sioId: string): { unit: number; scenario: string } | null {
  const scenario = SCENARIO[sioId];
  if (!scenario) return null;
  const stop = SIOS.find((s) => s.id === sioId);
  if (!stop) return null;
  return { unit: stop.unit, scenario };
}

/** Every stop id this table covers — the check reads it rather than a count. */
export const LISTENING_STOPS = Object.keys(SCENARIO);
