# SpecuLearn — the agreed specification

Settled with Dan on 5 Sep 2026. **Nothing here is built yet** except where a
commit is named. This file is the record of the decisions, not a claim of work
done.

---

## 1 · What SpecuLearn is

> *"it is the name for everything pre-tests (old-speculearn and old-pretests)
> which will now adopt that name SpecuLearn because they learn by speculating
> wisely based on prior knowledge"* — Dan, 5 Sep

**One activity, 110 routes, one name.** Today the band says *SpecuLearn* on 10
routes and *Pretest* on 100.

| surface | routes | says today |
|---|---|---|
| `/practice/speculearn` + 9 decks | 10 | SpecuLearn |
| `/pretests/[id]` | 40 | Pretest |
| `/pretests/unit0/[sioId]` | 10 | Pretest |
| `/pretests/picture/[id]` | 50 | Pretest |

### The pedagogical split does not run where the code split runs

Four builds, but only **two question types**, each built twice:

* **A · recognise a word from a picture** — the game (10) *and*
  `/pretests/picture` (50). 60 routes, one idea, two codebases.
* **B · choose the right form in a sentence** — authored (40) *and* unit0 (10).
  The schema is explicit: *"these test GRAMMAR / USAGE, not vocab recall"*.

So the merge is four builds down to **two**, not two down to one.

### Both are already MCQ

Dan's rule — *"pre-tests should only involve MCQ, if it is not an MCQ then it
is a post-lesson activity"* — already defines membership by form, and both
types satisfy it. The two speech modes in the game (*Répète*, *Devine et dis*)
are graded by speech recognition, so by that rule they are **post-lesson** and
leave SpecuLearn.

---

## 2 · Scoring — the live contradiction

> *"we already said umpteen times that we will reward attendance, not the
> score"* — Dan, 5 Sep

**The two lanes currently do opposite things, and one of them breaks a
standing ruling.**

`runner.ts` refuses to score, by name: *"NOT `recordItemResult` (which pays XP
and steps the SRS)"*. The picture lane repeats the 27 Aug ruling in full: *"a
pretest is sat BEFORE the lesson, so its misses must not cost XP, dent accuracy
or enter the review queue."*

**The game lane does exactly that, on every first attempt.** Not by intent — it
calls `ladder.attempt()` for the help ladder, and the ladder calls
`recordItemResult` on its behalf unless `noRecord` is passed. Nobody passed it:

```
grade()        → ladder.attempt(good, { given, activity })   ← no noRecord
useHelpLadder  → if (!rec.noRecord && itemId) recordItemResult(…, { award: firstTry })
itemId         = `devine:${baseWord(it.w)}`
```

Consequences to fix:

1. The game must stop calling `recordItemResult`. Words a learner has never
   been taught are sitting in SRS review queues under the `devine:` prefix.
2. **`verify40-pretest-record.py` scans four files by name** — `PretestQuiz`,
   `pretests/[id]`, `pretests/picture`, `Unit0Pretest`. `SpecuLearnContent.tsx`
   is not among them, which is why this was never caught. Its scope must widen,
   and it will fail immediately when it does. That is correct.
3. `SpecuLearnContent.tsx`'s header asserts the opposite — *"It scores nothing
   … the code calls `recordItemResult` nowhere."* True of that file, false in
   effect. It was rewritten on 1 Sep to correct an earlier wrong claim and
   landed wrong the other way. Third time a comment about this has misled a
   session; fix the comment with the code.
4. **Attendance is rewarded by neither lane.** The game overpays (per correct
   answer), the pre-tests pay nothing at all. The attendance reward has to be
   built, not merely switched over.

---

## 3 · The card

* **Tap to answer, no Check.** Tapping an option commits it. A mis-tap costs
  nothing precisely because nothing is scored.
* **The score counter stays** — Dan's 2 Jul rule that progress counters are
  useful learner feedback. It is information, not punishment.
* **A fixed-height stage.** The stimulus area is one height whatever it holds —
  a sentence, a photo, a single word — so the option grid never moves between
  questions in a long run. The *stage* varies; the *grid* does not.
