# STATUS — the one place that is true (22 Aug 2026)

Every agent (Claude Code `main`, Peers, Cursor, Claude Chat, Cowork PM) reads
**this file first** and updates it before ending a session. `HANDOFF.md`, `TODO.md`,
`docs/planning/UI_WORK_PLAN_1.md`, `docs/audit/` are HISTORY — useful for the *why*,
wrong about the *what's left*. If they disagree with this file, this file wins.
Only ONE agent edits this file at a time; say so in your commit.

## 7 Sep, later — games in the page, and the SECOND same-day collision (Peers)

Sole editor of STATUS.md in this commit: Peers (`claude/peers-vd2h6h`).

**PR #207 is open and waiting on a decision fluoduo-main has to make, not on
its own CI.** Dan was shown the situation and ruled: *hand both to fluoduo-main
to reconcile.* Nothing here should land before that.

Dan asked this lane for games *"embedded like the map, (with option to go full
screen), and remember the landscape modes"*. He asked the pre-tests lane, the
same day, for *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER PAGES
IN IFRAMES"*. **These are one instruction and they were built twice**, an hour
apart, and both are correct:

    /games/vocabularain           the SET LIST   -> on main, an iframe (EmbedFrame)
    /games/vocabularain/aliments  the GAME       -> PR #207, a box in the page

A learner cannot tell them apart; the code has two machines for one job. This is
the `blankKeysFor` case again — the fifth same-day duplication in a week — and
it is why the merge gate exists. Neither branch conflicts TEXTUALLY: #207
rebased onto `89ff466` clean.

If the iframe mechanism wins, three things in #207 are independent of it and
should be carried over rather than dropped: the **⛶ / ⤡ key** (the iframe
version has no full-screen option and Dan asked for one — and a box inside an
iframe can only fill its own window, so it will have to ask the host to go full
for it), the **landscape rule**, and the three bugs below.

**Three faults it turned up, real at any size:**

- **VocabulaRain's sky never sized to its board.** Patch 23's rule ran through
  `useBoardSize()` — a context `GameFrame` PROVIDES — and `LetrisGame` is the
  component that renders `GameFrame`, so the hook sat above its own provider and
  returned `{0,0}` every time. Every row has been the 48px fallback since the day
  it was written. Nobody noticed while the game owned the whole phone. The sky is
  a flex child with `minmax(0, 1fr)` rows now and cannot overflow at any size.
- **The puddle labels ran off the edge** at 293px of board — « LÉGUME »,
  « BOISSO ». They size from `--board-w` in CSS now, 9–16px.
- **The game bar overflowed** once ⛶ joined it: ⋯ half off the right edge. Gaps
  and key sizes tighten below `sm`.

**Number collisions, the eleventh AND the twelfth, forty minutes apart.**
Written as `verify111`; main claimed 111–118 while it was in flight (115 being
this lane's own Finale work re-landed via #214), so it went to **119** — and
the colour-review lane claimed 119 and 120 in the minutes between that push
and CI running. Now **121**. Both were caught by `verify-wiring` at push time,
neither by anyone's scan, which is the whole argument for the check: a scan is
a snapshot, and today `main` and four branches are all moving inside the same
hour.

## 7 Sep — THE PRE-TESTS LANE WENT STRAIGHT ONTO `main`, AT DAN'S WORD. Rebase before you push.

Sole editor of STATUS.md in this commit: the pre-tests lane.

**`main` moved from `e451be65` to `89ff4667` — twelve commits, ~91 source files,
pushed direct, not through a PR.** Dan, this morning: *"so let go"*, then
*"push to main for deploy ok"*. The branch gate was bypassed with his say-so
and the push says so on its face (GitHub printed *"Bypassed rule violations for
refs/heads/main: Required status check 'verify' is expected"*). Everything the
gate would have run was run first, locally, on the merge commit itself:
`tsc --noEmit` clean, `NEXT_PUBLIC_OPEN_APP=1 npm run build` green, **all 105
verify scripts named in the workflow**, the jam scan over all 59 lesson pages,
and `eslint` over all 91 touched source files — no findings.

**WHAT THIS COSTS THE FOUR OPEN PRs, and what to do about it.** 204, 207, 217
and 220 were all cut from a base that no longer exists. This is the author's
job, not the integrator's:

    git fetch origin main && git merge origin/main    # or rebase

Expect `docs/STATUS.md` to conflict — it quotes conflict markers in its own
prose, so a naive resolve loop corrupts it; resolve it line-exactly.
**PR 220 (`feat/stop-in-bar`) is the one to look at hardest**: it moves the
map's stop into the bar, and this lane just rebuilt `MapBody` around it —
the legend moved under the grid and the road now redraws on `visualViewport`.
Both are needed; a merge that keeps only one side loses a fix nobody can see
in the other's diff.

**Verify numbers, for the record**: this lane holds **117** (swipe rail) and
**118** (three faces). 110 belongs to the colour review and stays theirs.

**What is now live-able**: the swipe rail end to end, the pre-tests under
SpecuLearn one question per screen, twenty-one routes running framed inside
the cahier, three type families, and the map's pinch fix.

## 7 Sep, after the merge — main landed the fonts too; the map gets its controls back (pre-tests lane)

**MERGED `origin/main` INTO THE BRANCH.** Seven conflicts, and one of them is the
collision this repo's rules exist for: **main did the font job too** (PR 213,
"Three fonts, no more"). Two lanes, one instruction, an afternoon apart. Main's
is the one that landed and the one kept — it is Dan's fuller 6 Sep roster, with
the DISPLAY role going to his own hand. What this branch contributed and keeps
is the evidence: the count that showed Roboto rendering on zero text runs while
loaded on every page, and Iowan Old Style rendering on four.

The other six resolutions, each needing BOTH sides:
- `CahierShell` / `DrillShell`: main's `cahier-surface` (one colour class) and
  this branch's `touch-pan-y` (hands the sideways drag to the rail).
- `HomeDashboard`: this branch's 1/50 counter in the key group AND main's 🎓
  key for a finished course — unrelated additions to the same row.
- `games/vocabularain`: main landed the expert-unlock gallery on the file this
  branch was turning into a host. The gallery is the ACTIVITY, so main's went
  whole into the embed twin.
- `globals.css`: main's font declarations, this branch's note on the serif.
- `STATUS.md`: both histories, line-exactly (the file quotes conflict markers
  in its own prose, so a naive resolve corrupts it).

**Two more number collisions.** 110 and then 111 were both claimed on main
while this branch held them; 112 as well. Renumbered to **117** and **118** —
the ninth and tenth in this repo, every one caught by `verify-wiring` at push
time rather than by anybody's scan.

### The map, and what framing it had quietly cost

**`MapBody` had no importer left.** Pointing `/map`'s frame at `/map/embed` —
the deliberately BARE map built on 6 Sep for other people's pages — took the
2D/3D switch, the zoom and the stop popup off the app's own map. That is the
exact thing Dan asked to be put ON it on 2 Sep. `/map/embed` renders `MapBody`
now; the bare one keeps its job at **`/map/standalone`**, where the name says
which of the two it is.

**The legend moved under the map** (Dan: *"ON THE MAP. PUT THE COLOR LEGEND AT
THE BOTTOM OF THE MAP"*). It sat between the sentence and the controls — a key
to the colours ABOVE the colours it keys.

**The road detaches on a PINCH, and that is why nothing caught it.** Dan:
*"WHEN DRAGGING THE MAP THE LINE JOINING UP THE STOPS GET DETACHED FROM THE
STOPS"*, then *"NOT A SCROLLER BUT PINCH GESTURE"*. The 2D road is MEASURED —
fifty node centres read from the laid-out DOM — and the only thing re-measuring
it was a ResizeObserver. **A pinch changes the visual viewport, not the layout**:
the box's CSS size does not move a hair, the observer never fires, and the
polyline keeps pre-pinch coordinates while the stops paint at the new scale.
`visualViewport`'s `resize` and `scroll` are the only events a pinch raises, and
the road now redraws on both, rAF-throttled. Driven first with scroll and with a
real touch flick, which is how the cause was narrowed to the one gesture that
raises neither of the events it was listening for.

**And a fault that came in on main, flagged rather than left**: `Map2DGrid` had
a dead `sunk` variable with a comment claiming it "still drives the COLOUR". It
did not — the colour had moved to `done` — so the note described a rule the file
no longer followed. Both it and the now-orphaned `ahead` are gone.

## 7 Sep, closing — the last twelve surfaces run in the cahier too (pre-tests lane)

Dan: *"proceed the remaining unframed surfaces (the games, ConjugaZone,
ChaTutor, VoixLà, DéjàRevu, Profile)"*. All twelve, paired: ConjugaZone,
ChaTutor, VoixLà, DéjàRevu, Profile, My Progress, ÉcouTexte, WorDrill,
ComposeIt, Numbers, VocabulaRain, LexicaLater.

Nothing in any of those pages had to change to lose its notebook — the twin
renders the SAME component and the chrome is hidden by CSS in a framed
document. Driven at 390px afterwards: all twelve report `data-embed=1`, a
hidden site bar, real content, and no page errors.

**One duplicate the drive caught and reading would not have.** The site footer
lives in the root layout's `<body>`, OUTSIDE the `TopLevelOnly` guard, because
it is markup rather than a mounted helper — so every framed station printed
« FluOLinGo · built by Dr Daniel Chan … » inside its own box, beneath the one
the page around it was already showing. It is at the bottom of a scroller, so a
screenshot of the top does not have it. Hidden now under `html[data-embed]`.

**Nine checks followed the code, none weakened.** verify-grading, verify20,
verify23, verify30, verify33, verify47, verify53, verify82 and verify100 all
read `src/app/<route>/page.tsx` for the ACTIVITY, which now lives in the twin.
Each reads the twin and every assertion is unchanged.

**And the pattern checks itself now.** `verify111` gained a sweep over
`**/embed/page.tsx`: every twin must have a host beside it that mounts an
EmbedFrame pointing at it. Either half alone is a broken page — a host with no
twin is a notebook around a 404, a twin with no host is an activity nobody can
reach — and neither failure is visible from the other's source. Written as a
sweep so a station added next month is covered without anyone remembering.

### What is still unframed, and why

- **`/lessons/[slug]`** — the lesson by its old slug, the same content as
  `/lessons/deck/<deck>` by another door. `jam-scan` drives those 59 pages for
  text collisions in the top document; framing them means teaching it to look
  inside the frame, and that check has already cost this branch an afternoon.
- **Unit 0 and the picture pre-tests**, still at `/pretests/...` — separate
  runners (547 and 472 lines), unframed and one-question-at-a-time.

## 7 Sep, last — the 50 axis labels in one pass, and the tour's missing tickbox (pre-tests lane)

Dan: *"yes in 1 pass, and why is the why never offer again without the check
box."*

**THE PASS.** 50 distinct AXIS labels across the 59 lessons, and separating them
from the 97 raw `label:` strings mattered: an axis label is the picker's
CATEGORY (« Quel jour ? ») and an option label is the French being chosen
between (« le client », « négatif »). They are told apart structurally — an
axis label is the `label:` that follows a `key:` — not by eye, because a wrong
guess would have translated the content out of the course.

**32 changed, in 20 files.** Kept: already-English (Opener, Place, Question,
Type, Usage, Situation, Article), number ranges, and the cognates a first-week
learner reads without being taught — **Sujet, Verbe, Verbes, Forme** — which is
Dan's own 5 Sep reason for « Idée · Formes · Exercice ».

**One collision the sweep had to be checked for.** « Où ? » and « Quel lieu ? »
both mean "where", and one lesson (`ou-est`) has both: translating each straight
gave it two selects with the same name. They ask different things — one picks
the PREPOSITION (devant, sous, à côté de), the other the PLACE — so they are
« Preposition » and « Place ». A rerun confirms no lesson has a duplicate axis
label and no axis label still reads as French.

**THE TOUR'S THIRD OPTION HAD LOST ITS TICKBOX.** « Never offer again » was a
bare underlined line under two buttons: it looked like a caption that had lost
its checkbox, and it was in fact a third ACTION sitting where a setting appears
to be. The app's other first-run sheet (`FirstRunHint`) has asked the same
question as a checkbox above its confirm button since 2 Sep, so a learner met
two sheets asking one thing two ways. It is a checkbox now — tick it, and
« No thanks » honours it.

## 7 Sep, late — English on the picker, a gift for Bonus, and the gap closed (pre-tests lane)

Dan, on the lesson's Exercice panel: *"English pls We don't want au hasard and
La phrase and Qui (the rest is ok). The bonus should a gift emoji. and why is
there so much space between the four icons and the choose your level"*.

**« au hasard » → « Any », « Qui ? » → « Who », « La phrase » → « Sentence ».**
These are the SELECTS a learner must read to pick what to practise, so the 6 Sep
test settles it: not *"is this French?"* but *"is a learner STUCK in front of
it?"* A select whose only value you cannot read is a control you cannot use.

**« Sujet », « Verbe » and « Forme » on other lessons stay**, and that is the
same ruling rather than an exception: they are cognates a first-week learner
reads without being taught, which is Dan's own reason for keeping « Idée ·
Formes · Exercice » on the tab strip.

**⭐ → 🎁 for Bonus.** The other three count stars — one, two, three — so a
fourth star said "four" and read as one more rung of the same ladder. Bonus is
not harder by a step, it is a different exercise (whole sentences, translated).
Followed through the two other places the pair is written out: the tab strip's
`does` line and the first-run hint.

**The gap was TWO things paying at once**, which is why it was 250px of ruled
paper: the chooser's own `pt-8`, and the panel centring itself in a screenful so
half the slack went ABOVE it. The panels pin to the top now, like the goals
scroller since the same day, and the chooser's padding drops to `pt-2`.

### Still French, and Dan has not been shown it

The picker's axis labels are per-lesson content and **97 distinct labels** are
in use across the 59 lessons. He said *"the rest is ok"* while looking at ONE
lesson, so only the two he named were changed. The non-cognate ones he has not
met yet include « Où ? », « Combien ? », « Quel jour ? », « Quel lieu ? »,
« Pays », « Prénom », « Fréquence », « Cadre », « Public ». They are the same
kind of label as « Qui ? » and by the same test they should be English — but
that is 97 content decisions and his to make, not a sweep to run quietly.

## 7 Sep, evening — the goal's torn tag, the lesson's frozen strip, Home's row (pre-tests lane)

Four of Dan's, in one pass.

**1 · THE GOAL'S TAG IS A TORN SCRAP, AND NOTHING MOVES BETWEEN GOALS.** He
sent a photograph of a torn piece of paper: *"The SIO0xxx Unit ,,, words can
look they were on piece of paper pasted on? and perpetually at the same height.
while the icons can just be by themselves below that (also down from the same
height onwards)"*.

The tear is a `clip-path` — forty points walked round the perimeter with a
±3.2% wobble, generated once with a fixed seed so the shape is a decision and
not a lottery on every build. `filter: drop-shadow` on the WRAPPER and the clip
on the child, in that order: a box-shadow on a clipped element is clipped away
with everything else, so the scrap would sit flat instead of pasted on.

The second half is the structural one. The tag and the icons are the two things
all fifty goals share, so on a one-per-screen feed they must land in the same
place on all fifty. Measured after: **tag at 52px and icons at 473px on every
goal**. Getting there meant the row pinning to the TOP rather than centring
(centring puts a two-line can-do in a different place from a four-line one),
and the words sitting in a box of `min-h-[21rem]` — 336px, which is measured:
the natural height of all fifty was taken at 390px and the tallest, SIO-006,
needs 335. If that one goal's wording is ever cut, the number comes down with it.

**2 · THE LESSON'S TAB STRIP LEFT THE SCROLL BOX.** Dan: *"For MneMemo, the
scrolling is to start only after the : Goal-Idea-Form-Exer."* It was
`position: sticky` inside the scroller, which looks the same and is not: a
sticky element is still in the flow, so a row snapping to the top of the
scroller arrived UNDER it — which is why every row carried a `scroll-mt-14`
matching the strip's height, in three places, kept in step by hand. DrillShell
has a `[data-subhead]` slot above the scroller now and the strip PORTALS into
it. A portal rather than a prop because the strip's state is LessonTabs' — it
knows which panel the scroll settled on — and lifting that up through the pager
only to hand it back down puts the strip and the panels somewhere they can
disagree. The three 56px offsets are gone.

**3 · FOUR DIFFICULTY BUTTONS ACROSS.** *"Can the choice of difficulty be in
four horizontal buttons"*. Stacked stars over name, for the same reason the tab
strip one row below stacks emoji over word: a quarter of a 390px phone is ~85px
and « ★★★ Difficile » on one line needs about 120.

**4 · HOME LOSES A ROW.** *"can we squeeze the 1/50 into between 2D and Play,
but in smaller space of course. Then we can take out the 'Next...'."* Both
done. « Next: Introductions » named the stop the ▶ key opens and the map below
highlights — a third telling — and it cost a whole band of the hero.

The squeeze is unforgiving arithmetic and worth writing down: the row has 297px
at 390, four keys at the 44px tap floor are 188 and the 2D switch is 72, which
leaves **37px** for the counter and its gaps. 26 is what fits; at 30 it was one
pixel over and wrapped. Below 390 the row still wraps, as it has since the four
keys arrived — the counter sits INSIDE the key group so it wraps WITH the keys
rather than being marooned on the switch's line.

**Three checks were rewritten onto the new rulings, none weakened**: verify80
pinned two rows with « Next: … » between the counter and the switch — the 1 Sep
arrangement Dan has now retired — and pins the single row and the absence of
« Next: » instead; verify37's well rule was a literal 64/80px and is now the
arithmetic; verify106 lost two ramp rules whose sizes no longer exist anywhere.

## 7 Sep, later still — three type families, measured (pre-tests lane)

Dan: *"i can still see a lot of Geist and Work Sans -- it should only be
FluOLinGo, Roboto (and Patrick in reserve)"*.

**What was there, counted before anything was touched** — every visible text
run on eight routes, asked which family the browser had resolved:

        1180  Work Sans        the whole app, effectively
         139  Geist Mono       every small caps label
          24  FluOLinGo Hand   the bands and the wordmark
           4  Iowan Old Style  a system serif nobody had chosen
           1  Patrick Hand
           0  Roboto           loaded on every page, rendering nowhere

Roboto was the one face he asked for and the one that never appeared: it was
wired to `.fluo-readable`, which four components use. So this was not a swap of
one font for another — it was the type system finally saying what it was asked
to say. After: **1319 Roboto · 28 FluOLinGo Hand · 1 Patrick Hand**, and
nothing else.

**The fourth family was never shipped at all.** `--fluo-serif` named
`"Iowan Old Style", Palatino, Georgia, …` — system fonts, no load — so
« Choose your level » was Iowan on a Mac, Palatino on some Windows and Georgia
elsewhere. It takes the house hand now, which is what Dan already ruled for
titles on 5 Sep. `--fluo-mono` is a ROLE, not a metric: nothing under it is
tabular, it is the small caps label, and Roboto draws it with the tracking
unchanged.

The role NAMES stay (`--font-body`, `--font-display`, `--font-sans`,
`--font-mono`) even though all four now resolve to Roboto. Collapsing them is
how a type system loses the ability to change its mind.

`verify112` pins all of it: three imports, no stack naming a face the app does
not load, and the body stack opening on the readable one.

**Two things the swap moved**, both fixed: Roboto sets a shade wider than Work
Sans, so « Qui ? » and « La phrase » began wrapping in the lesson's axis rows;
and the « 🎲 Roll the dice » button was `w-full` — against Dan's 5 Sep rule,
and now content-sized and centred.

## 7 Sep, later — every station runs inside the cahier, in a frame (pre-tests lane)

Dan: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER PAGES IN
IFRAMES (EMBEDDED)"*.

"Like the map" is a pattern that was already in the repo: `/map/embed` has been
the map and nothing else since 6 Sep — no notebook, no site bar, no band — a
page whose whole job is to be dropped into a box. Every station on the rail now
has one, and the route a learner opens is the notebook that HOSTS it.

    /sio/SIO-011              the cahier: site bar, band, coils, bottom bar
      └─ /sio/SIO-011/embed   the goals, in their own document

**WHY A FRAME AND NOT A COMPONENT.** A component shares one document with the
chrome, and that is what has cost this app a fortnight of scrolling bugs: the
window scrolls when the content does, `scrollIntoView` drags the header off the
top, `.cahier-page` is `overflow: hidden` so a sticky band inside it never sees
the scroll. A frame ends all of it by construction — a station cannot scroll the
page it sits on, because it is not on it.

**The embed twin renders the SAME component**, shell and all. The chrome is
hidden by CSS in a framed document, so there is no second copy of any screen to
drift from the first — the fault that made /sio a redirect in patch 25.

### Five things this needed, four of them found by driving it

1. **`html[data-embed]`, set by an inline script in the layout's `<head>`.**
   React cannot answer "am I in a frame?" during render on a static export —
   one HTML file is served to both — so a component that branched on it would
   mismatch on hydration or flash a whole second notebook. A pre-paint script
   plus CSS has neither problem.
2. **`<base target="_top">`** in the same script. Every `<Link>` inside a
   station is a real navigation, and without this each one loads the whole app
   INSIDE the box.
3. **`router.push` is not a link.** DrillShell's finish row pushes, so « Next › »
   at the end of a lesson would load MémoiRecall inside the 720px frame under a
   band still saying MneMemo. The framed rail now watches its own path and
   hands the app back when it lands in a DIFFERENT station — station, not path,
   because the goals scroller rewrites the URL on every scroll and re-hosting
   fifty times would be a reload per goal.
4. **A framed document boots the whole layout**, so PageViewTracker logged two
   views per station and ProgressSync ran twice. `.fluo-embed`'s own note says
   why CSS cannot fix that — *"scripts still run"*. `TopLevelOnly` unmounts
   them; RailSwipe and AccentBar deliberately stay.
5. **The band is furniture on a PAGE and the drill in a DRILL.** Hiding
   `.page-band` everywhere took the ✕ off every framed drill. The rule is now
   `\`.cahier-page > .page-band\`` and a drill's host passes `band={false}`.

**And two checks broke on this and were right to.** `verify82` reads the desk's
numbers with a FIRST-match regex, so an `html[data-embed]` override written
above the canonical rule became the thing it measured — every `data-embed` rule
now lives at the END of globals.css, and the block says why. `verify94` looked
for `className="sticky top-0 z-N"` anchored at the start of the attribute, and
the bar had gained `cahier-sitebar` so one rule could reach it.

### Still open on this

- **Keyboard focus.** Number keys reach a drill only once the learner has
  touched inside the frame. A tap does it; a fresh page does not. `focus()` on
  load is the fix and is not in yet.
- **Only the seven rail stations are framed.** The games themselves
  (VocabulaRain, NumBus, LexicaLater), ConjugaZone, ChaTutor, VoixLà, DéjàRevu
  and the profile pages still draw their own notebook. Same recipe each time.
- **Unit 0 and the picture pre-tests** are still at `/pretests/...`, unframed
  and one-question-at-a-time.

## 7 Sep — the swipes go the right way, and the pre-tests move into SpecuLearn (pre-tests lane)

Sole editor of STATUS.md in this commit: claude/pre-tests-amendments-hndx8r.

Dan, shown thirteen page types driven one direction at a time: *"right now it
is not at all what i asked for"*. Then, over the afternoon, the chain itself —

    Map > SIO > SpecuLearn > MneMemo > MémoiRecall >
    Skills (ConjugaZone · ÉcouTexte · WorDrill · VoixLà · ComposeIt · ChaTutor) >
    Games (NumBus + NumBourse inside · VocabulaRain · LexicaLater) >
    User (Leaderboard · Profile)

— and the next morning: *"it's a mental map, not a map to be published. we just
need the swipes to go the right way, but it also means some pages need to be
reworked into singular pages that can be scrolled downwards."*

### What was actually wrong: a shape, not a bug

Only **two** surfaces in the app had ever been given a horizontal gesture — the
goals scroller and the lesson's tab strip — each carrying its own copy of the
same 60px / 1.5x arithmetic and its own private idea of where "forward" went.
The other eleven page types had none, so a sideways drag on the map, on a game,
on the leaderboard did nothing at all. No amount of fixing either handler could
have produced a chain.

So the chain is a list (`src/lib/swipeRail.ts`) and there is now exactly one
thing in the app that reads a finger (`components/useRailSwipe.ts`), mounted by
CahierShell and DrillShell. Every route drawn in either shell is on the rail,
the ones written after today included.

**COLUMNS AND ROWS**, which is how Dan asked for it to be conceived and is the
sentence to keep: *a column is a station and you move between columns SIDEWAYS;
a row is one item inside a station and you move between rows by scrolling
DOWN.* That is why the lesson's tab strip LOST its swipe — its four panels are
rows of the MneMemo column, so a sideways drag there must leave for SpecuLearn
or MémoiRecall, not shuffle panels. Nothing became unreachable: the strip is
sticky and every panel is one tap away.

### Three faults only driving it could find

- Five stations matched their path with `===` and so fell off the rail at
  `/conjugaison.html` — a real URL on a static export. Paths are normalised.
- The map's forward swipe was a no-op, because "the goal for no deck" resolved
  to the map itself. It opens the first goal now.
- **A rightward swipe on ChaTutor LEFT THE APP.** A horizontal drag that runs
  out of page is an overscroll, and a browser answers a horizontal overscroll
  by going back in history — ON TOP of `touch-action`, not governed by it.
  `html, body { overscroll-behavior-x: none }`, one line, and Dan's *"vertical
  left is not to the browser"* is true.

Also: a station with nothing for this goal is stepped over rather than landed
on (41 of the 50 decks have no SpecuLearn). Both ends STOP — Dan has not ruled
on wrapping, and a rail that stops can be taught to wrap later without anyone
having learnt a wrong habit.

### The pre-tests moved, and one question is one screen

Dan, the same day: *"the Pre-Tests are still sitting under the SIO. They should
be moved into the SpecuLearn as separate page - AND ONE QUESTION PER PAGE!"*,
*"so that we scroll down when one is done"*, *"scroll down = swipe up"*.

- **New address: `/practice/speculearn/pretest/<id>`.** The merger has been
  settled since 2026-08-10 — the registry has said « Pre-Test folds into
  SpecuLearn » for a month, the band has read « SpecuLearn » since 1 Sep, the
  ledger and the labels filed it there all along. Only the URL had not moved.
  `/pretests/<id>` still answers and forwards (`components/Forward.tsx`), which
  is what keeps printed QR sheets and a term of bookmarks alive.
- **The address is written once**, in `lib/pretests/routes.ts`. Making the move
  meant finding four hand-written copies of `/pretests/${id}` — the stop popup,
  the unit list, a deck's shell, the teacher dashboard. Four copies of one fact
  is how they start disagreeing; it is the lesson `stopForDeck` was extracted
  for, and verify82 caught a fifth copy the same afternoon.
- **`components/SnapFeed.tsx` is the row mechanism**, extracted from the goals
  scroller rather than written a second time: measured height, document lock,
  `snap-y snap-mandatory` with `snap-always` sections, and an imperative
  `scrollToRow` for the keyboard.
- **The « Next → » button is gone.** The way on is the gesture; a button beside
  it is a second answer to the same question and the one nobody finds by feel.

**Two things that only showed up under a driven run, both now fixed and both
worth remembering:**

1. `useChoiceKeys({ enabled })` gates the WHOLE handler, Enter included. Gating
   it on "not yet answered" tore the listener down the instant a question was
   answered, so ↵ never advanced — a ten-question keyboard run ended back at
   1 / 10. `pick` refuses a second answer on its own; `enabled` must not.
2. A `flex-wrap` button row IS a stack of full-width buttons at the one width
   that matters. Two `fluo-btn-lg` controls do not fit side by side on a phone,
   so the recap wrapped them and broke Dan's 5 Sep rule by accident. A grid
   cannot wrap.

`verify110` holds all of it: the chain in Dan's order, the direction rule, the
single handler, the snap classes, the absent Next button, the forwarding stub,
and the one line of CSS that keeps the browser out of the horizontal.

### Later the same day: the lesson swipes vertically, and the hubs appear

Dan, shown that a vertical swipe inside the lesson did nothing but scroll the
open panel: *"it should swipe vertically - that is the right behaviour"*. Then
three more rulings in one message.

**1 · MneMemo doom-scrolls.** The four panels were `tab === "formes" &&
<Formes/>` — three unmounted at any moment, so there was nothing to scroll TO.
All four are in the document now, each `snap-start`, and **DrillShell's own
body scroller is the magnet** (`snapRows`). NOT a SnapFeed inside it: that body
is already an `overflow-y-auto`, and a second scroller inside it is two
scrollers fighting over one finger.

Four things this took, each measured rather than reasoned:

- **The strip is an index, not a switch.** It reads the scroll position — "the
  last row whose top has passed the line under the tabs" — after an
  IntersectionObserver got it wrong twice. "Which panel is visible" has no
  single answer (at the bottom, Formes and Exercice are both in the band) and a
  panel taller than the screen is never *mostly* visible, so no threshold works.
- **Every row is at least a measured screenful.** Letting short panels size to
  their content kills the blank paper and breaks the rule that pays for it: Goal
  and Idée then sit ~350px apart and one flick jumps clean past Idée. That is
  continuous scrolling with a tidy ending — what Dan ruled out on the goals.
  `justify-center` is what keeps the slack from reading as a fault.
- **`scrollIntoView` scrolls the WINDOW too.** Tapping a tab took the site bar
  and the ✕ band off the top. Same trap the goals scroller hit on 5 Sep, same
  answer: compute the delta, move the one box that should move.
- **The document is locked while the feed is up**, and only then — the other 27
  DrillShell surfaces are untouched. The page sits in a document 90px taller
  than the viewport, so without it two swipes take the frozen header away.

**1b · The chain ENDS AT GAMES.** Dan, an hour later: *"LEADERBOARD AND
PROFILE SHOULD NOT BE INSIDE THIS CHAIN TAKE THEM OUT"*. Every station on the
rail is work on a goal — guess it, read it, drill it, play it — and where you
stand against the class is not work. Both pages stay reachable through the
👤 User family in the bottom bar and the ☰; off the rail they simply get no
horizontal swipe, like Home, the guide and Réglages. Seven stations.

**2 · Skills and Games are HUBS.** Dan: *"when there are multiple destinations
on the right, we need the hub page, but when we return from one of those back
to the left, it returns to the hub page. Hub pages are Skills and Games."* So
the six skills and the three games stop being nine columns of the rail and
become two. Standing on ChaTutor, rightwards is « Skills », not « ComposeIt ».
The chain is seven stations:

    Map > Goal > SpecuLearn > MneMemo > MémoiRecall > Skills > Games

**3 · The goal card's activities are icons only**, three up (*"not in this form
but the grid of icons only like we saw in the earlier 'HELP'"*). Seven labelled
pills were seven rows of text under a card that had already said what the goal
is — the litmus test's own case. The names live in `title` and an `sr-only`
span, so a screen reader still announces them.

**And SIO-011 is Dan's own wording**: « I can identify stressed pronouns. » /
« Match subject with stressed pronouns in the relevant sentence structures. »

Renumbered **verify110 -> verify111** — `claude/fluolingo-color-review-9thj8x`
claimed 110 after this branch did. Eighth collision in the repo, second between
these same two branches, and the first one the push-time check caught by itself.
`verify73` was found VACUOUS in the same sweep: its regex insisted `className`
be the wrapper's first attribute, and a `ref` had moved it.

### Still open, and Dan's to settle

- **Wrap or stop** at the two ends of the rail (past Games, and swiping right
  off the map). Stopping is what shipped.
- **Unit 0 and the picture pre-tests** are still at `/pretests/unit0/<sio>` and
  `/pretests/picture/<deck>`, and still one-at-a-time rather than a feed. They
  are separate runners (547 and 472 lines) and moving them is the next slice of
  the same job, not part of this one.
- **SpecuLearn is still merged in name only**: four runners, ~2,264 lines. The
  URL move makes them siblings at last, which is the precondition for merging
  the engines, not the merge itself.

## 7 Sep — ⚠️ COLOR REVIEW, READ FIRST: your remote branch was swept; one push restores it

The approved branch sweep (96 deleted, 124 → 39) had one wrong box:
`claude/fluolingo-color-review-9thj8x` was listed because its PR (#196) had
merged — but you had pushed NEW palette-hues work to the same branch after
the merge, which the vetting (last-PR-state only) could not see. **No
commits are lost.** Your local copy is complete; run

    git push -u origin claude/fluolingo-color-review-9thj8x

and the remote ref is back exactly as you left it. Do this BEFORE any
`fetch --prune`. Apologies from fluoduo-main — and the sweep rule gains the
missing clause: a merged-PR branch whose remote SHA has MOVED since the
merge is in flight, never deletable. (Also for you: verify numbers — 110 is
yours and stays yours; 111-116 are taken; 117+ free.)

The rest of the sweep was clean: survivors are main, the working branches,
Dan's three local-state snapshots, feat/landing-page, the flagged
closed-unmerged menu-children-dress, and the 33 never-PR'd branches.
The sweep itself is now reusable tooling: `.github/workflows/branch-sweep.yml`
(workflow_dispatch, list as input, trunk/snapshots hard-protected).
The deploy token note, same night: `fluoduo-deploy-mirror` (dckg) gained
"Workflows: Read and write" and **expires Fri 2 Oct 2026** — regenerate and
re-paste into LIVE_DEPLOY_TOKEN before that date or deploy-live starts
failing mid-semester.

## 7 Sep, early morning — Dan's decision round lands: the gem utilities ship

Sole editor of STATUS.md in this commit: fluoduo-main.

**The decisions, as Dan gave them** ("decision ok" + item-by-item):

1. **+20 gems per level-up** — approved ("yes"); pays in finalize, once per
   rung crossed, from the same diff that fires the level toast.
2. **The Bouclier** — approved. 💎25, hold max 2, bought IN ADVANCE in the
   boutique; one missed day spends it silently and the chain holds; two or
   more missed days reset WITHOUT spending it. The one mention around a miss
   is the morning-after toast, framed as a win ("Day N — the chain held").
   Never sold at the moment of loss — that is the whole ethical difference
   from a streak-repair product, and verify116 executes all four arms of the
   decision (`nextStreak`, pure on purpose).
3. **Expert-game unlocks** — approved, GAMES ONLY. `EXPERT_UNLOCKS` in
   economy.ts (first entry: the countries-expert Letris set, 💎30, which had
   sat registry-hidden since the content-gap audit "until an Expert-mode
   toggle is wired" — this is that wiring). The gallery shows a dashed buy
   tile until bought. verify116 walks src/app and fails if any page off
   /games ever consults an unlock: "nothing is locked" holds for the spine.
4. **Term prizes** — the MECHANISM is approved (teacher-run, end of term,
   from the dashboard's server-side records, outside the gem economy);
   the prize items themselves are NOT confirmed ("prizes don't confirm
   first"). Draft ladder under discussion: atelier-for-two · movie tickets
   · a real cahier + pen. Nothing in-app; nothing wired to gems, ever —
   gems are client-forgeable and must stay toy money.
5. **Three fonts** — merged (#213). 6. **Branch sweep** — the verified
   89-branch delete command is with Dan (proxy blocks deletes here); the
   33 never-PR'd branches stay, flagged. 7. **Push live** — Dan's hand.

**VERIFY-NUMBER LEDGER, corrected** (this entry supersedes every earlier
count): 108/109 Peers (#202) · 110 Color review's palette-hues (in flight)
· 111-113 retention (#206) · 114 level-curve (#212) · 115 finale-colours
(#214) · 116 gem-utilities (this branch). **117+ free.** Collisions nine
and ten were both caught AT THE GATE tonight (palette-hues vs finale; then
114 already being level-curve's — that one was this session mis-recording
its own claim as free). The gate works; the ledger still has to be written
carefully.

## 7 Sep — the map's buttons, five rounds of it; and TWO STANDING RULES CHANGE (Peers)

Sole editor of STATUS.md in this commit: Peers.

**TWO OF DAN'S OWN EARLIER RULINGS ARE RETIRED HERE.** Both were his call,
made today, and the next session needs to know they no longer hold:

1. **The 3D view MAY zoom.** On 20 Aug he ruled "zooming in or out should not
   be allowed" there. Asked where pinch-to-zoom should work, he chose **both
   views**. Pinch drives the same `zoomPct` the field and steppers drive — the
   zoom wrapper in `MapBody` contains both the 3D scene and the 2D grid, so
   there is ONE number and no second scale fighting the camera.
2. **Depth AND colour mean COMPLETION, not position.** "All buttons are up by
   default, and as they are completed they get pressed down", then: "when
   unvisited it is up and DARKER (not lighter) and completed it FADES and
   lighter depressed." So an untouched stop is FRESH — full pen, standing up;
   a finished one is WORN — faded to the wash, pressed flat.

   The classes were renamed with the swap: `.fluo-stop--reached`/`--ahead`
   described a POSITION, and the moment the meaning inverted a class called
   "reached" was painting not-yet-reached stops. They are `--up`/`--down`.

   I shipped the depth swap alone first and kept colour on position, on the
   reasoning that they answer different questions. Dan corrected it the same
   hour, and he was right: with colour on position a FINISHED stop was as loud
   as an untouched one, and the depth had nothing to agree with. One question
   drives both halves now, which is what makes a stop read as an object rather
   than as two overlapping signals.

**THE LESSON OF THE DAY, for whoever touches the 3D map next.** Dan sent the
stop buttons back five times: they looked unchanged, then like coins on edge,
then short of shadow, then rounded-bottomed, then upside-down in meaning. The
first four were the same mistake — the 3D stop was a puck hand-built from its
own spans, and I kept adjusting its colours to RESEMBLE the 2D `.fluo-stop`.
It IS a `.fluo-stop` now: same classes, same tokens, same 44px, scaled by the
camera and squashed into the ground plane, with a plinth (bottom rim + straight
wall) for thickness. There is one description of that button. Do not
re-implement it by hand — that is what four rounds of "closer, but no" were.

Also fixed today, and worth knowing because they were both invisible:

- **The zoom field could not take a typed value.** Bound straight to the
  clamped number, so every KEYSTROKE was clamped and written back under the
  caret: typing 135 went 1 → 30 → "303" → 200. **There are TWO of these
  controls** (`HomeMap` and `MapBody`) and the first fix landed on the one Dan
  was not looking at; `verify108` now asserts both by path.
- **The 3D road had a visible end.** The corridor is sampled from `rel = 0`,
  which is the camera's own position — so the pale floor stopped mid-scene
  with a straight edge. Both near corners run past the frame now.
- **Hover was unguarded.** There was no `@media (hover: hover)` anywhere in
  the app; on a phone `:hover` sticks after a tap, so the last stop opened
  stayed raised, which on this map reads as "you are here". Both maps' lifts
  are guarded now. **`.neo-key:hover` — every key in the app — is still
  unguarded**; Dan was told and it is his call.

## 6 Sep, latest — Dan picked a gamification option; the map is tactile; every reward banner is coloured (Peers)

Sole editor of STATUS.md in this commit: Peers.

**Dan picked one of the five.** The entry below says "he has picked none yet";
he has now. From the video read he chose **"Craving — add surprise"**, and it
is built. THE LUCKY FIND: a graded answer can now find gems.

- **Gems, NOT XP**, and that is the whole design. XP drives the level, the
  rank and the leaderboard, and the honest-receipt rule says a receipt states
  the EXACT amount an answer pays. Random XP breaks both. Gems buy cosmetics
  and gate nothing.
- Four guards, all executed in `verify109` against 5000 seeds — **seeded, not
  rolled** (a hash of item+day, and it rides the same `award` gate as the XP,
  so a re-attempt cannot fish for a drop), a **pity floor** at 12 dry answers,
  a **daily cap** of 40 gems, and **never negative** (hearts were removed for
  punishing errors; a find that could take something away brings them back).
- `findDry` deliberately does NOT reset at midnight — the floor is a run of
  bad luck, not a date, or every day would start owing a find.
- `normalize()` guards `findGems`/`findDry` with `Number.isFinite` because
  the cap is arithmetic on them: `findGems: "40"` makes the cap NaN and the
  balance NaN forever, and a spread default cannot catch it.

**TWO COLOUR RULINGS from the same afternoon, both Dan's, both worth keeping:**

1. **The find wears `flow` (teal), and the rule is one colour, one meaning.**
   It shipped for a day in `joy` — which is this app's XP colour, the +20
   float and the receipt's XP line — so the banner said "XP" while the code
   paid gems. Dan: not amber (XP), not magenta (the streak fire), not either
   red (a find often lands right after a WRONG answer, so the reward would
   flash in the failure colour). `verify109` reads the roles FROM SOURCE
   rather than pinning the string "flow", so it survives a re-cut palette.

2. **Every reward banner now carries its role's fill.** Dan: *"The 'You found'
   tile should be in color ?!"* and *"it looks too fade"*. The banner was
   hardcoded `bg-white`, so a badge, a level-up, a streak, a finished unit and
   a find were five white cards differing by a hairline. **The trap for the
   next session:** on a full fill the text colour is NOT a constant. Page ink
   works for flow/reward/win/joy and FAILS for streak/focus/miss
   (3.19–3.28:1); white does the exact opposite. A mock-up of the find, the
   badge and the level-up all say "use ink" because those three are the light
   half of the palette — and ink would then ship the STREAK banner, seen
   daily, unreadable. Each role already declares its answer as
   `--dopa-X-on`; the banner asks the token instead of choosing.

**The map is tactile** (the Malewicz brief). Stops are objects with a two-sided
spring, the road has a body (a three-stroke cord travelled, a groove ahead),
stops wear the fluorescent pens in two shades — pen when reached, wash when
still ahead — the numeral never disappears (Dan: *"i do still want the number
to remain"*), and there is no ✓ at all (*"Drop it — the fill says it"*).
`/map/embed` is a standalone iframe-able map on the same component. `verify108`
holds it.

**Open, and NOT built:** the Finale card (`FinaleContent.tsx`) is entirely raw
Tailwind — `amber-300/50/800` on the hint button, `slate-300/700` on check,
plus `slate-900`, `emerald-500`, `rose-400`, `yellow-100`. The hint button's
amber is **0.3° of hue from the XP amber**, i.e. the same fault Dan just
caught on the find banner. Dan has authorized the conversion; it is being done
on its own branch, not in the batch above.

## 6 Sep, late — #199 ships: rings that wrap the page edge; work paused for Dan's gamification video

Sole editor of STATUS.md in this commit: fluoduo-main.

**#199 merged** (`ce3ef48`, squash of Dan's four fixes + the ring rebuild).
The learner-visible half: bottom bar off by default (opt-in at Réglages),
wordmark packed left, /moi's second vertical line AND its closed-band stubs
gone ("C — the band stubs"), the `.fluo-h-*` accents derived from the family
pens under `docs/COLOR_SYSTEM.md`.

**The ring binds are real now**, and the road there matters to the next
session that touches them:

- Dan rejected the slat stripes, then rejected a closed-ellipse drawing, then
  sent two photos of real coil notebooks and the instruction *"take away the
  phone edge and you will see it must go pass the edge"*. The wire must
  OVERHANG the page onto the desk — not float on the sheet, not stop at the
  edge.
- Geometry is MEASURED off his first photo (17 loops, pitch 56px, thin bright
  wire, a cover strip ~45% of the pitch wide): one flat open chrome arc per
  26px, from a small dark punched hole, across a 12px family-ink cover strip
  that continues the 6px spine border, past the page edge, turning ~10px out
  on the desk.
- The enabling change is structural and easy to break by "tidying": both page
  shells now use **`overflow: clip` + `overflow-clip-margin: 26px`** instead
  of `overflow: hidden` (same containment, no scroll mechanism, plus the
  apron the overhang paints into), and **the binding anchors below the top
  bar and heading band** in all three shells (CahierShell, CahierFrame,
  DrillShell) — a coil sits below the cover chrome, and nothing can paint
  over the desk, so a top-anchored binding would strand half-loops beside the
  bar. verify20's drill-clip pin moved to the globals rule with the claim
  unchanged.
- `claude/dan-four-fixes` is merged but its remote branch could not be
  deleted (push proxy 403 on deletes) — add it to the to-delete ledger.

**Paused by Dan mid-iteration and resumed on his word**: he sent a
gamification-psychology video (craving machine / infinite game / invisible
scoreboard) and asked for a read. Assessment delivered in-session: we run the
scoreboard machine best (weekly reset + "Around you"), half-run the infinite
game (streak multiplier caps at day 7; loss-framing is banned by
verify32), and run no variable reward at all. Five options put to him,
cheapest first: extend the streak ladder past day 7; a "course ends, French
doesn't" surface after Diplômé; occasional bonus gems on perfect runs;
"you vs last week"; a Finch-style companion (big, own conversation).
[SUPERSEDED the same evening: Dan routed THREE to Color review — the streak
ladder, the after-Diplômé surface, and "you vs last week"; see the BRIEF FOR
COLOR REVIEW in THE ROSTER. Bonus gems went to Peers on Dan's direct pick
(the lucky find, #202); only the companion stays unapproved.]

Still open from the same afternoon: the landing recapture (bands + family
captions, authorized), the three-fonts branch awaiting his go, the dark-cahier
agent, and "when one part opens, another must collapse" beyond /moi.

## 6 Sep — the verify-number collision is now the build's job, not a ritual

Sole editor of STATUS.md in this commit: claude/peers-vd2h6h (Peers).

Dan, asked which process change to make first: *"3. yes"* — the number scan.

**Seven collisions** (31, 52 twice, 60, 43, then 96 and 97 on 6 Sep), and
every one by a session that HAD run the scan AGENTS.md asks for. The scan is
a snapshot; another session can claim the number in the hours between your
scan and your push, and care does not close that window. `verify-wiring` gains
a fourth assertion that runs it at push time instead.

Narrow on purpose: only numbers a branch **adds** are checked (a number on
`main` is settled, so `main` can never go red for someone else's branch); only
branches **ahead of `main` and touched in the last 45 days** count as in
flight (this repo has had branches rot for weeks, and a dead branch must not
hold a number hostage); the branch that merges first keeps the number. Costs
1.5 s.

**It found a live one immediately.** `claude/fluolingo-color-review-9thj8x`
and `claude/pre-tests-amendments-hndx8r` BOTH claimed **102** —
`verify102-menu-hues.py` and `verify102-fluidtype.py`.
[SUPERSEDED at the QC merge, same day: by the time this section landed, both
branches were already in — menu-hues kept 102 (#189) and pre-tests had
self-renumbered its fluidtype to **106** before #191 merged. The finding was
right when written; the eighth collision resolved itself while this PR was
in flight, which is itself the argument for assertion 4 existing.]

Six break-tests, four of which went GREEN against broken code on the first
run: the assertion read `git ls-tree HEAD` — the last commit — rather than the
working tree, so a file renamed onto a taken number passed until it was
committed, which is the exact moment someone needs telling. It now uses the
same file list as assertions 1–3. Also proved: `main` itself stays green, a
developer with no remotes fetched gets a visible skip, and CI with that same
broken checkout FAILS rather than quietly guarding nothing.

## 6 Sep — item 7: French off the controls (CLOSED)

Sole editor of STATUS.md in this commit: claude/peers-vd2h6h (Peers).

FINISH_BACKLOG **item 7** — *"no FR-only chrome a beginner must decode to
act"*. A scan of every non-content file for French turned up 227 candidates;
almost all were the material being taught. Six were controls.

**Changed, with no flavour lost:**

| where | was | now |
|---|---|---|
| Games hub, the button on every card | `▶ Jouer` | `▶ Play` |
| Games hub, the second button | `Choisir un autre` | `Choose another` |
| ComposeIt, the checker's own failure | `Pardon, un petit souci… réessayez !` | `Something went wrong — try again.` |
| `/moi/historique`, the map's name | `Carte` | `Map` |
| `/moi/historique`, Home's name | `Accueil` | `Home` |
| The map legend + every stop's aria-label | `vocabulaire` · `grammaire` | `vocabulary` · `grammar` |

Two coupled edits that a rename would have broken silently: `curriculum.ts`'s
`SURFACE_APP` set MATCHES ON THE LABEL `"Accueil"`, so changing only
`labels.ts` would have stopped history counting Home as an app surface; and
`verify19` has banned the word *Accueil* as a nav label since July, so this
change agrees with a rule already in the repo. Dan's July legend ruling
survives whole — it chose WHICH word, not which language, and both its picks
(*expressions* over *phrases*, *communication* over *atelier*) are the same
in English.

**Left standing — RULED, not pending.** Four sets were put to Dan on 6 Sep
with the English each would take: the unit flaps (`Unité 0`–`Unité 4`), the
ten rank names (`Débutant` … `Maître`), the twelve badge labels, and the two
shop colours that are not already English (`Émeraude`, `Or`). **Dan: *"None."***
All four stay French, and item 7 is closed on that basis rather than left
half-done. The line his answer draws is in AGENTS.md: French that BLOCKS an
action is a fault, French that decorates one is the app's character. « Jouer »
was the only button on the card; a rank sits beside an English line saying how
it was earned.

`verify105-en-chrome.py` names its four surfaces one by one rather than
sweeping — a sweep for "French in src/" would flag every deck and card in the
course, and the first person to hit that wall would delete the check. Six
break-tests. One of them exposed a dead assertion: the ComposeIt test matched
`setNudge|setError|setStatus` and the real call sites are
`setFeedback({ reply })` and `setMessages({ text })`, so it passed against the
reverted code. It now looks for APOLOGY rather than French, since the waiter
speaks French on purpose and the nudges quote French a learner should type.
## 6 Sep afternoon — Dan's ten answers, the charter, and what is building

Sole editor of STATUS.md in this commit: fluoduo-main. Dan answered a
question round one-by-one; every ruling below is his.

1. **Landing page: build now**, at the ROOT for signed-out strangers,
   PLATFORM-shaped ("we want it to serve French levels and eventually other
   languages too"), hybrid voice (playful cahier + the NUS credibility
   line). → building on `feat/landing-page` (agent, verify105 claimed).
2. **ChaTutor history: keep on-device** (localStorage; list, reopen,
   delete; nothing server-side). → queued for fluoduo-main.
3. **Swipe gestures: Color's lane owns them** — their fix merged as #195.
4. **Icon colour is the learner's: pink / blue / green** from the pen
   palette; cream plate stays on the opaque icons (no colour fakes
   transparency on both dark and light wallpapers). CAVEAT recorded: the
   tab icon can switch live; the installed home-screen icon is stamped at
   install — choose before installing, reinstall to change. → queued.
5. **No-classes journey wording**: /moi's header prints GOAL n / 50 (same
   figure as Home's counter, one derivation: `nextGoalNumber`), and
   /about's "Bring to class ... into the classroom" paragraph is
   de-classroomed. Teacher pages rightly keep classroom language. → in
   this commit.
6. **Stale branches: mark, don't delete.** They cost ~nothing (a branch is
   a pointer; the site builds only from main) but they slow every lane's
   verify-number scans. TO BE DELETED ON DAN'S WORD: every
   `claude/*`/`cursor/*`/`feat/*`/`fix/*`/`ux/*`/`qc-*` branch whose PR is
   merged or whose content is squashed into main — enumerate with
   `git branch -r --no-merged origin/main` and cross-check each against
   its closed PR before the sweep.
7. **Grok duty-roster proposal: DROPPED** (tombstone in THE ROSTER below).
8. **Headings tighten to −2%** (`.cahier-display` −0.02em). → in this
   commit.
9. **Dark cahier: commissioned as an INERT DRAFT** — tokens only, behind a
   `[data-cahier-dark]` attribute nothing sets, screenshots for Dan's
   reaction. → building on `feat/dark-cahier-draft` (agent).
10. **The UI-police charter is law**: `docs/UI_POLICE.md`, 90 items — Dan's
    83 merged from thirteen video rounds plus 7 audit additions he blessed
    (keyboard hints, reduced motion, focus ring, lang="fr", rem type,
    EN-never-bigger-than-FR, declared color-scheme). Lanes read it before
    touching a surface. → in this commit.

Also in this commit: Color's #193 handover fixed — the lesson tab strip's
pills get real height (py-2) to clear the 44px tap floor their halos could
not. In flight elsewhere: Peers re-opening backlog item 7 (Carte/Accueil
EN chrome, absent from main — their closing note missed it).

## 6 Sep — OPEN FOR fluoduo-main: the lesson tab strip is under #192's tap floor

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x
(Colour review). Raised at Dan's instruction after #189 merged; the detail and
the numbers are in **issue #193**.

#192 set the fat-finger floor — a control may draw small, but must CATCH ~44px.
The four lesson tabs do not, measured on the merged export at
`/lessons/deck/salutations`:

    320px   36.8px tall   4 of 4 under the floor   4px apart
    390px   41.3px tall   4 of 4 under the floor   4px apart

AND IT CANNOT TAKE #192's OWN FIX. That patch's note says so: *"Do not put it
on two controls closer than ~10px, or their halos cross."* The strip is
`grid-cols-4 gap-1` — four pixels. So the remedy has to be real height, not the
invisible halo.

TWO THINGS BEFORE ANYONE CALLS IT A REGRESSION.

  · It is not one. The strip measured 37px and 41px BEFORE the 5 Sep stacking
    change too — same heights, one row instead of two. What is new is a rule it
    breaks, not the strip.
  · Nothing catches it. The floor is a hand-applied class, so a control that
    never got the class is invisible to CI. A check that MEASURES rendered hit
    areas would; the jam scan already drives every lesson page in a browser and
    could carry it.

NOT FIXED HERE, deliberately. ~5px of vertical padding brings the tabs to 44
without touching the emoji, the labels or the four columns — but it is a
visible change to a strip Dan has been iterating on all week, and the choice
(raise it, or accept a documented exception to the floor) is with him.

Clean at the same measurement, for the record: the goal-page item links catch
60px with 6px between them, 0 of 313 under the floor; and `/sio/[id]` and the
lesson pages render correctly on a dark-mode phone under #190 — the cahier
stays light, the ink stays dark, no dark-on-dark.
## 6 Sep — SpecuLearn: one answer per card, and type goes relative (PR #191)

Sole editor of STATUS.md in this commit: the pre-tests lane
(`claude/pre-tests-amendments-hndx8r`). Handed to fluoduo-main; not merged here.

A day of Dan's rulings, built and measured:

- **Type is relative app-wide.** 316 sizes were hard pixels — 310 Tailwind
  `text-[NNpx]` utilities, five CSS rules, one inline style. Redefined once in
  globals.css rather than edited across ~50 files. Phone unchanged, desktop
  +36%, capped past 1440. `verify106-fluidtype` holds it. (Numbered 106, not
  102: the colour-review lane claimed 102 forty minutes later — the sixth
  number collision, cleared from this side.)
- **A SpecuLearn card has exactly one answer.** commerces mixed shop nouns,
  whole utterances and untagged words in one option pool, so 📚 could be
  answered by « Ça fait 5,89 euros. » and 💶 by three different words. A deck
  now names the columns it plays; distractors never repeat a visual.
  `verify103-speculearn-cards` holds it for every deck.
- **Tap to answer, no Check** (`verify20` flipped to pin it; EtuDice keeps
  its Check, so the shell's grammar is deliberately no longer uniform).
- **‹ back to the previous question**, redrawn as it was answered; reviewing
  never re-grades.
- **Class bag dissolved**, all three mounts. `verify93` kept the half that was
  never about the bag — no sign-in wall in front of a guess. The Unit-0 page
  gained a finish panel, since Class bag was all it drew once a run was over.
- **The languages wear their endonyms** — 中文, हिन्दी, Bahasa Indonesia — as
  type, sized to their own tile. The languages deck leaves the image brief.
- Descriptions out of buttons; level chooser two-up; counter first under the
  strip; "Revisit my errors"; the image brief 160 → 146 with a do-not-generate
  list; « le prix » / « la monnaie » / « des euros » get their articles.

**Two loose ends, deliberate.** Pre-test misses now have no reader — the record
is intact and `verify40` pins its shape, but showing them in DéjàRevu means
deciding what DéjàRevu is, and pre-tests are barred from `queueForReview`.
And SpecuLearn is merged in NAME only: four runners, 2,264 lines, 109 routes,
with the game paying XP/SRS through the help ladder while the /pretests half is
forbidden from it. Both are Dan's calls, raised with him.
## 6 Sep — OPEN FOR fluoduo-main: the lesson tab strip is under #192's tap floor

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x
(Colour review). Raised at Dan's instruction after #189 merged; the detail and
the numbers are in **issue #193**.

#192 set the fat-finger floor — a control may draw small, but must CATCH ~44px.
The four lesson tabs do not, measured on the merged export at
`/lessons/deck/salutations`:

    320px   36.8px tall   4 of 4 under the floor   4px apart
    390px   41.3px tall   4 of 4 under the floor   4px apart

AND IT CANNOT TAKE #192's OWN FIX. That patch's note says so: *"Do not put it
on two controls closer than ~10px, or their halos cross."* The strip is
`grid-cols-4 gap-1` — four pixels. So the remedy has to be real height, not the
invisible halo.

TWO THINGS BEFORE ANYONE CALLS IT A REGRESSION.

  · It is not one. The strip measured 37px and 41px BEFORE the 5 Sep stacking
    change too — same heights, one row instead of two. What is new is a rule it
    breaks, not the strip.
  · Nothing catches it. The floor is a hand-applied class, so a control that
    never got the class is invisible to CI. A check that MEASURES rendered hit
    areas would; the jam scan already drives every lesson page in a browser and
    could carry it.

NOT FIXED HERE, deliberately. ~5px of vertical padding brings the tabs to 44
without touching the emoji, the labels or the four columns — but it is a
visible change to a strip Dan has been iterating on all week, and the choice
(raise it, or accept a documented exception to the floor) is with him.

Clean at the same measurement, for the record: the goal-page item links catch
60px with 6px between them, 0 of 313 under the floor; and `/sio/[id]` and the
lesson pages render correctly on a dark-mode phone under #190 — the cahier
stays light, the ink stays dark, no dark-on-dark.

## 6 Sep — Peers' language pass lands; the rest of #187 was already home

Sole editor of STATUS.md in this commit: fluoduo-main.

Peers' 89-commit branch surfaced as PR #187 carrying three pieces. Two were
already on main via #170 (the ☰ dead-rows z-30 fix + verify94, and the
first mark + verify95 — since superseded by #184/#185's pink). The third —
**the language pass on chrome a learner is HANDED** (Dan: "UI 101 says we
don't want to overwhelm users with too much texts to read") — was new, and
was lifted onto current main by the integrator: eleven first-run popups
305→235 words, tour callouts shortened, AuthGate/StopBookmark/ÉcouTexte/
LexicaLater wordings trimmed. Its check arrived as
**verify104-chrome-concision** (96 was taken by family-hues meanwhile;
101–103 are claimed by in-flight lanes — and NOTE, collision #9 brewing:
Color's branch holds verify102-menu-hues while pre-tests' holds
verify102-fluidtype; whichever lands second must renumber). One conflict
resolved in the tour: "Your tabs" (post-#175 truth) beats "Five tabs"
(true when Peers wrote it). #187 closes in favour of this lift.

## 5–6 Sep — the favicon settles: PINK, transparent, teal binds, thin iPhone rim (#184, #185)

Sole editor of STATUS.md in this commit: fluoduo-main.

Four rulings from Dan, in order, all shipped:

1. **No ground plate on the tab icon** ("does not need the white background
   against the dark background"). `src/app/icon.svg` is transparent;
   `favicon.ico` and the manifest's `icon-192/512` regenerated with real
   alpha.
2. **The mark is the PINK one** ("i think i prefer the pink favicon
   please") — the first cut (24c1c41), which had gone Violet one commit
   later, restored.
3. **The binds follow the complement rule** — Dan remembered it and it is
   66dda59: binds wear the middle-right stack's colour walked down; for
   pink that stack is TEAL, so binds are `#009d7a` (the pink restore had
   briefly resurrected the pre-rule pink binds).
4. **The iPhone tile's plate is a ~4% rim** ("is our plate too thick for
   that border") — the mark fills apple-touch-icon, paper peeking as the
   thin border iOS icons wear.

TWO ICONS STAY OPAQUE ON PURPOSE, do not "fix" them: apple-touch (iOS
fills transparency with BLACK on the home screen) and maskable-512
(Android's circular crop needs full bleed — verify95's safe-area rule).
The derived PNGs/ICO are rendered from icon.svg via headless Chromium
(omitBackground) + Pillow; there is no generator script in the repo yet.

## 5 Sep evening — SpecuLearn commerces chrome is English (new PR from main)

Sole editor of STATUS.md in this commit: ux/en-chrome-speculearn.

#182 is already in main. The English labels could not land on that closed
pull request, so they sit on a clean branch from `5d06894`:
`ux/en-chrome-speculearn`. No pictures touched.

- Deck title is **Shops & market**. French subtitle and FR answers stay.
- Instructions: **Pick the right picture.** / **Pick the right word.**
- Keyboard hint is **1–4 pick · next · R**, not *choisir* / *suivant*.
- The title band is not marked `lang="fr"` on commerces.

Open it: Practice → SpecuLearn → Shops & market, or
`/practice/speculearn/commerces`.

## 5 Sep evening — SpecuLearn commerces photos are real PNGs

Sole editor of STATUS.md in this commit: cursor/speculearn-commerces.

The 14 FR-approved market pictures for commerces-15 … commerces-28 now live
as real PNG files in `public/speculearn/` (each file starts with the PNG
header, not base64 text). `SPECULEARN_ITEM_IMAGES` points each id at
`/speculearn/commerces-XX.png`.

Open them: Practice → SpecuLearn → the commerces stop, or go straight to
`/practice/speculearn/commerces`. Example: « Je voudrais deux kilos de
pommes. » shows the apple-scale photo, not the 🍎 emoji.

The leftover encoding-test picture and the `docs/_asset_b64/` upload folder
are gone. PR #182.

## 5 Sep evening — five Dan rulings in one round (claude/reglages-switch)

Sole editor of STATUS.md in this commit: fluoduo-main.

1. **Settings are switches whose description states the CURRENT position**
   (Dan: "settings description should change based on choice… show it as a
   switch: by default in the off position"). "Icon labels" is now a switch;
   off says "Tap and hold an icon to view its label.", on says "Icon labels
   are always shown." The switch is a styled native checkbox
   (`input.fluo-switch`, globals.css) with `role="switch"`.
2. **No single control spans the whole page width — PERMANENT RULE, now in
   AGENTS.md** ("No control spans the whole width"). Dan grants the rare
   exception per case. First application: the Réglages tab pick-list went
   from six full-width rows to a two-column grid.
3. **ChaTutor's greeting greets** (Dan: "The ChaTutor's opening line is WAY
   TOO LONG !"). The 50-word capability tour is gone; the opening line is
   « Bonjour ! 👋 "Je peux t'aider ?" ».
4. **No VoixLà in ÉcouTexte** (Dan: "Voix-Là is for TTS. and it does NOT
   make any sense to have it im EcouTexte"). ToolSummon takes `tools`;
   ÉcouTexte passes `["chatutor"]`, and a single-tool 🧰 opens its card
   directly with no one-row tray. verify100 pins it. RULED later the same
   evening (Dan: "doesn'T ecouTexte have a standard answer, why does it
   still beed ChatTutor"): the 🧰 is OUT of ÉcouTexte entirely — a
   dictation has one right sentence and the marking shows it; the tools
   live in WorDrill and ComposeIt, where the learner produces French.
   verify100 now asserts ÉcouTexte carries no ToolSummon.
5. **Button labels wear the brand hand in heavy bold** (Dan: "use FluoLingo
   font in heavy bold to disallow the text from overflowing off the
   buttons"). `FluOlinGoHand-ExtraBold` (36 KB) joins the loaded weights as
   800; `.fluo-btn-hand` (globals.css) is the class; first application is
   the Réglages tab tiles, whose "Practice"/"Games" had run to the tile
   edge in the body face. ROLLED OUT the same evening (Dan: "ensure that
   elsewhere we also have buttons half way the width of the screen to
   display in FluOLinGo") to the FamilyHub door tiles and the GameGallery
   tiles. Weight settled at 800, not Dan's guessed 700 ("i just randomly
   said 700"): 800 is what he approved on screen and is already loaded.
   Sizes are rem steps (text-base/text-sm), NOT px and NOT screen-relative
   (Dan asked): text follows the reader's font setting; a wider screen gets
   more columns, never bigger letters. NOT applied to French exercise
   options (MCQ/FlipIt/dice) — the target French stays in the reading face —
   nor to profile data cards (scores are data, not labels).
6. **The hub tiles go half-width and lose their blurbs** (Dan, shown the
   hubs: "why are these still width-occupying buttons. We don't need the
   desxruption of the acticities, not here"). FamilyHub is a two-column
   grid on every screen now — icon + hand-bold name, no description. This
   OVERRULES the 1 Sep "a blurb per tile helps you choose" position for
   hubs; the blurbs stay in the registry for surfaces that want them.
## 5 Sep — SIO-045A becomes SIO-045; the spine is 1-50 with no gaps

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x.

Dan: *"if there is no more 45 but only 45A or 45.5, then make that the 45"*.
Done. `SIO-045A` -> `SIO-045`, num 45.5 -> 45, in `sios.json`, the v9 CSV, and
every place in `src/`, `verify/` and `scripts/` that named the id.

**This reverses a decision recorded in the code.** The comment in
`pretests/index.ts` said 45's number was *"a deliberate permanent gap, not
renumbered forward"*. The gap outlived its reason — nothing was ever going to
sit at 45 again, and a lone half-step cost every surface that prints a stop
number an explanation. The comment now records the reversal rather than being
deleted.

**The outcome is cleaner than expected**: the spine is now exactly 1-50, no
missing integers, no halves, no duplicates. Verified against `sios.json` before
and after. Nothing downstream shifted — 046-050 keep their numbers.

**Two things NOT changed, deliberately.** The pretest FILE names still lie about
themselves — `u4-sio045.json` holds SIO-043's content, `u4-sio045a-nombres.json`
holds the new SIO-045's — which has been the documented choice since the July
re-cut (`src/lib/labels.ts`). And the historical documents were left alone:
STATUS's own past entries, the 045A numbering report, `CSV_SPEC_REASSIGNMENT`
and the 23 Aug syllabus audit all still say SIO-045A, because they record what
was true when they were written.

**Two mistakes made and caught in the doing**, both from a too-broad rename:
a first pass rewrote those historical docs (reverted), and writing the v9 CSV
through Python's text mode stripped **51 CRLF line endings** from Dan's own
source file — the diff showed 53 changed lines for a one-string edit, which is
what gave it away. Redone in binary: one line changed, bytes otherwise
identical.

`verify49` needed no logic change — its rule is *num = NNN + 0.5 if a letter
suffix*, and SIO-045 with no suffix satisfies it at 45. Only its prose moved.
`check:sios` green, matching the CSV on all 50.

Build, tsc and all 89 checks green.

## 5 Sep — a third tone: mono, the quiet set (24 marks becomes 36)

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x.

Dan asked whether a version existed with *"different shades of the same color
(darker L, lighter everything else) and grey ring bound"*. It did not — this
session had built pale, deep, and complement binds, never a monochrome. So it was
drawn, and on his instruction — *"not amendment but add on to the collection of
variants"* — it was ADDED rather than allowed to displace anything.

Block at L 0.52, top-right at 0.72, mouth at 0.88, binds a warm near-neutral
`#8d8a85` walked down to the same 3.0 : 1 tile floor the coloured binds hold.
Twelve of them, one per hue. `MARKS` now addresses three tones and 36 marks.

**Two things worth knowing before anyone reaches for it.**

*The letter loosens.* In pale and deep the block and the top-right share a hue AND
sit close in lightness, so they fuse into one stroke and the eye reads a C. Two
lightness steps apart, the top-right detaches: a dark L with two pale tabs. Better
as a notebook, weaker as the letter that is meant to become a G.

*It cannot ship as the app icon.* `verify95-icons` demands three distinct
saturated hue buckets per PNG. Rendered at 512 and run through that check's own
function, four of six pens fail — yellow with ONE bucket, orange, blue and violet
with two; pink and green reach three only because gamut clipping pushes their
steps across bucket boundaries, which is luck. That is measured, not predicted:
the last time this came up I asserted the whole highlighter set would fail the
same rule and was wrong.

verify97 gained mono's own rules rather than stretching the existing ones — the
complement assertions would be nonsense applied to a grey. It now pins the twelve
values, that the bind stays neutral (chroma under 0.02), that it clears the tile
floor, and that the three lightness steps stay apart. Four break-tests, and the
separation one had to be isolated: the drift assertion caught the first attempt
first, so both sides were moved to leave only separation failing.

Build, tsc, eslint and all 87 checks green.

## 5 Sep — the ring binds take the complement, across all 24

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x.

Dan: *"we want the ring binds to be in the complementary color so it does not
look so intense"*. Applied to all twenty-four, and to the shipped icon.

**The literal reading fails, so it was not taken literally.** The mouth colour
itself on the rings lands at **1.24-3.16** against the tile — Periwinkle's yellow
ring would be all but invisible, Magenta's green weak. So each ring is the
complement's HUE, walked down only until it clears **3.0 : 1 on the tile**. That
is WCAG's NON-TEXT floor and it is the right one here: a ring bind is a shape,
not type. The old rule was 5.1 (the text floor) and holding it would have
re-darkened exactly what Dan asked to lighten. All twelve land at 3.00-3.07.

verify97 gained a second ring assertion with it: the rings must still carry the
COMPLEMENT'S hue, not drift back to the block's. Both break-tested — a ring gone
pale reports "not hardware, it is a smudge"; a ring back on the block hue reports
180 degrees from the mouth.

The icon regenerated with it: rings #7d9400 (olive) under the violet block,
where they were #9200fe. Four hue buckets on the 512s and the 180/192, three on
the maskable — verify95-icons still green, unmodified. The Twelve Marks and
Deep-Tint artifacts were regenerated too, so the pages and the repo agree.

Build, tsc and all 87 checks green.

## 5 Sep — the highlighter mark becomes the site icon (supersedes the entry below)

**Amended within the hour: Violet, not Pink.** Dan: *"it is nice but can we pick
the next strongest block"*. Violet is second on block-against-paper (2.67 to
Pink's 2.79) and FIRST on the top stroke (4.60, the best of all twenty-four), so
the swap costs 0.12 on one number and gains on the other. Four hue buckets, three
on the two smaller files — clear of verify95-icons' polychrome floor either way.
Shipped values: block #b17eff, top stroke #9832ff, mouth #8ca600, rings #9200fe.
The paragraphs below describe the Pink build; everything in them holds except the
four colours.

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x.

**Read this before the next entry.** That one recoloured the F-g mark's shell to
pink. It was done on a misread: Dan's *"please use the best of those favicons
variants as the site's main favicon"* meant the twenty-four HIGHLIGHTER marks he
and this session had spent the afternoon designing — the C that is to become a G
— not the four shell options of the older drawing. He said so plainly: *"is your
memory so poor that you forgot we had just discussed the real finally chosen
logo?"* The shell recolour is superseded by this commit; it is left in history
rather than rewritten, because the measurements it carries are still true and
the next person to reach for orange should find out why not.

**Shipped: the deep-tint Pink mark.** `icon.svg`, the four PNGs and
`favicon.ico`, all generated from `src/content/highlighterMarks.ts`'s own
geometry rather than drawn again — block #ff4eb2, top stroke #d7008e, mouth
#00b28b, rings #c1007f.

**Why Pink of the twenty-four.** Strongest block against paper of the whole set
(2.79:1), top stroke at 4.55:1 in the deep tone, and — the deciding number — it
carries FIVE distinct saturated hue buckets under `verify95-icons`'s polychrome
rule, the widest margin of any candidate. Blue fails that rule outright at two
buckets. I expected the whole set to fail it and was wrong: the fade and the
anti-aliased edges spread hue across buckets, so five of the six tested pass.

**The maskable icon needed its own inset.** The mark runs nearly edge to edge, so
the launcher-safe variant is drawn at a 15% inset with the tile colour around it;
the other three sit at 2%. verify95-icons' safe-area assertion passes on that.

**What was lost, and it should be said.** The F-g drawing carried the brand's
initials; this mark carries a C awaiting its G. Dan chose it knowing that — the G
is the stated next step — but a lettered mark was replaced by an unlettered one
and that is a real trade, not a free swap. Peers' art is recoverable from git.

Build and all 87 checks green, verify95-icons included, unmodified.

Shared: `src/app/icon.svg`, `src/app/favicon.ico`, `public/icons/*` — Peers'
lane, changed here on Dan's direct instruction, twice.

## 5 Sep — the mark's shell goes pink

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x.

Dan, after seeing the options measured: *"please use the best of those favicons
variants as the site's main favicon"*. Shell `#ff4b5d` -> `#ff4eb2`, the Games
pen. Peers' drawing is otherwise untouched.

**Why it needed changing at all, and it was not the register.** Peers flagged
that the brand red shares a register with *wrong* — true, 7 degrees of hue from
`--dopa-miss` — but the mark and the miss colour meet on essentially no screen:
the tab, the home screen, and the install popup, none of which tells a learner
they were wrong. The real fault was inside the mark. Measured as COLOR_REVIEW's
appendix does it (Machado deutan/protan, Euclidean sRGB, threshold 0.20), the
coral shell against the green page it encloses scored **0.166** — under the
threshold, the same fault Peers moved the LETTER off red to avoid, still sitting
in the frame. Pink scores **0.334**.

**The trap worth recording.** Coral was `--fam-user` and User is orange after the
realignment, so re-cutting the shell to orange is what the token table suggests.
On the real pixels it scores **0.053** at the bottom of the fade — a quarter of
the threshold, orange and green collapsing into one colour for a protanope. The
obvious move was the worst of the four. Violet scored best at 0.476 and was
rejected only because it flips the mark from warm to cool: a different logo
rather than a corrected one.

**How it was done, because there is no vector source.** The full mark exists in
the repo only as raster — `src/app/icon.svg` is the flat 16px variant that drops
the g's counter and the low band. So the four PNGs were recoloured pixel by pixel
in OKLCH: every red-family pixel keeps its own lightness and chroma and takes the
new hue, so the App Store vertical fade and every edge survive. `favicon.ico` was
regenerated at 32px from the recoloured 192. `icon.svg`'s one red fill was
edited directly.

**Also answered:** the earlier single-hue favicon idea (one colour in several
shades) is not merely dormant — `verify95-icons` requires at least THREE distinct
saturated hues in every PNG, so a monochrome mark now fails CI by design. Its
message calls that "the old single-colour notebook". Reviving the idea means
changing that check, which is Dan's call and Peers' lane.

verify95-icons green, including its polychrome and maskable-safe-area
assertions. Build and all 87 checks green.

Shared: `src/app/icon.svg`, `src/app/favicon.ico`, `public/icons/*` — **Peers'
lane**, changed here on Dan's direct instruction. Peers holds the original
drawing and should redo this from source if they have one.

## 5 Sep — the 🧰 tools summon mid-exercise, and the voice corrects first (feat/ambient-tools)

Sole editor of STATUS.md in this commit: the ambient-tools lane
(feat/ambient-tools — pushed for fluoduo-main to QC, not merged).

The AMBIENT TOOLS build, first pass, all as Dan settled it on 5 Sep. A
floating 🧰 (cahier paper, ink border, above the green 💬 bubble) opens a
two-row tray — 🔊 VoixLà · 🤖 ChaTutor — and a row slides a BottomSheet card
up OVER the exercise, which never closes or navigates. Where: the three
Skills trainers only — ÉcouTexte, WorDrill, ComposeIt (both modes) — mounted
INSIDE each trainer's own content component; **DrillShell and GameFrame are
untouched** (verify100 pins that too).

**The panels are extracted, not copied.** tutor/page.tsx and tts/page.tsx are
now thin shells over `components/tools/ChaTutorPanel` / `VoixLaPanel`; the 🧰
card mounts the same two components with context props the pages don't pass.
The trainer hands over what it knows: ChaTutor gets a yellow chip (activity +
current item — only what the learner can already SEE; ÉcouTexte hands the
learner's typed attempt, never the hidden sentence) prepended to the
conversation the backend reads; VoixLà gets the current typed/spoken French
pre-filled.

**THE CORRECTS-FIRST RULE holds in code shape, not intention.** The card's
VoixLà runs /api/correct on the handed text FIRST, shows the corrected
sentence leading with the slip marked beneath, and ▶ voices ONLY the
corrected form; the 🎧 MP3 renders only the approved form too; checker
unreachable = the page's existing fallback message and total silence.
`verify100-ambient-tools.py` asserts the one voice entry has exactly three
call sites (raw text behind `!correctsFirst`, the approved sentence, the
fresh checker result) and that corriger() never speaks. Break-tested three
ways.

Audio ownership: opening a card pauses the exercise's speech
(pauseSpeech/resumeSpeech, cloud clips included via the registered hooks);
WorDrill's recognizer is ABANDONED un-graded while a card is open (handlers
detached first, so half an utterance never scores) and the mic refuses to
start until the card closes — back to idle, one tap re-arms.

Small renames the checks forced, recorded so nobody re-trips them: the
context prop is `title`, not `activity` (an `activity:` string literal reads
as an evidence tag to verify53); the chip wears cahier-hl tokens, not raw
hexes (verify19b's ratchet counts components).

Green: tsc, NEXT_PUBLIC_OPEN_APP build, all 88 checks, eslint clean on every
touched file. Shared files for the integrator: `verify.yml` (verify100's line
sits after verify98's — verify99 belongs to a parallel lane, order to
reconcile), `SayItContent.tsx`, `EcouTexte.tsx`, both Compose modes,
`tutor/page.tsx`, `tts/page.tsx`, this file.
## 5 Sep — the bottom bar is the learner's: pick the tabs, or remove the bar

Sole editor of STATUS.md in this commit: feat/bottombar-pref.

Dan's ruling (recorded below the same day): *"the bottom bar is optional and
users can opt to remove it or to replace the items there (but there should be
some defaults)."* Built, on `feat/bottombar-pref`, handed to fluoduo-main:

- **`uiPrefs.bottomNav: FamilyKey[]`** — default derived (FAMILIES minus
  User), empty = no bar. Réglages gains "Bottom bar — choose your tabs":
  six wash-coloured checkboxes in FAMILIES order, 👤 User opt-IN for the
  first time. Membership is the choice; order never is.
- **BottomBar** filters `ALL_NAV` (new in nav.ts — all six as slots) by the
  pref, renders null when empty, and withdraws `--bottombar-floor` with it.
  `BOTTOM_NAV` stays the derived default, so verify19 §3 / verify52 §6 hold
  unloosened.
- **The due count survives its slot**: Revise off the bar (or bar gone) puts
  the count as a badge on ☰ in SiteTopBar — same --dopa-streak pair, never
  shown in both places.
- **Hard-coded clearances now read the floor**: DrillShell's 58px spacer and
  .cahier-page's 56px phone padding both read `var(--bottombar-floor)`, so a
  removed bar frees its strip. FirstTour already skips an absent bar; its
  step says "Your tabs", not "the five".
- **LIVE BUG fixed in the same branch**: `.cahier-bottombar{display:flex}` is
  unlayered and beat the @layer'd `sm:hidden` — the phone bar rendered on
  DESKTOP. An unlayered `@media (min-width:640px){display:none}` ends it.
- `verify99-bottombar-pref.py` pins all of the above (15 assertions), wired
  after verify98.

Green: tsc, open build, all 88 checks, eslint on touched files. Shared files
to watch at merge: `globals.css`, `verify.yml`, `STATUS.md` (a parallel lane
holds verify100).

## 5 Sep — NO CLASSES: participants enrol rolling, worldwide (Dan's ruling)

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan: *"there won't be 'classes' of students. participants will be coming
from all over, including overseas international ones."* The app has been
carrying a one-synchronized-class assumption since the 11 Aug cohort reset.
What changes NOW (this commit): **the leaderboard drops the current-term
filter** — every participant shows, whenever they joined; the term field
stays written for the research pipeline.

What this ruling touches but does NOT change yet — each needs Dan's word:
- the profile header's « LAF1201 · A1 · WEEK 4 » (a semester week counter);
- the map's 🚩 « The class is here this week »;
- the Class bag's "show in class / bring to class" framing (just built);
- the teacher dashboard's "Class now" and the term-stamping machinery.

Two more rulings recorded the same day:
- **Official student address: fluolingo.withdrchan.com.**
- **The bottom bar is optional and its items replaceable** ("users can opt
  to remove it or to replace the items there (but there should be some
  defaults)") — defaults stay today's five families; the build brief is the
  bottom-bar study's option list; when the bar is hidden or Revise removed,
  the due count defaults to a dot on the ☰ button unless Dan says otherwise.


## 5 Sep — the six families become the six highlighters, and the mark lands

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x.

**The realignment.** Dan: *"can we align these colors with the six standard
highlighter colors: Pink, Orange, Yellow, Blue, Green, Indigo-Violet-Lilac"*,
then chose all six. The mapping is forced, not chosen: both sets are six points
on one hue wheel in the same rotational order, so matching in order is the only
assignment that neither collides nor sends Goals to yellow. Each family moves one
notch — Goals to Green and Practice to Yellow barely move; Games to Pink, Revise
to Blue, Skills to Indigo-Violet, User to Orange. No two paths cross, so nobody
is re-taught which family is the cool one. 24 values in one block of
`globals.css`; no component, route or registry key touched (`svplay` is still
`svplay`).

Worst case on the three surfaces the ink is used on: 4.52 wash / 5.52 white /
5.12 paper, against 4.53 / 5.54 / 5.14 for the colours replaced.

**Nothing pinned the family values.** `verify30` has held the seven dopamine
roles since 21 Aug; the six families had identical risk and no guard, so any of
24 hexes could drift in silence. `verify96-family-hues.py` lands with the
recolour — values, the three-surface floor recomputed, and the **wheel order**,
which is a property of the set that no per-value check can see and the assertion
that would catch someone improving one family into a nicer hue and silently
swapping two.

**A false accessibility claim, corrected.** The page-ground comment said the soft
ink cleared above 7:1 and was AAA. `--cahier-ink-soft` (#655c55) measures
6.00-6.13 on those grounds: AA. False before this change as well as after; three
sessions had read the block without measuring. verify96 recomputes it.

**The mark, for posterity** (Dan: *"can we put the logo and 24 colors in the repo
for posterity"*). `src/content/marks.ts` + `src/components/FluoMark.tsx`.
**Nothing renders it** — archival, so the marks survive the session they were
designed in rather than living only in a chat. Twelve marks in two tones: `pale`
lightens the top-right block, `deep` darkens it. Both are Dan's, and they are
different objects, not a draft and a fix — the pale top stroke measures 1.09-1.48
against the paper (the faintest thing in every mark while doing structural work),
the deep one 1.85-4.60 with a tighter block-to-tint step.
`verify97-brand-marks.py` pins the 24 sets, asserts the deep set stays *derived*
from the pale one, and turns Dan's geometry brief into arithmetic.

**`verify19b` caught the marks and was right to.** 61 raw hexes arrived in one
file. Fixed with a named `PALETTE_SOURCES` exemption — a file whose whole job is
to be colour values cannot obey a rule about reaching for tokens — NOT with
`--rebaseline`, which would have raised the ceiling for every file in `src/` by
61 and let the next hard-coded colour slip under a loosened ratchet. The baseline
was then lowered (505 to 494, 768 to 745) so the exemption left no slack; a
single stray hex in a component still trips it.

Green: `tsc`, build, all 85 checks, eslint on touched files. Ten break-tests
across the two new checks, each failing with its own message.

Shared: `globals.css`, `COLOR_REVIEW.md` (sections 12 and 13), `STATUS.md`,
`verify19b.py`, `visual-baseline.json`, `.github/workflows/verify.yml`.
**`verify19b.py` and the baseline are the collision risk** — any lane that
rebaselines will conflict.

## 5 Sep — stops 36/40 keep off the imperative, frames included

Sole editor of STATUS.md in this commit: claude/fluolingo-color-review-9thj8x.

`FINISH_BACKLOG` item 10, first two parts.

**Numbering reconciles with v9, exactly.** `docs/handoff/LAF1201_SIOs_Flashcards_v9.csv`
and `sios.json` agree on all 50 ids, no extras or duplicates either way, 0 unit
mismatches. v9 carries **SIO-045A and no SIO-045**, so the 45.5 the app stores is
Dan's own id, not a repo artefact. (Dan's ruling on how to LABEL it — by position
everywhere, or 45A everywhere — is still open; nothing was changed for it.)

**The direction guard-rail held where anyone had looked, and leaked where nobody
had.** Every keyed answer on SIO-036 is an infinitive after « il faut »; the -ez
forms sit in the distractor lists with a whyWrong naming them as the vous
imperative — the rail working as designed, and Dan's 1 Sep ruling says a wrong
answer is allowed to be wrong French. The directions bank shows « Vous tournez »,
« Vous prenez » on every card.

What leaked was the sentence AROUND the blank. `finale.ts` printed
`pre: "Prenez la ", post: " rue à droite"` and asked for « première ». No
imperative is keyed, so the criterion the backlog proposed — *"Directions bank has
no keyed imperative"* — passes on that line, while the learner reads a bare
imperative as model French in the stop built to avoid it. v9 is explicit:
SIO-036 is *"without the imperative, producing vous + present"*. Three frames
rewritten into the register already shipped in the bank (`SIO-036:1`, `036:3`,
`040:1`); answers and categories untouched. Same shape as « Bon chance » in
atelierModel — the wrong form was the MACHINE'S, not the learner's.

`verify98-directions-imperative.py` (renumbered from 95 on 5 Sep when
Peers' `verify95-icons` landed on main first) pins both halves and leaves distractors free.
Break-tested four ways: bank card loses its « vous », an imperative gets keyed,
the imperative distractors get tidied away, a frame prints « Prenez » again.

`docs/SYLLABUS_TIERS.md` line 124 described stop 36's blocks as *tournez à
droite*, *prenez la première rue* — imperatives, contradicting v9 and the
shipped content. Corrected to the vous forms.

Not done in item 10: **SUP-CAL-01/02/03** (Optional chips, soft family wash, off
Continue, SUP-CAL-03's né/née role cue). Untouched.

Shared: `STATUS.md`, `SYLLABUS_TIERS.md`, `.github/workflows/verify.yml`.

## 5 Sep — the mark ships: icon.svg, favicon.ico, the four PNGs

Sole editor of STATUS.md in this commit: claude/peers-vd2h6h (Peers).

Dan drew the mark over 5 Sep — a spiral notebook whose page carries an **F**
and a **g**, the g's counter closed by the amber bar. Colours: **red shell,
blue F**, green page, amber rings and counter. The red/blue swap was the call
against the earlier blue shell: red on green is the one adjacency red-green
colour-blind learners cannot separate, and the old arrangement put the LETTER
on it. Note for whoever tunes feedback colours: the brand red now shares a
register with "wrong", and one of them should move.

**Two drawings, not one.** `src/app/icon.svg` is flat and drops the counter
and the low band — at 16px they are one pixel each and the middle turns to
mud. `public/icons/*.png` carry the full mark with a two-stop vertical fade
per region (same hue at both ends, lightness travelling ~30%, the App Store
recipe). Below about 48px the fade is invisible, so it is not in the tab file.

**The trap that cost a build.** Declaring any `icons` object in layout metadata
switches OFF Next's `app/icon.svg` file convention. The SVG shipped in the
export with nothing linking it and the tab quietly kept the .ico — invisible
in every screenshot. `verify95` checks the LINK, not the file. It also caught
itself: the first version of that assertion passed against broken code because
the explanatory comment in `layout.tsx` names `/icon.svg`, so the check now
strips comments before looking.

`verify95-icons.py`, seven break-tests: single-hue art returning, a PNG that
lies about its size, starter art back in `public/`, the tab drawing gone,
maskable losing its safe area, the manifest naming a missing file, the SVG
present but unlinked. The five Next.js starter SVGs (`next`, `vercel`, `file`,
`globe`, `window`) are deleted — nothing referenced them.

## 5 Sep — item 4 (double-door): three ☰ rows were dead on Home

Sole editor of STATUS.md in this commit: claude/peers-vd2h6h (Peers).

Auditing FINISH_BACKLOG item 4 on the real export at 390×844 turned up a
navigation bug that no screenshot could have shown.

**Open ☰ on Home and the bottom three rows do nothing.** 👤 User, ▦ MENU and
🗺️ Map took no taps; the five family flaps above them were fine, and all eight
worked on /practice and /games. The menu still PAINTED correctly, which is why
it survived weeks of review.

**Why.** `SiteTopBar`'s wrapper is `sticky top-0`, and sticky + a z-index makes
its own stacking context — so the dropdown's `z-50` counts only inside the bar,
and against the page the bar competes with the single number on that wrapper.
It was `z-10`. Home's map postcard covers its whole card with a stretched
`<a class="absolute inset-0 z-10">`. Equal z-index, later in the DOM, so the
invisible link won the hit test and ate the taps. The bar is now `z-30`: above
page content, below every scrim (z-40+) and modal. `CuratedDeckTable`'s group
popover moved 30 → 25 for the same ceiling.

`verify94-topbar-above-page.py` holds it as an INEQUALITY, not a spelling test
— max z-index anywhere under `src/app` must stay below the bar's. Three
break-tests: bar back to z-10 (names `HomeDashboard.tsx:544` as the culprit),
a page card catching up, the bar losing its z-index. `fixed` overlays are
exempt: modals are meant to cover the bar.

**Item 4's other two Success lines were already met** and are now evidenced on
the export: every bottom-bar family tap lands on that family's hub with no
second popup (5/5), and the ☰ is six coloured flaps to those hubs with the
16-tile grid demoted to one ▦ MENU row below a rule.

Shared files: `SiteTopBar.tsx`, `CuratedDeckTable.tsx`, `verify.yml`,
`STATUS.md`. Open PRs when this branched: #166 (STATUS roster block only —
appends above THE ROSTER, this appends at the top; textual conflict possible,
no semantic one).

## 5 Sep — the Pages subpath goes back, and the check now pins BOTH directions

Sole editor of STATUS.md in this commit: Pre-tests.

**NOT A REGRESSION FROM #157 — that word was wrong and is corrected here.**
#157 did not break something that was working: the Pages deployment was already
broken (or unreachable) before it, and #157 fixed it for the configuration that
existed at the time. What broke it again was a configuration change afterwards.
The preview has in fact been unusable since mid-August in one form or the
other, and no change of mine caused that.

WHAT *IS* MINE, and it is the part worth fixing. `verify91`, as #157 wrote it,
hard-wired "a CNAME exists, therefore no subpath". So the moment somebody
cleared the domain, the repo's own check FORBADE the correct fix — it was
holding the broken state in place. A check that infers a remote setting from a
local file is the defect, not the base path.

WHAT HAPPENED. #157 dropped `PAGES_BASE_PATH` on the then-correct reading that
the artifact was served at fluolingo.com's root. Between 2 and 5 Sep somebody
cleared the custom domain in Settings → Pages — which is exactly what the
2 Sep Peers note in `pages-preview.yml` prescribed. The moment they did, the
home moved back to `frenchprof.github.io/fluoduo/` and that reading inverted:
the build now emits `/_next/…` for a site served at `/fluoduo/`, so every
stylesheet and script 404s.

THE EVIDENCE, and it answers Peers' 2 Sep open question ("Whoever can open a
browser: check both URLs and record the answer here"). `actions/deploy-pages`
prints the served URL on every run:

    2 Sep 08:27   Evaluated environment url: https://fluolingo.com/
    5 Sep 02:22   Evaluated environment url: https://frenchprof.github.io/fluoduo/

So on 2 Sep the domain WAS attached and Dan's original hypothesis was right;
by 5 Sep it was not. Confirmed independently from outside by
`cursor/staging-docs-8ea9`, which could actually open the host —
`docs/STAGING.md`, 4 Sep: *"its HTML asks for `/_next/…` at the github.io root
(404); the files live under `/fluoduo/_next/`."*

**Cloudflare was never affected.** Live and staging are domain roots, never set
the variable. Students were not hit by this; the github.io preview was.

THE FIX, and the lesson in it. `PAGES_BASE_PATH: /fluoduo` is back. More
importantly `verify91` no longer INFERS the home from the root CNAME file —
that inference is what let the second failure through, because GitHub never
reads that file (it is not in the uploaded artifact) so it stayed behind when
the setting changed. The workflow now DECLARES its home in one line beside the
build (`PAGES_HOME: subpath | root`) and verify91 holds the build to it in
BOTH directions: `subpath` requires the base path and it must equal the repo
name; `root` forbids it. Break-tested against both real failures — the 5 Sep
state (subpath declared, base path absent) and the 17 Aug state (root declared,
base path set) — plus a wrong folder, a missing declaration, a nonsense
declaration, the "separate from production" claim returning, and the config
default flipping. 7 assertions.

`next.config.ts`'s comment has now been wrong twice — it asserted the
subdirectory while a domain served the root, then asserted "NOTHING SETS IT"
days before the subpath came back. Rewritten to say where the truth is instead
of restating it.

**Open for Dan:** the root `CNAME` still names fluolingo.com, a domain GitHub
no longer holds. It is inert (not in the artifact) but reads as authoritative,
which is precisely what caused this. verify91 REPORTS it as a note rather than
failing on it — deleting it is a repository decision. The `git rm` was refused
by this session's permission classifier, so it is left for whoever merges.

**The standing rule, third time of asking:** whether this needs a subpath is
not a fact about the repo. It is a fact about a dashboard setting. When it
changes, read the deploy log and move the declaration with it.
## 5 Sep — install prompt: checkbox + a dismissal that sticks

Sole editor of STATUS.md in this commit: fix/install-prompt.

Dan's three popup faults, diagnosed. (1) The install card had no « Do not
show me again » checkbox — it now wears the FirstRunHint idiom (checkbox +
OK; ticked stores `fluolingo:install-prompt.v1 = "never"`, legacy answers
honoured). (2) It came back because the `beforeinstallprompt` handler never
re-read the stored answer and Chrome RE-FIRES that event after the native
sheet closes — the handler now checks `answeredRef` + localStorage.
Reproduced old vs fixed with Playwright. (3) The Android « not compatible
with this version of the mobile operating system » message is the OS's own
WebAPK/package-installer error — the string is nowhere in the repo and the
manifest/icons are valid; not ours to fix. Other popups audited clean:
FirstRunHint, FirstTour, BetaNotice (suspended) all persist correctly;
RewardToast / MenuSplash need no memory.

One file: `InstallPrompt.tsx`. verify32 untouched and green.

## 4 Sep — staging docs (no-login bookmark)

Sole editor of STATUS.md in this commit: cursor/staging-docs-8ea9.

Docs only. Dan wants one Cloudflare URL he can refresh with **no Google
login**, while live stays gated. `docs/STAGING.md` is the recipe:
`NEXT_PUBLIC_OPEN_APP=1` on the **staging** CF env/build only; live leaves
it unset; recommended bookmark `staging.fluoli.ngo`. `docs/DEPLOY.md` gets
a short Staging pointer and a 4 Sep host table (probed: `fluoli.ngo` /
withdrchan / `fluoguo.pages.dev` are CF live; `fluolingo.com` 302s to
withdrchan; `frenchprof.github.io/fluoduo/` is the GH Pages preview, no
Functions). `docs/FINISH_BACKLOG.md` item 18 and further-improvements get
one line each.

No `src/` change. The flag is not committed. `verify38` still bans it from
deploy yaml.

Shared: `DEPLOY.md`, `FINISH_BACKLOG.md`, `STATUS.md`. No open PRs on those
when this branched.

## 3 Sep — three UI quick wins (flip cue, due streak, rain accents)

Sole editor of STATUS.md in this commit: cursor/ui-quick-wins.

Three small surfaces, one PR. AuthGate, pretests, and the Class bag
rename are out of scope.

**MémoiRecall's card now shows that it turns.** The « Flip » CTA left on
2 Sep and the card shipped bare pending Dan's pick among three cues. Variant
B landed: a quiet 28×28 ↻ chip on the **front Face only** (paper-raised fill,
ink hairline, ink lip, `pointer-events-none`). The button still speaks
English — "Turn the card over" / "Turn the card back". No Flip / Retourner
chrome. No bounce loop, so `prefers-reduced-motion` sees the same static
mark. `verify27 §14h` pins it.

**The Revise due pill is a streak, not an alarm.** BottomBar's count sat on
`--fluo-danger`. It now wears `--dopa-streak` / `--dopa-streak-on` (4.64:1).

**VocabulaRain's win / miss flashes speak the dopamine tokens.** Column
flash, the ✓ sentence toast, and the drop record dropped `--drill-ok` /
`--drill-bad` / lime / rose / `#2e7d00`. GameBar's progress fill and hearts
moved the same way (`--dopa-win` / `--dopa-miss`). The sky board and
category puddles stay. `verify34 §5` pins the three call sites.

Shared files: `FlipItContent.tsx`, `BottomBar.tsx`, `GameBar.tsx`,
`LetrisGame.tsx`. In flight: #152 docs-only, #153 pretest href / Recap —
no collision on these four.
## 3 Sep — SIO-010 Enchantée + Libéria (teach-blocking)

Sole editor of STATUS.md in this commit: the Cursor cloud session on
`cursor/enchantee-liberia-bf57`.

Two ship-critical French faults from the 3 Sep content review (#154 is
report-only). This branch implements them.

**SIO-010 pretest / SpecuLearn.** After the learner says she is Léa, all
three audience tabs keyed only `Enchanté !` / `Enchanté, madame.` The
atelier already has Léa say *Enchantée*. Keys are now gender-conditioned
via `meetOptions` / `sio010SituationsFor`: Léa → Enchantée, Marc →
Enchanté. Both forms are offered; one is keyed; the miss carries an EN
WHY. A You-are strip (`Léa · she` / `Marc · he`) plus a per-question
role cue sit on the card before the guess, with the existing
`--gram-fem` / `--gram-masc` marks — never FR-only gender. Reveal paints
the keyed form with `.cahier-hl` and the miss with `--dopa-miss` +
strike. Memo left as-is.

**Libéria.** Expert Letris tile `LIBERIA` / `Liberia` → `LIBÉRIA` /
`Libéria`. English `meaning` stays Liberia. Bélarus / Birmanie / Cap-Vert
untouched.

Pinned by `verify92-enchantee-liberia.py`. Shared file with #153:
`unit0-questions.ts` (they only touched a comment). STATUS also collides
with #154's report header — rebase is this branch's if they land first.
## 3 Sep — two P0 pretest surfaces (href + Recap gap list)

Sole editor of STATUS.md in this commit: cursor/pretest-href-bring-to-class.

Two P0s, one PR. Neither product merge (SpecuLearn stays SpecuLearn). AuthGate
untouched.

**P0 #1 — Unit-0 Pre-Test from StopSheet opened the map popup.**
`pretestHrefForDeck` (`CahierShell.tsx`) still returned `/unit/0#{sioId}` —
the comment still said the popup held the questions. UnitRedirect turns that
hash into the map popup. Unit0Panel / StopPopup already used
`/pretests/unit0/{id}`. The flap helper now matches them. verify66 pins it:
`pretestHrefForDeck` must contain `/pretests/unit0/` and must not contain
`/unit/0#`. Units 1–4 still go to `/pretests/{id}`.

**P0 #2 — U1–4 Recap had no BringToClass.** Unit-0's page already mounts it;
`recordPretestAnswer` already writes U1–4 misses. Recap showed score / retry
/ Home and never the gap list. Same `<BringToClass sioId={…} />`, sio from
`stopForPretestId`. Copy unchanged (Class bag rename is #152, docs only).
verify40 pins the Recap mount.

Shared: `CahierShell.tsx` (href), `PretestContent.tsx` (Recap). In flight:
#152 is `docs/CLASS_BAG.md` only — no collision.
## 3 Sep — whole-site French content review (report only)

Sole editor of STATUS.md in this commit: the Cursor cloud session on
`cursor/french-content-review-c2cb`.

Native-speaker + A1 teaching pass over the learner-facing French in this repo
(not a live scrape; English chrome left alone). Report is
`docs/french-content-review.md`. **No product copy changed** — the P0/P1 items
are pedagogical choices, not one-character typos.

Covered: 44 collection decks, 35 U1–U4 pretests, Unit 0 banks in
`sios/unit0-questions.ts` (there is no `pretests/unit0/`), `sios.json` chips,
ateliers, native lessons, conjugaison (66 verbs), textgen U0–U4, memos,
chapters, finale, root Letris JSON. Not found: `src/content/games/`, a Skills
French bank.

Dan, same day: SpecuLearn + pretests first; two **ship-critical** items —
SIO-010 pretest keys *Enchanté* after the speaker is Léa (needs
gender-conditioned *Enchantée* + EN WHY), and expert-list *Liberia* must be
*Libéria*. Bélarus / Birmanie / Cap-Vert / Centrafrique naming held as notes
only. Spoken *Comment tu t'appelles ?* stays. Report restructured A/B/C.
Handover to fluoduo-main when the PR is up.

## 3 Sep — fluolingo.com has been serving unstyled HTML for 17 days

Sole editor of STATUS.md in this commit: Pre-tests.

Dan, reading the workflow rather than the site: *"That workflow builds with
PAGES_BASE_PATH: /fluoduo … but the site is now served at the root of
fluolingo.com."* Correct, and it had been live since 17 Aug.

**THERE ARE TWO LIVE SITES, both fed from main** — the fact this whole failure
turns on, and one no document in the repo stated:

  · **fluolingo.com** — GitHub Pages, built by `pages-preview.yml` on every
    push to main, served at the domain ROOT. **This is the one students use.**
  · **fluolingo.withdrchan.com** — Cloudflare Pages, built from `dckg/fluo`,
    which `deploy-live.yml` mirrors main into on a manual dispatch.

Commit 79a9938b (17 Aug) added BOTH halves of the fault at once: the workflow
with `PAGES_BASE_PATH: /fluoduo`, and a `CNAME` for fluolingo.com. Each is
right on its own. A Pages PROJECT site lives at owner.github.io/repo/ and needs
the subpath; attach a custom domain and the same artifact is served at that
domain's root, so the subpath becomes wrong. The build went on emitting
`/fluoduo/_next/…` for a site served at `/` — HTML loads, every stylesheet and
script 404s.

Proved by building it both ways rather than by opening the site (this session's
egress policy answers 403 to CONNECT for fluolingo.com AND frenchprof.github.io,
so **the fix is unverified against the live host** — Dan's to confirm):

    PAGES_BASE_PATH=/fluoduo   "/fluoduo/_next/static/chunks/01m3lo_t-xwfe.css"
    (unset, the fix)           "/_next/static/chunks/01m3lo_t-xwfe.css"

and the artifact has no `fluoduo/` directory for the first form to land in.

WHY IT SURVIVED SEVENTEEN DAYS, which is the part worth keeping. It looks fine
in every diff — neither file is wrong alone, and no diff shows both. And the
comments asserted the dead premise as fact: `next.config.ts` said GitHub Pages
"serves a project site from a SUBDIRECTORY", `pages-preview.yml` called itself
a preview that "DOES NOT TOUCH PRODUCTION", and `docs/DEPLOY.md` said
fluolingo.com 302-redirects to withdrchan. All three were true for about an
hour on 17 Aug. Anyone auditing read them and moved on — this session did too,
first time round, and told Dan his hypothesis was wrong on the strength of
them.

Fixed: the env goes; all three documents now say what is actually deployed
where; the workflow is renamed *Deploy fluolingo.com (GitHub Pages)*.
`verify91` refuses a Pages subpath while a CNAME exists, finds the Pages
workflow by what it DOES rather than by its filename (the file is called
"pages-preview" and stopped being one on day one), catches the variable set as
a step env, a job env or an `export` in a run block, holds `next.config.ts` to
its `?? ""` default, and fails if the workflow calls itself separate from
production again. 7 assertions, all break-tested.

**Open for Dan:** the root `CNAME` is not copied into `out/`, so it does not
travel in the uploaded artifact — the live binding is Settings → Pages → Custom
domain on frenchprof/fluoduo. Worth confirming it is set there, and worth
deciding whether the artifact should carry a CNAME too. Not done here: it
changes a domain binding I cannot observe from this container.

## 2 Sep — the two open items close

## 2 Sep — READ THIS BEFORE YOU TOUCH A WORKFLOW OR MERGE A BRANCH

Sole editor of STATUS.md in this commit: Peers. Two notices, both found today,
both the kind that a session discovers by believing a comment.

### 1 · `pages-preview.yml` PUBLISHES THE LIVE SITE. It is not a preview.

GitHub Pages Settings for `frenchprof/fluoduo` reports **"Your site is live at
https://fluolingo.com/"**. A custom domain was added on 12 Aug (root `CNAME`,
commit 43b7d17), so the workflow whose header said *"it is entirely separate
from production"* and *"IT DOES NOT TOUCH PRODUCTION"* has been deploying a
public production site for three weeks. `frenchprof.github.io/fluoduo` now
301-redirects there and serves nothing of its own.

**There are TWO live sites, both fed from `main`:**

    pages-preview.yml  -> GitHub Pages   -> fluolingo.com
    deploy-live.yml    -> dckg/fluo      -> Cloudflare -> fluolingo.withdrchan.com

WHY THIS IS ON THE BOARD AND NOT JUST IN THE FILE. Dan asked for a way to view
the app without Google sign-in. This session read that stale header, believed
it, and proposed setting the open-app build flag in that workflow — which would
have taken the sign-in wall down for every visitor to fluolingo.com.
`verify38-authwall.py` refused it by name; the flag is banned from every config
a deploy reads and that file is one. Confirmed by adding it and watching the
check fail. **The guard works. The comment did not.** The header is rewritten.

Note you cannot even NAME the flag in that file: verify38 greps it raw, so a
comment mentioning it fails too. That is deliberate.

**An open build therefore needs a host that is neither of those two.** The
standing suggestion to Dan is a separate Cloudflare Pages project gated with
Cloudflare Access, so the secret lives at the edge and never ships in the
bundle — the 27 Aug ruling in `authConfig.ts` still governs: static export
means any secret in the JS is findable in a minute.

**OPEN QUESTION FOR DAN, not yet answered.** That workflow builds with
`PAGES_BASE_PATH: /fluoduo`, which puts every asset under `/fluoduo/`. Correct
for a github.io project site; but the artifact is now served at the ROOT of
fluolingo.com. If that is what it looks like, `https://fluolingo.com/` has been
missing its stylesheets and scripts for three weeks while
`https://fluolingo.com/fluoduo/` works. Nobody has confirmed which loads — this
session's egress proxy 403s every one of those domains, so it could not check.
**Whoever can open a browser: check both URLs and record the answer here.**

### 2 · Conflict markers were committed into AGENTS.md, and 16 branches still carry them

`main` is CLEAN as of #144. It was not clean before: **PR #141 (this session's
own work) carried six markers into `AGENTS.md`** from a qc-branch merge that
had left them, and #144 removed them. The file every session is told to read
first therefore had `<<<<<<< HEAD` sitting in the middle of its rules.

Resolved here identically to main — verified with `git diff origin/main HEAD --
AGENTS.md`, which is one blank line — so this branch cannot revert #144's fix.
Both conflicts were additive prose and both sides were kept: "English is never
bigger than French", and the integration-lane rule, whose two halves
("fluoduo-main is the integration lane" and "EVERY merge goes through
fluoduo-main") had been split by the merge.

**STILL CARRYING THE MARKERS — 16 remote branches.** Their tips are stale and
main is fine, but a merge of any of them re-introduces the damage:

```
git show <branch>:AGENTS.md | grep -c '^<<<<<<< \|^>>>>>>> '
```

    claude/atelier-popup-dialogue      claude/jam-scan-ci
    claude/deploy-live-diagnose        claude/jam-scan-hydration-wait
    claude/deploy-live-extraheader     claude/map-of-fluolingo-land
    claude/deploy-live-probe-contents  claude/map-route-back
    claude/derived-doneness            claude/menu-children-dress
    claude/home-topbar-lot-a           claude/profile-footer-label
    claude/icomplete-cut-sio010-tabs   claude/status-1sep-evening
    claude/strips-brief                french4-docs

They are left alone deliberately: rewriting other lanes' branches is
integration work. **fluoduo-main — before merging any of these, take AGENTS.md
from `main`, not from the branch.**

THE GENERAL LESSON, which is the same one in both halves: a comment and a
merge marker are both text that no check reads. Scan for markers before you
push, and verify a claim about the deploy path against the workflow and the
settings page, not against the file's own description of itself.

## 2 Sep — the two open items close

## 2 Sep — READ THIS BEFORE YOU TOUCH A WORKFLOW OR MERGE A BRANCH

Sole editor of STATUS.md in this commit: Peers. Two notices, both found today,
both the kind that a session discovers by believing a comment. Notice 1 was
then CORRECTED the same day — it overstated the danger — and the corrected
version is what stands below.

### 1 · `pages-preview.yml` publishes to a deployment NOBODY can reach — and that is a loaded gun

CORRECTED THE SAME DAY. The first version of this notice said flatly that the
workflow publishes fluolingo.com. It does not, and the correction matters more
than the original claim, so here is the evidence rather than the conclusion.

GitHub Pages Settings for `frenchprof/fluoduo` reports **"Your site is live at
https://fluolingo.com/"**, because a custom domain was added on 12 Aug (root
`CNAME`, commit 43b7d17). That sentence is GitHub repeating its own setting.
Nothing routes the hostname to it:

    fluolingo.com/          loads          (Dan, 2 Sep)
    fluolingo.com/fluoduo/  does not exist (Dan, 2 Sep)

This workflow builds with `PAGES_BASE_PATH=/fluoduo`, so everything it emits
lives under `/fluoduo/_next/`. A site with no `/fluoduo/` is a build with NO
base path — which is the Cloudflare one. So:

    deploy-live.yml  -> dckg/fluo -> Cloudflare Pages -> fluolingo.com   ← PRODUCTION
                                                      -> fluolingo.withdrchan.com
    pages-preview.yml -> GitHub Pages -> reachable at NO url at all

github.io/fluoduo 301s to fluolingo.com (the custom domain is configured), and
fluolingo.com is answered by Cloudflare. The artifact is served to nobody.

**WHY IT IS STILL A HAZARD.** GitHub Pages holds a live claim on a production
hostname. Move that DNS record to GitHub, or drop the Cloudflare one, and this
artifact takes over fluolingo.com the same minute — wrong base path, and
whatever was built into it. Do not treat the file as a sandbox because its
output is currently invisible.

**DO NOT open the sign-in wall there.** Asked for a way to view the app signed
out, this session read the workflow's old header — *"IT DOES NOT TOUCH
PRODUCTION"* — believed it, and proposed setting the open-app build flag in it.
`verify38-authwall.py` refused it by name; the flag is banned from every config
a deploy reads. Confirmed by adding it and watching the check fail. The flag
cannot even be NAMED in that file: verify38 greps it raw. That is deliberate.

**THE FIX, for whoever has the settings page open:** clear the custom domain in
Settings → Pages and delete the root `CNAME`. GitHub then serves the artifact at
`https://frenchprof.github.io/fluoduo/` — the subpath `PAGES_BASE_PATH` exists
for — the redirect stops, and the claim on fluolingo.com is dropped. That turns
a hazard into the working preview the file was written to be, and it is the
cheapest thing on this board.

An open build still needs a host that is neither production path; the standing
suggestion is a separate Cloudflare Pages project behind Cloudflare Access, so
the secret sits at the edge and never ships in the bundle (the 27 Aug ruling in
`authConfig.ts`: static export means any secret in the JS is findable).

TWO METHOD NOTES, since this cost two wrong answers in a row. A workflow's own
header is not evidence about where it deploys. Neither is a settings page that
only reflects a setting — `fluolingo.com/fluoduo/` returning nothing is what
actually decided this, and one URL would have settled it at the start.

### 2 · Conflict markers were committed into AGENTS.md, and 16 branches still carry them

`main` is CLEAN as of #144. It was not clean before: **PR #141 (this session's
own work) carried six markers into `AGENTS.md`** from a qc-branch merge that
had left them, and #144 removed them. The file every session is told to read
first therefore had `<<<<<<< HEAD` sitting in the middle of its rules.

Resolved here identically to main — verified with `git diff origin/main HEAD --
AGENTS.md`, which is one blank line — so this branch cannot revert #144's fix.
Both conflicts were additive prose and both sides were kept: "English is never
bigger than French", and the integration-lane rule, whose two halves
("fluoduo-main is the integration lane" and "EVERY merge goes through
fluoduo-main") had been split by the merge.

**STILL CARRYING THE MARKERS — 16 remote branches.** Their tips are stale and
main is fine, but a merge of any of them re-introduces the damage:

```
git show <branch>:AGENTS.md | grep -c '^<<<<<<< \|^>>>>>>> '
```

    claude/atelier-popup-dialogue      claude/jam-scan-ci
    claude/deploy-live-diagnose        claude/jam-scan-hydration-wait
    claude/deploy-live-extraheader     claude/map-of-fluolingo-land
    claude/deploy-live-probe-contents  claude/map-route-back
    claude/derived-doneness            claude/menu-children-dress
    claude/home-topbar-lot-a           claude/profile-footer-label
    claude/icomplete-cut-sio010-tabs   claude/status-1sep-evening
    claude/strips-brief                french4-docs

They are left alone deliberately: rewriting other lanes' branches is
integration work. **fluoduo-main — before merging any of these, take AGENTS.md
from `main`, not from the branch.**

THE GENERAL LESSON, which is the same one in both halves: a comment and a
merge marker are both text that no check reads. Scan for markers before you
push, and verify a claim about the deploy path against the workflow and the
settings page, not against the file's own description of itself.

## 2 Sep — the two open items close

Both were questions put to Dan with pictures; both answered (*"proceed with
open"*), and the finished work went to fluoduo-main as PR #147 first.

**The desk goes all round** (Dan, shown three real renders: *"B"*). The drill
desk had landed with grey on the left and above only, on the reasoning that a
drill cannot spare the room — and that reasoning had priced the wrong option.
Measured on a 390×844 phone: a page's 64px of desk below costs a drill **64px**
of height; a thin desk all round costs **8**. The edge that actually showed the
difference was the RIGHT one, where the paper had been running off the side of
the screen while every other page in the app sat on grey. The top and sides are
still the page desk's own numbers, read from `.cahier-desk` /
`.cahier-deskrow`; the bottom is 8 rather than 64, because a page scrolls and a
drill is one screen with its footer tray pinned to the end of it. The paper's
full radius is back now that there is grey on every side to put it against.
Re-swept: **121 banded routes, still one regime — h47, top 57, left 19, ✕ at
31.** verify82 gained two assertions (the right gutter against the LEFT, never
a number; the bottom as a range, "some desk but not a page's"), break-tested.

**LexicaLater's popup is one sentence now.** It had been that game's ⋯ → Help
unedited — four paragraphs of levels, decoys and hard mode — which is right in
a menu you chose to open and long as an arrival card. GameFrame took an
optional `hint`: the FIRST-RUN cut, which must be a node `help` also renders,
so it is the same constant used twice and not a second wording. Lexicalator
pulls its opening sentence out as `howToPlay` and passes it both ways. The
popup then draws "The rest — levels, lives, settings — is under ⋯ → Help"
itself, once, exactly when something was left out. verify87 checks that the
identifier passed as `hint` appears inside that game's `help`, so a paraphrase
fails; 20 assertions now, all break-tested.

## 2 Sep — every game shows the volume button, and the bar stays put

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan: *"some games are missing the volume button"*, naming Numbers, NumBus,
NumBourse. Two faults, both measured before fixing, both pinned by
`verify90-game-volume.py`:

1. **Sound was buried.** Patch 23 folded SoundControl into the ⋯ sheet, so
   games were the only surfaces without the visible 🔊 every page's top bar
   shows. It is ON GameBar now (✕ · progress · ♥ · score · 🔊 · ⋯), the same
   component the site bar mounts — one mute state everywhere — and the ⋯
   sheet's Sound row is gone (two doors to one control is the HelpDot fault).
2. **The bar could scroll away.** The layout's footer sits under the 100dvh
   frame, making a game page ~90px taller than the screen; focusing NumBus's
   keypad scrolled ✕, 🔊 and ⋯ off the top (bar at y=−85, measured). GameFrame
   pins the viewport while mounted and releases it on unmount.

The Numbers hub itself always had the top-bar 🔊 — what Dan hit there was the
games it opens onto.

## 2 Sep — the streak works where a learner can see it work

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan: *"the streaks are not working yet?"* Driven and confirmed — two faults,
both now dead and both pinned by `verify89-streak-live.py`:

1. **The mark went deaf.** StreakMark (top bar) read the streak once on
   mount and never subscribed to `fluolingo:progress-updated` — the day's
   first practice bumped the streak in storage while the bar showed nothing,
   and in an SPA the remount that would have revealed it never comes. It
   listens now, so the 🔥 (and the "1 day in a row" toast, which rides the
   same finalize funnel) appear the moment the first answer lands.
2. **Graded surfaces that never touched progress.** MCQ, NumBus and
   NumBourse grade through recordResponse (evidence trail) and deliberately
   stay outside recordItemResult — no SRS, no XP — but that starved the
   streak too. `notePracticeDay()` is the narrow door: bump the day, save
   through finalize, change nothing else. All three call it on every graded
   answer; wrong answers count, per the streak's own rule.

## 2 Sep — first-run instructions on every activity

Dan, twice in an hour: *"add a pop up instruction for the first time with a
'do not show me again' regarding what the user needs to do"*, then *"can you
add the same first timer pop ups instructions for all activity pages (hub
pages excluded)."*

**14 activities have one; every hub, picker, gallery and landing has none.**
MémoiRecall · pre-tests · SpecuLearn · MneMemo · GramMarathon · ConjugaZone ·
ÉcouTexte · WorDrill · VoixLà · ChaTutor · DéjàRevu · VocabulaRain ·
LexicaLater · ComposeIt.

HOW IT IS WIRED, and why not per page. The text is one row per activity in
`content/hints.ts`; DrillShell and CahierShell each mount `ActivityFirstRun`
with the key they ALREADY carry, so an activity gets its instruction by having
a row and by nothing else — no page was edited. Hubs are excluded by ABSENCE
rather than by a list of exclusions: no row, nothing mounts.

`on: "drill" | "page"` is load-bearing, not bookkeeping. `wordrill` names the
Say It DRILL and the deck-picker PAGE at /practice/wordrill; `conjugaison`
likewise. Without it the picker fires the drill's instruction over a list of
decks.

THE GAMES REUSE THEIR OWN TEXT. GameFrame already took a `help` node — "how to
play", behind ⋯ → Help — so a new `hintKey` makes that same node open once by
itself. No game's instructions are written twice, so they cannot drift.
NumBus and NumBourse pass nothing: they already open on a landing that
explains them (Dan, 29 Aug), and a popup would say it twice one tap apart.

TWO THINGS THE DRIVING FOUND, both fixed. It portals to `document.body` — a
drill's root is `overflow-hidden` and clipped it. And it sits at **z-79, below
CreditsSplash (z-80)**: above it, the instruction covered VocabulaRain's and
LexicaLater's credits for three seconds and ate the tap meant to skip them.
verify87 recomputes that comparison from both files rather than restating
either number.

Driven end to end: first visit shows it; « Got it » with the box unticked
closes it and it RETURNS next visit; ticked, it never comes back; and the key
is per activity, so dismissing MémoiRecall leaves SpecuLearn's alone.

`scripts/jam-scan.mjs` now walks as a RETURNING learner (it seeds the flags
the popup itself writes). Without that the modal intercepted its every click
and verify79 timed out — which is the check doing its job.

New: `components/FirstRunHint.tsx`, `content/hints.ts`,
`verify88-first-run-hints.py` (18 assertions, all break-tested, wired into CI).

**Open for Dan:** LexicaLater's popup is five paragraphs, because it is that
game's existing ⋯ → Help text unedited. It reads long as an arrival card. Say
the word and it gets a short first-run version with the full text staying
behind ⋯.

## 2 Sep — CHANGE OF PLANS on the menu: popups per parent, children tabs retired

Sole editor of STATUS.md in this commit: fluoduo-main. **This supersedes part
of the six-ruling strips brief below — read this first, Pre-tests.**

Dan, on the base-bar links and the burger menu's parents: *"Each of those
links at the base as well as the parent links in the burger menu - make them
pop up a window like the one that for Menu, but with only a subset, i.e. the
relevant tiles that are under those parents. So actually we do not need
children tabs anymore."*

So the shape is now:

- **Every family link at the BASE BAR** (the phone bottom bar's 🎯 🏋️ 🎮 🔄 💬
  icons) and **every PARENT row in the ☰ menu** opens a popup styled like the
  Menu one (MenuSplash's tile window), **filtered to that parent's tiles
  only** — Practice's link opens a window of just Practice's activities, and
  so on.
- **Children tabs/flaps are retired entirely.** With them go the rulings that
  existed only to dress them: no-tail-slack (2) and same-left-edge-shorter
  (5) from the brief below are MOOT.
- What survives of that brief, applying now to the parents and the popup
  tiles: black font on pale washes (1), the MneMemo/MémoiRecall renames (3),
  no white backdrop behind an open panel (4), FluOLinGo Hand for the labels
  (6).

**SETTLED, 2 Sep (Dan: "ok agreed with all of that") — the grouping the
popups open onto.** Drawn at
https://claude.ai/code/artifact/63efcda1-2d00-47f3-a35c-c838af151a51 ("Six
Doors, Fourteen Tiles"). The decisions, each Dan's:

- **One tile moves: ConjugaZone → Practice** (a forms drill, not
  communication). Everything else stays where it is; no renames, keys and
  routes untouched.
- **Tools split (Dan: "some of these (e.g. VoixLa) are better classified as
  tools right")**: VoixLà and ChaTutor sit in a dashed OUTILS row at the
  bottom of the Skills popup — greyed, unbadged, consulted-not-completed.
  The test: rounds + finish line + grade = trainer; none of those = tool.
- **Skill badges on trainers**: small pills — 🎧 écouter, 🎙️ parler,
  ✍️ écrire — only where the activity actually grades that skill; two-skill
  tiles wear both (ÉcouTexte 🎧✍️). **No 📖 badge**: Dan caught that the app
  has no reading activity ("but there is no LIRE?") — the badge returns the
  day one ships, never stretched onto flashcards before then.
- **Practice and Revise stay separate doors** — their questions differ, and
  Revise is the only door with a deadline: its popup wears the due count on
  its face ("3 due today").
- **🎯 Goals opens no popup** — it goes to the current stop (Continue); the
  path has no tiles.

Roadmap items recorded, not in this build: a READING activity (ÉcouTexte's
sibling with the text on screen — the one untrained skill), and AMBIENT
TOOLS (ChaTutor as a floating consult, VoixLà summonable wherever French is
typed; the OUTILS row is the address, not the life).

**Amendment to AMBIENT TOOLS (Dan, 5 Sep): the voice corrects FIRST.**
Shown the hand-off mock (ComposeIt's sentence pre-filled into VoixLà's box),
Dan: *"the bot should not be made to reinforce grammatically bad or wrongly
written French to the learner. It has to be corrected first!!"* So the flow
is check → show the corrected sentence leading, the learner's slip marked
beneath → ▶ speaks ONLY the corrected form. The uncorrected sentence is
never voiced. No contradiction with the 1 Sep distractor ruling: wrong
French may be OFFERED for rejection on a card; it must never be PERFORMED
for imitation by the app's voice.

Still Pre-tests' surface — this section is the brief, not the build.

## 2 Sep — the stop BOOKMARK: the learner's word on where they are

Dan, over Home's « 46/50 » well: *"we need a way for users to book mark the
stop that they have left off, because if they have wandered out of curiosity,
it should not force them to resume at that spot. For the home page, we can
make the stop number indicator editable. For the map, could that editable
indicator be placed to the left of zoom control."*

Shipped (fluoduo-main): `fluolingo:bookmark` in lib/continuer.ts —
`nextSioId(progress, bookmarkNo?)` takes it as an argument (render paths pass
it from state; `continueSioId()` reads it at call time for handlers), so a
set bookmark IS the current stop: 🧑‍🎓, the travelled route, Continue, the
tour's Play card and the activity landing all follow it. Completing the
bookmarked stop advances the reading to the first gap after it; clearing the
field returns the computed reading. Wandering never writes it — verify87
holds that only the indicator itself calls saveBookmark. Two faces of one
component (StopBookmark): Home's hand-written well, and the map's control row
immediately left of the zoom cluster.

## 2 Sep, later still — MémoiRecall's « Flip » button, and the card underneath it

Dan: *"there is a redundant button called FLIP which is not working and which
we don't even need."* Right on both counts and the second explains the first:
the footer CTA said « Flip » and tapping the card did the same thing, on the
one activity named for that gesture — so whichever one he used, the other
looked inert. Driven in the real app it does flip; the fault is that there are
two controls for one action.

Removing it exposed what it had been covering: the card was a
`<div role="button">` with an onClick, **no tabIndex and no key handler** —
not a button. A keyboard could neither reach it nor fire it, and nobody
noticed because DrillShell binds Enter to the CTA. With the CTA gone the card
is the only way to turn one over, so it is a real `<button>` now: focus,
Enter, Space and the role come free, and its label says which way it will go.
Verified by driving it — Tab reaches the card, Enter and Space both flip.

`verify27 §14g` pins all three (no Flip CTA, no hand-rolled role=button, the
card is a `<button>` wired to onFlip), break-tested. `verify20` named « Flip »
alongside « ✓ I know it » and « ↺ To review » as the study CTAs; rewritten
naming the supersession — those two are self-marks and « Flip » never was.

**Closed 3 Sep:** Variant B shipped — a quiet ↻ chip on the front Face
(paper-raised, ink hairline). See the 3 Sep quick-wins entry.

## 2 Sep, later — the (?) leaves the deck band

Dan, looking at seven bands side by side: *"what is with the question mark on
the deck strip"*. It mounted `HelpDot`, whose docstring says it is for pages
OUTSIDE the CahierShell — the immersive games, which have no ☰ — and it opens
MenuSplash. The ☰ two centimetres above it opens MenuSplash too, from its
« MENU » row (screenshotted both ways to be sure). Two doors to one room on one
screen, and it made the deck the only band in the app with a fourth thing on it.

The `trailing` slot went with it rather than just its occupant: a slot that
exists is a slot that gets filled, and the band's whole claim is that it is the
same three parts everywhere. No caller was left. verify82 now pins the band at
three parts (2 assertions, break-tested); SectionBand keeps its own `trailing`,
which is a different component with real callers.

## 2 Sep — one page shape, and every band on one edge

Sole editor of STATUS.md in this commit: Pre-tests.

The 1 Sep audit fixed each page and left the site un-uniform, because "visual
unity" is not a property any single screen has — it exists only BETWEEN
screens, and every check we had read one page at a time. Swept across all 134
exported routes, the heading band was drawn at **two lefts (6px and 19px) and
two tops (49 and 57)**. Dan, shown the three ways to converge: *"Ok move all
to A"* — A being the 19px page-on-a-desk that 114 routes already had.

Two causes, both removed:

- **`nested` in CahierShell**, computed `context.length > 0` — a page was
  drawn as a sheet inside a parent sheet BECAUSE IT CARRIED ITS OWN TAB STRIP.
  That is an accident of how flaps are counted, not a statement about
  hierarchy, and it caught **91 routes, 90 of them pre-tests**, which are
  inside nothing. They paid 48px of a 430px screen and — because the bar was
  drawn `{!nested && <BottomBar />}` — their entire bottom navigation. Nothing
  ever passed the flag and nothing renders a CahierShell inside another, so
  the stack branch had no caller to serve. `.cahier-stack` /
  `.cahier-stack--inner` in globals.css are now used only by Flip It's
  CahierFrame; left alone rather than deleted in this pass.
- **A drill had no desk.** DrillShell's root was the viewport, so its spine
  started at x=0. New `.cahier-drilldesk` gives it the page desk's two numbers
  — `.cahier-desk`'s 8px above and `.cahier-deskrow`'s gutter — and *nothing
  else*: a drill is exactly one screen and cannot spare the 64px of desk below
  that a page gets. verify82 recomputes both from their one home rather than
  restating them, because a third spelling of those numbers is how the two
  edges came apart in the first place.

Re-swept after: **121 banded routes, one regime — h47, top 57, left 19, ✕ at
31.** The 13 without a band are the full-screen games, /hidden/*, and
/moi/historique.

Also: **the second study–test switch.** Dan's 1 Sep ruling was found on the
deck table and missed on Flip It, so for a day the app shipped the new pill on
one screen and the old bare knob with « Study » printed beside it on the
other — the same between-screens shape as the sweep above. Both are PillSwitch
now, and verify80 pins it by shape so the next hand-rolled one fails.

Rewritten naming their supersession: `verify20` (its viewport lock read
`h-dvh` on the drill's own root; the height is the wrapper's now, and it
asserts both ends because either alone passes on a broken pair), `verify82`
(§6's well-padding regex named the `nested` ternary; §8 is new — 7 assertions,
all break-tested), `verify80` (§7 new, 4 assertions, break-tested).

**Open for Dan:** the drill's desk shows grey on the left and above only —
below and right it runs to the viewport edge, because a drill's footer tray is
pinned to the bottom of the screen. Deliberate, and it reads as paper sliding
off the bottom of the desk rather than lying on it. If he wants the desk all
the way round, a drill loses ~72px of its one screen.


## 2 Sep, small hours — Dan's five rulings on the coloured strips (PRE-TESTS' pass)

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan reviewed the in-flight coloured rail/dropdown (Pre-tests' local build,
the dopamine direction) and gave five rulings, routed here because the
surface is that lane's active flight — fluoduo-main is deliberately not
touching it:

1. **Black font where the wash is pale.** The children share their parent's
   hue by design (all three visible were Practice's) — that stays; but pale
   rows take a BLACK font ("they might be better with black font instead").
   Parents may keep light text only where contrast genuinely holds.
2. **No tail slack.** A flap is as long as the longest label among its
   siblings and no longer — "tighten up the space so that they don't occupy
   so much space when opened up."
3. **The renames stand**: MneMemo (was Memo) and MémoiRecall (was 4Mémoire),
   already in fcc58d4 — display names only, keys `lesson`/`flip` untouched,
   per the Memo-rename precedent in AGENTS.md.
4. **No white backdrop behind the flaps** — "or else it looks unreal." The
   open menu's panel takes paper, not white.
5. **Children start at the SAME left edge as parents and end SHORTER** —
   hierarchy by length, not indent. This supersedes the indent approach in
   PR #142 (closed as superseded); the one thing to carry over from it: the
   child dress must apply in the DROPDOWN too, not only under `.cahier-tabs`
   — the scoping bug behind Dan's "camouflaged among the parents".
6. **The tab labels take FluOLinGo Hand** ("oh use FluOLinGo font for those
   tabs!") — `.fluo-band-hand`, the same stack the band and the map's legend
   sentence wear.
## 1 Sep, late — the chrome audit, and the strips become one strip

Sole editor of STATUS.md in this commit: Pre-tests.

Dan went through the app screen by screen and reported four faults; three of
them turned out to be ONE. A page's `active` key becomes a family through
`familyOf`, and a null family costs it the spine (`[class*="fam-"]`), the
family ink AND the heading band (CahierShell renders it `{famKey && …}`) all at
once. Six keys had no entry and Settings passed `active=""`. Measured before:
six pages with no strip and five different heading heights. The spine also
never reached DrillShell — the rule named `.cahier-page` and the drill root is
not one, so every drill carried the right class and drew nothing.

Then a second round of rulings on the strips themselves:

- **One line, one thickness.** Every band is now 47px, activity name first,
  then the goal tag inline: « 4Mémoire · GOAL 39/50 · Wants & needs ». The
  stacked title-over-sub made bands 55px or 41px depending on whether a page
  had a sub-line.
- **No number at the end.** The chip was three different figures wearing one
  shape — a drill's i/total, the profile's outcomes, a deck page's (?) —
  which is not a figure anyone can read.
- **« GOAL », not « stop »**, everywhere a learner reads it before a number
  (verify82 scans for it rather than listing the sites).
- **The study–test switch is the map's switch.** Both are now
  `components/PillSwitch.tsx`; the deck's version was an emoji knob plus a
  word beside it, saying one thing twice in 96px.
- **Profil is in the family system** (Dan: "i say touch Profil please"), and
  the deck's « ← Back » row and the Unit-0 pre-test's SectionBand are page
  bands. Home's rainbow hero is the one strip left out, by Dan's own exemption.

New: `lib/stopTag.ts` (which absorbed FIVE hand-written copies of the deck →
goal lookup), `components/PillSwitch.tsx`, `verify82`. Rewritten naming their
supersession: `verify68` (it named ProfileContent as a file that hand-rolls a
band; it stopped), `verify25b`, `verify25c`, `verify80`.

**Open for Dan:** at 320px four bands truncate the goal's NAME with an
ellipsis — the activity and the number always survive, which is the priority
order, but he may want the name dropped below some width instead. And Profil's
band no longer shows the signed-in name (the rule says the activity's name);
its ground is now the user family's pale pink.

## 2 Sep — Map of FluOLinGo-land (Dan's spec, executed same hour)

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan's 2 Sep map rulings, all in one PR: /map's band reads « Map of
FluOLinGo-land » over one legend-carrying sentence; ONE fixed control row
(2D⇄3D switch left, zoom right — migrated up from under the map) that never
moves between views; the 2D view is Map2DGrid — ten rows of five, all fifty
stops at a glance, units told apart by colour bands, not names; the U0–U4
jump chips deleted; the unit panel under the map RETIRED (Dan, over the
Unité 0 tile grid: "we don't need this anymore … delete it") — a stop opens
StopPopup directly, one popup for all fifty, lifted out of UnitSection.
Home's switch no longer navigates (1 Sep "takes you to the map" superseded
by 2 Sep "this needs to stay on screen when users tap 2D>3D>2D"): the
postcard flips in place, the hero never moves. verify25b/25c/80 re-pointed
with the new rulings written in. UnitSection/Unit0Panel are now unmounted
on /map — files kept this PR (Unit0Pretest still imports one, four checks
pin them); their deletion is queued integration cleanup.

## 1 Sep, night — the wrong answers, and Home's switch actually opens the map

Sole editor of STATUS.md in this commit: Pre-tests.

Two rounds of Dan's corrections on the same evening, one branch
(`claude/lesson-files-025-038-039`, restarted off `main` after #125 merged).

**The wrong answers on `envies-besoins` could be right.** Every cloze surface
builds its decoys from the deck's OTHER gap words — correct for « du / de la /
des », wrong here: « Je ___ visiter Paris » marked `veux` correct and offered
`voudrais`, which is good French differing only in register. Four of ten cards
could mark a learner wrong for knowing more. Dan's fix, verbatim: *"i would
make the wrong answers veut and voudrait"* — third person, wrong on agreement
after « Je », and unable to collide with each other. Then, seeing the fixed
card: *"i would put besoin and rêve instead of envie and aimerais (which start
with vowels)"* — a vowel-initial decoy is wrong on ELISION before it is wrong
about wanting and needing, so a learner rejects it having understood nothing.
Both rules now live in one new deck field, `gapDecoys` (schema.ts), read by one
new helper, `gapDecoyPool` (gapSentence.ts), which **three** surfaces now share
— the pager's ★ MCQ, the pager's ★★ word bank and GramMarathon's — because
each derived that pool for itself and this deck could have been corrected in
one and stayed broken in the other two. Every other deck is byte-for-byte
unchanged: absent `gapDecoys`, the pool is the deck's own gaps.

**Home's view switch.** Dan: *"transfer the labels of the 3D switch into the
switch itself … move it to the left under the 4/30 … swap the positions of the
four buttons and the next stop's name … and make sure the switch literally
takes you the map it promises to."* All four done. The last one was a real
defect: Home's switch started at 2D on every visit whatever the learner had
chosen, and its map link carried `?view=2d`, which /map then SAVED — so
choosing 3D on the map, going Home and coming back put you in 2D, changed by a
control that looked like it was only reporting the state. New `lib/mapView.ts`
holds the key, the reader, the writer and the href builder for the three
surfaces that set this view; flipping the switch now saves the choice and opens
the map in it.

**Handover to fluoduo-main.** Branch `claude/lesson-files-025-038-039`, three
commits off `7787fad8`. Two lots in one branch, splittable at the commit
boundary:
- *decoys* — `src/lib/collections/schema.ts`, `gapSentence.ts`,
  `src/app/lessons/pager/buildCards.tsx`, `GramMarathonContent.tsx`,
  `src/content/collections/envies-besoins.json`, `verify76`.
- *Home* — `src/app/HomeDashboard.tsx`, `src/app/map/MapBody.tsx`,
  `src/lib/mapView.ts`, `verify25b`, `verify25c`, `verify80`, `verify.yml`.

Shared files anyone else may be in: `buildCards.tsx`, `HomeDashboard.tsx`,
`MapBody.tsx`, `verify25b/25c`, `.github/workflows/verify.yml`.

**⚠ A verify-number collision that is NOT ours to fix.**
`verify76-envies-besoins.py` has been on `main` since #125 (`aae60c0`);
`origin/claude/peers-vd2h6h` carries `verify76-two-tier3-stops.py`. Two checks
sharing a leading number fails `verify-wiring.py`, so that branch cannot merge
until it renumbers — 80 is now taken too, so **81 up is free**. Flagged rather
than renumbered: ours is already on main, and renumbering a merged check is
how the 31/52/60 collisions turned into two problems each.

**Open with Dan, unchanged from this morning:** whether SIO-025 gets a lesson
after all; whether SIO-022's ×6 possessives drill should be re-homed (it died
with iComplete); whether `SessionReceipt` + `useRunXp` should be re-hosted (0
hosts since #125's parent); and whether Facile's four leading MCQ cards should
stay, given its blurb still reads "Sort the words into order".

**The cycling redo — DONE, and it was not a re-skin.** Decision 4 asked for the
fluency-cycling animation rebuilt in FluOLinGo Hand. The 30 Aug cut ended on
`Fluolingo`, all lowercase — a spelling THE NAMES RULE killed the next day. So
the show gains a sixth stage, and the capitals are its point rather than its
styling: up to the merge it is the spaces that mark the four words, and closing
them is both what makes the name and what would throw the four words away.
`Fluolingo` is one word; `FluOLinGo` is still four.

    Fluency {achieved} on {customisable} linguistic goals
      -> Fluency on linguistic goals -> Flu on lin go -> Flu o lin go
      -> Fluolingo -> FluOLinGo

Dan's 30 Aug arithmetic carries over intact (stage table, beats, the growing
cycle intervals that ARE the deceleration, and the rule that a dead letter
takes no width and sits on the seam it closed); `phaseAt` is new, so a renderer
cannot answer "which stage am I between?" in its own `if` ladder and drift —
which is what let the earlier cut rest on `Flu   o   lin   go` with holes in
it. New files: `src/lib/fluolingoOrigin.ts` (data + arithmetic, no DOM),
`src/components/FluolingoOrigin.tsx` (pixels only), `/hidden/fluolingo`
(noindex) to watch it on, `verify81` (executes the spec; 13 sabotages, all
caught). **Where it belongs is Dan's call** — it is on its own page and nothing
else mounts it. Neither 30 Aug branch was merged; both can be deleted once Dan
has seen this.

**Pre-tests' queue is now empty.**

## 1 Sep evening — SIO-039 lands, SIO-025 is ruled, and live is at #124

Sole editor of STATUS.md in this commit: fluoduo-main.

Three merges this round, and a deploy that happened from Dan's side:

- **#125 (`aae60c0`) — SIO-039 « Envies et besoins » has its lesson.** Ten
  cards, five frames, and the two things the deck demonstrates but never
  states: the bare/`de` split (« Je voudrais un plan » against « J'ai besoin
  d'un plan », 6–4 exactly along that line) and the politeness scale. Concept
  slot left EMPTY — that is Color review's to fill, per the handover.
  verify76 executes the generator 4000 times rather than regex-reading it.
  Screenshots taken at QC: Forms carries the frames, Idea correctly shows the
  empty-concept placeholder.
  - **SIO-038 stood down in the same PR** — Pre-tests' pre-flight scan found
    Peers had built it eight hours before the split assigned it (the #97
    collision shape, caught mid-work this time, which is the scan doing its
    job).
  - **SIO-025 is ruled a NON-gap, with the reasoning written into verify51**:
    both halves already taught; every candidate concept needs French the deck
    does not contain, so a lesson would be a slot filled rather than a claim
    made. It stays out unless Dan overrules. The QC merge left verify51's
    no-lesson loop holding SIO-025 alone — 038 and 039 both came out on 1 Sep.
  - **Pre-tests' queue is now just the cycling redo** (FluOLinGo Hand font).
- **#126 (`f873e91`) — docs/DEPLOY_PULL_SETUP.md**, the pull-direction deploy
  for dckg/fluo. One correction to its premise, from Dan after it merged: the
  PAT was minted **signed in as dckg**, not frenchprof — so the doc's
  diagnosis of runs 2–6 is wrong, though its three setup steps remain valid
  as the pull-direction alternative.
- **#127 (`ef6bacc`) — deploy-live now diagnoses its own failure.** Run 7
  (fired after Dan's correction) still died on `remote: Repository not
  found`, which is ONE message for three faults: secret empty/missing on
  frenchprof/fluoduo (an empty token pushes anonymously; a private repo 404s
  strangers), token dead, or token not granted dckg/fluo. A step now checks
  each in turn and names the one that holds, printing only the login the
  token authenticates as. The next run answers the question instead of
  repeating it.
- **Live is at `09539b5` (#124)** — Dan deployed ~17:21Z; the Cloudflare
  build log confirms 751 pages, functions uploaded, published. Not yet live:
  `f873e91`/`aae60c0`/`ef6bacc`, of which **the SIO-039 lesson is the one a
  learner can see**. One more deploy (Dan's three commands, or deploy-live
  once the token fault is fixed) picks all three up.

## 1 Sep, later — the jam scan goes to CI, and decision 8 comes off the shelf

Sole editor of STATUS.md in this commit: fluoduo-main.

Two rulings from Dan, same message:

- **"The jam sweep should be in CI. It's the only instrument that catches
  that class."** Done — PR #130: `scripts/jam-scan.mjs` (the browser scan
  verify72's docstring promised, now committed instead of living in one
  session's scratchpad), run by verify79 against an open rebuild that
  verify.yml does LAST, after the wall build verify18/18b audit. verify38
  grew one precise exemption for that line, with assertions that keep it
  precise. **Its first run found three jams live on main** — « à lagare »,
  « aumusée » (le-chemin), "whatyou" (transport), all three with a same-line
  source space the compiler dropped — fixed in the same PR. Number 79 claimed
  after the remote sweep; Peers holds 77/78 in flight.
- **Decision 8 — `rule:` namespace tagging of the 894 items — is back on the
  radar.** It was parked "until the concepts finish"; at 45 of 52 that is
  close enough (Dan, 1 Sep). Not yet assigned to a lane: it wants Dan's
  shape-of-the-tagging ruling first, and Color review is the natural owner
  once the last 8 Tier-3 concepts land.

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan annotated the live Home (screenshot in the fluoduo-main session, 09:53
local) with eight numbered notes and said *"divide the labour to do this."*
The division is BY SURFACE, one session per file cluster, because 31 Aug
proved two sessions in one file is how afternoons are lost.

**LOT A — Home + top bar rework → PRE-TESTS session** (lane free since #104
and #107 merged; files: `SiteTopBar.tsx`, `HomeDashboard.tsx`, verify25/31
updates). Dan's notes, verbatim where legible:

1. *"The top return link to be in the same FluOLinGo font but with the
   KALLANG wave effect and irregular highlighter movement"* — Dan clarified
   1 Sep: **the Kallang Wave**, the stadium crowd wave (Singapore's National
   Stadium). The top bar's FluOLinGo wordmark takes the Hand font and its
   LETTERS rise and dip in sequence, one after another, like a crowd wave
   rolling through — the hero brand already renders one span per character
   (HomeDashboard splits the string), so the same structure animates it.
   The highlighter behind it moves irregularly, like a real marker's sweep.
   Respect prefers-reduced-motion: the wave stills, the wordmark stays.
2. *"The hero to be in FluOLinGo font and resized relative to the width of
   the window"* — « Bienvenue sur FluOLinGo » in FluOLinGo Hand, sized with
   a viewport-relative clamp, not a fixed step.
3. *"Just 1/50 (nothing else)"* — the stop tile loses the word STOP and the
   dot row; the fraction alone.
4. *"Move the streak value and emoji up between History and User"* — the
   🔥 count leaves the tile row and docks in the top bar between ⌛ and the
   account button; the streak tile goes.
5. *"Add a forward button (= Next stop)"* — a ⏭ key beside Continue ▶,
   opening the stop AFTER the current one. Mind verify25's drawn-key rule:
   draw it as an SVG key like its siblings, no typed transport character.
6. *"Close the gap more"* — the space between the hero band and the key row
   shrinks further (the hero's mb-5 and whatever the row adds above).

**LOT B — prominent 2D/3D → FLUODUO-MAIN** (files: the Home map card /
`HomeMap*`; the map area is integration's from #103): *"More prominent 2-D
and 3-D view buttons"* — Dan mocked two big colour-filled buttons (cyan 2D,
magenta 3D). Build to his mock, show before/after.

**Untouched queues:** Peers keeps the DrillShell chrome fold + the Practice
hub; Color review stays on concepts. Lot A lands as ONE PR to fluoduo-main;
every visible change ships with its picture, per the rule.

## 31 Aug evening — Dan cleared the decision queue

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan answered eight of the nine standing decisions in one sitting. The rulings,
each with its consequence:

1. **DrillShell chrome → PEERS' NEXT ASSIGNMENT.** Color review measured
   270px of chrome before the first word of French on a lesson at 390×844
   (site bar 48 + Memo band 55 + ✕/score bar 56 + gap 24 + tab rail 83), with
   ~111px recoverable: on tabs with NO progress the 56px DrillShell bar holds
   ✕, an empty `flex-1` spacer, and a score of 0. **The job:** fold the ✕ and
   the score into the Memo band; render the 56px bar only where progress
   exists; drop the 24px gap under it. **The trap:** DrillShell is shared by
   28 surfaces where the bar is load-bearing — the no-progress path must be a
   separate branch of the code, and every DrillShell surface gets a
   before/after screenshot. Acceptance: the ✕ and score live in the band; no
   56px bar on progress-less tabs; 28 screenshots clean.
2. **Practice family opens a HUB, not the map — PEERS, second item.** Dan:
   *"Practice flap cannot open to the map, instead it must open to a hub page
   that contain links to all the practice elements possible, from which we
   can go to the stops in the map (i.e. it should bypass the map)."* So
   `/practice` becomes a FamilyHub (the /games · /skills pattern,
   verify52's), FAMILIES.practice.href moves off /map, and verify19/24/52's
   "Practice reaches the map" pins are REWRITTEN, not silenced. The ☰'s
   Carte row STAYS — with Practice no longer opening the map it is the
   dropdown's only map door, so the duplication that condemned it is gone.
3. **Deploys go through fluoduo-main** (decision 9). To make that real this
   session needs a **fine-grained PAT with write access to `dckg/fluo`
   only**, stored as an Actions secret on frenchprof/fluoduo — Dan's to
   mint. Until it exists, deploys stay Dan's three commands.
4. **Revise keeps 🔄** — "They are different characters indeed." The 🔁 ban
   stands; the case is closed.
5. **Font branch: salvaged and approved for delete.** Its one commit (the
   nine OTF weights + build script) is ALREADY on main as #95, so nothing is
   lost. Deleting remote branches is blocked from this environment — Dan:
   `git push origin --delete claude/complete-font-characters-b9oz2p`.
6. **Home-rebuild branch (decision 3): already gone** — deleted in an
   earlier sweep. Closed.
7. **Cycling (decision 4): to be REDONE in FluOLinGo Hand.** The two 30 Aug
   branches are superseded but stay until the redo lands. Unassigned.
8. **French 4 (decision 5): rebased to PR #112** — the plan + the A2 CSV on
   today's main, stale STATUS hunks dropped. **Awaits Dan's read**; CI green
   is not the gate.
9. **The lint six: reasoned disables** (this commit) — each of the five
   hook-deps warnings and the SpecuLearn `<img>` carries the reason the
   working behaviour wins, in the AGENTS.md-sanctioned pattern. `npx eslint`
   on those five files: 0 problems.

Still open: **decision 8 only** (the `rule:` namespace) — parked by design
until the concepts finish.

## 31 Aug PM — THE NAMES ARE LAW (#109), and the tab strip is one row (#108)

Sole editor of STATUS.md in this commit: fluoduo-main.

Two more of Dan's rulings landed the same evening, both driven by pictures:

- **#108** (`51eb067`): the lesson's four tabs fit ONE row. The wrap was 4px
  of six-tab-era padding; the strip is now a four-column grid, wearing the
  emoji Dan sent: ➡️ Path · 💡 Idea · 📐 Forms · 🏋️ Pract.
- **#109** (`66faa42`): a **permanent rule in AGENTS.md** — the brand is
  **FluOLinGo** (capitals F·O·L·G, Fluency On Linguistic Goals) and the six
  families are 🎯 Goals · 🏋️ Practice · 🎮 Games · 🔄 Revise · 💬 Skills ·
  👤 User. SvPlay → Games; Home's hero key is **Continue** (né Play), so no
  two doors share a name. Registry keys unchanged. Found en route:
  RailGroups and GuideBody carried private copies of familyShort's regex —
  consolidated onto the helper.

**DEPLOYED.** Dan pushed `live main` the same evening — production (`dckg/fluo`)
is at `66faa42`, carrying the whole day: #94 · #97 · #98 · #99 · #100 · #101 ·
#102 · #103 · #105 · #106 · #108 · #109. Nothing on origin/main is undeployed
except this STATUS entry itself.

**Awaiting Dan's read on the live site:** the one-row tab strip, the FluOLinGo
respelling, the new family icons, and the two French forms in the salutations
concept (« bonne soirée », « bon appétit »).

## 31 Aug PM — #100 MERGED; decision 1 is RESOLVED

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan: *"I m READY to merge."* PR #100 (Color review's Tier-3 redraft + the
27% concept-page cut + Tier 1 batch 1) is squash-merged as `9a3c67b` —
today's ninth merge. **Decision 1 is answered: the Tier-3 shape holds**, so
both drafting lanes are unlocked — Tier 1's remaining 14 concepts and the
Tier-3 batch of 8 phrase stops, batches of five, every batch read by Dan
before ship.

The one merge conflict (LessonTabs' "How to decide") resolved to Peers'
`Section` fold rather than #100's raw `<details>` — same collapse, but the
closed fold names its count, per the collapse rule. verify67's flow
assertions were amended to guard the same claim through the component, and
fold notes gained a `count()` pluralizer ("1 step", not "1 steps").

**Dan's two follow-ups:** deploy (`git pull && git push live main` — nine
merges are waiting), and a native-speaker read of `bonne soirée` (new) and
`bon appétit` (atelier 50) in the shipped salutations concept.

## 31 Aug — the Tier 3 concept, redrafted on Dan's ruling

**Dan overruled the first draft, and he was right.** I had built it on one line
from `SYLLABUS_TIERS.md` — *"analysing them into parts is actively wrong at this
level"* — and read it as a ban on all form analysis at a phrase stop. It is not.
Its own example says what it means: « il fait beau » is not IL + FAIRE + BEAU.
That is a claim about **opaque** blocks. Dan, 31 Aug: *"B is not out. it is every
bit valid… this is basic enough analysis."*

So the Tier 3 shape is **not** "moment instead of form". It is:

- **transparent block** → the form pattern AND the moment;
- **opaque block** (« il fait beau », « ça va ») → the moment only.

### What the redraft argues

*Why it is bonjour but bonne nuit.* `le jour`/`le soir` are masculine → `bon`;
`la journée`/`la nuit` are feminine → `bonne`. **All four are already in this
stop**, so the whole contrast sits inside the lesson.

It is **generative**, which the first draft was not: the rule hands the learner
`bonne soirée` untaught, and `bon appétit`, `bonne chance`, `bon voyage` when
atelier 30 and 50 arrive. The first draft described eleven blocks; this one
explains one rule.

Two of the first draft's three pitfall rows **repeated the Mémo's own warning
box** ("Salut ! = hello AND bye"; "Bonne nuit ! only at bedtime"). Dan's litmus
test, pointed at my own work. Gone; the rows now show the agreement error, which
the Mémo does not cover.

### The page was too long — measured, not estimated

Dan: *"it is a very long page, can we make the answer collapsible"*. At 390×844
the concept ran **1512px in a 561px slot — 2.70 screens**.

Collapsing the answer alone bought only 2.70 → 2.39. So every section was
measured, and there was no single villain: contrast 23%, decision tree 19%,
summaries 19%, checks 18%. It was long because it had six blocks, not one fat
one. Three changes, **1111px — 1.98 screens, a 27% cut**:

- the **answer** collapses behind the question (the WHY-button shape Dan settled
  on 2026-07-02: on demand, never inline by default);
- the **decision tree** collapses behind "Show the steps" — a tree is consulted,
  not read;
- **`inShort` dropped** from salutations: it said "bon + masculine · bonne +
  feminine" and `remember` said the same, better.

`<details>`, not React state, so the export ships collapsed and no learner on a
slow phone sees the answer flash open then shut. Same idiom the mini-checks
already use.

**This changes all fifteen concepts**, since the collapse is in the shared
renderer. All fifteen re-rendered and scanned: clean.

### A fault the page-level check could not see

The flow box ran past the right edge at 390px — a decision rule the learner had
to scroll sideways to finish. My earlier "no horizontal overflow" was true of
the PAGE and false of that box, which scrolls inside itself; I reported the
page-level result as if it settled it. Fixed by one example per line.

`verify67-concept-length.py` pins both disclosures. **Break-tested on seven
mutations; two were green on the first pass** — `wrapping_details` took the
nearest PRECEDING `<details>`, so an earlier disclosure that had already closed
made any block look wrapped (un-collapsing the flow stayed green); and deleting
a `<summary>` left the control labelled by the browser's own default. Both
closed.

**Still Dan's to approve:** `bonne soirée` (new to the app) and `bon appétit`
(already in atelier 50) appear as predicted forms.

## THE ROSTER (31 Aug 2026) — lanes, rules, and the decision queue

### FOR COLOR REVIEW, FIRST — the icon colours are to be REDONE (Dan, 6 Sep, direct)

Dan has told Color review directly to redo the colours, and pasted the spec
sheet in the fluoduo-main session; this transcribes it so the file you read
first carries it. It shows the notebook "C" icon in TWELVE colourways — six
pen-dominant (top row) and six complement-dominant (bottom row) — on paper
and on dark:

    pen-dominant:        Pink #ff4eb2 · Orange #ff9037 · Yellow #fcdf00
                         · Green #00dd3e · Blue #1ca6ff · Violet #b17eff
    complement-dominant: Teal #00c197 · Sky #00b2f6 · Periwinkle #9398ff
                         · Magenta #f350ff · Amber #e88c00 · Olive #98b300

The design rule on the sheet: **the C needs two things at once — the L-block
and the top-right block close enough to fuse into one stroke, and both far
enough from the paper to be seen at all.** Judged by eye first, corrected by
measurement twice. Measured block-vs-paper / tint-vs-paper / block-vs-tint,
the notable rows: Pink 2.79/1.48/1.89 is the strongest block; Sky's orange
mouth on a blue letter is the cleanest pair; Teal's pink mouth the best
reversal by eye; **Yellow 1.24/1.13/1.10 is the weak one — fuses perfectly,
then vanishes into the page**; Green is faint on paper with the palest tint
(1.09). Periwinkle and Amber hold (mid-pack, not the weak ones first
called). This supersedes prior icon-colour work where they disagree; Dan's
words in his own brief to you are the authority on scope.

### The ladder was built TWICE in one evening — the routing whiplash did it (7 Sep)

The routing below moved three times in hours, and the cost arrived on
schedule: Peers, briefed before the take-back, built the streak ladder on
their branch (PR 207) while fluoduo-main built it on feat/streak-ladder —
same rungs, same algorithm, different names. Assertion 4 flagged the
verify-number half at push time (110 twice); the FUNCTION half no scan can
see, exactly like blankKeysFor on 31 Aug. Resolved in the PR-207 QC merge:
main's names stay (`FIRE_LADDER`/`nextFireMilestone`), Peers' ×3-ceiling
rationale is grafted into the comment, their RewardToast fix is kept — they
caught that the streak toast's fallback line "Come back tomorrow to keep it"
is loss-framed (KEEP is a thing you can lose) and verify32's word list had
missed it — and their 3D-map stops work lands untouched. The lesson is the
31 Aug lesson again: when a brief moves between lanes mid-evening, the OLD
assignee must be told to stand down in the same breath — the brief edit
landed on main before Peers pushed, but nothing pinged them.

### The three retention builds — ALL TAKEN BY FLUODUO-MAIN (final routing, 7 Sep)

The routing moved three times in one evening, on Dan's word each time, and
this is where it ended: Color review ("no time") → Peers ("rope in peers") →
Peers is busy, so **fluoduo-main built all three** on `feat/streak-ladder`
(one PR: the ladder, the forever key, you-vs-last-week; checks verify111, 112,
113 — the ladder check was born 110 and renumbered at the gate: assertion 4
caught verify110-finale-colours in flight on Peers' branch, the first live
catch at push time). Nothing below is anyone's to build any more — it is a record of
what shipped and why. Color review: verify numbers 111-113 are taken (110 is
peers-finale-colours'), so 114+ look free.

Background: Dan sent a video on the three retention machines consumer apps
run (unpredictable rewards / the infinite game / social scoreboards). Five
options were put to him; the three below are now Peers' lane. Of the
other two, the bonus-gems idea was picked by Dan directly in Peers' session
and is BUILT (the lucky find, #202 — do not build it again; its colour rules
live in verify109); the Finch-style companion remains NOT approved.

THE ETHICS FLOOR IS LAW on all three: nothing loss-framed (verify32 greps
for the phrases and fails the build), effort never punished, nothing locked,
delight never delays a cold guess (UI_POLICE 79-80). These builds add reasons
to come back, never fear of staying away.

**1 · The streak ladder grows past day 7.** Built — `xpMultiplier` in
`src/lib/economy.ts` is ×1 → ×1.5 (day 3) → ×2 (day 7) and then flat
forever: day 40 pays what day 7 pays. Extend it — e.g. ×2.5 at 14 and ×3 at
30, numbers yours to tune — and make the NEXT milestone visible wherever the
multiplier already shows (the +XP float prints the arithmetic, `XpFloat.tsx`;
the streak mark sits in `SiteTopBar.tsx`). Gain-framed only: "day 14 pays
×2.5", never "don't break it". The 30-day badge (`inarretable`) already
exists — the ladder step should agree with it.

**2 · "The course ends; the French doesn't."** « Diplômé » at 50/50 is a
correct terminal state — LAF1201 is a semester course — but nothing tells a
finished learner that the revise deck is the forever-game (spaced repetition
generates due work indefinitely). Build the small surface that says so when
`doneSios.length >= 50`: where Continue would point at a next goal, point at
revision instead, in the app's own voice. Where it lives (Home hero /
profile / both) is your call — show Dan renders before wiring, per
show-don't-describe.

**3 · "You vs last week."** The weekly board resets Monday and the learner's
own last-week figure dies with it. `progress` carries `weekXp` + `weekKey`
(`src/lib/dayKey.ts` derives keys); keep one prior week locally and show the
comparison on the leaderboard page (`LeaderboardList.tsx` renders the
periods). Self-comparison only — no new social data, no publishing changes,
`firestore.rules` untouched. If beating last week earns anything, it earns a
chime-tier moment, not a fanfare (the ladder in `RewardToast.tsx`).

House rules that bite here: counts only where the thing counted is unseen;
no full-width single controls; English chrome (these are chrome surfaces, not
decks); relative type sizes; hand over the branch to fluoduo-main explicitly
when it is ready — files touched, shared files, known collisions. Verify
numbers: 108/109 are Peers' (#202), 107 is the landing branch's, 110 is
peers-finale-colours', 111-113 the retention builds', so 114+ look free;
assertion 4 checks your claim at push time either way.

### The Grok duty-roster proposal is DROPPED (Dan, 6 Sep)

Asked directly — "Stamp it, amend it, or drop it?" — Dan chose **Drop
it**. Things keep working as they informally do: lanes build, fluoduo-main
QCs and merges, Dan directs whichever session he is in. The proposal text
is gone from here; it lives in git history if anyone needs the wording.

### Lanes

| Agent (session) | Lane | Owns right now |
|---|---|---|
| **fluoduo-main** | **Integration** — merges, branch hygiene, verify-number renumbers, cross-session stall watch, previews for Dan, deploy shepherding | The 31 Aug cleanup sweep; this roster |
| **Color review** | **Concepts** — the tier pipeline (Tier 1 ×19, Tier 2 second half), keeper of the Stocktake ledger | **The icon-colour REDO** (Dan direct, spec transcribed below) — the retention builds moved to Peers · then the tier pipeline resumes |
| **Pre-tests** | **Pre-test surfaces** | ✅ Unit-0 pages (#98) · ✅ popup collapse (#99) · ✅ derived done-ness (#104, open) · ✅ iComplete cut + SIO-010 tabs (#107, open) · **next: Tier-1 concept batches as second capacity** |
| **Peers** | **Features** | #202 landed (`fb63da9`: tactile map, lucky find, banner colours) · retention builds re-taken by fluoduo-main (7 Sep, Dan: "he is now busy") · next assignment is Dan's |
| **Dan** | **Decisions + reads + deploys** | The queue below; every pedagogical claim is read before it ships |

### Rules every session respects

1. STATUS.md first; one editor at a time; say so in the commit (unchanged).
2. **A verify number is claimed by scanning EVERY remote branch, not main** —
   four collisions now (31, 52 ×2, 60). The command lives in AGENTS.md so it
   is read at boot. Suffixes (18b, 19c, 25b) are the sanctioned variant form.
3. **No pushing to another session's branch** without Dan's explicit word.
4. **A finished deliverable gets a PR or a STATUS row before the session
   disconnects** — a silent push-and-vanish is how La Carte and the six empty
   branches rotted.
5. Integration sweeps (branch audits, renumbers, closures) belong to
   fluoduo-main alone. If you find a cross-branch problem, write it here and
   carry on in your lane.
6. **EVERY merge goes through fluoduo-main** (Dan, 31 Aug) — including a PR
   of your own work. Open it, get CI green, leave it. A single integrator is
   what catches a collision between two branches that are each individually
   correct; no session can see that from inside its own lane. When a branch
   is ready, **hand it over explicitly** — which files it touches, which are
   shared, what you already know it collides with (`HANDOFF_PEERS_31AUG.md`
   is the model); a branch that is merely pushed has not been handed over. The merge
   mechanics — conflict resolution, verify sweeps, sequencing against
   in-flight branches — are the integration lane's; Dan still reads
   content/pedagogy and rules on decisions, and deploys stay his
   (`git push live main`) until decision 9 lands.
7. **Before opening a branch, check what is in flight on the files you are
   about to touch** — `gh pr list --state open`, then
   `git diff --name-only origin/main...origin/<branch>`. Rule 6 catches a
   collision at the merge, which is AFTER both sessions built the same thing.
   31 Aug: #97 retired iComplete at 07:11; the pre-tests session branched to
   do the same job at 07:29. Dan had told both, in different words, an hour
   apart. Thirty seconds of looking would have caught it; a merge gate would
   not have. And the file scan is not enough either: on the same day two
   branches merged cleanly into main while conflicting with EACH OTHER inside
   one function (`blankKeysFor`), where both edits were needed and dropping
   either silently inverted a lesson.
8. **A long page opens collapsed below the fold** so the whole of it fits one
   screen before anything is expanded (Dan, 31 Aug). Permanent design rule,
   written out in AGENTS.md beside the litmus test.
9. fluoduo-main sweeps session states daily; anything stalled >24h
   (a pending permission, a need-input nobody saw) is reported to Dan.



### The work, by lane (what each agent is MEANT to deliver)

- **Color review — the concept pipeline.** Updated 31 Aug PM.
  **Tier 3 shape: SETTLED.** Dan read salutations and overruled the first
  draft — form analysis is valid at a phrase stop where the block is
  TRANSPARENT (« bonne nuit » = bonne + a feminine noun); the moment alone
  only where it is OPAQUE (« il fait beau »). The redraft and the 27% page
  cut are in **#100**, awaiting fluoduo-main's merge under rule 7.
  cut **MERGED — #100, `9a3c67b`, 31 Aug PM**, Tier 1 batch 1 with it.
  **Re-audited 1 Sep from the repo, not from this list** — the counts below were
  stale in every line. The audit walks `LESSONS_BY_SIO` and looks for a
  `concept:` in each stop's lesson file. (It found its own blind spot first: the
  SIO id regex was `SIO-\d+`, which silently skips **SIO-045A** and reported
  Tier 2 one short. A scan that matches more narrowly than the thing it asserts
  invents a gap; one that matches more loosely drowns the signal. Both have now
  happened here.)

  1. ✅ **Tier 1 — 20/20. DONE.** Closed by SIO-038, whose file arrived from
     Peers (#120) and whose concept went on the same hour.
  2. ✅ **Tier 2 — 15/15. DONE.** Decision 6 resolved by #105: Colours and Some
     nouns both have files and both carry concepts. SIO-045A is mapped to
     `soixante-dix` and has one too.
  3. **Tier 3 — 8 of 15, and every gap is a MISSING FILE, not a missing
     argument.**
     - phrase stops **7 of 9** — SIO-025 (`parce-que`) and SIO-039
       (`envies-besoins`) have no lesson file. Both are job A of
       `docs/HANDOVER_LESSON_FILES.md`.
     - ateliers **1 of 6** — SIO-010 done, and it is the shape the other five
       copy. SIO-020/030/040/049/050 have no file.
  4. ✅ **The compound-names concept — DONE, and it cost the concept that was
     there.** Dan, asked where it belongs: *"put it where we learn about food
     items."* That is SIO-041, which already carried one, so *why the article
     often hides the gender* was **replaced** by *why French needs a joint where
     English just stacks nouns* — `à` puts it in (*le gâteau au chocolat*), `de`
     says what it is made of (*le jus d'orange*), and the article falls out of
     the choice. Dan saw both side by side before it shipped. `aliments.tsx`
     names the commit that removed the old one, so a revert is one lookup away.

  **CROSS-BRANCH COLLISION ON SIO-039 — for the integration lane, not this one
  (rule 5).** Two complete lessons exist for the same stop, from two lanes, and
  neither knew: `envies-besoins` (on `main`, #125) and `wants-needs`
  (`origin/claude/peers-vd2h6h`, `ea43c0d`, unmerged). Same deck, same content,
  different slug. Merging Peers' branch produces a duplicate key in
  `LESSONS_BY_SIO` and does not compile, which is how it was found.

  The fact that decides it: **`envies-besoins.json` declares
  `lessonSlug: "wants-needs"`**, so Peers' name follows the deck's own
  declaration. But `collection.lessonSlug` is read in exactly ONE place —
  `DeckContent.tsx:192`, a display string after a `·` — so nothing routes on it
  and both slugs work. **This is a naming choice, not a correctness one.**
  Cost of picking `wants-needs`: this lane's SIO-039 concept (`1979d2d`) moves
  file. Cost of picking `envies-besoins`: the deck's declaration stays wrong,
  cosmetically. This lane has NOT resolved it and aborted the merge rather than
  pick a winner.

  **THE STOCKTAKE, re-issued 2 Sep — ALL THREE TIERS COMPLETE, 50 of 50.**

  | tier | stops | concepts |
  |---|---|---|
  | 1 · Systemic Grammar | 20 | **20** |
  | 2 · Lexical Core | 15 | **15** |
  | 3 · phrase stops | 9 | **9** |
  | 3 · ateliers | 6 | **6** |

  Closed by the six that fluoduo-main unblocked in #136 — SIO-025 and the five
  remaining ateliers. Every one had been drafted on 1 Sep in
  `docs/ATELIER_CONCEPTS_DRAFT.md` against the stop's own dialogue, before the
  file existed, so landing them was a paste: **the six went in unchanged**, and
  the drafting-ahead was worth roughly a day.

  Five verify checks now assert `concept` PRESENT where they asserted it absent
  — verify74, 75, 76, 77, 83, worded identically so they read as one decision.
  Every one break-tested.

  **THIS LANE IS CLEAR — nothing outstanding, 2 Sep.** The three items that were
  open with Dan are all closed:

  - ~~**The Sum-up pane**~~ — three questions were put to him with a rendered
    A/B of each (the label « The whole system », the doubled inShort/remember
    line, and the 18-of-45 inconsistency). **Dan, 2 Sep: "drop both for now."**
    Not answered and not to be re-raised — the pane ships as it is.
  - ~~**Atelier Mémo variants**~~ — Dan floated listing "sentences used in
    dialogues **or variants of them**", with toggled English and TTS. Driving
    the app showed the Mémo already does all of that except variants: « Le
    modèle » lists every model sentence, English underneath, a 🇬🇧 toggle whose
    choice is remembered across all six ateliers (`fluolingo:atelier:en`),
    per-line TTS, and « 🔊 Tout écouter ». Variants would be new French and
    would need him. **Dropped the same day.**
  - ~~**SIO-039's slug**~~ — resolved in #136 in favour of `envies-besoins`,
    which is the file this lane's concept sits on. `wants-needs` is not on main.

  **The one thing worth carrying to whoever picks this lane up.** A pitfall
  table's wrong column is only sound when the form is IMPOSSIBLE. That is a
  question about French, so it is Dan's to answer and cannot be reasoned out
  from English — this lane guessed twice on 1–2 Sep and missed in both
  directions. It shipped six atelier tables striking through perfectly good
  French (Dan: *"i would delete this column"*), and separately flagged a sound
  strike as suspect (Dan: *"jus de l'orange is WRONG"*). Ask.

- **Pre-tests — the pre-test surface, then capacity.** ~~Unit-0 pre-test pages
  (in flight, the last uncovered pre-test surface).~~ **DONE — #98.** All ten
  now render at `/pretests/unit0/SIO-00N`; every stop in the course has a
  pre-test with a page of its own.
  **The popup collapse and derived done-ness** — two instructions Dan gave on
  31 Aug that the roster's original lane text did not list; he confirmed them
  as mine rather than leave them unowned. State as of 31 Aug PM:
  1. ✅ **DONE — #99. The popup is the statement and ONE list of links.** Dan:
     "collapse the interfaces to ONLY reveal the SIO spelled out fully, then
     the links to the relevant items within the stop. THAT IS IT." A stop had
     stacked the same activity list THREE times — the numbered path, the
     right-edge flaps, and the narrow-screen flap row — and four activities
     rendered INSIDE the popup rather than opening, so an identical-looking
     flap did two different things. Now: the statement, then one two-column
     grid of links, every row an `<a>`. SioModal 325 → 200 lines.
     The list derives from `deckActivityTabs` per stop, which is what made the
     Sorting cut (#93) free here and what carried Dan's later "iComplete does
     not have its door from here, but through Memo" for the cost of one
     `registryTab` line. Unblocked by #98: collapsing before those pages
     existed would have cost all ten Unit-0 stops their pre-test.
     Pinned by verify66 (22 checks, all break-tested); verify22, verify64 and
     verify19 were each rewritten rather than silenced when the collapse made
     their old assertions false.
  2. ⏳ **NEXT, and the last of my lane. Done-ness becomes derived; Mark as
     done is removed.** Dan: "it should
     only be marked done if it is really FULLY done, so we should remove it."
     A stop ticks when everything at it is done, so the popup's link list and
     the completion rule become the SAME list. **Grandfathered, Dan's call**:
     existing `doneSios` stand and the rule only ever adds — nobody's 34/50
     becomes 21/50 and no badge is revoked. `doneSios` is read in 14 files,
     `economy.ts`'s four badges included, so this is not a one-file change.
     Follows 1, because the link list IS the definition.
  3. ✅ **DONE — #107. iComplete's orphan route cut; SIO-010 sits all three
     audiences as tabs.** The two questions #99 left on the board, both put to
     Dan on 31 Aug and both answered.
     · *"iComplete is to be deleted, or at least converted to Intermediaire and
       Difficile within Memo."* The conversion had already landed — the Memo
       ladder's Moyen IS one-piece completion and Difficile IS two (#97) — so
       what was left was 558 lines of route nothing linked to. Deleted. A
       banked `/practice/complete-it/…` answer keeps its NAME and loses its
       LINK (`RETIRED_ROUTES` in labels.ts): a row reading "(unlabelled)" would
       erase a learner's July work, a row that linked would 404.
     · *"B — but as a choice (3 side by side tabs to tap on to display the
       different relevant content)."* SIO-010's picker scoped a run: pick one
       audience, answer its seven, done — so a learner met `tu` or `vous` and
       never the contrast, which is the entire stop. Now three tabs, all three
       sat, all three MOUNTED so switching back to compare keeps the answers.
       Two costs of that are paid rather than hoped away: the number keys are
       live only in the visible tab, and each run scopes its own
       scroll-into-view (three mounted runs made `document.querySelector` find
       the wrong one).
     Pinned by verify70 (28 checks, every one break-tested). Six suites were
     REWRITTEN rather than silenced where the deleted drill was their witness:
     verify-grading, verify20, verify28 and verify32 drop it from their tables;
     verify39 moves its session-length witness to GramMarathon, which carries
     the identical contract, so nothing is weakened; verify35 is rebuilt around
     `possessifs.tsx`, the lesson the Memo ladder teaches.

  **TWO ORPHANS THE iCOMPLETE RETIREMENT LEFT — Dan's call, not mine.** Both
  went dark on main a week ago when #97/#99 took the activity's door away;
  deleting the route made them visible, it did not create them. Neither is
  deployed yet (`live` is behind).
  · **SIO-022's ×6 possessives drill has no home.** Dan ruled GO on 24 Aug for
    all six persons: the deck's 21 nouns × je/tu/il/nous/vous/ils = 126 typed
    questions, because SIO-022's competence line promises exactly that and the
    deck alone only ever asked the 1st person. That expansion lived ONLY in
    CompleteItContent. `possessifs.tsx` teaches the paradigm and the Memo
    ladder completes sentences from it, but neither asks for the deck's own
    nouns across the persons. Re-homing it is a curriculum call.
  · **The session receipt has no host.** `SessionReceipt.tsx` + `useRunXp` are
    now referenced by nothing. Its only host was iComplete. Which run earns an
    end card is a drill-UX call; verify32 prints the host count on every run so
    it cannot go quiet again.

  4. ✅ **DONE — the ateliers' popup, which escaped #99's collapse.** Dan,
     31 Aug, looking at SIO-020: *"i would rather the SIO and the items
     (however few) not be lumped into the same space anymore."*
     `SioDetail` had four branches. #99 emptied three; the fourth fired only on
     `sio.isProduction`, so the SIX ATELIER STOPS went on printing their whole
     model dialogue — six to ten lines of French and English with play buttons
     — above the link list, for eight days, through a review and a deploy.
     **And the dialogue is that stop's pre-test answer key.** An atelier
     pre-test asks "which French line says « The flag has two colours »?" and
     offers three more lines OF THAT DIALOGUE as the wrong options
     (`pretests/ateliers.gen.ts`) — all six were on screen, above the button
     that starts it. A cold guess was impossible, so the one thing the pre-test
     measures could not be measured.
     The dialogue needed no new page: it is the atelier deck's Mémo,
     « Le modèle », built from the same `ATELIER_DIALOGUES` so it cannot drift
     — Memo → 📐 Forms, with « Tout écouter ». `SioDetail` is now the statement
     and nothing else (201 → 62 lines); `DialoguePlayer.tsx` is deleted rather
     than left unmounted, its job done better by the Mémo. Every atelier
     pre-test already opened its own page and still does.
     **verify66 is EXTENDED rather than joined by a new suite, because verify66
     is what let this through**: its check 4 scanned `UnitSection` and
     `Unit0Panel` — the two files the collapse's diff touched — and never
     opened `SioDetail`, the body those two MOUNT. It now scans the render, not
     the diff. Break-tested by restoring the original branch verbatim: four
     assertions fire.
     **And the model moved to the FRONT of the Memo, same PR** — Dan, minutes
     later: *"Atelier's Memo is to open on the range of sentences and
     vocabulary one is expected to use or understand. Simple as that."* Taking
     the dialogue out of the popup left it correct but far: two taps and a
     level chooser away. An atelier's lesson now opens on **Forms**, which is
     exactly that pair — « Le modèle » in full with « Tout écouter », and every
     word under it (Words went under Forms on 31 Aug). Chosen by
     `sio.isProduction`, never by a deck-id prefix, so a seventh atelier is
     covered. Ordinary lessons still open on Pract. — shown side by side.
     `verify73`, 13 checks, all break-tested.

  **After those:** Tier-1 concept batches in parallel with Color review, same
  read-before-ship rule.
- **Peers — features.** TWO ASSIGNMENTS from Dan's evening rulings (31 Aug):
  the DrillShell chrome fold and the Practice hub — full specs in the
  "Dan cleared the decision queue" section at the top of this file.
- **Peers — features.** 31 Aug PM: two Tier 2 stops given lesson files
  (SIO-005 Colours, SIO-006 Some nouns), Dan's colour ladder, the SemiBold
  band, the short English tabs, Words folded under Forms, and the collapse
  rule. Branch `claude/peers-vd2h6h` is pushed and **handed to fluoduo-main**;
  it must land AFTER #97 and rebase onto it — `docs/HANDOFF_PEERS_31AUG.md`
  carries the merge hazard, which is invisible in both diffs. Queue otherwise
  empty; next assignment is Dan's.

- **fluoduo-main — integration.** The 31 Aug cleanup sweep on Dan's go
  (six empty branches + La Carte deleted, PR #6 closed, stalled sessions
  archived; French 4 rebased to a PR; verify renumbers 52→64 on
  fluency-cycling and the stale 31s on font/home-rebuild). The deploy mirror
  Action once decision 9 lands. The daily stall sweep, standing.
- **Dan — the decision queue below**, and the reads: salutations now, then
  every concept batch.

### Peers — open queue (31 Aug PM)

Nothing here is in flight; the branch is handed over and the lane is idle until
Dan assigns. Listed so the queue is not re-derived by whoever picks it up.

**Owed by me, once #97 lands**

1. **Rebase `claude/peers-vd2h6h` onto #97.** Author's job under rule 7. The
   carry-over list and the one merge hazard are in
   `docs/HANDOFF_PEERS_31AUG.md`; do not merge from memory of this entry.
2. **Drop the Bonus tab from the rebase.** #97 already cut it and made ⭐ Bonus
   a LEVEL of Practice, which is the better resolution. Theirs wins.

**Answered by Dan, 31 Aug PM — closed**

3. ~~Deploy: manual, a Deploy button, or mirror on merge?~~ **Routed to
   fluoduo-main** (Dan: *"we said everything will go through
   [fluoduo-main] first"*). The decision and the build are theirs; the option
   I would put to them is the BUTTON — full auto-mirror quietly deletes the
   moment Dan decides a class sees new work, a button removes only the
   terminal. All three need one fine-grained PAT with write access to
   `dckg/fluo` alone. **`live` is 17 commits behind `main`** and that is the
   one thing currently costing anything.
4. ~~The Mémo and the word list overlap on a Tier 2 stop.~~ **Withdrawn — the
   collapse rule already fixed the visible half.** Dan: *"i don't see the
   repeated 18."* Measured on `d85533b`: with the word list folded, « homme »
   appears ONCE on screen; opening the fold makes it two. The duplication only
   exists for a learner who asked to see the list, which is what a fold is for.
5. ~~Colours: agreement is still untaught.~~ **Settled: flagged, not taught.**
   Dan: *"it is too early to introduce feminine at stop 4. We can draw
   attention to the fact that there are differences in feminine, but it is not
   the focus yet."* One italic line under the Mémo, and deliberately **no
   feminine example** — naming a form would make it a second thing to learn on
   a stop whose job is word order, and every one of this deck's twelve
   mnemonics is masculine, so any example would be invented French. The line
   exists only to stop a learner concluding a colour word never changes.

**Found, not fixed — wider than one branch, and #97 is in this area**

6. **The deck supply asks two questions at once.** A gender card offers
   `un · la · une · le` — four articles across two series — when the stop
   teaches gender alone. The lesson generators already offer only the matching
   pair; `deckSupply` draws its distractors from every gap in the deck.
7. **A gapless deck silently turns Moyen/Difficile back into multiple choice**
   (`buildCards`: `kind === "gap" && !(hasGaps && item.gap) ? "mcq" : kind`).
   `colors.json` is such a deck, so a level whose own label promises no
   multiple choice serves it. #97 fixes part of this for slotted lessons; the
   gapless-deck half remains.

**Candidate work, unassigned**

8. Six generators still on the single-blank `med` shape rather than slots:
   `ou-est`, `manger-boire`, `partitifs`, `demonstratifs`, `negation`,
   `en-au-aux`. Only worth doing where Dan wants a two-piece rung on that stop.

### Decision queue (Dan — each blocks someone)

| # | Decision | Blocks |
|---|---|---|
| ~~1~~ | ~~Salutations concept read — does the Tier-3 shape hold?~~ **RESOLVED 31 Aug — it holds; #100 merged** | ~~14 Tier-3 + gating 19 Tier-1 drafts~~ nothing — both lanes open |
| ~~2~~ | ~~Font~~ **RESOLVED**: wired via #95 + #105; branch approved-for-delete (evening ruling 5) | — |
| ~~3~~ | ~~Home-rebuild delete~~ **CLOSED**: branch already gone (evening ruling 6) | — |
| ~~4~~ | ~~Cycling pair~~ **RULED**: redo in FluOLinGo Hand; old pair superseded, kept until redo lands (evening ruling 7) | — |
| 5 | French 4 scaling docs: **PR #112 open — read pending** (evening ruling 8) | one PR |
| ~~6~~ | ~~Colours + Some nouns~~ **RESOLVED by #105**: both have lesson files; Tier 2 closes at 15 | — |
| ~~7~~ | ~~Shortcut row~~ **RULED**: Carte STAYS (sole map door once Practice opens its hub — evening ruling 2) | — |
| 8 | `rule:` namespace (894-item tagging): parked by design until the concepts finish | transfer evidence |
| 9 | **Deploys through fluoduo-main** (ruled) — needs the fine-grained PAT (write to dckg/fluo) as an Actions secret | ends manual deploys |

## 1 Sep — THE HANDOVER IS SPLIT, and Pre-tests gets two assignments

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan, 1 Sep ("give him both"), load-balancing the nine-file handover below —
Peers carries three assignments while Pre-tests sat idle after Lot A. The
split is BY STOP, disjoint files, written here BEFORE either session opens
one (the 31 Aug #97-collision lesson):

- **AMENDED after #120 (same day, 16:20Z): SIO-038 is DONE — Peers built it
  in #120 before this split reached main.** Nobody rebuilds it. Tier 1's
  last gap is filled the moment Color review drafts 038's concept.
- **PRE-TESTS takes the remaining TWO deck-backed files** — SIO-025
  `parce-que` (6 items) and SIO-039 `envies-besoins` (10). The model is
  `colors.tsx` — or Peers' fresh `transport` from #120, which is newer; the
  full brief, the registration joints, the no-invented-French rule and the
  `{" "}` trap are all in `docs/HANDOVER_LESSON_FILES.md` — read it before
  writing a line. The `concept` slot stays EMPTY in both — Color review
  drafts concepts on top.
- **PRE-TESTS also takes the cycling redo** (decision 4's ruling): the
  fluency-cycling animation rebuilt in FluOLinGo Hand — the two 30 Aug
  branches are superseded reference, not a base. Same skills as the
  Kallang wave. Second priority, after the two files.
- **PEERS keeps the six atelier files** (10 · 20 · 30 · 40 · 49 · 50 — the
  dialogue-built half; prototype on SIO-010) plus the Practice hub (the
  DrillShell chrome fold landed in #120). **Do NOT build 025/039** — they
  are Pre-tests' now. **The handover's "no precedent" line is out of
  date** (Pre-tests' catch): #111 already generates the atelier Mémo —
  « Le modèle » — from `ATELIER_DIALOGUES` in `memos.tsx`. Start from
  that, not from zero.
- **Roster corrections** (Pre-tests flagged the staleness): their lane row's
  "next: Tier-1 concept batches" is dead — #119 completed Tier 1; #104 and
  #107 are MERGED, not open. Their live queue is exactly the two items
  above. Where an older section below contradicts this one, this one wins.

## 31 Aug — nine stops have no lesson file: handover to Peers (SPLIT 1 Sep — see above)

Full brief in **`docs/HANDOVER_LESSON_FILES.md`**. The short of it:

A concept lives in `native/<slug>.tsx`, and nine stops have no such file, so
there is nowhere to put one. **Tier 1 and Tier 2 are otherwise finished; Tier 3
is 7 of 15 and all eight remaining stops are in this list.**

**Two different jobs, not one.** Three stops (25 `parce-que` 6 items, 38
`transport` 12, 39 `envies-besoins` 10) have ordinary decks — that is Peers'
own #105 job again, and `colors.tsx` is the model. The six ateliers (10, 20, 30,
40, 49, 50) have decks with **zero items**: their content is a model dialogue in
`ATELIER_DIALOGUES` (`src/content/ateliers.ts`), so the Mémo must be built from
dialogue lines. That half has no precedent — SIO-010's ten lines are the one to
prototype on.

**SIO-038 is out of proportion to its size**: the only Tier 1 stop without a
file, so it alone stands between Tier 1 and complete.

Handed over with the three registration joints (verify68 asserts all three — a
file that exists unwired looks finished in a diff), the no-invented-French rule
and its best precedent (colors.tsx refusing to teach agreement because every
mnemonic is masculine), the `{" "}` trap, and both browser scans including the
`scrollHeight > clientHeight` fault that makes a fitting panel unmeasurable.

Peers writes the file — slug, Mémo, dice, bonus. **The `concept` slot stays
empty; that is this lane's.**

## 31 Aug — Tier 1 batch 4, the last: verb + infinitive

Four concepts across stops 37, 47 and 48, and they are one argument: **only the
first verb conjugates, the second stays an infinitive, and the negative wraps
the one doing the work.** Three of the four Mémos state that as a separate ⚠️
warning; the concept makes it the rule the warnings follow from.

| stop | file | the claim |
|---|---|---|
| **37** Pouvoir | `pouvoir` | « on ne peut **pas** fumer » — `pas` lands on `pouvoir` because `fumer` is only its object |
| **37** Modals | `modaux` | **`il faut` has no person.** There is no `je faut`; when you need to say WHO, you need `devoir`. That is what the impersonal form costs |
| **47** Making plans | `futur-proche` | a verb of MOVEMENT doing the work of a TENSE — `aller` + infinitive has no walking in it, and the future costs no new conjugation at all |
| **48** Giving advice | `conseils` | the verb carries the force AND the audience: `tu peux` suggests, `tu dois` presses, `il faut` presses without naming anyone |

**Stop 38 (Getting around) has no lesson mapping in `LESSONS_BY_SIO`**, so there
is no file for a concept to live in. It is not draftable, and that is a content
gap rather than a concept one — the same shape as the six ateliers.

Every claim comes from the lesson's own Mémo. No new French.

### Where the pipeline stands

**Tier 1: 21 of 22 lesson files** across its 20 stops (some stops carry two).
Only stop 38 is unreachable. **Tier 2: complete. Tier 3: 7 of 15**, and the
remaining eight all need a lesson file created first.

43 concepts now, and after the pane rebuild **43 of 43 fit one screen** with
**zero jammed words**. Both numbers were 0-of-N and 8 respectively this morning.

One more jam shipped and was caught by the browser scan (`futur-proche`,
`</i> the same way`). The static `verify72` did not see it — same-line again,
which is exactly what its corrected header now says it cannot cover.

## 31 Aug — Tier 1, batch 3: five stops closed

Six concepts, because stop 34 has two lesson files and splitting one stop
across batches is worse than a batch of six.

| stop | the question the FORMS cannot answer |
|---|---|
| **2** Tu / Vous | `vous` is **two words** — polite-singular and plural. « Vous parlez ? » cannot tell you how many people are meant, and no French speaker tries. Only `tu` is unambiguous |
| **11** Moi, toi, lui | `je` cannot stand alone — it exists to sit in front of a verb. Take the verb away and you need the other set, which for **four of the eight** means a different word |
| **21** C'est / Ce sont | `c'est` **introduces**, `il est` **continues** — the switch happens the moment the thing has a name. And the opener agrees in number: `ce sont des ciseaux`, never `c'est des` |
| **34** Yes/no | **`si` is a second yes**, for contradicting a negative question. English has no word for it, so learners answer `oui` and are misunderstood |
| **34** Question words | `quel` is an **adjective** wearing a question word's clothes: it agrees with the noun beside it, never with the person being asked. A woman is still asked `quel âge` |
| **43** Frequency | straight **after** the verb — even when that splits the verb from its object, which English never does |

Every claim comes from the lesson's own Mémo. No new French.

**Tier 1 is 17 of 20.** Three left: stops 37 Pouvoir, 38 Getting around, 47
Making plans, 48 Giving advice — a modal cluster, which is batch 4. (Four
stops; 17+4 = 21 because stop 34 carried two files.)

### The spacing check was wrong about itself

`verify72` shipped an hour ago claiming same-line `</i> word` "usually
survives". **It does not.** Four more of this batch jammed that way —
`tu-vous`, `moi-aussi`, `questions-oui-non`, `mots-interrogatifs` — and on
tu-vous line 116 one instance survives and the next does not, on the same line,
with nothing in the source to tell them apart.

A blanket static rule would flag **418 sites across 39 files** to catch the
twelve real ones: churn, and a style rule wearing a bug check's clothes. So the
header now says the truth — only the rendered page knows — and the check pins
the two things it can honestly assert: the newline shape, and the twelve fixed
sites.

**Three faults in the pins themselves, all found by break-testing:**
1. anchors carried literal backslashes from `r"...\"fr\"..."`, so they matched
   nothing;
2. a pin that could not find its site **passed**, reporting "the phrase was
   rewritten" — which is exactly how four reverted fixes went green;
3. the follow text was matched literally, but it wraps across source lines, so
   `means everything else` never matched `means\n        everything else`.

A missing pin is now a FAILURE, and the follow text matches any whitespace run.
Break-tested by reverting every `{" "}` in six files: all red.

## 31 Aug PM — a stop is done when it is done (pre-tests lane)

Dan: *"I think it should only be marked done if it is really FULLY done. so we
should remove it."* The last of the three the pre-tests lane took on 31 Aug —
Unit-0 pages (#98), the popup collapse (#99), and now this.

**`doneSios` was self-declared.** A learner could open a stop, tap Mark as done
having answered nothing, and it counted: the map circle filled, the n/50
counter moved, Continuer advanced past it, the teacher's heat strip showed it,
and four badges in `economy.ts` read the length of that list. The sharpest case
was the PRE-TEST page, which offered to mark the stop done the moment the cold
guess was over.

**The rule (`lib/doneness.ts`).** A stop completes when every non-game activity
it OFFERS has been attempted. The list comes from `deckActivityTabs` — the same
list the popup draws as its links — so what a stop shows you and what it asks
of you are one list and cannot disagree. That is also what makes it survive a
cull: Sorting (#93) and iComplete (#97) left the requirement by leaving the
list, with no edit here.

**Dan chose the non-game reading**, shown both side by side. Every link put 6-7
activities between a learner and a tick at most stops, VocabulaRain and
LexicaLater included; excluding the games family leaves 4-6, still every
teaching surface. Excluded BY FAMILY, so a game added tomorrow is an extra
without anyone remembering to exempt it.

It fires from `noteAttempt` — the one write path a graded answer already takes
— and NOT from `isSioDone`, which runs inside render loops in thirteen files.
Completion still goes through `markSioDone`, so XP, gems, the streak and the
badges are unchanged, mastery weighting included. **Grandfathered** (Dan's
call): an already-done stop is never re-examined, so nothing can un-tick.

Driven end to end on SIO-001: four of five activities leaves the stop
untouched; the fifth, a real pre-test answer, yields `done: true, xp: 300,
gems: 5`.

### Two faults building it found, both pre-existing

**Unit-0 pre-tests never reached the activity ledger.** `pretestRecord` writes
the gap report; the LEDGER is written by `recordResponse`, which Units 1-4
reach through the runner and Unit 0 did not. So the popup's Pre-Test ✓ never
lit on a Unit-0 stop, and under this rule those ten stops could never have
completed at all. Fixed by calling the runner's own `recordPretestEvidence` —
same helper, same `xpPaid: 0`, so "remember it, but don't score it" still holds.

**An activity id must END in the stop's DECK id.** The ledger resolves a stop by
taking the tail after the last colon and asking `sioForDeck`; a SIO id there
resolves to nothing and the write silently no-ops — which is indistinguishable
from success at the call site. Traced rather than assumed.

`verify69`: 15 checks, every one break-tested. One was vacuous on the first
pass for the FOURTH time today — `"maybeCompleteStop" in ledger` was satisfied
by the helper's own definition, so deleting the call stayed green. It now
asserts the call inside `noteAttempt`'s body.

### For the integration lane — the fifth collision, and how it landed

`verify66-two-tier2-stops.py` sat on `claude/peers-vd2h6h` against
`verify66-popup-collapse.py`, on main since #99. The peers renumbered it to
**68** and it merged that way in #105 — which collided with THIS branch's
`verify68-derived-doneness.py`, still open as #104. Two files sharing a leading
number is exactly what `verify-wiring.py` fails on, so #104 would have broken
main the moment it merged.

Renumbered here: **verify68-derived-doneness → verify69**, workflow line moved
with it. 67 is taken by `verify67-concept-length.py` on the colour-review
branch (#100), so 69 is the first free number across every remote branch, not
just main.

## 31 Aug — eight jammed words, four of them already on main

Dan asked to SEE the eleven unmerged concepts rather than read about them. The
contact sheet showed two faults no check had caught: **« des**in front of
food »** and **« produce**French »** — a word butted straight against the next
across an element edge.

JSX drops the whitespace between a close tag and the text after it when the two
sit on different source lines. In the file it reads `<i>des</i> in front of
food` and it renders `desin front of food`. Source correct, `tsc` happy, build
green, review blind. **Only the rendered page shows it.**

The earlier scan looked for a jammed EM DASH and passed all eight, because
these are word against word. Widening it found **eight**, and four were already
merged: `ca-secrit`, `combien`, `conjugaison-u1`, `faire`, `langues-pays`,
`negation` (on main), plus `on-fait-quoi` and `ou-est` (caught before merge).
All fixed with `{" "}` at the element edge.

### The detector took three tries, and the failures are the lesson

1. **Every block boundary counted as a jam** — heading→paragraph, summary→note.
   400 hits, the two real ones buried. Restricted to INLINE adjacency inside a
   single block.
2. **Excluding `div` to kill the summary badges also excluded the ANSWERS**,
   which render in a div. Four real faults vanished from the report and it
   looked cleaner. Exclude `summary` only.
3. **`verify72`'s own regression pins matched the FIRST occurrence** of the
   anchor rather than the fixed site — `il y a</i>` appears four times in
   combien.tsx — so the check failed on correct code. Anchored on the close tag
   AND the words that follow. Same first-occurrence trap as verify69's guards.

`verify72-jsx-spacing.py` is static and says so in its header: the honest
detector needs a browser CI does not run for this route, so it flags the SHAPE
(inline close, newline, word, no `{" "}`) and names the eight sites so a revert
is loud. Same-line `</i> word` is deliberately NOT flagged — it usually
survives, and flagging it would bury the real thing, which is exactly what the
first version did.

Break-tested on four mutations: each named fix reverted, a new jam introduced
anywhere, and a file carrying a fix deleted. All red.

**Sixth vacuous or over-broad check this session.** The pattern is stable
enough to state: a scan that matches more loosely than the thing it asserts
will either drown the signal or invent one. Identical numbers across different
inputs, and a "clean" report that got cleaner when you narrowed the query, are
both tells.

## 31 Aug — Tier 1, batch 2: the fusion becomes one rule, not five

| stop | the question the FORMS cannot answer |
|---|---|
| **26** Aller | is « à l'école » an exception? **No** — only `le` and `les` fuse, so `l'` has nothing to fuse with. There is no `*al` because there was never going to be one, and the fusion is obligatory |
| **35** Où est…? | why `du parc`, far from any food? Because `de` + `le` is **always** `du` — in a bakery or on a map. Same fusion, third lesson |
| **32** En / au / aux / à | **direction picks the SET before the place picks the form.** Knowing `le Japon` is masculine cannot tell you between `au Japon` and `du Japon` |
| **19** Avoir — states | the TEST the Mémo does not give: does the word **agree**? `fatigué → fatigués`, so adjective, so `être`. `faim` does not, so noun, so you **have** it |
| **14** Pronouns × être | `j'` and `n'` are ONE rule in two places — `je`, `ne`, `le`, `de`, `que` all drop `-e` before a vowel. `ils n'ont pas` stops looking irregular |

**Batch 2 exists to make batch 1 smaller.** Stops 42, 36, 26 and 35 all teach the
same fusion, and stop 32 is the rule above it. Written separately they are five
things to memorise; written to point at each other they are one rule met five
times. Each concept says so explicitly — stop 35's check asks *"where else have
you seen du and des?"* and answers *"one fusion, three lessons."*

Every claim comes from the lesson's own Mémo. No new French.

**Tier 1 is 11 of 20.** Nine left: stops 2, 11, 21, 34, 37, 38, 43, 47, 48.

33 concepts render clean. One shipped with a jammed em dash (`</i> &mdash;`),
caught by the render scan — fifth time this session for that trap, and the scan
has caught every one. Nothing has ever caught it by reading.

## 31 Aug — Tier 3: the six remaining phrase stops

Written to the shape Dan settled on the salutations read — **the form pattern
AND the moment where the block is transparent, the moment alone where it is
opaque.** Three of each, which is the first real test that the distinction
carries its weight rather than being a form of words.

**TRANSPARENT — the parts are visible, so analyse them**

| stop | the claim |
|---|---|
| **1** Introductions | the little pronoun MOVES: `je m'` · `tu t'` · `il s'` · `vous vous` — and with *vous* the word really does appear twice, which reads as a typo until you know why |
| **36** Directions | `à + le → au`, `à + les → aux`; `la` and `l'` never fuse. **The same rule as `du` / `des`**, deliberately echoed so the learner meets one rule twice rather than two rules once |
| **27** Telling time | French counts hours, so `heure` is a noun: singular at one, plural after. `une heure` is not an exception |

**OPAQUE — parsing is the mistake, so the claim is about use**

| stop | the claim |
|---|---|
| **31** Weather | the syllabus's own example: « il fait beau » is not IL + FAIRE + BEAU. Four frames, and the KIND OF WORD picks one — adjective → `il fait`, noun → `il y a`, own verb → `il pleut`. Never `il est chaud` |
| **29** Invitations | the Mémo's four moves read as a menu; they are an ORDER. **Négocier only exists after a refusal** — there is nothing to negotiate until someone has said no |
| **8** Classroom talk | an asymmetry the Mémo states without drawing the conclusion: eight instructions IN, two lines OUT. The eight are for the ear, not the mouth |

Every phrase is already in its lesson's own Mémo. No new French.

**Tier 3 is now 7 of 15.** The remaining eight are the six ateliers (10, 20, 30,
40, 49, 50), which still have no `native/*.tsx` for a concept to live in, plus
stops 25 and 39, which have no lesson file either. That file work is what closes
the tier, and it is not concept drafting.

28 concepts render clean. Two shipped with a jammed em dash — `</b> &mdash;` and
`</i> &mdash;` lose the space and need `{" "}` — caught by the render scan, not
by reading. That is the fourth time this session for the same JSX whitespace
trap; the scan is the only thing that has ever caught it.

**Every concept still exceeds one screen**, these six by 30–179px. That is the
270px of chrome handed to Peers, not something these add — the existing 22 are
over by the same margins.

## 31 Aug — 270px of chrome before the first word (for Peers)

Dan, shown the strip between the Mémo band and the tab rail: *"i don't
understand the purpose of this wasted space."* Measured at 390×844 on
`/lessons/salutations`, Idea tab — **the lesson starts at y=270**, a third of
the screen:

| y | height | what |
|---|---|---|
| 0–48 | 48px | site bar — ☰ · FluOlinGo · 🔊 🏠 ⌛ |
| 48–103 | **55px** | the "Memo" band — one word |
| 103–159 | **56px** | the ✕ / ✓ 0 bar |
| 159–183 | 24px | gap |
| 183–270 | 83px | tab rail |
| 270 → | | the lesson |

**Cause.** `DrillShell`'s bar is `h-14` and was designed for a DRILL — ✕ ·
progress · score, as its own header comment says. On a tab with no progress the
middle renders `<div className="flex-1" />`: a full-width 56px row carrying one
icon and a zero, held apart by an empty spacer. The zero is a score for a tab
where nothing can be scored. Directly above it the "Memo" band spends 55px on a
single word the tab rail repeats 80px lower.

**~111px is recoverable** — put the ✕ and the score into the Mémo band, which
has the room, and the 56px bar plus its 24px gap go away on every tab with no
progress.

**Why this matters beyond tidiness.** It is the real fix for Dan's one-screen
rule. Every concept currently overflows by 7–206px in a 561px slot; 111px back
clears most of them outright. Colour review spent an afternoon trimming prose
and folding sections against a slot that had already lost a third of the screen
before the panel began — the trims moved the height by **zero pixels**
(articles-pays 786px before and after), because a paragraph reflows to the same
wrap.

**Peers has it** (Dan, 31 Aug). `DrillShell` is 28 surfaces and the bar is
load-bearing on the drills, which do have progress — so this is a features-lane
change, not a concepts one. The harness that produced the table above is
`scratchpad/chrome.mjs`; the per-concept fit measurement walks every lesson and
reports content height against the scroll container's clientHeight.

**One measurement trap, recorded because it cost an hour.** The first fit
harness reported 1111px for all seven concepts measured, identical to the pixel
— the URL was hardcoded to one slug, so every run measured the same page. Then
the rewrite found the scroll container by `scrollHeight > clientHeight`, which
is precisely the state a FITTING panel does not have, so anything that fit fell
through to `<body>` and reported a bogus 1.00 screens. Find the scroller by
`getComputedStyle().overflowY`, and treat identical numbers across different
inputs as the tell.

## 31 Aug PM — Dan read salutations; the difficulty ladder is his now

Sole editor of STATUS.md in this commit: fluoduo-main.

Dan's read of the salutations concept came back as five design rulings, built
the same day on `claude/fluoduo-pr9-review-sync-8uoyfx` (integration lane took
it with Dan's direct feedback; Pre-tests stood down and handed over notes):

1. **Levels renamed + remapped** — `lessonEntry.ts` now carries ★ Facile /
   ★★ Moyen / ★★★ Difficile / ⭐ Bonus. His classification: Facile =
   recognise + sort the given words (mcq + build); Moyen = complete ONE
   missing piece; Difficile = TWO (slots via `blankKeysFor`); Bonus = the
   whole sentence from English. Four ramps, 12 cards each, equal length still
   absolute.
2. **The repeat is dead** — the in-run Mémo rule card duplicated Les formes
   once the six tabs landed; the run now opens on question 1/12. The Mémo's
   one home is the tab.
3. **Forms are the heroes** — bold French forms with caption labels in
   salutations + every Mémo; `verify65-memo-forms.py` (new, in CI) pins the
   rule across all 44 lesson Mémos and memos.tsx.
4. **His "why are they all mcq?"** — three causes fixed: gapless decks fall
   back to BUILD at Moyen+ (MCQ only at Facile); Difficile single-blank
   fallbacks are TYPED at every width; Difficile on a slotted lesson drops
   the deck supply.
5. **iComplete retired** (Dan: "we can retire CompleteIt and Sorting") — the
   Memo's Moyen/Difficile ARE completion; registry row + flap + chain gone,
   route/evidence/ledger stay, exactly the Sorting (#93) pattern. The
   registry is 18 activities — the Menu grid is no longer Dan's exact 4×5;
   flagged, not papered over.

verify22/41/57/58 remapped; verify65 claimed by full branch scan (64 stays
reserved for fluency-cycling's renumber). Decision 1's answer: the Tier-3
concept SHAPE was not rejected — his feedback targeted the lesson chrome —
so Color review's Tier-3 batch can move the moment Dan says the concept
itself reads well. THE ROSTER merged to main (#94, squash `9a4b61a`).

**Same day, later (all on PR #97):** the two-blank card gained a
full-sentence English reference and colour-matched blank/box groups (Dan:
shaded, full hues, not numerals). The **ambiguity audit** Dan ordered ran
over every drill/pretest/game — 8 findings + 3 answer-key bugs, all fixed
(ou-est's fixed gloss, aimer-infinitif's answer-printing big, GramMarathon's
noun-level gloss, avoir-etats chaud/froid, discarded alternates ×2, pretest
transFirst ×3, combien/au-marché/aller answer keys). **Dan's 4×4**: Menu is
16 tiles — NumBus+NumBourse under one 🔢 Numbers hub (/games/numbers),
My Progress folded into Profile, and the lesson's « Le bonus » tab parked
under L'exercice (the ⭐ Bonus level serves it). Sorting cut + iComplete
retired completed the count.

**COORDINATION — Peers' branch (`claude/peers-vd2h6h`) vs PR #97.** Peers
carries Colours + Some nouns lessons, `Slot.first` in cloze.ts, English tab
labels, and verify66. Merge ORDER: **#97 first** (Dan-directed, green), then
Peers rebases with three adaptations, none large:
1. `blankKeysFor` — #97 makes it `level <= 2 → one key` (Moyen = one piece).
   Keep Peers' `first` flag; it now picks the ONE key for levels 1–2:
   `const lead = blankable.find((s) => s.first); return [lead?.key ?? keys[0]]`.
   Their "★ the colour word · ★★ colour word + noun" ladder maps to
   Moyen = the flagged colour word, Difficile = both. Same intent, new names.
2. Their branch also claims `verify66` — taken since by #99's popup check,
   and #100 (Color review) claims 67 — so Peers renumbers to **68**. Their
   verify's tab-label list pins SIX tabs including "Bonus" — #97 parks that
   tab (Dan's word), so the assertion drops to five. Their English label
   rename is theirs to keep — no conflict beyond the list literal.
3. `LessonTabs.tsx` will conflict textually (label rename vs tab removal) —
   resolution: their labels, minus the bonus entry, exercice `does` noting
   "⭐ Bonus included".
No one pushes to the other's branch (roster rule 3); this note is the
hand-off. Peers' "Every Some nouns card carries the English sentence" is the
same ambiguity-fix pattern as the audit — convergent, no clash.

## Where the code is

- `main` on `frenchprof/fluoduo` (origin) — the working repo.
- Production = `dckg/fluo` (remote `live`), Cloudflare Pages project
  `fluolingo-dot-com` auto-builds its `main`. **Deploy = `git push live main`.**
- 31 Aug PM (Peers) — **THREE PERMANENT RULES, TWO TIER 2 STOPS, AND A
  HANDOFF.** Branch `claude/peers-vd2h6h`, pushed, **not merged** — it goes to
  fluoduo-main under the new rule 7 above. `docs/HANDOFF_PEERS_31AUG.md` is the
  handoff; read that before merging, not this entry.

  **Dan's three rules, all in AGENTS.md, all in his words.**
  (1) *"Often times i cannot understand what the agent is telling me about what
  has changed. so long as i don't see, i can only guess (often wrongly). can we
  make it a point to always show what the finished product looks like rather
  than just describe."* Every visible change now ships with a picture of the
  REAL route; before and after side by side; a decision put to Dan shows its
  options instead of listing them; and it outranks brevity.
  (2) *"Now that the page is long please collapse part of it. can you make it a
  rule for all."* **The argument stays open, the apparatus collapses** — a
  learner READS the claim and its answer and CONSULTS the pitfall table, the
  flow, the self-check, the word list. A closed section must say what is behind
  it ("18 words", "3 traps"), or it is deletion with extra steps. One `Section`
  component, native `<details>`.
  (3) Rule 7 above — fluoduo-main integrates.

  **SIO-005 and SIO-006 have lesson files at last** — the last two Tier 2 stops
  with a deck and nowhere to put a concept. Colours teaches POSITION, not
  agreement: all twelve deck mnemonics are masculine, so an agreement lesson
  would have to invent the feminine forms. Some nouns teaches that gender is
  stored WITH the word, and the deck supplies its own counterexample (« un
  groupe » ends in -e). Every French string is the deck's own; verify66 holds
  both hand-written tables to the JSON item by item, because a flipped gender
  teaches a wrong article and reads as ordinary code.

  **Dan's colour ladder needed a mechanism.** « le feu rouge » puts the NOUN
  leftmost, so the old "★ takes the first blankable slot" rule asked the wrong
  half. `Slot.first` lets a slot claim ★; it defaults to the old behaviour, and
  verify66 EXECUTES `blankKeysFor` rather than reading it. **This is the merge
  hazard with #97** — see the handoff.

  Also: the band is SemiBold 600 (three things had to agree or the CSS says 600
  while the screen renders 400); the six tabs are Dan's short English ones and
  the strip now WRAPS rather than scrolling, because 594px of tabs in a 328px
  phone strip was hiding the sixth — which is why Dan's own shortened list
  stopped at five; Words moved under Forms.

  **Four faults found by DRIVING the app, none visible in a diff or a passing
  check:** a distractor wrong twice over (« le orange fluo » — bad order AND
  bad elision, so a learner rejects it on the elision and never thinks about
  the word order the card exists to test); the English reference at `text-sm`
  against the French `text-2xl`, and going out tagged `lang="fr"` so 🔊 read
  English with French phonics; `first:mt-0` in the shared heading style, which
  stripped the rule off EVERY collapsible section because a `<summary>` is
  always its parent's first child; and a bare noun as the EN→FR prompt, which
  at ★★★ asked a learner to build « C'est un homme. » out of the word "man".

  tsc clean · build green · all 54 suites pass · verify66 has 68 assertions,
  eleven break-tested — two of which were vacuous on the first pass and are
  documented as such in the file.

- 31 Aug (Claude Code) — **THE FIVE ATELIER STOPS HAVE A PRE-TEST FOR THE
  FIRST TIME.** Dan: "i need your help to build the pre-test which will consist
  of questions with English line, and a choice between 4 french lines. Until
  all the french lines are covered". SIO-020, 030, 040, 049 and 050 have no
  deck and no authored MCQs — their whole content was the model dialogue that
  played inside the SIO popup, so they were the only stops on the board with no
  pre-test door at all. The dialogue now IS the pre-test: every line takes its
  turn as the answer, the three wrong options are other lines of the same
  dialogue. 33 questions across five stops, at `/pretests/atelier-sio-0NN` —
  real pages on the existing route, so they inherit the gap report, the
  ledger and Bring-to-class for free.
  **Not one word of invented French.** Taking Dan's "4 french lines" literally
  is also the only safe reading: every option is French he already wrote and
  approved. A generator minting plausible distractors would be an agent
  drafting ~99 new sentences straight to a learner — the thing the 31 Aug rule
  forbids after « Je prends toujours LE poisson ». verify63 asserts it against
  the dialogue, not against the generator's source, because a generator that
  invents French looks identical in source to one that reuses it.
  **A real answer leak, found by driving it.** "🔊 Hear the full sentence"
  speaks `ttsTextForItem`, which for these items is the answer and nothing
  else — tapping it before picking read the correct line aloud. So did the
  keyboard shortcut. Both now wait for the pick on a BARE item (no sentence
  around the blank), which also removes the dashed "?" pill that was framing
  nothing. Authored pretests are untouched, asserted in both states.
  **SIO-010 deliberately keeps its bespoke three-situation pre-test** — a
  generated line-match cannot ask which greeting suits which audience.
  verify63: 26 checks, wired into the workflow, **every one break-tested** —
  and one of them was vacuous on the first pass (`"ATELIER_GENERATED" in reg`
  was satisfied by the import line, so deleting the spread stayed green). That
  is the third vacuous assertion of this shape found this week; the rule is now
  plain: **never assert a name, assert the construct** (`...SPREAD`, `<Element`).
  tsc clean · build green · all 37 suites pass · the two pre-existing
  `set-state-in-effect` errors on PretestContent got targeted disables with
  reasons (CI lints files a PR touches, so they would have painted this red).

- 31 Aug (Claude Code) — **THE SITE MENU IS BACK ON EVERY PAGE.** Dan: "many
  pages are missing that menu and other links in the area above the colored
  header strip. can you reinstate them so that those are accessible at all
  times". It was not a regression: the bar (☰ · ← FluOlinGo · 🔊 🏠 ⌛ account)
  was WRITTEN INSIDE `CahierShell`, so only CahierShell pages ever had it.
  Every drill runs in `DrillShell` (28 surfaces) and the deck table runs in
  `CahierFrame`; neither ever drew one — a drill's only exit was its ✕, which
  goes to exactly one place. Patch 20-21 made that focused mode on purpose;
  Dan has now overruled it for NAVIGATION specifically.
  **One component, three mounts** — `src/components/SiteTopBar.tsx`, mounted by
  CahierShell, DrillShell and CahierFrame. Copying the markup was the other
  option and is the one this repo has already been bitten by: the ☰ dropdown
  and the desk rail were two nav surfaces that disagreed for eleven days
  (19 Aug), closed only on 30 Aug. `TAB_HUES` / `ShellTab` / `TabFlap` moved to
  `src/components/TabFlap.tsx` so the extraction did not create a cycle;
  CahierShell re-exports `ShellTab` for its four existing importers.
  **GameFrame is the one deliberate omission**, named in verify31: it is
  `100dvh; overflow:hidden` and hands the leftover box to a board that must fit
  exactly, and it already carries a ✕ and a ⋯ sheet.
  Also: the deck table's own bar had a second 🔊 twenty pixels under the site
  bar's — removed (litmus rule); and CahierFrame now takes `fam-*`/`band-*`
  from its activity key, so its bar wears the family wash like every other page
  instead of bare paper.
  **verify31 gained section 0** — both mounts named, and neither shell may
  carry `cahier-topbar` markup of its own; all four assertions break-tested.
  verify29 and verify33 were repointed at SiteTopBar (read from ONE file, never
  the two concatenated — that is how a stale copy survives), and break-testing
  caught that **verify29's two RailGroups checks were vacuous in their previous
  home too**: `"RailGroups" in shell` was satisfied by the import line and by a
  comment, so deleting the element kept them green. Now `<RailGroups` against
  comment-stripped source; both bite.
  Driven in a browser at 390x844: bar present and no horizontal overflow on
  complete-it, dice, conjugaison, reviser, map, moi, teacher, flip-it landing
  and the deck table; the ☰ opens inside DrillShell's `overflow-hidden` without
  being clipped, at 390 and 1280, with Practice open and iComplete marked.
- 31 Aug (Claude Code) — **SORTING KEPT AND FIXED; `transfer` FOUND TO BE
  STRUCTURALLY UNREACHABLE.** Dan answered "all YES" to keeping Sorting, the
  `transfer` rule, and phrase banks for the ateliers.
  **SORTING STAYS, and the wording was the whole fault.** Three decks asked the
  learner to choose a form that was sitting in the prompt — `partitifs` in ALL
  EIGHT of its questions, in the deck for the unit that teaches the partitive.
  `hideAnswer` (lib/practice/engine.ts) blanks the correct column's form out of
  the DISPLAYED prompt, so « Je mange du pain. » becomes « Je mange ___ pain. »
  33 of 554 questions, 3 decks; the other 28 sort bare words and are untouched.
  Fixed in the engine, not in 33 items, because the fault is structural: any
  deck sorting SENTENCES by a form they contain gives every question away.
  **Why keeping it was right:** `UnitSection.tsx:37` falls back to Sorting when
  a stop has no authored pre-test — **31 of the 50 stops**, none of which has
  an authored one as well. Retiring it would have removed the pre-test door
  from 31 stops. It also tests far more than articles: 11 of the 31 decks are
  article/gender/number, the other 20 are phonology (alphabet), register
  (tu-vous, salutations), verb forms (avoir-etats), syntax, semantics and
  number morphology.
  **`transfer` IS NOT BUILDABLE, and nothing was built.** Dan's rule ("any deck
  other than the one that taught it") cannot fire: `item -> deck -> outcome` is
  1:1 — 894 curated items, NONE claimed by two decks — so an outcome belongs to
  exactly one deck by construction and has no other deck to be met in. The only
  cross-deck activities are the Reviser and the finale, both already `delayed`.
  Unlocking it needs a cross-deck `rule:` tag namespace (today's `col:` tags are
  deck-local: `col:des` is the partitive in `partitifs` and the indefinite
  plural in `commerces`). Written up in evidence.ts and verify53, including the
  instruction NOT to loosen the rule to make it fire.
  **Still open for Dan:** the atelier phrase banks (he said yes; drafting has
  not started), and `git push live main` — nothing from 30-31 Aug is deployed.
- 31 Aug (Claude Code) — **AN AGENT WROTE WRONG FRENCH INTO THE UNIT THAT
  TEACHES THE RULE.** Fixing SIO-049 (a restaurant review naming no dish) I
  added « Je prends toujours LE poisson » and justified it in the file as the
  Unité 2 aimer + le/la/les rule. That rule is for verbs of PREFERENCE —
  « j'aime le poisson » names the category. `prendre` is not one, and with
  `toujours` the sentence is habitual, so it takes the PARTITIVE: « du
  poisson », which is the Unité 4 rule the partitifs deck in that same unit
  exists to teach. Dan: "is WRONG. Je prends toujours du poisson". Corrected.
  **The lesson is about the gate, not the article.** `verify55` passed the bad
  line — it checks that the review names a dish, and it did. No check caught it
  and none reasonably could without a French grammar model, and a bad one would
  be worse than none (« Je prends le poisson » IS idiomatic when choosing off a
  menu; it was wrong only because of `toujours`). **So the rule stands and is
  now proven: French drafted by an agent reaches Dan before it reaches a
  learner** — the same gate `LessonConcept` sets for `contrast` and `remember`.
  Every French string authored by an agent on 30-31 Aug has since been audited:
  this was the only error, and the demonstratifs concept (approved by Dan the
  same day) is clean.
- 31 Aug (Claude Code) — **CORRECTION: THERE ARE NOT 11 SIOs WITHOUT A LESSON.
  THERE ARE NONE.** I reported that count twice (STATUS below, and the work
  plan) and it is wrong. I measured `LESSONS_BY_SIO`, the registry of NAMED
  lessons — but `deckActivityTabs` routes every deck to
  `/lessons/deck/<collectionId>` when it has no named lesson, and says so
  outright at CahierShell:587: *"EVERY deck has a Lesson"*. All eleven stops
  have a working lesson page, reachable from their stop, with all six tabs.
  Verified in the browser on `/lessons/deck/atelier-sio-050`.
  **Dan's point, and it was already true:** *"no lesson means listing out all
  the relevant phrases and sentences, so we don't start an activity cold in the
  atelier"*, then *"the list itself is a lesson, no?"* and *"flashcards (flip
  it) can do that of course"*. Yes on all three. For an atelier, **Les formes
  already renders « Le modèle »** — the dialogue with speaker roles, French
  over English, with Tout écouter; Le lexique lists the same lines as a reveal
  table; Le parcours states the SIO ("I can get by in a simple restaurant visit
  from arrival to paying, using set phrases"); and Flip It runs on the same
  deck because ATELIER_DECKS are spread into CURATED. The list IS the lesson,
  and it has been for these six all along.
  **So Track E does not exist.** It was an artefact of counting the wrong
  table. What remains for the ateliers is a CONTENT question, not a build one:
  each is a single model dialogue of 6-10 lines, so a learner who wants tea
  rather than coffee, or the bill, has nothing. Whether that becomes a phrase
  BANK (the pattern plus its variations) or stays one worked model is Dan's
  call. Three faults worth fixing either way: SIO-010 has "Bonjour !" twice as
  two identical cards, SIO-030 ends on the signature "Léa" / "Léa", and SIO-049
  reviews a restaurant without naming a single dish.
- 30 Aug (Claude Code, PR #72) — **DAN'S SIX-TAB FRAMEWORK IS BACK, AND THE
  DESK IS BACK TO BINDING-LEFT / FLAPS-RIGHT.** He sent three lessons from his
  original course site (aimer, faire du/de la, possessifs): "this framework is
  how it should be in EVERY SIO". Le parcours · Le concept · Les formes ·
  L'exercice · Le bonus · Le lexique — three already existed under other names
  (the Mémo IS Les formes, `dice` IS L'exercice, `bonus` IS Le bonus).
  **`LessonConcept`** (native/types.ts) takes its shape from his own concept
  tabs: required subtitle/contrast/question/answer/remember, optional pitfall
  table, flowchart, mini-check. `demonstratifs` is the reference; the other 46
  are Peers' to draft and **Dan's to correct — `contrast` and `remember` are
  the pedagogical claim and never ship unread**. **`LessonTabs`** renders all
  six as FRONT MATTER only: they exist while `asked` is false and vanish the
  moment an entry level is picked, so patch 22's one-card discipline is
  untouched (verified: 6 tabs before, 0 after). Le parcours and Le lexique
  needed NO authoring — `canDo`/`competence`/`collectionId` were already in
  every SIO record.
  **TWO CORRECTIONS I HAD WRONG.** (a) I told Dan the three-rung ladder was
  missing and recommended retiring Sorting partly on that basis. It is not
  missing — `lib/lessonEntry.ts`, live, HIS call of 27 Aug ("yes a learner may
  choose to start at 3 stars"). What is genuinely missing from his original is
  only the mid-run 🚀/⬇ and the 80% gate. (b) The coils: the 30 Aug mirroring
  moved them right with the rail, which was the wrong half to mirror. Between
  the two the desk disagreed with itself and **every drill's content ran UNDER
  the binding on a narrow screen** — invisible until Le concept put the first
  long prose in that container. Coils bind the LEFT again, every clearing
  padding with them.
  **THE ☰ IS THE NAVIGATION NOW** (Dan: the rail "cannot be flaps … they have
  to be drop down like in most interfaces", "burger menu left, flaps right").
  Two flap systems parted company: the six-family rail moved into the dropdown
  (top left, every width), a page's own flaps stayed flaps on the right. This
  also closed the 19 Aug open item — the dropdown listed activities FLAT while
  the rail showed the families; it takes `RailGroups` now. `toolTabs()` no
  longer renders whole there (it duplicated the families); **only Carte
  remains and Dan has said that shortcut row can be swapped for something
  else — it is free.**
  Checks: verify29's rail assertions followed the rail into the dropdown;
  verify19's "the rail returns at 900px" became the stronger invariant it was
  reaching for — NOTHING may hide the ☰ at any width. Both break-tested.
  **NEXT: A2–A5, then the mid-run ladder controls.** Still Dan's alone: the 11
  SIOs with no lesson, the Sorting keep-or-retire call, the `transfer` rule,
  the four food items in `negation-pas`, and `git push live main`.
- 30 Aug (Claude Code, same branch) — **DAN ANSWERED THE FOUR EVIDENCE
  QUESTIONS; `diagnostic` IS NOW REACHABLE.** (1) Pre-tests go into the evidence
  store: `recordPretestEvidence` in `lib/pretests/runner.ts` (both authored
  engines) and in `PicturePretestContent` (which keeps its own ledger). It is
  `recordResponse` directly with `xpPaid: 0` and NO SRS step — never
  `recordItemResult` — so his 27 Aug "remember it, but don't score it" rule is
  untouched: that rule governs XP, accuracy and the review queue, none of which
  the response store drives. (4) SpecuLearn is `diagnostic`, not `receptive` —
  Dan: *"it is a sort of diagnostic about what one might already know
  beforehand, one's prior knowledge."* CAVEAT recorded in the code: the drill is
  replayable, so a second run is no longer prior knowledge.
  **The check found two more bugs while being extended for this.** Its first
  version could not see the very code written against it — `{ given, activity }`
  ES shorthand — and teaching it that (scoped to recorder-call arguments; a
  file-wide pattern reported eleven phantoms from DrillShell props and
  destructured parameters) exposed `lesson-write:` from the pager's open-writing
  card, which matched no prefix and stored no type. Now `free`. verify53 is 44
  assertions, break-tested seven ways in total.
  **STILL DAN'S, both raised in `docs/EVIDENCE_HANDOFF.md`:** `transfer` (needs a
  rule for "unfamiliar context" — his Unit 2 example correction below means the
  example I gave was invalid, so the question is genuinely still open), and the
  Sorting `recog` vs `constrained` contradiction, now overtaken by the Sorting
  review.

- 30 Aug (Claude Code) — **SORTING REVIEWED; DAN'S ORIGINAL FOUND.** Dan:
  *"Sorting was never supposed to have existed. I don't recognise the activity
  and perhaps it was something else that slowly drifted into this."* He then sent
  his original build (`Leçon 8 — Hobbies I : aimer + faire + N`). **Sorting is
  not a drifted EtuDice; it is a different exercise that took the name** in the
  25 Aug rename. The original is a GENERATOR (subject × verb × activity, a fresh
  sentence per roll — that is what the die does) and PRODUCTIVE (the learner
  forms the sentence), with three learner-chosen rungs: ★ pick the conjugation,
  ★★ verb + article, ★★★ type the whole sentence from memory, 80% to climb.
  Sorting is derived from LexicaLater's column config ("No content authoring
  needed", `lib/practice/engine.ts`), is recognition, and has one rung.
  **The original mechanic SURVIVES and is correct**: 27 of 28 native lessons
  carry both the dropdowns and the die, `aimer` among them, and `DiceAxis` cites
  Dan's site by name. What did NOT come back is his LADDER — the pager runs a
  fixed ramp (4 MCQ, 4 gap, 3 build, 1 translate) instead of levels the learner
  picks and climbs. That is the one piece genuinely missing.
  **Audit of Sorting itself:** 31 of 44 decks generate one; 3 decks print their
  own answer (`partitifs` **8 of 8**, `transport` 6/9, `negation-pas` 11/20 — 25
  of 552 questions). Also found: Sorting says `Correct !` in French, breaching
  the no-French-interface rule. Playable sample + the full audit:
  https://claude.ai/code/artifact/9c6da1d8-05ef-49aa-80c6-a932f93334e7
  **AWAITING DAN:** keep and fix the three decks · retire it · or retire it and
  rebuild the ladder over the 27 lesson generators (my recommendation).
  **Unit 2 food leak, his question:** `negation-pas` (u2) teaches the negated
  partitive with *pas de café · pas de chocolat · pas d'eau · plus de café*, and
  u4 `partitifs` teaches it again with eight more. The rest of `negation-pas` is
  `faire` + activity, which is where u2 belongs. Swapping those four items
  removes the overlap. NOT YET DONE — it is content, and his call.

- 30 Aug (Claude Code, branch `claude/evidence-brief`, commit `e4a1fb8`) —
  **THE EVIDENCE STORE WAS RECORDING ANSWERS WITH NO MEANING.** `recordResponse`
  falls back to `location.pathname` for the activityId it stores;
  `buildEvidence` gets the raw `activity` argument and has no fallback, and
  nothing made them agree. A caller that passed no activity wrote a sensible
  activityId and NO `evidenceType` — so 22 of the 35 keys in
  `ACTIVITY_EVIDENCE`, every path-shaped one, were unreachable, and ten live
  surfaces wrote unreadable answers. **The Reviser is the only surface that can
  produce `delayed`** (it alone serves an item because its spacing interval
  elapsed) and it produced none, ever — the strongest signal PRD §7 asks for
  has been absent since the model was built. The Grammarathon finale had it
  backwards: the first attempt, the one that pays, passed `undefined`, while
  the post-assistance re-record passed the full path. All ten now pass an
  explicit tag; `verify53-evidence-coverage.py` (break-tested four ways) fails
  the build on a tag that resolves to nothing, a call with no tag, a live
  surface resolving through a path key, or the Reviser losing `delayed`.
  **NOT DONE, and deliberately — both are Dan's calls, not lookup errors:**
  `diagnostic` (pretests stay out of the store entirely, his 27 Aug rule
  "remember it, but don't score it"; writing them with `xpPaid: 0` and no SRS
  step would honour that rule, but it changes what the teacher dashboard sees)
  and `transfer` (needs a rule for what "unfamiliar context" means before it
  needs code). Also open for Dan: `activities.ts` files Sorting as `recog`
  while the table maps every dice prefix to `constrained` — left alone because
  changing it reclassifies every Sorting answer already stored.
  **Still free for Peers:** the eight direct `recordResponse` callers in six
  files (§2 of `docs/EVIDENCE_HANDOFF.md`) that skip `buildEvidence` and store
  bare right/wrong. Their tags are fine; nothing reads them.
  `docs/EVIDENCE_HANDOFF.md` is corrected — its §1 reported an `fr-FR` bug that
  does not exist (a regex matching across a call boundary) and its §2 named
  five callers when there are eight.
- 30 Aug (Claude Code) — **PR #65 and #66 merged to `main`, not yet deployed.**
  #66 finished the colour work beyond the palette: the six family hues wash the
  PAGE at 97.5% lightness (the 60 of 60-30-10 — `--band-wash` was invented for
  this on 26 Aug and never wired); pages you READ rather than answer (Memo,
  guide, quick guide — `isReadingSurface()`) take « le sable beige » instead,
  which Dan chose BLIND over all six family grounds; and a unit's ten stops sit
  two to a row, dividing at the container's exact midpoint.
  **The changed-file lint gate is live** and AGENTS.md is wrong about it: CI
  lints every file a PR touches, so touching an old file inherits its lint
  debt. Six such errors were met this way — three fixed (capability probes now
  use `useSyncExternalStore`), five marked with the reason the older decision
  stands (localStorage cannot be read during render; a live ref must be written
  during render or a key handler fires a stale CTA).
- 30 Aug (Claude Code, PR #65): four commits, all from Dan's session on the colour system.
  · **Family hubs** — `/games` and `/skills` now exist. `BOTTOM_NAV` takes each
    slot's href from `FAMILIES`, and two families had no hub, so 🎮 opened
    VocabulaRain (one game of four) and 💪 opened ConjugaZone (one of six).
    `FamilyHub` wears the same `SectionBand` as `ActivityLanding`, after Dan:
    "the same uniformed look of the cahier ... for all pages AND HUBS".
    `DELIBERATE_DOOR` records the two families whose door stays one activity
    (Review → the due queue, User → /moi) and why. `verify52` guards it all.
  · **The menu rail moved to the LEFT**, and the whole desk mirrored with it:
    the spiral coils, the flaps' hue border and rounded corners, the child
    indents, the paper's corners, the 48px coil gutter, the desk row's padding,
    and every "clear the coils" padding in CahierShell and PageBand. `order:-1`
    lives on `.cahier-tabs` itself — the `.cahier-stack ~` selector only matches
    pages using the stack wrapper, so the first attempt moved it on some pages
    only.
  · **The six families took a new palette**: one hue every 60° from 20° — coral
    · yellow · green · cyan · blue · magenta. Chosen by scanning all sixty
    rotations; this one is best for a colour-blind reader AND within a degree of
    the least disruptive. Each family's three tokens are derived, not picked:
    the ink is walked down until it clears 4.5:1 on its own wash, on white and
    on the paper at once (worst case 4.53 / 5.54 / 5.17).
  · « rien entendu » → "(nothing heard)". Dan reviewed a 28-item inventory of
    French in the interface and wanted **only this one** changed — "▶ Jouer",
    "Choisir un autre", "Bravo !", "Parfait !", "Unité N" and the rest all stay.
  · **DECIDED, keep as is**: the strip stays coloured by what an activity ASKS
    (Dan's rule of 26 Aug), not by its family. Both options were photographed
    from the built app side by side (artifact "Two Rules for One Strip") and Dan
    chose today's. Do not re-open. Note the demand colour reaches exactly two
    things — `PageBand` and `ActivityIcon` — so it is shell, not page interior,
    and cannot conflict with the 22 Aug approvals, which were interiors.
  · Found, NOT fixed: `--band-wash` is computed for all five demand colours in
    `globals.css` and read by nothing.
- 17 Aug, morning (on `main`, deployed at `3453b1e`): SIO-036/040 softening +
  `envies-besoins` gap fix; SIO objectives doc; PR #19 grading unification (had
  never been merged); PRs #18/#20 finally deployed; STATUS.md born.
- 17 Aug, afternoon (built by the Cowork PM session in seven patch files, applied
  by Dan with `git am`): the whole remaining UI programme — see the table.
- 20 Aug (Peers): PR #24 merged — the 3-Aug game-content port (LexicaLater
  phrase integrity + live misses, Commerces +7, beige livery — 19b baseline
  506 → 508 with Dan's OK, nationalities withdraws from LexicaLater);
  then the 3D-camera rework (row 25e) merged and the lot deployed to live
  on Dan's word ("deploy").
- 20–21 Aug (Peers, Dan's verdict rounds on the live camera): PR #26 —
  rounds 9–10 (road owns the frame · flat solid-colour buttons, dashed ring
  retired · gentle-S snake · tall grounded flanks · giant trees) — and
  PR #27 — round 11 (**the map moves to /carte**: finger-scroll fought the
  Home page; Home links there with one card, all old `/?unit=N#SIO` deep
  links + printed QRs forward; hover titles on all roadside; passed things
  exit through the frame; 2D zoom = number + milestone dropdown; side rail
  = one-flap accordion). Both merged on green and deployed by Dan.
  Ops PRs #28 (checkout/setup-node v5 — Node 24) and #29 (pages-preview
  guarded to frenchprof/fluoduo — it 404'd on dckg where Pages is off).
  Still red everywhere: claude-review (ANTHROPIC_API_KEY/billing — Dan).
- 21–22 Aug (Peers, on Dan's ask): **old-vs-new comparison of the colour
  review's 31 artboards** before any live change. All 31 mockups rendered,
  the matching live routes screenshotted from `main` (seeded progress;
  `REQUIRE_SIGN_IN` flipped locally for the shoot and reverted, as patch 23
  did), five reviewers judged each pair against the decided rules (litmus,
  two-mark hero, no variable rewards, soft daily goal, streak spec).
  Verdict: **0 ship-as-is · 17 ship-with-changes · 12 skip · 2 dead**
  (Hero-marks = the 19 Aug decision re-broken; Variable = Dan's "none").
  Systemic finding: nearly every mockup re-adds inline explainer text and
  French UI chrome. Gallery + per-surface verdicts: Claude artifact
  "Redesign Verdicts" (Peers session). NOTHING from the review is live.
  Round 2 on Dan's "not accurately paired": the launcher/Index, empty-state
  and sign-in-gate captures were replaced with driven in-activity states
  (real drills, mid-game boards, active reviser queue, GameOver, DrillShell
  tray, Menu popup); leaderboard is marked "behind sign-in, judged from
  code". Verdicts re-checked against the true pairs — counts unchanged.
  Also from Dan, 22 Aug: **he cannot read the Index** ("I really don't
  understand how to read it") — the U0–U4 cell grid and the per-row big
  circles carry no key. Open design item, not yet assigned.
- 22 Aug (Dan's votes on the 31 numbered surfaces + round 13, Peers):
  **Approved** 2 SpecuLearn · 3 xPlain (**rename xPlain → "Memo"
  everywhere**) · 5 4Mémoire (English chrome only) · 6 iComplete ·
  7 ConjugaZone · 9 WorDrill · 10 VoixLà · 11 ComposeIt · 12 ChaTutor ·
  13 NumBus · 14 NumBourse · 17 DéjàRevu · 18 GramMarathon · 19 My
  Progress · 21 Leaderboard WEEKLY variant · 23 Install prompt · 24 Home
  retention direction (subordinate to the round-13 hero below) ·
  25 Celebrations · 26 XP float · 27 Streak page (to the approved streak
  spec) · 28 Session receipt · 30 Boutique. **Rejected** 1 Menu ·
  4 EtuDice · 8 ÉcouTexte · 15 VocabulaRain · 16 LexicaLater · 20 straight
  Leaderboard · 22 Profile (29/31 already dead). Every build carries the
  gallery's required-changes list; interfaces English except the set
  French surfaces. Relayed to the colour-review session (its build queue).
  **Round 13 (PR #31, Peers)**: hero = ONE strip of the two marks + worded
  Rewind (/reviser) · Play (current stop; the old Continue) · Menu; the
  full-width Continue gone; 🔍/🏆 off the top bar (search = Index's box,
  ranking = /leaderboard); Home postcard in a recessed mat; /map behind a
  "Tap to use the map" glass; 3D `MAX_BEHIND` 4 → 8 + gates/arch/finish on
  the same behind curve — everything now leaves through the bottom edge
  like the stops (Dan's round-13 note). verify25 §3 rewritten to this
  decision. **MERGED to main (ff66caf) on Dan's word, 23 Aug** — the merge
  rode over the colour programme's landing: the hero conflict resolved to
  BOTH instructions (21 Aug five-equal-cells geometry × 22 Aug words —
  Rewind › with the due badge · Play › · Menu), and two main-side CI reds
  were fixed en route (progressMerge's @/ alias broke its runs-in-node
  contract → ./dayKey.ts + allowImportingTsExtensions; verify21's
  allowlist pin predated weekXp/weekKey). NOT yet deployed — Dan's
  `git push live main`.

- 23 Aug (content session): **six missing xPlain/Memo lessons authored** from
  the content audit's gap list — `tu-vous`, `salutations` (U0), `professions`,
  `nationalities` (U1), `meteo` (U3, weather-letris deck), `aliments` (U4) —
  each a NativeLesson (Mémo + dice generator + 10 EN→FR bonus) registered in
  `LESSONS` + `LESSONS_BY_SIO` (SIO-002/009/012/016/031/041). Checked against
  Dan's uploaded Atelier unit PDFs: tu/vous question order follows piste 4
  (« Vous vous appelez comment ? »), the nationality memo mirrors the U1
  « accord » box (+e / +s / -ien→-ienne), the partitive meal sentence is the
  book's own (« Le midi, je mange de la viande et je bois de l'eau »). NOT in
  the deck and therefore left out (flag for Dan): the book's « C'est nuageux /
  ensoleillé » fourth weather frame, and « canadien » (the U1 table's -ien
  example — the deck's tunisien stands in). tsc, eslint and all 25 verify
  suites green.
- 24 Aug: **approved surface #3 executed — the activity "xPlain" is renamed
  "Memo" throughout the site** (Dan's 22 Aug vote). Display rename only: the
  registry name in `src/content/activities.ts` (`key: "lesson"`) is now
  `"Memo"`, which propagates to the Menu tile, rail flap, popup flaps, Index
  pill and every other surface that reads the registry; the key, routes and
  identifiers are untouched. Comments describing the learner-visible name
  updated (CahierShell, RailGroups, MenuSplash, activities page, indexMatrix);
  verify pins updated with dated comments (verify19, verify24, verify29-rail);
  About page's "Mémo" normalised to "Memo" (English chrome). No ÉcouTexte
  "Memo" topic exists — no collision. `out/` static export still says xPlain
  until the next build/deploy. tsc + all verify suites green.
- **22 Aug (this session): the colour + retention programme is MERGED TO `main`
  and awaiting deploy.** `main` = `2a729fb`. Contains: the seven `--dopa-*`
  roles + three accessibility fixes; the `--gram-*` gender mapping (98 sites,
  7 masc / 6 fem / 85 that were never gender); the top-bar overflow fix (at
  320px only 4 of 6 icons were reachable); the retention build (PWA manifest +
  install prompt, eight reward moments on a size ladder, floating +XP, session
  receipts, weekly leaderboard); and the `--fam-*` family axis, which colours
  all 50 routes from `CahierShell` alone. **`/moi` and `/profil` are exempt by
  design** — they carry their own five-row colour scheme and `familyOf()`
  returns null for them, so they render exactly as Dan's handoff left them.
  Five new verify suites in CI (31 topbar · 32 retention · 33 family · 34
  dopamine, plus main's 30 profile). **NOT YET DEPLOYED — see below.**

- **23 Aug (content agent): GramMarathon gap items authored for nine decks
  that had zero** (from the content-audit GAPS.md high-value list):
  possessives +10 · aller-destinations +10 · quand-time +10 · avoir-etats +10
  · demonstratifs +10 · professions +12 · weather-letris +12 · frequence +8 ·
  question-words +9 (= 91 new items, JSON-only, appended — no existing item
  touched; each new item is a full `fr` sentence + `en` gloss + `gap`, pattern
  A like partitifs). All pass `isPlayableGap` with a unique word-boundary
  occurrence; every deck now clears MIN_GAPPED, so the 🏃 flap appears.
  Sentences were checked against Dan's uploaded Atelier unit PDFs (per-unit
  teacher guides) — patterns confirmed verbatim (e.g. « Tu vas au cinéma »,
  « le lundi à 18 h », « Il fait 16 degrés », « Qu'est-ce que tu fais ? »,
  « Cette orange est délicieuse »). Flag for Dan: weather items keep the
  deck's il-y-a column for « du soleil »/« du vent » (Atelier agrees; « il
  fait du soleil » colloquialism rejected as wrong by the drill);
  question-words-14 answers in euros (money formally lands in U4);
  frequence keeps « parfois » (Atelier bilan uses it too, lessons use
  « quelquefois »). verify23/24 green, tsc clean. NOT deployed.

- 23 Aug (content agent, finishing pass on the wave): the two letris/EtuDice
  decks the wave skipped for concurrent edits are DONE — `numbers-70-99`
  (bands 70–79/80–89/90–99, all 30 `col:num` tags retagged, parked scratchpad
  spec executed) and `question-words` (`gameConfig.letris` on the Atelier U0
  « Suivez le guide ! » axis — the book sections its intro BY question word —
  columns WHAT/WHO · WHERE/WHEN · HOW/WHY · HOW MANY, 8 items tagged;
  est-ce que + the inversion sentence have no wh-category, left untagged;
  the 9 new gap items untouched). Also removed partitifs.json's 6 dead
  `syllables` arrays (q01–q06 — the flagged pre-existing bug; fr kept).
  verify23/24 green, tsc clean, CONTENT_FLAGS updated. NOT deployed.

- 23 Aug (content agent, syllabus-audit fix wave — **under Dan's SIO freeze:
  the 50 SIOs' structure, ids, units and relative positions are UNTOUCHED**
  (`src/content/sios` read-only — course map, deep links and printed QRs
  depend on them); every fix landed INSIDE existing decks/lessons/ateliers):
  six audit findings fixed in place, each verified against the uploaded
  Atelier unit PDFs — (2.1) **ne… plus**: 6 items negpas-15–20 + a third
  « ne … plus » letris column in `negation-pas` (« Le stylo n'est plus sur
  la table » is U2 p. 67 verbatim), plus row added to the negation lesson
  memo; (2.2) **well-wishes**: 3 lines in the SIO-030 atelier email
  (bon anniversaire · bonne chance · bon voyage — bonne année/bonne fête
  don't fit the email's narrative, so they live in the deck + palette),
  all 5 formulas as `vouloir-inviter` 15–19 (gap = Bon/Bonne, the agreement
  point), EMAIL_BANK Souhaits palette completed; (3.2) **nuages family**:
  des nuages (il-y-a) + nuageux/ensoleillé under a NEW fourth C'EST letris
  column in `weather-letris` (45–47), meteo memo carries the fourth frame
  (closes the 23-Aug « fourth frame » flag; the dice keeps its 3 verb
  frames); (1.4) `questions-oui-non` + `mots-interrogatifs` unit labels
  1 → 3 in `lessons.ts` (est-ce que is U3; SIO-035 mapping was already
  right, nothing else keys off the labels); (3.3) **venir**: sentence cards
  en-au-aux-a-18–21 = the book's Au tableau rows (de/du/des/d' — the U3 PDF
  p. 97 DOES teach venir, so no Dan bounce needed); (3.5) **il faut out of
  textgen/unit3** — the U3 PDF's directions never use falloir; the three
  variants now read « vous prenez la … rue » / « vous tournez … au
  carrefour » (piste 66 + directions-matching verbatim) / « on peut
  prendre … » (SIO-040 atelier frame — no imperative, guard-rail intact).
  Flag for Dan: the negation lesson stays labelled unit 1 while its memo
  now also shows ne…plus (négation (2) is U2 — the deck that drills plus
  IS unit 2). ALL 25 verify suites green, check-textgen units 0–4 green,
  tsc clean, all four edited JSONs valid. Audit doc rows marked
  « FIXED 23 Aug (in place) ». NOT deployed.
- 23 Aug (content agent, audit row 3.1 — **e-carte postale, Dan's decision:
  "add a washed down version to the email and present the full activity in
  040"**, SIOs untouched): (a) EMAIL_BANK (SIO-030's rail) gains a holiday-note
  flavour — « Où je suis » + « Raconter » palettes (Je suis à Paris/Nice/
  Singapour · J'aime / je fais du sport / je vais à la plage / C'est super, all
  U0–U2) and a fifth rotating occasion (« un petit bonjour de voyage » 🏖️ with
  its own task line); NO weather there (U3). (b) NEW production bank
  **POSTCARD_BANK « L'e-carte postale »** (id `e-carte-postale`, 🏖️, solo +
  aiCheck) on SIO-040's rail, structured per the guide's atelier spread (U3
  PDF p. 20 / p. 111): opening → where (je suis/on est à…) → weather (the
  weather-letris family incl. the new nuageux/ensoleillé/des nuages) → doing
  (je visite · on peut visiter · on prend le métro) → closing (Bises ·
  À bientôt). Mechanism: `composeBankForDeck` → **`composeBanksForDeck`**
  (banks.tsx) and deckActivityTabs (CahierShell) now maps EVERY bank on a
  deck — first flap keeps the registry ComposeIt chrome (and the Index's
  compose cell), later banks fly their own title+emoji with unique keys.
  tsc clean, verify23/24/28-trackd green, eslint clean on touched files.
  Audit row 3.1 marked RESOLVED. NOT deployed.
- 24 Aug (content agent): **SpecuLearn opened for colors, transport,
  objets-articles** per Dan's approved item sheet (SPECULEARN_ITEMS.md) +
  his three same-day amendments. Playable: colors 11/12 (colors-12 le beige
  dropped — no swatch exists) · transport 9/12 (the three `prendre le/la/l'…`
  verb phrases excluded — image-twins AND the only way to keep the deck one
  grammatical category, en/à prepositional phrases only) · objets-articles
  20/20 (all playable: the six items with no honest emoji — gomme,
  agrafeuse, portefeuille, trousse, mouchoirs, passeport — got purpose-made
  flat SVGs under `public/objets-articles/` instead of a forced emoji stand-
  in, so nothing needed banning). New `SPECULEARN_ITEM_IMAGES` (id → SVG
  path) in speculearnReady.ts lets a deck MIX emoji and per-item images —
  chosen over an aliments-style whole-deck photo bank because it changes
  less (the DevItem type already carried an optional `img` alongside
  `emoji`; only buildItems()'s filter/map needed touching) and the other 14
  objets items already had an honest emoji. New `SPECULEARN_PROMPT_FRAME`
  (deckId → question, transport: "Tu y vas comment ?") renders lang="fr"
  above the options — the en/à answers are responses to that question, not
  free-floating nouns. Category-purity comment + exclusion reasons live
  next to `SPECULEARN_EXCLUDED_ITEMS`. Emoji added to colors.json (11),
  transport.json (9), objets-articles.json (14) — only where PLAY, never on
  colors-12 or the three prendre-* items. tsc clean, all verify suites
  green (verify-grading, verify-reports, verify18–34), check:short/
  check:textgen green. Screenshots (390×844, port 3777, REQUIRE_SIGN_IN
  already false from a concurrent session — not touched): colors shows
  swatches with beige absent; transport shows the « Tu y vas comment ? »
  frame; objets-articles rounds show the SVGs (agrafeuse/trousse/gomme/
  passeport/mouchoirs/portefeuille all observed rendering distinctly from
  their emoji deckmates, incl. the passeport booklet vs 🪪 carte
  d'identité). NOT deployed.

- **24 Aug (Cursor session, STATUS holder for this edit): reconciliation + Dan's
  rulings on the content flags.** No code changed. Three corrections to this file:
  (a) the "NOT deployed" tails above are STALE — `main`, `origin/main` and
  `live/main` are all **`919a1c2`** (PR #33), so everything through the syllabus
  fix wave and the e-carte postale IS deployed; (b) the Deploy section below still
  cited 22 Aug / `1a29278` — corrected; (c) two CONTENT_FLAGS reds were already
  closed by the 23 Aug fixes and had not been struck (boissons folded into
  `aliments.json` as `col:boissons`, so `check-textgen` is green on all five units;
  the weather fourth frame shipped as items 45–47).
  Independently re-verified this session: **all 25 verify suites exit 0**, `tsc`
  clean on `src` (the errors a local run shows come from 16 gitignored `patch*/`
  scratch dirs, not the tree), eslint **115 errors / 20 warnings** — matching this
  file's own figure.
  **Dan's five rulings, 24 Aug** (detail + reasoning in
  `docs/CONTENT_FLAGS_2026-08-23.md`):
  1. « Il fait du soleil » stays WRONG — the Atelier corrigé is the examined
     standard. No change.
  2. `frequence`: « parfois » and « quelquefois » are **presented together as
     equivalent** — the drill accepts either, the lesson shows them side by side.
     TO BUILD.
  3. `possessives` (SIO-022): the gap is deck-vs-**SIO**, not deck-vs-book — the
     deck drills three first-person columns while SIO-022's competence asks for
     the full paradigm by gender/number. **BUILT the same day — see the 24 Aug
     possessives entry below.** SIO text untouched (freeze holds).
  4. SpecuLearn: real count is **15 served / 29 unserved**, not 38. The 21
     grammar/function decks are **permanently excluded** (undrawable); emoji
     authoring approved for colors, core-nouns, days, matieres, objets-articles,
     professions, transport. TO BUILD.
  5. Pre-tests absent on the 6 production ateliers: **by design**, assessed in
     class. Flag closed.
  Still unassigned and the one user-facing failure on the board: **Dan cannot read
  the Index** (22 Aug) — the U0–U4 cell grid and the per-row circles carry no key.

- **24 Aug: possessives drill the whole paradigm (SIO-022).** Dan said GO with all
  six persons. **This supersedes ruling 3 in the entry above and the wording
  committed in `ca761e9`, both of which said "re-gear the letris columns to
  masculine/feminine/plural". That route was wrong** — `prefix` lives on the
  letris *column*, never on the item, and seven consumers build their phrase from
  `column.prefix + item.fr`, so the person would have had to move into `item.fr`
  and put « ton stylo » on the tile face. Answer on the front of the question.
  Rejected; **do not re-propose**. The letris board is untouched (three columns,
  MON/MA/MES, prefixes intact).
  What shipped instead follows the `nationalities` pattern already in the repo
  (`item.nat` + `NAT_SUBJECT`): each of the 21 `col:`-tagged nouns expands into
  six Complete It questions, the prompt gives the English cue (« your (sg) ·
  pen ») and the learner produces « ton stylo ». **136 questions, up from 31.**
  Two defects closed at once — the paradigm was 1st-person-only, AND the prompt
  used to *print* the possessive (« mon book » → type « mon livre »), so nothing
  was selected. That giveaway is gone; the two behaviours are not both live.
  The forms are derived rather than stored (possessives are regular; the noun's
  agreement class is already declared by its `col:` tag), so **no schema field was
  added** — the opt-in is IMPLICIT: `CompleteItContent.tsx` detects the expansion
  by checking whether a deck's Letris columns are the literal keys `mon`/`ma`/`mes`
  (`POSS_COL_AGREEMENT`, keyed on those three strings exactly). Nothing in the
  code or the deck JSON names this deck as "the possessives deck" — the column
  names ARE the switch. Renaming those three columns for any reason would
  silently turn the expansion off and restore the original giveaway (the prompt
  printing the possessive, « mon book » → type « mon livre » — see above), with
  no error, just 31 questions again and no warning to whoever made the rename.
  `verify/verify35-possessives.py` (39 assertions) is the tripwire that fails in
  that case; wired into `verify.yml`, per that file's own rule that a check CI
  never runs is not a check. **Undecided:** whether to replace the implicit
  column-name detection with an explicit opt-in — e.g. a `gameConfig.completeIt`
  flag on the deck — so the switch doesn't ride on a naming coincidence. Raised
  with Dan 24 Aug; his answer at the time was "I don't understand the question" —
  still open, not re-raised since. The "(m)"/"(f)" gloss
  is stripped from the cue — that marker IS the answer — and the gender is offered
  on the ? ladder instead, per the litmus test (help on demand, never inline).
  Verified: **26 verify suites green** (the 25 that existed plus this one),
  `check-textgen` green on all five units, `tsc` clean on `src`, eslint **still
  115 errors / 19 warnings** (errors unchanged; one warning fewer, a dead `isNat`
  went with the de-duplication).
  Noticed in passing, NOT fixed: `verify/verify31-wordrill.py` exists but no CI
  step runs it — the same gap the Reports check once had.
  Still TO BUILD from the 24 Aug rulings: the parfois/quelquefois equivalence
  and the SpecuLearn emoji for the seven concrete-noun decks.

- **24 Aug (Cursor session, sole STATUS holder for this edit): the old site vs this
  app, committed.** Docs only — no source touched. Two new documents:
  `docs/REGRESSIONS_VS_WITHDRCHAN.md` (the comparison, merging an evidence-based
  audit with a second agent's learner-experience analysis and correcting the
  latter's four factual errors) and `docs/OLD_SITE_AUDIT.md` (the evidence base —
  all 18 modules of `french.withdrchan.com` read off the shipped HTML; it lived in
  the gitignored `patch-shots/` and would have been lost).
  **Headline: the app got structurally stronger and pedagogically thinner.** The
  gains are architecture — sequencing, spaced repetition, tracking, speaking and
  listening, scale, navigation between stops, no roster in the client bundle, and
  a far better answer to a wrong answer (`feedback.ts` classifies nine kinds of
  error and scores an accent-only answer *partial*, against the original's one
  flat line in 14 of 18 modules). The losses are explanation and agency — the why
  behind the form, the concrete "you will be able to say…" promise, the unscored
  self-check, the first-person French controls (`Je vérifie`, `J'écoute` — swept
  by `12bd816`'s english-first chrome), and an Index whose marks Dan cannot read.
  **The open decision: whether difficulty and question-aim become choosable
  again** — framed in the doc not as "restore the tiers" but as "they were
  abandoned twice already, by modules 17 and 18, before FluOlinGo existed; decide
  deliberately this time." Figures re-measured this session: 50 SIOs · 44 decks ·
  883 deck items · 31 native lesson files (32 registered) · 30 of 31 carry a bonus
  bank · 35 pretests · 20 activities · **24 of the 50 SIOs have no authored
  lesson** (my brief said ~19). Verification unchanged as expected for a docs-only
  change: all 26 `verify/verify*.py` green, `tsc` clean on `src`.

## Programme — done

- **23 Aug (Peers, the content-gap wave + visual unity): eight authoring
  agents filled the audit's gaps, each self-checked against Dan's uploaded
  A1U0–A1U4 Atelier PDFs.** New: ÉcouTexte generators for units 0/1/2
  (9 scenarios, registered; picker's "coming soon" gone); 6 xPlain lessons
  (tu-vous, salutations, nationalities, professions, meteo, aliments);
  91 GramMarathon gaps across 9 decks; 91 LexicaLater syllabifications
  across 6 decks; 8 VocabulaRain sets (days, alphabet, numbers ×3,
  languages, nationalities, aimer-activites); letris/EtuDice columns on 8
  decks; 2 wiring fixes (marche bank → commerces; modaux slug aliases).
  check-textgen now harvests `nat` forms and carries units 0–2; its unit-4
  « jus, thé » red is the missing ★ boissons deck (Dan's placement). ALL
  judgment calls in docs/CONTENT_FLAGS_2026-08-23.md for Dan's book check.
  **Visual unity (Dan's picks)**: heading band VARIANT A — every family
  page opens with the profile-style band (PageBand via CahierShell: name in
  **Dan's own FluOlinGo Hand OTF** (src/fonts, next/font/local), one number
  right on the hl chip); duplicate h1s stripped from reviser/tts/tutor/
  leaderboard; **/map back inside the cahier** (the tap-glass killed the
  scroll conflict that justified its bare interface — 21 Aug ruling
  superseded by Dan's 23 Aug "cahier set to the left" rule). **PR #32
  MERGED (3c58e35) on Dan's word and DEPLOYED — Dan pushed live/main
  3c9bcb2 → 3c58e35, 23 Aug.** Still open for Dan: strike-outs in
  docs/CONTENT_FLAGS_2026-08-23.md; the ★ boissons deck placement;
  SpecuLearn's 38 guessability calls; the Index legibility fix (not yet
  built); claude-review fix-or-delete. **Existing content audited against
  the Atelier PDFs** (all 63 pages): 38 findings in
  docs/SYLLABUS_AUDIT_2026-08-23.md — headline gaps: U2 « ne… plus »
  taught nowhere; SIO-030's well-wishes are a phantom; U3 nuages family
  undrillable; U4 boissons hole confirmed; two U1-labelled lessons
  front-run the book (est-ce que is U3). Fix wave MERGED (PR #33, 919a1c2) and **DEPLOYED — Dan's live push confirmed 23 Aug** (live/main = origin/main = 919a1c2): six in-place syllabus repairs (SIOs frozen), boissons closure, the e-carte postale at stop 40 + washed-down email flavour, negation lesson → unit 2 on SIO-028's rail.

| Patch | What | Check |
|---|---|---|
| 1–22 | data layer, curriculum spine, PII split, bottom bar, Cahier tokens, HELP from the registry, DrillShell, lesson pager, English-first, cohort filter, hero shrink | verify18–22, 25 |
| 25 | **Home path**: 2D map per Design (region bands, kind-coloured stops, ▶ current, 🚩 class flag, zoom), 2D ⇄ 3D toggle (3D ported from La Carte, ring colours from `sioKind()`), `short` labels + build check, `/unit/N` deep link, A4 print with QR per unit | verify25b (38) |
| 25c/25d | **Home map 3D view = Dan's Figma Make** (ported 19 Aug, `pm/home-map-figma-3d`): first-person camera on the snaking road, depth-scaled stops, world gate signs, Peers' roadside props, trees, clock-driven sky, 🏁 arch; 📍 recentre | verify25c (61) |
| 25e | **3D camera = Candy Crush register** (Peers, 20 Aug, eight rounds against Dan's captures): mini-planet camera — six-station chain on a beaten path sunken between coloured banks, stations = oblate buttons on road-pad spots, tip-first rises over a scalloped terrace lip (`reveal` + `clipRise`), water at the lip's foot, the NEXT region's land beyond with far dressing on parallax, roadside clamped clear of the road (`placeAt` verge), no pinch zoom. Knobs now `FULL_AHEAD`/`MAX_AHEAD`/`SIZE_FALLOFF`/`HORIZON_Y 0.46`/`SKYLINE_Y 0.2` | verify25c (64) |
| 23 | **Games**: `GameFrame` + GameBar v2 on all six, 100dvh boards, per-game headers/instructions gone, game-over post-mortem, misses → ReVue + `CORRIGER MAINTENANT`, credits once, desktop two-pane, galleries → ▶ Jouer + sheet | verify23 (70) |
| 24 | **Index**: chip rail + unit segments + 10 SIO rows, URL state, cells = how you did (device ledger), hubs → redirects, `?gaps=1`, row buttons | verify24 (58) |
| 26 | **/moi + teacher**: outcome rows, `HeatStrip` on 4 pages, thin /moi hero + 4 segments, teacher Class now (16 tiles, stuck detection, 30 s repoll), outcome × student matrix, one pooled fetch, Compute gone | verify26 (61) |
| bugs | deck gate/redirect, `NoDeck`, DeckContent on tokens, `/sio/[id]` → deep link, DEPLOY.md name, ONE "weak", ONE shuffle, D6/D7/D9/D10/D11, leaderboard identity, D4 sync diagnostic | verify27-bugs (81) |
| hero | **Home hero = a horizontal report card** (19 Aug): the two hairline bars gone ("no status bar"), chip rail gone, « Bienvenue sur FluOlinGo » heading back, counters now one row of value-over-label marks — level · streak · course · XP · lessons, + gems once earned; actions round, dropping below the marks on a phone (superseded by the glyph row, 21 Aug) | verify25 (22) |
| menu/nav | **HELP popup → Menu** (20 tiles, 4×5 phone / 5×4 tablet, no prose — /guide keeps the long form); registry regrouped to **six** families in Dan's 19 Aug order **Goals · Practice · Play · Review · Skills · User** — Goals now means the 50 objectives, the five pre-lesson activities became Practice | verify19c (10) |
| rail | **Side rail grouped**: six family flaps (Goals · Practice · SvPlay · Review · Skills · User), children under each, Unités under Goals | verify29-rail (22) |
| Track D | help-ladder spec + state machine + rule hints + `?`/WHY in every drill, evidence tagged, hinted items → ReVue, open-production feedback (`/api/feedback`, rule fallback), 22 eval cases | verify28-trackd (165) |
| 30 | **The profile is ONE learner model** (22 Aug, from Dan's Claude Design handoff): /moi and /profil are the same page — pinned goal → one next action → five collapsible rows `RE-DRILLS · SKILLS · FRILLS (showcase) · ILLS (problems noted) · THRILLS (rewards)`. The economy is the last row; the bottom bar became the five families | verify30-profile (26) |
| glyphs | **One glyph, one job** (21 Aug): ▶ ⏸ ⏹ 🔁 🐌 mean SOUND and nothing else; leaving a page is a word + ›. Home's round ▶/🔁 gone (▶ also said "continue the course"; 🔁 pointed at /reviser, which the Review tab already did) → « Continue › » is a full-width `.fluo-btn` under the card, La Carte's ▶ → ›, the due badge moved to the Review tab, ▦ Menu moved into the greeting. Say It had TWO ⏹ on screen at once (mic vs end-session) and WorDrill's "Done!" had THREE 🔁 → session controls are words: Back · Skip · End here · Restart · DéjàRevu ›. Review's mark 🔁 → **🔖** (Dan's pick over 👀, which the Carte cliffhanger and « Regardez ! » already use) — one registry edit carries tab + Menu tile + rail flap. Same sweep through SpecuLearn, Compose, ConjugaZone; NumBus 🐢 → 🐌 and ▶️ → ▶. The MAP's current-stop pin ▶ → **🧑‍🎓** in both views (the 3D already bobbed one; it also stamped a ▶ inside the stop — dropped), legend now « 🧑‍🎓 you ». ONE named exception: **▶ Jouer** on the four game galleries stays — play-a-game is the literal sense, it always carries its label, and it never shares a screen with a player. Verified against the BUILT app at 390px, not the diff | verify25 (22) |

| 31 | **WorDrill redesigned** (22 Aug, from Dan's Claude Design handoff): content-sized scope chips with itemSrs-derived dots, EN/FR prompt switch, session map, a mic-reading level meter, the help ladder on 🔤, a done screen that hands its misses to the Reviser. The handoff's **sprint clock was assessed and dropped on Dan's word**; ConjugaZone (1d) is a separate patch | verify31-wordrill (30) |
| 32 | **ÉcouTexte redesigned** (22 Aug, from Dan's Claude Design handoff — two directions drawn, Dan: "merge"): the SHEET is the spine (every sentence on screen and typeable) and the sentence you are on is ELEVATED, not exclusive — a card with larger type, its own 🔊, a verdict, and Check / Show the sentence; tapping any row moves the focus. Player under the header: **five controls, one row, no words on them** — ⏯ (one transport button; Dan: "WHY THE HELL DO I NEED AN ADDITIONAL PAUSE BUTTON"), 🐇🐌 speed, ♀♂ voice (active half in ink, other faded), a blanks button that alternates ▬ ▬ ▬ / ▬▬▬▬ and drives the real blanks (solid when sized to each word, dotted when equal), and Length as a number picker. Clarity moved OUT of the buttons: captions, a hint line naming whatever you hover/focus, title+aria-label on every control. **A fully-right sentence confirms itself; a wrong one stays silent** until the learner asks. Topic is a dropdown grouped by unit, one entry per SITUATION, wired to the generators' scenario ids (`FreshOpts.scenarioId`) so "Directions" really gives an itinerary — units 1–2 listed but DISABLED, no generator written yet. **Two glyphs sit outside the 21 Aug registry on purpose (⏯, 🐇) — the handoff overrides it here.** Verified against the BUILT app at 390px | build + eslint clean |

Shipped ≈ 149 of ~150 in-scope units.

## Deploy

**Deployed 25 Aug: `dckg/fluo` main is `abdc86b`** — the same commit as
`origin/main` and Dan's local tree. There is no deploy debt. (Superseded
`919a1c2`, deployed 23 Aug.) That push carried PRs #37 and #38 — the
EtuDice → Sorting rename, the deleted lesson-ramp entry die, the
`claude/peers-vd2h6h` reconciliation — plus Dan's own `ff96b93` docs pair,
which had been pushed to live on 24 Aug WITHOUT ever reaching `origin`. That
drift is what made a parallel session read main as "independently rewritten";
see **Always pull origin before pushing live**, below.
Cloudflare Pages (`fluolingo-dot-com` → fluolingo.com) builds on that push.
(Earlier revisions of this section stopped at 22 Aug / `1a29278`; PRs #32 and #33
landed and were pushed after it was written.)

The deploy is Dan's step, not an agent's: production is a DIFFERENT repo, and a
Claude Code session that already has `frenchprof` sources cannot add
`dckg/fluo` (cross-owner adds are refused). A session also cannot reach
fluolingo.com to verify — the network policy answers 403 to CONNECT — so
confirmation is the Cloudflare dashboard.

```sh
git checkout main && git pull origin main
git push live main
```

**NEVER put a trailing `#` comment on that second line.** Interactive zsh does
not treat `#` as a comment (`interactive_comments` is off by default), so a
pasted `git push live main   # Cloudflare builds it` sends `#`, `Cloudflare`,
`Pages`… as refspecs and fails with `error: src refspec # does not match any`.
It cost one confusing failure on 22 Aug, and a second on 25 Aug. Keep the
command bare; put the explanation on its own line.

**Always pull origin before pushing live.** Live must never hold a commit
`origin` lacks. On 24 Aug `ff96b93` was pushed to live and not to origin; the
next day `origin/main` had moved on, the two histories diverged, and `git pull`
stopped dead with `fatal: Need to specify how to reconcile divergent branches`
— while `git push live main` cheerfully reported `Everything up-to-date`,
because local main and live/main still matched each other. Both symptoms, one
cause.

### Setting up a machine that has never deployed

Deploying needs a clone plus the `live` remote. Node is NOT needed — Cloudflare
builds on its own machines; install it only to run or edit the app locally.

**A phone cannot do this out of the box.** Neither iOS nor Android ships a
terminal, so there is no `git` to run. It needs an app first: Working Copy
(iOS) is a real git client with a UI and is much the best of them — clone, add
the remote, pull, push, all by tapping; a-Shell or iSH (iOS) and Termux
(Android) give a real shell where the commands below work as written; a
Codespace in the mobile browser also works and is as unpleasant as it sounds.
Everything else here assumes a Mac.

```sh
xcode-select --install
brew install gh
gh auth login
```

For `gh auth login`: **GitHub.com → HTTPS → Yes** (authenticate git) **→ Login
with a web browser**. The HTTPS + "authenticate git" answers are what let
`git clone` work afterwards without a password prompt. Skip either install if
`git --version` / `gh --version` already answers.

```sh
git clone https://github.com/frenchprof/fluoduo.git
cd fluoduo
git remote add live https://github.com/dckg/fluo.git
git config --global pull.rebase false
```

`git config --global pull.rebase false` is per machine, not per clone, and it
is what stops `git pull` refusing on divergent branches. Without it the pull
aborts mid-way and leaves `MERGE_HEAD` behind, which then blocks every
subsequent pull with `You have not concluded your merge`.

After that, deploying from that machine is the two-line block above. If it
answers `remote live already exists`, the machine is already set up.

**If a merge opens vim** — a full-screen editor showing `Merge branch 'main'…`
and lines starting with `#` — press <kbd>Esc</kbd>, type `:q!`, Enter, then run
`git commit --no-edit`. Do NOT type shell commands into that screen: on 25 Aug
a `git push …` line was typed into the message buffer, and `--no-edit` then
swallowed the whole comment block into `abdc86b`'s subject line, where it
remains.

Validated before the merge: `next build` succeeds · `tsc` clean · eslint 115
errors in 51 files (DOWN from the 118/52 baseline — main's own work removed
three) · verify19b 11/11 · 29 22/22 · 30-profile 26/26 · 31 13/13 · 32 39/39 ·
33 34/34 · 34 33/33.

## What is left

| # | Item | Units | Who |
|---|---|---|---|
| 1 | **Apply + deploy the 17 Aug patch series** (0001–0008, in order), then delete the merged branches below | 0.25 | Dan |
| 2 | ~~Home hero: keep the 11 Aug compact hero, or adopt Design's stat row?~~ **Dan chose the report card, 19 Aug** — built, verify25 rewritten to the new decision, screenshots in `work/hero-report-card/` | — | done |
| 3 | ~~3D map: swap the placeholder `HomeMap3D` for a real 3D build~~ **ported from Dan's Figma Make 19 Aug** (`pm/home-map-figma-3d`, replaces the CSS-perspective attempt of the same afternoon — Dan: "the 3D map is not yet 3D"). The Make's engine is intact in `src/lib/map3d/` (`projection.ts`: `pathXAt` / `cameraForward` / `project()`, HORIZON_Y 0.30 · CAMERA_Y 0.80 · FOCAL 3.8 · MAX_AHEAD 38; `sky.ts`: 8 clock keyframes, sun/moon arc, clouds, stars; `scene.ts`: Peers' ROADSIDE_ITEMS + seeded trees). **What differs from the Make and why:** stops from SIOS + `progress` (no mock, no stars / type badges / modal — a tap opens the SIO under the map; nothing dims); the Make's "Café de Paris / Le Campus…" are the repo's regions (HomeMap `REGIONS` + regionIcons on each world's gate sign, tap = open the unit; accent `--region-*`, ground `--region-*-band`); road keeps the 2D semantics (paved to 🚩, dotted beyond, travelled in the accent); classmates DROPPED (no safe per-learner stop source; leaderboard = name + XP only); colours are tokens (no hex — the ratchet did not move; sky keyframes are numeric RGB in `sky.ts`, see its header); Cahier body stack, not Nunito; camera = the box's native scroll (wheel / touch / keys / scrollbar) → one rAF → `camZ`; `?hour=N` pins the sky for screenshots. Knobs: `SCROLL_PER_STOP`, `CAM_MIN/MAX` (HomeMap3D.tsx), the projection constants + `WX` snake, `SKY_KF`, `MAX_BEHIND` (4 — lower it for less clutter behind the camera). Known: on a 390 phone the nearest stops stack vertically (the Make does too); the current stop is forced on top. verify25c (61) | — | done |
| 4 | Class flag: `CLASS_FLAG_SIO` in `src/content/chapters.ts` is hand-set (SIO-010) — move weekly or derive from the term table | 0.5 | agent |
| 5 | Ops: ruleset is active ✓; delete `add-claude-github-actions-…` (unmerged, `main` has its own workflows); `claude-review` billing in the Anthropic console; delete `import-fluoduo` on `dckg/fluo` | 0.5 | Dan |
| 6 | Track D follow-ups: run the 22 eval cases against the deployed `/api/feedback`; teacher charts for `help.rung`; ÉcouTexte on the `?` ladder | 2 | agent |
| 7 | **Colour + retention reviews — `docs/COLOR_REVIEW.md`, `docs/DOPAMINE_REVIEW.md`.** Audited by Dan 21 Aug; grid re-derived against the CSS Color 4 reference vectors and pinned. **APPLIED:** the seven `--dopa-*` roles as additive tokens under three guardrails (Cahier ground untouchable, `--region-*` stays separate, `verify30-dopamine.py` holds the values — 33 checks, wired into CI); the three accessibility fixes (3D-map focus ring 2.24 → 4.19:1, white-on-teal 2.45 → ink, input borders 1.25 → 6.11:1); the gender mapping as `--gram-masc/-fem/-neutral` across all 98 sites (7 masc, 6 fem, **85 that were never gender**). **NEW FINDING H:** `--cahier-ink` and five other structural tokens are declared twice — the 10 Aug override block wins (`#312620`), but the decoy above it (`#2a2e6e`) is what a top-down reader finds, and it produced two wrong figures in the audit. Collapsing them is a pure refactor, still to do. | 1 | agent |
| 8 | **Top bar fixed + pinned (21 Aug).** Dan: *"the top most row of icons still exist. and must not go hiding into the overspill off the screen."* Measured: at **320px only 4 of 6 icons were reachable** (☰ and the account button sat 67px past the edge), at **360px 5 of 6**, and 390 passed by 0.8px — so any addition broke it, and `/reviser`'s score readout already did. Fix has a yield order: `topRight` moved OUT of the strip into `.cahier-topslot` (truncates first), the wordmark truncates second, and the strip is `shrink-0 max-w-full flex-wrap` so it grows a line rather than pushing an icon off. All widths 320–1280 now 6/6, one line, no sideways scroll. `verify31-topbar.py` (13 checks, in CI) pins all three parts — verified to fail when any is removed. `verify/topbar-measure.mjs` re-measures the real layout. | 0.5 | done |
| 9 | **Retention build shipped (21 Aug).** All six approved items: **PWA manifest** (`app/manifest.ts`, force-static for `output:export`, four generated icons incl. maskable + apple-touch) with an **install prompt** that asks once on the third visit and never re-asks; **eight reward moments** on a size ladder (chime/small/big/full — mastery is a sound with no banner, only a finished unit gets the fanfare), all decided in `finalize()` by diffing saved vs persisted; **floating +XP** showing the multiplier's arithmetic (`40 × 1,5 = 60`) off a new `fluolingo:xp` event; **SessionReceipt** + `useRunXp` (wired into iComplete as the pattern — other drills opt in by passing their run); **weekly leaderboard** (`weekXp`/`weekKey` in Progress, merge, board row, **firestore.rules allowlist** — a denied write deletes the learner's row) with a This week / All term toggle and an Around-you view; **two hero marks** coloured, and the due-count badge off `--fluo-danger` (pending work is not failure). `verify32-retention.py` (39 checks, in CI) pins all six plus the ethics constraints; verified to fail when broken. | — | done |
| 10 | **Family identity — the SECOND colour axis (21 Aug).** Dan, on the profile page from `pm/profile-learner-model`: *"this almost sets the dopamine colour gold standard for the rest of the website."* Measured and he is right — core surfaces render **2.5–3.0% saturated** (/reviser 2.5, /leaderboard 2.7, /conjugaison 3.0). **This corrects COLOR_REVIEW Finding B**, which said to demote the rotating hues: rotation by *list index* encodes nothing, but a *fixed per-section* hue is the most legible thing on a page. Two axes now: `--dopa-*` = what it MEANS, `--fam-*` = WHERE YOU ARE. `SectionBand.tsx` generalises the recipe (spine / band / pill / 6% body). **The reference had a real defect** — its spine and pill used the full hue with paper text, 1.99:1 on gold and 2.27:1 on teal, failing all six; both take `--fam-X-ink` here. `verify33-family.py` (30 checks, in CI) recomputes every ratio and asserts the full hue stays decoration-only. Applied to /reviser as proof (ratchet 508 → 505). | 1 | agent |
| 11 | **Family colour is now site-wide (21 Aug).** Dan: *"I WANT COLOR."* The shell derives each page's family from its own `active` key (`familyOf()` in activities.ts — one mapping, no page declares a hue), then paints the sticky header in the family's wash and runs a 6px spine down the page edge. **50 routes coloured from one component.** Bands applied to the /reviser gaps and both Leaderboard zones. Measured: /leaderboard 2.7% → 6.1% saturated, /profil 6.7% → 10.1%, /activities 6.9% → 10.3%, Home 15.5% → 18.9%. An unmapped key stays uncoloured on purpose. verify33 now 34 checks. | — | done |
| 12 | **Next for colour:** most page BODIES are still paper — the shell colours the frame, SectionBand colours content, and only 2 surfaces use it so far. The gated pages (drills, /reviser, /conjugaison) could not be seen in this container. Open pedagogical calls unchanged: daily-goal size, variable reward, streak freeze, gem locker. | 3 | agent |
| — | December: canonical `FD-` outcome IDs (Track A) | 8 | deferred |

Closed as non-issues (Dan, 17 Aug): `/teacher` on the CDN — the page is gated to
Dan's email; Firestore service-account key — being retired.

## Decisions Dan made on 17 Aug (do not re-open)

1. Home map = two views, 2D and 3D, learner toggles. 2D reference = Design's
   "FluOlinGo Home standalone". Band fills = `--region-*-band` tokens. 3D = Dan's own
   build — his Figma Make "3D Scroll Map Interface", ported 19 Aug (row 3 below).
   No more path reversals.
2. SIO-036/040 spec softened to content (description AND competence, CSV + `sios.json`
   in step). Do NOT run `scripts/gen-sios.mjs` (stale vs hand-edited `sios.json`).
3. `envies-besoins.json` 09/10 `gap` = `envie`.
4. Region **accent** hexes stay provisional (Design gave bands, not accents).
5. Firestore key: being retired — not a task. `/teacher`: gated to Dan's email — closed.

## Decision Dan made on 19 Aug (do not re-open)

7. **Menu, not HELP.** The popup is a grid of the twenty activities and nothing
   else. **Six families**, order `Goals · Practice · SvPlay · Review · Skills ·
   User` (Dan: "2a → 2b → 2e → 2c → 2d → 2f", and "Pre-Lesson = Goals").
   GOALS = the fifty objectives by unit then goal; the five that used to sit
   under it (SpecuLearn, xPlain, EtuDice, 4Mémoire, iComplete) are PRACTICE.
   `activitiesInFamilyOrder()` is the single reader — do not hand-keep a
   second list.
   **Side rail DONE** (same day): `RailGroups.tsx` replaces the rail's flat
   22-flap column with the six family flaps, each opening to its children.
   The Unités are Goals' children now, not a tier — a unit IS ten goals.
   Open state is per family in sessionStorage, read through
   `useSyncExternalStore` (patch 24's answer to the set-state-in-effect
   rule); the family owning the current page opens by default.
   verify29-rail (22), wired into CI after verify28.
   LEFT: the phone **☰ dropdown** still lists the activities flat — it was
   not in Dan's ask, but it is now the one surface disagreeing with the rail.

6. **Home hero = a horizontal report card.** Dan, shown Design's "FluOlinGo Home
   standalone" twice: *"the dashboard that wouldn't have a status bar, that is
   minimalist and that is a bit like a report card but horizontally."* This
   REVERSES the 11 Aug hero shrink — deliberately. Do not re-shrink it, do not
   put the hairline bars back: `verify25` now asserts the reversal (no
   `h-[3px]`, no `role="progressbar"`, the h1 greets again), so a re-shrink
   fails CI. Marks are numbers with a label under each; emoji left the values
   so six marks fit a 390px phone; XP shows `420/1k` with the exact figure in
   the tooltip; gems join the row only once earned (the 20 Jul zero rule holds
   for currencies, not for the five academic marks).

## Decisions awaiting Dan (all default to what was built)

- Profile (22 Aug): what consumes an ILLS note — the queue, the teacher, or cut it.
- Games: hearts kept in NumBus/NumBourse/LexicaLater; Match It now behind sign-in.
- Home: "one unit per screen" = vertical band snap, not sideways paging.
- /moi: no time-on-task line any more (D6 sessions had no writer); Reviser "N weak" now
  counts fragile 1-day items too.
- Teacher: Class now added as first panel, Overview kept; the page reads all 16 logs on open.
- Track D: stuck thresholds (typed/cloze every wrong + 20 s idle; say 2 wrong / 30 s;
  MCQ every wrong); drills retry instead of ending on a wrong answer; WHY sits on the
  tray; feedback runs on ChaTutor's key (≈ $0.003/check).

## Branches

- merged/dead → delete: `claude/peers-vd2h6h`, `claude/sio-instructional-objectives-7bjv1a`,
  `claude/fluoduo-pr9-review-sync-8uoyfx`, `claude/api-necessity-i8fgps` (La Carte, folded in),
  `cursor/patch-19c-a214`, `cursor/drillshell-20-21-a214`, `cursor/teacher-cdn-exposure-a214`,
  `ship/patches-1-12`, `fluoduo/data-and-curriculum-fixes`, `add-claude-github-actions-…`,
  `claude/case-01n37qiwbywj63ebzdabdeht-status-b9muew` (its STATUS edit is superseded).
- Cowork PM patch series (17 Aug): `pm/*` existed only in the PM's workspace; they arrive
  as `git am` patches, not branches.

## Rules that stay

- Peers builds, `main` is the sole push path; every patch = verify script + screenshot,
  and CI runs every `verify/*.py` on every push.
- Dan's litmus test (AGENTS.md). Grammar guard-rails (no imperative outside SIO-008).

---

## Patch 31 — WorDrill redesigned (22 Aug, from Dan's design handoff)

Branch `claude/wordrill-redesign`, check = `verify/verify31-wordrill.py` (30).
Whole suite green: 21 scripts, 0 failures. Build + typecheck clean.

- **The sprint clock was assessed, not built** — Dan asked for the assessment
  first and then said "ignore sprint". Two reasons it did not survive review:
  it reversed his own 2026-07-03 decision that a run is a working queue with a
  natural end ("there should be a natural end rather than looping
  continuously"), and its core interaction was never prototyped — `SayItContent`
  opens a fresh `SpeechRecognition` per word (`continuous = false`), so a
  60-second sprint means ~20 recognizer restarts and the restart latency could
  eat a large share of the clock. The design's own answer to that was
  always-listening continuous mode, which the design chat confirms was never
  built. **If the sprint comes back, prototype continuous recognition first.**
  Everything the clock implied went with it: the duration dropdown, the ring
  round the mic, the countdown, "en 60 secondes", "Encore 60 s".
- **The drill did NOT move to DrillShell.** Artboard 1b draws its own ✕, score
  and footer inside the cahier sheet — a second copy of DrillShell's bar, which
  is exactly the duplication that shell exists to prevent. But DrillShell is
  `h-dvh` and Dan asked to keep the site chrome with the drill inside it, so
  the two cannot both hold as drawn. WorDrill stays in `CahierShell` and draws
  its own bar; the honest fix is a non-fullscreen DrillShell variant, which is
  a shell change and belongs to its own patch. **Left open.**
- **`variant="wordrill"`, not a new meaning for `embedded`.** SioModal's popup
  is embedded too and must keep the popup look; overloading the flag would have
  restyled a surface nobody reviewed.
- **WorDrill is on the help ladder now.** It was gated `enabled: !embedded`, so
  the drill Dan uses most had no rungs and recorded through `recordItemResult`
  directly. It now takes the `useHelpLadder` path like the standalone page,
  which means hinted and revealed words finally reach ReVue from here. 🔤
  carries the three rungs (hint · skeleton · answer) rather than a separate `?`
  — note this makes WorDrill the one drill whose ladder is not in the shell
  bar. Dan to say whether the others should follow or WorDrill should conform.
- **The meter reads the microphone.** The design drew CSS keyframes: bars that
  wiggle on a timer whenever the recognizer is open, identically whether the
  learner is speaking or silent — and it dropped the interim transcript, the
  one real proof the recognizer heard words. Both were reversed:
  `SpeechMeter.tsx` opens a parallel `getUserMedia` stream and draws a rolling
  RMS history (flat means flat, and it says nothing at all if the stream is
  refused), and the transcript stays. Sampled at ~30fps, stream released the
  moment the turn ends.
- **Back survives.** The design's footer was Skip + End here only. `back()`
  exists because Dan asked for it (2026-07-16, "the back button is not active
  when I skip questions") and carries real retrace logic for skipped cards.
- **The chip dots are derived, not invented.** The design drew them as "the
  last words you were asked there", which nothing stores — the activity ledger
  keeps `{right, wrong}` tallies, not sequences. `itemSrs` carries it
  implicitly: an answer sets `due = now + intervalDays`, so `due - intervalDays`
  is when the word was last answered and `intervalDays` is how it went. Same
  "one definition of weak" the Reviser and /moi read, so the dots cannot drift.
- **The session map is capped at 40.** The design drew 30 dots for a 30-word
  run; WorDrill's widest scope is 612, where 612 dots is a wall. The window
  slides so the newest mark is always the last filled dot.
- **WHY is off the WorDrill tray** — Dan's call. He was offered pronunciation,
  grading tolerance (the only one buildable today: `silentEq` already knows why
  a homophone passed) and gender, and chose to drop it. Note this is a
  deliberate exception to AGENTS.md's litmus clause, which mandates a WHY
  affordance on answered questions; the other drills keep theirs.
- **Verb squares are not built.** The design marked verbs as squares in the
  session map via `i % 4 === 1` — decorative fiction. WorDrill pools deck items
  and there is no reliable join from a pooled item to the conjugaison `VERBS`
  inventory, so the map is dots only.
- **Not done / found on the way:**
  - ConjugaZone (artboard 1d) — a separate page and its own patch. The
    handoff's `verbs.js` (the newer copy in Dan's zip, which assigns `être` to
    Unit 0 and `lire`/`écrire` to Unit 2, leaving `incomplete: 2`) is NOT in
    the repo yet.
  - **`.cahier-mono` is undefined.** It is used in ~10 components
    (ProfileContent ×25, DrillShell, GameBar, HeatStrip, HomeMap, MenuSplash…)
    and appears in no stylesheet, so every one of them silently falls back to
    the body font where a typewriter face was intended. `.fluo-mono` is the
    real class. Pre-existing and unrelated to this patch — left alone because
    fixing it changes the look of eight screens nobody asked me to touch.
  - SioModal's Say It popup still carries the "Say in French:" kicker, "Tap to
    speak" and the keyboard legend — all litmus-test casualties on the WorDrill
    side. That surface was not in the handoff; verify31 scopes its prose checks
    to the WorDrill branch rather than pretending the popup was cleaned.
  - No screenshots: the mic path needs a real device and a signed-in build.

---

## Patch 30 — the profile as one learner model (22 Aug, from Dan's design handoff)

Branch `claude/profile-learner-model`, check = `verify/verify30-profile.py` (26),
harness `work/profile/shoot.mjs` (ad-hoc, playwright not added to the lockfile;
`.png` not committed). Whole suite green: 20 scripts, 0 failures.

- **ONE page, TWO routes.** `src/components/ProfileContent.tsx` renders at both
  `/moi` and `/profil` — Dan's call over a redirect, so the account chip,
  printed handouts and old bookmarks all land rather than hop. `MoiContent.tsx`
  is deleted; the old economy page is gone.
- **The shape.** Always visible: the pinned goal and the ONE next action —
  the two things you act on. Everything else is the record, collapsed, one
  section open at a time, each row stating its own value on the right so the
  page reads shut.
- **What Dan removed, and why** (all 22 Aug, in his words where they were his):
  CEFR self-placement ("how likely is it one gets to be A2 when in A1" — it was
  flattery, and the four-skill framing duplicated the weak list at a coarser
  grain); the weekly commitment `2/3` (unlabelled, therefore unreadable);
  N-levels ("we don't need levels lah" — `levelForXp` still names leaderboard
  rows, it is off the profile); the `→ SHOP` chip (redundant); the progress
  bars ("AND WHY ARE THE SPACE-OCCUPYING PROGRESS BARS BACK AGAIN??"); the
  `DUE · WEAK` tags on re-drill tiles ("all we need the SIO number, title
  word(s) and colored % (NOTHING ELSE!)"); full-width buttons.
- **Two lists became one.** "Due for review" and "What is shaky" showed the
  same outcome twice. `redrills()` is one queue carrying both reasons —
  WEAK is accuracy under the tier floor, DUE is the SRS interval elapsed —
  and they genuinely differ (SIO-019 at 77% is due; SIO-043 at 48% is not).
- **The learner model is derived, not invented** (`src/lib/learnerModel.ts`,
  learner-safe): coverage counts the spine's own `skill` field, so it is the
  same per-outcome accuracy regrouped, not a second taxonomy; the next action
  is a TEMPLATE filled from the SIO's `short` + `skill` (Dan: "template from
  SIO data — no AI"), four phrasings covering all fifty; the goal stores only
  `{ sio, by }` on `Progress`, because the fifty ARE the catalogue and the one
  thing it cannot hold is which you are aiming at and by when.
- **Full history is its own page** (`/moi/historique`, Dan asked for it during
  the build): the answer log and the per-exercise fold, uncapped — the profile
  caps at a screenful, completeness is the history page's whole point. Reached
  from the footer beside DETAILS and EXPORT (EXPORT writes the outcome table as
  a CSV, client-side, no endpoint).
- **Bottom bar = the five families minus User** (`🎯 ✏️ 🎮 🔖 💪`, FAMILIES
  order). This REVERSES the four-slot decision of 10 Aug recorded in nav.ts;
  Dan asked for it explicitly and confirmed it here. Index lost its slot
  ("Goals and Index to merge later on as one") but not its destination —
  Practice points at `/activities`, which is the Index. verify19 was rewritten
  to the new decision and now asserts the bar hand-keeps NO labels at all.
- **Typography gotcha worth knowing.** `.cahier-page p { font-size: var(--fs-body) }`
  is an element selector and outranks every Tailwind size utility, so a `<p>`
  cannot be small. Mono labels are `<span className="block">`; only real prose
  stays a `<p>`, where body size is what it should have been anyway. The header
  name takes `--fs-h2` from the scale rather than the h1 default.
- **Superseded checks, rewritten not deleted:** verify26 §3 (the patch-26 hero
  and segments are asserted GONE, its outcome fold and heat-strip still
  asserted present), verify27 (two file references moved to the new modules),
  verify19 §3 (the bar).
- **Dan still has to decide:** what consumes an ILLS note. It stores and reads
  (`src/lib/blockers.ts`, device-local, three a week) and NOTHING acts on it —
  which makes it a diary, and Dan named the two ways it earns its place:
  push its SIO into the queue regardless of schedule, or land on the teacher's
  dashboard before class. Until one is chosen the row is honest but inert.
- **Also not done:** FRILLS is honestly empty — nothing in the app stores
  recordings or drafts yet, so the three slots name what they will hold rather
  than invent a count. The `‹ PROFILE` link and the ⌛ top-bar icon both point
  at /moi, so on the profile ⌛ is still a door to itself (noted in the design
  chat, not fixed here).
- **Pre-existing, unrelated, observed while shooting:** `.cahier-bottombar`
  declares `display:flex` at class specificity, which beats `sm:hidden` in the
  cascade — the phone bar is visible at desktop widths too. Untouched by this
  patch (BottomBar.tsx and globals.css are unchanged); worth a look on its own.

---

# Notes per patch (17 Aug) — the detail behind the table

## Track D — what was done, what was left, what Dan must confirm (17 Aug, Peers)

Branch `pm/track-d-help-ladder` (on top of `pm/integration`), check =
`verify/verify28-trackd.py` (165 checks: the machine + generators run in
node, 66 rows; the 22 eval cases run against the rule grader). Spec =
`docs/TRACK_D_HELP_LADDER.md`.

- **One machine.** `src/lib/help/ladder.ts`: FRESH → TRY → HINT_1 → HINT_2 →
  REVEAL / RETRY_AFTER_REVEAL → DONE; pure, clock-free (`step(ladder,
  event)`). `useHelpLadder` is the React glue: records EVERY attempt through
  `recordItemResult` with the rung actually shown (`assistance`,
  `hintsTaken`, `revealed`, so `independent` is true only for first-try
  no-hint), queues a hinted/revealed item for ReVue when it closes
  (`queueForReview`, due now), logs `help.rung` per transition (+ the old
  `hint.tap`/`answer.reveal` with `auto`). The Finale keeps its five-rung
  ladder (now in `hints.ts`).
- **"Stuck" — Dan to confirm the numbers** (`LADDER_CONFIG`): typed/cloze
  climb on every wrong try and after **20 s** idle (hints only — idle never
  reveals); say after **2** wrong / 30 s; MCQ on every wrong pick, no idle,
  no cold hint; flashcard test may reveal cold; reveal never before one
  attempt anywhere else. Every hinted or revealed item is queued for ReVue
  at interval 0 (a clean retype after a reveal is NOT credited an
  interval) — confirm that is the intended severity.
- **Drills changed behaviour** (Dan should try them): iComplete/GramMarathon
  no longer end on a wrong answer — the tray says "Not yet · Try again", a
  hint chip appears, the field stays live; the third wrong shows the answer
  and asks for it to be typed ("Type it"). EtuDice/SpecuLearn/lesson MCQ: a
  wrong pick is struck and the learner picks again (≥ 3 options); the second
  wrong reveals. 4Mémoire test: `?` replaces 💡 Révéler. WorDrill: the 🔤
  peek is the answer rung (recorded), two misses climb by themselves.
  First try scores; every try is a response record.
- **The `?` control lives in the shell bar** (with rung dots), the hint
  chips under the item, WHY at the tray's right — not "top right of the
  answered question" as AGENTS.md words it; the tray IS where the answered
  question's verdict lives. Dan to say if WHY should move.
- **Evidence enum unchanged.** Post-reveal recall is `status met +
  assistance "answer"`; there is no `evidenceType: "assisted-recall"`
  (adding one = firestore.rules deploy). Readers derive it.
- **Row 7 = the lesson end "SIO write"** (`OpenFeedback`): one free
  sentence on the SIO's can-do; Correct me / Model answer;
  `functions/api/feedback.js` on **ChaTutor's key** (`ANTHROPIC_API_KEY`,
  OpenRouter, `anthropic/claude-haiku-4.5`, Mistral fallback,
  `TUTOR_MODEL` override) — **cost ≈ $0.003 per check**, ~500 tokens; no
  new env var. 8 s budget then the rule grader (cloze tiers + word diff)
  answers, same shape. Model answer = the deck's first authored `example`
  (13/44 decks; the rest get screening only). No XP paid. Dan to confirm the
  provider/cost and whether ComposeIt / the /tts proofreader should move to
  this schema (not touched).
- **ÉcouTexte** is not on the `?` ladder (multi-blank sheet, own
  per-sentence reveal); a check after a reveal is now recorded as
  `assistance: answer` and queued. Pretests stay cold. The `dictation` and
  `ordering` kinds are specified and generated but no drill uses them
  yet.
- **Not done:** the LLM path of the eval cases has not been run against a
  deployed `/api/feedback` (no key here — run
  `curl -X POST /api/feedback` per case after deploy; `expect` in
  `evalCases.json` is the pass mark); the SioModal popup forms of
  iComplete/GramMarathon show hints inline (no shell bar there); no
  per-error 🔊; the teacher dashboards do not yet chart `help.rung`
  (`auto` vs asked, rung reached) — the events are flowing.
- Screenshots from a `REQUIRE_SIGN_IN=false` build (reverted before the
  last build and commit); harness `work/trackd/serve.py` + `shoot.py`
  (untracked, no .png committed).

## Loose bugs + data-truth — what was done, what was left (17 Aug, Peers)

Branch `pm/bugs-data-truth` (on top of `pm/integration`), check = `verify/verify27-bugs.py`.

- **Deck gates.** `/decks/[id]/study` for a curated id only ever redirected to
  `/practice/flip-it/<id>`, but the redirect sat inside `AuthGate` — a
  signed-out learner was asked to sign in to be sent somewhere that has its
  own gate. The redirect now runs first. `/decks/[id]` itself is NOT a redirect
  any more (patch 20–21 made it the 4Mémoire table), so it stays gated.
- **`No deck specified.`** was on three routes (`/decks/view|study|mcq`
  without `?id=`) → one `NoDeck` empty state inside the shell, "Open the
  Index". Not the deck-`[id]` `NotFound` (that one already had doors).
- **DeckContent.tsx** on cahier + tier + drill-bad tokens; 19b baseline
  re-run (`--rebaseline`): 904 → 773 stock classes, 542 → 506 raw hex.
- **`/sio/[id]`** — nothing linked to it except KeyNav's two-digit jump, and
  Home's popup (SioModal → SioDetail) is the same content, so it is a
  redirect to `/?unit=N#SIO-0NN` (the fifty static pages still build for old
  links/QR). KeyNav opens the popup on Home (sets the hash when already
  there). The "Planned" pre-test label was the same `getPretestForSio` logic
  the popup uses — if Dan still sees "Planned" where a pre-test exists, it
  is a `PRETEST_BY_SIO` gap in `content/pretests`, not a page bug.
- **DEPLOY.md** says `fluolingo-dot-com` (was `fluoguo`); banner kept.
- **`LAF1201` stays in the meta description** — decision recorded next to
  the string in `layout.tsx`: it is the course code people search for;
  English first, no French.
- **One "weak"** — `progress.ts`: `WEAK_BELOW = 50`, `GOOD_FROM = 75`,
  `tierFor(pct)`, `isWeakSrs(srs)` (interval ≤ 1 day: just missed, or
  repaired-but-fragile). Callers: outcomeRows `tierToken/tierClass` (the
  ledger re-exports them), the teacher's `missColor` (was miss ≥ 50/25 —
  off by one at 75 %), the Reviser's weak count (was interval === 0 — now
  counts fragile items too, so the "N weak" chip can read higher), /moi's
  signed-out SRS rows, the Finale's weighting.
- **One shuffle** — `src/lib/shuffle.ts` (Fisher–Yates, injectable rand):
  5 biased `sort(() => Math.random() - 0.5)` sites (conjugaison, three
  native lessons) and 17 private copies replaced; 24 files import it. The
  seeded ones (deck MCQ `stableShuffle`, Finale `mulberry32`) untouched.
- **D6 / D7 = the smaller fix, delete the readers.** `users/{uid}/sessions`
  had no writer in this repo (the old suite's docs carry a null activityId)
  and `users/{uid}/attempts` was never written. Teacher panel: time on task
  is the page-view estimate only; the "Attempts" KPI is now "Answers" =
  recorded responses; /moi lost its "⏱ N min on task" line (it was empty
  for anyone post-reset). `firestore.rules` still shapes both collections —
  harmless, left for the next rules deploy.
- **D9 delete / D10 round-trip.** `retried`/`mastered` were never written
  (`recordResponse` stores `met`/`missed` only) → gone from every reader
  (`isMiss = missed`; the rules enum still lists them, harmless). The
  evidence block (`outcomeId`, `evidenceType`, `assistance`, `assistCount`,
  `independent`) was written since 10 Aug and read by nothing → teacher
  `data.ts` parses it, `outcomeOf(answer)` prefers the stored `outcomeId`
  over the item join (every fold, ClassNow, the recent-answers table), the
  teacher's Recent answers gained an "Evidence" column, /moi carries
  `outcomeId` through. `assistCount` is stored but not shown (nothing asks).
- **D11.** `mergeProgress` already kept `timeZone` on this branch's parent,
  but as `local ?? remote` — the zone could belong to the OTHER device's
  `lastActiveDay`. It is now a pure module (`src/lib/progressMerge.ts`,
  re-exported by progressSync) that pairs the zone with the winning day, and
  verify27 runs a 15-row merge table in node (`--experimental-strip-types`).
- **Leaderboard identity.** `boardName(uid, displayName)` in
  `accountAliases.ts` = alias → display name → "Anonymous" (the publisher
  used to fall back to the email's local part). The board marks "(you)" on
  the folded canonical row for an aliased learner on her second account.
- **D4 diagnostic (cannot reproduce here).** `progressSync.push` stamps
  `lastSyncedAt` + the device's `lastSyncError`/`lastSyncErrorAt`/
  `syncErrorCount` on the progress doc; every pull/push failure is kept in
  `fluolingo:syncState` and sent as a `sync.error` event (separate
  collection — a rules denial on the doc still gets out). Teacher student
  panel "Last sync": red **STALE — active <when>** when the learner's newest
  event is > 12 h past the doc, plus the error count and last message. In
  week 1 Dan opens the two learners and reads the KPI.
- **Not done:** replaying `responses` into the device ledger after sign-in
  (patch 24's note); a rules edit dropping `sessions`/`attempts`/the two
  statuses (needs a deploy); the plan's "delete `import-fluoduo` on
  dckg/fluo" (needs push access — Dan).

## Patch 26 — what was left out or decided on the fly (17 Aug, Peers)

- **Outcome rows are one fold, three readers.** `src/lib/outcomeRows.ts`
  (learner-safe: spine + content only) turns any `{item, status}` list into
  outcome rows — `outcomeForItem` → SIO, items nested, `weakItems` = items
  missed ≥ 50 %, order `missed × weakItems`, the unresolvable rest in ONE
  "Not yet mapped" bucket pinned last. /moi's Fix segment, the teacher
  student panel's "Hardest outcomes" (was "Hardest items", flat) and the
  matrix all read it. `retried` counts as a miss (first try failed).
- **The heat-strip is on four pages**: /moi (under the hero, cells → the
  Index row `/activities?unit=N#SIO`), the teacher student panel (top of
  the modal), the teacher **Class now** board (the class column as one
  strip, above the matrix), and the **Index** (compact `size="sm"` under the
  unit control, from the device ledger summed across activities; a tap
  moves to that outcome's row). NOT Home — the hero is frozen (patch 25) and
  the map already is the syllabus picture. Index rows now carry
  `id={sio.id}` so `#SIO-0NN` lands (an effect scrolls after hydration).
- **/moi**: hero = chips (✓ done, 🎯 accuracy, 🔥, ⭐, 🔁 due) + two 3 px
  hairlines (Course, Accuracy), 90 px at 390 (Home's is ~99). Six tabs →
  four segments **Fix · Exercises · History · Journey**: "Where I lose marks"
  → Exercises; "My hardest items" → Fix (outcome rows); "Strong vs weak" →
  the heat-strip (it IS that list, without the words) and, signed out, the
  Fix rows drawn from `itemSrs` (interval ≤ 1 day = weak — the old rule);
  "My tips" → gone (the top Fix row IS the tip; the 🔁 due count is a hero
  chip); "Journey" keeps the six fun numbers + the marathon CTA. Every list
  is `Capped` at 5 with "+N more". `void rows;` and the `Math.random()` key
  died with the rewrite. Stock palette count fell 904 → ~826.
- **Teacher**: new first/default panel **🟢 Class now** — 16 tiles (2-up on
  a phone, 4×4 from sm), worst-first (`tileRank`: stuck, then lowest last-10
  accuracy, then no data, absent last), name · live/today/absent dot · last
  five ✓✗ (tooltip = outcome) · the last outcome's short · a last-10
  hairline. **Stuck = 3 consecutive misses on ONE outcome inside 20 min**
  (red tile, ⚠). Under it the class heat-strip and the **outcome × student
  matrix** (50 rows grouped by unit, a column per learner, `Class` last;
  cell = tier of that learner's accuracy on that outcome; a click on a name
  opens the student). Overview stays (its KPIs / day drill-down were asked
  for) — Class now is added, not swapped in.
- **One fetch**: `fetchClassDetails(roster)` — pool of 4, tiles land as
  each learner arrives — feeds Class now, the matrix, Evidence, the
  analytics CSV and the student modal (`cached ?? fetched`). **The `Compute`
  button is gone**: Evidence is a `useMemo` over the shared map. **Repoll
  every 30 s** = `fetchResponsesSince(uids, lastPoll)` — a single-field
  `timestamp >` range per uid (no composite index), prepended into the map;
  paused while the tab is hidden. Cost: 16 full response reads on open
  (was 0 until someone pressed Compute), then only deltas.
- **Screenshots of the teacher page use a fixture.** It cannot render
  without live Firestore + an admin sign-in, so `src/app/teacher/fixture.ts`
  fabricates sixteen `Élève Un…Seize` (deterministic PRNG, real item ids,
  two "live", one stuck) behind `NEXT_PUBLIC_TEACHER_FIXTURE=1` — inlined at
  build, dynamic-imported, `canView` opens for it. A clean build still emits
  the fixture as one orphan chunk no page references (Turbopack does not
  drop the dead dynamic import); verify26 checks that, verify18b stays
  green. **Never set the flag for a deploy.** /moi shots are the signed-out
  device view (progress + ledger seeded) — the Fix rows there come from
  `itemSrs`; the answer-log rows look the same with ✗ counts.
- Not done: the /moi ▶ on an outcome row goes to the Index row, not
  straight into a drill (Dan to say if it should open 4Mémoire); "Not yet
  mapped" has no practise link (nothing to link); the matrix has no
  per-cell click-through (title only); Class now's presence dot reads
  events + answers, not a heartbeat — "live" = anything inside 5 min.

## Patch 24 — what was left out or decided on the fly (17 Aug, Peers)

- **Rows are SIOs, not decks.** All 50 SIOs own exactly one curated deck and
  no curated deck is outside a SIO (checked in verify24), so nothing fell off
  the Index. Ten rows per unit; the row's stop number is the one on Home and
  links to `/?unit=N#SIO` (✓ in green once the outcome is marked done).
- **Chips vs buttons is decided by content, not taste** (`src/lib/indexMatrix.ts`):
  xPlain, 4Mémoire, WorDrill exist for every deck → per-row buttons; the seven
  content-gated ones (SpecuLearn, EtuDice, iComplete, GramMarathon, ComposeIt,
  VocabulaRain, LexicaLater) are the chip rail, in registry (family) order.
  Pre-Test folds into the SpecuLearn cell (Dan, 2026-08-10). Match It stays
  off (KIV). Eligibility comes from `deckActivityTabs()` — not re-derived.
- **The cell's data is a device-local ledger** (`src/lib/activityLedger.ts`,
  `fluolingo:activityLedger`), written once from `recordResponse()` — the one
  place every graded answer already passes — keyed activity → SIO →
  {right, wrong}. NOT synced: two devices, two ledgers; the synced truth is
  still `users/{uid}/responses`. Replaying responses into the ledger after
  sign-in is on the data-truth backlog (#10). VocabulaRain, ComposeIt,
  NumBus/NumBourse tally only what they already record; games that record
  raw French (no item id) still resolve through the activityId's deck.
  Tier scale = /moi's (red < 50, amber < 75).
- **Only three hubs existed to delete** (patch 23 had already turned the four
  game galleries into ▶ Jouer + sheet): `/practice/flip-it`,
  `/practice/grammarathon` (ActivityHub) and `/practice/speculearn` (tile
  gallery). All three are redirect stubs → `/activities?activity=…`; the
  registry hrefs point straight at the Index (verify19's route check reads
  the path part). The SpecuLearn gallery's "Why guess first?" NUS paragraph
  went with it — the registry blurb keeps the claim; Dan to say if the
  citation should live somewhere (HELP?).
- `?activity=flip|lesson|wordrill` (from the 4Mémoire / WorDrill flaps)
  focuses that row button (its hue) and the cell reports that activity; the
  chip rail shows no selection. `/practice/dice` and `/practice/complete-it`
  never had index pages and still do not (registry hrefs stay null).
- `?gaps=1` (GapsView) is reached only by URL — nothing in the learner chrome
  links it. It counts xPlain as a gap when no lesson is AUTHORED (the deck
  lesson still renders). Today: 189 gaps across 8 columns.
- Search stays (word-level, Dan 2026-07-08); a live query spans all units and
  dims the unit control. "Your decks" (MyDecks) stays at the bottom.
- Not done: the `?unit=` default is the learner's next SIO's unit (same as
  ▶ Continue) — a class-flag default was not attempted; no legend for
  disc / ring / dash (title + aria-label only, per the litmus test); the
  gaps table scrolls sideways on a phone (it is Dan's desktop view).
- Screenshots from a `REQUIRE_SIGN_IN=false` build (reverted before the last
  build and commit); harness `work/patch24/serve.py` + `shoot.py`, committed
  this time (`work/patch*/` is gitignored — added with `-f`).

## Patch 25 — what was left out or decided on the fly (17 Aug, Peers)

- "One unit per screen": the 2D map box snaps band-to-band on a **vertical**
  swipe (scroll-snap) and lands on the current/deep-linked unit; bands are
  stacked so the road stays one road, as Design drew it — NOT a horizontal
  pager. Dan to confirm.
- Class flag 🚩 = `CLASS_FLAG_SIO` in `src/content/chapters.ts` (hand-set,
  SIO-010) — nothing in progress/cohort exposes a per-week position yet.
  The road is paved to the flag, dotted beyond; the learner's travelled
  stretch wears the equipped accent.
- The hero's ▶ Continue still links `/unit/N#SIO` (untouched per the
  hero-freeze); it lands via the redirect. Point it at `/?unit=N#SIO` when the
  hero is next opened.
- `KIND_LABEL` stays French (vocabulaire/grammaire/…) in the map legend —
  the app-wide choice from 2026-07-08; Design's legend was English.
- Legacy `/unit/N` pages still build (five redirect stubs) because the shell's
  Unité flaps, DrillShell's back link and old bookmarks point there.

## Patch 23 — what was left out or decided on the fly (17 Aug, Peers)

- **Hearts stay in the games that had them** (NumBus, NumBourse, LexicaLater):
  GameBar v2 draws ♥♥♡ when the game keeps lives and nothing otherwise.
  DrillShell's "no hearts" rule was about *curriculum drills*; the games are
  arcade play. Dan to confirm or strike.
- **The queue is `itemSrs`.** `queueForReview(ids)` (progress.ts) drops each
  miss to the due-now rung — exactly what `dueForReview` reads — the moment
  the post-mortem mounts; `CORRIGER MAINTENANT` opens `/reviser?items=…` and
  the reviser page puts those at the head of the session. It does NOT call
  `recordItemResult` again (the game already graded/paid the attempt).
- **Number games' misses reach the queue only when the course has the row**:
  NumBus/NumBourse deal spoken numbers, not deck items; `reviewItemByFrench`
  matches the words against `numbers-0-20/20-69/70-99`. A number outside
  those decks is listed on the post-mortem (with "where it goes" → SIO-007)
  but cannot be queued. VocabulaRain tiles match the same way (by French);
  Match It queues the mis-chosen completion (the item it graded).
- ComposeIt has no graded misses (AI feedback) — its GameOver shows the bill
  / le bilan du prof and « Sans faute ». The scenario reminder line stays on
  the board (Dan, 2026-07-19) — the one instruction not moved to Help.
- VocabulaRain's pre-game study table stays (Dan, 2026-07-04) minus its
  blurb; LexicaLater's blinking red "Drag down a chest" and pointing hands
  are gone (WCAG flash risk + litmus) — the down-arrows remain.
- The four game galleries are one card + sheet; the *drill* hubs
  (`/practice/flip-it`, `/practice/grammarathon` → ActivityHub) were not
  touched — patch 24's Index work owns those.
- Screenshots were taken from a build with `REQUIRE_SIGN_IN=false` (the wall
  is Google-only, no headless path); the flag was reverted before the last
  build and commit. Harness: `work/patch23/serve.py` + `shoot.py`.
- Match It now sits behind AuthGate like the other five (it was the only
  game without the wall).
- Not done: a per-game *why* button on the post-mortem rows; keyboard `?`
  for Help; the two-pane record for ComposeIt on tablets < 1024px.

## Rules that stay

- Peers builds, `main` is the sole push path; every patch = verify script + screenshot.
- Dan's litmus test (AGENTS.md). Grammar guard-rails (no imperative outside SIO-008).

## Patch — the approved guidance flow, part 2: the notebook + one Next › (24 Aug)

Finished a prior agent's partial edits (killed mid-task; `src/lib/nextStep.ts`,
`DrillShell.tsx`, `GameOver.tsx`, `verify20.py` already carried its work) —
did not start over, closed the two gaps it left open:

- **DrillShell now lives inside the cahier notebook** — `cahier-foolscap` +
  spiral binding + a `PageBand` on top (family colour via `fam-<key>`, the
  drill's own progress figure moved into the band's ONE chip so it is never
  printed twice), phone bottom bar kept, 100dvh/fixed-footer intact. This part
  was already done. Games (`GameFrame`) untouched, as scoped.
- **`nextStep.ts`** (114 lines, already complete) resolves the next undone
  step of a stop's practice chain — Pre-Test/SpecuLearn → Memo → EtuDice →
  4Mémoire → iComplete, in `activities.ts` registry order, "undone" read off
  `activityLedger.accuracyFor` — or the next stop's first step via
  `continuer.nextSioId` when the chain is clear. Anchors on `sioId` →
  `collectionId`'s SIO → (deckless surfaces: ConjugaZone, a spoken-number
  game) the learner's current stop on the path. Verified correct as written;
  no logic changes needed.
- **Finished the two callers that still had no `activity`/`deck`/`finish`
  wiring**, so the band and the single « Next › » actually appear where Dan
  approved them:
  - `src/app/lessons/pager/LessonPager.tsx` — `activity="lesson"`,
    `deck={collectionId}`, and `finish={{ repeat: build }}` on the end card;
    dropped its own Continue/↻ Try again buttons now that the shell's finish
    row owns that footer.
  - `src/app/conjugaison/page.tsx` — `activity="conjugaison"` (deckless —
    verb picker, not one SIO), `finish={{ repeat: restart }}` once the run
    reaches the reward table (the table screen IS the finish screen here);
    `↻ Again` retired in favour of the shell's Repeat.
- GameOver.tsx was already complete: misses-first ordering (CORRIGER
  MAINTENANT stays primary with misses queued), « Next › » promoted to
  primary only on a clean run («✓ Sans faute»). Confirmed live in the
  GameOver screenshot below (3 misses → CORRIGER MAINTENANT primary, Next ›
  secondary).

**Checks**: `npx tsc --noEmit` clean; all 25 `verify/*.py` suites green (incl.
`verify20.py`, `verify23.py`, `verify28-trackd.py` — none needed a fix, none
pinned stale chrome). Dev server on :3777; `REQUIRE_SIGN_IN` flipped to
`false` for screenshots, restored to `true` before finishing (no net diff on
`authConfig.ts`).

**Screenshots** (`scratchpad/flow-build/`):
`01-conjugaison-notebook.png` (ConjugaZone drilling inside the notebook,
purple band, `0/18` chip), `02-drill-finish-next.png` (ConjugaZone's finished
table: ✓ chip → `1 🔮 SpecuLearn` → primary Next ›, Repeat/Back quiet),
`03-gameover-next.png` (NumBus GameOver, 3 misses: CORRIGER MAINTENANT
primary, `7 🔮 SpecuLearn` chip + secondary Next ›).

## Patch — the approved guidance flow, part 1: the numbered path + the tour fix (24 Aug)

Finished a prior agent's partial edits (killed mid-task by a server error;
`SioModal.tsx`, `FirstTour.tsx`, `HomeDashboard.tsx`, `AuthGate.tsx`,
`CahierShell.tsx`'s `deckActivityTabs` order, and the `globals.css` rules were
already written). `git diff` first, confirmed every requirement was already
coded correctly — nothing needed rewriting, only proving and checking.
`UnitSection.tsx` needed no change: it just passes `popupActivityTabs()`'s
list straight to `SioModal`, which already does the numbering.

- **The SIO sheet's practice chain renders as a numbered vertical path**
  (`SioModal.tsx`'s `CHAIN_KEYS`): Pre-Test → SpecuLearn → Memo → EtuDice →
  4Mémoire → iComplete, filtered to whichever of those six exist for the
  open SIO's deck (confirmed on SIO-001, which has no SpecuLearn/EtuDice —
  the path renders 4 steps, not 6, with no gap). Number chip + emoji + name;
  done reads `activityLedger.accuracyFor()` off the device ledger (pretest
  folds into the speculearn key, matching how the ledger itself already
  folds it); done = ✓ + 55%-opacity muted, the first undone step gets the
  practice family's wash/ink + a `›`. No prose added — every string is an
  existing registry label or a single glyph.
- **FirstTour rebuilt to 3 steps** ending ON Play, replacing the stale
  4-step tour (❓ HELP, ❓ Guide, a desktop drag step, "Pre-Test first, then
  the cards" — none of it still true). Step 2 spotlights the bottom bar;
  its Next button sits **above** `--bottombar-floor`, and the whole overlay
  now portals to `document.body` at `z-[100]` (was `z-[80]` inside the page
  tree while the bar sits at `z-90` — the exact bug the flow walk
  reproduced, "Skills tab eats the Next tap"). Step 3 ("Start here") is a
  finish card whose one button IS Play, computed the same way the hero pill
  computes it (`nextSioId(loadProgress())`) — the tour finally hands off to
  the thing it's teaching instead of ending on itself. The unit tour's
  "Pre-Test first, then the cards, then the Lesson" line (which contradicted
  the path's authored order) is gone too.
- **`deckActivityTabs`**: 4Mémoire now precedes iComplete, matching
  `activities.ts`'s authored family order — the SIO popup's flap order and
  the numbered path can no longer disagree (flow-walk finding: they did).
- **Play's first-visit halo**: `fluo-play-halo` class added to the hero
  Play pill only while `doneTotal === 0`; a `::after` pulse ring (CSS
  `@keyframes`, `prefers-reduced-motion` respected — falls back to a static
  ring, no animation). Dies with the first completed goal.
- **AuthGate "Back to the path"**: was a hard `href="/"`, dropping a learner
  who unlocked from a stop's sheet onto Home instead of back at the sheet.
  Now `history.back()` when there's history to go back to, `/` fallback
  otherwise. "Locked routes keep their page chrome where feasible without
  touching DrillShell" — checked, not built further: routes that already
  nest `AuthGate` inside their own `CahierShell` (e.g. `decks/[id]/study`)
  already keep chrome regardless of sign-in state; the routes that don't
  (pretest/practice/lesson/game pages) are the "full-screen in DrillShell"
  pattern, where chrome is DrillShell's to add — out of this session's file
  scope by the task's own boundary, and now that part 2 has DrillShell
  rendering inside the cahier notebook (see the section above), those
  routes will get real chrome once `AuthGate` moves inside that wrapper
  rather than around it. Left for whoever owns that file next.

**A real bug found and fixed along the way, not in any file this session
owns**: the Turbopack dev server (`next dev`, no flag — Next 16.2.7) silently
dropped every CSS rule in `globals.css` from `.sio-path` to EOF (the numbered
path, the halo, all of it) on every request, reproducibly, even after
deleting `.next` and a from-scratch restart — while `next dev --webpack` and
a direct `postcss([require("@tailwindcss/postcss")()])` run on the same file
both include the rules correctly (verified: `getComputedStyle` showed
`border-radius: 0px` under Turbopack, `13px` under webpack, byte-identical
source). Not a source bug — confirmed by loading the file standalone through
`lightningcss` and through the real `@tailwindcss/postcss` plugin, both
kept every rule. Screenshots below are shot on `next dev --webpack -p 3777`
for this reason; the dev-only Turbopack truncation should be flagged to
whoever next hits inexplicably-missing styles at the tail of `globals.css`
on the default dev server.

**Checks**: `npx tsc --noEmit` clean; all 25 `verify/*.py` suites green.
Dev server on :3777 (`--webpack`, see above); `REQUIRE_SIGN_IN` flipped to
`false` for screenshots — restored to `true` (found already restored by
part 2's concurrent session; confirmed via `git diff` showing no net change
before finishing).

**Screenshots + the tap-proof** (`scratchpad/flow-build/`):
`04-sio-path-full-chain.png` (SIO-041, ledger seeded so steps 1–3 read done
✓ and step 4 EtuDice is next-undone accented — the full 6-step order visible
at once), `02-sio-path.png` (SIO-001 cold, 4 of 6 steps — proves the filter),
`01-home-halo.png` / `06-halo-zoom.png` (Play's ring, forced to a mid-cycle
frame for the zoom since the animation fades most of each 2.2s loop),
`03a`/`03b`/`03c-tour-step*.png` (the 3-step tour). The click proof is not
just visual placement: a Playwright script measured the Next button's box
against `nav.cahier-bottombar`'s box (button bottom 741.8px, bar top 786px —
clear), ran `elementFromPoint` at the button's centre (returned the button
itself, not the bar), then called Playwright's own `.click()` — which
performs its own actionability hit-test and fails if another element would
receive the event — and confirmed the tour actually advanced to the "Start
here" card afterward. All four checks passed; script + full JSON output description above.

## 24 Aug — SpecuLearn objets-articles veto applied; boissons attribution restored

Two cleanups against the `eff47dd` merge, not new build work:

- **SpecuLearn objets-articles: the six-item reversal is vetoed.** The 24
  Aug build (`4158e2f`) had drawn purpose-made SVGs for gomme, agrafeuse,
  portefeuille, trousse, mouchoirs, passeport instead of honouring
  `SPECULEARN_ITEMS.md`'s bans on those six as unpicturable. Dan reviewed
  the actual renders (via a parallel Cursor session) and ruled: *"Veto all
  six, restore your original bans, ship at 14."* All six are back in
  `SPECULEARN_EXCLUDED_ITEMS`; the six SVGs are deleted from
  `public/objets-articles/` (recoverable at `4158e2f` if ever revisited);
  `SPECULEARN_ITEM_IMAGES` stays as the mechanism, now empty — Dan, on
  whether to migrate it into deck JSON instead: *"Leave it in TypeScript,
  it's a short list, don't over-engineer."* objets-articles is back to
  14/20 playable; colors and transport untouched. Totals across the three
  decks: 34 playable / 10 banned, matching `SPECULEARN_ITEMS.md` exactly.
  See its appendix for the full ruling and the doc updated in place.
- **Boissons attribution restored.** Resolving the `eff47dd` merge conflict
  in `docs/CONTENT_FLAGS_2026-08-23.md`'s boissons-closure bullet had
  picked the more detailed side and silently dropped the quoted
  `(Dan: "add the missing boisson part")` from the earlier wording — a
  defect in that merge, not a content decision. Restored alongside the
  detailed wording; nothing else in that bullet changed.

A third agent's local reset discarded an unpushed commit (`4a69dbf`) that
had made the same two fixes independently before this one landed — it was
never reachable from this checkout's object database, so nothing was
recovered from it; both fixes were simply redone here from the same source
material and pushed straight to `origin` to close the window for a repeat.

## 24 Aug — latent Complete It indexing bug (not fixed, flagged only)

`CompleteItContent.tsx`'s `buildEntries()` (`src/app/practice/complete-it/[collectionId]/CompleteItContent.tsx:114`)
builds each question's `itemIdx` from position in `practiceItems(deck)` (line
117), which filters out `role:`-tagged items (`src/lib/collections/display.ts:62`).
The render then reads `deck.items[entry.itemIdx]` (line 164) — indexing into
the *unfiltered* array. The two only agree when nothing is filtered out.

`possessives.json` (the deck this was checked against) carries no `role:`-
tagged items, so its expansion is unaffected. But this is not merely
hypothetical: `directions-matching.json` mixes 21 `role:`-tagged items with
19 full phrases (40 total), and Complete It is ungated — `deckActivityTabs()`
registers the `complete` flap for every curated deck unconditionally
(`CahierShell.tsx:600`) — so that deck has the flap live today.

Correction to an earlier overstatement of the symptom: prompt, answer, hints
and grading all derive from the same single lookup at line 164, so each
question stays internally self-consistent — it never mismatches its own
prompt and answer. What actually breaks is *which items get drilled*: the
`role:`-tagged fragments the filter exists to hide become the ones served
(their positions in the filtered array collide with early indices into the
unfiltered one), and full-phrase items past the filtered array's length are
never reached at all. So on `directions-matching`, some questions likely
drill role-fragment items that should have stayed hidden, and the tail of
the 19 full phrases likely never appears. Latent, not urgent; flagged here
so it doesn't cost someone an afternoon of confused debugging. Fix, when
it's next touched: build entries by item id (or index within `deck.items`
directly, applying the `role:` filter at read-time too) rather than mixing
an index space from one array with lookups into another.

## 24 Aug — closing state, and a process lesson from today's collisions

**Final state as of this commit:** `origin/main` and `live/main` are both at
`8e0b6d0` (PR #35 — the objets-articles veto + the first boissons-quote
restore attempt) and deployed; this commit + PR #36 add the indexing-bug
flag, the SpecuLearn appendix veto write-up (with Dan's render-review
findings and his style-mismatch reasoning), and the possessives
implicit-switch completion above. Once merged and deployed, `origin/main`
and `live/main` will both sit one commit ahead of `8e0b6d0`. SpecuLearn's
objets-articles is live at 14/20 (the veto applied); Dan's boissons
attribution — `(Dan: "add the missing boisson part")` — is restored in
`docs/CONTENT_FLAGS_2026-08-23.md`.

**The lesson, stated plainly because it cost real rework three times today:**
both `docs/CONTENT_FLAGS_2026-08-23.md` and this file were edited
concurrently by more than one agent — a Claude Code session and a separate
Cursor session, working on the same repo checkout pattern, sometimes at the
same time. That is exactly what dropped Dan's boissons attribution twice
(once in an earlier merge, a second time when a `git reset --hard` on his
machine discarded a session's uncommitted fix before it could land), and
what produced a duplicated SpecuLearn-veto write-up attempt (a second
session did the identical two doc edits independently, only to find PR #36
had already shipped them, and correctly stood itself down rather than
committing a conflicting version).

This file's own rule at the top — "Only ONE agent edits this file at a
time; say so in your commit" — is not new. It was not followed today. The
fix is not a new rule; it's actually following the one that already exists:
before starting a doc edit here or in `CONTENT_FLAGS_2026-08-23.md`, check
whether another session's work is already in flight (an open PR, a stash,
a running agent) before writing a competing version, the same way the
stood-down session did on its second pass today.

## 24 Aug — the Index gets a key ("I really don't understand how to read it")

The one open, unassigned item flagged 22 Aug: the U0–U4 unit grid and the
per-row circles carried no legend — colour and shape were the whole
message (litmus: decorative elements exempt, the tooltip is the label),
but nothing on the page itself decoded them for a first-time reader, and a
tooltip never shows on a phone. Not a case the litmus test's "redundant
text" rule covers — removing the decoder for a colour-coded grid would
leave the user unable to read the page at all, which is the test's own
bar for what stays.

**Built:** a `?` button next to the "📖 Index" heading (`IndexKey` in
`src/app/activities/page.tsx`), same on-demand pattern as `StatsHelp.tsx`
(closed by default, `aria-expanded`, dismiss on outside tap) — not inline
text. Opens a small popover naming exactly four things: the stop circle
(number → tap to go there, green ✓ once done), the tried cell (tier-toned
disc + your accuracy), the open cell (hollow ring — there, not tried), the
dash (nothing authored), and the three row-button quick links. Positioned
`fixed` + viewport-centred rather than anchored to the button — the
button sits mid-header-row, and a button-relative popover that wide ran
off the right edge of a phone screen in testing; fixed to centre before
shipping.

Guarded by nine new assertions in `verify/verify24.py` (component exists
and is rendered, starts closed, carries `aria-expanded`/`aria-label`,
names all four states in its own text) — 58 → 67 assertions in that file.
Screenshots taken on a 390px viewport (closed header row, open popover)
and sent to Dan directly — not checked in; `scratchpad/` is working-only.

Verified: `tsc` clean, all 26 verify suites green (867 total assertions),
`npm run build` clean. `REQUIRE_SIGN_IN` flipped to `false` for the dev
screenshots, confirmed restored to `true` before this commit.


## 25 Aug — the Menu tile EtuDice is renamed Sorting (display only)

One name had drifted onto three different things:

- `DiceConfig.newQuestion()` (`src/content/lessons/native/types.ts`) — a
  generator that emits a fresh instance of the same structure on every call.
  30 native lessons ship one; `buildCards.tsx` calls it per card and renders
  the same instance as an MCQ, a gap-fill and a build. **This is what Dan
  means by the dice** — *"switching to a different variation of the same
  structure, nothing more"* (25 Aug).
- The d12 in the lesson pager (`DIE_SIDES = 12`) — which does NOT vary
  anything: `setQueue((q) => q.slice(entry))` cuts cards off the front, so
  face 1 = all 12 cards and face 12 = one card. It is a run-length dial, and
  because the ramp runs easy → hard (4 MCQ, 4 gap, 3 build, 1 translate) a
  high roll is shorter *and* harder. **Unresolved — see below.**
- The Menu tile "EtuDice 🎲", whose blurb read *"Roll the d12 — it sets your
  starting card on the lesson ramp"* while the tile actually opened
  `/practice/dice/[collectionId]`: a group-sorting MCQ over the deck's
  Letris columns. No die, no variation.

Dan's ruling: *"if it is a sorting exercise that got created accidentally,
then i suppose we keep it, and maybe call it Sorting for now."* So the tile
is **Sorting 🗂️**, blurb *"Which group does each word belong to?"* — and
"EtuDice" now names only the d12 in the pager.

**Display rename only.** The registry key stays `"dice"`, so the route
`/practice/dice/[id]`, the deck tabs, `hasDicePractice()`, the activity
ledger keys (`dice-practice:`) and every saved progress record are untouched.
Changed strings: the registry row + its mergers note (`activities.ts`), the
drill's prompt / empty state / fallback emoji (`PracticeContent.tsx`), the
history label `KEY_SURFACES["dice-practice"].name` "Dice" → "Sorting"
(`labels.ts`), and the comments in `CahierShell`, `MenuSplash`,
`RailGroups`, `nextStep`, `SioModal`, `hints` that named the tile. Pinned in
`verify/verify29-rail.py`'s `EXPECT["practice"]`.

Verified: verify19/20/22/28/29 green (23/57/28/165/22), `tsc --noEmit`
clean, `npm run build` clean. In `out/`, the only surviving "EtuDice" is the
pager's own roll card — which is correct.

**The entry die is deleted.** Dan, same day: *"drop the shortcuts, learning
should not allow that."* `DIE_SIDES`, `ROLL_ENTRY` and `rollLabel` are gone
from `buildCards.tsx`; the roll card, its state (`face` / `rolled` /
`rolling` / `rollTimerRef`) and the `"roll"` branch are gone from
`LessonPager.tsx`; `exStart` is now `rules.length` and the denominator
`rules.length + ramp` (it used to carry a `+ 1` for the roll card). Every
learner walks all twelve cards — 4 MCQ → 4 gap → 3 build → 1 translate — in
order. The Sorting drill's leftover dice language went with it: its restart
button was "🎲 Roll again" (now "Sort again"), its end copy said "Roll
again" / "Keep rolling", and its low-score emoji was 🎲.

`verify22.py` now asserts the absence rather than the mechanism: no
`ROLL_ENTRY`, no `DIE_SIDES`, no `q.slice(` in the pager, no `"roll"` card.
That last one is the real pin — the failure mode to prevent is not the die
coming back by name, it is anything trimming the ramp before a learner walks
it.

Verified: verify19/20/22/28/29 green (23/57/30/165/22), `tsc --noEmit`
clean, clean `npm run build` clean, and a from-scratch `out/` contains no
"EtuDice", "🎲 Roll" or "roll for your start" anywhere.

**Not verified in a browser.** The pager sits behind `REQUIRE_SIGN_IN`, and
flipping that flag locally (the patch-23 precedent) was blocked by this
session's permission classifier, so the walk-through was static only: the
card sequence and denominator were re-read and reasoned through, not
observed. Worth one manual pass on a signed-in run before this is deployed.


## 26 Aug — the demand band: an activity's page is coloured by what it ASKS

Dan: "all the activities [should] have a uniform colored band at the top …
genuinely colored bands representing the activity (like on the PROFILE page)."

The band already existed — every drill draws `PageBand`, coloured from
`--fam-ink`. But the family axis says where an activity LIVES in the menu
(Practice, Review, Skills), which is a fact about navigation, not about the
learner. On the activity's own page the useful fact is what it DEMANDS. So a
second axis now takes that band, and the family keeps the rail, the Menu and
the section pages.

Five branches, in the order of the evidence ladder already in
`lib/evidence.ts` (recognition → constrained → free / productive):

| band | asks | activities |
|---|---|---|
| `guess` | commit before you are taught | Pre-Test · SpecuLearn |
| `lesson` | the rule, then practice | Memo — the only door that teaches |
| `recog` | the answer is in view; find it | 4Mémoire · Sorting · Match It · VocabulaRain · LexicaLater · ÉcouTexte |
| `prod` | retrieve one right answer | iComplete · GramMarathon · ConjugaZone (written) · WorDrill (spoken) |
| `create` | no single right answer | ComposeIt · ChaTutor |

Two of Dan's rulings are pinned in `verify36-band.py`. **WorDrill shares
`prod`** — 26 Aug: *"keeping them apart is correct, but they are at different
sub-branches of the same branch"*; the channel is a sub-branch, not a colour,
and WorDrill is the only microphone in the app. **Sorting is `recog`, not
`prod`** — `evidence.ts`'s own definition of "recognition" names *sorting into
a column*, while its lookup table tags the drill `constrained`. The file
contradicts itself and the definition wins here. **Open for Dan:** correcting
that lookup would change what past answers mean in the mastery estimate, so
the lookup is untouched.

**The hues are derived, not picked, and that mattered.** The obvious semantic
palette was the worst possible one: the first set (violet `#6d3fc0`, amber
`#a15c00`, teal `#0f7480`, green `#2f6b3d`, crimson `#b32d55`) measured
**dEok 0.038** at its worst pair under Machado deuteranopia/protanopia
simulation — two of five bands indistinguishable. Amber/green/crimson sits
exactly on the axis red-green colour blindness flattens, and four more
hand-tuned attempts scored 0.019–0.043. The shipped five came out of a search
over OKLCH with ≥45° hue separation and white contrast held between 4.5 and
8.0: worst pair **0.120**, three times better, every band ≥4.5:1 against both
white text and paper (guess 5.30/5.11 · lesson 4.95/4.77 · recog 5.36/5.16 ·
prod 7.74/7.46 · create 7.32/7.05).

Even so the band always prints the activity's NAME in white on it, so colour
reinforces and never carries alone — `verify36` asserts that too. Five
categories is past what hue alone can do for a red-green colour-blind reader,
and no palette fixes that.

`verify36-band.py` (45 assertions) recomputes every ratio AND every simulated
separation from `globals.css`, the way verify33 does for the families. Full
suite green (27 scripts), `tsc` clean, clean `npm run build`. Confirmed in the
shipped bundle: the token, the `.band-*` class, and PageBand's
`var(--band, var(--fam-ink, …))` fallback chain.

NOT deployed. Nothing here has reached `origin/main` — it is a branch and a PR.

## 26 Aug — Home rebuilt in soft 3D, and the stop comes before the activity

From Dan's own draft ("FluOlinGo Home Header") plus his rule, same day: *"one
may access the activity through the map or through the activity shortcut, if
it is the latter, then go straight to the one within the current stop. In
other words, one must first choose the stop before they can access the
activity."*

**Two surfaces, one light source.** `.neo-well` is a value pressed INTO the
paper — read-only by construction, no hover, nothing to press. `.neo-key` is a
control standing OUT of it, and pressing INVERTS it into its own well. Neither
carries a border: depth is the affordance, which is what let the draft drop
the card, the chip rail and the ruler without losing legibility. Both honour
`prefers-reduced-motion`.

**The page now reads:** welcome strip (edge to edge, the four dopamine hues,
no box — the brand animation and the written « par Dr Chan » unchanged) →
two wells (Stop *n*/50 with five unit dots · Streak, greyed at zero) → three
keys (Play green · Rewind blue with its due badge, sunk flat when nothing is
due · the nine-square, reward-orange) → « Next: … » → the Map postcard,
untouched.

**The navigation change is the substantive one.** The nine-square key used to
open `MenuSplash`, twenty tiles with no stop attached — so tapping one asked
"which activity?" before the learner had been asked "which stop?", and then
had to ask again. It now opens `StopSheet`, built from
`deckActivityTabs(activeSio.collectionId)`. Every door in it is already
pointed at the stop the learner is on; a stop with no deck cannot open it at
all. Verified live: at SIO-001 the sheet lists exactly the six activities the
50-stop matrix predicts, and every link resolves to `sappeler` or its lesson.
Each row wears its demand band from verify36.

**Measured, not assumed.** The first build overflowed the right edge at 390px
— the orange key was cut in half, exactly the failure Dan called out on 21 Aug
("must not go hiding into the overspill off the screen"). The draft sizes its
phone board down on purpose and this now does too: keys 50px → 58px from `sm`,
wells 64px → 80px. Re-measured with Playwright at **320 / 360 / 390 / 430 px**
— every well and key inside the viewport, `scrollWidth == viewport` at all
four. verify31-topbar still green (13/13), so the top icon row is unmoved.

**Three verify scripts had to move, and one caught a real regression.**
verify19b's raw-hex ratchet went RED at 505 → 512: the draft's three glyph
fills were hard-coded darks. Fixed properly rather than rebased — the glyph
ink is now derived (`color-mix(in oklab, var(--dopa-win) 34%, black)` and
siblings), and the ratchet came out at **501, four BELOW the old baseline**.
verify25 and verify32-retention pinned the 21–22 Aug report-card hero that
this draft deliberately replaces; both were rewritten to hold what survives
(the two marks, the three destinations, the due badge, the glyph rule, the ban
on a full-width CTA) rather than the shape that carried it, with the
supersession named in the file. **verify37-home.py (24 assertions)** pins the
new surfaces and the stop-before-activity rule.

Full suite green (28 scripts), `tsc` clean, clean `npm run build`. ESLint: the
one pre-existing `set-state-in-effect` error in HomeDashboard, unchanged.

NOT deployed — branch and PR.

## 27 Aug — Dan played the app and found 19 things. Two fixed so far.

Dan, after the first real play-through: *"JE SUIS VRAIMENT DÉSESPÉRÉ !"* — then
nineteen numbered problems, most of which no code-reading test could have
caught. His triage was right: 1, 3, 4, 7, 14 and 18 are one-liners; 2 is a
content project.

### The sign-in wall is now a BUILD-TIME switch

`REQUIRE_SIGN_IN = process.env.NEXT_PUBLIC_OPEN_APP !== "1"`. Dan asked for
"a secret sign in method for Claude" — a password would have been worse than
useless: `output: "export"` means every line ships to every student, so a
shared secret is findable with the developer tools in a minute, and it opens
the wall into Firestore where the student records are. Compile-time instead: a
production build never sets the flag and therefore contains no bypass at all,
not even a disabled one. An agent builds a throwaway open copy, screenshots,
deletes it. Confirmed in a browser: a normal `npm run build` still shows
« Sign in to open the lesson ».

`verify38-authwall.py` (8) keeps it safe: the default must be closed, and the
flag must appear in NO committed config a deploy could read. (It failed on
first run by matching the word "password" in its own explanatory comment —
verify19b's lesson, relearned; it strips comments now.)

### #4 — the audio only ever said the first word. Fixed, and it was site-wide.

Dan: *"Tap « Nom — Je m'appelle Thomas » and it says just « Nom »… the app is
only ever handing the speaker the label."* Exactly right, and the cause was
not in that lesson. `SpeakZone`'s first branch means *"this row is entirely
French — read it whole, minus any « — gloss » tail"*, and tested it with
`row.closest('[lang="fr"]')`. That walks to **`<html lang="fr">`**, which every
page has. So the branch was TRUE for every row on every page, and every tap
spoke `rowText.split("—")[0]` — the English label. Not a truncation: the
sentence was never handed over.

The region lookup is now scoped to the SpeakZone (`zone.contains(frRegion)`),
restoring what the rule always meant — French AUTHORED in the content, not the
document's own lang. Proved in a real browser with the speech engine stubbed:
before, both halves of the row spoke `["Nom"]`; after, both speak
`["Je m'appelle Thomas."]`. This fixes every Mémo in the app.

### Two things I told Dan that were wrong

The lesson bar reads **/14**, not /15. The denominator is rule cards + 12, and
`se-presenter` splits into 2 rule cards, not 3 — I gave him a number I had
assumed rather than measured. And the dice screen IS gone: the Mémo card goes
straight to Continue, confirmed on screen at last.

### Still open from Dan's list

*(This line was stale as of 29 Aug — it still listed 1, 3, 5, 13, 14 and 18 as
open after they had been fixed in the sections below it. Corrected here; the
sections below are the record of each fix.)*

**Closed:** 1 (Continue 390px below the text) · 3 (a wrong answer paid more
than a right one) · 4 (the audio only said the first word) · 5 (progress lost
on leaving) · 7 (the hint sat under the tick — both halves) · 13 (a picked
answer looked like the Check button) · 14 ("1 days in a row").

**Blocked on Dan:** 2 — the lesson teaches a different thing from its promise;
a content project. · 18 — "pressing 1 restarts the lesson"; driven in a real
browser on `se-presenter`, on both a memo card and an exercise card, and it
does NOT navigate. Needs the screen Dan was actually on.

**NOT WRITTEN DOWN ANYWHERE: 6 · 8 · 9 · 10 · 11 · 12 · 15 · 16 · 17 · 19.**
Ten of the nineteen only ever existed as numbers in this file — their text was
in Dan's chat message and was never copied into the repo, so no agent can pick
them up. They need Dan to restate them. *Lesson: when Dan reports a list, the
list itself goes into STATUS, not just its tally.*

### 27 Aug, later — three more of Dan's nineteen, each measured

**#1 — the Continue button was 390px below the text.** Dan: *"You read a short
card at the top of the screen, then have to scroll down past two-thirds of a
blank page to find the button. Every card. Every lesson."* Measured on a
390×844 phone: the memo text ended at y=344, Continue began at y=734. The
cause was `flex-1` on DrillShell's scroller — `1 1 0%` forces it to fill the
column whatever its content, so the footer was always pinned to the bottom.
`flex-initial` (`0 1 auto`) grows to the content and shrinks only when the
content would overflow. **Re-measured: 30px at 390×844 AND at 360×640**, button
on screen without scrolling, and a tall exercise card still fills the slot and
scrolls inside as before. Deliberately NOT `justify-center` — Dan ruled that
out on 11 Aug.

**#3 — a wrong answer paid more than a right one.** Dan: *"guessing first and
correcting earns 80, while getting it right immediately earns only 60. The app
pays you more for not knowing."* Exactly right: the help ladder calls
`recordItemResult` on EVERY attempt, so wrong paid `XP_WRONG` (20) and the
correction then paid `XP_CORRECT` (60) on top. Fixed by paying ONCE per item
per run — the first attempt pays, a re-attempt records and steps the SRS but
earns nothing further:

    right first time             60
    wrong, then right            20
    wrong, wrong, then right     20

This keeps the settled rule that effort counts and errors are never punished
(hearts stay on the refused list) while making knowing always beat guessing.

**#14 — "1 days in a row"**, on the toast every learner meets on day one.
Pluralised.

### Reported but NOT reproduced — #18

Dan: *"pressing '1' doesn't pick answer 1 — it throws you back to the start of
the lesson and wipes the bar."* Driven in a real browser on `se-presenter`, on
both the memo card and an exercise card: pressing 1 does **not** navigate, the
bar does not change, and it **does** select option 1 (border moves
`--cahier-rule` → `--cahier-ink`) and enables Check. Needs the screen Dan was
on before it can be fixed — a different drill, or a game, or the SIO page.

### Confirmed in passing — #13

That same test measured it: a selected option is shown ONLY by swapping its
border from `--cahier-rule` to `--cahier-ink` — the same dark brown as the
Check button beside it. Dan: *"A selected answer looks identical to the button
you press next."* Real, and now measured rather than eyeballed.

### 27 Aug — the glyph rule, narrowed honestly; and a practice worth keeping

Dan ruled **"glyphs stay"**, settling a collision between two of his own
rulings: the 21 Aug *one glyph, one job* rule (▶ means SOUND) and his own Home
draft, which draws Play as a filled triangle. The draft wins.

A parallel session (Peers) caught something I should have caught myself: the
check in verify25 asserted only that the **character** ▶ was absent, and its
comment defended that as "what the rule was ever about". That was a
rationalisation. A learner cannot tell an SVG triangle from a ▶; the rule was
about what the shape says, not which codepoint draws it.

Rewritten to assert the rule as it now stands, both halves so neither drifts:

- **A typed ▶ / ⏸ / ⏹ is audio** — inline with text a learner reads it as
  "this will speak". Still banned on Home.
- **The drawn key is navigation** — Home's three SVG keys are Dan's own design
  and are the approved form. A later session reading only the 21 Aug note must
  not "restore" them to words.

**AND THE PRACTICE, taken from Peers:** they shipped a check an hour earlier
that was **vacuous** — it sliced to the wrong ternary and passed with the bug
fully restored; they only caught it by deliberately reintroducing the bug. So
both new assertions above were proved to FAIL before being trusted:

    mutation 1  typed ▶ inserted on Home   -> FAIL "a typed ▶/⏸/⏹ is back"
    mutation 2  drawn Play path altered    -> FAIL "the drawn Play key is gone"
    restored                                -> 22 passed · 0 failed

Worth doing for every new check: a green check that cannot go red is worse
than no check, because it is trusted.

### Corrections exchanged with Peers, both directions

They conceded #38 (they had diffed against the second parent, which trivially
matches). Their caution that my #18 fix touches `sios.json` under the SIO
freeze is **wrong**: the fix is `src/lib/useChoiceKeys.ts`, a keyboard handler,
and this branch touches no content file at all —
`git diff --name-only origin/main...HEAD` returns no `src/content/**` and no
`sios.json`. The freeze is not engaged.

They are waiting on my `ev.award` hook (#3) to land on main before wiring the
pre-test to it, rather than building a parallel mechanism. It is on this
branch, unmerged.

## 27-28 Aug — Peers: three of Dan's five fixes, the bands, and the font

**Deployed.** `origin/main` = `live/main` = `f3944a5`, pushed by Dan.

**The split.** Two sessions worked the repo at once and collided five times in
a day (duplicate matrices, a duplicate reconciliation PR, both of us chasing
the same bug). Settled by surface: **the colour-review session takes colour,
Home and the visual system; Peers takes the practice-chain mechanics and
content truth.** It held for the rest of the session. Cross-session messaging
does not reach a cloud session, so Dan relayed by hand — slow but it worked.

**Shipped here (PRs #41, #43):**
- **iComplete stopped printing the article it then asked the learner to type.**
  Every ordinary article deck showed « le » in grey and required it back, so
  the learner copied the one thing the question asks. Generalises the 24 Aug
  possessives fix, which had the same reasoning but was scoped to one deck.
  `art` still feeds the help ladder, whose first rung gives the gender on
  demand — scaffolding kept, giveaway removed.
- **Session length.** No drill capped its queue: possessives ran 136
  questions, nationalities 100, WorDrill "Tout" the whole curriculum. New
  `src/lib/sessionLength.ts` offers 10 / 25 / all; decks of ≤14 are never
  asked, and a length that would not shorten the run is dropped. Wired into
  iComplete. **4Mémoire, WorDrill and GramMarathon still uncapped** — the
  helper is shared and ready.
- **The band reaches every drill.** The band system shipped 24 Aug into
  exactly TWO surfaces; seven drills had none, which was Dan's complaint on
  the 24th *and* again on the 27th. Now on SpecuLearn, Sorting, 4Mémoire,
  iComplete, GramMarathon, WorDrill. ÉcouTexte keeps its own PageBand.
- **The type system stopped being opt-in.** `body { font-family: Arial,
  Helvetica, sans-serif }` was create-next-app boilerplate present since the
  first commit. Measured: **50-83% of real text runs on every page were
  Arial**, including « tes parents » at 30px in a drill — the French being
  taught. Fonts were loading fine the whole time; nothing asked for them.
  `body` now takes `var(--font-body-stack)`; re-measured at 0% Arial, no
  page gained a horizontal overflow.
- **Three checks that had never run.** `verify36-band`, `verify37-home` and
  `verify38-authwall` shipped with #42 and were never added to the workflow.
  38 guards the sign-in wall. All wired, with `verify39`.

**Still open, in this half:**
- **Pre-test records nothing** — no ledger, no SRS, no evidence, no XP. Dan's
  ruling: remember the misses, but do not dent accuracy, cost XP or enter the
  review schedule. **Unblocked** now `ev.award` is on main: pass
  `award: false`. Do NOT build a parallel mechanism.
- **The dice and the dropdowns.** Dan (25 Aug): the dice was never a
  difficulty control — it randomised *which variation* (subject × verb ×
  polarity), and the selectors above it let a learner aim their own practice.
  Both are gone. Approved to restore **both**, plus ★/★★/★★★ buttons to enter
  the ramp — Dan settled the contradiction on 27 Aug: **a learner MAY
  deliberately start at ★★★.**
- **Five SIO promises the content cannot keep** (stops 1, 2, 3, 17, 18) and
  nine stops with items but no lesson and no memo. A full rewrite of all 50
  in the concrete "you will say…" form is drafted and **frozen** — the SIO
  freeze holds; it needs Dan's markup, not an agent's judgement.
- `claude-review` has failed on every PR since ~20 Aug (bad API key). It gates
  nothing. Recommendation stands: delete the workflow rather than fix it — a
  permanently-red ✗ trains everyone to ignore red marks.

**A practice worth keeping.** Three check-quality bugs surfaced in one night,
all the same shape: an assertion that could not fail. One sliced to the wrong
ternary and passed with the bug fully restored; one matched a token (`▶`)
rather than the meaning (a drawn triangle); one used `[^>]*` and reported two
false failures. **Write the check, then break the code and watch it go red
before trusting it.** Both sessions adopted this; it is cheap and it caught
things review did not.

---

## 28 Aug evening — SIO + pre-test extract (Cursor, no code change)

Dan asked for every SIO followed by its pre-test questions. Extracted from
live content: 50 stops, 44 with an authored MCQ bank (450 items), 6
production/atelier stops with none (010, 020, 030, 040, 049, 050). Unit 0
is the inline popup bank; Units 1–4 are `src/content/pretests/*.json`.
Delivered as a canvas, not a repo file.

## 2026-08-28 — the pre-test remembers; the ramp gets an entry (Peers)

Both of Dan's outstanding items from 27 Aug, built and checked.

**The pre-test remembers, and still does not score.** Four surfaces put
pre-lesson questions in front of a learner; only two fed the gap report.

    PretestQuiz            records (via the runner)
    /pretests/[id]         records (via the runner)
    picture pretest        logged to Firestore, NEVER to the gap record —
                           its own header claimed a report it did not feed
    Unit-0 popup           recorded nothing at all, while gating the lesson
                           button on being answered ("pretest first")

Both wired to `recordPretestAnswer` — the existing mechanism, not a parallel
one. The picture engine resolves its SIO through the shared `sioForDeck`;
Unit-0 keys on a content-derived id because its bank is reshuffled per open
and its questions carry no `id`, so position cannot key a saved record.

Unit 0 would then have been **a write with no reader**: `BringToClass` had
exactly one render site, inside `SioDetail`'s pretest branch, and Unit 0 draws
its own popup body. Exported and rendered there too.

The "never scored" half held everywhere **by accident** — no pretest ever
called `recordItemResult` — and nothing stopped one from starting to. That is
now `verify40`'s load-bearing assertion.

**Entry level ★ / ★★ / ★★★.** The invariant that matters, and the reason this
is not the old die: **every level is the same twelve cards.** The removed d12's
face was a START INDEX (`queue.slice(entry)`), so a 12 left the lone
translation — a run-length dial dressed as difficulty, selling least work at
the hard end. Dan's "a learner may choose to start at 3 stars" is the opposite
request. `rampFor()` shifts the MIX (★ 4 MCQ → ★★★ none, 10 of 12 build or
translate) and never the length; `verify41` executes all three ramps and fails
if their lengths ever differ.

**Dropdowns and dice.** `DiceConfig.axes` is optional, so a lesson opts in and
the other 33 keep working untouched — the axes ARE the grammar and one fixed
"subject × topic × verb" would be wrong nearly everywhere. `conjugaison-u1` is
the reference (subject × verb × polarity) with a 🎲 that fills all three at
random. Its generator moved to `conjugaison-u1.gen.ts`: node cannot strip types
from a `.tsx`, so a generator beside the Mémo could not be executed by a check
— and **a generator that ignores a pin looks identical in source to one that
honours it.** verify41 runs it 2016 times across every pin combination.

A steered run drops the two supplies that cannot honour a pin — the deck's own
items and the authored bonus bank — rather than serve off-target cards into a
run that claims to be about the learner's selection.

**Still open:**
- **Selectors on the other 14 lessons** that have a real subject axis
  (`aimer`, `aller`, `faire`, `modaux`, `futur-proche`, `pouvoir`,
  `conjugaison-er`, `manger-boire`, …). The mechanism is built and proven on
  one; each further lesson is a small generator split plus an `axes` block.
- **Session length** on 4Mémoire, WorDrill, GramMarathon — `lib/sessionLength.ts`
  is shared and ready.
- **Unit 0's bank calls itself "post-lesson"** in its own header while the UI
  gates the lesson button on it ("pretest first"). It is recorded as a pretest
  because that is how it is used. Worth Dan's ruling on which it is.
- Five SIO promises the content cannot keep (stops 1, 2, 3, 17, 18); the
  50-promise rewrite stays frozen pending Dan's markup.
- `claude-review` still red on every PR since ~20 Aug; recommendation stands.
- `LessonPager` carries one React-Compiler lint error more than main (6 vs 5,
  same pre-existing class — the compiler has bailed on that component, so a
  `Date.now()` in an effect reads as render-phase). Lint gates neither CI nor
  the build; noted rather than hidden.

**The practice held.** Every assertion in verify40 and verify41 was proved to
FAIL before being trusted, and three separate weaknesses surfaced that way:
two break tests were run with a one-liner that truncated the file before
reading it (so they only proved the check notices an EMPTY file); one
assertion stayed green with the call deleted because the import line alone
satisfied it; and verify40's absence checks first failed on the *comments*
explaining that the code deliberately does not score. All three would have
shipped as green-but-vacuous.

## 2026-08-28 — Dan's pre-test amendments (SIO-001/003/004/009) + a pre-test for the SIO-010 role-play

Dan's markup, applied to Unit 0's bank (`src/content/sios/unit0-questions.ts`)
and the panel that renders it (`src/app/Unit0Panel.tsx`).

**The small ones.** SIO-001 Q9 now names a **[male] professor** (the answer
turns on *Monsieur*, so the referent's sex could not be left open). SIO-003 Q5
asks for **"yi grek"**, not "i grec" — every other letter in that set is a
pronunciation respelling and Y was the one spelling; the `LETTER` map moved
with it, so the wrong-pick whys say the same thing. SIO-003 Q7 carries Dan's
bracketed note about the ü sound (German *für*, Mandarin *yu*) — `letterQ` took
an optional third argument rather than the question being unrolled into a
literal. SIO-004 gains **Q11 midi**, and `MOMENT` gains its gloss so midi can
also serve as a distractor.

**SIO-009.** The Adieu question is gone — it was the only item in the bank that
ran backwards ("which phrase is NOT appropriate"). Every situation that was a
bare description now ends on **"You say:"**, so the learner produces a line
instead of judging a sentence; Q4 and Q10 already carried their own cue and
were left alone. Q5 wears the highlighter on **"around 7pm"** (new optional
`hl` field — a literal substring of the title, rendered not stored, so the
saved record still keys on the plain text). Q7 is Dan's rewrite: prof and
student **already know each other**, morning arrival — its distractor whys were
re-pointed at that ("you already know each other", "your prof already knows
it"). Q9's *Enchanté* → **Pardon** and *Bonjour* → **Merci**, per Dan.

  ⚠️ Flagged for Dan: Q9's replacement takes "Bonjour, monsieur." out of the
  8pm question, and that was the item's original teaching point — *bonjour*
  vs *bonsoir* by hour. The 8pm cue is still in the prompt but nothing now
  contrasts with it. Say the word and it comes back as a fifth option.

Editing a prompt orphans its old record on purpose (`unit0QuestionId` keys on
prompt + answer) — a reworded question is a different question.

**SIO-010 — the role-play now has a pre-test.** The header used to say it was
"intentionally absent … a mini-oral done in class". Dan reversed that: the
seven moves of the atelier dialogue (greet · ask a name · give yours · ask how
it's written · say how it's written · enchanté · take leave) are now seven
questions, asked of **three audiences** — A a student (informal 1:1) · B a
client (formal 1:1) · C a group (informal, one-to-many) — 21 items in
`SIO010_SITUATIONS`.

Three decisions the content forced:

- **The learner picks the audience first.** "How do you ask for their name" has
  no answer until you know whether you face one student, a client or a group —
  the situation is exactly what settles tu vs vous. A shuffled pool of all 21
  would have been unanswerable, so each situation is its own run.
- **Authored order, not shuffled** (new `ordered` prop). These seven questions
  ARE the dialogue in sequence; options still shuffle.
- **The model dialogue waits.** `DialoguePlayer` moved behind `AfterPretest`.
  It is the answer key — shown first it hands over all seven lines, which is
  the one thing the blueprint says a pretest must never do.

`UNIT0_QUESTIONS["SIO-010"]` is the flat union of the three runs, so the
generic consumers (the Pre-Test flap, `pretestHrefForDeck`) see that the SIO
has questions; nothing ever renders all 21 at once. The flap's gate moved from
`!isProduction` to "the bank is non-empty" — SIO-010 is an atelier *and* has
questions now.

**Multi-answer questions.** Q1 of each situation asks which greetings *are*
appropriate — plural, and a register is a set of usable openings, not one best
one. New `multi` flag: taps toggle, an **OK** button confirms, and the pick is
graded on the exact set (a missed correct answer counts the same as an extra
one). The record stores the set joined by `MULTI_SEP`, in option order rather
than tap order, and WHY concatenates the whys of every wrongly-ticked option —
which subsumes the single-answer case, so both paths run the same code. Number
keys are disabled on these (a key ANSWERS, which is wrong when a tap only
ticks); they keep their numeral chips off to say so.

**Checks.** tsc clean · eslint unchanged (3 pre-existing React-Compiler errors
in Unit0Panel, same three as `main`) · `npm run build` green · check:short,
check:textgen and all 33 verify suites pass, verify40 included — nothing
pre-lesson is scored. The bank was walked in node: 21 SIO-010 items, no
duplicate question id across the whole of Unit 0, no duplicate option value in
a question, every wrong option carries a why and no correct one does, every
`hl` is a real substring of its title. Driven in a browser with the sign-in
wall opened locally (never committed): the picker, the multi-select + OK, the
green/red grading, "Bring to class", and the dialogue appearing only after the
seventh answer.

**The SIO-010 statement, rewritten** (Dan: "rewrite the statement"). It
described only the tu/vous 1:1 chain while the pretest now drills three
registers, so can-do, competence and description were all re-cut — in the
handoff CSV, which is the source, and mirrored into `sios.json`:

> I can carry a first meeting in French right through, with a fellow student,
> with a client, or with a group, and I know how to complete every step —
> greet, ask a name, give one's own name, ask Et toi ? / Et vous ?, ask and
> answer Comment ça s'écrit ?, say Enchanté(e), take leave — in the register
> the situation calls for: tu, vous, or the plural vous of a group.

That is `sioStatement`'s mechanical join of the two fields; the measurable half
carries `(≥6/7 steps in each of the 3)`, which `targetHigherLimit` strips before
display, as it does for the other 49. It is also SHORTER than what it replaces:
the old pair listed the whole Bonjour → Au revoir chain twice, once in each
field.

**⚠ Two generator landmines found while doing it — neither touched, both real:**

- `scripts/gen-sios.mjs` (documented as CSV → `sios.json`) **no longer
  reproduces the committed file**: it does not emit the `short` field that
  `check:short` requires of all 50, so a run rewrites 800 lines and breaks the
  build. Running it is how I found this; the edit was made in the CSV *and*
  applied to `sios.json` by hand instead.
- `scripts/handoff_cefr.py` (which `add-candos.py` and `merge-handoff-csv.py`
  write into the CSV) has **drifted from the live objectives**: of its 50
  can-dos, 23 match `sios.json` exactly and 27 do not. Measured, not eyeballed:

  - **9 hold a different SIO's exact can-do.** SIO-012/013/014 rotate among
    themselves, and 022/023/024/025/026/028 rotate among 022-027. Re-applying
    those files the wrong text under the right heading.
  - **Unit 0 is shifted by one place across SIO-008/009/010** — handoff_cefr's
    008 is a « C'est ___ ? » objective that no longer exists in Unit 0 at all,
    its 009 is live 008 (classroom instructions), its 010 is live 009
    (greetings). The old question-words SIO left Unit 0 (it is now SIO-035) and
    handoff_cefr never moved with it.
  - The remaining differences are simply **older wordings of the right topic**
    (SIO-002-007, 011, 027, 042-044, 047, 048), and **SIO-045A is absent** —
    it postdates the 50-row numbering.

  This is the quieter of the two hazards and the worse in kind. Nothing in the
  app or the build imports it, so it does nothing until someone runs
  `add-candos.py` or `merge-handoff-csv.py` — and then it fails SILENTLY: the
  CSV still parses, the build still passes, and a wrong can-do just appears
  under the right objective. Left alone; realigning it is its own job.

  (An earlier version of this note said it was "off by one from SIO-008
  onward" and would shift every can-do in Units 0-4. That was read off two
  adjacent rows, not measured. The shift is real but confined to Unit 0's
  008/009/010; everywhere else the drift has a different shape.)

## 29 Aug — the French objective titles, and the pre-lesson landing page

Dan renamed the first ten stops to French question forms. Written into
`short` they break the Home map: `short` is the label printed under a 56px
stop, capped at 14 characters by `scripts/check-short-labels.mjs` (which runs
before `next build`) and asserted by `verify/verify25b.py`. The longest of
Dan's ten, « Bonjour ! Salut ! Au revoir ! », is 29.

`short` therefore keeps the English map label and a new **optional `fr`**
field on each SIO carries the full French title, for surfaces with room to
print it (Dan: "We keep the English but in much smaller FluOlinGo font, and
put the full french title out in the list"). Ten stops have one; the field is
absent on the other forty, so nothing downstream needs to know about it yet.

| id | `short` (map, ≤14) | `fr` (lists) |
|---|---|---|
| SIO-001 | Introductions | Je m'appelle… |
| SIO-002 | Tu / Vous | Tu (toi) ou vous ? |
| SIO-003 | Alphabet | Ça s'écrit comment ? |
| SIO-004 | Days & moments | C'est quand ? |
| SIO-005 | Colours | C'est comment ? |
| SIO-006 | Some nouns | C'est quoi ? |
| SIO-007 | Numbers 0–20 | Il y a combien de… ? |
| SIO-008 | Classroom talk | Les instructions de classe |
| SIO-009 | Greetings | Bonjour ! Salut ! Au revoir ! |
| SIO-010 | First meeting | Un dialogue simple |

Two of Dan's titles were typeset rather than copied: "Au Revoir!" is written
« Au revoir ! » — lowercase r mid-sentence, and the space French puts before
« ! », the convention the rest of the content already follows. Told him.

**The landing-page mock** (artifact `41600283-afda-4e2d-8315-35d71e450291`,
generator `scratchpad/pl/gen.py`, not in the repo) is a design for ONE page
holding all fifty pre-lesson entries: an accordion with one unit open at a
time (`<details name>` + a fallback for browsers without exclusive
accordions), a whole Pre-Test button per row, or a half/half split with
SpecuLearn where the deck is in `SPECULEARN_READY` (nine of fifty).

Two things it got wrong and now doesn't, both worth remembering:

- **A flex `<th>` is not a table cell.** The rows were a `<table>` with
  `th{display:flex}` to get the number and the name onto one line. That takes
  the `th` out of the table box model, so the browser wraps it in an anonymous
  cell and the row's geometry stops being the stylesheet's — which is what put
  the title on a line of its own, the thing Dan kept reporting and I kept
  measuring as fixed. The rows are a flex list now: three children, one line,
  no trapdoor.
- **`num` is a sort key, not a label.** SIO-045A's `num` is `45.5`, so a mock
  that prints `num` numbers a stop "45.5". It shows `45A` now, parsed from
  the id.

Row height is 43px either way — the 32px button plus its shadow governs it —
so the small Patrick Hand gloss under the French title costs no vertical
space at all.

**Not verified:** the Patrick Hand webfont could not load in this container
(the egress proxy refused `fonts.googleapis.com`), so the screenshots show a
serif fallback for the gloss line and the two hand-lettered headings.
`document.fonts.check()` returns *true* in that situation — it says "nothing
is pending", not "the webfont arrived" — so it is not a usable probe. The
published artifact loads the font normally; the widths measured here are
wider than Patrick Hand's, so "no title is clipped" is conservative.

**Still open on this page:** the other forty stops have no `fr` title, so
units 1–4 show their English `short` as the label with no gloss. That is the
honest state of the content, not a layout decision.

## 29 Aug, later — French titles on all fifty, and one page pattern for the site

**All fifty stops now carry `fr`** (the 40 beyond Dan's ten are mine, in his
register), it is declared on the `Sio` type, and verify25b holds the two
labels apart: every stop needs a non-blank `fr`, and no `fr` may merely
repeat its `short` case-insensitively — otherwise one of the two is dead
weight. All three assertions were proved to fail on exactly their own fault
before being trusted.

**Measure, don't count.** Three of my forty overran the pre-lesson list's
227px column and would have shipped as "…". Character count is a bad proxy:
Dan's 29-character « Bonjour ! Salut ! Au revoir ! » is 220px, while a
28-character title of mine measured 241px. The budget is recorded in pixels
beside the field. `scratchpad/pl/width.mjs` probes a candidate in the real
face.

**A process failure worth not repeating.** Mid break-test I restored the
mutated file with `git checkout --`, which silently discarded the forty
uncommitted `fr` additions along with the deliberate fault — and the next two
break tests then "passed" for the wrong reason, reporting all forty stops as
missing rather than the one I had broken. Break tests must restore from a
copy taken first, never from HEAD, whenever the work under test is
uncommitted; and a break test whose FAIL names more than the fault injected
has not proved anything.

**SpecuLearn's emoji is 💡, not 🔮** (Dan, same day). Display only — the key,
the route and saved progress stay `speculearn`. Changed in the registry (the
one place an activity is written down) and in the one place that had
hand-copied it, `SpecuLearnContent.tsx`.

### The page pattern (design only — no app code yet)

Dan, 29 Aug: *"make all the other pages of the website look like this (we will
remove the ugly indexes as they are, each activity tab will lead to one of
these pages in the same manner: only 1 section expanded at any time). And each
stop to open up to a pop up showing (1) the SIO in full, (2) the app icons.
that's all."*

Artifact `b46216f7-e97a-41a8-a167-d8deff65ac06` — four screens, all generated
from the repo (sios.json, activities.ts, SPECULEARN_READY), so the mock cannot
claim a door the content does not have:

1. **The pattern** — Pre-Lesson Activities, as approved.
2. **Any activity tab** — 4Mémoire: same fifty rows, its own band hue, one
   whole button per row.
3. **When the tab isn't everywhere** — SpecuLearn, 9/50. The other 41 rows
   keep their place and *ghost* the button (dashed, flat, inert) rather than
   disappear: a hidden button says the stop has nothing, when what it has is
   everything except this one activity.
4. **The stop popup** — the `fr` objective as the heading in the app's hand,
   the English `short` as the gloss, the `canDo` in full, then the ten
   stop-level activities as icon tiles. No numbered path, no progress, no
   blurbs — Dan's "that's all".

Two decisions inside it that are not arbitrary:

- **Only ten of the twenty registry activities belong on a stop.** DéjàRevu,
  ChaTutor, My Progress, Leaderboard, Profile, NumBus, NumBourse, ConjugaZone
  and VoixLà are whole-site doors; putting them in a stop's popup would claim
  the stop has them.
- **The popup's icons keep their names** even though the list buttons dropped
  theirs. On the list a two-item legend names the glyphs once; in the popup
  there is no legend and ten icons, and 🗂️ / 🧩 / 🧰 are not tellable apart
  without words — so removing them WOULD stop you finding the right one, which
  is the actual test Dan's litmus rule applies.

`<details name>` groups across the **whole document**, not per container, so
four phones on one sheet shared a single accordion and only one could have a
unit open. Each phone needs its own group name; the JS fallback groups by the
`name` attribute rather than assuming one group.

**Still open:** none of this is in the app yet — `/activities` and the
per-activity hubs are untouched. Building it means one shared page component
(band hue + second-column resolver + the popup) replacing the Index's chip
rail, and `cellHref()` already answers "does this stop have this activity",
so the ghost state is derivable rather than a new list to keep.
## 2026-08-29 — the SIO spine gets ONE source, and the two stale copies are shut down

Follow-up to the two generator landmines noted above. Dan: "can you fix the
first and the second". Both fixed — and testing the first fix is what exposed
the real problem, which was much larger than a broken script.

**The first fix was BACKWARDS, and the test caught it.** `gen-sios.mjs` was
documented as regenerating `sios.json` from the handoff CSV. Repairing it that
way would have been a content disaster: run in check mode it reported that the
CSV disagrees with the app on **17 SIOs across 46 fields**, and that for **14 of
them the topic itself differs** — a different objective under the same number
(the app's SIO-047 is "Making plans"; the CSV's is "Commerces"). Units 1, 2 and
4 were reorganised in the app and the CSV never followed. Running the documented
command would have reverted 17 objectives to superseded text and deleted
SIO-045A. The app is unambiguously the live course — every one of those topics
has a real deck, a real pretest and real lessons wired to it — so **the
direction is reversed: `sios.json` is the source and the CSV follows.** Dan's
call, put to him with the evidence.

**What shipped.**

- `scripts/gen-sios.mjs` is **deleted**, not left unused. Its two hardcoded maps
  had rotted too: `COLLECTION_BY_SIO` knew 26 of the 50 live deck wirings and
  disagreed with one, so a run also unwired half the course.
- `scripts/sync-sio-csv.mjs` replaces it, app → CSV. It syncs only the
  **objective** columns (Unit, Topic, SIO Description, Flashcard Set, CEFR Mode,
  Can-Do, competence) and never the **flashcard spec** (Front side, Back side,
  Overview columns, Letris / Notes), which the app does not hold. Proven: a
  column-by-column diff of the 51 rows shows those four untouched, header and
  row count identical.
- `--check` is wired into `npm run build` as **check:sios**, so neither side can
  drift quietly again. That, not the copying, is the part that fixes this.
- Two guards make the tool safe to run: it **refuses to write** unless parsing
  and re-serialising the CSV reproduces it byte for byte, and it refuses when a
  row exists on only one side (a missing row is a decision, not a sync).
- **Two ragged rows healed.** SIO-036 (13 fields) and SIO-040 (14) had a
  competence pasted in unquoted years ago, so commas split it across phantom
  columns. A spill is only collapsed when re-joining the tail reproduces the
  app's value EXACTLY; anything else stops the script rather than deleting data.
- `scripts/handoff_cefr.py` **stores nothing** now — it derives from
  `sios.json`, with a guard that refuses a short read rather than let its
  callers blank the CSV's descriptor columns. `add-candos.py` is consequently a
  byte-identical no-op, verified.
- `scripts/update-country-decks.py`'s `update_cefr()` had been silently doing
  nothing for months (its search strings were in neither the old nor the new
  file). It now says so instead of reporting success.
- `docs/CSV_SPEC_MISMATCHES.md` — the 15 rows whose card spec still describes
  the old objective, for Dan to work through in his own spreadsheet. Nothing in
  the app depends on those columns.
- `verify42-sio-source.py`, 19 checks. **Every one was proved to fail before
  being trusted** — ten break-tests: restore the generator, drop check:sios from
  the build, drift one CSV field, give handoff_cefr a stored copy, remove its
  short-read guard, make the sync claim a flashcard column, remove the
  round-trip guard, reintroduce a ragged row, point index.ts back at gen-sios,
  delete the mismatch doc. All ten went red; all ten went green again on
  restore.

**SIO-045A is the NEWEST objective in Unit 4, not a leftover** — worth stating
because Dan's recollection was the opposite. The history is in
`src/content/pretests/index.ts` (2026-08-02): the app's own SIO-045 was "Market
phrases", retired into SIO-044 (Commerces), its number kept as a deliberate
permanent gap so nothing downstream would shift; "Numbers 70–99" was then added
into that gap as SIO-045A. It has a deck, a pretest, six finale items and an
index grouping today. The CSV's 5th Unit-4 row is a different objective again
(frequency adverbs, which the app calls SIO-043), so the sync treats that as a
reused slot, not a rename. **If Dan does want SIO-045A gone, that is an app
content change and a separate job** — it is referenced in `sios.json`,
`pretests/index.ts`, `finale.ts`, `index.ts` and learner progress records.

**Untouched: `sios.json` and every app surface.** This whole change is tooling
and the CSV. tsc clean · build green · eslint identical to main (138 both
sides) · all 34 verify suites pass.

## 2026-08-29 (later) — the loose ends closed: specs reassigned, the last handoff landmine defused

Dan: "fix any of the unfixed matters above too." Everything left open by the
morning's clean-up, done.

**The six displaced flashcard specs — moved, not left for Dan.** The earlier
note said only Dan could place them. That was wrong once the app's decks were
actually read: the specs were not incorrect, they were **displaced**, and nearly
every one had a home under some other number. SIO-047's shop cards belong to
SIO-044, which IS Commerces now; SIO-045A's frequency-scale cards belong to
SIO-043, which IS Frequency adverbs now; SIO-043's partitive-negative cards
belong to SIO-042, which absorbed that content on 2026-08-02. Two were genuinely
retired (the *avec* spec — the `avec-qui` deck no longer exists; the manger/boire
spec — ConjugaZone covers it under SIO-042), and the three gaps that left were
written fresh **from the decks the app actually ships** (`negation-pas`,
`numbers-70-99`, `modaux-plans`), not invented. SIO-048 was trimmed from four
modals to the three its objective names, matching `modaux-avis`.

Proved the mirror image of the morning's change: a column-by-column diff shows
**only** Front side / Back side / Overview columns / Letris-Notes moved, on
exactly those 7 rows, with no objective column touched and no ragged rows.

**Also over-flagged, and corrected.** The first list keyed off "the topic string
changed", which called 15 rows broken. Nine were only renames — SIO-023 went
from "aimer — what I like" to "Leisure activities — j'aime, j'adore" and its
cards fit exactly as well as before. Only six were real. The doc is renamed
`docs/CSV_SPEC_REASSIGNMENT.md` and is now a record of what moved, not a to-do.

**`merge-handoff-csv.py` was the third landmine of the same family** and had
gone unmentioned. It had an absolute path into a personal Downloads folder baked
in, naming a **v4_1** export while the repo is on v9 — a run would have replaced
all 9 base columns of every row, flashcard specs included, from a spreadsheet
several versions old, and printed "Wrote …". It now takes the export as a
required argument and refuses rather than proceeds when the export does not line
up: base header must match column for column, the 50 SIO ids must match exactly
(`--allow-id-changes` to override deliberately), the current file is copied to
`.csv.bak` first, and it prints which rows actually changed. All four guards
exercised; a clean export round-trips byte-identical.

**verify42 grew to 25 checks**, each proved to fail first. The three new ones:
no absolute path baked into any handoff script (this one caught my own docstring
quoting the old path — the check was right, the docstring was reworded), the
merge script refuses to run without an export, and **no non-atelier objective
may be left with no cards described at all** — which is how the displacement
went unnoticed for so long.

One break-test needed redoing: sabotaging the merge script by removing its
argument check tripped a *different* guard instead, so it exited non-zero and
the assertion stayed green for the wrong reason. Re-sabotaged to silently
default to a valid file elsewhere; then it went red properly.

**Still Dan's, deliberately not touched:** whether SIO-045A should exist at all
(he believes it is from an old system; the code says it is the newest objective
in Unit 4 — evidence in `src/content/pretests/index.ts`, and removing it is an
app change touching five files plus learner records), and SIO-009 Q9, where
replacing *Bonjour* with *Merci* removed that item's bonjour-vs-bonsoir
contrast — his explicit instruction, flagged once, left as asked.

tsc clean · build green · eslint identical to main (138 both sides) · all 34
verify suites pass · `sios.json` and every app surface untouched.

### Merge note — the drift guard caught something on its first real run

Merging this into `main` after PR #49 (the French objective titles) landed,
`check:sios` immediately failed: that PR rewrote **SIO-006** in the app —
topic, description, can-do and competence — replacing its classroom-object noun
list (prénom, crayon, cahier, casque…) with eighteen near-cognates (croissant,
région, football, nationalité…) whose meaning is already clear, so that gender
is the whole task. The CSV was synced to follow.

Its flashcard spec needed the same treatment, and shows why the new
"no objective without cards" check is not enough on its own: the spec was
non-empty and looked fine, but its examples (*'a pencil' → un crayon*) name a
noun no longer in the objective, and its "2 baskets: un / une" predates the
competence now asking for **un / une / le / la**. Rewritten to the new list.

Worth noting as the pattern to expect: this is the ordinary working of the
thing, not an incident. An app-side content change makes the build red, the
sync moves the objective, and a human moves the cards after it.


## 29 Aug — SIO-005's mnemonic objects, found and wired to the cards

SIO-005 is assessed on *"Name the 12 colours; **give the matching mnemonic
object for each** (≥10/12)"* and the deck carried the bare colour word and
nothing else — `le rouge`, `le jaune`, twelve of them, no example, no phrase.
Nothing in the app had ever shown a learner the thing it then graded.

They were in `docs/handoff/LAF1201_SIOs_Flashcards_v9.csv`, row 5, all along.
Now on the items as `example` / `exampleEn`, which renders in iComplete's and
GramMarathon's WHY and in the pre-test review table (the `!inflected` guard on
those paths is for nationality/possessive decks only, so it does not apply
here):

    le rouge  → le feu rouge        le violet → le raisin violet
    l'orange  → le fluo orange      le marron → le chocolat marron
    le jaune  → le citron jaune     le blanc  → le lait blanc
    le vert   → le concombre vert   le noir   → le café noir
    le bleu   → le ciel bleu        le gris   → le nuage gris
                                    le rose   → le flamant rose

**ELEVEN, not twelve.** I told Dan "the twelve colour nouns" and listed
`le sable beige` among them — the sheet has eleven and **beige has none**;
that one was mine, not his. Left absent rather than invented. Beige is already
this deck's odd one out: no swatch emoji, and excluded from SpecuLearn
(`colors-12`) for having no honest image. It needs Dan's word.

**The Mémo was tried and reverted, on measurement.** Adding the eleven as a
pill row made the card 419px → 667px at 390×844, and the last row of pills sat
**76px behind the Continue button**, clipped with nothing on screen to say
more was there. Compacting the pills (no article) did not save it — the longer
label wrapped and the card grew again. So the mnemonics live on the cards, and
whether the Mémo should teach them is Dan's call: the card is already full
with his cognate groups, and cramming a third list into it is the "too much
going on" he objected to in Unit 0 Lesson 1.

*Method note:* the first measurement compared the card's bottom against the
**viewport** (844) and printed "fits without scrolling" while it was in fact
clipped — the constraint is the Continue button (593 baseline, 734 loaded),
not the screen. A baseline run without the block is what made the regression
legible: 144→563, clear.
## 2026-08-29 — session length reaches the other three drills, and LessonPager's lint is real-fixed

Two of the four Dan asked to settle. (`/activities` and the lesson selectors
follow separately.)

**Session length, everywhere it was missing.** `lib/sessionLength.ts` had one
caller. It now has four, and the question is asked once per run, before any
French, only on a queue long enough for the answer to matter:

- **4Mémoire** — the cap lands on the CARD RUN only. "all" (the grid) and
  "list" (the table) are reference views over the whole deck; hiding cards from
  a table someone is reading is a different act from shortening a drill. The
  deck-wide ✓ counter still counts the deck.
- **GramMarathon** — straight cap on the shuffled gap queue.
- **WorDrill** — the one that needed it most. Its "Tout" scope compiles every
  curated deck into one run: **834 words**, measured in a browser. The cap went
  into `SayItContent`, which WorDrill drives, so per-deck Say It gets it too,
  and every progress readout (shell bar, session map, the run counter and its
  bar) now counts against the RUN rather than the deck — a bar filling towards
  a number nobody chose is not progress.

**The chooser is one component now** (`components/HowManyQuestions.tsx`). Four
drills asking the same question in four hand-copied blocks would read as four
different questions within a month. Factoring it out also fixed a real bug in
the original: CompleteIt wrapped its chooser in `DrillShell` unconditionally,
so an embedded run in a SIO popup drew a whole drill frame — exit ✕, bottom bar
and all — inside the popup for one screen and then threw it away. Every call
site now picks its own wrapper. WorDrill's chooser keeps a "← Change scope"
button: it is reached from the scope picker, and the one screen with no way
back should not be the one that opens a run of the entire curriculum.

Driven in a browser, wall opened locally: 4Mémoire 33 → 10, GramMarathon 30 →
10, CompleteIt 33 → 25, Say It 33 → 10 and → 25 (the progress denominator reads
the chosen number in each), WorDrill Tout offering 10 / 25 / **All 834**, and a
14-item deck correctly never asked.

**LessonPager: four of six lint errors fixed at the source, two suppressed with
the reason.** Not "gates nothing, leave it". The four were `react-hooks/refs` —
`endedAtRef.current - startRef.current` computed in the render body to print
the finished run's ⏱ time. That is a genuine render-phase ref read, and it is
what made the React Compiler bail on the component; once it bails, later
diagnostics are measured against a component it has given up on, which is how
an ordinary `Date.now()` inside an EFFECT came to be reported as impure
"during render". The elapsed time is known exactly once — when the run ends —
so it is computed there and held in state. `endedAtRef` is gone.

The remaining two are a real conflict between two rules, not noise: `build()`
shuffles, shuffling in render breaks SSR hydration (the AGENTS rule every drill
follows), so the build must be an effect, and an effect that builds a queue must
set state. Suppressed on their own lines with that written beside them.

Repo lint **138 → 132**; LessonPager is now clean rather than the worst file.

**Not verified in a browser:** the end card's ⏱ readout. Driving a 13-card
lesson to its end kept stalling on blocked Firebase auth calls. The argument
that it is safe is structural rather than observed: `elapsed` starts null and
is set by the same effect that used to write `endedAtRef`, so the end card
shows 0:00 for exactly the one frame it always did (the ref was also 0 until
that effect ran) and then the real value. Replay clears it. Worth a look next
time someone has the app open.

## 2026-08-29 — the selectors reach every lesson that has an axis

The last of Dan's four. `conjugaison-u1` had proved the mechanism on one
lesson; **thirteen more now carry it**, which is every remaining lesson with a
real axis. (`prepositions-core` appeared in the survey but is a shared helper
module other lessons build on, not a lesson — correctly left alone.)

| lesson | axes |
|---|---|
| aimer | Sujet · Verbe · Article |
| aimer-infinitif | Sujet · Verbe |
| aller | Sujet · Préposition · Forme |
| avoir-etats | Sujet · Type (âge / avoir / être) |
| conjugaison-er | Sujet · Verbes (réguliers / irréguliers) |
| faire | Sujet · Partitif · Forme |
| frequence | Sujet · Fréquence |
| futur-proche | Sujet · Forme |
| manger-boire | Sujet · Verbe |
| modaux | Sujet · Verbe |
| nationalities | Accord · Pays |
| pouvoir | Sujet · Usage (capacité / permission / refus) |
| se-presenter | Tâche |

**The axes are chosen, not enumerated.** Every varying list could be a
dropdown; most shouldn't be. aller's nineteen PLACES are vocabulary, so the
axis is the **preposition** (au / à la / à l' / aux / en / chez) — the thing
the lesson actually teaches — and places are rolled within it. aimer's article,
faire's partitive and nationalities' agreement are the same call. Where a
branch WAS the grammar it became an axis rather than a coin toss:
conjugaison-er's -er/irregular split, avoir-etats' three rounds, pouvoir's
three uses, se-presenter's three name tasks. A learner who keeps missing the
irregulars can now sit only those.

**One helper, not fourteen copies** (`native/axis.ts`). The subtle part is what
a pin that matches nothing must do: **roll**, not throw and not return the
first item, or a dropdown silently becomes a filter that empties the lesson.
Written once. `pinnedGroup` narrows rather than overrides, because pinning "au"
and rolling "piscine" would produce a wrong sentence, not a harder question.
Per-lesson negative rates are kept (faire leans negative 40%, aller 35%) —
flattening them to a coin toss would have changed every unsteered run.

**verify46 (shipped as verify43; renumbered the same day — verify43-three-stops.py already held that number), 198 checks, executing the generators.** This is the only kind of
check that works here: a generator that ignores its `pinned` argument compiles,
renders, and looks in source EXACTLY like one that honours it. So for every
axis it pins each option 200 times and requires two options whose outputs are
**disjoint**. "Exists a pair" rather than "all pairs" deliberately — pouvoir's
« permission » only applies to a subject that could be asking and falls back
otherwise, a legitimate narrowing all-pairs would call a failure. It also
requires every declared key to be READ, every option to generate something, and
unpinned runs to still vary.

Four break-tests: a pin silently ignored, an axis declared but never read, an
option matching nothing, and the `@/` alias returning. **The third exposed a
vacuous assertion** — "every option generates something" could not fail,
because a throwing generator killed the probe before the check ran. The probe
now catches per-sample throws so that option reports as generating nothing.
Green-but-unfalsifiable is the failure this repo keeps finding; it found
another one.

**Two knock-ons.** The generators must load under plain node, so the two that
used `@/lib/shuffle` now import it by relative path — `@/` is a bundler
feature. That dropped verify27's "one shuffle" ratchet below its threshold;
the ratchet now counts both spellings, since its rule is one shuffle, not one
spelling, and it was re-broken to confirm it still bites.

Driven in a browser: /lessons/aimer shows Sujet · Verbe · Article with 🎲 Roll
the dice on the entry screen, faire three, se-presenter one — matching the
declarations exactly.

**Not done, and not asked for:** lessons with no subject axis (possessifs,
meteo, partitifs, quand, …). Some may still have one worth having —
possessifs varies the possessor — but that is a content judgement per lesson,
not a mechanical follow-on.


## 29 Aug — the last two deck-side promise gaps (Dan: "fix it and merge pls")

**SIO-005 · beige.** The v9 sheet gives eleven colours a mnemonic and stops.
Dan settled the twelfth: **`le sable beige`**. All 12 now carry one.

**SIO-001 · M./Mme as a form of address.** The competence names it and the
LESSON already teaches it — `se-presenter.tsx` has a `title` task and the Mémo
reads « Bonjour, Madame Martin ». The **deck** did not: `sappeler.json` held
`Monsieur` zero times and `Madame` once, inside « Vous vous appelez Madame
Martin », where Madame is part of a NAME, not an address. So 4Mémoire,
WorDrill, iComplete, GramMarathon and Letris — five of the six surfaces —
could never show it. Three cards added, in the lesson's own vocabulary:

    Bonjour, Madame Martin.              Au revoir, Monsieur Dubois.
    Comment vous vous appelez, Madame ?  (title in final position)

**A correction I owed Dan.** I told him "the one thing about politeness that
SIO-001 promises is the one thing it never shows". That was wrong — the lesson
shows it; only the deck didn't. The gap was real but narrower than I said, and
the distinction matters: it is why `verify45` asserts the DECK and not the
lesson.

**`verify45-promise-gaps.py`** (5 assertions, each proved to fail on its own
fault first). Two are worth keeping in mind:

- **The vocative is matched on its PUNCTUATION**, `,\s*(Monsieur|Madame|M\.|Mme)`,
  not on the bare word. A check for "Madame" appears in the file would have
  passed on « Vous vous appelez Madame Martin » — the very card that made the
  gap. The break test that matters is #1: with the three new cards removed,
  i.e. the deck exactly as it was, the check goes red.
- The colour/mnemonic match first fired on **its own bad extraction**:
  `fr.split()[-1]` yields `l'orange`, which is not a substring of
  `le fluo orange`. The content was right; the article has to be stripped,
  elision included. Looked before believing it, as with the two earlier
  generator false alarms.

**Numbered 45, not 44** — `verify44-tour-targets.py` already existed. Peers
renamed their own 42 to 43 for exactly this reason hours earlier, and I walked
into it anyway. `ls verify/` before choosing a number costs nothing; the
collision cost verify31-wordrill a fortnight of never running. Wired into the
workflow, and every one of the 36 scripts is still named there.

**SUPERSEDED on 29 Aug — see "re-audit of Dan's nineteen" below.** The ten
numbers (6, 8, 9, 10, 11, 12, 15, 16, 17, 19) are dead: Dan could not recall
them either and asked for a fresh sweep instead, which ran across all four
areas the recovered nine clustered in and found one real defect (the SpeakZone
pairing bug). Do not wait on Dan for these, and do not re-open the numbering.
#18 was CLOSED by Dan on 29 Aug ("SETTLED", below) after it would not reproduce.
**Still open:** whether the colours
Mémo should make room for the mnemonics by dropping one of its three sections
(they are on the cards either way — the card overflows behind Continue if a
fourth block is added, measured).
## 2026-08-29 — the Index is retired; the map is the front door, and each activity gets its own landing

Dan: *"we shouldn't have to land on the index page at all. the maps should
still be the front door for everything"* and, for the tiles, *"it takes them to
the landing page that lists all the X on the website, and perhaps highlight the
one relevant to their latest Pre-test"*. Both built; `/activities` deleted.

**The one page that did two jobs is now two doors that each do one.**

- **The map** — how you choose a STOP. Tap it, get its popup, pick anything it
  has. Every stop-level activity with no page of its own (Memo, Sorting,
  iComplete) now falls back here instead of to the Index.
- **A landing** — for someone who has already chosen the ACTIVITY: every stop
  that has it, in course order. `/practice/flip-it`, `/practice/speculearn`,
  `/practice/grammarathon` render it today; adding another is one line.

**Three decisions inside the landing.** One unit open at a time (`<details
name>`, with a hand-rolled fallback for browsers without exclusive accordions)
— fifty rows at once is the wall the Index was. A stop lacking the activity
**ghosts rather than disappears**: a missing row says "this stop has nothing"
when what it has is everything except this one activity, and the ghost is
derived from `cellHref`, never a second list. The learner's **last pre-tested
stop is marked and its unit opens first** — a guess before instruction is the
best signal the app has for where someone actually is.

**The authoring backlog was rescued, not deleted.** `?gaps=1` was a hidden
query on the learner-facing Index; deleting the page would have taken it too.
It is now a **🧱 Gaps panel on /teacher**, still derived from `gapCells()`, so
a gap closes the moment content lands with nothing to tick off.

**Fifteen files repointed** — the site tab (Index → 🗺️ Carte), the registry's
three activity hrefs and the Practice family, DrillShell's exit fallback,
LessonPager's, ÉcouTexte's, ConjugaZone's, the profile footer, deck search,
NoDeck, not-found, the first-run tour, the rail and Menu fallbacks, the teacher
student links, and `labels.ts`. Verified in a browser: `/activities` 404s, and
zero `/activities` links survive on Home, the map or any of the three landings.

**verify24 rewritten, not deleted.** It WAS the Index-redesign suite; it now
holds what replaced it, with the supersession and Dan's words in the file
header — 27 checks. verify19, 26, 27 and 30 each carried one "the Index exists"
assertion; each was re-pointed at the rule it was actually protecting (the
Practice family must not be orphaned; the heat strip's remaining three homes;
NoDeck's door; the profile footer's).

**Six break-tests, and two of mine were vacuous.** "Ghost rows are rendered"
and "the backlog has a panel" both passed while sabotaged — the first because
filtering the list before `.map` leaves every ghost string in place, the second
because deleting the tab leaves `panel === "gaps"` in the render. Both are now
structural (the row list must reach `.map` unfiltered; the panel needs a tab
AND a render AND the component). All six fire.

tsc clean · build green · all 36 verify suites pass · lint **132 → 130**.

**Still open:** the remaining seven stop-level activities have no landing —
they have no site-wide door in the registry (`href: null`) and are reached from
a stop, which is the map's job. If Dan wants "all the Memos" as a page too,
it is one line each.

## 29 Aug — two of the open questions closed by Dan

**#18 is SETTLED** (Dan's word, 2026-08-29). The report was *"pressing '1'
doesn't pick answer 1 — it throws you back to the start of the lesson and
wipes the bar"*. Driven in a real browser on `se-presenter`, on both a memo
card and an exercise card: 1 does not navigate, the bar does not change, and
it does select option 1. Not reproducible, and Dan has closed it rather than
name another screen. No code change; recorded so nobody re-opens it from the
old "still open" line.

**The colours Mémo stays as it is.** The mnemonics live on the CARDS
(`example`/`exampleEn`, rendering in iComplete's and GramMarathon's WHY and
the pre-test review table) and NOT in the Mémo. Adding them there was measured
and reverted: the card went 419px → 667px at 390×844 and its last row sat 76px
behind the Continue button. Dan treated the question as closed with `le sable
beige` shipped, so the Mémo keeps its three cognate sections. Do not re-add a
fourth block without re-measuring against the Continue button — not against
the viewport, which is the mistake that made it look like it fitted.

**Still open, and both need Dan, not an agent:**
- **The ten bugs — 6, 8, 9, 10, 11, 12, 15, 16, 17, 19.** ~~Their text exists
  nowhere in this repo; only the numbers were ever written down.~~ **CLOSED
  2026-08-31.** Dan could not restate them, so the numbering is retired rather
  than carried as a permanent unknown: the 29 Aug sweep audited all four areas
  the recovered nine clustered in (layout, audio, feedback, scoring) and found
  one real defect, the SpeakZone false pairing, now fixed and guarded by
  verify50. A bare number is not a bug report. Do not re-open this list; file
  anything new as its own item with its text.
- **Lint in CI.** Audited 2026-08-29: `npx eslint src` reports 132 problems
  (113 errors) across 51 files — 63 `set-state-in-effect`, 34
  `no-unescaped-entities` (mostly French apostrophes in memos.tsx), 9
  `react-hooks/refs`, 6 others. Turning it on repo-wide would paint every PR
  red on day one, which is what deleting `claude-review` just cured. The
  proposal put to Dan is to lint only the files a PR touches: new work must be
  clean, the 51 existing files stay until someone is in them anyway, and the
  pile can only shrink. Awaiting his yes/no.

## 31 Aug — the rail lost its hierarchy in the 30 Aug mirror

Found while reading `claude/pre-tests-amendments-hndx8r`, not by a check. My own
regression, in `be0930c` ("The menu rail moves to the left, and the desk mirrors
with it"): a blanket left→right sweep caught two lines that were **already
correct**, and flipped `.cahier-tab--sm` / `--xs` from `border-left-width` to
`border-right-width`.

A flap's tier is drawn by the thickness of its coloured edge — 6px site row,
5px deck activity, 4px in-page view — and that is the only thing carrying
"site row > deck activities > Flip It" visually. Measured in a browser rather
than read:

    cahier-tab       left=6px right=1px      base, correct
    cahier-tab--sm   left=6px right=5px      no step-down, stray grey edge
    cahier-tab--xs   left=6px right=4px      same

So all three tiers wore an identical 6px hue and the two lower ones grew a
5px/4px GREY edge on the opposite side that nothing asked for. Shipped 30 Aug,
live since. Both files parsed, tsc was clean, and every check stayed green —
nothing in the suite looked at this at all.

`verify61-flap-edge.py` guards it, and deliberately **does not pin the side**.
Dan has moved the binding once and may move it again; pinning "left" would make
a future correct mirror fail here for the wrong reason. It reads which border
the base rule paints with `var(--tab-hue)` and asserts the modifiers step *that*
edge down and leave the other alone. Break-tested on seven mutations — the
regression itself, each modifier flipped, a lost step, two tiers at the same
width, the hue leaving the border, the base rule renamed, and the desk flipped
right with the modifiers left behind. All seven red on the first pass.

The lesson is the mirror, not the CSS: a left→right sweep over a stylesheet
will hit declarations that were already on the correct side. Mirroring is not a
find-and-replace.

## 31 Aug — Tier 1, batch 1 of four

Five concepts, and they are one argument rather than five: **what the negative
does to the article tells you which article it was.** That is the contrast Dan's
own L08 and L09 pages set up between them, so batch 1 is the pair plus the three
stops that complete it.

| stop | the question the FORMS cannot answer |
|---|---|
| **23** Likes (L08) | « Je ne fais pas **de** sport » loses its article — so why does « Je n'aime pas **le** sport » keep one? |
| **24** Faire du/de la (L09) | `du` is not a word: it is `de` + `le`. A negative removes the portion, so the `le` half goes and `de` is what was always underneath |
| **42** Partitives | four forms are one word plus an article — only `le` and `les` fuse with `de`, which is why `de la` and `de l'` stay in two |
| **28** Négation | `ne` does not go before the verb; it goes before the verb **and everything glued to it** (`me`, `te`, `se`, `y`) |
| **22** Possessives (L13) | the possessive agrees with what is owned, so « son livre » is his book AND hers, and no form will ever tell you which |

Every claim is lifted from the Mémo already in the file. The Mémos state the
FACTS — "even in the negative the article stays le/la/les", "in the negative
du/de la/des all become de". None of them says WHY, and the why is what turns
stop 24 from a second rule into a consequence of the first.

### The measurement that was worth more than the concepts

The page-length harness reported **1111px / 1.98 screens for all seven concepts
measured, identical to the pixel.** Seven different pages cannot be the same
height. The URL was hardcoded to `salutations` — a `sed` that silently matched
nothing — so every run measured the same page. Parameterised properly the
numbers separate: 923–1111px, and it immediately found a real fault, negation's
flow box scrolling sideways at 304px in a 296px box. Shortened; gone.

**Identical numbers across different inputs is the tell.** Nothing in the output
said "vacuous"; it took noticing that seven pages agreeing exactly is not a
result. Fifth vacuous check this session, and the first found by suspicion
rather than by break-testing.

All 20 concepts render clean · every one under two screens · nothing scrolls
sideways · `tsc` clean · build passes · 56 verify scripts green · lint clean.

**Not merged** — rule 6. Handed to fluoduo-main.

## 31 Aug — the first Tier 3 concept, and whether the format survives it

Peers and this session independently reached the same conclusion: Tier 3 is the
hole, and one phrase stop must be written before six ateliers are drafted to a
shape that might have to move. Dan agreed. This is that one.

**Stop chosen: SIO-009 Greetings (`salutations`).** The six ateliers have no
native lesson file at all, so a concept cannot sit on one yet; of the nine phrase
stops, this is the sharpest test — eleven fixed blocks, no rule under them, and a
learner who knows `aller` will try to analyse « ça va ? » and get nothing.

### What the test was actually asking

Tiers 1 and 2 both argue about a SYSTEM: a rule the forms hide, a distinction the
word list cannot state. `SYLLABUS_TIERS.md` is explicit that Tier 3 has no such
system, and that analysing a block into parts is *"actively wrong at this level"*.
So the question was not whether the slots would compile — it was whether they
would ask for the wrong thing.

**They hold, and what changes is what fills them.** The move is from FORM to
MOMENT:
- `flow` branches on the SITUATION (arriving or leaving? how well do you know
  them? when will you meet again?), not on the shape of a word.
- `pitfall` contrasts WHEN a block is said, not what it is made of —
  « Bonne nuit ! » is bedtime, not any goodbye after dark.
- `contrast` still lands on English logic, because English genuinely does merge
  moments French keeps apart: *good night* both ends an evening and sends someone
  to bed; « Salut ! » is the only French block that works at both ends.

**Peers' worry about `enchanté` turns out to be answerable, and the escape hatch
already shipped.** Their objection was that a phrase has no English logic to set
a contrast against. Sometimes true — and `pitfallHeads` (added in #86, because
`aliments` contrasts what the ARTICLE suggests with what is true) already makes
both column headings overridable. Where a block genuinely has no English
counterpart, the heads move; the slot does not.

### A rendering fault the types could not catch

`<i lang="fr">Bonne nuit !</i> — and only there.` rendered as
`Bonne nuit !— and only there.` The plain space after `</i>` was dropped; `{" "}`
fixes it. **This was NOT a fleet-wide problem** — all fifteen concepts were then
rendered and scanned for a word character jammed against an em dash, and the
other fourteen were clean. Checked before reporting, because "shipped concepts
may all be broken" would have been a much louder and entirely wrong claim.

Driven at 390×844: six tabs, Concept present, no horizontal overflow, no page
errors, every slot rendering — and the mini-check answers correctly staying
hidden until asked for.

**Still Dan's to approve.** Sixteen sentences of drafted English and eleven
French blocks, every one of them already in the file's own `SITS` or `bonus`.
No new French.

## 31 Aug — Sorting: two agents, same bug, one hour apart

Peers and this session both found Sorting's mistag and both opened a PR for it
within five minutes (#88, #89). Both retagged it `recognition`; both claimed
`verify60`. Merging both as-is would have failed `verify-wiring` on the
duplicate number and conflicted in `evidence.ts` — **the second time in one day**
that two agents claimed the same verify number (verify58 turned main red this
morning). Before taking a number, check every remote branch, not just main:

    for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin); do
      git ls-tree --name-only $b verify/; done | grep -o 'verify[0-9]*' | sort -u

**Peers' #89 shipped; this session's Sorting half was dropped.** Theirs was
better on root cause: the surface now emits `sorting:` instead of `dice:`, so
the four entries named after the pedagogy stop pointing at the one activity that
is not it — which is how the confusion arose and how it would have recurred. The
three legacy names stay in the table and in `normalizePath`, so answers already
banked still resolve.

**Dan chose the read-time correction** (`readEvidenceType`), which was option (b)
in all but name: stored Sorting records are re-read as `recognition` rather than
left at the `constrained` the old table produced. Deliberate overrides are left
alone — open writing keeps `free`, a pre-test keeps `diagnostic`. The principle
Peers put on it is the right one: *the activity is the observation and was always
stored; the type is an interpretation of it, and interpretations should be
current.* That dissolves the (a)-vs-(b) choice instead of picking a side. It was
safe to choose freely because nothing gates on `evidenceType` (see below).

What survives from #88 is the complementary half: `verify62-band-evidence.py`
(renumbered from 60) cross-checks the band against the evidence table for **all
21 surfaces**, where Peers' `verify60-sorting-recognition.py` asserts the
pathway did not move. Different questions, both worth keeping. verify62 names
`sorting:` AND the legacy `dice:`, because asserting only the alias would stay
green while the live tag drifted.

## 31 Aug — how Sorting came to be filed under two difficulties

The band on the page called Sorting `recog` (set 26 Aug, from evidence.ts's own
definition of "recognition": *pick from options, sort into a column*). The
lookup table in the same file tagged every `dice:` answer `constrained`. So for
five days the page told the learner one thing and the stored record said
another, and nothing in CI compared the two files.

Sorting is genuinely recognition, and the code settles it rather than the
naming: `PracticeContent.commit` compares `choice.key` to `item.correctColKey`
and strikes a wrong pick out of the visible set — the answer is on screen
throughout. `dice:`, `dice-practice`, `/practice/dice/` and the (unemitted)
`lesson-dice:` are now `recognition`.

**I overstated the risk when I put this to Dan**, and the correction is the
reason it could be settled without him. I said changing the lookup would change
"what the teacher dashboard and the star ladder believe those learners have
demonstrated". The star ladder does not read `evidenceType` at all. **Nothing**
does: it is written by `firebase/responses.ts` and read only as display text in
`teacher/Students.tsx:492`, passed straight through `teacher/data.ts` with no
aggregation, filter or threshold anywhere. Checked before acting — the three
options I offered (forward-only / retroactive / correct the band instead) were
weighted against a consequence that does not exist.

So: **forward only, no migration.** Records written before 31 Aug keep
`constrained`, and the teacher's response list shows both labels for Sorting
across that date. It costs interpretation in one column and nothing else. A
retroactive pass stays cheap if Dan ever wants the old labels corrected, for
the same reason: no derived state depends on them.

`verify62-band-evidence.py` holds the two files together, in both directions,
bridged through `activityLedger.PREFIX_TO_KEY` (activity string → registry key,
which is what `BAND` is keyed by). It parses all three tables from source
rather than restating them, so deleting a row makes the row vanish here instead
of leaving a stale copy green.

**Break-tested on twelve mutations; three exposed real holes on the first
pass.** Reverting Sorting to `constrained` went red, as did flipping the band,
WorDrill as recognition, Compose as constrained, pretests losing `diagnostic`,
Flip It as free, iComplete as recognition, Compose banded recog, and both table
renames. The three that came back GREEN:
- **`str.find("const ACTIVITY_EVIDENCE")` prefix-matches a renamed table**, so
  the vacuity guard did not fire on a rename. Openers now carry the `:`.
- **`checked >= 12` was a floor, not a count.** Dropping Sorting from the
  ledger bridge took coverage 21 → 19 and the floor stayed green — the same
  silence this check exists to end. It asserts `== 21` now, so adding a surface
  fails once, on purpose.
- **One mutation was simply wrong**: there is no `["say-it:", …]` row, only
  `["say-it", …]`, so the sed matched nothing and the "hole" was my test. Redone
  against the real row: red.

Fourth time this session that a check written to guard something passed while
guarding nothing. The pattern is the same each time — a scan that matches more
loosely than the thing it is asserting.

### SIO-045A stays

Flagged because I had earlier called it leftover junk from a renumbering. It is
not: 45 was left as a deliberate hole on 2 Aug when Market phrases folded into
SIO-044 (Commerces), so that 46+ would not shift and break saved progress, and
**Numbers 70–99** was then dropped into it. Today it has its own deck, pre-test,
six finale items, an index grouping, 18 references across `src/`, learner
progress records — and, since 29 Aug, purpose-built content for the arithmetic
(60+10, 4×20, 4×20+10) and prices. PR #86 shipped its concept (`soixante-dix`).
Killing it would discard work merged days ago. Keep; the question is closed.

## 29 Aug — five more stops filled (4, 7, 8, 21, 34)

The 50-promise audit found stops whose can-do names an ACT while the deck
behind it teaches only that act's vocabulary. Three were filled first (3, 17,
18), then 11. These are the last five, on Dan's rulings of 29 Aug:

| stop | what it now teaches | Dan's ruling |
|---|---|---|
| 4  | « On est mardi. » · « C'est le matin. » | simplest possible sentences |
| 7  | counting **to ten only**, plus « Il y a combien d'étudiants ? » | "stop at number 10 and just add" |
| 8  | **exactly two lines**: « Pardon, on fait quoi ? » · « Répétez s'il vous plaît. » | "only very basic structures" |
| 21 | « C'est une gomme. » · « Ce sont des téléphones. » | simplest possible sentences |
| 34 | two places in ONE sentence, with the `de` contraction | "34's lesson must talk about them — content to be expanded" |

"This is unit 0 for pete's sake" is the register for all of them.

**Stop 34 is the one with a rule.** Its deck already sorts sixteen prepositions
into the three groups that matter — takes `de`, takes no `de`, takes no place
at all — so my audit calling it a gap was wrong for the same reason stop 11
was: the deck stores letris COLUMNS, not sentences. What it never did was put
two places in one sentence, which is the entire promise. And that is where
`de + le → du` / `de + les → des` becomes unavoidable. « loin de le parc » is
the error the lesson exists to prevent.

**Corrections made by executing rather than reading.** « Les toilettes **est**
… » shipped and survived a read-through; running every preposition × every
place caught it, and `estOf()` now agrees. The prompt had the same fault («  Où
est les toilettes ? »). One plural place out of eleven is enough to be wrong on.
My own test regex was also wrong — `\b(du|des|de la|de l')\b` fails on `de
l'école`, because `é` is not a `\w`.

`verify48` gains section 7: 11,000 cards executed across the five, plus the
pins, plus three assertions that hold Dan's rulings specifically — stop 7's
maximum is 10, stop 8 has exactly 2 replies, and no card contains an
uncontracted « de le ». All five break-tested red; none vacuous.

The filename still says `three` while the file now covers nine stops. Renaming
means re-wiring the workflow, and `verify-wiring` makes a stale NAME harmless
where a stale number is not.

**The renumbering** was Dan's next call — see the entry below; it is done.

**Stop 36** (asking for directions) is still unbuilt.

## 29 Aug — SIO-034 and SIO-035 exchanged numbers

Dan: *"if you want to bring locating places closer to giving directions, we
should move the questions up so questions take 34, and those 2 take 35 36."*

Unit 3 now reads **33 Places in town · 34 Questions · 35 Où est… ? · 36
Directions**, verified in a browser on `/unit/3`.

### The invariant this turned up

**A SIO's id and its `num` are in lockstep** — `SIO-034` always has `num: 34` —
unbroken across all fifty, with `SIO-045A` at 45.5 as the one deliberate
half-step. Nobody had written it down. It is how Dan's own 2026-07-01 renumber
of 012-014 and 022-028 was done, and `verify49` now asserts it so it cannot
drift.

That makes a renumber more dangerous than it looks: **the number moves the id,
and the id is what every store on the learner's device is keyed by.** Without a
migration, whoever had finished « Où est… ? » would open the app to find they
had finished « Questions », with their pre-test misses filed under the wrong
stop. The 2026-07-01 renumber escaped this only because the 2026-08-11 reset
wiped every blob a fortnight later. There has been no reset since.

### What moved

Content moves, positions stay — so `sios.json` and the two pre-test JSONs keep
their `id` / `num` / `setId` / `lessonNo` and exchange everything else. The file
stays in numeric order and the diff is 18 lines.

- `src/lib/migrations/renumber3435.ts` — swaps the ids in `doneSios`, `itemSrs`,
  the activity ledger and the pre-test record. Stamped, because **the swap is
  its own inverse**: a second run would put everyone back. Called from the top
  of all three stores' `load()`, so there is no boot-ordering dependency.
- The finale's `finale:SIO-034:2` shape caught a bug in my first version, which
  swapped only the FIRST colon segment and silently missed every GramMarathon
  answer. It maps every segment now.
- The pre-tests hold 8 and 7 items, so they could not be renamed — the content
  moved between the files and each item id was re-homed.
- The handoff CSV: the sync re-pointed the objective columns, but it disclaims
  the four flashcard-spec columns by design, so it reported success while
  leaving both specs describing the other row. Swapped by hand and recorded in
  `docs/CSV_SPEC_REASSIGNMENT.md`. **If two objectives are ever swapped again,
  their specs must be swapped in the same commit.**

Driven in a browser against a seeded pre-swap blob: all four stores followed,
and a reload did not swap back. `verify49` break-tested on 8 mutations, all red,
none vacuous. 39 checks green, tsc and build clean.

**Stop 36** (asking for directions) is still unbuilt.

## 29 Aug — the banded icon tile, shared; and the stop sheet says what the stop is FOR

Dan, on seeing the stop sheet: *"actually those icons are very good. i want to
use them"* — on the activity landings and in the stop popup.

**One tile, one file.** `src/components/ActivityIcon.tsx`: the activity's emoji
on a box filled with its DEMAND band (`bandOf`), 40px in the sheet and 28px in
the landings' fifty rows. It had lived inline in StopSheet, so "use it
elsewhere" meant a second copy or a component; a duplicated tile is exactly how
one activity ends up wearing two colours on two screens, which is the fault
`activities.ts` exists to end. It is `aria-hidden` and every caller prints the
name — colour reinforces, never carries alone. No emoji renders no tile: an
empty coloured square reads as a fault, and the element is decorative.

**The stop sheet now carries the SIO in full** (Dan, same day: the stop should
open to "(1) the SIO in full, (2) the app icons. that's all"). Heading is the
French `fr` title, the English `short` rides under it small, then the can-do.
NOT `competence` — that is grading wording and has never been shown to a
learner.

**A regression I caused and then paid for.** The 28px tile is 10px wider than
the bare emoji it replaced, and the landings' label column was already tight:
measured at 390px, main truncated **4 of Unit 0's 10** French titles and my
tile made it 5. Recovered from the row's own slack — the number chip 32→28px
and two gaps — so the column went 149px → 151px and the count is back to 4.
The tile is paid for out of chrome, not out of the objective.

**Still truncating, and NOT mine:** « Ça s'écrit comment ? » (167px), « Il y a
combien de… ? » (162), « Les instructions de classe » (206) and « Bonjour !
Salut ! Au revoir ! » (211) against a 151px column. No tightening closes a
60px gap; it needs a decision — wrap to two lines, drop the size, or accept
the ellipsis. Dan's call, flagged not taken.

**verify36 gains four assertions, and two of them were vacuous on first
break-test** — the same two shapes this repo keeps finding:
- `"bandOf(" in file` passed with the call deleted, because the component's
  own docstring EXPLAINS that the fill comes from `bandOf()`. Comments are
  stripped now (verify19b and verify40 each learned this before).
- `"ActivityIcon" in file` passed with the element deleted, because the import
  line alone satisfied it. It matches `<ActivityIcon` now (the `function
  AllCards` lesson, 28 Aug).
The copy-detector also fired on `PageBand.tsx`, which fills a page-wide strip
from the same variable and is not a copy of anything; it now requires the box
to centre a glyph, which a strip never does.

## 29 Aug — every activity page names itself, and the two games get a landing

Dan, in one sitting: *"why is the coloured heading strip not consistently
showing the name of activity"*, *"why doesn't NumBus and NumBourse land on the
same type of selection page as VocabulaRain and LexicaLater"*, and *"even if
they do not have 50-stop list, it should still have a landing page before the
game begins, e.g. for settings and so on"*.

**The audit that answered all of it** (every activity's href driven in a real
browser, 390px). Fourteen have a door; the pattern rollout had reached three:

    the 50-stop landing   SpecuLearn · 4Mémoire · GramMarathon
    their own page        WorDrill · ÉcouTexte · ConjugaZone · VoixLà ·
                          ComposeIt · ChaTutor · VocabulaRain · LexicaLater ·
                          DéjàRevu
    NO STRIP AT ALL       NumBus · NumBourse
    no door at all        Memo · Sorting · iComplete (stop-only, by design)

Nothing was wrong with the individual pages — the rollout simply stopped at
three. Worth stating plainly because it looked like eleven separate faults.

**The strip fix is one word.** `CahierShell` takes the strip's label, its
family wash AND its demand band from `active`. ActivityLanding passed
`unit-${openUnit}`, so all three landings announced themselves as "Unité 0"
while every other page in the app said its own name. It passes `activityKey`
now. No unit flap is marked, which is honest: the page spans all five.

**`GameLanding.tsx`** — the page a game opens on before it starts: the shell
(so the strip names it and the rail is reachable), the emoji, the name and the
blurb from the registry, then whatever the game needs. NumBus's settings form
moved into it; NumBourse, which had no landing at all, gets one naming its
eight-level ladder and a deliberate ▶ Jouer.

**This reverses a patch-23 decision on Dan's word**, and that is the point
worth recording: patch 23 put the NumBus setup inside `GameFrame` — "one ✕,
one ⋯, no page header" — so the form wore the game's chrome. The cost was that
the step had no identity and the activity was unreachable from the rail while
in it. A settings step is a PAGE, not a frame of the game. The GAME still
wears GameFrame.

**A correction I made and then unmade.** Having moved the name into the strip,
I stripped it from the landing's section band as redundant. Wrong: every other
page in the app names itself in BOTH — WorDrill's strip says WorDrill and its
heading says 🎙️ WorDrill. Dan's complaint was that the STRIP was inconsistent,
not that the heading repeated it. Restored.

**Also from the same sitting:** the fifty landing rows no longer each wear the
same activity icon (Dan: "there is no need to have one icon per line. it's a
bloody waste of space" — his own litmus rule: the page IS that activity), and
the French objective drops 16px → 13px. Measured across all fifty rows at
390px: `main` truncated 4 of Unit 0's 10 and 3 more in Units 1/2/4; nothing
truncates now. Three of those were my own titles, shortened rather than
shrinking the type further — « Quelle nationalité ? », « Un ou des ? »,
« Après soixante-neuf… ».

**Still open, and Dan's call:** the eleven activities that are not on the
50-stop pattern. Some would suit it (WorDrill, iComplete via a door of its
own); some plainly would not (ChaTutor, VoixLà, the two number games), and
those now at least have a landing of their own.

## 29 Aug — « épeler » is retired

Dan: *"i want to remove the word epeler throughout the website, since it
already commented ça s'écrit which is a lot more useful."*

The lesson's VISIBLE text was already « Comment ça s'écrit ? » — its Mémo, its
title in `lessons.ts`, its bonus lines. The word survived in three places
instead:

  · the slug, so the URL read `/lessons/epeler`
  · a ComposeIt bank label, `{ label: "Épeler" }` — the one a learner reads
  · two code comments (letris/sets.ts, verify48)

`epeler` → **`ca-secrit`** throughout: the two files renamed, the exports
(`caSecritLesson`, `CA_SECRIT_AXES`, `caSecritQuestion`), the registry key,
`LESSONS_BY_SIO["SIO-003"]`, and verify48's own references. The old URL now
answers "No lesson epeler" in dev and 404s in the export — safe, since the
lesson was a day old and `generateStaticParams` no longer emits it. Nothing
learner-owned is keyed on a lesson slug: `lessonRun` is a 12-hour cache, the
SRS is keyed on items and `markSioDone` on the SIO id.

**A check of mine that reported success while failing.** verify48 has TWO
report blocks — an early bail after the generator setup, and the real one at
the end. I appended the new assertions after the final
`if FAIL: … sys.exit(1)`, so they RAN, appended to a list that had already
been printed, and the script exited 0. The only symptom was the count sliding
56 → 55. Worse than a vacuous check: a vacuous check passes when it should
fail, this one *failed silently while claiming to pass*.

Caught because the break test read the whole tail rather than grepping for a
FAIL line — the grep found nothing and I nearly wrote it off as vacuous. **In
a file with more than one report block, an appended check must go above the
FIRST one that can exit.** All three assertions now fail with exit code 1 on
exactly their own fault, verified one at a time.

The guard is deliberately tree-wide (`src/**/*.{ts,tsx,json}`) rather than
scoped to the three files the word was in, because the point is that it does
not come back. Two companions assert the rename did not quietly unhook
SIO-003 — a lesson can be renamed out of existence and still pass a
"the word is gone" check.

## 29 Aug — re-audit of Dan's nineteen, and the pairing bug it found

Dan could not recall the ten missing bug texts and asked for a fresh audit
across all four areas the recovered nine clustered in.

**Nine of the nineteen were recovered from PR #42** — 1 (the 390px void), 2
(promise vs deck, which became the 50-promise audit), 3 (wrong outearning
right), 4 (audio reading the label), 5 (run position lost on leaving), 7 (the
hint under the tick), 13 (a picked answer wearing the button costume), 14 ("1
days"), 18 (digits as navigation, later closed by Dan). **6, 8, 9, 10, 11, 12,
15, 16, 17 and 19 exist nowhere** — searched every doc, every commit on
`claude/fluolingo-19-bugs`, and every PR body. Only the numbers survive.

### What the sweep found

**Layout — clean.** 31 routes measured at 390x844: no horizontal scroll, no CTA
off-screen with nothing to scroll, no content clipped without a scrollable
ancestor. The only hits were the header brand link (25px) and the sound/timer
chips (30px) against an arbitrary 32px bar — chrome, not a defect.

**Audio — one real defect, fixed.** `SpeakZone.withSubject` found the subject
with `row.querySelector("th, td")`, the row's FIRST cell. Correct for the
two-column conjugation tables it was written against; silently wrong for
SIO-011's four-column pronoun table, which packs two logical pairs per row.
A tap on « eux » said **« il eux »** and one on « nous » said **« je nous »** —
false pairings, taught by the one lesson whose whole subject is which pronoun
goes with which. Now scans leftwards for the nearest subject cell, and a cell
that is itself a subject stays alone. `verify50`, break-tested on 4 mutations,
all red. The two-column behaviour is unchanged and asserted: « ai » still
elides to « j'ai ».

**Feedback — clean.** « Not that one — pick again » appears only while a card is
still open (no Continue present), so the advice is always actionable. That is
the state bug #7 was about, and it holds.

**Scoring — not re-verified end to end; guarded at source.** My browser probe
was **vacuous** — `wrongFirst ? opts : opts` made both runs answer identically,
so the 0 -> 20 XP match proves nothing. The rule is asserted by `verify28`
instead, at the mechanism: *a repaired answer (wrong then right, no hint) is
nudge, not independent*. Recorded rather than quietly dropped, because a
vacuous probe reported as a pass is worse than no probe.

### A false alarm worth recording

The `·` word lists in stop 35 appeared to speak only their first item. They do
not: `sayTapped` splits on `·` and calls `speakSequence` with **gapMs: 1000**,
and my harness waited 300ms. Given 9 seconds all six items speak. Dan's
2026-07-08 ruling, working as designed. Checked before reporting — the same
mistake as stops 11 and 34, where a literal search made teaching look absent.

## 29 Aug — the eight candidate gaps, audited; four were real

Dan: *"merge then do those"*. The eight stops whose can-do named an act with no
lesson behind it, looked at properly rather than guessed.

**Three were not gaps at all**, and that is the finding worth keeping:

| stop | why it was never a gap |
|---|---|
| **25** Pourquoi ? | every card carries the question in its `example` field — *"Pourquoi tu aimes le sport ?"* |
| **38** Getting around | same shape — *"Tu y vas en bus ?"* |
| **39** Wants & needs | the cards ARE the polite act (*"Je voudrais un café."*), not vocabulary for it |

Third time this session a deck looked empty because the teaching sits where a
literal search does not reach — frames (stop 11), letris columns (stop 34), and
now `example` fields. `verify51` asserts these three as an ABSENCE so the next
audit cannot re-flag them and stack a second lesson on one goal.

**A fourth, SIO-006, was left alone** and is Dan's call. Its deck's own
categories are QUI (m/f) and QUOI (m/f) — two of the three question words its
can-do names. Only « Où » is missing, and that is owned outright by SIO-035 in
Unit 3. A lesson here would mostly duplicate one seven stops later.

### The four that were real

| stop | taught | missing, now built |
|---|---|---|
| **13** Les matières | 16 subjects by article | asking — « Quelle matière ? » was the deck's TITLE and on no card |
| **36** Directions | 8 verb phrases, all present tense (the "without commands" half, done well) | asking — same, title only |
| **44** Shops & market | 14 shop names by article | all four acts: the request, the price, the exchange, both sides of the stall |
| **45A** Numbers 70–99 | 30 bare numerals | the ARITHMETIC (60+10, 4x20, 4x20+10) and prices |

Stop 36 mirrors 35 deliberately: `à + le -> au` against `de + le -> du`. That
symmetry is the reason Dan moved them next to each other.

### Two faults found by executing

- **`\bà le\b` never fires.** `à` is not an ASCII word character, so there is
  no word boundary between the space and it. The 36 contraction check shipped
  **vacuous** and was caught only by breaking `aPlace` and watching it stay
  green. Fourth time this session for this exact trap — match the space, not
  the word.
- **The `good` axis was inert on half of stop 44.** The stallholder's card
  asked a bare « Ça fait combien ? », so pinning "tomates" gave the same cards
  as pinning "œufs". The colour-review session's `verify46` caught it by
  sampling every option and finding no disjoint pair. It was weaker content
  too — a price with nothing priced. The prompt names the goods now.

12,000 cards executed clean; `verify51` break-tested on 8 mutations, all red,
none vacuous. 41 verify scripts green.

## 30 Aug — the name gets written down: "Fluency On Linguistic Goals"

Dan asked which expansion of **FluOlinGo** suits best, from five candidates
(*on · over · of · Fluent Outcomes · through Online*). **"Fluency On
Linguistic Goals" wins on the evidence already in the repo**: the house
spelling **Flu**O**lin**Go splices onto it letter-for-letter, and the seams
are the capitals we have been printing all along. The rejected four, briefly:
*over* sets fluency against the objectives; *of* is a genitive with nothing
on the far end; *Fluent Outcomes* is four nouns with no joint, in
assessment-office register, on a page whose first commitment is that nothing
here is graded; *through Online Goals* breaks the splice (nothing supplies
`lin`) and foregrounds the delivery medium in an app that exists to make
Thursday's class land.

Written up as a **"The name" section on `/about`** (`src/app/about/page.tsx`),
after the five commitments and before the References. It carries:

- the wordmark cut at its four seams, each piece over the word it abbreviates;
- the point of the preposition — fluency *in French* is unbounded and
  unfalsifiable, fluency *on* fifty named goals is finite and checkable;
- **the ladder**. A name that is only a noun phrase hides its verb, and this
  one hides four. They are not four rival readings — they are four rungs, each
  standing on the one above, and each demanding its own qualifier on the goals:

  | rung | verb | qualifier | why that pairing |
  |---|---|---|---|
  | 1 | built on | your course's | a foundation you do not own is a rival syllabus |
  | 2 | trained on | linguistic | you train a competence, not a streak |
  | 3 | earned on | one of fifty | earning is per-unit, so the unit must be countable |
  | 4 | measured on | named | measurement needs an identity to attach a number to |

  The compression is legitimate because all four verbs govern the same
  preposition — build/train/earn/measure **on** — so `on` survives as their
  common residue and each reader restores the rung they stand on.

The section is text on a page that is off every learner path (rationale only,
linked from the Guide footer), so the litmus test does not bite: nothing here
sits between a learner and an answer.

Green: `tsc --noEmit`, `npm run build`, all 41 verify scripts. No content,
data or component touched — one file.

## 29 Aug — SIO-006 withdrawn, its rule moved to 21; lint scoped

**SIO-006's lesson was built and then removed.** Dan asked for it after I had
flagged it as the weakest of the eight candidates; rendering it exposed why my
flag had been right and my write-up wrong.

### The audit error

The first card read « C'est quoi ? — C'est ___ consonne », a word not in the
lesson's own list. That is the stop's deck, not the generator, and chasing it
found: **twenty deck names exist in TWO places.** `src/content/<name>.json` is a
letris TILE file; `src/content/collections/<name>.json` is the card deck the app
reads. The gap audit globbed by basename and took the first hit, so for SIO-006
it judged a tile file and never saw the collection's 18 cards — every one
carrying « C'est qui ? — C'est un homme. » or « C'est où ? — C'est une classe. »
in its `example` field.

**So SIO-006 was never a gap.** Same failure written up three times earlier the
same day — teaching hiding where a literal search does not reach — committed
again in a new way. **Anything auditing a deck must resolve `collections/`
FIRST.** `verify51` asserts SIO-006 as an absence now.

### The rule moved to where the objects are

Dan: *"il/elle for objects should go to 21, which should also include ils/elles
(sac, gomme, ciseaux, lunettes)."* SIO-021's lesson gains all four:

| | → |
|---|---|
| C'est **un** sac. | **Il** est là. |
| C'est **une** gomme. | **Elle** est là. |
| Ce sont **des** ciseaux. | **Ils** sont là. |
| Ce sont **des** lunettes. | **Elles** sont là. |

English has only *it* and *they* for the four, so each must be chosen — and the
verb moves with the number, `est` → `sont`.

**A second fault fixed on the way.** Stop 21's plural branch pluralised a
singular with a bare `+ "s"` (« Ce sont des sacs. ») — true French, but not what
the deck teaches. It uses the deck's own plural-ONLY cards now: `ciseaux`,
`lunettes`, `écouteurs`, `mouchoirs`, none of which has a singular at all.
`verify48` asserts both, break-tested, all red.

### Re-checked against the right files

| stop | examples in the real deck | verdict |
|---|---|---|
| 35, 11, 13, 44 | 0 | gaps were real |
| 36 | 4 / 40, all GIVING | asking half was real |
| **21** | **20 / 20** | **partly over-built** — only the ASKING half was missing |
| 45A | single file | never at risk |

### Lint in CI, scoped

Dan was unsure what was being asked, so: CI now lints **only the files a pull
request touches**, on `pull_request` events. New work must be clean; the 51
files holding the 130 existing problems stay until someone is in them anyway.

Two traps, both driven locally before shipping:
- **An empty file list must exit early.** `eslint` with no arguments lints the
  whole project and would fail a docs-only PR on all 111 pre-existing errors.
- **Deleted files must be filtered** (`--diff-filter=d`), or eslint errors on a
  path that is gone.

Checkout gained `fetch-depth: 0`; a shallow clone has no base to diff against.
Verified both ways: docs-only exits 0; touching `useDragFloat.ts` exits 1
naming the rule.

## 30 Aug — §2 of the evidence brief: the eight writers

The colour-review session's `docs/EVIDENCE_HANDOFF.md` split the evidence work
three ways and left §2 to Peers. This is that.

**Their corrected list checks out.** Verified independently before trusting it,
because the brief had already been wrong about its own §2 twice: eight direct
`recordResponse` call sites in six files. `OpenFeedback.tsx:61` is correctly
excluded — it hand-builds a full evidence block.

**One extra find.** `src/app/decks/[id]/mcq/Content.tsx` carried the comment

    // MCQ grades outside recordItemResult (it never fed the SRS), so it
    // writes the evidence trail directly.

directly above a call passing no evidence at all. A comment asserting the
missing thing is worse than no comment — it answers the question a reader would
otherwise go and check, which is probably why this sat unnoticed.

### What was done, and what was deliberately not

All eight keep `recordResponse` and gain `evidence: buildEvidence(...)`. They
were NOT routed through `recordItemResult`, which pays XP and steps the SRS:
Letris says so in its own comment ("must not double-pay XP per tile") and
Compose calls `awardConversationXp()` a line above. Routing them would have
started paying where the design says not to.

Five of the six tags resolve on main today; `letris:` resolves once the colour
session's §1 lands — their branch adds it, confirmed.

**`verify54-evidence-writers.py`** asserts the other half of their `verify53`.
Theirs checks that every TAG resolves; mine checks that the call CARRIES a
block. The two are independent and the gap between them is exactly where eight
sites sat — their tags were all fine, nothing read them. It reads the call's
argument object by balancing parentheses and asserts the `evidence:` KEY, an
absence rather than a value, because that is how the eight hid from the first
scan. Break-tested on 3 mutations, all red.

### The lint gate, paid in full

Touching those six files inherited **16 pre-existing problems, 14 errors** —
exactly the cost this gate was designed to impose, and the one the brief warned
about. Cleared per `AGENTS.md`:

- **One was real**: an unescaped apostrophe in LetrisGame's « Let's go! ».
- **The other thirteen** are React Compiler rules firing on decisions this repo
  records as deliberate — live refs written during render so async callbacks
  read current values; `localStorage` read at mount because it cannot be read
  during render; `Math.random()` in an effect because running it during render
  would ship one seed to every learner on a static export and break hydration;
  the `mounted` hydration guard, whose whole purpose is to be false during
  render. Each disabled with its reason written out, not restructured —
  rewriting eight game components as a side effect of adding an evidence field
  would be a large, untested diff in code this change does not otherwise touch.

**A near miss worth recording.** My first scan of `ACTIVITY_EVIDENCE` parsed
**zero** prefixes and reported all six tags unresolved. The table is
`Array<[string, EvidenceType]>`, not an object literal, and my regex expected
`"key": "value"`. Six false failures, caught only by disbelieving a scan that
found nothing. The same shape as both of theirs.

tsc clean, build clean, 43 verify scripts green, touched files at 0 lint errors.
