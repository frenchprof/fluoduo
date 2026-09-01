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
  // stop's own dialogue, before this file existed. No French below is new.
  //
  // THE CONTRAST WAS FALSE AS DRAFTED, AND DAN CAUGHT IT. It read: "English
  // presents almost anything with the same handful of words — this is, it's,
  // there are — and they trade places freely." They do not. English has the
  // same three-way system French does: presentational (here is / this is),
  // identificational (it's), existential (there are), and « It's an Asian
  // country » cannot become « There is an Asian country ». The claim invented
  // an English weakness to make French look principled.
  //
  // The true difference is narrower and still worth the concept: English varies
  // the SUBJECT and keeps one verb — this is, it is, there are — while French
  // changes the construction, including the verb (être → avoir) and once
  // dispensing with one (voici). A learner cannot derive one from another by
  // swapping a pronoun, which is why all three have to be learned whole.
  concept: {
    subtitle: "Why presenting a country takes three openers, not one",
    contrast: (
      <>
        English changes only the subject and keeps the verb &mdash; <i>this</i> is,{" "}
        <i>it</i> is, <i>there</i> are. French changes the whole construction:{" "}
        <i lang="fr">voici</i> has no verb at all, <i lang="fr">c&rsquo;est</i> is{" "}
        <i lang="fr">être</i>, <i lang="fr">il y a</i> is <i lang="fr">avoir</i>. You
        cannot get from one to the next by swapping a word.
      </>
    ),
    question: (
      <>
        <i lang="fr">Voici le Japon</i>, <i lang="fr">C&rsquo;est un pays asiatique</i>,{" "}
        <i lang="fr">Ici, il y a des Japonais</i>. All three introduce. Why not{" "}
        <i lang="fr">c&rsquo;est</i> for all of them?
      </>
    ),
    // ONE LINE PER OPENER (Dan, 2 Sep: "can be presented a new line for a new
    // sentence"). The three jobs are three things, so they are three lines.
    //
    // AND THE ARTICLE CLAIM IS GONE — it was wrong. This slot used to end "the
    // article is not decoration on the opener; it is the opener's job showing
    // through", and the remember line said "the opener decides the article, not
    // the noun." Dan pushed back on the check that rested on it, and he is
    // right: « Voici un pays » and « C'est le Japon » are both perfectly good
    // French. The article follows the NOUN and how it is being referred to —
    // « le Japon » takes one because a named country does (stop 15) — not the
    // opener. The three-way job distinction survives on its own; the article
    // rule never existed.
    answer: (
      <div className="space-y-1.5">
        <p>They do three different jobs, and only one of them is showing.</p>
        <p>
          <i lang="fr">Voici</i>{" "}
          &mdash; you <b>show</b> it:{" "}
          <i lang="fr">Voici le Japon.</i>
        </p>
        <p>
          <i lang="fr">C&rsquo;est</i>{" "}
          &mdash; you say <b>what kind</b> it is:{" "}
          <i lang="fr">C&rsquo;est un pays asiatique.</i>
        </p>
        <p>
          <i lang="fr">Il y a</i>{" "}
          &mdash; you say <b>what is there</b>:{" "}
          <i lang="fr">Ici, il y a des Japonais.</i>
        </p>
        <p>
          Reach for <i lang="fr">c&rsquo;est</i> every time and two of the three
          sentences say something you did not mean.
        </p>
      </div>
    ),
    // NO PITFALL TABLE HERE, AND THE REASON IS SPECIFIC TO THIS STOP.
    // Dan, 2 Sep, looking at the wrong column: "i would delete this column".
    // It struck through « C'est le Japon », « Voici un pays asiatique » and
    // « C'est des Japonais » — and ALL THREE ARE CORRECT FRENCH. They are wrong
    // only for the job the line is doing, not wrong in the language. A wrong
    // column works when the form is impossible (« en le bus »); here it would
    // teach a beginner that three real sentences are errors.
    //
    // What the right column said now lives in `flow`, which was already saying
    // it: the job decides the opener, and the article follows the opener.
    flow: [
      { depth: 0, text: "Are you showing the thing itself? — Voici + its own article." },
      { depth: 0, text: "Are you saying what KIND it is? — C'est + un / une." },
      { depth: 0, text: "Are you saying what is THERE? — Il y a + des." },
    ],
    // THE OLD CHECKS WERE BOTH CONTESTABLE, WHICH IS WHY DAN DID NOT AGREE WITH
    // THEM. The first asked which opener names a flag on screen and answered
    // « voici » — but « C'est le drapeau du Japon » is just as good, so the
    // question had two right answers and marked one wrong. The second asked why
    // « un pays » but « le Japon » and answered from the opener, which was the
    // false rule above. These two name the JOB in the question, so the mapping
    // is the only thing being tested and there is one answer.
    check: [
      {
        q: (
          <>
            You have shown the country. Now you want to say it is in Asia. Which
            opener?
          </>
        ),
        a: (
          <>
            <i lang="fr">C&rsquo;est</i>{" "}
          &mdash; you are saying what kind it is, not
            showing it again: <i lang="fr">C&rsquo;est un pays asiatique.</i>
          </>
        ),
      },
      {
        q: <>And to say who lives there?</>,
        a: (
          <>
            <i lang="fr">Il y a</i>{" "}
          &mdash; you are saying what is present:{" "}
            <i lang="fr">Ici, il y a des Japonais.</i>
          </>
        ),
      },
    ],
    inShort: "Voici shows · c'est says what kind · il y a says what is there",
    remember: (
      <>
        <b>Three jobs, three openers.</b>{" "}
        Decide whether you are showing it, saying
        what kind it is, or saying what is there &mdash; and the opener follows.
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
