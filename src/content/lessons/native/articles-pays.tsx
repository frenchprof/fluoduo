/**
 * Native "Articles des pays" lesson (Unité 1, L06) — Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 06-articles-pays.html drchan import.
 */
import type { NativeLesson } from "./types";

const COUNTRIES = [
  { fr: "France", art: "la", genre: "f", en: "France" },
  { fr: "Angleterre", art: "l'", genre: "f", en: "England" },
  { fr: "Chine", art: "la", genre: "f", en: "China" },
  { fr: "Japon", art: "le", genre: "m", en: "Japan" },
  { fr: "Espagne", art: "l'", genre: "f", en: "Spain" },
  { fr: "Allemagne", art: "l'", genre: "f", en: "Germany" },
  { fr: "États-Unis", art: "les", genre: "pl", en: "United States" },
  { fr: "Canada", art: "le", genre: "m", en: "Canada" },
  { fr: "Italie", art: "l'", genre: "f", en: "Italy" },
  { fr: "Portugal", art: "le", genre: "m", en: "Portugal" },
] as const;
const ARTS = ["le", "la", "l'", "les"];
const GENRE_EN: Record<string, string> = { f: "féminin", m: "masculin", pl: "pluriel" };

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const np = (art: string, fr: string) => art + (art === "l'" ? "" : " ") + fr;

export const articlesPaysLesson: NativeLesson = {
  slug: "articles-pays",
  formLayout: "table",
  // TIER 2 CONCEPT — a question the WORD LIST cannot answer.
  //
  // Peers, 2026-08-31: the brief differs per tier. A Tier 1 concept answers a
  // question the FORMS cannot; a Tier 2 concept answers one the word list
  // cannot. Knowing every word on this deck still leaves this unanswered,
  // which is what earns the tab its place on a vocabulary stop.
  //
  // Lifted from the Mémo below; no grammar introduced that it does not teach.
  // DRAFTED — `contrast` and `remember` are the pedagogical claim and go to
  // Dan before they reach a learner.
  concept: {
    subtitle: "Why a country has a gender",
    contrast: (
      <>
        In English a country is just its name &mdash; France, Japan. In French the name
        arrives with an article, and that article has a gender:{" "}
        <i lang="fr">la France</i>, <i lang="fr">le Japon</i>.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">la France</i> but <i lang="fr">le Japon</i>?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">France</i> ends in <b>-e</b> and is feminine, while{" "}
        <i lang="fr">Japon</i> does not and is masculine. The ending is the clue, and it
        is right far more often than it is wrong.
      </>
    ),
    pitfall: [
      { label: <>ends in -e</>, wrong: <i lang="fr">le France</i>, right: <i lang="fr">la France</i> },
      { label: <>starts with a vowel</>, wrong: <i lang="fr">la Italie</i>, right: <i lang="fr">l&rsquo;Italie</i> },
      { label: <>plural name</>, wrong: <i lang="fr">le États-Unis</i>, right: <i lang="fr">les États-Unis</i> },
    ],
    flow: [
      { depth: 0, text: "Is the name plural?" },
      { depth: 1, text: "yes → les" },
      { depth: 1, text: "no  → does it start with a vowel?" },
      { depth: 2, text: "yes → l'" },
      { depth: 2, text: "no  → does it end in -e?" },
      { depth: 3, text: "yes → la" },
      { depth: 3, text: "no  → le" },
    ],
    check: [
      {
        q: <>« Chine » ends in -e. Which article?</>,
        a: <><i lang="fr">la Chine</i> — the -e ending marks it feminine.</>,
      },
      {
        q: <>Why <i lang="fr">l&rsquo;Allemagne</i> rather than <i lang="fr">la Allemagne</i>?</>,
        a: (
          <>
            It is feminine, but it begins with a vowel, so <i lang="fr">la</i> elides to{" "}
            <i lang="fr">l&rsquo;</i>. The gender has not changed — only the sound.
          </>
        ),
      },
    ],
    inShort: (
      <>
        <i lang="fr">la</i> + féminin · <i lang="fr">le</i> + masculin ·{" "}
        <i lang="fr">l&rsquo;</i> + voyelle · <i lang="fr">les</i> + pluriel
      </>
    ),
    remember: (
      <>
        The article is part of the country&rsquo;s name. Learn <i lang="fr">le Japon</i>,
        never <i lang="fr">Japon</i> on its own.
      </>
    ),
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        L&rsquo;article des pays
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <div><b className="text-lg text-[color:var(--gram-fem)]">la</b> + féminin</div>
        <div><i lang="fr">la France, la Chine</i></div>
        <div><b className="text-lg text-[color:var(--gram-masc)]">le</b> + masculin</div>
        <div><i lang="fr">le Japon, le Canada, le Portugal</i></div>
        <div><b className="text-lg text-[color:var(--gram-neutral)]">l&rsquo;</b> + voyelle</div>
        <div><i lang="fr">l&rsquo;Italie, l&rsquo;Espagne, l&rsquo;Allemagne, l&rsquo;Angleterre</i></div>
        <div><b className="text-lg text-[color:var(--gram-neutral)]">les</b> + pluriel</div>
        <div><i lang="fr">les États-Unis</i></div>
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Gender tip:</b> countries ending in <b>-e</b> are feminine (<span lang="fr">la Franc<u>e</u>, la Chin<u>e</u></span>);
        the others are usually masculine (<span lang="fr">le Japon, le Canada</span>).
      </p>
    </div>
  ),
  dice: {
    instruction: "Choose the right definite article for the country.",
    newQuestion() {
      const c = pick(COUNTRIES);
      return {
        meta: `Pays (${GENRE_EN[c.genre]})`,
        big: c.fr,
        en: c.en,
        correct: np(c.art, c.fr),
        easyOptions: ARTS.map((a) => np(a, c.fr)),
        med: { before: "", choices: ARTS, correct: c.art, after: c.fr },
      };
    },
  },
  bonus: [
    { en: "France (article + country)", fr: "la France" },
    { en: "Japan (article + country)", fr: "le Japon" },
    { en: "United States (article + country)", fr: "les États-Unis" },
    { en: "Spain (article + country)", fr: "l'Espagne" },
    { en: "Canada (article + country)", fr: "le Canada" },
    { en: "Italy (article + country)", fr: "l'Italie" },
    { en: "Portugal (article + country)", fr: "le Portugal" },
    { en: "China (article + country)", fr: "la Chine" },
    { en: "Germany (article + country)", fr: "l'Allemagne" },
    { en: "England (article + country)", fr: "l'Angleterre" },
  ],
};
