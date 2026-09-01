/**
 * Native "Envies et besoins" lesson — SIO-039, written 2026-09-01.
 *
 * WHY THIS FILE EXISTS. `envies-besoins` had a deck and no lesson file, so a
 * concept had physically nowhere to live and the 💡 Idea tab read "Idea has not
 * been written for this lesson yet" (docs/HANDOVER_LESSON_FILES.md; fluoduo-main
 * split the nine-file handover on 1 Sep and gave this lane the deck-backed
 * stops). `concept` is deliberately absent — the concepts lane writes the
 * argument on top of this file. This one supplies the Mémo, the dice and the
 * bonus bank.
 *
 * WHAT THE DECK PROVES. Ten cards, five frames, two of each:
 *
 *     Je voudrais …      un café · visiter le Louvre
 *     J'aimerais …       voyager · une chambre pour deux personnes
 *     Je veux …          visiter Paris · partir en vacances
 *     J'ai besoin d' …   un hôtel · un plan
 *     J'ai envie d' …    un chocolat chaud · de dormir
 *
 * Two things every card demonstrates and no card states.
 *
 * ONE — THE SHAPE. The three verb frames take what they want BARE: « Je
 * voudrais un café », « Je veux partir ». The two `avoir` frames cannot; they
 * are built on a noun (« un besoin », « une envie ») and a noun needs **de** to
 * hang anything off it: « J'ai besoin **d'**un plan », « J'ai envie **de**
 * dormir ». Ten cards, and the split runs 6–4 exactly along that line.
 *
 * TWO — THE REGISTER, and the deck says it out loud in its own English. Two
 * cards are glossed "(polite request)" and two "(wish)"; « Je veux » is glossed
 * plainly, because it is plain — it is the one a learner should not use on a
 * stranger. The scale is already in the data; what is missing is anyone saying
 * so, and a word list cannot.
 *
 * WHAT THIS FILE REFUSES. « Je souhaiterais », « il me faut », the conditional
 * as a tense — none of it is in the deck, so teaching by it would mean inventing
 * French a learner reads as a model, which the 31 Aug rule forbids and which
 * `colors.tsx` set the standard for by declining adjective agreement outright.
 * The elision is taught only because the deck contains BOTH forms — « d'un
 * hôtel » and « de dormir » — so it can be shown rather than asserted.
 *
 * EVERY FRENCH STRING IS THE DECK'S OWN `fr`, split into frame · link · rest and
 * reassembled. The tables and the card generator live in `envies-besoins.gen.ts`
 * — JSX-free on purpose, because `node --experimental-strip-types` cannot load a
 * `.tsx`, so a generator kept in here could only ever be regex-read by a check.
 * verify76 EXECUTES it and rebuilds all ten against envies-besoins.json. The
 * only composed French is the MCQ distractor, which is the shape error the
 * lesson is about — a distractor is meant to be wrong and is never a model.
 */
import type { NativeLesson } from "./types";
import { CARDS, ENVIES_AXES, FRAMES, enviesQuestion, line } from "./envies-besoins.gen";

