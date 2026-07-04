# FluoLingo Release Audit — Round 2 · UX / Cognitive Load / Dead Text / Delight
2026-07-04 · built export walked headless (Chromium 1194) + full source read.
Screenshots: 01-home … 28-letris-start in this directory.

Severity: H / M / L · Effort: S / M / L. All paths under /home/user/fluo.

## 0 · Round-1 deferred Medium items — reassessment

### U1 — three launch surfaces, three different activity sets: STILL PRESENT (H, unchanged)
Verified live on deck `professions`:
- **Popup flaps** (`src/app/SioModal.tsx` popupActivityTabs, 44-79): Pre-Test · Lesson · Flip · Say · Complete · (CZ) · (GM) · Lexicalator · **Vocabularain** · (Unit). **No dice Practice.**
- **Cahier tab rail** (`src/components/CahierShell.tsx` deckActivityTabs, 165-191): Lesson · Flip · Say · Complete · **Practice 🎲 (dice)** · (CZ) · (GM) · Lexicalator · (Unit). **No Vocabularain, no Pre-Test.**
- **Practice chips** (`src/app/SioDetail.tsx` PracticeChips, 114-150, used on /sio/[id] + production popups): Flip · Say · Complete · Lexicalator · Vocabularain · (Unit). **No Lesson, no dice, no CZ, no GM.**
- **Practice Index** (`src/app/activities/page.tsx` cellsFor): all 9 + Unit, **no Pre-Test**.

