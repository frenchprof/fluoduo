"use client";

/**
 * HOLD THEIR HAND THROUGH THE FIRST GO.
 *
 * Dan, 2026-09-11: *"For each of the activity, can we take users on a
 * step-by-step what needs to be done before they are left on their own? We
 * need to hold their hand and guide them towards completing the task at the
 * first isntance."*
 *
 * WHAT WAS THERE ALREADY, because this is mostly wiring rather than invention.
 * `FirstRunHint` has shown a card of numbered instructions since 2 Sep — you
 * read « 1. Tap the card. 2. Mark it ✓ or ↺ », press « Got it », and you are
 * on your own in front of a screen you have never seen. The steps were the
 * right words in the wrong place: a list of what to do, printed somewhere that
 * is not where you do it.
 *
 * So the same rows now point AT the thing. A step with a `selector` lights its
 * control, says its line beside it, and waits — the tour does not advance until
 * the learner really does it. That last part is the whole difference between a
 * guide and a notice.
 *
 * THE REAL TAP DOES THE REAL THING. The overlay never takes the click: every
 * layer is `pointer-events: none` and the step listens on the control itself.
 * So the learner flips the actual card, the actual card flips, and the step
 * advances because it happened — not because they pressed « Next » on a
 * description of it.
 *
 * A STEP WAITS FOR ITS CONTROL TO EXIST. In a real activity the second control
 * is usually born of the first: MémoiRecall's ✓ / ↺ do not exist until the card
 * is turned over. So each step polls for its target rather than measuring once
 * and giving up — which is also what makes the sequence a sequence instead of
 * three simultaneous labels.
 *
 * IT IS SKIPPABLE AND IT REMEMBERS. « Skip » ends the run; the row's own
 * first-run memory (one key per activity, see FirstRunHint) is what stops it
 * coming back. A guide a learner cannot leave is a cage.
 *
 * ONE HONEST NOTE FOR THE NEXT SESSION. `FirstTour` has an older twin of this
 * engine — spotlight, DO-to-advance — built for PAGE TYPES and mounted by
 * CahierShell. It is not reused here because a drill does not mount
 * CahierShell (that is the same reason `FirstRunHint` exists apart from it),
 * and because folding activities into the page tours would put both behind the
 * tours' single global "never offer again" flag. They should converge once the
 * shape below is settled; until then this file is the newer of two and the
 * duplication is deliberate, not overlooked.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** A step that points at something. `selector` is a real CSS selector against
 *  the live page — the control the learner must actually use. */
export type GuidedStep = { text: string; selector: string };

type Box = { top: number; left: number; width: number; height: number };

/**
 * A BOX IS NOT THE SAME AS BEING ON SCREEN, and both halves of that were found
 * by driving the real app rather than reading it.
 *
 * DrillShell keeps its primary button mounted and `invisible` between
 * questions, so it reports a full 580x52 rect while being unpressable — the
 * tour lit a placeholder and waited for a tap that could never come.
 * GramMarathon renders BOTH a text field and a word bank, one of them
 * `display: none`, and which one is live depends on the width.
 *
 * `visibility`, `display` and `opacity` all still measure, so the rect alone
 * cannot answer this.
 */
function isOnScreen(el: Element): boolean {
  const cs = window.getComputedStyle(el);
  if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return false;
  const r = el.getBoundingClientRect();
  return r.width >= 2 && r.height >= 2;
}

