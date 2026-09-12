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
 * ActivityGoalPicker.tsx, deleted 12 Sep). NumBus got a two-choice pop-up —
 * NumBus or NumBourse, no goal involved.
 *
 * Colour law, unchanged since 7 Sep: the family PEN borders the tile, the
 * tile ground is raised paper — pen never behind text. Each row's BAND (its
 * background) is solid, the family's darkest rung — first a 15%-alpha wash
 * (8 Sep), corrected 9 Sep ("too light... the darkest shade in there").
 */
import Link from "next/link";
import {
  BAND as SHARED_BAND,
  BAND_NAME as SHARED_BAND_NAME,
  BAND_STACK as SHARED_BAND_STACK,
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
  | { kind: "help" }
  | { kind: "blank" };

// THE POP-UPS ARE GONE; EVERY DOOR IS A LINK (Dan, 2026-09-12: *"replace all
// the pop ups for activities by actual pages (no more pop ups for going into
// those activities)"*).
//
// Six tiles used to open a 1-to-50 slider and a seventh a two-choice card,
// added on 9 Sep when the family HUB pages were retired. What that reasoning
// missed is that the hubs and the per-activity CHOOSERS were never the same
// thing, and only the hubs went: every one of these activities still has a
// real page listing what it can play, and has had throughout.
//
//   MémoiRecall   /practice/flip-it        ActivityLanding, fifty stops
//   GramMarathon  /practice/grammarathon   ActivityLanding, fifty stops
//   WorDrill      /practice/wordrill       its own page
//   VocabulaRain  /games/vocabularain      LetrisIndexPage, every deck
//   LexicaLocker  /games/lexicalater       LexicalatorIndexPage, every deck
//   ComposeIt     /games/compose           every bank
//   Numbers       /games/numbers           NumBus and NumBourse, Dan's own
//                                          hub-tab from 31 Aug
//
// So no page had to be written to carry this out — the tiles simply stopped
// intercepting the click. Each cell now names its registry key and the href
// comes from `activity()`, which is where a name and an address live once.

// Each row wears a NAME at its start — "(very subtly!) label each row at the
// start to identify what each row is about" (Dan, 7 Sep, picking over the
// bare grid). The family rows take their family's own display name so a
// rename in FAMILIES carries here.
/** A door's address from the registry, which is where an address lives once.
 *  Falling back to the map rather than to "#" keeps a tile working if a key is
 *  ever renamed — the same `??` guard the Numbers tile already used for its
 *  name and emoji. */
const hrefOf = (key: string) => activity(key)?.href ?? "/map";

const ROWS: { band: string; ink: string; label: string; cells: Cell[] }[] = [
  // LESSON (Dan, 2026-09-09) — Map, the goal itself, and Help now live
  // together. "Goals" still opens Home for now: the per-SIO page ("Goal =
  // Specific Instructional Objective") is a separate, larger piece Dan has
  // someone else building — this tile will point there once it lands.
  { band: PEN.goals, ink: INK.goals, label: familyName("goals"), cells: [
    { kind: "one", emoji: "🧭", name: "Map", href: "/map" },
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
    { kind: "one", emoji: "🃏", name: "MémoiRecall", href: hrefOf("flip") },
  ]},
  // "Review", not "Revise" — DéjàRevu is renamed ErroReview the same day
  // (Dan, 2026-09-09); see the registry entry in activities.ts.
  { band: PEN.review, ink: INK.review, label: familyName("review"), cells: [
    { kind: "one", emoji: "🔤", name: "ConjugaZone", href: "/conjugaison" },
    { kind: "one", emoji: "❌", name: "ErroReview", href: "/reviser" },
    { kind: "one", emoji: "🏃", name: "GramMarathon", href: hrefOf("grammarathon") },
  ]},
  { band: PEN.svplay, ink: INK.svplay, label: familyName("svplay"), cells: [
    { kind: "one", emoji: "🔢", name: "Numbers", href: hrefOf("numbers") },
    { kind: "one", emoji: "🌧️", name: "VocabulaRain", href: hrefOf("vocabularain") },
    // LexicaLocker (Dan, 2026-09-09) — renamed from LexicaLater, 🔐 instead
    // of 🧰: see the registry entry in activities.ts for why.
    { kind: "one", emoji: "🔐", name: "LexicaLocker", href: hrefOf("lexicalator") },
  ]},
  // ORAL (NEW, 2026-09-09) — half of retired Skills: the three that put
  // French in your mouth or ear. VoixLà has one page and needs no picker;
  // WorDrill and ÉcouTexte are two more of the seven slider-gated tiles.
  { band: PEN.oral, ink: INK.oral, label: familyName("oral"), cells: [
    { kind: "one", emoji: "🔊", name: "VoixLà", href: "/tts" },
    { kind: "one", emoji: "🎙️", name: "WorDrill", href: hrefOf("wordrill") },
    // ÉCOUTEXTE ASKS NOTHING (Dan, 11 Sep: "some of the pages have two pop ups
    // before the activity" — one question, asked once). It was a picker cell,
    // but its content is chosen by unit and topic and there is no per-stop
    // route, so the pop-up took an answer it could not use and opened the
    // topic picker regardless. A pop-up whose reply is discarded is worse
    // than no pop-up: it teaches the learner their choice does not matter.
    { kind: "one", emoji: "🎧", name: "ÉcouTexte", href: hrefOf("ecoutexte") },
  ]},
  // TOOLS (NEW, 2026-09-09) — the other half: the two summonable helpers
  // (see ToolSummon.tsx's own 🛠️ door). ChaTutor is a chat, not a deck, so
  // it keeps a plain link; the third slot is deliberately blank, per Dan's
  // own grid ("ChaT. - Compo. - [Blank]").
  { band: PEN.tools, ink: INK.tools, label: familyName("tools"), cells: [
    { kind: "one", emoji: "🤖", name: "ChaTutor", href: "/tutor" },
    { kind: "one", emoji: "🧩", name: "ComposeIt", href: hrefOf("compose") },
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


export default function MenuGrid({
  onNavigate,
}: {
  /** Close the dropdown — called on every door, Help included now that it
   *  is one (2026-09-09: Help navigates to /guide instead of summoning a
   *  second grid, so it no longer needs a callback of its own), and now every
   *  door is one: the `picker` prop went with the pop-ups on 2026-09-12.
   *
   *  The elaborate reason it existed is worth keeping as a warning about a
   *  shape that is gone: a picker cell called `onNavigate` in the same click
   *  that opened its pop-up, `onNavigate` closed the dropdown, the dropdown
   *  unmounted THIS component — so any state or modal a cell opened had to
   *  live one level up or it vanished in the tick it was created. Every cell
   *  is a Link now and navigation unmounting the menu is simply correct. */
  onNavigate: () => void;
}) {
  // Each row is its OWN band, filled SOLID with the family's darkest rung
  // (Dan, 2026-09-09: a pale 15%-alpha wash "is too light... the darkest
  // shade in there for the background" — matching the ink the page's own
  // top strip and left spine already wear). The tiles keep their
  // raised-paper ground on top — pen never behind text, per the colour
  // law above — so the effect is light cards on a solid, saturated band.
  // THE DROPDOWN IS SIZED BY ITS BANDS, not by a number (Dan, 2026-09-12:
  // *"PLEASE NEVER EVER HARD CODE FONT SIZES AND BUTTON SIZES !!!"*).
  //
  // It was `w-[20.6rem]`, and that number is where the goal card's distortion
  // came from: a later fix pinned the tile width to 5.958rem — 20.6rem less
  // the padding, the gaps and the label, over three — so this menu's fixed box
  // had quietly become the app's tile geometry. The bands now measure
  // themselves in `em` off the type ramp, so the dropdown takes their width
  // and grows with them. The only cap left is a share of the VIEWPORT, which
  // is adaptive by construction.
  return (
    <div className={`${SHARED_BAND_STACK} max-w-[90vw]`}>
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
