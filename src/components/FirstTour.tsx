"use client";

/**
 * Hands-on page tours (Dan, 2026-07-05: first "offer a tutorial that takes
 * the user one round through the parts", then "a hands-on guide … for all
 * the different types of pages"). Rendered by CahierShell on every notebook
 * page. Each PAGE TYPE (home / unit / index / lesson) has its own short
 * spotlight tour:
 *   - first visit to that page type → a small invite (accept, decline, or
 *     "never offer again" globally);
 *   - after that, NOTHING. A permanent ✨ chip used to sit bottom-right and
 *     replay the current page's tour; Dan deleted it on 2026-09-13 — *"The
 *     floating tour button should now be deleted for good."* — so a tour is
 *     offered once and never again. See the note where the chip used to be
 *     rendered, and verify660.
 * Steps are DO-to-advance (Dan: "user need to interact to advance"): tap
 * steps catch the tap on the spotlighted part without navigating away; the
 * drag step lets the width grip really drag.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIOS } from "@/content/sios";
import { loadProgress } from "@/lib/progress";
import { continueSioId } from "@/lib/continuer";
import { HOME_HREF } from "@/lib/routes";
import { appTourDone } from "@/components/TourWalk";

const SEEN_KEY = "fluolingo:tours.v2"; // JSON map { [tourKey]: 1 }
const NEVER_KEY = "fluolingo:tours.never"; // "1" = never auto-offer anywhere
const LEGACY_KEY = "fluolingo:toured.v1"; // pre-v2 flag → counts as home seen

type Step = {
  selector?: string;
  text: string;
  /** tap = catcher over the hole advances on click; drag = events pass
   *  through so the width grip actually drags, release advances. */
  action?: "tap";
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
  // HOME IS `/home` NOW, AND THIS TOUR WAS ORPHANED BY THAT MOVE (11 Sep).
  // When the ENTER coin landed, `/` became the landing page and the learner's
  // own page moved to `/home` (lib/routes.ts). This branch still matched only
  // `/`, so the home tour was offered on a page that has neither a Continue
  // pill nor a bottom bar — and never on the page that has both. Measured on
  // the built app: `a[title^="Continue"]` is 1 on /home and 0 on /.
  //
  // `/` KEEPS MATCHING deliberately: it is where a bookmark from before the
  // move lands, and the landing page does not mount CahierShell, so nothing is
  // offered there either way. Matching both costs nothing and means the tour
  // cannot be lost again by the address moving back.
  if (path === "/home" || path === "/" || path === "") {
    // Rebuilt to the approved flow mocks (2026-08-24). The old four steps
    // named surfaces that no longer exist (❓ HELP, ❓ Guide, tappable Home
    // goals), taught a desktop drag on phones, and step 2's buttons rendered
    // behind the bottom bar — the 22 Aug flow walk reproduced the Skills tab
    // eating the Next tap. Three steps now, ending ON Play.
    return {
      key: "home",
      steps: [
        // BOTH AT ONCE (Dan, 2026-09-12: *"the walk through on the home page
        // should at the same time point out both the Continue button and the
        // map's stop button"*). The ▶ key and the glowing stop on the road are
        // the same goal — « Introductions » — reached two ways, and showing
        // them one after the other would have taught them as two separate
        // things to learn. Both light together and either one advances.
        //
        // `[data-tour="continue"]`, not `a[title^="Continue"]`. The old form
        // hung this step off the first word of a TOOLTIP — « Continue — «
        // Introductions », your goal on the study path » — so rewording that
        // sentence would have unhooked the tour with nothing to show for it.
        {
          // ONE TARGET NOW, NOT TWO (12 Sep). Dan removed Home's ▶ Continue
          // key — *"is it ok to do without the play, forward and rewind
          // buttons"* — so the half of this selector that carried the step is
          // gone, and `[data-tour="map-stop"]` was a fallback nothing rendered.
          // The anchor is on the map's glowing stop now (Map2DGrid), which is
          // what the sentence was pointing at all along.
          selector: '[data-tour="map-stop"]',
          action: "tap",
          text: "Your next stop — the glowing one. Tap it to open the goal.",
        },
        // THE MAP TOUR'S ONE SURVIVING STEP (12 Sep). The map moved onto this
        // page, so `/home` matches the branch above and the `/^\/map/` branch
        // below it can never be reached — the fifth silent tour failure this
        // file would have recorded, and the first one caught before shipping.
        //
        // Only this step is carried over; the other two were already taught
        // here. Its « Every stop is one goal. Tap one to open it. » is the step
        // above wearing different words, and « ✓ green = done » describes a
        // colour the learner is looking at. The 2D/3D switch is the one control
        // that arrived on this page with nothing anywhere explaining it.
        { selector: '[data-tour="map-view"]', action: "tap", text: "2D is a plan, 3D is a scene. Your choice sticks." },
        // ☰, NOT THE BOTTOM BAR (Dan, 2026-09-11: *"the beginning first
        // landing on the home page: the current tour is broken"*).
        //
        // This step used to read « Your tabs — press and hold one for its
        // name » and point at `nav.cahier-bottombar`. Dan removed that bar on
        // 6 Sep — *"can we remove the bottom nav menu"* — and `bottomNav`
        // defaults to `[]`, so BottomBar returns null before rendering a
        // `<nav>` at all. Measured on /home: zero `nav.cahier-bottombar`, zero
        // `<nav>` of any kind.
        //
        // The step therefore matched nothing and the measure effect stepped
        // over it — the SILENT skip this file has now been bitten by four
        // times. What a learner saw was the tour jumping « 1/3 » straight to
        // « 3/3 », having been taught one thing out of three.
        //
        // The comment that stood here even predicted it: *"when they are all
        // removed this step's selector matches nothing, which the measure
        // effect already skips over"*. That was written as reassurance. It was
        // a description of the bug, and it aged into one a day later.
        //
        // ☰ is what replaced the bar, and it does not have the bar's problem:
        // it is on every page, for every learner, not an opt-in.
        { selector: '[data-tour="site-menu"]', action: "tap", text: "☰ opens everything — every family, every activity." },
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
  //
  // AND ON 12 SEP THE MAP CAME BACK OFF ITS OWN PAGE. `/map` forwards to
  // `/home`, which draws the map — so the branch that stood here could never
  // match again: `path === "/home"` is answered fifteen lines above and
  // returns. A tour branch for an address nothing resolves to is precisely
  // what the three retirement notes below describe, so it is not left sitting
  // here looking live. Its 2D/3D step moved into the home tour, where the
  // control it names now lives; the other two were duplicates and the reason
  // is written beside it.
  // THE UNIT TOUR IS GONE, AND THAT IS HOW /unit/N GETS A WORKING ONE (11 Sep).
  //
  // Dan asked for the dead tours fixed rather than retired, and for this one
  // "fixed" cannot mean "repaired in place", because there is no longer a page
  // to tour. `/unit/N` has been a REDIRECT STUB since patch 25 — four lines
  // that `window.location.replace` to `/map?unit=N` (app/unit/[unit]/UnitRedirect.tsx).
  // Its tour described the old unit sheet: « Every circle is a goal », « The
  // flaps stay with you ». Measured on the built app, its first target matches
  // ZERO elements in every document on that route, because the screen it names
  // was deleted three weeks ago.
  //
  // What a learner actually lands on is the MAP, scrolled to that unit — and
  // `usePathname()` reads "/map" after the redirect, so the map tour above is
  // what they were already being served. It was dead too, for the frame reason
  // in measureScopes; it works now. So deleting this branch is not a tour
  // taken away: it is the one that was reaching them starting to work.
  //
  // This is the third tour retired for naming a deleted screen. The pattern is
  // always the same and never reports itself — verify220 walks each live tour
  // to the end now and fails if any step never comes up.
  // The "index" tour is GONE (2026-08-29). It described /activities — the
  // search field, the column headers, the rows, "your decks" — and that page
  // was deleted when the Index was retired ("the map is the front door").
  // Its branch was repointed to /map rather than removed, which left it both
  // unreachable, since the /map tour above matches first, and wrong if it had
  // been reached: three of its four targets (thead, tbody, section.fluo-h-5)
  // are nowhere on the map page. A tour for a deleted page cannot be salvaged
  // by pointing it at a different one.
  // THE LESSON PAGE TOUR IS RETIRED (2026-09-11), and it had already stopped
  // working on 7 Sep without anyone noticing — the same fortnight-long silent
  // failure its own comment below describes, repeated.
  //
  // On 7 Sep the lesson moved into a frame: `/lessons/deck/<id>` became
  // CahierShell + EmbedFrame, and LessonPager — which owns BOTH of this tour's
  // targets — moved into `/lessons/deck/<id>/embed`. This component runs in the
  // OUTER document and measures with `document.querySelectorAll`. A frame is a
  // different document. Driven on the built app, 11 Sep:
  //
  //     [data-tour="entry"] in the document the tour searches:  0
  //     [data-tour="entry"] in the document it actually lives in: 1
  //
  // So both spotlight steps skipped, and « Quick tour! » opened on 3/3 — one
  // sentence in a box, on top of the activity's own instruction card, which is
  // the double pop-up Dan reported on this page the same day.
  //
  // IT IS NOT MOVED INSIDE THE FRAME, because the activity's own first run is
  // already in there and already teaches this. The `lesson` row in
  // content/hints.ts now lights the tab strip and the level chooser from within
  // the frame, where the anchors are. The axes step is not carried over: it
  // renders only on lessons that declare axes, and where it does render it
  // carries its own « Practise something specific » heading above real
  // dropdowns — the litmus test deletes a line that says what is on screen.
  //
  // THE ✨ CHIP GOES WITH IT on this route, and that is the intended result
  // rather than a casualty: the chip's one job is to replay THIS page's tour,
  // and a tour that shows a single sentence is not one. Every other page type
  // keeps both.
  //
  // THE GENERAL RULE THIS LEAVES BEHIND, and it is NOT the one first written
  // here. That version said a page tour may only teach what is in its own
  // document — true of the code as it stood, and the wrong lesson: it made a
  // limitation sound like a principle, and would have had the next session
  // retire a fourth working tour rather than fix the measuring. Dan settled it
  // the same day: *"all to fix"*. `measureScopes` now reaches into same-origin
  // frames, so a tour follows its screen into one.
  //
  // What DOES generalise is the failure mode, not the fix: a step whose target
  // cannot be found is stepped over in SILENCE, and every one of the four dead
  // tours in this file died that way — a deleted page, a screen moved into a
  // frame, a control removed by a later ruling. Nothing errors and nobody
  // reports it, because the tour still appears to work. That is why
  // verify220 walks each live tour to its end and fails on any step number
  // that never comes up.
  return null;
}

/**
 * EVERY DOCUMENT THIS TOUR MAY MEASURE IN — this one, and any same-origin
 * frame inside it.
 *
 * Dan, 2026-09-11, told to fix the dead tours rather than retire them.
 *
 * Since 7 Sep every station runs in an iframe (*"EVERYTHING (LIKE THE MAP)
 * MUST NOW RUN WITHIN THE CAHIER PAGES IN IFRAMES"*), and a tour measures with
 * `document.querySelectorAll` — which stops at the frame. That one line is why
 * three tours went quiet: the map's 2D/3D switch and the map itself are in
 * `/map/embed`, the lesson's entry chooser was in its own embed, and every
 * selector stayed perfectly correct while matching nothing.
 *
 * A frame is our own page on our own host, so its document is simply readable.
 * The only arithmetic is the offset: a rect measured INSIDE the frame is
 * relative to the frame's own viewport, so the frame's position in this one is
 * added to put the spotlight in the right place on screen.
 *
 * WHY THE TAP STILL WORKS WITHOUT MORE WORK. The `action: "tap"` catcher is an
 * invisible div in THIS document laid over the hole — it always was, so that a
 * tour step cannot navigate away mid-tour. It never touched the real control,
 * so it does not care which document the control lives in.
 *
 * Cross-origin is not a case here and is guarded anyway: `contentDocument`
 * throws or returns null, and that frame is skipped.
 */
function measureScopes(): { doc: Document; dx: number; dy: number }[] {
  const out = [{ doc: document, dx: 0, dy: 0 }];
  for (const f of Array.from(document.querySelectorAll("iframe"))) {
    let d: Document | null = null;
    try { d = f.contentDocument; } catch { d = null; }
    if (!d) continue;
    const r = f.getBoundingClientRect();
    out.push({ doc: d, dx: r.left, dy: r.top });
  }
  return out;
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
  const pathname = usePathname() ?? HOME_HREF;
  const tour = tourFor(pathname);
  const [mode, setMode] = useState<"hidden" | "offer" | "tour">("hidden");
  /** Ticked on the offer sheet: « No thanks » then means never again. */
  const [never, setNever] = useState(false);
  const [step, setStep] = useState(0);
  // Steps actually VISITED (absent targets get skipped) — Back pops this.
  const [hist, setHist] = useState<number[]>([]);
  /**
   * EVERY BOX THIS STEP LIGHTS, not one (2026-09-12).
   *
   * Dan: *"the walk through on the home page should at the same time point out
   * both the Continue button and the map's stop button."* They are one idea in
   * two places — the ▶ key and the gold stop on the road are the SAME goal —
   * and a tour that lit them one after the other would teach them as two
   * things.
   *
   * So a step's selector may match more than once, and every visible match is
   * lit together. Nothing else changes: a step naming one control still gets
   * exactly one hole, so the other tours are untouched.
   */
  const [rects, setRects] = useState<{ top: number; left: number; width: number; height: number }[]>([]);

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
      // SEEN OR OPTED OUT = NOTHING. This used to be "chip" — the floating ✨
      // replay button — which Dan deleted on 13 Sep (see below).
      //
      // THE 8-STEP TOUR GOES FIRST (Dan, 2026-09-19: the app tour now starts
      // ITSELF, once, on a learner's first visit — no button anywhere). This
      // page-type invite used to be the only hand offered; on that same first
      // visit it now opened ON TOP of the tour sheet's controls, two offers
      // fighting over one screen. Held here, not refused: nothing is written,
      // so the invite returns on a later page once the tour is finished or
      // refused — one hand at a time.
      const waitOurTurn = !appTourDone();
      setMode(never || waitOurTurn || readSeen()[tour.key] ? "hidden" : "offer");
    } catch {
      setMode("hidden");
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
      if (!sel) { setRects([]); if (i !== step) setStep(i); return; }
      // THIS DOCUMENT FIRST, THEN ITS FRAMES — see measureScopes. A station
      // moved into an iframe on 7 Sep takes its controls with it, and a tour
      // that only looks here finds nothing and steps over itself in silence.
      //
      // EVERY VISIBLE MATCH, NOT THE FIRST. A step may name two controls that
      // are one idea — Home's ▶ key and the gold stop on the road — and both
      // are lit together. A step naming one control still yields one box, so
      // this is a widening rather than a change of behaviour.
      const found: { top: number; left: number; width: number; height: number }[] = [];
      for (const sc of measureScopes()) {
        for (const n of Array.from(sc.doc.querySelectorAll(sel))) {
          const r = n.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          // The frame's own offset: a rect inside it is measured against the
          // frame's viewport, not the window the spotlight is drawn in.
          found.push({ top: r.top + sc.dy, left: r.left + sc.dx, width: r.width, height: r.height });
        }
      }
      if (found.length) {
        setRects(found);
        if (i !== step) setStep(i);
        return;
      }
      i += 1;
    }
    finish();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  // THE DRAG STEP IS GONE. An effect here waited for a completed drag on
  // [title="Drag to widen the page"] to advance the tour — but no entry in
  // STEPS has ever carried `action: "drag"`, so the guard on the first line was
  // never false and the whole block was unreachable. Dan removed the drag
  // handle itself on 2026-09-02; this was already dead before that, and goes
  // now rather than sitting as a tour step for a control that no longer exists.

  function markSeen() {
    if (!tour) return;
    try {
      const seen = readSeen();
      seen[tour.key] = 1;
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch {}
  }

  // Both of these used to land on "chip" — the floating ✨ that is now
  // deleted. Finishing a tour, or declining it, leaves nothing behind.
  function finish() {
    markSeen();
    setMode("hidden");
  }

  function neverAgain() {
    try { window.localStorage.setItem(NEVER_KEY, "1"); } catch {}
    markSeen();
    setMode("hidden");
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

  /* THE FLOATING ✨ REPLAY CHIP IS GONE, FOR GOOD (Dan, 2026-09-13: *"The
     floating tour button should now be deleted for good."*).
   *
   * It was a draggable ✨ pinned bottom-right on every page that has a tour,
   * from the moment that tour had been seen once — so the steady state of the
   * app, for anyone past their first visit, was a float that did nothing until
   * tapped. It also sat beside two other floats (🐞 report a bug, 🛠️ Outils),
   * which is three permanent circles competing on a phone.
   *
   * WHAT THIS COSTS, said plainly rather than buried: there is now NO way to
   * replay a tour. `startTour` is only reached from the « Yes, show me » on the
   * first-visit offer, and that offer never returns once seen or declined. That
   * is what "for good" means, and it follows a fortnight of Dan reporting tours
   * that were broken or looping (GramMarathon, WorDrill). If a way back is
   * wanted later it belongs in ⚙️ Réglages, as a line of settings — not as a
   * circle floating over the lesson.
   *
   * `verify660-deleted-floats.py` holds this as a LIST, the Geist-ban shape:
   * banning the next float is adding a name to it. */

  if (mode === "offer") {
    return createPortal(
      // Above the bottom bar's floor, never behind it (2026-08-24): the
      // third option, "Never offer again", used to be clipped off-screen.
      <div
        /* `data-prompt` NAMES THIS AS A PROMPT so another one can stand down
           rather than open on top of it (2026-09-15). It is not a dialog — it
           is a corner chip with no role and no overlay — so anything looking
           for `[role="dialog"]` finds nothing and opens anyway, which is how
           the What's New card came to sit over this on its first build. A
           named hook is the same device as `data-tour`: the next prompt adds
           the attribute and is found for free. */
        data-prompt="tour-offer"
        className="fixed left-4 z-[80] max-w-[16rem] rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-3 shadow-[4px_4px_0_var(--cahier-hl,#eaff00)]"
        style={{ bottom: "calc(var(--bottombar-floor, 8px) + 8px)" }}
      >
        <p className="text-sm font-black text-[color:var(--cahier-ink)]">
          ✨ First time here?
        </p>
        {/* A CHECKBOX, NOT A THIRD BUTTON (Dan, 2026-09-07: *"why is the why
            never offer again without the check box"*).

            It was a bare underlined line under two buttons, which is the one
            shape it should not have been: it looked like a caption that had
            lost its tickbox, and it was in fact a third ACTION sitting where a
            setting appears to be. The app's other first-run sheet
            (components/FirstRunHint.tsx) has said « Do not show me again » as a
            checkbox above its confirm button since 2 Sep, so a learner meets
            two sheets that ask the same question two ways.

            Now it is the same shape: tick, then « No thanks » honours it. Three
            controls become two plus a setting, which is also what the three
            words actually mean.

            The checkbox is a LABEL, so the words are part of the target — an
            18px box on a phone is not a thing anyone hits on purpose. */}
        <label className="mt-2 flex cursor-pointer select-none items-center gap-2 text-[0.7rem] font-bold text-[color:var(--cahier-ink-soft)]">
          <input
            type="checkbox"
            checked={never}
            onChange={(e) => setNever(e.target.checked)}
            className="h-[1rem] w-[1rem] shrink-0 accent-[color:var(--cahier-ink)]"
          />
          Never offer again
        </label>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={startTour} className="cahier-btn cahier-btn-sm cahier-btn-accent font-black">
            Quick tour!
          </button>
          <button
            type="button"
            onClick={() => (never ? neverAgain() : finish())}
            className="cahier-btn cahier-btn-sm"
          >
            No thanks
          </button>
        </div>
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
    // PLAY OPENS THE GOAL'S OWN PAGE (Dan, 2026-09-13: *"i clicked on Start
    // Here play at the end of the home page tour and i got a pop up SIO !
    // (Illegal)"*).
    //
    // It read ``/unit/${sio.unit}#${sio.id}``, and both halves of that are
    // wrong now. `/unit/N` is a redirect stub, so it forwarded to
    // `/home?unit=N#SIO-xxx` — and arriving on Home with a `#SIO-` hash is
    // exactly what makes `MapBody` open StopPopup, the pop-up Dan retired on
    // 7 Sep (*"WE ARE STILL SEEING THE POPUPS FROM CLICKING THE MAP, WHERE ARE
    // THE FULL PAGED SIOS"*). So the last thing the first-run tour did was
    // demonstrate the one interaction he had removed.
    //
    // `/sio/<id>` is the full goal page, and it is what the map's own stops
    // have opened since 7 Sep — the tour now ends where tapping a stop ends.
    //
    // AND THE FALLBACK WAS THE WELCOME PAGE. A bare "/" stopped meaning Home
    // on 9 Sep (src/lib/routes.ts). With no computable stop this sent a
    // first-run learner back out to the front door at the end of their tour.
    const sio = SIOS.find((x) => x.id === continueSioId(loadProgress()));
    const href = sio ? `/sio/${sio.id}` : HOME_HREF;
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

  /**
   * THE HOLES — one per control this step lights.
   *
   * The dim used to be FOUR STRIPS drawn around a single hole, which is a neat
   * trick and cannot be made to do two: four rectangles can only ever leave one
   * gap. With Home's step lighting both the ▶ key and the stop on the road, it
   * becomes one sheet with the holes CUT OUT of it, via an SVG mask — white
   * where the sheet shows, black where it does not.
   *
   * What the strips bought was that the hole stayed clickable, and that is kept
   * a different way: the sheet is `pointer-events: none` and each hole gets its
   * own catcher. So the learner can still press what is lit, and the rest of
   * the page is as unreachable as before — the catcher swallows the tap rather
   * than letting the control fire, which is what stops a tour step navigating
   * away mid-tour.
   */
  const holes = rects.map((r) => ({
    top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12,
  }));
  // The caption is placed against the FIRST box, which is the step's main
  // target — selectors are read in document order, so on Home that is the ▶ key
  // rather than whichever stop the road happens to be showing.
  const rect = rects[0] ?? null;
  // PORTALED to <body> and z-[100] (2026-08-24): the overlay used to render
  // inside the page tree at z-[80] while the bottom bar is fixed at z-90 —
  // so on any step whose bubble landed low, the bar covered the buttons and
  // ATE the Next tap (the flow walk reproduced it landing on the Skills
  // tab). From the body at z-100 the overlay and its bubble sit in the root
  // stacking context above the bar (90) whatever context the page creates.
  return createPortal(
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: "none" }}>
      {holes.length ? (
        <>
          {/* ONE SHEET, WITH THE HOLES CUT OUT. `mask` needs its own element
              because a CSS mask on a coloured div is what actually removes the
              paint; the white rect is everything, each black rounded rect is a
              hole. The sheet blocks nothing — see the catchers below. */}
          <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }} aria-hidden>
            <defs>
              <mask id="fluo-tour-holes">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {holes.map((h, n) => (
                  <rect key={n} x={h.left} y={h.top} width={h.width} height={h.height} rx="12" fill="black" />
                ))}
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill={dim} mask="url(#fluo-tour-holes)" />
          </svg>
          {/* BLOCK THE REST OF THE PAGE, as the four strips used to. The sheet
              above only paints; this is what stops a learner wandering off
              mid-tour, and it sits UNDER the catchers so the lit controls stay
              reachable. */}
          <div className="absolute inset-0" style={{ pointerEvents: "auto" }} />
          {holes.map((h, n) => (
            <div
              key={n}
              className="absolute rounded-xl border-4 transition-all duration-300"
              style={{ ...h, borderColor: "var(--cahier-hl, #eaff00)", pointerEvents: "none" }}
            />
          ))}
          {/* tap steps: an invisible catcher advances on the tap itself —
              without navigating away mid-tour. One per hole, so lighting two
              controls means either of them advances the step: they are the
              same idea, so pressing either IS doing what the step asked. */}
          {s.action === "tap" && holes.map((h, n) => (
            <div key={n} className="absolute cursor-pointer" style={{ ...h, pointerEvents: "auto" }} onClick={goNext} />
          ))}
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
