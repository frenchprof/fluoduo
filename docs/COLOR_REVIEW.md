# Colour review — the whole site (21 Aug 2026)

Brief: dopamine-driven design. High-energy saturated colour — sunshine yellow,
coral, electric blue, magenta, acid lime — spent on joy, motivation and repeat
engagement, under a 60-30-10 discipline, with reward cues and semantic grammar
mapping colour-coded.

Scope: all 50 routes, `src/app/globals.css` (1315 lines, 149 distinct colour
values), every component, game and native lesson. Every number below was
measured, not estimated — the script is in the appendix.

---

## Verdict

**FluOlinGo is not under-coloured. It is under-*governed*.**

The site already contains plenty of saturated colour — 508 raw hex values across
53 files, 47% of them high-chroma. But almost none of it is on-system, so none
of it can be *aimed*. Meanwhile the colours that ARE on-system — the tokens that
paint every governed surface — sit at chroma 0.10–0.15, roughly 30–50% below the
dopamine register the brief asks for (its anchors measure 0.18–0.25).

The result is the exact inverse of what the brief wants:

- the **loudest** colour on the site is in the games, ungoverned and unreachable;
- the **quietest** colour is on the reward moments — every counter in the Home
  hero renders in the same warm near-black as body text.

The 60-30-10 ground is genuinely good and should not be touched. The problem is
entirely in the 10%.

---

## 1 · The 60-30-10 audit

| Band | What paints it | Verdict |
|---|---|---|
| **60% ground** | `--cahier-paper` `#faf6ee`, `--cahier-paper-raised` `#fefbf7`, `--cahier-desk` `#e3ddd4` — warm kraft, chroma 0.007–0.014 | ✅ **Correct and distinctive.** A near-neutral warm paper is exactly the clean ground the rule asks for, and "Le Cahier" makes it identity rather than default. Keep. |
| **30% structure** | `--cahier-ink` `#312620` (13.64:1), `--cahier-ink-soft` `#655c55` (6.11:1), `--cahier-line`, the 2px ink hairline + solid bottom lip idiom | ✅ **Strong.** The outline-and-lip idiom is the single best thing in this system — see §6, it is what lets a loud palette in without breaking contrast. Keep. |
| **10% accents** | 11 competing hue families, none reserved for reward | ❌ **This is the whole problem.** Detailed below. |

The stylesheet's chromatic values break down as: 27 lime/chartreuse, 18 yellow,
14 violet, 13 green, 9 teal, 9 orange, 8 red, 5 magenta, 4 blue, 4 cyan. That is
not a 10% accent — it is a second full palette with no hierarchy inside it.

---

## 2 · Finding A — reward cues are colourless *(highest impact)*

`src/app/HomeDashboard.tsx:229–250`. The Home hero report card is the site's
main motivation surface. Its five marks — **level · streak · course% · XP ·
lessons** — are all rendered in one colour:

```
text-[color:var(--fluo-ink)]      // → --cahier-ink → #312620, warm near-black
```

Level-up, streak and XP are the three canonical dopamine hooks, and on
FluOlinGo they are typographically identical to a paragraph of body text. The
one exception is telling: the streak multiplier (`HomeDashboard.tsx:136`) gets
`--fluo-danger` — a **muted brick red** whose semantic name is *danger*. The
site's only coloured reward is painted in its error colour.

Downstream, the same flatness: `RewardToast.tsx:49–55` — the toast that fires on
a genuine win — is white card, ink border, ink title, soft-ink subtitle. No
colour at all.

**This is the single highest-leverage change on the site**, and the cheapest:
five token swaps in one file plus one in `RewardToast`.

## 3 · Finding B — accent inflation

There is no "this is a win" colour, because eleven things are already competing
to be the accent:

- 6 rotating card hues (`fluo-h-0…5`)
- 6 activity marker buttons (`.fluo-btn-flip/complete/type/say/arrange/correct`)
- 6 index-tab pastels (`--cahier-t0…t5`)
- 5 region accents (`--region-*`, still flagged provisional per Decision 4)
- 5 purchasable home accents (`economy.ts:138–142`)
- 10 rank badge treatments (`.fluo-rank-1…10`)
- 20 activity hues (`activities.ts`) + 6 site-tab hues (`siteTabs.ts`)
- tier trio, `le`/`la` pair, drill ok/bad pair, chartreuse, gold, teal

