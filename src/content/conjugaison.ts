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
};

export const VERBS: ConjVerb[] = [
  { id: "etre", inf: "être", en: "to be", forms: ["suis", "es", "est", "sommes", "êtes", "sont"] },
  { id: "avoir", inf: "avoir", en: "to have", forms: ["ai", "as", "a", "avons", "avez", "ont"] },
  { id: "sappeler", inf: "s'appeler", en: "to be called", forms: ["m'appelle", "t'appelles", "s'appelle", "nous appelons", "vous appelez", "s'appellent"] },
  { id: "parler", inf: "parler", en: "to speak (-er)", forms: ["parle", "parles", "parle", "parlons", "parlez", "parlent"] },
  { id: "habiter", inf: "habiter", en: "to live", forms: ["habite", "habites", "habite", "habitons", "habitez", "habitent"] },
  { id: "aimer", inf: "aimer", en: "to like / love", forms: ["aime", "aimes", "aime", "aimons", "aimez", "aiment"] },
  { id: "faire", inf: "faire", en: "to do / make", forms: ["fais", "fais", "fait", "faisons", "faites", "font"] },
  { id: "aller", inf: "aller", en: "to go", forms: ["vais", "vas", "va", "allons", "allez", "vont"] },
  { id: "venir", inf: "venir", en: "to come", forms: ["viens", "viens", "vient", "venons", "venez", "viennent"] },
  { id: "vouloir", inf: "vouloir", en: "to want", forms: ["veux", "veux", "veut", "voulons", "voulez", "veulent"] },
  { id: "pouvoir", inf: "pouvoir", en: "to be able to", forms: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"] },
  { id: "prendre", inf: "prendre", en: "to take", forms: ["prends", "prends", "prend", "prenons", "prenez", "prennent"] },
  { id: "manger", inf: "manger", en: "to eat", forms: ["mange", "manges", "mange", "mangeons", "mangez", "mangent"] },
  { id: "boire", inf: "boire", en: "to drink", forms: ["bois", "bois", "boit", "buvons", "buvez", "boivent"] },
  { id: "devoir", inf: "devoir", en: "to have to / must", forms: ["dois", "dois", "doit", "devons", "devez", "doivent"] },
  // Impersonal: falloir exists ONLY as « il faut » — the other persons render
  // as inert dashes in the table (see /conjugaison's "—" handling).
  { id: "falloir", inf: "falloir", en: "to be necessary (il faut)", forms: ["—", "—", "faut", "—", "—", "—"] },
  // Completing the set of verbs the course meets by the end of Unit 4
  // (Dan, 2026-07-14): the -er regulars of Unité 2's likes/activities, the
  // shopping verbs of Unité 4, and choisir as the -ir model for ordering.
  { id: "adorer", inf: "adorer", en: "to love (things)", forms: ["adore", "adores", "adore", "adorons", "adorez", "adorent"] },
  { id: "detester", inf: "détester", en: "to hate", forms: ["déteste", "détestes", "déteste", "détestons", "détestez", "détestent"] },
  { id: "etudier", inf: "étudier", en: "to study", forms: ["étudie", "étudies", "étudie", "étudions", "étudiez", "étudient"] },
  { id: "travailler", inf: "travailler", en: "to work", forms: ["travaille", "travailles", "travaille", "travaillons", "travaillez", "travaillent"] },
  { id: "regarder", inf: "regarder", en: "to watch", forms: ["regarde", "regardes", "regarde", "regardons", "regardez", "regardent"] },
  { id: "ecouter", inf: "écouter", en: "to listen (to)", forms: ["écoute", "écoutes", "écoute", "écoutons", "écoutez", "écoutent"] },
  { id: "jouer", inf: "jouer", en: "to play", forms: ["joue", "joues", "joue", "jouons", "jouez", "jouent"] },
  { id: "acheter", inf: "acheter", en: "to buy (è stem)", forms: ["achète", "achètes", "achète", "achetons", "achetez", "achètent"] },
  { id: "payer", inf: "payer", en: "to pay", forms: ["paie", "paies", "paie", "payons", "payez", "paient"] },
  { id: "choisir", inf: "choisir", en: "to choose (-ir)", forms: ["choisis", "choisis", "choisit", "choisissons", "choisissez", "choisissent"] },
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
  "SIO-044": ["acheter", "payer"],
  "SIO-045": ["acheter", "payer", "vouloir"],
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
