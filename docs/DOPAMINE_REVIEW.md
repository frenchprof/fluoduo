# Making it a place learners come back to (21 Aug 2026)

Companion to `docs/COLOR_REVIEW.md`. That document asked whether the colour is
right. This one asks the question behind it: **what would actually make a
learner open FluOlinGo tomorrow?**

Short answer: colour is maybe a fifth of it. The reward *economy* underneath is
already well built — better than most course platforms. What is missing is
almost everything between the economy and the learner: the moment of payout,
the sense of a day being finished, and any way at all to get back in.

---

## What is already right — do not rebuild this

The economy in `src/lib/economy.ts` is a genuinely good piece of design, and it
solved a real problem (Dan, 6 Jul: *"there is no link between gems, fire, XP,
leaderboard, badges, tokens, levels"*). It now runs as one flow:

```
action → XP × fire multiplier → level & leaderboard
       → milestones → badges → gems → cosmetics
```

Two quantities, not six. XP is lifetime and never spent; gems are spendable and
buy only cosmetics, because **nothing is locked** is a hard rule in
`progress.ts`. A wrong answer still earns 20 XP — effort is never punished. The
streak is a live multiplier (×1 → ×1.5 → ×2), so showing up compounds. Twelve
badges, ten French rank names, a term-scoped leaderboard.

There is also a working celebration pipeline: `progress.ts` dispatches
`fluolingo:reward`, and `RewardToast` — mounted once in the root layout —
answers it with a banner, a fanfare and site-wide confetti, from anywhere in the
app.

The machinery is there. It is barely wired to anything.

---

## The gaps, in the order they cost you learners

### 1 · There is no way to come back *(the structural one)*

No PWA manifest. No service worker. No notification of any kind. No email, no
reminder, no scheduled anything. Searched across `src/` and `functions/` —
zero hits for `Notification`, `serviceWorker`, `showNotification`,
`requestPermission`, `web-push`.

A student on a phone has no icon to tap. Returning means remembering the URL and
typing it, on a device built around icons. **Every other item on this list is an
optimisation of a loop that currently has no entrance.**

The minimum viable fix is small and does not require push:

- **`app/manifest.ts`** with name, icons, `display: "standalone"`, theme colour.
  Next.js generates it from a single file. The site becomes installable, and it
  gets a home-screen icon — which is, on mobile, the entire retention funnel.
- **An install prompt** shown once, after a learner's third session — never on
  first visit, when they have no reason to say yes.
- Only then consider Web Push (needs a service worker and a Cloudflare Worker to
  send). One notification per day maximum, at a learner-chosen hour, opt-in.

### 2 · There is no "today"

There is no daily goal anywhere in the codebase — no target, no "you're done for
today", no sense of a day having a shape. `bumpStreakToday()` flips a boolean
the first time you do anything and that is the whole of it.

This matters more than any single visual change. **A completion moment is the
strongest reliable dopamine event a learning app has**, and FluOlinGo currently
has none. There is nothing to finish, so there is nothing to feel finished
about, so there is no natural stopping point that leaves a learner satisfied
rather than merely interrupted.

Proposal — a **Objectif du jour**: one small, achievable target (say 3 correct
answers, or one SIO touched), chosen to be reachable in about four minutes.
- A ring on the Home hero fills as it fills.
- Hitting it fires a real celebration — the existing `fluolingo:reward` channel
  already does confetti and fanfare, so this is one new event type.
- After it is hit, the ring says *"Objectif atteint — continue si tu veux"*.
  Never a wall, never a nag. Extra work still earns.

**Round 12 reached the same conclusion independently.** The 21 Aug hero
decluttering kept the streak, of five marks, specifically because *"a bonus the
learner can't see is a bonus that doesn't motivate"* — the reasoning in §4
below. The multiplier is now one of only two things on the hero, which makes
colouring it cheaper and more pointed than when this was written.

### 3 · The streak is never celebrated and never defended

The streak is the strongest hook already in the data, and it is treated as a
side-effect. `bumpStreakToday` increments silently. No reward event fires. There
is no warning when it is about to break, no repair, no freeze. On Home it
renders as a number in body-text ink.

Worse, the **multiplier upgrade is invisible**. Crossing from day 2 to day 3
changes every future action from ×1 to ×1.5 — objectively the biggest single
improvement a learner can earn — and nothing whatsoever happens on screen.

- Fire `fluolingo:reward` on a streak advance, and fire a **bigger** one at
  3 and 7 when the multiplier steps up: *"×1.5 — everything you do now earns
  half again."*
- Give the streak its own colour (`--dopa-streak` from the colour review) and an
  animated flame at the multiplier tiers.
- Add **one streak freeze per fortnight**, granted automatically, spent
  silently. Not a purchase — a safety net. A student with an exam week should
  not lose a 20-day streak, and the anxiety of nearly losing one is not a
  mechanic that belongs in a graded university course (see *Ethics* below).

### 4 · XP is earned invisibly

`XP_CORRECT = 60`, multiplied by the streak, awarded on every right answer — and
never shown at the moment it is awarded. Searched: there is no floating "+XP"
anywhere in the app. `MarkDoneButton` *promises* XP in a tooltip; nothing ever
pays it out on screen.

So the multiplier — the entire reason a streak is worth having — is never seen
doing its job.

- A **floating `+60` that rises and fades** at the answer point, and when the
  multiplier is live, `+40 ×1.5 = +60` so the streak visibly pays.
- The Home XP mark ticks up rather than cutting to the new value.
- These two changes alone convert a silent number into a felt reward, and
  neither touches the economy.

### 5 · Only two of eight reward-worthy moments celebrate

`fluolingo:reward` fires on exactly two things: a level-up and a new badge. Not
on any of these, all of which are already tracked:

| Moment | Tracked today | Celebrated |
|---|---|---|
| Level-up | yes | ✅ |
| Badge earned | yes | ✅ |
| Streak advanced | yes | ✗ |
| Multiplier tier reached (3, 7 days) | yes | ✗ |
| SIO completed | yes | ✗ |
| Word reaches mastery (SRS > 0) | yes | ✗ |
| Unit finished (10 SIOs) | derivable | ✗ |
| Perfect run / personal best | derivable | ✗ |

Six new event types on a channel that already exists, already has confetti and
already has a fanfare. This is the highest reward-per-line-of-code item on the
list. **Vary the celebration size** — a mastery gets a small chime, a finished
unit gets the full fanfare. If everything is confetti, nothing is.

### 6 · Every reward is perfectly predictable

60 for a right answer, 20 for a wrong one, always. No surprise, no bonus, no
variance anywhere in the economy.

This is the most robust finding in the whole reward literature and the one the
current design most completely ignores: **an unpredictable reward drives
returning behaviour far more strongly than a larger predictable one.** A fixed
rate stops being noticed within a session.

Ways to add variance without touching fairness — the *floor* never drops, so
nobody is ever worse off:

- **A daily first-answer bonus** of a random 2–5× on the first correct answer of
  the day. Cheap, and it makes opening the app the rewarding act.
- **Occasional "mot en or"** — roughly one card in thirty is gilded and pays
  triple. Purely cosmetic randomness on top of normal practice.
- **A weekly chest** for hitting the daily goal 5 days out of 7, paying a
  random gem amount.

### 7 · Gems have almost nothing to buy

Five home-accent colours, 20–50 gems each. Total sink: 150 gems. A learner who
earns badges normally exhausts the shop and the currency stops meaning anything
— and note that the default accent `#e0384e` is not even in the current colour
system.

Widen the locker, staying inside the cosmetics-only rule:
- **Notebook covers** — the Cahier is the identity; let people own theirs.
- **Index-tab colour sets** (the six pastels are already tokens).
- **Rank-badge frames**, a **map avatar**, a **desk surface** (wood, felt, lino).
- One **rotating weekly item** that leaves. A shop that changes is a reason to
  look.

### 8 · Sessions end without a receipt

Games and lesson runs have end screens — `GameOver` gives a post-mortem with
misses and a "corriger maintenant" route, and `LessonPager` ends with
XP/accuracy/time. Good. But most drill surfaces just… stop.

Every session should end with the same small receipt: **XP earned, streak state,
what you got better at, one thing to fix.** It is the moment a learner decides
whether that was worth it, and right now most of the app declines to answer.

### 9 · The leaderboard is decided by week three

Rows are correctly scoped to the current cohort (`isCurrentTerm`, the 11 Aug
reset — the legacy-XP problem is already solved). But within a term it is
cumulative and never resets, so by mid-semester the order is frozen and only the
top few have anything left to play for.

- Add a **weekly board** alongside the all-term one. Everyone starts Monday at
  zero, so everyone is in a live race.
- Show **"you and the two around you"** rather than the top 50 — position
  relative to a neighbour motivates; position 34 of 50 does not.
- Keep it name + XP, as now.

### 10 · The colour, which is where this started

Covered in full in `COLOR_REVIEW.md`. The short version: the reward cues are the
one part of the site with no colour on them, and a seven-role palette is
proposed and contrast-checked. Colour amplifies a reward moment — it cannot
create one. Do items 1–5 first; colour makes them land harder.

---

## Ethics — the line this project should not cross

FluOlinGo is a graded university course with identifiable students and recorded
learning analytics. That makes some standard engagement mechanics inappropriate
here regardless of how well they work:

- **No loss-framed pressure.** No "your streak dies in 2 hours", no guilt
  mascot, no red-badge nagging. A student anxious about a streak during exam
  week is a design failure, not engagement.
- **No pay-to-progress, ever.** Already the rule (`nothing is locked`) — keep it.
- **No public shaming.** The leaderboard shows position, never decline.
- **Never punish absence.** Coming back after two weeks should feel like a
  welcome, not a penalty screen.

The existing codebase already leans this way — wrong answers still earn XP,
nothing is gated, the streak "never blocks". The recommendations above are
deliberately all *upside*: things that make showing up better, never things that
make not showing up worse. That is also the more durable design; guilt-driven
retention burns out, and in a compulsory course it converts into resentment of
the subject.

---

## What to do, in order

| # | Change | Effort | Why it is here |
|---|---|---|---|
| 1 | **`app/manifest.ts` + icons** — make it installable | 0.5 d | There is currently no way back in |
| 2 | **Objectif du jour** — one daily target, a ring on Home, a real celebration when hit | 1.5 d | Creates the completion moment the app has never had |
| 3 | **Six new `fluolingo:reward` events** + varied celebration sizes | 1 d | The pipeline already exists; it fires on two of eight moments |
| 4 | **Floating +XP, and the multiplier shown paying out** | 1 d | Makes the streak's value visible for the first time |
| 5 | **Streak: celebrate advances, colour it, one free freeze per fortnight** | 1 d | The strongest hook in the data, currently silent |
| 6 | **Colour the reward cues.** Round 12 cut the hero to two marks, so this is now course → `--dopa-win` and streak → `--dopa-streak` (it borrows `--fluo-danger`, the error token, today). Level and XP take their roles on /moi and /profil. | 0.25 d | Amplifies everything above — and a smaller diff than when this was written |
| 7 | **Variable reward** — daily first-answer bonus, gilded cards | 1 d | The one mechanic with no representation at all |
| 8 | **Session receipt on every surface** | 1 d | Answers "was that worth it" |
| 9 | **Weekly leaderboard + neighbours view** | 1 d | Re-opens a race that closes by week three |
| 10 | **Widen the gem locker + a rotating weekly item** | 1.5 d | The currency currently runs out of meaning |

Items 1–5 are the ones that change behaviour; roughly a week. Everything after
that compounds them.

**Status, 21 Aug.** The ethics constraints below were adopted as binding.
Approved and not yet built: the manifest (1), reward-event wiring (3),
floating +XP (4), session receipts (8), the weekly leaderboard (9). Item 6's
palette is applied as tokens; the two hero swaps are not. Items 2, 5, 7 and 10
still need the pedagogical calls named below.

**Nothing in this list is built yet.** These are proposals, and several — the daily goal,
variable reward, notifications — are pedagogical decisions about a real course
with real students, not just design choices. They need Dan's call before any of
them becomes code.
