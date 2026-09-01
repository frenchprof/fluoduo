/**
 * One family's front door — every activity in it, and nothing else.
 *
 * Dan, 2026-08-30, looking at the bottom bar: "can we first establish if those
 * are really the five that we need anchored below? the most likely shortcuts
 * needed by learners should go there."
 *
 * The five slots were right — they are the five families, his own call of
 * 2026-08-22. Two of the five DOORS were not. `BOTTOM_NAV` takes each slot's
 * href straight from `FAMILIES`, and four of those families already had a hub
 * page under another name (Goals is Home, Practice is the map, Review is the
 * Reviser, User is /moi). SvPlay and Skills had none, so their href had to
 * name one arbitrary member: 🎮 opened VocabulaRain — one game of four, with
 * no shortcut at all to the other three — and 💪 opened ConjugaZone, one of
 * six. This is the missing page, so the shortcut can point at the family.
 *
 * It lists the family's activities in the registry's authored order, which is
 * the order Dan set for each family ("Skills: forms → receptive → productive",
 * "SvPlay: gentlest first"), never alphabetical.
 *
 * NO INTRO PROSE. A blurb per tile helps you choose between six things and
 * stays; a paragraph at the top explaining what "Skills" means does not help
 * anyone find anything, which is the litmus test.
 *
 * NOT AUTH-GATED. The activities behind these tiles gate themselves; browsing
 * has never needed a sign-in, and a wall in front of a menu would be a wall in
 * front of finding out what the app contains.
 *
 * THE SAME FURNITURE AS EVERY OTHER PAGE (Dan, 2026-08-30: "make sure for the
 * desktop version we have the same uniformed look of the cahier with the
 * headers and menus etc for all pages AND HUBS"). The first version put a bare
 * grid of tiles on the ruled paper — shell and heading strip, but none of the
 * section furniture every landing wears. It now uses the same `SectionBand` as
 * ActivityLanding, with the same spine, wash and count pill, so a hub and a
 * landing are the same kind of page at a glance.
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import SectionBand from "@/components/SectionBand";
import ActivityIcon from "@/components/ActivityIcon";
import { activitiesIn, familyShort, hubFamily } from "@/content/activities";

export default function FamilyHub({ activeKey }: { activeKey: string }) {
  const family = hubFamily(activeKey);
  // A hub for a family that does not exist is a wiring fault, not a blank
  // page to render politely: verify52 fails the build on it. Guarding here
  // only keeps the types honest.
  if (!family) return null;
  // Only the ones with a door. A deck-scoped activity (`href: null`) is
  // reached from a stop, and a tile linking nowhere is worse than no tile.
  const tiles = activitiesIn(family.key).filter((a) => a.href);

  return (
    // No count on the strip (Dan, 1 Sep) — the SectionBand directly below
    // already carries it as its pill, which is where a count belongs: beside
    // the thing it counts.
    <CahierShell active={activeKey} band={{ title: familyShort(family) }}>
      <SectionBand
        family={family.key}
        label={`${family.emoji} ${familyShort(family)}`}
        pill={`${tiles.length}`}
      >
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {tiles.map((a) => (
            <li key={a.key}>
              <Link
                href={a.href as string}
                className="flex h-full items-start gap-3 rounded-2xl border-2 border-b-4 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] p-3 no-underline transition hover:-translate-y-0.5"
              >
                <ActivityIcon activityKey={a.key} emoji={a.emoji} />
                <span className="min-w-0">
                  <span className="block text-[15px] font-black leading-tight text-[color:var(--cahier-ink)]">
                    {a.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-[color:var(--cahier-ink-soft)]">
                    {a.blurb}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionBand>
    </CahierShell>
  );
}
