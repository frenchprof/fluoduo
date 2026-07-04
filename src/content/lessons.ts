/**
 * Grammar lessons, all NATIVE in-app content (converted 2026-07-04 from the
 * frenchwithdrchan imports — see content/lessons/native/). Each is Mémo +
 * 🎲 dice trainer + EN→FR bonus; linked from the matching SIO where one
 * exists (LESSONS_BY_SIO) and all reachable from the /lessons gallery.
 */

export type Lesson = { slug: string; title: string; unit: number };

export const LESSONS: Record<string, Lesson> = {
  "se-presenter":      { slug: "se-presenter",      title: "Se présenter",                 unit: 1 },
  "negation":          { slug: "negation",          title: "La négation",                  unit: 1 },
  "conjugaison-u1":    { slug: "conjugaison-u1",    title: "Conjugaison (Unité 1)",        unit: 1 },
  "questions-oui-non": { slug: "questions-oui-non", title: "Questions : oui ou non",       unit: 1 },
  "mots-interrogatifs":{ slug: "mots-interrogatifs",title: "Les mots interrogatifs",       unit: 1 },
  "articles-pays":     { slug: "articles-pays",     title: "Les articles des pays",        unit: 1 },
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
  "prepositions":      { slug: "prepositions",      title: "Prépositions : de & à",        unit: 3 },
  "revision-u3u4":     { slug: "revision-u3u4",     title: "Révision — Unités 3 & 4",      unit: 3 },
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
  "SIO-014": ["se-presenter", "negation", "conjugaison-u1"],
  "SIO-019": ["conjugaison-u1"], // avoir: L03 covers s'appeler, être, avoir
  "SIO-015": ["articles-pays"],
  "SIO-035": ["questions-oui-non", "mots-interrogatifs"],
  "SIO-022": ["possessifs"],
  "SIO-023": ["aimer", "aimer-infinitif", "conjugaison-er"],
  "SIO-024": ["faire"],
  "SIO-026": ["aller"],
  "SIO-027": ["quand"],
  "SIO-029": ["rendezvous"],
  "SIO-037": ["modaux"],
  "SIO-048": ["modaux", "futur-proche"],
  "SIO-032": ["prepositions"],
  "SIO-042": ["partitifs"],
  "SIO-043": ["partitifs"],
  "SIO-044": ["manger-boire"],
  "SIO-045": ["frequence"],
  "SIO-046": ["demonstratifs"],
};

export const ALL_LESSONS: Lesson[] = Object.values(LESSONS);

/** All lessons attached to a SIO (empty if none). */
export function lessonsForSio(sioId: string): Lesson[] {
  return (LESSONS_BY_SIO[sioId] ?? []).map((slug) => LESSONS[slug]).filter(Boolean);
}
