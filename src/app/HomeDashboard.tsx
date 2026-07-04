"use client";

/**
 * The Home page body (Dan, 2026-07-05: "a true blue Home page… all of the 50
 * SIOs on a single learning path visually — an overview of where you are in
 * the learning journey"). One strip per unit: the unit's circles in course
 * order, ✓ done · highlighted "you are here" · numbered to-come. Every circle
 * deep-links to its unit page and auto-opens that SIO's popup (/unit/N#SIO-x).
 *
 * Top row: Continuer CTA (jumps to the active SIO) · 🔁 Réviser with due
 * badge · 🔥 streak · 💎 gems.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { SIOS, UNIT_META } from "@/content/sios";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
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

  const activeId = SIOS.find((s) => s.unit > 0 && !isSioDone(s.id, progress))?.id;
  const activeSio = SIOS.find((s) => s.id === activeId);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3 px-1">
        {activeSio && (
          <Link
            href={`/unit/${activeSio.unit}#${activeSio.id}`}
            className="fluo-btn fluo-btn-sm !bg-[var(--fluo-danger)] !text-white"
          >
            ▶ Continuer · {activeSio.topic}
          </Link>
        )}
        <Link
          href="/reviser"
          className="fluo-mono flex items-center gap-1 rounded-full border-2 px-3 py-1 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:bg-[var(--fluo-card-tint)]"
          style={{ borderColor: "var(--fluo-card-accent)" }}
        >
          🔁 Réviser
          {dueCount > 0 && (
            <span className="rounded-full bg-[var(--fluo-danger)] px-1.5 text-xs text-white">{dueCount}</span>
          )}
        </Link>
        <span className="ml-auto flex items-center gap-4">
          <span className="fluo-mono flex items-center gap-1 text-sm font-bold text-[color:var(--fluo-ink)]">
            🔥 {progress.streak}
          </span>
          <span className="fluo-mono flex items-center gap-1 text-sm font-bold text-[color:var(--fluo-ink)]">
            💎 {progress.gems}
          </span>
        </span>
      </div>

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
