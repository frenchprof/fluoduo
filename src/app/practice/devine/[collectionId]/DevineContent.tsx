"use client";

/**
 * « Devine d'abord ! » — the guess-first food activity, native (Dan,
 * 2026-07-14: "included under Unit 4, not as a supplement… count XP like
 * other pages… reskinned into the current fluolingo look"). Port of the
 * standalone public/supplements/aliments-devine.html: same five modes
 * (Mixte / Mot→Image / Image→Mot / 🎤 Répète / 🎤 Devine et dis), same
 * accent-tolerant Say It grading, now in the Cahier skin with every answer
 * paying XP + streak + SRS through recordItemResult (which also writes the
 * teacher evidence trail). Photos live in /public/devine; data in
 * src/content/devine-aliments.json.
 */

import { useEffect, useRef, useState } from "react";
import CahierShell, { withActive, deckActivityTabs } from "@/components/CahierShell";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";
import { sfx } from "@/games/audio/sfx";
import ITEMS_RAW from "@/content/devine-aliments.json";

type Item = { w: string; g: "m" | "f"; n: 0 | 1; s: 1 | 2; img: string };
const ITEMS = ITEMS_RAW as Item[];

type Mode = "mix" | "wi" | "iw" | "say-t" | "say-s";
type Dir = "wi" | "iw" | "say-t" | "say-s";
type Deck = "all" | "1" | "2";

