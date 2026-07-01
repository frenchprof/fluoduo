# FluoLingo / LAF1201 — Handoff to the next Claude Code

_Last updated: 2026-07-01. Repo: `/Users/keijidan/projects/lang-games` (Next.js 16.2.7, Turbopack,
App Router, React 19, Tailwind v4, TypeScript)._

This is the consolidation hand-off. Read it top-to-bottom once, then dip into the linked files.
Everything below is **wire-in, not rebuild** unless a section says otherwise.

---

## 0. Who this is for / house rules

- **User:** Dan (dan@chank.wang) — NUS LAF1201 *French 1* content developer. Pedagogy-led;
  cares about ICAP tiers, the pretesting effect, and a distinctive French study aesthetic.
- **Build/verify:** `cd /Users/keijidan/projects/lang-games && ./node_modules/.bin/tsc --noEmit`
  after every change. There is usually a live dev server on **http://localhost:3000** that Dan
  runs; the sandbox preview cannot start it (Next 16 single-instance lock). Drive the live server
  via the **Claude-in-Chrome** MCP for verification.
- **Next 16 caveat (see `AGENTS.md`):** APIs differ from training data. Read
  `node_modules/next/dist/docs/` before using an unfamiliar API. `params` is a **Promise** in
  route components (`const { id } = await params`).
- **Verification gotchas:** the headless Chrome test tab **pauses CSS animations** and **cannot
  play audio**, and MCP round-trips outlast short animations. Verify structure / state / console
  instead of visuals for those; ask Dan to confirm audio + animation by ear/eye.
- **Hydration:** never call `Math.random()` / `Date.now()` during render. Do SSR with a
  deterministic build, then shuffle/decorate in a mount `useEffect` (the Conveyor game is the
  reference pattern).

---

## 1. The product in one paragraph

FluoLingo is the games/practice portal for LAF1201. The course is **50 SIOs** (Specific
Instructional Objectives) across **Unités 0–4**. Each SIO = one can-do statement + one linguistic
competence + one deck. Learners **Pretest** an SIO *before* class (cold MCQ, the pretesting
effect) and **Practice** it *after* class with ICAP activities (Flip It, Match It, …). The skin is
**"Le Cahier"** — a French spiral-bound exercise book.

### Three independent axes (do not conflate — this is a recurring mistake)
- **Topic** = the content/theme (weather, countries, food). A topic is **not** a game.
- **Game / mechanic** = how you interact (flip, match, arrange, classify).
- **Tool / learning-stage** = where in the pre→during→post arc it sits.
Weather is a *topic*; "Flip It" is a *mechanic*; "Pretest" is a *stage*.

### ICAP value tiers (drives which activities matter)
- **Constructive (highest):** gapfill-no-bank, syntax-ordering. Build these first when expanding.
- **Active (mid):** flip/recall, typing recall.
- **Passive/low fillers:** sorting, matching, MCQ. Useful but don't over-invest.

---

## 2. What is DONE (completed artefacts)

### 2.1 Activities / games (live)
| Activity (label) | Route | Source | Notes |
|---|---|---|---|
| **Flip It** (flashcards) | `/practice/flip-it/[collectionId]` | `src/app/practice/flip-it/[collectionId]/page.tsx` + `CahierFrame.tsx` | **Reference implementation** of the Le Cahier design system. Three views (Overview / Cards / All Cards), Test Yourself, 2-state Reviewed⇄To-Review switch, keyboard shortcuts, sort-by-displayed-language. |
| **Match It** (Conveyor Match) | `/games/conveyor/[deckId]` | `src/games/conveyor/ConveyorMatch.tsx` + route `page.tsx` | Timed tap-tap belt+dock game; the sibling of Letris for decks with no sort-column axis. See §3. |
| **Letris** (legacy "Classify It") | `/games/letris/[setId]` | `src/games/letris/` | Column-sorting tetromino game. **Reserved for out-of-syllabus Expert mode** (195 countries by article; adjectives by agreement). Hidden from the main list (`EXPERT_ONLY`). No longer surfaced as "Classify It" on the home page (replaced by Match It this session). |
| **Pretests** (MCQ) | `/pretests/[id]` | `src/app/pretests/`, `src/content/pretests/` | MCQ-only, cold, immediate feedback. Follows `docs/PRETEST_BLUEPRINT.md` (pretesting / forward-testing effect: attempt before instruction; rule revealed AFTER, never examples-first). |
| **SIO hub** (home) | `/` , `/sio/[id]` | `src/app/SioHub.tsx`, `src/app/sio/[id]/page.tsx`, `src/content/sios/` | **The §4 build below is DONE, not pending** — see the note at the top of §4. |

Activity chips still marked **"· soon"** (not built): **Say It** (TTS production), **Complete It**
(gapfill — high ICAP value, build early), **Translate It**, **Arrange It** (word-order; the only
surviving legacy game, becomes Arrange It).

### 2.2 Decks / content (`src/content/collections/`)
`countries-letris` (25), `nationalities` (25, "C'est quel adjectif?"), `languages` (19, greeting +
autonym, **no flags**), `weather-letris` (23), `lieux-letris` (28), `directions-matching`,
`loin-lesson`. Plus `countries-expert-letris.json` (185 entries, Expert mode only).
Schema: `src/lib/collections/schema.ts` (`Item` has `fr`, `en`, optional `lang?:{greeting,autonym}`,
`gender`, `tags`, etc.). Deck list/registration: `src/content/collections/index.ts`,
`src/games/letris/sets.ts`.

### 2.3 The Le Cahier design system (DONE, in `src/app/globals.css`)
Tokens `--cahier-*` (paper `#fbfbf6`, ink `#2a2e6e` blue-violet, `le #2d5bff` / `la #d11149` gender,
chartreuse highlighter `--cahier-hl`, spiral metals, 6 pastel tab hues `--cahier-t0..t5`).
Primitives: `.cahier-desk/-deskrow/-page` (ruled-paper page on a grey desk), `.cahier-binding`
(silver spiral), `.cahier-tab` (pastel index tab = navigation), `.cahier-btn[-primary/-accent/-sm]`,
`.cahier-switch` (Reviewed/To-Review), `.cahier-display/-body` fonts (Fraunces / Public Sans,
loaded in `layout.tsx`). Reusable frame: `src/app/practice/flip-it/CahierFrame.tsx`.
**No handwriting/cursive font anywhere in the product — Dan's explicit call (2026-07-01).** A
Caveat "school cursive" font was originally speced for learner-entered answers and briefly loaded;
it was never applied to any live UI and has since been removed from `layout.tsx` and
`globals.css` (`--font-hand`/`.cahier-hand` deleted). Don't reintroduce it, even for
"handwritten-feel" annotations.

### 2.4 Audio — chiptune engine (DONE, `src/games/audio/chiptune.ts`)
Tiny NES-style synth (pulse via PeriodicWave, triangle bass, noise/kick perc) + two original
looping tracks, ported from `~/Downloads/fluolingo-soundtest.html`:
- `chiptune.play(key)` / `stop()` / `toggle(key)` / `playing()` / `setVolume(v)` — `key` is
  `"letris"` (C major) or `"conveyor"` (A minor, swung).
- `chiptune.fanfare()` — wordless victory jingle (NO TTS) for level complete.
- `chiptune.lostLife()` — ducks the loop + plays an "uh-oh" descending sting (loop keeps playing).
- `chiptune.gameOver()` — stops the loop + sad A-minor descent.
- **Architecture note (important, was a real bug):** the loop runs through a dedicated `musicBus`
  gain node. `stop()` **disconnects and rebuilds** `musicBus` so already-scheduled notes (esp.
  long held bass) are cut dead instead of bleeding/overlapping into the next tune. `play()` calls
  `this.stop()` first. Don't "simplify" this away.
- AudioContext must be created/resumed inside a user gesture (first click). Wired into both
  ConveyorMatch and LetrisGame with a 🎵/🔊 toggle button.

### 2.5 This session's specific changes (most recent first)

