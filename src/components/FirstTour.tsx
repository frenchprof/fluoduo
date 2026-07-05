"use client";

/**
 * Hands-on page tours (Dan, 2026-07-05: first "offer a tutorial that takes
 * the user one round through the parts", then "a hands-on guide … for all
 * the different types of pages"). Rendered by CahierShell on every notebook
 * page. Each PAGE TYPE (home / unit / index / lesson) has its own short
 * spotlight tour:
 *   - first visit to that page type → a small invite (accept, decline, or
 *     "never offer again" globally);
 *   - after that, the permanent ✨ chip bottom-left replays the CURRENT
 *     page's tour any time (Dan: "permanently on the bottom left").
 * Steps are DO-to-advance (Dan: "user need to interact to advance"): tap
 * steps catch the tap on the spotlighted part without navigating away; the
 * drag step lets the width grip really drag.
 */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SEEN_KEY = "fluolingo:tours.v2"; // JSON map { [tourKey]: 1 }
const NEVER_KEY = "fluolingo:tours.never"; // "1" = never auto-offer anywhere
const LEGACY_KEY = "fluolingo:toured.v1"; // pre-v2 flag → counts as home seen

type Step = {
  selector?: string;
  text: string;
  /** tap = catcher over the hole advances on click; drag = events pass
   *  through so the width grip actually drags, release advances. */
  action?: "tap" | "drag";
};

type Tour = { key: string; steps: Step[] };

/** Which tour a URL gets. Lesson/practice URLs render as a popup over the
 *  unit page, but the popup's parts are in the same document — selectors
 *  simply target them there. */
function tourFor(rawPath: string): Tour | null {
  // Normalize static-export forms: "/index.html" and "/unit/1.html" are the
  // same pages as "/" and "/unit/1".
  let path = rawPath.replace(/\.html$/, "");
  if (path === "/index") path = "/";
  if (path === "/" || path === "") {
    return {
      key: "home",
      steps: [
        { selector: "nav.cahier-tabs, .cahier-menu > button", action: "tap", text: "Tap a flap: 🏠 Home, ❓ Guide, the five Unités, and the 🗂️ Index. They follow you everywhere." },
        { selector: "main.cahier-page", action: "tap", text: "Tap the sheet — each place is a sheet in the notebook, and deeper sheets stack on top of their parent." },
        { selector: '[title="Drag to widen the page"]', action: "drag", text: "Drag this edge to make the page wider — try it! The popups resize from their ◢ corner too." },
        { text: "Start on 🏠 Home and tap the goal your class is working on: Pre-Test first, then the cards, then the Lesson. The full manual lives under ❓ Guide. Bonne route !" },
      ],
    };
  }
  if (/^\/unit\//.test(path)) {
    return {
      key: "unit",
      steps: [
        { selector: "main .grid.grid-cols-5 > button, main button.group", action: "tap", text: "Every circle is a goal. Tap one and its sheet opens: Pre-Test first, then the cards, then the Lesson." },
        { selector: "nav.cahier-tabs, .cahier-menu > button", action: "tap", text: "The flaps stay with you — switch Unité or head 🏠 Home any time." },
        { text: "✓ green = done, the highlighted circle = where your class is. Mistakes are welcome — they become your 📝 Bring to class list." },
      ],
    };
  }
  if (path.startsWith("/activities")) {
    return {
      key: "index",
      steps: [
        { selector: 'input[type="search"]', action: "tap", text: "Search any topic here — accents optional (cafe finds café)." },
        { selector: "thead tr", action: "tap", text: "Each column is one activity — same colors as in the ❓ Guide." },
        { selector: "tbody tr", action: "tap", text: "A row is one topic. Every icon is a door — tap any cell to play." },
        { selector: "section.fluo-h-5", action: "tap", text: "✨ Vos decks: build your own cards with ➕ and they appear here." },
      ],
    };
  }
  if (/^\/lessons\//.test(path)) {
    return {
      key: "lesson",
      steps: [
        { selector: ".sticky.backdrop-blur", action: "tap", text: "A lesson is one page: Lire → Pratique → Générateur. These chips jump between the parts." },
        { selector: "#lf-pratique", action: "tap", text: "Pratique climbs four levels: pick it ★, type the word ★★, write the whole sentence ★★★, then translate ⭐." },
        { text: "Finish with the 🎲 Générateur — it rolls endless fresh sentences. Wrong answers cost nothing; they teach." },
      ],
    };
  }
  return null;
}

function readSeen(): Record<string, 1> {
  try {
    const seen = JSON.parse(window.localStorage.getItem(SEEN_KEY) || "{}");
    if (window.localStorage.getItem(LEGACY_KEY)) seen.home = 1;
    return seen;
  } catch {
    return {};
  }
}

export default function FirstTour() {
  const pathname = usePathname() ?? "/";
  const tour = tourFor(pathname);
  const [mode, setMode] = useState<"hidden" | "offer" | "chip" | "tour">("hidden");
  const [step, setStep] = useState(0);
  // Steps actually VISITED (absent targets get skipped) — Back pops this.
  const [hist, setHist] = useState<number[]>([]);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const STEPS = tour?.steps ?? [];

  useEffect(() => {
    if (!tour) {
      setMode("hidden");
      return;
    }
    try {
      const never = window.localStorage.getItem(NEVER_KEY) === "1";
      setMode(never || readSeen()[tour.key] ? "chip" : "offer");
    } catch {
      setMode("chip");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

  function markSeen() {
    if (!tour) return;
    try {
      const seen = readSeen();
      seen[tour.key] = 1;
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch {}
  }

  function finish() {
    markSeen();
    setMode("chip");
  }

  function neverAgain() {
    try { window.localStorage.setItem(NEVER_KEY, "1"); } catch {}
    markSeen();
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

  if (!tour || mode === "hidden") return null;

  // The permanent bottom-left guide: always there, one tap replays this
  // page's tour.
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
          ✨ Première visite ici ?
        </p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={startTour} className="cahier-btn cahier-btn-sm cahier-btn-accent font-black">
            Petit tour !
          </button>
          <button type="button" onClick={finish} className="cahier-btn cahier-btn-sm">
            Non merci
          </button>
        </div>
        <button
          type="button"
          onClick={neverAgain}
          className="mt-1.5 text-[0.65rem] font-bold text-[color:var(--cahier-ink-soft)] underline-offset-2 hover:underline"
        >
          Ne plus jamais proposer
        </button>
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
