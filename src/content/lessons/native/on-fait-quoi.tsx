/** « Pardon, on fait quoi ? » — SIO-008's lesson (2026-08-29).
 *  Dan: only these two structures. Data in ./on-fait-quoi.gen.ts. */
import type { NativeLesson } from "./types";
import { INSTRUCTIONS, ON_FAIT_AXES, onFaitQuoiQuestion } from "./on-fait-quoi.gen";

export const onFaitQuoiLesson: NativeLesson = {
  slug: "on-fait-quoi",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Et vous, qu&rsquo;est-ce que vous dites&nbsp;?
      </h2>
      <p className="text-sm text-[color:var(--cahier-ink)]">
        The teacher has eight instructions. You have two lines.
      </p>
      <div className="mt-3 space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Pardon, on fait quoi&nbsp;?
          </p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">Sorry — what are we doing?</p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Répétez s&rsquo;il vous plaît.
          </p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">Say it again, please.</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] font-bold text-[color:var(--cahier-ink-soft)]" lang="fr">
        {INSTRUCTIONS.map((i) => i.fr).join(" · ")}
      </p>
    </div>
  ),
  dice: { instruction: "What do you say?", axes: ON_FAIT_AXES, newQuestion: onFaitQuoiQuestion },
  bonus: [
    { en: "Sorry — what are we doing?", fr: "Pardon, on fait quoi ?" },
    { en: "Say it again, please.", fr: "Répétez s'il vous plaît." },
    { en: "Listen!", fr: "Écoutez !" },
    { en: "Read, please.", fr: "Lisez s'il vous plaît." },
  ],
};
