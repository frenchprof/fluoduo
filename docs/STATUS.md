# STATUS — the one place that is true (22 Aug 2026)

Every agent (Claude Code `main`, Peers, Cursor, Claude Chat, Cowork PM) reads
**this file first** and updates it before ending a session. `HANDOFF.md`, `TODO.md`,
`docs/planning/UI_WORK_PLAN_1.md`, `docs/audit/` are HISTORY — useful for the *why*,
wrong about the *what's left*. If they disagree with this file, this file wins.
Only ONE agent edits this file at a time; say so in your commit.

## Where the code is

- `main` on `frenchprof/fluoduo` (origin) — the working repo.
- Production = `dckg/fluo` (remote `live`), Cloudflare Pages project
  `fluolingo-dot-com` auto-builds its `main`. **Deploy = `git push live main`.**
- 17 Aug, morning (on `main`, deployed at `3453b1e`): SIO-036/040 softening +
  `envies-besoins` gap fix; SIO objectives doc; PR #19 grading unification (had
  never been merged); PRs #18/#20 finally deployed; STATUS.md born.
- 17 Aug, afternoon (built by the Cowork PM session in seven patch files, applied
  by Dan with `git am`): the whole remaining UI programme — see the table.
- 20 Aug (Peers): PR #24 merged — the 3-Aug game-content port (LexicaLater
  phrase integrity + live misses, Commerces +7, beige livery — 19b baseline
  506 → 508 with Dan's OK, nationalities withdraws from LexicaLater);
  then the 3D-camera rework (row 25e) merged and the lot deployed to live
  on Dan's word ("deploy").
- 20–21 Aug (Peers, Dan's verdict rounds on the live camera): PR #26 —
  rounds 9–10 (road owns the frame · flat solid-colour buttons, dashed ring
  retired · gentle-S snake · tall grounded flanks · giant trees) — and
  PR #27 — round 11 (**the map moves to /carte**: finger-scroll fought the
  Home page; Home links there with one card, all old `/?unit=N#SIO` deep
  links + printed QRs forward; hover titles on all roadside; passed things
  exit through the frame; 2D zoom = number + milestone dropdown; side rail
  = one-flap accordion). Both merged on green and deployed by Dan.
  Ops PRs #28 (checkout/setup-node v5 — Node 24) and #29 (pages-preview
  guarded to frenchprof/fluoduo — it 404'd on dckg where Pages is off).
  Still red everywhere: claude-review (ANTHROPIC_API_KEY/billing — Dan).
