/**
 * Native "Avoir ou être ? — les états" lesson (Unité 1, SIO-019). Dan,
 * 2026-07-08: the avoir SIO pointed at the generic conjugation tables — this
 * teaches what the SIO actually drills: states that take AVOIR + noun (faim,
 * soif, âge…) vs ÊTRE + adjective (fatigué, content…, which AGREES).
 */
import type { NativeLesson } from "./types";

const AVOIR_STATES = [
  { fr: "faim", en: "hungry" },
  { fr: "soif", en: "thirsty" },
  { fr: "chaud", en: "hot" },
  { fr: "froid", en: "cold" },
] as const;
const ETRE_STATES = [
  { fr: "fatigué", pl: "fatigués", en: "tired" },
  { fr: "content", pl: "contents", en: "happy" },
  { fr: "malade", pl: "malades", en: "sick" },
  { fr: "triste", pl: "tristes", en: "sad" },
  { fr: "calme", pl: "calmes", en: "calm" },
] as const;
const SUBJECTS = [
  { disp: "Je", avoir: "ai", etre: "suis", pl: false, elide: true },
  { disp: "Tu", avoir: "as", etre: "es", pl: false, elide: false },
  { disp: "Il", avoir: "a", etre: "est", pl: false, elide: false },
  { disp: "Ils", avoir: "ont", etre: "sont", pl: true, elide: false },
  { disp: "Nous", avoir: "avons", etre: "sommes", pl: true, elide: false },
  { disp: "Vous", avoir: "avez", etre: "êtes", pl: true, elide: false },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const sv = (s: (typeof SUBJECTS)[number], verb: string) =>
  s.elide ? `J'${verb}` : `${s.disp} ${verb}`;

export const avoirEtatsLesson: NativeLesson = {
  slug: "avoir-etats",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Avoir ou être ? — les états
      </h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li>
          <b className="text-[color:var(--gram-neutral)]">AVOIR</b> + noun —{" "}
          <i lang="fr">J&rsquo;ai faim. · Ils ont soif. · Elle a froid.</i>
        </li>
        <li>
          <b className="text-[color:var(--gram-neutral)]">AVOIR</b> + age —{" "}
          <i lang="fr">J&rsquo;ai 19 ans.</i>
        </li>
        <li>
          <b className="text-[color:var(--gram-neutral)]">ÊTRE</b> + adjective (it agrees!) —{" "}
          <i lang="fr">Il est fatigué. · Ils sont fatigués.</i>
        </li>
        <li>
          <b className="text-[color:var(--gram-neutral)]">avoir envie / besoin de</b> —{" "}
          <i lang="fr">J&rsquo;ai envie de dormir. · J&rsquo;ai besoin d&rsquo;un café.</i>
        </li>
      </ul>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ English says <i>I <b>am</b> hungry / cold / 19</i> — French takes{" "}
        <b lang="fr">AVOIR</b>: <span lang="fr">j&rsquo;<b>ai</b> faim, j&rsquo;<b>ai</b> froid, j&rsquo;<b>ai</b> 19 ans.</span>
      </p>
    </div>
  ),
  dice: {
    instruction: "Avoir or être? Pick the sentence that says the state correctly.",
    newQuestion() {
      const s = pick(SUBJECTS);
      if (Math.random() < 0.25) {
        // Age round — always avoir.
        const n = 17 + Math.floor(Math.random() * 9);
        return {
          meta: `${s.disp} … ${n} (age)`,
          big: `${n} ans`,
          en: `${s.disp.toLowerCase()} — to be ${n} years old`,
          correct: `${sv(s, s.avoir)} ${n} ans.`,
          easyOptions: [`${sv(s, s.avoir)} ${n} ans.`, `${sv(s, s.etre)} ${n} ans.`],
          med: { before: s.disp, choices: [s.avoir, s.etre], correct: s.avoir, after: `${n} ans.` },
        };
      }
      if (Math.random() < 0.5) {
        const st = pick(AVOIR_STATES);
        return {
          meta: `${s.disp} … (${st.en})`,
          big: st.fr,
          en: st.en,
          correct: `${sv(s, s.avoir)} ${st.fr}.`,
          easyOptions: [`${sv(s, s.avoir)} ${st.fr}.`, `${sv(s, s.etre)} ${st.fr}.`],
          med: { before: s.disp, choices: [s.avoir, s.etre], correct: s.avoir, after: `${st.fr}.` },
        };
      }
      const st = pick(ETRE_STATES);
      const adj = s.pl ? st.pl : st.fr;
      const wrongAdj = s.pl ? st.fr : st.pl;
      return {
        meta: `${s.disp} … (${st.en})`,
        big: st.fr,
        en: st.en,
        correct: `${sv(s, s.etre)} ${adj}.`,
        easyOptions: [
          `${sv(s, s.etre)} ${adj}.`,
          `${sv(s, s.avoir)} ${adj}.`,
          `${sv(s, s.etre)} ${wrongAdj}.`,
        ],
        med: { before: s.disp, choices: [s.avoir, s.etre], correct: s.etre, after: `${adj}.` },
      };
    },
  },
  bonus: [
    { en: "I am hungry.", fr: "J'ai faim." },
    { en: "They are tired.", fr: "Ils sont fatigués." },
    { en: "She is 20 years old.", fr: "Elle a 20 ans." },
    { en: "We are thirsty.", fr: "Nous avons soif." },
    { en: "You (sg.) are sick.", fr: "Tu es malade." },
    { en: "I need a coffee.", fr: "J'ai besoin d'un café." },
    { en: "I feel like dancing.", fr: "J'ai envie de danser." },
    { en: "He is calm.", fr: "Il est calme." },
    { en: "They are cold.", fr: "Ils ont froid." },
    { en: "I am 19 years old.", fr: "J'ai 19 ans." },
  ],
};
