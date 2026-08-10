# FluOlinGo UI audit — 10 Aug 2026

Six independent design passes over every page, at 390×844 (the phone your class
will use). Every finding was seen on a rendered screenshot, not inferred.

---

## FIX TONIGHT — these are broken, not ugly

| # | What | Where |
|---|---|---|
| 1 | **SpecuLearn photos are 404.** `devine-aliments.json` points at `/devine/*.jpg`; there is no `public/` dir. The flagship photo deck is unplayable. | asset pipeline |
| 2 | **Match It's Restart button is off-screen and unscrollable on a phone.** HUD is `flex` with no wrap, sits at `left:402` in a 390px viewport. | `MatchingGame.tsx:155` |
| 3 | **`/games/matching/aliments` is a 404.** Only `directions-matching` has pairs. The gallery is one tile in 900px of blank paper. | `games/matching/[collectionId]/page.tsx:4` |
| 4 | **Dice: the first answer option is 1px below the fold** of a scroller inside a modal. Students cannot see a single choice. | `SioModal.tsx:249` |
| 5 | **Leaderboard XP falls back to gems.** Spending gems in the Boutique lowers your rank. | `LeaderboardList.tsx:27` |
| 6 | **16 students' names, emails and UIDs are hardcoded** in a client component. PII ships to every browser that loads `/teacher`. `roster` is already a prop. | `Students.tsx:31-48` |
| 7 | Pretest copy: `"pretest— you"`, `"26quick guesses"`, and `word → flag` on a **food** deck. | `PicturePretestContent.tsx:224,230` |
| 8 | `/moi` builds `rows` then discards it (`void rows;`); `Math.random()` in a React key remounts the whole history every render. | `MoiContent.tsx:279-304` |

---

## THE FOUR ROOT CAUSES

Everything else in this document is a symptom of one of these.

### A. One CSS rule makes every button full-width

```css
/* globals.css:856 */
.cahier-option { display: block; width: 100%; }
```

That is your complaint, in one line, applied everywhere. `m'appelle`,
`t'appelles`, `Il`, `Lui`, `milk`, `oil` — all rendered as 255px bars, one per
row, left-aligned.

**Fix:** `display:flex; align-items:center; justify-content:center; width:auto;`
plus `.cahier-options { display:grid; grid-template-columns:repeat(2,1fr); gap:.5rem }`
and a `--stack` modifier for options over 18 characters. Four call sites change
one word. This is the single highest-value edit in the audit.

### B. Nothing is paged. Everything is a scroll.

Measured document heights on an 844px phone screen:

| Page | Height | Screens |
|---|---|---|
| `/practice/flip-it` (hub) | 3969px | 4.7 |
| `/activities` (units open) | 3810px | 4.5 |
| `/moi` (seeded) | ~4700px | 5.6 |
| `/games/matching/directions-matching` | 2396px | 2.8 |
| `/decks/new` | 2755px | 3.3 |
| `/about` | 2653px | 3.1 |
| `/practice/flip-it/aliments` | 1967px | 2.3 |

Duolingo's number for all of these is **1.0**.

### C. Three page shells, eight drill layouts, six game HUDs

The same four jobs — progress, feedback, primary action, exit — are
re-implemented in every activity. That is why Match It's Restart is off-screen,
why NumBus's title truncates to `🚌 ⋯`, why Dice's options fall below the fold,
and why the app feels like six student projects.

The four `/practice/*` drill URLs don't even render a drill: they render the
whole unit map and open a **resizable popup** on top of it. 36-44% of the phone
screen is spent before the first question. `SioModal` has ~120 lines whose only
job is compensating for a container that shouldn't hold a drill.

### D. Four different orderings of the same nineteen activities

| Surface | Order |
|---|---|
| Matrix columns | Pre-Test · SpecuLearn · Lesson · Flip It · VocabulaRain · LexicaLater · Compose It · GramMarathon · WorDrill |
| Flap rail | Index · SpecuLearn · ConjugaZone · ÉcouTexte · VocabulaRain · LexicaLater · NumBourse · NumBus · ChaTutor · DéjàRevu · WorDrill · VoixLà |
| HELP panel | + Lesson, Flip It, Compose It, GramMarathon, GramMarathon Final |
| Family cards | seven families |

Not one of the four contains the same set. Same activity, different emoji per
surface: ConjugaZone is 🧮 and 🔤; DéjàRevu is ♻️ and 🔁; VoixLà is 🔊 and 🗣️.
Two HELP tiles both truncate to `GramMara…` and become the same button.

**Fix:** `src/content/activities.ts` — `{ key, name, emoji, family, href, order }`,
nineteen rows. Rail, HELP, matrix and families all derive from it. Half a day,
and the ordering complaint can never come back.

