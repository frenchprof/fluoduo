/**
 * Native "Repas & aliments" lesson (Unité 4) — authored 2026-08-23 to the
 * LESSON_PLAN U4 #1 row and the Atelier U4 Situation 1 « Parler de ses
 * habitudes alimentaires » (model sentence: « Le midi, je mange de la viande
 * et je bois de l'eau. »): Mémo + 🎲 dice trainer + EN→FR bonus. All foods,
 * drinks and meals are the aliments deck's own items. The article-only drill
 * lives in the partitifs lesson (SIO-042); here the frame is the meal +
 * manger vs boire.
 */
import type { NativeLesson } from "./types";

const MEALS = [
  { fr: "petit-déjeuner", en: "breakfast" },
  { fr: "déjeuner", en: "lunch" },
  { fr: "goûter", en: "afternoon snack" },
  { fr: "dîner", en: "dinner" },
] as const;

const EAT = [
  { np: "du pain", en: "bread" },
  { np: "du fromage", en: "cheese" },
  { np: "du riz", en: "rice" },
  { np: "du poulet", en: "chicken" },
  { np: "du poisson", en: "fish" },
  { np: "de la viande", en: "meat" },
  { np: "de la salade", en: "salad" },
  { np: "de la soupe", en: "soup" },
  { np: "des pâtes", en: "pasta" },
  { np: "des frites", en: "fries" },
  { np: "un croissant", en: "a croissant" },
  { np: "une pomme", en: "an apple" },
] as const;
const DRINK = [
  { np: "du café", en: "coffee" },
  { np: "du lait", en: "milk" },
  { np: "de l'eau", en: "water" },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
/** The classic article error for the noun phrase (wrong gender, or the
 *  definite where the partitive belongs: « je bois l'eau »). */
const wrongArt = (np: string) =>
  np.startsWith("du ") ? `de la ${np.slice(3)}`
  : np.startsWith("de la ") ? `du ${np.slice(6)}`
  : np.startsWith("de l'") ? `l'${np.slice(5)}`
  : np.startsWith("des ") ? `du ${np.slice(4)}`
  : np.startsWith("une ") ? `un ${np.slice(4)}`
  : `une ${np.slice(3)}`;

export const alimentsLesson: NativeLesson = {
  slug: "aliments",
  // TIER 2 CONCEPT — SIO-041, REPLACED 1 Sep on Dan's instruction ("put it
  // where we learn about food items"). What stood here argued *why the article
  // often hides the gender* — « de l'eau » and « des frites » say nothing, so
  // nine of these words arrive gender-unmarked. It was a good caution and it is
  // recoverable from git (see the commit that made this change) if Dan wants it
  // back. Two things decided against it. Its practical advice — learn the
  // gender with the word — is ALREADY delivered by the lexique, which marks
  // every one of those nine; on Dan's litmus test, a claim whose removal costs
  // the learner nothing is redundant. And it had no generative reach: it warned
  // about a list rather than letting a learner build anything.
  //
  // It could not simply move, either. A concept has to sit on its own lesson's
  // Mémo, and the only other food lesson without one is `manger-boire`, whose
  // Mémo is a conjugation table for manger and boire — noun gender would be a
  // stranger on it.
  //
  // NO INVENTED FRENCH, AND EVERY PHRASE IS TRACEABLE.
  //   « le gâteau au chocolat »  — devine-aliments.json
  //   « du jus d'orange »        — this deck, plus finale.ts and textgen/unit4
  //   « des pommes de terre »    — devine-aliments.json
  //   « une tarte aux pommes »   — DAN'S OWN, from the roster line that
  //                                commissioned this concept. Flagged because it
  //                                is the one phrase not already in the content.
  concept: {
    subtitle: "Why French needs a joint where English just stacks nouns",
    contrast: (
      <>
        English builds a food name by piling the words up &mdash; <i>chocolate cake</i>,{" "}
        <i>orange juice</i>, <i>apple tart</i>{" "}
        &mdash; and the first word describes the
        second. French cannot stack: the main thing comes first and a joint carries the
        rest. There are two joints, and choosing the wrong one changes what the dish is.
      </>
    ),
    question: (
      <>
        <i lang="fr">le gâteau au chocolat</i> but <i lang="fr">le jus d&rsquo;orange</i>.
        Both name a food by what is in it. So why not the same little word twice?
      </>
    ),
    answer: (
      <>
        Because they say different things. <i lang="fr">à</i> puts the second thing{" "}
        <b>in</b> the first: the cake has chocolate in it, and could have been made
        without. <i lang="fr">de</i> says the first thing is <b>made of</b> the second
        and of nothing else: the juice <em>is</em> the orange, pressed. And the joint
        brings its own article rule &mdash; <i lang="fr">à</i> keeps the article and fuses
        with it (<i lang="fr">à + le → au</i>), while <i lang="fr">de</i> drops it
        altogether: <i lang="fr">jus d&rsquo;orange</i>, never{" "}
        <i lang="fr">jus de l&rsquo;orange</i>.
      </>
    ),
    pitfallHeads: ["what stacking gives", "what French builds"],
    pitfall: [
      {
        label: <>the order</>,
        wrong: <i lang="fr">chocolat gâteau</i>,
        right: (
          <>
            <i lang="fr">le gâteau au chocolat</i>{" "}
            &mdash; the thing first, what is in it after
          </>
        ),
      },
      {
        label: <>an article after <i lang="fr">de</i></>,
        wrong: <i lang="fr">le jus de l&rsquo;orange</i>,
        right: (
          <>
            <i lang="fr">le jus d&rsquo;orange</i>{" "}
            &mdash; a kind, not a quantity, so no article
          </>
        ),
      },
      {
        label: <>the wrong joint</>,
        wrong: <i lang="fr">le gâteau de chocolat</i>,
        right: (
          <>
            <i lang="fr">le gâteau au chocolat</i>{" "}
            &mdash; chocolate is in it, not what it is made of
          </>
        ),
      },
      {
        label: <>plural after <i lang="fr">à</i></>,
        wrong: <i lang="fr">une tarte à les pommes</i>,
        right: (
          <>
            <i lang="fr">une tarte aux pommes</i>{" "}
            &mdash; <i lang="fr">à + les</i> always fuses
          </>
        ),
      },
    ],
    flow: [
      { depth: 0, text: "Name the main thing first — le gâteau, le jus, une tarte." },
      { depth: 0, text: "Is the second thing IN it, one ingredient among others?" },
      { depth: 1, text: "à + the article, fused — au chocolat, aux pommes." },
      { depth: 0, text: "Is the first thing MADE OF the second, and nothing else?" },
      { depth: 1, text: "de + the bare noun, no article — jus d'orange." },
    ],
    check: [
      {
        q: (
          <>
            A tart with apples in it: <i lang="fr">une tarte ___ pommes</i>. Which joint?
          </>
        ),
        a: (
          <>
            <i lang="fr">aux</i>{" "}
        &mdash; the apples are in it, so <i lang="fr">à</i>, and{" "}
            <i lang="fr">à + les</i> fuses to <i lang="fr">aux</i>:{" "}
            <i lang="fr">une tarte aux pommes</i>.
          </>
        ),
      },
      {
        q: (
          <>
            Why <i lang="fr">jus d&rsquo;orange</i> rather than{" "}
            <i lang="fr">jus de l&rsquo;orange</i>?
          </>
        ),
        a: (
          <>
            Because it names the <b>kind</b> of juice, not some quantity of one
            particular orange. An article would make it a quantity, and{" "}
            <i lang="fr">de</i> in a compound never carries one.
          </>
        ),
      },
    ],
    inShort: (
      <>
        <i lang="fr">à</i> puts it <b>in</b> · <i lang="fr">de</i> says what it is{" "}
        <b>made of</b>
      </>
    ),
    remember: (
      <>
        <b>In it &rarr; <i lang="fr">au / à la / aux</i>. Made of it &rarr;{" "}
        <i lang="fr">de</i>, bare.</b> The main thing is always named first, and the
        article tells you which joint you took.
      </>
    ),
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les repas — <em>manger et boire</em>
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>4 repas — <i lang="fr">le petit-déjeuner, le déjeuner, le goûter, le dîner</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">manger</b> + food — <i lang="fr">Le midi, je mange <b className="text-[color:var(--gram-fem)]">de la</b> viande, <b className="text-[color:var(--gram-masc)]">du</b> pain, <b>des</b> pâtes.</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">boire</b> + drink — <i lang="fr">Je bois <b className="text-[color:var(--gram-masc)]">du</b> café, <b>de l&rsquo;</b>eau.</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b lang="fr">à + le → au</b>: <span lang="fr"><b>Au</b> petit-déjeuner, je bois du café.</span> — never{" "}
        <i lang="fr">À le petit-déjeuner</i>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Say what you eat or drink at that meal.",
    newQuestion() {
      const m = pick(MEALS);
      const drinking = Math.random() < 0.25;
      const f = drinking ? pick(DRINK) : pick(EAT);
      const verb = drinking ? "bois" : "mange";
      const otherVerb = drinking ? "mange" : "bois";
      const correct = `Au ${m.fr}, je ${verb} ${f.np}.`;
      return {
        meta: `Au ${m.fr}… (${m.en})`,
        big: f.en,
        correct,
        easyOptions: [
          correct,
          `Au ${m.fr}, je ${otherVerb} ${f.np}.`,
          `Au ${m.fr}, je ${verb} ${wrongArt(f.np)}.`,
          `À le ${m.fr}, je ${verb} ${f.np}.`,
        ],
        med: { before: `Au ${m.fr}, je`, choices: ["mange", "bois"], correct: verb, after: `${f.np}.` },
      };
    },
  },
  bonus: [
    { en: "For breakfast, I eat bread.", fr: "Au petit-déjeuner, je mange du pain." },
    { en: "For breakfast, I drink coffee.", fr: "Au petit-déjeuner, je bois du café." },
    { en: "For lunch, I eat chicken.", fr: "Au déjeuner, je mange du poulet." },
    { en: "For the afternoon snack, I eat an apple.", fr: "Au goûter, je mange une pomme." },
    { en: "For dinner, I eat soup.", fr: "Au dîner, je mange de la soupe." },
    { en: "I drink water.", fr: "Je bois de l'eau." },
    { en: "I eat pasta.", fr: "Je mange des pâtes." },
    { en: "For dinner, we eat fish.", fr: "Au dîner, nous mangeons du poisson." },
    { en: "I drink milk.", fr: "Je bois du lait." },
    { en: "I don't eat meat.", fr: "Je ne mange pas de viande." },
  ],
};
