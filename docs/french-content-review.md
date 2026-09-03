# French learning-target review — FluOLinGo / LAF1201 (A1)

**Date:** 3 Sep 2026  
**Scope:** native-speaker + teaching review of learner-facing French in this repo  
**Audience:** NUS LAF1201 absolute beginners  
**Method:** source files, not a live-site scrape. English UI chrome (titles, can-dos, WHY blurbs, game help) is out of scope unless it teaches the wrong French.

This PR is **report-only**. No product copy was changed. Nothing found was a safe one-character typo; the P0/P1 items are pedagogical or register choices that need Dan’s ruling before a rewrite.

---

## 1. Inventory

| Area | Where it lives | Covered? | Notes |
|---|---|---|---|
| **Collections / Flip It / MémoiRecall** | `src/content/collections/*.json` (44 decks) + `atelierDecks.ts` | Yes | Primary learner French. ~1,500 `fr` / gap / label strings. |
| **Atelier dialogues** | `src/content/ateliers.ts` | Yes | Six production SIOs. Decks are generated from these lines. |
| **Pretests U1–U4** | `src/content/pretests/*.json` (35 files) | Yes | Gap-fill MCQ: `sentenceBefore` + `answer` + `fullSentence`. ~1,700 strings. |
| **Unit 0 pretests** | `src/content/sios/unit0-questions.ts` | Yes | **No** `src/content/pretests/unit0/` folder. All ten Unit-0 banks live here (stems, options, TTS, `example.fr`). |
| **SIO map chips + can-dos** | `src/content/sios/sios.json` | Yes | Learner-facing French is the `fr` chip. `topic` / `short` / `canDo` are English on purpose. |
| **Lessons (native)** | `src/content/lessons/native/*.tsx` + `*.gen.ts` | Yes | Mémo chips, model sentences, bonus EN→FR, pitfall French. English concept prose skipped. |
| **ConjugaZone** | `src/content/conjugaison.ts` | Yes | 66 présent paradigms. Forms are standard. |
| **Textgen** | `src/content/textgen/unit0.ts`–`unit4.ts` | Yes | Generated listening texts. Gender / Enchanté(e) / articles are well constrained. |
| **Mémos / chapters** | `src/content/memos.tsx`, `chapters.ts` | Yes | Chapter titles (`Qui suis-je ?`, `À table !`) are sound. Market dialogue in memos is natural. |
| **Legacy Letris JSON** | `src/content/*-letris.json` and other root copies | Yes (spot + schema) | **Still live.** `src/games/letris/sets.ts` imports **root** files, not `collections/`. Flip It and Letris can drift. |
| **Finale / Devine** | `src/content/finale.ts`, `devine-aliments.json` | Yes | Gap French and food lexica look sound. Accentless typing alts (`medecin`) are input-tolerant, not taught forms. |
| **`src/content/pretests/unit0/`** | — | **Not found** | Unit 0 is `unit0-questions.ts`. |
| **`src/content/games/`** | — | **Not found** | Game French sits in collections + the root Letris JSON. |
| **Skills / ChaTutor / Compose** | `hints.ts`, `functions/api/*` | No learner French bank | Hints are English chrome. Server prompts are not a deck. |
| **Activities / nav / supplements** | `activities.ts`, `nav.ts`, `supplements.ts` | Yes | No extra French can-dos. Stop French is `sios.json` → `fr`. |

**Open PRs checked before branching:** #152 (Class bag microcopy), #153 (Unit-0 pretest href). Neither rewrites the French banks this review cites.

**What is generally strong.** Articles, partitives, `avoir` vs `être` states, country gender, nationality four-forms, transport `en` / `à`, negation `pas de` vs `pas le`, market lines (`Vous désirez ?` / `Je voudrais…` / `Ça fait combien ?`), and the SIO-010 atelier’s `Enchanté` / `Enchantée` pair are the work of someone who knows this syllabus. The problems below are concentrated, not a rotten corpus.

---

## 2. Priority key

