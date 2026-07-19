# FluoLingo handover — session of 2026-07-05 (taxonomy collapse + UX overhaul)

For the next Claude Code chat. Read this AND `AGENTS.md` (litmus rule) before
touching anything. Previous long-form handoff: `HANDOFF_NEXT_CLAUDE.md`
(2026-07-01, still valid for content pipeline / Firebase background).

## Operating agreements with Dan

- **Ship rhythm**: every batch → commit → push `claude/fluolingo-taxonomy-artifacts-73a2k7`
  (`--force-with-lease` after resets) → PR → **squash-merge immediately**
  (PRs #27–#58 this session). After each merge: `git fetch origin main && git
  reset origin/main` before the next batch.
- **Litmus rule** (AGENTS.md): any TEXT whose removal doesn't stop the user
  finding the right answer is redundant — remove it. Visuals/decor exempt;
  progress counters keep; explanations behind WHY buttons, never inline.
- **Verification loop**: `npx tsc --noEmit` → `npx next build` (static export
  to `out/`) → `python3 -m http.server 88XX --directory out` + playwright-core
  with `executablePath: '/opt/pw-browsers/chromium'`. The python server needs
  explicit `.html` paths. Servers die between Bash calls — restart per test.
- **Domains** *(superseded 2026-07-19 — fluolinguo.com is RETIRED, no DNS
  records; do not use it)*: production = **fluolingo.withdrchan.com**
  (Cloudflare Pages, auto-deploys from `main`); fluolingo.com 302-redirects
  there. See docs/DEPLOY.md for current domain facts.
- SSR-safe randomness: `Math.random` only in mount effects / handlers.
- Firestore rules hardened in repo (`firestore.rules`) — **Dan still has to
  paste them into the Firebase console** (pending on his side).
- `REQUIRE_SIGN_IN = false` in `src/lib/authConfig.ts` — flip to `true` at
  launch.

## Architecture after the great collapse (state of `main`)

**Taxonomy — 7 doors per deck, ONE source of truth**:
`deckActivityTabs()` in `src/components/CahierShell.tsx` — order: Pre-Test →
Flip It → Lesson → Say It → Lexicalator → Vocabularain → Compose It.
Index page, unit rails, popup flaps, and SioDetail chips ALL derive from it.
ConjugaZone and GramMarathon no longer exist as doors — both folded into the
Lesson; the weather/directions "bespoke units" dissolved into Compose It.

**Navigation** (`CahierShell` + `src/components/siteTabs.ts`): global flap row
Home / Guide / Unité 0–4 / Index on every notebook page; page-context flaps as
a second smaller tier (`cahier-tab--sm`), Flip It views third (`--xs`); tiers
160/152/144px, deeper tiers attach at their own sheet edge (`cahier-tab--back1/2`).
Level-2 = REAL floating popups: `/practice/*` and `/lessons/*` URLs render
`UnitActivityPage` → `UnitSection forceOpen` → `SioModal` open over the live
unit page (EMBEDDABLE set: say / complete / dice / grammarathon / lesson).
Closing rewrites the URL to `/unit/N`. Real-DOM nested sheets: `.cahier-stack`
/ `.cahier-stack--inner`.

**Unified Lesson** (`src/app/lessons/LessonFlow.tsx`): Lire (memo ??
DECK_MEMOS ?? atelier DialoguePlayer — never a Flip It link) → Pratique
(`DicedPractice`) → Générateur 🎲 (native-lesson decks only).
**DicedPractice** (`src/games/dice/DicedPractice.tsx`): ★ pick the gap-word
among 4 · ★★ type the gap (`gradeGap` tiers) · ★★★ type the full sentence from
a French-only `(lemma)` cue · ⭐ Bonus EN→FR. Gapless decks fall back to
Facile(en→4fr) / Intermédiaire(CompleteIt embedded) / Bonus. Shared grading in
`src/lib/practice/cloze.ts`.

**Memos** (`src/content/memos.tsx`): 25 entries; a memo is a RULE or a list's
organizing principle, never an enumeration (alphabet by vowel sound, colors by
cognate status, commerces by morphology…).

**Grading tolerance**: typed = strict (accents forgiven one tier); Say It has
a homophone tier (`silentEq` — silent -s/-x/-nt) → "Parfait ! (même
prononciation)"; questions-oui-non stays strict on purpose.

**Content**: 50 SIOs / 50 decks, all with a genuine Lire. SIO-028 was
rededicated from *avec* to **negation-pas** ("Pas de ou pas le ?" — ne…pas de
vs aimer+le/la/les), new deck `negation-pas.json`, pretest `u2-sio028.json`
rewritten, `avec-qui.json` deleted. Unit-0 SIOs have MCQs in
`src/content/sios/unit0-questions.ts` (NO JSON pretests); units 1–4 pretests
in `src/content/pretests/*.json`.

**Audio** (`src/games/audio/chiptune.ts`): master gain + `setVolume`
(localStorage `fluolingo:volume`, slider in Lexicalator, governs music+SFX).

**Tour** (`src/components/FirstTour.tsx`): first visit → offer card bottom
left; after (or after declining) a **permanent ✨ chip stays bottom-left** on
every notebook page and replays the 4-step spotlight tour (Dan 2026-07-05:
"permanently on the bottom left", "revoir should be floating").

## This session's last batch (may be in flight — check git log)

1. **Bug fix**: Home path links `/unit/0#SIO-001` opened an EMPTY popup
   (UnitSection's generic SioModal has no Unit-0 MCQs). Fixed: unit-0 hash +
   forceOpen now route into `Unit0Panel`'s own modal; UnitSection skips its
   modal for unit 0.
2. **SFX jingles** (`src/games/audio/sfx.ts`): `sfx.correct()` (Duolingo-ish
   ta-daa), `sfx.wrong()` (soft low buzz), `sfx.stage()` (= fanfare) wired into
   every grading site (PretestQuiz, Unit0Panel, DiceTrainer+Bonus,
   DicedPractice, CompleteIt, GramMarathon, SayIt, dice PracticeContent,
   Lexicalator, Letris, ComposeDialogue). Rule: one jingle per verdict.
3. **BetaNotice** (`src/components/BetaNotice.tsx`, mounted in layout):
   once-per-browser "Un mot de Dr Chan 👋" modal — beta apology + XP-for-bugs
   pitch, localStorage `fluolingo:beta-notice.v1`.
4. **Permanent tour chip** + **guide rewrite** (succinct card layout).
5. This handover doc.

## Open items for the next chat

- **Dan to do**: deploy `firestore.rules` in console · real-device pass ·
  signed-in retest · eventual fluolingo.com custom-domain switch · review the
  25 memos · pick Compose It banks for U1/U2 (recommended: Faire connaissance
  U1, On fait quoi ce week-end ? U2, both dialogue-mode).
- **Code candidates**: author `lemma` fields for more decks (only modaux +
  etre-etudiant have them → only those get the true ★★★ level); more Compose
  It banks; flip `REQUIRE_SIGN_IN` at launch.
- **Known papercuts**: stale `.next/types` errors after page deletions
  (harmless — rerun tsc after a build); http.server needs `.html` suffixes.
