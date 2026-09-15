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
 *   Revise  automatic first, then the one you choose
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

export type FamilyKey = "goals" | "practice" | "review" | "svplay" | "oral" | "tools" | "user";

export type Family = { key: FamilyKey; name: string; emoji: string; href: string };

/**
 * SEVEN FAMILIES, NOT SIX (Dan, 2026-09-09, redrawing the ☰ grid menu).
 * Skills is RETIRED — its five activities split across two new families,
 * Oral (the spoken ones: VoixLà, WorDrill, ÉcouTexte) and Tools (the
 * summonable helpers: ChaTutor, ComposeIt). Goals is renamed Lesson on
 * every learner-visible surface (Map + the goal itself + Help now live
 * together there) but KEEPS its key, `goals` — the Memo-rename precedent:
 * a display rename never touches the key or the route.
 *
 * Dan's row order for the ☰ grid:
 *
 *   🧑‍🏫 Lesson · 📝 Practice · 🔄 Revise · 🎮 Games · 💬 Oral · 🛠️ Tools · 👤 User
 *
 * "Revise" is UNCHANGED from the 31 Aug ruling — a "Review" rename was
 * tried mid-conversation, paired with DéjàRevu becoming ErroReview, and
 * Dan's own later, clearer table spelled it Revise again, so that is what
 * stands. DéjàRevu → ErroReview happened regardless (see below).
 *
 * COLOUR: three families keep an old colour under a new name — Practice
 * takes Revise's old blue, Games takes Skills' old violet, Tools takes
 * User's old orange — and three are new: Revise is teal, Oral is a
 * Periwinkle standing in for "Indigo" (not one of Dan's 12 swatches), User
 * is grey (not in the 12 either — his call, keep it). Lesson (ex-Goals)
 * keeps its green — until HE changed that too: "the first row should be
 * yellow instead of green." See globals.css for the 28 pinned values and
 * verify96 for the contrast floor.
 */

