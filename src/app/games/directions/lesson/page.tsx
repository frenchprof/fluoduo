"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import FlashcardLesson from "@/games/letris/FlashcardLesson";
import directionsSet from "@/content/directions-matching.json";
import { directionsToLessonSet } from "@/games/directions/toLessonSet";
import type { MatchingSet } from "@/games/matching/MatchingGame";

const lessonSet = directionsToLessonSet(directionsSet as MatchingSet);

export default function DirectionsLessonPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm">
          <Link
            href="/games/directions"
            className="text-slate-400 hover:text-white"
          >
            ← Directions unit
          </Link>
          <span className="text-slate-500">Lesson</span>
        </div>
      </div>
      <FlashcardLesson
        set={lessonSet}
        onStartGame={() => router.push("/games/matching")}
      />
    </main>
  );
}
