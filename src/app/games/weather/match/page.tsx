import Link from "next/link";
import WeatherMatchingGame from "@/games/weather/WeatherMatchingGame";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import weatherSet from "@/content/weather-letris.json";

export default function WeatherMatchPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/games/weather" className="text-slate-400 hover:text-white">
            ← Weather unit
          </Link>
          <span className="text-slate-500">Matching</span>
        </div>
      </div>
      <WeatherMatchingGame set={weatherSet as LetrisSet} />
    </main>
  );
}
