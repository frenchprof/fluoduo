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
 *   Goals · Practice · Games · Revise · Skills · User
 *
 * Play sits third, straight after the practice you have just done; the two
 * heavier families (Review, Skills) follow it.
 */
export const FAMILIES: Family[] = [
  { key: "goals", name: "FluOLin Goals", emoji: "🎯", href: "/" },
  // 🏋️ (Dan, 2026-08-31) — the same mark the lesson's Pract. tab wears
  // since #108, so "practice" is one glyph everywhere.
  // /practice since 1 Sep, not /map. The 🏋️ slot pointed at the learning
  // path because Practice had no page of its own — the same fault 🎮 and
  // 💪 had, fixed on 30 Aug by giving them a hub. The map is Goals', and
  // Home still opens it (verify25b).
  { key: "practice", name: "FluOLin Practice", emoji: "🏋️", href: "/practice" },
  // /games, not /games/vocabularain (Dan, 2026-08-30, on the bottom bar:
  // "can we first establish if those are really the five that we need
  // anchored below? the most likely shortcuts needed by learners should go
  // there"). The five slots were right; two of the doors were not. A learner
  // tapping 🎮 got whichever game happened to be first in the registry, and
  // the other three had no shortcut at all.
  // "Games", not "SvPlay" and not "Play" (Dan, 2026-08-31): Home's hero key
  // is now CONTINUE (your current stop), so the family door says what is
  // behind it and no two doors share a name. Key stays "svplay" — the
  // Memo-rename precedent: display renames never touch keys or routes.
  { key: "svplay", name: "FluOLin Games", emoji: "🎮", href: "/games" },
  // "Revise" with 🔄 (Dan, 2026-08-31), superseding his 21 Aug 🔖 pick.
  // The 21 Aug rule itself stands: 🔁 — ÉcouTexte's "Listen again" mark —
  // stays banned as a destination glyph (verify25 pins it off Home); 🔄 is
  // a different character and was Dan's explicit choice.
  { key: "review", name: "FluOLin Revise", emoji: "🔄", href: "/reviser" },
  // Same fault, same fix: the emoji used to open ConjugaZone, one of six.
  // 💬 (Dan, 2026-08-31) — the skills are speaking skills; 💪 moved on.
  { key: "skills", name: "FluOLin Skills", emoji: "💬", href: "/skills" },
  { key: "user", name: "FluOLin User", emoji: "👤", href: "/profil" },
];