export const enviesBesoinsLesson: NativeLesson = {
  slug: "envies-besoins",

  // TIER 3 · SIO-039, drafted by the concepts lane on the Mémo below.
  //
  // THE MÉMO STATES THE FACT — "three are verbs and take it bare; two are built
  // on avoir + a noun, so they need de." What it cannot say is WHY a noun should
  // need `de` at all, and without the why the split is a fifth thing to
  // memorise. With it, the learner stops memorising which frames take `de` and
  // starts reading the frame.
  //
  // AND IT IS NOT A NEW RULE. « un kilo de tomates » (SIO-044) is the same
  // mechanism: a noun reaching forward. SIO-044's own generator opens on
  // « Je voudrais un kilo de tomates », which is this stop's frame carrying that
  // stop's quantity — so the link is in the content already, not invented for
  // the concept.
  //
  // NO NEW FRENCH. Every line is a deck card or an existing concept's example.
  // « un besoin » and « une envie » are NOT printed: they appear nowhere a
  // learner reads, only in this file's own header, so the noun-hood is shown by
  // position (« j'ai » + what you have, the shape of « j'ai vingt-cinq ans »)
  // rather than asserted with a form Dan has not seen.
  concept: {
    subtitle: "Why two of the five need « de » and three do not",
    contrast: (
      <>
        English runs all five the same way &mdash; <i>I would like a coffee</i>,{" "}
        <i>I need a map</i>, <i>I feel like sleeping</i>: the frame, then the thing.
        French splits them in two, and the split has nothing to do with how polite
        you are being.
      </>
    ),
    question: (
      <>
        <i lang="fr">Je veux partir en vacances</i> but{" "}
        <i lang="fr">J&rsquo;ai envie <b>de</b> dormir</i>. Both say what you want, both
        are followed by a verb. Why does only one need <i lang="fr">de</i>?
      </>
    ),
    answer: (
      <>
        Because only one of them has a <b>noun</b> in it. <i lang="fr">Je veux</i> is a
        verb, and a verb takes its object directly.{" "}
        <i lang="fr">J&rsquo;ai besoin</i> and <i lang="fr">j&rsquo;ai envie</i> are{" "}
        <i lang="fr">avoir</i> + something you have &mdash; the shape of{" "}
        <i lang="fr">j&rsquo;ai vingt-cinq ans</i>{" "}
        &mdash; so that slot is already
        taken, and the thing you actually want has to hang off it. French hangs a
        thing off a noun with <i lang="fr">de</i>. It is the same{" "}
        <i lang="fr">de</i> as <i lang="fr">un kilo de tomates</i>.
      </>
    ),
    pitfallHeads: ["running all five alike", "reading the frame first"],
    pitfall: [
      {
        label: <>a plain verb</>,
        wrong: <i lang="fr">Je veux de partir en vacances</i>,
        right: (
          <>
            <i lang="fr">Je veux partir en vacances</i>{" "}
            &mdash; a verb needs nothing to reach its object
          </>
        ),
      },
      {
        label: <><i lang="fr">j&rsquo;ai</i> + a noun</>,
        wrong: <i lang="fr">J&rsquo;ai besoin un plan</i>,
        right: (
          <>
            <i lang="fr">J&rsquo;ai besoin d&rsquo;un plan</i>{" "}
            &mdash; the noun cannot reach without it
          </>
        ),
      },
      {
        label: <>before a vowel</>,
        wrong: <i lang="fr">J&rsquo;ai envie de un chocolat chaud</i>,
        right: (
          <>
            <i lang="fr">J&rsquo;ai envie d&rsquo;un chocolat chaud</i>{" "}
            &mdash; but <i lang="fr">de dormir</i> keeps its <b>e</b>
          </>
        ),
      },
      {
        label: <>the wish frames</>,
        wrong: <i lang="fr">J&rsquo;aimerais de voyager</i>,
        right: (
          <>
            <i lang="fr">J&rsquo;aimerais voyager</i>{" "}
            &mdash; still a verb, however polite it sounds
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Look at the frame, not at what you want." },
      { depth: 1, text: "A verb on its own — voudrais, aimerais, veux? Take it bare." },
      { depth: 1, text: "j'ai + a thing you have — besoin, envie? Then de." },
      { depth: 0, text: "And de loses its e before a vowel: d'un plan, but de dormir." },
    ],
    check: [
      {
        q: (
          <>
            <i lang="fr">J&rsquo;ai besoin ___ un hôtel.</i> What goes in the gap?
          </>
        ),
        a: (
          <>
            <i lang="fr">d&rsquo;</i>{" "}
        &mdash; the frame carries a noun, so it needs{" "}
            <i lang="fr">de</i>, and <i lang="fr">un</i> begins with a vowel.
          </>
        ),
      },
      {
        q: (
          <>
            So why no <i lang="fr">de</i> in{" "}
            <i lang="fr">Je voudrais visiter le Louvre</i>?
          </>
        ),
        a: (
          <>
            Because <i lang="fr">voudrais</i> is a verb and reaches its object on its
            own. Politeness changed the verb, not the shape.
          </>
        ),
      },
    ],
    remember: (
      <>
        <b>Read the frame, not the wish.</b> A verb takes it bare;{" "}
        <i lang="fr">j&rsquo;ai</i> + a noun reaches forward with{" "}
        <i lang="fr">de</i>.
      </>
    ),
  },

  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Envies et besoins — <em>je voudrais, j&rsquo;ai besoin de</em>
      </h2>
      {/* The rule, and nothing that the list below already shows. The first
          draft added "Five ways to say what you want" in front of a list of
          five ways to say what you want — the kind of sentence the litmus test
          deletes, and 79px of the reason this Mémo ran past one screen. */}
      <p className="mb-2 text-[15px] text-[color:var(--cahier-ink)]">
        Three are verbs and take it <b>bare</b>; two are built on{" "}
        <span lang="fr">avoir</span> + a noun, so they need <b lang="fr">de</b>.
      </p>

      <ul className="text-[15px] text-[color:var(--cahier-ink)]">
        {FRAMES.map((f) => (
          <li key={f.fr} className="mb-0.5">
            <span lang="fr" className="font-bold">
              {f.fr}
              {f.de ? " de…" : "…"}
            </span>
            <span className="text-[color:var(--fluo-ink-soft)]">
              {" "}
              — {f.en} · {f.note}
            </span>
          </li>
        ))}
      </ul>

      {/* The evidence, not a restatement: the two envie cards differ only in
          what follows, and that is what makes the elision visible rather than
          asserted. */}
      {/* The pair, and only the pair. The second half of the first draft said
          "and never after the plain verbs", which the paragraph above has
          already said — so the example stays and the restatement goes. */}
      <p className="mt-2 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <span lang="fr">de</span> loses its <b>e</b> before a vowel:{" "}
        <span lang="fr"><b>J&rsquo;ai envie de dormir</b></span> but{" "}
        <span lang="fr"><b>J&rsquo;ai envie d&rsquo;un chocolat chaud</b></span>.
      </p>
    </div>
  ),

  dice: {
    instruction: "Say it in French — mind whether the frame needs « de ».",
    // The generator lives in envies-besoins.gen.ts, JSX-free, so verify76 can
    // EXECUTE it rather than re-implement its elision rule in Python — which
    // is precisely the mistake the first draft of that check made.
    newQuestion: enviesQuestion,
    // One dropdown: practise a single frame rather than one card in five.
    axes: ENVIES_AXES,
  },

  // DERIVED, not retyped: every line is the deck's own `fr` rebuilt from the
  // table above, so a bonus card and a dice card can never disagree about the
  // same sentence.
  bonus: CARDS.map((c) => ({ en: c.en, fr: line(c) })),
};
