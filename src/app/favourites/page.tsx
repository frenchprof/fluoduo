import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** /favourites — the pages a learner starred, in the folders they made
 *  (Dan, 2026-09-12: "there should be a proper favourites page").
 *
 *  TWO DOORS, AND THE SECOND ONE IS THE POINT. The ★ beside the account chip
 *  is where Dan first put it — "At the top right next to their name" — but
 *  that ★ only becomes a LINK once something is starred; before that a tap
 *  toggles. So it was joined the same day by a tile in the ☰ menu's yellow
 *  LESSON strip, in the slot the map gave up ("Map already has multiple doors
 *  and does not need this space"). A learner who has starred nothing can now
 *  reach the page and find out what it is for.
 *
 *  YELLOW, BECAUSE ITS DOOR IS ("make the favourites page yellow to match its
 *  door") — see `SITE_FAMILY` in activities.ts, where `favourites` reads
 *  "goals". It borrows Lesson's pen; it is not a Lesson activity and is not in
 *  ACTIVITIES at all.
 *
 *  AND IT NAMES ITS OWN GLYPH. The band's default is
 *  `activity(active)?.emoji ?? familyEmoji(famKey)`, and this page is in
 *  neither list — so going yellow put Lesson's 🧑‍🏫 on it, a teacher on a page
 *  that is not a lesson, and one that contradicted the ★ on the tile that
 *  opens it. The ★ here is the same one the top-bar button and the page's own
 *  crumb wear. Not ⭐, which is XP. */
export const metadata = { title: "Favourites — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell active="favourites" band={{ title: "Favourites", emoji: "★" }}>
      <EmbedFrame src="/favourites/embed" title="Favourites" />
    </CahierShell>
  );
}