export type Activity = {
  /** Stable key. Matches CahierShell's `active` prop and deckActivityTabs keys. */
  key: string;
  /** The ONE name. Never spelled a second way anywhere. */
  name: string;
  /** A shorter form for tight boxes ONLY — today, the two-column button grid
   *  in the SIO popup, where a cell is ~168px on a phone (Dan, 2026-08-31:
   *  "GramMarathon can be shortened on the button to GramMarath").
   *
   *  This is NOT a second name, and the `name` rule above still holds: every
   *  surface with room spells the activity out. Set it only where the full
   *  name genuinely does not fit, and keep it recognisable as a truncation of
   *  the same word — a different word here would be exactly the second
   *  spelling that rule forbids. */
  short?: string;
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
  { key: "lesson", name: "MneMemo", emoji: "📚", family: "practice", href: null, hue: "#e0567f", blurb: "The lesson: rule, then practice." },
  // SORTING IS CUT (Dan, 2026-08-31: "sorting is cut").
  //
  // Off navigation, the way Match It went on 10 Aug — the registry row is gone
  // so no tile or tab offers it, and the route stays so banked answers keep a
  // label and the decision is reversible. `dice` therefore keeps its BAND row
  // below, its activityLedger prefixes and its evidence tags: they describe
  // answers already given, not a surface still offered.
  //
  // Why it went. ACTIVITY_CULL.md: Sorting and VocabulaRain drill the same
  // thing — which of the deck's four Letris columns a word belongs to — one as
  // a static MCQ and one as falling tiles. The game version is the one that
  // earns the drill. It was also the tile Dan named when he said the framework
  // had drifted "into things like EtuDice and Sorting", and the confusion its
  // name caused reached all the way into the evidence table (see evidence.ts).
  { key: "flip", name: "MémoiRecall", emoji: "🃏", family: "practice", href: "/practice/flip-it", hue: "#2bb6c2", blurb: "Flashcards. English front, flip to French." },
  // iCOMPLETE IS RETIRED (Dan, 2026-08-31: "we don't need a separate
  // CompleteIt exercise anymore. it will be part of Memo's activities …
  // we can retire CompleteIt and Sorting").
  //
  // Same pattern as Sorting above: the registry row is gone so no tile, flap
  // or chip offers it; the route stays so banked answers keep a label and the
  // decision is reversible. Its BAND row, ledger prefixes and evidence tags
  // below all stay — they describe answers already given.
  //
  // Why it went: the Memo's difficulty ladder IS iComplete now. Moyen is
  // "complete the sentence, one piece missing", Difficile is two pieces —
  // Dan's own classification of CompleteIt — so the standalone drill was the
  // same exercise offered twice under a second name.

  // ── 2 · FluOlin Review — automatic first, then the one you choose ─────────
  { key: "reviser", name: "DéjàRevu", emoji: "🔖", family: "review", href: "/reviser", hue: "#7bbf2e", blurb: "Comes back when you're about to forget it." },
  { key: "grammarathon", name: "GramMarathon", short: "GramMarath", emoji: "🏃", family: "review", href: "/practice/grammarathon", hue: "#3b6fd4", blurb: "Gap-fill sprint across a whole deck." },

  // ── 3 · FluOlin Skills — forms → receptive → productive ───────────────────
  { key: "conjugaison", name: "ConjugaZone", emoji: "🔤", family: "skills", href: "/conjugaison", hue: "#2bb6c2", blurb: "Verb endings until they come without thinking." },
  { key: "ecoutexte", name: "ÉcouTexte", emoji: "🎧", family: "skills", href: "/practice/ecoutexte", hue: "#e0567f", blurb: "Hear a mini-text, fill in the words." },
  { key: "wordrill", name: "WorDrill", emoji: "🎙️", family: "skills", href: "/practice/wordrill", hue: "#7bbf2e", blurb: "Say it out loud — the mic grades you." },
  { key: "tts", name: "VoixLà", emoji: "🔊", family: "skills", href: "/tts", hue: "#e8852e", blurb: "Type French, hear it back, get it checked." },
  { key: "compose", name: "ComposeIt", emoji: "🧩", family: "skills", href: "/games/compose", hue: "#7bbf2e", blurb: "Play a scene; your writing gets corrected." },
  { key: "tutor", name: "ChaTutor", emoji: "🤖", family: "skills", href: "/tutor", hue: "#8a5fd4", blurb: "Ask anything, in French or English." },

  // ── 4 · FluOlin SvPlay — gentlest first ───────────────────────────────────
  // NumBus + NumBourse share ONE hub tile (Dan, 2026-08-31: "park NumBus /
  // NumBourse under a hub-tab Numbers"). Both game routes survive untouched;
  // the hub at /games/numbers is the one door. Their activityLedger prefixes
  // and evidence tags below stay — they describe answers already given.
  { key: "numbers", name: "Numbers", emoji: "🔢", family: "svplay", href: "/games/numbers", hue: "#e0567f", blurb: "Numbers by ear — NumBus and NumBourse." },
  { key: "vocabularain", name: "VocabulaRain", emoji: "🌧️", family: "svplay", href: "/games/vocabularain", hue: "#5b8def", blurb: "Words fall — catch them in the right clause." },
  { key: "lexicalator", name: "LexicaLater", emoji: "🧰", family: "svplay", href: "/games/lexicalater", hue: "#e3a700", blurb: "Stitch word parts back together." },

  // ── 5 · FluOlin User ──────────────────────────────────────────────────────
  // MY PROGRESS IS SWALLOWED BY PROFILE (Dan, 2026-08-31). /profil and /moi
  // have rendered the SAME ProfileContent since the 22 Aug merge, so the two
  // tiles were two doors to one page. The /moi route stays for bookmarks and
  // the account chip; Profile is the one tile.
  { key: "leaderboard", name: "Leaderboard", emoji: "🏆", family: "user", href: "/leaderboard", hue: "#e3a700", blurb: "Where you sit against the class." },
  { key: "profil", name: "Profile", emoji: "👤", family: "user", href: "/profil", hue: "#8a5fd4", blurb: "Your learning, streak, XP, badges." },
];

/** Every activity, in FAMILIES order then authored order — what the Menu grid
 *  and any grouped rail should iterate, so none of them can drift apart. */
export function activitiesInFamilyOrder(): Activity[] {
  return FAMILIES.flatMap((f) => ACTIVITIES.filter((a) => a.family === f.key));
}

/**
 * The families that have a hub PAGE of their own, by the `active` key that
 * page passes to the shell. Goals is Home, Practice is the map, Review is the
 * Reviser and User is /moi — four families whose hub already existed under
 * another name. These two did not, so a family shortcut had to point at one
 * arbitrary member (`/games/vocabularain`, `/conjugaison`) until 2026-08-30.
 */
const FAMILY_HUBS: Record<string, FamilyKey> = {
  games: "svplay",
  skills: "skills",
  // Practice joined them on 1 Sep. Its door was /map — the learning path,
  // which belongs to Goals — so 🏋️ opened someone else's page and the two
  // activities that DO have doors of their own (SpecuLearn, 4Mémoire) had no
  // shortcut at all. Memo has no href and is reached from a stop, so the hub
  // lists two: exactly Dan's rule for it, "except when one item is not
  // active, then it does not appear".
  practice: "practice",
};

