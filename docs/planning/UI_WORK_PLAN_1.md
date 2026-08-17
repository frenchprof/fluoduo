# The remaining work — 10 Aug 2026 (rev 3)

Effort is in **units** — one unit ≈ one focused hour, including build and
screenshot verification.

**Rev 3** — patches 19 and 19b shipped; DO FIRST is closed but for three items;
patch 19's two unfinished rows are split out as 19c.

Earlier revisions, kept for the record: rev 2 added D4 (my omission), Track A
(deferred to December, tracked separately) and Track D (in the total, blocked on
20–21), and withdrew "archive frenchprof/fluoduo" — that line assumed
`dckg/fluo` would be the single home; you chose otherwise, so `fluoduo` must
stay writable.

### The numbers

Rev 1's "127" did not survive adding the rows up — the DrillShell section's rows
summed to 23 against a header saying 20, and a 3-unit item went in after the
total was computed. **Every section header below now equals the sum of its own
rows, checked mechanically rather than by eye.**

| | units |
|---|---|
| **Shipped** — patches 17, 18, 19, 19b | **26** |
| **Near-term remaining** — everything below except the ID migration | **112** |
| **Deferred to December** — Track A, tracked separately | **8** |
| Whole programme | **146** |

The programme grew from 140 to 146 because patch 19b (7 units) did not exist
when rev 2 was written, and patch 19 shipped 2 units of unplanned work. Shipped
went 12 → 26.

Shipped = 26 of 138 in-scope units = **19%**.

Honest but misleading alone — see "What that bought" at the bottom.

---

## ✅ SHIPPED — patch 17 (7 units)

| | task | units |
|---|---|---|
| ✅ | `.cahier-option` no longer full-width; 4 containers → 2-col grids; `optionGrid.ts` threshold | 1.5 |
| ✅ | `activities.ts` registry — 19 activities, 5 families, your order | 2 |
| ✅ | `toolTabs()` derives from it; all 12 flap subtitles deleted | 0.5 |
| ✅ | Match It off navigation (KIV) | 0.25 |
| ✅ | Index: stop numbers, rows sorted by them, 9th column, wider titles | 1.5 |
| ✅ | Bug: gems no longer rank on the leaderboard | 0.25 |
| ✅ | Bug: `/moi` `Math.random()` React key | 0.25 |
| ✅ | Bug: Match It Restart unreachable on a phone | 0.25 |
| ✅ | Bug: pretest copy ×2 (`word → flag` on a food deck, `26quick`) | 0.5 |

---

## ✅ SHIPPED — patch 18, the PII leak (5 units)

Not the nav work — that moved to 19. Patch 18 became the privacy fix your
reviewer asked for, and it was larger than either of us thought.

| | task | units |
|---|---|---|
| ✅ | Found it: 13 addresses in chunks loaded by **8 learner-facing pages**, incl. the home page, since 25 July | 1.5 |
| ✅ | PII split to `rosterPrivate.ts` — teacher-only import | 1 |
| ✅ | `ALIAS_PUBLISH_NAMES` re-keyed email → uid | 0.75 |
| ✅ | CSV labels from the authenticated roster lookup | 0.75 |
| ✅ | `verify18.py` — walks each page's real chunk graph, exits non-zero, CI-ready | 1 |

**Still open from this:** `/teacher` is a static page on a public CDN and its own
chunk still carries `rosterPrivate.ts`. Real fix = a Pages Function or a gated
deploy. **3 units, listed below.**

---

## 🥇 DO FIRST — mostly closed (3.5 units left)

Production was at patch 14, not 12 — my earlier claim was wrong. It now runs
**1–15, 17, 18, 19**.

| | task | units |
|---|---|---|
| ✅ | Remote topology — `live → dckg/fluo` was configured correctly all along; my doubt about it was also wrong | 0 |
| ✅ | Patch 15 applied (`ActivityHub.tsx` was genuinely absent) | 0 |
| ✅ | 17 + 18 applied, built, `verify18` green, pushed to both remotes | 0 |
| ✅ | **PII leak closed and confirmed on production** — 13 addresses on 8 learner pages → 0, checked by curling the deployed chunks | 0 |
| ✅ | SpecuLearn `public/devine/` — present, closed | 0 |
| 🔴 | **Rotate the Firestore service-account key** — full DB access, in `~/Downloads` since 8 Aug. Largest remaining risk on the project. | 0.25 |
| 🟠 | **Stop serving `/teacher` as a public static asset.** Its chunk still carries `rosterPrivate.ts`; the sign-in gate is JS that runs after the browser has the file. Needs a Pages Function or a gated deploy. | 3 |
| 🟡 | **Check `add-claude-github-actions` for workflow conflicts** before merging — if it adds its own `.github/workflows/*.yml` it races `verify.yml`. Keep one. | 0.25 |

