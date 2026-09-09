<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dan's litmus test — permanent design rule (2026-07-02)

**Any TEXT that, when removed, does not prevent the user from finding the
correct answer is REDUNDANT — remove it.** Scope is text ONLY — section
labels, context blurbs, grammar badges, inline explanation prose.
Clarified by Dan the same day:
- Decorative/visual elements (tiles, borders, colours, icons) serve the
  visual and are EXEMPT.
- Progress counters (answered/score) are useful learner feedback — keep.
- Per-question explanations are offered behind a "WHY" button at the top
  right of an answered question — available on demand, never inline by
  default.

# Long pages collapse — permanent design rule (2026-08-31)

**Dan: *"now that the page is long please collapse part of it. can you make it
a rule for all — this is the rule from now on."***

A page a learner has to scroll past the fold has stopped showing them where
they are — the whole of it must fit on one screen before anything is expanded
(Dan, same day: *"all long pages must be collapsed for the lower sections, so
the entire fits on one screen first"*). So on **every** surface, not just the
one that prompted this:

- **The argument stays open. The apparatus collapses.** On a lesson that means
  the claim and its answer are open on arrival; the pitfall table, the decision
  flow, the self-check and the word list start closed. If a learner must read
  it to understand the point, it is open; if they consult it, it is closed.
- **A closed section says what is behind it** — "18 words", "3 traps" — not a
  bare chevron. A collapsed section with no count is a section nobody opens,
  which is just deletion with extra steps.
- **Use native `<details>`/`<summary>`.** Keyboard and screen reader support
  come free, it needs no state, and it survives having no JavaScript. Do not
  hand-roll a disclosure with `useState` and a div.
- **Never collapse the only copy of something a learner needs to answer the
  question in front of them.** Collapsing is for reference, never for the
  prompt, the options, or the feedback.

This rule and the litmus test point the same way: the litmus test deletes text
that costs nothing, and this one folds away text that earns its place but not
its position. Neither is licence to hide the lesson.

# Show it, don't describe it — permanent rule (2026-08-31)

**Dan: *"often times i cannot understand what the agent is telling me about
what has changed. so long as i don't see, i can only guess (often wrongly).
can we make it a point to always show what the finished product looks like
rather than just describe."***

A prose summary of a UI change is not a report of that change; it is a request
that Dan reconstruct the screen in his head from your words. He has been doing
that for weeks and guessing wrong. So:

- **Every change a learner or teacher can SEE ships with a picture of it.**
  Drive the real app and screenshot the real route — `NEXT_PUBLIC_OPEN_APP=1`
  gets past the sign-in wall, Chromium and Playwright are installed. A rendered
  mock is second best and must be labelled as one.
- **Before and after, side by side**, whenever something changed rather than
  appeared. "The band is now SemiBold" means nothing alone; the two bands next
  to each other mean everything.
- **When a decision is being put to Dan, show the options, don't list them.**
  Three tab strips he can point at beat three sentences he has to imagine.
- **This outranks brevity.** A short message he cannot act on is not shorter
  than a long one he can — it is a message that has to be sent twice.

The exception is work with no visual surface at all (a check, a data
migration, a type). There, show the *evidence* instead: the check's output,
the row counts before and after. The principle is the same — the finished
thing, not an account of it.


# The names — permanent (2026-08-31)

**The brand is `FluOLinGo`** — capitals F, O, L, G, for **Fluency On
Linguistic Goals**. Not FluOlinGo, not Fluolingo. Every learner-visible
spelling uses it (Dan: *"put it in the repo that we shall call them by those
names and by those icons, and FluOLinGo (with capitals F,O,L,G) for
FluencyOnLinguisticGoals"*). Identifiers, storage keys (`fluolingo:*`) and
the font files (`FluOlinGoHand-*.woff2`) keep their existing spellings —
renaming those breaks things without a learner ever seeing the difference.

> ⚠️ **THE LIST BELOW IS SUPERSEDED. There are SEVEN families now, not six,
> and Skills is retired.** See *"The ☰ menu is SEVEN families now"* at the
> foot of this file (Dan, 2026-09-09) for the list that is true today:
>
>     🧑‍🏫 Lesson · 📝 Practice · 🔄 Revise · 🎮 Games · 💬 Oral · 🛠️ Tools · 👤 User
>
> What survives from the 31 Aug ruling is its SHAPE, and that part is still
> permanent: one fixed name and one fixed icon per family, living once in
> `FAMILIES`, with everything else derived; keys and routes never move when a
> display name does. Only the membership changed.
>
> This pointer exists because the file contradicted itself twice in one day.
> The 9 Sep entry says it supersedes this section — but it says so four
> hundred lines below it, and a session reads top-down. The stale copy is
> always the one that looks authoritative.

**The six families are called by these names and wear these icons, and no
others** (Dan, 2026-08-31 — see the supersession notice above):

    🎯 Goals · 🏋️ Practice · 🎮 Games · 🔄 Revise · 💬 Skills · 👤 User

SKILLS BRIEFLY WORE 🤹, on 2026-09-09, and the reason is worth keeping even
though the family is gone: 💬 was ALSO the floating "report a bug" button, so
opening WorDrill put the Skills door and the bug button on screen wearing one
glyph. The bug button took 🐞 and the family took 🤹 — then, later the same
day, Skills was retired entirely and 💬 came back as **Oral**, which is why
🤹 appears nowhere in the app today.

They live once, in `FAMILIES` (`src/content/activities.ts`), as
`FluOLin <Name>`; everything else derives. Registry KEYS stay as they are
(`svplay`, `review`) — the Memo-rename precedent: display renames never
touch keys or routes. Home's hero key is **Continue** (the current stop),
which is why the games family is Games and not Play: no two doors share a
name.

# A count earns its place when it describes what you cannot see — permanent (2026-09-01)

**Dan, looking at a hub mock-up: *"Do we need that number on the right end of
that strip for every strip?"***

No. `/practice` printed **2** on the shell band and **2** again on the section
band, directly above two tiles anyone can see. The count told a learner nothing
they were not already looking at, twice.

This is not in tension with the collapse rule above — it is the same rule from
the other side. That one says a CLOSED section must say what is behind it
("18 words", "3 traps"), because the content is hidden and a bare chevron is
deletion with extra steps. The reason a closed count earns its place is exactly
the reason an open one does not.

    closed fold, list hidden      -> count it: "18 words"
    open list, tiles on screen    -> the list counts itself

So: put a number on a band only where the thing it counts is out of sight —
folded away, behind a link, or still to come. Never as furniture.

# English is never bigger than French — permanent (2026-09-01)

**Dan, sending back a transport card: *"i prefer a hybrid like this : english
should never be bigger than french."***

The English on a card is a REFERENCE. The French is the target. So the English
may match the French in size and it may sit below it, but it may never be set
larger — on any card, any surface.

The trap is that this had already been ruled once, on 31 Aug — *"it should not
be more salient than the french, but still it should be of equal size (but
italics non bold)"* — and was implemented as a CONSTANT, `text-2xl`. That is
equal beside a `text-2xl` French frame. On an MCQ card there is no frame: the
only French is in the options, which were `text-base`, so a 24px English prompt
sat above 16px French answers and the reference was half again the size of the
target.

    frame card:  French text-2xl   ·  English text-2xl   equal ✓
    MCQ card:    French text-base  ·  English text-2xl   1.5x  ✗

**So size the English against the French that is actually on that card, never
against a number.** `verify83` holds it.

And the same screenshot carried a second lesson. A gapped card is dealt from
the deck's SENTENCE, not from whichever field happens to contain the gap:
transport's `fr` is the grid label « en train », so every card blanked the label
and dealt « ? train ». Dan's mock restored the lead — « J'y vais ? moto » — and
that is the shape. A fragment is not a card.

# A wrong answer is allowed to be wrong French — permanent (2026-09-01)

**Dan, shown five cases one by one and asked which to revert: *"i would leave
those alone, srsly"*.**

The cards in question offered options like these, and every one of them is a
DISTRACTOR — never the answer:

    Il adore l'lecture.          (aimer — the learner picked l' over le/la/les)
    Tu ne vas pas à l'bibliothèque.   (aller — picked à l' over au/à la/aux)
    Il fait de l'sport.          (faire — picked de l' over du/de la/des)
    J'suis fatigué.              (avoir-etats — picked être where avoir is right)
    J'veux un plan.              (the deck's cloze — picked veux after « J' »)

