"use client";
/**
 * The syllabus heat-strip — patch 26 (audit "out of the box" #3).
 *
 * Fifty outcomes as fifty cells, one row per unit, coloured by accuracy tier
 * (red < 50, amber < 75, green; neutral when never answered), no text. ONE
 * component, four pages: /moi (the learner's own picture, above every
 * segment), the teacher's per-student panel, the teacher's class board (the
 * class column of the matrix is sixteen of these summed), and the Index
 * (a compact one under the unit control, from the device ledger; a tap
 * moves the Index to that outcome).
 *
 * Presentational and learner-safe: takes a sio → accuracy map, knows nothing
 * about who the numbers belong to. Colour is the whole message (litmus:
 * decorative elements are exempt; the label is the tooltip/aria-label).
 */
import { SIOS, unitNumbers, siosForUnit } from "@/content/sios";
import { tierToken } from "@/lib/outcomeRows";

export type HeatValues = Record<string, number | null | undefined>;

export default function HeatStrip({
  values,
  done,
  hrefFor,
  onPick,
  size = "md",
  label = "Syllabus, by outcome",
  className = "",
}: {
  /** sio id → 0..100 accuracy; missing/null = never answered. */
  values: HeatValues;
  /** Outcomes the learner marked done — drawn with an ink outline. */
  done?: ReadonlySet<string>;
  hrefFor?: (sio: string) => string;
  onPick?: (sio: string) => void;
  /** sm = 12px cells (Index, tiles); md = 18px (/moi, teacher). */
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const cell = size === "sm" ? "h-3" : "h-[1.125rem]";
  const units = unitNumbers();
  return (
    <div role={hrefFor || onPick ? "group" : "img"} aria-label={label} className={`heat-strip ${className}`}>
      {units.map((u) => {
        const row = siosForUnit(u);
        return (
          <div key={u} className="flex items-center gap-1" style={{ marginTop: u === units[0] ? 0 : size === "sm" ? 2 : 3 }}>
            <span aria-hidden className="fluo-mono w-5 shrink-0 text-[9px] font-bold leading-none" style={{ color: "var(--cahier-ink-soft)" }}>
              U{u}
            </span>
            <div className="grid flex-1 gap-[2px]" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
              {row.map((s) => {
                const pct = values[s.id];
                const has = pct != null;
                const title = `${s.id} · ${s.short} · ${has ? `${pct}%` : "not yet"}`;
                const style = {
                  background: has ? tierToken(pct) : "var(--cahier-line)",
                  boxShadow: done?.has(s.id) ? "inset 0 0 0 1.5px var(--cahier-ink)" : undefined,
                } as const;
                const cls = `heat-cell block w-full rounded-[3px] ${cell}`;
                if (hrefFor) return <a key={s.id} href={hrefFor(s.id)} title={title} aria-label={title} className={cls} style={style} />;
                if (onPick) return <button key={s.id} type="button" onClick={() => onPick(s.id)} title={title} aria-label={title} className={cls} style={style} />;
                return <span key={s.id} title={title} className={cls} style={style} />;
              })}
            </div>
          </div>
        );
      })}
      {/* Fifty cells, always: a strip that silently dropped an outcome would lie. */}
      <span hidden data-cells={SIOS.length} />
    </div>
  );
}
