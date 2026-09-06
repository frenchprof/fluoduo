"use client";

/**
 * The landing page — the front door for a STRANGER (Dan, 6 Sep 2026). A
 * signed-in learner or a device with progress never sees it (RootGate.tsx
 * decides); pressing « Start learning » stamps the device and opens Home.
 *
 * VOICE: hybrid (Dan's call) — the playful cahier look leads, and one
 * credibility line under the hero says who is behind it. Not academic-first,
 * not a Duolingo clone.
 *
 * PLATFORM-SHAPED: the offering is a GRID of course cards. Today one is real
 * — French A1, the app — and one is greyed (A2, soon), so further levels and
 * languages slot in without the page changing shape.
 *
 * THE PICTURES ARE THE APP (Dan, from the design videos he follows: skewed
 * screenshots of the real product beat icons). The three phones show the real
 * map, a real game and a real drill, captured at 390x844 (x2) from an open
 * build of this repo — verify107-landing.py's docstring says how to retake
 * them (each stays under 150KB, sized 2x its display box).
 *
 * Motion: none of its own. The skews are static transforms; the only
 * transitions are the .fluo-btn press this page inherits.
 */

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="min-h-screen" style={{ background: "var(--cahier-desk)" }}>
      <div
        className="cahier-foolscap mx-auto min-h-screen max-w-5xl px-6 pb-12 pt-10 sm:px-10"
        style={{ background: "var(--cahier-paper)" }}
      >
        {/* ── hero: the claim, the door, the name behind it ─────────────── */}
        <section className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="fluo-band-hand font-black leading-[1.05] text-[color:var(--fluo-ink)] text-[clamp(2.5rem,10vw,4rem)]">
              <span className="fluo-hl">FluOLinGo</span>
            </h1>
            <p className="cahier-hand mt-3 text-2xl leading-snug text-[color:var(--fluo-ink)]">
              French in a lively cahier&nbsp;— 50 real-life goals, games and
              drills.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="fluo-btn fluo-btn-lg fluo-btn-hand mt-6"
            >
              Start learning
            </button>
            {/* The credibility line — Dan's hybrid voice, verbatim. */}
            <p className="mt-5 text-sm text-[color:var(--fluo-ink-soft)]">
              Built by Dr&nbsp;Daniel Chan, NUS Centre for Language Studies
            </p>
          </div>
          <PhoneShot
            src="/landing/map.webp"
            alt="The course map: fifty numbered stops winding through FluOLinGo land"
            tilt="right"
          />
        </section>

        {/* ── the offering: a grid of course cards ──────────────────────── */}
        <section aria-label="Courses" className="mt-12">
          <h2 className="fluo-band-hand text-2xl font-black text-[color:var(--fluo-ink)]">
            Courses
          </h2>
          <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onStart}
              className="landing-course flex flex-col items-start gap-1 rounded-2xl p-4 text-left"
            >
              <span aria-hidden className="text-3xl">
                🇫🇷
              </span>
              <span className="fluo-btn-hand text-xl text-[color:var(--fluo-ink)]">
                French A1
              </span>
              <span className="text-xs text-[color:var(--fluo-ink-soft)]">
                50 can-do goals
              </span>
            </button>
            {/* One greyed card, no promises beyond the level name. */}
            <div className="landing-course is-soon flex flex-col items-start gap-1 rounded-2xl p-4">
              <span aria-hidden className="text-3xl">
                🇫🇷
              </span>
              <span className="fluo-btn-hand text-xl">French A2</span>
              <span className="text-xs">Soon</span>
            </div>
          </div>
        </section>

        {/* ── inside the app: a real game, a real drill ─────────────────── */}
        <section
          aria-label="Inside the app"
          className="mt-14 flex flex-wrap items-start justify-center gap-10 sm:gap-14"
        >
          <figure className="m-0">
            <PhoneShot
              src="/landing/game.webp"
              alt="A game round: pick the French shop name for the picture"
              tilt="left"
            />
            <figcaption className="cahier-hand mt-3 text-center text-xl text-[color:var(--fluo-ink)]">
              Games
            </figcaption>
          </figure>
          <figure className="m-0">
            <PhoneShot
              src="/landing/drill.webp"
              alt="A drill card: « de la salade », with Listen and four choices"
              tilt="right"
            />
            <figcaption className="cahier-hand mt-3 text-center text-xl text-[color:var(--fluo-ink)]">
              Practice
            </figcaption>
          </figure>
        </section>
      </div>
    </main>
  );
}

/** A screenshot of the real app in a tilted phone frame — the design-video
 *  treatment: the product itself is the graphic. Static skew, no motion. */
function PhoneShot({
  src,
  alt,
  tilt,
}: {
  src: string;
  alt: string;
  tilt: "left" | "right";
}) {
  return (
    <div className="landing-phone" data-tilt={tilt}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the export has
          no image optimizer; the files are pre-sized to this box (x2 retina) */}
      <img src={src} alt={alt} width={220} height={476} loading="lazy" />
    </div>
  );
}