---

## ✅ SHIPPED — patch 19, the shell (7 units)

| | task | units |
|---|---|---|
| ✅ | Bottom bar, 4 slots: Index · ReVue · Skills · SvPlay | 1.5 |
| ✅ | Icons only on phone; label on press-and-hold | 1 |
| ✅ | FluOlinGo = the only Home link (Accueil dropped) | 0.25 |
| ✅ | Réglages under FluOlin User + `Toujours afficher les mots` | 1.5 |
| ✅ | Rail breakpoint 1100 → 900; icons-only rail 640–900 | 0.75 |
| ✅ | *Unplanned:* EtuDice + iComplete flaps, gated on real capability | 0.75 |
| ✅ | *Unplanned:* `deckActivityTabs()` reads `activities.ts` — one name per activity | 0.5 |
| ✅ | *Unplanned:* `verify/` checked in, `verify.yml` on every push and PR | 0.75 |

Two defects `verify19` passed over, caught by screenshots: the icons-only rail
matched nothing (patch 17 had removed the class it keyed on), and the two
draggable floats sat on the first and last nav slots. Both fixed. **The script
proves structure, screenshots prove appearance.**

## ✅ SHIPPED — patch 19b, the visual pass (7 units)

Patch 13 imported the Cahier system and nothing adopted it: the tier scale, the
type scale, the spacing scale and the radius scale had **zero** uses while 615
raw hexes and 906 stock Tailwind classes did the painting.

| | task | units |
|---|---|---|
| ✅ | The 3 core Cahier tokens finally take their design-system values | 2 |
| ✅ | `--fluo-*` aliased onto them — 1074 sites re-skinned, 0 components touched | 1.5 |
| ✅ | Type scale wired into the heading classes | 1 |
| ✅ | Foolscap surface — horizontals only, no vertical margin line | 0.75 |
| ✅ | `HUES[i % HUES.length]` retired at all 4 sites; `tierFor()` drives accuracy colour | 1.25 |
| ✅ | `verify19b.py` — 8 hard assertions + a **ratchet** on the hex/palette counts | 0.5 |

## 🔜 PATCH 19c — what patch 19 did not finish (1.25 units)

| | task | units |
|---|---|---|
| ☐ | HELP panel derives from the registry, grouped by family, 4 columns, no truncation | 1 |
| ☐ | Delete the `crumb` prop (declared, passed by every page, never rendered) | 0.25 |

## 🔜 PATCH 20–21 — DrillShell (23 units) ← the big one

| | task | units |
|---|---|---|
| ☐ | Build `DrillShell` — ✕ / progress / hearts, one item, feedback tray that overlays | 3 |
| ☐ | Delete `UnitActivityPage` from the 4 `/practice/*` drill routes | 1.5 |
| ☐ | Strip `SioModal` drag-resize, auto-widen, ⤢ (~120 lines) | 1 |
| ☐ | Migrate 4Mémoire (+ split the table out to `/decks/:id`) | 2.5 |
| ☐ | Migrate WorDrill | 1.5 |
| ☐ | Migrate SpecuLearn (+ delete its config wizard) | 2 |
| ☐ | Migrate GramMarathon | 1.5 |
| ☐ | Migrate iComplete (+ add the help ladder it never had) | 1.5 |
| ☐ | Migrate EtuDice | 1.5 |
| ☐ | Migrate ÉcouTexte | 1.5 |
| ☐ | Migrate ConjugaZone (table becomes the reward screen) | 2 |
| ☐ | Word-bank tiles instead of typing, below `sm` | 2 |
| ☐ | Select-then-commit everywhere (today: 6 drills, 4 grammars) | 1 |
| ☐ | Hide every keyboard legend below `sm` | 0.5 |

## ✅ SHIPPED — patch 22, the lesson pager (10 units)

