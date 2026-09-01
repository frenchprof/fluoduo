/**
 * Native « Comment tu y vas ? » lesson — SIO-038, written 2026-09-01.
 *
 * THE LAST TIER 1 STOP WITHOUT A FILE. Colour review's handover, 31 Aug:
 * *"SIO-038 matters out of proportion to its size — it is the only Tier 1 stop
 * without a file, so it is the single thing standing between Tier 1 and
 * complete."* A concept had physically nowhere to live; this file is that place.
 * `concept` is deliberately absent — colour review writes the argument on top of
 * this Mémo, and a placeholder of mine would only have to be deleted.
 *
 * WHAT THE STOP ACTUALLY TEACHES. Not twelve nouns — three frames. The deck's
 * own letris columns already name two of them (*"en — a vehicle you sit
 * inside"*, *"à — on foot or astride"*) and its last three items add the third,
 * `prendre` + the definite article. A learner who knows all twelve nouns and
 * none of the three frames cannot say one of the deck's sentences.
 *
 * NO INVENTED FRENCH. Every French string here is either an item's `fr` or an
 * item's `example`, and « Tu y vas comment ? » is SIO-038's own `fr` field. The
 * generator's table decomposes the twelve examples and reassembles them; the
 * check holds that reassembly against transport.json rather than trusting it.
 */
import type { NativeLesson } from "./types";
import { MODES, TRANSPORT_AXES, exampleOf, transportQuestion, type Frame } from "./transport.gen";

/** The three frames, in the order the deck lists them, with the deck's own
 *  gloss for the two it glosses itself. */
const FRAMES: { frame: Frame; head: string; gloss: string; tone: string }[] = [
  // The first two glosses are the deck's own letris `choiceLabel`s, verbatim —
  // the only place in the repo where the en/à split is stated, and a game's
  // configuration reaches no card. The third frame is glossed nowhere, so this
  // is the shortest true thing that can be said about it.
  { frame: "en", head: "en", gloss: "a vehicle you sit inside", tone: "var(--gram-masc)" },
  { frame: "à", head: "à", gloss: "on foot or astride", tone: "var(--gram-fem)" },
  { frame: "prendre", head: "prendre", gloss: "name the vehicle", tone: "var(--cahier-ink)" },
];

/**
 * One frame, as a run rather than a list.
 *
 * NO ENGLISH GLOSS, AND THAT IS THE LITMUS TEST, NOT A CUT FOR SPACE. The
 * deck's own word list — all twelve with their English — is a section of THIS
 * SAME PANEL since Words moved under Forms (Dan, 31 Aug), so a second copy here
 * is text whose removal costs a learner nothing. It cost a great deal on the
 * screen: twelve glossed rows ran to 1.53 screens on a 390px phone with the
 * third frame below the fold, and two columns only turned every row into two
 * lines. Three runs fit, and a run shows the pattern a list only lists.
 *
 * The item's own `fr` is printed whole and the gap bolded inside it, so the
 * Mémo cannot drift from the deck the way a re-typed phrase can.
 */
const frameBlock = (f: (typeof FRAMES)[number]) => (
  <div key={f.frame}>
    <p className="fluo-label mb-0.5" style={{ color: f.tone }}>
      <span lang="fr">{f.head}</span> — {f.gloss}
    </p>
    <p className="text-[15px] leading-relaxed text-[color:var(--cahier-ink)]" lang="fr">
      {MODES.filter((m) => m.frame === f.frame).map((m, i) => {
        const at = m.fr.indexOf(m.gap);
        return (
          <span key={m.fr}>
            {i > 0 ? <span className="text-[color:var(--fluo-ink-soft)]"> · </span> : null}
            {m.emoji ? <span aria-hidden="true">{m.emoji} </span> : null}
            {m.fr.slice(0, at)}
            <b style={{ color: f.tone }}>{m.gap}</b>
            {m.fr.slice(at + m.gap.length)}
          </span>
        );
      })}
    </p>
  </div>
);

