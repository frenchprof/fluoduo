/**
 * « Quel pays ? Quelle ville ? Quelles couleurs ? » — the generator.
 *
 * Dan, 2026-09-05, gave the six frames himself:
 *
 *     Quels sont vos pays préférés ?
 *     Quelles sont vos couleurs (villes) préférées ?
 *     Vous connaissez quels pays ?
 *     Vous connaissez quelles villes ?
 *     Vous aimez / préférez quelles couleurs ?
 *
 *     And their respective answers: Mon Ma Mes Ton Ta Tes
 *
 * WHY THE POSSESSIVE IS IN THE SAME CARD AND NOT A SECOND LESSON. It looks
 * like two grammar points bolted together and it is one: `quel` and `ton` are
 * both adjectives, they both agree with the SAME noun, and so they always move
 * together. Reading down a card is reading one decision made twice —
 *
 *     quel    pays     ton  pays     mon  pays
 *     quelle  ville    ta   ville    ma   ville
 *     quels   pays     tes  pays     mes  pays
 *     quelles villes   tes  villes   mes  villes
 *
 * — which is why a learner who can do the question can already do the answer.
 * Splitting them would teach the same rule twice and let the learner believe
 * they are two.
 *
 * WHY ITS OWN .ts FILE. The lesson holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx. A generator that
 * silently ignores a pinned axis looks in source exactly like one that
 * honours it, so verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, roll } from "./axis.ts";

/**
 * The three nouns Dan named, with what each one decides.
 *
 * `pays` IS the lesson. It ends in -s in the singular — « le pays », « les
 * pays » — so the learner cannot read the number off the noun the way
 * « la ville / les villes » lets them. `quel pays` and `quels pays` are told
 * apart by the QUESTION being asked and nothing else, which is the one case
 * where the rule has to be understood rather than pattern-matched.
 */
const NOUNS = [
  {
    key: "pays",
    sg: "pays", pl: "pays",
    f: false,
    enSg: "country", enPl: "countries",
    icon: "🌍",
    /** Answers come from the SIO-015 deck, with the article that stop teaches. */
    items: ["le Japon", "la Corée", "la France", "le Portugal", "la Chine", "l'Italie"],
  },
  {
    key: "ville",
    sg: "ville", pl: "villes",
    f: true,
    enSg: "city", enPl: "cities",
    icon: "🏙️",
    items: ["Paris", "Singapour", "Tokyo", "Séoul", "Lyon", "Kuala Lumpur"],
  },
  {
    key: "couleur",
    sg: "couleur", pl: "couleurs",
    f: true,
    enSg: "colour", enPl: "colours",
    icon: "🎨",
    // The COLOUR WORDS are masculine (« le rouge ») while « la couleur » is
    // feminine. That is not a trap, it is the point: `quelle` agrees with
    // `couleur`, never with the colour named in the answer.
    items: ["le rouge", "le bleu", "le vert", "le jaune", "le noir", "le blanc"],
  },
] as const;

type Noun = (typeof NOUNS)[number];

/** quel · quelle · quels · quelles — the whole paradigm, in one place. */
export function quelFor(feminine: boolean, plural: boolean): string {
  return `quel${feminine ? "le" : ""}${plural ? "s" : ""}`;
}

