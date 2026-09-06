"use client";

/**
 * One index-tab flap, its shape, and the pastel hues the rail cycles through.
 *
 * This lived inside CahierShell until 2026-08-31, when the site bar moved out
 * to SiteTopBar so DrillShell could mount it too (Dan: "many pages are missing
 * that menu … reinstate them so that those are accessible at all times"). Both
 * shells draw flaps, so keeping the flap in either one would have made the
 * other import from it — CahierShell → SiteTopBar → CahierShell is a cycle.
 * The shape has no opinion about which shell is drawing it, so it lives here.
 *
 * A tab without an href (typically the active page) renders as a static flap.
 */
import Link from "next/link";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

export const TAB_HUES = [
  "var(--cahier-t0)",
  "var(--cahier-t1)",
  "var(--cahier-t2)",
  "var(--cahier-t3)",
  "var(--cahier-t4)",
  "var(--cahier-t5)",
] as const;

export type ShellTab = {
  key: string;
  label: string;
  href?: string; // omit on the active page's own tab
  emoji?: string;
  hue?: string;
  fill?: string;
  /** Tiny action verb under the name ("browse the cards") — activity names
   *  alone don't tell a first-timer how Flip It differs from Lesson (Dan,
   *  2026-07-05). Navigation text: it points at the right door, so it
   *  survives the litmus rule. */
  hint?: string;
  /** Extra click work (e.g. visit telemetry) — runs before navigation. */
  onClick?: (e: ReactMouseEvent<HTMLAnchorElement>) => void;
};

/** The hue a tab wears: its own if it declares one, else the rail's cycle. */
export const hueOf = (t: ShellTab, i: number) => t.hue ?? TAB_HUES[i % TAB_HUES.length];
/** What an ACTIVE flap is filled with. Falls back to the stripe's own colour,
 *  which is what every flap did before 2026-09-05 — and is why six of the eight
 *  activity flaps put dark ink on a mid-tone ground at 2.2-4.2:1. A tab that
 *  declares a `fill` gets its family's wash instead, measured at 8.1-8.5:1. */
export const fillOf = (t: ShellTab, i: number) => t.fill ?? hueOf(t, i);

export default function TabFlap({
  tab,
  hue,
  fill,
  active,
  className,
  onNavigate,
}: {
  tab: ShellTab;
  hue: string;
  fill?: string;
  active: boolean;
  className: string;
  onNavigate?: () => void;
}) {
  const style = { "--tab-hue": hue, "--tab-fill": fill ?? hue } as CSSProperties;
  const body = (
    <>
      {tab.emoji && <span aria-hidden>{tab.emoji}</span>}
      <span className={tab.hint ? "cahier-tab-text" : undefined}>
        {/* ALWAYS classed (2026-08-10): a bare span gave the 640-900
            icons-only rail nothing to hide once patch 17 removed the
            hints. Structure the CSS can address, not incidental markup. */}
        <span className="cahier-tab-label">{tab.label}</span>
        {tab.hint && <span className="cahier-tab-hint">{tab.hint}</span>}
      </span>
    </>
  );
  if (!tab.href) {
    return (
      <span data-active={active} aria-current={active ? "page" : undefined} className={className} style={style}>
        {body}
      </span>
    );
  }
  return (
    <Link
      href={tab.href}
      data-active={active}
      className={className}
      style={style}
      onClick={(e) => {
        tab.onClick?.(e);
        onNavigate?.();
      }}
    >
      {body}
    </Link>
  );
}
