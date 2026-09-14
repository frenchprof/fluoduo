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
import { sioHref } from "@/lib/routes";
import { goalNumber, stopForDeck } from "@/lib/stopTag";
import { activity } from "@/content/activities";

export default function GameLanding({
  activityKey,
  title,
  bleed,
  deck,
  exitHref,
  children,
}: {
  /** Registry key — also CahierShell's `active`, which is what makes the
   *  band name this activity instead of a unit. */
  activityKey: string;
  /** The name for the band, where the key has no registry row. NumBus and
   *  NumBourse are both real pages with no row of their own — Dan parked them
   *  under a Numbers hub on 31 Aug ("park NumBus / NumBourse under a hub-tab
   *  Numbers") and the rows went with the tiles. Without this the band could
   *  not name them, so it drew nothing and the page opened with no coloured
   *  strip, its own heading printing the raw key: « numbus », lowercase.
   *  (Dan, 2026-09-07: pages never lose their coloured strip at the top.) */
  title?: string;
  /**
   * Let the child span the page's full text column instead of the landing's
   * reading width. A PLAYING game wants every pixel: measured on a 390px
   * phone, the landing's `max-w-3xl px-4` left the board 265px of 390 — 68%
   * of the screen, with the game squeezed to make room for a margin nobody
   * reads. A settings step still wants the reading width, so this is opt-in.
   */
  bleed?: boolean;
  /** The deck this game was opened for, when it was opened for one.
   *
   *  THE ✕ GOES BACK TO THE STOP, NOT THE MAP (Dan, 2026-09-13: *"when one
   *  chooses to close any activity, it must take the learner back to that 🎯
   *  page, NOT to the map"*, because *"with the latter they would have to
   *  select the stop that they have not completed again, it is a hassle"*).
   *  The drills get this from `drillExitHref`; a game has no DrillShell, so
   *  the deck comes in here and the same rule is applied in one place rather
   *  than in each of the seven callers.
   *
   *  Optional because two games are not opened for a deck at all: NumBus and
   *  NumBourse are pure number games with no stop behind them. Where they go
   *  instead is `exitHref`, below. */
  deck?: string;
  /**
   * WHERE THE ✕ GOES WHEN THERE IS NO STOP BEHIND THE GAME (Dan, 2026-09-14:
   * *"When closing the X it always goes back to the page where it came from
   * right? Like closing NumBus should back to Numbers where i came from"*).
   *
   * Measured across eighteen surfaces on the built app, every ✕ that is not
   * opened for a deck went to `/home`. On sixteen of them that is right —
   * they are top-level doors off the ☰ and there is nothing above them. The
   * two exceptions are exactly the two Dan named: NumBus and NumBourse have
   * no registry row of their own, because on 31 Aug he parked them under one
   * hub tile (*"park NumBus / NumBourse under a hub-tab Numbers"*). So the
   * page ABOVE them exists — `/games/numbers` — and the ✕ was stepping over
   * it to the map, which is the same hassle the 13 Sep ruling named: you have
   * to find your way back in again.
   *
   * A DECLARED PARENT, NOT THE BROWSER'S HISTORY. Going literally "back"
   * breaks on the three ways a learner really arrives — a deep link, a
   * refresh, and the ☰ menu, which is not a page to return to — and it would
   * undo the 13 Sep ruling, which says the ✕ lands on the 🎯 page even when
   * you came from the map. So the order is: the stop this was opened for,
   * then the page above it, then Home.
   */
  exitHref?: string;
  children: React.ReactNode;
}) {
  const a = activity(activityKey);
  const name = title ?? a?.name;
  const stop = deck ? stopForDeck(deck) : null;
  // The stop wins, then the declared parent; CahierShell supplies Home when
  // neither is given, which is the right answer for a top-level door.
  const out = stop ? sioHref(stop.id) : exitHref;
  const band = name || out
    ? {
        ...(name ? { title: name } : {}),
        ...(out ? { exitHref: out } : {}),
        ...(stop ? { goal: goalNumber(stop) } : {}),
      }
    : undefined;
  return (
    <CahierShell active={activityKey} band={band}>
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
                {/* Never the raw key: /games/numbus printed « numbus » in
                    lowercase for as long as its registry row has been gone. */}
                {name ?? activityKey}
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
