"use client";

/**
 * 🤖 Le Tuteur — chat surface for the AI tutor (backend: /api/tutor, a
 * Cloudflare Pages Function; see functions/api/tutor.js for the prompt and
 * the MISTRAL_API_KEY setup). Ported concept from laf1201's tutor (Dan,
 * 2026-07-05). Until the key is configured — and on any non-Cloudflare
 * preview, where /api/tutor 404s — the page degrades to a friendly
 * "not wired up yet" card instead of a broken chat.
 */
import { useEffect, useRef, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { speakMixed, pauseSpeech, resumeSpeech, isSpeechPaused } from "@/games/letris/speech";

type ChatMsg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Bonjour ! 👋 I'm your French tutor. Ask me anything about the course — or just write a sentence in French and I'll help you polish it.";

/** Grow the textarea to fit its content (up to a cap); the user can still drag
 *  it taller via the resize handle. */
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  // Per-balloon player (Dan, 2026-07-12: "play, pause and stop buttons next
  // to or below each balloon"): which bubble is being read, and paused state.
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  function playMsg(i: number, content: string) {
    stopRef.current?.();
    setPaused(false);
    const stop = speakMixed(content, () => { setPlayingIdx(null); setPaused(false); });
    stopRef.current = stop;
    setPlayingIdx(stop ? i : null);
  }
  function togglePause() {
    if (isSpeechPaused()) { resumeSpeech(); setPaused(false); }
    else { pauseSpeech(); setPaused(true); }
  }
  function stopPlayback() {
    stopRef.current?.();
    stopRef.current = null;
    setPlayingIdx(null);
    setPaused(false);
  }
  // Leaving the page mid-read must not leave the voice running.
  useEffect(() => () => stopRef.current?.(), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, busy]);

  // Reset the box back to one row once it's been cleared (after sending).
  useEffect(() => {
    if (input === "" && taRef.current) taRef.current.style.height = "auto";
  }, [input]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMsg[] = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // The greeting is UI furniture, not conversation — don't send it.
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      // No backend here: 503 = function deployed but no API key yet; the
      // rest = hosts without Pages Functions at all (local preview etc.).
      if ([503, 404, 405, 501].includes(r.status)) {
        setOffline(true);
        return;
      }
      const data = await r.json().catch(() => null);
      if (!r.ok || !data?.reply) {
        setMessages((m) => [...m, { role: "assistant", content: "Oups — j'ai eu un souci technique. Réessayez !" }]);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Oups — j'ai eu un souci technique. Réessayez !" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="tutor" crumb="🤖 Tuteur">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">🤖 Le Tuteur <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· Tutor</span></h1>

        {offline ? (
          <div className="rounded-2xl border-2 border-dashed border-[color:var(--cahier-ink)]/40 bg-white p-5">
            <p className="text-sm font-bold text-[color:var(--cahier-ink)]">
              Le tuteur n&rsquo;est pas encore branché ici. 🔌
            </p>
            <p className="mt-1.5 text-sm text-[color:var(--cahier-ink-soft)]">
              In the meantime, the tutor still lives on{" "}
              <a href="https://laf1201.withdrchan.com" className="font-bold underline">laf1201.withdrchan.com</a>.
            </p>
          </div>
        ) : (
          <>
            {/* The conversation scrolls INSIDE this box (intended: the input
                stays reachable below) — but let it use the real viewport
                height instead of a stingy 55vh (Dan, 2026-07-12). */}
            <div className="flex max-h-[calc(100dvh-16rem)] min-h-[16rem] flex-col gap-2 overflow-y-auto rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <button
                    type="button"
                    // Bilingual bubbles: the tutor marks French in « … », and
                    // speech switches language exactly there (Dan, 2026-07-12).
                    onClick={() => playMsg(i, m.content)}
                    title="🔊"
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl border-2 px-4 py-2 text-left text-sm leading-relaxed transition hover:brightness-95 ${
                      m.role === "user"
                        ? "rounded-br-sm border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]/50 text-[color:var(--cahier-ink)]"
                        : "rounded-bl-sm border-[color:var(--cahier-rule)] bg-white text-[color:var(--cahier-ink)]"
                    }`}
                  >
                    {m.role === "assistant" && <span className="mr-1.5" aria-hidden>🤖</span>}
                    {m.content}
                  </button>
                  {/* Player row under the balloon: ▶ when idle; ⏸/▶ + ⏹ while
                      THIS balloon is being read. */}
                  <div className="mt-0.5 flex gap-1">
                    {playingIdx === i ? (
                      <>
                        <button type="button" onClick={togglePause}
                          className="rounded-lg border border-[color:var(--cahier-rule)] bg-white px-2 py-0.5 text-xs font-bold text-[color:var(--cahier-ink)]">
                          {paused ? "▶" : "⏸"}
                        </button>
                        <button type="button" onClick={stopPlayback}
                          className="rounded-lg border border-[color:var(--cahier-rule)] bg-white px-2 py-0.5 text-xs font-bold text-[color:var(--cahier-ink)]">
                          ⏹
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => playMsg(i, m.content)} title="Écouter"
                        className="rounded-lg border border-transparent px-2 py-0.5 text-xs font-bold text-[color:var(--cahier-ink-soft)] hover:border-[color:var(--cahier-rule)] hover:bg-white">
                        ▶
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <p className="animate-pulse text-sm text-[color:var(--cahier-ink-soft)]">🤖 …</p>
              )}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); void send(); }}
              className="flex items-end gap-2"
            >
              <textarea
                lang="fr"
                ref={taRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoGrow(e.target); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                placeholder="Écrivez en français ou posez une question…  (Entrée = envoyer · Maj+Entrée = nouvelle ligne)"
                rows={1}
                /* NB: not .cahier-answer — that pins height:30px!important, which
                   would kill grow/resize. AccentBar still shows via lang="fr". */
                className="max-h-[260px] min-h-[2.7rem] flex-1 resize-y rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-[0.95rem] leading-snug text-[color:var(--cahier-ink)] outline-none focus:border-[color:var(--cahier-le)]"
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              <button type="submit" disabled={busy || !input.trim()} className="cahier-btn cahier-btn-accent font-black disabled:opacity-40">
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </CahierShell>
  );
}
