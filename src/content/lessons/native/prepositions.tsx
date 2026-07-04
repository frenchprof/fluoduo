/**
 * Native "Prépositions : à & de (lieux et pays)" lesson (Unité 3, L17) —
 * Mémo + 🎲 dice trainer + EN→FR bonus distilled from the
 * 17-prepositions.html drchan import.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const ALLER: Record<string, string> = { je: "vais", tu: "vas", il: "va", nous: "allons", vous: "allez", ils: "vont" };
const VENIR: Record<string, string> = { je: "viens", tu: "viens", il: "vient", nous: "venons", vous: "venez", ils: "viennent" };

type Dest =
  | { kind: "place"; fr: string; art: "le" | "la" | "l'" | "les"; en: string }
  | { kind: "geo"; fr: string; type: "city" | "fem" | "masc" | "plur" | "vowel"; en: string };

const PLACES: Dest[] = [
  { kind: "place", fr: "cinéma", art: "le", en: "the cinema" },
  { kind: "place", fr: "marché", art: "le", en: "the market" },
  { kind: "place", fr: "musée", art: "le", en: "the museum" },
  { kind: "place", fr: "restaurant", art: "le", en: "the restaurant" },
  { kind: "place", fr: "maison", art: "la", en: "the house" },
  { kind: "place", fr: "boulangerie", art: "la", en: "the bakery" },
  { kind: "place", fr: "bibliothèque", art: "la", en: "the library" },
  { kind: "place", fr: "gare", art: "la", en: "the station" },
  { kind: "place", fr: "école", art: "l'", en: "school" },
  { kind: "place", fr: "hôpital", art: "l'", en: "the hospital" },
  { kind: "place", fr: "aéroport", art: "l'", en: "the airport" },
  { kind: "place", fr: "université", art: "l'", en: "the university" },
  { kind: "place", fr: "magasins", art: "les", en: "the shops" },
  { kind: "place", fr: "toilettes", art: "les", en: "the toilets" },
];
const GEOS: Dest[] = [
  { kind: "geo", fr: "Paris", type: "city", en: "Paris" },
  { kind: "geo", fr: "Lyon", type: "city", en: "Lyon" },
  { kind: "geo", fr: "Rome", type: "city", en: "Rome" },
  { kind: "geo", fr: "Londres", type: "city", en: "London" },
  { kind: "geo", fr: "Singapour", type: "city", en: "Singapore" },
  { kind: "geo", fr: "France", type: "fem", en: "France" },
  { kind: "geo", fr: "Espagne", type: "fem", en: "Spain" },
  { kind: "geo", fr: "Chine", type: "fem", en: "China" },
  { kind: "geo", fr: "Suisse", type: "fem", en: "Switzerland" },
  { kind: "geo", fr: "Japon", type: "masc", en: "Japan" },
  { kind: "geo", fr: "Brésil", type: "masc", en: "Brazil" },
  { kind: "geo", fr: "Canada", type: "masc", en: "Canada" },
  { kind: "geo", fr: "Mexique", type: "masc", en: "Mexico" },
  { kind: "geo", fr: "Allemagne", type: "vowel", en: "Germany" },
  { kind: "geo", fr: "Inde", type: "vowel", en: "India" },
  { kind: "geo", fr: "États-Unis", type: "plur", en: "the United States" },
  { kind: "geo", fr: "Pays-Bas", type: "plur", en: "the Netherlands" },
];
const DESTS: Dest[] = [...PLACES, ...GEOS];

const TO_PLACE: Record<string, string> = { le: "au", la: "à la", "l'": "à l'", les: "aux" };
const FROM_PLACE: Record<string, string> = { le: "du", la: "de la", "l'": "de l'", les: "des" };
const TO_GEO: Record<string, string> = { city: "à", fem: "en", vowel: "en", masc: "au", plur: "aux" };
const FROM_GEO: Record<string, string> = { city: "de", fem: "de", vowel: "d'", masc: "du", plur: "des" };
const TO_CHOICES = ["à", "à la", "à l'", "au", "aux", "en"];
const FROM_CHOICES = ["de", "de la", "de l'", "du", "des", "d'"];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const pp = (prep: string, fr: string) => prep + (prep.endsWith("'") ? "" : " ") + fr;
const prepFor = (d: Dest, dir: "to" | "from"): string =>
  d.kind === "place"
    ? (dir === "to" ? TO_PLACE : FROM_PLACE)[d.art]
    : (dir === "to" ? TO_GEO : FROM_GEO)[d.type];

export const prepositionsLesson: NativeLesson = {
  slug: "prepositions",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        À (destination) &amp; de (origine)
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
          <tr><td className="p-1">le musée</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">au musée</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">du musée</td></tr>
          <tr><td className="p-1">la gare</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">à la gare</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">de la gare</td></tr>
          <tr><td className="p-1">l&rsquo;école</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">à l&rsquo;école</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">de l&rsquo;école</td></tr>
          <tr><td className="p-1">les toilettes</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">aux toilettes</td><td className="p-1 font-bold text-[color:var(--cahier-la)]">des toilettes</td></tr>
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
  dice: {
    instruction: "Choose the right preposition for the destination or origin.",
    newQuestion() {
      const s = pick(SUBJECTS);
      const dir = pick(["to", "from"] as const);
      const d = pick(DESTS);
      const sv = `${s.disp} ${(dir === "to" ? ALLER : VENIR)[s.slot]}`;
      const prep = prepFor(d, dir);
      const choices = dir === "to" ? TO_CHOICES : FROM_CHOICES;
      const wrong = choices.filter((c) => c !== prep).sort(() => Math.random() - 0.5).slice(0, 3);
      return {
        meta: `${sv} … (${dir === "to" ? "go to" : "come from"})`,
        big: d.fr,
        en: d.en,
        correct: `${sv} ${pp(prep, d.fr)}.`,
        easyOptions: [prep, ...wrong].map((c) => `${sv} ${pp(c, d.fr)}.`),
        med: { before: sv, choices, correct: prep, after: `${d.fr}.` },
      };
    },
  },
  bonus: [
    { en: "I'm going to the cinema.", fr: "Je vais au cinéma." },
    { en: "She is coming from the market.", fr: "Elle vient du marché." },
    { en: "We are going to school.", fr: "Nous allons à l'école." },
    { en: "You (pl.) are going to the shops.", fr: "Vous allez aux magasins." },
    { en: "I come from Paris.", fr: "Je viens de Paris." },
    { en: "We are going to France.", fr: "Nous allons en France." },
    { en: "You (sg.) are going to Japan.", fr: "Tu vas au Japon." },
    { en: "They (m.) are going to the United States.", fr: "Ils vont aux États-Unis." },
    { en: "I come from Germany.", fr: "Je viens d'Allemagne." },
    { en: "She is going to the library.", fr: "Elle va à la bibliothèque." },
  ],
};
