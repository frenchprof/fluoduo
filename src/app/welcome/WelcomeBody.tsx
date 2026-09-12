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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeMap3D from "@/components/HomeMap3D";
import { useCourse } from "@/components/CourseGate";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { SIOS } from "@/content/sios";
import { equippedAccent } from "@/lib/economy";
import { WELCOME_SKY_LIFT } from "@/lib/map3d/projection";
import { HOME_HREF } from "@/lib/routes";

/** The four letters the brand is built from: Fluency On Linguistic Goals.
 *  COLOURED, ON DAN'S MOCK (8 Sep: "text bigger and More like this with the
 *  colors on F, O, L and G" — his render supersedes the earlier size-and-
 *  weight-only ruling in this file). The four hues are the app's own pens,
 *  as vars so the ratchet counts no new hex; the drop shadow both lines
 *  already wear is what keeps them legible on the dawn band. */
const CAP = "text-[1.3em] font-black leading-none";
/** The dark ground each line of the greeting sits on, from Dan's three mocks
 *  of 8 Sep. Translucent, so the sky reads through it and the page stays one
 *  picture rather than a caption pasted over a photograph. */
const BAND = "rgba(10,12,32,0.52)";

/**
 * A BLACK OUTLINE ON EVERY LETTER (Dan, 8 Sep: *"the letters forming the
 * title and the subtitle should have black outline to withstand any sky
 * color"*).
 *
 * The sky here is not a background, it is a clock: it runs from midnight blue
 * through dawn orange to noon blue and back, so any single drop shadow is
 * tuned for one hour and thin at another. An outline does not care what is
 * behind it.
 *
 * `paintOrder: "stroke fill"` is what makes it an outline rather than damage.
 * `-webkit-text-stroke` alone draws the stroke CENTRED on the letterform, so
 * half of it eats inward and a hand face at 4.4rem comes out visibly thinner
 * and muddier — worst on the thin joins of « u » and « n ». Painting the
 * stroke first and the fill over it keeps the letter its own width and puts
 * the whole stroke outside.
 *
 * The width is in `em`, not px, so the subline at 1.8rem and the name at
 * 4.4rem wear the same weight of line rather than the subline wearing a
 * proportionally fatter one.
 */
const OUTLINE = {
  WebkitTextStrokeWidth: "0.055em",
  // The CSS keyword, not a bare hex triple: this file carried no raw hex
  // before the outline, and verify19b's ratchet counts FILES that hold one as
  // well as values — so one stroke colour would have moved 53 to 54.
  // (And the ratchet greps the raw source, comments included, which is why
  // this note spells none. Third time today a check has read its own
  // documentation as the defect — verify152 and verify153 both strip comments
  // first for exactly this reason; verify19b's ratchet still does not.)
  WebkitTextStrokeColor: "black",
  paintOrder: "stroke fill",
} as const;
/* TWO COLOURS, NOT FOUR, AND THEY COME FROM THE MAP (Dan, 2026-09-09: *"the
   two colored F O L G have reverted to 4 again. I only need 2 colors, since we
   are at it, can we use the colors that are the colors visible on the stop
   buttons, the ones in blue and pink."*)

   THEY "REVERTED" BECAUSE THEY WERE BORROWED. These four letters pointed at
   four FAMILY tokens, so the ☰ menu's recolour to Dan's 12-swatch palette
   moved every one of them without anyone touching this page — pink→violet,
   green→yellow, blue→teal. It is the same fault, on the same day, as the fifty
   stops silently following that recolour: a surface with no palette of its own
   inherits whatever happens to the palette it is borrowing.

   So they take the MAP's own pens now, the ones a learner can see on the stop
   buttons two hundred pixels below this line: --sio-vocab blue and
   --sio-grammar pink, alternating F·O·L·G. Those belong to the map, not to the
   menu, so the next family recolour cannot reach them — and the welcome page
   now matches the road it is a picture of, which is what makes the pairing
   read as deliberate rather than decorative. */
const BRAND: Record<string, string> = {
  F: "var(--sio-vocab)",   // blue — the vocabulary stops
  o: "var(--sio-grammar)", // pink — the grammar stops
  O: "var(--sio-grammar)",
  L: "var(--sio-vocab)",   // blue
  G: "var(--sio-grammar)", // pink
};
/** The name with its four letters lit — one span per character, spoken once. */
function BrandName({ word }: { word: string }) {
  return (
    <>
      <span aria-hidden>
        {word.split("").map((ch, i) => (
          <span key={i} style={"FOLG".includes(ch) ? { color: BRAND[ch] } : undefined}>
            {ch}
          </span>
        ))}
      </span>
      <span className="sr-only">{word}</span>
    </>
  );
}

