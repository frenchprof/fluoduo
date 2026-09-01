"use client";

/**
 * The Home page body — SOFT 3D (Dan's draft, 2026-08-26).
 *
 * Two surfaces do all the work of the old card: the two readings are WELLS
 * pressed into the paper, the three actions are PILLOWS standing out of it,
 * and pressing one sinks it into its own well. Light falls from the top left
 * throughout. No borders anywhere — depth carries the affordance, so nothing
 * needs a label to say it is pressable.
 *
 * What the draft removed and why: the card around the greeting (the welcome
 * is a strip now, edge to edge in the four dopamine hues), and the ruler —
 * "the map already shows where you are; a second progress line was saying it
 * twice."
 *
 * STOP BEFORE ACTIVITY (Dan, same day): "one must first choose the stop
 * before they can access the activity." The nine-square key therefore opens
 * the activities OF THE CURRENT STOP (StopSheet), not the old twenty-tile
 * Menu — which asked "which activity?" before the learner had been asked
 * "which stop?", and then had to ask again.
 *
 * The Map postcard, matted and inert, still sits below; the COURSE MAP still
 * lives at /map, and the old `/?unit=N#SIO-0XX` deep links are still
 * forwarded so printed QR codes and bookmarks survive.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import StopSheet from "@/components/StopSheet";
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
  // FluOLinGo brand animation plays on a clear stage right away.
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
    // Progress, the due-count and the once-per-session hero flag live in
    // local/sessionStorage, which cannot be read during render (the site is
    // statically exported) — this mount effect has to seed that state.
    // Block-disabled: the rule reports only the first setState it meets, and
    // which one that is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
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
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      window.removeEventListener("fluolingo:progress-updated", refresh);
    };
  }, []);

  // "Continuer" = the first not-done goal AFTER the furthest « done » (Dan,
  // 2026-07-08: a learner who marked a later step done continues from there).
  const activeId = nextSioId(progress);
  const activeSio = SIOS.find((s) => s.id === activeId);
  const doneTotal = SIOS.filter((s) => isSioDone(s.id, progress)).length;
  // Done-in-order run from the very start — the streak-momentum counter.
  let seqRun = 0;
  for (const s of SIOS) {
    if (isSioDone(s.id, progress)) seqRun++;
    else break;
  }

  // The fire multiplier and the accent colour the learner has equipped
  // (drives the hero CTA).
  const mult = xpMultiplier(progress.streak);
  // The stop NUMBER (SIO-007 -> 7) and which unit it sits in — the two
  // figures the wells show. Falls back to the last stop when everything
  // is done, so the reading never blanks.
  const stopNo = activeSio ? Number(activeSio.id.slice(4, 7)) : SIOS.length;
  const activeUnit = activeSio ? activeSio.unit : 4;
  const accent = equippedAccent(progress);


  return (
    <>
      {/* The REPORT CARD hero (Dan, 2026-08-19: "minimalist, no status bar,
          a bit like a report card but horizontally"; Design's "FluOLinGo Home
          standalone" ref). This REVERSES the 11 Aug hero shrink — Dan's call,
          made from the Design reference twice over.
          What went: the two hairline progress bars ("no status bar") and the
          chip rail. What came back: the « Bienvenue sur FluOLinGo » heading
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
      {/* ── the welcome strip ─────────────────────────────────────────
          Edge to edge, no box: the draft took the card off and let the four
          dopamine hues run the full width under the top bar. The heading and
          byline are INK on the strip, so nothing depends on the gradient for
          contrast. The brand animation and the written « par Dr Chan » are
          unchanged — they play once per browser session. */}
      {/* -mt-7 swallows the wrapper's pt-2 (8px) and the foolscap's py-5 top
          (20px) so the gradient meets the paper's top edge — the strip already
          bled sideways, and the band of ruled paper above it said nothing
          (Dan, 2026-08-31: "is this spacing absolutely needed or can it be
          closed up?"). The 10px of desk between the bar and the paper stays:
          that is the notebook, not a gap. */}
      <section aria-label="Welcome" className="home-strip -mx-4 -mt-7 mb-5 px-4 py-3 sm:-mx-6 sm:px-6">
        <h1 className="fluo-serif text-2xl font-black leading-none text-[color:var(--fluo-ink)]">
          <span className="whitespace-nowrap">Bienvenue sur</span>{" "}
          <span
            className={`fluo-brand${heroPlay ? " is-play" : ""}${inkDone ? " is-inked" : ""}`}
            aria-label="FluOLinGo"
            onAnimationEnd={(e) => {
              if (e.animationName === "fluo-brand-hl") setInkDone(true);
            }}
          >
            <span aria-hidden>
              {"FluOLinGo".split("").map((ch, i) => (
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
            stroke="var(--fluo-ink)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {BYLINE_STROKES.map((d, i) => (
              <path key={i} d={d} pathLength={1} style={{ animationDelay: `${2.0 + i * 0.08}s` }} />
            ))}
          </g>
        </svg>
      </section>

      {/* ── two wells, three keys ──────────────────────────────────────
          No card. The readings are pressed IN (read-only by construction —
          no hover, nothing to press), the actions stand OUT. That contrast
          is the whole instruction set. */}
      <div className="mb-3 flex items-center justify-between gap-2 sm:gap-3">
        <dl className="flex min-w-0 items-stretch gap-2">
          {/* WHERE YOU ARE. One figure, and five dots for the five units —
              the draft's replacement for the ruler it deleted. */}
          <div className="neo-well flex min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 sm:min-w-[80px] sm:px-3">
            <dt className="sr-only">Stop</dt>
            <dd className="cahier-hand text-[20px] leading-none text-[color:var(--cahier-ink)] [font-variant-numeric:tabular-nums] sm:text-[23px]">
              {stopNo}<span className="text-sm text-[color:var(--cahier-ink-soft)]">/{SIOS.length}</span>
            </dd>
            <span aria-hidden className="fluo-mono text-[9.5px] font-extrabold uppercase tracking-[0.09em] text-[color:var(--cahier-ink-soft)]">
              Stop
            </span>
            <span aria-hidden className="mt-0.5 flex gap-[2.5px]">
              {[0, 1, 2, 3, 4].map((u) => (
                <i
                  key={u}
                  className="h-1 w-1 rounded-full"
                  style={{ background: u <= activeUnit ? "var(--dopa-win)" : "var(--cahier-ink)", opacity: u <= activeUnit ? 1 : 0.2 }}
                />
              ))}
            </span>
          </div>
          {/* THE ONE READING WITH A DEADLINE. Greys out at zero — a streak of
              nothing is not a reproach, it is simply not lit yet. */}
          <div className="neo-well flex min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 sm:min-w-[80px] sm:px-3"
               title={mult > 1 ? `Day streak — everything earns ×${mult}` : "Day streak"}>
            <dt className="sr-only">Streak</dt>
            <dd
              className="cahier-hand text-[20px] leading-none [font-variant-numeric:tabular-nums] sm:text-[23px]"
              style={{ color: progress.streak > 0 ? "var(--dopa-streak-ink)" : "var(--cahier-ink-soft)", opacity: progress.streak > 0 ? 1 : 0.55 }}
            >
              {progress.streak}{mult > 1 && <b className="text-sm">×{mult}</b>}
            </dd>
            <span aria-hidden
                  className="fluo-mono text-[9.5px] font-extrabold uppercase tracking-[0.09em]"
                  style={{ color: "var(--cahier-ink-soft)", opacity: progress.streak > 0 ? 1 : 0.55 }}>
              🔥 Streak
            </span>
          </div>
        </dl>

        {/* Three pillows. The FILL is the dopamine role; the depth is the
            affordance. Rewind sinks to a flat well when nothing is due. */}
        <div className="flex shrink-0 items-center gap-2">
          {activeSio && (
            <Link
              href={`/unit/${activeSio.unit}#${activeSio.id}`}
              aria-label={`Continue — ${activeSio.topic}, your stop on the study path`}
              title={`Continue — « ${activeSio.topic} », your stop on the study path`}
              className={`neo-key grid h-[50px] w-[50px] place-items-center rounded-[15px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]${doneTotal === 0 ? " fluo-play-halo" : ""}`}
              style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-win) 55%, white) 0%, var(--dopa-win) 52%, color-mix(in oklab, var(--dopa-win) 70%, black) 100%)" }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
                <path d="M6 3.5 L22 13 L6 22.5 Z" fill="var(--key-ink-win)" stroke="var(--key-ink-win)" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          {dueCount > 0 ? (
            <Link
              href="/reviser"
              aria-label={`Rewind — ${dueCount} to repeat`}
              title="Rewind — repeat the words you missed"
              className="neo-key relative grid h-[50px] w-[50px] place-items-center rounded-[15px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]"
              style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-focus) 55%, white) 0%, var(--dopa-focus) 52%, color-mix(in oklab, var(--dopa-focus) 70%, black) 100%)" }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
                <path d="M12.5 6.5 L12.5 19.5 L3.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M22.5 6.5 L22.5 19.5 L13.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
              </svg>
              <span className="fluo-mono absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white [font-variant-numeric:tabular-nums]"
                    style={{ background: "var(--cahier-ink)" }}>
                {dueCount}
              </span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              title="Rewind — nothing waiting to be repeated"
              className="neo-key grid h-[50px] w-[50px] place-items-center rounded-[15px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]"
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden style={{ opacity: 0.4 }}>
                <path d="M12.5 6.5 L12.5 19.5 L3.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M22.5 6.5 L22.5 19.5 L13.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          <button
            type="button"
            onClick={() => setQgOpen(true)}
            disabled={!activeSio?.collectionId}
            aria-label="All activities at this stop"
            title="Every activity available at your stop"
            className="neo-key grid h-[50px] w-[50px] place-items-center rounded-[15px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]"
            style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-reward) 55%, white) 0%, var(--dopa-reward) 52%, color-mix(in oklab, var(--dopa-reward) 70%, black) 100%)" }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
              <g fill="var(--key-ink-reward)">
                {[3.5, 10.25, 17].map((y) =>
                  [3.5, 10.25, 17].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5.5" height="5.5" rx="1.4" />),
                )}
              </g>
            </svg>
          </button>
        </div>
      </div>

      {/* Where Play goes, in words — the one line of prose the draft keeps,
          because a coloured triangle cannot name a destination. */}
      {activeSio && (
        <p className="mb-3.5 text-[12.5px] text-[color:var(--cahier-ink-soft)]">
          Next: <strong className="font-semibold text-[color:var(--cahier-ink)]">{activeSio.topic}</strong>
        </p>
      )}

      {qgOpen && activeSio?.collectionId && (
        <StopSheet
          stopId={activeSio.id}
          topic={activeSio.topic}
          collectionId={activeSio.collectionId}
          onClose={() => setQgOpen(false)}
        />
      )}

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
      {/* PROMINENT 2D / 3D (Dan, 1 Sep, annotating the live Home: "More
          prominent 2-D and 3-D view buttons", mocked as two big colour
          blocks — cyan 2D, magenta 3D — ABOVE the map box). Each opens the
          map IN that view (?view=), which is what makes two buttons more
          than one door split in half. Colours are Dan's own mock; black ink
          clears 4.5:1 on both fills. */}
      <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Open the map">
        <Link
          href="/map?view=2d"
          className="rounded-xl border-2 py-2.5 text-center text-xl font-black text-black transition hover:-translate-y-0.5"
          style={{ borderColor: "var(--cahier-ink)", background: "#3ee6f5", boxShadow: "var(--shadow-card)" }}
        >
          2D
        </Link>
        <Link
          href="/map?view=3d"
          className="rounded-xl border-2 py-2.5 text-center text-xl font-black text-black transition hover:-translate-y-0.5"
          style={{ borderColor: "var(--cahier-ink)", background: "#f57ae0", boxShadow: "var(--shadow-card)" }}
        >
          3D
        </Link>
      </div>
      <div
        className="relative mt-2 overflow-hidden rounded-2xl border-2 transition hover:-translate-y-0.5"
        style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)", boxShadow: "var(--shadow-card)" }}
      >
        {/* One more layer between the page and the picture (Dan, 2026-08-22):
            the snapshot sits in a recessed mat, so it reads as a mounted
            photo — a surface you scroll PAST, never a control. The mat plus
            `inert` + pointer-events-none below mean no gesture over it can
            ever catch: a finger going down the page glides over. */}
        <div className="p-2 pb-0" aria-hidden>
          <div
            inert
            className="pointer-events-none select-none overflow-hidden rounded-xl"
            style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.18), inset 0 0 0 1.5px var(--cahier-line)" }}
          >
            <HomeMap progress={progress} activeId={activeId} accent={accent} postcard />
          </div>
        </div>
        <span className="flex items-center gap-2 border-t-2 px-4 py-2.5" style={{ borderColor: "var(--cahier-ink)" }}>
          <span aria-hidden className="text-xl">🗺️</span>
          <span lang="fr" className="fluo-serif min-w-0 flex-1 text-lg font-black leading-tight text-[color:var(--fluo-ink)]">The Map</span>
          <span aria-hidden className="fluo-mono text-xl font-black text-[color:var(--fluo-ink)]">›</span>
        </span>
        <Link href="/map" aria-label="The Map — open the course map" className="absolute inset-0 z-10" />
      </div>
    </>
  );
}
