"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { logEvent } from "@/lib/firebase/usage";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import ToolSummon from "@/components/tools/ToolSummon";
import SessionMap, { type Mark } from "@/components/SessionMap";
import SpeechMeter from "@/components/SpeechMeter";
import { practiceItems } from "@/lib/collections/display";
import { recordItemResult } from "@/lib/progress";
import { hintsFor } from "@/lib/help/hints";
import { useHelpLadder, type HelpLadderApi } from "@/lib/help/useHelpLadder";
import { deaccent, normalize } from "@/lib/practice/cloze";
import { reviserHref } from "@/lib/reviser";
import type { Collection, Item } from "@/lib/collections/schema";
import { shuffle } from "@/lib/shuffle";
import { cap, offer, type SessionLength } from "@/lib/sessionLength";
import HowManyQuestions from "@/components/HowManyQuestions";

type Phase = "idle" | "listening" | "result";
type Grade = "perfect" | "good" | "homophone" | "close" | "miss";

function articleOf(deck: Collection, item: Item): string {
  const cols = deck.gameConfig?.letris?.columns ?? [];
  const tag = item.tags?.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c: { key: string }) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}
function frFull(article: string, fr: string): string {
  if (!article) return fr;
  return article.endsWith("'") ? `${article}${fr}` : `${article} ${fr}`;
}


// The private normalize/deaccent (byte-clones of cloze.ts) died in the
// grading unification (2026-08-11) — the transforms come from THE grader in
// lib/practice/cloze.ts. Only the SPEECH policy below stays local: it sits
// on top of the shared normalizer, never beside it.

/** SPEECH-only tolerance: French silent endings make "il s'appelle" and
 *  "ils s'appellent" perfect homophones — the recognizer picks a spelling,
 *  and the learner must never be penalized for its choice (Dan, 2026-07-05).
 *  Word pairs are equal when they differ only by a silent -s / -x / -nt,
 *  or by an -er / -ez / -ée(s) ending — all /e/, so "parler" and "parlez"
 *  are the same sound and the recognizer picks one arbitrarily (Dan,
 *  2026-07-15: "parler and parlez are treated as different??"). Inputs
 *  arrive deaccented. Stems under 3 letters are exempt: in "cher" / "mer" /
 *  "chez"-class words the ending isn't the verb /e/. */
function silentEq(a: string, b: string): boolean {
  if (a === b) return true;
  const grows = (x: string, y: string) => y === `${x}s` || y === `${x}x` || y === `${x}nt`;
  if (grows(a, b) || grows(b, a)) return true;
  const foldE = (w: string) => {
    const m = /^(.{3,})(er|ez|ee|ees)$/.exec(w);
    return m ? `${m[1]}É` : w;
  };
  return foldE(a) === foldE(b);
}

function gradeAnswer(recognized: string, expected: string, expectedAlt?: string): Grade {
  const nr = normalize(recognized);
  const ne = normalize(expected);
  if (!nr) return "miss";
  if (nr === ne) return "perfect";
  if (deaccent(nr) === deaccent(ne)) return "good";
  const tr = deaccent(nr).split(" ");
  const te = deaccent(ne).split(" ");
  if (tr.length === te.length && tr.every((w, i) => silentEq(w, te[i]))) return "homophone";
  // Number decks: speech engines transcribe "dix-sept" as the numeral "17".
  // Accept the digit form (item.en when it is purely numeric) as correct.
  if (expectedAlt) {
    const na = normalize(expectedAlt);
    if (na && nr === na) return "perfect";
  }
  const words = ne.split(" ").filter((w) => w.length > 1);
  if (!words.length) return "miss";
  const hits = words.filter((w) =>
    deaccent(nr).split(" ").some((r) => r === deaccent(w))
  );
  return hits.length / words.length >= 0.6 ? "close" : "miss";
}

