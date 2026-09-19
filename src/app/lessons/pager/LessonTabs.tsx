"use client";

/**
 * The six tabs — Dan's own lesson framework, restored (2026-08-30).
 *
 * He sent three lessons from his original course site and said: "this
 * framework is how it should be in EVERY SIO." All three carry the same
 * tabs, in the same order, numbered as a path:
 *
 *   🗺 0 Le parcours · 💡 1 Le concept · 📖 2 Les formes
 *   📝 3 L'exercice  · 📚 4 Le lexique
 *
 * Three of them were already here under other names — the Mémo IS Les formes,
 * `dice` IS L'exercice. LE BONUS TAB IS PARKED UNDER L'EXERCICE (Dan,
 * 2026-08-31: "we can park Bonus under practice, so it does not have to have
 * its own tab") — since the chooser gained the ⭐ Bonus level, the browsable
 * pairs duplicated the exercise that serves them; the bank itself
 * (NativeLesson.bonus) still feeds the Bonus tier's translate cards.
 *
 * THIS DOES NOT REOPEN PATCH 22. The pager exists because the imported HTML
 * put "44 tappable controls before the first answer, two identical difficulty
 * pickers, three 🎲 roll buttons, a drill that never ended" in front of a
 * learner. That fix stands, and the distinction that keeps both true is:
 *
 *     the tabs are the LESSON's navigation.
 *     one card at a time is the EXERCISE's.
 *
 * So these tabs are FRONT MATTER: they exist only while `asked` is false. The
 * moment a learner picks an entry level, the tabs go and the pager takes the
 * full screen, one card at a time, exactly as before. Nothing here is
 * reachable mid-run.
 *
 * WHY THE TABS ARE NUMBERED. Not decoration — Dan's own exercise card reads
 * "Step 3 of 5: Practice", so the order is a claim about sequence: understand
 * why (concept) before how (formes) before doing it (exercice). The numbers
 * encode that, which is the only thing that earns a numbered marker.
 *
 * AN EMPTY TAB SAYS SO. `concept` is optional while 47 of them are drafted;
 * a lesson without one renders the tab with the reason it is empty, rather
 * than hiding the tab. A hidden gap is a gap nobody fixes.
 */
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import GoalCard from "@/components/GoalCard";
import TourWalk, { tourActive } from "@/components/TourWalk";
import { LESSON_TOUR_STEPS } from "@/content/tourSteps";
import type { Collection } from "@/lib/collections/schema";
import type { Sio } from "@/content/sios";
import type { LessonConcept } from "@/content/lessons/native/types";

// "lexique" is NOT here: the word list moved UNDER Forms on 2026-08-31
// (Dan: "can we put Words under Forms?"). It is a section of that panel now,
// not a destination, so it has no tab key and nothing can route to it.
// "bonus" is not here either: #97 parked it under practice the same day —
// the ⭐ Bonus level of the chooser serves those sentences.
type TabKey = "parcours" | "concept" | "formes" | "exercice";

/* THE STRIP'S HEIGHT IS NO LONGER A NUMBER ANYONE KEEPS. It used to be 56px in
   three places — `scroll-mt-14` on every row, the jump's offset and the line the
   highlight is read against — because the strip was sticky INSIDE the scroller
   and everything below it had to dodge it. Since 2026-09-07 it sits above the
   scroller (Dan: "the scrolling is to start only after the : Goal-Idea-Form-
   Exer"), so the top of the scroller IS the top: no offset, and nothing to keep
   in step when the strip changes height. */

const TABS: { key: TabKey; emoji: string; label: string; does: string; back?: boolean }[] = [
  // `does` earns the path list its place. Without it that list is the tab
  // strip retyped one inch lower, which is exactly what Dan's litmus test
  // deletes: text that, removed, costs the learner nothing.
  // ENGLISH AND SHORT (Dan, 2026-08-31). Shown the strip three ways he chose
  // "A · all six in English" — the tabs are furniture, and a beginner should not
  // have to decode the navigation before reaching the French. Mixing the two was
  // shown and rejected: one English tab among five French reads as something
  // nobody finished rather than as a decision.
  //
  // Then he cut the labels himself, to save width: "Path · Idea · Forms ·
  // Pract." — Bonus is a level of the chooser since #97, and Words lives
  // under Forms, so the strip is four tabs and fits a phone without hiding
  // any at the scrolled-off end.
  // The emoji set is Dan's, sent as four emoji for the four tabs (2026-08-31,
  // choosing the one-row strip): ➡️ the path ahead · 💡 the idea · 📐 the
  // forms measured out · 🏋️ the workout.
  //
  // AND THEN DAN REVERSED THE LANGUAGE, 2026-09-05: *"i think we can use those
  // french words, they are simple single words"*, having just written them
  // himself — Idée, Forme, Exercice. The English ruling above is not deleted
  // because it was right for what it decided: the reason a beginner should not
  // decode navigation is that navigation is furniture. « Idée », « Formes » and
  // « Exercice » are cognates a first-week learner reads without being taught,
  // so they cost nothing and the lesson's own parts stop being labelled in a
  // language the lesson is not in.
  //
  // GOAL STAYS ENGLISH, and that is the same rule rather than an exception: it
  // is not one of the lesson's parts, it is the name of the 🎯 Goals family the
  // learner came from, and FAMILIES spells it that way once for the whole app.
  // Its ← says so — Dan wrote the tab as "<-- 🎯 Goal", an arrow out of the
  // lesson rather than a step in it.
  //
  // AND REVERSED AGAIN, 2026-09-16, TO ENGLISH — Dan: *"should name
  // consistently: Goal Idea Form Exercise"*, on the same day he sent the Forms
  // page back for carrying *"way too much french in there for a beginner"*.
  // Four tabs in one language, the language the chrome is in; the 5 Sep
  // cognate argument lost to consistency, and the 31 Aug ruling — navigation
  // is furniture, a beginner does not decode it — is back in force in full.
  // KEYS DO NOT MOVE (the Memo-rename precedent): `formes` and `exercice` are
  // addresses and storage, and a display rename never touches those.
  //
  // FORM COMES BEFORE IDEA (Dan, 2026-09-16): *"MeMoiRecall might be better
  // even right after SpecuLearn, and before the Lesson Idea and Exercises"*,
  // then, offered a fifth tab for the cards: *"are cards and forms not the
  // same thing, they should be put under the same umbrella. STOP MULTIPLYING
  // CATEGORIES"*. So the cards stayed inside Form, and Form — the Mémo with
  // MémoiRecall folded under it — is the tab right after Goal.
  //
  // REVERSED AGAIN 2026-09-19, LATER THE SAME DAY — Dan: *"please reinstate
  // that a section of its own outside of MneMemo (Yes I am undoing an
  // earlier call, and i am aware), so no more hiding MémoiRecall as an
  // embedded page within MneMemo — it looks awful."* The cards tab is GONE;
  // MémoiRecall is a standalone station again (/practice/flip-it, with its
  // doors in the ☰ menu and on the goal page), never an embedded frame in
  // the lesson. Four tabs, as ever. The lesson still LANDS on Idea (13 Sep).
  { key: "parcours", emoji: "🎯", label: "Goal", back: true, does: "the goal this lesson serves" },
  { key: "formes", emoji: "📐", label: "Form", does: "the forms themselves" },
  { key: "concept", emoji: "💡", label: "Idea", does: "why French does it this way" },
  { key: "exercice", emoji: "🏋️", label: "Exercise", does: "use them, one card at a time — 🎁 Bonus included" },
];

