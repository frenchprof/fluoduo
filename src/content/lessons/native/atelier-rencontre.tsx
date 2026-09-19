/**
 * Native « Atelier — Première rencontre » lesson — SIO-010, written 2026-09-01.
 *
 * THE PROTOTYPE FOR THE ATELIER SHAPE. Colour review's handover asks for six of
 * these and names this one the one to prototype on. `concept` is deliberately
 * absent — that is the concepts lane's, and verify75 asserts the field stays
 * empty so a stub of mine cannot read to a learner as the real argument.
 *
 * THE MÉMO IS THE MODEL, AND IT HAD TO STAY THAT WAY — THE TRAP IN THIS JOB.
 * `LessonPager` resolves the panel as
 *
 *     memo={lesson?.memo ?? memoForDeck(collectionId)}
 *
 * so the mere act of registering a lesson for an atelier REPLACES whatever
 * `memos.tsx` generated for that deck. Every atelier deck already has a Mémo
 * there — « Le modèle », the whole dialogue with « Tout écouter » — and Dan
 * asked for exactly that on 31 Aug: *"Atelier's Memo is to open on the range of
 * sentences and vocabulary one is expected to use or understand."* An atelier
 * lesson that authored its own Mémo would delete the model from the one panel
 * an atelier OPENS on, and verify71 would not notice: it reads memos.tsx, which
 * would still be perfectly correct. So this file passes the generated Mémo
 * through unchanged, and verify75 asserts it does.
 *
 * WHAT THE LESSON ADDS IS THE REGISTER. The model is `tu` throughout; the
 * stop's competence asks for all three audiences — "tu, vous, or the plural
 * vous of a group (≥6/7 steps in each of the 3)". The deck deals the model's
 * nine turns and cannot ask for the other two registers, because it does not
 * contain them. `atelier-rencontre.gen.ts` drills exactly that, out of the
 * three audiences already authored in SIO010_SITUATIONS.
 *
 * WHY THE THREE-AUDIENCE GRID IS NOT PRINTED HERE. It would be a fine Mémo and
 * it is the wrong place for one: SIO010_SITUATIONS is this stop's own Unit-0
 * pre-test, and a grid of its correct answers on the panel the atelier opens on
 * is the same fault the popup was corrected for on 31 Aug — *"the dialogue is
 * that stop's PRE-TEST ANSWER KEY"* (verify66, verify71). The contrast belongs
 * in `concept`, behind the Idea tab, which a learner opens on purpose. It is
 * the argument, and the argument is colour review's to write.
 */
import type { NativeLesson } from "./types";
import { memoForDeck } from "@/content/memos";
import { ATELIER_DIALOGUES } from "@/content/ateliers";
import { RENCONTRE_AXES, rencontreQuestion } from "./atelier-rencontre.gen";

/** The deck id `atelierDecks.ts` builds for this stop, and the key its Mémo is
 *  registered under. Both derive from the SIO id the same way. */
