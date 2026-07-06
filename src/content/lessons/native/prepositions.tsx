/**
 * Native "Prépositions : pays & villes" lesson (Unité 3, L17 — SIO-032).
 * COUNTRIES & CITIES ONLY (Dan, 2026-07-06): à + city, en/au/aux + country,
 * and their de/du/des/d' origins. Town places live in the separate
 * "prepositions-lieux" lesson (SIO-033).
 */
import type { NativeLesson } from "./types";
import { GEOS, buildDice } from "./prepositions-core";

export const prepositionsLesson: NativeLesson = {
  slug: "prepositions",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-1 text-lg font-black text-[color:var(--cahier-ink)]">
        Où je vais ↔ D&rsquo;où je viens
      </h2>
      <p className="mb-3 text-sm text-[color:var(--cahier-ink-soft)]">
        You already know the article (<span lang="fr">la France, le Japon, les États-Unis</span>).
        This lesson is only about the <b>pair</b>: how to say <b>going to</b> vs <b>coming from</b> — one contrast per country type.
      </p>
      {/* The five contrasts, front and centre — this is the whole lesson. */}
      <div className="mb-3 flex flex-wrap gap-1.5" lang="fr">
        {[["à", "de", "Paris"], ["en", "de", "France"], ["au", "du", "Japon"], ["en", "d’", "Inde"], ["aux", "des", "États-Unis"]].map(([to, from, ex]) => (
          <span key={ex} className="rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-2 py-1 text-sm font-black text-[color:var(--cahier-ink)]">
            <span className="text-[color:var(--cahier-la)]">{to}</span> ↔ <span className="text-[color:var(--cahier-la)]">{from}</span>
            <span className="ml-1 text-xs font-semibold text-[color:var(--cahier-ink-soft)]">{ex}</span>
          </span>
        ))}
      </div>
      <table className="w-full border-collapse text-[15px] text-[color:var(--cahier-ink)]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
            <th className="p-1"></th>
            <th className="p-1" lang="fr">→ je vais… (to)</th>
            <th className="p-1" lang="fr">← je viens… (from)</th>
          </tr>
        </thead>
        <tbody lang="fr">
          <tr><td className="p-1">ville — Paris</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">à Paris</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">de Paris</td></tr>
          <tr><td className="p-1">fém. — la France</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">en France</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">de France</td></tr>
          <tr><td className="p-1">masc. — le Japon</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">au Japon</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">du Japon</td></tr>
          <tr><td className="p-1">pluriel — les États-Unis</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">aux États-Unis</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">des États-Unis</td></tr>
          <tr><td className="p-1">voyelle — l&rsquo;Inde</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">en Inde</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">d&rsquo;Inde</td></tr>
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Feminine &amp; vowel countries drop the article:</b>{" "}
        <span lang="fr"><b>en</b> France → <b>de</b> France</span> (not <i lang="fr">de la</i>),{" "}
        <span lang="fr"><b>en</b> Inde → <b>d&rsquo;</b>Inde</span> (not <i lang="fr">de l&rsquo;</i>).
      </p>
    </div>
  ),
  dice: buildDice({
    dests: GEOS,
    toChoices: ["à", "en", "au", "aux"],
    fromChoices: ["de", "du", "des", "d'"],
    instruction: "Choose the right preposition for the country or city.",
  }),
  bonus: [
    { en: "We are going to France.", fr: "Nous allons en France." },
    { en: "You (sg.) are going to Japan.", fr: "Tu vas au Japon." },
    { en: "They (m.) are going to the United States.", fr: "Ils vont aux États-Unis." },
    { en: "She is going to China.", fr: "Elle va en Chine." },
    { en: "I'm going to Paris.", fr: "Je vais à Paris." },
    { en: "I come from Germany.", fr: "Je viens d'Allemagne." },
    { en: "He comes from Canada.", fr: "Il vient du Canada." },
    { en: "We come from the Netherlands.", fr: "Nous venons des Pays-Bas." },
    { en: "I come from Paris.", fr: "Je viens de Paris." },
    { en: "She comes from Spain.", fr: "Elle vient d'Espagne." },
  ],
};
