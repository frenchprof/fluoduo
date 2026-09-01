"use client";

/**
 * Native "Adverbes de fréquence" lesson (Unité 4) — distilled from
 * 22-frequence.html: the Mémo + the 🎲 dice trainer + EN→FR bonus.
 */
import type { NativeLesson } from "./types";
import { speak } from "@/games/letris/speech";

import { FREQUENCE_AXES, SCALE, frequenceQuestion } from "./frequence.gen";

export const frequenceLesson: NativeLesson = {
  slug: "frequence",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        L&rsquo;adverbe de fréquence : <em>juste après le verbe</em>
      </h2>
      <p className="text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <i>Je cours <b>souvent</b>. · Elle regarde <b>rarement</b> la télé.</i>
      </p>
      {/* Each chip speaks ITS OWN adverb — as plain spans in one <p>, a tap
          on a chip's padding fell through to the whole paragraph and TTS read
          « toujours… » for everything (Dan, 2026-07-08). */}
      <div className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        {SCALE.map((a) => (
          <button
            key={a.fr}
            type="button"
            onClick={() => speak(a.fr, "fr-FR")}
            title="🔊"
            className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5 transition hover:border-[color:var(--cahier-gold)] active:scale-95"
          >
            <span lang="fr">{a.fr}</span> · {a.en}
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ Negative: <span lang="fr">Je <b>ne</b> cours <b>pas</b> souvent.</span> — but{" "}
        <b lang="fr">jamais</b> replaces <i lang="fr">pas</i>:{" "}
        <span lang="fr">Je <b>ne</b> nage <b>jamais</b>.</span>
      </p>
    </div>
  ),
  // TIER 1 · stop 43. One position rule, and it is the opposite of English's.
  // The Mémo states it in its title; the concept gives the reason it sticks.
  concept: {
    subtitle: "Why the adverb comes after the verb",
    contrast: (
      <>
        English puts the frequency word <b>before</b> the verb &mdash; <i>I often run</i>,{" "}
        <i>she rarely watches TV</i>. French puts it <b>straight after</b>:{" "}
        <i lang="fr">Je cours souvent</i>, <i lang="fr">Elle regarde rarement la
        t&eacute;l&eacute;</i>.
      </>
    ),
    question: (
      <>
        <i>She rarely watches TV.</i> Where does{" "}
        <i lang="fr">rarement</i> go?
      </>
    ),
    answer: (
      <>
        Between the verb and its object: <i lang="fr">Elle regarde rarement la
        t&eacute;l&eacute;.</i> The adverb is describing the verb, and French keeps it next
        to what it describes &mdash; even when that splits the verb from its object, which
        English never does.
      </>
    ),
    pitfall: [
      { label: <>I often run</>, wrong: <><i lang="fr">Je souvent cours</i></>, right: <><i lang="fr">Je cours souvent</i></> },
      { label: <>she rarely watches TV</>, wrong: <><i lang="fr">Elle rarement regarde la t&eacute;l&eacute;</i></>, right: <><i lang="fr">Elle regarde rarement la t&eacute;l&eacute;</i></> },
    ],
    check: [
      { q: <>You always eat bread.</>,
        a: <><i lang="fr">Je mange toujours du pain.</i> After the verb, before the object.</> },
      { q: <>What is the English habit that gets in the way?</>,
        a: <>Putting the adverb in front of the verb. French never does.</> },
    ],
    remember: (
      <>
        Straight after the verb &mdash; even when that puts it between the verb and its
        object.
      </>
    ),
  },
  dice: {
    instruction: "Place the frequency adverb — right after the verb.",
    newQuestion: frequenceQuestion,
    axes: FREQUENCE_AXES,
  },
  bonus: [
    { en: "I often watch TV.", fr: "Je regarde souvent la télé." },
    { en: "She always works.", fr: "Elle travaille toujours." },
    { en: "We sometimes cook.", fr: "Nous cuisinons parfois." },
    { en: "They (m.) regularly play football.", fr: "Ils jouent régulièrement au foot." },
    { en: "You (sg.) rarely dance.", fr: "Tu danses rarement." },
    { en: "I don't often listen to music.", fr: "Je n'écoute pas souvent de musique." },
    { en: "He never watches TV.", fr: "Il ne regarde jamais la télé." },
    { en: "We never work.", fr: "Nous ne travaillons jamais." },
    { en: "She doesn't often cook.", fr: "Elle ne cuisine pas souvent." },
    { en: "I never dance.", fr: "Je ne danse jamais." },
  ],
};