// ═══ THE ROWS ARE RENAMED, 2026-09-13 ═══════════════════════════════════════
// Dan: *"We need to relabel: PRACTICE in the grid menu should be LEARN ·
// REVISE becomes PRACTICE · GAMES becomes PLAY · ORAL becomes SPEAK"*, then
// *"WRITE and TRACK"* for the last two, then *"and the topmost will be START"*.
//
// SEVEN VERBS, IN THE ORDER A LEARNER DOES THEM:
//
//     START · LEARN · DRILL · AMUSE · SPEAK · WRITE · TRACK
//
// ALL FIVE LETTERS, WHICH IS THE POINT (Dan, 2026-09-13: *"all five letter
// words"*). The sideways label down each row is set in one column of type, so
// equal-length words make a straight edge instead of a ragged one — the labels
// stop being seven different shapes and become one repeated shape. "Practice"
// (8) became DRILL and "Play" (4) became AMUSE to reach it. I-PLAY was tried
// first and dropped the same hour: it needed a hyphen to reach five, and a
// label that has to be punctuated into shape is a label fighting the rule.
// AMUSE is five on its own.
//
// which is why this is a better set than the one it replaces and not merely a
// different one: every row now names an ACTION rather than a category, and read
// down the menu they spell the course's own sequence. "Lesson", "Games",
// "Oral", "Tools" and "User" named what a thing WAS; these name what you do.
//
//     key         was         is now
//     practice    Practice    Learn
//     review      Revise      Drill
//     svplay      Games       Amuse
//     oral        Oral        Speak
//     tools       Tools       Write
//     user        User        Track
//     goals       Lesson      Start
//
// KEYS AND ROUTES DO NOT MOVE — the Memo-rename precedent, and the reason the
// shuffle is safe: `review` still opens /reviser, `svplay` still opens the
// games, and every check keyed on a KEY is untouched. Only `name` changes, and
// `familyShort()` strips "FluOLin " so the ☰ menu, the bottom bar and every
// page band all follow from this one line each.
//
// THIS SUPERSEDES the 9 Sep seven-family naming wherever the two disagree. That
// ruling's SHAPE still holds — one fixed name and one fixed icon per family,
// living once here — and only the words changed. Note the trap in the middle of
// this table: "Practice" now means a DIFFERENT family from the one it meant
// yesterday, so a session reading an older entry will mis-resolve it. Go by the
// key, never by the word.
export const FAMILIES: Family[] = [
  // 🧑‍🏫, not 🎯 (Dan, 2026-09-09) — the family now holds Map, the goal
  // itself and Help together, so it wears a teacher rather than a target.
  // Home is still Lesson's door until the SIO-per-page work (a separate,
  // larger piece Dan has someone else building) lands. It used to say "/",
  // which stopped meaning Home on 9 Sep when the welcome page took the root —
  // so the Lesson tile walked a learner out of the app to the front door.
  //
  // A LITERAL, NOT `HOME_HREF`, and that is deliberate. This file is a content
  // REGISTRY that tooling reads as text, not only as code: verify52 parses
  // FAMILIES and ACTIVITIES with a regex that wants `href: "…"`, and verify82
  // imports it from a bare node script where the `@/` alias does not resolve.
  // Both went red on the constant. Components import HOME_HREF; the registry
  // spells the address out.
  { key: "goals", name: "FluOLin Start", emoji: "🧑‍🏫", href: "/home" },
  // 📝 (Dan, 2026-09-09), retiring 🏋️. href points straight at SpecuLearn
  // now — Practice's hub page retired the same day (DELIBERATE_DOOR below);
  // /practice itself still exists as a redirect for old links/bookmarks.
  { key: "practice", name: "FluOLin Learn", emoji: "📝", href: "/practice/speculearn" },
  // Name unchanged from 31 Aug ("Revise") — a "Review" rename was tried
  // and reverted the same day (9 Sep) DéjàRevu became ErroReview. 🔄 unchanged.
  { key: "review", name: "FluOLin Drill", emoji: "🔄", href: "/reviser" },
  // Games — unchanged name and emoji; colour moved (was pink, now Skills'
  // old violet). href points straight at VocabulaRain now — Games' hub
  // retired 2026-09-09 ("retire /games"), the last of the three (Dan
  // hedged on it first as "nearly all" the hubs, then confirmed it too).
  // /games itself still exists as a redirect for old links/bookmarks.
  { key: "svplay", name: "FluOLin Amuse", emoji: "🎮", href: "/games/vocabularain" },
  // ORAL (NEW, 2026-09-09) — half of retired Skills: VoixLà, WorDrill,
  // ÉcouTexte, the three activities that put French in your mouth or ear.
  // href is a DELIBERATE DOOR to VoixLà (see DELIBERATE_DOOR below) — Oral
  // has no hub page of its own, on purpose: the old /skills hub is exactly
  // the kind of page this grid menu retires.
  { key: "oral", name: "FluOLin Speak", emoji: "💬", href: "/tts" },
  // TOOLS (NEW, 2026-09-09) — the other half of retired Skills: ChaTutor and
  // ComposeIt, the two summonable helpers (see ToolSummon.tsx's own 🛠️).
  // Deliberate door to ChaTutor, same reasoning as Oral.
  //
  // « TEXTS », NOT « WRITE » (Dan, 2026-09-15, asked where a reading activity
  // belongs among the seven: *"call Write Texts"*). The family was named for
  // what its two members made a learner DO — write a scene, write to a tutor —
  // and that name had no room for reading. Named for the OBJECT instead, it
  // does: compose a text, chat in text, read a text. The KEY stays `tools` and
  // every route stays put — the Memo-rename precedent, display names never
  // move keys.
  { key: "tools", name: "FluOLin Texts", emoji: "🛠️", href: "/tutor" },
  // User — unchanged route; grey now, was orange (Tools took the orange).
  { key: "user", name: "FluOLin Track", emoji: "👤", href: "/profil" },
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
  /** The 6px stripe on a flap — the family's pen. Derived, never authored:
   *  see FAMILY_PEN below for the measurement that ended the hand-picked set. */
  hue: string;
  /** What an ACTIVE flap is filled with, under dark ink — the family's wash. */
  fill: string;
  /** Shown in HELP and on hover — NEVER rendered under a flap (Dan,
   *  2026-08-10: "way too many words"). 8 of 12 used to truncate. */
  blurb: string;
};