They break elision, and on 1 Sep a rule was written to filter them out of every
options list in the app, on both sides of the card builder, with a check behind
it. Dan reversed all of it. **A distractor's whole job is to be wrong, and
choosing the wrong contraction is exactly the mistake an A1 learner makes** —
removing it removes the error the card exists to train out.

SO: do not filter an option for being ungrammatical. If a learner could arrive
at that string by making the mistake the card is about, it belongs on the card.

The line this does NOT cross, because it is a different fault: an option must
still be one the learner could have PRODUCED by choosing wrongly. « Bon chance »
was cut from the atelier cards (atelierModel.ts) because nobody chose « Bon » —
it was printed by the frame, so the wrong form was the machine's, not the
learner's. The test is *"could a learner have made this?"*, not *"is this
French?"*.

An argument was put twice that 4 and 5 above are that second kind — the « J' »
is glued on by the code rather than chosen. Dan looked at all five and said
leave them. That is the ruling; this note records the reasoning so the next
session does not spend an afternoon rediscovering the filter.

# French that BLOCKS beats French that decorates — permanent (2026-09-06)

The beginner lock says chrome is English. It does not say every French word
outside a deck is a bug, and on 6 Sep the difference got a ruling.

Six controls were changed under FINISH_BACKLOG item 7 — « Jouer » and
« Choisir un autre » (the only two buttons on a game card), a French apology
shown when ComposeIt's checker itself broke, « Carte » and « Accueil » in a
learner's own history, and the map legend's « vocabulaire / grammaire », which
is also what a screen reader announces at all fifty stops.