- **P0 — blocking.** Wrong French is taught or accepted as the answer. A learner who copies the key leaves with an error.
- **P1 — awkward / misleading.** A native would not say it that way, or two surfaces teach opposite things. Fix before the next QC pass.
- **P2 — nit / style.** Attested but clumsy, incomplete, or a coverage gap. Fix when touching the file.

Spoken-register questions (`Comment tu t’appelles ?` vs inversion) are **not** flagged. This course trains oral A1; the non-inverted form is what NUS students will hear.

---

## 3. Findings by area

### A. Collections (Flip It / MémoiRecall)

#### P1 — `Nous nous appelons Léa et Marc.`

| | |
|---|---|
| **Current** | `Nous nous appelons Léa et Marc.` |
| **File / id** | `src/content/collections/sappeler.json` · `sappeler-05` |
| **Also** | Unit 0 stem `[Nous,] Nous ___ Marc et Léa.` → `nous appelons` (`unit0-questions.ts` · SIO-001) |
| **Why** | `s’appeler` gives **one** name to **one** subject. Two given names on a plural reflexive is a calque of “Our names are…”. Natives say *Je m’appelle Léa et lui Marc*, *Nous sommes Léa et Marc*, or *On s’appelle Léa et Marc* only as a joke / band name. The card exists to show the *nous* form; the names break the verb. |
| **Fix** | Keep the person, drop the two-name stunt: `Nous nous appelons les Martin.` **or** split: `Je m’appelle Léa. Lui, c’est Marc.` Same for the Unit 0 stem. |

#### P1 — `Vous vous appelez Madame Martin.`

| | |
|---|---|
| **Current** | `Vous vous appelez Madame Martin.` |
| **File / id** | `src/content/collections/sappeler.json` · `sappeler-06` |
| **Why** | *Madame* is a **title you use to address someone**, not a slot in `s’appeler`. You say *Bonjour, Madame Martin* or *Vous êtes Madame Martin ?* You do not *vous appelez Madame Martin*. The deck already has the right address cards (`sappeler-11`–`13`). This one glues title + verb and teaches the wrong join. |
| **Fix** | Formal name question: `Comment vous vous appelez ?` **or** confirmation: `Vous vous appelez Martin ?` Keep *Madame Martin* on the greeting cards only. |

#### P1 — `Enchanté !` with no feminine counterpart

| | |
|---|---|
| **Current** | `Enchanté !` |
| **File / id** | `src/content/collections/salutations.json` · `salutations-03` |
| **Also** | `src/content/salutations.json` (legacy Letris); `lessons/native/salutations.tsx` dice + bonus; `ca-secrit.tsx` bonus |
| **Why** | A woman says **`Enchantée`**. The SIO-010 atelier already models this (Marc → *Enchanté*, Léa → *Enchantée*). The greetings deck and the lesson bonus teach only the masculine form as “Nice to meet you!”. Half the class is trained to mis-agree on themselves. |
| **Fix** | Add `Enchantée !` as a paired item (and accept both on the EN→FR bonus). Do not replace the masculine form. |

#### P1 — `Bonne nuit !` filed as a general goodbye

| | |
|---|---|
| **Current** | `Bonne nuit !` tagged `col:partir_std` (“BYE · anytime”) |
| **File / id** | `src/content/collections/salutations.json` · `salutations-11` |
| **Why** | *Bonne nuit* is a **bedtime** wish (same household, going to sleep). It is not *Au revoir* / *Bonne journée*. The Unit 0 pretest already teaches this correctly (“Bonne nuit is for bedtime, not leaving class”). The deck undoes that lesson by putting it in the anytime-goodbye column. Learners will say it to a shopkeeper. |
| **Fix** | New column or note: “bedtime only”. The salutations **lesson** dice item already has the right prompt (*going to bed, 22 h*). Align the deck tag with that. |

#### P1 — `C’est où ? — C’est une classe.`