const RAW_ACTIVITIES: Omit<Activity, "hue" | "fill">[] = [
  // ── 1 · FluOlin Goals — the sequence for one objective ────────────────────
  // Dan, 2026-08-29: "use this for SpecuLearn 💡". The crystal ball read as
  // fortune-telling; the bulb reads as a guess worth having. Display only —
  // the key, the route and saved progress all stay "speculearn".
  { key: "speculearn", name: "SpecuLearn", emoji: "💡", family: "practice", href: "/practice/speculearn", blurb: "Guess before you're taught. Pre-Tests live here too." },
  // Dan, 2026-08-23: renamed xPlain → Memo (approved surface #3). Key stays
  // "lesson" — display rename only.
  { key: "lesson", name: "MneMemo", emoji: "📚", family: "practice", href: null, blurb: "The lesson: rule, then practice." },
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
  { key: "flip", name: "MémoiRecall", emoji: "🃏", family: "practice", href: "/practice/flip-it", blurb: "Flashcards. English front, flip to French." },
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

  // ── 2 · FluOlin Revise — automatic first, then the one you choose ─────────
  // DÉJÀREVU IS RENAMED ERROREVIEW (Dan, 2026-09-09, the same day the family
  // itself briefly became "Review" and then reverted to "Revise" — this
  // rename stuck regardless): same activity, same key, same route — the
  // spaced-review queue is untouched, only its name and glyph change.
  // ❌, not 🔖 — 🔖 is retired with the name.
  { key: "reviser", name: "ErroReview", emoji: "❌", family: "review", href: "/reviser", blurb: "Comes back when you're about to forget it." },
  // GramMarathon: one of the seven whose hub gallery is replaced by the
  // SIO-slider pop-up (ActivityGoalPicker.tsx) — see MenuGrid.tsx.
  { key: "grammarathon", name: "GramMarathon", short: "GramMarath", emoji: "🏃", family: "review", href: "/practice/grammarathon", blurb: "Gap-fill sprint across a whole deck." },

  /* CONJUGAZONE SITS IN BLUE — the Revise family (Dan, 2026-09-07, his
     LAST word on a placement that moved twice in one day: "in case you
     haven't noticed ConjugaZone is now part of the Practice series" in the
     pre-tests session, then, at the QC merge, "ConjugaZone will henceforth
     sit in Blue"). Blue is also where his 3x5 menu screenshot drew it, so
     the grid and the registry agree. The move changes its hue, its spine,
     the family its band names, and which hub a rightward swipe returns it
     to; the band (prod, rust) is untouched — band says what is asked,
     family says where it lives. (Blue itself moved on 9 Sep to Practice —
     ConjugaZone stays in the REVISE family, which is teal now.) */
  { key: "conjugaison", name: "ConjugaZone", emoji: "🔤", family: "review", href: "/conjugaison", blurb: "Verb endings until they come without thinking." },

  // ── 3a · FluOlin Oral — the three that put French in your mouth or ear ────
  // Half of Skills, retired 2026-09-09 — see FAMILIES above. WorDrill and
  // ÉcouTexte are two more of the seven slider-gated activities.
  { key: "ecoutexte", name: "ÉcouTexte", emoji: "🎧", family: "oral", href: "/practice/ecoutexte", blurb: "Hear a mini-text, fill in the words." },
  { key: "wordrill", name: "WorDrill", emoji: "🎙️", family: "oral", href: "/practice/wordrill", blurb: "Say it out loud — the mic grades you." },
  { key: "tts", name: "VoixLà", emoji: "🔊", family: "oral", href: "/tts", blurb: "Type French, hear it back, get it checked." },

  // ── 3b · FluOlin Tools — the two summonable helpers ────────────────────────
  // The other half of retired Skills. ComposeIt is one of the seven
  // slider-gated activities; ChaTutor keeps its plain door (it is a chat,
  // not a deck — there is nothing for a stop number to pick between).
  { key: "compose", name: "ComposeIt", emoji: "🧩", family: "tools", href: "/games/compose", blurb: "Play a scene; your writing gets corrected." },
  { key: "tutor", name: "ChaTutor", emoji: "🤖", family: "tools", href: "/tutor", blurb: "Ask anything, in French or English." },
  // G-COMPRIS! (2026-09-15) — reading comprehension, and the reason the family
  // stopped being called « Write » the same day. Dan named it himself: *"Call
  // the reading exercises : G-Compris!"* — « j'ai compris », said out loud.
  // 📖 is free: nothing in the app wore it (📚 is MneMemo, 📝 is the Practice
  // family, 📋 is PathNext's fallback), so no glyph means two things.
  { key: "gcompris", name: "G-Compris!", emoji: "📖", family: "tools", href: "/gcompris", blurb: "Read a note, a postcard, a voicemail — then answer." },

  // ── 4 · FluOlin SvPlay — gentlest first ───────────────────────────────────
  // NumBus + NumBourse share ONE hub tile (Dan, 2026-08-31: "park NumBus /
  // NumBourse under a hub-tab Numbers"). Both game routes survive untouched;
  // the hub at /games/numbers is the one door. Their activityLedger prefixes
  // and evidence tags below stay — they describe answers already given.
  { key: "numbers", name: "Numbers", emoji: "🔢", family: "svplay", href: "/games/numbers", blurb: "Numbers by ear — NumBus and NumBourse." },
  { key: "vocabularain", name: "VocabulaRain", emoji: "🌧️", family: "svplay", href: "/games/vocabularain", blurb: "Words fall — catch them in the right clause." },
  // LEXICALATER IS RETIRED FOR GOOD (Dan, 2026-09-09): "LexicaLocker" now,
  // and 🔐 instead of 🧰 — 🧰 was ALSO the floating "Outils" tools button
  // (ToolSummon.tsx) that opens VoixLà/ChaTutor on most exercise screens,
  // including ones that have nothing to do with this game. KEY and ROUTE
  // stay `lexicalator` / `/games/lexicalater` — the Memo-rename precedent:
  // a display rename never touches keys or routes.
  { key: "lexicalator", name: "LexicaLocker", emoji: "🔐", family: "svplay", href: "/games/lexicalater", blurb: "Stitch word parts back together." },

  // ── 5 · FluOlin User ──────────────────────────────────────────────────────
  // MY PROGRESS IS SWALLOWED BY PROFILE (Dan, 2026-08-31). /profil and /moi
  // have rendered the SAME ProfileContent since the 22 Aug merge, so the two
  // tiles were two doors to one page. The /moi route stays for bookmarks and
  // the account chip; Profile is the one tile.
  { key: "leaderboard", name: "Leaderboard", emoji: "🏆", family: "user", href: "/leaderboard", blurb: "Where you sit against the class." },
  { key: "profil", name: "Profile", emoji: "👤", family: "user", href: "/profil", blurb: "Your learning, streak, XP, badges." },
  // SETTINGS JOINS THE USER ROW (Dan, 2026-09-09) — Réglages had a page
  // (/reglages) but no menu tile; the grid menu's third User slot is it.
  { key: "reglages", name: "Settings", emoji: "⚙️", family: "user", href: "/reglages", blurb: "Bottom bar, sound, and the rest of your preferences." },
];

