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
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>In the negative, du / de la / des all become <span lang="fr">de</span></b> (<span lang="fr">d&rsquo;</span> before a vowel):{" "}
        <span lang="fr">Je fais <u>du</u> yoga → Je ne fais pas <b>de</b> yoga. · Je ne fais pas <b>d&rsquo;</b>escalade.</span>
      </p>
    </div>
  ),
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