| | |
|---|---|
| **Current** | `classe` / en: `classroom` / example: `C'est où ? — C'est une classe.` |
| **File / id** | `src/content/collections/core-nouns.json` · `core-nouns-06` |
| **Also** | `lessons/native/core-nouns.tsx` bonus: `It's a classroom.` → `C'est une classe.` |
| **Why** | *Une classe* is the **group of students** (or the course). The **room** is *une salle de classe*. Answering *C’est où ?* with *C’est une classe* is the wrong question word and the wrong noun. Unit 0’s own pretest already has `salle de classe` as a separate item. |
| **Fix** | Either retag as `q:quoi` / en: `class (group)` with `C'est quoi ? — C'est une classe.`, or change the French to `salle de classe` and keep *où*. |

#### P1 — `du tonnerre` as an `il y a` tile

| | |
|---|---|
| **Current** | `du tonnerre` (column *Il y a*) |
| **File / id** | `src/content/collections/weather-letris.json` · `weather-letris-15-du-tonnerre` |
| **Why** | Thunder is *Il tonne* (already in the same deck) or *On entend le tonnerre*. *Il y a du tonnerre* is understandable and sounds translated. |
| **Fix** | Drop the `il y a` tile; keep `tonne` under `Il …`. |

#### P2 — other collection nits

| String | File / id | Why | Fix |
|---|---|---|---|
| `piano` in column DU → *faire du piano* | `faire-activites.json` · `faire-activites-10` | *Faire du piano* exists (lessons). Unmarked verb for playing is **`jouer du piano`**. | Teacher note, or a *jouer du* mini-row. Do not delete if the syllabus wants *faire + activity*. |
| `le hindi` + en “Hindi / Urdu” | `languages.json` · `languages-03-hindi` | *Le hindi* is fine (aspirate *h* in many dictionaries). The English gloss merges two languages. | Keep `le hindi`; add `l'ourdou` or drop “/ Urdu”. |
| `Corée` (🇰🇷) | `nationalities.json` · `nat-05-coree`; `countries-letris.json` · `countries-letris-05-coree` | Ambiguous; flag is South Korea. | `Corée du Sud` if the syllabus is ROK. |
| `x degrés` / `entre x et y degrés` | `weather-letris.json` · `-07`, `-08` | Placeholder letters on a learner card. | `28 degrés` / `entre 20 et 25 degrés`. |
| `midi` missing | `days.json` | Unit 0 pretest added *midi* (Dan, 28 Aug). SIO-004 description still says “3 moments”. The Flip It deck has only *matin / après-midi / soir*. | Add `midi` to the deck; update the SIO description count. |
| Alphabet Letris columns skip E, O, Q, U | `alphabet.json` / `alphabet-letris.json` | Collection items exist; Letris columns do not cover all 7 sound groups the SIO promises. | Extend columns (`euh`, `o`, `u`) or keep those letters Flip-It-only and say so. |

**Collections reviewed and clean** (no P0/P1 in the `fr` taught as correct):  
`consignes`, `tu-vous` (the 12 people are sound; *tes parents* as **plural** *vous* is right), `etre-etudiant`, `avoir-etats`, `professions` (deck itself — the lesson alt is the problem), `possessives`, `partitifs`, `aliments`, `transport`, `en-au-aux-a`, `lieux-letris`, `loin-lesson`, `directions-matching`, `negation-pas`, `quand-time`, `aller-destinations`, `aimer-activites`, `parce-que`, `pouvoir`, `envies-besoins`, `vouloir-inviter`, `objets-articles`, `stress-pronouns`, `matieres`, `numbers-*`, `demonstratifs`, `commerces`, `frequence`, `modaux-plans`, `modaux-avis`, `colors` (noun forms *le rouge* etc. are a valid A1 choice; collection title *De quelle couleur ?* is the right question).

---

### B. Pretests (U1–U4 + Unit 0)

#### P0 — `Enchanté !` keyed as correct when the speaker is Léa

| | |
|---|---|
| **Current** | Informal Q: give your name as `Moi, je m'appelle Léa.` then “You say:” → **`Enchanté !`** (only correct). Same pattern on the group tab. Formal tab: `Je m'appelle Léa Martin.` then **`Enchanté, madame.`** |
| **File / id** | `src/content/sios/unit0-questions.ts` · `SIO010_SITUATIONS` · keys `informal`, `formal`, `group` |
| **Why** | The scripted speaker is **Léa**. The keyed form is masculine. The atelier two doors away already has her say *Enchantée*. A learner who does the pretest then the role-play is taught both genders as “the” answer for the same person. |
| **Fix** | Key `Enchantée !` / `Enchantée, madame.` when the name just given is Léa. Keep `Enchanté` as a distractor or as the keyed form on a Marc variant. |

