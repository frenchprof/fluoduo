"use client";

/**
 * First-visit Guide popup (Dan, 2026-07-13: "the Guide should be the first
 * pop up floating page by default, with a Don't show me again"). Shows on
 * the home page until dismissed for good; ✕ closes just this visit. Waits
 * for the beta notice to have been dismissed so two popups never stack.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
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
  const never = () => {
    try { window.localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  };
  return (
    <div className="fixed inset-0 z-[85] bg-black/35 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Guide" onClick={() => setOpen(false)}>
      <div
        className="mx-auto mt-[4vh] max-h-[88vh] w-[min(94vw,42rem)] overflow-y-auto rounded-2xl border-2 border-[color:var(--cahier-ink,#222850)] bg-[color:var(--cahier-paper,#fdfbf4)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="cahier-display text-xl font-black text-[color:var(--cahier-ink)]">❓ Guide <span className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">· How FluoLingo works</span></h2>
          <div className="flex items-center gap-1.5">
            {/* Same ⤢ escape hatch as the SIO popup (Dan, 2026-07-13: a
                "Open the Guide page" button reads oddly on the Guide itself). */}
            <Link href="/guide" onClick={never} className="cahier-btn cahier-btn-sm" aria-label="Ouvrir en pleine page" title="Ouvrir en pleine page">
              ⤢
            </Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="cahier-btn cahier-btn-sm">✕</button>
          </div>
        </div>
        <GuideBody />
        <div className="mt-5">
          <button type="button" onClick={never} className="cahier-btn cahier-btn-accent font-black">
            ✓ Got it, don't show me again
          </button>
        </div>
      </div>
    </div>
  );
}