| | task | units |
|---|---|---|
| ✅ | `buildCards()` — memo splitting rules, 3 rule cards max | 3 |
| ✅ | The 12-card ramp: MCQ → gap → build → translate | 2.5 |
| ✅ | EtuDice becomes the roll that sets where you start on the ramp | 1 |
| ✅ | Delete both difficulty pickers, all 3 `🎲 Nouvelle question` (5 buttons, 3 components), the chip row, the ConjugaZone slab | 1 |
| ✅ | End card + XP/accuracy/time + the SIO write — `saveProgress` now announces, so the path reacts | 2 |
| ✅ | Route both pretest engines through the same runner (`lib/pretests/runner.ts`) | 0.5 |

`verify22.py` (27 assertions, in CI) holds all six rows. Also retired with the
popup path: `UnitActivityPage`, `NativeLessonView`, `LessonFlow`,
`DicedPractice`, `DiceTrainer`, and the `forceOpen`/`initialView`/`lessonSlug`
plumbing through UnitSection / Unit0Panel / SioModal.

## 🔜 PATCH 23 — games (14 units)

| | task | units |
|---|---|---|
| ☐ | `GameFrame` + GameBar v2 (✕ · progress · hearts · score · ⋯) | 2.5 |
| ☐ | `height:100dvh; overflow:hidden`; boards size to the device | 2 |
| ☐ | Delete 6 per-game headers, duplicate titles, instruction paragraphs | 2 |
| ☐ | **Game-over post-mortem** — which item, what you did instead, where it goes | 3 |
| ☐ | Misses feed the ReVue queue; `CORRIGER MAINTENANT` is the primary button | 1 |
| ☐ | `CreditsSplash` once per browser, not once per launch | 0.5 |
| ☐ | Desktop two-pane: live record beside the board | 1.5 |
| ☐ | Galleries → one `▶ Jouer` card + bottom sheet | 1.5 |

## 🔜 PATCH 24 — the Index redesign (8 units)

| | task | units |
|---|---|---|
| ☐ | Activity chip rail + unit segmented + 10 rows; state in the URL | 3 |
| ☐ | Matrix cell = how you did, not whether the link works | 2 |
| ☐ | Delete the 4 activity hub pages → redirects | 1 |
| ☐ | `?gaps=1` — your authoring backlog view | 1 |
| ☐ | Lesson / 4Mémoire / WorDrill become per-row buttons, not columns | 1 |

## 🔜 PATCH 25 — Home / the path (9 units)

| | task | units |
|---|---|---|
| ☐ | One unit per screen, swipeable pager | 2.5 |
| ☐ | `short` labels in `sios.json` + a build check that fails on overflow | 2 |
| ☐ | Class flag; road paved to this week, unpaved beyond; delete the fog | 1.5 |
| ☐ | Kill the 5.5-second byline animation | 0.25 |
| ☐ | Hero 278px → 88px + hairline progress | 1 |
| ☐ | `/unit/N` becomes a deep link into the pager (deletes a page) | 1.25 |
| ☐ | Print stylesheet — 50 stops on one A4, QR per unit | 0.5 |

## 🔜 PATCH 26 — /moi + teacher (12 units)

| | task | units |
|---|---|---|
| ☐ | Hardest items → outcome rows, items nested, colour = meaning | 3 |
| ☐ | Syllabus heat-strip component (serves 4 pages) | 2 |
| ☐ | Stat strip hero; 6 tabs → 4 segments; cap every list at 5 | 1.5 |
| ☐ | Teacher "Class now" board — 16 tiles, worst-first, 30s repoll | 2.5 |
| ☐ | Teacher outcome × student matrix (**does not exist today**) | 2 |
| ☐ | Fetch all 16 students once with a pool; delete the `Compute` button | 1 |

---

## 🐞 LOOSE BUGS & OPS (5.25 units)

| | task | units |
|---|---|---|
| ☐ | `/decks/[id]` demands sign-in for a page that is only a redirect | 1 |
| ☐ | `/decks/view` renders the bare string `No deck specified.` | 0.5 |
| ☐ | `DeckContent.tsx` is on `slate-*`, not the cahier tokens | 1.5 |
| ☐ | Delete `/sio/[id]` or fix it (its pre-test says "Planned" when one exists) | 1.5 |
| ☐ | `docs/DEPLOY.md` names the Pages project `fluoguo`; dashboard says `fluolingo-dot-com` | 0.25 |
| ☐ | Delete the `import-fluoduo` branch on `dckg/fluo` — identical to `main`, migration leftover. (Do **not** archive `frenchprof/fluoduo`; it is your live working repo.) | 0.25 |
| ☐ | Decide whether `LAF1201` stays in the `<meta description>` | 0.25 |

## 🧹 PRE-EXISTING AUDIT BACKLOG (10 units, incl. D4)

