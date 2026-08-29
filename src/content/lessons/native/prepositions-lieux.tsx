/**
 * Native "Prépositions : en ville" lesson (Unité 3 — SIO-033). PLACES IN TOWN
 * ONLY (Dan, 2026-07-06): article contraction with le/la/l'/les —
 * au / à la / à l' / aux (destination) and du / de la / de l' / des (origin).
 * Countries & cities live in the separate "prepositions" lesson (SIO-032).
 */
import type { NativeLesson } from "./types";
import { PLACES, buildDice } from "./prepositions-core";

export const prepositionsLieuxLesson: NativeLesson = {
  slug: "prepositions-lieux",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        En ville : à / de + le · la · l&rsquo; · les
      </h2>
      <table className="w-full border-collapse text-[15px] text-[color:var(--cahier-ink)]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
            <th className="p-1"></th>
            <th className="p-1" lang="fr">→ je vais…</th>
            <th className="p-1" lang="fr">← je viens…</th>
          </tr>
        </thead>
        <tbody lang="fr">
          <tr><td className="p-1">le musée</td><td className="p-1 font-bold text-[color:var(--gram-masc)]">au musée</td><td className="p-1 font-bold text-[color:var(--gram-masc)]">du musée</td></tr>
          <tr><td className="p-1">la gare</td><td className="p-1 font-bold text-[color:var(--gram-fem)]">à la gare</td><td className="p-1 font-bold text-[color:var(--gram-fem)]">de la gare</td></tr>
          <tr><td className="p-1">l&rsquo;école</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">à l&rsquo;école</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">de l&rsquo;école</td></tr>
          <tr><td className="p-1">les magasins</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">aux magasins</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">des magasins</td></tr>
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>The article contracts with à and de:</b>{" "}
        <span lang="fr"><b>à + le</b> = au</span>, <span lang="fr"><b>à + les</b> = aux</span>,{" "}
        <span lang="fr"><b>de + le</b> = du</span>, <span lang="fr"><b>de + les</b> = des</span>.{" "}
        <span lang="fr">la</span> and <span lang="fr">l&rsquo;</span> never contract:{" "}
        <span lang="fr">à la gare</span>, <span lang="fr">de l&rsquo;école</span>.
      </p>
    </div>
  ),
  dice: buildDice({
    dests: PLACES,
    toChoices: ["au", "à la", "à l'", "aux"],
    fromChoices: ["du", "de la", "de l'", "des"],
    instruction: "Choose the right preposition for the place in town.",
  }),
  bonus: [
    { en: "I'm going to the cinema.", fr: "Je vais au cinéma." },
    { en: "She is coming from the market.", fr: "Elle vient du marché." },
    { en: "We are going to school.", fr: "Nous allons à l'école." },
    { en: "You (pl.) are going to the shops.", fr: "Vous allez aux magasins." },
    { en: "He is at the bakery.", fr: "Il est à la boulangerie." },
    { en: "She is going to the library.", fr: "Elle va à la bibliothèque." },
    { en: "I come from the hospital.", fr: "Je viens de l'hôpital." },
    { en: "They (m.) come from the station.", fr: "Ils viennent de la gare." },
    { en: "We are going to the pharmacy.", fr: "Nous allons à la pharmacie." },
    { en: "You (sg.) come from the park.", fr: "Tu viens du parc." },
  ],
};
