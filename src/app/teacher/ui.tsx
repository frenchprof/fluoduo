"use client";

/** Tiny shared pieces for the teacher dashboard panels. */

import type { ReactNode } from "react";

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function TableBox({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {head.map((h, i) => (
              <th key={h + i} className={`px-3 py-2 ${i === 0 ? "text-left" : /^(Who|Top|Item|Given|Activity|Best)/.test(h) ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 text-lg font-black text-slate-900">{children}</h2>;
}
