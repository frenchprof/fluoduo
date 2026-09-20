"use client";

/** Tiny shared pieces for the teacher dashboard panels. */

import { SortableTable } from "@/lib/sortTable";
import { tierFor } from "@/lib/progress";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export function Kpi({
  label,
  value,
  sub,
  /** The value is a PHRASE, not a figure — a timestamp, a name, a verdict.
   *  A KPI's big type exists so a number can be read across a room; set a
   *  date in it and « 15 Sept, 08:02 pm » wraps to three lines and makes its
   *  tile twice the height of the seven beside it (Dan, 2026-09-15). The
   *  distinction is what the value IS, which only the caller knows — a rule
   *  like "shrink it if it is long" would also shrink a six-digit XP. */
  text,
}: { label: string; value: ReactNode; sub?: string; text?: boolean }) {
  return (
    /* `min-w-0` + `break-words`: a grid child's default `min-width: auto`
       refuses to shrink below its longest unbreakable word, which is how
       « 1477 » and a wrapped date came to sit OUTSIDE their own tiles rather
       than inside them (Dan, 2026-09-15). The counted row above gives each
       tile a fair share; this is what makes the tile accept it. */
    <div className="min-w-0 rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
      <div className="break-words text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 break-words font-black text-slate-900 ${text ? "text-base" : "text-2xl"}`}>{value}</div>
      {sub && <div className="mt-0.5 break-words text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function TableBox({ head, children }: { head: string[]; children: ReactNode }) {
  // Every table on the teacher page renders through here — so this one
  // delegation makes ALL records sortable by every column (Dan, 2026-07-25).
  const rows = Array.isArray(children) ? children.flat() : [children];
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
      <SortableTable
        head={head}
        rows={rows as ReactNode[]}
        headAlign={(h, i) => (i === 0 ? "text-left" : /^(Who|Top|Item|Given|Activity|Best)/.test(h) ? "text-left" : "text-right")}
      />
    </div>
  );
}

/* ── Collapsible sections (Dan, 2026-07-28: "the teacher pages should be able
 *    [to] collapse sections (or begin each page collapsed)") ───────────────
 * Every panel is a stack of <Section>s: the header alone carries the numbers
 * that say whether the body is worth opening, so a collapsed page IS the
 * summary. Which ones you opened is remembered for the visit (module map, so
 * hopping between panels keeps your place) and forgotten on reload — each
 * fresh load starts collapsed. */
const opened = new Map<string, boolean>();

/** A group hands its sections a way to enrol, so "expand all" knows who they
 *  are; a fresh context value on every bulk press re-renders them all. */
type Group = { register: (id: string) => () => void; version: number };
const GroupCtx = createContext<Group | null>(null);

/** Wraps a panel's sections and adds the one control that moves them all. */
export function SectionGroup({ children }: { children: ReactNode }) {
  const [ids] = useState(() => new Set<string>());
  const [state, setState] = useState({ version: 0, allOpen: false });
  const group = useMemo<Group>(
    () => ({
      version: state.version,
      register: (id: string) => {
        ids.add(id);
        return () => ids.delete(id);
      },
    }),
    [ids, state.version],
  );
  const bulk = () => {
    const next = !state.allOpen;
    for (const id of ids) opened.set(id, next);
    setState((s) => ({ version: s.version + 1, allOpen: next }));
  };
  return (
    <GroupCtx.Provider value={group}>
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={bulk}
          className="rounded-full border-2 border-slate-300 bg-white px-3 py-0.5 text-xs font-bold text-slate-600 hover:border-slate-500">
          {state.allOpen ? "⊟ Collapse all" : "⊞ Expand all"}
        </button>
      </div>
      {children}
    </GroupCtx.Provider>
  );
}

export function Section({
  id, title, meta, href, defaultOpen = false, children,
}: {
  /** Stable key for the remembered open/closed state. */
  id: string;
  title: ReactNode;
  /** The header's numbers — what the section is worth, while still closed. */
  meta?: ReactNode;
  /** Optional ↗ to the learner-facing page this section is about. */
  href?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  // `opened` is the one source of truth (so "expand all" and a section's own
  // header can never disagree); state here only forces the re-render.
  const group = useContext(GroupCtx);
  const [, redraw] = useState(0);
  useEffect(() => group?.register(id), [group, id]);
  const open = opened.get(id) ?? defaultOpen;
  const toggle = () => {
    opened.set(id, !open);
    redraw((n) => n + 1);
  };
  return (
    <section className="mt-3">
      <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2">
        <button type="button" onClick={toggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="text-sm font-black text-slate-400">{open ? "▾" : "▸"}</span>
          <span className="min-w-0 truncate text-base font-black text-slate-900">{title}</span>
          {meta && <span className="ml-auto shrink-0 pl-2 text-xs font-bold text-slate-500">{meta}</span>}
        </button>
        {href && (
          <a href={href} target="_blank" rel="noreferrer" title={href}
            className="shrink-0 rounded-lg border-2 border-slate-200 px-1.5 text-sm font-bold text-blue-700 hover:border-slate-400 hover:text-blue-900">
            ↗
          </a>
        )}
      </div>
      {open && children}
    </section>
  );
}

/* ── Sorting the sections themselves (Dan, 2026-07-28: "I want to be able to
 *    sort the pretests by % of misses and so on") ──────────────────────────
 * Column sorting inside a table is already automatic (SortableTable); this is
 * the level above — which pretest / which day / which report comes first. */
export type SortOption<T> = {
  key: string;
  label: string;
  val: (t: T) => number | string;
  /** Direction on first click: -1 biggest-first (default), 1 A→Z. */
  dir?: 1 | -1;
};

export function useSortedSections<T>(items: T[], options: SortOption<T>[]) {
  const [sort, setSort] = useState(() => ({ key: options[0].key, dir: options[0].dir ?? -1 }));
  const sorted = useMemo(() => {
    const o = options.find((x) => x.key === sort.key) ?? options[0];
    return [...items].sort((a, b) => {
      const x = o.val(a);
      const y = o.val(b);
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return c * sort.dir;
    });
  }, [items, options, sort]);
  const bar = (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() =>
            setSort((s) => (s.key === o.key ? { key: o.key, dir: (s.dir === 1 ? -1 : 1) as 1 | -1 } : { key: o.key, dir: o.dir ?? -1 }))
          }
          className={`rounded-full border-2 px-2.5 py-0.5 text-xs font-bold transition ${
            sort.key === o.key
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"
          }`}
        >
          {o.label}
          {sort.key === o.key ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
        </button>
      ))}
    </div>
  );
  return { sorted, bar };
}

/** Miss/failure rates read red→amber→green everywhere on the dashboard —
 *  on THE tier scale (progress.ts `tierFor`, applied to 100 − miss rate), so
 *  a 30 % miss rate is amber here exactly as 70 % accuracy is on /moi. */
export function missColor(pct: number): string {
  const t = tierFor(100 - pct);
  return t === "weak" ? "text-rose-600" : t === "medium" ? "text-amber-600" : "text-emerald-700";
}
