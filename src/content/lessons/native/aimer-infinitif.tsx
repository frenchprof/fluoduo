/**
 * Native "Aimer + infinitif" lesson (Unité 2, L10) — Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 10-aimer-infinitif.html drchan import.
 */
import type { NativeLesson } from "./types";

import { AIMER_INFINITIF_AXES, aimerInfinitifQuestion } from "./aimer-infinitif.gen";

export const aimerInfinitifLesson: NativeLesson = {
  slug: "aimer-infinitif",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Aimer + <em>infinitif</em>
      </h2>
      <p className="text-sm text-[color:var(--cahier-ink)]">
        <span lang="fr">[sujet] + [aimer / adorer / détester conjugué] + <b>infinitif</b></span>
      </p>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--gram-neutral)]">aimer + infinitif</b> — <i lang="fr">J&rsquo;aime danser.</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">aimer + nom</b> — <i lang="fr">J&rsquo;aime la danse.</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">aimer + faire de + nom</b> — <i lang="fr">J&rsquo;aime faire de la danse.</i></li>
      </ul>
      <p className="mt-2 text-sm text-[color:var(--cahier-ink)]" lang="fr">
        j&rsquo;aime · tu aimes · il/elle aime · nous aimons · vous aimez · ils/elles aiment — négatif : je <b>n&rsquo;</b>aime <b>pas</b>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Only the first verb is conjugated — the second stays in the infinitive:</b>{" "}
        <span lang="fr">Elle adore nag<b>er</b></span> (not <span lang="fr">Elle adore nage</span>).
      </p>
    </div>
  ),
  dice: {
    instruction: "Build the sentence with aimer + infinitive (not the noun).",
    newQuestion: aimerInfinitifQuestion,
    axes: AIMER_INFINITIF_AXES,
  },
  bonus: [
    { en: "I love reading.", fr: "J'adore lire." },
    { en: "She doesn't like cooking.", fr: "Elle n'aime pas cuisiner." },
    { en: "We love travelling.", fr: "Nous adorons voyager." },
    { en: "He hates running.", fr: "Il déteste courir." },
    { en: "I like drawing.", fr: "J'aime dessiner." },
    { en: "You (sg.) like singing.", fr: "Tu aimes chanter." },
    { en: "I like watching TV.", fr: "J'aime regarder la télé." },
    { en: "I like doing sport.", fr: "J'aime faire du sport." },
    { en: "You (pl.) don't like going out.", fr: "Vous n'aimez pas sortir." },
    { en: "They (f.) love dancing.", fr: "Elles adorent danser." },
  ],
};
