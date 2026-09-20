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
  formLayout: "dialogue",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">Se présenter</h2>
      {/* THE LABELS ARE ENGLISH, THE EXAMPLES ARE FRENCH (Dan, 2026-09-16:
          *"The Forms page is very unclear because there is way too much
          french in there for a beginner french"*). « Quelqu'un d'autre » and
          « Poliment » were signposts a first-week learner had to decode
          before reaching the sentence they point at; the sentence is the
          lesson, the signpost is furniture, and furniture is English.

          AND THE TWO SIT IN TWO COLUMNS (Dan, the same day, of the list as
          lines: *"alignment means that in the section before the table, you
          can put each line in two columns"*). Signpost left, sentence right,
          every sentence starting on the same vertical line — the shape of the
          conjugation table under it, so the two read as one sheet. A dash in
          running text made a learner find where each French sentence began
          five times over; a column does it once. `max-content` sizes the left
          column to its longest signpost and the French takes the rest. */}
      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-[15px] text-[color:var(--cahier-ink)]">
        <dt className="text-[color:var(--fluo-ink-soft)]">Yourself</dt>
        <dd className="m-0"><i lang="fr"><b>Je m&rsquo;appelle</b> Thomas.</i></dd>
        <dt className="text-[color:var(--fluo-ink-soft)]">Someone else</dt>
        <dd className="m-0"><i lang="fr"><b>Il s&rsquo;appelle</b> Lucas. <b>Elle s&rsquo;appelle</b> Emma.</i></dd>
        <dt className="text-[color:var(--fluo-ink-soft)]">Asking, to a friend</dt>
        <dd className="m-0"><i lang="fr"><b>Comment tu t&rsquo;appelles ?</b></i></dd>
        <dt className="text-[color:var(--fluo-ink-soft)]">Asking, politely</dt>
        <dd className="m-0"><i lang="fr"><b>Comment vous vous appelez ?</b></i></dd>
        <dt className="text-[color:var(--fluo-ink-soft)]">Addressing someone</dt>
        <dd className="m-0"><i lang="fr">Bonjour, <b>Madame</b> Martin. Au revoir, <b>Monsieur</b> Dubois.</i></dd>
      </dl>
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
        <span lang="fr"><i> je <span className="cahier-hl">m&rsquo;</span>appelle, tu <span className="cahier-hl">t&rsquo;</span>appelles, il <span className="cahier-hl">s&rsquo;</span>appelle</i></span>.
        With <span lang="fr"><i>vous</i></span> that pronoun is <span lang="fr"><i>vous</i></span> too, so the word really does appear twice:
        <span lang="fr"><i> vous <span className="cahier-hl">vous</span> appelez</i></span>.
      </p>
    </div>
  ),
  // TIER 3 · stop 1. TRANSPARENT block: the parts are visible and one of them
  // moves. The Mémo states that the little pronoun changes; what it cannot say
  // is that this is the whole of what makes the phrase work.
  concept: {
    subtitle: "Why the little word changes with you",
    contrast: (
      <>
        English has one phrase for this &mdash; <i>my name is</i>{" "}&mdash; and nothing in it
        moves. French carries a small extra pronoun that <b>changes with the subject</b>:{" "}
        {/* THE MOVING PART WEARS THE HIGHLIGHTER (Dan, 2026-09-16: *"Demonstrate
            with a colored background behind that extra pronoun"*). The sentence
            says one word moves; the colour shows WHICH, so a learner does not
            have to work out from the prose that m', t' and s' are the same slot.
            `.cahier-hl` is the house highlighter the deck tables already use for
            the part of an answer that matters. */}
        <i lang="fr">je <span className="cahier-hl">m&rsquo;</span>appelle</i>,{" "}
        <i lang="fr">tu <span className="cahier-hl">t&rsquo;</span>appelles</i>,{" "}
        <i lang="fr">il <span className="cahier-hl">s&rsquo;</span>appelle</i>.
      </>
    ),
    question: (
      <>
        <i lang="fr">Comment vous vous appelez&nbsp;?</i> Why is{" "}
        <i lang="fr">vous</i> written twice?
      </>
    ),
    answer: (
      <>
        Because the two are doing different jobs. The first is the subject; the second is that
        little pronoun, which for <i lang="fr">vous</i> happens to be{" "}
        <i lang="fr">vous</i> as well. It is not a slip of the pen &mdash;{" "}
        <i lang="fr">je m&rsquo;</i>, <i lang="fr">tu t&rsquo;</i>,{" "}
        <i lang="fr">il s&rsquo;</i>, <i lang="fr">vous vous</i>.
      </>
    ),
    pitfallHeads: ["treated as one fixed block", "what actually moves"],
    pitfall: [
      { label: <>tu</>, wrong: <><i lang="fr">tu m&rsquo;appelles</i></>, right: <><i lang="fr">tu t&rsquo;appelles</i></> },
      { label: <>vous</>, wrong: <><i lang="fr">comment vous appelez&nbsp;?</i></>, right: <><i lang="fr">comment vous <b>vous</b> appelez&nbsp;?</i></> },
    ],
    check: [
      { q: <>Emma introduces herself. Which pronoun?</>,
        a: <><i lang="fr">Je m&rsquo;appelle Emma.</i></> },
      { q: <>You ask a friend.</>,
        a: <><i lang="fr">Comment tu t&rsquo;appelles&nbsp;?</i> &mdash; <i lang="fr">tu</i> takes <i lang="fr">t&rsquo;</i>.</> },
    ],
    remember: (
      <>
        The phrase is not fixed. The small pronoun agrees with whoever is being named &mdash;
        and with <i lang="fr">vous</i> the word really does appear twice.
      </>
    ),
  },
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