---

## THE PROSE TO DELETE

Every one of these is on screen permanently, on a page where the learner is
trying to do something else.

- **12 flap subtitles**, 8 of which truncate: `every activity, one l…`,
  `type the shouted n…`, `type the number yo…` — `siteTabs.ts:51-65`
- Keyboard legends rendered on phones: WorDrill's 8 shortcuts
  (`SayItContent.tsx:558`), NumBus's 5 (`NumBus.tsx:892`), VocabulaRain's
  `← → ↓ Space P` (`LetrisGame.tsx:789`), Flip It's `T R Space ↑ ← →`
- LexicaLater: a 24-word instruction paragraph + the title rendered twice + a
  **blinking red** "Drag down a chest to begin" with four simultaneous infinite
  animations (a WCAG 2.3.1 flash risk)
- The pretest's 90-word intro essay with an academic citation
- ChaTutor's 61-word greeting, filling the chat window before you type
- `/about`: 551 words and seven references with volume and page numbers
- `Every deck × every activity — tap any cell.` / `Vos decks · Your decks` /
  `Les cartes que vous créez vous-même` / `Tap any cell to cover or reveal it…`

And the **3-second copyright interstitial before every single game, every
reload, forever** (`CreditsSplash.tsx:32`). The first thing your app says is
"© All rights reserved". Move it to the game-over card, where a student who just
scored 240 is pleased to read your name.

---

## TRUNCATION: 39 labels on the home screen alone

76% of the road-map labels are cut: `Core nouns — people, thi…`,
`vouloir — invite, accept, resche…`, `en / au / aux / à — preposition…`.
9px bold in a 56px cell fits ~11 characters; your median topic is 22.

This is not a layout bug. `sios.json` topics are **syllabus descriptions being
used as labels**. Add `short: string` (max 18 chars) to the SIO schema and a
build check that fails when a bound string exceeds its box. You will keep adding
objectives in week 3; without the check the ellipses come straight back.

---

## THE ONE COMPONENT THAT FIXES MOST OF IT

```
┌────────────────────────────────────────┐  56px, static
│  ✕      ▓▓▓▓▓▓▓░░░░░░░░░░      ♥♥♡     │
├────────────────────────────────────────┤
│                                        │
│              ONE ITEM                  │  flex-1, max-w-600, centred
│         (prompt + input only)          │  never a nested scroller
│                                        │
├────────────────────────────────────────┤
│  ✓ Correct!            [ CONTINUE ]    │  tray slides up, overlays,
└────────────────────────────────────────┘  does NOT push content
```

Rules the shell **enforces**, so no drill can break them again:

- Exactly one full-width button on screen at a time. A secondary action is
  40/60 side-by-side. There is no API for stacking two.
- Feedback never reflows the body.
- The body slot hides any `<h1>` a drill tries to print.
- Enter/Space fire the visible CTA. One binding, defined once.
- Tapping an option **selects**; the CTA **commits**. (Today: six drills, four
  different interaction grammars.)

Eight drills, two pretest engines, DéjàRevu and the lesson all become bodies
that pass in `progress`, `cta`, `feedback` and nothing else. Roughly 400 lines
deleted. The games get the same treatment as `GameFrame` with
`height:100dvh; overflow:hidden`.

---

## THE LESSON — the worst page in the app

44 tappable controls before the learner answers one question. The difficulty
picker is rendered **twice with identical labels** (`DicedPractice.tsx:176`,
`DiceTrainer.tsx:138`). Three separate buttons all named `🎲 Nouvelle question`.
The drill **never ends** — `roll()` reshuffles forever. No progress bar. No
completion screen. On desktop the popup's flaps sit physically on top of the
unit rail behind them.

**Convert it to a card pager.** `min(3, memoCards) + 12` cards. Rule cards from
splitting the memo at its top-level children; exercises as a fixed ramp — 1-4
MCQ, 5-8 gap, 9-11 build, 12 translate. Difficulty stops being a button and
becomes the ramp. Progress bar counts cards, denominator locked at mount, wrong
answers re-queue once. End card: 🎉 + XP/accuracy/time + the missed items as
chips + `CONTINUER` and `↻ Refaire` side by side.

---

## /moi — "Hardest items", and why it's a hot mess

One flat grid contains three incompatible things:

| renders as | actually is |
|---|---|
| `SIO-042 · partitifs-03` | one word, prefixed by its outcome |
| `Bonjour` | one word, outcome never resolved |
| `SIO-045 · finale:SIO-045:3` | a question *about a whole outcome* |

And `borderColor: HUES[i % HUES.length]` gives each card a rotating colour that
**encodes nothing**. Six hues cycling through 60 cards is why the block looks
broken.