Four more sets were put to Dan the same day, with the English each would take:

    the unit flaps      Unité 0–4              ->  Unit 0–4
    the ten ranks       Débutant … Maître      ->  Beginner … Master
    the twelve badges   Premier pas, Diplômé…  ->  First step, Graduate…
    two shop colours    Émeraude, Or           ->  Emerald, Gold

**Dan: *"None."*** All four stay French.

**So the test is not "is this French?" but "is a learner STUCK in front of
it?"** « Jouer » sat on the only button on the card — you cannot reach the
game without reading it. A rank and a badge each sit beside an English line
saying how they were earned; « Unité 3 » names a place rather than asking for
a decision. Nobody is stuck, and the French is the app's character.

`verify105-en-chrome.py` names its four surfaces one by one for this reason. Do
not widen it into a sweep for French under `src/` — it would flag every deck
and card in the course, and it would be undoing this ruling.

# Plain English to Dan, always — permanent (2026-09-05)

**Dan: *"please speak to me only in plainn english that i can understand and
with concrete example so i don't have to imagine in the abstract. this is how
miscomm happens, and i have been repeating this over and over and over
again!"***

Every message to Dan: no jargon, no abbreviations he has not used himself,
and every abstract claim carries a concrete example from THIS app so he can
see it instead of imagining it.

    bad:   "this re-litigates the IA rulings"
    good:  "this reopens decisions you already made — for example, 'the
            bottom bar shows Goals, Practice, Games, Revise, Skills, in
            that order'"

If a term of art is unavoidable, define it in the same sentence in one
plain clause. This is the show-don't-describe rule's sibling: that one says
show the SCREEN, this one says show the MEANING.

# No control spans the whole width — permanent (2026-09-05)

**Dan: *"IT HAS BEEN MADE A RULE THAT WE NEVER WNAT TO HAVE A SINGLE BUTTON
OCCUPYING THE ENTIRE WIDTH (except in rare circumstances that i have to
approve)"*** — said about the Réglages tab pick-list, whose six tickable
rows each ran the full page width and went to two columns the same day.

So: a button, a tickable row, or any other single tappable control never
stretches across the whole page. A stack of them becomes a grid (two columns
is the default fix); a lone one stays content-sized. The rare full-width
exception exists, but it is DAN'S to grant per case, never assumed —
"primary action" is not an exemption.

