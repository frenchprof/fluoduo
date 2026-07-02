"use client";

/**
 * Conveyor Match — the timed tap-tap sibling of Letris, for decks with no
 * sort-column axis (e.g. languages). Front-halves ride ONE serpentine belt (4
 * lanes) toward a terminus and pile up; the back-halves ride a looping dock
 * conveyor below. Tap either half first; the two assemble into the whole word.
 *
 * SPLIT decks (e.g. languages): the word is cut at a RANDOM point each spawn
 * (3+5 / 4+4 / 5+3 …) so the chunks aren't predictable. The dock mixes the
 * correct backs with DECOY backs (incl. out-of-syllabus languages) for challenge.
 * On a correct match the two halves merge (foreground animation) into the whole
 * word, which then stays on screen below the belts in a colour to aid spelling.
 *
 * LEVELS: clear a release quota to advance; pools auto-grow, speed rises. Fail =
 * belt jams or out of lives. HARD MODE drops the front/back shape + colour cue.
 */

import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import { speak } from "@/games/letris/speech";
import { chiptune } from "@/games/audio/chiptune";
import { recordItemResult, spendHeart } from "@/lib/progress";

export type ConveyorPair = { id: string; card: string; match: string; speak?: string; greet?: string };

// a quick ascending "ta-daa" arpeggio via Web Audio (no asset). Called from a tap → allowed.
let _ac: AudioContext | null = null;
function playTada() {
  try {
    if (!_ac) _ac = new AudioContext();
    const ctx = _ac;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator(); const gn = ctx.createGain();
      o.type = "triangle"; o.frequency.value = f;
      o.connect(gn); gn.connect(ctx.destination);
      const t = now + i * 0.08;
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      o.start(t); o.stop(t + 0.5);
    });
  } catch { /* no audio available */ }
}

const LANES = 4;
const COLS = 6;
const N = LANES * COLS;
const LANE_H = 58;
const CARD_H = 46;
const DOCK_H = 60;
const START_LIVES = 3;
const SWEEP_AT = 4;
// Duolingo-bright card colours: fronts ride the belt in green, backs wait in
// the dock in blue (the Lexicalator story: a cheerful word-assembly machine).
const FRONT_CLS = "bg-[#58cc02] border-[#46a302]";
const BACK_CLS = "bg-[#1cb0f6] border-[#1899d6]";
const HARD_CLS = "bg-[#9aa2ad] border-[#7d848e]";
const CRUST = "linear-gradient(180deg,#cf9645 0%,#eabf76 45%,#f6e4ba 100%)"; // crust(top) → crumb(bottom)
const CRUMB = "linear-gradient(180deg,#f6e4ba 0%,#eabf76 55%,#cf9645 100%)"; // crumb(top) → crust(bottom)
const DONE_HUES = ["#d4f24c", "#7dd3fc", "#fca5a5", "#fcd34d", "#a7f3d0", "#c4b5fd", "#f9a8d4", "#fdba74"];
// out-of-syllabus French language names — used only as harder DECOY backs
const EXTRA_LANGS = ["néerlandais", "suédois", "norvégien", "polonais", "grec", "hébreu", "swahili",
  "persan", "ourdou", "bengali", "tchèque", "hongrois", "finnois", "roumain", "ukrainien", "wolof",
  "khmer", "laotien", "mongol", "népalais", "islandais", "catalan", "géorgien", "arménien"];

function rc(i: number): { r: number; c: number } {
  const lane = Math.floor(i / COLS);
  const within = i % COLS;
  return { r: lane, c: lane % 2 === 0 ? within : COLS - 1 - within };
}
const tickMsFor = (lvl: number) => Math.max(240, 1500 - (lvl - 1) * 150);
const spawnEvery = (lvl: number) => Math.max(2, 6 - Math.floor(lvl / 2));
const dockDurFor = (lvl: number) => Math.max(8, 40 - (lvl - 1) * 4);
const poolSizeFor = (lvl: number, deck: number) => Math.min(deck, 6 + (lvl - 1) * 3);
const quotaFor = (lvl: number, deck: number) => poolSizeFor(lvl, deck); // each word once per level
function entriesFor(lvl: number): number[] {
  const e = [0];
  if (lvl >= 3) e.push(2 * COLS);
  if (lvl >= 5) e.push(1 * COLS);
  if (lvl >= 7) e.push(3 * COLS);
  return e;
}

