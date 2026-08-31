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
      {/* The FORMS are the heroes of the lesson (Dan, 2026-08-31: "not
          salient enough — they should be in bold"), so the French is set
          bold-black and the situation labels step back to captions. */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-[14px] text-[color:var(--cahier-ink)]">
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">→ arriver · anytime</p>
          <p lang="fr" className="mt-1 text-[15px] font-black text-[color:var(--cahier-ink)]">Bonjour ! Bonsoir ! Enchanté !</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">→ arriver · friends</p>
          <p lang="fr" className="mt-1 text-[15px] font-black text-[color:var(--cahier-ink)]">Salut ! Coucou ! Ça va ?</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">partir → · anytime</p>
          <p lang="fr" className="mt-1 text-[15px] font-black text-[color:var(--cahier-ink)]">Au revoir ! À demain ! À bientôt ! Bonne journée !</p>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">partir → · friends</p>
          <p lang="fr" className="mt-1 text-[15px] font-black text-[color:var(--cahier-ink)]">Salut ! À plus tard ! À plus !</p>
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
  // ── TIER 3 · Phraseology, second draft ───────────────────────────────
  // Dan, 31 Aug, overruling the first draft: form analysis is NOT out at this
  // level. The SYLLABUS_TIERS line I built that draft on — "analysing them
  // into parts is actively wrong" — is about OPAQUE blocks, and its example
  // says so: « il fait beau » is not IL + FAIRE + BEAU. « Bonne nuit » is a
  // different animal: its parts are visible, and the rule is one the learner
  // already has.
  //
  // So a Tier 3 concept takes the form pattern WHERE THE BLOCK IS
  // TRANSPARENT, and the moment only where it is opaque. This one is the
  // transparent case, and the whole contrast lives inside the stop:
  // bonjour / bonsoir against bonne journée / bonne nuit.
  //
  // The two pitfall rows about WHEN to say a block are gone — the Mémo's
  // warning box already carries them ("Salut ! = hello AND bye"; "Bonne nuit !
  // only at bedtime"), and a second screen repeating it is exactly what the
  // litmus test removes.
  concept: {
    subtitle: "Why it is bonjour but bonne nuit",
    contrast: (
      <>
        English <i>good</i> never changes — good morning, good night, good trip.
        French has to choose between <i lang="fr">bon</i> and{" "}
        <i lang="fr">bonne</i>, and it chooses by the noun that follows. So the
        greeting is not one block to swallow: it is <i lang="fr">bon</i> or{" "}
        <i lang="fr">bonne</i> agreeing with a word you already know.
      </>
    ),
    question: (
      <>
        Four of these greetings are the same two words. Why{" "}
        <i lang="fr">bonjour</i> and <i lang="fr">bonsoir</i>, but{" "}
        <i lang="fr">bonne journ&eacute;e</i> and <i lang="fr">bonne nuit</i>?
      </>
    ),
    answer: (
      <>
        Gender. <i lang="fr">Le jour</i> and <i lang="fr">le soir</i> are
        masculine, so <i lang="fr">bon</i>. <i lang="fr">La journ&eacute;e</i>{" "}
        and <i lang="fr">la nuit</i> are feminine, so <i lang="fr">bonne</i>.
        The masculine pair is written as one word; the feminine pair stays two.
        Once you see it, <i lang="fr">bonne soir&eacute;e</i> is not a new
        phrase to learn — <i lang="fr">la soir&eacute;e</i> is feminine, so it
        could not have been anything else.
      </>
    ),
    pitfall: [
      {
        label: <><i lang="fr">la nuit</i></>,
        wrong: <><i lang="fr">bon nuit</i></>,
        right: <><i lang="fr">bonne nuit</i></>,
      },
      {
        label: <><i lang="fr">le voyage</i></>,
        wrong: <><i lang="fr">bonne voyage</i></>,
        right: <><i lang="fr">bon voyage</i></>,
      },
    ],
    // One example per line. The three-example lines this replaces ran past the
    // right edge at 390px — a decision rule the learner had to scroll sideways
    // to finish reading. Caught by screenshotting the box, not by the
    // page-level overflow check, which was green because the box scrolls
    // inside itself.
    flow: [
      { depth: 0, text: "Wishing someone a good something?" },
      { depth: 1, text: "the noun is masculine → bon" },
      { depth: 2, text: "le jour → bonjour" },
      { depth: 2, text: "le voyage → bon voyage" },
      { depth: 1, text: "the noun is feminine → bonne" },
      { depth: 2, text: "la nuit → bonne nuit" },
      { depth: 2, text: "la chance → bonne chance" },
    ],
    check: [
      {
        q: <>You leave at 18 h and want to wish them a good evening. <i lang="fr">La soir&eacute;e</i> — which?</>,
        a: (
          <>
            <i lang="fr">Bonne soir&eacute;e !</i> — feminine, like{" "}
            <i lang="fr">la journ&eacute;e</i>. You have never been taught this
            phrase; the rule gave it to you.
          </>
        ),
      },
      {
        q: <>Someone is about to eat. <i lang="fr">L&rsquo;app&eacute;tit</i> is masculine.</>,
        a: <><i lang="fr">Bon app&eacute;tit !</i></>,
      },
    ],
    remember: (
      <>
        <i lang="fr">Bonjour</i> and <i lang="fr">bonne nuit</i> are not two
        things to memorise. They are one adjective agreeing with{" "}
        <i lang="fr">le jour</i> and <i lang="fr">la nuit</i>.
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
