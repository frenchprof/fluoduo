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
      {/* The hero, shrunk 303px -> ~88px (patch 25; Dan, 2026-08-11: the
          DrillShell header bar is the reference — thin, static,
          information-only, never a page-dominating hero). What went: the
          "Bienvenue sur FluOlinGo" heading (the shell's wordmark two
          centimetres above it already says so), the 5.5-second byline
          animation (its own patch-25 row), and the two bordered bars.
          What stays: every progress counter (learner feedback), HELP!,
          and the two actions — grouped IN the card they describe,
          side by side (the button-grouping rule). */}
      <section
        aria-label="Your progress"
        className="mb-7 rounded-2xl border-2 border-[color:var(--fluo-ink)] p-3 shadow-[5px_5px_0_var(--fluo-hl)]"
        style={{ background: "linear-gradient(120deg, #fbe3ec 0%, #def3f5 45%, #ecf7cf 100%)" }}
      >
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

      <RoadMap progress={progress} activeId={activeId} accent={accent} />
    </>
  );
}
