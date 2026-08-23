/**
 * Grammar lessons, all NATIVE in-app content (converted 2026-07-04 from the
 * frenchwithdrchan imports — see content/lessons/native/). Each is Mémo +
 * 🎲 dice trainer + EN→FR bonus; linked from the matching SIO where one
 * exists (LESSONS_BY_SIO) and all reachable from the /lessons gallery.
 */

export type Lesson = { slug: string; title: string; unit: number };

export const LESSONS: Record<string, Lesson> = {
  "tu-vous":           { slug: "tu-vous",           title: "Tu ou vous ?",                 unit: 0 },
  "salutations":       { slug: "salutations",       title: "Les salutations",              unit: 0 },
  "se-presenter":      { slug: "se-presenter",      title: "Se présenter",                 unit: 1 },
  "negation":          { slug: "negation",          title: "La négation",                  unit: 1 },
  "conjugaison-u1":    { slug: "conjugaison-u1",    title: "Conjugaison (Unité 1)",        unit: 1 },
  "avoir-etats":       { slug: "avoir-etats",       title: "Avoir ou être ? — les états",  unit: 1 },
  // Unit 3, not 1: the book teaches est-ce que / qu'est-ce que in U3 (questions (2),
  // book p. 92) — U1's questions are quel + intonation. SIO mapping (SIO-035, u3)
  // was already right; only these gallery labels front-ran the book (audit 1.4).
  "questions-oui-non": { slug: "questions-oui-non", title: "Questions : oui ou non",       unit: 3 },
  "mots-interrogatifs":{ slug: "mots-interrogatifs",title: "Les mots interrogatifs",       unit: 3 },
  "articles-pays":     { slug: "articles-pays",     title: "Les articles des pays",        unit: 1 },
  "professions":       { slug: "professions",       title: "Les professions",              unit: 1 },
  "nationalities":     { slug: "nationalities",     title: "Les nationalités",             unit: 1 },
  "revision-u1":       { slug: "revision-u1",       title: "Révision — Unité 1",           unit: 1 },
  "aimer":             { slug: "aimer",             title: "Aimer + le / la / les",        unit: 2 },
  "faire":             { slug: "faire",             title: "Faire + du / de la",           unit: 2 },
  "aimer-infinitif":   { slug: "aimer-infinitif",   title: "Aimer + infinitif",            unit: 2 },
  "aller":             { slug: "aller",             title: "Aller à + lieu",               unit: 2 },
  "quand":             { slug: "quand",             title: "Quand ? Quel moment ?",        unit: 2 },
  "possessifs":        { slug: "possessifs",        title: "Les adjectifs possessifs",     unit: 2 },
  "conjugaison-er":    { slug: "conjugaison-er",    title: "Conjugaison : -er, faire, aller", unit: 2 },
  "modaux":            { slug: "modaux",            title: "Modaux : vouloir, pouvoir",    unit: 2 },
  "rendezvous":        { slug: "rendezvous",        title: "Proposer, accepter, refuser", unit: 2 },
  "meteo":             { slug: "meteo",             title: "La météo",                     unit: 3 },
  "prepositions":      { slug: "prepositions",      title: "Prépositions : pays & villes",  unit: 3 },
  "prepositions-lieux":{ slug: "prepositions-lieux",title: "Prépositions : en ville",       unit: 3 },
  "revision-u3u4":     { slug: "revision-u3u4",     title: "Révision — Unités 3 & 4",      unit: 3 },
  "aliments":          { slug: "aliments",          title: "Les repas & les aliments",     unit: 4 },
  "partitifs":         { slug: "partitifs",         title: "Les articles partitifs",       unit: 4 },
  "manger-boire":      { slug: "manger-boire",      title: "Manger & boire",               unit: 4 },
  "futur-proche":      { slug: "futur-proche",      title: "Le futur proche",              unit: 4 },
  "frequence":         { slug: "frequence",         title: "Les adverbes de fréquence",    unit: 4 },
  "demonstratifs":     { slug: "demonstratifs",     title: "Les adjectifs démonstratifs",  unit: 4 },
  "revision-u4":       { slug: "revision-u4",       title: "Révision — Unité 4",           unit: 4 },
};

/**
 * SIO id → the lesson(s) that teach its grammar (best-guess; adjust freely).
 * A SIO can have several lessons, and a lesson can sit under several SIOs.
 * Lessons are reached from their SIO's popup; the two cross-unit revisions
 * (revision-u1, revision-u3u4) have no single SIO home and live in the gallery.
 */
export const LESSONS_BY_SIO: Record<string, string[]> = {
  "SIO-001": ["se-presenter", "conjugaison-u1"], // s'appeler: taught in L01 + L03
  "SIO-002": ["tu-vous"],
  "SIO-009": ["salutations"],
  "SIO-012": ["professions"],
  "SIO-016": ["nationalities"],
  "SIO-014": ["se-presenter", "negation", "conjugaison-u1"],
  // avoir-etats FIRST: the SIO's grammar is avoir-vs-être states + age, not
  // the paradigm tables (Dan, 2026-07-08: "the avoir SIO doesn't match").
  "SIO-019": ["avoir-etats", "conjugaison-u1"],
  "SIO-015": ["articles-pays"],
  "SIO-035": ["questions-oui-non", "mots-interrogatifs"],
  "SIO-022": ["possessifs"],
  "SIO-023": ["aimer", "aimer-infinitif", "conjugaison-er"],
  "SIO-024": ["faire"],
  "SIO-026": ["aller"],
  "SIO-027": ["quand"],
  "SIO-029": ["rendezvous", "modaux"], // vouloir forms live in the modaux lesson
  "SIO-037": ["modaux"],
  "SIO-047": ["futur-proche", "modaux"],
  "SIO-048": ["modaux"],
  "SIO-031": ["meteo"],
  "SIO-032": ["prepositions"],
  "SIO-033": ["prepositions-lieux"],
  "SIO-041": ["aliments"],
  "SIO-042": ["partitifs", "manger-boire"],
  "SIO-043": ["frequence"],
  "SIO-046": ["demonstratifs"],
};

export const ALL_LESSONS: Lesson[] = Object.values(LESSONS);

/** All lessons attached to a SIO (empty if none). */
export function lessonsForSio(sioId: string): Lesson[] {
  return (LESSONS_BY_SIO[sioId] ?? []).map((slug) => LESSONS[slug]).filter(Boolean);
}

/* Lessons are PART of their SIO's flow, not standalone (Dan, 2026-07-04:
 * "they should merge with the SIOs that refer to the same skills") — the two
 * reverse maps below let the deck tab rail carry a Lesson tab and the lesson
 * page carry the deck's activity tabs. */
import { SIOS } from "@/content/sios";

/** Lessons for a deck: via the SIO(s) whose collectionId is this deck. */
export function lessonsForDeck(collectionId: string): Lesson[] {
  const out: Lesson[] = [];
  for (const s of SIOS) {
    if (s.collectionId !== collectionId) continue;
    for (const l of lessonsForSio(s.id)) if (!out.includes(l)) out.push(l);
  }
  return out;
}

/** The deck a lesson belongs to (first SIO that lists it), or null. */
export function deckForLesson(slug: string): string | null {
  for (const [sioId, slugs] of Object.entries(LESSONS_BY_SIO)) {
    if (!slugs.includes(slug)) continue;
    const sio = SIOS.find((s) => s.id === sioId);
    if (sio?.collectionId) return sio.collectionId;
  }
  return null;
}