export default function GuidedSteps({ steps, onDone }: { steps: GuidedStep[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const elRef = useRef<Element | null>(null);
  const doneRef = useRef(false);
  /** The step we have already scrolled to, so the guide brings a control into
   *  view once and then leaves the learner's own scrolling alone. */
  const broughtRef = useRef(-1);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  // Find this step's control, and keep its outline on the control as the page
  // moves under it. A control that is not born yet is not an error — it is the
  // next thing the learner is about to create by doing the current step.
  useEffect(() => {
    const step = steps[i];
    if (!step) return;
    let raf = 0;
    const measure = () => {
      // THE FIRST VISIBLE MATCH, NOT THE FIRST MATCH. A control often has two
      // bodies: GramMarathon types above `sm` and offers word-bank tiles below
      // it, and both are in the DOM at once with one `display: none`. A step
      // may therefore name both — `[data-tour="a"], [data-tour="b"]` — and
      // this picks whichever the learner can actually see. Taking
      // querySelector's first match lit nothing at all on a phone.
      const el = [...document.querySelectorAll(step.selector)].find(isOnScreen) ?? null;
      elRef.current = el;
      if (!el) { setBox(null); return; }
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) { setBox(null); return; }

      // BEING IN THE DOCUMENT IS NOT BEING ON THE SCREEN, and this was the
      // second half of that lesson, found the same way as the first — driving
      // MneMemo. Its four tabs SCROLL rather than swap, so every panel stays
      // mounted and measurable while only one is in view. Tapping a tab
      // advanced the walk correctly and then lit a control a screen and a half
      // further down: the learner got a page dimmed edge to edge, a bright hole
      // nowhere, and a caption card positioned off the bottom with it. A guide
      // that dims everything and points at something you cannot see is worse
      // than no guide.
      //
      // So bring it into view — ONCE per step. Repeating it would fight a
      // learner who scrolls away on purpose, which is their right: after this,
      // the outline simply tracks the control wherever they put it.
      const off = r.bottom < 0 || r.top > window.innerHeight
        || r.right < 0 || r.left > window.innerWidth;
      if (off && broughtRef.current !== i) {
        broughtRef.current = i;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        return; // the next poll, 150ms on, measures where it landed
      }

      setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const id = window.setInterval(measure, 150);
    const onMove = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [i, steps]);

  // Advance on the learner's own click, on the control itself — the overlay
  // never takes it, so the real control does the real work and this only notes
  // that it happened.
  useEffect(() => {
    const step = steps[i];
    if (!step) return;
    // CAPTURE, AND AGAINST THE NODE WE LIT — not a fresh lookup on the way
    // back up. Found by driving it: picking a run length made React drop the
    // « How many questions? » block during the same event, so by the time the
    // click bubbled to the document the step's own selector matched nothing
    // and the tour sat on step 1 forever. Capture runs before the control's
    // own handler, while the thing the learner pressed is still on the page.
    const onClick = (e: Event) => {
      const el = elRef.current;
      if (!el || !(e.target instanceof Node) || !el.contains(e.target)) return;
      if (i + 1 >= steps.length) finish();
      else setI(i + 1);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, steps]);

  const step = steps[i];
  if (!step || typeof document === "undefined") return null;

  // The caption goes under the control, unless that would put it off the
  // bottom — then above it. A guide that needs scrolling to read is not one.
  const below = box ? box.top + box.height + 12 : 0;
  const capBelow = box ? below + 120 < window.innerHeight : true;
  // AND WHEREVER IT ENDS UP, IT STAYS ON THE SCREEN. The two placements above
  // are both relative to the control, so a control near either edge — or one
  // being scrolled toward, mid-flight — put the words where they could not be
  // read. The clamp is the backstop the arithmetic cannot provide: the caption
  // is the only part of this that MUST always be legible, because it is the
  // only part that says what to do.
  const capTop = box
    ? Math.min(Math.max(8, capBelow ? below : box.top - 104), Math.max(8, window.innerHeight - 132))
    : null;

  return createPortal(
    // `data-guided-steps` IS FOR THE CHECK, and it is here because the obvious
    // handle was not unique. verify220 first looked for `[aria-live="polite"]`
    // and found ÉcouTexte's own player announcements — « ⏯ play · 🐇🐌 speed »
    // — sitting earlier in the document, so it read a live region that is not
    // this one and reported a working walk as broken. A check that names a
    // shared attribute is testing whatever happens to be first.
    <div data-guided-steps aria-live="polite" className="pointer-events-none fixed inset-0 z-[70]">
      {/* The dimmer, with a hole. One element: the ring's own huge spread IS
          the dim, so the bright patch and the dark rest can never disagree. */}
      {box && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl"
          style={{
            top: box.top - 6,
            left: box.left - 6,
            width: box.width + 12,
            height: box.height + 12,
            boxShadow: "0 0 0 9999px rgba(8,10,24,0.58)",
            outline: "3px solid var(--cahier-gold)",
            outlineOffset: 2,
            transition: "top .18s ease, left .18s ease, width .18s ease, height .18s ease",
          }}
        />
      )}

      <div
        className="pointer-events-none absolute left-1/2 w-[min(22rem,88vw)] -translate-x-1/2 rounded-xl border-2 px-4 py-3 text-center shadow-lg"
        style={{
          top: capTop ?? "38%",
          background: "var(--cahier-paper-raised)",
          borderColor: "var(--cahier-ink)",
          color: "var(--cahier-ink)",
        }}
      >
        <p className="text-[13px] font-black uppercase tracking-[0.09em] text-[color:var(--cahier-ink-soft)]">
          Step {i + 1} of {steps.length}
        </p>
        <p className="mt-1 text-[15px] font-bold leading-snug">{step.text}</p>
        {!box && (
          <p className="mt-1 text-xs text-[color:var(--cahier-ink-soft)]">Finding it…</p>
        )}
        {/* The only thing on this overlay that takes a tap. */}
        <button
          type="button"
          onClick={finish}
          className="pointer-events-auto mt-2 text-xs font-bold underline text-[color:var(--cahier-ink-soft)]"
        >
          Skip
        </button>
      </div>
    </div>,
    document.body,
  );
}
