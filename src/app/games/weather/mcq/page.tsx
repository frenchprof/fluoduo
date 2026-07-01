import Link from "next/link";
import WeatherMCQGame from "@/games/weather/WeatherMCQGame";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import weatherSet from "@/content/weather-letris.json";

export default function WeatherMCQPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/games/weather" className="text-slate-400 hover:text-white">
            ← Weather unit
          </Link>
          <span className="text-slate-500">MCQ</span>
        </div>
      </div>
      <WeatherMCQGame set={weatherSet as LetrisSet} />
    </main>
  );
}
