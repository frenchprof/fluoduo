/**
 * Native "Modaux : vouloir, pouvoir" lesson (Unité 2, L15) — Mémo + 🎲 dice
 * trainer + EN→FR bonus distilled from the 15-modaux.html drchan import.
 */
import type { NativeLesson } from "./types";

import { MODAUX_AXES, modauxQuestion } from "./modaux.gen";

export const modauxLesson: NativeLesson = {
  slug: "modaux",
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Vouloir, pouvoir &amp; devoir
      </h2>
      <table className="w-full border-collapse text-[15px] text-[color:var(--cahier-ink)]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
            <th className="p-1"></th>
            <th className="p-1" lang="fr">vouloir (want)</th>
            <th className="p-1" lang="fr">pouvoir (can)</th>
            <th className="p-1" lang="fr">devoir (must)</th>
          </tr>
        </thead>
        <tbody lang="fr">
          <tr><td className="p-1">je</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">veux</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">peux</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">dois</td></tr>
          <tr><td className="p-1">tu</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">veux</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">peux</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">dois</td></tr>
          <tr><td className="p-1">il / elle / on</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">veut</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">peut</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">doit</td></tr>
          <tr><td className="p-1">nous</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">voulons</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">pouvons</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">devons</td></tr>
          <tr><td className="p-1">vous</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">voulez</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">pouvez</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">devez</td></tr>
          <tr><td className="p-1">ils / elles</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">veulent</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">peuvent</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">doivent</td></tr>
        </tbody>
      </table>
      <p className="mt-2 text-[14px] text-[color:var(--cahier-ink)]">
        <b lang="fr" className="text-[color:var(--gram-neutral)]">il faut</b> + infinitive — impersonal obligation, one form only:{" "}
        <i lang="fr">Il faut venir à 8 heures.</i>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Conjugated modal + infinitive</b> — the second verb is never conjugated:{" "}
        <i lang="fr">Je veux <u>aller</u> au cinéma. · Nous devons <u>partir</u>.</i>{" "}
        Negative wraps the modal: <i lang="fr">Ils <b>ne</b> peuvent <b>pas</b> venir.</i>
      </p>
    </div>
  ),
  // TIER 1 · stop 37. Three verbs sharing one shape, plus the one that has no
  // shape at all. `il faut` being impersonal is the Mémo's warning; the concept
  // says what that costs — it cannot tell you WHO must.
  concept: {
    subtitle: "Why il faut has no person",
    contrast: (
      <>
        English says who must &mdash; <i>I must</i>, <i>you must</i>. French can too
        (<i lang="fr">je dois</i>, <i lang="fr">tu dois</i>), but it also has{" "}
        <i lang="fr">il faut</i>, which has <b>no person at all</b> and never changes.
      </>
    ),
    question: (
      <>
        <i lang="fr">Il faut boire de l&rsquo;eau.</i> Who has to drink it?
      </>
    ),
    answer: (
      <>
        Nobody in particular &mdash; everybody. That is the point of it. There is no{" "}
        <i lang="fr">je faut</i> or <i lang="fr">nous fallons</i>; the form is the same
        whoever the advice is for. When you need to say who, you need{" "}
        <i lang="fr">devoir</i>: <i lang="fr">tu dois boire de l&rsquo;eau</i>.
      </>
    ),
    pitfallHeads: ["treating it like a verb with a person", "what il faut is"],
    pitfall: [
      { label: <>I must</>, wrong: <><i lang="fr">je faut</i></>, right: <><i lang="fr">je dois</i></> },
      { label: <>we must</>, wrong: <><i lang="fr">nous fallons</i></>, right: <><i lang="fr">nous devons</i></> },
      { label: <>one must</>, wrong: <>&mdash;</>, right: <><i lang="fr">il faut</i>, always</> },
    ],
    flow: [
      { depth: 0, text: "Does it matter who?" },
      { depth: 1, text: "yes → devoir, conjugated" },
      { depth: 1, text: "no → il faut, never changed" },
    ],
    check: [
      { q: <>All three verbs take the same thing after them. What?</>,
        a: <>An infinitive. <i lang="fr">Je veux partir</i>, <i lang="fr">je peux partir</i>, <i lang="fr">je dois partir</i>.</> },
      { q: <>Turn <i lang="fr">il faut partir</i> into advice for one person.</>,
        a: <><i lang="fr">Tu dois partir.</i></> },
    ],
    remember: (
      <>
        <i lang="fr">Il faut</i> says something must happen. Only{" "}
        <i lang="fr">devoir</i> can say who.
      </>
    ),
  },
  dice: {
    instruction: "Conjugate the modal verb for the subject — the infinitive stays.",
    newQuestion: modauxQuestion,
    axes: MODAUX_AXES,
  },
  bonus: [
    { en: "I want to go to the cinema.", fr: "Je veux aller au cinéma." },
    { en: "She can come at 8.", fr: "Elle peut venir à 8 heures." },
    { en: "He wants to read.", fr: "Il veut lire." },
    { en: "You (pl.) can come tomorrow.", fr: "Vous pouvez venir demain." },
    { en: "We want to go to the park.", fr: "Nous voulons aller au parc." },
    { en: "They can't come this evening.", fr: "Ils ne peuvent pas venir ce soir." },
    { en: "You (sg.) want to dance.", fr: "Tu veux danser." },
    { en: "I can speak French.", fr: "Je peux parler français." },
    { en: "They (f.) want to come this evening.", fr: "Elles veulent venir ce soir." },
    { en: "We can't go to the cinema.", fr: "Nous ne pouvons pas aller au cinéma." },
  ],
};
