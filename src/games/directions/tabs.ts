import type { ShellTab } from "@/components/CahierShell";

/** One tab per step of the directions unit; "unit" is the hub itself. */
export const DIRECTIONS_TABS: ShellTab[] = [
  { key: "unit", label: "Directions", emoji: "🧭", href: "/games/directions" },
  { key: "lesson", label: "Lesson", emoji: "📚", href: "/games/directions/lesson" },
  { key: "map", label: "Map", emoji: "🗺️", href: "/games/directions/map" },
  { key: "matching", label: "Matching", emoji: "🔗", href: "/games/matching" },
];
