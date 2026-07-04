import type { ShellTab } from "@/components/CahierShell";

/** One tab per step of the weather unit; "unit" is the hub itself. */
export const WEATHER_TABS: ShellTab[] = [
  { key: "unit", label: "Quel temps ?", emoji: "🌡️", href: "/games/weather" },
  { key: "lesson", label: "Lesson", emoji: "📚", href: "/games/weather/lesson" },
  { key: "match", label: "Matching", emoji: "🔗", href: "/games/weather/match" },
  { key: "mcq", label: "MCQ", emoji: "✅", href: "/games/weather/mcq" },
  { key: "gap", label: "Gapfill", emoji: "✏️", href: "/games/weather/gap" },
  { key: "rain", label: "Letris", emoji: "🌦️", href: "/games/letris/weather" },
];
