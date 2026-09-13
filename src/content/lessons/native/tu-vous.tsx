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
  // TIER 1 · stop 2. The Mémo lists three uses of two words. The claim is that
  // ONE of them does two jobs, which is why `vous parlez` cannot tell you how
  // many people are being addressed — and why nobody minds.
  //
  // THE SUBTITLE USED TO SAY "Why vous is two different words" AND CONTRADICTED
  // ITS OWN BODY (Dan, 2026-09-13: *"MneMemo has a huge mistake — it is 'you'
  // that has two different words in French, rather than vous"*).
  //
  // The contrast line two lines below has always been right — "English has one
  // you for everybody. French has two" — and so are the pitfall headings, "one
  // English you" / "two French ones". Only the heading over them was inverted,
  // which is the worst place for it: it is the line a learner reads first and
  // carries away.
  //
  // The doubling Dan allows is a DIFFERENT claim, and it is about the word
  // appearing twice rather than meaning two things: « vous vous appelez » —
  // subject `vous`, reflexive `vous`, verb — is THREE words, not two. That is
  // not what this heading was saying, so it is corrected rather than reworded.
  concept: {
    subtitle: "Why English you is two words in French",
    contrast: (
      <>
        English has one <i>you</i> for everybody. French has two, and the second one is
        doing <b>two jobs at once</b>: polite to one person, and plural to any group at
        all &mdash; friends included.
      </>
    ),
    question: (
      <>
        <i lang="fr">Vous parlez fran&ccedil;ais&nbsp;?</i>{" "}
        &mdash; one person, or several?
      </>
    ),
    answer: (
      <>
        You cannot tell, and French speakers do not try. The form is the same for a
        stranger you are being polite to and for a room full of friends. Only{" "}
        <i lang="fr">tu</i> is unambiguous: exactly one person, and one you know well.
      </>
    ),
    pitfallHeads: ["one English you", "two French ones"],
    pitfall: [
      { label: <>a friend</>, wrong: <><i lang="fr">vous parles</i></>, right: <><i lang="fr">tu parles</i></> },
      { label: <>your teacher</>, wrong: <><i lang="fr">tu parlez</i></>, right: <><i lang="fr">vous parlez</i></> },
      { label: <>two friends</>, wrong: <><i lang="fr">tu parlez</i></>, right: <><i lang="fr">vous parlez</i></> },
    ],
    flow: [
      { depth: 0, text: "How many people?" },
      { depth: 1, text: "more than one → vous" },
      { depth: 1, text: "one → do you know them well?" },
      { depth: 2, text: "yes → tu" },
      { depth: 2, text: "no → vous" },
    ],
    check: [
      { q: <>Two friends. Which one?</>,
        a: <><i lang="fr">Vous</i> &mdash; a group is always <i lang="fr">vous</i>, however close.</> },
      { q: <>Why is choosing wrong worse than a spelling mistake?</>,
        a: <>Because it is not a grammar error. It says something about the relationship.</> },
    ],
    remember: (
      <>
        <i lang="fr">Tu</i> means one person you know. <i lang="fr">Vous</i>{" "}means
        everything else &mdash; and it will not tell you which.
      </>
    ),
  },
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
