/**
 * Native "Se présenter" lesson — ONE objective: NAMES (SIO-001).
 *
 * Dan, 2026-08-27: "for Unit 0 Lesson 1 there is too much going on", then the
 * rule behind it — "the original intention (and is still the current
 * intention) is to have the objectives broken down into bitesized objectives.
 * so having four things at one go is not cool."
 *
 * It had four. The Mémo opened on name + age + nationality + family — four
 * structures over three verbs (s'appeler, avoir, être) plus « il y a » — and
 * the generator then picked one of those four AT RANDOM per card, so roughly
 * three cards in four asked about something SIO-001 never promised.
 *
 * The three intruders are not homeless; they already own stops of their own,
 * LATER in the course, so Lesson 1 was teaching Unit 1 material to a learner
 * who has not reached Unit 1:
 *
 *   age          → SIO-019 "Avoir — age & states"  (avoir-etats.tsx)
 *   nationality  → SIO-016 "Nationalities"         (nationalities.tsx)
 *   family       → no owner; out of scope here either way
 *
 * So nothing is thrown away by cutting them out — they go home. And the two
 * things SIO-001 DOES promise, both of which were missing entirely, arrive:
 * asking a name (Comment tu t'appelles ? / Comment vous vous appelez ?) and
 * M./Mme as a form of address. Checked before writing: the old file had zero
 * occurrences of "Comment" and zero of "M." / "Mme".
 *
 * être and avoir leave the conjugation table with them. A learner meeting
 * s'appeler for the first time does not need two more verbs beside it, and
 * conjugaison-u1.tsx already drills all three together for the stops that
 * want that.
 */
import type { NativeLesson } from "./types";

import { CONJ_ROWS, SE_PRESENTER_AXES, sePresenterQuestion } from "./se-presenter.gen";

export const sePresenterLesson: NativeLesson = {
  slug: "se-presenter",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">Se présenter</h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>Moi — <i lang="fr"><b>Je m&rsquo;appelle</b> Thomas.</i></li>
        <li>Quelqu&rsquo;un d&rsquo;autre — <i lang="fr"><b>Il s&rsquo;appelle</b> Lucas. <b>Elle s&rsquo;appelle</b> Emma.</i></li>
        <li>Demander (tu) — <i lang="fr"><b>Comment tu t&rsquo;appelles ?</b></i></li>
        <li>Demander (vous) — <i lang="fr"><b>Comment vous vous appelez ?</b></i></li>
        <li>Poliment — <i lang="fr">Bonjour, <b>Madame</b> Martin. Au revoir, <b>Monsieur</b> Dubois.</i></li>
      </ul>
      <table className="mt-3 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left">
            <th className="p-1" />
            <th className="p-1">s&rsquo;appeler</th>
          </tr>
        </thead>
        <tbody>
          {CONJ_ROWS.map(([p, ap]) => (
            <tr key={p} className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 font-bold">{p}</td>
              <td className="p-1 text-[color:var(--gram-neutral)]">{ap}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <span lang="fr"><i>S&rsquo;appeler</i></span> carries a little pronoun that changes with the subject:
        <span lang="fr"><i> je <b>m&rsquo;</b>appelle, tu <b>t&rsquo;</b>appelles, il <b>s&rsquo;</b>appelle</i></span>.
        With <span lang="fr"><i>vous</i></span> that pronoun is <span lang="fr"><i>vous</i></span> too, so the word really does appear twice:
        <span lang="fr"><i> <b>vous vous</b> appelez</i></span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Names: say one, ask for one, or address someone politely.",
    newQuestion: sePresenterQuestion,
    axes: SE_PRESENTER_AXES,
  },
  bonus: [
    { en: "My name is Thomas.", fr: "Je m'appelle Thomas." },
    { en: "His name is Lucas.", fr: "Il s'appelle Lucas." },
    { en: "Her name is Emma.", fr: "Elle s'appelle Emma." },
    { en: "Their names are Paul and Thomas.", fr: "Ils s'appellent Paul et Thomas." },
    { en: "What's your name? (to a friend)", fr: "Comment tu t'appelles ?", alt: ["Tu t'appelles comment ?"] },
    { en: "What's your name? (to a teacher)", fr: "Comment vous vous appelez ?", alt: ["Vous vous appelez comment ?"] },
    { en: "Hello, Mrs Martin.", fr: "Bonjour, Madame Martin.", alt: ["Bonjour Madame Martin.", "Bonjour, Mme Martin."] },
    { en: "Goodbye, Mr Dubois.", fr: "Au revoir, Monsieur Dubois.", alt: ["Au revoir Monsieur Dubois.", "Au revoir, M. Dubois."] },
  ],
};