**Outcome rows, items nested. Never mixed on one line.**

```
🎯 What to fix
┌──────────────────────────────────────────────┐
│ SIO-042 · Défini ou partitif ?          U4   │
│ ████████░░  8 of 14 items weak    ✗ 23       │
│ [ Practise this ]                        ▸   │
└──────────────────────────────────────────────┘
   du pain ✗7   de l'eau ✗5   des ✗4   + 3 ▾
```

- Group key is `outcomeForItem()` — already written, already correct, currently
  never called on this page.
- Unresolvable items go in one collapsed "Not yet mapped" bucket, pinned last.
- Marathon items become *evidence for* their outcome's row, not chips.
- Item chips drop the SIO prefix inside their own group.
- Colour becomes meaning: red ≥50% weak / amber ≥25% / green — the same
  `missColor()` the teacher dashboard uses.
- Order by `misses × weakItems`. Top 3 shown, rest behind `Show N more`.

---

## TEACHER DASHBOARD — the headline

**There is no per-outcome mastery on it.** `outcomeForItem` is called **zero
times** in `src/app/teacher/`. It groups by pretest, by game, by deck, by item —
never by SIO. It can tell you which *page* was visited, not which *outcome* the
class is failing.

It also cannot answer "right now": every window is 7 or 14 days, refresh is
manual. Finding a struggling student costs 16 modals.

**Replace the Overview with a "Class now" board.** 16 tiles, 4×4, auto-sorted
worst-first, repolling every 30s: name, live/today/absent dot, the outcome of
their last 5 answers, a last-10 accuracy sparkbar. Red = 3 consecutive misses on
the same outcome in 20 minutes. Below it, the outcome × student matrix — SIOs as
rows, your 16 students as columns, cells green/amber/red. One `useMemo` over data
you already fetch.

---

## OUT OF THE BOX — the six worth doing

**1. Delete the galleries. Ship a Play button.**
26 LexicaLater sets, 24 VocabulaRain, 11 Compose, 50 Flip It decks — each a long
scroll asking a first-year to make a curriculum decision they can't make. You
already have an SRS scheduler. Replace each gallery with one card showing the
*next* set and a `▶ Jouer`, plus `Choisir un autre` opening the grid as a bottom
sheet. 80% of students never see a list. The scroll complaint disappears without
designing a single tile. **M**

**2. The matrix cell should say how you did, not whether the link works.**
277 of 450 cells render an emoji meaning "this exists"; three columns are the
same emoji repeated 150 times. Repaint from telemetry you already write: hollow
ring = never opened, half = started, filled = passed. The grid stops being a link
table and becomes the syllabus completion map — the screen worth projecting in
week 6. **M**

**3. One component, four pages: the syllabus heat-strip.**
50 SIOs as 50 squares in 5 unit rows, red/amber/green/grey, 120px tall, no text.
On `/moi` it replaces the 45-card weak list. **Sixteen of them stacked IS the
per-outcome matrix the teacher dashboard doesn't have** — a vertical red stripe
means the whole class failed that outcome, which no table can show. **M**

**4. Put the class's position on the road.**
You know the week-by-week schedule. Draw the road **paved to this week's stop and
unpaved beyond** — not greyed out. Two markers: a flag where the class is, a glow
where the learner is. Ahead of the flag is a flex; behind it is actionable. This
replaces the fog that currently greys out 75% of your home page on day one. **S**

**5. Word-bank tiles instead of typing, on phones.**
Three drills ask a phone user to type accented French. You built accent-tolerant
graders *because* that's miserable. Below `sm`, render the answer as tappable
chips (correct tokens + distractors from the same deck). Faster rounds, no accent
problem, no keyboard over the CTA, and a free difficulty knob. **M**

**6. Print the map.**
Your real competition on day one is a paper syllabus. The road map is already an
SVG. A `@media print` sheet drops the shell and lays all 50 stops on one A4
landscape with full labels and a QR per unit. Hand it out in the first tutorial.
It solves the onboarding problem `FirstTour` is spending 200 lines failing to
solve. **S**

---

## IF YOU ONLY GET ONE DAY

1. `globals.css:856` → 2-column option grids. One rule, four one-word edits,
   fixes the full-width-button complaint on every page at once.
2. The eight items in **FIX TONIGHT**.
3. Delete the prose list above — it is all deletions, no design.
4. `hidden sm:block` on every keyboard legend.
5. `CreditsSplash` once per browser, not once per game launch.

Days 2-4: the drill shell. Day 5: the lesson pager. Everything else after term
starts, when you can watch students use it.

---

*No page in this build contains the `LAF1201 · French I / MENU` band. All six
passes checked. The only `LAF1201` string is the `<meta description>` at
`layout.tsx:54`.*