* **Distractors come from one paradigm.** If the answer is *toi*, the options
  are *tu / toi / te / t'* — not *toi / tu / nous / elle*. The question becomes
  which form, not which person.
* **Stimulus is either-or until attempted.** Audio-only with no text, or
  text-only with no audio. Both are revealed after the attempt.
  * This makes `transFirst` **derived, not authored**: show the English unless
    the card is a listening card. 54 hand-set flags replaced by one rule.
  * It only works because of the paradigm rule above — with same-paradigm
    distractors the English cannot leak.
* **French leads.** Any non-French text on a card is a *reference*; the French
  is the *target*. Generalises Dan's "English is never bigger than French".
  Equal size, with the French taking the weight and the ink — never smaller
  than the French.

---

## 4 · Structure

* **SIO pages are separate from questions.** An SIO page is its can-do
  statement plus the buttons for the activities under it. No questions on it.
* **Both levels scroll-snap.** One SIO per page; inside an activity, one
  question per page. Scroll down for the next, back up to revisit.
* **A landing page before question one** — not the first question. It carries
  the controls.
* **The header never scrolls away.** Band, counter and bar sit *outside* the
  scrolling element, not sticky at the top of it. Sticky can lift for a frame
  when a browser's address bar animates; outside the scroller it is not a
  scroll calculation at all.

### The landing page's controls, both conditional

* **How many** — offer 5 / 10 / 20 / all, drop entries at or above what
  exists, render only if three or more remain. Below that the count is stated
  in the sentence, not asked. *"if there are only 6, then don't offer a
  choice"*.
* **Direction** — shown only where the question has one: atelier lines
  (English ↔ French) and picture items (picture ↔ word). A gap-fill has no
  reverse, so the control is absent, not greyed. **Mixed is the default.**

---

## 5 · End-of-unit ateliers

Already built for five stops (SIO-020, 030, 040, 049, 050): an English line,
four French lines. **The wrong options are other lines of the same dialogue** —
never invented French. That rule stands and applies to the new direction too.

**Add the reverse direction** — French line → four English lines. This is what
makes the picker worth having:

| stop | lines | one way | both ways |
|---|---|---|---|
| SIO-020, SIO-040 | 6 | 6 — no picker | 12 |
| SIO-049, SIO-050 | 7 | 7 — no picker | 14 |
| SIO-030 | 9 | 9 — no picker | 18 |

**Open:** each line then appears twice, once as the French answer and once as
the English one. If the pair lands close together the second is free. They need
separating within a run.

---

## 6 · Look

* **Realistic ring binding and a 3D page, on ALL pages** — not only SpecuLearn.
  **Blocked**: Dan's reference photograph is not in the repo. A CSS
  approximation was rejected ("very ugly"); the photo should be tiled down the
  spine instead.
* **The right-hand flaps are gone**, at every width. They were removed from
  the phone (`display:none` below 640px) but still render at ≥640px, and they
  are what reserved the column forcing the desktop's 980px cap.
* **Lists are always two columns.**
* **Titles in FluOLinGo Hand Bold 700.** Patrick Hand has no bold — it ships as
  a single 400 weight — so the house hand carries it. Bold 700 is a new font
  file, +35 KB; only Regular 400 and SemiBold 600 are loaded today.
* **Activity names in FULL CAPS, stop names in Sentence case.** The split is
  structural: a title from `act.name` uppercases, one from `band.title` /
  `pageLabel` does not. Caps at the same size read larger than mixed case, so
  this also answers "the strip name is a little too tiny" without the band
  growing. 21px + `letter-spacing: .045em`.
* **The band on a stop reads** `SPECULEARN` with `Atelier : Présenter un pays`
  beneath. As one line it needs 295px and has 270 at 390px wide, so it clips;
  the two-line form renders the same content at full size.
* **FluOLinGo never appears on the coloured strip** — it is in the browser tab
  and the top bar. Nothing to exempt from the caps rule.
* **Home has no coloured strip at all** (`CahierShell.tsx:219`,
  `active !== "home"`), so it is already the odd one out.

