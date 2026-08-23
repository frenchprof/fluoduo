/**
 * Unité 0 — « Bonjour, bienvenue, enchanté ! ». Three scenarios, all built
 * from what a learner has after SIO-001…010 alone: greetings and leave-takings
 * by register and time of day, s'appeler across persons, spelling aloud with
 * the alphabet, tu/vous, the question chunks (Comment tu t'appelles ?
 * Qui est-ce ? Qu'est-ce que c'est ? C'est quand ?), the classroom nouns and
 * consignes, days and moments, and the numbers 0–20.
 *
 * Unité 0 has no connectors yet, so cohesion is the first-meeting SCRIPT
 * itself — greet, ask the name, give the name, spell it, take leave — the
 * exact chain SIO-010's atelier models. Question and answer travel in one
 * sentence with the decks' own dash (« Qui est-ce ? — C'est un étudiant. »),
 * so a text of any length still closes on something complete.
 *
 * Two constraints shape every beat:
 *   • PLAUSIBLE — people are drawn as bound pairs, never independently: a
 *     first name carries its gender, so « Enchantée » is said by Léa and
 *     never by Marc, « elle » only ever points at une étudiante, and a class
 *     opened with « Bonsoir » meets neither « Bonne journée » nor a morning.
 *   • NEVER TWICE — every beat draws its wording as well as its words, so no
 *     sentence position is a constant that would repeat on the second listen.
 */

import { indef } from "../../lib/textgen/french";
import { pick, pickOther, scenario } from "../../lib/textgen/engine";
import type { Noun, UnitTextGen } from "../../lib/textgen/types";

/* ── Lexicon ─────────────────────────────────────────────────────────────── */

/** A first name with the gender that drives enchanté(e) and il/elle.
 *  Only names a card has shown (deck: sappeler). */
type Prenom = { fr: string; g: "m" | "f" };

const PRENOMS: Prenom[] = [
  { fr: "Léa", g: "f" },
  { fr: "Marie", g: "f" },
  { fr: "Julie", g: "f" },
  { fr: "Marc", g: "m" },
  { fr: "Paul", g: "m" },
  { fr: "Thomas", g: "m" },
];
const PRENOMS_F = PRENOMS.filter((p) => p.g === "f");
const PRENOMS_M = PRENOMS.filter((p) => p.g === "m");

/** "Léa" → "L – É – A" — spelling aloud, written the way the SIO-010 atelier
 *  writes it. Every letter is on an alphabet card (deck: alphabet). */
function epele(name: string): string {
  return [...name.toLocaleUpperCase("fr-FR")].join(" – ");
}

/** enchanté / enchantée, agreeing with the speaker who says it. */
function enchante(g: "m" | "f"): { fr: string; en: string } {
  return { fr: g === "f" ? "Enchantée" : "Enchanté", en: "Nice to meet you" };
}

/** il / elle for a person already introduced. */
function ilElle(g: "m" | "f"): { fr: string; en: string } {
  return g === "f" ? { fr: "elle", en: "she" } : { fr: "il", en: "he" };
}

/** People one can point out in a classroom (deck: core-nouns). */
const PERSONNES: Noun[] = [
  { fr: "étudiant", en: "a student", g: "m", vowel: true },
  { fr: "étudiante", en: "a student", g: "f", vowel: true },
  { fr: "professeur", en: "a teacher", g: "m" },
  { fr: "professeure", en: "a teacher", g: "f" },
  { fr: "garçon", en: "a boy", g: "m" },
  { fr: "fille", en: "a girl", g: "f" },
  { fr: "homme", en: "a man", g: "m", vowel: true },
  { fr: "femme", en: "a woman", g: "f" },
  { fr: "dame", en: "a lady", g: "f" },
  { fr: "ami", en: "a friend", g: "m", vowel: true },
];

/** Things on a classroom table (deck: core-nouns). */
const OBJETS: Noun[] = [
  { fr: "livre", en: "a book", g: "m" },
  { fr: "cahier", en: "an exercise book", g: "m" },
  { fr: "crayon", en: "a pencil", g: "m" },
  { fr: "casque", en: "a pair of headphones", g: "m" },
  { fr: "micro", en: "a microphone", g: "m" },
  { fr: "tableau", en: "a board", g: "m" },
  { fr: "table", en: "a table", g: "f" },
  { fr: "chaise", en: "a chair", g: "f" },
];

