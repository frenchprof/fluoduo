# Round-2 Audit — Functional QA + Learner Journeys (2026-07-04)

Build under test: commit `7a8efba` (out/ verified current — `label:"emoji"` present in chunk 2qsdark4a5m0j.js).
Method: static export served by `python3 -m http.server 4310`, driven headlessly with playwright-core 1.61.1 / chromium-1194. pageerror + console.error + failed-request + HTTP≥400 collectors wired on every page. ~60 pages loaded, 4 full learner journeys executed in persistent contexts.

**Headline: zero pageerrors and zero functional crashes anywhere. One HIGH dead-link bug (nationalities rain link, 3 surfaces, console 404 on every home/activities render). Everything else M/L polish.**

---

## Findings

### F1 · H · Dead 🌧️ Vocabularain link for the Nationalities deck → 404 (3 surfaces)
- **Location (link targets):** `/activities.html` (🌧️ cell in Unité 1 row "Nationalities"), home → Unité 1 → SIO-016 popup 🌧️ flap, `/sio/SIO-016` practice chip. All point to `/games/letris/nationalities`, which is not exported (no such page in `out/games/letris/`).
- **Expected:** every filled index cell / popup flap is a live link ("all cell links valid, no dead cells").
- **Actual:** Next prefetches the route and gets a 404 the moment the link renders; clicking lands the learner on the 404 page. Console error, verbatim, fired on **every** load of /activities.html and of the home page once the SIO-016 popup renders:
  `Failed to load resource: the server responded with a status of 404 (File not found)` (request: `http://localhost:4310/games/letris/nationalities`)
- **Root cause:** `src/content/collections/nationalities.json` has a `gameConfig.letris` block, but `src/games/letris/sets.ts` REGISTRY has no `nationalities` set. Three call-sites gate the rain link on `gameConfig?.letris` instead of the registry:
  - `src/app/activities/page.tsx:30`
  - `src/app/SioModal.tsx:54,72-74` (`hasLetris = !!deck.gameConfig?.letris`)
  - `src/app/SioDetail.tsx:125`
  `src/app/decks/[id]/DeckContent.tsx:248` shows the correct guard (`games.letris && getLetrisSet(collection.id.replace("-letris",""))`).
- **Fix options:** gate on `getLetrisSet()` at all three sites, or register a nationalities letris set.
- All other 249 internal links on /activities.html resolve to a built page (validated programmatically against out/, all 246 unique hrefs).

### F2 · M · Flip It has no 📚 Lesson tab — the one activity with no path into its lesson
- **Location:** `/practice/flip-it/*` (e.g. partitifs, matieres). `FlipItContent.tsx` renders `CahierFrame` with view flaps only (Overview/Cards/All Cards); top bar has only "← FluoLingo".
- **Expected (merge commit a3c2012 intent):** "the deck tab rail … carr[ies] a 📚 Lesson tab". Say It, Complete It, GramMarathon, ConjugaZone, Dice all carry the full deck rail (📚 Lesson first — verified live: complete-it/partitifs → /lessons/partitifs; say-it/manger-boire → /lessons/manger-boire; grammarathon/partitifs → /lessons/partitifs).
- **Actual:** From Flip It a learner cannot reach the lesson or any sibling activity without going back to home. Inconsistent with every other drill surface; the popup flow (Lesson → Flip It) is one-way.

### F3 · M · Weather hub copy says "32 expressions", deck has 23
- **Location:** `src/app/games/weather/page.tsx:12` — "Learn the 32 expressions with flippable flashcards".
- **Expected:** count matches the deck (weather-letris.json = 23 items; lesson page itself says "Pass 1 · 23 cards").
- **Actual:** "32" (digit transposition). Cosmetic but a learner-visible factual error on the unit hub.

### F4 · L · Directions hub tile still named "Practice map" after the Route Builder rename
- **Location:** `src/app/games/directions/page.tsx:22` — tile "3. Practice map · Assemble the route…".
- **Expected:** rename applied everywhere (tab rail and the page itself both say "🧩 Route Builder / Mapless Route Builder").
- **Actual:** the hub tile on the same screen uses the old name. Tab says Route Builder, tile says Practice map.

### F5 · L · GramMarathon apostrophe-gap grading edge
- **Location:** `src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx` `normalize()` (strips `'`).
- **Actual (verified live on faire-activites):** for gap `d'` — typing `d'` → "✅ Parfait !"; typing bare `d` → also perfect (normalize("d'") = "d"); typing `de` → `❌ → d'`. Rejecting `de` before a vowel is defensible pedagogy, but accepting bare `d` while rejecting `de` is inconsistent. Judgement call; flagging only.

