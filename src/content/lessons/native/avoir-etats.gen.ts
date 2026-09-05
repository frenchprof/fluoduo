/**
 * The avoir-etats generator — data, axes and question maker, split out of
 * avoir-etats.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1 } from "./axis.ts";
import { BIRTH_YEARS, MONTHS, MONTHS_EN } from "./nombres-echanges.gen.ts";

/**
 * BORN — né / née, added 2026-09-05 (Dan: SUP-CAL-03, *"né / née reusing the
 * SIO-010 role cue"*).
 *
 * IT LIVES HERE AND THAT IS A JUDGEMENT CALL, recorded because the next reader
 * will wonder. This stop's whole job is `avoir` for age against `être` for
 * states, and `Je suis né` is `être` + a past participle — a third thing. It
 * earns its place because a birth year is the same conversation as an age
 * (`J'ai vingt ans. Je suis né en deux mille cinq.`), and because the year it
 * needs was taught one stop earlier at SIO-018. The alternative home was
 * SIO-016, where `français → française` is already the same `-e` move; Dan was
 * shown both and chose this one.
 *
 * THE ROLE CUE IS NOT DECORATION. A learner cannot know whether to write `né`
 * or `née` from the French alone — `Je suis né(e)` sounds identical. So the
 * card names its speaker BEFORE the guess, the way SIO-010 does. Without the
 * cue this round would be a coin toss, which teaches nothing.
 */
const BORN_PEOPLE = [
  { name: "Marc", cue: "👨", f: false, third: "Il" },
  { name: "Léa", cue: "👩", f: true, third: "Elle" },
  { name: "Hugo", cue: "👨", f: false, third: "Il" },
  { name: "Chloé", cue: "👩", f: true, third: "Elle" },
] as const;


