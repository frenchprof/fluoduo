# 11 — Responsive behaviour

## Design intent (from code)

- **Mobile-first chrome:** below `1100px`, Cahier tab rail hides; ☰ menu (`cahier-menu`) shows (`globals.css` + `CahierShell.tsx` comments).
- **Desktop rail:** `@media (min-width: 1100px)` reveals horizontal unit flaps; optional saved content width applies only when rail is visible (`CahierFrame` / shell comments).
- **Phone tweaks:** `@media (max-width: 639px)` block in `globals.css` for smaller-screen adjustments.
- **Home road map:** “sized to the screen” snake layout (`HomeDashboard` / `RoadMap` comments).

## Breakpoint map (observed)

| Mechanism | Threshold / tokens | Role |
|---|---|---|
| CSS `@media (min-width: 1100px)` | 1100px | Show flap rail; hide burger |
| CSS `@media (max-width: 639px)` | 639px | Mobile refinements |
| Tailwind `sm:` | default ~640px | Used in galleries (e.g. Vocabularain `grid-cols-2 sm:grid-cols-3`), some games |
| Tailwind `md:` / `lg:` | sporadic | Teacher tables, a few practice layouts — **not** the primary shell system |
| `prefers-reduced-motion` | user preference | Animation suppression |
| `prefers-color-scheme: dark` | present in `:root` defaults | Early template dark vars; product is light “cahier” skin — dark scheme largely unused by fluo/cahier tokens |

## Shell behaviour (`CahierShell`)

- Width preference / expand control targeted at desktop (≥1100px).
- Pulsing expand control (`fixed` ⤢) when page shorter than viewport on wide screens.
- Tool flaps demoted to lower tier / menu on smaller viewports (unit flaps remain primary).

## Surfaces with explicit responsive work

| Surface | Behaviour |
|---|---|
| Home hero | Single-row icon actions; nowrap / break rules for brand text (comments cite phone text size) |
| Vocabularain / LexicaLater galleries | 2-col → `sm:` 3-col grids |
| Practice Index | `overflow-x-auto` on matrix tables; search field `max-w-xs` |
| Teacher tables | `overflow-x-auto` wrappers (`ui.tsx`) |
| Overlays (search, ranking, tutor bubbles) | `w-[min(92vw,…)]`, `max-w-[85%]` chat bubbles |
| Games (NumBus, Letris) | Many `sm:` text/size tweaks; help dialogs `max-w-sm` + padding |

## Risks / inconsistencies

1. **Two responsive systems** — Shell is CSS 1100/639; many feature pages use Tailwind `sm`/`md` inconsistently. Teacher dashboard is denser and less “cahier-mobile” than learner drills.
2. **Wide matrices** — `/activities` and teacher tables rely on horizontal scroll; usable but not reflowed.
3. **Game boards** — Letris / Lexicalator / NumBus are interaction-heavy; column widths and fixed tile heights (`h-[44px]` etc.) may crowd narrow phones (not re-measured this pass).
4. **Touch vs click** — `title` tooltips used for control names (Flip It, Letris pills) are weak on touch.
5. **Fixed chrome stacking** — Feedback button, SuiteBanner, RewardToast, AccentBar, KeyNav all global; small viewports accumulate floating UI.
6. **Saved desktop width** — intentionally ignored below 1100px to avoid clipped layouts; good, but learners switching devices may see different density.

## Tailwind utility density

Grep count of `sm:`/`md:`/`lg:`/`xl:` utilities is concentrated in a minority of files (NumBus exceptionally high ~60; teacher/home/practice moderate; many Content files near-zero beyond shell). Large practice modules often assume a single column `max-w-3xl` / `max-w-2xl` wrapper rather than multi-breakpoint layouts.

## Viewport meta

Next.js App Router default viewport handling applies; no custom `viewport` export audit beyond standard create-next-app baseline. No contradictory manual meta tags spotted in `layout.tsx`.

## Verification not run this pass

- Device lab / Playwright viewport matrix.
- iOS Safari Web Speech / mic permission UX for Say It / WorDrill.
- Landscape game playability.
