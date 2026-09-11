/**
 * /profil/embed — Profile, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. `/profil` is the page a learner opens; this is
 * what runs in the frame it holds.
 *
 * ── IT USED TO DRAW A SECOND NOTEBOOK (Dan, 2026-09-11: *"Profiles, ChaTutor
 *    page looks doubleframed"*) ────────────────────────────────────────────
 *
 * This file rendered `CahierShell` — the notebook — while already being loaded
 * INSIDE a `CahierShell`. `html[data-embed]` (globals.css) hides the shell's
 * FURNITURE in a framed document (site bar, band, coils, shadow, radius, family
 * spine), and that was taken for "nothing is left". Two things were left, and
 * they are the two that make a sheet look like a sheet: `.cahier-page`'s paper
 * and its 32px ruling, and `.cahier-foolscap`'s 28px ruling. So a SECOND sheet
 * was laid on the page's own, starting 48px in from the left — the well's
 * gutter, where the coils are — and the join showed: measured on the built app
 * at 390px, the ruled lines in that 48px strip sit at one height and the ones
 * inside the frame at another, and some stop dead at the frame's edge.
 *
 * `/map/embed` is the shape that was already right: it renders the map and no
 * notebook. This renders the profile and no notebook. The frame is transparent
 * (`html[data-embed] body`, globals.css) so the page's ONE sheet — paper,
 * ruling and all — runs straight through it.
 *
 * THE BAND WENT WITH THE SHELL, AND LOSES NOTHING: `band={{ title: "Moi" }}`
 * was already hidden here by `html[data-embed] .cahier-page > .page-band`,
 * because the page around the frame draws the strip. The padding replaces what
 * the shell's own well gave this content — `html[data-embed]
 * .cahier-foolscap`'s 0.75rem sides and the well's 1.25rem top and bottom — so
 * nothing moves but the paper. ProfileContent constrains its own body.
 */
/**
 * 🎖️ Profil — the SAME page as /moi since the 2026-08-22 merge.
 *
 * It used to be the economy surface: level ring, XP bar, badge grid, gem
 * boutique, and a card at the top pointing at /moi for "the learning". Two
 * profile pages, and the one a learner opened to ask "what do I do now?"
 * answered with a level ring. Dan merged them; the economy is the THRILLS
 * strip inside the one page, and this route is kept (rather than redirected)
 * because it is linked from the account chip, printed handouts and old
 * bookmarks — a live page beats a hop.
 */
import ProfileContent from "@/components/ProfileContent";

export const metadata = { title: "My Profile — FluOLinGo" };

export default function Page() {
  return (
    <div className="touch-pan-y min-h-dvh px-3 py-5">
      <ProfileContent />
    </div>
  );
}
