"use client";

/**
 * The Classement board list — extracted from the /leaderboard page so the 🏆
 * top-bar icon can float the same ranking in an overlay (Dan, 2026-07-08).
 * Rows come from two eras of the SAME course (Dan, 2026-07-06: "same course,
 * upgraded platform"): the old laf1201 suite wrote { displayName, totalXP },
 * FluoLingo writes { name, xp, level, gems, streak }. Read both defensively so
 * every student — old and new — appears on one board.
 */
import { useEffect, useState } from "react";
import { signInWithGoogle, useAuthUser } from "@/lib/firebase/auth";
import { levelForXp } from "@/lib/economy";

type BoardRow = {
  uid: string;
  name?: string;
  displayName?: string;
  xp?: number;
  totalXP?: number;
  level?: number;
  gems?: number;
  streak?: number;
};
const rowXp = (r: BoardRow) => r.xp ?? r.totalXP ?? r.gems ?? 0;
const rowName = (r: BoardRow) => r.name ?? r.displayName ?? "Anonyme";

// Rows hidden from the board (Dan, 2026-07-07) — prior-term students whose old
// leaderboard docs linger in the shared collection. Firestore rules can't
// retroactively hide existing docs from a collection read, so filter here.
// (Their XP still carries over if they ever sign in — this is display-only.)
const EXCLUDED_UIDS = new Set([
  "6pHSergetUdBoTicHe930dztnq03",
  "6uyQO9YgBTRLC5Dw1JuU7Fe2cTB3",
  "8FXea0gBTQWry0mz9V0hGQpcHcn1",
  "A0gPWad5dbhrEj7xPl1ZvxELlsD2",
  "A7BPzNnI3MWlSIXqSkdKpwGALFB2",
  "F72Cp1q1wPWzNFBhnSaJuvGNvJi2",
  "K2oqGupnUJhJXr9l54eJxUG7gHx2",
  "MCa37VnnyBUfBV13JMw6jMub79S2",
  "S7uVFj2wtDYy5k97UJiRlDAxHaH2",
  "SB1hAmMEcrZGhNByqqY2leKVnho2",
  "TW4D8HEgNHONelHbtlAY83KR7EG2",
  "UCzhJxIRauVYfiA7s7KVm1f9EuH2",
  "Ucxgyw7PRNhIYQlZBYq5hCMlWVq1",
  "UhUSSLlSRqRjmmjuHw6UJNuKru93",
  "VURCmcsjTaXvMjbHjf1DCeumqWm2",
  "Xtn5klg5SVa4eUtI09pWxFcJFZi2",
  "Y8VWbC1DgYOCsJvSTwc2yTjHO982",
  "ZKvLZyfOfLZFYAEUoTzApQMYClf2",
  "aPngs8CtKZhwqjNTDjELv0BJNYK2",
  "ao8eQgHtKXU23d5CRZ6qvkZTKuH3",
  "dENNssIfItW6a9mhxCNYN7O3WbA3",
  "f8QFvdmv33VQlkaIzVSlAKUl1vp1",
  "fmbfRMU475U4bNAmroFIAChjRRC3",
  "hFDtdL7VbUOVH6LQojinNNEddxA3",
  "lf98Dn7AniMtDDW2QYZjB9zqGBX2",
  "lzRqpbYzAfWOHv2BGuNwaRFjJK23",
  "nObXWQxQCGO6TNugnrgC5xsAQhx1",
  "nnO1UHbvTrdAXcLdff6f6egfr5L2",
  "oJRObzsgLOQw9BfFGRmqJAWwBOy1",
  "qvrNbMnULycr5sczxjNGqiAxWPj2",
  "rYwNEok19RN7eDafWhA0dxgszN42",
  "reJvyqud8JhuhtVC8Qfvj5Ow9uu2",
  "urmvD4pzesNDvLtCggdi3212I5b2",
  "wvEs5cMH9cOcPLpyWlYFNdGapAg1",
]);

export default function LeaderboardList() {
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
        const [{ collection, getDocs, limit, query }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase/db"),
        ]);
        // Old rows have neither `xp` nor `gems`, so an orderBy on either would
        // DROP them (Firestore excludes docs missing the sort field). The board
        // is one classroom, so fetch all and rank by XP client-side across both
        // schemas, then take the top 50.
        const snap = await getDocs(query(collection(db, "leaderboard"), limit(300)));
        if (!cancelled) {
          const list = snap.docs
            .map((d) => ({ uid: d.id, ...(d.data() as Omit<BoardRow, "uid">) }))
            .filter((r) => !EXCLUDED_UIDS.has(r.uid));
          list.sort((a, b) => rowXp(b) - rowXp(a));
          setRows(list.slice(0, 50));
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

  if (!user) {
    return (
      <div className="rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-5 text-center">
        <p className="text-sm font-bold text-[color:var(--cahier-ink)]">Sign in to see the board (and to be on it).</p>
        <button type="button" onClick={() => signInWithGoogle().catch(() => {})} className="cahier-btn cahier-btn-accent mt-3 font-black">
          Continue with Google
        </button>
      </div>
    );
  }
  if (failed) return <p className="text-sm font-bold text-rose-600">Le classement est indisponible pour le moment.</p>;
  if (rows === null) return <p className="text-sm text-[color:var(--cahier-ink-soft)]">Chargement…</p>;
  if (rows.length === 0) return <p className="text-sm text-[color:var(--cahier-ink-soft)]">Personne encore — soyez le premier 💎 !</p>;

  return (
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
              {rowName(r)}{me && " (vous)"}
              <span className="ml-1.5 rounded-full bg-[color:var(--cahier-hl,#eaff00)]/50 px-1.5 py-0.5 text-[11px] font-bold text-[color:var(--cahier-ink)]">
                N{r.level ?? levelForXp(rowXp(r)).level} · {levelForXp(rowXp(r)).name}
              </span>
            </span>
            <span className="fluo-mono text-sm font-black text-[color:var(--cahier-ink)]">⭐ {rowXp(r)}</span>
            <span className="fluo-mono w-14 text-right text-sm font-bold text-[color:var(--cahier-ink-soft)]">🔥 {r.streak ?? 0}</span>
          </li>
        );
      })}
    </ol>
  );
}
