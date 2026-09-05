"use client";

/**
 * 🤖 ChaTutor — the chat panel, extracted from src/app/tutor/page.tsx (5 Sep,
 * AMBIENT TOOLS) so the same panel can live in two places:
 *
 *   · the standalone /tutor page (no props) — behaviour unchanged;
 *   · the in-exercise 🧰 card, where the trainer hands over `context` (which
 *     activity, which item) so "why is this wrong?" works without retyping.
 *     The context shows as a small yellow chip over the conversation and is
 *     prepended to what /api/tutor reads.
 *
 * Backend: /api/tutor, a Cloudflare Pages Function (see functions/api/tutor.js
 * for the prompt and the MISTRAL_API_KEY setup). Until the key is configured —
 * and on any non-Cloudflare preview, where /api/tutor 404s — the panel
 * degrades to a friendly "not wired up yet" card instead of a broken chat.
 */
import { useEffect, useRef, useState } from "react";
import { pauseSpeech, resumeSpeech, isSpeechPaused, guessLang, type MixedPlayback } from "@/games/letris/speech";
// Balloons read with the Google Neural2 cast (browser voices as automatic
// fallback) so the tutor sounds identical on every device (Dan, 2026-07-18).
import { speakMixedCloud as speakMixed, stopCloudVoice } from "@/lib/cloudVoice";
import { logEvent } from "@/lib/firebase/usage";
import type { ReactNode } from "react";

/** What the summoning exercise knows — shown as the chip, told to the tutor.
 *  (`title`, not `activity`: an `activity:` literal reads as an evidence tag
 *  to verify53, and this context never touches the mastery model.) */
export type TutorContext = {
  /** The activity's learner-visible name, e.g. "ÉcouTexte". */
  title: string;
  /** The item or sentence the learner is on, when the trainer knows it. */
  item?: string;
};

type ChatMsg = { role: "user" | "assistant"; content: string };

// Dan, 5 Sep: "The ChaTutor's opening line is WAY TOO LONG !" — the 50-word
// capability tour failed his litmus test (the input box already invites
// typing, and the 🧰 chip already says where you are). The greeting greets.
const GREETING = "Bonjour ! 👋 « Je peux t'aider ? »";

