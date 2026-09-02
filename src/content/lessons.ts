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
  // Unit 0 since 2026-08-27: the lesson is SIO-001's (Unité 0, Introductions).
  // It was filed under U1 because it also carried age/nationality/family —
  // Unit 1 material — which has now gone back to the stops that own it.
  "se-presenter":      { slug: "se-presenter",      title: "Se présenter",                 unit: 0 },
  // Unit 2 since 2026-08-23 (Dan): the lesson now teaches négation (2)
  // « ne… plus » alongside pas — U2 material in the book; it also joins
  // SIO-028's rail below (Dan: "insert it somewhere as an addition").
  "negation":          { slug: "negation",          title: "La négation",                  unit: 2 },
  "conjugaison-u1":    { slug: "conjugaison-u1",    title: "Conjugaison (Unité 1)",        unit: 1 },
  // Three lessons written 2026-08-28 for stops that promised an ACT and
  // taught only the vocabulary it needed (Dan: "3, 17, 18 fill the content").
  "ca-secrit":            { slug: "ca-secrit",            title: "Comment ça s’écrit ?",        unit: 0 },
  "langues-pays":      { slug: "langues-pays",      title: "On parle quelle langue ?",     unit: 1 },
  "nombres-echanges":  { slug: "nombres-echanges",  title: "Les nombres au quotidien",     unit: 1 },
  "moi-aussi":         { slug: "moi-aussi",         title: "Moi aussi, moi non plus",      unit: 1 },
  "quel-jour":         { slug: "quel-jour",         title: "On est quel jour ?",           unit: 0 },
  "combien":           { slug: "combien",           title: "Il y a combien ?",             unit: 0 },
  "on-fait-quoi":      { slug: "on-fait-quoi",      title: "Pardon, on fait quoi ?",       unit: 0 },
  "qu-est-ce-que-c-est": { slug: "qu-est-ce-que-c-est", title: "Qu’est-ce que c’est ?",  unit: 2 },
  "quelle-matiere":    { slug: "quelle-matiere",    title: "Tu étudies quoi ?",            unit: 1 },
  "au-marche":         { slug: "au-marche",         title: "Au marché",                    unit: 4 },
  "soixante-dix":      { slug: "soixante-dix",      title: "70 à 99",                      unit: 4 },
  "le-chemin":         { slug: "le-chemin",         title: "Demander son chemin",          unit: 3 },
  "ou-est":            { slug: "ou-est",            title: "Où est… ?",                    unit: 3 },
  "avoir-etats":       { slug: "avoir-etats",       title: "Avoir ou être ? — les états",  unit: 1 },
  // Unit 3, not 1: the book teaches est-ce que / qu'est-ce que in U3 (questions (2),
  // book p. 92) — U1's questions are quel + intonation. SIO mapping (SIO-034, u3)
  // was already right; only these gallery labels front-ran the book (audit 1.4).
  "questions-oui-non": { slug: "questions-oui-non", title: "Questions : oui ou non",       unit: 3 },
  "mots-interrogatifs":{ slug: "mots-interrogatifs",title: "Les mots interrogatifs",       unit: 3 },
  "articles-pays":     { slug: "articles-pays",     title: "Les articles des pays",        unit: 1 },
  // SIO-005 / SIO-006, added 2026-08-31 — Unité 0, the two Tier 2 stops that
  // had a deck but no lesson file to hold a concept.
  "colors":            { slug: "colors",            title: "Les couleurs",                 unit: 0 },
  "core-nouns":        { slug: "core-nouns",        title: "Quelques noms",                unit: 0 },
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
  // Written 2026-08-27 because SIO-037 and SIO-048 had no lesson of their own:
  // both opened `modaux`, the vouloir/pouvoir/devoir paradigm table, so two
  // different goals showed the same screen and neither showed its own.
  "pouvoir":           { slug: "pouvoir",           title: "Pouvoir + infinitif",          unit: 3 },
  "conseils":          { slug: "conseils",          title: "Donner un conseil",            unit: 4 },
  "rendezvous":        { slug: "rendezvous",        title: "Proposer, accepter, refuser", unit: 2 },
  "meteo":             { slug: "meteo",             title: "La météo",                     unit: 3 },
  // SIO-039, written 1 Sep — deck-backed stop with no lesson file (handover).
  "envies-besoins":    { slug: "envies-besoins",    title: "Envies et besoins",            unit: 3 },
  "prepositions":      { slug: "prepositions",      title: "Prépositions : pays & villes",  unit: 3 },
  "prepositions-lieux":{ slug: "prepositions-lieux",title: "Prépositions : en ville",       unit: 3 },
  // SIO-038, 2026-09-01 — the last Tier 1 stop with a deck and no lesson file,
  // so its concept had nowhere to live. The deck is three frames (en / à /
  // prendre + article), not twelve nouns.
  "transport":         { slug: "transport",         title: "Comment tu y vas ?",           unit: 3 },
  // SIO-010, 2026-09-01 — the first of the six ateliers to get a lesson file.
  // The slug is the deck's own `lessonSlug` (atelierDecks.ts), so the two names
  // for one stop cannot drift.
  "atelier-rencontre": { slug: "atelier-rencontre", title: "Atelier — Première rencontre", unit: 0 },
  // SIO-025 and SIO-039, 2026-09-01 — the two ordinary Tier 3 stops from colour
  "parce-que":         { slug: "parce-que",         title: "Pourquoi ? Parce que…",        unit: 2 },
  // The five remaining ateliers, 2026-09-01 — same shape as atelier-rencontre:
  // the Mémo is the generated model passed through, and the exercise is the
  // grammar each stop is graded on, out of Dan's reviewed FINALE bank. Slugs
  // are each deck's own `lessonSlug` from atelierDecks.ts.
  "atelier-pays":     { slug: "atelier-pays", title: "Atelier — Présenter un pays", unit: 1 },
  "atelier-email":    { slug: "atelier-email", title: "Atelier — Un petit e-mail", unit: 2 },
  "atelier-itineraire": { slug: "atelier-itineraire", title: "Atelier — L'itinéraire", unit: 3 },
  "atelier-avis-resto": { slug: "atelier-avis-resto", title: "Atelier — Avis de restaurant", unit: 4 },
  "atelier-resto":    { slug: "atelier-resto", title: "Atelier — Au restaurant", unit: 4 },
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
  // SIO-003 promised "or ASK how it is spelled" and taught A-Z; `ca-secrit` is
  // the lesson it never had.
  //
  // SIO-010's atelier PERFORMS « Comment ça s’écrit ? », so it depends on this
  // lesson — but it deliberately does NOT list it. One goal, one lesson
  // (verify27, from #44): a stop that leads with another stop's lesson opens
  // on someone else's screen, which is the fault that rule exists to stop. The
  // atelier meets the phrase in its own model dialogue instead, which is what
  // a production stop opens on.
  "SIO-003": ["ca-secrit"],
  // Its OWN lesson, which is what the note above always allowed: the rule is
  // that a stop must not lead with someone else's screen, not that a production
  // stop may not have one. The Mémo it opens on is still the model dialogue —
  // see atelier-rencontre.tsx for why that had to be passed through rather
  // than written.
  "SIO-010": ["atelier-rencontre"],
  "SIO-025": ["parce-que"],
  "SIO-020": ["atelier-pays"],
  "SIO-030": ["atelier-email"],
  "SIO-040": ["atelier-itineraire"],
  "SIO-049": ["atelier-avis-resto"],
  "SIO-050": ["atelier-resto"],
  "SIO-004": ["quel-jour"],
  "SIO-007": ["combien"],
  "SIO-008": ["on-fait-quoi"],
  "SIO-011": ["moi-aussi"],
  "SIO-021": ["qu-est-ce-que-c-est"],
  "SIO-035": ["ou-est"],
  "SIO-036": ["le-chemin"],
  "SIO-038": ["transport"],
  "SIO-013": ["quelle-matiere"],
  "SIO-044": ["au-marche"],
  "SIO-045A": ["soixante-dix"],
  "SIO-017": ["langues-pays"],
  "SIO-018": ["nombres-echanges"],
  "SIO-009": ["salutations"],
  "SIO-005": ["colors"],
  "SIO-006": ["core-nouns"],
  "SIO-012": ["professions"],
  "SIO-016": ["nationalities"],
  // se-presenter dropped 2026-08-27: it earned this row by teaching être +
  // agreement through nationality, which is SIO-016's job and has moved back
  // there. conjugaison-u1 LEADS — it drills être in all persons, which is this
  // stop's promise; dropping se-presenter left negation first by accident, so
  // "Subject pronouns + ÊTRE" opened a negation lesson. negation stays second
  // (this stop also meets « ne … pas »), and SIO-028 owns it outright.
  "SIO-014": ["conjugaison-u1", "negation"],
  "SIO-028": ["negation"],
  // avoir-etats FIRST: the SIO's grammar is avoir-vs-être states + age, not
  // the paradigm tables (Dan, 2026-07-08: "the avoir SIO doesn't match").
  "SIO-019": ["avoir-etats", "conjugaison-u1"],
  "SIO-015": ["articles-pays"],
  "SIO-034": ["questions-oui-non", "mots-interrogatifs"],
  "SIO-022": ["possessifs"],
  "SIO-023": ["aimer", "aimer-infinitif", "conjugaison-er"],
  "SIO-024": ["faire"],
  "SIO-026": ["aller"],
  "SIO-027": ["quand"],
  "SIO-029": ["rendezvous", "modaux"], // vouloir forms live in the modaux lesson
  // Its own lesson now; modaux stays second as the paradigm reference.
  "SIO-037": ["pouvoir", "modaux"],
  "SIO-039": ["envies-besoins"],
  "SIO-047": ["futur-proche", "modaux"],
  "SIO-048": ["conseils", "modaux"],
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
