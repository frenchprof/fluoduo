"use client";

/**
 * THE PRE-HOME LANDING PAGE — the door, not the dashboard.
 *
 * Dan asked for this over 7–8 Sep, and then narrowed it twice, which is the
 * whole design:
 *
 *   "It will be used as a pre-home page landing page… The question is what
 *    are the items on this purposefully bare page"
 *   "But the map, that was the real showcase that we must include here"
 *   "the image should zoom out to show the calming horizon and inviting
 *    beckoning journey"
 *   "can the map fill the screen such that the night sky could serve as
 *    background for the top nav"
 *   "then we reduce the load of the blurred mirror: All we wanted was Start
 *    my journey now on the glass… You are COMPLETELY blocking the view of my
 *    winding road horizon, which is the WHOLE POINT of this page… Welcome to
 *    FluOLinGO can move into the dark sky space"
 *
 * So THE PAGE IS THE MAP. Not a hero with a map beside it, not a map behind
 * frosted glass: the 3D scene fills the viewport edge to edge, and everything
 * else is placed where it does not stand in front of the road.
 *
 *   the sky, top third        the mark, and one line that spells the name
 *   the horizon               NOTHING. This is the view.
 *   the near ground, bottom   one glass pill: « Start now »
 *
 * THE GLASS IS ONE PILL, NOT A PANEL. The first build put the words on a
 * frosted sheet across the middle and Dan's answer was that it blocked the
 * only thing the page exists to show. What blurs now is a button-sized piece
 * of the ground under the CTA, low in the frame, where there is no horizon to
 * lose.
 *
 * IT KNOWS WHAT TIME IT IS, because the scene does. `nightness(hour)` drives
 * the sky, and since 8 Sep it drives the map's own label plates too; the
 * headline over that sky reads the same number, so the page is one piece of
 * weather rather than a light caption pasted on a dark photograph. Practical
 * consequence, measured: the sky's top band is dark at every hour of the 24
 * EXCEPT dawn, where it is rgb(192,80,42) — white on that is 4.75:1, enough
 * for display type and thin for anything smaller. Hence the scrim, which is
 * confined to the top 30% (the horizon sits at 34%) and fades to nothing well
 * above it: the sky it darkens is sky the road was never in.
 *
 * WHAT IS NOT ON THIS PAGE, deliberately. No stat row, no feature list, no
 * screenshots of the activities, no second CTA — and, since 8 Sep, no second
 * line of prose either (*"too many words: pls keep it short"*). One line and
 * one button. A landing page has two questions to answer, what is this and how
 * do I start, and each of them now has exactly one answer on screen.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import HomeMap3D from "@/components/HomeMap3D";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent } from "@/lib/economy";
import { clockHour, nightness } from "@/lib/map3d/sky";

/** The four letters the brand is built from: Fluency On Linguistic Goals. */
const CAP = "text-[1.3em] font-black leading-none text-white";

