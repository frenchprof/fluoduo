"use client";

/**
 * /tutor/embed — ChaTutor, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. `/tutor` is the page a learner opens; this is
 * what runs in the frame it holds.
 *
 * ── IT USED TO DRAW A SECOND NOTEBOOK (Dan, 2026-09-11: *"Profiles, ChaTutor
 *    page looks doubleframed"*) ────────────────────────────────────────────
 *
 * This file rendered `CahierShell` — the notebook — while already being loaded
 * INSIDE a `CahierShell`. `html[data-embed]` (globals.css) hides the shell's
 * FURNITURE in a framed document (site bar, band, coils, shadow, radius, family
 * spine), and that was taken for "nothing is left". Two things were left, and
 * they are the two that make a sheet look like a sheet: `.cahier-page`'s paper
 * and its 32px ruling, and `.cahier-foolscap`'s 28px ruling. So a SECOND sheet
 * was laid on the page's own, starting 48px in from the left — the well's
 * gutter, where the coils are — and the join showed: measured on the built app
 * at 390px, the ruled lines in that 48px strip sit at one height and the ones
 * inside the frame at another, and some stop dead at the frame's edge.
 *
 * `/map/embed` is the shape that was already right: it renders the map and no
 * notebook. This renders the panel and no notebook. The frame is transparent
 * (`html[data-embed] body`, globals.css) so the page's ONE sheet — paper,
 * ruling and all — runs straight through it.
 *
 * THE PADDING IS NOT DECORATION: it replaces what the shell's own well gave
 * this content — `html[data-embed] .cahier-foolscap`'s 0.75rem sides and the
 * well's 1.25rem top and bottom — so nothing moves but the paper.
 *
 * `touch-pan-y` and the full frame height are the shell's too: the first
 * leaves the sideways drag to the swipe rail (components/useRailSwipe.ts), the
 * second means a short conversation still fills the frame rather than ending
 * in a dead strip.
 */
/**
 * 🤖 Le Tuteur — the chat itself lives in components/tools/ChaTutorPanel (5 Sep,
 * AMBIENT TOOLS extraction) so the 🛠️ in-exercise card can mount the same
 * panel; this passes no context.
 *
 * Sign-in wall (Dan, 2026-07-13: close the cost exposure — every tutor turn
 * spends API credits, so no anonymous chats). The wall guards ONLY the chat
 * (audit 2026-07-19), and the compact gate sits where the conversation will
 * appear.
 */
import AuthGate from "@/components/AuthGate";
import ChaTutorPanel from "@/components/tools/ChaTutorPanel";

export default function TutorEmbedPage() {
  return (
    /* FULL HEIGHT, NOT MIN-HEIGHT. The panel is a messenger now (2026-09-13)
       and a messenger's thread scrolls inside itself so the composer stays put
       — which only works if something above it has a height to give. `min-h`
       gives a floor and no ceiling, so the panel would have grown with the
       conversation and pushed the composer off the bottom exactly as before. */
    /* THE LEFT INSET CLEARS THE COILS, AND IT IS MEASURED. Every framed
       station's iframe starts at page-x 19 while the cahier's coil strip runs
       to page-x 57 — so 38px of every embed is drawn UNDER the rings. That is
       app-wide and predates this file; it never showed because the stations put
       a bordered, padded card inside the frame and the card's own inset
       absorbed it. A messenger has no card: bubbles, avatars and the composer's
       first key all sit on the frame's edge, and at px-3 the autoSpeak key came
       out 18px under the rings — a control you cannot fully press. `pl-10` is
       40px, which is the 38 plus a hair. */
    <div className="touch-pan-y flex h-dvh flex-col py-5 pl-10 pr-3">
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-3 pb-5 pt-2">
        {/* The h1 + tagline live in the shell's heading band (variant A,
            2026-08-23) — the tagline fell to the litmus rule. That band is the
            PAGE's, out here, and always was in a frame. */}
        <AuthGate what="talk to the tutor" compact>
          <ChaTutorPanel />
        </AuthGate>
      </div>
    </div>
  );
}
