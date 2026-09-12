"use client";

/**
 * "Add FluOLinGo to your home screen" — offered from the learner's third
 * visit, and gone for good the moment they say so.
 *
 * The third-visit rule is the whole ethic of it. A prompt on first open asks
 * someone to commit before they have any reason to, which is how install
 * banners became something people reflexively dismiss. By the third visit the
 * answer means something.
 *
 * THE DISMISSAL IS A CHECKBOX, per Dan (2026-09-05) and the FirstRunHint
 * precedent (Dan, 2026-09-02: a popup with a « do not show me again »). OK
 * closes it for this visit; the ticked box is what ends it forever. The old
 * design promised "Asked once" in a footer sentence and then broke the
 * promise: Chrome re-fires `beforeinstallprompt` after the native install
 * sheet is dismissed, and the handler here re-opened the banner without ever
 * re-reading the answer that had just been stored. `answeredRef` and the
 * re-check in the handler close that hole.
 *
 * The constraints from DOPAMINE_REVIEW's ethics section still apply: no
 * loss-framing, no badge, no countdown.
 *
 * Two paths, because the platforms differ:
 *   · Chromium fires `beforeinstallprompt`, which we stash and replay from our
 *     own button — the browser's own bar is suppressed either way, so if we
 *     did not offer it, nobody would.
 *   · iOS Safari has no such event; Add to Home Screen lives in the Share
 *     sheet. There we show the instruction instead of a button, because a
 *     button that cannot work is worse than a sentence that can.
 * Anything already running standalone is never asked.
 */
import { useEffect, useRef, useState } from "react";

// "yes" (chose Add) | "never" (ticked the box) | "later" (legacy answers,
// still honoured — they predate the checkbox and meant "stop asking").
const SEEN_KEY = "fluolingo:install-prompt.v1";
const VISITS_KEY = "fluolingo:visits.v1";
const MIN_VISITS = 3;

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function standalone(): boolean {
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari's own flag, which predates the media query.
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

function isIos(): boolean {
  try {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

function answeredForGood(): boolean {
  try {
    return Boolean(localStorage.getItem(SEEN_KEY));
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  // Set only from callbacks — a timer or the beforeinstallprompt handler —
  // never synchronously in the effect body (react-hooks/set-state-in-effect;
  // patch 24 set the precedent). null = not asking.
  const [ask, setAsk] = useState<{ ios: boolean; deferred: BIPEvent | null } | null>(null);
  const [never, setNever] = useState(false);
  // Answered THIS page — the guard against Chrome re-firing
  // beforeinstallprompt after the native sheet is dismissed, which used to
  // re-open the banner seconds after the learner closed it.
  const answeredRef = useRef(false);

  useEffect(() => {
    let visits = 0;
    try {
      if (standalone() || localStorage.getItem(SEEN_KEY)) return; // already in, or already answered
      visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
      localStorage.setItem(VISITS_KEY, String(visits));
    } catch {
      return; // no storage, no counting, no prompt — never ask blind
    }
    if (visits < MIN_VISITS) return;

    if (isIos()) {
      // No event to wait for; the Share-sheet instruction is all we can offer.
      const t = window.setTimeout(() => setAsk({ ios: true, deferred: null }), 1200);
      return () => window.clearTimeout(t);
    }
    const onBip = (e: Event) => {
      e.preventDefault(); // suppress the browser's own bar; we ask in our voice
      if (answeredRef.current || answeredForGood()) return; // a re-fire, not a first ask
      setAsk({ ios: false, deferred: e as BIPEvent });
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!ask) return null;
  const { ios } = ask;

  const close = (choice: "yes" | null) => {
    answeredRef.current = true;
    const remembered = choice ?? (never ? "never" : null);
    if (remembered) {
      try {
        localStorage.setItem(SEEN_KEY, remembered);
      } catch {
        // The box is ticked and the browser will not remember it. Closing
        // anyway is better than refusing to close (FirstRunHint's call).
      }
    }
    const d = ask.deferred;
    setAsk(null);
    if (choice === "yes" && d) d.prompt().catch(() => {});
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] flex justify-center px-3 pb-3" role="dialog" aria-label="Add to home screen">
      <div
        className="flex w-full max-w-md flex-col gap-3 rounded-2xl border-2 bg-[color:var(--cahier-paper-raised)] p-4 shadow-[0_10px_34px_rgba(34,40,80,0.24)]"
        style={{ borderColor: "var(--cahier-ink)" }}
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" width={52} height={52}
               className="shrink-0 rounded-xl border-2" style={{ borderColor: "var(--cahier-ink)" }} />
          <div className="min-w-0">
            <p className="cahier-display text-base font-black leading-tight text-[color:var(--cahier-ink)]">
              Keep FluOLinGo a thumb away
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-[color:var(--cahier-ink-soft)]">
              {ios
                ? "Tap Share, then “Add to Home Screen” — one tap into your revision after that."
                : "Add it to your home screen — one tap into your revision, no link to hunt for."}
            </p>
          </div>
        </div>
        {/* The checkbox is a LABEL, so the words are part of the target — a
            13px box on a phone is not a thing anyone hits on purpose
            (FirstRunHint's rule). Ticking it is what ends the asking. */}
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-bold text-[color:var(--cahier-ink-soft)]">
          <input
            type="checkbox"
            checked={never}
            onChange={(e) => setNever(e.target.checked)}
            className="h-[1.125rem] w-[1.125rem] shrink-0 accent-[color:var(--cahier-ink)]"
          />
          Do not show me again
        </label>
        <div className="flex gap-2">
          {!ios && (
            <button type="button" onClick={() => close("yes")} className="cahier-btn cahier-btn-accent flex-1">
              Add
            </button>
          )}
          <button type="button" onClick={() => close(null)} className={`cahier-btn ${ios ? "flex-1" : ""}`}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
