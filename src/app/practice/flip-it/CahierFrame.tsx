"use client";

/**
 * "Le Cahier" — Flip It's OWN full interface (Dan, 2026-07-05: "can Flip It
 * be given its own entire interface like how VocabulaRain and LexicaLator
 * are"), the way the rain and conveyor games own their worlds. A French
 * spiral-bound exercise book on a warm wooden desk: silver ring binding down
 * the left gutter, pastel index tabs off the right edge switching the VIEWS
 * (Overview / Cards / All Cards). Navigation back out is the ← Back in the
 * top bar — no site/deck rail here, same convention as the games.
 * The VIEW switcher needs no ☰ (Dan, 2026-07-05): with only three views,
 * FlipItContent renders them as plain buttons under step 1 — that covers
 * narrow screens; the side rail stays on wide ones.
 *
 * The SITE menu is a different thing and does mount here, since 2026-08-31 —
 * Dan: "many pages are missing that menu and other links in the area above the
 * colored header strip. can you reinstate them so that those are accessible at
 * all times". The frame's own bar is page furniture (← Back, the deck's name,
 * the ? dot); above it now sits the same SiteTopBar every other shell mounts,
 * so the way out of a deck is not one link to one place.
 */

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import SiteTopBar from "@/components/SiteTopBar";
import { bandOf, familyOf } from "@/content/activities";

const WIDTH_KEY = "fluolingo:flipWidth";

export const TAB_HUES = [
  "var(--cahier-t0)",
  "var(--cahier-t1)",
  "var(--cahier-t2)",
  "var(--cahier-t3)",
  "var(--cahier-t4)",
  "var(--cahier-t5)",
] as const;

export type CahierTab = { key: string; label: string; hue?: string };

export function CahierFrame({
  tabs,
  active,
  onSelect,
  siteActive,
  topBar,
  children,
}: {
  tabs: CahierTab[];
  active: string;
  onSelect: (key: string) => void;
  /** Registry key of the ACTIVITY this frame is showing — the site bar's
   *  `active`, which is what colours the bar and marks the open family in
   *  the ☰. Not `active` above: that is the open VIEW inside the frame. */
  siteActive: string;
  topBar?: ReactNode;
  children: ReactNode;
}) {
  const hueOf = (t: CahierTab, i: number) => t.hue ?? TAB_HUES[i % TAB_HUES.length];
  // Same one line CahierShell uses: the page's own key picks its family, so
  // the site bar above wears --fam-wash here too instead of falling back to
  // bare paper while every other page in the app is coloured.
  const famKey = familyOf(siteActive);
  const bandKey = bandOf(siteActive);
  const pageRef = useRef<HTMLElement>(null);

  // The notebook is user-widenable: drag the page's right edge (Dan,
  // The saved-width restore is gone with the handle: nothing can write
  // `fluolingo:flipWidth` any more, so reading it back would only ever reapply
  // a width a learner set before today and can no longer change. The key is
  // cleared once instead — a migration, not a feature; delete after a release
  // or two.
  useEffect(() => {
    try { window.localStorage.removeItem(WIDTH_KEY); } catch {}
  }, []);
  // NO DRAG HANDLE — Dan, 2026-09-02, removed the widen-by-dragging edge across
  // the app; this was CahierShell's feature copied for Flip It's own frame, so
  // it goes with it.

  return (
    <div className="cahier-desk cahier-desk--flip">
      <div className="cahier-deskrow">
        <main ref={pageRef} className={`cahier-page min-h-screen${famKey ? ` fam-${famKey}` : ""}${bandKey ? ` band-${bandKey}` : ""}`}>
          <div className="cahier-binding" aria-hidden />

          <SiteTopBar active={siteActive} />
          {topBar}
          <div className="py-5 pl-12 pr-4 sm:pl-16 sm:pr-7">{children}</div>
        </main>

        <nav className="cahier-tabs" aria-label="Views">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              data-active={active === t.key}
              onClick={() => onSelect(t.key)}
              className="cahier-tab"
              style={{ "--tab-hue": hueOf(t, i) } as CSSProperties}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
