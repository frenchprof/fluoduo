"use client";

/**
 * The ☰ menu — SEVEN rows now, not five (Dan, 2026-09-09, replacing his own
 * 7 Sep 3×5 grid): *"🧑‍🏫 Lesson · 📝 Practice · 🔄 Review · 🎮 Games ·
 * 💬 Oral · 🛠️ Tools · 👤 User"*. Skills is retired and split across two new
 * rows — Oral (the spoken activities) and Tools (the two summonable
 * helpers) — and Help moves out of the last row into the new first one,
 * alongside Map and the goal itself.
 *
 * SEVEN OF NINETEEN TILES NO LONGER LINK STRAIGHT TO A HUB (Dan, same
 * thread): *"instead of leading to a hub page, each of these will go
 * directly to the relevant page (if there is only one) OR a pop-up will
 * ask if they wish to visit the activity for the current Goal (SIO)"*.
 * MémoiRecall, GramMarathon, VocabulaRain, LexicaLocker, WorDrill,
 * ÉcouTexte and ComposeIt each used to open a deck/unit PICKER of their
 * own; they now open the ONE 50-stop slider pop-up instead (see
 * ActivityGoalPicker.tsx). NumBus gets the simpler two-choice pop-up —
 * NumBus or NumBourse, no goal involved.
 *
 * Colour law, unchanged since 7 Sep: the family PEN borders the tile, the
 * tile ground is raised paper — pen never behind text. Each row's BAND (its
 * background) is solid, the family's darkest rung — first a 15%-alpha wash
 * (8 Sep), corrected 9 Sep ("too light... the darkest shade in there").
 */
import Link from "next/link";
import { useState } from "react";
import { stopHref, type StopActivityKey } from "@/lib/activityStops";
import { loadProgress } from "@/lib/progress";
import { dueForReview } from "@/lib/reviser";
import { nextGoalNumber, loadBookmark } from "@/lib/continuer";
import { SIOS } from "@/content/sios";
import {
  BAND as SHARED_BAND,
  BAND_NAME as SHARED_BAND_NAME,
  TILE as SHARED_TILE,
  TILE_NAME as SHARED_TILE_NAME,
} from "@/components/familyTile";
import { familyName, activity } from "@/content/activities";
import { HOME_HREF } from "@/lib/routes";

// Every colour here is a CSS custom property, never a literal hex — the ONE
// palette lives in globals.css (Dan's fixed 12-swatch brand set, 2026-09-09:
// "use only these shades"; the two that don't have an exact match in the
// twelve — Oral's Periwinkle standing in for "Indigo", User's grey, not in
// the set at all — are resolved there, not re-decided here). A hard-coded
// hex in a component is exactly the drift verify19b's ratchet exists to
// catch, and it very nearly reintroduced it: use the token, not the value.
const TILE = SHARED_TILE;
const NAME = SHARED_TILE_NAME;
/** The − and + on the GO TO field. `text-[30px]` is already a ramp size in
 *  globals.css (calc(1.875rem + var(--fs-step) * 1.88)), so these grow with
 *  the rest of the app rather than adding a step to the ladder for one glyph —
 *  and it is the same size the 🎯 beside them wears. */
const STEP = "text-[30px]";

const PEN = {
  goals: "var(--fam-goals)",
  practice: "var(--fam-practice)",
  review: "var(--fam-review)",
  svplay: "var(--fam-svplay)",
  oral: "var(--fam-oral)",
  tools: "var(--fam-tools)",
} as const;

// THE ROW BANDS ARE THE FAMILY'S BRIGHT BASE SHADE (Dan, 2026-09-11, sending
// the page-strip catalogue in the seven bright hues: "the background needs
// to be brighter like this"). This SUPERSEDES the 9 Sep ruling that put the
// darkest rung behind each row — that ruling was made against a pale
// 15%-alpha wash, and "darkest" was the answer to "too light", not a
// preference for dark over bright. The band is now the same solid pen the
// page heading strips wear, so the menu and the strips read as one system.
// The darkest rung moves to the tile outlines, so they still read on yellow;
// the vertical family label is the house ink — black — at Dan's word.
const INK = {
  goals: "var(--fam-goals-ink)",
  practice: "var(--fam-practice-ink)",
  review: "var(--fam-review-ink)",
  svplay: "var(--fam-svplay-ink)",
  oral: "var(--fam-oral-ink)",
  tools: "var(--fam-tools-ink)",
} as const;

