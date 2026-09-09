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
import { familyName } from "@/content/activities";
import { SIO_HREF, type ActivityPicker } from "@/components/ActivityGoalPicker";

// Every colour here is a CSS custom property, never a literal hex — the ONE
// palette lives in globals.css (Dan's fixed 12-swatch brand set, 2026-09-09:
// "use only these shades"; the two that don't have an exact match in the
// twelve — Oral's Periwinkle standing in for "Indigo", User's grey, not in
// the set at all — are resolved there, not re-decided here). A hard-coded
// hex in a component is exactly the drift verify19b's ratchet exists to
// catch, and it very nearly reintroduced it: use the token, not the value.
const PEN = {
  goals: "var(--fam-goals)",
  practice: "var(--fam-practice)",
  review: "var(--fam-review)",
  svplay: "var(--fam-svplay)",
  oral: "var(--fam-oral)",
  tools: "var(--fam-tools)",
} as const;

// The row BANDS take the family's darkest rung, not the pen (Dan, 2026-09-09,
// after seeing the pale-wash version: "you are using the very light shade
// which is too light... the darkest shade in there for the background" —
// the same `--fam-*-ink` rung the page's top strip and left spine already
// use). Tiles keep their raised-paper ground on top, so the effect is light
// cards on a solid, saturated band.
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
  | { kind: "blank" }
  // A hub-gallery replaced by the 50-stop slider pop-up — `sioKey` is its
  // entry in ActivityGoalPicker's SIO_HREF map.
  | { kind: "picker"; emoji: string; name: string; sioKey: keyof typeof SIO_HREF }
  | { kind: "numbers" }; // the one non-SIO pop-up: NumBus or NumBourse

