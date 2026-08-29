/**
 * Native "Manger & boire" lesson (Unité 4) — distilled from 20-manger-boire.html:
 * the Mémo + the 🎲 dice trainer + EN→FR bonus, as real in-app content.
 */
import type { NativeLesson } from "./types";

import { MANGER_BOIRE_AXES, MEMO_ROWS, mangerBoireQuestion } from "./manger-boire.gen";

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
            <th className="p-1 text-[color:var(--gram-neutral)]">manger</th>
            <th className="p-1 text-[color:var(--gram-neutral)]">boire</th>
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
    newQuestion: mangerBoireQuestion,
    axes: MANGER_BOIRE_AXES,
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
