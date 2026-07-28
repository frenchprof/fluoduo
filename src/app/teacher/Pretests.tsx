"use client";

/** Pretest gap report (PRIME, audit R1) — class-wide misses per pretest →
 *  per item → attempts / miss rate / top wrong pick. Derived from the shared
 *  events stream (type == "pretest.answer"). Each pretest is a collapsible
 *  section whose header carries its overall miss rate, and the sections
 *  themselves sort by that rate (Dan, 2026-07-28) — worst first, so the gap
 *  report opens on the gap. */

import { useMemo } from "react";
import { type Ev, str } from "./data";
import { CURATED } from "@/content/collections";
import { getPretest, pretestNumber } from "@/content/pretests";
import { stemForItem } from "@/lib/pretestRecord";
import { Section, SectionGroup, TableBox, missColor, useSortedSections, type SortOption } from "./ui";

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
  /** Curriculum position, fixed whatever the sort — the handle Dan reads out. */
  num: number | null;
  title: string;
  attempts: number;
  misses: number;
  missRate: number;
  items: ItemAgg[]; // sorted by missRate desc
};

const SORTS: SortOption<PretestAgg>[] = [
  { key: "miss", label: "Miss %", val: (a) => a.missRate },
  { key: "num", label: "No.", val: (a) => a.num ?? Number.MAX_SAFE_INTEGER, dir: 1 },
  { key: "answers", label: "Answers", val: (a) => a.attempts },
  { key: "items", label: "Items", val: (a) => a.items.length },
  { key: "title", label: "Pretest", val: (a) => a.title.toLowerCase(), dir: 1 },
];

/** Authored pretests carry a title; the per-deck picture pretests are keyed
 *  `picture:<deck>` and name themselves after the deck. */
function titleFor(pretestId: string): string {
  const authored = getPretest(pretestId);
  if (authored) return authored.title;
  const deck = pretestId.startsWith("picture:") ? pretestId.slice("picture:".length) : null;
  if (deck) return `🖼 ${CURATED.find((c) => c.id === deck)?.title ?? deck}`;
  return pretestId;
}

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
    const out: PretestAgg[] = [...byPretest.entries()].map(([pretestId, items]) => {
      const rows: ItemAgg[] = [...items.entries()]
        .map(([itemId, a]) => ({
          itemId,
          attempts: a.attempts,
          misses: a.misses,
          missRate: a.attempts > 0 ? a.misses / a.attempts : 0,
          wrongPicks: a.wrongPicks,
        }))
        .sort((x, y) => y.missRate - x.missRate || y.attempts - x.attempts);
      const attempts = rows.reduce((s, r) => s + r.attempts, 0);
      const misses = rows.reduce((s, r) => s + r.misses, 0);
      return {
        pretestId,
        num: pretestNumber(pretestId),
        title: titleFor(pretestId),
        attempts,
        misses,
        missRate: attempts > 0 ? misses / attempts : 0,
        items: rows,
      };
    });
    return out;
  }, [events]);

  const { sorted, bar } = useSortedSections(aggs, SORTS);

  if (aggs.length === 0) return <p className="mt-3 text-sm text-slate-500">No pretest answers yet.</p>;

  return (
    <SectionGroup>
      {bar}
      {sorted.map((agg) => (
        <PretestSection key={agg.pretestId} agg={agg} />
      ))}
    </SectionGroup>
  );
}

function PretestSection({ agg }: { agg: PretestAgg }) {
  const pretest = useMemo(() => getPretest(agg.pretestId), [agg.pretestId]);
  const stemOf = (itemId: string) => {
    const item = pretest?.items.find((i) => i.id === itemId);
    return item ? stemForItem(item) : itemId;
  };
  const pct = Math.round(agg.missRate * 100);
  return (
    <Section
      id={`pre:${agg.pretestId}`}
      title={agg.num ? `${agg.num}. ${agg.title}` : agg.title}
      href={`/pretests/${agg.pretestId}`}
      meta={
        <>
          <span className={`font-black ${missColor(pct)}`}>{pct}% missed</span> · {agg.attempts} answers · {agg.items.length} items
        </>
      }
    >
      <TableBox head={["Item", "Miss %", "Attempts", "Top wrong pick"]}>
        {agg.items.map((row) => {
          const topWrong = Object.entries(row.wrongPicks).sort((a, b) => b[1] - a[1])[0];
          const itemPct = Math.round(row.missRate * 100);
          return (
            <tr key={row.itemId} className="border-t border-slate-100">
              <td className="px-3 py-2 font-bold text-slate-900" lang="fr">
                {stemOf(row.itemId)}
              </td>
              <td className={`px-3 py-2 text-right font-black ${missColor(itemPct)}`}>{itemPct}%</td>
              <td className="px-3 py-2 text-right text-slate-700">{row.attempts}</td>
              <td className="px-3 py-2 text-slate-700" lang="fr">
                {topWrong ? `${topWrong[0]} ×${topWrong[1]}` : "—"}
              </td>
            </tr>
          );
        })}
      </TableBox>
    </Section>
  );
}
