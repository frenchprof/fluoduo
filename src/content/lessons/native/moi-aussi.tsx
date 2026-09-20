/**
 * « Moi aussi / Moi non plus » — SIO-011's lesson (written 2026-08-29).
 *
 * The stop teaches which pronoun goes where. The deck already frames « c'est
 * moi » and sorts subject-only from stressed-only; what it never drilled was
 * the everyday echo, which Dan chose over the preposition position:
 * "we don't want to see chez, sans or other prepositions. Instead of tout
 * seul — put ... aussi / non plus".
 *
 * Data and generator live in ./moi-aussi.gen.ts so a check can execute them.
 */
import type { NativeLesson } from "./types";
import { MOI_AUSSI_AXES, PAIRS, stressQuestion } from "./moi-aussi.gen";

export const moiAussiLesson: NativeLesson = {
  slug: "moi-aussi",
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Moi aussi, moi non plus
      </h2>

      <p className="text-sm text-[color:var(--cahier-ink)]">
        Eight pronouns for talking <i>about</i> people, not for driving a verb.
      </p>

      <table className="mt-2 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left">
            <th className="p-1 font-black">+ verbe</th>
            <th className="p-1 font-black">tout seul</th>
            <th className="p-1 font-black">+ verbe</th>
            <th className="p-1 font-black">tout seul</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((i) => (
            <tr key={i} className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 text-[color:var(--cahier-ink-soft)]">{PAIRS[i].subject}</td>
              <td className="p-1 font-black">{PAIRS[i].stress}</td>
              <td className="p-1 text-[color:var(--cahier-ink-soft)]">{PAIRS[i + 4].subject}</td>
              <td className="p-1 font-black">{PAIRS[i + 4].stress}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-2 text-[13px] text-[color:var(--cahier-ink-soft)]">
        Only four change shape&nbsp;: <span lang="fr">je→moi, tu→toi, il→lui, ils→eux</span>.
        The rest are the same word twice.
      </p>

      <div className="mt-3 space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Après une phrase ✅</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Je suis étudiant. Et toi&nbsp;? — <b>Moi aussi.</b>
          </p>
        </div>

        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Après une négation 🚫</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Je ne suis pas professeur. Et toi&nbsp;? — <b>Moi non plus.</b>
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Le piège</p>
        <p className="text-[14px] text-[color:var(--cahier-ink)]">
          English picks <i>me too</i> or <i>me neither</i>. French picks by the sentence you are
          answering&nbsp;: a negative takes <b lang="fr">non plus</b>, never{" "}
          <span lang="fr"><s>aussi</s></span>.
        </p>
      </div>

      <p className="mt-3 text-sm text-[color:var(--cahier-ink)]">
        Same eight words after <b lang="fr">c&rsquo;est</b>&nbsp;:{" "}
        <span lang="fr">Qui est-ce&nbsp;? — <b>C&rsquo;est lui.</b></span>
      </p>
    </div>
  ),
  // TIER 1 · stop 11. The Mémo says eight pronouns and that only four change
  // shape. The claim is WHERE they turn up: exactly where there is no verb for
  // an ordinary subject pronoun to attach to.
  concept: {
    subtitle: "Why moi and not je",
    contrast: (
      <>
        English uses <i>me</i> for anything that is not the subject and thinks no more about
        it. French keeps two sets, and the second one appears in one situation only:{" "}
        <b>where there is no verb</b> for the pronoun to drive.
      </>
    ),
    question: (
      <>
        <i lang="fr">Moi aussi.</i> Why not <i lang="fr">je aussi</i>?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">je</i>{" "}cannot stand on its own &mdash; it exists to sit in
        front of a verb, and there is no verb here. A pronoun left alone takes the stressed
        form. Only four of the eight actually change:{" "}
        <i lang="fr">je&rarr;moi</i>, <i lang="fr">tu&rarr;toi</i>,{" "}
        <i lang="fr">il&rarr;lui</i>, <i lang="fr">ils&rarr;eux</i>. The rest look
        unchanged, which is why the set is easy to miss.
      </>
    ),
    pitfallHeads: ["with a verb in mind", "standing alone"],
    pitfall: [
      { label: <>me too</>, wrong: <><i lang="fr">je aussi</i></>, right: <><i lang="fr">moi aussi</i></> },
      { label: <>and you?</>, wrong: <><i lang="fr">et tu&nbsp;?</i></>, right: <><i lang="fr">et toi&nbsp;?</i></> },
      { label: <>him, not her</>, wrong: <><i lang="fr">il, pas elle</i></>, right: <><i lang="fr">lui, pas elle</i></> },
    ],
    check: [
      { q: <>Why does <i lang="fr">elle</i> look the same in both sets?</>,
        a: <>Because it is. Only four change shape; the other four are doing the same job in a different place.</> },
      { q: <>Someone says they do not like coffee, and neither do you.</>,
        a: <><i lang="fr">Moi non plus.</i> No verb, so the stressed form.</> },
    ],
    remember: (
      <>
        A subject pronoun needs a verb. Take the verb away and you need the other set &mdash;
        which for four of them means a different word.
      </>
    ),
  },
  dice: {
    instruction: "Answer with the right pronoun — and the right tail.",
    axes: MOI_AUSSI_AXES,
    newQuestion: stressQuestion,
  },
  bonus: [
    { en: "I'm a student. — Me too.", fr: "Je suis étudiant. — Moi aussi." },
    { en: "I'm not a teacher. — Me neither.", fr: "Je ne suis pas professeur. — Moi non plus." },
    { en: "And you? — Me too.", fr: "Et toi ? — Moi aussi." },
    { en: "Paul is twenty. And Marc? — Him too.", fr: "Paul a vingt ans. Et Marc ? — Lui aussi." },
    { en: "Léa isn't French. And Marie? — Her neither.", fr: "Léa n'est pas française. Et Marie ? — Elle non plus." },
    { en: "Who is it? — It's me.", fr: "Qui est-ce ? — C'est moi." },
    { en: "It's them.", fr: "C'est eux." },
    { en: "We don't have the book. — Us neither.", fr: "Nous n'avons pas le livre. — Nous non plus." },
    { en: "Have a good day! — You too!", fr: "Bonne journée ! — Toi aussi !" },
  ],
};