#### P0 — `C’est une médecin` accepted as a correct alternate

| | |
|---|---|
| **Current** | Bonus: en `She is a doctor.` → `Elle est médecin.` · **alt: `C'est une médecin.`** |
| **File / id** | `src/content/lessons/native/professions.tsx` · `bonus` (not a pretest JSON, but a keyed correct) |
| **Why** | *Médecin* is epicene. Presentation with article is **`C’est un médecin`** (the *un* does not become *une*). The same repo’s textgen (`textgen/unit1.ts`) already comments that it **keeps `C'est une médecin` out**. The lesson bonus lets it in. |
| **Fix** | Delete the alt. If an article form is wanted: `C'est un médecin.` |

#### P1 — `Il y a de l'orage prévu ce soir.`

| | |
|---|---|
| **Current** | `Il y a de l'orage prévu ce soir.` |
| **File / id** | `src/content/pretests/u3-l1-weather.json` · `08-de-l-orage` |
| **Why** | *Orage* is countable. *De l’orage prévu* is weather-bulletin calque. Natives say *Un orage est prévu ce soir* or *Il y a un orage prévu ce soir*. The collection already has the natural plural tile `des orages`. |
| **Fix** | Blank *un orage* / *Il y a un orage prévu ce soir.* |

#### P1 — elision gap after `l'` / `d'` on the card

| | |
|---|---|
| **Current** | e.g. `sentenceAfter`: `" hôpital."` with `answer`: `"à l'"` / `"de l'"` |
| **File / id** | `u2-sio026.json` · `u2-sio026-05`; `u3-sio033.json` · `03`, `04`; `u4-sio042.json` · water/oil items |
| **Why** | `fullSentence` / TTS are correct (`à l'hôpital`). The visible frame is `… [à l'] hôpital.` — a space after the apostrophe. A1 learners copy what they see. |
| **Fix** | `sentenceAfter: "hôpital."` (no leading space) when the answer already ends in `'`. |

#### P2 — pretest nits

| String | File / id | Why | Fix |
|---|---|---|---|
| `Pour rester en bonne santé, il faut manger équilibré.` | `u4-sio048-advice.json` · `-04`; also `futur-proche.gen.ts` | Advertising / PNNS register (*manger-bouger*). Grammatical in that register, not a classroom model. | `il faut manger de façon équilibrée` **or** `il faut manger des légumes` (already in the same pretest). |
| `J'étudie le génie.` | `u1-sio013.json` · `-12` | Incomplete without the branch (*génie civil*, *génie mécanique*). | Specify, or drop; `-13` already has *l’ingénierie*. |
| `Quels pays tu visites ?` | `u1-sio017.json` · `-09` | Oral OK. Written default is *Quels pays est-ce que tu visites ?* | Optional *est-ce que* twin. |
| Number/price hints inside the French line | `u4-sio045a-nombres.json` · all 6 | `(71 €)` is English/meta sitting in `sentenceAfter`. | Move to `contextLabel`. |
| Stage directions in the gap | `u4-sio047.json` · market items | `Le client : « … »` is chrome in the stem. `fullSentence` is clean. | Role in `contextLabel`; gap = spoken French only. |

**Pretests with no keyed-French problem:** U1 `011`–`012`, `014`–`016`, `018`–`019`; U2 `021`–`025`, `027`–`029`; U3 `034`–`039` (aside from the elision note); U4 `041`, `045`, `046`, `047-plans`, most of `047`. Distractors that are ungrammatical on purpose (`chefe`, `n'suis pas`, `à le`) are left alone — a learner could have produced them.

---

### C. SIOs (map chips, descriptions)

Learner-facing French on the map is the `fr` field. English `topic` / `canDo` is chrome.

#### P1 — colour chip is the wrong question

