"use client";

/**
 * The page a game opens on, before it starts.
 *
 * Dan, 2026-08-29: "Even if they do not have 50-stop list, it should still
 * have a landing page before the game begins, e.g. for settings and so on" —
 * after noticing that NumBus and NumBourse were the only two activities in
 * the app with NO coloured strip at all, because both dropped the learner
 * straight into a GameFrame.
 *
 * THIS REVERSES A PATCH-23 DECISION, deliberately and on Dan's word. That
 * patch put the NumBus setup step inside the game frame — "one ✕, one ⋯, no
 * page header" — so the form wore the game's chrome rather than the site's.
 * The cost was that the step had no identity: nothing on screen said NumBus,
 * and the activity was unreachable from the flap rail while you were in it.
 * A settings step is a PAGE, not a frame of the game.
 *
 * It is deliberately thin. It supplies the shell (so the band names the
 * activity and the rail is there), the name, the emoji and the blurb — all
 * from the registry, never retyped — and hands the rest to the game, which
 * knows its own settings. Compare GameGallery, which is the same idea for a
 * game whose pre-start choice is WHICH SET; this one is for a game whose
 * pre-start choice is HOW, or simply "ready?".
 */
import CahierShell from "@/components/CahierShell";
import { activity } from "@/content/activities";

export default function GameLanding({
  activityKey,
  bleed,
  children,
}: {
  /** Registry key — also CahierShell's `active`, which is what makes the
   *  band name this activity instead of a unit. */
  activityKey: string;
  /**
   * Let the child span the page's full text column instead of the landing's
   * reading width. A PLAYING game wants every pixel: measured on a 390px
   * phone, the landing's `max-w-3xl px-4` left the board 265px of 390 — 68%
   * of the screen, with the game squeezed to make room for a margin nobody
   * reads. A settings step still wants the reading width, so this is opt-in.
   */
  bleed?: boolean;
  children: React.ReactNode;
}) {
  const a = activity(activityKey);
  return (
    <CahierShell active={activityKey}>
      <div className={`mx-auto w-full ${bleed ? "max-w-5xl px-0 pb-8 pt-2 sm:px-4" : "max-w-3xl px-4 pb-24 pt-4"}`}>
        {/* A PLAYING GAME HAS NO HEADER — the litmus test, measured. The
            heading band sits directly above this, already reading
            VOCABULARAIN in the activity's own colour; the header repeated the
            name and the blurb one line below it, and cost 98px of a 390px
            phone. On a 844px-tall phone that was the difference between a
            565px board and a 663px one, which is where VocabulaRain's four
            puddles stopped fitting. Removing it does not stop a learner
            finding anything: the band names the activity and the game is the
            thing they came for.

            A SETTINGS STEP KEEPS ITS HEADING. That page is text — a form, a
            choice of level — and text wants a title. The band is a strip, not
            a page heading, and NumBus's setup with nothing above it read as a
            form floating in a page. */}
        {!bleed && (
          <header className="mb-4 flex items-start gap-3">
            <span className="text-4xl leading-none" aria-hidden>{a?.emoji}</span>
            <div className="min-w-0">
              <h1 className="cahier-hand text-3xl leading-none text-[color:var(--cahier-ink)]">
                {a?.name ?? activityKey}
              </h1>
              {a?.blurb && (
                <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">{a.blurb}</p>
              )}
            </div>
          </header>
        )}
        {children}
      </div>
    </CahierShell>
  );
}
