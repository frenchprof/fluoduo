/** « On est quel jour ? » — SIO-004's lesson (2026-08-29). Unit 0: the
 *  shortest true sentences. Data/generator in ./quel-jour.gen.ts. */
import type { NativeLesson } from "./types";
import { DAYS, MOMENTS, QUEL_JOUR_AXES, quelJourQuestion } from "./quel-jour.gen";

export const quelJourLesson: NativeLesson = {
  slug: "quel-jour",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        On est quel jour&nbsp;?
      </h2>
      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Demander</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">On est quel jour&nbsp;?</p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Répondre</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">On est mardi.</p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
            or <span lang="fr">Aujourd&rsquo;hui, c&rsquo;est mardi.</span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-[14px] text-[color:var(--cahier-ink)]" lang="fr">
        {DAYS.join(" · ")}
      </p>
      <p className="mt-2 text-[14px] text-[color:var(--cahier-ink)]">
        <span lang="fr">C&rsquo;est quel moment&nbsp;? — C&rsquo;est {MOMENTS[0].fr}.</span>
      </p>
      <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]" lang="fr">
        {MOMENTS.map((m) => m.fr).join(" · ")}
      </p>
      <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">
        ⚠ No capitals&nbsp;: <span lang="fr">lundi</span>, not <span lang="fr">Lundi</span>.
      </p>
    </div>
  ),
  dice: { instruction: "Say the day, or the moment.", axes: QUEL_JOUR_AXES, newQuestion: quelJourQuestion },
  bonus: [
    { en: "What day is it? — It's Monday.", fr: "On est quel jour ? — On est lundi." },
    { en: "Today is Wednesday.", fr: "Aujourd'hui, c'est mercredi." },
    { en: "It's Saturday.", fr: "On est samedi." },
    { en: "It's the morning.", fr: "C'est le matin." },
    { en: "It's the evening.", fr: "C'est le soir." },
    { en: "What day is it? — It's Sunday.", fr: "On est quel jour ? — On est dimanche." },
  ],
};
