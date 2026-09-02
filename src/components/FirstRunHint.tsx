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
import { ACTIVITY_HINTS } from "@/content/hints";

/** One key per activity, so dismissing one says nothing about the others. */
const keyFor = (k: string) => `fluolingo:hint.${k}`;

export default function FirstRunHint({
  hintKey,
  title,
  children,
}: {
  /** Stable, and never a display name — a rename must not re-open a hint the
   *  learner has already dismissed (the Memo-rename precedent). */
  hintKey: string;
  title: string;
  /** The instruction. Short enough to read standing up. */
  children: ReactNode;
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
    try {
      if (window.localStorage.getItem(keyFor(hintKey)) !== "1") setOpen(true);
    } catch {
      // A browser with storage blocked gets the hint every visit, which is the
      // safe side of this failure: an instruction repeated beats one lost.
      setOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
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
            className="h-[18px] w-[18px] shrink-0 accent-[color:var(--cahier-ink)]"
          />
          Do not show me again
        </label>
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          className="cahier-btn cahier-btn-primary mt-3 w-full justify-center font-black"
        >
          Got it
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
  if (!hint || hint.on !== on) return null;
  return (
    <FirstRunHint hintKey={activityKey!} title={hint.title}>
      <ol className="ml-4 list-decimal space-y-1.5">
        {hint.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </FirstRunHint>
  );
}
