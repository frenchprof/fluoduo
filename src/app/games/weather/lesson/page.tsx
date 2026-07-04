"use client";

import { useRouter } from "next/navigation";
import CahierShell, { withActive } from "@/components/CahierShell";
import FlashcardLesson from "@/games/letris/FlashcardLesson";
import weatherSet from "@/content/weather-letris.json";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import { WEATHER_TABS } from "@/games/weather/tabs";

export default function WeatherLessonPage() {
  const router = useRouter();
  return (
    <CahierShell tabs={withActive(WEATHER_TABS, "lesson")} active="lesson" crumb="Lesson">
      <FlashcardLesson
        set={weatherSet as LetrisSet}
        onStartGame={() => router.push("/games/weather/match")}
      />
    </CahierShell>
  );
}
