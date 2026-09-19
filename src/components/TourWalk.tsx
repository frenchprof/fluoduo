"use client";

/**
 * THE TOUR SHEET — one walk at a time, offered once, on its own.
 *
 * Dan, 2026-09-19: *"instead of just pointing to what each of the steps
 * does, get users to actually click through one round of every single
 * activity"* — and then, of the button that started it: *"I am starting to
 * question if we actually need a BUTTON for it. it usually only appears
 * once and then user can say do not show me again."*
 *
 * So nothing starts a tour but the tour itself. The first time it could
 * have helped — first app entry for the app tour, first lesson for the
 * lesson tour — the sheet appears. « Don't show again » (or finishing) is
 * final: the key turns "done" and the sheet never returns. A learner who
 * closes the tab mid-walk is met where they left off, not at step one.
 *
 * TWO INSTANCES, ONE COMPONENT:
 *   — CahierShell mounts the default export bare: the APP tour, whose
 *     « Try it → » navigates to the step's route.
 *   — LessonTabs passes its own steps, its own key, and an `onTryIt` that
 *     switches the lesson's tab instead of navigating. It also passes
 *     `holdAutoStart` = the app tour's active test, so the two never speak
 *     at once: while the app tour is walking, a first lesson visit does not
 *     start the lesson tour — it waits for the next one.
 *
 * SHAPE: a bottom sheet, one step visible at a time. Each step names its
 * subject, says what it is for (Dan's copy), and offers « Try it → » and
 * « Next › ». Progress dots sit between the copy and the controls.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { TOUR_STEPS, type TourStep } from "@/content/tourSteps";

const KEY = "fluolingo:tour.step";
/** The lesson tour's own key — named here so DrillShell's hint-hold and
 *  LessonTabs' instance cannot drift apart on the string. */
export const LESSON_KEY = "fluolingo:tour.lesson";

/**
 * The raw key, three ways: `null` — the tour has never been shown, which is
 * the auto-start's trigger; a number — mid-walk, resume there; "done" —
 * finished or refused, never show again. The distinction between `null` and
 * "done" is the whole difference between "first time here" and "asked and
 * answered"; collapsing them re-offers a refused tour on every visit, which
 * is the nag Dan's "do not show me again" exists to end.
 */
function readRaw(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return "done"; }
}

function readStep(key: string, len: number): number {
  const v = readRaw(key);
  if (v === null || v === "done") return -1;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 && n < len ? n : -1;
}

function writeStep(key: string, n: number) {
  try { window.localStorage.setItem(key, String(n)); } catch { /* private mode */ }
}

function endTour(key: string) {
  try { window.localStorage.setItem(key, "done"); } catch { /* private mode */ }
}

/** Is the APP tour walking right now? The lesson tour holds its auto-start
 *  while this is true — one sheet over a page is guidance, two is noise. */
export function tourActive(): boolean {
  if (typeof window === "undefined") return false;
  return readStep(KEY, TOUR_STEPS.length) >= 0;
}

/** Has the lesson tour been FINISHED or REFUSED? While it has not, the
 *  lesson's own first-run hint card holds — the tab walk goes first, and the
 *  two cards saying two things over one lesson is the noise the hold exists
 *  to prevent. */
export function lessonTourDone(): boolean {
  if (typeof window === "undefined") return false;
  return readRaw(LESSON_KEY) === "done";
}

/** Has the APP tour been finished or refused? While it has not — fresh
 *  learner or mid-walk — FirstTour's per-page invites hold: that invite used
 *  to be the only hand offered on a first visit, and it opened on top of
 *  this tour's own sheet (measured: its « No thanks » intercepted the sheet's
 *  « Try it → »). One hand at a time. */
export function appTourDone(): boolean {
  if (typeof window === "undefined") return false;
  return readRaw(KEY) === "done";
}

/** Restart the app tour by hand (kept for the manual's own door, should it
 *  ever want one — no page calls it today, and the ☰ menu no longer does). */
export function startTour() {
  writeStep(KEY, 0);
  // THE STORAGE EVENT DOES NOT FIRE IN THE WRITING TAB — the `storage`
  // listener below catches other tabs, but the TourWalk in THIS document
  // needs its own ping.
  window.dispatchEvent(new Event("fluolingo:tour-start"));
}

/** Is THIS document a frame? The inline script in layout.tsx marks frame
 *  documents `html[data-embed]`. The app tour renders only in the top one —
 *  see `onlyTopDocument` below for why that decision lives here. */
function inFrame(): boolean {
  return typeof document !== "undefined"
    && document.documentElement.dataset.embed === "1";
}

/** The default hold: never held. Hoisted so the effect's dependency on it
 *  is a stable reference, not a new arrow every render. */
const NEVER: () => boolean = () => false;

