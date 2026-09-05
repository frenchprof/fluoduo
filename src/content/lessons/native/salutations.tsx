/**
 * Native "Salutations" lesson (Unité 0) — authored 2026-08-23 to the
 * LESSON_PLAN U0 #10 row (situation → the greeting; arrival vs departure):
 * Mémo + 🎲 dice trainer + EN→FR bonus. Greetings are the salutations deck's
 * own items; each situation's distractors are hand-picked so exactly one
 * answer fits (standard greetings work anywhere, casual ones don't).
 */
import { Fragment } from "react";

import { PillRow } from "@/content/memos";
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


/**
 * A row of greetings that never breaks INSIDE one of them.
 *
 * Dan, 2026-09-05, looking at the Mémo: *"it looks terrible to have à demain
 * separated into two lines"*. The tile held « Au revoir ! À demain ! À bientôt !
 * Bonne journée ! » as one string, so the browser wrapped wherever it ran out of
 * room — mid-phrase — and « À » sat alone at the end of a line with « demain ! »
 * underneath. A learner reads a greeting as one thing; the line break said it
 * was two.
 *
 * Splitting on the exclamation mark keeps it, so each phrase stays whole and the
 * wrap happens BETWEEN greetings, where a wrap belongs.
 */
function Greetings({ children }: { children: string }) {
  // Split after ! or ? — French puts a space BEFORE them, so that space belongs
  // inside the phrase and must not break either. The space BETWEEN greetings is
  // rendered outside the nowrap span, or the whole line would become one
  // unbreakable run and overflow the tile instead of wrapping.
  const parts = children.split(/(?<=[!?])\s+/);
  return (
    <p lang="fr" className="mt-1 text-[15px] font-black text-[color:var(--cahier-ink)]">
      {parts.map((g, i) => (
        <Fragment key={g}>
          {i > 0 ? " " : null}
          <span className="whitespace-nowrap">{g}</span>
        </Fragment>
      ))}
    </p>
  );
}

