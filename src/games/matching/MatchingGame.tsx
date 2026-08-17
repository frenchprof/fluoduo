"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { speak } from "@/games/letris/speech";
import { recordItemResult } from "@/lib/progress";
import { logEvent } from "@/lib/firebase/usage";
import GameFrame from "@/components/GameFrame";
import GameOver, { type GameMiss } from "@/components/GameOver";
import { drillExitHref } from "@/components/DrillShell";
import { shuffle } from "@/lib/shuffle";

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
  // Wrong pairings, for the post-mortem (patch 23); right matches, for the
  // desktop live record.
  const [misses, setMisses] = useState<GameMiss[]>([]);
  const [matched, setMatched] = useState<Array<{ left: string; right: string }>>([]);

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
    setMisses([]);
    setMatched([]);
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
        setMatched((m) => [...m, { left: left?.text ?? "", right: right.text }]);
        setCorrect((c) => c + 1);
        setSolvedRightIds((s) => {
          const next = new Set(s);
          next.add(rightId);
          return next;
        });
        setSelectedLeft(null);
      } else {
        const wanted = set.rights.find((r) => r.validLefts.includes(leftId));
        setMisses((m) => [
          ...m,
          { itemId: rightId, deckId: set.id, prompt: left?.text ?? leftId, expected: wanted?.text ?? "?", given: right.text },
        ]);
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

  const exitHref = drillExitHref(set.id);
  const help = (
    <>
      <p>Tap a phrase on the left, then its completion on the right.</p>
      <p className="mt-2">A wrong pair flashes red and stays open; a right one locks with a ✓ and is spoken.</p>
    </>
  );
  const record = (
    <ol className="flex flex-col gap-1.5">
      {[...matched].reverse().map((m, i) => (
        <li key={matched.length - i} lang="fr" className="rounded-lg border-2 border-[color:var(--drill-ok-soft)] bg-[color:var(--drill-ok-bg)] px-2 py-1 text-sm">
          <span className="font-bold">{m.left}</span> <span className="text-[color:var(--cahier-ink-soft)]">{m.right}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <GameFrame
      title={`🔗 ${set.title}`}
      exitHref={exitHref}
      progress={{ done: solvedRightIds.size, total }}
      score={<>{accuracy}%</>}
      help={help}
      menu={[
        { label: "🇬🇧 Show English", active: showMeaning, onClick: () => setShowMeaning((v) => !v) },
        { label: "🔊 Audio", active: audioOn, onClick: () => setAudioOn((v) => !v) },
        { label: "↻ Restart", onClick: restart },
      ]}
      record={record}
      recordTitle="🔗 Matched"
    >
    <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto px-4 py-4 text-[color:var(--cahier-ink)]">
      {done ? (
        <GameOver
          emoji="🎉"
          title="All matched!"
          score={<>{correct} / {attempts} · {accuracy}%</>}
          won
          misses={misses}
          onReplay={restart}
          exitHref={exitHref}
        />
      ) : (
        // Two columns at every width (patch 23): both lists on one phone
        // screen, no scroll to find the completion for the phrase you
        // picked. Rows are compact below sm.
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* LEFT COLUMN */}
          <section
            aria-label="Verb phrases"
            className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-1.5 sm:p-3"
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
                      className={`flex w-full items-center gap-2 rounded-lg border-2 px-2 py-2 text-left transition sm:gap-3 sm:px-3 sm:py-3 ${
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
                        <span className="hidden text-2xl sm:inline" aria-hidden>
                          {l.emoji}
                        </span>
                      )}
                      <span className="flex-1">
                        <span className="block text-sm font-bold leading-tight sm:text-lg">
                          {l.text}
                        </span>
                        {showMeaning && l.meaning && (
                          <span className="hidden text-xs italic text-[color:var(--cahier-ink-soft)] sm:block">
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
            className="rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-1.5 sm:p-3"
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
                      className={`flex w-full items-center gap-2 rounded-lg border-2 px-2 py-2 text-left transition sm:gap-3 sm:px-3 sm:py-3 ${
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
                        <span className="hidden text-2xl sm:inline" aria-hidden>
                          {r.emoji}
                        </span>
                      )}
                      <span className="flex-1">
                        <span className="block text-sm font-bold leading-tight sm:text-lg">
                          {r.text}
                        </span>
                        {showMeaning && r.meaning && (
                          <span className="hidden text-xs italic text-[color:var(--cahier-ink-soft)] sm:block">
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
    </GameFrame>
  );
}
