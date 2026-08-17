/**
 * Native "Conjugaison" lesson (Unité 2 · L14) — the Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 14-conjugaison-er.html drchan import, as
 * real in-app content following the aimer.tsx template.
 */
import type { NativeLesson } from "./types";
import { sample, shuffle } from "@/lib/shuffle";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const ENDINGS = ["e", "es", "ons", "ez", "ent"];

const ER_VERBS = [
  { inf: "aimer", stem: "aim", en: "to like" },
  { inf: "parler", stem: "parl", en: "to speak" },
  { inf: "habiter", stem: "habit", en: "to live" },
] as const;
const IRR_VERBS = [
  { inf: "faire", en: "to do / make", f: { je: "fais", tu: "fais", il: "fait", nous: "faisons", vous: "faites", ils: "font" } },
  { inf: "aller", en: "to go", f: { je: "vais", tu: "vas", il: "va", nous: "allons", vous: "allez", ils: "vont" } },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const startsVowel = (s: string) => /^[aeiouéèêh]/i.test(s);
const sv = (s: (typeof SUBJECTS)[number], form: string) =>
  s.slot === "je" && startsVowel(form) ? `J'${form}` : `${s.disp} ${form}`;

const IRR_MEMO: [string, string, string, string, string][] = [
  ["je / j'", "fais", "vais", "veux", "peux"],
  ["tu", "fais", "vas", "veux", "peux"],
  ["il / elle / on", "fait", "va", "veut", "peut"],
  ["nous", "faisons", "allons", "voulons", "pouvons"],
  ["vous", "faites", "allez", "voulez", "pouvez"],
  ["ils / elles", "font", "vont", "veulent", "peuvent"],
];

export const conjugaisonErLesson: NativeLesson = {
  slug: "conjugaison-er",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Le présent — verbes en <em>-er</em> + irréguliers
      </h2>
      <p className="text-sm text-[color:var(--cahier-ink)]">
        <b>Stem + ending</b> (<i lang="fr">parler → parl-</i>):{" "}
        <span lang="fr" className="font-bold">je parl<b className="text-[color:var(--cahier-la)]">e</b> · tu parl<b className="text-[color:var(--cahier-la)]">es</b> · il parl<b className="text-[color:var(--cahier-la)]">e</b> · nous parl<b className="text-[color:var(--cahier-la)]">ons</b> · vous parl<b className="text-[color:var(--cahier-la)]">ez</b> · ils parl<b className="text-[color:var(--cahier-la)]">ent</b></span>
      </p>
      <table className="mt-2 w-full border-collapse text-sm text-[color:var(--cahier-ink)]">
        <thead>
          <tr>
            {["", "faire", "aller", "vouloir", "pouvoir"].map((h, i) => (
              <th key={i} lang={i > 0 ? "fr" : undefined} className="border border-[color:var(--cahier-rule)] bg-white px-2 py-1 text-left font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {IRR_MEMO.map(([pro, ...forms]) => (
            <tr key={pro}>
              <td lang="fr" className="border border-[color:var(--cahier-rule)] px-2 py-1 italic">{pro}</td>
              {forms.map((c, i) => (
                <td key={i} lang="fr" className="border border-[color:var(--cahier-rule)] px-2 py-1 font-bold">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>-e, -es, -ent are silent</b> — <i lang="fr">ils aiment</i> sounds like <i lang="fr">il aime</i>, but the spelling must agree. Before a vowel or h, <i lang="fr">je</i> → <b lang="fr">j&rsquo;</b>: <i lang="fr">j&rsquo;aime, j&rsquo;habite</i>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Conjugate the verb for the subject.",
    newQuestion() {
      const s = pick(SUBJECTS);
      if (Math.random() < 0.6) {
        const v = pick(ER_VERBS);
        const form = v.stem + END[s.slot];
        const otherEnds = sample(ENDINGS.filter((e) => e !== END[s.slot]), 3);
        const stemDisp = s.slot === "je" && startsVowel(v.stem) ? `J'${v.stem}` : `${s.disp} ${v.stem}`;
        return {
          meta: `${s.disp} + …`,
          big: v.inf,
          en: v.en,
          correct: `${sv(s, form)}.`,
          easyOptions: [form, ...otherEnds.map((e) => v.stem + e)].map((f) => `${sv(s, f)}.`),
          med: { before: stemDisp, choices: [...ENDINGS], correct: END[s.slot], after: "." },
        };
      }
      const v = pick(IRR_VERBS);
      const form = v.f[s.slot];
      const others = shuffle([...new Set(Object.values(v.f))].filter((x) => x !== form));
      return {
        meta: `${s.disp} + …`,
        big: v.inf,
        en: v.en,
        correct: `${sv(s, form)}.`,
        easyOptions: [form, ...others.slice(0, 3)].map((f) => `${sv(s, f)}.`),
        med: { before: s.disp, choices: [form, ...others.slice(0, 4)], correct: form, after: "." },
      };
    },
  },
  bonus: [
    { en: "I want to go to the cinema.", fr: "Je veux aller au cinéma." },
    { en: "She can come at 8.", fr: "Elle peut venir à 8 heures." },
    { en: "We speak French.", fr: "Nous parlons français." },
    { en: "They live in France.", fr: "Ils habitent en France." },
    { en: "You (pl.) can come tomorrow.", fr: "Vous pouvez venir demain." },
    { en: "He wants to read.", fr: "Il veut lire." },
    { en: "I like dancing.", fr: "J'aime danser." },
    { en: "They can't come this evening.", fr: "Ils ne peuvent pas venir ce soir." },
    { en: "You (sg.) speak English.", fr: "Tu parles anglais." },
    { en: "We want to go to the park.", fr: "Nous voulons aller au parc." },
  ],
};