Every one of these is decorative rotation — colour that encodes nothing. The
`HUES[i % HUES.length]` pattern was correctly banned by `verify19b.py`, but the
*shape* of the problem survived: hues are still assigned by position in a list,
not by meaning. Under the brief's Semantic Mapping rule, an accent should mean
something; here, having eleven means none of them can.

**Recommendation:** demote all rotating hues to a single tinted-neutral treatment
and reserve saturated colour exclusively for the seven roles in §7.

## 4 · Finding C — two palettes, one site

| | distinct hex | median chroma | governed? |
|---|---|---|---|
| Games (`src/games/`) | 247 | 0.082 | ❌ 0 tokens |
| Pages + components | 55 | 0.142 | partial |
| Core design tokens | — | 0.130 (max 0.187) | ✅ |

The games run on a Duolingo-derived palette — `#58cc02`, `#ffc800`, `#ff4b4b`,
`#1cb0f6` — hard-coded in `tutor/page.tsx`, `VocabularainClient.tsx`,
`Lexicalator.tsx` (103 distinct values in that one file), `NumBus.tsx` (61).

The irony: **this is already the dopamine palette the brief asks for.** It is
simply quarantined in the six surfaces the design system never reached, so the
learner meets high-energy colour only inside a game and never on the path that
leads them there. Tokenise it and point it at the reward moments and the brief
is most of the way answered without inventing anything.

## 5 · Finding D — accessibility

Measured against WCAG 2.2 (4.5:1 body text, 3:1 large text and non-text UI).

### Failing as text on `--cahier-paper`

| Token | Hex | Ratio | |
|---|---|---|---|
| `--tier-medium` | `#d49824` | **2.35** | ✗ fails everywhere |
| `--cahier-gold` | `#c8a24b` | **2.24** | ✗ |
| `--fluo-secondary` (teal) | `#2bb6c2` | **2.28** | ✗ |
| `--drill-ok` | `#10b981` | **2.36** | ✗ |
| `--cahier-ink-faint` | `#867f78` | 3.68 | large text only |
| `--tier-good` | `#428557` | 4.13 | large text only |

`.tier-medium` is already patched to `oklch(48% 0.14 78)` (6.17:1 ✓) for text —
but the raw token is still what paints borders and `--fluo-warn`.

### Failing as non-text UI (needs 3:1)

| Token | Ratio vs paper | Where it matters |
|---|---|---|
| `--cahier-line` `#e3ddd1` | **1.25** | every form input border (`.cahier-page input`) |
| `--cahier-line-strong` `#cabfaf` | **1.68** | bottom-bar top border |
| `--fluo-hl` `#d4f24c` | **1.18** | hero offset shadow — effectively invisible |
| `--cahier-gold` | **2.24** | ⚠️ `.home-map3d-node:focus-visible` outline — **a focus indicator that fails** |
| `--drill-ok` | **2.36** | GameBar progress fill (`GameBar.tsx:77`) |

Two more:

- `.fluo-btn-secondary` and `.fluo-rank-5` put **white on `#2bb6c2` = 2.45:1**.
- The global focus ring `#2d5bff` is fine on paper (4.82) and desk (3.84) but
  drops to **2.83 on `.cahier-btn-primary`** — the ink-filled button.

Chartreuse is fine *as a fill under ink* (11.59:1) — it just cannot ever be a
boundary or a mark on its own.

## 6 · Finding E — colour-blind collisions

Simulated protanopia / deuteranopia / tritanopia, minimum sRGB separation
(<0.20 = not reliably distinguishable):

