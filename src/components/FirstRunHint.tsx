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
import GuidedSteps from "@/components/GuidedSteps";

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
  const guided: GuidedStep[] = (hint?.steps ?? []).filter(isGuided);
  // The card's own "Got it" is what starts a guided run: read the two lines,
  // then be walked through them. Kept in one state here rather than inside
  // FirstRunHint, so a row with no selectors is byte-for-byte what it was.
  const [walking, setWalking] = useState(false);
  if (!hint || hint.on !== on) return null;

  // A ROW WITH SELECTORS GUIDES; A ROW WITHOUT ONE ONLY TELLS, exactly as
  // before. That is what lets the seventeen activities move one at a time
  // instead of all on the day the pattern lands.
  if (guided.length) {
    return walking
      ? <GuidedSteps steps={guided} onDone={() => setWalking(false)} />
      : (
        <FirstRunHint hintKey={activityKey!} title={hint.title} ctaLabel="Show me" onGot={() => setWalking(true)}>
          <ol className="ml-4 list-decimal space-y-1.5">
            {hint.steps.map((s) => <li key={stepText(s)}>{stepText(s)}</li>)}
          </ol>
        </FirstRunHint>
      );
  }

  return (
    <FirstRunHint hintKey={activityKey!} title={hint.title}>
      <ol className="ml-4 list-decimal space-y-1.5">
        {hint.steps.map((s) => (
          <li key={stepText(s)}>{stepText(s)}</li>
        ))}
      </ol>
    </FirstRunHint>
  );
}
