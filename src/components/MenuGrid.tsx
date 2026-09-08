"use client";

/**
 * The ☰ menu as Dan drew it (7 Sep, with a screenshot): a 3×5 grid of
 * bordered tiles — four activity rows wearing their family's pen, then
 * Help · User · Leaderboard. *"I think we can replace the burger menu that
 * comes down like this with this 3x5 grid instead (use the name NumBus
 * instead of Numbers to match the other names). In the last row, we can
 * have: Help + User + LeaderBoard."*
 *
 * THE PICTURE IS THE SPEC, tile for tile — including its two double cells
 * (VoixLà + WorDrill share one, ChaTutor + ComposeIt share one; each half
 * is its own door). ConjugaZone sits on the BLUE row as drawn, and since
 * "ConjugaZone will henceforth sit in Blue" (Dan, same day) the registry
 * files it under review too — drawing and registry agree.
 *
 * Colour law: the family PEN is the border, the label stays ink, the tile
 * ground is raised paper — pen never behind text.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { familyName } from "@/content/activities";

const PEN = {
  practice: "#fcdf00",
  review: "#1ca6ff",
  svplay: "#ff4eb2",
  skills: "#b17eff",
  ink: "var(--cahier-ink)",
} as const;

type Cell =
  | { kind: "one"; emoji: string; name: string; href: string }
  | { kind: "two"; a: { emoji: string; name: string; href: string }; b: { emoji: string; name: string; href: string } }
  | { kind: "help" };

// Each row wears a NAME at its start — "(very subtly!) label each row at the
// start to identify what each row is about" (Dan, 7 Sep, picking over the
// bare grid). The four family rows take their family's own display name so a
// rename in FAMILIES carries here; the last row is the User family's.
const ROWS: { pen: string; label: string; cells: Cell[] }[] = [
  { pen: PEN.practice, label: familyName("practice"), cells: [
    { kind: "one", emoji: "💡", name: "SpecuLearn", href: "/practice/speculearn" },
    { kind: "one", emoji: "📚", name: "MneMemo", href: "/practice" },
    { kind: "one", emoji: "🃏", name: "MémoiRecall", href: "/practice/flip-it" },
  ]},
  { pen: PEN.review, label: familyName("review"), cells: [
    { kind: "one", emoji: "🔤", name: "ConjugaZone", href: "/conjugaison" },
    { kind: "one", emoji: "🔖", name: "DéjàRevu", href: "/reviser" },
    { kind: "one", emoji: "🏃", name: "GramMarathon", href: "/practice/grammarathon" },
  ]},
  { pen: PEN.svplay, label: familyName("svplay"), cells: [
    { kind: "one", emoji: "🔢", name: "NumBus", href: "/games/numbers" },
    { kind: "one", emoji: "🌧️", name: "VocabulaRain", href: "/games/vocabularain" },
    { kind: "one", emoji: "🧰", name: "LexicaLater", href: "/games/lexicalater" },
  ]},
  { pen: PEN.skills, label: familyName("skills"), cells: [
    { kind: "two", a: { emoji: "🔊", name: "VoixLà", href: "/tts" }, b: { emoji: "🎙️", name: "WorDrill", href: "/practice/wordrill" } },
    { kind: "one", emoji: "🎧", name: "ÉcouTexte", href: "/practice/ecoutexte" },
    { kind: "two", a: { emoji: "🤖", name: "ChaTutor", href: "/tutor" }, b: { emoji: "🧩", name: "ComposeIt", href: "/games/compose" } },
  ]},
  { pen: PEN.ink, label: familyName("user"), cells: [
    { kind: "help" },
    { kind: "one", emoji: "👤", name: "User", href: "/profil" },
    { kind: "one", emoji: "🏆", name: "Leaderboard", href: "/leaderboard" },
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
}: {
  /** Close the dropdown — called on every door. */
  onNavigate: () => void;
  /** The Help tile summons the quick-guide splash instead of navigating. */
  onHelp: () => void;
}) {
  const router = useRouter();
  const go = (href: string) => { onNavigate(); router.push(href); };
  return (
    // Each row is its OWN band, washed in the family's pen at low opacity —
    // "the burger menu should have background in the same hue as the family"
    // (Dan). The tiles keep their raised-paper ground (pen never behind
    // text, per the colour law above); it's the band BEHIND the row, not
    // the tiles, that now carries the hue. `pen + "26"` = ~15% alpha on a
    // hex colour — enough to read as a wash, not enough to fight the tile
    // borders drawn in the same pen.
    <div className="w-[20.6rem] max-w-[90vw] overflow-hidden rounded-lg">
      {ROWS.map((row, r) => (
        <div
          key={r}
          className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-1.5 p-1.5"
          style={{ background: `${row.pen}26` }}
        >
          <span className="self-center [writing-mode:vertical-rl] rotate-180 text-[9px] font-bold uppercase tracking-[0.14em] leading-none text-[color:var(--cahier-ink-faint)]">
            {row.label}
          </span>
          {row.cells.map((cell, c) => {
            const key = `${r}-${c}`;
            if (cell.kind === "help") {
              return (
                <button key={key} type="button" onClick={() => { onNavigate(); onHelp(); }}
                        className={TILE} style={{ borderColor: row.pen }}>
                  <span aria-hidden className="text-lg leading-none">❓</span>
                  <span className={NAME}>Help</span>
                </button>
              );
            }
            if (cell.kind === "two") {
              return (
                <div key={key} className={`${TILE} !flex-row gap-1 px-0.5`} style={{ borderColor: row.pen }}>
                  {[cell.a, cell.b].map((half) => (
                    <button key={half.name} type="button" onClick={() => go(half.href)}
                            className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
                      <span aria-hidden className="text-lg leading-none">{half.emoji}</span>
                      <span className={`${NAME} text-[11.5px]`}>{half.name}</span>
                    </button>
                  ))}
                </div>
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