Carried from the ledger. None of it is UI; all of it is why the data misleads.

| | task | units |
|---|---|---|
| ✅ | 7 independent grading implementations → 1 — `lib/practice/cloze.ts` is THE grader (curly-apostrophe fold, tiers, `gradeAgainst` alternates, accent-strict option); flip-it `judgePart` delegates, Complete It / Say It / Finale / SpecuLearn clones deleted, `verify-grading.py` executes the divergence table in CI | 2 |
| ☐ | 4 definitions of "weak" → 1 | 1 |
| ☐ | `sort(() => Math.random() - 0.5)` — a biased shuffle, ~20 sites | 1 |
| ☐ | D6: `users/{uid}/sessions` — 2 readers, 0 writers, every `activityId` null | 1.5 |
| ☐ | D7: `attempts` read, never written | 0.5 |
| ☐ | D9/D10: `retried`/`mastered` statuses and evidence fields, written or read but not both | 1 |
| ☐ | D11: `Progress.timeZone` stripped by `mergeProgress` on every sign-in | 0.5 |
| ☐ | Leaderboard identity mismatch | 0.5 |
| ☐ | **D4 — two learners' progress docs not syncing.** My omission from rev 1. Needs live traffic to reproduce and the 10 Aug observation window had closed, so realistically week 1. | 2 |

---

## ➕ ADDED IN REV 2 — Track D (16 units, IN the total)

Genuinely out of scope for a document built from a UI audit. I should have said
so instead of leaving you to notice.

### Track D — AI behaviour spec · **blocked on patches 20–21**

Nothing in this plan defines what counts as evidence a learner is stuck, how
post-reveal evidence is tagged, or when spaced retrieval fires. PRD §8 exists;
the system spec does not. The ladder needs the drill shell to live inside, so
implementation cannot start before patch 20–21.

| | task | units |
|---|---|---|
| ☐ | Help-ladder state machine: states, transitions, what "stuck" is | 2 |
| ☐ | Reveal rules by task context; evidence tagging after assistance | 1.5 |
| ☐ | Spaced-retrieval scheduling hooks into DéjàRevu's queue | 1.5 |
| ☐ | Structured output schemas + logging for the research programme | 1 |
| ☐ | Adversarial + pedagogical evaluation cases | 1 |
| ☐ | **Implement** the ladder across the drill shell | 6 |
| ☐ | **Implement** open-production feedback modes | 3 |

---

## What that bought

Units are a poor measure of what a learner notices. Against your four
complaints:

| your complaint | covered |
|---|---|
| "a button that occupies the entire width…" | **~90%** — root cause fixed; the lesson's own options still need the pager |
| "words and words and words" | **~45%** — every flap subtitle gone, deck flaps too; the drills, games and lesson still carry theirs |
| "items just keep flowing on and on" | **~5%** — Index rows are ordered, nothing is paged yet. This is patches 20–26. |
| "less clicking, keep the organisation" | **~60%** — one registry, five families, a 4-slot bar, tablets have navigation again, numbers that match the path |

---

## Next

**Patch 20–21, the DrillShell — 23 units.** The single change that makes the app
feel like one product: one shell for eight drills, two pretest engines and
DéjàRevu, replacing the popup-over-the-unit-map that spends 36–44% of a phone
before the first question. Everything downstream of it gets cheaper, and the
hex/palette ratchet falls as each drill is rebuilt on tokens.

Before that, three small things: rotate the key, check the actions branch, and
patch 19c.

---

# DEFERRED — December, tracked separately, NOT in the 119

## Track A — canonical `FD-` outcome IDs (8 units)

`curriculum.ts` (patch 12) gave you one resolver keyed on `SIO-0NN`, which
solved the actual problem: 84 items that could never carry an outcome. Renaming
the ID scheme touches every content file, every stored response and every
teacher query, and buys nothing this semester. Do it with the 2027 syllabus.

| | task | units |
|---|---|---|
| ☐ | `FD-` ID convention + `SIO-0NN → FD-` mapping table | 2 |
| ☐ | Read-time alias so stored responses keep resolving (append-only: no backfill) | 3 |
| ☐ | Migrate content files, teacher queries, `/moi`, the road map | 3 |

Dependency worth recording now: because `users/{uid}/responses` is append-only,
this can never be a backfill. Whatever `FD-` becomes, the `SIO-0NN` alias has to
survive read-time forever. Design it as an alias layer or it becomes unshippable
later.
