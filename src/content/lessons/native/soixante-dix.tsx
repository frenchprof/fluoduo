/**
 * « soixante-quinze » — SIO-045A's lesson.
 *
 * The deck holds thirty numerals and never shows the arithmetic that builds
 * them, which is the only hard thing about this range.
 *
 * Data and generator live in ./soixante-dix.gen.ts so a check can run them.
 */
import type { NativeLesson } from "./types";
import { SOIXANTE_AXES, soixanteQuestion } from "./soixante-dix.gen";

const Row = ({ n, fr, sum }: { n: number; fr: string; sum: string }) => (
  <tr className="border-b border-[color:var(--cahier-rule)]/50">
    <td className="p-1 font-black">{n}</td>
    <td className="p-1 font-bold" lang="fr">{fr}</td>
    <td className="p-1 text-[color:var(--cahier-ink-soft)]">{sum}</td>
  </tr>
);

export const soixanteDixLesson: NativeLesson = {
  slug: "soixante-dix",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        70 à 99 — l&rsquo;arithmétique
      </h2>

      <div className="rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <table className="w-full border-collapse text-sm text-[color:var(--cahier-ink)]">
          <tbody>
            <Row n={70} fr="soixante-dix" sum="60 + 10" />
            <Row n={75} fr="soixante-quinze" sum="60 + 15" />
            <Row n={80} fr="quatre-vingts" sum="4 × 20" />
            <Row n={90} fr="quatre-vingt-dix" sum="4 × 20 + 10" />
            <Row n={95} fr="quatre-vingt-quinze" sum="4 × 20 + 15" />
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
        <p className="text-[14px] font-bold text-[color:var(--cahier-ink)]">
          The <b>-s</b> appears on 80 alone.
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]">
          <b lang="fr">quatre-vingt<u>s</u></b>, but{" "}
          <b lang="fr">quatre-vingt-un</b> · <b lang="fr">quatre-vingt-dix</b> — it
          goes the moment anything follows.
        </p>
      </div>

      <div className="mt-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
        <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
          Ça fait quatre-vingt-quinze euros.
        </p>
        <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">That&rsquo;s 95 euros.</p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Build the number — then say it as a price.",
    axes: SOIXANTE_AXES,
    newQuestion: soixanteQuestion,
  },
  bonus: [
    { en: "seventy", fr: "soixante-dix" },
    { en: "seventy-one", fr: "soixante et onze" },
    { en: "seventy-five", fr: "soixante-quinze" },
    { en: "eighty", fr: "quatre-vingts" },
    { en: "eighty-one", fr: "quatre-vingt-un" },
    { en: "ninety", fr: "quatre-vingt-dix" },
    { en: "ninety-five", fr: "quatre-vingt-quinze" },
    { en: "That's ninety-nine euros.", fr: "Ça fait quatre-vingt-dix-neuf euros." },
  ],
};
