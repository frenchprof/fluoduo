/** « Qu'est-ce que c'est ? » — SIO-021's lesson (2026-08-29).
 *  The deck already answers; this teaches the asking — and, on Dan's word the
 *  same day, the pronoun that refers back to what was named: il / elle / ils /
 *  elles, on his four examples (sac, gomme, ciseaux, lunettes). */
import type { NativeLesson } from "./types";
import { QQC_AXES, quEstCeQuestion } from "./qu-est-ce-que-c-est.gen";

export const quEstCeLesson: NativeLesson = {
  slug: "qu-est-ce-que-c-est",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Qu&rsquo;est-ce que c&rsquo;est&nbsp;?
      </h2>
      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Qu&rsquo;est-ce que c&rsquo;est&nbsp;? — C&rsquo;est un stylo.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — C&rsquo;est qui&nbsp;? — C&rsquo;est le professeur.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            — Qu&rsquo;est-ce que c&rsquo;est&nbsp;? — <b>Ce sont</b> des ciseaux.
          </p>
        </div>
      </div>
      <p className="mt-3 text-[14px] font-bold text-[color:var(--cahier-ink)]">
        ⚠ One thing&nbsp;: <span lang="fr">c&rsquo;est</span>. Several&nbsp;:{" "}
        <span lang="fr">ce sont</span> — never <span lang="fr"><s>c&rsquo;est des</s></span>.
      </p>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">
          et après&nbsp;: il · elle · ils · elles
        </p>
        <table className="w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
          <tbody>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">C&rsquo;est <b>un</b> sac.</td>
              <td className="p-1 font-black">→ <b>Il</b> est là.</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">C&rsquo;est <b>une</b> gomme.</td>
              <td className="p-1 font-black">→ <b>Elle</b> est là.</td>
            </tr>
            <tr className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1">Ce sont <b>des</b> ciseaux.</td>
              <td className="p-1 font-black">→ <b>Ils</b> sont là.</td>
            </tr>
            <tr>
              <td className="p-1">Ce sont <b>des</b> lunettes.</td>
              <td className="p-1 font-black">→ <b>Elles</b> sont là.</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1.5 text-[13px] text-[color:var(--cahier-ink-soft)]">
          English has <i>it</i> and <i>they</i> for all four. French picks by
          gender and number — and the verb moves with it,{" "}
          <b lang="fr">est</b> → <b lang="fr">sont</b>.
        </p>
      </div>
    </div>
  ),
  // TIER 1 · stop 21. Two claims that belong together: c'est/ce sont is a NUMBER
  // agreement, and the pair hands over to il/elle once the thing is named. The
  // Mémo shows both in a table without saying they are one move.
  concept: {
    subtitle: "Why c’est becomes il est",
    contrast: (
      <>
        English says <i>it is</i> twice &mdash; <i>it is a pen</i>, <i>it is over there</i>.
        French uses two different openers, and which one you need depends on whether the
        thing has been <b>named yet</b>.
      </>
    ),
    question: (
      <>
        <i lang="fr">C&rsquo;est un sac.</i> Now say it is over there.
      </>
    ),
    answer: (
      <>
        <i lang="fr">Il est l&agrave;.</i> Once the thing is identified you stop pointing at
        it and start talking about it, so the pronoun becomes the one that matches its
        gender. And in the plural the opener changes too:{" "}
        <i lang="fr">ce sont des ciseaux</i>, never <i lang="fr">c&rsquo;est des</i>.
      </>
    ),
    pitfall: [
      { label: <>several things</>, wrong: <><i lang="fr">c&rsquo;est des ciseaux</i></>, right: <><i lang="fr">ce sont des ciseaux</i></> },
      { label: <>after naming it</>, wrong: <><i lang="fr">c&rsquo;est l&agrave;</i></>, right: <><i lang="fr">il est l&agrave;</i></> },
    ],
    flow: [
      { depth: 0, text: "Naming it for the first time?" },
      { depth: 1, text: "one → c'est" },
      { depth: 1, text: "several → ce sont" },
      { depth: 0, text: "Already named? → il · elle · ils · elles" },
    ],
    check: [
      { q: <>« <i lang="fr">C&rsquo;est une gomme.</i> » Now say it is over there.</>,
        a: <><i lang="fr">Elle est l&agrave;.</i> Feminine, because <i lang="fr">gomme</i> is.</> },
      { q: <>Why is <i lang="fr">c&rsquo;est des ciseaux</i> wrong?</>,
        a: <>The opener agrees in number like anything else. Several things take{" "}
        <i lang="fr">ce sont</i>.</> },
    ],
    remember: (
      <>
        <i lang="fr">C&rsquo;est</i> introduces. <i lang="fr">Il est</i> continues. The
        switch happens the moment the thing has a name.
      </>
    ),
  },
  dice: { instruction: "Ask, and answer.", axes: QQC_AXES, newQuestion: quEstCeQuestion },
  bonus: [
    { en: "What is it? — It's a bag.", fr: "Qu'est-ce que c'est ? — C'est un sac." },
    { en: "What is it? — It's a rubber.", fr: "Qu'est-ce que c'est ? — C'est une gomme." },
    { en: "Who is it? — It's the teacher.", fr: "C'est qui ? — C'est le professeur." },
    { en: "They're scissors.", fr: "Ce sont des ciseaux." },
    { en: "It's a bag. — It's over there.", fr: "C'est un sac. — Il est là." },
    { en: "It's a rubber. — It's over there.", fr: "C'est une gomme. — Elle est là." },
    { en: "They're scissors. — They're over there.", fr: "Ce sont des ciseaux. — Ils sont là." },
    { en: "They're glasses. — They're over there.", fr: "Ce sont des lunettes. — Elles sont là." },
  ],
};
