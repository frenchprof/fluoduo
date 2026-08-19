"use client";

/**
 * The Home page body (Dan, 2026-07-05: "a true blue Home page… all of the 50
 * SIOs on a single learning path visually — an overview of where you are in
 * the learning journey"). Hero: Bienvenue with the ▶/🔁 icon buttons, the
 * stat pills and the two progress bars. Below it, the COURSE MAP in two
 * views the learner toggles (Dan's decision 1, 2026-08-17): 2D
 * (components/HomeMap — Design's region-band map) and 3D (components/
 * HomeMap3D — a CSS-3D perspective road scene). The choice is remembered
 * in localStorage under `fluo.homeMapView`.
 */
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import GuideSplash from "@/components/GuideSplash";
import HomeMap from "@/components/HomeMap";
import HomeMap3D from "@/components/HomeMap3D";
import HomePrintSheet from "@/components/HomePrintSheet";
import UnitSection from "./UnitSection";
import { CHAPTERS } from "@/content/chapters";
import { SIOS, UNIT_META } from "@/content/sios";
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
  // The unit whose SIO list is open under the map (patch 25: /unit/N is a
  // deep link into Home — `/?unit=N#SIO-0XX` lands here, scrolls the map to
  // that region band and shows the unit's list; a stop tap opens its SIO).
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  const [openSioId, setOpenSioId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

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
    // Deep link: /?unit=N (from the old /unit/N page) and/or #SIO-0XX.
    const readUrl = () => {
      const q = new URLSearchParams(window.location.search).get("unit");
      const hash = window.location.hash.replace("#", "");
      const sio = SIOS.find((s) => s.id === hash);
      const u = sio ? sio.unit : q !== null && /^[0-4]$/.test(q) ? Number(q) : null;
      if (u !== null) setOpenUnit(u);
      if (sio) setOpenSioId(sio.id);
    };
    readUrl();
    window.addEventListener("hashchange", readUrl);
    window.addEventListener("popstate", readUrl);

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
      window.removeEventListener("hashchange", readUrl);
      window.removeEventListener("popstate", readUrl);
    };
  }, []);

  // A deep-linked unit brings the MAP to the top of the screen (its box
  // lands on that region band; the unit's list follows right under it).
  useEffect(() => {
    if (openUnit === null || openSioId) return; // a stop tap opens a modal — no scroll needed
    mapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [openUnit, openSioId]);

  const openSio = (unit: number, id: string) => {
    setOpenUnit(unit);
    setOpenSioId(id);
    try {
      window.history.replaceState(null, "", `/?unit=${unit}#${id}`);
    } catch {
      // fine — the modal still opens
    }
  };
  const showUnit = (unit: number) => {
    setOpenSioId(null);
    setOpenUnit(unit);
    try {
      window.history.replaceState(null, "", `/?unit=${unit}`);
    } catch {
      // fine
    }
  };

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

  // The report card's row of marks, left to right. Order is the learner's
  // own reading order: who am I, am I turning up, how far through, what have
  // I earned, how much is done. Values only — the label under each figure is
  // what makes it readable, so it is not decoration.
  const MARKS: { label: string; value: ReactNode; title: string }[] = [
    { label: "level", value: `N${lvl.level}`, title: `Your level — N${lvl.level} · ${lvl.name}` },
    {
      label: "streak",
      value: (
        <>
          {progress.streak}
          {mult > 1 && <b className="text-[color:var(--fluo-danger)]">×{mult}</b>}
        </>
      ),
      title: mult > 1 ? `Day streak — XP ×${mult}` : "Day streak",
    },
    { label: "course", value: `${pct}%`, title: `${doneTotal} of ${SIOS.length} objectives done` },
    // 1000 → "1k": the mark has to survive a 390px phone, and the exact
    // figure is one tap away in the tooltip.
    { label: "XP", value: `${lvl.into}/${lvl.span >= 1000 ? `${Math.round(lvl.span / 100) / 10}k` : lvl.span}`, title: `${progress.xp} XP in total — ${lvl.span - lvl.into} to N${lvl.level + 1}` },
    { label: "lessons", value: `${doneTotal}/${SIOS.length}`, title: "Objectives you have marked done" },
  ];
  // Gems are a shop currency, not a mark, so they join the row only once
  // earned — the five academic marks are always present (a report card with
  // missing columns reads as broken), but 💎 0 on day one read as a reproach
  // (Dan, 2026-07-20). Kept on the card rather than dropped: it is still a
  // progress counter, and Home is where the learner sees it.
  if (progress.gems > 0) {
    MARKS.push({ label: "gems", value: `${progress.gems}`, title: "Gems — spend them in the shop" });
  }


  return (
    <>
      {/* The REPORT CARD hero (Dan, 2026-08-19: "minimalist, no status bar,
          a bit like a report card but horizontally"; Design's "FluOlinGo Home
          standalone" ref). This REVERSES the 11 Aug hero shrink — Dan's call,
          made from the Design reference twice over.
          What went: the two hairline progress bars ("no status bar") and the
          chip rail. What came back: the « Bienvenue sur FluOlinGo » heading
          with its brand animation and written byline.
          What arrived: one horizontal strip of figures — value over label,
          hairline dividers between — read across like a report card's row of
          marks. Every cell is a progress counter, which Dan's litmus test
          keeps as learner feedback; the labels ARE the text that lets you
          read the figure, so they stay.
          Zeroes are NOT hidden here (the 20 Jul progressive-disclosure rule
          applied to the chip rail, where a zero chip read as a reproach): a
          report card with missing columns reads as broken, and the Design
          ref shows 0% and 0/51 on purpose. Gems stay off the card — a shop
          currency is not a mark; /profil still carries it. */}
      <section
        aria-label="Your progress"
        className="mb-7 overflow-hidden rounded-2xl border-2 shadow-[5px_5px_0_var(--fluo-hl)]"
        style={{ borderColor: "var(--fluo-ink)", background: "var(--cahier-paper)" }}
      >
        {/* Heading — the h1 is back. The word does the Kallang Wave, the ink
            blob sweeps F→o, then « par Dr Chan » writes itself beneath. */}
        <div
          className="px-4 pb-3 pt-3.5"
          style={{ background: "linear-gradient(120deg, var(--cahier-accent-soft) 0%, var(--cahier-paper-2) 45%, var(--cahier-hl) 100%)" }}
        >
          <h1 className="fluo-serif text-2xl font-black leading-none text-[color:var(--fluo-ink)]">
            <span className="whitespace-nowrap">Bienvenue sur</span>{" "}
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
          </h1>
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

        {/* The row of marks. Scrolls sideways on a narrow phone rather than
            wrapping — a report card's row stays a row. */}
        <div
          className="flex flex-wrap items-stretch gap-y-1.5 border-t-2 px-3 py-2"
          style={{ borderColor: "var(--fluo-ink)", background: "var(--cahier-paper-raised)" }}
        >
          <dl className="flex w-full min-w-0 items-stretch sm:w-auto sm:flex-1">
            {MARKS.map((m, i) => (
              <div
                key={m.label}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center px-0.5 py-0.5 text-center sm:px-2${i ? " border-l" : ""}`}
                style={i ? { borderColor: "var(--cahier-line)" } : undefined}
                title={m.title}
              >
                <dt className="sr-only">{m.label}</dt>
                <dd className="fluo-mono truncate max-w-full text-[11px] font-black leading-tight tracking-tight text-[color:var(--fluo-ink)] sm:text-sm sm:tracking-normal">
                  {m.value}
                </dd>
                <span aria-hidden className="fluo-mono mt-0.5 truncate max-w-full text-[9px] font-bold uppercase tracking-wide text-[color:var(--cahier-ink-soft)] sm:text-[10px]">
                  {m.label}
                </span>
              </div>
            ))}
          </dl>

          {/* The two actions, round like the Design ref, still grouped in the
              card they describe. HELP! keeps its ink-on-fluo look. */}
          <div className="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto sm:border-l sm:pl-2.5" style={{ borderColor: "var(--cahier-line)" }}>
            {activeSio && (
              <Link
                href={`/unit/${activeSio.unit}#${activeSio.id}`}
                aria-label="Continue"
                title={`Continue — « ${activeSio.topic} », the next objective after your latest 'done'.`}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                style={{ background: accent, borderColor: accent }}
              >
                <span aria-hidden>▶</span>
              </Link>
            )}
            <Link
              href="/reviser"
              aria-label="DéjàRevu"
              title="DéjàRevu — your words to review"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
              style={{ borderColor: "var(--fluo-ink)", background: "var(--cahier-paper)", color: "var(--fluo-ink)" }}
            >
              <span aria-hidden>🔁</span>
              {dueCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-[var(--fluo-danger)] px-1.5 text-[10px] font-bold text-white">{dueCount}</span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setQgOpen(true)}
              aria-label="Help"
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
              style={{ background: "var(--fluo-ink)", borderColor: "var(--fluo-ink)", color: "var(--cahier-hl)" }}
            >
              ?
            </button>
          </div>
        </div>
        {qgOpen && <GuideSplash onClose={() => setQgOpen(false)} />}
      </section>

      {/* Streak momentum (Dan, 2026-07-08, episode model): counts done-in-order
          from the start; a skip simply stops the run — never blocks. */}
      {seqRun >= 2 && seqRun < SIOS.length && (
        <p className="fluo-mono mb-2 text-xs font-black text-[color:var(--fluo-ink)]">🔗 {seqRun} in a row!</p>
      )}

      {/* 2D · 3D — a small segmented control; the map below follows. */}
      <div ref={mapRef} className="mb-2 flex scroll-mt-3 items-center justify-end">
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
        <HomeMap3D progress={progress} activeId={activeId} accent={accent} focusUnit={openUnit ?? undefined} onOpenUnit={showUnit} onOpenSio={openSio} />
      ) : (
        <HomeMap progress={progress} activeId={activeId} accent={accent} focusUnit={openUnit ?? undefined} onOpenUnit={showUnit} onOpenSio={openSio} />
      )}

      {/* The unit's SIO list, inline under the map — what the old /unit/N
          page showed (chapter card + UnitSection + the next-chapter tease).
          Opens from a region pill, a unit chip, a stop, or the deep link. */}
      {openUnit !== null && (
        <div id={`unit-list-${openUnit}`} className={`fluo-h-${openUnit % 6} mt-6 scroll-mt-4`}>
          <div className="mb-3 flex items-start gap-2 rounded-2xl border-2 px-4 py-3" style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}>
            <div className="min-w-0 flex-1">
              <p lang="fr" className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)]">
                {UNIT_META[openUnit]?.emoji} {CHAPTERS[openUnit]?.scenario}
              </p>
              <p lang="fr" className="text-sm font-bold text-[color:var(--fluo-ink)]/70">{CHAPTERS[openUnit]?.tagline}</p>
            </div>
            <button
              type="button"
              aria-label="Close unit"
              onClick={() => {
                setOpenUnit(null);
                setOpenSioId(null);
                try {
                  window.history.replaceState(null, "", "/");
                } catch {
                  // fine
                }
              }}
              className="fluo-mono rounded-lg border-2 px-2 py-0.5 text-xs font-black text-[color:var(--fluo-ink)]"
              style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card)" }}
            >
              ✕
            </button>
          </div>
          <UnitSection
            key={openUnit}
            unit={openUnit}
            openSioId={openSioId}
            onSioClosed={() => {
              setOpenSioId(null);
              try {
                window.history.replaceState(null, "", `/?unit=${openUnit}`);
              } catch {
                // fine
              }
            }}
          />
          {CHAPTERS[openUnit]?.cliffhanger && openUnit < 4 && (
            <button
              type="button"
              onClick={() => showUnit(openUnit + 1)}
              className="mt-4 block w-full rounded-2xl border-2 border-dashed px-4 py-3 text-left text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
              style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
            >
              <span lang="fr">👀 {CHAPTERS[openUnit].cliffhanger}</span>
            </button>
          )}
        </div>
      )}
      <HomePrintSheet progress={progress} />
    </>
  );
}
