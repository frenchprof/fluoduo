"use client";

/**
 * The phone's navigation. Four icons, no words.
 *
 * Replaces the ☰ dropdown, which on a 390px screen opened a panel covering 62%
 * of the viewport and listed nineteen destinations in an order no surface
 * agreed with.
 *
 * NO LABELS BY DEFAULT (Dan, 2026-08-10: "not using words on the mobile if
 * possible and let the words appear only when the finger lays on it"). Press
 * and hold shows the label above the icon; lifting hides it. A learner who
 * wants them permanently turns them on in Réglages — it is the first toggle
 * there.
 *
 * WHY PRESS-AND-HOLD RATHER THAN A TOOLTIP: a phone has no hover. `title=`
 * renders nothing on iOS. This listens for pointerdown and shows the label
 * after 260ms, which is short enough to feel deliberate and long enough that a
 * normal tap navigates without a flash of text.
 *
 * Hidden at `sm` and up, where the flap rail takes over.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BOTTOM_NAV } from "@/content/nav";
import { readUiPrefs } from "@/lib/uiPrefs";

export default function BottomBar() {
  const pathname = usePathname();
  const [held, setHeld] = useState<string | null>(null);
  const [labels, setLabels] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nav = useRef<HTMLElement | null>(null);

  // The draggable floats must clear this bar on EVERY page that shows it —
  // 1502ee2 fixed the same overlap for DrillShell's footer by having the
  // shell declare a floor, and the bar it turns out needs to be its own
  // declarer too, or each new page re-discovers the bug (Reports did,
  // 2026-08-11). Measured, not guessed: offsetHeight already includes the
  // safe-area padding, and it is 0 while `sm:hidden` hides the bar, which
  // correctly withdraws the floor on wide screens.
  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const root = document.documentElement;
    const set = () => {
      const h = el.offsetHeight;
      if (h > 0) root.style.setProperty("--bottombar-floor", `${h + 8}px`);
      else root.style.removeProperty("--bottombar-floor");
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    window.addEventListener("resize", set);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", set);
      root.style.removeProperty("--bottombar-floor");
    };
  }, []);

  // Read after mount: prerender must not depend on localStorage or every page
  // ships one learner's preference baked into the HTML.
  useEffect(() => {
    const sync = () => setLabels(readUiPrefs().showNavLabels);
    sync();
    window.addEventListener("fluolingo:uiprefs", sync);
    return () => window.removeEventListener("fluolingo:uiprefs", sync);
  }, []);

  const press = useCallback((key: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHeld(key), 260);
  }, []);

  const release = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHeld(null);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <nav ref={nav} className="cahier-bottombar sm:hidden" aria-label="Sections">
      {BOTTOM_NAV.map((slot) => {
        const active = pathname === slot.href || pathname.startsWith(slot.href + "/");
        const showLabel = labels || held === slot.key;
        return (
          <Link
            key={slot.key}
            href={slot.href}
            aria-label={slot.label}
            aria-current={active ? "page" : undefined}
            data-active={active}
            className="cahier-bottombar-slot"
            onPointerDown={() => press(slot.key)}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            onContextMenu={(e) => e.preventDefault()}
          >
            {held === slot.key && !labels && (
              <span aria-hidden className="cahier-bottombar-tip">{slot.label}</span>
            )}
            <span aria-hidden className="cahier-bottombar-icon">{slot.emoji}</span>
            {/* Rendered but visually hidden when labels are off, so the row's
                height never changes when someone toggles them on. */}
            <span aria-hidden className={showLabel && labels ? "cahier-bottombar-label" : "sr-only"}>
              {slot.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
