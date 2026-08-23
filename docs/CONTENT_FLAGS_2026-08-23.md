# Content wave 2026-08-23 — flags for Dan's check against the Atelier

Everything below shipped in the content-gap wave (eight authoring agents,
each self-checked against the uploaded A1U0–A1U4 unit PDFs). These are the
places an agent was extrapolating beyond the book or made a judgment call.
Nothing here blocks; strike anything wrong and it comes out.

## ÉcouTexte unit 0 (`textgen/unit0.ts`)
- « Il y a X étudiants » — SIO-007-backed; the book counts aloud instead.
- « Ça va, merci ! » as the ANSWER form — question is on a card, answer is extrapolated.
- « Voici… » / consigne + complement — natural teacher talk, not on a unit-0 page.
- Coucou / À plus tard / À bientôt — from the salutations deck; book unit 0 has only Bonjour/Bonsoir/Salut/Au revoir.
- « La classe, c'est lundi matin » leans on SIO-004's « C'est quand ? » chunk.

## ÉcouTexte unit 1 (`textgen/unit1.ts`)
- Matières / « étudiant(e) en ___ » — the ★ deck the book's unit 1 doesn't have (SIO-013 backs it).
- « Quelle profession ? » (deck title form) kept over the book's « Quelle est sa profession ? » (needs unit-2 possessives).
- Grèce, Cambodge, Grande-Bretagne excluded (their languages aren't in the languages deck).

## ÉcouTexte unit 2 (`textgen/unit2.ts`)
- Deck treated as authoritative where deck and book diverge: karaté/boxe/piano/photographie/promenades are in decks, not the book's leisure list; the book's théâtre/patinoire/musée aren't in aller-destinations.
- pouvoir + envies-besoins are `unit: 3` decks in this build, so they're excluded from unit 2 (task brief had them under U2).

## GramMarathon gaps (9 decks, 91 items)
- weather: only « Il y a » accepted for du soleil/du vent (deck column + Atelier corrigé); colloquial « Il fait du soleil » marks wrong.
- frequence keeps « parfois » (deck + Atelier bilan) though lessons teach « quelquefois ».
- question-words-14 answers in euros; money formally lands in U4.
- possessives limited to mon/ma/mes (deck scope); Atelier's table extends to ton/son/votre.

## xPlain lessons (6 new)
- Weather lesson omits the book's fourth frame « C'est nuageux / ensoleillé » — the deck has no column for it.
- Nationalities: -ien exemplar is *tunisien* (book uses *canadien*; Canada isn't in the deck).
- Salutations keeps the deck's extra greetings (Coucou, À demain, Bonne journée…) beyond the book's four.

## LexicaLater syllables (6 decks, 91 items)
- Left at zero BY RULE (full-sentence decks): sappeler, etre-etudiant, parce-que, negation-pas, pouvoir, envies-besoins, modaux-plans/avis, partitifs — sayable if you want them playable (faire-activites precedent).
- Flagged for permanent exclusion: alphabet (single letters), stress-pronouns (monosyllables), nationalities (withdrawn 20 Aug, stays out).
- PRE-EXISTING BUG: partitifs.json had 6 committed `syllables` arrays that don't reassemble to their sentences (dead weight) — REMOVED 23 Aug (partitifs-q01…q06 keep their fr).
- Unsure splits: con-ti-nuez, As-so-ciez!, pié-ton, A-vec.

## VocabulaRain sets (8 new)
- numbers-20-69 inverts direction (figure shown, word-structure sorted) — showing the word would contain the answer.
- aimer-activites leaves out écouter/regarder (need objects) and adorer/détester.
- Skipped as unfit (with reasons in the agent report): colors, consignes, frequence, directions-matching, sentence decks, atelier decks.

## Letris columns / EtuDice (8 decks)
- aliments uses food groups, not partitives (every fr already contains the partitive; FRUITS dropped — one fruit in the deck).
- transport uses à/en (the plan's le/la/l' row fits zero items in this deck).
- aimer-activites adds a VERBE (infinitif) column beyond the plan's noun articles — bless or veto.
- alphabet: E, O, Q, U fall outside the four rhyme columns (1–2-letter groups) — the engine excludes them; your call.
- ~~SKIPPED for concurrent edits~~ DONE 23 Aug: numbers-70-99 (bands 70s/80s/90s, all 30 retagged from col:num) and question-words (meaning axis from the Atelier U0 « Suivez le guide ! » sections — WHAT/WHO · WHERE/WHEN · HOW/WHY · HOW MANY; est-ce que and the inversion sentence carry no wh-category, left untagged — your call if they should).

## Known reds that are DECISIONS, not bugs
- `scripts/check-textgen.mjs` still fails unit 4 on « jus, thé » — the generator uses drinks no deck teaches; the real fix is the ★ boissons deck the audit found missing (needs your placement).
- SpecuLearn's 38 unserved decks each need your guessability call + emoji work before authoring.
- Pre-Tests missing on 6 production-atelier SIOs — looks by-design (in-class); confirm.
