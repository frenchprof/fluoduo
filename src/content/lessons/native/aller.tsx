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
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Aller à + <em>lieu</em>
      </h2>
      <p className="text-sm font-bold text-[color:var(--cahier-ink)]" lang="fr">
        je vais · tu vas · il/elle va · nous allons · vous allez · ils/elles vont
      </p>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>à + le → <b className="text-lg text-[color:var(--gram-masc)]">au</b> — <i lang="fr">Je vais au cinéma.</i></li>
        <li>à + la → <b className="text-lg text-[color:var(--gram-fem)]">à la</b> — <i lang="fr">Elle va à la piscine.</i></li>
        <li>à + l&rsquo; → <b className="text-lg text-[color:var(--gram-neutral)]">à l&rsquo;</b> — <i lang="fr">Il va à l&rsquo;école.</i></li>
        <li>à + les → <b className="text-lg text-[color:var(--gram-neutral)]">aux</b> — <i lang="fr">Nous allons aux magasins.</i></li>
      </ul>
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
