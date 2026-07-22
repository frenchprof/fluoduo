"use client";

/** Pretest gap report (PRIME, audit R1) — class-wide misses per pretest →
 *  per item → attempts / miss rate / top wrong pick. Derived from the shared
 *  events stream (type == "pretest.answer"). */

import { useMemo } from "react";
import { type Ev, str } from "./data";
import { getPretest } from "@/content/pretests";
import { stemForItem } from "@/lib/pretestRecord";
import { TableBox } from "./ui";

type ItemAgg = {
  itemId: string;
  attempts: number;
  misses: number;
  missRate: number;
  /** Wrong picks only, keyed by the picked text. */
  wrongPicks: Record<string, number>;
};

type PretestAgg = {
  pretestId: string;
  attempts: number;
  items: ItemAgg[]; // sorted by missRate desc
};

export default function Pretests({ events }: { events: Ev[] }) {
  const aggs = useMemo(() => {
    const byPretest = new Map<
      string,
      Map<string, { attempts: number; misses: number; wrongPicks: Record<string, number> }>
    >();
    for (const ev of events) {
      if (ev.type !== "pretest.answer") continue;
      const pretestId = str(ev.payload.pretestId);
      const itemId = str(ev.payload.itemId);
      if (!pretestId || !itemId) continue;
      let items = byPretest.get(pretestId);
      if (!items) byPretest.set(pretestId, (items = new Map()));
      let agg = items.get(itemId);
      if (!agg) items.set(itemId, (agg = { attempts: 0, misses: 0, wrongPicks: {} }));
      agg.attempts += 1;
      if (ev.payload.correct !== true) {
        agg.misses += 1;
        const picked = str(ev.payload.picked);
        if (picked) agg.wrongPicks[picked] = (agg.wrongPicks[picked] ?? 0) + 1;
      }
    }
    const out: PretestAgg[] = [...byPretest.entries()]
      .map(([pretestId, items]) => {
        const rows: ItemAgg[] = [...items.entries()]
          .map(([itemId, a]) => ({
            itemId,
            attempts: a.attempts,
            misses: a.misses,
            missRate: a.attempts > 0 ? a.misses / a.attempts : 0,
            wrongPicks: a.wrongPicks,
          }))
          .sort((x, y) => y.missRate - x.missRate || y.attempts - x.attempts);
        return {
          pretestId,
          attempts: rows.reduce((s, r) => s + r.attempts, 0),
          items: rows,
        };
      })
      .sort((x, y) => x.pretestId.localeCompare(y.pretestId));
    return out;
  }, [events]);

  if (aggs.length === 0) return <p className="mt-3 text-sm text-slate-500">No pretest answers yet.</p>;

  return (
    <div className="mt-4 space-y-8">
      {aggs.map((agg) => (
        <PretestSection key={agg.pretestId} agg={agg} />
      ))}
    </div>
  );
}

function PretestSection({ agg }: { agg: PretestAgg }) {
  const pretest = useMemo(() => getPretest(agg.pretestId), [agg.pretestId]);
  const stemOf = (itemId: string) => {
    const item = pretest?.items.find((i) => i.id === itemId);
    return item ? stemForItem(item) : itemId;
  };
  return (
    <section>
      <h2 className="text-lg font-black text-slate-900">
        <a href={`/pretests/${agg.pretestId}`} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{pretest?.title ?? agg.pretestId}</a>
      </h2>
      <TableBox head={["Item", "Miss %", "Attempts", "Top wrong pick"]}>
        {agg.items.map((row) => {
          const topWrong = Object.entries(row.wrongPicks).sort((a, b) => b[1] - a[1])[0];
          const pct = Math.round(row.missRate * 100);
          return (
            <tr key={row.itemId} className="border-t border-slate-100">
              <td className="px-3 py-2 font-bold text-slate-900" lang="fr">
                {stemOf(row.itemId)}
              </td>
              <td
                className={`px-3 py-2 text-right font-black ${
                  pct >= 50 ? "text-rose-600" : pct >= 25 ? "text-amber-600" : "text-emerald-700"
                }`}
              >
                {pct}%
              </td>
              <td className="px-3 py-2 text-right text-slate-700">{row.attempts}</td>
              <td className="px-3 py-2 text-slate-700" lang="fr">
                {topWrong ? `${topWrong[0]} ×${topWrong[1]}` : "—"}
              </td>
            </tr>
          );
        })}
      </TableBox>
    </section>
  );
}
