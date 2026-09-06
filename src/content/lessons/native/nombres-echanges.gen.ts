/**
 * « J'ai vingt-cinq ans. » — the generator for SIO-018's lesson.
 *
 * WHY THIS LESSON EXISTS. SIO-018 promises numbers 20–69 "IN SIMPLE EXCHANGES
 * (AGES, PRICES, QUANTITIES)", and its deck is fifteen bare numerals — vingt,
 * vingt et un, trente. The deck contains zero occurrences of `ans`, `euro`,
 * `€` or `prix`. The numbers were taught; the exchanges were not, and counting
 * to sixty-nine is a different skill from answering « Vous avez quel âge ? ».
 * (Dan, 2026-08-28: "3, 17, 18 fill the content".)
 *
 * The three uses in the SIO's own words are the three the lesson drills, and
 * each carries a trap an English speaker reliably falls into:
 *
 *   ages       « J'AI vingt-cinq ANS »  — avoir, not être; `ans` is obligatory
 *   prices     « Ça coûte trente euros » — euro takes the plural s
 *   quantities « Il y a quarante étudiants » — il y a, not "there are"
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** The numbers, written out — SIO-018's own deck, 20 to 69. */
export const NUMBERS: Record<number, string> = {
  20: "vingt", 21: "vingt et un", 22: "vingt-deux", 25: "vingt-cinq", 28: "vingt-huit",
  30: "trente", 31: "trente et un", 33: "trente-trois", 35: "trente-cinq", 39: "trente-neuf",
  40: "quarante", 41: "quarante et un", 44: "quarante-quatre", 47: "quarante-sept",
  50: "cinquante", 51: "cinquante et un", 55: "cinquante-cinq", 58: "cinquante-huit",
  60: "soixante", 61: "soixante et un", 65: "soixante-cinq", 69: "soixante-neuf",
};

export const NUMBER_KEYS = Object.keys(NUMBERS).map(Number);

/**
 * `un` agrees with a feminine noun: « vingt et un ans » but « trente et une
 * personnes ». It is the one place a number changes shape in this range, and
 * the reason the quantity nouns below carry a gender.
 */
export function numberFor(n: number, feminine: boolean): string {
  const w = NUMBERS[n];
  return feminine ? w.replace(/\bun$/, "une") : w;
}

// No `euros` here: the price mode owns money, and a quantity card reading
// "Il y a trente et un euros" is both odd French and a duplicate of it.
export const QUANTITY_NOUNS = [
  { fr: "étudiants", en: "students", f: false },
  { fr: "personnes", en: "people", f: true },
  { fr: "minutes", en: "minutes", f: true },
  { fr: "pages", en: "pages", f: true },
  { fr: "livres", en: "books", f: false },
] as const;

export const PRICE_THINGS = [
  { fr: "le café", en: "the coffee" },
  { fr: "le livre", en: "the book" },
  { fr: "le sandwich", en: "the sandwich" },
  { fr: "le ticket", en: "the ticket" },
] as const;

/**
 * THE CALENDAR, added 2026-09-05 on Dan's placement: *"the months could be
 * incorporated somewhere in Unit 1 ? along with the year, which should be
 * restricted to deux mille ____ (20XX), where XX is under 70 if it is in
 * Unit 1."*
 *
 * It lands HERE rather than in a stop of its own because the restriction and
 * this stop's range are the same fact from two directions: `deux mille` plus
 * 20-69 IS 2020-2069. The year needs no number this lesson has not already
 * taught, so the calendar costs the learner two words (`deux mille`) and the
 * twelve month names, not a new numeric range.
 *
 * Lower case is deliberate and is NOT new: SIO-004 already teaches it for the
 * days, so the months are a callback the learner can be told they know.
 */
export const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
] as const;

/**
 * The English names, because the gloss is a TRANSLATION and not the French
 * word with a capital on it. The first draft of this file wrote
 * `month.charAt(0).toUpperCase() + month.slice(1)` into the `en` field and
 * produced "It's 10 Janvier 2030" — French wearing an English hat. Caught by
 * running the generator and reading the cards, which is the only way it could
 * have been caught: it typechecks perfectly.
 */
