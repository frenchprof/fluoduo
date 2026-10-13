# Units 0–4 re-sorted with the spiral rule

This file takes every row that `reconciled.md` left as **still over** (588) or **unclear** (175) and sorts it again with Dan's spiral rule and his decisions. `reconciled.md` is unchanged. Paths are under `src/`.

## The test applied to each row

- **SEEN** (allowed before its unit). The item appears as a whole phrase: in a text, a dialogue, a model answer, an example sentence, a persona's line, a distractor, or the prompt of a scored question. It is never explained, drilled or scored.
  - Dan's refinement for scored questions: an unknown word inside a question is fine. « Le week-end, je fais ___ ski. » → *du* is fine even before *week-end* is taught.
- **FOCUS too early.** The item is explained or practised before its unit: a lesson table or rule, a drill aimed at it, a deck or Letris item to learn, a ComposeIt chip, or a ConjugaZone table.
- **SCORED too early.** The correct answer **is** the item, or getting it right **depends on** understanding it. « Il est deux heures ___. » → *et demie*. Pre-tests, the Finale, G-Compris answers and the atelier line-match pre-tests all count as scored.
- **Dan's decisions:**
  1. matières are bonus content: labelled and unscored.
  2. pourquoi / parce que are bonus and recognise-only.
  3. notre/nos/leur/leurs and « mon amie » are bonus.
  4. SIO-029 is rebuilt from the book's lines; « je ne peux pas / on se retrouve » become bonus and the devoir table is removed.
  5. Numbers 0–20 are scored in Bienvenue.
  6. All 12 colours are visible in Bienvenue; only rouge and bleu are scored there, the other 10 are scored from Unit 1, and colour agreement is never scored.
  7. Enchanté(e) is Dan's own addition, focused and scored from Bienvenue.
  8. Greetings follow the spiral rule. They are over only when focused or scored before their own unit: Ça va = Unit 1; Bonne journée/soirée/nuit and À demain = Unit 2; À bientôt = Unit 3.

Four judgement calls I made:
- **ÉcouTexte is counted separately (42 rows).** Its texts are *heard*, but the learner types every word and each word is marked ([app/practice/ecoutexte/EcouTexte.tsx](app/practice/ecoutexte/EcouTexte.tsx): "answered in writing and marked"). These rows are not counted as cleared or as over until Dan says whether a dictation is scored.
- **Each atelier dialogue line is the correct answer** of the atelier line-match pre-test ([content/pretests/ateliers.gen.ts](content/pretests/ateliers.gen.ts)). So a later-unit chunk inside a dialogue line counts as scored.
- **I read the correct answer of every ambiguous item** in `finale.ts` and the pre-test JSON. Most scored rows failed only because of their prompt. For example, « — Quel âge as-tu ? — J'___ vingt ans. » has the answer *ai*, so it is seen-only.
- **A deck item counts as focus for the whole sentence it teaches.** Its *example* field and the situation text describing whom you are talking to count as seen.

## (a) The count per unit

These are rows from `reconciled.md`: every still-over row plus every unclear row.

| Unit | Rows | Seen-only (cleared) | Cleared by Dan's decisions | Focus too early | Scored too early | (of which both) | ÉcouTexte dictation (Dan to rule) | Still unclear | French errors |
|---|---|---|---|---|---|---|---|---|---|
| 0 Bienvenue | 111 | 25 | 13 | 24 | 28 | 2 | 8 | 15 | — |
| 1 | 132 | 49 | 8 | 35 | 19 | 4 | 7 | 18 | — |
| 2 | 179 | 45 | 36 | 44 | 16 | 6 | 11 | 33 | — |
| 3 | 229 | 56 | 1 | 106 | 36 | 9 | 10 | 29 | — |
| 4 | 112 | 32 | 0 | 31 | 17 | 7 | 6 | 31 | 2 |
| **Total** | **763** | **207** | **58** | **240** | **116** | **28** | **42** | **126** | **2** |

