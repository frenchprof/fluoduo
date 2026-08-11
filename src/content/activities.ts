/**
 * THE activity registry — one row per activity, one place, forever.
 *
 * WHY THIS FILE EXISTS (Dan, 2026-08-10: "the flaps at the side are not
 * organised alphabetically but they should, similarly the 15 icons within
 * HELP"). The ordering was never the bug. The bug was that FOUR surfaces each
 * kept their own private list of the same nineteen activities, and no two of
 * them agreed:
 *
 *   activities/page.tsx  HEAD / HEAD_TITLES / cellsFor   9 activities
 *   siteTabs.ts          toolTabs()                     12 activities
 *   GuideBody.tsx        ACTIVITIES                     15 activities
 *   ActivityFamilies.tsx FAMILIES                       19 activities
 *
 * Not one of the four contained the same set. ConjugaZone wore 🧮 on one screen
 * and 🔤 on another; DéjàRevu wore ♻️ and 🔁; VoixLà wore 🔊 and 🗣️. Two HELP
 * tiles both truncated to "GramMara…" and became the same button. The icon is
 * the memory hook and it changed between screens.
 *
 * Everything derives from `ACTIVITIES` now. Add an activity here or nowhere.
 *
 * FAMILIES AND ORDER are Dan's, 2026-08-10, and the order WITHIN a family is
 * deliberate, not alphabetical:
 *
 *   Goals   the sequence you actually do for one objective
 *   Review  automatic first, then the one you choose
 *   Skills  forms → receptive → productive
 *   SvPlay  gentlest first
 *   User    what you know → where you stand → who you are → settings
 *
 * MERGERS Dan settled on 2026-08-10:
 *   Pre-Test  folds into SpecuLearn   (same job, two engines)
 *   Dictée    IS ÉcouTexte            (never a separate activity)
 *   EtuDice   is the dice difficulty roll, and it lives inside xPlain
 *   ComposeIt covers RolePlayer AND WritInstructor
 *   Match It  KIV — off navigation entirely (only 1 of 50 decks has pairs;
 *             the other 49 links were 404s)
 */

export type FamilyKey = "goals" | "review" | "skills" | "svplay" | "user";

export type Family = { key: FamilyKey; name: string; emoji: string; href: string };

/** The five families, in Dan's order. This IS the navigation. */
export const FAMILIES: Family[] = [
  { key: "goals", name: "FluOlin Goals", emoji: "🎯", href: "/" },
  { key: "review", name: "FluOlin Review", emoji: "🔁", href: "/reviser" },
  { key: "skills", name: "FluOlin Skills", emoji: "🎧", href: "/conjugaison" },
  { key: "svplay", name: "FluOlin SvPlay", emoji: "🎮", href: "/games/vocabularain" },
  { key: "user", name: "FluOlin User", emoji: "👤", href: "/moi" },
];

export type Activity = {
  /** Stable key. Matches CahierShell's `active` prop and deckActivityTabs keys. */
  key: string;
  /** The ONE name. Never spelled a second way anywhere. */
  name: string;
  /** The ONE emoji. */
  emoji: string;
  family: FamilyKey;
  /** Gallery / index href. `null` = reached only through a deck. */
  href: string | null;
  /** Flap hue, kept from siteTabs so nothing shifts colour. */
  hue: string;
  /** Shown in HELP and on hover — NEVER rendered under a flap (Dan,
   *  2026-08-10: "way too many words"). 8 of 12 used to truncate. */
  blurb: string;
};

