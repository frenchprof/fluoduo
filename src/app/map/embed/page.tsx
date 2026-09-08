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
 *
 * ── TWO FAULTS FIXED HERE ON 8 SEP, both from one line of markup ─────────────
 *
 * THE PAPER. Dan: *"the background should not be white but the actual page
 * lined background"*. Every other framed station renders a CahierShell inside
 * its frame — the chrome is hidden by `html[data-embed]` in globals.css, so
 * what survives is exactly the ruled, family-tinted paper. This frame rendered
 * a bare `<div>`, so nothing inside it painted paper at all and the browser's
 * own white body showed through the transparent iframe. The notebook around it
 * was drawing pale-green ruled paper the whole time; the frame was covering it.
 * `cahier-surface fam-goals cahier-foolscap` puts that ground back: the tinted
 * paper, the ruling, and nothing else. NOT `.cahier-page` — that was tried
 * first and it drags the notebook's FORM THEME in with it
 * (`.cahier-page input {padding:.55rem .75rem; font-size:.95rem; width:100%}`),
 * which blew the zoom well from 52px to 63px and clipped its leading digit
 * harder than before. `border-l-0` drops the 6px family spine for the same
 * reason the CSS drops it for a framed `.cahier-page`: the notebook outside
 * the frame already draws one, and a second reads as a stray green rule.
 *
 * THE WIDTH. On a 1440 desktop the map was a 421px block with 452px of blank
 * paper on either side, and no zoom could fix it — zooming grew the discs, not
 * the layout. The cause was `mx-auto` on this div: the frame's `<body>` is
 * `flex flex-col`, and auto side margins on a flex item OVERRIDE the default
 * cross-axis stretch, so the box shrink-wrapped to its content — five 44px
 * discs and their gaps, 421px — and `max-w-3xl` never came into it. `w-full`
 * restores the stretch; the cap then does what it always claimed to.
 */
import MapBody from "../MapBody";

export const metadata = { title: "Map of FluOLinGo-land — FluOLinGo" };

export default function MapEmbedPage() {
  return (
    <div className="cahier-surface fam-goals cahier-foolscap min-h-screen border-l-0 py-3">
      <div className="map-full mx-auto w-full max-w-3xl px-2 lg:max-w-5xl">
        <MapBody />
      </div>
    </div>
  );
}
