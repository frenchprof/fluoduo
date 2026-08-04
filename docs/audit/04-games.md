# 04 — Games inventory

## Engine modules (`src/games/`)

| Path | Role |
|---|---|
| `letris/LetrisGame.tsx` | Vocabularain core (~804 lines): falling tiles, columns, salvage |
| `letris/LetrisFlow.tsx` | Pre-round study → game flow |
| `letris/FlashcardLesson.tsx` | Pre-game study table / flashcards (~569 lines) |
| `letris/sets.ts` | Resolves letris sets (legacy JSON + curated bridges) |
| `letris/resolve.ts` | Set resolution helpers |
| `letris/speech.ts` | Web Speech TTS (`speak`, `buildSentence`) — shared by multiple surfaces |
| `lexicalator/Lexicalator.tsx` | Syllable assembly conveyor (~834 lines) |
| `matching/MatchingGame.tsx` | Pair matching UI |
| `matching/toMatchingSet.ts` | Collection → MatchingSet adapter (pipeline proof) |
| `compose/ComposeGame.tsx` | Compose entry / mode switch |
| `compose/ComposeSolo.tsx` | Solo scenario composition |
| `compose/ComposeDialogue.tsx` | Scripted dialogue (~499 lines) |
| `compose/banks.tsx` | Phrase banks: directions, cafe, greetings, rendezvous, magasin, marche |
| `dice/DiceTrainer.tsx` | Roll-a-sentence trainer (lessons / bonus) |
| `dice/DicedPractice.tsx` | Deck dice MCQ practice |
| `numbus/NumBus.tsx` | Hear-and-type numbers game (~993 lines) |
| `numbus/NumBusSetup.tsx` | Setup / level picker |
| `numbus/config.ts` | NumBus configuration |
| `numbus/frenchNumber.ts` | Number → French words |
| `numbourse/NumBourse.tsx` | Shouted numbers typing game (~566 lines) |
| `numbourse/frenchNumbers.ts` | **Separate** number→French helper (parallel to numbus) |
| `audio/sfx.ts`, `chiptune.ts`, `mute.ts` | Shared SFX / mute |
| `CreditsSplash.tsx` | Shared credits splash |

## Route ↔ engine mapping

| Learner-facing name | Route prefix | Engine |
|---|---|---|
| VocabulaRain | `/games/vocabularain` | letris |
| LexicaLater | `/games/lexicalater` | lexicalator |
| Match It | `/games/matching/[collectionId]` | matching |
| Compose It | `/games/compose/[bankId]` | compose |
| NumBus | `/games/numbus` | numbus |
| NumBourse | `/games/numbourse` | numbourse |
| Language Sorter (hidden) | `/hidden/vocabularain` | letris + custom cognate set |

## Content sources

| Game | Primary content source | Secondary / legacy |
|---|---|---|
| Matching | Curated collections via `toMatchingSet` | Legacy `directions-matching.json` still present under `src/content/` |
| Vocabularain | `listLetrisSets()` / legacy `src/content/*-letris.json` + some collections | Documented as Blueprint deviation (dual store) |
| Lexicalator | Collections with verified `syllables` (`isLexReady`) | — |
| Compose | Hardcoded banks in `banks.tsx` | — |
| NumBus / NumBourse | Procedural numbers + speech | Dual French-number modules |
| Dice | Collections + native lesson trainers | — |

## Known naming inconsistencies

- Route folder: `lexicalater` · Package folder: `lexicalator` · UI label: LexicaLater.
- Game folder: `letris` · Product name: VocabulaRain / Vocabularain.
- Hidden cognate game reuses Vocabularain branding under `/hidden/`.
