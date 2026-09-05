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

**The six families are called by these names and wear these icons, and no
others** (Dan, same day):

    🎯 Goals · 🏋️ Practice · 🎮 Games · 🔄 Revise · 💬 Skills · 👤 User

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

**Claiming a verify number:** scan EVERY remote branch, never just `main` —
an in-flight number is precisely what main cannot show you. Four collisions
have already happened (31, 52 twice, 60):

```
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin); do
  git ls-tree --name-only $b verify/; done | grep -o 'verify[0-9]*' | sort -u
```
