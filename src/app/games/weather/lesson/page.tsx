"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import FlashcardLesson from "@/games/letris/FlashcardLesson";
import weatherSet from "@/content/weather-letris.json";
import type { LetrisSet } from "@/games/letris/LetrisGame";

export default function WeatherLessonPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/games/weather" className="text-slate-400 hover:text-white">
            ← Weather unit
          </Link>
          <span className="text-slate-500">Lesson</span>
        </div>
      </div>
      <FlashcardLesson
        set={weatherSet as LetrisSet}
        onStartGame={() => router.push("/games/weather/match")}
      />
    </main>
  );
}
