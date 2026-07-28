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

/** The TOP tier of the flap rail: Unités 0–4, nothing else (Dan, 2026-07-15:
 *  "I don't think we need the Flaptab for Home… All the flaptabs that are
 *  not Units 0 to 4 must now be demoted"). Home's doors are the top-left
 *  FluOlinGo link and the 🏠 icon. */
export function siteTabs(): ShellTab[] {
  return [0, 1, 2, 3, 4].map((u) => ({
    key: `unit-${u}`,
    label: UNIT_META[u]?.label ?? `Unité ${u}`,
    emoji: UNIT_META[u]?.emoji ?? "📚",
    href: `/unit/${u}`,
    hue: UNIT_ACCENTS[u],
  }));
}

/** The LOWER tier (Dan, 2026-07-15): everything that isn't a Unité, as one
 *  thin-flap group — Index, WorDrill, SpecuLearn and the tools, in the rail
 *  AND the ☰ menu. */
export function toolTabs(): ShellTab[] {
  return [
    // Canonical app order (Dan, 2026-07-19): SpecuLearn-PreTest · (Lesson +
    // Flip-It live on each deck) · ConjugaZone · VocabulaRain · LexicaLater ·
    // (Composer per deck) · ChaTutor · DéjàRevu. Index leads; WorDrill and
    // VoixLà trail as the non-canonical extras. Hints = Dan's plain-English
    // captions (2026-07-20): nine coined names were a recall burden without
    // them (audit 2026-07-19).
    { key: "index", label: "Index", emoji: "🗂️", href: "/activities", hue: "#5b8def", hint: "every activity, one list" },
    { key: "speculearn", label: "SpecuLearn", emoji: "🔮", href: "/practice/speculearn", hue: "#8a5fd4", hint: "learn by guessing" },
    { key: "conjugaison", label: "ConjugaZone", emoji: "🔤", href: "/conjugaison", hue: "#2bb6c2", hint: "verb ending drill" },
    // Game galleries (Dan, 2026-07-13) — every VocabulaRain / LexicaLater
    // link in one place each. Classement removed: the 🏆 top-bar icon is
    // the door (Dan: "we don't need the flap tab for classement").
    { key: "vocabularain", label: "VocabulaRain", emoji: "🌧️", href: "/games/vocabularain", hue: "#5b8def", hint: "catch falling words" },
    { key: "lexicalator", label: "LexicaLater", emoji: "🧰", href: "/games/lexicalater", hue: "#e3a700", hint: "stitch word parts" },
    { key: "numbus", label: "NumBus", emoji: "🚌", href: "/games/numbus", hue: "#e0567f", hint: "type the number you hear" },
    { key: "tutor", label: "ChaTutor", emoji: "🤖", href: "/tutor", hue: "#8a5fd4", hint: "AI tutor chat" },
    { key: "reviser", label: "DéjàRevu", emoji: "🔁", href: "/reviser", hue: "#7bbf2e", hint: "revise past errors" },
    { key: "wordrill", label: "WorDrill", emoji: "🎙️", href: "/practice/wordrill", hue: "#7bbf2e", hint: "pronunciation drill" },
    { key: "tts", label: "VoixLà", emoji: "🔊", href: "/tts", hue: "#e8852e", hint: "text-to-speech tool" },
    // No Profil entry (Dan, 2026-07-08) — the circled-initial account chip in
    // the top bar IS the profile door (its window links to /profil).
  ];
}
