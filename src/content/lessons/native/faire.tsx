/**
 * Native "Faire du / de la / de l' / des" lesson (Unité 2, L09) — Mémo +
 * 🎲 dice trainer + EN→FR bonus distilled from the 289KB
 * 09-faire-du-de-la.html drchan import.
 */
import type { NativeLesson } from "./types";

import { FAIRE_AXES, faireQuestion } from "./faire.gen";

export const faireLesson: NativeLesson = {
  slug: "faire",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Faire <em>du / de la / de l&rsquo; / des</em>
      </h2>
      {/* TWO COLUMNS (Dan, 2026-09-19): the rule in the first, its example
          in the second — the same treatment Se présenter's Mémo set and the
          same one the rollout will carry. */}
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <div><b className="text-lg text-[color:var(--gram-masc)]">du</b> + masculin</div>
        <div><i lang="fr">Je fais du sport.</i></div>
        <div><b className="text-lg text-[color:var(--gram-fem)]">de la</b> + féminin</div>
        <div><i lang="fr">Elle fait de la danse.</i></div>
        <div><b className="text-lg text-[color:var(--gram-neutral)]">de l&rsquo;</b> + voyelle</div>
        <div><i lang="fr">Nous faisons de l&rsquo;escalade.</i></div>
        <div><b className="text-lg text-[color:var(--gram-neutral)]">des</b> + pluriel</div>
        <div><i lang="fr">Ils font des arts martiaux.</i></div>
      </div>
      <p className="mt-2 text-sm text-[color:var(--cahier-ink)]" lang="fr">
        je fais · tu fais · il/elle fait · nous faisons · vous <b>faites</b> · ils/elles <b>font</b>
      </p>
      <div className="mt-3 space-y-1 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        <p className="font-bold">
          ⚠️ In the negative, du / de la / des all become <span lang="fr">de</span>{" "}
          (<span lang="fr">d&rsquo;</span> before a vowel)
        </p>
        <ul className="list-disc space-y-0.5 pl-5" lang="fr">
          <li>Je fais <u>du</u> yoga → Je ne fais pas <b>de</b> yoga.</li>
          <li>Je ne fais pas <b>d&rsquo;</b>escalade.</li>
        </ul>
      </div>
    </div>
  ),
  // TIER 1 · stop 24 (Dan's L09). Pairs with aimer: same sentence shape,
  // opposite behaviour in the negative. The value the Mémo cannot give is that
  // `du` is not a word — it is `de` + `le`, which is why only `de` is left.
  concept: {
    subtitle: "Why du becomes de the moment you say no",
    contrast: (
      /* POINT FORM (Dan, 2026-09-18) — and 2026-09-19: the third bullet is
         DELETED on his ruling ("THIS SENTENCE MAKES NO SENSE"), the second
         gains its "Similarly". */
      <ul className="list-disc space-y-1 pl-5">
        <li><i lang="fr">Du</i> is not one word — it is <i lang="fr">de</i> + <i lang="fr">le</i>, merged.</li>
        <li>Similarly, <i lang="fr">des</i> is <i lang="fr">de</i> + <i lang="fr">les</i>, merged.</li>
      </ul>
    ),
    question: (
      <>
        You do <i lang="fr">du yoga</i>. Say that you don&rsquo;t. Where does the{" "}
        <i lang="fr">du</i> go?
      </>
    ),
    answer: (
      /* PURGED AND REPLACED (Dan, 2026-09-19): "The original Q&A in this
         step should purge its current content, replacing with what is in
         SUM UP" — the portion explanation gave way to the SOME/ANY system,
         in the two columns of his mockup: SOME's four forms on the left,
         ANY's four answers on the right. WHAT'S HAPPENING lives HERE too,
         upstream of the sum-up (Dan: "Sum-up is sum-up, What's happening
         should be upstream in Q&A or lesson") — examples first, then the
         rule they add up to. */
      <>
        <div className="grid grid-cols-2 gap-x-4">
          <div>
            <p className="font-bold">If you do <u>some</u>&hellip;</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              <li>SOME singing → <i lang="fr">Je fais <b>du</b> chant.</i></li>
              <li>SOME reading → <i lang="fr">Je fais <b>de la</b> lecture.</i></li>
              <li>SOME fencing → <i lang="fr">Je fais <b>de l&rsquo;</b>escrime.</i></li>
              <li>SOME exercises → <i lang="fr">Je fais <b>des</b> exercices.</i></li>
            </ul>
          </div>
          <div>
            <p className="font-bold">If you don&rsquo;t do <u>any</u> of the above&hellip;</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4" lang="fr">
              <li>Je ne fais pas <b>de</b> yoga.</li>
              <li>Je ne fais pas <b>de</b> lecture.</li>
              <li>Je ne fais pas <b>d&rsquo;</b>escrime.</li>
              <li>Je ne fais pas <b>d&rsquo;</b>exercices.</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 font-bold">What&rsquo;s happening?</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>SOME occurs in the positive, ANY in the negative.</li>
          <li>SOME has 4 forms — <i lang="fr">du · de la · de l&rsquo; · des</i>. ANY has one: <i lang="fr"><b>de</b></i>, which becomes <i lang="fr"><b>d&rsquo;</b></i> before a vowel.</li>
          <li>Alternatively: ANY can be considered as having 2 forms — <i lang="fr">de</i> before a non-vowel, <i lang="fr">d&rsquo;</i> before one.</li>
          <li>Compare <i lang="fr">Je n&rsquo;aime pas <b>le</b> sport</i> — the article stays, positive or negative: it names the category of activity either way.</li>
        </ul>
      </>
    ),
    pitfallHeads: ["the affirmative form", "after a negation"],
    pitfall: [
      { label: <><i lang="fr">du yoga</i></>, wrong: <><i lang="fr">Je ne fais pas du yoga</i></>, right: <><i lang="fr">pas <b>de</b> yoga</i></> },
      { label: <><i lang="fr">de l&rsquo;escalade</i></>, wrong: <><i lang="fr">pas de l&rsquo;escalade</i></>, right: <><i lang="fr">pas <b>d&rsquo;</b>escalade</i></> },
    ],
    flow: [
      { depth: 0, text: "Is the sentence negative?" },
      { depth: 1, text: "no → du · de la · de l' · des" },
      { depth: 1, text: "yes → de, and d' before a vowel" },
    ],
    check: [
      { q: <>She does not do dancing.</>,
        a: <><i lang="fr">Elle ne fait pas <b>de</b> danse.</i></> },
      { q: <>Why does <i lang="fr">aimer</i> not behave this way?</>,
        a: (
          <ul className="list-disc space-y-1 pl-5">
            <li>Its article names the <b>category</b>, not a portion.</li>
            <li>A negative does not remove a category.</li>
          </ul>
        ) },
    ],
    /* SUM-UP IS SUM-UP (Dan, 2026-09-19: "The real SUM UP is in Steps…
       Sum-up is sum-up, What's happening should be upstream in Q&A or
       lesson") — the SOME/ANY examples and their rule live in the Q & A
       pane; what remains here is the decision itself, the flow the Steps
       pane carries. Nothing else. */
    inShort: (
      <div className="rounded-xl bg-[color:var(--cahier-paper-raised)] p-3 font-mono text-[13px] leading-6">
        <p>Is the sentence negative?</p>
        <p className="pl-[1.4rem]">no → <i lang="fr">du · de la · de l&rsquo; · des</i></p>
        <p className="pl-[1.4rem]">yes → <i lang="fr">de</i>, and <i lang="fr">d&rsquo;</i> before a vowel</p>
      </div>
    ),
    remember: (
      <>
        <i lang="fr">Du</i> is <i lang="fr">de</i> + <i lang="fr">le</i>. A negative takes away
        the portion, so the <i lang="fr">le</i> half goes and <i lang="fr">de</i> is left.
      </>
    ),
  },
  dice: {
    instruction: "Choose the right partitive article after faire (watch the negative!).",
    newQuestion: faireQuestion,
    axes: FAIRE_AXES,
  },
  bonus: [
    { en: "I do sport.", fr: "Je fais du sport." },
    { en: "She does dancing.", fr: "Elle fait de la danse." },
    { en: "We do climbing.", fr: "Nous faisons de l'escalade." },
    { en: "They (m.) do martial arts.", fr: "Ils font des arts martiaux." },
    { en: "You (sg.) do swimming.", fr: "Tu fais de la natation." },
    { en: "You (pl.) do skiing.", fr: "Vous faites du ski." },
    { en: "He doesn't do yoga.", fr: "Il ne fait pas de yoga." },
    { en: "I don't do horse riding.", fr: "Je ne fais pas d'équitation." },
    { en: "We don't do boxing.", fr: "Nous ne faisons pas de boxe." },
    { en: "They (f.) do music.", fr: "Elles font de la musique." },
  ],
};
