"use client";

import CahierShell, { withActive } from "@/components/CahierShell";
import WeatherGapfillGame from "@/games/weather/WeatherGapfillGame";
import type { LetrisSet } from "@/games/letris/LetrisGame";
import weatherSet from "@/content/weather-letris.json";
import { WEATHER_TABS } from "@/games/weather/tabs";

export default function WeatherGapPage() {
  return (
    <CahierShell tabs={withActive(WEATHER_TABS, "gap")} active="gap" crumb="Gapfill">
      <WeatherGapfillGame set={weatherSet as LetrisSet} />
    </CahierShell>
  );
}
