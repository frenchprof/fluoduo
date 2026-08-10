import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import AuthGate from "@/components/AuthGate";
import NumBourse from "@/games/numbourse/NumBourse";
import GameBar from "@/components/GameBar";

// NumBourse has no per-deck content — the eight-level ladder IS the game, so
// the flap links straight into the trading floor (no gallery page).
export default function NumBoursePage() {
  return (
    <AuthGate what="play">
      <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#e7f6ee 0%,#f4fbf7 100%)" }}>
        <GameBar title="📈 NumBourse" />
        <NumBourse />
      </main>
    </AuthGate>
  );
}
