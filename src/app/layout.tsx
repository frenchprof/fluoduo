import type { Metadata, Viewport } from "next";
import { Patrick_Hand, Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BetaNotice from "@/components/BetaNotice";
import FeedbackButton from "@/components/FeedbackButton";
import ProgressSync from "@/components/ProgressSync";
import PageViewTracker from "@/components/PageViewTracker";
import KeyNav from "@/components/KeyNav";
import RailArrows from "@/components/RailArrows";
import RailSwipe from "@/components/RailSwipe";
import TopLevelOnly from "@/components/TopLevelOnly";
import AccentBar from "@/components/AccentBar";
import RewardToast from "@/components/RewardToast";
import XpFloat from "@/components/XpFloat";
import InstallPrompt from "@/components/InstallPrompt";

/* THREE FONTS, AND THE COUNT THAT SHOWED WHY.
 *
 * This block is main's (PR 213, Dan's 6 Sep roster: "FluOLinGo font + Patrick
 * Hand font + Roboto font", "Geist is OUT"). This branch had reached the same
 * place from his 7 Sep *"i can still see a lot of Geist and Work Sans"* — two
 * lanes doing one job, which is what the integration lane exists to catch.
 * Main's is the one that landed and the one kept; what follows is the half of
 * mine worth keeping, because it is evidence rather than a second opinion.
 *
 * Every visible text run on eight routes, counted before anything was touched,
 * by asking the browser which family it had resolved:
 *
 *     1180  Work Sans        the whole app, effectively
 *      139  Geist Mono       every small caps label
 *       24  FluOLinGo Hand   the bands and the wordmark
 *        4  Iowan Old Style  a system serif nobody had chosen
 *        1  Patrick Hand
 *        0  Roboto           loaded on every page, rendering nowhere
 *
 * Roboto was the one face Dan asked for and the one that never appeared — it
 * was wired to `.fluo-readable`, which four components use. And the fourth
 * family was never SHIPPED at all: `--fluo-serif` named system fonts, so
 * « Choose your level » was Iowan on a Mac, Palatino on some Windows and
 * Georgia elsewhere. */

// THREE FONTS, NO MORE (Dan, 6 Sep): "FluOLinGo font + Patrick Hand font +
// Roboto font", and "Geist is OUT" — Work Sans, unnamed in his roster, goes
// with it. Roboto is the ONE workhorse now: body, controls, data (tabular
// numerals stand in for the retired Geist Mono — see --fluo-mono in
// globals.css). The display role moves to Dan's own hand ("use the FluOLinGo
// font as far as possible, everywhere, in their different variations");
// Patrick Hand keeps only the accent spots .cahier-hand already marks.
const roboto = Roboto({
  variable: "--font-readable",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

// Patrick Hand is the EXPRESSIVE display face: major page headings, selected
// section headings, moments of personality. Deliberately OPT-IN via the
// .cahier-hand class — never applied wholesale, because the rule is
// "use it to establish expressive hierarchy", not "headings = Patrick Hand".
const patrickHand = Patrick_Hand({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// FluOLinGo Hand — Dan's own brand hand-lettering (uploaded 2026-08-23), the
// face of the page heading bands: what the design handoff's headers were
// drawn in, now served from the repo instead of approximated by Patrick Hand.
// FOUR WEIGHTS, from ONE build (2026-08-31; Bold added 2026-09-05). PR #95 shipped the complete
// nine-weight family; what was loaded here was a 15 KB first-upload Regular
// from August, a different build. Mixing that Regular with a SemiBold from
// the new family would put two drawings of the same hand on one page.
//
// Only the weights the app uses are loaded. The rest sit in fonts/ until
// something needs them: all nine would cost ~316 KB on every page for
// weights nothing renders. ExtraBold joined on 5 Sep (Dan: "use FluoLingo
// font in heavy bold to disallow the text from overflowing off the
// buttons" — the hand face is narrower than the body face at the same
// size, so button labels fit their tiles).
const fluoHand = localFont({
  src: [
    { path: "../fonts/FluOlinGoHand-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/FluOlinGoHand-SemiBold.woff2", weight: "600", style: "normal" },
    // TITLES (Dan, 2026-09-05: "the titles of the pages can afford to be in
    // thick font — If Patrick Hand does not have Bold, then use oversized
    // FluOLinGo font"). Patrick Hand has no bold at all: it ships from Google
    // as a single 400 weight, so the house hand has to carry it. Bold rather
    // than oversized SemiBold because "thicker" was the ask and scale alone
    // answers "bigger" — Dan compared all four cuts and chose this one.
    //
    // THE PRICE CHANGED AFTER HE CHOSE. ExtraBold landed the same day for
    // button labels, so 800 is now already paid for and 700 is the one that
    // costs +35 KB. He picked 700 on the letterforms (at title size 800's
    // counters start to close); that reason still holds, but the trade is no
    // longer free and is worth revisiting if page weight is ever the issue.
    { path: "../fonts/FluOlinGoHand-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/FluOlinGoHand-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-fluohand",
  display: "swap",
});

export const metadata: Metadata = {
  // Template so every page can name itself in tabs/history/bookmarks
  // (audit 2026-07-19: every page was just "FluOLinGo"). Client pages set
  // theirs via CahierShell; server pages via metadata/generateMetadata.
  title: { default: "FluOLinGo", template: "%s · FluOLinGo" },
  // LAF1201 STAYS (decided 2026-08-17, UI_WORK_PLAN_1 loose bugs): it is the
  // course code students and Google search for; English first, the code
  // second, no French in the description (English-first chrome rule).
  description:
    "French A1 practice for NUS LAF1201 — vocabulary games, speech drills, spaced revision and an AI tutor.",
  // Browsers must NEVER offer to auto-translate this site (Dan, 2026-07-10):
  // rewriting the French into English destroys the learning content. The
  // meta tag is Chrome/Google Translate's opt-out; translate="no" on <html>
  // (below) is the standards-based signal other engines honour.
  other: { google: "notranslate" },
  // iOS ignores the manifest's icons — it wants its own link tag (Apple has
  // never implemented `purpose: maskable` either, hence the separate art).
  appleWebApp: { capable: true, title: "FluOLinGo", statusBarStyle: "default" },
  // THE SVG HAS TO BE NAMED HERE, not just left in app/ (5 Sep). Next's file
  // convention would have found `app/icon.svg` on its own — but declaring an
  // `icons` object at all switches that off, so for as long as this key exists
  // for Apple's sake, every other icon has to be listed beside it. Symptom
  // when it is not: the export contains /icon.svg and no page ever links it,
  // and the tab silently falls back to the .ico. verify95 checks the LINK, not
  // the file. The .ico is NOT listed here — `app/favicon.ico` keeps its own
  // convention link either way, and naming it again emitted the tag twice.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
};

/** The OS chrome takes the ink, so an installed window frames the paper
 *  rather than sitting in a white box. */
export const viewport: Viewport = {
  themeColor: "#312620",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      // fr, not en (audit 2026-07-19): the chrome and the learning content
      // skew French, and lang drives screen-reader/TTS pronunciation — a
      // French vocab item read with English phonology is worse than the
      // reverse. English-heavy blocks can opt out with lang="en" spans.
      lang="fr"
      translate="no"
      className={`${patrickHand.variable} ${fluoHand.variable} ${roboto.variable} h-full antialiased`}
    >
      <head>
        {/* AM I RUNNING INSIDE THE CAHIER? — decided BEFORE the first paint.
            Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN
            THE CAHIER PAGES IN IFRAMES (EMBEDDED)"*. A framed station is this
            same app booted a second time, so it would otherwise draw a second
            notebook — bar, band, coils and all — inside a 720px box.

            React cannot answer this during render: the export is one HTML file
            served to both the top-level page and the frame, so a component
            that branched on it would mismatch on hydration or flash. An inline
            script runs before anything is painted, and CSS keyed on
            `html[data-embed]` does the hiding (globals.css) — no flash, no
            React involved.

            `<base target="_top">` is the other half and matters as much: every
            <Link> inside a station is a real navigation, and without this each
            one would load the whole app INSIDE the box. Breaking out is what
            makes a link inside a frame behave like a link. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(window.self!==window.top){document.documentElement.dataset.embed='1';" +
              "var b=document.createElement('base');b.target='_top';document.head.appendChild(b);}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Who runs this + what's collected (audit 2026-07-19): the app
            records every answer for learning analytics on identifiable
            students — say so, on every page. mt-auto pins it to the bottom
            of the flex column when content is short. */}
        <footer className="mt-auto px-4 pb-3 pt-6 text-center text-[11px] leading-relaxed text-neutral-500">
          FluOLinGo · built by Dr Daniel Chan, NUS Centre for Language Studies · answers and activity are
          recorded for learning analytics · <a href="/about" className="fluo-hit44 underline">about</a>
        </footer>
        {/* ONCE PER PAGE, NOT ONCE PER DOCUMENT. A station runs in a frame
            since 2026-09-07, and a framed station boots this same layout — so
            without this, every station opened would log two page views, run
            two progress syncs and float two of every +20. See
            components/TopLevelOnly.tsx for the full list and what stays. */}
        <TopLevelOnly>
          <FeedbackButton />
          <BetaNotice />
          <ProgressSync />
          <PageViewTracker />
          <KeyNav />
          <RewardToast />
          <XpFloat />
          <InstallPrompt />
          {/* The two edge triangles (Dan, 7 Sep: *"desktop does not have left
              right scroll, so we need to provide these accessibility links"*).
              INSIDE TopLevelOnly on purpose: the frame's edges are not the
              page's edges, so a framed copy would draw them inset over the
              paper. RailSwipe below is deliberately outside — the finger is in
              the frame, the arrows are not. */}
          <RailArrows />
        </TopLevelOnly>
        {/* Sideways is Dan's chain, in every document — including a framed
            station, which is where the finger actually is. See RailSwipe.tsx. */}
        <RailSwipe />
        {/* The learner's accent paints the station too, or the frame looks
            like a different app. */}
        <AccentBar />
      </body>
    </html>
  );
}