/**
 * AN ACTIVITY'S COLOUR IS ITS FAMILY'S (Dan, 2026-09-05: *"we need to revisit
 * the colors of the burger menu items based on the new color scheme"*).
 *
 * Every row above used to carry a hand-picked hex, and the field's own comment
 * said what they were: *"Flap hue, kept from siteTabs so nothing shifts
 * colour."* Carried over, never designed — sixteen values belonging to no
 * scheme, from before the six families became the six highlighter pens.
 *
 * MEASURED, and this is why it is not merely tidier. An ACTIVE flap paints
 * `--tab-hue` behind `--cahier-ink`. On the old values that is
 *
 *     SpecuLearn 2.30:1 · MneMemo 2.86 · GramMarathon 2.17 · Map 3.20
 *     VoixLà 3.86 · MémoiRecall 4.23 · DéjàRevu 4.60 · LexicaLater 4.83
 *
 * — six of eight below 4.5:1, on the label of the page you are standing on.
 *
 * TWO TOKENS, NOT ONE, because the flap asks the colour to do two jobs. The
 * 6px left stripe wants saturation, so it takes the pen itself; the active
 * flap's FILL sits under dark ink, so it takes the family's wash, which clears
 * 8.1-8.5:1 for all six. Using the pen for both was the fault above — the pens
 * measure 3.44 to 7.74 under ink, so four of the six would have failed again.
 */
