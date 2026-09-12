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
import Link from "next/link";
import { useEffect, useState } from "react";
import MapBody from "@/app/map/MapBody";
import { SIOS } from "@/content/sios";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { nextSioId, loadBookmark, nextGoalNumber, BOOKMARK_EVENT } from "@/lib/continuer";
import StopBookmark from "@/components/StopBookmark";
import { dueForReview } from "@/lib/reviser";
import { HOME_HREF } from "@/lib/routes";

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
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  // Armed on mount: nothing pops up by default (Dan, 2026-07-14), so the
  // FluOLinGo brand animation plays on a clear stage right away.
  const [heroPlay, setHeroPlay] = useState(false);
  // Once the stroke has played, the ink is pinned by class — engines can
  // drop a finished animation's fill state (Dan, 2026-07-14: "the color
  // disappears right after").
  const [inkDone, setInkDone] = useState(false);
  // The Review button's count — the one destination on Home with a deadline.
  const [dueCount, setDueCount] = useState(0);
  // The learner's own word on where they are (Dan, 2 Sep: wandering "should
  // not force them to resume at that spot"). Null = no word given, compute.
  const [bookmark, setBookmark] = useState<number | null>(null);

  useEffect(() => {
    // Progress, the due-count and the once-per-session hero flag live in
    // local/sessionStorage, which cannot be read during render (the site is
    // statically exported) — this mount effect has to seed that state.
    // Block-disabled: the rule reports only the first setState it meets, and
    // which one that is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    const refresh = () => {
      const p = loadProgress();
      setProgress(p);
      setDueCount(dueForReview(p, Date.now()).length);
    };
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    const readBookmark = () => setBookmark(loadBookmark());
    readBookmark();
    window.addEventListener(BOOKMARK_EVENT, readBookmark);
    // THIS FORWARD IS GONE, AND IT HAD TO GO IN THE SAME CHANGE (12 Sep).
    // It sent `?unit=N` and `#SIO-0XX` on to /map, which was right while /map
    // was the map. /map now forwards HERE, so leaving it would have been a
    // redirect loop: /home?unit=2 -> /map?unit=2 -> /home?unit=2, for ever, on
    // exactly the printed QR codes it was written to protect.
    //
    // Nothing is lost. `MapBody` — which this page now renders — reads both
    // forms itself in its own mount effect: the hash opens that stop, and
    // ?unit=N scrolls its band into view. The deep links are handled one layer
    // down instead of being bounced to another page.

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
    return () => {
      window.removeEventListener("fluolingo:progress-updated", refresh);
      window.removeEventListener(BOOKMARK_EVENT, readBookmark);
    };
  }, []);

  // "Continuer" = the first not-done goal AFTER the furthest « done » (Dan,
  // 2026-07-08: a learner who marked a later step done continues from there)
  // — unless the learner has bookmarked a stop, whose word outranks the
  // computation (Dan, 2 Sep). From state, not loadBookmark(): the first
  // client render must agree with the prerender.
  const activeId = nextSioId(progress, bookmark);
  // The same number the top bar's mark computes, from the same two inputs —
  // so the well below the hero and the bar can never disagree.
  const goalNo = nextGoalNumber(progress, bookmark) ?? null;
  const activeSio = SIOS.find((s) => s.id === activeId);
  // THE STOP AFTER THIS ONE (Dan, 1 Sep: "add a forward button (= Next
  // stop)"). Taken from the map's own order — the SIOS array IS the study path
  // — rather than by adding one to the id. Since 5 Sep the spine happens to be
  // 1-50 with no gaps and no halves (SIO-045A became SIO-045), so `id + 1`
  // would in fact resolve today. It still is not used: the SIOS array is the
  // study path by definition, arithmetic only agrees with it by coincidence,
  // and the last time the two disagreed — a retired 045 and a half-step at
  // 45.5 — this line is what kept the forward key correct.
  // Undefined at the last stop, where the key simply does not render: a
  // forward key that goes nowhere is worse than no forward key.
  const afterSio = activeSio ? SIOS[SIOS.indexOf(activeSio) + 1] : undefined;
  const doneTotal = SIOS.filter((s) => isSioDone(s.id, progress)).length;

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 sm:gap-x-3">
        {/* THE SWITCH IS GONE (Dan, 7 Sep: "on the home page we are seeing
            the wrong map. it should be the tightened 2D" + the Enter-the-map
            CTA). Supersedes 2 Sep's flip-in-place: the postcard is pinned to
            the tight 2D grid, and 2D/3D is chosen where it matters — on /map,
            whose PillSwitch (verify25b/c) is untouched. */}

        {/* THE GOAL COMES DOWN OFF THE BAR, AND SITS IN THE ROW'S LEFT SLOT
            (Dan, 2026-09-12: "yes i do mean to bring down the editable field
            to just above the map", then "yes but on the same row as the
            buttons to the right please").

            THIS SOFTENS HIS OWN 7 SEP RULING, and only on this page. That day
            the stop replaced the streak in the TOP BAR — "the stop info (and
            make that editable) at the top right ... so we free up the space
            between the play rewind etc buttons at the hero" — and it still
            rides the other 27 surfaces there, where there is no map to sit
            above. What changed is that Home now DRAWS the road: the number and
            the thing it points at belong next to each other, and the top-right
            corner was the furthest point on the screen from the stop it names.
            The space between the keys stays free — this sits beside them, not
            among them.

            THE SLOT WAS ALREADY SHAPED FOR IT. This replaces the empty `<div/>`
            that held the left end of the `justify-between` row, and the wrap
            note below was written for a well exactly here: at 320px the row
            wraps and "the well takes the first line and the keys the second".

            `SiteTopBar` hides its own mark on Home rather than this page
            drawing a second one — one reading must never appear twice on a
            screen. It is the SAME `StopBookmark` the bar carries, so typing a
            number here bookmarks the stop and every other surface hears it
            through BOOKMARK_EVENT: a second door onto one value, not a copy. */}
        {goalNo === null ? (
          <div />
        ) : (
          <div className="home-goal">
            <span aria-hidden className="home-goal-target">🎯</span>
            <span
              className="neo-well home-goal-well rounded-xl"
              title={`Your goal, ${goalNo}/50 — edit the number to bookmark a stop`}
            >
              <span className="fluo-mono home-goal-digits">
                <StopBookmark stopNo={goalNo} totalClassName="hidden" />
              </span>
            </span>
          </div>
        )}

        {/* FOUR pillows since Dan's Next-stop key (1 Sep). The FILL is the
            dopamine role; the depth is the affordance. Rewind sinks to a flat
            well when nothing is due.

            THE FOURTH KEY COST THE ROW ITS FIT, and this is the repair.
            Measured: the group is 4 keys + 3 gaps, and the row has 232px at
            320px wide, 271 at 360 and 300 at 390. At 50px each the group was
            224px, which left the `1/50` well 8px of a 64px box — it was drawn
            UNDER the keys at both 320 and 360, and only 390 escaped by 0.3px.
            Nobody would have caught that from a 390px screenshot.
            44px below sm (still the 44px touch-target floor) with a 6px gap
            makes the group 194px, which fits 360.

            AND IT NO LONGER WRAPS AT 320 (Dan, 2026-09-12, sent the wrapped
            phone back: "i don'T want them on separate lines. you have to
            squeeze them into the same row"). The earlier note here concluded
            320 could not hold both and let the row break — the goal well on
            one line, the keys on the next. Measured, it was short by FIVE
            pixels: 231px of row against 88 (well) + 8 (gap) + 140 (keys).

            The well gives, not the keys: they are at the touch-target floor
            and shrinking them trades a wrap for a missed tap. How it gives is
            `.home-goal` in globals.css — ONE fluid size off `--fs-step`, which
            is zero on a phone and opens on a desktop, with the padding and gap
            in `em` so they follow it. No pixel is named here and there is no
            `sm:` swap to keep in step with anything (Dan, same day: "PLEASE
            NEVER EVER HARD CODE FONT SIZES AND BUTTON SIZES !!!"). */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* The squeezed counter well (pre-tests' build of Dan's earlier
              "squeeze the 1/50 in between" instruction) came out at the QC
              merge: the editable stop rides the TOP BAR now (StopMark), and
              two writable copies of one bookmark is the drift the single
              component exists to prevent. */}
          {/* THE COURSE ENDS; THE FRENCH DOESN'T (Dan, 7 Sep — from the
              retention read). At 50/50 nextSioId returns undefined and this
              key used to simply vanish: the app's loudest door closed on the
              day a learner finished. Diplome is a real ending — LAF1201 is a
              semester course — so Continue does not pretend there is a 51st
              goal; it points at revision, which spaced repetition makes the
              genuine forever-game: words keep coming due for as long as you
              want to keep them. Same key, same win hue — it is still the
              journey — with the graduation cap saying why it moved. */}
          {!activeSio && doneTotal >= SIOS.length && (
            <Link
              href="/reviser"
              aria-label="Diplômé — all 50 goals done. The course ends; the French doesn't: keep it alive in revision"
              title="Diplômé ! All 50 goals done — the course ends; the French doesn't. Revision keeps every word coming back."
              className="neo-key home-key grid place-items-center"
              style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-win) 55%, white) 0%, var(--dopa-win) 52%, color-mix(in oklab, var(--dopa-win) 70%, black) 100%)" }}
            >
              <span aria-hidden className="text-[1.5rem] leading-none sm:text-[1.75rem]">🎓</span>
            </Link>
          )}
          {/* THESE THREE KEYS STAY BARE. DO NOT LABEL THEM (Dan, 2026-09-11).
              A session working on the first-run tours noticed that ▶ ⏭ ⏪ carry
              their meaning only in a `title` — which a phone has no hover to
              show — and put four options to Dan on the real page: as-is, a
              caption under ▶, ▶ widened into a « Continue » pill, and the same
              pill naming the goal. His answer: *"i would say to leave it
              alone. i don't think it is very nice."*

              So the row is a decision, not an oversight, and the reasoning for
              labelling it is recorded here only so the next session does not
              spend an afternoon rediscovering it and shipping the pill. The
              transport bar is the app's character — the same judgement that
              kept « Unité 3 » and « Débutant » in French: nobody is STUCK, the
              glow marks the hero, and the home tour's first step says what ▶
              is for on the one run where a learner needs telling. */}
          {activeSio && (
            <Link
              href={`${HOME_HREF}?unit=${activeSio.unit}#${activeSio.id}`}
              aria-label={`Continue — ${activeSio.topic}, your goal on the study path`}
              title={`Continue — « ${activeSio.topic} », your goal on the study path`}
              /* data-tour: the home tour's first step. NOT a visual change —
                 this is the anchor, and it replaces `a[title^="Continue"]`,
                 which hung the tour off a sentence of prose: reword the
                 tooltip and the step silently points at nothing. verify44
                 requires every tour step to name a data-tour hook for exactly
                 that reason. */
              data-tour="continue"
              className={`neo-key home-key grid place-items-center${doneTotal === 0 ? " fluo-play-halo" : ""}`}
              style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-win) 55%, white) 0%, var(--dopa-win) 52%, color-mix(in oklab, var(--dopa-win) 70%, black) 100%)" }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
                <path d="M6 3.5 L22 13 L6 22.5 Z" fill="var(--key-ink-win)" stroke="var(--key-ink-win)" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          {/* NEXT STOP — beside Continue, as Dan drew it. DRAWN, not typed:
              verify25's rule is that a typed ⏭/▶ sits inline with text and
              reads as "this will speak", while a drawn key in a coloured
              pillow is navigation. So it is a triangle and a bar — skip-next,
              not fast-forward, which is what two triangles would say and which
              Rewind's two triangles already say in mirror.

              It wears the same win hue as Continue but at the flatter end of
              the gradient: they are the same journey, and the near one has to
              stay the brighter of the two or the row grows a second hero. */}
          {afterSio && (
            <Link
              href={`${HOME_HREF}?unit=${afterSio.unit}#${afterSio.id}`}
              aria-label={`Next goal — ${afterSio.topic}`}
              title={`Next goal — « ${afterSio.topic} »`}
              className="neo-key home-key grid place-items-center"
              style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-win) 34%, white) 0%, color-mix(in oklab, var(--dopa-win) 72%, white) 52%, color-mix(in oklab, var(--dopa-win) 55%, black) 100%)" }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
                <path d="M5 4.5 L17.5 13 L5 21.5 Z" fill="var(--key-ink-win)" stroke="var(--key-ink-win)" strokeWidth="2.4" strokeLinejoin="round" />
                <rect x="19" y="4.5" width="3.2" height="17" rx="1.3" fill="var(--key-ink-win)" />
              </svg>
            </Link>
          )}
          {dueCount > 0 ? (
            <Link
              href="/reviser"
              aria-label={`Rewind — ${dueCount} to repeat`}
              title="Rewind — repeat the words you missed"
              className="neo-key home-key relative grid place-items-center"
              style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-focus) 55%, white) 0%, var(--dopa-focus) 52%, color-mix(in oklab, var(--dopa-focus) 70%, black) 100%)" }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
                <path d="M12.5 6.5 L12.5 19.5 L3.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M22.5 6.5 L22.5 19.5 L13.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
              </svg>
              <span className="fluo-mono absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white [font-variant-numeric:tabular-nums]"
                    style={{ background: "var(--cahier-ink)" }}>
                {dueCount}
              </span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              title="Rewind — nothing waiting to be repeated"
              className="neo-key home-key grid place-items-center"
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden style={{ opacity: 0.4 }}>
                <path d="M12.5 6.5 L12.5 19.5 L3.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M22.5 6.5 L22.5 19.5 L13.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          {/* THE RED ▦ KEY IS GONE (Dan, 7 Sep: "we can now remove the red
              button above the map") — the ☰ grid menu lists every activity
              now, so the goal-activities sheet lost its door and retires
              with it. */}
        </div>
      </div>

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
      <section aria-label="Course map" className="mt-5">
        <div className="relative" style={{ touchAction: "pan-y" }}>
          <MapBody />
        </div>
      </section>
      </div>
    </>
  );
}

