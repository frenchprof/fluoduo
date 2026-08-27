/**
 * Native "Se présenter" lesson — ONE objective: NAMES (SIO-001).
 *
 * Dan, 2026-08-27: "for Unit 0 Lesson 1 there is too much going on", then the
 * rule behind it — "the original intention (and is still the current
 * intention) is to have the objectives broken down into bitesized objectives.
 * so having four things at one go is not cool."
 *
 * It had four. The Mémo opened on name + age + nationality + family — four
 * structures over three verbs (s'appeler, avoir, être) plus « il y a » — and
 * the generator then picked one of those four AT RANDOM per card, so roughly
 * three cards in four asked about something SIO-001 never promised.
 *
 * The three intruders are not homeless; they already own stops of their own,
 * LATER in the course, so Lesson 1 was teaching Unit 1 material to a learner
 * who has not reached Unit 1:
 *
 *   age          → SIO-019 "Avoir — age & states"  (avoir-etats.tsx)
 *   nationality  → SIO-016 "Nationalities"         (nationalities.tsx)
 *   family       → no owner; out of scope here either way
 *
 * So nothing is thrown away by cutting them out — they go home. And the two
 * things SIO-001 DOES promise, both of which were missing entirely, arrive:
 * asking a name (Comment tu t'appelles ? / Comment vous vous appelez ?) and
 * M./Mme as a form of address. Checked before writing: the old file had zero
 * occurrences of "Comment" and zero of "M." / "Mme".
 *
 * être and avoir leave the conjugation table with them. A learner meeting
 * s'appeler for the first time does not need two more verbs beside it, and
 * conjugaison-u1.tsx already drills all three together for the stops that
 * want that.
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
const CONJ_ROWS = [
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

export const sePresenterLesson: NativeLesson = {
  slug: "se-presenter",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">Se présenter</h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>Moi — <i lang="fr"><b>Je m&rsquo;appelle</b> Thomas.</i></li>
        <li>Quelqu&rsquo;un d&rsquo;autre — <i lang="fr"><b>Il s&rsquo;appelle</b> Lucas. <b>Elle s&rsquo;appelle</b> Emma.</i></li>
        <li>Demander (tu) — <i lang="fr"><b>Comment tu t&rsquo;appelles ?</b></i></li>
        <li>Demander (vous) — <i lang="fr"><b>Comment vous vous appelez ?</b></i></li>
        <li>Poliment — <i lang="fr">Bonjour, <b>Madame</b> Martin. Au revoir, <b>Monsieur</b> Dubois.</i></li>
      </ul>
      <table className="mt-3 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left">
            <th className="p-1" />
            <th className="p-1">s&rsquo;appeler</th>
          </tr>
        </thead>
        <tbody>
          {CONJ_ROWS.map(([p, ap]) => (
            <tr key={p} className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 font-bold">{p}</td>
              <td className="p-1 text-[color:var(--gram-neutral)]">{ap}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <span lang="fr"><i>S&rsquo;appeler</i></span> carries a little pronoun that changes with the subject:
        <span lang="fr"><i> je <b>m&rsquo;</b>appelle, tu <b>t&rsquo;</b>appelles, il <b>s&rsquo;</b>appelle</i></span>.
        With <span lang="fr"><i>vous</i></span> that pronoun is <span lang="fr"><i>vous</i></span> too, so the word really does appear twice:
        <span lang="fr"><i> <b>vous vous</b> appelez</i></span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Names: say one, ask for one, or address someone politely.",
    newQuestion() {
      // THREE TASKS, ONE OBJECTIVE (Dan's bite-sized rule). Each is a way of
      // handling a NAME — say it, ask it, use a title — so the card can vary
      // without the lesson changing subject. The old generator switched topic
      // (and verb) between cards, which is what "too much going on" was.
      const task = pick(["say", "ask", "title"] as const);

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
          en: `greet ${t.en} ${sur} politely`,
          correct,
          alternates: [`Bonjour ${t.full} ${sur}.`, `Bonjour, ${t.t} ${sur}.`],
          easyOptions: [correct, `Bonjour, ${other.full} ${sur}.`, `Bonjour, ${sur}.`, `Bonjour, ${t.full}.`],
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
    },
  },
  bonus: [
    { en: "My name is Thomas.", fr: "Je m'appelle Thomas." },
    { en: "His name is Lucas.", fr: "Il s'appelle Lucas." },
    { en: "Her name is Emma.", fr: "Elle s'appelle Emma." },
    { en: "Their names are Paul and Thomas.", fr: "Ils s'appellent Paul et Thomas." },
    { en: "What's your name? (to a friend)", fr: "Comment tu t'appelles ?", alt: ["Tu t'appelles comment ?"] },
    { en: "What's your name? (to a teacher)", fr: "Comment vous vous appelez ?", alt: ["Vous vous appelez comment ?"] },
    { en: "Hello, Mrs Martin.", fr: "Bonjour, Madame Martin.", alt: ["Bonjour Madame Martin.", "Bonjour, Mme Martin."] },
    { en: "Goodbye, Mr Dubois.", fr: "Au revoir, Monsieur Dubois.", alt: ["Au revoir Monsieur Dubois.", "Au revoir, M. Dubois."] },
  ],
};