export const salutationsLesson: NativeLesson = {
  slug: "salutations",
  memo: (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
      <h2 className="cahier-display mb-2 text-lg font-black text-[color:var(--cahier-ink)]">Les salutations</h2>
      {/* THE LIST IS BY KIND (Dan, 2026-09-05: *"idée should explain the
          different types of expressions, and Forms give that list"*). Idée
          argues that French sorts this job into four kinds rather than one long
          list; this panel is that list, in the same four. Kinds 1 and 2 are the
          greetings and stay in the grid they were already in, because the grid
          is what shows the second axis — who you are talking to — crossing them
          both.

          The FORMS are the heroes of the lesson (Dan, 2026-08-31: "not
          salient enough — they should be in bold"), so the French is set
          bold-black and the situation labels step back to captions. */}
      <p className="fluo-label mt-3 text-[color:var(--cahier-ink-soft)]">
        Greeting — arriving, and leaving
      </p>
      <div className="mt-1 grid grid-cols-2 gap-2 text-[14px] text-[color:var(--cahier-ink)]">
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">→ arriver · anytime</p>
          <Greetings>{"Bonjour ! Bonsoir ! Enchanté !"}</Greetings>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">→ arriver · friends</p>
          <Greetings>{"Salut ! Coucou ! Ça va ?"}</Greetings>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">partir → · anytime</p>
          <Greetings>{"Au revoir ! À demain ! À bientôt !"}</Greetings>
        </div>
        <div className="rounded-xl border border-[color:var(--cahier-rule)] bg-white p-2.5">
          <p className="fluo-label text-[color:var(--cahier-ink-soft)]">partir → · friends</p>
          <Greetings>{"Salut ! À plus tard ! À plus !"}</Greetings>
        </div>
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-2.5 text-sm text-[color:var(--cahier-ink)]">
        {/* « Bonne journée » left this tile and the second half of this warning
            with it, on the same reasoning: it is a WISH, not a leaving
            greeting, and the wishing row below now says so with its own note.
            Having it in the leaving tile contradicted the very sort this panel
            is built on, and stating the bedtime rule twice on one screen is
            two answers to one question. */}
        ⚠️ <i lang="fr">Salut !</i> = hello AND bye — friends only. Every other
        greeting here goes one way or the other.
      </p>

      {/* KIND 3 · WISHING. Open, not folded, because the ⚠️ directly above it
          is about this kind and a warning whose subject is behind a chevron is
          a warning nobody reads. It is also the kind that GENERATES rather than
          lists: « bonne soirée » is not a phrase to learn once « la soirée » is
          known, which is the argument Idée makes and this row is the evidence
          for. */}
      <p className="fluo-label mt-4 text-[color:var(--cahier-ink-soft)]">
        Wishing them the time ahead — bon / bonne + a noun
      </p>
      <PillRow
        items={["Bonne journée !", "Bonne soirée !", "Bonne nuit !", "Bon week-end !", "Bon voyage !", "Bon appétit !"]}
      />
      <p className="mt-2 text-[13px] text-[color:var(--cahier-ink-soft)]">
        These are not greetings at all — you hand someone the time they are about to
        have, so they only work as you <b>leave</b>.
      </p>

      {/* VARIANTS (Dan, 2026-09-05), and his own test for what counts as one:
          « Je prends un café » is NOT a variant of « Je voudrais un café » —
          one orders, the other requests. « Merci / Merci beaucoup / Merci
          bien » are one act said three ways. Every row below is one act, so
          tapping across a row is hearing the same thing said differently, not
          meeting three new things.

          LEAVE-TAKING IS DELIBERATELY ABSENT. The grid above already shows
          « Au revoir ! À demain ! À bientôt ! Bonne journée ! » in one tile,
          which IS the variant row for it; a second copy here would be two
          answers to one question on one screen.

          Folded, per the long-pages rule: the grid and its ⚠️ are the lesson
          and stay open; this is reference and is consulted. The summary carries
          the count so a closed fold is not a bare chevron. */}
      <details className="mt-3 rounded-lg border border-[color:var(--cahier-rule)] bg-white/60 p-2.5">
        <summary className="cursor-pointer text-[13px] font-black text-[color:var(--cahier-ink)]">
          Being polite, and asking how they are — 7 rows
        </summary>
        <PillRow label="Thanking" items={["Merci", "Merci beaucoup", "Merci bien"]} />
        <PillRow label="Answering thanks" items={["De rien", "Je vous en prie", "Il n'y a pas de quoi"]} />
        <PillRow label="Asking how someone is" items={["Ça va ?", "Comment ça va ?", "Comment allez-vous ?"]} />
        <PillRow label="Answering that" items={["Ça va", "Ça va bien", "Très bien, merci"]} />
        <PillRow label="Please" items={["S'il vous plaît", "S'il te plaît"]} />
        <PillRow label="Excuse me" items={["Excusez-moi", "Pardon", "Excuse-moi"]} />
        <PillRow label="Accepting" items={["Oui, volontiers", "Avec plaisir", "Bien sûr"]} />
        <p className="mt-3 text-[13px] text-[color:var(--cahier-ink-soft)]">
          Two rows split on <b>who you are talking to</b>, not on warmth:{" "}
          <b lang="fr">s&rsquo;il vous plaît</b> and <b lang="fr">excusez-moi</b> go with{" "}
          <b lang="fr">vous</b>, <b lang="fr">s&rsquo;il te plaît</b> and{" "}
          <b lang="fr">excuse-moi</b> with <b lang="fr">tu</b>.
        </p>
        <p className="mt-2 text-[13px] text-[color:var(--cahier-ink-soft)]">
          <b lang="fr">Ça va</b> is the only one that answers itself — the same two
          words are the question and the reply, told apart by the voice alone.
        </p>
      </details>
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
    // REWRITTEN 2026-09-05. Dan: *"idée should explain the different types of
    // expressions, and Forms give that list"*.
    //
    // What was here argued bon-vs-bonne — a good argument, and the wrong one to
    // OPEN with: it answers a question about two of these expressions while the
    // learner is still holding eighteen and no way to sort them. The kinds are
    // the sort, so they are the claim now, and bon/bonne survives inside as the
    // rule for one kind — the Steps pane and two of the checks are its old
    // content, moved rather than dropped.
    subtitle: "Four kinds of expression",
    contrast: (
      <>
        English gets by on <i>hi</i> and <i>bye</i> — any hour, anyone, coming or
        going. French splits the same job four ways, and which way you are in
        decides what you may say. The four are shorter to learn than the list.
      </>
    ),
    question: (
      <>
        Why does <i lang="fr">Salut&nbsp;!</i> work as hello AND as goodbye, while{" "}
        <i lang="fr">Bonjour&nbsp;!</i> only says hello — and{" "}
        <i lang="fr">Bonne nuit&nbsp;!</i> says neither?
      </>
    ),
    answer: (
      <>
        Because they are three different kinds. <i lang="fr">Bonjour</i> GREETS an
        arrival. <i lang="fr">Salut</i> is the same greeting in the friends&rsquo;
        register, and a register has no direction, so it serves both ways. And{" "}
        <i lang="fr">Bonne nuit</i> does not greet at all: it WISHES someone the
        time ahead — <i lang="fr">bon</i> or <i lang="fr">bonne</i> plus a noun —
        which is why it belongs to the moment you leave, and only to the night.
      </>
    ),
    pitfall: [
      {
        label: <>leaving in the daytime</>,
        wrong: <><i lang="fr">Bonne nuit&nbsp;!</i></>,
        right: <><i lang="fr">Bonne journ&eacute;e&nbsp;!</i></>,
      },
      {
        label: <>greeting your professor</>,
        wrong: <><i lang="fr">Salut&nbsp;!</i></>,
        right: <><i lang="fr">Bonjour&nbsp;!</i></>,
      },
      {
        label: <>wishing, and <i lang="fr">la nuit</i> is feminine</>,
        wrong: <><i lang="fr">bon nuit</i></>,
        right: <><i lang="fr">bonne nuit</i></>,
      },
      {
        label: <>wishing, and <i lang="fr">le voyage</i> is masculine</>,
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
      { depth: 0, text: "Which kind do you need?" },
      { depth: 1, text: "arriving → Bonjour · Bonsoir · Salut" },
      { depth: 1, text: "leaving → Au revoir · À demain · Salut" },
      { depth: 1, text: "wishing them the time ahead → bon / bonne + nom" },
      { depth: 2, text: "the noun is masculine → bon voyage" },
      { depth: 2, text: "the noun is feminine → bonne nuit" },
      { depth: 1, text: "being polite → Merci · S'il vous plaît · Excusez-moi" },
    ],
    check: [
      {
        q: <>Which kind is <i lang="fr">&Agrave; demain&nbsp;!</i>?</>,
        a: (
          <>
            A leaving greeting — and one that also fixes when you next meet, which
            is why it cannot be said on the way in.
          </>
        ),
      },
      {
        q: <>You leave at 18 h and want to wish them a good evening. <i lang="fr">La soir&eacute;e</i> — which?</>,
        a: (
          <>
            <i lang="fr">Bonne soir&eacute;e&nbsp;!</i> — feminine, like{" "}
            <i lang="fr">la journ&eacute;e</i>. You have never been taught this
            phrase; the kind and its rule gave it to you.
          </>
        ),
      },
      {
        q: <>Someone is about to eat. <i lang="fr">L&rsquo;app&eacute;tit</i> is masculine.</>,
        a: <><i lang="fr">Bon app&eacute;tit&nbsp;!</i></>,
      },
    ],
    remember: (
      <>
        Ask which KIND before which word — arriving, leaving, wishing, or being
        polite. Only the wishing kind then needs a second decision, and{" "}
        <i lang="fr">bon</i> or <i lang="fr">bonne</i> follows the noun.
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
