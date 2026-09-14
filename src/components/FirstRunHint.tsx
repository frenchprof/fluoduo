"use client";

/**
 * WHAT TO DO HERE — shown on arrival, until the learner says stop.
 *
 * Dan, 2026-09-02, straight after having MémoiRecall's « Flip » button
 * removed: *"add a pop up instruction for the first time with a 'do not show
 * me again' regarding what the user needs to do."*
 *
 * The button that went was doing two jobs and only one of them was redundant.
 * As a CONTROL it duplicated tapping the card, on the activity named for that
 * gesture. As a SIGN it was the only thing on screen saying that the card
 * could be tapped at all — and a card with nothing under it says nothing. So
 * the instruction comes back as an instruction, once, where it costs a
 * learner one tap instead of a permanent row.
 *
 * WHY NOT FirstTour. That is a spotlight tour of a PAGE TYPE, offered by
 * CahierShell, and its "never" is one global flag for every tour in the app.
 * A drill is not a page type, does not mount CahierShell, and a learner who
 * has switched the tours off has not asked to be told nothing ever again on
 * an activity they are opening for the first time. Different question,
 * different memory.
 *
 * WHY IT KEEPS COMING BACK UNTIL IT IS DISMISSED. « First time » and « do not
 * show me again » only both mean something if the second is what ENDS the
 * first — a card that hides itself after one look makes the checkbox a
 * decoration, which is precisely the kind of control the litmus test deletes.
 * So it opens each visit and « Got it » closes it for this one; the checkbox
 * is what makes it the last.
 *
 * IT IS PORTALLED TO THE BODY. A drill's root is `h-full overflow-hidden`
 * (DrillShell), so a fixed overlay rendered inside it is clipped to the
 * paper. The tour has the same reason for the same choice.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { ACTIVITY_HINTS, isGuided, stepText, type GuidedStep } from "@/content/hints";
import GuidedSteps, { targetVisible } from "@/components/GuidedSteps";

/** One key per activity, so dismissing one says nothing about the others. */
const keyFor = (k: string) => `fluolingo:hint.${k}`;

/**
 * ONE HINT PER KEY ON THE WHOLE SCREEN, HOST AND FRAME TOGETHER (Dan, 13 Sep,
 * sending VoixLà: *"VoixLà starts with a double tour"*).
 *
 * Every station runs in the cahier in an iframe (7 Sep), and `CahierShell`
 * renders this component — so on a station where the HOST and the FRAMED page
 * both name the same activity, it mounted twice and a learner saw two cards
 * stacked, the second offset by the frame's own origin. Measured on the built
 * app at 1440x900:
 *
 *     /tts          host:1  FRAME:1     <- two cards
 *     /reviser      host:1  FRAME:1     <- two cards
 *     /conjugaison          FRAME:1     one, and it lives in the FRAME
 *     /speculearn   host:1              one, and it lives in the HOST
 *     /tutor        host:1
 *
 * `html[data-embed]` was not the answer. It hides the shell's FURNITURE inside
 * a frame — site bar, band, coils — and this card is portalled to `body`, so
 * it was never in that net. And the obvious fix, "do not open inside a frame",
 * is WRONG IN BOTH DIRECTIONS: it would delete ConjugaZone's only hint, which
 * lives in the frame, and the mirror fix would delete SpecuLearn's and
 * ChaTutor's, which live in the host. The two-column table above is the whole
 * reason this is a claim and not a one-line guard.
 *
 * So the FIRST card to mount for a key wins and the rest stay shut. The claim
 * lives on the TOP document because that is the one thing a host and its
 * same-origin frames share; it is released on close and on unmount, so a
 * learner who leaves and comes back is offered it again exactly as before.
 * Cross-origin access throws, and the catch opens the card — the old
 * behaviour, because a duplicated instruction beats a missing one.
 */