// The User row's tiles keep grey for both pen and band — it isn't one of
// Dan's twelve swatches (his call, 9 Sep: "none of the twelve reads as
// neutral" — keep the grey it has). Same tokens PageBand and the spine use.
const GREY = "var(--fam-user)";
const GREY_INK = "var(--fam-user-ink)";

type Cell =
  /* `badge: "due"` puts the review queue's size on the tile. It is a KEY
     rather than a number because ROWS is a module constant, evaluated once at
     import: a number here would be frozen at whatever the count was when the
     bundle loaded. The component resolves it per render. */
  | { kind: "one"; emoji: string; name: string; href: string; badge?: "due" }
  /* A PER-STOP DOOR. It is not a pop-up any more and it is not a plain link
     either: the GO TO row at the top of this menu names the stop, and these
     six answer for it — a real link when the activity can play that stop, a
     greyed tile when it cannot (Dan, 2026-09-12: *"if the activity does not
     exist for a particular stop, then grey out the item on the menu!"*).

     THE PRE-TESTS LANE MADE THESE PLAIN `one` CELLS pointing at each
     activity's landing page, under the same instruction that removed the
     pop-ups, and it was right when it was written — the row did not exist
     yet. Keeping that here would have left the GO TO row setting a number
     nothing read. The pop-up is still gone; what replaced it is the row. */
  | { kind: "picker"; emoji: string; name: string; sioKey: StopActivityKey }
  | { kind: "help" }
  /* GO TO — the goal picker, a CELL now rather than a strip of its own (Dan,
     2026-09-13). It is the only cell that is a control instead of a door, so
     it is the only one that is not a link. */
  | { kind: "goto" }
  | { kind: "blank" };

// NO TILE INTERCEPTS A CLICK ANY MORE (Dan, 2026-09-12: *"replace all the pop
// ups for activities by actual pages (no more pop ups for going into those
// activities)"*).
//
// Six tiles used to open a 1-to-50 goal slider and a seventh a two-choice card,
// added on 9 Sep when the family HUB pages were retired as "made redundant".
// What that reasoning missed is that a family hub and an activity's own CHOOSER
// were never the same page, and only the hubs went. Every one of these still
// had a real page listing what it can play, and had throughout:
//
//   MémoiRecall   /practice/flip-it        ActivityLanding, fifty stops
//   GramMarathon  /practice/grammarathon   ActivityLanding, fifty stops
//   WorDrill      /practice/wordrill       its own page
//   VocabulaRain  /games/vocabularain      every set, folded by unit
//   LexicaLocker  /games/lexicalater       every deck, folded by unit
//   ComposeIt     /games/compose           every bank, folded by unit
//   Numbers       /games/numbers           NumBus and NumBourse, Dan's own
//                                          hub-tab from 31 Aug
//
// So no page had to be written to carry this out — the tiles simply stopped
// intercepting the click. Each cell names its registry key and the href comes
// from `activity()`, which is where a name and an address live once.

/** A door's address from the registry, which is where an address lives once.
 *  Falling back to the map rather than to "#" keeps a tile working if a key is
 *  ever renamed — the same `??` guard the Numbers tile already used for its
 *  name and emoji. */
const hrefOf = (key: string) => activity(key)?.href ?? HOME_HREF;

