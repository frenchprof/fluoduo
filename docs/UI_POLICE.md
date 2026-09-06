# The UI Police charter — 90 checks (6 Sep 2026)

Dan ran thirteen rounds of design-video checklists against the app on 5–6 Sep
("the UI police is coming and we need to make sure we pass the checks"),
merged them into this list, and blessed items 84–90 — the rules the audit
found ALREADY ALIVE in the app that the video lists missed. Every lane reads
this before touching a surface. Where an item has a verify check, the check
wins arguments; where it names a Dan ruling, AGENTS.md carries the quote.

Convictions from the audit, for the record — the app failed five of ninety,
all fixed the same day: invisible dark-mode text (#190), sub-44px tap targets
(#192), pixel-nailed type (#191, verify106), the sterile 404 (#194), and the
first-run prose the language pass cut (#188, verify104).

## Affordances & feedback

1. Selected / not, active nav, gray = inactive — UI signifies without instructions
2. Every control: default · hover · pressed · disabled (+ loading when async)
3. Micro-interactions confirm actions (copy / save / show — not silent)
4. Overlays keep text readable (gradient / blur over imagery)
5. Contextual chrome by mode — page-specific actions over permanent clutter
6. Hover = lighter/brighter on the brand ramp; pressed = darker
7. Long-press = right-click / context menu where useful
8. Buttons feel pressed (slide / scale) — not color-only
9. Tooltips delayed (~1000ms) or long-press on mobile — no hover clutter

## Hierarchy & layout

10. Most important = bigger / higher / more color
11. Images/icons for scan; reward/CTA treated as special
12. Group related items; whitespace over fake structure
13. Standardize on a **4/8px grid**
14. Cards group content — avoid double-nested cards
15. Cards: group related data, rank by importance, icon rows; no label clutter
16. Lose unnecessary divider lines — use spacing or a subtle row wash
17. One direction per mobile section (vertical *or* horizontal)
18. One screen, one job (Home is the exception); else new page or bottom sheet
19. Margins of safety — text never kisses edges/art
20. Humans pick layout — no duplicate KPI strips, no dead cards
21. Group settings/links into popovers
22. **5-second test** — core idea of a section readable immediately
23. Grid-driven sections; don't cram components/shapes
24. Expand-from-icon search when space is tight

## Mobile

25. Bottom bar **3–5** max (prefer ≤4); thumb-reach; **≥44×44** targets
26. Don't shrink type — aim **~17px** readable base on phone
27. Prefer cards for grouping when whitespace is scarce
28. Bottom sheets for extra context without leaving the flow
29. Standard gestures (back-swipe, sheet dismiss); educate if non-obvious
30. Empty states (first-run + no-results): imagery + guidance pointing at the primary CTA
31. Swipe-to-dismiss for toast/notification stacks where used

## Type & icons

32. One sans for chrome + at most one personality serif (can-dos / brand)
33. Big titles: line-height ~110–120%; **>70–80px kern −2% to −4%**
34. ≤6 font sizes per screen (tighter on dense drills)
35. Icons ≈ text line-height; clear primary / secondary CTAs
36. Lucide/Phosphor for chrome — emoji only as intentional brand, not AI glue

## Corners & craft

37. Nested radii: outer larger, **inner smaller** (even visual gap)
38. Prefer continuous / iOS-smoothed corners on keys & cards

## Color system

39. Simple surfaces: **~60% neutral / 30% secondary / 10% accent**
40. **L1 Neutrals:** ≥4 background layers, 1–2 strokes (light, never black),
    3 text variants; no pure white/black desk
41. Bright color on foreground + status only — not full-bleed backgrounds
42. Build ramps in **HSB/OKLCH** (e.g. sat↑ / bright↓ steps), not random HEX
43. **L2 Brand scale:** highlighter + `--dopa-*` ramp (default / hover /
    pressed / soft bg); wider steps in dark
44. Adapt brand shades for hierarchy/a11y inside tokens
45. **L3 Semantic:** success / miss / streak / danger / progress — purpose, not decoration
46. **L4 Theming:** family washes = OKLCH hue shift on neutrals (not a new random palette)
47. Dark mode = dedicated layered backgrounds — **never invert** light mode
48. Prefer micro-charts/maps for data meaning over rainbow buttons
49. Soft depth (shadow or lighter-on-darker); if the shadow is the first
    thing you notice, it's wrong
50. No AI rainbow / no hard hex outside Cahier/`--dopa-*` without review

## Anti–vibe-code

51. Busy cards → ⋮ menu / sheets; don't show every action always
52. Complex create/edit → modal or sheet; advanced options collapsed by default
53. Account card (or photo), not gradient letter-avatars
54. Useful low-hanging features over decorative chrome
55. Landing / first trust = skewed real product screenshots, not lame icon rows
56. Pricing (if gated): fewer tiers, clear hero price, show discount +
    next-tier value; upgrade limits via slide/sheet — not strikethrough spam

## Soul / play / motion / surprise

57. Strong identity: **Cahier paper · ink · highlighter** — not sterile SaaS gray
58. Texture from that identity (foolscap / ink-lip / lacquer)
59. Frankensteining: steal structure from best apps; keep our skin + beginner locks
60. Relatable domain imagery matching the learning target
61. Delight doodles/twinkles support the message — never crowd text, CTAs, or FR targets
62. Motion for **clarity first**, delight second
63. Animated narrative for progress/path/bag where it teaches; human EN copy
64. Occasional pattern break (reward, expand, hover) — rare and intentional
65. Progress that "draws" on long paths/forms
66. Reward toasts with loading + celebration states
67. Shimmer/gradient strokes rare + pausable for a11y
68. Finishing touches on 404 / empty / blocked / offline — still on-brand
    (the 404 asks « Où sommes-nous ? » — #194)

## AI surfaces (ChaTutor / Compose only)

69. Giant, obvious prompt/input as the hero of that screen
70. Context chips / mode chips / upload previews on the input
71. Retrievable history: search · snippet · delete
72. Persistent memory panel users can see and clear
73. Inline refine on answers (highlight → change), not only full regen
74. Show work / trail when trust matters (steps, WHY)
75. Real-time wait UX: stream, dots, or shimmer skeletons
76. Soft-glass / confidence only on AI chrome — **Cahier stays the desk**

## FluOLinGo locks (always on)

77. Absolute beginners — **EN chrome**; French only as learning target
78. Zero-French readable — cues can't depend on reading French
79. Dopamine on rewards (Continue / streak / XP) — not ink-quiet
80. Delight / surprise / animation never delays or obscures a cold guess
81. AI glass never replaces Cahier for drills / games / Home
82. Hover-heavy polish is desktop-secondary; phone uses press / sheet / long-press
83. verify / token gate on new color

## The audit's additions (Dan-blessed, 6 Sep — already alive, now locked)

84. **On-screen keyboard hints** where keys work — "⌨️ 1–4 pick · ⏎ next · R 🔊"
    under every keyboard exercise; a shortcut nobody can discover is not a feature
85. **Reduced motion is honoured** — every animation stills under
    `prefers-reduced-motion` (the global kill-switch in globals.css); new
    animations inherit it or ship their own still
86. **Keyboard focus ring on every control** — the global `:focus-visible`
    outline stays; "ugly outline" is not a reason, invisibility is a fault
87. **French always carries `lang="fr"`** so screen readers use the French
    voice — untagged French read in an English accent is the #183 QC bug,
    never again
88. **Type in reader-relative units** — sizes follow the READER's font
    setting, never the screen; no learner-facing px sizes (verify106 fails
    the build on them)
89. **English never bigger than French, sized against the French on THAT
    card** (Dan, 1 Sep, permanent; verify83) — the reference never
    outshouts the target
90. **Declared `color-scheme`** so native controls (selects, checkboxes,
    scrollbars) match the theme — the quiet half of #190; a future dark
    cahier declares dark the same way
