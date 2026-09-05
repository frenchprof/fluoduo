"use client";

/**
 * DrillShell — ONE shell for every drill (patch 20–21).
 *
 * Before this, the same four jobs — progress, feedback, primary action, exit —
 * were re-implemented in every activity: three page shells, eight drill
 * layouts, six game HUDs. That is why Match It's Restart was off-screen, why
 * Dice's options fell below the fold, and why the app felt like six student
 * projects. The four /practice/* drill routes didn't even render a drill:
 * they rendered the whole unit map and opened a resizable popup on top of it,
 * spending 36–44% of a phone before the first question.
 *
 *   ┌────────────────────────────────────────┐  56px, static
 *   │  ✕      ▓▓▓▓▓▓▓░░░░░░░░░░      12/20   │
 *   ├────────────────────────────────────────┤
 *   │              ONE ITEM                  │  flex-1, max-w-600, centred,
 *   │         (prompt + input only)          │  never a nested scroller
 *   ├────────────────────────────────────────┤
 *   │  ✓ Correct!            [ CONTINUE ]    │  tray slides up, OVERLAYS,
 *   └────────────────────────────────────────┘  never pushes content
 *
 * RULES THE SHELL ENFORCES, so no drill can break them again:
 *   · Exactly one full-width primary button at a time. A `secondary` renders
 *     40/60 beside it. There is NO API for stacking two.
 *   · Feedback never reflows the body — the tray is absolutely positioned
 *     over the footer.
 *   · The body slot hides any <h1> a drill tries to print.
 *   · Enter (and Space, outside a text field) fire the visible CTA — the
 *     tray's when it is up, the base one otherwise. One binding, defined here.
 *
 * NO HEARTS. The audit sketch drew ♥♥♡ in the top-right, but hearts/lives
 * lockout is on the REFUSED list of the settled gamification decisions
 * (TODO.md §6) and lives were already removed from every curriculum drill.
 * The right slot carries the progress counter / score — the learner feedback
 * Dan's litmus rule keeps.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { activity as activityInfo, bandOf, familyOf, isReadingSurface } from "@/content/activities";
import { nextStep, type NextStep } from "@/lib/nextStep";
import PageBand from "@/components/PageBand";
import { goalNumberForDeck, stopForDeck } from "@/lib/stopTag";
import BottomBar from "@/components/BottomBar";
import SiteTopBar from "@/components/SiteTopBar";
import { ActivityFirstRun } from "@/components/FirstRunHint";

export type DrillCta = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export type DrillFeedback = {
  kind: "correct" | "wrong";
  /** What to show beside the verdict — the expected answer, a 🔊, an example.
   *  Keep it to one line-ish; it must not need to scroll. */
  body?: ReactNode;
  /** The tray's own CTA (Continue / Next). While the tray is up this is THE
   *  visible primary — the base `cta` underneath is inert and hidden. */
  cta: DrillCta;
  /** The explanation behind the WHY button (AGENTS.md litmus: never inline
   *  by default). The tray shows a WHY toggle at its top-right when set. */
  why?: ReactNode;
};

/**
 * The help ladder's face in the shell (Track D). ONE control — the ? in the
 * bar — climbs the rungs; the dots beside it show where the learner is
 * (○ untaken hint, ● taken, the last dot is the answer). The rungs already
 * opened render as chips under the item. State and rules live in
 * src/lib/help/ladder.ts (via useHelpLadder); the shell only draws.
 */
export type DrillHelp = {
  hintsTaken: number;
  hintsAvail: number;
  revealed: boolean;
  /** Next climb's label ("Hint" / "Another hint" / "Show answer"); null = top. */
  label: string | null;
  disabled?: boolean;
  onClimb: () => void;
  /** The rungs opened so far, in order. */
  shown: { text: string }[];
};

/** Where a drill's ✕ leads: the deck's unit on the path, or the Index for
 *  decks outside the spine. One rule, every drill. */
export function drillExitHref(collectionId: string): string {
  // Through lib/stopTag.ts, which is now the one place a deck id is turned
  // into its stop — this was the second hand-written copy of that `find`.
  const sio = stopForDeck(collectionId);
  return sio ? `/unit/${sio.unit}` : "/map";
}

/** A finished run's footer (the approved flow, 2026-08-24): ONE primary
 *  « Next › » pulling to the next step in the stop's practice chain; the old
 *  end-screen buttons become the quiet row underneath. */