/**
 * THE TABS THAT ARE NOT ACTIVITIES, so that they too are drawn once.
 *
 * Dan, 2026-09-05: *"we should use the same pictures for menu and buttons"* —
 * *"or emojis"*.
 *
 * For the sixteen registered activities that was already true: ACTIVITIES is
 * the one place their emoji lives, which is what the registry was built for. It
 * was NOT true of the handful of tabs built by hand beside them, and they are
 * exactly the ones a learner meets in both places:
 *
 *     pretest   authored FIVE times — and already drifting on the label,
 *               "Pre-Test" in the stop sheet and the goal card, "Pretest" on
 *               the pre-test page itself
 *     map       authored twice
 *     matching  authored once, with no shared home to drift from yet
 *
 * The emoji happened to agree today. Nothing was holding them there — the label
 * did not, and it is the same fact about the same thing.
 */
export const TAB_ICONS: Record<string, { label: string; emoji: string }> = {
  // "SpecuLearn", not "Pre-Test" — FINISHING a rename main had begun (#188 era)
  // rather than starting one. Main had renamed the tab on the two pre-test
  // PAGES and left every door to them saying "Pre-Test", so the label a learner
  // tapped and the label they landed on disagreed. That is the exact split this
  // map exists to make impossible, and Dan settled the wording himself
  // (2026-09-05: *"no no no, i want the name SpecuLearn"*).
  //
  // ONE PICTURE PER THING (settled 6 Sep, closing the flag below): the name
  // and the emoji both DERIVE from the speculearn registry entry — Dan chose
  // 💡 for SpecuLearn on 2026-08-29 ("use this for SpecuLearn 💡"), and the
  // 🧪 that lived here made one name wear two pictures, in the ☰ menu and
  // the Practice hub. Derived, so a future rename or re-icon moves BOTH.
  pretest: {
    label: RAW_ACTIVITIES.find((a) => a.key === "speculearn")!.name,
    emoji: RAW_ACTIVITIES.find((a) => a.key === "speculearn")!.emoji,
  },
  matching: { label: "Match It", emoji: "🔗" },
  // "Map", not "Carte" (Dan, 2026-09-01) — the interface is English; the key
  // and the /carte redirect route are untouched, display rename only.
  map: { label: "Map", emoji: "🗺️" },
  home: { label: "Home", emoji: "🏠" },
};

/** The one picture for a key, whether it is an activity or one of the tabs
 *  above. Returns undefined for a key nobody has drawn, so a caller can still
 *  pass its own — this narrows the places an emoji may be authored, it does not
 *  forbid a genuinely one-off tab. */
export function iconFor(key: string): { label: string; emoji: string } | undefined {
  const a = activity(key);
  if (a) return { label: a.name, emoji: a.emoji };
  return TAB_ICONS[key];
}

const FAMILY_PEN: Record<FamilyKey, string> = {
  goals: "var(--fam-goals)",
  practice: "var(--fam-practice)",
  svplay: "var(--fam-svplay)",
  review: "var(--fam-review)",
  oral: "var(--fam-oral)",
  tools: "var(--fam-tools)",
  user: "var(--fam-user)",
};

const FAMILY_WASH: Record<FamilyKey, string> = {
  goals: "var(--fam-goals-wash)",
  practice: "var(--fam-practice-wash)",
  svplay: "var(--fam-svplay-wash)",
  review: "var(--fam-review-wash)",
  oral: "var(--fam-oral-wash)",
  tools: "var(--fam-tools-wash)",
  user: "var(--fam-user-wash)",
};

export const ACTIVITIES: Activity[] = RAW_ACTIVITIES.map((a) => ({
  ...a,
  hue: FAMILY_PEN[a.family],
  fill: FAMILY_WASH[a.family],
}));

/** Every activity, in FAMILIES order then authored order — what the Menu grid
 *  and any grouped rail should iterate, so none of them can drift apart. */
export function activitiesInFamilyOrder(): Activity[] {
  return FAMILIES.flatMap((f) => ACTIVITIES.filter((a) => a.family === f.key));
}

/**
 * The families that have a hub PAGE of their own, by the `active` key that
 * page passes to the shell. Goals is Home, Practice is the map, Revise is the
 * Reviser and User is /moi — four families whose hub already existed under
 * another name. These two did not, so a family shortcut had to point at one
 * arbitrary member (`/games/vocabularain`, `/conjugaison`) until 2026-08-30.
 */
