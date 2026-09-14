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
import { activity as activityInfo, familyEmoji, familyName, familyOf, stripOf } from "@/content/activities";
import { nextStep, type NextStep } from "@/lib/nextStep";
import PageBand from "@/components/PageBand";
import usePullPastEnd from "@/components/usePullPastEnd";
import { goalNumberForDeck, stopForDeck } from "@/lib/stopTag";
import BottomBar from "@/components/BottomBar";
import SiteTopBar from "@/components/SiteTopBar";
import { ActivityFirstRun } from "@/components/FirstRunHint";
import { HOME_HREF, sioHref } from "@/lib/routes";
import ActivityUsher from "@/components/ActivityUsher";
import MoreBelow from "@/components/MoreBelow";
import { usherFor } from "@/lib/usher";

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
  // THE STOP'S OWN PAGE, NOT THE MAP (Dan, 2026-09-13: *"when one chooses to
  // close any activity, it must take the learner back to that 🎯 page, NOT to
  // the map"*). His reason is the one that matters: *"with the latter they
  // would have to select the stop that they have not completed again, it is a
  // hassle"* — the map drops a learner two clicks from where they just were,
  // and the 🎯 page is where the rest of that stop's practice chain lives.
  //
  // WHAT THIS REPLACES, so the old reasoning is not restored from the note it
  // left behind: until today this returned `${HOME_HREF}?unit=N`, and that
  // line was itself a fix (12 Sep) for a ✕ that cost two page loads by going
  // through `/unit/N`. Fewer loads, still the wrong page.
  //
  // The map is NOT lost and was never the thing to fix — the chartreuse
  // FluOLinGo in the site bar is on every one of these screens, which Dan
  // named himself: *"the return to the map is already available at the top"*.
  return sio ? sioHref(sio.id) : HOME_HREF;
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
  snapRows,
  subhead,
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
  /** Turn the body's scroller into a MAGNET (Dan, 2026-09-07, of the lesson:
   *  *"it should swipe vertically - that is the right behaviour"*). The
   *  children then mark their own rows with `snap-start`, and the scroll may
   *  only ever rest at the top of one of them.
   *
   *  Why here rather than in a feed component of its own: this body IS already
   *  an `overflow-y-auto`, and a second scroller inside it is two scrollers
   *  fighting over one finger — the exact fault the goals page was built twice
   *  to avoid. A row taller than the screen still scrolls freely through,
   *  because a snap area larger than the snapport imposes no rest position.
   *  That is what makes a long lesson panel doom-scroll and a short one
   *  snap. */
  snapRows?: boolean;
  /** A strip that sits BETWEEN the band and the scroller — frozen, outside the
   *  scroll box entirely. Dan, 2026-09-07, of the lesson: *"the scrolling is to
   *  start only after the : Goal-Idea-Form-Exer"*.
   *
   *  `position: sticky` inside the scroller was not enough, and the difference
   *  is real rather than pedantic: a sticky element is IN the flow, so the rows
   *  below it snap to the top of the SCROLLER and arrive underneath it — which
   *  is why every row needed a `scroll-mt` equal to the strip's height, a number
   *  that had to be kept in step by hand. Out here the scroller starts below the
   *  strip, so a row's top IS the top, and the offset stops existing. */
  subhead?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  // The rail is the root layout's since 2026-09-07 (RailSwipe.tsx) — one
  // handler per document, so a framed station has one too.
  /* A ROW FEED SCROLLS BEHIND A FROZEN HEADER, which needs the WINDOW not to
     scroll as well. Measured on the lesson at 390x844: the document is 90px
     taller than the viewport (`.cahier-drilldesk` is a full screen, and the
     site footer sits under it), so two swipes took the site bar and the ✕ band
     off the top while the panels were still snapping underneath — two
     scrollers, one undoing the other. The goals page met this first and the
     answer is the same: take the window out of the equation for as long as the
     feed is up. Only while `snapRows` is on, so the other 27 DrillShell
     surfaces are untouched. */
  useEffect(() => {
    if (!snapRows) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, [snapRows]);
  const act = activity ? activityInfo(activity) : undefined;
  const famKey = activity ? familyOf(activity) : null;
  // The band over a drill is coloured by what the drill ASKS, not by which
  // menu family it lives under (Dan, 2026-08-26). Family still drives the
  // rail and the Menu; this is the activity's own page.
  // The colour a learner SEES. `stripOf` is the band's hue unless the
  // activity owns one (ConjugaZone's teal, 8 Sep) — see content/activities.ts.
  const bandKey = activity ? stripOf(activity) : null;
  // Resolved only when the finish row is up — ledger + progress are the
  // device's own localStorage, so this never runs during prerender (a finish
  // screen is always reached by interaction).
  const next = useMemo(
    () => (finish ? nextStep(activity, { collectionId: deck }) : null),
    [finish, activity, deck],
  );
  const goNext = () => router.push(next?.href ?? HOME_HREF);
  /* THE BACK LINK SAYS WHERE IT GOES. `exitHref` is `drillExitHref`'s answer,
     which is the stop's own 🎯 page whenever the deck HAS a stop and the map
     otherwise (a deck off the study path). The label is read back off the
     address rather than passed in, so the two cannot disagree — the old one
     said « Back to the map » and, after today, would have been pointing at the
     goal page while still saying map. */
  const usher = useMemo(
    () => (finish ? usherFor(activity, { collectionId: deck }) : null),
    [finish, activity, deck],
  );
  const backLabel = exitHref.startsWith("/sio/")
    ? `Back to 🎯 ${goalNumberForDeck(deck) ?? ""}`.trim()
    : "Back to the map";
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

  /**
   * AND ONE GESTURE FOR EVERY DRILL: keep scrolling and the next question
   * arrives.
   *
   * Dan, 2026-09-07: *"the technique you used for going to a different page by
   * just scrolling is something we want replicate across all activities, but
   * between questions of the same lesson, instead of scrolling into another
   * url, it should be scrolling to the next bookmarked item below on the same
   * page"*.
   *
   * Two surfaces already did it — SpecuLearn and the goals scroller both stack
   * their rows in a SnapFeed, so a swipe moves one question. The other eleven
   * could not: a drill GENERATES its next question from the answer you just
   * gave, so there is nothing below to scroll to until you have answered. What
   * they all share is this shell, and this shell already knows what the one
   * visible button is. So the pull past the end presses it.
   *
   * ONLY WHEN THE TRAY IS UP, which is the whole safety of it. `liveCta` is
   * the tray's Continue once a verdict has landed, and the finish row's
   * « Next › » at the end of a run — never the base « Check ». A scroll can
   * therefore carry you PAST a question you have answered and off the end of a
   * finished run, and can never answer or skip a question in front of you.
   *
   * `data-no-scroll-on` on the shell (below) is the other half: without it the
   * rail's own reader would see the same pull on the same page and carry the
   * learner off to the next station mid-run. While a drill can act on the
   * gesture, the drill owns it — and at the end of the run its « Next › » IS
   * the next station, so the chain still runs to the end unbroken.
   *
   * THE THIRD ARGUMENT IS WHY IT FIRES AT ALL. `usePullPastEnd` normally
   * refuses a page with no scroller — on /skills or /games every scroller is
   * trivially at its bottom, and one flick would navigate. A drill card does
   * not scroll either: measured on the built export, the frame's document is
   * 787px in a 787px viewport, and this shell's own rules forbid a nested
   * scroller in the body. So without opting out, the gesture Dan asked for
   * could never fire on a single one of the eleven activities he asked for it
   * on. It is safe here for the reason the rail's case is not: the worst a
   * stray flick can do is press Continue on a question already answered.
   */
  // TWO LINES, TWO DIFFERENT QUESTIONS, and they must not be the same one.
  //   `owns`     — this shell has a footer action, so the gesture is ITS
  //                gesture on this page and the rail stands down.
  //   `pullable` — …and there is something the pull may actually press.
  //
  // Between them sits the case that matters: a question ANSWERABLE but not yet
  // answered — « Check » on screen, no verdict. The shell owns the gesture
  // there and does nothing with it, so a pull past the end neither answers the
  // card nor throws the learner out mid-question. Making one flag do both jobs
  // would give the same finger two meanings on one page: "next question" after
  // a verdict, "leave the drill" before one.
  //
  // AND THE SHELL ONLY TAKES THE GESTURE WHEN IT CAN ACT ON IT.
  //
  // These two were different for a day, and the wider one was wrong. `owns`
  // used to be "this shell has a footer action at all", so a drill claimed the
  // pull while « Check » was on screen and then did nothing with it. That was
  // defensible for one day, when downwards meant LEAVE THE ACTIVITY and the
  // point was not to throw a learner out mid-question.
  //
  // Dan's grid (2026-09-08) changed what downwards means: *"swipes down to the
  // next SIO (newURL), up to the previous SIO"* — the next GOAL, same activity,
  // not the next activity. There is nothing to protect a learner from any more,
  // and swallowing the gesture broke the thing he asked for. MEASURED on the
  // built export: from a fresh lesson the pull carried to the next goal, and
  // from the lesson it landed on it never worked again — because the arriving
  // lesson opens on its level picker, which gives the shell a `cta`, which
  // planted `data-no-scroll-on`, which stood the rail down for a gesture this
  // shell then ignored. Three pulls, three refusals, no way on.
  //
  // So the hatch is the gate: the drill takes the pull exactly when it has a
  // button to press with it (a verdict up, or a finished run) and hands it to
  // the rail the rest of the time, where it means the next goal.
  const pullable = !!feedback || !!finish;
  usePullPastEnd(() => {
    const c = liveRef.current;
    if (!pullable || !c || c.disabled) return;
    c.onClick();
  }, {
    resetKey: pullable,
    // A drill card does not scroll — see the note above.
    whenNothingScrolls: true,
    // This shell PLANTS the hatch, for the rail. It must not silence itself.
    heedHatch: false,
  });

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

       `cahier-surface` is what carries the colour — the same class CahierShell
       wears, so the spine, the family ground and the band are one rule keyed
       on one name (Dan, 2026-09-06: "can you standardise pls, i don't want
       outliers"). It replaces the `:is(.cahier-page, .cahier-drill)` selector
       that had to list both shells, and which cost the app every drill's left
       edge for the fortnight before Dan's 1 Sep audit found it: the rule named
       one shell, this root was the other, and nothing failed loudly.
       `cahier-drill` stays for the layout rules that ARE this shell's. */
    /* `data-no-scroll-on` WHILE THIS SHELL CAN ACT ON THE PULL (8 Sep). Two
       readers of one gesture are on this page: the rail's, which carries a
       learner to the next station, and this shell's, which presses the visible
       CTA. Without the hatch a single pull past the end would fire both — the
       question would advance AND the page would navigate away from it. So the
       drill takes the gesture exactly while it can act on it — a verdict up,
       or a finished run — and hands it back otherwise, where the rail reads it
       as the next GOAL (Dan's grid, 8 Sep). The finger keeps one meaning all
       the way down: move on. Next question while there is one, next goal when
       there is not. */
    <div className="cahier-drilldesk" data-no-scroll-on={pullable ? "" : undefined}>
    {/* `cahier-surface` is main's one colour class (6 Sep, "i don't want
        outliers"); `touch-pan-y` is this branch's, and hands the sideways drag
        to the swipe rail. Unrelated jobs, both wanted. */}
    <div className={`cahier-drill cahier-surface touch-pan-y ${famKey ? `fam-${famKey}` : "fam-none"}${bandKey ? ` band-${bandKey}` : ""} flex h-full min-w-0 flex-col bg-[color:var(--cahier-paper)]`}>
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
      {/* THE STRIP IS NOT CONDITIONAL ANY MORE (Dan, 2026-09-07: *"we also
          need to make it a point that pages never lose their coloured strip at
          the top"*). This was `{act && …}`, and `act` is undefined for exactly
          the routes whose registry row was retired while the route stayed
          reachable — Sorting (#93) and iComplete (#97), plus Diced Practice,
          whose key `dice` has a family but no activity row. Those pages drew
          no band at all: a drill on bare paper with a ✕ floating above it.
          The file already knew this shape was dangerous — `|| !act` twenty
          lines up is the guard that keeps the EXIT alive on the same routes,
          added because "a drill you cannot leave is a trap". The band went
          missing the same way and nobody had measured it.

          A page that cannot name itself says what family it is in, which is
          always true; saying nothing is the one answer that is never right. */}
      {/* THE COILS START AT THE BAND (Dan, 2026-09-11, shown a game's top-left
          corner: *"coils up to the band and also the corresponding vertical
          strip"*). The binding used to live inside the well BELOW the band, so
          a drill's left edge was a 6px family spine beside the bar and the band
          and a 30px coil strip under it — the edge changed width halfway down.
          This region opens above the band now, in the same place and for the
          same reason as CahierShell's, so the two shells still match (Dan,
          2026-09-06: "can you standardise pls, i don't want outliers"). It
          still stops short of the SITE BAR — the loops overhang onto the desk
          and nothing can cover the desk. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="cahier-binding" aria-hidden />
      {(act || famKey) && (
        <PageBand
          title={act?.name ?? familyName(famKey!)}
          /* The activity's own glyph, from the registry (Dan, 11 Sep: "we have
             fixed emojis for them") — never spelt here, so 🐞/🤹/🛠️/🔐 stay
             deduplicated in one table. A drill with no registry row falls back
             to its family's, the same pair the title falls back through. */
          emoji={act?.emoji ?? familyEmoji(famKey!)}
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
      <div className="cahier-foolscap flex min-h-0 flex-1 flex-col">
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
      {/* THE DASHES ARE THE FREEZE LINE (Dan, 2026-09-05: *"the dotted line
          needs to be the separation line between the frozen part and the
          scrollable part"*, then *"the scroll should start below the
          counter"*). This row already WAS the last frozen thing — it is
          `shrink-0` and sits before the `overflow-y-auto` panel, so nothing
          moved; what it lacked was any way to say so. The same dashes mark the
          same seam under the lesson's tab strip, which is the other view of
          this shell and the one he drew the line on. */}
      {barNeeded && (
      <div className="flex h-14 shrink-0 items-center gap-3 border-b-2 border-dashed border-[color:var(--cahier-ink)]/35 bg-white/45 px-3 sm:px-5">
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
      {/* OUTSIDE THE SCROLLER, above it. See `subhead` for why sticky was not
          the same thing. `shrink-0` so a long strip never gets squeezed by the
          scroller below it.
          The slot is always rendered — it has no height when empty — because a
          surface deep inside `children` fills it by PORTAL rather than by prop:
          the lesson's tab strip is owned by LessonTabs, which knows which panel
          you are in, and lifting that state up through the pager only to hand
          it back down would put the strip and the panels in two places that can
          disagree. `data-subhead` is the address it portals to. */}
      <div data-subhead className="shrink-0 px-4">{subhead}</div>
      <div className={`flex min-h-0 flex-initial flex-col overflow-y-auto px-4 [&_h1]:hidden${snapRows ? " snap-y snap-mandatory" : ""}`}>
        <div className="mx-auto flex w-full fluo-measure flex-col justify-start pb-4 pt-6 sm:pt-10">
          {children}
          {/* « NEXT PART IS BELOW » (Dan, 2026-09-14: *"please apply blinking
              arrows everywhere that requires the user to go to the next
              section"*). IT GOES IN THE SHELL, not at each drill, for the
              reason the usher row is in one place too: this scroller is
              ConjugaZone, MneMemo's panels and every snap feed at once, and a
              drill written next month inherits it rather than being forgotten.
              `MoreBelow` measures the scroller and shows nothing when there is
              nothing below, so a short card stays quiet. */}
          <MoreBelow />
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
          <div className="mx-auto w-full fluo-measure px-4 py-3">
            {/* THE FIVE DOORS (Dan, 2026-09-13) — one step back in the stop's
                chain, forward to the next, the 🎯 page, redo, and the same
                activity at the next stop that has it. `usherFor` decides which
                of them exist; « Redo » is this shell's own `finish.repeat`,
                the one move that is an action rather than an address.

                ABOVE the « Next › » row, not instead of it: that row is the
                approved single-primary flow (24 Aug) and still carries the
                recommendation. The compass is the alternatives to it. */}
            <ActivityUsher usher={usher} onRedo={finish.repeat} className="mb-3" />
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
              {/* BACK TO THE STOP, NOT THE MAP — the same destination the ✕
                  above it now has, so one screen no longer offers two exits
                  that land in different places (Dan, 2026-09-13). The label
                  follows the address: saying « map » while going to the goal
                  page is the kind of small lie that costs a bug report. */}
              <Link href={exitHref} className="underline decoration-dotted">
                {backLabel}
              </Link>
            </div>
          </div>
        ) : (
        <>
        <div className="mx-auto grid w-full fluo-measure grid-cols-5 gap-2 px-4 py-3">
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
            // data-tour: a guided first run lights this button and waits for
            // the learner to press it (GuidedSteps, content/hints.ts).
            data-tour="drill-cta"
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
              <div className="drill-why mx-auto w-full fluo-measure px-4 pt-3 text-sm text-[color:var(--cahier-ink)]">
                {feedback.why}
              </div>
            )}
            <div className="mx-auto flex w-full fluo-measure flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
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
