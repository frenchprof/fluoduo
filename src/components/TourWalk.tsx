"use client";

/**
 * THE 8-STEP TOUR WALK — takes the learner through every activity, one
 * round each, with Dan's own words for what each one is.
 *
 * Dan, 2026-09-19: *"instead of just pointing to what each of the steps
 * does, get users to actually click through one round of every single
 * activity."*
 *
 * SHAPE: a bottom sheet (the house's own BottomSheet pattern), one step
 * visible at a time. Each step names the activity, says what it is for
 * (Dan's copy), and has two buttons: « Try it → » navigates to the
 * activity's route and the tour remembers where the learner is; « Skip »
 * ends the tour. When the learner returns from the activity, the tour
 * picks up where it left off.
 *
 * THE PROGRESS IS REMEMBERED in localStorage (`fluolingo:tour.step`), so
 * a learner who does three activities today and five tomorrow is met at
 * step four, not step one. A completed tour sets the key to "done" and
 * never returns.
 *
 * WHERE IT LIVES: mounted from CahierShell, so it appears on every page
 * the learner visits — but only when the tour is active (the key holds a
 * step number, not "done" or absent).
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOUR_STEPS } from "@/content/tourSteps";

const KEY = "fluolingo:tour.step";

function readStep(): number {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === null || v === "done") return -1;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 && n < TOUR_STEPS.length ? n : -1;
  } catch { return -1; }
}

function writeStep(n: number) {
  try { window.localStorage.setItem(KEY, String(n)); } catch { /* private mode */ }
}

export function tourActive(): boolean {
  if (typeof window === "undefined") return false;
  return readStep() >= 0;
}

export function startTour() {
  writeStep(0);
  // THE STORAGE EVENT DOES NOT FIRE IN THE WRITING TAB — the `storage`
  // listener below catches other tabs, but the TourWalk in THIS document
  // needs its own ping.
  window.dispatchEvent(new Event("fluolingo:tour-start"));
}

export default function TourWalk() {
  const [step, setStep] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is unreadable during SSR on a static export; this is the mount-only read the house pattern uses
    setMounted(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- same mount-only localStorage read
    setStep(readStep());
  }, []);

  // Re-read on route change (the learner may have come back from an activity)
  // and on the tour-start ping (the storage event does not fire in the tab
  // that wrote the value — startTour() dispatches its own event).
  useEffect(() => {
    const reread = () => setStep(readStep());
    window.addEventListener("storage", reread);
    window.addEventListener("fluolingo:tour-start", reread);
    return () => {
      window.removeEventListener("storage", reread);
      window.removeEventListener("fluolingo:tour-start", reread);
    };
  }, []);

  if (!mounted || step < 0 || step >= TOUR_STEPS.length) return null;

  const s = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const next = () => {
    const n = step + 1;
    if (n >= TOUR_STEPS.length) {
      writeStep(-1); // done — the localStorage key becomes "-1" (never returns)
      try { window.localStorage.setItem(KEY, "done"); } catch { /* */ }
      setStep(-1);
    } else {
      writeStep(n);
      setStep(n);
    }
  };

  const skip = () => {
    writeStep(-1);
    try { window.localStorage.setItem(KEY, "done"); } catch { /* */ }
    setStep(-1);
  };

  const go = () => {
    router.push(s.href);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3" role="dialog" aria-label={`Tour: step ${step + 1} of ${TOUR_STEPS.length}`}>
      <div className="mx-auto max-w-md rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-4 shadow-xl">
        {/* The step counter — quiet, just enough to say where you are */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[color:var(--cahier-ink)]/40">
            Step {step + 1} of {TOUR_STEPS.length}
          </span>
          <button
            type="button"
            onClick={skip}
            className="text-[10px] font-bold text-[color:var(--cahier-ink)]/40 underline underline-offset-2 hover:text-[color:var(--cahier-ink)]"
          >
            Skip the tour
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
          {TOUR_STEPS.map((_, i) => (
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
    </div>
  );
}
