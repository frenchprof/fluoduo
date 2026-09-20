/** « Pardon, on fait quoi ? » — SIO-008's lesson (2026-08-29).
 *  Dan: only these two structures. Data in ./on-fait-quoi.gen.ts. */
import type { NativeLesson } from "./types";
import { INSTRUCTIONS, ON_FAIT_AXES, onFaitQuoiQuestion } from "./on-fait-quoi.gen";

export const onFaitQuoiLesson: NativeLesson = {
  slug: "on-fait-quoi",
  formLayout: "table",
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
  // TIER 3 · stop 8. OPAQUE, and the claim is an ASYMMETRY the Mémo states in
  // one line without drawing the conclusion: eight instructions in, two lines
  // out. What a learner owes each side is different.
  concept: {
    subtitle: "Why every classroom instruction ends in -ez",
    contrast: (
      <>
        Most of a lesson asks you to <b>produce</b>{" "} French. Classroom language does not: the
        teacher&rsquo;s eight instructions you only ever need to <b>recognise</b>, and you
        need just two lines of your own &mdash; the two that buy you time.
      </>
    ),
    question: (
      <>
        You did not catch what the class was told. What do you say?
      </>
    ),
    answer: (
      <>
        <i lang="fr">Pardon, on fait quoi&nbsp;?</i>{" "}
        &mdash; and if you heard but need it
        again, <i lang="fr">R&eacute;p&eacute;tez s&rsquo;il vous pla&icirc;t.</i> Two lines
        cover almost every moment of being lost, which is why the other eight are for your
        ear and not your mouth.
      </>
    ),
    pitfallHeads: ["what learners try", "what the moment needs"],
    pitfall: [
      { label: <>lost mid-lesson</>, wrong: <>silence, or English</>, right: <><i lang="fr">Pardon, on fait quoi&nbsp;?</i></> },
      { label: <>heard but too fast</>, wrong: <><i lang="fr">Pardon, on fait quoi&nbsp;?</i></>, right: <><i lang="fr">R&eacute;p&eacute;tez s&rsquo;il vous pla&icirc;t.</i></> },
    ],
    check: [
      { q: <>Which of the two do you need when you heard every word but it went too fast?</>,
        a: <><i lang="fr">R&eacute;p&eacute;tez s&rsquo;il vous pla&icirc;t.</i> You do not need the task explained; you need it again.</> },
      { q: <>Must you be able to say the teacher&rsquo;s eight instructions?</>,
        a: <>No. Recognise them. Producing them is the teacher&rsquo;s job, not yours.</> },
    ],
    remember: (
      <>
        Eight to understand, two to say. Knowing which side a phrase belongs on is half of
        classroom French.
      </>
    ),
  },
  dice: { instruction: "What do you say?", axes: ON_FAIT_AXES, newQuestion: onFaitQuoiQuestion },
  bonus: [
    { en: "Sorry — what are we doing?", fr: "Pardon, on fait quoi ?" },
    { en: "Say it again, please.", fr: "Répétez s'il vous plaît." },
    { en: "Listen!", fr: "Écoutez !" },
    { en: "Read, please.", fr: "Lisez s'il vous plaît." },
  ],
};
