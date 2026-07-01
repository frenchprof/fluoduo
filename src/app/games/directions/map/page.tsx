import Link from "next/link";
import DirectionsMapGame from "@/games/directions/DirectionsMapGame";

export default function DirectionsMapPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/games/directions" className="text-slate-400 hover:text-white">
            ← Directions unit
          </Link>
          <span className="text-slate-500">Practice map</span>
        </div>
      </div>
      <DirectionsMapGame />
    </main>
  );
}