### F6 · L · Weather Gapfill wrong answer has border-only feedback
- **Location:** `/games/weather/gap`, `WeatherGapfillGame.tsx` (verdict "bad" → rose border on the input; attempts counter ticks).
- **Actual:** no ✗ text, no message, no aria-live; a colour-blind or screen-reader learner gets no signal. (Round-1 A5 family — still open here.)

### F7 · L (known, round-1 U5, not a regression) · Double "← FluoLingo ← FLUOLINGO"
Still present in the top bars of Complete It, ConjugaZone, GramMarathon (seen verbatim in every text dump of those pages). Was not in the #18 quick-win batch; recording that it remains open.

### F8 · Info · /hidden/vocabularain.html holds a live Firestore Listen channel
Page loads and renders fine (no console errors), but it is the only page that opens a persistent `firestore.googleapis.com/...Listen/channel` connection (leaderboard) — it never reaches networkidle. Perf-stream note.

### F9 · Info · Hosting dependency reproduced (round-1 O2 still true)
`python3 -m http.server` behaves like a naive host: clean URLs don't resolve (all testing used `.html`), and a nonsense URL (`/definitely/not/a/page.html`) returns the server's raw 404 ("Error response · Error code: 404 · Message: File not found"), not the branded `out/404.html` (which renders fine when fetched directly: "404 — This page could not be found."). Deploy config must map both.

---

## What passed (verified live, per brief)

### New-since-round-1 features
- **/activities.html Practice Index** — 5 unit sections (Unité 0–4), 550 cells, 248 linked; deck × 10 activity columns with tooltips; ALL links except F1 resolve (programmatic check of all 250, not just 20). Empty cells are honest "·" dots — gating matches the readiness registries (dice/conjugazone/grammarathon/lex) and UNIT_PAGES; no dead cells that should be live found besides F1.
- **Lesson↔SIO merge** — lesson pages partitifs / aimer / manger-boire carry their deck's activity tabs (Say It / Complete It / GramMarathon or Lexicalator, correct deck ids incl. aimer→aimer-activites). revision-u1 / u3u4 / u4 keep the 📚 Lessons gallery tab → /lessons. Deck activity pages (Say It / Complete It / GramMarathon / ConjugaZone) carry 📚 Lesson → correct lesson (flip-it excepted, F2). SIO-001 popup flaps: 📚 Lesson → /lessons/se-presenter; SIO-015 popup: Pre-Test (inline, active span) + 📚 Lesson → /lessons/articles-pays + full activity flap set.
- **Flip It** — column header is "emoji" (weather-letris, countries-letris, nationalities; hidden entirely on decks with no visuals: matieres, professions — their items have 0 emoji, correct per the no-visuals filter). English column present on matieres, weather, professions, countries (all show "English"; nat deck shows the 4-form columns instead, languages deck relabels to "language"). Group-by le·la on matieres → section header rows le / la / l' / les in **both** Overview and All Cards (verified in each view). Step-1 label reads "Select view — use the flaps or burger menu on the top right". Directions deck shows exactly 15 rows, all full phrases (Vous sortez du parc … Vous êtes arrivé(e)) — no role: fragments. Test Yourself works: art select + text input, right answer ✓, wrong answer ✗ with correction revealed ("le dessin").
- **GramMarathon faire-activites** — exactly the 8 negation items play (all 8 seen in one run, nothing else), gaps accept "de" and "d'" where each is the answer, Enter grades → Enter advances (whole run keyboard-only), finishes "Done · ✓ 8/8" with Again.
- **Rain (countries)** — study popup: "Take a note of the following items for this round of play." + exactly 4 items per category (5 categories). Restart (in-game Restart button) reopens the study table with a **different** hand. Palette on the bases/landed tiles is the darkened set — computed rgb(198,40,40), rgb(13,106,168), rgb(46,125,15), rgb(123,63,181), rgb(168,91,0) match PALETTE hexes.
- **Weather unit** — hub/lesson/match/mcq/gap all in cahier skin with the 6-tab rail, all playable: matching pair scored (Matched 1/23 · 100%), MCQ graded with ✗ on pick + ✓ on answer + "❌ → Il pleut" + Next, gapfill Check/Show answer/Next cycle works. Letris tab → /games/letris/weather.
- **Directions unit** — hub/lesson/map/matching in cahier skin. Map page is "🧩 Mapless Route Builder" with A→B route assembly (verbs + completions; "Vous sortez" + "du parc" built the route, Undo/Clear/New route/Speak present). Matching: verb+completion pair scored (Pairs 1/13 · 100% ✓).
- **SioModal** — role=dialog + aria-modal; on open, focus is on the ✕ (BUTTON aria-label="Close"); Escape closes. (Round-1 A1 fix holds.)

