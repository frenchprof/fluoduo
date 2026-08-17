"use client";

/**
 * The Home page body (Dan, 2026-07-05: "a true blue Home page… all of the 50
 * SIOs on a single learning path visually — an overview of where you are in
 * the learning journey"). Hero: Bienvenue with the ▶/🔁 icon buttons, the
 * stat pills and the two progress bars. Below it, the COURSE MAP in two
 * views the learner toggles (Dan's decision 1, 2026-08-17): 2D
 * (components/HomeMap — Design's region-band map) and 3D (components/
 * HomeMap3D — the La Carte saga-map treatment). The choice is remembered
 * in localStorage under `fluo.homeMapView`.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import GuideSplash from "@/components/GuideSplash";
import RankBadge from "@/components/RankBadge";
import HomeMap from "@/components/HomeMap";
import HomeMap3D from "@/components/HomeMap3D";
import { SIOS } from "@/content/sios";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent, levelForXp, xpMultiplier } from "@/lib/economy";
import { dueForReview } from "@/lib/reviser";

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

const MAP_VIEW_KEY = "fluo.homeMapView";

export default function HomeDashboard() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [dueCount, setDueCount] = useState(0);
  // Armed on mount: nothing pops up by default (Dan, 2026-07-14), so the
  // FluOlinGo brand animation plays on a clear stage right away.
  const [heroPlay, setHeroPlay] = useState(false);
  // Once the stroke has played, the ink is pinned by class — engines can
  // drop a finished animation's fill state (Dan, 2026-07-14: "the color
  // disappears right after").
  const [inkDone, setInkDone] = useState(false);
  // Quick Guide popup, summoned from the hero button next to the (?) circle
  // (Dan, 2026-07-14: "insert a QuickGuide link where my red arrow points").
  const [qgOpen, setQgOpen] = useState(false);
  // 2D ⇄ 3D map view, remembered per browser.
  const [mapView, setMapView] = useState<"2d" | "3d">("2d");

  useEffect(() => {
    const refresh = () => {
      const p = loadProgress();
      setProgress(p);
      setDueCount(dueForReview(p, Date.now()).length);
    };
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    try {
      if (window.localStorage.getItem(MAP_VIEW_KEY) === "3d") setMapView("3d");
    } catch {
      // storage blocked → 2D
    }

    // The letter-wave + hand-written byline now runs ~3.5 s (compacted from
    // the original 5.5 s when Dan brought it back, 2026-08-11). Play the
    // full show once per browser session; afterwards render the finished
    // look instantly (no .is-play = static letters + written byline;
    // .is-inked pins the highlighter ink).
    try {
      if (window.sessionStorage.getItem("fluolingo:heroPlayed")) {
        setInkDone(true);
      } else {
        window.sessionStorage.setItem("fluolingo:heroPlayed", "1");
        setHeroPlay(true);
      }
    } catch {
      setHeroPlay(true); // storage blocked → just play
    }
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

  const chip = "fluo-mono flex items-center gap-1 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-2 py-0.5 text-xs font-bold text-[color:var(--fluo-ink)]";


  return (
    <>
      {/* The hero, shrunk 303px -> ~99px (patch 25; Dan, 2026-08-11: the
          DrillShell header bar is the reference — thin, static,
          information-only, never a page-dominating hero). What went: the
          "Bienvenue sur FluOlinGo" heading (the shell's wordmark two
          centimetres above it already says so) and the two bordered bars.
          What stays: every progress counter (learner feedback), HELP!,
          and the two actions — grouped IN the card they describe,
          side by side (the button-grouping rule).
          The brand animation came BACK the same day (Dan: "i would rather
          you reduce the size ... than remove it; the ink blob must come
          back") — compacted: one line instead of heading + byline block,
          text-lg instead of text-2xl, the byline at 16px tall beside the
          word, the whole show ~3.5 s instead of 5.5 s. French on purpose:
          the hero is the one place the chrome's English gives way. */}
      <section
        aria-label="Your progress"
        className="mb-7 rounded-2xl border-2 border-[color:var(--fluo-ink)] p-3 shadow-[5px_5px_0_var(--fluo-hl)]"
        style={{ background: "linear-gradient(120deg, #fbe3ec 0%, #def3f5 45%, #ecf7cf 100%)" }}
      >
        {/* Decorative brand line — NOT a heading (the h1 died with patch 25;
            the shell wordmark still brands the page for structure). The word
            does the Kallang Wave, the ink blob sweeps F→o, then « par Dr
            Chan » writes itself, smaller than before, on the same line. */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className="fluo-serif text-lg font-black leading-none text-[color:var(--fluo-ink)]">
            <span
              className={`fluo-brand${heroPlay ? " is-play" : ""}${inkDone ? " is-inked" : ""}`}
              aria-label="FluOlinGo"
              onAnimationEnd={(e) => {
                if (e.animationName === "fluo-brand-hl") setInkDone(true);
              }}
            >
              <span aria-hidden>
                {"FluOlinGo".split("").map((ch, i) => (
                  <span key={i} className="fluo-brand-letter" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          </span>
          <svg
            role="img"
            aria-label="par Dr Chan"
            viewBox="0 0 134 36"
            className={`fluo-byline mt-1 h-4 w-auto${heroPlay ? " is-play" : ""}`}
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
                <path key={i} d={d} pathLength={1} style={{ animationDelay: `${2.0 + i * 0.08}s` }} />
              ))}
            </g>
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Link href="/profil" className={`${chip} hover:-translate-y-0.5 !px-1.5`} title={`Your level — N${lvl.level} · ${lvl.name}`}>
            🎚️ <RankBadge level={lvl.level} name={lvl.name} compact className="text-xs" />
          </Link>
          <span className={chip}>✓ {doneTotal}/{SIOS.length}</span>
          {/* Progressive disclosure (Dan, 2026-07-20: "hide the zeroes until
              they are no longer zero"). */}
          {progress.streak > 0 && (
            <span className={chip} title={mult > 1 ? `Streak active: XP ×${mult}` : "Day streak"}>
              🔥 {progress.streak}{mult > 1 && <b className="text-[color:var(--fluo-danger)]"> ×{mult}</b>}
            </span>
          )}
          {progress.xp > 0 && (
            <Link href="/leaderboard" className={`${chip} hover:-translate-y-0.5`} title="Leaderboard · your rank">⭐ {progress.xp}</Link>
          )}
          {progress.gems > 0 && (
            <Link href="/profil" className={`${chip} hover:-translate-y-0.5`} title="Shop">💎 {progress.gems}</Link>
          )}
          <button
            type="button"
            onClick={() => setQgOpen(true)}
            className="rounded-lg border-2 px-1.5 py-0.5 text-xs font-black shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
            style={{ background: "var(--fluo-ink)", borderColor: "var(--fluo-ink)", color: "#d4f24c" }}
          >
            HELP!
          </button>
        </div>
        {qgOpen && <GuideSplash onClose={() => setQgOpen(false)} />}

        {/* Hairline progress, DrillShell-style: 3px tracks, labels inline —
            information, not furniture. The two actions sit BESIDE the bars
            they act on (▶ continues the course the Cours line measures,
            🔁 reviews it), paired side by side — the button-grouping rule. */}
        <div className="mt-2 flex items-center gap-2.5">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="fluo-mono w-12 shrink-0 text-[10px] font-bold text-[color:var(--fluo-ink)]">Course</span>
              <span
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-[color:var(--fluo-ink)]/15"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 1)}%`, background: accent }} />
              </span>
              <span className="fluo-mono w-8 shrink-0 text-right text-[10px] font-bold text-[color:var(--fluo-ink)]">{pct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="fluo-mono w-12 shrink-0 text-[10px] font-bold text-[color:var(--fluo-ink)]">N{lvl.level}</span>
              <span
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-[color:var(--fluo-ink)]/15"
                role="progressbar"
                aria-valuenow={lvl.into}
                aria-valuemin={0}
                aria-valuemax={lvl.span}
              >
                <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(xpPct, 1)}%`, background: accent }} />
              </span>
              <span className="fluo-mono w-12 shrink-0 text-right text-[10px] font-bold text-[color:var(--fluo-ink)]">{lvl.into}/{lvl.span}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {activeSio && (
              <Link
                href={`/unit/${activeSio.unit}#${activeSio.id}`}
                aria-label="Continue"
                title={`Continue — « ${activeSio.topic} », the next objective after your latest 'done'.`}
                className="flex h-7 w-8 items-center justify-center rounded-lg border-2 text-sm text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                style={{ background: accent, borderColor: accent }}
              >
                <span aria-hidden>▶</span>
              </Link>
            )}
            <Link
              href="/reviser"
              aria-label="DéjàRevu"
              title="DéjàRevu — your words to review"
              className="relative flex h-7 w-8 items-center justify-center rounded-lg border-2 border-[color:var(--fluo-ink)] bg-white/80 text-sm text-[color:var(--fluo-ink)] shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
            >
              <span aria-hidden>🔁</span>
              {dueCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-[var(--fluo-danger)] px-1.5 text-[10px] font-bold text-white">{dueCount}</span>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* Streak momentum (Dan, 2026-07-08, episode model): counts done-in-order
          from the start; a skip simply stops the run — never blocks. */}
      {seqRun >= 2 && seqRun < SIOS.length && (
        <p className="fluo-mono mb-2 text-xs font-black text-[color:var(--fluo-ink)]">🔗 {seqRun} in a row!</p>
      )}

      {/* 2D · 3D — a small segmented control; the map below follows. */}
      <div className="mb-2 flex items-center justify-end">
        <div role="group" aria-label="Map view" className="fluo-mono flex overflow-hidden rounded-lg border-2 text-[11px] font-black" style={{ borderColor: "var(--cahier-ink)" }}>
          {(["2d", "3d"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={mapView === v}
              onClick={() => {
                setMapView(v);
                try {
                  window.localStorage.setItem(MAP_VIEW_KEY, v);
                } catch {
                  // fine — the choice just does not persist
                }
              }}
              className="px-2.5 py-1 leading-none"
              style={{
                background: mapView === v ? "var(--cahier-ink)" : "var(--cahier-paper-raised)",
                color: mapView === v ? "var(--cahier-paper-raised)" : "var(--cahier-ink)",
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {mapView === "3d" ? (
        <HomeMap3D progress={progress} activeId={activeId} accent={accent} />
      ) : (
        <HomeMap progress={progress} activeId={activeId} accent={accent} />
      )}
    </>
  );
}
