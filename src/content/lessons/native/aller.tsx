/**
 * Native "Aller à + lieu" lesson (Unité 2 · L11) — the Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 11-aller-a.html drchan import, as real
 * in-app content following the aimer.tsx template.
 */
import type { NativeLesson } from "./types";

const SUBJECTS: { aff: string; neg: string }[] = [
  { aff: "je vais", neg: "je ne vais pas" },
  { aff: "tu vas", neg: "tu ne vas pas" },
  { aff: "il va", neg: "il ne va pas" },
  { aff: "elle va", neg: "elle ne va pas" },
  { aff: "on va", neg: "on ne va pas" },
  { aff: "nous allons", neg: "nous n'allons pas" },
  { aff: "vous allez", neg: "vous n'allez pas" },
  { aff: "ils vont", neg: "ils ne vont pas" },
  { aff: "elles vont", neg: "elles ne vont pas" },
];

const PLACES: { lieu: string; pre: string; en: string }[] = [
  { lieu: "cinéma", pre: "au", en: "cinema" },
  { lieu: "parc", pre: "au", en: "park" },
  { lieu: "stade", pre: "au", en: "stadium" },
  { lieu: "restaurant", pre: "au", en: "restaurant" },
  { lieu: "café", pre: "au", en: "café" },
  { lieu: "supermarché", pre: "au", en: "supermarket" },
  { lieu: "piscine", pre: "à la", en: "swimming pool" },
  { lieu: "bibliothèque", pre: "à la", en: "library" },
  { lieu: "plage", pre: "à la", en: "beach" },
  { lieu: "montagne", pre: "à la", en: "mountain" },
  { lieu: "école", pre: "à l'", en: "school" },
  { lieu: "église", pre: "à l'", en: "church" },
  { lieu: "magasins", pre: "aux", en: "shops" },
  { lieu: "toilettes", pre: "aux", en: "toilets" },
  { lieu: "ville", pre: "en", en: "town" },
  { lieu: "médecin", pre: "chez le", en: "doctor" },
  { lieu: "coiffeur", pre: "chez le", en: "hairdresser" },
  { lieu: "ami", pre: "chez un", en: "a friend's place" },
  { lieu: "moi", pre: "chez", en: "my place" },
];

const CONTRACTIONS = ["au", "à la", "à l'", "aux"];
/** Plausible near-miss prepositions per correct form. */
const ALT: Record<string, string[]> = {
  "au": CONTRACTIONS, "à la": CONTRACTIONS, "à l'": CONTRACTIONS, "aux": CONTRACTIONS,
  "en": ["en", "à la", "au", "aux"],
  "chez le": ["chez le", "au", "à la", "chez"],
  "chez un": ["chez un", "à l'", "au", "chez"],
  "chez": ["chez", "chez le", "à", "au"],
};

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const pp = (pre: string, lieu: string) => pre + (pre.endsWith("'") ? "" : " ") + lieu;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const allerLesson: NativeLesson = {
  slug: "aller",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Aller à + <em>lieu</em>
      </h2>
      <p className="text-sm font-bold text-[color:var(--cahier-ink)]" lang="fr">
        je vais · tu vas · il/elle va · nous allons · vous allez · ils/elles vont
      </p>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>à + le → <b className="text-lg text-[color:var(--cahier-la)]">au</b> — <i lang="fr">Je vais au cinéma.</i></li>
        <li>à + la → <b className="text-lg text-[color:var(--cahier-la)]">à la</b> — <i lang="fr">Elle va à la piscine.</i></li>
        <li>à + l&rsquo; → <b className="text-lg text-[color:var(--cahier-la)]">à l&rsquo;</b> — <i lang="fr">Il va à l&rsquo;école.</i></li>
        <li>à + les → <b className="text-lg text-[color:var(--cahier-la)]">aux</b> — <i lang="fr">Nous allons aux magasins.</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>The contraction is obligatory</b> — never <i lang="fr">*à le</i> / <i lang="fr">*à les</i>, and no <i lang="fr">*al</i> form: <span lang="fr">à l&rsquo;école stays <b>à l&rsquo;</b></span>.
      </p>
      <p className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        {["en ville", "chez moi", "chez un ami", "chez le médecin"].map((s) => (
          <span key={s} lang="fr" className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5">{s}</span>
        ))}
      </p>
    </div>
  ),
  dice: {
    instruction: "Conjugate aller and contract à + article for the place.",
    newQuestion() {
      const s = pick(SUBJECTS), p = pick(PLACES);
      const neg = Math.random() < 0.35;
      const sv = cap(neg ? s.neg : s.aff);
      const alts = ALT[p.pre];
      return {
        meta: `${sv} … (${neg ? "don't/doesn't go" : "go/goes"})`,
        big: p.lieu,
        en: p.en,
        correct: `${sv} ${pp(p.pre, p.lieu)}.`,
        easyOptions: alts.map((a) => `${sv} ${pp(a, p.lieu)}.`),
        med: { before: sv, choices: [...alts], correct: p.pre, after: `${p.lieu}.` },
      };
    },
  },
  bonus: [
    { en: "I go to the cinema.", fr: "Je vais au cinéma." },
    { en: "She goes to the swimming pool.", fr: "Elle va à la piscine." },
    { en: "We go to the shops.", fr: "Nous allons aux magasins." },
    { en: "He goes to school.", fr: "Il va à l'école." },
    { en: "They go to the beach.", fr: "Ils vont à la plage." },
    { en: "You (sg.) go to the park.", fr: "Tu vas au parc." },
    { en: "You (pl.) go to town.", fr: "Vous allez en ville." },
    { en: "She doesn't go to the library.", fr: "Elle ne va pas à la bibliothèque." },
    { en: "I don't go to the restaurant.", fr: "Je ne vais pas au restaurant." },
    { en: "We go to the stadium.", fr: "Nous allons au stade." },
  ],
};
