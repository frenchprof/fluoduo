/**
 * « Tu étudies quoi ? » — SIO-013's lesson.
 *
 * The deck sorts sixteen subjects by article and never asks the question its
 * own title poses. This is the exchange; the article comes along because the
 * answer cannot avoid it.
 *
 * Data and generator live in ./quelle-matiere.gen.ts so a check can run them.
 */
import type { NativeLesson } from "./types";
import { MATIERE_AXES, matiereQuestion } from "./quelle-matiere.gen";

export const quelleMatiereLesson: NativeLesson = {
  slug: "quelle-matiere",
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
    subtitle: "Why French keeps the article where English drops it",
    contrast: (
      <>
        English names a subject bare — <i>I study French</i>, <i>I study maths</i>. French
        keeps the article every time: <i lang="fr">j&rsquo;étudie le français</i>,{" "}
        <i lang="fr">j&rsquo;étudie les mathématiques</i>. The article never drops.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">j&rsquo;étudie le français</i> and never{" "}
        <i lang="fr">j&rsquo;étudie français</i>?
      </>
    ),
    answer: (
      <>
        Because a school subject is a <b>whole field</b>, and French marks a whole
        category with <i lang="fr">le</i> / <i lang="fr">la</i> / <i lang="fr">les</i>.
        English simply does not mark it, which is why the article feels like it is
        missing rather than added.
      </>
    ),
    pitfall: [
      { label: <>a subject</>, wrong: <i lang="fr">j&rsquo;étudie français</i>, right: <i lang="fr">j&rsquo;étudie le français</i> },
      { label: <>a plural subject</>, wrong: <i lang="fr">j&rsquo;étudie mathématiques</i>, right: <i lang="fr">j&rsquo;étudie les mathématiques</i> },
      { label: <>starts with a vowel</>, wrong: <i lang="fr">le anglais</i>, right: <i lang="fr">l&rsquo;anglais</i> },
    ],
    check: [
      {
        q: <>How do you say <i>I study history</i>?</>,
        a: <><i lang="fr">J&rsquo;étudie l&rsquo;histoire</i> — the article stays, and elides before the vowel.</>,
      },
      {
        q: <>Why is the article there at all, when English has none?</>,
        a: (
          <>
            Because you mean the subject as a whole field, and French marks a whole
            category with an article. It is the same rule as{" "}
            <i lang="fr">j&rsquo;aime le sport</i>.
          </>
        ),
      },
    ],
    inShort: (
      <>
        <i lang="fr">le</i> / <i lang="fr">la</i> / <i lang="fr">l&rsquo;</i> /{" "}
        <i lang="fr">les</i> + subject, always
      </>
    ),
    remember: (
      <>
        A subject is a whole field, and a whole field always takes its article.
      </>
    ),
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Tu étudies quoi&nbsp;?
      </h2>

      <div className="space-y-2">
        <div className="rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">demander</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            Tu étudies quoi&nbsp;? · Vous étudiez quoi&nbsp;?
          </p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label mb-1 text-[color:var(--cahier-ink-soft)]">répondre</p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            J&rsquo;étudie <b>le</b> français.
          </p>
          <p lang="fr" className="text-[15px] font-black text-[color:var(--cahier-ink)]">
            J&rsquo;étudie <b>les</b> mathématiques.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border-2 border-[color:var(--gram-neutral)]/40 bg-[color:var(--cahier-hl)]/25 p-2.5">
        <p className="text-[14px] font-bold text-[color:var(--cahier-ink)]">
          The article never drops.
        </p>
        <p className="mt-1 text-[13px] text-[color:var(--cahier-ink-soft)]">
          English says <i>I study French</i>; French says{" "}
          <b lang="fr">j&rsquo;étudie le français</b>. Never{" "}
          <span lang="fr"><s>j&rsquo;étudie français</s></span>.
        </p>
      </div>
    </div>
  ),
  dice: {
    instruction: "Ask, then answer — and keep the article.",
    axes: MATIERE_AXES,
    newQuestion: matiereQuestion,
  },
  bonus: [
    { en: "What are you studying?", fr: "Tu étudies quoi ?" },
    { en: "What are you studying? (polite)", fr: "Vous étudiez quoi ?" },
    { en: "I study French.", fr: "J'étudie le français." },
    { en: "I study maths.", fr: "J'étudie les mathématiques." },
    { en: "I study history.", fr: "J'étudie l'histoire." },
    { en: "She studies chemistry.", fr: "Elle étudie la chimie." },
    { en: "He studies computing.", fr: "Il étudie l'informatique." },
    { en: "I study languages.", fr: "J'étudie les langues." },
  ],
};
