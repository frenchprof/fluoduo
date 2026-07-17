"use client";

/**
 * The Home page body (Dan, 2026-07-05: "a true blue Home page… all of the 50
 * SIOs on a single learning path visually — an overview of where you are in
 * the learning journey"). Hero: Bienvenue with the ▶/🔁 icon buttons, the
 * stat pills and the two progress bars. Below it, the continuous ROAD MAP
 * (components/RoadMap): all 55 stops snaking left→right→left like a real
 * road, sized to the screen.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import StatsHelp from "@/components/StatsHelp";
import GuideSplash from "@/components/GuideSplash";
import RankBadge from "@/components/RankBadge";
import RoadMap from "@/components/RoadMap";
import { SIOS } from "@/content/sios";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent, levelForXp, xpMultiplier } from "@/lib/economy";
import { dueForReview } from "@/lib/reviser";

export default function HomeDashboard() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [dueCount, setDueCount] = useState(0);
  // Armed on mount: nothing pops up by default any more (Dan, 2026-07-14),
  // so the FluoLingo brand animation plays on a clear stage right away.
  const [heroPlay, setHeroPlay] = useState(false);
  // Once the stroke has played, the ink is pinned by class — engines can
  // drop a finished animation's fill state (Dan, 2026-07-14: "the color
  // disappears right after").
  const [inkDone, setInkDone] = useState(false);
  // Quick Guide popup, summoned from the hero button next to the (?) circle
  // (Dan, 2026-07-14: "insert a QuickGuide link where my red arrow points").
  const [qgOpen, setQgOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const p = loadProgress();
      setProgress(p);
      setDueCount(dueForReview(p, Date.now()).length);
    };
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);

    setHeroPlay(true);
    return () => {
      window.removeEventListener("fluolingo:progress-updated", refresh);
    };
  }, []);

  // "Continuer" = the first not-done goal AFTER the furthest « done » (Dan,
  // 2026-07-08: a learner who marked a later step done continues from there).
  const activeId = nextSioId(progress);
  const activeSio = SIOS.find((s) => s.id === activeId);
  const doneTotal = SIOS.filter((s) => isSioDone(s.id, progress)).length;
  const pct = Math.round((doneTotal / SIOS.length) * 100);
  // Done-in-order run from the very start — the streak-momentum counter.
  let seqRun = 0;
  for (const s of SIOS) {
    if (isSioDone(s.id, progress)) seqRun++;
    else break;
  }

  // Economy view: level from lifetime XP, the fire multiplier, and the accent
  // colour the learner has equipped (drives the hero CTA + bars).
  const lvl = levelForXp(progress.xp);
  const mult = xpMultiplier(progress.streak);
  const accent = equippedAccent(progress);
  const xpPct = Math.round((lvl.into / lvl.span) * 100);

  const chip = "fluo-mono flex items-center gap-1.5 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-3 py-1 text-sm font-bold text-[color:var(--fluo-ink)]";

/** « par Dr Chan » as pen strokes, in writing order (stem before bowl, the
 *  way a hand actually writes print letters). Baseline y=25, x-height 13,
 *  ascenders 6, descender 32; the italic slant comes from the group skew. */
