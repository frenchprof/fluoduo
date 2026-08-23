/**
 * Native "Conjugaison Unité 1" lesson — distilled from 03-conjugaison-u1.html:
 * s'appeler / être / avoir, affirmative + negative, all persons.
 * Mémo (cheat-sheet table) + 🎲 dice trainer (subject × verb × polarity) + bonus.
 */
import type { NativeLesson } from "./types";

type Slot = "je" | "tu" | "il" | "nous" | "vous" | "ils";
const SLOTS: readonly Slot[] = ["je", "tu", "il", "nous", "vous", "ils"];

const SUBJECTS = [
  { disp: "Je", slot: "je", en: "I" }, { disp: "Tu", slot: "tu", en: "you (sg.)" },
  { disp: "Il", slot: "il", en: "he" }, { disp: "Elle", slot: "il", en: "she" },
  { disp: "Nous", slot: "nous", en: "we" }, { disp: "Vous", slot: "vous", en: "you (pl.)" },
  { disp: "Ils", slot: "ils", en: "they (m.)" }, { disp: "Elles", slot: "ils", en: "they (f.)" },
] as const;

const VERBS = ["s'appeler", "être", "avoir"] as const;
type Verb = (typeof VERBS)[number];

const CONJ: Record<Verb, { en: string; aff: Record<Slot, string>; neg: Record<Slot, string> }> = {
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

const SUBJ_LABELS: Record<Slot, string> = { je: "je / j'", tu: "tu", il: "il / elle / on", nous: "nous", vous: "vous", ils: "ils / elles" };

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

export const conjugaisonU1Lesson: NativeLesson = {
  slug: "conjugaison-u1",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        S&rsquo;appeler · être · avoir
      </h2>
      <table className="w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left">
            <th className="p-1" />
            <th className="p-1">s&rsquo;appeler</th>
            <th className="p-1">être</th>
            <th className="p-1">avoir</th>
          </tr>
        </thead>
        <tbody>
          {SLOTS.map((sl) => (
            <tr key={sl} className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 font-bold">{SUBJ_LABELS[sl]}</td>
              <td className="p-1 text-[color:var(--gram-neutral)]">{CONJ["s'appeler"].aff[sl]}</td>
              <td className="p-1 text-[color:var(--gram-neutral)]">{CONJ["être"].aff[sl]}</td>
              <td className="p-1 text-[color:var(--gram-neutral)]">{CONJ["avoir"].aff[sl]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-sm text-[color:var(--cahier-ink)]">
        Négatif : <b>ne</b> + verbe + <b>pas</b> — <i lang="fr">Je <b>ne</b> suis <b>pas</b> · Je <b>ne</b> m&rsquo;appelle <b>pas</b></i>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ Before a vowel, <b>je → j&rsquo;</b> and <b>ne → n&rsquo;</b>:{" "}
        <span lang="fr"><i>j&rsquo;ai · tu n&rsquo;es pas · ils n&rsquo;ont pas</i></span>
      </p>
    </div>
  ),
  dice: {
    instruction: "Conjugate the verb for the given subject.",
    newQuestion() {
      const s = pick(SUBJECTS);
      const v = pick(VERBS);
      const pol = pick(["aff", "neg"] as const);
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
    },
  },
  bonus: [
    { en: "I am called Thomas. (affirm.)", fr: "Je m'appelle Thomas." },
    { en: "She is not called Emma. (neg.)", fr: "Elle ne s'appelle pas Emma." },
    { en: "We are French. (affirm.)", fr: "Nous sommes français." },
    { en: "They are not Spanish. (neg.)", fr: "Ils ne sont pas espagnols." },
    { en: "You (pl.) have a family. (affirm.)", fr: "Vous avez une famille." },
    { en: "He is not 15 years old. (neg.)", fr: "Il n'a pas 15 ans." },
    { en: "You (sg.) are English. (affirm.)", fr: "Tu es anglais." },
    { en: "I am not Japanese. (neg.)", fr: "Je ne suis pas japonais." },
    { en: "They are called Léa and Emma. (affirm.)", fr: "Elles s'appellent Léa et Emma." },
    { en: "We do not have a name. (neg.)", fr: "Nous n'avons pas de nom." },
  ],
};
