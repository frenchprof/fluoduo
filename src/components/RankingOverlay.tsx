"use client";

/**
 * 🏆 floating Classement (Dan, 2026-07-08: the trophy icon in the top bar
 * "brings up the floating menu of the ranking list"). Same board as
 * /leaderboard, in a Spotlight-style panel.
 */
import { useEffect } from "react";
import Link from "next/link";
import LeaderboardList from "@/components/LeaderboardList";

export default function RankingOverlay({ onClose }: { onClose: () => void }) {
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
      aria-label="Classement"
    >
      <div
        className="mx-auto mt-[8vh] flex max-h-[80vh] w-[min(92vw,32rem)] flex-col rounded-2xl border-2 border-[color:var(--cahier-ink,#222850)] bg-[color:var(--cahier-paper,#fdfbf4)] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">🏆 Le Classement</h2>
          <div className="flex items-center gap-2">
            <Link href="/leaderboard" onClick={onClose} className="text-xs font-bold underline">page complète</Link>
            <button type="button" onClick={onClose} aria-label="Fermer" className="cahier-btn cahier-btn-sm">✕</button>
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto">
          <LeaderboardList />
        </div>
      </div>
    </div>
  );
}
