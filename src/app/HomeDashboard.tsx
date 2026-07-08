"use client";

/**
 * The Home page body (Dan, 2026-07-05: "a true blue Home page… all of the 50
 * SIOs on a single learning path visually — an overview of where you are in
 * the learning journey"; later: "the home page does not seem home page
 * enough" → a proper welcome hero). Hero: Bienvenue + tagline, the big
 * Continuer CTA with Réviser/Guide beside it, stat chips (✓ done · 🔥 streak
 * · 💎 gems) and an overall progress bar. Below it, one strip per unit: the
 * unit's circles in course order, ✓ done · highlighted "you are here" ·
 * numbered to-come. Every circle deep-links to its unit page and auto-opens
 * that SIO's popup (/unit/N#SIO-x).
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { equippedAccent, levelForXp, xpMultiplier } from "@/lib/economy";
import { dueForReview } from "@/lib/reviser";

export default function HomeDashboard() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const p = loadProgress();
      setProgress(p);
      setDueCount(dueForReview(p, Date.now()).length);
    };
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    return () => window.removeEventListener("fluolingo:progress-updated", refresh);
  }, []);

  // "Continuer" = the earliest not-done goal across the WHOLE course, Unit 0
  // included — a new learner starts at SIO-001 (Introductions), not Unit 1's
  // stressed pronouns (Dan, 2026-07-05: the default shouldn't skip Unité 0).
  const activeId = SIOS.find((s) => !isSioDone(s.id, progress))?.id;
  const activeSio = SIOS.find((s) => s.id === activeId);
  const doneTotal = SIOS.filter((s) => isSioDone(s.id, progress)).length;
  const pct = Math.round((doneTotal / SIOS.length) * 100);

  // Economy view: level from lifetime XP, the fire multiplier, and the accent
  // colour the learner has equipped (drives the hero CTA + bars).
  const lvl = levelForXp(progress.xp);
  const mult = xpMultiplier(progress.streak);
  const accent = equippedAccent(progress);
  const xpPct = Math.round((lvl.into / lvl.span) * 100);

  const chip = "fluo-mono flex items-center gap-1.5 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-3 py-1 text-sm font-bold text-[color:var(--fluo-ink)]";

  return (
    <>
      <section
        className="mb-7 rounded-2xl border-2 border-[color:var(--fluo-ink)] p-5 shadow-[5px_5px_0_var(--fluo-hl)]"
        style={{ background: "linear-gradient(120deg, #fbe3ec 0%, #def3f5 45%, #ecf7cf 100%)" }}
      >
        <h1 className="fluo-serif text-3xl font-black text-[color:var(--fluo-ink)]">
          Bienvenue sur <span className="fluo-hl px-1">FluoLingo</span> ✨
        </h1>
        <p className="mt-1.5 text-base text-[color:var(--fluo-ink)]">
          Your French 1 companion — <b>50 things you&rsquo;ll learn to do</b> in French.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {activeSio && (
            <Link
              href={`/unit/${activeSio.unit}#${activeSio.id}`}
              style={{ background: accent, borderColor: accent }}
              title="Continues at your first objective not yet marked done — 'Mark as done' is what moves this forward."
              className="rounded-full border-2 px-5 py-2 text-base font-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
            >
              ▶ Continuer · {activeSio.topic}
            </Link>
          )}
          <Link
            href="/reviser"
            className="fluo-mono flex items-center gap-1 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-4 py-2 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
          >
            🔁 Réviser
            {dueCount > 0 && (
              <span className="rounded-full bg-[var(--fluo-danger)] px-1.5 text-xs text-white">{dueCount}</span>
            )}
          </Link>
          <Link
            href="/guide"
            className="fluo-mono flex items-center gap-1 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-4 py-2 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
          >
            ❓ Guide
          </Link>
          <Link
            href="/leaderboard"
            className="fluo-mono flex items-center gap-1 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-4 py-2 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
          >
            🏆 Classement
          </Link>
          <Link
            href="/tutor"
            className="fluo-mono flex items-center gap-1 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-4 py-2 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
          >
            🤖 Tuteur
          </Link>
          <Link
            href="/profil"
            className="fluo-mono flex items-center gap-1 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-4 py-2 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
          >
            🎖️ Profil
          </Link>
          <Link
            href="/conjugaison"
            className="fluo-mono flex items-center gap-1 rounded-full border-2 border-[color:var(--fluo-ink)] bg-white/75 px-4 py-2 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
          >
            🔤 Conjugaison
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link href="/profil" className={`${chip} hover:-translate-y-0.5`} title="Votre niveau">🎚️ N{lvl.level} · {lvl.name}</Link>
          <span className={chip}>✓ {doneTotal}/{SIOS.length}</span>
          <span className={chip} title={mult > 1 ? `Série active : XP ×${mult}` : "Série de jours"}>
            🔥 {progress.streak}{mult > 1 && <b className="text-[color:var(--fluo-danger)]"> ×{mult}</b>}
          </span>
          <span className={chip}>⭐ {progress.xp}</span>
          <Link href="/profil" className={`${chip} hover:-translate-y-0.5`} title="Boutique">💎 {progress.gems}</Link>
        </div>

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
              <span className="block h-full rounded-full bg-[var(--fluo-hl)] transition-all duration-500" style={{ width: `${Math.max(xpPct, 2)}%` }} />
            </span>
            <span className="fluo-mono w-14 shrink-0 text-right text-xs font-bold text-[color:var(--fluo-ink)]">{lvl.into}/{lvl.span}</span>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((unit) => {
          const sios = SIOS.filter((s) => s.unit === unit);
          const meta = UNIT_META[unit];
          const done = sios.filter((s) => isSioDone(s.id, progress)).length;
          return (
            <section key={unit} className={`fluo-h-${unit % 6}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <Link
                  href={`/unit/${unit}`}
                  className="flex w-40 shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-black text-white transition hover:-translate-y-0.5"
                  style={{ background: "var(--fluo-card-accent)" }}
                >
                  <span aria-hidden>{meta.emoji}</span>
                  <span className="fluo-serif">{meta.label}</span>
                  <span className="fluo-label ml-auto text-[10px] text-white/90">{done}/{sios.length}</span>
                </Link>
                <div className="flex flex-wrap items-center gap-1.5">
                  {sios.map((s) => {
                    const sDone = isSioDone(s.id, progress);
                    const sActive = s.id === activeId;
                    return (
                      <Link
                        key={s.id}
                        href={`/unit/${unit}#${s.id}`}
                        title={`${s.id} · ${s.topic}`}
                        className={`flex items-center justify-center rounded-full border-2 font-black transition hover:-translate-y-0.5 ${
                          sActive ? "h-10 w-10 text-sm ring-2 ring-[var(--fluo-danger)] ring-offset-1" : "h-8 w-8 text-[11px]"
                        }`}
                        style={{
                          background: sDone ? "var(--fluo-card-accent)" : sActive ? "var(--fluo-hl)" : "var(--fluo-card-tint)",
                          borderColor: "var(--fluo-card-accent)",
                          color: sDone ? "#fff" : "var(--fluo-ink)",
                        }}
                      >
                        {sDone ? "✓" : s.num}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