// random split point, ≥2 chars each side (3+5 / 4+4 / 5+3 …); code-point aware.
function splitWord(w: string): [string, string] {
  const ch = Array.from(w);
  if (ch.length < 4) return [ch.join(""), ""];
  const min = 2;
  const point = min + Math.floor(Math.random() * (ch.length - 2 * min + 1));
  return [ch.slice(0, point).join(""), ch.slice(point).join("")];
}

type Card = { uid: number; pairId: string; word: string; front: string; back: string; speak: string; greet?: string; pos: number };
type Sel = { side: "belt"; uid: number } | { side: "dock"; back: string } | null;
type Done = { key: number; word: string; hue: string; greet?: string };

type G = {
  cards: Card[];
  pairs: ConveyorPair[];
  decoys: string[]; // stable pool of decoy back-halves (incl. out-of-syllabus)
  sel: Sel;
  score: number; lives: number;
  level: number; cleared: number;
  releasedIds: Set<string>; // pairIds spawned THIS level — each word appears at most once per level
  combo: number; bestCombo: number;
  tickCtr: number; paused: boolean; over: boolean; levelDone: boolean;
  flash: { uid: number; kind: "ok" | "bad" } | null;
  sweeping: boolean; uidSeq: number;
  merges: { key: number; word: string; hue: string; greet?: string; front: string; back: string }[];
  done: Done[]; // cumulative across the WHOLE game — distinct languages identified so far
};

