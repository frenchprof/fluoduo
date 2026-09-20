/**
 * « Quel pays ? Quelle ville ? Quelles couleurs ? » — a second lesson on
 * SIO-015 (Unité 1), written 2026-09-05 to Dan's brief.
 *
 * WHY THIS STOP. Dan asked for "the quel lesson in Unit 1". There was not one:
 * the four forms are taught at SIO-034, in Unit 3. They are USED from Unit 1
 * on — SIO-016 is titled « Quelle nationalité ? », SIO-017 « On parle quelle
 * langue ? », SIO-018 now asks « Quelle est votre date de naissance ? » — and
 * the SIO-017 PRE-TEST already makes a learner choose between Quel / Quelle /
 * Quels / Quelles, seventeen stops before the lesson that explains the choice.
 *
 * SIO-015 is where it belongs, and not just because it is early. Its own title
 * is « C'est quel pays ? », and the stop immediately before this one teaches
 * le / la / l' / les on those same countries — which is exactly what `quel`
 * agrees with:
 *
 *     le  Japon      →  quel pays
 *     la  France     →  quelle ville
 *     les États-Unis →  quels pays
 *
 * So the article the learner has just met IS the answer to the new question,
 * and nothing new has to be introduced to teach it.
 *
 * Data and generator live in ./quel-prefere.gen.ts so a check can execute them.
 */
import { QUEL_AXES, quelPrefereQuestion } from "./quel-prefere.gen";
import type { NativeLesson } from "./types";

