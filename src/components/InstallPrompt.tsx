"use client";

/**
 * "Add FluOLinGo to your home screen" — offered ONCE, on the learner's third
 * visit or later, and never again once answered.
 *
 * The third-visit rule is the whole ethic of it. A prompt on first open asks
 * someone to commit before they have any reason to, which is how install
 * banners became something people reflexively dismiss. By the third visit the
 * answer means something.
 *
 * The constraints from DOPAMINE_REVIEW's ethics section apply here more than
 * anywhere: no loss-framing, no nagging, no second ask. "Later" is a real
 * answer and it is permanent. There is no badge, no re-prompt, no countdown.
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
import { useEffect, useState } from "react";

const SEEN_KEY = "fluolingo:install-prompt.v1"; // "yes" | "later"
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

export default function InstallPrompt() {
  // ONE piece of state, and it is only ever set from a callback — a timer or
  // the beforeinstallprompt handler — never synchronously in the effect body.
  // (react-hooks/set-state-in-effect; patch 24 set the precedent.)
  // null = not asking.
  const [ask, setAsk] = useState<{ ios: boolean; deferred: BIPEvent | null } | null>(null);

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
      setAsk({ ios: false, deferred: e as BIPEvent });
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const answer = (choice: "yes" | "later") => {
    try { localStorage.setItem(SEEN_KEY, choice); } catch {}
    const d = ask?.deferred;
    setAsk(null);
    if (choice === "yes" && d) d.prompt().catch(() => {});
  };

  if (!ask) return null;
  const { ios } = ask;
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
        <div className="flex gap-2">
          {!ios && (
            <button type="button" onClick={() => answer("yes")} className="cahier-btn cahier-btn-accent flex-1">
              Add
            </button>
          )}
          <button type="button" onClick={() => answer("later")} className={`cahier-btn ${ios ? "flex-1" : ""}`}>
            {ios ? "Got it" : "Later"}
          </button>
        </div>
        <p className="text-center text-[11px] text-[color:var(--cahier-ink-faint)]">
          Asked once. We won’t bring it up again.
        </p>
      </div>
    </div>
  );
}
