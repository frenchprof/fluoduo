/**
 * Native "Se présenter" lesson (Unité 1) — distilled from 01-se-presenter.html:
 * the Mémo (structures + conjugations) + the 🎲 dice trainer (subject × topic
 * pools) + EN→FR bonus, following the aimer.tsx template.
 */
import type { NativeLesson } from "./types";

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
const ETRE: Record<Slot, string> = { je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" };
const AVOIR: Record<Slot, string> = { je: "ai", tu: "as", il: "a", nous: "avons", vous: "avez", ils: "ont" };

const NAMES = { m: ["Lucas", "Hugo", "Thomas", "Léo", "Nathan"], f: ["Emma", "Chloé", "Léa", "Manon", "Inès"] } as const;
const AGES = [
  { fr: "treize", en: "thirteen" }, { fr: "quatorze", en: "fourteen" }, { fr: "quinze", en: "fifteen" },
  { fr: "seize", en: "sixteen" }, { fr: "dix-sept", en: "seventeen" }, { fr: "dix-huit", en: "eighteen" },
] as const;
const NATS = [
  { m: "français", f: "française", en: "French" }, { m: "anglais", f: "anglaise", en: "English" },
  { m: "chinois", f: "chinoise", en: "Chinese" }, { m: "japonais", f: "japonaise", en: "Japanese" },
  { m: "espagnol", f: "espagnole", en: "Spanish" }, { m: "allemand", f: "allemande", en: "German" },
  { m: "américain", f: "américaine", en: "American" }, { m: "canadien", f: "canadienne", en: "Canadian" },
  { m: "italien", f: "italienne", en: "Italian" }, { m: "portugais", f: "portugaise", en: "Portuguese" },
] as const;
const FAMILY = [2, 3, 4, 5, 6] as const;
const POSS = ["ma", "ta", "sa", "notre", "votre", "leur"] as const;

const CONJ_ROWS = [
  ["je / j'", "m'appelle", "suis", "ai"],
  ["tu", "t'appelles", "es", "as"],
  ["il / elle / on", "s'appelle", "est", "a"],
  ["nous", "nous appelons", "sommes", "avons"],
  ["vous", "vous appelez", "êtes", "avez"],
  ["ils / elles", "s'appellent", "sont", "ont"],
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
/** n random distinct entries of `a` other than `not`. */
function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}
/** Je + voyelle → J' (J'ai quinze ans). */
const merge = (disp: string, form: string) =>
  disp === "Je" && /^[aeiouéèêh]/i.test(form) ? `J'${form}` : `${disp} ${form}`;
const natForm = (n: (typeof NATS)[number], g: "m" | "f", pl: boolean) => {
  const base = g === "f" ? n.f : n.m;
  return pl && !base.endsWith("s") ? `${base}s` : base;
};

export const sePresenterLesson: NativeLesson = {
  slug: "se-presenter",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">Se présenter</h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>Nom — <i lang="fr"><b>Je m&rsquo;appelle</b> Thomas.</i></li>
        <li>Âge — <i lang="fr"><b>J&rsquo;ai</b> quinze <b>ans</b>.</i></li>
        <li>Nationalité — <i lang="fr"><b>Je suis</b> français / français<b>e</b>.</i></li>
        <li>Famille — <i lang="fr"><b>Il y a</b> 4 personnes dans <b>ma</b> famille.</i></li>
      </ul>
      <table className="mt-3 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left">
            <th className="p-1" />
            <th className="p-1">s&rsquo;appeler</th>
            <th className="p-1">être</th>
            <th className="p-1">avoir</th>
          </tr>
        </thead>
        <tbody>
          {CONJ_ROWS.map(([p, ap, et, av]) => (
            <tr key={p} className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 font-bold">{p}</td>
              <td className="p-1 text-[color:var(--cahier-la)]">{ap}</td>
              <td className="p-1 text-[color:var(--cahier-la)]">{et}</td>
              <td className="p-1 text-[color:var(--cahier-la)]">{av}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ Age uses <b>avoir</b>: <span lang="fr"><i>J&rsquo;ai quinze ans</i></span> — never <i lang="fr">Je suis quinze</i>.
        Nationality agrees: <span lang="fr"><i>elle est français<b>e</b>, ils sont espagnol<b>s</b></i></span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Introduce the person: name, age, nationality or family.",
    newQuestion() {
      const s = pick(SUBJECTS);
      const topic = pick(s.pl ? (["age", "nat", "family"] as const) : (["name", "age", "nat", "family"] as const));

      if (topic === "name") {
        const name = pick(NAMES[s.g]);
        const forms = Object.values(APPELER);
        const correct = `${s.disp} ${APPELER[s.slot]} ${name}.`;
        return {
          meta: `${s.label} → nom`,
          big: name,
          en: `name: ${name}`,
          correct,
          easyOptions: [correct, ...others(forms, APPELER[s.slot], 3).map((f) => `${s.disp} ${f} ${name}.`)],
          med: { before: s.disp, choices: forms, correct: APPELER[s.slot], after: `${name}.` },
        };
      }

      if (topic === "age") {
        const age = pick(AGES);
        const svAll = (Object.values(AVOIR) as string[]).map((f) => merge(s.disp, f));
        const sv = merge(s.disp, AVOIR[s.slot]);
        const correct = `${sv} ${age.fr} ans.`;
        return {
          meta: `${s.label} → âge`,
          big: `${age.fr} ans`,
          en: `${age.en} years old`,
          correct,
          easyOptions: [correct, ...others(svAll, sv, 3).map((x) => `${x} ${age.fr} ans.`)],
          med: { before: "", choices: svAll, correct: sv, after: `${age.fr} ans.` },
        };
      }

      if (topic === "nat") {
        const n = pick(NATS);
        const adj = natForm(n, s.g, s.pl);
        const wrongAdj = natForm(n, s.g === "m" ? "f" : "m", s.pl);
        const correct = `${s.disp} ${ETRE[s.slot]} ${adj}.`;
        return {
          meta: `${s.label} → nationalité`,
          big: adj,
          en: n.en,
          correct,
          easyOptions: [
            correct,
            ...others(Object.values(ETRE), ETRE[s.slot], 2).map((f) => `${s.disp} ${f} ${adj}.`),
            `${s.disp} ${ETRE[s.slot]} ${wrongAdj}.`,
          ],
          med: { before: s.disp, choices: Object.values(ETRE), correct: ETRE[s.slot], after: `${adj}.` },
        };
      }

      const n = pick(FAMILY);
      const tail = `personnes dans ${s.poss} famille.`;
      const correct = `Il y a ${n} ${tail}`;
      return {
        meta: `${s.label} → famille`,
        big: `${n} personnes`,
        en: `${n} people in the family`,
        correct,
        easyOptions: [
          correct,
          `Il a ${n} ${tail}`,
          `Il est ${n} ${tail}`,
          `Il y a ${n} personnes dans ${pick(POSS.filter((p) => p !== s.poss))} famille.`,
        ],
        med: { before: "Il", choices: ["y a", "a", "est", "sont"], correct: "y a", after: `${n} ${tail}` },
      };
    },
  },
  bonus: [
    { en: "My name is Thomas.", fr: "Je m'appelle Thomas." },
    { en: "I am fifteen years old.", fr: "J'ai quinze ans." },
    { en: "I am French. (boy)", fr: "Je suis français." },
    { en: "I am French. (girl)", fr: "Je suis française." },
    { en: "I am Japanese. (girl)", fr: "Je suis japonaise." },
    { en: "There are 4 people in my family.", fr: "Il y a 4 personnes dans ma famille." },
    { en: "He is Spanish.", fr: "Il est espagnol." },
    { en: "She is German.", fr: "Elle est allemande." },
    { en: "He is fourteen years old.", fr: "Il a quatorze ans." },
    { en: "She is seventeen years old.", fr: "Elle a dix-sept ans." },
  ],
};