// Each row wears a NAME at its start — "(very subtly!) label each row at the
// start to identify what each row is about" (Dan, 7 Sep, picking over the
// bare grid). The family rows take their family's own display name so a
// rename in FAMILIES carries here.
const ROWS: { band: string; ink: string; label: string; cells: Cell[] }[] = [
  // LESSON — ★ Favourites, the goal itself, and Help. TWO BRANCHES LANDED ON
  // THIS ROW WITHIN AN HOUR OF EACH OTHER and both were right; this is the
  // merge, spelled out because a careless resolution silently loses one.
  //
  // MAP GAVE UP THIS TILE, from both sides at once. Dan to the Favourites
  // lane: *"put Favourites in the burger grid menu in the yellow lesson strip
  // replacing Map (Map already has multiple doors and does not need this
  // space)"*. Dan to this lane, the same day: *"We don't need Map in the menu
  // it is already in the Kallang Wave"*. The second reason is now the stronger
  // one — `/map` forwards to Home, which DRAWS the map, so a menu door to it
  // was a door to the page you were already looking at.
  //
  // ★ FAVOURITES is the Favourites lane's tile, unchanged. It needed a door:
  // the ★ beside the account chip only becomes a LINK once something is
  // starred, so a learner who had never starred anything could not reach the
  // page to find out what it was for. ★ and not ⭐ — the filled text star is
  // what the button and the page wear, while ⭐ is XP, and one glyph means one
  // thing.
  //
  // 🎯 GOALS IS A PICKER, WHICH IS THIS LANE'S HALF AND THE PART A NAIVE MERGE
  // WOULD HAVE DROPPED. main's tile still read `href: HOME_HREF` with a
  // comment saying the per-SIO page was "a separate, larger piece Dan has
  // someone else building — this tile will point there once it lands". IT HAS
  // LANDED. Dan, 2026-09-12: *"Goals will lead to SIOs"*. And with Home now
  // being the map, `HOME_HREF` here would be a door to the page you pressed it
  // on. A picker rather than a plain link because "which goal?" is the
  // question — the same slider every other per-stop tile opens. See
  // `stopHref`'s `sio` case, the one entry that cannot fail: its addresses are
  // built from the same array the slider counts.
  // THE PINK STRIP IS GONE AND GO TO LIVES IN THE YELLOW ROW (Dan, 2026-09-13,
  // sending a mock-up: *"It might be better off to have the menu without the
  // pink and just in yellow over the pink and without the top row"*). It had
  // been a row of its own above LESSON, in the map's grammar pen — a fourth
  // band on a menu that already has seven, for one field. Selecting a goal IS
  // the Lesson family's business, so it takes the middle cell and the row
  // count goes back to what Dan drew on 9 Sep.
  //
  // Order is his mock's, left to right: Help · GO TO · Favourites.
  { band: PEN.goals, ink: INK.goals, label: familyName("goals"), cells: [
    { kind: "help" },
    { kind: "goto" },
    { kind: "one", emoji: "★", name: "Favourites", href: "/favourites" },
  ]},
  { band: PEN.practice, ink: INK.practice, label: familyName("practice"), cells: [
    { kind: "one", emoji: "💡", name: "SpecuLearn", href: "/practice/speculearn" },
    // MNEMEMO OPENS MNEMEMO (Dan, 2026-09-12: *"MneMemo will lead to MneMemo
    // (the current link is wrong)"*). It pointed at /map, which was a
    // stand-in with a reason — MneMemo has no page of its own, its door was
    // the Practice hub, the hub retired 9 Sep — but the stand-in outlived the
    // problem. A learner pressing « MneMemo » got a map and had to know that
    // tapping a stop was the next move; nothing on screen said so.
    //
    // It is a picker like the two beside it: pick the goal, land on that
    // goal's lesson at `/lessons/deck/<deck>` — the route whose own frame is
    // titled "MneMemo". See `stopHref`'s `mnemo` case for the gate.
    { kind: "picker", emoji: "📚", name: "MneMemo", sioKey: "mnemo" },
    { kind: "picker", emoji: "🃏", name: "MémoiRecall", sioKey: "flip" },
  ]},
  // "Review", not "Revise" — DéjàRevu is renamed ErroReview the same day
  // (Dan, 2026-09-09); see the registry entry in activities.ts.
  { band: PEN.review, ink: INK.review, label: familyName("review"), cells: [
    { kind: "one", emoji: "🔤", name: "ConjugaZone", href: "/conjugaison" },
    // THE ☰'s BADGE HAS TO LAND SOMEWHERE (Dan, 2026-09-12: *"THE THING WHEN
    // I OPEN THE MENU I WILL BE WONDERING WHERE THAT NUMBER FALLS UNDER AND IT
    // WAS NOT SHOWN"*).
    //
    // `SiteTopBar` has put a count on the ☰ button since the bottom bar was
    // removed — « 7 » in a pill, announced as "Navigation — 7 to revise". It
    // says something is waiting and not WHAT, so opening the menu to find out
    // answered nothing: twenty tiles, none of them carrying the number. A
    // badge that raises a question its own menu cannot answer is worse than no
    // badge.
    //
    // It counts WORDS, not goals: every item the learner has practised has a
    // spaced-repetition timer, and `dueForReview` returns the ones whose timer
    // has elapsed. ErroReview is the page that plays exactly that queue, so
    // this is the tile the ☰'s number was always about.
    { kind: "one", emoji: "❌", name: "ErroReview", href: "/reviser", badge: "due" },
    { kind: "picker", emoji: "🏃", name: "GramMarathon", sioKey: "grammarathon" },
  ]},
  { band: PEN.svplay, ink: INK.svplay, label: familyName("svplay"), cells: [
    { kind: "one", emoji: "🔢", name: "Numbers", href: hrefOf("numbers") },
    { kind: "picker", emoji: "🌧️", name: "VocabulaRain", sioKey: "vocabularain" },
    // LexicaLocker (Dan, 2026-09-09) — renamed from LexicaLater, 🔐 instead
    // of 🧰: see the registry entry in activities.ts for why.
    { kind: "picker", emoji: "🔐", name: "LexicaLocker", sioKey: "lexicalator" },
  ]},
  // ORAL (NEW, 2026-09-09) — half of retired Skills: the three that put
  // French in your mouth or ear.
  { band: PEN.oral, ink: INK.oral, label: familyName("oral"), cells: [
    { kind: "one", emoji: "🔊", name: "VoixLà", href: "/tts" },
    { kind: "picker", emoji: "🎙️", name: "WorDrill", sioKey: "wordrill" },
    // ÉCOUTEXTE ASKED NOTHING EVEN WHEN THE OTHERS DID (Dan, 11 Sep: "some of
    // the pages have two pop ups before the activity" — one question, asked
    // once). Its content is chosen by unit and topic and there is no per-stop
    // route, so its slider took an answer it could not use and opened the
    // topic page regardless. A pop-up whose reply is discarded is worse than
    // no pop-up: it teaches the learner their choice does not matter. It was
    // the first of the seven to lose its slider and now simply matches them.
    { kind: "one", emoji: "🎧", name: "ÉcouTexte", href: hrefOf("ecoutexte") },
  ]},
  // TOOLS (NEW, 2026-09-09) — the other half: the two summonable helpers
  // (see ToolSummon.tsx's own 🛠️ door). ChaTutor is a chat, not a deck, so
  // it keeps a plain link; the third slot is deliberately blank, per Dan's
  // own grid ("ChaT. - Compo. - [Blank]").
  { band: PEN.tools, ink: INK.tools, label: familyName("tools"), cells: [
    { kind: "one", emoji: "🤖", name: "ChaTutor", href: "/tutor" },
    { kind: "picker", emoji: "🧩", name: "ComposeIt", sioKey: "compose" },
    { kind: "blank" },
  ]},
  { band: GREY, ink: GREY_INK, label: familyName("user"), cells: [
    { kind: "one", emoji: "👤", name: "User", href: "/profil" },
    { kind: "one", emoji: "🏆", name: "Leaderboard", href: "/leaderboard" },
    { kind: "one", emoji: "⚙️", name: "Settings", href: "/reglages" },
  ]},
];

