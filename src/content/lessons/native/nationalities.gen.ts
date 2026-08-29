/**
 * The nationalities generator — data, axes and question maker, split out of
 * nationalities.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1 } from "./axis.ts";

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

/** The agreement is the grammar; the country is the vocabulary the learner
 *  may want to drill one of. */
export const NATIONALITIES_AXES: DiceAxis[] = [
  { key: "subject", label: "Accord", options: SUBJECTS.map((s) => ({ value: s.disp, label: `${s.disp} ${s.verb}` })) },
  { key: "country", label: "Pays", options: COUNTRIES.map((c) => ({ value: c.pays, label: c.pays })) },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function nationalitiesQuestion(pinned?: Record<string, string>): DiceQuestion {
  const c = pinned1(COUNTRIES, pinned?.country, (x) => x.pays);
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
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
    }
