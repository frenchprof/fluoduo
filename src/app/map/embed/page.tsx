import EmbedBody from "./EmbedBody";

/**
 * /map/embed — THE MAP AS A STANDALONE THING (Dan, 6 Sep: "can i have it as a
 * standalone map which we then embed into our interface on our web").
 *
 * WHAT THIS IS. The fifty stops, their bands and the road, and nothing else:
 * no notebook frame, no site bar, no bottom bar, no heading band. It is the
 * map on its own, at any size its container gives it, so it can be dropped
 * into a page with one line:
 *
 *     <iframe src="/map/embed" style="width:100%;height:620px;border:0"
 *             title="FluOLinGo course map"></iframe>
 *
 * WHY A ROUTE AND NOT A COMPONENT. Map2DGrid was already a component, and
 * /map already renders it — so "make it a component" was done. What was
 * missing is a URL: an embed has to be reachable by something that is not
 * this React tree (the course site, a Canvas page, a slide). next.config sets
 * `output: "export"`, so this builds to out/map/embed.html and can be served
 * from anywhere the rest of the export is.
 *
 * IT IS THE SAME MAP, NOT A COPY. It mounts Map2DGrid — the component /map
 * mounts — so a change to the stops shows up in both, and the two can never
 * drift the way this repo's nav surfaces did for eleven days in August. What
 * the embed does NOT get is the 2D⇄3D switch, the zoom field and the stop
 * popup: those are controls for a learner inside the app, and an embed has no
 * app around it to return to.
 *
 * PROGRESS STILL SHOWS. It reads the same local progress, so a learner who
 * opens the host page in the browser they study in sees their own ticks and
 * their own current stop. A visitor with no progress sees stop 1 as current,
 * which is the correct thing for a course page to show.
 */
export const metadata = {
  title: "Course map — FluOLinGo",
  description: "The fifty goals of LAF1201, at a glance.",
};

export default function MapEmbedPage() {
  return <EmbedBody />;
}
