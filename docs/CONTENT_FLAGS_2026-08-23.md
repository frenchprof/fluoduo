# Content wave 2026-08-23 — flags for Dan's check against the Atelier

Everything below shipped in the content-gap wave (eight authoring agents,
each self-checked against the uploaded A1U0–A1U4 unit PDFs). These are the
places an agent was extrapolating beyond the book or made a judgment call.
Nothing here blocks; strike anything wrong and it comes out.

**Dan ruled on the open items 24 Aug** — see RULED / CLOSED below. Anything
still unmarked is blessed as built.

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
  **RULED 24 Aug — keep it strict.** The corrigé is the standard they are examined on. No change; flag closed.
- frequence keeps « parfois » (deck + Atelier bilan) though lessons teach « quelquefois ».
  **RULED 24 Aug — present both together as equivalent.** The drill accepts either, and the lesson shows them side by side as equivalents rather than teaching one and marking the other. TO BUILD.
- question-words-14 answers in euros; money formally lands in U4.
- possessives limited to mon/ma/mes (deck scope); Atelier's table extends to ton/son/votre.
  **RULED 24 Aug — BUILT.** The real finding is not deck-vs-book but deck-vs-SIO: `possessives.json` is « Mon, ma ou mes ? » with three first-person columns (`col:mon`/`col:ma`/`col:mes`), while **SIO-022's own competence** asks for "mon/ma/mes … son/sa/ses, + notre/votre/leur … by the noun's gender/number". Worse, Complete It *printed* the possessive in the prompt (« mon book » → type « mon livre »), so nothing was being selected at all — a learner could score 100% without once demonstrating the competence.

  **What was built:** each of the 21 `col:`-tagged nouns now expands into six Complete It questions, one per person, on the pattern the `nationalities` deck already ships (`item.nat` + `NAT_SUBJECT`): the prompt gives the ENGLISH cue (« your (sg) · pen ») and the learner produces « ton stylo ». The gender gloss "(m)"/"(f)" is stripped from the cue, because that marker is the answer to the question being asked; it is available on demand from the ? ladder instead. 21 × 6 + the 10 full-sentence items = **136 questions, up from 31**. The forms are derived, not stored — possessives are regular, and the noun's agreement class is already declared by its `col:` tag. SIO text untouched, so the freeze holds.

  **Route rejected — do not re-propose:** re-gearing the letris columns to masculine/feminine/plural (this doc's own earlier wording, commit `ca761e9`). `prefix` lives on the letris *column* and never on the item — seven consumers build their phrase from `column.prefix + item.fr` — so the person would have had to move into `item.fr`, putting « ton stylo » on the tile face. That is the answer on the front of the question, the same rule `numbers-20-69` was built around. The letris board is untouched instead: three columns, MON/MA/MES, prefixes intact.

  Guarded by `verify/verify35-possessives.py` (39 assertions), which fails if a column rename ever switches the expansion off and silently restores the giveaway.

## xPlain lessons (6 new)
- ~~Weather lesson omits the book's fourth frame « C'est nuageux / ensoleillé » — the deck has no column for it.~~
  **CLOSED — already fixed 23 Aug** (syllabus fix 3.2): `des nuages` / `nuageux` / `ensoleillé` are weather-letris items 45–47 under a new fourth C'EST column, and the meteo memo carries the frame.
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
- ~~`scripts/check-textgen.mjs` still fails unit 4 on « jus, thé » — the generator uses drinks no deck teaches; the real fix is the ★ boissons deck the audit found missing (needs your placement).~~
  **CLOSED — already resolved 23 Aug** (Dan: "add the missing boisson part"). No separate deck was needed: `du thé`, `du jus d'orange` and `de l'eau` went into `aliments.json` as a `col:boissons` column. Re-run 24 Aug: check-textgen is green on all five units.
- SpecuLearn's 38 unserved decks each need your guessability call + emoji work before authoring.
  **RULED 24 Aug.** Recount: **15 served, 29 unserved** (≥6 emoji = served). Of the 29, twenty-one are grammar/function decks that cannot be drawn — `aimer-activites`(?), `aller-destinations`(?), `alphabet`, `avoir-etats`, `en-au-aux-a`, `envies-besoins`, `etre-etudiant`, `faire-activites`(?), `frequence`, `modaux-avis`, `modaux-plans`, `numbers-0-20`, `numbers-20-69`, `numbers-70-99`, `parce-que`, `possessives`, `pouvoir`, `quand-time`, `question-words`, `sappeler`, `stress-pronouns`, `vouloir-inviter` — **permanently excluded**, same treatment as the LexicaLater exclusion list. Emoji authoring is approved for the concrete-noun decks: **colors, core-nouns, days, matieres, objets-articles, professions, transport** (the three marked (?) are borderline verb-phrase decks — author only if they read cleanly as pictures). TO BUILD.
- Pre-Tests missing on 6 production-atelier SIOs — looks by-design (in-class); confirm.
  **RULED 24 Aug — confirmed by design.** Production ateliers are assessed in class; they get no pre-test. Flag closed.