const CLAIM = "fluolingoHintClaim";
function claimHint(key: string): boolean {
  try {
    const top = window.top?.document?.documentElement;
    if (!top) return true;
    const held = top.dataset[CLAIM];
    if (held && held !== key) return true;      // another activity's card: not ours to judge
    if (held === key) return false;             // someone already shows this one
    top.dataset[CLAIM] = key;
    return true;
  } catch {
    return true;
  }
}
function releaseHint(key: string): void {
  try {
    const top = window.top?.document?.documentElement;
    if (top && top.dataset[CLAIM] === key) delete top.dataset[CLAIM];
  } catch {
    /* cross-origin: nothing was claimed, so nothing to release */
  }
}

export default function FirstRunHint({
  hintKey,
  title,
  children,
  ctaLabel = "Got it",
  onGot,
}: {
  /** Stable, and never a display name — a rename must not re-open a hint the
   *  learner has already dismissed (the Memo-rename precedent). */
  hintKey: string;
  title: string;
  /** The instruction. Short enough to read standing up. */
  children: ReactNode;
  /** « Got it » unless the row goes on to walk them through it, when the
   *  button is the start of the walk and says so. */
  ctaLabel?: string;
  /** Run after the card closes — the guided walk, where a row has one. The
   *  dismissal (and the "do not show me again" tick) happens either way, so
   *  a learner who ticks the box and is then walked through it once is not
   *  asked again next time. */
  onGot?: () => void;
}) {
  // Starts CLOSED and opens from an effect: localStorage cannot be read
  // during render, and a server-rendered "open" would flash on every visit
  // including the dismissed ones.
  const [open, setOpen] = useState(false);
  const [never, setNever] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // localStorage cannot be read during render, so whether this opens is not
    // knowable until after mount — the accepted resolution in this repo, with
    // the reason written out (AGENTS.md). Block-disabled rather than
    // line-disabled: the rule reports only the first setState it meets and
    // which one that is differs between local and CI eslint, which is how
    // FirstTour's two effects came to carry the same block form.
    /* eslint-disable react-hooks/set-state-in-effect */
    let claimed = false;
    try {
      if (window.localStorage.getItem(keyFor(hintKey)) !== "1") {
        claimed = claimHint(hintKey);
        if (claimed) setOpen(true);
      }
    } catch {
      // A browser with storage blocked gets the hint every visit, which is the
      // safe side of this failure: an instruction repeated beats one lost.
      claimed = claimHint(hintKey);
      if (claimed) setOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // Release on unmount so leaving and returning offers it again, and so the
    // copy that lost the race can win it next time rather than being dead.
    return () => { if (claimed) releaseHint(hintKey); };
  }, [hintKey]);

  // Focus lands on the way out, so the keyboard can dismiss it with Enter
  // without tabbing through the drill behind it.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const dismiss = () => {
    if (never) {
      try {
        window.localStorage.setItem(keyFor(hintKey), "1");
      } catch {
        // Nothing to do: the box is ticked and the browser will not remember
        // it. Closing anyway is better than refusing to close.
      }
    }
    setOpen(false);
    // The walk starts as the card leaves, not beside it — two overlays at once
    // is the thing this is meant to replace.
    onGot?.();
  };

  return createPortal(
    <div
      /* z-79 IS DELIBERATE AND IS THE LOW END OF THE STACK. Two games open on
         CreditsSplash (z-80), which auto-clears after 3s and carries « TAP TO
         SKIP » — put this above it and the instruction covers the credits for
         three seconds AND eats the tap meant to skip them. Below it, the order
         a learner gets is the one that makes sense: credits, then what to do.
         Everything else that can be on screen at once — the ☰ Menu (85), the
         ⋯ sheet (90), the tour (100) — is a thing the learner has just asked
         for, and each correctly covers an instruction they did not. */
      className="fixed inset-0 z-[79] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={dismiss}
    >
      <div
        className="w-[min(94vw,26rem)] rounded-2xl border-2 bg-[color:var(--cahier-paper,#fdfbf4)] p-5 shadow-2xl"
        style={{ borderColor: "var(--cahier-ink, #222850)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="cahier-display mb-2 text-xl font-black text-[color:var(--cahier-ink)]">{title}</h2>
        <div className="text-[15px] leading-relaxed text-[color:var(--cahier-ink)]">{children}</div>
        {/* The checkbox is a LABEL, so the words are part of the target — a
            13px box on a phone is not a thing anyone hits on purpose. */}
        <label className="mt-4 flex cursor-pointer select-none items-center gap-2 text-sm font-bold text-[color:var(--cahier-ink-soft)]">
          <input
            type="checkbox"
            checked={never}
            onChange={(e) => setNever(e.target.checked)}
            className="h-[1.125rem] w-[1.125rem] shrink-0 accent-[color:var(--cahier-ink)]"
          />
          Do not show me again
        </label>
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          className="cahier-btn cahier-btn-primary mt-3 w-full justify-center font-black"
        >
          {ctaLabel}
        </button>
      </div>
    </div>,
    document.body,
  );
}

/**
 * The shells' one-liner. Both DrillShell and CahierShell mount this with the
 * key they already have, and it draws nothing unless `content/hints.ts` has a
 * row for that key AND the row belongs to this shell.
 *
 * The `on` test is not bookkeeping: `wordrill` names the Say It DRILL and the
 * deck-picker PAGE at /practice/wordrill, and `conjugaison` does the same.
 * Without it, opening the picker fires the drill's instruction over a list of
 * decks. It is also what excludes the hubs Dan exempted, by having no row at
 * all rather than a list of exceptions to keep in step.
 */
export function ActivityFirstRun({ activityKey, on }: { activityKey: string | undefined; on: "drill" | "page" }) {
  const hint = activityKey ? ACTIVITY_HINTS[activityKey] : undefined;
  // The card's own "Got it" is what starts a guided run: read the two lines,
  // then be walked through them. Kept in one state here rather than inside
  // FirstRunHint, so a row with no selectors is byte-for-byte what it was.
  //
  // THREE PHASES, NOT A BOOLEAN, AND THE THIRD IS THE BUG FIX (Dan, 13 Sep:
  // *"GramMarathon and WorDrill and possibly others have a tour that is broken
  // and looping"* — it is all five guided rows: lesson, flip, grammarathon,
  // ecoutexte, wordrill).
  //
  // It was `const [walking, setWalking] = useState(false)`, and the walk's
  // `onDone` set it back to FALSE — which re-rendered the card. FirstRunHint
  // then MOUNTS FRESH, its open-effect reads localStorage, finds the "do not
  // show me again" flag unset (the learner pressed « Show me », not the
  // checkbox), and opens the card again. Show me -> walk -> card -> show me,
  // with no way out but the checkbox, on the five activities that guide.
  //
  // The card is deliberately shown on EVERY visit until a learner opts out —
  // "shown on arrival, until the learner says stop", the header's own words —
  // so the flag is not the answer and setting it would silently opt them out.
  // What must not repeat is the card WITHIN ONE VISIT, after its own walk has
  // just finished. `done` is that, and it lives in component state, so the
  // next arrival offers the card again exactly as before.
  const [phase, setPhase] = useState<"card" | "walking" | "done">("card");

  /*
   * A STEP THIS DECK NEVER DRAWS IS NOT LISTED AND NOT WALKED (Dan, 2026-09-13:
   * *"The WorDrill and MemoiRecall problem is not solved. I see Step 1 asking
   * to choose how ong a run but the guide isn't pointing to how or where it can
   * be done"*).
   *
   * HE WAS READING A TRUE SENTENCE ABOUT ANOTHER DECK. Both rows open on « How
   * many words? » / « How many cards? », which is right: on a long deck that
   * chooser IS the first thing on screen and the mic does not exist until it is
   * answered. But `sessionLength.offer()` returns null at 14 items or fewer, so
   * a short deck never asks — it just starts. Driven across every exported
   * WorDrill route on the built app: the chooser is on screen on 29 of them and
   * absent on 21, and on those 21 the card's step 1 named a control that was
   * never going to exist and the walk then sat on "Finding it…".
   *
   *     /practice/say-it/aller-destinations   49 words  -> chooser   ✓
   *     /practice/say-it/salutations          11 words  -> no chooser ✗
   *
   * THE LIST AND THE WALK ARE PRUNED TOGETHER, from one measurement, because
   * fixing only the walk would have left the card still promising a step that
   * silently never came — which is the half Dan was actually looking at.
   *
   * MEASURED UNTIL THE LEARNER PRESSES « Show me », NOT ONCE ON ARRIVAL — and
   * the difference is a regression this went through before it worked. A
   * drill's queue is `useState([])` filled by a mount shuffle (SayItContent
   * line 143: the shuffle has to happen after mount so the server's HTML and
   * the first client render agree), so ON THE FIRST COMMIT THERE IS NO DECK
   * AND THEREFORE NO CHOOSER — on every deck, long or short. Measuring once
   * pruned the step out of all fifty, and driving it showed « Step 1 of 1 ·
   * Tap the mic · Finding it… » sitting under a « How many words? » that had
   * arrived a tick later. One fault swapped for its mirror image.
   *
   * So it re-measures while the card is up and freezes when the walk starts:
   * the card lists what is on screen, and the walk is handed exactly what the
   * card promised. A step without `optional` is never measured, so the
   * seventeen other rows behave byte-for-byte as before.
   */
  const [pruned, setPruned] = useState<(string | GuidedStep)[] | null>(null);
  useEffect(() => {
    if (phase !== "card") return;
    // Reading the DOM is not something render may do, so this cannot be a
    // `useMemo` — the measurement has to happen after the page has painted.
    //
    // SET ONLY WHEN IT CHANGES. A fresh array every 150ms is never `Object.is`
    // to the last one, so storing it unconditionally would re-render the card
    // seven times a second for as long as a learner reads it.
    const measure = () => setPruned((was) => {
      const now = (hint?.steps ?? []).filter(
        (s) => !isGuided(s) || !s.optional || targetVisible(s.selector),
      );
      if (was && was.length === now.length && was.every((s, k) => s === now[k])) return was;
      return now;
    });
    measure();
    const id = window.setInterval(measure, 150);
    return () => window.clearInterval(id);
  }, [hint, phase]);

  if (!hint || hint.on !== on) return null;

  // Until the measurement has happened there is nothing honest to draw: the
  // card is what promises the steps, so showing it a frame early is the bug.
  if (pruned === null) return null;

  const steps = pruned;
  const guided: GuidedStep[] = steps.filter(isGuided);

  // A ROW WITH SELECTORS GUIDES; A ROW WITHOUT ONE ONLY TELLS, exactly as
  // before. That is what lets the seventeen activities move one at a time
  // instead of all on the day the pattern lands.
  if (guided.length) {
    // The walk has run this visit: say nothing more until the learner arrives
    // again. Returning null rather than the card is the whole of the fix.
    if (phase === "done") return null;
    return phase === "walking"
      ? <GuidedSteps steps={guided} onDone={() => setPhase("done")} />
      : (
        <FirstRunHint hintKey={activityKey!} title={hint.title} ctaLabel="Show me" onGot={() => setPhase("walking")}>
          <ol className="ml-4 list-decimal space-y-1.5">
            {steps.map((s) => <li key={stepText(s)}>{stepText(s)}</li>)}
          </ol>
        </FirstRunHint>
      );
  }

  return (
    <FirstRunHint hintKey={activityKey!} title={hint.title}>
      <ol className="ml-4 list-decimal space-y-1.5">
        {steps.map((s) => (
          <li key={stepText(s)}>{stepText(s)}</li>
        ))}
      </ol>
    </FirstRunHint>
  );
}
