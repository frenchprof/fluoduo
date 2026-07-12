"use client";

/**
 * 🔊 Le Studio TTS (Dan, 2026-07-08: "add a TTS"; 2026-07-10: French only,
 * minimalist — ONE voice paradigm for both listening and MP3 (the site's
 * 👩/👨 cast, toggled with a single button), speed as a ×1.0 → ×0.75 → ×0.5
 * → ×1.25 → ×1.5 toggle, one compact row: Voix · vitesse · ▶ Écouter ·
 * (⏹ while playing) · 🎧 Générer le MP3 — no headings, no blurbs.
 *
 * Deliberately uses speechSynthesis directly for ▶ (the global 🔇 shouldn't
 * swallow a page whose whole point is speaking), but through the SAME cast
 * voices (castVoice) as the rest of the site.
 *
 * The drag bar: speechSynthesis has NO native timeline, so progress is
 * tracked from word-boundary events and dragging restarts speech from the
 * nearest word. The generated MP3 gets a native <audio> player instead —
 * true seek — plus a download link. The 🎧 button hides itself on hosts
 * where /api/tts isn't wired up (no GOOGLE_TTS_API_KEY).
 */
import { useEffect, useRef, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { castVoice } from "@/games/letris/speech";

const SAMPLE = "Utilisez-moi pour vérifier la prononciation d'un mot, d'une expression, ou d'un texte entier !";
const SPEEDS = [1, 0.75, 0.5, 1.25, 1.5];

/** Word-level LCS diff for the tracked-changes view (Dan, 2026-07-10:
 *  "glaring errors must be flagged out to the learner"). */
type DiffChunk = { t: string; k: "same" | "del" | "ins" };
function diffWords(a: string, b: string): DiffChunk[] {
  const A = a.split(/\s+/).filter(Boolean);
  const B = b.split(/\s+/).filter(Boolean);
  const m = A.length, n = B.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffChunk[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) { out.push({ t: A[i], k: "same" }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: A[i], k: "del" }); i++; }
    else { out.push({ t: B[j], k: "ins" }); j++; }
  }
  while (i < m) out.push({ t: A[i++], k: "del" });
  while (j < n) out.push({ t: B[j++], k: "ins" });
  return out;
}

