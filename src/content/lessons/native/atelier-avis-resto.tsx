/**
 * Native « Atelier — Avis de restaurant » lesson — SIO-049, written 2026-09-01.
 *
 * One of the five ateliers that follow atelier-rencontre.tsx. `concept` is
 * deliberately absent — the concepts lane's — and verify77 asserts it stays so.
 *
 * THE MÉMO IS THE MODEL, PASSED THROUGH, and that is the whole reason this file
 * is three lines of wiring rather than a Mémo of its own. `LessonPager` resolves
 * the panel as `memo={lesson?.memo ?? memoForDeck(collectionId)}`, so merely
 * REGISTERING a lesson for an atelier deletes « Le modèle » from the panel Dan
 * asked an atelier to open on. verify71 cannot see it happen — it reads
 * memos.tsx, which stays correct while nothing renders it.
 *
 * THE EXERCISE IS THE MODEL'S OWN TURNS. It was the FINALE bank first, and
 * atelierModel.ts records in full why that was reverted: those items were
 * authored for a type-in game, and every multiple choice built by substituting
 * one item's answer into another item's frame is a gamble on agreement — it
 * produced « Bon chance » and « un sympa restaurant » before it was caught.
 */
import type { NativeLesson } from "./types";
import { memoForDeck } from "@/content/memos";
import { ATELIER_DIALOGUES } from "@/content/ateliers";
import { questionFor } from "./atelierModel";

const SIO = "SIO-049";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierAvisRestoLesson: NativeLesson = {
  slug: "atelier-avis-resto",

  // TIER 3 · drafted 1 Sep in docs/ATELIER_CONCEPTS_DRAFT.md against this
  // stop's own dialogue, before this file existed; pasted in unchanged once
  // it landed. Typechecked and driven in a browser as a draft, and again
  // here. No French below is new — every line is a turn of the model.
  concept: {
    subtitle: "Why the negative sentence is the compliment",
    contrast: (
      <>
        In English a negative in a review reads as a complaint &mdash;{" "}
        <i>it isn&rsquo;t fast</i>, <i>it wasn&rsquo;t good</i>. This review&rsquo;s one
        negative sentence is its warmest praise, and its actual complaint contains no
        negative at all.
      </>
    ),
    question: (
      <>
        <i lang="fr">Ce n&rsquo;est pas cher</i> against{" "}
        <i lang="fr">Parfois, le service est un peu lent</i>. Which of those two is the
        criticism?
      </>
    ),
    answer: (
      <>
        The second. <i lang="fr">Ce n&rsquo;est pas cher</i> denies a fault, which is a
        compliment: cheapness is good news. The complaint is the sentence with no{" "}
        <i lang="fr">ne… pas</i> in it, and it arrives wrapped three times &mdash;{" "}
        <i lang="fr">parfois</i> says not always, <i lang="fr">un peu</i> says not very,
        and <i lang="fr">mais je recommande ce restaurant</i> then overrules it
        outright. A French review does not soften by hedging the grammar; it hedges the
        <b> frequency</b>, the <b>degree</b>, and the <b>verdict</b>.
      </>
    ),
    pitfallHeads: ["reading the grammar", "reading the review"],
    pitfall: [
      {
        label: <>the negative</>,
        wrong: <><i lang="fr">Ce n&rsquo;est pas cher</i> = a complaint</>,
        right: <>praise &mdash; a fault denied</>,
      },
      {
        label: <>the complaint</>,
        wrong: <i lang="fr">Le service est lent.</i>,
        right: (
          <>
            <i lang="fr">Parfois, le service est un peu lent.</i>{" "}
            &mdash; how often, and how much
          </>
        ),
      },
      {
        label: <>the ending</>,
        wrong: <>closing on the complaint</>,
        right: (
          <>
            <i lang="fr">Mais je recommande ce restaurant !</i>{" "}
            &mdash; the verdict is the last line
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Say what you like, plainly — J'aime beaucoup ce restaurant." },
      { depth: 0, text: "Give the evidence, negatives included: Ce n'est pas cher." },
      { depth: 0, text: "One reservation, wrapped: parfois + un peu." },
      { depth: 0, text: "Then the verdict, with mais — and the verdict wins." },
    ],
    check: [
      {
        q: (
          <>
            Is <i lang="fr">Ce n&rsquo;est pas cher</i> a good thing or a bad thing?
          </>
        ),
        a: (
          <>
            Good. It denies a fault. The negative marks what the place is{" "}
            <em>not</em> guilty of.
          </>
        ),
      },
      {
        q: (
          <>
            You want to say the service is slow without withdrawing the
            recommendation. What do you add?
          </>
        ),
        a: (
          <>
            <i lang="fr">Parfois</i> and <i lang="fr">un peu</i>{" "}
        &mdash; then close on{" "}
            <i lang="fr">mais je recommande</i>, so the verdict is the last thing read.
          </>
        ),
      },
    ],
    inShort: "The negative praises. The hedges criticise. The last line decides.",
    remember: (
      <>
        <b>A complaint is softened by frequency and degree, not by grammar.</b>{" "}
        <i lang="fr">Parfois</i>, <i lang="fr">un peu</i>, and then{" "}
        <i lang="fr">mais</i>.
      </>
    ),
  },

  memo: memoForDeck(DECK),

  // NO AXIS. A model's turns are not a set of kinds to filter — every line is
  // one line — and a dropdown that cannot narrow anything is decoration
  // (verify46: "a dropdown with one answer"). A .gen.ts exists so that suite can
  // execute an axis, so with no axis there is none.
  dice: {
    instruction: "Say that line of the model, in French.",
    newQuestion: () => questionFor(SIO),
  },

  // The model's own turns, EN→FR, under atelierDecks.ts's filter: a line already
  // dealt is a free point, and a line whose French and English are identical is
  // a proper name rather than language to learn.
  bonus: ATELIER_DIALOGUES[SIO].filter(
    (l, i, all) => l.fr !== l.en && all.findIndex((o) => o.fr === l.fr) === i,
  ).map((l) => ({ en: l.en, fr: l.fr })),
};
