/**
 * The conjugaison-u1 generator — the paradigm data and the question maker,
 * split out of conjugaison-u1.tsx (2026-08-28).
 *
 * WHY IT IS ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx. That made the generator
 * unreachable from a check — and a generator that silently ignores a pinned
 * axis looks in source exactly like one that honours it, so reading the code
 * proves nothing. With the data and the maker here, verify41 imports this
 * module and EXECUTES it against every pin combination. The .tsx keeps the
 * Mémo (and the table it renders from SLOTS/CONJ, re-exported below).
 *
 * The reference implementation of DiceConfig.axes: the axes a lesson declares
 * are the axes its generator honours, and both live in one file so they cannot
 * drift apart.
 */
import type { DiceAxis, DiceQuestion } from "./types";

export type Slot = "je" | "tu" | "il" | "nous" | "vous" | "ils";
export const SLOTS: readonly Slot[] = ["je", "tu", "il", "nous", "vous", "ils"];

export const SUBJECTS = [
  { disp: "Je", slot: "je", en: "I" }, { disp: "Tu", slot: "tu", en: "you (sg.)" },
  { disp: "Il", slot: "il", en: "he" }, { disp: "Elle", slot: "il", en: "she" },
  { disp: "Nous", slot: "nous", en: "we" }, { disp: "Vous", slot: "vous", en: "you (pl.)" },
  { disp: "Ils", slot: "ils", en: "they (m.)" }, { disp: "Elles", slot: "ils", en: "they (f.)" },
] as const;

export const VERBS = ["s'appeler", "être", "avoir"] as const;
export type Verb = (typeof VERBS)[number];

export const CONJ: Record<Verb, { en: string; aff: Record<Slot, string>; neg: Record<Slot, string> }> = {
  "s'appeler": {
    en: "to be called",
    aff: { je: "m'appelle", tu: "t'appelles", il: "s'appelle", nous: "nous appelons", vous: "vous appelez", ils: "s'appellent" },
    neg: { je: "ne m'appelle pas", tu: "ne t'appelles pas", il: "ne s'appelle pas", nous: "ne nous appelons pas", vous: "ne vous appelez pas", ils: "ne s'appellent pas" },
  },
  "être": {
    en: "to be",
    aff: { je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" },
    neg: { je: "ne suis pas", tu: "n'es pas", il: "n'est pas", nous: "ne sommes pas", vous: "n'êtes pas", ils: "ne sont pas" },
  },
  "avoir": {
    en: "to have",
    aff: { je: "ai", tu: "as", il: "a", nous: "avons", vous: "avez", ils: "ont" },
    neg: { je: "n'ai pas", tu: "n'as pas", il: "n'a pas", nous: "n'avons pas", vous: "n'avez pas", ils: "n'ont pas" },
  },
};

export const SUBJ_LABELS: Record<Slot, string> = {
  je: "je / j'", tu: "tu", il: "il / elle / on", nous: "nous", vous: "vous", ils: "ils / elles",
};

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

/** Je + voyelle → J' (J'ai — but Je n'ai pas). */
const merge = (disp: string, form: string) =>
  disp === "Je" && /^[aeiouéèêh]/i.test(form) ? `J'${form}` : `${disp} ${form}`;

/** The three axes this lesson varies — what the pager's dropdowns offer. */
export const CONJ_U1_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "verb", label: "Verbe", options: VERBS.map((v) => ({ value: v, label: v })) },
  {
    key: "polarity",
    label: "Forme",
    options: [
      { value: "aff", label: "affirmatif" },
      { value: "neg", label: "négatif" },
    ],
  },
];

/**
 * One question. Any axis present in `pinned` is honoured; anything absent (or
 * "") is rolled, so an unsteered call behaves exactly as it did before the
 * selectors existed.
 */
export function conjugaisonU1Question(pinned?: Record<string, string>): DiceQuestion {
  const s = SUBJECTS.find((x) => x.disp === pinned?.subject) ?? pick(SUBJECTS);
  const v = (VERBS as readonly string[]).includes(pinned?.verb ?? "")
    ? (pinned!.verb as Verb)
    : pick(VERBS);
  const pol = pinned?.polarity === "aff" || pinned?.polarity === "neg"
    ? pinned.polarity
    : pick(["aff", "neg"] as const);
  const forms = CONJ[v][pol];
  const all = SLOTS.map((sl) => merge(s.disp, forms[sl]));
  const correct = merge(s.disp, forms[s.slot]);
  return {
    meta: pol === "aff" ? "affirmatif ✅" : "négatif 🚫",
    big: `${s.disp.toLowerCase()} + ${v}`,
    en: `${s.en} + ${CONJ[v].en}${pol === "neg" ? " (negative)" : ""}`,
    correct,
    easyOptions: [correct, ...others(all, correct, 3)],
    med: { before: "", choices: all, correct, after: "" },
  };
}
