/** « Qu'est-ce que c'est ? » — SIO-021's lesson (2026-08-29).
 *  The deck already answers; this teaches the asking. */
import type { NativeLesson } from "./types";
import { QQC_AXES, quEstCeQuestion } from "./qu-est-ce-que-c-est.gen";

export const quEstCeLesson: NativeLesson = {
  slug: "qu-est-ce-que-c-est",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Qu&rsquo;est-ce que c&rsquo;est&nbsp;?
      </h2>
      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Qu&rsquo;est-ce que c&rsquo;est&nbsp;? — C&rsquo;est un stylo.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — C&rsquo;est qui&nbsp;? — C&rsquo;est le professeur.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Qu&rsquo;est-ce que c&rsquo;est&nbsp;? — <b>Ce sont</b> des livres.
          </p>
        </div>
      </div>
      <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">
        ⚠ One thing&nbsp;: <span lang="fr">c&rsquo;est</span>. Several&nbsp;:{" "}
        <span lang="fr">ce sont</span> — never <span lang="fr"><s>c&rsquo;est des</s></span>.
      </p>
    </div>
  ),
  dice: { instruction: "Ask, and answer.", axes: QQC_AXES, newQuestion: quEstCeQuestion },
  bonus: [
    { en: "What is it? — It's a bag.", fr: "Qu'est-ce que c'est ? — C'est un sac." },
    { en: "What is it? — It's a rubber.", fr: "Qu'est-ce que c'est ? — C'est une gomme." },
    { en: "Who is it? — It's the teacher.", fr: "C'est qui ? — C'est le professeur." },
    { en: "They're books.", fr: "Ce sont des livres." },
    { en: "They're keys.", fr: "Ce sont des clés." },
  ],
};
