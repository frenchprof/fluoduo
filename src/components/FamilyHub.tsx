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
        {/* auto-rows-fr: EQUAL HEIGHT, not just equal width (Dan, 1 Sep, on the
            hub mock-ups: "i need the buttons to be of equal height (not just
            equal width)"). `h-full` on the tile only fills the row it is in, and
            in the single column a phone gets, every tile is its own row — so
            /games shipped tiles of 84px and 70px depending on whether the blurb
            wrapped. Measured, not eyeballed: the hub scan reads every tile's
            box and fails on more than one distinct height. */}
        <ul className="grid auto-rows-fr gap-2.5 sm:grid-cols-2">
          {tiles.map((a) => (
            <li key={a.key}>
              <Link
                href={a.href as string}
                className="flex h-full items-start gap-3 rounded-2xl border-2 border-b-4 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] p-3 no-underline transition hover:-translate-y-0.5"
              >
                <ActivityIcon activityKey={a.key} emoji={a.emoji} />
                <span className="min-w-0">
                  {/* Tile names wear the brand hand in heavy bold (Dan,
                      5 Sep — the half-width-button treatment, Réglages
                      first): narrower, so long names fit their tile. */}
                  {/* text-base, not 16px: rem sizes follow the reader's own
                      font setting (Dan, 5 Sep: "shouldn't font sizes be
                      relative...?" — relative to the READER, yes; to the
                      screen, no: wide screens get more columns, not bigger
                      letters). */}
                  <span className="fluo-btn-hand block text-base leading-tight text-[color:var(--cahier-ink)]">
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
      </div>
    </CahierShell>
  );
}
