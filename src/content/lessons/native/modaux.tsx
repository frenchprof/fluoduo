/**
 * Native "Modaux : vouloir, pouvoir" lesson (Unité 2, L15) — Mémo + 🎲 dice
 * trainer + EN→FR bonus distilled from the 15-modaux.html drchan import.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const MODALS = [
  {
    inf: "vouloir", en: "want to",
    forms: { je: "veux", tu: "veux", il: "veut", nous: "voulons", vous: "voulez", ils: "veulent" } as Record<string, string>,
  },
  {
    inf: "pouvoir", en: "can",
    forms: { je: "peux", tu: "peux", il: "peut", nous: "pouvons", vous: "pouvez", ils: "peuvent" } as Record<string, string>,
  },
  // devoir joins the family (Dan, 2026-07-08: SIO-047 drills aller · pouvoir ·
  // devoir · falloir, but the lesson stopped at vouloir/pouvoir).
  {
    inf: "devoir", en: "must / have to",
    forms: { je: "dois", tu: "dois", il: "doit", nous: "devons", vous: "devez", ils: "doivent" } as Record<string, string>,
  },
] as const;
const ACTIVITIES = [
  { fr: "aller au cinéma", en: "go to the cinema" },
  { fr: "aller au parc", en: "go to the park" },
  { fr: "venir demain", en: "come tomorrow" },
  { fr: "venir ce soir", en: "come this evening" },
  { fr: "venir à 8 heures", en: "come at 8" },
  { fr: "danser", en: "dance" },
  { fr: "lire", en: "read" },
  { fr: "parler français", en: "speak French" },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const distinct = (forms: Record<string, string>) => [...new Set(Object.values(forms))];

export const modauxLesson: NativeLesson = {
  slug: "modaux",
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
          <tr><td className="p-1">je</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">veux</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">peux</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">dois</td></tr>
          <tr><td className="p-1">tu</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">veux</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">peux</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">dois</td></tr>
          <tr><td className="p-1">il / elle / on</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">veut</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">peut</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">doit</td></tr>
          <tr><td className="p-1">nous</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">voulons</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">pouvons</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">devons</td></tr>
          <tr><td className="p-1">vous</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">voulez</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">pouvez</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">devez</td></tr>
          <tr><td className="p-1">ils / elles</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">veulent</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">peuvent</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">doivent</td></tr>
        </tbody>
      </table>
      <p className="mt-2 text-[14px] text-[color:var(--cahier-ink)]">
        <b lang="fr" className="text-[color:var(--cahier-la)]">il faut</b> + infinitive — impersonal obligation, one form only:{" "}
        <i lang="fr">Il faut venir à 8 heures.</i>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Conjugated modal + infinitive</b> — the second verb is never conjugated:{" "}
        <i lang="fr">Je veux <u>aller</u> au cinéma. · Nous devons <u>partir</u>.</i>{" "}
        Negative wraps the modal: <i lang="fr">Ils <b>ne</b> peuvent <b>pas</b> venir.</i>
      </p>
    </div>
  ),
  dice: {
    instruction: "Conjugate the modal verb for the subject — the infinitive stays.",
    newQuestion() {
      const s = pick(SUBJECTS), m = pick(MODALS), a = pick(ACTIVITIES);
      const form = m.forms[s.slot];
      const forms = distinct(m.forms);
      return {
        meta: `${s.disp} … ${a.fr}`,
        big: m.inf,
        en: `${m.en} ${a.en}`,
        correct: `${s.disp} ${form} ${a.fr}.`,
        easyOptions: forms.map((f) => `${s.disp} ${f} ${a.fr}.`),
        med: { before: s.disp, choices: forms, correct: form, after: `${a.fr}.` },
      };
    },
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
