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
import { speakMixed, pauseSpeech, resumeSpeech, isSpeechPaused, guessLang, type MixedPlayback } from "@/games/letris/speech";
import type { ReactNode } from "react";

type ChatMsg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Bonjour ! 👋 I'm your French tutor. Ask me anything about the course, or just write a sentence in French and I'll help you polish it.";

/** Balloon renderer (Dan, 2026-07-13): French in blue, English in the
 *  default ink, using the SAME markers the TTS speaks from (« … » spans,
 *  then the heuristic) so eyes and ears always agree; markdown headings
 *  (#, ##, …) and **bold** render bold. */
function renderBilingual(text: string): ReactNode[] {
  let key = 0;
  const langSpans = (t: string): ReactNode[] => {
    const nodes: ReactNode[] = [];
    const fr = (x: string) => nodes.push(<span key={key++} lang="fr" className="font-semibold text-[#0b63c4]">{x}</span>);
    for (const span of t.split(/(«[^»]*»|\([^)]*\))/g)) {
      if (!span) continue;
      if (span.startsWith("«")) { fr(span); continue; }
      if (span.startsWith("(")) { nodes.push(<span key={key++}>{span}</span>); continue; }
      for (const chunk of span.split(/((?<=[.!?…:])\s+)/g)) {
        if (!chunk) continue;
        if (/^\s+$/.test(chunk) || !/[a-zà-ÿ]/i.test(chunk)) { nodes.push(<span key={key++}>{chunk}</span>); continue; }
        if (guessLang(chunk) === "fr-FR") fr(chunk);
        else nodes.push(<span key={key++}>{chunk}</span>);
      }
    }
    return nodes;
  };
  const inline = (t: string): ReactNode[] => {
    const nodes: ReactNode[] = [];
    for (const part of t.split(/(\*\*[^*]+\*\*)/g)) {
      if (!part) continue;
      if (part.startsWith("**") && part.endsWith("**")) {
        nodes.push(<strong key={key++}>{langSpans(part.slice(2, -2))}</strong>);
      } else {
        nodes.push(...langSpans(part));
      }
    }
    return nodes;
  };
  const out: ReactNode[] = [];
  for (const line of text.split(/(\n+)/g)) {
    if (!line) continue;
    if (/^\n+$/.test(line)) { out.push(<span key={key++}>{line}</span>); continue; }
    const h = line.match(/^\s{0,3}#{1,4}\s+(.*)$/);
    if (h) out.push(<strong key={key++}>{inline(h[1])}</strong>);
    else out.push(...inline(line));
  }
  return out;
}

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
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<MixedPlayback | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  function playMsg(i: number, content: string, rate?: number) {
    playerRef.current?.stop();
    setPaused(false);
    setProgress(0);
    const player = speakMixed(content, {
      rate,
      onDone: () => { setPlayingIdx(null); setPaused(false); setProgress(0); },
      onProgress: setProgress,
    });
    playerRef.current = player;
    setPlayingIdx(player ? i : null);
  }
  function togglePause() {
    if (isSpeechPaused()) { resumeSpeech(); setPaused(false); }
    else { pauseSpeech(); setPaused(true); }
  }
  function stopPlayback() {
    playerRef.current?.stop();
    playerRef.current = null;
    setPlayingIdx(null);
    setPaused(false);
    setProgress(0);
  }
  // Leaving the page mid-read must not leave the voice running.
  useEffect(() => () => playerRef.current?.stop(), []);

  /** Print-to-PDF of the conversation so far (Dan, 2026-07-13: a "Save as
   *  pdf" button on the latest tutor reply, gone once a new input is sent).
   *  Opens a print-styled window; the browser's print dialog offers PDF. */
  function savePdf() {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const fmt = (t: string) =>
      esc(t)
        .replace(/(«[^»]*»)/g, '<span style="color:#0b63c4;font-weight:600">$1</span>')
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/^\s{0,3}#{1,4}\s+(.*)$/gm, "<b>$1</b>")
        .replace(/\n/g, "<br>");
    const rows = messages
      .map((m) => `<div class="${m.role}"><b class="who">${m.role === "user" ? "Vous" : "Le Tuteur"}</b><p>${fmt(m.content)}</p></div>`)
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Le Tuteur · FluoLingo</title><style>
      body{font-family:Georgia,serif;max-width:640px;margin:24px auto;color:#222850}
      h1{font-size:18px;margin:0 0 2px}
      .meta{color:#666;font-size:12px;margin-bottom:16px}
      .user,.assistant{margin:10px 0;padding:10px 14px;border-radius:12px;border:1px solid #ccc}
      .user{background:#fdf6c8}
      .assistant{background:#fff}
      .who{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#666}
      p{margin:4px 0 0;font-size:14px;line-height:1.5}
    </style></head><body>
    <h1>🤖 Le Tuteur · FluoLingo</h1><div class="meta">${new Date().toLocaleString("en-SG")}</div>${rows}
    <script>window.onload = () => window.print()<\/script>
    </body></html>`);
    w.document.close();
  }

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
                    {renderBilingual(m.content)}
                  </button>
                  {/* Player row under the balloon: ▶ + 🐌 when idle; ⏸/▶, ⏹
                      and a seek slider while THIS balloon is being read. */}
                  <div className="mt-0.5 flex w-full max-w-[85%] items-center gap-1">
                    {playingIdx === i ? (
                      <>
                        {/* Traffic-light player (Dan, 2026-07-13): resume ▶ green,
                            pause ⏸ blue (yellow belongs to the snail), stop ⏹ red. */}
                        <button type="button" onClick={togglePause}
                          className={`rounded-lg border px-2 py-0.5 text-xs font-bold text-white ${paused ? "border-[#3f9c17] bg-[#58cc02]" : "border-[#1899d6] bg-[#1cb0f6]"}`}>
                          {paused ? "▶" : "⏸"}
                        </button>
                        <button type="button" onClick={stopPlayback}
                          className="rounded-lg border border-[#d33131] bg-[#ff4b4b] px-2 py-0.5 text-xs font-bold text-white">
                          ⏹
                        </button>
                        <input
                          type="range" min={0} max={1000} value={Math.round(progress * 1000)}
                          onChange={(e) => { const f = Number(e.target.value) / 1000; setProgress(f); playerRef.current?.seek(f); }}
                          aria-label="Position dans la lecture"
                          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[#0b63c4]"
                        />
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => playMsg(i, m.content)} title="Écouter"
                          className="rounded-lg border border-[#3f9c17] bg-[#58cc02] px-2 py-0.5 text-xs font-bold text-white">
                          ▶
                        </button>
                        <button type="button" onClick={() => playMsg(i, m.content, 0.6)} title="Lecture lente"
                          className="rounded-lg border border-[#e08600] bg-[#ffc800] px-2 py-0.5 text-xs font-bold text-[#5a3a08]">
                          🐌
                        </button>
                      </>
                    )}
                    {/* Latest finished tutor reply only; vanishes the moment a
                        new input is sent (the last message becomes the user's). */}
                    {m.role === "assistant" && i === messages.length - 1 && i > 0 && !busy && (
                      <button type="button" onClick={savePdf}
                        className="ml-auto rounded-lg border border-[color:var(--cahier-rule)] bg-white px-2 py-0.5 text-xs font-bold text-[color:var(--cahier-ink)]">
                        💾 Save as PDF
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
                placeholder="Type something. Press Enter to send, or Shift-Enter for line-break"
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
