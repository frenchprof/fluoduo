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
 *   EtuDice   is the dice difficulty roll, and it lives inside Memo (the
 *             lesson activity — named xPlain until 2026-08-23). The tile
 *             that used to carry the name is Sorting, a different exercise.
 *   ComposeIt covers RolePlayer AND WritInstructor
 *   Match It  KIV — off navigation entirely (only 1 of 50 decks has pairs;
 *             the other 49 links were 404s)
 */

export type FamilyKey = "goals" | "practice" | "review" | "skills" | "svplay" | "user";

export type Family = { key: FamilyKey; name: string; emoji: string; href: string };

/**
 * The six families, in Dan's order (2026-08-19). What changed from the five:
 *
 *   · GOALS is no longer the five pre-lesson activities — it is the fifty
 *     objectives themselves, by unit and then by goal. It is what a learner
 *     opens to ask "what am I supposed to be able to do?", so it leads.
 *   · The five activities that used to sit under Goals (guess → lesson →
 *     dice → cards → produce) are now PRACTICE. Same five, same order, a
 *     name that says what you do with them.
 *
 * Order is Dan's, 19 Aug — 2a → 2b → 2e → 2c → 2d → 2f, with Pre-Lesson and
 * Goals confirmed as the same tab:
 *
 *   Goals · Practice · SvPlay · Review · Skills · User
 *
 * Play sits third, straight after the practice you have just done; the two
 * heavier families (Review, Skills) follow it.
 */
export const FAMILIES: Family[] = [
  { key: "goals", name: "FluOlin Goals", emoji: "🎯", href: "/" },
  { key: "practice", name: "FluOlin Practice", emoji: "✏️", href: "/map" },
  { key: "svplay", name: "FluOlin SvPlay", emoji: "🎮", href: "/games/vocabularain" },
  // 🔖 not 🔁 (2026-08-21): the transport glyphs belong to sound. ÉcouTexte's
  // "🔁 Listen again" has to keep meaning "again", so the Review family — a
  // DESTINATION — cannot wear the same mark. 🔖 = put it aside, come
  // back to it (Dan chose it over 👀, 2026-08-21).
  { key: "review", name: "FluOlin Review", emoji: "🔖", href: "/reviser" },
  { key: "skills", name: "FluOlin Skills", emoji: "💪", href: "/conjugaison" },
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
  /** Gallery / index href. `null` = reached only through a deck. Since
   *  patch 24 the deck-scoped activities point INTO the Index with themselves
   *  its own landing (`/practice/flip-it`) listing every stop that has it;
   *  a stop-level activity with no page of its own has `null` and is reached
   *  from the map. The old Index hubs are
   *  redirects now. */
  href: string | null;
  /** Flap hue, kept from siteTabs so nothing shifts colour. */
  hue: string;
  /** Shown in HELP and on hover — NEVER rendered under a flap (Dan,
   *  2026-08-10: "way too many words"). 8 of 12 used to truncate. */
  blurb: string;
};

export const ACTIVITIES: Activity[] = [
  // ── 1 · FluOlin Goals — the sequence for one objective ────────────────────
  // Dan, 2026-08-29: "use this for SpecuLearn 💡". The crystal ball read as
  // fortune-telling; the bulb reads as a guess worth having. Display only —
  // the key, the route and saved progress all stay "speculearn".
  { key: "speculearn", name: "SpecuLearn", emoji: "💡", family: "practice", href: "/practice/speculearn", hue: "#8a5fd4", blurb: "Guess before you're taught. Pre-Tests live here too." },
  // Dan, 2026-08-23: renamed xPlain → Memo (approved surface #3). Key stays
  // "lesson" — display rename only.
  { key: "lesson", name: "Memo", emoji: "📚", family: "practice", href: null, hue: "#e0567f", blurb: "The lesson: rule, then practice." },
  // Dan, 2026-08-25: renamed EtuDice → Sorting. The tile never opened a die —
  // it opens the group-sorting MCQ, while the real d12 lives in the lesson
  // pager. Key stays "dice": the route, the tabs and saved progress all
  // hang off it. Display rename only.
  { key: "dice", name: "Sorting", emoji: "🗂️", family: "practice", href: null, hue: "#e3a700", blurb: "Which group does each word belong to?" },
  { key: "flip", name: "4Mémoire", emoji: "🃏", family: "practice", href: "/practice/flip-it", hue: "#2bb6c2", blurb: "Flashcards. English front, flip to French." },
  { key: "complete", name: "iComplete", emoji: "✏️", family: "practice", href: null, hue: "#7bbf2e", blurb: "Type the missing word." },

  // ── 2 · FluOlin Review — automatic first, then the one you choose ─────────
  { key: "reviser", name: "DéjàRevu", emoji: "🔖", family: "review", href: "/reviser", hue: "#7bbf2e", blurb: "Comes back when you're about to forget it." },
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

/** Every activity, in FAMILIES order then authored order — what the Menu grid
 *  and any grouped rail should iterate, so none of them can drift apart. */
export function activitiesInFamilyOrder(): Activity[] {
  return FAMILIES.flatMap((f) => ACTIVITIES.filter((a) => a.family === f.key));
}

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
  const order: FamilyKey[] = ["goals", "practice", "svplay", "review", "skills", "user"];
  return ACTIVITIES.filter((a) => a.href !== null).sort(
    (a, b) => order.indexOf(a.family) - order.indexOf(b.family),
  );
}

