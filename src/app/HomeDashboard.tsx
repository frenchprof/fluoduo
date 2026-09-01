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
 * The Map postcard, matted and inert, still sits below; the COURSE MAP still
 * lives at /map, and the old `/?unit=N#SIO-0XX` deep links are still
 * forwarded so printed QR codes and bookmarks survive.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StopSheet from "@/components/StopSheet";
import HomeMap from "@/components/HomeMap";
import { SIOS } from "@/content/sios";
import { defaultProgress, loadProgress, isSioDone, type Progress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";
import { equippedAccent } from "@/lib/economy";
import { dueForReview } from "@/lib/reviser";
import { loadMapView, mapHref, saveMapView } from "@/lib/mapView";

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
  // Which view the map opens in. NOT session-local any more, and the change is
  // the fix for Dan's "make sure the switch literally takes you the map it
  // promises to" (1 Sep). It used to start at 2D on every visit and its map
  // link carried `?view=2d`, which /map then SAVED — so a learner who had
  // chosen 3D on the map, came Home and went back was silently returned to 2D
  // by a control that looked like it was only reporting the state. It now
  // reads and writes the same store the map does (lib/mapView.ts).
  const [view3d, setView3d] = useState(false);
  // Once the stroke has played, the ink is pinned by class — engines can
  // drop a finished animation's fill state (Dan, 2026-07-14: "the color
  // disappears right after").
  const [inkDone, setInkDone] = useState(false);
  // Quick Guide popup, summoned from the hero button next to the (?) circle
  // (Dan, 2026-07-14: "insert a QuickGuide link where my red arrow points").
  const [qgOpen, setQgOpen] = useState(false);
  // The Review button's count — the one destination on Home with a deadline.
  const [dueCount, setDueCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Progress, the due-count and the once-per-session hero flag live in
    // local/sessionStorage, which cannot be read during render (the site is
    // statically exported) — this mount effect has to seed that state.
    // Block-disabled: the rule reports only the first setState it meets, and
    // which one that is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    setView3d(loadMapView() === "3d");
    const refresh = () => {
      const p = loadProgress();
      setProgress(p);
      setDueCount(dueForReview(p, Date.now()).length);
    };
    refresh();
    window.addEventListener("fluolingo:progress-updated", refresh);
    // The map lives at /map now — forward its old deep links (`/?unit=N`
    // and/or `#SIO-0XX`) so printed QR codes and bookmarks keep working.
    const q = new URLSearchParams(window.location.search).get("unit");
    const hash = window.location.hash.replace("#", "");
    const isSio = SIOS.some((s) => s.id === hash);
    if (isSio || (q !== null && /^[0-4]$/.test(q))) {
      window.location.replace(`/map${window.location.search}${window.location.hash}`);
      return;
    }

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
    };
  }, []);

  // "Continuer" = the first not-done goal AFTER the furthest « done » (Dan,
  // 2026-07-08: a learner who marked a later step done continues from there).
  const activeId = nextSioId(progress);
  const activeSio = SIOS.find((s) => s.id === activeId);
  // THE STOP AFTER THIS ONE (Dan, 1 Sep: "add a forward button (= Next
  // stop)"). Taken from the map's own order — the SIOS array IS the study path
  // — rather than by adding one to the id: the numbering has gaps and a half
  // (45.5), so `SIO-045` + 1 is not a stop and `SIO-046` is not always next.
  // Undefined at the last stop, where the key simply does not render: a
  // forward key that goes nowhere is worse than no forward key.
  const afterSio = activeSio ? SIOS[SIOS.indexOf(activeSio) + 1] : undefined;
  const doneTotal = SIOS.filter((s) => isSioDone(s.id, progress)).length;

  // The accent colour the learner has equipped (drives the hero CTA). The fire
  // multiplier left with the streak tile — it is read where the streak now is,
  // in the top bar.
  // The stop NUMBER (SIO-007 -> 7). Falls back to the last stop when
  // everything is done, so the reading never blanks. The unit index went with
  // the five dots: "just 1/50 (nothing else)".
  const stopNo = activeSio ? Number(activeSio.id.slice(4, 7)) : SIOS.length;
  const accent = equippedAccent(progress);


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
      <section aria-label="Welcome" className="home-strip -ml-12 -mr-4 -mt-7 mb-2.5 pb-2.5 pl-12 pr-4 pt-3 sm:-ml-16 sm:-mr-7 sm:pl-16 sm:pr-7">
        {/* THE HERO IN FLUOLINGO HAND, SIZED TO THE WINDOW (Dan, 1 Sep: "the
            hero to be in FluOLinGo font and resized relative to the width of
            the window"). A clamp, not a breakpoint step: `Bienvenue sur` is
            the longest unbreakable run on the page, so the heading has to grow
            and shrink CONTINUOUSLY with the viewport or it will either wrap at
            360px or sit small at 1024. Measured at the ends — 320px gives
            27px, 1280px is capped at 52px before the line outgrows its band. */}
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
          className={`fluo-byline mt-1 h-4 w-auto${heroPlay ? " is-play" : ""}`}
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
      </section>

      {/* ── two wells, three keys ──────────────────────────────────────
          No card. The readings are pressed IN (read-only by construction —
          no hover, nothing to press), the actions stand OUT. That contrast
          is the whole instruction set. */}
      {/* TWO ROWS, AND DAN SWAPPED THEM (1 Sep: "we swap the positions of the
          four buttons and the next stop's name: the buttons down and the name
          of the next stop up").

          ROW A — where you are, and where you are going: the counter well and
          « Next: … », a reading beside a reading.
          ROW B — what you can do about it: the view switch and the four keys,
          a control beside four controls.

          Before the swap the rows cut across that: keys sat with the counter
          and the destination's NAME sat with the switch, so each row held one
          thing to read and one thing to press and neither row had a subject.
          The switch also moved to the left, under the counter, which is what
          made the swap possible — it had been sharing its row with the name. */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <dl className="flex min-w-0 items-stretch gap-2">
          {/* WHERE YOU ARE. One figure, and five dots for the five units —
              the draft's replacement for the ruler it deleted. */}
          {/* JUST 1/50 (Dan, 1 Sep: "just 1/50 (nothing else)"). The word STOP
              and the five unit dots are gone. Both were readable and neither
              was needed: the fraction already says where you are, and the dots
              said it a second time at a coarser grain — which is exactly what
              the litmus test removes. The <dt> stays, unseen: a screen reader
              would otherwise read "1 slash 50" with nothing to say what of. */}
          <div className="neo-well flex min-w-[64px] flex-col items-center justify-center rounded-2xl px-2 py-2.5 sm:min-w-[80px] sm:px-3">
            <dt className="sr-only">Stop</dt>
            <dd className="cahier-hand text-[22px] leading-none text-[color:var(--cahier-ink)] [font-variant-numeric:tabular-nums] sm:text-[26px]">
              {stopNo}<span className="text-base text-[color:var(--cahier-ink-soft)]">/{SIOS.length}</span>
            </dd>
          </div>
          {/* THE STREAK TILE IS GONE — it moved to the top bar, between ⌛ and
              the account button (Dan, 1 Sep: "move the streak value and emoji
              up between History and User"). It is not lost, it is PROMOTED:
              the one reading with a deadline used to live on the page a
              learner leaves first, and now rides all 28 surfaces including
              the drill they are in the middle of. See StreakMark in
              components/SiteTopBar.tsx; verify25 follows it there. */}
        </dl>

        {/* WHERE CONTINUE GOES, in words — the one piece of prose the draft
            keeps, because a coloured triangle cannot name a destination. Two
            lines as Dan wrote it ("Next: <br> [title]").

            `short`, NOT `topic`, and that is the whole reason this line works.
            Topics run to 55 characters ("en / au / aux / à — prepositions for
            cities & countries"); beside the counter well there are ~165px left
            on a 320px phone, so a topic can only ever arrive truncated — and
            the first build of this showed "Introducti…", which is one of the
            SHORTEST. `short` is the curriculum's own compact name, capped at
            14 characters by check:short and asserted by verify25b, and it is
            what every stop on the map is labelled with. So the learner reads
            the same words here and there, at every width, uncut. The full
            topic stays as the title attribute. */}
        {activeSio && (
          <p
            title={activeSio.topic}
            /* flex-1 + min-w-0 + truncate, and every one of the three is load
               bearing. Without flex-1 the block sizes to its content and simply
               overflows the page — measured at 320px, the topic ran 11.7px past
               the right edge while `scrollWidth === clientWidth` reported it
               unclipped, because nowrap without overflow:hidden grows the box
               rather than cutting the text. With all three, the row can never
               overflow at any width. */
            className="min-w-0 flex-1 truncate text-right text-[12.5px] leading-tight text-[color:var(--cahier-ink-soft)]"
          >
            Next:
            <br />
            <strong className="font-semibold text-[color:var(--cahier-ink)]">
              {activeSio.short}
            </strong>
          </p>
        )}
      </div>

      {/* ── ROW B · the controls ─────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 sm:gap-x-3">
        <ViewSwitch
          on={view3d}
          onFlip={(next) => {
            setView3d(next);
            saveMapView(next ? "3d" : "2d");
            // AND GO. Dan, 1 Sep: "make sure the switch literally takes you the
            // map it promises to." It used to set a preference and stop, which
            // was defensible while it sat against the map card — the card was
            // the door and the switch chose which door. It is now across the
            // page from that card, under the counter, so a control naming a
            // view and doing nothing visible is a dead end. Flipping it opens
            // the map it names, in the view it names.
            router.push(mapHref(next ? "3d" : "2d"));
          }}
        />

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
            makes the group 194px, which fits 360. 320 cannot hold four keys
            AND the well on one line at any size a finger can hit, so the row
            is allowed to WRAP there — the well takes the first line and the
            keys the second, rather than one of them disappearing. */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {activeSio && (
            <Link
              href={`/unit/${activeSio.unit}#${activeSio.id}`}
              aria-label={`Continue — ${activeSio.topic}, your stop on the study path`}
              title={`Continue — « ${activeSio.topic} », your stop on the study path`}
              className={`neo-key grid h-[44px] w-[44px] place-items-center rounded-[13px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]${doneTotal === 0 ? " fluo-play-halo" : ""}`}
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
              href={`/unit/${afterSio.unit}#${afterSio.id}`}
              aria-label={`Next stop — ${afterSio.topic}`}
              title={`Next stop — « ${afterSio.topic} »`}
              className="neo-key grid h-[44px] w-[44px] place-items-center rounded-[13px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]"
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
              className="neo-key relative grid h-[44px] w-[44px] place-items-center rounded-[13px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]"
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
              className="neo-key grid h-[44px] w-[44px] place-items-center rounded-[13px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]"
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden style={{ opacity: 0.4 }}>
                <path d="M12.5 6.5 L12.5 19.5 L3.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M22.5 6.5 L22.5 19.5 L13.5 13 Z" fill="var(--key-ink-focus)" stroke="var(--key-ink-focus)" strokeWidth="2.4" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          <button
            type="button"
            onClick={() => setQgOpen(true)}
            disabled={!activeSio?.collectionId}
            aria-label="All activities at this stop"
            title="Every activity available at your stop"
            className="neo-key grid h-[44px] w-[44px] place-items-center rounded-[13px] sm:h-[58px] sm:w-[58px] sm:rounded-[17px]"
            style={{ background: "linear-gradient(155deg, color-mix(in oklab, var(--dopa-reward) 55%, white) 0%, var(--dopa-reward) 52%, color-mix(in oklab, var(--dopa-reward) 70%, black) 100%)" }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
              <g fill="var(--key-ink-reward)">
                {[3.5, 10.25, 17].map((y) =>
                  [3.5, 10.25, 17].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5.5" height="5.5" rx="1.4" />),
                )}
              </g>
            </svg>
          </button>
        </div>
      </div>

      {qgOpen && activeSio?.collectionId && (
        <StopSheet
          stopId={activeSio.id}
          topic={activeSio.topic}
          collectionId={activeSio.collectionId}
          onClose={() => setQgOpen(false)}
        />
      )}

      {/* THE « n IN A ROW » COUNTER IS GONE (Dan, 1 Sep: "we don't need that
          actually, please remove it"). It counted stops completed in order from
          SIO-001 and stopped at the first gap — his own 8 July episode-model
          note. What retired it is the 🔥 day streak moving into the top bar
          hours earlier: two numbers of things-in-a-row within a few centimetres
          of each other, one counting DAYS and one counting STOPS, and nothing
          on the screen saying which was which. */}

      {/* 🗺️ The Map as a POSTCARD (Dan, 2026-08-21): a read-only snapshot
          of the learner's stretch of the course — the course mark, drawn.
          Inert on purpose (pointer-events off): a finger can't catch it, a
          tap anywhere is the door to the real map on /map. */}
      {/* The snapshot contains the map's own links, so the door to /map is
          a STRETCHED sibling link over the top — an <a> may not contain an
          <a>. `inert` keeps the frozen map's controls out of the tab order
          and the a11y tree. */}
      <div
        className="relative mt-2 overflow-hidden rounded-2xl border-2 transition hover:-translate-y-0.5"
        style={{ borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)", boxShadow: "var(--shadow-card)" }}
      >
        {/* One more layer between the page and the picture (Dan, 2026-08-22):
            the snapshot sits in a recessed mat, so it reads as a mounted
            photo — a surface you scroll PAST, never a control. The mat plus
            `inert` + pointer-events-none below mean no gesture over it can
            ever catch: a finger going down the page glides over. */}
        <div className="p-2 pb-0" aria-hidden>
          <div
            inert
            className="pointer-events-none select-none overflow-hidden rounded-xl"
            style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.18), inset 0 0 0 1.5px var(--cahier-line)" }}
          >
            <HomeMap progress={progress} activeId={activeId} accent={accent} postcard />
          </div>
        </div>
        <span className="flex items-center gap-2 border-t-2 px-4 py-2.5" style={{ borderColor: "var(--cahier-ink)" }}>
          <span aria-hidden className="text-xl">🗺️</span>
          <span lang="fr" className="fluo-serif min-w-0 flex-1 text-lg font-black leading-tight text-[color:var(--fluo-ink)]">
            The Map
            {/* The switch's visible consequence. Without it the toggle sets
                something a learner cannot see until after they have tapped
                away from it. */}
            {view3d && <span className="fluo-mono ml-1.5 text-sm font-black text-[color:var(--dopa-reward)]"> · 3D</span>}
          </span>
          <span aria-hidden className="fluo-mono text-xl font-black text-[color:var(--fluo-ink)]">›</span>
        </span>
        <Link
          href={mapHref(view3d ? "3d" : "2d")}
          aria-label={`The Map — open the course map in ${view3d ? "3D" : "2D"}`}
          className="absolute inset-0 z-10"
        />
      </div>
    </>
  );
}

/**
 * THE MAP VIEW SWITCH — one control, two states, and the state is written on it.
 *
 * Dan's picture (1 Sep): a chunky pill, the knob at one end and the label
 * « 2D » / « 3D » sitting in the empty half at the other, each in its own
 * colour. "Can we transfer the labels of the 3D switch into the switch
 * itself." The external « 3D view » caption it replaces was doing two jobs
 * badly: it named the property but not the state (a knob to its right, off,
 * beside the words "3D view" — is that 3D or not?), and it cost the row 60px
 * of prose to say what two characters inside the track now say exactly.
 * Dan's litmus test disposes of it: with the label inside, the caption's
 * removal costs a learner nothing.
 *
 * IT NAVIGATES, and that is deliberate (Dan, same day: "make sure the switch
 * literally takes you the map it promises to"). It named a view of a map and
 * did nothing a learner could see — defensible while it sat against the map
 * card, which was the door; not defensible now that it sits under the
 * counter, a page away from that card. So flipping it saves the choice and
 * opens the map in the view it now shows. `role="switch"` stays because the
 * flip is real and persists; the accessible name says the navigation out loud
 * rather than letting it be a surprise.
 *
 * THE LABEL CANNOT SIT UNDER THE KNOB. Track 72, padding 4, knob 28, so the
 * travel is 36 and the free half is 36 wide. The label is pinned 10 from the
 * end the knob is NOT at, which puts a ~24px word between 38 and 62 (off) or
 * 10 and 34 (on) — clear of the knob's 4–32 and 40–68 by 6px either way.
 *
 * AND 72 IS NOT A ROUND NUMBER, it is the width that keeps Dan's two rows two
 * rows. The keys beside it are 4 × 44 with 4px gaps = 188, and a 360px phone
 * leaves 272 for the pair: 72 + 8 + 188 = 268 fits with 4 to spare, where the
 * first build's 80 and 6px gaps came to 282 and wrapped the keys onto a third
 * line. 320 still wraps, deliberately — four keys and a switch cannot share a
 * line there at any size a finger can hit, and the switch taking the first
 * line is exactly where Dan put it ("to the left under the 4/30").
 */
function ViewSwitch({ on, onFlip }: { on: boolean; onFlip: (next: boolean) => void }) {
  const name = on ? "3D" : "2D";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Map view: ${name}. Switching opens the map in the other view.`}
      title={`The map in ${name} — tap to switch to ${on ? "2D" : "3D"} and open it`}
      onClick={() => onFlip(!on)}
      className="neo-well relative flex h-[38px] w-[72px] shrink-0 items-center rounded-full p-[4px] transition"
    >
      {/* The colours are Dan's: 2D blue, 3D red — and the knob wears the same
          hue as the word, so the pill reads as one object in one state rather
          than a coloured word next to a neutral part. */}
      <span
        aria-hidden
        className="fluo-mono absolute top-1/2 -translate-y-1/2 text-[16px] font-black leading-none tracking-tight"
        style={{
          [on ? "left" : "right"]: "10px",
          color: on ? "var(--dopa-reward-ink)" : "var(--dopa-focus-ink)",
        }}
      >
        {name}
      </span>
      {/* The knob is a rounded SQUARE, as Dan drew it — the same corner radius
          family as the four keys beside it, so the row reads as one set of
          physical parts rather than a switch borrowed from somewhere else. */}
      <span
        aria-hidden
        className="neo-key block h-[28px] w-[28px] rounded-[9px] transition-transform duration-200 ease-out"
        style={{
          transform: on ? "translateX(36px)" : "translateX(0)",
          background: on
            ? "linear-gradient(155deg, color-mix(in oklab, var(--dopa-reward) 55%, white) 0%, var(--dopa-reward) 52%, color-mix(in oklab, var(--dopa-reward) 70%, black) 100%)"
            : "linear-gradient(155deg, color-mix(in oklab, var(--dopa-focus) 55%, white) 0%, var(--dopa-focus) 52%, color-mix(in oklab, var(--dopa-focus) 70%, black) 100%)",
        }}
      />
    </button>
  );
}
