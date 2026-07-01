"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import FlashcardLesson from "@/games/letris/FlashcardLesson";
import countriesSet from "@/content/countries-letris.json";
import type { LetrisSet } from "@/games/letris/LetrisGame";

export default function CountriesLessonPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/games/countries" className="text-slate-400 hover:text-white">
            ← C&apos;est quel pays ? unit
          </Link>
          <span className="text-slate-500">Lesson</span>
        </div>
      </div>
      <FlashcardLesson
        set={countriesSet as LetrisSet}
        onStartGame={() => router.push("/games/letris/countries")}
      />
    </main>
  );
}
