"use client";

/**
 * The Home page body — SOFT 3D (Dan's draft, 2026-08-26).
 *
 * Two surfaces do all the work of the old card: the two readings are WELLS
 * pressed into the paper, the three actions are PILLOWS standing out of it,
 * and pressing one sinks it into its own well. Light falls from the top left
 * throughout. No borders anywhere — depth carries the affordance, so nothing
 * needs a label to say it is pressable.
 *
 * What the draft removed and why: the card around the greeting (the welcome
 * is a strip now, edge to edge in the four dopamine hues), and the ruler —
 * "the map already shows where you are; a second progress line was saying it
 * twice."
 *
 * STOP BEFORE ACTIVITY (Dan, same day): "one must first choose the stop
 * before they can access the activity." The nine-square key therefore opens
 * the activities OF THE CURRENT STOP (StopSheet), not the old twenty-tile
 * Menu — which asked "which activity?" before the learner had been asked
 * "which stop?", and then had to ask again.
 *
 * THE MAP BELOW IS THE REAL ONE (Dan, 9 Sep: "Home, and put the 3D map on
 * it" / "not the postcard pls" / "please throw that postcard away forever").
 * The 3D scene at its own height, wired to `onOpenSio` — tap stop 7 and you
 * are at stop 7's page. What used to sit here was a matted, inert 2D crop
 * under a dead « Enter the map » band; that mode has been deleted from
 * HomeMap.tsx as well, so there is nothing left to revive.
 *
 * /map still owns the zoom, the legend and the 2D view.
 */
import { useEffect, useState } from "react";
import MapBody from "@/app/map/MapBody";

/** « par Dr Chan » as pen strokes, in writing order (stem before bowl, the
 *  way a hand actually writes print letters). Baseline y=25, x-height 13,
 *  ascenders 6, descender 32; the italic slant comes from the group skew. */
const BYLINE_STROKES = [
  // p
  "M4,13.5 L4,32",
  "M4,15.5 C6,12.5 12,12.5 12,18.5 C12,24.5 6,24.5 4,21.5",
  // a
  "M23,15 C19,12 15,14.5 15,19 C15,23.5 19,26 23,22.5",
  "M23.5,13.5 L23.5,25",
  // r
  "M30,13.5 L30,25",
  "M30,18 C31,14 34,12.5 36.5,14",
  // D
  "M45,6 L45,25",
  "M45,6 C56,6 58,12 58,15.5 C58,19 56,25 45,25",
  // r
  "M63,13.5 L63,25",
  "M63,18 C64,14 67,12.5 69.5,14",
  // C
  "M87,9 C80,4.5 76,9 76,15.5 C76,22 80,26.5 87,22",
  // h
  "M92,6 L92,25",
  "M92,17.5 C93,13.5 100,12 100,18 L100,25",
  // a
  "M111,15 C107,12 103,14.5 103,19 C103,23.5 107,26 111,22.5",
  "M111.5,13.5 L111.5,25",
  // n
  "M118,13.5 L118,25",
  "M118,17.5 C119,13.5 126,12 126,18 L126,25",
];


