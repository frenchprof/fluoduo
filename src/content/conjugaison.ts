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
];

/** The spoken phrase for a cell — subject + form with je→j' elision
 *  ("j'ai", "j'habite"; "je m'appelle" survives since m isn't a vowel). */
export function conjSpoken(personIdx: number, form: string): string {
  const subj = SPOKEN_SUBJECT[personIdx];
  if (subj === "je" && /^[aeéèêiîoôuh]/i.test(form)) return `j'${form}`;
  return `${subj} ${form}`;
}
