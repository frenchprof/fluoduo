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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { speak } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { recordItemResult, spendHeart } from "@/lib/progress";

export type LexEntry = { id: string; fr: string; en: string; syllables: string[] };

const START_LIVES = 3;
const LANE = 3; // chests on the lane at once
const QUOTA = 6; // words to clear a level
const minSylForLevel = (l: number) => (l <= 1 ? 1 : l <= 2 ? 2 : 3);
// Belt loop time in seconds — gentle acceleration (Dan, 2026-07-03: "go easy on
// the acceleration"): a slow ~60s at level 1, easing by 5s a level to a calm
// 20s floor, so it never jumps to a frantic pace.
const beltSecsFor = (l: number) => Math.max(20, 60 - (l - 1) * 5);
const keyW = (s: string) => Math.max(40, 24 + s.length * 15);

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

// `filled` is per-slot, not a count: syllables can be dropped in ANY order
// (Dan, 2026-07-03), so we track which keyholes are done, not how many.
type Chest = { entry: LexEntry; filled: boolean[] };
const blankFill = (e: LexEntry): boolean[] => e.syllables.map(() => false);

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
  const [firstDone, setFirstDone] = useState(false);
  const [rattle, setRattle] = useState<string | null>(null);
  const [music, setMusic] = useState(false);
  const musicAutoRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => () => chiptune.stop(), []); // stop the loop on unmount

  // The A-minor swung loop starts with the game itself: the first chest pick
  // (a user gesture, so the AudioContext may be created) — Dan 2026-07-03,
  // "the music is missing". pickChest is idempotent (same id → same state,
  // music guarded by musicAutoRef), so a drag-release AND its trailing click
  // can both fire harmlessly.
  const pickChest = useCallback((id: string) => {
    setSelected(id);
    if (!musicAutoRef.current) {
      musicAutoRef.current = true;
      chiptune.play("conveyor");
      setMusic(true);
    }
  }, []);

  // Drag-to-pick (Dan, 2026-07-03: "allow for both dragging or clicking"). A
  // pointer-down on a chest starts a drag; a ghost chest follows the pointer,
  // and releasing picks that chest. Clicking (no movement) still works via the
  // button's onClick, as does keyboard.
  const dragRef = useRef<{ id: string; sx: number; sy: number; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      d.moved = true;
      setGhost({ id: d.id, x: e.clientX, y: e.clientY });
    };
    const end = (select: boolean) => {
      const d = dragRef.current;
      dragRef.current = null;
      setGhost(null);
      if (select && d) pickChest(d.id);
    };
    const up = () => end(true);
    const cancel = () => end(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [pickChest]);
  const startDrag = (e: React.PointerEvent, id: string) => {
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const ghostEntry = ghost ? chests.find((c) => c.entry.id === ghost.id)?.entry : undefined;

  // (Re)deal the lane for the current level. Runs on mount and each level.
  useEffect(() => {
    const min = minSylForLevel(level);
    let pool = entries.filter((e) => e.syllables.length >= min);
    if (pool.length < LANE) pool = entries.slice();
    const shuffled = shuffle(pool);
    setChests(shuffled.slice(0, LANE).map((entry) => ({ entry, filled: blankFill(entry) })));
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
    const monos: string[] = []; // whole-word keys of monosyllabic answers in play
    for (const c of chests) {
      for (const s of c.entry.syllables) real.add(s);
      if (c.entry.syllables.length === 1) monos.push(c.entry.syllables[0]);
    }
    // A monosyllable's only key is the whole word; a decoy that is a slice of it
    // ("pai" for "pain") invites "but that's part of the answer!" disputes — so
    // never surface a partial-of-a-monosyllable as an option (Dan, 2026-07-03).
    const isPartialOfMono = (d: string) => monos.some((m) => m !== d && m.includes(d));
    const usable = decoys.filter((d) => !real.has(d) && !isPartialOfMono(d));
    return shuffle([...real, ...usable]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chests.map((c) => c.entry.id).join(",")]);

  function tapKey(token: string) {
    if (over || levelDone || !active) return;
    // Any-order fill: the key fits the FIRST still-empty keyhole that needs
    // this syllable, wherever it sits in the word.
    const slot = active.entry.syllables.findIndex((s, i) => !active.filled[i] && s === token);
    if (slot >= 0) {
      const nextFilled = active.filled.slice();
      nextFilled[slot] = true;
      const complete = nextFilled.every(Boolean);
      if (complete) {
        recordItemResult(active.entry.id, true);
        speak(active.entry.fr, "fr-FR");
        setScore((s) => s + 10 + Math.min(combo, 5) * 2);
        setCombo((c) => c + 1);
        setFirstDone(true);
        // The whole chest descends straight into VOTRE TRÉSOR: add it now and
        // let the trésor tile drop in from the play area (lxland) and land in
        // place — the freed word no longer overshoots past the keyhole.
        setDone((d) => [...d, active.entry]);
        // Remove the cleared chest and pull a replacement from the queue.
        // Computed purely from the current lane/queue (not nested state
        // updaters mutating a captured array — that double-ran under Strict
        // Mode and duplicated the replacement chest).
        const rest = chests.filter((c) => c.entry.id !== active.entry.id);
        const nextUp = queue[0];
        const newChests = nextUp ? [...rest, { entry: nextUp, filled: blankFill(nextUp) }] : rest;
        setChests(newChests);
        // Empty the bay — the learner drags down the next chest (same as the
        // opening), so a chest is never auto-placed in the bay AND the lane.
        setSelected(null);
        if (nextUp) setQueue((q) => q.slice(1));
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
    setChests(shuffled.slice(0, LANE).map((entry) => ({ entry, filled: blankFill(entry) })));
    setQueue(shuffled.slice(LANE));
    setSelected(null);
    setCleared(0); setLevelDone(false);
  }

  // The belt is dead-still only at the very start (before any chest is picked).
  // Once the first word is forged it keeps scrolling continuously — including
  // the gap between clearing one chest and picking the next (Dan, 2026-07-03:
  // that transition shouldn't stall the belt) — easing gently as levels rise.
  const beltFrozen = !firstDone && !selected;
  const beltSecs = firstDone ? beltSecsFor(level) : 140;

  // Client-only game: the belt shuffles with Math.random, so don't SSR it.
  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-4" style={{ color: "#0c4a6e" }}>
      <style>{`
        @keyframes lxscroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes lxrattle{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px) rotate(-4deg)}75%{transform:translateX(4px) rotate(4deg)}}
        @keyframes lxland{0%{transform:translateY(-170px) scale(1.06);opacity:0}14%{opacity:1}80%{transform:translateY(7px) scale(1)}100%{transform:translateY(0) scale(1)}}
        @keyframes lxaim{0%,100%{box-shadow:0 0 0 0 rgba(224,134,0,0)}50%{box-shadow:0 0 0 6px rgba(224,134,0,.45)}}
        @keyframes lxblink{0%,100%{opacity:1}50%{opacity:.15}}
        @keyframes lxdrop{0%{transform:translateY(-6px);opacity:.35}50%{transform:translateY(7px);opacity:1}100%{transform:translateY(-6px);opacity:.35}}
        @keyframes lxpointR{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}
        @keyframes lxpointL{0%,100%{transform:translateX(4px)}50%{transform:translateX(-4px)}}
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
        Drag a chest down, then tap its syllables — in any order — to unlock the French word.
        {hard && <b style={{ color: "#c0392b" }}> Hard: the syllable count is hidden.</b>}
      </p>

      {/* Chest lane — the holding area; the picked chest LEAVES it (it has
          moved down into the main area / bay), so it's never in two places. */}
      <div className="rounded-2xl border-4 border-white p-3" style={{ background: "linear-gradient(180deg,#ffe08a,#ffcf5c)" }}>
        <div className="flex min-h-[3.5rem] flex-wrap justify-center gap-3">
          {chests.filter((c) => c.entry.id !== selected).map((c) => (
            // A locked treasure chest waiting in the holding area: gold body,
            // a darker lid band with a clasp, and the syllable-count lock below.
            <button key={c.entry.id} type="button" onClick={() => pickChest(c.entry.id)}
              onPointerDown={(e) => startDrag(e, c.entry.id)}
              className="w-36 cursor-grab touch-none overflow-hidden rounded-lg border-2 border-b-4 text-center transition active:cursor-grabbing"
              style={{ borderColor: "#7a4e0a", background: "linear-gradient(180deg,#ffe08a,#eaa61c)", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.15)", opacity: ghost?.id === c.entry.id ? 0.4 : 1 }}>
              <span className="flex items-center justify-center" style={{ height: 10, background: "linear-gradient(180deg,#c8860f,#96600c)" }}>
                <span style={{ width: 12, height: 4, borderRadius: 1, background: "#ffe9a8" }} />
              </span>
              <span className="block px-2 pt-1 text-sm font-black" style={{ color: "#5a3a08" }}>{c.entry.en}</span>
              <span className="mb-1.5 mt-1 flex justify-center gap-1">
                {(hard ? [c.entry.syllables.length] : c.entry.syllables).map((s, i) => {
                  const doneSlot = hard ? c.filled.some(Boolean) : c.filled[i];
                  return <span key={i} className="h-2 rounded-full" style={{ width: hard ? 24 : Math.max(8, String(s).length * 5), background: doneSlot ? "#2e7d00" : "#8a5a0f" }} />;
                })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Assembly bay — the active chest with syllable-sized keyholes */}
      <div className="relative flex min-h-[7rem] items-center justify-center py-5">
        {!active && (
          <div className="flex flex-col items-center gap-2">
            {/* animated down-arrows — the "drag it down here" movement */}
            <div className="flex gap-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="text-2xl leading-none" style={{ color: "#ff2222", animation: `lxdrop 1s ease-in-out ${i * 0.15}s infinite` }}>⬇</span>
              ))}
            </div>
            {/* big red blinking call-to-action, arrows pointing in from each side */}
            <div className="flex items-center gap-2" style={{ animation: "lxblink 1.1s ease-in-out infinite" }}>
              <span className="text-3xl leading-none" style={{ color: "#ff2222", animation: "lxpointR .7s ease-in-out infinite" }} aria-hidden>👉</span>
              <span className="text-2xl font-black tracking-tight" style={{ color: "#ff2222", textShadow: "0 1px 0 #fff" }}>
                Drag down a chest to begin
              </span>
              <span className="text-3xl leading-none" style={{ color: "#ff2222", animation: "lxpointL .7s ease-in-out infinite" }} aria-hidden>👈</span>
            </div>
          </div>
        )}
        {active && (
          <div className="overflow-hidden rounded-xl border-2 text-center" style={{ borderColor: "#7a4e0a", borderBottomWidth: 6, background: "linear-gradient(180deg,#ffe6a0,#eaa61c)", boxShadow: "0 12px 24px -14px rgba(122,78,10,.7)" }}>
            {/* the opened lid */}
            <div className="flex items-center justify-center" style={{ height: 14, background: "linear-gradient(180deg,#c8860f,#8a5709)" }}>
              <span style={{ width: 18, height: 6, borderRadius: 2, background: "#ffe9a8" }} />
            </div>
            <div className="px-4 py-3">
            <div className="mb-3 text-lg font-black" style={{ color: "#5a3a08" }}>{active.entry.en}</div>
            {hard ? (
              <div className="mx-auto flex min-h-[3rem] min-w-[8rem] items-center justify-center rounded-xl border-2 border-dashed px-4 text-xl font-black" style={{ borderColor: "#e08600", color: "#0c4a6e" }}>
                {active.entry.syllables.filter((s, i) => active.filled[i]).join("") || <span style={{ color: "#4a7fa6" }}>?</span>}
              </div>
            ) : (
              <div className="flex justify-center gap-2">
                {active.entry.syllables.map((s, i) => {
                  // Any-order: every empty keyhole is a live target, so they all
                  // wear the dashed "ready" ring (no single aim slot anymore).
                  const filled = active.filled[i];
                  return (
                    <span key={i} lang="fr"
                      className="grid h-12 place-items-center rounded-xl border-2 text-lg font-black"
                      style={{
                        width: keyW(s),
                        borderStyle: filled ? "solid" : "dashed",
                        borderColor: filled ? "#2e7d00" : "#e08600",
                        background: filled ? "#46a302" : "#eef7ff",
                        color: filled ? "#fff" : "#4a7fa6",
                      }}>
                      {filled ? s : "▯"}
                    </span>
                  );
                })}
              </div>
            )}
            </div>
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

      {/* Votre trésor — the words RELEASED from the chests (no boxes here; the
          chests stay up in the waiting/main areas — Dan, 2026-07-03). */}
      <div className="mt-3 flex min-h-[2.5rem] flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.7rem] font-black uppercase tracking-wider" style={{ color: "#e08600" }}>🧰 Votre trésor :</span>
        {done.map((d, i) => (
          <span
            key={i}
            lang="fr"
            className="inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-sm font-black"
            style={{
              borderColor: "#e0a500",
              background: "#fff8e1",
              color: "#9a6600",
              boxShadow: "0 1px 4px rgba(224,165,0,.4)",
              animation: "lxland 520ms cubic-bezier(.2,.7,.3,1.25) both",
            }}
          >
            <span aria-hidden>✨</span>
            {d.fr}
          </span>
        ))}
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

      {/* Drag ghost — the chest that follows the pointer while dragging */}
      {ghost && ghostEntry && (
        <div
          className="pointer-events-none fixed z-[60] w-36 rounded-xl border-2 border-b-4 bg-white p-2 text-center opacity-90 shadow-xl"
          style={{ left: ghost.x, top: ghost.y, transform: "translate(-50%,-50%) rotate(-3deg)", borderColor: "#c56a00" }}
        >
          <span className="block text-sm font-black" style={{ color: "#075985" }}>{ghostEntry.en}</span>
        </div>
      )}
    </div>
  );
}
