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
| **2+3 Class bag + soft-auth** | **UI+UX joint agreed, no disagreements.** Class bag per `docs/CLASS_BAG.md` + soft-auth **never mid-guess**. EN can-do; FR miss chips as target; Cahier ink-lip. One beat (items 2+3). Spec landed #152; product still to build. |
| **4 Double-door** | **UI+UX joint agreed, no disagreements.** Bar → hubs. MenuSplash = overflow / first-run only. |
| **5–6 Flip + due** | **UI+UX joint agreed, no disagreements.** #155 ship (Flip B + due → `--dopa-streak`). UI approved. |
| **7 EN chrome** | **UI+UX joint agreed, no disagreements.** No FR-only chrome a beginner must decode. |
| **11 VocabulaRain + LexicaLater** | **UI+UX joint agreed, no disagreements.** VocabulaRain: Cahier + EN puddles (FR under after first meet). LexicaLater colour decks **semantic forever**; **no hearts**; EN-first treasure. Positional L2+ never on colour. |
| **SpecuLearn Enchantée** | Role cue **before** the guess (`Léa · she` / `Marc · he`). Gender-conditioned keys. EN WHY on the wrong form. Reveal uses `.cahier-hl` + `--gram-*`. MémoiRecall reinforces after, it does not teach first. Lands in #156. |
| **SUP-CAL** | Calendar supplements sit under **item 10 Optional**, **off the Continue spine**. UX / UI / FR / Pedagogy agree: **Optional chip**, **soft family wash**, never on Continue. Core SIOs **001–050** stay intact. A unit can complete without opening a calendar. **SUP-CAL-03** *né / née* uses the SIO-010 role cue (`Léa · she` / `Marc · he`) — same gender pattern as Enchantée. |
| **Politesse → SIO-009** | **FR + Pedagogy final amend.** Politesse **folds into SIO-009** (light chunks + *désolé(e)* role-cue like 010). **No new map node / no extra Continue gate.** Sequence **002 → 009 → 010**. ***Je voudrais…* is OUT of first 009** (transactional — shops / restaurant later). *désolé(e)* stays in 009 with the SIO-010 role cue. Flip It P1s under **#9** after **#156**. SUP-CAL optional under **#10** unchanged. The “IN 009 as a *vouloir* chunk” line is **superseded**. |
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
| *Je voudrais…* in first 009 vs shops later | **OUT of first 009** (FR + Pedagogy final amend). Light politesse + *désolé(e)* (role cue) stay. The “fixed chunk in 009” line is **superseded**. |

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

**UI+UX joint agreed. No disagreements.** Do not invent a second look. Mocks on file with Dan: VocabulaRain Cahier, LexicaLater dense treasure, ChaTutor dopa controls, MenuSplash real-16 hierarchy.

## Key decisions

**2+3 Class bag + soft-auth (one beat)**
- Class bag per `docs/CLASS_BAG.md` + soft-auth never mid-guess.
- EN can-do; FR miss chips as target; Cahier ink-lip.

**4 Double-door IA**
- Bar → hubs; MenuSplash overflow / first-run only.

**5–6 / #155**
- #155 ship (Flip B + due → `--dopa-streak`). UI approved.

**7 EN chrome sweep**
- No FR-only chrome beginners must decode.

**11 VocabulaRain + LexicaLater**
- VocabulaRain Cahier + EN puddles (FR under after first meet).
- LexicaLater colour decks semantic forever; no hearts; EN-first treasure.

## Success (done when)