/** mon/ma/mes · ton/ta/tes — same two questions, same order, same answers. */
export function possessiveFor(person: "mon" | "ton", feminine: boolean, plural: boolean): string {
  if (plural) return person === "mon" ? "mes" : "tes";
  if (feminine) return person === "mon" ? "ma" : "ta";
  return person;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The two places `quel` can stand, which is Dan's other half of the brief:
 * three of his six frames put it first and three put it after the verb. Both
 * are correct spoken French and a learner meets both, so the card asks for the
 * one the frame calls for rather than teaching only the tidy one.
 */
export const QUEL_AXES: DiceAxis[] = [
  {
    key: "noun",
    label: "Nom",
    options: [
      { value: "pays", label: "le pays / les pays" },
      { value: "ville", label: "la ville / les villes" },
      { value: "couleur", label: "la couleur / les couleurs" },
    ],
  },
  {
    key: "nombre",
    label: "Nombre",
    options: [
      { value: "sg", label: "singulier — un seul" },
      { value: "pl", label: "pluriel — plusieurs" },
    ],
  },
  {
    key: "place",
    label: "Place",
    options: [
      { value: "avant", label: "Quel(s) sont… (au début)" },
      { value: "apres", label: "Vous connaissez quel(s)… (après le verbe)" },
    ],
  },
];

/**
 * Two of every card, because « vous » and « tu » change the possessive in the
 * QUESTION — vos/votre against tes/ton/ta. The ANSWER is mon/ma/mes either
 * way, which is the pair's whole point: whoever asks, you answer about
 * yourself.
 */
const PEOPLE = [
  { pin: "vous", your: (_f: boolean, pl: boolean) => (pl ? "vos" : "votre"), en: "(polite)" },
  { pin: "tu", your: (f: boolean, pl: boolean) => (pl ? "tes" : f ? "ta" : "ton"), en: "(a friend)" },
] as const;

const VERBS_AFTER = [
  { v: "connaissez", tu: "connais", en: "know" },
  { v: "aimez", tu: "aimes", en: "like" },
  { v: "préférez", tu: "préfères", en: "prefer" },
] as const;

export function quelPrefereQuestion(pinned?: Record<string, string>): DiceQuestion {
  const n: Noun = pinned1(NOUNS, pinned?.noun, (x) => x.key);
  const plural = pinned?.nombre === "pl" ? true : pinned?.nombre === "sg" ? false : Math.random() < 0.5;
  const place =
    pinned?.place === "avant" || pinned?.place === "apres" ? pinned.place : roll(["avant", "apres"] as const);
  const p = roll(PEOPLE);

  const noun = plural ? n.pl : n.sg;
  const quel = quelFor(n.f, plural);
  const mine = possessiveFor("mon", n.f, plural);
  const enNoun = plural ? n.enPl : n.enSg;

  // « préféré » agrees with the same noun a third time — the learner does not
  // choose it here (it is printed in the prompt), so it is never an option.
  const pref = `préféré${n.f ? "e" : ""}${plural ? "s" : ""}`;

  const answers = plural
    ? `${n.items[0]} et ${n.items[1]}`
    : n.items[0];

  if (place === "avant") {
    // « Quels sont vos pays préférés ? » — Dan's frame 1 and 2.
    const yours = p.your(n.f, plural);
    const est = plural ? "sont" : "est";
    const q = `${cap(quel)} ${est} ${yours} ${noun} ${pref} ?`;
    const correct = `${cap(mine)} ${noun} ${pref} ${est} ${answers}.`;
    return {
      // THE META IS AN ICON AND NOTHING ELSE. It read « (a friend) — plusieurs »
      // and neither half survived the litmus test: the sentence shows « tes »
      // and it shows « villes », so both were text a learner could delete
      // without losing the answer. A decorative mark is exempt and gives the
      // card something to land on.
      meta: n.icon,
      big: `« ${q} »`,
      en: `What ${plural ? "are" : "is"} your favourite ${enNoun}?`,
      correct,
      alternates: [`${cap(mine)} ${noun} ${pref} ${est} ${answers}`],
      // The whole paradigm minus the right one, so the card offers exactly the
      // three wrong choices a learner can make and never the same one twice —
      // `mes` and `tes` collapse the gender, so deriving distractors by
      // flipping one feature quietly produced a duplicate of the answer.
      easyOptions: [
        correct,
        ...["mon", "ma", "mes"]
          .filter((x) => x !== mine)
          .map((x) => `${cap(x)} ${noun} ${pref} ${est} ${answers}.`),
      ],
      med: {
        before: "",
        choices: ["mon", "ma", "mes"],
        correct: mine,
        after: `${noun} ${pref} ${est} ${answers}.`,
      },
    };
  }

  // « Vous connaissez quels pays ? » — Dan's frames 3, 4 and 5.
  const verb = roll(VERBS_AFTER);
  const q =
    p.pin === "vous"
      ? `Vous ${verb.v} ${quel} ${noun} ?`
      : `Tu ${verb.tu} ${quel} ${noun} ?`;
  return {
    meta: n.icon,
    // THE PROMPT IS THE ENGLISH, not the French with a gap in it. It was the
    // latter — « Tu préfères … couleurs ? » sitting directly above the card's
    // own « Tu préfères ? couleurs ? » — which is the same line twice and the
    // fault #97 named: a French `big` that repeats the segmented sentence is a
    // repeat, not a prompt. The English is the one thing the gapped sentence
    // cannot supply, so it is what the card shows.
    big: `Which ${enNoun} do you ${verb.en}?`,
    bigLang: "en" as const,
    correct: q,
    // `correct` is the QUESTION here, so the alternates are ways of writing the
    // question — not the answer, which is a different card.
    alternates: [q.replace(" ?", "?")],
    easyOptions: [
      q,
      q.replace(quel, quelFor(!n.f, plural)),
      q.replace(quel, quelFor(n.f, !plural)),
      q.replace(quel, quelFor(!n.f, !plural)),
    ],
    med: {
      before: p.pin === "vous" ? `Vous ${verb.v}` : `Tu ${verb.tu}`,
      choices: ["quel", "quelle", "quels", "quelles"],
      correct: quel,
      after: `${noun} ?`,
    },
  };
}
