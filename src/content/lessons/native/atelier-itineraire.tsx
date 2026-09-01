/**
 * Native « Atelier — L'itinéraire » lesson — SIO-040, written 2026-09-01.
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

const SIO = "SIO-040";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierItineraireLesson: NativeLesson = {
  slug: "atelier-itineraire",

  // TIER 3 · drafted 1 Sep in docs/ATELIER_CONCEPTS_DRAFT.md against this
  // stop's own dialogue, before this file existed; pasted in unchanged once
  // it landed. Typechecked and driven in a browser as a draft, and again
  // here. No French below is new — every line is a turn of the model.
  concept: {
    subtitle: "Why the last step of an itinerary is not a move",
    contrast: (
      <>
        A route in English usually ends on its last instruction &mdash;{" "}
        <i>turn left and you&rsquo;re there</i>. This one does not. Its four moves are
        followed by a sentence that tells you to move nowhere at all.
      </>
    ),
    question: (
      <>
        <i lang="fr">tu prends</i>, <i lang="fr">tu vas</i>,{" "}
        <i lang="fr">tu tournes</i>{" "}
        &mdash; then{" "}
        <i lang="fr">la gare est en face du parc</i>. Why does the itinerary end on{" "}
        <i lang="fr">est</i>?
      </>
    ),
    answer: (
      <>
        Because the person following you does not need a fifth move &mdash; they need to
        know they have arrived. <i lang="fr">D&rsquo;abord</i>,{" "}
        <i lang="fr">ensuite</i> and <i lang="fr">puis</i> carry motion;{" "}
        <i lang="fr">enfin</i> carries a <b>landmark</b>. That is what{" "}
        <i lang="fr">enfin</i> means here: not the last thing you do, but the point at
        which you stop doing things.
      </>
    ),
    // NO PITFALL TABLE — Dan's 2 Sep ruling on atelier-pays, applied to the fault
    // wherever it repeats. Its wrong column struck through « Enfin, tu tournes à gauche » and « Enfin, tu vas tout droit », which are
    // CORRECT FRENCH: wrong for the moment, not wrong in the language.
    //
    // THE LINE IS CLEAN AND WORTH KNOWING. A wrong column earns its place where
    // the argument is about FORM — « en le bus », « une café », « bon nuit » are
    // impossible, and striking them teaches something true. An atelier never
    // argues form: it argues which correct option the moment asks for. So every
    // atelier's wrong column was striking real French, and no Tier 1 or Tier 2
    // concept has the fault. The right column's content stays in `flow`.
    flow: [
      { depth: 0, text: "Open with where you are going — Pour aller à la gare…" },
      { depth: 0, text: "Then the moves, in order: D'abord · Ensuite · Puis." },
      { depth: 1, text: "Each one a verb of motion — tu prends, tu vas, tu tournes." },
      { depth: 0, text: "Close with Enfin + where the place IS, not another turn." },
      { depth: 1, text: "Enfin, la gare est en face du parc." },
    ],
    check: [
      {
        q: (
          <>
            Why is <i lang="fr">Enfin, tu tournes à gauche</i> a poor last line?
          </>
        ),
        a: (
          <>
            Because it leaves the person walking with nothing to look for.{" "}
            <i lang="fr">Enfin</i> is where you hand them the landmark.
          </>
        ),
      },
      {
        q: (
          <>
            The model adds <i lang="fr">Tu peux aussi prendre le bus numéro cinq.</i>{" "}
            after the landmark. Why is that not a sixth step?
          </>
        ),
        a: (
          <>
            Because it is an alternative to the whole route, not a continuation of it.
            The itinerary was already finished by the landmark.
          </>
        ),
      },
    ],
    inShort: "D'abord · Ensuite · Puis move. Enfin arrives.",
    remember: (
      <>
        <b>End on where the place is, not on what to do next.</b> A route finishes when
        the person can recognise it, not when you run out of turns.
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