export const transportLesson: NativeLesson = {
  slug: "transport",

  // TIER 1 · SIO-038, drafted by the concepts lane on the Mémo above.
  //
  // THE DECK MAKES THE ARGUMENT, NOT ME. Three vehicles are listed TWICE —
  // métro, voiture, avion — once under `en` and once under `prendre`. A frame
  // that were a property of the vehicle could not do that, so the repetition
  // is a proof, and it is transport.json's, not mine. Every French string
  // below is an item's `fr` or its `example`; nothing is written for the
  // concept.
  //
  // Why this belongs to Tier 1 rather than reading as vocabulary: it is the
  // article rule again, seen from the other side. Elsewhere in the tier the
  // article survives (`Je n'aime pas LE sport`) or collapses into the
  // preposition (`à + le → au`). Here its PRESENCE is the whole signal — no
  // article and you named a manner, an article and you named a thing.
  concept: {
    subtitle: "Why the same métro takes two different frames",
    contrast: (
      <>
        English has <i>by metro</i> and <i>take the metro</i> too, and choosing between
        them is a matter of taste. In French the choice is structural:{" "}
        <i lang="fr">en métro</i> has no article, <i lang="fr">prendre le métro</i> has
        one, and that article is the only thing telling the two apart.
      </>
    ),
    question: (
      <>
        This deck lists <i lang="fr">en voiture</i> <b>and</b>{" "}
        <i lang="fr">prendre la voiture</i>{" "}
        &mdash; the same car, twice. If the frame
        belonged to the vehicle, only one of them could be right. So what decides?
      </>
    ),
    answer: (
      <>
        Not the vehicle, but <b>what you are saying about the journey</b>.{" "}
        <i lang="fr">en</i> answers <i>how</i> you travelled, so the vehicle is a manner
        and takes <b>no article</b>: <i lang="fr">On y va en voiture.</i>{" "}
        <i lang="fr">prendre</i> answers <i>what</i> you took, so the vehicle is an
        object and takes <b>its own article</b>:{" "}
        <i lang="fr">Tu prends la voiture ?</i> Same car, two sentences, and the
        article is the tell.
      </>
    ),
    pitfallHeads: ["what English predicts", "what French does"],
    pitfall: [
      {
        label: <>the article after <i lang="fr">en</i></>,
        wrong: <i lang="fr">en le bus</i>,
        right: <><i lang="fr">en bus</i> &mdash; a manner never carries one</>,
      },
      {
        label: <>the article after <i lang="fr">prendre</i></>,
        wrong: <i lang="fr">prendre métro</i>,
        right: <><i lang="fr">prendre le métro</i> &mdash; an object always does</>,
      },
      {
        label: <>choosing <i lang="fr">à</i> for a car</>,
        wrong: <i lang="fr">à voiture</i>,
        right: <><i lang="fr">en voiture</i> &mdash; you sit inside it</>,
      },
      {
        label: <>choosing <i lang="fr">en</i> for your feet</>,
        wrong: <i lang="fr">en pied</i>,
        right: <><i lang="fr">à pied</i> &mdash; there is no vehicle to be inside</>,
      },
    ],
    flow: [
      { depth: 0, text: "Are you naming the vehicle as the thing you took?" },
      { depth: 1, text: "prendre + le / la / l' — Je prends le métro." },
      { depth: 0, text: "Otherwise you are saying how you travelled." },
      { depth: 1, text: "Inside it? en + no article — J'y vais en train." },
      { depth: 1, text: "On your feet, or astride it? à + no article — J'y vais à vélo." },
    ],
    check: [
      {
        q: <>« <i lang="fr">On y va ___ voiture.</i> » &mdash; <i lang="fr">en</i> or <i lang="fr">la</i>?</>,
        a: (
          <>
            <i lang="fr">en</i>. No article, so it answers <i>how</i> you went.
          </>
        ),
      },
      {
        q: <>« <i lang="fr">Tu prends ___ voiture ?</i> » &mdash; <i lang="fr">en</i> or <i lang="fr">la</i>?</>,
        a: (
          <>
            <i lang="fr">la</i>. The article is there, so it names <i>what</i> you took
            &mdash; the same car as above.
          </>
        ),
      },
    ],
    inShort: "No article, it's how you went. An article, it's what you took.",
    remember: (
      <>
        <b>No article &rarr; the manner. An article &rarr; the vehicle.</b> One line sorts
        all twelve &mdash; and sorts the thirteenth you meet outside this list.
      </>
    ),
  },

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Comment tu y vas ?
      </h2>

      <div className="space-y-2">{FRAMES.map(frameBlock)}</div>

      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b lang="fr">y</b> is the place you are going, already said once and not repeated:{" "}
        <span lang="fr">J&rsquo;<b>y</b> vais en train.</span> — <i>I go there by train.</i> It sits
        before the verb, never after it.
      </p>
    </div>
  ),

  dice: {
    instruction: "Say how you get there — mind the word in front of the mode.",
    axes: TRANSPORT_AXES,
    newQuestion: transportQuestion,
  },

  // The deck's own twelve examples, ten of them, glossed as the deck glosses
  // them. Nothing here is written for the bonus bank.
  bonus: MODES.filter((m) => m.mode !== "bateau" && m.mode !== "moto").map((m) => ({
    en: m.enFull,
    fr: exampleOf(m),
  })),
};
