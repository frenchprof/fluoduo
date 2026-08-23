/**
 * Unité 1 — « Qui suis-je ? ». Three scenarios, all built from what a learner
 * has after SIO-011…020 (and unité 0 before it): identity portraits — a name,
 * a nationality, a country with its article, the languages spoken, a
 * profession or a subject of study, an age with avoir.
 *
 * Cohesion here is the unit's own grammar doing the work: the first sentence
 * introduces the person by NAME (Voici Marc / Lui, c'est Paul — the SIO-011
 * stress-pronoun frame), and every later sentence points back with il/elle,
 * so être and avoir agreement is also the anaphora. Possessives are unité 2,
 * so no beat ever needs « son » — the country is named with the deck's own
 * frame (« le pays, c'est le Maroc »), never "his country".
 *
 * Two constraints shape every beat:
 *   • PLAUSIBLE — a country is drawn WITH its nationality forms and its
 *     languages as one record, so a Mexican never speaks Thai; a person is
 *     drawn WITH a gender, so name, il/elle, nationality form, profession
 *     form and Enchanté(e) all agree from a single draw.
 *   • NEVER TWICE — every beat draws its wording as well as its words, so no
 *     sentence position is a constant that would repeat on the second listen.
 */

import { pick, pickOther, scenario } from "../../lib/textgen/engine";
import type { Rng, Sentence, UnitTextGen } from "../../lib/textgen/types";

/* ── Lexicon ─────────────────────────────────────────────────────────────── */

/** A language, bare after « parler » as the SIO-020 model speaks it
 *  (« … parlent japonais ») — deck: languages, headword minus its article. */
type Langue = { fr: string; en: string };

const FRANCAIS: Langue = { fr: "français", en: "French" };
const ANGLAIS: Langue = { fr: "anglais", en: "English" };
const CHINOIS: Langue = { fr: "chinois", en: "Chinese" };
const CANTONAIS: Langue = { fr: "cantonais", en: "Cantonese" };
const ESPAGNOL: Langue = { fr: "espagnol", en: "Spanish" };
const ARABE: Langue = { fr: "arabe", en: "Arabic" };
const PORTUGAIS: Langue = { fr: "portugais", en: "Portuguese" };
const RUSSE: Langue = { fr: "russe", en: "Russian" };
const INDONESIEN: Langue = { fr: "indonésien", en: "Indonesian" };
const ALLEMAND: Langue = { fr: "allemand", en: "German" };
const TURC: Langue = { fr: "turc", en: "Turkish" };
const TAMOUL: Langue = { fr: "tamoul", en: "Tamil" };
const COREEN: Langue = { fr: "coréen", en: "Korean" };
const THAI: Langue = { fr: "thaï", en: "Thai" };
const MALAIS: Langue = { fr: "malais", en: "Malay" };
const FILIPINO: Langue = { fr: "filipino", en: "Filipino" };

/**
 * A country with its article, its nationality forms, and its languages — one
 * record, because the three decks (countries-letris, nationalities,
 * languages) teach them as one linked fact. The article is stored, not
 * derived: the Letris columns (le / la / l' / les / ∅) fix it by name, and ∅
 * (Cuba, Singapour) has no rule an A1 learner could apply.
 *
 * `franco` = French already among its languages, which gates the
 * « et un peu français » variant — nobody speaks "a little" of their own
 * language. `en` carries its English article (the United States).
 */
type Pays = {
  fr: string;
  en: string;
  art: string;
  /** Plural name (les États-Unis) — « le pays, c'est les… » would need the
   *  unité-2 « ce sont », so the country-naming variants skip these. */
  pl?: boolean;
  /** Nationality adjective, masculine and feminine singular (deck: nationalities). */
  ms: string;
  fs: string;
  natEn: string;
  langues: Langue[];
  franco?: boolean;
};