| | |
|---|---|
| **Current** | `C'est comment ?` |
| **File / id** | `src/content/sios/sios.json` · `SIO-005` |
| **Why** | *C’est comment ?* = “what’s it like?” The collection and the competence already know the real question: **`De quelle couleur ?`**. The pretest even uses *C’est comment* as a **wrong** option for price (`u3-sio034`). The map chip teaches the vague gloss the can-do then has to repair in parentheses (“How is it? (What color is it?)”). |
| **Fix** | `De quelle couleur ?` (matches `collections/colors.json` title). |

#### P1 — classroom chip is an anglicism

| | |
|---|---|
| **Current** | `Les instructions de classe` |
| **File / id** | `sios.json` · `SIO-008` |
| **Why** | French teachers say **`consignes`**. The collection is already titled `Les consignes de classe`. The map uses the English word with a French article. |
| **Fix** | `Les consignes de classe` **or** `On fait quoi ?` (the SIO’s own ask-back). |

#### P2 — other chips

| String | SIO | Why | Fix |
|---|---|---|---|
| `Tu (toi) ou vous ?` | SIO-002 | Mixes subject *tu* and stressed *toi* in one chip. The hunch about mixed EN/FR on **topics** is English-on-purpose; this chip is the actual muddle. | `Tu ou vous ?` |
| `Ça s'écrit comment ?` | SIO-003 | Natural spoken. Taught line is `Comment ça s'écrit ?` (alphabet subtitle, atelier, pretest). | Align on one order. |
| `Un dialogue simple` | SIO-010 | True and empty. Does not name the meeting. | `Première rencontre` (already the atelier title). |
| `Un ou des ?` | SIO-021 | The stop is *c’est un / ce sont des*. | `C'est un… ? Ce sont des… ?` |
| SIO-004 description “3 moments” | SIO-004 | Pretest now includes *midi*. | “4 moments” or list them. |
| SIO-006 description’s 18-noun list | SIO-006 | Does not match the Unit 0 pretest bank (*prénom, nom, monsieur, salle de classe…*). | One list, used twice. |

**Hunch, verified:** stop **topics** are English (`Introductions`, `Some nouns`, `Classroom instructions`). That is chrome. The **`fr` chips** are French except the two P1s above. No accidental English on the chip itself.

---

### D. Lessons, ateliers, games, skills

#### P1 — itinerary atelier is *tu*; directions stop is *vous*

| | |
|---|---|
| **Current** | `D'abord, tu prends la première rue à droite.` / `Ensuite, tu vas tout droit.` / `Puis, tu tournes à gauche à la banque.` / `Tu peux aussi prendre le bus numéro cinq.` |
| **File / id** | `src/content/ateliers.ts` · `SIO-040` |
| **Why** | SIO-036 competence: give directions with **`vous` + present**, no imperative. Memos and `le-chemin.gen.ts` model *vous prenez* / *vous tournez*. SIO-040’s own description quotes the *tu* lines, so the atelier is faithful to its spec — and the unit now trains **two registers for the same speech act** without saying so. A learner who just drilled *Vous prenez la première rue…* will “fail” the atelier by being consistent. |
| **Fix** | Either switch the atelier to *vous* (stranger / polite, matches SIO-036), **or** keep *tu* and put one line on the lesson: “to a friend you *tutoyez*; to a passer-by, *vous*.” Do not leave the contrast implicit. |

#### P1 — lessons repeat masculine-only *Enchanté*

Already listed under collections. Same strings in `salutations.tsx` (dice `correct`, Mémo band, bonus) and `ca-secrit.tsx` bonus. `atelier-rencontre.tsx` concept prose upgrades *Enchanté* to *Enchanté, madame* and still skips *Enchantée*.

#### P2 — atelier / lesson nits

