/**
 * Native « Atelier — Un petit e-mail » lesson — SIO-030, written 2026-09-01.
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

const SIO = "SIO-030";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierEmailLesson: NativeLesson = {
  slug: "atelier-email",

  // TIER 3 · drafted 1 Sep in docs/ATELIER_CONCEPTS_DRAFT.md against this
  // stop's own dialogue, before this file existed; pasted in unchanged once
  // it landed. Typechecked and driven in a browser as a draft, and again
  // here. No French below is new — every line is a turn of the model.
  concept: {
    subtitle: "Why a French wish names the occasion",
    contrast: (
      <>
        English wishes describe a feeling and stretch to fit &mdash; <i>good luck</i>{" "}
        covers an exam, a journey and a job interview alike. French wishes name{" "}
        <b>the occasion itself</b>, so a wish only exists where there is a noun for
        what is happening.
      </>
    ),
    question: (
      <>
        This message wishes four things &mdash; <i lang="fr">bon anniversaire</i>,{" "}
        <i lang="fr">bonne chance</i>, <i lang="fr">bon voyage</i>,{" "}
        <i lang="fr">bonne journée</i>. Why can none of them be swapped for another?
      </>
    ),
    answer: (
      <>
        Because the second word <b>is</b> the occasion. <i lang="fr">chance</i> is the
        luck an exam needs, <i lang="fr">voyage</i> is the trip to Paris,{" "}
        <i lang="fr">anniversaire</i> is Saturday itself. Wishing{" "}
        <i lang="fr">bonne chance</i>{" "}
        for the trip does not sound odd &mdash; it wishes
        something else entirely. So the work is not translating the feeling; it is
        finding the noun for what the person is about to do.
      </>
    ),
    // NO PITFALL TABLE — Dan's 2 Sep ruling on atelier-pays, applied to the fault
    // wherever it repeats. Its wrong column struck through « bonne chance pour ton voyage » and « bonne chance », which are
    // CORRECT FRENCH: wrong for the moment, not wrong in the language.
    //
    // THE LINE IS CLEAN AND WORTH KNOWING. A wrong column earns its place where
    // the argument is about FORM — « en le bus », « une café », « bon nuit » are
    // impossible, and striking them teaches something true. An atelier never
    // argues form: it argues which correct option the moment asks for. So every
    // atelier's wrong column was striking real French, and no Tier 1 or Tier 2
    // concept has the fault. The right column's content stays in `flow`.
    flow: [
      { depth: 0, text: "What is the person about to do?" },
      { depth: 1, text: "Find the noun for it — anniversaire, voyage, journée." },
      { depth: 1, text: "No noun for the event? Wish the luck instead — bonne chance pour…" },
      { depth: 0, text: "Then bon or bonne, by that noun's gender (stop 9)." },
    ],
    check: [
      {
        q: (
          <>
            A friend is about to sit an exam. Why not <i lang="fr">bon examen</i>?
          </>
        ),
        a: (
          <>
            Because you are not wishing them a good exam &mdash; you are wishing them the
            luck to get through it: <i lang="fr">bonne chance pour ton examen</i>.
          </>
        ),
      },
      {
        q: <>Why does the message close on <i lang="fr">bonne journée</i>?</>,
        a: (
          <>
            Because the occasion at the end of a message is simply the rest of the
            person&rsquo;s day. Then <i lang="fr">à bientôt</i> says when you next meet.
          </>
        ),
      },
    ],
    inShort: "Find the noun for the occasion; the wish is then decided.",
    remember: (
      <>
        <b>You cannot wish what you have no noun for.</b> Name the occasion and the
        wish writes itself.
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
