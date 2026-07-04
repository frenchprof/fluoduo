/**
 * Native "Faire du / de la / de l' / des" lesson (Unité 2, L09) — Mémo +
 * 🎲 dice trainer + EN→FR bonus distilled from the 289KB
 * 09-faire-du-de-la.html drchan import.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const FAIRE: Record<string, string> = { je: "fais", tu: "fais", il: "fait", nous: "faisons", vous: "faites", ils: "font" };
const ACTIVITIES: { fr: string; part: "du" | "de la" | "de l'" | "des"; en: string }[] = [
  { fr: "yoga", part: "du", en: "yoga" }, { fr: "sport", part: "du", en: "sport" },
  { fr: "karaté", part: "du", en: "karate" }, { fr: "vélo", part: "du", en: "cycling" },
  { fr: "football", part: "du", en: "football" }, { fr: "basket", part: "du", en: "basketball" },
  { fr: "tennis", part: "du", en: "tennis" }, { fr: "ski", part: "du", en: "skiing" },
  { fr: "chant", part: "du", en: "singing" }, { fr: "danse", part: "de la", en: "dance" },
  { fr: "natation", part: "de la", en: "swimming" }, { fr: "musique", part: "de la", en: "music" },
  { fr: "photographie", part: "de la", en: "photography" }, { fr: "peinture", part: "de la", en: "painting" },
  { fr: "boxe", part: "de la", en: "boxing" }, { fr: "escalade", part: "de l'", en: "climbing" },
  { fr: "équitation", part: "de l'", en: "horse riding" }, { fr: "athlétisme", part: "de l'", en: "athletics" },
  { fr: "escrime", part: "de l'", en: "fencing" }, { fr: "arts martiaux", part: "des", en: "martial arts" },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const np = (art: string, fr: string) => art + (art.endsWith("'") ? "" : " ") + fr;
const isVowel = (fr: string) => /^[aeiouéèêàh]/i.test(fr);

export const faireLesson: NativeLesson = {
  slug: "faire",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Faire <em>du / de la / de l&rsquo; / des</em>
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-lg text-[color:var(--cahier-la)]">du</b> + masculin — <i lang="fr">Je fais du sport.</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">de la</b> + féminin — <i lang="fr">Elle fait de la danse.</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">de l&rsquo;</b> + voyelle — <i lang="fr">Nous faisons de l&rsquo;escalade.</i></li>
        <li><b className="text-lg text-[color:var(--cahier-la)]">des</b> + pluriel — <i lang="fr">Ils font des arts martiaux.</i></li>
      </ul>
      <p className="mt-2 text-sm text-[color:var(--cahier-ink)]" lang="fr">
        je fais · tu fais · il/elle fait · nous faisons · vous <b>faites</b> · ils/elles <b>font</b>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>In the negative, du / de la / des all become <span lang="fr">de</span></b> (<span lang="fr">d&rsquo;</span> before a vowel):{" "}
        <span lang="fr">Je fais <u>du</u> yoga → Je ne fais pas <b>de</b> yoga. · Je ne fais pas <b>d&rsquo;</b>escalade.</span>
      </p>
    </div>
  ),
  dice: {
    instruction: "Choose the right partitive article after faire (watch the negative!).",
    newQuestion() {
      const s = pick(SUBJECTS), a = pick(ACTIVITIES), neg = Math.random() < 0.4;
      const f = FAIRE[s.slot];
      const sv = neg ? `${s.disp} ne ${f} pas` : `${s.disp} ${f}`;
      const art = neg ? (isVowel(a.fr) ? "d'" : "de") : a.part;
      const arts = neg
        ? [art, art === "d'" ? "de" : "d'", a.part, a.part === "du" ? "de la" : "du"]
        : ["du", "de la", "de l'", "des"];
      return {
        meta: `${sv} … (${neg ? "don't do" : "do"})`,
        big: a.fr,
        en: a.en,
        correct: `${sv} ${np(art, a.fr)}.`,
        easyOptions: [...new Set(arts)].map((x) => `${sv} ${np(x, a.fr)}.`),
        med: { before: sv, choices: [...new Set(arts)], correct: art, after: `${a.fr}.` },
      };
    },
  },
  bonus: [
    { en: "I do sport.", fr: "Je fais du sport." },
    { en: "She does dancing.", fr: "Elle fait de la danse." },
    { en: "We do climbing.", fr: "Nous faisons de l'escalade." },
    { en: "They (m.) do martial arts.", fr: "Ils font des arts martiaux." },
    { en: "You (sg.) do swimming.", fr: "Tu fais de la natation." },
    { en: "You (pl.) do skiing.", fr: "Vous faites du ski." },
    { en: "He doesn't do yoga.", fr: "Il ne fait pas de yoga." },
    { en: "I don't do horse riding.", fr: "Je ne fais pas d'équitation." },
    { en: "We don't do boxing.", fr: "Nous ne faisons pas de boxe." },
    { en: "They (f.) do music.", fr: "Elles font de la musique." },
  ],
};
