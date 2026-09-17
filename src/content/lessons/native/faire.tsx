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
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--gram-masc)]">du</b> + masculin — <i lang="fr">Je fais du sport.</i></li>
        <li><b className="text-lg text-[color:var(--gram-fem)]">de la</b> + féminin — <i lang="fr">Elle fait de la danse.</i></li>
        <li><b className="text-lg text-[color:var(--gram-neutral)]">de l&rsquo;</b> + voyelle — <i lang="fr">Nous faisons de l&rsquo;escalade.</i></li>
        <li><b className="text-lg text-[color:var(--gram-neutral)]">des</b> + pluriel — <i lang="fr">Ils font des arts martiaux.</i></li>
      </ul>
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
      /* POINT FORM (Dan, 2026-09-18) — the explanatory claim as halves the
         eye can take one at a time, not a sentence to unpack. */
      <ul className="list-disc space-y-1 pl-5">
        <li><i lang="fr">Du</i> is not one word — it is <i lang="fr">de</i> + <i lang="fr">le</i>, merged.</li>
        <li><i lang="fr">Des</i> is <i lang="fr">de</i> + <i lang="fr">les</i>.</li>
        <li>See the two halves → the negative stops being a rule to memorise.</li>
      </ul>
    ),
    question: (
      <>
        You do <i lang="fr">du yoga</i>. Say that you don&rsquo;t. Where does the{" "}
        <i lang="fr">du</i> go?
      </>
    ),
    answer: (
      <ul className="list-disc space-y-1 pl-5">
        <li><i lang="fr">Je ne fais pas <b>de</b> yoga.</i></li>
        <li>The <i lang="fr">le</i> half names a <b>portion</b> — a negative leaves no portion to name, so that half drops.</li>
        <li>The <i lang="fr">de</i> was always there — it is what you hear.</li>
        <li>Compare <i lang="fr">Je n&rsquo;aime pas <b>le</b> sport</i>: the article stays — preference names the whole <b>category</b>, not a portion.</li>
      </ul>
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
