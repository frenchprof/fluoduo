"use client";

import CahierShell, { withActive } from "@/components/CahierShell";
import WeatherMatchingGame from "@/games/weather/WeatherMatchingGame";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import weatherSet from "@/content/weather-letris.json";
import { WEATHER_TABS } from "@/games/weather/tabs";

export default function WeatherMatchPage() {
  return (
    <CahierShell tabs={withActive(WEATHER_TABS, "match")} active="match" crumb="Matching">
      <WeatherMatchingGame set={weatherSet as LetrisSet} />
    </CahierShell>
  );
}
