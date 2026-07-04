"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import LetrisGame from "@/games/letris/LetrisGame";
import type { LetrisSet } from "@/games/letris/LetrisGame";

type HiEntry = { id: string; score: number; name: string; ts: number };
const COL = "vlrain_hiscores";
const MAX = 8;

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function HiScoreChart({ entries, latestId }: { entries: HiEntry[]; latestId: string | null }) {
  if (entries.length === 0) return null;
  const top = Math.max(...entries.map((e) => e.score), 1);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-sky-700 px-5 py-3">
        <h2 className="text-base font-black text-white">🏆 Hi Scores</h2>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {entries.map((e, i) => {
          const pct = Math.max(Math.round((e.score / top) * 100), 4);
          const isMe = e.id === latestId;
          return (
            <div key={e.id} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-center text-sm select-none">
                {i < 3 ? medals[i] : <span className="text-sky-400 font-bold text-xs">#{i + 1}</span>}
              </span>
              <div className="relative flex-1 h-7 rounded-lg bg-sky-50 overflow-hidden border border-sky-100">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ${isMe ? "bg-[#58cc02]" : "bg-sky-200"}`}
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2.5 text-xs font-bold text-sky-900 truncate">
                  {e.name !== "Anonymous" ? `${e.name} · ` : ""}{e.score} pts
                </span>
              </div>
              <span className="text-[11px] text-sky-400 w-14 shrink-0 text-right tabular-nums">{fmt(e.ts)}</span>
              {isMe && <span className="text-[10px] font-bold text-[#58cc02] uppercase tracking-wide shrink-0">you</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NamePrompt({ score, onSave, onSkip }: {
  score: number;
  onSave: (name: string) => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => onSave(name.trim() || "Anonymous");

  return (
    <div className="rounded-2xl border-2 border-[#58cc02] bg-white shadow-sm overflow-hidden">
      <div className="bg-[#58cc02] px-5 py-3">
        <p className="font-black text-white">Score: {score} pts — add your name to the board?</p>
      </div>
      <div className="flex items-center gap-3 px-5 py-4">
        <input
          ref={inputRef}
          type="text"
          maxLength={20}
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="flex-1 rounded-xl border-2 border-sky-200 px-3 py-2 text-sm font-bold text-sky-900 outline-none focus:border-sky-500"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-[#58cc02] px-4 py-2 text-sm font-black text-white hover:brightness-105 active:translate-y-px"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border-2 border-sky-200 px-4 py-2 text-sm font-bold text-sky-400 hover:text-sky-600"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default function VocabularainClient({ set }: { set: LetrisSet }) {
  const [entries, setEntries] = useState<HiEntry[]>([]);
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [latestId, setLatestId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, COL), orderBy("score", "desc"), limit(MAX));
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({
        id: d.id,
        score: d.data().score as number,
        name: (d.data().name as string) || "Anonymous",
        ts: (d.data().ts?.toMillis?.() ?? Date.now()) as number,
      })));
    });
  }, []);

  const handleGameEnd = useCallback((score: number) => {
    if (score > 0) setPendingScore(score);
  }, []);

  const saveScore = useCallback(async (score: number, name: string) => {
    setPendingScore(null);
    const ref = await addDoc(collection(db, COL), { score, name, ts: serverTimestamp() });
    setLatestId(ref.id);
  }, []);

  return (
    <>
      <LetrisGame set={set} onGameEnd={handleGameEnd} speech={false} />
      {pendingScore !== null && (
        <NamePrompt
          score={pendingScore}
          onSave={(n) => saveScore(pendingScore, n)}
          onSkip={() => setPendingScore(null)}
        />
      )}
      <HiScoreChart entries={entries} latestId={latestId} />
    </>
  );
}
