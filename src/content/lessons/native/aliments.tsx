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