### Learner journeys
- **J1 first-timer** (one context): home → SIO-001 popup → all 6 inline s'appeler MCQs answered — feedback is solid-fill colour (wrong pick red rgb(192,57,43), correct revealed green rgb(23,138,77)), English gloss reveals after pick, WHY pill appears top-right on a wrong pick only and explains that choice ("m'appelle goes with je.") → 📚 Lesson flap → /lessons/se-presenter (client nav) → dice trainer cycled ★ Facile (option buttons) / ★★ Intermédiaire (dropdown) / ★★★ Difficile via "— change" → browser back to home (accordion state preserved) → popup → 🃏 Flip It /sappeler → Test Yourself graded (✗ + correction "Je m'appelle Léa.") → Complete It /sappeler full 10-item run, Enter→Enter rhythm, ends "Done · ✓ 0/10" + Again. No console errors the whole journey.
- **J2 unit-1 flow**: SIO-015 popup (pretest renders INLINE in the popup body — 25 country-article questions; also verified the standalone /pretests/u1-sio015.html: answer graded ✗/✓ with Next) → Flip It countries (emoji header, 2 rows marked Reviewed → "✓ Reviewed · 2") → Rain countries: 14 drops steered (13 correct, 1 deliberate wrong ALLEMAGNE→LES), match-3 clears fired, Score 80, no game over → home. **Persistence after hard reload:** `fln-buckets:countries-letris` = 2 items "reviewed" (survives reload), hearts still ❤️×5, 🔥 0 💎 0. No `fluolingo:progress` key exists — nothing in this journey writes it (gems/streak only on SIO self-mark; hearts only decremented by Match It wrong matches; pretest deliberately writes nothing; rain has no progress write-back). That is per design, but it means a full pretest+flip+rain session leaves the home HUD untouched.
- **J3 revision**: /lessons/revision-u4 → 16 mixed rolls answered — questions verifiably interleave source lessons (fréquence word order, manger-boire conjugation, futur proche + negation…), counter/streak live ("✓ 4/16 · streak 2"). Bonus trainer: roll → "I eat some bread." → typed wrong → "✘ Presque… Je mange du pain." → 🏁 summary "Résumé — Bonus · 0% (0/1)" with the attempt log.
- **J4 index-driven**: /activities.html cells → dice/tu-vous, conjugazone/etre-etudiant, letris/countries, conveyor/colors, say-it/matieres — all five load into working activity screens via client-side nav (only console noise: the F1 prefetch 404).

### Extras
- **Mobile 390×844** (touch context): home no horizontal overflow; SIO popup opens full-width (390px, no overflow) with all flaps reachable; Flip It hides the side rail, ☰ burger shows the 3 view buttons and switches to All Cards; rain study popup + board fit; lesson page + trainer fit. Zero mobile console errors.
- **Browser back** from all 13 game/drill types (flip/say/complete/dice/conjugazone/grammarathon/letris/conveyor/weather match/mcq/gap/directions map/matching) returns to /activities.html cleanly, no errors.
- **Nonsense URL**: see F9.
- **Console-error sweep**: all 24 lesson pages + lessons index + reviser + letris gallery + 2 pretests + 2 /sio pages + deck study + 6 more practice/game pages — 39/40 clean (the 40th is F8's networkidle artifact, page itself fine).
- **Round-1 regression spot-checks**: A1 (modal Escape/focus) ✓ holds; A2 (darkened rain palette) ✓ holds; A4 Enter→Enter ✓ holds in Complete It, GramMarathon AND ConjugaZone (verified: Check ❌ → Enter advances 0/14→1/14); U2 dead "Apps & Games"/"Practice Zone" labels gone from source; U4 🧰 Lexicalator emoji consistent in popup flaps.

## Not tested / out of scope
- Say It microphone grading and real TTS audio output (headless; round-1 O3 still stands — needs one manual device pass).
- Signed-in experience: `REQUIRE_SIGN_IN = false` in this build (round-1 O1 still stands); Firestore sync, feedback submission, rain hi-score leaderboard writes untested.
- Hearts decrement path (Lexicalator wrong-match → heart loss → home HUD): the conveyor belt game wasn't drivable to a controlled wrong match headlessly in the time budget; hearts persistence was only verified as "stays at 5 when nothing spends it".
- Real-host clean-URL routing (F9 — environment reproduces the naive case only).
- prefers-reduced-motion behaviour (A3) — not re-verified this round.
