"use client";

/**
 * The Home page body (Dan, 2026-07-05: "a true blue Home page… all of the 50
 * SIOs on a single learning path visually — an overview of where you are in
 * the learning journey"). Hero: Bienvenue over ONE row of five equal cells —
 * two marks then three round actions (› Continue · 🔖 Review · ▦ Menu), the
 * three that depend on who you are; the Map postcard sits below. Continue
 * wears › and never ▶ (2026-08-21, one glyph one job). The COURSE MAP moved to its own
 * page, /map (Dan, 2026-08-21: a finger scrolling the page kept catching
 * the map instead) — Home links there with one card, and forwards the old
 * `/?unit=N#SIO-0XX` deep links so printed QR codes and bookmarks survive.
 */
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import MenuSplash from "@/components/MenuSplash";
import HomeMap from "@/components/HomeMap";
import { SIOS } from "@/content/sios";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent, xpMultiplier } from "@/lib/economy";
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


export default function HomeDashboard() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
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
  // The Review button's count — the one destination on Home with a deadline.
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const p = loadProgress();
      setProgress(p);
      setDueCount(dueForReview(p, Date.now()).length);
    };
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    // The map lives at /map now — forward its old deep links (`/?unit=N`
    // and/or `#SIO-0XX`) so printed QR codes and bookmarks keep working.
    const q = new URLSearchParams(window.location.search).get("unit");
    const hash = window.location.hash.replace("#", "");
    const isSio = SIOS.some((s) => s.id === hash);
    if (isSio || (q !== null && /^[0-4]$/.test(q))) {
      window.location.replace(`/map${window.location.search}${window.location.hash}`);
      return;
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

  // The fire multiplier and the accent colour the learner has equipped
  // (drives the hero CTA).
  const mult = xpMultiplier(progress.streak);
  const accent = equippedAccent(progress);

  // TWO marks only (Dan, 2026-08-21, decluttering — everything else can be
  // derived and lives on /moi and /profil):
  //   course — the page's subject; ONE form, the fraction (it matches the
  //            50-stop map; the % is one hover away in the tooltip)
  //   streak — the only mark with a deadline, and the ×XP multiplier must
  //            stay visible or the bonus stops motivating
  const MARKS: { label: string; value: ReactNode; title: string; role?: "win" | "streak" }[] = [
    { label: "course", role: "win", value: `${doneTotal}/${SIOS.length}`, title: `${pct}% of the course — ${doneTotal} of ${SIOS.length} objectives done` },
    {
      label: "streak",
      role: "streak" as const,
      value: (
        <>
          {progress.streak}
          {mult > 1 && <b className="text-[color:var(--dopa-streak-ink)]">×{mult}</b>}
        </>
      ),
      title: mult > 1 ? `Day streak — XP ×${mult}` : "Day streak",
    },
  ];


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

        {/* ONE row, FIVE equal cells (Dan, 2026-08-21: "since there were 5
            stats, and now 2 stats + 3 buttons, can't they all occupy the same
            horizontal space?"). Two marks, then the three actions that depend
            on WHO YOU ARE and how far you have got — Continue knows your next
            objective, Review carries your due count, Menu opens all twenty
            activities. Everything that is the same for every learner lives in
            the bottom bar instead. `flex-[2]` / `flex-[3]` split the row into
            fifths, so a mark cell and a button cell are the same width. */}
        <div
          className="flex items-stretch border-t-2 px-3 py-2"
          style={{ borderColor: "var(--fluo-ink)", background: "var(--cahier-paper-raised)" }}
        >
          <dl className="flex min-w-0 flex-[2] items-stretch">
            {MARKS.map((m, i) => (
              <div
                key={m.label}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center px-0.5 py-0.5 text-center sm:px-2${i ? " border-l" : ""}`}
                style={i ? { borderColor: "var(--cahier-line)" } : undefined}
                title={m.title}
              >
                <dt className="sr-only">{m.label}</dt>
                {/* Colour the two marks that survived round 12 (COLOR_REVIEW
                    §11.5): course takes the growth role, the streak takes its
                    own. Both -ink variants clear 5.2:1 on paper. The labels
                    stay ink — if everything is coloured, nothing is. */}
                <dd
                  className="fluo-mono truncate max-w-full text-[11px] font-black leading-tight tracking-tight sm:text-sm sm:tracking-normal"
                  style={{ color: m.role ? `var(--dopa-${m.role}-ink)` : "var(--fluo-ink)" }}
                >
                  {m.value}
                </dd>
                <span aria-hidden className="fluo-mono mt-0.5 truncate max-w-full text-[9px] font-bold uppercase tracking-wide text-[color:var(--cahier-ink-soft)] sm:text-[10px]">
                  {m.label}
                </span>
              </div>
            ))}
          </dl>

          {/* One family: identical geometry and ink border on all three (Dan,
              2026-08-21) — only the FILL carries hierarchy. Continue wears ›,
              never ▶: the triangle means a voice is about to speak. */}
          <div className="flex min-w-0 flex-[3] items-stretch">
            {activeSio && (
              <div className="flex min-w-0 flex-1 items-center justify-center border-l px-0.5" style={{ borderColor: "var(--cahier-line)" }}>
                <Link
                  href={`/unit/${activeSio.unit}#${activeSio.id}`}
                  aria-label="Continue"
                  title={`Continue — « ${activeSio.topic} », the next objective after your latest 'done'.`}
                  className="fluo-mono flex h-9 w-9 items-center justify-center rounded-full border-2 pb-0.5 text-lg font-black leading-none text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                  style={{ background: accent, borderColor: "var(--fluo-ink)" }}
                >
                  <span aria-hidden>›</span>
                </Link>
              </div>
            )}
            <div className="flex min-w-0 flex-1 items-center justify-center border-l px-0.5" style={{ borderColor: "var(--cahier-line)" }}>
              <Link
                href="/reviser"
                aria-label={dueCount > 0 ? `DéjàRevu — ${dueCount} due` : "DéjàRevu"}
                title="DéjàRevu — your words to review"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                style={{ borderColor: "var(--fluo-ink)", background: "var(--cahier-paper)", color: "var(--fluo-ink)" }}
              >
                <span aria-hidden>🔖</span>
                {/* Words waiting to be reviewed are WORK, not failure. In
                    --fluo-danger this read as an error badge; it takes the
                    primary-action role instead (white on it, 4.51:1). */}
                {dueCount > 0 && (
                  <span
                    className="absolute -right-2 -top-2 rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{ background: "var(--dopa-focus)" }}
                  >
                    {dueCount}
                  </span>
                )}
              </Link>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-center border-l px-0.5" style={{ borderColor: "var(--cahier-line)" }}>
              <button
                type="button"
                onClick={() => setQgOpen(true)}
                aria-label="Menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                style={{ background: "var(--fluo-ink)", borderColor: "var(--fluo-ink)", color: "var(--cahier-hl)" }}
                title="Menu — every activity, one tap away"
              >
                <span aria-hidden>▦</span>
              </button>
            </div>
          </div>
        </div>
        {qgOpen && <MenuSplash onClose={() => setQgOpen(false)} />}
      </section>

      {/* Streak momentum (Dan, 2026-07-08, episode model): counts done-in-order
          from the start; a skip simply stops the run — never blocks. */}
      {seqRun >= 2 && seqRun < SIOS.length && (
        <p className="fluo-mono mb-2 text-xs font-black text-[color:var(--fluo-ink)]">🔗 {seqRun} in a row!</p>
      )}

      {/* 🗺️ The Map as a POSTCARD (Dan, 2026-08-21): a read-only snapshot
          of the learner's stretch of the course — the course mark, drawn.
          Inert on purpose (pointer-events off): a finger can't catch it, a
          tap anywhere is the door to the real map on /map. */}
      {/* The snapshot contains the map's own links, so the door to /map is
          a STRETCHED sibling link over the top — an <a> may not contain an
          <a>. `inert` keeps the frozen map's controls out of the tab order
          and the a11y tree. */}
      <div
        className="relative mt-2 overflow-hidden rounded-2xl border-2 transition hover:-translate-y-0.5"
        style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)", boxShadow: "var(--shadow-card)" }}
      >
        <div inert aria-hidden className="pointer-events-none select-none">
          <HomeMap progress={progress} activeId={activeId} accent={accent} postcard />
        </div>
        <span className="flex items-center gap-2 border-t-2 px-4 py-2.5" style={{ borderColor: "var(--cahier-ink)" }}>
          <span aria-hidden className="text-xl">🗺️</span>
          <span lang="fr" className="fluo-serif min-w-0 flex-1 text-lg font-black leading-tight text-[color:var(--fluo-ink)]">The Map</span>
          <span className="fluo-mono text-xs font-black text-[color:var(--fluo-ink)]/70">2D · 3D</span>
          <span aria-hidden className="fluo-mono text-xl font-black text-[color:var(--fluo-ink)]">›</span>
        </span>
        <Link href="/map" aria-label="The Map — open the course map" className="absolute inset-0 z-10" />
      </div>
    </>
  );
}
