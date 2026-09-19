/**
 * Native "Futur proche" lesson (Unité 4) — distilled from 21-futur-proche.html:
 * the Mémo + the 🎲 dice trainer + EN→FR bonus, as real in-app content.
 */
import type { NativeLesson } from "./types";

import { FUTUR_PROCHE_AXES, MEMO_ROWS, futurProcheQuestion } from "./futur-proche.gen";

export const futurProcheLesson: NativeLesson = {
  slug: "futur-proche",
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Le futur proche : <em>aller</em> + infinitif
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
      <p className="mt-2 text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <i>Je <b>vais</b> faire du sport. · On <b>va</b> partir en vacances.</i>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>The negation wraps <i>aller</i></b>, not the infinitive:{" "}
        <span lang="fr">Je <b>ne</b> vais <b>pas</b> sortir. · Nous <b>n&rsquo;</b>allons <b>pas</b> travailler.</span>
      </p>
    </div>
  ),
  // TIER 1 · stop 47. A verb of MOVEMENT doing the work of a TENSE. That is the
  // step a learner has to take, and no table of forms can show it.
  concept: {
    subtitle: "Why going somewhere became going to do something",
    contrast: (
      <>
        English does exactly the same thing and nobody notices: <i>I am going to eat</i> has
        no walking in it. French borrows <i lang="fr">aller</i>{" "}the same way &mdash; a verb
        of movement, put in front of an infinitive, stops meaning movement and starts
        meaning <b>soon</b>.
      </>
    ),
    question: (
      <>
        <i lang="fr">Je vais faire du sport.</i> Am I going somewhere?
      </>
    ),
    answer: (
      <>
        No. <i lang="fr">Aller</i> + an infinitive is a tense, not a journey &mdash; it says
        the thing is about to happen. You already know every form of it, which is the point:
        the future costs you no new conjugation at all.
      </>
    ),
    pitfall: [
      { label: <>I am going to go out</>, wrong: <><i lang="fr">je vais aller sortir</i></>, right: <><i lang="fr">je vais sortir</i></> },
      { label: <>we are not going to work</>, wrong: <><i lang="fr">nous allons ne pas travailler</i></>, right: <><i lang="fr">nous n&rsquo;allons pas travailler</i></> },
    ],
    check: [
      { q: <>Why does the negative wrap <i lang="fr">aller</i> and not the infinitive?</>,
        a: <>Because <i lang="fr">aller</i> is the verb doing the work. Same rule as{" "}
        <i lang="fr">pouvoir</i>.</> },
      { q: <>How many new endings does this tense need?</>,
        a: <>None. You conjugate <i lang="fr">aller</i>, which you already have.</> },
    ],
    remember: (
      <>
        <i lang="fr">Aller</i> + infinitive is not travel. It is the near future, built from
        a verb you already know.
      </>
    ),
  },
  dice: {
    instruction: "Build the sentence in the futur proche — watch the ✅/🚫 polarity.",
    newQuestion: futurProcheQuestion,
    axes: FUTUR_PROCHE_AXES,
  },
  bonus: [
    { en: "I am going to do sport.", fr: "Je vais faire du sport." },
    { en: "We are going to go out.", fr: "Nous allons sortir." },
    { en: "She is going to sleep more.", fr: "Elle va dormir plus." },
    { en: "They (m.) are going to study French.", fr: "Ils vont étudier le français." },
    { en: "You (sg.) are going to make dinner.", fr: "Tu vas préparer le dîner." },
    { en: "I am not going to go out tonight.", fr: "Je ne vais pas sortir ce soir." },
    { en: "We are not going to work.", fr: "Nous n'allons pas travailler." },
    { en: "He is not going to quit coffee.", fr: "Il ne va pas arrêter le café." },
    { en: "You (pl.) are going to watch a film.", fr: "Vous allez regarder un film." },
    { en: "They (f.) are not going to run.", fr: "Elles ne vont pas courir." },
  ],
};
