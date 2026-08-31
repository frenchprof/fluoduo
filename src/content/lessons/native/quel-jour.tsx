/** « On est quel jour ? » — SIO-004's lesson (2026-08-29). Unit 0: the
 *  shortest true sentences. Data/generator in ./quel-jour.gen.ts. */
import type { NativeLesson } from "./types";
import { DAYS, MOMENTS, QUEL_JOUR_AXES, quelJourQuestion } from "./quel-jour.gen";

export const quelJourLesson: NativeLesson = {
  slug: "quel-jour",
  // TIER 2 CONCEPT — a question the WORD LIST cannot answer.
  //
  // Peers, 2026-08-31: the brief differs per tier. A Tier 1 concept answers a
  // question the FORMS cannot; a Tier 2 concept answers one the word list
  // cannot. Knowing every word on this deck still leaves this unanswered,
  // which is what earns the tab its place on a vocabulary stop.
  //
  // Lifted from the Mémo below; no grammar introduced that it does not teach.
  // DRAFTED — `contrast` and `remember` are the pedagogical claim and go to
  // Dan before they reach a learner.
  concept: {
    subtitle: "Why the days of the week are written small",
    contrast: (
      <>
        English capitalises every day — <i>Monday</i>, <i>Tuesday</i>. French writes them
        in lower case: <i lang="fr">lundi</i>, <i lang="fr">mardi</i>. They are ordinary
        words, not names.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">On est mardi</i> and never <i lang="fr">On est Mardi</i>?
      </>
    ),
    answer: (
      <>
        Because French reserves capitals for names — people, countries, cities. A day of
        the week is a common noun like <i lang="fr">le matin</i> or{" "}
        <i lang="fr">le soir</i>, so it is written small wherever it appears, including
        at the start of a list.
      </>
    ),
    pitfall: [
      { label: <>a day</>, wrong: <i lang="fr">On est Lundi.</i>, right: <i lang="fr">On est lundi.</i> },
      { label: <>a moment</>, wrong: <i lang="fr">C&rsquo;est le Matin.</i>, right: <i lang="fr">C&rsquo;est le matin.</i> },
      { label: <>a country</>, wrong: <i lang="fr">la france</i>, right: <i lang="fr">la France</i> },
    ],
    check: [
      {
        q: <>Which is right: <i lang="fr">Aujourd&rsquo;hui, c&rsquo;est Jeudi</i> or <i lang="fr">c&rsquo;est jeudi</i>?</>,
        a: <><i lang="fr">c&rsquo;est jeudi</i> — small, even mid-sentence after a comma.</>,
      },
      {
        q: <>Why does <i lang="fr">la France</i> keep its capital when <i lang="fr">lundi</i> does not?</>,
        a: (
          <>
            <i lang="fr">France</i> is a name; <i lang="fr">lundi</i> is an ordinary word.
            Capitals mark names, not importance.
          </>
        ),
      },
    ],
    inShort: (
      <>
        days and moments: lower case · people, countries and cities: capital
      </>
    ),
    remember: (
      <>
        In French a capital marks a <b>name</b>. A day of the week is not one.
      </>
    ),
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        On est quel jour&nbsp;?
      </h2>
      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Demander</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">On est quel jour&nbsp;?</p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Répondre</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">On est mardi.</p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
            or <span lang="fr">Aujourd&rsquo;hui, c&rsquo;est mardi.</span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-[14px] text-[color:var(--cahier-ink)]" lang="fr">
        {DAYS.join(" · ")}
      </p>
      <p className="mt-2 text-[14px] text-[color:var(--cahier-ink)]">
        <span lang="fr">C&rsquo;est quel moment&nbsp;? — C&rsquo;est {MOMENTS[0].fr}.</span>
      </p>
      <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]" lang="fr">
        {MOMENTS.map((m) => m.fr).join(" · ")}
      </p>
      <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">
        ⚠ No capitals&nbsp;: <span lang="fr">lundi</span>, not <span lang="fr">Lundi</span>.
      </p>
    </div>
  ),
  dice: { instruction: "Say the day, or the moment.", axes: QUEL_JOUR_AXES, newQuestion: quelJourQuestion },
  bonus: [
    { en: "What day is it? — It's Monday.", fr: "On est quel jour ? — On est lundi." },
    { en: "Today is Wednesday.", fr: "Aujourd'hui, c'est mercredi." },
    { en: "It's Saturday.", fr: "On est samedi." },
    { en: "It's the morning.", fr: "C'est le matin." },
    { en: "It's the evening.", fr: "C'est le soir." },
    { en: "What day is it? — It's Sunday.", fr: "On est quel jour ? — On est dimanche." },
  ],
};
