# Class bag — locked microcopy (SpecuLearn → Bring-to-class)

3 Sep 2026. The words on the post-SpecuLearn screen. Companion to
`docs/STATUS.md` (path + AuthGate behaviour), `docs/HANDOFF_SPECULEARN_PRETESTS.md`
(what SpecuLearn remembers), `docs/PRETEST_BLUEPRINT.md` (the gap report),
`AGENTS.md` (litmus, collapse, English-never-larger-than-French). This file
locks the copy. It does not implement the screen.

The strings below are locked. Do not invent alternate CTAs.

---

## Purpose

Class bag is the post-SpecuLearn screen that turns misses into a class
artifact for the NUS LAF1201 atelier. It is not a score dump.

The pretest effect is already spent when this screen opens. What remains is
the list the learner walks into class with — the same job
`docs/ARCHITECTURE.md` called "📝 Bring to class".

---

## When it appears

- After SpecuLearn finishes, **or**
- The learner taps **Skip pretest** → Class bag → then the next stop.

**Continue** unlocks after SpecuLearn is finished (or Skip pretest). Until
then the bag is not the next door.

---

## Microcopy

The audience is absolute beginners who do not know French yet. Chrome and
CTAs stay English only — no FR UI labels an A1 beginner cannot decode.
French is the *target* on miss chips, never the lead on the can-do.
English may match the French in size; it may never be larger (`AGENTS.md`).

### Screen title

**Class bag**

Alt atelier voice: **For class**

### Can-do restatement

EN first — the safety net. One line, the stop’s can-do in English, no gloss:

**You can: {canDoEn}**

Optional FR line under it, same size or smaller, italics. Never FR-lead,
even if the SIO string is already French.

### Miss chips

Each chip is the French they missed (target size). Optional EN gloss under,
never larger, italics non-bold.

No “Miss:” prefix — the bag is the context.

If the item is a full sentence, the chip shows the French sentence; don’t
truncate mid-word.

Count only when folded: **{n} to check** on a closed `<details>` — not when
the chips are on screen. (A count earns its place when it describes what you
cannot see.)

### Show-teacher CTA

- Primary: **Show in class**
- Secondary (optional): **Copy list**

### Empty / no misses

Title still **Class bag**

Body: **Nothing to check — you’re ready.**

CTA: **Continue** (same Continue as Home)

### Soft-auth (save unsigned)

**Sign in to keep this bag**

Button: **Continue with Google**

Escape: **Keep going without saving**

---

## Design notes

Designed for absolute beginners who don’t know French yet. Title, CTAs and
soft-auth stay EN: **Class bag**, **Show in class**, **Copy list**, **Continue**,
**Sign in to keep this bag**, **Continue with Google**, **Keep going without
saving**. Do not invent FR chrome labels.

No “Good job!” / “Here’s what you got wrong” — the litmus test kills praise
and labels. Dopamine is the highlighter on the bag pack / Continue, not extra
words.

Soft-auth must not interrupt mid-card. Gate on save / **Show in class**, not
on the SpecuLearn run itself. That is a different job from `AuthGate`
(`src/components/AuthGate.tsx`), which still walls learning activities when
`REQUIRE_SIGN_IN` is on. Class bag’s soft-auth is the unsigned-save prompt
only: keep the bag, or walk on.

Use native `<details>`/`<summary>` for the miss list when it would push the
page past one screen. A closed fold says **{n} to check**. An open list of
chips does not repeat the number.

---

## Related flows

```
Goals → Stop sheet → SpecuLearn → Class bag
```

Then the next stop, via the same **Continue** Home already uses.

Context only — this file does not rewrite either:

- Path, roster, and what SpecuLearn already does: `docs/STATUS.md`
- Hard auth wall on learning activities: `src/components/AuthGate.tsx`
  (`Continue with Google` is the shared button string; Class bag’s
  **Sign in to keep this bag** / **Keep going without saving** is the
  unsigned-save gate, not the activity wall)
