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
};

export default function FeedbackPanel({ nameOf }: { nameOf: Map<string, string> }) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState(false);

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

  return (
    <div className="mt-4 space-y-4">
      {reports.map((r) => (
        <div key={r.id} className="rounded-xl border-2 border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700">
              {r.uid ? nameOf.get(r.uid) ?? r.uid.slice(0, 8) : "anonymous"}
            </span>
            <span>{fmtWhen(r.createdAt)}</span>
            {r.categories.map((c) => (
              <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{c}</span>
            ))}
          </div>
          {r.details && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-900">{r.details}</p>}
          {r.url && <p className="mt-1 text-xs text-slate-500 break-all">on {r.url}</p>}
          {r.screenshot && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from Firestore, not an optimizable asset
            <img src={r.screenshot} alt="screenshot attached to the report" className="mt-3 max-h-64 rounded-lg border border-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}
