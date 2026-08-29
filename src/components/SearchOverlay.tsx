"use client";

/**
 * Spotlight-style floating search (Dan, 2026-07-08: the search should be a
 * magnifying-glass icon in the top bar "like how the Mac OS is" that opens a
 * floating search window). The 🔍 lives in CahierShell's top bar on every
 * page; this overlay centres a DeckSearch panel over a dimmed backdrop.
 * Esc or a backdrop tap closes it; navigating to a result unmounts it.
 */
import { useEffect } from "react";
import DeckSearch from "@/components/DeckSearch";

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="mx-auto mt-[12vh] w-[min(92vw,34rem)] rounded-2xl border-2 border-[color:var(--fluo-ink,#222850)] bg-[color:var(--cahier-paper,#fdfbf4)] p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <DeckSearch className="max-w-none" autoFocus />
        <p className="mt-2 px-1 text-[11px] font-bold text-[color:var(--fluo-ink,#222850)]/50">
          Esc to close
        </p>
      </div>
    </div>
  );
}
