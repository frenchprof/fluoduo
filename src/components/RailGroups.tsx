"use client";

/**
 * THE ☰ MENU'S SIX FLAPS — coloured, short, and doors rather than folders
 * (Dan, 2026-09-03: "i seriously need the fix for the burger menu shortened
 * and plain to colored tabs please").
 *
 * WHAT LEFT: the accordion and the children rows. Dan retired child tabs on
 * 2 Sep ("make them pop up a window like the one that for Menu … So actually
 * we do not need children tabs anymore"), and while the filtered popups are
 * built, each parent goes to its family's HUB — the page that already lists
 * that family's tiles. The menu that ran twenty-two rows deep is six.
 * The stored open-state machinery left with the accordion: remembering which
 * folder was open is meaningless when nothing folds.
 *
 * WHAT THE FLAPS WEAR, each ruling Dan's:
 *   · its FAMILY's wash as the ground, full hue as the left spine — the
 *     colour axis verify33 built ("I WANT COLOR"), one hue per family so no
 *     two flaps match ("all these all of the same hue? — they might be
 *     better with black font instead");
 *   · INK text on the pale washes — that same black-font ruling;
 *   · the label in FluOLinGo Hand ("oh use FluOLinGo font for those tabs!");
 *   · no tail slack — the flap column is as wide as its longest label and no
 *     wider ("as long as the longest among them without redundant space at
 *     the tails"); the dropdown's own width follows in SiteTopBar.
 *
 * The family whose page is open keeps a cue that costs no colour: the full
 * hue for its ground would drown ink text (the dopamine mock proved it), so
 * the active flap thickens its spine and bolds instead.
 */
import Link from "next/link";
import { FAMILIES, activitiesIn, familyShort, type FamilyKey } from "@/content/activities";

/** The family a menu activeKey belongs to — units count as Goals'. */
function owningFamily(activeKey?: string): FamilyKey | undefined {
  if (!activeKey) return undefined;
  if (activeKey.startsWith("unit-") || activeKey === "goals" || activeKey === "home") return "goals";
  const fam = FAMILIES.find((f) => f.key === activeKey);
  if (fam) return fam.key;
  return FAMILIES.find((f) => activitiesIn(f.key).some((a) => a.key === activeKey))?.key;
}

export default function RailGroups({
  activeKey,
  onNavigate,
}: {
  activeKey?: string;
  /** Close the ☰ after a link is followed — a menu that stays open over the
   *  page it just opened is a bug. */
  onNavigate?: () => void;
}) {
  const owning = owningFamily(activeKey);
  return (
    <>
      {FAMILIES.map((f) => {
        const active = f.key === owning;
        return (
          <Link
            key={f.key}
            href={f.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={`fluo-band-hand flex items-center gap-2 whitespace-nowrap rounded-md border-l-[6px] py-1.5 pl-2.5 pr-3 text-[17px] leading-tight text-[color:var(--cahier-ink)] no-underline ${active ? "border-l-[9px] font-bold" : ""}`}
            style={{
              background: `var(--fam-${f.key}-wash)`,
              borderLeftColor: `var(--fam-${f.key})`,
            }}
          >
            <span aria-hidden>{f.emoji}</span> {familyShort(f)}
          </Link>
        );
      })}
    </>
  );
}
