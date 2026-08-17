/**
 * Native "Futur proche" lesson (Unité 4) — distilled from 21-futur-proche.html:
 * the Mémo + the 🎲 dice trainer + EN→FR bonus, as real in-app content.
 */
import type { NativeLesson } from "./types";
import { sample } from "@/lib/shuffle";

const SUBJECTS = [
  { disp: "Je", aller: "vais" }, { disp: "Tu", aller: "vas" }, { disp: "Il", aller: "va" },
  { disp: "Elle", aller: "va" }, { disp: "On", aller: "va" }, { disp: "Nous", aller: "allons" },
  { disp: "Vous", aller: "allez" }, { disp: "Ils", aller: "vont" }, { disp: "Elles", aller: "vont" },
] as const;
const ALLER = ["vais", "vas", "va", "allons", "allez", "vont"];
const INFS = [
  { fr: "faire du sport", en: "do sport" }, { fr: "manger équilibré", en: "eat healthily" },
  { fr: "sortir ce soir", en: "go out tonight" }, { fr: "partir en vacances", en: "go on holiday" },
  { fr: "dormir plus", en: "sleep more" }, { fr: "courir demain", en: "run tomorrow" },
  { fr: "arrêter le café", en: "quit coffee" }, { fr: "étudier le français", en: "study French" },
  { fr: "préparer le dîner", en: "make dinner" }, { fr: "regarder un film", en: "watch a film" },
] as const;
const MEMO_ROWS = [
  ["je", "vais"], ["tu", "vas"], ["il / elle / on", "va"],
  ["nous", "allons"], ["vous", "allez"], ["ils / elles", "vont"],
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const ne = (form: string) => (/^[aeiou]/.test(form) ? "n'" : "ne ");
const phrase = (disp: string, form: string, neg: boolean) =>
  neg ? `${disp} ${ne(form)}${form} pas` : `${disp} ${form}`;

export const futurProcheLesson: NativeLesson = {
  slug: "futur-proche",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Le futur proche : <em>aller</em> + infinitif
      </h2>
      <table className="w-full max-w-xs border-collapse text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <tbody>
          {MEMO_ROWS.map(([p, f]) => (
            <tr key={p} className="border-t border-[color:var(--cahier-rule)] first:border-t-0">
              <td className="p-1">{p}</td>
              <td className="p-1 font-bold text-[color:var(--cahier-la)]">{f}</td>
              <td className="p-1 italic">+ infinitif</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <i>Je <b>vais</b> faire du sport. · On <b>va</b> partir en vacances.</i>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>The negation wraps <i>aller</i></b>, not the infinitive:{" "}
        <span lang="fr">Je <b>ne</b> vais <b>pas</b> sortir. · Nous <b>n'</b>allons <b>pas</b> travailler.</span>
      </p>
    </div>
  ),
  dice: {
    instruction: "Build the sentence in the futur proche — watch the ✅/🚫 polarity.",
    newQuestion() {
      const s = pick(SUBJECTS), inf = pick(INFS);
      const neg = Math.random() < 0.4;
      const others = sample(ALLER.filter((f) => f !== s.aller), 3);
      return {
        meta: `${s.disp} … (${neg ? "🚫 négatif" : "✅ affirmatif"})`,
        big: inf.fr,
        en: inf.en,
        correct: `${phrase(s.disp, s.aller, neg)} ${inf.fr}.`,
        easyOptions: [s.aller, ...others].map((f) => `${phrase(s.disp, f, neg)} ${inf.fr}.`),
        med: {
          before: neg ? `${s.disp} ${ne(s.aller).trim()}` : s.disp,
          choices: ALLER,
          correct: s.aller,
          after: neg ? `pas ${inf.fr}.` : `${inf.fr}.`,
        },
      };
    },
  },
  bonus: [
    { en: "I am going to do sport.", fr: "Je vais faire du sport." },
    { en: "We are going to go out.", fr: "Nous allons sortir." },
    { en: "She is going to sleep more.", fr: "Elle va dormir plus." },
    { en: "They (m.) are going to study French.", fr: "Ils vont étudier le français." },
    { en: "You (sg.) are going to make dinner.", fr: "Tu vas préparer le dîner." },
    { en: "I am not going to go out tonight.", fr: "Je ne vais pas sortir ce soir." },
    { en: "We are not going to work.", fr: "Nous n'allons pas travailler." },
    { en: "He is not going to quit coffee.", fr: "Il ne va pas arrêter le café." },
    { en: "You (pl.) are going to watch a film.", fr: "Vous allez regarder un film." },
    { en: "They (f.) are not going to run.", fr: "Elles ne vont pas courir." },
  ],
};
