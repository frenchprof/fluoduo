/**
 * Native "Manger & boire" lesson (Unité 4) — distilled from 20-manger-boire.html:
 * the Mémo + the 🎲 dice trainer + EN→FR bonus, as real in-app content.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
type Verb = {
  name: string;
  en: string;
  forms: Record<"je" | "tu" | "il" | "nous" | "vous" | "ils", string>;
  comps: readonly { fr: string; en: string }[];
};
const VERBS: readonly Verb[] = [
  {
    name: "manger", en: "eat",
    forms: { je: "mange", tu: "manges", il: "mange", nous: "mangeons", vous: "mangez", ils: "mangent" },
    comps: [
      { fr: "du pain", en: "bread" }, { fr: "de la salade", en: "salad" },
      { fr: "des œufs", en: "eggs" }, { fr: "de la viande", en: "meat" },
      { fr: "du fromage", en: "cheese" }, { fr: "des frites", en: "fries" },
    ],
  },
  {
    name: "boire", en: "drink",
    forms: { je: "bois", tu: "bois", il: "boit", nous: "buvons", vous: "buvez", ils: "boivent" },
    comps: [
      { fr: "du café", en: "coffee" }, { fr: "de l'eau", en: "water" },
      { fr: "du lait", en: "milk" }, { fr: "du jus", en: "juice" }, { fr: "du thé", en: "tea" },
    ],
  },
];
const SLOTS = ["je", "tu", "il", "nous", "vous", "ils"] as const;
const MEMO_ROWS = [
  ["je", "mange", "bois"], ["tu", "manges", "bois"], ["il / elle / on", "mange", "boit"],
  ["nous", "mangeons", "buvons"], ["vous", "mangez", "buvez"], ["ils / elles", "mangent", "boivent"],
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function uniqueForms(v: Verb): string[] {
  const out: string[] = [];
  for (const k of SLOTS) if (!out.includes(v.forms[k])) out.push(v.forms[k]);
  return out;
}

export const mangerBoireLesson: NativeLesson = {
  slug: "manger-boire",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Manger &amp; boire <em>au présent</em>
      </h2>
      <table className="w-full border-collapse text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <thead>
          <tr className="text-left">
            <th className="p-1" />
            <th className="p-1 text-[color:var(--cahier-la)]">manger</th>
            <th className="p-1 text-[color:var(--cahier-la)]">boire</th>
          </tr>
        </thead>
        <tbody>
          {MEMO_ROWS.map(([p, m, b]) => (
            <tr key={p} className="border-t border-[color:var(--cahier-rule)]">
              <td className="p-1">{p}</td>
              <td className="p-1 font-bold">{m}</td>
              <td className="p-1 font-bold">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>-ger</b> keeps the <b>e</b>: <span lang="fr">nous mange<u>ons</u></span> ·{" "}
        <b lang="fr">boire</b> is irregular — <span lang="fr">boi-</span>, but{" "}
        <span lang="fr"><b>buv-</b> (nous, vous)</span> and <span lang="fr"><b>boiv-</b> (ils, elles)</span>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Conjugate the verb for the given subject: subject + verb + food/drink.",
    newQuestion() {
      const s = pick(SUBJECTS), v = pick(VERBS), c = pick(v.comps);
      const form = v.forms[s.slot];
      const forms = uniqueForms(v);
      return {
        meta: `${s.disp} … · ${v.name} (${v.en})`,
        big: c.fr,
        en: c.en,
        correct: `${s.disp} ${form} ${c.fr}.`,
        easyOptions: forms.map((f) => `${s.disp} ${f} ${c.fr}.`),
        med: { before: s.disp, choices: forms, correct: form, after: `${c.fr}.` },
      };
    },
  },
  bonus: [
    { en: "I eat some bread.", fr: "Je mange du pain." },
    { en: "She drinks some water.", fr: "Elle boit de l'eau." },
    { en: "We eat a salad.", fr: "Nous mangeons une salade." },
    { en: "We drink some coffee.", fr: "Nous buvons du café." },
    { en: "They (m.) drink some milk.", fr: "Ils boivent du lait." },
    { en: "You (pl.) eat some cheese.", fr: "Vous mangez du fromage." },
    { en: "He drinks some tea.", fr: "Il boit du thé." },
    { en: "You (sg.) eat some eggs.", fr: "Tu manges des œufs." },
    { en: "They (f.) eat some fries.", fr: "Elles mangent des frites." },
    { en: "I drink some juice.", fr: "Je bois du jus." },
  ],
};
