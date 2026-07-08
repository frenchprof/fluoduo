/**
 * Chiptune loops for the games — a tiny NES-style synth + two original tracks
 * (Letris: C major, bright; Conveyor: A minor, swung). Ported from the sound-test
 * prototype; nothing sampled. Singleton transport: play(key) / stop() / toggle(key).
 *
 * AudioContext must be created/resumed inside a user gesture — call from a click.
 */

type Note = string | string[];
type Chan = { type: OscillatorType; duty?: number; vol: number; notes: [Note, number][]; byStep?: Record<number, { note: Note; dur: number }> };
type Song = { bpm: number; swing: number; ch: Chan[]; drums: string[]; len?: number };

import { isSoundMuted, onSoundMuteChange } from "@/games/audio/mute";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null; // the loop runs through this so SFX can duck it
let vol = 0.6;
let tempoScale = 1; // >1 slows the loop (notes spaced further + held longer) — used at "nightfall"

function initAudio() {
  if (ctx) return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new Ctx();
  master = ctx.createGain();
  // The global 🔇 governs game audio too (Dan, 2026-07-07: the sound-off
  // button must work in games): muted → master at 0. Music keeps scheduling
  // silently, so unmuting mid-game brings the tune straight back.
  master.gain.value = isSoundMuted() ? 0 : vol * 0.5;
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  musicBus.gain.value = 1;
  musicBus.connect(master);
}

// React to the toggle live — silences (or restores) anything already playing.
onSoundMuteChange((m) => {
  if (master) master.gain.value = m ? 0 : vol * 0.5;
});

