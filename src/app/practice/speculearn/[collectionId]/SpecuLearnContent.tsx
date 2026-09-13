"use client";

/**
 * SpecuLearn (né « Devine d'abord ! », renamed by Dan 2026-07-15) — the
 * guess-first activity (Dan, 2026-07-14).
 * aliments runs on its photo bank (public/devine + devine-aliments.json);
 * every other SPECULEARN_READY deck runs on its items' emoji as the image
 * (Dan approved the generalization the same day). Accent-tolerant Say It
 * grading, keyboard 1–4/⏎/R.
 *
 * IT SCORES NOTHING, AND THIS HEADER SAID OTHERWISE UNTIL 1 SEP. It claimed
 * "every answer pays XP + streak + SRS through recordItemResult". The code
 * calls recordItemResult nowhere, writes no XP, no streak and no SRS, and
 * persists nothing at all — `score` lives for the session and `game.start` /
 * `game.end` go to analytics. The comment was load-bearing in the wrong
 * direction: docs/HANDOFF_SPECULEARN_PRETESTS.md was written on the strength of
 * it and told the pre-tests lane that a scoring contract stood between
 * SpecuLearn and the pre-tests. It does not. Read the calls, not this block.
 *
 * THE CONFIG WIZARD IS GONE (patch 20–21). The start screen asked a
 * first-year to pick a direction (5 modes) and a pack before the first
 * question — a curriculum decision they can't make. The drill now opens
 * straight into Mixte over the whole deck inside DrillShell; the 🎤 modes
 * (Répète / Devine et dis) survive as restart chips on the end card, where
 * a learner who has met the words can choose to say them.
 */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import { speak } from "@/games/letris/speech";
import { hintsFor } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { sfx } from "@/games/audio/sfx";
import { logEvent } from "@/lib/firebase/usage";
import { SPECULEARN_PROMPT_FRAME } from "@/lib/collections/speculearnReady";
import { deaccent, normalize } from "@/lib/practice/cloze";
import { useChoiceKeys, CHOICE_KEYS_HINT } from "@/lib/useChoiceKeys";
import { buildItems, spokenFor, type DeckItem } from "@/lib/speculearn/deckWords";
import { shuffle } from "@/lib/shuffle";
import { recordPretestAnswer } from "@/lib/pretestRecord";
import { stopForDeck } from "@/lib/stopTag";
import { optionGridClass } from "@/lib/optionGrid";

/** One playable card: the word, its grammar tag (colored), and its visual
 *  (photo for aliments, emoji elsewhere). s = aliments pack number. */
/** The deck word shape now lives with its builder. */
type DevItem = DeckItem;

type Mode = "mix" | "say-t" | "say-s";
type Dir = "wi" | "iw" | "say-t" | "say-s";

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
/* tagFromArticle / COL_ARTICLE / withArticle / buildItems moved to
   @/lib/speculearn/deckWords on 7 Sep so the merged runner can ask for
   the same list — see that file. Behaviour unchanged. */

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
/** One answered question, frozen. */
type Snap = {
  t: Trial;
  opts: DevItem[];
  picked: DevItem | null;
  locked: boolean;
  verdictGood: boolean | null;
  struckSet: Set<string>;
};

