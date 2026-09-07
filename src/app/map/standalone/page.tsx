import EmbedBody from "../embed/EmbedBody";

/**
 * /map/standalone — THE MAP AS A STANDALONE THING, for somebody else's page.
 *
 * Dan, 6 Sep: *"can i have it as a standalone map which we then embed into our
 * interface on our web"*. The fifty stops, their bands and the road, and
 * nothing else: no notebook frame, no site bar, no bottom bar, no heading band.
 *
 *     <iframe src="/map/standalone" style="width:100%;height:620px;border:0"
 *             title="FluOLinGo course map"></iframe>
 *
 * IT MOVED HERE FROM /map/embed on 7 Sep, when every station in the app gained
 * an `/embed` twin of its own and that name stopped meaning "for outsiders" and
 * started meaning "the thing the cahier frames". Two different jobs had landed
 * on one URL: this one drops the 2D/3D switch, the zoom and the stop popup
 * BECAUSE an embed has no app around it, and the app's own map needs all three.
 *
 * It is the same Map2DGrid the app renders, so the two cannot drift.
 */
export const metadata = {
  title: "Course map — FluOLinGo",
  description: "The fifty goals of LAF1201, at a glance.",
};

export default function MapStandalonePage() {
  return <EmbedBody />;
}
