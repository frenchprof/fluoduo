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
import { ALIAS_BOARD_NAMES, EXCLUDED_BOARD_UIDS } from "@/lib/accountAliases";
import RankBadge from "@/components/RankBadge";

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
          let list = snap.docs
            .map((d) => ({ uid: d.id, ...(d.data() as Omit<BoardRow, "uid">) }))
            .filter((r) => !EXCLUDED_BOARD_UIDS.has(r.uid));
          // One student, two accounts (Dan, 2026-07-16): fold alias rows into
          // the canonical row — XP and gems ADD (both are her effort), streak
          // takes the max. Rows carry no email, so the match is by the known
          // display names. If the canonical row doesn't exist yet, the alias
          // row is simply renamed.
          for (const [aliasName, targetName] of Object.entries(ALIAS_BOARD_NAMES)) {
            const src = list.find((r) => rowName(r) === aliasName);
            if (!src) continue;
            const target = list.find((r) => rowName(r) === targetName);
            if (target) {
              target.xp = rowXp(target) + rowXp(src);
              target.gems = (target.gems ?? 0) + (src.gems ?? 0);
              target.streak = Math.max(target.streak ?? 0, src.streak ?? 0);
              list = list.filter((r) => r !== src);
            } else {
              src.name = targetName;
            }
          }
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
            className={`flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-2 sm:gap-2 ${
              me ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]/40" : "border-[color:var(--cahier-rule)] bg-white"
            }`}
          >
            <span className="w-7 shrink-0 text-center text-base font-black">{medal(i)}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-[color:var(--cahier-ink)]">
              {rowName(r)}{me && " (vous)"}
            </span>
            {/* Digit-only rank in its tier colours (Dan, 2026-07-08: names
                were invisible on mobile) — full name in the tooltip; a fixed
                narrow column keeps every badge vertically aligned. Level is
                ALWAYS derived from XP: docs written before the ×20 retune
                carry stale `level` fields from the old cheap curve. */}
            <span className="w-8 shrink-0 text-center">
              <RankBadge
                level={levelForXp(rowXp(r)).level}
                name={levelForXp(rowXp(r)).name}
                className="text-xs"
                compact
              />
            </span>
            <span className="fluo-mono w-[4.5rem] shrink-0 text-right text-sm font-black text-[color:var(--cahier-ink)]">⭐{rowXp(r)}</span>
            <span className="fluo-mono w-10 shrink-0 text-right text-sm font-bold text-[color:var(--cahier-ink-soft)]">🔥{r.streak ?? 0}</span>
          </li>
        );
      })}
    </ol>
  );
}
