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
  formLayout: "table",
  // TIER 2 CONCEPT — a question the WORD LIST cannot answer. Lifted from the
  // Mémo below; no grammar introduced that it does not teach. DRAFTED —
  // `contrast` and `remember` are the pedagogical claim and go to Dan first.
  concept: {
    subtitle: "Why only some articles contract",
    contrast: (
      <>
        English says <i>to the museum</i> and <i>to the station</i> with the same two
        words every time. French fuses the preposition with{" "}
        <i lang="fr">le</i> and <i lang="fr">les</i> — <i lang="fr">au musée</i>,{" "}
        <i lang="fr">aux magasins</i> — but leaves <i lang="fr">la</i> and{" "}
        <i lang="fr">l&rsquo;</i> untouched.
      </>
    ),
    question: (
      <>
        Why <i lang="fr">au musée</i> but <i lang="fr">à la gare</i>?
      </>
    ),
    answer: (
      <>
        Because <i lang="fr">à + le</i> contracts to <i lang="fr">au</i>, while{" "}
        <i lang="fr">à + la</i> does not contract at all. The gender of the place decides
        it, and the same pairing works for <i lang="fr">de</i>.
      </>
    ),
    pitfall: [
      { label: <>masculine</>, wrong: <i lang="fr">à le musée</i>, right: <i lang="fr">au musée</i> },
      { label: <>plural</>, wrong: <i lang="fr">à les magasins</i>, right: <i lang="fr">aux magasins</i> },
      { label: <>feminine</>, wrong: <i lang="fr">au gare</i>, right: <i lang="fr">à la gare</i> },
    ],
    flow: [
      { depth: 0, text: "Which article does the place take?" },
      { depth: 1, text: "le  → au   / du" },
      { depth: 1, text: "les → aux  / des" },
      { depth: 1, text: "la  → à la / de la   (no change)" },
      { depth: 1, text: "l'  → à l' / de l'   (no change)" },
    ],
    check: [
      {
        q: <>Coming <i>from</i> the shops?</>,
        a: <><i lang="fr">des magasins</i> — <i lang="fr">de + les</i> contracts the same way.</>,
      },
      {
        q: <>Why does <i lang="fr">à l&rsquo;école</i> not contract?</>,
        a: <>Only <i lang="fr">le</i> and <i lang="fr">les</i> contract. <i lang="fr">L&rsquo;</i> never does.</>,
      },
    ],
    inShort: (
      <>
        <i lang="fr">à+le=au</i> · <i lang="fr">à+les=aux</i> ·{" "}
        <i lang="fr">de+le=du</i> · <i lang="fr">de+les=des</i>
      </>
    ),
    remember: (
      <>
        Only <i lang="fr">le</i> and <i lang="fr">les</i> contract.{" "}
        <i lang="fr">La</i> and <i lang="fr">l&rsquo;</i> never do.
      </>
    ),
  },
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