const SIO = "SIO-010";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierRencontreLesson: NativeLesson = {
  slug: "atelier-rencontre",
  formLayout: "dialogue",

  // Not a copy of the model — the model itself, the same element memos.tsx
  // builds from ATELIER_DIALOGUES. A line edited in the dialogue reaches this
  // panel with nothing else touched.
  memo: memoForDeck(DECK),

  // TIER 3 · SIO-010, the atelier. Drafted by the concepts lane, 1 Sep, on the
  // shape Dan settled: the MOMENT, not the form. Stop 2 already owns tu/vous as
  // a paradigm; an atelier that re-taught the paradigm would be Tier 1 wearing a
  // dialogue. What the atelier owns is the thing the model dialogue cannot show,
  // because it only ever runs one register: that the register is chosen ONCE and
  // then governs every turn.
  //
  // NO INVENTED FRENCH, AND NONE OF IT MINE. Every line below is a correct
  // option from SIO010_SITUATIONS (`src/content/sios/unit0-questions.ts`) or a
  // turn of the model dialogue — Dan's own French, both.
  //
  // THE EXPLICIT {" "} BEFORE EVERY &mdash; IS NOT STYLE. As first written, the
  // pitfall cell « Bonjour, madame. </i> &mdash; the title is the register »
  // rendered as "madame.— the title": the space between the closing italic and
  // the dash was gone. Two cells on the same table, written the same way, kept
  // theirs. tsc was happy, the source read correctly, and only the browser
  // showed it — verify72's header says exactly this about the same-line case.
  // So the space is written as {" "} here and the whole tab was re-read in the
  // app afterwards. The other 43 concepts were swept the same way and are clean.
  //
  // THIS IS THE PRE-TEST'S ANSWER KEY, AND THAT IS THE POINT — but only here.
  // The 31 Aug correction (verify66, verify71) was that the key must not sit on
  // the panel an atelier OPENS on, where a learner meets it before guessing.
  // Behind the Idea tab, opened on purpose after the attempt, is where a
  // pre-test's answers are supposed to end up. Peers' note in this file's header
  // reaches the same conclusion from the other side, and neither check is
  // touched by this.
  concept: {
    subtitle: "Why you choose the register once, not word by word",
    contrast: (
      <>
        English changes almost nothing between meeting a classmate and meeting a
        client &mdash; <i>Hi</i> becomes <i>Good morning</i> and the rest of the
        exchange runs the same. In French the choice reaches every turn of it.
      </>
    ),
    question: (
      <>
        The model above runs on <i lang="fr">tu</i>{" "}
        from start to finish. Say the same
        seven moments to a client instead &mdash; how many of the lines have to change?
      </>
    ),
    answer: (
      <>
        <b>Six of the seven.</b> <i lang="fr">Salut !</i> becomes{" "}
        <i lang="fr">Bonjour, madame.</i>, <i lang="fr">Comment tu t&rsquo;appelles ?</i>{" "}
        becomes <i lang="fr">Comment vous vous appelez ?</i>,{" "}
        <i lang="fr">Enchantée !</i> becomes <i lang="fr">Enchantée, madame.</i>, and{" "}
        <i lang="fr">Au revoir !</i> becomes <i lang="fr">Au revoir, madame.</i>{" "}
        You do not translate your way across turn by turn &mdash; you pick the script at the
        door and run it. <b>One line does not move:</b>{" "}
        <i lang="fr">Comment ça s&rsquo;écrit ?</i> is the same to a student, a client
        and a group, because it asks about the letters rather than the person.
      </>
    ),
    // NO PITFALL TABLE — Dan's 2 Sep ruling on atelier-pays, applied to the fault
    // wherever it repeats. Its wrong column struck through « Comment vous vous appelez ? », « Bonjour ! » and « Salut ! », which are
    // CORRECT FRENCH: wrong for the moment, not wrong in the language.
    //
    // THE LINE IS CLEAN AND WORTH KNOWING. A wrong column earns its place where
    // the argument is about FORM — « en le bus », « une café », « bon nuit » are
    // impossible, and striking them teaches something true. An atelier never
    // argues form: it argues which correct option the moment asks for. So every
    // atelier's wrong column was striking real French, and no Tier 1 or Tier 2
    // concept has the fault. The right column's content stays in `flow`.
    flow: [
      { depth: 0, text: "At the door, one question: who am I talking to?" },
      { depth: 1, text: "One student — tu. Salut ! … Au revoir !" },
      { depth: 1, text: "One client — vous, plus madame / monsieur on every turn." },
      { depth: 1, text: "More than one — vous. Bonjour à tous ! … Au revoir tout le monde !" },
      { depth: 0, text: "Then run that script to the end. Only « Comment ça s'écrit ? » is shared." },
    ],
    check: [
      {
        q: <>Which line is identical to a student, a client and a group?</>,
        a: (
          <>
            <i lang="fr">Comment ça s&rsquo;écrit ?</i>{" "}
            &mdash; it asks about the letters,
            not about the person, so there is no register in it.
          </>
        ),
      },
      {
        q: (
          <>
            You opened with <i lang="fr">Comment tu t&rsquo;appelles ?</i> How do you take
            your leave?
          </>
        ),
        a: (
          <>
            <i lang="fr">Au revoir !</i>{" "}
            &mdash; plain, no <i lang="fr">madame</i>. The
            script was chosen at the greeting and the goodbye still belongs to it.
          </>
        ),
      },
    ],
    inShort: "Pick the register at the door, then let every turn follow it.",
    remember: (
      <>
        <b>The register is chosen once and governs the whole exchange.</b> If you find
        yourself deciding again mid-conversation, you have already changed script.
      </>
    ),
  },

  dice: {
    instruction: "Same seven steps, three audiences. Say the right line for this one.",
    axes: RENCONTRE_AXES,
    newQuestion: rencontreQuestion,
  },

  // The model's own turns, EN→FR, under the deck's filter: a line already dealt
  // is a free point, and a line whose French and English are identical is a
  // proper name rather than language to learn. Both rules are atelierDecks.ts's,
  // applied here so the bonus bank and the deck cannot disagree about what
  // counts as a card.
  bonus: ATELIER_DIALOGUES[SIO].filter(
    (l, i, all) => l.fr !== l.en && all.findIndex((o) => o.fr === l.fr) === i,
  ).map((l) => ({ en: l.en, fr: l.fr })),
};
