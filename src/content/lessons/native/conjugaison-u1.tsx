/**
 * Native "Conjugaison Unité 1" lesson — distilled from 03-conjugaison-u1.html:
 * s'appeler / être / avoir, affirmative + negative, all persons.
 * Mémo (cheat-sheet table) + 🎲 dice trainer (subject × verb × polarity) + bonus.
 *
 * The paradigm data and the question maker live in ./conjugaison-u1.gen.ts —
 * node cannot strip types from a .tsx, so a generator beside the Mémo could
 * not be executed by a check. See that file's header.
 */
import type { NativeLesson } from "./types";
import {
  CONJ,
  CONJ_U1_AXES,
  SLOTS,
  SUBJ_LABELS,
  conjugaisonU1Question,
} from "./conjugaison-u1.gen";

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
    axes: CONJ_U1_AXES,
    newQuestion: conjugaisonU1Question,
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
