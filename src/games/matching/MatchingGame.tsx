"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";
import { logEvent } from "@/lib/firebase/usage";

export type MatchingLeft = {
  id: string;
  text: string;
  meaning?: string;
  emoji?: string;
};

export type MatchingRight = {
  id: string;
  text: string;
  meaning?: string;
  emoji?: string;
  validLefts: string[];
};

export type MatchingSet = {
  id: string;
  title: string;
  subtitle?: string;
  language?: string;
  lefts: MatchingLeft[];
  rights: MatchingRight[];
};

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function speakable(text: string): string {
  // Drop placeholder markers like Xᵉ so TTS reads cleanly
  return text.replace(/Xᵉ/g, "");
}

function buildPairSentence(left: MatchingLeft, right: MatchingRight): string {
  return `${left.text} ${right.text}`.toLowerCase().replace(/\bx\b/g, "");
}

export default function MatchingGame({ set }: { set: MatchingSet }) {
  // Initial render uses source order so SSR matches first client paint.
  // Shuffle once after mount to avoid hydration mismatch from Math.random().
  const [lefts, setLefts] = useState<MatchingLeft[]>(set.lefts);
  const [rights, setRights] = useState<MatchingRight[]>(set.rights);
  useEffect(() => {
    setLefts(shuffle(set.lefts));
    setRights(shuffle(set.rights));
  }, [set.lefts, set.rights]);
  const [solvedRightIds, setSolvedRightIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [flash, setFlash] = useState<{
    leftId: string;
    rightId: string;
    kind: "ok" | "bad";
  } | null>(null);
  const [showMeaning, setShowMeaning] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);

  const lang = set.language ? `${set.language}-FR` : "fr-FR";
  const total = set.rights.length;
  const done = solvedRightIds.size >= total;

  const leftById = useMemo(
    () => new Map(set.lefts.map((l) => [l.id, l])),
    [set.lefts],
  );

  const restart = useCallback(() => {
    setSolvedRightIds(new Set());
    setSelectedLeft(null);
    setFlash(null);
    setAttempts(0);
    setCorrect(0);
    setRights(shuffle(set.rights));
  }, [set.rights]);

  const tryPair = useCallback(
    (leftId: string, rightId: string) => {
      const right = set.rights.find((r) => r.id === rightId);
      if (!right) return;
      const isValid = right.validLefts.includes(leftId);
      // Match It recorded NOTHING before — no play, no answer, no evidence.
      // Both events are derived from the counters rather than a mounted flag,
      // so a restart (which zeroes them) is a fresh play: the first pair is the
      // start, the pair that completes the board is the end.
      if (attempts === 0) void logEvent("game.start", { game: "matching", collectionId: set.id });
      setAttempts((a) => a + 1);
      const left = leftById.get(leftId);
      recordItemResult(rightId, isValid, left?.text);
      if (isValid && solvedRightIds.size + 1 >= total) {
        void logEvent("game.end", { game: "matching", collectionId: set.id, score: correct + 1, total });
      }
      setFlash({ leftId, rightId, kind: isValid ? "ok" : "bad" });
      window.setTimeout(() => setFlash(null), 450);
      if (isValid) {
        if (left && audioOn) speak(speakable(buildPairSentence(left, right)), lang);
        setCorrect((c) => c + 1);
        setSolvedRightIds((s) => {
          const next = new Set(s);
          next.add(rightId);
          return next;
        });
        setSelectedLeft(null);
      } else {
        setSelectedLeft(null);
      }
    },
    [attempts, audioOn, correct, lang, leftById, set.id, set.rights, solvedRightIds, total],
  );

  const onLeftClick = (id: string) => {
    if (done) return;
    setSelectedLeft((cur) => (cur === id ? null : id));
  };

  const onRightClick = (id: string) => {
    if (done) return;
    if (solvedRightIds.has(id)) return;
    if (!selectedLeft) {
      // Tap right first: just briefly hint that left must be selected
      setFlash({ leftId: "", rightId: id, kind: "bad" });
      window.setTimeout(() => setFlash(null), 250);
      return;
    }
    tryPair(selectedLeft, id);
  };

  // Listen for Esc to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedLeft(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 text-[color:var(--cahier-ink)]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="cahier-display text-2xl font-black">{set.title}</h1>
          {set.subtitle && (
            <p className="text-sm text-[color:var(--cahier-ink-soft)]">{set.subtitle}</p>
          )}
        </div>
        {/* flex-wrap (bug, to 2026-08-10): on a 390px phone this row ran to
            x=468, so Restart sat at x=402 — off-screen, and the page has no
            horizontal scroll, so it could not be reached at all. */}
        <div className="flex flex-wrap items-center gap-3 text-sm font-mono">
          <span>
            Pairs <b className="text-emerald-700">{solvedRightIds.size}</b>/{total}
          </span>
          <span>
            Accuracy <b className="text-amber-700">{accuracy}%</b>
          </span>
          <label className="flex items-center gap-2 text-[color:var(--cahier-ink-soft)]">
            <input
              type="checkbox"
              checked={showMeaning}
              onChange={(e) => setShowMeaning(e.target.checked)}
              className="h-4 w-4 accent-[#2a2e6e]"
            />
            Show English
          </label>
          <label className="flex items-center gap-2 text-[color:var(--cahier-ink-soft)]">
            <input
              type="checkbox"
              checked={audioOn}
              onChange={(e) => setAudioOn(e.target.checked)}
              className="h-4 w-4 accent-[#2a2e6e]"
            />
            Audio
          </label>
          <button type="button" onClick={restart} className="cahier-btn cahier-btn-sm">
            Restart
          </button>
        </div>
      </header>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--cahier-rule)]">
        <div
          className="h-full bg-[color:var(--cahier-hl-edge)] transition-all duration-200"
          style={{ width: `${(solvedRightIds.size / total) * 100}%` }}
        />
      </div>

      {!done && (
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-4 py-3 text-sm font-semibold">
          <span className="text-2xl" aria-hidden>
            👇
          </span>
          <span>
            Tap a{" "}
            <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">
              verb phrase
            </span>{" "}
            on the left, then a{" "}
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800">
              completion
            </span>{" "}
            on the right.
          </span>
        </div>
      )}

      {done ? (
        <div className="rounded-2xl border-2 border-emerald-600 bg-white p-10 text-center">
          <div className="text-6xl">🎉</div>
          <h2 className="mt-2 text-3xl font-black">All matched!</h2>
          <p className="mt-2 text-[color:var(--cahier-ink-soft)]">
            {correct} correct out of {attempts} attempts ({accuracy}%).
          </p>
          <button
            type="button"
            onClick={restart}
            className="cahier-btn cahier-btn-primary mt-6"
          >
            Play again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* LEFT COLUMN */}
          <section
            aria-label="Verb phrases"
            className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3"
          >
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-[color:var(--cahier-le)]">
              Verb phrase
            </h3>
            <ul className="flex flex-col gap-2">
              {lefts.map((l) => {
                const isSel = selectedLeft === l.id;
                const isFlash = flash && flash.leftId === l.id;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => onLeftClick(l.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-3 text-left transition ${
                        isSel
                          ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl)]/40 ring-2 ring-[color:var(--cahier-ink)]"
                          : "border-[color:var(--cahier-rule)] bg-white hover:border-[color:var(--cahier-ink-soft)] hover:bg-[color:var(--cahier-paper-2)]"
                      } ${
                        isFlash && flash!.kind === "ok"
                          ? "!border-emerald-500 !bg-emerald-100"
                          : ""
                      } ${
                        isFlash && flash!.kind === "bad"
                          ? "!border-rose-500 !bg-rose-100"
                          : ""
                      }`}
                    >
                      {l.emoji && (
                        <span className="text-2xl" aria-hidden>
                          {l.emoji}
                        </span>
                      )}
                      <span className="flex-1">
                        <span className="block text-base font-bold sm:text-lg">
                          {l.text}
                        </span>
                        {showMeaning && l.meaning && (
                          <span className="block text-xs italic text-[color:var(--cahier-ink-soft)]">
                            {l.meaning}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* RIGHT COLUMN */}
          <section
            aria-label="Completions"
            className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3"
          >
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
              Completion
            </h3>
            <ul className="flex flex-col gap-2">
              {rights.map((r) => {
                const solved = solvedRightIds.has(r.id);
                const isFlash = flash && flash.rightId === r.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onRightClick(r.id)}
                      disabled={solved}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-3 text-left transition ${
                        solved
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 opacity-70"
                          : "border-[color:var(--cahier-rule)] bg-white hover:border-[color:var(--cahier-ink-soft)] hover:bg-[color:var(--cahier-paper-2)]"
                      } ${
                        !solved && isFlash && flash!.kind === "ok"
                          ? "!border-emerald-500 !bg-emerald-100"
                          : ""
                      } ${
                        !solved && isFlash && flash!.kind === "bad"
                          ? "!border-rose-500 !bg-rose-100"
                          : ""
                      }`}
                    >
                      {r.emoji && (
                        <span className="text-2xl" aria-hidden>
                          {r.emoji}
                        </span>
                      )}
                      <span className="flex-1">
                        <span className="block text-base font-bold sm:text-lg">
                          {r.text}
                        </span>
                        {showMeaning && r.meaning && (
                          <span className="block text-xs italic text-[color:var(--cahier-ink-soft)]">
                            {r.meaning}
                          </span>
                        )}
                      </span>
                      {solved && (
                        <span className="text-lg text-emerald-600" aria-hidden>
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
