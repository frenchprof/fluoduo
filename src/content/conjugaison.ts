/**
 * ConjugaZone data (Dan, 2026-07-08): the A1 présent paradigms as real TABLES —
 * the learner hides columns, taps to reveal, or types to check (see
 * /conjugaison). Forms are the bare verb forms; pronominal s'appeler bakes its
 * object pronoun into the cell ("m'appelle") so row headers stay the plain
 * subject pronouns everywhere.
 */

export const PERSONS = ["je (j')", "tu", "il / elle / on", "nous", "vous", "ils / elles"] as const;
const SPOKEN_SUBJECT = ["je", "tu", "il", "nous", "vous", "ils"] as const;

export type ConjVerb = {
  id: string;
  inf: string; // infinitive, shown as the column header
  en: string; // gloss under the header
  forms: [string, string, string, string, string, string];
  /** Pedagogical family — the picker renders one row per group. */
  group: string;
};

/** Group order for the picker (Dan, 2026-07-14: "organise the verb groups"). */
export const CONJ_GROUPS = [
  "⭐ Essentiels",
  "1ᵉʳ groupe · -ER réguliers",
  "1ᵉʳ groupe · -eR irrégulier",
  "2ᵉ groupe · -IR (…issons)",
  "3ᵉ groupe · -RE réguliers",
  "3ᵉ groupe · irréguliers",
] as const;