/**
 * Section heading inside a panel.
 *
 * Dan, 2026-08-31, reading the concept tab: *"the page can be better organised
 * (the headings are hardly salient). and i can hardly make out the sections
 * from each other."* He was right — these were `fluo-label`: small, uppercase
 * and in the SOFT ink, the same treatment the app gives throwaway captions. A
 * heading in the caption style is not a heading, it is a caption sitting where
 * a heading should be, and nothing separated one section from the next.
 *
 * Three changes, and each does one job: a **rule above** cuts the sections
 * apart, a **coloured marker** in the lesson's own family hue gives the eye
 * something to land on down the left edge, and the text moves to **full ink at
 * black weight** so it outranks the prose beneath it. The first heading drops
 * its rule — a divider above the first item separates it from nothing.
 */
// NO `first:` VARIANTS HERE, on purpose. A <summary> is ALWAYS the first child
// of its <details>, so `first:mt-0 first:border-t-0` fired on every collapsible
// section and stripped the rule and the margin off all of them — the folds sat
// flush against the paragraph above while the plain headings kept their rule.
// Found by looking at the rendered page, not the class list. The reset now
// belongs to whoever is actually first in the PANEL: `first:` on the <h3>,
// and a child-targeting variant on the <details>.
const HEAD =
  "mt-8 flex items-center gap-2.5 border-t-2 border-[color:var(--cahier-rule)] pt-3.5" +
  " text-[13px] font-black uppercase tracking-[0.09em] text-[color:var(--cahier-ink)]";

const HEAD_FIRST = "first:mt-0 first:border-t-0 first:pt-0";

const MARKER =
  "inline-block h-3.5 w-1 shrink-0 rounded-full bg-[color:var(--fam-ink,var(--cahier-ink))]";

function H({ children }: { children: ReactNode }) {
  return (
    <h3 className={`${HEAD} ${HEAD_FIRST}`}>
      <span aria-hidden className={MARKER} />
      {children}
    </h3>
  );
}

/**
 * A section that can be folded away.
 *
 * Dan, 2026-08-31: *"now that the page is long please collapse part of it. can
 * you make it a rule for all — this is the rule from now on."* The rule is in
 * AGENTS.md; this is the one component that implements it, so a second panel
 * cannot invent a different disclosure.
 *
 * WHAT OPENS AND WHAT CLOSES. The argument stays open, the apparatus collapses:
 * a learner READS the claim and its answer, and CONSULTS the pitfall table, the
 * decision flow and the word list. Consulting is what a fold is for.
 *
 * `note` is not decoration — a closed section has to say what is behind it
 * ("18 words", "3 traps"), or nobody opens it and collapsing becomes deletion
 * with extra steps.
 *
 * NATIVE `<details>`, deliberately. Keyboard operation, the screen-reader
 * expanded/collapsed state and find-in-page all come free; a `useState` div
 * would have to reimplement three of those and would get one of them wrong.
 * `[&::-webkit-details-marker]:hidden` drops Safari's default triangle so the
 * chevron below is the only one.
 */
