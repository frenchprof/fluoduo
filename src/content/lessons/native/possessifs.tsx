/**
 * Native "La possession" lesson (Unité 2 · L13) — the Mémo + 🎲 dice trainer +
 * EN→FR bonus distilled from the 13-possessifs.html drchan import, as real
 * in-app content following the aimer.tsx template.
 */
import type { NativeLesson } from "./types";

const NOUNS: { fr: string; en: string; g: "m" | "f"; pl: boolean; vowel: boolean }[] = [
  { fr: "cahier", en: "exercise book", g: "m", pl: false, vowel: false },
  { fr: "souris", en: "computer mouse", g: "f", pl: false, vowel: false },
  { fr: "ordinateur", en: "computer", g: "m", pl: false, vowel: true },
  { fr: "agrafeuse", en: "stapler", g: "f", pl: false, vowel: true },
  { fr: "écouteurs", en: "headphones", g: "m", pl: true, vowel: true },
  { fr: "ciseaux", en: "scissors", g: "m", pl: true, vowel: false },
  { fr: "lunettes", en: "glasses", g: "f", pl: true, vowel: false },
  { fr: "affaires", en: "belongings", g: "f", pl: true, vowel: true },
];

const OWNERS: { fr: string; en: string; m: string; f: string; pl: string }[] = [
  { fr: "à moi", en: "my", m: "mon", f: "ma", pl: "mes" },
  { fr: "à toi", en: "your (tu)", m: "ton", f: "ta", pl: "tes" },
  { fr: "à lui", en: "his", m: "son", f: "sa", pl: "ses" },
  { fr: "à elle", en: "her", m: "son", f: "sa", pl: "ses" },
  { fr: "à nous", en: "our", m: "notre", f: "notre", pl: "nos" },
  { fr: "à vous", en: "your (vous)", m: "votre", f: "votre", pl: "vos" },
  { fr: "à eux", en: "their (m.)", m: "leur", f: "leur", pl: "leurs" },
  { fr: "à elles", en: "their (f.)", m: "leur", f: "leur", pl: "leurs" },
];

const ALL_POSS = ["mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs"];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
/** The possessive agrees with the noun; fem. + vowel takes the masc. form. */
const possessive = (o: (typeof OWNERS)[number], n: (typeof NOUNS)[number]) =>
  n.pl ? o.pl : n.g === "m" || n.vowel ? o.m : o.f;
const article = (n: (typeof NOUNS)[number]) => (n.pl ? "Les " : n.vowel ? "L'" : n.g === "m" ? "Le " : "La ");

const ROWS: [string, string, string, string, string][] = [
  ["my", "mon", "ma", "mon", "mes"],
  ["your (tu)", "ton", "ta", "ton", "tes"],
  ["his / her", "son", "sa", "son", "ses"],
  ["our", "notre", "notre", "notre", "nos"],
  ["your (vous)", "votre", "votre", "votre", "vos"],
  ["their", "leur", "leur", "leur", "leurs"],
];

export const possessifsLesson: NativeLesson = {
  slug: "possessifs",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">
        Mon, ma, mes… — <em>la possession</em>
      </h2>
      <table className="mt-1 w-full border-collapse text-sm text-[color:var(--cahier-ink)]">
        <thead>
          <tr>
            {["", "masc.", "fém.", "fém. + voyelle", "pluriel"].map((h, i) => (
              <th key={i} className="border border-[color:var(--cahier-rule)] bg-white px-2 py-1 text-left font-bold" lang={i > 0 ? "fr" : undefined}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([en, m, f, v, pl]) => (
            <tr key={en}>
              <td className="border border-[color:var(--cahier-rule)] px-2 py-1 italic">{en}</td>
              {[m, f, v, pl].map((c, i) => (
                <td key={i} lang="fr" className={`border border-[color:var(--cahier-rule)] px-2 py-1 font-bold ${i === 2 && c !== f ? "text-[color:var(--cahier-la)]" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-sm text-[color:var(--cahier-ink)]">
        <b lang="fr">C&rsquo;est</b> + singular · <b lang="fr">Ce sont</b> + plural — <i lang="fr">C&rsquo;est mon cahier. Ce sont mes lunettes.</i>
      </p>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <b>Agree with the thing owned, never the owner</b>: <span lang="fr"><b>son</b> livre</span> = his <u>or</u> her book. Fem. + vowel takes the masc. form: <i lang="fr"><b>mon</b> agrafeuse</i>, not <i lang="fr">*ma agrafeuse</i>.
      </p>
    </div>
  ),
  dice: {
    instruction: "Rebuild the sentence with C'est / Ce sont + the right possessive.",
    newQuestion() {
      const n = pick(NOUNS), o = pick(OWNERS);
      const poss = possessive(o, n);
      const ce = n.pl ? "Ce sont" : "C'est";
      const cands = [...new Set([poss, o.m, o.f, o.pl])];
      while (cands.length < 4) {
        const x = pick(ALL_POSS);
        if (!cands.includes(x)) cands.push(x);
      }
      return {
        meta: `${article(n)}${n.fr} ${n.pl ? "sont" : "est"} ${o.fr}.`,
        big: n.fr,
        en: `${o.en} ${n.en}`,
        correct: `${ce} ${poss} ${n.fr}.`,
        easyOptions: cands.map((p) => `${ce} ${p} ${n.fr}.`),
        med: { before: ce, choices: cands, correct: poss, after: `${n.fr}.` },
      };
    },
  },
  bonus: [
    { en: "It's my exercise book.", fr: "C'est mon cahier." },
    { en: "It's your (sg.) computer mouse.", fr: "C'est ta souris." },
    { en: "It's his stapler.", fr: "C'est son agrafeuse." },
    { en: "It's her computer.", fr: "C'est son ordinateur." },
    { en: "It's our computer.", fr: "C'est notre ordinateur." },
    { en: "They are my headphones.", fr: "Ce sont mes écouteurs." },
    { en: "They are his glasses.", fr: "Ce sont ses lunettes." },
    { en: "They are our glasses.", fr: "Ce sont nos lunettes." },
    { en: "They are your (pl.) belongings.", fr: "Ce sont vos affaires." },
    { en: "They are their scissors.", fr: "Ce sont leurs ciseaux." },
  ],
};
