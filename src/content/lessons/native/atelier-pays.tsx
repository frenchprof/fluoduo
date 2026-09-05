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
    subtitle: "Why presenting a country takes three openers",
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
    // DAN'S OWN FRAMING, 2 Sep, put into layman English at his request:
    //   "Voici introduces a new referent to the discourse (— how to say this in
    //    layman language?) C'est provides information about that referent, and
    //    Il y a says what there is."
    //
    // "Introduces a new referent to the discourse" becomes "brings the thing in
    // — the first time you mention it", and "provides information about that
    // referent" becomes "says something about it, now that it is in".
    //
    // THIS IS A BETTER ARGUMENT THAN THE ONE IT REPLACES, and it is Dan's. Mine
    // had three parallel jobs — showing, sorting, listing — which left the
    // question "why not c'est throughout?" answered only by assertion. A chain
    // answers it: « c'est » has nothing to be about until something has been
    // brought in, which is also why the model runs in this order and not
    // another.
    //
    // ONE LINE PER SENTENCE, also Dan's ("can be presented a new line for a new
    // sentence").
    answer: (
      <div className="space-y-1.5">
        <p>
          <i lang="fr">Voici</i> &mdash; <b>brings the thing in</b>, the first time you
          mention it: <i lang="fr">Voici le Japon.</i>
        </p>
        <p>
          <i lang="fr">C&rsquo;est</i> &mdash; <b>says something about it</b>, now that
          it is in: <i lang="fr">C&rsquo;est un pays asiatique.</i>
        </p>
        <p>
          <i lang="fr">Il y a</i> &mdash; <b>says what is there</b>:{" "}
          <i lang="fr">Ici, il y a des Japonais.</i>
        </p>
        <p>
          So <i lang="fr">c&rsquo;est</i> cannot open: it has nothing to be about until
          something has been brought in. That is also why the model runs in this order
          and not another.
        </p>
      </div>
    ),
    // NO PITFALL TABLE — Dan's 2 Sep ruling, and it struck through correct
    // French. See the commit; the same fault was in all six ateliers.
    //
    // NO MINI-CHECK EITHER. Dan, 2 Sep: "i disagree with tis two questions. I am
    // happy with just that one question about why not c'est throughout." That
    // question is the `question` slot, and the answer above settles it, so a
    // check asking it again in other words is the litmus test's own target.
    flow: [
      { depth: 0, text: "First mention of the thing? — Voici." },
      { depth: 0, text: "Saying something about it? — C'est." },
      { depth: 0, text: "Saying what is there? — Il y a." },
    ],
    inShort: "Voici brings it in · c'est says something about it · il y a says what is there",
    remember: (
      <>
        <b>Bring it in, then say something about it.</b>{" "}
        <i lang="fr">C&rsquo;est</i>{" "}
        cannot come first &mdash; it needs something to talk about.
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
