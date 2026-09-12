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
  | { kind: "one"; emoji: string; name: string; href: string }
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
const hrefOf = (key: string) => activity(key)?.href ?? "/map";

// Each row wears a NAME at its start — "(very subtly!) label each row at the
// start to identify what each row is about" (Dan, 7 Sep, picking over the
// bare grid). The family rows take their family's own display name so a
// rename in FAMILIES carries here.
const ROWS: { band: string; ink: string; label: string; cells: Cell[] }[] = [
  // LESSON — the goal itself, Help, and (2026-09-12) Favourites in the slot
  // the map used to hold. "Goals" still opens Home for now: the per-SIO page
  // ("Goal = Specific Instructional Objective") is a separate, larger piece
  // Dan has someone else building — this tile will point there once it lands.
  //
  // WHY THE MAP GAVE UP ITS TILE, AND WHY NOTHING WAS LOST. Dan, 2026-09-12:
  // *"put Favourites in the burger grid menu in the yellow lesson strip
  // replacing Map (Map already has multiple doors and does not need this
  // space)"*. He is right about the count — `/map` is reached from the 🗺️ in
  // the icon strip two rows above this grid, from the MneMemo tile in the
  // Practice row below it, and from the hero on Home. Favourites had ONE door
  // (the ★ beside the account chip) and it only becomes a link once something
  // is starred, so a learner who has never starred anything could not reach
  // the page to find out what it was for. This tile is that door.
  //
  // ★ AND NOT ⭐. The filled text star is what the top-bar button and the
  // Favourites page already wear; the emoji ⭐ is XP (StatsHelp: "earned every
  // answer", and the XP row on the User page), and one glyph means one thing.
  //
  // THE TILE AND THE PAGE ARE BOTH YELLOW. For a few hours they were not —
  // the tile sat here and `SITE_FAMILY` still had `favourites: "user"`, so a
  // yellow tile opened a grey page. Dan: *"make the favourites page yellow to
  // match its door"*. The rule that settles it is the plain one: the strip a
  // door sits in is the colour the page wears. See `SITE_FAMILY` in
  // activities.ts, where the entry now reads "goals".
  { band: PEN.goals, ink: INK.goals, label: familyName("goals"), cells: [
    { kind: "one", emoji: "★", name: "Favourites", href: "/favourites" },
    { kind: "one", emoji: "🎯", name: "Goals", href: HOME_HREF },
    { kind: "help" },
  ]},
  { band: PEN.practice, ink: INK.practice, label: familyName("practice"), cells: [
    { kind: "one", emoji: "💡", name: "SpecuLearn", href: "/practice/speculearn" },
    // MneMemo has no page of its own — it is reached from a stop (see its
    // registry entry, href: null). /practice USED to be that door (the
    // Practice hub, listing it alongside SpecuLearn); the hub retired 9 Sep
    // (Dan: "made redundant"), so this now points at the map, where a
    // learner actually picks the stop that opens a lesson.
    { kind: "one", emoji: "📚", name: "MneMemo", href: "/map" },
    { kind: "picker", emoji: "🃏", name: "MémoiRecall", sioKey: "flip" },
  ]},
  // "Review", not "Revise" — DéjàRevu is renamed ErroReview the same day
  // (Dan, 2026-09-09); see the registry entry in activities.ts.
  { band: PEN.review, ink: INK.review, label: familyName("review"), cells: [
    { kind: "one", emoji: "🔤", name: "ConjugaZone", href: "/conjugaison" },
    { kind: "one", emoji: "❌", name: "ErroReview", href: "/reviser" },
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
      {/* GO TO — THE STOP IS CHOSEN ONCE, HERE (Dan, 2026-09-12: *"it would
          make sense to add a row above LESSON for selection of SIO perhaps in
          pink: so that the activities can grey as necessary: just a field
          after GO TO 🎯 [ ] --> OK button"*).

          THIS IS WHAT REPLACES THE SEVEN POP-UPS, and it is a better shape for
          the same job. Each of those tiles used to open a 1-to-50 slider of its
          own: the learner answered "which goal?" again for every activity, in a
          modal in front of the page, and a tile with nothing at that stop said
          so only after they had committed. One row answers it once for all of
          them, in the menu, before anything is chosen — and the greying below
          is the answer made visible rather than reported.

          PINK IS DAN'S PICK and it is the map's grammar pen (--sio-grammar),
          not a new colour: the row names a STOP, and stops are drawn in the
          map's four pens. Nothing new for verify19b's ratchet to count.

          It opens on the learner's own stop, so the common case needs no
          typing at all. */}
      <form
        /* NO SIDEWAYS LABEL, AND THREE EQUAL THIRDS (Dan, 2026-09-12: *"there
           is no need for the category label on the left. Just have the text in
           the first third on the left 'GO TO 🎯'"*, then *"the field occupying
           the second third"*).

           So this row does NOT use the shared band grid. Every row below has a
           label column plus three tiles; this one has no family to name — «Go
           to» is an instruction, not a category — so it drops the column and
           takes the full width in thirds: the words, the field, the button. */
        className="grid grid-cols-3 items-center gap-1.5 p-1.5"
        style={{ background: "var(--sio-grammar)" }}
        onSubmit={(e) => {
          e.preventDefault();
          const n = parseInt(draft, 10);
          if (Number.isFinite(n)) setStop(Math.min(SIOS.length, Math.max(1, n)));
        }}
      >
        <span className="flex items-center justify-center gap-[0.1em] font-black uppercase text-[color:var(--cahier-ink)]">
          {/* TIGHT TO THE GLYPH, AND THE GLYPH IS THE BIG THING (Dan,
              2026-09-12: *"GO TO Uppercase is correct but is too far from the
              emoji. -- Make it bigger like in mine"*). The gap was 0.35em with
              0.2em of padding before it; the two now read as one mark. Both
              sizes are RAMP sizes rather than em multipliers, so they can be
              set against each other and measured — 30px beside the number's
              22px, which is what *"closer to my number size"* asks for. */}
          <span className={NAME}>Go to</span>
          <span aria-hidden className="text-[30px] leading-none">🎯</span>
        </span>
        {/* NOT A TILE. Dan, same message: *"reduce the height of the pink
            strip. There is no need for a single number to occupy such a big
            space"*. It was wearing `TILE`, whose `.fluo-row-tall` floor is
            what makes a DOOR tall enough to hold an emoji over a name — two
            lines of content this cell does not have. It keeps `.fluo-tap`,
            the 44px touch floor, because a finger still has to hit it: that
            is the smallest this may ever be.

            AND IT IS `min-h-[44px]`, THE BARE FLOOR, NOT `.fluo-tap`. That
            class reads `max(44px, calc(2.75rem + var(--fs-step) * 2.4))`, so
            it GROWS to about 58px on a desktop — which is what was making this
            strip tall, not the number in it. A touch floor is about the
            finger, and a finger does not get bigger on a larger screen: 44 is
            the number, at every width. verify270 exempts exactly this spelling
            for exactly this reason. */}
        <label
          className="flex min-h-[44px] items-center justify-center rounded-xl border-2 bg-[color:var(--cahier-paper-raised)] px-1"
          style={{ borderColor: "var(--cahier-ink)" }}
        >
          <span className="sr-only">Goal number, 1 to {SIOS.length}</span>
          {/* A real number input with its native arrows — Dan asked for "the
              up-down by the side of the field". globals.css strips spinners
              app-wide; `.fluo-stepper` is the one opt-in, and it has to be
              written `input[type="number"].fluo-stepper` to outrank that rule —
              and its SIZE lives in that same rule for the same reason: the
              cahier's form skin sets 0.95rem at a specificity no utility class
              here can beat, so `text-[22px]` on this element rendered at 15px. */}
          <input
            type="number"
            min={1}
            max={SIOS.length}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="fluo-stepper w-full bg-transparent text-center font-black leading-none text-[color:var(--cahier-ink)] outline-none"
          />
        </label>
        <span className="flex items-center justify-center">
          {/* SMALLER than a door, deliberately: it confirms a number, it does
              not open an activity. Still on the touch floor. */}
          <button
            type="submit"
            className="min-h-[44px] rounded-xl border-2 px-[0.9em] font-black text-[color:var(--cahier-ink)]"
            style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)" }}
          >
            <span className={NAME}>OK</span>
          </button>
        </span>
      </form>
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
            return (
              <Link key={key} href={cell.href} onClick={onNavigate}
                    className={TILE} style={{ borderColor: row.ink }} lang="fr">
                <span aria-hidden className="text-lg leading-none">{cell.emoji}</span>
                <span className={NAME}>{cell.name}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
