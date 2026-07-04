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
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        L&rsquo;article des pays
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--cahier-la)]">la</b> + féminin — <i lang="fr">la France, la Chine</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">le</b> + masculin — <i lang="fr">le Japon, le Canada, le Portugal</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">l&rsquo;</b> + voyelle — <i lang="fr">l&rsquo;Italie, l&rsquo;Espagne, l&rsquo;Allemagne, l&rsquo;Angleterre</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">les</b> + pluriel — <i lang="fr">les États-Unis</i></li>
      </ul>
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
