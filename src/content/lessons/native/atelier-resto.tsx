/**
 * Native « Atelier — Au restaurant » lesson — SIO-050, written 2026-09-01.
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

const SIO = "SIO-050";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierRestoLesson: NativeLesson = {
  slug: "atelier-resto",

  // TIER 3 · drafted 1 Sep in docs/ATELIER_CONCEPTS_DRAFT.md against this
  // stop's own dialogue, before this file existed; pasted in unchanged once
  // it landed. Typechecked and driven in a browser as a draft, and again
  // here. No French below is new — every line is a turn of the model.
  concept: {
    subtitle: "Why je veux bien is not je veux plus a word",
    contrast: (
      <>
        English uses one verb across the whole counter &mdash; <i>I&rsquo;d like</i> to
        order, <i>yes please</i> to accept, and the second is not a form of the first.
        French does the same, and the two look far more alike than they are.
      </>
    ),
    question: (
      <>
        <i lang="fr">Je voudrais un café</i>, then{" "}
        <i lang="fr">Oui, je veux bien</i>. Both are <i lang="fr">vouloir</i>. Why can
        you not use either one for both turns?
      </>
    ),
    answer: (
      <>
        Because only one of them is a want. <i lang="fr">Je voudrais</i> takes{" "}
        <i lang="fr">vouloir</i>{" "}
        apart and softens it &mdash; it asks for something not
        yet offered, so it needs what you are asking for after it:{" "}
        <i lang="fr">un café</i>. <i lang="fr">Je veux bien</i> comes apart into
        nothing: it does not mean <i>I want well</i>, it means <b>yes please</b>, and it
        answers an offer already made. That is why it is followed by no order at all.
      </>
    ),
    // NO PITFALL TABLE — Dan's 2 Sep ruling on atelier-pays, applied to the fault
    // wherever it repeats. Its wrong column struck through « Je veux un café » and « Je veux bien de l'eau », which are
    // CORRECT FRENCH: wrong for the moment, not wrong in the language.
    //
    // THE LINE IS CLEAN AND WORTH KNOWING. A wrong column earns its place where
    // the argument is about FORM — « en le bus », « une café », « bon nuit » are
    // impossible, and striking them teaches something true. An atelier never
    // argues form: it argues which correct option the moment asks for. So every
    // atelier's wrong column was striking real French, and no Tier 1 or Tier 2
    // concept has the fault. The right column's content stays in `flow`.
    flow: [
      { depth: 0, text: "Has the thing been offered to you yet?" },
      { depth: 1, text: "No — ask for it: Je voudrais + what you want, s'il vous plaît." },
      { depth: 1, text: "Yes — accept it whole: Oui, je veux bien." },
      { depth: 0, text: "The server's side is the mirror: Vous désirez ? then Vous voulez… ?" },
    ],
    check: [
      {
        q: (
          <>
            <i lang="fr">Vous voulez de l&rsquo;eau ?</i>{" "}
        &mdash; you do. What do you say?
          </>
        ),
        a: (
          <>
            <i lang="fr">Oui, je veux bien.</i> Nothing after it: the offer already
            named the water.
          </>
        ),
      },
      {
        q: (
          <>
            Why is <i lang="fr">je veux bien</i> not simply a polite{" "}
            <i lang="fr">je veux</i>?
          </>
        ),
        a: (
          <>
            Because it is not a want at all &mdash; it is an acceptance. You cannot open
            with it, only answer with it.
          </>
        ),
      },
    ],
    inShort: "Je voudrais asks. Je veux bien accepts.",
    remember: (
      <>
        <b>Ask with <i lang="fr">je voudrais</i> + the thing. Accept with{" "}
        <i lang="fr">je veux bien</i> + nothing.</b> The second is a block, not a
        conjugation.
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
