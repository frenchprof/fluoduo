/**
 * Native "Conjugaison" lesson (Unité 2 · L14) — the Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 14-conjugaison-er.html drchan import, as
 * real in-app content following the aimer.tsx template.
 */
import type { NativeLesson } from "./types";

import { CONJUGAISON_ER_AXES, IRR_MEMO, conjugaisonErQuestion } from "./conjugaison-er.gen";

export const conjugaisonErLesson: NativeLesson = {
  slug: "conjugaison-er",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Le présent — verbes en <em>-er</em> + irréguliers
      </h2>
      <p className="text-sm text-[color:var(--cahier-ink)]">
        <b>Stem + ending</b> (<i lang="fr">parler → parl-</i>):{" "}
        <span lang="fr" className="font-bold">je parl<b className="text-[color:var(--gram-neutral)]">e</b> · tu parl<b className="text-[color:var(--gram-neutral)]">es</b> · il parl<b className="text-[color:var(--gram-neutral)]">e</b> · nous parl<b className="text-[color:var(--gram-neutral)]">ons</b> · vous parl<b className="text-[color:var(--gram-neutral)]">ez</b> · ils parl<b className="text-[color:var(--gram-neutral)]">ent</b></span>
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
    newQuestion: conjugaisonErQuestion,
    axes: CONJUGAISON_ER_AXES,
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
