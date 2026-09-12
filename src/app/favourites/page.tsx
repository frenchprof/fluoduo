import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** /favourites — the pages a learner starred, in the folders they made
 *  (Dan, 2026-09-12: "there should be a proper favourites page").
 *
 *  Reached from the ★ beside the account chip, which is where Dan put it:
 *  "At the top right next to their name". It is deliberately NOT in the ☰
 *  menu — that grid is seven families with fixed membership (9 Sep), and
 *  this is not an eighth. */
export const metadata = { title: "Favourites — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell active="favourites" band={{ title: "Favourites" }}>
      <EmbedFrame src="/favourites/embed" title="Favourites" />
    </CahierShell>
  );
}