const PAYS: Pays[] = [
  { fr: "France", en: "France", art: "la ", ms: "français", fs: "française", natEn: "French", langues: [FRANCAIS], franco: true },
  { fr: "Portugal", en: "Portugal", art: "le ", ms: "portugais", fs: "portugaise", natEn: "Portuguese", langues: [PORTUGAIS] },
  { fr: "Chine", en: "China", art: "la ", ms: "chinois", fs: "chinoise", natEn: "Chinese", langues: [CHINOIS, CANTONAIS] },
  { fr: "Indonésie", en: "Indonesia", art: "l'", ms: "indonésien", fs: "indonésienne", natEn: "Indonesian", langues: [INDONESIEN] },
  { fr: "Corée", en: "Korea", art: "la ", ms: "coréen", fs: "coréenne", natEn: "Korean", langues: [COREEN] },
  { fr: "États-Unis", en: "the United States", art: "les ", pl: true, ms: "américain", fs: "américaine", natEn: "American", langues: [ANGLAIS, ESPAGNOL] },
  { fr: "Mexique", en: "Mexico", art: "le ", ms: "mexicain", fs: "mexicaine", natEn: "Mexican", langues: [ESPAGNOL] },
  { fr: "Cuba", en: "Cuba", art: "", ms: "cubain", fs: "cubaine", natEn: "Cuban", langues: [ESPAGNOL] },
  { fr: "Philippines", en: "the Philippines", art: "les ", pl: true, ms: "philippin", fs: "philippine", natEn: "Filipino", langues: [FILIPINO, ANGLAIS] },
  { fr: "Argentine", en: "Argentina", art: "l'", ms: "argentin", fs: "argentine", natEn: "Argentinian", langues: [ESPAGNOL] },
  { fr: "Russie", en: "Russia", art: "la ", ms: "russe", fs: "russe", natEn: "Russian", langues: [RUSSE] },
  { fr: "Suisse", en: "Switzerland", art: "la ", ms: "suisse", fs: "suisse", natEn: "Swiss", langues: [FRANCAIS, ALLEMAND], franco: true },
  { fr: "Belgique", en: "Belgium", art: "la ", ms: "belge", fs: "belge", natEn: "Belgian", langues: [FRANCAIS], franco: true },
  { fr: "Turquie", en: "Turkey", art: "la ", ms: "turc", fs: "turque", natEn: "Turkish", langues: [TURC] },
  { fr: "Allemagne", en: "Germany", art: "l'", ms: "allemand", fs: "allemande", natEn: "German", langues: [ALLEMAND] },
  { fr: "Singapour", en: "Singapore", art: "", ms: "singapourien", fs: "singapourienne", natEn: "Singaporean", langues: [ANGLAIS, CHINOIS, MALAIS, TAMOUL] },
  { fr: "Malaisie", en: "Malaysia", art: "la ", ms: "malaisien", fs: "malaisienne", natEn: "Malaysian", langues: [MALAIS, ANGLAIS] },
  { fr: "Thaïlande", en: "Thailand", art: "la ", ms: "thaïlandais", fs: "thaïlandaise", natEn: "Thai", langues: [THAI] },
  { fr: "Angleterre", en: "England", art: "l'", ms: "anglais", fs: "anglaise", natEn: "English", langues: [ANGLAIS] },
  { fr: "Tunisie", en: "Tunisia", art: "la ", ms: "tunisien", fs: "tunisienne", natEn: "Tunisian", langues: [ARABE, FRANCAIS], franco: true },
  { fr: "Maroc", en: "Morocco", art: "le ", ms: "marocain", fs: "marocaine", natEn: "Moroccan", langues: [ARABE, FRANCAIS], franco: true },
  { fr: "Algérie", en: "Algeria", art: "l'", ms: "algérien", fs: "algérienne", natEn: "Algerian", langues: [ARABE, FRANCAIS], franco: true },
];
// Grèce, Cambodge and Grande-Bretagne are on the countries cards but their
// languages are not on a card yet, so they stay out of a listening text.

/**
 * A profession in both gendered forms (deck: professions). « il est X » takes
 * no article; « C'est un/une X » takes one — both are SIO-012's frames.
 * `cest: false` keeps « C'est une médecin » out: the deck files médecin under
 * Both OK for « il/elle est », but shows no card with an article.
 */
type Metier = { m: string; f: string; enM: string; enF: string; cest?: boolean };

