"use client";

/**
 * 🏆 Le Classement — the public XP board, ported from the old laf1201 suite
 * (Dan, 2026-07-05: the one motivating surface the new site lacked). Rows
 * come from leaderboard/{uid} ({name, gems, streak}), which progressSync
 * mirrors on every push; the Firestore rules keep excluded emails off the
 * board at write time and require sign-in to read.
 */
import { useEffect, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { signInWithGoogle, useAuthUser } from "@/lib/firebase/auth";

type BoardRow = { uid: string; name: string; gems: number; streak: number };

export default function LeaderboardPage() {
  const user = useAuthUser();
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) {
      setRows(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [{ collection, getDocs, limit, orderBy, query }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase/db"),
        ]);
        const snap = await getDocs(query(collection(db, "leaderboard"), orderBy("gems", "desc"), limit(50)));
        if (!cancelled) {
          setRows(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<BoardRow, "uid">) })));
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`);

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="leaderboard" crumb="🏆 Classement">
      <div className="mx-auto max-w-xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">🏆 Le Classement</h1>
        <p className="mt-1 mb-4 text-sm text-[color:var(--cahier-ink-soft)]">💎 gems win the ranking; 🔥 is the streak.</p>

        {!user ? (
          <div className="rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-5 text-center">
            <p className="text-sm font-bold text-[color:var(--cahier-ink)]">Sign in to see the board (and to be on it).</p>
            <button type="button" onClick={() => signInWithGoogle().catch(() => {})} className="cahier-btn cahier-btn-accent mt-3 font-black">
              Continue with Google
            </button>
          </div>
        ) : failed ? (
          <p className="text-sm font-bold text-rose-600">Le classement est indisponible pour le moment.</p>
        ) : rows === null ? (
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">Personne encore — soyez le premier 💎 !</p>
        ) : (
          <ol className="space-y-1.5">
            {rows.map((r, i) => {
              const me = r.uid === user.uid;
              return (
                <li
                  key={r.uid}
                  className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 ${
                    me ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]/40" : "border-[color:var(--cahier-rule)] bg-white"
                  }`}
                >
                  <span className="w-8 text-center text-base font-black">{medal(i)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-[color:var(--cahier-ink)]">
                    {r.name}{me && " (vous)"}
                  </span>
                  <span className="fluo-mono text-sm font-black text-[color:var(--cahier-ink)]">💎 {r.gems}</span>
                  <span className="fluo-mono w-14 text-right text-sm font-bold text-[color:var(--cahier-ink-soft)]">🔥 {r.streak}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </CahierShell>
  );
}
