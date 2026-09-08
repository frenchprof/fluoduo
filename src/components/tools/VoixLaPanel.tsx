"use client";

/**
 * 🔊 VoixLà — the voice panel, extracted from src/app/tts/page.tsx (5 Sep,
 * AMBIENT TOOLS) so the same panel can live in two places:
 *
 *   · the standalone /tts page (no props) — behaviour unchanged;
 *   · the in-exercise 🛠️ card (`correctsFirst` + `initialText`), where the
 *     trainer hands over the learner's current typed French.
 *
 * THE CORRECTS-FIRST RULE (Dan, 2026-09-05): "the bot should not be made to
 * reinforce grammatically bad or wrongly written French to the learner. It
 * has to be corrected first!!" In corrects-first mode the ONLY strings that
 * ever reach the voice are `approved` (a checker result already held) or the
 * `corrected` field of a fresh /api/correct response — never `text` as the
 * learner typed it. When the checker is unreachable, NOTHING is spoken; the
 * page's existing fallback message shows instead. verify100 pins this shape.
 *
 * The page's own history (kept because the code keeps it): one voice cast
 * (👩/👨) for ▶ and 🎧 alike; speed ×1.0 → ×0.75 → ×0.5 → ×1.25 → ×1.5;
 * speechSynthesis used directly for ▶ (the global 🔇 must not swallow a
 * surface whose whole point is speaking); a drag bar tracked from
 * word-boundary events; the 🎧 MP3 with a native player.
 */
import { useEffect, useRef, useState } from "react";
import { castVoice } from "@/games/letris/speech";
import { useAuthUser } from "@/lib/firebase/auth";
import { ADMIN_EMAILS } from "@/app/teacher/data";

// Admin-only A/B: which backend engine renders the MP3 (Dan, 2026-07-18:
// "how do I know how each one sounds"). "auto" = server decides
// (TTS_PROVIDER pin, else Mistral-first). Invisible to students.
const ENGINES = ["auto", "google", "mistral", "openai"] as const;
type Engine = (typeof ENGINES)[number];
const ENGINE_LABEL: Record<Engine, string> = { auto: "Auto", google: "Google", mistral: "Mistral", openai: "OpenAI" };

const SAMPLE = "Utilisez-moi pour vérifier la prononciation d'un mot, d'une expression, ou d'un texte entier !";
const SPEEDS = [1, 0.75, 0.5, 1.25, 1.5];
// Calibration (Dan, 2026-07-20): "the current 0.75 is what we want for our
// 1.0" — displayed speeds keep their labels, but every underlying rate is
// scaled by this constant, for the ▶ player and the generated MP3 alike.
const TTS_CAL = 0.75;

/** Word-level LCS diff for the tracked-changes view (Dan, 2026-07-10:
 *  "glaring errors must be flagged out to the learner"). Case-INsensitive:
 *  this page's output is sound, and capitalisation is inaudible — a
 *  case-only difference is not a correction (Dan, 2026-07-18: the model
 *  wrongly capitalised «singapourien» and it showed as an error). Accents
 *  still count — they change pronunciation. The author's own casing is
 *  kept for matching words. */
const sameWord = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
type DiffChunk = { t: string; k: "same" | "del" | "ins" };
function diffWords(a: string, b: string): DiffChunk[] {
  const A = a.split(/\s+/).filter(Boolean);
  const B = b.split(/\s+/).filter(Boolean);
  const m = A.length, n = B.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = sameWord(A[i], B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffChunk[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (sameWord(A[i], B[j])) { out.push({ t: A[i], k: "same" }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: A[i], k: "del" }); i++; }
    else { out.push({ t: B[j], k: "ins" }); j++; }
  }
  while (i < m) out.push({ t: A[i++], k: "del" });
  while (j < n) out.push({ t: B[j++], k: "ins" });
  return out;
}