---

## 7 · Desktop, landscape, type

* **The page fills the viewport.** The 980px cap and the left pin go. At 1440
  the content was 980px wide starting at x=43, leaving **417px empty**; at 1920,
  **896px** — nearly half the screen.
* **The card rearranges past an aspect ratio of 11:10** — stage left, options
  right. One breakpoint catches a landscape phone and every desktop. Stretching
  one column instead would give an 1800px line of French.
* **Type is fluid and relative, app-wide.** Not only on SpecuLearn.
  * The app's type is **936 Tailwind `text-*` uses across 162 files** against
    **105 uses of the `--fs-*` tokens**. Changing the tokens would look like an
    app-wide fix and change almost nothing. The change belongs in the Tailwind
    v4 `@theme` block, where all 936 follow from one place.
  * One shared step: `--fs-step: clamp(0rem, calc(-0.61rem + 1.2vw + 0.6vh), 0.36rem)`.
    Zero on a portrait phone, so nothing regresses; every size adds a multiple
    of it.
  * **rem floors and ceilings, never px.** A px floor overrides a learner who
    has set larger text in their accessibility settings. Consequence accepted:
    above root 20px the floor wins and portrait and landscape converge — their
    stated preference outranks our layout preference.
  * Sizes count **both axes** (`vw + vh`). A width-only clamp reads a landscape
    phone as "narrow" and hands it the minimum.

---

## 8 · Images

See `SPECULEARN_IMAGE_BRIEF.md` and `speculearn-image-brief.csv`.

The headline finding is measurable rather than aesthetic: every *aliments*
photo is **160×160, ~3 KB**, displayed at 132 CSS px — a 1.6× upscale on a 2×
phone, 2.5× on a 3×. Right subjects, too small.

**Languages: flags are out.** A flag stands for a country, not a language, and
India has 22 official ones. Replaced by the **endonym in the language's own
script** — 中文, 日本語, 한국어, 廣東話, हिन्दी, தமிழ், ภาษาไทย, العربية, Русский,
Tiếng Việt, Bahasa Indonesia, Bahasa Melayu, Deutsch, Español… — with the
French larger and leading.

Two notes on that choice:

* It fixes the Indonesian/Malay collision a greeting could not: « Selamat pagi »
  is **identical** in both languages, whereas *Bahasa Indonesia* and *Bahasa
  Melayu* are distinguishable.
* It costs difficulty on the nine Latin-script languages, where the endonym is
  a near-cognate of its French name (*Español* / l'espagnol). Ten of nineteen
  stay genuinely hard. Uneven, not broken — and nothing is scored.
* Nine writing systems render from the **device's** fonts. They were fine in
  testing here, but that is a container, not a phone. Check on a real device or
  bundle webfonts before shipping.

---

## 9 · Dropped

* **The "bring to class" narrative.** Misses go to Réviser / DéjàRevue for
  revision instead.
* **The two first-run cards.** One idea, two texts — the game says *"You have
  not been taught this yet"*, the pre-tests *"This comes BEFORE the lesson"*.
  One card.

---

## 10 · Still open

| | |
|---|---|
| **The binding photo** | Dan's reference is not in the repo; the CSS version was rejected. |
| **`orientation: "portrait"`** in `manifest.ts` | Locks an installed app to portrait, so all the landscape work is invisible to anyone who installs it. Change to `"any"` — but only once the landscape card exists, or a learner rotates into something half-built. iOS may never have honoured it; verify on a device. |
| **Indonesian vs Malay** | Solved for the endonym; the languages remain genuinely close. |
| **The 81 "OK-emoji" items** | Regenerate for visual consistency, or accept a deck that is half 3D render and half Apple emoji. This decides whether the image job is 79 or 160. |
| **The 17 already-excluded items** | Several could become playable with bespoke art rather than an emoji (*boutique*, *gomme*, *agrafeuse*). Reopening Dan's own bans is a separate decision. |
| **The game's greyed Check button** | Renders inactive on arrival and could not be driven in testing. May be correct (nothing selected) or a fault. Unresolved. |