/* Accent-tolerant, article-optional matching — as in the supplement. */
const strip = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
const baseWord = (w: string) =>
  strip(w).replace(/^(les?|la|l'|une?|des|du|de la) /, "").replace(/^l'/, "");
const saidRight = (heard: string, w: string) => {
  const h = strip(heard);
  return h.includes(baseWord(w)) || h.replace(/ /g, "").includes(baseWord(w).replace(/[' ]/g, ""));
};
const shuffle = <T,>(a: T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

type RecLike = {
  lang: string; interimResults: boolean; maxAlternatives: number;
  start: () => void; stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};
function getRec(): RecLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => RecLike; webkitSpeechRecognition?: new () => RecLike };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

const gtxt = (it: Item) => (it.n ? "pluriel · " : "") + (it.g === "m" ? "masculin" : "féminin");
const genderColor = (it: Item) => (it.g === "m" ? "#0b63c4" : "#e0567f");

type Trial = { it: Item; dir: Dir };

export default function DevineContent({ collectionId }: { collectionId: string }) {
  const [screen, setScreen] = useState<"start" | "quiz" | "end">("start");
  const [mode, setMode] = useState<Mode>("mix");
  const [deck, setDeck] = useState<Deck>("all");
  const [sttOk, setSttOk] = useState(false);
  const [queue, setQueue] = useState<Trial[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<Item[]>([]);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<Item | null>(null);
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [opts, setOpts] = useState<Item[]>([]);
  const [verdictGood, setVerdictGood] = useState<boolean | null>(null);
  const recRef = useRef<RecLike | null>(null);
  const retryRef = useRef<Item[] | null>(null);

  useEffect(() => { setSttOk(getRec() !== null); }, []);
  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const pool = (): Item[] =>
    retryRef.current ?? (deck === "all" ? ITEMS : ITEMS.filter((i) => i.s === Number(deck)));

  const distractors = (it: Item): Item[] => {
    const same = pool().filter((x) => x !== it);
    const base = same.length >= 3 ? same : ITEMS.filter((x) => x !== it);
    return shuffle(base).slice(0, 3);
  };

  const prepare = (q: Trial[], i: number) => {
    const t = q[i];
    setPicked(null); setHeard(""); setVerdictGood(null); setLocked(false);
    if (t.dir === "wi" || t.dir === "iw") setOpts(shuffle([t.it, ...distractors(t.it)]));
    else setOpts([]);
    if (t.dir === "say-t") speak(t.it.w, "fr-FR");
  };

  const start = () => {
    const q = shuffle(pool()).map((it) => ({
      it,
      dir: (mode === "mix" ? (Math.random() < 0.5 ? "wi" : "iw") : mode) as Dir,
    }));
    setQueue(q); setIdx(0); setScore(0); setWrong([]);
    setScreen("quiz");
    prepare(q, 0);
  };

  /** One graded outcome — XP/streak/SRS + the teacher evidence trail. */
  const grade = (it: Item, good: boolean, given?: string) => {
    recordItemResult(`devine:${baseWord(it.w)}`, good, given);
    if (good) { setScore((s) => s + 1); sfx.correct(); } else { setWrong((w) => [...w, it]); sfx.wrong(); }
    setVerdictGood(good);
    setLocked(true);
    speak(it.w, "fr-FR");
  };

  const pick = (o: Item, it: Item) => {
    if (locked) return;
    setPicked(o);
    grade(it, o === it, o.w);
  };

  const listen = (it: Item) => {
    if (recRef.current) { try { recRef.current.stop(); } catch {} recRef.current = null; setListening(false); return; }
    const rec = getRec();
    if (!rec) return;
    window.speechSynthesis?.cancel();
    rec.lang = "fr-FR"; rec.interimResults = false; rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const alts = Array.from({ length: e.results[0]?.length ?? 0 }, (_, k) => e.results[0][k]?.transcript ?? "");
      const t = alts[0] ?? "";
      setHeard(t || "(rien entendu)");
      grade(it, alts.some((a) => saidRight(a, it.w)), t || "(rien entendu)");
    };
    rec.onerror = (e) => {
      recRef.current = null; setListening(false);
      if (e.error === "no-speech" && !locked) { setHeard("(rien entendu)"); grade(it, false, "(rien entendu)"); }
    };
    rec.onend = () => { recRef.current = null; setListening(false); };
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const next = () => {
    if (!locked) return;
    if (idx + 1 >= queue.length) { setScreen("end"); return; }
    setIdx(idx + 1);
    prepare(queue, idx + 1);
  };

  const again = (retryWrong: boolean) => {
    retryRef.current = retryWrong ? [...new Set(wrong)] : null;
    start();
    if (!retryWrong) retryRef.current = null;
  };

  const t = queue[idx];
  const pillCls = (sel: boolean) =>
    `rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition ${
      sel ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
    }`;
  const card = "rounded-2xl border-2 border-[color:var(--cahier-ink)]/25 bg-white p-4";

  return (
    <CahierShell tabs={withActive(deckActivityTabs(collectionId), "devine")} active="devine" crumb="🔮 Devine d'abord">
      <div className="mx-auto max-w-2xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🔮 Devine d&rsquo;abord ! <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· Les aliments</span>
        </h1>

        {screen === "start" && (
          <div className="mt-4 space-y-4">
            <div className={card}>
              <h2 className="text-base font-black text-[color:var(--cahier-ink)]">Comment ça marche ?</h2>
              <p className="mt-1 text-sm text-[color:var(--cahier-ink)]">
                <b>Devine d&rsquo;abord, la réponse vient ensuite.</b> Même si tu te trompes, essayer avant de voir la solution t&rsquo;aide à mieux retenir le mot.
              </p>
            </div>
            <div className={card}>
              <h2 className="text-base font-black text-[color:var(--cahier-ink)]">1 · Choisis ta direction</h2>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {([
                  ["mix", "Mixte", "les deux directions"],
                  ["wi", "Mot → Image", "lis le mot, choisis la photo"],
                  ["iw", "Image → Mot", "regarde la photo, choisis le mot"],
                  ...(sttOk
                    ? ([["say-t", "🎤 Répète", "écoute, puis dis-le"], ["say-s", "🎤 Devine et dis", "photo seule — dis le mot"]] as const)
                    : []),
                ] as [Mode, string, string][]).map(([m, label, hint]) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={pillCls(mode === m)}>
                    {label} <span className="block text-xs font-normal opacity-70">{hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={card}>
              <h2 className="text-base font-black text-[color:var(--cahier-ink)]">2 · Choisis ton paquet</h2>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([
                  ["all", "Tout", ITEMS.length],
                  ["1", "Fruits, légumes & douceurs", ITEMS.filter((i) => i.s === 1).length],
                  ["2", "À table : viandes, laitages, épicerie", ITEMS.filter((i) => i.s === 2).length],
                ] as [Deck, string, number][]).map(([d, label, count]) => (
                  <button key={d} type="button" onClick={() => setDeck(d)} className={pillCls(deck === d)}>
                    {label} <span className="block text-xs font-normal opacity-70">{count} mots</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[color:var(--cahier-ink-soft)]">
                <i className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: "#0b63c4" }} /> masculin ·{" "}
                <i className="mx-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: "#e0567f" }} /> féminin — comme sur tes fiches !
              </p>
            </div>
            <button type="button" onClick={() => { retryRef.current = null; start(); }} className="fluo-btn w-full font-black">
              C&rsquo;est parti ! →
            </button>
          </div>
        )}

        {screen === "quiz" && t && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[color:var(--cahier-ink-soft)]">
              <span>{idx + 1}/{queue.length}</span>
              <span>{score} pt</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full border-2 border-[color:var(--cahier-ink)]/30 bg-white">
              <div className="h-full rounded-full bg-[var(--fluo-hl)] transition-all" style={{ width: `${(100 * idx) / queue.length}%` }} />
            </div>

            <div className={`${card} mt-4 text-center`}>
              {(t.dir === "say-t" || t.dir === "say-s") ? (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">
                    {t.dir === "say-t" ? "Écoute, puis dis-le à voix haute" : "Qu'est-ce que c'est ? Dis-le en français !"}
                  </p>
                  <img src={t.it.img} alt="" className="mx-auto mt-3 h-40 w-40 rounded-xl border-2 border-[color:var(--cahier-ink)]/20 object-cover" />
                  {t.dir === "say-t" && (
                    <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="mt-2 text-xl font-black" style={{ color: genderColor(t.it) }} title="🔊">
                      {t.it.w} 🔊
                    </button>
                  )}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {t.dir === "say-t" && (
                      <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="fluo-btn fluo-btn-sm">🔊 Réécouter</button>
                    )}
                    <button
                      type="button"
                      onClick={() => listen(t.it)}
                      className={`fluo-btn fluo-btn-sm ${listening ? "!bg-rose-600 !text-white" : ""}`}
                      disabled={locked}
                    >
                      {listening ? "⏹ J'écoute…" : "🎤 Je le dis"}
                    </button>
                  </div>
                  {heard && <p className="mt-2 text-sm italic text-[color:var(--cahier-ink-soft)]">« {heard} »</p>}
                </>
              ) : t.dir === "wi" ? (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">Choisis la bonne photo</p>
                  <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="mt-1 text-2xl font-black" style={{ color: genderColor(t.it) }} title="🔊">
                    {t.it.w} 🔊
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {opts.map((o, i) => (
                      <button
                        key={o.w}
                        type="button"
                        onClick={() => pick(o, t.it)}
                        className={`relative overflow-hidden rounded-xl border-2 transition ${
                          locked
                            ? o === t.it
                              ? "border-emerald-600 ring-2 ring-emerald-400"
                              : o === picked
                                ? "border-rose-600 opacity-70"
                                : "border-slate-200 opacity-40"
                            : "border-slate-300 hover:border-slate-900"
                        }`}
                      >
                        <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-xs font-bold text-white">{i + 1}</span>
                        <img src={o.img} alt="" className="h-32 w-full object-cover sm:h-40" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">Choisis le bon mot</p>
                  <img src={t.it.img} alt="" className="mx-auto mt-2 h-40 w-40 rounded-xl border-2 border-[color:var(--cahier-ink)]/20 object-cover" />
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {opts.map((o, i) => (
                      <button
                        key={o.w}
                        type="button"
                        onClick={() => pick(o, t.it)}
                        className={`rounded-xl border-2 px-3 py-2.5 text-base font-bold transition ${
                          locked
                            ? o === t.it
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                              : o === picked
                                ? "border-rose-600 bg-rose-50 text-rose-900 line-through"
                                : "border-slate-200 text-slate-400"
                            : "border-slate-300 bg-white text-slate-800 hover:border-slate-900"
                        }`}
                      >
                        <span className="mr-2 text-xs opacity-60">{i + 1}</span>
                        {o.w}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {locked && (
                <div className={`mt-4 rounded-xl border-2 p-3 ${verdictGood ? "border-emerald-500 bg-emerald-50" : "border-rose-400 bg-rose-50"}`}>
                  <p className="text-sm font-black text-[color:var(--cahier-ink)]">
                    {verdictGood ? "Bravo !" : "Pas tout à fait…"}
                  </p>
                  <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="mt-1 text-xl font-black" style={{ color: genderColor(t.it) }}>
                    {t.it.w} 🔊
                  </button>
                  <p className="text-xs italic text-[color:var(--cahier-ink-soft)]">{gtxt(t.it)}</p>
                  <button type="button" onClick={next} className="fluo-btn fluo-btn-sm mt-2 font-black">
                    {idx + 1 >= queue.length ? "Résultat →" : "Suivant →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {screen === "end" && (
          <div className={`${card} mt-4 text-center`}>
            <p className="text-3xl font-black text-[color:var(--cahier-ink)]">{score} / {queue.length}</p>
            <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">
              {score === queue.length
                ? "Parfait ! Tu connais tous ces aliments."
                : score >= queue.length * 0.8
                  ? "Très bien ! Encore quelques mots à consolider."
                  : score >= queue.length * 0.5
                    ? "Bon début — refais tes erreurs pour les retenir."
                    : "Continue — deviner compte déjà comme apprentissage !"}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {wrong.length > 0 && (
                <button type="button" onClick={() => again(true)} className="fluo-btn fluo-btn-sm font-black">
                  🔁 Refaire mes erreurs ({[...new Set(wrong)].length})
                </button>
              )}
              <button type="button" onClick={() => again(false)} className="fluo-btn fluo-btn-sm">↻ Rejouer</button>
              <button type="button" onClick={() => { retryRef.current = null; setScreen("start"); }} className="fluo-btn fluo-btn-sm">⚙️ Options</button>
            </div>
          </div>
        )}
      </div>
    </CahierShell>
  );
}