export const MONTHS_EN: Record<string, string> = {
  janvier: "January", "février": "February", mars: "March", avril: "April",
  mai: "May", juin: "June", juillet: "July", "août": "August",
  septembre: "September", octobre: "October", novembre: "November",
  "décembre": "December",
};

/**
 * `de` elides before a vowel: `d'avril`, `d'août`, `d'octobre`.
 *
 * This matters for a DISTRACTOR, which is the only place `de` appears here.
 * Dan's rule (1 Sep) is that a wrong option must be one the learner could have
 * PRODUCED — « de octobre » is nobody's mistake, it is the machine's, and it
 * makes the option wrong twice when the card is testing one thing: that a
 * French date takes no `de` at all.
 */
export function deMonth(month: string): string {
  return /^[aeiouâéèêîôû]/i.test(month) ? `d'${month}` : `de ${month}`;
}

/**
 * Days of the month for a full date. Everything here except `vingt` comes from
 * SIO-007 (0-20), so a date card asks for no numeral this learner has not met.
 * `premier` is the odd one and the point of including it: French uses the
 * ORDINAL for the 1st and the plain number from the 2nd on.
 */
export const DAY_WORDS: Record<number, string> = {
  1: "premier", 2: "deux", 3: "trois", 5: "cinq",
  10: "dix", 15: "quinze", 20: "vingt",
};

/**
 * Birth years, `deux mille` + a number from SIO-007 (0-20). Lives here rather
 * than in avoir-etats.gen.ts because both stops need it and one list cannot
 * disagree with itself: SIO-018 uses it for « votre date de naissance » and
 * SIO-019 for « Je suis né en… ».
 *
 * Note it is NOT the same range as `yearWords` below. A CURRENT year is
 * 2020-2069 — this stop's own numbers. A BIRTH year for this cohort is 2003-08,
 * which needs numbers from SIO-007. Both honour Dan's ceiling (the part after
 * `deux mille` stays under 70); they just draw on different taught ranges.
 */
/**
 * The date as French WRITES it. `premier` is spoken, `1er` is written, and the
 * plain numeral `1` is neither — French never writes « 1 octobre ».
 *
 * This existed as a bug first: the prompt above the full-date card printed
 * `1 octobre 2061` while the card's own comment two screens up explained that
 * the 1st takes an ordinal. The learner was not choosing that numeral — the
 * generator printed it — so it fails the « Bon chance » test: a wrong form the
 * machine produced teaches the machine's mistake, not the learner's.
 */
export function dayNumeral(day: number): string {
  return day === 1 ? "1er" : String(day);
}

export const BIRTH_YEARS: Record<number, string> = {
  2003: "deux mille trois", 2004: "deux mille quatre", 2005: "deux mille cinq",
  2006: "deux mille six", 2007: "deux mille sept", 2008: "deux mille huit",
};

/** 2020-2069, written out. `mille` never takes an -s. */
export function yearWords(n: number): string {
  return `deux mille ${NUMBERS[n]}`;
}

type Mode = "age" | "prix" | "quantite" | "date";