| Set | protan | deutan | tritan | |
|---|---|---|---|---|
| Tier good/medium/weak | 0.174 | **0.097** | 0.417 | ⚠️ good ≈ weak |
| Region accents (5) | 0.149 | 0.190 | 0.101 | ⚠️ collides in all three |
| Card hues (6) | **0.058** | **0.064** | 0.180 | ⚠️ collides in all three |
| Drill ok/bad | 0.510 | 0.295 | 1.299 | ✅ safe |
| Gender `le`/`la` | 0.799 | 0.888 | 1.145 | ✅ safe |

The **accuracy tier scale is the serious one**: for a deuteranope, "good" and
"weak" are near-identical. It paints `HeatStrip` on four pages and every result
cell in the Index — surfaces where colour is the *only* carrier of the verdict.
Roughly 8% of male learners cannot read them.

The good news: the two pairs that carry the most pedagogical weight — right/wrong
and masculine/feminine — are already safe.

## 7 · Finding F — semantic mapping is defined but unused

The system defines exactly the grammar mapping the brief asks for:

```css
--cahier-le: #2d5bff;   /* masculine (le) */
--cahier-la: #d11149;   /* feminine (la) */
```

Both are contrast-safe (4.82:1, 5.03:1) and colour-blind-safe. **Neither is used
for gender anywhere in the 27 native lessons.** In practice:

- `--cahier-le` has been repurposed into UI chrome — input focus borders, a
  range-slider accent, a column-resize handle.
- `--cahier-la` has become a generic "grammar highlight red" *and* the
  wrong-answer strike-through *and* decorative pillars in the 3D map.

The consequence, in the lessons themselves:

```tsx
// articles-pays.tsx:33-34 — both genders painted the FEMININE colour
<b className="text-[color:var(--cahier-la)]">la</b> + féminin …
<b className="text-[color:var(--cahier-la)]">le</b> + masculin …

// partitifs.tsx:35-38 — all four partitives, one colour, zero information
du (masc) · de la (fém) · de l' (voyelle) · des (pluriel)
```

Same in `prepositions.tsx`, `futur-proche.tsx`, `aimer-infinitif.tsx`.

This is the brief's "enhance learning and improve comprehension — use colours
with facts to associate both and recall the information better", and it is the
one place where colour would do real pedagogical work rather than decorate.
**Gender is the highest-value semantic mapping available and it is currently
being actively mis-taught by colour.** Fixing it is a find-and-replace across
27 files, and it is free — the tokens already exist and already pass.

## 8 · Finding G — two smaller defects

**Vestigial dark mode.** `globals.css:15-20` still carries the Next.js starter's
`prefers-color-scheme: dark` block, flipping `--background` to `#0a0a0a` and
`--foreground` to `#ededed`. `layout.tsx:94` sets no background on `<body>`, so
on any device set to dark mode the area outside `.cahier-desk` — including the
site-wide footer — renders near-black under a fixed-light design system. Either
delete the block or commit to a real dark theme; today it is neither.

**A cold seam in light mode.** For the same reason `<body>` is pure `#ffffff`
while `.cahier-desk` is warm `#e3ddd4` (1.35:1) — a visible cold-white band under
the warm desk on every short page. One line: give `<body>` the desk token.

**Token hygiene.** Components write `var(--cahier-hl, #eaff00)` in 8 places, but
the token resolves to `#d4f24c`. The fallback never fires, so nothing is broken —
but two different chartreuses are recorded in the codebase as "the brand colour".
Pick one.

---

## 9 · Recommended palette

Seven roles, one meaning each. Every value below is measured and passes — the
full grid is in §10.

| Role | Fill | Label | Meaning — the ONLY thing it may mark |
|---|---|---|---|
| **joy** | `#f8c20d` sunshine yellow | ink 8.91:1 | key actions, "do this next" |
| **win** | `#7be650` acid lime | ink 9.24:1 | correct answers, growth, forward momentum |
| **flow** | `#00c5c9` turquoise | ink 6.85:1 | focus states, clean structural contrast |
| **reward** | `#f76143` sunset coral | ink 4.69:1 | progress rewarded, level-up badges |
| **focus** | `#0075e3` electric blue | white 4.51:1 | primary action, navigation |
| **streak** | `#d42a8f` hot magenta | white 4.64:1 | streaks and big wins only |
| **miss** | `#db3834` vivid red | white 4.54:1 | wrong answers |