What this does NOT cover: things that are not single controls. The bottom
bar (five controls sharing the width), the heading band, a text input, the
progress strip — none of these is one button wearing the page's width.

# Geist AND Work Sans are banned — permanent (2026-09-07)

**Dan: *"GEIST HAS BEEN BANNED, WHY IS IT BACK AS A FONT?"*, then, an hour
later: *"we said Geist and Work sans are banned — they are banned everywhere"*.**

It was never back. It was never removed. `Geist` and `Geist_Mono` are what
`create-next-app` scaffolds into `layout.tsx`; they were in the commit that
created that file and survived every session since, because the ban lived only
in Dan's head — not in this file, not in STATUS, and not in a check. Every
session that looked at the repo saw Geist and read it as a decision.

And it was not sitting there inertly. Three lines made it the app's real face:

    @theme inline { --font-sans: var(--font-geist-sans); }   Tailwind's default
                  { --font-mono: var(--font-geist-mono); }   for the whole app
    --fluo-mono: var(--font-geist-mono), ui-monospace, ...   every small label

Tailwind v4 resolves `font-sans`/`font-mono` and its `<html>` preflight rule out
of `@theme`, so Geist Sans was what anything unstyled inherited; `--fluo-mono`
led with Geist Mono, so it drew « GOAL », « PICK ONE OF THE FIFTY », the map's
vocabulary/grammar legend and the 2D/3D switch. Measured before removal by
driving the built app: Geist rendered on **13 of 14 pages** — 28 elements on
/profil and /moi, 18 on /map.

**WORK SANS WAS BIGGER STILL** — the cahier system's functional face (body,
controls, navigation, dense headings), measured at **176 of the 194 text
elements** on SpecuLearn. Roboto carries `--font-body` and `--font-display`
now: it is the one replacement already chosen by Dan, who asked for it by name
on 2026-07-01 for anything that must be legible fast. Patrick Hand and the
FluOLinGo hand are untouched — they are his picks too.

**AND THE TWO BANS CAUGHT EACH OTHER.** The patch that removed Geist pointed
Tailwind's `--font-sans` at `var(--font-body)` — which *was* Work Sans. One
banned face was swapped straight for the other, and a check hard-coded to the
word "Geist" would have passed it. So `verify119-banned-fonts.py` holds a LIST,
and adding a name to it is the whole job of banning a font. It fails on the
import, on the `@theme` variables (directly or through a variable), on any font
stack, and on the name anywhere under `src/`.

**The lesson generalises: a ban that is not written down and not checked is not
a ban.** If Dan rules a thing out, it goes here AND into a check in the same
patch — and the check takes a list, because the next ruling will not be about
this font.

# Start here — every session (2026-08-17)

Read `docs/STATUS.md` before anything else and update it before you stop. `HANDOFF.md`, `TODO.md` and `docs/planning/*` are historical.

## Working on this repo — the setup notes

FluoLingo is a single Next.js 16 (Turbopack, App Router) app. Dependencies are
plain npm (`package-lock.json`); the update script runs `npm ci`. Node 22 is
used in CI.

