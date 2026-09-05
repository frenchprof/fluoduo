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
 * NO INTRO PROSE, AND NO BLURBS EITHER (Dan, 5 Sep, shown the hub: "why are
 * these still width-occupying buttons. We don't need the desxruption of the
 * acticities, not here"). The 1 Sep position — a blurb helps you choose —
 * is overruled for hubs: the name and icon are the choice, and dropping the
 * blurb is what lets the tiles go half-width under the no-full-width-control
 * rule (AGENTS.md, same day). The blurbs still exist in the registry for
 * surfaces that want them (the guide's title attributes, for one).
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
    /* ONE HEADING AND NO COUNT, both by the same litmus test.
       Dan, 1 Sep: "Do we need that number on the right end of that strip for
       every strip?" and then "drop the redundant label Practice too!". This
       page used to print the family name twice — once on the shell band, once
       on a SectionBand right under it — and the tile count twice with it. Four
       pieces of furniture telling a learner two things they were already
       looking at.
       A count earns its place when it describes what you CANNOT see ("18 words"
       on a closed fold); an open list counts itself. A label earns its place
       when it names something the heading above does not.
       SectionBand is gone from this page rather than stripped: its own contract
       is that `label` is always present, because colour must never be the only
       cue for a section. That invariant is right and untouched — a hub simply
       has one section, so it needs one heading, and the shell band is it. */
    <CahierShell active={activeKey} band={{ title: familyShort(family) }}>
      <div className="p-3">
        {/* TWO COLUMNS ON EVERY SCREEN — the no-full-width-control rule
            (AGENTS.md, 5 Sep). auto-rows-fr keeps Dan's 1 Sep equal-height
            ruling ("i need the buttons to be of equal height (not just
            equal width)"); with the blurbs gone the tiles are one line
            tall anyway, but a two-line name (VocabulaRain at a narrow
            width) must not make its neighbour shorter. */}
        <ul className="grid grid-cols-2 auto-rows-fr gap-2.5">
          {tiles.map((a) => (
            <li key={a.key}>
              <Link
                href={a.href as string}
                className="flex h-full items-center gap-2.5 rounded-2xl border-2 border-b-4 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] p-2.5 no-underline transition hover:-translate-y-0.5"
              >
                <ActivityIcon activityKey={a.key} emoji={a.emoji} />
                {/* Brand hand, heavy bold, rem-sized — the half-width-button
                    treatment (Dan, 5 Sep; Réglages first). */}
                <span className="fluo-btn-hand min-w-0 text-base leading-tight text-[color:var(--cahier-ink)]">
                  {a.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </CahierShell>
  );
}
