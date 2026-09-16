"use client";

/** The bug-report inbox — everything students submitted via the 🐞 feedback
 *  button (rules: anonymous create, admin-only read). Newest first. */

import { useEffect, useState } from "react";
import { fmtWhen, str } from "./data";
import { useSortedSections, type SortOption } from "./ui";
import { describeBugContext, type BugContext } from "@/lib/bugContext";

type Report = {
  id: string;
  categories: string[];
  details: string;
  url: string;
  uid: string | null;
  createdAt: Date | null;
  screenshot: string | null;
  done: boolean;
  /** The browser string the report was sent from. It was always recorded
   *  and never shown — and for "the audio reads in English" it is the one
   *  fact that matters (does this device even have a French voice?). */
  userAgent: string | null;
  /** What was on screen when 🐞 was pressed — see lib/bugContext. */
  context: (BugContext & { path?: string }) | null;
};

/** A browser string, shortened to what a person needs: « Chrome 128 ·
 *  Android » rather than 200 characters of Mozilla/5.0 compatibility. */
function shortUA(ua: string | null): string {
  if (!ua) return "";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  const m = ua.match(/(Edg|OPR|SamsungBrowser|Firefox|CriOS|Chrome|Safari)\/(\d+)/);
  const name = m ? ({ Edg: "Edge", OPR: "Opera", CriOS: "Chrome", SamsungBrowser: "Samsung" } as Record<string, string>)[m[1]] ?? m[1] : "";
  return [name && m ? `${name} ${m[2]}` : name, os].filter(Boolean).join(" · ");
}

/** THE HAND-OFF, AS TEXT (Dan, 2026-09-15: *"is there a better way to collect
 *  bugs?"*). Until reports file themselves as GitHub issues, the way a report
 *  reached an agent was a screenshot of this inbox — which dropped the browser
 *  string and the card, the two things the agent most needed. This puts every
 *  OPEN report on the clipboard as plain text with both, ready to paste. */
function exportText(reports: Report[], nameOf: Map<string, string>): string {
  return reports
    .map((r) => {
      const who = r.uid ? nameOf.get(r.uid) ?? r.uid.slice(0, 8) : "anonymous";
      const lines = [
        `— ${fmtWhen(r.createdAt)} · ${who} · ${r.categories.join(", ") || "Other"}`,
        `  on ${r.url}`,
      ];
      const ctx = describeBugContext(r.context);
      if (ctx) lines.push(`  card: ${ctx}`);
      if (r.userAgent) lines.push(`  browser: ${shortUA(r.userAgent)}  (${r.userAgent})`);
      if (r.details) lines.push(`  "${r.details.replace(/\s+/g, " ").trim()}"`);
      if (r.screenshot) lines.push(`  screenshot: attached in the inbox`);
      return lines.join("\n");
    })
    .join("\n\n");
}

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
            userAgent: str(d.userAgent),
            context: d.context && typeof d.context === "object" ? (d.context as Report["context"]) : null,
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

  // The inbox sorts like every other record on the dashboard (Dan,
  // 2026-07-28): by when it came in, by who sent it, by what it's about.
  const visible = (reports ?? []).filter((r) => showDone || !r.done);
  const SORTS: SortOption<Report>[] = [
    { key: "when", label: "When", val: (r) => r.createdAt?.getTime() ?? 0 },
    { key: "who", label: "Who", val: (r) => (r.uid ? nameOf.get(r.uid) ?? r.uid : "anonymous").toLowerCase(), dir: 1 },
    { key: "what", label: "Category", val: (r) => r.categories.join(" ").toLowerCase(), dir: 1 },
    { key: "status", label: "Open first", val: (r) => (r.done ? 1 : 0), dir: 1 },
  ];
  const { sorted, bar } = useSortedSections(visible, SORTS);

  if (error) return <p className="mt-3 text-sm font-bold text-rose-600">Couldn&rsquo;t load feedback.</p>;
  if (reports === null) return <p className="mt-3 text-sm text-slate-500">Loading…</p>;
  if (reports.length === 0) return <p className="mt-3 text-sm text-slate-500">No feedback submitted yet.</p>;

  const doneCount = reports.length - reports.filter((r) => !r.done).length;
  return (
    <div className="mt-4 space-y-4">
      {bar}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-500">{visible.length} open{doneCount > 0 && !showDone ? ` · ${doneCount} completed hidden` : ""}</span>
        <span className="flex flex-wrap items-center gap-2">
          <CopyForAgent text={exportText(visible.filter((r) => !r.done), nameOf)} count={visible.filter((r) => !r.done).length} />
          {doneCount > 0 && (
            <button type="button" onClick={() => setShowDone((v) => !v)}
              className="rounded-full border border-slate-300 px-3 py-1 font-bold text-slate-600 hover:bg-slate-50">
              {showDone ? "Hide completed" : `Show completed (${doneCount})`}
            </button>
          )}
        </span>
      </div>
      {sorted.map((r) => (
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
          {describeBugContext(r.context) && (
            <p className="mt-1 text-xs text-slate-700"><span className="font-bold">card:</span> {describeBugContext(r.context)}</p>
          )}
          {r.userAgent && (
            <p className="mt-1 text-xs text-slate-500" title={r.userAgent}><span className="font-bold">browser:</span> {shortUA(r.userAgent) || r.userAgent.slice(0, 60)}</p>
          )}
          {r.url && <p className="mt-1 text-xs text-slate-500 break-all">on <a href={r.url} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{r.url}</a></p>}
          {r.screenshot && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from Firestore, not an optimizable asset
            <img src={r.screenshot} alt="screenshot attached to the report" className="mt-3 max-h-64 rounded-lg border border-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}

/** One key; content-sized, never the row's width (5 Sep). Says what it did
 *  for two seconds, then goes back to its label. */
function CopyForAgent({ text, count }: { text: string; count: number }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("fail");
    }
    window.setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button type="button" onClick={copy} disabled={count === 0}
      title="Copies every open report as plain text — browser and on-screen card included — to paste to an agent"
      className="rounded-full border border-slate-300 px-2.5 py-0.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
      {state === "done" ? "✓ Copied" : state === "fail" ? "Could not copy" : `📋 Copy ${count} for the agent`}
    </button>
  );
}
