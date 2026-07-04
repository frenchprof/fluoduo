/**
 * Native "Adverbes de fréquence" lesson (Unité 4) — distilled from
 * 22-frequence.html: the Mémo + the 🎲 dice trainer + EN→FR bonus.
 */
import type { NativeLesson } from "./types";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const ACTS = [
  { stem: "regard", rest: "la télé", en: "watch TV" },
  { stem: "écout", rest: "de la musique", en: "listen to music" },
  { stem: "travaill", rest: "", en: "work" },
  { stem: "cuisin", rest: "", en: "cook" },
  { stem: "jou", rest: "au foot", en: "play football" },
  { stem: "dans", rest: "", en: "dance" },
] as const;
const ADV = [
  { fr: "toujours", en: "always" }, { fr: "souvent", en: "often" },
  { fr: "régulièrement", en: "regularly" }, { fr: "parfois", en: "sometimes" },
  { fr: "rarement", en: "rarely" },
] as const;
const SCALE = [...ADV, { fr: "jamais", en: "never" }] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function subjVerb(s: (typeof SUBJECTS)[number], verb: string): string {
  return s.slot === "je" && /^[aeiouéèêh]/i.test(verb) ? `J'${verb}` : `${s.disp} ${verb}`;
}

export const frequenceLesson: NativeLesson = {
  slug: "frequence",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        L&rsquo;adverbe de fréquence : <em>juste après le verbe</em>
      </h2>
      <p className="text-[15px] text-[color:var(--cahier-ink)]" lang="fr">
        <i>Je cours <b>souvent</b>. · Elle regarde <b>rarement</b> la télé.</i>
      </p>
      <p className="mt-3 flex flex-wrap gap-1.5 text-[13px] font-bold text-[color:var(--cahier-ink)]">
        {SCALE.map((a) => (
          <span key={a.fr} className="rounded-full border border-[color:var(--cahier-rule)] bg-white px-2.5 py-0.5">
            <span lang="fr">{a.fr}</span> · {a.en}
          </span>
        ))}
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ Negative: <span lang="fr">Je <b>ne</b> cours <b>pas</b> souvent.</span> — but{" "}
        <b lang="fr">jamais</b> replaces <i lang="fr">pas</i>:{" "}
        <span lang="fr">Je <b>ne</b> nage <b>jamais</b>.</span>
      </p>
    </div>
  ),
  dice: {
    instruction: "Place the frequency adverb — right after the verb.",
    newQuestion() {
      const s = pick(SUBJECTS), a = pick(ACTS), adv = pick(ADV);
      const verb = a.stem + END[s.slot];
      const sv = subjVerb(s, verb);
      const tail = a.rest ? ` ${a.rest}` : "";
      const other = pick(ADV.filter((x) => x.fr !== adv.fr));
      return {
        meta: `${sv} … (${a.en})`,
        big: adv.fr,
        en: adv.en,
        correct: `${sv} ${adv.fr}${tail}.`,
        easyOptions: [
          `${sv} ${adv.fr}${tail}.`,
          `${s.disp} ${adv.fr} ${verb}${tail}.`,
          `${sv} ${other.fr}${tail}.`,
        ],
        med: {
          before: sv,
          choices: ADV.map((x) => x.fr),
          correct: adv.fr,
          after: a.rest ? `${a.rest}.` : ".",
        },
      };
    },
  },
  bonus: [
    { en: "I often watch TV.", fr: "Je regarde souvent la télé." },
    { en: "She always works.", fr: "Elle travaille toujours." },
    { en: "We sometimes cook.", fr: "Nous cuisinons parfois." },
    { en: "They (m.) regularly play football.", fr: "Ils jouent régulièrement au foot." },
    { en: "You (sg.) rarely dance.", fr: "Tu danses rarement." },
    { en: "I don't often listen to music.", fr: "Je n'écoute pas souvent de la musique." },
    { en: "He never watches TV.", fr: "Il ne regarde jamais la télé." },
    { en: "We never work.", fr: "Nous ne travaillons jamais." },
    { en: "She doesn't often cook.", fr: "Elle ne cuisine pas souvent." },
    { en: "I never dance.", fr: "Je ne danse jamais." },
  ],
};
