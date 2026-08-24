"use client";

/**
 * SpecuLearn (né « Devine d'abord ! », renamed by Dan 2026-07-15) — the
 * guess-first activity (Dan, 2026-07-14).
 * aliments runs on its photo bank (public/devine + devine-aliments.json);
 * every other SPECULEARN_READY deck runs on its items' emoji as the image
 * (Dan approved the generalization the same day). Accent-tolerant Say It
 * grading, keyboard 1–4/⏎/R, and every answer pays XP + streak + SRS
 * through recordItemResult (which also writes the teacher evidence trail).
 *
 * THE CONFIG WIZARD IS GONE (patch 20–21). The start screen asked a
 * first-year to pick a direction (5 modes) and a pack before the first
 * question — a curriculum decision they can't make. The drill now opens
 * straight into Mixte over the whole deck inside DrillShell; the 🎤 modes
 * (Répète / Devine et dis) survive as restart chips on the end card, where
 * a learner who has met the words can choose to say them.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import { hintsFor } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { sfx } from "@/games/audio/sfx";
import { logEvent } from "@/lib/firebase/usage";
import {
  BUILDING_EMOJI,
  SPECULEARN_EXCLUDED_ITEMS,
  SPECULEARN_ITEM_IMAGES,
  SPECULEARN_PROMPT_FRAME,
} from "@/lib/collections/speculearnReady";
import { deaccent, normalize } from "@/lib/practice/cloze";
import { useChoiceKeys, CHOICE_KEYS_HINT } from "@/lib/useChoiceKeys";
import PHOTO_ITEMS from "@/content/devine-aliments.json";
import { shuffle } from "@/lib/shuffle";

/** One playable card: the word, its grammar tag (colored), and its visual
 *  (photo for aliments, emoji elsewhere). s = aliments pack number. */
type DevItem = { w: string; tag: string | null; color: string; img?: string; emoji?: string; s?: number };

type Mode = "mix" | "say-t" | "say-s";
type Dir = "wi" | "iw" | "say-t" | "say-s";

const MASC = "#0b63c4";
const FEM = "#e0567f";
const INK = "var(--cahier-ink)";

/* Accent-tolerant, article-optional matching. The transforms come from THE
   grader (cloze.ts) since the unification (2026-08-11); only the SPEECH
   policy stays local — leading article optional, containment rather than
   equality (an ASR transcript wraps the word in a sentence), and a
   space-collapsed second pass. The l' elision is peeled BEFORE normalize
   deletes apostrophes, so « l'eau »'s base word stays "eau". */
