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
import { createPortal } from "react-dom";
import Link from "next/link";
import { useDragFloat } from "@/lib/useDragFloat";
import { usePathname } from "next/navigation";
import { SIOS } from "@/content/sios";
import { loadProgress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";

const SEEN_KEY = "fluolingo:tours.v2"; // JSON map { [tourKey]: 1 }
const NEVER_KEY = "fluolingo:tours.never"; // "1" = never auto-offer anywhere
const LEGACY_KEY = "fluolingo:toured.v1"; // pre-v2 flag → counts as home seen

type Step = {
  selector?: string;
  text: string;
  /** tap = catcher over the hole advances on click; drag = events pass
   *  through so the width grip actually drags, release advances. */
  action?: "tap" | "drag";
  /** "play" = the finish card whose big button IS Play — it navigates to the
   *  current stop exactly as the hero pill does (approved flow, 2026-08-24). */
  kind?: "play";
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
    // Rebuilt to the approved flow mocks (2026-08-24). The old four steps
    // named surfaces that no longer exist (❓ HELP, ❓ Guide, tappable Home
    // goals), taught a desktop drag on phones, and step 2's buttons rendered
    // behind the bottom bar — the 22 Aug flow walk reproduced the Skills tab
    // eating the Next tap. Three steps now, ending ON Play.
    return {
      key: "home",
      steps: [
        { selector: 'a[title^="Play"]', action: "tap", text: "Play — your next stop on the path." },
        { selector: "nav.cahier-bottombar", action: "tap", text: "The five tabs — press and hold one for its name." },
        { kind: "play", text: "Start here" },
      ],
    };
  }
  // /map is where the whole course lives — a stop tapped anywhere lands here
  // (Home goes /?unit=1 -> /map?unit=1) — and until 2026-08-28 it was the one
  // major surface with NO tour at all: tourFor branched on "/", /unit/,
  // /activities and /lessons/, so a first-time visitor to the map got nothing.
  //
  // The tour used to open on the wake glass ("tap to use the map"); the
  // glass was removed on 2026-08-31 with the map on its own page, so the
  // tour now opens on the 2D/3D toggle — the map's front-and-centre control.
  if (/^\/map/.test(path)) {
    return {
      key: "map",
      steps: [
        // The wake-glass step went with the glass itself (Dan, 2026-08-31) —
        // the map answers the first tap now, nothing to explain.
        { selector: '[data-tour="map-view"]', action: "tap", text: "2D reads like a plan, 3D like a scene. Your choice sticks." },
        { selector: '[data-tour="map"]', action: "tap", text: "Every stop on the road is one goal. Tap one and its sheet opens." },
        { text: "✓ green = done, the highlighted stop = where your class is. Mistakes are welcome — they become your 📝 Bring to class list." },
      ],
    };
  }
  if (/^\/unit\//.test(path)) {
    return {
      key: "unit",
      steps: [
        // "Pre-Test first, then the cards, then the Lesson" retired
        // (2026-08-24): it contradicted the authored order the sheet's
        // numbered path now shows — the path speaks for itself.
        { selector: "main .grid.grid-cols-5 > button, main button.group", action: "tap", text: "Every circle is a goal. Tap one and its sheet opens — follow the numbered path." },
        { selector: "nav.cahier-tabs, .cahier-menu > button", action: "tap", text: "The flaps stay with you — switch Unit or head 🏠 Home any time." },
        { text: "✓ green = done, the highlighted circle = where your class is. Mistakes are welcome — they become your 📝 Bring to class list." },
      ],
    };
  }
  // The "index" tour is GONE (2026-08-29). It described /activities — the
  // search field, the column headers, the rows, "your decks" — and that page
  // was deleted when the Index was retired ("the map is the front door").
  // Its branch was repointed to /map rather than removed, which left it both
  // unreachable, since the /map tour above matches first, and wrong if it had
  // been reached: three of its four targets (thead, tbody, section.fluo-h-5)
  // are nowhere on the map page. A tour for a deleted page cannot be salvaged
  // by pointing it at a different one.
  if (/^\/lessons\//.test(path)) {
    // Rewritten 2026-08-28. The old three steps described the LessonFlow page
    // patch 22 deleted: "Lire → Pratique → Générateur", chips that jump between
    // parts, and a #lf-pratique anchor that exists nowhere in the codebase. It
    // had been pointing at a screen that no longer existed for weeks, so it
    // highlighted nothing and silently skipped — the same shape as the
    // ÉcouTexte band, something that reports as present and does nothing. It
    // got more wrong on 2026-08-28, when lessons started opening on the entry
    // chooser the tour had never heard of.
    //
    // These steps name what is actually on screen, and the selectors are
    // `data-tour` hooks in LessonPager rather than utility classes, so a
    // styling change cannot quietly unhook the tour again. The axes step is
    // skipped automatically on the lessons that declare no selectors.
    return {
      key: "lesson",
      steps: [
        { selector: '[data-tour="entry"]', action: "tap", text: "Choose where to start. All three are the same twelve cards — ★★★ is harder, not shorter." },
        { selector: '[data-tour="axes"]', action: "tap", text: "Want one thing in particular? Pin a subject or a verb — or 🎲 for a random mix." },
        { text: "Then it is one card at a time: the Mémo to read, then the ramp. Wrong answers cost nothing; they teach." },
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
  const drag = useDragFloat("fl.float.tour", { right: 16, bottom: 16 }, "left");
  const pathname = usePathname() ?? "/";
  const tour = tourFor(pathname);
  const [mode, setMode] = useState<"hidden" | "offer" | "chip" | "tour">("hidden");
  const [step, setStep] = useState(0);
  // Steps actually VISITED (absent targets get skipped) — Back pops this.
  const [hist, setHist] = useState<number[]>([]);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const STEPS = tour?.steps ?? [];

  useEffect(() => {
    // The seen/never flags live in localStorage, which cannot be read during
    // render — this route-change effect has to seed `mode`. Block-disabled:
    // the rule reports only the first setState it meets, and which one that
    // is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
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
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Measure the current step's target (skipping steps whose target is absent
  // or hidden on this page/viewport).
  useEffect(() => {
    if (mode !== "tour") return;
    // The target's rectangle comes from getBoundingClientRect — the DOM
    // cannot be measured during render, so the spotlight state is seeded
    // here. Block-disabled: the rule reports only the first setState it
    // meets, and which one that is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
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
    /* eslint-enable react-hooks/set-state-in-effect */
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
    // Portal + draggable (Dan, 2026-07-26): same transformed-ancestor bug as
    // the popups was rendering this off-screen on some pages; and every
    // float on the site is now movable by decree.
    return createPortal(
      <button
        type="button"
        {...drag.handlers}
        style={drag.style}
        onClick={() => { if (drag.consumeClick()) return; startTour(); }}
        title="Replay the tour"
        aria-label="Replay the tour"
        className="fixed z-[80] flex h-10 w-10 items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)] bg-white text-lg shadow-[3px_3px_0_var(--cahier-hl,#eaff00)] transition hover:-translate-y-0.5 active:translate-y-0"
      >
        ✨
      </button>,
      document.body,
    );
  }

  if (mode === "offer") {
    return createPortal(
      // Above the bottom bar's floor, never behind it (2026-08-24): the
      // third option, "Never offer again", used to be clipped off-screen.
      <div
        className="fixed left-4 z-[80] max-w-[16rem] rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-3 shadow-[4px_4px_0_var(--cahier-hl,#eaff00)]"
        style={{ bottom: "calc(var(--bottombar-floor, 8px) + 8px)" }}
      >
        <p className="text-sm font-black text-[color:var(--cahier-ink)]">
          ✨ First time here?
        </p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={startTour} className="cahier-btn cahier-btn-sm cahier-btn-accent font-black">
            Quick tour!
          </button>
          <button type="button" onClick={finish} className="cahier-btn cahier-btn-sm">
            No thanks
          </button>
        </div>
        <button
          type="button"
          onClick={neverAgain}
          className="mt-1.5 text-[0.65rem] font-bold text-[color:var(--cahier-ink-soft)] underline-offset-2 hover:underline"
        >
          Never offer again
        </button>
      </div>,
      document.body,
    );
  }

  const s = STEPS[step];
  const last = step >= STEPS.length - 1;
  const dim = "rgba(42, 46, 110, 0.55)";

  // The finish card (home tour): its big button IS Play — the same current
  // stop the hero pill computes. Tapping it marks the tour seen and goes.
  if (s.kind === "play") {
    const sio = SIOS.find((x) => x.id === nextSioId(loadProgress()));
    const href = sio ? `/unit/${sio.unit}#${sio.id}` : "/";
    return createPortal(
      <div className="fixed inset-0 z-[100]">
        <div className="absolute inset-0" style={{ background: dim }} onClick={finish} />
        <div
          className="absolute left-1/2 top-1/2 w-[min(19rem,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-6 text-center shadow-[0_5px_0_var(--cahier-hl,#eaff00)]"
        >
          <p className="text-lg font-black text-[color:var(--cahier-ink)]">Start here</p>
          <Link
            href={href}
            onClick={finish}
            className="fluo-mono mx-auto mt-4 flex h-14 w-52 max-w-full items-center justify-center gap-1 rounded-full border-[3px] border-[color:var(--cahier-ink)] text-xl font-black text-[color:var(--cahier-ink)] no-underline"
            style={{ background: "var(--cahier-hl, #eaff00)", boxShadow: "0 4px 0 rgba(0,0,0,0.3), 0 0 0 6px rgba(212, 242, 76, 0.45)" }}
          >
            Play<span aria-hidden>›</span>
          </Link>
          <p className="fluo-mono mt-4 text-xs font-black text-[color:var(--cahier-ink-soft)]">{step + 1}/{STEPS.length}</p>
        </div>
      </div>,
      document.body,
    );
  }

  // The spotlight HOLE stays interactive: the dim is four strips AROUND it,
  // not one sheet over it, so the learner can do the step's action for real.
  const hole = rect
    ? { top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }
    : null;
  // PORTALED to <body> and z-[100] (2026-08-24): the overlay used to render
  // inside the page tree at z-[80] while the bottom bar is fixed at z-90 —
  // so on any step whose bubble landed low, the bar covered the buttons and
  // ATE the Next tap (the flow walk reproduced it landing on the Skills
  // tab). From the body at z-100 the overlay and its bubble sit in the root
  // stacking context above the bar (90) whatever context the page creates.
  return createPortal(
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: "none" }}>
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
    </div>,
    document.body,
  );
}
