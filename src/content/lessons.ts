/**
 * Grammar lessons ported from the frenchwithdrchan worker (Dan, 2026-07-03).
 * The originals are password-gated (a matric-number allowlist) on that site, so
 * students can't reach them; the recovered, gate-/tracker-stripped HTML lives in
 * /public/lessons and is served inside FluoLingo behind the app's own sign-in
 * (see /lessons/[slug] and the /lessons gallery). Each is a self-contained
 * lesson; most feature the 🎲 "dice" sentence-generator exercise. Linked from
 * the matching SIO where one exists (LESSON_BY_SIO — a best-guess mapping, easy
 * to adjust), and all reachable from the gallery.
 */

export type Lesson = { slug: string; file: string; title: string; unit: number };

export const LESSONS: Record<string, Lesson> = {
  "se-presenter":      { slug: "se-presenter",      file: "01-se-presenter.html",      title: "Se présenter",                 unit: 1 },
  "negation":          { slug: "negation",          file: "02-negation.html",          title: "La négation",                  unit: 1 },
  "conjugaison-u1":    { slug: "conjugaison-u1",    file: "03-conjugaison-u1.html",    title: "Conjugaison (Unité 1)",        unit: 1 },
  "questions-oui-non": { slug: "questions-oui-non", file: "04-questions-oui-non.html", title: "Questions : oui ou non",       unit: 1 },
  "mots-interrogatifs":{ slug: "mots-interrogatifs",file: "05-mots-interrogatifs.html",title: "Les mots interrogatifs",       unit: 1 },
  "articles-pays":     { slug: "articles-pays",     file: "06-articles-pays.html",     title: "Les articles des pays",        unit: 1 },
  "revision-u1":       { slug: "revision-u1",       file: "07-revision-u1.html",       title: "Révision — Unité 1",           unit: 1 },
  "aimer":             { slug: "aimer",             file: "08-aimer-le-la-les.html",   title: "Aimer + le / la / les",        unit: 2 },
  "faire":             { slug: "faire",             file: "09-faire-du-de-la.html",    title: "Faire + du / de la",           unit: 2 },
  "aimer-infinitif":   { slug: "aimer-infinitif",   file: "10-aimer-infinitif.html",   title: "Aimer + infinitif",            unit: 2 },
  "aller":             { slug: "aller",             file: "11-aller-a.html",           title: "Aller à + lieu",               unit: 2 },
  "quand":             { slug: "quand",             file: "12-quand.html",             title: "Quand ? Quel moment ?",        unit: 2 },
  "possessifs":        { slug: "possessifs",        file: "13-possessifs.html",        title: "Les adjectifs possessifs",     unit: 2 },
  "conjugaison-er":    { slug: "conjugaison-er",    file: "14-conjugaison-er.html",    title: "Conjugaison : -er, faire, aller", unit: 2 },
  "modaux":            { slug: "modaux",            file: "15-modaux.html",            title: "Modaux : vouloir, pouvoir",    unit: 2 },
  "rendezvous":        { slug: "rendezvous",        file: "16-rendezvous-revision.html",title: "Proposer, accepter, refuser", unit: 2 },
  "prepositions":      { slug: "prepositions",      file: "17-prepositions.html",      title: "Prépositions : de & à",        unit: 3 },
  "revision-u3u4":     { slug: "revision-u3u4",     file: "18-revision-u3u4.html",     title: "Révision — Unités 3 & 4",      unit: 3 },
  "partitifs":         { slug: "partitifs",         file: "19-partitifs.html",         title: "Les articles partitifs",       unit: 4 },
  "manger-boire":      { slug: "manger-boire",      file: "20-manger-boire.html",      title: "Manger & boire",               unit: 4 },
  "futur-proche":      { slug: "futur-proche",      file: "21-futur-proche.html",      title: "Le futur proche",              unit: 4 },
  "frequence":         { slug: "frequence",         file: "22-frequence.html",         title: "Les adverbes de fréquence",    unit: 4 },
  "demonstratifs":     { slug: "demonstratifs",     file: "23-demonstratifs.html",     title: "Les adjectifs démonstratifs",  unit: 4 },
  "revision-u4":       { slug: "revision-u4",       file: "24-revision-u4.html",       title: "Révision — Unité 4",           unit: 4 },
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
