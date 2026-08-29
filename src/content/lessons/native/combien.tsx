/** « Il y a combien d'étudiants ? » — SIO-007's lesson (2026-08-29).
 *  Dan: stop at 10, and just this one question. Data in ./combien.gen.ts. */
import type { NativeLesson } from "./types";
import { COMBIEN_AXES, NUMBERS, combienQuestion } from "./combien.gen";

export const combienLesson: NativeLesson = {
  slug: "combien",
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
      <p className="mt-3 text-[14px] text-[color:var(--cahier-ink)]" lang="fr">
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
