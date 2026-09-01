"use client";

/**
 * The 2D map, COMPRESSED — ten rows of five, all fifty stops at a glance
 * (Dan, 2 Sep: "can we compress the 2D map more such that all 50 stops are
 * visible at a glance, which means we should have 10 rows of 5 stops. we
 * don't actually need to name each section, the color differences are
 * sufficient to distinguish").
 *
 * What carries over from the winding map, unchanged on purpose so the two
 * views stay one map: the stop node itself (kind-coloured border, dashed
 * when still ahead, filled when done or current, 🧑‍🎓 bobbing on the current
 * stop, 🚩 on the class flag) and the 🏁 arena door at the end. What goes:
 * the drawn road, the named region banners (each unit is now a tinted band
 * of two rows — the colour IS the section), and the U0–U4 jump chips (fifty
 * visible stops need no shortcuts to themselves).
 */
import Link from "next/link";
import { SIOS, UNIT_META } from "@/content/sios";
import { CLASS_FLAG_SIO } from "@/content/chapters";
import { sioKind, KIND_LABEL } from "@/content/sioKinds";
import { KIND_COLOR } from "@/components/HomeMap";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { isSioDone, type Progress } from "@/lib/progress";

export default function Map2DGrid({
  progress,
  activeId,
  onOpenSio,
}: {
  progress: Progress;
  activeId?: string | null;
  onOpenSio?: (unit: number, id: string) => void;
}) {
  const activeIdx = activeId ? SIOS.findIndex((s) => s.id === activeId) : -1;
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3, 4].map((unit) => (
        <div
          key={unit}
          id={`unit-band-${unit}`}
          role="group"
          aria-label={UNIT_META[unit]?.label}
          className="grid grid-cols-5 justify-items-center gap-y-2 rounded-2xl px-2 py-3"
          style={{ background: `color-mix(in oklab, ${UNIT_ACCENTS[unit]} 14%, var(--cahier-paper-raised))` }}
        >
          {SIOS.filter((s) => s.unit === unit).map((s) => {
            const i = SIOS.indexOf(s);
            const done = isSioDone(s.id, progress);
            const active = s.id === activeId;
            const ahead = activeIdx >= 0 && i > activeIdx;
            const kind = sioKind(s.id);
            const colour = KIND_COLOR[kind];
            const flag = s.id === CLASS_FLAG_SIO;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onOpenSio?.(s.unit, s.id)}
                title={`${s.id} · ${s.topic} (${KIND_LABEL[kind]})`}
                aria-label={`${s.id} · ${s.topic} (${KIND_LABEL[kind]})${active ? " — continue here" : ""}`}
                aria-current={active ? "step" : undefined}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] text-base font-black transition hover:-translate-y-0.5 ${active ? "fluo-node-active" : ""}`}
                style={{
                  borderColor: colour,
                  borderStyle: ahead && !active ? "dashed" : "solid",
                  background: done || active ? colour : "var(--cahier-paper-raised)",
                  color: done || active ? "var(--cahier-paper-raised)" : "var(--cahier-ink-faint)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {done ? "✓" : i + 1}
                {active && (
                  <span
                    aria-hidden
                    className="home-map-bob absolute -top-5 left-1/2 -translate-x-1/2 text-base leading-none"
                    style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" }}
                  >
                    🧑‍🎓
                  </span>
                )}
                {flag && (
                  <span
                    aria-label="The class is here this week"
                    title="The class is here this week"
                    className="absolute -right-2 -top-2 text-base leading-none"
                  >
                    🚩
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      {/* The arena keeps its door after the last band — the one node that is
          a place, not a stop. */}
      <div className="flex justify-center pt-1">
        <Link
          href="/practice/grammarathon/finale"
          title="GramMarathon Final — 50 questions, all lessons, weighted to your weak spots"
          aria-label="GramMarathon Final"
          className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] text-xl transition hover:-translate-y-0.5"
          style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)", boxShadow: "var(--shadow-card)" }}
        >
          🏁
        </Link>
      </div>
    </div>
  );
}
