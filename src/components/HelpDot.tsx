"use client";

/**
 * A small inline "?" that opens the Quick Guide (GuideSplash) from pages that
 * live OUTSIDE the CahierShell — the immersive game/practice views (Dan,
 * 2026-07-20: "provide help on all pages"). Deliberately NOT a floating
 * button: an earlier floating control once sat on top of the game controls
 * (Dan), so this renders inline in the page's own header row next to the
 * Back link, where the normal layout flow guarantees it can't cover the
 * board. Inherits text colour from its context so each game's theme styles
 * it for free.
 */
import { useState } from "react";
import GuideSplash from "@/components/GuideSplash";

export default function HelpDot({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          // Autonomy instrument: solicited guidance (help-seeking construct)
          void import("@/lib/firebase/usage").then((m) =>
            m.logEvent("help.open", { path: typeof location !== "undefined" ? location.pathname : "" })
          ).catch(() => {});
        }}
        title="Quick guide"
        aria-label="Open the quick guide"
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current text-xs font-black opacity-60 transition hover:opacity-100 ${className}`}
      >
        ?
      </button>
      {open && <GuideSplash onClose={() => setOpen(false)} />}
    </>
  );
}