const pulseCache: Record<number, PeriodicWave> = {};
function pulseWave(duty: number): PeriodicWave {
  if (pulseCache[duty]) return pulseCache[duty];
  const n = 24;
  const real = new Float32Array(n + 1), imag = new Float32Array(n + 1);
  for (let i = 1; i <= n; i++) imag[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
  const w = ctx!.createPeriodicWave(real, imag, { disableNormalization: false });
  pulseCache[duty] = w; return w;
}

let noiseBuf: AudioBuffer | null = null;
function getNoise(): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  const len = ctx!.sampleRate * 1.5;
  noiseBuf = ctx!.createBuffer(1, len, ctx!.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

const SEMI: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
function freq(note: string): number {
  if (note === "0" || note == null) return 0;
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) return 0;
  const midi = SEMI[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function tone(type: OscillatorType, f: number, t0: number, dur: number, v: number, duty?: number, dest?: AudioNode) {
  if (f <= 0 || !ctx || !master) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  if (type === "pulse" as OscillatorType) o.setPeriodicWave(pulseWave(duty ?? 0.5));
  else o.type = type;
  o.frequency.value = f;
  const a = 0.006, r = Math.min(0.05, dur * 0.4);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(v, t0 + a);
  g.gain.setValueAtTime(v, t0 + Math.max(a, dur - r));
  g.gain.exponentialRampToValueAtTime(0.0005, t0 + dur);
  o.connect(g); g.connect(dest || master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function bendTone(f0: number, f1: number, t0: number, dur: number, v: number, duty?: number) { // glide for "sigh" SFX
  if (!ctx || !master) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.setPeriodicWave(pulseWave(duty ?? 0.5));
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  const a = 0.006, r = Math.min(0.05, dur * 0.4);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(v, t0 + a);
  g.gain.setValueAtTime(v, t0 + Math.max(a, dur - r));
  g.gain.exponentialRampToValueAtTime(0.0005, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function noiseHit(t0: number, dur: number, v: number, hp?: number, lp?: number, dest?: AudioNode) {
  if (!ctx || !master) return;
  const s = ctx.createBufferSource(); s.buffer = getNoise();
  const g = ctx.createGain(); let node: AudioNode = s;
  if (hp) { const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; node.connect(f); node = f; }
  if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; node.connect(f); node = f; }
  node.connect(g); g.connect(dest || master);
  g.gain.setValueAtTime(v, t0);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  s.start(t0); s.stop(t0 + dur + 0.02);
}
function kick(t0: number, v: number, dest?: AudioNode) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(160, t0);
  o.frequency.exponentialRampToValueAtTime(48, t0 + 0.11);
  g.gain.setValueAtTime(v, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
  o.connect(g); g.connect(dest || master);
  o.start(t0); o.stop(t0 + 0.18);
}
function perc(tok: string, t0: number, dest?: AudioNode) {
  switch (tok) {
    case "K": kick(t0, 0.9, dest); break;
    case "S": noiseHit(t0, 0.16, 0.5, 1400, 7000, dest); kick(t0, 0.25, dest); break;
    case "H": noiseHit(t0, 0.04, 0.22, 8000, undefined, dest); break;
    case "h": noiseHit(t0, 0.035, 0.13, 8500, undefined, dest); break;
    case "k": kick(t0, 0.55, dest); break;
    case "r": noiseHit(t0, 0.03, 0.28, 1600, 2600, dest); break;
  }
}
function duckMusic() { // dip the loop under a sting, then bring it back
  if (!ctx || !musicBus || !current) return;
  const n = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(n);
  musicBus.gain.setValueAtTime(musicBus.gain.value, n);
  musicBus.gain.linearRampToValueAtTime(0.22, n + 0.03);
  musicBus.gain.setValueAtTime(0.22, n + 0.55);
  musicBus.gain.linearRampToValueAtTime(1, n + 0.8);
}

/* ---- song data ---- */
const seq = (notes: Note[], dur: number): [Note, number][] => notes.map((n) => [n, dur]);
const rep = (arr: Note[], n: number): Note[] => { let o: Note[] = []; for (let i = 0; i < n; i++) o = o.concat(arr); return o; };

const Lprog = ["C", "F", "C", "G", "C", "F", "G", "C"] as const;
const Larp: Record<string, Note[]> = { C: ["C4", "E4", "G4", "E4"], F: ["C4", "F4", "A4", "F4"], G: ["D4", "G4", "B4", "G4"] };
const Lbass: Record<string, Note[]> = { C: ["C2", "G2"], F: ["F2", "C3"], G: ["G2", "D3"] };

const letris: Song = {
  bpm: 152, swing: 0,
  ch: [
    { type: "pulse" as OscillatorType, duty: 0.5, vol: 0.16, notes: ([] as [Note, number][]).concat(
      seq(["G5", "G5", "A5", "G5", "E5", "C5", "E5", "G5"], 2),
      seq(["F5", "F5", "G5", "F5", "D5", "A#4", "D5", "F5"], 2),
      seq(["E5", "E5", "F5", "E5", "C5", "G4", "C5", "E5"], 2),
      seq(["D5", "E5", "F5", "G5", "A5", "0", "G5", "0"], 2),
      seq(["G5", "G5", "A5", "G5", "E5", "C5", "E5", "G5"], 2),
      seq(["F5", "F5", "G5", "F5", "D5", "A#4", "D5", "G5"], 2),
      seq(["E5", "G5", "C6", "B5", "A5", "G5", "F5", "E5"], 2),
      seq(["D5", "F5", "E5", "D5", "C5", "0", "0", "0"], 2)) },
    { type: "pulse" as OscillatorType, duty: 0.25, vol: 0.075, notes: ([] as [Note, number][]).concat(...Lprog.map((c) => seq(rep(Larp[c], 4), 1))) },
    { type: "triangle", vol: 0.22, notes: ([] as [Note, number][]).concat(...Lprog.map((c) => seq(rep(Lbass[c], 4), 2))) },
  ],
  drums: ("K.H.S.H.K.H.S.H.".repeat(7) + "K.H.S.H.K.HSHSKSKS").split(""),
};

const conveyor: Song = {
  bpm: 112, swing: 0.34,
  ch: [
    { type: "pulse" as OscillatorType, duty: 0.5, vol: 0.14, notes: [
      ["E5", 3], ["0", 1], ["C5", 2], ["D5", 2], ["E5", 4], ["0", 4],
      ["F5", 3], ["0", 1], ["D5", 2], ["E5", 2], ["F5", 4], ["A5", 4],
      ["B4", 2], ["D5", 2], ["F5", 2], ["D5", 2], ["B4", 4], ["0", 4],
      ["C5", 3], ["0", 1], ["E5", 2], ["G5", 2], ["E5", 4], ["0", 4],
      ["A5", 3], ["0", 1], ["F5", 2], ["E5", 2], ["F5", 4], ["0", 4],
      ["D5", 2], ["F5", 2], ["A5", 2], ["F5", 2], ["D5", 4], ["0", 4],
      ["G#4", 2], ["B4", 2], ["D5", 2], ["B4", 2], ["E5", 4], ["0", 4],
      ["E5", 3], ["0", 1], ["C5", 2], ["A4", 2], ["A4", 4], ["0", 4]] },
    { type: "pulse" as OscillatorType, duty: 0.25, vol: 0.06, notes: [
      ["0", 6], [["C4", "E4", "G4"], 2], ["0", 6], [["C4", "E4", "G4"], 2],
      ["0", 6], [["F4", "A4", "C5"], 2], ["0", 6], [["F4", "A4", "C5"], 2],
      ["0", 6], [["B4", "D5", "F5"], 2], ["0", 6], [["B4", "D5", "F5"], 2],
      ["0", 6], [["E4", "G4", "B4"], 2], ["0", 6], [["E4", "G4", "B4"], 2],
      ["0", 6], [["A4", "C5", "E5"], 2], ["0", 6], [["A4", "C5", "E5"], 2],
      ["0", 6], [["D5", "F5", "A5"], 2], ["0", 6], [["D5", "F5", "A5"], 2],
      ["0", 6], [["G#4", "B4", "D5"], 2], ["0", 6], [["G#4", "B4", "D5"], 2],
      ["0", 6], [["C4", "E4", "G4"], 2], ["0", 6], [["C4", "E4", "G4"], 2]] },
    { type: "triangle", vol: 0.24, notes: ([] as [Note, number][]).concat(
      seq(["A2", "C3", "E3", "G3"], 4), seq(["D3", "F3", "A3", "C3"], 4),
      seq(["G2", "B2", "D3", "F3"], 4), seq(["C3", "E3", "G3", "B3"], 4),
      seq(["F2", "A2", "C3", "E3"], 4), seq(["B2", "D3", "F3", "A3"], 4),
      seq(["E2", "G#2", "B2", "D3"], 4), seq(["A2", "E3", "G3", "E3"], 4)) },
  ],
  drums: "k.h.r.h.k.h.r.h.".repeat(8).split(""),
};

// Storm track — A-minor, 168 bpm, no swing. Driving eighth-note triangle bass,
// two-note arpeggio pulse, urgent descending/ascending lead. 128 steps = 8 bars.
const storm: Song = {
  bpm: 168, swing: 0,
  ch: [
    // Lead: dramatic A-minor run — descend, ascend, leap, cascade, resolve
    { type: "pulse" as OscillatorType, duty: 0.5, vol: 0.15, notes: [
      ["A5",2],["G5",2],["F5",2],["E5",2],["D5",2],["C5",2],["B4",2],["A4",2], // bar 1
      ["A4",2],["B4",2],["C5",2],["D5",2],["E5",2],["F5",2],["G5",2],["A5",2], // bar 2
      ["F5",2],["E5",2],["D5",2],["C5",2],["A4",2],["C5",2],["E5",2],["F5",2], // bar 3
      ["C5",2],["E5",2],["G5",2],["E5",2],["C5",2],["B4",2],["A4",2],["G4",2], // bar 4
      ["A4",2],["A5",2],["G5",2],["F5",2],["E5",2],["D5",2],["C5",2],["B4",2], // bar 5
      ["A4",2],["E5",2],["A5",2],["E5",2],["A5",2],["G5",2],["F5",2],["E5",2], // bar 6
      ["E5",2],["D5",2],["C5",2],["B4",2],["A4",2],["G#4",2],["A4",2],["0",2], // bar 7
      ["E5",2],["E5",2],["F5",2],["G5",2],["A5",2],["0",2],["0",2],["0",2],   // bar 8
    ]},
    // Arp: two-note pulse outlining chord changes every 2 bars
    { type: "pulse" as OscillatorType, duty: 0.25, vol: 0.065, notes: [
      ["A4",2],["C5",2],["A4",2],["C5",2],["A4",2],["C5",2],["A4",2],["C5",2], // Am bar 1
      ["A4",2],["C5",2],["A4",2],["C5",2],["A4",2],["C5",2],["A4",2],["C5",2], // Am bar 2
      ["F4",2],["A4",2],["F4",2],["A4",2],["F4",2],["A4",2],["F4",2],["A4",2], // F  bar 3
      ["F4",2],["A4",2],["F4",2],["A4",2],["F4",2],["A4",2],["F4",2],["A4",2], // F  bar 4
      ["A4",2],["E5",2],["A4",2],["E5",2],["A4",2],["E5",2],["A4",2],["E5",2], // Am bar 5
      ["A4",2],["E5",2],["A4",2],["E5",2],["A4",2],["E5",2],["A4",2],["E5",2], // Am bar 6
      ["E4",2],["B4",2],["E4",2],["B4",2],["E4",2],["B4",2],["E4",2],["B4",2], // E  bar 7
      ["E4",2],["B4",2],["E4",2],["B4",2],["E4",2],["B4",2],["E4",2],["B4",2], // E  bar 8
    ]},
    // Bass: driving eighth-note triangle — A-minor / F / A-minor / E progression
    { type: "triangle", vol: 0.25, notes: [
      ["A2",2],["E3",2],["A2",2],["C3",2],["A2",2],["E3",2],["G2",2],["E3",2], // Am
      ["A2",2],["E3",2],["A2",2],["C3",2],["A2",2],["E3",2],["G2",2],["E3",2], // Am
      ["F2",2],["C3",2],["F2",2],["A2",2],["F2",2],["C3",2],["E3",2],["C3",2], // F
      ["F2",2],["C3",2],["F2",2],["A2",2],["F2",2],["C3",2],["E3",2],["C3",2], // F
      ["A2",2],["E3",2],["A2",2],["C3",2],["A2",2],["E3",2],["G2",2],["E3",2], // Am
      ["A2",2],["E3",2],["A2",2],["C3",2],["A2",2],["E3",2],["G2",2],["E3",2], // Am
      ["E3",2],["B2",2],["E3",2],["G#3",2],["E3",2],["B2",2],["D3",2],["B2",2], // E
      ["E3",2],["B2",2],["E3",2],["G#3",2],["E3",2],["B2",2],["D3",2],["B2",2], // E
    ]},
  ],
  drums: ("KhhhShkhKhhhShkh".repeat(4) + "KHhHShHhKHhHSHhH".repeat(4)).split(""),
};

const SONGS: Record<string, Song> = { letris, conveyor, storm };
function prepare(song: Song) {
  const L = 128; song.len = L;
  song.ch.forEach((c) => { const map: Record<number, { note: Note; dur: number }> = {}; let step = 0; c.notes.forEach(([note, dur]) => { map[step] = { note, dur }; step += dur; }); c.byStep = map; });
}
Object.values(SONGS).forEach(prepare);

/* ---- scheduler ---- */
let current: string | null = null;
let step = 0, nextTime = 0;
let timer: number | null = null;
const LOOKAHEAD = 0.1, TICK = 25;

function scheduleStep(song: Song, s: number, t: number) {
  const spb = (60 / song.bpm / 4) * tempoScale;
  const swingDelay = s % 4 === 2 ? spb * 2 * song.swing * 0.5 : 0;
  song.ch.forEach((c) => {
    const ev = c.byStep![s]; if (!ev) return;
    const dur = ev.dur * spb, at = t + swingDelay;
    if (Array.isArray(ev.note)) ev.note.forEach((nn) => tone(c.type, freq(nn), at, dur, c.vol, c.duty, musicBus!));
    else if (ev.note !== "0") tone(c.type, freq(ev.note), at, dur, c.vol, c.duty, musicBus!);
  });
  const tok = song.drums[s];
  if (tok && tok !== ".") perc(tok, t, musicBus!);
}
function loop() {
  if (!current || !ctx) return;
  const song = SONGS[current];
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(song, step, nextTime);
    nextTime += (60 / song.bpm / 4) * tempoScale;
    step = (step + 1) % song.len!;
  }
}

export const chiptune = {
  play(key: string) {
    if (!SONGS[key]) return;
    initAudio();
    if (ctx!.state === "suspended") ctx!.resume();
    tempoScale = 1; // a fresh tune always starts at normal speed (no cross-game leak)
    this.stop(); // kill any prior loop + its ringing tail so the new tune starts clean
    const n = ctx!.currentTime;
    musicBus!.gain.cancelScheduledValues(n);
    musicBus!.gain.setValueAtTime(1, n);
    current = key; step = 0; nextTime = n + 0.08;
    timer = window.setInterval(loop, TICK);
    loop();
  },
  stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
    current = null;
    // The loop schedules notes (incl. ~1s held bass) ahead of time into musicBus.
    // Clearing the interval stops NEW notes, but already-scheduled oscillators keep
    // ringing — that tail overlaps the next tune. Disconnect the bus they're routed
    // through and swap in a fresh one to cut them dead instantly.
    if (ctx && musicBus && master) {
      try { musicBus.disconnect(); } catch { /* already gone */ }
      musicBus = ctx.createGain();
      musicBus.gain.value = 1;
      musicBus.connect(master);
    }
  },
  toggle(key: string) { if (current === key) this.stop(); else this.play(key); },
  playing(): string | null { return current; },
  // Slow (or restore) the running loop's tempo — 1 = normal, >1 = slower.
  setTempoScale(s: number) { tempoScale = Math.max(0.25, Math.min(4, s)); },
  setVolume(v: number) { vol = Math.max(0, Math.min(1, v)); if (master && !isSoundMuted()) master.gain.value = vol * 0.5; },
  // site-wide correct-answer "ta-daa" (Dan, 2026-07-05): a light two-note
  // ascending major arpeggio — bright but deliberately smaller and quieter
  // than fanfare(). Routes through `master`, so the volume slider governs it.
  correct() {
    initAudio();
    if (ctx!.state === "suspended") ctx!.resume();
    const t = ctx!.currentTime + 0.02;
    tone("triangle", freq("C5"), t, 0.1, 0.18);
    tone("square", freq("C5"), t, 0.1, 0.05);
    tone("triangle", freq("G5"), t + 0.1, 0.18, 0.18);
    tone("square", freq("G5"), t + 0.1, 0.18, 0.05);
  },
  // site-wide wrong-answer sound: a short, soft low descending buzz —
  // gentle feedback, not punishment. Same master routing as correct().
  wrong() {
    initAudio();
    if (ctx!.state === "suspended") ctx!.resume();
    const t = ctx!.currentTime + 0.02;
    tone("sawtooth", freq("E3"), t, 0.12, 0.09);
    tone("sawtooth", freq("D#3"), t + 0.11, 0.14, 0.08);
  },
  // wordless victory jingle (C major rising run → climbing line → held tonic chord + crash)
  fanfare() {
    initAudio();
    if (ctx!.state === "suspended") ctx!.resume();
    const t = ctx!.currentTime + 0.04;
    const lead: [string, number, number][] = [
      ["C5", 0.0, 0.085], ["E5", 0.085, 0.085], ["G5", 0.17, 0.085], ["C6", 0.255, 0.11],
      ["E6", 0.375, 0.15], ["G6", 0.56, 0.18],
      ["F6", 0.76, 0.085], ["E6", 0.845, 0.085], ["D6", 0.93, 0.085], ["C6", 1.015, 0.11],
      ["G5", 1.17, 0.11], ["C6", 1.33, 0.78],
    ];
    const harm: [string[], number, number][] = [[["E5"], 0.375, 0.34], [["E5", "G5", "C5"], 1.33, 0.78]];
    const bass: [string, number, number][] = [["C3", 0.0, 0.26], ["G2", 0.56, 0.28], ["G2", 1.17, 0.14], ["C2", 1.33, 0.84]];
    const drm: [string, number][] = [["K", 0.0], ["h", 0.93], ["h", 1.015], ["h", 1.1], ["h", 1.185], ["h", 1.27], ["crash", 1.33]];
    lead.forEach((a) => tone("pulse" as OscillatorType, freq(a[0]), t + a[1], a[2], 0.18, 0.5));
    harm.forEach((a) => a[0].forEach((x) => tone("pulse" as OscillatorType, freq(x), t + a[1], a[2], 0.09, 0.25)));
    bass.forEach((a) => tone("triangle", freq(a[0]), t + a[1], a[2], 0.22));
    drm.forEach((a) => { if (a[0] === "crash") { noiseHit(t + a[1], 0.45, 0.4, 4000); kick(t + a[1], 0.7); } else perc(a[0], t + a[1]); });
  },
  // lose one life: duck the loop, play a short descending "uh-oh" sting (loop keeps going)
  lostLife() {
    initAudio();
    if (ctx!.state === "suspended") ctx!.resume();
    duckMusic();
    const t = ctx!.currentTime + 0.02;
    tone("pulse" as OscillatorType, freq("B4"), t + 0.0, 0.09, 0.16, 0.5);
    tone("pulse" as OscillatorType, freq("A4"), t + 0.09, 0.09, 0.16, 0.5);
    tone("pulse" as OscillatorType, freq("G4"), t + 0.18, 0.10, 0.16, 0.5);
    bendTone(freq("E4"), freq("D4"), t + 0.30, 0.32, 0.16, 0.5);
    tone("triangle", freq("A2"), t + 0.0, 0.22, 0.20);
    tone("triangle", freq("E2"), t + 0.30, 0.34, 0.20);
    perc("r", t + 0.0); kick(t + 0.30, 0.5);
  },
  // thunder crack + rumble: short noise crack, long low-pass rumble, double kick
  thunder() {
    initAudio();
    if (ctx!.state === "suspended") ctx!.resume();
    duckMusic();
    const t = ctx!.currentTime + 0.02;
    noiseHit(t, 0.18, 0.65, 300, 3500);   // sharp crack (mid-band)
    noiseHit(t + 0.06, 1.6, 0.55, undefined, 180); // deep rumble
    noiseHit(t + 0.10, 1.0, 0.35, undefined, 110); // sub rumble tail
    kick(t, 0.9);
    kick(t + 0.14, 0.55);
  },
  // all lives gone: stop the loop, play a sad A-minor descent
  gameOver() {
    this.stop();
    initAudio();
    if (ctx!.state === "suspended") ctx!.resume();
    const t = ctx!.currentTime + 0.04;
    const lead: [string, number, number][] = [
      ["E5", 0.0, 0.34], ["D5", 0.34, 0.17], ["C5", 0.51, 0.17], ["B4", 0.68, 0.51],
      ["C5", 1.19, 0.17], ["B4", 1.36, 0.17], ["A4", 1.53, 0.34], ["G#4", 1.87, 0.34], ["A4", 2.21, 0.66],
    ];
    const harm: [string, number, number][] = [["G4", 0.68, 0.25], ["E4", 1.87, 0.25], ["C5", 2.21, 0.25]];
    const bass: [string, number, number][] = [["A2", 0.0, 0.66], ["E2", 0.68, 0.34], ["F2", 1.53, 0.34], ["E2", 1.87, 0.34], ["A2", 2.21, 0.66], ["A2", 2.95, 0.95]];
    lead.forEach((a) => tone("pulse" as OscillatorType, freq(a[0]), t + a[1], a[2], 0.18, 0.5));
    harm.forEach((a) => tone("pulse" as OscillatorType, freq(a[0]), t + a[1], a[2], 0.07, 0.25));
    tone("pulse" as OscillatorType, freq("A3"), t + 2.95, 0.95, 0.14, 0.5);
    tone("pulse" as OscillatorType, freq("C4"), t + 2.95, 0.95, 0.07, 0.25);
    tone("pulse" as OscillatorType, freq("E4"), t + 2.95, 0.95, 0.07, 0.25);
    bass.forEach((a) => tone("triangle", freq(a[0]), t + a[1], a[2], 0.22));
    kick(t + 0.0, 0.4); kick(t + 2.95, 0.45);
  },
};