const METIERS: Metier[] = [
  { m: "chef", f: "cheffe", enM: "a chef", enF: "a chef" },
  { m: "acteur", f: "actrice", enM: "an actor", enF: "an actress" },
  { m: "joueur de tennis", f: "joueuse de tennis", enM: "a tennis player", enF: "a tennis player" },
  { m: "nageur", f: "nageuse", enM: "a swimmer", enF: "a swimmer" },
  { m: "chanteur", f: "chanteuse", enM: "a singer", enF: "a singer" },
  { m: "journaliste", f: "journaliste", enM: "a journalist", enF: "a journalist" },
  { m: "styliste", f: "styliste", enM: "a fashion designer", enF: "a fashion designer" },
  { m: "artiste", f: "artiste", enM: "an artist", enF: "an artist" },
  { m: "architecte", f: "architecte", enM: "an architect", enF: "an architect" },
  { m: "médecin", f: "médecin", enM: "a doctor", enF: "a doctor", cest: false },
  { m: "serveur", f: "serveuse", enM: "a waiter", enF: "a waitress" },
  { m: "musicien", f: "musicienne", enM: "a musician", enF: "a musician" },
];

/** Subjects of study, bare after « étudiant(e) en » (deck: matieres). */
const MATIERES = [
  { fr: "français", en: "French" },
  { fr: "dessin", en: "art" },
  { fr: "géographie", en: "geography" },
  { fr: "biologie", en: "biology" },
  { fr: "anglais", en: "English" },
  { fr: "histoire", en: "history" },
  { fr: "informatique", en: "computer science" },
  { fr: "mathématiques", en: "maths" },
  { fr: "sciences", en: "science" },
  { fr: "langues", en: "languages" },
  { fr: "sport", en: "sport" },
  { fr: "théâtre", en: "drama" },
  { fr: "chimie", en: "chemistry" },
  { fr: "musique", en: "music" },
  { fr: "espagnol", en: "Spanish" },
  { fr: "arts plastiques", en: "visual arts" },
];

// Only the numbers the decks actually show — numbers-20-69 teaches the tens
// plus a few composites, so an age is one of those, never « quarante-trois ».
// « ans » itself is the SIO-019 frame word (J'ai ___ ans).
const AGES_ETUDIANT = [
  { fr: "dix-huit", en: "eighteen" },
  { fr: "dix-neuf", en: "nineteen" },
  { fr: "vingt", en: "twenty" },
  { fr: "vingt et un", en: "twenty-one" },
  { fr: "vingt-deux", en: "twenty-two" },
];
const AGES_ADULTE = [
  { fr: "trente", en: "thirty" },
  { fr: "trente-cinq", en: "thirty-five" },
  { fr: "quarante", en: "forty" },
  { fr: "quarante-sept", en: "forty-seven" },
  { fr: "cinquante", en: "fifty" },
  { fr: "cinquante-huit", en: "fifty-eight" },
  { fr: "soixante", en: "sixty" },
  { fr: "soixante et un", en: "sixty-one" },
];

/* ── The person draw ─────────────────────────────────────────────────────── */

/** First names the course has actually shown (deck: sappeler, unité 0). */
const PRENOMS_M = ["Marc", "Paul", "Thomas"];
const PRENOMS_F = ["Léa", "Marie", "Julie"];

/**
 * One draw fixes everything that must agree: the name, il/elle, the stressed
 * pronoun, and the English glosses. Every scenario reads its nationality,
 * profession and étudiant(e) forms off this flag, so agreement can never be
 * drawn apart from the person it agrees with.
 */
type Personne = {
  nom: string;
  f: boolean;
  il: "il" | "elle";
  ilEn: "he" | "she";
  lui: "lui" | "elle";
  luiEn: "him" | "her";
  sonEn: "his" | "her";
};

function personne(r: Rng): Personne {
  const f = r() < 0.5;
  return {
    nom: pick(r, f ? PRENOMS_F : PRENOMS_M),
    f,
    il: f ? "elle" : "il",
    ilEn: f ? "she" : "he",
    lui: f ? "elle" : "lui",
    luiEn: f ? "her" : "him",
    sonEn: f ? "her" : "his",
  };
}