Rows with a real problem left: **328** (focus or scored or both). In `reconciled.md` there were 588 still-over rows plus 175 unclear rows.

**Seen-only, now fine (207 rows), by where they sit:**
- **166 rows:** an unknown word in a scored question's prompt, frame or distractor. Examples: « Il vient du Portugal : il est ___ » (answer a nationality); « Je fais du sport ___ … » with *week-end* in the frame; the Unit 4 *septante/nonante* distractors.
- **19 rows:** example sentences in lessons and Mémo cards. Examples: « Tu parles français ? » as a carrier sentence in the tu/vous lesson; « Il y a du café → pas de café » on the negation card.
- **11 rows:** ComposeIt persona lines and model texts. Examples: « Parle-moi du Canada ! », « Où est-ce ? », « Alors, c'était comment ? ».
- **6 rows:** deck situations and examples. Examples: « ta petite sœur » in the tu/vous deck; the colour deck's example nouns.
- **5 rows:** G-Compris reading texts and a transfer probe. Examples: « Nous partons à 8 heures », « Notre numéro… ».

**Cleared by Dan's decisions (58 rows)**, but 13 of them still need applying. These are scored items that must become unscored:
- matières: 3 (u1-sio013, the Finale SIO-013 items, the G-Compris « informatique » answer);
- pourquoi/parce que: 3 (u2-sio025, Finale SIO-025:1–6);
- notre/leur/« mon amie »: 5 (u2-sio022-05/-06/-08, Finale SIO-022:3–5);
- « je ne peux pas »: 2 (u2-sio029-09, Finale SIO-029:2/3/6).

The bonus lessons, decks and Mémo cards need a "bonus" label.

## (b) What is still a problem, by cause

F = focus too early, S = scored too early. Each count is in rows.

### Unit 0 — 50 rows, plus 8 in ÉcouTexte

| Cause | F / S | Files | Two examples → fix | Proposal |
|---|---|---|---|---|
| Greetings drilled or scored before their unit | 10 / 8 | content/sios/sios.json (SIO-009); content/collections/salutations.json + content/salutations.json; content/ateliers.ts (SIO-010 deck); content/sios/unit0-questions.ts; content/finale.ts; content/lessons/native/salutations.tsx; content/memos.tsx; games/compose/banks-production.tsx | « Bonne journée ! » is the correct answer at unit0-questions :789 (Unit 2) → keep it as a distractor or a dialogue line only. « Ça va ? » is a deck item to learn (Unit 1) → take it out of the deck, keep it in the dialogues. | MOVE to their units the deck items, lesson-table rows, ComposeIt chips and correct answers: Ça va, merci, de rien → U1; Bonne journée/soirée/nuit, À demain → U2; À bientôt → U3; s'il te plaît → U4. CUT Merci beaucoup and Bon week-end (in no unit) from the table and chips. |
| Unit 1–2 grammar drilled or scored | 4 / 7 | content/collections/consignes.json; content/lessons.ts (SIO-001 → être); content/lessons/native/on-fait-quoi.tsx; memos.tsx (article rule); finale.ts | Finale :170 « Tu ___ bien ? » → *vas* (aller, U2). Finale :177 « ___ est-ce ? » → *Qui* (out). | MOVE these Finale items to U1/U2. Unlink SIO-001 from être. MOVE « On fait quoi ? » to U2. CUT the article-rule paragraph. |
| après-midi, semaine, week-end drilled or scored | 4 / 3 | sios.json (SIO-004); content/collections/days.json + content/days-letris.json; unit0-questions.ts :671; finale.ts :377; content/lessons/native/quel-jour.tsx | « l'après-midi » is a deck item → « midi ». « c'est le ___ » → *week-end* → cut. | SIMPLIFY to matin / midi / soir; English column labels |
| Colours scored beyond rouge/bleu, and colour agreement | 0 / 4 | unit0-questions.ts :680–691; finale.ts :55, :175–176, :277–380 | 10 of the 12 colour questions have answers other than rouge/bleu → unscore them in Unit 0. « La porte … est verte » scores agreement → cut. | Apply decision 6 |
| Nouns from Units 1–2 as items to learn or answers | 3 / 1 | content/collections/core-nouns.json + content/core-nouns.json; unit0-questions.ts :695–716 | Tiles LIVRE, CAHIER, TABLEAU (U2) → move. « professeur » as an answer (U1) → move. | MOVE |
| Classroom language that is not a book instruction | 1 / 3 | unit0-questions.ts :627–632; finale.ts :181, :283–386; memos.tsx (consignes) | « ___-le à la page douze » → *ouvrez*. « ___ vos livres » → *fermez/rangez*. | CUT the items; CUT the "-ez = polite command" rule |
| Accent and gender rules | 2 / 1 | finale.ts :274, :376; content/lessons/native/ca-secrit.tsx, core-nouns.tsx | Inès "E accent grave" (in no unit) → cut. "-ité is always feminine" → cut. | CUT; MOVE the accent aigu items to U1 |
| A number above 20 scored | 0 / 1 | finale.ts :375 | « L'alphabet a ___ lettres » → *vingt-six* → « A, E, I, O, U, Y : six ___ » (voyelles) | SIMPLIFY |

