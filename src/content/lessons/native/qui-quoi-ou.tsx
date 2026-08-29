/**
 * « Qui est-ce ? Qu'est-ce que c'est ? Où est le livre ? » — SIO-006's lesson.
 *
 * The deck teaches QUI/QUOI, un/une, AND the questions themselves — its cards'
 * example fields are « C'est qui ? — C'est un homme. » My first note here said
 * otherwise, from reading the letris tile file rather than the card collection
 * beside it. What is genuinely missing is the pronoun: the deck answers
 * « C'est où ? » with « C'est une classe », never « Elle est là », so nothing
 * says that a book is `il`. That rule is what this lesson is for.
 *
 * Data and generator live in ./qui-quoi-ou.gen.ts so a check can run them.
 */
import type { NativeLesson } from "./types";
import { QUI_QUOI_AXES, quiQuoiQuestion } from "./qui-quoi-ou.gen";

export const quiQuoiOuLesson: NativeLesson = {
  slug: "qui-quoi-ou",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Qui&nbsp;? Quoi&nbsp;? Où&nbsp;?
      </h2>

      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">qui</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Qui est-ce&nbsp;? — C&rsquo;est <b>une</b> étudiante.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">quoi</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Qu&rsquo;est-ce que c&rsquo;est&nbsp;? — C&rsquo;est <b>un</b> livre.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">où</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Où est le livre&nbsp;? — <b>Il</b> est là.
          </p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Où est la table&nbsp;? — <b>Elle</b> est là.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="text-[14px] font-bold text-[color:var(--cahier-ink)]">
          The gender picks the pronoun too.
        </p>
        <table className="mt-1 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
          <tbody>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1"><b>un</b> livre</td>
              <td className="p-1 font-black">→ <b>il</b></td>
            </tr>
            <tr>
              <td className="p-1"><b>une</b> table</td>
              <td className="p-1 font-black">→ <b>elle</b></td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1.5 text-[13px] text-[color:var(--cahier-ink-soft)]">
          English says <i>it</i> for both. A book is <b lang="fr">il</b>; a chair
          is <b lang="fr">elle</b>.
        </p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Answer the question — and mind un / une / il / elle.",
    axes: QUI_QUOI_AXES,
    newQuestion: quiQuoiQuestion,
  },
  bonus: [
    { en: "Who is it? — It's a student. (f)", fr: "Qui est-ce ? — C'est une étudiante." },
    { en: "Who is it? — It's a teacher. (m)", fr: "Qui est-ce ? — C'est un professeur." },
    { en: "What is it? — It's a book.", fr: "Qu'est-ce que c'est ? — C'est un livre." },
    { en: "What is it? — It's a chair.", fr: "Qu'est-ce que c'est ? — C'est une chaise." },
    { en: "Where is the book? — It's over there.", fr: "Où est le livre ? — Il est là." },
    { en: "Where is the table? — It's over there.", fr: "Où est la table ? — Elle est là." },
    { en: "Where is the man? — He's over there.", fr: "Où est l'homme ? — Il est là." },
    { en: "It's a classroom.", fr: "C'est une salle de classe." },
  ],
};
