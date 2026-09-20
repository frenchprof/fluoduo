/**
 * « Comment ça s'écrit ? » — SIO-003's lesson (written 2026-08-28).
 *
 * The stop promised "say how a name is spelled, or ASK how it is spelled" and
 * taught twenty-six letters. This teaches the exchange those letters are for,
 * and it is the phrase SIO-010's atelier asks the learner to perform.
 *
 * The paradigm data and the generator live in ./ca-secrit.gen.ts so a check can
 * execute them; this file is the Mémo.
 */
import type { NativeLesson } from "./types";
import { CA_SECRIT_AXES, caSecritQuestion, spelledOut } from "./ca-secrit.gen";

export const caSecritLesson: NativeLesson = {
  slug: "ca-secrit",
  formLayout: "table",
  // TIER 2 CONCEPT — a question the WORD LIST cannot answer. Lifted from the
  // Mémo below; no grammar introduced that it does not teach. DRAFTED —
  // `contrast` and `remember` are the pedagogical claim and go to Dan first.
  concept: {
    subtitle: "Why an accent is part of the letter, not decoration",
    contrast: (
      <>
        English spells a name letter by letter and has no accents to report. In French
        the accent belongs to the letter: <i lang="fr">É</i> is not <i lang="fr">E</i>,
        and a French ear does not hear them as the same. You have to say it aloud.
      </>
    ),
    question: (
      <>
        Spelling <i lang="fr">Léa</i>, why is it not enough to say{" "}
        <i lang="fr">L &ndash; E &ndash; A</i>?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">E</i> and <i lang="fr">É</i> are different letters to a
        French listener. You say <i lang="fr">L &ndash; E accent aigu &ndash; A</i>, and
        the accent is spoken, not implied.
      </>
    ),
    pitfall: [
      { label: <><i lang="fr">Léa</i></>, wrong: <>L &ndash; E &ndash; A</>, right: <>L &ndash; E accent aigu &ndash; A</> },
      { label: <><i lang="fr">Inès</i></>, wrong: <>I &ndash; N &ndash; E &ndash; S</>, right: <>I &ndash; N &ndash; E accent grave &ndash; S</> },
      { label: <>asking</>, wrong: <i lang="fr">Comment ça écrit ?</i>, right: <i lang="fr">Comment ça s&rsquo;écrit ?</i> },
    ],
    check: [
      {
        q: <>Why <i lang="fr">ça s&rsquo;écrit</i> rather than <i lang="fr">ça écrit</i>?</>,
        a: (
          <>
            <i lang="fr">S&rsquo;écrire</i>{" "}is reflexive — the word &ldquo;writes itself&rdquo;.
            The <i lang="fr">s&rsquo;</i> is not optional.
          </>
        ),
      },
      {
        q: <>How do you say the accent in <i lang="fr">Chloé</i>?</>,
        a: <><i lang="fr">E accent aigu</i> — the same accent as in <i lang="fr">Léa</i>.</>,
      },
    ],
    inShort: (
      <>
        <i lang="fr">É</i> = <i lang="fr">e accent aigu</i> ·{" "}
        <i lang="fr">È</i> = <i lang="fr">e accent grave</i>
      </>
    ),
    remember: <>Say the accent. <i lang="fr">É</i> is not <i lang="fr">E</i>.</>,
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Comment ça s&rsquo;écrit&nbsp;?
      </h2>

      <p className="text-sm text-[color:var(--cahier-ink)]">
        Two lines, and you can spell any name in French.
      </p>

      <div className="mt-3 space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Demander — ask</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Comment ça s&rsquo;écrit&nbsp;?
          </p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
            How do you spell it? — or <span lang="fr">Ça s&rsquo;écrit comment&nbsp;?</span>
          </p>
        </div>

        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Répondre — answer</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Ça s&rsquo;écrit {spelledOut(["L", "É", "A"])}.
          </p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
            It&rsquo;s spelled L – E – A.
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-[color:var(--cahier-ink)]">
        <b lang="fr">s&rsquo;écrire</b> is reflexive — the <b lang="fr">s&rsquo;</b> is not
        optional. <span lang="fr">Comment ça <b>s&rsquo;</b>écrit&nbsp;?</span>
      </p>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Les accents</p>
        <ul className="space-y-0.5 text-[14px] text-[color:var(--cahier-ink)]" lang="fr">
          <li><b>É</b> = e accent aigu <span className="text-[color:var(--cahier-ink-soft)]">(Léa, Chloé, Zoé)</span></li>
          <li><b>È</b> = e accent grave <span className="text-[color:var(--cahier-ink-soft)]">(Inès)</span></li>
        </ul>
        <p className="mt-1.5 text-[13px] text-[color:var(--cahier-ink-soft)]">
          Say the accent — a French ear does not hear <span lang="fr">É</span> as <span lang="fr">E</span>.
        </p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Ask how it is spelled, or spell it out.",
    axes: CA_SECRIT_AXES,
    newQuestion: caSecritQuestion,
  },
  bonus: [
    { en: "How do you spell it?", fr: "Comment ça s'écrit ?", alt: ["Ça s'écrit comment ?"] },
    { en: "It's spelled L – E – A.", fr: "Ça s'écrit L – É – A." },
    { en: "My name is Marc. — How do you spell it?", fr: "Je m'appelle Marc. — Comment ça s'écrit ?" },
    { en: "It's spelled M – A – R – C.", fr: "Ça s'écrit M – A – R – C." },
    { en: "And you, what's your name?", fr: "Et toi, comment tu t'appelles ?" },
    { en: "Sorry, how do you spell it?", fr: "Pardon, comment ça s'écrit ?" },
    { en: "It's spelled with an é (e accent aigu).", fr: "Ça s'écrit avec un é." },
    { en: "Nice to meet you!", fr: "Enchanté !" },
  ],
};