### Unit 1 — 50 rows, plus 7 in ÉcouTexte

| Cause | F / S | Files | Two examples → fix | Proposal |
|---|---|---|---|---|
| Unit 2 grammar drilled | 12 / 3 | sios.json (SIO-012, SIO-015); content/ateliers.ts + content/lessons/native/atelier-pays.tsx; professions.tsx; moi-aussi.tsx; conjugaison-u1.tsx; negation.tsx (via lessons.ts); quel-prefere.tsx (+ .gen.ts); langues-pays.tsx; banks-production.tsx | The `quel-prefere` lesson drills mon/ma/mes and « Vous préférez quelles couleurs ? » → move the possessive half to U2, use « Vous connaissez quels pays ? ». The `professions` lesson teaches « Il est médecin vs C'est un médecin » → move to U2. | MOVE / unlink `negation` from SIO-014 |
| Unit 3–4 words drilled or scored | 8 / 5 | content/collections/avoir-etats.json; content/lessons/native/avoir-etats.tsx, nombres-echanges.gen.ts, revisions.tsx; ateliers.ts (lines 4, 6); finale.ts :393; pretests/u1-sio012.json; banks-production.tsx | « J'ai envie de… / J'ai besoin de… » are deck items (U3) → move. « Elle est ___ » → *boulangère* (U4 shops) → « photographe ». | MOVE / SIMPLIFY |
| Professions and nationalities not in the book | 5 / 2 | content/collections/professions.json, nationalities.json; pretests/u1-sio016.json; finale.ts :291–292; professions.tsx; nationalities.tsx | « Elle est ___ » → *grecque* → cut. Answers *pompier, dentiste* → « acteur, journaliste ». | CUT / SIMPLIFY |
| Language names learned with an article | 4 / 1 | sios.json (SIO-017); content/collections/languages.json; content/languages-letris.json; memos.tsx | Letris « Je parle le … » → « Je parle … ». The Mémo line "language = le + nationality" → cut. | SIMPLIFY |
| Stressed pronoun after a preposition (U7) | 2 / 3 | sios.json (SIO-011); pretests/u1-sio011.json; finale.ts :392; memos.tsx | « Je suis avec ___ » → *lui* → « C'est Marc ? Oui, c'est ___ » → *lui*. « Tu viens avec ___ ? » → cut. | SIMPLIFY / CUT |
| G-Compris answers that depend on telling the time or on *mes* | 1 / 3 | content/gcompris.ts (3 scenes); games/compose/banks.tsx | « le-panneau » q2 → *17 heures*. « mot-du-voisin » q5 depends on « mes deux filles ». | MOVE the 3 scenes to U2; CUT the À bientôt / À demain / Bonne journée chips |
| Country prepositions (U3) | 1 / 1 | finale.ts :206, :307, :409; content/lessons/native/langues-pays.tsx | « Le Portugal est ___ Europe » → *en*. The "prep" mode drills en/au/aux. | MOVE to U3 |
| Dates (né, mille, months) drilled | 2 / 0 | nombres-echanges.gen.ts, avoir-etats.gen.ts | The "naissance" round drills « Je suis née en deux mille cinq ». | CUT the drill (a seen « Je suis né(e)… » is fine) |
| Matières in G-Compris | 0 / 1 | gcompris.ts « nouvelle-étudiante » | q5 is answered from « Je n'aime pas le froid, mais j'adore la ville » (aimer, U2). | MOVE the scene to U2 |

