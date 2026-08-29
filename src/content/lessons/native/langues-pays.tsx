/**
 * « On parle quelle langue ? » — SIO-017's lesson (written 2026-08-28).
 *
 * The stop promised "which language(s) are spoken in a given country" and
 * taught nineteen language names. This teaches the link.
 *
 * Data and generator live in ./langues-pays.gen.ts so a check can execute them.
 */
import type { NativeLesson } from "./types";
import { LANGUES_AXES, languesPaysQuestion } from "./langues-pays.gen";

export const languesPaysLesson: NativeLesson = {
  slug: "langues-pays",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        On parle quelle langue&nbsp;?
      </h2>

      <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
        En France, on parle français.
      </p>
      <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
        In France, they speak French.
      </p>

      <p className="mt-3 text-sm text-[color:var(--cahier-ink)]">
        After <b lang="fr">parler</b>, the language drops its article&nbsp;:
        <span lang="fr"> le français → on parle <b>français</b></span>.
      </p>

      <p className="mt-3 text-sm font-bold text-[color:var(--cahier-ink)]">
        The country decides the little word:
      </p>
      <table className="mt-1.5 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <tbody>
          <tr className="border-b border-[color:var(--cahier-rule)]/50">
            <td className="p-1 font-black">en</td>
            <td className="p-1 text-[color:var(--cahier-ink-soft)]">la / l&rsquo;</td>
            <td className="p-1">en France · en Allemagne</td>
          </tr>
          <tr className="border-b border-[color:var(--cahier-rule)]/50">
            <td className="p-1 font-black">au</td>
            <td className="p-1 text-[color:var(--cahier-ink-soft)]">le</td>
            <td className="p-1">au Portugal · au Maroc</td>
          </tr>
          <tr className="border-b border-[color:var(--cahier-rule)]/50">
            <td className="p-1 font-black">aux</td>
            <td className="p-1 text-[color:var(--cahier-ink-soft)]">les</td>
            <td className="p-1">aux États-Unis</td>
          </tr>
          <tr>
            <td className="p-1 font-black">à</td>
            <td className="p-1 text-[color:var(--cahier-ink-soft)]">—</td>
            <td className="p-1">à Cuba · à Singapour</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Plusieurs langues</p>
        <p className="text-[14px] text-[color:var(--cahier-ink)]">
          A country can have several. <span lang="fr">À Singapour, on parle anglais, chinois,
          malais et tamoul.</span>
        </p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Say which language is spoken there.",
    axes: LANGUES_AXES,
    newQuestion: languesPaysQuestion,
  },
  bonus: [
    { en: "In France, they speak French.", fr: "En France, on parle français." },
    { en: "In Portugal, they speak Portuguese.", fr: "Au Portugal, on parle portugais." },
    { en: "In the United States, they speak English.", fr: "Aux États-Unis, on parle anglais." },
    { en: "In Singapore, they speak English and Malay.", fr: "À Singapour, on parle anglais et malais." },
    { en: "In Morocco, they speak Arabic.", fr: "Au Maroc, on parle arabe." },
    { en: "In Germany, they speak German.", fr: "En Allemagne, on parle allemand." },
    { en: "What language do they speak in Thailand?", fr: "On parle quelle langue en Thaïlande ?" },
    { en: "In Switzerland, they speak French and German.", fr: "En Suisse, on parle français et allemand." },
    { en: "I speak English and a little French.", fr: "Je parle anglais et un peu français." },
  ],
};
