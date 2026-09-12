import MapRedirect from "./MapRedirect";

/** 🗺️ The Map — RETIRED 2026-09-12, forwards to Home.
 *
 *  Dan, with the two pages side by side: *"We have two pages doing the same
 *  thing: The Home page + The Map. Can we just keep the Bienvenue one … and
 *  move the 3D-2D switch and the zoom control and navigators '> Goal', legend
 *  there."* They really were the same thing — this page framed `MapBody`, and
 *  Home drew the same 3D scene `MapBody` draws, minus the four controls.
 *  Home renders `MapBody` itself now, so all four moved with it.
 *
 *  THE URL SURVIVES, as every retired route here does (/skills, /practice,
 *  /games all forward rather than 404). See MapRedirect for why the search and
 *  hash travel with it.
 *
 *  `/map/embed` IS DELETED WITH IT, and that is the check's doing rather than
 *  a judgement call: `verify117` holds that a route with an `/embed` twin must
 *  frame that twin, "or the twin is left over". This page was its only mount,
 *  so the moment it stopped framing, the twin was unreachable — and a
 *  chrome-free route nothing opens is the kind of thing a later session finds
 *  and mistakes for a feature.
 *
 *  `/map/standalone` STAYS. It is the deliberately bare map built on 6 Sep for
 *  somebody else's page (*"can i have it as a standalone map which we then
 *  embed into our interface on our web"*), its own docstring records that it
 *  moved out of /map/embed for exactly that job, and nothing here was ever it.
 */
export const metadata = { title: "Map of FluOLinGo-land — FluOLinGo" };

export default function MapPage() {
  return <MapRedirect />;
}
