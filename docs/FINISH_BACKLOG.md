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
| **Politesse → SIO-009** | FR + Pedagogy joint lock (final). Politesse **folds into Greetings (SIO-009)** — not a separate stop. **First 009 pack:** *Bonjour / Salut / Au revoir* + register + **light politesse** (*Excusez-moi*, *Pardon*, *Merci / De rien*, *Je vous en prie*, *s’il vous plaît* as a courtesy chip) + ***Je suis désolé(e)*** with the SIO-010 role cue when gender matters. ***Je voudrais…* is OUT** of first 009 — transactional; first taught in shops / restaurant, which may also reuse the light chips. SIO-010 stays the name + *Enchanté(e)* chain. A previous line of this doc put *Je voudrais…* in the first 009 pack — **superseded**. Lands as item **9b**, after **#153 → #155 → #156**. |
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
| Politesse as its own stop vs inside Greetings | **Fold into SIO-009.** No extra Continue node. SIO-010 does not absorb the pack. |
| *Je voudrais…* in the first SIO-009 pack vs shops / restaurant | **OUT of first 009.** Transactional. Light politesse + *Je suis désolé(e)* (role cue) stay. *Je voudrais…* first appears in shops / restaurant. |

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

## 4. Backlog table

| # | Name | Description | Follow-up actions | Success (done when) | Owner lane |
|---|---|---|---|---|---|
| **1** | **P0s (StopSheet + Recap)** | Unit-0 Pre-Test from StopSheet still opened the map popup; U1–4 Recap had score / retry and no gap list. | Merge **#153**. Smoke: 9-key StopSheet → Unit-0 Goal 1 Pre-Test → `/pretests/unit0/SIO-001` (not `/map`). Finish a U1 pretest with misses → Recap shows Bring to class. Map popup Pre-Test still correct for U0 and U1. | Both paths work on the Pages preview. `verify40` and `verify66` stay green. No map chrome on a Unit-0 pretest URL. | Claude(impl) → Coordinator merge |
| **2** | **Class bag product** | Post-SpecuLearn (and Skip pretest) screen that turns misses into the atelier artifact. Spec is `docs/CLASS_BAG.md`. Not a score dump. | After #153/#155/#156 are on `main`, one PR: implement the screen to the locked copy; wire it after SpecuLearn / pretest Recap; empty + miss + folded-count states; **Show in class** / optional **Copy list**; same **Continue** as Home. Ship **with item 3**. | A1 finishes pretest → Class bag → Continue. Title **Class bag**. Can-do reads `You can: …` in English first. Miss chips are French. Empty body is **Nothing to check — you’re ready.** Folded list says `{n} to check`; open list has no repeated count. No mid-guess AuthGate. | UX + UI lock → Claude(impl) |
| **3** | **Soft-auth** | Unsigned learners must finish the guess. Sign-in is for **keeping** the bag, not for sitting the card. | **Ship in the same PR as item 2.** Gate on save / **Show in class** / Continue-from-bag only. Strings exactly: **Sign in to keep this bag** · **Continue with Google** · **Keep going without saving**. Do not move `AuthGate` mid-card. Do not hand-edit `REQUIRE_SIGN_IN`. | No AuthGate mid-card on SpecuLearn / pretest. Soft-sell appears only on Continue / save bag / Show in class. **Keep going without saving** still reaches Continue. `verify38` stays green. | UX + Claude(impl) |
| **4** | **Double-door** | Family link on the base bar and the ☰ parent must not open two competing rooms for the same door. | Audit 🎯🏋️🎮🔄💬 and ☰ parents at 390px. One path: bar → that family’s hub / filtered MenuSplash. **Overflow / extra tiles stay inside MenuSplash only.** Goals stays a direct Continue (no popup — already locked 2 Sep). No second family popup stacked on the same door. | One path bar → hub. No competing family popup for the same door. Goals tap = current stop. `verify19c` / rail checks still pass. | UX + Claude(impl) |
| **5** | **MémoiRecall flip cue** | Card looked inert after the Flip CTA was removed. Variant B locked. | Merge **#155**. Smoke `/practice/flip-it/salutations` Study: ↻ on front only; tap / Tab+Enter still flip; back is French with no chip; no Flip / Retourner word. | ↻ visible **front-only**. `verify27 §14h` green. Keyboard still flips. | UI → Coordinator merge |
| **6** | **Due pill** | Revise due count sat on `--fluo-danger` (alarm red). Pending work is not failure. | Same merge **#155**. Smoke Home at ~390px with due `itemSrs`: Revise pill is `--dopa-streak` / `--dopa-streak-on`, white numerals, readable. | Due pill uses **`--dopa-streak`**. Contrast holds (~4.6:1 already measured on the PR). No danger-red due chrome. | UI → Coordinator merge |
| **7** | **EN chrome sweep** | Beginners still hit FR-only chrome they must decode to act (ranks, some badges, toasts, treasure / locker). Target French on cards is fine. | Audit `/`, `/moi`, RewardToast, locker / cosmetics, leaderboard rank line, game-over chrome. `economy.ts` `RANKS` is currently Débutant → Maître — that is chrome, not a card. Rewrite learner-facing ranks / badge titles / toast verbs to English. Leave taught French on tiles alone. Pin with a verify that chrome strings the beginner must tap are English. | No FR-only chrome a beginner must decode to act (a button, a rank they are told they are, a toast they dismiss). French remains on cards, miss chips, and tiles. | UX + FR review → Claude(impl) |
| **8** | **SpecuLearn ↔ Pretest merge** | Dan: they are the same thing. One guess-first product; pre-test’s memory; SpecuLearn’s name. | One product PR after item 1 is in. Keep `recordPretestAnswer` on every run. Keep pretest coverage (U0 + U1–4 + picture). Keep SpecuLearn shell / photo bank. One registry name + blurb. No `recordItemResult` / XP / SRS. Rail copy says “first look, before you are taught” in words — do not restore a stripped-nav wall as the only signal. | **One name** (SpecuLearn) on bar, Menu, StopSheet, Recap. Misses **always** record. Recap / Class bag still list them. `verify40` holds (no XP weld). No second “Pre-test” product door. | Pedagogy + Claude(impl) |
| **9** | **FR (Enchantée, Libéria, Flip P1s)** | SIO-010 keyed *Enchanté* after Léa; expert list had *Liberia*. Flip It P1s in #154. Politesse pack is **9b** — same FR lane, after this merge. | Merge **#156**. Then a follow-up PR for #154 Flip It P1s: `sappeler-05` / `-06`; salutations *Enchantée* card; *Bonne nuit* bedtime-only; `core-nouns-06` *salle de classe*. Hold Bélarus / Birmanie / Cap-Vert / Centrafrique. Do not wait on 9b to merge #156. | Léa → **Enchantée** only (Marc → Enchanté). Role cue `Léa · she` visible **before** the guess. EN WHY on the wrong form. **Libéria** / `LIBÉRIA` on the expert tile. Flip P1s FR QA green. `verify91-enchantee-liberia` green. | FR + Pedagogy → Coordinator merge, then Claude(impl) for P1s |
| **9b** | **Politesse → Greetings (SIO-009)** | Not a separate stop. First SIO-009 Flip It / SpecuLearn pack = greetings + **light politesse** + ***Je suis désolé(e)*** (role cue). ***Je voudrais…* is not in this pack** (supersedes the earlier 009 list). SIO-010 stays name + *Enchanté(e)* only. Flip P1s (item 9) and SUP-CAL (item 10) unchanged. Behind **#153 → #155 → #156**. | Content PR **after #156** is on `main` (still the 1–9 beat). Add to first 009: *Excusez-moi* · *Pardon* · *Merci / De rien* · *Je vous en prie* · *s’il vous plaît* · ***Je suis désolé(e)***. Role cue on *désolé(e)* when gender matters (`Léa · she` / `Marc · he`). **Do not add *Je voudrais…*** — that frame waits for shops / restaurant, which reuse the light chips. FR QA accents + gender on *désolé / désolée*. No new SIO id. No Continue node. | **No separate politesse stop.** First 009 pack has light politesse + *Je suis désolé(e)* with role cue, and **no *Je voudrais…***. Unit Continue spine **unchanged** (001–050). Shops / restaurant are the first *Je voudrais…* teach, not a second greetings stop. Flip P1s + SUP-CAL rows still as written. | FR + Pedagogy → Claude(impl) |
| **10** | **Curriculum (v9 + SUP-CAL)** | Core is the v9 50-SIO spine. Directions stay off the imperative (except **SIO-008** consignes). Calendar is Optional extra — not a 51st stop. | Reconcile numbering to `docs/handoff/LAF1201_SIOs_Flashcards_v9.csv`. Guard-rail: SIO-036 / SIO-040 use *il faut* / *on* / *c’est* — *Tournez / Allez / Prenez* only as distractors. Ship **SUP-CAL-01 / 02 / 03** as **Optional** chips, **soft family wash**, **off Continue**. **SUP-CAL-03** *né / née* reuses the SIO-010 role cue. Continue never requires a calendar stop. | Core **50** complete without opening SUP-CAL. Optional chip + soft fam wash visible; chip is not on the spine. Unit complete **without calendar**. SUP-CAL-03 keys *née* for Léa and *né* for Marc, cue before the guess. Directions bank has no keyed imperative. | Pedagogy + UI → Claude(impl) |
| **11** | **VocabulaRain + LexicaLater colour** | Games still carry leftover Duo-sky / FR-only puddle / hearts / colour-mismatch habits. | Cahier paper board (GameFrame). Puddles: EN sort key; optional small FR only after first meet; new category EN-only; tiles stay FR. Colour chests = taught hue forever; no “wrong chest” warning on colour decks. Strip LexicaLater hearts. Accents already moving to `--dopa-*` in #155 — finish the board, not just the flash. | No Duo sky. No FR-only puddles a beginner must read to sort. No colour-mismatch warning on colour decks. No hearts on LexicaLater. Brand-new category shows EN only. | UX + UI + Pedagogy → Claude(impl) |
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

1. Merge **#153 → #155 → #156** (product), then **#154** (FR report).
2. Deploy / smoke preview — **fluolingo.com** (Pages, now on `main` via #157) **and** withdrchan (`deploy-live`). Walk StopSheet Unit-0 → pretest → Recap.
3. Greenlight **Class bag product + soft-auth** as **one PR** (Claude or cloud agent), copy frozen to `docs/CLASS_BAG.md`.
4. After #156: greenlight the **SIO-009 politesse pack** (item 9b) — same FR lane, no new stop.
