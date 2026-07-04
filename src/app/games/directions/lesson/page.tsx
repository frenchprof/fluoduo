"use client";

import { useRouter } from "next/navigation";
import CahierShell, { withActive } from "@/components/CahierShell";
import FlashcardLesson from "@/games/letris/FlashcardLesson";
import directionsSet from "@/content/directions-matching.json";
import { directionsToLessonSet } from "@/games/directions/toLessonSet";
import type { MatchingSet } from "@/games/matching/MatchingGame";
import { DIRECTIONS_TABS } from "@/games/directions/tabs";

const lessonSet = directionsToLessonSet(directionsSet as MatchingSet);

export default function DirectionsLessonPage() {
  const router = useRouter();
  return (
    <CahierShell tabs={withActive(DIRECTIONS_TABS, "lesson")} active="lesson" crumb="Lesson">
      <FlashcardLesson set={lessonSet} onStartGame={() => router.push("/games/matching")} />
    </CahierShell>
  );
}
