/** « Il y a combien d'étudiants ? » — SIO-007's lesson (2026-08-29).
 *  Dan: stop at 10, and just this one question. Data in ./combien.gen.ts. */
import type { NativeLesson } from "./types";
import { COMBIEN_AXES, NUMBERS, combienQuestion } from "./combien.gen";

export const combienLesson: NativeLesson = {
  slug: "combien",
  // TIER 2 CONCEPT — a question the WORD LIST cannot answer. Lifted from the
  // Mémo below; no grammar introduced that it does not teach. DRAFTED —
  // `contrast` and `remember` are the pedagogical claim and go to Dan first.
  concept: {
    subtitle: "Why « il y a » never changes",
    contrast: (
      <>
        English picks between <i>there is</i> and <i>there are</i> depending on how many.
        French has one block for both — <i lang="fr">il y a</i> — and it never moves,
        whether there is one student or forty.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">il y a sept étudiants</i> and not{" "}
        <i lang="fr">ils y ont sept étudiants</i>?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">il y a</i>{" "} is not really &ldquo;he has&rdquo; — it is a fixed
        expression meaning <i>there is / there are</i>. Nothing inside it agrees with
        anything, so it is learnt whole.
      </>
    ),
    pitfall: [
      { label: <>one</>, wrong: <i lang="fr">il y est un étudiant</i>, right: <i lang="fr">il y a un étudiant</i> },
      { label: <>many</>, wrong: <i lang="fr">ils y ont sept étudiants</i>, right: <i lang="fr">il y a sept étudiants</i> },
      { label: <>asking</>, wrong: <i lang="fr">il y a combien étudiants ?</i>, right: <i lang="fr">il y a combien d&rsquo;étudiants ?</i> },
    ],
    check: [
      {
        q: <>Does <i lang="fr">il y a</i> change for forty students?</>,
        a: <>No. It is the same for one and for forty — that is the whole point of it.</>,
      },
      {
        q: <>Why <i lang="fr">combien d&rsquo;étudiants</i> and not <i lang="fr">combien étudiants</i>?</>,
        a: <>A quantity word is joined to its noun by <i lang="fr">de</i>, which elides before a vowel.</>,
      },
    ],
    inShort: <><i lang="fr">il y a</i> + any number · <i lang="fr">combien de</i> + noun</>,
    remember: <><i lang="fr">Il y a</i> is one block. It never changes for number.</>,
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Il y a combien&nbsp;?
      </h2>
      <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
        <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
          — Il y a combien d&rsquo;étudiants&nbsp;?
        </p>
        <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
          — Il y a <b>sept</b> étudiants.
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]">
          How many students are there? — There are seven.
        </p>
      </div>
      <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]" lang="fr">
        {Object.keys(NUMBERS).map((k) => NUMBERS[Number(k)]).join(" · ")}
      </p>
      <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">
        ⚠ <span lang="fr">il y a</span> is one block — it never changes.
      </p>
    </div>
  ),
  dice: { instruction: "Answer: how many are there?", axes: COMBIEN_AXES, newQuestion: combienQuestion },
  bonus: [
    { en: "How many students are there?", fr: "Il y a combien d'étudiants ?" },
    { en: "There are seven students.", fr: "Il y a sept étudiants." },
    { en: "There are three teachers.", fr: "Il y a trois professeurs." },
    { en: "There are ten people.", fr: "Il y a dix personnes." },
    { en: "There is one student.", fr: "Il y a un étudiant." },
  ],
};
