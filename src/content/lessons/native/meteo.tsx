/**
 * Native "Météo" lesson (Unité 3) — authored 2026-08-23 to the LESSON_PLAN
 * U3 #1 row and the Atelier U3 Situation 1 « Parler de la météo » (Il fait
 * beau / entre 13 et 15 degrés · Il y a du vent · Il pleut, il neige):
 * Mémo + 🎲 dice trainer + EN→FR bonus. Words are the weather-letris deck's
 * own items; the four frames are its letris columns (the « C'est … » frame —
 * c'est nuageux / ensoleillé, book pp. 94/107 — is memo-only, the dice keeps
 * the three verb frames).
 */
import type { NativeLesson } from "./types";

const FAIT = [
  { fr: "beau", en: "nice weather" },
  { fr: "mauvais", en: "bad weather" },
  { fr: "chaud", en: "hot" },
  { fr: "froid", en: "cold" },
  { fr: "frais", en: "cool / chilly" },
  { fr: "doux", en: "mild" },
  { fr: "16 degrés", en: "16 degrees" },
  { fr: "entre 13 et 15 degrés", en: "between 13 and 15 degrees" },
] as const;
const YA = [
  { fr: "du soleil", en: "sunshine" },
  { fr: "du vent", en: "wind" },
  { fr: "de la pluie", en: "rain" },
  { fr: "des orages", en: "storms" },
  { fr: "de la neige", en: "snow" },
  { fr: "du brouillard", en: "fog" },
  { fr: "des éclairs", en: "lightning" },
  { fr: "une tempête", en: "a storm" },
] as const;
const VERBE = [
  { fr: "pleut", en: "it's raining" },
  { fr: "neige", en: "it's snowing" },
  { fr: "gèle", en: "it's freezing" },
] as const;

const FRAMES = ["Il fait", "Il y a", "Il"] as const;
type Frame = (typeof FRAMES)[number];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const meteoLesson: NativeLesson = {
  slug: "meteo",
  formLayout: "list",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]" lang="fr">
        Quel temps fait-il ?
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <div><b className="text-[color:var(--gram-neutral)]">Il fait</b> + adjective</div>
        <div><i lang="fr">Il fait beau, il fait froid, il fait 16 degrés.</i></div>
        <div><b className="text-[color:var(--gram-neutral)]">Il y a</b> + <b className="text-[color:var(--gram-masc)]">du</b> / <b className="text-[color:var(--gram-fem)]">de la</b> / <b className="text-[color:var(--gram-neutral)]">des</b> + noun</div>
        <div><i lang="fr">Il y a du vent, de la pluie, des orages.</i></div>
        <div><b className="text-[color:var(--gram-neutral)]">Il</b> + verb</div>
        <div><i lang="fr">Il pleut. Il neige. Il gèle.</i></div>
        <div><b className="text-[color:var(--gram-neutral)]">C&rsquo;est</b> + adjective</div>
        <div><i lang="fr">C&rsquo;est nuageux. C&rsquo;est ensoleillé.</i></div>
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ &ldquo;It is hot&rdquo; → <span lang="fr">Il <b>fait</b> chaud</span> — never{" "}
        <i lang="fr">Il est chaud</i>.
      </p>
    </div>
  ),
  // TIER 3 · stop 31. OPAQUE — this is the syllabus's own example: « il fait
  // beau » is not IL + FAIRE + BEAU. So no parsing. The claim is about WHICH
  // FRAME to reach for, which is a real decision the phrase list cannot make.
  concept: {
    subtitle: "Why the weather has four different frames",
    contrast: (
      <>
        English has one shape for nearly all of it &mdash; <i>it is sunny</i>,{" "}
        <i>it is windy</i>, <i>it is raining</i>. French has four, and the kind of word you
        want decides which. <i lang="fr">Il fait beau</i> is not built from{" "}
        <i>it</i> + <i>makes</i> + <i>beautiful</i>; it is simply the frame for weather.
      </>
    ),
    question: (
      <>
        You want to say <i>it is hot</i>. Which frame?
      </>
    ),
    answer: (
      <>
        <i lang="fr">Il fait chaud.</i> Never <i lang="fr">il est chaud</i>, which says a
        thing is hot to the touch. <i lang="fr">Il fait</i> takes an adjective;{" "}
        <i lang="fr">il y a</i> takes a noun (<i lang="fr">du vent</i>,{" "}
        <i lang="fr">de la pluie</i>); some weather is its own verb
        (<i lang="fr">il pleut</i>, <i lang="fr">il neige</i>).
      </>
    ),
    flow: [
      { depth: 0, text: "What kind of word do you have?" },
      { depth: 1, text: "adjective → il fait beau" },
      { depth: 1, text: "noun → il y a du vent" },
      { depth: 1, text: "its own verb → il pleut" },
    ],
    pitfall: [
      { label: <>it is hot</>, wrong: <><i lang="fr">il est chaud</i></>, right: <><i lang="fr">il fait chaud</i></> },
      { label: <>it is windy</>, wrong: <><i lang="fr">il fait vent</i></>, right: <><i lang="fr">il y a du vent</i></> },
      { label: <>it is raining</>, wrong: <><i lang="fr">il fait pluie</i></>, right: <><i lang="fr">il pleut</i></> },
    ],
    check: [
      { q: <>There are storms &mdash; <i lang="fr">des orages</i>.</>,
        a: <><i lang="fr">Il y a des orages.</i> A noun, so <i lang="fr">il y a</i>.</> },
      { q: <>It is 16 degrees.</>,
        a: <><i lang="fr">Il fait 16 degr&eacute;s.</i></> },
    ],
    remember: (
      <>
        Do not translate <i>it is</i>. Ask what kind of word follows, and let that pick the
        frame.
      </>
    ),
  },
  dice: {
    instruction: "Say the weather — il fait, il y a, or il + verb.",
    newQuestion() {
      const family = pick(FRAMES);
      const w = family === "Il fait" ? pick(FAIT) : family === "Il y a" ? pick(YA) : pick(VERBE);
      const say = (f: Frame) => `${f} ${w.fr}.`;
      // 3 options: the right frame, the other "big" frame, and the classic
      // « il est » error (never a bare « Il froid » / « Il du vent »).
      const wrongs =
        family === "Il"
          ? [say("Il fait"), say("Il y a")]
          : [say(family === "Il fait" ? "Il y a" : "Il fait"), `Il est ${w.fr}.`];
      return {
        meta: "Quel temps fait-il ?",
        big: w.en,
        correct: say(family),
        easyOptions: [say(family), ...wrongs],
        med: { before: "", choices: [...FRAMES], correct: family, after: `${w.fr}.` },
      };
    },
  },
  bonus: [
    { en: "The weather is nice.", fr: "Il fait beau." },
    { en: "It is cold.", fr: "Il fait froid." },
    { en: "It is 16 degrees.", fr: "Il fait 16 degrés.", alt: ["Il fait seize degrés."] },
    { en: "There is wind.", fr: "Il y a du vent." },
    { en: "There are storms.", fr: "Il y a des orages." },
    { en: "There is fog.", fr: "Il y a du brouillard." },
    { en: "It is raining.", fr: "Il pleut." },
    { en: "It is snowing.", fr: "Il neige." },
    { en: "In winter, it is cold.", fr: "En hiver, il fait froid." },
    { en: "In summer, it is hot.", fr: "En été, il fait chaud." },
  ],
};