const nat = (p: { f: boolean }, pays: Pays) => (p.f ? pays.fs : pays.ms);

/** « anglais, chinois, malais et tamoul » — a list said the way French says it. */
function listeFr(ls: Langue[]): string {
  const fr = ls.map((l) => l.fr);
  return fr.length === 1 ? fr[0] : `${fr.slice(0, -1).join(", ")} et ${fr[fr.length - 1]}`;
}
function listeEn(ls: Langue[]): string {
  const en = ls.map((l) => l.en);
  return en.length === 1 ? en[0] : `${en.slice(0, -1).join(", ")} and ${en[en.length - 1]}`;
}

/**
 * The languages beat, shared by all three portraits: the subject changes, the
 * SIO-017 frame does not. « et un peu français » is only offered where French
 * is not already one of the country's languages — nobody speaks a little of
 * their own language — and the full list only where there is a list.
 */
function parle(sujet: string, sujetEn: string, pays: Pays): Sentence[] {
  const une = pays.langues[0];
  const variants: Sentence[] = [
    { fr: `${sujet} parle ${une.fr}.`, en: `${sujetEn} ${une.en}.` },
    { fr: `et ${sujet} parle ${une.fr}.`, en: `and ${sujetEn} ${une.en}.` },
  ];
  if (pays.langues.length > 1) {
    variants.push({ fr: `${sujet} parle ${listeFr(pays.langues)}.`, en: `${sujetEn} ${listeEn(pays.langues)}.` });
  }
  if (!pays.franco) {
    variants.push({
      fr: `${sujet} parle ${une.fr}, et un peu français.`,
      en: `${sujetEn} ${une.en}, and a little French.`,
    });
  }
  return variants;
}

/* ── Scenarios ───────────────────────────────────────────────────────────── */

/**
 * C'est qui ? — the chapter title made into a text: a monsieur or a dame is
 * named, then given a profession, a nationality with its country, languages,
 * and an age. Sentence 1 answers « C'est qui, le monsieur ? » with the name;
 * il/elle carries every sentence after it.
 */
const CEST_QUI = scenario(
  "cest-qui",
  (r) => {
    const p = personne(r);
    return {
      p,
      noun: p.f ? { fr: "la dame", en: "the lady" } : { fr: "le monsieur", en: "the gentleman" },
      pays: pick(r, PAYS),
      metier: pick(r, METIERS),
      age: pick(r, AGES_ADULTE),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `C'est qui, ${c.noun.fr} ? C'est ${c.p.nom}.`,
          en: `Who is ${c.noun.en}? It's ${c.p.nom}.`,
        },
        {
          fr: `${c.noun.fr}, c'est ${c.p.nom}.`,
          en: `${c.noun.en} — that's ${c.p.nom}.`,
        },
        { fr: `Voici ${c.p.nom}.`, en: `Here is ${c.p.nom}.` },
        { fr: `${c.p.lui}, c'est ${c.p.nom}.`, en: `${c.p.luiEn}, that's ${c.p.nom}.` },
      ]),
    (c, _p, r) => {
      const prof = c.p.f ? c.metier.f : c.metier.m;
      const profEn = c.p.f ? c.metier.enF : c.metier.enM;
      const variants = [
        { fr: `${c.p.il} est ${prof}.`, en: `${c.p.ilEn} is ${profEn}.` },
        // « Quelle profession ? » is the deck's own title, asked and answered.
        {
          fr: `Quelle profession ? ${c.p.f ? "Elle" : "Il"} est ${prof}.`,
          en: `What profession? ${c.p.f ? "She" : "He"} is ${profEn}.`,
        },
      ];
      if (c.metier.cest !== false) {
        variants.push({
          fr: `C'est ${c.p.f ? "une" : "un"} ${prof}.`,
          en: `${c.p.ilEn} is ${profEn}.`,
        });
      }
      return pick(r, variants);
    },
    (c, _p, r) => {
      const variants = [
        { fr: `${c.p.il} est ${nat(c.p, c.pays)}.`, en: `${c.p.ilEn} is ${c.pays.natEn}.` },
        { fr: `et ${c.p.il} est ${nat(c.p, c.pays)}.`, en: `and ${c.p.ilEn} is ${c.pays.natEn}.` },
      ];
      if (!c.pays.pl) {
        variants.push(
          {
            fr: `${c.p.il} est ${nat(c.p, c.pays)} : le pays, c'est ${c.pays.art}${c.pays.fr}.`,
            en: `${c.p.ilEn} is ${c.pays.natEn}: the country is ${c.pays.en}.`,
          },
          {
            fr: `C'est quel pays ? C'est ${c.pays.art}${c.pays.fr}.`,
            en: `Which country is it? It's ${c.pays.en}.`,
          },
        );
      }
      return pick(r, variants);
    },
    (c, _p, r) => pick(r, parle(`${c.p.il}`, `${c.p.ilEn} speaks`, c.pays)),
    (c, _p, r) =>
      pick(r, [
        { fr: `${c.p.il} a ${c.age.fr} ans.`, en: `${c.p.ilEn} is ${c.age.en} years old.` },
        { fr: `et ${c.p.il} a ${c.age.fr} ans.`, en: `and ${c.p.ilEn} is ${c.age.en} years old.` },
        {
          fr: `aujourd'hui, ${c.p.il} a ${c.age.fr} ans !`,
          en: `today, ${c.p.ilEn} turns ${c.age.en}!`,
        },
      ]),
  ],
);