function Visual({ it, className }: { it: DevItem; className: string }) {
  if (it.endonym) {
    // Measured against THE TILE, not against a guessed width. The first cut
    // computed from a hard 8.75rem and clipped « Français », « Türkçe » and
    // most of the rest, because the option tiles are half a phone wide, not
    // 10rem. `cqw` is one per cent of the tile's own width, so the same rule
    // holds on the big stimulus tile and on a narrow option, at any screen
    // size. The factor is the width of a bold glyph in ems — CJK and Hangul
    // are full-width, so they get their own — and 3rem caps it so 中文 does
    // not tower over « Português ».
    //
    // THE CONTAINER AND THE TEXT MUST BE TWO ELEMENTS: an element cannot
    // query itself, so `cqw` written on the same span that declares
    // `container-type` resolves against nothing and every name came out at
    // the 3rem cap, clipped. The outer span is the container; the inner one
    // is measured by it.
    const longest = Math.max(...it.endonym.split(/\s+/).map((w) => w.length));
    const fullWidth = /[\u3000-\u9fff\uac00-\ud7af]/.test(it.endonym);
    const cqw = (94 / (longest * (fullWidth ? 1.08 : 0.66))).toFixed(1);
    return (
      <span
        className={`${className} flex items-center justify-center overflow-hidden bg-white px-2`}
        style={{ containerType: "inline-size" }}
      >
        <span
          className="break-words text-center font-bold leading-tight text-[color:var(--cahier-ink)]"
          style={{
            fontSize: `min(3rem, ${cqw}cqw)`,
            fontFamily: "system-ui, 'Noto Sans', 'Noto Sans CJK SC', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Thai', 'Noto Sans Arabic', sans-serif",
          }}
        >
          {it.endonym}
        </span>
      </span>
    );
  }
  return it.img ? (
    // Plain <img> on purpose: output:"export" ships no image optimizer, so
    // next/image adds a runtime wrapper and optimizes nothing here.
    // Reviewed with Dan 2026-08-31: disable, not fix.
    // eslint-disable-next-line @next/next/no-img-element
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
  // Whether this browser has a speech recogniser. Read through
  // useSyncExternalStore rather than set from an effect: the server snapshot
  // is `false`, the client's is the real answer, and no cascading render is
  // needed to get there. Same pattern as the WorDrill page's progress read.
  const sttOk = useSyncExternalStore(() => () => {}, () => getRec() !== null, () => false);
  const [queue, setQueue] = useState<Trial[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<DevItem[]>([]);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<DevItem | null>(null);
  // Select-then-commit (patch 20–21): tapping an option SELECTS; the shell's
  // Vérifier COMMITS. Speech trials commit on the mic result as before.
  const [selected, setSelected] = useState<DevItem | null>(null);
  // GOING BACK (Dan, 5 Sep: "for SpecuLearn we are missing the back button").
  // Every question already answered is kept exactly as the learner left it —
  // its four options in the order they were shown, what they picked, whether
  // it was right — so ‹ shows that question again rather than a summary of
  // it. Reviewing never re-grades: the snapshot is locked, which is the same
  // flag that already stops a second tap on the live question.
  const [past, setPast] = useState<Snap[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [opts, setOpts] = useState<DevItem[]>([]);
  const [verdictGood, setVerdictGood] = useState<boolean | null>(null);
  // Track D: a wrong pick/say that is NOT final — struck option, pick again.
  const [retry, setRetry] = useState(false);
  const [struck, setStruck] = useState<DevItem[]>([]);
  const recRef = useRef<RecLike | null>(null);
  const retryRef = useRef<DevItem[] | null>(null);

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const pool = (): DevItem[] => retryRef.current ?? ITEMS;

  // NO TWO OPTIONS MAY SHOW THE SAME PICTURE (Dan, 5 Sep, on « Je vous en
  // mets combien ? »: "this seemes to have two answers possible"). commerces
  // spent 💶 on both « euros » and « Ça fait combien ? » and 🪙 on both
  // « monnaie » and « Voici votre monnaie » — in the word→image direction
  // that is two identical buttons, one of them marked wrong.
  const visualOf = (x: DevItem) => x.endonym ?? x.img ?? x.emoji ?? x.w;
  const distractors = (it: DevItem): DevItem[] => {
    const same = pool().filter((x) => x !== it);
    const base = same.length >= 3 ? same : ITEMS.filter((x) => x !== it);
    const seen = new Set([visualOf(it)]);
    const out: DevItem[] = [];
    for (const x of shuffle(base)) {
      if (seen.has(visualOf(x))) continue;
      seen.add(visualOf(x));
      out.push(x);
      if (out.length === 3) break;
    }
    return out;
  };

  const prepare = (q: Trial[], i: number) => {
    const t = q[i];
    setPicked(null); setSelected(null); setHeard(""); setVerdictGood(null); setLocked(false);
    setRetry(false); setStruck([]);
    if (t.dir === "wi" || t.dir === "iw") setOpts(shuffle([t.it, ...distractors(t.it)]));
    else setOpts([]);
    if (t.dir === "say-t") speak(spokenFor(t.it), "fr-FR");
  };

  const start = (mode: Mode) => {
    const q = shuffle(pool()).map((it) => ({
      it,
      dir: (mode === "mix" ? (Math.random() < 0.5 ? "wi" : "iw") : mode) as Dir,
    }));
    setQueue(q); setIdx(0); setScore(0); setWrong([]);
    setPast([]); setViewing(null);
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
    // `t?.it`, not `t?.it.w`: the compiler infers the whole item as the
    // dependency and refuses to keep the memo when the two disagree.
  }, [struck, ladder.eliminated, t?.it]);

  /** One graded outcome — XP/streak/SRS + the teacher evidence trail (via
   *  the ladder, which stamps the assistance actually shown). */
  const grade = (it: DevItem, good: boolean, given?: string, chosen?: DevItem) => {
    // The devine: prefix predates the SpecuLearn rename — kept so every
    // learner's SRS history for these words survives (ids are invisible).
    const first = ladder.ladder.wrongTries === 0 && !ladder.revealed;
    const r = ladder.attempt(good, { given, activity: `speculearn:${collectionId}` });
    if (good) { if (first) setScore((s) => s + 1); sfx.correct(); } else { if (first) setWrong((w) => [...w, it]); sfx.wrong(); }
    // Same gap store as pretests — one store, whoever reads it next.
    const sio = stopForDeck(collectionId);
    if (sio && first) {
      recordPretestAnswer({
        pretestId: `speculearn:${collectionId}`,
        sioId: sio.id,
        itemId: `devine:${baseWord(it.w)}`,
        correct: good,
        picked: given ?? "",
        answer: it.w,
        stem: it.w,
      });
    }
    if (r.effect === "done" || r.effect === "reveal") {
      setVerdictGood(good);
      setLocked(true);
      speak(spokenFor(it), "fr-FR");
    } else {
      // Not final: strike the pick (mcq) / keep the mic open (say), retry.
      // `chosen` over `selected`: a tap grades in the same event that sets
      // the selection, so the state has not been flushed yet.
      const struckPick = chosen ?? selected;
      if (struckPick) setStruck((k) => [...k, struckPick]);
      setSelected(null);
      setRetry(true);
    }
  };

  // TAP TO ANSWER — no Check (Dan, 5 Sep: "we should remove the Check
  // button", and the same call on SpecuLearn's spec: "Tap to answer, no
  // Check"). The two-step Check pretended a learner might change their mind,
  // but the option they touched IS the answer they mean, and the second tap
  // only stood between the guess and the feedback the whole activity exists
  // to give.
  const pick = (o: DevItem) => {
    if (locked || struckSet.has(o.w) || !t || viewing !== null) return;
    setSelected(o);
    setPicked(o);
    grade(t.it, o === t.it, o.w, o);
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
      setHeard(t || "(nothing heard)");
      grade(it, alts.some((a) => saidRight(a, it.w)), t || "(nothing heard)");
    };
    rec.onerror = (e) => {
      recRef.current = null; setListening(false);
      if (e.error === "no-speech" && !locked) { setHeard("(nothing heard)"); grade(it, false, "(nothing heard)"); }
    };
    rec.onend = () => { recRef.current = null; setListening(false); };
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const next = () => {
    if (!locked) return;
    if (t) setPast((k) => [...k, { t, opts, picked, locked: true, verdictGood, struckSet }]);
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
    enabled: screen === "quiz" && !!t && viewing === null,
    onPick: (i) => { const o = opts[i]; if (o && t && !locked) pick(o); },
    // DrillShell's own Enter/Space binding fires the tray's Continue.
    onNext: undefined,
    // In « Devine et dis » the word must not be heard before answering.
    onSpeak: () => { if (t && (t.dir !== "say-s" || locked)) speak(spokenFor(t.it), "fr-FR"); },
  });
  const card = "rounded-2xl border-2 border-[color:var(--cahier-ink)]/25 bg-white p-3";

  // WHAT THE SCREEN SHOWS — the live question, or the frozen one being
  // reviewed. Everything below reads `v`, so a reviewed question is drawn by
  // exactly the same code that drew it the first time; nothing renders from
  // the live state while `viewing` is set, and nothing grades either.
  const v: Snap | null =
    viewing == null
      ? (t ? { t, opts, picked, locked, verdictGood, struckSet } : null)
      : (past[viewing] ?? null);
  const reviewing = viewing != null;
  const goBack = () => {
    if (viewing == null) { if (past.length) setViewing(past.length - 1); }
    else if (viewing > 0) setViewing(viewing - 1);
  };
  const leaveReview = () => setViewing(null);

  return (
    <DrillShell
      activity="speculearn"
      deck={collectionId}
      exitHref={drillExitHref(collectionId)}
      back={
        screen === "quiz" && (past.length > 0)
          ? { onClick: goBack, disabled: reviewing && viewing === 0 }
          : null
      }
      progress={screen === "quiz" && queue.length > 0 ? { done: idx, total: queue.length } : null}
      right={<>{score} pt</>}
      cta={
        screen === "end"
          ? { label: "↻ Play again", onClick: () => again(false) }
          : null
      }
      help={screen === "quiz" && !reviewing ? ladder.help : null}
      secondary={
        /* SAY WHAT THE BUTTON REPLAYS (Dan, 5 Sep: "what the hell is redo my
           mistakes"). It read as an instruction to make the mistakes again,
           and on an activity whose own intro says "a wrong guess costs
           nothing" it also managed to scold. « Revisit my errors » is Dan's
           own wording, given the same day. The (1) goes with it: the score it
           counted — 4 / 5 — is on the same screen, and a count earns its
           place only when it describes what you cannot see (Dan, 1 Sep). */
        screen === "end" && wrong.length > 0
          ? { label: "Revisit my errors", onClick: () => again(true) }
          : null
      }
      feedback={
        reviewing && v
          ? {
              kind: v.verdictGood ? "correct" : "wrong",
              body: (
                <>
                  Question {(viewing ?? 0) + 1} of {queue.length}, already answered.
                </>
              ),
              cta: { label: "Back to where I was ›", onClick: leaveReview },
            }
          : screen === "quiz" && v && retry && !v.locked
          ? {
              kind: "wrong",
              body: ladder.revealed ? <span lang="fr">→ {v.t.it.w}</span> : "Not yet",
              cta: { label: isSay ? (ladder.revealed ? "Say it" : "Try again") : "Pick again", onClick: () => setRetry(false) },
            }
          : screen === "quiz" && v && v.locked
          ? {
              kind: v.verdictGood ? "correct" : "wrong",
              body: (
                <>
                  {v.verdictGood ? "Bravo !" : "Not quite…"}
                  <button type="button" onClick={() => speak(spokenFor(v.t.it), "fr-FR")} className="ml-2 font-black" style={{ color: v.t.it.color }}>
                    {v.t.it.w} 🔊
                  </button>
                  {v.t.it.tag && <span className="ml-2 text-xs font-medium italic opacity-80">{v.t.it.tag}</span>}
                </>
              ),
              cta: { label: idx + 1 >= queue.length ? "Result" : "Continue", onClick: next },
            }
          : null
      }
    >
      <div className="mx-auto w-full max-w-2xl">
        {screen === "quiz" && v && (
          <div>
            <p
              className="min-w-0 truncate text-center text-xs font-bold text-[color:var(--cahier-ink-soft)]"
              /* Always fr: this line prints the SUBTITLE, which stays
                 French on every deck (commerces included — « un, une,
                 des... »). The deck TITLE went English, but it is not
                 what this element renders; dropping the tag here hands
                 French to a screen reader's English voice. */
              lang="fr"
              title={subtitle}
            >
              💡 {subtitle}
            </p>
            <p className="mt-1 hidden text-center text-[10px] font-bold text-[color:var(--cahier-ink-soft)] sm:block">{CHOICE_KEYS_HINT}</p>
            {SPECULEARN_PROMPT_FRAME[collectionId] && (
              <p className="mt-2 text-center text-base font-black text-[color:var(--cahier-ink)]" lang="fr">
                « {SPECULEARN_PROMPT_FRAME[collectionId]} »
              </p>
            )}

            <div className={`${card} mt-3 text-center`}>
              {(v.t.dir === "say-t" || v.t.dir === "say-s") ? (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">
                    {v.t.dir === "say-t" ? "Listen, then say it out loud" : "What is it? Say it in French!"}
                  </p>
                  <Visual it={v.t.it} className="mx-auto mt-3 h-40 w-40 rounded-xl border-2 border-[color:var(--cahier-ink)]/20" />
                  {v.t.dir === "say-t" && (
                    <button type="button" onClick={() => speak(spokenFor(v.t.it), "fr-FR")} className="mt-2 text-xl font-black" style={{ color: v.t.it.color }} title="🔊">
                      {v.t.it.w} 🔊
                    </button>
                  )}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {v.t.dir === "say-t" && (
                      <button type="button" onClick={() => speak(spokenFor(v.t.it), "fr-FR")} className="fluo-btn fluo-btn-sm">🔊 Listen again</button>
                    )}
                    <button
                      type="button"
                      onClick={() => listen(v.t.it)}
                      className={`fluo-btn fluo-btn-sm ${listening ? "!bg-rose-600 !text-white" : ""}`}
                      disabled={v.locked}
                    >
                      {listening ? "⏹ Listening…" : "🎤 Say it"}
                    </button>
                  </div>
                  {heard && <p className="mt-2 text-sm italic text-[color:var(--cahier-ink-soft)]">« {heard} »</p>}
                </>
              ) : v.t.dir === "wi" ? (
                <>
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">Pick the right picture.</p>
                  <button type="button" onClick={() => speak(spokenFor(v.t.it), "fr-FR")} className="mt-1 text-2xl font-black" style={{ color: v.t.it.color }} title="🔊">
                    {v.t.it.w} 🔊
                  </button>
                  {/* The picture choices had the same hard two columns, and
                      the same fault on a wide sheet. Same floor as the word
                      options: two across in a phone's frame, four on a
                      laptop, decided by the space rather than a number. */}
                  <div className="fluo-optiongrid fluo-optiongrid--std mt-3 gap-2">
                    {v.opts.map((o, i) => (
                      <button
                        key={o.w}
                        type="button"
                        onClick={() => pick(o)}
                        disabled={v.struckSet.has(o.w)}
                        className={`relative overflow-hidden rounded-xl border-2 transition ${
                          !v.locked && v.struckSet.has(o.w)
                            ? "border-slate-200 opacity-30 grayscale"
                            : v.locked
                            ? o === v.t.it
                              ? "border-emerald-600 ring-2 ring-emerald-400"
                              : o === v.picked
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
                  <p className="text-sm font-bold text-[color:var(--cahier-ink-soft)]">Pick the right word.</p>
                  <Visual it={v.t.it} className="mx-auto mt-2 h-40 w-40 rounded-xl border-2 border-[color:var(--cahier-ink)]/20" />
                  {/* THE SHARED GRID, not a second opinion (Dan, 2026-09-11:
                      *"we are NOT dead set on just two columns"*). This was
                      `grid-cols-1 sm:grid-cols-2` — its own rule, capped at
                      two, and keyed on a breakpoint that inside the cahier's
                      iframe fires at the FRAME's width rather than the
                      phone's. `optionGridClass` is the one answer every drill
                      already shares; `speculearn-options` is what makes the
                      type grow with the sheet. */}
                  <div className={`speculearn-options mt-3 ${optionGridClass(v.opts.map((o) => o.w), "gap-2")}`}>
                    {v.opts.map((o, i) => (
                      <button
                        key={o.w}
                        type="button"
                        onClick={() => pick(o)}
                        disabled={v.struckSet.has(o.w)}
                        // No size class — the grid's clamp is the size.
                        className={`rounded-xl border-2 px-3 py-2.5 font-bold transition ${
                          !v.locked && v.struckSet.has(o.w)
                            ? "border-slate-200 text-slate-300 line-through"
                            : v.locked
                            ? o === v.t.it
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                              : o === v.picked
                                ? "border-rose-600 bg-rose-50 text-rose-900 line-through"
                                : "border-slate-200 text-slate-400"
                            : o === selected
                              ? "answer-picked"
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

        {screen === "quiz" && !v && (
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