function Section({
  title, note, children, open = false, folds = true,
}: {
  title: ReactNode;
  note?: string;
  children: ReactNode;
  open?: boolean;
  folds?: boolean;
}) {
  if (!folds) {
    return (
      <>
        <H>{title}</H>
        {children}
      </>
    );
  }
  return (
    <details
      open={open}
      className="group first:[&>summary]:mt-0 first:[&>summary]:border-t-0 first:[&>summary]:pt-0"
    >
      <summary
        className={`${HEAD} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        <span aria-hidden className={MARKER} />
        <span>{title}</span>
        {note && (
          <span className="font-mono text-[10px] font-bold normal-case tracking-normal text-[color:var(--fluo-ink-soft)]">
            {note}
          </span>
        )}
        <span
          aria-hidden
          className="ml-auto text-[color:var(--fluo-ink-soft)] transition-transform group-open:rotate-90 motion-reduce:transition-none"
        >
          ▶
        </span>
      </summary>
      {children}
    </details>
  );
}


function Panel({ children }: { children: ReactNode }) {
  /* THE CUE LIVES IN `DrillShell`, NOT HERE. One panel is visible at a time
     and this component renders inside that shell's scroller, so a copy here
     would be the same cue twice on one screen. Moved up 14 Sep when Dan asked
     for it *"everywhere that requires the user to go to the next section"* —
     the shell is every drill in the app, this file is one of them. */
  return <div className="pb-4 pt-3 text-[15px] leading-relaxed text-[color:var(--cahier-ink)]">{children}</div>;
}

/** A tab with nothing behind it yet. Names what is missing and who owes it,
 *  because "coming soon" tells a learner nothing and tells us less. */
function Empty({ what }: { what: string }) {
  return (
    <Panel>
      <p className="rounded-xl border-2 border-dashed border-[color:var(--cahier-rule)] p-4 text-center text-sm font-bold text-[color:var(--fluo-ink-soft)]">
        {what}
      </p>
    </Panel>
  );
}

/* ── 0 · Le but ────────────────────────────────────────────────────────────
 * Dan, 2026-09-05: *"Path should by now be renamed as '<-- 🎯 Goal', and
 * display only the SIO description with the links to items."*
 *
 * THREE THINGS LEFT, AND WHY EACH. What was here was `canDo`, `competence`,
 * and a numbered list of the four tabs.
 *
 *   · The tab list was the strip retyped one inch lower. A learner can see the
 *     four tabs above it; the list told them nothing the strip did not, which
 *     is exactly what the litmus test deletes. (The file's own comment said as
 *     much — "without `does` that list is the tab strip retyped" — and then
 *     kept it anyway.)
 *   · `canDo` and `competence` are two sentences of the same goal, written for
 *     two different readers: the learner and the syllabus. Showing both makes
 *     the learner read the assessment criteria to find their own goal.
 *   · The LINKS were missing entirely, and they are the reason the tab is a
 *     way back: everything else this stop offers — its pre-test, its cards,
 *     its games — lives on the goal, not in this lesson.
 *
 * So: the description, then the items, then the goal itself. */
function Parcours({ sio }: { sio?: Sio }) {
  if (!sio) {
    return <Empty what="This lesson is not wired to a curriculum objective, so there is no goal to show." />;
  }
  return (
    <Panel>
      {/* ONE CARD, TWO DOORS. This is the same GoalCard the /sio scroller
          shows, from one file: the tab is a shortcut to that page, and two
          hand-written copies of a goal is how the old /sio page came to say
          "Planned" for pre-tests that existed. */}
      <GoalCard sio={sio} compact />

      {/* CONTENT-SIZED, NOT THE WHOLE WIDTH (Dan, 2026-09-05: "IT HAS BEEN
          MADE A RULE THAT WE NEVER WANT TO HAVE A SINGLE BUTTON OCCUPYING THE
          ENTIRE WIDTH"). A `flex` link is a block, so it took the card's full
          width for four characters. `inline-flex` in a centred line sizes it
          to what it says. */}
      <div className="mt-4 flex justify-center">
        <Link
          href={`/sio/${sio.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[color:var(--cahier-ink)] px-3 py-2 text-[13px] font-black text-[color:var(--cahier-ink)] no-underline"
        >
          ← 🎯 {sio.id}
        </Link>
      </div>
    </Panel>
  );
}

/* ── 1 · Le concept ────────────────────────────────────────────────────────
 * THE MERRILL SEQUENCE (Dan's research-agent spec, 2026-09-19): meaningful
 * task → demonstration → application → integration, as the SHORTEST sequence
 * that lets an absolute beginner perform the target task — Model → optional
 * Cue → optional Contrast → Retrieve/Produce, no fixed pane count, and the
 * anti-redundancy rule: no pane that only paraphrases the cue. The fields are
 * unchanged; the sequence re-groups them:
 *   See it  — the worked instance (question, then the answer's correct
 *             sentences): the demonstration, and the question invites a
 *             guess before the teaching (the pretesting effect).
 *   The rule — the claim + the decision flow: the cue, only where a choice
 *             must be made.
 *   Traps   — the wrong/right contrast, only where the data says a
 *             consequential confusion exists.
 *   Try it  — the answer-hidden retrieval; the attempt comes before the
 *             feedback (the engagement rule).
 * THE SUM-UP PANE IS RETIRED by the anti-redundancy rule — it repeated the
 * cue's decision flow. `inShort` and `remember` stay in the data, unrendered.
 * The spec's DELAYED REVIEW is served by the app's own spaced station
 * (ErroReview / DéjàRevu), not by a pane. */
function Concept({ c }: { c?: LessonConcept }) {
  const [pane, setPane] = useState<"model" | "cue" | "traps" | "try">("model");
  if (!c) {
    return <Empty what="Idea has not been written for this lesson yet. Form has the rules in the meantime." />;
  }

  /* SIDE-BY-SIDE PANES, NOT A STACK (Dan, 2026-08-31: *"broken into
     side-by-side tabs that allows everything to be visible on the same screen
     all at once… i would prefer the latter"*, offered against expand-collapse).

     A fold answers "is it short enough yet?" one section at a time and still
     leaves the reader scrolling to find out how many there are. A strip answers
     it once: every part of the concept is named in a row you can see, and the
     pane below is short by construction. The count moves from the fold's label
     into the strip, so nothing is hidden behind a bare chevron.

     THE CLAIM IS THE DEFAULT PANE, and that is not a detail. verify68 pins the
     argument — subtitle, contrast, question, answer — as open on arrival:
     "apparatus collapses; the argument never does". A strip whose first pane is
     the claim keeps that promise, where a strip that opened on the pitfall
     table would break it while passing the check.

     `useState`, not `<details>`, because a pane is a choice between siblings
     rather than a disclosure. The first pane renders server-side, so there is
     no hydration flash — the claim is in the static HTML either way. */
  const PANES = [
    ["model", "See it", null],
    ["cue", "The rule", c.flow?.filter((l) => l.depth === 0).length ?? 0],
    ["traps", "Traps", c.pitfall?.length ?? 0],
    ["try", "Try it", c.check?.length ?? 0],
  ] as const;
  const shown = PANES.filter(([k]) =>
    k === "model" || k === "cue"
      ? true
      : k === "traps" ? !!c.pitfall?.length
      : !!c.check?.length);

  return (
    <Panel>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {shown.map(([k, label, n]) => (
          <button
            key={k}
            type="button"
            onClick={() => setPane(k)}
            aria-pressed={pane === k}
            className={`rounded-full border-2 px-2.5 py-1 text-[12px] font-black transition ${
              pane === k
                ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-ink)] text-[color:var(--cahier-paper)]"
                : "border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] text-[color:var(--cahier-ink-soft)]"
            }`}
          >
            {label}
            {n ? <span className="ml-1 font-mono text-[10px] opacity-70">{n}</span> : null}
          </button>
        ))}
      </div>

      {/* SEE IT — the demonstration (Merrill's first principle after the
          task): the question names a concrete, meaningful instance and
          invites a guess; the answer shows the correct language. On
          arrival, because a demonstration before the rule is the sequence's
          whole point. */}
      {pane === "model" && (
        <>
          <h2 className="cahier-display text-lg font-black leading-tight">{c.subtitle}</h2>
          <p className="fluo-label mt-2 text-[color:var(--fluo-ink-soft)]">One question</p>
          <p className="mt-1 text-base font-bold">{c.question}</p>
          <div className="mt-3">{c.answer}</div>
        </>
      )}

      {/* THE RULE — the cue: the claim and, where a choice must be made,
          the decision flow under it. A DIV, NOT A P — a lesson's contrast
          may be POINT FORM (Dan, 2026-09-18), and a list cannot live inside
          a paragraph. String content renders exactly as it did. */}
      {pane === "cue" && (
        <>
          <div>{c.contrast}</div>
          {c.flow && (
            <div className="mt-3 overflow-x-auto rounded-xl bg-[color:var(--cahier-paper-raised)] p-3">
              {c.flow.map((line, n) => (
                <p
                  key={n}
                  className="whitespace-pre font-mono text-[13px] leading-6"
                  style={{ paddingInlineStart: `${line.depth * 1.4}rem` }}
                >
                  {/* A WORD NOT IN THE LINE'S LANGUAGE IS ITALICISED (Dan,
                      2026-09-19). A flow line reads "English condition →
                      French forms": everything after the arrow carries
                      lang="fr" in italics; a line with no arrow stays as
                      authored. */}
                  {(() => {
                    const at = line.text.indexOf("→");
                    if (at < 0) return line.text;
                    return (
                      <>
                        {line.text.slice(0, at + 1)} <i lang="fr">{line.text.slice(at + 2)}</i>
                      </>
                    );
                  })()}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {pane === "traps" && c.pitfall && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-[color:var(--cahier-rule)] text-left text-[12px]">
                <th className="py-1 pr-3" />
                <th className="py-1 pr-3 font-bold text-[color:var(--drill-bad-mid)]">✗ {c.pitfallHeads?.[0] ?? "English logic"}</th>
                <th className="py-1 font-bold text-[color:var(--drill-ok)]">✓ {c.pitfallHeads?.[1] ?? "French logic"}</th>
              </tr>
            </thead>
            <tbody>
              {c.pitfall.map((row, n) => (
                <tr key={n} className="border-b border-[color:var(--cahier-rule)]/60 align-baseline">
                  <td className="py-1.5 pr-3 font-bold">{row.label}</td>
                  <td className="py-1.5 pr-3 text-[color:var(--drill-bad-mid)] line-through">{row.wrong}</td>
                  <td className="py-1.5 font-bold text-[color:var(--drill-ok)]">{row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pane === "try" && c.check && (
        <div className="flex flex-col gap-2">
          {c.check.map((x, n) => (
            // <details> here still: the ANSWER must stay hidden until asked for,
            // which is a disclosure, not a change of pane.
            <details key={n} className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] p-3">
              <summary className="cursor-pointer font-bold">{x.q}</summary>
              <div className="mt-2">{x.a}</div>
            </details>
          ))}
        </div>
      )}

      {/* NO SUM PANE — retired by the spec's anti-redundancy rule
          (2026-09-19): "a final Sum up pane is normally omitted." The
          delayed review it cannot substitute for is the spaced station's
          job. */}
    </Panel>
  );
}

/* ── 2 · Form — the pattern, then MémoiRecall ──────────────────────────────
 * Dan, 2026-08-31: "can we put Words under Forms?" — then 2026-09-16, of the
 * word list that put there: *"That is actually the MemoiRecall section. We do
 * not need to repeat it if it is already in there"* — and, an hour later, of
 * the hole that left: *"maybe it is better to bring MemoiRecall back at where
 * you removed the list, because honestly you created MemoiRecall out of that
 * list in the first place and moved it out of my lesson when it was supposed
 * to be a part of it."*
 *
 * So the slot under the Mémo holds MÉMOIRECALL ITSELF — the deck's flashcards,
 * the real station, not a second drawing of its words. It runs in a frame,
 * the way every station runs inside the cahier (EmbedFrame's reasoning: a
 * station in its own document cannot scroll the page it sits on), pointed at
 * the deck's own `/practice/flip-it/<deck>/embed`. Nothing is duplicated:
 * MémoiRecall's door on the goal and this fold open the same page.
 *
 * FOLDED, WITH ITS COUNT, and the Mémo above it is not. The Mémo is the
 * lesson — the collapse rule's one exception — and it stands unheaded because
 * a heading over the only thing in view is furniture. The flashcards are the
 * apparatus a learner consults, so they start closed and the fold says what
 * is behind it (« 34 cards »), which is what makes a closed fold worth
 * opening. `loading="lazy"` means a closed fold costs nothing: the station
 * loads the first time the fold is opened, not with the lesson. */
function Formes({ memo, formLayout }: { memo?: ReactNode; formLayout?: string }) {
  if (!memo) return <Empty what="No Mémo for this lesson." />;
  /* THE FOUR FORM TEMPLATES (LESSON_SPEC.md §3, Dan 2026-09-19: "let's go
     do it") — different lessons teach different KINDS of things, so the Form
     tab DISPLAYS them differently. The content is always the authored memo
     JSX; the template is the container that says what shape the learner is
     looking at:

       table    — bordered grid, the grammar paradigm (the default)
       list     — flowing items, one pattern repeated; no table borders
       dialogue — chat-bubble treatment, short exchanges

     The tag lives on each lesson (formLayout: "table" | "list" | ...),
     declared per lesson from what it teaches — not from a schema lookup. */
  const layout = formLayout ?? "table";
  return (
    <Panel>
      {/* THE TEMPLATE BADGE — a small, quiet label above the memo that names
          the shape, so a learner moving between lessons sees the Form tab
          change character honestly rather than just "look different." */}
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--cahier-ink)]/40">
        {layout === "table" ? "📐 The pattern" : layout === "list" ? "📋 The set" : layout === "dialogue" ? "💬 The exchange" : layout === "audio" ? "🔊 The sound" : "📐 The pattern"}
      </p>
      {layout === "dialogue" ? (
        /* DIALOGUE — the memo renders inside a speech-bubble treatment:
           each turn indented alternately, the way a text conversation reads.
           The authored memo already carries the lines; this wraps them. */
        <div className="dialogue-frame rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/80 p-3 [&_p]:rounded-lg [&_p]:px-3 [&_p]:py-1.5 [&_p:nth-child(odd)]:bg-[color:var(--cahier-hl)]/30 [&_p:nth-child(odd)]:mr-8 [&_p:nth-child(even)]:ml-8 [&_p:nth-child(even)]:bg-white [&_p]:border [&_p]:border-[color:var(--cahier-rule)]/50">
          {memo}
        </div>
      ) : layout === "list" ? (
        /* LIST — the memo renders as a flowing set, no table borders; each
           item gets breathing room and the pattern repeats visually. */
        <div className="list-frame rounded-xl border-2 border-dashed border-[color:var(--cahier-rule)] bg-white/60 p-3">
          {memo}
        </div>
      ) : (
        /* TABLE — the grammar paradigm in its bordered grid. This is the
           default and today's shape; the authored memo already carries the
           two-column grid. */
        <div className="table-frame">
          {memo}
        </div>
      )}
    </Panel>
  );
}


/** "1 card" / "34 cards" — a fold's note is learner-facing text, and "1 cards"
 *  on a language-learning app undermines the product it labels. */
function count(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default function LessonTabs({
  sio,
  deck,
  concept,
  memo,
  formLayout,
  exercise,
  open = "concept",
}: {
  sio?: Sio;
  deck?: Collection;
  concept?: LessonConcept;
  /** Les formes — the Mémo, exactly as the run's rule card renders it. */
  memo?: ReactNode;
  /** Which of the four Form templates this lesson wears (LESSON_SPEC §3). */
  formLayout?: "table" | "list" | "audio" | "dialogue";
  /** L'exercice — the entry-level chooser. Picking a level ends the tabs. */
  exercise: ReactNode;
  /**
   * Which tab is open on arrival. Default "concept" (« Idée ») — see below.
   *
   * The ateliers pass "formes" (Dan, 2026-08-31: *"Atelier's Memo is to open
   * on the range of sentences and vocabulary one is expected to use or
   * understand. Simple as that"*). An atelier is a PRODUCTION stop: the task
   * is to perform the exchange in class, so the model and its words are the
   * thing to arrive at, and « Choose your level » is a question a learner
   * cannot yet answer about material they have not seen.
   */
  open?: TabKey;
}) {
  // OPENS ON « Idée » (Dan, 2026-09-13: *"MneMemo is still landing immediately
  // on Exercice, it should land on Idee"*).
  //
  // It defaulted to « Exercice » on the reasoning that "a learner returning to
  // a lesson they know wants the exercise". That reads the wrong learner: the
  // door into MneMemo is the LESSON, and a lesson that opens on its own
  // exercise has skipped itself — the rule is what the learner came for, and
  // the drill is three taps away either way. The returning learner Dan's old
  // note describes still has the tab bar, which is the point of a tab bar.
  //
  // The ateliers keep their own "formes" (below), which was always an explicit
  // override rather than a consequence of this default.
  //
  // `open` is the initial value only, never a controlled prop: once a learner
  // taps a tab the choice is theirs, and a re-render must not pull them back.
  const [tab, setTab] = useState<TabKey>(open);

  /* ── COLUMNS SIDEWAYS, ROWS DOWNWARDS ─────────────────────────────────
     Dan, 2026-09-06, thinking the navigation through: a COLUMN is a station on
     the chain (Map > Goal > SpecuLearn > MneMemo > MémoiRecall > Skills >
     Games > User) and you move between columns SIDEWAYS; a ROW is one item
     inside a station and you move between rows by scrolling DOWN. Then, shown
     that the lesson did neither: *"it should swipe vertically - that is the
     right behaviour"*.

     So this file gave up two things and gained one.

     GONE, SIDEWAYS. The strip used to carry its own swipe handler that walked
     the four tabs and, off the left end, pushed to the goal — one of only two
     horizontal gestures in the whole app, each with its own copy of the
     arithmetic. The chain lives in `lib/swipeRail.ts` now and one handler
     reads it for every page, so a sideways drag here LEAVES the lesson.

     GONE, ONE-AT-A-TIME. The four panels were `tab === "formes" && <Formes/>`
     — three of them unmounted at any moment, so there was nothing to scroll
     to. All four are in the document now, in Dan's order, each marked
     `snap-start`; DrillShell's own body scroller is the magnet (`snapRows`).
     Scrolling down runs Goal -> Idée -> Formes -> Exercice.

     WHY NOT ONE PANEL PER SCREEN, the way the goals and the pre-test do it: a
     lesson panel is not one item. Formes measures 2512px against a 516px
     viewport at 390 wide, so forcing it into a screen would mean a scroller
     inside a scroller — two boxes fighting over one finger. A snap area
     LARGER than the snapport imposes no rest position, so a long panel scrolls
     freely through and the next panel's top is the magnet. Short panel: one
     swipe, one panel. Long panel: doom-scroll, then a magnet. Both from one
     rule, which is why there is no height on these sections.

     THE STRIP STAYS, as an index rather than a switch. It says which panel you
     are in (an observer, not a click, so it is right when you arrive by
     scrolling) and a tap jumps to one. `touch-pan-y` stays too, and matters
     more now: it declares the vertical to be the browser's and leaves the
     sideways drag for the rail to read. */
  const box = useRef<HTMLDivElement | null>(null);

  /* WHICH PANEL AM I IN — read off the scroll, never off the last tap.
     A learner who arrives by scrolling never tapped anything, so the strip has
     to answer this from the scroll position or it lies.

     NOT AN IntersectionObserver, having shipped one and measured it wrong
     twice. "Which panel is visible" has no single answer — at the bottom of
     the lesson, Formes and Exercice are both in the top band, and picking the
     first of them in tab order names the panel you have just LEFT. And a
     panel taller than the viewport is never mostly visible, so any threshold
     high enough to disambiguate is one it can never meet.

     "Which panel am I IN" does have a single answer: the LAST one whose top
     has passed the line under the sticky strip. One rule, no ties, and it is
     still right at the very bottom of the scroll — where the last panel can
     never reach its own snap position, because there is not a screenful of
     content left below it. */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const root = el.closest(".overflow-y-auto") as HTMLElement | null;
    if (!root) return;
    const rows = [...el.querySelectorAll<HTMLElement>("[data-tab]")];

    /* A ROW IS AT LEAST A SCREENFUL, AND THE SCREENFUL IS MEASURED.
       Without this the LAST panel can never snap to the top: reaching its snap
       position needs a screenful of content below it, and there is none — so
       the lesson ended with Exercice sitting 144px down, under the tail of
       Formes, and the strip (correctly) still said Formes. Measured on a 390px
       phone: scroller 666 tall, rows 506, and 610 is what the last row needs.

       Written as a custom property on this box rather than a Tailwind constant
       because 666 is not a number anyone can write down — it is the screen
       minus the site bar, the band, the strip above it and whatever the phone's own
       toolbars are doing this second. `min-h-[60vh]` stays as the fallback for
       the first paint, before this has run. */
    const fitRows = () => {
      // The scroller's own height IS the row height now: the strip is above it
      // rather than inside it, so there is nothing left to subtract.
      el.style.setProperty("--row-min", `${Math.max(240, root.clientHeight)}px`);
    };
    fitRows();
    window.addEventListener("resize", fitRows);

    const read = () => {
      // +8 rather than exactly the strip's edge: a snapped panel rests with
      // its top ON the line, and floating-point scroll positions land either
      // side of it.
      const line = root.getBoundingClientRect().top + 8;
      let cur = rows[0];
      for (const r of rows) if (r.getBoundingClientRect().top <= line) cur = r;
      const k = cur?.dataset.tab as TabKey | undefined;
      if (k) setTab(k);
    };
    read();
    root.addEventListener("scroll", read, { passive: true });
    return () => {
      root.removeEventListener("scroll", read);
      window.removeEventListener("resize", fitRows);
    };
  }, []);

  /* MOVE THE SCROLLER, NOT EVERY ANCESTOR.
     `scrollIntoView` walks up and scrolls each scrollable ancestor including
     the WINDOW — and this page sits inside a document 90px taller than the
     viewport, so tapping a tab took the site bar and the ✕ band off the top,
     which is the opposite of the frozen header the feed is built around. The
     goals scroller met the same trap on 2026-09-05 and the answer was the
     same: compute the delta and move the one box that should move.

     No offset any more: the strip is above the scroller since 2026-09-07, so
     the top of the scroller is already below the tabs. */
  /* THE STRIP LEAVES THE SCROLL BOX (Dan, 2026-09-07: *"the scrolling is to
     start only after the : Goal-Idea-Form-Exer"*).

     It was `position: sticky` inside the scroller, which LOOKS the same and is
     not: a sticky element is still in the flow, so a row snapping to the top of
     the scroller arrives UNDER it — which is why every row carried a
     `scroll-mt-14` matching the strip's height, a number kept in step by hand
     and wrong the moment the strip changed. DrillShell renders a slot above the
     scroller (`[data-subhead]`); the strip goes there.

     A PORTAL rather than a prop, because the strip's state is this file's: it
     knows which panel the scroll has settled on. Passing that up through the
     pager only to hand it back down would put the strip and the panels in two
     places that can disagree about which tab is lit. If the slot is not there —
     any other shell — it renders inline exactly as before. */
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(box.current?.closest(".cahier-drill")?.querySelector("[data-subhead]") as HTMLElement | null);
  }, []);
  const portal = (node: ReactNode) => (slot ? createPortal(node, slot) : node);

  function goTo(k: TabKey, smooth: boolean) {
    const row = box.current?.querySelector<HTMLElement>(`[data-tab="${k}"]`);
    const root = box.current?.closest(".overflow-y-auto") as HTMLElement | null;
    if (!row || !root) return;
    const delta = row.getBoundingClientRect().top - root.getBoundingClientRect().top;
    root.scrollTo({ top: root.scrollTop + delta, behavior: smooth ? "smooth" : "instant" });
  }

  /* LAND ON THE PANEL THE CALLER ASKED FOR. The ateliers open on Formes (Dan,
     2026-08-31); everyone else opens on Exercice. Instant, not smooth — a
     learner should arrive there, not watch the lesson scroll past. */
  useEffect(() => {
    goTo(open, false);
  }, [open]);

  return (
    /* THE TABS SIT WITH THE BAND, not a beat below it (Dan, 2026-08-31, shown
       four gaps rendered on the page and picking 8px).

       `-mt-5` cancels most of DrillShell's `pt-6` content padding, and does it
       HERE rather than there on purpose. That padding is shared by all 28
       DrillShell surfaces and encodes a ruling of Dan's from 11 Aug — a drill
       CARD must start a fixed beat below the bar, because a short card floating
       under a header-sized hole was wrong. Cutting it at source would reopen
       that on every drill to tidy one lesson page.

       Tabs are not a card. They are header furniture, so they belong against
       the header; the drill content below keeps its beat untouched. Measured at
       390px: band-to-tabs 28px -> 8px.

       TWO VALUES because the padding it cancels has two: `pt-6` (24px) on a
       phone, `sm:pt-10` (40px) above it. One offset gave 8px on the phone and
       24px on a desktop — the same gap Dan had just rejected, surviving at the
       width he was not looking at. */
    /* TWO THINGS THIS NEEDED AND DID NOT HAVE (Dan, 2026-09-06: *"none of the
       swiping seems to be working"*).

       1 · `touch-action: pan-y`. Without it the browser owns the gesture and
           decides what a horizontal drag means. Declaring that the only NATIVE
           gesture here is vertical panning is what hands sideways movement to
           JavaScript at all — on a page whose content sits in a vertical
           `overflow-y-auto`, that is the difference between a handler that runs
           and one that never sees the finger.

       2 · `touchcancel`. When the browser DOES claim a gesture mid-drag it ends
           the sequence with `touchcancel`, not `touchend` — and this listened
           only for `touchend`, so the swipe died silently, which is exactly the
           symptom: nothing happens, no error, every time. The last position is
           tracked on `touchmove` so a cancelled gesture can still be judged on
           where the finger actually got to.

       Shipped 5 Sep without ever driving a touch gesture — the handler was
       written, typechecked and never once tried. */
    <div ref={box} className="-mt-5 touch-pan-y pt-1 sm:-mt-9">
      {/* ONE ROW, four equal columns (Dan, 2026-08-31: "it seems we cannot
          squeeze the four in a row, then why"). The why was 4px: the pills
          kept the padding they wore as six, and 332px of tabs met a 328px
          strip, so "Pract." wrapped. A grid fits by construction at every
          width and never hides a tab — the fault `overflow-x-auto` had, which
          is how "Words" once vanished off the end of the strip. Shown to Dan
          against no-emoji and tightened-padding variants; he chose this and
          sent the four emoji himself. */}
      {/* THE DOTTED LINE IS THE FREEZE BOUNDARY (Dan, 2026-09-05, drawing it on
          a screenshot: *"the dotted line needs to be the separation line
          between the frozen part and the scrollable part"*).

          Most of the freeze was already there and invisible, which is why it
          needed saying: the site bar is `sticky top-0 z-30`, the ✕ MneMemo band
          sits above DrillShell's content, and the SCROLLER is an inner
          `overflow-y-auto` div — measured on a long Formes panel at 390px, 2512
          scrollable inside 516 visible. So `top-0` here is the top of THAT
          scroller, not of the window, and the first attempt's 96px offset (bar
          + band) was measuring the wrong box.

          What was missing was the strip itself and the line. The strip needs an
          opaque ground: it scrolls over ruled paper, and a transparent sticky
          element shows the rules sliding through the tabs. */}
      {portal(
      <div
        role="tablist"
        aria-label="Lesson sections"
        /* data-tour: MneMemo's guided first run opens here (content/hints.ts).
           The anchor lives in THIS component, which runs inside the lesson's
           frame — the same document as the walk. The page tour that used to
           teach this strip ran in the document OUTSIDE the frame and could
           never see it; see the note in FirstTour.tsx. */
        data-tour="lesson-tabs"
        className="sticky top-0 z-10 grid grid-cols-4 gap-1 border-b-2 border-dashed border-[color:var(--cahier-ink)]/35 bg-[color:var(--cahier-paper)] pb-2"
      >
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => goTo(t.key, true)}
              className={[
                // The sub-360 step exists for 320px phones: a column there is
                // ~61px and "📐 Forms" at 13px is ~63 — the two widest pills
                // clipped. Measured, not guessed.
                // STACKED, emoji over word, exactly as the bottom bar stacks
                // 🎯 over Goals. Measured on 2026-09-05 when the labels went
                // French: in one row « 🏋️ Exercice » needs 67px and the cell is
                // 59px at 360, 49px at 320 — three of the four tabs overflowed,
                // and the two ways out of that were dropping Dan's emoji or
                // shortening the words he had just chosen. Stacking costs ~14px
                // of height and keeps both, and it is what the app's own
                // navigation already looks like one bar lower.
                // py-2, was py-1: Color measured these at 36.8-41.3px tall —
                // under PR 192's 44px tap floor — and 4px apart, too close
                // for the invisible halo (its own note forbids halos on
                // neighbours nearer ~10px). Real height is the remedy
                // (STATUS 6 Sep / issue 193): +8px vertical clears 44 at
                // every width. ("PR 192", not the usual hash form — the
                // hex ratchet reads a hash plus three digits as a colour.)
                "flex flex-col items-center justify-center gap-0 rounded-xl border-2 px-0.5 py-2 text-[11px] font-black leading-tight transition min-[360px]:text-[12px] min-[390px]:text-[13px]",
                on
                  ? "border-[color:var(--cahier-ink)] bg-[color:var(--fam-ink)] text-white"
                  : "border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] text-[color:var(--fluo-ink-soft)]",
              ].join(" ")}
            >
              {/* The number is gone from the STRIP, by Dan's litmus test: the
                  tabs sit in order left to right, so the digit tells a learner
                  nothing they cannot already see, and it cost ~14px per tab
                  across six tabs. The path list still numbers them 1-6, where
                  the sequence is the actual claim being made. */}
              {/* The ← is Dan's own, from "<-- 🎯 Goal": it says this tab
                  leaves the lesson rather than moving along it, which is the
                  same thing a rightwards swipe does. */}
              <span aria-hidden className="leading-none">
                {t.back && <span className="opacity-70">← </span>}
                {t.emoji}
              </span>
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>
      )}

      {/* ALL FOUR, IN DAN'S ORDER, each a row of the scroll.
          `scroll-mt-14` is the strip's own height: without it a snapped panel
          arrives underneath the sticky tabs and its first line is never read.
          EVERY ROW IS AT LEAST A SCREENFUL, and it was tried the other way
          first. Letting short panels size to their content removes the blank
          paper — and breaks the rule that pays for it: with Goal and Idée
          both short, their tops sit ~350px apart and ONE flick jumps clean
          past Idée to Formes. Measured. That is continuous scrolling with a
          tidy ending, which is exactly what Dan ruled out on the goals ("it
          should stop rather than continuous scroll. the magnet stops it").
          It is also what lets the LAST row reach the top at all: resting
          there needs a screenful below it, and Exercice has nothing below it.

          AND IT STARTS AT THE TOP, not centred (Dan, 2026-09-07: *"why is
          there so much space between the four icons and the choose your
          level"*). Centring a short panel in a screenful puts half the slack
          ABOVE it — measured on the Exercice panel at 390px, 250px of ruled
          paper between the tab strip and « Choose your level », which reads as
          a page that failed to load rather than as breathing room. The slack
          all goes to the bottom now, where it is the end of a panel and looks
          like one. It is also what the goals scroller does since the same day,
          for the same reason: a learner should find the same thing in the same
          place on every screen of a feed.

          60vh is the pre-measurement fallback and lives INSIDE the var(): as
          a separate `min-h-[60vh]` it is a second rule of equal specificity,
          emitted later, and it silently won. */}
      <section data-tab="parcours" className="flex snap-start flex-col justify-start pt-3 [min-height:var(--row-min,60vh)]">
        <Parcours sio={sio} />
      </section>
      {/* In TABS order: Goal, Form, Idea, Exercise (Dan, 16 Sep) — the feed
          and the strip must agree or a tap lands on the wrong panel. */}
      <section data-tab="formes" className="flex snap-start flex-col justify-start pt-3 [min-height:var(--row-min,60vh)]">
        <Formes memo={memo} formLayout={formLayout} />
      </section>
      <section data-tab="concept" className="flex snap-start flex-col justify-start pt-3 [min-height:var(--row-min,60vh)]">
        <Concept c={concept} />
      </section>
      <section data-tab="exercice" className="flex snap-start flex-col justify-start pt-3 [min-height:var(--row-min,60vh)]">
        <Panel>{exercise}</Panel>
      </section>

      {/* THE LESSON TOUR (Dan, 2026-09-19: *"A similar NavigaTour is needed
          within the MneMemo too"*) — the same once-only sheet as the app
          tour, walking the four tabs in the order the lesson teaches them.
          It starts ITSELF on a learner's first lesson (no button — *"it
          usually only appears once and then user can say do not show me
          again"*), and « Don't show again » is final.

          IT LIVES HERE, not in CahierShell, because its « Try it → » is
          `goTo` — it opens the tab it is describing, scrolling the panel to
          the top the way a tap on the strip does. And it lives with the TABS
          phase: the moment a learner picks an entry level the tabs unmount
          and the sheet goes with them, which is the tour leaving precisely
          when the doing starts.

          `holdAutoStart` is the app tour's test: while that tour is walking,
          this one does not start — two sheets over one lesson is not
          guidance. The lesson's own first-run hint card is held the same
          way, from DrillShell; between the tab walk and the hint, the tab
          walk is the one that goes first. */}
      <TourWalk
        steps={LESSON_TOUR_STEPS}
        storageKey="fluolingo:tour.lesson"
        onTryIt={(s) => { if (s.tab) goTo(s.tab, true); }}
        holdAutoStart={tourActive}
      />
    </div>
  );
}