### Unit 2 — 54 rows, plus 11 in ÉcouTexte

| Cause | F / S | Files | Two examples → fix | Proposal |
|---|---|---|---|---|
| Unit 3 places drilled | 9 / 1 | sios.json (SIO-026); content/collections/aller-destinations.json + content/aller-destinations.json; content/lessons/native/aller.tsx (+ .gen.ts); banks-production.tsx | Deck items « à l'école, à l'hôpital, à la gare » → « à l'opéra, à la piscine ». The `aller` drill uses « au parc » → « au musée ». | SIMPLIFY (these places are fine from U3) |
| Unit 3 grammar drilled or scored | 6 / 4 | content/ateliers.ts (SIO-030); content/lessons/native/atelier-email.tsx; gcompris.ts; banks.tsx; banks-production.tsx; content/lessonVerbs.ts | Atelier line « Bonne journée et à bientôt ! » is a pre-test answer → « …et à samedi ! ». The G-Compris WHY teaches « au / en + country » → drop the rule from the WHY. | SIMPLIFY |
| Frequency (U4) drilled or scored | 2 / 4 | sios.json (SIO-027); content/collections/quand-time.json; pretests/u2-sio027.json; finale.ts :99, :220, :424 | « Je fais du sport ___ les soirs » → *tous* → « …___ soir » → *le*. The deck's FRÉQUENCE column → move. | MOVE to U4 |
| pouvoir and pronominal verbs outside SIO-029 | 4 / 0 | banks-production.tsx (« On peut » chip); content/lessons/native/conjugaison-er.tsx (+ .gen.ts); negation.tsx | conjugaison-er shows a pouvoir column → cut. The negation flow says "me · te · se · y" → « m', t', s' (s'appeler) ». | CUT |
| Telling the time beyond the book | 4 / 2 | pretests/u2-sio027.json; gcompris.ts; content/lessons/native/quand.tsx | « Il est deux heures ___ » → *et demie* → *trente*. The `quand` lesson teaches *une heure* and *zéro heure* → *minuit*. | SIMPLIFY |
| Wishes not in the box; s'il te plaît | 5 / 2 | sios.json (SIO-030); content/collections/vouloir-inviter.json; ateliers.ts; banks.tsx; banks-production.tsx; atelier-email.tsx | « Bon anniversaire » → « Joyeux anniversaire ». The « s'il te plaît » chip (U4) → cut. | SIMPLIFY / CUT |
| Food, quantities and il y a drilled or scored | 4 / 2 | sios.json (SIO-028); content/collections/negation-pas.json, possessives.json; pretests/u2-sio021.json | « Sur la table, ___ une pomme » → *il y a* → « Dans mon sac, il y a ___ gomme » → *une*. Deck item « Il n'y a pas d'eau » → « Il ne fait pas d'athlétisme ». | SIMPLIFY |
| Other items learned too early (règle, piano, comprendre/apprendre) | 6 / 1 | content/collections/objets-articles.json, faire-activites.json; content/lessons/native/qu-est-ce-que-c-est.gen.ts, aimer.tsx; banks.tsx; lessonVerbs.ts | « une règle » → « une valise ». « du piano » → « de la danse ». | CUT / SIMPLIFY |
| Unit 7 forms drilled (avec nous, avec moi, chez moi) | 3 / 0 | vouloir-inviter.json; banks-production.tsx; aller.tsx (+ .gen.ts) | `aller` chips « chez moi, chez un ami » → cut. The « avec moi » chip → « avec ses amis ». | CUT |
| « parce que » as a chip to produce | 1 / 0 | banks-production.tsx :578 | This conflicts with decision 2 (recognise-only) → cut the chip. | CUT |

