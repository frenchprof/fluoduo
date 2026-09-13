/**
 * Native "Adjectifs démonstratifs" lesson (Unité 4) — distilled from
 * 23-demonstratifs.html: the Mémo + the 🎲 dice trainer + EN→FR bonus.
 */
import type { NativeLesson } from "./types";

const NOUNS = [
  { fr: "soir", art: "ce", en: "this evening" },
  { fr: "matin", art: "ce", en: "this morning" },
  { fr: "week-end", art: "ce", en: "this weekend" },
  { fr: "printemps", art: "ce", en: "this spring" },
  { fr: "mois", art: "ce", en: "this month" },
  { fr: "après-midi", art: "cet", en: "this afternoon" },
  { fr: "été", art: "cet", en: "this summer" },
  { fr: "hiver", art: "cet", en: "this winter" },
  { fr: "automne", art: "cet", en: "this autumn" },
  { fr: "semaine", art: "cette", en: "this week" },
  { fr: "année", art: "cette", en: "this year" },
  { fr: "nuit", art: "cette", en: "tonight" },
  { fr: "journée", art: "cette", en: "today (the whole day)" },
] as const;
const DEMS = ["ce", "cet", "cette"];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const frame = (art: string, noun: string) => `Qu'est-ce que tu fais ${art} ${noun} ?`;

export const demonstratifsLesson: NativeLesson = {
  slug: "demonstratifs",
  // THE REFERENCE CONCEPT — the first of 47, and the worked example the rest
  // are drafted against. Every claim here comes from the Mémo below it;
  // nothing new was invented.
  //
  // APPROVED BY DAN, 2026-08-31: "it is fine the way you wrote it about cet
  // and cette". That matters beyond this one lesson — `contrast` and
  // `remember` are the pedagogical claim, the two fields where a wrong
  // sentence teaches a wrong rule, and the rule is that they reach Dan before
  // they reach a learner. This is the first pass through that gate, so the
  // drafting arrangement it proves is the one the other 46 follow: an agent
  // fills the nine slots from the Mémo and invents no grammar; Dan rules on
  // slots 2 and 9. Do not treat his approval here as covering the rest.
  concept: {
    subtitle: "Why cet is not a third gender",
    contrast: (
      <>
        In English <i>this</i> never changes &mdash; this book, this week. In French{" "}
        <i lang="fr">ce / cet / cette / ces</i> agrees with the noun, and one of the four
        is chosen by <b>sound</b>, not gender.
      </>
    ),
    question: (
      <>
        Why is it <i lang="fr">cet été</i> but <i lang="fr">ce soir</i>, when{" "}
        <i lang="fr">été</i> and <i lang="fr">soir</i> are both masculine?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">été</i> begins with a vowel. <i lang="fr">Cet</i> is{" "}
        <i lang="fr">ce</i> adjusted so the two words run together — a pronunciation
        form, not a gender. <i lang="fr">Cet été</i>, <i lang="fr">cet hiver</i> and{" "}
        <i lang="fr">cet après-midi</i> are all still masculine.
      </>
    ),
    pitfall: [
      { label: <><i lang="fr">été</i> (m., vowel)</>, wrong: <i lang="fr">ce été</i>, right: <i lang="fr">cet été</i> },
      { label: <><i lang="fr">après-midi</i> (m., vowel)</>, wrong: <i lang="fr">ce après-midi</i>, right: <i lang="fr">cet après-midi</i> },
      { label: <><i lang="fr">semaine</i> (f.)</>, wrong: <i lang="fr">cet semaine</i>, right: <i lang="fr">cette semaine</i> },
    ],
    flow: [
      { depth: 0, text: "Is the noun plural?" },
      { depth: 1, text: "yes → ces" },
      { depth: 1, text: "no  → is it feminine?" },
      { depth: 2, text: "yes → cette" },
      // Shortened 31 Aug: the long form measured 401px in a 296px box, so the
      // last two branches sat off the right edge until you dragged them in.
      { depth: 2, text: "no  → vowel or silent h?" },
      { depth: 3, text: "yes → cet" },
      { depth: 3, text: "no  → ce" },
    ],
    check: [
      {
        q: <>Why <i lang="fr">cet automne</i> and not <i lang="fr">cette automne</i>?</>,
        a: (
          <>
            Because <i lang="fr">automne</i> is masculine. It takes <i lang="fr">cet</i>{" "}
            only because it begins with a vowel — the gender has not changed.
          </>
        ),
      },
      {
        q: <>You hear <i lang="fr">[set] semaine</i>. Which spelling?</>,
        a: (
          <>
            <i lang="fr">Cette</i> — <i lang="fr">semaine</i> is feminine.{" "}
            <i lang="fr">Cet</i> only ever appears before a masculine vowel word.
          </>
        ),
      },
    ],
    inShort: (
      <>
        <i lang="fr">ce</i> masculine · <i lang="fr">cet</i> masculine before a vowel ·{" "}
        <i lang="fr">cette</i> feminine · <i lang="fr">ces</i> plural
      </>
    ),
    remember: (
      <>
        <i lang="fr">Cet</i> is <i lang="fr">ce</i> made easier to say. It is not a gender.
      </>
    ),
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Ce · cet · cette = <em>this</em>
      </h2>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--gram-masc)]">ce</b> + masculin — <i lang="fr">ce soir, ce week-end</i></li>
        <li><b className="text-lg text-[color:var(--gram-masc)]">cet</b> + masculin + voyelle — <i lang="fr">cet après-midi, cet été</i></li>
        <li><b className="text-lg text-[color:var(--gram-fem)]">cette</b> + féminin — <i lang="fr">cette semaine, cette année</i></li>
        <li><b className="text-lg text-[color:var(--gram-neutral)]">ces</b> + pluriel — <i lang="fr">ces week-ends</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>cet</b> before a masculine noun starting with a <b>vowel</b> (or silent h) — for the liaison:{" "}
        <i lang="fr">cet&nbsp;été, cet&nbsp;hiver, cet&nbsp;après-midi</i>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Choose the right demonstrative: ce, cet, cette or ces.",
    newQuestion() {
      const n = pick(NOUNS);
      return {
        meta: "Qu'est-ce que tu fais … ?",
        big: n.fr,
        en: n.en,
        correct: frame(n.art, n.fr),
        easyOptions: DEMS.map((d) => frame(d, n.fr)),
        med: { before: "Qu'est-ce que tu fais", choices: DEMS, correct: n.art, after: `${n.fr} ?` },
      };
    },
  },
  bonus: [
    { en: "What are you doing this evening?", fr: "Qu'est-ce que tu fais ce soir ?" },
    { en: "What are you doing this afternoon?", fr: "Qu'est-ce que tu fais cet après-midi ?" },
    { en: "What are you doing this week?", fr: "Qu'est-ce que tu fais cette semaine ?" },
    { en: "What are you doing this summer?", fr: "Qu'est-ce que tu fais cet été ?" },
    { en: "What are you doing this weekend?", fr: "Qu'est-ce que tu fais ce week-end ?" },
    { en: "What are you doing this year?", fr: "Qu'est-ce que tu fais cette année ?" },
    { en: "What are you doing this morning?", fr: "Qu'est-ce que tu fais ce matin ?" },
    { en: "What are you doing this winter?", fr: "Qu'est-ce que tu fais cet hiver ?" },
    { en: "What are you doing this autumn?", fr: "Qu'est-ce que tu fais cet automne ?" },
    { en: "What are you doing tonight?", fr: "Qu'est-ce que tu fais cette nuit ?" },
  ],
};