export default function TtsPage() {
  const [text, setText] = useState(SAMPLE);
  const [voiceSel, setVoiceSel] = useState<"f" | "m">("f");
  const [speed, setSpeed] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1, in characters spoken
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [mp3Busy, setMp3Busy] = useState(false);
  const [mp3Off, setMp3Off] = useState(false);
  // Tracked-changes proofread: corrected text (null = none yet).
  const [fix, setFix] = useState<string | null>(null);
  const [fixBusy, setFixBusy] = useState(false);
  const [fixErr, setFixErr] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  // Monotonic run id: cancel() fires the old utterance's onend on some
  // engines AFTER the replacement started — stale handlers must not touch state.
  const runRef = useRef(0);

  // Revoke the previous clip's blob URL when a new one replaces it.
  useEffect(() => () => { if (mp3Url) URL.revokeObjectURL(mp3Url); }, [mp3Url]);

  /** Speak from character `idx` of the current text at rate `r`. */
  function speakFrom(idx: number, r = speed, profile = voiceSel) {
    const synth = window.speechSynthesis;
    const t = text;
    const sub = t.slice(idx);
    if (!synth || !sub.trim()) return;
    const run = ++runRef.current;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(sub);
    u.lang = "fr-FR";
    const v = castVoice("fr-FR", profile);
    if (v) u.voice = v;
    u.rate = r * 0.95;
    // The male cast member on devices without a named male voice = pitch cue.
    u.pitch = profile === "m" ? 0.75 : 1;
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

  /** Nearest word start at `frac` of the text. */
  function wordIdx(frac: number): number {
    const t = text;
    let idx = Math.max(0, Math.min(t.length - 1, Math.floor(frac * t.length)));
    while (idx > 0 && !/\s/.test(t[idx - 1])) idx--;
    return idx;
  }

  /** Drag bar → jump to that point of the sound. */
  function seek(frac: number) {
    if (!speaking) return;
    const idx = wordIdx(frac);
    setProgress(idx / Math.max(1, text.length));
    speakFrom(idx);
  }

  /** ×1.0 → ×0.75 → ×0.5 → ×1.25 → ×1.5 →. Mid-speech, re-speak from here. */
  function cycleSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (speaking) speakFrom(wordIdx(progress), next);
  }

  /** 👩 ↔ 👨 — the same two-voice cast the whole site uses. */
  function toggleVoice() {
    const next = voiceSel === "f" ? "m" : "f";
    setVoiceSel(next);
    if (speaking) speakFrom(wordIdx(progress), speed, next);
  }

  async function makeMp3() {
    const t = text.trim();
    if (!t || mp3Busy) return;
    setMp3Busy(true);
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t, voice: `fr-${voiceSel}`, rate: speed }),
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

  async function corriger() {
    const t = text.trim();
    if (!t || fixBusy) return;
    setFixBusy(true);
    setFix(null);
    setFixErr(null);
    try {
      const r = await fetch("/api/correct", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      // NEVER fail silently (Dan, 2026-07-10: "the corriger button is not
      // doing any work") — name the failure so it can be diagnosed.
      if ([503, 404, 405, 501].includes(r.status)) {
        setFixErr("✏️ pas encore branché ici (clé API absente ou déploiement en cours)");
        return;
      }
      const data = (await r.json().catch(() => null)) as { corrected?: string } | null;
      if (r.ok && data?.corrected) setFix(data.corrected);
      else setFixErr("⚠️ correction indisponible — réessayez dans un instant");
    } catch {
      setFixErr("⚠️ pas de connexion — réessayez");
    } finally {
      setFixBusy(false);
    }
  }

  const grow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  };

  const fixClean = fix !== null && fix.replace(/\s+/g, " ").trim() === text.replace(/\s+/g, " ").trim();

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

        {/* ONE compact row, one voice paradigm: 👩/👨 cast toggle drives both
            the ▶ listen and the 🎧 MP3. */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={toggleVoice} title="Voix" aria-label={voiceSel === "f" ? "Voix femme" : "Voix homme"}
            className="cahier-btn cahier-btn-sm">
            {voiceSel === "f" ? "👩" : "👨"}
          </button>
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
          {!mp3Off && (
            <button type="button" onClick={() => void makeMp3()} disabled={!text.trim() || mp3Busy}
              className="cahier-btn cahier-btn-sm cahier-btn-accent font-black disabled:opacity-50">
              {mp3Busy ? "⏳…" : "🎧 Générer le MP3"}
            </button>
          )}
          <button type="button" onClick={() => void corriger()} disabled={!text.trim() || fixBusy}
            title="Vérifier et corriger le français"
            className="cahier-btn cahier-btn-sm font-black disabled:opacity-50">
            {fixBusy ? "⏳…" : "✏️ Corriger"}
          </button>
        </div>

        {fixErr && <p className="mt-2 text-sm font-bold text-rose-700">{fixErr}</p>}

        {/* Tracked-changes proofread: deletions struck through, insertions
            underlined. Display-only (never TTS'd — fragments aren't speech);
            « Adopter » swaps the clean version into the box to be heard. */}
        {fix !== null && (
          fixClean ? (
            <p className="mt-2 text-sm font-bold text-[#2e7d00]">✓ Aucune erreur !</p>
          ) : (
            <div className="mt-2 rounded-xl border-2 border-dashed border-[color:var(--cahier-rule)] bg-white p-3">
              <p lang="fr" className="text-lg leading-relaxed">
                {diffWords(text, fix).map((c, i) => (
                  <span
                    key={i}
                    className={
                      c.k === "del" ? "text-rose-600 line-through decoration-2"
                      : c.k === "ins" ? "font-bold text-[#2e7d00] underline decoration-2"
                      : undefined
                    }
                  >
                    {c.t}{" "}
                  </span>
                ))}
              </p>
              <div className="mt-2 flex gap-1.5">
                <button type="button" onClick={() => { setText(fix); setFix(null); }}
                  className="cahier-btn cahier-btn-sm cahier-btn-primary font-black">
                  ✓ Adopter
                </button>
                <button type="button" onClick={() => setFix(null)} className="cahier-btn cahier-btn-sm">
                  ✕
                </button>
              </div>
            </div>
          )
        )}

        {/* Rewind / forward by dragging, start → end of the sound. */}
        {speaking && (
          <input
            type="range" min={0} max={1000} value={Math.round(progress * 1000)}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            aria-label="Position dans la lecture"
            className="mt-2 w-full cursor-pointer accent-[color:var(--cahier-le,#1cb0f6)]"
          />
        )}

        {/* The generated clip: native player (true drag-to-seek) + download. */}
        {mp3Url && (
          <div className="mt-3 flex items-center gap-1.5">
            <audio controls src={mp3Url} className="min-w-0 flex-1" />
            <a href={mp3Url} download="fluolingo-tts.mp3" title="Télécharger" className="cahier-btn cahier-btn-sm">
              ⬇
            </a>
          </div>
        )}
      </div>
    </CahierShell>
  );
}