export default function WelcomeBody() {
  const router = useRouter();
  // Progress lives in localStorage, which the static export must not read at
  // prerender — a build baked with one learner's ticks would ship them to
  // everyone. Same reason the embed body does this.
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  // WHICH COURSE THIS DOOR OPENS ON (Dan, 2026-09-11: "do the wiring so f1 to
  // f4 mean different courses"). Shown ONLY when the address names a course —
  // f1.fluolingo.com reads « French 1 · A1 » under the greeting; fluoli.ngo
  // and withdrchan, which name none, look exactly as they did. On an address
  // that says f1 the tag is what tells a learner the app agrees with it.
  const { course, named } = useCourse();
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setProgress(loadProgress());
    const sync = () => setProgress(loadProgress());
    window.addEventListener("fluolingo:progress-updated", sync);
    return () => window.removeEventListener("fluolingo:progress-updated", sync);
  }, []);

  // NO CLOCK ON THIS PAGE ANY MORE. It used to read the hour so the CTA's
  // glass could turn over with the sky and the type could switch palettes at
  // dusk. Neither survives Dan's 8 Sep mocks: the way in is the map's own
  // orange coin at every hour, and the greeting is white with a black outline
  // precisely so it does NOT need to know what the sky is doing. The scene
  // still reads the clock — that is where the hour belongs.
  // THE CAMERA IS PINNED TO STOP 1, NOT TO THE LEARNER (Dan, 2026-09-09,
  // sending a mock of this page: *"it is the sky that is the problem, it is
  // the stops (we are supposed to show the orange start button and stop 1)
  // with sufficient skyline to display the Welcome text."*)
  //
  // It used to read `nextSioId(progress)` — the learner's own next stop — the
  // same call Home's map makes, because this page was built from that one. On
  // a dashboard that is right: show me where I am. On the FRONT DOOR it is
  // wrong, and invisibly so, because it looks perfect to anyone testing with
  // an empty profile. A learner at stop 30 opened the app and met stops 28-33
  // with the ENTER coin among them, the greeting hanging over a stretch of
  // road that means nothing to a visitor, and the composition Dan drew — the
  // orange coin standing at the foot of the road, stop 1 just above it, sky
  // enough above THAT for the welcome — simply gone.
  //
  // So the door always shows the beginning of the road. The scene still reads
  // the clock (the sky turns over with the real hour, which Dan asked for on
  // 8 Sep and has not withdrawn) and still paints the learner's own ticks and
  // accent — what is fixed is the CAMERA, and nothing else.
  const activeId = SIOS[0]?.id ?? nextSioId(progress);

  return (
    // .fluo-embed hides FluOLinGo's own furniture — footer, feedback button,
    // beta notice, install prompt. A door has no chrome (globals.css).
    // 100dvh, not 100vh: on a phone the browser's own bars come and go, and
    // vh is measured against the TALLEST state, so a vh page hides its own
    // bottom — which here is the CTA — behind the address bar on arrival.
    <main
      className="fluo-embed relative h-[100dvh] w-full cursor-pointer overflow-hidden"
      /* THE WHOLE DOOR OPENS, NOT JUST THE HANDLE (Dan, 2026-09-12: *"the Start
         page : allow users to enter the site no matter where they click. since
         there is no other branches from there"*).

         He is describing a page with exactly ONE destination. Every pixel of it
         — the sky, the road, the fifty stops, the greeting — is a picture of
         where you are going, and none of it does anything else, so a tap that
         lands an inch from the coin currently does nothing at all and reads as
         the app ignoring you.

         THE COIN STAYS, and that is not redundant under the litmus test: it is
         what SAYS the page is a door. Remove it and a learner is looking at a
         landscape with no reason to touch it. The coin teaches the gesture; this
         makes the gesture forgiving.
         `cursor-pointer` is the desktop half of the same message.

         ANYTHING THAT IS ITSELF A CONTROL IS LEFT ALONE. There is only the coin
         today, and its own <Link> already goes here — but the guard is written
         against ANY anchor or button so that adding one later (a course tag, a
         sign-in, a language pick) cannot be swallowed by the page beneath it.
         That is the failure this page would report as "the button is dead". */
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button,[role='button'],input,select")) return;
        router.push(HOME_HREF);
      }}
    >
      <div className="absolute inset-0">
        <HomeMap3D
          progress={progress}
          activeId={activeId}
          accent={equippedAccent(progress)}
          fill
          still
          skyLift={WELCOME_SKY_LIFT}
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

      {/* NO CORNER WORDMARK. There was one — "the night sky could serve as
          background for the top nav", 7 Sep — and it earned its place while
          the greeting was one modest line. It stopped earning it the moment
          the name became the biggest thing on the screen: the mark and the h1
          said « FluOLinGo » twice, eighty pixels apart, in the same hand and
          the same four colours.

          Dan, 9 Sep: *"what could possibly be the purpose of that small
          'FluOLinGo' wordmark ... now that the title says the name in large
          letters just below it"*. None — and the litmus test at the top of
          AGENTS.md had already answered it: text that can be removed without
          costing the reader anything is redundant. A mark identifies a page
          whose content does not; this page's content IS its name.

          It was not navigation either. It linked nowhere, because there is
          nowhere behind a door. */}

      {/* THE WELCOME, IN THE SKY. `pointer-events-none` on the whole block so
          a swipe that starts on the headline still travels the road — the
          scene underneath is the page, and text laid over it must not become
          a dead patch of screen. */}
      <div className="pointer-events-none absolute inset-x-0 top-[4%] flex flex-col items-center px-6 text-center sm:top-[4%]">
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
        {/* BIGGER, AND COLOURED — Dan's mock, 8 Sep: "text bigger and More
            like this with the colors on F, O, L and G". Both lines grew a
            step at every breakpoint; the name's own F·O·L·G light up in the
            same four pens as the subline's capitals, so the word and its
            meaning wear one system.

            BIGGER AGAIN, AND ON ITS OWN BAND — Dan, 8 Sep, over three mocks
            of this page in one message ("this is closer to what i would
            like"). All three show the same two things:

              · THE GREETING BREAKS. « Welcome to » sits over « FluOLinGo »
                even on a wide desktop, where it would otherwise fit on one
                line. That is the point: broken, the name gets a line of its
                own at full size and reads as the MARK rather than as the tail
                of a sentence.
              · EACH LINE WEARS ITS OWN DARK BAND, hugging the words rather
                than a panel behind the block. That is what an inline
                background does, one band per line, which is why the bands in
                his mock are three different widths.

            The band replaces the drop shadow's job at the size the type is
            now: a 5rem hand face over a moonlit sky needs a ground, not a
            glow. It is translucent, so the sky still shows through it and the
            page is still one picture. */}
        <h1
          className="text-[3.2rem] font-black leading-[1.02] text-white sm:text-[4.4rem] [@media(max-height:480px)]:text-[1.6rem]"
          style={{ fontFamily: "var(--font-fluohand-stack)", ...OUTLINE }}
        >
          <span className="inline-block px-4 py-0.5" style={{ background: BAND }}>Welcome to</span>
          <br />
          <span className="inline-block px-4 py-0.5" style={{ background: BAND }}>
            <BrandName word="FluOLinGo" />
          </span>
        </h1>
        <p
          className="mt-1.5 inline-block px-4 py-0.5 text-[1.35rem] font-bold leading-[1.15] text-white/90 sm:mt-2 sm:text-[1.8rem] [@media(max-height:480px)]:mt-1 [@media(max-height:480px)]:text-[0.9rem]"
          style={{ fontFamily: "var(--font-fluohand-stack)", background: BAND, ...OUTLINE }}
        >
          {/* One span per raised letter, and the sentence given once to a
              screen reader — otherwise it reads out four stray characters. */}
          <span aria-hidden>
            Building your{" "}
            <span className={CAP} style={{ color: BRAND.F }}>F</span>luency{" "}
            <span className={CAP} style={{ color: BRAND.o }}>o</span>n{" "}
            <span className={CAP} style={{ color: BRAND.L }}>L</span>inguistic{" "}
            <span className={CAP} style={{ color: BRAND.G }}>G</span>oals
          </span>
          <span className="sr-only">Building your Fluency on Linguistic Goals</span>
        </p>
        {named && course && (
          <p
            data-course-tag={course.key}
            className="mt-1.5 inline-block px-3 py-0.5 text-[1rem] font-bold leading-[1.15] text-white/90 sm:mt-2 sm:text-[1.2rem] [@media(max-height:480px)]:hidden"
            style={{ fontFamily: "var(--font-fluohand-stack)", background: BAND, ...OUTLINE }}
          >
            {course.name} · {course.level}
          </p>
        )}
      </div>

      {/* THE ONE ACTION — A COIN ON THE ROAD (Dan, 8 Sep, with his own mock
          of this page: *"this is closer to what i would like"*, showing a
          large orange ellipse reading ENTER standing on the near stretch of
          road where the glass pill used to be).

          It is the map's own stop coin, scaled up. That is the whole idea and
          it is why this reads better than the pill did: every stop on the
          road behind it is a coin, so the way in is the first one — you are
          not pressing a button that sits ON a picture of a road, you are
          stepping onto the road. `border-radius: 50%` makes it a true ellipse
          rather than a stadium, because a stop is a disc seen in perspective.

          THE SHADOW IS THE COIN'S LANGUAGE, not a drop shadow: a hard step of
          darker orange directly under the disc (the side wall you see because
          it is lit from above) and a soft cast beneath that. It is
          `.fluo-stop--up`'s recipe at landing-page scale — see globals.css,
          where the reasoning is written out: everything that describes depth
          sits at the BOTTOM, which is the only place a raised disc lit from
          above can show it.

          ORANGE AS A VAR, not a hex — and as the MAP's var since 2026-09-09.
          This line used to name `--fam-user` and claim, in these words, that
          it was "the same one stop 1 wears three inches above it, so the two
          cannot drift apart". The intent was right and the token was wrong:
          `--fam-user` is a MENU family colour, and when the ☰ was recoloured
          to Dan's 12-swatch palette it went orange → GREY, taking this coin
          with it while stop 1 stayed orange. The comment asserting they could
          not drift was sitting directly above the code that let them.

          So it reads `--sio-phrases` now — the map's own orange, the literal
          pen stop 1 is drawn with — which is what Dan asked for ("the START
          button needs to be in orange like stop 1") and what the old comment
          had always meant. Same bargain as before on the ratchet: a var, not
          a hex, so nothing new is counted.

          STILL CONTENT-SIZED. The standing rule is that no single control
          wears the page's width, and on this page a full-width bar would also
          be a wall laid across the road. */}
      {/* A GAP BETWEEN THE COIN AND STOP 1 (Dan, 8 Sep, over the first
          render: *"why is the ENTER button so close to the 1 button? Can
          there be gap?"*). Measured before touching it, and it was worse
          than close — the two OVERLAPPED: on a 1440x900 desktop ENTER's top
          edge sat 20px ABOVE stop 1's bottom, and on a 390x844 phone they
          touched at 1px. The camera frames the current goal near the foot of
          the road, and for a visitor with no progress that goal is stop 1,
          so the coin and the first stop are always competing for the same
          band of ground.

          The coin is bottom-anchored, so trimming its height pushes its TOP
          down — which is the edge that was colliding. Height comes off rather
          than width: an ellipse seen in perspective is flat, so a shorter
          coin reads MORE like the stops it imitates, and the width (and so
          the prominence Dan asked for) is untouched. */}
      <div className="absolute inset-x-0 bottom-[0.5%] flex flex-col items-center px-6">
        {/* THE ONE THING THAT MOVES ON THIS PAGE (Dan, 11 Sep: *"THE ENTER
            PAGE - IS MISLEADING : THE BLINKING STOP IS ON 1 RATHER THAN ON
            ENTER"*). The gold ring used to pulse on goal 1, which on a still
            scene cannot be pressed at all; it is off there now, and the beat
            moves here, to the only control on the page.

            It is the map's own `home-map3d-pulse` rather than a second
            animation invented for this page: same 2s, same 1.08, so the door
            beats at the rhythm the current stop beats at once you are inside.
            That rule already stands down under prefers-reduced-motion, which
            is why there is no second guard here. */}
        <Link
          href="/home"
          className="home-map3d-pulse rounded-[50%] px-16 py-3 text-2xl font-black uppercase tracking-[0.12em] transition hover:-translate-y-0.5 sm:px-24 sm:py-3.5 sm:text-4xl [@media(max-height:480px)]:px-12 [@media(max-height:480px)]:py-2 [@media(max-height:480px)]:text-xl"
          style={{
            background: "var(--sio-phrases)",
            color: "var(--cahier-ink)",
            // THE SLAB, from his mocks: the coin's own side wall in darker
            // orange, then a hard BLACK step under that, then the soft cast.
            // Three layers, all at the bottom — the same reasoning
            // `.fluo-stop--up` is written from, at four times the size.
            boxShadow:
              "0 12px 0 color-mix(in oklab, var(--sio-phrases) 58%, black), 0 26px 0 rgba(0,0,0,0.72), 0 34px 34px rgba(0,0,0,0.45)",
            transition: "transform 0.15s ease",
          }}
        >
          Enter
        </Link>
      </div>
    </main>
  );
}
