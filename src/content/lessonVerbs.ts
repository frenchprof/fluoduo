/**
 * WHICH VERBS A LESSON CONJUGATES.
 *
 * Dan, 2026-09-08: *"ConjugaZone page would land on the same single conjugazone
 * page but land on the particular verbs that we have assigned for that
 * lesson"*, then *"Split the current verbs into the 50 lessons"*. Approved
 * 2026-09-11. Every one of ConjugaZone's 67 verbs belongs to exactly one
 * lesson, so `/conjugaison?deck=<lesson>` opens on that lesson's own drill
 * instead of the default être / avoir / aller.
 *
 * HOW THEY WERE PLACED, in the order Dan gave the rules:
 *
 *   · SIXTEEN PLACE THEMSELVES. The lesson's own deck, topic or competence
 *     names the verb — SIO-026 IS « aller + article contraction ».
 *   · THE FIRST TEN STOPS TAKE -ER VERBS ONLY, with `connaître` as the single
 *     exception Dan allowed, at SIO-010, where « Tu connais Marc ? » is the
 *     role-play itself.
 *   · SIO-002 TO SIO-009 CARRY NOTHING AT ALL. Alphabet, colours, numbers and
 *     nouns are where a learner meets words, not conjugations.
 *   · EVERYTHING ELSE by two questions in order — which lesson already has a
 *     verb that conjugates the same way, and can this verb actually be used in
 *     that lesson\'s subject. Where those disagreed, the subject won.
 *
 * TEN LESSONS HAVE NO VERBS, and that is a decision rather than a gap: the
 * rail SKIPS the ConjugaZone column for them (`has` in lib/swipeRail.ts), so a
 * learner swiping left off ÉcouTexte on SIO-003 is not shown an empty drill.
 *
 * THE TIER IS NOT USED BY THE DRILL YET. Dan asked which verbs in a lesson are
 * essential and which only good to know; it is recorded here because that is
 * where the judgement was made, and a later ladder (essential first, the rest
 * behind a "more" control) needs it to already exist rather than to be
 * reconstructed from scratch.
 */
import { VERBS } from "@/content/conjugaison";

export type LessonVerb = { id: string; tier: "essential" | "good" };

