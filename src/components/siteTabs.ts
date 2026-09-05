/**
 * THE global flap row (Dan, 2026-07-05: "there should be a true blue Home
 * page… the guide should appear as one of the top flaps, after Home… then a
 * Unit 0 page… The Index page should also reveal the same accesses"). Every
 * top-level page renders this same row via CahierShell: Unité 0–4 on top, the
 * activities below.
 *
 * REWRITTEN 2026-08-10. The lower tier used to be a hand-kept list here, and
 * three other surfaces kept their own — four lists of the same activities, no
 * two agreeing, with the same activity wearing different emoji on different
 * screens. It now derives from `src/content/activities.ts`, which is the only
 * place an activity is written down.
 *
 * Two things went away with it:
 *   · `hint` — twelve subtitles under twelve flaps, eight of which truncated
 *     ("type the shouted n…", "every activity, one l…"). Dan, 2026-08-10:
 *     "way too many words". The text survives as `blurb` in the registry, for
 *     HELP and hover, where there is room for it.
 *   · alphabetical order — Dan's five families are ordered by what the learner
 *     is doing, and WITHIN a family by the order you'd actually do them
 *     (Goals: guess → lesson → dice → cards → produce). Alphabetical would put
 *     4Mémoire before SpecuLearn, which is backwards pedagogically.
 */
import type { ShellTab } from "@/components/CahierShell";
import { UNIT_META } from "@/content/sios";
import { FAMILIES, navigableActivities } from "@/content/activities";

/** Unit accent hues — match the fluo-h-* section palette.
 *
 *  These are NOT rolled into the families (2026-09-05). An activity's colour
 *  says which family it belongs to and had no business being hand-picked; a
 *  unit's colour says which unit, which is a different fact and a real one.
 *  What they DID share is the readability fault: an active flap paints its hue
 *  behind `--cahier-ink`, and three of these five sit under 4.5:1 there
 *  (#e0567f 2.86, #8a5fd4 2.30, #e8852e 3.86). So the accent stays the 6px
 *  stripe and the FILL is a 14% wash of it — same colour, same meaning, dark
 *  ink readable on top. */
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
 *  FluOLinGo link and the 🏠 icon. */
export function siteTabs(): ShellTab[] {
  return [0, 1, 2, 3, 4].map((u) => ({
    key: `unit-${u}`,
    label: UNIT_META[u]?.label ?? `Unité ${u}`,
    emoji: UNIT_META[u]?.emoji ?? "📚",
    href: `/unit/${u}`,
    hue: UNIT_ACCENTS[u],
    fill: `color-mix(in oklab, ${UNIT_ACCENTS[u]} 14%, var(--cahier-paper))`,
  }));
}

/**
 * The LOWER tier — every activity with a door of its own, grouped by Dan's
 * five families and ordered inside each one.
 *
 * Index leads because it is the way into all fifty decks and it belongs to no
 * family. Everything after it comes straight from the registry, so adding an
 * activity there puts it in the rail, in HELP and in the ☰ menu at once — and
 * it cannot appear in one of the three and not the others, which is the exact
 * failure this replaces.
 *
 * NOT here: Match It. Dan, 2026-08-10 — KIV. One of fifty decks has pairs, so
 * the gallery was a single tile and the other forty-nine links were 404s.
 */
export function toolTabs(): ShellTab[] {
  return [
    // "Map", not "Carte" (Dan, 2026-09-01) — the interface is English; the key
    // and the /carte redirect route are untouched, display rename only.
    // The map belongs to 🎯 Goals (SITE_FAMILY says so), so it wears that pen
    // rather than the #5b8def it had been carrying since before the families
    // were the highlighters — the same fault as the sixteen activity hexes.
    { key: "map", label: "Map", emoji: "🗺️", href: "/map",
      hue: "var(--fam-goals)", fill: "var(--fam-goals-wash)" },
    ...navigableActivities().map((a) => ({
      key: a.key,
      label: a.name,
      emoji: a.emoji,
      href: a.href as string,
      hue: a.hue,
      fill: a.fill,
    })),
  ];
}

/** The same activities, grouped — for HELP, and for the bottom bar that
 *  replaces the ☰ dropdown on phones. */
export function familyTabs(): { family: string; emoji: string; href: string; tabs: ShellTab[] }[] {
  const all = navigableActivities();
  return FAMILIES.map((f) => ({
    family: f.name,
    emoji: f.emoji,
    href: f.href,
    tabs: all
      .filter((a) => a.family === f.key)
      .map((a) => ({ key: a.key, label: a.name, emoji: a.emoji, href: a.href as string, hue: a.hue, fill: a.fill })),
  }));
}