const BYLINE_STROKES = [
  // p
  "M4,13.5 L4,32",
  "M4,15.5 C6,12.5 12,12.5 12,18.5 C12,24.5 6,24.5 4,21.5",
  // a
  "M23,15 C19,12 15,14.5 15,19 C15,23.5 19,26 23,22.5",
  "M23.5,13.5 L23.5,25",
  // r
  "M30,13.5 L30,25",
  "M30,18 C31,14 34,12.5 36.5,14",
  // D
  "M45,6 L45,25",
  "M45,6 C56,6 58,12 58,15.5 C58,19 56,25 45,25",
  // r
  "M63,13.5 L63,25",
  "M63,18 C64,14 67,12.5 69.5,14",
  // C
  "M87,9 C80,4.5 76,9 76,15.5 C76,22 80,26.5 87,22",
  // h
  "M92,6 L92,25",
  "M92,17.5 C93,13.5 100,12 100,18 L100,25",
  // a
  "M111,15 C107,12 103,14.5 103,19 C103,23.5 107,26 111,22.5",
  "M111.5,13.5 L111.5,25",
  // n
  "M118,13.5 L118,25",
  "M118,17.5 C119,13.5 126,12 126,18 L126,25",
];

  return (
    <>
      <section
        className="mb-7 rounded-2xl border-2 border-[color:var(--fluo-ink)] p-5 shadow-[5px_5px_0_var(--fluo-hl)]"
        style={{ background: "linear-gradient(120deg, #fbe3ec 0%, #def3f5 45%, #ecf7cf 100%)" }}
      >
        {/* ONE row at every width (Dan, 2026-07-08: the réviser icon must sit
            on the same line as Bienvenue, extreme right, smaller) — icons
            only; tooltips and aria-labels carry the words. */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">
            {/* "Bienvenue sur" stays still; FluoLingo performs the Kallang
                Wave, then the fluo highlighter sweeps over it (Dan,
                2026-07-13). Once per page load. */}
            Bienvenue sur{" "}
            <span
              className={`fluo-brand${heroPlay ? " is-play" : ""}${inkDone ? " is-inked" : ""}`}
              aria-label="FluoLingo"
              onAnimationEnd={(e) => {
                if (e.animationName === "fluo-brand-hl") setInkDone(true);
              }}
            >
              <span aria-hidden>
                {"FluoLingo".split("").map((ch, i) => (
                  <span key={i} className="fluo-brand-letter" style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
            {/* No trailing ✨ — on a phone it wrapped onto a line of its own
                (Dan, 2026-07-17: "occupying an entire line"). */}
            {/* Byline (Dan, 2026-07-15) — "written on the spot": each pen
                stroke draws itself and the next letter only starts once the
                previous one is complete. Hand-authored print-italic strokes
                (no cursive faces per the house type rule), starting after
                the ✨ blink. */}
            <span className="mt-0.5 block pl-1">
              <svg
                role="img"
                aria-label="par Dr Chan"
                viewBox="0 0 134 36"
                className={`fluo-byline h-[1.1em] w-auto${heroPlay ? " is-play" : ""}`}
              >
                <g
                  transform="translate(4 0) skewX(-8)"
                  fill="none"
                  stroke="var(--fluo-ink-soft)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {BYLINE_STROKES.map((d, i) => (
                    <path key={i} d={d} pathLength={1} style={{ animationDelay: `${2.8 + i * 0.17}s` }} />
                  ))}
                </g>
              </svg>
            </span>
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            {activeSio && (
              <Link
                href={`/unit/${activeSio.unit}#${activeSio.id}`}
                aria-label="Continuer"
                title={`Continuer — « ${activeSio.topic} », the next objective after your latest 'done'.`}
                className="flex h-8 w-9 items-center justify-center rounded-lg border-2 text-base text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                style={{ background: accent, borderColor: accent }}
              >
                <span aria-hidden>▶</span>
              </Link>
            )}
            <Link
              href="/reviser"
              aria-label="DéjàRevu"
              title="DéjàRevu — vos mots à revoir"
              className="relative flex h-8 w-9 items-center justify-center rounded-lg border-2 border-[color:var(--fluo-ink)] bg-white/80 text-base text-[color:var(--fluo-ink)] shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
            >
              <span aria-hidden>🔁</span>
              {dueCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-[var(--fluo-danger)] px-1.5 text-[10px] font-bold text-white">{dueCount}</span>
              )}
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {/* Compact rank (N5, name in the tooltip) — the spelled-out name
              made the chip row wrap and pushed QuickGuide onto its own line
              (Dan, 2026-07-14). */}
          <Link href="/profil" className={`${chip} hover:-translate-y-0.5 !px-2`} title={`Votre niveau — N${lvl.level} · ${lvl.name}`}>
            🎚️ <RankBadge level={lvl.level} name={lvl.name} compact className="text-xs" />
          </Link>
          <span className={chip}>✓ {doneTotal}/{SIOS.length}</span>
          <span className={chip} title={mult > 1 ? `Série active : XP ×${mult}` : "Série de jours"}>
            🔥 {progress.streak}{mult > 1 && <b className="text-[color:var(--fluo-danger)]"> ×{mult}</b>}
          </span>
          {/* XP is exactly what the leaderboard ranks — the chip IS the way
              to the Classement. */}
          <Link href="/leaderboard" className={`${chip} hover:-translate-y-0.5`} title="Classement · votre rang">⭐ {progress.xp}</Link>
          <Link href="/profil" className={`${chip} hover:-translate-y-0.5`} title="Boutique">💎 {progress.gems}</Link>
          <StatsHelp />
          <button
            type="button"
            onClick={() => setQgOpen(true)}
            className="rounded-lg border-2 px-3 py-1 text-sm font-black shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
            style={{ background: "var(--fluo-ink)", borderColor: "var(--fluo-ink)", color: "#d4f24c" }}
          >
            HELP!
          </button>
        </div>
        {qgOpen && <GuideSplash onClose={() => setQgOpen(false)} />}

        {/* Two bars: overall course completion, and XP into the current level. */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="fluo-mono w-16 shrink-0 text-xs font-bold text-[color:var(--fluo-ink)]">Cours</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75">
              <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%`, background: accent }} />
            </span>
            <span className="fluo-mono w-10 shrink-0 text-right text-xs font-bold text-[color:var(--fluo-ink)]">{pct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="fluo-mono w-16 shrink-0 text-xs font-bold text-[color:var(--fluo-ink)]">Niveau {lvl.level}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75">
              <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(xpPct, 2)}%`, background: accent }} />
            </span>
            <span className="fluo-mono w-14 shrink-0 text-right text-xs font-bold text-[color:var(--fluo-ink)]">{lvl.into}/{lvl.span}</span>
          </div>
        </div>
      </section>

      {/* Streak momentum (Dan, 2026-07-08, episode model): counts done-in-order
          from the start; a skip simply stops the run — never blocks. */}
      {seqRun >= 2 && seqRun < SIOS.length && (
        <p className="fluo-mono mb-2 text-xs font-black text-[color:var(--fluo-ink)]">🔗 {seqRun} d&rsquo;affilée !</p>
      )}

      <RoadMap progress={progress} activeId={activeId} accent={accent} />
    </>
  );
}