// PRACTICE'S HUB RETIRED TOO (Dan, 2026-09-09, looking at the grid menu:
// "all those hub pages have been made redundant by the pop ups... nearly
// all"). Skills went first, split into Oral and Tools; Practice followed —
// SpecuLearn and MémoiRecall both have doors of their own (MémoiRecall's
// now the slider pop-up), so the aggregating page a learner used to land
// on has nothing left to do that the ☰ menu does not.
//
// GAMES WAS THE ONE DAN HEDGED ON ("nearly all") — its three members are
// ALL pop-up-gated, so there is no single member page as obviously "the"
// door the way SpecuLearn was for Practice. He confirmed it anyway
// ("retire /games") a few messages later: VocabulaRain's own gallery is
// the pick (DELIBERATE_DOOR below), the same shape of call as Oral→VoixLà.
// No family has a hub page of its own left.
const FAMILY_HUBS: Record<string, FamilyKey> = {};

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
 *   oral    VoixLà — no hub page exists or is planned; a bottom-bar 💬 tap
 *           needs ONE destination and VoixLà is the lightest of the three.
 *   tools   ChaTutor, same reasoning — a chat needs no picker in front of it.
 *   practice SpecuLearn — Practice's hub retired 2026-09-09 alongside
 *           Skills'; SpecuLearn is the first thing a learner does for a
 *           goal, so it is the door.
 *   svplay  VocabulaRain — Games' hub retired 2026-09-09 too (Dan: "retire
 *           /games"), the last of the three. None of its three members is
 *           obviously THE door the way SpecuLearn was for Practice; picked
 *           for being the middle one of NumBus / VocabulaRain / LexicaLocker.
 */
export const DELIBERATE_DOOR: Record<string, string> = {
  review: "reviser",
  user: "profil",
  oral: "tts",
  tools: "tutor",
  practice: "speculearn",
  svplay: "vocabularain",
};

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

/** The same short name from a KEY rather than the object — what a page has to
 *  hand when it knows its family but cannot name itself (CahierShell's band
 *  fallback, 2026-09-07). Kept beside familyShort so the two cannot drift. */
export function familyName(key: FamilyKey): string {
  const f = FAMILIES.find((x) => x.key === key);
  return f ? familyShort(f) : "";
}

/** The family's own glyph from a KEY — 🧑‍🏫 Lesson, 🎮 Games. What a band has
 *  to hand when the page is not an activity and so has no emoji of its own
 *  (the map, a goal, the guide, Réglages). Kept beside familyName because the
 *  two are the same fallback, and a band showing one without the other is the
 *  gap that made /moi open on bare paper on 7 Sep. */
export function familyEmoji(key: FamilyKey): string {
  return FAMILIES.find((x) => x.key === key)?.emoji ?? "";
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
  const order: FamilyKey[] = ["goals", "practice", "review", "svplay", "oral", "tools", "user"];
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
  // FAVOURITES (2026-09-12) — the pages a learner starred. Without an entry
  // HERE it would draw no spine, no family ink and — because CahierShell
  // renders the band only `{famKey && …}` — no heading band either, which is
  // exactly the three-faults-in-one the comment above this block describes.
  // Found by driving the built page.
  //
  // YELLOW, TO MATCH ITS DOOR. It was `user` for a few hours, on the reasoning
  // that a learner's own shelf belongs with their own things. Dan put the tile
  // in the yellow LESSON strip (*"replacing Map"*) and then ruled on the
  // mismatch it created — *"make the favourites page yellow to match its
  // door"*. So the rule is the plain one: THE STRIP A DOOR SITS IN IS THE
  // COLOUR THE PAGE WEARS. A learner taps a yellow tile and a yellow page
  // opens; nobody has to know that a family is also a data structure.
  //
  // This does NOT make Favourites an eighth family or a Lesson activity — the
  // ☰ menu is seven families with fixed membership (9 Sep) and this is not in
  // `ACTIVITIES` at all. It borrows Lesson's pen, the way `map` and `guide`
  // two lines up do.
  favourites: "goals",
  games: "svplay", svplay: "svplay",
  // THE THREE ROUTES WHOSE TILE WAS FOLDED AWAY (Dan, 2026-09-07: pages never
  // lose their coloured strip at the top). NumBus and NumBourse were parked
  // under the Numbers hub on 31 Aug and Match It went off navigation on 10 Aug
  // — in all three cases the registry row went and the ROUTE stayed, which is
  // deliberate. What was not deliberate: with no family, CahierShell adds no
  // fam- class, so the page lost its spine, its family ink AND its band, all
  // three at once. That is the same triple fault the 1 Sep chrome audit found
  // and fixed for the deck sub-pages, twenty lines up; these three were missed
  // because nobody opens them from a tile any more.
  numbus: "svplay", numbourse: "svplay", matching: "svplay",
  reviser: "review",
  moi: "user", leaderboard: "user", profil: "user", reglages: "user", teacher: "user",
  // conjugaison sits in the REVIEW family with its activity entry (Dan,
  // 7 Sep, final) — the two must agree or the fallback contradicts the
  // registry it backs up.
  conjugaison: "review",
  // Skills retired 2026-09-09 — its pages fall into Oral or Tools now,
  // matching the activity rows above.
  tts: "oral", wordrill: "oral", ecoutexte: "oral",
  // `say` IS WorDrill, under its old key. The deck's tab list keeps that key
  // on purpose — "so SioModal embedding and withActive callers keep working"
  // (deckActivityTabs) — so the registry has a `wordrill` row and no `say`
  // one, and familyOf("say") answered null. That was invisible while colour
  // came from the demand axis, which HAS a `say` entry (BAND), and showed the
  // moment the goal card's doors moved to the family on 11 Sep: WorDrill's
  // tile inherited the goals page's yellow instead of Oral's periwinkle.
  // An alias, not a rename: the key stays where its callers expect it.
  say: "oral",
  tutor: "tools", compose: "tools", gcompris: "tools",
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
  // Reading comprehension sits with listening comprehension: the answer is in
  // the text, and what is being asked for is recognising it, not producing it.
  gcompris: "recog",
};