/** Stop id -> the verbs that stop conjugates, in teaching order. */
export const LESSON_VERBS: Record<string, LessonVerb[]> = {
  // ── Unité 0 · meeting people, and the first class ───────────
  "SIO-001": [{ id: "sappeler", tier: "essential" }],                       // Introductions
  "SIO-002": [],                                                            // Tu / Vous
  "SIO-003": [],                                                            // Alphabet
  "SIO-004": [],                                                            // Days + moments
  "SIO-005": [],                                                            // Colours
  "SIO-006": [],                                                            // Some nouns
  "SIO-007": [],                                                            // Numbers 0–20
  "SIO-008": [],                                                            // Classroom instructions
  "SIO-009": [],                                                            // Greetings
  "SIO-010": [  // First meeting role-play
    { id: "demander", tier: "essential" },// demander — Je demande son nom — the whole role-play in one 
    { id: "connaitre", tier: "essential" },// connaître — Tu connais Marc ? — Enchanté. The one irregular 
  ],
  // ── Unité 1 · who people are ────────────────────────────────
  "SIO-011": [],                                                            // Stressed pronouns
  "SIO-012": [{ id: "travailler", tier: "essential" }],                     // Professions
  "SIO-013": [{ id: "etudier", tier: "essential" }],                        // School subjects — les matières
  "SIO-014": [{ id: "etre", tier: "essential" }],                           // Subject pronouns + ÊTRE
  "SIO-015": [],                                                            // Countries
  "SIO-016": [{ id: "habiter", tier: "essential" }],                        // Nationalities
  "SIO-017": [{ id: "parler", tier: "essential" }],                         // Languages
  "SIO-018": [{ id: "donner", tier: "good" }],                              // Numbers 20–69
  "SIO-019": [{ id: "avoir", tier: "essential" }],                          // Avoir — age & states
  "SIO-020": [{ id: "decouvrir", tier: "good" }],                           // Mini-text: present a country
  // ── Unité 2 · what you do, and asking someone along ─────────
  "SIO-021": [  // Everyday objects — c'est un… / ce 
    { id: "utiliser", tier: "good" },   // utiliser — J'utilise un stylo, une gomme.
    { id: "porter", tier: "essential" },// porter — Je porte un sac — an object you carry.
  ],
  "SIO-022": [  // Possessives
    { id: "perdre", tier: "good" },     // perdre — Je perds mon stylo.
    { id: "oublier", tier: "essential" },// oublier — J'oublie mon sac — what happens to possessions.
  ],
  "SIO-023": [  // Leisure activities — j'aime, j'ado
    { id: "aimer", tier: "essential" }, // aimer — J'aime, j'adore — the lesson IS this verb.
    { id: "regarder", tier: "essential" },// regarder — Je regarde un film.
    { id: "jouer", tier: "essential" }, // jouer — Je joue au foot.
    { id: "ecouter", tier: "essential" },// écouter — J'écoute de la musique — the fourth leisure verb
  ],
  "SIO-024": [  // faire + article contraction
    { id: "faire", tier: "essential" }, // faire — faire + article contraction. The lesson IS this 
    { id: "lire", tier: "essential" },  // lire — Je lis / je fais de la lecture — the same act, t
  ],
  "SIO-025": [  // pourquoi ? parce que
    { id: "comprendre", tier: "essential" },// comprendre — Je ne comprends pas pourquoi.
    { id: "apprendre", tier: "essential" },// apprendre — J'apprends parce que c'est utile.
  ],
  "SIO-026": [  // aller + article contraction
    { id: "aller", tier: "essential" }, // aller — aller + article contraction. The lesson IS this 
    { id: "courir", tier: "good" },     // courir — Je cours au parc — going, under your own steam.
  ],
  "SIO-027": [  // Time — when I do it
    { id: "commencer", tier: "essential" },// commencer — Je commence à huit heures.
    { id: "finir", tier: "essential" }, // finir — Je finis à cinq heures — the other end of the cl
  ],
  "SIO-028": [  // Négation — pas de ou pas le ?
    { id: "adorer", tier: "essential" },// adorer — J'adore / je n'adore pas — negation on a known v
    { id: "detester", tier: "essential" },// détester — Je déteste / je ne déteste pas.
  ],
  "SIO-029": [  // vouloir — invite, accept, refuse, 
    { id: "vouloir", tier: "essential" },// vouloir — vouloir — invite, accept, refuse. The lesson IS 
    { id: "pouvoir", tier: "essential" },// pouvoir — Je ne peux pas, désolé — refusing.
  ],
  "SIO-030": [  // Well wishes + connectors for a sho
    { id: "dire", tier: "essential" },  // dire — Je dis merci, je dis bonne chance.
    { id: "ecrire", tier: "essential" },// écrire — J'écris un petit mot — the email this lesson is 
  ],
  // ── Unité 3 · finding your way round a town ─────────────────
  "SIO-031": [{ id: "couvrir", tier: "good" }],                             // Weather
  "SIO-032": [  // en / au / aux / à — prepositions f
    { id: "venir", tier: "essential" }, // venir — Je viens de Paris — en / au / aux.
    { id: "revenir", tier: "good" },    // revenir — Je reviens de Paris — venir's own family, one le
  ],
  "SIO-033": [{ id: "chercher", tier: "essential" }],                       // Places in town
  "SIO-034": [{ id: "savoir", tier: "essential" }],                         // Yes/no and open-ended questions
  "SIO-035": [{ id: "descendre", tier: "good" }],                           // Locating places + article contract
  "SIO-036": [  // Directions + ordinal numbers
    { id: "sortir", tier: "essential" },// sortir — Je sors de la gare, première rue à droite.
    { id: "arreter", tier: "good" },    // arrêter — Arrêtez-vous au feu — a step in the directions.
  ],
  "SIO-037": [  // pouvoir — what one can do (+ where
    { id: "ouvrir", tier: "good" },     // ouvrir — Le magasin ouvre à neuf heures.
    { id: "fermer", tier: "good" },     // fermer — …et il ferme à sept heures. The pair, one drill.
  ],
  "SIO-038": [  // Getting around — en train, à vélo 
    { id: "prendre", tier: "essential" },// prendre — Je prends le train.
    { id: "attendre", tier: "essential" },// attendre — J'attends le bus — the other half of taking one.
  ],
  "SIO-039": [{ id: "acheter", tier: "essential" }],                        // Wants and needs
  "SIO-040": [  // Describe itinerary steps with conn
    { id: "arriver", tier: "essential" },// arriver — J'arrive à la gare, puis je tourne à gauche.
    { id: "partir", tier: "essential" },// partir — Je pars de la place — the other end of the same 
  ],
  // ── Unité 4 · eating, shopping, ordering ────────────────────
  "SIO-041": [  // Aliments + meals
    { id: "dejeuner", tier: "essential" },// déjeuner — Je déjeune à midi.
    { id: "diner", tier: "essential" }, // dîner — Je dîne le soir.
    { id: "consommer", tier: "good" },  // consommer — On consomme des fruits — all three take -ER.
  ],
  "SIO-042": [  // Partitives + manger/boire
    { id: "manger", tier: "essential" },// manger — Partitives + manger. The lesson IS this verb.
    { id: "boire", tier: "essential" }, // boire — Je bois du café.
    { id: "voyager", tier: "good" },    // voyager — Nous voyageons — the same -geons as nous mangeon
  ],
  "SIO-043": [  // Frequency adverbs
    { id: "nager", tier: "good" },      // nager — Je nage souvent.
    { id: "dormir", tier: "good" },     // dormir — Je dors toujours huit heures.
  ],
  "SIO-044": [  // Commerces — shopping, and the mark
    { id: "vendre", tier: "good" },     // vendre — Le boulanger vend du pain.
    { id: "payer", tier: "essential" }, // payer — Je paie à la caisse.
  ],
  "SIO-045": [{ id: "rendre", tier: "good" }],                              // Numbers 70–99
  "SIO-046": [{ id: "mettre", tier: "essential" }],                         // Demonstratives
  "SIO-047": [  // Making plans — aller + infinitif
    { id: "voir", tier: "essential" },  // voir — On va voir un film samedi.
    { id: "rencontrer", tier: "good" }, // rencontrer — On va rencontrer des amis — aller + infinitif.
  ],
  "SIO-048": [  // Giving advice — devoir / falloir /
    { id: "falloir", tier: "essential" },// falloir — Il faut… — the lesson IS this verb.
    { id: "devoir", tier: "essential" },// devoir — Tu dois… — advice, the other modal.
    { id: "vivre", tier: "good" },      // vivre — Il faut bien vivre — advice about living, and a 
  ],
  "SIO-049": [{ id: "trouver", tier: "essential" }],                        // Reviewing a restaurant
  "SIO-050": [{ id: "choisir", tier: "essential" }],                        // Role-play: restaurant scene
};

/** The verbs a lesson drills, or an empty list where it drills none. */
export function lessonVerbs(sioId: string): LessonVerb[] {
  return LESSON_VERBS[sioId] ?? [];
}

/** …as ConjugaZone's own `?v=` list. Empty string = this lesson has none, and
 *  the caller should not offer the column at all. */
export function lessonVerbParam(sioId: string): string {
  return lessonVerbs(sioId).map((v) => v.id).join(",");
}

/** Does this lesson conjugate anything? The rail asks before offering the
 *  column, so an empty ConjugaZone is stepped over rather than landed on. */
export function lessonHasVerbs(sioId: string): boolean {
  return lessonVerbs(sioId).length > 0;
}

/** Every verb id this table names — read from the table itself, never a copy. */
export const ALL_LESSON_VERB_IDS: string[] =
  Object.values(LESSON_VERBS).flatMap((vs) => vs.map((v) => v.id));

/** A verb the registry does not know is a typo that would silently drill
 *  nothing. verify173 fails on it; this keeps the fact reachable at runtime. */
export function unknownLessonVerbs(): string[] {
  return ALL_LESSON_VERB_IDS.filter((id) => !VERBS.some((v) => v.id === id));
}
