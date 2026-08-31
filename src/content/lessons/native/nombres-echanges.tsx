/**
 * « J'ai vingt-cinq ans. » — SIO-018's lesson (written 2026-08-28).
 *
 * The stop promised numbers 20–69 "in simple exchanges (ages, prices,
 * quantities)" and taught fifteen bare numerals. This teaches the exchanges.
 *
 * Data and generator live in ./nombres-echanges.gen.ts so a check can execute
 * them.
 */
import type { NativeLesson } from "./types";
import { NOMBRES_AXES, nombresQuestion } from "./nombres-echanges.gen";

export const nombresEchangesLesson: NativeLesson = {
  slug: "nombres-echanges",
  // TIER 2 CONCEPT — a question the WORD LIST cannot answer. Lifted from the
  // Mémo below; no grammar introduced that it does not teach. DRAFTED —
  // `contrast` and `remember` are the pedagogical claim and go to Dan first.
  concept: {
    subtitle: "Why in French you HAVE your age",
    contrast: (
      <>
        English <b>is</b> an age — <i>I am twenty-five</i>. French <b>has</b> one:{" "}
        <i lang="fr">j&rsquo;ai vingt-cinq ans</i>. And where English can stop at the
        number, French cannot: <i lang="fr">ans</i> is obligatory.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">j&rsquo;ai vingt-cinq ans</i> and never{" "}
        <i lang="fr">je suis vingt-cinq</i>?
      </>
    ),
    answer: (
      <>
        Because French counts age as something you possess, not something you are. The
        verb is <i lang="fr">avoir</i>, and the years must be named —{" "}
        <i lang="fr">j&rsquo;ai vingt-cinq</i> alone is not a sentence.
      </>
    ),
    pitfall: [
      { label: <>age</>, wrong: <i lang="fr">je suis vingt-cinq</i>, right: <i lang="fr">j&rsquo;ai vingt-cinq ans</i> },
      { label: <>dropping <i lang="fr">ans</i></>, wrong: <i lang="fr">j&rsquo;ai vingt-cinq</i>, right: <i lang="fr">j&rsquo;ai vingt-cinq ans</i> },
      { label: <>a woman, 21</>, wrong: <i lang="fr">trente et un personnes</i>, right: <i lang="fr">trente et une personnes</i> },
    ],
    check: [
      {
        q: <>Why <i lang="fr">trente et une personnes</i> with an <i lang="fr">-e</i>?</>,
        a: (
          <>
            <i lang="fr">Un</i> is the one number that agrees, and{" "}
            <i lang="fr">personne</i> is feminine. Every other number is invariable.
          </>
        ),
      },
      {
        q: <>How do you ask a price?</>,
        a: <><i lang="fr">C&rsquo;est combien ?</i> — and <i lang="fr">euro</i> takes its <i lang="fr">-s</i> in the plural.</>,
      },
    ],
    inShort: (
      <>
        <i lang="fr">avoir</i> + number + <i lang="fr">ans</i> · only{" "}
        <i lang="fr">un</i> agrees
      </>
    ),
    remember: <>In French you <b>have</b> your age — and you must say <i lang="fr">ans</i>.</>,
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les nombres au quotidien
      </h2>

      <p className="text-sm text-[color:var(--cahier-ink)]">
        You know the numbers. Here is what you do with them.
      </p>

      <div className="mt-3 space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">L&rsquo;âge 🎂</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            J&rsquo;<b>ai</b> vingt-cinq <b>ans</b>.
          </p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
            French <b>has</b> an age — never <span lang="fr"><s>je suis vingt-cinq</s></span>.
            And <b lang="fr">ans</b> can never be dropped.
          </p>
        </div>

        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Le prix 💶</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Ça coûte trente <b>euros</b>.
          </p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
            Ask with <span lang="fr">C&rsquo;est combien&nbsp;?</span> — and <b lang="fr">euro</b> takes
            its <b>s</b> in the plural.
          </p>
        </div>

        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">La quantité 🔢</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            <b>Il y a</b> quarante étudiants.
          </p>
          <p className="text-[13px] text-[color:var(--cahier-ink-soft)]">
            One phrase for &ldquo;there is&rdquo; and &ldquo;there are&rdquo;&nbsp;: <b lang="fr">il y a</b>.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">Un → une</p>
        <p className="text-[14px] text-[color:var(--cahier-ink)]" lang="fr">
          vingt et <b>un</b> ans&nbsp;· trente et <b>une</b> personnes
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]">
          The final <span lang="fr">un</span> agrees — it is the only number in this range that changes.
        </p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Use the number in a real sentence.",
    axes: NOMBRES_AXES,
    newQuestion: nombresQuestion,
  },
  bonus: [
    { en: "I am twenty-five years old.", fr: "J'ai vingt-cinq ans." },
    { en: "How old are you?", fr: "Tu as quel âge ?", alt: ["Vous avez quel âge ?"] },
    { en: "It costs thirty euros.", fr: "Ça coûte trente euros.", alt: ["C'est trente euros."] },
    { en: "How much is it?", fr: "C'est combien ?" },
    { en: "There are forty students.", fr: "Il y a quarante étudiants." },
    { en: "There are thirty-one people.", fr: "Il y a trente et une personnes." },
    { en: "She is sixty-nine years old.", fr: "Elle a soixante-neuf ans." },
    { en: "The coffee costs four euros.", fr: "Le café coûte quatre euros." },
    { en: "We have fifty minutes.", fr: "Nous avons cinquante minutes." },
  ],
};