/* TILE, NAME, the band and its sideways label all moved to
   components/familyTile.ts on 2026-09-12, when the goal card was asked to
   take this exact arrangement (Dan: *"make sure everything including font is
   identical"*). They are unchanged — only their address moved — and this menu
   still renders from the same strings, which is what makes "identical" a fact
   rather than an intention. */

/* THEIR ONE SUBSTANTIVE CHANGE MOVED INTO THE SHARED STRING, 12 Sep. This
   branch re-declared TILE and NAME locally to swap `min-h-[64px]` for the
   new `.fluo-row-tall`; taking that as written would have undone the whole
   point of the shared file — the menu and the goal card cannot drift only
   because they read ONE definition. So the class went into familyTile's TILE
   and the local copies stayed gone. Their class is the better half of the
   trade: `.fluo-row-tall` sits beside `.fluo-tap` and `.fluo-row` in
   globals.css, where a reader meets the touch FLOOR and the design heights
   together, rather than an inline calc() repeated per component. */


export default function MenuGrid({
  onNavigate,
  currentStop,
}: {
  /** Close the dropdown — called on every door, Help included now that it
   *  is one (2026-09-09: Help navigates to /guide instead of summoning a
   *  second grid, so it no longer needs a callback of its own). */
  onNavigate: () => void;
  /** The learner's current stop, so GO TO opens on it and the common case
   *  needs no typing. Passed in rather than read here: this component
   *  unmounts on every navigation, and localStorage cannot be read during
   *  render in a static export. */
  currentStop?: number;
}) {
  /* THE CHOSEN STOP LIVES HERE, not in the caller, and that is safe where the
     pop-ups' state was not: a pop-up had to outlive `onNavigate` (which
     unmounts this whole component), so it lived one level up in SiteTopBar.
     This row does the opposite — it is only ever read WHILE the menu is open,
     and a fresh open should start from the learner's own stop rather than
     whatever they typed last time. */
  /* READ ONCE, LAZILY, AT OPEN. This component is rendered only inside
     `{menuOpen && …}`, so it does not exist during the static export's
     prerender and a lazy initialiser may touch localStorage — which is why
     this needs neither an effect nor the `set-state-in-effect` disable the
     top bar's own StopMark carries. */
  const initial = () => {
    if (currentStop) return currentStop;
    try { return nextGoalNumber(loadProgress(), loadBookmark()) ?? 1; } catch { return 1; }
  };
  /* THE REVIEW QUEUE'S SIZE, read the same lazy way and for the same reason:
     this component is rendered only inside `{menuOpen && …}`, so it does not
     exist during the static export's prerender and an initialiser may touch
     localStorage. Read at OPEN rather than kept in sync — the menu is a
     moment, and a number that changed under an open dropdown would be worse
     than one that is a few seconds old. */
  const [dueNow] = useState(() => {
    try { return dueForReview(loadProgress(), Date.now()).length; } catch { return 0; }
  });
  const [stop, setStop] = useState(initial);
  const [draft, setDraft] = useState(() => String(initial()));

  // Each row is its OWN band, filled SOLID with the family's darkest rung
  // (Dan, 2026-09-09: a pale 15%-alpha wash "is too light... the darkest
  // shade in there for the background" — matching the ink the page's own
  // top strip and left spine already wear). The tiles keep their
  // raised-paper ground on top — pen never behind text, per the colour
  // law above — so the effect is light cards on a solid, saturated band.
  // THE GRID GROWS WITH THE TYPE RAMP (Dan, 12 Sep: "NEVER EVER HARD CODE
  // FONT SIZES AND BUTTON SIZES"). The names are on the ramp — 16px on a
  // phone, ~21.8px on a 1440px desktop — but the grid was a fixed 20.6rem, so
  // the tiles stayed 85px while their names grew, and on a desktop seven of
  // the twenty clipped to an ellipsis. Measured: at the desktop step the names
  // run about 1.36x, so the width takes the same step, x21
  // (20.6rem + 0.36rem*21 = 28.2rem). The tiles now grow with the text they
  // hold; max-w-[90vw] still caps a narrow phone.
  return (
    <div className="w-[calc(20.6rem+var(--fs-step)*21)] max-w-[90vw] overflow-hidden rounded-lg">
      {/* THE GO TO STRIP THAT USED TO SIT HERE IS GONE (Dan, 2026-09-13:
          *"better off to have the menu without the pink and just in yellow
          over the pink and without the top row"*). It was a fourth band, in
          the map's grammar pen, above a menu that already has seven — for one
          field. The control moved into the LESSON row's middle cell, where it
          belongs: choosing a goal is that family's business, and the pink is
          not a colour this menu needs. See the `goto` cell below.

          What it does has NOT changed, and that is the part worth keeping:
          the stop is chosen ONCE here and every tile below reacts, instead of
          seven activities each opening a 1-to-50 slider of their own. */}
      {ROWS.map((row, r) => (
        <div
          key={r}
          className={SHARED_BAND}
          style={{ background: row.band }}
        >
          {/* BLACK, NOT WHITE AND NOT THE FAMILY'S DARK RUNG (Dan, 2026-09-11:
              "black font instead of white font over these background for the
              leftmost cat names"). The house ink is the app's black. */}
          <span className={SHARED_BAND_NAME}>
            {row.label}
          </span>
          {row.cells.map((cell, c) => {
            const key = `${r}-${c}`;
            if (cell.kind === "blank") {
              // An empty cell, not an invisible one — no border, no ground,
              // so the eye reads "nothing lives here" rather than "a door
              // I cannot see" (Dan's own grid drew it as [Blank]).
              return <div key={key} aria-hidden />;
            }
            if (cell.kind === "goto") {
              // A TILE, NOT A STRIP (Dan, 2026-09-13). It wears the same
              // outline and paper ground as the doors either side, so the row
              // reads as one row; what marks it out is that it holds controls
              // rather than a name. Two lines, because a third of the width
              // cannot hold a label, a field, two steppers and OK abreast and
              // still give each a finger-sized target.
              const commit = () => {
                const n = parseInt(draft, 10);
                if (Number.isFinite(n)) setStop(Math.min(SIOS.length, Math.max(1, n)));
              };
              const nudge = (by: number) =>
                setDraft((d) => String(Math.min(SIOS.length, Math.max(1, (parseInt(d, 10) || 1) + by))));
              return (
                <div key={key} className={`${TILE} gap-0.5`} style={{ borderColor: row.ink }}>
                  <span className="flex items-center gap-[0.1em] font-black uppercase leading-none text-[color:var(--cahier-ink)]">
                    <span className={NAME}>Go to</span>
                    <span aria-hidden className="text-[22px] leading-none">🎯</span>
                  </span>
                  <span className="flex w-full items-center justify-center gap-0.5">
                    <button
                      type="button"
                      aria-label="Previous goal"
                      onClick={() => nudge(-1)}
                      className="flex min-h-[44px] min-w-[24px] shrink-0 items-center justify-center font-black leading-none text-[color:var(--cahier-ink)]"
                    >
                      <span aria-hidden className={STEP}>−</span>
                    </button>
                    <label className="flex min-w-0 flex-1 items-center justify-center">
                      <span className="sr-only">Goal number, 1 to {SIOS.length}</span>
                      <input
                        type="number"
                        min={1}
                        max={SIOS.length}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
                        className="fluo-stepper w-full min-w-0 bg-transparent text-center font-black leading-none text-[color:var(--cahier-ink)] outline-none"
                      />
                    </label>
                    <button
                      type="button"
                      aria-label="Next goal"
                      onClick={() => nudge(1)}
                      className="flex min-h-[44px] min-w-[24px] shrink-0 items-center justify-center font-black leading-none text-[color:var(--cahier-ink)]"
                    >
                      <span aria-hidden className={STEP}>+</span>
                    </button>
                    <button
                      type="button"
                      onClick={commit}
                      className="min-h-[44px] shrink-0 rounded-lg border-2 px-[0.45em] font-black text-[color:var(--cahier-ink)]"
                      style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)" }}
                    >
                      <span className={NAME}>OK</span>
                    </button>
                  </span>
                </div>
              );
            }
            if (cell.kind === "help") {
              // HELP OPENS THE MANUAL, NOT A SECOND GRID (Dan, 2026-09-09:
              // "help should open to a 'How to use' manuel, not another grid
              // menu. We can retire the older grid menu that it opens to").
              //
              // It used to open MenuSplash — a twenty-tile grid built on
              // 19 Aug, when this ☰ menu did not exist and the help button was
              // the only way to reach the whole app. MenuSplash's own header
              // recorded that it had REPLACED a quick-guide popup, on the
              // grounds that "what a learner reached for that button to do was
              // GO somewhere". That was true then and is not now: this grid is
              // the going-somewhere door, so a second grid behind Help was the
              // same answer given twice, and the question nobody could answer
              // any more was "how does this app work?".
              //
              // /guide is that answer and already exists — the learner
              // tutorial, written to Dan's July notes ("a new user might be
              // quite lost", then "way too wordy — succinct yet clear"). So
              // this is a door being pointed at the right room, not a page
              // being built.
              //
              // A LINK, not a button, so it matches every other tile here:
              // middle-click and long-press offer "open in new tab", which a
              // manual is exactly the sort of page to want open beside you.
              return (
                <Link key={key} href="/guide" onClick={onNavigate}
                      className={TILE} style={{ borderColor: row.ink }}>
                  <span aria-hidden className="text-lg leading-none">🆘</span>
                  <span className={NAME}>Help</span>
                </Link>
              );
            }
            /* THE "Numbers" TILE READS ITS NAME FROM THE REGISTRY, and the
               reason survives the pop-up's removal (Dan, 2026-09-09: "NumBus
               appears twice, once as a menu item in the grid menu, and another
               in the next pop up, but maybe we should call the menu item
               Numbers instead"). activities.ts has held `name: "Numbers",
               emoji: "🔢"` the whole time; this tile used to hard-code
               "NumBus" over it, so a learner tapped NumBus and was asked
               "NumBus or NumBourse?" — two doors sharing one name, which the
               names ruling forbids. The pop-up that asked is gone and
               /games/numbers asks it as a page, so the tile is now an ordinary
               <Link> like every other and needs no branch of its own. */
            if (cell.kind === "picker") {
              /* NO POP-UP. The stop is chosen once, on the GO TO row at the top
                 of this menu, and every per-stop door below answers for it —
                 Dan, 2026-09-12: *"when they click OK, the tiles below in the
                 grid menu has to react to grey"*, and *"the user still has to
                 decide what activity they want to go to"*. So the row sets
                 WHERE and the tile still chooses WHAT: two decisions, two
                 controls, and neither of them a modal in front of the page.

                 A door with nothing at this stop is GREYED, not hidden — the
                 same ruling as the goal card's doors, for the same reason: a
                 missing tile cannot tell a learner whether the activity is
                 absent here or gone altogether. */
              const href = stopHref(cell.sioKey, stop);
              if (!href) {
                return (
                  <span
                    key={key}
                    aria-disabled="true"
                    title={`${cell.name} — nothing at goal ${stop}`}
                    className={`${TILE} cursor-default opacity-45`}
                    style={{ borderColor: "var(--cahier-line-strong)" }}
                  >
                    <span aria-hidden className="text-lg leading-none">{cell.emoji}</span>
                    <span className={NAME}>{cell.name}</span>
                  </span>
                );
              }
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={onNavigate}
                  className={TILE}
                  style={{ borderColor: row.ink }}
                >
                  <span aria-hidden className="text-lg leading-none">{cell.emoji}</span>
                  <span className={NAME}>{cell.name}</span>
                </Link>
              );
            }
            /* THE COUNT SITS ON THE TILE, not beside its name — the same
               shape and the same corner as the ☰'s own badge, so the two read
               as one number in two places rather than two numbers. Hidden at
               zero: "0 to revise" is not news, and an empty pill on a tile is
               the furniture Dan's 1 Sep counting rule bans. `relative` only
               where a badge is actually drawn, so no other tile changes. */
            const badge = cell.badge === "due" && dueNow > 0 ? dueNow : 0;
            return (
              <Link key={key} href={cell.href} onClick={onNavigate}
                    className={`${TILE}${badge ? " relative" : ""}`}
                    style={{ borderColor: row.ink }} lang="fr"
                    aria-label={badge ? `${cell.name} — ${badge} to revise` : undefined}>
                <span aria-hidden className="text-lg leading-none">{cell.emoji}</span>
                <span className={NAME}>{cell.name}</span>
                {badge > 0 && (
                  <span
                    aria-hidden
                    /* THE SAME PILL THE ☰ WEARS, deliberately — `--dopa-streak`
                       on `--dopa-streak-on`, the same radius and the same
                       corner. Driven side by side, the first cut had this in
                       `--dopa-focus` blue against the bar's pink, and two
                       colours make one number read as two different counts,
                       which is the confusion this tile exists to end. */
                    className="absolute -right-2 -top-2 rounded-full bg-[var(--dopa-streak)] px-1.5 text-[10px] font-bold leading-[1.4] text-[color:var(--dopa-streak-on)]"
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
