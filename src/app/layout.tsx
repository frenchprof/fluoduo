import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Work_Sans, Patrick_Hand, Roboto } from "next/font/google";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

// "Le Cahier" type system: characterful serif display, humanist body.
// No handwriting/cursive font anywhere in the product — Dan's explicit call.
// Work Sans is the FUNCTIONAL face: body, controls, navigation, metrics,
// data, dense headings, anything accessibility-critical. It powers both
// --font-body and --font-display, so the 73 existing .cahier-display uses
// all become functional headings — correct by default.
const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});
const workSansDisplay = Work_Sans({
  variable: "--font-display",
  subsets: ["latin"],
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
// TWO WEIGHTS, from ONE build (2026-08-31). PR #95 shipped the complete
// nine-weight family; what was loaded here was a 15 KB first-upload Regular
// from August, a different build. Mixing that Regular with a SemiBold from
// the new family would put two drawings of the same hand on one page.
//
// Only the two the app uses are loaded. The other seven sit in fonts/ until
// something needs them: all nine would cost ~316 KB on every page for eight
// weights nothing renders.
const fluoHand = localFont({
  src: [
    { path: "../fonts/FluOlinGoHand-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/FluOlinGoHand-SemiBold.woff2", weight: "600", style: "normal" },
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
  icons: { apple: "/icons/apple-touch-icon.png" },
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
      className={`${geistSans.variable} ${geistMono.variable} ${workSans.variable} ${workSansDisplay.variable} ${patrickHand.variable} ${fluoHand.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Who runs this + what's collected (audit 2026-07-19): the app
            records every answer for learning analytics on identifiable
            students — say so, on every page. mt-auto pins it to the bottom
            of the flex column when content is short. */}
        <footer className="mt-auto px-4 pb-3 pt-6 text-center text-[11px] leading-relaxed text-neutral-500">
          FluOLinGo · built by Dr Daniel Chan, NUS Centre for Language Studies · answers and activity are
          recorded for learning analytics · <a href="/about" className="underline">about</a>
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
