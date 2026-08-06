# Learner pages

**Audit date:** 2026-08-05  
**Scope:** Routes and features learners use today.  
**Constraint:** Documentation only — no redesign proposals.

## Journey spine (as implemented)

1. **Home** (`/`) — Bienvenue hero, XP/streak/gems chips, Continuer, road map of ~50 SIOs (`RoadMap` + `HomeDashboard`).
2. **Unit hubs** (`/unit/[unit]`) — SIO tiles open `SioModal`.
3. **SIO modal** — pretest (inline), Bring-to-class misses, lesson links, activity flaps.
4. **Lesson flow** (`LessonFlow`) — Lire → Débutant → Intermédiaire → Difficile (absorbs drills where data exists).
5. **Practice / games** — retrieval in alternate modes.
6. **DéjàRevu** (`/reviser`) — spaced / error-biased revision.
7. **Profil / My Progress** — economy + personal analytics.

Nothing is sequentially locked (`src/lib/progress.ts`: every SIO always reachable).

Google sign-in is required for learning activities when `REQUIRE_SIGN_IN === true` (`AuthGate`). Feedback remains anonymous.

---

## Page catalogue by purpose

### Orientation & chrome

| Page | URL | What exists |
|---|---|---|
| Home | `/` | Journey overview, Continuer, road map, Quick Guide entry |
| Guide | `/guide` | Full learner guide (`GuideBody`) |
| About | `/about` | About / privacy / course framing |
| Index | `/activities` | Deck × activity matrix + search |
| Classement | `/leaderboard` (+ top-bar overlay) | XP leaderboard |
| Profil | `/profil` | Level, badges, cosmetics boutique |
| My Progress | `/moi` | Learner-facing sessions / responses view |

### Unit / SIO / lessons

| Page | URL | What exists |
|---|---|---|
| Unit hub | `/unit/0`–`/unit/4` | SIO tiles; Unité 0 has `Unit0Panel` |
| Standalone SIO | `/sio/[id]` | Same SIO content outside modal |
| Native lesson | `/lessons/[slug]` | Grammar memo + trainers |
| Deck lesson | `/lessons/deck/[collectionId]` | Unified multi-section scroll |

### Preparation (pretests)

| Page | URL | What exists |
|---|---|---|
| Authored pretest | `/pretests/[id]` | MCQ banks; miss list → Bring to class |
| Picture pretest | `/pretests/picture/[collectionId]` | Image-prompted pretest |
| Inline pretest | inside `SioModal` | `PretestQuiz` (not a separate URL) |
| SpecuLearn gallery | `/practice/speculearn` | Learn-by-guessing index |
| SpecuLearn run | `/practice/speculearn/[collectionId]` | Per-collection speculation drill |

### Instruction / input

| Page | URL | What exists |
|---|---|---|
| ÉcouTexte | `/practice/ecoutexte` | Listen to mini / generated texts |
| Model dialogues | Production SIOs | `DialoguePlayer` + `ateliers.ts` |
| ChaTutor | `/tutor` | AI chat via `/api/tutor` |
| VoixLà | `/tts` | Standalone TTS tool |

### Retrieval practice

| Activity | URL | Notes |
|---|---|---|
| Flip It | `/practice/flip-it/[id]` | Cards / See All / Table; buckets; notes; test mode |
| Say It | `/practice/say-it/[id]` | Mic pronunciation |
| WorDrill | `/practice/wordrill` | Aggregated Say It across units |
| Complete It | `/practice/complete-it/[id]` (+ Lesson) | Typed cloze |
| Dice | `/practice/dice/[id]` (+ Lesson / native) | MCQ / roll sentences |
| GramMarathon | `/practice/grammarathon/[id]` + `/finale` | Gap items / marathon |
| ConjugaZone | `/conjugaison` | Verb endings |
| Match It | `/games/matching/[id]` | Pair matching |
| VocabulaRain | `/games/vocabularain/...` | Category sort rain (letris engine) |
| LexicaLater | `/games/lexicalater/...` | Syllable assembly |
| Compose It | `/games/compose/[bank]` | Phrase-bank production |
| NumBus | `/games/numbus` | Hear-and-type numbers |
| NumBourse | `/games/numbourse` | Shouted numbers typing |
| DéjàRevu | `/reviser` | Due / missed item mixes |

### Decks (learner-authored)

| Page | URL | What exists |
|---|---|---|
| New deck | `/decks/new` | Paste / builder UI |
| Curated deck hub | `/decks/[id]` | Activity doors for a collection |
| Study / MCQ | `/decks/[id]/study`, `/decks/[id]/mcq` | Curated runners |
| User deck view/study/MCQ | `/decks/view?id=`, `/study?id=`, `/mcq?id=` | Static-export query-param pattern |
| My decks | fragment on Home / Index | `MyDecks.tsx` |

### Hidden / supplemental

| Surface | URL / path | What exists |
|---|---|---|
| Language sorter | `/hidden/vocabularain` | Cognate VocabulaRain; noindex |
| Supplements | `public/supplements/` | Standalone HTML (e.g. `aliments-devine.html`); telemetry via supplement events |

---

## Navigation entry points learners actually see

| Entry | Mechanism |
|---|---|
| Unit flaps 0–4 | Top flap rail (`siteTabs`) |
| Tool flaps | Lower rail + ☰ menu (`toolTabs`) |
| Home | FluOlinGo mark / 🏠 |
| Classement | 🏆 top-bar icon → overlay or `/leaderboard` |
| Account | Circled initial → `/profil` (and related) |
| My Progress | Top-bar history control → `/moi` |
| Search | Top-bar search → `SearchOverlay` / `DeckSearch` |
| Continuer | Home CTA → next suggested SIO / activity |
| Road map nodes | Home snake → SIO modal / unit |
| Index matrix cells | `/activities` → activity deep links |
| Feedback | Floating button (always available) |

---

## Content backing learner pages

| Store | Location | Used by |
|---|---|---|
| SIOs (~50) | `src/content/sios/` | Hub, road map, unit pages |
| Collections (44 JSON) | `src/content/collections/` | Most drills/games |
| Pretests (35 JSON) | `src/content/pretests/` | Pretest engines |
| Native lessons (27 modules) | `src/content/lessons/native/` | Lesson pages |
| Legacy letris JSON (27) | `src/content/*.json` | VocabulaRain sets |
| Compose banks | `src/games/compose/banks.tsx` | Compose It |
| Textgen | `src/lib/textgen/` + content | ÉcouTexte / generated listening |
| Progress / economy | `src/lib/progress.ts`, `economy.ts` | XP, streak, gems, badges (local-first) |

---

## Economy / meta features on learner surfaces

| Feature | Where surfaced |
|---|---|
| XP, streak, gems, levels | Home chips, Profil, toasts (`RewardToast`) |
| Badges & cosmetics | `/profil` (gem boutique for accent colours) |
| Classement | `/leaderboard` + overlay |
| Notes on Flip It | local-first + Firebase sync (`src/lib/notes/`) |
| Item SRS / reviser schedule | progress store → `/reviser` |
| First tour / beta notice | overlays on first visits |
| Page view telemetry | signed-in only (`PageViewTracker`) |