| String | File | Why | Fix |
|---|---|---|---|
| `Désolé, je suis occupé.` | `rendezvous.tsx` REFUSALS + bonus | Masculine fixed. | Accept `Désolée… occupée` as alt (the invitations deck already writes `Désolé(e)`). |
| `Je bois du jus.` | `manger-boire.tsx` / `.gen.ts` | Fine colloquially; the food deck is *jus d’orange*. | Prefer `du jus d'orange` if this is the first drink card. |
| `Bon appétit !` after coffee + croissant + apple | `ateliers.ts` · SIO-050 | A bit theatrical. Not wrong. | Leave, or save *Bon appétit* for a real meal order. |
| `consommer` gloss “to consume” | `conjugaison.ts` | Conjugation is right; the verb is textbook-register for A1. | Swap for *acheter* / *prendre* if the list is trimmed. |

**Ateliers otherwise:** SIO-010 informal meeting is natural (*Et toi ?*, spelling aloud, gendered *Enchanté(e)*). SIO-020 country presentation is school-presentation register, grammatical. SIO-030 email is what a student would send. SIO-049 partitive *du poisson* is the right call (already documented in-file). SIO-050 restaurant *vous* is consistent.

**Conjugaison:** 66 paradigms checked. *s’appeler* cells bake in the object pronoun (`m’appelle`, `nous nous appelons`) by design. No wrong forms.

**Textgen:** Unit 0 agrees *Enchantée* with Léa. Unit 1 blocks `C’est une médecin`. Articles and partitives look generated from the same rules the decks teach.

**Chapters:** `Bienvenue en classe`, `Qui suis-je ?`, `Ma vie, mes envies`, `En ville`, `À table !` — all fine.

**Skills / games:** no `src/content/games/`. `hints.ts` is English. `devine-aliments.json` lexica match the food deck.

---

## 4. Cross-cutting themes (for Dan)

These are the same fault showing up in several files. Fix once, then sweep.

1. **Gender of the speaker is not a first-class fact.** Textgen and the SIO-010 atelier know Léa is feminine. The greetings deck, the salutations lesson, and the SIO-010 pretest do not. *Enchanté / Enchantée* and *Désolé / Désolée* will keep leaking until the keyed answer is allowed to be a pair.

2. **`s’appeler` is being asked to do introductions it cannot do.** The *nous* two-name card and the *Madame Martin* card are conjugation drills wearing the wrong costume. The address cards next to them are already correct.

3. **Two sources of truth for the same stop.** Letris still reads **root** `*-letris.json`. Flip It reads `collections/`. Salutations, weather, nationalities, alphabet — the French is close, the schema is not the same. A later edit that touches only `collections/` will not change the game.

4. **The colour question is settled in the collection and ignored on the map.** Chip: *C’est comment ?* Deck title: *De quelle couleur ?* Teach the deck’s question.

5. **Register splits need a sentence, not a surprise.** *Tu* itinerary vs *vous* directions; *Bonne nuit* as bedtime in the pretest vs anytime goodbye on the deck. Neither pair is “wrong French” until the learner meets both in one week.

---

## 5. Suggested fix order

1. **SIO-010 pretest *Enchanté* → *Enchantée* when the speaker is Léa** (P0, three tabs).  
2. **Drop `C’est une médecin` from the professions bonus alts** (P0).  
3. **Rewrite `sappeler-05` and `sappeler-06`** (P1, first week of the course).  
4. **Add `Enchantée` to the greetings deck + lesson bonus** (P1).  
5. **Retag `Bonne nuit`** (P1; pretest is already right).  
6. **SIO chips:** *De quelle couleur ?* and *Les consignes de classe* (P1, one line each).  
7. **SIO-040 *tu* vs SIO-036 *vous*:** pick one, or write the one-line contrast.  
8. **`classe` vs `salle de classe`** on the core-nouns card.  
9. **Weather *de l’orage prévu*** and the `l'` card spacing.  
10. **Days deck: add *midi*** so Unit 0 stops arguing with itself.

---

## 6. What this review is not

- Not a redesign of Flip It, pretests, or the map.  
- Not a rewrite of English can-dos or WHY text.  
- Not a claim that spoken *Comment tu t’appelles ?* is “wrong” — it is the form this course should teach.  
- Not a filter on ungrammatical **distractors**. Those stay (Dan, 1 Sep).

When a fix lands, the same three files tend to move together: the **collection**, the **pretest / Unit 0 bank**, and the **lesson bonus**. Changing one leaves the other two teaching last week’s French.