**⚠️ Two-session collision (2026-07-01) — read this before trusting anything else in this file
about "what's built."** Earlier the same day, a *different* Claude Code session (working in the
same repo, no visibility into this conversation) built the entire §4 SIO hub — `SioHub.tsx`,
`/sio/[id]`, `src/content/sios/` — and swapped `page.tsx` to render it, making the older
`ZonedLessons.tsx` (which items 1–2 below originally edited) **dead code**. That file has since
been **deleted** in this session, after confirming its one useful bit (the Match It chip) was
already independently present in the new `/sio/[id]/page.tsx`. **Takeaway for future sessions:**
before trusting this doc's "what's done" claims, grep the actual repo (`find src/app -iname
"sio*"`, check `page.tsx`'s current import) — two unsynchronized sessions editing the same repo on
the same day is a real failure mode here, not a hypothetical.

1. ~~**Home "Classify It" → "🎢 Match It"** (`src/app/ZonedLessons.tsx`, `DeckLine`)~~ — moot, see
   the collision note above. Match It is correctly wired into `/sio/[id]/page.tsx` instead.
2. ~~**Pre/Post selector reskin** (`ZonedLessons.tsx` top toggle)~~ — moot, the Pre-lesson
   Pretest / Post-lesson Practice split now lives per-SIO on `/sio/[id]/page.tsx`, not on a
   home-level toggle. **Home is still on the older `fluo-*` skin (SioHub.tsx), not Le Cahier** —
   full Cahier rollout to Home is still a real pending task, tracked in §4.1.
3. **Conveyor route** back-link fixed ("← Apps & Games" was retired → "← FluoLingo"; header label
   "Conveyor Match" → "Match It").
4. **Conveyor: max 2 distractors** at any time (`ConveyorMatch.tsx`, `computeDock`: `want = 2`,
   previously grew `6 + level`).
5. **Audio:** added `lostLife()` / `gameOver()` + the `musicBus` overlap fix described in §2.4.
6. **Removed the `Caveat` handwriting font** entirely (`layout.tsx`, `globals.css`) — see §2.3.
7. **SIO hub grouping + collapse — IMPLEMENTED (not just spec) in `SioHub.tsx`:** each unit now
   sub-groups into Situations 1–3 + Atelier (via `groupSiosForUnit` in `src/content/sios/index.ts`,
   using the existing `isProduction` flag — no new data authoring needed) with independent
   Unit-level and group-level collapse, state persisted in `localStorage`
   (`fluolingo:hubCollapse`). Verified live: renders correctly, collapse survives reload, `tsc`
   clean, no console errors on the actual served page. See §4.1 for the full spec this satisfies.
8. **Unit 0's grouping override** (`groupSiosForUnit`, `unit === 0` → 2 parts instead of 3) —
   see §4.1's grouping note. Superseded once by item 9 below (SIO-010 was added), but the 2-way
   override for the *non-Atelier* Situations still stands.
9. **Unité 0 content amendment applied to the CSV — see §2.6.** Dan had already amended Unité 0's
   content (in a source outside this repo); this session synced `docs/handoff/
   LAF1201_SIOs_Flashcards_v9.csv` and regenerated `sios.json` to match.

### 2.6 Unité 0 CSV amendment (2026-07-01) — read this before touching Unité 0 data again

`docs/handoff/LAF1201_SIOs_Flashcards_v9.csv` is the source of truth, and it was **stale for
Unité 0** — Dan had already amended that unit's content elsewhere (a copy/paste he had, not
synced into this repo) and the CSV/`sios.json` hadn't been updated to match. This session applied
the amendment directly to the CSV, then ran `node scripts/gen-sios.mjs` to regenerate
`src/content/sios/sios.json`. Changes, relative to what was in the repo before:

- **SIO-006** ("Core nouns…"): expanded from 14 to **18 core nouns** (added un étudiant / une
  étudiante / un professeur / une professeure / une salle de classe; dropped un garçon), and now
  also drills **C'est où ? / C'est qui ? / C'est quoi ?** as the question frame. Can-Do and
  competence text updated to match.
- **SIO-007** ("Numbers 0–20"): the model question changed from *C'est combien ?* to **Il y a
  combien d'étudiants ?**
- **SIO-008 "Question words" — DELETED.** It no longer exists anywhere in the course. (Confirmed
  with Dan during this edit that SIO-004 "Days + moments" — the other apparent gap in his pasted
  list — was NOT deleted, just omitted from the paste because it was unchanged; it's still in the
  course at 004, unchanged.)
- **Old SIO-009 "Classroom instructions" → renumbered to SIO-008** (content otherwise unchanged,
  `Flashcard Set` 0.09 → 0.08).
- **Old SIO-010 "Greetings" → renumbered to SIO-009** (content otherwise unchanged, `Flashcard
  Set` 0.10 → 0.09).
- **New SIO-010 "First meeting role-play"** — a brand-new Spoken Interaction **production** task
  (added to `PRODUCTION_SIOS` in `scripts/gen-sios.mjs`): simulate a first meeting end-to-end
  (Bonjour → Comment tu t'appelles ? → Et toi ? → Comment ça s'écrit ? → Enchanté(e) → Au revoir).
  This is Unité 0's first-ever Atelier — see §4.1's grouping note, now corrected to reflect it.
- Unité 0 is still exactly 10 SIOs, all 50 SIOs total still present — verified via
  `gen-sios.mjs`'s own per-unit count log and no missing-Can-Do/competence warnings.
- **Lesson for future sessions:** this CSV can drift out of sync with content Dan has amended
  elsewhere (a chat, a doc, a spreadsheet not in this repo) without any signal in the repo itself.
  If a Can-Do/competence/topic Dan describes doesn't match what's live on `/sio/[id]`, the CSV is
  probably stale for that SIO — ask Dan for the current text rather than assuming the repo is
  ground truth, the way §2.5's two-session collision note already warns for "what's built."

---

## 3. Match It (Conveyor Match) — how it works

`src/games/conveyor/ConveyorMatch.tsx`. A serpentine **belt** (LANES×COLS) carries cards toward a
terminus; a scrolling **dock** below holds the partners. Tap a belt tile, then its dock partner.

- **Two modes** (route `page.tsx`, `SPLIT_DECKS = new Set(["languages"])`):
  - **Split mode** (languages): the full French word is split at a random point each spawn; the
    belt carries one half (baguette upper-half / rounded-top / "crust"), the dock carries the other
    half (lower-half / rounded-bottom). Learner rebuilds the word. Decoys are out-of-syllabus
    languages (`EXTRA_LANGS`).
  - **Meaning mode** (every other deck): belt = FR, dock = EN gloss (FR↔EN, never FR↔FR).
- **Match animation:** the two brown halves slide together **left-to-right**, spell the whole word
  at the seam, then morph/recolor into a small colored chip that drops into the cumulative
  **identified-languages list**. A 🎉 TADA fires the first time each distinct word is identified
  game-wide; a speech balloon shows the language's greeting.
- **Invariants:** each word appears **at most once per level** (`releasedIds`); **≤2 distractors**
  on the dock at once; one terminus; spawn only if a partner can dock. Dock scroll **freezes on
  hover** so taps land; **220ms commit debounce** guards against stray double-commits (both were
  fixes for a "double-match" bug).
- **Lives/levels:** 3 lives, wrong match → `lostLife()`; lives 0 or belt-jam → `gameOver()`; level
  clear → music stops, `fanfare()`, then a French "BRAVO / BIEN JOUÉ" card + "Niveau N →".

---

## 4. The SIO hub — STATUS: core build DONE, several enhancements still open

**The base hub (§4 "Design decisions" #1–5 below) is built** — see §2.1/§2.5 and the collision
note in §2.5. What's genuinely still open is everything in §4.1–4.3: the Duolingo-style winding
path visual (SioHub currently renders a plain grid, not a path), the Situations+Atelier grouping
(this part IS done, implemented directly in `SioHub.tsx`/`groupSiosForUnit` — see §2.5 item 7), and
the full gamification layer (hearts/gems/streaks/quests/leaderboard — none of this exists yet,
`SioHub.tsx` and `/sio/[id]/page.tsx` are both plain server/light-client components with no learner
progress state at all).

Original ask, now shipped:

> **Home landing page → links to all 50 SIOs.** Each SIO page shows its **Can-Do statement** +
> **Linguistic competence**, then a **Pre-lesson Pretest** section and a **Post-lesson Practice**
> section.

Design decisions agreed with Dan and baked into the shipped build:
1. **Don't flatten 50 links.** Group by **Unité 0–4**, and (added later, also shipped) each unit
   sub-groups further into **Situations 1–3 + Atelier** — see §4.1.
2. **Naming:** "Pre-lesson **Pretest**" (MCQ, cold) vs "Post-lesson **Practice**" (the ICAP
   activities) — NOT two quizzes. Live on `/sio/[id]/page.tsx` as "PRO" / "MISE" stages.
3. **Production SIOs (020, 030, 040, 049, 050)** get a different post shape: a short
   writing/speaking task with a simple rubric tied to the Can-Do, **not** an MCQ battery. Shipped —
   `/sio/[id]/page.tsx` branches on `isProduction`.
4. **Linked SIO chains (015→016→017 countries/nationalities/languages)** share one pretest entry
   point / chain hint, via `SIO_CHAINS` in `src/content/sios/index.ts`. Shipped.
5. **Scoring:** show the Can-Do (learner-facing motivation) but **pass/score against the linguistic
   competence line** (e.g. ≥20/25 countries). That threshold is encoded in the CSV — **not yet
   enforced anywhere in code**, since there's no learner-progress state to score against yet (same
   gap as the gamification store in §4.2).

### 4.1 Home path visual — SHIPPED 2026-07-01: real winding node path, not a card grid

Dan's feedback on the original plain-grid `SioHub.tsx`: "too many words on each button," wanted it
"more duolingo lively." He also showed a reference wireframe (`fluolingo.app/learn`) using the
**existing `fluo-*` peach/ruled-paper skin** (NOT the Le Cahier white-paper/spiral-binding look) —
so this did **not** need a Le Cahier reskin, just a structural rebuild on the skin already in use.

**What's built now, in `SioHub.tsx`:**
- A **winding path**: SIO nodes alternate left/right per group (`SioNode`, `side: "start"|"end"`),
  connected by a short dashed thread (`<Dash/>`). **Deliberately minimal text** — a circle with
  just the 2-digit number, plus a short 1–2-line topic caption underneath. No Can-Do paragraph on
  the path at all; that stays on `/sio/[id]` where it belongs.
- **Unit banners** are now solid colored bars (`fluo-h-{unit%6}` → `--fluo-card-accent`), not plain
  headings — closer to Duolingo's colored unit-header bar.
- **Atelier tag:** a node whose SIO `isProduction` gets a small "atelier" label under its circle
  (still just a tag, not a different node shape) — visible on e.g. SIO-020, and on SIO-010 now
  that it's folded into Unité 0's Situation 2 (see the grouping note below).
- **Real locked/done/active states — SHIPPED 2026-07-01 (was faked-off before).** Backed by
  `src/lib/progress.ts` (see §4.2 for the store itself). A node is: **done** (learner self-marked
  it, shows ✓, unit-hue fill), **active** (the single earliest not-done unlocked SIO — the "you are
  here" node, chartreuse + "Commencer" flag), or **locked** (its predecessor by sequence isn't done
  — renders as a `<span>` with no `href`, shows 🔒, dimmed, not a `Link`). Direct URL navigation to
  a locked SIO's `/sio/[id]` page still works — there's no auth/server to actually enforce a block,
  and none was asked for; the lock is a path-UI convention, not access control.
- Top rail added above the unit list: 🔥 streak · 💎 gems · ❤️ hearts (filled/empty), reading live
  from the store.
- Verified live end-to-end: fresh state shows SIO-001 active and everything else locked with 🔒;
  clicking "Mark as done" on `/sio/SIO-001` (via the new `MarkDoneButton`) flips it to ✓, unlocks
  SIO-002 as the new active node, and updates the rail (🔥1 💎10); `tsc` clean, no console errors.
- **Still open / not done:** the Cahier reskin (this pass deliberately stayed on `fluo-*` per Dan's
  own reference wireframe), hearts-gating-entry (hearts are tracked and decremented but don't block
  anything yet), a heart refill mechanic, streaks/quests/leaderboard beyond the basic streak
  counter, and per-Situation (vs. flat cross-unit) unlock nuance. See §4.2 for the precise MVP
  boundary. Icons are still the app's existing emoji language (🧪 🃏 🎢 ✏️ 🎓 etc.) elsewhere in
  the app; the path itself currently uses plain numbers, not emoji, per the "less wordy" note.

**Grouping + collapse — SHIPPED 2026-07-01 (not just spec).** This is implemented right now in
`SioHub.tsx` and `groupSiosForUnit()` (`src/content/sios/index.ts`), independent of the still-
unbuilt path visual above — the grid renders these groups today, and the path (when built) should
reuse `groupSiosForUnit` rather than re-deriving grouping logic. 10 SIOs per unit was too many
cards to scan in one block even in a plain grid.

- **Each unit sub-groups into 4 parts: 3 Situations + 1 Atelier — REAL book groupings, NOT an
  even numeric split (corrected 2026-07-01).** An earlier version of this doc/code claimed a clean
  even split (e.g. "Situation 1 = 011–013, Situation 2 = 014–016…") — **that was wrong.** Dan
  pushed back: "the division of SIOs into 3 per situation is necessarily [not] accurate, refer to
  the book please." The book (`~/Documents/Archived/L_39_atelier_A1_Manuel.pdf`, Didier's
  *L'atelier A1*) was read page-by-page for Unités 1–4 (pp. 16–71) — each unit really does run
  **3 named Situations de communication** followed by **Atelier(s) d'expression**, but the
  Situations are **lopsided, not evenly-sized**, and grouped by real communicative content, not by
  SIO count. The verified (book-grounded) grouping, hardcoded in `UNIT_SITUATIONS` in
  `src/content/sios/index.ts` (`groupSiosForUnit` no longer computes an even split for units 1-4):
  - **Unité 1** "C'est qui ?": **Situation 1** "Se présenter et présenter quelqu'un" = 011, 013, 014
    · **Situation 2** "Dire sa nationalité" = 012, 015, 016, 017 · **Situation 3** "Demander et
    donner des informations" = 018, 019 · **Atelier** = 020.
  - **Unité 2** "On fait quoi ce week-end ?": **Situation 1** "Identifier des objets" = 021, 025 ·
    **Situation 2** "Parler de ses goûts" = 022, 023, 028 · **Situation 3** "Sortir" = 024, 026,
    027, 029 · **Atelier** = 030.
  - **Unité 3** "On va où cet été ?": **Situation 1** "Parler de la météo" = 031, 032 ·
    **Situation 2** "S'informer sur une ville" = 033, 034, 035 · **Situation 3** "Demander et
    indiquer son chemin" = 036, 037, 038, 039 · **Atelier** = 040.
  - **Unité 4** "Qu'est-ce qu'on mange ce soir ?": **Situation 1** "Parler de ses habitudes
    alimentaires" = 041, 042, 043, 044, 045 · **Situation 2** "Faire ses courses" = 047 ·
    **Situation 3** "Faire des projets" = 046, 048 · **Atelier** = 049, 050 (TWO SIOs, matching the
    source book's own "2 ateliers d'expression" pattern for this unit exactly).
  - **⚠️ Not every SIO has an explicit grammar box in the book pages read.** SIO-014, -026's second
    home, -027, -028, -037, -039, -043 were placed by **best thematic fit** with their unit's real
    Situations, not direct page evidence (e.g. 014 "Matières" isn't shown anywhere in the book's
    Unité 1 pages — it was folded into Situation 1's "about you" cluster). Flag to Dan if any of
    these seven should move once he reviews.
  - **Unité 0 — final shape, corrected 2026-07-01: 2 groups total, NOT 3 Situations + Atelier.**
    Unité 0 got a genuine new production SIO (**SIO-010 "First meeting role-play"**, see §2.6) that
    IS flagged `isProduction: true` in `scripts/gen-sios.mjs` (so its own `/sio/SIO-010` page still
    gets the speaking-task rubric, same as every other production SIO). But on the **home path**,
    Dan explicitly does not want it broken out as its own 3rd "Atelier" cluster the way Units 1-4
    get 4 groups — Unité 0 stays at **2 groups total**, since it's the very first lesson and is
    recognition-focused rather than production-graded like the later units' Ateliers. `SIO-010` is
    folded into the last Situation instead. `groupSiosForUnit(unit)` special-cases `unit === 0`
    entirely (doesn't call the atelier-split logic at all): all 10 SIOs, including SIO-010, split
    into 2 even groups. Current shape: **Situation 1 = 001–005 · Situation 2 = 006–010** (with
    SIO-010 showing a small "atelier" tag on its node, but no separate group heading). Implemented
    and verified live.
  - Label groups by their real name — "Situation 1", "Situation 2", "Situation 3", "Atelier" — not
    a generic "Partie N."
- **Two independent collapse levels:** the whole Unit, and each Situation/Atelier group inside it.
  A collapsed row shrinks to one line: chevron + label + a small progress count (e.g. "3/3") + a
  row of small dot indicators (one per SIO, colored by state) so the group's shape is still legible
  without expanding. **Default:** the group containing the learner's current active SIO stays
  expanded; fully-done and fully-locked groups default to collapsed — but every group is always
  manually toggle-able regardless of default. **Collapse state persists** per learner device (same
  `localStorage` store as §4.2's hearts/gems/done-flags — don't build a second ad-hoc store for
  this).

### 4.2 Gamification economy: hearts + gems — CORE STORE SHIPPED 2026-07-01

**The progress-store gap this whole section used to describe as missing is now closed** — see
`src/lib/progress.ts` (new file). Real `doneSios` / `hearts` / `gems` / `streak` state, backed by
`localStorage` (`fluolingo:progress`), with helpers `loadProgress`, `markSioDone`, `unmarkSioDone`,
`spendHeart`, `isSioDone`, `isSioLocked`. This is what finally gives the home path real locked/
done/active node states (see §4.1) instead of the "everything is available" placeholder from
before. **What this MVP deliberately does NOT do yet** (documented in `progress.ts`'s own header
comment, don't re-invent without reading it first):
- No hearts refill/regen mechanic — hearts only ever go down right now. A refill design (daily
  regen? gem-spend?) is still an open decision, not built.
- Hearts are tracked and decremented (Match It calls `spendHeart()` on a wrong match — see
  `ConveyorMatch.tsx`'s wrong-match branch) but **don't yet gate entry to anything.** Reaching 0
  hearts is currently just a number on the rail, not a lockout. Gating is a further increment.
- "Done" is **self-reported** via a `MarkDoneButton` on each SIO's Post-lesson Practice section
  (`src/app/sio/[id]/MarkDoneButton.tsx`) — the only honest completion signal available, since no
  game (Flip It, Match It, Letris) reports completion back to any store yet. Marking done awards a
  flat +10 gems and bumps the daily streak; it does NOT yet distinguish pretest-attempt-floor vs
  practice-completion payouts (see the gems-floor rule below — still to be layered in once
  pretests themselves write back to the store).
- The unlock rule is a flat sequence: SIO N unlocks once SIO N−1 (by `num`) is done, with no
  per-unit or per-Situation nuance yet. SIO-001 is never locked.

Agreed shape (unchanged from before, now partially implemented — see above for what's real vs still open):

- **Hearts (❤️, tint `--cahier-la` red)** — a global lives pool. **Gates entry to Post-lesson
  Practice activities only** (Match It, Letris, future Complete It / Say It) — losing a match in a
  game costs a heart, same mechanic Match It already has internally (see §3, "Lives/levels").
  **Hearts must NEVER gate the Pre-lesson Pretest.** The pretest is a deliberate cold-guess-then-
  feedback design (the pretesting effect, see [[fluolingo_pretest_pretesting_effect]]) — punishing a
  wrong cold guess with a lost heart would directly undermine the pedagogy it's built on. Keep the
  pretest a free, always-open zone; the hearts economy lives entirely on the Practice side.
- **Gems (💎, tint `--cahier-le` blue)** — a soft, non-monetized reward currency earned by
  completing SIOs (finishing a pretest, clearing a practice level). No real-money purchases, no
  ads, no "Super"-style upsell — this is a free university course, not a consumer app. Spend sinks
  (heart refills? unlocking Expert Letris content? cosmetic tab colors?) are undecided — don't
  over-build this before Dan picks one.
- **Attempting the Pretest must pay out a guaranteed baseline/minimum XP-or-gems reward —
  confirmed 2026-07-01.** Dan's explicit reasoning: students need to be *encouraged to attempt* the
  Pretest, so the reward for simply attempting it (finishing the cold-guess run, regardless of how
  many were right) should be the **floor of the whole reward table** — nothing else in the app
  should pay out less than a completed Pretest attempt. This isn't a new mechanic, it's a hard
  constraint on the reward table's design once it's built: don't let a design that scales rewards
  by "quality" (accuracy, speed, streak length) accidentally make a bare Pretest attempt worth
  ~0 gems relative to everything else — that would recreate exactly the avoidance behavior this
  rule exists to prevent. This is the same spirit as §4.3's quest rule (reward completion/attempt,
  never accuracy) — apply it to the base gems payout too, not just quests.
- **Persistence requirement:** hearts/gems need actual state, not just deck completion flags. This
  is the same "progress store" gap flagged elsewhere in this doc (§ "What's NEXT") — start with
  `localStorage`, keyed per-learner-device; a real account system is future scope. This store is
  also what would finally give the dead SRS scheduler something to read from.
- **Still not requested — do not build without asking:** ad banners, "Super"/subscription upsells,
  real-money purchases. Everything else Duolingo-shaped (streaks, quests, leaderboards) **is now
  in scope** — see §4.3, corrected 2026-07-01 after Dan clarified the full gamification ask wasn't
  limited to hearts + gems.

### 4.3 Streaks, daily quests, leaderboards (confirmed 2026-07-01)

Dan corrected an earlier misread: the "heavily gamified" ask was never just hearts + gems — he
explicitly wants **streaks, daily quests, and leaderboards** too, matching Duolingo's actual scope.
The **one boundary that still holds** from §4.2: nothing here may turn the Pre-lesson Pretest into
a graded/competitive/punitive surface. Below, each mechanic states how it respects that.

- **Streak (🔥, gold `--cahier-gold` tint):** consecutive-day counter, top rail next to hearts/gems.
  Counts a day as "kept" if the learner **completes either a Pretest or a Practice activity** that
  day — attempting counts, not scoring well, so this stays compatible with the pretest being a
  low-stakes cold-guess zone. Missing a day resets to 0 (standard Duolingo behavior); a streak
  freeze/repair item is a plausible later gem-sink (see §4.2's "undecided spend sinks").
- **Daily quests:** 1–3 short rotating goals per day (e.g. "clear one Practice level," "identify 5
  new words in Match It," "finish today's Pretest"). Quests reward **completion/attempt**, never
  accuracy or speed — so a quest can point at the Pretest ("finish today's Pretest") but must never
  read "get N/N correct on the Pretest." Completing a quest pays out gems.
  ⚠️: If completion-only framing turns out to be hard to enforce at query time and gets skipped
  under deadline pressure, tell Dan explicitly rather than quietly shipping accuracy-based Pretest
  quests — this is the one place where a shortcut would undo the pretesting-effect protection.
- **Leaderboard:** ranks learners by **Practice-side XP/gems earned in a period (e.g. weekly)** —
  never by Pretest scores or Pretest speed. This is a deliberate extension of the same boundary:
  the Pretest stays a private diagnostic, never a public/competitive number. Scope the leaderboard
  to the class cohort (this is one NUS module, not a global app). **Identity — resolved 2026-07-01:
  both real name and pseudonym are allowed**, learner's choice (a display-name setting, not a
  forced default either way) — this was flagged as needing Dan's explicit call and it's now made.
- **Persistence:** all three read/write the same per-learner `localStorage` store as hearts/gems
  (§4.2) — do not stand up a separate mechanism per feature. A real leaderboard obviously needs
  data to leave the device eventually (shared state across learners) — that's the point at which
  "just localStorage" stops being sufficient and a lightweight backend/shared store becomes
  necessary; flag that build cost to Dan rather than faking a leaderboard from local data alone.

Suggested SIO page layout:
```
[SIO title + deck ID]
Can-Do (A1)            ← qualitative, learner-facing
Linguistic competence  ← what pre/post actually measure
▸ Pre-lesson Pretest   (MCQ · cold · gap report)
▸ Lesson materials     (optional middle section)
▸ Post-lesson Practice (ICAP activities · demonstrate competence)
```
Roll the **Le Cahier** skin (CahierFrame + tokens) to Home and the SIO pages (Phase 3 of the plan
in `~/.claude/plans/peaceful-wishing-ladybug.md`). The Flip It page is the reference implementation
to copy from.

### 4.4 Unité 0 skips the Pretest entirely — SHIPPED 2026-07-01, then SUPERSEDED by §4.5

Dan's original call: Unité 0 is the very first lesson, nothing prior to diagnose — skip the
Pre-lesson Pretest for its non-production SIOs, put an MCQ under Post-lesson Practice instead. This
was first implemented as a `skipPretest` flag inside the normal `/sio/[id]` PRO/MISE page structure.
**That per-SIO page approach is no longer how Unité 0 works at all** — Dan later asked for something
structurally different (§4.5): one shared area with all 10 SIOs + one collective MCQ block, not ten
individual Pretest/Practice sub-pages. The `skipPretest` code in `/sio/[id]/page.tsx` is now dead
for Unité 0 in practice (Home no longer links there for it) but still harmless/functional if visited
directly — see §4.5 for why it wasn't deleted outright, and the collision-note precedent in §2.5 for
why "leave old code reachable but unlinked" is the pattern here rather than deleting on the spot.

**Unité 0's Can-Do (A1) text was simplified** for all 10 SIOs to plainer "I can…" phrasing Dan
supplied verbatim — see `docs/handoff/LAF1201_SIOs_Flashcards_v9.csv` (Can-Do column) and
`src/content/sios/sios.json` (regenerated). This part still stands, unaffected by §4.5.

### 4.5 Unité 0 — SHIPPED 2026-07-01, final shape (went through 2 iterations same day)

Dan: "For Unit 0... I would put them all in the same area and collectively have questions under
them. No need at all for the PreTest PostTest under each SIO (because Unit 0 is special)." **First
iteration** (superseded within the same session, don't rebuild it): a 3×3 grid + one long
inline collective quiz on the home page, click-to-scroll-anchor. Dan changed his mind: "please get
the questions off my main page, which needs to look to clean simple and neat and lively." **Final
shape**, `src/app/Unit0Panel.tsx` (rendered by `SioHub.tsx` in place of the path for `unit === 0`):

- **Two even rows of 5 tiles** (all 10 SIOs, uniform — no Situations 1/2/3 sub-grouping exists for
  Unité 0, so no reason to size rows unevenly the way Units 1-4 do).
- **Clicking a tile opens a POPUP** (`Unit0Modal`, a simple fixed-overlay `role="dialog"`, close via
  ✕ or backdrop click) — not inline content, not a separate page. Shows: Statement of SIO (Can-Do),
  Measurable Language Competency, then that SIO's MCQs (or, for SIO-010, a note that it's a
  mini-oral simulation done in class — no online questions there). If a deck exists for that SIO,
  `PracticeChips` (exported from `SioDetail.tsx`) renders Letris/Match It chips under "Also try" —
  Dan: "For some of the Unit 0 SIOs, we can still have games for Letris... or [Match It] for 1-1
  matching." None of the 10 currently have a wired deck, so this renders nothing yet — the
  capability is there for whenever one gets wired.
- **Question content — ported from Dan's existing site**, `laf1201.withdrchan.com` (a live legacy
  pre-lesson MCQ app — see [[laf1201_legacy_mcq_site]] for where its content lives and the
  **mandatory degendering fix**: it addressed the teacher exclusively as "Madame"; every ported
  item now uses "Monsieur" instead, since Dan is a Monsieur). Mapped legacy skill IDs to SIOs:
  `0-01-introduce-self`→001, `0-04-tu-vous`→002, `0-06-alphabet`→003, `0-08-days`→004,
  `0-09-colors`→005, `0-07-numbers`→007, `0-03-classroom-phrases`→008,
  `0-02-greetings-leave-taking`→009. Capped at ~6 deduped items per SIO (the source has far more —
  this is a light reinforcement quiz, per Dan: "purely to drive home those 10 SIOs"). SIO-006 (core
  nouns) has no legacy equivalent — its 6 items were authored fresh. Content lives in
  `src/content/sios/unit0-questions.ts`; legacy TTS `<button onclick=playTTS>` markup (SIO-003
  alphabet items) was stripped and reframed as text ("Which letter is said 'a comme Anatole'?") —
  wiring the app's existing `speak()` helper here instead is a nice-to-have future enhancement.

### 4.6 Units 1-4: row-grouped path, temporary unit locks, readable font, simplified detail page — SHIPPED 2026-07-01

Four more changes landed the same day as §4.5, all still live:

- **Row-grouped layout, not alternating zigzag.** Dan: "rather than have left right left right, we
  can have three in a row (if they are grouped under the same situation) or 2 or 4 etc." Each
  Situation/Atelier group (see §4.1's grouping) now renders as one `flex flex-wrap` row sized to
  however many SIOs are actually in it — Unité 1 Situation 1 is a row of 3, Situation 2 a row of 4,
  Situation 3 a row of 2, Atelier a row of 1, etc. `SioHub.tsx`'s old alternating `side: "start"|
  "end"` per-node logic and the `Dash` connector between individual nodes were removed.
- **Units 3 and 4 are TEMPORARILY LOCKED** — `LOCKED_UNITS = new Set([3, 4])` in `SioHub.tsx`. Dan:
  "We can lock Units 3 and 4 for now, only because we won't have time to confirm the details by
  today." **This is NOT a reintroduction of the per-SIO sequential unlock that was explicitly
  reverted** (§4.5's history / memory) — it's a coarse, whole-unit "content not ready" gate: the
  unit banner shows "🔒 Coming soon" and doesn't expand; no individual SIO is ever locked within an
  unlocked unit. Remove `LOCKED_UNITS` (or the specific unit numbers) once Dan confirms that
  content — this is explicitly temporary, don't treat it as a permanent design decision.
- **Readable font for circle/tile captions.** Dan: the mono `.fluo-label` font used for SIO
  captions was "much much" too hard to read. Added Roboto via `next/font/google` in `layout.tsx`
  (`--font-readable`) and a new `.fluo-readable` class in `globals.css`, applied to `SioNode`'s
  topic caption, `Unit0Panel`'s tile captions, the `/sio/[id]` page's `<h1>` and prev/next topic
  text. `.fluo-label`/`.fluo-mono` are unchanged elsewhere (this wasn't a wholesale font swap, just
  the specific captions Dan flagged).
- **`/sio/[id]/page.tsx` (Units 1-4) drastically simplified.** Dan: "we don't need such elaborate
  SIO details. It can be reduced to just Statement of SIO and Measurable Language Competency. And
  two tiles below side by side: one says Pre-Test Prep, the other says Post-Class Practice." New
  shared component `src/app/SioDetail.tsx` (used by both this page and Unit0Panel's popup) replaces
  the old PRO/MISE `Stage` cards (kicker + long blurb paragraphs) entirely. Post-Class Practice
  always offers **Flip It, Say It, Complete It, and EITHER Classify It (Letris, if
  `deck.gameConfig?.letris` exists) or Match It (Conveyor, otherwise)** — never both — per Dan's
  exact list; Translate It / Arrange It are no longer shown on this simplified tile. `MarkDoneButton`
  moved below `SioDetail`, still awards gems/streak/unlock same as before.
- Verified live end-to-end: Unité 0's popup opens/closes correctly with working MCQs; Unité 1-4
  rows size correctly (3/4/2/1 for Unité 1, 2/3/4/1 for Unité 2); Unités 3-4 show the locked banner
  and don't expand; SIO-016 (has Letris config) shows "Classify It", SIO-017 (no Letris config)
  shows "Match It"; `tsc` clean, no console errors.

### 4.7 Minimalist popups everywhere + Unit-2-first priority — SHIPPED 2026-07-01

Dan: "Can the pop up please be minimalist. I really don't [want] all those words... STICK TO THE
ESSENTIALS. SHORT AND SWEET. EFFICIENT." Several changes landed together:

- **`sioStatement(sio)`** — new helper in `src/content/sios/index.ts`. Mechanically merges Can-Do +
  competence into ONE flowing sentence ("I can X, and I know how to Y") — NOT hand-rewritten per
  SIO (that would be 50 rewrites; this is a pure string transform, applies uniformly). Matches
  Dan's own example for SIO-001 almost verbatim. **`SioDetail.tsx` no longer shows "Statement of
  SIO" / "Measurable Language Competency" labels or a bullet-list of criteria** — just this one
  sentence, then the two Pre-Test Prep / Post-Class Practice tiles.
- **New shared `src/app/SioModal.tsx`** — the popup chrome (header + close), used by both
  `Unit0Panel` and (new) `SioHub`'s Units 1-4 nodes. **Units 1-4 SIO circles now open this same
  popup instead of navigating to `/sio/[id]`** — Dan: "We should adopt what we did for Unit 0 for
  the Units 1 to 4 too." The route still exists and still works for direct links (same "leave old
  code reachable but unlinked" pattern used elsewhere in this doc) — it's just no longer the
  primary click target.
- **Alphabet quiz (SIO-003) rewritten.** Dan: "The alphabet questions are a dead giveaway!" — the
  old A-B-C-D-E-F set didn't test real confusion. Replaced with the 6 letters whose French names
  actively trip up English speakers: G ("jay"), J ("jee"), C ("say"), H ("ash"), R ("air"), Y
  ("i grec") — each question's distractors are the letters most likely to be confused with it (see
  `src/content/sios/unit0-questions.ts`, `"SIO-003"` block, and its comment for why these six).
- **Stronger MCQ answer contrast.** Dan: "i cannot tell what is what if everything is of the same
  color." Correct/wrong states in `Unit0Panel`'s `QuizQuestion` now use solid fills (`#178a4d`
  green / `#c0392b` red) with white text, not pale tints on similarly-toned borders; the unrevealed
  state uses a dark ink border for clear definition against the paper background.