/** Class sizes that can follow « il y a … étudiants » (deck: numbers-0-20).
 *  Capped at dix — the book's unité 0 teaches les chiffres (1) de 1 à 10,
 *  and the teens only join the deck later — and two and above, so the
 *  plural headword stays true. */
const EFFECTIFS = [
  { fr: "cinq", en: "five" },
  { fr: "six", en: "six" },
  { fr: "sept", en: "seven" },
  { fr: "huit", en: "eight" },
  { fr: "neuf", en: "nine" },
  { fr: "dix", en: "ten" },
];

/** Weekdays a class can fall on (deck: days). */
const JOURS = [
  { fr: "lundi", en: "Monday" },
  { fr: "mardi", en: "Tuesday" },
  { fr: "mercredi", en: "Wednesday" },
  { fr: "jeudi", en: "Thursday" },
  { fr: "vendredi", en: "Friday" },
];

/** Moments a « Bonjour » can open (deck: days). `soir` pairs with Bonsoir. */
const MOMENTS_JOUR = [
  { fr: "matin", en: "morning" },
  { fr: "après-midi", en: "afternoon" },
];
const MOMENT_SOIR = { fr: "soir", en: "evening" };

/** Casual openers and leave-takings for a hallway meeting (deck: salutations).
 *  All of them sit in the deck's « casual » or « anytime » columns — the
 *  scenario keeps one register from its first word to its last. */
const SALUTS_FAM = [
  { fr: "Salut !", en: "Hi!" },
  { fr: "Coucou !", en: "Hey there!" },
  { fr: "Bonjour !", en: "Hello!" },
];
const CONGES_FAM = [
  { fr: "À plus tard !", en: "See you later!" },
  { fr: "À bientôt !", en: "See you soon!" },
  { fr: "À demain !", en: "See you tomorrow!" },
  { fr: "Salut !", en: "Bye!" },
];

/** How a teacher opens class (deck: salutations). `soir` binds the moment
 *  of day AND rules « Bonne journée » out of the goodbye. */
const OUVERTURES = [
  { fr: "Bonjour !", en: "Hello!", soir: false },
  { fr: "Bonsoir !", en: "Good evening!", soir: true },
];
const CONGES_STD = [
  { fr: "Au revoir, à demain !", en: "Goodbye, see you tomorrow!" },
  { fr: "Au revoir, à bientôt !", en: "Goodbye, see you soon!" },
];
const CONGES_JOUR = [
  ...CONGES_STD,
  { fr: "Bonne journée, à demain !", en: "Have a good day, see you tomorrow!" },
];

/** M. / Mme as forms of address (decks: tu-vous, sappeler). Only « Martin »
 *  is on a card, so the teacher is always a Martin. */
const TITRES = [
  { fr: "Madame", en: "Mrs" },
  { fr: "Monsieur", en: "Mr" },
];

/** Consignes a teacher chains on day one (deck: consignes). Counting aloud
 *  folds the numbers deck into the instruction. */
const CONSIGNES = [
  { fr: "Écoutez et répétez !", en: "Listen and repeat!" },
  { fr: "Regardez et lisez !", en: "Look and read!" },
  { fr: "Écoutez et écrivez !", en: "Listen and write!" },
  { fr: "Comptez : un, deux, trois !", en: "Count: one, two, three!" },
];

/* ── Scenarios ───────────────────────────────────────────────────────────── */

/**
 * La rencontre — the model text of SIO-010, generated. Two students meet in
 * the corridor: greet, ask the name, answer it, give the other name and spell
 * it, part. The closing enchanté(e) agrees with the second speaker, because
 * the name and its gender were drawn as one.
 */
