# Round-2 Audit — Accessibility + Performance stream (2026-07-04)

Build verified fresh (out/ newer than all of src/). Served out/ on :4330, driven with
headless Chromium (playwright-core). Severity C/H/M/L · Effort S/M/L.

## Part A — Verification of round-1 fixes

| Item | Status | Evidence |
|---|---|---|
| A1 SioModal Escape + initial focus | **VERIFIED (partial)** | Driven on /index.html → Unité 0 tile popup: `document.activeElement` = ✕ button (`aria-label="Close"`, inside `[role=dialog]`); Escape closes. **Residual: no focus trap** — Shift+Tab from ✕ moves focus OUT of the dialog into the page behind (round-1 fix spec included "trap"). src/app/SioModal.tsx:122-127 |
| A2 rain palette contrast | **VERIFIED** | All 7 PALETTE colours (LetrisGame.tsx:86-94) vs white text: red 5.62, blue 5.76, green 5.18, purple 6.52, orange 5.05, teal 5.07, pink 5.81 — all ≥4.5:1. Restyled games: emerald-700 on white 5.48:1, amber-700 5.02:1 — pass. (emerald-600 3.77:1 appears only on `aria-hidden` ✓/✗ icons — decorative, exempt.) |
| A3 prefers-reduced-motion | **VERIFIED** | globals.css:685-691 kills animation/transition durations globally. Emulated `reducedMotion: reduce` on /games/letris/tu-vous.html: 13 animated elements found, **0 with effective duration >0.01ms** — vrain/decorative rain suppressed. Bonus: `:focus-visible` ring now global (globals.css:694-697) — A8 focus-visible half landed. |
| A4 Enter→Enter rhythm | **VERIFIED (all 3)** | complete-it/partitifs, grammarathon/partitifs, conjugazone/etre-etudiant: after Enter-check, `activeElement` = "Next →" button; second Enter advances counter 0/8→1/8 (0/14→1/14). Identical `nextRef` pattern in all three Content.tsx. |
| P1 Firestore off non-auth pages | **FAILED (net effect ~zero)** | FeedbackButton.tsx *is* now dynamic-import (line 81) — that part landed. But the Firestore-containing chunk `_next/static/chunks/3rj1yc81ak5gv.js` (**582 KB raw / 167 KB gz**, contains `initializeFirestore`, "Firestore backend") is a **synchronous `<script src>` in every page's HTML**, incl. /practice/grammarathon/partitifs.html and /lessons/aimer.html. Cause: `AuthGate` (wraps nearly every page, incl. games/letris/[setId]/page.tsx:4) → `lib/firebase/auth.ts` → `lib/firebase/usage.ts:9` which statically imports `firebase/firestore`; plus `MyDecks` (home) and `lib/notes/store.ts:16` (flip-it). Pages that load it: **all tested** (home, grammarathon, lessons/aimer, flip-it, letris, activities) at 582 KB each (+29 KB wrapper `2vln85cd6-r93.js`). Fix: dynamic-import firestore inside `usage.ts` logEvent (fire-and-forget already) and in notes/srs stores. Sev H, Effort S. |
| P2 legacy lesson HTML | **VERIFIED** | public/lessons gone; out/lessons contains only the 24 native slug pages (+RSC .txt). Export total: **49 MB** (out/), _next 3.1 MB; the bulk is Next's per-route html+RSC-txt duplication (practice/ 20 MB, decks/ 9.3 MB) — not the dead drchan files, those are gone. |

## Part B — Remaining round-1 items

### A5 — accessible names / aria-live (M, S)
`aria-live` count: **0 in the entire codebase** (grep) and **0 in the DOM** on all 11 pages
tested, including after answering in Complete It (feedback "❌" row renders silently).
Score/feedback updates are invisible to screen readers everywhere. **Unaddressed.**

