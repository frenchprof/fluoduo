"use client";

/**
 * Compose It — solo mode. Generalised from the retired DirectionsMapGame
 * (2026-07-05): a random scenario headline, categorised phrase chips that
 * build the current sentence, ✔ to commit the line to the dialogue, 🔊 on
 * every line and on the whole dialogue.
 */

import { useEffect, useState } from "react";
import { logEvent } from "@/lib/firebase/usage";
// Cloud (Google Neural2) speech with automatic browser fallback — the
// exercises sound identical on every device (Dan, 2026-07-18).
import { speakCloud as speak, stopCloudVoice } from "@/lib/cloudVoice";
import { sfx } from "@/games/audio/sfx";
import { awardConversationXp } from "@/lib/progress";
import { recordResponse } from "@/lib/firebase/responses";
import { categoryHeaderClass, type ComposeBank } from "@/games/compose/banks";
import GameFrame from "@/components/GameFrame";
import GameOver from "@/components/GameOver";
import { drillExitHref } from "@/components/DrillShell";

/** Join tapped chips into readable French (", " chips collapse into commas). */
function joinChips(chips: string[]): string {
  return chips
    .join(" ")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ComposeSolo({ bank }: { bank: ComposeBank }) {
  useEffect(() => {
    void logEvent("game.start", { game: "compose-solo", collectionId: bank.id });
  }, [bank.id]);
  const lang = "fr-FR";
  // Deterministic on the server; randomised in the mount effect (SSR-safe).
  const [scenario, setScenario] = useState<{ instructionEn: string; headline: string; openingFr?: string } | null>(null);
  const [line, setLine] = useState<string[]>([]); // sentence in progress
  const [lines, setLines] = useState<string[]>([]); // committed sentences
  // AI "check my work" pass (aiCheck banks only). The passer-by reads the whole
  // itinerary and reacts. `unavailable` latches when the backend isn't there
  // (no MISTRAL_API_KEY / local preview) so the button quietly disappears.
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ reply: string; done: boolean } | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const s = bank.newScenario();
    setScenario(s);
    // The Composer never opens on a blank sheet (Dan, 2026-07-19): the
    // passer-by asks the way out loud before the learner builds a reply.
    if (s.openingFr) speak(s.openingFr, "fr-FR", { gender: "m" });
  }, [bank]);

  const lineText = joinChips(line);
  const dialogueText = [...lines, lineText].filter(Boolean).join(" ");

  const addPhrase = (p: string) => setLine((d) => [...d, p]);
  const undo = () => {
    if (line.length > 0) setLine((d) => d.slice(0, -1));
    else setLines((ls) => ls.slice(0, -1));
  };
  const clearOnly = () => {
    setLine([]);
    setLines([]);
    setFeedback(null);
    if (typeof window !== "undefined") { window.speechSynthesis?.cancel(); stopCloudVoice(); }
  };
  const reset = () => {
    setLine([]);
    setLines([]);
    setFeedback(null);
    if (typeof window !== "undefined") { window.speechSynthesis?.cancel(); stopCloudVoice(); }
    const s = bank.newScenario();
    setScenario(s);
    if (s.openingFr) speak(s.openingFr, "fr-FR", { gender: "m" });
  };

  // Ask the AI passer-by to read the whole itinerary and react. Degrades
  // silently to "unavailable" if the backend is missing (503/404).
  const check = async () => {
    const text = dialogueText;
    if (!text || checking) return;
    setChecking(true);
    setFeedback(null);
    try {
      const r = await fetch("/api/compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scene: bank.id,
          context: scenario?.instructionEn ?? "",
          messages: [{ role: "user", content: text }],
        }),
      });
      if ([404, 405, 501, 503].includes(r.status)) {
        setUnavailable(true);
        return;
      }
      const data = (await r.json().catch(() => null)) as { reply?: string; done?: boolean } | null;
      if (!data?.reply) {
        setFeedback({ reply: "Pardon, un petit souci… réessayez !", done: false });
        return;
      }
      setFeedback({ reply: data.reply, done: data.done === true });
      speak(data.reply, lang, { gender: "m" });
      if (data.done) {
        sfx.stage();
        awardConversationXp();
        recordResponse(bank.id, true, { activity: `compose-solo:${bank.id}` });
        void logEvent("game.end", { game: "compose-solo", collectionId: bank.id });
      } else sfx.correct();
    } catch {
      setUnavailable(true);
    } finally {
      setChecking(false);
    }
  };
  const commitLine = () => {
    if (!lineText) return;
    setLines((ls) => [...ls, lineText]);
    setLine([]);
    speak(lineText, lang);
  };
  const speakDialogue = () => {
    if (dialogueText) speak(dialogueText, lang);
  };

  const exitHref = drillExitHref(bank.deckId);
  const help = (
    <>
      <p>Tap phrases to build a sentence; ✔ adds it to the dialogue. 🔊 reads any line back.</p>
      {bank.aiCheck && <p className="mt-2">🚶 The passer-by reads the whole itinerary and reacts — in French.</p>}
    </>
  );
  const record = (
    <ol className="flex flex-col gap-1.5">
      {lines.map((l, i) => (
        <li key={`${i}-${l}`} lang="fr" className="rounded-lg border-2 border-[color:var(--cahier-line)] px-2 py-1 text-sm">{l}</li>
      ))}
    </ol>
  );

  return (
    <GameFrame
      title={`${bank.emoji} ${bank.title}`}
      exitHref={exitHref}
      progress={null}
      score={lines.length > 0 ? <>{lines.length} ✎</> : undefined}
      help={help}
      menu={[
        { label: "New scenario", onClick: reset },
        { label: "🧹 Clear", onClick: clearOnly },
      ]}
      record={record}
      recordTitle="✎ Your lines"
    >
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 overflow-y-auto px-4 py-4 text-[color:var(--cahier-ink)]">
      {/* The task — the one line the learner cannot compose without. */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p lang="fr" className="cahier-display text-xl font-black">{scenario?.headline ?? "…"}</p>
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">{scenario?.instructionEn ?? ""}</p>
        </div>
        <button
          type="button"
          onClick={undo}
          disabled={line.length === 0 && lines.length === 0}
          className="cahier-btn cahier-btn-sm"
        >
          ↶ Undo
        </button>
      </div>

      {feedback?.done && (
        <GameOver
          emoji={bank.emoji}
          title="Bravo !"
          score={<>{lines.length} ✎</>}
          won
          misses={[]}
          onReplay={reset}
          exitHref={exitHref}
          extra={
            <div className="mt-3 rounded-xl border-2 border-[color:var(--cahier-gold)] bg-[color:var(--cahier-gold)]/10 px-4 py-3">
              <p lang="fr" className="text-sm leading-relaxed">🚶 {feedback.reply}</p>
            </div>
          }
        />
      )}

      <div className="min-h-[120px] rounded-xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] p-5">
        {/* The passer-by's question opens the scene — tap to rehear. */}
        {scenario?.openingFr && (
          <button
            type="button"
            lang="fr"
            onClick={() => speak(scenario.openingFr!, lang, { gender: "m" })}
            className="mb-3 flex max-w-full items-start gap-2 rounded-2xl rounded-bl-sm border-2 border-[color:var(--cahier-rule)] bg-white px-4 py-2 text-left text-base leading-snug shadow-sm transition hover:brightness-95"
            title="🔊"
          >
            <span aria-hidden>🧍</span>
            <span>{scenario.openingFr}</span>
          </button>
        )}
        {lines.length > 0 && (
          <ol className="mb-3 flex flex-col gap-1.5">
            {lines.map((l, i) => (
              <li key={`${i}-${l}`} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => speak(l, lang)}
                  className="cahier-btn cahier-btn-sm shrink-0"
                  aria-label={`Speak: ${l}`}
                >
                  🔊
                </button>
                <span lang="fr" className="text-lg leading-relaxed">
                  {l}
                </span>
              </li>
            ))}
          </ol>
        )}
        {line.length === 0 ? (
          lines.length === 0 && (
            <p className="italic text-[color:var(--cahier-ink-soft)]">
              Start by tapping a phrase below…
            </p>
          )
        ) : (
          <p lang="fr" className="text-xl leading-relaxed">
            {lineText}
            <span className="animate-pulse" aria-hidden>
              ▏
            </span>
          </p>
        )}
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={commitLine}
            disabled={line.length === 0}
            className="cahier-btn cahier-btn-primary"
          >
            ✔ Add the sentence
          </button>
          <button
            type="button"
            onClick={speakDialogue}
            disabled={lines.length === 0 && line.length === 0}
            className="cahier-btn cahier-btn-primary"
          >
            🔊 Speak it all
          </button>
          {bank.aiCheck && !unavailable && (
            <button
              type="button"
              onClick={check}
              disabled={!dialogueText || checking}
              className="cahier-btn cahier-btn-gold"
            >
              {checking ? "🚶 …" : "🚶 The passer-by checks"}
            </button>
          )}
        </div>

        {feedback && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border-2 px-4 py-3 ${
              feedback.done
                ? "border-emerald-600/50 bg-emerald-600/10"
                : "border-[color:var(--cahier-gold)] bg-[color:var(--cahier-gold)]/10"
            }`}
          >
            <button
              type="button"
              onClick={() => speak(feedback.reply, lang, { gender: "m" })}
              className="shrink-0 text-2xl leading-none"
              aria-label="Listen again"
              title="🔊"
            >
              🚶
            </button>
            <p lang="fr" className="text-base leading-relaxed text-[color:var(--cahier-ink)]">
              {feedback.reply}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {bank.categories.map((cat, i) => (
          <section
            key={cat.label}
            className="overflow-hidden rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white"
          >
            <header
              className={`px-4 py-3 text-sm font-bold uppercase tracking-widest ${categoryHeaderClass(i)}`}
            >
              {cat.label}
            </header>
            <div className="flex flex-wrap gap-2 p-3">
              {cat.phrases.map((p) => (
                <button
                  key={p}
                  type="button"
                  lang="fr"
                  onClick={() => addPhrase(p)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${cat.chip}`}
                  title={`Add ${p}`}
                >
                  {p === ", " ? ",  (comma)" : p}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
    </GameFrame>
  );
}
