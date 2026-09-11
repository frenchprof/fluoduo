/**
 * /leaderboard/embed — the Board, running inside the cahier the User page
 * draws rather than drawing one of its own (the `/profil/embed` pattern,
 * 2026-09-07).
 */
import CahierShell from "@/components/CahierShell";
import LeaderboardList from "@/components/LeaderboardList";

export const metadata = { title: "Board — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell active="leaderboard">
      <div className="mx-auto max-w-xl px-3 py-4">
        <LeaderboardList />
      </div>
    </CahierShell>
  );
}