export const quelPrefereLesson: NativeLesson = {
  slug: "quel-prefere",
  formLayout: "list",
  // TIER 1 CONCEPT — a question the FORMS cannot answer. The four spellings
  // are on the Mémo; what is not on it is WHY a question word has spellings at
  // all, which is the thing an English speaker has no slot for.
  //
  // DRAFTED — `contrast`, `answer` and `remember` are the pedagogical claim
  // and go to Dan before they reach a learner.
  concept: {
    subtitle: "Why a question word changes its spelling",
    contrast: (
      <>
        English <i>which</i>{" "}never moves &mdash; which country, which city, which
        colours. French <i lang="fr">quel</i> has four spellings, and the word that
        decides between them is not the one being asked.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">quel pays</i> but <i lang="fr">quelle ville</i>, when the person
        being asked is the same person?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">quel</i> is an <b>adjective</b>, not a question word wearing
        a question word&rsquo;s clothes. It agrees with the noun standing next to it:{" "}
        <i lang="fr">le pays</i> is masculine, <i lang="fr">la ville</i> is feminine. The
        article you learnt on the last stop is the answer.
      </>
    ),
    pitfall: [
      {
        label: <>the noun is feminine</>,
        wrong: <i lang="fr">quel ville</i>,
        right: <i lang="fr">quelle ville</i>,
      },
      {
        label: <>the noun is plural</>,
        wrong: <i lang="fr">quelle couleurs</i>,
        right: <i lang="fr">quelles couleurs</i>,
      },
      {
        // The one case the -s cannot be read off the noun.
        label: <>several countries</>,
        wrong: <i lang="fr">quel pays</i>,
        right: <i lang="fr">quels pays</i>,
      },
    ],
    check: [
      {
        q: <>Which cities do you know?</>,
        a: (
          <>
            <i lang="fr">Vous connaissez quelles villes&nbsp;?</i>
          </>
        ),
      },
      {
        q: (
          <>
            <i lang="fr">Quels sont vos pays pr&eacute;f&eacute;r&eacute;s&nbsp;?</i> &mdash; how do
            you start the answer?
          </>
        ),
        a: (
          <>
            <i lang="fr">Mes pays pr&eacute;f&eacute;r&eacute;s sont&hellip;</i> &mdash;{" "}
            <i lang="fr">mes</i> for the same reason as <i lang="fr">quels</i>.
          </>
        ),
      },
    ],
    remember: (
      <>
        <i lang="fr">Quel</i> and <i lang="fr">mon</i> agree with the same noun, so they
        move together. Get the question right and the answer is already decided.
      </>
    ),
  },

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Quel ? Quelle ? Quels ? Quelles ?
      </h2>

      {/* THE ARGUMENT, OPEN. One decision made three times across a row: the
          noun picks the question word, the possessive in the question, and the
          possessive in the answer. Reading across is the lesson; everything
          below it is reference and folds. */}
      <div className="overflow-x-auto">
        <table className="mt-2 w-full text-left text-[14px] text-[color:var(--cahier-ink)]">
          <thead>
            <tr className="border-b-2 border-[color:var(--cahier-rule)]">
              <th className="p-1 font-normal text-[color:var(--cahier-ink-soft)]">le nom</th>
              <th className="p-1 font-normal text-[color:var(--cahier-ink-soft)]">la question</th>
              <th className="p-1 font-normal text-[color:var(--cahier-ink-soft)]">à un ami</th>
              <th className="p-1 font-normal text-[color:var(--cahier-ink-soft)]">la réponse</th>
            </tr>
          </thead>
          <tbody lang="fr">
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 text-[color:var(--cahier-ink-soft)]">le pays</td>
              <td className="p-1 font-black">quel</td>
              <td className="p-1 font-black">ton</td>
              <td className="p-1 font-black">mon</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 text-[color:var(--cahier-ink-soft)]">la ville</td>
              <td className="p-1 font-black">quelle</td>
              <td className="p-1 font-black">ta</td>
              <td className="p-1 font-black">ma</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 text-[color:var(--cahier-ink-soft)]">les pays</td>
              <td className="p-1 font-black">quels</td>
              <td className="p-1 font-black">tes</td>
              <td className="p-1 font-black">mes</td>
            </tr>
            <tr>
              <td className="p-1 text-[color:var(--cahier-ink-soft)]">les villes</td>
              <td className="p-1 font-black">quelles</td>
              <td className="p-1 font-black">tes</td>
              <td className="p-1 font-black">mes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b lang="fr">Le pays</b> already ends in <b>-s</b> in the singular, so the noun
        cannot tell you the number here — only the question can.{" "}
        <i lang="fr">Quel pays&nbsp;?</i> asks for one, <i lang="fr">Quels pays&nbsp;?</i>{" "}
        asks for several.
      </p>

      {/* Dan's six frames, folded: the table above is the lesson, these are the
          sentences to consult. The count is on the summary so a closed fold is
          not a bare chevron (long-pages rule). */}
      <details className="mt-3 rounded-lg border border-[color:var(--cahier-rule)] bg-white/60 p-2.5">
        <summary className="cursor-pointer text-[13px] font-black text-[color:var(--cahier-ink)]">
          The sentences — 6 frames
        </summary>
        <ul className="mt-2 space-y-1.5 text-[14px] text-[color:var(--cahier-ink)]">
          <li>
            <b lang="fr">Quels sont vos pays préférés&nbsp;?</b>
            <br />
            <span lang="fr" className="text-[color:var(--cahier-ink-soft)]">
              — Mes pays préférés sont le Japon et la Corée.
            </span>
          </li>
          <li>
            <b lang="fr">Quelles sont vos couleurs préférées&nbsp;?</b>
            <br />
            <span lang="fr" className="text-[color:var(--cahier-ink-soft)]">
              — Mes couleurs préférées sont le rouge et le bleu.
            </span>
          </li>
          <li>
            <b lang="fr">Quelle est ta ville préférée&nbsp;?</b>
            <br />
            <span lang="fr" className="text-[color:var(--cahier-ink-soft)]">
              — Ma ville préférée est Paris.
            </span>
          </li>
          <li>
            <b lang="fr">Vous connaissez quels pays&nbsp;?</b>
          </li>
          <li>
            <b lang="fr">Vous connaissez quelles villes&nbsp;?</b>
          </li>
          <li>
            <b lang="fr">Vous aimez / préférez quelles couleurs&nbsp;?</b>
          </li>
        </ul>
        <p className="mt-2 text-[13px] text-[color:var(--cahier-ink-soft)]">
          Both places are ordinary spoken French: <i lang="fr">quel</i> at the front of
          the question, or after the verb. The form does not change with the position.
        </p>
      </details>

      <details className="mt-2 rounded-lg border border-[color:var(--cahier-rule)] bg-white/60 p-2.5">
        <summary className="cursor-pointer text-[13px] font-black text-[color:var(--cahier-ink)]">
          Why the colour words look masculine — 1 note
        </summary>
        <p className="mt-2 text-[14px] text-[color:var(--cahier-ink)]">
          <b lang="fr">La couleur</b> is feminine, so the question is{" "}
          <b lang="fr">quelles couleurs</b>. The colours THEMSELVES are masculine
          nouns &mdash; <i lang="fr">le rouge</i>, <i lang="fr">le bleu</i> &mdash; and that
          changes nothing:{" "}
          <i lang="fr">quel</i> agrees with the noun in the question, never with the
          answer.
        </p>
      </details>
    </div>
  ),

  dice: {
    instruction: "Choose the form that agrees with the noun.",
    axes: QUEL_AXES,
    newQuestion: quelPrefereQuestion,
  },

  bonus: [
    { en: "What are your favourite countries?", fr: "Quels sont vos pays préférés ?", alt: ["Quels sont tes pays préférés ?"] },
    { en: "What are your favourite colours?", fr: "Quelles sont vos couleurs préférées ?", alt: ["Quelles sont tes couleurs préférées ?"] },
    { en: "What is your favourite city?", fr: "Quelle est votre ville préférée ?", alt: ["Quelle est ta ville préférée ?"] },
    { en: "What is your favourite country?", fr: "Quel est votre pays préféré ?", alt: ["Quel est ton pays préféré ?"] },
    { en: "Which countries do you know?", fr: "Vous connaissez quels pays ?", alt: ["Tu connais quels pays ?", "Quels pays connaissez-vous ?"] },
    { en: "Which cities do you know?", fr: "Vous connaissez quelles villes ?", alt: ["Tu connais quelles villes ?", "Quelles villes connaissez-vous ?"] },
    { en: "Which colours do you like?", fr: "Vous aimez quelles couleurs ?", alt: ["Tu aimes quelles couleurs ?", "Vous préférez quelles couleurs ?"] },
    { en: "My favourite country is Japan.", fr: "Mon pays préféré est le Japon." },
    { en: "My favourite city is Singapore.", fr: "Ma ville préférée est Singapour." },
    { en: "My favourite colours are red and blue.", fr: "Mes couleurs préférées sont le rouge et le bleu." },
  ],
};
