"use client";

/**
 * 🔊 Le Studio TTS (Dan, 2026-07-08: "add a TTS — do something similar to
 * tts.withdrchan.com"; 2026-07-10: French only, no language dropdown, speed
 * as a ×1.0/×0.75/×0.5/×1.25/×1.5 toggle, compact control row of
 * Voice · Speed · Play · (Stop only while playing), and a drag bar to
 * rewind/forward within the sound).
 *
 * Deliberately uses speechSynthesis directly: on a page whose whole point is
 * speaking, the global 🔇 shouldn't silently swallow the play button.
 *
 * The drag bar: speechSynthesis has NO native timeline, so seeking is done
 * honestly — progress is tracked from word-boundary events, and dragging
 * restarts speech from the nearest word at the chosen position. On engines
 * that don't fire boundary events (some iOS voices) the bar won't advance on
 * its own, but dragging still jumps correctly. The 🎧 MP3 studio below
 * (Google Cloud TTS behind GOOGLE_TTS_API_KEY) gives a true native player.
 */
import { useEffect, useRef, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

const SAMPLE = "Bonjour ! Je m'apprête à parler français.";
const SPEEDS = [1, 0.75, 0.5, 1.25, 1.5];

export default function TtsPage() {
  const [text, setText] = useState(SAMPLE);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [speed, setSpeed] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1, in characters spoken
  // MP3 studio: last generated clip (blob URL), busy flag, backend presence.
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [mp3Busy, setMp3Busy] = useState(false);
  const [mp3Voice, setMp3Voice] = useState<"f" | "m">("f");
  const [mp3Off, setMp3Off] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  // Monotonic run id: cancel() fires the old utterance's onend on some
  // engines AFTER the replacement started — stale handlers must not touch state.
  const runRef = useRef(0);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const refresh = () => {
      const fr = synth.getVoices().filter((v) => v.lang.startsWith("fr"));
      setVoices(fr);
      setVoiceURI((cur) => (fr.some((v) => v.voiceURI === cur) ? cur : fr[0]?.voiceURI ?? ""));
    };
    refresh();
    synth.addEventListener("voiceschanged", refresh);
    return () => synth.removeEventListener("voiceschanged", refresh);
  }, []);

  // Revoke the previous clip's blob URL when a new one replaces it.
  useEffect(() => () => { if (mp3Url) URL.revokeObjectURL(mp3Url); }, [mp3Url]);

  /** Speak from character `idx` of the current text at rate `r`. */
  function speakFrom(idx: number, r = speed) {
    const synth = window.speechSynthesis;
    const t = text;
    const sub = t.slice(idx);
    if (!synth || !sub.trim()) return;
    const run = ++runRef.current;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(sub);
    u.lang = "fr-FR";
    const v = voices.find((x) => x.voiceURI === voiceURI);
    if (v) u.voice = v;
    u.rate = r;
    u.onboundary = (e) => {
      if (runRef.current === run && typeof e.charIndex === "number") {
        setProgress(Math.min(1, (idx + e.charIndex) / Math.max(1, t.length)));
      }
    };
    u.onend = () => {
      if (runRef.current === run) { setSpeaking(false); setProgress(0); }
    };
    u.onerror = () => {
      if (runRef.current === run) { setSpeaking(false); setProgress(0); }
    };
    setSpeaking(true);
    synth.speak(u);
  }

  function play() {
    setProgress(0);
    speakFrom(0);
  }

  function stop() {
    runRef.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setProgress(0);
  }

  /** Drag bar → jump to the nearest word start at that fraction of the text. */
  function seek(frac: number) {
    if (!speaking) return;
    const t = text;
    let idx = Math.max(0, Math.min(t.length - 1, Math.floor(frac * t.length)));
    while (idx > 0 && !/\s/.test(t[idx - 1])) idx--;
    setProgress(idx / Math.max(1, t.length));
    speakFrom(idx);
  }

  /** ×1.0 → ×0.75 → ×0.5 → ×1.25 → ×1.5 →. Mid-speech, re-speak from here. */
  function cycleSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (speaking) {
      const t = text;
      let idx = Math.floor(progress * t.length);
      while (idx > 0 && !/\s/.test(t[idx - 1])) idx--;
      speakFrom(idx, next);
    }
  }

  async function makeMp3() {
    const t = text.trim();
    if (!t || mp3Busy) return;
    setMp3Busy(true);
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t, voice: `fr-${mp3Voice}`, rate: speed }),
      });
      if ([503, 404, 405, 501].includes(r.status)) { setMp3Off(true); return; }
      if (!r.ok) return;
      const blob = await r.blob();
      setMp3Url((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
    } catch {
      // network hiccup — leave the previous clip (if any) in place
    } finally {
      setMp3Busy(false);
    }
  }

  const grow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  };

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="tts" crumb="🔊 TTS">
      <div className="mx-auto max-w-2xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🔊 Le Studio TTS
        </h1>

        <textarea
          ref={taRef}
          lang="fr"
          value={text}
          onChange={(e) => { setText(e.target.value); grow(); }}
          rows={4}
          placeholder="Écrivez votre texte ici…"
          autoComplete="off" autoCorrect="off" spellCheck={false}
          className="mt-3 w-full resize-y rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white p-4 text-lg text-[color:var(--cahier-ink)] outline-none focus:border-[color:var(--cahier-le)]"
        />

        {/* Voice · Speed · Play · (Stop while playing) — one compact row. */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <select
            value={voiceURI}
            onChange={(e) => setVoiceURI(e.target.value)}
            aria-label="Voix"
            title="Voix"
            className="cahier-btn cahier-btn-sm max-w-[11rem] !px-2"
          >
            {voices.length === 0 && <option value="">(voix française)</option>}
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
            ))}
          </select>
          <button type="button" onClick={cycleSpeed}
            title="Vitesse de lecture" aria-label={`Vitesse ×${speed}`}
            className="cahier-btn cahier-btn-sm font-black tabular-nums">
            🗣 ×{speed.toFixed(2).replace(/0+$/, "").replace(/\.$/, ".0")}
          </button>
          <button type="button" onClick={play} disabled={!text.trim()}
            className="cahier-btn cahier-btn-sm cahier-btn-primary font-black disabled:opacity-50">
            ▶ Écouter
          </button>
          {speaking && (
            <button type="button" onClick={stop} className="cahier-btn cahier-btn-sm">
              ⏹ Stop
            </button>
          )}
        </div>

        {/* Rewind / forward by dragging, start → end of the sound. */}
        {speaking && (
          <input
            type="range" min={0} max={1000} value={Math.round(progress * 1000)}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            aria-label="Position dans la lecture"
            className="mt-2 w-full cursor-pointer accent-[color:var(--cahier-le,#1cb0f6)]"
          />
        )}

        {/* 🎧 MP3 — a REAL audio file: native player (play/pause/drag) + download.
            Hidden where /api/tts isn't wired up. */}
        {!mp3Off && (
          <div className="mt-8 rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
            <h2 className="text-lg font-black text-[color:var(--cahier-ink)]">🎧 Studio MP3</h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <select
                value={mp3Voice}
                onChange={(e) => setMp3Voice(e.target.value as "f" | "m")}
                aria-label="Voix MP3"
                className="cahier-btn cahier-btn-sm !px-2"
              >
                <option value="f">👩 Voix A</option>
                <option value="m">👨 Voix B</option>
              </select>
              <button type="button" onClick={() => void makeMp3()} disabled={!text.trim() || mp3Busy}
                className="cahier-btn cahier-btn-sm cahier-btn-accent font-black disabled:opacity-50">
                {mp3Busy ? "⏳ Génération…" : "🎧 Générer le MP3"}
              </button>
              {mp3Url && (
                <a href={mp3Url} download="fluolingo-tts.mp3" className="cahier-btn cahier-btn-sm">
                  ⬇ Télécharger
                </a>
              )}
            </div>
            {mp3Url && (
              <audio controls src={mp3Url} className="mt-3 w-full" />
            )}
          </div>
        )}
      </div>
    </CahierShell>
  );
}
