/**
 * Native "Aller à + lieu" lesson (Unité 2 · L11) — the Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 11-aller-a.html drchan import, as real
 * in-app content following the aimer.tsx template.
 *
 * The data, the axes and the question maker live in ./aller.gen.ts so a check
 * can execute them — node cannot strip types from a .tsx. See that file.
 */
import type { NativeLesson } from "./types";
import { ALLER_AXES, allerQuestion } from "./aller.gen";

export const allerLesson: NativeLesson = {
  slug: "aller",
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Aller à + <em>lieu</em>
      </h2>
      <p className="text-sm font-bold text-[color:var(--cahier-ink)]" lang="fr">
        je vais · tu vas · il/elle va · nous allons · vous allez · ils/elles vont
      </p>
      {/* TWO COLUMNS (Dan, 2026-09-19: roll it out everywhere) — the fusion
          left, its example right, faire's treatment. */}
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <div>à + le → <b className="text-lg text-[color:var(--gram-masc)]">au</b></div>
        <div><i lang="fr">Je vais au cinéma.</i></div>
        <div>à + la → <b className="text-lg text-[color:var(--gram-fem)]">à la</b></div>
        <div><i lang="fr">Elle va à la piscine.</i></div>
        <div>à + l&rsquo; → <b className="text-lg text-[color:var(--gram-neutral)]">à l&rsquo;</b></div>
        <div><i lang="fr">Il va à l&rsquo;école.</i></div>
        <div>à + les → <b className="text-lg text-[color:var(--gram-neutral)]">aux</b></div>
        <div><i lang="fr">Nous allons aux magasins.</i></div>
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>The contraction is obligatory</b> — never <i lang="fr">*à le</i> / <i lang="fr">*à les</i>, and no <i lang="fr">*al</i> form: <span lang="fr">à l&rsquo;école stays <b>à l&rsquo;</b></span>.
      </p>
      <p className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        {["en ville", "chez moi", "chez un ami", "chez le médecin"].map((s) => (
          <span key={s} lang="fr" className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5">{s}</span>
        ))}
      </p>
    </div>
  ),
  // TIER 1 · stop 26. The fusion again, but the claim here is that it is
  // OBLIGATORY and that `à l'` is not an exception to it — l' simply is not one
  // of the two that fuse. Pairs with stop 42's du/des and stop 36's au.
  concept: {
    subtitle: "Why à l’école is not an exception",
    contrast: (
      <>
        English has one word to every place &mdash; <i>to the cinema</i>,{" "}
        <i>to the pool</i>. French fuses <i lang="fr">&agrave;</i> with two of the four
        articles and leaves the other two alone, and the fusion is <b>obligatory</b>.
      </>
    ),
    question: (
      <>
        <i lang="fr">Au cin&eacute;ma</i>, <i lang="fr">aux magasins</i> &mdash; but{" "}
        <i lang="fr">&agrave; l&rsquo;&eacute;cole</i>. Is that an exception?
      </>
    ),
    answer: (
      <>
        No. Only <i lang="fr">le</i> and <i lang="fr">les</i> fuse.{" "}
        <i lang="fr">La</i> and <i lang="fr">l&rsquo;</i> never do, so there is nothing to
        fuse and nothing is missing. There is no <i lang="fr">*al</i> form because there was
        never going to be one.
      </>
    ),
    pitfallHeads: ["written out", "what French says"],
    pitfall: [
      { label: <><i lang="fr">&agrave;</i> + <i lang="fr">le</i></>, wrong: <><i lang="fr">&agrave; le cin&eacute;ma</i></>, right: <><i lang="fr">au cin&eacute;ma</i></> },
      { label: <><i lang="fr">&agrave;</i> + <i lang="fr">les</i></>, wrong: <><i lang="fr">&agrave; les magasins</i></>, right: <><i lang="fr">aux magasins</i></> },
      { label: <><i lang="fr">&agrave;</i> + <i lang="fr">l&rsquo;</i></>, wrong: <><i lang="fr">al &eacute;cole</i></>, right: <><i lang="fr">&agrave; l&rsquo;&eacute;cole</i></> },
    ],
    check: [
      { q: <>She goes to the pool &mdash; <i lang="fr">la piscine</i>.</>,
        a: <><i lang="fr">Elle va &agrave; la piscine.</i> <i lang="fr">La</i> does not fuse.</> },
      { q: <>Is <i lang="fr">au</i> optional?</>,
        a: <>No. <i lang="fr">&Agrave; le</i> is not a slower or more formal way of saying it &mdash; it is simply wrong.</> },
    ],
    remember: (
      <>
        Two of the four fuse and two never do. <i lang="fr">&Agrave; l&rsquo;</i> is the rule
        working, not an escape from it.
      </>
    ),
  },
  dice: {
    instruction: "Conjugate aller and contract à + article for the place.",
    newQuestion: allerQuestion,
    axes: ALLER_AXES,
  },
  bonus: [
    { en: "I go to the cinema.", fr: "Je vais au cinéma." },
    { en: "She goes to the swimming pool.", fr: "Elle va à la piscine." },
    { en: "We go to the shops.", fr: "Nous allons aux magasins." },
    { en: "He goes to school.", fr: "Il va à l'école." },
    { en: "They go to the beach.", fr: "Ils vont à la plage." },
    { en: "You (sg.) go to the park.", fr: "Tu vas au parc." },
    { en: "You (pl.) go to town.", fr: "Vous allez en ville." },
    { en: "She doesn't go to the library.", fr: "Elle ne va pas à la bibliothèque." },
    { en: "I don't go to the restaurant.", fr: "Je ne vais pas au restaurant." },
    { en: "We go to the stadium.", fr: "Nous allons au stade." },
  ],
};
