# The activity cull — what each one drills, and which tier it serves

**Peers, 31 Aug 2026. For Dan to strike through.**

Dan once said some activities are useful practice and others are not, then later
could not place the context. This is the concrete version of that question, and
the tiers make it answerable: **an activity is not good or bad in the abstract —
it is right or wrong for a tier.** `docs/SYLLABUS_TIERS.md` sorts all 50 stops
into Systemic Grammar (20), Lexical Core (15) and Phraseology (15).

Every description below was read out of the code, not remembered. Where I am
inferring rather than certain, it says so.

## The registry

`src/content/activities.ts` holds 20 rows. Three are pages, not activities —
My Progress, Leaderboard, Profile — leaving **17**.

## Systemic Grammar · 20 stops

The tier with a treatment Dan approved: concept → forms → the ★ ladder.

| activity | what it drills | verdict |
|---|---|---|
| **Memo** 📚 | The lesson itself — Les formes plus the generator. Not an activity so much as the container. | **keep**, it is the spine |
| **iComplete** ✏️ | Fill the gap in a generated sentence. This is the ★ ladder's own card. | **keep** |
| **ConjugaZone** 🔤 | Conjugation tables, drilled. Pure paradigm work. | **keep** |
| **GramMarathon** 🏃 | A timed run of grammar items across stops. | **keep** — the only cross-stop grammar surface |

## Lexical Core · 15 stops

Meaning-focused, semantic mapping, contextual retrieval. **Four activities land
here and three of them overlap.**

| activity | what it drills | verdict |
|---|---|---|
| **SpecuLearn** 💡 | Emoji → the word, four options from the same deck. Meaning recognition, and the deck's own rules make it rigorous (an emoji must depict the word and map to exactly one word in its deck). | **keep** — the best Tier 2 instrument there is |
| **4Mémoire** 🃏 | Flashcards, FR↔EN, spaced. | **keep** — plain, and nothing else does recall both ways |
| **LexicaLater** 🧰 | Assemble the word from syllable tiles, against decoy fragments. Word *shape*, not meaning. | **keep**, but it is the only activity drilling spelling — worth knowing that is what it is for |
| **Sorting** 🗂️ | An MCQ over the deck's Letris columns: which column does this word belong to. | **the one to look at** — see below |
| **VocabulaRain** 🌧️ | Falling tiles, drop each word into its Letris column. | same drill as Sorting |

### Sorting and VocabulaRain drill the same thing

`CahierShell.tsx` says it outright: *"Sorting is an MCQ over the deck's letris
columns — no columns, no game."* Both ask **which column does this word belong
to**, over the same four columns from the same `gameConfig`. One is a static
MCQ, the other is falling tiles.

Two consequences.

**They only work where the columns exist.** Sorting is gated to the 21 decks
that declare Letris columns. For the other 29 stops the tile is simply absent.

**This is the drift you named.** You said the framework had drifted "into things
like EtuDice and Sorting", and I then reproduced it exactly: my first Tier 2
ladder asked which course a word belonged to, and your verdict was that it asked
the wrong questions. It was Sorting wearing a ladder's clothes.

That does not make categorisation worthless — it makes it **the wrong thing to
put on the ladder**. The revised sample climbs meaning → article → article and
noun, and the categorising is gone from it entirely. So the question for you is
narrow: does a categorisation drill deserve *two* tiles, one, or none?

My read, for striking through: **keep VocabulaRain, cut Sorting.** The game
version is the one that earns the drill; the MCQ version is the same question
without the reason to answer it.

## Phraseology · 15 stops

Chunks and pragmatic formulas, then deployed in an atelier. **This tier is
thinly served and it is the gap.**

| activity | what it drills | verdict |
|---|---|---|
| **ComposeIt** 🧩 | Compose a dialogue turn by turn, solo or against the tutor. Covers RolePlayer and WritInstructor. | **keep** — the closest thing to an atelier the app has |
| **ChaTutor** 🤖 | Free conversation with correction. | **keep**, though it serves every tier and none in particular |
| **ÉcouTexte** 🎧 | Listen and transcribe. Dictée is this, not a separate activity. | **keep** — hearing a chunk whole is how a chunk is learned |

Nothing here does **step 2 of the Tier 3 treatment**: *choose the right block
for the situation.* Is it *bon voyage* or *bonne chance*? That is the skill, it
is pragmatic rather than grammatical, and no current activity asks for it.

## Serves every tier, or none

| activity | what it does | verdict |
|---|---|---|
| **DéjàRevu** 🔖 | Spaced review of everything due. A scheduler, not a drill. | **keep** — tier-neutral by design |
| **WorDrill** 🎙️ | Say it; the mic grades the pronunciation. | **keep** — the only productive-speech surface |
| **VoixLà** 🔊 | Hear it spoken. | **keep**, but it is a *feature* of other activities more than a destination |
| **NumBus** 🚌 · **NumBourse** 📈 | Numbers, under time pressure. | **keep** — they serve three stops (7, 18, 45A) and nothing else does |

## What I would put to you, in one line each

1. **Sorting** — cut it, keep VocabulaRain? Same drill, two tiles.
2. **VoixLà** — is a listen-only page a destination, or should it fold into the
   activities that already speak?
3. **Tier 3 has no "choose the right block" activity.** Worth building, or is
   ComposeIt close enough?
4. **NumBus and NumBourse** both drill numbers. Two games for three stops is
   generous; is that deliberate?

Everything else I would leave alone.
