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
        <main ref={pageRef} className={`cahier-page flex min-h-screen flex-col${famKey ? ` fam-${famKey}` : ""}${bandKey ? ` band-${bandKey}` : ""}`}>
          <SiteTopBar active={siteActive} />
          {/* THE COILS START AT THE BAND, NOT BELOW IT — and this frame was
              the one page in the app still doing it the old way.

              The 11 Sep ruling opened the binding region ABOVE the band in
              CahierShell so the page's left edge is one width all the way
              down; this file kept the 6 Sep shape it was copied from, with
              `{topBar}` OUTSIDE the coil region. On /decks/<id> — the only
              caller — that left 67px of bare margin beside the MémoiRecall
              strip, the desk showing through where every other station has
              rings. Dan photographed the corner (13 Sep) and asked whether the
              bug he had chased away was back; it had never been fixed here.

              AGENTS.md's own note is why it was missed: it exempted "a band
              drawn INSIDE a content well (decks/[id]/CuratedDeckTable.tsx),
              which is already clear of them". Measured on the built app, that
              band is not in a well — it spans the page, x=13 to x=417, the
              paper's full width. The clearance rule
              `.cahier-binding ~ .page-band` now matches it, which is exactly
              what that rule is for. */}
          <div className="relative flex flex-1 flex-col">
            <div className="cahier-binding" aria-hidden />
            {topBar}
            <div className="py-5 pl-12 pr-4 sm:pl-16 sm:pr-7">{children}</div>
          </div>
        </main>

        {/* NO TABS, NO RAIL (7 Sep). A caller that draws its own view switch
            inside the page passes none, and an empty <nav> would still take
            the rail's width and leave a bite out of the desk beside the paper.
            The deck table is that caller — see the note on its CahierFrame. */}
        {tabs.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