export default function HomeDashboard() {
  // Armed on mount: nothing pops up by default (Dan, 2026-07-14), so the
  // FluOLinGo brand animation plays on a clear stage right away.
  const [heroPlay, setHeroPlay] = useState(false);
  // Once the stroke has played, the ink is pinned by class — engines can
  // drop a finished animation's fill state (Dan, 2026-07-14: "the color
  // disappears right after").
  const [inkDone, setInkDone] = useState(false);

  useEffect(() => {
    // The once-per-session hero flag lives in sessionStorage, which cannot be
    // read during render (the site is statically exported), so this mount
    // effect has to seed it. Block-disabled: the rule reports only the first
    // setState it meets, and which one that is differs between local and CI
    // eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    //
    // The letter-wave + hand-written byline now runs ~3.5 s (compacted from
    // the original 5.5 s when Dan brought it back, 2026-08-11). Play the
    // full show once per browser session; afterwards render the finished
    // look instantly (no .is-play = static letters + written byline;
    // .is-inked pins the highlighter ink).
    try {
      if (window.sessionStorage.getItem("fluolingo:heroPlayed")) {
        setInkDone(true);
      } else {
        window.sessionStorage.setItem("fluolingo:heroPlayed", "1");
        setHeroPlay(true);
      }
    } catch {
      setHeroPlay(true); // storage blocked → just play
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // THE PROGRESS STATE IS GONE, AND SO IS THE /map FORWARD THAT LIVED BESIDE
  // IT (12 Sep). The forward sent `?unit=N` and `#SIO-0XX` on to /map, which
  // was right while /map was the map; /map forwards HERE now, so keeping it
  // would have been a loop — /home?unit=2 -> /map?unit=2 -> /home?unit=2 — on
  // exactly the printed QR codes it was written to protect. `MapBody` reads
  // both forms itself, one layer down.

  // NO STATE LEFT ON THIS PAGE (12 Sep). The hero's control row was the last
  // thing here that read the learner's progress: `progress`, `bookmark`, the
  // `activeId` they computed, and the mount effect and two event listeners
  // that kept them fresh. `MapBody` loads all of it itself — it has to, since
  // it is also the component `/map` framed — so keeping a second copy here
  // would be the same two-copies-of-one-fact that let Home and the map drift
  // apart in the first place. That drift is the whole reason for this branch.

  // WHAT THE HERO STOPPED NEEDING WHEN ITS CONTROL ROW WENT (12 Sep).
  //
  //   goalNo     the 🎯 well's number — the map's own 🧑‍🎓 well carries it now,
  //              and Dan asked for one reading, not two
  //   afterSio   the ⏭ key's destination
  //   doneTotal  the ▶ key's first-run halo
  //
  // `afterSio`'s note is worth keeping even though the line is gone, because
  // it records a real bug it once prevented: the stop after this one came
  // from the SIOS array's own ORDER, never from `id + 1`. The spine happens to
  // be 1-50 with no gaps today, so the arithmetic would agree — it did not
  // when there was a retired 045 and a half-step at 45.5, and agreement by
  // coincidence is what breaks silently when the coincidence ends.
  //
  // `activeId` stays: it is what the map's scene highlights.

  // THE ACCENT AND THE STOP HANDLER LEFT WITH THE BARE SCENE (12 Sep). Both
  // existed only to be passed to `HomeMap3D`; `MapBody` reads the equipped
  // accent itself and carries the identical `router.push('/sio/' + id)`. Kept
  // as props they would have been two copies of one fact, which is how the two
  // map pages drifted apart in the first place.

  return (
    <>
      {/* The REPORT CARD hero (Dan, 2026-08-19: "minimalist, no status bar,
          a bit like a report card but horizontally"; Design's "FluOLinGo Home
          standalone" ref). This REVERSES the 11 Aug hero shrink — Dan's call,
          made from the Design reference twice over.
          What went: the two hairline progress bars ("no status bar") and the
          chip rail. What came back: the « Bienvenue sur FluOLinGo » heading
          with its brand animation and written byline.
          What arrived: one horizontal strip of figures — value over label,
          hairline dividers between — read across like a report card's row of
          marks. Every cell is a progress counter, which Dan's litmus test
          keeps as learner feedback; the labels ARE the text that lets you
          read the figure, so they stay.
          Zeroes are NOT hidden here (the 20 Jul progressive-disclosure rule
          applied to the chip rail, where a zero chip read as a reproach): a
          report card with missing columns reads as broken, and the Design
          ref shows 0% and 0/51 on purpose. Gems stay off the card — a shop
          currency is not a mark; /profil still carries it. */}
      {/* ── the welcome strip ─────────────────────────────────────────
          Edge to edge, no box: the draft took the card off and let the four
          dopamine hues run the full width under the top bar. The heading and
          byline are INK on the strip, so nothing depends on the gradient for
          contrast. The brand animation and the written « par Dr Chan » are
          unchanged — they play once per browser session. */}
      {/* -mt-7 swallows the wrapper's pt-2 (8px) and the foolscap's py-5 top
          (20px) so the gradient meets the paper's top edge — the strip already
          bled sideways, and the band of ruled paper above it said nothing
          (Dan, 2026-08-31: "is this spacing absolutely needed or can it be
          closed up?"). The 10px of desk between the bar and the paper stays:
          that is the notebook, not a gap. */}
      {/* mb-5 -> mb-2.5 and py-3 -> pb-2.5 (Dan, 1 Sep: "close the gap more").
          The 20px under the strip plus the key row's own mb-3 put 32px of
          empty paper between the brand and the first thing a learner can
          press — on the one screen whose whole job is to get them pressing it.
          The strip keeps its top padding: that space is between the top bar
          and the heading, and closing THAT would crowd two pieces of chrome
          into each other. */}
      {/* IT BLEEDS TO THE EDGE NOW (Dan, 1 Sep: "there are pages whose
          horizontal strips don't bleed to the edge (they should)"). The pull
          was `-mx-4`, which claws back 16px — but the content well it sits in
          is padded `pl-12 sm:pl-16` to clear the binding, so the strip stopped
          32px short of the paper on the left while every PageBand on the site
          runs edge to edge. The negative margins now match the well's OWN
          padding exactly, and the same padding is added back inside, so the
          heading has not moved a pixel; only the colour behind it reaches
          further. */}
      {/* FULL WIDTH, TITLE CENTRED (Dan, 12 Sep: *"the Start page to have the
          banner full width and the hero title to be centralised"*). Measured
          before at 1440px: the paper ran x=43 w=1354 and the strip x=293
          w=860 — it bled to the edges of a 768px COLUMN, not of the page,
          because Home's `max-w-3xl` wrapper sat between the well and the
          strip. The strip now renders outside that wrapper (the wrapper
          starts below it, around the keys and the map) so the pull-by-the-
          well's-padding arithmetic verify82 holds reaches the paper itself;
          the heading and the byline sit centred on it. */}
      <section aria-label="Welcome" className="home-strip -ml-12 -mr-4 -mt-7 mb-2.5 pb-2.5 pl-12 pr-4 pt-3 text-center sm:-ml-16 sm:-mr-7 sm:pl-16 sm:pr-7">
        {/* THE HERO IN FLUOLINGO HAND, SIZED TO THE WINDOW (Dan, 1 Sep: "the
            hero to be in FluOLinGo font and resized relative to the width of
            the window"). A clamp, not a breakpoint step: `Bienvenue sur` is
            the longest unbreakable run on the page, so the heading has to grow
            and shrink CONTINUOUSLY with the viewport or it will either wrap at
            360px or sit small at 1024. Measured at the ends — 320px gives
            27px, 1280px is capped at 52px before the line outgrows its band. */}
        {/* THE BYLINE HANGS OFF THE HEADING'S OWN LEFT EDGE (Dan, 2026-09-12:
            "option 2, but make it rely on (left-aligned to) the centred line
            above it", then "make it sit much nearer. the gap is currently too
            big between lines").
            The heading is centred in a full-width strip, so "left" cannot mean
            the strip's left — that would strand « par Dr Chan » out by the
            coils. This wrapper is an inline-block, so it SHRINKS to the
            heading's own line and the strip's text-center still centres it;
            inside, everything aligns left. The byline therefore starts exactly
            where « Bienvenue » starts, at every width, with no measuring. */}
        <div className="inline-block text-left">
        <h1 className="fluo-band-hand font-black leading-[1.05] text-[color:var(--fluo-ink)] text-[clamp(1.7rem,7.4vw,3.25rem)]">
          <span className="whitespace-nowrap">Bienvenue sur</span>{" "}
          <span
            className={`fluo-brand${heroPlay ? " is-play" : ""}${inkDone ? " is-inked" : ""}`}
            aria-label="FluOLinGo"
            onAnimationEnd={(e) => {
              if (e.animationName === "fluo-brand-hl") setInkDone(true);
            }}
          >
            <span aria-hidden>
              {"FluOLinGo".split("").map((ch, i) => (
                <span key={i} className="fluo-brand-letter" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                  {ch}
                </span>
              ))}
            </span>
          </span>
        </h1>
        <svg
          role="img"
          aria-label="par Dr Chan"
          viewBox="0 0 134 36"
          /* WHY THE OLD `mt-2` COULD GO. Centred, the byline landed under the
             brand pill, whose highlighter ink overshoots the letters by 0.18em
             and paints over anything beneath — so it was pushed a step lower
             AND lifted above the pill in stacking order (measured at 1440px:
             byline y=138, pill bottom y=143). Left-aligned it no longer sits
             under the pill at all: the pill is around « FluOLinGo » at the end
             of the line, and the byline now starts under « Bienvenue ». The
             `z-[1]` stays as cheap insurance for the narrow widths where the
             heading wraps and the pill drops onto the byline's own line. */
          className={`fluo-byline relative z-[1] -mt-0.5 h-4 w-auto${heroPlay ? " is-play" : ""}`}
        >
          <g
            transform="translate(4 0) skewX(-8)"
            fill="none"
            stroke="var(--fluo-ink)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {BYLINE_STROKES.map((d, i) => (
              <path key={i} d={d} pathLength={1} style={{ animationDelay: `${2.0 + i * 0.08}s` }} />
            ))}
          </g>
        </svg>
        </div>
      </section>

      {/* THE 3XL COLUMN starts here, not around the strip — see the note on
          the strip above. Everything below keeps the width it had. */}
      <div className="mx-auto max-w-3xl">
      {/* ── two wells, three keys ──────────────────────────────────────
          No card. The readings are pressed IN (read-only by construction —
          no hover, nothing to press), the actions stand OUT. That contrast
          is the whole instruction set. */}
      {/* ROW A IS GONE ENTIRELY (Dan, 7 Sep, in three strokes — two lanes
          heard neighbouring versions the same hour: pre-tests were told
          "squeeze the 1/50 into between 2D and Play", then this session got
          the LATER form — the stop to the TOP BAR, the switch retired, the
          postcard pinned 2D, and finally "remove the name of stop above the
          red pause button". Resolved to the later word at the QC merge;
          the squeeze is recorded here so it is not rebuilt.) */}
      {/* (original note: the 1/50 well
          moved to the TOP BAR as the editable StopMark, and then "pls remove
          the name of stop above the red pause button. we don't need that
          anymore" took the « Next: … » prose with it. Where Continue goes is
          told by the map card below and by Continue's own tooltip — the hero
          holds only the keys now, which is what freeing the space was for.
          (Supersedes the 1 Sep two-row swap; ROW B is the only row left.) */}

      {/* ── ROW B · the controls ─────────────────────────────────────────── */}
      {/* ROW B IS GONE — THE WHOLE TRANSPORT ROW (Dan, 2026-09-12).

          He asked first whether the three keys could go at all: *"is it ok to
          do without the play, forward and rewind buttons (those functions can
          be accessed easily and directly elsewhere on this page, i.e. via the
          map and the editable goalselector field, right?"*, and then, on the
          one that was not obviously covered: *"Rewind = Revise = ErroRevue ==
          they are the same thing"*.

          MEASURED BEFORE REMOVING, because two of the three turned out to be
          WORSE than the map they duplicated. ▶ and ⏭ pointed at
          `/unit/N#SIO-nnn`, which forwarded to `/home?unit=N#SIO-nnn` — and
          opened a StopPopup on the page the learner was already standing on.
          Tapping the glowing stop on the map opens `/sio/[id]`, the full goal
          page Dan asked for on 7 Sep. So the keys were a redirect to a popup
          he had already retired, sitting above the control that does it right.

          ⏪ went to `/reviser`, which is the ☰'s own 🔄 Revise door: the same
          page by a second name, which is Dan's ruling above.

          WHAT WENT WITH THEM, SAID PLAINLY rather than discovered later: the
          due-count badge on ⏪ was the only thing on Home that said how many
          items were waiting. `verify25` called it "the one deadline on Home"
          and now records where it went instead of asserting a key that is
          gone.

          AND THE 🎯 GOAL WELL WENT TOO, because it was the second copy of one
          number: *"there is no need to have the current stop mentioned twice"*.
          The surviving copy is the editable 🧑‍🎓 well in the map's own control
          row — the same `StopBookmark` component, the same value, one reading.
          `SiteTopBar` still hides its mark on Home for the identical reason. */}

      {/* THE « n IN A ROW » COUNTER IS GONE (Dan, 1 Sep: "we don't need that
          actually, please remove it"). It counted stops completed in order from
          SIO-001 and stopped at the first gap — his own 8 July episode-model
          note. What retired it is the 🔥 day streak moving into the top bar
          hours earlier: two numbers of things-in-a-row within a few centimetres
          of each other, one counting DAYS and one counting STOPS, and nothing
          on the screen saying which was which. */}

      {/* THE ROAD ITSELF, ON HOME (Dan, 9 Sep: "Home, and put the 3D map on
          it", then, immediately: *"not the postcard pls"*).

          THE POSTCARD IS STILL RETIRED, and the distinction is the whole of
          this section. What Dan threw out on 8 Sep — *"retire the
          unresponsive 2d map with start here button"* — was a 0.44-zoom crop
          of the 2D GRID under a glassmorphic « Enter the map » band, with a
          stretched link carrying the tap. It read as broken because it WAS
          inert: the band is pointer-events-none by design, so a desktop got
          the words laid across stop 23 and a tap that went nowhere near the
          stop it landed on.

          What is here instead is the real scene at its own height, the same
          component /map draws, with the same `onOpenSio` — tap stop 7 and
          you are at stop 7's page. No crop, no overlay band, no wrapping
          link. `fill` and `still` are both off on purpose: `fill` is for
          /welcome, where the sky has to reach the top of the window, and
          `still` freezes the scene for a page that is showing a PICTURE of
          the map. Home is showing the map.

          verify80 is retargeted with it: it stops asserting "no map on Home"
          and starts asserting "no POSTCARD on Home" — no 2D crop, no view
          switch, no dead CTA band — which is what all three rulings from 1
          to 9 Sep were actually about.

          ── 12 SEP: ONE MAP PAGE, NOT TWO ────────────────────────────────────
          Dan, with /home and /map side by side: *"We have two pages doing the
          same thing: The Home page + The Map. Can we just keep the Bienvenue
          one and move the 3D-2D switch and the zoom control and navigators
          '> Goal', legend there."*

          So this section renders `MapBody` — the whole of what /map was — in
          place of the bare 3D scene. It brings the four things he named with
          it, because it already owned all four; nothing here re-implements a
          switch or a zoom field.

          IT NEEDS NO PROPS, and that is why the merge is this small. MapBody
          loads its own progress, bookmark, accent and saved view, and its stop
          handler is `router.push('/sio/' + id)` — character for character the
          `openSio` this page declares above. Two maps that answered a tap
          differently would have made this a rewrite; they never did.

          THE VIEW SWITCH IS BACK ON HOME, WHICH REVERSES THE NOTE ABOVE. That
          is Dan's call and it is the fourth turn this question has taken — see
          verify80's own header, which records the other three. The POSTCARD
          ruling is untouched: what comes back is the real switch over the real
          scene, not a cropped 2D picture under a dead band. */}
      {/* THE REVISION DOOR MOVED INTO THE TOP BAR (Dan, 2026-09-14: "can you
          move it to the top of the page between the menu burger and buttons,
          in the middle"). It stood here, under the hero, until then — see
          components/PathDoor.tsx for why it is a glyph up there and not the
          sentence it was down here. */}

      <section aria-label="Course map" className="mt-5">
        <div className="relative" style={{ touchAction: "pan-y" }}>
          <MapBody />
        </div>
      </section>
      </div>
    </>
  );
}

