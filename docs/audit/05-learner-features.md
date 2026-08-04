# 05 — Learner features

## Journey spine

1. **Home** (`/`) — Bienvenue hero, XP/streak/gems chips, Continuer, road map of ~50 SIOs (`RoadMap` + `HomeDashboard`).
2. **Unit hubs** (`/unit/[unit]`) — SIO tiles open `SioModal`.
3. **SIO modal** — pretest (inline), Bring-to-class misses, lesson links, activity flaps.
4. **Lesson flow** (`LessonFlow`) — Lire → Débutant → Intermédiaire → Difficile (absorbs drills where data exists).
5. **Practice / games** — retrieval in alternate modes.
6. **DéjàRevu** (`/reviser`) — spaced / error-biased revision.
7. **Profil / My Progress** — economy + personal analytics.

Nothing is sequentially locked (`progress.ts`: every SIO always reachable).

## Feature catalogue

### Preparation

| Feature | Entry | Mechanism |
|---|---|---|
| Pretests | SIO modal + `/pretests/[id]` + picture variant | Authored banks; miss list → Bring to class |
| SpecuLearn | `/practice/speculearn` | Learn-by-guessing gallery + per-collection |

### Instruction / input

| Feature | Entry | Mechanism |
|---|---|---|
| Native grammar lessons | `/lessons/[slug]` | TSX memos + trainers |
| Deck Lesson flow | `/lessons/deck/[id]` or flaps | Unified multi-section scroll |
| ÉcouTexte | `/practice/ecoutexte` | Listening to generated / mini texts |
| Model dialogues | Production SIOs | `DialoguePlayer` + `ateliers.ts` |
| ChaTutor | `/tutor` | AI chat via `/api/tutor` |

### Retrieval practice

| Feature | Entry | Notes |
|---|---|---|
| Flip It | `/practice/flip-it/[id]` | Flashcards, options, test-yourself |
| Say It | `/practice/say-it/[id]` | Mic pronunciation |
| WorDrill | `/practice/wordrill` | Aggregated Say It across units |
| Complete It | route + inside Lesson | Typed cloze |
| Dice practice | route + Lesson / native | MCQ / roll sentences |
| GramMarathon | route + Lesson + finale | Gap items / marathon |
| ConjugaZone | `/conjugaison` | Verb endings |
| Match It | `/games/matching/[id]` | Pair matching |
| VocabulaRain | `/games/vocabularain/...` | Category sort rain |
| LexicaLater | `/games/lexicalater/...` | Syllable assembly |
| Compose It | `/games/compose/[bank]` | Phrase-bank production |
| NumBus / NumBourse | `/games/numbus`, `/games/numbourse` | Number listening/typing |
| DéjàRevu | `/reviser` | Due / missed item mixes |

### Meta / economy / social

| Feature | Entry | Notes |
|---|---|---|
| XP, streak, gems, levels | progress + economy | Hearts removed (anti-pattern) |
| Badges & cosmetics | `/profil` | Gem boutique for accent colours |
| Classement | `/leaderboard` + overlay | Raw XP board (Firestore) |
| My Progress | `/moi` | Learner-facing responses/sessions view |
| Custom decks | `/decks/new`, `/decks/view?id=` | Firestore-backed |
| Index | `/activities` | Full deck × activity matrix + search |
| Guide / Quick Guide | `/guide`, home splash | Onboarding |
| Feedback | floating button | Firestore `feedback` |
| TTS tool | `/tts` (VoixLà) | Standalone speech tool |
| Account | Google optional | Sync + telemetry when signed in |

### Supplements

- `public/supplements/` standalone HTML referenced from deck flaps; telemetry via `supplement.open` / `supplement.answer` events.

## Content backing learner features

| Store | Location | Used by |
|---|---|---|
| SIOs | `src/content/sios/` | Hub, road map, unit pages |
| Collections | `src/content/collections/*.json` | Most drills/games |
| Pretests | `src/content/pretests/` | Pretest engines |
| Native lessons | `src/content/lessons/native/` | Lesson pages |
| Legacy letris JSON | `src/content/*.json` | Vocabularain sets |
| Compose banks | `src/games/compose/banks.tsx` | Compose It |
| Textgen | `src/lib/textgen/` + content | ÉcouTexte / generated listening |