| Item | Done when (measurable) |
|------|-----------|
| 2 | SpecuLearn/pretest lands on Class bag per `CLASS_BAG.md`; title Class bag; EN can-do first; FR only on miss chips (EN gloss under, never larger); Cahier ink-lip chips; **Show in class** works; empty = “Nothing to check — you’re ready.”; zero-French readable |
| 3 | Same PR as 2. No AuthGate mid-guess on SpecuLearn/pretest. Soft-sell only on Continue / **Sign in to keep this bag**. Escape **Keep going without saving** still reaches Continue. `verify38` green |
| 4 | Bottom-bar family tap → that hub (not a second family popup). MenuSplash = overflow / first-run only. Goals = Home Continue |
| 5 | #155 merged. Flip ↻ on front only (paper-raised + ink lip); back has no ↻; EN aria; `verify27` green |
| 6 | #155 merged. Revise due pill is `--dopa-streak` / `--dopa-streak-on`, not danger-red; `verify34` green |
| 7 | Home, bars, toasts, GameBar: no FR-only chrome a beginner must decode to act. FR only on tiles, answers, miss chips, card backs |
| 11 | Rain: Cahier board + EN puddles sortable with zero French; small FR under only after first meet; FR on falling tiles. Lexi: colour chest = taught hue forever; 0 hearts; EN-first treasure; no mismatch warning on colour decks |

## Follow-ups
1. Merge **#153 → #155 → #156**.
2. Class bag + soft-auth PR (items **2+3 as ONE beat**).
3. Item **4** double-door.
4. Item **7** EN chrome sweep.
5. Item **11** VocabulaRain / LexicaLater after 1–9.

---

## 4. Backlog table

UI+UX Success for items 2–7 and 11 is the joint lock above (no disagreements). FR + Pedagogy: *Je voudrais…* **OUT** of first 009. SUP-CAL stays #10.

