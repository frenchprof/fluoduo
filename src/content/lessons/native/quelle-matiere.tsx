/**
 * « Tu étudies quoi ? » — SIO-013's lesson.
 *
 * The deck sorts sixteen subjects by article and never asks the question its
 * own title poses. This is the exchange; the article comes along because the
 * answer cannot avoid it.
 *
 * Data and generator live in ./quelle-matiere.gen.ts so a check can run them.
 */
import type { NativeLesson } from "./types";
import { MATIERE_AXES, matiereQuestion } from "./quelle-matiere.gen";

export const quelleMatiereLesson: NativeLesson = {
  slug: "quelle-matiere",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Tu étudies quoi&nbsp;?
      </h2>

      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">demander</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Tu étudies quoi&nbsp;? · Vous étudiez quoi&nbsp;?
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">répondre</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            J&rsquo;étudie <b>le</b> français.
          </p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            J&rsquo;étudie <b>les</b> mathématiques.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="text-[14px] font-bold text-[color:var(--cahier-ink)]">
          The article never drops.
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]">
          English says <i>I study French</i>; French says{" "}
          <b lang="fr">j&rsquo;étudie le français</b>. Never{" "}
          <span lang="fr"><s>j&rsquo;étudie français</s></span>.
        </p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Ask, then answer — and keep the article.",
    axes: MATIERE_AXES,
    newQuestion: matiereQuestion,
  },
  bonus: [
    { en: "What are you studying?", fr: "Tu étudies quoi ?" },
    { en: "What are you studying? (polite)", fr: "Vous étudiez quoi ?" },
    { en: "I study French.", fr: "J'étudie le français." },
    { en: "I study maths.", fr: "J'étudie les mathématiques." },
    { en: "I study history.", fr: "J'étudie l'histoire." },
    { en: "She studies chemistry.", fr: "Elle étudie la chimie." },
    { en: "He studies computing.", fr: "Il étudie l'informatique." },
    { en: "I study languages.", fr: "J'étudie les langues." },
  ],
};
