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
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import GoalCard from "@/components/GoalCard";
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
  { key: "parcours", emoji: "🎯", label: "Goal", back: true, does: "the goal this lesson serves" },
  { key: "concept", emoji: "💡", label: "Idée", does: "why French does it this way" },
  { key: "formes", emoji: "📐", label: "Formes", does: "the forms themselves, and every word" },
  { key: "exercice", emoji: "🏋️", label: "Exercice", does: "use them, one card at a time — 🎁 Bonus included" },
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

/** "1 step" / "3 steps" — a fold's note is learner-facing text, and "1 steps"
 *  on a language-learning app undermines the product it labels. */
function count(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function Panel({ children }: { children: ReactNode }) {
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
 * The slots are Dan's, read off his own concept tabs — see LessonConcept in
 * native/types.ts for which are required and why. */
function Concept({ c }: { c?: LessonConcept }) {
  const [pane, setPane] = useState<"claim" | "qa" | "traps" | "steps" | "check" | "sum">("claim");
  if (!c) {
    return <Empty what="Idée has not been written for this lesson yet. Formes has the rules in the meantime." />;
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
    ["claim", "The idea", null],
    ["qa", "Q & A", null],
    ["traps", "Traps", c.pitfall?.length ?? 0],
    ["steps", "Steps", c.flow?.filter((l) => l.depth === 0).length ?? 0],
    ["check", "Check", c.check?.length ?? 0],
    ["sum", "Sum up", null],
  ] as const;
  const shown = PANES.filter(([k]) =>
    k === "claim" || k === "qa" || k === "sum"
      ? true
      : k === "traps" ? !!c.pitfall?.length
      : k === "steps" ? !!c.flow?.length
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

      {pane === "claim" && (
        <>
          <h2 className="cahier-display text-lg font-black leading-tight">{c.subtitle}</h2>
          <p className="mt-2">{c.contrast}</p>
        </>
      )}

      {/* The worked instance sits in its own pane. Kept with the claim it ran
          to 666px in a 561px slot on the longest concepts — the reader was
          scrolling again, which is the thing the strip exists to end. */}
      {pane === "qa" && (
        <>
          <p className="fluo-label text-[color:var(--fluo-ink-soft)]">One question</p>
          <p className="mt-1 text-base font-bold">{c.question}</p>
          <div className="mt-3">{c.answer}</div>
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

      {pane === "steps" && c.flow && (
        <div className="overflow-x-auto rounded-xl bg-[color:var(--cahier-paper-raised)] p-3">
          {c.flow.map((line, n) => (
            <p
              key={n}
              className="whitespace-pre font-mono text-[13px] leading-6"
              style={{ paddingInlineStart: `${line.depth * 1.4}rem` }}
            >
              {line.text}
            </p>
          ))}
        </div>
      )}

      {pane === "check" && c.check && (
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

      {pane === "sum" && (
        <>
          {c.inShort && (
            <>
              <p className="fluo-label text-[color:var(--fluo-ink-soft)]">The whole system</p>
              <p className="mt-1">{c.inShort}</p>
            </>
          )}
          <p className="mt-3 rounded-xl border-l-4 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)]/25 p-3 font-bold">
            If you remember only one thing: {c.remember}
          </p>
        </>
      )}
    </Panel>
  );
}

/**
 * A NOUN HAS FORMS, AND ITS ARTICLE OFTEN HIDES THEM.
 *
 * Dan, 30-31 Aug, settling the Tier 2 shape: "a vocab list with gender and so
 * on, as seen in SpecuLearn." Sorting `aliments` by gender gives 23 masculine,
 * 10 feminine, and NINE whose article says nothing — `de l'` before a vowel and
 * `des` in the plural. A learner who only ever meets « de l'eau » is never told
 * that `eau` is feminine, and that is the gap the column exists to close.
 *
 * `gender` has been in the Item schema all along and NO deck populated it — a
 * dead field. `aliments` is the first to carry it. Where a deck has not, the
 * column shows nothing rather than guessing from the article, because guessing
 * from the article is exactly the mistake the learner is making.
 */
const GENDER_LABEL: Record<string, { short: string; full: string; hue: string }> = {
  m: { short: "m", full: "masculine", hue: "var(--gram-masc)" },
  f: { short: "f", full: "feminine", hue: "var(--gram-fem)" },
  mpl: { short: "m pl", full: "masculine plural", hue: "var(--gram-masc)" },
  fpl: { short: "f pl", full: "feminine plural", hue: "var(--gram-fem)" },
};

/** True when the item's own French gives the gender away, so the column is
 *  only telling the learner something they could not already see. */
function articleShowsGender(fr: string): boolean {
  return /^(le|la|un|une|du|de la)\s/i.test(fr.trim());
}

/* ── 2 · Forms — the rules, then the words ─────────────────────────────────
 * Dan, 2026-08-31: "can we put Words under Forms?"
 *
 * They answer the same question at two grains. The Mémo states the pattern;
 * the word list is the pattern's own instances, and on a Tier 2 stop it IS the
 * lesson — « un café · une classe » is both the vocabulary and the evidence
 * for the rule above it. Splitting them across two tabs made a learner tab
 * back and forth to hold one idea, and it is the tab that pushed the strip to
 * six, which no phone row fits.
 *
 * Both halves get a real heading, or the table just runs on out of the bottom
 * of the Mémo with nothing to say it has started — the fault Dan reported on
 * the concept page an hour earlier. */
function Formes({
  memo, deck, lexique,
}: { memo?: ReactNode; deck?: Collection; lexique?: ReactNode }) {
  const hasWords = !!lexique || !!deck?.items?.length;
  if (!memo && !hasWords) return <Empty what="No Mémo and no deck for this lesson." />;
  return (
    <Panel>
      {memo && (
        <Section title="The pattern" folds={false}>
          <div className="mt-2">{memo}</div>
        </Section>
      )}
      {hasWords && (
        <Section
          title="Every word in this lesson"
          note={deck?.items?.length ? count(deck.items.length, "word") : undefined}
        >
          {lexique ?? <Lexique deck={deck} bare />}
        </Section>
      )}
    </Panel>
  );
}

/* ── 5 · Le lexique ────────────────────────────────────────────────────────
 * The deck's words, as a reveal table.
 *
 * NOT `CuratedDeckTable`. That component is the deck PAGE — a thousand lines
 * of buckets, notes, sorting, selection and test mode — and importing it here
 * would put all of it in every lesson route's bundle for a tab most learners
 * open once. `output: "export"` means that weight is paid at build time by
 * every lesson, not lazily by the few who look.
 *
 * So this is the reading half only, which is what Dan's lexique tab does:
 * hide a column, reveal cells one at a time. The full table with its buckets
 * and notes stays one tap away at /decks/[id], where it already lives. */
function Lexique({ deck, bare = false }: { deck?: Collection; bare?: boolean }) {
  const [hide, setHide] = useState<"none" | "fr" | "en">("none");
  const [shown, setShown] = useState<Set<string>>(new Set());
  if (!deck?.items?.length) {
    return <Empty what="This lesson has no deck, so there are no Words." />;
  }
  const reveal = (id: string) => setShown((s) => new Set(s).add(id));
  const hiddenCount = deck.items.filter((i) => i.gender && !articleShowsGender(i.fr)).length;
  const cell = (id: string, col: "fr" | "en", text: string, lang?: string) => {
    // A hidden cell is a QUESTION, so it is a button — tapping it is the
    // answer. Revealed cells stop being interactive rather than staying
    // clickable buttons that do nothing.
    if (hide !== col || shown.has(id)) {
      return <span lang={lang}>{text}</span>;
    }
    return (
      <button
        type="button"
        onClick={() => reveal(id)}
        className="w-full rounded-md border-2 border-dashed border-[color:var(--cahier-rule)] py-0.5 text-center text-[color:var(--fluo-ink-soft)]"
      >
        <span className="sr-only">Reveal</span>
        <span aria-hidden>· · ·</span>
      </button>
    );
  };
  // `bare` when nested inside Forms: that panel already supplies the padding
  // and the heading, so a second Panel here would double both.
  const Wrap = bare ? Fragment : Panel;
  return (
    <Wrap>
      <div className="mb-2 mt-2 flex flex-wrap gap-1.5">
        {([["none", "Show both"], ["en", "Hide English"], ["fr", "Hide French"]] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => { setHide(k); setShown(new Set()); }}
            aria-pressed={hide === k}
            className={[
              "rounded-lg border-2 px-2.5 py-1 text-xs font-black",
              hide === k
                ? "border-[color:var(--cahier-ink)] bg-[color:var(--fam-ink)] text-white"
                : "border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] text-[color:var(--fluo-ink-soft)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {deck.items.map((it) => {
              const g = it.gender ? GENDER_LABEL[it.gender] : undefined;
              const hidden = !!g && !articleShowsGender(it.fr);
              return (
                <tr key={it.id} className="border-t border-[color:var(--cahier-rule)]">
                  <td className="w-8 py-1.5 text-lg" aria-hidden>{it.emoji ?? ""}</td>
                  <td className="py-1.5 pr-3 font-bold text-[color:var(--cahier-ink)]">
                    {cell(it.id, "fr", it.fr, "fr")}
                  </td>
                  {/* The gender column. Emphasised only where the article does
                      NOT already show it — those are the words a learner would
                      otherwise never be told, and the reason the column is
                      here rather than being left to the article. */}
                  <td className="w-12 py-1.5 pr-3 text-center">
                    {g && (
                      <span
                        title={hidden ? `${g.full} — the article does not show it` : g.full}
                        className={[
                          "inline-block rounded px-1.5 py-0.5 text-[11px] font-black",
                          hidden ? "text-white" : "",
                        ].join(" ")}
                        style={hidden
                          ? { background: g.hue }
                          : { color: g.hue }}
                      >
                        {g.short}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 text-[color:var(--fluo-ink-soft)]">
                    {cell(it.id, "en", it.en ?? "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 && (
        <p className="mt-3 text-xs font-bold text-[color:var(--fluo-ink-soft)]">
          <span className="mr-1.5 inline-block rounded bg-[color:var(--gram-fem)] px-1.5 py-0.5 text-[11px] font-black text-white">f</span>
          {hiddenCount} of these {deck.items.length} words hide their gender behind{" "}
          <i lang="fr">de l&rsquo;</i> or <i lang="fr">des</i> — the article will not tell you.
        </p>
      )}
      <p className="mt-2 text-xs font-bold text-[color:var(--fluo-ink-soft)]">
        {deck.items.length} words · the full table, with your notes and review marks, is on the deck page.
      </p>
    </Wrap>
  );
}

export default function LessonTabs({
  sio,
  deck,
  concept,
  memo,
  exercise,
  lexique,
  open = "exercice",
}: {
  sio?: Sio;
  deck?: Collection;
  concept?: LessonConcept;
  /** Les formes — the Mémo, exactly as the run's rule card renders it. */
  memo?: ReactNode;
  /** L'exercice — the entry-level chooser. Picking a level ends the tabs. */
  exercise: ReactNode;
  /** Le lexique — the deck table, passed in so this file stays free of the
   *  decks route's imports. */
  lexique?: ReactNode;
  /**
   * Which tab is open on arrival. Default "exercice" — see below.
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
  // Opens on L'exercice, NOT on Le parcours. A learner returning to a lesson
  // they know wants the exercise, and Dan's own path is a path, not a gate —
  // his tab bar lets you start anywhere. Reading order is offered, not forced.
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
      <section data-tab="concept" className="flex snap-start flex-col justify-start pt-3 [min-height:var(--row-min,60vh)]">
        <Concept c={concept} />
      </section>
      <section data-tab="formes" className="flex snap-start flex-col justify-start pt-3 [min-height:var(--row-min,60vh)]">
        <Formes memo={memo} deck={deck} lexique={lexique} />
      </section>
      <section data-tab="exercice" className="flex snap-start flex-col justify-start pt-3 [min-height:var(--row-min,60vh)]">
        <Panel>{exercise}</Panel>
      </section>

    </div>
  );
}