| # | Name | Description | Follow-up actions | Success (done when) | Owner lane |
|---|---|---|---|---|---|
| **1** | **P0s (StopSheet + Recap)** | Unit-0 Pre-Test from StopSheet still opened the map popup; U1–4 Recap had score / retry and no gap list. | Merge **#153**. Smoke: 9-key StopSheet → Unit-0 Goal 1 Pre-Test → `/pretests/unit0/SIO-001` (not `/map`). Finish a U1 pretest with misses → Recap shows Bring to class. Map popup Pre-Test still correct for U0 and U1. | Both paths work on the Pages preview. `verify40` and `verify66` stay green. No map chrome on a Unit-0 pretest URL. | Claude(impl) → Coordinator merge |
| **2** | **Class bag product** | Class bag per `docs/CLASS_BAG.md`. EN can-do; FR miss chips as target; Cahier ink-lip. One beat with item 3. | After **#153 → #155 → #156**: **one PR** with item 3. | SpecuLearn/pretest lands on Class bag per `CLASS_BAG.md`; title Class bag; EN can-do first; FR only on miss chips (EN gloss under, never larger); Cahier ink-lip chips; **Show in class** works; empty = “Nothing to check — you’re ready.”; zero-French readable | UX + UI → Claude(impl) |
| **3** | **Soft-auth** | Never mid-guess. Same PR as item 2. | Soft-sell on Continue / **Sign in to keep this bag**; escape **Keep going without saving**. Do not hand-edit `REQUIRE_SIGN_IN`. | Same PR as 2. No AuthGate mid-guess on SpecuLearn/pretest. Soft-sell only on Continue / **Sign in to keep this bag**. Escape **Keep going without saving** still reaches Continue. `verify38` green | UX + UI → Claude(impl) |
| **4** | **Double-door** | Bar → hubs; MenuSplash overflow / first-run only. | After the 2+3 PR. | Bottom-bar family tap → that hub (not a second family popup). MenuSplash = overflow / first-run only. Goals = Home Continue | UX + UI → Claude(impl) |
| **5** | **MémoiRecall flip cue** | #155 ship (Flip B). UI approved. | Merge **#155**. | #155 merged. Flip ↻ on front only (paper-raised + ink lip); back has no ↻; EN aria; `verify27` green | UI → Coordinator merge |
| **6** | **Due pill** | #155 ship (due → `--dopa-streak`). UI approved. | Same merge **#155**. | #155 merged. Revise due pill is `--dopa-streak` / `--dopa-streak-on`, not danger-red; `verify34` green | UI → Coordinator merge |
| **7** | **EN chrome sweep** | No FR-only chrome beginners must decode. | After item 4. | Home, bars, toasts, GameBar: no FR-only chrome a beginner must decode to act. FR only on tiles, answers, miss chips, card backs | UX + UI → Claude(impl) |
| **8** | **SpecuLearn ↔ Pretest merge** | Dan: they are the same thing. One guess-first product; pre-test’s memory; SpecuLearn’s name. | One product PR after item 1 is in. Keep `recordPretestAnswer` on every run. Keep pretest coverage (U0 + U1–4 + picture). Keep SpecuLearn shell / photo bank. One registry name + blurb. No `recordItemResult` / XP / SRS. Rail copy says “first look, before you are taught” in words — do not restore a stripped-nav wall as the only signal. | **One name** (SpecuLearn) on bar, Menu, StopSheet, Recap. Misses **always** record. Recap / Class bag still list them. `verify40` holds (no XP weld). No second “Pre-test” product door. | Pedagogy + Claude(impl) |
| **9** | **FR (Enchantée, politesse in 009, Flip P1s)** | **FR + Pedagogy final amend.** Merge #156 first. Politesse folds into **SIO-009** (light chunks + *désolé(e)* role-cue like 010) — no new map node. Sequence **002 → 009 → 010**. ***Je voudrais…* OUT of first 009.** Flip It P1s after #156. SUP-CAL stays **#10**. | After **#153 → #155 → #156**: (1) 009 polite cells — *désolé(e)* with role cue, EN chrome, **no *Je voudrais…***; (2) Flip It P1s from #154. Do not touch 010 *Enchantée* keys. | **009** polite targets with EN chrome and **no *Je voudrais…***; *désolé(e)* gender-keyed; **010 Enchantée untouched**; Flip P1s fixed; SUP-CAL optional (#10). | FR + Pedagogy → Coordinator merge #156, then Claude(impl) |
| **9b** | **Politesse (same lock as #9)** | Pointer only — do not ship a second stop. Fold is **SIO-009** under item 9. | Same follow-up as **#9**. | Same Success as **#9**. | FR + Pedagogy |
| **10** | **Curriculum (v9 + SUP-CAL)** | Core is the v9 50-SIO spine. Directions stay off the imperative (except **SIO-008** consignes). Calendar is Optional extra — not a 51st stop. | Reconcile numbering to `docs/handoff/LAF1201_SIOs_Flashcards_v9.csv`. Guard-rail: SIO-036 / SIO-040 use *il faut* / *on* / *c’est* — *Tournez / Allez / Prenez* only as distractors. Ship **SUP-CAL-01 / 02 / 03** as **Optional** chips, **soft family wash**, **off Continue**. **SUP-CAL-03** *né / née* reuses the SIO-010 role cue. Continue never requires a calendar stop. | Core **50** complete without opening SUP-CAL. Optional chip + soft fam wash visible; chip is not on the spine. Unit complete **without calendar**. SUP-CAL-03 keys *née* for Léa and *né* for Marc, cue before the guess. Directions bank has no keyed imperative. | Pedagogy + UI → Claude(impl) |
| **11** | **VocabulaRain + LexicaLater colour** | VocabulaRain Cahier + EN puddles (FR under after first meet). LexicaLater colour decks semantic forever; no hearts; EN-first treasure. | After 1–9. | Rain: Cahier board + EN puddles sortable with zero French; small FR under only after first meet; FR on falling tiles. Lexi: colour chest = taught hue forever; 0 hearts; EN-first treasure; no mismatch warning on colour decks | UX + UI → Claude(impl) |
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

1. Merge **#153 → #155 → #156**, then **#154**.
2. **Class bag + soft-auth PR** (items **2+3 as ONE beat**).
3. Item **4** double-door.
4. Item **7** EN chrome sweep.
5. After 1–9: item **11** VocabulaRain / LexicaLater. Item **9** FR: 009 polite cells **without *Je voudrais…*** + Flip P1s. SUP-CAL stays #10.
6. Deploy / smoke — fluolingo.com and withdrchan.
