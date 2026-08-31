/**
 * Native "Articles partitifs" lesson (Unité 4, L19) — Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 19-partitifs.html drchan import.
 */
import type { NativeLesson } from "./types";

const FOODS = [
  { fr: "pain", art: "du", en: "bread" }, { fr: "fromage", art: "du", en: "cheese" },
  { fr: "poulet", art: "du", en: "chicken" }, { fr: "café", art: "du", en: "coffee" },
  { fr: "lait", art: "du", en: "milk" }, { fr: "beurre", art: "du", en: "butter" },
  { fr: "sucre", art: "du", en: "sugar" }, { fr: "poisson", art: "du", en: "fish" },
  { fr: "riz", art: "du", en: "rice" }, { fr: "chocolat", art: "du", en: "chocolate" },
  { fr: "salade", art: "de la", en: "salad" }, { fr: "viande", art: "de la", en: "meat" },
  { fr: "confiture", art: "de la", en: "jam" }, { fr: "farine", art: "de la", en: "flour" },
  { fr: "soupe", art: "de la", en: "soup" }, { fr: "eau", art: "de l'", en: "water" },
  { fr: "ail", art: "de l'", en: "garlic" }, { fr: "huile", art: "de l'", en: "oil" },
  { fr: "œufs", art: "des", en: "eggs" }, { fr: "carottes", art: "des", en: "carrots" },
  { fr: "champignons", art: "des", en: "mushrooms" }, { fr: "oignons", art: "des", en: "onions" },
  { fr: "asperges", art: "des", en: "asparagus" }, { fr: "bananes", art: "des", en: "bananas" },
  { fr: "frites", art: "des", en: "fries" },
] as const;
const ARTICLES = ["du", "de la", "de l'", "des"];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const np = (art: string, fr: string) => art + (art === "de l'" ? "" : " ") + fr;

export const partitifsLesson: NativeLesson = {
  slug: "partitifs",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        L&rsquo;article partitif — <em>une portion qu&rsquo;on ne compte pas</em>
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--gram-masc)]">du</b> + masculin — <i lang="fr">du pain, du fromage, du café</i></li>
        <li><b className="text-lg text-[color:var(--gram-fem)]">de la</b> + féminin — <i lang="fr">de la salade, de la viande</i></li>
        <li><b className="text-lg text-[color:var(--gram-neutral)]">de l&rsquo;</b> + voyelle — <i lang="fr">de l&rsquo;eau, de l&rsquo;ail</i></li>
        <li><b className="text-lg text-[color:var(--gram-neutral)]">des</b> + pluriel — <i lang="fr">des œufs, des carottes</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>After a negation everything becomes de / d&rsquo;</b>:{" "}
        <span lang="fr">Je mange <u>du</u> pain → Je ne mange <b>pas de</b> pain. ·
        Je bois <u>de l&rsquo;</u>eau → Je ne bois <b>pas d&rsquo;</b>eau.</span>
      </p>
    </div>
  ),
  // TIER 1 · stop 42. The four forms look like four words; they are one thing
  // twice over — `de` + the definite article. That single reading explains the
  // whole table AND the negative, and it is nowhere in the Mémo.
  concept: {
    subtitle: "Four forms, one word plus an article",
    contrast: (
      <>
        English says <i>some</i>, or nothing at all &mdash; <i>I eat bread</i>. French makes you
        say how much of it you mean, and the word for that is always{" "}
        <i lang="fr">de</i>. What changes after it is only the article:{" "}
        <i lang="fr">de</i> + <i lang="fr">le</i> = <i lang="fr">du</i>,{" "}
        <i lang="fr">de</i> + <i lang="fr">les</i> = <i lang="fr">des</i>.
      </>
    ),
    question: (
      <>
        Why is it <i lang="fr">de la salade</i> and <i lang="fr">de l&rsquo;eau</i> in two
        words, but <i lang="fr">du pain</i> in one?
      </>
    ),
    answer: (
      <>
        Because only <i lang="fr">le</i> and <i lang="fr">les</i> fuse with{" "}
        <i lang="fr">de</i>. <i lang="fr">La</i> and <i lang="fr">l&rsquo;</i> never do, so they
        simply stand there: <i lang="fr">de la</i>, <i lang="fr">de l&rsquo;</i>. There are not
        four things to learn &mdash; there is <i lang="fr">de</i>, and an article that sometimes
        sticks to it.
      </>
    ),
    pitfallHeads: ["written out", "what French says"],
    pitfall: [
      { label: <><i lang="fr">de</i> + <i lang="fr">le</i> pain</>, wrong: <><i lang="fr">de le pain</i></>, right: <><i lang="fr">du pain</i></> },
      { label: <><i lang="fr">de</i> + <i lang="fr">les</i> œufs</>, wrong: <><i lang="fr">de les œufs</i></>, right: <><i lang="fr">des œufs</i></> },
      { label: <><i lang="fr">de</i> + <i lang="fr">la</i> viande</>, wrong: <>&mdash;</>, right: <><i lang="fr">de la viande</i>, no fusion</> },
    ],
    check: [
      { q: <>You drink some water. Which form, and why that one?</>,
        a: <><i lang="fr">de l&rsquo;eau</i> &mdash; <i lang="fr">l&rsquo;</i> does not fuse with <i lang="fr">de</i>.</> },
      { q: <>Now say you do not drink it.</>,
        a: <><i lang="fr">Je ne bois pas <b>d&rsquo;</b>eau.</i> The article half goes; <i lang="fr">de</i> is what was underneath.</> },
    ],
    remember: (
      <>
        It is always <i lang="fr">de</i>. <i lang="fr">Du</i> and <i lang="fr">des</i> are just{" "}
        <i lang="fr">de</i> with <i lang="fr">le</i> and <i lang="fr">les</i> stuck to it.
      </>
    ),
  },
  dice: {
    instruction: "Choose the right partitive article for the food.",
    newQuestion() {
      const f = pick(FOODS);
      return {
        meta: "Je prends … (I'll have)",
        big: f.fr,
        en: f.en,
        correct: `Je prends ${np(f.art, f.fr)}.`,
        easyOptions: ARTICLES.map((a) => `Je prends ${np(a, f.fr)}.`),
        med: { before: "Je prends", choices: ARTICLES, correct: f.art, after: `${f.fr}.` },
      };
    },
  },
  bonus: [
    { en: "I'll have some bread.", fr: "Je prends du pain." },
    { en: "There is some salad.", fr: "Il y a de la salade." },
    { en: "He eats some eggs.", fr: "Il mange des œufs." },
    { en: "I drink some water.", fr: "Je bois de l'eau." },
    { en: "We have some cheese.", fr: "Nous avons du fromage." },
    { en: "I don't eat meat.", fr: "Je ne mange pas de viande." },
    { en: "I don't drink coffee.", fr: "Je ne bois pas de café." },
    { en: "There isn't any bread.", fr: "Il n'y a pas de pain." },
    { en: "She doesn't want water.", fr: "Elle ne veut pas d'eau." },
    { en: "We don't have any eggs.", fr: "Nous n'avons pas d'œufs." },
  ],
};