/** Pages whose own design already assigns colour, so the shell must not. */
const SELF_COLOURED = new Set(["moi", "profil"]);

/** Site keys that are not activities but still belong somewhere. */
const SITE_FAMILY: Record<string, FamilyKey> = {
  home: "goals", activities: "goals", index: "goals", guide: "goals", quickguide: "goals",
  map: "goals", carte: "goals", unit: "goals", sio: "goals", lessons: "goals", decks: "goals",
  pretests: "practice", practice: "practice",
  games: "svplay",
  reviser: "review",
  moi: "user", leaderboard: "user", profil: "user", reglages: "user", teacher: "user",
  conjugaison: "skills", tts: "skills", tutor: "skills", wordrill: "skills",
  ecoutexte: "skills", compose: "skills",
};

/**
 * The family a page belongs to — the input to its colour.
 *
 * Every page already knows its `active` key; this turns that into one of the
 * six families so the shell can paint it without 50 pages each declaring a
 * hue. Unknown keys return null and the page stays uncoloured, which is the
 * right default: a page with no home should not borrow one.
 */
/** What an activity DEMANDS of the learner — the thing its own page should be
 *  coloured by. The family says where it lives in the menu; this says what it
 *  makes you do. Five branches, in the order of the evidence ladder already in
 *  lib/evidence.ts (recognition -> constrained -> free / productive).
 *
 *  Dan, 2026-08-26, on Produce's two halves: "keeping them apart is correct,
 *  but they are at different sub-branches of the same branch." So WorDrill
 *  shares `prod` with iComplete and GramMarathon — same demand on memory, and
 *  the channel (spoken, the only microphone in the app) is a sub-branch, not
 *  a colour of its own.
 *
 *  Sorting sits in `recog`, not `prod`: evidence.ts's own definition of
 *  "recognition" names sorting into a column, while its lookup table tags the
 *  drill "constrained". The file contradicts itself; the definition wins here.
 *  Flagged for Dan — correcting the lookup changes what past answers mean. */
export type BandKey = "guess" | "lesson" | "recog" | "prod" | "create";

const BAND: Record<string, BandKey> = {
  pretest: "guess",
  speculearn: "guess",
  lesson: "lesson",       // Memo
  dice: "recog",          // Sorting
  flip: "recog",          // 4Mémoire
  matching: "recog",
  vocabularain: "recog",
  lexicalator: "recog",
  complete: "prod",       // iComplete
  grammarathon: "prod",
  conjugaison: "prod",
  say: "prod",            // WorDrill — spoken half of the same branch
  wordrill: "prod",
  ecoutexte: "recog",     // listening comprehension: the answer is in the audio
  compose: "create",
  tutor: "create",
};

/** The band an activity belongs to, or null where the page owns its colours
 *  already (the same exemption familyOf makes for /moi and /profil). */
export function bandOf(activeKey: string | undefined): BandKey | null {
  if (!activeKey) return null;
  if (SELF_COLOURED.has(activeKey)) return null;
  return BAND[activeKey] ?? null;
}

export function familyOf(activeKey: string | undefined): FamilyKey | null {
  if (!activeKey) return null;
  // Pages that already own a complete colour scheme are left alone (Dan,
  // 2026-08-21: "can we maintain the current look of the profile page").
  // /moi and /profil are the one learner model, and its five rows already
  // carry a hue each — a family band over the top would be a second, louder
  // system arguing with the first. Returning null means the shell adds no
  // class at all, so those pages render exactly as they did.
  if (SELF_COLOURED.has(activeKey)) return null;
  const a = activity(activeKey);
  if (a) return a.family;
  if (SITE_FAMILY[activeKey]) return SITE_FAMILY[activeKey];
  // deck/unit sub-pages arrive as "unit-3", "deck-aliments", …
  const stem = activeKey.split("-")[0];
  return SITE_FAMILY[stem] ?? null;
}
