/**
 * The se-presenter generator — data, axes and question maker, split out of
 * se-presenter.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1 } from "./axis.ts";

type Slot = "je" | "tu" | "il" | "nous" | "vous" | "ils";

const SUBJECTS = [
  { label: "je (garçon)", disp: "Je", slot: "je", g: "m", pl: false, poss: "ma" },
  { label: "je (fille)", disp: "Je", slot: "je", g: "f", pl: false, poss: "ma" },
  { label: "tu (garçon)", disp: "Tu", slot: "tu", g: "m", pl: false, poss: "ta" },
  { label: "tu (fille)", disp: "Tu", slot: "tu", g: "f", pl: false, poss: "ta" },
  { label: "il", disp: "Il", slot: "il", g: "m", pl: false, poss: "sa" },
  { label: "elle", disp: "Elle", slot: "il", g: "f", pl: false, poss: "sa" },
  { label: "nous", disp: "Nous", slot: "nous", g: "m", pl: true, poss: "notre" },
  { label: "vous", disp: "Vous", slot: "vous", g: "m", pl: true, poss: "votre" },
  { label: "ils", disp: "Ils", slot: "ils", g: "m", pl: true, poss: "leur" },
  { label: "elles", disp: "Elles", slot: "ils", g: "f", pl: true, poss: "leur" },
] as const;

const APPELER: Record<Slot, string> = { je: "m'appelle", tu: "t'appelles", il: "s'appelle", nous: "nous appelons", vous: "vous appelez", ils: "s'appellent" };

/** ASKING a name — the half of SIO-001's can-do that the lesson never taught.
 *  Both orders are current French and both are accepted; the inversion
 *  (« Comment t'appelles-tu ? ») is A2 and deliberately absent. */
const ASK = [
  { label: "tu", q: "Comment tu t'appelles ?", alt: ["Tu t'appelles comment ?"], en: "What's your name? (someone you say TU to)" },
  { label: "vous", q: "Comment vous vous appelez ?", alt: ["Vous vous appelez comment ?"], en: "What's your name? (someone you say VOUS to)" },
] as const;

/** M. / Mme — SIO-001 names it explicitly ("use M./Mme as forms of address")
 *  and the old lesson contained neither string. */
const TITLES = [
  { t: "M.", full: "Monsieur", g: "m" as const, en: "Mr" },
  { t: "Mme", full: "Madame", g: "f" as const, en: "Mrs / Ms" },
] as const;
const SURNAMES = ["Martin", "Dubois", "Bernard", "Petit", "Moreau"] as const;

const NAMES = { m: ["Lucas", "Hugo", "Thomas", "Léo", "Nathan"], f: ["Emma", "Chloé", "Léa", "Manon", "Inès"] } as const;

/** ONE verb. s'appeler is reflexive, so each row is pronoun + verb together —
 *  which is the actual difficulty here, not the endings. */
export const CONJ_ROWS = [
  ["je / j'", "m'appelle"],
  ["tu", "t'appelles"],
  ["il / elle / on", "s'appelle"],
  ["nous", "nous appelons"],
  ["vous", "vous appelez"],
  ["ils / elles", "s'appellent"],
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
/** n random distinct entries of `a` other than `not`. */
function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

/** The three ways of handling a name this lesson teaches — Dan's bite-sized
 *  rule keeps them one objective, and the axis lets a learner sit one at a
 *  time without the lesson changing subject. */
export const SE_PRESENTER_AXES: DiceAxis[] = [
  {
    key: "task",
    label: "Task",
    options: [
      { value: "say", label: "dire son nom" },
      { value: "ask", label: "demander" },
      { value: "title", label: "M. / Mme" },
    ],
  },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function sePresenterQuestion(pinned?: Record<string, string>): DiceQuestion {
      // THREE TASKS, ONE OBJECTIVE (Dan's bite-sized rule). Each is a way of
      // handling a NAME — say it, ask it, use a title — so the card can vary
      // without the lesson changing subject. The old generator switched topic
      // (and verb) between cards, which is what "too much going on" was.
  const TASKS = ["say", "ask", "title"] as const;
  const task = pinned1(TASKS, pinned?.task, (x) => x);

      if (task === "ask") {
        const a = pick(ASK);
        return {
          meta: `demander → ${a.label}`,
          big: a.en,
          en: `ask with « ${a.label} »`,
          correct: a.q,
          alternates: [...a.alt],
          easyOptions: [a.q, ...ASK.filter((x) => x !== a).map((x) => x.q), "Comment il s'appelle ?"],
          // The blank is the VERB only. Blanking "vous appelez" out of
          // "Comment vous vous appelez ?" left a lone « vous » in the frame
          // and asked the learner to type it again (Dan, 2026-08-27: "why do
          // we need two blanks to fill in the same blank"). Showing the
          // doubled pronoun and blanking the verb teaches the same point
          // without looking like a mistake.
          med: a.label === "tu"
            ? { before: "Comment tu t'", choices: ["appelles", "appelle", "appelez", "appellent"], correct: "appelles", after: " ?" }
            : { before: "Comment vous vous ", choices: ["appelez", "appelles", "appelle", "appellent"], correct: "appelez", after: " ?" },
        };
      }

      if (task === "title") {
        const t = pick(TITLES);
        const sur = pick(SURNAMES);
        const other = TITLES.find((x) => x !== t)!;
        const correct = `Bonjour, ${t.full} ${sur}.`;
        return {
          meta: `${t.en} → politesse`,
          big: `${t.en} ${sur}`,
          /* THE INTENDED MEANING, IN ENGLISH (Dan, 2026-09-15: *"what we need
             is a line to say: intended meaning in English"*) — the sentence
             itself, not an instruction about it. */
          en: `« Hello, ${t.en} ${sur}. » — politely`,
          correct,
          /* « Bonjour, Monsieur. » IS CORRECT FRENCH — arguably the more
             natural greeting — and it sat in easyOptions as a WRONG answer
             until Dan picked it (2026-09-15: *"why can't Monsieur be
             correct"*). The house rule (AGENTS.md, 1 Sep) lets a distractor
             be bad French, but it has to be a mistake a learner could make;
             a distractor that is simply another right answer marks a learner
             wrong for knowing the language. So the bare title is ACCEPTED,
             and its slot goes to the mistake the politesse card is actually
             about — the register clash of « Salut » with a title, which a
             learner does make. « Bonjour, Moreau. » stays: a bare surname is
             the impoliteness the card exists to train out. */
          alternates: [`Bonjour ${t.full} ${sur}.`, `Bonjour, ${t.t} ${sur}.`, `Bonjour, ${t.full}.`, `Bonjour ${t.full}.`],
          easyOptions: [correct, `Bonjour, ${other.full} ${sur}.`, `Bonjour, ${sur}.`, `Salut, ${t.full} ${sur}.`],
          med: { before: "Bonjour, ", choices: [t.full, other.full, "Mademoiselle"], correct: t.full, after: ` ${sur}.` },
        };
      }

      const sub = pick(SUBJECTS);
      const name = pick(NAMES[sub.g]);
      const forms = Object.values(APPELER);
      const correct = `${sub.disp} ${APPELER[sub.slot]} ${name}.`;
      return {
        meta: `${sub.label} → nom`,
        big: name,
        en: `name: ${name}`,
        correct,
        easyOptions: [correct, ...others(forms, APPELER[sub.slot], 3).map((f) => `${sub.disp} ${f} ${name}.`)],
        med: { before: sub.disp, choices: forms, correct: APPELER[sub.slot], after: `${name}.` },
      };
    }
