/**
 * Native "Avoir ou être ? — les états" lesson (Unité 1, SIO-019). Dan,
 * 2026-07-08: the avoir SIO pointed at the generic conjugation tables — this
 * teaches what the SIO actually drills: states that take AVOIR + noun (faim,
 * soif, âge…) vs ÊTRE + adjective (fatigué, content…, which AGREES).
 */
import type { NativeLesson } from "./types";

import { AVOIR_ETATS_AXES, avoirEtatsQuestion } from "./avoir-etats.gen";

export const avoirEtatsLesson: NativeLesson = {
  slug: "avoir-etats",
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Avoir ou être ? — les états
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>
          <b className="text-[color:var(--gram-neutral)]">AVOIR</b> + noun —{" "}
          <i lang="fr">J&rsquo;ai faim. · Ils ont soif. · Elle a froid.</i>
        </li>
        <li>
          <b className="text-[color:var(--gram-neutral)]">AVOIR</b> + age —{" "}
          <i lang="fr">J&rsquo;ai 19 ans.</i>
        </li>
        <li>
          <b className="text-[color:var(--gram-neutral)]">ÊTRE</b> + adjective (it agrees!) —{" "}
          <i lang="fr">Il est fatigué. · Ils sont fatigués.</i>
        </li>
        <li>
          <b className="text-[color:var(--gram-neutral)]">avoir envie / besoin de</b> —{" "}
          <i lang="fr">J&rsquo;ai envie de dormir. · J&rsquo;ai besoin d&rsquo;un café.</i>
        </li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ English says <i>I <b>am</b> hungry / cold / 19</i> — French takes{" "}
        <b lang="fr">AVOIR</b>: <span lang="fr">j&rsquo;<b>ai</b> faim, j&rsquo;<b>ai</b> froid, j&rsquo;<b>ai</b> 19 ans.</span>
      </p>
    </div>
  ),
  // TIER 1 · stop 19. The Mémo lists which verb goes with what. The concept
  // gives the TEST — does the word agree? — so the learner can decide for a
  // word the list never showed them.
  concept: {
    subtitle: "Why you HAVE hunger and ARE tired",
    contrast: (
      <>
        English uses <i>be</i> for all of it &mdash; <i>I am hungry</i>, <i>I am cold</i>,{" "}
        <i>I am 19</i>, <i>I am tired</i>. French splits them, and the split is not about
        meaning: it is about what kind of word comes next.
      </>
    ),
    question: (
      <>
        <i lang="fr">J&rsquo;ai froid</i> but <i lang="fr">il est fatigu&eacute;</i>. How do
        you tell which verb a new word wants?
      </>
    ),
    answer: (
      <>
        Ask whether it <b>agrees</b>. <i lang="fr">Fatigu&eacute;</i> changes &mdash;{" "}
        <i lang="fr">ils sont fatigu&eacute;s</i>{" "}
        &mdash; so it is an adjective, and adjectives
        take <i lang="fr">&ecirc;tre</i>. <i lang="fr">Froid</i> and{" "}
        <i lang="fr">faim</i> do not change here; they are nouns, and you{" "}
        <b>have</b> a noun.
      </>
    ),
    pitfall: [
      { label: <>I am hungry</>, wrong: <><i lang="fr">je suis faim</i></>, right: <><i lang="fr">j&rsquo;ai faim</i></> },
      { label: <>I am 19</>, wrong: <><i lang="fr">je suis 19</i></>, right: <><i lang="fr">j&rsquo;ai 19 ans</i></> },
      { label: <>they are tired</>, wrong: <><i lang="fr">ils ont fatigu&eacute;</i></>, right: <><i lang="fr">ils sont fatigu&eacute;s</i></> },
    ],
    check: [
      { q: <>They are thirsty.</>,
        a: <><i lang="fr">Ils ont soif.</i> A noun, so <i lang="fr">avoir</i>.</> },
      { q: <>Why must <i lang="fr">ans</i> be said at all?</>,
        a: <>Because you are having nineteen OF something, and the something is years.</> },
    ],
    remember: (
      <>
        If it agrees, it is an adjective &mdash; <i lang="fr">&ecirc;tre</i>. If it does not,
        it is a noun you <b>have</b>.
      </>
    ),
  },
  dice: {
    instruction: "Avoir or être? Pick the sentence that says the state correctly.",
    newQuestion: avoirEtatsQuestion,
    axes: AVOIR_ETATS_AXES,
  },
  bonus: [
    { en: "I am hungry.", fr: "J'ai faim." },
    { en: "They are tired.", fr: "Ils sont fatigués." },
    { en: "She is 20 years old.", fr: "Elle a 20 ans." },
    { en: "We are thirsty.", fr: "Nous avons soif." },
    { en: "You (sg.) are sick.", fr: "Tu es malade." },
    { en: "I need a coffee.", fr: "J'ai besoin d'un café." },
    { en: "I feel like dancing.", fr: "J'ai envie de danser." },
    { en: "He is calm.", fr: "Il est calme." },
    { en: "They are cold.", fr: "Ils ont froid." },
    { en: "I am 19 years old.", fr: "J'ai 19 ans." },
  ],
};
