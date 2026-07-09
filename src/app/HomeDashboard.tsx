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
import StatsHelp from "@/components/StatsHelp";
import { SIOS, UNIT_META } from "@/content/sios";
import { sioKind, KIND_LABEL } from "@/content/sioKinds";
import { CHAPTERS } from "@/content/chapters";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { equippedAccent, levelForXp, xpMultiplier } from "@/lib/economy";
import { dueForReview } from "@/lib/reviser";

export default function HomeDashboard() {
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [dueCount, setDueCount] = useState(0);
  // « Votre profil : » pills fold away on tap (Dan, 2026-07-08); remembered.
  const [profilOpen, setProfilOpen] = useState(true);
  useEffect(() => {
    try { setProfilOpen(window.localStorage.getItem("fluolingo:home.profil-open") !== "0"); } catch {}
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem("fluolingo:home.profil-open", profilOpen ? "1" : "0"); } catch {}
  }, [profilOpen]);

  // Best bilan score per unit (0–100) — solidifies the 🏁 node on a pass.
  const [bilanBest, setBilanBest] = useState<Record<number, number>>({});

  useEffect(() => {
    const refresh = () => {
      const p = loadProgress();
      setProgress(p);
      setDueCount(dueForReview(p, Date.now()).length);
      try {
        const b: Record<number, number> = {};
        for (const u of [0, 1, 2, 3, 4]) {
          b[u] = parseFloat(window.localStorage.getItem(`fluolingo:bilan.u${u}`) ?? "0") || 0;
        }
        setBilanBest(b);
      } catch {}
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

  return (
    <>
      <section
        className="mb-7 rounded-2xl border-2 border-[color:var(--fluo-ink)] p-5 shadow-[5px_5px_0_var(--fluo-hl)]"
        style={{ background: "linear-gradient(120deg, #fbe3ec 0%, #def3f5 45%, #ecf7cf 100%)" }}
      >
        {/* Exactly two buttons right of the heading (Dan, 2026-07-08): a red
            PLAY with fine print CONTINUER, and a REPEAT with fine print
            RÉVISER. Everything else lives in the ☰ menu / 🔍 spotlight. */}
        {/* ONE row at every width (Dan, 2026-07-08: the réviser icon must sit
            on the same line as Bienvenue, extreme right, smaller) — icons
            only; tooltips and aria-labels carry the words. */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="fluo-serif text-3xl font-black text-[color:var(--fluo-ink)]">
            Bienvenue sur <span className="fluo-hl px-1">FluoLingo</span> ✨
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            {activeSio && (
              <Link
                href={`/unit/${activeSio.unit}#${activeSio.id}`}
                aria-label="Continuer"
                title={`Continuer — « ${activeSio.topic} », your first objective not yet marked done.`}
                className="flex h-10 w-11 items-center justify-center rounded-xl border-2 border-[color:var(--fluo-danger)] bg-[var(--fluo-danger)] text-xl text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
              >
                <span aria-hidden>▶</span>
              </Link>
            )}
            <Link
              href="/reviser"
              aria-label="Réviser"
              title="Réviser — vos mots à revoir"
              className="relative flex h-10 w-11 items-center justify-center rounded-xl border-2 border-[color:var(--fluo-ink)] bg-white/80 text-xl text-[color:var(--fluo-ink)] shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
            >
              <span aria-hidden>🔁</span>
              {dueCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-[var(--fluo-danger)] px-1.5 text-[10px] font-bold text-white">{dueCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* « Votre profil : » heads the stat pills; tapping it folds them away
            (Dan, 2026-07-08). */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setProfilOpen((o) => !o)}
            aria-expanded={profilOpen}
            className="fluo-mono text-sm font-black text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
          >
            Votre profil : {profilOpen ? "▾" : "▸"}
          </button>
          {profilOpen && (
            <>
              <Link href="/profil" className={`${chip} hover:-translate-y-0.5`} title="Votre niveau">🎚️ N{lvl.level} · {lvl.name}</Link>
              <span className={chip}>✓ {doneTotal}/{SIOS.length}</span>
              <span className={chip} title={mult > 1 ? `Série active : XP ×${mult}` : "Série de jours"}>
                🔥 {progress.streak}{mult > 1 && <b className="text-[color:var(--fluo-danger)]"> ×{mult}</b>}
              </span>
              {/* XP is exactly what the leaderboard ranks — the chip IS the way
                  to the Classement. */}
              <Link href="/leaderboard" className={`${chip} hover:-translate-y-0.5`} title="Classement · votre rang">⭐ {progress.xp}</Link>
              <Link href="/profil" className={`${chip} hover:-translate-y-0.5`} title="Boutique">💎 {progress.gems}</Link>
              <StatsHelp />
            </>
          )}
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

      {/* Streak momentum (Dan, 2026-07-08, episode model): counts done-in-order
          from the start; a skip simply stops the run — never blocks. */}
      {seqRun >= 2 && seqRun < SIOS.length && (
        <p className="fluo-mono mb-2 text-xs font-black text-[color:var(--fluo-ink)]">🔗 {seqRun} d&rsquo;affilée !</p>
      )}

      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((unit) => {
          const sios = SIOS.filter((s) => s.unit === unit);
          const meta = UNIT_META[unit];
          const done = sios.filter((s) => isSioDone(s.id, progress)).length;
          // Metro map (Dan, 2026-07-08, episode model item 4): each unité is a
          // line; lines beyond the current chapter sit under a haze that lifts
          // on hover/focus — fog of war with NO locks (everything tappable).
          const activeUnit = activeSio?.unit ?? 4;
          const fogged = unit > activeUnit;
          return (
            <section key={unit} className={`fluo-h-${unit % 6} ${fogged ? "fluo-fog" : ""}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {/* Compact unit chip, just larger than the nodes (Dan,
                    2026-07-08: "we don't [want] whole big button headings") —
                    full name, scenario and count live in the tooltip. */}
                <Link
                  href={`/unit/${unit}`}
                  title={`${meta.label} — ${CHAPTERS[unit]?.scenario ?? ""} · ${done}/${sios.length}`}
                  className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white transition hover:-translate-y-0.5"
                  style={{ background: "var(--fluo-card-accent)" }}
                >
                  U{unit}
                </Link>
                {/* The circles spread across the full remaining width (Dan,
                    2026-07-08: "stretch them out across the width — justify").
                    The metro TRACK runs behind the stations: a tinted rail with
                    a solid fill as far as the line has been travelled. */}
                <div className="relative flex flex-1 flex-wrap items-center gap-1.5 sm:justify-between">
                  <div
                    aria-hidden
                    className="absolute left-1 right-1 top-1/2 hidden h-1.5 -translate-y-1/2 rounded-full opacity-40 sm:block"
                    style={{ background: "var(--fluo-card-accent)" }}
                  />
                  <div
                    aria-hidden
                    className="absolute left-1 top-1/2 hidden h-1.5 -translate-y-1/2 rounded-full sm:block"
                    style={{ background: "var(--fluo-card-accent)", width: `${Math.min(96, (done / (sios.length + 1)) * 100)}%` }}
                  />
                  {sios.map((s) => {
                    const sDone = isSioDone(s.id, progress);
                    const sActive = s.id === activeId;
                    // One size for every node (Dan, 2026-07-08: the size
                    // difference read as noise) — the glow marks "you are
                    // here". The SHAPE tells the kind of work: ● vocab,
                    // ▢ grammar, 💬 phrases (bubble), ◆ atelier (diamond).
                    const kind = sioKind(s.id);
                    const shape =
                      kind === "production" ? "rotate-45 rounded-md"
                      : kind === "grammar" ? "rounded-lg"
                      : kind === "phrases" ? "rounded-2xl rounded-bl-[4px]"
                      : "rounded-full";
                    return (
                      <Link
                        key={s.id}
                        href={`/unit/${unit}#${s.id}`}
                        title={`${s.id} · ${s.topic} (${KIND_LABEL[kind]})`}
                        className={`relative z-[1] flex h-9 w-9 items-center justify-center border-2 text-xs font-black transition hover:-translate-y-0.5 ${shape} ${
                          sActive
                            ? "fluo-node-active ring-2 ring-[var(--fluo-danger)] ring-offset-1"
                            : sDone
                              ? ""
                              : "opacity-75" // ahead of the glow: visible, just calmer
                        }`}
                        style={{
                          background: sDone ? "var(--fluo-card-accent)" : sActive ? "var(--fluo-hl)" : "var(--fluo-card-tint)",
                          borderColor: "var(--fluo-card-accent)",
                          color: sDone ? "#fff" : "var(--fluo-ink)",
                        }}
                      >
                        <span className={kind === "production" ? "-rotate-45" : undefined}>{sDone ? "✓" : s.num}</span>
                      </Link>
                    );
                  })}
                  {/* Chapter-end fluency check — never a lock, always open.
                      Unité 0 (warm-up) has none (Dan, 2026-07-08). */}
                  {unit > 0 && <Link
                    href={`/bilan/${unit}`}
                    title={`Bilan de fluidité — ${CHAPTERS[unit]?.scenario ?? meta.label} (retakes illimités)`}
                    className={`relative z-[1] flex h-9 w-9 items-center justify-center rounded-xl border-2 text-sm transition hover:-translate-y-0.5 ${
                      (bilanBest[unit] ?? 0) >= 80 ? "" : "border-dashed"
                    }`}
                    style={{
                      borderColor: "var(--fluo-card-accent)",
                      background: (bilanBest[unit] ?? 0) >= 80 ? "var(--fluo-card-accent)" : "white",
                    }}
                  >
                    <span aria-hidden>🏁</span>
                  </Link>}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Shape legend — the node's shape says what kind of work it is. */}
      <p className="fluo-mono mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-[color:var(--fluo-ink)]/70">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border-2 border-current" /> {KIND_LABEL.vocab}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[4px] border-2 border-current" /> {KIND_LABEL.grammar}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full rounded-bl-[2px] border-2 border-current" /> {KIND_LABEL.phrases}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rotate-45 rounded-[2px] border-2 border-current" /> {KIND_LABEL.production}</span>
      </p>
    </>
  );
}