/**
 * Le camarade — a classmate presented to the class: name, nationality and
 * country, subject of study with the SIO-013 frame « étudiant(e) en ___ »,
 * languages, age. « comme moi » and the closing age contrast keep the
 * speaker in the picture with nothing beyond a stressed pronoun.
 */
const LE_CAMARADE = scenario(
  "le-camarade",
  (r) => {
    const p = personne(r);
    const age = pick(r, AGES_ETUDIANT);
    return {
      p,
      etu: p.f ? "étudiante" : "étudiant",
      unEtu: p.f ? "une étudiante" : "un étudiant",
      pays: pick(r, PAYS),
      matiere: pick(r, MATIERES),
      age,
      // The comparison beat needs two DIFFERENT ages — same age, no contrast.
      monAge: pickOther(r, AGES_ETUDIANT, age),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Voici ${c.p.nom}, ${c.unEtu} de la classe.`,
          en: `Here is ${c.p.nom}, a student from the class.`,
        },
        { fr: `${c.p.lui}, c'est ${c.p.nom}.`, en: `${c.p.luiEn}, that's ${c.p.nom}.` },
        { fr: `${c.p.il} s'appelle ${c.p.nom}.`, en: `${c.p.sonEn} name is ${c.p.nom}.` },
      ]),
    (c, _p, r) => {
      const variants = [
        { fr: `${c.p.il} est ${nat(c.p, c.pays)}.`, en: `${c.p.ilEn} is ${c.pays.natEn}.` },
        { fr: `et ${c.p.il} est ${nat(c.p, c.pays)}.`, en: `and ${c.p.ilEn} is ${c.pays.natEn}.` },
      ];
      if (!c.pays.pl) {
        variants.push(
          {
            fr: `${c.p.il} est ${nat(c.p, c.pays)} : le pays, c'est ${c.pays.art}${c.pays.fr}.`,
            en: `${c.p.ilEn} is ${c.pays.natEn}: the country is ${c.pays.en}.`,
          },
          {
            fr: `le pays, c'est ${c.pays.art}${c.pays.fr}.`,
            en: `the country is ${c.pays.en}.`,
          },
        );
      }
      return pick(r, variants);
    },
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${c.p.il} est ${c.etu} en ${c.matiere.fr}.`,
          en: `${c.p.ilEn} is a student of ${c.matiere.en}.`,
        },
        {
          fr: `C'est ${c.unEtu} en ${c.matiere.fr}.`,
          en: `${c.p.ilEn} is a student of ${c.matiere.en}.`,
        },
        {
          fr: `${c.p.il} est ${c.etu} en ${c.matiere.fr}, comme moi.`,
          en: `${c.p.ilEn} is a student of ${c.matiere.en}, like me.`,
        },
      ]),
    (c, _p, r) => pick(r, parle(`${c.p.il}`, `${c.p.ilEn} speaks`, c.pays)),
    (c, _p, r) =>
      pick(r, [
        { fr: `${c.p.il} a ${c.age.fr} ans.`, en: `${c.p.ilEn} is ${c.age.en} years old.` },
        { fr: `et ${c.p.il} a ${c.age.fr} ans.`, en: `and ${c.p.ilEn} is ${c.age.en} years old.` },
        {
          fr: `${c.p.il} a ${c.age.fr} ans, et moi, j'ai ${c.monAge.fr} ans.`,
          en: `${c.p.ilEn} is ${c.age.en}, and me, I'm ${c.monAge.en}.`,
        },
      ]),
  ],
);

