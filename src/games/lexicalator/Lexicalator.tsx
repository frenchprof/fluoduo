"use client";

/**
 * Lexicalator — the syllable key/keyhole game (the design thread, 2026-07-02).
 * You PICK a locked chest (English shown in full); its lock is a row of
 * keyholes sized to each French syllable. You forge the French from syllable
 * keys drifting on the belt (real ones + near-miss decoys); the right key in
 * the right slot advances, a wrong one rattles back (a life). Complete the word
 * and the whole gold box descends into the trésor, spoken aloud.
 *
 * The belt is FROZEN until the first word is done, then eases from a crawl to
 * real time-pressure as levels rise. Hard mode hides the syllable count. Levels
 * escalate by syllable length: level 1 lets monosyllables in, higher levels
 * demand longer words. Syllables are hand-authored (see lib/syllabify.ts).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { speak } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { recordItemResult, spendHeart } from "@/lib/progress";

export type LexEntry = { id: string; fr: string; en: string; syllables: string[] };

const START_LIVES = 3;
const LANE = 3; // chests on the lane at once
const QUOTA = 6; // words to clear a level
const minSylForLevel = (l: number) => (l <= 1 ? 1 : l <= 2 ? 2 : 3);
const beltSecsFor = (l: number) => Math.max(7, 30 - (l - 1) * 5); // slower at low levels
const keyW = (s: string) => Math.max(40, 24 + s.length * 15);

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

type Chest = { entry: LexEntry; filled: number };

export default function Lexicalator({
  title,
  subtitle,
  entries,
  decoys,
}: {
  title: string;
  subtitle?: string;
  entries: LexEntry[];
  decoys: string[];
}) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [combo, setCombo] = useState(0);
  const [hard, setHard] = useState(false);
  const [over, setOver] = useState(false);
  const [levelDone, setLevelDone] = useState(false);

  const [chests, setChests] = useState<Chest[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [queue, setQueue] = useState<LexEntry[]>([]);
  const [done, setDone] = useState<LexEntry[]>([]);
  const [descend, setDescend] = useState<LexEntry | null>(null);
  const [firstDone, setFirstDone] = useState(false);
  const [rattle, setRattle] = useState<string | null>(null);
  const [music, setMusic] = useState(false);
  const musicAutoRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => () => chiptune.stop(), []); // stop the loop on unmount

  // The A-minor swung loop starts with the game itself: the first chest pick
  // (a user gesture, so the AudioContext may be created) — Dan 2026-07-03,
  // "the music is missing".
  function pickChest(id: string) {
    setSelected(id);
    if (!musicAutoRef.current) {
      musicAutoRef.current = true;
      chiptune.play("conveyor");
      setMusic(true);
    }
  }

  // (Re)deal the lane for the current level. Runs on mount and each level.
  useEffect(() => {
    const min = minSylForLevel(level);
    let pool = entries.filter((e) => e.syllables.length >= min);
    if (pool.length < LANE) pool = entries.slice();
    const shuffled = shuffle(pool);
    setChests(shuffled.slice(0, LANE).map((entry) => ({ entry, filled: 0 })));
    setQueue(shuffled.slice(LANE));
    // No chest sits in the central bay at first — the learner is nudged to
    // pick one to begin (Dan, 2026-07-03).
    setSelected(null);
    setCleared(0);
    setLevelDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const active = chests.find((c) => c.entry.id === selected) ?? null;

  // Belt tokens: every syllable the visible chests need, plus decoys — shuffled,
  // duplicated for a seamless scroll. Recomputed only when the chest set changes.
  const beltPool = useMemo(() => {
    const real = new Set<string>();
    for (const c of chests) for (const s of c.entry.syllables) real.add(s);
    return shuffle([...real, ...decoys.filter((d) => !real.has(d))]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chests.map((c) => c.entry.id).join(",")]);

  function tapKey(token: string) {
    if (over || levelDone || !active) return;
    const need = active.entry.syllables[active.filled];
    if (token === need) {
      const nextFilled = active.filled + 1;
      const complete = nextFilled >= active.entry.syllables.length;
      if (complete) {
        recordItemResult(active.entry.id, true);
        speak(active.entry.fr, "fr-FR");
        setScore((s) => s + 10 + Math.min(combo, 5) * 2);
        setCombo((c) => c + 1);
        setFirstDone(true);
        // descend animation → land in trésor
        const finished = active.entry;
        setDescend(finished);
        window.setTimeout(() => {
          setDone((d) => [...d, finished]);
          setDescend(null);
        }, 900);
        // remove chest, pull a replacement from the queue
        setChests((cs) => {
          const rest = cs.filter((c) => c.entry.id !== active.entry.id);
          setQueue((q) => {
            if (q.length) {
              rest.push({ entry: q[0], filled: 0 });
              return q.slice(1);
            }
            return q;
          });
          setSelected(rest[0]?.entry.id ?? null);
          return rest;
        });
        setCleared((n) => {
          const nn = n + 1;
          if (nn >= QUOTA) setLevelDone(true);
          return nn;
        });
      } else {
        setChests((cs) => cs.map((c) => (c.entry.id === active.entry.id ? { ...c, filled: nextFilled } : c)));
      }
    } else {
      // wrong key — rattle, lose a life
      setRattle(token);
      window.setTimeout(() => setRattle(null), 300);
      setCombo(0);
      recordItemResult(active.entry.id, false);
      spendHeart();
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) setOver(true);
        return nl;
      });
    }
  }

  function reset() {
    setLevel(1); setScore(0); setLives(START_LIVES); setCombo(0);
    setOver(false); setDone([]); setFirstDone(false);
    // re-deal via the level effect (setLevel(1) won't refire if already 1)
    const min = 1;
    const shuffled = shuffle(entries.filter((e) => e.syllables.length >= min));
    setChests(shuffled.slice(0, LANE).map((entry) => ({ entry, filled: 0 })));
    setQueue(shuffled.slice(LANE));
    setSelected(null);
    setCleared(0); setLevelDone(false);
  }

  // The belt is dead-still until a chest is picked; once one is selected it
  // begins an almost-imperceptible crawl (Dan, 2026-07-03), then — after the
  // first word is forged — eases into real time-pressure as levels rise.
  const beltFrozen = !selected;
  const beltSecs = firstDone ? beltSecsFor(level) : 140;

  // Client-only game: the belt shuffles with Math.random, so don't SSR it.
  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-4" style={{ color: "#0c4a6e" }}>
      <style>{`
        @keyframes lxscroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes lxrattle{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px) rotate(-4deg)}75%{transform:translateX(4px) rotate(4deg)}}
        @keyframes lxdescend{0%{transform:translate(-50%,0) scale(1);opacity:0}12%{opacity:1}70%{opacity:1;transform:translate(-50%,240px) scale(1)}100%{opacity:0;transform:translate(-50%,270px) scale(.5)}}
        @keyframes lxaim{0%,100%{box-shadow:0 0 0 0 rgba(224,134,0,0)}50%{box-shadow:0 0 0 6px rgba(224,134,0,.45)}}
      `}</style>

      {/* HUD */}
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <div className="mr-auto">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0c4a6e", textShadow: "0 2px 0 #fff" }}>
            🧰 Lexic<span style={{ color: "#ffc800" }}>alator</span>
          </h1>
          <p className="text-xs font-bold" style={{ color: "#075985" }}>{title}{subtitle ? ` — ${subtitle}` : ""}</p>
        </div>
        <span className="rounded-xl border-2 border-b-4 border-sky-200 bg-white px-2 py-0.5 text-sm font-bold">Score <b style={{ color: "#58cc02" }}>{score}</b></span>
        <span className="rounded-xl border-2 border-b-4 border-sky-200 bg-white px-2 py-0.5 text-sm font-bold">Lvl <b style={{ color: "#1cb0f6" }}>{level}</b></span>
        <span className="rounded-xl border-2 border-b-4 border-sky-200 bg-white px-2 py-0.5 text-sm font-bold">{cleared}/{QUOTA}</span>
        <span className="text-lg" style={{ color: "#ff4b4b" }}>{"♥".repeat(Math.max(0, lives))}<span className="opacity-20">{"♥".repeat(Math.max(0, START_LIVES - lives))}</span></span>
        <button type="button" onClick={() => { chiptune.toggle("conveyor"); setMusic(chiptune.playing() === "conveyor"); }}
          title="Music" className="rounded-xl border-2 border-sky-200 bg-white px-2 py-0.5 text-xs font-bold">
          {music ? "🔊" : "🎵"}
        </button>
        <button type="button" onClick={() => setHard((h) => !h)}
          className={`rounded-xl border-2 px-2 py-0.5 text-xs font-bold ${hard ? "border-rose-400 bg-rose-500 text-white" : "border-sky-200 bg-white"}`}>
          {hard ? "Hard ✓" : "Hard"}
        </button>
      </header>

      <p className="mb-2 text-center text-xs font-semibold" style={{ color: "#075985" }}>
        Pick a chest, then tap its syllables in order to unlock the French word.
        {hard && <b style={{ color: "#c0392b" }}> Hard: the syllable count is hidden.</b>}
      </p>

      {/* Chest lane — stationary; pick one */}
      <div className="rounded-2xl border-4 border-white p-3" style={{ background: "linear-gradient(180deg,#ffe08a,#ffcf5c)" }}>
        <div className="flex flex-wrap justify-center gap-3">
          {chests.map((c) => {
            const picked = c.entry.id === selected;
            return (
              <button key={c.entry.id} type="button" onClick={() => pickChest(c.entry.id)}
                className="w-36 rounded-xl border-2 border-b-4 bg-white p-2 text-center transition"
                style={{ borderColor: picked ? "#c56a00" : "#d9a63a", transform: picked ? "translateY(-4px)" : undefined, boxShadow: picked ? "0 0 0 4px rgba(224,134,0,.5)" : undefined }}>
                {/* Dan 2026-07-03: contrasts weren't strong enough — dark ink
                    on white instead of pale brand blue, darker progress dashes. */}
                <span className="block text-sm font-black" style={{ color: "#075985" }}>{c.entry.en}</span>
                <span className="mt-1 flex justify-center gap-1">
                  {(hard ? [c.entry.syllables.length] : c.entry.syllables).map((s, i) => (
                    <span key={i} className="h-2 rounded-full" style={{ width: hard ? 24 : Math.max(8, String(s).length * 5), background: i < c.filled ? "#46a302" : "#8a5a00" }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assembly bay — the active chest with syllable-sized keyholes */}
      <div className="relative flex min-h-[7rem] items-center justify-center py-5">
        {!active && !descend && (
          <p className="animate-pulse text-center text-sm font-black" style={{ color: "#e08600" }}>
            👆 Pick a chest to begin
          </p>
        )}
        {active && (
          <div className="rounded-2xl border-4 bg-white px-4 py-3 text-center" style={{ borderColor: "#e08600", boxShadow: "0 10px 24px -16px rgba(12,74,110,.5)" }}>
            <div className="mb-3 text-lg font-black" style={{ color: "#075985" }}>{active.entry.en}</div>
            {hard ? (
              <div className="mx-auto flex min-h-[3rem] min-w-[8rem] items-center justify-center rounded-xl border-2 border-dashed px-4 text-xl font-black" style={{ borderColor: "#e08600", color: "#0c4a6e" }}>
                {active.entry.syllables.slice(0, active.filled).join("") || <span style={{ color: "#4a7fa6" }}>?</span>}
              </div>
            ) : (
              <div className="flex justify-center gap-2">
                {active.entry.syllables.map((s, i) => {
                  const filled = i < active.filled;
                  const aim = i === active.filled;
                  return (
                    <span key={i} lang="fr"
                      className="grid h-12 place-items-center rounded-xl border-2 text-lg font-black"
                      style={{
                        width: keyW(s),
                        borderStyle: filled ? "solid" : "dashed",
                        borderColor: filled ? "#2e7d00" : aim ? "#e08600" : "#7fb0d3",
                        background: filled ? "#46a302" : "#eef7ff",
                        color: filled ? "#fff" : "#4a7fa6",
                        animation: aim ? "lxaim 1.5s ease-in-out infinite" : undefined,
                      }}>
                      {filled ? s : "▯"}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {descend && (
          <div className="pointer-events-none absolute left-1/2 top-2 z-10 rounded-2xl border-4 bg-white px-4 py-2 text-xl font-black"
            style={{ borderColor: "#ffc800", color: "#e08600", animation: "lxdescend 900ms ease-in forwards" }}>
            {descend.fr}
          </div>
        )}
      </div>

      {/* Key belt — a static, fully-visible set until a chest is picked (so the
          first word's syllables are always reachable), then a scrolling belt
          that starts imperceptibly slow and eases into real time-pressure as
          levels rise. */}
      <div className="relative overflow-hidden rounded-2xl border-4 border-white py-3" style={{ background: "linear-gradient(180deg,#bfe6ff,#9fd8fb)" }}>
        {beltFrozen ? (
          <div className="flex flex-wrap justify-center gap-3 px-4">
            {beltPool.map((t, i) => (
              <button key={i} type="button" onClick={() => tapKey(t)} lang="fr"
                className="grid h-12 place-items-center rounded-xl border-2 border-b-4 bg-white text-lg font-black"
                style={{ width: keyW(t), color: "#0c4a6e", borderColor: "#4a94c4", animation: rattle === t ? "lxrattle 300ms" : undefined }}>
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex w-max gap-3 px-4" style={{ animation: `lxscroll ${beltSecs}s linear infinite` }}>
            {[...beltPool, ...beltPool].map((t, i) => (
              <button key={i} type="button" onClick={() => tapKey(t)} lang="fr"
                className="grid h-12 place-items-center rounded-xl border-2 border-b-4 bg-white text-lg font-black"
                style={{ width: keyW(t), color: "#0c4a6e", borderColor: "#4a94c4", animation: rattle === t ? "lxrattle 300ms" : undefined }}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trésor */}
      <div className="mt-3 min-h-[2rem]">
        <span className="mr-2 text-[0.7rem] font-black uppercase tracking-wider" style={{ color: "#e08600" }}>🧰 trésor</span>
        <span className="inline-flex flex-wrap gap-1.5 align-middle">
          {done.map((d, i) => (
            <span key={i} lang="fr" className="rounded-md border-2 border-b-4 bg-white px-2 py-0.5 text-sm font-black" style={{ borderColor: "#ffc800", color: "#e08600" }}>{d.fr}</span>
          ))}
        </span>
      </div>

      {(over || levelDone) && (
        <div className="mt-4 rounded-3xl border-4 border-sky-200 bg-white p-4 text-center">
          {levelDone ? (
            <>
              <p className="text-2xl font-black" style={{ color: "#ff9600" }}>Niveau {level} terminé !</p>
              <p className="text-sm font-semibold" style={{ color: "#075985" }}>Score {score} · on continue ?</p>
              <button type="button" onClick={() => setLevel((l) => l + 1)}
                className="mt-3 rounded-2xl border-b-4 border-[#e08600] bg-[#ffc800] px-4 py-2 font-black" style={{ color: "#0c4a6e" }}>Niveau {level + 1} →</button>
            </>
          ) : (
            <>
              <p className="text-lg font-black">Out of lives</p>
              <p className="text-sm" style={{ color: "#075985" }}>Reached level {level} · score {score}</p>
              <button type="button" onClick={reset}
                className="mt-3 rounded-2xl border-b-4 border-[#1899d6] bg-[#1cb0f6] px-4 py-2 font-black text-white">Play again</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
