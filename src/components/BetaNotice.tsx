"use client";

/**
 * One-time beta notice from Dr Chan (Dan, 2026-07-05): a centered cahier-style
 * modal shown on a learner's first arrival, dismissed forever via localStorage.
 * Renders at z-[90] — deliberately ABOVE the FirstTour offer (z-[80]): the
 * learner dismisses the notice first, the tour offer waits beneath.
 */

import { useCallback, useEffect, useState } from "react";

const KEY = "fluolingo:beta-notice.v1";

export default function BetaNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {}
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[color:var(--fluo-ink)]/45 p-4" role="dialog" aria-modal="true" aria-label="Un mot de Dr Chan">
      <div className="w-full max-w-md rounded-2xl border-2 border-[color:var(--fluo-ink)] bg-white p-5 shadow-[6px_6px_0_var(--fluo-hl)]">
        <h2 className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)]">Un mot de Dr Chan 👋</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--fluo-ink)]">
          FluoLingo is in beta. Many rounds of checks have been done, but some bugs and errors will
          have slipped through. You are among the first users of this platform — apologies in
          advance for any unworkable sections. Your feedback is extremely valuable: report anything
          odd with the 💬 Feedback button, and claim XP 💎 for every bug you identify.
        </p>
        <button type="button" onClick={dismiss} className="fluo-btn mt-4 w-full">
          Compris !
        </button>
      </div>
    </div>
  );
}
