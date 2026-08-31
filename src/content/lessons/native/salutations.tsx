/**
 * Native "Salutations" lesson (Unité 0) — authored 2026-08-23 to the
 * LESSON_PLAN U0 #10 row (situation → the greeting; arrival vs departure):
 * Mémo + 🎲 dice trainer + EN→FR bonus. Greetings are the salutations deck's
 * own items; each situation's distractors are hand-picked so exactly one
 * answer fits (standard greetings work anywhere, casual ones don't).
 */
import type { NativeLesson } from "./types";

const SITS = [
  { big: "→ the teacher, 9 h", en: "arriving, morning", correct: "Bonjour !", wrong: ["Bonsoir !", "Salut !", "Au revoir !"] },
  { big: "→ a neighbour, 20 h", en: "arriving, evening", correct: "Bonsoir !", wrong: ["Bonne nuit !", "Coucou !", "À demain !"] },
  { big: "→ a buddy", en: "arriving, casual", correct: "Salut !", alt: ["Coucou !"], wrong: ["Au revoir !", "Bonne nuit !", "À bientôt !"] },
  { big: "meeting someone new", en: "first meeting", correct: "Enchanté !", wrong: ["Au revoir !", "À plus !", "Bonne nuit !"] },
  { big: "a buddy — how's it going?", en: "casual hello + question", correct: "Ça va ?", wrong: ["Enchanté !", "Au revoir !", "Bonne nuit !"] },
  { big: "leaving school →", en: "leaving, polite", correct: "Au revoir !", wrong: ["Bonjour !", "Coucou !", "Ça va ?"] },
  { big: "leaving — class again tomorrow →", en: "see you tomorrow", correct: "À demain !", wrong: ["Bonjour !", "Enchanté !", "Coucou !"] },
  { big: "leaving — you'll meet again soon →", en: "see you soon", correct: "À bientôt !", wrong: ["Bonjour !", "Enchanté !", "Ça va ?"] },
  { big: "leaving the bakery, 10 h →", en: "wish a good day", correct: "Bonne journée !", wrong: ["Bonne nuit !", "Bonjour !", "Coucou !"] },
  { big: "going to bed, 22 h →", en: "bedtime", correct: "Bonne nuit !", wrong: ["Bonne journée !", "Bonjour !", "Enchanté !"] },
  { big: "leaving buddies — same day →", en: "leaving, casual, later today", correct: "À plus tard !", alt: ["À plus !"], wrong: ["Bonjour !", "Coucou !", "Enchanté !"] },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const salutationsLesson: NativeLesson = {
  slug: "salutations",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">Les salutations</h2>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[14px] text-[color:var(--cahier-ink)]">
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <b className="text-[color:var(--gram-neutral)]">→ arriver</b>, anytime
          <p lang="fr" className="mt-1">Bonjour ! Bonsoir ! Enchanté !</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <b className="text-[color:var(--gram-neutral)]">→ arriver</b>, friends
          <p lang="fr" className="mt-1">Salut ! Coucou ! Ça va ?</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <b className="text-[color:var(--gram-neutral)]">partir →</b>, anytime
          <p lang="fr" className="mt-1">Au revoir ! À demain ! À bientôt ! Bonne journée !</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <b className="text-[color:var(--gram-neutral)]">partir →</b>, friends
          <p lang="fr" className="mt-1">Salut ! À plus tard ! À plus !</p>
        </div>
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        ⚠️ <i lang="fr">Salut !</i> = hello AND bye — friends only.{" "}
        <i lang="fr">Bonne nuit !</i> only at bedtime; leaving in the day is <i lang="fr">Bonne journée !</i>
      </p>
    </div>
  ),
  dice: {
    instruction: "Pick the greeting that fits the situation.",
    newQuestion() {
      const s = pick(SITS);
      return {
        meta: "Que dites-vous ?",
        big: s.big,
        en: s.en,
        correct: s.correct,
        alternates: "alt" in s ? [...s.alt] : undefined,
        easyOptions: [s.correct, ...s.wrong],
        med: { before: "", choices: [s.correct, ...s.wrong], correct: s.correct, after: "" },
      };
    },
  },
  // ── TIER 3 · the first Phraseology concept ────────────────────────────
  // Written 2026-08-31 to test whether LessonConcept can carry a PHRASE stop
  // at all. Tiers 1 and 2 argue about a system: a rule the forms hide, a
  // distinction the word list cannot state. Tier 3 has no system to expose —
  // SYLLABUS_TIERS is explicit that analysing a block into parts is "actively
  // wrong at this level". So the slots stay, and what fills them moves from
  // FORM to MOMENT: `flow` branches on the situation rather than the shape of
  // a word, and `pitfall` contrasts WHEN a block is said rather than what it
  // is made of. Every phrase below is already in SITS or `bonus`; nothing here
  // is new French.
  concept: {
    subtitle: "Why a greeting is chosen, not built",
    contrast: (
      <>
        English lets one phrase cover several moments — <i>good night</i> both ends an
        evening and sends someone to bed, and <i>see you</i> needs nothing added. French
        keeps a separate block for each moment, and the block is fixed: you do not
        assemble <i lang="fr">&Agrave; demain !</i> out of pieces, you reach for it because
        you will see them tomorrow.
      </>
    ),
    question: (
      <>
        You know all eleven greetings. It is 22 h and you are going to bed. Which one?
      </>
    ),
    answer: (
      <>
        <i lang="fr">Bonne nuit !</i>{" "}— and only there. It is not the evening&rsquo;s
        goodbye. Leaving in the day is <i lang="fr">Bonne journ&eacute;e !</i>, and{" "}
        <i lang="fr">Bonne nuit !</i> is kept for bedtime. English <i>good night</i> does
        both jobs, which is exactly why the instinct is to reuse it.
      </>
    ),
    pitfall: [
      {
        label: <><i lang="fr">Bonne nuit !</i></>,
        wrong: <>any goodbye after dark</>,
        right: <>bedtime only</>,
      },
      {
        label: <><i lang="fr">Salut !</i></>,
        wrong: <>hello</>,
        right: <>hello <b>and</b> goodbye — friends</>,
      },
      {
        label: <><i lang="fr">Enchant&eacute; !</i></>,
        wrong: <>whenever you meet someone</>,
        right: <>the first meeting</>,
      },
    ],
    flow: [
      { depth: 0, text: "Arriving, or leaving?" },
      { depth: 1, text: "Arriving, a friend → Salut ! · Coucou !" },
      { depth: 1, text: "Arriving, anyone else → Bonjour ! · Bonsoir ! in the evening" },
      { depth: 1, text: "Leaving — do you know when you will meet again?" },
      { depth: 2, text: "tomorrow → À demain !" },
      { depth: 2, text: "soon → À bientôt !" },
      { depth: 2, text: "later the same day, friends → À plus tard !" },
      { depth: 2, text: "you do not know → Au revoir !" },
    ],
    check: [
      {
        q: <><i lang="fr">Salut !</i> is in both halves of the M&eacute;mo. Is that a mistake?</>,
        a: (
          <>
            No — it is the one block that does both jobs. Hello <b>and</b> goodbye, and
            only with friends.
          </>
        ),
      },
      {
        q: <>You leave the bakery at 10 h. Which one?</>,
        a: (
          <>
            <i lang="fr">Bonne journ&eacute;e !</i> — a wish for the day ahead.{" "}
            <i lang="fr">Bonne nuit !</i> would send the baker to bed.
          </>
        ),
      },
    ],
    inShort: (
      <>
        arriving or leaving &middot; how well you know them &middot; when you meet again
      </>
    ),
    remember: (
      <>
        A greeting is not built, it is chosen: the moment picks the block. And{" "}
        <i lang="fr">Salut !</i> is the only one that works at both ends.
      </>
    ),
  },
  bonus: [
    { en: "Hello! (to the teacher, in the morning)", fr: "Bonjour !" },
    { en: "Good evening! (arriving at 8 pm)", fr: "Bonsoir !" },
    { en: "Hi! (to a buddy)", fr: "Salut !", alt: ["Coucou !"] },
    { en: "Nice to meet you!", fr: "Enchanté !" },
    { en: "How's it going? (to a buddy)", fr: "Ça va ?" },
    { en: "Goodbye! (leaving school)", fr: "Au revoir !" },
    { en: "See you tomorrow!", fr: "À demain !" },
    { en: "See you soon!", fr: "À bientôt !" },
    { en: "Have a good day!", fr: "Bonne journée !" },
    { en: "Good night! (going to bed)", fr: "Bonne nuit !" },
  ],
};
