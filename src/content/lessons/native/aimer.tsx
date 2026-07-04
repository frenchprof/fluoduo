/**
 * Native "Aimer + le / la / les" lesson (Unité 2) — the value-add distilled from
 * the 282KB drchan import: the Mémo + the 🎲 dice trainer + EN→FR bonus, as real
 * in-app content (Dan, 2026-07-03: "native in CahierShell"). Supersedes the
 * 08-aimer-lite.html pilot.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const VERBS = [
  { stem: "aim", en: "like" }, { stem: "ador", en: "love" }, { stem: "détest", en: "hate" },
] as const;
const NOUNS: { fr: string; art: "le" | "la" | "l'" | "les"; en: string }[] = [
  { fr: "sport", art: "le", en: "sport" }, { fr: "football", art: "le", en: "football" },
  { fr: "tennis", art: "le", en: "tennis" }, { fr: "yoga", art: "le", en: "yoga" },
  { fr: "piano", art: "le", en: "piano" }, { fr: "cinéma", art: "le", en: "cinema" },
  { fr: "chant", art: "le", en: "singing" }, { fr: "danse", art: "la", en: "dance" },
  { fr: "natation", art: "la", en: "swimming" }, { fr: "musique", art: "la", en: "music" },
  { fr: "lecture", art: "la", en: "reading" }, { fr: "boxe", art: "la", en: "boxing" },
  { fr: "art", art: "l'", en: "art" }, { fr: "athlétisme", art: "l'", en: "athletics" },
  { fr: "escalade", art: "l'", en: "climbing" }, { fr: "équitation", art: "l'", en: "horse-riding" },
  { fr: "films", art: "les", en: "films" }, { fr: "livres", art: "les", en: "books" },
  { fr: "concerts", art: "les", en: "concerts" },
];
const ARTS = ["le", "la", "l'", "les"];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const np = (art: string, fr: string) => art + (art === "l'" ? "" : " ") + fr;
function subjVerb(s: (typeof SUBJECTS)[number], v: (typeof VERBS)[number]): string {
  const c = v.stem + END[s.slot];
  return s.slot === "je" && /^[aeiouéèêh]/i.test(c) ? `J'${c}` : `${s.disp} ${c}`;
}

export const aimerLesson: NativeLesson = {
  slug: "aimer",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Aimer, adorer, détester + <em>toute la catégorie</em>
      </h2>
      <p className="text-sm text-[color:var(--cahier-ink)]">
        With verbs of preference you talk about the thing <b>in general</b> — so the article is <b>definite</b>:
      </p>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--cahier-la)]">le</b> + masculin — <i lang="fr">J&rsquo;aime le sport.</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">la</b> + féminin — <i lang="fr">J&rsquo;adore la musique.</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">l&rsquo;</b> + voyelle — <i lang="fr">J&rsquo;aime l&rsquo;art.</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">les</b> + pluriel — <i lang="fr">Je déteste les films d&rsquo;horreur.</i></li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Even in the negative the article stays le / la / les</b> (it does <u>not</u> become <i>de</i> — that&rsquo;s the partitive):{" "}
        <span lang="fr">J&rsquo;aime <u>le</u> sport → Je n&rsquo;aime <b>pas le</b> sport.</span>
      </p>
      <p className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        {["je déteste 💔", "je n'aime pas 🤍", "j'aime bien 🙂", "j'aime ❤️", "j'adore ❤️❤️"].map((s) => (
          <span key={s} className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5">{s}</span>
        ))}
      </p>
    </div>
  ),
  dice: {
    instruction: "Choose the right definite article for the thing liked.",
    newQuestion() {
      const s = pick(SUBJECTS), v = pick(VERBS), n = pick(NOUNS);
      const sv = subjVerb(s, v);
      return {
        meta: `${sv} … (${v.en})`,
        big: n.fr,
        en: n.en,
        correct: `${sv} ${np(n.art, n.fr)}.`,
        easyOptions: ARTS.map((a) => `${sv} ${np(a, n.fr)}.`),
        med: { before: sv, choices: ARTS, correct: n.art, after: `${n.fr}.` },
      };
    },
  },
  bonus: [
    { en: "I like sport.", fr: "J'aime le sport." },
    { en: "She loves music.", fr: "Elle adore la musique." },
    { en: "We hate films.", fr: "Nous détestons les films." },
    { en: "I love art.", fr: "J'adore l'art." },
    { en: "He doesn't like tennis.", fr: "Il n'aime pas le tennis." },
    { en: "They (m.) love reading.", fr: "Ils adorent la lecture." },
    { en: "You (sg.) hate boxing.", fr: "Tu détestes la boxe." },
    { en: "I don't like books.", fr: "Je n'aime pas les livres." },
    { en: "You (pl.) love the piano.", fr: "Vous adorez le piano." },
    { en: "She doesn't like athletics.", fr: "Elle n'aime pas l'athlétisme." },
  ],
};