// Dan's list (2026-07-14), deduplicated, organised by the classical French
// verb groups. G aliases CONJ_GROUPS for brevity.
const G = CONJ_GROUPS;
export const VERBS: ConjVerb[] = [
  { id: "etre", inf: "être", en: "to be", group: G[0], forms: ["suis", "es", "est", "sommes", "êtes", "sont"] },
  { id: "avoir", inf: "avoir", en: "to have", group: G[0], forms: ["ai", "as", "a", "avons", "avez", "ont"] },
  { id: "aller", inf: "aller", en: "to go", group: G[0], forms: ["vais", "vas", "va", "allons", "allez", "vont"] },
  { id: "faire", inf: "faire", en: "to do / make", group: G[0], forms: ["fais", "fais", "fait", "faisons", "faites", "font"] },
  { id: "falloir", inf: "falloir", en: "to be necessary (il faut)", group: G[0], forms: ["—", "—", "faut", "—", "—", "—"] },
  { id: "parler", inf: "parler", en: "to speak", group: G[1], forms: ["parle", "parles", "parle", "parlons", "parlez", "parlent"] },
  { id: "habiter", inf: "habiter", en: "to live", group: G[1], forms: ["habite", "habites", "habite", "habitons", "habitez", "habitent"] },
  { id: "aimer", inf: "aimer", en: "to like / love", group: G[1], forms: ["aime", "aimes", "aime", "aimons", "aimez", "aiment"] },
  { id: "adorer", inf: "adorer", en: "to love (things)", group: G[1], forms: ["adore", "adores", "adore", "adorons", "adorez", "adorent"] },
  { id: "detester", inf: "détester", en: "to hate", group: G[1], forms: ["déteste", "détestes", "déteste", "détestons", "détestez", "détestent"] },
  { id: "etudier", inf: "étudier", en: "to study", group: G[1], forms: ["étudie", "étudies", "étudie", "étudions", "étudiez", "étudient"] },
  { id: "travailler", inf: "travailler", en: "to work", group: G[1], forms: ["travaille", "travailles", "travaille", "travaillons", "travaillez", "travaillent"] },
  { id: "regarder", inf: "regarder", en: "to watch", group: G[1], forms: ["regarde", "regardes", "regarde", "regardons", "regardez", "regardent"] },
  { id: "ecouter", inf: "écouter", en: "to listen (to)", group: G[1], forms: ["écoute", "écoutes", "écoute", "écoutons", "écoutez", "écoutent"] },
  { id: "jouer", inf: "jouer", en: "to play", group: G[1], forms: ["joue", "joues", "joue", "jouons", "jouez", "jouent"] },
  { id: "donner", inf: "donner", en: "to give", group: G[1], forms: ["donne", "donnes", "donne", "donnons", "donnez", "donnent"] },
  { id: "demander", inf: "demander", en: "to ask (for)", group: G[1], forms: ["demande", "demandes", "demande", "demandons", "demandez", "demandent"] },
  { id: "arriver", inf: "arriver", en: "to arrive", group: G[1], forms: ["arrive", "arrives", "arrive", "arrivons", "arrivez", "arrivent"] },
  { id: "trouver", inf: "trouver", en: "to find", group: G[1], forms: ["trouve", "trouves", "trouve", "trouvons", "trouvez", "trouvent"] },
  { id: "chercher", inf: "chercher", en: "to look for", group: G[1], forms: ["cherche", "cherches", "cherche", "cherchons", "cherchez", "cherchent"] },
  { id: "porter", inf: "porter", en: "to wear / carry", group: G[1], forms: ["porte", "portes", "porte", "portons", "portez", "portent"] },
  { id: "dejeuner", inf: "déjeuner", en: "to have lunch", group: G[1], forms: ["déjeune", "déjeunes", "déjeune", "déjeunons", "déjeunez", "déjeunent"] },
  { id: "diner", inf: "dîner", en: "to have dinner", group: G[1], forms: ["dîne", "dînes", "dîne", "dînons", "dînez", "dînent"] },
  { id: "oublier", inf: "oublier", en: "to forget", group: G[1], forms: ["oublie", "oublies", "oublie", "oublions", "oubliez", "oublient"] },
  { id: "utiliser", inf: "utiliser", en: "to use", group: G[1], forms: ["utilise", "utilises", "utilise", "utilisons", "utilisez", "utilisent"] },
  { id: "fermer", inf: "fermer", en: "to close", group: G[1], forms: ["ferme", "fermes", "ferme", "fermons", "fermez", "ferment"] },
  { id: "rencontrer", inf: "rencontrer", en: "to meet", group: G[1], forms: ["rencontre", "rencontres", "rencontre", "rencontrons", "rencontrez", "rencontrent"] },
  { id: "consommer", inf: "consommer", en: "to consume", group: G[1], forms: ["consomme", "consommes", "consomme", "consommons", "consommez", "consomment"] },
  { id: "arreter", inf: "arrêter", en: "to stop", group: G[1], forms: ["arrête", "arrêtes", "arrête", "arrêtons", "arrêtez", "arrêtent"] },
  { id: "sappeler", inf: "s'appeler", en: "to be called", group: G[2], forms: ["m'appelle", "t'appelles", "s'appelle", "nous appelons", "vous appelez", "s'appellent"] },
  { id: "manger", inf: "manger", en: "to eat (-geons)", group: G[2], forms: ["mange", "manges", "mange", "mangeons", "mangez", "mangent"] },
  { id: "nager", inf: "nager", en: "to swim (-geons)", group: G[2], forms: ["nage", "nages", "nage", "nageons", "nagez", "nagent"] },
  { id: "voyager", inf: "voyager", en: "to travel (-geons)", group: G[2], forms: ["voyage", "voyages", "voyage", "voyageons", "voyagez", "voyagent"] },
  { id: "commencer", inf: "commencer", en: "to start (-çons)", group: G[2], forms: ["commence", "commences", "commence", "commençons", "commencez", "commencent"] },
  { id: "acheter", inf: "acheter", en: "to buy (è stem)", group: G[2], forms: ["achète", "achètes", "achète", "achetons", "achetez", "achètent"] },
  { id: "payer", inf: "payer", en: "to pay (paie / paye — both correct)", group: G[2], forms: ["paie", "paies", "paie", "payons", "payez", "paient"] },
  { id: "finir", inf: "finir", en: "to finish", group: G[3], forms: ["finis", "finis", "finit", "finissons", "finissez", "finissent"] },
  { id: "choisir", inf: "choisir", en: "to choose", group: G[3], forms: ["choisis", "choisis", "choisit", "choisissons", "choisissez", "choisissent"] },
  { id: "vendre", inf: "vendre", en: "to sell", group: G[4], forms: ["vends", "vends", "vend", "vendons", "vendez", "vendent"] },
  { id: "rendre", inf: "rendre", en: "to give back", group: G[4], forms: ["rends", "rends", "rend", "rendons", "rendez", "rendent"] },
  { id: "perdre", inf: "perdre", en: "to lose", group: G[4], forms: ["perds", "perds", "perd", "perdons", "perdez", "perdent"] },
  { id: "attendre", inf: "attendre", en: "to wait (for)", group: G[4], forms: ["attends", "attends", "attend", "attendons", "attendez", "attendent"] },
  { id: "descendre", inf: "descendre", en: "to go down", group: G[4], forms: ["descends", "descends", "descend", "descendons", "descendez", "descendent"] },
  { id: "vouloir", inf: "vouloir", en: "to want", group: G[5], forms: ["veux", "veux", "veut", "voulons", "voulez", "veulent"] },
  { id: "pouvoir", inf: "pouvoir", en: "to be able to", group: G[5], forms: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"] },
  { id: "devoir", inf: "devoir", en: "to have to / must", group: G[5], forms: ["dois", "dois", "doit", "devons", "devez", "doivent"] },
  { id: "savoir", inf: "savoir", en: "to know (facts)", group: G[5], forms: ["sais", "sais", "sait", "savons", "savez", "savent"] },
  { id: "connaitre", inf: "connaître", en: "to know (people/places)", group: G[5], forms: ["connais", "connais", "connaît", "connaissons", "connaissez", "connaissent"] },
  { id: "venir", inf: "venir", en: "to come", group: G[5], forms: ["viens", "viens", "vient", "venons", "venez", "viennent"] },
  { id: "revenir", inf: "revenir", en: "to come back", group: G[5], forms: ["reviens", "reviens", "revient", "revenons", "revenez", "reviennent"] },
  { id: "prendre", inf: "prendre", en: "to take", group: G[5], forms: ["prends", "prends", "prend", "prenons", "prenez", "prennent"] },
  { id: "comprendre", inf: "comprendre", en: "to understand", group: G[5], forms: ["comprends", "comprends", "comprend", "comprenons", "comprenez", "comprennent"] },
  { id: "apprendre", inf: "apprendre", en: "to learn", group: G[5], forms: ["apprends", "apprends", "apprend", "apprenons", "apprenez", "apprennent"] },
  { id: "mettre", inf: "mettre", en: "to put (on)", group: G[5], forms: ["mets", "mets", "met", "mettons", "mettez", "mettent"] },
  { id: "dire", inf: "dire", en: "to say", group: G[5], forms: ["dis", "dis", "dit", "disons", "dites", "disent"] },
  { id: "lire", inf: "lire", en: "to read", group: G[5], forms: ["lis", "lis", "lit", "lisons", "lisez", "lisent"] },
  { id: "ecrire", inf: "écrire", en: "to write", group: G[5], forms: ["écris", "écris", "écrit", "écrivons", "écrivez", "écrivent"] },
  { id: "voir", inf: "voir", en: "to see", group: G[5], forms: ["vois", "vois", "voit", "voyons", "voyez", "voient"] },
  { id: "boire", inf: "boire", en: "to drink", group: G[5], forms: ["bois", "bois", "boit", "buvons", "buvez", "boivent"] },
  { id: "vivre", inf: "vivre", en: "to live (life)", group: G[5], forms: ["vis", "vis", "vit", "vivons", "vivez", "vivent"] },
  { id: "dormir", inf: "dormir", en: "to sleep", group: G[5], forms: ["dors", "dors", "dort", "dormons", "dormez", "dorment"] },
  { id: "sortir", inf: "sortir", en: "to go out", group: G[5], forms: ["sors", "sors", "sort", "sortons", "sortez", "sortent"] },
  { id: "partir", inf: "partir", en: "to leave", group: G[5], forms: ["pars", "pars", "part", "partons", "partez", "partent"] },
  { id: "courir", inf: "courir", en: "to run", group: G[5], forms: ["cours", "cours", "court", "courons", "courez", "courent"] },
  { id: "ouvrir", inf: "ouvrir", en: "to open", group: G[5], forms: ["ouvre", "ouvres", "ouvre", "ouvrons", "ouvrez", "ouvrent"] },
  { id: "couvrir", inf: "couvrir", en: "to cover", group: G[5], forms: ["couvre", "couvres", "couvre", "couvrons", "couvrez", "couvrent"] },
  { id: "decouvrir", inf: "découvrir", en: "to discover", group: G[5], forms: ["découvre", "découvres", "découvre", "découvrons", "découvrez", "découvrent"] },
];

/** Which ConjugaZone verbs each conjugation-heavy SIO drills — powers the
 *  « 🔤 ConjugaZone » link on those SIOs' lesson pages (deep-links ?v=…). */
export const CONJ_BY_SIO: Record<string, string[]> = {
  "SIO-001": ["sappeler", "etre"],
  "SIO-014": ["etre"],
  "SIO-019": ["avoir", "etre"],
  "SIO-023": ["aimer", "parler", "habiter"],
  "SIO-024": ["faire"],
  "SIO-026": ["aller"],
  "SIO-029": ["vouloir", "pouvoir"],
  "SIO-032": ["etre", "aller", "venir"],
  "SIO-033": ["etre", "aller", "venir"],
  "SIO-037": ["pouvoir"],
  "SIO-038": ["prendre", "aller"],
  "SIO-042": ["manger", "boire"],
  "SIO-044": ["acheter", "payer", "vouloir"],
  "SIO-047": ["aller"],
  "SIO-048": ["devoir", "pouvoir", "falloir"],
};

/** The spoken phrase for a cell — subject + form with je→j' elision
 *  ("j'ai", "j'habite"; "je m'appelle" survives since m isn't a vowel). */
export function conjSpoken(personIdx: number, form: string): string {
  const subj = SPOKEN_SUBJECT[personIdx];
  if (subj === "je" && /^[aeéèêiîoôuh]/i.test(form)) return `j'${form}`;
  return `${subj} ${form}`;
}
