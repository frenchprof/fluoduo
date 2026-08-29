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
        {/* The h1 + legend moved into the shell's heading band (variant A,
            2026-08-23) — the legend line fell to the litmus rule (⭐/🔥 sit
            beside their own columns on the board). */}
        <LeaderboardList />
      </div>
    </CahierShell>
  );
}
