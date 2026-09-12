/**
 * /favourites/embed — the list itself, running inside the cahier `/favourites`
 * draws rather than drawing a second one.
 *
 * NO `CahierShell` HERE. The 11 Sep ruling ("One sheet of paper"): a framed
 * station that renders a shell lays a second sheet of ruled paper over the
 * page's own, 48px in, and the join shows. `/map/embed` and `/tutor/embed` are
 * the shape that is right; this follows them.
 */
import FavouritesContent from "@/components/FavouritesContent";

export const metadata = { title: "Favourites — FluOLinGo" };

export default function Page() {
  return <FavouritesContent />;
}
