"use client";

/**
 * « Devine d'abord ! » — the guess-first activity (Dan, 2026-07-14).
 * aliments runs on its photo bank (public/devine + devine-aliments.json);
 * every other DEVINE_READY deck runs on its items' emoji as the image
 * (Dan approved the generalization the same day). Five modes (Mixte /
 * Mot→Image / Image→Mot / 🎤 Répète / 🎤 Devine et dis), accent-tolerant
 * Say It grading, keyboard 1–4/⏎/R, Cahier skin, and every answer pays
 * XP + streak + SRS through recordItemResult (which also writes the
 * teacher evidence trail).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import CahierShell, { withActive, deckActivityTabs } from "@/components/CahierShell";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";
import { sfx } from "@/games/audio/sfx";
import { logEvent } from "@/lib/firebase/usage";
import { useChoiceKeys, CHOICE_KEYS_HINT } from "@/lib/useChoiceKeys";
import PHOTO_ITEMS from "@/content/devine-aliments.json";

/** One playable card: the word, its grammar tag (colored), and its visual
 *  (photo for aliments, emoji elsewhere). s = aliments pack number. */
type DevItem = { w: string; tag: string | null; color: string; img?: string; emoji?: string; s?: number };

type Mode = "mix" | "wi" | "iw" | "say-t" | "say-s";
type Dir = "wi" | "iw" | "say-t" | "say-s";

const MASC = "#0b63c4";
const FEM = "#e0567f";
const INK = "var(--cahier-ink)";

/* Accent-tolerant, article-optional matching — as in the original. */
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

/** Grammar tag + color from the French article (emoji decks have no g/n
 *  fields — the article says it). Null when the article is mute (l', …). */
function tagFromArticle(w: string): { tag: string | null; color: string } {
  const lw = w.toLowerCase();
  if (/^(les|des) /.test(lw)) return { tag: "pluriel", color: INK };
  if (/^(le|un) /.test(lw)) return { tag: "masculin", color: MASC };
  if (/^(la|une) /.test(lw)) return { tag: "féminin", color: FEM };
  return { tag: null, color: INK };
}

/** Building-look emojis are banned from Devine (Dan, 2026-07-15): a generic
 *  storefront/tower can't tell épicerie from magasin (🏪 even serves two
 *  words in the same deck). Only unmistakable buildings stay — ⛪ église,
 *  🏟️ stade, 🚉 gare read as themselves. The items stay in every other
 *  activity; they just can't be guessed from a picture. */
const BUILDING_EMOJI = new Set(["🏬", "🏪", "🏛️", "🏛", "🏦", "🏥", "🏫", "🏨", "🏢", "🏤", "🏣", "🏩", "🏭"]);

/** The article an item's letris column tag encodes (Dan, 2026-07-14: "ALL
 *  articles in such exercises are inseparable from the nouns") — countries
 *  and lieux store bare nouns and sort them into article columns. */
