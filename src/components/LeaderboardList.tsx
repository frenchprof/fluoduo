"use client";

/**
 * The Classement board list — extracted from the /leaderboard page so the 🏆
 * top-bar icon can float the same ranking in an overlay (Dan, 2026-07-08).
 * Rows come from two eras of the SAME course (Dan, 2026-07-06: "same course,
 * upgraded platform"): the old laf1201 suite wrote { displayName, totalXP },
 * FluOLinGo writes { name, xp, level, gems, streak }. Read both defensively so
 * every student — old and new — appears on one board.
 */
import { useEffect, useState } from "react";
import { signInWithGoogle, useAuthUser } from "@/lib/firebase/auth";
import { levelForXp } from "@/lib/economy";
import { ALIAS_BOARD_NAMES, ALIAS_CANON_NAMES, EXCLUDED_BOARD_UIDS, boardName } from "@/lib/accountAliases";
import { isCurrentTerm } from "@/lib/term";
import { weekKey } from "@/lib/dayKey";
import RankBadge from "@/components/RankBadge";
import SectionBand from "@/components/SectionBand";

type BoardRow = {
  uid: string;
  name?: string;
  displayName?: string;
  xp?: number;
  totalXP?: number;
  level?: number;
  gems?: number;
  streak?: number;
  /** The weekly race (2026-08-21). Absent on legacy rows and on anyone who
   *  has not practised since the field shipped — treated as 0, never as a
   *  reason to drop the row. */
  weekXp?: number;
  weekKey?: string | null;
  term?: string;
};
// NOT `?? r.gems` (bug, to 2026-08-10): gems are SPENT in the Boutique, so a
// learner who bought a colour dropped down a board that claims to rank XP.
// A purchase cost you position. Absent xp is 0, not leftover currency.
const rowXp = (r: BoardRow) => r.xp ?? r.totalXP ?? 0;
/** This week's figure — and ONLY this week's. A stored total from a week that
 *  has rolled over is stale by definition, so it reads as zero rather than
 *  letting last week's effort win a race it is not in. */
const rowWeekXp = (r: BoardRow, wk: string) => (r.weekKey === wk ? (r.weekXp ?? 0) : 0);
const rowName = (r: BoardRow) => r.name ?? r.displayName ?? "Anonymous"; // same fallback word as boardName



