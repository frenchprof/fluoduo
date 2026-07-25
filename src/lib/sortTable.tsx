"use client";
/**
 * Shared sortable-table engine (Dan, 2026-07-25: "all Records should [be]
 * sortable by date and by ALL the other columns"). SortableTable receives
 * header labels and rendered <tr> rows, and sorts the ROWS by any clicked
 * column, extracting each cell's text and coercing it smartly:
 *   numbers → numeric · "25 Jul, 03:57 pm" → date · "—"/empty → last.
 * Click toggles asc/desc; the active header shows ▲/▼. Zero per-table
 * wiring: the teacher's TableBox and /moi's tables all delegate here.
 */
import { isValidElement, useMemo, useState, type ReactNode } from "react";

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/** cell text → sortable value. Numbers beat dates beat strings; blanks last. */
function sortVal(s: string): { n: number | null; d: number | null; s: string } {
  const t = s.trim();
  if (!t || t === "—") return { n: null, d: null, s: "" };
  const num = Number(t.replace(/[,%\s]/g, ""));
  if (t !== "" && !Number.isNaN(num) && /^[\d.,%\s-]+$/.test(t)) return { n: num, d: null, s: t };
  const m = t.match(/^(\d{1,2}) (\w{3}), (\d{1,2}):(\d{2}) (am|pm)$/i);
  if (m) {
    const d = Date.parse(`${m[1]} ${m[2]} ${new Date().getFullYear()} ${m[3]}:${m[4]} ${m[5]}`);
    if (!Number.isNaN(d)) return { n: null, d, s: t };
  }
  const d2 = Date.parse(t);
  if (!Number.isNaN(d2) && /\d{4}|\w{3}/.test(t) && /\d/.test(t)) return { n: null, d: d2, s: t };
  return { n: null, d: null, s: t.toLowerCase() };
}

function cmp(a: ReturnType<typeof sortVal>, b: ReturnType<typeof sortVal>): number {
  const aEmpty = a.n === null && a.d === null && a.s === "";
  const bEmpty = b.n === null && b.d === null && b.s === "";
  if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1; // blanks last, both dirs
  if (a.n !== null && b.n !== null) return a.n - b.n;
  if (a.d !== null && b.d !== null) return a.d - b.d;
  return a.s < b.s ? -1 : a.s > b.s ? 1 : 0;
}

export function useSortedRows(rows: ReactNode[]) {
  const [sort, setSort] = useState<{ i: number; dir: 1 | -1 } | null>(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const withVals = rows.map((r) => {
      const cells = isValidElement(r)
        ? (Array.isArray((r.props as { children?: ReactNode }).children)
            ? ((r.props as { children: ReactNode[] }).children)
            : [(r.props as { children?: ReactNode }).children])
        : [];
      const cell = (cells as ReactNode[])[sort.i];
      return { r, v: sortVal(textOf(cell)) };
    });
    const blankStable = [...withVals].sort((x, y) => cmp(x.v, y.v) * ((x.v.s === "" && x.v.n === null && x.v.d === null) || (y.v.s === "" && y.v.n === null && y.v.d === null) ? 1 : sort.dir));
    return blankStable.map((x) => x.r);
  }, [rows, sort]);
  const onHead = (i: number) => setSort((s) => (s && s.i === i ? { i, dir: s.dir === 1 ? -1 : 1 } : { i, dir: 1 }));
  const arrow = (i: number) => (sort && sort.i === i ? (sort.dir === 1 ? " ▲" : " ▼") : "");
  return { sorted, onHead, arrow };
}

export function SortableTable({ head, rows, headAlign }: { head: string[]; rows: ReactNode[]; headAlign?: (h: string, i: number) => string }) {
  const { sorted, onHead, arrow } = useSortedRows(rows);
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
        <tr>
          {head.map((h, i) => (
            <th key={h + i} className={`px-3 py-2 ${headAlign ? headAlign(h, i) : "text-left"}`}>
              <button type="button" onClick={() => onHead(i)} className="font-bold uppercase tracking-wider hover:text-slate-800" title="Sort by this column">
                {h}{arrow(i)}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{sorted}</tbody>
    </table>
  );
}
