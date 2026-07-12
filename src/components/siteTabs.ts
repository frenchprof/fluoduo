/**
 * THE global flap row (Dan, 2026-07-05: "there should be a true blue Home
 * page… the guide should appear as one of the top flaps, after Home… then a
 * Unit 0 page… The Index page should also reveal the same accesses"). Every
 * top-level page renders this same row via CahierShell: Home · Guide ·
 * Unité 0–4 · Index.
 */
import type { ShellTab } from "@/components/CahierShell";
import { UNIT_META } from "@/content/sios";

/** Unit accent hues — match the fluo-h-* section palette. */
export const UNIT_ACCENTS: Record<number, string> = {
  0: "#e0567f",
  1: "#2bb6c2",
  2: "#e3a700",
  3: "#8a5fd4",
  4: "#e8852e",
};

/** Server-safe twin of CahierShell's withActive (that module is "use client"
 *  so server pages can't call its exports). */
export function tabsWithActive(tabs: ShellTab[], activeKey: string): ShellTab[] {
  return tabs.map((t) => (t.key === activeKey ? { ...t, href: undefined } : t));
}

export function siteTabs(): ShellTab[] {
  return [
    { key: "home", label: "Home", emoji: "🏠", href: "/" },
    { key: "guide", label: "Guide", emoji: "❓", href: "/guide", hue: "#7c6cff" },
    ...[0, 1, 2, 3, 4].map((u) => ({
      key: `unit-${u}`,
      label: UNIT_META[u]?.label ?? `Unité ${u}`,
      emoji: UNIT_META[u]?.emoji ?? "📚",
      href: `/unit/${u}`,
      hue: UNIT_ACCENTS[u],
    })),
    { key: "index", label: "Index", emoji: "🗂️", href: "/activities", hue: "#5b8def" },
  ];
}

/** The tool pages (Dan, 2026-07-08: the ☰ menu should be complete) — shown as
 *  a second group in the burger menu. NOT in the physical flap rail, which
 *  stays the course structure (Home / Guide / Unités / Index). */
export function toolTabs(): ShellTab[] {
  return [
    { key: "reviser", label: "Réviser", emoji: "🔁", href: "/reviser", hue: "#7bbf2e" },
    { key: "conjugaison", label: "ConjugaZone", emoji: "🔤", href: "/conjugaison", hue: "#2bb6c2" },
    // Game galleries (Dan, 2026-07-13) — every VocabulaRain / Lexicalator
    // link in one place each. Classement removed: the 🏆 top-bar icon is
    // the door (Dan: "we don't need the flap tab for classement").
    { key: "vocabularain", label: "VocabulaRain", emoji: "🌧️", href: "/games/letris", hue: "#5b8def" },
    { key: "lexicalator", label: "Lexicalator", emoji: "🧰", href: "/games/conveyor", hue: "#e3a700" },
    { key: "tutor", label: "Tuteur", emoji: "🤖", href: "/tutor", hue: "#8a5fd4" },
    { key: "tts", label: "TTS", emoji: "🔊", href: "/tts", hue: "#e8852e" },
    // No Profil entry (Dan, 2026-07-08) — the circled-initial account chip in
    // the top bar IS the profile door (its window links to /profil).
  ];
}
