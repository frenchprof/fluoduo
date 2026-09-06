# The two colour systems — Dan's canonical spec (6 Sep 2026)

Dan handed this down verbatim during the UI-police rounds; it is the law every
colour decision answers to, alongside `docs/UI_POLICE.md` (items 39–50). The
older `docs/COLOR_REVIEW.md` is the 21 Aug survey — history, not the rule.

Two colour systems, and each answers a different question. That's the whole
rule.

## 1 · Family colour = WHERE it lives (the menu, the flap, the page ground)

Six pens, one per family, evenly spaced round the wheel:

| Family | Pen | Wash | Ink |
|---|---|---|---|
| 🎯 Goals | `#00dd3e` green | `#c3f5c3` | `#007a1e` |
| 🏋️ Practice | `#fcdf00` yellow | `#f2e8a5` | `#756700` |
| 🎮 Games | `#ff4eb2` pink | `#ffdaea` | `#c1007f` |
| 🔄 Revise | `#1ca6ff` blue | `#d0e9ff` | `#006baa` |
| 💬 Skills | `#b17eff` violet | `#eae0ff` | `#9200fe` |
| 👤 User | `#ff9037` orange | `#ffdec9` | `#9f5100` |

**Four roles, and they are not interchangeable:**

- **Pen** (full strength) → the 6px flap stripe, borders, rules. Never behind
  text.
- **Wash** (pale) → what you *fill* with when dark text sits on top — the
  active flap, a tile ground.
- **Ink** (dark) → the family colour when it has to *be* text.
- **Page** (palest, `#ebfceb` etc.) → the whole page ground.

The one that bites: putting the **pen** where the **wash** belongs. That was
the burger-menu bug — the active flap painted the saturated pen behind dark
ink and SpecuLearn came out at 2.30:1, unreadable. Six of eight failed.

## 2 · Band colour = WHAT it asks of you (the item buttons on a goal)

Five phases, in ladder order:

| Phase | Colour | Who wears it |
|---|---|---|
| Guess | `#6c50e9` indigo | SpecuLearn, Pre-Test |
| Lesson | `#6d7607` olive | MneMemo |
| Recognise | `#0e7397` teal | 4Mémoire, VocabulaRain, LexicaLator, ÉcouTexte |
| Produce | `#9d2602` rust | iComplete, GramMarathon, ConjugaZone, WorDrill |
| Create | `#a7016d` magenta | ComposeIt, ChaTutor |

Same four-role rule: the band colour is the **border and the icon**, its 12%
wash is the **fill**, and **the label stays page ink**. Measured — the phase
colour on its own wash comes to 3.96–4.22:1 for three of the five at 13px, so
a coloured label would fail; page ink on those washes is 7.7–8.3:1.

## The one-line version

> **Family says where you are. Band says what you're being asked to do.
> Strong colour outlines and marks; pale colour fills; text stays ink.**

A reading page (MneMemo, the guides) takes the sand paper instead of its
family ground — Dan picked that one blind on 30 Aug.

**The /moi–/profil exemption is DEAD** — it lasted one hour. Dan, same day:
"No — It is no longer an exception... moi has to follow the scheme because
it is part of the website, and there must be unity." Every page follows the
two systems.

## Applied the day it was handed down

`/moi`'s five row accents (`.fluo-h-*`) derive from the family tokens now —
ink as accent, wash as tint, mapped by what each row IS (RE-DRILLS→Revise
blue, SKILLS→Skills violet, FRILLS→User orange, ILLS→Practice yellow). The
edit was made, reverted under the exemption clause, and remade when Dan
killed the exemption — all inside one afternoon, which is why this doc
records the sequence.
