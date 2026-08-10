"use client";

/**
 * 🏆 Le Classement — the public XP board, ported from the old laf1201 suite
 * (Dan, 2026-07-05: the one motivating surface the new site lacked). The
 * board itself lives in components/LeaderboardList so the 🏆 top-bar icon
 * can float the same ranking in an overlay (Dan, 2026-07-08).
 */
import CahierShell from "@/components/CahierShell";
import LeaderboardList from "@/components/LeaderboardList";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

export default function LeaderboardPage() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="leaderboard">
      <div className="mx-auto max-w-xl px-3 py-5">
        <h1 className="cahier-display cahier-hand text-3xl font-normal text-[color:var(--cahier-ink)]">🏆 Le Classement <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· Leaderboard</span></h1>
        <p className="mt-1 mb-4 text-sm text-[color:var(--cahier-ink-soft)]">⭐ XP wins the ranking; 🔥 is the streak.</p>
        <LeaderboardList />
      </div>
    </CahierShell>
  );
}