export default function LeaderboardList() {
  const user = useAuthUser();
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  // "This week" leads. A cumulative board is decided by week three and only the
  // top few have anything left to play for; a weekly reset puts everyone back
  // in a live race (DOPAMINE_REVIEW §9). The all-term view stays one tap away —
  // nobody loses the standing they built.
  const [view, setView] = useState<"week" | "term">("week");

  useEffect(() => {
    if (!user) {
      // Deliberate: this effect synchronises with Firestore; on sign-out the
      // board must be cleared synchronously so no render shows stale rows.
      // The fetched rows arrive in async callbacks, which the rule accepts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
            .filter((r) => !EXCLUDED_BOARD_UIDS.has(r.uid))
            // Cohort reset (Dan, 2026-08-11): the board shows the CURRENT
            // term only. Rows without a term predate the reset; legacy
            // students' rows get stamped "legacy" on their next sign-in.
            // Nothing is deleted — prior-term rows stay in Firestore for
            // the research pipeline (work/active-cohort.mjs).
            .filter((r) => isCurrentTerm(r.term));
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
          // Aliased accounts publish under one canonical name (email-anchored
          // in progressSync) — fold any remaining same-name rows for those
          // canonical names into one entry.
          const canonNames = new Set(ALIAS_CANON_NAMES);
          for (const cn of canonNames) {
            const dupes = list.filter((r) => rowName(r) === cn);
            if (dupes.length < 2) continue;
            const [keep, ...rest] = dupes;
            for (const r of rest) {
              keep.xp = rowXp(keep) + rowXp(r);
              keep.gems = (keep.gems ?? 0) + (r.gems ?? 0);
              keep.streak = Math.max(keep.streak ?? 0, r.streak ?? 0);
            }
            list = list.filter((r) => !rest.includes(r));
          }
          // Sorted per view below, not here — the weekly board ranks by a
          // different field and must not inherit the all-term order.
          setRows(list);
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
  if (failed) return <p className="text-sm font-bold text-rose-600">The leaderboard is unavailable right now.</p>;
  if (rows === null) return <p className="text-sm text-[color:var(--cahier-ink-soft)]">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-[color:var(--cahier-ink-soft)]">Nobody yet — be the first 💎!</p>;

  const wk = weekKey();
  const mine = boardName(user.uid, user.displayName);
  const isMe = (r: BoardRow) =>
    r.uid === user.uid || (ALIAS_CANON_NAMES.includes(mine) && rowName(r) === mine);

  const score = (r: BoardRow) => (view === "week" ? rowWeekXp(r, wk) : rowXp(r));
  const ranked = [...rows].sort((a, b) => score(b) - score(a));
  // On the weekly board, someone who has not practised this week is not in the
  // race — showing them at 0 would pad the table with people who never entered.
  const inPlay = view === "week" ? ranked.filter((r) => score(r) > 0) : ranked;
  const myIndex = inPlay.findIndex(isMe);

  // "Around you" beats a top-50 list: position relative to the person just
  // ahead is a target you can act on; position 34 of 50 is not.
  const neighbours =
    myIndex >= 0
      ? inPlay.slice(Math.max(0, myIndex - 1), Math.min(inPlay.length, myIndex + 2))
      : [];
  const ahead = myIndex > 0 ? score(inPlay[myIndex - 1]) - score(inPlay[myIndex]) : 0;

  const row = (r: BoardRow, index: number) => {
    const me = isMe(r);
    return (
      <li
        key={`${view}-${r.uid}`}
        className={`flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-2 sm:gap-2 ${
          me ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl)]/40" : "border-[color:var(--cahier-rule)] bg-white"
        }`}
      >
        <span className="w-7 shrink-0 text-center text-base font-black">{medal(index)}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-[color:var(--cahier-ink)]">
          {rowName(r)}{me && " (you)"}
        </span>
        <RankBadge level={r.level ?? levelForXp(rowXp(r)).level} name={levelForXp(rowXp(r)).name} />
        <span className="fluo-mono w-16 shrink-0 text-right text-sm font-black tabular-nums text-[color:var(--cahier-ink)]">
          {score(r).toLocaleString()}
        </span>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Leaderboard period"
        className="flex overflow-hidden rounded-full border-[1.5px] bg-white"
        style={{ borderColor: "var(--cahier-ink)" }}
      >
        {(["week", "term"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className="flex-1 py-2 text-[13px] font-extrabold transition"
            style={
              view === v
                ? { background: "var(--cahier-ink)", color: "var(--cahier-hl)" }
                : { color: "var(--cahier-ink-soft)" }
            }
          >
            {v === "week" ? "This week" : "All term"}
          </button>
        ))}
      </div>

      {/* Two colour-coded zones, not two headings (SectionBand): the board
          reads as "you" and "everyone", and you can find yourself without
          reading a word. */}
      {view === "week" && myIndex >= 0 && (
        <SectionBand
          family="user"
          label="AROUND YOU"
          pill={ahead > 0 ? `${ahead.toLocaleString()} XP to go` : "top of your group"}
        >
          <ol className="space-y-1.5">{neighbours.map((r) => row(r, inPlay.indexOf(r)))}</ol>
          {ahead > 0 && (
            <p className="mt-2 text-[12px] text-[color:var(--cahier-ink-soft)]">
              That is about {Math.max(1, Math.round(ahead / 180))} exercise
              {Math.round(ahead / 180) === 1 ? "" : "s"}.
            </p>
          )}
        </SectionBand>
      )}

      <SectionBand
        family={view === "week" ? "svplay" : "none"}
        label={view === "week" ? "LEADING THIS WEEK" : "ALL TERM"}
        pill={inPlay.length ? `${inPlay.length}` : undefined}
      >
        {inPlay.length === 0 ? (
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">
            Nobody has practised yet this week — first one on the board sets the pace.
          </p>
        ) : (
          <ol className="space-y-1.5">{inPlay.slice(0, 50).map((r, i) => row(r, i))}</ol>
        )}
      </SectionBand>

      {view === "week" && (
        <p className="text-center text-[11px] text-[color:var(--cahier-ink-faint)]">
          Resets Monday. Nobody drops — everyone starts level.
        </p>
      )}
    </div>
  );
}