Concrete failure: open professions popup → click Vocabularain flap → play → land in Flip It via "← Vocabularain sets"… once inside any Cahier page, Vocabularain has vanished from the rail (replaced by "Practice"). Learner must return home to find it again. Fix: one `activityTabsFor(deck, {context})` in one module, consumed by all four surfaces; rail gains Vocabularain, popup gains dice Practice (or drop dice from rail if it's being retired). Effort M.

### U3 — feedback dialects / restart labels / score formats: STILL PRESENT (M, slightly worse — new variants found)
- **Feedback**: 5 dialects now. `✅ Parfait !`/`✅ Bien ! (accent différent)`/`❌` (CompleteIt 192, ConjugaZone 131, GramMarathon 157); `✔ Correct !`/`✘ Presque…` (DiceTrainer 187, 244 — "Presque" shown for *any* wrong answer, which is a lie); `Correct! The answer is …` (dice PracticeContent 328); `✅ Parfait !`/`❌ → sentence` (WeatherMCQ 207); Say It `Parfait !`/`Presque !`/`Pas tout à fait…` (SayItContent 72-77).
- **Restart labels**: now **10 variants**: `Again` (3 drills), `🔁 Recommencer` (SayIt 326), `🎲 Roll again` (dice recap 383), `↻ New round` (mcq Content), `↻ Guess again` (PicturePretest 423), `↻ Retry pretest` (PretestContent 361), `Restart` + `Play again` (weather ×3, matching, letris 525/699), `Play again` (Lexicalator 434), `↺`/`🎤 Try again` (FlipIt 519 etc., SayIt 395).
- **Score formats**: ≥7: `0/16 · ✓ 0` (drills topRight), `Score 0/16` (dice/mcq bars), `0/0 (0%)` (SayIt topRight), `✓ 0/0 · streak 0` (DiceTrainer 129), `Score 0` points (Letris/Lexicalator), `{pct}% ({ok}/{n})` (Dice Summary 69), `X correct out of Y attempts (Z%)` (weather/matching).
- Bonus inconsistency: same "go home" link is `← Back to the path` (SayIt 328, Réviser 103), `← Back to lessons` (dice recap 385, PretestContent, PicturePretest — **and it goes to `/`, not lessons**), `← Home`, `Accueil 🏠`.
→ Unified vocabulary proposal in §4. Effort M (pure string edits, file list below).

### U5 — duplicated "← FluoLingo" in one top bar: STILL PRESENT (M → trivially fixable, S)
Shell already renders "← FluoLingo" on the left; these four pass a second `← FluoLingo` Link as the right-side `crumb` (visible in screenshots 10/11/12: "← FluoLingo …… ← FLUOLINGO"):
- src/app/practice/complete-it/[collectionId]/CompleteItContent.tsx:144
- src/app/practice/conjugazone/[collectionId]/ConjugaZoneContent.tsx:96
- src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx:118
- src/app/reviser/page.tsx:88
Fix: replace crumb with the activity name (`✏️ Complete It` etc.) like Say It / dice do, which also fixes those pages having *no* activity crumb. Effort S.

### U7 remainder — orphan routes: PARTLY FIXED
- Legacy /games/{countries,lieux,loin} cluster: **gone** (directories deleted). Weather + directions are now linked as Unit pages (UNIT_PAGES) — resolved.
- `/pretests/picture/[collectionId]`: **still orphaned** — built for every deck (out/pretests/picture/*) with zero inbound links anywhere in src. Either link it (it's a genuinely nice priming activity with the "real win is the priming" copy) or drop the route. M/S.
- `/games/letris` gallery: now reachable? Only via letris set pages' "← Vocabularain sets" and nothing else links *to* a set except popup/chips/index (which link direct to sets). Gallery itself has no inbound link from home/index. Add a 🌧️ gallery link on the Practice Index header or home burger. L/S.
- `/games/matching` reachable via Directions unit tabs — fine.

### U9 — palette mixing: STILL PRESENT (L, wide)
- Drill pages (CompleteIt/ConjugaZone/GramMarathon/Réviser): **cahier** shell + **fluo**-branded content (fluo-serif h1, fluo-btn, fluo-card vars) on the same screen.
- Dice PracticeContent + mcq/study/pretest recaps: third system — raw Tailwind `slate-900/600/200` on white cards inside the cahier shell (PracticeContent 26-36, 160-171, 222-229; mcq Content recap; PretestContent tables).
- Fonts: Complete It shows 4 families at once (cahier-display top bar, fluo-serif h1, fluo-mono counter, Arial body). Letris/Lexicalator own palettes are fine (distinct "game world" framing).
Fix direction (as round 1 said): converge practice zone on cahier vars; mechanical but wide. Effort L — keep postponed, but do the slate→cahier swap in dice/mcq recaps (S) since those pages are already cahier-framed.

Also re-checked: U2 fixed (no "Apps & Games"/"Practice Zone" anywhere), U4 fixed in SioModal (🧰 Lexicalator) **but** the ❓/🎯 MCQ split survives: deckTabs uses `❓ MCQ` (DeckContent.tsx:32) while the deck page button + crumb use `🎯 MCQ` (DeckContent.tsx:244, mcq/Content.tsx:43) — 🎯 belongs to ConjugaZone now. S.
U6 remainder: LOCKED_UNITS dead branch + "🔒 Coming soon" (SioHub.tsx:51,173-201), unreachable "Coming soon" chip branch (SioDetail.tsx:139-146), and MarkDoneButton's done-state text **"Unlocked the next objective · 💎 earned"** (MarkDoneButton.tsx:57) — false: no SIO ever locks. S.

## 1 · Zero-French learner pass (home → SIO-001..003 → lesson → each activity)

What works: popup Can-Do statements are English; Unit-0 MCQ stems are English; Flip It/Lexicalator instructions are English; Letris weather-cycle interstitials are French *titles* + English *bodies* (nice pattern); Say It "Terminé !", "Parfait !", "Réviser", "C'est parti !" are cognates or carried by emoji/position.

Confusions for an absolute beginner, in order of severity:

| # | Sev | Where | Text | Problem / Fix | Effort |
|---|---|---|---|---|---|
| Z1 | H | SayItContent.tsx:237 | `alert("Veuillez autoriser l'accès au microphone…")` | Mic-permission recovery instruction — functional blocker delivered only in French, as a raw alert(). English (or bilingual) inline message. | S |
| Z2 | M | CompleteItContent.tsx:183, ConjugaZoneContent.tsx:122 | placeholder `commence par « i »…` | This *is* the task instruction ("starts with i"); not decodable day-1. `starts with « i »…` or `first letter: i` — the hint letter is the point, keep it. | S |
| Z3 | M | GramMarathonContent.tsx:148 | placeholder `le mot qui manque…` | Same: "the missing word" isn't decodable. The blank in the sentence already shows the task → per Dan's litmus the placeholder can simply go, or become `type the missing word`. | S |
| Z4 | M | DiceTrainer.tsx (124-193) + BonusTrainer | `✅ Je vérifie`, `🏁 Je termine`, `Fermer`, `Écrivez la phrase complète…`, `★ Facile — change` | First lesson a learner opens (SIO-001 → 🎲 Se présenter). Emoji rescue most buttons but `Fermer` and the placeholders don't decode. Cheapest fix: English `title=` hovers + keep French labels (immersion preserved); or flip labels EN with French kept in TTS. | S |
| Z5 | L | DiceTrainer.tsx:187,244 | `✘ Presque…` on any wrong answer | Double problem: not decodable AND semantically wrong (it shows for completely wrong answers). Fold into unified feedback pair (§4). | S |
| Z6 | L | SayItContent.tsx:76, 232 | `Pas tout à fait…`, `(rien entendu)` | ❌ icon carries the verdict; `(rien entendu)` shown as if it were the transcript is genuinely confusing — use `(nothing heard)` / `—`. | S |
| Z7 | L | LetrisGame.tsx:535-550 | `Continuer dans le noir 🌙`, `Affronter l'orage ⛈️`, `Reprendre dans le noir 🌙` | Sole button under an English explainer — decodable by position; charming. Keep, but consider an EN subtitle in `title=`. | S |
| Z8 | L | SioHub popup pretests (u1-sio011 etc.) | French items; only *some* have an EN gloss (in SIO-011, 1 of 8) | Pretest-as-priming is by design, but gloss coverage is arbitrary — a learner can't tell why one line is translated. Either gloss all after answering, or none. | M |

Verdict: the app is *nearly* zero-French-safe; the残 exceptions are drill placeholders, DiceTrainer chrome, and one French alert(). French feedback like `✅ Parfait !` actively **helps** (comprehensible, celebratory, cognate) — keep it as the standard (§4).

## 2 · One primary action per screen

| Screen | Primary action | Competing elements | Verdict |
|---|---|---|---|
| Home | pick a unit/SIO | Réviser + Lessons pills, streak/gems/hearts, custom-deck btn, rail | OK — units dominate after default-collapse |
| SIO popup | answer inline pretest | 5-8 flaps, resize handle, **Mark as done directly under the questions** | Mark-as-done reads as "submit" for the quiz above it. Move below a divider / relabel `✓ I've practised this` (M/S) |
| Complete It / ConjugaZone / GramMarathon | type + Check (autofocus ✓, Enter rhythm ✓ — round-1 A4 fixed) | none of note | **Best screens in the app** |
| Say It | big mic button | Back/Skip/End row + kbd hint | OK — mic visually dominates |
| Flip It Overview | unclear: table? mode switch? Options? | view flaps, mode switch, flip-all, ⚙ popover, rows select, 2 subset inputs, S1…Sn chips, per-row toggles, column hide icons, notes | **Most overloaded screen** (see §6) |
| Dice Practice | 3 choice buttons | TTS pill, Listen | OK |
| Letris | the falling drop | 5 pills: `?` `🔇` `🗣️` `Pause` `Restart` — two emoji-only audio toggles are ambiguous (music vs voice) | Label on hover only; add aria/title text `Music` / `Voice` (S) |
| Lexicalator | drag chest / tap syllables | music toggle, Hard pill | OK |
| Lesson page | 🎲 Nouvelle question | **two identical `🎲 Nouvelle question` buttons visible at once** (trainer + Bonus, screenshot 07); step labels jump 1→2→3→5 (4 appears only after rolling) | Rename bonus button `⭐ Nouvelle question` or hide Bonus behind its card until trainer used; renumber (S) |
| Réviser | pick an option | GapPanel below *during* the run | GapPanel mid-run splits attention — show it only on the done screen (it's already there) (S) |
| Practice Index | tap a cell | none | OK — but see §6 emoji headers |

## 3 · Dead-text litmus sweep (Dan's rule: text whose removal doesn't prevent finding the correct answer)

| # | Sev | Location | Text | Call |
|---|---|---|---|---|
| D1 | M | src/app/page.tsx:32-36 | "Behind each Instructional Objective are two sections: a Pre-lesson Pretest Preparation… and a Post-lesson Personal Practice." | Context blurb; the popup's own flaps teach this. REMOVE per litmus. |
| D2 | M | FlipItContent.tsx:278 | Step 1 "SELECT VIEW — USE THE FLAPS OR BURGER MENU ON THE TOP RIGHT" | Pure instruction pointing at a visible control. REMOVE. (Steps 2-4 labels are borderline; the numbered ritual arguably serves sequence on *lesson* pages, but on Flip It "FILTER (OPTIONAL)" and "STUDY / SELF-TEST" label things that are self-evident. Recommend keeping only the ①②③ numerals with 1-word labels, or dropping 1 and 4.) |
| D3 | L | FlipItContent.tsx:329 | "groups + sections + colours rows · sort A–Z via column headers" | Popover helper prose. First half redundant (pressing the button shows it); second half is the only place column-sort is discoverable → keep only "sort A–Z via column headers", or nothing. |
| D4 | L | activities/page.tsx:52 | "Every deck × every activity — tap any cell." | "tap any cell" removable; "Every deck × every activity" is the page's only column legend surrogate → replace whole line with a real legend row (see §6). |
| D5 | L | reviser/page.tsx:93-95 | "Words you've practised that are due again. Answering here reschedules them." | Second sentence is SRS jargon; REMOVE. First sentence defines "due" — keep. |
| D6 | L | PracticeContent.tsx:162 | "Dice practice — sort each item into its correct group." | Fallback prompt; the choice buttons make the task obvious. REMOVE fallback (keep authored `set.prompt`s). |
| D7 | L | LetrisGame study gate | "Take a note of the following items for this round of play." | Wordy; the table + `C'est parti !` carry it. Trim to "This round's words:" or drop. |
| D8 | M | MarkDoneButton.tsx:57 | "Unlocked the next objective · 💎 earned" | FALSE (nothing locks) + explains economy nobody asked about. Replace with "✓ Done · 💎 earned". Idle-state "(up to +10 more for mastered practice)" is tuning-manual text — REMOVE. |
| D9 | L | SioHub.tsx:51,173-201 + SioDetail.tsx:139-146 | LOCKED_UNITS branch, "🔒 Coming soon", "This unit's content is still being finalized" | Unreachable code+text (round-1 U6 leftover). DELETE. |
| D10 | L | letris gallery page.tsx:45-47 | "Words rain from the sky — steer each drop into the right puddle." | It's the game's only instruction before entering; in-game `?` repeats it. Borderline — keep (it's the gallery's value proposition), lowest priority. |

Progress counters, WHY buttons, decorative tiles all conform to the clarified rule — no violations found there.

## 4 · Terminology — current state + unified vocabulary proposal

Current activity naming/emoji across surfaces (deck rail / popup flaps / chips / Index / letris gallery) is now consistent for: Lesson 📚, Flip It 🃏, Say It 🎤, Complete It ✏️, ConjugaZone 🎯, GramMarathon 🏃, Vocabularain 🌧️, Lexicalator 🧰. Remaining breaks:
- **Dice drill has no name**: "Practice 🎲" (rail/Index) vs "🎲 Practice · title" (crumb) vs "Dice practice" (subtitle). Every sibling has a pun name; "Practice" also collides with the generic concept ("Practice Index", "Post-Class Practice"). Propose **"Sort It 🎲"** (matches the It-family, describes the mechanic).
- **Deck study area** (custom decks): tab "Study 🃏" vs crumb "🎴 Flashcards" vs button "🎴 Study cards" (DeckContent.tsx:28/236, study/Content.tsx:40). 🃏 collides with Flip It. Propose "Flashcards 🎴" everywhere.
- **MCQ**: ❓ (deckTabs) vs 🎯 (deck button + crumb); 🎯 is ConjugaZone's. Propose "MCQ ❓" everywhere.
- **Weather unit tab** calls Vocabularain "Letris 🌦️" (src/games/weather/tabs.ts:11) — legacy name leak; rename "Vocabularain 🌧️". Weather "Gapfill ✏️" collides with Complete It's emoji (weather/tabs.ts:10) — use ✍️ or fold into unit page naming.

### The unified vocabulary (recommendation)
**One feedback pair** (French-forward, cognate-safe, matches the most common existing string):
- Right: `✅ Parfait !` — accent-only case: `✅ Parfait ! (accents : {answer})`
- Wrong: `❌ → {answer}` (answer always shown, always speakable via 🔊)
- Single "almost" state (Say It close only): `🟡 Presque !`
Change sites: DiceTrainer.tsx:187,244 (`✔ Correct !`→`✅ Parfait !`, `✘ Presque…`→`❌ → …`); dice PracticeContent.tsx:327-337 (`Correct! The answer is…`→`✅ Parfait !` line + keep answer echo); SayItContent.tsx:76 (`Pas tout à fait…`→`❌ → …` semantics already shown via Expected row — just swap label to `❌`); weather games already conform.

**One restart label**: `↻ Encore !` (decodable English loanword, works in both dialects; ↻ carries meaning even unread).
Change sites: CompleteItContent.tsx:154, ConjugaZoneContent.tsx:106, GramMarathonContent.tsx:128 (`Again`); SayItContent.tsx:326 (`🔁 Recommencer`); PracticeContent.tsx:382-384 (`🎲 Roll again` → `↻ Encore !` — keep 🎲 if wanted: `🎲 Encore !`); mcq Content (`↻ New round`); PretestContent.tsx:361 (`↻ Retry pretest`); PicturePretestContent.tsx:423 (`↻ Guess again`); WeatherMatching/Gapfill/MCQGame + MatchingGame (`Restart`/`Play again` — header pill can stay `Restart` if kept distinct from end-screen, but recommend `↻ Encore !` on end screens, `↻` alone on in-game pills); LetrisGame.tsx:525,699; Lexicalator.tsx:434. Keep `🎤 Try again` in Say It result (it means re-record *this* word, a different verb — rename `🎤 Say it again` to disambiguate).

**One score format**:
- In-run (top bar): `{answered}/{total} · ✓ {right}` — already the drill standard; adopt in Say It (SayItContent.tsx:295-298, drop the inline %), DiceTrainer (129: drop `streak` into the same shape `· 🔥 {streak}` only when ≥2), mcq/dice ProgressBar (`Score 0/16` → `✓ 0`).
- End screen: `✓ {right}/{total} ({pct}%)` everywhere (drill done cards, Say It Terminé, Dice Summary, weather recaps, matching).
- Arcade points (Letris, Lexicalator): keep `Score {pts}` — different genre; plus Letris `+1` per correct drop (round-1 U8) so the number stops looking broken.

## 5 · Delight audit

Where it celebrates today: Letris weather-cycle (night→storm→dawn fanfare) — the app's crown jewel; Letris/Lexicalator credit splashes; Lexicalator combo+lives; dice/mcq recaps with tiered emoji (🏆/🎉/💪) and encouraging copy; Say It 🎉 Terminé; picture-pretest "the real win is the priming"; Practice Index cell hover-grow; hearts/streak/gems chrome on home.

Where it's tedious: the three typing drills end in the app's flattest moment — `Done · ✓ 8/14` + `Again` after up to **64 typed answers** (nationalities: 16 items × 4 forms in CompleteItContent — no chunking, unlike Flip It's subsets); 27-item rain sets (countries) before first clear feels long; Réviser done card is plain; Mark-as-done gives zero feedback for the app's single biggest progress event.

**Top 5 micro-delight additions (zero added cognitive load):**
1. **Tiered recap card for the three drills + Réviser** — reuse the existing dice `Recap` (emoji ladder + one line + `↻ Encore !`). One component, four screens, biggest flatness fixed. (S)
2. **`+1` score float + soft tick on every correct Letris drop** — also resolves U8's "0 points = looks broken". (S)
3. **Mark-as-done celebration** — gem burst / 200ms confetti on the popup button, heart/streak counters pulse on return home. Currently a silent state flip. (S)
4. **Streak flame in the drill top bar** — `· 🔥 4` appears at ≥3 in a row (drills already track score; display only). DiceTrainer already proves the pattern. (S)
5. **Complete It long-deck chunking**: auto-offer "Part 1 of 4 →" for decks >20 questions (nationalities = 64) — borrow Flip It's subset math; ends every 16 answers with recap #1 above. Tedium killer, not just sugar. (M)

## 6 · Cognitive load

| # | Sev | Finding | Fix | Effort |
|---|---|---|---|---|
| C1 | M | **Flip It Overview option overload** (screenshots 08/27): 4 step labels, view flaps, mode switch, ⚙ popover (group/shuffle/notes/sync), rows dropdown, two coupled number inputs (`# subsets of N` — inverse of each other, placeholder `#`/`N` cryptic), S1…Sn chips, per-row switches, per-column hide icons. ~9 control clusters before the first card is flipped. | Default-collapse everything under one `⚙`; replace the twin subset inputs with a single "Split into groups of [10 ▾]"; drop step labels 1+4 (D2). | M |
| C2 | M | **Practice Index emoji-only column headers** (10 columns, meaning only in `title` tooltips — dead on touch). Learner must memorize 10 emoji↔activity pairs. | One legend line under the h1 (`📚 Lesson · 🃏 Flip It · …`) replacing the current subtitle (D4); or rotated text headers. | S |
| C3 | M | **3 visual systems on one screen** in the practice zone (cahier shell + fluo content + slate recaps; 4 font families on Complete It) — see U9. | slate→cahier swap in dice/mcq/pretest recaps first (S); full convergence stays postponed. | S→L |
| C4 | L | **Popup flap colours are positional, not semantic** — hue = list index (SioModal TAB_HUES[i]), so Flip It is purple on one SIO, pink on the next. Colour looks like it encodes something; it doesn't. | Key hue by activity key (stable colour per activity across the whole app — also reinforces the §4 vocabulary). | S |
| C5 | L | **Letris memory demand with no relief valve**: the pre-round study table (📋) is unavailable once play starts; `?` opens how-to-play only (LetrisGame.tsx:511). Blanked-letter night/storm phases are *designed* memory load, but day-phase players can't re-peek the list without Restart. | Add the study table into the `?` overlay (game already pauses on overlay). | S |
| C6 | L | Two emoji-only audio pills 🔇/🗣️ side-by-side in Letris (music vs voice) — which is which is trial-and-error. | title/aria `Music on/off`, `Voice on/off` (overlaps round-1 A5). | S |
| C7 | L | ConjugaZone prompt renders `Je I am a student (m)` — French subject + English predicate concatenated with only a colour shift (ConjugaZoneContent.tsx:110-113). | Separator: `Je — I am a student (m)` or quote the EN. | S |

## Score suggestions (/100)

| Dimension | Round 1 | Now | Why |
|---|---|---|---|
| **UX readiness** | 78 | **81** | U2/U4(part)/A4 fixed and legacy /games cluster removed (+); U1/U3/U5 untouched, restart labels grew to 10 variants, drill placeholders still French-only (−). Fixing U1+U3+U5+Z1-Z3 (≈2 days) would justify ~88. |
| **Visual polish** | 75 | **76** | Slate/fluo/cahier mix and 4-font screens unchanged; only marginal credit for the cluster deletion and consistent flap chrome. |
| **Motivation & engagement** | 85 | **85** | Nothing regressed; nothing added. The drills' flat endings and silent Mark-as-done are the cheap points on the table — Delight top-5 items 1-4 are ~1 day total and would justify ~90. |

## Recommended order (this stream's items only)
U5 (S) → Z1-Z3 (S) → §4 vocabulary batch incl. Z4-Z6 + D8 (M, one PR of string edits) → C2 legend (S) → Delight 1-4 (S each) → U1 single-source tabs (M) → C1 Flip It de-clutter (M) → U7 picture-pretest decision (S) → C3/U9 slate sweep (S now, full later).
