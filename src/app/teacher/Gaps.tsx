"use client";

/**
 * The authoring backlog — every activity × stop that has no content.
 *
 * This was `/activities?gaps=1`, a hidden query on the learner-facing Index.
 * The Index was retired on 2026-08-29 (Dan: "we shouldn't have to land on the
 * index page at all"), and deleting the page would have taken the backlog with
 * it — so it moved here, where the rest of the authoring tools already live,
 * rather than being lost with the thing it happened to be hiding inside.
 *
 * It is derived, never a list to maintain: `gapCells()` asks `cellHref` the
 * same question the learner-facing landings ask — does this stop have this
 * activity — so a gap closes here the moment the content lands, with nothing
 * to tick off.
 */
import { useMemo } from "react";
import { activity } from "@/content/activities";
import { UNIT_META } from "@/content/sios";
import { gapCells } from "@/lib/indexMatrix";
import { Section, SectionGroup } from "./ui";

export default function Gaps() {
  const cells = useMemo(() => gapCells(), []);

  // By activity, because that is how the work is done — a session authors one
  // activity across many stops, not many activities at one stop.
  const byKey = useMemo(() => {
    const m = new Map<string, typeof cells>();
    for (const c of cells) m.set(c.key, [...(m.get(c.key) ?? []), c]);
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [cells]);

  if (cells.length === 0) {
    return <p className="text-sm text-slate-500">Every activity has content at every stop.</p>;
  }
  return (
    <SectionGroup>
      {byKey.map(([key, list]) => {
        const act = activity(key);
        return (
          <Section
            key={key}
            id={`gaps-${key}`}
            title={`${act?.emoji ?? "🧱"} ${act?.name ?? key}`}
            meta={`${list.length} missing`}
            href={act?.href ?? undefined}
          >
            <div className="flex flex-wrap gap-1">
              {list.map(({ sio }) => (
                <span
                  key={sio.id}
                  title={`${sio.unitLabel} · ${sio.topic}`}
                  className="rounded-full border border-slate-300 bg-white px-2 py-0.5 font-mono text-[0.65rem] font-bold text-slate-700"
                >
                  {UNIT_META[sio.unit]?.emoji} {sio.id.slice(4)}
                </span>
              ))}
            </div>
          </Section>
        );
      })}
    </SectionGroup>
  );
}