function shuffle<T>(a: T[]): T[] {
  const o = a.slice();
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

function buildDecoys(pairs: ConveyorPair[]): string[] {
  const words = [...pairs.map((p) => p.card), ...EXTRA_LANGS];
  const set = new Set<string>();
  for (const w of words) for (let k = 0; k < 3; k++) { const [, b] = splitWord(w); if (b.length >= 2) set.add(b); }
  return shuffle([...set]);
}

function makeGame(pairs: ConveyorPair[], randomize: boolean): G {
  return {
    cards: [], pairs: randomize ? shuffle(pairs) : pairs.slice(),
    decoys: randomize ? buildDecoys(pairs) : [],
    sel: null, score: 0, lives: START_LIVES,
    level: 1, cleared: 0, releasedIds: new Set(), combo: 0, bestCombo: 0,
    tickCtr: 0, paused: false, over: false, levelDone: false,
    flash: null, sweeping: false, uidSeq: 1, merges: [], done: [],
  };
}

export default function ConveyorMatch({ title, subtitle, pairs, lang = "fr-FR", instruction, splitMode }:
  { title: string; subtitle?: string; pairs: ConveyorPair[]; lang?: string; instruction?: string; splitMode?: boolean }) {
  const g = useRef<G>(makeGame(pairs, false));
  const [, render] = useReducer((x: number) => x + 1, 0);
  const [hard, setHard] = useState(false);
  const [music, setMusic] = useState(false);
  const musicRef = useRef(false); // whether the player has music enabled (survives level pauses)
  const timer = useRef<number | null>(null);
  useEffect(() => () => chiptune.stop(), []); // stop the loop on unmount
  const dockRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Map<string, HTMLElement>>(new Map());
  const offsetRef = useRef(0);
  const dockHover = useRef(false); // freeze the dock scroll while the pointer is over it → reliable taps
  const lastCommitRef = useRef(0); // debounce: no two matches can resolve within 220ms (blocks stray double-commits)

  const reset = useCallback(() => { g.current = makeGame(pairs, true); render(); }, [pairs]);
  useEffect(() => { g.current = makeGame(pairs, true); render(); }, [pairs]);

  const deck = pairs.length;
  const pool = (s: G) => s.pairs.slice(0, poolSizeFor(s.level, deck));

  // dock tiles: correct backs needed by belt cards + decoys (split decks) / pool backs (meaning decks).
  const computeDock = useCallback((s: G): { id: string; match: string }[] => {
    if (!splitMode) {
      const size = poolSizeFor(s.level, deck);
      const seen = new Set<string>(); const out: { id: string; match: string }[] = [];
      for (let i = 0; i < size; i++) { const p = s.pairs[i]; if (!seen.has(p.match)) { seen.add(p.match); out.push({ id: p.id, match: p.match }); } }
      return out;
    }
    const seen = new Set<string>(); const out: { id: string; match: string }[] = [];
    for (const c of s.cards) if (c.back && !seen.has(c.back)) { seen.add(c.back); out.push({ id: "c:" + c.back, match: c.back }); }
    const want = 2; let added = 0; // never more than 2 distractors on the dock at once
    for (const d of s.decoys) { if (added >= want) break; if (seen.has(d)) continue; seen.add(d); out.push({ id: "d:" + d, match: d }); added++; }
    return out;
  }, [splitMode, deck]);

  function spawn(s: G) {
    if (s.cards.some((c) => c.pos === 0)) { s.over = true; chiptune.gameOver(); return; }
    const entries = entriesFor(s.level).filter((e) => !s.cards.some((c) => c.pos === e));
    if (entries.length === 0) return;
    // each language appears at most ONCE per level → only words not yet released this level
    const from = pool(s).filter((p) => !s.releasedIds.has(p.id));
    if (from.length === 0) return; // whole wave released
    const entry = entries[Math.floor(Math.random() * entries.length)];
    const p = from[Math.floor(Math.random() * from.length)];
    const [front, back] = splitMode ? splitWord(p.card) : [p.card, p.match]; // random split each spawn
    s.cards.push({ uid: s.uidSeq++, pairId: p.id, word: p.card, front, back, speak: p.speak ?? p.card, greet: p.greet, pos: entry });
    s.releasedIds.add(p.id);
  }

  function sweep(s: G) {
    s.sweeping = true;
    const asc = [...s.cards].sort((a, b) => a.pos - b.pos);
    asc.forEach((c, i) => { c.pos = Math.max(i, c.pos - 3); });
    window.setTimeout(() => { g.current.sweeping = false; render(); }, 320);
  }

  function commit(s: G, card: Card, back: string) {
    const t = Date.now();
    if (t - lastCommitRef.current < 220) { s.sel = null; render(); return; } // ignore a stray rapid second commit
    lastCommitRef.current = t;
    if (card.back === back) {
      recordItemResult(card.pairId, true); // spacing ladder (see progress.ts)
      s.cards = s.cards.filter((c) => c.uid !== card.uid);
      s.combo += 1; s.bestCombo = Math.max(s.bestCombo, s.combo);
      s.score += 10 + Math.min(s.combo - 1, 5) * 2;
      s.cleared += 1;
      s.flash = { uid: card.uid, kind: "ok" };
      speak(card.speak, lang, { interrupt: false });
      const known = s.done.find((d) => d.word === card.word);
      const isNew = !known; // first time identified in the WHOLE game
      const hue = known ? known.hue : DONE_HUES[s.done.length % DONE_HUES.length];
      const willComplete = s.cleared >= quotaFor(s.level, deck);
      const mkey = s.uidSeq++;
      s.merges.push({ key: mkey, word: card.word, hue, greet: card.greet, front: card.front, back: card.back }); // halves join → whole
      if (isNew) { s.done.push({ key: mkey, word: card.word, hue, greet: card.greet }); if (!willComplete) playTada(); } // 🎉 per-word
      window.setTimeout(() => { g.current.merges = g.current.merges.filter((m) => m.key !== mkey); render(); }, 2200);
      if (s.combo > 0 && s.combo % SWEEP_AT === 0) sweep(s);
      if (willComplete) {
        s.levelDone = true;
        chiptune.stop();    // music stops immediately
        chiptune.fanfare(); // wordless victory jingle (no TTS)
      }
    } else {
      s.lives -= 1; s.combo = 0; s.flash = { uid: card.uid, kind: "bad" };
      recordItemResult(card.pairId, false); // miss → spacing ladder resets to due-now
      spendHeart(); // decrements the shared cross-game hearts pool (Practice-side only)
      if (s.lives <= 0) { s.over = true; chiptune.gameOver(); } // stops loop + sad descent
      else chiptune.lostLife();                                 // duck loop + "uh-oh" sting
    }
    s.sel = null;
    render();
    window.setTimeout(() => { if (g.current.flash) { g.current.flash = null; render(); } }, 260);
  }

  const nextLevel = useCallback(() => {
    const s = g.current;
    s.level += 1; s.cleared = 0; s.releasedIds = new Set(); s.cards = []; s.sel = null;
    s.levelDone = false; s.tickCtr = 0; s.lives = Math.min(START_LIVES + 1, s.lives + 1);
    s.merges = []; // keep s.done — the identified list is cumulative across the game
    if (musicRef.current) chiptune.play("conveyor"); // resume the loop the player had on
    render();
  }, []);

  const tick = useCallback(() => {
    const s = g.current;
    if (s.paused || s.over || s.levelDone) return;
    const sorted = [...s.cards].sort((a, b) => b.pos - a.pos);
    const occupied = new Set(s.cards.map((c) => c.pos));
    for (const card of sorted) {
      if (card.pos < N - 1 && !occupied.has(card.pos + 1)) { occupied.delete(card.pos); card.pos += 1; occupied.add(card.pos); }
    }
    s.tickCtr += 1;
    if (s.cards.length === 0 || s.tickCtr % spawnEvery(s.level) === 0) spawn(s);
    render();
  }, []);

  const tapCard = useCallback((uid: number) => {
    const s = g.current;
    if (s.over || s.paused || s.levelDone) return;
    if (!musicRef.current) { musicRef.current = true; chiptune.play("conveyor"); setMusic(true); }
    const card = s.cards.find((c) => c.uid === uid);
    if (!card) return;
    if (s.sel?.side === "dock") commit(s, card, s.sel.back);
    else if (s.sel?.side === "belt" && s.sel.uid === uid) { s.sel = null; render(); }
    else { s.sel = { side: "belt", uid }; render(); }
  }, [lang, deck]);

  const tapDock = useCallback((back: string) => {
    const s = g.current;
    if (s.over || s.paused || s.levelDone) return;
    if (!musicRef.current) { musicRef.current = true; chiptune.play("conveyor"); setMusic(true); }
    if (s.sel?.side === "belt") {
      const card = s.cards.find((c) => c.uid === (s.sel as { uid: number }).uid);
      if (card) commit(s, card, back); else { s.sel = null; render(); }
    } else if (s.sel?.side === "dock" && s.sel.back === back) { s.sel = null; render(); }
    else { s.sel = { side: "dock", back }; render(); }
  }, [lang, deck]);

  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      tick();
      timer.current = window.setTimeout(loop, tickMsFor(g.current.level));
    };
    timer.current = window.setTimeout(loop, tickMsFor(g.current.level));
    return () => { alive = false; if (timer.current) window.clearTimeout(timer.current); };
  }, [tick]);

  // dock scroller — each back spaced across the width, wrapping individually (no duplicate copies).
  useEffect(() => {
    let raf = 0; let last: number | null = null;
    const step = (t: number) => {
      const cont = dockRef.current; const s = g.current;
      if (cont && !(s.paused || s.over || s.levelDone)) {
        if (last == null) last = t;
        const dt = Math.min(0.05, (t - last) / 1000); last = t;
        const tiles = computeDock(s);
        const TRACK = cont.clientWidth || 1;
        const n = Math.max(1, tiles.length);
        // tiles keep a comfortably readable width; the strip is as long as it needs to be
        // (longer than the viewport when crowded) and scrolls through, wrapping individually.
        const SLOT = 120;
        const LOOP = Math.max(TRACK, n * SLOT);
        const spacing = LOOP / n;
        const tileW = Math.max(84, Math.min(132, spacing - 12));
        const speed = TRACK / dockDurFor(s.level);
        // freeze the belt-scroll while the pointer is over the dock so taps land where aimed
        const off = dockHover.current ? offsetRef.current : (offsetRef.current + speed * dt) % LOOP;
        offsetRef.current = off;
        tiles.forEach((p, i) => {
          const el = tileRefs.current.get(p.id);
          if (el) { el.style.transform = `translateX(${(i * spacing + off) % LOOP}px)`; el.style.width = `${tileW}px`; }
        });
      } else { last = null; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [computeDock]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === " ") { e.preventDefault(); g.current.paused = !g.current.paused; render(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const s = g.current;
  const glideMs = tickMsFor(s.level);
  const quota = quotaFor(s.level, deck);
  const dockTiles = computeDock(s);
  const showHyphen = splitMode && !hard;
  const hy = (t: string, end: boolean) => (showHyphen ? (end ? `${t}-` : `-${t}`) : t);
  const frontCls = hard ? HARD_CLS : FRONT_CLS;
  const backCls = hard ? HARD_CLS : BACK_CLS;
  const baguette = !!splitMode && !hard;
  // belt sits ABOVE the dock → belt = UPPER half (rounded top), dock = LOWER half (rounded bottom)
  const upperHalf = baguette ? { background: CRUST, borderColor: "#a9742f", borderRadius: "22px 22px 8px 8px", color: "#5a3a14" } : null;
  const lowerHalf = baguette ? { background: CRUMB, borderColor: "#a9742f", borderRadius: "8px 8px 22px 22px", color: "#5a3a14" } : null;
  // a tapped half "toasts" to dark crust with light crumb-coloured lettering
  const selCrust = { background: "linear-gradient(180deg,#7a4a1c,#542f12)", borderColor: "#37200d", color: "#fbe7c4" };

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-4 text-[#4a3413]">
      <style>{`
        @keyframes mDrift{0%{transform:translate(-50%,8px);opacity:0}7%{transform:translate(-50%,0);opacity:1}74%{transform:translate(-50%,0) scale(1);opacity:1}100%{transform:translate(-50%,255px) scale(.15);opacity:0}}
        @keyframes slideL{0%{transform:translateX(-70px) rotate(-3deg);opacity:0}18%{opacity:1}44%{transform:translateX(0) rotate(0)}58%{opacity:1}66%{opacity:0}100%{opacity:0}}
        @keyframes slideR{0%{transform:translateX(70px) rotate(3deg);opacity:0}18%{opacity:1}44%{transform:translateX(0) rotate(0)}58%{opacity:1}66%{opacity:0}100%{opacity:0}}
        @keyframes joinWhole{0%,56%{transform:scale(.86);opacity:0}64%{opacity:1}72%{transform:scale(1.1)}84%{transform:scale(1)}100%{transform:scale(1);opacity:1}}
        @keyframes seamFlash{0%,52%{opacity:0;transform:translateX(-50%) scaleY(.4)}62%{opacity:.95;transform:translateX(-50%) scaleY(1.3)}80%,100%{opacity:0;transform:translateX(-50%) scaleY(1)}}
        @keyframes bPop{0%{transform:scale(0);opacity:0}50%{transform:scale(1.25)}70%{transform:scale(.95)}100%{transform:scale(1);opacity:1}}
        @keyframes beltMove{to{background-position:52px 0}}
      `}</style>
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#e8852e]" style={{ textShadow: "0 2px 0 #fff" }}>
            ⚙️ Lexical<span className="text-[#1cb0f6]">ator</span>
          </h1>
          <p className="text-xs font-bold text-[#4a3413]/70">
            {title}
            {subtitle ? <span className="font-medium"> — {subtitle}</span> : null}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="rounded-xl border-2 border-amber-200 bg-white px-2 py-0.5 shadow-sm">Score <b className="tabular-nums text-[#58cc02]">{s.score}</b></span>
          <span className="rounded-xl border-2 border-amber-200 bg-white px-2 py-0.5 shadow-sm">Lvl <b className="tabular-nums text-[#1cb0f6]">{s.level}</b></span>
          <span className="rounded-xl border-2 border-amber-200 bg-white px-2 py-0.5 shadow-sm">cleared <b className="tabular-nums">{s.cleared}/{quota}</b></span>
          <span className="text-rose-500">{"♥".repeat(Math.max(0, s.lives))}<span className="text-[#4a3413]/20">{"♥".repeat(Math.max(0, START_LIVES - s.lives))}</span></span>
          {s.combo >= 2 && <span className="text-[#ff9600]">×{s.combo}🔥</span>}
          <button type="button" onClick={() => { chiptune.toggle("conveyor"); const on = chiptune.playing() === "conveyor"; musicRef.current = on; setMusic(on); }}
            title="Music" className="rounded-xl border-2 border-amber-200 bg-white px-2 py-0.5 text-xs shadow-sm hover:bg-amber-50">{music ? "🔊" : "🎵"}</button>
          <button type="button" onClick={() => { setHard((h) => !h); g.current = makeGame(pairs, true); render(); }}
            className={`rounded-xl border-2 px-2 py-0.5 text-xs shadow-sm ${hard ? "border-rose-400 bg-rose-500 text-white" : "border-amber-200 bg-white hover:bg-amber-50"}`}>{hard ? "Hard ✓" : "Hard mode"}</button>
        </div>
      </header>

      <p className="mb-2 text-center text-xs font-semibold text-[#4a3413]/60">
        {instruction ?? "Match a French card to its meaning."} Tap either half first. Clear the whole wave to finish the level.
        {hard && <b className="text-rose-600"> Hard: no front/back cue — you decide.</b>}
      </p>

      {/* belt: 4 conveyor lines; front (upper) halves glide. The moving stripes
          are the machine's running track — the Lexicalator visibly "conveys". */}
      <div className={`relative overflow-hidden rounded-2xl border-4 border-white shadow-lg transition ${s.sweeping ? "ring-4 ring-[#58cc02]" : ""}`}
        style={{ height: LANES * LANE_H, background: "linear-gradient(180deg,#ffd97a,#ffcf5c)" }}>
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 26px, transparent 26px 52px)", animation: "beltMove 1.1s linear infinite" }} />
        {Array.from({ length: LANES }).map((_, r) => (
          <div key={r} className="absolute left-0 right-0 h-[2px] bg-white/70" style={{ top: r * LANE_H + LANE_H / 2 }} />
        ))}
        <div className="absolute h-[3px] w-6 rounded bg-rose-500" style={{ top: (LANES - 1) * LANE_H + LANE_H / 2, left: 0 }} />
        {s.cards.map((card) => {
          const { r, c } = rc(card.pos);
          const flash = s.flash?.uid === card.uid ? s.flash.kind : null;
          const picked = s.sel?.side === "belt" && s.sel.uid === card.uid;
          return (
            <button key={card.uid} type="button" onClick={() => tapCard(card.uid)}
              className={`absolute flex items-center justify-center overflow-hidden whitespace-nowrap rounded-lg border-2 px-1 text-center text-lg font-bold leading-tight text-white shadow
                ${flash === "ok" ? "bg-emerald-600 border-emerald-300" : flash === "bad" ? "bg-rose-700 border-rose-400" : `${frontCls} hover:brightness-110`}
                ${picked ? "ring-2 ring-amber-300" : ""}`}
              style={{ top: r * LANE_H + (LANE_H - CARD_H) / 2, left: `calc(${(c / COLS) * 100}% + 4px)`, width: `calc(${100 / COLS}% - 8px)`, height: CARD_H,
                transition: `left ${glideMs}ms linear, top ${glideMs}ms linear`, ...(flash ? null : picked && baguette ? selCrust : upperHalf) }}>
              <span lang="fr">{hy(card.front, true)}</span>
            </button>
          );
        })}
      </div>

      {/* dock: lower halves, spaced across the width and scrolling, wrapping individually.
          Scroll freezes while the pointer is over it so taps land on the tile you aimed at. */}
      <div ref={dockRef} className="relative mt-2 overflow-hidden rounded-2xl border-4 border-white shadow-lg" style={{ height: DOCK_H, background: "linear-gradient(180deg,#e6dcff,#d8c9ff)" }}
        onPointerEnter={() => { dockHover.current = true; }} onPointerLeave={() => { dockHover.current = false; }}>
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 26px, transparent 26px 52px)", animation: "beltMove 1.4s linear infinite" }} />
        <div className="absolute left-0 right-0 h-[2px] bg-white/70" style={{ top: DOCK_H / 2 }} />
        {dockTiles.map((p) => {
          const picked = s.sel?.side === "dock" && s.sel.back === p.match;
          return (
            <button key={p.id} type="button" onClick={() => tapDock(p.match)}
              ref={(el) => { if (el) tileRefs.current.set(p.id, el); else tileRefs.current.delete(p.id); }}
              className={`absolute flex items-center justify-center overflow-hidden whitespace-nowrap rounded-lg border-2 px-1 text-lg font-bold text-white shadow ${backCls} hover:brightness-110 ${picked ? "ring-2 ring-amber-300" : ""}`}
              style={{ top: (DOCK_H - CARD_H) / 2, left: 0, width: 88, height: CARD_H, willChange: "transform", ...(picked && baguette ? selCrust : lowerHalf ?? {}) }}>
              <span lang="fr">{hy(p.match, false)}</span>
            </button>
          );
        })}
      </div>

      {/* completed words — the machine's output tray; each word keeps its colour to help the spelling stick */}
      <div className="mt-3 min-h-[2rem]">
        <span className="mr-2 text-[0.7rem] font-black uppercase tracking-wider text-[#e8852e]">🏭 assembled</span>
        <span className="inline-flex flex-wrap gap-1.5 align-middle">
          {s.done.map((d) => (
            <span key={d.key} lang="fr" className="rounded-md border px-2 py-0.5 text-sm font-bold"
              style={{ background: d.hue, borderColor: "rgba(0,0,0,.25)", color: "#1a1a1a" }}>{d.word}</span>
          ))}
        </span>
      </div>

      {/* foreground merge — the two toasted halves slide in (front from the left, back from the
          right) and abut to spell the whole word LEFT→RIGHT; it then recolours into the word's
          chip and shrinks down into the assembled line. */}
      <div className="pointer-events-none absolute inset-x-0 z-50" style={{ top: 110 }}>
        {s.merges.map((m) => {
          const MS = 2200, HH = CARD_H + 14;
          // text hugs the INNER edge (front right-aligned, back left-aligned) so the letters
          // sit against the seam and flow straight into the merged word.
          const halfBase = "flex items-center whitespace-nowrap border-2 text-3xl font-black shadow-xl";
          const brown = { background: "linear-gradient(180deg,#7a4a1c,#542f12)", borderColor: "#37200d", color: "#fbe7c4" };
          return (
            <div key={m.key} className="absolute left-1/2 flex flex-col items-center" style={{ animation: `mDrift ${MS}ms ease-out forwards` }}>
              {m.greet && (
                <div className="relative mb-3" style={{ animation: `joinWhole ${MS}ms ease-out forwards` }}>
                  <span lang="fr" className="inline-block whitespace-nowrap rounded-2xl border-2 border-slate-300 bg-white px-4 py-1.5 text-xl font-extrabold text-slate-900 shadow-xl">{m.greet} 👋</span>
                  <span className="absolute left-1/2 -ml-2 h-3 w-3 rotate-45 border-b-2 border-r-2 border-slate-300 bg-white" style={{ bottom: -6 }} />
                </div>
              )}
              <div className="relative inline-flex items-center" style={{ height: HH }}>
                {/* front half slides in from the LEFT (text hugs its right/inner edge); back from the RIGHT (text hugs its left edge) — they meet and read across */}
                <span lang="fr" className={`${halfBase} justify-end pl-5`} style={{ ...brown, height: HH, paddingRight: 1, borderRadius: "22px 0 0 22px", animation: `slideL ${MS}ms ease-out forwards` }}>{m.front}</span>
                <span lang="fr" className={`${halfBase} justify-start border-l-0 pr-5`} style={{ ...brown, height: HH, paddingLeft: 1, borderRadius: "0 22px 22px 0", animation: `slideR ${MS}ms ease-out forwards` }}>{m.back}</span>
                {/* flash at the seam where they meet */}
                <span className="absolute left-1/2 top-0 rounded-full" style={{ width: 8, height: HH, background: "#fff", filter: "blur(3px)", animation: `seamFlash ${MS}ms ease-out forwards` }} />
                {/* the whole word — same footprint as the abutted halves — recolours to the chip's hue */}
                <span lang="fr" className="absolute inset-0 flex items-center justify-center whitespace-nowrap rounded-2xl border-4 text-3xl font-black shadow-2xl"
                  style={{ background: m.hue, borderColor: "rgba(0,0,0,.4)", color: "#1a1a14", animation: `joinWhole ${MS}ms ease-out forwards` }}>{m.word}</span>
              </div>
            </div>
          );
        })}
      </div>

      {(s.over || s.paused || s.levelDone) && (
        <div className="mt-4 rounded-3xl border-4 border-amber-200 bg-white p-4 text-center shadow-lg">
          {s.levelDone ? (
            <>
              <p className="text-2xl font-black text-[#ff9600]" style={{ textShadow: "0 0 14px rgba(255,180,74,.4)" }}>{s.level % 2 === 0 ? "BRAVO !" : "BIEN JOUÉ !"}</p>
              <p className="text-sm font-semibold">{s.level % 2 === 0 ? `On continue au niveau ${s.level + 1} ?` : `Vous pouvez passer au niveau ${s.level + 1} !`}</p>
              <p className="mt-1 text-xs text-[#4a3413]/60">Score {s.score} · combo ×{s.bestCombo} · +1 ♥ · niveau {s.level + 1} : {poolSizeFor(s.level + 1, deck)} mots{poolSizeFor(s.level + 1, deck) > poolSizeFor(s.level, deck) ? " (dont des nouveaux)" : ""}.</p>
              <button type="button" onClick={nextLevel} className="mt-3 rounded-2xl border-b-4 border-[#e08600] bg-[#ffc800] px-4 py-2 font-black text-[#4a3413] transition hover:brightness-105 active:translate-y-[2px] active:border-b-0">Niveau {s.level + 1} →</button>
            </>
          ) : s.over ? (
            <>
              <p className="text-lg font-black">{s.lives <= 0 ? "Out of lives" : "Belt jammed!"}</p>
              <p className="text-sm text-[#4a3413]/60">Reached level {s.level} · score {s.score} · best combo ×{s.bestCombo}</p>
              <button type="button" onClick={reset} className="mt-3 rounded-2xl border-b-4 border-[#1899d6] bg-[#1cb0f6] px-4 py-2 font-black text-white transition hover:brightness-105 active:translate-y-[2px] active:border-b-0">Play again</button>
            </>
          ) : (
            <p className="text-sm font-semibold">Paused — press <b>space</b> to resume.</p>
          )}
        </div>
      )}
    </div>
  );
}