export default function TourWalk({
  steps = TOUR_STEPS,
  storageKey = KEY,
  onTryIt,
  holdAutoStart = NEVER,
  onlyTopDocument = true,
}: {
  steps?: TourStep[];
  storageKey?: string;
  /** « Try it → » for this walk. Default: navigate to the step's href.
   *  The lesson passes one that switches its tab instead. */
  onTryIt?: (step: TourStep) => void;
  /** While true, the auto-start holds — used by the lesson instance so it
   *  never opens over the app tour. */
  holdAutoStart?: () => boolean;
  /** The APP tour renders only in the top document (default true): a drill
   *  mounted inside a frame is quiet, because the CahierShell above the
   *  frame already carries the sheet — one sheet per learner. The lesson
   *  tour passes false: it lives inside the lesson's frame, where its
   *  « Try it → » drives the tabs it is describing. */
  onlyTopDocument?: boolean;
}) {
  const [step, setStep] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // THE APP TOUR BELONGS TO THE TOP DOCUMENT. DrillShell mounts an instance
  // on pages no CahierShell covers; on pages where the drill sits in a
  // frame, the shell above already has one. Both instances share one storage
  // key, so an ungated frame copy would race the top copy to the same write.

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is unreadable during SSR on a static export; this is the mount-only read the house pattern uses, and the once-only auto-start is decided by it
    setMounted(true);
    if (onlyTopDocument && inFrame()) return;
    if (readRaw(storageKey) === null && !holdAutoStart()) {
      // FIRST TIME, SELF-STARTED (Dan, 2026-09-19: "it usually only appears
      // once and then user can say do not show me again"). No button, no
      // entry in any menu — the sheet is the hand offered once.
      writeStep(storageKey, 0);
      setStep(0);
    } else {
      setStep(readStep(storageKey, steps.length));
    }
  }, [storageKey, steps.length, holdAutoStart, onlyTopDocument]);

  // Re-read on the tour-start ping (the storage event does not fire in the
  // tab that wrote the value — startTour() dispatches its own). Only the
  // APP tour is ever started that way, so only its key answers the ping;
  // the lesson instance hears it and re-reads a key the ping did not touch.
  useEffect(() => {
    const reread = () => setStep(readStep(storageKey, steps.length));
    window.addEventListener("storage", reread);
    window.addEventListener("fluolingo:tour-start", reread);
    return () => {
      window.removeEventListener("storage", reread);
      window.removeEventListener("fluolingo:tour-start", reread);
    };
  }, [storageKey, steps.length]);

  if (!mounted || step < 0 || step >= steps.length) return null;
  // The reread listeners are not gated per document; the render is. A frame
  // copy with a mid-tour step still draws nothing — the top document's sheet
  // is the learner's one sheet.
  if (onlyTopDocument && inFrame()) return null;

  const s = steps[step];
  const isLast = step === steps.length - 1;

  const next = () => {
    const n = step + 1;
    if (n >= steps.length) {
      endTour(storageKey);
      setStep(-1);
    } else {
      writeStep(storageKey, n);
      setStep(n);
    }
  };

  // Dan's words for the way out, not the developer's: the sheet leaves and
  // never comes back, so the button says what it does.
  const dontShowAgain = () => {
    endTour(storageKey);
    setStep(-1);
  };

  const go = () => {
    if (onTryIt) onTryIt(s);
    else if (s.href) router.push(s.href);
  };

  // PORTALLED TO `body`, like the first-run hint card: the lesson instance
  // is mounted deep inside DrillShell's scroller, where a `fixed` child can
  // still be trapped by a transformed ancestor — and where the sheet's z
  // would have to out-rank every wrapper it sits in. At `body` it is the
  // same sheet in both places, over both frames' furniture. `mounted` above
  // guarantees the document exists.
  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3" role="dialog" aria-label={`Tour: step ${step + 1} of ${steps.length}`}>
      <div className="mx-auto max-w-md rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-4 shadow-xl">
        {/* The step counter — quiet, just enough to say where you are */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[color:var(--cahier-ink)]/40">
            Step {step + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={dontShowAgain}
            className="text-[10px] font-bold text-[color:var(--cahier-ink)]/40 underline underline-offset-2 hover:text-[color:var(--cahier-ink)]"
          >
            Don&apos;t show again
          </button>
        </div>

        {/* The activity name + emoji */}
        <p className="text-lg font-black leading-tight text-[color:var(--cahier-ink)]">
          <span className="mr-2" aria-hidden>{s.emoji}</span>
          {s.name}
        </p>

        {/* Dan's words for what it is */}
        <p className="mt-1.5 text-sm leading-snug text-[color:var(--cahier-ink)]/80">
          {s.what}
        </p>

        {/* The progress dots */}
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition ${
                i < step ? "bg-[color:var(--tier-good)]"
                  : i === step ? "w-4 bg-[color:var(--cahier-ink)]"
                  : "bg-[color:var(--cahier-rule)]"
              }`}
            />
          ))}
        </div>

        {/* The controls */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={go}
            className="cahier-btn cahier-btn-primary cahier-btn--compact flex-1"
          >
            Try it →
          </button>
          {isLast ? (
            <button type="button" onClick={next} className="cahier-btn cahier-btn--compact">
              Finish 🎉
            </button>
          ) : (
            <button type="button" onClick={next} className="cahier-btn cahier-btn--compact">
              Next ›
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
