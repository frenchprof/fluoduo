/**
 * /map/embed — THE MAP, running inside the cahier.
 *
 * Dan, 2026-09-07: everything runs in the cahier in an iframe. `/map` is the
 * notebook; this is the map inside it.
 *
 * IT RENDERS `MapBody`, THE APP'S MAP — with the 2D/3D switch, the zoom field
 * and the stop popup. The first version of this frame pointed at `EmbedBody`,
 * the deliberately bare map built on 6 Sep for OTHER people's pages ("can i
 * have it as a standalone map which we then embed into our interface on our
 * web"), whose docstring says in as many words that it drops those three
 * because "an embed has no app around it to return to". Inside the cahier
 * there IS an app around it, and pointing the frame at the bare one quietly
 * took the switch back off the map — the exact thing Dan asked to be put ON it
 * on 2 Sep. MapBody had no importer left at all, which is how it was found.
 *
 * The bare one still exists and still has its job: see /map/standalone.
 */
import MapBody from "../MapBody";

export const metadata = { title: "Map of FluOLinGo-land — FluOLinGo" };

export default function MapEmbedPage() {
  return (
    <div className="map-full mx-auto max-w-3xl">
      <MapBody />
    </div>
  );
}
