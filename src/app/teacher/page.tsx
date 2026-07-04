"use client";

/**
 * Teacher gap view (PRIME gap report, audit R1) — class-wide pretest misses.
 * Reads the `events` collection (type == "pretest.answer") and aggregates
 * client-side: per pretest → per item → attempts / miss rate / top wrong pick.
 * Firestore rules already restrict `events` reads to admins, so the email gate
 * here is UX, not security. Not linked from learner surfaces — teachers get
 * the URL. Firestore is imported dynamically (usage.ts pattern) so the bundle
 * never ships to learners who don't open this page.
 */

import { useEffect, useMemo, useState } from "react";
import CahierShell, { type ShellTab } from "@/components/CahierShell";
import { useAuthUser, signInWithGoogle } from "@/lib/firebase/auth";
import { getPretest } from "@/content/pretests";
import { stemForItem } from "@/lib/pretestRecord";

// Mirror of firestore.rules isAdmin() — keep the two lists in sync.
const ADMIN_EMAILS = [
  "drneilchan@gmail.com",
  "monsieur.chan@gmail.com",
  "dan@chank.wang",
  "kaygeedan@gmail.com",
  "daniel.chan@nus.edu.sg",
  "kwangguan@gmail.com",
];

const TABS: ShellTab[] = [
  { key: "home", label: "Accueil", emoji: "🏠", href: "/" },
  { key: "teacher", label: "Teacher", emoji: "🧑‍🏫" },
];

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

export default function TeacherPage() {
  const user = useAuthUser(); // undefined = resolving, null = signed out
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);

  return (
    <CahierShell tabs={TABS} active="teacher" crumb="🧑‍🏫 Teacher">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {user === undefined ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : isAdmin ? (
          <GapReport />
        ) : (
          <TeachersOnly />
        )}
      </div>
    </CahierShell>
  );
}

function TeachersOnly() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-bold text-slate-700">Teachers only.</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await signInWithGoogle();
          } catch {
          } finally {
            setBusy(false);
          }
        }}
        className="fluo-btn fluo-btn-sm disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Continue with Google"}
      </button>
    </div>
  );
}

function GapReport() {
  const [aggs, setAggs] = useState<PretestAgg[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ getDocs, query, where, collection }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase/db"),
        ]);
        // Single where — no composite index needed; sorting is client-side.
        const snap = await getDocs(
          query(collection(db, "events"), where("type", "==", "pretest.answer")),
        );

        const byPretest = new Map<
          string,
          Map<string, { attempts: number; misses: number; wrongPicks: Record<string, number> }>
        >();
        snap.forEach((doc) => {
          const p = (doc.data().payload ?? {}) as {
            pretestId?: unknown;
            itemId?: unknown;
            correct?: unknown;
            picked?: unknown;
          };
          if (typeof p.pretestId !== "string" || typeof p.itemId !== "string") return;
          let items = byPretest.get(p.pretestId);
          if (!items) byPretest.set(p.pretestId, (items = new Map()));
          let agg = items.get(p.itemId);
          if (!agg) items.set(p.itemId, (agg = { attempts: 0, misses: 0, wrongPicks: {} }));
          agg.attempts += 1;
          if (p.correct !== true) {
            agg.misses += 1;
            if (typeof p.picked === "string") {
              agg.wrongPicks[p.picked] = (agg.wrongPicks[p.picked] ?? 0) + 1;
            }
          }
        });

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

        if (!cancelled) setAggs(out);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm font-bold text-rose-600">Couldn&rsquo;t load events.</p>;
  if (aggs === null) return <p className="text-sm text-slate-500">Loading…</p>;
  if (aggs.length === 0) return <p className="text-sm text-slate-500">No pretest answers yet.</p>;

  return (
    <div className="space-y-8">
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
        {pretest?.title ?? agg.pretestId}
      </h2>
      <div className="mt-2 overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Item</th>
              <th className="px-3 py-2 text-right">Miss %</th>
              <th className="px-3 py-2 text-right">Attempts</th>
              <th className="px-3 py-2 text-left">Top wrong pick</th>
            </tr>
          </thead>
          <tbody>
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
          </tbody>
        </table>
      </div>
    </section>
  );
}