export default function WelcomeBody() {
  // Progress lives in localStorage, which the static export must not read at
  // prerender — a build baked with one learner's ticks would ship them to
  // everyone. Same reason the embed body does this.
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [hour, setHour] = useState(12);
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setProgress(loadProgress());
    const sync = () => setProgress(loadProgress());
    window.addEventListener("fluolingo:progress-updated", sync);
    return () => window.removeEventListener("fluolingo:progress-updated", sync);
  }, []);
  useEffect(() => {
    // The same clock the scene reads, on the same once-a-minute tick, and the
    // same `?hour=` override — so a screenshot of this page at 23:00 has a
    // night sky AND night type, instead of one of each.
    const tick = () => setHour(clockHour(window.location.search));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const night = nightness(hour);
  const activeId = nextSioId(progress);

  return (
    // .fluo-embed hides FluOLinGo's own furniture — footer, feedback button,
    // beta notice, install prompt. A door has no chrome (globals.css).
    // 100dvh, not 100vh: on a phone the browser's own bars come and go, and
    // vh is measured against the TALLEST state, so a vh page hides its own
    // bottom — which here is the CTA — behind the address bar on arrival.
    <main className="fluo-embed relative h-[100dvh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <HomeMap3D
          progress={progress}
          activeId={activeId}
          accent={equippedAccent(progress)}
          fill
        />
      </div>

      {/* The scrim: the top 30% only, and gone by 30% — the horizon is at 34%
          and the road runs below it. This exists for one hour of the day
          (dawn, where the sky's top band is orange) and is invisible for the
          rest. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30%]"
        style={{ background: "linear-gradient(to bottom, rgba(6,8,24,0.55), rgba(6,8,24,0.22) 55%, transparent)" }}
      />

      {/* THE TOP NAV, ON THE SKY (Dan: "the night sky could serve as
          background for the top nav"). It is a mark and nothing else: a link
          back to a page you have not reached yet is not navigation, it is a
          way to leave. */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 px-5 pt-4 sm:px-8 sm:pt-6">
        <span
          className="text-xl font-black tracking-tight text-white/90 sm:text-2xl"
          style={{ fontFamily: "var(--font-fluohand-stack)", textShadow: "0 1px 12px rgba(0,0,0,0.55)" }}
        >
          FluOLinGo
        </span>
      </header>

      {/* THE WELCOME, IN THE SKY. `pointer-events-none` on the whole block so
          a swipe that starts on the headline still travels the road — the
          scene underneath is the page, and text laid over it must not become
          a dead patch of screen. */}
      <div className="pointer-events-none absolute inset-x-0 top-[14%] flex flex-col items-center px-6 text-center sm:top-[13%]">
        {/* THE GREETING, THEN WHAT THE NAME MEANS (Dan, 8 Sep: *"too many
            words: pls keep it short: 'Building your Fluency on Linguistic
            Goals' (make the relevant letters stand out)"*, then *"the Welcome
            to FluOLinGo still has to appear before that line though"*).
            Two lines, and the second is the reason the first is not just a
            greeting: its raised F · O · L · G spell the name directly above it,
            so « FluOLinGo » stops being a word nobody can parse. The two-line
            paragraph of prose this replaced said less in three times the words.
            THE LETTERS ARE RAISED BY SIZE AND WEIGHT, NOT BY COLOUR. A colour
            has to survive a sky that runs from midnight blue through dawn
            orange to noon blue — highlighter yellow reads on three of those and
            vanishes on the fourth. 1.3em at full white against 78% white holds
            at every hour, which is the same reason the label plates switch
            rather than fade.
            THE SKY IS ALSO THE MARGIN, and only as deep as the screen is tall:
            the skyline sits at 29% of the frame, so a phone HELD SIDEWAYS has
            about 113px of it. Measured on the first build at 844×390, a
            two-line promise ran 113–171 — across the horizon and over goals 5
            and 6, the exact thing Dan sent the first design back for. Below
            480px of height both lines shrink to fit that band, and
            verify151 measures it rather than trusting the arithmetic. */}
        <h1
          className="text-[1.75rem] font-black leading-[1.05] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] sm:text-[2.9rem] [@media(max-height:480px)]:text-[1.35rem]"
          style={{ fontFamily: "var(--font-fluohand-stack)" }}
        >
          Welcome to FluOLinGo
        </h1>
        <p
          className="mt-1.5 text-[0.95rem] font-bold leading-[1.15] text-white/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)] sm:mt-2.5 sm:text-[1.55rem] [@media(max-height:480px)]:mt-1 [@media(max-height:480px)]:text-[0.8rem]"
          style={{ fontFamily: "var(--font-fluohand-stack)" }}
        >
          {/* One span per raised letter, and the sentence given once to a
              screen reader — otherwise it reads out four stray characters. */}
          <span aria-hidden>
            Building your{" "}
            <span className={CAP}>F</span>luency{" "}
            <span className={CAP}>o</span>n{" "}
            <span className={CAP}>L</span>inguistic{" "}
            <span className={CAP}>G</span>oals
          </span>
          <span className="sr-only">Building your Fluency on Linguistic Goals</span>
        </p>
      </div>

      {/* THE ONE ACTION, on the one piece of glass. Low in the frame, over
          near ground, so the horizon above it stays whole. Content-sized: a
          button never wears the page's width (the standing rule) — and here
          a full-width bar would also be a wall across the road. */}
      <div className="absolute inset-x-0 bottom-[7%] flex flex-col items-center gap-3 px-6">
        <Link
          href="/"
          // MORE PROMINENT, ON DAN'S INSTRUCTION the same day — bigger type,
          // deeper pill, a stronger border and a lift on hover. Still
          // content-sized: no control wears the page's width, and on this page
          // a full-width bar would be a wall laid across the road.
          // On a phone held sideways the whole page is 390px tall, and the
          // prominent pill measured 96px of it — a lid over the near ground and
          // over goal 1. It keeps its weight and loses its bulk there.
          className="rounded-full border-2 px-10 py-4 text-xl font-black tracking-tight transition hover:-translate-y-0.5 sm:px-12 sm:py-5 sm:text-2xl [@media(max-height:480px)]:px-8 [@media(max-height:480px)]:py-2.5 [@media(max-height:480px)]:text-lg"
          style={{
            // The glass: what is behind the pill blurs, the pill's own words
            // do not. Dan, on the panel version: the CTA should be "crystal
            // clear" while the surface it sits on is translucent.
            backdropFilter: "blur(10px) saturate(1.2)",
            WebkitBackdropFilter: "blur(10px) saturate(1.2)",
            background: night > 0.45 ? "rgba(22,18,34,0.68)" : "rgba(255,255,255,0.78)",
            borderColor: night > 0.45 ? "rgba(255,255,255,0.5)" : "rgba(40,32,26,0.4)",
            color: night > 0.45 ? "var(--cahier-paper)" : "var(--cahier-ink)",
            boxShadow: "0 6px 28px rgba(0,0,0,0.35)",
            // The same 1.2s the map's label plates use, so the whole page
            // turns over together at dusk instead of in two steps.
            transition: "background-color 1.2s ease, color 1.2s ease, border-color 1.2s ease, transform 0.15s ease",
          }}
        >
          Start now
        </Link>
      </div>
    </main>
  );
}