Chroma runs 0.14–0.22 — squarely in the brief's register (its anchors measure
0.18–0.25), against the current tokens' 0.10–0.15.

### Why this can be loud without failing WCAG

The four light fills (joy, win, flow, reward) measure 1.48–2.91:1 against paper
— below the 3:1 needed for a bare shape. **That is fine, because this design
system never draws a bare shape.** `.cahier-option`, `.fluo-btn`, `.cahier-tab`
and `.cahier-btn` all carry a 1.5–2px ink hairline plus a solid bottom lip; the
hairline measures 13.64:1 and carries the boundary. Fill supplies energy, ink
supplies contrast.

The three darker fills (focus, streak, miss) clear 3:1 unaided (4.19–4.32) and
so may also be used as bare marks — dots, bars, badges.

**Rule, stated once:** *a saturated fill is never the only boundary, and never
the only carrier of meaning.*

### Drop-in token block

```css
:root {
  /* Dopamine 10% — seven roles, one meaning each. Fills carry energy,
     the ink hairline carries contrast. Do not add an eighth. */
  --dopa-joy:         oklch(84% 0.17 88);   /* #f8c20d */
  --dopa-joy-ink:     oklch(50% 0.13 78);   /* #8b5700 — 5.66:1 text */
  --dopa-joy-wash:    oklch(95% 0.06 88);   /* #ffedc1 — chip fill */
  --dopa-joy-on:      var(--cahier-ink);

  --dopa-win:         oklch(83% 0.21 138);  /* #7be650 */
  --dopa-win-ink:     oklch(50% 0.14 145);  /* #1e7729 — 5.26:1 */
  --dopa-win-wash:    oklch(94% 0.07 138);  /* #d5f7ca */
  --dopa-win-on:      var(--cahier-ink);

  --dopa-flow:        oklch(74% 0.14 197);  /* #00c5c9 */
  --dopa-flow-ink:    oklch(48% 0.12 200);  /* #007078 — 5.43:1 */
  --dopa-flow-wash:   oklch(94% 0.05 197);  /* #c5f6f7 */
  --dopa-flow-on:     var(--cahier-ink);

  --dopa-reward:      oklch(68% 0.19 33);   /* #f76143 */
  --dopa-reward-ink:  oklch(50% 0.19 30);   /* #b71c0e — 6.15:1 */
  --dopa-reward-wash: oklch(93% 0.06 33);   /* #ffdacf */
  --dopa-reward-on:   var(--cahier-ink);

  --dopa-focus:       oklch(57% 0.19 254);  /* #0075e3 */
  --dopa-focus-ink:   oklch(48% 0.19 254);  /* #0059c4 — 6.07:1 */
  --dopa-focus-wash:  oklch(93% 0.05 254);  /* #d2eaff */
  --dopa-focus-on:    #fff;

  --dopa-streak:      oklch(59% 0.22 350);  /* #d42a8f */
  --dopa-streak-ink:  oklch(50% 0.23 352);  /* #b80071 — 5.96:1 */
  --dopa-streak-wash: oklch(93% 0.07 350);  /* #ffd5ee */
  --dopa-streak-on:   #fff;

  --dopa-miss:        oklch(59% 0.20 27);   /* #db3834 */
  --dopa-miss-ink:    oklch(50% 0.20 27);   /* #bb0916 — 6.20:1 */
  --dopa-miss-wash:   oklch(93% 0.06 27);   /* #ffd9d2 */
  --dopa-miss-on:     #fff;
}
```

Written in OKLCH to match the Cahier import, and additive — nothing above
overrides an existing token, so nothing shifts until a surface opts in.

### The tier scale, rebuilt

Replace the current green/amber/red trio (deutan separation **0.097**) with
`win` / `joy` / `miss`, which are also separated by **lightness** and not hue
alone:

| | normal | protan | deutan | tritan |
|---|---|---|---|---|
| current | 0.348 | 0.174 ⚠️ | 0.097 ⚠️ | 0.417 |
| proposed | 0.574 | 0.258 ✅ | 0.236 ✅ | 0.589 ✅ |

