import type { Metadata, Viewport } from "next";
import { Patrick_Hand, Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BetaNotice from "@/components/BetaNotice";
import FeedbackButton from "@/components/FeedbackButton";
import ProgressSync from "@/components/ProgressSync";
import PageViewTracker from "@/components/PageViewTracker";
import KeyNav from "@/components/KeyNav";
import AccentBar from "@/components/AccentBar";
import RewardToast from "@/components/RewardToast";
import XpFloat from "@/components/XpFloat";
import InstallPrompt from "@/components/InstallPrompt";

// NO GEIST. Dan, 2026-09-07: *"GEIST HAS BEEN BANNED, WHY IS IT BACK AS A
// FONT?"* — it was never removed. Geist and Geist Mono are what
// `create-next-app` scaffolds, they have been in this file since the commit
// that created it, and nothing ever took them out. They were not merely
// declared either: `@theme inline` pointed Tailwind's --font-sans and
// --font-mono at them, and `--fluo-mono` led with Geist Mono, so the .fluo-mono
// labels — "GOAL", "PICK ONE OF THE FIFTY", the map legend, the 2D/3D switch —
// rendered in Geist Mono on 13 of the 14 pages driven. Removed at the source
// here, and verify111 fails if either name comes back.

// Dan (2026-07-01): the mono "label" font used for SIO circle captions etc. was
// "much much" too hard to read — swap in Roboto for anywhere that needs to be
// legible fast (path node captions, grid tile labels), via the .fluo-readable
// class in globals.css. Not a wholesale font replacement — fluo-mono/fluo-label
// stay as-is for chrome that isn't a readability complaint.
const roboto = Roboto({
  variable: "--font-readable",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// NO WORK SANS EITHER. Dan, 2026-09-07: *"we said Geist and Work sans are
// banned — they are banned everywhere"*.
//
// Work Sans was the FUNCTIONAL face here: body, controls, navigation, metrics,
// dense headings. Measured on SpecuLearn before this change, it was 176 of the
// 194 text elements on the page — effectively the whole app.
//
// AND REMOVING GEIST HAD JUST MADE IT WORSE: that patch pointed Tailwind's
// --font-sans at `var(--font-body)`, which WAS Work Sans, so one banned face
// was swapped for the other. Both are gone now.
//
// ROBOTO TAKES BOTH SLOTS, and it is the one choice here that is already Dan's:
// he asked for it by name on 2026-07-01 for anything that has to be legible
// fast. It was loaded for --font-readable and now carries --font-body and
// --font-display as well, so the cahier system keeps its three tiers (body,
// display, hand) with no new face introduced. The expressive faces are
// untouched: Patrick Hand and the FluOLinGo hand are Dan's own picks.
const robotoBody = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
const robotoDisplay = Roboto({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
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
      className={`${robotoBody.variable} ${robotoDisplay.variable} ${patrickHand.variable} ${fluoHand.variable} ${roboto.variable} h-full antialiased`}
    >
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
        <FeedbackButton />
        <BetaNotice />
        <ProgressSync />
        <PageViewTracker />
        <KeyNav />
        <AccentBar />
        <RewardToast />
        <XpFloat />
        <InstallPrompt />
      </body>
    </html>
  );
}
