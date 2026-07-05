"use client";

/**
 * First-visit tour (Dan, 2026-07-05: "the first time any user gets to any
 * part of the page, offer a tutorial that takes the user one round through
 * the parts"). Rendered by CahierShell on every notebook page: on a first
 * visit (no localStorage flag) a small invite appears; accepting walks one
 * round of spotlight steps over the page's parts. Declining — or finishing —
 * sets the flag, after which a compact ✨ chip stays PERMANENTLY at the
 * bottom left (Dan, 2026-07-05: "the tour guide should be permanently on
 * the bottom left" / "revoir le petit tour should be floating") — tap it to
 * rerun the tour from any page, any time.
 */
import { useEffect, useState } from "react";

const KEY = "fluolingo:toured.v1";

type Step = {
  selector?: string;
  text: string;
  /** How the learner advances by DOING (Dan, 2026-07-05: "user need to
   *  interact to advance"): tap = a catcher over the spotlight advances on
   *  click (without navigating away); drag = real pointer events reach the
   *  element (the width grip actually drags), advancing on release. */
  action?: "tap" | "drag";
};

const STEPS: Step[] = [
  { selector: "nav.cahier-tabs, .cahier-menu > button", action: "tap", text: "Tap a flap: 🏠 Home, ❓ Guide, the five Unités, and the 🗂️ Index. They follow you everywhere." },
  { selector: "main.cahier-page", action: "tap", text: "Tap the sheet — each place is a sheet in the notebook, and deeper sheets stack on top of their parent." },
  { selector: '[title="Drag to widen the page"]', action: "drag", text: "Drag this edge to make the page wider — try it! The popups resize from their ◢ corner too." },
  { text: "Start on 🏠 Home and tap the goal your class is working on: Pre-Test first, then the cards, then the Lesson. The full manual lives under ❓ Guide. Bonne route !" },
];

export default function FirstTour() {
  const [mode, setMode] = useState<"hidden" | "offer" | "chip" | "tour">("hidden");
  const [step, setStep] = useState(0);
  // Steps actually VISITED (absent targets get skipped) — Back pops this.
  const [hist, setHist] = useState<number[]>([]);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    try {
      setMode(window.localStorage.getItem(KEY) ? "chip" : "offer");
    } catch {}
  }, []);

  // Measure the current step's target (skipping steps whose target is absent
  // or hidden on this page/viewport).
  useEffect(() => {
    if (mode !== "tour") return;
    let i = step;
    while (i < STEPS.length) {
      const sel = STEPS[i].selector;
      if (!sel) { setRect(null); if (i !== step) setStep(i); return; }
      const el = Array.from(document.querySelectorAll(sel)).find((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        if (i !== step) setStep(i);
        return;
      }
      i += 1;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  // Drag step: real pointer events reach the grip (no catcher), and a
  // completed drag — grip pressed, then released — advances the tour.
  useEffect(() => {
    if (mode !== "tour" || STEPS[step]?.action !== "drag") return;
    let dragging = false;
    const down = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.('[title="Drag to widen the page"]')) dragging = true;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      window.setTimeout(() => goNext(), 300);
    };
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  function finish() {
    try { window.localStorage.setItem(KEY, "1"); } catch {}
    setMode("chip");
  }

  function startTour() {
    setStep(0);
    setHist([]);
    setMode("tour");
  }

  function goNext() {
    if (step >= STEPS.length - 1) { finish(); return; }
    setHist((h) => [...h, step]);
    setStep(step + 1);
  }

  function goBack() {
    setHist((h) => {
      if (h.length === 0) return h;
      setStep(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  if (mode === "hidden") return null;

  // The permanent bottom-left guide: always there, one tap replays the tour.
  if (mode === "chip") {
    return (
      <button
        type="button"
        onClick={startTour}
        title="Revoir le petit tour"
        aria-label="Revoir le petit tour"
        className="fixed bottom-4 left-4 z-[80] flex h-10 w-10 items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)] bg-white text-lg shadow-[3px_3px_0_var(--cahier-hl,#eaff00)] transition hover:-translate-y-0.5 active:translate-y-0"
      >
        ✨
      </button>
    );
  }

  if (mode === "offer") {
    return (
      <div className="fixed bottom-4 left-4 z-[80] max-w-[16rem] rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-3 shadow-[4px_4px_0_var(--cahier-hl,#eaff00)]">
        <p className="text-sm font-black text-[color:var(--cahier-ink)]">
          ✨ Première visite ?
        </p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={startTour} className="cahier-btn cahier-btn-sm cahier-btn-accent font-black">
            Petit tour !
          </button>
          <button type="button" onClick={finish} className="cahier-btn cahier-btn-sm">
            Non merci
          </button>
        </div>
      </div>
    );
  }

  const s = STEPS[step];
  const last = step >= STEPS.length - 1;
  const dim = "rgba(42, 46, 110, 0.55)";
  // The spotlight HOLE stays interactive: the dim is four strips AROUND it,
  // not one sheet over it, so the learner can do the step's action for real.
  const hole = rect
    ? { top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }
    : null;
  return (
    <div className="fixed inset-0 z-[80]" style={{ pointerEvents: "none" }}>
      {hole ? (
        <>
          <div className="absolute" style={{ pointerEvents: "auto", background: dim, top: 0, left: 0, right: 0, height: Math.max(0, hole.top) }} />
          <div className="absolute" style={{ pointerEvents: "auto", background: dim, top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height }} />
          <div className="absolute" style={{ pointerEvents: "auto", background: dim, top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
          <div className="absolute" style={{ pointerEvents: "auto", background: dim, top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
          <div
            className="absolute rounded-xl border-4 transition-all duration-300"
            style={{ ...hole, borderColor: "var(--cahier-hl, #eaff00)", pointerEvents: "none" }}
          />
          {/* tap steps: an invisible catcher advances on the tap itself —
              without navigating away mid-tour. Drag steps get NO catcher:
              real pointer events reach the width grip underneath. */}
          {s.action === "tap" && (
            <div className="absolute cursor-pointer" style={{ ...hole, pointerEvents: "auto" }} onClick={goNext} />
          )}
        </>
      ) : (
        <div className="absolute inset-0" style={{ pointerEvents: "auto", background: dim }} />
      )}
      <div
        className="absolute left-1/2 w-[min(22rem,90vw)] -translate-x-1/2 rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-4 shadow-[4px_4px_0_var(--cahier-hl,#eaff00)]"
        style={{ pointerEvents: "auto", top: rect && rect.top > window.innerHeight / 2 ? Math.max(16, rect.top - 150) : Math.min((rect ? rect.top + rect.height : window.innerHeight / 2) + 18, window.innerHeight - 170) }}
      >
        <p className="text-sm font-bold leading-relaxed text-[color:var(--cahier-ink)]">{s.text}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-black text-[color:var(--cahier-ink-soft)]">{step + 1}/{STEPS.length}</span>
          <button type="button" onClick={finish} className="cahier-btn cahier-btn-sm ml-auto">Skip</button>
          {hist.length > 0 && (
            <button type="button" onClick={goBack} className="cahier-btn cahier-btn-sm">← Back</button>
          )}
          <button type="button" onClick={goNext} className="cahier-btn cahier-btn-sm cahier-btn-accent font-black">
            {last ? "Done ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