// Minimal typings for the (still-prefixed) Web Speech recognition API.
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
function getRecognizer(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

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
    for (const part of t.split(/(\*\*[^*]+\*\*|~~[^~]+~~)/g)) {
      if (!part) continue;
      if (part.startsWith("**") && part.endsWith("**")) {
        nodes.push(<strong key={key++}>{langSpans(part.slice(2, -2))}</strong>);
      } else if (part.startsWith("~~") && part.endsWith("~~")) {
        // Word tracked-changes look: the learner's wrong words struck
        // through in red; never spoken (speech strips these spans).
        nodes.push(<span key={key++} className="text-rose-600 line-through decoration-2">{part.slice(2, -2)}</span>);
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
  el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
}

export default function ChaTutorPanel({ context }: { context?: TutorContext }) {
  const placeholder = "";
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Auto-speak toggle (Dan, 2026-07-27: option to NOT verbalise every line).
  const [autoSpeak, setAutoSpeak] = useState(true);
  // Deliberate: the saved toggle lives in localStorage, which cannot be read
  // during render (the site is statically exported) — this effect seeds it.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { try { setAutoSpeak(localStorage.getItem("fl.tutor.autoSpeak") !== "off"); } catch {} }, []);
  const [offline, setOffline] = useState(false);
  // Per-balloon player (Dan, 2026-07-12: "play, pause and stop buttons next
  // to or below each balloon"): which bubble is being read, and paused state.
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<MixedPlayback | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  // 🎤 speak-to-fill (Dan, 2026-07-13: "a STT engine that fills up the speech
  // balloons by talking instead of by typing"). Browser SpeechRecognition,
  // fr-FR: the pedagogical point is producing FRENCH speech. Hidden where
  // the API doesn't exist (Firefox).
  const [recording, setRecording] = useState<"fr-FR" | "en-US" | null>(null);
  const [sttAvailable, setSttAvailable] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // Deliberate: SpeechRecognition is a browser API — probing it during
  // render would break SSR/hydration, so availability is seeded on mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSttAvailable(getRecognizer() !== null); }, []);

  /** One mic per language (Dan, 2026-07-13: "separate STT buttons for
   *  English and for French") — tapping the active mic stops; tapping the
   *  other switches language for the next utterance. */
  function toggleMic(lang: "fr-FR" | "en-US") {
    if (recording) {
      recRef.current?.stop();
      if (recording === lang) return; // same mic: just stop
    }
    const rec = getRecognizer();
    if (!rec) return;
    window.speechSynthesis?.cancel(); // don't transcribe our own TTS
    stopCloudVoice();
    const base = input.trim();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false; // one utterance; stops at the natural pause
    rec.onresult = (e) => {
      const heard = Array.from({ length: e.results.length }, (_, k) => e.results[k][0]?.transcript ?? "").join("");
      setInput(base ? `${base} ${heard}` : heard);
    };
    rec.onend = () => { setRecording(null); recRef.current = null; taRef.current?.focus(); };
    rec.onerror = () => { setRecording(null); recRef.current = null; };
    recRef.current = rec;
    setRecording(lang);
    rec.start();
  }

  function playMsg(i: number, content: string, rate?: number) {
    playerRef.current?.stop();
    setPaused(false);
    setProgress(0);
    const player = speakMixed(content, {
      // Faster default (Dan, 2026-07-27: "too slow"); the 🐌 button still passes 0.6.
      rate: rate ?? 1.15,
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
  // Leaving the panel mid-read must not leave the voice running.
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
        .replace(/~~([^~]+)~~/g, '<span style="color:#dc2626;text-decoration:line-through">$1</span>')
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/^\s{0,3}#{1,4}\s+(.*)$/gm, "<b>$1</b>")
        .replace(/\n/g, "<br>");
    const rows = messages
      .map((m) => `<div class="${m.role}"><b class="who">${m.role === "user" ? "Vous" : "ChaTutor"}</b><p>${fmt(m.content)}</p></div>`)
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ChaTutor · FluOLinGo</title><style>
      body{font-family:Georgia,serif;max-width:640px;margin:24px auto;color:#222850}
      h1{font-size:18px;margin:0 0 2px}
      .meta{color:#666;font-size:12px;margin-bottom:16px}
      .user,.assistant{margin:10px 0;padding:10px 14px;border-radius:12px;border:1px solid #ccc}
      .user{background:#fdf6c8}
      .assistant{background:#fff}
      .who{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#666}
      p{margin:4px 0 0;font-size:14px;line-height:1.5}
    </style></head><body>
    <h1>🤖 ChaTutor · FluOLinGo</h1><div class="meta">${new Date().toLocaleString("en-SG")}</div>${rows}
    <script>window.onload = () => window.print()<\/script>
    </body></html>`);
    w.document.close();
  }

  /** Save, then close the session: the conversation resets to the greeting
   *  (Dan, 2026-07-13: "Save as PDF ... & End Session"). */
  function savePdfAndEnd() {
    savePdf();
    stopPlayback();
    setMessages([{ role: "assistant", content: GREETING }]);
    setInput("");
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
    // Recorded WITH the text (Dan, 2026-07-13: "message content recorded")
    // so the dashboard can show what learners actually practise; capped at
    // 500 chars to stay well inside the events document budget.
    void logEvent("tutor.message", { chars: text.length, text: text.slice(0, 500) });
    const next: ChatMsg[] = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    // The hand-off (5 Sep): the summoning exercise's context leads the
    // conversation the tutor reads, so "why is this wrong?" needs no retyping.
    // The chip above the balloons shows the learner the same line.
    const contextMsgs: ChatMsg[] = context
      ? [{
          role: "user" as const,
          content: `Context: I am inside the "${context.title}" exercise${
            context.item ? `, working on « ${context.item} »` : ""
          }. My questions are about this exercise.`,
        }]
      : [];
    try {
      const r = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // The greeting is UI furniture, not conversation — don't send it.
        body: JSON.stringify({ messages: [...contextMsgs, ...next.slice(1)] }),
      });
      // No backend here: 503 = function deployed but no API key yet; the
      // rest = hosts without Pages Functions at all (local preview etc.).
      if ([503, 404, 405, 501].includes(r.status)) {
        setOffline(true);
        return;
      }
      const data = await r.json().catch(() => null);
      if (!r.ok || !data?.reply) {
        setMessages((m) => [...m, { role: "assistant", content: "Oops — I hit a technical problem. Try again!" }]);
        return;
      }
      setMessages((m) => {
        const next = [...m, { role: "assistant" as const, content: data.reply }];
        // AUTO-SPEAK (Dan, 2026-07-25: "the chatbot does not automatically
        // speak") — the reply voices itself on arrival unless the learner
        // turned the 🔊 toggle off (persisted per device).
        try {
          if (autoSpeak) {
            setTimeout(() => playMsg(next.length - 1, data.reply), 250);
          }
        } catch {}
        return next;
      });
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Oops — I hit a technical problem. Try again!" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
        {context && (
          /* The context chip — what this chat already knows. Yellow, like the
             learner's own balloons: it stands in for what they'd have typed. */
          <p className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full border-2 border-[color:var(--cahier-hl-edge)] bg-[color:var(--cahier-hl)] px-3 py-1 text-xs font-bold text-[color:var(--cahier-ink)]">
            <span aria-hidden>🧰</span>
            <span className="truncate">
              {context.title}
              {context.item && <> · <span lang="fr">« {context.item} »</span></>}
            </span>
          </p>
        )}
        {offline ? (
          <div className="rounded-2xl border-2 border-dashed border-[color:var(--cahier-ink)]/40 bg-white p-5">
            <p className="text-sm font-bold text-[color:var(--cahier-ink)]">
              The tutor isn&rsquo;t connected here yet. 🔌
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
                height instead of a stingy 55vh (Dan, 2026-07-12). Inside the
                🧰 card the box shrinks so the input stays on the sheet. */}
            <div
              className={`flex flex-col gap-2.5 overflow-y-auto rounded-2xl border-2 border-[#a8cdf0] p-4 shadow-inner ${
                context ? "max-h-[30dvh] min-h-[9rem]" : "max-h-[calc(100dvh-16rem)] min-h-[16rem]"
              }`}
              style={{ background: "linear-gradient(180deg,#eef7ff 0%,#fdf9f0 100%)" }}
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  {/* A DIV, not a button (Dan, 2026-07-27): buttons make their
                      text unselectable — learners could not copy the French.
                      Tap-to-listen moves to the 🔊 control in the row below. */}
                  <div
                    className={`max-w-[85%] cursor-text select-text whitespace-pre-wrap rounded-2xl border-2 px-4 py-2 text-left text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-sm border-[#e0b400] text-[color:var(--cahier-ink)]"
                        : "rounded-bl-sm border-[#a8cdf0] text-[color:var(--cahier-ink)]"
                    }`}
                    style={m.role === "user"
                      ? { background: "linear-gradient(180deg,#fff8c4,#ffec80)" }
                      : { background: "linear-gradient(180deg,#ffffff,#f2f8ff)" }}
                  >
                    {m.role === "assistant" && <span className="mr-1.5" aria-hidden>🤖</span>}
                    {renderBilingual(m.content)}
                  </div>
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
                        <button type="button" onClick={() => playMsg(i, m.content)} title="Listen"
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
                      <button type="button" onClick={savePdfAndEnd}
                        className="ml-auto rounded-lg border border-[color:var(--cahier-rule)] bg-white px-2 py-0.5 text-xs font-bold text-[color:var(--cahier-ink)]">
                        💾 Save as PDF &amp; End Session
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

            {/* STACKED input (Dan, 2026-07-13: "way too small on mobile"):
                the textarea gets the FULL width on its own line and auto-grows
                as you type (drag-resize doesn't exist on touch); the buttons
                live on their own row beneath. */}
            <form
              onSubmit={(e) => { e.preventDefault(); void send(); }}
              className="flex flex-col gap-2"
            >
              <textarea
                lang="fr"
                ref={taRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoGrow(e.target); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                placeholder={placeholder}
                rows={2}
                /* NB: not .cahier-answer — that pins height:30px!important, which
                   would kill grow/resize. AccentBar still shows via lang="fr". */
                className={`max-h-[320px] w-full resize-y rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-[0.95rem] leading-snug text-[color:var(--cahier-ink)] outline-none focus:border-[color:var(--cahier-le)] ${
                  context ? "min-h-[3rem]" : "min-h-[4.5rem]"
                }`}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              <div className="flex items-center justify-end gap-1.5">
              {sttAvailable && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleMic("fr-FR")}
                    title={recording === "fr-FR" ? "Stop dictation" : "Dictate in French"}
                    aria-pressed={recording === "fr-FR"}
                    className={`cahier-btn font-black ${recording === "fr-FR" ? "!border-[#d33131] !bg-[#ff4b4b] !text-white animate-pulse" : ""}`}
                  >
                    🎤🇫🇷
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMic("en-US")}
                    title={recording === "en-US" ? "Stop dictating" : "Dictate in English"}
                    aria-pressed={recording === "en-US"}
                    className={`cahier-btn font-black ${recording === "en-US" ? "!border-[#d33131] !bg-[#ff4b4b] !text-white animate-pulse" : ""}`}
                  >
                    🎤🇬🇧
                  </button>
                  {/* Auto-speak on/off (Dan, 2026-07-27) — 🔊 speaks each reply
                      as it arrives; 🔇 stays silent (play buttons still work). */}
                  <button
                    type="button"
                    onClick={() => { const v = !autoSpeak; setAutoSpeak(v); try { localStorage.setItem("fl.tutor.autoSpeak", v ? "on" : "off"); } catch {}; if (!v) playerRef.current?.stop(); }}
                    title={autoSpeak ? "Replies speak automatically — tap to silence" : "Replies stay silent — tap to auto-speak"}
                    aria-pressed={autoSpeak}
                    className={`cahier-btn font-black ${autoSpeak ? "" : "opacity-60"}`}
                  >
                    {autoSpeak ? "🔊" : "🔇"}
                  </button>
                </>
              )}
              <button type="submit" disabled={busy || !input.trim()} className="cahier-btn cahier-btn-accent font-black disabled:opacity-40">
                Send
              </button>
              </div>
            </form>
          </>
        )}
    </>
  );
}
