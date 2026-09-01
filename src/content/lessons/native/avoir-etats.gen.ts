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
import { startsWithVowelSound } from "../../../lib/frameFit.ts";

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
/**
 * « J'ai » but « Je suis » — elision needs a vowel to elide before.
 *
 * `elide: true` was applied unconditionally, so the être half of every Je card
 * read « J'suis chaud », « J'suis malade ». Found by driving all nine slotted
 * stops on 1 Sep, alongside « l'boxe », « à l'café » and « de l'vélo »; the
 * predicate is the one the deck supply uses (src/lib/frameFit.ts).
 */
const sv = (s: (typeof SUBJECTS)[number], verb: string) =>
  s.elide && startsWithVowelSound(verb) ? `J'${verb}` : `${s.disp} ${verb}`;

export const AVOIR_ETATS_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  {
    key: "round",
    label: "Type",
    options: [
      { value: "age", label: "l'âge" },
      { value: "avoir", label: "avoir + état" },
      { value: "etre", label: "être + état" },
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
