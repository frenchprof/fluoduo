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
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Pays &amp; villes : à / en (destination) &amp; de (origine)
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
          <tr><td className="p-1">ville — Paris</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">à Paris</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">de Paris</td></tr>
          <tr><td className="p-1">pays fém. — la France</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">en France</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">de France</td></tr>
          <tr><td className="p-1">pays masc. — le Japon</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">au Japon</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">du Japon</td></tr>
          <tr><td className="p-1">pays pluriel — les États-Unis</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">aux États-Unis</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">des États-Unis</td></tr>
          <tr><td className="p-1">pays à voyelle — l&rsquo;Inde</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">en Inde</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">d&rsquo;Inde</td></tr>
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
