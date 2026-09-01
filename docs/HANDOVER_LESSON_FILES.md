# Nine stops have no lesson file — handover to Peers

**From:** Color review (concepts lane) · **31 Aug 2026**
**Why you:** creating lesson files is content-and-component work, not concept
drafting. You have already done exactly this job twice, for SIO-005 and SIO-006
in #105, and those two files are the model for the three ordinary stops below.

---

## The problem in one line

A concept lives in `src/content/lessons/native/<slug>.tsx`. **Nine stops have no
such file**, so there is physically nowhere to put one. Tier 1 and Tier 2 are
otherwise finished; Tier 3 is 7 of 15 and *all eight remaining stops are here*.

## The nine, and they are two different jobs

### A · Three ordinary stops — decks with items (your #105 job again)

| stop | can-do | deck | items |
|---|---|---|---|
| **SIO-025** | ask why and give a simple reason | `parce-que` | 6 |
| **SIO-038** | ask how someone travels somewhere | `transport` | 12 |
| **SIO-039** | express what I want and need politely | `envies-besoins` | 10 |

These are `colors.tsx` / `core-nouns.tsx` again: a Mémo built from the deck's own
items, a dice generator over them, and a bonus bank.

**SIO-038 matters out of proportion to its size** — it is the *only* Tier 1 stop
without a file, so it is the single thing standing between Tier 1 and complete.

### B · Six ateliers — decks with ZERO items

| stop | can-do | deck |
|---|---|---|
| **SIO-010** | carry a first meeting | `atelier-sio-010` |
| **SIO-020** | write a few sentences about a country | `atelier-sio-020` |
| **SIO-030** | write a short friendly message | `atelier-sio-030` |
| **SIO-040** | explain step by step how to get somewhere | `atelier-sio-040` |
| **SIO-049** | give a simple opinion about a restaurant | `atelier-sio-049` |
| **SIO-050** | get by in a simple restaurant visit | `atelier-sio-050` |

**Their decks hold no items at all.** The content is a model dialogue in
`ATELIER_DIALOGUES` (`src/content/ateliers.ts`), shaped
`{ who, fr, en, say? }`. So the Mémo is built from the dialogue's lines, and the
dice/bonus draw on those lines rather than on deck items. That is the part that
has no precedent yet — SIO-010's dialogue is ten lines and is the one to
prototype on.

---

## What a file must contain

`NativeLesson` (`src/content/lessons/native/types.ts`): `slug`, `memo`,
`dice { instruction, newQuestion, axes? }`, `bonus[]`. **Leave `concept` out —
that is mine.** I need the file and its Mémo; I write the argument on top.

## Three registration joints, and all three are asserted

A file that exists but is not wired is invisible to a learner and **looks
completely finished in a diff**. `verify68` checks all three, which is why it
was written that way:

1. `LESSON_META` — `src/content/lessons.ts` (`"colors": { slug, title, unit }`)
2. `LESSONS_BY_SIO` — same file (`"SIO-005": ["colors"]`)
3. the registry — `src/content/lessons/native/index.tsx`: the `import` **and**
   the map entry

## The rules that bite

**No invented French.** Everything comes from the deck or the dialogue. Your own
`colors.tsx` note is the precedent worth re-reading: it *refused* to teach
adjective agreement because all twelve mnemonics are masculine, so the lesson
would have had to invent the feminine forms. That refusal is the standard.

**`{" "}` after an inline close.** `<i>des</i> in front of food` renders as
`desin front of food` — the source looks right, `tsc` is happy, review is blind.
Twelve shipped this way on 31 Aug, four of them to `main`. `verify72` catches the
newline case only; **same-line fails too and only the browser sees it.**

**One screen.** Dan, 31 Aug: *"broken into side-by-side tabs that allows
everything to be visible on the same screen all at once."* The Idea tab is panes
now and 43 of 43 fit. A Mémo is not panes, but keep it short enough that the tab
does not reintroduce the scroll.

## The two scans that catch what reading cannot

Both drive the real app (`NEXT_PUBLIC_OPEN_APP=1 npm run build`, then serve
`out/`). They live in this session's scratchpad; ask and I will paste them, or
rewrite them — they are twenty lines each.

- **jam scan** — walks the DOM for a word butted against the next across an
  inline element edge. Found all twelve; the static check has never caught one
  on its own.
- **fit scan** — content height against the scroll container's `clientHeight`.
  Find the scroller by `getComputedStyle().overflowY`, **not** by
  `scrollHeight > clientHeight`: that is precisely the state a *fitting* panel
  does not have, so everything that fits falls through to `<body>` and reports a
  bogus 1.00 screens.

## Gates before handover

`tsc --noEmit` · `npm run build` · all 62 `verify/*.py` · lint the files you
touch · both scans above · a screenshot per new lesson, per the show-it rule.

## What happens next

Hand me the files and I draft a concept for each: **eight Tier 3** (closing the
tier) and **SIO-038** (closing Tier 1). Order that helps me most:

1. **SIO-038** — one stop, closes a whole tier
2. **SIO-010** — prototypes the atelier-from-dialogue shape; the other five follow it
3. SIO-025 and SIO-039 — ordinary, and they are Tier 3 phrase stops
4. the remaining five ateliers

No blockers, no decisions pending from Dan on any of it.
