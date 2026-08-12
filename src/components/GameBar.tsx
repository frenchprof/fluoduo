"use client";

/**
 * The persistent chrome for game surfaces.
 *
 * WHY: five games — NumBus, NumBourse, Compose It, LexicaLater, VocabulaRain —
 * each rendered their own ad-hoc top bar: a browser-style "← Back", the game's
 * name, and a help dot, in five different colour schemes. None of them offered
 * a way back to FluOlinGo, and none carried the icons that exist on every other
 * page. A learner who opened a game from a link was stranded there (Dan,
 * 2026-08-10: "the games are also missing the visible back to FluoLingo link at
 * the top left and the usual icons at the top… some of these deserve to be
 * permanently on screen no matter where one is on the website").
 *
 * PRD §10: "Lessons, review activities, games, stories, AI interactions, and
 * teacher surfaces should feel like parts of the same product even when their
 * activity mechanics differ."
 *
 * WHY NOT THE FULL CahierShell: a game needs its screen. Duolingo's lesson
 * player deliberately strips its chrome to protect focus — but it always keeps
 * an exit and a sense of place. This is that: the smallest bar that answers
 * "where am I, and how do I get out", and no more. The flap rail stays off.
 *
 * It is `sticky`, not fixed: the way out scrolls with you and never covers the
 * game.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";

/** Always-available destinations. Deliberately four, not fifteen. */
const LINKS: Array<{ href: string; icon: string; label: string }> = [
  { href: "/activities", icon: "📖", label: "Index" },
  { href: "/moi", icon: "📊", label: "My Progress" },
  { href: "/leaderboard", icon: "🏆", label: "Leaderboard" },
  { href: "/profil", icon: "👤", label: "Profile" },
];

export default function GameBar({
  title,
  up,
  right,
}: {
  /** What this activity is. Keep it short — it is a place marker, not a header. */
  title: ReactNode;
  /** One level up, when the game has a gallery. Omitted = no second arrow. */
  up?: string;
  /** Live game state that belongs in the bar (a score, a timer). */
  right?: ReactNode;
}) {
  return (
    <div
      className="sticky top-0 z-30 border-b"
      style={{
        background: "var(--cahier-paper-raised, rgba(255,255,255,0.86))",
        borderColor: "var(--cahier-line-strong, rgba(0,0,0,0.12))",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-2">
        {/* The way home. First element, every game, same place, always. */}
        <Link
          href="/"
          className="shrink-0 rounded-full px-2.5 py-1 text-sm font-bold no-underline"
          style={{ color: "var(--cahier-accent, #2f4fa8)" }}
        >
          ← <span className="hidden sm:inline">FluOlinGo</span>
        </Link>

        {up && (
          <BackLink
            fallback={up}
            className="shrink-0 text-xs font-bold"
            // A second, weaker arrow: back to this game's own gallery.
          >
            ↩︎
          </BackLink>
        )}

        <span
          lang="fr"
          className="min-w-0 flex-1 truncate text-center text-sm font-bold"
          style={{ color: "var(--cahier-ink-soft, #4a4a4a)" }}
        >
          {title}
        </span>

        {right}

        <nav className="flex shrink-0 items-center gap-0.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              title={l.label}
              aria-label={l.label}
              className="rounded-full px-1.5 py-1 text-base no-underline"
            >
              {l.icon}
            </Link>
          ))}
          <HelpDot />
        </nav>
      </div>
    </div>
  );
}