- 21–22 Aug (Peers, on Dan's ask): **old-vs-new comparison of the colour
  review's 31 artboards** before any live change. All 31 mockups rendered,
  the matching live routes screenshotted from `main` (seeded progress;
  `REQUIRE_SIGN_IN` flipped locally for the shoot and reverted, as patch 23
  did), five reviewers judged each pair against the decided rules (litmus,
  two-mark hero, no variable rewards, soft daily goal, streak spec).
  Verdict: **0 ship-as-is · 17 ship-with-changes · 12 skip · 2 dead**
  (Hero-marks = the 19 Aug decision re-broken; Variable = Dan's "none").
  Systemic finding: nearly every mockup re-adds inline explainer text and
  French UI chrome. Gallery + per-surface verdicts: Claude artifact
  "Redesign Verdicts" (Peers session). NOTHING from the review is live.
  Round 2 on Dan's "not accurately paired": the launcher/Index, empty-state
  and sign-in-gate captures were replaced with driven in-activity states
  (real drills, mid-game boards, active reviser queue, GameOver, DrillShell
  tray, Menu popup); leaderboard is marked "behind sign-in, judged from
  code". Verdicts re-checked against the true pairs — counts unchanged.
  Also from Dan, 22 Aug: **he cannot read the Index** ("I really don't
  understand how to read it") — the U0–U4 cell grid and the per-row big
  circles carry no key. Open design item, not yet assigned.
- 22 Aug (Dan's votes on the 31 numbered surfaces + round 13, Peers):
  **Approved** 2 SpecuLearn · 3 xPlain (**rename xPlain → "Memo"
  everywhere**) · 5 4Mémoire (English chrome only) · 6 iComplete ·
  7 ConjugaZone · 9 WorDrill · 10 VoixLà · 11 ComposeIt · 12 ChaTutor ·
  13 NumBus · 14 NumBourse · 17 DéjàRevu · 18 GramMarathon · 19 My
  Progress · 21 Leaderboard WEEKLY variant · 23 Install prompt · 24 Home
  retention direction (subordinate to the round-13 hero below) ·
  25 Celebrations · 26 XP float · 27 Streak page (to the approved streak
  spec) · 28 Session receipt · 30 Boutique. **Rejected** 1 Menu ·
  4 EtuDice · 8 ÉcouTexte · 15 VocabulaRain · 16 LexicaLater · 20 straight
  Leaderboard · 22 Profile (29/31 already dead). Every build carries the
  gallery's required-changes list; interfaces English except the set
  French surfaces. Relayed to the colour-review session (its build queue).
  **Round 13 (PR #31, Peers)**: hero = ONE strip of the two marks + worded
  Rewind (/reviser) · Play (current stop; the old Continue) · Menu; the
  full-width Continue gone; 🔍/🏆 off the top bar (search = Index's box,
  ranking = /leaderboard); Home postcard in a recessed mat; /map behind a
  "Tap to use the map" glass; 3D `MAX_BEHIND` 4 → 8 + gates/arch/finish on
  the same behind curve — everything now leaves through the bottom edge
  like the stops (Dan's round-13 note). verify25 §3 rewritten to this
  decision. **MERGED to main (ff66caf) on Dan's word, 23 Aug** — the merge
  rode over the colour programme's landing: the hero conflict resolved to
  BOTH instructions (21 Aug five-equal-cells geometry × 22 Aug words —
  Rewind › with the due badge · Play › · Menu), and two main-side CI reds
  were fixed en route (progressMerge's @/ alias broke its runs-in-node
  contract → ./dayKey.ts + allowImportingTsExtensions; verify21's
  allowlist pin predated weekXp/weekKey). NOT yet deployed — Dan's
  `git push live main`.

- 23 Aug (content session): **six missing xPlain/Memo lessons authored** from
  the content audit's gap list — `tu-vous`, `salutations` (U0), `professions`,
  `nationalities` (U1), `meteo` (U3, weather-letris deck), `aliments` (U4) —
  each a NativeLesson (Mémo + dice generator + 10 EN→FR bonus) registered in
  `LESSONS` + `LESSONS_BY_SIO` (SIO-002/009/012/016/031/041). Checked against
  Dan's uploaded Atelier unit PDFs: tu/vous question order follows piste 4
  (« Vous vous appelez comment ? »), the nationality memo mirrors the U1
  « accord » box (+e / +s / -ien→-ienne), the partitive meal sentence is the
  book's own (« Le midi, je mange de la viande et je bois de l'eau »). NOT in
  the deck and therefore left out (flag for Dan): the book's « C'est nuageux /
  ensoleillé » fourth weather frame, and « canadien » (the U1 table's -ien
  example — the deck's tunisien stands in). tsc, eslint and all 25 verify
  suites green.
- 24 Aug: **approved surface #3 executed — the activity "xPlain" is renamed
  "Memo" throughout the site** (Dan's 22 Aug vote). Display rename only: the
  registry name in `src/content/activities.ts` (`key: "lesson"`) is now
  `"Memo"`, which propagates to the Menu tile, rail flap, popup flaps, Index
  pill and every other surface that reads the registry; the key, routes and
  identifiers are untouched. Comments describing the learner-visible name
  updated (CahierShell, RailGroups, MenuSplash, activities page, indexMatrix);
  verify pins updated with dated comments (verify19, verify24, verify29-rail);
  About page's "Mémo" normalised to "Memo" (English chrome). No ÉcouTexte
  "Memo" topic exists — no collision. `out/` static export still says xPlain
  until the next build/deploy. tsc + all verify suites green.
- **22 Aug (this session): the colour + retention programme is MERGED TO `main`
  and awaiting deploy.** `main` = `2a729fb`. Contains: the seven `--dopa-*`
  roles + three accessibility fixes; the `--gram-*` gender mapping (98 sites,
  7 masc / 6 fem / 85 that were never gender); the top-bar overflow fix (at
  320px only 4 of 6 icons were reachable); the retention build (PWA manifest +
  install prompt, eight reward moments on a size ladder, floating +XP, session
  receipts, weekly leaderboard); and the `--fam-*` family axis, which colours
  all 50 routes from `CahierShell` alone. **`/moi` and `/profil` are exempt by
  design** — they carry their own five-row colour scheme and `familyOf()`
  returns null for them, so they render exactly as Dan's handoff left them.
  Five new verify suites in CI (31 topbar · 32 retention · 33 family · 34
  dopamine, plus main's 30 profile). **NOT YET DEPLOYED — see below.**

- **23 Aug (content agent): GramMarathon gap items authored for nine decks
  that had zero** (from the content-audit GAPS.md high-value list):
  possessives +10 · aller-destinations +10 · quand-time +10 · avoir-etats +10
  · demonstratifs +10 · professions +12 · weather-letris +12 · frequence +8 ·
  question-words +9 (= 91 new items, JSON-only, appended — no existing item
  touched; each new item is a full `fr` sentence + `en` gloss + `gap`, pattern
  A like partitifs). All pass `isPlayableGap` with a unique word-boundary
  occurrence; every deck now clears MIN_GAPPED, so the 🏃 flap appears.
  Sentences were checked against Dan's uploaded Atelier unit PDFs (per-unit
  teacher guides) — patterns confirmed verbatim (e.g. « Tu vas au cinéma »,
  « le lundi à 18 h », « Il fait 16 degrés », « Qu'est-ce que tu fais ? »,
  « Cette orange est délicieuse »). Flag for Dan: weather items keep the
  deck's il-y-a column for « du soleil »/« du vent » (Atelier agrees; « il
  fait du soleil » colloquialism rejected as wrong by the drill);
  question-words-14 answers in euros (money formally lands in U4);
  frequence keeps « parfois » (Atelier bilan uses it too, lessons use
  « quelquefois »). verify23/24 green, tsc clean. NOT deployed.

- 23 Aug (content agent, finishing pass on the wave): the two letris/EtuDice
  decks the wave skipped for concurrent edits are DONE — `numbers-70-99`
  (bands 70–79/80–89/90–99, all 30 `col:num` tags retagged, parked scratchpad
  spec executed) and `question-words` (`gameConfig.letris` on the Atelier U0
  « Suivez le guide ! » axis — the book sections its intro BY question word —
  columns WHAT/WHO · WHERE/WHEN · HOW/WHY · HOW MANY, 8 items tagged;
  est-ce que + the inversion sentence have no wh-category, left untagged;
  the 9 new gap items untouched). Also removed partitifs.json's 6 dead
  `syllables` arrays (q01–q06 — the flagged pre-existing bug; fr kept).
  verify23/24 green, tsc clean, CONTENT_FLAGS updated. NOT deployed.

- 23 Aug (content agent, syllabus-audit fix wave — **under Dan's SIO freeze:
  the 50 SIOs' structure, ids, units and relative positions are UNTOUCHED**
  (`src/content/sios` read-only — course map, deep links and printed QRs
  depend on them); every fix landed INSIDE existing decks/lessons/ateliers):
  six audit findings fixed in place, each verified against the uploaded
  Atelier unit PDFs — (2.1) **ne… plus**: 6 items negpas-15–20 + a third
  « ne … plus » letris column in `negation-pas` (« Le stylo n'est plus sur
  la table » is U2 p. 67 verbatim), plus row added to the negation lesson
  memo; (2.2) **well-wishes**: 3 lines in the SIO-030 atelier email
  (bon anniversaire · bonne chance · bon voyage — bonne année/bonne fête
  don't fit the email's narrative, so they live in the deck + palette),
  all 5 formulas as `vouloir-inviter` 15–19 (gap = Bon/Bonne, the agreement
  point), EMAIL_BANK Souhaits palette completed; (3.2) **nuages family**:
  des nuages (il-y-a) + nuageux/ensoleillé under a NEW fourth C'EST letris
  column in `weather-letris` (45–47), meteo memo carries the fourth frame
  (closes the 23-Aug « fourth frame » flag; the dice keeps its 3 verb
  frames); (1.4) `questions-oui-non` + `mots-interrogatifs` unit labels
  1 → 3 in `lessons.ts` (est-ce que is U3; SIO-035 mapping was already
  right, nothing else keys off the labels); (3.3) **venir**: sentence cards
  en-au-aux-a-18–21 = the book's Au tableau rows (de/du/des/d' — the U3 PDF
  p. 97 DOES teach venir, so no Dan bounce needed); (3.5) **il faut out of
  textgen/unit3** — the U3 PDF's directions never use falloir; the three
  variants now read « vous prenez la … rue » / « vous tournez … au
  carrefour » (piste 66 + directions-matching verbatim) / « on peut
  prendre … » (SIO-040 atelier frame — no imperative, guard-rail intact).
  Flag for Dan: the negation lesson stays labelled unit 1 while its memo
  now also shows ne…plus (négation (2) is U2 — the deck that drills plus
  IS unit 2). ALL 25 verify suites green, check-textgen units 0–4 green,
  tsc clean, all four edited JSONs valid. Audit doc rows marked
  « FIXED 23 Aug (in place) ». NOT deployed.
- 23 Aug (content agent, audit row 3.1 — **e-carte postale, Dan's decision:
  "add a washed down version to the email and present the full activity in
  040"**, SIOs untouched): (a) EMAIL_BANK (SIO-030's rail) gains a holiday-note
  flavour — « Où je suis » + « Raconter » palettes (Je suis à Paris/Nice/
  Singapour · J'aime / je fais du sport / je vais à la plage / C'est super, all
  U0–U2) and a fifth rotating occasion (« un petit bonjour de voyage » 🏖️ with
  its own task line); NO weather there (U3). (b) NEW production bank
  **POSTCARD_BANK « L'e-carte postale »** (id `e-carte-postale`, 🏖️, solo +
  aiCheck) on SIO-040's rail, structured per the guide's atelier spread (U3
  PDF p. 20 / p. 111): opening → where (je suis/on est à…) → weather (the
  weather-letris family incl. the new nuageux/ensoleillé/des nuages) → doing
  (je visite · on peut visiter · on prend le métro) → closing (Bises ·
  À bientôt). Mechanism: `composeBankForDeck` → **`composeBanksForDeck`**
  (banks.tsx) and deckActivityTabs (CahierShell) now maps EVERY bank on a
  deck — first flap keeps the registry ComposeIt chrome (and the Index's
  compose cell), later banks fly their own title+emoji with unique keys.
  tsc clean, verify23/24/28-trackd green, eslint clean on touched files.
  Audit row 3.1 marked RESOLVED. NOT deployed.
- 24 Aug (content agent): **SpecuLearn opened for colors, transport,
  objets-articles** per Dan's approved item sheet (SPECULEARN_ITEMS.md) +
  his three same-day amendments. Playable: colors 11/12 (colors-12 le beige
  dropped — no swatch exists) · transport 9/12 (the three `prendre le/la/l'…`
  verb phrases excluded — image-twins AND the only way to keep the deck one
  grammatical category, en/à prepositional phrases only) · objets-articles
  20/20 (all playable: the six items with no honest emoji — gomme,
  agrafeuse, portefeuille, trousse, mouchoirs, passeport — got purpose-made
  flat SVGs under `public/objets-articles/` instead of a forced emoji stand-
  in, so nothing needed banning). New `SPECULEARN_ITEM_IMAGES` (id → SVG
  path) in speculearnReady.ts lets a deck MIX emoji and per-item images —
  chosen over an aliments-style whole-deck photo bank because it changes
  less (the DevItem type already carried an optional `img` alongside
  `emoji`; only buildItems()'s filter/map needed touching) and the other 14
  objets items already had an honest emoji. New `SPECULEARN_PROMPT_FRAME`
  (deckId → question, transport: "Tu y vas comment ?") renders lang="fr"
  above the options — the en/à answers are responses to that question, not
  free-floating nouns. Category-purity comment + exclusion reasons live
  next to `SPECULEARN_EXCLUDED_ITEMS`. Emoji added to colors.json (11),
  transport.json (9), objets-articles.json (14) — only where PLAY, never on
  colors-12 or the three prendre-* items. tsc clean, all verify suites
  green (verify-grading, verify-reports, verify18–34), check:short/
  check:textgen green. Screenshots (390×844, port 3777, REQUIRE_SIGN_IN
  already false from a concurrent session — not touched): colors shows
  swatches with beige absent; transport shows the « Tu y vas comment ? »
  frame; objets-articles rounds show the SVGs (agrafeuse/trousse/gomme/
  passeport/mouchoirs/portefeuille all observed rendering distinctly from
  their emoji deckmates, incl. the passeport booklet vs 🪪 carte
  d'identité). NOT deployed.

- **24 Aug (Cursor session, STATUS holder for this edit): reconciliation + Dan's
  rulings on the content flags.** No code changed. Three corrections to this file:
  (a) the "NOT deployed" tails above are STALE — `main`, `origin/main` and
  `live/main` are all **`919a1c2`** (PR #33), so everything through the syllabus
  fix wave and the e-carte postale IS deployed; (b) the Deploy section below still
  cited 22 Aug / `1a29278` — corrected; (c) two CONTENT_FLAGS reds were already
  closed by the 23 Aug fixes and had not been struck (boissons folded into
  `aliments.json` as `col:boissons`, so `check-textgen` is green on all five units;
  the weather fourth frame shipped as items 45–47).
  Independently re-verified this session: **all 25 verify suites exit 0**, `tsc`
  clean on `src` (the errors a local run shows come from 16 gitignored `patch*/`
  scratch dirs, not the tree), eslint **115 errors / 20 warnings** — matching this
  file's own figure.
  **Dan's five rulings, 24 Aug** (detail + reasoning in
  `docs/CONTENT_FLAGS_2026-08-23.md`):
  1. « Il fait du soleil » stays WRONG — the Atelier corrigé is the examined
     standard. No change.
  2. `frequence`: « parfois » and « quelquefois » are **presented together as
     equivalent** — the drill accepts either, the lesson shows them side by side.
     TO BUILD.
  3. `possessives` (SIO-022): the gap is deck-vs-**SIO**, not deck-vs-book — the
     deck drills three first-person columns while SIO-022's competence asks for
     the full paradigm by gender/number. **BUILT the same day — see the 24 Aug
     possessives entry below.** SIO text untouched (freeze holds).
  4. SpecuLearn: real count is **15 served / 29 unserved**, not 38. The 21
     grammar/function decks are **permanently excluded** (undrawable); emoji
     authoring approved for colors, core-nouns, days, matieres, objets-articles,
     professions, transport. TO BUILD.
  5. Pre-tests absent on the 6 production ateliers: **by design**, assessed in
     class. Flag closed.
  Still unassigned and the one user-facing failure on the board: **Dan cannot read
  the Index** (22 Aug) — the U0–U4 cell grid and the per-row circles carry no key.

- **24 Aug: possessives drill the whole paradigm (SIO-022).** Dan said GO with all
  six persons. **This supersedes ruling 3 in the entry above and the wording
  committed in `ca761e9`, both of which said "re-gear the letris columns to
  masculine/feminine/plural". That route was wrong** — `prefix` lives on the
  letris *column*, never on the item, and seven consumers build their phrase from
  `column.prefix + item.fr`, so the person would have had to move into `item.fr`
  and put « ton stylo » on the tile face. Answer on the front of the question.
  Rejected; **do not re-propose**. The letris board is untouched (three columns,
  MON/MA/MES, prefixes intact).
  What shipped instead follows the `nationalities` pattern already in the repo
  (`item.nat` + `NAT_SUBJECT`): each of the 21 `col:`-tagged nouns expands into
  six Complete It questions, the prompt gives the English cue (« your (sg) ·
  pen ») and the learner produces « ton stylo ». **136 questions, up from 31.**
  Two defects closed at once — the paradigm was 1st-person-only, AND the prompt
  used to *print* the possessive (« mon book » → type « mon livre »), so nothing
  was selected. That giveaway is gone; the two behaviours are not both live.
  The forms are derived rather than stored (possessives are regular; the noun's
  agreement class is already declared by its `col:` tag), so **no schema field was
  added** — the opt-in is IMPLICIT: `CompleteItContent.tsx` detects the expansion
  by checking whether a deck's Letris columns are the literal keys `mon`/`ma`/`mes`
  (`POSS_COL_AGREEMENT`, keyed on those three strings exactly). Nothing in the
  code or the deck JSON names this deck as "the possessives deck" — the column
  names ARE the switch. Renaming those three columns for any reason would
  silently turn the expansion off and restore the original giveaway (the prompt
  printing the possessive, « mon book » → type « mon livre » — see above), with
  no error, just 31 questions again and no warning to whoever made the rename.
  `verify/verify35-possessives.py` (39 assertions) is the tripwire that fails in
  that case; wired into `verify.yml`, per that file's own rule that a check CI
  never runs is not a check. **Undecided:** whether to replace the implicit
  column-name detection with an explicit opt-in — e.g. a `gameConfig.completeIt`
  flag on the deck — so the switch doesn't ride on a naming coincidence. Raised
  with Dan 24 Aug; his answer at the time was "I don't understand the question" —
  still open, not re-raised since. The "(m)"/"(f)" gloss
  is stripped from the cue — that marker IS the answer — and the gender is offered
  on the ? ladder instead, per the litmus test (help on demand, never inline).
  Verified: **26 verify suites green** (the 25 that existed plus this one),
  `check-textgen` green on all five units, `tsc` clean on `src`, eslint **still
  115 errors / 19 warnings** (errors unchanged; one warning fewer, a dead `isNat`
  went with the de-duplication).
  Noticed in passing, NOT fixed: `verify/verify31-wordrill.py` exists but no CI
  step runs it — the same gap the Reports check once had.
  Still TO BUILD from the 24 Aug rulings: the parfois/quelquefois equivalence
  and the SpecuLearn emoji for the seven concrete-noun decks.

- **24 Aug (Cursor session, sole STATUS holder for this edit): the old site vs this
  app, committed.** Docs only — no source touched. Two new documents:
  `docs/REGRESSIONS_VS_WITHDRCHAN.md` (the comparison, merging an evidence-based
  audit with a second agent's learner-experience analysis and correcting the
  latter's four factual errors) and `docs/OLD_SITE_AUDIT.md` (the evidence base —
  all 18 modules of `french.withdrchan.com` read off the shipped HTML; it lived in
  the gitignored `patch-shots/` and would have been lost).
  **Headline: the app got structurally stronger and pedagogically thinner.** The
  gains are architecture — sequencing, spaced repetition, tracking, speaking and
  listening, scale, navigation between stops, no roster in the client bundle, and
  a far better answer to a wrong answer (`feedback.ts` classifies nine kinds of
  error and scores an accent-only answer *partial*, against the original's one
  flat line in 14 of 18 modules). The losses are explanation and agency — the why
  behind the form, the concrete "you will be able to say…" promise, the unscored
  self-check, the first-person French controls (`Je vérifie`, `J'écoute` — swept
  by `12bd816`'s english-first chrome), and an Index whose marks Dan cannot read.
  **The open decision: whether difficulty and question-aim become choosable
  again** — framed in the doc not as "restore the tiers" but as "they were
  abandoned twice already, by modules 17 and 18, before FluOlinGo existed; decide
  deliberately this time." Figures re-measured this session: 50 SIOs · 44 decks ·
  883 deck items · 31 native lesson files (32 registered) · 30 of 31 carry a bonus
  bank · 35 pretests · 20 activities · **24 of the 50 SIOs have no authored
  lesson** (my brief said ~19). Verification unchanged as expected for a docs-only
  change: all 26 `verify/verify*.py` green, `tsc` clean on `src`.

## Programme — done

- **23 Aug (Peers, the content-gap wave + visual unity): eight authoring
  agents filled the audit's gaps, each self-checked against Dan's uploaded
  A1U0–A1U4 Atelier PDFs.** New: ÉcouTexte generators for units 0/1/2
  (9 scenarios, registered; picker's "coming soon" gone); 6 xPlain lessons
  (tu-vous, salutations, nationalities, professions, meteo, aliments);
  91 GramMarathon gaps across 9 decks; 91 LexicaLater syllabifications
  across 6 decks; 8 VocabulaRain sets (days, alphabet, numbers ×3,
  languages, nationalities, aimer-activites); letris/EtuDice columns on 8
  decks; 2 wiring fixes (marche bank → commerces; modaux slug aliases).
  check-textgen now harvests `nat` forms and carries units 0–2; its unit-4
  « jus, thé » red is the missing ★ boissons deck (Dan's placement). ALL
  judgment calls in docs/CONTENT_FLAGS_2026-08-23.md for Dan's book check.
  **Visual unity (Dan's picks)**: heading band VARIANT A — every family
  page opens with the profile-style band (PageBand via CahierShell: name in
  **Dan's own FluOlinGo Hand OTF** (src/fonts, next/font/local), one number
  right on the hl chip); duplicate h1s stripped from reviser/tts/tutor/
  leaderboard; **/map back inside the cahier** (the tap-glass killed the
  scroll conflict that justified its bare interface — 21 Aug ruling
  superseded by Dan's 23 Aug "cahier set to the left" rule). **PR #32
  MERGED (3c58e35) on Dan's word and DEPLOYED — Dan pushed live/main
  3c9bcb2 → 3c58e35, 23 Aug.** Still open for Dan: strike-outs in
  docs/CONTENT_FLAGS_2026-08-23.md; the ★ boissons deck placement;
  SpecuLearn's 38 guessability calls; the Index legibility fix (not yet
  built); claude-review fix-or-delete. **Existing content audited against
  the Atelier PDFs** (all 63 pages): 38 findings in
  docs/SYLLABUS_AUDIT_2026-08-23.md — headline gaps: U2 « ne… plus »
  taught nowhere; SIO-030's well-wishes are a phantom; U3 nuages family
  undrillable; U4 boissons hole confirmed; two U1-labelled lessons
  front-run the book (est-ce que is U3). Fix wave MERGED (PR #33, 919a1c2) and **DEPLOYED — Dan's live push confirmed 23 Aug** (live/main = origin/main = 919a1c2): six in-place syllabus repairs (SIOs frozen), boissons closure, the e-carte postale at stop 40 + washed-down email flavour, negation lesson → unit 2 on SIO-028's rail.

| Patch | What | Check |
|---|---|---|
| 1–22 | data layer, curriculum spine, PII split, bottom bar, Cahier tokens, HELP from the registry, DrillShell, lesson pager, English-first, cohort filter, hero shrink | verify18–22, 25 |
| 25 | **Home path**: 2D map per Design (region bands, kind-coloured stops, ▶ current, 🚩 class flag, zoom), 2D ⇄ 3D toggle (3D ported from La Carte, ring colours from `sioKind()`), `short` labels + build check, `/unit/N` deep link, A4 print with QR per unit | verify25b (38) |
| 25c/25d | **Home map 3D view = Dan's Figma Make** (ported 19 Aug, `pm/home-map-figma-3d`): first-person camera on the snaking road, depth-scaled stops, world gate signs, Peers' roadside props, trees, clock-driven sky, 🏁 arch; 📍 recentre | verify25c (61) |
| 25e | **3D camera = Candy Crush register** (Peers, 20 Aug, eight rounds against Dan's captures): mini-planet camera — six-station chain on a beaten path sunken between coloured banks, stations = oblate buttons on road-pad spots, tip-first rises over a scalloped terrace lip (`reveal` + `clipRise`), water at the lip's foot, the NEXT region's land beyond with far dressing on parallax, roadside clamped clear of the road (`placeAt` verge), no pinch zoom. Knobs now `FULL_AHEAD`/`MAX_AHEAD`/`SIZE_FALLOFF`/`HORIZON_Y 0.46`/`SKYLINE_Y 0.2` | verify25c (64) |
| 23 | **Games**: `GameFrame` + GameBar v2 on all six, 100dvh boards, per-game headers/instructions gone, game-over post-mortem, misses → ReVue + `CORRIGER MAINTENANT`, credits once, desktop two-pane, galleries → ▶ Jouer + sheet | verify23 (70) |
| 24 | **Index**: chip rail + unit segments + 10 SIO rows, URL state, cells = how you did (device ledger), hubs → redirects, `?gaps=1`, row buttons | verify24 (58) |
| 26 | **/moi + teacher**: outcome rows, `HeatStrip` on 4 pages, thin /moi hero + 4 segments, teacher Class now (16 tiles, stuck detection, 30 s repoll), outcome × student matrix, one pooled fetch, Compute gone | verify26 (61) |
| bugs | deck gate/redirect, `NoDeck`, DeckContent on tokens, `/sio/[id]` → deep link, DEPLOY.md name, ONE "weak", ONE shuffle, D6/D7/D9/D10/D11, leaderboard identity, D4 sync diagnostic | verify27-bugs (81) |
| hero | **Home hero = a horizontal report card** (19 Aug): the two hairline bars gone ("no status bar"), chip rail gone, « Bienvenue sur FluOlinGo » heading back, counters now one row of value-over-label marks — level · streak · course · XP · lessons, + gems once earned; actions round, dropping below the marks on a phone (superseded by the glyph row, 21 Aug) | verify25 (22) |
| menu/nav | **HELP popup → Menu** (20 tiles, 4×5 phone / 5×4 tablet, no prose — /guide keeps the long form); registry regrouped to **six** families in Dan's 19 Aug order **Goals · Practice · Play · Review · Skills · User** — Goals now means the 50 objectives, the five pre-lesson activities became Practice | verify19c (10) |
| rail | **Side rail grouped**: six family flaps (Goals · Practice · SvPlay · Review · Skills · User), children under each, Unités under Goals | verify29-rail (22) |
| Track D | help-ladder spec + state machine + rule hints + `?`/WHY in every drill, evidence tagged, hinted items → ReVue, open-production feedback (`/api/feedback`, rule fallback), 22 eval cases | verify28-trackd (165) |
| 30 | **The profile is ONE learner model** (22 Aug, from Dan's Claude Design handoff): /moi and /profil are the same page — pinned goal → one next action → five collapsible rows `RE-DRILLS · SKILLS · FRILLS (showcase) · ILLS (problems noted) · THRILLS (rewards)`. The economy is the last row; the bottom bar became the five families | verify30-profile (26) |
| glyphs | **One glyph, one job** (21 Aug): ▶ ⏸ ⏹ 🔁 🐌 mean SOUND and nothing else; leaving a page is a word + ›. Home's round ▶/🔁 gone (▶ also said "continue the course"; 🔁 pointed at /reviser, which the Review tab already did) → « Continue › » is a full-width `.fluo-btn` under the card, La Carte's ▶ → ›, the due badge moved to the Review tab, ▦ Menu moved into the greeting. Say It had TWO ⏹ on screen at once (mic vs end-session) and WorDrill's "Done!" had THREE 🔁 → session controls are words: Back · Skip · End here · Restart · DéjàRevu ›. Review's mark 🔁 → **🔖** (Dan's pick over 👀, which the Carte cliffhanger and « Regardez ! » already use) — one registry edit carries tab + Menu tile + rail flap. Same sweep through SpecuLearn, Compose, ConjugaZone; NumBus 🐢 → 🐌 and ▶️ → ▶. The MAP's current-stop pin ▶ → **🧑‍🎓** in both views (the 3D already bobbed one; it also stamped a ▶ inside the stop — dropped), legend now « 🧑‍🎓 you ». ONE named exception: **▶ Jouer** on the four game galleries stays — play-a-game is the literal sense, it always carries its label, and it never shares a screen with a player. Verified against the BUILT app at 390px, not the diff | verify25 (22) |

| 31 | **WorDrill redesigned** (22 Aug, from Dan's Claude Design handoff): content-sized scope chips with itemSrs-derived dots, EN/FR prompt switch, session map, a mic-reading level meter, the help ladder on 🔤, a done screen that hands its misses to the Reviser. The handoff's **sprint clock was assessed and dropped on Dan's word**; ConjugaZone (1d) is a separate patch | verify31-wordrill (30) |
| 32 | **ÉcouTexte redesigned** (22 Aug, from Dan's Claude Design handoff — two directions drawn, Dan: "merge"): the SHEET is the spine (every sentence on screen and typeable) and the sentence you are on is ELEVATED, not exclusive — a card with larger type, its own 🔊, a verdict, and Check / Show the sentence; tapping any row moves the focus. Player under the header: **five controls, one row, no words on them** — ⏯ (one transport button; Dan: "WHY THE HELL DO I NEED AN ADDITIONAL PAUSE BUTTON"), 🐇🐌 speed, ♀♂ voice (active half in ink, other faded), a blanks button that alternates ▬ ▬ ▬ / ▬▬▬▬ and drives the real blanks (solid when sized to each word, dotted when equal), and Length as a number picker. Clarity moved OUT of the buttons: captions, a hint line naming whatever you hover/focus, title+aria-label on every control. **A fully-right sentence confirms itself; a wrong one stays silent** until the learner asks. Topic is a dropdown grouped by unit, one entry per SITUATION, wired to the generators' scenario ids (`FreshOpts.scenarioId`) so "Directions" really gives an itinerary — units 1–2 listed but DISABLED, no generator written yet. **Two glyphs sit outside the 21 Aug registry on purpose (⏯, 🐇) — the handoff overrides it here.** Verified against the BUILT app at 390px | build + eslint clean |

Shipped ≈ 149 of ~150 in-scope units.

## Deploy

**Deployed 25 Aug: `dckg/fluo` main is `abdc86b`** — the same commit as
`origin/main` and Dan's local tree. There is no deploy debt. (Superseded
`919a1c2`, deployed 23 Aug.) That push carried PRs #37 and #38 — the
EtuDice → Sorting rename, the deleted lesson-ramp entry die, the
`claude/peers-vd2h6h` reconciliation — plus Dan's own `ff96b93` docs pair,
which had been pushed to live on 24 Aug WITHOUT ever reaching `origin`. That
drift is what made a parallel session read main as "independently rewritten";
see **Always pull origin before pushing live**, below.
Cloudflare Pages (`fluolingo-dot-com` → fluolingo.com) builds on that push.
(Earlier revisions of this section stopped at 22 Aug / `1a29278`; PRs #32 and #33
landed and were pushed after it was written.)

The deploy is Dan's step, not an agent's: production is a DIFFERENT repo, and a
Claude Code session that already has `frenchprof` sources cannot add
`dckg/fluo` (cross-owner adds are refused). A session also cannot reach
fluolingo.com to verify — the network policy answers 403 to CONNECT — so
confirmation is the Cloudflare dashboard.

```sh
git checkout main && git pull origin main
git push live main
```

**NEVER put a trailing `#` comment on that second line.** Interactive zsh does
not treat `#` as a comment (`interactive_comments` is off by default), so a
pasted `git push live main   # Cloudflare builds it` sends `#`, `Cloudflare`,
`Pages`… as refspecs and fails with `error: src refspec # does not match any`.
It cost one confusing failure on 22 Aug, and a second on 25 Aug. Keep the
command bare; put the explanation on its own line.

**Always pull origin before pushing live.** Live must never hold a commit
`origin` lacks. On 24 Aug `ff96b93` was pushed to live and not to origin; the
next day `origin/main` had moved on, the two histories diverged, and `git pull`
stopped dead with `fatal: Need to specify how to reconcile divergent branches`
— while `git push live main` cheerfully reported `Everything up-to-date`,
because local main and live/main still matched each other. Both symptoms, one
cause.

### Setting up a machine that has never deployed

Deploying needs a clone plus the `live` remote. Node is NOT needed — Cloudflare
builds on its own machines; install it only to run or edit the app locally.

```sh
xcode-select --install
brew install gh
gh auth login
```

For `gh auth login`: **GitHub.com → HTTPS → Yes** (authenticate git) **→ Login
with a web browser**. The HTTPS + "authenticate git" answers are what let
`git clone` work afterwards without a password prompt. Skip either install if
`git --version` / `gh --version` already answers.

```sh
git clone https://github.com/frenchprof/fluoduo.git
cd fluoduo
git remote add live https://github.com/dckg/fluo.git
git config --global pull.rebase false
```

`git config --global pull.rebase false` is per machine, not per clone, and it
is what stops `git pull` refusing on divergent branches. Without it the pull
aborts mid-way and leaves `MERGE_HEAD` behind, which then blocks every
subsequent pull with `You have not concluded your merge`.

After that, deploying from that machine is the two-line block above. If it
answers `remote live already exists`, the machine is already set up.

**If a merge opens vim** — a full-screen editor showing `Merge branch 'main'…`
and lines starting with `#` — press <kbd>Esc</kbd>, type `:q!`, Enter, then run
`git commit --no-edit`. Do NOT type shell commands into that screen: on 25 Aug
a `git push …` line was typed into the message buffer, and `--no-edit` then
swallowed the whole comment block into `abdc86b`'s subject line, where it
remains.

Validated before the merge: `next build` succeeds · `tsc` clean · eslint 115
errors in 51 files (DOWN from the 118/52 baseline — main's own work removed
three) · verify19b 11/11 · 29 22/22 · 30-profile 26/26 · 31 13/13 · 32 39/39 ·
33 34/34 · 34 33/33.

## What is left

| # | Item | Units | Who |
|---|---|---|---|
| 1 | **Apply + deploy the 17 Aug patch series** (0001–0008, in order), then delete the merged branches below | 0.25 | Dan |
| 2 | ~~Home hero: keep the 11 Aug compact hero, or adopt Design's stat row?~~ **Dan chose the report card, 19 Aug** — built, verify25 rewritten to the new decision, screenshots in `work/hero-report-card/` | — | done |
| 3 | ~~3D map: swap the placeholder `HomeMap3D` for a real 3D build~~ **ported from Dan's Figma Make 19 Aug** (`pm/home-map-figma-3d`, replaces the CSS-perspective attempt of the same afternoon — Dan: "the 3D map is not yet 3D"). The Make's engine is intact in `src/lib/map3d/` (`projection.ts`: `pathXAt` / `cameraForward` / `project()`, HORIZON_Y 0.30 · CAMERA_Y 0.80 · FOCAL 3.8 · MAX_AHEAD 38; `sky.ts`: 8 clock keyframes, sun/moon arc, clouds, stars; `scene.ts`: Peers' ROADSIDE_ITEMS + seeded trees). **What differs from the Make and why:** stops from SIOS + `progress` (no mock, no stars / type badges / modal — a tap opens the SIO under the map; nothing dims); the Make's "Café de Paris / Le Campus…" are the repo's regions (HomeMap `REGIONS` + regionIcons on each world's gate sign, tap = open the unit; accent `--region-*`, ground `--region-*-band`); road keeps the 2D semantics (paved to 🚩, dotted beyond, travelled in the accent); classmates DROPPED (no safe per-learner stop source; leaderboard = name + XP only); colours are tokens (no hex — the ratchet did not move; sky keyframes are numeric RGB in `sky.ts`, see its header); Cahier body stack, not Nunito; camera = the box's native scroll (wheel / touch / keys / scrollbar) → one rAF → `camZ`; `?hour=N` pins the sky for screenshots. Knobs: `SCROLL_PER_STOP`, `CAM_MIN/MAX` (HomeMap3D.tsx), the projection constants + `WX` snake, `SKY_KF`, `MAX_BEHIND` (4 — lower it for less clutter behind the camera). Known: on a 390 phone the nearest stops stack vertically (the Make does too); the current stop is forced on top. verify25c (61) | — | done |
| 4 | Class flag: `CLASS_FLAG_SIO` in `src/content/chapters.ts` is hand-set (SIO-010) — move weekly or derive from the term table | 0.5 | agent |
| 5 | Ops: ruleset is active ✓; delete `add-claude-github-actions-…` (unmerged, `main` has its own workflows); `claude-review` billing in the Anthropic console; delete `import-fluoduo` on `dckg/fluo` | 0.5 | Dan |
| 6 | Track D follow-ups: run the 22 eval cases against the deployed `/api/feedback`; teacher charts for `help.rung`; ÉcouTexte on the `?` ladder | 2 | agent |
| 7 | **Colour + retention reviews — `docs/COLOR_REVIEW.md`, `docs/DOPAMINE_REVIEW.md`.** Audited by Dan 21 Aug; grid re-derived against the CSS Color 4 reference vectors and pinned. **APPLIED:** the seven `--dopa-*` roles as additive tokens under three guardrails (Cahier ground untouchable, `--region-*` stays separate, `verify30-dopamine.py` holds the values — 33 checks, wired into CI); the three accessibility fixes (3D-map focus ring 2.24 → 4.19:1, white-on-teal 2.45 → ink, input borders 1.25 → 6.11:1); the gender mapping as `--gram-masc/-fem/-neutral` across all 98 sites (7 masc, 6 fem, **85 that were never gender**). **NEW FINDING H:** `--cahier-ink` and five other structural tokens are declared twice — the 10 Aug override block wins (`#312620`), but the decoy above it (`#2a2e6e`) is what a top-down reader finds, and it produced two wrong figures in the audit. Collapsing them is a pure refactor, still to do. | 1 | agent |
| 8 | **Top bar fixed + pinned (21 Aug).** Dan: *"the top most row of icons still exist. and must not go hiding into the overspill off the screen."* Measured: at **320px only 4 of 6 icons were reachable** (☰ and the account button sat 67px past the edge), at **360px 5 of 6**, and 390 passed by 0.8px — so any addition broke it, and `/reviser`'s score readout already did. Fix has a yield order: `topRight` moved OUT of the strip into `.cahier-topslot` (truncates first), the wordmark truncates second, and the strip is `shrink-0 max-w-full flex-wrap` so it grows a line rather than pushing an icon off. All widths 320–1280 now 6/6, one line, no sideways scroll. `verify31-topbar.py` (13 checks, in CI) pins all three parts — verified to fail when any is removed. `verify/topbar-measure.mjs` re-measures the real layout. | 0.5 | done |
| 9 | **Retention build shipped (21 Aug).** All six approved items: **PWA manifest** (`app/manifest.ts`, force-static for `output:export`, four generated icons incl. maskable + apple-touch) with an **install prompt** that asks once on the third visit and never re-asks; **eight reward moments** on a size ladder (chime/small/big/full — mastery is a sound with no banner, only a finished unit gets the fanfare), all decided in `finalize()` by diffing saved vs persisted; **floating +XP** showing the multiplier's arithmetic (`40 × 1,5 = 60`) off a new `fluolingo:xp` event; **SessionReceipt** + `useRunXp` (wired into iComplete as the pattern — other drills opt in by passing their run); **weekly leaderboard** (`weekXp`/`weekKey` in Progress, merge, board row, **firestore.rules allowlist** — a denied write deletes the learner's row) with a This week / All term toggle and an Around-you view; **two hero marks** coloured, and the due-count badge off `--fluo-danger` (pending work is not failure). `verify32-retention.py` (39 checks, in CI) pins all six plus the ethics constraints; verified to fail when broken. | — | done |
| 10 | **Family identity — the SECOND colour axis (21 Aug).** Dan, on the profile page from `pm/profile-learner-model`: *"this almost sets the dopamine colour gold standard for the rest of the website."* Measured and he is right — core surfaces render **2.5–3.0% saturated** (/reviser 2.5, /leaderboard 2.7, /conjugaison 3.0). **This corrects COLOR_REVIEW Finding B**, which said to demote the rotating hues: rotation by *list index* encodes nothing, but a *fixed per-section* hue is the most legible thing on a page. Two axes now: `--dopa-*` = what it MEANS, `--fam-*` = WHERE YOU ARE. `SectionBand.tsx` generalises the recipe (spine / band / pill / 6% body). **The reference had a real defect** — its spine and pill used the full hue with paper text, 1.99:1 on gold and 2.27:1 on teal, failing all six; both take `--fam-X-ink` here. `verify33-family.py` (30 checks, in CI) recomputes every ratio and asserts the full hue stays decoration-only. Applied to /reviser as proof (ratchet 508 → 505). | 1 | agent |
| 11 | **Family colour is now site-wide (21 Aug).** Dan: *"I WANT COLOR."* The shell derives each page's family from its own `active` key (`familyOf()` in activities.ts — one mapping, no page declares a hue), then paints the sticky header in the family's wash and runs a 6px spine down the page edge. **50 routes coloured from one component.** Bands applied to the /reviser gaps and both Leaderboard zones. Measured: /leaderboard 2.7% → 6.1% saturated, /profil 6.7% → 10.1%, /activities 6.9% → 10.3%, Home 15.5% → 18.9%. An unmapped key stays uncoloured on purpose. verify33 now 34 checks. | — | done |
| 12 | **Next for colour:** most page BODIES are still paper — the shell colours the frame, SectionBand colours content, and only 2 surfaces use it so far. The gated pages (drills, /reviser, /conjugaison) could not be seen in this container. Open pedagogical calls unchanged: daily-goal size, variable reward, streak freeze, gem locker. | 3 | agent |
| — | December: canonical `FD-` outcome IDs (Track A) | 8 | deferred |

Closed as non-issues (Dan, 17 Aug): `/teacher` on the CDN — the page is gated to
Dan's email; Firestore service-account key — being retired.

## Decisions Dan made on 17 Aug (do not re-open)

1. Home map = two views, 2D and 3D, learner toggles. 2D reference = Design's
   "FluOlinGo Home standalone". Band fills = `--region-*-band` tokens. 3D = Dan's own
   build — his Figma Make "3D Scroll Map Interface", ported 19 Aug (row 3 below).
   No more path reversals.
2. SIO-036/040 spec softened to content (description AND competence, CSV + `sios.json`
   in step). Do NOT run `scripts/gen-sios.mjs` (stale vs hand-edited `sios.json`).
3. `envies-besoins.json` 09/10 `gap` = `envie`.
4. Region **accent** hexes stay provisional (Design gave bands, not accents).
5. Firestore key: being retired — not a task. `/teacher`: gated to Dan's email — closed.

## Decision Dan made on 19 Aug (do not re-open)

7. **Menu, not HELP.** The popup is a grid of the twenty activities and nothing
   else. **Six families**, order `Goals · Practice · SvPlay · Review · Skills ·
   User` (Dan: "2a → 2b → 2e → 2c → 2d → 2f", and "Pre-Lesson = Goals").
   GOALS = the fifty objectives by unit then goal; the five that used to sit
   under it (SpecuLearn, xPlain, EtuDice, 4Mémoire, iComplete) are PRACTICE.
   `activitiesInFamilyOrder()` is the single reader — do not hand-keep a
   second list.
   **Side rail DONE** (same day): `RailGroups.tsx` replaces the rail's flat
   22-flap column with the six family flaps, each opening to its children.
   The Unités are Goals' children now, not a tier — a unit IS ten goals.
   Open state is per family in sessionStorage, read through
   `useSyncExternalStore` (patch 24's answer to the set-state-in-effect
   rule); the family owning the current page opens by default.
   verify29-rail (22), wired into CI after verify28.
   LEFT: the phone **☰ dropdown** still lists the activities flat — it was
   not in Dan's ask, but it is now the one surface disagreeing with the rail.

6. **Home hero = a horizontal report card.** Dan, shown Design's "FluOlinGo Home
   standalone" twice: *"the dashboard that wouldn't have a status bar, that is
   minimalist and that is a bit like a report card but horizontally."* This
   REVERSES the 11 Aug hero shrink — deliberately. Do not re-shrink it, do not
   put the hairline bars back: `verify25` now asserts the reversal (no
   `h-[3px]`, no `role="progressbar"`, the h1 greets again), so a re-shrink
   fails CI. Marks are numbers with a label under each; emoji left the values
   so six marks fit a 390px phone; XP shows `420/1k` with the exact figure in
   the tooltip; gems join the row only once earned (the 20 Jul zero rule holds
   for currencies, not for the five academic marks).

## Decisions awaiting Dan (all default to what was built)

- Profile (22 Aug): what consumes an ILLS note — the queue, the teacher, or cut it.
- Games: hearts kept in NumBus/NumBourse/LexicaLater; Match It now behind sign-in.
- Home: "one unit per screen" = vertical band snap, not sideways paging.
- /moi: no time-on-task line any more (D6 sessions had no writer); Reviser "N weak" now
  counts fragile 1-day items too.
- Teacher: Class now added as first panel, Overview kept; the page reads all 16 logs on open.
- Track D: stuck thresholds (typed/cloze every wrong + 20 s idle; say 2 wrong / 30 s;
  MCQ every wrong); drills retry instead of ending on a wrong answer; WHY sits on the
  tray; feedback runs on ChaTutor's key (≈ $0.003/check).

## Branches

- merged/dead → delete: `claude/peers-vd2h6h`, `claude/sio-instructional-objectives-7bjv1a`,
  `claude/fluoduo-pr9-review-sync-8uoyfx`, `claude/api-necessity-i8fgps` (La Carte, folded in),
  `cursor/patch-19c-a214`, `cursor/drillshell-20-21-a214`, `cursor/teacher-cdn-exposure-a214`,
  `ship/patches-1-12`, `fluoduo/data-and-curriculum-fixes`, `add-claude-github-actions-…`,
  `claude/case-01n37qiwbywj63ebzdabdeht-status-b9muew` (its STATUS edit is superseded).
- Cowork PM patch series (17 Aug): `pm/*` existed only in the PM's workspace; they arrive
  as `git am` patches, not branches.

## Rules that stay

- Peers builds, `main` is the sole push path; every patch = verify script + screenshot,
  and CI runs every `verify/*.py` on every push.
- Dan's litmus test (AGENTS.md). Grammar guard-rails (no imperative outside SIO-008).

---

## Patch 31 — WorDrill redesigned (22 Aug, from Dan's design handoff)

Branch `claude/wordrill-redesign`, check = `verify/verify31-wordrill.py` (30).
Whole suite green: 21 scripts, 0 failures. Build + typecheck clean.

- **The sprint clock was assessed, not built** — Dan asked for the assessment
  first and then said "ignore sprint". Two reasons it did not survive review:
  it reversed his own 2026-07-03 decision that a run is a working queue with a
  natural end ("there should be a natural end rather than looping
  continuously"), and its core interaction was never prototyped — `SayItContent`
  opens a fresh `SpeechRecognition` per word (`continuous = false`), so a
  60-second sprint means ~20 recognizer restarts and the restart latency could
  eat a large share of the clock. The design's own answer to that was
  always-listening continuous mode, which the design chat confirms was never
  built. **If the sprint comes back, prototype continuous recognition first.**
  Everything the clock implied went with it: the duration dropdown, the ring
  round the mic, the countdown, "en 60 secondes", "Encore 60 s".
- **The drill did NOT move to DrillShell.** Artboard 1b draws its own ✕, score
  and footer inside the cahier sheet — a second copy of DrillShell's bar, which
  is exactly the duplication that shell exists to prevent. But DrillShell is
  `h-dvh` and Dan asked to keep the site chrome with the drill inside it, so
  the two cannot both hold as drawn. WorDrill stays in `CahierShell` and draws
  its own bar; the honest fix is a non-fullscreen DrillShell variant, which is
  a shell change and belongs to its own patch. **Left open.**
- **`variant="wordrill"`, not a new meaning for `embedded`.** SioModal's popup
  is embedded too and must keep the popup look; overloading the flag would have
  restyled a surface nobody reviewed.
- **WorDrill is on the help ladder now.** It was gated `enabled: !embedded`, so
  the drill Dan uses most had no rungs and recorded through `recordItemResult`
  directly. It now takes the `useHelpLadder` path like the standalone page,
  which means hinted and revealed words finally reach ReVue from here. 🔤
  carries the three rungs (hint · skeleton · answer) rather than a separate `?`
  — note this makes WorDrill the one drill whose ladder is not in the shell
  bar. Dan to say whether the others should follow or WorDrill should conform.
- **The meter reads the microphone.** The design drew CSS keyframes: bars that
  wiggle on a timer whenever the recognizer is open, identically whether the
  learner is speaking or silent — and it dropped the interim transcript, the
  one real proof the recognizer heard words. Both were reversed:
  `SpeechMeter.tsx` opens a parallel `getUserMedia` stream and draws a rolling
  RMS history (flat means flat, and it says nothing at all if the stream is
  refused), and the transcript stays. Sampled at ~30fps, stream released the
  moment the turn ends.
- **Back survives.** The design's footer was Skip + End here only. `back()`
  exists because Dan asked for it (2026-07-16, "the back button is not active
  when I skip questions") and carries real retrace logic for skipped cards.
- **The chip dots are derived, not invented.** The design drew them as "the
  last words you were asked there", which nothing stores — the activity ledger
  keeps `{right, wrong}` tallies, not sequences. `itemSrs` carries it
  implicitly: an answer sets `due = now + intervalDays`, so `due - intervalDays`
  is when the word was last answered and `intervalDays` is how it went. Same
  "one definition of weak" the Reviser and /moi read, so the dots cannot drift.
- **The session map is capped at 40.** The design drew 30 dots for a 30-word
  run; WorDrill's widest scope is 612, where 612 dots is a wall. The window
  slides so the newest mark is always the last filled dot.
- **WHY is off the WorDrill tray** — Dan's call. He was offered pronunciation,
  grading tolerance (the only one buildable today: `silentEq` already knows why
  a homophone passed) and gender, and chose to drop it. Note this is a
  deliberate exception to AGENTS.md's litmus clause, which mandates a WHY
  affordance on answered questions; the other drills keep theirs.
- **Verb squares are not built.** The design marked verbs as squares in the
  session map via `i % 4 === 1` — decorative fiction. WorDrill pools deck items
  and there is no reliable join from a pooled item to the conjugaison `VERBS`
  inventory, so the map is dots only.
- **Not done / found on the way:**
  - ConjugaZone (artboard 1d) — a separate page and its own patch. The
    handoff's `verbs.js` (the newer copy in Dan's zip, which assigns `être` to
    Unit 0 and `lire`/`écrire` to Unit 2, leaving `incomplete: 2`) is NOT in
    the repo yet.
  - **`.cahier-mono` is undefined.** It is used in ~10 components
    (ProfileContent ×25, DrillShell, GameBar, HeatStrip, HomeMap, MenuSplash…)
    and appears in no stylesheet, so every one of them silently falls back to
    the body font where a typewriter face was intended. `.fluo-mono` is the
    real class. Pre-existing and unrelated to this patch — left alone because
    fixing it changes the look of eight screens nobody asked me to touch.
  - SioModal's Say It popup still carries the "Say in French:" kicker, "Tap to
    speak" and the keyboard legend — all litmus-test casualties on the WorDrill
    side. That surface was not in the handoff; verify31 scopes its prose checks
    to the WorDrill branch rather than pretending the popup was cleaned.
  - No screenshots: the mic path needs a real device and a signed-in build.

---

## Patch 30 — the profile as one learner model (22 Aug, from Dan's design handoff)

Branch `claude/profile-learner-model`, check = `verify/verify30-profile.py` (26),
harness `work/profile/shoot.mjs` (ad-hoc, playwright not added to the lockfile;
`.png` not committed). Whole suite green: 20 scripts, 0 failures.

- **ONE page, TWO routes.** `src/components/ProfileContent.tsx` renders at both
  `/moi` and `/profil` — Dan's call over a redirect, so the account chip,
  printed handouts and old bookmarks all land rather than hop. `MoiContent.tsx`
  is deleted; the old economy page is gone.
- **The shape.** Always visible: the pinned goal and the ONE next action —
  the two things you act on. Everything else is the record, collapsed, one
  section open at a time, each row stating its own value on the right so the
  page reads shut.
- **What Dan removed, and why** (all 22 Aug, in his words where they were his):
  CEFR self-placement ("how likely is it one gets to be A2 when in A1" — it was
  flattery, and the four-skill framing duplicated the weak list at a coarser
  grain); the weekly commitment `2/3` (unlabelled, therefore unreadable);
  N-levels ("we don't need levels lah" — `levelForXp` still names leaderboard
  rows, it is off the profile); the `→ SHOP` chip (redundant); the progress
  bars ("AND WHY ARE THE SPACE-OCCUPYING PROGRESS BARS BACK AGAIN??"); the
  `DUE · WEAK` tags on re-drill tiles ("all we need the SIO number, title
  word(s) and colored % (NOTHING ELSE!)"); full-width buttons.
- **Two lists became one.** "Due for review" and "What is shaky" showed the
  same outcome twice. `redrills()` is one queue carrying both reasons —
  WEAK is accuracy under the tier floor, DUE is the SRS interval elapsed —
  and they genuinely differ (SIO-019 at 77% is due; SIO-043 at 48% is not).
- **The learner model is derived, not invented** (`src/lib/learnerModel.ts`,
  learner-safe): coverage counts the spine's own `skill` field, so it is the
  same per-outcome accuracy regrouped, not a second taxonomy; the next action
  is a TEMPLATE filled from the SIO's `short` + `skill` (Dan: "template from
  SIO data — no AI"), four phrasings covering all fifty; the goal stores only
  `{ sio, by }` on `Progress`, because the fifty ARE the catalogue and the one
  thing it cannot hold is which you are aiming at and by when.
- **Full history is its own page** (`/moi/historique`, Dan asked for it during
  the build): the answer log and the per-exercise fold, uncapped — the profile
  caps at a screenful, completeness is the history page's whole point. Reached
  from the footer beside DETAILS and EXPORT (EXPORT writes the outcome table as
  a CSV, client-side, no endpoint).
- **Bottom bar = the five families minus User** (`🎯 ✏️ 🎮 🔖 💪`, FAMILIES
  order). This REVERSES the four-slot decision of 10 Aug recorded in nav.ts;
  Dan asked for it explicitly and confirmed it here. Index lost its slot
  ("Goals and Index to merge later on as one") but not its destination —
  Practice points at `/activities`, which is the Index. verify19 was rewritten
  to the new decision and now asserts the bar hand-keeps NO labels at all.
- **Typography gotcha worth knowing.** `.cahier-page p { font-size: var(--fs-body) }`
  is an element selector and outranks every Tailwind size utility, so a `<p>`
  cannot be small. Mono labels are `<span className="block">`; only real prose
  stays a `<p>`, where body size is what it should have been anyway. The header
  name takes `--fs-h2` from the scale rather than the h1 default.
- **Superseded checks, rewritten not deleted:** verify26 §3 (the patch-26 hero
  and segments are asserted GONE, its outcome fold and heat-strip still
  asserted present), verify27 (two file references moved to the new modules),
  verify19 §3 (the bar).
- **Dan still has to decide:** what consumes an ILLS note. It stores and reads
  (`src/lib/blockers.ts`, device-local, three a week) and NOTHING acts on it —
  which makes it a diary, and Dan named the two ways it earns its place:
  push its SIO into the queue regardless of schedule, or land on the teacher's
  dashboard before class. Until one is chosen the row is honest but inert.
- **Also not done:** FRILLS is honestly empty — nothing in the app stores
  recordings or drafts yet, so the three slots name what they will hold rather
  than invent a count. The `‹ PROFILE` link and the ⌛ top-bar icon both point
  at /moi, so on the profile ⌛ is still a door to itself (noted in the design
  chat, not fixed here).
- **Pre-existing, unrelated, observed while shooting:** `.cahier-bottombar`
  declares `display:flex` at class specificity, which beats `sm:hidden` in the
  cascade — the phone bar is visible at desktop widths too. Untouched by this
  patch (BottomBar.tsx and globals.css are unchanged); worth a look on its own.

---

# Notes per patch (17 Aug) — the detail behind the table

## Track D — what was done, what was left, what Dan must confirm (17 Aug, Peers)

Branch `pm/track-d-help-ladder` (on top of `pm/integration`), check =
`verify/verify28-trackd.py` (165 checks: the machine + generators run in
node, 66 rows; the 22 eval cases run against the rule grader). Spec =
`docs/TRACK_D_HELP_LADDER.md`.

- **One machine.** `src/lib/help/ladder.ts`: FRESH → TRY → HINT_1 → HINT_2 →
  REVEAL / RETRY_AFTER_REVEAL → DONE; pure, clock-free (`step(ladder,
  event)`). `useHelpLadder` is the React glue: records EVERY attempt through
  `recordItemResult` with the rung actually shown (`assistance`,
  `hintsTaken`, `revealed`, so `independent` is true only for first-try
  no-hint), queues a hinted/revealed item for ReVue when it closes
  (`queueForReview`, due now), logs `help.rung` per transition (+ the old
  `hint.tap`/`answer.reveal` with `auto`). The Finale keeps its five-rung
  ladder (now in `hints.ts`).
- **"Stuck" — Dan to confirm the numbers** (`LADDER_CONFIG`): typed/cloze
  climb on every wrong try and after **20 s** idle (hints only — idle never
  reveals); say after **2** wrong / 30 s; MCQ on every wrong pick, no idle,
  no cold hint; flashcard test may reveal cold; reveal never before one
  attempt anywhere else. Every hinted or revealed item is queued for ReVue
  at interval 0 (a clean retype after a reveal is NOT credited an
  interval) — confirm that is the intended severity.
- **Drills changed behaviour** (Dan should try them): iComplete/GramMarathon
  no longer end on a wrong answer — the tray says "Not yet · Try again", a
  hint chip appears, the field stays live; the third wrong shows the answer
  and asks for it to be typed ("Type it"). EtuDice/SpecuLearn/lesson MCQ: a
  wrong pick is struck and the learner picks again (≥ 3 options); the second
  wrong reveals. 4Mémoire test: `?` replaces 💡 Révéler. WorDrill: the 🔤
  peek is the answer rung (recorded), two misses climb by themselves.
  First try scores; every try is a response record.
- **The `?` control lives in the shell bar** (with rung dots), the hint
  chips under the item, WHY at the tray's right — not "top right of the
  answered question" as AGENTS.md words it; the tray IS where the answered
  question's verdict lives. Dan to say if WHY should move.
- **Evidence enum unchanged.** Post-reveal recall is `status met +
  assistance "answer"`; there is no `evidenceType: "assisted-recall"`
  (adding one = firestore.rules deploy). Readers derive it.
- **Row 7 = the lesson end "SIO write"** (`OpenFeedback`): one free
  sentence on the SIO's can-do; Correct me / Model answer;
  `functions/api/feedback.js` on **ChaTutor's key** (`ANTHROPIC_API_KEY`,
  OpenRouter, `anthropic/claude-haiku-4.5`, Mistral fallback,
  `TUTOR_MODEL` override) — **cost ≈ $0.003 per check**, ~500 tokens; no
  new env var. 8 s budget then the rule grader (cloze tiers + word diff)
  answers, same shape. Model answer = the deck's first authored `example`
  (13/44 decks; the rest get screening only). No XP paid. Dan to confirm the
  provider/cost and whether ComposeIt / the /tts proofreader should move to
  this schema (not touched).
- **ÉcouTexte** is not on the `?` ladder (multi-blank sheet, own
  per-sentence reveal); a check after a reveal is now recorded as
  `assistance: answer` and queued. Pretests stay cold. The `dictation` and
  `ordering` kinds are specified and generated but no drill uses them
  yet.
- **Not done:** the LLM path of the eval cases has not been run against a
  deployed `/api/feedback` (no key here — run
  `curl -X POST /api/feedback` per case after deploy; `expect` in
  `evalCases.json` is the pass mark); the SioModal popup forms of
  iComplete/GramMarathon show hints inline (no shell bar there); no
  per-error 🔊; the teacher dashboards do not yet chart `help.rung`
  (`auto` vs asked, rung reached) — the events are flowing.
- Screenshots from a `REQUIRE_SIGN_IN=false` build (reverted before the
  last build and commit); harness `work/trackd/serve.py` + `shoot.py`
  (untracked, no .png committed).

## Loose bugs + data-truth — what was done, what was left (17 Aug, Peers)

Branch `pm/bugs-data-truth` (on top of `pm/integration`), check = `verify/verify27-bugs.py`.

- **Deck gates.** `/decks/[id]/study` for a curated id only ever redirected to
  `/practice/flip-it/<id>`, but the redirect sat inside `AuthGate` — a
  signed-out learner was asked to sign in to be sent somewhere that has its
  own gate. The redirect now runs first. `/decks/[id]` itself is NOT a redirect
  any more (patch 20–21 made it the 4Mémoire table), so it stays gated.
- **`No deck specified.`** was on three routes (`/decks/view|study|mcq`
  without `?id=`) → one `NoDeck` empty state inside the shell, "Open the
  Index". Not the deck-`[id]` `NotFound` (that one already had doors).
- **DeckContent.tsx** on cahier + tier + drill-bad tokens; 19b baseline
  re-run (`--rebaseline`): 904 → 773 stock classes, 542 → 506 raw hex.
- **`/sio/[id]`** — nothing linked to it except KeyNav's two-digit jump, and
  Home's popup (SioModal → SioDetail) is the same content, so it is a
  redirect to `/?unit=N#SIO-0NN` (the fifty static pages still build for old
  links/QR). KeyNav opens the popup on Home (sets the hash when already
  there). The "Planned" pre-test label was the same `getPretestForSio` logic
  the popup uses — if Dan still sees "Planned" where a pre-test exists, it
  is a `PRETEST_BY_SIO` gap in `content/pretests`, not a page bug.
- **DEPLOY.md** says `fluolingo-dot-com` (was `fluoguo`); banner kept.
- **`LAF1201` stays in the meta description** — decision recorded next to
  the string in `layout.tsx`: it is the course code people search for;
  English first, no French.
- **One "weak"** — `progress.ts`: `WEAK_BELOW = 50`, `GOOD_FROM = 75`,
  `tierFor(pct)`, `isWeakSrs(srs)` (interval ≤ 1 day: just missed, or
  repaired-but-fragile). Callers: outcomeRows `tierToken/tierClass` (the
  ledger re-exports them), the teacher's `missColor` (was miss ≥ 50/25 —
  off by one at 75 %), the Reviser's weak count (was interval === 0 — now
  counts fragile items too, so the "N weak" chip can read higher), /moi's
  signed-out SRS rows, the Finale's weighting.
- **One shuffle** — `src/lib/shuffle.ts` (Fisher–Yates, injectable rand):
  5 biased `sort(() => Math.random() - 0.5)` sites (conjugaison, three
  native lessons) and 17 private copies replaced; 24 files import it. The
  seeded ones (deck MCQ `stableShuffle`, Finale `mulberry32`) untouched.
- **D6 / D7 = the smaller fix, delete the readers.** `users/{uid}/sessions`
  had no writer in this repo (the old suite's docs carry a null activityId)
  and `users/{uid}/attempts` was never written. Teacher panel: time on task
  is the page-view estimate only; the "Attempts" KPI is now "Answers" =
  recorded responses; /moi lost its "⏱ N min on task" line (it was empty
  for anyone post-reset). `firestore.rules` still shapes both collections —
  harmless, left for the next rules deploy.
- **D9 delete / D10 round-trip.** `retried`/`mastered` were never written
  (`recordResponse` stores `met`/`missed` only) → gone from every reader
  (`isMiss = missed`; the rules enum still lists them, harmless). The
  evidence block (`outcomeId`, `evidenceType`, `assistance`, `assistCount`,
  `independent`) was written since 10 Aug and read by nothing → teacher
  `data.ts` parses it, `outcomeOf(answer)` prefers the stored `outcomeId`
  over the item join (every fold, ClassNow, the recent-answers table), the
  teacher's Recent answers gained an "Evidence" column, /moi carries
  `outcomeId` through. `assistCount` is stored but not shown (nothing asks).
- **D11.** `mergeProgress` already kept `timeZone` on this branch's parent,
  but as `local ?? remote` — the zone could belong to the OTHER device's
  `lastActiveDay`. It is now a pure module (`src/lib/progressMerge.ts`,
  re-exported by progressSync) that pairs the zone with the winning day, and
  verify27 runs a 15-row merge table in node (`--experimental-strip-types`).
- **Leaderboard identity.** `boardName(uid, displayName)` in
  `accountAliases.ts` = alias → display name → "Anonymous" (the publisher
  used to fall back to the email's local part). The board marks "(you)" on
  the folded canonical row for an aliased learner on her second account.
- **D4 diagnostic (cannot reproduce here).** `progressSync.push` stamps
  `lastSyncedAt` + the device's `lastSyncError`/`lastSyncErrorAt`/
  `syncErrorCount` on the progress doc; every pull/push failure is kept in
  `fluolingo:syncState` and sent as a `sync.error` event (separate
  collection — a rules denial on the doc still gets out). Teacher student
  panel "Last sync": red **STALE — active <when>** when the learner's newest
  event is > 12 h past the doc, plus the error count and last message. In
  week 1 Dan opens the two learners and reads the KPI.
- **Not done:** replaying `responses` into the device ledger after sign-in
  (patch 24's note); a rules edit dropping `sessions`/`attempts`/the two
  statuses (needs a deploy); the plan's "delete `import-fluoduo` on
  dckg/fluo" (needs push access — Dan).

## Patch 26 — what was left out or decided on the fly (17 Aug, Peers)

- **Outcome rows are one fold, three readers.** `src/lib/outcomeRows.ts`
  (learner-safe: spine + content only) turns any `{item, status}` list into
  outcome rows — `outcomeForItem` → SIO, items nested, `weakItems` = items
  missed ≥ 50 %, order `missed × weakItems`, the unresolvable rest in ONE
  "Not yet mapped" bucket pinned last. /moi's Fix segment, the teacher
  student panel's "Hardest outcomes" (was "Hardest items", flat) and the
  matrix all read it. `retried` counts as a miss (first try failed).
- **The heat-strip is on four pages**: /moi (under the hero, cells → the
  Index row `/activities?unit=N#SIO`), the teacher student panel (top of
  the modal), the teacher **Class now** board (the class column as one
  strip, above the matrix), and the **Index** (compact `size="sm"` under the
  unit control, from the device ledger summed across activities; a tap
  moves to that outcome's row). NOT Home — the hero is frozen (patch 25) and
  the map already is the syllabus picture. Index rows now carry
  `id={sio.id}` so `#SIO-0NN` lands (an effect scrolls after hydration).
- **/moi**: hero = chips (✓ done, 🎯 accuracy, 🔥, ⭐, 🔁 due) + two 3 px
  hairlines (Course, Accuracy), 90 px at 390 (Home's is ~99). Six tabs →
  four segments **Fix · Exercises · History · Journey**: "Where I lose marks"
  → Exercises; "My hardest items" → Fix (outcome rows); "Strong vs weak" →
  the heat-strip (it IS that list, without the words) and, signed out, the
  Fix rows drawn from `itemSrs` (interval ≤ 1 day = weak — the old rule);
  "My tips" → gone (the top Fix row IS the tip; the 🔁 due count is a hero
  chip); "Journey" keeps the six fun numbers + the marathon CTA. Every list
  is `Capped` at 5 with "+N more". `void rows;` and the `Math.random()` key
  died with the rewrite. Stock palette count fell 904 → ~826.
- **Teacher**: new first/default panel **🟢 Class now** — 16 tiles (2-up on
  a phone, 4×4 from sm), worst-first (`tileRank`: stuck, then lowest last-10
  accuracy, then no data, absent last), name · live/today/absent dot · last
  five ✓✗ (tooltip = outcome) · the last outcome's short · a last-10
  hairline. **Stuck = 3 consecutive misses on ONE outcome inside 20 min**
  (red tile, ⚠). Under it the class heat-strip and the **outcome × student
  matrix** (50 rows grouped by unit, a column per learner, `Class` last;
  cell = tier of that learner's accuracy on that outcome; a click on a name
  opens the student). Overview stays (its KPIs / day drill-down were asked
  for) — Class now is added, not swapped in.
- **One fetch**: `fetchClassDetails(roster)` — pool of 4, tiles land as
  each learner arrives — feeds Class now, the matrix, Evidence, the
  analytics CSV and the student modal (`cached ?? fetched`). **The `Compute`
  button is gone**: Evidence is a `useMemo` over the shared map. **Repoll
  every 30 s** = `fetchResponsesSince(uids, lastPoll)` — a single-field
  `timestamp >` range per uid (no composite index), prepended into the map;
  paused while the tab is hidden. Cost: 16 full response reads on open
  (was 0 until someone pressed Compute), then only deltas.
- **Screenshots of the teacher page use a fixture.** It cannot render
  without live Firestore + an admin sign-in, so `src/app/teacher/fixture.ts`
  fabricates sixteen `Élève Un…Seize` (deterministic PRNG, real item ids,
  two "live", one stuck) behind `NEXT_PUBLIC_TEACHER_FIXTURE=1` — inlined at
  build, dynamic-imported, `canView` opens for it. A clean build still emits
  the fixture as one orphan chunk no page references (Turbopack does not
  drop the dead dynamic import); verify26 checks that, verify18b stays
  green. **Never set the flag for a deploy.** /moi shots are the signed-out
  device view (progress + ledger seeded) — the Fix rows there come from
  `itemSrs`; the answer-log rows look the same with ✗ counts.
- Not done: the /moi ▶ on an outcome row goes to the Index row, not
  straight into a drill (Dan to say if it should open 4Mémoire); "Not yet
  mapped" has no practise link (nothing to link); the matrix has no
  per-cell click-through (title only); Class now's presence dot reads
  events + answers, not a heartbeat — "live" = anything inside 5 min.

## Patch 24 — what was left out or decided on the fly (17 Aug, Peers)

- **Rows are SIOs, not decks.** All 50 SIOs own exactly one curated deck and
  no curated deck is outside a SIO (checked in verify24), so nothing fell off
  the Index. Ten rows per unit; the row's stop number is the one on Home and
  links to `/?unit=N#SIO` (✓ in green once the outcome is marked done).
- **Chips vs buttons is decided by content, not taste** (`src/lib/indexMatrix.ts`):
  xPlain, 4Mémoire, WorDrill exist for every deck → per-row buttons; the seven
  content-gated ones (SpecuLearn, EtuDice, iComplete, GramMarathon, ComposeIt,
  VocabulaRain, LexicaLater) are the chip rail, in registry (family) order.
  Pre-Test folds into the SpecuLearn cell (Dan, 2026-08-10). Match It stays
  off (KIV). Eligibility comes from `deckActivityTabs()` — not re-derived.
- **The cell's data is a device-local ledger** (`src/lib/activityLedger.ts`,
  `fluolingo:activityLedger`), written once from `recordResponse()` — the one
  place every graded answer already passes — keyed activity → SIO →
  {right, wrong}. NOT synced: two devices, two ledgers; the synced truth is
  still `users/{uid}/responses`. Replaying responses into the ledger after
  sign-in is on the data-truth backlog (#10). VocabulaRain, ComposeIt,
  NumBus/NumBourse tally only what they already record; games that record
  raw French (no item id) still resolve through the activityId's deck.
  Tier scale = /moi's (red < 50, amber < 75).
- **Only three hubs existed to delete** (patch 23 had already turned the four
  game galleries into ▶ Jouer + sheet): `/practice/flip-it`,
  `/practice/grammarathon` (ActivityHub) and `/practice/speculearn` (tile
  gallery). All three are redirect stubs → `/activities?activity=…`; the
  registry hrefs point straight at the Index (verify19's route check reads
  the path part). The SpecuLearn gallery's "Why guess first?" NUS paragraph
  went with it — the registry blurb keeps the claim; Dan to say if the
  citation should live somewhere (HELP?).
- `?activity=flip|lesson|wordrill` (from the 4Mémoire / WorDrill flaps)
  focuses that row button (its hue) and the cell reports that activity; the
  chip rail shows no selection. `/practice/dice` and `/practice/complete-it`
  never had index pages and still do not (registry hrefs stay null).
- `?gaps=1` (GapsView) is reached only by URL — nothing in the learner chrome
  links it. It counts xPlain as a gap when no lesson is AUTHORED (the deck
  lesson still renders). Today: 189 gaps across 8 columns.
- Search stays (word-level, Dan 2026-07-08); a live query spans all units and
  dims the unit control. "Your decks" (MyDecks) stays at the bottom.
- Not done: the `?unit=` default is the learner's next SIO's unit (same as
  ▶ Continue) — a class-flag default was not attempted; no legend for
  disc / ring / dash (title + aria-label only, per the litmus test); the
  gaps table scrolls sideways on a phone (it is Dan's desktop view).
- Screenshots from a `REQUIRE_SIGN_IN=false` build (reverted before the last
  build and commit); harness `work/patch24/serve.py` + `shoot.py`, committed
  this time (`work/patch*/` is gitignored — added with `-f`).

## Patch 25 — what was left out or decided on the fly (17 Aug, Peers)

- "One unit per screen": the 2D map box snaps band-to-band on a **vertical**
  swipe (scroll-snap) and lands on the current/deep-linked unit; bands are
  stacked so the road stays one road, as Design drew it — NOT a horizontal
  pager. Dan to confirm.
- Class flag 🚩 = `CLASS_FLAG_SIO` in `src/content/chapters.ts` (hand-set,
  SIO-010) — nothing in progress/cohort exposes a per-week position yet.
  The road is paved to the flag, dotted beyond; the learner's travelled
  stretch wears the equipped accent.
- The hero's ▶ Continue still links `/unit/N#SIO` (untouched per the
  hero-freeze); it lands via the redirect. Point it at `/?unit=N#SIO` when the
  hero is next opened.
- `KIND_LABEL` stays French (vocabulaire/grammaire/…) in the map legend —
  the app-wide choice from 2026-07-08; Design's legend was English.
- Legacy `/unit/N` pages still build (five redirect stubs) because the shell's
  Unité flaps, DrillShell's back link and old bookmarks point there.

## Patch 23 — what was left out or decided on the fly (17 Aug, Peers)

- **Hearts stay in the games that had them** (NumBus, NumBourse, LexicaLater):
  GameBar v2 draws ♥♥♡ when the game keeps lives and nothing otherwise.
  DrillShell's "no hearts" rule was about *curriculum drills*; the games are
  arcade play. Dan to confirm or strike.
- **The queue is `itemSrs`.** `queueForReview(ids)` (progress.ts) drops each
  miss to the due-now rung — exactly what `dueForReview` reads — the moment
  the post-mortem mounts; `CORRIGER MAINTENANT` opens `/reviser?items=…` and
  the reviser page puts those at the head of the session. It does NOT call
  `recordItemResult` again (the game already graded/paid the attempt).
- **Number games' misses reach the queue only when the course has the row**:
  NumBus/NumBourse deal spoken numbers, not deck items; `reviewItemByFrench`
  matches the words against `numbers-0-20/20-69/70-99`. A number outside
  those decks is listed on the post-mortem (with "where it goes" → SIO-007)
  but cannot be queued. VocabulaRain tiles match the same way (by French);
  Match It queues the mis-chosen completion (the item it graded).
- ComposeIt has no graded misses (AI feedback) — its GameOver shows the bill
  / le bilan du prof and « Sans faute ». The scenario reminder line stays on
  the board (Dan, 2026-07-19) — the one instruction not moved to Help.
- VocabulaRain's pre-game study table stays (Dan, 2026-07-04) minus its
  blurb; LexicaLater's blinking red "Drag down a chest" and pointing hands
  are gone (WCAG flash risk + litmus) — the down-arrows remain.
- The four game galleries are one card + sheet; the *drill* hubs
  (`/practice/flip-it`, `/practice/grammarathon` → ActivityHub) were not
  touched — patch 24's Index work owns those.
- Screenshots were taken from a build with `REQUIRE_SIGN_IN=false` (the wall
  is Google-only, no headless path); the flag was reverted before the last
  build and commit. Harness: `work/patch23/serve.py` + `shoot.py`.
- Match It now sits behind AuthGate like the other five (it was the only
  game without the wall).
- Not done: a per-game *why* button on the post-mortem rows; keyboard `?`
  for Help; the two-pane record for ComposeIt on tablets < 1024px.

## Rules that stay

- Peers builds, `main` is the sole push path; every patch = verify script + screenshot.
- Dan's litmus test (AGENTS.md). Grammar guard-rails (no imperative outside SIO-008).

## Patch — the approved guidance flow, part 2: the notebook + one Next › (24 Aug)

Finished a prior agent's partial edits (killed mid-task; `src/lib/nextStep.ts`,
`DrillShell.tsx`, `GameOver.tsx`, `verify20.py` already carried its work) —
did not start over, closed the two gaps it left open:

- **DrillShell now lives inside the cahier notebook** — `cahier-foolscap` +
  spiral binding + a `PageBand` on top (family colour via `fam-<key>`, the
  drill's own progress figure moved into the band's ONE chip so it is never
  printed twice), phone bottom bar kept, 100dvh/fixed-footer intact. This part
  was already done. Games (`GameFrame`) untouched, as scoped.
- **`nextStep.ts`** (114 lines, already complete) resolves the next undone
  step of a stop's practice chain — Pre-Test/SpecuLearn → Memo → EtuDice →
  4Mémoire → iComplete, in `activities.ts` registry order, "undone" read off
  `activityLedger.accuracyFor` — or the next stop's first step via
  `continuer.nextSioId` when the chain is clear. Anchors on `sioId` →
  `collectionId`'s SIO → (deckless surfaces: ConjugaZone, a spoken-number
  game) the learner's current stop on the path. Verified correct as written;
  no logic changes needed.
- **Finished the two callers that still had no `activity`/`deck`/`finish`
  wiring**, so the band and the single « Next › » actually appear where Dan
  approved them:
  - `src/app/lessons/pager/LessonPager.tsx` — `activity="lesson"`,
    `deck={collectionId}`, and `finish={{ repeat: build }}` on the end card;
    dropped its own Continue/↻ Try again buttons now that the shell's finish
    row owns that footer.
  - `src/app/conjugaison/page.tsx` — `activity="conjugaison"` (deckless —
    verb picker, not one SIO), `finish={{ repeat: restart }}` once the run
    reaches the reward table (the table screen IS the finish screen here);
    `↻ Again` retired in favour of the shell's Repeat.
- GameOver.tsx was already complete: misses-first ordering (CORRIGER
  MAINTENANT stays primary with misses queued), « Next › » promoted to
  primary only on a clean run («✓ Sans faute»). Confirmed live in the
  GameOver screenshot below (3 misses → CORRIGER MAINTENANT primary, Next ›
  secondary).

**Checks**: `npx tsc --noEmit` clean; all 25 `verify/*.py` suites green (incl.
`verify20.py`, `verify23.py`, `verify28-trackd.py` — none needed a fix, none
pinned stale chrome). Dev server on :3777; `REQUIRE_SIGN_IN` flipped to
`false` for screenshots, restored to `true` before finishing (no net diff on
`authConfig.ts`).

**Screenshots** (`scratchpad/flow-build/`):
`01-conjugaison-notebook.png` (ConjugaZone drilling inside the notebook,
purple band, `0/18` chip), `02-drill-finish-next.png` (ConjugaZone's finished
table: ✓ chip → `1 🔮 SpecuLearn` → primary Next ›, Repeat/Back quiet),
`03-gameover-next.png` (NumBus GameOver, 3 misses: CORRIGER MAINTENANT
primary, `7 🔮 SpecuLearn` chip + secondary Next ›).

## Patch — the approved guidance flow, part 1: the numbered path + the tour fix (24 Aug)

Finished a prior agent's partial edits (killed mid-task by a server error;
`SioModal.tsx`, `FirstTour.tsx`, `HomeDashboard.tsx`, `AuthGate.tsx`,
`CahierShell.tsx`'s `deckActivityTabs` order, and the `globals.css` rules were
already written). `git diff` first, confirmed every requirement was already
coded correctly — nothing needed rewriting, only proving and checking.
`UnitSection.tsx` needed no change: it just passes `popupActivityTabs()`'s
list straight to `SioModal`, which already does the numbering.

- **The SIO sheet's practice chain renders as a numbered vertical path**
  (`SioModal.tsx`'s `CHAIN_KEYS`): Pre-Test → SpecuLearn → Memo → EtuDice →
  4Mémoire → iComplete, filtered to whichever of those six exist for the
  open SIO's deck (confirmed on SIO-001, which has no SpecuLearn/EtuDice —
  the path renders 4 steps, not 6, with no gap). Number chip + emoji + name;
  done reads `activityLedger.accuracyFor()` off the device ledger (pretest
  folds into the speculearn key, matching how the ledger itself already
  folds it); done = ✓ + 55%-opacity muted, the first undone step gets the
  practice family's wash/ink + a `›`. No prose added — every string is an
  existing registry label or a single glyph.
- **FirstTour rebuilt to 3 steps** ending ON Play, replacing the stale
  4-step tour (❓ HELP, ❓ Guide, a desktop drag step, "Pre-Test first, then
  the cards" — none of it still true). Step 2 spotlights the bottom bar;
  its Next button sits **above** `--bottombar-floor`, and the whole overlay
  now portals to `document.body` at `z-[100]` (was `z-[80]` inside the page
  tree while the bar sits at `z-90` — the exact bug the flow walk
  reproduced, "Skills tab eats the Next tap"). Step 3 ("Start here") is a
  finish card whose one button IS Play, computed the same way the hero pill
  computes it (`nextSioId(loadProgress())`) — the tour finally hands off to
  the thing it's teaching instead of ending on itself. The unit tour's
  "Pre-Test first, then the cards, then the Lesson" line (which contradicted
  the path's authored order) is gone too.
- **`deckActivityTabs`**: 4Mémoire now precedes iComplete, matching
  `activities.ts`'s authored family order — the SIO popup's flap order and
  the numbered path can no longer disagree (flow-walk finding: they did).
- **Play's first-visit halo**: `fluo-play-halo` class added to the hero
  Play pill only while `doneTotal === 0`; a `::after` pulse ring (CSS
  `@keyframes`, `prefers-reduced-motion` respected — falls back to a static
  ring, no animation). Dies with the first completed goal.
- **AuthGate "Back to the path"**: was a hard `href="/"`, dropping a learner
  who unlocked from a stop's sheet onto Home instead of back at the sheet.
  Now `history.back()` when there's history to go back to, `/` fallback
  otherwise. "Locked routes keep their page chrome where feasible without
  touching DrillShell" — checked, not built further: routes that already
  nest `AuthGate` inside their own `CahierShell` (e.g. `decks/[id]/study`)
  already keep chrome regardless of sign-in state; the routes that don't
  (pretest/practice/lesson/game pages) are the "full-screen in DrillShell"
  pattern, where chrome is DrillShell's to add — out of this session's file
  scope by the task's own boundary, and now that part 2 has DrillShell
  rendering inside the cahier notebook (see the section above), those
  routes will get real chrome once `AuthGate` moves inside that wrapper
  rather than around it. Left for whoever owns that file next.

**A real bug found and fixed along the way, not in any file this session
owns**: the Turbopack dev server (`next dev`, no flag — Next 16.2.7) silently
dropped every CSS rule in `globals.css` from `.sio-path` to EOF (the numbered
path, the halo, all of it) on every request, reproducibly, even after
deleting `.next` and a from-scratch restart — while `next dev --webpack` and
a direct `postcss([require("@tailwindcss/postcss")()])` run on the same file
both include the rules correctly (verified: `getComputedStyle` showed
`border-radius: 0px` under Turbopack, `13px` under webpack, byte-identical
source). Not a source bug — confirmed by loading the file standalone through
`lightningcss` and through the real `@tailwindcss/postcss` plugin, both
kept every rule. Screenshots below are shot on `next dev --webpack -p 3777`
for this reason; the dev-only Turbopack truncation should be flagged to
whoever next hits inexplicably-missing styles at the tail of `globals.css`
on the default dev server.

**Checks**: `npx tsc --noEmit` clean; all 25 `verify/*.py` suites green.
Dev server on :3777 (`--webpack`, see above); `REQUIRE_SIGN_IN` flipped to
`false` for screenshots — restored to `true` (found already restored by
part 2's concurrent session; confirmed via `git diff` showing no net change
before finishing).

**Screenshots + the tap-proof** (`scratchpad/flow-build/`):
`04-sio-path-full-chain.png` (SIO-041, ledger seeded so steps 1–3 read done
✓ and step 4 EtuDice is next-undone accented — the full 6-step order visible
at once), `02-sio-path.png` (SIO-001 cold, 4 of 6 steps — proves the filter),
`01-home-halo.png` / `06-halo-zoom.png` (Play's ring, forced to a mid-cycle
frame for the zoom since the animation fades most of each 2.2s loop),
`03a`/`03b`/`03c-tour-step*.png` (the 3-step tour). The click proof is not
just visual placement: a Playwright script measured the Next button's box
against `nav.cahier-bottombar`'s box (button bottom 741.8px, bar top 786px —
clear), ran `elementFromPoint` at the button's centre (returned the button
itself, not the bar), then called Playwright's own `.click()` — which
performs its own actionability hit-test and fails if another element would
receive the event — and confirmed the tour actually advanced to the "Start
here" card afterward. All four checks passed; script + full JSON output description above.

## 24 Aug — SpecuLearn objets-articles veto applied; boissons attribution restored

Two cleanups against the `eff47dd` merge, not new build work:

- **SpecuLearn objets-articles: the six-item reversal is vetoed.** The 24
  Aug build (`4158e2f`) had drawn purpose-made SVGs for gomme, agrafeuse,
  portefeuille, trousse, mouchoirs, passeport instead of honouring
  `SPECULEARN_ITEMS.md`'s bans on those six as unpicturable. Dan reviewed
  the actual renders (via a parallel Cursor session) and ruled: *"Veto all
  six, restore your original bans, ship at 14."* All six are back in
  `SPECULEARN_EXCLUDED_ITEMS`; the six SVGs are deleted from
  `public/objets-articles/` (recoverable at `4158e2f` if ever revisited);
  `SPECULEARN_ITEM_IMAGES` stays as the mechanism, now empty — Dan, on
  whether to migrate it into deck JSON instead: *"Leave it in TypeScript,
  it's a short list, don't over-engineer."* objets-articles is back to
  14/20 playable; colors and transport untouched. Totals across the three
  decks: 34 playable / 10 banned, matching `SPECULEARN_ITEMS.md` exactly.
  See its appendix for the full ruling and the doc updated in place.
- **Boissons attribution restored.** Resolving the `eff47dd` merge conflict
  in `docs/CONTENT_FLAGS_2026-08-23.md`'s boissons-closure bullet had
  picked the more detailed side and silently dropped the quoted
  `(Dan: "add the missing boisson part")` from the earlier wording — a
  defect in that merge, not a content decision. Restored alongside the
  detailed wording; nothing else in that bullet changed.

A third agent's local reset discarded an unpushed commit (`4a69dbf`) that
had made the same two fixes independently before this one landed — it was
never reachable from this checkout's object database, so nothing was
recovered from it; both fixes were simply redone here from the same source
material and pushed straight to `origin` to close the window for a repeat.

## 24 Aug — latent Complete It indexing bug (not fixed, flagged only)

`CompleteItContent.tsx`'s `buildEntries()` (`src/app/practice/complete-it/[collectionId]/CompleteItContent.tsx:114`)
builds each question's `itemIdx` from position in `practiceItems(deck)` (line
117), which filters out `role:`-tagged items (`src/lib/collections/display.ts:62`).
The render then reads `deck.items[entry.itemIdx]` (line 164) — indexing into
the *unfiltered* array. The two only agree when nothing is filtered out.

`possessives.json` (the deck this was checked against) carries no `role:`-
tagged items, so its expansion is unaffected. But this is not merely
hypothetical: `directions-matching.json` mixes 21 `role:`-tagged items with
19 full phrases (40 total), and Complete It is ungated — `deckActivityTabs()`
registers the `complete` flap for every curated deck unconditionally
(`CahierShell.tsx:600`) — so that deck has the flap live today.

Correction to an earlier overstatement of the symptom: prompt, answer, hints
and grading all derive from the same single lookup at line 164, so each
question stays internally self-consistent — it never mismatches its own
prompt and answer. What actually breaks is *which items get drilled*: the
`role:`-tagged fragments the filter exists to hide become the ones served
(their positions in the filtered array collide with early indices into the
unfiltered one), and full-phrase items past the filtered array's length are
never reached at all. So on `directions-matching`, some questions likely
drill role-fragment items that should have stayed hidden, and the tail of
the 19 full phrases likely never appears. Latent, not urgent; flagged here
so it doesn't cost someone an afternoon of confused debugging. Fix, when
it's next touched: build entries by item id (or index within `deck.items`
directly, applying the `role:` filter at read-time too) rather than mixing
an index space from one array with lookups into another.

## 24 Aug — closing state, and a process lesson from today's collisions

**Final state as of this commit:** `origin/main` and `live/main` are both at
`8e0b6d0` (PR #35 — the objets-articles veto + the first boissons-quote
restore attempt) and deployed; this commit + PR #36 add the indexing-bug
flag, the SpecuLearn appendix veto write-up (with Dan's render-review
findings and his style-mismatch reasoning), and the possessives
implicit-switch completion above. Once merged and deployed, `origin/main`
and `live/main` will both sit one commit ahead of `8e0b6d0`. SpecuLearn's
objets-articles is live at 14/20 (the veto applied); Dan's boissons
attribution — `(Dan: "add the missing boisson part")` — is restored in
`docs/CONTENT_FLAGS_2026-08-23.md`.

**The lesson, stated plainly because it cost real rework three times today:**
both `docs/CONTENT_FLAGS_2026-08-23.md` and this file were edited
concurrently by more than one agent — a Claude Code session and a separate
Cursor session, working on the same repo checkout pattern, sometimes at the
same time. That is exactly what dropped Dan's boissons attribution twice
(once in an earlier merge, a second time when a `git reset --hard` on his
machine discarded a session's uncommitted fix before it could land), and
what produced a duplicated SpecuLearn-veto write-up attempt (a second
session did the identical two doc edits independently, only to find PR #36
had already shipped them, and correctly stood itself down rather than
committing a conflicting version).

This file's own rule at the top — "Only ONE agent edits this file at a
time; say so in your commit" — is not new. It was not followed today. The
fix is not a new rule; it's actually following the one that already exists:
before starting a doc edit here or in `CONTENT_FLAGS_2026-08-23.md`, check
whether another session's work is already in flight (an open PR, a stash,
a running agent) before writing a competing version, the same way the
stood-down session did on its second pass today.

## 24 Aug — the Index gets a key ("I really don't understand how to read it")

The one open, unassigned item flagged 22 Aug: the U0–U4 unit grid and the
per-row circles carried no legend — colour and shape were the whole
message (litmus: decorative elements exempt, the tooltip is the label),
but nothing on the page itself decoded them for a first-time reader, and a
tooltip never shows on a phone. Not a case the litmus test's "redundant
text" rule covers — removing the decoder for a colour-coded grid would
leave the user unable to read the page at all, which is the test's own
bar for what stays.

**Built:** a `?` button next to the "📖 Index" heading (`IndexKey` in
`src/app/activities/page.tsx`), same on-demand pattern as `StatsHelp.tsx`
(closed by default, `aria-expanded`, dismiss on outside tap) — not inline
text. Opens a small popover naming exactly four things: the stop circle
(number → tap to go there, green ✓ once done), the tried cell (tier-toned
disc + your accuracy), the open cell (hollow ring — there, not tried), the
dash (nothing authored), and the three row-button quick links. Positioned
`fixed` + viewport-centred rather than anchored to the button — the
button sits mid-header-row, and a button-relative popover that wide ran
off the right edge of a phone screen in testing; fixed to centre before
shipping.

Guarded by nine new assertions in `verify/verify24.py` (component exists
and is rendered, starts closed, carries `aria-expanded`/`aria-label`,
names all four states in its own text) — 58 → 67 assertions in that file.
Screenshots taken on a 390px viewport (closed header row, open popover)
and sent to Dan directly — not checked in; `scratchpad/` is working-only.

Verified: `tsc` clean, all 26 verify suites green (867 total assertions),
`npm run build` clean. `REQUIRE_SIGN_IN` flipped to `false` for the dev
screenshots, confirmed restored to `true` before this commit.


## 25 Aug — the Menu tile EtuDice is renamed Sorting (display only)

One name had drifted onto three different things:

- `DiceConfig.newQuestion()` (`src/content/lessons/native/types.ts`) — a
  generator that emits a fresh instance of the same structure on every call.
  30 native lessons ship one; `buildCards.tsx` calls it per card and renders
  the same instance as an MCQ, a gap-fill and a build. **This is what Dan
  means by the dice** — *"switching to a different variation of the same
  structure, nothing more"* (25 Aug).
- The d12 in the lesson pager (`DIE_SIDES = 12`) — which does NOT vary
  anything: `setQueue((q) => q.slice(entry))` cuts cards off the front, so
  face 1 = all 12 cards and face 12 = one card. It is a run-length dial, and
  because the ramp runs easy → hard (4 MCQ, 4 gap, 3 build, 1 translate) a
  high roll is shorter *and* harder. **Unresolved — see below.**
- The Menu tile "EtuDice 🎲", whose blurb read *"Roll the d12 — it sets your
  starting card on the lesson ramp"* while the tile actually opened
  `/practice/dice/[collectionId]`: a group-sorting MCQ over the deck's
  Letris columns. No die, no variation.

Dan's ruling: *"if it is a sorting exercise that got created accidentally,
then i suppose we keep it, and maybe call it Sorting for now."* So the tile
is **Sorting 🗂️**, blurb *"Which group does each word belong to?"* — and
"EtuDice" now names only the d12 in the pager.

**Display rename only.** The registry key stays `"dice"`, so the route
`/practice/dice/[id]`, the deck tabs, `hasDicePractice()`, the activity
ledger keys (`dice-practice:`) and every saved progress record are untouched.
Changed strings: the registry row + its mergers note (`activities.ts`), the
drill's prompt / empty state / fallback emoji (`PracticeContent.tsx`), the
history label `KEY_SURFACES["dice-practice"].name` "Dice" → "Sorting"
(`labels.ts`), and the comments in `CahierShell`, `MenuSplash`,
`RailGroups`, `nextStep`, `SioModal`, `hints` that named the tile. Pinned in
`verify/verify29-rail.py`'s `EXPECT["practice"]`.

Verified: verify19/20/22/28/29 green (23/57/28/165/22), `tsc --noEmit`
clean, `npm run build` clean. In `out/`, the only surviving "EtuDice" is the
pager's own roll card — which is correct.

**The entry die is deleted.** Dan, same day: *"drop the shortcuts, learning
should not allow that."* `DIE_SIDES`, `ROLL_ENTRY` and `rollLabel` are gone
from `buildCards.tsx`; the roll card, its state (`face` / `rolled` /
`rolling` / `rollTimerRef`) and the `"roll"` branch are gone from
`LessonPager.tsx`; `exStart` is now `rules.length` and the denominator
`rules.length + ramp` (it used to carry a `+ 1` for the roll card). Every
learner walks all twelve cards — 4 MCQ → 4 gap → 3 build → 1 translate — in
order. The Sorting drill's leftover dice language went with it: its restart
button was "🎲 Roll again" (now "Sort again"), its end copy said "Roll
again" / "Keep rolling", and its low-score emoji was 🎲.

`verify22.py` now asserts the absence rather than the mechanism: no
`ROLL_ENTRY`, no `DIE_SIDES`, no `q.slice(` in the pager, no `"roll"` card.
That last one is the real pin — the failure mode to prevent is not the die
coming back by name, it is anything trimming the ramp before a learner walks
it.

Verified: verify19/20/22/28/29 green (23/57/30/165/22), `tsc --noEmit`
clean, clean `npm run build` clean, and a from-scratch `out/` contains no
"EtuDice", "🎲 Roll" or "roll for your start" anywhere.

**Not verified in a browser.** The pager sits behind `REQUIRE_SIGN_IN`, and
flipping that flag locally (the patch-23 precedent) was blocked by this
session's permission classifier, so the walk-through was static only: the
card sequence and denominator were re-read and reasoned through, not
observed. Worth one manual pass on a signed-in run before this is deployed.

