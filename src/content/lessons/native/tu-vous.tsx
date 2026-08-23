/**
 * Native "Tu ou vous ?" lesson (Unité 0) — authored 2026-08-23 to the
 * LESSON_PLAN U0 #1 row (situation → tu / vous + why): Mémo + 🎲 dice
 * trainer + EN→FR bonus, following the negation.tsx template. The twelve
 * situations are the tu-vous deck's own items.
 */
import type { NativeLesson } from "./types";

type Register = "tu" | "vous";

/** The 12 social situations of the tu-vous deck (col:tu / vous_poli / vous_pl). */
const PEOPLE = [
  { fr: "un copain", en: "a buddy", reg: "tu" },
  { fr: "ta petite sœur", en: "your little sister", reg: "tu" },
  { fr: "un enfant", en: "a child", reg: "tu" },
  { fr: "ton meilleur ami", en: "your best friend", reg: "tu" },
  { fr: "le professeur", en: "the teacher", reg: "vous" },
  { fr: "une vendeuse", en: "a saleswoman", reg: "vous" },
  { fr: "le directeur", en: "the headmaster", reg: "vous" },
  { fr: "une personne âgée", en: "an elderly person", reg: "vous" },
  { fr: "deux copains", en: "two buddies", reg: "vous" },
  { fr: "tes parents", en: "your parents", reg: "vous" },
  { fr: "les voisins", en: "the neighbours", reg: "vous" },
  { fr: "Monsieur et Madame Martin", en: "Mr and Mrs Martin", reg: "vous" },
] as const;

/** Question frames (Atelier U0 wording — « Vous vous appelez comment ? »);
 *  near* = the wrong-ending near-miss for each register. */
const FRAMES = [
  { before: "", after: "comment ?", tu: "Tu t'appelles", vous: "Vous vous appelez", nearTu: "Tu t'appelez", nearVous: "Vous vous appelles", en: "What's your name?" },
  { before: "", after: "français ?", tu: "Tu parles", vous: "Vous parlez", nearTu: "Tu parlez", nearVous: "Vous parles", en: "Do you speak French?" },
  { before: "", after: "où ?", tu: "Tu habites", vous: "Vous habitez", nearTu: "Tu habitez", nearVous: "Vous habites", en: "Where do you live?" },
  { before: "", after: "bien ?", tu: "Tu vas", vous: "Vous allez", nearTu: "Tu allez", nearVous: "Vous vas", en: "Are you well?" },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const sentence = (f: (typeof FRAMES)[number], seg: string) =>
  [f.before, seg, f.after].filter(Boolean).join(" ");

export const tuVousLesson: NativeLesson = {
  slug: "tu-vous",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">Tu ou vous ?</h2>
      <ul className="space-y-1 text-[15px] text-[color:var(--cahier-ink)]">
        <li><b className="text-[color:var(--gram-neutral)]">tu</b> — one person you know well — <i lang="fr">Tu parles français ?</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">vous</b> — one person, polite — <i lang="fr">Vous parlez français ?</i></li>
        <li><b className="text-[color:var(--gram-neutral)]">vous</b> — any group, even friends — <i lang="fr">Vous habitez où ?</i></li>
      </ul>
      <table className="mt-3 w-full border-collapse text-sm text-[color:var(--cahier-ink)]" lang="fr">
        <tbody>
          {[
            ["tu t'appelles", "vous vous appelez"],
            ["tu parles", "vous parlez"],
            ["tu habites", "vous habitez"],
            ["tu vas", "vous allez"],
          ].map(([t, v]) => (
            <tr key={t} className="border-b border-[color:var(--cahier-rule)]/50">
              <td className="p-1 text-[color:var(--gram-neutral)]">{t}</td>
              <td className="p-1 text-[color:var(--gram-neutral)]">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ Unsure → <b lang="fr">vous</b>. Nobody is offended by polite.
      </p>
    </div>
  ),
  dice: {
    instruction: "Ask the question — tu or vous, depending on who you're talking to.",
    newQuestion() {
      const p = pick(PEOPLE);
      const f = pick(FRAMES);
      const reg: Register = p.reg;
      const other: Register = reg === "tu" ? "vous" : "tu";
      const correct = sentence(f, f[reg]);
      return {
        meta: "Tu ou vous ? You're talking to…",
        big: p.fr,
        en: p.en,
        correct,
        easyOptions: [
          correct,
          sentence(f, f[other]),
          sentence(f, reg === "tu" ? f.nearTu : f.nearVous),
          sentence(f, reg === "tu" ? f.nearVous : f.nearTu),
        ],
        med: { before: f.before, choices: [f.tu, f.vous], correct: f[reg], after: f.after },
      };
    },
  },
  bonus: [
    { en: "Ask a buddy: do you speak French?", fr: "Tu parles français ?" },
    { en: "Ask the teacher: do you speak French?", fr: "Vous parlez français ?" },
    { en: "Ask your little sister: are you well?", fr: "Tu vas bien ?" },
    { en: "Ask the headmaster: what's your name?", fr: "Vous vous appelez comment ?", alt: ["Comment vous vous appelez ?"] },
    { en: "Ask your parents: where do you live?", fr: "Vous habitez où ?" },
    { en: "Ask a child: what's your name?", fr: "Tu t'appelles comment ?", alt: ["Comment tu t'appelles ?"] },
    { en: "Ask an elderly person: are you well?", fr: "Vous allez bien ?" },
    { en: "Ask your best friend: where do you live?", fr: "Tu habites où ?" },
    { en: "Ask the saleswoman: what's your name?", fr: "Vous vous appelez comment ?", alt: ["Comment vous vous appelez ?"] },
    { en: "Ask two buddies: do you speak French?", fr: "Vous parlez français ?" },
  ],
};