/**
 * The families whose door is deliberately ONE activity's page, and which one.
 *
 * Writing this down is the point. Without it, "the family opens whatever
 * happens to be first in its list" and "the family opens the thing a learner
 * actually wants" look identical in the code — which is how 🎮 came to open
 * VocabulaRain. verify52 fails on any family door that is an activity's own
 * page and is not named here.
 *
 *   review  the DUE QUEUE is the need. Tapping 🔖 to reach a two-tile menu,
 *           when the slot is already wearing a badge counting what is due,
 *           would put a choice in front of the one action the badge is
 *           advertising. GramMarathon stays in the rail and the Menu.
 *   user    Profile IS the learner model — /profil and /moi render the same
 *           page, and My Progress's tile folded into Profile on 31 Aug
 *           ("MyProgress should be swallowed by Profile"). The account chip
 *           still opens /moi; User is not in the bottom bar at all.
 */
export const DELIBERATE_DOOR: Record<string, string> = { review: "reviser", user: "profil" };

/** The family a hub page is the hub OF, or undefined for any other page. */
export function hubFamily(activeKey: string | undefined): Family | undefined {
  if (!activeKey) return undefined;
  const key = FAMILY_HUBS[activeKey];
  return key ? FAMILIES.find((f) => f.key === key) : undefined;
}

/** "FluOLin Games" → "Games". The bar, the rail and the hub headings all
 *  want the short form; three copies of this regex is how they drift apart. */
export function familyShort(f: Family): string {
  return f.name.replace(/^FluOLin /, "");
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
// EMPTIED 1 Sep, on Dan's word ("i say touch Profil please"). It held
// /moi and /profil since 21 Aug, when he asked to "maintain the current look
// of the profile page" — the reasoning was that its rows each carry a hue and
// a family band over the top would be a second, louder system arguing with the
// first. That reasoning was not wrong; it was about a band ARRIVING on a page
// that had its own. What it left behind was a page with no spine and a heading
// card inset in a rounded box while every other page's ran edge to edge — the
// exact two faults Dan named in the 1 Sep audit. The rows keep their hues; the
// heading becomes the same band as everywhere else.
const SELF_COLOURED = new Set<string>([]);

/** Site keys that are not activities but still belong somewhere. */
const SITE_FAMILY: Record<string, FamilyKey> = {
  home: "goals", activities: "goals", index: "goals", guide: "goals", quickguide: "goals",
  map: "goals", carte: "goals", unit: "goals", sio: "goals", lessons: "goals", decks: "goals",
  pretests: "practice", practice: "practice",
  // The SUB-PAGES, added 1 Sep after Dan's chrome audit: "there are pages
  // missing this colored vertical strip on the left". Each of these was
  // passing an `active` key with no entry here, and a null family costs a
  // page THREE things at once, which is why the fault looked like three
  // faults: no `fam-` class means no spine (the rule is
  // `[class*="fam-"]`), no family ink, and — because CahierShell renders the
  // heading band only `{famKey && …}` — no band either, so the page fell
  // back to a bare <h1> at whatever height its content happened to start.
  // Measured before the fix: five different heading heights across the site.
  pretest: "practice", mcq: "practice", study: "practice", new: "goals",
  // `deck` is the USER-deck page (a curated deck renders CuratedDeckTable,
  // whose `active` is its view key and already resolves) and `dice` is Diced
  // Practice. Both were passing keys with no entry, so both drew no spine.
  deck: "goals", dice: "practice",
  games: "svplay", svplay: "svplay",
  reviser: "review",
  moi: "user", leaderboard: "user", profil: "user", reglages: "user", teacher: "user",
  skills: "skills",
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
 *  "recognition" names sorting into a column. Its lookup table used to tag the
 *  drill "constrained", so this band and the stored record disagreed from
 *  26 Aug. Settled 2026-08-31 in the definition's favour — evidence.ts now
 *  tags `dice:` "recognition" too, forward only. `verify62-band-evidence.py`
 *  asserts the two files agree, in both directions. */
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

/**
 * Pages you READ rather than answer — the ones that take the sand paper.
 *
 * Dan chose it blind (2026-08-30): shown the six family grounds and the sand
 * with no labels and asked which he wanted under a page of French he was
 * reading, he picked the sand. The test was built so that answer would settle
 * the question either way.
 *
 * The Memo IS the lesson (key "lesson"); the guide and the quick guide are the
 * other two surfaces that hold a page of prose. A drill is not here, however
 * long it runs: you are answering it, not reading it.
 */
const READING = new Set(["lesson", "guide", "quickguide"]);

export function isReadingSurface(activeKey: string | undefined): boolean {
  return !!activeKey && READING.has(activeKey);
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