### Unit 3 — 133 rows, plus 10 in ÉcouTexte

| Cause | F / S | Files | Two examples → fix | Proposal |
|---|---|---|---|---|
| Weather words the book lacks | 23 / 5 | sios.json (SIO-031); content/collections/weather-letris.json + content/weather-letris.json; pretests/u3-l1-weather.json (recap table, items 04, 05); finale.ts :229, :329–330; memos.tsx; content/lessons/native/meteo.tsx | « Il fait ___ » → *mauvais / frais* → cut. « il va ___ ! » → *pleuvoir* → move to U4. | CUT (they may still appear in a forecast text) |
| Direction and distance phrases the book lacks | 23 / 2 | content/collections/directions-matching.json, loin-lesson.json, transport.json (+ Letris tiles); banks.tsx; banks-production.tsx; memos.tsx; content/lessons/native/ou-est.gen.ts, le-chemin.gen.ts, transport.gen.ts; finale.ts :449 | Deck « C'est au bout de la rue » → « C'est à droite ». Chips « un quart d'heure, environ » → « quinze minutes ». | CUT / SIMPLIFY |
| Places not in the book (pharmacie, mairie, église, aéroport…) | 17 / 4 | sios.json (SIO-033); content/collections/lieux-letris.json + content/lieux-letris.json; finale.ts :62, :65, :333; banks.tsx; banks-production.tsx; memos.tsx; content/lessons/native/prepositions-core.tsx, ou-est.gen.ts, le-chemin.gen.ts | « … c'est la ___ » → *pharmacie* → « la poste ». Tiles ÉGLISE, AÉROPORT → cut. | SIMPLIFY to the book's places (gare, banque, poste, hôpital… are now in) |
| pouvoir as a table, devoir, pronominal verbs | 15 / 7 | sios.json (SIO-037); content/collections/pouvoir.json; pretests/u3-sio037.json; finale.ts :240–241, :341–342, :443–448; content/lessons/native/pouvoir.tsx (+ .gen.ts), modaux.tsx; content/conjugaison.ts | « nous ___ entrer ? » → *pouvons*. Deck « Tu peux te garer là » → cut. | Whole-goal question SIO-037 |
| Unit 4 content drilled or scored (il faut, beaucoup de, partitive, futur proche) | 11 / 6 | sios.json (SIO-036); content/collections/question-words.json, envies-besoins.json; pretests/u3-l1-weather.json, u3-sio036.json, u3-sio038.json; finale.ts :239; content/lessons/native/ou-est.tsx, le-chemin.tsx, modaux.tsx, envies-besoins.tsx, revisions.tsx | « Au feu rouge, il faut ___ à gauche » → *tourner* → « vous ___ à gauche » → *tournez*. « Il y a beaucoup ___ nuages » → *de* → move to U4. | SIMPLIFY / MOVE to U4 |
| Countries not in the book's list | 8 / 2 | content/collections/en-au-aux-a.json (+ tiles); pretests/u3-l2-city-preps.json; finale.ts :75–77; banks-production.tsx; content/lessons/native/prepositions.tsx, prepositions-core.tsx | Deck « au Brésil » → « au Mexique ». Answers *Indonésie, Malaisie* → « le Japon ». | Depends on the country-list question |
| Question words from Unit 6, and inversion | 5 / 5 | sios.json (SIO-034); content/collections/question-words.json; pretests/u3-sio034.json; finale.ts :237, :439; content/lessons/native/mots-interrogatifs.tsx | « ___ est-ce que tu habites ? » → *où*. The lesson teaches « Quel âge as-tu ? » → « Tu as quel âge ? ». | SIMPLIFY |
| Other later forms (y with negation, notre, 10 verbs with no box, a revision mix) | 4 / 5 | pretests/u3-sio038.json; finale.ts :95, :443; banks-production.tsx; content/lessons/native/revisions.tsx; content/lessonVerbs.ts | « Je n'___ vais pas » → *y* in a negation → cut. ConjugaZone *revenir, savoir, arrêter* → keep venir, chercher, prendre. | CUT |