const AVOIR_STATES = [
  { fr: "faim", en: "hungry" },
  { fr: "soif", en: "thirsty" },
  // "hot"/"cold" alone glossed BOTH « Vous avez chaud » and the grammatical
  // « Vous êtes chaud » — English is the ambiguous side here, so the gloss
  // names the FEELING, which only the avoir version expresses (31 Aug audit).
  { fr: "chaud", en: "hot (feels hot)" },
  { fr: "froid", en: "cold (feels cold)" },
] as const;
const ETRE_STATES = [
  { fr: "fatigué", pl: "fatigués", en: "tired" },
  { fr: "content", pl: "contents", en: "happy" },
  { fr: "malade", pl: "malades", en: "sick" },
  { fr: "triste", pl: "tristes", en: "sad" },
  { fr: "calme", pl: "calmes", en: "calm" },
] as const;
const SUBJECTS = [
  { disp: "Je", avoir: "ai", etre: "suis", pl: false, elide: true },
  { disp: "Tu", avoir: "as", etre: "es", pl: false, elide: false },
  { disp: "Il", avoir: "a", etre: "est", pl: false, elide: false },
  { disp: "Ils", avoir: "ont", etre: "sont", pl: true, elide: false },
  { disp: "Nous", avoir: "avons", etre: "sommes", pl: true, elide: false },
  { disp: "Vous", avoir: "avez", etre: "êtes", pl: true, elide: false },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const sv = (s: (typeof SUBJECTS)[number], verb: string) =>
  s.elide ? `J'${verb}` : `${s.disp} ${verb}`;

export const AVOIR_ETATS_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  {
    key: "round",
    label: "Type",
    options: [
      { value: "age", label: "l'âge" },
      { value: "avoir", label: "avoir + état" },
      { value: "etre", label: "être + état" },
      { value: "naissance", label: "né / née" },
    ],
  },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function avoirEtatsQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  // avoir vs être is the whole lesson, and age is the case learners get
  // wrong most, so the round is an axis rather than two nested coin tosses.
  const round = pinned?.round;

  if (round === "naissance") {
    const p = pick(BORN_PEOPLE);
    const years = Object.keys(BIRTH_YEARS).map(Number);
    const y = pick(years);
    const yw = BIRTH_YEARS[y];
    const ne = p.f ? "née" : "né";
    const wrong = p.f ? "né" : "née";
    // Half the cards are first person and half third, because the ending
    // depends on WHO IS BORN and not on the pronoun — `Je suis née` and
    // `Elle est née` take the same -e for the same reason.
    if (Math.random() < 0.5) {
      const month = pick(MONTHS);
      return {
        // The year is deliberately NOT in this cue. It was, and the sentence
        // never used it — a learner reading "Hugo, August 2003" then writing
        // « Il est né en août » is being shown a number that cannot help them
        // answer. The cue carries exactly what decides the ending (who) and
        // what the sentence needs (which month).
        meta: `${p.cue} ${p.name} — ${MONTHS_EN[month]}`,
        big: `${p.name} · ${month}`,
        en: `${p.third === "Il" ? "He" : "She"} was born in ${MONTHS_EN[month]}.`,
        correct: `${p.third} est ${ne} en ${month}.`,
        alternates: [`${p.third} est ${ne} en ${month}`],
        easyOptions: [
          `${p.third} est ${ne} en ${month}.`,
          `${p.third} est ${wrong} en ${month}.`,
          `${p.third} a ${ne} en ${month}.`,
        ],
        med: {
          before: `${p.third} est`,
          choices: [ne, wrong],
          correct: ne,
          after: `en ${month}.`,
        },
      };
    }
    return {
      meta: `${p.cue} ${p.name} parle — ${y}`,
      big: `${p.name} · ${y}`,
      en: `I was born in ${y}.`,
      correct: `Je suis ${ne} en ${yw}.`,
      alternates: [`Je suis ${ne} en ${yw}`],
      easyOptions: [
        `Je suis ${ne} en ${yw}.`,
        `Je suis ${wrong} en ${yw}.`,
        // avoir is this stop's other habit and the reliable slip here
        `J'ai ${ne} en ${yw}.`,
      ],
      med: {
        before: "Je suis",
        choices: [ne, wrong],
        correct: ne,
        after: `en ${yw}.`,
      },
    };
  }

  if (round === "age" || (!round && Math.random() < 0.25)) {
        // Age round — always avoir.
        const n = 17 + Math.floor(Math.random() * 9);
        return {
          meta: `${s.disp} … ${n} (age)`,
          big: `${n} ans`,
          en: `${s.disp.toLowerCase()} — to be ${n} years old`,
          correct: `${sv(s, s.avoir)} ${n} ans.`,
          easyOptions: [`${sv(s, s.avoir)} ${n} ans.`, `${sv(s, s.etre)} ${n} ans.`],
          med: { before: s.disp, choices: [s.avoir, s.etre], correct: s.avoir, after: `${n} ans.` },
        };
      }
  if (round === "avoir" || (!round && Math.random() < 0.5)) {
        const st = pick(AVOIR_STATES);
        return {
          meta: `${s.disp} … (${st.en})`,
          big: st.fr,
          en: st.en,
          correct: `${sv(s, s.avoir)} ${st.fr}.`,
          easyOptions: [`${sv(s, s.avoir)} ${st.fr}.`, `${sv(s, s.etre)} ${st.fr}.`],
          med: { before: s.disp, choices: [s.avoir, s.etre], correct: s.avoir, after: `${st.fr}.` },
        };
      }
      const st = pick(ETRE_STATES);
      const adj = s.pl ? st.pl : st.fr;
      const wrongAdj = s.pl ? st.fr : st.pl;
      return {
        meta: `${s.disp} … (${st.en})`,
        big: st.fr,
        en: st.en,
        correct: `${sv(s, s.etre)} ${adj}.`,
        easyOptions: [
          `${sv(s, s.etre)} ${adj}.`,
          `${sv(s, s.avoir)} ${adj}.`,
          `${sv(s, s.etre)} ${wrongAdj}.`,
        ],
        med: { before: s.disp, choices: [s.avoir, s.etre], correct: s.etre, after: `${adj}.` },
      };
    }