const COL_ARTICLE: Record<string, string> = {
  "col:le": "le ", "col:la": "la ", "col:l_apos": "l'", "col:les": "les ",
  "col:un": "un ", "col:une": "une ", "col:des": "des ",
};
function withArticle(fr: string, tags: string[] | undefined): string {
  if (/^(le |la |les |l'|un |une |des |du )/i.test(fr)) return fr;
  const col = (tags ?? []).find((t) => t in COL_ARTICLE);
  return col ? COL_ARTICLE[col] + fr : fr;
}

function buildItems(collectionId: string): { items: DevItem[]; subtitle: string; hasPacks: boolean } {
  if (collectionId === "aliments") {
    const items = (PHOTO_ITEMS as { w: string; g: "m" | "f"; n: 0 | 1; s: 1 | 2; img: string }[]).map((it) => ({
      w: it.w,
      tag: (it.n ? "pluriel · " : "") + (it.g === "m" ? "masculin" : "féminin"),
      color: it.g === "m" ? MASC : FEM,
      img: it.img,
      s: it.s,
    }));
    return { items, subtitle: "Les aliments", hasPacks: true };
  }
  const deck = CURATED.find((c) => c.id === collectionId);
  const items = (deck?.items ?? [])
    .filter((it) => it.fr && it.emoji && !BUILDING_EMOJI.has(it.emoji))
    .map((it) => {
      const w = withArticle(it.fr, it.tags);
      return { w, ...tagFromArticle(w), emoji: it.emoji as string };
    });
  return { items, subtitle: deck?.title ?? collectionId, hasPacks: false };
}

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

type Trial = { it: DevItem; dir: Dir };

function Visual({ it, className }: { it: DevItem; className: string }) {
  return it.img ? (
    <img src={it.img} alt="" className={`${className} bg-white object-contain`} />
  ) : (
    <span aria-hidden className={`${className} flex items-center justify-center bg-white text-6xl`}>
      {it.emoji}
    </span>
  );
}

export default function DevineContent({ collectionId }: { collectionId: string }) {
  const { items: ITEMS, subtitle, hasPacks } = useMemo(() => buildItems(collectionId), [collectionId]);
  const [screen, setScreen] = useState<"start" | "quiz" | "end">("start");
  const [mode, setMode] = useState<Mode>("mix");
  const [deck, setDeck] = useState<"all" | "1" | "2">("all");
  const [sttOk, setSttOk] = useState(false);
  const [queue, setQueue] = useState<Trial[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<DevItem[]>([]);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<DevItem | null>(null);
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [opts, setOpts] = useState<DevItem[]>([]);
  const [verdictGood, setVerdictGood] = useState<boolean | null>(null);
  const recRef = useRef<RecLike | null>(null);
  const retryRef = useRef<DevItem[] | null>(null);

  useEffect(() => { setSttOk(getRec() !== null); }, []);
  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const pool = (): DevItem[] =>
    retryRef.current ?? (deck === "all" || !hasPacks ? ITEMS : ITEMS.filter((i) => i.s === Number(deck)));

  const distractors = (it: DevItem): DevItem[] => {
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
    void logEvent("game.start", { game: "devine", collectionId });
    setScreen("quiz");
    prepare(q, 0);
  };

  /** One graded outcome — XP/streak/SRS + the teacher evidence trail. */
  const grade = (it: DevItem, good: boolean, given?: string) => {
    recordItemResult(`devine:${baseWord(it.w)}`, good, given);
    if (good) { setScore((s) => s + 1); sfx.correct(); } else { setWrong((w) => [...w, it]); sfx.wrong(); }
    setVerdictGood(good);
    setLocked(true);
    speak(it.w, "fr-FR");
  };

  const pick = (o: DevItem, it: DevItem) => {
    if (locked) return;
    setPicked(o);
    grade(it, o === it, o.w);
  };

  const listen = (it: DevItem) => {
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
    if (idx + 1 >= queue.length) {
      void logEvent("game.end", { game: "devine", collectionId, score });
      setScreen("end");
      return;
    }
    setIdx(idx + 1);
    prepare(queue, idx + 1);
  };

  const again = (retryWrong: boolean) => {
    retryRef.current = retryWrong ? [...new Set(wrong)] : null;
    start();
    if (!retryWrong) retryRef.current = null;
  };

  const t = queue[idx];
  useChoiceKeys({
    count: opts.length,
    enabled: screen === "quiz" && !!t,
    onPick: (i) => { const o = opts[i]; if (o && t && !locked) pick(o, t.it); },
    onNext: next,
    // In « Devine et dis » the word must not be heard before answering.
    onSpeak: () => { if (t && (t.dir !== "say-s" || locked)) speak(t.it.w, "fr-FR"); },
  });
  const pillCls = (sel: boolean) =>
    `rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition ${
      sel ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
    }`;
  const card = "rounded-2xl border-2 border-[color:var(--cahier-ink)]/25 bg-white p-4";

  return (
    <CahierShell tabs={withActive(deckActivityTabs(collectionId), "devine")} active="devine" crumb="🔮 Devine d'abord">
      <div className="mx-auto max-w-2xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🔮 Devine d&rsquo;abord ! <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· {subtitle}</span>
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
              <h2 className="text-base font-black text-[color:var(--cahier-ink)]">{hasPacks ? "1 · Choisis ta direction" : "Choisis ta direction"}</h2>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {([
                  ["mix", "Mixte", "les deux directions"],
                  ["wi", "Mot → Image", "lis le mot, choisis l'image"],
                  ["iw", "Image → Mot", "regarde l'image, choisis le mot"],
                  ...(sttOk
                    ? ([["say-t", "🎤 Répète", "écoute, puis dis-le"], ["say-s", "🎤 Devine et dis", "image seule — dis le mot"]] as const)
                    : []),
                ] as [Mode, string, string][]).map(([m, label, hint]) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={pillCls(mode === m)}>
                    {label} <span className="block text-xs font-normal opacity-70">{hint}</span>
                  </button>
                ))}
              </div>
            </div>
            {hasPacks && (
              <div className={card}>
                <h2 className="text-base font-black text-[color:var(--cahier-ink)]">2 · Choisis ton paquet</h2>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {([
                    ["all", "Tout", ITEMS.length],
                    ["1", "Fruits, légumes & douceurs", ITEMS.filter((i) => i.s === 1).length],
                    ["2", "À table : viandes, laitages, épicerie", ITEMS.filter((i) => i.s === 2).length],
                  ] as ["all" | "1" | "2", string, number][]).map(([d, label, count]) => (
                    <button key={d} type="button" onClick={() => setDeck(d)} className={pillCls(deck === d)}>
                      {label} <span className="block text-xs font-normal opacity-70">{count} mots</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[color:var(--cahier-ink-soft)]">
                  <i className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: MASC }} /> masculin ·{" "}
                  <i className="mx-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: FEM }} /> féminin — comme sur tes fiches !
                </p>
              </div>
            )}
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
            <p className="mt-1 hidden text-right text-[10px] font-bold text-[color:var(--cahier-ink-soft)] sm:block">{CHOICE_KEYS_HINT}</p>

            <div className={`${card} mt-4 text-center`}>
              {(t.dir === "say-t" || t.dir === "say-s") ? (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">
                    {t.dir === "say-t" ? "Écoute, puis dis-le à voix haute" : "Qu'est-ce que c'est ? Dis-le en français !"}
                  </p>
                  <Visual it={t.it} className="mx-auto mt-3 h-40 w-40 rounded-xl border-2 border-[color:var(--cahier-ink)]/20" />
                  {t.dir === "say-t" && (
                    <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="mt-2 text-xl font-black" style={{ color: t.it.color }} title="🔊">
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
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">Choisis la bonne image</p>
                  <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="mt-1 text-2xl font-black" style={{ color: t.it.color }} title="🔊">
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
                        <span className="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 text-xs font-bold text-white">{i + 1}</span>
                        <Visual it={o} className="h-32 w-full sm:h-40" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">Choisis le bon mot</p>
                  <Visual it={t.it} className="mx-auto mt-2 h-40 w-40 rounded-xl border-2 border-[color:var(--cahier-ink)]/20" />
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
                  <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="mt-1 text-xl font-black" style={{ color: t.it.color }}>
                    {t.it.w} 🔊
                  </button>
                  {t.it.tag && <p className="text-xs italic text-[color:var(--cahier-ink-soft)]">{t.it.tag}</p>}
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
                ? "Parfait ! Tu connais tous ces mots."
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
