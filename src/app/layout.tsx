import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Public_Sans, Roboto } from "next/font/google";
import "./globals.css";
import BetaNotice from "@/components/BetaNotice";
import FeedbackButton from "@/components/FeedbackButton";
import ProgressSync from "@/components/ProgressSync";

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
  title: "FluoLingo",
  description: "Language-agnostic practice games portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${publicSans.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <FeedbackButton />
        <BetaNotice />
        <ProgressSync />
      </body>
    </html>
  );
}