const LA_RENCONTRE = scenario(
  "la-rencontre",
  (r) => {
    const a = pick(r, PRENOMS);
    return {
      a,
      b: pickOther(r, PRENOMS, a),
      salut: pick(r, SALUTS_FAM),
      conge: pick(r, CONGES_FAM),
      // Whether « Ça va ? » gets its answer inside the opening line — drawn
      // here so the next beat knows not to answer it a second time.
      repondu: r() < 0.5,
    };
  },
  [
    (c) =>
      c.repondu
        ? {
            fr: `${c.salut.fr} Ça va ? — Ça va, merci !`,
            en: `${c.salut.en} How's it going? — Fine, thanks!`,
          }
        : { fr: `${c.salut.fr} Ça va ?`, en: `${c.salut.en} How's it going?` },
    (c, _p, r) => {
      const demandes = [
        { fr: "Comment tu t'appelles ?", en: "What's your name?" },
        { fr: "Tu t'appelles comment ?", en: "What's your name?" },
        { fr: "Et toi, comment tu t'appelles ?", en: "And you, what's your name?" },
      ];
      return pick(
        r,
        c.repondu
          ? demandes
          : [...demandes, { fr: "Ça va, merci ! Comment tu t'appelles ?", en: "Fine, thanks! What's your name?" }],
      );
    },
    (c, _p, r) =>
      pick(r, [
        { fr: `Je m'appelle ${c.b.fr}. Et toi ?`, en: `My name is ${c.b.fr}. And you?` },
        { fr: `Moi, je m'appelle ${c.b.fr}. Et toi ?`, en: `Me, my name is ${c.b.fr}. And you?` },
        { fr: `Moi, c'est ${c.b.fr}. Et toi ?`, en: `Me, I'm ${c.b.fr}. And you?` },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Je m'appelle ${c.a.fr} : ça s'écrit ${epele(c.a.fr)}.`,
          en: `My name is ${c.a.fr}: it's spelled ${epele(c.a.fr)}.`,
        },
        {
          fr: `Moi, c'est ${c.a.fr}. Ça s'écrit ${epele(c.a.fr)}.`,
          en: `Me, I'm ${c.a.fr}. It's spelled ${epele(c.a.fr)}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${enchante(c.b.g).fr} ! ${c.conge.fr}`,
          en: `${enchante(c.b.g).en}! ${c.conge.en}`,
        },
        {
          fr: `${enchante(c.b.g).fr} ! Au revoir !`,
          en: `${enchante(c.b.g).en}! Goodbye!`,
        },
      ]),
  ],
);

/**
 * Le premier cours — the teacher's first five sentences of the term: greet,
 * self-introduce with M./Mme, place the class in the week, count the
 * students, set the class to work. Vous-register from start to finish, and
 * the whole timetable hangs off the opening draw: Bonsoir forces an evening
 * class and a goodbye without « Bonne journée ».
 */
