/**
 * Native "Pouvoir + infinitif" lesson (Unité 3, SIO-037).
 *
 * Why this file exists (2026-08-27). SIO-037's promise is « I can say what is
 * possible or allowed in a place and ask for permission », and until now the
 * stop served `modaux` — a three-verb paradigm table for vouloir/pouvoir/
 * devoir. So did SIO-048, whose promise is giving advice: two different goals
 * opening the same screen. The deck has said what it wanted all along
 * (`pouvoir.json` declares lessonSlug "pouvoir"); the lesson was never written.
 *
 * ONE verb, because the objective is one thing (Dan, 2026-08-27: "the original
 * intention … is to have the objectives broken down into bitesized
 * objectives"). vouloir belongs to SIO-029, devoir to SIO-048; neither appears
 * here. What varies instead is what the learner DOES with pouvoir — state a
 * possibility, ask permission, say something is not allowed — which is the
 * three-part shape of the SIO's own can-do.
 *
 * The vocabulary is the deck's, not invented: every action and place below is
 * drawn from pouvoir.json, so the Mémo and the drill teach the same French the
 * stop then tests.
 */
import type { NativeLesson } from "./types";

import { MEMO_ROWS, POUVOIR_AXES, pouvoirQuestion } from "./pouvoir.gen";

export const pouvoirLesson: NativeLesson = {
  slug: "pouvoir",
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        <em>Pouvoir</em> + infinitif — ce qui est possible
      </h2>
      <table className="w-full max-w-xs border-collapse text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <tbody>
          {MEMO_ROWS.map(([p, f]) => (
            <tr key={p} className="border-t border-[color:var(--cahier-rule)] first:border-t-0">
              <td className="p-1">{p}</td>
              <td className="p-1 font-bold text-[color:var(--gram-neutral)]">{f}</td>
              <td className="p-1 italic">+ infinitif</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-3 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>Dire ce qui est possible — <i lang="fr">On <b>peut</b> visiter le musée.</i></li>
        <li>Demander la permission — <i lang="fr"><b>Je peux</b> manger ici ?</i></li>
        <li>Dire que c&rsquo;est interdit — <i lang="fr">On <b>ne peut pas</b> fumer ici.</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>The negation wraps <i>pouvoir</i></b>, never the infinitive:{" "}
        <span lang="fr">On <b>ne</b> peut <b>pas</b> fumer ici.</span> And the second verb always
        stays an infinitive — <span lang="fr"><i>je peux manger</i></span>, never{" "}
        <span lang="fr"><i>je peux mange</i></span>.
      </p>
    </div>
  ),
  // TIER 1 · stop 37. The batch's through-line: only the FIRST verb conjugates.
  // The Mémo states it as a warning about the negative; the concept makes it the
  // rule the warning follows from.
  concept: {
    subtitle: "Why only the first verb changes",
    contrast: (
      <>
        English changes the second verb too &mdash; <i>I can go</i>, <i>he can go</i>, but{" "}
        <i>he goes</i>. French freezes it: whatever <i lang="fr">pouvoir</i> does, the verb
        after it stays in the infinitive, every time.
      </>
    ),
    question: (
      <>
        <i lang="fr">On ne peut pas fumer ici.</i> Why does{" "}
        <i lang="fr">pas</i> land before <i lang="fr">fumer</i> and not after?
      </>
    ),
    answer: (
      <>
        Because the negative wraps the verb that is doing the work, and that is{" "}
        <i lang="fr">pouvoir</i>. <i lang="fr">Fumer</i> is just its object. The same
        applies to the person: <i lang="fr">je peux</i>, <i lang="fr">nous pouvons</i>{" "}
        &mdash; and <i lang="fr">fumer</i> never moves at all.
      </>
    ),
    pitfall: [
      { label: <>you cannot smoke</>, wrong: <><i lang="fr">on peut ne pas fumer</i></>, right: <><i lang="fr">on ne peut pas fumer</i></> },
      { label: <>we can visit</>, wrong: <><i lang="fr">nous pouvons visitons</i></>, right: <><i lang="fr">nous pouvons visiter</i></> },
    ],
    check: [
      { q: <>Ask permission to eat here.</>,
        a: <><i lang="fr">Je peux manger ici&nbsp;?</i></> },
      { q: <>Which of the two verbs carries the person?</>,
        a: <>Only the first. The second is an infinitive and stays one.</> },
    ],
    remember: (
      <>
        One verb conjugates, one does not &mdash; and the negative belongs to the one that
        does.
      </>
    ),
  },
  dice: {
    instruction: "Say what is possible, ask permission, or say it is not allowed.",
    newQuestion: pouvoirQuestion,
    axes: POUVOIR_AXES,
  },
  bonus: [
    { en: "Can I eat here?", fr: "Je peux manger ici ?", alt: ["Est-ce que je peux manger ici ?"] },
    { en: "We can visit the museum.", fr: "On peut visiter le musée." },
    { en: "You can park there.", fr: "Tu peux te garer là." },
    { en: "You (formal) can buy the tickets here.", fr: "Vous pouvez acheter les billets ici." },
    { en: "We can walk around.", fr: "On peut se promener." },
    { en: "She can come with us.", fr: "Elle peut venir avec nous." },
    { en: "They can wait here.", fr: "Ils peuvent attendre ici." },
    { en: "You can't smoke here.", fr: "On ne peut pas fumer ici." },
  ],
};