Safe in all three — but `HeatStrip` and the Index cells should still gain a
glyph or a `title`, because the tier is currently carried by colour alone.

---

## 10 · Measured contrast grid — proposed palette

| Role | Fill | Label on fill | Fill vs paper | Text on paper | Text on wash |
|---|---|---|---|---|---|
| joy | `#f8c20d` | ink **8.91** ✅ | 1.53 † | `#8b5700` **5.66** ✅ | **5.26** ✅ |
| win | `#7be650` | ink **9.24** ✅ | 1.48 † | `#1e7729` **5.26** ✅ | **4.84** ✅ |
| flow | `#00c5c9` | ink **6.85** ✅ | 1.99 † | `#007078` **5.43** ✅ | **4.98** ✅ |
| reward | `#f76143` | ink **4.69** ✅ | 2.91 † | `#b71c0e` **6.15** ✅ | **5.10** ✅ |
| focus | `#0075e3` | white **4.51** ✅ | **4.19** ✅ | `#0059c4` **6.07** ✅ | **5.28** ✅ |
| streak | `#d42a8f` | white **4.64** ✅ | **4.32** ✅ | `#b80071` **5.96** ✅ | **4.89** ✅ |
| miss | `#db3834` | white **4.54** ✅ | **4.22** ✅ | `#bb0916` **6.20** ✅ | **5.13** ✅ |

† boundary carried by the existing 2px ink hairline (13.64:1).

---

## 11 · What to do, in order

Ranked by impact ÷ effort. Nothing here is started — this document is the review.

| # | Change | Files | Why |
|---|---|---|---|
| 1 | **Colour the Home hero marks.** streak → `--dopa-streak`, XP → `--dopa-joy`, course% → `--dopa-win`, level → `--dopa-reward`; `RewardToast` gets the reward fill | 2 | The brief's core ask. Biggest visible change on the site for the least code. |
| 2 | **Fix the focus indicator.** `.home-map3d-node:focus-visible` uses gold at 2.24:1 | 1 | Accessibility defect, one line. |
| 3 | **Fix white-on-teal, 2.45:1.** `.fluo-btn-secondary`, `.fluo-rank-5` | 1 | Accessibility defect, two lines. |
| 4 | **Claim the gender mapping.** `le`→blue, `la`→red across 27 lessons; stop using `--cahier-la` as generic red | ~10 | Free pedagogical win; tokens already exist and already pass. |
| 5 | **Rebuild the tier scale** on win/joy/miss; add a glyph to `HeatStrip` and Index cells | 3 | Fixes a deutan separation of 0.097 on four pages. |
| 6 | **Lift form-input borders** to ≥3:1 (`--cahier-line` is 1.25:1) | 1 | WCAG 1.4.11, one token. |
| 7 | **Body background + delete the dark block** | 2 | Removes the cold seam and the dark-mode trap. |
| 8 | **Tokenise the games' palette** onto the seven roles; lower the ratchet as you go | ~15 | Retires most of the 508 raw hexes and unifies the two palettes. |
| 9 | **Demote the rotating hues** to tinted neutrals | ~8 | Gives the 10% somewhere to land. |

Items 1–7 are roughly a day. Item 8 is the long tail and is exactly what
`verify19b.py --rebaseline` exists to track.

**Decisions needed from Dan before item 1:** the palette in §9 is a proposal, not
an adopted decision — Decision 4 (region accents provisional) and the Cahier
identity both bear on it. Nothing should be applied until it is chosen.

---

## Appendix — method

Contrast per WCAG 2.2 relative luminance. OKLCH converted via the standard
Oklab matrices. Colour-blind simulation uses Machado-style transform matrices
for protanopia, deuteranopia and tritanopia; separation is Euclidean sRGB
distance, with 0.20 as the practical threshold.

Counts come from the same regexes `verify/verify19b.py` uses, so they are
directly comparable to `verify/visual-baseline.json`
(508 raw hex / 768 stock Tailwind classes / 53 files, unchanged by this review —
this document adds no code).
