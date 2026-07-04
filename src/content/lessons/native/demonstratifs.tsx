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
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Ce · cet · cette = <em>this</em>
      </h2>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--cahier-la)]">ce</b> + masculin — <i lang="fr">ce soir, ce week-end</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">cet</b> + masculin + voyelle — <i lang="fr">cet après-midi, cet été</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">cette</b> + féminin — <i lang="fr">cette semaine, cette année</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">ces</b> + pluriel — <i lang="fr">ces week-ends</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>cet</b> before a masculine noun starting with a <b>vowel</b> (or silent h) — for the liaison:{" "}
        <i lang="fr">cet&nbsp;été, cet&nbsp;hiver, cet&nbsp;après-midi</i>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Choose the right demonstrative: « Qu'est-ce que tu fais … ? »",
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
