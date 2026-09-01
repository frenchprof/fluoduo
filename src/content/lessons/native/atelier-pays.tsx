/**
 * Native « Atelier — Présenter un pays » lesson — SIO-020, written 2026-09-01.
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

const SIO = "SIO-020";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierPaysLesson: NativeLesson = {
  slug: "atelier-pays",

  // TIER 3 · drafted 1 Sep in docs/ATELIER_CONCEPTS_DRAFT.md against this
  // stop's own dialogue, before this file existed; pasted in unchanged once
  // it landed. Typechecked and driven in a browser as a draft, and again
  // here. No French below is new — every line is a turn of the model.
  concept: {
    subtitle: "Why presenting a country takes three openers, not one",
    contrast: (
      <>
        English presents almost anything with the same handful of words &mdash;{" "}
        <i>this is</i>, <i>it&rsquo;s</i>, <i>there are</i>{" "}
        &mdash; and they trade places
        freely. This model uses three in its first three lines and never swaps them.
      </>
    ),
    question: (
      <>
        <i lang="fr">Voici le Japon</i>, <i lang="fr">C&rsquo;est un pays asiatique</i>,{" "}
        <i lang="fr">Ici, il y a des Japonais</i>. All three introduce. Why not{" "}
        <i lang="fr">c&rsquo;est</i> for all of them?
      </>
    ),
    answer: (
      <>
        Because they do three different jobs. <i lang="fr">Voici</i> <b>points</b>{" "}
        &mdash;
        you are showing the thing itself, so it keeps its own article:{" "}
        <i lang="fr">le Japon</i>. <i lang="fr">C&rsquo;est</i> <b>classifies</b>{" "}
        &mdash;
        it puts the thing in a category, so the category is indefinite:{" "}
        <i lang="fr">un pays</i>. <i lang="fr">Il y a</i> <b>inventories</b>{" "}
        &mdash; it
        says what is present, so what it counts is plural and indefinite:{" "}
        <i lang="fr">des Japonais</i>. The article is not decoration on the opener; it
        is the opener&rsquo;s job showing through.
      </>
    ),
    pitfallHeads: ["what one opener for everything gives", "what the job asks for"],
    pitfall: [
      {
        label: <>showing the country</>,
        wrong: <i lang="fr">C&rsquo;est le Japon</i>,
        right: (
          <>
            <i lang="fr">Voici le Japon</i>{" "}
            &mdash; you are pointing at it, not sorting it
          </>
        ),
      },
      {
        label: <>saying what kind</>,
        wrong: <i lang="fr">Voici un pays asiatique</i>,
        right: (
          <>
            <i lang="fr">C&rsquo;est un pays asiatique</i>{" "}
            &mdash; a category, so indefinite
          </>
        ),
      },
      {
        label: <>saying who is there</>,
        wrong: <i lang="fr">C&rsquo;est des Japonais</i>,
        right: (
          <>
            <i lang="fr">Ici, il y a des Japonais</i>{" "}
            &mdash; presence is <i lang="fr">il y a</i>, always
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Are you showing the thing itself? — Voici + its own article." },
      { depth: 0, text: "Are you saying what KIND it is? — C'est + un / une." },
      { depth: 0, text: "Are you saying what is THERE? — Il y a + des." },
    ],
    check: [
      {
        q: (
          <>
            You put the flag on screen and name it. <i lang="fr">Voici</i> or{" "}
            <i lang="fr">c&rsquo;est</i>?
          </>
        ),
        a: (
          <>
            <i lang="fr">Voici</i>{" "}
        &mdash; you are showing it. Use{" "}
            <i lang="fr">c&rsquo;est</i> for the next sentence, where you say what kind of
            flag it is.
          </>
        ),
      },
      {
        q: <>Why <i lang="fr">un pays</i> but <i lang="fr">le Japon</i>?</>,
        a: (
          <>
            Because <i lang="fr">c&rsquo;est</i> sorts the country into a category, and a
            category is one of many. <i lang="fr">Voici</i> shows the country itself, and
            there is only one Japan.
          </>
        ),
      },
    ],
    inShort: "Voici points · c'est classifies · il y a inventories",
    remember: (
      <>
        <b>The opener decides the article, not the noun.</b> Choose the job first &mdash;
        showing, sorting, or listing &mdash; and the article follows on its own.
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
