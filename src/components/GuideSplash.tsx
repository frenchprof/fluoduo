"use client";

/**
 * First-visit Guide popup (Dan, 2026-07-13: "the Guide should be the first
 * pop up floating page by default, with a Don't show me again"). Shows on
 * the home page until dismissed for good; ✕ closes just this visit. Waits
 * for the beta notice to have been dismissed so two popups never stack.
 */
import { useEffect, useState } from "react";
import GuideBody from "@/components/GuideBody";

const KEY = "fluolingo:guide-splash.v1";
const BETA_KEY = "fluolingo:beta-notice.v1";

export default function GuideSplash() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY) && window.localStorage.getItem(BETA_KEY)) setOpen(true);
    } catch {}
  }, []);
  if (!open) return null;
  // The home hero holds its FluoLingo animation while this popup is up
  // (Dan, 2026-07-14: "all the animation got wasted behind the forced
  // popped up guide") — closing announces the stage is clear.
  const close = () => {
    setOpen(false);
    try { window.dispatchEvent(new Event("fluolingo:guide-splash-closed")); } catch {}
  };
  const never = () => {
    try { window.localStorage.setItem(KEY, "1"); } catch {}
    close();
  };
  return (
    <div className="fixed inset-0 z-[85] bg-black/35 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Guide" onClick={close}>
      <div
        className="mx-auto mt-[4vh] max-h-[88vh] w-[min(94vw,42rem)] overflow-y-auto rounded-2xl border-2 border-[color:var(--cahier-ink,#222850)] bg-[color:var(--cahier-paper,#fdfbf4)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dan's final cut (2026-07-14): title, three lines, ▶ Continue —
            nothing else. Continue dismisses for good; clicking the backdrop
            just closes this visit. */}
        <h2 className="cahier-display text-xl font-black text-[color:var(--cahier-ink)]">Quick Guide</h2>
        <GuideBody onContinue={never} />
      </div>
    </div>
  );
}