/**
 * Ma présentation — the exchange-student self-introduction, first person all
 * the way: greeting and name, je suis + nationality, étudiant(e) en, je
 * parle, j'ai … ans, with Enchanté(e) agreeing on the way out.
 */
const MA_PRESENTATION = scenario(
  "ma-presentation",
  (r) => {
    const p = personne(r);
    return {
      p,
      etu: p.f ? "étudiante" : "étudiant",
      enchante: p.f ? "Enchantée" : "Enchanté",
      pays: pick(r, PAYS),
      matiere: pick(r, MATIERES),
      age: pick(r, AGES_ETUDIANT),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        { fr: `Bonjour ! Je m'appelle ${c.p.nom}.`, en: `Hello! My name is ${c.p.nom}.` },
        { fr: `Bonjour ! Moi, c'est ${c.p.nom}.`, en: `Hello! Me, I'm ${c.p.nom}.` },
        { fr: `Salut ! Moi, je m'appelle ${c.p.nom}.`, en: `Hi! Me, my name is ${c.p.nom}.` },
      ]),
    (c, _p, r) => {
      const variants = [
        { fr: `Je suis ${nat(c.p, c.pays)}.`, en: `I am ${c.pays.natEn}.` },
        { fr: `et je suis ${nat(c.p, c.pays)}.`, en: `and I am ${c.pays.natEn}.` },
      ];
      if (!c.pays.pl) {
        variants.push(
          {
            fr: `je suis ${nat(c.p, c.pays)} : le pays, c'est ${c.pays.art}${c.pays.fr}.`,
            en: `I am ${c.pays.natEn}: the country is ${c.pays.en}.`,
          },
          {
            fr: `le pays, c'est ${c.pays.art}${c.pays.fr} : je suis ${nat(c.p, c.pays)}.`,
            en: `the country is ${c.pays.en}: I am ${c.pays.natEn}.`,
          },
        );
      }
      return pick(r, variants);
    },
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Je suis ${c.etu} en ${c.matiere.fr}.`,
          en: `I am a student of ${c.matiere.en}.`,
        },
        {
          fr: `ici, je suis ${c.etu} en ${c.matiere.fr}.`,
          en: `here, I am a student of ${c.matiere.en}.`,
        },
        {
          fr: `moi, je suis ${c.etu} en ${c.matiere.fr}.`,
          en: `me, I am a student of ${c.matiere.en}.`,
        },
      ]),
    (c, _p, r) => pick(r, parle("je", "I speak", c.pays)),
    (c, _p, r) =>
      pick(r, [
        { fr: `J'ai ${c.age.fr} ans.`, en: `I am ${c.age.en} years old.` },
        {
          fr: `j'ai ${c.age.fr} ans. ${c.enchante} !`,
          en: `I am ${c.age.en} years old. Nice to meet you!`,
        },
        { fr: `et j'ai ${c.age.fr} ans.`, en: `and I am ${c.age.en} years old.` },
      ]),
  ],
);

export const UNIT1: UnitTextGen = {
  unit: 1,
  title: "Qui suis-je ?",
  scenarios: [CEST_QUI, LE_CAMARADE, MA_PRESENTATION],
};
