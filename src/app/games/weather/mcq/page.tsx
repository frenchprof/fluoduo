"use client";

import CahierShell, { withActive } from "@/components/CahierShell";
import WeatherMCQGame from "@/games/weather/WeatherMCQGame";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import weatherSet from "@/content/weather-letris.json";
import { WEATHER_TABS } from "@/games/weather/tabs";

export default function WeatherMCQPage() {
  return (
    <CahierShell tabs={withActive(WEATHER_TABS, "mcq")} active="mcq" crumb="MCQ">
      <WeatherMCQGame set={weatherSet as LetrisSet} />
    </CahierShell>
  );
}
