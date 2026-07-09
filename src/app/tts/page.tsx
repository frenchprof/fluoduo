"use client";

/**
 * 🔊 Le Studio TTS (Dan, 2026-07-08: "add a TTS — do something similar to
 * tts.withdrchan.com"). Type anything, pick a voice and a speed, listen.
 * The textarea is lang="fr", so the global accent bar docks under it; the
 * voice list refreshes per language (French / English). Deliberately uses
 * speechSynthesis directly: on a page whose whole point is speaking, the
 * global 🔇 shouldn't silently swallow the play button.
 */
import { useEffect, useRef, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

const SAMPLE = "Bonjour ! Je m'apprête à parler français.";

export default function TtsPage() {
  const [text, setText] = useState(SAMPLE);
  const [lang, setLang] = useState<"fr-FR" | "en-US">("fr-FR");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(0.95);
  const [speaking, setSpeaking] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const refresh = () => {
      const inLang = synth.getVoices().filter((v) => v.lang.startsWith(lang.split("-")[0]));
      setVoices(inLang);
      setVoiceURI((cur) => (inLang.some((v) => v.voiceURI === cur) ? cur : inLang[0]?.voiceURI ?? ""));
    };
    refresh();
    synth.addEventListener("voiceschanged", refresh);
    return () => synth.removeEventListener("voiceschanged", refresh);
  }, [lang]);

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function play(r = rate) {
    const synth = window.speechSynthesis;
    const t = text.trim();
    if (!synth || !t) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang;
    const v = voices.find((x) => x.voiceURI === voiceURI);
    if (v) u.voice = v;
    u.rate = r;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
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
          🔊 Le Studio TTS <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· Text-to-speech</span>
        </h1>
        <p className="mt-1 mb-4 text-sm text-[color:var(--cahier-ink-soft)]">
          Type anything — hear it spoken. Great for checking your own sentences before class.
        </p>

        <textarea
          ref={taRef}
          lang={lang === "fr-FR" ? "fr" : "en"}
          value={text}
          onChange={(e) => { setText(e.target.value); grow(); }}
          rows={4}
          placeholder="Écrivez votre texte ici…"
          autoComplete="off" autoCorrect="off" spellCheck={false}
          className="w-full resize-y rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white p-4 text-lg text-[color:var(--cahier-ink)] outline-none focus:border-[color:var(--cahier-le)]"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "fr-FR" | "en-US")}
            aria-label="Langue"
            className="cahier-btn cahier-btn-sm !px-2"
          >
            <option value="fr-FR">🇫🇷 Français</option>
            <option value="en-US">🇬🇧 English</option>
          </select>
          <select
            value={voiceURI}
            onChange={(e) => setVoiceURI(e.target.value)}
            aria-label="Voix"
            className="cahier-btn cahier-btn-sm max-w-[14rem] !px-2"
          >
            {voices.length === 0 && <option value="">(default voice)</option>}
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-sm font-bold text-[color:var(--cahier-ink)]">
            🚶
            <input
              type="range" min={0.5} max={1.4} step={0.05} value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              aria-label="Vitesse"
            />
            🏃
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => play()} disabled={!text.trim()}
            className="cahier-btn cahier-btn-primary disabled:opacity-50">
            ▶ Écouter
          </button>
          <button type="button" onClick={() => play(0.6)} disabled={!text.trim()}
            title="Lecture lente" className="cahier-btn disabled:opacity-50">
            🐌 Lentement
          </button>
          {speaking && (
            <button type="button" onClick={stop} className="cahier-btn">
              ⏹ Stop
            </button>
          )}
        </div>
      </div>
    </CahierShell>
  );
}