- **Scripts.** `npm run dev` (http://localhost:3000); `npm run build`, which is
  `check:short && check:sios && next build` — the two guards run first, so a
  build failure may be a label or a CSV drift rather than a compile error.
  Typecheck with `npx tsc --noEmit`, which is clean and must stay clean.
- **Lint.** `npm run lint` over the whole repo reports ~130 pre-existing
  problems (mostly `react-hooks/set-state-in-effect`) across ~51 files. **CI
  lints every file a pull request TOUCHES** — not the whole repo, which would
  paint every PR red on day one. The workflow step is "Lint the files this PR
  touches", added 29 Aug. Consequence to budget for: a one-line change to an
  old file inherits that file's whole lint debt. Where the rule contradicts a
  deliberate decision (localStorage cannot be read during render; a live ref
  must be written during render or an async callback fires a stale value; a
  shuffle must happen after mount so SSR and the first client render agree), a
  targeted `eslint-disable-next-line` **with the reason written out** is the
  accepted resolution — see `SayItContent.tsx`. Fix what is genuinely a fault;
  do not restructure a working component to satisfy a rule in a PR that is
  about something else.
- **CI** is one job, `verify`: `tsc --noEmit`, `npm run build`, then every
  script in `verify/`, each named on its own `run:` line in
  `.github/workflows/verify.yml`. Add a check and you must add that line —
  `verify-wiring.py` fails the build if any script is unnamed, if the workflow
  names a deleted one, or if two share a leading number. *A check that CI never
  runs is not a check*: `verify31-wordrill` sat unrun for a fortnight because
  its number collided with another file's.
- **The auth wall.** Learning activities (pretest / practice / Flip It / games /
  mark-as-done) sit behind Google sign-in. To open them locally, build or run
  with the environment variable:

  ```
  NEXT_PUBLIC_OPEN_APP=1 npm run build
  ```

  **Do not hand-edit `REQUIRE_SIGN_IN` in `src/lib/authConfig.ts`.** It reads
  that variable, so a production build contains no bypass at all — not even a
  disabled one — and `verify38-authwall.py` fails if the flag is ever committed
  into a config file. Browsing and notes work without signing in either way.
- **`next.config.ts`** uses `output: "export"` (static export), so `next start`
  will refuse to run — serve the `out/` directory instead. `PAGES_BASE_PATH` is
  only for the GitHub Pages preview; leave it unset for normal dev and build.
- **`functions/api/*`** are Cloudflare Pages Functions (ChaTutor, TTS, Compose
  check, `/api/correct`) — server-side, not part of `next dev`, so those
  endpoints do not run locally.
- **Deploying** goes through fluoduo-main (Dan, 2026-08-31: "we go through
  fluoduo main"): the `deploy-live` workflow (workflow_dispatch) mirrors
  `main` to `dckg/fluo`, the Cloudflare Pages repo, refusing any commit
  whose `verify` check is not green. fluoduo-main fires it as the last step
  of a QC round; Dan can fire it from the Actions tab; his manual
  `git push live main` still works and stays the fallback. Agents push to
  `origin` only — the workflow's PAT (`LIVE_DEPLOY_TOKEN`) is the one
  sanctioned door to production.

# Multi-agent rules (2026-08-31)

Read **THE ROSTER** at the top of `docs/STATUS.md` before starting work —
lanes are assigned there and integration work (branch audits, renumbering,
closures, merges of others' work) belongs to the integration lane only.

## fluoduo-main is the integration lane — permanent (2026-08-31)

**Dan: *"can we, moving forward, push everything to fluoduo-main for quality
check, and letting fluoduo-main do the necessary merging?"*** Yes. So:

- **You push your own branch to `origin` and stop there.** Never merge your own
  work, and never merge anyone else's.
- **fluoduo-main reviews and merges.** Order of landing is theirs to decide —
  they are the only session that can see two in-flight branches at once.
- **When your branch is ready, hand it over explicitly**: say which files it
  touches, which shared ones, and what you know it collides with. A branch that
  is merely pushed has not been handed over.
- **Rebasing after someone else lands first is the author's job, not the
  integrator's.** They will tell you; replay your change on the new base.

WHY, IN ONE CASE. On 31 Aug this session and fluoduo-main built into each other
for an afternoon without either knowing. #97 renamed the ladder
Facile/Moyen/Difficile/Bonus and cut the Bonus TAB; this branch had, the same
hour, shortened the tab labels to English, moved Words under Forms, and been
holding the Bonus tab open pending Dan's answer — a question #97 had already
settled. Both branches merged cleanly into `main` and conflicted with each
other on five files, three of them semantically:

- `blankKeysFor` — they widened it to four levels, this branch added
  `Slot.first` so Dan's colours ★ withdraws the COLOUR and not the leftmost
  gap. **Both are needed.** A merge that keeps only the four-level rule silently
  inverts the colours ladder, and nothing in either diff looks wrong.
- the tab labels, renamed on one side and restructured on the other;
- `verify57` / `verify58`, edited by both.

Nothing here was carelessness — each side scanned for verify-number collisions
and found none. The number scan catches files; it cannot catch two sessions
editing the same *function*. That is what an integration lane is for.
**EVERY merge goes through fluoduo-main** (Dan, 2026-08-31). Open the PR, get
CI green, then leave it — including a PR of your own work. One session merging
everything is what catches a collision between two branches that are each
individually correct, which no single session can see from inside its own lane.

**Before you open a branch, look at what is already in flight on the files you
are about to touch.** This is the half the merge rule does not cover: a merge
gate catches a collision AFTER both sessions have built the same thing.

```
gh pr list --state open        # or the GitHub MCP equivalent
git diff --name-only origin/main...origin/<branch>
```

Worked example, 31 Aug — the cost of not doing it. PR #97 retired iComplete at
07:11. The pre-tests session branched to do the same job at **07:29**, eighteen
minutes later, and neither knew until both had merged or were ready to. Dan had
told both sessions, in different words, an hour apart. No merge policy prevents
that; thirty seconds of looking does.

**Claiming a verify number: THE BUILD DOES THIS NOW** (6 Sep). `verify-wiring`
fails if a number your branch ADDS is already claimed on another branch that
is ahead of `main` and was touched in the last 45 days. You still run the scan
below to pick a free number up front — it saves a round trip — but you are no
longer the last line of defence, which is the point:

```
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin); do
  git ls-tree --name-only $b verify/; done | grep -o 'verify[0-9]*' | sort -u
```

WHY IT STOPPED BEING A HUMAN JOB. Seven collisions (31, 52 twice, 60, 43, then
96 and 97 on 6 Sep), every one of them by a session that HAD run the scan. The
scan is a snapshot; someone else can claim the number in the hours between
your scan and your push, and no amount of care closes that window. So the
check runs at push time, every time. Only numbers your branch adds are tested,
so `main` can never go red for someone else's branch, and the branch that
merges first keeps the number.

**BEFORE YOU RENUMBER A SECOND TIME, DIFF THE BRANCH AGAINST `main`** (Dan,
2026-09-07). A renumber is cheap and feels like progress, which is exactly why
it is worth stopping after the first one to ask a different question.

On the night of 6–7 Sep one branch renumbered FOUR times — 110, then 111/112,
then 117/118, then 119 — each move correct when it was made and each overtaken
before CI finished, because main was landing pull requests faster than a CI run
takes. The fourth failure was the same message as the first. What none of them
said is the thing that was actually true from about the third one on: **main had
already taken the work.** The checks being fought over were merged, under other
numbers, and the branch was competing with itself.

```
git fetch origin main
git diff --stat origin/main HEAD -- src/          # is any of it still mine?
git ls-tree --name-only origin/main verify/       # is my check already there?
```

If the files come back identical, the branch is finished: close the pull
request and stop, rather than renumbering into a race you have already won.

`verify-wiring` catches the collision; it cannot tell you the collision no
longer matters. And if a renumber IS the right answer, **leave headroom** —
take a number well clear of the contested band (140 when the highest claimed is
126), because a number adjacent to the frontier will be claimed again while
your CI runs.

# Emoji → SVG replacement — proposed 9 Sep, DROPPED same day

Dan asked (9 Sep) for emojis to be replaced by SVG icons everywhere, and for
that decision to be recorded. Before any SVG existed, a stock-take of every
emoji-as-icon place turned up a mix-up: Dan thought icons like the six family
glyphs (🎯 Goals · 🏋️ Practice · 🎮 Games · 🔄 Revise · 💬 Skills · 👤 User —
Skills has since become 🤹, see below)
were already SVGs in the app; they are plain emoji characters (the OS/browser
draws them — e.g. the "abc" box next to ConjugaZone is just the 🔤 emoji,
not a picture file). No SVGs were ever supplied.

**Dan, once that was clear: "drop the SVG replacement, not doing that."**

**The "names — permanent (2026-08-31)" ruling stands, UNCHANGED, including
its emoji glyphs.** The six families keep wearing 🎯 🏋️ 🎮 🔄 💬 👤, and
every other emoji-as-icon in the app stays an emoji. Nothing in the code
changed under this proposal — it never reached step 1 of its own sequence.

The stock-take did surface one real finding, unrelated to the SVG question:
**the same emoji was reused for two unrelated things in two places**, live
at once — 💬 was both the Skills family door and the floating "report a
bug" button; 🧰 was both the LexicaLater game and the floating "Outils"
tools tray (VoixLà + ChaTutor) that appears on most exercise screens.

**Dan's fix, same day (9 Sep) — four glyphs, one rename, resolved:**

    🐞  the bug-report button (was 💬)         components/FeedbackButton.tsx
    🤹  FluOLin Skills (was 💬)                 content/activities.ts FAMILIES
    🛠️  the Outils tools tray (was 🧰)          components/tools/ToolSummon.tsx
    🔐  LexicaLocker (was 🧰, name was LexicaLater) content/activities.ts, MenuGrid.tsx

**LexicaLater is retired for good — call it LexicaLocker everywhere.** Same
key (`lexicalator`) and route (`/games/lexicalater`), display name only —
the Memo-rename precedent. Concrete example: open WorDrill (a Skills
exercise) and you now see 🐞 (report a bug) and 🛠️ (Outils — VoixLà /
ChaTutor) floating on screen together, and neither is 🤹 (Skills, the
family WorDrill lives in) or 🔐 (LexicaLocker, an unrelated game). No glyph
in the app means two different things any more.

# The ☰ menu is SEVEN families now, not six — permanent (2026-09-09)

**Same day as the 🤹/🐞/🛠️/🔐 fix above, Dan redrew the whole ☰ menu**, this
time as a 7-row grid, and this ruling SUPERSEDES "The names — permanent
(2026-08-31)" wherever the two disagree. The names, in his own words:

    🧑‍🏫 Lesson · 📝 Practice · 🔄 Revise · 🎮 Games · 💬 Oral · 🛠️ Tools · 👤 User

**SKILLS IS RETIRED**, split into two new families:
- **Oral** (💬 — the glyph taken OFF Skills a few hours earlier, when 🤹
  replaced it to clear the bug-button collision. Skills is gone now, the bug
  button is 🐞, so 💬 is free and comes back meaning a DIFFERENT, smaller
  family) — VoixLà, WorDrill, ÉcouTexte: the three that put French in your
  mouth or ear.
- **Tools** (🛠️ — same glyph ToolSummon's own floating door already wore;
  no collision, they're now the same idea) — ChaTutor, ComposeIt.

**Lesson replaces Goals** on every learner-visible surface — same registry
key (`goals`), same route (`/`), display-rename only. Its three tiles are
Map, the goal itself, and Help (which moved out of the old last row).

**"Revise", not "Review"** — Dan's own table (9 Sep, later in the same
conversation) spells it Revise, reverting an intermediate "Review" this
session tried first. **DéjàRevu is renamed ErroReview** (❌, was 🔖) the
same day — same key (`reviser`), same route (`/reviser`).

**Colour: Dan's fixed 12-swatch brand palette, "use only these shades."**
Five map cleanly onto family names: Lesson=Yellow, Practice=Blue,
Revise=Teal, Games=Violet, Tools=Orange. **Two do not, and are flagged
rather than guessed**: Oral is "Indigo", not one of the twelve — Periwinkle
(#9398ff) stands in for it, Dan's own pick when asked. User is "Grey", also
not one of the twelve — none of the twelve reads as neutral, so it keeps
the grey it already had (Dan: "keep the grey it has now"). All 12 exact
hex values are pinned in `verify96-family-hues.py`'s `EXPECT` dict; change
the palette there, never by eyeballing a screenshot.

**The ☰ menu's row backgrounds are SOLID, the family's darkest rung — not a
wash.** First try was a 15%-alpha tint (8 Sep's ruling); Dan sent it back
the same day: *"you are using the very light shade which is too light...
the darkest shade in there for the background"* — i.e. the same `--fam-ink`
CSS token the page's own top strip and left spine already use. See
`MenuGrid.tsx`'s `INK` map.

## Hub pages are being retired, one family at a time — same day

**Dan, looking at the finished grid menu: *"all those hub pages have been
made redundant by the pop ups... nearly all"*.** A hub page (a `FamilyHub`
listing every member of a family) existed because the OLD menu couldn't
list nineteen activities at once; the new one does, so the aggregating
page in between has nothing left to do.

**Retired so far, both the same way** — the route stays and forwards
(never delete a URL outright; a bookmark or an old link must still land
somewhere), to that family's `DELIBERATE_DOOR` activity:
- `/skills` → redirects to `/tts` (VoixLà)
- `/practice` → redirects to `/practice/speculearn` (SpecuLearn)

**`/games` is the one Dan hedged on** ("nearly all", not "all") — it KEEPS
its hub, unresolved. Unlike Skills and Practice, none of Games' three
members (NumBus, VocabulaRain, LexicaLocker) has a page you'd redirect to
without a picker in front of it — they're all three pop-up-gated (see
below). Do not retire `/games` without asking him first; `FAMILY_HUBS` in
`activities.ts` still lists it on purpose.

## Seven activities traded their hub-gallery for ONE pop-up — same day

**Dan: *"instead of leading to a hub page, each of these will go directly
to the relevant page (if there is only one) OR a pop-up will ask if they
wish to visit the activity for the current Goal (SIO)"*.** MémoiRecall,
GramMarathon, VocabulaRain, LexicaLocker, WorDrill, ÉcouTexte and ComposeIt
each used to open a deck/unit picker of their own — seven different
pickers, one per activity. They now all open the SAME pop-up:
`GoalSliderPicker` in `src/components/ActivityGoalPicker.tsx` — a 1-to-50
slider that opens already pointing at the learner's current stop (the same
number the ☰'s own 🎯 badge computes), lands on whichever deck that stop's
`SIOS[stop-1].collectionId` names, and has NO fallback list of decks at
all: slide or type a number, Confirm, go.

**The number is tappable to edit directly** (Dan: *"it would be good if it
could appear as a depressed space"*) — it sits in a `.neo-well` (the app's
existing "value pressed into the paper" style) with a real `<input>`
under the display digits. **Every other control in the pop-up is a
`.neo-key`** (the paired "stands out of the paper" style) — Confirm, and
the NumBus/NumBourse tiles in the second pop-up.

**NumBus gets a DIFFERENT, simpler pop-up** — Dan: *"it will just ask to
pick between NumBus or NumBourse. --> Confirm button"* — because there is
no goal involved, just two games. `TwoChoicePicker` in the same file.

**ÉCOUTEXTE IS A KNOWN GAP.** Its content is picked by unit/topic, not by a
per-SIO deck route — there is no `/practice/ecoutexte/<id>` for the
slider's answer to steer. Its pop-up still opens (Dan named it as one of
the seven) but Confirm always lands on the plain topic picker, regardless
of what stop was chosen. Documented in the file, not silently faked.

**ON DESKTOP THE POP-UP IS A CENTRED, CONTENT-SIZED CARD, not a sheet**
(Dan: *"the pop up must only occupy the middle of the page, just
sufficient space for the slider and field and OK button"*) — this is why
`ActivityGoalPicker.tsx` has its OWN small modal rather than reusing
`BottomSheet`, which pins to the bottom edge even on desktop.

**THE PICKER'S STATE LIVES IN `SiteTopBar`, NOT IN `MenuGrid`** — found by
driving the built app, twice. First bug: a picker tile calls `onNavigate`
in the same click that opens its pop-up; `onNavigate` closes the ☰
dropdown, which unmounts `MenuGrid` — and the picker's own `useState` and
its rendered modal lived inside `MenuGrid`, so both vanished in the same
tick they were created. The pop-up simply never appeared. Fix: hoist
`useActivityPicker()` to `SiteTopBar` (which does not unmount on navigate)
and pass the result down as a `picker` prop; render `picker.modal` OUTSIDE
the `{menuOpen && …}` block. Second bug, found the same way right after:
the modal rendered inline (not portalled) opened centred against the wrong
box and appeared scrolled half off the top of the screen — some ancestor
was breaking `position: fixed`'s containing block. Fixed the same way
`ToolSummon` and `BottomSheet` already avoid it: `createPortal` to
`document.body`. Neither bug was visible in a static reading of the code —
both only showed up driving the real, built app, which is why this is
written down as a warning and not just a diff.