- **Deferred, not silently dropped:** Dan asked for "Also try" game links — Days/Numbers/Colors →
  Match It (he calls it "Lexpress"), the un/une-article SIO (006) → Letris ("Classify It"). None of
  the 4 Unité-0 topics involved have a wired deck yet — `PracticeChips` (in `SioDetail.tsx`,
  exported, reused by `Unit0Panel`) already renders these chips **whenever a deck exists**, so this
  is pure content-authoring work (new `Collection` JSON + `collectionId` wiring in
  `scripts/gen-sios.mjs`'s `COLLECTION_BY_SIO`), not a UI gap. Do this next if picking Unit 0 back
  up.
- **Unit 2 priority — structure done, content is the real remaining gap.** Dan asked to make Unit 2
  complete "by today." The path/grouping/popup/merged-statement/pretest-practice-tile UI is fully
  working for all 10 Unité-2 SIOs (verified live) — but **none of Unité 2's 10 SIOs have a wired
  deck or pretest**, so both tiles show "Planned" for every one of them. Making Unit 2 *functionally*
  complete means authoring ~10 new decks (objets/goûts/sortir/etc. vocab + game configs) and
  pretest content — a real content-authoring task, not a quick UI fix, and it wasn't attempted in
  this pass. Flag this explicitly to Dan rather than let "the popup works" read as "Unit 2 is done."
- Verified live: alphabet quiz shows the new 6-letter set with strong green/red contrast; Units 1-4
  circles open the shared popup (checked on a Unité 2 SIO); `tsc` clean, no console errors.
  ⚠️ **The specific SIO checked here was renumbered in §4.8 below** — don't use "SIO-022" as a
  fixed example elsewhere in this doc without checking current numbering first.

### 4.8 Legibility fixes, SIO renumbering, Unité 3 unlocked — SHIPPED 2026-07-01

- **"Commencer" pill is red, not blue** (`SioHub.tsx`'s `SioNode`) — was `var(--fluo-ink)` (navy),
  now `var(--fluo-danger)` (`#ff5667`).
- **Group headings ("SITUATION 1 — …") and circle/tile captions are darker + bolder** — Dan: "due
  to legibility issues." Group labels: `text-[color:var(--fluo-ink-soft)]` → `text-[color:var(
  --fluo-ink)]`, `font-bold` → `font-black`. Circle/tile topic captions (`SioHub.tsx`'s `SioNode`
  and `Unit0Panel.tsx`'s grid tiles): `--fluo-ink-soft` → `--fluo-ink`, added `font-bold`.
- **Unité 3 is unlocked.** Dan: "we need to open up 31 to 40 too." `LOCKED_UNITS` in `SioHub.tsx`
  is now `new Set([4])` — only Unité 4 remains temporarily locked (see §4.6 for why the lock exists
  at all; still meant to come off once Dan confirms that unit's content too).
- **SIOs renumbered to Dan's preferred order of appearance** — this is a REAL renumbering (SIO ids
  and Flashcard Set ids changed in the CSV, not just a display reorder), applied via a script
  against `docs/handoff/LAF1201_SIOs_Flashcards_v9.csv`, then `node scripts/gen-sios.mjs`
  regenerated `sios.json`. Content did not change, only which number it sits at:
  - **Unité 1:** 011 Stress pronouns (unchanged) · **012 Professions** (was 013) · **013 Matières**
    (was 014) · **014 Subject pronouns + ÊTRE** (was 012) · 015-020 unchanged.
  - **Unité 2:** 021 c'est/ce sont (unchanged) · **022 Possessives** (was 025) · **023 aimer** (was
    022) · **024 faire** (was 023) · **025 pourquoi ? parce que** (was 028) · **026 aller** (was
    024) · **027 Time — when I do it** (was 026) · **028 avec — with whom** (was 027) · 029
    vouloir (unchanged) · 030 Atelier (unchanged).
  - `UNIT_SITUATIONS` in `src/content/sios/index.ts` was updated to reference the new ids — the
    actual Situation groupings (which topics cluster together) are UNCHANGED from the book-verified
    mapping in §4.1, only the numbers attached to each topic moved. `SIO_CHAINS` (015→016→017) and
    `COLLECTION_BY_SIO` were untouched by this renumbering (none of the moved SIOs were in either).
  - **If a future session needs to renumber again:** the pattern is CSV `SIO #` + `Flashcard Set`
    fields for the moved rows, regenerate, then update `UNIT_SITUATIONS`' id lists to match. Don't
    hand-edit `sios.json` directly (it's generated).
- **Brief item lists added where authoritative vocab exists** — Dan: "we should briefly specify
  the list of items in the SIO for clarity and completeness." Done for:
  - **SIO-011** (Stress pronouns): competence now names all 8 (moi, toi, lui, elle, nous, vous,
    eux, elles) — standard grammar, safe to state outright.
  - **SIO-021** (c'est/ce sont): competence now cites the actual 14-item list from
    `docs/handoff/vocab_lists.json`'s `everyday_objects_SIO021` (un sac, un livre, un cahier, un
    téléphone, un stylo, un crayon, un passeport, une carte d'identité, une trousse, des ciseaux,
    une gomme, un portefeuille, des lunettes, une clé).
  - **⚠️ NOT done for SIO-012 (Professions) or SIO-013 (Matières)** — no authoritative vocab list
    exists in `vocab_lists.json` or elsewhere in the repo for either. Adding invented profession/
    subject words risks conflicting with whatever Dan actually intends for those decks later —
    ask him for the specific list rather than guessing. This is the concrete next step if pursuing
    Dan's "specify the list of items" request further.
- Verified live: pill is red, headings/captions are visibly darker and bolder, Unité 1/2 show the
  new order (11/12/13/14 and 21/22/23/24/25/26/27/28/29/30 matching Dan's sequence exactly), Unité
  3 expands and is fully browsable; `tsc` clean, no console errors.

### 4.9 Units 0-3 Practice decks built — SHIPPED 2026-07-01

Dan: "please begin and complete constructing units 0,1,2,3, please remember that some topics are
better as letris (word rain), and others as lexpress (word stream), sometimes both." Built via a
one-shot generator, `scripts/gen-new-decks.mjs` (kept in the repo as a reference/log of what was
authored, not meant to be re-run — see its docstring).

- **19 new decks wired end-to-end** — Collection JSON in `src/content/collections/`, wired into
  `src/content/collections/index.ts`'s `CURATED` array, mapped SIO→deck in `scripts/gen-sios.mjs`'s
  `COLLECTION_BY_SIO`, and (for the 11 with a sort-column axis) a matching `LetrisSet` JSON in
  `src/content/` registered in `src/games/letris/sets.ts`'s `REGISTRY`/`META`.
  | SIO | Unit | Deck id | Game |
  |---|---|---|---|
  | 004 Days | 0 | `days` | Match It |
  | 005 Colors | 0 | `colors` | Match It |
  | 006 Core nouns | 0 | `core-nouns` | Letris (un/une) |
  | 007 Numbers 0-20 | 0 | `numbers-0-20` | Match It |
  | 011 Stress pronouns | 1 | `stress-pronouns` | Letris (subject/stress/either) |
  | 012 Professions | 1 | `professions` | Letris (m/f) — ⚠️ see caveat below |
  | 013 Matières | 1 | `matieres` | Letris (le/la/l'/les) — ⚠️ see caveat below |
  | 018 Numbers 20-69 | 1 | `numbers-20-69` | Match It |
  | 019 avoir états | 1 | `avoir-etats` | Letris (avoir/être) |
  | 021 Everyday objects | 2 | `objets-articles` | Letris (un/une/des) |
  | 022 Possessives | 2 | `possessives` | Letris (mon/ma/mes) |
  | 023 aimer | 2 | `aimer-activites` | Match It |
  | 024 faire | 2 | `faire-activites` | Letris (du/de la/de l'/des) |
  | 026 aller | 2 | `aller-destinations` | Letris (au/à la/à l'/aux) |
  | 027 quand | 2 | `quand-time` | Letris (jour/fréquence/heure) |
  | 028 avec qui | 2 | `avec-qui` | Match It |
  | 032 en/au/aux/à | 3 | `en-au-aux-a` | Letris |
  | 035 question words | 3 | `question-words` | Match It |
  | 038 transport | 3 | `transport` | Match It |

- **"Sometimes both" implemented as a default, not a per-deck flag.** `SioDetail.tsx`'s
  `PracticeChips` now always offers Match It (Conveyor works for any fr/en deck) PLUS Classify It
  (Letris) whenever `deck.gameConfig.letris` exists — an earlier pass treated the two as
  either/or, which was wrong. Verified live on SIO-006 (Core nouns): the popup shows Flip It +
  Match It + Classify It together.
- **Discovered: Letris uses a second, separate schema from the Collection system** —
  `LetrisSet` (`src/games/letris/LetrisGame.tsx`: `{categories, tiles}`) is not the same shape as
  `Collection.gameConfig.letris.columns`, and lives in a different content directory
  (`src/content/*.json` vs `src/content/collections/*.json`) with its own registry
  (`src/games/letris/sets.ts`). Any future Letris-backed deck needs both files.
- **Deliberately left unbuilt** (not oversight — these are grammar-pattern/conversational SIOs
  better suited to a future gapfill "Complete It" than a vocab-list game): SIO-014 (être
  conjugation), SIO-025 (pourquoi/parce que), SIO-029 (vouloir), SIO-037, SIO-039. Unit 0's
  conversational SIOs (001/002/003/008/009) keep their existing Pretest MCQs but get no new
  Practice deck. All Atelier/production SIOs (010/020/030/040) never get decks by design — they're
  rubric-assessed, not deck-drilled.
- **⚠️ Professions (012) / Matières (013) vocab is first-pass, NOT authoritative** — same gap
  flagged in §4.8: no vocab list for either exists in `vocab_lists.json` or elsewhere in the repo.
  For this "complete the construction" pass the call was made to author standard A1-level vocab
  anyway (10 professions, 10 subjects) rather than leave them unbuilt, but Dan should review/swap
  the actual word lists before treating these two decks as final.
- **⚠️ Pre-existing bug found, not fixed (out of scope):** the `nationalities` deck has
  `gameConfig.letris` set (so it shows a Classify It chip) but has no matching entry in
  `sets.ts`'s `REGISTRY` — its Classify It link (`/games/letris/nationalities`) will 404. Predates
  this session's work.
- Verified live: all 19 decks' Practice routes return 200 with no console errors; spot-checked
  rendering (not just status) on a 2-col Letris (`core-nouns`), two 4-col Letrises (`matieres`,
  `en-au-aux-a` — all 4 article columns render with a falling tile), one Match It (`transport` —
  belt + dock + score UI), and the `core-nouns` Flip It page; `tsc --noEmit` clean.

### Other deferred items
- Adjectives **Expert Letris** (sort by il/elle/ils/elles agreement) — mirror the countries Expert mode.
- 195→185-country gender spot-check on `countries-expert-letris.json`.
- Build **Complete It** (gapfill, high ICAP value) and **Say It** (TTS production) — top priorities.
- The SRS scheduler is **dead code** until something writes review results — wire writes before relying on it.
- **Professions (012) / Matières (013) item lists** — need Dan to supply the specific vocab, see §4.9.
- **`nationalities` Letris registry bug** — add a `REGISTRY`/`META` entry in `src/games/letris/sets.ts`, see §4.9.
- **Public/mobile access ("web version")** — Dan asked to view the site on his phone; a tunnel
  (e.g. localtunnel) is blocked by the sandbox's own permission classifier until Dan explicitly
  names the tunnel mechanism himself (a vague "web version" request isn't sufficient
  authorization). `next.config.ts` already has `allowedDevOrigins` set for LAN access as a
  same-wifi fallback.

---

## 5. The 50 SIOs — source of truth

The canonical machine-readable source is **`docs/handoff/LAF1201_SIOs_Flashcards_v9.csv`** (+ `.xlsx`),
with vocab in `docs/handoff/vocab_lists.json` and the finalized deck spec in
`docs/handoff/README.md`. The Can-Do + linguistic-competence text Dan supplied is reproduced here
verbatim so the next agent can build SIO pages without re-deriving it. **`←` flags note grammar
guard-rails** (e.g. imperatives only allowed in SIO-009).

### Unité 0
- **SIO-001 — Introductions · Spoken Interaction (A1).** Can-Do: introduce myself/others, ask a
  name, address politely with M./Mme, using set phrases. Competence: conjugate *s'appeler* all 6
  persons (≥5/6); ask a name with tu/vous; introduce a third person (Il/Elle s'appelle…); use M./Mme.
- **SIO-002 — Tu / Vous · Spoken Interaction.** Can-Do: choose formality for one or more people.
  Competence: select tu / vous(polite sg) / vous(pl) in ≥10/12 situations; one-phrase reason each.
- **SIO-003 — Alphabet · Spoken Interaction.** Can-Do: spell names/words aloud, ask *Comment ça
  s'écrit ?* Competence: name all 26 letters; sort into 7 vowel-sound groups; spell aloud (≥90%).
- **SIO-004 — Days + moments · Spoken Interaction.** Can-Do: say/ask which day & time of day.
  Competence: 7 days in order + 3 moments; weekday/weekend; ask & answer *C'est quand ?*
- **SIO-005 — Colours · Spoken Production.** Can-Do: name basic colours. Competence: 12 colours +
  matching mnemonic object each (≥10/12).
- **SIO-006 — Core nouns · Spoken Production.** Can-Do: name common people/objects with article.
  Competence: 14 core nouns with un/une (≥12/14).
- **SIO-007 — Numbers 0–20 · Spoken Interaction.** Can-Do: understand/say 0–20, ask how many.
  Competence: read any 0–20; identify 17–19 as composites; say 20; answer *C'est combien ?*
- **SIO-008 — Question words · Spoken Interaction.** Can-Do: ask basic info with *C'est ___ ?*
  Competence: build a correct *C'est ___ ?* with each of 6 question words (6/6).
- **SIO-009 — Classroom instructions · Listening. ← only imperatives allowed.** Can-Do: follow
  short slow instructions, ask what to do. Competence: perform 9 instructions (≥8/9); ask *On fait quoi ?*
- **SIO-010 — Greetings · Spoken Interaction.** Can-Do: greet/leave appropriately for time of day &
  familiarity. Competence: register-appropriate greeting/leave-taking (≥8/10); sort meeting vs
  parting and universal vs familiar.

### Unité 1
- **SIO-011 — Stress pronouns · Spoken Production.** Competence: match 8 subject pronouns to stress
  pronouns; sort subject-only / stress-only / either (≥7/8).
- **SIO-012 — Être · Spoken Production.** Competence: conjugate *être* all 8 persons (≥7/8); m/f &
  sg/pl agreement on étudiant(e)(s).
- **SIO-013 — Professions · Spoken Production.** Competence: 10 professions m/f; present with il/elle
  est or C'est un/une (≥8/10).
- **SIO-014 — Matières · Spoken Interaction.** Competence: subjects with correct article; answer
  *Qu'est-ce que tu étudies ?*
- **SIO-015 — Countries (deck `countries-letris`, lesson 1.05).** **Locked to 25 cards** (not 39).
  **Matching, not Letris:** flag + *C'est quel pays ?* ↔ *Le pays, c'est…* + article. Article split:
  ∅ (2: Cuba, Singapour) · le (4) · la (12) · l' (5) · les (2).
- **SIO-016 — Nationalities (deck `nationalities`, 1.06).** Same 25 countries with all 4 adjective
  forms exactly (incl. coréen/coréenne, algérien/algérienne/algériens/algériennes). Matching: flag +
  country ↔ il est / elle est / ils sont / elles sont.
- **SIO-017 — Languages (deck `languages`, 1.07).** Same 25 countries, **matching not Letris**.
  Languages inferred where unspecified (e.g. le français, l'espagnol, l'arabe et le français for
  Maghreb). Full list in `docs/handoff/vocab_lists.json` — flag if any need changing.
- **SIO-018 — Numbers 20–69 · Spoken Interaction.** Competence: read any 20–69; *et un* composites (≥90%).
- **SIO-019 — Avoir · Spoken Interaction.** Competence: conjugate *avoir* (≥7/8); age; 4 states; sort
  6 states être vs avoir (≥5/6).
- **SIO-020 — Present a country · Written Production.** Can-Do: write a few simple sentences about a
  francophone country (prepared). Competence: 3–4 sentences with name, location, language, cultural fact.

### Unité 2
- **SIO-021 — c'est / ce sont · Spoken Production.** Competence: ≥6 items with c'est + un/une and ce
  sont + des; ask *C'est quoi ?*
- **SIO-022 — aimer · Spoken Production.** Competence: conjugate *aimer*; aimer + def article + N and
  aimer + infinitive (≥2 each).
- **SIO-023 — faire · Spoken Production.** Competence: faire + du/de la/de l'/des for ≥6 activities (≥80%).
- **SIO-024 — aller · Spoken Production.** Competence: aller + au/à la/à l'/aux for ≥6 destinations (≥80%).
- **SIO-025 — Possessives · Spoken Production.** Competence: correct possessive by gender/number, ≥8
  prompts (≥80%).
- **SIO-026 — When · Spoken Production.** Competence: le + day, le week-end, tous les…, à + time, ≥5 prompts.
- **SIO-027 — With whom · Spoken Production.** Competence: avec + stress pronoun/noun and seul(e), ≥5 prompts.
- **SIO-028 — Why · Spoken Interaction.** Competence: answer *Pourquoi ?* with parce que c'est + adj
  or parce que j'aime + N, ≥3 prompts.
- **SIO-029 — Inviting · Spoken Interaction.** Competence: vouloir/pouvoir for all 4 functions
  (invite/accept/refuse/suggest) in a short dialogue.
- **SIO-030 — Holiday email · Written Production.** Competence: well-wish formulas; 4–6 sentence email
  with ≥3 connectors.

### Unité 3
- **SIO-031 — Weather (deck `weather-letris`) · Spoken Interaction.** Competence: ≥6 weather
  expressions (≥80%); ask *Quel temps fait-il ?*
- **SIO-032 — Countries: location · Spoken Production.** Competence: en/au/aux/à with être/aller/venir,
  ≥6 sentences (≥80%).
- **SIO-033 — Town places (deck `lieux-letris`) · Spoken Production.** Competence: être/aller/venir +
  contraction, ≥6 sentences (≥80%).
- **SIO-034 — Locating places · Spoken Production.** Competence: spatial prepositions + contraction, ≥4 prompts.
- **SIO-035 — Questions · Spoken Interaction.** Competence: *Est-ce que…?* and open questions with
  each of 7 question words (≥80%).
- **SIO-036 — Directions (deck `directions-matching`) · Spoken Interaction. ← no imperatives.**
  Competence: directions with c'est + prep / il faut + inf / on + présent; ordinals premier–dixième,
  ≥4 prompts (≥80%). Models: *C'est tout droit. / Il faut tourner à gauche. / On prend la deuxième
  rue à droite.*
- **SIO-037 — pouvoir · Spoken Interaction.** Competence: conjugate *pouvoir*; ≥3 on peut / je peux /
  vous pouvez + infinitive.
- **SIO-038 — Transport · Spoken Interaction.** Competence: ask *Comment tu vas à…?*; answer prendre +
  transport; use *y*, ≥3 sentences.
- **SIO-039 — Wants & needs · Spoken Interaction.** Competence: je voudrais / j'aimerais / j'ai besoin
  de / je veux + noun or infinitive (all 4).
- **SIO-040 — Itinerary · Spoken Production. ← no imperatives.** Competence: ≥4 ordered steps with
  d'abord/puis/ensuite/après/enfin using il faut + inf / on + présent. Models: *D'abord, on prend le
  métro. / Puis, il faut descendre à Châtelet. / Ensuite, on tourne à gauche…*

### Unité 4
- **SIO-041 — Meals & food · Spoken Production.** Competence: 4 meals + ≥2 foods/drinks each (≥80%).
- **SIO-042 — Definite vs partitive · Spoken Production.** Competence: definite vs partitive, ≥8 prompts (≥80%).
- **SIO-043 — Negation · Spoken Production.** Competence: rewrite ≥5 affirmative food sentences to
  negative with de/d' (≥80%).
- **SIO-044 — manger / boire · Spoken Production.** Competence: conjugate *manger* & *boire* all
  persons (≥7/8 each).
- **SIO-045 — Frequency · Spoken Production.** Competence: place the 5 frequency adverbs correctly, ≥5 sentences.
- **SIO-046 — Demonstratives · Spoken Production.** Competence: ce/cet/cette/ces for ≥8 nouns (≥80%).
- **SIO-047 — Food shops · Spoken Interaction.** Competence: match ≥5 shops to goods; ask *Combien ça
  coûte ? / Je voudrais ___, s'il vous plaît.*
- **SIO-048 — Modals · Spoken Production.** Competence: aller/pouvoir/devoir/falloir + infinitive,
  correct meaning (one each).
- **SIO-049 — Restaurant review · Spoken Production.** Competence: ≥1 positive, ≥1 negative, a clear
  recommendation.
- **SIO-050 — Restaurant role-play · Spoken Interaction.** Competence: complete all 6 steps — greet,
  menu, order, interact, bill, pay & goodbye.

---

## 6. Key files map

```
src/app/
  page.tsx                         Home (header + ZonedLessons + MyDecks + "in the works")
  ZonedLessons.tsx                 Pre/Post selector + Unit→Lesson spine + deck chips  ← edited this session
  layout.tsx                       Fonts (Fraunces / Public Sans — no cursive/handwriting font)
  globals.css                      --fluo-* (old skin) AND --cahier-* (Le Cahier) tokens + primitives
  practice/flip-it/
    CahierFrame.tsx                Reusable spiral+tabs notebook frame
    [collectionId]/page.tsx        Flip It — REFERENCE implementation of Le Cahier
  games/conveyor/[deckId]/page.tsx Match It route (split vs meaning mode)  ← edited this session
  games/letris/[setId]/...         Letris (Expert mode only)
  pretests/[id]/...                MCQ pretests
src/games/
  conveyor/ConveyorMatch.tsx       Match It game  ← edited this session
  letris/{LetrisGame.tsx,sets.ts}  Letris + set registry
  audio/chiptune.ts                Synth + tracks + fanfare/lostLife/gameOver  ← edited this session
src/content/
  collections/*.json + index.ts    Decks
  pretests/*.json + index.ts        Pretests
src/lib/collections/schema.ts      Item / Collection types
docs/
  PRETEST_BLUEPRINT.md              Pretest pedagogy (read before building pretests)
  handoff/LAF1201_SIOs_Flashcards_v9.csv   Canonical 50-SIO + competence + thresholds
  handoff/vocab_lists.json          Vocab incl. inferred languages
  handoff/HANDOFF_NEXT_CLAUDE.md    ← this file
~/.claude/plans/peaceful-wishing-ladybug.md   Le Cahier rollout plan (Phase 3 = Home + Pretest)
~/Downloads/fluolingo-soundtest.html          Original audio prototype (source of the chiptune port)
```

## 7. Persistent memory (already written, auto-loaded each session)
`~/.claude/projects/-Users-keijidan-projects/memory/` — see `MEMORY.md`. Most relevant:
`fluolingo_three_axis_ecosystem`, `fluolingo_icap_tiers`, `fluolingo_pre_post_architecture`,
`fluolingo_pretest_pretesting_effect`, `fluolingo_skin`, `fluolingo_zones`,
`laf1201_flashcard_spec_v9`, `conveyor_match_game`, `laf1201_expert_letris`, `flip_it_redesign_spec`.

## 8. First moves for the next agent
1. `./node_modules/.bin/tsc --noEmit` (confirm clean) and open http://localhost:3000.
2. Decide with Dan: build the **SIO hub** (§4) or fill **Complete It / Say It** activities first.
3. If SIO hub: extend `ZonedLessons` (or a new `/sio/[id]` route) using the agreed layout (§4),
   reading SIO text from the CSV (§5), and roll the Le Cahier skin from `CahierFrame` to Home.