// Each row wears a NAME at its start — "(very subtly!) label each row at the
// start to identify what each row is about" (Dan, 7 Sep, picking over the
// bare grid). The family rows take their family's own display name so a
// rename in FAMILIES carries here.
const ROWS: { pen: string; band: string; label: string; cells: Cell[] }[] = [
  // LESSON (Dan, 2026-09-09) — Map, the goal itself, and Help now live
  // together. "Goals" still opens Home for now: the per-SIO page ("Goal =
  // Specific Instructional Objective") is a separate, larger piece Dan has
  // someone else building — this tile will point there once it lands.
  { pen: PEN.goals, band: INK.goals, label: familyName("goals"), cells: [
    { kind: "one", emoji: "🧭", name: "Map", href: "/map" },
    { kind: "one", emoji: "🎯", name: "Goals", href: "/" },
    { kind: "help" },
  ]},
  { pen: PEN.practice, band: INK.practice, label: familyName("practice"), cells: [
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
  { pen: PEN.review, band: INK.review, label: familyName("review"), cells: [
    { kind: "one", emoji: "🔤", name: "ConjugaZone", href: "/conjugaison" },
    { kind: "one", emoji: "❌", name: "ErroReview", href: "/reviser" },
    { kind: "picker", emoji: "🏃", name: "GramMarathon", sioKey: "grammarathon" },
  ]},
  { pen: PEN.svplay, band: INK.svplay, label: familyName("svplay"), cells: [
    { kind: "numbers" },
    { kind: "picker", emoji: "🌧️", name: "VocabulaRain", sioKey: "vocabularain" },
    // LexicaLocker (Dan, 2026-09-09) — renamed from LexicaLater, 🔐 instead
    // of 🧰: see the registry entry in activities.ts for why.
    { kind: "picker", emoji: "🔐", name: "LexicaLocker", sioKey: "lexicalator" },
  ]},
  // ORAL (NEW, 2026-09-09) — half of retired Skills: the three that put
  // French in your mouth or ear. VoixLà has one page and needs no picker;
  // WorDrill and ÉcouTexte are two more of the seven slider-gated tiles.
  { pen: PEN.oral, band: INK.oral, label: familyName("oral"), cells: [
    { kind: "one", emoji: "🔊", name: "VoixLà", href: "/tts" },
    { kind: "picker", emoji: "🎙️", name: "WorDrill", sioKey: "wordrill" },
    { kind: "picker", emoji: "🎧", name: "ÉcouTexte", sioKey: "ecoutexte" },
  ]},
  // TOOLS (NEW, 2026-09-09) — the other half: the two summonable helpers
  // (see ToolSummon.tsx's own 🛠️ door). ChaTutor is a chat, not a deck, so
  // it keeps a plain link; the third slot is deliberately blank, per Dan's
  // own grid ("ChaT. - Compo. - [Blank]").
  { pen: PEN.tools, band: INK.tools, label: familyName("tools"), cells: [
    { kind: "one", emoji: "🤖", name: "ChaTutor", href: "/tutor" },
    { kind: "picker", emoji: "🧩", name: "ComposeIt", sioKey: "compose" },
    { kind: "blank" },
  ]},
  { pen: GREY, band: GREY_INK, label: familyName("user"), cells: [
    { kind: "one", emoji: "👤", name: "User", href: "/profil" },
    { kind: "one", emoji: "🏆", name: "Leaderboard", href: "/leaderboard" },
    { kind: "one", emoji: "⚙️", name: "Settings", href: "/reglages" },
  ]},
];

const TILE =
  "flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-xl border-2 " +
  "bg-[color:var(--cahier-paper-raised)] px-1 py-1.5 text-center no-underline " +
  "transition hover:-translate-y-0.5";
const NAME = "fluo-btn-hand block w-full truncate text-[13px] leading-tight text-[color:var(--cahier-ink)]";

export default function MenuGrid({
  onNavigate,
  onHelp,
  picker,
}: {
  /** Close the dropdown — called on every door. */
  onNavigate: () => void;
  /** The Help tile summons the quick-guide splash instead of navigating. */
  onHelp: () => void;
  /** Opens the SIO-slider / two-choice pop-ups. Owned by the CALLER
   *  (SiteTopBar), not created here — `onNavigate` closes this whole
   *  component (the ☰ dropdown unmounts it), so any state or modal a picker
   *  cell opens must already live one level up, or it would unmount in the
   *  same tick it opens. */
  picker: ActivityPicker;
}) {
  // Each row is its OWN band, filled SOLID with the family's darkest rung
  // (Dan, 2026-09-09: a pale 15%-alpha wash "is too light... the darkest
  // shade in there for the background" — matching the ink the page's own
  // top strip and left spine already wear). The tiles keep their
  // raised-paper ground on top — pen never behind text, per the colour
  // law above — so the effect is light cards on a solid, saturated band.
  return (
    <div className="w-[20.6rem] max-w-[90vw] overflow-hidden rounded-lg">
      {ROWS.map((row, r) => (
        <div
          key={r}
          className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-1.5 p-1.5"
          style={{ background: row.band }}
        >
          <span className="self-center [writing-mode:vertical-rl] rotate-180 text-[9px] font-bold uppercase tracking-[0.14em] leading-none text-white/80">
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
              return (
                <button key={key} type="button" onClick={() => { onNavigate(); onHelp(); }}
                        className={TILE} style={{ borderColor: row.pen }}>
                  <span aria-hidden className="text-lg leading-none">🆘</span>
                  <span className={NAME}>Help</span>
                </button>
              );
            }
            if (cell.kind === "numbers") {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onNavigate();
                    picker.openTwoChoice(
                      "🔢 Numbers — which game?",
                      { emoji: "🚌", name: "NumBus", href: "/games/numbus" },
                      { emoji: "💰", name: "NumBourse", href: "/games/numbourse" },
                    );
                  }}
                  className={TILE}
                  style={{ borderColor: row.pen }}
                >
                  <span aria-hidden className="text-lg leading-none">🔢</span>
                  <span className={NAME}>NumBus</span>
                </button>
              );
            }
            if (cell.kind === "picker") {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { onNavigate(); picker.openSlider(cell.sioKey, cell.emoji, cell.name); }}
                  className={TILE}
                  style={{ borderColor: row.pen }}
                >
                  <span aria-hidden className="text-lg leading-none">{cell.emoji}</span>
                  <span className={NAME}>{cell.name}</span>
                </button>
              );
            }
            return (
              <Link key={key} href={cell.href} onClick={onNavigate}
                    className={TILE} style={{ borderColor: row.pen }} lang="fr">
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
