/**
 * Native "Nationalités" lesson (Unité 1) — authored 2026-08-23 to the
 * LESSON_PLAN U1 #7 row (country → the 4 agreed forms) and the Atelier U1
 * grammar box « L'accord des adjectifs de nationalité » (+ e pour une femme,
 * + s pour le pluriel, -ien → -ienne): Mémo + 🎲 dice trainer + EN→FR bonus.
 * Countries and all four forms come from the nationalities deck's `nat` data.
 */
import type { NativeLesson } from "./types";

type FormKey = "ms" | "fs" | "mp" | "fp";

const COUNTRIES = [
  { pays: "la France", en: "France", ms: "français", fs: "française", mp: "français", fp: "françaises" },
  { pays: "la Chine", en: "China", ms: "chinois", fs: "chinoise", mp: "chinois", fp: "chinoises" },
  { pays: "le Portugal", en: "Portugal", ms: "portugais", fs: "portugaise", mp: "portugais", fp: "portugaises" },
  { pays: "l'Angleterre", en: "England", ms: "anglais", fs: "anglaise", mp: "anglais", fp: "anglaises" },
  { pays: "la Tunisie", en: "Tunisia", ms: "tunisien", fs: "tunisienne", mp: "tunisiens", fp: "tunisiennes" },
  { pays: "l'Indonésie", en: "Indonesia", ms: "indonésien", fs: "indonésienne", mp: "indonésiens", fp: "indonésiennes" },
  { pays: "la Corée", en: "Korea", ms: "coréen", fs: "coréenne", mp: "coréens", fp: "coréennes" },
  { pays: "le Mexique", en: "Mexico", ms: "mexicain", fs: "mexicaine", mp: "mexicains", fp: "mexicaines" },
  { pays: "les États-Unis", en: "United States", ms: "américain", fs: "américaine", mp: "américains", fp: "américaines" },
  { pays: "l'Allemagne", en: "Germany", ms: "allemand", fs: "allemande", mp: "allemands", fp: "allemandes" },
  { pays: "la Russie", en: "Russia", ms: "russe", fs: "russe", mp: "russes", fp: "russes" },
  { pays: "la Suisse", en: "Switzerland", ms: "suisse", fs: "suisse", mp: "suisses", fp: "suisses" },
  { pays: "la Grèce", en: "Greece", ms: "grec", fs: "grecque", mp: "grecs", fp: "grecques" },
  { pays: "la Turquie", en: "Turkey", ms: "turc", fs: "turque", mp: "turcs", fp: "turques" },
] as const;

const SUBJECTS: { disp: string; verb: string; key: FormKey; en: string }[] = [
  { disp: "Il", verb: "est", key: "ms", en: "he" },
  { disp: "Elle", verb: "est", key: "fs", en: "she" },
  { disp: "Ils", verb: "sont", key: "mp", en: "they (m.)" },
  { disp: "Elles", verb: "sont", key: "fp", en: "they (f.)" },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const nationalitiesLesson: NativeLesson = {
  slug: "nationalities",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les nationalités — <em>l&rsquo;accord</em>
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>+ <b className="text-[color:var(--gram-fem)]">e</b> for a woman — <i lang="fr">français → français<b>e</b></i></li>
        <li>+ <b className="text-[color:var(--gram-neutral)]">s</b> for the plural — <i lang="fr">américain → américain<b>s</b></i></li>
        <li><b className="text-[color:var(--gram-masc)]">-ien</b> → <b className="text-[color:var(--gram-fem)]">-ienne</b> — <i lang="fr">tunisien → tunis<b>ienne</b></i></li>
        <li>ends in <b className="text-[color:var(--gram-neutral)]">-e</b> → no change — <i lang="fr">russe, suisse</i></li>
      </ul>
      <table className="mt-3 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left">
            <th className="p-1" />
            <th className="p-1 text-[color:var(--gram-masc)]">masculin</th>
            <th className="p-1 text-[color:var(--gram-fem)]">féminin</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[color:var(--cahier-rule)]/50">
            <td className="p-1 font-bold">il / elle est</td>
            <td className="p-1 text-[color:var(--gram-masc)]">français · tunisien</td>
            <td className="p-1 text-[color:var(--gram-fem)]">française · tunisienne</td>
          </tr>
          <tr className="border-b border-[color:var(--cahier-rule)]/50">
            <td className="p-1 font-bold">ils / elles sont</td>
            <td className="p-1 text-[color:var(--gram-masc)]">français · tunisiens</td>
            <td className="p-1 text-[color:var(--gram-fem)]">françaises · tunisiennes</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ No capital on the adjective: <span lang="fr">la <b>F</b>rance → il est <b>f</b>rançais</span>.
        Irregular: <span lang="fr">grec → grec<b>que</b>, turc → tur<b>que</b></span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Give the nationality — agreed with the subject.",
    newQuestion() {
      const c = pick(COUNTRIES);
      const s = pick(SUBJECTS);
      const form = c[s.key];
      const forms = [...new Set([c.ms, c.fs, c.mp, c.fp])];
      const options = forms.map((f) => `${s.disp} ${s.verb} ${f}.`);
      // Invariable adjectives (russe, suisse) leave under 3 distinct forms —
      // pad with the verb-agreement near-miss.
      if (options.length < 3) options.push(`${s.disp} ${s.verb === "est" ? "sont" : "est"} ${form}.`);
      return {
        meta: `Et les habitants ? — ${s.en}`,
        big: c.pays,
        en: c.en,
        correct: `${s.disp} ${s.verb} ${form}.`,
        easyOptions: options,
        med: { before: `${s.disp} ${s.verb}`, choices: forms, correct: form, after: "." },
      };
    },
  },
  bonus: [
    { en: "He is French.", fr: "Il est français." },
    { en: "She is Chinese.", fr: "Elle est chinoise." },
    { en: "They (f.) are Korean.", fr: "Elles sont coréennes." },
    { en: "They (m.) are American.", fr: "Ils sont américains." },
    { en: "She is Greek.", fr: "Elle est grecque." },
    { en: "He is Turkish.", fr: "Il est turc." },
    { en: "They (m.) are English.", fr: "Ils sont anglais." },
    { en: "She is German.", fr: "Elle est allemande." },
    { en: "They (f.) are Mexican.", fr: "Elles sont mexicaines." },
    { en: "He is Russian.", fr: "Il est russe." },
  ],
};
