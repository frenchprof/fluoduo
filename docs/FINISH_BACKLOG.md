# FluOLinGo finish backlog

3 Sep 2026. Single source of truth for what is locked, what is in flight, and
what “done” means. Design / UX / UI / FR / pedagogy decisions from the
FluOLinGo Grok Bot room plus Dan’s finalize list. Claude implements on GitHub
PRs; the room QAs and locks. This file does not implement anything.

Companion specs (do not reopen them here): `docs/CLASS_BAG.md` (merged #152),
`docs/french-content-review.md` (#154), `docs/HANDOFF_SPECULEARN_PRETESTS.md`,
`docs/DEPLOY.md`, `AGENTS.md`.

---

## 0. How to use this doc

- Claude implements on GitHub PRs; Grok Bot room QAs and locks decisions.
- Merge order for open PRs: **#153 → #155 → #156**, then docs **#154**.
  (#152 Class bag spec already merged 3 Sep.)
- Items **1–9** (including **9b** politesse) = teachable / finishable now; **10–18** = harden later.
- Standing rule: absolute beginners who don’t know French — **EN chrome;
  FR = learning target only**.
- Each row’s **Success (done when)** is the only close-out. A merged PR that
  misses that test is not done.
- Owner lane is who drives the next beat, not who “owns” the product:
  Coordinator · UX · UI · FR · Pedagogy · Claude(impl).

---

## 1. Standing decisions (locked — do not reopen without Dan)

| Lock | Decision |
|---|---|
| **Beginner / EN chrome / FR-as-target** | Absolute beginners. Chrome, CTAs, ranks-the-learner-must-act-on, and WHY language stay English. French is the target on the card / chip / tile — never a door a beginner must decode to act. |
| **GitHub shared surface** | Shared work surface with Claude is GitHub (PRs, this doc, `docs/STATUS.md`). Grok Bot room QAs and locks; it does not replace the PR. |
| **Colour LexicaLater** | Colour decks are **semantic forever**: the chest **is** the taught hue. Positional L2+ (left-to-right / first-slot) is for **non-colour** decks only. **No hearts site-wide** — including LexicaLater. |
| **VocabulaRain puddles** | Sort key on puddles is **English**. Optional small FR under a puddle **only after first meet**. A brand-new category is **EN-only** until met. Tiles themselves stay **French** (the target). |
| **MémoiRecall flip cue** | Variant B locked: quiet **↻ ink-lip chip** on the **front face only**. Card is the only control. No “Flip” / “Retourner” chrome. Lands in #155. |
| **Class bag microcopy** | Locked in `docs/CLASS_BAG.md` (#152 merged). EN-first can-do (`You can: {canDoEn}`); FR miss chips; **Show in class**; soft-auth strings (**Sign in to keep this bag** · **Continue with Google** · **Keep going without saving**). Spec only — product is item 2. |
| **SpecuLearn Enchantée** | Role cue **before** the guess (`Léa · she` / `Marc · he`). Gender-conditioned keys. EN WHY on the wrong form. Reveal uses `.cahier-hl` + `--gram-*`. MémoiRecall reinforces after, it does not teach first. Lands in #156. |
| **SUP-CAL** | Calendar supplements sit under **item 10 Optional**, **off the Continue spine**. UX / UI / FR / Pedagogy agree: **Optional chip**, **soft family wash**, never on Continue. Core SIOs **001–050** stay intact. A unit can complete without opening a calendar. **SUP-CAL-03** *né / née* uses the SIO-010 role cue (`Léa · she` / `Marc · he`) — same gender pattern as Enchantée. |
| **Politesse → SIO-009** | **FR + Pedagogy joint agreed.** Politesse **folds into SIO-009** (fixed chunks + *désolé(e)* role-cue like 010). **No new map node / no extra Continue gate.** Sequence **002 → 009 → 010**. ***Je voudrais…* = fixed politeness chunk in 009** (NOT a *vouloir* conjugation teach). *désolé(e)* in 009 with the SIO-010 role cue. Flip It P1s order under **#9** after **#156**. SUP-CAL optional under **#10** unchanged. A previous line of this doc put *Je voudrais…* OUT of first 009 — **superseded**. |
| **Ship beat** | Merge the green product PRs first. **Class bag product + soft-auth ship as one beat** after that (items 2 + 3), not as two sequential auth stories. |

---

## 2. Conflicts resolved

| Prior tension | Resolution (locked) |
|---|---|
| `docs/HANDOFF_SPECULEARN_PRETESTS.md` still talks Pretest / Practice **zones**; live IA is the **six-door** bar (Goals · Practice · Games · Revise · Skills · User) | **Use the live IA.** Handoff zones are history. |
| FR-lead can-do (SIO `fr` as the title line) vs absolute beginners | **EN-first can-do.** Optional FR under, same size or smaller, italics. Never FR-lead, even when the SIO string is already French. |
| L2+ intentional chest / hue mismatch vs colour teaching | **Semantic forever on colour decks.** Positional L2+ only on non-colour. |
| Hearts in LexicaLater (older STATUS) vs hearts retired site-wide | **Drop hearts.** Older “hearts stay in games” notes are superseded. NumBus / NumBourse lives stay a later item-13 question, not a colour-deck exception. |
| SpecuLearn vs Pre-test as two products | **Merge planned (item 8).** One guess-first product, SpecuLearn’s name. **Gap recording kept** (`recordPretestAnswer`). No XP. `verify40` holds. |
| Class bag doc (#152) vs the product | **#152 is the spec** (merged). The screen is still to build (item 2). Do not invent alternate copy. |
| Politesse as its own stop vs inside Greetings | **Fold into SIO-009.** No new map node / no extra Continue gate. Sequence **002 → 009 → 010**. SIO-010 stays the name + *Enchanté(e)* chain. |
| *Je voudrais…* OUT of first 009 vs in 009 as a chunk | **IN 009 as a fixed politeness chunk** (FR + Pedagogy joint agreed). Not a *vouloir* conjugation teach. The earlier “OUT / shops first” line is **superseded**. |

---

## 3. Open PRs (status)

| PR | Item | Status |
|---|---|---|
| [#153](https://github.com/frenchprof/fluoduo/pull/153) | 1 P0s | **merge next** — Unit-0 StopSheet href + U1–4 Recap `BringToClass` |
| [#155](https://github.com/frenchprof/fluoduo/pull/155) | 5–6 flip + due | **UI approved** — ↻ chip, `--dopa-streak` due pill, rain accents |
| [#156](https://github.com/frenchprof/fluoduo/pull/156) | 9 Enchantée + Libéria | **UI + FR + Pedagogy approved** |
| [#152](https://github.com/frenchprof/fluoduo/pull/152) | Class bag doc | **merged 3 Sep** — spec only; product is item 2 |
| [#154](https://github.com/frenchprof/fluoduo/pull/154) | FR review doc | **docs**; Flip It P1s listed — merge after #156 |

Not in the 1–18 list, already on `main` today: **#157 / #158** (fluolingo.com
Pages root path + two-site truth in `docs/DEPLOY.md`). Smoke that domain after
the next `main` Pages build (item 18).

---

## UI+UX joint lock (final — UX Expert + UI Expert)

Do not invent a second look. Mocks on file with Dan: VocabulaRain Cahier, LexicaLater dense treasure, ChaTutor dopa controls, MenuSplash real-16 hierarchy.

## Key decisions

**2+3 Class bag + soft-auth (one beat)**
- SpecuLearn/pretest ends in Class bag: EN-first can-do; FR miss chips as target (EN gloss under, never larger); CTA Show in class; empty = “Nothing to check — you’re ready.”
- Soft-auth never mid-guess; soft-sell on Continue / Sign in to keep this bag; escape Keep going without saving.
- Cahier paper + ink-lip chips; `--dopa-miss` sparingly; soft-auth paper modal EN-only.
- Solo can finish without Class bag gate; bag = catch-up artifact.

**4 Double-door IA**
- Bottom bar → family hubs; MenuSplash = overflow / first-run only.
- MenuSplash: quiet paper + thin ink border; only selected/current activity gets strong fam-ink accent (no 16× hue shout).
- Goals singular via Home Continue.

**5–6 / #155**
- Flip B: front-only quiet ↻, paper-raised + ink lip, EN aria.
- Due pill: `--dopa-streak` / `--dopa-streak-on` (not danger-red).

**7 EN chrome sweep**
- Ranks, badges, toasts, nav, game chrome = EN; FR only on learning targets (tiles, answers, miss chips).

**11 VocabulaRain + LexicaLater**
- Rain: Cahier paper/hl; EN-only puddle when brand-new; small FR under after first meet; FR on falling tiles; unify dual letris/collections data.
- LexicaLater colour: chest fill = taught hue forever; kill mismatch warning; treasure EN-first dense rows; no hearts. Positional L2+ only on non-colour sets later.

## Success (done when)

| Item | Done when |
|------|-----------|
| 2+3 | SpecuLearn → Class bag with no mid-guess AuthGate; EN can-do; FR chips; soft-auth only at save/show; empty + Show in class work; zero-French readable |
| 4 | Family door → hub; ☰ overflow; overflow grid isn’t 16 equal heroes; only selected tile strongly accented |
| 5–6 | #155 merged; Flip ↻ visible on front; due pill uses `--dopa-streak` not danger-red; verify27/34 green |
| 7 | No FR-only chrome on Home, bars, toasts, GameBar; FR only where learner is meant to learn it |
| 11 Rain | EN puddles sortable with zero French; FR on tiles only; Cahier board (no Duo sky as brand); one data source |
| 11 Lexi | Colour chest = taught hue (never blue chest for rouge); EN treasure; 0 hearts; no colour mismatch warning on colour sets |

## Follow-ups
1. Merge #153 → #155 → #156 first.
2. Next PR: Class bag product + soft-auth together (2+3).
3. Then #4; #7 can parallel.
4. After 1–9: #11 VocabulaRain + LexicaLater colour-semantic.

---

## 4. Backlog table

UI+UX Success for items 2–7 and 11 is the joint lock above — copy it, do not paraphrase a second test. FR + Pedagogy rows (9, 9b, 10) stay as locked.

| # | Name | Description | Follow-up actions | Success (done when) | Owner lane |
|---|---|---|---|---|---|
| **1** | **P0s (StopSheet + Recap)** | Unit-0 Pre-Test from StopSheet still opened the map popup; U1–4 Recap had score / retry and no gap list. | Merge **#153**. Smoke: 9-key StopSheet → Unit-0 Goal 1 Pre-Test → `/pretests/unit0/SIO-001` (not `/map`). Finish a U1 pretest with misses → Recap shows Bring to class. Map popup Pre-Test still correct for U0 and U1. | Both paths work on the Pages preview. `verify40` and `verify66` stay green. No map chrome on a Unit-0 pretest URL. | Claude(impl) → Coordinator merge |
| **2** | **Class bag product** | Post-SpecuLearn (and Skip pretest) screen that turns misses into the atelier artifact. Spec is `docs/CLASS_BAG.md`. Not a score dump. One beat with item 3. | After **#153 → #155 → #156**: one PR for Class bag product + soft-auth together (UI+UX Follow-ups §2). Wire after SpecuLearn / pretest; **Show in class**; empty = “Nothing to check — you’re ready.” | SpecuLearn → Class bag with no mid-guess AuthGate; EN can-do; FR chips; soft-auth only at save/show; empty + Show in class work; zero-French readable | UX + UI lock → Claude(impl) |
| **3** | **Soft-auth** | Unsigned learners must finish the guess. Sign-in is for **keeping** the bag, not for sitting the card. Same PR as item 2. | Soft-auth never mid-guess; soft-sell on Continue / **Sign in to keep this bag**; escape **Keep going without saving**. Soft-auth paper modal EN-only. Do not hand-edit `REQUIRE_SIGN_IN`. | SpecuLearn → Class bag with no mid-guess AuthGate; EN can-do; FR chips; soft-auth only at save/show; empty + Show in class work; zero-French readable | UX + Claude(impl) |
| **4** | **Double-door** | Bottom bar → family hubs; MenuSplash = overflow / first-run only. Goals singular via Home Continue. | After 2+3 (UI+UX Follow-ups §3). MenuSplash: quiet paper + thin ink border; only selected/current activity gets strong fam-ink accent (no 16× hue shout). | Family door → hub; ☰ overflow; overflow grid isn’t 16 equal heroes; only selected tile strongly accented | UX + Claude(impl) |
| **5** | **MémoiRecall flip cue** | Flip B: front-only quiet ↻, paper-raised + ink lip, EN aria. | Merge **#155** (UI+UX Follow-ups §1). Smoke `/practice/flip-it/salutations` Study. | #155 merged; Flip ↻ visible on front; due pill uses `--dopa-streak` not danger-red; verify27/34 green | UI → Coordinator merge |
| **6** | **Due pill** | Due pill: `--dopa-streak` / `--dopa-streak-on` (not danger-red). | Same merge **#155**. | #155 merged; Flip ↻ visible on front; due pill uses `--dopa-streak` not danger-red; verify27/34 green | UI → Coordinator merge |
| **7** | **EN chrome sweep** | Ranks, badges, toasts, nav, game chrome = EN; FR only on learning targets (tiles, answers, miss chips). | Can parallel item 4 (UI+UX Follow-ups §3). Audit Home, bars, toasts, GameBar. `economy.ts` `RANKS` is currently Débutant → Maître — chrome, not a card. | No FR-only chrome on Home, bars, toasts, GameBar; FR only where learner is meant to learn it | UX + FR review → Claude(impl) |
| **8** | **SpecuLearn ↔ Pretest merge** | Dan: they are the same thing. One guess-first product; pre-test’s memory; SpecuLearn’s name. | One product PR after item 1 is in. Keep `recordPretestAnswer` on every run. Keep pretest coverage (U0 + U1–4 + picture). Keep SpecuLearn shell / photo bank. One registry name + blurb. No `recordItemResult` / XP / SRS. Rail copy says “first look, before you are taught” in words — do not restore a stripped-nav wall as the only signal. | **One name** (SpecuLearn) on bar, Menu, StopSheet, Recap. Misses **always** record. Recap / Class bag still list them. `verify40` holds (no XP weld). No second “Pre-test” product door. | Pedagogy + Claude(impl) |
| **9** | **FR (Enchantée, politesse in 009, Flip P1s)** | **FR + Pedagogy joint agreed.** Merge #156 first (Léa *Enchantée*, Libéria). Politesse folds into **SIO-009** (fixed chunks + *désolé(e)* role-cue like 010) — no new map node / no extra Continue gate. Sequence **002 → 009 → 010**. *Je voudrais…* = fixed politeness chunk in 009 (NOT *vouloir* conjugation). Flip It P1s after #156. SUP-CAL stays **#10**. | After **#153 → #155 → #156**: (1) content cells for 009 polite targets — *Je voudrais…* as a chunk, *désolé(e)* with role cue, EN chrome; (2) Flip It P1 string fixes from #154 (`sappeler-05`/`-06`, salutations *Enchantée*, *Bonne nuit* bedtime-only, `core-nouns-06` *salle de classe*). Do not touch 010 *Enchantée* keys. No new SIO. SUP-CAL not in this PR. | **009** polite targets with EN chrome; *désolé(e)* gender-keyed; **010 Enchantée untouched**; Flip P1s fixed; SUP-CAL optional (#10). `verify91-enchantee-liberia` still green after #156. | FR + Pedagogy → Coordinator merge #156, then Claude(impl) for 009 cells + Flip P1s |
| **9b** | **Politesse (same lock as #9)** | Pointer only — do not ship a second stop. Fold is **SIO-009** under item 9. | Same follow-up as **#9**. | Same Success as **#9**. | FR + Pedagogy |
| **10** | **Curriculum (v9 + SUP-CAL)** | Core is the v9 50-SIO spine. Directions stay off the imperative (except **SIO-008** consignes). Calendar is Optional extra — not a 51st stop. | Reconcile numbering to `docs/handoff/LAF1201_SIOs_Flashcards_v9.csv`. Guard-rail: SIO-036 / SIO-040 use *il faut* / *on* / *c’est* — *Tournez / Allez / Prenez* only as distractors. Ship **SUP-CAL-01 / 02 / 03** as **Optional** chips, **soft family wash**, **off Continue**. **SUP-CAL-03** *né / née* reuses the SIO-010 role cue. Continue never requires a calendar stop. | Core **50** complete without opening SUP-CAL. Optional chip + soft fam wash visible; chip is not on the spine. Unit complete **without calendar**. SUP-CAL-03 keys *née* for Léa and *né* for Marc, cue before the guess. Directions bank has no keyed imperative. | Pedagogy + UI → Claude(impl) |
| **11** | **VocabulaRain + LexicaLater colour** | Rain: Cahier paper/hl; EN-only puddle when brand-new; small FR under after first meet; FR on falling tiles; unify dual letris/collections data. LexicaLater colour: chest fill = taught hue forever; kill mismatch warning; treasure EN-first dense rows; no hearts. Positional L2+ only on non-colour sets later. | After 1–9 (UI+UX Follow-ups §4). | **Rain:** EN puddles sortable with zero French; FR on tiles only; Cahier board (no Duo sky as brand); one data source. **Lexi:** Colour chest = taught hue (never blue chest for rouge); EN treasure; 0 hearts; no colour mismatch warning on colour sets. | UX + UI + Pedagogy → Claude(impl) |
| **12** | **Phone chrome** | The course is a 390-wide phone. Desk, bar, and game frame must stay one regime. | Sweep 390×844: Cahier desk all round (page + drill); BottomBar `sm:hidden` readable; GameBar cannot scroll away (`verify90`); no fourth thing on the deck band; first-run hint below CreditsSplash (z-79). Catch any new door that grows a second top control. | One desk regime (h47 / top 57 / left 19 / ✕ at 31; drill bottom desk ≠ a page’s 64). Volume visible on every game. Bar stays on screen when a keypad focuses. No HELP-dot double door on a deck band. | UI + Claude(impl) |
| **13** | **Gamification** | Economy is built; chrome and hearts are not yet aligned with the beginner lock. | Keep the two-quantity model (XP + gems; streak is a multiplier). No XP on SpecuLearn / pretest (`verify40`). Streak stays live (`verify89`) including wrong answers. Hearts: none on LexicaLater / colour; decide NumBus / NumBourse lives vs the site-wide “no hearts” lock (Dan) before shipping another heart asset. Reward chrome in English (item 7). Nothing locked behind gems. | No hearts on curriculum or colour / LexicaLater. SpecuLearn still pays **no XP**. First graded answer still bumps 🔥 where the learner can see it. Gems never gate a door. | UX + Pedagogy + Claude(impl) |
| **14** | **Session receipts** | `SessionReceipt` exists; most drills still just stop. Design of the receipt is not locked. | Inventory which surfaces already pass a run into `SessionReceipt`. Spec the four beats (earned · streak · better · fix → ReVue) in EN chrome. Do **not** put XP on a SpecuLearn / Class bag receipt. Flawless-run fanfare stays off diagnostics. Put a picture of the receipt in the spec PR before implementing new call sites. | A practice / game run that grades ends on a receipt, not a dead stop. Diagnostic / Class bag path does **not** show XP. Misses still hand to ReVue / Class bag as appropriate. | UX (spec) → Claude(impl) |
| **15** | **Teacher reports** | `/teacher` already has pretest miss rates. Class bag is a **class artifact**, not a new analytics product. | After item 2: teacher can open the same bag a learner would **Show in class** (per-student miss chips + EN can-do). Do not build a second score dump. Keep existing Pretests panel. Soft-auth bags that were “kept going without saving” stay device-local — teacher view only claims **saved** bags. | Teacher opens a learner’s Class bag and sees the same FR chips + EN can-do the learner showed. Empty bag = ready. No extra “score %” invented for the bag. Unsigned-unsaved bags are absent, not fabricated. | Pedagogy + Claude(impl) |
| **16** | **HELP cleanup** | HELP became Menu (20 tiles, no prose). Leftover “HELP!” / ❓ copy still teaches the old door. | Grep learner-visible HELP / ❓ Guide / “open HELP”. `/guide` may keep the long form; its h1 **❓ HELP!** is chrome a beginner must decode — retitle in English. First-run popups stay; they are not a second menu. Two doors to MenuSplash on one screen stay forbidden (HelpDot lesson). | No learner-facing control labelled only HELP. Menu is the grid. Guide is “Guide” (or another EN word). First-run ≠ Menu. `verify19c` still describes Menu, not HELP. | UX + Claude(impl) |
| **17** | **Cohort QA** | NUS LAF1201 A1-zero. Finish means a student who knows no French can sit Unit 0 → Class bag → Continue. | After 1–9 land: one unsigned pass and one signed pass through Unit 0 SIO-001 and SIO-010 (Léa + Marc), one U1 pretest, Flip It salutations, VocabulaRain weather, LexicaLater colours. Note every FR chrome blocker (feed item 7). Pedagogy + FR sign the Enchantée / Libéria / Flip P1s on the **preview**, not only in source. | Unsigned A1 completes Unit-0 pretest → Class bag (or today’s Bring to class) → Continue. Léa/Marc gender holds on preview. No FR-only CTA blocks the path. Cohort notes filed or closed, not left in chat. | Pedagogy + FR + Coordinator |
| **18** | **Deploy** | Two live sites, different triggers. Pages Functions only on withdrchan. | After green merges: `main` auto-updates **fluolingo.com** (GitHub Pages). Fire **`deploy-live`** for **fluolingo.withdrchan.com**. Smoke **both**: styled HTML on fluolingo.com (no `/fluoduo/_next` 404 — #157); ChaTutor / TTS / Compose check **only** claimed on withdrchan. Do not “Retry deployment” of an old Cloudflare row. | Preview + both live hosts match the intended SHAs. fluolingo.com is styled. withdrchan has Functions. `verify91` (Pages base path) green on `main`. Dan has walked StopSheet → Unit-0 pretest on the host students actually use. | Coordinator + Dan |

---

## 5. Further improvements (ideas, not commitments)

These do not contradict locks. They are not in 1–18 and do not block merge.

- **WHY nit — “masculine form”.** Enchantée WHY is locked as *“Léa is a woman — she says Enchantée. Enchanté is what a man says.”* A later pass may prefer “masculine form” / “feminine form” if Pedagogy wants the metalanguage; do not rewrite #156 for it.
- **Session receipt design.** Four-beat layout, EN chrome, no XP on diagnostics — spec with pictures (item 14) before sprinkling `SessionReceipt` on every drill.
- **Teacher Class bag view.** Same artifact the learner shows (item 15). Not a gradebook.
- **Ambient tools.** ChaTutor as a floating consult; VoixLà summonable wherever French is typed (2 Sep roadmap). OUTILS row is the address, not the life.
- **Reading activity.** The one untrained skill; 📖 badge returns the day it ships, never stretched onto flashcards.
- **PWA already shipped.** Do not rebuild install / manifest as a finish item.
- **Held FR notes.** Bélarus / Birmanie / Cap-Vert / Centrafrique stay notes (#154 §6).

---

## 6. Next human actions (Dan)

1. Merge **#153 → #155 → #156** first, then **#154** (FR report).
2. Next PR: **Class bag product + soft-auth together (2+3)**. Copy frozen to `docs/CLASS_BAG.md`.
3. Then **#4**; **#7** can parallel.
4. After **#153 → #155 → #156**: content cells for **SIO-009** polite chunks (*Je voudrais…* as a chunk, *désolé(e)* role-cue) + Flip It P1 string fixes (item 9). SUP-CAL stays optional under #10. Then **#11**.
5. Deploy / smoke preview — **fluolingo.com** and withdrchan (`deploy-live`).
