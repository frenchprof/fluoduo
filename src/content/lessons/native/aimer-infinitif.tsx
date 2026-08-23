/**
 * Native "Aimer + infinitif" lesson (Unité 2, L10) — Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 10-aimer-infinitif.html drchan import.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "Nous", slot: "nous" }, { disp: "Vous", slot: "vous" },
  { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const VERBS = [
  { stem: "aim", en: "like", neg: false }, { stem: "ador", en: "love", neg: false },
  { stem: "détest", en: "hate", neg: false }, { stem: "aim", en: "don't like", neg: true },
] as const;
const ACTIVITIES: { fr: string; en: string; noun: string; faire: string | null }[] = [
  { fr: "lire", en: "read", noun: "la lecture", faire: null },
  { fr: "cuisiner", en: "cook", noun: "la cuisine", faire: "faire de la cuisine" },
  { fr: "voyager", en: "travel", noun: "les voyages", faire: "faire des voyages" },
  { fr: "chanter", en: "sing", noun: "le chant", faire: "faire du chant" },
  { fr: "danser", en: "dance", noun: "la danse", faire: "faire de la danse" },
  { fr: "dessiner", en: "draw", noun: "le dessin", faire: "faire du dessin" },
  { fr: "nager", en: "swim", noun: "la natation", faire: "faire de la natation" },
  { fr: "courir", en: "run", noun: "la course à pied", faire: "faire de la course à pied" },
  { fr: "regarder la télé", en: "watch TV", noun: "la télévision", faire: null },
  { fr: "écouter de la musique", en: "listen to music", noun: "la musique", faire: "faire de la musique" },
  { fr: "sortir", en: "go out", noun: "les sorties", faire: null },
  { fr: "dormir", en: "sleep", noun: "le sommeil", faire: null },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
/** Conjugated subject + verb, with J'/n' elision (aime/adore start with a vowel). */
function subjVerb(s: (typeof SUBJECTS)[number], v: (typeof VERBS)[number]): string {
  const c = v.stem + END[s.slot];
  if (v.neg) return `${s.disp} n'${c} pas`; // only "ne pas aimer": aime → n'aime pas
  return s.slot === "je" && /^[aeiouéèêh]/i.test(c) ? `J'${c}` : `${s.disp} ${c}`;
}

export const aimerInfinitifLesson: NativeLesson = {
  slug: "aimer-infinitif",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Aimer + <em>infinitif</em>
      </h2>
      <p className="text-sm text-[color:var(--cahier-ink)]">
        <span lang="fr">[sujet] + [aimer / adorer / détester conjugué] + <b>infinitif</b></span>
      </p>
      <ul className="mt-2 space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--gram-neutral)]">aimer + infinitif</b> — <i lang="fr">J&rsquo;aime danser.</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">aimer + nom</b> — <i lang="fr">J&rsquo;aime la danse.</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">aimer + faire de + nom</b> — <i lang="fr">J&rsquo;aime faire de la danse.</i></li>
      </ul>
      <p className="mt-2 text-sm text-[color:var(--cahier-ink)]" lang="fr">
        j&rsquo;aime · tu aimes · il/elle aime · nous aimons · vous aimez · ils/elles aiment — négatif : je <b>n&rsquo;</b>aime <b>pas</b>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Only the first verb is conjugated — the second stays in the infinitive:</b>{" "}
        <span lang="fr">Elle adore nag<b>er</b></span> (not <span lang="fr">Elle adore nage</span>).
      </p>
    </div>
  ),
  dice: {
    instruction: "Build the sentence with aimer + infinitive (not the noun).",
    newQuestion() {
      const s = pick(SUBJECTS), v = pick(VERBS), a = pick(ACTIVITIES);
      const sv = subjVerb(s, v);
      const third = a.faire ?? pick(ACTIVITIES.filter((x) => x.fr !== a.fr)).fr;
      return {
        meta: `${sv} … (${v.en})`,
        big: a.fr,
        en: a.en,
        correct: `${sv} ${a.fr}.`,
        easyOptions: [`${sv} ${a.fr}.`, `${sv} ${a.noun}.`, `${sv} ${third}.`],
        med: { before: sv, choices: [a.fr, a.noun, third], correct: a.fr, after: "" },
      };
    },
  },
  bonus: [
    { en: "I love reading.", fr: "J'adore lire." },
    { en: "She doesn't like cooking.", fr: "Elle n'aime pas cuisiner." },
    { en: "We love travelling.", fr: "Nous adorons voyager." },
    { en: "He hates running.", fr: "Il déteste courir." },
    { en: "I like drawing.", fr: "J'aime dessiner." },
    { en: "You (sg.) like singing.", fr: "Tu aimes chanter." },
    { en: "I like watching TV.", fr: "J'aime regarder la télé." },
    { en: "I like doing sport.", fr: "J'aime faire du sport." },
    { en: "You (pl.) don't like going out.", fr: "Vous n'aimez pas sortir." },
    { en: "They (f.) love dancing.", fr: "Elles adorent danser." },
  ],
};