export default function VoixLaPanel({
  initialText,
  correctsFirst = false,
}: {
  /** Text handed in by a trainer — the learner's current typed French. */
  initialText?: string;
  /** The 🛠️ card mode: nothing is voiced until /api/correct has vetted it. */
  correctsFirst?: boolean;
}) {
  const [text, setText] = useState(initialText !== undefined ? initialText : SAMPLE);
  const [voiceSel, setVoiceSel] = useState<"f" | "m">("f");
  const [speed, setSpeed] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1, in characters spoken
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [mp3Busy, setMp3Busy] = useState(false);
  const [mp3Err, setMp3Err] = useState<string | null>(null);
  const [engine, setEngine] = useState<Engine>("auto");
  // Which engine actually made the current clip (x-tts-engine response
  // header) — provenance proof, shown to admins under the player.
  const [madeBy, setMadeBy] = useState<string | null>(null);
  const user = useAuthUser();
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);
  // Tracked-changes proofread: corrected text (null = none yet).
  const [fix, setFix] = useState<string | null>(null);
  const [fixBusy, setFixBusy] = useState(false);
  const [fixErr, setFixErr] = useState<string | null>(null);
  // Corrects-first: the checker's corrected sentence for the CURRENT text.
  // Editing the text clears it — a changed sentence has not been checked.
  const [approved, setApproved] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  // Monotonic run id: cancel() fires the old utterance's onend on some
  // engines AFTER the replacement started — stale handlers must not touch state.
  const runRef = useRef(0);
  // The string currently being voiced. ONLY speakText() writes it, so the
  // seek/speed/voice controls can never wander onto unchecked text.
  const spokenRef = useRef("");

  // Revoke the previous clip's blob URL when a new one replaces it.
  useEffect(() => () => { if (mp3Url) URL.revokeObjectURL(mp3Url); }, [mp3Url]);

  // Corrects-first: the handed sentence is checked the moment the card opens,
  // so the corrected line is already leading when the learner looks down.
  useEffect(() => {
    if (correctsFirst && (initialText ?? "").trim()) void corriger();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on open, on the text that was handed over
  }, []);

  // Leaving the panel mid-read must not leave the voice running.
  useEffect(() => () => { runRef.current++; window.speechSynthesis?.cancel(); }, []);

  /** Speak from character `idx` of the CURRENT spoken string at rate `r`. */
  function speakFrom(idx: number, r = speed, profile = voiceSel) {
    const synth = window.speechSynthesis;
    const t = spokenRef.current;
    const sub = t.slice(idx);
    if (!synth || !sub.trim()) return;
    const run = ++runRef.current;
    synth.cancel();
    // cancel() while the queue is paused leaves some engines stuck paused —
    // the 🛠️ card opens with the exercise's speech paused, so unstick first.
    synth.resume();
    const u = new SpeechSynthesisUtterance(sub);
    u.lang = "fr-FR";
    const v = castVoice("fr-FR", profile);
    if (v) u.voice = v;
    u.rate = r * TTS_CAL * 0.95;
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

  /** The ONE entry to the voice. Corrects-first callers may only pass a
   *  checker result (`approved`, or the fresh `corrected` from corriger). */
  function speakText(t: string) {
    spokenRef.current = t;
    setProgress(0);
    speakFrom(0);
  }

  function play() {
    // THE CORRECTS-FIRST RULE (Dan, 2026-09-05): raw handed text is never
    // voiced. Unchecked → check first; the speak happens on the checker's
    // reply, or not at all.
    if (!correctsFirst) { speakText(text); return; }
    if (approved !== null) { speakText(approved); return; }
    void correctThenSpeak();
  }

  /** Corrects-first ▶: run the checker, then voice ONLY its corrected form.
   *  On any failure the fallback message shows and nothing is spoken. */
  async function correctThenSpeak() {
    const corrected = await corriger();
    if (corrected !== null) speakText(corrected);
  }

  function stop() {
    runRef.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setProgress(0);
  }

  /** Nearest word start at `frac` of the spoken string. */
  function wordIdx(frac: number): number {
    const t = spokenRef.current;
    let idx = Math.max(0, Math.min(t.length - 1, Math.floor(frac * t.length)));
    while (idx > 0 && !/\s/.test(t[idx - 1])) idx--;
    return idx;
  }

  /** Drag bar → jump to that point of the sound. */
  function seek(frac: number) {
    if (!speaking) return;
    const idx = wordIdx(frac);
    setProgress(idx / Math.max(1, spokenRef.current.length));
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
    // Corrects-first: the MP3 is a voicing too — only the checked form.
    const t = (correctsFirst ? approved ?? "" : text).trim();
    if (!t || mp3Busy) return;
    setMp3Busy(true);
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: t,
          voice: `fr-${voiceSel}`,
          rate: speed * TTS_CAL,
          ...(isAdmin && engine !== "auto" ? { engine } : {}),
        }),
      });
      // NEVER fail silently (Dan, 2026-07-13: "not generating any mp3 as
      // promised") — the missing Google TTS key is the usual cause.
      if ([503, 404, 405, 501].includes(r.status)) {
        setMp3Err("🎧 not connected yet: the GOOGLE_TTS_API_KEY key is missing on Cloudflare");
        return;
      }
      if (!r.ok) { setMp3Err("⚠️ generation failed — try again in a moment"); return; }
      setMp3Err(null);
      setMadeBy(r.headers.get("x-tts-engine"));
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

  /** Run /api/correct on the box's text. Returns the corrected string, or
   *  null when the checker had no answer (unreachable, error, empty). The
   *  fallback messages are the page's own — inherited, not new. */
  async function corriger(): Promise<string | null> {
    const t = text.trim();
    if (!t || fixBusy) return null;
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
        setFixErr("✏️ not connected here yet (API key missing, or deployment in progress)");
        return null;
      }
      const data = (await r.json().catch(() => null)) as { corrected?: string } | null;
      if (r.ok && data?.corrected) {
        setFix(data.corrected);
        setApproved(data.corrected);
        return data.corrected;
      }
      setFixErr("⚠️ correction unavailable — try again in a moment");
      return null;
    } catch {
      setFixErr("⚠️ no connection — try again");
      return null;
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

  // Case-insensitive: a case-only "correction" counts as no error at all.
  const fixClean = fix !== null &&
    fix.replace(/\s+/g, " ").trim().toLowerCase() === text.replace(/\s+/g, " ").trim().toLowerCase();

  return (
    <div
      className="rounded-2xl border-2 border-[#a8cdf0] p-4 shadow-inner"
      style={{ background: "linear-gradient(180deg,#eef7ff 0%,#fdf9f0 100%)" }}
    >
      <textarea
        ref={taRef}
        lang="fr"
        value={text}
        onChange={(e) => { setText(e.target.value); setApproved(null); grow(); }}
        rows={correctsFirst ? 2 : 4}
        placeholder="Type your text here…"
        autoComplete="off" autoCorrect="off" spellCheck={false}
        className="w-full resize-y rounded-2xl border-2 border-[#a8cdf0] p-4 text-lg text-[color:var(--cahier-ink)] shadow-sm outline-none focus:border-[color:var(--cahier-le)]"
        style={{ background: "linear-gradient(180deg,#ffffff,#f2f8ff)" }}
      />

      {/* ONE compact row, one voice paradigm: 👩/👨 cast toggle drives both
          the ▶ listen and the 🎧 MP3. */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={toggleVoice} title="Voice" aria-label={voiceSel === "f" ? "Female voice" : "Male voice"}
          className="cahier-btn cahier-btn-sm">
          {voiceSel === "f" ? "👩" : "👨"}
        </button>
        <button type="button" onClick={cycleSpeed}
          title="Playback speed" aria-label={`Speed ×${speed}`}
          className="cahier-btn cahier-btn-sm font-black tabular-nums">
          🗣 ×{speed.toFixed(2).replace(/0+$/, "").replace(/\.$/, ".0")}
        </button>
        <button type="button" onClick={play} disabled={!text.trim()}
          className="cahier-btn cahier-btn-sm cahier-btn-primary font-black disabled:opacity-50">
          ▶<span className="hidden sm:inline"> Listen</span>
        </button>
        {speaking && (
          <button type="button" onClick={stop} className="cahier-btn cahier-btn-sm">
            ⏹<span className="hidden sm:inline"> Stop</span>
          </button>
        )}
        <button type="button" onClick={() => void makeMp3()}
          disabled={(correctsFirst ? !(approved ?? "").trim() : !text.trim()) || mp3Busy}
          className="cahier-btn cahier-btn-sm cahier-btn-accent font-black disabled:opacity-50">
          {mp3Busy ? "⏳…" : <>🎧<span className="hidden sm:inline"> Generate the MP3</span></>}
        </button>
        {isAdmin && (
          <button type="button"
            onClick={() => setEngine(ENGINES[(ENGINES.indexOf(engine) + 1) % ENGINES.length])}
            title="MP3 engine (visible to teachers only)"
            className="cahier-btn cahier-btn-sm font-black">
            🎛 {ENGINE_LABEL[engine]}
          </button>
        )}
        <button type="button" onClick={() => void corriger()} disabled={!text.trim() || fixBusy}
          title="Check and correct the French"
          className="cahier-btn cahier-btn-sm font-black disabled:opacity-50">
          {fixBusy ? "⏳…" : <>✏️<span className="hidden sm:inline"> Correct</span></>}
        </button>
      </div>

      {fixErr && <p className="mt-2 text-sm font-bold text-rose-700">{fixErr}</p>}
      {mp3Err && <p className="mt-2 text-sm font-bold text-rose-700">{mp3Err}</p>}

      {/* Tracked-changes proofread: deletions struck through, insertions
          underlined. In corrects-first mode the CORRECTED sentence leads and
          the learner's slip is marked beneath it (Dan, 5 Sep); ▶ voices only
          that corrected line. « Use this » swaps the clean version into the
          box either way. The diff itself is display-only — fragments aren't
          speech. */}
      {fix !== null && (
        fixClean ? (
          <p className="mt-2 text-sm font-bold text-[#2e7d00]">✓ No errors!</p>
        ) : (
          <div className="mt-2 rounded-xl border-2 border-dashed border-[color:var(--cahier-rule)] bg-white p-3">
            {correctsFirst && (
              <p lang="fr" className="text-xl font-bold leading-relaxed text-[color:var(--cahier-ink)]">
                {fix}
              </p>
            )}
            <p lang="fr" className={correctsFirst ? "mt-1.5 text-sm leading-relaxed" : "text-lg leading-relaxed"}>
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
              <button type="button" onClick={() => { setText(fix); setApproved(fix); setFix(null); }}
                className="cahier-btn cahier-btn-sm cahier-btn-primary font-black">
                ✓ Use this
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
          aria-label="Playback position"
          className="mt-2 w-full cursor-pointer accent-[color:var(--cahier-le,#1cb0f6)]"
        />
      )}

      {/* The generated clip: native player (true drag-to-seek) + download. */}
      {mp3Url && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <audio controls src={mp3Url} className="min-w-0 flex-1" />
            <a href={mp3Url} download="fluolingo-tts.mp3" title="Download" className="cahier-btn cahier-btn-sm">
              ⬇
            </a>
          </div>
          {isAdmin && madeBy && (
            <p className="mt-1 text-xs font-bold text-slate-500">🎛 engine: {madeBy}</p>
          )}
        </div>
      )}
    </div>
  );
}