const GRADE_UI: Record<Grade, { icon: string; label: string; cls: string }> = {
  perfect: { icon: "✅", label: "Parfait !", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  good: { icon: "✅", label: "Bien ! (accent differs)", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  homophone: { icon: "✅", label: "Parfait ! (same pronunciation)", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  close: { icon: "🟡", label: "Presque !", cls: "text-amber-700 bg-amber-50 border-amber-300" },
  miss: { icon: "❌", label: "Not quite…", cls: "text-rose-700 bg-rose-50 border-rose-300" },
};

/** perfect/good/homophone all mean "said it" — the session map is not the
 *  place to re-litigate an accent. */
function markFor(g: Grade): Mark {
  if (g === "perfect" || g === "good" || g === "homophone") return "ok";
  return g === "close" ? "shaky" : "bad";
}

export default function SayItContent({
  collectionId,
  embedded = false,
  deckOverride,
  variant = "default",
  onExit,
}: {
  collectionId: string;
  embedded?: boolean;
  /** A synthetic deck (the Marathon oral compiles every deck into one) —
   *  items arrive with articles already baked into fr. */
  deckOverride?: Collection;
  /** "wordrill" = the patch-31 layout: EN/FR prompt switch, session map, live
   *  meter, the help ladder on 🔤. It is a variant, NOT a new value of
   *  `embedded` — SioModal is embedded too and must keep the popup look. */
  variant?: "default" | "wordrill";
  /** WorDrill's ✕ returns to its scope picker rather than leaving the page. */
  onExit?: () => void;
}) {
  const deck = deckOverride ?? CURATED.find((c) => c.id === collectionId);
  const isWorDrill = variant === "wordrill";
  // The ladder is the recording path too (it queues hinted items for ReVue),
  // so WorDrill joins the standalone page in using it. SioModal's popup keeps
  // the old direct-record path — it has no shell bar to hang rungs off.
  const ladderOn = !embedded || isWorDrill;

  // A run is a working queue, NOT an endless carousel (Dan, 2026-07-03: "there
  // should be a natural end rather than looping continuously"). `card` is on
  // screen; `queue` is what's still ahead; `trail` is every card left behind —
  // answered OR skipped — so Back can always retrace (Dan, 2026-07-16: "the
  // back button is not active when I skip questions"). Only answered entries
  // count toward progress; a skipped card also waits at the queue's end, and
  // going Back to it pulls it out of the queue again (no duplicates).
  const [cards, setCards] = useState<Item[]>([]); // stable deck order (mount shuffle)
  const [card, setCard] = useState<Item | null>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  const [trail, setTrail] = useState<{ it: Item; skipped: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  // Every graded word, in the order it was answered — the session map reads
  // the marks, the done screen reads the misses. Skips are not in here: a
  // deferred word was never answered, so it has no outcome to show.
  const [log, setLog] = useState<{ it: Item; mark: Mark }[]>([]);
  // Which language the PROMPT shows. The mic always grades French — EN is
  // recall, FR is read-aloud, same word, same grader (hence the FR badge).
  const [promptLang, setPromptLang] = useState<"en" | "fr">("en");

  // How long this run is (Dan, 2026-08-25). This is the drill that most needed
  // it: WorDrill's "Tout" scope compiles EVERY curated deck into one run, so
  // without a cap the finish line was hundreds of words away. `cards` stays
  // the whole compiled deck; `runTotal` is what the learner actually signed
  // up for, and every progress readout counts against that rather than the
  // deck — a bar filling towards a number nobody chose is not progress.
  const [asked, setAsked] = useState(false);
  const [runTotal, setRunTotal] = useState(0);

  /** Seed the working queue from `list`, cut to `choice`. */
  const seedRun = useCallback((list: Item[], choice: SessionLength) => {
    const run = cap(list, choice);
    setRunTotal(run.length);
    setCard(run[0] ?? null);
    setQueue(run.slice(1));
    setTrail([]);
    setLog([]);
    setFinished(false);
  }, []);

  // Shuffle on mount only — shuffling during render breaks SSR hydration
  // (the AGENTS/handoff "no Math.random() during render" rule).
  useEffect(() => {
    const list = deck ? shuffle(practiceItems(deck).filter((i) => i.fr)) : [];
    // Deliberate: the shuffle CANNOT move into render without breaking SSR
    // hydration, per the note above and the repo's no-Math.random()-during-
    // render rule. The lint rule and the decision genuinely disagree; the
    // decision is older and has a reason.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCards(list);
    // A deck short enough not to need the question is answered for the
    // learner, and the run starts immediately.
    const skip = offer(list.length) === null;
    setAsked(skip);
    if (skip) seedRun(list, null);
    else { setCard(null); setQueue([]); setTrail([]); setLog([]); setFinished(false); setRunTotal(0); }
  }, [deck, seedRun]);

  const [phase, setPhase] = useState<Phase>("idle");
  // Peek at the French (Dan, 2026-07-15: "a button to see the French words
  // too") — per-card, cleared on advance so the default stays recall-first.
  const [revealed, setRevealed] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<{ grade: Grade; recognized: string } | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  // Same as SpecuLearn: a capability probe, not state to be set from an
  // effect. `null` is no longer needed — the server snapshot is the answer
  // for the server, and `false` renders the unsupported notice only after
  // hydration has said so.
  const supported = useSyncExternalStore(
    () => () => {},
    () => { const w = window as any; return !!(w.SpeechRecognition || w.webkitSpeechRecognition); },
    () => true,
  );
  const recRef = useRef<any>(null);
  // THREE LIVE REFS, WRITTEN DURING RENDER, ON PURPOSE. The speech recogniser
  // fires its callbacks asynchronously, long after the render that started it,
  // and those callbacks must see the CURRENT phase, card and ladder — not the
  // ones captured when recognition began. Moving these into an effect makes
  // each callback read a value one render stale, which is a real bug in a
  // recogniser. The lint rule is right in general and wrong here.
  const phaseRef = useRef<Phase>("idle");
  // eslint-disable-next-line react-hooks/refs -- see above
  phaseRef.current = phase;
  const cardRef = useRef<Item | null>(null);
  // eslint-disable-next-line react-hooks/refs -- see above
  cardRef.current = card;

  // The help ladder (Track D) — standalone (shell) runs only. Rungs: how
  // the word starts, its skeleton, then the written form (the older 🔤
  // peek, now recorded as the answer rung). Two misses climb by themselves.
  const expectedFr = card && deck ? frFull(articleOf(deck, card), card.fr) : card?.fr ?? "";
  const hints = useMemo(() => hintsFor("say", { answer: expectedFr }), [expectedFr]);
  const ladder = useHelpLadder({
    kind: "say",
    itemKey: card?.id ?? null,
    itemId: card?.id,
    surface: "say-it",
    hints,
    reveal: expectedFr,
    enabled: ladderOn && !finished && !!card,
  });
  const ladderRef = useRef<HelpLadderApi>(ladder);
  // eslint-disable-next-line react-hooks/refs -- see the live-refs note above
  ladderRef.current = ladder;
  const peek = ladderOn ? ladder.revealed : revealed;


  // Session telemetry (2026-07-15 XP/analytics audit): Say It fed the Reviser
  // and XP but never the teacher Activities panel — WorDrill runs were
  // invisible. Same game.start/game.end pair every other game logs.
  useEffect(() => {
    void logEvent("game.start", { game: "say-it", collectionId });
  }, [collectionId]);
  const endLogged = useRef(false);
  useEffect(() => {
    if (!finished) {
      endLogged.current = false; // Recommencer starts a fresh run
      return;
    }
    if (endLogged.current) return;
    endLogged.current = true;
    void logEvent("game.end", { game: "say-it", collectionId, score: score.ok, total: score.total });
  }, [finished, collectionId, score]);

  const stopRec = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
  }, []);

  // 🧰 While a tool card is open the mic must not run — the card speaks, and
  // the recognizer would transcribe the tool's voice and grade the browser
  // instead of the learner (same reason listenModel refuses while listening).
  // The recognition is ABANDONED, not stopped: its handlers are detached
  // first, so half an utterance is never graded — the turn returns to idle
  // and the learner taps 🎤 again after closing the card.
  const toolOpenRef = useRef(false);
  const onToolOpen = useCallback(() => {
    toolOpenRef.current = true;
    const rec = recRef.current;
    if (rec) {
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try { rec.stop(); } catch {}
      recRef.current = null;
      setPhase("idle");
      setTranscript("");
    }
  }, []);
  const onToolClose = useCallback(() => {
    toolOpenRef.current = false;
  }, []);

  const resetTurn = useCallback(() => {
    stopRec();
    setPhase("idle");
    setRevealed(false);
    setTranscript("");
    setResult(null);
  }, [stopRec]);

  // Advance after answering: the current card joins the trail; the next card
  // comes off the queue, or — when the queue is empty — the run ends.
  const next = useCallback(() => {
    resetTurn();
    ladderRef.current.skip();
    if (card) setTrail((t) => [...t, { it: card, skipped: false }]);
    if (queue.length > 0) {
      setCard(queue[0]);
      setQueue(queue.slice(1));
    } else {
      setCard(null);
      setFinished(true);
      sfx.stage(); // run complete — the Terminé card is about to show
    }
  }, [card, queue, resetTurn]);

  // Skip = defer this word: move it to the back of the queue (not graded, not
  // counted) and show the next one. It still joins the trail, so Back can
  // return to it. A no-op when nothing else is queued.
  const skip = useCallback(() => {
    if (!card || queue.length === 0) return;
    resetTurn();
    setTrail((t) => [...t, { it: card, skipped: true }]);
    setCard(queue[0]);
    setQueue([...queue.slice(1), card]);
  }, [card, queue, resetTurn]);

  // Back = revisit the previous card, answered or skipped. A skipped card is
  // also waiting at the queue's END — pull that copy out so it can't appear
  // twice; the current card returns to the queue's front either way.
  const back = useCallback(() => {
    if (trail.length === 0) return;
    resetTurn();
    const prev = trail[trail.length - 1];
    setTrail(trail.slice(0, -1));
    setQueue((q) => {
      let rest = q;
      if (prev.skipped) {
        const k = rest.lastIndexOf(prev.it);
        if (k !== -1) rest = [...rest.slice(0, k), ...rest.slice(k + 1)];
      }
      return card ? [card, ...rest] : rest;
    });
    setCard(prev.it);
  }, [trail, card, resetTurn]);

  // End here = stop now and show the summary.
  const endNow = useCallback(() => {
    stopRec();
    setCard(null);
    setFinished(true);
    if (score.total > 0) sfx.stage(); // something was attempted — celebrate the run
  }, [stopRec, score.total]);

  const restart = useCallback(() => {
    // A replay reshuffles and asks again — someone who did ten may want
    // twenty-five next, and re-asking costs one tap.
    const list = shuffle(cards);
    setCards(list);
    const skip = offer(list.length) === null;
    setAsked(skip);
    if (skip) seedRun(list, null);
    else { setCard(null); setQueue([]); setTrail([]); setLog([]); setFinished(false); setRunTotal(0); }
    setScore({ ok: 0, total: 0 });
    setPhase("idle");
    setRevealed(false);
    setTranscript("");
    setResult(null);
  }, [cards, seedRun]);

  const startListening = useCallback(() => {
    if (toolOpenRef.current) return; // a 🧰 card owns the audio right now
    const c = cardRef.current;
    if (!c) return;
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    setTranscript("");
    setResult(null);
    setPhase("listening");
    recRef.current = rec;

    rec.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTranscript(t);
    };

    rec.onend = () => {
      recRef.current = null;
      setPhase("result");
      setTranscript((t) => {
        const art = deck ? articleOf(deck, c) : "";
        const expected = frFull(art, c.fr);
        const g = gradeAnswer(t, expected, /^\d+$/.test((c.en ?? "").trim()) ? c.en : undefined);
        const ok = g === "perfect" || g === "good" || g === "homophone";
        // Jingle first, independent of any TTS — short enough not to clash.
        if (ok) sfx.correct(); else sfx.wrong();
        setResult({ grade: g, recognized: t });
        // Feed the Reviser: a miss (or a partial "close") resurfaces the word;
        // a clean say advances its spacing ladder. Say It items are curated deck
        // items, so their ids line up with the Reviser's review queue. The
        // ladder records it (with the help actually shown) and, when help
        // was taken, queues it for ReVue. First try only scores.
        const L = ladderRef.current;
        const first = L.ladder.wrongTries === 0 && !L.revealed;
        if (first || !ladderOn) setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
        if (first || !ladderOn) setLog((l) => [...l, { it: c, mark: markFor(g) }]);
        if (c.id) {
          if (!ladderOn) recordItemResult(c.id, ok, t, `say-it:${collectionId}`);
          else L.attempt(ok, { given: t, activity: `say-it:${collectionId}` });
        }
        return t;
      });
    };

    rec.onerror = (e: any) => {
      recRef.current = null;
      if (e.error === "no-speech") {
        setPhase("result");
        sfx.wrong();
        setResult({ grade: "miss", recognized: "(nothing heard)" });
        const L = ladderRef.current;
        const firstTry = L.ladder.wrongTries === 0 || !ladderOn;
        if (firstTry) setScore((s) => ({ ...s, total: s.total + 1 }));
        if (firstTry) setLog((l) => [...l, { it: c, mark: "bad" }]);
        if (c.id) {
          if (!ladderOn) recordItemResult(c.id, false, "(nothing heard)", `say-it:${collectionId}`);
          else L.attempt(false, { given: "(nothing heard)", activity: `say-it:${collectionId}` });
        }
      } else if (e.error === "not-allowed") {
        setPhase("idle");
        alert("Please allow microphone access in your browser.");
      } else {
        setPhase("idle");
      }
    };

    rec.start();
  // Deliberately []: startListening arms the browser recognizer with its
  // mount-time collectionId/deck/ladderOn on purpose — a re-created callback
  // while the mic is open tears down and re-arms recognition mid-utterance,
  // which grades half a sentence. Reviewed with Dan 2026-08-31: disable, not fix.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hear the model pronunciation (Dan, 2026-07-15: "offer a button to listen
  // next to Saying it"). Never while the mic is open — the recognizer would
  // transcribe the TTS and grade the browser instead of the learner.
  const listenModel = useCallback(() => {
    const c = cardRef.current;
    if (!c || phaseRef.current === "listening") return;
    speak(deck ? frFull(articleOf(deck, c), c.fr) : c.fr, "fr-FR");
  }, [deck]);

  // Every function has a key (Dan, 2026-07-15): Space drives the mic, and
  // the letters mirror the buttons — R écouter, V voir, S skip, B back,
  // E end. On the RESULT card, standalone runs live inside DrillShell, whose
  // single Enter/Space binding fires Continue — this handler stands down
  // there (a second handler would retry AND advance on the same keypress).
  // Embedded (SioModal) keeps the old Space-retry / Enter-next pair.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = phaseRef.current;
      const k = e.key.toLowerCase();
      if (e.key === " " && p === "listening") { e.preventDefault(); stopRec(); return; }
      if (e.key === " " && (p !== "result" || embedded)) { e.preventDefault(); startListening(); return; }
      if (e.key === "Enter" && p === "result" && embedded) next();
      if (p === "listening") return; // no side actions while the mic is open
      if (k === "r") listenModel();
      if (k === "v") { if (ladderOn) ladderRef.current.climb(); else setRevealed((r) => !r); }
      if (k === "s") skip();
      if (k === "b") back();
      if (k === "e") endNow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // Deliberately not ladderOn: the handler reads live state through the
  // callbacks already listed, and re-binding the window key listener on
  // every ladder toggle risks a keystroke landing between listeners.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startListening, stopRec, next, listenModel, skip, back, endNow, embedded]);

  const answered = trail.filter((t) => !t.skipped).length;

  // HOW LONG? — asked once, before any word. Three shapes, because this
  // component runs in three frames: the drill page (DrillShell), the SIO
  // popup (bare), and WorDrill (bare, but arrived at from a scope picker, so
  // it keeps a way back — otherwise the one screen with no ✕ would be the one
  // that opens a run of the entire curriculum).
  if (!asked && cards.length > 0) {
    const body = (
      <>
        <HowManyQuestions
          lengths={offer(cards.length)!}
          total={cards.length}
          onPick={(n) => { setAsked(true); seedRun(cards, n); }}
        />
        {onExit && (
          <div className="mt-5 text-center">
            <button type="button" onClick={onExit} className="fluo-btn fluo-btn-sm">
              ← Change scope
            </button>
          </div>
        )}
      </>
    );
    return embedded ? <div className="px-4 pb-6 pt-2">{body}</div> : (
      <DrillShell
        activity="wordrill"
        deck={collectionId}
        exitHref={drillExitHref(collectionId)}
        progress={null}
        cta={null}
      >
        {body}
      </DrillShell>
    );
  }

  const ui = result ? GRADE_UI[result.grade] : null;
  const isCorrect = result?.grade === "perfect" || result?.grade === "good" || result?.grade === "homophone";

  // Embedded = floating inside the SIO popup (the unit page stays visible
  // behind); standalone = DrillShell (patch 20–21), which owns progress,
  // the score, the result tray and Continue.
  const wrap = (body: React.ReactNode) =>
    embedded ? (
      <>{body}</>
    ) : (
      <DrillShell
        activity="wordrill"
        deck={collectionId}
        exitHref={drillExitHref(collectionId)}
        progress={finished ? null : { done: answered, total: runTotal }}
        right={
          <>
            ✓ {score.ok}/{score.total}
            {score.total > 0 && ` (${Math.round((score.ok / score.total) * 100)}%)`}
          </>
        }
        cta={finished ? { label: "Restart", onClick: restart } : null}
        help={finished ? null : ladder.help}
        feedback={
          !finished && phase === "result" && result && ui && card
            ? {
                kind: isCorrect ? "correct" : "wrong",
                body: (
                  <>
                    {ui.icon} {ui.label}
                    <span className="ml-2 font-medium">&ldquo;{result.recognized || "—"}&rdquo;</span>
                    <span className="ml-2">
                      →{" "}
                      <span lang="fr" className="font-black">
                        {deck ? frFull(articleOf(deck, card), card.fr) : card.fr}
                      </span>
                    </span>
                    <button type="button" onClick={listenModel} className="ml-2 align-middle text-base opacity-70 hover:opacity-100" aria-label="Listen" title="Listen (R)">🔊</button>
                    <button type="button" onClick={startListening} className="ml-3 rounded-full border-2 border-current px-2 py-0.5 text-xs font-bold" title="Try again">
                      🎤 Try again
                    </button>
                  </>
                ),
                cta: { label: "Continue", onClick: next },
              }
            : null
        }
      >
        {body}
      </DrillShell>
    );

  if (!deck) {
    return wrap(<p className="py-16 text-center text-[color:var(--cahier-ink-soft)]">Deck not found.</p>);
  }

  if (!supported) {
    return wrap(
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="text-3xl mb-3">🎤</p>
          <h1 className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)] mb-2">
            Speech recognition not available
          </h1>
          <p className="text-sm text-[color:var(--fluo-ink-soft)] mb-4">
            WorDrill requires Chrome or Edge. Please open this page in one of those browsers.
          </p>
          {!deckOverride && (
            <Link href={`/practice/flip-it/${collectionId}`} className="fluo-btn">
              Use Flip It instead
            </Link>
          )}
        </div>,
    );
  }

  /* ── WorDrill (patch 31) ────────────────────────────────────────────────
     One cahier sheet inside the site chrome (Dan: "chrome: keep it, drill
     sits inside"), so this draws its own bar rather than moving to
     DrillShell, which is h-dvh and would take the whole viewport.
     The controls say what the old prose said: no kicker, no "Tap to speak",
     no keyboard legend — the mic, the switch and the rungs carry it. */
  if (isWorDrill) {
    const marks = log.map((l) => l.mark);
    const missedIds = log.filter((l) => l.mark !== "ok").map((l) => l.it.id).filter(Boolean);
    const frOf = (it: Item) => frFull(articleOf(deck, it), it.fr);

    const langBtn = (v: "en" | "fr") => (
      <button
        type="button"
        onClick={() => setPromptLang(v)}
        aria-pressed={promptLang === v}
        className={`px-3 py-1 text-[0.7rem] font-black transition ${
          promptLang === v
            ? "bg-[color:var(--cahier-ink)] text-[color:var(--cahier-hl)]"
            : "bg-white text-[color:var(--cahier-ink-soft)]"
        }`}
      >
        {v.toUpperCase()}
      </button>
    );

    return (
      <div className="mx-auto max-w-2xl px-4 pb-6 pt-2">
        <div className="cahier-page overflow-hidden rounded-2xl border-2 border-[color:var(--cahier-ink)]/12 shadow-md">
          {/* bar: exit · what the prompt shows · what you have said */}
          <div className="flex h-14 items-center gap-3 border-b-2 border-[color:var(--cahier-ink)]/12 px-4">
            <button
              type="button"
              onClick={onExit}
              aria-label="Back to the scopes"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-[color:var(--cahier-ink)]/45 transition hover:bg-[color:var(--cahier-ink)]/10 hover:text-[color:var(--cahier-ink)]"
            >
              ✕
            </button>
            {!finished && (
              <div className="inline-flex shrink-0 overflow-hidden rounded-full border-[1.5px] border-[color:var(--cahier-ink)]">
                {langBtn("en")}
                {langBtn("fr")}
              </div>
            )}
            <span className="flex-1" />
            <span className="fluo-mono shrink-0 text-sm font-bold text-[color:var(--tier-good)]">
              ✓ {score.ok}
              <span className="font-normal text-[color:var(--cahier-ink-soft)]">/{score.total}</span>
            </span>
          </div>

          <div className="cahier-foolscap px-4 pb-5 pt-6 sm:px-6">
            {finished ? (
              /* ── the run, read back ──────────────────────────────────── */
              <div className="text-center">
                <p className="text-5xl font-black leading-none tracking-tight text-[color:var(--cahier-ink)]">
                  {score.ok}
                  <span className="text-2xl text-[color:var(--cahier-ink-soft)]">/{score.total}</span>
                </p>
                {log.length > 0 && (
                  <SessionMap marks={marks} total={log.length} size={11} className="mx-auto mt-5 max-w-[290px]" />
                )}
                {log.some((l) => l.mark !== "ok") && (
                  <div className="mt-5 overflow-hidden rounded-xl border-[1.5px] border-[color:var(--cahier-ink)]/16 bg-white text-left">
                    {log
                      .filter((l) => l.mark !== "ok")
                      .map((l, i) => (
                        <div
                          key={`${l.it.id}-${i}`}
                          className="flex items-center gap-2.5 border-b border-[color:var(--cahier-line)] px-3 py-2 last:border-b-0"
                        >
                          <span
                            className="block h-[7px] w-[7px] shrink-0 rounded-full"
                            style={{ background: l.mark === "bad" ? "var(--tier-weak)" : "var(--tier-medium)" }}
                          />
                          <span lang="fr" className="min-w-0 flex-1 truncate text-sm font-black">{frOf(l.it)}</span>
                          <span className="shrink-0 text-xs text-[color:var(--cahier-ink-soft)]">{l.it.en}</span>
                          <button
                            type="button"
                            onClick={() => speak(frOf(l.it), "fr-FR")}
                            aria-label={`Listen to ${frOf(l.it)}`}
                            className="shrink-0 text-base opacity-70 transition hover:opacity-100"
                          >
                            🔊
                          </button>
                        </div>
                      ))}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={restart} className="cahier-btn cahier-btn-accent cahier-btn-sm">Restart</button>
                  {missedIds.length > 0 && (
                    <Link href={reviserHref(missedIds)} className="cahier-btn cahier-btn-sm">
                      Les {missedIds.length} ratés ›
                    </Link>
                  )}
                </div>
              </div>
            ) : card ? (
              /* ── one word ─────────────────────────────────────────────── */
              <div className="flex flex-col items-center">
                {card.emoji && <span className="block text-4xl leading-none">{card.emoji}</span>}
                <p
                  lang={promptLang}
                  className="mt-2.5 text-center text-[1.6rem] font-black leading-tight tracking-tight sm:text-[1.9rem]"
                >
                  {promptLang === "en" ? card.en : frOf(card)}
                </p>
                {ladder.help && ladder.help.shown.length > 0 && (
                  <p
                    lang="fr"
                    className="cahier-hl mt-3 inline-block rounded-sm px-1.5 fluo-mono text-lg font-black"
                    style={{ mixBlendMode: "multiply" }}
                  >
                    {ladder.help.shown[ladder.help.shown.length - 1].text}
                  </p>
                )}

                {/* 🔊 · mic · 🔤 — the mic always grades French, whatever the
                    prompt shows, which is what the FR badge is for. */}
                <div className="mt-6 flex items-center gap-[18px]">
                  <button
                    type="button"
                    onClick={listenModel}
                    disabled={phase === "listening"}
                    aria-label="Listen"
                    title="Listen (R)"
                    className="cahier-btn flex h-11 w-11 items-center justify-center !rounded-full !p-0 text-lg disabled:opacity-40 sm:h-[38px] sm:w-[38px] sm:text-base"
                  >
                    🔊
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={phase === "listening" ? stopRec : startListening}
                      aria-label={phase === "listening" ? "Stop" : "Start speaking"}
                      className={`flex h-[76px] w-[76px] items-center justify-center rounded-full text-2xl shadow-lg transition active:scale-95 ${
                        phase === "listening"
                          ? "bg-[color:var(--drill-bad-mid)] text-white ring-4 ring-[color:var(--drill-bad-soft)]"
                          : "bg-[color:var(--cahier-hl)] text-[color:var(--cahier-ink)] hover:brightness-95"
                      }`}
                    >
                      {phase === "listening" ? "⏹" : "🎤"}
                    </button>
                    <span
                      lang="fr"
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--cahier-ink)] px-1.5 text-[0.52rem] font-black tracking-[0.1em] text-[color:var(--cahier-hl)]"
                    >
                      FR
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => ladder.climb()}
                    disabled={!ladder.help?.label || ladder.help?.disabled}
                    aria-label={ladder.help?.label ?? "Show the word"}
                    title={`${ladder.help?.label ?? "Show"} (V)`}
                    className={`cahier-btn flex h-11 w-11 flex-col items-center justify-center gap-[2px] !rounded-full !p-0 disabled:opacity-40 sm:h-[38px] sm:w-[38px] ${
                      peek ? "!bg-[color:var(--cahier-hl)]" : ""
                    }`}
                  >
                    <span className="text-base leading-none sm:text-sm" aria-hidden>🔤</span>
                    {ladder.help && (
                      <span className="flex gap-[2px]" aria-hidden>
                        {Array.from({ length: ladder.help.hintsAvail + 1 }, (_, k) => {
                          const isReveal = k === ladder.help!.hintsAvail;
                          const on = isReveal ? ladder.help!.revealed : k < ladder.help!.hintsTaken;
                          return (
                            <span
                              key={k}
                              className="block h-[3px] w-[3px] rounded-full"
                              style={{
                                background: on
                                  ? isReveal ? "var(--tier-weak)" : "var(--cahier-ink)"
                                  : "rgba(42,46,110,.25)",
                              }}
                            />
                          );
                        })}
                      </span>
                    )}
                  </button>
                </div>

                <SpeechMeter active={phase === "listening"} className="mt-3.5" />

                {/* The recognizer's own words — the one signal that proves it
                    heard something. The meter says "sound"; this says "words". */}
                <p
                  lang="fr"
                  aria-live="polite"
                  className="mt-1 h-5 text-center text-sm font-medium italic text-[color:var(--cahier-ink-soft)]"
                >
                  {phase === "listening" && transcript ? `« ${transcript} »` : ""}
                </p>

                {log.length > 0 && (
                  <SessionMap marks={marks} total={runTotal} className="mt-4 max-w-[280px]" />
                )}

                {/* Back stays (Dan, 2026-07-16) — the design dropped it, but a
                    skipped word you cannot return to is the bug that put it
                    here. Content-sized, not full-width bars. */}
                <div className="mt-5 flex flex-wrap justify-center gap-2 border-t-2 border-[color:var(--cahier-ink)]/12 pt-4">
                  <button type="button" onClick={back} disabled={trail.length === 0} className="cahier-btn cahier-btn-sm disabled:opacity-40" title="Back (B)">Back</button>
                  <button type="button" onClick={skip} disabled={queue.length === 0} className="cahier-btn cahier-btn-sm disabled:opacity-40" title="Defer this word to the end (S)">Skip</button>
                  <button type="button" onClick={endNow} className="cahier-btn cahier-btn-sm" title="End here (E)">End here</button>
                </div>

                {phase === "result" && result && ui && (
                  <div
                    className={`-mx-4 mt-4 w-[calc(100%+2rem)] border-t-2 px-4 py-3 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 ${
                      isCorrect
                        ? "border-[color:var(--drill-ok-soft)] bg-[color:var(--drill-ok-bg)]"
                        : "border-[color:var(--drill-bad-soft)] bg-[color:var(--drill-bad-bg)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <p
                        className={`min-w-0 flex-1 text-sm font-black ${
                          isCorrect ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--drill-bad-ink)]"
                        }`}
                      >
                        {ui.icon} {ui.label}
                        <span lang="fr" className="ml-1.5 font-extrabold">&ldquo;{result.recognized || "—"}&rdquo;</span>
                        <span className="ml-1.5">→ <span lang="fr">{frOf(card)}</span></span>
                        <button type="button" onClick={listenModel} className="ml-1.5 align-middle text-base opacity-70 hover:opacity-100" aria-label="Listen" title="Listen (R)">🔊</button>
                      </p>
                      <button type="button" onClick={next} className="cahier-btn cahier-btn-primary cahier-btn-sm shrink-0">Continue</button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* 🧰 The summonable tools (5 Sep) — WorDrill only, not the say-it
            deck pages or the SIO popup (first pass: the three Skills
            trainers). The chip shows the prompt the learner can SEE (the
            French only once they have earned or asked for it); VoixLà is
            handed what the recognizer heard them say. */}
        <ToolSummon
          context={{
            title: "WorDrill",
            item: card
              ? promptLang === "fr" || peek || phase === "result" ? frOf(card) : card.en
              : undefined,
            french:
              result && result.recognized && result.recognized !== "(nothing heard)"
                ? result.recognized
                : transcript,
          }}
          onCardOpen={onToolOpen}
          onCardClose={onToolClose}
        />
      </div>
    );
  }

  return wrap(
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-4 text-center">
          <p className="fluo-label">{deck.title}</p>
          {embedded && !finished && card && (
            <p className="text-xs text-[color:var(--fluo-ink-soft)]">{answered + 1} / {runTotal}</p>
          )}
        </div>

        {/* Progress bar — DrillShell draws its own; only the popup needs one */}
        {embedded && (
          <div className="h-1.5 rounded-full bg-[color:var(--fluo-line)] mb-6 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${runTotal ? ((finished ? runTotal : answered) / runTotal) * 100 : 0}%` }}
            />
          </div>
        )}

        {finished && (
          <div className="cahier-sheet rounded-2xl p-8 text-center shadow-md">
            <p className="mb-2 text-4xl">🎉</p>
            <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">Done!</h1>
            <p className="mt-2 text-sm text-[color:var(--fluo-ink-soft)]">
              You said {score.total} {score.total === 1 ? "word" : "words"}
              {score.total > 0 && <> · ✓ {score.ok} ({Math.round((score.ok / score.total) * 100)}%)</>}.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {embedded && <button type="button" onClick={restart} className="fluo-btn fluo-btn-sm">Restart</button>}
              <Link href="/reviser" className="fluo-btn fluo-btn-sm fluo-btn-ghost">DéjàRevu ›</Link>
              {embedded && <Link href="/" className="fluo-btn fluo-btn-sm fluo-btn-ghost">← Back to the path</Link>}
            </div>
          </div>
        )}

        {!finished && card && (
          <div className="cahier-sheet rounded-2xl p-6 shadow-md">
            {/* Prompt */}
            <div className="mb-6 text-center">
              {card.emoji && <span className="text-5xl mb-2 block">{card.emoji}</span>}
              <p className="text-xs text-[color:var(--cahier-ink-soft)] mb-1 uppercase tracking-wide">
                Say in French:
              </p>
              <p className="fluo-serif text-2xl font-black text-[color:var(--cahier-ink)]">
                {card.en}
              </p>
              {card.note && (
                <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">{card.note}</p>
              )}
              {embedded && peek && phase !== "result" && (
                <p lang="fr" className="cahier-hl mx-auto mt-2 inline-block rounded-sm px-2 fluo-serif text-xl font-black text-[color:var(--cahier-ink)]">
                  {frFull(articleOf(deck, card), card.fr)}
                </p>
              )}
            </div>

            {/* Mic button — with a listen button beside it (Dan, 2026-07-15),
                hidden while the mic is open so TTS can't grade itself. */}
            {phase !== "result" && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                  {phase === "idle" && (
                    <button
                      type="button"
                      onClick={listenModel}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)]/25 bg-white text-xl shadow-md transition-all hover:border-[color:var(--cahier-ink)] active:scale-95"
                      aria-label="Listen"
                      title="Listen (R)"
                    >
                      🔊
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={phase === "idle" ? startListening : stopRec}
                    className={[
                      "flex h-20 w-20 items-center justify-center rounded-full text-3xl",
                      "shadow-lg transition-all active:scale-95",
                      phase === "listening"
                        ? "bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse"
                        : "bg-[var(--fluo-hl)] text-[color:var(--fluo-ink)] hover:brightness-95",
                    ].join(" ")}
                    aria-label={phase === "listening" ? "Stop" : "Start speaking"}
                  >
                    {phase === "listening" ? "⏹" : "🎤"}
                  </button>
                  {/* 👁 mirrors the 🔊, keeping the mic centred (Dan,
                      2026-07-15: "a button to see the French words too") */}
                  {phase === "idle" && (
                    <button
                      type="button"
                      onClick={() => (embedded ? setRevealed((r) => !r) : ladder.climb())}
                      disabled={!embedded && ladder.help?.disabled}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl shadow-md transition-all active:scale-95 disabled:opacity-40 ${
                        peek
                          ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]"
                          : "border-[color:var(--cahier-ink)]/25 bg-white hover:border-[color:var(--cahier-ink)]"
                      }`}
                      aria-label={embedded ? "Show the word" : ladder.help?.label ?? "Show the word"}
                      title={embedded ? "Show (V)" : `${ladder.help?.label ?? "Show"} (V)`}
                    >
                      🔤
                    </button>
                  )}
                </div>
                <p className="text-sm text-[color:var(--cahier-ink-soft)]">
                  {phase === "listening" ? "Listening… (tap to stop)" : "Tap to speak"}
                </p>
                {phase === "listening" && transcript && (
                  <p className="text-base text-[color:var(--cahier-ink)] font-medium italic">
                    &ldquo;{transcript}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Result — inline only in the popup; DrillShell's tray owns it
                on the standalone page */}
            {embedded && phase === "result" && result && ui && (
              <div className={`rounded-xl border-2 p-4 ${ui.cls}`}>
                <p className="font-black text-lg mb-2">{ui.icon} {ui.label}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-bold">You said: </span>
                    <span className="italic">&ldquo;{result.recognized || "—"}&rdquo;</span>
                  </div>
                  <div>
                    <span className="font-bold">Expected: </span>
                    <span lang="fr" className={`font-black ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                      {deck ? frFull(articleOf(deck, card), card.fr) : card.fr}
                    </span>
                    <button type="button" onClick={listenModel} className="ml-2 align-middle text-base" aria-label="Listen" title="Listen (R)">
                      🔊
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={startListening} className="fluo-btn fluo-btn-sm fluo-btn-ghost">
                    🎤 Try again
                  </button>
                  <button type="button" onClick={next} className="fluo-btn fluo-btn-sm">
                    Next →
                  </button>
                </div>
              </div>
            )}
            {!embedded && phase === "result" && card && (
              /* The word, restated large while the tray shows the verdict —
                 the learner should study the target, not the toolbar. */
              <p lang="fr" className="text-center fluo-serif text-2xl font-black text-[color:var(--cahier-ink)]">
                {deck ? frFull(articleOf(deck, card), card.fr) : card.fr}
              </p>
            )}
          </div>
        )}

        {!finished && card && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={back}
              disabled={trail.length === 0}
              className="fluo-btn fluo-btn-sm fluo-btn-ghost disabled:opacity-40"
              title="Back (B)"
            >
              Back
            </button>
            <button
              type="button"
              onClick={skip}
              disabled={queue.length === 0}
              className="fluo-btn fluo-btn-sm fluo-btn-ghost disabled:opacity-40"
              title="Defer this word to the end (S)"
            >
              Skip
            </button>
            <button type="button" onClick={endNow} className="fluo-btn fluo-btn-sm fluo-btn-ghost" title="End here (E)">
              End here
            </button>
          </div>
        )}

        {/* Keyboard legend: keyboards live above sm — a phone renders 8
            shortcuts it cannot press (patch 20–21). */}
        {!finished && card && (
          <p className="mt-4 hidden text-center text-xs text-[color:var(--fluo-ink-soft)] sm:block">
            Space = 🎤 / stop / retry · Enter = next · R = 🔊 · V = 🔤 · S = skip · B = back · E = end
          </p>
        )}
      </div>,
  );
}