/** The band an activity belongs to, or null where the page owns its colours
 *  already (the same exemption familyOf makes for /moi and /profil). */
export function bandOf(activeKey: string | undefined): BandKey | null {
  if (!activeKey) return null;
  if (SELF_COLOURED.has(activeKey)) return null;
  return BAND[activeKey] ?? null;
}

/**
 * THE STRIP'S COLOUR, WHICH IS NOT ALWAYS THE BAND'S.
 *
 * Dan, 2026-09-08: *"ConjugaZone pages should be in Teal colored strip ok"*.
 *
 * `BAND` above answers a different question — what the exercise DEMANDS of the
 * learner — and it is not free to move, because `verify62` asserts it agrees
 * with what `lib/evidence.ts` stores in the teacher's record. ConjugaZone is
 * `prod`, the same demand as GramMarathon and WorDrill, and that is true and
 * must stay true. Repainting `--band-prod` teal would have recoloured those
 * two as well; moving ConjugaZone to another band would have made the page
 * claim one thing and the stored evidence another, which is the exact drift
 * verify62 was written for after Sorting spent five days doing it.
 *
 * So the two questions get two answers. The band still says what the exercise
 * asks; this says what colour the learner sees, and an activity may own that
 * outright. Everything that PAINTS reads this one — the page strip, the drill
 * shell, the stop sheet's keys, the menu icon — so a teal ConjugaZone is teal
 * everywhere rather than teal on its page and orange in the ☰.
 */
export type StripKey = BandKey | "teal";

const OWN_STRIP: Record<string, StripKey> = {
  conjugaison: "teal",
};

/** The colour class an activity's surfaces wear. Its own where it has one,
 *  otherwise its band's. Null means the page paints itself. */
export function stripOf(activeKey: string | undefined): StripKey | null {
  if (!activeKey) return null;
  if (SELF_COLOURED.has(activeKey)) return null;
  return OWN_STRIP[activeKey] ?? bandOf(activeKey);
}

/* Pages you READ rather than answer used to take a sand-coloured ground here,
 * through `READING` and `isReadingSurface()`. Dan chose the sand blind on
 * 30 Aug; on 6 Sep, shown the eleven activity pages side by side, he retired
 * it: *"can you standardise pls, i don't want outliers"*. The Memo, the guide
 * and the quick guide now wear their family's ground like every other page.
 *
 * The set and the function are DELETED rather than left unused on purpose. An
 * exemption nothing calls is an exemption one import away from coming back,
 * and this one came back invisibly once already — it was the only reason a
 * page could carry `fam-practice` and not look like Practice.
 */
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
