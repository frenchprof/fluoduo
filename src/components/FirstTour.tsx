"use client";

/**
 * First-visit tour (Dan, 2026-07-05: "the first time any user gets to any
 * part of the page, offer a tutorial that takes the user one round through
 * the parts"). Rendered by CahierShell on every notebook page: on a first
 * visit (no localStorage flag) a small invite appears; accepting walks one
 * round of spotlight steps over the page's parts. Declining — or finishing —
 * sets the flag; the Guide's "revoir le tour" clears it.
 */
import { useEffect, useState } from "react";

const KEY = "fluolingo:toured.v1";

type Step = { selector?: string; text: string };

const STEPS: Step[] = [
  { selector: "nav.cahier-tabs, .cahier-menu > button", text: "The flaps: 🏠 Home, ❓ Guide, the five Unités, and the 🗂️ Index. They follow you everywhere." },
  { selector: "main.cahier-page", text: "Each place is a sheet in the notebook — deeper sheets stack on top of their parent." },
  { selector: '[title="Drag to widen the page"]', text: "Drag this edge to make any page wider. The popups resize from their ◢ corner too." },
  { text: "Start on 🏠 Home and tap the goal your class is working on: Pre-Test first, then the cards, then the Lesson. The full manual lives under ❓ Guide. Bonne route !" },
];

export default function FirstTour() {
  const [mode, setMode] = useState<"hidden" | "offer" | "tour">("hidden");
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setMode("offer");
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

  function finish() {
    try { window.localStorage.setItem(KEY, "1"); } catch {}
    setMode("hidden");
  }

  if (mode === "hidden") return null;

  if (mode === "offer") {
    return (
      <div className="fixed bottom-4 left-4 z-[80] max-w-[16rem] rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-3 shadow-[4px_4px_0_var(--cahier-hl,#eaff00)]">
        <p className="text-sm font-black text-[color:var(--cahier-ink)]">
          ✨ Première visite ?
        </p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => setMode("tour")} className="cahier-btn cahier-btn-sm cahier-btn-accent font-black">
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
  return (
    <div className="fixed inset-0 z-[80]" onClick={() => (last ? finish() : setStep(step + 1))}>
      {/* dim everything except the spotlighted part */}
      {rect ? (
        <div
          className="absolute rounded-xl border-4 transition-all duration-300"
          style={{
            top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12,
            borderColor: "var(--cahier-hl, #eaff00)",
            boxShadow: "0 0 0 9999px rgba(42, 46, 110, 0.55)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(42,46,110,0.55)]" />
      )}
      <div
        className="absolute left-1/2 w-[min(22rem,90vw)] -translate-x-1/2 rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-4 shadow-[4px_4px_0_var(--cahier-hl,#eaff00)]"
        style={{ top: rect && rect.top > window.innerHeight / 2 ? Math.max(16, rect.top - 150) : Math.min((rect ? rect.top + rect.height : window.innerHeight / 2) + 18, window.innerHeight - 170) }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold leading-relaxed text-[color:var(--cahier-ink)]">{s.text}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-black text-[color:var(--cahier-ink-soft)]">{step + 1}/{STEPS.length}</span>
          <button type="button" onClick={finish} className="cahier-btn cahier-btn-sm ml-auto">Passer</button>
          <button
            type="button"
            onClick={() => (last ? finish() : setStep(step + 1))}
            className="cahier-btn cahier-btn-sm cahier-btn-accent font-black"
          >
            {last ? "Fin ✓" : "Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Guide-page button: forget the flag and rerun the tour from Home. */
export function ReplayTour() {
  return (
    <button
      type="button"
      onClick={() => {
        try { window.localStorage.removeItem(KEY); } catch {}
        window.location.href = "/";
      }}
      className="cahier-btn cahier-btn-sm"
    >
      ↻ Revoir le petit tour
    </button>
  );
}