export type DrillFinish = {
  /** Run the same drill again — the quiet "Repeat". */
  repeat?: () => void;
  /** One extra quiet option a drill earns (SpecuLearn's redo-my-mistakes). */
  also?: DrillCta;
};

/** The « Next › » destination chip: stop number + activity emoji + name.
 *  Shared by DrillShell's finish row and GameOver's post-mortem. */
export function NextChip({ step }: { step: NextStep }) {
  const fam = familyOf(step.key);
  return (
    <span
      className={`${fam ? `fam-${fam}` : "fam-none"} inline-flex min-w-0 items-center gap-1.5 rounded-xl border-2 border-[color:var(--drill-ok-ink)]/35 bg-white px-2.5 py-1.5 text-sm font-bold text-[color:var(--cahier-ink)]`}
    >
      <span
        className="fluo-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
        style={{ background: "var(--fam-ink, var(--cahier-ink))" }}
        aria-hidden
      >
        {step.sio.num}
      </span>
      <span aria-hidden>{step.emoji}</span>
      <span className="truncate">{step.name}</span>
    </span>
  );
}

export default function DrillShell({
  exitHref,
  back,
  progress,
  right,
  cta,
  secondary,
  feedback,
  help,
  activity,
  deck,
  finish,
  children,
}: {
  /** The ✕. Always present — a drill you cannot leave is a trap. */
  exitHref: string;
  /** ‹ Back to the question before. Sits at the left of the bar, where the ✕
   *  sits on the shells that have no band, so the two never collide.
   *  null (the default) draws nothing — most drills have nothing to go back
   *  to. Dan, 5 Sep: "for SpecuLearn we are missing the back button". */
  back?: { onClick: () => void; disabled?: boolean; label?: string } | null;
  /** null hides the bar (e.g. on a done screen). */
  progress: { done: number; total: number } | null;
  /** Top-right slot: score counter and the like. NOT hearts — see header. */
  right?: ReactNode;
  /** The one primary action ("Check"). null = no base CTA (body owns flow,
   *  e.g. tap-an-option drills before anything is picked). */
  cta?: DrillCta | null;
  /** Optional 40/60 companion (Skip, Reveal). Renders BESIDE the primary. */
  secondary?: DrillCta | null;
  /** When set, the tray slides up over the footer. */
  feedback?: DrillFeedback | null;
  /** The help ladder control + hint chips (Track D). null = no ladder here. */
  help?: DrillHelp | null;
  /** Registry key of the activity in the shell (2026-08-24, the approved
   *  flow): names the notebook band, colours it by family, and anchors the
   *  finish row's « Next › » chain resolution. */
  activity?: string;
  /** The deck driving the drill — the « Next › » chain's stop anchor. */
  deck?: string;
  /** Set on the finished/summary screen: replaces the base CTA row with the
   *  ONE primary « Next › » + the quiet Repeat / Back row. */
  finish?: DrillFinish | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const act = activity ? activityInfo(activity) : undefined;
  const famKey = activity ? familyOf(activity) : null;
  // The band over a drill is coloured by what the drill ASKS, not by which
  // menu family it lives under (Dan, 2026-08-26). Family still drives the
  // rail and the Menu; this is the activity's own page.
  const bandKey = activity ? bandOf(activity) : null;
  // Resolved only when the finish row is up — ledger + progress are the
  // device's own localStorage, so this never runs during prerender (a finish
  // screen is always reached by interaction).
  const next = useMemo(
    () => (finish ? nextStep(activity, { collectionId: deck }) : null),
    [finish, activity, deck],
  );
  const goNext = () => router.push(next?.href ?? "/");
  // WHY is closed whenever a new verdict lands — an explanation is asked
  // for, never carried over from the last question. (State adjusted during
  // render on the prop change, not in an effect.)
  const feedbackOn = !!feedback;
  const [why, setWhy] = useState({ on: feedbackOn, open: false });
  const whyOpen = why.on === feedbackOn && why.open;
  if (why.on !== feedbackOn) setWhy({ on: feedbackOn, open: false });
  const setWhyOpen = (fn: (v: boolean) => boolean) => setWhy({ on: feedbackOn, open: fn(whyOpen) });
  // ONE key binding for every drill: Enter fires the visible CTA anywhere;
  // Space fires it too, except while typing in a field (a typed space is a
  // space). The tray's CTA wins while the tray is up.
  const liveCta = feedback ? feedback.cta : finish ? { label: "Next ›", onClick: goNext } : cta;
  const liveRef = useRef(liveCta);
  // A live ref, written during render on purpose: the key handler below is
  // bound once and fires long after, and it must press the CTA that is on
  // screen NOW — not the one that existed when the listener was attached.
  // eslint-disable-next-line react-hooks/refs
  liveRef.current = liveCta;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A body that handled the key itself (ÉcouTexte's per-word blanks mark
      // their sentence on Enter) preventDefaults it — the shell stands down.
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      const typing =
        !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key !== "Enter" && !(e.key === " " && !typing)) return;
      // Let a focused button/link keep its own native Enter/Space.
      if (!typing && t && (t.tagName === "BUTTON" || t.tagName === "A")) return;
      const c = liveRef.current;
      if (!c || c.disabled) return;
      e.preventDefault();
      c.onClick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The draggable floats (feedback bubble, tour launcher) default to the
  // bottom corners — exactly where this shell's footer lives, at every
  // width. Declare a floor while the shell is mounted; useDragFloat's
  // rendered bottom is max(position, --float-floor), so both floats clear
  // the CTA row and the tray, and stay draggable exactly as before.
  useEffect(() => {
    document.documentElement.style.setProperty("--float-floor", "84px");
    return () => { document.documentElement.style.removeProperty("--float-floor"); };
  }, []);

  // The 56px row earns its height only if it carries the progress bar or the
  // help ladder. `right` alone does not: with no row, it becomes the band's
  // stat. See the row's own comment for the measurement.
  //
  // `|| !act` IS THE TRAP GUARD, and it is not hypothetical. The ✕ now lives
  // in the band, and the band only renders when `activityInfo()` resolves —
  // which it does NOT for a route whose registry row was retired while the
  // route stayed (Sorting, #93; iComplete, #97 — both deliberately kept
  // reachable so banked answers keep their labels). Without this the row would
  // vanish on exactly those pages and take the only way out with it. "A drill
  // you cannot leave is a trap" is this file's own words, twenty lines up.
  const barNeeded = !!progress || !!help || !act || !!back;
  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.done / progress.total) * 100))
    : 0;

  return (
    /* ONE PAGE SHAPE (Dan, 2026-09-01: "Ok move all to A"). The desk wrapper
       puts a drill's paper where every other page's paper is — 8px down and
       one gutter in — so the coloured spine and the heading band line up
       across the whole site instead of jumping 13px sideways and 8px up the
       moment a learner starts answering. The wrapper owns the height now;
       `h-full` inside it is the screen minus that 8px, so nothing overflows.
       See `.cahier-drilldesk` in globals.css for which numbers come from where.

       `cahier-drill` is not decoration: it is what lets the family spine in
       globals.css name this shell as well as `.cahier-page`. Without it the
       root carried `fam-practice` and drew no left edge, which is the fault
       Dan's 1 Sep audit found on every drill in the app. */
    <div className="cahier-drilldesk">
    <div className={`cahier-drill ${famKey ? `fam-${famKey}` : "fam-none"}${bandKey ? ` band-${bandKey}` : ""}${isReadingSurface(activity) ? " paper-sand" : ""} flex h-full min-w-0 flex-col overflow-hidden bg-[color:var(--cahier-paper)]`}>
      {/* ── the notebook (2026-08-24, approved flow): drills live INSIDE the
          cahier — the family heading band on top (name from the registry,
          the drill's i/total as the band's ONE chip so the figure is never
          printed twice), spiral binding down the left, ruled paper behind,
          the phone bottom bar kept. The drill's inner layout is untouched. */}
      {/* ── the site bar (Dan, 2026-08-31: "many pages are missing that menu
          and other links in the area above the colored header strip. can you
          reinstate them so that those are accessible at all times").
          A drill was a focused mode with ✕ · progress · score and nothing
          else — the ✕ was the ONLY way out, and it goes exactly one place.
          The ☰ is the whole site, so it comes back here too. Same component
          CahierShell mounts, not a copy: two nav surfaces that drift apart is
          the bug this repo spent eleven days on (STATUS, 19 Aug).
          `nested` because a drill has no flap rail off the right edge, so the
          bar takes the tighter right inset. */}
      <div className="shrink-0">
        <SiteTopBar active={activity ?? ""} nested />
      </div>
      {/* THE ✕ LIVES IN THE BAND (2026-08-31). It used to sit in the 56px bar
          below, whose middle was a 243px EMPTY spacer on every surface with no
          progress — a lesson's tab view, a landing, a finished run. Measured at
          390px on /lessons/colors: 187px of chrome before the first tab, of
          which that bar plus the gap under it was 84px carrying one glyph and
          one number. The band was already drawn, already 55px tall, and
          carrying a single word.

          It is here on EVERY surface, not only the ones that lost the bar: an
          exit that moves depending on whether a drill happens to show progress
          is worse than one that costs a row. The `pl-12 sm:pl-14` this replaces
          existed to hold that space open. */}
      {act && (
        <PageBand
          title={act.name}
          /* WHICH GOAL THIS IS (Dan, 1 Sep: "there are pages where there is
             no identity tag regarding which stop it belongs to", then, with a
             drawing, "a circle and the related goal number"). A drill named
             its activity and its deck and never its position, so the only way
             to answer "where am I on the course" was to leave and look at the
             map. Undefined for a deck off the study path, and PageBand then
             draws no circle rather than an empty one. */
          goal={goalNumberForDeck(deck)}
          /* The ✕ used to be built here and handed over as `lead`. It is
             PageBand's own now, because Dan asked for it on EVERY strip and a
             control that every band must have is not a thing each caller
             should be able to spell differently. */
          exitHref={exitHref}
          exitLabel="Exit"
          /* THE NUMBER AT THE END IS GONE (Dan, 1 Sep: "drop the number at the
             end of that strip"). It was `i/total` here, the outcomes done on
             the profile and a (?) dot on a deck page — one chip meaning three
             things, which is not a figure a learner can read. A drill's own
             progress bar sits directly under this band and says the same
             thing continuously. `right` was the same slot by another name. */
          className="shrink-0"
        />
      )}
      <div className="cahier-foolscap relative flex min-h-0 flex-1 flex-col">
        <div className="cahier-binding" aria-hidden />
        {/* Clear the coils, which bind the LEFT edge (Dan, 2026-08-30: "the
            binding should be on the left, not on the right"). Between the
            30 Aug mirroring and that correction the two disagreed — the coils
            had moved right with the rail while every clearing padding stayed
            left — so drill content was inset 38px away from nothing and ran
            UNDER the binding on the other side. Invisible on a wide screen,
            because the column caps at 600px and only meets the binding once
            the viewport is narrow; Le concept put the first long prose in
            here and lost the end of every line. Keep this on the same side as
            `.cahier-binding` in globals.css. */}
        <div className="flex min-h-0 flex-1 flex-col pl-[38px]">
      {/* ── the 56px bar — ONLY where it carries something ────────────
          It renders for a progress bar or the ? help ladder, and for nothing
          else. Before this it rendered always: on a lesson's tab view, a
          landing, a finished run, it was a ✕ at one end, a score at the other
          and 243px of empty `flex-1` between them, costing 84px with the gap
          beneath it. The ✕ moved to the band and the score goes there too when
          this row is absent, so nothing is lost — one row stops being drawn.

          Where progress or help DO exist the row is unchanged, which is most
          of the 28 surfaces mounting this shell: the progress bar is the
          learner's position in the run and the ? ladder is load-bearing. */}
      {barNeeded && (
      <div className="flex h-14 shrink-0 items-center gap-3 border-b-2 border-[color:var(--cahier-ink)]/10 bg-white/45 px-3 sm:px-5">
        {/* Only where there is no band to host it — see `barNeeded`. Two ✕ on
            one screen would be worse than the row this change removes. */}
        {!act && (
          <Link
            href={exitHref}
            aria-label="Exit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/50 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]"
          >
            ✕
          </Link>
        )}
        {back && (
          <button
            type="button"
            onClick={back.onClick}
            disabled={back.disabled}
            aria-label={back.label ?? "The question before"}
            title={back.label ?? "The question before"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl font-black leading-none text-[color:var(--cahier-ink)]/50 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)] disabled:opacity-25"
          >
            ‹
          </button>
        )}
        {progress ? (
          <div
            className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[color:var(--cahier-ink)]/10"
            role="progressbar"
            aria-valuenow={progress.done}
            aria-valuemin={0}
            aria-valuemax={progress.total}
          >
            <div
              className="h-full rounded-full bg-[color:var(--drill-ok)] transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        {help && (
          <button
            type="button"
            onClick={help.onClimb}
            disabled={!help.label || help.disabled}
            aria-label={help.label ?? "Help"}
            title={help.label ?? undefined}
            data-rung={help.revealed ? "reveal" : help.hintsTaken}
            className="drill-help flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[color:var(--cahier-ink)]/70 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)] disabled:opacity-40"
          >
            <span className="text-lg font-black leading-none" aria-hidden>?</span>
            <span className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: help.hintsAvail + 1 }, (_, k) => {
                const isReveal = k === help.hintsAvail;
                const on = isReveal ? help.revealed : k < help.hintsTaken;
                return (
                  <span
                    key={k}
                    className={`block h-1.5 w-1.5 rounded-full ${
                      on
                        ? isReveal ? "bg-[color:var(--drill-bad)]" : "bg-[color:var(--cahier-ink)]"
                        : "bg-[color:var(--cahier-ink)]/25"
                    }`}
                  />
                );
              })}
            </span>
          </button>
        )}
        {/* Only when the row exists. With no row, `right` is the band's stat —
            the band shows at most ONE number by design, and with no progress
            to show there is no competition for the slot. */}
        {right && (
          <div className="cahier-mono shrink-0 text-sm font-bold text-[color:var(--cahier-ink)]/70">
            {right}
          </div>
        )}
      </div>
      )}

      {/* ── one item, near the header; stray <h1>s are swallowed ─────── */}
      {/* justify-start, not justify-center (Dan, 2026-08-11): dead-centre
          left a short item (one flashcard) floating mid-viewport with a
          header-sized hole above it. Content starts a fixed beat below the
          bar; tall drills fill the slot exactly as before. */}
      {/* THE BODY SIZES TO ITS CONTENT (Dan, 2026-08-27: "You read a short card
          at the top of the screen, then have to scroll down past two-thirds of
          a blank page to find the button. Every card. Every lesson.").
          Measured on a 390x844 phone: the memo text ended at y=344 and Continue
          began at y=734 — a 390px void, near half the screen.
          The cause was `flex-1` here: `1 1 0%` forces the scroller to fill the
          column whatever its content, so the footer was always pinned to the
          bottom. `flex-initial` is `0 1 auto` — it grows to the content and
          only shrinks when the content would overflow. A short card now has its
          button directly beneath it; a tall drill still fills the slot and
          scrolls inside exactly as before.
          NOT justify-center: Dan ruled that out on 2026-08-11 (a short item
          floated mid-viewport under a header-sized hole). */}
      <div className="flex min-h-0 flex-initial flex-col overflow-y-auto px-4 [&_h1]:hidden">
        <div className="mx-auto flex w-full max-w-[600px] flex-col justify-start pb-4 pt-6 sm:pt-10">
          {children}
          {/* HINTS ARE GUIDANCE TOWARD AN UNANSWERED QUESTION (Dan, 2026-08-27:
              "The red error stays after you fix it. You correct your answer,
              get a green tick — and 'Not that one, pick again' is still sitting
              underneath it."). That line is a hint rung (hints.ts), and hints
              accumulate in help.shown for the life of the card — so a correct
              answer landed a tick ON TOP of the advice that got the learner
              there. Once the item is right the advice is spent: drop it.

              A wrong verdict keeps its hints ONLY while the learner can still
              act on them. A REVEALED card cannot be acted on — the options are
              disabled and the CTA is "Continue" — yet its verdict.kind is
              "wrong", so guarding on kind alone left "Not that one, pick
              again" sitting under a card with no pick left to make. Not merely
              stale: impossible to follow. The terminal states are "correct" OR
              "revealed"; help.revealed is the signal kind does not carry.
              Nothing is lost by dropping the rungs on reveal — the tray itself
              already names the answer. Fixed in the shell, so every drill that
              shows a verdict is fixed at once. */}
          {help && help.shown.length > 0 && !help.revealed && feedback?.kind !== "correct" && (
            <div className="drill-hints mt-3 space-y-1" aria-live="polite">
              {help.shown.map((r, k) => (
                <p key={k} lang="fr" className="rounded-lg bg-[color:var(--cahier-hl)]/30 px-2 py-1 text-sm font-medium text-[color:var(--cahier-ink)]">
                  {r.text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── footer: base CTA row, with the tray OVERLAYING it. On a finished
          run the row is the ONE primary « Next › » (destination chip beside
          it) and the old buttons become the quiet row (2026-08-24). */}
      <div
        className={`relative shrink-0 border-t-2 ${
          finish
            ? "border-[color:var(--drill-ok-soft)] bg-[color:var(--drill-ok-bg)]"
            : "border-[color:var(--cahier-ink)]/10"
        }`}
      >
        {finish ? (
          <div className="mx-auto w-full max-w-[600px] px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 text-lg font-black text-[color:var(--drill-ok-ink)]" aria-hidden>✓</span>
              {next && <NextChip step={next} />}
              <button
                type="button"
                onClick={goNext}
                className="cahier-btn cahier-btn-primary ml-auto shrink-0 justify-center font-black"
              >
                Next ›
              </button>
            </div>
            <div className="mt-2 text-center text-[13px] font-bold text-[color:var(--cahier-ink)]/55">
              {finish.repeat && (
                <>
                  <button type="button" onClick={finish.repeat} className="underline decoration-dotted">
                    Repeat
                  </button>
                  <span className="mx-2 opacity-60" aria-hidden>·</span>
                </>
              )}
              {finish.also && (
                <>
                  <button
                    type="button"
                    onClick={finish.also.onClick}
                    disabled={finish.also.disabled}
                    className="underline decoration-dotted disabled:opacity-40"
                  >
                    {finish.also.label}
                  </button>
                  <span className="mx-2 opacity-60" aria-hidden>·</span>
                </>
              )}
              <Link href={exitHref} className="underline decoration-dotted">
                Back to the map
              </Link>
            </div>
          </div>
        ) : (
        <>
        <div className="mx-auto grid w-full max-w-[600px] grid-cols-5 gap-2 px-4 py-3">
          {secondary && !feedback && (
            <button
              type="button"
              onClick={secondary.onClick}
              disabled={secondary.disabled}
              className="cahier-btn col-span-2 justify-center disabled:opacity-40"
            >
              {secondary.label}
            </button>
          )}
          <button
            type="button"
            onClick={cta?.onClick}
            disabled={!cta || cta.disabled || !!feedback}
            className={`cahier-btn cahier-btn-primary justify-center disabled:opacity-40 ${secondary && !feedback ? "col-span-3" : "col-span-5"} ${!cta && !feedback ? "invisible" : ""}`}
          >
            {cta?.label ?? "…"}
          </button>
        </div>

        {feedback && (
          <div
            className={`absolute inset-x-0 bottom-0 animate-[drill-tray_.18s_ease-out] border-t-2 ${
              feedback.kind === "correct"
                ? "border-[color:var(--drill-ok-soft)] bg-[color:var(--drill-ok-bg)]"
                : "border-[color:var(--drill-bad-soft)] bg-[color:var(--drill-bad-bg)]"
            }`}
          >
            {feedback.why && whyOpen && (
              <div className="drill-why mx-auto w-full max-w-[600px] px-4 pt-3 text-sm text-[color:var(--cahier-ink)]">
                {feedback.why}
              </div>
            )}
            <div className="mx-auto flex w-full max-w-[600px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
              <p
                className={`min-w-0 flex-1 text-sm font-black ${
                  feedback.kind === "correct" ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--drill-bad-ink)]"
                }`}
              >
                <span className="mr-1.5" aria-hidden>{feedback.kind === "correct" ? "✓" : "✗"}</span>
                {feedback.body}
              </p>
              {feedback.why && (
                <button
                  type="button"
                  onClick={() => setWhyOpen((v) => !v)}
                  aria-expanded={whyOpen}
                  className="cahier-btn cahier-btn-sm shrink-0 !px-2 !py-1 text-[0.7rem] font-black uppercase tracking-wider"
                >
                  WHY
                </button>
              )}
              <button
                type="button"
                onClick={feedback.cta.onClick}
                disabled={feedback.cta.disabled}
                className={`cahier-btn shrink-0 justify-center font-black ${
                  feedback.kind === "correct" ? "cahier-btn-primary" : "!border-[color:var(--drill-bad-ink)] !bg-[color:var(--drill-bad)] !text-white"
                }`}
              >
                {feedback.cta.label}
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
        </div>
      </div>
      {/* The phone bar is fixed — hold its height open so the footer (and
          the tray) always clear it. The height is the floor the bar itself
          measures, not a restated 58px: a learner who removes the bar in
          Réglages (5 Sep) gets this strip back too. */}
      <div
        aria-hidden
        className="shrink-0 sm:hidden"
        style={{ height: "var(--bottombar-floor, 0px)" }}
      />
      <BottomBar />
      {/* WHAT TO DO HERE, once, until the learner says stop (Dan, 2026-09-02:
          "add the same first timer pop ups instructions for all activity
          pages"). Mounted HERE rather than in each drill so an activity gets
          its instruction by having a row in content/hints.ts and nothing
          else — the shape ACTIVITIES exists for. Drills with no row draw
          nothing. It portals to the body, because this root is
          `overflow-hidden` and would clip it to the paper. */}
      <ActivityFirstRun activityKey={activity} on="drill" />
    </div>
    </div>
  );
}
