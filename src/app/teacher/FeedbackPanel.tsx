"use client";

/** The bug-report inbox — everything students submitted via the 💬 feedback
 *  button (rules: anonymous create, admin-only read). Newest first. */

import { useEffect, useState } from "react";
import { fmtWhen, str } from "./data";

type Report = {
  id: string;
  categories: string[];
  details: string;
  url: string;
  uid: string | null;
  createdAt: Date | null;
  screenshot: string | null;
  done: boolean;
};

export default function FeedbackPanel({ nameOf, canWrite = true }: { nameOf: Map<string, string>; canWrite?: boolean }) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState(false);
  // Triage (Dan, 2026-07-20): handled items go OFF the radar but stay
  // recallable — a `done` flag on the doc, a "show completed" toggle here.
  const [showDone, setShowDone] = useState(false);
  const markDone = async (id: string, done: boolean) => {
    setReports((rs) => rs?.map((r) => (r.id === id ? { ...r, done } : r)) ?? rs);
    try {
      const [{ doc, updateDoc }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase/db"),
      ]);
      await updateDoc(doc(db, "feedback", id), { done });
    } catch {
      // revert on failure — never show a triage state the store doesn't hold
      setReports((rs) => rs?.map((r) => (r.id === id ? { ...r, done: !done } : r)) ?? rs);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ getDocs, collection }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase/db"),
        ]);
        const snap = await getDocs(collection(db, "feedback"));
        const out: Report[] = [];
        snap.forEach((doc) => {
          const d = doc.data() as Record<string, unknown> & { createdAt?: { toDate?: () => Date } };
          out.push({
            id: doc.id,
            categories: Array.isArray(d.categories) ? d.categories.filter((c): c is string => typeof c === "string") : [],
            details: str(d.details) ?? "",
            url: str(d.url) ?? "",
            uid: str(d.uid),
            createdAt: d.createdAt?.toDate?.() ?? null,
            screenshot: str(d.screenshot),
            done: d.done === true,
          });
        });
        out.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
        if (!cancelled) setReports(out);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) return <p className="mt-3 text-sm font-bold text-rose-600">Couldn&rsquo;t load feedback.</p>;
  if (reports === null) return <p className="mt-3 text-sm text-slate-500">Loading…</p>;
  if (reports.length === 0) return <p className="mt-3 text-sm text-slate-500">No feedback submitted yet.</p>;

  const visible = showDone ? reports : reports.filter((r) => !r.done);
  const doneCount = reports.length - reports.filter((r) => !r.done).length;
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-500">{visible.length} open{doneCount > 0 && !showDone ? ` · ${doneCount} completed hidden` : ""}</span>
        {doneCount > 0 && (
          <button type="button" onClick={() => setShowDone((v) => !v)}
            className="rounded-full border border-slate-300 px-3 py-1 font-bold text-slate-600 hover:bg-slate-50">
            {showDone ? "Hide completed" : `Show completed (${doneCount})`}
          </button>
        )}
      </div>
      {visible.map((r) => (
        <div key={r.id} className={`rounded-xl border-2 bg-white p-4 ${r.done ? "border-emerald-200 opacity-60" : "border-slate-200"}`}>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {canWrite && (
              <button type="button" onClick={() => markDone(r.id, !r.done)}
                title={r.done ? "Reopen this item" : "Mark as completed"}
                className={`rounded-full border px-2.5 py-0.5 font-bold ${r.done ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>
                {r.done ? "↩ Reopen" : "✓ Done"}
              </button>
            )}
            {r.done && <span className="font-bold text-emerald-700">completed</span>}
            <span className="font-bold text-slate-700">
              {r.uid ? nameOf.get(r.uid) ?? r.uid.slice(0, 8) : "anonymous"}
            </span>
            <span>{fmtWhen(r.createdAt)}</span>
            {r.categories.map((c) => (
              <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{c}</span>
            ))}
          </div>
          {r.details && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-900">{r.details}</p>}
          {r.url && <p className="mt-1 text-xs text-slate-500 break-all">on <a href={r.url} target="_blank" rel="noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900">{r.url}</a></p>}
          {r.screenshot && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from Firestore, not an optimizable asset
            <img src={r.screenshot} alt="screenshot attached to the report" className="mt-3 max-h-64 rounded-lg border border-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}