export const ACTIVITIES: Activity[] = [
  // ── 1 · FluOlin Goals — the sequence for one objective ────────────────────
  { key: "speculearn", name: "SpecuLearn", emoji: "🔮", family: "goals", href: "/practice/speculearn", hue: "#8a5fd4", blurb: "Guess before you're taught. Pre-Tests live here too." },
  { key: "lesson", name: "xPlain", emoji: "📚", family: "goals", href: null, hue: "#e0567f", blurb: "The lesson: rule, then practice." },
  { key: "dice", name: "EtuDice", emoji: "🎲", family: "goals", href: null, hue: "#e3a700", blurb: "Roll the d12 — it sets your starting card on the lesson ramp." },
  { key: "flip", name: "4Mémoire", emoji: "🃏", family: "goals", href: "/practice/flip-it", hue: "#2bb6c2", blurb: "Flashcards. English front, flip to French." },
  { key: "complete", name: "iComplete", emoji: "✏️", family: "goals", href: null, hue: "#7bbf2e", blurb: "Type the missing word." },

  // ── 2 · FluOlin Review — automatic first, then the one you choose ─────────
  { key: "reviser", name: "DéjàRevu", emoji: "🔁", family: "review", href: "/reviser", hue: "#7bbf2e", blurb: "Comes back when you're about to forget it." },
  { key: "grammarathon", name: "GramMarathon", emoji: "🏃", family: "review", href: "/practice/grammarathon", hue: "#3b6fd4", blurb: "Gap-fill sprint across a whole deck." },

  // ── 3 · FluOlin Skills — forms → receptive → productive ───────────────────
  { key: "conjugaison", name: "ConjugaZone", emoji: "🔤", family: "skills", href: "/conjugaison", hue: "#2bb6c2", blurb: "Verb endings until they come without thinking." },
  { key: "ecoutexte", name: "ÉcouTexte", emoji: "🎧", family: "skills", href: "/practice/ecoutexte", hue: "#e0567f", blurb: "Hear a mini-text, fill in the words." },
  { key: "wordrill", name: "WorDrill", emoji: "🎙️", family: "skills", href: "/practice/wordrill", hue: "#7bbf2e", blurb: "Say it out loud — the mic grades you." },
  { key: "tts", name: "VoixLà", emoji: "🔊", family: "skills", href: "/tts", hue: "#e8852e", blurb: "Type French, hear it back, get it checked." },
  { key: "compose", name: "ComposeIt", emoji: "🧩", family: "skills", href: "/games/compose", hue: "#7bbf2e", blurb: "Play a scene; your writing gets corrected." },
  { key: "tutor", name: "ChaTutor", emoji: "🤖", family: "skills", href: "/tutor", hue: "#8a5fd4", blurb: "Ask anything, in French or English." },

  // ── 4 · FluOlin SvPlay — gentlest first ───────────────────────────────────
  { key: "numbus", name: "NumBus", emoji: "🚌", family: "svplay", href: "/games/numbus", hue: "#e0567f", blurb: "Type the number you hear." },
  { key: "numbourse", name: "NumBourse", emoji: "📈", family: "svplay", href: "/games/numbourse", hue: "#0f8a5f", blurb: "Same, shouted, against the clock." },
  { key: "vocabularain", name: "VocabulaRain", emoji: "🌧️", family: "svplay", href: "/games/vocabularain", hue: "#5b8def", blurb: "Words fall — catch them in the right clause." },
  { key: "lexicalator", name: "LexicaLater", emoji: "🧰", family: "svplay", href: "/games/lexicalater", hue: "#e3a700", blurb: "Stitch word parts back together." },

  // ── 5 · FluOlin User ──────────────────────────────────────────────────────
  { key: "moi", name: "My Progress", emoji: "📊", family: "user", href: "/moi", hue: "#5b8def", blurb: "What you know, what you don't." },
  { key: "leaderboard", name: "Leaderboard", emoji: "🏆", family: "user", href: "/leaderboard", hue: "#e3a700", blurb: "Where you sit against the class." },
  { key: "profil", name: "Profile", emoji: "👤", family: "user", href: "/profil", hue: "#8a5fd4", blurb: "Streak, XP, badges, colours." },
];

/** Everything in one family, in its authored order. */
export function activitiesIn(family: FamilyKey): Activity[] {
  return ACTIVITIES.filter((a) => a.family === family);
}

/** Lookup by key. Returns undefined rather than throwing — a missing key is a
 *  registry gap, not a crash. */
export function activity(key: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.key === key);
}

/** Only the ones with a gallery/index page, in family order — this is the
 *  flap rail and the HELP grid, and now they cannot disagree. */
export function navigableActivities(): Activity[] {
  const order: FamilyKey[] = ["goals", "review", "skills", "svplay", "user"];
  return ACTIVITIES.filter((a) => a.href !== null).sort(
    (a, b) => order.indexOf(a.family) - order.indexOf(b.family),
  );
}
