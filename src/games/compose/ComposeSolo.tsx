"use client";

/**
 * Compose It — solo mode. Generalised from the retired DirectionsMapGame
 * (2026-07-05): a random scenario headline, categorised phrase chips that
 * build the current sentence, ✔ to commit the line to the dialogue, 🔊 on
 * every line and on the whole dialogue.
 */

import { useEffect, useState } from "react";
import { logEvent } from "@/lib/firebase/usage";
import { speak } from "@/games/letris/speech";
import { sfx } from "@/games/audio/sfx";
import { awardConversationXp } from "@/lib/progress";
import { categoryHeaderClass, type ComposeBank } from "@/games/compose/banks";

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
  const [scenario, setScenario] = useState<{ instructionEn: string; headline: string } | null>(null);
  const [line, setLine] = useState<string[]>([]); // sentence in progress
  const [lines, setLines] = useState<string[]>([]); // committed sentences
  // AI "check my work" pass (aiCheck banks only). The passer-by reads the whole
  // itinerary and reacts. `unavailable` latches when the backend isn't there
  // (no MISTRAL_API_KEY / local preview) so the button quietly disappears.
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ reply: string; done: boolean } | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setScenario(bank.newScenario());
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
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  };
  const reset = () => {
    setLine([]);
    setLines([]);
    setFeedback(null);
    setScenario(bank.newScenario());
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
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
      if (data.done) { sfx.stage(); awardConversationXp(); void logEvent("game.end", { game: "compose-solo", collectionId: bank.id }); } else sfx.correct();
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 text-[color:var(--cahier-ink)]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 lang="fr" className="cahier-display text-2xl font-black">
            {scenario?.headline ?? "…"}
          </h1>
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">
            {scenario?.instructionEn ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={undo}
            disabled={line.length === 0 && lines.length === 0}
            className="cahier-btn cahier-btn-sm"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            onClick={clearOnly}
            disabled={line.length === 0 && lines.length === 0}
            className="cahier-btn cahier-btn-sm"
          >
            🧹 Clear
          </button>
          <button type="button" onClick={reset} className="cahier-btn cahier-btn-sm">
            🔁 New scenario
          </button>
        </div>
      </header>

      <div className="min-h-[120px] rounded-xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] p-5">
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
              {checking ? "🚶 …" : "🚶 Le passant vérifie"}
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
              aria-label="Réécouter"
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
  );
}
