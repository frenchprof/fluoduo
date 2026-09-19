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
  formLayout: "table",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-1 text-lg font-black text-[color:var(--cahier-ink)]">
        Où je vais ↔ D&rsquo;où je viens
      </h2>
      <p className="mb-3 text-sm text-[color:var(--cahier-ink-soft)]">
        There are <b>two sets</b> of prepositions — pick from one depending on the direction:
      </p>
      {/* The two SETS, front and centre — this is the whole lesson. */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2" lang="fr">
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3">
          <p className="text-xs font-black uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">📍 at / to <span className="normal-case">(je suis / je vais…)</span></p>
          <p className="mt-1 text-lg font-black text-[color:var(--gram-neutral)]">à · en · au · aux</p>
        </div>
        <div className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3">
          <p className="text-xs font-black uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">↩️ of / from <span className="normal-case">(je viens…)</span></p>
          <p className="mt-1 text-lg font-black text-[color:var(--gram-neutral)]">de · d&rsquo; · du · des</p>
        </div>
      </div>
      <p className="mb-2 text-sm text-[color:var(--cahier-ink-soft)]">Which form, by the place — one from each set:</p>
      <table className="w-full border-collapse text-[15px] text-[color:var(--cahier-ink)]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
            <th className="p-1">place</th>
            <th className="p-1" lang="fr">at / to →</th>
            <th className="p-1" lang="fr">of / from ←</th>
          </tr>
        </thead>
        <tbody lang="fr">
          <tr><td className="p-1">ville — Paris</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">à Paris</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">de Paris</td></tr>
          <tr><td className="p-1">fém. — France</td><td className="p-1 font-bold text-[color:var(--gram-fem)]">en France</td><td className="p-1 font-bold text-[color:var(--gram-fem)]">de France</td></tr>
          <tr><td className="p-1">masc. — Japon</td><td className="p-1 font-bold text-[color:var(--gram-masc)]">au Japon</td><td className="p-1 font-bold text-[color:var(--gram-masc)]">du Japon</td></tr>
          <tr><td className="p-1">pluriel — États-Unis</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">aux États-Unis</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">des États-Unis</td></tr>
          <tr><td className="p-1">voyelle — Inde</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">en Inde</td><td className="p-1 font-bold text-[color:var(--gram-neutral)]">d&rsquo;Inde</td></tr>
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Feminine &amp; vowel countries drop the article:</b>{" "}
        <span lang="fr"><b>en</b> France → <b>de</b> France</span> (not <i lang="fr">de la</i>),{" "}
        <span lang="fr"><b>en</b> Inde → <b>d&rsquo;</b>Inde</span> (not <i lang="fr">de l&rsquo;</i>).
      </p>
    </div>
  ),
  // TIER 1 · stop 32. The claim ABOVE stops 26 and 35: two parallel sets, and
  // the DIRECTION picks the set before the place picks the form. Without that,
  // a learner has eight unrelated words instead of two systems of four.
  concept: {
    subtitle: "Why direction comes before the place",
    contrast: (
      <>
        English uses one preposition for going and another for coming, and neither depends on
        the place: <i>to Paris</i>, <i>from Paris</i>. French has <b>two sets of four</b>, and
        you choose the set by direction before the place chooses the form.
      </>
    ),
    question: (
      <>
        You know the place is <i lang="fr">le Japon</i>. Is that enough to pick the word?
      </>
    ),
    answer: (
      <>
        No &mdash; you need the direction first. Going there is{" "}
        <i lang="fr">au Japon</i>; coming from there is <i lang="fr">du Japon</i>. The place
        tells you <i>which of the four</i>; only the direction tells you{" "}
        <i>which set of four</i>.
      </>
    ),
    flow: [
      { depth: 0, text: "Going or coming?" },
      { depth: 1, text: "going → à · en · au · aux" },
      { depth: 1, text: "coming → de · d' · du · des" },
      { depth: 0, text: "Then the place picks the form." },
    ],
    pitfallHeads: ["place only", "direction, then place"],
    pitfall: [
      { label: <>to Paris</>, wrong: <><i lang="fr">de Paris</i></>, right: <><i lang="fr">&agrave; Paris</i></> },
      { label: <>from France</>, wrong: <><i lang="fr">en France</i></>, right: <><i lang="fr">de France</i></> },
    ],
    check: [
      { q: <>You are coming from Portugal &mdash; <i lang="fr">le Portugal</i>.</>,
        a: <><i lang="fr">Je viens du Portugal.</i> Coming, so the second set; masculine, so <i lang="fr">du</i>.</> },
      { q: <>Why is knowing the gender not enough?</>,
        a: <>It picks the form within a set. It cannot pick the set.</> },
    ],
    remember: (
      <>
        Two questions, in order: which direction, then which place. The gender only answers
        the second.
      </>
    ),
  },
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