Controls still without a usable name (DOM-checked):
- **DiceTrainer result row 🔊 / 🎲 / 🏁** (DiceTrainer.tsx:246-248) — no title, no aria-label: name is the raw emoji. Worst offenders.
- **Flip It per-row select checkboxes** (FlipItContent.tsx:1059) — completely unnamed ("checkbox" ×50). Header select-all *is* labelled.
- **Flip It flag/emoji spans** (FlipItContent.tsx:1063) — `title`-only span: dead on touch, not focusable. (English now also shown in its own column, so info isn't lost — Low.)
- **Flip It 📖/✍️ mode switch** (line 284) — title-only, and no `aria-pressed`/`role=switch` (it's a toggle).
- **Letris pills 🔇/🗣️** — title-only ("Music"/"Voice"); toggle **state not exposed** (title doesn't flip, no aria-pressed).
- **Flip It subset count inputs** (lines 365,375) — title-only number inputs.
- **Drill answer inputs** (complete-it/grammarathon/conjugazone) — no label/aria-label; only a placeholder («commence par…») as name. Weak but non-empty.
- Hear-it 🔊 in complete-it/conjugazone/grammarathon/réviser — `title="Hear it"` gives an acc name; acceptable, but invisible on touch.
- **Verified OK**: Practice Index emoji links — 248/248 have aria-label ("Lesson — S'appeler…"); rain study table play buttons (`aria-label="Play {sentence}"`); ReviewToggle (role=switch + aria-checked + aria-label); Route Builder chips (real buttons with text); flashcard flip div (role=button + aria-label + window-level Space/Enter/1/2 shortcuts).

### A6 — TTS auto-speak without mute (M, S)
Auto-speaks with **no toggle**: **DiceTrainer** (speaks answer on every check, DiceTrainer.tsx:222), **ConjugaZone** (:78), **Complete It** (:122), **GramMarathon** (:100), **Réviser mixed trainer** (reviser/page.tsx:74), **Lexicalator** (word completion, :178).
Has a toggle: dice Practice (`ttsOn`, persisted), Weather MCQ/Gapfill/Matching + directions Matching (`audioOn` checkbox, not persisted), Letris (🗣️ voice + 🔇 music pills). DirectionsMapGame speaks only on explicit 🔊 click — fine. **Unaddressed for the 6 listed.**

### A7 — touch targets @390×844 (M, M)
Measured: `.cahier-btn-sm` **28–30 px** tall (☰ 34×30, ⚙ Options 92×30, ★ Facile 130×28); Letris pills 32–41×**34**; ReviewToggle 54×**28**; Practice Index emoji links 28×**24**; Letris rain columns = 48 px-tall cells × full column width (~95–125 px) — fine. Checkboxes: flip-it rows **18×18 bare** (no label wrap), weather/matching audio **16×16 but wrapped in a `<label>`** with text → effective target OK. Flip It column show/hide eyes **13×13 px**.
Verdict: everything ≥24 px or saved by the WCAG 2.5.8 spacing exception → **no hard AA failure**, but 13–30 px controls fail the 44 px best-practice floor across the board. Unaddressed since round 1 (sizes unchanged).

### P3 — fonts / listener (L, M)
- layout.tsx still loads **5 families** (Geist, Geist Mono, Fraunces, Public Sans, Roboto); 26 woff2 / **508 KB** in export; ~**150 KB** fonts transferred per page. Unaddressed.
- woff2 preload warnings: **0 observed** in headless Chromium on 6 pages (not reproducible now).
- Letris keydown: still **rebinds on every move/land** — effect deps `[active, board, …]` (LetrisGame.tsx:442). Unaddressed (trivial impact).

### A8 residual
`:focus-visible` landed. **Flip It ⚙ Options popover still ignores Escape** (no Escape handler in FlipItContent.tsx). L/S.

## Part C — WCAG 2.2 AA sweep of new surfaces

| Surface | Findings |
|---|---|
| Practice Index (/activities) | Links all labelled (248/248), emoji `<th>`s all have aria-label. **`scope` missing on all 55 `<th>`** and deck cells are `<td>` not `<th scope=row>` (1.3.1, L/S). Dot placeholders: aria-hidden, ~1.8:1 — decorative, but "activity unavailable" is conveyed by a faint dot only (L). Cell links 28×24 at the 2.5.8 floor. Contrast sweep: 0 real failures (366 nodes). Heaviest page tested: 2 656 KB, 29 JS files, DCL 60 ms. |
| Weather/Directions unit hubs (/games/weather, /games/directions) | All controls named; contrast clean except the shared `--cahier-ink-soft` 12 px crumb/label text at **~4.3–4.4:1 on tinted panels** — borderline fail (L/S: darken ink-soft one step). |
| Restyled games (match/gap/MCQ, matching) | Tiles/options are real `<button>`s — tab-reachable, Enter-activatable (verified). Audio checkbox label-wrapped. Contrast: 0 failures after correct lab()-colour compositing. No aria-live for score/feedback (shared A5). |
| Mapless Route Builder (/games/directions/map) | All 30 chips are `<button>`s, 0 fake clickables; keyboard drive verified (Tab→Enter builds the route). Contrast: "Your route" label + empty-state hint at **4.36:1** (L). Dialogue region has no aria-live. |
| Lesson pages w/ deck tabs (/lessons/aimer) | 0 unnamed controls, 0 contrast failures; deck tabs are links. BonusTrainer (DiceTrainer) emoji buttons + unmutable TTS as above. |
| Flip It All-Cards group sections | Group headers are plain `<div class="cahier-section">` — not headings; grid loses the grouping semantics for SR users (L/S: make them h3, or th row in table view). |

## Part D — Performance re-measure (local static serve)

| Page | Total | JS | DCL |
|---|---|---|---|
| / (home) | 1 943 KB | 1 579 KB (20 files) | 32 ms |
| /practice/flip-it/countries-letris | 1 971 KB | — | 32 ms |
| /games/letris/tu-vous | 1 558 KB | 1 229 KB (12) | 25 ms |
| /lessons/aimer | 2 176 KB | 1 847 KB (24) | 28 ms |
| /practice/grammarathon/partitifs | 2 144 KB | 1 822 KB (24) | 25 ms |
| /activities | 2 656 KB | 1 919 KB (29) | 60 ms |

Largest 5 chunks (raw/gz): 3rj1yc81ak5gv.js **582/167 KB (Firestore — on every page)**; 3n7dm2ojtyzwn.js 228/71; 082obv3v03b-9.js 150/40; 1mguvmyuagi3b.js 142/33; 0cz1d0mv5g_q7.js 113/39.
Fonts 150 KB/page; export 49 MB (no dead legacy HTML; bulk is per-route HTML+RSC duplication). Runtime remains healthy — the one real lever is the Firestore static chain (~167 KB gz + parse on every page).

## Prioritised remaining work
1. **H/S** Break the static Firestore chain (`usage.ts`, notes/srs stores → dynamic import) — finishes P1 for real.
2. **M/S** aria-live on drill feedback rows + game score (one shared `<p role="status">` pattern).
3. **M/S** Name batch: DiceTrainer 🔊🎲🏁, flip-it row checkboxes, mode switch, Letris pills (aria-label + aria-pressed).
4. **M/S** Shared persisted TTS mute for the 6 auto-speak activities (pattern already exists in dice Practice).
5. **M/M** Focus trap in SioModal; Escape for ⚙ popover.
6. **L/S** th scope on Practice Index; darken `--cahier-ink-soft`; heading semantics for All-Cards/table group headers; bump 13 px eye buttons.
7. **L/M** Font trim (5 families → 2-3); Letris keydown hoist.

## Score suggestions
- **Accessibility: 78/100** (was 62). Floor items (dialog basics, contrast, reduced-motion, Enter rhythm, focus-visible) all landed and verified; remaining gaps are names/live-regions/mutes/targets — real but non-blocking, all S/M effort. Deduct for zero aria-live product-wide and the missing focus trap.
- **Performance: 76/100** (was 74). +2.2 MB dead HTML removed (P2), DCL excellent, zero preload warnings; but P1's goal was not achieved — 167 KB gz of Firestore still ships synchronously on literally every page, and JS per page is 1.2–1.9 MB. Score moves materially (→ mid-80s) only when the Firestore chain is cut.