const strip = (t: string) => deaccent(normalize(t));
const baseWord = (w: string) =>
  strip(w.replace(/^l['’]/i, "")).replace(/^(les?|la|une?|des|du|de la) /, "");
const saidRight = (heard: string, w: string) => {
  const h = strip(heard);
  const b = baseWord(w);
  return h.includes(b) || h.replace(/ /g, "").includes(b.replace(/ /g, ""));
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

function buildItems(collectionId: string): { items: DevItem[]; subtitle: string } {
  if (collectionId === "aliments") {
    const items = (PHOTO_ITEMS as { w: string; g: "m" | "f"; n: 0 | 1; s: 1 | 2; img: string }[]).map((it) => ({
      w: it.w,
      tag: (it.n ? "pluriel · " : "") + (it.g === "m" ? "masculin" : "féminin"),
      color: it.g === "m" ? MASC : FEM,
      img: it.img,
      s: it.s,
    }));
    return { items, subtitle: "Les aliments" };
  }
  const deck = CURATED.find((c) => c.id === collectionId);
  const items = (deck?.items ?? [])
    .filter(
      (it) =>
        it.fr &&
        !SPECULEARN_EXCLUDED_ITEMS.has(it.id) &&
        // A visual comes from EITHER the item's emoji (banned when it's a
        // building look-alike, see BUILDING_EMOJI) OR a purpose-made SVG
        // keyed by item id (SPECULEARN_ITEM_IMAGES) — never neither.
        ((it.emoji && !BUILDING_EMOJI.has(it.emoji)) || SPECULEARN_ITEM_IMAGES[it.id]),
    )
    .map((it) => {
      const w = withArticle(it.fr, it.tags);
      const img = SPECULEARN_ITEM_IMAGES[it.id];
      return { w, ...tagFromArticle(w), emoji: img ? undefined : (it.emoji as string), img };
    });
  return { items, subtitle: deck?.title ?? collectionId };
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

export default function SpecuLearnContent({ collectionId }: { collectionId: string }) {
  const { items: ITEMS, subtitle } = useMemo(() => buildItems(collectionId), [collectionId]);
  const [screen, setScreen] = useState<"quiz" | "end">("quiz");
  const [sttOk, setSttOk] = useState(false);
  const [queue, setQueue] = useState<Trial[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<DevItem[]>([]);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<DevItem | null>(null);
  // Select-then-commit (patch 20–21): tapping an option SELECTS; the shell's
  // Vérifier COMMITS. Speech trials commit on the mic result as before.
  const [selected, setSelected] = useState<DevItem | null>(null);
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [opts, setOpts] = useState<DevItem[]>([]);
  const [verdictGood, setVerdictGood] = useState<boolean | null>(null);
  // Track D: a wrong pick/say that is NOT final — struck option, pick again.
  const [retry, setRetry] = useState(false);
  const [struck, setStruck] = useState<DevItem[]>([]);
  const recRef = useRef<RecLike | null>(null);
  const retryRef = useRef<DevItem[] | null>(null);

  useEffect(() => { setSttOk(getRec() !== null); }, []);
  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const pool = (): DevItem[] => retryRef.current ?? ITEMS;

  const distractors = (it: DevItem): DevItem[] => {
    const same = pool().filter((x) => x !== it);
    const base = same.length >= 3 ? same : ITEMS.filter((x) => x !== it);
    return shuffle(base).slice(0, 3);
  };

  const prepare = (q: Trial[], i: number) => {
    const t = q[i];
    setPicked(null); setSelected(null); setHeard(""); setVerdictGood(null); setLocked(false);
    setRetry(false); setStruck([]);
    if (t.dir === "wi" || t.dir === "iw") setOpts(shuffle([t.it, ...distractors(t.it)]));
    else setOpts([]);
    if (t.dir === "say-t") speak(t.it.w, "fr-FR");
  };

  const start = (mode: Mode) => {
    const q = shuffle(pool()).map((it) => ({
      it,
      dir: (mode === "mix" ? (Math.random() < 0.5 ? "wi" : "iw") : mode) as Dir,
    }));
    setQueue(q); setIdx(0); setScore(0); setWrong([]);
    void logEvent("game.start", { game: "speculearn", collectionId });
    setScreen("quiz");
    prepare(q, 0);
  };

  // No start screen: the first question IS the first screen (the wizard is
  // gone). Shuffle must wait for the client — Math.random during render
  // breaks SSR hydration.
  const started = useRef(false);
  useEffect(() => {
    if (started.current || ITEMS.length === 0) return;
    started.current = true;
    start("mix");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ITEMS]);

  const t = queue[idx];
  // The help ladder (Track D). Picks: the struck wrong pick is the hint;
  // says: first letters, then the skeleton, then the word.
  const isSay = !!t && (t.dir === "say-t" || t.dir === "say-s");
  const hints = useMemo(
    () => (t ? hintsFor(isSay ? "say" : "mcq", { answer: t.it.w, options: opts.map((o) => o.w) }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t?.it.w, isSay, opts],
  );
  const ladder = useHelpLadder({
    kind: isSay ? "say" : "mcq",
    itemKey: t ? `${idx}:${t.it.w}` : null,
    itemId: t ? `devine:${baseWord(t.it.w)}` : undefined,
    surface: "speculearn",
    hints,
    reveal: t?.it.w ?? "",
    enabled: screen === "quiz" && !!t,
  });
  const struckSet = useMemo(() => {
    const out = new Set(struck.map((o) => o.w));
    for (const w of ladder.eliminated) if (w !== t?.it.w) out.add(w);
    return out;
  }, [struck, ladder.eliminated, t?.it.w]);

  /** One graded outcome — XP/streak/SRS + the teacher evidence trail (via
   *  the ladder, which stamps the assistance actually shown). */
  const grade = (it: DevItem, good: boolean, given?: string) => {
    // The devine: prefix predates the SpecuLearn rename — kept so every
    // learner's SRS history for these words survives (ids are invisible).
    const first = ladder.ladder.wrongTries === 0 && !ladder.revealed;
    const r = ladder.attempt(good, { given, activity: `speculearn:${collectionId}` });
    if (good) { if (first) setScore((s) => s + 1); sfx.correct(); } else { if (first) setWrong((w) => [...w, it]); sfx.wrong(); }
    if (r.effect === "done" || r.effect === "reveal") {
      setVerdictGood(good);
      setLocked(true);
      speak(it.w, "fr-FR");
    } else {
      // Not final: strike the pick (mcq) / keep the mic open (say), retry.
      if (selected) setStruck((k) => [...k, selected]);
      setSelected(null);
      setRetry(true);
    }
  };

  const pick = (o: DevItem) => {
    if (locked || struckSet.has(o.w)) return;
    setSelected(o);
  };

  const commit = (it: DevItem) => {
    if (locked || !selected) return;
    setPicked(selected);
    grade(it, selected === it, selected.w);
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
    ladder.skip();
    if (idx + 1 >= queue.length) {
      void logEvent("game.end", { game: "speculearn", collectionId, score });
      setScreen("end");
      return;
    }
    setIdx(idx + 1);
    prepare(queue, idx + 1);
  };

  const again = (retryWrong: boolean, mode: Mode = "mix") => {
    retryRef.current = retryWrong ? [...new Set(wrong)] : null;
    start(mode);
    if (!retryWrong) retryRef.current = null;
  };

  useChoiceKeys({
    count: opts.length,
    enabled: screen === "quiz" && !!t,
    onPick: (i) => { const o = opts[i]; if (o && t && !locked) pick(o); },
    // DrillShell's own Enter/Space binding fires the tray's Continue.
    onNext: undefined,
    // In « Devine et dis » the word must not be heard before answering.
    onSpeak: () => { if (t && (t.dir !== "say-s" || locked)) speak(t.it.w, "fr-FR"); },
  });
  const card = "rounded-2xl border-2 border-[color:var(--cahier-ink)]/25 bg-white p-3";

  return (
    <DrillShell
      exitHref={drillExitHref(collectionId)}
      progress={screen === "quiz" && queue.length > 0 ? { done: idx, total: queue.length } : null}
      right={<>{score} pt</>}
      cta={
        screen === "end"
          ? { label: "↻ Play again", onClick: () => again(false) }
          : t && (t.dir === "wi" || t.dir === "iw") && !locked && !retry
            ? { label: "Check", onClick: () => commit(t.it), disabled: !selected }
            : null
      }
      help={screen === "quiz" ? ladder.help : null}
      secondary={
        screen === "end" && wrong.length > 0
          ? { label: `Redo my mistakes (${[...new Set(wrong)].length})`, onClick: () => again(true) }
          : null
      }
      feedback={
        screen === "quiz" && t && retry && !locked
          ? {
              kind: "wrong",
              body: ladder.revealed ? <span lang="fr">→ {t.it.w}</span> : "Not yet",
              cta: { label: isSay ? (ladder.revealed ? "Say it" : "Try again") : "Pick again", onClick: () => setRetry(false) },
            }
          : screen === "quiz" && t && locked
          ? {
              kind: verdictGood ? "correct" : "wrong",
              body: (
                <>
                  {verdictGood ? "Bravo !" : "Not quite…"}
                  <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="ml-2 font-black" style={{ color: t.it.color }}>
                    {t.it.w} 🔊
                  </button>
                  {t.it.tag && <span className="ml-2 text-xs font-medium italic opacity-80">{t.it.tag}</span>}
                </>
              ),
              cta: { label: idx + 1 >= queue.length ? "Result" : "Continue", onClick: next },
            }
          : null
      }
    >
      <div className="mx-auto w-full max-w-2xl">
        {screen === "quiz" && t && (
          <div>
            <p className="min-w-0 truncate text-center text-xs font-bold text-[color:var(--cahier-ink-soft)]" lang="fr" title={subtitle}>
              🔮 {subtitle}
            </p>
            <p className="mt-1 hidden text-center text-[10px] font-bold text-[color:var(--cahier-ink-soft)] sm:block">{CHOICE_KEYS_HINT}</p>
            {SPECULEARN_PROMPT_FRAME[collectionId] && (
              <p className="mt-2 text-center text-base font-black text-[color:var(--cahier-ink)]" lang="fr">
                « {SPECULEARN_PROMPT_FRAME[collectionId]} »
              </p>
            )}

            <div className={`${card} mt-3 text-center`}>
              {(t.dir === "say-t" || t.dir === "say-s") ? (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">
                    {t.dir === "say-t" ? "Listen, then say it out loud" : "What is it? Say it in French!"}
                  </p>
                  <Visual it={t.it} className="mx-auto mt-3 h-40 w-40 rounded-xl border-2 border-[color:var(--cahier-ink)]/20" />
                  {t.dir === "say-t" && (
                    <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="mt-2 text-xl font-black" style={{ color: t.it.color }} title="🔊">
                      {t.it.w} 🔊
                    </button>
                  )}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {t.dir === "say-t" && (
                      <button type="button" onClick={() => speak(t.it.w, "fr-FR")} className="fluo-btn fluo-btn-sm">🔊 Listen again</button>
                    )}
                    <button
                      type="button"
                      onClick={() => listen(t.it)}
                      className={`fluo-btn fluo-btn-sm ${listening ? "!bg-rose-600 !text-white" : ""}`}
                      disabled={locked}
                    >
                      {listening ? "⏹ Listening…" : "🎤 Say it"}
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
                        onClick={() => pick(o)}
                        disabled={struckSet.has(o.w)}
                        className={`relative overflow-hidden rounded-xl border-2 transition ${
                          !locked && struckSet.has(o.w)
                            ? "border-slate-200 opacity-30 grayscale"
                            : locked
                            ? o === t.it
                              ? "border-emerald-600 ring-2 ring-emerald-400"
                              : o === picked
                                ? "border-rose-600 opacity-70"
                                : "border-slate-200 opacity-40"
                            : o === selected
                              ? "border-slate-900 ring-2 ring-slate-900"
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
                        onClick={() => pick(o)}
                        disabled={struckSet.has(o.w)}
                        className={`rounded-xl border-2 px-3 py-2.5 text-base font-bold transition ${
                          !locked && struckSet.has(o.w)
                            ? "border-slate-200 text-slate-300 line-through"
                            : locked
                            ? o === t.it
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                              : o === picked
                                ? "border-rose-600 bg-rose-50 text-rose-900 line-through"
                                : "border-slate-200 text-slate-400"
                            : o === selected
                              ? "border-slate-900 bg-slate-900 text-white"
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
            </div>
          </div>
        )}

        {screen === "quiz" && !t && (
          <p className="py-10 text-center text-sm text-[color:var(--cahier-ink-soft)]">
            {ITEMS.length === 0 ? "Nothing to guess in this deck." : "…"}
          </p>
        )}

        {screen === "end" && (
          <div className={`${card} text-center`}>
            <p className="text-3xl font-black text-[color:var(--cahier-ink)]">{score} / {queue.length}</p>
            <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">
              {score === queue.length
                ? "Parfait ! You know all these words."
                : score >= queue.length * 0.8
                  ? "Très bien ! A few words left to consolidate."
                  : score >= queue.length * 0.5
                    ? "Good start — redo your mistakes to lock them in."
                    : "Keep going — guessing already counts as learning!"}
            </p>
            {/* The 🎤 modes moved here from the deleted wizard: saying the
                words is a choice for AFTER meeting them, not a gate before
                the first question. */}
            {sttOk && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button type="button" onClick={() => again(false, "say-t")} className="fluo-btn fluo-btn-sm">🎤 Repeat</button>
                <button type="button" onClick={() => again(false, "say-s")} className="fluo-btn fluo-btn-sm">🎤 Guess and say</button>
              </div>
            )}
          </div>
        )}
      </div>
    </DrillShell>
  );
}
