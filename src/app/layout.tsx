import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Public_Sans, Roboto } from "next/font/google";
import "./globals.css";
import BetaNotice from "@/components/BetaNotice";
import FeedbackButton from "@/components/FeedbackButton";
import ProgressSync from "@/components/ProgressSync";
import PageViewTracker from "@/components/PageViewTracker";
import KeyNav from "@/components/KeyNav";
import SuiteBanner from "@/components/SuiteBanner";
import AccentBar from "@/components/AccentBar";
import RewardToast from "@/components/RewardToast";
import TtsToggle from "@/components/TtsToggle";

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
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Template so every page can name itself in tabs/history/bookmarks
  // (audit 2026-07-19: every page was just "FluOlinGo"). Client pages set
  // theirs via CahierShell; server pages via metadata/generateMetadata.
  title: { default: "FluOlinGo", template: "%s · FluOlinGo" },
  description:
    "Gamified French (A1) practice for NUS LAF1201 — vocabulary games, speech drills, spaced revision and an AI tutor.",
  // Browsers must NEVER offer to auto-translate this site (Dan, 2026-07-10):
  // rewriting the French into English destroys the learning content. The
  // meta tag is Chrome/Google Translate's opt-out; translate="no" on <html>
  // (below) is the standards-based signal other engines honour.
  other: { google: "notranslate" },
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
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${publicSans.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SuiteBanner />
        {children}
        {/* Who runs this + what's collected (audit 2026-07-19): the app
            records every answer for learning analytics on identifiable
            students — say so, on every page. mt-auto pins it to the bottom
            of the flex column when content is short. */}
        <footer className="mt-auto px-4 pb-3 pt-6 text-center text-[11px] leading-relaxed text-neutral-500">
          FluOlinGo · built by Dr Daniel Chan, NUS Centre for Language Studies · answers and activity are
          recorded for learning analytics · <a href="/about" className="underline">about</a>
        </footer>
        <FeedbackButton />
        <BetaNotice />
        <ProgressSync />
        <PageViewTracker />
        <KeyNav />
        <AccentBar />
        <RewardToast />
        <TtsToggle />
      </body>
    </html>
  );
}
