/**
 * Native "Nationalités" lesson (Unité 1) — authored 2026-08-23 to the
 * LESSON_PLAN U1 #7 row (country → the 4 agreed forms) and the Atelier U1
 * grammar box « L'accord des adjectifs de nationalité » (+ e pour une femme,
 * + s pour le pluriel, -ien → -ienne): Mémo + 🎲 dice trainer + EN→FR bonus.
 * Countries and all four forms come from the nationalities deck's `nat` data.
 */
import type { NativeLesson } from "./types";

import { NATIONALITIES_AXES, nationalitiesQuestion } from "./nationalities.gen";

export const nationalitiesLesson: NativeLesson = {
  slug: "nationalities",
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
    subtitle: "Why français has no capital",
    contrast: (
      <>
        English capitalises every nationality &mdash; <i>he is French</i>, <i>a French
        film</i>. French capitalises the country but not the adjective:{" "}
        <i lang="fr">la France</i>, and <i lang="fr">il est fran&ccedil;ais</i>.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">la France</i> with a capital, but <i lang="fr">il est français</i>{" "}
        without one?
      </>
    ),
    answer: (
      <>
        <i lang="fr">France</i> is a name. In <i lang="fr">il est français</i>,{" "}
        <i lang="fr">français</i> is an <b>adjective</b> describing him — and French
        adjectives never take a capital. Being an adjective, it also agrees:{" "}
        <i lang="fr">elle est française</i>.
      </>
    ),
    pitfall: [
      { label: <>the country</>, wrong: <i lang="fr">la france</i>, right: <i lang="fr">la France</i> },
      { label: <>describing him</>, wrong: <i lang="fr">il est Français</i>, right: <i lang="fr">il est français</i> },
      { label: <>describing her</>, wrong: <i lang="fr">elle est français</i>, right: <i lang="fr">elle est française</i> },
    ],
    flow: [
      { depth: 0, text: "The masculine form ends in…" },
      { depth: 1, text: "-ien → -ienne" },
      { depth: 1, text: "-e   → no change" },
      { depth: 1, text: "else → add -e" },
      { depth: 0, text: "Plural? add -s to that." },
    ],
    check: [
      {
        q: <>Why does <i lang="fr">russe</i> not change for a woman?</>,
        a: <>It already ends in <i lang="fr">-e</i>, so there is nothing to add.</>,
      },
      {
        q: <>Capital or not: <i lang="fr">Elle est ___</i> (tunisian)?</>,
        a: (
          <>
            <i lang="fr">tunisienne</i>, lower case — it is an adjective here, and it
            takes <i lang="fr">-ienne</i> for a woman.
          </>
        ),
      },
    ],
    inShort: (
      <>
        +<i lang="fr">e</i> féminin · +<i lang="fr">s</i> pluriel ·{" "}
        <i lang="fr">-ien</i> → <i lang="fr">-ienne</i> · ends in{" "}
        <i lang="fr">-e</i> → unchanged
      </>
    ),
    remember: (
      <>
        The country keeps its capital. The adjective loses it — and agrees instead.
      </>
    ),
  },
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Les nationalités — <em>l&rsquo;accord</em>
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>+ <b className="text-[color:var(--gram-fem)]">e</b> for a woman — <i lang="fr">français → français<b>e</b></i></li>
        <li>+ <b className="text-[color:var(--gram-neutral)]">s</b> for the plural — <i lang="fr">américain → américain<b>s</b></i></li>
        <li><b className="text-[color:var(--gram-masc)]">-ien</b> → <b className="text-[color:var(--gram-fem)]">-ienne</b> — <i lang="fr">tunisien → tunis<b>ienne</b></i></li>
        <li>ends in <b className="text-[color:var(--gram-neutral)]">-e</b> → no change — <i lang="fr">russe, suisse</i></li>
      </ul>
      <table className="mt-3 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left">
            <th className="p-1" />
            <th className="p-1 text-[color:var(--gram-masc)]">masculin</th>
            <th className="p-1 text-[color:var(--gram-fem)]">féminin</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[color:var(--cahier-rule)]/50">
            <td className="p-1 font-bold">il / elle est</td>
            <td className="p-1 text-[color:var(--gram-masc)]">français · tunisien</td>
            <td className="p-1 text-[color:var(--gram-fem)]">française · tunisienne</td>
          </tr>
          <tr className="border-b border-[color:var(--cahier-rule)]/50">
            <td className="p-1 font-bold">ils / elles sont</td>
            <td className="p-1 text-[color:var(--gram-masc)]">français · tunisiens</td>
            <td className="p-1 text-[color:var(--gram-fem)]">françaises · tunisiennes</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ No capital on the adjective: <span lang="fr">la <b>F</b>rance → il est <b>f</b>rançais</span>.
        Irregular: <span lang="fr">grec → grec<b>que</b>, turc → tur<b>que</b></span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Give the nationality — agreed with the subject.",
    newQuestion: nationalitiesQuestion,
    axes: NATIONALITIES_AXES,
  },
  bonus: [
    { en: "He is French.", fr: "Il est français." },
    { en: "She is Chinese.", fr: "Elle est chinoise." },
    { en: "They (f.) are Korean.", fr: "Elles sont coréennes." },
    { en: "They (m.) are American.", fr: "Ils sont américains." },
    { en: "She is Greek.", fr: "Elle est grecque." },
    { en: "He is Turkish.", fr: "Il est turc." },
    { en: "They (m.) are English.", fr: "Ils sont anglais." },
    { en: "She is German.", fr: "Elle est allemande." },
    { en: "They (f.) are Mexican.", fr: "Elles sont mexicaines." },
    { en: "He is Russian.", fr: "Il est russe." },
  ],
};