### Unit 4 — 41 rows, plus 6 in ÉcouTexte and 2 French errors

| Cause | F / S | Files | Two examples → fix | Proposal |
|---|---|---|---|---|
| devoir, and pouvoir beyond *tu peux / vous pouvez* (SIO-048) | 11 / 9 | sios.json (SIO-048); content/collections/modaux-avis.json; content/modaux-letris.json; pretests/u4-sio048-advice.json; finale.ts :264, :365, :467; content/conjugaison.ts; content/lessonVerbs.ts; content/lessons/native/conseils.tsx, modaux.tsx | « tu ___ dormir » → *dois* → « il ___ dormir » → *faut*. « Elle ___ cuisiner » → *peut* → « Tu ___ cuisiner » → *peux*. | SIMPLIFY → il faut / tu peux / vous pouvez |
| Other (the pronoun en, y with other verbs, the passé composé, Merci beaucoup, ne… rien, pharmacie, de temps en temps, the 56-food list) | 7 / 2 | content/collections/commerces.json; content/devine-aliments.json; memos.tsx; banks.tsx; banks-production.tsx; finale.ts :255; pretests/u4-sio045.json | « … à la ___ » → *pharmacie* → *fromagerie*. Chip « J'y retourne » → cut. | CUT / SIMPLIFY |
| Quantity words the book lacks (trop de, assez de, une tranche, une douzaine, il me faut) | 5 / 3 | content/collections/partitifs.json; pretests/u4-sio047.json; finale.ts :127, :130; content/lessons/native/au-marche.tsx; banks.tsx | « Il me faut ___ jambon » → *une tranche de* → « un morceau de fromage ». « Tu mets trop ___ sel » → « beaucoup ___ sel ». | SIMPLIFY (morceau, paquet, botte, barquette are in) |
| le goûter | 4 / 1 | sios.json (SIO-041); content/collections/aliments.json; content/lessons/native/aliments.tsx; banks.tsx | The deck item « le goûter » and the « Au goûter » chip. | Whole-goal question SIO-041 |
| The definite-vs-partitive contrast | 2 / 1 | sios.json (SIO-042); content/collections/partitifs.json | The deck is titled « Défini ou partitif ? » with « J'aime le pain → Je mange du pain ». | Whole-goal question SIO-042 |
| trop + adjective | 2 / 1 | sios.json (SIO-049); banks-production.tsx | Chips « trop cher, trop salé » → « un peu cher ». | SIMPLIFY |
| **French errors (fix in any case)** | — | content/collections/modaux-plans.json (item 09); content/lessons/native/au-marche.gen.ts | « Je ne vais pas faire du sport » → « …de sport ». « deux de baguettes » is served as the right answer → « deux baguettes ». | Fix |

## (c) Whole-goal questions that still need Dan

The spiral rule and Dan's decisions settle 17 of the 34 earlier questions. The other 17 merge into the 15 goal questions below (SIO-017 joins SIO-015/016, SIO-040 joins SIO-030). For the 17 settled goals the fix is now mechanical: SIO-001, -004, -005, -006, -007, -009, -013, -014, -019, -022, -025, -026, -027, -028, -029, -044 and -048. Stop drilling or scoring the item before its unit, and let it appear as a seen chunk.