export const NOMBRES_AXES: DiceAxis[] = [
  {
    key: "usage",
    label: "Situation",
    options: [
      { value: "age", label: "l'âge (age)" },
      { value: "prix", label: "le prix (price)" },
      { value: "quantite", label: "la quantité (quantity)" },
      { value: "date", label: "la date (the date)" },
    ],
  },
  {
    key: "number",
    label: "Nombre",
    options: NUMBER_KEYS.map((n) => ({ value: String(n), label: `${n} — ${NUMBERS[n]}` })),
  },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function otherNumbers(n: number, count: number, feminine = false): string[] {
  const rest = NUMBER_KEYS.filter((x) => x !== n);
  const out: string[] = [];
  while (out.length < count && rest.length) {
    out.push(numberFor(rest.splice(Math.floor(Math.random() * rest.length), 1)[0], feminine));
  }
  return out;
}

export function nombresQuestion(pinned?: Record<string, string>): DiceQuestion {
  const pinnedN = Number(pinned?.number);
  const n = NUMBER_KEYS.includes(pinnedN) ? pinnedN : pick(NUMBER_KEYS);
  const mode: Mode =
    pinned?.usage === "age" || pinned?.usage === "prix" ||
    pinned?.usage === "quantite" || pinned?.usage === "date"
      ? pinned.usage
      : pick(["age", "prix", "quantite", "date"] as const);

  if (mode === "age") {
    // avoir, not être — the single most common English-speaker error here, so
    // the distractors are the sentence with être and the sentence without `ans`.
    const word = numberFor(n, false);
    const correct = `J'ai ${word} ans.`;
    return {
      meta: "l'âge 🎂",
      big: `« Tu as quel âge ? »  → ${n}`,
      en: `I am ${n} years old.`,
      correct,
      alternates: [`J'ai ${word} ans`],
      easyOptions: [
        correct,
        `Je suis ${word} ans.`,
        `J'ai ${word}.`,
        `Je suis ${word}.`,
      ],
      med: { before: "J'ai", choices: [`${word} ans`, ...otherNumbers(n, 3).map((w) => `${w} ans`)], correct: `${word} ans`, after: "." },
    };
  }

  if (mode === "prix") {
    const thing = pick(PRICE_THINGS);
    const word = numberFor(n, false);
    const correct = `Ça coûte ${word} euros.`;
    return {
      meta: "le prix 💶",
      big: `« ${thing.fr.charAt(0).toUpperCase()}${thing.fr.slice(1)}, c'est combien ? »  → ${n} €`,
      en: `It costs ${n} euros.`,
      correct,
      alternates: [`Ça coûte ${word} euros`, `C'est ${word} euros.`],
      easyOptions: [
        correct,
        `Ça coûte ${word} euro.`,
        ...otherNumbers(n, 2).map((w) => `Ça coûte ${w} euros.`),
      ],
      med: { before: "Ça coûte", choices: [word, ...otherNumbers(n, 3)], correct: word, after: "euros." },
    };
  }

  if (mode === "date") {
    // Five shapes, because a date is several different sentences in English's
    // head and one habit in French's: `en` before a month AND before a year,
    // and nothing at all between the parts of a full date.
    // THE NUMBER PIN HAS TO SURVIVE THE SHAPE ROLL. Three of these five shapes
    // never use `n`: « le mois » is a month, and a birth date or an anniversary
    // is a day plus a month (plus, for a birth, a year from BIRTH_YEARS, which
    // is 2003-08 and not this stop's 20-69). So a learner who picks
    // « 44 — quarante-quatre » in the Nombre dropdown and rolls one of those
    // gets a card with no 44 anywhere in it, and the dropdown has lied to them.
    // Caught by verify46, which pins each axis and fails when two pins produce
    // the same card.
    const usesNumber = ["annee", "date"] as const;
    const shape = NUMBER_KEYS.includes(Number(pinned?.number))
      ? pick(usesNumber)
      : pick(["mois", "annee", "date", "naissance", "anniversaire"] as const);
    const month = pick(MONTHS);

    if (shape === "mois") {
      const correct = `On est en ${month}.`;
      return {
        meta: "le mois 📅",
        big: `« C'est quel mois ? »  → ${month}`,
        en: `It's ${MONTHS_EN[month]}.`,
        correct,
        alternates: [`On est en ${month}`, `C'est le mois de ${month}.`],
        easyOptions: [
          correct,
          // the capital is the trap SIO-004 already named for the days
          `On est en ${month.charAt(0).toUpperCase()}${month.slice(1)}.`,
          `On est ${month}.`,
          `On est à ${month}.`,
        ],
        med: {
          before: "On est",
          choices: ["en " + month, "à " + month, "le " + month, "de " + month],
          correct: `en ${month}`,
          after: ".",
        },
      };
    }

    if (shape === "annee") {
      const year = yearWords(n);
      const correct = `Nous sommes en ${year}.`;
      return {
        meta: "l'année 🗓️",
        big: `« On est en quelle année ? »  → 20${n}`,
        en: `We're in 20${n}.`,
        correct,
        alternates: [`Nous sommes en ${year}`, `On est en ${year}.`],
        easyOptions: [
          correct,
          // English says "twenty twenty-five"; French cannot. `deux milles`
          // with an -s is the other reliable slip.
          `Nous sommes en vingt ${NUMBERS[n]}.`,
          `Nous sommes en deux milles ${NUMBERS[n]}.`,
          `Nous sommes ${year}.`,
        ],
        med: {
          before: "Nous sommes en",
          choices: [year, `vingt ${NUMBERS[n]}`, `deux milles ${NUMBERS[n]}`, `mille ${NUMBERS[n]}`],
          correct: year,
          after: ".",
        },
      };
    }

    if (shape === "naissance" || shape === "anniversaire") {
      // THE YEAR IS THE DIFFERENCE, and that is the lesson (Dan, 2026-09-05:
      // *"C'est le ..... (+ or - the year)"*). A date de naissance happened
      // once, so it carries a year; an anniversaire comes round every year, so
      // it cannot. Asking both and answering them differently is what makes
      // the year meaningful rather than optional decoration.
      const d = pick(Object.keys(DAY_WORDS).map(Number));
      const dw = DAY_WORDS[d];
      const m2 = pick(MONTHS);
      const withYear = shape === "naissance";
      const by = pick(Object.keys(BIRTH_YEARS).map(Number));
      const tail = withYear ? ` ${BIRTH_YEARS[by]}` : "";
      const q = withYear
        ? "Quelle est votre date de naissance ?"
        : "Quelle est la date de votre anniversaire ?";
      const correct = `C'est le ${dw} ${m2}${tail}.`;
      return {
        meta: withYear ? "la naissance 👶" : "l'anniversaire 🎂",
        big: `« ${q} »`,
        en: withYear
          ? `It's ${d} ${MONTHS_EN[m2]} ${by}.`
          : `It's ${d} ${MONTHS_EN[m2]}.`,
        correct,
        alternates: [`C'est le ${dw} ${m2}${tail}`, `Le ${dw} ${m2}${tail}.`],
        easyOptions: [
          correct,
          // the two habits English brings: an `of`, and a `the` on the month
          `C'est le ${dw} ${deMonth(m2)}${tail}.`,
          `C'est ${dw} ${m2}${tail}.`,
          // and the one this pair exists to teach: the wrong year policy
          withYear
            ? `C'est le ${dw} ${m2}.`
            : `C'est le ${dw} ${m2} ${BIRTH_YEARS[by]}.`,
        ],
        med: {
          before: `C'est le ${dw}`,
          choices: [`${m2}${tail}`, `${deMonth(m2)}${tail}`, `le ${m2}${tail}`],
          correct: `${m2}${tail}`,
          after: ".",
        },
      };
    }

    const day = pick(Object.keys(DAY_WORDS).map(Number));
    const dayWord = DAY_WORDS[day];
    const year = yearWords(n);
    const correct = `C'est le ${dayWord} ${month} ${year}.`;
    return {
      meta: "la date complète 📆",
      big: `${dayNumeral(day)} ${month} 20${n}`,
      en: `It's ${day} ${MONTHS_EN[month]} 20${n}.`,
      correct,
      alternates: [`C'est le ${dayWord} ${month} ${year}`, `Le ${dayWord} ${month} ${year}.`],
      easyOptions: [
        correct,
        // English's "of" and "the" both want to appear and neither may
        `C'est le ${dayWord} ${deMonth(month)} ${year}.`,
        `C'est ${dayWord} ${month} ${year}.`,
        `C'est le ${dayWord} ${month} en ${year}.`,
      ],
      med: {
        before: `C'est le ${dayWord} ${month}`,
        choices: [year, `en ${year}`, `de ${year}`, `l'an ${year}`],
        correct: year,
        after: ".",
      },
    };
  }

  const noun = pick(QUANTITY_NOUNS);
  const word = numberFor(n, noun.f);
  const correct = `Il y a ${word} ${noun.fr}.`;
  return {
    meta: "la quantité 🔢",
    big: `${n} ${noun.fr}`,
    en: `There are ${n} ${noun.en}.`,
    correct,
    alternates: [`Il y a ${word} ${noun.fr}`],
    easyOptions: [
      correct,
      ...otherNumbers(n, 3, noun.f).map((w) => `Il y a ${w} ${noun.fr}.`),
    ],
    med: { before: "Il y a", choices: [word, ...otherNumbers(n, 3, noun.f)], correct: word, after: `${noun.fr}.` },
  };
}
