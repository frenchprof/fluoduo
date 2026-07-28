import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import AuthGate from "@/components/AuthGate";
import NumBourse from "@/games/numbourse/NumBourse";

// NumBourse has no per-deck content — the eight-level ladder IS the game, so
// the flap links straight into the trading floor (no gallery page).
export default function NumBoursePage() {
  return (
    <AuthGate what="play">
      <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#e7f6ee 0%,#f4fbf7 100%)" }}>
        <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm font-bold">
            <BackLink fallback="/" className="text-[#0f8a5f] hover:text-[#0a6b48]">← Back</BackLink>
            <span className="flex items-center gap-2 text-[#075985]/60">📈 NumBourse <HelpDot /></span>
          </div>
        </div>
        <NumBourse />
      </main>
    </AuthGate>
  );
}