const LE_PREMIER_COURS = scenario(
  "le-premier-cours",
  (r) => {
    const ouverture = pick(r, OUVERTURES);
    return {
      ouverture,
      titre: pick(r, TITRES),
      jour: pick(r, JOURS),
      moment: ouverture.soir ? MOMENT_SOIR : pick(r, MOMENTS_JOUR),
      effectif: pick(r, EFFECTIFS),
      consigne: pick(r, CONSIGNES),
      conge: pick(r, ouverture.soir ? CONGES_STD : CONGES_JOUR),
    };
  },
  [
    (c, _p, r) =>
      pick(r, [
        { fr: c.ouverture.fr, en: c.ouverture.en },
        { fr: `${c.ouverture.fr} Ça va ?`, en: `${c.ouverture.en} How's it going?` },
        { fr: `${c.ouverture.fr} Écoutez !`, en: `${c.ouverture.en} Listen!` },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `Je m'appelle ${c.titre.fr} Martin.`, en: `My name is ${c.titre.en} Martin.` },
        { fr: `Moi, je m'appelle ${c.titre.fr} Martin.`, en: `Me, my name is ${c.titre.en} Martin.` },
        {
          fr: `Je m'appelle ${c.titre.fr} Martin. Et vous, vous vous appelez comment ?`,
          en: `My name is ${c.titre.en} Martin. And you, what's your name?`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `La classe, c'est ${c.jour.fr}.`, en: `The class is on ${c.jour.en}.` },
        {
          fr: `La classe, c'est quand ? — C'est ${c.jour.fr} ${c.moment.fr}.`,
          en: `The class — when is it? — It's on ${c.jour.en} ${c.moment.en}.`,
        },
        {
          fr: `C'est ${c.jour.fr} ${c.moment.fr}.`,
          en: `It's ${c.jour.en} ${c.moment.en}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Dans la classe, il y a ${c.effectif.fr} étudiants.`,
          en: `In the class there are ${c.effectif.en} students.`,
        },
        {
          fr: `Il y a combien d'étudiants ? — Il y a ${c.effectif.fr} étudiants.`,
          en: `How many students are there? — There are ${c.effectif.en} students.`,
        },
        {
          fr: `Dans la salle de classe, il y a ${c.effectif.fr} étudiants.`,
          en: `In the classroom there are ${c.effectif.en} students.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: c.consigne.fr, en: c.consigne.en },
        { fr: `On fait quoi ? — ${c.consigne.fr}`, en: `What are we doing? — ${c.consigne.en}` },
        { fr: c.conge.fr, en: c.conge.en },
      ]),
  ],
);

/**
 * Qui est-ce ? — the core-nouns drill as a scene: a person is asked about,
 * identified, named, a second person joins, and a thing on the table closes
 * with « Qu'est-ce que c'est ? ». Names are drawn from the pool of the
 * person's own gender, so « elle s'appelle Marc » cannot happen.
 */
const QUI_EST_CE = scenario(
  "qui-est-ce",
  (r) => {
    const p1 = pick(r, PERSONNES);
    const p2 = pickOther(r, PERSONNES, p1);
    const n1 = pick(r, p1.g === "f" ? PRENOMS_F : PRENOMS_M);
    const objet = pick(r, OBJETS);
    return {
      p1,
      p2,
      n1,
      n2: pickOther(r, p2.g === "f" ? PRENOMS_F : PRENOMS_M, n1),
      objet,
      objet2: pickOther(r, OBJETS, objet),
    };
  },
  [
    (_c, _p, r) =>
      pick(r, [
        { fr: "Qui est-ce ?", en: "Who is it?" },
        { fr: "Regardez ! Qui est-ce ?", en: "Look! Who is it?" },
        { fr: "Écoutez ! Qui est-ce ?", en: "Listen! Who is it?" },
        { fr: "Dans la salle de classe, qui est-ce ?", en: "In the classroom, who is it?" },
        { fr: "Dans la classe, qui est-ce ?", en: "In the class, who is it?" },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `C'est ${indef(c.p1)}${c.p1.fr}.`, en: `It's ${c.p1.en}.` },
        { fr: `Voici ${indef(c.p1)}${c.p1.fr}.`, en: `Here is ${c.p1.en}.` },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `${ilElle(c.p1.g).fr} s'appelle ${c.n1.fr}.`,
          en: `${ilElle(c.p1.g).en} is called ${c.n1.fr}.`,
        },
        {
          fr: `${ilElle(c.p1.g).fr} s'appelle ${c.n1.fr} : ça s'écrit ${epele(c.n1.fr)}.`,
          en: `${ilElle(c.p1.g).en} is called ${c.n1.fr}: it's spelled ${epele(c.n1.fr)}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        { fr: `Et voici ${indef(c.p2)}${c.p2.fr}.`, en: `And here is ${c.p2.en}.` },
        {
          fr: `Et voici ${indef(c.p2)}${c.p2.fr} : ${ilElle(c.p2.g).fr} s'appelle ${c.n2.fr}.`,
          en: `And here is ${c.p2.en}: ${ilElle(c.p2.g).en} is called ${c.n2.fr}.`,
        },
      ]),
    (c, _p, r) =>
      pick(r, [
        {
          fr: `Qu'est-ce que c'est ? — C'est ${indef(c.objet)}${c.objet.fr}.`,
          en: `What is it? — It's ${c.objet.en}.`,
        },
        {
          fr: `Regardez : voici ${indef(c.objet)}${c.objet.fr} et ${indef(c.objet2)}${c.objet2.fr}.`,
          en: `Look: here is ${c.objet.en} and ${c.objet2.en}.`,
        },
        {
          fr: `Qu'est-ce que c'est ? — C'est ${indef(c.objet)}${c.objet.fr} !`,
          en: `What is it? — It's ${c.objet.en}!`,
        },
      ]),
  ],
);

export const UNIT0: UnitTextGen = {
  unit: 0,
  title: "Bonjour, bienvenue, enchanté !",
  scenarios: [LA_RENCONTRE, LE_PREMIER_COURS, QUI_EST_CE],
};
