import AuthGate from "@/components/AuthGate";
import NumBourse from "@/games/numbourse/NumBourse";

// NumBourse has no per-deck content — the eight-level ladder IS the game, so
// the flap links straight into the trading floor (no gallery page). The game
// wears its own GameFrame (patch 23); the page adds only the sign-in wall.
export default function NumBoursePage() {
  return (
    <AuthGate what="play">
      <NumBourse />
    </AuthGate>
  );
}