Still open:

1. **ÉcouTexte (42 rows):** in a dictation the learner types every word and each word is marked. Does that count as scored?
2. **SIO-002:** the book treats tu/vous as culture only. May the stop still score picking tu or vous in 12 situations?
3. **SIO-003:** keep the "7 vowel-sound groups" and spelling "E accent aigu" in Unit 0, though the book has neither?
4. **SIO-008:** « Notez ! » is not one of the book's classroom instructions. Keep it as your own addition, like Enchanté?
5. **SIO-010:** keep the "talking to a whole group" situation (« Bonjour à tous ! », « Salut tout le monde ! »), which the book never shows?
6. **SIO-011:** keep « moi aussi / moi non plus » as Unit 1 material, though the book does not show them?
7. **SIO-012:** may the professions deck teach the feminine forms (joueuse, chanteuse, serveuse) as word pairs, without a rule?
8. **SIO-015/016/017:** keep the Singapore-relevant countries, nationalities and languages the book lacks (Singapour, Malaisie, tamoul, mandarin…), or switch to the book's list (Liban, Sénégal, luxembourgeois…)?
9. **SIO-020:** saying where a country is needs « en Europe », which is Unit 3. Stop marking "location", or keep it with « en Europe » as a seen phrase?
10. **SIO-030 and SIO-040:** are « d'abord, ensuite, puis, enfin » allowed? Both stops are marked on them, and the book's scanned pages never show them.
11. **SIO-034:** teach « quand », « si » (answering a negative question) and « n'est-ce pas ? » in Unit 3? The book's scanned pages show none of them.
12. **SIO-036:** teach « traverser »? It is in the guide's model answer only.
13. **SIO-037:** move « pouvoir » to Unit 6, or keep only « je peux, tu peux, on peut, vous pouvez » as bonus phrases, as you did for SIO-029?
14. **SIO-041:** is « le goûter » your own addition, like Enchanté, or should the stop have the book's three meals?
15. **SIO-042:** the stop's headline is the contrast « J'aime le pain / Je mange du pain », which the book never teaches. Keep it as your addition, or drill only « du / de la » and « pas de »?
16. **SIO-049:** keep « Je recommande » and « Le service est lent » in the restaurant review, though they are not in the guide's word list?

There is also one rule-level question, behind 44 of the unclear rows: may everyday words the book does not list be **taught or scored** (for example père/mère, crayon, judo, riz/frites), or only **seen**?

## (d) Still unclear — 126 rows

| Group | Rows | Example |
|---|---|---|
| Everyday words outside the book's lists, in a deck, drill or answer | 44 | père, frère, oncle · crayon, passeport · judo, escalade · riz, frites, sushis · librairie, monnaie |
| Small grammar points and frames the ceilings never mention, in focus or as an answer | 33 | il y a du soleil / de la pluie · quand · si, n'est-ce pas · -euse feminines · « Il est douze heures » · un verre de · il faut + noun |
| Sequencing connectors | 12 | d'abord, ensuite, puis, enfin (SIO-030, SIO-040) |
| Alphabet and tu/vous teaching choices in Unit 0 | 9 | 7 vowel-sound groups · accent aigu · « Notez ! » · tu/vous situations |
| Social phrases not in the book, as items or chips | 8 | Coucou, À plus · Bonjour à tous · Ça me convient · Bises |
| Restaurant-review words | 6 | je recommande · lent · *je trouve que* (SIO-049) |
| Countries, nationalities and languages beyond the book's lists | 5 | the 185-country Letris · tamoul, mandarin as answers |
| Verbs with no box in ConjugaZone | 4 | utiliser, porter, dormir, vendre, mettre, voir |
| Guide-only items that the rulings do not name | 4 | traverser (3) · régulièrement (1) |
| "Location" in SIO-020 | 1 | « en Europe » in the model answer |
